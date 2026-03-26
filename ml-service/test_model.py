import tensorflow as tf
print("Imported tensorflow")
try:
    model = tf.keras.models.load_model("plant_disease_model.h5")
    print("Model loaded successfully")
except Exception as e:
    print(f"Error loading model: {e}")
