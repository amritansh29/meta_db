# Validators for user input and LLM output
from typing import Any, Dict
from .registry import get_collections, get_fields, is_valid_field, get_metadata_fields

SAFE_OPERATORS = {"$and", "$or", "$eq", "$gt", "$lt", "$in", "$regex"}  # Expand as needed

FORBIDDEN_OPERATIONS = {"drop", "delete", "remove", "$out", "$merge"}


def validate_user_query(user_query: str) -> bool:
    return bool(user_query.strip())


def _validate_fields(collection: str, query_fields, standard_fields, metadata_fields) -> bool:
    for field in query_fields:
        if field not in standard_fields and field not in metadata_fields:
            return False
    return True

async def validate_mongo_query(mongo_query: Dict[str, Any], db=None) -> bool:
    # Basic structure check
    if not isinstance(mongo_query, dict):
        return False
    # Check for forbidden operations
    for op in FORBIDDEN_OPERATIONS:
        if op in str(mongo_query).lower():
            return False
    # Validate fields for each collection in the query
    for collection in get_collections():
        if collection in mongo_query:
            standard_fields = get_fields(collection)
            metadata_fields = []
            if db is not None:
                metadata_fields = await get_metadata_fields(collection, db)
            query_fields = mongo_query[collection].keys() if isinstance(mongo_query[collection], dict) else []
            if not _validate_fields(collection, query_fields, standard_fields, metadata_fields):
                return False
    return True
