# app\services\ai\voice_agent\vapi_agent.py

import requests
import logging
from fastapi import HTTPException
from app.models.resume.resume_model import Resume
from app.schemas.response_schema import ResponseSchema
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

logger = logging.getLogger(__name__)


def start_voice_call(customer_number: str, resume:Resume):
    if not vapi_private_api_key:
        return ResponseSchema(status=False, message="Failed to initiate call", data=None)

    payload = {
        "assistantId": vapi_assistant_api_id,
        "name": vapi_assistant_api_name,
        "assistant": {
            "transcriber": {"provider": transcriber_provider},
            "model": {
                "provider": model_provider,
                "model": model_name,
                "systemPrompt" : f"""
            You are a recruitment assistant. You will call a candidate and ask them questions.
            Here is the candidate's resume:

            Full Name: {resume.FullName}
            Email: {resume.Email}
            Gender: {resume.Gender}
            Nationality: {resume.Nationality or ''}
            Skills: {resume.Skills or ''}
            Total Experience: {resume.TotalExperience or ''} 
            Experience Titles and Companies: {resume.ExperienceTitle or ''} at {resume.ExperienceCompany or ''} ({resume.ExperienceDuration or ''})
            Projects: {resume.Project1 or ''}, {resume.Project2 or ''}
            Education: {resume.Education1 or ''}, {resume.Education2 or ''}, {resume.Education3 or ''}
            Languages: {resume.Languages or ''}
            GitHub: {resume.GitHub or ''}
            Certifications: {resume.Certifications or ''}

            Your task:
            1. Ask 10 basic interview questions related to the candidate's skills and experience.
            2. Be polite, professional, and guide the conversation naturally.
            3. At the end of the 10 questions, provide the total score out of 10 and give a short evaluation like:
            "Total Score: X/10. Based on your answers, you are ready/not ready for the next stage."
            5. Ensure the conversation flows naturally like a real call and ends politely.
            """
            },
            "firstMessage": f"Hello {resume.FullName}, this is a call regarding your job application. I have your resume here and would like to ask you a few questions.",
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
            logger.error("VAPI call response did not include a session id: %s", data)
            return ResponseSchema(
                status=False,
                message="VAPI did not return a call session id",
                data=None
            )
        
        return ResponseSchema(status=True, message="Call initiated successfully", data={"session_id": session_id})

    except requests.exceptions.HTTPError as e:
        detail = e.response.text if e.response is not None else str(e)
        logger.error("VAPI call rejected: status=%s detail=%s", e.response.status_code if e.response else "unknown", detail)
        return ResponseSchema(
            status=False,
            message=f"VAPI rejected the call request: {detail}",
            data=None
        )
    except requests.exceptions.RequestException as e:
        logger.exception("VAPI call request failed")
        return ResponseSchema(status=False, message=f"Failed to connect to VAPI: {e}", data=None)
