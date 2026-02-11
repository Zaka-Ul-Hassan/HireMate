# app\routes\email\email_route.py

from fastapi import APIRouter, Depends, HTTPException, Query, Query
from requests import Session

from app.schemas.email.email_schema import EmailSchema,InboxEmail, SendClientEmailSchema, SendSystemEmailSchema
from app.schemas.pagination_schema import PaginationInputSchema
from app.schemas.response_schema import ResponseSchema
from app.services.authentication import auth_service
from app.services.email import email_service
from app.services.email.email_service import send_email,fetch_all_emails
from init_db import get_db

    
router = APIRouter()

# Send System Email
@router.post("/system", response_model=ResponseSchema)
def send_system_email(
payload: SendSystemEmailSchema
):
    return email_service.send_system_email(payload)

# Send Email
@router.post("/client", response_model=ResponseSchema)
def send_email(
    payload: SendClientEmailSchema,
    db: Session = Depends(get_db)
):
    return email_service.send_email(db, payload)


# Get Sent Emails by User Id
@router.get("/get/sent-emails")
def get_all_sent_emails_by_user(
    user_id: int = Query(..., description="User Id"),
    pagination: PaginationInputSchema = Depends(),
    db: Session = Depends(get_db),
):
    return email_service.get_sent_email(db, user_id, pagination)
    

# Fetch Replied Emails From Inbox
@router.get("/save/fetch-replies")
def save_fetch_emails(
    db: Session = Depends(get_db),
    user_id : int = Query(...)
    ):

    return email_service.save_fetch_replied_emails(db,user_id)

# Fetch Replied Emails with Sent Email From DB
@router.get("/get/replied-emails", response_model=ResponseSchema)
def fetch_replied_emails(
    user_id: int = Query(...),
    pagination : PaginationInputSchema = Depends(),
    db: Session = Depends(get_db)
):

    return email_service.get_replied_emails_with_sent(db, user_id, pagination)

# Genetate Email Content using AI
@router.post("/generate-content", response_model=ResponseSchema)
def generate_email_content(
    email: str = Query(..., description="Email content prompt") ,
    current_user = Depends(auth_service.get_current_user),
    db: Session = Depends(get_db)
):
    return email_service.generate_email_content(db, current_user, email)