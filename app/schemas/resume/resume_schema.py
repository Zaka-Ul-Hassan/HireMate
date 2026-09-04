# app\schemas\resume\resume_schema.py

from pydantic import BaseModel, ConfigDict, EmailStr
from typing import Optional
from datetime import datetime


class ResumeBase(BaseModel):
    FullName: str
    Email: EmailStr
    PhoneNumber: Optional[str] = None
    Address: str
    DateOfBirth: Optional[str] = None
    Gender: Optional[str] = None
    Country: Optional[str] = None
    Nationality: Optional[str] = None
    ProfileImage: Optional[str] = None
    ResumeFile: Optional[str] = None

    Summary: Optional[str] = None
    Objective: Optional[str] = None

    Education1: Optional[str] = None
    Education2: Optional[str] = None
    Education3: Optional[str] = None

    DeveloperType: str
    Skills: str

    ExperienceTitle: Optional[str] = None
    ExperienceCompany: Optional[str] = None
    ExperienceDuration: Optional[str] = None
    TotalExperience: Optional[str] = None
    ExperienceDescription: Optional[str] = None

    Project1: Optional[str] = None
    Project2: Optional[str] = None

    Languages: Optional[str] = None
    LinkedIn: Optional[str] = None
    GitHub: Optional[str] = None
    Certifications: Optional[str] = None


class ResumeCreate(ResumeBase):
    UserId: int


class ResumeUpdate(ResumeBase):
    pass


class ResumeResponse(ResumeBase):
    Id: int
    UserId: int
    CreatedAt: Optional[datetime]

    model_config = ConfigDict(from_attributes=True)
