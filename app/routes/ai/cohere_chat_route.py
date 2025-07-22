# app\routes\ai\cohere_chat_route.py

from fastapi import APIRouter,HTTPException,Query

from app.services.ai.cohere_chat_service import cohere_chat

router = APIRouter()

@router.get("/chat")
async def chat_with_ai(prompt:str = Query(..., description="User message")):
    try:
        response = cohere_chat(prompt)
        return {"response": response}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI chat error: {str(e)}")