# Prompt template builder for LLMs
from .registry import get_collections, get_fields, get_metadata_fields

async def build_prompt(user_query: str, db) -> str:
    collections = get_collections()
    fields_info = {col: get_fields(col) for col in collections}
    metadata_info = {}
    for col in collections:
        metadata_info[col] = await get_metadata_fields(col, db)
    prompt = (
        "You are an assistant that converts natural language to MongoDB queries for a DICOM metadata filtering service.\n"
        f"Available collections: {collections}\n"
        f"Top-level fields per collection: {fields_info}\n"
        f"Metadata fields per collection: {metadata_info}\n"
        "Instructions:\n"
        "- Only use these collections and fields.\n"
        "- If a field exists as a top-level field, query it directly (e.g., {'studies': {'modality': 'MR'}}).\n"
        "- If a field is only in metadata, query it as metadata.<field> (e.g., {'studies': {'metadata.StudyDescription': 'Brain MRI'}}).\n"
        "- Never use $where or JavaScript expressions. Use only standard MongoDB operators.\n"
        "- Always choose the collection that best matches the user's intent.\n"
        "- Always output a valid JSON object with double quotes (e.g., {\"instances\": {\"instance_number\": 1}}), not Python syntax.\n"
        "Examples:\n"
        "User query: Find all studies with modality MR\n"
        "Output: {'studies': {'modality': 'MR'}}\n"
        "User query: Find all instances with instance number 1\n"
        "Output: {'instances': {'instance_number': 1}}\n"
        "User query: Find all series with BodyPartExamined CHEST\n"
        "Output: {'series': {'metadata.BodyPartExamined': 'CHEST'}}\n"
        "User query: Find all studies from 2022\n"
        "Output: {'studies': {'study_date': '2022'}}\n"
        f"User query: {user_query}"
    )
    return prompt
