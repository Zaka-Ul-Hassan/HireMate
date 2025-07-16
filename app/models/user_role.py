from sqlalchemy import Column,Integer,ForeignKey
from sqlalchemy.orm import relationship
from app.models.model_base import Base

class UserRole(Base):
    __tablename__ = "UerRoles"

    Id = Column(Integer, primary_key=True, autoincrement=True)
    UserId = Column(Integer, ForeignKey("Users.Id"), nullable=False)
    RoleId = Column(Integer, ForeignKey("Roles.Id"), nullable=False)