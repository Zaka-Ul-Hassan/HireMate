# app\services\ai\cohere_chat_service.py

import cohere

from load_env import cohere_api_key

MODEL_NAME = "command-r-plus-08-2024"

def cohere_chat(prompt: str) -> str:
    try:
        co = cohere.ClientV2(api_key=cohere_api_key)
        response = co.chat(
        model=MODEL_NAME,
        messages=[{
            "role": "user",
            "content" : prompt
            }]
        )
        if response.message and response.message.content:
            return response.message.content[0].text
        return "No content in response"
    
    except Exception as e:
        return f"Error occured in chore chat: {str(e)}"





