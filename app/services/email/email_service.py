# app/services/email/email_service.py

import smtplib
import re
from pydantic import ValidationError
from typing import List
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from imap_tools import MailBox

from sqlalchemy.orm import Session
from app.db import SessionLocal

from app.models.email.email_model import Email
from app.schemas.email.email_schema import InboxEmail

from app.utils.smtp_config import SMTP_CONFIG
from app.utils.imap_config import IMAP_CONFIG


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
        message['From'] = SMTP_CONFIG["EMAIL"]
        message['To'] = ", ".join(to_email)
        message['Subject'] = subject
        message.attach(MIMEText(body, "plain"))

        # Connect and send
        server = smtplib.SMTP(SMTP_CONFIG["SMTP_SERVER"], SMTP_CONFIG["SMTP_PORT"])
        server.starttls()
        server.login(SMTP_CONFIG["EMAIL"], SMTP_CONFIG["PASSWORD"])
        server.sendmail(SMTP_CONFIG["EMAIL"], to_email, message.as_string())
        server.quit()

        return {"message": "Email sent successfully"}
    
    except Exception as e:
        # Let ValueErrors bubble up, only catch actual runtime errors here
        raise Exception(f"Failed to send email: {str(e)}")


def fetch_all_emails():
    messages = []

    try:
        with MailBox(IMAP_CONFIG["IMAP_SERVER"]).login(
            IMAP_CONFIG["EMAIL"],
            IMAP_CONFIG["PASSWORD"],
            initial_folder="INBOX"
        ) as mailbox:

            for msg in mailbox.fetch():
                # Extract and validate fields
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

    except Exception as e:
        return {"error": str(e)}

    return messages


def store_emails_in_db():
    emails_data = fetch_all_emails()

    if isinstance(emails_data, dict) and "error" in emails_data:
        return {"sucess": False, "message": emails_data["error"]}
    

    db:Session = SessionLocal()

    inserted = 0
    skipped = 0

    for email in emails_data:
        try:
            validated_email = InboxEmail(**email)

            # Avoid duplicates
            if db.query(Email).filter_by(MessageId=validated_email.message_id).first():
                skipped += 1
                continue

            email_model = Email(
                MessageId=validated_email.message_id,
                Sender=validated_email.sender,
                Subject=validated_email.subject,
                Date=validated_email.date,
                Text=validated_email.text,
                Html=validated_email.html
            )

            db.add(email_model)
            inserted += 1

        except ValidationError as ve:
            print(f"Skipping invalid email due to validation: {ve}")
            skipped += 1
        except Exception as e:
            print(f"Skipping invalid email due to error: {e}")
            skipped += 1

    db.commit()
    db.close()

    return {
        "success":True,
        "inserted":inserted,
        "skipped": skipped,
        "message": f"{inserted} emails stored, {skipped} skipped"
    }









