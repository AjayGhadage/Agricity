from fastapi import FastAPI
from pydantic import BaseModel
import pickle
import numpy as np
from datetime import datetime

# ============================
# 🚀 INIT APP
# ============================
app = FastAPI()

# ============================
# 📦 LOAD MODEL
# ============================
model = pickle.load(open("model.pkl", "rb"))

# ============================
# 📥 INPUT SCHEMA
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
        return 0  # Winter
    elif month in [3, 4, 5]:
        return 1  # Summer
    elif month in [6, 7, 8, 9]:
        return 2  # Monsoon
    else:
        return 3  # Autumn

season_map = {
    0: "Winter",
    1: "Summer",
    2: "Monsoon",
    3: "Autumn"
}

# ============================
# 🏠 ROOT ROUTE
# ============================
@app.get("/")
def home():
    return {"message": "Crop API Running 🚀"}

# ============================
# 🌾 PREDICT ROUTE
# ============================
@app.post("/predict-crop")
def predict_crop(data: CropInput):
    try:
        # 🔥 Step 1: Calculate season
        month = datetime.now().month
        season = get_season(month)

        # 🔥 Step 2: Prepare features (8 features)
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

        # 🔥 Step 3: Convert to numpy
        input_data = np.array([features])

        # 🔥 Step 4: Predict
        prediction = model.predict(input_data)[0]

        # 🔥 Step 5: Return response
        return {
            "recommended_crop": str(prediction),
            "season_used": season_map[season],
            "input_features": {
                "nitrogen": data.nitrogen,
                "phosphorus": data.phosphorus,
                "potassium": data.potassium,
                "temperature": data.temperature,
                "humidity": data.humidity,
                "ph": data.ph,
                "rainfall": data.rainfall
            }
        }

    except Exception as e:
        return {
            "error": str(e)
        }