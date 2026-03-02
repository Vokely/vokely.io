from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request, status
from fastapi.responses import JSONResponse
from utils.logger import logger  

class VerifyCSRFMiddleware(BaseHTTPMiddleware):
    def __init__(self, app):
        super().__init__(app)
        self.excluded_prefixes = [
            "/app/api/public",
            "/app/api/auth",
            "/app/api/verification",
            "/app/api/blogs",
            "/app/api/internal/blogs",
            "/app/api/password",
            "/app/api/contact-us",
            "/app/api/rating",
            "/app/api/transaction",
            "/app/api/ats-checker"
        ]
        self.safe_methods = {"GET", "OPTIONS", "HEAD"}

    async def dispatch(self, request: Request, call_next):
        # logger.debug(f"Request Method: {request.method}")
        # logger.debug(f"Request Path: {request.url.path}")

        # Skip CSRF check for safe methods
        if request.method in self.safe_methods:
            logger.debug("CSRF check skipped: Safe HTTP method")
            return await call_next(request)

        # Skip CSRF check for excluded paths
        for prefix in self.excluded_prefixes:
            if request.url.path.startswith(prefix):
                logger.debug(f"CSRF check skipped: Path '{request.url.path}' matches excluded prefix '{prefix}'")
                return await call_next(request)

        # Perform CSRF validation
        csrf_cookie = request.cookies.get("csrf-token")
        csrf_header = request.headers.get("X-CSRF-Token")

        if not csrf_cookie:
            logger.warning("CSRF validation failed: Missing csrf-token cookie")
            return JSONResponse(
                {"detail": "CSRF validation failed: Missing csrf-token cookie"},
                status_code=status.HTTP_403_FORBIDDEN
            )

        if not csrf_header:
            logger.warning("CSRF validation failed: Missing X-CSRF-Token header")
            return JSONResponse(
                {"detail": "CSRF validation failed: Missing X-CSRF-Token header"},
                status_code=status.HTTP_403_FORBIDDEN
            )

        if csrf_cookie != csrf_header:
            logger.warning("CSRF validation failed: Token mismatch between cookie and header")
            return JSONResponse(
                {"detail": "CSRF validation failed: Token mismatch between cookie and header"},
                status_code=status.HTTP_403_FORBIDDEN
            )

        # logger.debug("CSRF validation passed")
        return await call_next(request)