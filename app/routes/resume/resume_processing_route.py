# app\routes\resume\resume_processing_route.py

from fastapi import APIRouter,File,UploadFile,Depends
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.services.resume.resume_parser_service import extract_text_from_pdf,extract_text_from_docx
from app.services.resume.resume_processing_service import extract_fields_and_store

from app.db import get_db


router = APIRouter()

@router.post("/pdf-to-text")
async def pdf_to_text(file: UploadFile = File(...)):
    try:
        text = await extract_text_from_pdf(file)
        return {"text": text}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": f"Failed to extract text from PDF: {str(e)}"})


@router.post("/docx-to-text")
async def docx_to_text(file: UploadFile = File(...)):
    try:
        text = await extract_text_from_docx(file)
        return {"text": text}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": f"Failed to extract text from DOCX: {str(e)}"})
    
    
@router.post("/store-process-resume")
def store_resume(file:UploadFile, db:AsyncSession = Depends(get_db)):
    try:
        result =  extract_fields_and_store(file,db)
        return {"result": result}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": f"Error: {str(e)}"})