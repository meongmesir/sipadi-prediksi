from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, predict, admin
from app.database import engine, Base

# Create tables if not using Alembic for sqlite simple dev (optional, but good for fallback)
Base.metadata.create_all(bind=engine)

# Auto-seed the database on startup (crucial for Render free tier with ephemeral SQLite)
import seed
seed.seed()

app = FastAPI(title="SiPadiPrediksi API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For dev, allow all
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(predict.router, prefix="/api")
app.include_router(admin.router, prefix="/api")

@app.get("/")
def root():
    return {"message": "Welcome to SiPadiPrediksi API"}
