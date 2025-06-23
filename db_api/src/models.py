from typing import List, Optional, Any
from pydantic import BaseModel, Field, EmailStr, GetCoreSchemaHandler
from bson import ObjectId
from pydantic_core import core_schema


class PyObjectId(ObjectId):
    @classmethod
    def __get_pydantic_json_schema__(cls, core_schema: core_schema.CoreSchema, handler: GetCoreSchemaHandler):
        return {"type": "string", "format": "objectid"}

    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v: Any, info: core_schema.ValidationInfo) -> ObjectId:
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)


class ResearcherModel(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    researcher_id: str
    name: str
    email: EmailStr
    jobs: Optional[List[PyObjectId]] = []

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


class CaseModel(BaseModel):
    case_id: str
    patient_id: str
    accession_numbers: List[str]

class CollectionModel(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    name: str
    description: str
    cases: List[CaseModel] = []
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


class StudySeriesLink(BaseModel):
    series_id: PyObjectId
    series_instance_uid: str
    series_number: Optional[int] = None
    series_description: Optional[str] = None
    modality: Optional[str] = None

class StudyModel(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    study_instance_uid: str
    accession_number: Optional[str] = None
    patient_id: Optional[str] = None
    acquisition_datetime: Optional[str] = None
    study_date: Optional[str] = None
    study_description: Optional[str] = None
    modality: Optional[str] = None
    metadata: dict = {}
    collection_ids: List[PyObjectId] = []
    series: Optional[List[StudySeriesLink]] = []
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


class SeriesModel(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    study_id: PyObjectId
    accession_number: Optional[str] = None

    #promoted fields for indexing
    series_instance_uid: str
    series_number: Optional[int] = None
    series_description: Optional[str] = None
    body_part_examined: Optional[str] = None
    series_date: Optional[str] = None
    series_time: Optional[str] = None
    manufacturer: Optional[str] = None
    manufacturer_model_name: Optional[str] = None
    protocol_name: Optional[str] = None
    kvp: Optional[float] = None
    slice_thickness: Optional[float] = None
    image_position_patient: Optional[List[float]] = None

    metadata: dict = {}

    # Links
    collection_ids: List[PyObjectId] = []
    instances: List[PyObjectId] = []
    

    # for natural-language later:
    _search_text: Optional[str] = None
    embeddings_id: Optional[str] = None

    # timestamps
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


class InstanceModel(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    series_id: PyObjectId
    metadata: dict = {}
    
    #promoted fields
    sop_instance_uid: str
    sop_class_uid: Optional[str] = None
    instance_number: Optional[int] = None
    acquisition_datetime: Optional[str] = None
    image_orientation: Optional[str] = None
    image_position: Optional[str] = None

    #timestamps 
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


