import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
print("API KEY:", os.getenv("GEMINI_API_KEY")[:10] if os.getenv("GEMINI_API_KEY") else "None")

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

try:
    print("Available GenAI Content Models:")
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(m.name)
except Exception as e:
    print("Gemini Error:", str(e))
