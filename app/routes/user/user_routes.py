# app\routes\user\user_routes.py
from fastapi import APIRouter,Depends, Query,Request,HTTPException,status
from sqlalchemy.orm import Session
from fastapi.responses import JSONResponse

from app.schemas.response_schema import ResponseSchema
from app.schemas.user.user_schema import CreateUserSchema, CurrentUserSchema, LoginUserSchema, RegisterUser,LoginRequest,TokenResponse
from app.schemas.auth.forgot_password import ForgotPasswordRequest,ResetPasswordRequest
from app.models.user.user import User
from app.services.user import user_service 
from app.services.authentication import auth_service
from app.db import get_db

router = APIRouter()

# create user
@router.post("/Create")
def create_user_route(
    data: CreateUserSchema,
    db: Session = Depends(get_db),  
    current_user: User = Depends(auth_service.get_current_user)
):
    if not current_user.status or not current_user.data:
        return ResponseSchema(status=False, message="Unauthorized access", data=None)
    
    result = user_service.create_user(data, db, current_user)
    return result

# Register user (public)
@router.post("/register")
def register_user_api(
    data: RegisterUser = Depends(),
    db: Session = Depends(get_db)
):
    try:
        return user_service.register_user(data,db)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Login user
@router.post("/login")
def login_user_route(request: LoginUserSchema, db: Session = Depends(get_db)):

    user = user_service.get_user_by_email(db, request.Email)

    if not user or not auth_service.validate_user_password(request.Password, user.Password):
        return JSONResponse(
            content=ResponseSchema(status=False, message="Invalid email or password").dict()
        )
    
    # role
    role_response = auth_service.get_user_roles(db, user.Id)
    roles_dict = [r.dict() for r in role_response.data] if role_response.data else []


    token_data = {
        "id": user.Id,
        "name": f"{user.FirstName} {user.LastName}",
        "sub": user.Email,
        "roles": roles_dict
    }

    token = auth_service.create_access_token(data=token_data)


    response_content = ResponseSchema(
        status=True, 
        message="Login successful", 
        data={
            "id": user.Id,
            "name": f"{user.FirstName} {user.LastName}",
            "email": user.Email,
            "access_token": token,
            "roles": roles_dict,
        }
    ).dict()

    response = JSONResponse(content=response_content)
    return response

# Get current user profile
@router.get("/profile")
def get_profile(
    current_user: CurrentUserSchema = Depends(auth_service.get_current_user)
    ):
    return current_user

# Logout user
@router.post("/logout")
async def logout(request: Request):
    request.session.clear()
    response = JSONResponse({"message": "Logout successfully"})
    response.delete_cookie("access_token")
    return response

# Forgot password
@router.post("/forgot-password")
def forgot_password(
    request: ForgotPasswordRequest, db: Session = Depends(get_db)
):
    return auth_service.forgot_password_email(db, request)


# Set new password using token from email link
@router.post("/reset-password", response_model=ResponseSchema)
def reset_password_route(
    token: str = Query(..., description="Reset password token from email link"),
    request: ResetPasswordRequest = None,
    db: Session = Depends(get_db)
):
    return auth_service.reset_password(db, token, request)

# Set password (before created by admin, user must set password via this route)
@router.post("/set-password", response_model=ResponseSchema)
def set_password_route(
    token: str = Query(..., description="Set password token from email link"),
    request: ResetPasswordRequest = None,
    db: Session = Depends(get_db)
):
    return auth_service.set_password(db, token, request)

