# app\routes\sendgrid\sendgrid_route.py
from fastapi import APIRouter
from app.schemas.response_schema import ResponseSchema
from app.schemas.email.email_schema import SendGridEmailSchema
from app.services import sendgrid_service

router = APIRouter()

#  Send email using SendGrid
@router.post("/send-email", response_model=ResponseSchema)
async def send_email(payload:SendGridEmailSchema):
    return sendgrid_service.send_email_service(payload)
    
