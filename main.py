# main.py

from fastapi import FastAPI,Request,HTTPException
from fastapi.responses import JSONResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
import secrets

from app.db import get_db
from app.routes.linkedIn import signIn_route
from app.routes.qdrant import qdrant_route
from app.routes.user import user_routes
from app.routes.email import email_route
from app.routes.email import email_settings_route
from app.routes.resume import resume_crud_route, resume_processing_route
from app.routes.job import job_route
from app.routes.google import google_search_route
from app.routes.ai import cohere_chat_route, cohere_rag_route, voice_agent_route
from app.routes.user import user_page_routes
from app.schemas.response_schema import ResponseSchema
from app.services.authentication.superadmin_provider import SuperAdminProvider
from app.services.scheduler.scheduler import start_email_scheduler

app = FastAPI()

app.add_middleware(SessionMiddleware, secret_key = secrets.token_hex(32))

# Exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content=ResponseSchema(
            status=False,
            message="Something went wrong.",
            data=None
        ).dict()
    )

# Startup Event
# 1. Seed Superadmin into DB if not exists
@app.on_event("startup")
async def startup_tasks():
    db = next(get_db())
    SuperAdminProvider.seed_superadmin(db)
    db.close()

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
app.include_router(email_settings_route.router, prefix="/api/email-settings", tags=["Email Settings"])
app.include_router(resume_processing_route.router, prefix="/api/resume-parser", tags=["Resume"])
app.include_router(resume_crud_route.router, prefix="/api/resumes", tags=["Resume CRUD"])
app.include_router(cohere_chat_route.router, prefix="/api/ai-chat", tags=["AI"])
app.include_router(cohere_rag_route.router, prefix="/api/ai-rag", tags=["AI RAG"])
app.include_router(job_route.router, tags=["Job"])
app.include_router(google_search_route.router, prefix="/api/google-search", tags=["Google"])
app.include_router(voice_agent_route.router, prefix="/api/voice-agent", tags=["Voice Agent"])
app.include_router(signIn_route.router, prefix="/api/auth", tags=["LinkedIn Auth"])
app.include_router(qdrant_route.router, prefix="/api/qdrant", tags=["Qdrant"])

# API routes frontend
app.include_router(user_page_routes.router)



