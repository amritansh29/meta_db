from fastapi import APIRouter, Depends, HTTPException, status, Body, Query
from pymongo.errors import PyMongoError
from models.models import ResearcherModel, CollectionModel, StudyModel, SeriesModel, InstanceModel
from services.db_service import get_db
from datetime import datetime, timezone
from bson import ObjectId
import traceback
from fastapi.responses import JSONResponse
from pymongo import MongoClient
import logging
logger = logging.getLogger(__name__)

MODEL_MAP = {
    'studies': StudyModel,
    # 'series': SeriesModel,
    # 'instances': InstanceModel,
    # Add more as needed
}

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
        now = datetime.now(timezone.utc).isoformat()
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
    summary="Insert a new study and link to collections"
)
async def create_study(study: StudyModel, db=Depends(get_db)):
    # Step 1: Find all collections containing the accession number and patient_id
    # matching_collections = await db["collections"].find({
    #     "cases": {
    #         "$elemMatch": {
    #             "accession_numbers": study.accession_number,
    #             "patient_id": study.patient_id
    #         }
    #     }
    # }).to_list(length=None)

    # if not matching_collections:
    #     raise HTTPException(
    #         status_code=status.HTTP_400_BAD_REQUEST,
    #         detail="No collection found matching accession_number and patient_id"
    #     )

    # Step 2: Insert the study
    payload = study.model_dump(by_alias=True, exclude_none=True)
    # collection_ids = [col["_id"] for col in matching_collections]
    # payload["collection_ids"] = collection_ids
    try:
        result = await db["studies"].insert_one(payload)
        inserted_id = result.inserted_id

        return {"inserted_id": str(inserted_id)}

    except PyMongoError:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error during study insertion"
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
    summary="Insert a new series and link to study"
)
async def create_series(series: SeriesModel, db=Depends(get_db)):
    # Step 1: Validate that the referenced study exists
    study = await db["studies"].find_one({"_id": series.study_id})
    if not study:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Referenced study_id does not exist"
        )

    # Step 2: Prepare and insert the series document
    payload = series.model_dump(by_alias=True, exclude_none=True)
    try:
        result = await db["series"].insert_one(payload)
        inserted_id = result.inserted_id

        # Step 3: Add a shallow reference in the study document
        shallow_series = {
            "series_id": inserted_id,
            "series_instance_uid": series.series_instance_uid,
            "series_number": series.series_number,
            "series_description": series.metadata.get("SeriesDescription", ""),
            "modality": series.metadata.get("Modality", "")
        }

        await db["studies"].update_one(
            {"_id": series.study_id},
            {"$addToSet": {"series": shallow_series}}
        )

        return {"inserted_id": str(inserted_id)}

    except PyMongoError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error during series insertion"
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
    

@router.post(
    "/instances",
    status_code=status.HTTP_201_CREATED,
    response_model=dict,
    summary="Insert a new instance and link to series"
)
async def create_instance(instance: InstanceModel, db=Depends(get_db)):
    # Step 1: Validate that the referenced series exists
    series = await db["series"].find_one({"_id": instance.series_id})
    if not series:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Referenced series_id does not exist"
        )

    # Step 2: Insert the instance document
    payload = instance.model_dump(by_alias=True, exclude_none=True)
    try:
        result = await db["instances"].insert_one(payload)
        inserted_id = result.inserted_id

        # Step 3: Update the parent series document to include this instance
        await db["series"].update_one(
            {"_id": instance.series_id},
            {"$addToSet": {"instances": inserted_id}}
        )

        return {"inserted_id": str(inserted_id)}

    except PyMongoError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error during instance insertion"
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

def serialize_document(doc):
    if isinstance(doc, dict):
        new_doc = {}
        for k, v in doc.items():
            if k == '_id':
                new_doc['id'] = serialize_document(v)
            else:
                new_doc[k] = serialize_document(v)
        return new_doc
    elif isinstance(doc, list):
        return [serialize_document(v) for v in doc]
    elif isinstance(doc, ObjectId):
        return str(doc)
    else:
        return doc

def convert_object_ids(query):
    if isinstance(query, dict):
        for k, v in query.items():
            if (k == '_id' or k.endswith('_id')) and isinstance(v, str):
                try:
                    query[k] = ObjectId(v)
                except Exception:
                    pass
            elif isinstance(v, dict):
                convert_object_ids(v)
    return query

@router.post("/query", summary="Query studies/series/instances/collections")
async def run_query(
    collection: str = Body(..., description="studies, series, instances, or collections"),
    query: dict = Body(default={}, description="MongoDB-style query"),
    limit: int = Body(default=1000, description="Max results to return"),
    skip: int = Body(default=0, description="Number of results to skip"),
    sort: dict = Body(default={}, description="Sort specification, e.g., {'field': 1} for ascending, {'field': -1} for descending"),
    db=Depends(get_db)
):
    allowed_collections = {"studies", "series", "instances", "collections"}
    if collection not in allowed_collections:
        raise HTTPException(status_code=400, detail="Invalid collection name")

    try:
        query = convert_object_ids(query)
        cursor = db[collection].find(query)
        
        # Apply sorting if provided
        if sort:
            cursor = cursor.sort(list(sort.items()))
        
        # Apply pagination after sorting
        cursor = cursor.skip(skip).limit(limit)
        results = await cursor.to_list(length=limit)
        
        # Get total count for pagination
        total = await db[collection].count_documents(query)
        
        return {
            "results": [serialize_document(doc) for doc in results],
            "total": total,
            "sort": sort
        }
    except PyMongoError as e:
        raise HTTPException(status_code=500, detail=f"MongoDB error: {str(e)}")
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": f"Exception: {str(e)}"})

@router.get('/available-fields')
async def get_available_fields(
    collection: str = Query(..., description='Collection name'),
    collection_id: str = Query(None, description='Optional collection ID'),
    db=Depends(get_db)
):
    if collection not in MODEL_MAP:
        raise HTTPException(status_code=400, detail='Invalid collection name')
    model = MODEL_MAP[collection]
    standard_fields = list(model.model_fields.keys())

    query = {}
    if collection_id:
        query['collection_id'] = collection_id
    cursor = db[collection].find(query, {'metadata': 1})
    metadata_keys = set()
    async for doc in cursor:
        metadata_keys.update(doc.get('metadata', {}).keys())
        if len(metadata_keys) > 100:  # Limit to 100 unique keys for performance
            break

    all_fields = list(set(standard_fields) | metadata_keys)
    return {"fields": all_fields}

@router.get('/available-metadata-fields')
async def get_available_metadata_fields(
    collection: str = Query(..., description='Collection name'),
    collection_id: str = Query(None, description='Optional collection ID'),
    db=Depends(get_db)
):
    if collection not in MODEL_MAP:
        raise HTTPException(status_code=400, detail='Invalid collection name')

    query = {}
    if collection_id:
        query['collection_id'] = collection_id
    cursor = db[collection].find(query, {'metadata': 1})
    metadata_keys = set()
    async for doc in cursor:
        metadata_keys.update(doc.get('metadata', {}).keys())
        if len(metadata_keys) > 100:  # Limit to 100 unique keys for performance
            break

    return {"metadata_fields": list(metadata_keys)}