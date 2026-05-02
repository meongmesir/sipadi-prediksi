# Software Requirements Specification (SRS)
## TaniPrediksi — Sistem Prediksi Produksi & Harga Komoditas Padi

**Versi Dokumen:** 3.0
**Tanggal:** 2 Mei 2026
**Konteks:** Tugas Mata Kuliah Rekayasa Perangkat Lunak
**Penyusun:** Tim Pengembang TaniPrediksi

---

## 1. Deskripsi Sistem

### 1.1 Latar Belakang

Sektor pertanian padi di Indonesia menghadapi tantangan klasik berupa ketidakpastian hasil panen dan fluktuasi harga jual gabah yang sering merugikan petani. Petani umumnya mengandalkan intuisi atau pengalaman turun-temurun dalam menentukan luas tanam, varietas, dan waktu panen, tanpa dukungan data kuantitatif yang memadai. Di sisi lain, Kementerian Pertanian (Kementan) telah menerbitkan berbagai rekomendasi resmi — mulai dari Harga Pokok Pembelian (HPP), varietas unggul, hingga dosis pemupukan — namun informasi ini sering tidak sampai ke petani secara terstruktur dan tepat waktu.

**TaniPrediksi** dirancang sebagai solusi digital berbasis web yang menjembatani kesenjangan tersebut. Sistem ini memanfaatkan kombinasi data input petani (kondisi lahan, varietas yang dipilih, pola tanam) dengan parameter rekomendasi resmi Kementan untuk menghasilkan prediksi produksi (ton/ha) sekaligus proyeksi harga jual gabah pada periode panen mendatang.

### 1.2 Identitas Sistem

| Atribut | Nilai |
|---------|-------|
| Nama Sistem | TaniPrediksi |
| Domain | Pertanian / Agritech |
| Komoditas Fokus | Padi (Oryza sativa) |
| Tipe Aplikasi | Web Application (Single Page Application) |
| Model Pengguna | Multi-role (Petani, Admin, Super Admin) |
| Pendekatan UI | Role-based color coding (Hijau / Amber / Violet) |

### 1.3 Karakteristik Sistem

TaniPrediksi dibangun di atas tiga pilar utama:

1. **Aksesibilitas** — Antarmuka berbahasa Indonesia, navigasi sederhana, dan pembedaan visual berbasis warna yang mudah dikenali petani dengan latar belakang literasi digital beragam.
2. **Akurasi Data** — Hasil prediksi tidak hanya bergantung pada input petani, tetapi juga divalidasi dengan parameter resmi Kementan sehingga hasilnya mencerminkan realita kebijakan pertanian nasional.
3. **Tata Kelola Berbasis Peran** — Sistem menerapkan *role-based access control* (RBAC) tiga lapis untuk memastikan setiap aktor (petani, admin operasional, super admin) hanya mengakses fitur sesuai kewenangannya.

### 1.4 Tujuan Sistem

**Tujuan Umum:**
Mendukung transformasi digital sektor pertanian padi melalui sistem prediksi yang akurat, terjangkau, dan mudah digunakan.

**Tujuan Khusus:**
- Menyediakan estimasi produksi padi berbasis kombinasi data petani dan rekomendasi Kementan.
- Menyajikan proyeksi harga jual gabah agar petani dapat merencanakan waktu panen dan strategi penjualan.
- Memberikan kanal terpusat bagi pemerintah (melalui Admin) untuk menyebarkan parameter resmi.
- Menghasilkan dasbor analitik bagi pengambil kebijakan untuk memantau tren produksi dan harga lintas wilayah.
- Memfasilitasi pengelolaan multi-pengguna dengan tingkat kewenangan berbeda secara aman dan terstruktur.

### 1.5 Manfaat Sistem

**Bagi Petani:**
- Pengambilan keputusan bercocok tanam berbasis data, bukan asumsi.
- Estimasi pendapatan musim panen yang lebih realistis.
- Akses cepat ke rekomendasi resmi Kementan tanpa perlu mencari di banyak sumber.

**Bagi Admin / Penyuluh:**
- Pemantauan tren produksi dan harga secara visual.
- Kemudahan dalam memperbarui parameter HPP dan rekomendasi.
- Pembuatan laporan periodik untuk evaluasi program.

**Bagi Super Admin / Pengambil Kebijakan:**
- Kontrol penuh atas tata kelola pengguna dan admin sistem.
- Pengaturan parameter prediksi yang mencerminkan kebijakan terbaru.
- Audit aktivitas admin melalui status login dan riwayat aksi.

---

## 2. Ruang Lingkup Sistem

### 2.1 Cakupan Fungsional

**A. Modul Autentikasi & Manajemen Sesi**
- Registrasi akun petani secara mandiri dengan validasi email.
- Login multi-role dengan deteksi otomatis berdasarkan kredensial.
- *Auth gate* wajib: konten utama tidak dapat diakses tanpa autentikasi.
- Logout dan invalidasi sesi.
- Penyimpanan sesi pengguna selama browser aktif.

**B. Modul Petani**
- Form Prediksi dua blok (Blok A editable + Blok B read-only).
- Perhitungan prediksi produksi dan harga otomatis.
- Riwayat prediksi pribadi dengan filter periode.
- Profil pengguna (edit nama, alamat, kontak).
- Tampilan rekomendasi Kementan terbaru.

**C. Modul Admin Operasional**
- Dasbor dengan kartu KPI dan grafik tren.
- Manajemen Data Prediksi (lihat seluruh prediksi petani, filter, ekspor).
- Manajemen Harga Komoditas dan HPP Nasional (CRUD).
- Pembuatan Laporan periodik (harian, mingguan, bulanan).
- Notifikasi sistem (input data baru, anomali harga).

**D. Modul Super Admin**
- Seluruh fitur Admin + akses tambahan.
- Kelola Pengguna (lihat, suspend, hapus akun petani).
- Kelola Admin (tambah admin baru, toggle aktif/nonaktif, lihat login terakhir).
- Pengaturan Sistem (parameter prediksi, default HPP, konfigurasi global).
- Audit log aktivitas admin.

**E. Modul Visualisasi & Pelaporan**
- Grafik tren produksi dan harga (line chart, bar chart).
- Tabel ringkasan dengan sorting dan pagination.
- Ekspor laporan ke format PDF/Excel.
- Filter multi-dimensi (periode, wilayah, varietas).

### 2.2 Di Luar Cakupan (Out of Scope)

Hal-hal berikut **tidak** termasuk dalam ruang lingkup sistem:

- Integrasi pembayaran atau transaksi jual-beli komoditas secara langsung.
- Integrasi *real-time* dengan sistem ERP atau database internal Kementan.
- Aplikasi mobile native (Android/iOS); sistem hanya berbentuk web responsif.
- Fitur chat *real-time* atau forum diskusi antar petani.
- Sistem rekomendasi berbasis Machine Learning lanjutan; perhitungan menggunakan formula deterministik.
- Integrasi dengan sensor IoT lapangan (misalnya pengukur kelembaban tanah otomatis).
- Sistem peringatan dini cuaca ekstrem berbasis BMKG.
- Antarmuka multi-bahasa.

### 2.3 Asumsi dan Ketergantungan

**Asumsi:**
- Pengguna memiliki perangkat dengan akses internet minimal 4G.
- Data rekomendasi Kementan diinput secara berkala oleh Admin.
- Petani memiliki literasi digital dasar untuk mengoperasikan form web.
- Email valid digunakan sebagai identitas unik tiap akun.

**Ketergantungan:**
- Browser modern dengan dukungan ES2020+.
- Ketersediaan layanan hosting frontend dan backend.

---

## 3. Batasan Sistem

| No | Kategori | Batasan |
|----|----------|---------|
| 1 | Komoditas | Hanya komoditas **padi**; tidak mencakup jagung, kedelai, atau komoditas lain. |
| 2 | Sumber Data | Rekomendasi Kementan bersifat **statis**, diinput manual oleh Admin tanpa sinkronisasi otomatis ke API resmi. |
| 3 | Browser | Hanya mendukung browser modern: Chrome, Edge, Firefox, dan Safari versi 2 tahun terakhir. Internet Explorer tidak didukung. |
| 4 | Bahasa | Antarmuka hanya tersedia dalam **Bahasa Indonesia**. |
| 5 | Akun Admin | Akun Admin dan Super Admin bersifat *seeded* (kredensial telah ditentukan), tidak melalui registrasi publik. |
| 6 | Kapasitas Riwayat | Maksimum 100 data prediksi terakhir per akun petani yang ditampilkan dalam halaman riwayat. |
| 7 | Keamanan | Belum mendukung autentikasi multi-faktor (MFA) atau OAuth pihak ketiga. |
| 8 | Offline | Tidak mendukung mode offline; koneksi internet wajib aktif. |
| 9 | Wilayah | Prediksi berbasis parameter umum nasional; tidak mempertimbangkan variasi mikro-iklim per kabupaten secara mendalam. |
| 10 | Algoritma | Mesin prediksi menggunakan **formula deterministik berbasis koefisien**, bukan model probabilistik berbasis Machine Learning. |

---

## 4. Grouping Access, Role and Privileges User

### 4.1 Definisi Aktor

**Petani (User)**
Pengguna akhir sistem yang berperan sebagai pelaku usaha tani padi. Mendaftar secara mandiri, mengisi data prediksi, dan memanfaatkan hasil estimasi untuk perencanaan musim tanam.

**Admin (Operator)**
Pengelola data harian sistem. Bertanggung jawab atas keakuratan data harga komoditas, parameter HPP nasional, serta pemantauan aktivitas prediksi petani. Tidak memiliki kewenangan mengelola akun pengguna atau admin lain.

**Super Admin (Administrator Sistem)**
Pengelola tertinggi dengan akses penuh. Bertanggung jawab atas tata kelola pengguna, manajemen admin, serta konfigurasi parameter sistem global. Memiliki seluruh hak Admin ditambah kewenangan administratif tingkat sistem.

### 4.2 Kredensial dan Identifikasi Visual

| Role | Email | Password | Warna Aksen | Halaman Utama |
|------|-------|----------|-------------|---------------|
| Petani | (registrasi mandiri) | (dipilih saat daftar) | Hijau (`#16a34a`) | Form Prediksi |
| Admin | `admin@sipadi.id` | `Admin123` | Amber (`#f59e0b`) | Dasbor Admin |
| Super Admin | `superadmin@sipadi.id` | `SuperAdmin123` | Violet (`#7c3aed`) | Dasbor Super Admin |

### 4.3 Matriks Hak Akses (Privilege Matrix)

| Modul / Fitur | Petani | Admin | Super Admin |
|---------------|:------:|:-----:|:-----------:|
| **AUTENTIKASI** |
| Registrasi mandiri | ✓ | – | – |
| Login | ✓ | ✓ | ✓ |
| Logout | ✓ | ✓ | ✓ |
| Edit profil pribadi | ✓ | ✓ | ✓ |
| **PREDIKSI** |
| Mengisi form prediksi (Blok A) | ✓ | – | – |
| Melihat rekomendasi Kementan (Blok B) | ✓ | ✓ | ✓ |
| Melihat hasil prediksi pribadi | ✓ | – | – |
| Melihat seluruh data prediksi | – | ✓ | ✓ |
| Mengekspor data prediksi | – | ✓ | ✓ |
| **DATA MASTER** |
| Input/edit Harga Komoditas | – | ✓ | ✓ |
| Input/edit HPP Nasional | – | ✓ | ✓ |
| Input/edit rekomendasi Kementan | – | ✓ | ✓ |
| **DASBOR & LAPORAN** |
| Dasbor petani (KPI pribadi) | ✓ | – | – |
| Dasbor admin operasional | – | ✓ | ✓ |
| Dasbor super admin (banner + status admin) | – | – | ✓ |
| Generate laporan periodik | – | ✓ | ✓ |
| **MANAJEMEN PENGGUNA** |
| Lihat daftar pengguna petani | – | – | ✓ |
| Suspend / aktifkan akun petani | – | – | ✓ |
| Hapus akun petani | – | – | ✓ |
| **MANAJEMEN ADMIN** |
| Lihat daftar admin | – | – | ✓ |
| Tambah admin baru | – | – | ✓ |
| Toggle aktif/nonaktif admin | – | – | ✓ |
| Lihat login terakhir admin | – | – | ✓ |
| **PENGATURAN SISTEM** |
| Konfigurasi parameter prediksi | – | – | ✓ |
| Konfigurasi HPP default | – | – | ✓ |
| Audit log aktivitas | – | – | ✓ |

### 4.4 Aturan Eskalasi dan Pembatasan

- **Pemisahan Tugas (Segregation of Duties):** Admin tidak dapat mengelola akun pengguna untuk mencegah penyalahgunaan wewenang.
- **Tidak Ada Demosi Otomatis:** Super Admin tidak dapat diturunkan menjadi Admin tanpa intervensi manual di level data.
- **Self-Lock Prevention:** Super Admin tidak dapat menonaktifkan akunnya sendiri.
- **Auth Gate Wajib:** Setiap akses ke halaman internal akan dialihkan ke modal autentikasi jika sesi tidak valid.

---

## 5. Platform, Language, Technology and Environment

### 5.1 Platform Target

- **Tipe Aplikasi:** Web Application (Single Page Application).
- **Pendekatan Desain:** Desktop-first, dengan adaptasi responsif untuk tablet (≥ 768px) dan mobile (≥ 360px).
- **Mode Deployment:** Static hosting untuk frontend, dengan opsi backend terpisah untuk persistensi data.

### 5.2 Bahasa Pemrograman

| Bahasa | Peran |
|--------|-------|
| **TypeScript** | Bahasa utama; memberikan type safety pada seluruh komponen. |
| **JavaScript (ES2020+)** | Runtime eksekusi di browser. |
| **HTML5** | Struktur markup dasar. |
| **CSS3** | Styling dasar (terutama melalui utility classes Tailwind). |

### 5.3 Framework dan Library

**Core Framework:**
- **React 18** — library UI deklaratif berbasis komponen.
- **TypeScript 5.x** — superset JavaScript dengan static typing.

**Styling:**
- **Tailwind CSS v4** — utility-first CSS framework.
- **CSS Variables** — untuk token desain (warna, spacing, typography).

**State & Form Management:**
- **React Hooks** untuk manajemen state internal.
- **react-hook-form** untuk manajemen form dengan validasi.

**Visualisasi Data:**
- **Recharts** — library charting berbasis React.

**Komponen UI Pendukung:**
- **lucide-react** — icon set modern.
- Pola komponen reusable (button, card, dialog, table).

**Tooling & Build:**
- **Vite** — build tool dan dev server.
- **pnpm** — package manager.
- **ESLint + Prettier** — linting dan formatting kode.

### 5.4 Lingkungan Pengembangan

| Komponen | Spesifikasi |
|----------|-------------|
| IDE | Visual Studio Code dengan ekstensi ESLint, Prettier, dan Tailwind CSS IntelliSense. |
| Runtime | Node.js 20 LTS+ |
| Package Manager | pnpm 8+ |
| Sistem Operasi | Cross-platform (Windows, macOS, Linux). |
| Version Control | Git + GitHub/GitLab |
| Browser Pengembangan | Chrome dengan React DevTools. |

### 5.5 Lingkungan Deployment

- **Development:** Local dev server pada `localhost`.
- **Staging:** Preview build untuk uji coba sebelum rilis.
- **Production:** Static hosting (Vercel, Netlify, atau hosting setara).

---

## 6. High Level Design Architecture System

### 6.1 Diagram Arsitektur Berlapis

```
┌────────────────────────────────────────────────────────────────┐
│                    LAPISAN PRESENTASI (UI)                      │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────────┐    │
│  │ Antarmuka    │  │ Antarmuka    │  │ Antarmuka           │    │
│  │ Petani       │  │ Admin        │  │ Super Admin         │    │
│  │ (hijau)      │  │ (amber)      │  │ (violet)            │    │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬──────────┘    │
│         │                 │                      │              │
│  Halaman:               Halaman:              Halaman:          │
│  - Form Prediksi        - Dasbor Admin        - Dasbor SA       │
│  - Hasil Prediksi       - Data Prediksi       - Kelola User     │
│  - Riwayat              - Harga & HPP         - Kelola Admin    │
│  - Profil               - Laporan             - Pengaturan      │
└─────────┬──────────────────┬─────────────────────┬─────────────┘
          │                  │                     │
┌─────────▼──────────────────▼─────────────────────▼─────────────┐
│              LAPISAN ROUTING & GUARD                            │
│  - Auth Gate (modal autentikasi wajib sebelum konten)           │
│  - Role Resolver (mengarahkan tampilan sesuai peran)            │
│  - Route Guard (pemeriksaan privilege per halaman)              │
└─────────┬───────────────────────────────────────────────────────┘
          │
┌─────────▼───────────────────────────────────────────────────────┐
│              LAPISAN LOGIKA BISNIS (SERVICE)                     │
│  - Layanan Autentikasi (login, register, role detection)        │
│  - Mesin Prediksi (perhitungan produksi & harga)                │
│  - Layanan Manajemen Pengguna & Admin                           │
│  - Layanan Pelaporan (generate, ekspor)                         │
└─────────┬───────────────────────────────────────────────────────┘
          │
┌─────────▼───────────────────────────────────────────────────────┐
│                 LAPISAN DATA (PERSISTENCE)                       │
│  - Penyimpanan Data Pengguna, Prediksi, Harga, dan HPP           │
│  - Akses melalui adapter agar terlepas dari sumber spesifik      │
└──────────────────────────────────────────────────────────────────┘
```

### 6.2 Pola Arsitektur

- **Component-Based Architecture** — UI disusun dari komponen reusable (atomic → molecular → organism).
- **Layered Architecture** — pemisahan tegas antara presentasi, logika bisnis, dan data.
- **Container–Presentational Pattern** — komponen container menangani state & efek, presentational menangani render.
- **Role-Based Access Control (RBAC)** — kontrol akses berbasis peran di tingkat routing dan komponen.
- **Single Source of Truth** — state global dikelola di satu tempat per domain (auth, user, prediction).

### 6.3 Alur Data (Data Flow)

```
[User Input] → [Form Component] → [Validator]
                                    │
                                    ▼
                          [Service / Engine Layer]
                                    │
                                    ▼
                          [Data Persistence Layer]
                                    │
                                    ▼
                          [State Update / Re-render]
                                    │
                                    ▼
                          [UI Reflection ke User]
```

### 6.4 Pertimbangan Skalabilitas

Arsitektur dirancang dengan pemisahan lapisan agar tetap fleksibel terhadap perubahan kebutuhan:

- **Pemisahan Service Layer** memudahkan penggantian sumber data tanpa mengubah UI.
- **Modularisasi per Role** memungkinkan ekstensi peran baru (misalnya Penyuluh Lapangan, Distributor) tanpa mengganggu peran yang ada.
- **Komponen Reusable** memudahkan penggunaan ulang lintas halaman dan menjaga konsistensi visual.
- **Adapter Pattern** pada lapisan data memungkinkan migrasi sumber data (lokal → REST API → BaaS) tanpa refactor besar.
- **Modul Mesin Prediksi Terpisah** memungkinkan penggantian formula deterministik dengan model lain di kemudian hari tanpa mengubah lapisan UI.

---

## 7. Functional Requirements

Setiap kebutuhan fungsional diberi kode unik untuk memudahkan rujukan saat pengujian dan pemeliharaan.

### 7.1 Modul Autentikasi

| Kode | Kebutuhan | Prioritas |
|------|-----------|-----------|
| FR-01.1 | Sistem harus menampilkan modal autentikasi sebagai *gate* sebelum konten utama dapat diakses. | Wajib |
| FR-01.2 | Sistem harus menyediakan form registrasi untuk role Petani dengan field minimal: nama, email, password, konfirmasi password. | Wajib |
| FR-01.3 | Sistem harus memvalidasi format email dan kekuatan password minimal 8 karakter dengan kombinasi huruf dan angka. | Wajib |
| FR-01.4 | Sistem harus mendeteksi role pengguna secara otomatis berdasarkan email (Petani / Admin / Super Admin). | Wajib |
| FR-01.5 | Sistem harus menampilkan pesan error yang informatif jika login gagal. | Wajib |
| FR-01.6 | Sistem harus menyediakan tombol logout di setiap halaman role yang aktif. | Wajib |
| FR-01.7 | Sistem harus menjaga sesi pengguna selama browser aktif. | Wajib |
| FR-01.8 | Sistem harus mengarahkan pengguna ke halaman default sesuai role setelah login berhasil. | Wajib |

### 7.2 Modul Petani

| Kode | Kebutuhan | Prioritas |
|------|-----------|-----------|
| FR-02.1 | Form Prediksi harus memuat dua blok: Blok A (editable, aksen hijau) dan Blok B (read-only, aksen amber). | Wajib |
| FR-02.2 | Blok A harus memuat field: luas lahan (ha), varietas padi, musim tanam, lokasi (provinsi/kabupaten), kondisi irigasi. | Wajib |
| FR-02.3 | Blok B harus menampilkan rekomendasi Kementan: HPP saat ini, rekomendasi pupuk, harga acuan pasar, varietas unggulan. | Wajib |
| FR-02.4 | Sistem harus memvalidasi seluruh field wajib pada Blok A sebelum submit. | Wajib |
| FR-02.5 | Sistem harus menghitung prediksi produksi (ton) dan harga jual (Rp/kg) berdasarkan kombinasi Blok A dan Blok B. | Wajib |
| FR-02.6 | Sistem harus menyimpan setiap hasil prediksi ke riwayat pengguna. | Wajib |
| FR-02.7 | Sistem harus menyediakan halaman riwayat dengan filter periode dan pencarian. | Wajib |
| FR-02.8 | Sistem harus mengizinkan pengguna mengedit profil pribadi (nama, alamat, kontak). | Sebaiknya |
| FR-02.9 | Sistem harus menampilkan ringkasan rekomendasi Kementan terbaru di halaman beranda petani. | Sebaiknya |

### 7.3 Modul Admin Operasional

| Kode | Kebutuhan | Prioritas |
|------|-----------|-----------|
| FR-03.1 | Sistem harus menampilkan Dasbor Admin dengan minimal 4 kartu KPI: Total Prediksi, Rata-rata Harga, Petani Aktif, Laporan Bulan Ini. | Wajib |
| FR-03.2 | Sistem harus menampilkan grafik tren produksi dan harga 6 bulan terakhir. | Wajib |
| FR-03.3 | Admin harus dapat melihat seluruh data prediksi petani dengan filter (periode, varietas, wilayah). | Wajib |
| FR-03.4 | Admin harus dapat melakukan CRUD pada data Harga Komoditas dan HPP Nasional. | Wajib |
| FR-03.5 | Admin harus dapat melakukan CRUD pada data rekomendasi Kementan yang tampil di Blok B. | Wajib |
| FR-03.6 | Sistem harus menyediakan fitur generate laporan periodik (harian, mingguan, bulanan). | Wajib |
| FR-03.7 | Sistem harus menyediakan opsi ekspor laporan ke format PDF dan Excel. | Sebaiknya |
| FR-03.8 | Sistem harus menampilkan notifikasi apabila ada anomali harga (deviasi > 20% dari HPP). | Opsional |

### 7.4 Modul Super Admin

| Kode | Kebutuhan | Prioritas |
|------|-----------|-----------|
| FR-04.1 | Dasbor Super Admin harus menampilkan banner mode "Super Admin" dengan aksen violet. | Wajib |
| FR-04.2 | Dasbor Super Admin harus menampilkan tabel status admin aktif (kolom: Nama, Email, Status, Login Terakhir). | Wajib |
| FR-04.3 | Super Admin harus dapat melihat daftar seluruh pengguna petani dengan filter dan pencarian. | Wajib |
| FR-04.4 | Super Admin harus dapat melakukan suspend/aktivasi dan penghapusan akun petani. | Wajib |
| FR-04.5 | Super Admin harus dapat menambahkan akun Admin baru melalui form (nama, email, password awal). | Wajib |
| FR-04.6 | Super Admin harus dapat melakukan toggle aktif/nonaktif pada akun Admin. | Wajib |
| FR-04.7 | Super Admin harus dapat melihat halaman Pengaturan Sistem untuk mengubah parameter prediksi dan HPP default. | Wajib |
| FR-04.8 | Super Admin tidak boleh dapat menonaktifkan akunnya sendiri (self-lock prevention). | Wajib |
| FR-04.9 | Sistem harus menyediakan audit log aktivitas admin (login, perubahan data). | Sebaiknya |

### 7.5 Modul Visualisasi & Laporan

| Kode | Kebutuhan | Prioritas |
|------|-----------|-----------|
| FR-05.1 | Sistem harus menyajikan grafik tren menggunakan komponen visualisasi data. | Wajib |
| FR-05.2 | Sistem harus menyediakan filter periode (harian, mingguan, bulanan, tahunan) pada seluruh modul laporan. | Wajib |
| FR-05.3 | Sistem harus menyediakan tabel data dengan fitur sorting, pagination, dan pencarian. | Wajib |
| FR-05.4 | Sistem harus menampilkan tooltip informatif pada setiap titik data grafik. | Sebaiknya |
| FR-05.5 | Sistem harus mendukung dark mode pada visualisasi. | Opsional |

---

## 8. Non Functional Requirements

### 8.1 Kinerja (Performance)

| Aspek | Target |
|-------|--------|
| Waktu muat awal halaman | ≤ 3 detik di koneksi 4G stabil |
| Transisi antar halaman | ≤ 300 ms |
| Waktu respons submit form | ≤ 1 detik |
| Waktu render grafik (≤ 100 titik data) | ≤ 500 ms |
| Ukuran bundle JS terkompresi | ≤ 500 KB (gzipped) |

### 8.2 Kebergunaan (Usability)

- Antarmuka berbahasa Indonesia yang konsisten dan baku.
- Label, tombol, dan pesan kesalahan ditulis dengan kalimat aktif dan jelas.
- Pembedaan visual berbasis warna per role (hijau/amber/violet) untuk konteks yang langsung dikenali.
- Penggunaan ikon konsisten dari satu sumber.
- Setiap aksi penting (submit, hapus, logout) harus memiliki konfirmasi atau umpan balik visual.
- Form validation harus inline dan real-time, bukan hanya saat submit.

### 8.3 Keandalan (Reliability)

- *Auth gate* mencegah akses tidak sah ke halaman terlindungi.
- Validasi form mencegah pengiriman data invalid ke layer logika bisnis.
- Sistem harus menampilkan pesan jelas saat terjadi error dan tidak crash secara diam-diam.
- *Error boundary* harus dipasang di level aplikasi untuk menangkap error tak tertangani.
- Operasi destruktif (hapus akun, nonaktif admin) harus melalui konfirmasi ganda.

### 8.4 Keamanan (Security)

- Password harus disimpan dalam bentuk *hash* menggunakan algoritma standar industri (bcrypt/argon2).
- Pemeriksaan role dilakukan di setiap perpindahan halaman, bukan hanya di entry point.
- Input pengguna harus disanitasi untuk mencegah XSS.
- Sesi harus berakhir otomatis setelah periode tidak aktif tertentu (default 30 menit).
- Data sensitif tidak boleh dicatat ke console di mode produksi.

### 8.5 Keterpeliharaan (Maintainability)

- Struktur folder modular berdasarkan fitur/domain.
- TypeScript dijalankan dalam *strict mode*.
- Penamaan variabel, fungsi, dan komponen mengikuti konvensi konsisten (camelCase untuk variabel/fungsi, PascalCase untuk komponen).
- Setiap komponen tidak melebihi 300 baris; fungsi tidak melebihi 50 baris.
- Komentar dibatasi pada bagian yang non-obvious; nama identifier harus self-explanatory.
- Linter dan formatter diaktifkan dengan konfigurasi proyek.

### 8.6 Kompatibilitas (Compatibility)

- Mendukung browser modern terbaru (Chrome, Edge, Firefox, Safari).
- Layout responsif mulai dari layar 360px hingga 1920px+.
- Tidak menggunakan API eksperimental yang belum stabil.

### 8.7 Skalabilitas (Scalability)

Arsitektur dirancang dengan pemisahan lapisan yang jelas sehingga mendukung berbagai dimensi pertumbuhan:

- **Skalabilitas Pengguna:** mampu menangani penambahan akun petani tanpa perubahan struktural pada UI.
- **Skalabilitas Data:** mendukung penambahan komoditas baru (jagung, kedelai) melalui ekstensi parameter, tanpa menulis ulang modul prediksi.
- **Skalabilitas Fitur:** modular role memungkinkan penambahan aktor baru tanpa mengganggu role yang ada.
- **Skalabilitas Geografis:** struktur data wilayah (provinsi → kabupaten → kecamatan) memungkinkan penambahan parameter mikro-iklim per wilayah.
- **Skalabilitas Algoritma:** mesin prediksi dipisah sebagai modul tersendiri sehingga formula dapat diperbarui tanpa mengubah UI.
- **Skalabilitas Integrasi:** lapisan data bersifat adapter, memungkinkan integrasi dengan sumber data eksternal di kemudian hari.

### 8.8 Aksesibilitas (Accessibility)

- Kontras warna mengikuti standar WCAG 2.1 level AA.
- Seluruh elemen interaktif dapat diakses melalui navigasi keyboard.
- Label form selalu disertakan secara eksplisit (tidak hanya placeholder).
- Tombol dan link memiliki teks deskriptif (bukan sekadar "klik di sini").
- Atribut `alt` wajib pada seluruh gambar non-dekoratif.

### 8.9 Portabilitas (Portability)

- Build artifact bersifat static, dapat dideploy di platform mana pun yang melayani file statis.
- Tidak bergantung pada fitur server-specific.
- Konfigurasi environment dipisahkan ke file `.env` yang dapat disesuaikan per lingkungan.

### 8.10 Dokumentasi

- Setiap modul utama memiliki README atau komentar dokumentasi.
- Diagram arsitektur disertakan dalam dokumen proyek.
- Panduan instalasi dan menjalankan proyek tersedia di README utama.
- Riwayat perubahan dicatat dalam CHANGELOG.

---

## 9. Supporting Components

### 9.1 Use Case Diagram (Naratif)

**Aktor:**
- Petani
- Admin
- Super Admin

**Use Case Petani:**
- Registrasi Akun
- Login
- Logout
- Mengisi Form Prediksi
- Melihat Hasil Prediksi
- Melihat Riwayat Prediksi
- Mengedit Profil
- Melihat Rekomendasi Kementan

**Use Case Admin** *(memerlukan Login terlebih dahulu)*:
- Melihat Dasbor Operasional
- Melihat Seluruh Data Prediksi
- Mengelola Harga Komoditas
- Mengelola HPP Nasional
- Mengelola Rekomendasi Kementan
- Generate Laporan
- Ekspor Laporan

**Use Case Super Admin** *(extends seluruh use case Admin)*:
- Melihat Dasbor Super Admin
- Mengelola Pengguna Petani (suspend, hapus)
- Menambah Admin Baru
- Toggle Aktif/Nonaktif Admin
- Mengatur Parameter Sistem
- Melihat Audit Log

**Hubungan:**
- `<<include>>`: Setiap use case operasional **include** Login (kecuali Registrasi).
- `<<extend>>`: Use case Super Admin **extend** use case Admin.

### 9.2 Sequence Diagram (Naratif)

**A. Sequence: Login Petani → Submit Prediksi**

```
Petani       Modal Auth     Layanan Auth     Halaman Petani    Mesin Prediksi    Penyimpanan
  │              │                │                │                 │               │
  │─ buka app ──►│                │                │                 │               │
  │              │─ tampilkan ────│                │                 │               │
  │─ input data►│                │                │                 │               │
  │              │─ validasi ────►│                │                 │               │
  │              │◄ role=petani ──│                │                 │               │
  │◄ sukses ─────│                │                │                 │               │
  │                               │─ render ──────►│                 │               │
  │─ buka form prediksi ─────────────────────────►│                 │               │
  │─ isi Blok A ──────────────────────────────►   │                 │               │
  │─ submit ────────────────────────────────────► │                 │               │
  │                               │                │─ hitung() ─────►│               │
  │                               │                │◄─ hasil ────────│               │
  │                               │                │─ simpan() ─────────────────────►│
  │                               │                │◄─ tersimpan ───────────────────│
  │◄ tampilkan hasil prediksi ─────────────────────│                 │               │
```

**B. Sequence: Super Admin Menambah Admin Baru**

```
Super Admin   Halaman Kelola Admin   Layanan Manajemen Admin   Penyimpanan
    │                  │                       │                    │
    │─ login ─────────►│                       │                    │
    │─ buka kelola admin ►│                    │                    │
    │                  │─ ambil daftar ───────►│                    │
    │                  │◄─ daftar admin ───────│                    │
    │─ klik "Tambah Admin Baru" ►              │                    │
    │                  │─ tampilkan modal ────►│                    │
    │─ isi (nama, email, password) ►           │                    │
    │                  │─ validasi ───────────►│                    │
    │                  │─ create() ───────────►│                    │
    │                  │                       │─ persist ─────────►│
    │                  │                       │◄─ ok ──────────────│
    │                  │◄─ created ────────────│                    │
    │◄ notif sukses + tabel diperbarui ─       │                    │
```

### 9.3 Activity Diagram (Naratif)

**A. Activity: Login dan Routing Berbasis Role**

```
[Mulai]
   │
   ▼
(Buka aplikasi TaniPrediksi)
   │
   ▼
<Modal autentikasi ditampilkan>
   │
   ▼
(Pengguna input email & password)
   │
   ▼
{Validasi format input}
   ├── Tidak valid ──► (Tampilkan error inline) ──► kembali
   │
   ▼ valid
{Cek kredensial}
   ├── Gagal ──► (Tampilkan "email/password salah") ──► kembali
   │
   ▼ sukses
{Identifikasi role}
   ├── Petani      ──► [Tampilkan antarmuka Petani dengan aksen hijau]
   ├── Admin       ──► [Tampilkan antarmuka Admin dengan aksen amber]
   └── SuperAdmin  ──► [Tampilkan antarmuka Super Admin dengan aksen violet]
                          │
                          ▼
                  (Halaman default role ditampilkan)
                          │
                          ▼
                      [Selesai]
```

**B. Activity: Pengisian dan Submit Form Prediksi**

```
[Mulai]
   │
   ▼
(Petani membuka Form Prediksi)
   │
   ▼
(Sistem memuat Blok B dari rekomendasi Kementan)
   │
   ▼
(Petani mengisi Blok A: lahan, varietas, musim, lokasi, irigasi)
   │
   ▼
{Validasi tiap field}
   ├── Tidak valid ──► (Tampilkan error inline) ──► kembali ke pengisian
   │
   ▼ semua valid
(Petani klik "Hitung Prediksi")
   │
   ▼
[Mesin Prediksi memproses Blok A + Blok B]
   │
   ▼
(Sistem menyimpan hasil ke riwayat)
   │
   ▼
(Sistem menampilkan halaman Hasil Prediksi)
   │
   ▼
{Petani memilih aksi}
   ├── Cetak     ──► (Generate PDF)
   ├── Simpan    ──► (sudah otomatis tersimpan)
   └── Tutup     ──► [Kembali ke Beranda]
   │
   ▼
[Selesai]
```

**C. Activity: Super Admin Menonaktifkan Akun Admin**

```
[Mulai]
   │
   ▼
(Super Admin login dan masuk halaman Kelola Admin)
   │
   ▼
(Sistem menampilkan tabel admin)
   │
   ▼
(Super Admin klik toggle pada baris admin tertentu)
   │
   ▼
{Cek: apakah target = akun Super Admin sendiri?}
   ├── Ya ──► (Tampilkan peringatan "tidak dapat menonaktifkan diri sendiri") ──► batal
   │
   ▼ tidak
(Tampilkan dialog konfirmasi)
   │
   ▼
{Konfirmasi pengguna}
   ├── Batal  ──► [kembali tanpa perubahan]
   │
   ▼ Setuju
(Sistem mengubah status admin → nonaktif)
   │
   ▼
(Sistem mencatat aktivitas ke audit log)
   │
   ▼
(Tabel admin diperbarui + notifikasi sukses)
   │
   ▼
[Selesai]
```

### 9.4 Mockup (Deskripsi Visual)

**Mockup 1 — Modal Autentikasi**
Modal terpusat di tengah layar dengan latar overlay gelap semi-transparan. Di bagian atas terdapat logo TaniPrediksi (ikon padi + teks). Dua tab horizontal: "Masuk" dan "Daftar". Field email dan password dengan ikon di sisi kiri. Tombol primer berwarna hijau bertuliskan "Masuk" / "Daftar". Link kecil di bawah: "Lupa password?".

**Mockup 2 — Form Prediksi Petani**
Layout dua kolom pada desktop, menumpuk pada mobile. **Blok A** (kiri, border hijau, header hijau lembut): field luas lahan (input numerik dengan satuan ha), dropdown varietas, dropdown musim tanam, dropdown provinsi → kabupaten, radio kondisi irigasi. **Blok B** (kanan, border amber, header amber lembut, dengan badge "Read-only — Data Kementan"): menampilkan HPP terkini, rekomendasi pupuk (NPK, urea, dosis), harga acuan pasar, varietas unggulan periode ini. Tombol "Hitung Prediksi" berwarna hijau di bawah Blok A.

**Mockup 3 — Halaman Hasil Prediksi**
Header dengan ikon hasil dan judul "Hasil Prediksi Anda". Dua kartu besar: "Estimasi Produksi" (angka besar dalam ton, ikon panen) dan "Estimasi Harga Jual" (angka besar dalam Rp/kg, ikon timbangan). Di bawahnya terdapat ringkasan parameter input dan rekomendasi tindakan. Tombol "Cetak" dan "Kembali ke Beranda".

**Mockup 4 — Dasbor Admin (Amber)**
Sidebar kiri berwarna amber dengan menu: Dasbor, Data Prediksi, Harga Komoditas, HPP Nasional, Laporan. Header atas dengan nama admin dan tombol logout. Area konten utama: 4 kartu KPI di baris atas (Total Prediksi, Rata-rata Harga, Petani Aktif, Laporan Bulan Ini), grafik tren produksi 6 bulan di bawahnya, grafik tren harga di sampingnya, dan tabel ringkasan prediksi terbaru di bagian bawah.

**Mockup 5 — Dasbor Super Admin (Violet)**
Sidebar kiri berwarna violet dengan menu lengkap: Dasbor, Data Prediksi, Harga Komoditas, HPP Nasional, Laporan, Kelola Pengguna, Kelola Admin, Pengaturan Sistem. Banner ungu di bagian atas konten bertuliskan "Mode Super Admin — Anda memiliki akses penuh". Tabel Status Admin Aktif (kolom: Avatar, Nama, Email, Status badge hijau/abu, Login Terakhir). Di bawahnya menyusul KPI dan grafik seperti dasbor Admin.

**Mockup 6 — Halaman Kelola Admin**
Header dengan judul "Kelola Admin" dan tombol "Tambah Admin Baru" (violet) di kanan atas. Tabel admin dengan kolom: No, Nama, Email, Status (badge), Login Terakhir, Aksi (toggle switch + ikon edit). Modal tambah admin muncul saat tombol diklik, berisi form nama, email, password awal, konfirmasi password.

**Mockup 7 — Halaman Kelola Pengguna (Petani)**
Tabel pengguna dengan kolom: No, Nama, Email, Tanggal Daftar, Jumlah Prediksi, Status, Aksi. Filter di atas tabel: pencarian nama/email, dropdown status (semua/aktif/suspend), dropdown periode pendaftaran. Tombol aksi: lihat detail, suspend, hapus (dengan konfirmasi).

**Mockup 8 — Halaman Pengaturan Sistem**
Form konfigurasi terbagi dalam beberapa section: Parameter Prediksi (koefisien produksi, koefisien harga, faktor musim), HPP Default (input numerik per varietas), Konfigurasi Notifikasi (threshold anomali harga). Tombol "Simpan Pengaturan" di bawah dengan konfirmasi sebelum apply.

---

## Lampiran

### A. Glosarium

| Istilah | Definisi |
|---------|----------|
| TaniPrediksi | Nama sistem yang dijelaskan dalam dokumen ini. |
| Kementan | Kementerian Pertanian Republik Indonesia. |
| HPP | Harga Pokok Pembelian — harga minimum yang ditetapkan pemerintah. |
| Blok A | Bagian form prediksi yang diisi petani (editable). |
| Blok B | Bagian form prediksi yang menampilkan rekomendasi Kementan (read-only). |
| Auth Gate | Mekanisme yang mewajibkan autentikasi sebelum konten utama diakses. |
| RBAC | Role-Based Access Control — kontrol akses berbasis peran. |
| SPA | Single Page Application — aplikasi web satu halaman. |
| KPI | Key Performance Indicator — indikator kinerja kunci. |
| CRUD | Create, Read, Update, Delete — operasi dasar manipulasi data. |

### B. Referensi

- Dokumentasi React 18 — https://react.dev
- Dokumentasi Tailwind CSS v4 — https://tailwindcss.com
- IEEE Std 830-1998 — Recommended Practice for Software Requirements Specifications.
- Sommerville, I. *Software Engineering* (10th ed.). Pearson.
- Pressman, R. *Software Engineering: A Practitioner's Approach*.

---

**— Akhir Dokumen SRS —**
