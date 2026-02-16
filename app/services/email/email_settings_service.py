# app\services\email\email_settings_service.py

from app.models.user.user import User
from app.db import get_db
from app.models.email.email_settings import EmailSettings
from app.schemas.email.email_settings_schema import EmailSettingsCreateSchema, EmailSettingsResponseSchema, EmailSettingsUpdateSchema
from app.schemas.response_schema import ResponseSchema
from app.utils.security import decrypt, encrypt  

# Create Email Settings
def create_email_settings(db, data: EmailSettingsCreateSchema) -> ResponseSchema:

    # Check if user exists
    user = db.query(User).filter(User.Id == data.UserId).first()
    if not user:
        return ResponseSchema(status=False, message="User not found")

    # Check existing settings
    existing = (
        db.query(EmailSettings)
        .filter(EmailSettings.UserId == data.UserId, EmailSettings.IsDeleted == False)
        .first()
    )
    if existing:
        return ResponseSchema(status=False, message="Email settings already exist")

    # Detect SMTP automatically from domain
    domain = data.EmailAddress.split("@")[1].lower()
    if domain == "gmail.com":
        smtp_server = "smtp.gmail.com"
    elif domain in ["outlook.com", "hotmail.com", "live.com", "office365.com"]:
        smtp_server = "smtp.office365.com"
    else:
        return ResponseSchema(status=False, message="Only Gmail & Outlook supported")

    new_settings = EmailSettings(
        UserId=data.UserId,
        EmailAddress=data.EmailAddress,
        Password=encrypt(data.Password),
        SmtpServer=smtp_server,
        SmtpPort=587,
        IsDeleted=False,
    )

    db.add(new_settings)
    db.commit()
    db.refresh(new_settings)

    return ResponseSchema(
        status=True,
        message="Email settings created successfully",
        data={"Id": new_settings.Id, "EmailAddress": new_settings.EmailAddress},
    )

# Update Email Settings
def update_email_settings(db, data: EmailSettingsUpdateSchema) -> ResponseSchema:

    settings = (
        db.query(EmailSettings)
        .filter(EmailSettings.UserId == data.UserId, EmailSettings.IsDeleted == False)
        .first()
    )

    if not settings:
        return ResponseSchema(status=False, message="Email settings not found")

    # Update SMTP server based on domain
    domain = data.EmailAddress.split("@")[1].lower()
    if domain == "gmail.com":
        settings.SMTP_SERVER = "smtp.gmail.com"
    elif domain in ["outlook.com", "hotmail.com", "live.com", "office365.com"]:
        settings.SMTP_SERVER = "smtp.office365.com"
    else:
        return ResponseSchema(status=False, message="Only Gmail & Outlook supported")

    settings.EmailAddress = data.EmailAddress
    settings.Password = encrypt(data.Password)
    settings.SmtpServer = settings.SmtpServer
    settings.SmtpPort = settings.SmtpPort

    db.commit()
    db.refresh(settings)

    return ResponseSchema(
        status=True,
        message="Email settings updated successfully",
        data={"EmailAddress": settings.EmailAddress},
    )

# Soft delete Email Settings
def delete_email_settings(db, id: int) -> ResponseSchema:

    settings = (
        db.query(EmailSettings)
        .filter(EmailSettings.Id == id, EmailSettings.IsDeleted == False)
        .first()
    )

    if not settings:
        return ResponseSchema(status=False, message="Email settings not found")

    settings.IsDeleted = True
    db.commit()

    return ResponseSchema(status=True, message="Email settings deleted successfully")

# Get Email Settings by ID
def get_email_settings_by_id(db, id: int) -> ResponseSchema:

    settings = (
        db.query(EmailSettings)
        .filter(EmailSettings.Id == id, EmailSettings.IsDeleted == False)
        .first()
    )

    if not settings:
        return ResponseSchema(status=False, message="Email settings not found")

    # Convert SQLAlchemy model → Schema
    response_data = EmailSettingsResponseSchema.from_orm(settings)
    response_data.Password = decrypt(settings.Password)

    return ResponseSchema(
        status=True,
        message="Email settings fetched successfully",
        data=response_data
    )

# Get All Email Settings
def get_all_email_settings(db) -> ResponseSchema:

    settings_list = (
        db.query(EmailSettings)
        .filter(EmailSettings.IsDeleted == False)
        .order_by(EmailSettings.Id.desc())
        .all()
    )

    response_data = []
    for settings in settings_list:
        item = EmailSettingsResponseSchema.from_orm(settings)
        item.Password = decrypt(settings.Password)
        response_data.append(item)

    return ResponseSchema(
        status=True,
        message="All email settings fetched successfully",
        data=response_data
    )

# Get Email Settings by User ID
def get_email_settings_by_user_id(db, user_id: int) -> ResponseSchema:

    settings = (
        db.query(EmailSettings)
        .filter(EmailSettings.UserId == user_id, EmailSettings.IsDeleted == False)
        .first()
    )

    if not settings:
        return ResponseSchema(status=False, message="Email settings not found")

    # Convert SQLAlchemy model → Schema
    response_data = EmailSettingsResponseSchema.from_orm(settings)
    response_data.Password = decrypt(settings.Password)

    return ResponseSchema(
        status=True,
        message="Email settings fetched successfully",
        data=response_data
    )

