# app\services\resume\resume_crud_service.py

from sqlalchemy.orm import Session
from app.models.resume.resume_model import Resume
from app.schemas.resume.resume_schema import ResumeCreate, ResumeUpdate


def create_resume(db: Session, data: ResumeCreate):
    """
    If resume already exists for UserId:
    - Soft delete old resume
    - Create new resume
    """

    # 1Soft delete existing resume for this user
    existing_resume = (
        db.query(Resume)
        .filter(
            Resume.UserId == data.UserId,
            Resume.IsDeleted == False
        )
        .first()
    )

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
    return (
        db.query(Resume)
        .filter(
            Resume.Id == resume_id,
            Resume.IsDeleted == False
        )
        .first()
    )


def get_resume_by_user_id(db: Session, user_id: int):
    """
    Get latest active resume for a user
    """
    return (
        db.query(Resume)
        .filter(
            Resume.UserId == user_id,
            Resume.IsDeleted == False
        )
        .order_by(Resume.CreatedAt.desc())
        .first()
    )


def get_all_resumes(db: Session):
    return (
        db.query(Resume)
        .filter(Resume.IsDeleted == False)
        .all()
    )


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

    resume.IsDeleted = True
    db.commit()
    return True
