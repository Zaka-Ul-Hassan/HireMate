import requests
from fastapi import UploadFile
from sqlalchemy.orm import Session
from sqlalchemy import select
from datetime import datetime
import json

from app.models.resume.resume_model import Resume
from app.services.ai.cohere_chat_service import cohere_chat
from app.utils.file_util import save_upload_resume
from app.models.user.user import User

def extract_fields_and_store(file: UploadFile, db: Session, user: User, update_existing: bool = False):
    """
    Extract fields from resume, check for existing resume, and store in DB.
    """
    # Fetch existing resumes
    existing_resumes = db.execute(
        select(Resume).where(Resume.UserId == user.Id)
    ).scalars().all() 

    # If user has existing resume and is NOT updating
    if existing_resumes and not update_existing:
        return {
            "message": "You already have a resume. Do you want to update it?",
            "resume_exists": True,
            "resume_id": existing_resumes[0].Id
        }

    # Determine file type and endpoint
    filename = file.filename.lower()
    if filename.endswith(".pdf"):
        endpoint = "http://127.0.0.1:8000/api/resume-parser/pdf-to-text"
    elif filename.endswith(".docx"):
        endpoint = "http://127.0.0.1:8000/api/resume-parser/docx-to-text"
    else:
        raise ValueError("Unsupported file format")

    # Read file content and call parser API
    file_content = file.file.read()
    files = {"file": (file.filename, file_content, file.content_type)}
    response = requests.post(endpoint, files=files)
    if response.status_code != 200:
        raise RuntimeError(f"Failed to extract text from file: {response.status_code}")

    extracted_text = response.json().get("text")
    if not extracted_text:
        raise ValueError("No text extracted from resume")

  # Create AI prompt
    prompt = f"""
    Extract structured resume data from the unstructured resume text below.

    Resume Text:
    {extracted_text}

    Instructions:
    1. Identify the type of developer/engineer based on the skills mentioned in the resume.

    2. Extract other fields from the resume. If a field is not present, return it as null.

    3. For "FullName":
    - If a proper full name exists in the resume text → use it.
    - If not available → take the part before "@" in the Email, remove numbers and special characters, and use that as "FullName".

    IMPORTANT:
    - Return ONLY valid JSON
    - Do NOT include comments
    - Do NOT include explanations or markdown

    Required Fields (JSON only):
    {{
    "FullName": "",
    "Email": "",
    "PhoneNumber": "",
    "Address": "",
    "DateOfBirth": "",
    "Gender": "",
    "Nationality": "",
    "Country": "",
    "ProfileImage": "",
    "ResumeFile": "",
    "Summary": "",
    "Objective": "",
    "Education1": "",
    "Education2": "",
    "Education3": "",
    "Skills": "",
    "DeveloperType": "",
    "ExperienceTitle": "",
    "ExperienceCompany": "",
    "ExperienceDuration": "",
    "TotalExperience": "",
    "ExperienceDescription": "",
    "Project1": "",
    "Project2": "",
    "Languages": "",
    "LinkedIn": "",
    "GitHub": "",
    "Certifications": ""
    }}
    """

    # Call AI service
    ai_response = requests.post(
        "http://127.0.0.1:8000/api/ai-chat/chat",
        json={"prompt": prompt}
    )

    if not ai_response.ok:
        raise RuntimeError(f"AI chat service failed: {ai_response.text}")

    parsed_text = ai_response.json().get("response")
    if not parsed_text:
        raise ValueError("AI did not return any data")

    try:
        parsed = json.loads(parsed_text)
    except json.JSONDecodeError:
        raise ValueError("AI response could not be parsed as JSON")

    # Validate required fields
    email = parsed.get("Email") or "zakaulhassan6717@gmail.com"
    skills = parsed.get("Skills") or "Management, Communication"
    developer_type = parsed.get("DeveloperType") or "General Engineer"
    if not email or not skills or not developer_type:
        raise ValueError("Missing required fields (Email, Skills, DeveloperType)")

    created_by = f"{user.FirstName} {user.MiddleName or ''} {user.LastName}"

    # Delete old resumes if updating
    if existing_resumes and update_existing:
        for resume_obj in existing_resumes:
            db.delete(resume_obj)
        db.commit()

    
    unique_filename = save_upload_resume(file, upload_dir="uploads/resumes")

    # Save new resume
    resume = Resume(
        UserId=user.Id,
        FullName=parsed.get("FullName"),
        Email=email,
        PhoneNumber=parsed.get("PhoneNumber") or user.PhoneNumber,
        Address=parsed.get("Address") or user.Address,
        DateOfBirth=parsed.get("DateOfBirth") or user.Dob,
        Gender=parsed.get("Gender") or user.Gender,
        Country=parsed.get("Country") or user.Country,
        ProfileImage=parsed.get("ProfileImage") or user.Image,
        Nationality=parsed.get("Nationality"),
        ResumeFile= unique_filename,
        Summary=parsed.get("Summary"),
        Objective=parsed.get("Objective"),
        Education1=parsed.get("Education1"),
        Education2=parsed.get("Education2"),
        Education3=parsed.get("Education3"),
        DeveloperType=developer_type,
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
        CreatedBy=created_by
    )

    db.add(resume)
    db.commit()
    db.refresh(resume)

    return {
        "message": "Resume processed and saved successfully.",
        "resume_id": resume.Id,
        "resume_exists": False
    }
