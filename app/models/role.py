# app.models.role.py
from sqlalchemy import Column,Integer,String
from app.models.model_base import Base

class Role(Base):
    __tablename__ = "Roles"

    Id = Column(Integer, primary_key=True, autoincrement=True)
    Name = Column(String(50), nullable=False, unique=True)

