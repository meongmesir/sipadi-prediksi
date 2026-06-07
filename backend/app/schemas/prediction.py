from pydantic import BaseModel
from typing import List, Optional, Any
from datetime import datetime

class PredictionRequest(BaseModel):
    nama_lahan: Optional[str] = None
    provinsi: str
    cultivar_name: str
    sowing_doy: int
    n_total_kg_ha: float
    plant_pop: float
    water_code: str
    luas_lahan_ha: float

class PredictionResponse(BaseModel):
    id: int
    user_id: int
    provinsi: str
    latitude: float
    longitude: float
    elevation_m: float
    cultivar_name: str
    sowing_doy: int
    n_total_kg_ha: float
    plant_pop: float
    water_code: str
    luas_lahan_ha: float
    
    yield_kg_ha: float
    kategori: str
    catatan_risiko: list[str]
    rekomendasi: list[str]
    
    created_at: datetime

    class Config:
        from_attributes = True

class PredictionHistoryResponse(BaseModel):
    items: List[PredictionResponse]
    total: int
    page: int
    limit: int
