from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date

class HargaGabahBase(BaseModel):
    harga_saat_ini: int
    hpp: int = 6500
    trend: str = "stabil"
    delta: int = 0

class HargaGabahResponse(HargaGabahBase):
    id: int
    provinsi: str
    updated_at: datetime

    class Config:
        from_attributes = True

class HargaGabahUpdate(BaseModel):
    harga_saat_ini: Optional[int] = None
    hpp: Optional[int] = None

class HargaGabahHistoryResponse(BaseModel):
    id: int
    provinsi: str
    harga: int
    tanggal_pencatatan: date
    updated_by: int
    created_at: datetime

    class Config:
        from_attributes = True
