# utils/rate_limiter.py
from slowapi import Limiter
from slowapi.util import get_remote_address

# Per-IP limiter (already used)
limiter = Limiter(key_func=get_remote_address)

# Route-specific GLOBAL limiter
def route_based_global_key(request):
    return f"global:{request.url.path}"

route_limiter = Limiter(key_func=route_based_global_key)