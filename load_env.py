# 1. Remove any real secrets from your code
#    Example: replace them with environment variables.
# In load_env.py, do this:
import os

TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
