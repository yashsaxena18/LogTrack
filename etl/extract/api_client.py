import requests


API_URL = "http://127.0.0.1:8000/mock-api/incidents"


def fetch_incidents():
    """
    Fetch incident data from the external REST API.
    """

    response = requests.get(
        API_URL,
        timeout=10
    )

    response.raise_for_status()

    incidents = response.json()

    return incidents


if __name__ == "__main__":

    incidents = fetch_incidents()

    print(f"Fetched {len(incidents)} incidents")

    for incident in incidents:
        print(incident)