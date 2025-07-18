# app\models\email\email_model.py

from sqlalchemy import Column, Integer, String, Text, DateTime,func
import datetime
from app.models.base.model_base import Base

class Email(Base):
    __tablename__ = "Emails"

    Id = Column(Integer, primary_key=True, autoincrement=True)
    MessageId = Column(String(255), unique=True, nullable=False)
    Sender = Column(String(255), nullable=False)
    Subject = Column(String(512), nullable=True)
    Date = Column(DateTime, default=datetime.datetime.utcnow)
    Html = Column(Text, nullable=True)
    Text = Column(Text, nullable=True)

   
