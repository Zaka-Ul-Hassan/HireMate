# app\routes\email\email_route.py

from fastapi import APIRouter, HTTPException

from app.schemas.email.email_schema import EmailSchema
from app.services.email.email_service import send_email

router = APIRouter()

@router.post("/send-email")
def send_email_route(email: EmailSchema):
    try:
        return send_email(email.to, email.subject, email.body)

    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
