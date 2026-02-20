# app\services\sendgrid_service.py

from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

from load_env import SENDGRID_API_KEY
from app.schemas.email.email_schema import SendGridEmailSchema
from app.schemas.response_schema import ResponseSchema

def send_email_service(payload: SendGridEmailSchema) -> ResponseSchema:
    try:
        message = Mail(
            from_email=payload.from_email,
            to_emails=payload.to,
            subject=payload.subject,
            html_content=payload.body
        )

        sg = SendGridAPIClient(SENDGRID_API_KEY)

        # Uncomment only if using a SendGrid EU subuser to comply with GDPR data residency 
        # (This ensures your email data is stored in Europe rather than the US)
        # sg.set_sendgrid_data_residency("eu")

        response = sg.send(message)

        return ResponseSchema(
            status=True,
            message="Email sent successfully",
            data={
                "status_code":response.status_code,
                "text":response.text
            }
        )
    
    except Exception as e:
        return ResponseSchema(
            status=False,
            message=f"failed to send email: {str(e)}"
        )