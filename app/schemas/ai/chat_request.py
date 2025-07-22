# app\schemas\ai\chat_request.py

from pydantic import BaseModel

class ChatRequest(BaseModel):
    prompt : str