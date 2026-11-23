# app/routes/job/job_route.py

import requests
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.user.user import User
from app.models.resume.resume_model import Resume
from app.schemas.job.job_schema import LinkedInJobFilterSchema
from app.schemas.response_schema import ResponseSchema
from app.services.authentication.auth_service import get_current_user
from app.services.job.job_service import get_job_recommendation
from app.services.job.job_scanner_service import fetch_jobs_from_api, get_linkedin_jobs_service
from load_env import APIFY_BASE_URL, APIFY_JOB_TOKEN, ACTOR_ENDPOINT

router = APIRouter()

@router.get("ai/recommend/{resume_id}")
def recommend_jobs(resume_id: int, db: Session = Depends(get_db)):
    try:
        result = get_job_recommendation(db, resume_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/api/recommend-jobs/recommend/jobs")
async def recommend_jobs_endpoint(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    page: int = 2,
):
    if not current_user.status or current_user.data is None:
        return JSONResponse(status_code=401, content=ResponseSchema(status=False, message="Unauthorized access", data=None).dict())

    user_id = current_user.data.Id
    resume = db.query(Resume).filter(
        Resume.UserId == user_id,
        Resume.IsDeleted == False
    ).first()

    if not resume:
        return ResponseSchema(status=False, message="Resume not found", data=None)

    jobs = fetch_jobs_from_api(db=db, resume_id=resume.Id, page=page)
    return jobs


@router.post("/jobs", response_model=ResponseSchema)
async def get_linkedin_jobs(
    filters: LinkedInJobFilterSchema,
    db: Session = Depends(get_db),                  
    current_user: User = Depends(get_current_user)
) -> ResponseSchema:

    if not current_user.status or current_user.data is None:
        return JSONResponse(status_code=401, content=ResponseSchema(status=False, message="Unauthorized access", data=None).dict())

    return await get_linkedin_jobs_service(filters.dict(), current_user, db)


# ─────────────────────────────────────────────────────────────
# Apify token / actor health-check  (admin use)
# GET /api/jobs/test-apify
# ─────────────────────────────────────────────────────────────
@router.get("/api/jobs/test-apify", tags=["Job"])
def test_apify_token(
    current_user: User = Depends(get_current_user)
):
    """
    Quick health-check for the Apify token and LinkedIn scraper actor.
    Returns the HTTP status and a human-readable verdict.
    If you get 403 here, the token in .env is invalid/expired.
    """
    if not current_user.status or current_user.data is None:
        return JSONResponse(status_code=401, content=ResponseSchema(status=False, message="Unauthorized access", data=None).dict())

    if not APIFY_JOB_TOKEN:
        return ResponseSchema(
            status=False,
            message="APIFY_JOB_TOKEN is not set in .env",
            data=None
        )

    url = f"{APIFY_BASE_URL}/{ACTOR_ENDPOINT}?token={APIFY_JOB_TOKEN}"

    # Minimal payload – 1 result so the check is fast
    payload = {
        "job_title": "Software Engineer",
        "job_location": "Pakistan",
        "number_records": 1,
    }

    try:
        response = requests.post(url, json=payload, timeout=30)
        status_code = response.status_code

        if status_code == 200:
            data = response.json()
            return ResponseSchema(
                status=True,
                message=f"Apify token is valid. Actor responded with {len(data)} result(s).",
                data={"http_status": status_code, "sample_count": len(data)}
            )
        elif status_code == 403:
            return ResponseSchema(
                status=False,
                message=(
                    "403 Forbidden — Apify token is invalid, expired, or lacks permission for this actor. "
                    "Generate a new token at https://console.apify.com/settings/integrations and update APIFY_JOB_TOKEN in .env"
                ),
                data={"http_status": status_code}
            )
        elif status_code == 401:
            return ResponseSchema(
                status=False,
                message="401 Unauthorized — Apify token was not accepted. Update APIFY_JOB_TOKEN in .env",
                data={"http_status": status_code}
            )
        elif status_code == 429:
            return ResponseSchema(
                status=False,
                message="429 Rate Limited — Too many requests to Apify. Wait a few minutes.",
                data={"http_status": status_code}
            )
        else:
            return ResponseSchema(
                status=False,
                message=f"Apify returned an unexpected status: {status_code}",
                data={"http_status": status_code, "body": response.text[:300]}
            )

    except requests.exceptions.Timeout:
        return ResponseSchema(
            status=False,
            message="Health-check timed out (30 s). Apify may be slow — try again.",
            data=None
        )
    except requests.exceptions.ConnectionError:
        return ResponseSchema(
            status=False,
            message="Could not reach Apify. Check your server's internet connection.",
            data=None
        )
    except Exception as e:
        return ResponseSchema(
            status=False,
            message=f"Unexpected error during health-check: {str(e)}",
            data=None
        )