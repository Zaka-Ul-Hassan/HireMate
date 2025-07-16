# app\schemas\email\email_schema.py

from pydantic import BaseModel, EmailStr
from typing import List

class EmailSchema(BaseModel):
    to : List[EmailStr] # list of emails
    subject : str
    body: str