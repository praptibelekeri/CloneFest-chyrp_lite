# main.py

# ===============================================================================
# 1. IMPORTS
# ===============================================================================
import datetime
from typing import List, Optional
from database import engine, SessionLocal
from fastapi import Depends, FastAPI, HTTPException, Response, status
from fastapi.security import (APIKeyHeader, OAuth2PasswordBearer, OAuth2PasswordRequestForm)
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy import create_engine
from dependencies import get_db, get_current_user

# --- Import from our new files ---
import models
import schemas
from routers import interactions

# ===============================================================================
# 2. CONFIGURATION & SETUP
# ===============================================================================
SECRET_KEY = "your-super-secret-key-that-is-long-and-random"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
api_key_scheme = APIKeyHeader(name="Authorization")

# ===============================================================================
# 3. UTILITY & DEPENDENCY FUNCTIONS
# ===============================================================================

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[datetime.timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.datetime.utcnow() + expires_delta
    else:
        expire = datetime.datetime.utcnow() + datetime.timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(api_key_scheme), db: Session = Depends(get_db)):
    # The token from APIKeyHeader will be "bearer <the_token>", so we split it
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

# ===============================================================================
# 4. FASTAPI APP INITIALIZATION & ENDPOINTS
# ===============================================================================
app = FastAPI(
    title="Chyrp Clone API",
    description="API for the modern Chyrp blogging engine.",
    version="1.0.0",
)

@app.on_event("startup")
def create_initial_data():
    """
    Checks if initial data (groups, admin user, pages) exists,
    and if not, creates it. Runs only once when the server starts.
    """
    db = SessionLocal()
    try:
        # Check if any groups exist
        if db.query(models.Group).first() is None:
            print("Database is empty. Seeding initial data...")

            # 1. Create User Groups
            admin_permissions = [
                "edit_post", "delete_post", "add_user", "edit_user", 
                "delete_user", "add_group", "edit_group", "delete_group"
            ]
            member_permissions = ["add_post", "edit_own_post", "delete_own_post"]

            admin_group = models.Group(name="Admin", permissions=admin_permissions)
            member_group = models.Group(name="Member", permissions=member_permissions)
            
            db.add(admin_group)
            db.add(member_group)
            db.commit()
            db.refresh(admin_group)
            
            # 2. Create an Admin User
            hashed_password = get_password_hash("admin")
            admin_user = models.User(
                login="admin",
                email="admin@example.com",
                full_name="Administrator",
                hashed_password=hashed_password,
                group_id=admin_group.id
            )
            db.add(admin_user)
            db.commit()
            db.refresh(admin_user)

            # 3. Create Static Pages
            about_page = models.Post(
                content_type="page",
                title="About Us",
                body="## Welcome!\n\nThis is the default 'About Us' page. You can edit this content anytime.",
                clean="about-us",
                status="public",
                user_id=admin_user.id
            )

            contact_page = models.Post(
                content_type="page",
                title="Contact",
                body="This is the default 'Contact' page.",
                clean="contact",
                status="public",
                user_id=admin_user.id
            )
            db.add(about_page)
            db.add(contact_page)
            db.commit()
            print("Initial data created successfully.")
        else:
            print("Database already contains data. Skipping seeding.")

    finally:
        db.close()

# --- Include the router from your new interactions file ---
app.include_router(interactions.router)

models.Base.metadata.create_all(bind=engine)

@app.get("/", tags=["Default"])
def read_root():
    return {"message": "Welcome to the Chyrp Clone API!"}

# --- Authentication Endpoint ---
@app.post("/token", tags=["Authentication"])
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.login == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )
    access_token_expires = datetime.timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.login}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

# --- Users Endpoints ---
@app.post("/users/", response_model=schemas.UserModel, tags=["Users"])
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    default_group = db.query(models.Group).first()
    if not default_group:
        raise HTTPException(status_code=400, detail="No groups found. Please create a group first.")
    
    hashed_password = get_password_hash(user.password)
    db_user = models.User(
        login=user.login, email=user.email, full_name=user.full_name,
        hashed_password=hashed_password, group_id=default_group.id
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# --- Groups Endpoints ---
@app.post("/groups/", response_model=schemas.GroupModel, tags=["Groups"])
def create_group(group: schemas.GroupCreate, db: Session = Depends(get_db)):
    db_group = models.Group(name=group.name, permissions=group.permissions)
    db.add(db_group)
    db.commit()
    db.refresh(db_group)
    return db_group

@app.get("/groups/", response_model=List[schemas.GroupModel], tags=["Groups"])
def read_groups(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    groups = db.query(models.Group).offset(skip).limit(limit).all()
    return groups

# --- Posts Endpoints ---
@app.post("/posts/", response_model=schemas.PostModel, tags=["Posts"])
def create_post(post: schemas.PostCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_post = models.Post(**post.dict(), user_id=current_user.id)
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    return db_post

@app.get("/posts/", response_model=List[schemas.PostModel], tags=["Posts"])
def read_posts(content_type: Optional[str] = None, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    query = db.query(models.Post)
    if content_type:
        query = query.filter(models.Post.content_type == content_type)
    posts = query.offset(skip).limit(limit).all()
    return posts

@app.put("/posts/{post_id}", response_model=schemas.PostModel, tags=["Posts"])
def update_post(post_id: int, post_update: schemas.PostUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if db_post is None:
        raise HTTPException(status_code=404, detail="Post not found")
        
    is_owner = db_post.user_id == current_user.id
    can_edit_any = "edit_post" in current_user.group.permissions
    
    if not is_owner and not can_edit_any:
        raise HTTPException(status_code=403, detail="Not authorized to edit this post")

    for key, value in post_update.dict(exclude_unset=True).items():
        setattr(db_post, key, value)
    
    db_post.updated_at = datetime.datetime.utcnow()
    
    db.commit()
    db.refresh(db_post)
    return db_post

@app.delete("/posts/{post_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Posts"])
def delete_post(post_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if db_post is None:
        raise HTTPException(status_code=404, detail="Post not found")
        
    is_owner = db_post.user_id == current_user.id
    can_delete_any = "delete_post" in current_user.group.permissions

    if not is_owner and not can_delete_any:
        raise HTTPException(status_code=403, detail="Not authorized to delete this post")

    db.delete(db_post)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)

@app.get("/posts/{post_id}", response_model=schemas.PostModel, tags=["Posts"])
def read_post(post_id: int, db: Session = Depends(get_db)):
    db_post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if db_post is None:
        raise HTTPException(status_code=404, detail="Post not found")
    return db_post