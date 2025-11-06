# load_env.py

from dotenv import load_dotenv
import os

load_dotenv()
cohere_api_key = os.getenv("COHERE_API_KEY")

google_search_api_key = os.getenv("GOOGLE_SEARCH_API_KEY")
google_search_cse_id = os.getenv("GOOGLE_SEARCH_CSE_ID")

vapi_public_key = os.getenv("VAPI_PUBLIC_KEY")
vapi_private_key = os.getenv("VAPI_PRIVATE_KEY")

print(cohere_api_key)
print(google_search_api_key)
print(google_search_cse_id)
print(vapi_public_key)
print(vapi_private_key)



# .env

# COHERE_API_KEY = TPYZyygnpLZEOCnZHrPhYgBv2ATu15qrg58gpkDX

# GOOGLE_SEARCH_API_KEY = AIzaSyD6AiYMzsqDEqfO-SJXHG2EMtePoxGaVXE
# GOOGLE_SEARCH_CSE_ID = b4e1a840bdf5746ee

# VAPI_PUBLIC_KEY = a486bd3f-70f4-46fd-8ebd-182fc56b5b50
# VAPI_PRIVATE_KEY = 326af1df-ebc3-4cea-bea7-e6d575d5cdd7
# VAPI_ASSISTANT_ID = 4dfef0b2-5fa8-4ad2-82d3-200d7e26f0a4
# VAPI_ASSISTANT_NAME = General Assistant

# # TWILIO_ACCOUNT_SID = ACf36fd78e502b0689e181a0c5a595d1d4
# # TWILIO_AUTH_TOKEN = 51419a168782cbe13bbc51ccff9b6f2c
# # TWILIO_PHONE_NUMBER = +12175831747

# TWILIO_ACCOUNT_SID = AC6ee47111587de096aec8ec056422ab72
# TWILIO_AUTH_TOKEN = ec7653cab2dc396b3e2190fb394cdc15
# TWILIO_PHONE_NUMBER = +12175133920

# VAPI_TRANSCRIBER_PROVIDER=deepgram
# VAPI_MODEL_PROVIDER = openai
# VAPI_MODEL_NAME = gpt-4o-mini
# VAPI_SYSTEM_PROMPT = You are a helpful AI assistant.