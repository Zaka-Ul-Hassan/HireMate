import requests
from urllib.parse import quote
from load_env import client_id, client_secret, redirect_uri, scope

def get_linkedin_auth_url():
    encoded_redirect = quote(redirect_uri, safe="")
    encoded_scope = quote(scope, safe="")  # "openid profile" -> "openid%20profile"

    auth_url = (
        "https://www.linkedin.com/oauth/v2/authorization"
        f"?response_type=code"
        f"&client_id={client_id}"
        f"&redirect_uri={encoded_redirect}"
        f"&scope={encoded_scope}"
    )
    return auth_url


def exchange_code_for_access_token(auth_code: str):
    token_url = "https://www.linkedin.com/oauth/v2/accessToken"
    payload = {
        "grant_type": "authorization_code",
        "code": auth_code,
        "redirect_uri": redirect_uri,
        "client_id": client_id,
        "client_secret": client_secret,
    }
    headers = {"Content-Type": "application/x-www-form-urlencoded"}

    response = requests.post(token_url, data=payload, headers=headers)
    data = response.json()

    if "access_token" not in data:
        return {"error": data}

    return {
        "access_token": data["access_token"],
        "expires_in": data.get("expires_in"),
    }
