from sqlalchemy import Column, Integer, String, Float
from app.database import Base

class ProvinsiGeo(Base):
    __tablename__ = "provinsi_geo"

    id = Column(Integer, primary_key=True, index=True)
    nama = Column(String(50), unique=True, index=True, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    elevation_m = Column(Float, nullable=False)
