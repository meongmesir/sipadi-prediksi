# SiPadi Prediksi

Sistem Informasi Prediksi Hasil Panen Padi berbasis Machine Learning.

---

## Deskripsi

SiPadi Prediksi adalah aplikasi berbasis web yang digunakan untuk memprediksi hasil panen padi (yield kg/ha) berdasarkan data input agronomis seperti lokasi, luas lahan, jenis pupuk, dan kondisi tanaman. Sistem ini juga menyediakan fitur manajemen pengguna, riwayat prediksi, serta monitoring harga gabah per provinsi.

---

## Fitur

* Autentikasi pengguna (Petani, Admin, Super Admin)
* Prediksi hasil panen menggunakan Machine Learning (XGBoost)
* Input data lahan pertanian
* Riwayat hasil prediksi
* Dashboard pengguna dan admin
* Manajemen data pengguna
* Monitoring harga gabah per provinsi
* Pengaturan sistem oleh super admin

---

## Teknologi yang Digunakan

Frontend:

* React.js
* Vite
* Tailwind CSS
* Radix UI

Backend:

* FastAPI (Python)
* JWT Authentication
* SQLAlchemy

Machine Learning:

* Python
* XGBoost
* Scikit-learn

Database:

* PostgreSQL / SQLite

---

## Cara Menjalankan Proyek

### 1. Clone Repository

```bash
git clone https://github.com/username/sipadi-prediksi.git
cd sipadi-prediksi
```

### 2. Install Frontend

```bash
npm install
npm run dev
```

### 3. Install Backend

```bash
pip install -r requirements.txt
```

Jalankan backend:

```bash
uvicorn main:app --reload
```

---

## Struktur Project

```
sipadi-prediksi/
├── frontend/
├── backend/
│   ├── main.py
│   ├── routes/
│   ├── models/
│   └── services/
├── ml/
│   ├── model.pkl
│   └── training.py
├── requirements.txt
└── README.md
```

## Catatan

* Model menggunakan data agronomis tabular
* Tidak menggunakan sensor IoT real-time
* Data harga gabah berbasis provinsi

---
