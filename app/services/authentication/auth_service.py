# app\services\authentication\auth_service.py
from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from app.models.user.role import Role
from app.models.user.user_role import UserRole
from app.schemas.email.email_schema import SendSystemEmailSchema
from app.schemas.response_schema import ResponseSchema
from app.schemas.response_schema import ResponseSchema
from app.schemas.role.role_schema import RoleSchema
from app.schemas.user.user_schema import CurrentUserSchema
from app.services.ai.cohere_chat_service import cohere_chat
from app.services.email import email_service
from config_loader import get_jwt_settings
from app.services.authentication.security import verify_password
from app.services.email.email_service import send_system_email
from app.services.authentication.security import hash_password
from app.models.user.user import User
from app.services.user import user_service
from app.db import get_db
from load_env import FRONTEND_BASE_URL, JWT_ALGORITHM, JWT_SECRET, JWT_EXPIRATION, RESET_TOKEN_EXPIRE_MINUTES

jwt_settings = get_jwt_settings()



# oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/users/login" )
bearer_scheme = HTTPBearer()

# Create JWT token for login sessions
def create_access_token(data:dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=JWT_EXPIRATION)
    to_encode.update({"exp": expire})
    encode_jwt = jwt.encode(to_encode,JWT_SECRET,algorithm=JWT_ALGORITHM)
    return encode_jwt

# Decode JWT token
def decode_access_token(token:str):
    try:
        payload = jwt.decode(token,JWT_SECRET,algorithms=JWT_ALGORITHM)
        return payload
    except JWTError:
        return None
    
# Password verification 
def validate_user_password(plain_password:str, hashed_passsword:str) -> bool:
    return verify_password(plain_password,hashed_passsword)

## Get current user from token
def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db)
) -> CurrentUserSchema:
    token = credentials.credentials
    payload = decode_access_token(token)
    if not payload:
        return ResponseSchema(status=False, message="Token not found")

    email: str = payload.get("Email")
    user_id: int = payload.get("Id")
    name: str = payload.get("Name")
    roles: list = payload.get("Roles", [])

    if not email:
        return ResponseSchema(status=False, message="Token invalid or expired")

    user = user_service.get_user_by_email(db, email)
    if not user:
        return ResponseSchema(status=False, message="User does not exist")
    
    current_user = CurrentUserSchema(
        Id=user_id,
        Email=email,
        Name=name,
        RoleIds=[r["Id"] for r in roles],
        RoleNames=[r["Name"] for r in roles]
    )

    return ResponseSchema(status=True, message="User authenticated", data=current_user)
    

def generate_reset_token(email: str) -> str:
    expire = datetime.utcnow() + timedelta(minutes=JWT_EXPIRATION)
    payload = {"sub": email, "exp":expire}
    return jwt.encode(payload,JWT_SECRET, algorithm=JWT_ALGORITHM)

# Handle Forgot Password Request
# Forgot Password / Reset Flow
# Create Reset Token
def create_reset_token(email:str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=int(RESET_TOKEN_EXPIRE_MINUTES))
    payload = {"sub": email, "exp": expire}
    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return token

# Send Email for Forgot Password
def send_reset_email(to_email: str, token: str):
    reset_link = f"{FRONTEND_BASE_URL}/user/reset-password?token={token}"
    subject = "Password Reset Request"

    body = f"""
    <p>Click the link below to reset your password:</p>
    <a href="{reset_link}">Reset Password</a>
    <p>If you didn't request a password reset, please ignore this email.</p>
    """
    payload = SendSystemEmailSchema(
        Recipient=[to_email],
        Subject=subject,
        Body=body
    )

    response = email_service.send_system_email(payload)
    return response

def forgot_password_email(db, request):
    user = db.query(User).filter(User.Email == request.Email).first()
    if not user:
        return ResponseSchema(status=False,message="User not found")
    
    reset_token = create_reset_token(request.Email)
    response = send_reset_email(request.Email, reset_token)
    return ResponseSchema(
        status=True,
        message="Password reset email sent successfully",
        data={"recipient": request.Email, "email_status": response.status}
    )
    
# Set Password 
def set_password(db, token, request):
    # Get Email
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
         return ResponseSchema(status=False, message="Invalid token payload")
    
    email = payload.get("sub")
    user = db.query(User).filter(User.Email == email).first()
    if not user:
        return ResponseSchema(status=False, message="User not found")
    
    # Check if new password and confirm password match
    if request.NewPassword != request.ConfirmPassword:
        return ResponseSchema(status=False, message="New password and confirm password do not match")
    
    # Hash and update password
    user.Password = hash_password(request.NewPassword)
    user.IsActive = True
    db.add(user)
    db.commit()
    db.refresh(user)

    return ResponseSchema(
        status=True,
        message="Password set successfully"
    )

# Reset Password Function
def reset_password(db, token, request):
    # Get Email
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
         return ResponseSchema(status=False, message="Invalid token payload")
    
    email = payload.get("sub")
    user = db.query(User).filter(User.Email == email).first()
    if not user:
        return ResponseSchema(status=False, message="User not found")
    
    # Check if new password and confirm password match
    if request.NewPassword != request.ConfirmPassword:
        return ResponseSchema(status=False, message="New password and confirm password do not match")
    
    # Hash and update password
    user.Password = hash_password(request.NewPassword)
    db.add(user)
    db.commit()
    db.refresh(user)

    return  ResponseSchema(
        status=True,
        message="Password reset successfully"
    )

    
# Get user roles by user ID
def get_user_roles(db: Session, user_id: int) -> ResponseSchema:
    roles = (
        db.query(Role)
        .join(UserRole, Role.Id == UserRole.RoleId)
        .filter(UserRole.UserId == user_id)
        .all()
    )

    return ResponseSchema(
        status=True,
        message="User roles fetched successfully" if roles else "No roles found for user",
        data=[RoleSchema.from_orm(r) for r in roles]
    )


# Change Password
def change_user_password(user_id, data, db):
    # Get user response
    user_response = user_service.get_user_by_id(db, user_id)

    # Check if user exists
    if not user_response.status or not user_response.data:
        return ResponseSchema(
            status=False,
            message="User not found",
            data=None
        )

    # Extract actual User model
    user = user_response.data

    # Verify old password
    if not verify_password(data.OldPassword, user.Password):
        return ResponseSchema(
            status=False,
            message="Old Password is incorrect",
            data=None
        )

    # Check new & confirm password
    if data.NewPassword != data.ConfirmPassword:
        return ResponseSchema(
            status=False,
            message="New password and confirm password do not match",
            data=None
        )

    # Hash and update password
    user.Password = hash_password(data.NewPassword)

    db.commit()
    db.refresh(user)

    return ResponseSchema(
        status=True,
        message="Password changed successfully",
        data=None
    )

# Change Password By Admin
def admin_change_user_password(data, db: Session):

    user = db.query(User).filter(
        User.Id == data.UserId,
        User.IsDeleted == False
    ).first()

    if not user:
        return ResponseSchema(
            status=False,
            message="User not found",
            data=None
        )
    
    # Check new & confirm password
    if data.NewPassword != data.ConfirmPassword:
        return ResponseSchema(
            status=False,
            message="New password and confirm password do not match",
            data=None
        )

    # Update password
    user.Password = hash_password(data.NewPassword)
    db.commit()

    # Generate email body using AI
    ai_prompt = f"""
    Write a professional HTML email.

    Context:
    - The user's password has been updated by HireMate admin.
    - Include the new password: {data.NewPassword}
    - Mention this was done for security reasons.
    - Ask the user to change password after login.
    - Include application URL: {FRONTEND_BASE_URL}
    - Tone: professional, secure, clear
    """

    email_body = cohere_chat(ai_prompt)

    # Send email
    email_payload = SendSystemEmailSchema(
        Recipient=[user.Email],
        Subject="Your HireMate Password Has Been Updated",
        Body=email_body
    )

    email_response = send_system_email(email_payload)

    if not email_response.status:
        return ResponseSchema(
            status=False,
            message="Password updated but email failed",
            data=None
        )

    return ResponseSchema(
        status=True,
        message="Password updated and email sent successfully",
        data=None
    )
