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
        
    # Generate Catatan Risiko & Rekomendasi (Mock for now, should be extracted to a rule engine)
    catatan_risiko = []
    if req.water_code == "N":
        catatan_risiko.append("Lahan tadah hujan sangat bergantung pada curah hujan")
    if req.n_total_kg_ha == 0:
        catatan_risiko.append("Tanpa pupuk nitrogen, hasil panen akan sangat rendah")
        
    if not catatan_risiko:
        catatan_risiko.append("Tidak ada risiko signifikan yang terdeteksi")
        
    rekomendasi = [
        f"Gunakan benih {req.cultivar_name} bersertifikat",
        f"Pupuk nitrogen total {req.n_total_kg_ha} kg/ha diberikan bertahap"
    ]
    
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
