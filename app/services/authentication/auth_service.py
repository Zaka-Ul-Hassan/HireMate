# app\services\authentication\auth_service.py
from datetime import datetime, timedelta
from jose import ExpiredSignatureError, jwt, JWTError
from sqlalchemy.orm import Session
from fastapi import Depends,HTTPException,status,Request
from fastapi.security import HTTPBearer
# from fastapi.security import OAuth2PasswordBearer

from app.schemas.auth.forgot_password import ForgotPasswordRequest,ForgotPasswordResponse,ResetPasswordRequest,ResetPasswordResponse
from config_loader import get_jwt_settings
from app.services.authentication.security import verify_password
from app.services.email.email_service import send_email
from app.services.authentication.security import hash_password
from app.models.user.user import User
from app.services.user import user_service
from app.db import get_db

jwt_settings = get_jwt_settings()

SECRET_KEY = jwt_settings["secret"]
ALGORITHM = jwt_settings["algorithm"]
ACCESS_TOKEN_EXPIRE_MINUTES = jwt_settings["expiration_minutes"]
RESET_TOKEN_EXPIRE_MINUTES = 15

# oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/users/login" )
token_auth_scheme = HTTPBearer(auto_error=True)

# Create JWT token for login sessions
def create_access_token(data:dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encode_jwt = jwt.encode(to_encode,SECRET_KEY,algorithm=ALGORITHM)
    return encode_jwt

# Decode JWT token
def decode_access_token(token:str):
    try:
        payload = jwt.decode(token,SECRET_KEY,algorithms=ALGORITHM)
        return payload
    except JWTError:
        return None
    
# Password verification 
def validate_user_password(plain_password:str, hashed_passsword:str) -> bool:
    return verify_password(plain_password,hashed_passsword)

# Get current logged-in user from token
def get_current_user(
    request: Request,
    db: Session = Depends(get_db),
) -> User:
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=401, detail="Token missing")

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if not email:
            raise HTTPException(status_code=401, detail="Invalid token payload")
    except ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = user_service.get_user_by_email(db, email=email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user
    

def generate_reset_token(email: str) -> str:
    expire = datetime.utcnow() + timedelta(minutes=RESET_TOKEN_EXPIRE_MINUTES)
    payload = {"sub": email, "exp":expire}
    return jwt.encode(payload,SECRET_KEY, algorithm=ALGORITHM)

def forgot_password(db:Session, request:ForgotPasswordRequest) -> ForgotPasswordResponse:
    try:
        user = user_service.get_user_by_email(db,request.email)
        if not user:
            raise HTTPException(status_code=404, detail="User not found.")
        
        token = generate_reset_token(user.Email)
        reset_link = f"http://127.0.0.1:8000/reset-password?token={token}"

        email_subject = "Password Reset Request"
        email_body = f"Click to the link to reset your password: {reset_link}\nThis link expires in {RESET_TOKEN_EXPIRE_MINUTES} minutes."

        send_email([user.Email], email_subject, email_body)

        return ForgotPasswordResponse(message="Password reset email sent")
    
    except Exception as e:
        return HTTPException(status_code=500, detail=str(e))
    
def reset_password(db: Session, request: ResetPasswordRequest) -> ResetPasswordResponse:
    try:
        # Decode reset token
        payload = decode_access_token(request.token)
        email = payload.get("sub")

        if not email:
            raise HTTPException(status_code=400, detail="Invalid or expired reset token")

        # Find user by email
        user = user_service.get_user_by_email(db, email)
        if not user:
            raise HTTPException(status_code=404, detail="User not found.")

        # Hash and set new password
        user.Password = hash_password(request.new_password)
        db.commit()

        return {"message": "Password reset successfully."}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    
