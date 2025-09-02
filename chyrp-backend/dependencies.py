# dependencies.py

from fastapi import Depends, HTTPException, status
from fastapi.security import APIKeyHeader
from jose import JWTError, jwt
from sqlalchemy.orm import Session

# Import from your other files
import models
import schemas
from database import SessionLocal


api_key_scheme = APIKeyHeader(name="Authorization")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

async def get_current_user(token: str = Depends(api_key_scheme), db: Session = Depends(get_db)):
    try:
        token_type, token_value = token.split()
        if token_type.lower() != "bearer":
            raise ValueError("Invalid token type")
    except (ValueError, AttributeError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header format",
        )

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token_value, SECRET_KEY, algorithms=[ALGORITHM])
        login: str = payload.get("sub")
        if login is None:
            raise credentials_exception
        token_data = schemas.TokenData(login=login)
    except JWTError:
        raise credentials_exception
    user = db.query(models.User).filter(models.User.login == token_data.login).first()
    if user is None:
        raise credentials_exception
    return user