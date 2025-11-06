import os
import requests
from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse

router = APIRouter()


@router.get("/voice-agent-keys")
def get_voice_agent_keys():
    vapi_public_key = os.getenv("VAPI_PUBLIC_KEY")
    vapi_private_key = os.getenv("VAPI_PRIVATE_KEY")

    if not vapi_public_key or not vapi_private_key:
        return JSONResponse(status_code=404, content={"error": "VAPI keys not configured"})
    return JSONResponse(content={
        "vapi_public_key": vapi_public_key,
        "vapi_private_key": vapi_private_key
    })


@router.post("/make_call")
def make_call(customer_number: str, message: str):
    try:
        VAPI_ASSISTANT_ID = os.getenv("VAPI_ASSISTANT_ID")
        VAPI_ASSISTANT_NAME = os.getenv("VAPI_ASSISTANT_NAME")
        VAPI_PRIVATE_KEY = os.getenv("VAPI_PRIVATE_KEY")
        twilio_account_sid = os.getenv("TWILIO_ACCOUNT_SID")
        twilio_auth_token = os.getenv("TWILIO_AUTH_TOKEN")
        twilio_phone_number = os.getenv("TWILIO_PHONE_NUMBER")

        if not VAPI_PRIVATE_KEY:
            raise HTTPException(status_code=500, detail="Missing VAPI_PRIVATE_KEY")

        payload = {
            "assistantId": VAPI_ASSISTANT_ID,
            "name": VAPI_ASSISTANT_NAME,
            "assistant": {
                "transcriber": {
                    "provider": os.getenv("VAPI_TRANSCRIBER_PROVIDER")
                },
                "model": {
                    "provider": os.getenv("VAPI_MODEL_PROVIDER"),
                    "model": os.getenv("VAPI_MODEL_NAME"),
                    "systemPrompt": os.getenv("VAPI_SYSTEM_PROMPT")
                },
                "firstMessage": message,
                "endCallFunctionEnabled": True,
                "endCallMessage": "Thankyou, bye"
            },
            "phoneNumber": {
                "twilioAccountSid": twilio_account_sid,
                "twilioAuthToken": twilio_auth_token,
                "twilioPhoneNumber": twilio_phone_number,
            },
            "customer": {
                "number": customer_number
            },
        }

        headers = {
            "Authorization": f"Bearer {VAPI_PRIVATE_KEY}",  # VAPI Bearer token
            "Content-Type": "application/json"
        }

        response = requests.post("https://api.vapi.ai/call", json=payload, headers=headers)
        response.raise_for_status()

        data = response.json()
        session_id = data.get("id")

        if not session_id:
            raise HTTPException(status_code=500, detail="Missing 'id' in Vapi response")

        print(f"Call initiated successfully. Session ID: {session_id}")
        return {"status": True, "session_id": session_id, "message": "Call initiated successfully"}

    except requests.exceptions.RequestException as e:
        print(f"Error making call: {e}")
        return {"status": False, "error": str(e)}


