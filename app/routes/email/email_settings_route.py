# app\routes\email\email_settings_route.py
from fastapi import APIRouter, Depends, Query
from requests import Session
from app.schemas.email.email_settings_schema import EmailSettingsCreateSchema, EmailSettingsUpdateSchema
from app.schemas.response_schema import ResponseSchema
from app.services.email import email_settings_service
from app.db import get_db

router = APIRouter(prefix="/email/settings")

# Create Email Settings
@router.post("/settings/create", response_model=ResponseSchema)
def create_email_settings(
    data: EmailSettingsCreateSchema,
    db: Session = Depends(get_db)
):
    return email_settings_service.create_email_settings(db, data)

# Update Email Settings
@router.put("/settings/update", response_model=ResponseSchema)
def update_email_settings(
    data: EmailSettingsUpdateSchema,
    db: Session = Depends(get_db)
):
    return email_settings_service.update_email_settings(db, data)

# Soft Delete Email Settings
@router.delete("/settings/delete", response_model=ResponseSchema)
def delete_email_settings(
    id: int = Query(...),
    db: Session = Depends(get_db)
):
    return email_settings_service.delete_email_settings(db, id)

# Get Email Settings by ID
@router.get("/settings/by-id", response_model=ResponseSchema)
def get_email_settings(
    id: int = Query(...),
    db: Session = Depends(get_db)
):
    return email_settings_service.get_email_settings_by_id(db, id)

# Get All Email Settings
@router.get("/settings/get_all", response_model=ResponseSchema)
def get_all_email_settings(db: Session = Depends(get_db)):
    return email_settings_service.get_all_email_settings(db)

# Get Email Settings by User ID
@router.get("/settings/by-user", response_model=ResponseSchema)
def get_email_settings_by_user(
    user_id: int = Query(...),
    db: Session = Depends(get_db)
):
    return email_settings_service.get_email_settings_by_user_id(db, user_id)