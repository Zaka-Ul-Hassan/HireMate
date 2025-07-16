# app\schemas\user\user_schema.py

from fastapi import UploadFile, File, Form
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import date

from app.schemas.shared.gender_enum import GenderEnum

# Custom class (NOT BaseModel) for registration with image upload
class RegisterUser:
    def __init__(
        self,
        first_name: str = Form(...),
        middle_name: Optional[str] = Form(None),
        last_name: Optional[str] = Form(None),
        age: int = Form(..., gt=10),
        gender: GenderEnum = Form(...),
        dob: Optional[date] = Form(None),
        address: Optional[str] = Form(None),
        country: str = Form(...),
        phone_number: str = Form(...),
        email: EmailStr = Form(...),
        password: str = Form(..., min_length=4),
        image: Optional[UploadFile] = File(None)
    ):
        self.first_name = first_name
        self.middle_name = middle_name
        self.last_name = last_name
        self.age = age
        self.gender = gender
        self.dob = dob
        self.address = address
        self.country = country
        self.phone_number = phone_number
        self.email = email
        self.password = password
        self.image = image



class LoginRequest(BaseModel):
    email: str = Form(..., alias="Email")
    password: str = Form(..., alias="Password")


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
