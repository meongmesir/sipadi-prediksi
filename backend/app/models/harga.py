from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Date
from sqlalchemy.sql import func
from app.database import Base

class HargaGabah(Base):
    __tablename__ = "harga_gabah"

    id = Column(Integer, primary_key=True, index=True)
    provinsi = Column(String(50), unique=True, index=True, nullable=False)
    harga_saat_ini = Column(Integer, nullable=False)
    hpp = Column(Integer, server_default='6500')
    trend = Column(String(10), server_default='stabil')
    delta = Column(Integer, server_default='0')
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

class HargaGabahHistory(Base):
    __tablename__ = "harga_gabah_history"

    id = Column(Integer, primary_key=True, index=True)
    provinsi = Column(String(50), ForeignKey("harga_gabah.provinsi"), nullable=False)
    harga = Column(Integer, nullable=False)
    tanggal_pencatatan = Column(Date, nullable=False)
    updated_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
