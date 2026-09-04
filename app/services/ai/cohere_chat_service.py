# app\services\cohere\cohere_chat_service.py

import cohere

from load_env import cohere_api_key

MODEL_NAME = "command-a-plus-05-2026"

def cohere_chat(prompt: str):
    co = cohere.ClientV2(api_key=cohere_api_key)
    
    response = co.chat(
        model=MODEL_NAME,
        messages=[{"role": "user", "content": prompt}]
    )

    if not response.message:
        return "No content in response"

    for content_item in response.message.content or []:
        text = getattr(content_item, "text", None)
        if text is None and isinstance(content_item, dict):
            text = content_item.get("text")
        if text:
            return text

    return "No content in response"





