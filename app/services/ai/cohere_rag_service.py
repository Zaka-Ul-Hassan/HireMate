# app\services\ai\cohere_rag_service.py

import cohere
from app.schemas.response_schema import ResponseSchema
from app.schemas.response_schema import ResponseSchema
from app.services.ai.cohere_chat_service import cohere_chat
from app.services.qdrant.qdrant_service import query_points_similarity
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
    
    
# Main function to answer user questions based on resume data using RAG approach
def answer_user_from_resume(user_prompt: str) -> ResponseSchema:
    try:
        # Generate embedding for user query
        query_vector = generate_embeddings(user_prompt)

        # Query Qdrant (ALWAYS Resume3)
        qdrant_response = query_points_similarity(
            collection_name="Resume3",
            query_vector=query_vector,
            top_k=5
        )

        if not qdrant_response.status or not qdrant_response.data:
            return ResponseSchema(
                status=True,
                message="No relevant data found",
                data="The information is not available in the resume."
            )

        # Build context from Qdrant results
        context_parts = []
        for point in qdrant_response.data:
            payload = point.get("payload", {})
            text = payload.get("text") or payload.get("prompt") or payload.get("content")
            if text:
                context_parts.append(text)

        context = "\n\n".join(context_parts)

        # Prompt engineering
        final_prompt = f"""
You are an AI assistant answering questions strictly using the resume data below.

Rules:
- Use ONLY the provided resume information
- If the answer is not present, say: "The information is not available in the resume."
- Keep the answer clear and concise
- Just answer the question, do not add any extra information
- Just reply on Hi or Hello with a greeting, do not add any extra information

Resume Data:
{context}

User Question:
{user_prompt}

Answer:
"""

        # Call Cohere Chat
        answer = cohere_chat(final_prompt)

        # Return response schema
        return ResponseSchema(
            status=True,
            message="Answer generated successfully",
            data=answer
        )

    except Exception as e:
        return ResponseSchema(
            status=False,
            message="Resume chat error",
            data=str(e)
        )


