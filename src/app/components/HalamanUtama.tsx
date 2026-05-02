import { ChevronRight, Leaf, ShieldCheck, BarChart3, Star, MapPin } from "lucide-react";

const HERO_IMG = "https://images.unsplash.com/photo-1730251567643-3794cc0db1d5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyaWNlJTIwcGFkZHklMjBmaWVsZCUyMGhhcnZlc3QlMjBncmVlbiUyMEluZG9uZXNpYXxlbnwxfHx8fDE3NzYwODI2ODF8MA&ixlib=rb-4.1.0&q=80&w=1080";
const FARMER_IMG = "https://images.unsplash.com/photo-1602511706963-02ecf61637b3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXJtZXIlMjBpbmRvbmVzaWElMjByaWNlJTIwZmllbGQlMjB3b3JraW5nfGVufDF8fHx8MTc3NjA4MjY4MXww&ixlib=rb-4.1.0&q=80&w=1080";

const fitur = [
  {
    emoji: "📊",
    icon: BarChart3,
    judul: "Estimasi Hasil Panen",
    desc: "Masukkan data lahan padi Anda. Sistem menghitung estimasi hasil panen dalam ton per hektar secara otomatis.",
    warna: "border-green-200 bg-green-50",
    ikonBg: "bg-green-100",
    ikonWarna: "text-green-700",
  },
  {
    emoji: "💰",
    icon: BarChart3,
    judul: "Prediksi Harga Gabah",
    desc: "Lihat prediksi harga gabah 1 hingga 3 bulan ke depan agar Anda bisa memilih waktu jual terbaik.",
    warna: "border-amber-200 bg-amber-50",
    ikonBg: "bg-amber-100",
    ikonWarna: "text-amber-700",
  },
  {
    emoji: "🌤️",
    icon: ShieldCheck,
    judul: "Data Cuaca Otomatis",
    desc: "Data cuaca dari BMKG langsung tampil sesuai lokasi Anda — tidak perlu isi manual, lebih akurat dan mudah.",
    warna: "border-sky-200 bg-sky-50",
    ikonBg: "bg-sky-100",
    ikonWarna: "text-sky-700",
  },
  {
    emoji: "⚠️",
    icon: ShieldCheck,
    judul: "Peringatan Risiko",
    desc: "Sistem memberi tahu risiko gagal panen dan saran cara mengatasinya berdasarkan kondisi lahan Anda.",
    warna: "border-red-200 bg-red-50",
    ikonBg: "bg-red-100",
    ikonWarna: "text-red-700",
  },
];

const langkah = [
  { no: "1", emoji: "📍", judul: "Pilih Lokasi", desc: "Masukkan provinsi dan kabupaten lahan padi Anda." },
  { no: "2", emoji: "📝", judul: "Isi Data Lahan", desc: "Luas lahan, jenis sawah, varietas padi, dan kondisi irigasi." },
  { no: "3", emoji: "⚙️", judul: "Cek Rekomendasi", desc: "Nilai pupuk dan benih sudah terisi otomatis — ubah jika perlu." },
  { no: "4", emoji: "📊", judul: "Lihat Hasil", desc: "Estimasi panen, prediksi harga, dan saran terbaik untuk Anda." },
];

const testimoni = [
  {
    nama: "Pak Suharto",
    lokasi: "Petani Padi, Jawa Tengah",
    pesan: "Sekarang saya tahu perkiraan panen sebelum panen tiba. Bisa persiapkan modal lebih baik!",
    bintang: 5,
    emoji: "👨‍🌾",
  },
  {
    nama: "Bu Sari",
    lokasi: "Petani Padi, Jawa Barat",
    pesan: "Mudah dipakai, tidak ribet. Data cuaca sudah otomatis masuk, saya tidak perlu isi sendiri.",
    bintang: 5,
    emoji: "👩‍🌾",
  },
  {
    nama: "Pak Ridwan",
    lokasi: "Petani Padi, Sulawesi Selatan",
    pesan: "Prediksi harga gabahnya membantu saya menentukan waktu jual yang lebih menguntungkan.",
    bintang: 5,
    emoji: "🧑‍🌾",
  },
];

interface Props {
  onMulai: () => void;
  onDaftar: () => void;
  isLoggedIn: boolean;
  userName?: string;
}

export function HalamanUtama({ onMulai, onDaftar, isLoggedIn, userName }: Props) {
  return (
    <div className="space-y-10">
      {/* ── Hero ── */}
      <div className="relative rounded-3xl overflow-hidden shadow-lg">
        <img
          src={HERO_IMG}
          alt="Lahan Padi Indonesia"
          className="w-full h-72 md:h-96 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-green-900/85 via-green-800/65 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-center px-7 md:px-12">
          <div className="max-w-lg">
            {isLoggedIn && userName ? (
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white text-sm px-4 py-2 rounded-full mb-4 border border-white/30">
                👋 Selamat datang kembali, <strong>{userName.split(" ")[0]}</strong>!
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white text-sm px-4 py-2 rounded-full mb-4 border border-white/30">
                <Leaf className="w-4 h-4" />
                Khusus Komoditas Padi — Data Cuaca Otomatis BMKG
              </div>
            )}
            <h1 className="text-white text-3xl md:text-4xl font-bold leading-tight mb-3">
              Prediksi Panen Padi<br />
              <span className="text-amber-300">Lebih Akurat,</span><br />
              Lebih Menguntungkan
            </h1>
            <p className="text-green-100 text-base leading-relaxed mb-6 max-w-sm">
              Bantu petani padi Indonesia merencanakan panen dan menentukan waktu jual terbaik.
              Isi data lahan — hasil prediksi langsung tampil dalam hitungan detik.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={onMulai}
                className="flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-green-900 font-bold px-7 py-3.5 rounded-xl text-base shadow-lg transition-all hover:scale-105 active:scale-95"
              >
                🌾 Mulai Prediksi Sekarang
                <ChevronRight className="w-5 h-5" />
              </button>
              {!isLoggedIn && (
                <button
                  onClick={onDaftar}
                  className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white border border-white/30 font-medium px-5 py-3.5 rounded-xl text-base backdrop-blur-sm transition-all"
                >
                  Daftar Akun Gratis
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Info Strip (factual only) ── */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { nilai: "34 Provinsi", label: "Cakupan Nasional", emoji: "🗺️" },
          { nilai: "7 Varietas", label: "Pilihan Padi Unggulan", emoji: "🌾" },
          { nilai: "BMKG Live", label: "Data Cuaca Otomatis", emoji: "🌤️" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-5 text-center shadow-sm border border-gray-100">
            <p className="text-3xl mb-1">{s.emoji}</p>
            <p className="text-green-700 font-bold text-lg">{s.nilai}</p>
            <p className="text-gray-500 text-sm mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Fitur ── */}
      <div>
        <h2 className="text-gray-800 font-bold text-xl mb-2 text-center">Apa yang Bisa Dilakukan?</h2>
        <p className="text-gray-500 text-base text-center mb-6">Sistem ini dirancang khusus untuk petani padi Indonesia</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fitur.map((f) => (
            <div key={f.judul} className={`rounded-2xl p-5 border-2 ${f.warna} shadow-sm`}>
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 ${f.ikonBg} rounded-2xl flex items-center justify-center text-2xl flex-shrink-0`}>
                  {f.emoji}
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-base mb-1.5">{f.judul}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{f.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Daftar Akun CTA (only when not logged in) ── */}
      {!isLoggedIn && (
        <div className="bg-gradient-to-r from-green-700 to-teal-600 rounded-3xl p-7 md:p-8 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <p className="text-2xl mb-2">🌾</p>
            <h2 className="text-white font-bold text-xl mb-1.5">Daftar Akun — Gratis Selamanya</h2>
            <p className="text-green-200 text-base leading-relaxed max-w-sm">
              Simpan riwayat prediksi lahan Anda, pantau beberapa petak sawah sekaligus,
              dan dapatkan notifikasi harga gabah terbaru.
            </p>
            <div className="flex flex-wrap gap-2 mt-3 justify-center md:justify-start">
              {["✓ Gratis", "✓ Tanpa iklan", "✓ Data tersimpan", "✓ Notifikasi harga"].map((t) => (
                <span key={t} className="text-xs bg-white/20 text-white px-3 py-1 rounded-full border border-white/20">
                  {t}
                </span>
              ))}
            </div>
          </div>
          <button
            onClick={onDaftar}
            className="flex-shrink-0 flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-green-900 font-bold px-7 py-4 rounded-2xl text-base shadow-md hover:scale-105 transition-all whitespace-nowrap"
          >
            Daftar Sekarang
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* ── Cara Pakai ── */}
      <div className="bg-white rounded-3xl p-7 md:p-10 shadow-sm border border-gray-100">
        <h2 className="text-gray-800 font-bold text-xl mb-2 text-center">Cara Menggunakan</h2>
        <p className="text-gray-500 text-base text-center mb-8">Hanya 4 langkah mudah</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {langkah.map((l, i) => (
            <div key={l.no} className="text-center relative">
              {i < langkah.length - 1 && (
                <div className="hidden md:block absolute top-6 left-[60%] w-full h-0.5 bg-green-100 z-0" />
              )}
              <div className="relative z-10">
                <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-3 text-2xl shadow-sm">
                  {l.emoji}
                </div>
                <div className="w-7 h-7 bg-green-700 text-white rounded-full text-sm font-bold flex items-center justify-center mx-auto mb-3">
                  {l.no}
                </div>
                <h3 className="font-bold text-gray-800 text-sm mb-1.5">{l.judul}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{l.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <button
            onClick={onMulai}
            className="inline-flex items-center gap-2 bg-green-700 hover:bg-green-600 text-white font-bold px-8 py-4 rounded-2xl text-base shadow-md transition-all hover:scale-105"
          >
            🌾 Coba Prediksi Sekarang — Gratis
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ── Petani + Testimoni ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
        <div className="relative">
          <img
            src={FARMER_IMG}
            alt="Petani Padi"
            className="w-full h-64 object-cover rounded-3xl shadow-md"
          />
          <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-xl">🌾</div>
              <div>
                <p className="text-green-800 font-bold text-sm">Khusus Padi Indonesia</p>
                <p className="text-gray-500 text-xs">Data standar Kementan & Balitbangtan</p>
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-3">
          {testimoni.map((t) => (
            <div key={t.nama} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex gap-0.5 mb-2">
                {Array.from({ length: t.bintang }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-gray-600 text-sm italic leading-relaxed mb-3">"{t.pesan}"</p>
              <div className="flex items-center gap-2">
                <span className="text-xl">{t.emoji}</span>
                <div>
                  <p className="text-gray-800 font-bold text-sm">{t.nama}</p>
                  <p className="text-gray-400 text-xs flex items-center gap-1">
                    <MapPin className="w-3 h-3" />{t.lokasi}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Keunggulan ── */}
      <div className="bg-gradient-to-br from-green-700 to-green-900 rounded-3xl p-7 md:p-10 shadow-lg">
        <div className="text-center mb-6">
          <p className="text-4xl mb-3">🌾</p>
          <h2 className="text-white font-bold text-xl mb-2">Mengapa Memakai SiPadiPrediksi?</h2>
          <p className="text-green-200 text-base">Dibuat khusus untuk kondisi pertanian padi Indonesia</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-7">
          {[
            { emoji: "✅", judul: "Data Cuaca Otomatis", desc: "Curah hujan & suhu dari BMKG langsung masuk — Anda tidak perlu mengisi apa pun." },
            { emoji: "📋", judul: "Standar Kementan", desc: "Nilai pupuk dan benih mengacu pada rekomendasi resmi Kementerian Pertanian." },
            { emoji: "📱", judul: "Mudah di HP", desc: "Dirancang untuk layar ponsel petani — huruf besar, tombol mudah diklik." },
          ].map((k) => (
            <div key={k.judul} className="bg-white/10 rounded-2xl p-5 border border-white/20">
              <p className="text-3xl mb-2">{k.emoji}</p>
              <h3 className="text-white font-bold text-sm mb-1.5">{k.judul}</h3>
              <p className="text-green-200 text-sm leading-relaxed">{k.desc}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-3 justify-center">
          {["✓ Bebas biaya", "✓ Tanpa daftar akun*", "✓ Bahasa Indonesia", "✓ Data BMKG real-time"].map((item) => (
            <span key={item} className="flex items-center gap-1.5 bg-white/20 text-white text-sm px-4 py-2 rounded-full border border-white/20">
              {item}
            </span>
          ))}
        </div>
        <p className="text-green-400 text-xs text-center mt-3">*Daftar akun untuk menyimpan riwayat prediksi</p>
        <div className="text-center mt-6">
          <button
            onClick={isLoggedIn ? onMulai : onDaftar}
            className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-green-900 font-bold px-8 py-4 rounded-2xl text-base shadow-md hover:scale-105 transition-all"
          >
            {isLoggedIn ? "Mulai Prediksi Sekarang" : "Daftar & Mulai Prediksi"}
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="text-center text-gray-400 text-sm pb-4">
        <p>© 2026 SiPadiPrediksi · Dikembangkan untuk petani padi Indonesia 🇮🇩</p>
        <p className="mt-1">Didukung: Kementan RI · BMKG · Balitbangtan</p>
      </div>
    </div>
  );
}