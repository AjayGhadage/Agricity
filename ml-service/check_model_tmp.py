import pickle
try:
    with open("plant_disease_model.pkl", "rb") as f:
        model = pickle.load(f)
    print(f"MODEL_TYPE:{type(model)}")
except Exception as e:
    print(f"ERROR:{e}")
