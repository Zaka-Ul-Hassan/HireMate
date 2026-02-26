# app/services/job/job_scanner_service.py

from typing import Any, Dict

import requests
from sqlalchemy.orm import Session
from app.models.resume.resume_model import Resume
from app.schemas.response_schema import ResponseSchema
from load_env import ACTOR_ENDPOINT, APIFY_BASE_URL, APIFY_JOB_TOKEN


def is_relevant_job(job_title: str, developer_type: str, skills: str) -> bool:
    title = job_title.lower()
    words = developer_type.lower().replace("-", " ").split()
    dt_keywords = [w for w in words if w not in {"developer", "engineer", "software", "senior", "junior"}]
    skill_keywords = [
        s.lower().strip() for s in skills.split(",")
        if s.strip() and s.lower() != "none"
    ]
    all_keywords = dt_keywords + skill_keywords
    return any(kw in title for kw in all_keywords)


def fetch_jobs_from_api(db: Session, resume_id: int, page: int = 2):
    resume = db.query(Resume).filter(Resume.Id == resume_id).first()
    if not resume:
        return ResponseSchema(status=False, message="Resume not found", data=None)

    search_terms = str(resume.DeveloperType or "").strip()
    location = str(resume.Country or "Pakistan").strip()

    url = "https://jsearch.p.rapidapi.com/search"
    params = {
        "query": f"{search_terms} in {location}",
        "page": str(page),
        "num_pages": "1",
        "country": "pk",
        "date_posted": "all"
    }
    headers = {
        "x-rapidapi-key": "cb8cbdb11dmsh7959b5125003ae2p13066cjsn62cf823afb95",
        "x-rapidapi-host": "jsearch.p.rapidapi.com"
    }

    try:
        response = requests.get(url, headers=headers, params=params)
        if response.status_code != 200:
            raise Exception(f"API Error: {response.status_code} - {response.text}")

        result = response.json()
        jobs = result if isinstance(result, list) else result.get("data", [])

        filtered_jobs = [
            job for job in jobs
            if isinstance(job, dict) and is_relevant_job(
                job.get("job_title", ""),
                resume.DeveloperType or "",
                resume.Skills or ""
            )
        ]

        if not filtered_jobs:
            return ResponseSchema(status=True, message="No relevant jobs found after pre-filtering.", data=[])

        normalized_jobs = [{
            "job_title": job.get("job_title", ""),
            "company_name": job.get("employer_name"),
            "tags": [job.get("job_employment_type", "Full-time")],
            "job_location": job.get("job_location", "Remote"),
            "posted_date": job.get("job_posted_at", "N/A"),
            "linkedin_job_url_cleaned": job.get("job_apply_link", "#"),
            "linkedin_company_url_cleaned": job.get("employer_website", "#")
        } for job in filtered_jobs]

        return normalized_jobs

    except Exception as e:
        return ResponseSchema(status=False, message=f"Something went wrong: {str(e)}", data=None)


# APIFY LinkedIn JOB — now accepts db session
async def get_linkedin_jobs_service(
    filters: Dict[str, Any],
    current_user,
    db: Session
) -> ResponseSchema:

    try:
        user_id = current_user.data.Id

        # Fetch resume from DB directly — no separate helper needed
        resume = db.query(Resume).filter(
            Resume.UserId == user_id,
            Resume.IsDeleted == False
        ).first()

        if not resume:
            return ResponseSchema(
                status=False,
                message="No resume found. Please upload your resume first.",
                data=None
            )

        url = f"{APIFY_BASE_URL}/{ACTOR_ENDPOINT}?token={APIFY_JOB_TOKEN}"

        payload = {
            "job_title":        filters.get("job_title") or resume.DeveloperType or "",
            "job_location":     filters.get("job_location")  or resume.Country or "",
            "company_name":     filters.get("company_name") or [],
            "number_records":   filters.get("number_records") or 5,
            "sort_by":          filters.get("sort_by") or "R",
            "date_posted":      filters.get("date_posted") or "",
            "experience_level": filters.get("experience_level") or [],
            "job_type":         filters.get("job_type") or [],
            "remote_type":      filters.get("remote_type") or [],
            "industry":         filters.get("industry") or [],
        }

        response = requests.post(url, json=payload)
        response.raise_for_status()

        data = response.json()

        if not data or len(data) == 0:
            return ResponseSchema(
                status=False,
                message="No jobs found for these filters. Try broadening your search.",
                data=[]
            )

        return ResponseSchema(
            status=True,
            message="LinkedIn jobs fetched successfully",
            data=data
        )

    except requests.exceptions.Timeout:
        return ResponseSchema(
            status=False,
            message="Request timed out. The job search service is slow — try again.",
            data=None
        )
    except requests.exceptions.ConnectionError:
        return ResponseSchema(
            status=False,
            message="Could not connect to the job search service. Check your network.",
            data=None
        )
    except requests.exceptions.HTTPError as e:
        return ResponseSchema(
            status=False,
            message=f"Job service returned an error: {e.response.status_code}",
            data=None
        )
    except Exception as e:
        return ResponseSchema(
            status=False,
            message=f"Unexpected error: {str(e)}",
            data=None
        )