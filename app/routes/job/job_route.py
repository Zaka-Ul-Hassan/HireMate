# app\routes\job\job_route.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app.services.job.job_service import get_job_recommendation
from app.services.job.job_scanner_service import fetch_jobs_from_api

router = APIRouter()

@router.get("/recommend/{resume_id}")
def recommend_jobs(resume_id: int, db:Session = Depends(get_db)):
    try:
        result = get_job_recommendation(db,resume_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@router.post("/recommend/{resume_id}")
async def search_jobs(resume_id: int, page: int = 1, db: Session = Depends(get_db)):
    try:
        result = fetch_jobs_from_api(db, resume_id, page)
        if "error" in result:
            raise HTTPException(status_code=404, detail=result["error"])
        return {"status": "success", "jobs": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))