import os
import requests
from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from load_env import (
    vapi_public_api_key,
    vapi_private_api_key,
    vapi_assistant_api_id,
    vapi_assistant_api_name,
    twilio_sid,
    twilio_token,
    twilio_number,
    transcriber_provider,
    model_provider,
    model_name,
    system_prompt
    )

router = APIRouter()

@router.get("/voice-agent-keys")
def get_voice_agent_keys():
    vapi_public_key = vapi_public_api_key
    vapi_private_key = vapi_private_api_key

    if not vapi_public_key or not vapi_private_key:
        return JSONResponse(status_code=404, content={"error": "VAPI keys not configured"})
    return JSONResponse(content={
        "vapi_public_key": vapi_public_key,
        "vapi_private_key": vapi_private_key
    })


@router.post("/make_call")
def make_call(customer_number: str, message: str):
    try:
        vapi_assistant_id = vapi_assistant_api_id
        vapi_assistant_name = vapi_assistant_api_name
        vapi_private_key = vapi_private_api_key
        twilio_account_sid = twilio_sid
        twilio_auth_token = twilio_token
        twilio_phone_number = twilio_number

        if not vapi_private_key:
            raise HTTPException(status_code=500, detail="Missing VAPI_PRIVATE_KEY")

        payload = {
            "assistantId": vapi_assistant_id,
            "name": vapi_assistant_name,
            "assistant": {
                "transcriber": {
                    "provider": transcriber_provider
                },
                "model": {
                    "provider": model_provider,
                    "model": model_name,
                    "systemPrompt": system_prompt
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
            "Authorization": f"Bearer {vapi_private_key}",
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


