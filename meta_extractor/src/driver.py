import asyncio
import httpx
from extractor import extract_metadata

BASE_URL = "http://db-api:8000"

# --- Helpers ---
async def post(session, path, payload):
    url = f"{BASE_URL}{path}"
    try:
        resp = await session.post(url, json=payload)
        resp.raise_for_status()
        return resp.json().get("inserted_id")
    except httpx.HTTPStatusError as e:
        print(f"[{path}] HTTP Error: {e.response.text}")
    except Exception as e:
        print(f"[{path}] Unexpected Error: {e}")
    return None

# --- Main Orchestrator ---
async def run_driver():
    print("Extracting metadata...")
    extracted = extract_metadata()
    studies = extracted["studies"]
    print("DONE")
    series = extracted["series"]
    instances = extracted["instances"]

    study_uid_to_id = {}
    series_uid_to_id = {}

    async with httpx.AsyncClient() as session:
        # Insert studies
        for study in studies:
            study["collection_ids"] = []  # <-- Update with real collection links
            inserted_id = await post(session, "/studies", study)
            if inserted_id:
                study_uid_to_id[study["study_instance_uid"]] = inserted_id

        # Insert series
        for s in series:
            s["study_id"] = study_uid_to_id.get(s["study_instance_uid"])
            s["collection_ids"] = []  # <-- Update with real collection links
            inserted_id = await post(session, "/series", s)
            if inserted_id:
                series_uid_to_id[s["series_instance_uid"]] = inserted_id

        # Insert instances
        for i in instances:
            i["series_id"] = series_uid_to_id.get(i["series_instance_uid"])
            await post(session, "/instances", i)

if __name__ == "__main__":
    asyncio.run(run_driver())
