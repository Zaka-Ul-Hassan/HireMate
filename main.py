# main.py

from fastapi import FastAPI,Request,HTTPException
from fastapi.responses import RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
import secrets

from app.routes.linkedIn import signIn_route
from app.routes.user import user_routes
from app.routes.email import email_route
from app.routes.resume import resume_processing_route
from app.routes.job import job_route
from app.routes.google import google_search_route
from app.routes.ai import cohere_chat_route, voice_agent_route
from app.routes.user import user_page_routes
from app.services.scheduler.scheduler import start_email_scheduler

app = FastAPI()

app.add_middleware(SessionMiddleware, secret_key = secrets.token_hex(32))

# exception handler
@app.exception_handler(HTTPException)
async def redirect_exception_handler(request:Request, exc:HTTPException):
    if exc.status_code == 303 and "Location" in exc.headers:
        return RedirectResponse(url=exc.headers["Location"], status_code=303)
    raise exc


# Mount static folder (for CSS, JS, images, HTML etc.)  
app.mount("/static", StaticFiles(directory="frontend/static"), name="static")

# Mount uploads folder (for profile images, etc.)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# CORS middleware (optional, useful for frontend JS calls)
origins = [
    "https://stenophyllous-jeane-perturbingly.ngrok-free.dev",
    "http://localhost:3000",  # if you also test locally
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,   # must include frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Starts the email fetch scheduler
@app.on_event("startup")
def on_startup():
    start_email_scheduler()


# API routes backend
app.include_router(user_routes.router,prefix="/api/users", tags=["Users"])
app.include_router(email_route.router, prefix="/api/email", tags=["Email"])
app.include_router(resume_processing_route.router, prefix="/api/resume-parser", tags=["Resume"])
app.include_router(cohere_chat_route.router, prefix="/api/ai-chat", tags=["AI"])
app.include_router(job_route.router, tags=["Job"])
app.include_router(google_search_route.router, prefix="/api/google-search", tags=["Google"])
app.include_router(voice_agent_route.router, prefix="/api/voice-agent", tags=["Voice Agent"])
app.include_router(signIn_route.router, prefix="/api/auth", tags=["LinkedIn Auth"]  )

# API routes frontend
app.include_router(user_page_routes.router)



