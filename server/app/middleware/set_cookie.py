from starlette.middleware.base import BaseHTTPMiddleware
from utils.auth.jwt import set_auth_cookies
from utils.logger import logger

class SetAuthCookieMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        response = await call_next(request)
        new_access_token = getattr(request.state, "new_access_token", None)
        # logger.debug(f"New access token in middleware: {new_access_token}")
        if new_access_token is not None:
            logger.debug("Setting new access token in cookies")
            set_auth_cookies(response, new_access_token)
        return response