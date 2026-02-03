# app/services/resume/resume_crud_service.py

from sqlalchemy.orm import Session
from app.models.resume.resume_model import Resume
from app.schemas.resume.resume_schema import ResumeCreate, ResumeUpdate


# Create new resume
def create_resume(db: Session, data: ResumeCreate):
    resume = Resume(**data.dict())
    resume.IsActive = True
    resume.IsDeleted = False

    db.add(resume)
    db.commit()
    db.refresh(resume)
    return resume

# Get resume by resume ID
def get_resume_by_id(db: Session, resume_id: int):
    return (
        db.query(Resume)
        .filter(
            Resume.Id == resume_id,
            Resume.IsDeleted == False
        )
        .first()
    )

# Get resume by user ID
def get_resume_by_user_id(db: Session, user_id: int):
    return (
        db.query(Resume)
        .filter(
            Resume.UserId == user_id,
            Resume.IsDeleted == False
        )
        .first()
    )

# Get all active resumes
def get_all_resumes(db: Session):
    return (
        db.query(Resume)
        .filter(Resume.IsDeleted == False)
        .all()
    )

# Update existing resume
def update_resume(db: Session, resume_id: int, data: ResumeUpdate):
    resume = get_resume_by_id(db, resume_id)
    if not resume:
        return None

    for key, value in data.dict(exclude_unset=True).items():
        setattr(resume, key, value)

    db.commit()
    db.refresh(resume)
    return resume


def delete_resume(db: Session, resume_id: int):
    resume = get_resume_by_id(db, resume_id)
    if not resume:
        return None  

    db.delete(resume)
    db.commit()
    return True
