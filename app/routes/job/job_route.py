# app\routes\job\job_route.py

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.user.user import User
from app.models.resume.resume_model import Resume
from app.services.authentication.auth_service import get_current_user
from app.services.job.job_service import get_job_recommendation
from app.services.job.job_scanner_service import fetch_jobs_from_api

router = APIRouter()

@router.get("ai/recommend/{resume_id}")
def recommend_jobs(resume_id: int, db:Session = Depends(get_db)):
    try:
        result = get_job_recommendation(db,resume_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@router.post("/api/recommend-jobs/recommend/jobs")
async def recommend_jobs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    page: int = 2,
):
    resume = db.query(Resume).filter(Resume.UserId == current_user.Id).first()

    if not resume:
        return JSONResponse(
            status_code=400,
            content={"detail": "Resume not found"}
        )

    jobs = fetch_jobs_from_api(db=db, resume_id=resume.Id, page=page)

    return {"jobs": jobs}


