# app\routes\resume\resume_text_parser_route.py

from fastapi import APIRouter,File,UploadFile
from fastapi.responses import JSONResponse

from app.services.resume.resume_parser_service import extract_text_from_pdf,extract_text_from_docx

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
