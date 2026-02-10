# app\services\user\user_service.py
from sqlalchemy.orm import Session
from datetime import datetime
import os,uuid

from app.models.user.role import Role
from app.models.user.user import User
from app.models.user.user_role import UserRole
from app.schemas.email.email_schema import SendSystemEmailSchema
from app.schemas.response_schema import ResponseSchema
from app.schemas.user.user_schema import CreateUserSchema, RegisterUser
from app.services.authentication import auth_service
from app.services.authentication.security import hash_password
from app.services.email import email_service
from app.utils.file_util import sav_upload_file
from load_env import FRONTEND_BASE_URL


# Create user
def create_user(data: CreateUserSchema, db: Session, current_user) -> ResponseSchema:
    try:
        # Check if email already exists
        existing_user = db.query(User).filter(User.Email == data.Email, User.IsDeleted == False).first()
        if existing_user:
            return ResponseSchema(status=False, message="Email already registered", data=None)

        # Create new user
        user = User(
            FirstName=data.FirstName,
            LastName=data.LastName,
            Email=data.Email,
            PhoneNumber=data.Phone,
            CreatedByUserId=current_user.data.Id,
            CreatedBy=current_user.data.Name,
            IsDeleted=False,
            IsActive=False
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        # Ensure "User" role exists
        role = db.query(Role).filter(Role.Name == "User").first()
        if not role:
            role = Role(
                Name="User",
                CreatedByUserId=current_user.data.Id,
                CreatedBy=current_user.data.Name
            )
            db.add(role)
            db.commit()
            db.refresh(role)

        # Assign role to user
        user_role = UserRole(
            UserId=user.Id,
            RoleId=role.Id
        )
        db.add(user_role)
        db.commit()
        
        # Send confirmation email
        token = auth_service.generate_reset_token(user.Email)

        # Generate confirmation link
        confirm_link = f"{FRONTEND_BASE_URL}/user/set-password?token={token}"

        # Send welcome email
        email_payload = SendSystemEmailSchema(
            Recipient=[user.Email],
            Subject="Welcome to HireMate - Confirm Your Email",
            Body=f"""
    Hi {user.FirstName} {user.LastName},

    Welcome aboard! We're thrilled to have you join our platform called HireMate. Before we get started, there's just one small step we would like you to complete.

    Please confirm your email address and set your password by clicking the link below:

    <a href="{confirm_link}">Confirm Email & Set Password</a>

    If you have any questions or need assistance, feel free to reach out to us.
    <br>
    Cheers,
    <br>
    HireMate Team
    """
        )
        send_system_email=email_service.send_system_email(email_payload)
        if not send_system_email.status:
            return ResponseSchema(
                status=False,
                message="User created but failed to send confirmation email",
                data={
                    "Id": user.Id,
                    "Name": f"{user.FirstName} {user.LastName}",
                    "Email": user.Email,
                    "Role": role.Name
                }
            )
        return ResponseSchema(
            status=True,
            message="User created and confirmation email sent successfully",
            data={
                "Id": user.Id,
                "Name": f"{user.FirstName} {user.LastName}",
                "Email": user.Email,
                "Role": role.Name
            }
        )
    
    except Exception as e:
        db.rollback()
        return ResponseSchema(status=False, message="Failed to create user")
    
# Register user (public)
def register_user(data:RegisterUser, db:Session, created_by:str = "self"):
    existing_user = db.query(User).filter(User.Email == data.email).first()
    if existing_user:
        raise Exception("Email already registered")
    
    image_path = sav_upload_file(data.image)
    
    user = User(
        FirstName=data.first_name,
        MiddleName=data.middle_name,
        LastName=data.last_name,
        Age=data.age,
        Gender=data.gender.value,
        Dob=data.dob,
        Country=data.country,
        Address= data.address,
        PhoneNumber=data.phone_number,
        Email=data.email,
        Password=hash_password(data.password),
        Image=image_path,
        CreatedAt=datetime.utcnow(),
        CreatedBy=created_by,
        IsActive=True,
        IsDeleted=False
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return{
        "message": "User registered successfully",
        "user_id": user.Id,
        "email" : user.Email,
        "created_at": user.CreatedAt.isoformat(),
        "image_path":image_path
    }

# Get user by email
def get_user_by_email(db:Session, email:str) -> User | None:
    return db.query(User).filter(User.Email == email).first()
