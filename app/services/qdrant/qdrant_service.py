# app/services/qdrant/qdrant_service.py

from qdrant_client import QdrantClient
from qdrant_client.models import VectorParams, Distance, PointStruct,models
from typing import List
from app.schemas.response_schema import ResponseSchema
from load_env import QDRANT_API_KEY, QDRANT_CLUSTER_URL


# Connect to Qdrant Cloud

client = QdrantClient(
    url=QDRANT_CLUSTER_URL, 
    api_key=QDRANT_API_KEY,
    timeout=60
)


# Collection functions
def create_collection(collection_name: str, vector_size: int = 1536, distance: str = "Cosine") -> ResponseSchema:
    try:
        if not client.collection_exists(collection_name):
            client.create_collection(
                collection_name=collection_name,
                vectors_config=VectorParams(
                    size=vector_size,
                    distance=Distance.COSINE if distance.lower() == "cosine" else Distance.EUCLID
                )
            )
            return ResponseSchema(
                status=True,
                message=f"Collection '{collection_name}' created successfully."
            )
        else:
            return ResponseSchema(
                status=False,
                message=f"Collection '{collection_name}' already exists."
            )
    except Exception as e:
        return ResponseSchema(
            status=False,
            message=f"Error creating collection: {str(e)}"
        )


def delete_collection(collection_name: str) -> ResponseSchema:
    try:
        if client.collection_exists(collection_name):
            client.delete_collection(collection_name=collection_name)
            return ResponseSchema(
                status=True,
                message=f"Collection '{collection_name}' deleted successfully."
            )
        else:
            return ResponseSchema(
                status=False,
                message=f"Collection '{collection_name}' does not exist."
            )
    except Exception as e:
        return ResponseSchema(
            status=False,
            message=f"Error deleting collection: {str(e)}"
        )

def collection_exists(collection_name: str) -> ResponseSchema:
    try:
        exists = client.collection_exists(collection_name)
        return ResponseSchema(
            status=True,
            message=f"Collection '{collection_name}' exists: {exists}",
            data=exists
        )
    except Exception as e:
        return ResponseSchema(
            status=False,
            message=f"Error checking collection existence: {str(e)}"
        )
    
def list_collections() -> ResponseSchema:
    try:
        collections = client.get_collections().collections
        collection_names = [col.name for col in collections]
        return ResponseSchema(
            status=True,
            message="Collections retrieved successfully.",
            data=collection_names
        )
    except Exception as e:
        return ResponseSchema(
            status=False,
            message=f"Error listing collections: {str(e)}"
        )


# Record / Point functions
def upsert_points(collection_name: str, points: List[PointStruct]) -> ResponseSchema:
    try:
        client.upsert(
            collection_name=collection_name,
            points=points
        )
        return ResponseSchema(
            status=True,
            message=f"Upserted {len(points)} points to collection '{collection_name}'."
        )
    except Exception as e:
        return ResponseSchema(
            status=False,
            message=f"Error upserting points: {str(e)}"
        )

def get_point(collection_name: str, point_id: int) -> ResponseSchema:
    try:
        point = client.retrieve(
            collection_name=collection_name,
            ids=[point_id],
            with_vectors=True
        )
        if point:
            return ResponseSchema(
                status=True,
                message=f"Point retrieved successfully.",
                data=point[0].dict()
            )
        return ResponseSchema(
            status=False,
            message=f"Point with ID {point_id} not found."
        )
    except Exception as e:
        return ResponseSchema(
            status=False,
            message=f"Error retrieving point: {str(e)}"
        )

def delete_point(collection_name: str, point_id: int) -> ResponseSchema:
    try:
        # Check if point exists
        point = client.retrieve(
            collection_name=collection_name,
            ids=[point_id],
            with_vectors=False
        )
        
        if not point or len(point) == 0:
            return ResponseSchema(
                status=False,
                message=f"Point with ID {point_id} does not exist."
            )
        
        # Delete the point
        client.delete(
            collection_name=collection_name,
            points_selector=models.PointIdsList(points=[point_id])
        )
        
        return ResponseSchema(
            status=True,
            message=f"Point with ID {point_id} deleted successfully from collection '{collection_name}'."
        )
    
    except Exception as e:
        return ResponseSchema(
            status=False,
            message=f"Error deleting point: {str(e)}"
        )


# Search function
def query_points_similarity(
    collection_name: str,
    query_vector: List[float],
    top_k: int = 5
) -> ResponseSchema:
    try:
        results = client.query_points(
            collection_name=collection_name,
            query=query_vector,   # vector-based similarity
            limit=top_k,
            with_payload=True,
            with_vectors=False
        )

        results_data = [point.dict() for point in results.points]

        return ResponseSchema(
            status=True,
            message="Similarity query completed successfully.",
            data=results_data
        )

    except Exception as e:
        return ResponseSchema(
            status=False,
            message=f"Error during similarity query: {str(e)}"
        )
