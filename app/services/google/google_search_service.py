# app\services\google\google_search_service.py/
from googleapiclient.discovery import build

from load_env import google_search_api_key,google_search_cse_id

class GoogleSearchService:
    def __init__(self):
        self.api_key = google_search_api_key
        self.cse_id = google_search_cse_id
        self.service = build("customsearch", "v1", developerKey=self.api_key)


    def search(self, query: str, num_results: int = 5):
        try:
            response = self.service.cse().list(
                q=query,
                cx=self.cse_id,
                num=num_results
            ).execute()

            print(response)

            results = []

            for item in response.get("items", []):
                results.append({
                    "title": item.get("title"),
                    "link": item.get("link"),
                    "snippet": item.get("snippet")
                })

            return results

        except Exception as e:
            raise Exception("Google search failed: " + str(e))
