# app\services\resume\resume_parser_service.py

from fastapi import UploadFile
from docx import Document
import fitz 
import io

from app.schemas.response_schema import ResponseSchema

async def extract_text_from_pdf(file: UploadFile) -> str:
    try:
        pdf = fitz.open(stream=await file.read(), filetype="pdf")
        text = "\n".join(page.get_text() for page in pdf)
        return text.strip()
    
    except Exception as e:
        return ResponseSchema(
            status=False,
            message=f"Failed to extract text from PDF",
            data=None
        )
    
async def extract_text_from_docx(file: UploadFile) -> str:
    try:
        content = await file.read()
        doc = Document(io.BytesIO(content))
        text = "\n".join(p.text for p in doc.paragraphs)
        return text.strip()
    
    except Exception as e:
        return ResponseSchema(
            status=False,
            message=f"Failed to extract text from DOCX",
            data=None
        )



