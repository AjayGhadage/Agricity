# ============================
# 🚀 IMPORTS
# ============================
from fastapi import FastAPI, File, UploadFile
from pydantic import BaseModel
import numpy as np
import tensorflow as tf
from PIL import Image
import pickle
import io
import os
from datetime import datetime
from groq import Groq
from serpapi import GoogleSearch
import re
from dotenv import load_dotenv
load_dotenv()

from disease_labels import disease_labels
from disease_info import disease_info

# ============================
# 🚀 INIT APP
# ============================
app = FastAPI()

# ============================
# 📦 LOAD MODELS
# ============================

# Crop model
crop_model = pickle.load(open("model.pkl", "rb"))

# Disease model
disease_model = tf.keras.models.load_model("plant_disease_model.h5")

# Groq client
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# ============================
# 📥 INPUT SCHEMA (CROP)
# ============================
class CropInput(BaseModel):
    nitrogen: int
    phosphorus: int
    potassium: int
    temperature: float
    humidity: float
    ph: float
    rainfall: float

# ============================
# 🌦️ SEASON LOGIC
# ============================
def get_season(month):
    if month in [12, 1, 2]:
        return 0
    elif month in [3, 4, 5]:
        return 1
    elif month in [6, 7, 8, 9]:
        return 2
    else:
        return 3

season_map = {
    0: "Winter",
    1: "Summer",
    2: "Monsoon",
    3: "Autumn"
}

# ============================
# 🏠 ROOT
# ============================
@app.get("/")
def home():
    return {"message": "Agri AI API Running 🚀"}

# ============================
# 🌾 CROP PREDICTION
# ============================
@app.post("/predict-crop")
def predict_crop(data: CropInput):
    try:
        month = datetime.now().month
        season = get_season(month)

        features = [
            data.nitrogen,
            data.phosphorus,
            data.potassium,
            data.temperature,
            data.humidity,
            data.ph,
            data.rainfall,
            season
        ]

        input_data = np.array([features])

        prediction = crop_model.predict(input_data)[0]

        return {
            "recommended_crop": str(prediction),
            "season_used": season_map[season],
            "input_features": data.dict()
        }

    except Exception as e:
        return {"error": str(e)}

# ============================
# 🖼️ IMAGE PREPROCESS
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
        - Treatment
        - Prevention
        """

        response = client.chat.completions.create(
            model="llama-3.1-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3
        )

        return response.choices[0].message.content

    except:
        return None

# ============================
# 🌿 DISEASE PREDICTION
# ============================
@app.post("/predict-disease")
async def predict_disease(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")

        processed = preprocess_image(image)

        predictions = disease_model.predict(processed)[0]

        predicted_index = int(np.argmax(predictions))
        confidence = float(np.max(predictions))

        # Label mapping
        if predicted_index < len(disease_labels):
            predicted_label = disease_labels[predicted_index]
        else:
            predicted_label = f"Unknown_Class_{predicted_index}"

        # Advice logic
        static_advice = disease_info.get(predicted_label)
        ai_advice = generate_advice(predicted_label) if confidence > 0.6 else None

        final_advice = ai_advice or static_advice or "Consult expert."

        # Top 3
        top_indices = predictions.argsort()[-3:][::-1]
        top_results = [
            {
                "disease": disease_labels[i] if i < len(disease_labels) else f"Class_{i}",
                "confidence": round(float(predictions[i] * 100), 2)
            }
            for i in top_indices
        ]

        return {
            "disease": predicted_label.replace("___", " - "),
            "confidence": round(confidence * 100, 2),
            "advice": final_advice,
            "top_predictions": top_results
        }

    except Exception as e:
        return {"error": str(e)}

# ============================
# 💰 PRICE SCRAPER
# ============================
def extract_price(text):
    prices = []

    quintal = re.findall(r'₹\s?(\d{3,5})\s?per quintal', text, re.IGNORECASE)
    prices.extend([int(p) for p in quintal])

    kg = re.findall(r'₹\s?(\d{2,3})\s?per kg', text, re.IGNORECASE)
    prices.extend([int(p) * 100 for p in kg])

    raw = re.findall(r'₹\s?(\d{3,5})', text)
    prices.extend([int(p) for p in raw if 1000 <= int(p) <= 10000])

    return list(set(prices))

@app.get("/scrape-price")
def scrape_news(crop: str, location: str):
    try:
        query = f"{crop} mandi price {location}"

        params = {
            "engine": "google",
            "q": query,
            "api_key": os.getenv("SERP_API_KEY")
        }

        search = GoogleSearch(params)
        results = search.get_dict()

        prices = []

        if "organic_results" in results:
            for item in results["organic_results"]:
                prices.extend(extract_price(item.get("snippet", "")))

        if "answer_box" in results:
            prices.extend(extract_price(str(results["answer_box"])))

        return {
            "crop": crop,
            "location": location,
            "prices": prices
        }

    except Exception as e:
        return {"error": str(e)}