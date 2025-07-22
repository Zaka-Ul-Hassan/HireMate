# app\routes\ai\cohere_chat_route.py

from fastapi import APIRouter,HTTPException,Query

from app.services.ai.cohere_chat_service import cohere_chat
from app.schemas.ai.chat_request import ChatRequest

router = APIRouter()

@router.post("/chat")
async def chat_with_ai(request: ChatRequest):
    try:
        response = cohere_chat(request.prompt)
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI chat error: {str(e)}")