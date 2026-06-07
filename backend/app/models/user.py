from sqlalchemy import Column, Integer, String, Boolean, DateTime, JSON, text
from sqlalchemy.sql import func
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    nama_lengkap = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    no_hp = Column(String(20), nullable=True)
    password_hash = Column(String(255), nullable=False)
    provinsi = Column(String(50), nullable=False)
    role = Column(String(20), server_default='petani')
    is_active = Column(Boolean, server_default=text('1')) # sqlite bool
    preferences = Column(JSON, server_default=text("'{}'"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_login = Column(DateTime(timezone=True), nullable=True)
