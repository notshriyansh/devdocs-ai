import os
from fastapi import Request, HTTPException
from functools import lru_cache
import jwt
from jwt import PyJWKClient

CLERK_SECRET_KEY = os.getenv("CLERK_SECRET_KEY")
CLERK_JWT_ISSUER = os.getenv("CLERK_JWT_ISSUER")
CLERK_JWT_AUDIENCE = os.getenv("CLERK_JWT_AUDIENCE")


@lru_cache(maxsize=16)
def get_jwks_client(issuer: str) -> PyJWKClient:
    """Create a cached JWKS client for a Clerk issuer."""
    return PyJWKClient(f"{issuer.rstrip('/')}/.well-known/jwks.json")


def get_token_issuer(token: str) -> str:
    try:
        claims = jwt.decode(token, options={"verify_signature": False})
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    issuer = claims.get("iss")
    if not issuer:
        raise HTTPException(status_code=401, detail="Token is missing issuer")

    if CLERK_JWT_ISSUER and issuer != CLERK_JWT_ISSUER:
        raise HTTPException(status_code=401, detail="Invalid token issuer")

    if not CLERK_JWT_ISSUER and "clerk" not in issuer:
        raise HTTPException(status_code=401, detail="Invalid token issuer")

    return issuer


async def get_user_id(request: Request) -> str:
    """Extract and verify user ID from Clerk JWT token"""
    
    if not CLERK_SECRET_KEY and not CLERK_JWT_ISSUER:
        return request.headers.get("X-User-ID", "test-user")
    
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization header")
    
    token = auth_header.split(" ")[1]
    
    try:
        issuer = get_token_issuer(token)
        signing_key = get_jwks_client(issuer).get_signing_key_from_jwt(token)
        decode_options = {"verify_aud": bool(CLERK_JWT_AUDIENCE)}
        claims = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            audience=CLERK_JWT_AUDIENCE,
            issuer=issuer,
            options=decode_options,
        )
        user_id = claims.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Token is missing user id")

        return user_id
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")
