from fastapi import FastAPI
from .db import connect_to_mongo, close_mongo_connection
from .routes import router as researcher_router

app = FastAPI(
    title="DICOM Meta API",
    version="0.1.0",
    description="API for inserting DICOM metadata researchers"
)

app.include_router(researcher_router)

@app.on_event("startup")
async def on_startup():
    await connect_to_mongo()

@app.on_event("shutdown")
async def on_shutdown():
    await close_mongo_connection()
