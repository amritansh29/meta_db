from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from ..services.translation_layer.factory import get_llm_client
from backend.services.translation_layer.utils.validators import validate_user_query, validate_mongo_query
from backend.services.translation_layer.utils.parser import extract_json
from backend.services.db_service import get_db

llm_router = APIRouter()

class LLMQueryRequest(BaseModel):
    user_query: str

class LLMQueryResponse(BaseModel):
    mongo_query: dict

@llm_router.post("/llm/translate", response_model=LLMQueryResponse)
async def translate_query(request: LLMQueryRequest, db=Depends(get_db)):
    if not validate_user_query(request.user_query):
        raise HTTPException(status_code=400, detail="Invalid user query.")
    llm_client = get_llm_client()
    raw_result = await llm_client.translate(request.user_query)
    if isinstance(raw_result, dict):
        mongo_query = raw_result
    else:
        mongo_query = extract_json(raw_result)
    is_valid = await validate_mongo_query(mongo_query, db)
    if not is_valid:
        raise HTTPException(status_code=400, detail="Invalid or unsafe MongoDB query generated.")
    return {"mongo_query": mongo_query} 