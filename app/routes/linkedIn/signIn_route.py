from fastapi import APIRouter, Depends, Request
from app.services.linkedIn.signIn_service import get_linkedin_auth_url,exchange_code_for_access_token


router = APIRouter()


@router.get("/linkedin/signin-url")
def linkedin_signin_url():
    auth_url = get_linkedin_auth_url()
    return {"auth_url": auth_url}

@router.get("/linkedin/callback")
def linkedin_callback(code: str = None, error: str = None):
    if error:
        return {"error": error}
    if not code:
        return {"error": "Missing authorization code"}

    token_data = exchange_code_for_access_token(code)
    return token_data