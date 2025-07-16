# app/services/email/email_service.py

import smtplib
import re
from typing import List
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.utils.smtp_config import SMTP_CONFIG

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
