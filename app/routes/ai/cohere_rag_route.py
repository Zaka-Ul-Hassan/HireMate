# app\routes\ai\cohere_rag_route.py

from fastapi import APIRouter, HTTPException
from app.schemas.response_schema import ResponseSchema
from app.schemas.ai.embedding_request import EmbeddingRequest
from app.services.ai.cohere_rag_service import answer_user_from_resume, generate_embeddings

router = APIRouter()

# Generate Embeddings Route
@router.post("/generate/embeddings", response_model=ResponseSchema)
async def generate_embedding_route(request: EmbeddingRequest):
    try:
        embedding = generate_embeddings(request.text)

        return ResponseSchema(
            status=True,
            message="Embedding generated successfully",
            data={
                "vector_length": len(embedding),
                "embedding": embedding
            }
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

# Ask from Resume Route
@router.post("/ask", response_model=ResponseSchema)
async def ask_from_resume(prompt: str):
    return answer_user_from_resume(prompt)