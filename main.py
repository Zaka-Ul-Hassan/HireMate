# main.py

from fastapi import FastAPI,Request,HTTPException
from fastapi.responses import RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

from app.routes.user import user_routes
from app.routes.email import email_route
from app.routes.resume import resume_processing_route
from app.routes.ai import cohere_chat_route
from app.routes.user import user_page_routes
from app.services.scheduler.scheduler import start_email_scheduler

app = FastAPI()

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
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:8000"],
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

# API routes frontend
app.include_router(user_page_routes.router)



