from fastapi import APIRouter, Depends, HTTPException, status
from pymongo.errors import PyMongoError
from .models import ResearcherModel
from .db import get_db

router = APIRouter()

@router.post(
    "/researchers",
    status_code=status.HTTP_201_CREATED,
    response_model=dict,
    summary="Create a new researcher",
)
async def create_researcher(
    researcher: ResearcherModel,
    db=Depends(get_db),
):
    """
    Inserts a researcher document into the `researchers` collection.
    """
    try:
        payload = researcher.model_dump(by_alias=True, exclude_none=True)
        result = await db["researchers"].insert_one(payload)
        return {"inserted_id": str(result.inserted_id)}
    except PyMongoError as e:
        # log e if you have a logger
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database insertion error"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
