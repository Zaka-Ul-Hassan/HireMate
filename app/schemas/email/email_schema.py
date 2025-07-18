# app\schemas\email\email_schema.py

from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

class EmailSchema(BaseModel):
    to : List[EmailStr] # list of emails
    subject : str
    body: str


class InboxEmail(BaseModel):
    message_id:str
    sender: EmailStr
    subject: Optional[str]
    date: Optional[datetime] = None
    text: Optional[str] = None
    html: Optional[str] = None


    class Config:
        orm_mode = True