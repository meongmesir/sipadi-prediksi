from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.prediction import Prediction
from app.models.provinsi_geo import ProvinsiGeo
from app.schemas.prediction import PredictionRequest, PredictionResponse, PredictionHistoryResponse
from app.services.ml_service import ml_service
from app.utils.deps import get_current_user
from app.models.user import User

router = APIRouter(prefix="/predict", tags=["Prediction"])

@router.post("", response_model=PredictionResponse)
def create_prediction(req: PredictionRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Lookup lokasi berdasarkan provinsi
    geo = db.query(ProvinsiGeo).filter(ProvinsiGeo.nama == req.provinsi).first()
    if not geo:
        raise HTTPException(status_code=400, detail="Provinsi tidak ditemukan di database geo")
    
    features = {
        'latitude': geo.latitude,
        'longitude': geo.longitude,
        'elevation_m': geo.elevation_m,
        'sowing_doy': req.sowing_doy,
        'n_total_kg_ha': req.n_total_kg_ha,
        'plant_pop': req.plant_pop,
        'cultivar_name': req.cultivar_name,
        'water_code': req.water_code
    }
    
    # Inferensi Model ML
    yield_kg_ha = ml_service.predict(features)
    
    # Generate Kategori
    if yield_kg_ha >= 7000:
        kategori = "Sangat Baik"
    elif yield_kg_ha >= 4000:
        kategori = "Baik"
    elif yield_kg_ha >= 2000:
        kategori = "Cukup"
    else:
        kategori = "Perlu Perhatian"
        
    # Generate Catatan Risiko (Perhatian Khusus)
    catatan_risiko = []
    if yield_kg_ha < 2000:
        catatan_risiko.append("Potensi panen sangat rendah. Lahan berada dalam risiko gagal panen atau pertumbuhan terhambat.")
    
    if req.water_code == "N":
        catatan_risiko.append("Sistem tadah hujan membuat tanaman rentan terhadap kekeringan jika terjadi kemarau panjang (El Niño).")
        
    if req.n_total_kg_ha == 0:
        catatan_risiko.append("Tidak ada asupan pupuk Nitrogen. Tanaman akan kerdil dan bulir padi tidak akan berisi penuh.")
    elif req.n_total_kg_ha > 150 and yield_kg_ha < 4000:
        catatan_risiko.append("Dosis pupuk sangat tinggi (>150 kg/ha) namun proyeksi panen rendah. Ada risiko pencucian pupuk atau tanah jenuh (pemborosan biaya).")
        
    if req.plant_pop < 50:
        catatan_risiko.append("Kepadatan tanam terlalu renggang, potensi lahan tidak dimanfaatkan secara maksimal.")
    elif req.plant_pop > 150:
        catatan_risiko.append("Kepadatan tanam sangat tinggi (>150 m²). Kelembapan antar tanaman akan meningkat sehingga rawan serangan hama dan jamur.")

    if not catatan_risiko:
        catatan_risiko.append("Tidak ada risiko ekstrem yang terdeteksi. Kondisi lahan cukup ideal.")

    # Generate Rekomendasi (Langkah yang Disarankan)
    rekomendasi = []
    
    # Rekomendasi Pemupukan
    if req.n_total_kg_ha < 50 and yield_kg_ha < 4000:
        rekomendasi.append("Tingkatkan dosis pupuk Urea atau NPK secara bertahap untuk mendongkrak nutrisi vegetatif tanaman.")
    elif req.n_total_kg_ha > 0:
        rekomendasi.append(f"Pecah pemberian pupuk Nitrogen {req.n_total_kg_ha} kg/ha menjadi 3 tahap: pupuk dasar, susulan pertama (14 HST), dan susulan kedua (30 HST).")
        
    # Rekomendasi Air & Tanam
    if req.water_code == "N" and 120 <= req.sowing_doy <= 250:
        rekomendasi.append("Waktu tanam Anda berisiko masuk ke musim kemarau. Siapkan alternatif sumber air seperti sumur bor atau pompa air.")
    
    if req.plant_pop > 150:
        rekomendasi.append("Gunakan sistem tanam Jajar Legowo untuk memperbaiki sirkulasi udara dan mengurangi risiko hama pada lahan padat.")
    elif req.plant_pop < 50:
        rekomendasi.append("Pertimbangkan untuk merapatkan jarak tanam pada siklus berikutnya agar hasil panen per hektar bisa berlipat.")
        
    # Rekomendasi Varietas
    if req.cultivar_name == "IR_36":
        rekomendasi.append("Varietas IR 36 cukup tangguh terhadap wereng, namun tetap lakukan penyemprotan preventif nabati secara berkala.")
    else:
        rekomendasi.append(f"Gunakan benih bersertifikat murni untuk varietas {req.cultivar_name} agar hasil panen tidak menyimpang dari prediksi.")
    
    # Ensure max 4 recommendations
    rekomendasi = rekomendasi[:4]
    
    new_prediction = Prediction(
        user_id=current_user.id,
        provinsi=req.provinsi,
        latitude=geo.latitude,
        longitude=geo.longitude,
        elevation_m=geo.elevation_m,
        cultivar_name=req.cultivar_name,
        sowing_doy=req.sowing_doy,
        n_total_kg_ha=req.n_total_kg_ha,
        plant_pop=req.plant_pop,
        water_code=req.water_code,
        luas_lahan_ha=req.luas_lahan_ha,
        yield_kg_ha=yield_kg_ha,
        kategori=kategori,
        catatan_risiko=catatan_risiko,
        rekomendasi=rekomendasi
    )
    
    db.add(new_prediction)
    db.commit()
    db.refresh(new_prediction)
    
    return new_prediction

@router.get("/history", response_model=PredictionHistoryResponse)
def get_history(page: int = 1, limit: int = 10, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    skip = (page - 1) * limit
    total = db.query(Prediction).filter(Prediction.user_id == current_user.id).count()
    items = db.query(Prediction).filter(Prediction.user_id == current_user.id).order_by(Prediction.created_at.desc()).offset(skip).limit(limit).all()
    
    return {"items": items, "total": total, "page": page, "limit": limit}
