from fastapi import APIRouter, Depends, HTTPException, status
from pymongo.errors import PyMongoError
from .models import ResearcherModel, CollectionModel, StudyModel, SeriesModel, InstanceModel
from .db import get_db
from datetime import datetime
from bson import ObjectId


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
    

@router.post(
    "/collections",
    status_code=status.HTTP_201_CREATED,
    response_model=dict,
    summary="Create a new collection",
)
async def create_collection(
    collection: CollectionModel,
    db=Depends(get_db),
):
    """
    Inserts a collection document into the `collections` collection.
    """
    try:
        payload = collection.model_dump(by_alias=True, exclude_none=True)
        now = datetime.utcnow().isoformat()
        payload["created_at"] = now
        payload["updated_at"] = now
        result = await db["collections"].insert_one(payload)
        return {"inserted_id": str(result.inserted_id)}
    except PyMongoError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database insertion error"
        )

@router.get(
    "/collections/{collection_id}",
    response_model=CollectionModel,
    summary="Get a collection by ID",
)
async def get_collection(collection_id: str, db=Depends(get_db)):
    try:
        result = await db["collections"].find_one({"_id": ObjectId(collection_id)})
        if not result:
            raise HTTPException(status_code=404, detail="Collection not found")
        return CollectionModel(**result)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    


@router.post(
    "/studies",
    status_code=status.HTTP_201_CREATED,
    response_model=dict,
    summary="Insert a study with metadata and series links",
)
async def create_study(
    study: StudyModel,
    db=Depends(get_db),
):
    try:
        payload = study.model_dump(by_alias=True, exclude_none=True)
        now = datetime.utcnow().isoformat()
        payload["created_at"] = now
        payload["updated_at"] = now
        result = await db["studies"].insert_one(payload)
        return {"inserted_id": str(result.inserted_id)}
    except PyMongoError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database insertion error"
        )

@router.get(
    "/studies/{study_id}",
    response_model=StudyModel,
    summary="Get a study by ID"
)
async def get_study(study_id: str, db=Depends(get_db)):
    try:
        result = await db["studies"].find_one({"_id": ObjectId(study_id)})
        if not result:
            raise HTTPException(status_code=404, detail="Study not found")
        return StudyModel(**result)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))



@router.post(
    "/series",
    status_code=status.HTTP_201_CREATED,
    response_model=dict,
    summary="Insert a DICOM series"
)
async def create_series(
    series: SeriesModel,
    db=Depends(get_db),
):
    try:
        payload = series.model_dump(by_alias=True, exclude_none=True)
        now = datetime.utcnow().isoformat()
        payload["created_at"] = now
        payload["updated_at"] = now
        result = await db["series"].insert_one(payload)
        return {"inserted_id": str(result.inserted_id)}
    except PyMongoError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database insertion error"
        )

@router.get(
    "/series/{series_id}",
    response_model=SeriesModel,
    summary="Get a DICOM series by ID"
)
async def get_series(series_id: str, db=Depends(get_db)):
    try:
        result = await db["series"].find_one({"_id": ObjectId(series_id)})
        if not result:
            raise HTTPException(status_code=404, detail="Series not found")
        return SeriesModel(**result)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    

from .models import InstanceModel

@router.post(
    "/instances",
    status_code=status.HTTP_201_CREATED,
    response_model=dict,
    summary="Insert a DICOM instance"
)
async def create_instance(
    instance: InstanceModel,
    db=Depends(get_db),
):
    try:
        payload = instance.model_dump(by_alias=True, exclude_none=True)
        now = datetime.utcnow().isoformat()
        payload["created_at"] = now
        payload["updated_at"] = now
        result = await db["instances"].insert_one(payload)
        return {"inserted_id": str(result.inserted_id)}
    except PyMongoError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database insertion error"
        )

@router.get(
    "/instances/{instance_id}",
    response_model=InstanceModel,
    summary="Get a DICOM instance by ID"
)
async def get_instance(instance_id: str, db=Depends(get_db)):
    try:
        result = await db["instances"].find_one({"_id": ObjectId(instance_id)})
        if not result:
            raise HTTPException(status_code=404, detail="Instance not found")
        return InstanceModel(**result)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

