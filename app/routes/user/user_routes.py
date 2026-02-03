# app\routes\user\user_routes.py
from fastapi import APIRouter,Depends,Request,HTTPException,status
from sqlalchemy.orm import Session
from fastapi.responses import JSONResponse

from app.schemas.user.user_schema import RegisterUser,LoginRequest,TokenResponse
from app.schemas.auth.forgot_password import ForgotPasswordRequest,ForgotPasswordResponse,ResetPasswordRequest,ResetPasswordResponse
from app.models.user.user import User
from app.services.user import user_service 
from app.services.authentication import auth_service
from app.db import get_db

router = APIRouter()

@router.post("/register")
def register_user_api(
    data: RegisterUser = Depends(),
    db: Session = Depends(get_db)
):
    try:
        return user_service.register_user(data,db)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/login", response_model=TokenResponse)
def login_user_api(request:LoginRequest, db:Session = Depends(get_db)):
    #  Find user in DB
    user = user_service.get_user_by_email(db,request.email)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,detail="Invalid email")
    
    # Verify password
    if not auth_service.validate_user_password(request.password,user.Password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Password")
    
    #  Create JWT token
    token = auth_service.create_access_token(data={"sub": user.Email})
    response = JSONResponse(content={"message": "Login successful"})
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=False,
        samesite="Lax"
    )
    return response


@router.get("/current-user")
def get_logged_in_user(current_user: User = Depends(auth_service.get_current_user)):
    name_parts = []
    if current_user.FirstName:
        name_parts.append(current_user.FirstName)
    if current_user.MiddleName:
        name_parts.append(current_user.MiddleName)
    if current_user.LastName:
        name_parts.append(current_user.LastName)

    full_name = " ".join(name_parts)

    return {
        "UserId": current_user.Id,
        "Name": full_name,                 
        "Email": current_user.Email or "",     
        "Country": current_user.Country or "", 
        "Image": current_user.Image or ""    
    }


@router.post("/logout")
async def logout(request: Request):
    request.session.clear()
    response = JSONResponse({"message": "Logout successfully"})
    response.delete_cookie("access_token")
    return response

@router.post("/forgot-password", response_model=ResetPasswordResponse)
def forgot_password(
    request: ForgotPasswordRequest,
    db: Session = Depends(get_db)
):
    try:
        return auth_service.forgot_password(db, request)
    except HTTPException as e:
        # Pass through any HTTPExceptions from the service
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/reset-password", response_model=ResetPasswordResponse)
def reset_password(
    request: ResetPasswordRequest,
    db: Session = Depends(get_db)
):
    try:
        return auth_service.reset_password(db, request)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

