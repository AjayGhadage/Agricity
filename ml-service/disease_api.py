from fastapi import FastAPI, File, UploadFile
import numpy as np
import tensorflow as tf
from PIL import Image
import io
import os

from disease_labels import disease_labels
from disease_info import disease_info
from groq import Groq
from dotenv import load_dotenv
load_dotenv()

app = FastAPI()

# 🔐 Use ENV variable (IMPORTANT)
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# ============================
# 📦 LOAD MODEL
# ============================
model = tf.keras.models.load_model("plant_disease_model.h5")

# ============================
# 🏠 ROOT
# ============================
@app.get("/")
def home():
    return {"message": "Disease API Running 🚀"}

# ============================
# 🖼️ PREPROCESS
# ============================
def preprocess_image(image):
    image = image.resize((224, 224))
    image = np.array(image) / 255.0
    image = np.expand_dims(image, axis=0)
    return image

# ============================
# 🤖 AI ADVICE
# ============================
def generate_advice(disease_name):
    try:
        prompt = f"""
        A farmer's plant has the disease: {disease_name}.

        Explain simply:
        - What it is
        - Why it happens
        - How to treat
        - Prevention

        Keep it short and practical.
        """

        response = client.chat.completions.create(
            model="llama-3.1-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3
        )

        return response.choices[0].message.content

    except:
        return None  # fallback if API fails

# ============================
# 🌿 PREDICT
# ============================
@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    try:
        # 📥 Read image
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")

        # 🔄 Preprocess
        processed = preprocess_image(image)

        # 🤖 Predict
        predictions = model.predict(processed)[0]

        predicted_index = int(np.argmax(predictions))
        confidence = float(np.max(predictions))

        print("Index:", predicted_index)

        # ============================
        # 🏷️ Disease Mapping
        # ============================
        if predicted_index < len(disease_labels):
            predicted_label = disease_labels[predicted_index]
        else:
            predicted_label = f"Unknown_Class_{predicted_index}"

        # ============================
        # 🧠 Advice Logic
        # ============================

        # 1️⃣ Static advice
        static_advice = disease_info.get(predicted_label)

        # 2️⃣ AI advice (only if confident)
        ai_advice = None
        if confidence > 0.6:
            ai_advice = generate_advice(predicted_label)

        # 3️⃣ Final advice selection
        final_advice = (
            ai_advice
            if ai_advice
            else static_advice
            if static_advice
            else "No advice available. Please consult an expert."
        )

        # ============================
        # 🔝 Top 3 Predictions
        # ============================
        top_indices = predictions.argsort()[-3:][::-1]

        top_results = []
        for i in top_indices:
            label = (
                disease_labels[i]
                if i < len(disease_labels)
                else f"Class_{i}"
            )
            top_results.append({
                "disease": label,
                "confidence": round(float(predictions[i] * 100), 2)
            })

        # ============================
        # 📦 RESPONSE
        # ============================
        return {
            "disease": predicted_label,
            "confidence": round(confidence * 100, 2),
            "advice": final_advice,
            "top_predictions": top_results
        }

    except Exception as e:
        return {"error": str(e)}