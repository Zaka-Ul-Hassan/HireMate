# app\services\user\user_service.py
from sqlalchemy.orm import Session
from datetime import datetime
import os,uuid


from app.models.user.user import User
from app.schemas.user.user_schema import RegisterUser
from app.services.authentication.security import hash_password
from app.utils.file_util import sav_upload_file

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
