# app\models\email\email_settings.py

from app.models.base.model_base import Base
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.models.base_user_dto.audit_mixin import AuditMixin

class EmailSettings(Base, AuditMixin):
    __tablename__ = "EmailSettings"
    Id = Column(Integer, primary_key=True, autoincrement=True)
    SmtpServer = Column(String(255), nullable=False)
    SmtpPort = Column(Integer, nullable=False)
    EmailAddress = Column(String(100), nullable=False)
    Password = Column(String(1000), nullable=False)

    # Relationship
    UserId = Column(Integer, ForeignKey("Users.Id"), nullable=False) 
    User = relationship("User", back_populates="EmailSettings")