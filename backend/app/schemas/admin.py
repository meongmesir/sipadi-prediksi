from pydantic import BaseModel, EmailStr
from typing import Optional

class SettingsUpdate(BaseModel):
    notif_pengguna: bool
    notif_prediksi: bool
    notif_email: bool
    maintenance_mode: bool
    registrasi_buka: bool
    auto_backup: bool
    log_aktivitas: bool

class AdminProfileUpdate(BaseModel):
    nama_lengkap: str
    email: EmailStr
    password: Optional[str] = None

class AdminCreate(BaseModel):
    nama_lengkap: str
    email: EmailStr
    password: str

class UserStatusUpdate(BaseModel):
    is_active: bool
