import joblib
try:
    model = joblib.load("plant_disease_model.pkl")
    print(f"MODEL_TYPE_JOBLIB:{type(model)}")
except Exception as e:
    print(f"ERROR_JOBLIB:{e}")
