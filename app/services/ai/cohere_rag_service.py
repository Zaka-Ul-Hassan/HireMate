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
                message="No Cadidate found",
                data="The information is not available"
            )

        # Build context from Qdrant results
        context_parts = []
        for point in qdrant_response.data:
            payload = point.get("payload", {})
            text = payload.get("text") or payload.get("prompt") or payload.get("content")
            if text:
                context_parts.append(text)

        context = "\n\n".join(context_parts)

        final_prompt = f"""
        You are a resume-matching AI assistant.

        Your task:
        - Answer the user question using ONLY the resume data provided below.
        - Identify ONLY candidates whose skills and experience clearly match the question.
        - Do NOT guess, infer, or assume anything not explicitly written in the resume.

        Strict Rules:
        1. Use ONLY the provided resume data.
        2. If no candidate matches, reply exactly:
        "Do not find any candidate"
        3. Always show:
        - Candidate Name
        - Relevant Skills
        - Relevant Experience
        - Any other resume data directly related to the question
        4. Do NOT show irrelevant candidates.
        5. Do NOT show full resumes — show ONLY matching information.
        6. Keep answers clear, factual, and consistent.
        7. For technical questions, provide detailed answers strictly based on resume content.
        8. If the user says "Hi" or "Hello", reply with a short greeting only.
        9. Do NOT add explanations, opinions, or extra text.

        Output Format (MUST FOLLOW EXACTLY):

        Candidate Name: <Full Name>
        Matched Skills: <Comma-separated skills>
        Relevant Experience:
        - <Bullet points from resume related to the question>

        (Repeat this format for each matching candidate)

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


