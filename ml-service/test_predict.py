import requests
from PIL import Image
import io

img = Image.new('RGB', (224, 224), color = 'red')
img_byte_arr = io.BytesIO()
img.save(img_byte_arr, format='JPEG')
img_byte_arr = img_byte_arr.getvalue()

try:
    response = requests.post(
        "http://127.0.0.1:8001/predict-disease",
        files={"file": ("test.jpg", img_byte_arr, "image/jpeg")}
    )
    print("Status Code:", response.status_code)
    print("Response JSON:", response.text)
except Exception as e:
    print("Request failed:", e)
