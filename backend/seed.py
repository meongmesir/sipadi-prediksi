from app.database import SessionLocal, engine, Base
from app.models.user import User
from app.models.provinsi_geo import ProvinsiGeo
from app.models.harga import HargaGabah
from app.services.auth_service import get_password_hash

# Create tables
Base.metadata.create_all(bind=engine)

def seed():
    db = SessionLocal()
    
    # 1. Seed SuperAdmin
    if not db.query(User).filter(User.email == "superadmin@sipadi.id").first():
        super_admin = User(
            nama_lengkap="Super Administrator",
            email="superadmin@sipadi.id",
            password_hash=get_password_hash("SuperAdmin123"),
            provinsi="Pusat - Jakarta",
            role="superadmin"
        )
        db.add(super_admin)
        print("Seeded SuperAdmin")
        
    if not db.query(User).filter(User.email == "admin@sipadi.id").first():
        admin = User(
            nama_lengkap="Administrator SiPadi",
            email="admin@sipadi.id",
            password_hash=get_password_hash("Admin123"),
            provinsi="Pusat - Jakarta",
            role="admin"
        )
        db.add(admin)
        print("Seeded Admin")

    # 2. Seed Provinsi
    provinsi_data = [
        {"nama": "Aceh", "latitude": 5.5483, "longitude": 95.3238, "elevation_m": 38.0},
        {"nama": "Sumatera Utara", "latitude": 3.5952, "longitude": 98.6722, "elevation_m": 22.0},
        {"nama": "Sumatera Barat", "latitude": -0.9471, "longitude": 100.4172, "elevation_m": 866.0},
        {"nama": "Riau", "latitude": 0.5071, "longitude": 101.4478, "elevation_m": 10.0},
        {"nama": "Jambi", "latitude": -1.6101, "longitude": 103.6131, "elevation_m": 25.0},
        {"nama": "Sumatera Selatan", "latitude": -2.9909, "longitude": 104.7562, "elevation_m": 27.0},
        {"nama": "Bengkulu", "latitude": -3.7928, "longitude": 102.2608, "elevation_m": 5.0},
        {"nama": "Lampung", "latitude": -5.4295, "longitude": 105.2613, "elevation_m": 84.0},
        {"nama": "Bangka Belitung", "latitude": -2.1316, "longitude": 106.1169, "elevation_m": 10.0},
        {"nama": "Kepulauan Riau", "latitude": 0.9168, "longitude": 104.4554, "elevation_m": 10.0},
        {"nama": "DKI Jakarta", "latitude": -6.2088, "longitude": 106.8456, "elevation_m": 8.0},
        {"nama": "Jawa Barat", "latitude": -6.9147, "longitude": 107.6098, "elevation_m": 768.0},
        {"nama": "Jawa Tengah", "latitude": -7.1510, "longitude": 110.1403, "elevation_m": 105.0},
        {"nama": "DI Yogyakarta", "latitude": -7.7956, "longitude": 110.3695, "elevation_m": 113.0},
        {"nama": "Jawa Timur", "latitude": -7.5361, "longitude": 112.2384, "elevation_m": 50.0},
        {"nama": "Banten", "latitude": -6.1702, "longitude": 106.1503, "elevation_m": 20.0},
        {"nama": "Bali", "latitude": -8.4095, "longitude": 115.1889, "elevation_m": 200.0},
        {"nama": "Nusa Tenggara Barat", "latitude": -8.6529, "longitude": 117.3616, "elevation_m": 50.0},
        {"nama": "Nusa Tenggara Timur", "latitude": -8.6574, "longitude": 121.0794, "elevation_m": 100.0},
        {"nama": "Kalimantan Barat", "latitude": -0.0236, "longitude": 109.3425, "elevation_m": 15.0},
        {"nama": "Kalimantan Tengah", "latitude": -1.6815, "longitude": 113.3824, "elevation_m": 20.0},
        {"nama": "Kalimantan Selatan", "latitude": -3.3194, "longitude": 114.5908, "elevation_m": 20.0},
        {"nama": "Kalimantan Timur", "latitude": 0.5387, "longitude": 116.4194, "elevation_m": 10.0},
        {"nama": "Kalimantan Utara", "latitude": 3.0731, "longitude": 116.0414, "elevation_m": 20.0},
        {"nama": "Sulawesi Utara", "latitude": 1.4931, "longitude": 124.8413, "elevation_m": 20.0},
        {"nama": "Sulawesi Tengah", "latitude": -0.8917, "longitude": 119.8707, "elevation_m": 50.0},
        {"nama": "Sulawesi Selatan", "latitude": -5.1477, "longitude": 119.4327, "elevation_m": 10.0},
        {"nama": "Sulawesi Tenggara", "latitude": -3.9985, "longitude": 122.5129, "elevation_m": 20.0},
        {"nama": "Gorontalo", "latitude": 0.5435, "longitude": 123.0568, "elevation_m": 20.0},
        {"nama": "Sulawesi Barat", "latitude": -2.8441, "longitude": 119.2321, "elevation_m": 20.0},
        {"nama": "Maluku", "latitude": -3.6954, "longitude": 128.1814, "elevation_m": 10.0},
        {"nama": "Maluku Utara", "latitude": 0.7893, "longitude": 127.5801, "elevation_m": 10.0},
        {"nama": "Papua Barat", "latitude": -1.3361, "longitude": 133.1747, "elevation_m": 10.0},
        {"nama": "Papua Barat Daya", "latitude": -0.8615, "longitude": 131.2560, "elevation_m": 10.0},
        {"nama": "Papua", "latitude": -2.5337, "longitude": 140.7181, "elevation_m": 10.0},
        {"nama": "Papua Pegunungan", "latitude": -4.0000, "longitude": 138.5000, "elevation_m": 1550.0},
        {"nama": "Papua Selatan", "latitude": -8.0000, "longitude": 140.0000, "elevation_m": 10.0},
        {"nama": "Papua Tengah", "latitude": -4.0000, "longitude": 136.0000, "elevation_m": 100.0},
    ]

    for p in provinsi_data:
        if not db.query(ProvinsiGeo).filter(ProvinsiGeo.nama == p["nama"]).first():
            geo = ProvinsiGeo(**p)
            db.add(geo)
            
            # Tambahkan harga gabah sekalian
            harga = HargaGabah(
                provinsi=p["nama"],
                harga_saat_ini=5800 + (len(p["nama"]) * 100),
                hpp=6500,
                trend="stabil"
            )
            db.add(harga)

    db.commit()
    print("Seeded Provinsi and Harga")
    db.close()

if __name__ == "__main__":
    seed()
