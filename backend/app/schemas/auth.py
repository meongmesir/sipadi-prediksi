from datetime import datetime
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Any

class UserCreate(BaseModel):
    nama_lengkap: str = Field(..., min_length=3)
    email: EmailStr
    no_hp: Optional[str] = None
    provinsi: str
    password: str = Field(..., min_length=8)

class UserLogin(BaseModel):
    email: str # Bisa email atau no_hp
    password: str

class UserResponse(BaseModel):
    id: int
    nama_lengkap: str
    email: str
    no_hp: Optional[str]
    provinsi: str
    role: str
    preferences: Optional[dict[str, Any]] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class AdminUserResponse(UserResponse):
    jumlah_prediksi: int = 0

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse
