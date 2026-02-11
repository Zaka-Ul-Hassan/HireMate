# app\services\resume\resume_processing_service.py

from fastapi import UploadFile
from sqlalchemy.orm import Session
from sqlalchemy import select
from datetime import datetime
import json
from qdrant_client.models import PointStruct

from app.models.resume.resume_model import Resume
from app.services.ai.cohere_chat_service import cohere_chat
from app.services.ai.cohere_rag_service import generate_embeddings
from app.services.qdrant.qdrant_service import delete_point, upsert_points
from app.utils.file_util import save_upload_resume
from app.models.user.user import User

from fastapi import UploadFile
from sqlalchemy.orm import Session
from sqlalchemy import select
from datetime import datetime
import json
from qdrant_client.models import PointStruct

from app.schemas.response_schema import ResponseSchema
from app.models.resume.resume_model import Resume
from app.models.user.user import User
from app.services.ai.cohere_rag_service import generate_embeddings
from app.services.qdrant.qdrant_service import delete_point, upsert_points
from app.services.resume.resume_parser_service import (
    extract_text_from_pdf,
    extract_text_from_docx
)
from app.utils.file_util import save_upload_resume


async def extract_fields_and_store(
    file: UploadFile,
    db: Session,
    user: User,
    update_existing: bool = False
):
    """
    Extract fields from resume, check for existing resume, and store in DB.
    Uses functions (NOT APIs) and ResponseSchema for every response.
    """

    try:
        user_id = user.data.Id

        # Fetch existing resumes
        existing_resumes = db.execute(
            select(Resume).where(Resume.UserId == user_id)
        ).scalars().all()

        # If resume exists and not updating
        if existing_resumes and not update_existing:
            return ResponseSchema(
                status=True,
                message="You already have a resume. Do you want to update it?",
                data={
                    "resume_exists": True,
                    "resume_id": existing_resumes[0].Id
                }
            )

        # Determine file type and extract text (FUNCTIONS ONLY)
        filename = file.filename.lower()

        if filename.endswith(".pdf"):
            extracted_text = await extract_text_from_pdf(file)
        elif filename.endswith(".docx"):
            extracted_text = await extract_text_from_docx(file)
        else:
            return ResponseSchema(
                status=False,
                message="Unsupported file format",
                data=None
            )

        if not extracted_text or isinstance(extracted_text, ResponseSchema):
            return ResponseSchema(
                status=False,
                message="No text extracted from resume",
                data=None
            )

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

        # Call AI FUNCTION (not API)
        ai_text = cohere_chat(prompt)

        if not ai_text:
            return ResponseSchema(
                status=False,
                message="AI did not return any data",
                data=None
            )

        try:
            parsed = json.loads(ai_text)
        except json.JSONDecodeError:
            return ResponseSchema(
                status=False,
                message="AI response could not be parsed as JSON",
                data=None
            )

        # Validate required fields
        email = parsed.get("Email") or user.data.Email
        skills = parsed.get("Skills") or "Management, Communication"
        developer_type = parsed.get("DeveloperType") or "General Engineer"

        if not email or not skills or not developer_type:
            return ResponseSchema(
                status=False,
                message="Missing required fields (Email, Skills, DeveloperType)",
                data=None
            )

        created_by = user.data.Name or user.data.Email or "Unknown"

        # Delete old resumes + Qdrant points if updating
        if existing_resumes and update_existing:
            for resume_obj in existing_resumes:
                qdrant_response = delete_point(
                    collection_name="Resume3",
                    point_id=resume_obj.Id
                )
                db.delete(resume_obj)
            db.commit()

        # Save resume file
        unique_filename = save_upload_resume(file, upload_dir="uploads/resumes")

        # Save resume in DB
        resume = Resume(
            UserId=user.data.Id,
            FullName=parsed.get("FullName"),
            Email=email or user.data.Email,
            PhoneNumber=parsed.get("PhoneNumber"),
            Address=parsed.get("Address"),
            DateOfBirth=parsed.get("DateOfBirth"),
            Gender=parsed.get("Gender"),
            Country=parsed.get("Country"),
            ProfileImage=parsed.get("ProfileImage"),
            Nationality=parsed.get("Nationality"),
            ResumeFile=unique_filename,
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

        # Generate embeddings
        embedding_vector = generate_embeddings(extracted_text)

        # Upsert into Qdrant
        point = PointStruct(
            id=resume.Id,
            vector=embedding_vector,
            payload={
                "prompt": extracted_text,
                "resume_id": resume.Id,
                "user_id": resume.UserId
            }
        )

        qdrant_result = upsert_points(
            collection_name="Resume3",
            points=[point]
        )

        if not qdrant_result.status:
            return ResponseSchema(
                status=False,
                message=qdrant_result.message,
                data=None
            )

        return ResponseSchema(
            status=True,
            message="Resume processed and saved successfully.",
            data={
                "resume_id": resume.Id,
                "resume_exists": False
            }
        )

    except Exception as e:
        return ResponseSchema(
            status=False,
            message=str(e),
            data=None
        )
