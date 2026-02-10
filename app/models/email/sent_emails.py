# app\models\email\sent_emails.py

from sqlalchemy import Column, DateTime, Integer, String, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.models.base.model_base import Base
from app.models.base_user_dto.audit_mixin import AuditMixin


class SentEmail(Base, AuditMixin):
    __tablename__ = "SentEmail"

    Id = Column(Integer, primary_key=True, autoincrement=True)
    FromEmail = Column(String(255), nullable=False)
    ToEmail = Column(Text, nullable=False)
    Subject = Column(String(500), nullable=True)
    Body = Column(Text, nullable=True)
    MessageId = Column(String(255), nullable=True)
    ParentMessageId = Column(String(255), nullable=True)
    ThreadId = Column(String(255), nullable=True)
    Status = Column(String(50), nullable=False, default="Sent")
    ScheduledTime = Column(DateTime, nullable=True)
    SentAt = Column(DateTime, nullable=True)

    # Foreign Key → Users table (who sent the email)
    UserId = Column(Integer, ForeignKey("Users.Id"), nullable=False)

    # Relationships
    User = relationship("User", back_populates="SentEmails")
    EmailReplies = relationship("EmailReply", back_populates="SentEmail", cascade="all, delete-orphan")