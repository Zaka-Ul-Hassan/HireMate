# app\schemas\pagination_schema.py

from pydantic import BaseModel
from typing import Optional

class PaginationInputSchema(BaseModel):
    skipCount: Optional[int] = None
    maxCount: Optional[int] = None
    search : Optional[str] = None



class PaginatedResponseSchema(BaseModel):
    totalCount: Optional[int] = None
    skipCount: Optional[int] = None
    maxCount: Optional[int] = None
    item : Optional[list] = None
    status : Optional[str] = None