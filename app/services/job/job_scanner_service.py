# app\services\job\job_scanner_service.py

import requests
from sqlalchemy.orm import Session

from app.models.resume.resume_model import Resume

def fetch_jobs_from_api(db: Session, resume_id: int, page:int = 1):
    resume = db.query(Resume).filter(Resume.Id == resume_id).first()
    if not resume:
        return {"Error": "Resume not found"}
    
    search_terms = f"{resume.DeveloperType}"
    location = "Pakistan"

    url = "https://linkedin-jobs-search.p.rapidapi.com/"

    paylaod = {
        "search_terms": search_terms,
        "location": location,
        "page": str(page)
    }

    headers = {
        "x-rapidapi-key": "e2a86bac4cmsh58dd16b827ce10fp1271a6jsn05c34d42c369",
	    "x-rapidapi-host": "linkedin-jobs-search.p.rapidapi.com",
	    "Content-Type": "application/json"
    }

    response = requests.post(url, json=paylaod, headers=headers)

    if response.status_code != 200:
        raise Exception(f"API Error: {response.status_code} - {response.text}")
    
    return response.json()