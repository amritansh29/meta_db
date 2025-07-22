# Hybrid registry for available collections and their fields (standard + metadata)
from backend.routes.db_routes import MODEL_MAP
from fastapi import Depends, HTTPException
from typing import List

# --- Static helpers for standard fields ---
def get_collections() -> List[str]:
    return list(MODEL_MAP.keys())

def get_fields(collection_name: str) -> List[str]:
    if collection_name not in MODEL_MAP:
        raise ValueError(f"Invalid collection name: {collection_name}")
    model = MODEL_MAP[collection_name]
    return list(model.model_fields.keys())

def is_valid_field(collection: str, field: str) -> bool:
    try:
        return field in get_fields(collection)
    except Exception:
        return False

# --- Async helper for metadata fields ---
async def get_metadata_fields(collection: str, db) -> List[str]:
    if collection not in MODEL_MAP:
        raise ValueError(f"Invalid collection name: {collection}")
    cursor = db[collection].find({}, {'metadata': 1})
    metadata_keys = set()
    async for doc in cursor:
        metadata_keys.update(doc.get('metadata', {}).keys())
        if len(metadata_keys) > 100:
            break
    return list(metadata_keys)
