# app\routes\user\user_page.py
from fastapi import APIRouter,Request,Depends,status
from fastapi.responses import HTMLResponse,RedirectResponse
from fastapi.templating import Jinja2Templates

from app.services.authentication.auth_service import get_current_user
from app.models.user import User

template = Jinja2Templates(directory="frontend/templates")

router = APIRouter()

@router.get("/", response_class=HTMLResponse)
def show_login(request:Request):
    return template.TemplateResponse("user/login.html", {
        "request": request,
        "hide_navbar": True,
        "hide_footer": True,
        "fullscreen": True,
        "hide_sidebar": True,
        "hide_resume": True
    })

@router.get("/register")
def show_register_form(request:Request):
    return template.TemplateResponse("user/register.html", {
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
    return template.TemplateResponse("shared/dashboard/dashboard.html", {
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
    return template.TemplateResponse("resume/resume.html", {
        "request": request,
        "hide_resume": False
        })
