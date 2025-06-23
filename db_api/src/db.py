import os
from motor.motor_asyncio import AsyncIOMotorClient
from motor.core import AgnosticDatabase

MONGO_URL = os.getenv("MONGO_URL", "mongodb://mongo:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "mydatabase")

client: AsyncIOMotorClient | None = None
db: AgnosticDatabase | None = None

async def connect_to_mongo() -> None:
    global client, db
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DATABASE_NAME]
    print(f"Connected to MongoDB at {MONGO_URL}")

async def close_mongo_connection() -> None:
    global client
    if client:
        client.close()
        print("Disconnected from MongoDB")

def get_db() -> AgnosticDatabase:
    if db is None:
        raise RuntimeError("Database not initialized.")
    return db
