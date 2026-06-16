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

from starlette.middleware.base import BaseHTTPMiddleware
from fastapi.responses import JSONResponse
from app.database import SessionLocal
from app.models.admin import AppSettings

class MaintenanceMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        path = request.url.path
        if path.startswith("/api/admin") or path == "/api/auth/login" or path.startswith("/docs") or path.startswith("/openapi"):
            return await call_next(request)
            
        db = SessionLocal()
        try:
            setting = db.query(AppSettings).filter(AppSettings.key == "maintenance_mode").first()
            if setting and setting.value == "true":
                return JSONResponse(
                    status_code=503,
                    content={"detail": "Sistem sedang dalam mode pemeliharaan. Silakan coba beberapa saat lagi."}
                )
        finally:
            db.close()
            
        return await call_next(request)

app.add_middleware(MaintenanceMiddleware)

app.include_router(auth.router, prefix="/api")
app.include_router(predict.router, prefix="/api")
app.include_router(admin.router, prefix="/api")

@app.get("/")
def root():
    return {"message": "Welcome to SiPadiPrediksi API"}
