# app\services\cohere\cohere_chat_service.py

import cohere

from load_env import cohere_api_key

MODEL_NAME = "command-r-plus-08-2024"

def cohere_chat(prompt: str):
    co = cohere.ClientV2(api_key=cohere_api_key)
    
    response = co.chat(
        model=MODEL_NAME,
        messages=[{"role": "user", "content": prompt}]
    )

    return response.message.content[0].text if response.message else "No content in response"





