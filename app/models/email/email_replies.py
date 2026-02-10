# app\models\email\email_replies.py

from sqlalchemy import Boolean, Column, Integer, String, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.models.base.model_base import Base
from app.models.base_user_dto.audit_mixin import AuditMixin


class EmailReply(Base, AuditMixin):
    __tablename__ = "EmailReply"


    Id = Column(Integer, primary_key=True, autoincrement=True)
    ReplyMessageId = Column(String(255), nullable=False, unique=True)
    InReplyTo = Column(String(255), nullable=False)
    FromEmail = Column(String(255), nullable=False)
    ToEmail = Column(Text, nullable=False)
    Subject = Column(String(500), nullable=True)
    Html = Column(Text, nullable=True)
    Text = Column(Text, nullable=True)
    IsSeen = Column(Boolean, default=False, nullable=False)

    # Foreign Key → SentEmail (which email this is a reply to)
    SentEmailId = Column(Integer,ForeignKey("SentEmail.Id", ondelete="CASCADE"),nullable=False)
    
    # Relationship
    SentEmail = relationship("SentEmail", back_populates="EmailReplies")