# app/services/resume/resume_crud_service.py

from sqlalchemy.orm import Session
from qdrant_client.models import PointStruct
from app.models.resume.resume_model import Resume
from app.schemas.response_schema import ResponseSchema
from app.schemas.resume.resume_schema import ResumeCreate, ResumeUpdate
from app.services.ai.cohere_rag_service import generate_embeddings
from app.services.qdrant.qdrant_service import delete_point, upsert_points


# Create new resume
def create_resume(db: Session, data: ResumeCreate):
    # Save resume in the database
    resume = Resume(**data.dict())
    resume.IsActive = True
    resume.IsDeleted = False

    db.add(resume)
    db.commit()
    db.refresh(resume)

    # Join all fields into a single string for embedding
    prompt_text = " ".join(
        str(value) for value in data.dict().values() if value is not None
    )

    # Generate embeddings for RAG
    embedding_vector = generate_embeddings(prompt_text)

    # Create Qdrant point
    point = PointStruct(
        id=resume.Id,
        vector=embedding_vector,
        payload={
            **data.dict(),  # include all resume fields
            "resume_id": resume.Id,
            "user_id": resume.UserId,
            "prompt": prompt_text
        }
    )

    # Upsert into Qdrant 
    response = upsert_points(
        collection_name="Resume3",
        points=[point]
    )

    if not response.status:
        raise Exception(response.message)

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
def get_all_resumes(db: Session, name: str | None = None):
    query = db.query(Resume).filter(Resume.IsDeleted == False)

    if name:
        query = query.filter(Resume.FullName.ilike(f"%{name}%"))

    return query.all()

# Update existing resume and its Qdrant point
def update_resume(db: Session, resume_id: int, data: ResumeUpdate):
    existing_resume = get_resume_by_id(db, resume_id)
    if not existing_resume:
        return None

    # Delete the Qdrant point first
    qdrant_delete_response = delete_point(
        collection_name="Resume3",
        point_id=existing_resume.Id
    )
    if not qdrant_delete_response.status:
        print(f"Warning: {qdrant_delete_response.message}")

    # Delete the existing resume from DB
    db.delete(existing_resume)
    db.commit()

    # Create a new resume record with updated values
    # Convert ResumeUpdate to ResumeCreate by adding UserId if needed
    new_resume_data = ResumeCreate(
        **data.dict(exclude_unset=True),
        UserId=existing_resume.UserId  # preserve the user
    )
    new_resume = Resume(**new_resume_data.dict())
    new_resume.IsActive = True
    new_resume.IsDeleted = False

    db.add(new_resume)
    db.commit()
    db.refresh(new_resume)

    # Join all fields into a single string for embedding
    prompt_text = " ".join(
        str(getattr(new_resume, field))
        for field in new_resume.__table__.columns.keys()
        if getattr(new_resume, field) is not None
    )

    # Generate embeddings for RAG
    embedding_vector = generate_embeddings(prompt_text)

    # Upsert into Qdrant
    point = PointStruct(
        id=new_resume.Id,
        vector=embedding_vector,
        payload={
            **{col: getattr(new_resume, col) for col in new_resume.__table__.columns.keys()},
            "resume_id": new_resume.Id,
            "user_id": new_resume.UserId,
            "prompt": prompt_text
        }
    )

    response = upsert_points(
        collection_name="Resume3",
        points=[point]
    )

    if not response.status:
        raise Exception(response.message)

    return new_resume

# Delete resume and its Qdrant point
def delete_resume(db: Session, resume_id: int):
    resume = get_resume_by_id(db, resume_id)
    if not resume:
        return None  

    # Delete the Qdrant point first
    qdrant_response: ResponseSchema = delete_point(
        collection_name="Resume3", 
        point_id=resume.Id
    )

    if not qdrant_response.status:
        raise Exception(qdrant_response.message)
    
    # Delete resume from DB
    db.delete(resume)
    db.commit()

    return True
