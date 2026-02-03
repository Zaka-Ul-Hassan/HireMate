# app\routes\qdrant\qdrant_route.py

from fastapi import APIRouter, HTTPException
from typing import List
from qdrant_client.models import PointStruct
from app.schemas.response_schema import ResponseSchema
from app.services.qdrant import qdrant_service

router = APIRouter()

# Collection routes
# Create Collection
@router.post("/collections/create", response_model=ResponseSchema)
async def create_collection_route(collection_name: str, vector_size: int = 1536, distance: str = "Cosine"):
    response = qdrant_service.create_collection(collection_name, vector_size, distance)
    return response

# Delete Collection
@router.delete("/collections/delete", response_model=ResponseSchema)
async def delete_collection_route(collection_name: str):
    response = qdrant_service.delete_collection(collection_name)
    return response

# Check Collection Existence
@router.get("/collections/exists", response_model=ResponseSchema)
async def check_collection_exists_route(collection_name: str):
    response = qdrant_service.collection_exists(collection_name)
    return response

# List Collections
@router.get("/collections/list", response_model=ResponseSchema)
async def list_collections_route():
    response = qdrant_service.list_collections()
    return response


# Point routes
# Upsert Points
@router.post("/points/upsert", response_model=ResponseSchema)
async def upsert_points_route(collection_name: str, points: List[PointStruct]):
    response = qdrant_service.upsert_points(collection_name, points)
    return response

# Retrieve Point
@router.get("/points/retrieve", response_model=ResponseSchema)
async def retrieve_point_route(collection_name: str, point_id: int):
    response = qdrant_service.get_point(collection_name, point_id)
    return response

# Delete Point
@router.delete("/points/delete", response_model=ResponseSchema)
async def delete_point_route(collection_name: str, point_id: int):
    response = qdrant_service.delete_point(collection_name, point_id)
    return response

# Similarity Query (Vector Search)
@router.post("/points/query", response_model=ResponseSchema)
async def query_points_route(collection_name: str,query_vector: List[float],top_k: int = 5):
    response = qdrant_service.query_points_similarity(collection_name,query_vector,top_k)
    return response


