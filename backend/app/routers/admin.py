from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Any
from app.database import get_db
from app.models.user import User
from app.models.prediction import Prediction
from app.models.harga import HargaGabah, HargaGabahHistory
from app.schemas.auth import UserCreate, UserResponse, AdminUserResponse, Token
from app.schemas.prediction import PredictionResponse
from pydantic import BaseModel
from app.schemas.harga import HargaGabahResponse, HargaGabahUpdate
from app.services.auth_service import get_password_hash, create_access_token
from app.utils.deps import get_current_user, require_admin, require_superadmin

class AdminPredictionResponse(PredictionResponse):
    petani: str = ""
    user_id: int

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.get("/dashboard/stats")
def get_dashboard_stats(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    total_users = db.query(User).filter(User.role == "petani").count()
    total_predictions = db.query(Prediction).count()
    
    avg_yield_val = db.query(func.avg(Prediction.yield_kg_ha)).scalar()
    avg_yield = round(avg_yield_val, 1) if avg_yield_val else 0

    best_yield_val = db.query(func.max(Prediction.yield_kg_ha)).scalar()
    best_yield = round(best_yield_val, 1) if best_yield_val else 0

    # Perbandingan bulan ini vs bulan lalu untuk KPI delta
    from sqlalchemy import func as sa_func, text as sa_text
    this_month = db.query(sa_func.count(Prediction.id)).filter(
        sa_func.date_trunc('month', Prediction.created_at) == sa_func.date_trunc('month', sa_func.now())
    ).scalar() or 0
    last_month = db.query(sa_func.count(Prediction.id)).filter(
        sa_func.date_trunc('month', Prediction.created_at) == sa_func.date_trunc('month', sa_func.now() + sa_text("INTERVAL '-1 month'"))
    ).scalar() or 0

    this_month_users = db.query(sa_func.count(User.id)).filter(
        User.role == "petani",
        sa_func.date_trunc('month', User.created_at) == sa_func.date_trunc('month', sa_func.now())
    ).scalar() or 0
    last_month_users = db.query(sa_func.count(User.id)).filter(
        User.role == "petani",
        sa_func.date_trunc('month', User.created_at) == sa_func.date_trunc('month', sa_func.now() + sa_text("INTERVAL '-1 month'"))
    ).scalar() or 0

    def format_delta(current, previous):
        if previous == 0 and current == 0:
            return None
        if previous == 0:
            return f"+{current}"
        diff = current - previous
        pct = (diff / previous) * 100
        return f"+{diff}" if diff >= 0 else f"{diff}"

    user_delta = format_delta(this_month_users, last_month_users)
    prediction_delta = format_delta(this_month, last_month)

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

    # Prediksi per Bulan (menggunakan PostgreSQL date_trunc)
    bulan_rows = db.query(
        sa_func.to_char(Prediction.created_at, 'Mon').label('bulan'),
        sa_func.count(Prediction.id).label('jumlah')
    ).group_by(
        sa_func.to_char(Prediction.created_at, 'Mon')
    ).order_by(
        sa_func.min(Prediction.created_at)
    ).limit(6).all()

    prediksi_per_bulan = [{"bulan": r.bulan, "jumlah": r.jumlah} for r in bulan_rows] if bulan_rows else [
        {"bulan": "Apr", "jumlah": total_predictions},
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

    # Admin users untuk Status Admin (superadmin only)
    admin_users = []
    if admin.role == "superadmin":
        admins = db.query(User).filter(User.role.in_(["admin", "superadmin"])).all()
        admin_users = [
            {
                "id": a.id,
                "nama": a.nama_lengkap,
                "email": a.email,
                "role": a.role,
                "loginTerakhir": a.last_login.strftime("%d %b %Y %H:%M") if a.last_login else "Belum pernah login",
            }
            for a in admins
        ]

    return {
        "total_users": total_users,
        "total_predictions": total_predictions,
        "avg_yield": avg_yield,
        "best_yield": best_yield,
        "user_delta": user_delta,
        "prediction_delta": prediction_delta,
        "top_provinsi": top_provinsi,
        "distribusi_varietas": distribusi_varietas,
        "prediksi_per_bulan": prediksi_per_bulan,
        "aktivitas_terbaru": aktivitas_terbaru,
        "admin_users": admin_users
    }

@router.get("/users", response_model=List[AdminUserResponse])
def get_users(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    users = db.query(User).outerjoin(Prediction, Prediction.user_id == User.id).group_by(User.id).add_columns(
        func.count(Prediction.id).label('jumlah_prediksi')
    ).order_by(User.created_at.desc()).all()
    result = []
    for u, jp in users:
        d = {c.name: getattr(u, c.name) for c in u.__table__.columns}
        d['jumlah_prediksi'] = jp
        result.append(d)
    return result

@router.get("/predictions", response_model=List[AdminPredictionResponse])
def get_all_predictions(page: int = 1, limit: int = 50, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    skip = (page - 1) * limit
    rows = db.query(Prediction, User.nama_lengkap).join(User, Prediction.user_id == User.id).order_by(Prediction.created_at.desc()).offset(skip).limit(limit).all()
    result = []
    for p, petani_name in rows:
        d = {c.name: getattr(p, c.name) for c in p.__table__.columns}
        d['petani'] = petani_name
        result.append(d)
    return result

@router.post("/users", response_model=Token)
def create_admin(user_data: UserCreate, db: Session = Depends(get_db), admin: User = Depends(require_superadmin)):
    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = get_password_hash(user_data.password)
    new_user = User(
        nama_lengkap=user_data.nama_lengkap,
        email=user_data.email,
        no_hp=user_data.no_hp,
        provinsi=user_data.provinsi,
        password_hash=hashed_password,
        role="admin"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    access_token = create_access_token(data={"sub": str(new_user.id)})
    return {"access_token": access_token, "token_type": "bearer", "user": new_user}

@router.get("/harga", response_model=List[HargaGabahResponse])
def get_harga(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    return db.query(HargaGabah).all()

@router.get("/reports/summary")
def get_report_summary(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    bulan_rows = db.query(
        func.to_char(Prediction.created_at, 'Mon YYYY').label('bulan'),
        func.count(Prediction.id).label('prediksi'),
        func.count(func.distinct(Prediction.user_id)).label('pengguna'),
        func.avg(Prediction.yield_kg_ha).label('rataHasil')
    ).group_by(
        func.to_char(Prediction.created_at, 'Mon YYYY')
    ).order_by(
        func.min(Prediction.created_at)
    ).limit(6).all()

    ringkasan = [{
        "bulan": r.bulan,
        "prediksi": r.prediksi,
        "pengguna": r.pengguna,
        "rataHasil": round((r.rataHasil or 0) / 1000, 1),
        "rataHarga": 0
    } for r in bulan_rows]

    dist_var = db.query(
        Prediction.kategori,
        func.count(Prediction.id).label('jumlah')
    ).group_by(Prediction.kategori).all()
    total = sum(d.jumlah for d in dist_var)
    warna = {"Sangat Baik": "#15803d", "Baik": "#3b82f6", "Cukup": "#f59e0b", "Perlu Perhatian": "#ef4444"}
    distribusi = [{
        "kategori": d.kategori,
        "jumlah": d.jumlah,
        "persen": round((d.jumlah / total) * 100) if total else 0,
        "warna": warna.get(d.kategori, "#6b7280")
    } for d in dist_var]

    prov_rows = db.query(
        Prediction.provinsi,
        func.count(Prediction.id).label('prediksi'),
        func.avg(Prediction.yield_kg_ha).label('rata')
    ).group_by(Prediction.provinsi).order_by(func.count(Prediction.id).desc()).all()
    tabel_prov = []
    for i, r in enumerate(prov_rows, 1):
        sangat = db.query(Prediction).filter(Prediction.provinsi == r.provinsi, Prediction.kategori == "Sangat Baik").count()
        baik = db.query(Prediction).filter(Prediction.provinsi == r.provinsi, Prediction.kategori == "Baik").count()
        cukup = db.query(Prediction).filter(Prediction.provinsi == r.provinsi, Prediction.kategori == "Cukup").count()
        perlu = db.query(Prediction).filter(Prediction.provinsi == r.provinsi, Prediction.kategori == "Perlu Perhatian").count()
        tabel_prov.append({
            "no": i, "provinsi": r.provinsi, "prediksi": r.prediksi,
            "rata": round((r.rata or 0) / 1000, 1),
            "sangat": sangat, "baik": baik, "cukup": cukup, "perlu": perlu
        })

    return {"ringkasan": ringkasan, "distribusiKategori": distribusi, "tabelProvinsi": tabel_prov}

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
