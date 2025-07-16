# app\routes\user\user_routes.py
from fastapi import APIRouter,Depends,HTTPException,status
from sqlalchemy.orm import Session
from fastapi.responses import JSONResponse

from app.schemas.user.user_schema import RegisterUser,LoginRequest,TokenResponse
from app.models.user import User
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
def get_logged_in_user(current_user:User = Depends(auth_service.get_current_user)):
    return{
        "Name": current_user.FirstName + current_user.MiddleName + current_user.LastName,
        "Email": current_user.Email,
        "Country" : current_user.Country,
        "Image" : current_user.Image
    }

    

