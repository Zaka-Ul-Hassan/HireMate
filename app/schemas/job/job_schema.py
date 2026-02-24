# app\schemas\job\job_schema.py

from typing import List, Optional
from pydantic import BaseModel, Field

class LinkedInJobFilterSchema(BaseModel):
    job_title: str = Field(..., description="Job title to search")

    job_location: Optional[str] = None
    company_name: Optional[List[str]] = []
    number_records: Optional[int] = 50
    sort_by: Optional[str] = "R"  # DD or R
    date_posted: Optional[str] = ""  # r2592000, r604800, r86400
    experience_level: Optional[List[str]] = []
    job_type: Optional[List[str]] = []
    remote_type: Optional[List[str]] = []
    industry: Optional[List[str]] = []