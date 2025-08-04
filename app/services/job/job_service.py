# app\services\job\job_service.py

from sqlalchemy.orm import Session
import requests

from app.models.resume.resume_model import Resume


# from fastapi import FastAPI
# from serpapi import GoogleSearch
# from typing import List
# import os
# pip install fastapi uvicorn beautifulsoup4 requests google-search-results
# 
# app = FastAPI()

# SERP_API_KEY = "YOUR_SERPAPI_KEY"  # Replace this with your actual key

def get_job_recommendation(db:Session, resume_id: int):
    resume = db.query(Resume).filter(Resume.Id == resume_id).first()
    if not resume:
        return {"error": "Resume not found"}
    
    prompt = f"""
    You are a job-matching assistant.

    TASK:
    You are a job-finding assistant.

    Using the following resume data, search **Rozee.pk and LinkedIn** for live job postings where companies are currently hiring.

    Match based on:
    - Skills
    - Experience
    - Technologies
    - Location (Pakistan)

    Rules:
    - Return only 5 results.
    - **Each job must have a different title.**
    - Only include jobs that are currently active and accepting applications.
    - Provide only **direct apply links** that go to the actual job pages.
    - Do not invent links. If a real link cannot be found, skip that job.
    - Format the output as raw URLs (not Markdown).

    Resume:
    Name: {resume.FullName}
    Email: {resume.Email}
    Skills: {resume.Skills}
    Languages: {resume.Languages}
    Experience Title: {resume.ExperienceTitle}
    Experience Duration: {resume.ExperienceDuration}
    Address: {resume.Address}

    """

    response = requests.post(
        "http://127.0.0.1:8000/api/ai-chat/chat",
        json={"prompt": prompt }
    )

    if response.status_code == 200:
        return response.json()
    else:
        return {
            "error":"Failed to fetch job from AI",
            "status_code": response.status_code,
            "details": response.text,
            }