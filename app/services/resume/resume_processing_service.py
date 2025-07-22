# app/services/resume/resume_processing_service.py

import requests
from fastapi import UploadFile
from sqlalchemy.orm import Session
from sqlalchemy import select
from datetime import datetime
import json

from app.models.resume.resume_model import Resume

def extract_fields_and_store(file: UploadFile, db: Session):
    # Determine file type
    filename = file.filename.lower()
    if filename.endswith(".pdf"):
        endpoint = "http://127.0.0.1:8000/api/resume-parser/pdf-to-text"
    elif filename.endswith(".docx"):
        endpoint = "http://127.0.0.1:8000/api/resume-parser/docx-to-text"
    else:
        raise ValueError("Unsupported file format")

    # Upload file content
    file_content = file.file.read()
    files = {"file": (file.filename, file_content, file.content_type)}
    response = requests.post(endpoint, files=files)

    if response.status_code != 200:
        raise RuntimeError("Failed to extract text from file")

    extracted = response.json()
    extracted_text = extracted.get("text")

    if not extracted_text:
        raise ValueError("No text extracted from resume")

    # Prepare AI prompt
    prompt = f"""
    Extract the following fields from the resume text below. If a field is not present, return it as null.

    Resume Text:
    {extracted_text}

    Required Fields (JSON):
    {{
        "FullName": "", "Email": "", "PhoneNumber": "", "Address": "", "DateOfBirth": "", "Gender": "",
        "Nationality": "", "ProfileImage": "", "ResumeFile": "", "Summary": "", "Objective": "",
        "Education1": "", "Education2": "", "Education3": "", "Skills": "", "ExperienceTitle": "",
        "ExperienceCompany": "", "ExperienceDuration": "", "TotalExperience": "", "ExperienceDescription": "",
        "Project1": "", "Project2": "", "Languages": "", "LinkedIn": "", "GitHub": "", "Certifications": "",
        "IsActive": "true", "CreatedAt": "", "UpdatedAt": ""
    }}
    """

    ai_response = requests.get("http://127.0.0.1:8000/api/ai-chat/chat", params={"prompt": prompt})
    if ai_response.status_code != 200:
        raise RuntimeError("AI chat service failed")

    ai_data = ai_response.json()
    response_text = ai_data.get("response")
    parsed = json.loads(response_text)

    email = parsed.get("Email")
    skills = parsed.get("Skills")

    if not email:
        raise ValueError("Missing required field: Email")
    if not skills:
        raise ValueError("Missing required field: Skills")

    # Check for duplicate email
    existing = db.execute(select(Resume).where(Resume.Email == email)).scalar_one_or_none()
    if existing:
        raise ValueError("Email already exists in the system.")

    # Map and insert resume
    resume = Resume(
        FullName=parsed.get("FullName"),
        Email=email,
        PhoneNumber=parsed.get("PhoneNumber"),
        Address=parsed.get("Address"),
        DateOfBirth=parsed.get("DateOfBirth"),
        Gender=parsed.get("Gender"),
        Nationality=parsed.get("Nationality"),
        ProfileImage=parsed.get("ProfileImage"),
        ResumeFile=file.filename,
        Summary=parsed.get("Summary"),
        Objective=parsed.get("Objective"),
        Education1=parsed.get("Education1"),
        Education2=parsed.get("Education2"),
        Education3=parsed.get("Education3"),
        Skills=skills,
        ExperienceTitle=parsed.get("ExperienceTitle"),
        ExperienceCompany=parsed.get("ExperienceCompany"),
        ExperienceDuration=parsed.get("ExperienceDuration"),
        TotalExperience=parsed.get("TotalExperience"),
        ExperienceDescription=parsed.get("ExperienceDescription"),
        Project1=parsed.get("Project1"),
        Project2=parsed.get("Project2"),
        Languages=parsed.get("Languages"),
        LinkedIn=parsed.get("LinkedIn"),
        GitHub=parsed.get("GitHub"),
        Certifications=parsed.get("Certifications"),
        IsActive=True,
        CreatedAt=datetime.utcnow(),
        UpdatedAt=datetime.utcnow(),
    )

    db.add(resume)
    db.commit()
    return {"message": "Resume processed and saved successfully", "resume_id": resume.Id}
