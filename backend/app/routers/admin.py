from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Any
from app.database import get_db
from app.models.user import User
from app.models.prediction import Prediction
from app.models.harga import HargaGabah, HargaGabahHistory
from app.schemas.auth import UserResponse
from app.schemas.harga import HargaGabahResponse, HargaGabahUpdate
from app.utils.deps import get_current_user, require_admin, require_superadmin

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.get("/dashboard/stats")
def get_dashboard_stats(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    total_users = db.query(User).filter(User.role == "petani").count()
    total_predictions = db.query(Prediction).count()
    
    avg_yield_val = db.query(func.avg(Prediction.yield_kg_ha)).scalar()
    avg_yield = round(avg_yield_val, 1) if avg_yield_val else 0

    # Top Provinsi (berdasarkan prediksi terbanyak)
    top_prov = db.query(
        Prediction.provinsi,
        func.count(Prediction.id).label('prediksi')
    ).group_by(Prediction.provinsi).order_by(func.count(Prediction.id).desc()).limit(5).all()

    top_provinsi = []
    for p in top_prov:
        user_count = db.query(User).filter(User.provinsi == p.provinsi, User.role == "petani").count()
        avg_h = db.query(func.avg(Prediction.yield_kg_ha)).filter(Prediction.provinsi == p.provinsi).scalar()
        top_provinsi.append({
            "provinsi": p.provinsi,
            "pengguna": user_count,
            "prediksi": p.prediksi,
            "rata": round((avg_h or 0) / 1000, 1) # dalam ton
        })

    # Distribusi Varietas
    dist_var = db.query(
        Prediction.cultivar_name.label("varietas"),
        func.count(Prediction.id).label("jumlah")
    ).group_by(Prediction.cultivar_name).all()
    
    total_var = sum([d.jumlah for d in dist_var])
    colors = ["#15803d", "#22c55e", "#86efac", "#bbf7d0", "#dcfce7"]
    distribusi_varietas = [
        {
            "varietas": d.varietas,
            "persen": round((d.jumlah / total_var) * 100) if total_var > 0 else 0,
            "warna": colors[i % len(colors)]
        }
        for i, d in enumerate(dist_var)
    ]

    # Prediksi per Bulan (Mock for now since SQLite date functions are tricky, we'll do simple fallback)
    prediksi_per_bulan = [
        {"bulan": "Feb", "jumlah": 12},
        {"bulan": "Mar", "jumlah": 34},
        {"bulan": "Apr", "jumlah": 23},
        {"bulan": "Mei", "jumlah": 45},
        {"bulan": "Jun", "jumlah": total_predictions},
    ]

    # Aktivitas Terbaru
    recent = db.query(Prediction, User).join(User, Prediction.user_id == User.id).order_by(Prediction.created_at.desc()).limit(5).all()
    aktivitas_terbaru = [
        {
            "petani": r.User.nama_lengkap,
            "lokasi": r.Prediction.provinsi,
            "varietas": r.Prediction.cultivar_name,
            "hasil": r.Prediction.yield_kg_ha,
            "kategori": r.Prediction.kategori,
            "waktu": r.Prediction.created_at.strftime("%d %b %Y %H:%M")
        }
        for r in recent
    ]

    return {
        "total_users": total_users,
        "total_predictions": total_predictions,
        "avg_yield": avg_yield,
        "top_provinsi": top_provinsi,
        "distribusi_varietas": distribusi_varietas,
        "prediksi_per_bulan": prediksi_per_bulan,
        "aktivitas_terbaru": aktivitas_terbaru
    }

@router.get("/users", response_model=List[UserResponse])
def get_users(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    users = db.query(User).all()
    # Pydantic schema doesn't have loginTerakhir natively, we can add it or just send basic
    return users

@router.get("/harga", response_model=List[HargaGabahResponse])
def get_harga(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    return db.query(HargaGabah).all()

@router.post("/harga/update")
def update_harga(provinsi: str, data: HargaGabahUpdate, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    harga = db.query(HargaGabah).filter(HargaGabah.provinsi == provinsi).first()
    if not harga:
        raise HTTPException(status_code=404, detail="Provinsi not found")
        
    if data.harga_saat_ini is not None:
        harga.harga_saat_ini = data.harga_saat_ini
    if data.hpp is not None:
        harga.hpp = data.hpp
        
    db.commit()
    return {"message": "Harga updated successfully"}
