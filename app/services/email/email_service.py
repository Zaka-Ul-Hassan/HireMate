# app/services/email/email_service.py

import smtplib
import re
import uuid
from pydantic import ValidationError
from typing import List, Optional
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from imap_tools import MailBox, AND
from sqlalchemy import func, or_
from sqlalchemy.orm import Session
from app.db import SessionLocal

from app.models.email.email_replies import EmailReply
from app.models.email.sent_emails import SentEmail
from app.schemas.email.email_schema import FetchEmailSchema, InboxEmail, RepliedEmailResponseSchema, SaveSentEmailSchema, SendClientEmailSchema, SendSystemEmailSchema, SentEmailResponseSchema
from app.schemas.pagination_schema import PaginatedResponseSchema, PaginationInputSchema
from app.schemas.response_schema import ResponseSchema
from app.services.email import email_settings_service
from load_env import SMTP_SERVER, SMTP_PORT, SMTP_EMAIL, SMTP_PASSWORD


EMAIL_REGEX = r"^[^@\s]+@[^@\s]+\.[^@\s]+$"

def send_email(to_email: List[str], subject: str, body: str):
    # Validation — let ValueError pass up to the route
    if not to_email:
        raise ValueError("Recipient email list is empty.")

    invalid_emails = [email for email in to_email if not re.match(EMAIL_REGEX, email)]
    if invalid_emails:
        raise ValueError(f"Invalid email(s): {', '.join(invalid_emails)}")

    if not subject.strip():
        raise ValueError("Email subject cannot be empty.")

    if not body.strip():
        raise ValueError("Email body cannot be empty.")

    try:
        # Compose message
        message = MIMEMultipart()
        message['From'] = SMTP_EMAIL
        message['To'] = ", ".join(to_email)
        message['Subject'] = subject
        message.attach(MIMEText(body, "plain"))

        # Connect and send
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SMTP_EMAIL, SMTP_PASSWORD)
        server.sendmail(SMTP_EMAIL, to_email, message.as_string())
        server.quit()

        return {"message": "Email sent successfully"}
    
    except Exception as e:
        # Let ValueErrors bubble up, only catch actual runtime errors here
        raise Exception(f"Failed to send email: {str(e)}")

def fetch_all_emails():
    messages = []

    try:
        with MailBox(SMTP_SERVER).login(
            SMTP_EMAIL,
            SMTP_PASSWORD,
            initial_folder="INBOX"
        ) as mailbox:

            for msg in mailbox.fetch():
                message_id = msg.headers.get("message-id")
                sender = msg.from_

                if not message_id or not sender:
                    continue

                messages.append({
                    "message_id": str(message_id).strip(),
                    "sender": str(sender).strip(),
                    "subject": msg.subject or "",
                    "date": msg.date.isoformat() if msg.date else None,
                    "text": msg.text or "",
                    "html": msg.html or "",
                })

        return messages

    except Exception as e:
        raise Exception(f"Failed to fetch emails: {str(e)}")

# Send System Email (Using Predefined SMTP Settings)
def send_system_email(payload: SendSystemEmailSchema) -> ResponseSchema:
    message = MIMEMultipart()
    message["From"] = SMTP_EMAIL
    message["To"] = ", ".join(payload.Recipient)
    message["Subject"] = payload.Subject
    message.attach(MIMEText(payload.Body, "html"))

    try:
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SMTP_EMAIL, SMTP_PASSWORD)
        server.sendmail(SMTP_EMAIL, payload.Recipient, message.as_string())
        server.quit()

        return ResponseSchema(
            status=True,
            message="System email sent successfully",
            data={"recipient": payload.Recipient},
        )

    except Exception as ex:
        return ResponseSchema(status=False, message=str(ex), data=None)

# Send Email using Client's Email Settings
def send_email(db: Session, payload: SendClientEmailSchema) -> ResponseSchema:
    settings = email_settings_service.get_email_settings_by_user_id(
        db, payload.UserId
    )
    if not settings.status or not settings.data:
        return ResponseSchema(status=False, message="Email settings not found")

    email = settings.data.EmailAddress
    smtp_server = settings.data.SmtpServer
    smtp_password = settings.data.Password
    smtp_port = settings.data.SmtpPort

    message_id = f"<{uuid.uuid4()}@leadpulse>"

    recipients = (
        [payload.Recipient]
        if isinstance(payload.Recipient, str)
        else payload.Recipient
    )

    message = MIMEMultipart()
    message["From"] = email
    message["To"] = ", ".join(recipients)
    message["Subject"] = payload.Subject
    message["Message-ID"] = message_id

    if payload.ParentMessageId:
        message["In-Reply-To"] = payload.ParentMessageId
        message["References"] = payload.ParentMessageId

    message.attach(MIMEText(payload.Body, "html"))

    try:
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(email, smtp_password)
        server.sendmail(email, recipients, message.as_string())
        server.quit()

        return ResponseSchema(
            status=True,
            message="Email sent successfully",
            data={"message_id": message_id},
        )

    except Exception as ex:
        return ResponseSchema(status=False, message=str(ex))
    
# Save Emails
def save_email(db: Session, payload: SaveSentEmailSchema) -> ResponseSchema:
    to_email = payload.ToEmail
    if isinstance(to_email, list):
        to_email = ", ".join(to_email)

    sent_email = SentEmail(
        UserId=payload.UserId,
        FromEmail=payload.FromEmail,
        ToEmail=to_email,
        Subject=payload.Subject,
        Body=payload.Body,
        MessageId=payload.MessageId,
        ParentMessageId=payload.ParentMessageId,
        ThreadId=payload.ThreadId,
        Status=payload.Status,
        SentAt=payload.SentAt,
        ScheduledTime=payload.ScheduledTime,
        CreatedByUserId=payload.UserId,
    )

    db.add(sent_email)
    db.commit()
    db.refresh(sent_email)

    return ResponseSchema(
        status=True,
        message="Email saved successfully",
        data={"sent_email_id": sent_email.Id},
    )

# Get Sent Email By UserId
def get_sent_email(
    db: Session,
    user_id: int,
    pagination: PaginationInputSchema
) -> ResponseSchema:

    skip = pagination.skipCount if pagination.skipCount is not None else 0
    limit = pagination.maxCount if pagination.maxCount is not None else 10
    search = pagination.search.strip() if pagination.search else None

    query = db.query(SentEmail).filter(SentEmail.UserId == user_id)
    
    # Search filter
    if search:
        search_value = f"%{search}%"
        query = query.filter(
            or_(    
                func.rtrim(SentEmail.Subject).ilike(search_value),
                func.rtrim(SentEmail.Body).ilike(search_value),
                func.rtrim(SentEmail.ToEmail).ilike(search_value),
            )
        )

    total_count = query.count()

    sent_emails = (
        query
        .order_by(SentEmail.CreatedAt.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    if not sent_emails:
        return ResponseSchema(
            status=False,
            message="No email found",
            data=None
        )

    # Map ORM objects to SentEmailItemSchema
    items = []
    for email in sent_emails:
        item = SentEmailResponseSchema(
            Id=email.Id,
            MessageId=email.MessageId,
            ParentMessageId=email.ParentMessageId,
            Subject=email.Subject,
            FromEmail=[email.FromEmail] if email.FromEmail else [],
            ToEmail=[email.ToEmail] if email.ToEmail else [],
            Status=email.Status,
            Body=email.Body,
            ThreadId=email.ThreadId,
            ScheduledTime=email.ScheduledTime,
            SentAt=email.SentAt,
            CreatedByUserId=email.CreatedByUserId,
            IsDeleted=email.IsDeleted,
            UserId=email.UserId,
            CreatedAt=email.CreatedAt
        )
        items.append(item)

    response = PaginatedResponseSchema(
        totalCount=total_count,
        skipCount=skip,
        maxCount=limit,
        item=items
    )

    return ResponseSchema(
        status=True,
        message="Sent emails fetched successfully",
        data=response
    )

# Fetch replied emails only for messages sent by this user and save them.
def get_header_value(value):
    if isinstance(value, tuple):
        return value[0].strip() if value[0] else None
    elif isinstance(value, str):
        return value.strip()
    return None

def save_fetch_replied_emails(db: Session, user_id: int) -> ResponseSchema:

    try:
        # Get user's email settings
        settings = email_settings_service.get_email_settings_by_user_id(db, user_id)
        if not settings.status or not settings.data:
            return ResponseSchema(status=False, message="Email settings not found")

        email_address = settings.data.EmailAddress
        imap_server = settings.data.SmtpServer
        imap_password = settings.data.Password

        if not all([email_address, imap_server, imap_password]):
            return ResponseSchema(status=False, message="Incomplete email settings")

        # Get all sent emails' MessageIds for this user
        sent_message_ids = [
            se.MessageId.strip()
            for se in db.query(SentEmail.MessageId).filter(
                SentEmail.UserId == user_id,
                SentEmail.MessageId != None
            ).all()
        ]
        if not sent_message_ids:
            return ResponseSchema(status=True, message="No sent emails found", data=[])

        sent_message_map = {
            se.MessageId.strip(): se.Id
            for se in db.query(SentEmail.Id, SentEmail.MessageId).filter(
                SentEmail.UserId == user_id,
                SentEmail.MessageId != None
            ).all()
        }

        # Connect to IMAP and fetch only emails whose In-Reply-To is in sent_message_ids
        replied_emails = []
        with MailBox(imap_server).login(email_address, imap_password) as mailbox:
            try:
                mailbox.folder.set("INBOX")  # Correct folder selection
            except Exception as e:
                return ResponseSchema(
                    status=False,
                    message=f"Cannot access INBOX folder: {e}",
                    data=None
                )

            # Fetch all inbox emails and filter replies
            for msg in mailbox.fetch(AND(deleted=False)):
                in_reply_to = get_header_value(msg.headers.get("in-reply-to"))
                message_id = get_header_value(msg.headers.get("message-id"))
                if not in_reply_to or not message_id:
                    continue

                if in_reply_to not in sent_message_map:
                    continue  # Not a reply to our sent emails

                # Check if reply already exists
                existing_reply = db.query(EmailReply).filter(
                    EmailReply.ReplyMessageId == message_id
                ).first()
                if existing_reply:
                    continue

                # Save reply
                sent_email_id = sent_message_map[in_reply_to]
                reply = EmailReply(
                    ReplyMessageId=message_id,
                    InReplyTo=in_reply_to,
                    FromEmail=msg.from_,
                    ToEmail=email_address,
                    Subject=msg.subject,
                    Html=msg.html,
                    Text=msg.text,
                    SentEmailId=sent_email_id
                )
                db.add(reply)
                replied_emails.append(
                    FetchEmailSchema(
                        MessageId=message_id,
                        Sender=msg.from_,
                        Subject=msg.subject,
                        Date=msg.date.isoformat() if msg.date else None,
                        Text=msg.text,
                        Html=msg.html,
                        Folder="INBOX",
                        InReplyTo=in_reply_to
                    )
                )

            if replied_emails:
                db.commit()

        return ResponseSchema(
            status=True,
            message=f"Fetched and saved {len(replied_emails)} replied emails successfully",
            data=replied_emails
        )

    except Exception as e:
        db.rollback()
        return ResponseSchema(
            status=False,
            message=f"Failed to fetch replied emails: {str(e)}",
            data=None
        )

# Get all replies with sent email
def get_replied_emails_with_sent(
    db: Session,
    user_id: int,
    pagination: PaginationInputSchema
) -> ResponseSchema:
    skip = pagination.skipCount if pagination.skipCount is not None else 0
    limit = pagination.maxCount if pagination.maxCount is not None else 10
    search = pagination.search.strip() if pagination.search else None

    # Base query: join SentEmail -> EmailReply
    query = db.query(EmailReply).join(EmailReply.SentEmail).filter(SentEmail.UserId == user_id)

    # Search filter
    if search:
        search_value = f"%{search}%"
        query = query.filter(
            or_(
                func.rtrim(SentEmail.Subject).ilike(search_value),
                func.rtrim(SentEmail.Body).ilike(search_value),
                func.rtrim(EmailReply.Subject).ilike(search_value),
                func.rtrim(EmailReply.Text).ilike(search_value),
            )
        )

    total_count = query.count()

    # Pagination
    replied_emails = query.order_by(EmailReply.CreatedAt.desc()).offset(skip).limit(limit).all()

    if not replied_emails:
        return ResponseSchema(status=False, message="No email found")

    items = []
    for reply in replied_emails:
        sent_email = reply.SentEmail
        item = RepliedEmailResponseSchema(
            Id=reply.Id,
            ReplyMessageId=reply.ReplyMessageId,
            FromEmail=reply.FromEmail,
            RepliedEmailHtml=reply.Html,
            RepliedEmailText=reply.Text,
            RepliedEmailCreatedAt=reply.CreatedAt,
            IsSeen=reply.IsSeen,
            SentEmailId=sent_email.Id,
            InReplyTo=reply.InReplyTo,
            MessageId=sent_email.MessageId,
            ToEmail=reply.ToEmail,
            SentEmailBody=sent_email.Body,
            SentEmailCreatedAt=sent_email.CreatedAt,
            SentEmailAt=sent_email.SentAt,
            SentEmailCreatedByUserId=sent_email.UserId,
            Subject=reply.Subject
        )
        items.append(item)

    response = PaginatedResponseSchema(
        totalCount=total_count,
        skipCount=skip,
        maxCount=limit,
        item=items
    )

    return ResponseSchema(
        status=True,
        message="Replied emails fetched successfully",
        data=response
    )
