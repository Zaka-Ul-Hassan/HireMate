# app\schemas\user\user_schema.py

from fastapi import UploadFile, File, Form
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import date, datetime

from sqlalchemy import Column, String

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



class UserBaseSchema(BaseModel):
    FirstName: str
    LastName: Optional[str] = None
    Phone: Optional[str] = None
    Email: str

class CreateUserSchema(UserBaseSchema):
    RoleIds: Optional[List[int]] = None

class EditUserSchema(BaseModel):
    Id: int
    FirstName: Optional[str] = None
    LastName: Optional[str] = None
    Phone: Optional[str] = None
    IsActive: Optional[bool] = None

class LoginUserSchema(BaseModel):
    Email: str
    Password: str


class CurrentUserSchema(BaseModel):
    Id: int
    Email: str
    Name: str
    RoleIds: List[int]
    RoleNames: List[str]

class UserListSchema(UserBaseSchema):
    Id: int
    IsActive: Optional[bool] = None
    CreatedAt: datetime
    ModifiedAt: Optional[datetime] = None
    CreatedByUserId: Optional[int] = None
    CreatedBy: Optional[str]
    ModifiedByUserId: Optional[int] = None
    ModifiedBy: Optional[str]
    IsDeleted: bool

    class Config:
        orm_mode = True
    


class UpdateProfileSchema:
    def __init__(
        self,
        FirstName: Optional[str] = Form(None),
        LastName: Optional[str] = Form(None),
        PhoneNumber: Optional[str] = Form(None),
        Country: Optional[str] = Form(None),
        Address: Optional[str] = Form(None),
        Age: Optional[int] = Form(None),
        Gender: Optional[str] = Form(None),
        Dob: Optional[date] = Form(None),
        Image: Optional[UploadFile] = File(None),
    ):
        self.FirstName = FirstName
        self.LastName = LastName
        self.PhoneNumber = PhoneNumber
        self.Country = Country
        self.Address = Address
        self.Age = Age
        self.Gender = Gender
        self.Dob = Dob
        self.Image = Image


class RoleResponseSchema(BaseModel):
    Id: int
    Name: str

    class Config:
        orm_mode = True