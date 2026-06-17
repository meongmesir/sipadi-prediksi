# Panduan Deployment SiPadiPrediksi (Vercel + Render)

Berikut adalah panduan lengkap untuk merilis aplikasi SiPadiPrediksi menggunakan arsitektur modern: **Vercel** untuk Frontend (UI) dan **Render** untuk Backend (API & Machine Learning). Sementara itu, database kita tetap berada di server PostgreSQL jarak jauh (`76.13.194.54`).

---

## 1. Persiapan Akhir (Lokal)
Pastikan semua perubahan terbaru sudah di-*commit* dan di-*push* ke GitHub:
```bash
git add .
git commit -m "Siap deploy ke Vercel & Render"
git push origin main
```

---

## 2. Deployment Backend (FastAPI ke Render)

Render adalah layanan PaaS (Platform as a Service) yang sangat mudah untuk men-*deploy* aplikasi Python/FastAPI langsung dari GitHub.

1. **Buat Akun / Login ke Render**:
   Buka [render.com](https://render.com) dan login dengan akun GitHub kamu.
2. **Buat Web Service Baru**:
   - Klik tombol **"New +"** di pojok kanan atas, lalu pilih **Web Service**.
   - Hubungkan akun GitHub kamu dan pilih repositori `sipadi-prediksi`.
3. **Konfigurasi Web Service**:
   Isi konfigurasi berikut:
   - **Name**: `sipadi-backend` *(atau sesukamu)*
   - **Environment**: `Python`
   - **Root Directory**: `backend` *(Krusial! Pastikan diset ke folder `backend`)*
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port 10000` *(Atau biarkan Render menggunakan port defaultnya dengan: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`)*
4. **Environment Variables**:
   Gulir ke bawah dan klik **Environment Variables**, masukkan data dari `.env` kita:
   - `DATABASE_URL` = `postgresql://sipadi:sipadi123@76.13.194.54:5432/sipadi_prediks`
   - `SECRET_KEY` = `9c8f2e7a1b4d6f8e3c5a9d2e7f1b4c8d6e9a2f5c7b1d4e8f6a9c2e5d7f1b4`
   - `JWT_ALGORITHM` = `HS256`
   - `JWT_EXPIRE_HOURS` = `24`
   - `MODEL_PATH` = `ml_models/xgboost.joblib`
5. **Deploy**:
   Klik tombol **"Create Web Service"**.
6. **Dapatkan URL Backend**:
   Tunggu proses build selesai. Setelah statusnya `Live`, salin URL publik yang diberikan Render (contoh: `https://sipadi-backend.onrender.com`). URL ini akan kita gunakan di Vercel.

---

## 3. Deployment Frontend (React/Vite ke Vercel)

1. **Masuk ke Vercel**: 
   Buka [vercel.com](https://vercel.com/) dan login.
2. **Import Project**: 
   Klik **Add New...** -> **Project**, kemudian pilih repositori `sipadi-prediksi`.
3. **Konfigurasi Build**:
   - Framework Preset: **Vite**
   - Root Directory: `./` *(default)*
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. **Environment Variables**:
   Tambahkan *variable* berikut agar Frontend terhubung ke Backend di Render:
   - Name: `VITE_API_URL`
   - Value: `https://sipadi-backend.onrender.com/api` *(Ganti dengan URL asli yang kamu dapatkan dari Render tadi. Jangan lupa tambah `/api` di belakangnya!)*
5. **Klik Deploy**: 
   Tunggu hingga selesai.
6. **Selesai**: 
   Aplikasi utamamu sekarang sudah mengudara dan bisa diakses dunia!

---

## Tips Tambahan
> [!NOTE]
> Karena di Render API kamu sudah otomatis menggunakan `HTTPS` (disediakan gratis oleh Render), kamu tidak akan lagi menghadapi isu *Mixed Content* saat digabungkan dengan Vercel. Keduanya (Vercel & Render) sama-sama menggunakan protokol aman HTTPS.

> [!WARNING]
> Jika kamu menggunakan tier/paket Gratis di Render, *backend* (API) akan melakukan *sleep* otomatis jika tidak ada yang mengakses selama 15 menit. Artinya, saat pengguna pertama membuka aplikasi setelah sekian lama, proses *login* atau akses data mungkin memakan waktu hingga ~50 detik karena server sedang "bangun tidur" (Cold Start). Ini sangat normal.
