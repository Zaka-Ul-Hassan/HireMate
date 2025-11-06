import os
import requests
from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse

import load_env

router = APIRouter()

loader = load_env()


@router.get("/voice-agent-keys")
def get_voice_agent_keys():
    vapi_public_key = loader.vapi_public_key
    vapi_private_key = loader.vapi_private_key

    if not vapi_public_key or not vapi_private_key:
        return JSONResponse(status_code=404, content={"error": "VAPI keys not configured"})
    return JSONResponse(content={
        "vapi_public_key": vapi_public_key,
        "vapi_private_key": vapi_private_key
    })


@router.post("/make_call")
def make_call(customer_number: str, message: str):
    try:
        VAPI_ASSISTANT_ID = loader.vapi_assistant_id
        VAPI_ASSISTANT_NAME = loader.vapi_assistant_name
        VAPI_PRIVATE_KEY = loader.vapi_private_key
        twilio_account_sid = loader.twilio_account_sid
        twilio_auth_token = loader.twilio_auth_token
        twilio_phone_number = loader.twilio_phone_number

        if not VAPI_PRIVATE_KEY:
            raise HTTPException(status_code=500, detail="Missing VAPI_PRIVATE_KEY")

        payload = {
            "assistantId": VAPI_ASSISTANT_ID,
            "name": VAPI_ASSISTANT_NAME,
            "assistant": {
                "transcriber": {
                    "provider": loader.twillio_provider
                },
                "model": {
                    "provider": loader.vapi_model_provider,
                    "model": loader.vapi_model_name,
                    "systemPrompt": loader.vapi_system_propmpt
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


