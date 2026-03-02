from fastapi import HTTPException
from typing import Optional, List, Dict, Any
from bson import ObjectId
from models.transaction import TransactionCreate, TransactionInDB
from utils.json.serialize_json import serialize_mongo_document
from datetime import datetime

class TransactionCRUD:
    def __init__(self, db):
        self.db = db
        self.collection = db["transaction"]

    async def create_transaction(self, tx_data: TransactionCreate) -> Dict[str,Any]:
        tx_dict = tx_data.dict()
        tx_dict["webhook_received_at"] = tx_dict.get("webhook_received_at", datetime.utcnow())
        result = await self.collection.insert_one(tx_dict)
        tx_dict["id"] = str(result.inserted_id)
        serialized = serialize_mongo_document(tx_dict)
        return serialized

    async def get_transaction_by_payment_id(self, payment_id: str) -> Optional[TransactionInDB]:
        tx = await self.collection.find_one({"payment_id": payment_id})
        if not tx:
            return None
        tx["id"] = str(tx["_id"])
        return TransactionInDB(**serialize_mongo_document(tx))

    async def list_transactions(self, user_id: str) -> List[TransactionInDB]:
        cursor = self.collection.find({"user_id": user_id})
        txs = []
        async for doc in cursor:
            doc["id"] = str(doc["_id"])
            txs.append(TransactionInDB(**serialize_mongo_document(doc)))
        return txs
