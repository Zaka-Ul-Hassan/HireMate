# load_env.py

from dotenv import load_dotenv
import os

load_dotenv()
cohere_api_key = os.getenv("COHERE_API_KEY")

google_search_api_key = os.getenv("GOOGLE_SEARCH_API_KEY")
google_search_cse_id = os.getenv("GOOGLE_SEARCH_CSE_ID")

print(cohere_api_key)
print(google_search_api_key)
print(google_search_cse_id)