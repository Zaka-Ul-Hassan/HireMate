# app/services/google/google_search_service.py
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from load_env import google_search_api_key, google_search_cse_id


class GoogleSearchService:
    def __init__(self):
        self.api_key = google_search_api_key
        self.cse_id = google_search_cse_id

        try:
            self.service = build("customsearch", "v1", developerKey=self.api_key)
        except Exception as e:
            raise Exception(f"Failed to initialize Google Custom Search service: {e}")

    def search(self, query: str, num_results: int = 5):
        """
        Perform a Google Custom Search and return results.
        Provides detailed error messages if something goes wrong.
        """
        try:
            response = self.service.cse().list(
                q=query,
                cx=self.cse_id,
                num=num_results
            ).execute()

            # Extract items from response
            results = [
                {
                    "title": item.get("title"),
                    "link": item.get("link"),
                    "snippet": item.get("snippet")
                }
                for item in response.get("items", [])
            ]

            # If no items returned, inform user
            if not results:
                print("No results found for your query. Check query text or CSE configuration.")

            return results

        except HttpError as e:
            print(e)
            # Handle HTTP-specific errors
            if e.resp.status == 403:
                raise Exception(
                    "Access denied (403). Possible reasons:\n"
                    "- API key is invalid or restricted\n"
                    "- CSE ID is invalid or not linked to this API key\n"
                    "- Custom Search JSON API is not enabled for your project"
                )
            elif e.resp.status == 400:
                raise Exception(
                    "Bad Request (400). Possible reasons:\n"
                    "- Invalid CSE ID\n"
                    "- Query parameters are incorrect"
                )
            else:
                raise Exception(f"Google HTTP error ({e.resp.status}): {e.content}")

        except Exception as e:
            # Catch all other errors
            raise Exception(
                f"An unexpected error occurred while performing Google search: {e}\n"
                "Check your API key, CSE ID, and network connection."
            )
