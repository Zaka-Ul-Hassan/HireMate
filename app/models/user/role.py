# app\models\user\role.py
from sqlalchemy.orm import relationship
from sqlalchemy import Column,Integer,String
from app.models.base_user_dto.audit_mixin import AuditMixin
from app.models.base.model_base import Base

class Role(Base, AuditMixin):
    __tablename__ = "Roles"
    Id = Column(Integer, primary_key=True, autoincrement=True)
    Name = Column(String(100), nullable=False)

    # Relationships
    Users = relationship("User", secondary="UserRoles", back_populates="Roles")


