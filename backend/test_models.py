import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

for model in genai.list_models():
    methods = getattr(model, "supported_generation_methods", [])
    print(model.name, methods)