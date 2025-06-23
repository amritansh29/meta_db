from contextlib import asynccontextmanager
from fastapi import FastAPI
from db import connect_to_mongo, close_mongo_connection
from routes import router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await connect_to_mongo()
    yield
    # Shutdown
    await close_mongo_connection()

app = FastAPI(
    title="DICOM Meta API",
    version="0.1.0",
    description="API for inserting DICOM metadata researchers",
    lifespan=lifespan
)

app.include_router(router)
