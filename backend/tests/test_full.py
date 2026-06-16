"""
=============================================================
TEST SUITE LENGKAP - SiPadiPrediksi API
Mensimulasikan semua alur pengguna yang ada di frontend:
1. Registrasi Petani Baru
2. Login Petani
3. Prediksi dengan berbagai skenario
4. Riwayat prediksi
5. Login Admin & SuperAdmin
6. Dasbor admin stats
7. Kelola data pengguna
8. Cek akses terlarang (otorisasi)
=============================================================
"""
import requests
import json
import sys

BASE_URL = "http://127.0.0.1:8000/api"
PASS_COUNT = 0
FAIL_COUNT = 0
WARN_COUNT = 0

def check(label, condition, resp=None, warn=False):
    global PASS_COUNT, FAIL_COUNT, WARN_COUNT
    status = "[PASS]" if condition else ("[WARN]" if warn else "[FAIL]")
    if condition:
        PASS_COUNT += 1
    elif warn:
        WARN_COUNT += 1
    else:
        FAIL_COUNT += 1
    detail = ""
    if not condition and resp is not None:
        try:
            detail = f"  => {resp.status_code}: {resp.json()}"
        except:
            detail = f"  => {resp.status_code}: {resp.text[:200]}"
    print(f"  {status} {label}{detail}")

def section(title):
    print(f"\n{'='*55}")
    print(f"  {title}")
    print(f"{'='*55}")

# ─── Data Uji ───────────────────────────────────────────────
PETANI_EMAIL    = "petani_test_uat@gmail.com"
PETANI_PASS     = "Petani123"
ADMIN_EMAIL     = "admin@sipadi.id"
ADMIN_PASS      = "Admin123"
SUPER_EMAIL     = "superadmin@sipadi.id"
SUPER_PASS      = "SuperAdmin123"

def run_full_test():

    # ════════════════════════════════════════════════════════
    section("1. REGISTRASI PETANI BARU")
    # ════════════════════════════════════════════════════════
    reg_data = {
        "nama_lengkap": "Petani UAT Test",
        "email": PETANI_EMAIL,
        "password": PETANI_PASS,
        "provinsi": "Jawa Timur"
    }
    r = requests.post(f"{BASE_URL}/auth/register", json=reg_data)
    registered_ok = r.status_code == 200
    # Boleh juga 400 jika email sudah ada (test ulang)
    if r.status_code == 400 and "already registered" in r.text:
        print("  [INFO] Email sudah terdaftar dari sesi sebelumnya, lanjut test login...")
        registered_ok = True
    check("Registrasi petani baru berhasil (200 atau email sudah ada)", registered_ok, r)

    # ════════════════════════════════════════════════════════
    section("2. LOGIN SEMUA TIPE PENGGUNA")
    # ════════════════════════════════════════════════════════

    # Petani
    r = requests.post(f"{BASE_URL}/auth/login", json={"email": PETANI_EMAIL, "password": PETANI_PASS})
    check("Login Petani berhasil (200)", r.status_code == 200, r)
    petani_token = r.json().get("access_token", "") if r.status_code == 200 else ""
    petani_user  = r.json().get("user", {}) if r.status_code == 200 else {}
    check("Token JWT Petani ada dalam respons", bool(petani_token))
    check("Role Petani adalah 'petani'", petani_user.get("role") == "petani")

    # Admin
    r = requests.post(f"{BASE_URL}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASS})
    check("Login Admin berhasil (200)", r.status_code == 200, r)
    admin_token = r.json().get("access_token", "") if r.status_code == 200 else ""
    check("Token JWT Admin ada dalam respons", bool(admin_token))

    # SuperAdmin
    r = requests.post(f"{BASE_URL}/auth/login", json={"email": SUPER_EMAIL, "password": SUPER_PASS})
    check("Login SuperAdmin berhasil (200)", r.status_code == 200, r)
    super_token = r.json().get("access_token", "") if r.status_code == 200 else ""
    check("Token JWT SuperAdmin ada dalam respons", bool(super_token))

    # Login dengan password salah
    r = requests.post(f"{BASE_URL}/auth/login", json={"email": PETANI_EMAIL, "password": "SalahSemua!"})
    check("Login dengan password salah ditolak (401)", r.status_code == 401, r)

    if not petani_token:
        print("\n[FATAL] Token petani kosong, tidak bisa lanjutkan test prediksi.")
        return

    # ════════════════════════════════════════════════════════
    section("3. PREDIKSI PANEN (berbagai skenario)")
    # ════════════════════════════════════════════════════════
    petani_h = {"Authorization": f"Bearer {petani_token}", "Content-Type": "application/json"}

    # Skenario A: Kondisi optimal (irigasi penuh, pupuk cukup)
    payload_a = {"provinsi": "Jawa Timur", "cultivar_name": "IR 72", "sowing_doy": 90,
                 "n_total_kg_ha": 150.0, "plant_pop": 30.0, "water_code": "A", "luas_lahan_ha": 1.5}
    r = requests.post(f"{BASE_URL}/predict", json=payload_a, headers=petani_h)
    check("Skenario A: Prediksi irigasi penuh + pupuk optimal (200)", r.status_code == 200, r)
    if r.status_code == 200:
        hasil_a = r.json()
        check("Skenario A: yield_kg_ha > 0", hasil_a.get("yield_kg_ha", 0) > 0)
        check("Skenario A: Kategori terisi (bukan kosong)", bool(hasil_a.get("kategori")))
        check("Skenario A: Rekomendasi tersedia", len(hasil_a.get("rekomendasi", [])) > 0)
        check("Skenario A: Tersimpan di DB (id > 0)", hasil_a.get("id", 0) > 0)
        print(f"  [INFO] Hasil: {hasil_a['yield_kg_ha']} kg/ha - {hasil_a['kategori']}")

    # Skenario B: Kondisi sulit (tadah hujan, tanpa pupuk)
    payload_b = {"provinsi": "Nusa Tenggara Timur", "cultivar_name": "IR 36", "sowing_doy": 120,
                 "n_total_kg_ha": 0.0, "plant_pop": 15.0, "water_code": "N", "luas_lahan_ha": 0.5}
    r = requests.post(f"{BASE_URL}/predict", json=payload_b, headers=petani_h)
    check("Skenario B: Prediksi tadah hujan tanpa pupuk (200)", r.status_code == 200, r)
    if r.status_code == 200:
        hasil_b = r.json()
        check("Skenario B: Ada catatan risiko (> 1)", len(hasil_b.get("catatan_risiko", [])) > 0)
        print(f"  [INFO] Hasil: {hasil_b['yield_kg_ha']} kg/ha - {hasil_b['kategori']}")

    # Skenario C: Provinsi tidak ada di DB
    payload_c = {"provinsi": "Antartika Utara", "cultivar_name": "IR 64", "sowing_doy": 100,
                 "n_total_kg_ha": 100.0, "plant_pop": 20.0, "water_code": "A", "luas_lahan_ha": 1.0}
    r = requests.post(f"{BASE_URL}/predict", json=payload_c, headers=petani_h)
    check("Skenario C: Provinsi tidak valid ditolak (400)", r.status_code == 400, r)

    # Skenario D: Prediksi tanpa token (harus ditolak)
    r = requests.post(f"{BASE_URL}/predict", json=payload_a)
    check("Skenario D: Prediksi tanpa token ditolak (401/403)", r.status_code in [401, 403], r)

    # ════════════════════════════════════════════════════════
    section("4. RIWAYAT PREDIKSI PETANI")
    # ════════════════════════════════════════════════════════
    r = requests.get(f"{BASE_URL}/predict/history", headers=petani_h)
    check("Ambil riwayat prediksi petani (200)", r.status_code == 200, r)
    if r.status_code == 200:
        history = r.json()
        check("Riwayat memiliki field 'items'", "items" in history)
        check("Riwayat memiliki field 'total'", "total" in history)
        check("Total riwayat >= 2 (dari skenario A & B)", history.get("total", 0) >= 2)
        print(f"  [INFO] Total riwayat prediksi petani ini: {history.get('total')} item")

    # ════════════════════════════════════════════════════════
    section("5. PANEL ADMIN - DASBOR STATISTIK")
    # ════════════════════════════════════════════════════════
    admin_h = {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}
    r = requests.get(f"{BASE_URL}/admin/dashboard/stats", headers=admin_h)
    check("Admin: Ambil stats dasbor (200)", r.status_code == 200, r)
    if r.status_code == 200:
        stats = r.json()
        check("Stats: total_users ada", "total_users" in stats)
        check("Stats: total_predictions > 0", stats.get("total_predictions", 0) > 0)
        check("Stats: avg_yield > 0", stats.get("avg_yield", 0) > 0)
        check("Stats: aktivitas_terbaru ada", "aktivitas_terbaru" in stats)
        print(f"  [INFO] Total Prediksi di DB: {stats.get('total_predictions')}")
        print(f"  [INFO] Rata-rata Panen: {stats.get('avg_yield')} kg/ha")

    # Petani tidak boleh akses admin
    r = requests.get(f"{BASE_URL}/admin/dashboard/stats", headers=petani_h)
    check("Petani diblokir dari endpoint admin (403)", r.status_code == 403, r)

    # ════════════════════════════════════════════════════════
    section("6. PANEL ADMIN - KELOLA PENGGUNA")
    # ════════════════════════════════════════════════════════
    r = requests.get(f"{BASE_URL}/admin/users", headers=admin_h)
    check("Admin: Ambil semua user (200)", r.status_code == 200, r)
    if r.status_code == 200:
        users = r.json()
        check("Daftar user berisi list", isinstance(users, list))
        check("Daftar user tidak kosong (ada seed data)", len(users) > 0)
        roles = [u.get("role") for u in users]
        check("Ada user dengan role 'superadmin'", "superadmin" in roles)
        check("Ada user dengan role 'admin'", "admin" in roles)
        print(f"  [INFO] Total user di DB: {len(users)}")



    # ════════════════════════════════════════════════════════
    section("8. KEAMANAN (Authorization Boundaries)")
    # ════════════════════════════════════════════════════════
    # Request tanpa token ke semua endpoint terlindungi
    endpoints_protected = [
        ("GET", "/predict/history"),
        ("GET", "/admin/dashboard/stats"),
        ("GET", "/admin/users"),
    ]
    for method, ep in endpoints_protected:
        r = requests.request(method, f"{BASE_URL}{ep}")
        check(f"Endpoint {ep} tanpa token ditolak (401)", r.status_code == 401, r)

    # ════════════════════════════════════════════════════════
    section("RINGKASAN HASIL TEST")
    # ════════════════════════════════════════════════════════
    total = PASS_COUNT + FAIL_COUNT + WARN_COUNT
    print(f"\n  Total Test : {total}")
    print(f"  [PASS]     : {PASS_COUNT}")
    print(f"  [WARN]     : {WARN_COUNT}")
    print(f"  [FAIL]     : {FAIL_COUNT}")
    print()
    if FAIL_COUNT == 0:
        print("  SEMUA TES LULUS! Sistem berjalan 100% benar.")
    else:
        print(f"  ADA {FAIL_COUNT} TES GAGAL. Perlu diperiksa lebih lanjut.")

if __name__ == "__main__":
    run_full_test()
