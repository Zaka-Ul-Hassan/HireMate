# app\services\resume\resume_parser_service.py

from fastapi import UploadFile
from docx import Document
import fitz 
import io

async def extract_text_from_pdf(file: UploadFile) -> str:
    try:
        pdf = fitz.open(stream=await file.read(), filetype="pdf")
        text = "\n".join(page.get_text() for page in pdf)
        return text.strip()
    
    except Exception as e:
        return f"Error reading Pdf: {str(e)}"
    
async def extract_text_from_docx(file: UploadFile) -> str:
    try:
        content = await file.read()
        doc = Document(io.BytesIO(content))
        text = "\n".join(p.text for p in doc.paragraphs)
        return text.strip()
    
    except Exception as e:
        return f"Error reading DOCX: {str(e)}"



