# utils/redis/redis_keys.py
class RedisKeys:
    """Central place to define and manage Redis key formats."""

    @staticmethod
    def geo_ip_location(ip: str) -> str:
        """Redis key for storing geo-location data by IP."""
        return f"geo:ip:{ip}"

    @staticmethod
    def geo_ip_details(ip: str) -> str:
        """Redis key for storing geo-location data by IP."""
        return f"ip:details:{ip}"

    @staticmethod
    def user_session(user_id: str) -> str:
        """Redis key for storing session info per user."""
        return f"user:{user_id}:session"

    @staticmethod
    def email_verification(email: str) -> str:
        """Redis key for temporary email verification."""
        return f"auth:verify:email:{email}"

    @staticmethod
    def password_reset_token(email: str) -> str:
        """Redis key for password reset token."""
        return f"auth:reset:email:{email}"
    
    @staticmethod
    def session_data(session_id: str) -> str:
        """Redis key for storing session data by session_id."""
        return f"session:{session_id}"
    
    @staticmethod
    def user_sessions(user_id: str) -> str:
        """Redis key for storing all active sessions for a user."""
        return f"user:{user_id}:sessions"
    
    @staticmethod
    def user_onboarding_details(user_id: str) -> str:
        """Redis key for caching user onboarding details."""
        return f"onboarding:details:{user_id}"
       
    @staticmethod
    def user_resumes(user_id: str) -> str:
        """Redis key for caching user resumes list."""
        return f"resumes:all:{user_id}"

    @staticmethod
    def user_interviews(user_id: str) -> str:
        """Redis key for caching user interviews list."""
        return f"interviews:all:{user_id}"

    @staticmethod
    def user_roadmaps(user_id: str) -> str:
        """Redis key for caching user roadmaps list."""
        return f"roadmaps:all:{user_id}"

    @staticmethod
    def get_user_data(user_id: str) -> str:
        """Redis key for caching user credit balance."""
        return f"user_data:{user_id}"

    @staticmethod
    def get_user_plan(user_id: str) -> str:
        """Redis key for caching user credit balance."""
        return f"user:plan:{user_id}"

    @staticmethod
    def get_pricing_plans() -> str:
        """Redis key for caching user credit balance."""
        return f"pricing_plans:all"