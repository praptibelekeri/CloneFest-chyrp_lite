# main.py

# ===============================================================================
# 1. IMPORTS (All consolidated at the top)
# ===============================================================================
import datetime
from typing import List, Optional

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.security import (APIKeyHeader, OAuth2PasswordBearer,OAuth2PasswordRequestForm)
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel
from sqlalchemy import (JSON, Column, DateTime, ForeignKey, Integer, String,
                        create_engine)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import Session, relationship, sessionmaker

# ===============================================================================
# 2. CONFIGURATION & SETUP
# ===============================================================================
# --- Security and JWT Configuration ---
SECRET_KEY = "your-super-secret-key-that-is-long-and-random"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# --- Re-usable components ---
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
api_key_scheme = APIKeyHeader(name="Authorization")

# --- Database Setup ---
DATABASE_URL = "sqlite:///./blog.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# ===============================================================================
# 3. DATABASE MODELS (SQLAlchemy)
# ===============================================================================
# --- Define models in order of dependency: Group -> User -> Post ---

class Group(Base):
    __tablename__ = "groups"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    permissions = Column(JSON, default=[])
    users = relationship("User", back_populates="group")

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    login = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    full_name = Column(String, nullable=True)
    hashed_password = Column(String)
    joined_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    group_id = Column(Integer, ForeignKey("groups.id"))
    group = relationship("Group", back_populates="users")
    
    posts = relationship("Post", back_populates="owner")

class Post(Base):
    __tablename__ = "posts"
    id = Column(Integer, primary_key=True, index=True)
    content_type = Column(String, default="post", index=True)
    clean = Column(String, unique=True, index=True)
    feather = Column(String, default="text")
    status = Column(String, default="public")
    pinned = Column(Integer, default=0)
    title = Column(String, nullable=True)
    body = Column(String, nullable=True)
    parent_id = Column(Integer, ForeignKey("posts.id"), nullable=True) # Self-referencing key
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    user_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="posts")
    # --- NEW: Self-referencing relationship for parent/child pages ---
    parent = relationship("Post", remote_side=[id], back_populates="children")
    children = relationship("Post", back_populates="parent")
# ===============================================================================
# 4. API SCHEMAS (Pydantic)
# ===============================================================================
# --- Define schemas in order of dependency ---

class PostBase(BaseModel):
    # --- ADD these new optional fields ---
    content_type: str = "post"
    title: Optional[str] = None
    body: Optional[str] = None
    parent_id: Optional[int] = None
    
    # --- Make feather optional ---
    feather: Optional[str] = None
    
    # --- These stay the same ---
    clean: str
    status: str = "public"
    pinned: bool = False

class PostCreate(PostBase):
    pass

class PostModel(PostBase):
    id: int
    created_at: datetime.datetime
    updated_at: datetime.datetime
    class Config:
        orm_mode = True

class GroupBase(BaseModel):
    name: str

class GroupCreate(GroupBase):
    permissions: List[str] = []

class GroupModel(GroupBase):
    id: int
    permissions: List[str]
    class Config:
        orm_mode = True

class UserBase(BaseModel):
    login: str
    email: str
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserModel(UserBase):
    id: int
    joined_at: datetime.datetime
    posts: List[PostModel] = []
    group: Optional[GroupModel] = None
    class Config:
        orm_mode = True

class TokenData(BaseModel):
    login: Optional[str] = None

# ===============================================================================
# 5. UTILITY & DEPENDENCY FUNCTIONS
# ===============================================================================
# --- Fixed: Defined get_db() before any functions that use it ---
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- Security Utilities ---
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

# --- Authentication Dependency ---
async def get_current_user(token: str = Depends(api_key_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        login: str = payload.get("sub")
        if login is None:
            raise credentials_exception
        token_data = TokenData(login=login)
    except JWTError:
        raise credentials_exception
    user = db.query(User).filter(User.login == token_data.login).first()
    if user is None:
        raise credentials_exception
    return user

# ===============================================================================
# 6. FASTAPI APP INITIALIZATION
# ===============================================================================
app = FastAPI(
    title="Chyrp Clone API",
    description="API for the modern Chyrp blogging engine.",
    version="1.0.0",
)

Base.metadata.create_all(bind=engine)

# ===============================================================================
# 7. API ENDPOINTS
# ===============================================================================
@app.get("/", tags=["Default"])
def read_root():
    return {"message": "Welcome to the Chyrp Clone API!"}

# --- Authentication Endpoint ---
@app.post("/token", tags=["Authentication"])
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.login == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = datetime.timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.login}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

# --- Users Endpoints ---
@app.post("/users/", response_model=UserModel, tags=["Users"])
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    default_group = db.query(Group).first()
    if not default_group:
        raise HTTPException(status_code=400, detail="No groups found. Please create a group first.")
    
    hashed_password = get_password_hash(user.password)
    db_user = User(
        login=user.login,
        email=user.email,
        full_name=user.full_name,
        hashed_password=hashed_password,
        group_id=default_group.id
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# --- Groups Endpoints ---
@app.post("/groups/", response_model=GroupModel, tags=["Groups"])
def create_group(group: GroupCreate, db: Session = Depends(get_db)):
    db_group = Group(name=group.name, permissions=group.permissions)
    db.add(db_group)
    db.commit()
    db.refresh(db_group)
    return db_group

@app.get("/groups/", response_model=List[GroupModel], tags=["Groups"])
def read_groups(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    groups = db.query(Group).offset(skip).limit(limit).all()
    return groups

# --- Posts Endpoints ---

@app.post("/posts/", response_model=PostModel, tags=["Posts"])
def create_post(post: PostCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Updated to include all new fields from the post schema
    db_post = Post(
        content_type=post.content_type,
        title=post.title,
        body=post.body,
        parent_id=post.parent_id,
        feather=post.feather,
        clean=post.clean, 
        status=post.status, 
        pinned=post.pinned,
        user_id=current_user.id
    )
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    return db_post

@app.get("/posts/", response_model=List[PostModel], tags=["Posts"])
def read_posts(content_type: Optional[str] = None, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    query = db.query(Post)

    if content_type:
        query = query.filter(Post.content_type == content_type)

    posts = query.offset(skip).limit(limit).all()
    return posts