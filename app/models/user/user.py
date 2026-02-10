# app\models\user\user.py

from sqlalchemy import Column,Integer,String,Date
from sqlalchemy.orm import relationship
from app.models.base.model_base import Base
from app.models.base_user_dto.audit_mixin import AuditMixin

class User(Base, AuditMixin):
    __tablename__ = "Users"

    Id = Column(Integer,primary_key=True,autoincrement=True)
    FirstName = Column(String(100), nullable=False)
    LastName = Column(String(100), nullable=True)
    Age = Column(Integer, nullable=True)
    Gender = Column(String(10), nullable=True)
    Dob = Column(Date, nullable=True)
    Address = Column(String(255), nullable=True)
    Country = Column(String(100), nullable=True)
    PhoneNumber = Column(String(20), nullable=True)
    Email = Column(String(100), nullable=False, unique=True)
    Password = Column(String(255), nullable=True)
    Image = Column(String(255), nullable=True)

    # Relationships
    Roles = relationship("Role", secondary="UserRoles", back_populates="Users")
    EmailSettings = relationship("EmailSettings", back_populates="User", cascade="all, delete-orphan")
    SentEmails = relationship("SentEmail", back_populates="User", cascade="all, delete-orphan")
    Resumes = relationship("Resume", back_populates="User", cascade="all, delete-orphan")

    
