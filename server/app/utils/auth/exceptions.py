# utils/auth/exceptions.py
from fastapi import HTTPException
import json

class CustomHTTPException(HTTPException):
    def __init__(self, status_code: int, message: str, **extra_fields):
        detail = {"detail": message}
        if extra_fields:
            for key, value in extra_fields.items():
                try:
                    json.dumps(value)
                    detail[key] = value
                except TypeError:
                    detail[key] = str(value)
            detail.update(extra_fields)
        super().__init__(status_code=status_code, detail=detail)