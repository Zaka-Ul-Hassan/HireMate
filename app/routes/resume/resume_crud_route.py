# app/routes/resume/resume_crud_route.py

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db import get_db
from app.schemas.response_schema import ResponseSchema
from app.schemas.resume.resume_schema import ResumeCreate, ResumeUpdate
from app.services.resume import resume_crud_service

router = APIRouter()


@router.post("/create", response_model=ResponseSchema)
def create_resume(
    payload: ResumeCreate,
    db: Session = Depends(get_db)
):
    resume = resume_crud_service.create_resume(db, payload)
    return ResponseSchema(
        status=True,
        message="Resume created successfully",
        data=resume
    )


@router.get("/all", response_model=ResponseSchema)
def get_all_resumes(
    name: str | None = Query(None, description="Search by full name"),
    db: Session = Depends(get_db)
):
    resumes = resume_crud_service.get_all_resumes(db, name)
    return ResponseSchema(
        status=True,
        message="Resumes fetched successfully",
        data=resumes
    )


@router.get("/by-user-id", response_model=ResponseSchema)
def get_resume_by_user_id(
    user_id: int,
    db: Session = Depends(get_db)
):
    resume = resume_crud_service.get_resume_by_user_id(db, user_id)

    if not resume:
        return ResponseSchema(
            status=False,
            message="Resume not found for this user",
            data=None
        )

    return ResponseSchema(
        status=True,
        message="User resume fetched successfully",
        data=resume
    )


@router.get("/by-email", response_model=ResponseSchema)
def get_resume_by_email(
    email: str,
    db: Session = Depends(get_db)
):
    return resume_crud_service.get_resume_by_email(db, email)


@router.get("/by-id", response_model=ResponseSchema)
def get_resume_by_id(
    resume_id: int,
    db: Session = Depends(get_db)
):
    resume = resume_crud_service.get_resume_by_id(db, resume_id)

    if not resume:
        return ResponseSchema(
            status=False,
            message="Resume not found",
            data=None
        )

    return ResponseSchema(
        status=True,
        message="Resume fetched successfully",
        data=resume
    )


@router.put("/update", response_model=ResponseSchema)
def update_resume(
    resume_id: int,
    payload: ResumeUpdate,
    db: Session = Depends(get_db)
):
    resume = resume_crud_service.update_resume(db, resume_id, payload)

    if not resume:
        return ResponseSchema(
            status=False,
            message="Resume not found",
            data=None
        )

    return ResponseSchema(
        status=True,
        message="Resume updated successfully",
        data=resume
    )


@router.delete("/delete", response_model=ResponseSchema)
def delete_resume(
    resume_id: int,
    db: Session = Depends(get_db)
):
    result = resume_crud_service.delete_resume(db, resume_id)

    if not result:
        return ResponseSchema(
            status=False,
            message="Resume not found",
            data=None
        )

    return ResponseSchema(
        status=True,
        message="Resume deleted successfully",
        data=None
    )
