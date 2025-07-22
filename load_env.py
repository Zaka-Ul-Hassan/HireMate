# load_env.py

from dotenv import load_dotenv
import os

load_dotenv()
cohere_api_key = os.getenv("COHERE_API_KEY")