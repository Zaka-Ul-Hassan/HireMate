# app\schemas\email\email_schema.py

from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Union, List
from datetime import datetime
from uuid import UUID

class EmailSchema(BaseModel):
    to : List[EmailStr] 
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




class SendSystemEmailSchema(BaseModel):
    Recipient: list[EmailStr] = Field(..., description="Recipient email address")
    Subject: str = Field(..., description="Subject of the email")
    Body: str = Field(..., description="Body content of the email")

class SendClientEmailSchema(SendSystemEmailSchema):
    UserId: int = Field(..., description="ID of the user sending the email")
    ParentMessageId: Optional[str] = None


class SaveSentEmailSchema(BaseModel):
    UserId: int
    FromEmail: str
    ToEmail: Union[str, list[str]]
    Subject: Optional[str] = None
    Body: Optional[str] = None
    MessageId: Optional[str] = None
    Status: str = "Sent"
    SentAt: Optional[datetime] = None
    ScheduledTime: Optional[datetime] = None
    ParentMessageId: Optional[str] = None
    ThreadId: UUID 


class EmailContentSchema(BaseModel):
    body: str = Field(..., description="Email body (HTML or text)")


class EmailSequenceSchema(BaseModel):
    email_1: EmailContentSchema
    email_2: EmailContentSchema
    email_3: EmailContentSchema

class SendEmailSequenceSchema(BaseModel):
    UserId: int
    ToEmail: str
    Subject : str
    Emails: EmailSequenceSchema


class SentEmailResponseSchema(BaseModel):
    Id: int
    MessageId: str
    ParentMessageId: Optional[str] = None
    Subject: str
    FromEmail: Optional[list] = None
    ToEmail: Optional[list] = None
    Status: str
    Body: str
    ThreadId: str
    ScheduledTime: Optional[datetime] = None
    SentAt: Optional[datetime] = None
    CreatedByUserId: Optional[int] = None
    IsDeleted: bool
    UserId: int
    CreatedAt: datetime


class FetchEmailSchema(BaseModel):
    MessageId: Optional[str] = None
    Sender: Optional[str] = None
    Subject: Optional[str] = None
    Date: Optional[str] = None
    Text: Optional[str] = None
    Html: Optional[str] = None
    Folder: Optional[str] = None
    InReplyTo: Optional[str] = None




class RepliedEmailResponseSchema(BaseModel):
    Subject: Optional[str] = None
    Id: int
    ReplyMessageId: str
    FromEmail: str
    RepliedEmailHtml: Optional[str] = None
    RepliedEmailText: Optional[str] = None
    RepliedEmailCreatedAt : Optional[datetime] = None
    IsSeen : bool
    SentEmailId: int
    InReplyTo : str
    MessageId : str
    ToEmail: str
    SentEmailBody: Optional[str] = None
    SentEmailCreatedAt : Optional[datetime] = None
    SentEmailAt : Optional[datetime] = None
    SentEmailCreatedByUserId : int
    
    class Config:
        orm_mode = True