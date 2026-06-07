from sqlalchemy import Column, Integer, String, Float, DateTime, JSON, ForeignKey
from sqlalchemy.sql import func
from app.database import Base

class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Input
    provinsi = Column(String(50), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    elevation_m = Column(Float, nullable=False)
    cultivar_name = Column(String(20), nullable=False)
    sowing_doy = Column(Integer, nullable=False)
    n_total_kg_ha = Column(Float, nullable=False)
    plant_pop = Column(Float, nullable=False)
    water_code = Column(String(2), nullable=False)
    luas_lahan_ha = Column(Float, nullable=False)
    
    # Output
    yield_kg_ha = Column(Float, nullable=False)
    kategori = Column(String(20), nullable=False)
    catatan_risiko = Column(JSON, nullable=False)
    rekomendasi = Column(JSON, nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
