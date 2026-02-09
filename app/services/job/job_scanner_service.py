# app\services\job\job_scanner_service.py

import requests
from sqlalchemy.orm import Session
from app.models.resume.resume_model import Resume

def is_relevant_job(job_title: str, developer_type: str, skills: str) -> bool:
    title = job_title.lower()

    # Extract keywords from developer type
    words = developer_type.lower().replace("-", " ").split()
    dt_keywords = [w for w in words if w not in {"developer", "engineer", "software", "senior", "junior"}]

    # Extract keywords from skills
    skill_keywords = [
        s.lower().strip() for s in skills.split(",")
        if s.strip() and s.lower() != "none"
    ]

    all_keywords = dt_keywords + skill_keywords

    return any(kw in title for kw in all_keywords)


# def fetch_jobs_from_api(db: Session, resume_id: int, page: int = 2):
#     resume = db.query(Resume).filter(Resume.Id == resume_id).first()
#     if not resume:
#         return {"error": "Resume not found"}

#     search_terms = str(resume.DeveloperType or "").strip()
#     location = "Pakistan"

#     url = "https://linkedin-jobs-search.p.rapidapi.com/"
#     payload = {
#         "search_terms": search_terms,
#         "location": location,
#         "page": str(page)
#     }

#     headers = {
#         "x-rapidapi-key": "e2a86bac4cmsh58dd16b827ce10fp1271a6jsn05c34d42c369",
#         "x-rapidapi-host": "linkedin-jobs-search.p.rapidapi.com",
#         "Content-Type": "application/json"
#     }

#     try:
#         response = requests.post(url, json=payload, headers=headers)

#         if response.status_code != 200:
#             raise Exception(f"API Error: {response.status_code} - {response.text}")

#         result = response.json()

#         # Handle different data shapes (list or dict)
#         if isinstance(result, list):
#             jobs = result
#         elif isinstance(result, dict):

#             jobs = result.get("jobs", [])
#         else:
#             jobs = []

#         # Pre-filter jobs
#         filtered_jobs = [
#             job for job in jobs
#             if isinstance(job, dict) and is_relevant_job(
#                 job.get("job_title", ""),
#                 resume.DeveloperType or "",
#                 resume.Skills or ""
#             )
#         ]

#         if not filtered_jobs:
#             return {"message": "No relevant jobs found after pre-filtering."}

#         return filtered_jobs

#     except Exception as e:
#         return {"error": f"Something went wrong: {str(e)}"}


def fetch_jobs_from_api(db: Session, resume_id: int, page: int = 2):
    resume = db.query(Resume).filter(Resume.Id == resume_id).first()
    if not resume:
        return {"error": "Resume not found"}

    search_terms = str(resume.DeveloperType or "").strip()
    location = str(resume.Country or "Pakistan").strip()


    url = "https://jsearch.p.rapidapi.com/search"
    params = {
        "query": f"{search_terms} in {location}",
        "page": str(page),
        "num_pages": "1",
        "country": "pk",  # use ISO country code for Pakistan
        "date_posted": "all"
    }

    headers = {
        # "x-rapidapi-key": "e2a86bac4cmsh58dd16b827ce10fp1271a6jsn05c34d42c369",
        "x-rapidapi-key": "cb8cbdb11dmsh7959b5125003ae2p13066cjsn62cf823afb95",
        "x-rapidapi-host": "jsearch.p.rapidapi.com"
    }

    try:
        response = requests.get(url, headers=headers, params=params)

        if response.status_code != 200:
            raise Exception(f"API Error: {response.status_code} - {response.text}")

        result = response.json()

        # Handle different data shapes (list or dict)
        if isinstance(result, list):
            jobs = result
        elif isinstance(result, dict):

            jobs = result.get("data", [])
        else:
            jobs = []

        # Pre-filter jobs
        filtered_jobs = [
            job for job in jobs
            if isinstance(job, dict) and is_relevant_job(
                job.get("job_title", ""),
                resume.DeveloperType or "",
                resume.Skills or ""
            )
        ]

        if not filtered_jobs:
            return {"message": "No relevant jobs found after pre-filtering."}
        
        normalized_jobs = []
        for job in filtered_jobs:
            normalized_jobs.append({
                "job_title": job.get("job_title", ""),
                "company_name": job.get("employer_name"),
                "tags": [job.get("job_employment_type", "Full-time")],
                "job_location": job.get("job_location", "Remote"),
                "posted_date": job.get("job_posted_at", "N/A"),
                "linkedin_job_url_cleaned": job.get("job_apply_link", "#"),
                "linkedin_company_url_cleaned": job.get("employer_website", "#")
            })

        return normalized_jobs

    except Exception as e:
        return {"error": f"Something went wrong: {str(e)}"}