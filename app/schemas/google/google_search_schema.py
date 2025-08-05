# app\schemas\google\google_search_schema.py

from pydantic import BaseModel

class GoogleSearchQuery(BaseModel):
    query:str
    num_results: int = 5
