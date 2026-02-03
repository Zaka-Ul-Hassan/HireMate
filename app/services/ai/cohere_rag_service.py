# app\services\ai\cohere_rag_service.py

import cohere
from load_env import cohere_api_key

EMBED_MODEL = "embed-v4.0"

# Function to generate embeddings using Cohere API
def generate_embeddings(text: str):
    try:
        co = cohere.ClientV2(api_key=cohere_api_key)
        text_inputs = [
            {
                "content": [
                    {"type": "text", "text": text}
                ]
            },
        ]

        response = co.embed(
            inputs=text_inputs,
            model="embed-v4.0",
            input_type="classification",
            embedding_types=["float"],
        )
        
        return response.embeddings.float_[0]

    except Exception as e:
        raise Exception(f"Cohere embedding error: {str(e)}")


