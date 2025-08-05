# app\routes\google\google_search_route.py

from fastapi import APIRouter, Depends

from app.schemas.google.google_search_schema import GoogleSearchQuery
from app.services.google.google_search_service import GoogleSearchService

router = APIRouter()

@router.post("/google-search")
def search_google(
    search_query: GoogleSearchQuery,
    service: GoogleSearchService = Depends(GoogleSearchService)
):
    results = service.search(search_query.query, search_query.num_results)
    return {"results": results}