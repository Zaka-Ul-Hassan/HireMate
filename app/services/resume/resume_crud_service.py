# app/services/resume/resume_crud_service.py

from sqlalchemy.orm import Session
from app.models.resume.resume_model import Resume
from app.schemas.resume.resume_schema import ResumeCreate, ResumeUpdate


def create_resume(db: Session, data: ResumeCreate):
    """
    Create a new resume. If a resume already exists for the user,
    soft delete it before creating the new one.
    """
    # Check if user already has a resume
    existing_resume = (
        db.query(Resume)
        .filter(
            Resume.UserId == data.UserId,
            Resume.IsDeleted == False
        )
        .first()
    )
    
    # If existing resume found, soft delete it
    if existing_resume:
        existing_resume.IsDeleted = True
        db.commit()
    
    # Create new resume
    resume = Resume(**data.dict())
    resume.IsActive = True
    resume.IsDeleted = False

    db.add(resume)
    db.commit()
    db.refresh(resume)
    return resume


def get_resume_by_id(db: Session, resume_id: int):
    """Get resume by resume ID"""
    return (
        db.query(Resume)
        .filter(
            Resume.Id == resume_id,
            Resume.IsDeleted == False
        )
        .first()
    )


def get_resume_by_user_id(db: Session, user_id: int):
    """Get resume by user ID"""
    return (
        db.query(Resume)
        .filter(
            Resume.UserId == user_id,
            Resume.IsDeleted == False
        )
        .first()
    )


def get_all_resumes(db: Session):
    """Get all active resumes"""
    return (
        db.query(Resume)
        .filter(Resume.IsDeleted == False)
        .all()
    )


def update_resume(db: Session, resume_id: int, data: ResumeUpdate):
    """Update existing resume"""
    resume = get_resume_by_id(db, resume_id)
    if not resume:
        return None

    for key, value in data.dict(exclude_unset=True).items():
        setattr(resume, key, value)

    db.commit()
    db.refresh(resume)
    return resume


def delete_resume(db: Session, resume_id: int):
    """Soft delete a resume"""
    resume = get_resume_by_id(db, resume_id)
    if not resume:
        return None

    resume.IsDeleted = True
    db.commit()
    return True