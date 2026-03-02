from datetime import datetime
from bson import ObjectId
from typing import Any

def serialize_mongo_document(doc: dict) -> dict:
    def convert(value: Any) -> Any:
        if value is None:
            return None  # Null check
        if isinstance(value, ObjectId):
            return str(value)
        elif isinstance(value, datetime):
            return value.isoformat()
        elif isinstance(value, dict):
            return {k: convert(v) for k, v in value.items()}
        elif isinstance(value, list):
            return [convert(item) for item in value]
        else:
            return value

    # Convert the whole document first
    converted = convert(doc)

    # Move _id to id if needed
    if "_id" in converted:
        converted["id"] = converted["_id"]
        del converted["_id"]

    return converted