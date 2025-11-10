# app\routes\ai\voice_agent_route.py

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db import get_db
from app.models.resume.resume_model import Resume
from app.models.user.user import User
from app.services.ai.voice_agent.vapi_agent import start_voice_call
from app.services.authentication.auth_service import get_current_user

router = APIRouter()

@router.post("/make_call")
def make_call(
    user: User = Depends(get_current_user),
    customer_number: str = "",
    message: str = "",
    db: Session = Depends(get_db)
):
    resume = db.query(Resume).filter(Resume.UserId == user.Id, Resume.IsDeleted == False).first()
    if not resume:
        return {"status": False, "error": "Please upload your resume before starting a call"}

    return start_voice_call(customer_number, message)



