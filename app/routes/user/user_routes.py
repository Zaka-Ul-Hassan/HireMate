# app\routes\user\user_routes.py
from fastapi import APIRouter,Depends, Query,Request,HTTPException,status
from sqlalchemy.orm import Session
from fastapi.responses import JSONResponse

from app.schemas.pagination_schema import PaginationInputSchema
from app.schemas.response_schema import ResponseSchema
from app.schemas.user.user_schema import CreateUserSchema, CurrentUserSchema, LoginUserSchema, RegisterUser,LoginRequest,TokenResponse, UpdateProfileSchema
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

    if user.IsActive == False:
        return ResponseSchema(status=False, message="Account is not active. Please contact administrator.", data=None)

    if not user or not auth_service.validate_user_password(request.Password, user.Password):
        return JSONResponse(
            content=ResponseSchema(status=False, message="Invalid email or password").dict()
        )
    
    # role
    role_response = auth_service.get_user_roles(db, user.Id)
    roles_dict = [r.dict() for r in role_response.data] if role_response.data else []


    token_data = {
        "Id": user.Id,
        "Name": f"{user.FirstName} {user.LastName}",
        "Email": user.Email,
        "Roles": roles_dict
    }

    token = auth_service.create_access_token(data=token_data)


    response_content = ResponseSchema(
        status=True, 
        message="Login successful", 
        data={
            "Id": user.Id,
            "Name": f"{user.FirstName} {user.LastName}",
            "Email": user.Email,
            "AccessToken": token,
            "Roles": roles_dict,
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


# Users list with pagination and search
@router.post("/list")
def list_users(
    payload: PaginationInputSchema,
    db: Session = Depends(get_db)
):
    return user_service.list_users(
        db=db,
        search=payload.search,
        skip=payload.skipCount,
        limit=payload.maxCount
    )

# Activate or Deactivate user
@router.post("/toggle-activation/{user_id}")
def toggle_user_activation(
    user_id: int,
    db: Session = Depends(get_db)
):

    return user_service.toggle_user_activation(db, user_id)

# Update user profile
@router.put("/update-profile")
def update_profile(
    data: UpdateProfileSchema = Depends(),
    db: Session = Depends(get_db),
    user_id: int = Query(..., description="User ID to update")
):
    return user_service.update_user_profile(
        db=db,
        data=data,
        user_id=user_id
    )

# Get User by id
@router.get("/{id}")
def get_user_by_id(
    id: int,
    db: Session = Depends(get_db)
):
    return user_service.get_user_by_id(db, id)

# get user by email
@router.get("/email/{email}")
def get_user_by_email(
    email: str,
    db: Session = Depends(get_db)
):
    return user_service.get_user_by_email(db, email)

# Delete user (soft delete)
@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db)
):
    return user_service.delete_user(db, user_id)

# Roles list
@router.get("/roles/list")
def list_roles(
    db: Session = Depends(get_db)
):
    return user_service.list_roles(db)