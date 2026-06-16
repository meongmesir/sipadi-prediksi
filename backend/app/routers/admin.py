from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Any
from datetime import datetime, timedelta
import collections

from app.database import get_db
from app.models.user import User
from app.models.prediction import Prediction
from app.schemas.auth import UserResponse
from app.models.admin import AppSettings, AdminActivityLog
from app.schemas.admin import SettingsUpdate, AdminProfileUpdate, AdminCreate, UserStatusUpdate
from app.services.auth_service import get_password_hash
from sqlalchemy import text
from datetime import datetime
from app.utils.deps import get_current_user, require_admin, require_superadmin

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.get("/dashboard/stats")
def get_dashboard_stats(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    total_users = db.query(User).filter(User.role == "petani").count()
    total_predictions = db.query(Prediction).count()
    
    avg_yield_val = db.query(func.avg(Prediction.yield_kg_ha)).scalar()
    avg_yield = round(avg_yield_val, 1) if avg_yield_val else 0

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
            "rata": round((avg_h or 0) / 1000, 1) # ton
        })

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

    six_months_ago = datetime.now() - timedelta(days=180)
    recent_preds = db.query(Prediction.created_at).filter(Prediction.created_at >= six_months_ago).all()
    
    month_counts = collections.defaultdict(int)
    for rp in recent_preds:
        if rp[0]:
            month_str = rp[0].strftime("%b %Y")
            month_counts[month_str] += 1
        
    prediksi_per_bulan = []
    for i in range(5, -1, -1):
        dt = datetime.now() - timedelta(days=30*i)
        m_str = dt.strftime("%b %Y")
        prediksi_per_bulan.append({
            "bulan": m_str,
            "jumlah": month_counts.get(m_str, 0)
        })

    recent = db.query(Prediction, User).join(User, Prediction.user_id == User.id).order_by(Prediction.created_at.desc()).limit(5).all()
    aktivitas_terbaru = [
        {
            "petani": r.User.nama_lengkap,
            "lokasi": r.Prediction.provinsi,
            "varietas": r.Prediction.cultivar_name,
            "hasil": r.Prediction.yield_kg_ha,
            "kategori": r.Prediction.kategori,
            "waktu": r.Prediction.created_at.strftime("%d %b %Y %H:%M") if r.Prediction.created_at else "Baru saja"
        }
        for r in recent
    ]

    # Best yield
    best_yield_val = db.query(func.max(Prediction.yield_kg_ha)).scalar()
    best_yield = round(best_yield_val, 0) if best_yield_val else 0

    # Admin list (real data)
    admin_users = db.query(User).filter(User.role.in_(["admin", "superadmin"])).all()
    now = datetime.now()
    admin_list = []
    for a in admin_users:
        if a.last_login:
            diff = now - a.last_login.replace(tzinfo=None)
            if diff.days == 0:
                login_label = f"Hari ini · {a.last_login.strftime('%H:%M')}"
            elif diff.days == 1:
                login_label = f"Kemarin · {a.last_login.strftime('%H:%M')}"
            else:
                login_label = f"{diff.days} hari lalu"
        else:
            login_label = "Belum pernah login"
        admin_list.append({
            "nama": a.nama_lengkap,
            "email": a.email,
            "role": a.role,
            "loginTerakhir": login_label,
        })

    return {
        "total_users": total_users,
        "total_predictions": total_predictions,
        "avg_yield": avg_yield,
        "best_yield": best_yield,
        "total_admin": len(admin_list),
        "admin_list": admin_list,
        "top_provinsi": top_provinsi,
        "distribusi_varietas": distribusi_varietas,
        "prediksi_per_bulan": prediksi_per_bulan,
        "aktivitas_terbaru": aktivitas_terbaru
    }

@router.get("/users")
def get_users_extended(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    users = db.query(User).all()
    result = []
    for u in users:
        if u.role in ["admin", "superadmin"]:
            count = db.query(AdminActivityLog).filter(AdminActivityLog.admin_id == u.id).count()
        else:
            count = db.query(Prediction).filter(Prediction.user_id == u.id).count()
        result.append({
            "id": u.id,
            "nama_lengkap": u.nama_lengkap,
            "email": u.email,
            "no_hp": u.no_hp,
            "provinsi": u.provinsi,
            "role": u.role,
            "is_active": u.is_active,
            "created_at": u.created_at.isoformat() + ("Z" if u.created_at and not u.created_at.tzinfo else "") if u.created_at else None,
            "last_login": u.last_login.isoformat() + ("Z" if u.last_login and not u.last_login.tzinfo else "") if u.last_login else None,
            "jumlah_prediksi": count
        })
    return result

@router.get("/predictions")
def get_all_predictions(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    preds = db.query(Prediction, User).join(User, Prediction.user_id == User.id).order_by(Prediction.created_at.desc()).all()
    return [
        {
            "id": p.Prediction.id,
            "tanggal": p.Prediction.created_at.strftime("%d %b %Y") if p.Prediction.created_at else "N/A",
            "petani": p.User.nama_lengkap,
            "provinsi": p.Prediction.provinsi,
            "cultivar": p.Prediction.cultivar_name,
            "pupukN": p.Prediction.n_total_kg_ha,
            "luas": p.Prediction.luas_lahan_ha,
            "yieldKgHa": p.Prediction.yield_kg_ha,
            "kategori": p.Prediction.kategori,
            "sowingDoy": p.Prediction.sowing_doy,
            "nTotal": p.Prediction.n_total_kg_ha,
            "plantPop": p.Prediction.plant_pop,
            "waterCode": p.Prediction.water_code
        }
        for p in preds
    ]

@router.get("/reports")
def get_reports(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    ringkasan_bulanan = []
    for i in range(5, -1, -1):
        dt_start = datetime.now() - timedelta(days=30*(i+1))
        dt_end = datetime.now() - timedelta(days=30*i)
        
        preds_in_month = db.query(Prediction).filter(Prediction.created_at >= dt_start, Prediction.created_at < dt_end).all()
        users_in_month = db.query(User).filter(User.created_at >= dt_start, User.created_at < dt_end).count()
        
        avg_h = sum([p.yield_kg_ha for p in preds_in_month]) / len(preds_in_month) if preds_in_month else 0
        m_str = dt_end.strftime("%b %Y")
        
        ringkasan_bulanan.append({
            "bulan": m_str,
            "prediksi": len(preds_in_month),
            "pengguna": users_in_month,
            "rataHasil": round(avg_h / 1000, 1) 
        })
        
    total_users_before = db.query(User).filter(User.created_at < (datetime.now() - timedelta(days=180))).count()
    current_cumulative = total_users_before
    for r in ringkasan_bulanan:
        current_cumulative += r["pengguna"]
        r["pengguna"] = current_cumulative

    kat_counts = db.query(Prediction.kategori, func.count(Prediction.id)).group_by(Prediction.kategori).all()
    total_k = sum([k[1] for k in kat_counts])
    k_map = {k[0]: k[1] for k in kat_counts}
    
    distribusi_kategori = [
        {"kategori": "Sangat Baik", "jumlah": k_map.get("Sangat Baik", 0), "persen": round((k_map.get("Sangat Baik", 0)/total_k)*100) if total_k else 0, "warna": "#15803d"},
        {"kategori": "Baik", "jumlah": k_map.get("Baik", 0), "persen": round((k_map.get("Baik", 0)/total_k)*100) if total_k else 0, "warna": "#3b82f6"},
        {"kategori": "Cukup", "jumlah": k_map.get("Cukup", 0), "persen": round((k_map.get("Cukup", 0)/total_k)*100) if total_k else 0, "warna": "#f59e0b"},
        {"kategori": "Perlu Perhatian", "jumlah": k_map.get("Perlu Perhatian", 0), "persen": round((k_map.get("Perlu Perhatian", 0)/total_k)*100) if total_k else 0, "warna": "#ef4444"}
    ]

    provs = db.query(Prediction.provinsi).distinct().all()
    tabel_provinsi = []
    no = 1
    for p in provs:
        p_name = p[0]
        p_preds = db.query(Prediction).filter(Prediction.provinsi == p_name).all()
        avg_h = sum([pr.yield_kg_ha for pr in p_preds]) / len(p_preds) if p_preds else 0
        
        sb = len([pr for pr in p_preds if pr.kategori == "Sangat Baik"])
        bk = len([pr for pr in p_preds if pr.kategori == "Baik"])
        ck = len([pr for pr in p_preds if pr.kategori == "Cukup"])
        pp = len([pr for pr in p_preds if pr.kategori == "Perlu Perhatian"])
        
        tabel_provinsi.append({
            "no": no,
            "provinsi": p_name,
            "prediksi": len(p_preds),
            "rata": round(avg_h / 1000, 1),
            "sangat": sb,
            "baik": bk,
            "cukup": ck,
            "perlu": pp
        })
        no += 1
        
    tabel_provinsi.sort(key=lambda x: x["prediksi"], reverse=True)

    return {
        "ringkasan_bulanan": ringkasan_bulanan,
        "distribusi_kategori": distribusi_kategori,
        "tabel_provinsi": tabel_provinsi
    }

@router.get("/settings")
def get_settings(db: Session = Depends(get_db), admin: User = Depends(require_superadmin)):
    settings = db.query(AppSettings).all()
    # default values
    res = {
        "notif_pengguna": True,
        "notif_prediksi": True,
        "notif_email": False,
        "maintenance_mode": False,
        "registrasi_buka": True,
        "auto_backup": True,
        "log_aktivitas": True
    }
    for s in settings:
        if s.value == "true":
            res[s.key] = True
        elif s.value == "false":
            res[s.key] = False
    return res

@router.put("/settings")
def update_settings(req: SettingsUpdate, db: Session = Depends(get_db), admin: User = Depends(require_superadmin)):
    for k, v in req.model_dump().items():
        val_str = "true" if v else "false"
        setting = db.query(AppSettings).filter(AppSettings.key == k).first()
        if setting:
            setting.value = val_str
        else:
            setting = AppSettings(key=k, value=val_str)
            db.add(setting)
            
    log = AdminActivityLog(admin_id=admin.id, action="Ubah Pengaturan", target_table="app_settings")
    db.add(log)
    db.commit()
    return {"message": "Pengaturan berhasil disimpan"}

@router.put("/profile")
def update_profile(req: AdminProfileUpdate, db: Session = Depends(get_db), current_admin: User = Depends(require_admin)):
    current_admin.nama_lengkap = req.nama_lengkap
    current_admin.email = req.email
    if req.password:
        current_admin.password_hash = get_password_hash(req.password)
        
    log = AdminActivityLog(admin_id=current_admin.id, action="Ubah Profil", target_table="users")
    db.add(log)
    db.commit()
    return {"message": "Profil berhasil diperbarui"}

@router.post("/users")
def create_admin(req: AdminCreate, db: Session = Depends(get_db), admin: User = Depends(require_superadmin)):
    if db.query(User).filter(User.email == req.email).first():
        raise HTTPException(status_code=400, detail="Email sudah digunakan")
    new_admin = User(
        nama_lengkap=req.nama_lengkap,
        email=req.email,
        password_hash=get_password_hash(req.password),
        role="admin"
    )
    db.add(new_admin)
    log = AdminActivityLog(admin_id=admin.id, action="Tambah Admin", target_table="users")
    db.add(log)
    db.commit()
    db.refresh(new_admin)
    return new_admin

@router.put("/users/{user_id}/status")
def update_user_status(user_id: int, req: UserStatusUpdate, db: Session = Depends(get_db), admin: User = Depends(require_superadmin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Pengguna tidak ditemukan")
    if user.role == "superadmin":
        raise HTTPException(status_code=400, detail="Tidak dapat menonaktifkan Super Admin")
    user.is_active = req.is_active
    
    log = AdminActivityLog(admin_id=admin.id, action=f"{'Aktifkan' if req.is_active else 'Nonaktifkan'} Pengguna", target_table="users", target_id=user_id)
    db.add(log)
    db.commit()
    return {"message": f"Status pengguna diperbarui"}

@router.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db), admin: User = Depends(require_superadmin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Pengguna tidak ditemukan")
    if user.role == "superadmin":
        raise HTTPException(status_code=400, detail="Tidak dapat menghapus Super Admin")
    
    # Hapus juga prediksi terkait pengguna (Cascade Delete)
    db.query(Prediction).filter(Prediction.user_id == user_id).delete()
    db.delete(user)
    
    log = AdminActivityLog(admin_id=admin.id, action="Hapus Pengguna", target_table="users", target_id=user_id)
    db.add(log)
    db.commit()
    return {"message": "Pengguna dan data terkait berhasil dihapus"}

@router.get("/system-info")
def get_system_info(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    # Cek database ping
    try:
        db.execute(text("SELECT 1"))
        db_status = "🟢 Terhubung"
    except Exception:
        db_status = "🔴 Gagal terhubung"

    from app.config import settings
    import os
    # Cek model 
    model_path = settings.MODEL_PATH
    ml_status = "🟢 Siap digunakan (XGBoost)" if os.path.exists(model_path) else "🔴 Model tidak ditemukan"

    return {
        "version": "v2.1.0",
        "db_status": db_status,
        "ml_status": ml_status,
        "server_time": datetime.now().strftime("%A, %d %b %Y, %H.%M") + " WIB"
    }
