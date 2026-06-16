import os
import random
from datetime import datetime, timedelta
from app.database import SessionLocal, engine, Base
from app.models.user import User
from app.models.prediction import Prediction
from app.models.provinsi_geo import ProvinsiGeo
from app.services.auth_service import get_password_hash
from app.services.ml_service import ml_service

# Constants for generating data
NAMES = [
    "Ahmad Sugiman", "Budi Santoso", "Cipto Raharjo", "Dedi Haryanto", 
    "Eko Prasetyo", "Fajar Nugroho", "Gatot Subroto", "Hadi Saputra",
    "Iwan Setiawan", "Joko Widodo"
]
CULTIVARS = ["IR_36", "IR_64", "Ciherang", "Inpari_32", "Membramo", "Sintanur"]
WATER_CODES = ["I", "N"]  # I = Irigasi, N = Tadah Hujan

def random_date(start, end):
    return start + timedelta(
        seconds=random.randint(0, int((end - start).total_seconds())),
    )

def seed_farmers(db):
    print("Mengecek petani...")
    petani_count = db.query(User).filter(User.role == "petani").count()
    if petani_count < len(NAMES):
        print(f"Membuat {len(NAMES)} akun petani fiktif...")
        provinsis = db.query(ProvinsiGeo.nama).all()
        prov_list = [p[0] for p in provinsis]
        
        for name in NAMES:
            email = name.lower().replace(" ", ".") + "@petani.com"
            if not db.query(User).filter(User.email == email).first():
                user = User(
                    nama_lengkap=name,
                    email=email,
                    no_hp=f"0812{random.randint(1000000, 9999999)}",
                    provinsi=random.choice(prov_list) if prov_list else "Jawa Tengah",
                    password_hash=get_password_hash("Petani123"),
                    role="petani",
                    is_active=True,
                    created_at=random_date(datetime.now() - timedelta(days=365), datetime.now() - timedelta(days=30))
                )
                db.add(user)
        db.commit()

def generate_predictions(db, num_predictions=150):
    print(f"Memulai injeksi {num_predictions} riwayat prediksi...")
    users = db.query(User).filter(User.role == "petani").all()
    provinsis = db.query(ProvinsiGeo).all()
    
    if not users or not provinsis:
        print("Error: Tidak ada user petani atau data provinsi!")
        return

    now = datetime.now()
    start_date = now - timedelta(days=365) # 1 year ago

    added = 0
    for _ in range(num_predictions):
        user = random.choice(users)
        geo = random.choice(provinsis)
        
        # Random inputs
        sowing_doy = random.randint(1, 365)
        n_total = random.uniform(0, 200)
        plant_pop = random.uniform(50, 150)
        cultivar = random.choice(CULTIVARS)
        water = random.choice(WATER_CODES)
        luas = random.uniform(0.5, 5.0)
        
        features = {
            'latitude': geo.latitude,
            'longitude': geo.longitude,
            'elevation_m': geo.elevation_m,
            'sowing_doy': sowing_doy,
            'n_total_kg_ha': n_total,
            'plant_pop': plant_pop,
            'cultivar_name': cultivar,
            'water_code': water
        }
        
        # Predict using actual ML model
        try:
            yield_kg_ha = ml_service.predict(features)
        except Exception as e:
            # Model might not be loaded if file doesn't exist, fallback random if strictly needed
            # But the requirement is to use the model, so we fail if model is bad
            print("Model ML Error:", e)
            continue
            
        # Logic categories (kopian dari predict.py)
        if yield_kg_ha >= 7000:
            kategori = "Sangat Baik"
        elif yield_kg_ha >= 4000:
            kategori = "Baik"
        elif yield_kg_ha >= 2000:
            kategori = "Cukup"
        else:
            kategori = "Perlu Perhatian"
            
        catatan_risiko = []
        if yield_kg_ha < 2000:
            catatan_risiko.append("Potensi panen sangat rendah. Lahan berada dalam risiko gagal panen.")
        if water == "N":
            catatan_risiko.append("Sistem tadah hujan rawan kekeringan saat kemarau panjang.")
        if n_total == 0:
            catatan_risiko.append("Tanpa pupuk Nitrogen, tanaman kerdil.")
        if not catatan_risiko:
            catatan_risiko.append("Kondisi lahan cukup ideal.")
            
        rekomendasi = []
        if n_total < 50 and yield_kg_ha < 4000:
            rekomendasi.append("Tingkatkan dosis pupuk urea.")
        else:
            rekomendasi.append("Jaga jadwal pengairan yang konsisten.")
            
        created_at = random_date(start_date, now)
        
        pred = Prediction(
            user_id=user.id,
            provinsi=geo.nama,
            latitude=geo.latitude,
            longitude=geo.longitude,
            elevation_m=geo.elevation_m,
            cultivar_name=cultivar,
            sowing_doy=sowing_doy,
            n_total_kg_ha=round(n_total, 2),
            plant_pop=round(plant_pop, 2),
            water_code=water,
            luas_lahan_ha=round(luas, 2),
            yield_kg_ha=round(yield_kg_ha, 2),
            kategori=kategori,
            catatan_risiko=catatan_risiko,
            rekomendasi=rekomendasi,
            created_at=created_at
        )
        db.add(pred)
        added += 1

    db.commit()
    print(f"Berhasil menginjeksi {added} data prediksi palsu tapi realistis!")

if __name__ == "__main__":
    db = SessionLocal()
    try:
        seed_farmers(db)
        generate_predictions(db, 150)
    finally:
        db.close()
