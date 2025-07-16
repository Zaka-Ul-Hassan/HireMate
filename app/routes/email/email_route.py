# app\routes\email\email_route.py

from fastapi import APIRouter, HTTPException

from app.schemas.email.email_schema import EmailSchema
from app.services.email.email_service import send_email,fetch_all_emails


router = APIRouter()

@router.post("/send-email")
def send_email_route(email: EmailSchema):
    try:
        return send_email(email.to, email.subject, email.body)

    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@router.post("/fetch-emails")
def get_emails(limit=10):
    try:
        result = fetch_all_emails()

        if isinstance(result, dict) and result.get("error"):
            return {"success": False, "message": result["error"]}
        
        return {"success": True, "emails": result}
    
    except Exception as e:
        return {"success" : False, "message": f"An unexpected error occurred: {str(e)}"}
