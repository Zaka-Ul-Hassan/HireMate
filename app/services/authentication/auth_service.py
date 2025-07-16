# app\services\authentication\auth_service.py
from datetime import datetime, timedelta
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from fastapi import Depends,HTTPException,status,Request
from fastapi.security import HTTPBearer,HTTPAuthorizationCredentials
# from fastapi.security import OAuth2PasswordBearer


from config_loader import get_jwt_settings
from app.services.authentication.security import verify_password
from app.models.user import User
from app.services.user import user_service
from app.db import get_db

jwt_settings = get_jwt_settings()

SECRET_KEY = jwt_settings["secret"]
ALGORITHM = jwt_settings["algorithm"]
ACCESS_TOKEN_EXPIRE_MINUTES = jwt_settings["expiration_minutes"]

# oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/users/login" )
token_auth_scheme = HTTPBearer(auto_error=True)

# Create JWT token
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

def get_current_user(
    request: Request,
    db: Session = Depends(get_db),
) -> User:
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=status.HTTP_303_SEE_OTHER, headers={"Location": "/"})
       
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if not email:
            raise HTTPException(status_code=status.HTTP_303_SEE_OTHER, headers={"Location": "/"})
        
    except JWTError:
        raise HTTPException(status_code=status.HTTP_303_SEE_OTHER,headers={"Location": "/"})
        return None

    user = user_service.get_user_by_email(db, email=email)
    if not user:
        raise HTTPException(status_code=status.HTTP_303_SEE_OTHER, headers={"Location": "/"})
    
    return user


