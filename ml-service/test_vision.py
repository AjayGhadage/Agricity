import os
import base64
from groq import Groq
from dotenv import load_dotenv

load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

try:
    # create dummy 1x1 black jpeg
    dummy_img_b64 = "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAGBAQABAAAA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQAAPwA="
    
    print("Sending to Groq Vision...")
    vision_res = client.chat.completions.create(
        model="llama-3.2-11b-vision-instruct",
        messages=[{
            "role": "user",
            "content": [
                {"type": "text", "text": "Is this a picture of a plant or a leaf? Answer ONLY with YES or NO."},
                {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{dummy_img_b64}"}}
            ]
        }],
        temperature=0.1,
        max_tokens=10
    )
    print("Success:")
    print(vision_res.choices[0].message.content)
except Exception as e:
    print("Groq Vision Error:")
    print(str(e))
