# app\schemas\ai\embedding_request.py

from pydantic import BaseModel

class EmbeddingRequest(BaseModel):
    text: str
