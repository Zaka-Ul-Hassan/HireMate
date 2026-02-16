# app\routes\ai\voice_agent_route.py

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db import get_db
from app.models.resume.resume_model import Resume
from app.models.user.user import User
from app.schemas.response_schema import ResponseSchema
from app.services.ai.voice_agent.vapi_agent import start_voice_call
from app.services.authentication.auth_service import get_current_user

router = APIRouter()

@router.post("/make_call")
def make_call(
    current_user: User = Depends(get_current_user),
    customer_number: str = "",
    db: Session = Depends(get_db)
):
    if not current_user.status or current_user.data is None:
        return ResponseSchema(status=False, message="Unauthorized access", data=None)
    
    user_id = current_user.data.Id
    resume = db.query(Resume).filter(Resume.UserId == user_id, Resume.IsDeleted == False).first()
    if not resume:
        return ResponseSchema(status=False, message="Please upload your resume before making a call.", data=None)

    return start_voice_call(customer_number,resume)



