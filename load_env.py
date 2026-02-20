# load_env.py

from dotenv import load_dotenv
import os

load_dotenv()

# Database settings
DB_SERVER = os.getenv("DB_SERVER")
DB_NAME = os.getenv("DB_NAME")
DB_DRIVER = os.getenv("DB_DRIVER")
DB_TRUSTED_CONNECTION = os.getenv("DB_TRUSTED_CONNECTION")

# Cohere API Key
cohere_api_key = os.getenv("COHERE_API_KEY")

# Google Search API Key and CSE ID
google_search_api_key = os.getenv("GOOGLE_SEARCH_API_KEY")
google_search_cse_id = os.getenv("GOOGLE_SEARCH_CSE_ID")

# VAPI
vapi_public_api_key = os.getenv("VAPI_PUBLIC_KEY")
vapi_private_api_key = os.getenv("VAPI_PRIVATE_KEY")
vapi_assistant_api_id = os.getenv("VAPI_ASSISTANT_ID")
vapi_assistant_api_name = os.getenv("VAPI_ASSISTANT_NAME")

# Twilio
twilio_sid = os.getenv("TWILIO_ACCOUNT_SID")
twilio_token = os.getenv("TWILIO_AUTH_TOKEN")
twilio_number = os.getenv("TWILIO_PHONE_NUMBER")

# Model / Transcriber
transcriber_provider = os.getenv("VAPI_TRANSCRIBER_PROVIDER")
model_provider = os.getenv("VAPI_MODEL_PROVIDER")
model_name = os.getenv("VAPI_MODEL_NAME")
system_prompt = os.getenv("VAPI_SYSTEM_PROMPT")

# LinkedIn OAuth
client_id = os.getenv("LINKEDIN_CLIENT_ID")
client_secret = os.getenv("LINKEDIN_CLIENT_SECRET")
redirect_uri = os.getenv("LINKEDIN_REDIRECT_URI")
scope = os.getenv("LINKEDIN_SCOPES", "openid profile")

# Gmail Configuration Settings
SMTP_SERVER = os.getenv("SMTP_SERVER")
SMTP_PORT = os.getenv("SMTP_PORT")
SMTP_EMAIL = os.getenv("SMTP_EMAIL")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")

# Qdrant Configuration Settings
QDRANT_CLUSTER_URL = os.getenv("QDRANT_CLUSTER_URL")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")


# Encryption Key
ENCRYPTION_KEY = os.getenv("ENCRYPTION_KEY")

# Frontend URL
FRONTEND_BASE_URL = os.getenv("FRONTEND_BASE_URL")

# Super Admin Credentials
FIRSTNAME = os.getenv("FIRSTNAME")
LASTNAME = os.getenv("LASTNAME")
EMAIL = os.getenv("EMAIL")
PASSWORD = os.getenv("PASSWORD")
ROLE = os.getenv("ROLE")
PHONE = os.getenv("PHONE")

# JWT settings
JWT_SECRET = os.getenv("JWT_SECRET")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM")
JWT_EXPIRATION = int(os.getenv("JWT_EXPIRATION_MINUTES"))

# Forgot Password
RESET_TOKEN_EXPIRE_MINUTES = os.getenv("RESET_TOKEN_EXPIRE_MINUTES")

# SendGrid API Key
SENDGRID_API_KEY=os.getenv("SENDGRID_API_KEY")