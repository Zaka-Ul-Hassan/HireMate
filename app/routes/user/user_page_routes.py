# app\routes\user\user_page.py
from fastapi import APIRouter,Request,Depends,status
from fastapi.responses import HTMLResponse,RedirectResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session

from app.services.authentication.auth_service import get_current_user
from app.utils.file_util import senitize_email_html
from app.models.user.user import User
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

@router.get("/logout")
def logout_user():
    response = RedirectResponse(url="/",status_code=status.HTTP_303_SEE_OTHER)
    response.delete_cookie("access_token")
    return response


@router.get("/resume", response_class=HTMLResponse)
async def upload_resume(request: Request):
    return templates.TemplateResponse("resume/resume.html", {
        "request": request,
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
      
      emails = db.query(Email).order_by(Email.Date).all()

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