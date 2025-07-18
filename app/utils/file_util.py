# app\utils\file_util.py

import os, uuid
import re
import bleach
from fastapi import UploadFile, HTTPException
from typing import Optional
from bleach.css_sanitizer import CSSSanitizer


ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/jpg", "image/webp"}

def sav_upload_file(upload_file: Optional[UploadFile], upload_dir: str = "uploads") -> Optional[str]:
    # Check if file is not uploaded or empty
    if upload_file is None or upload_file.filename == "" or upload_file.content_type is None:
        return None

    # Validate MIME type
    if upload_file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=400, detail="Only PNG, JPG, JPEG, or WEBP images are allowed.")

    os.makedirs(upload_dir, exist_ok=True)

    filename = f"{uuid.uuid4().hex}_{upload_file.filename}"
    file_path = os.path.join(upload_dir, filename)

    with open(file_path, "wb") as buffer:
        for chunk in iter(lambda: upload_file.file.read(1024 * 1024), b""):
            buffer.write(chunk)

    return file_path


def senitize_email_html(html: str) -> str:
    html = re.sub(r'<script.*?>.*?</script>', '', html, flags=re.DOTALL | re.IGNORECASE)
    html = re.sub(r'<iframe.*?>.*?</iframe>', '', html, flags=re.DOTALL | re.IGNORECASE)

    allowed_tags = list(bleach.sanitizer.ALLOWED_TAGS) + [
        'style', 'head', 'html', 'body', 'table', 'thead', 'tbody', 'tr', 'td', 'th'
    ]

    allowed_attrs = {
        '*': ['style', 'class', 'id'],
        'a': ['href', 'title'],
        'img': ['src', 'alt'],
    }

    css_sanitizer = CSSSanitizer(allowed_css_properties=[
        'color', 'background-color', 'font-size', 'font-weight', 'text-decoration',
        'padding', 'margin', 'border', 'width', 'height', 'display', 'text-align'
    ])

    return bleach.clean(
        html,
        tags=allowed_tags,
        attributes=allowed_attrs,
        css_sanitizer=css_sanitizer,
        strip=True
    )