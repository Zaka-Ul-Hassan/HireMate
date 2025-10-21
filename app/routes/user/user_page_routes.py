# app\routes\user\user_page.py

from io import BytesIO
import os
from fastapi import APIRouter, Form, HTTPException,Request,Depends
from fastapi.responses import HTMLResponse, RedirectResponse, StreamingResponse
from fastapi.templating import Jinja2Templates
import pdfkit
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.services.authentication.auth_service import get_current_user
from app.utils.file_util import BASE_DIR, senitize_email_html
from app.models.user.user import User
from app.models.resume.resume_model import Resume
from app.models.email.email_model import Email
from app.db import get_db

templates = Jinja2Templates(directory="frontend/templates")

router = APIRouter()

@router.get("/.well-known/appspecific/com.chrome.devtools.json")
async def chrome_devtools_json():
    return {"message": "Not used"}

@router.get("/", response_class=HTMLResponse)
def show_login(request:Request):
    return templates.TemplateResponse("user/login.html", {
        "request": request,
        "hide_navbar": True,
        "hide_footer": True,
        "fullscreen": True,
        "hide_sidebar": True,
        "hide_resume": True
    })

@router.get("/register")
def show_register_form(request:Request):
    return templates.TemplateResponse("user/register.html", {
        "request": request,
        "hide_navbar": True,
        "hide_footer": True,
        "fullscreen": True,
        "hide_sidebar": True,
        "hide_resume":True

    })

@router.get("/dashboard", response_class=HTMLResponse)
def show_dashboard(
    request: Request,
    current_user: User = Depends(get_current_user)
    ):
    return templates.TemplateResponse("shared/dashboard/dashboard.html", {
        "request": request,
        "user": current_user,
        "hide_resume": True
    })

@router.get("/resume-upload", response_class=HTMLResponse)
async def upload_resume(
    request: Request,
    current_user : User = Depends(get_current_user)
    ):
    return templates.TemplateResponse("resume/resume-upload.html", {
        "request": request,
        "user": current_user,
        "hide_resume": False
        })

@router.get("/email/compose-email", response_class=HTMLResponse)
async def compose_email(
    request:Request,
    current_user: User = Depends(get_current_user)
    ):
    return templates.TemplateResponse("email/compose_email.html", {
        "request": request,
        "user" : current_user,
        "hide_resume": True
        })

@router.get("/email/inbox", response_class=HTMLResponse)
def email_inbox(request: Request,
                current_user : User = Depends(get_current_user),
                db:Session = Depends(get_db)
                ):
      
      emails = db.query(Email).order_by(desc(Email.Date)).all()

      # Remove cid: images from HTML
      for email in emails:
          if email.Html:
              email.Html = senitize_email_html(email.Html)

      return templates.TemplateResponse("email/email_inbox.html", {
        "request": request,
        "hide_resume": True,
        "user" : current_user,
        "emails": emails
    })

@router.get("/job/list", response_class=HTMLResponse)
async def job_list_page(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    resume = db.query(Resume).filter(Resume.UserId == current_user.Id).first()

    return templates.TemplateResponse("job/list.html", {
        "request": request,
        "user": current_user,
        "resume_id": resume.Id if resume else None,
        "hide_resume": not resume,
    })

@router.get("/forgot-password", response_class=HTMLResponse)
def forgot_password(
    request: Request
    ):
    return templates.TemplateResponse("user/forgot_password.html", {
        "request": request,
        "hide_navbar": True,
        "hide_footer": True,
        "fullscreen": True,
        "hide_sidebar": True
    })

@router.get("/reset-request-sent",response_class=HTMLResponse)
def reset_request_sent(request: Request, email: str):
    return templates.TemplateResponse("user/reset_request_sent.html", {
        "request": request,
        "email": email,
        "hide_navbar": True,
        "hide_footer": True,
        "fullscreen": True,
        "hide_sidebar": True
    })

@router.get("/reset-password", response_class=HTMLResponse)
def reset_password_form(request: Request, token: str):
    return templates.TemplateResponse(
        "user/reset_password.html",
        {
            "request": request,
            "token": token,
            "hide_navbar": True,
            "hide_footer": True,
            "fullscreen": True,
            "hide_sidebar": True
        }
    )

@router.get("/resume/{user_id}", response_class=HTMLResponse)
def profile_page(
    request: Request,
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Ensure user is accessing their own resume (or admin check)
    if current_user.Id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    resume = db.query(Resume).filter(Resume.UserId == user_id).first()

    return templates.TemplateResponse("resume/get_resume.html", {
        "request": request,
        "user": current_user,
        "resume": resume
    })

@router.get("/resume/download/{user_id}", name="download_resume_route")
def download_resume_route(user_id: int, db: Session = Depends(get_db)):
    # Fetch resume
    resume = db.query(Resume).filter(Resume.UserId == user_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    # Build clean HTML with only non-empty fields
    html_content = f"""
    <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.5; color: #000;">
            <h3 style="text-align: center;">{resume.FullName}</h3>
            <p style="text-align: center;">
                {resume.Email if resume.Email else ""} 
                {("|" if resume.Email and resume.PhoneNumber else "")} 
                {resume.PhoneNumber if resume.PhoneNumber else ""} 
                {("|" if (resume.Email or resume.PhoneNumber) and resume.Address else "")} 
                {resume.Address if resume.Address else ""}
            </p>
            <hr>
            
            {"<h3>Objective</h3><p>" + resume.Objective + "</p>" if resume.Objective else ""}
            {"<h3>Summary</h3><p>" + resume.Summary + "</p>" if resume.Summary else ""}
            
            {"<h3>Education</h3><ul>" +
             ("<li>" + resume.Education1 + "</li>" if resume.Education1 else "") +
             ("<li>" + resume.Education2 + "</li>" if resume.Education2 else "") +
             ("<li>" + resume.Education3 + "</li>" if resume.Education3 else "") +
             "</ul>" if resume.Education1 or resume.Education2 or resume.Education3 else ""}
            
            {"<h3>Skills</h3><p>" + resume.Skills + "</p>" if resume.Skills else ""}
            
            {"<h3>Experience</h3><p>" + resume.ExperienceDescription + "</p>" if resume.ExperienceDescription else ""}
            {"<p><strong>Total Experience:</strong> " + resume.TotalExperience + "</p>" if resume.TotalExperience else ""}
            
            {"<h3>Projects</h3><ul>" +
             ("<li>" + resume.Project1 + "</li>" if resume.Project1 else "") +
             ("<li>" + resume.Project2 + "</li>" if resume.Project2 else "") +
             "</ul>" if resume.Project1 or resume.Project2 else ""}
            
            {("<h3>Certifications</h3><p>" + resume.Certifications + "</p>") if resume.Certifications else ""}
            {("<h3>Languages</h3><p>" + resume.Languages + "</p>") if resume.Languages else ""}
        </body>
    </html>
    """

    # Configure pdfkit
    config = pdfkit.configuration(wkhtmltopdf=r"C:\Program Files\wkhtmltopdf\bin\wkhtmltopdf.exe")
    options = {
        'no-images': '',
        'disable-javascript': '',
        'disable-smart-shrinking': '',
        'enable-local-file-access': ''
    }

    # Generate PDF
    pdf_bytes = pdfkit.from_string(html_content, False, configuration=config, options=options)

    safe_name = resume.FullName.replace(" ", "_")
    return StreamingResponse(
        BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={safe_name}_Resume.pdf"}
    )

@router.get("/user/{user_id}", response_class=HTMLResponse)
def profile_page(
    request: Request,
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Ensure user is accessing their own resume (or admin check)
    if current_user.Id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    resume = db.query(Resume).filter(Resume.UserId == user_id).first()

    return templates.TemplateResponse("profile/edit_profile.html", {
        "request": request,
        "user": current_user,
        "resume": resume
    })
