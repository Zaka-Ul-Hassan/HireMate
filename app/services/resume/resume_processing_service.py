import requests
from fastapi import UploadFile
from sqlalchemy.orm import Session
from sqlalchemy import select
from datetime import datetime
import json

from app.models.resume.resume_model import Resume
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
    1. Identify the type of developer/engineer (e.g., ".NET Developer", "Python Developer", "Front End Developer", "Full Stack Developer",
    "Java Developer", "Mobile App Developer", "Data Engineer", "DevOps Engineer", "Machine Learning Engineer", "PHP Developer",
    "Network Engineer", "Cloud Engineer", "Cybersecurity Engineer", "Database Administrator") based on the skills mentioned in the resume.

        - If the resume includes skills like ASP.NET, C#, Entity Framework, SQL Server → classify as ".NET Developer".
        - If it includes Python, Django, Flask, FastAPI → classify as "Python Developer".
        - If it includes HTML, CSS, JavaScript, React, Angular → classify as "Front End Developer".
        - If it has both backend and frontend technologies (e.g., C#, ASP.NET + JavaScript/React) → classify as "Full Stack Developer".
        - If it includes Java, Spring Boot, Hibernate → classify as "Java Developer".
        - If it includes Kotlin, Java (Android), Swift, Flutter, React Native → classify as "Mobile App Developer".
        - If it includes ETL, Big Data, Spark, Hadoop, Apache Airflow → classify as "Data Engineer".
        - If it includes CI/CD, Docker, Kubernetes, Jenkins, Azure DevOps → classify as "DevOps Engineer".
        - If it includes TensorFlow, PyTorch, Scikit-learn, NLP, Deep Learning → classify as "Machine Learning Engineer".
        - If it includes PHP, Laravel, CodeIgniter, MySQL → classify as "PHP Developer".
        - If it includes Networking, Cisco, Routing, Switching, Firewalls, TCP/IP → classify as "Network Engineer".
        - If it includes AWS, Azure, GCP, Cloud Infrastructure, Terraform → classify as "Cloud Engineer".
        - If it includes Cybersecurity, Penetration Testing, SIEM, Firewalls, Threat Analysis → classify as "Cybersecurity Engineer".
        - If it includes Oracle, SQL Server, MySQL, PostgreSQL, Database Administration → classify as "Database Administrator".
        - If no matching skills are found → return as null.

    2. Extract other fields from the resume. If a field is not present, return it as null.

    3. For "FullName":
        - If a proper full name exists in the resume text → use it.
        - If not available → take the part before "@" in the Email remove numbers and special characters and use that as "FullName".

    Required Fields (in JSON format):
    {{
        "FullName": "", "Email": "", "PhoneNumber": "", "Address": "", "DateOfBirth": "", "Gender": "",
        "Nationality": "", "Country": "", "ProfileImage": "", "ResumeFile": "", "Summary": "", "Objective": "",
        "Education1": "", "Education2": "", "Education3": "", "Skills": "",
        "DeveloperType": "",  // e.g., ".NET Developer", "Python Developer", "Network Engineer"
        "ExperienceTitle": "", "ExperienceCompany": "", "ExperienceDuration": "", "TotalExperience": "", "ExperienceDescription": "",
        "Project1": "", "Project2": "", "Languages": "", "LinkedIn": "", "GitHub": "", "Certifications": ""
    }}
    """


    # Call AI service
    ai_response = requests.post(
        "http://127.0.0.1:8000/api/ai-chat/chat",
        json={"prompt": prompt}
    )
    if ai_response.status_code != 200:
        raise RuntimeError(f"AI chat service failed: {ai_response.status_code}")

    parsed_text = ai_response.json().get("response")
    if not parsed_text:
        raise ValueError("AI did not return any data")

    try:
        parsed = json.loads(parsed_text)
    except json.JSONDecodeError:
        raise ValueError("AI response could not be parsed as JSON")

    # Validate required fields
    email = parsed.get("Email")
    skills = parsed.get("Skills")
    developer_type = parsed.get("DeveloperType")
    if not email or not skills or not developer_type:
        raise ValueError("Missing required fields (Email, Skills, DeveloperType)")

    created_by = f"{user.FirstName} {user.MiddleName or ''} {user.LastName}"

    # Delete old resumes if updating
    if existing_resumes and update_existing:
        for resume_obj in existing_resumes:
            db.delete(resume_obj)
        db.commit()

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
        ResumeFile=file.filename,
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
