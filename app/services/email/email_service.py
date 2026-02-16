# app/services/email/email_service.py

from datetime import datetime
from email.utils import make_msgid
import smtplib
import re
import uuid
from app.models.email.email_settings import EmailSettings
from app.models.user.user import User
from typing import List
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from imap_tools import MailBox, AND
from sqlalchemy import func, or_
from sqlalchemy.orm import Session
from app.db import SessionLocal

from app.models.email.email_replies import EmailReply
from app.models.email.sent_emails import SentEmail
from app.routes.resume.resume_crud_route import get_resume_by_email
from app.schemas.email.email_schema import FetchEmailSchema, InboxEmail, RepliedEmailResponseSchema, SaveSentEmailSchema, SendClientEmailSchema, SendSystemEmailSchema, SentEmailResponseSchema
from app.schemas.pagination_schema import PaginatedResponseSchema, PaginationInputSchema
from app.schemas.response_schema import ResponseSchema
from app.services.ai.cohere_chat_service import cohere_chat
from app.services.email import email_settings_service
from app.services.resume.resume_crud_service import get_resume_by_email
from app.utils.security import decrypt, normalize_msgid
from load_env import SMTP_SERVER, SMTP_PORT, SMTP_EMAIL, SMTP_PASSWORD


EMAIL_REGEX = r"^[^@\s]+@[^@\s]+\.[^@\s]+$"

# Send Email Using Client Email Settings
def send_email(db: Session, payload: SendClientEmailSchema) -> ResponseSchema:

    # ---------- VALIDATION (unchanged) ----------
    if not payload.Recipient:
        return ResponseSchema(status=False, message="Recipient email list is empty")

    invalid_emails = [email for email in payload.Recipient if not re.match(EMAIL_REGEX, email)]
    if invalid_emails:
        return ResponseSchema(status=False, message=f"Invalid email(s): {', '.join(invalid_emails)}")

    if not payload.Subject.strip():
        return ResponseSchema(status=False, message="Email subject cannot be empty")

    if not payload.Body.strip():
        return ResponseSchema(status=False, message="Email body cannot be empty")

    user = db.query(User).filter(User.Id == payload.UserId).first()
    if not user:
        return ResponseSchema(status=False, message="User not found")

    settings = db.query(EmailSettings).filter(
        EmailSettings.UserId == payload.UserId,
        EmailSettings.IsDeleted == False
    ).first()
    if not settings:
        return ResponseSchema(status=False, message="Email settings not found")

    smtp_email = settings.EmailAddress
    smtp_password = decrypt(settings.Password)
    smtp_server = settings.SmtpServer
    smtp_port = settings.SmtpPort

    try:
        # ---------- COMPOSE EMAIL ----------
        message = MIMEMultipart()
        message["From"] = smtp_email
        message["To"] = ", ".join(payload.Recipient)
        message["Subject"] = payload.Subject

        # REAL RFC MESSAGE-ID
        message_id = make_msgid()
        message["Message-ID"] = message_id

        message.attach(MIMEText(payload.Body, "html"))

        # ---------- SEND ----------
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(smtp_email, smtp_password)
        server.sendmail(smtp_email, payload.Recipient, message.as_string())
        server.quit()

        # ---------- SAVE ----------
        sent_email = SentEmail(
            FromEmail=smtp_email,
            ToEmail=", ".join(payload.Recipient),
            Subject=payload.Subject,
            Body=payload.Body,
            MessageId=normalize_msgid(message_id),
            ParentMessageId=payload.ParentMessageId,
            ThreadId=str(uuid.uuid4()),
            Status="Sent",
            SentAt=datetime.utcnow(),
            UserId=payload.UserId,
            CreatedByUserId=payload.UserId
        )

        db.add(sent_email)
        db.commit()
        db.refresh(sent_email)

        return ResponseSchema(
            status=True,
            message="Email sent successfully",
            data={
                "Id": sent_email.Id,
                "MessageId": sent_email.MessageId,
                "ThreadId": sent_email.ThreadId
            }
        )

    except Exception as e:
        db.rollback()
        return ResponseSchema(status=False, message=str(e))


# Save only Replied Emails
def save_fetch_replied_emails(db: Session, user_id: int) -> ResponseSchema:

    try:
        settings = email_settings_service.get_email_settings_by_user_id(db, user_id)
        if not settings.status or not settings.data:
            return ResponseSchema(status=False, message="Email settings not found")

        email_address = settings.data.EmailAddress
        imap_server = settings.data.SmtpServer
        imap_password = settings.data.Password

        # ---------- LOAD SENT EMAIL IDS ----------
        sent_emails = (
            db.query(SentEmail)
            .filter(SentEmail.UserId == user_id, SentEmail.MessageId != None)
            .all()
        )

        if not sent_emails:
            return ResponseSchema(status=True, message="No sent emails found", data=[])

        sent_message_map = {
            normalize_msgid(se.MessageId): se.Id
            for se in sent_emails
        }

        replied_emails = []

        with MailBox(imap_server).login(email_address, imap_password) as mailbox:
            mailbox.folder.set("INBOX")

            for msg in mailbox.fetch(AND(deleted=False)):
                raw_in_reply_to = msg.headers.get("in-reply-to")
                raw_message_id = msg.headers.get("message-id")

                in_reply_to = normalize_msgid(raw_in_reply_to)
                message_id = normalize_msgid(raw_message_id)

                if not in_reply_to or not message_id:
                    continue

                # MATCH ONLY REAL REPLIES
                if in_reply_to not in sent_message_map:
                    continue

                # Avoid duplicates
                exists = db.query(EmailReply).filter(
                    EmailReply.ReplyMessageId == message_id
                ).first()
                if exists:
                    continue

                reply = EmailReply(
                    ReplyMessageId=message_id,
                    InReplyTo=in_reply_to,
                    FromEmail=msg.from_,
                    ToEmail=email_address,
                    Subject=msg.subject,
                    Html=msg.html,
                    Text=msg.text,
                    SentEmailId=sent_message_map[in_reply_to]
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
            message=f"Fetched {len(replied_emails)} replied emails",
            data=replied_emails
        )

    except Exception as e:
        db.rollback()
        return ResponseSchema(status=False, message=str(e))


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


# Generate AI-based email content for employer to hire candidate based on resume
def generate_email_content(
    db: Session,
    current_user: User,
    candidate_email: str
):

    employer = current_user.data

    employer_name = employer.Name
    employer_email = employer.Email
    employer_roles = ", ".join(employer.RoleNames) if employer.RoleNames else "Employer"

    # Get resume by email
    resume_response = get_resume_by_email(db, candidate_email)

    if not resume_response.status:
        return ResponseSchema(
            status=False,
            message="Candidate resume not found",
            data=None
        )

    resume = resume_response.data

    # Prepare AI Prompt
    prompt = f"""
You are an HR professional writing a hiring email.

Employer Details:
Name: {employer_name}
Email: {employer_email}
Role: {employer_roles}

Candidate Details:
Full Name: {resume.FullName or ""}
Email: {resume.Email or ""}
Developer Type: {resume.DeveloperType or ""}
Skills: {resume.Skills or ""}
Total Experience: {resume.TotalExperience or ""}
Summary: {resume.Summary or ""} 

Instructions:
- Write a professional and polite hiring email
- Employer is interested in hiring the candidate
- Mention candidate skills and experience briefly
- Invite candidate for further discussion/interview
- Keep tone formal and respectful
- End email with "Best regards" and employer name
- Do NOT include subject line
- Do NOT use markdown
- Return Html
"""

    # Call Cohere

    email_content = cohere_chat(prompt)

    if not email_content:
        return ResponseSchema(
            status=False,
            message="Failed to generate email content",
            data=None
        )
    
    return ResponseSchema(
        status=True,
        message="Email content generated successfully",
        data={
            "to": resume.Email,
            "from": employer_email,
            "employer_name": employer_name,
            "candidate_name": resume.FullName,
            "email_content": email_content
        }
    )



# Paractice
# Fetch System Emails
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


# Fetch Client Emails# Fetch All Inbox emails
def fetch_inbox_emails(db, user_id):
    emails = []
    
    try:
        settings =  email_settings_service.get_email_settings_by_user_id(db, user_id)
        if not settings.status or not settings.data:
            return ResponseSchema(status=False, message="Email settings not found")

        email = settings.data.EmailAddress
        imap_server = settings.data.SmtpServer
        imap_password = settings.data.Password

        if not all([email, imap_server, imap_password]):
            return ResponseSchema(status=False, message="Incomplete email settings")

        with MailBox(imap_server).login(email, imap_password) as mailbox:
            # Switch to Inbox folder
            try:
                mailbox.folder.set("Inbox")
            except Exception as e:
                return ResponseSchema(status=False, message=f"Cannot access Inbox: {e}")

            # Fetch all emails except deleted
            for msg in mailbox.fetch(AND(deleted=False)):
                message_id = msg.headers.get("message-id")
                sender = msg.from_
                in_reply_to = msg.headers.get("in-reply-to")

                if isinstance(message_id, tuple):
                    message_id = message_id[0]
                if isinstance(in_reply_to, tuple):
                    in_reply_to = in_reply_to[0]

                if not message_id or not sender:
                    continue

                emails.append(FetchEmailSchema(
                    MessageId=str(message_id).strip(),
                    Sender=str(sender).strip(),
                    Subject=msg.subject,
                    Date=msg.date.isoformat() if msg.date else None,
                    Text=msg.text,
                    Html=msg.html,
                    Folder="Inbox",
                    InReplyTo=str(in_reply_to).strip() if in_reply_to else None
                ))

        # Sort emails by date descending
        emails.sort(key=lambda x: x.Date or "", reverse=True)

        return ResponseSchema(
            status=True,
            message=f"Fetched {len(emails)} emails successfully",
            data=emails
        )

    except smtplib.SMTPAuthenticationError:
        return ResponseSchema(status=False, message="SMTP authentication failed")
    except smtplib.SMTPConnectError:
        return ResponseSchema(status=False, message="Unable to connect to IMAP server.")
    except Exception as e:
        return ResponseSchema(status=False, message=f"Failed to fetch emails: {str(e)}")
