# app\models\resume\resume_model.py

from sqlalchemy import Column, String, Integer, Text, DateTime, ForeignKey, func
from app.models.base.model_base import Base

class Resume(Base):
    __tablename__ = "Resumes"

    Id = Column(Integer, primary_key=True, autoincrement=True)
    UserId = Column(Integer, ForeignKey("Users.Id"), nullable=False)

    # Basic Info
    FullName = Column(String(100), nullable=False)
    Email = Column(String(150), nullable=False, unique=True)
    PhoneNumber = Column(String(20), nullable=True)
    Address = Column(String(255), nullable=False)
    DateOfBirth = Column(String(20), nullable=True)
    Gender = Column(String(10), nullable=True)
    Nationality = Column(String(100), nullable=True)
    ProfileImage = Column(String(255), nullable=True)
    ResumeFile = Column(String(255), nullable=True)

    # Summary & Objective
    Summary = Column(Text, nullable=True)
    Objective = Column(Text, nullable=True)

    # Education
    Education1 = Column(String(255), nullable=True)
    Education2 = Column(String(255), nullable=True)
    Education3 = Column(String(255), nullable=True)

    # Developer
    DeveloperType = Column(String(255), nullable=False)

    # Skills (required)
    Skills = Column(Text, nullable=False)

    # Experience
    ExperienceTitle = Column(String(100), nullable=True)
    ExperienceCompany = Column(String(100), nullable=True)
    ExperienceDuration = Column(String(50), nullable=True)  # e.g. "2 years" or "Jan 2021 – Feb 2023"
    TotalExperience = Column(String(50), nullable=True)     # e.g. "3 years"
    ExperienceDescription = Column(Text, nullable=True)

    # Projects
    Project1 = Column(Text, nullable=True)
    Project2 = Column(Text, nullable=True)

    # Languages
    Languages = Column(String(255), nullable=True)  # e.g. "English, Urdu"

    # Links & Certificates
    LinkedIn = Column(String(255), nullable=True)
    GitHub = Column(String(255), nullable=True)
    Certifications = Column(Text, nullable=True)

    # Meta Info
    IsActive = Column(Integer, default=1)  # 1 = Active, 0 = Deleted
    CreatedAt = Column(DateTime, default=func.now())
    UpdatedAt = Column(DateTime, default=func.now(), onupdate=func.now())
