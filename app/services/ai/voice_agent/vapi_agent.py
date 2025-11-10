import requests
from fastapi import HTTPException
from load_env import (
    vapi_assistant_api_id,
    vapi_assistant_api_name,
    vapi_private_api_key,
    twilio_sid,
    twilio_token,
    twilio_number,
    transcriber_provider,
    model_provider,
    model_name,
)


def start_voice_call(customer_number: str, message: str):
    if not vapi_private_api_key:
        raise HTTPException(status_code=500, detail="Missing VAPI_PRIVATE_KEY")

    payload = {
        "assistantId": vapi_assistant_api_id,
        "name": vapi_assistant_api_name,
        "assistant": {
            "transcriber": {"provider": transcriber_provider},
            "model": {
                "provider": model_provider,
                "model": model_name,
                "systemPrompt": ""
            },
            "firstMessage": message,
            "endCallFunctionEnabled": True,
            "endCallMessage": "Thank you, bye"
        },
        "phoneNumber": {
            "twilioAccountSid": twilio_sid,
            "twilioAuthToken": twilio_token,
            "twilioPhoneNumber": twilio_number,
        },
        "customer": {"number": customer_number},
    }

    headers = {
        "Authorization": f"Bearer {vapi_private_api_key}",
        "Content-Type": "application/json"
    }

    try:
        response = requests.post("https://api.vapi.ai/call", json=payload, headers=headers)
        response.raise_for_status()
        data = response.json()
        session_id = data.get("id")

        if not session_id:
            raise HTTPException(status_code=500, detail="Missing 'id' in VAPI response")

        return {"status": True, "session_id": session_id, "message": "Call initiated successfully"}

    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Error making call: {str(e)}")
