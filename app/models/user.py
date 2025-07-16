# app.models.user.py
from sqlalchemy import Column,Integer,String,Date
from sqlalchemy.orm import relationship
from app.models.model_base import Base
from app.models.audit_mixin import AuditMixin

class User(Base, AuditMixin):
    __tablename__ = "Users"

    Id = Column(Integer,primary_key=True,autoincrement=True)
    FirstName = Column(String(100), nullable=False)
    MiddleName = Column(String(100), nullable=True)
    LastName = Column(String(100), nullable=True)
    Age = Column(Integer, nullable=False)
    Gender = Column(String(10), nullable=False)
    Dob = Column(Date, nullable=True)
    Address = Column(String(255), nullable=True)
    Country = Column(String(100), nullable=False)
    PhoneNumber = Column(String(20), nullable=True)
    Email = Column(String(100), nullable=False, unique=True)
    Password = Column(String(255), nullable=False)
    Image = Column(String(255), nullable=True)

    
