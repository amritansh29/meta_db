# Prompt template builder for LLMs
from .registry import get_collections, get_fields

def build_prompt(user_query: str) -> str:
    collections = get_collections()
    fields_info = {col: get_fields(col) for col in collections}
    prompt = (
        "You are an assistant that converts natural language to MongoDB queries.\n"
        f"Available collections: {collections}\n"
        f"Fields per collection: {fields_info}\n"
        "Only use these collections and fields. Output a valid MongoDB query as JSON.\n"
        f"User query: {user_query}"
    )
    return prompt
