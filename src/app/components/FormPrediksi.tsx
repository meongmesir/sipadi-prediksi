import { useState } from "react";
import { ChevronRight, ChevronLeft, Info, Loader2, MapPin, Leaf, Lock } from "lucide-react";
import type { DataLahan, HasilType } from "../App";

// ─── Konstanta ────────────────────────────────────────────────────────────────

const provinsiList = [
  "Aceh", "Sumatera Utara", "Sumatera Barat", "Riau", "Jambi",
  "Sumatera Selatan", "Bengkulu", "Lampung", "Jawa Barat", "Jawa Tengah",
  "DI Yogyakarta", "Jawa Timur", "Bali", "NTB", "NTT",
  "Kalimantan Barat", "Kalimantan Tengah", "Kalimantan Selatan", "Kalimantan Timur",
  "Sulawesi Selatan", "Sulawesi Tengah", "Sulawesi Tenggara", "Gorontalo", "Sulawesi Utara",
  "Maluku", "Papua Barat", "Papua",
];

// Potensi realistis di lapangan (bukan potensi laboratorium)
const varietasList = [
  {
    value: "inpari32", label: "Inpari 32", potensi: 5.8,
    desc: "Varietas unggul baru, tahan wereng, cocok lahan irigasi teknis",
  },
  {
    value: "inpari30", label: "Inpari 30", potensi: 6.0,
    desc: "Produktivitas tinggi, tahan blast, umur genjah ~112 hari",
  },
  {
    value: "ciherang", label: "Ciherang", potensi: 5.0,
    desc: "Varietas paling populer, rasa nasi enak, adaptif di berbagai lahan",
  },
  {
    value: "ir64", label: "IR64", potensi: 4.8,
    desc: "Varietas lama yang stabil, cocok untuk lahan sawah irigasi",
  },
  {
    value: "mekongga", label: "Mekongga", potensi: 5.5,
    desc: "Nasi pulen, tahan penyakit hawar daun, umur 116–125 hari",
  },
  {
    value: "membamo", label: "Membamo", potensi: 4.5,
    desc: "Cocok untuk daerah rawa dan lahan pasang surut",
  },
  {
    value: "situ_bagendit", label: "Situ Bagendit", potensi: 5.0,
    desc: "Cocok untuk lahan tadah hujan dan sawah kering",
  },
];

// Dosis benih dikunci — tidak bisa diubah oleh pengguna
const DOSIS_BENIH_TETAP = "25";

const DEFAULT_BLOK_B = {
  dosisBenih: DOSIS_BENIH_TETAP,
  dosisUrea: "200",
  dosisNPK: "300",
  frekuensiPestisida: "3",
  biayaProduksi: "8500000",
};

// ─── BMKG Mock Data per Provinsi ─────────────────────────────────────────────

const bmkgData: Record<string, { curahHujan: string; suhu: string; enso: string; status: string }> = {
  "Jawa Tengah":      { curahHujan: "185 mm/bln", suhu: "27.2°C", enso: "Normal", status: "Kondisi cuaca mendukung" },
  "Jawa Barat":       { curahHujan: "210 mm/bln", suhu: "26.5°C", enso: "Normal", status: "Kondisi cuaca mendukung" },
  "Jawa Timur":       { curahHujan: "160 mm/bln", suhu: "28.1°C", enso: "Normal", status: "Curah hujan sedikit di bawah rata-rata" },
  "DI Yogyakarta":    { curahHujan: "175 mm/bln", suhu: "27.0°C", enso: "Normal", status: "Kondisi cuaca mendukung" },
  "Sulawesi Selatan": { curahHujan: "140 mm/bln", suhu: "28.8°C", enso: "El Niño Lemah", status: "Waspadai potensi kekeringan" },
  "Sumatera Utara":   { curahHujan: "230 mm/bln", suhu: "26.0°C", enso: "La Niña Lemah", status: "Curah hujan tinggi, waspadai banjir" },
  "Lampung":          { curahHujan: "195 mm/bln", suhu: "27.5°C", enso: "Normal", status: "Kondisi cuaca mendukung" },
  "NTB":              { curahHujan: "90 mm/bln",  suhu: "29.5°C", enso: "El Niño Lemah", status: "Curah hujan rendah, perhatikan irigasi" },
};
const DEFAULT_BMKG = { curahHujan: "175 mm/bln", suhu: "27.8°C", enso: "Normal", status: "Kondisi cuaca mendukung" };

// ─── Kalkulasi Prediksi ───────────────────────────────────────────────────────

function hitungPrediksi(data: DataLahan): HasilType {
  const varietas = varietasList.find((v) => v.value === data.varietasPadi) || varietasList[0];
  const luasHa = parseFloat(data.luasLahan) || 1;
  const potensi = varietas.potensi; // Sudah realistis lapangan
  let skor = 1.0;

  // Jenis lahan — pengaruh nyata terhadap ketersediaan air dan nutrisi
  if (data.jenisLahan === "sawah_irigasi_teknis") skor += 0.08;
  else if (data.jenisLahan === "setengah_teknis")  skor += 0.00;
  else if (data.jenisLahan === "tadah_hujan")       skor -= 0.18;

  // Kondisi irigasi — selalu dianggap lancar (standar sistem)
  skor += 0.05;

  // Musim tanam — MT1 (hujan) lebih mendukung daripada MT2 (kemarau)
  if (data.musimTanam === "MT1") skor += 0.04;
  else                            skor -= 0.04;

  // Kondisi hama/penyakit — faktor risiko produksi terbesar
  if      (data.kondisiHama === "tidak_ada") skor += 0.04;
  else if (data.kondisiHama === "ringan")    skor -= 0.06;
  else if (data.kondisiHama === "sedang")    skor -= 0.14;
  else if (data.kondisiHama === "berat")     skor -= 0.28;

  // Dosis benih selalu 25 kg/ha (sudah optimal)
  skor += 0.03;

  // Dosis urea — sumber nitrogen utama untuk pertumbuhan vegetatif
  const urea = parseFloat(data.dosisUrea) || 200;
  if (urea >= 170 && urea <= 230) skor += 0.04;
  else if (urea < 100 || urea > 300) skor -= 0.04;

  // Dosis NPK — mendukung pembungaan dan pengisian gabah
  const npk = parseFloat(data.dosisNPK) || 300;
  if (npk >= 250 && npk <= 350) skor += 0.04;
  else if (npk < 150 || npk > 450) skor -= 0.04;

  // Frekuensi pestisida — cegah kehilangan hasil akibat hama/penyakit
  const pest = parseInt(data.frekuensiPestisida) || 3;
  if (pest >= 2 && pest <= 4) skor += 0.02;

  // Batasi skor agar hasil tidak berlebihan — max 1.15, min 0.45
  skor = Math.max(0.45, Math.min(1.15, skor));

  const hasilPerHa = parseFloat((potensi * skor).toFixed(2));
  const hasilTotal = parseFloat((hasilPerHa * luasHa).toFixed(2));

  // Rata-rata daerah (BPS 2023, ton/ha GKG)
  const rataRata: Record<string, number> = {
    "Jawa Tengah": 5.6,  "Jawa Barat": 5.8,  "Jawa Timur": 5.9,
    "DI Yogyakarta": 5.5, "Sulawesi Selatan": 5.3, "Sumatera Utara": 5.1,
    "Lampung": 5.2, "NTB": 5.0,
  };
  const rataRataDaerah = rataRata[data.provinsi] || 5.2;
  const selisihRataRata = parseFloat((((hasilPerHa - rataRataDaerah) / rataRataDaerah) * 100).toFixed(1));

  // Harga gabah kering panen (GKP) referensi Bapanas 2024
  const hargaSaatIni = 5800;
  const hasilKg = hasilTotal * 1000;
  const estimasiPendapatan = Math.round(hasilKg * hargaSaatIni);
  const biaya = parseFloat(data.biayaProduksi) * luasHa || 8_500_000 * luasHa;
  const estimasiKeuntungan = estimasiPendapatan - biaya;

  // Kategori berdasarkan skor
  let kategori: HasilType["kategori"];
  if      (skor >= 1.08) kategori = "Sangat Baik";
  else if (skor >= 0.90) kategori = "Baik";
  else if (skor >= 0.70) kategori = "Cukup";
  else                    kategori = "Perlu Perhatian";

  // Persentase potensi terhadap skor maksimum (1.15)
  const persentasePotensi = Math.min(100, Math.round((skor / 1.15) * 100));

  // ── Prediksi harga gabah — tren realistis, kenaikan moderat ──
  const bulanIni = new Date();
  const namaBulan = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

  // Pola harga per musim: MT1 panen Feb-Mar → harga turun akibat panen raya;
  // MT2 panen Agu-Sep → pasokan berkurang, harga sedikit naik
  const isMT1 = data.musimTanam === "MT1";
  const prediksiHarga: HasilType["prediksiHarga"] = [
    { bulan: namaBulan[(bulanIni.getMonth() - 2 + 12) % 12], harga: 5600, jenis: "aktual" },
    { bulan: namaBulan[(bulanIni.getMonth() - 1 + 12) % 12], harga: 5720, jenis: "aktual" },
    { bulan: namaBulan[bulanIni.getMonth()],                  harga: 5800, jenis: "aktual" },
    {
      bulan: namaBulan[(bulanIni.getMonth() + 1) % 12] + " (pred)",
      harga: isMT1 ? 5750 : 5870,
      jenis: "prediksi",
    },
    {
      bulan: namaBulan[(bulanIni.getMonth() + 2) % 12] + " (pred)",
      harga: isMT1 ? 5700 : 5950,
      jenis: "prediksi",
    },
    {
      bulan: namaBulan[(bulanIni.getMonth() + 3) % 12] + " (pred)",
      harga: isMT1 ? 5820 : 6020,
      jenis: "prediksi",
    },
  ];

  // Waktu jual — cukup sebut bulan, tanpa menyebut hari raya
  const waktuJualTerbaik = isMT1
    ? "Terbaik: jual pada bulan Februari–Maret, sebelum panen raya agar harga lebih tinggi"
    : "Terbaik: jual pada bulan Agustus–September saat pasokan gabah mulai berkurang";

  // Catatan risiko
  const catatanRisiko: string[] = [];
  if (data.kondisiHama === "sedang" || data.kondisiHama === "berat") {
    catatanRisiko.push("Serangan hama/penyakit terdeteksi — segera lakukan pengendalian sebelum menyebar luas");
  }
  if (data.jenisLahan === "tadah_hujan" && data.musimTanam === "MT2") {
    catatanRisiko.push("Lahan tadah hujan di musim kemarau (MT2) berisiko kekurangan air — pantau curah hujan");
  }
  if (data.jenisLahan === "tadah_hujan") {
    catatanRisiko.push("Lahan tadah hujan bergantung penuh pada hujan — siapkan rencana jika musim kering berlanjut");
  }
  const ureaVal = parseFloat(data.dosisUrea) || 200;
  if (ureaVal > 280) {
    catatanRisiko.push("Dosis Urea terlalu tinggi — dapat menyebabkan rebah batang dan boros biaya");
  }
  if (catatanRisiko.length === 0) {
    catatanRisiko.push("Tidak ada risiko signifikan yang terdeteksi berdasarkan data yang Anda masukkan");
  }

  // Rekomendasi tindakan
  const rekomendasi: string[] = [
    `Gunakan benih ${varietas.label} 25 kg/ha yang sudah direndam dan diperlakukan dengan fungisida sebelum semai`,
    `Pupuk Urea ${data.dosisUrea || 200} kg/ha diberikan 3 tahap: 1/3 saat tanam, 1/3 umur 21 HST, 1/3 umur 42 HST`,
    `Pupuk NPK ${data.dosisNPK || 300} kg/ha diberikan 2 tahap: setengah saat tanam, setengah saat primordia`,
    `Lakukan pengamatan hama dan penyakit minimal setiap 10 hari — semprot pestisida hanya jika ditemukan`,
    "Hubungi Penyuluh Pertanian Lapangan (PPL) setempat untuk pendampingan teknis di lahan Anda",
  ];

  return {
    data, hasilPerHa, hasilTotal, rataRataDaerah, selisihRataRata,
    hargaSaatIni, estimasiPendapatan, estimasiKeuntungan,
    kategori, persentasePotensi, prediksiHarga, waktuJualTerbaik,
    catatanRisiko, rekomendasi,
  };
}

// ─── Komponen Form ────────────────────────────────────────────────────────────

const INIT_FORM: DataLahan = {
  namaLahan: "", provinsi: "Jawa Tengah", kabupaten: "",
  luasLahan: "", jenisLahan: "sawah_irigasi_teknis",
  varietasPadi: "inpari32", musimTanam: "MT1",
  kondisiIrigasi: "lancar", // selalu lancar, tidak bisa diubah
  kondisiHama: "tidak_ada",
  ...DEFAULT_BLOK_B,
};

export function FormPrediksi({ onHasil }: { onHasil: (h: HasilType) => void }) {
  const [form, setForm] = useState<DataLahan>(INIT_FORM);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const upd = (k: keyof DataLahan, v: string) => setForm((p) => ({ ...p, [k]: v }));
  // Reset hanya untuk field yang bisa diubah (bukan dosisBenih)
  const reset = (k: keyof DataLahan) => {
    if (k === "dosisBenih") return; // dikunci, tidak bisa direset
    upd(k, DEFAULT_BLOK_B[k as keyof typeof DEFAULT_BLOK_B] ?? "");
  };

  const bmkg = bmkgData[form.provinsi] || DEFAULT_BMKG;

  const isStep1Valid = !!form.provinsi;
  const isStep2Valid =
    !!form.luasLahan &&
    parseFloat(form.luasLahan) > 0 &&
    !!form.jenisLahan &&
    !!form.varietasPadi &&
    !!form.musimTanam &&
    !!form.kondisiHama;

  const handleSubmit = () => {
    setLoading(true);
    setTimeout(() => {
      const hasil = hitungPrediksi({ ...form, dosisBenih: DOSIS_BENIH_TETAP, kondisiIrigasi: "lancar" });
      setLoading(false);
      onHasil(hasil);
    }, 2200);
  };

  // ── Pill selector ──
  const Pill = ({
    label, value, selected, onClick,
    colorActive = "bg-green-700 text-white border-green-700",
  }: { label: string; value: string; selected: boolean; onClick: () => void; colorActive?: string }) => (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
        selected ? colorActive : "border-gray-200 bg-white text-gray-600 hover:border-green-300"
      }`}
    >
      {label}
    </button>
  );

  // ── Field Label ──
  const Label = ({ text, required }: { text: string; required?: boolean }) => (
    <label className="block text-base font-semibold text-gray-700 mb-2">
      {text} {required && <span className="text-red-500">*</span>}
    </label>
  );

  // ── Steps indicator ──
  const steps = [
    { no: 1, label: "Lokasi & Info" },
    { no: 2, label: "Data Lahan" },
    { no: 3, label: "Rekomendasi" },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Step indicator */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          {steps.map((s, i) => (
            <div key={s.no} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  step > s.no ? "bg-green-600 text-white" : step === s.no ? "bg-green-700 text-white shadow-lg shadow-green-200" : "bg-gray-100 text-gray-400"
                }`}>
                  {step > s.no ? "✓" : s.no}
                </div>
                <p className={`text-xs mt-1.5 font-medium ${step >= s.no ? "text-green-700" : "text-gray-400"}`}>{s.label}</p>
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 mb-5 transition-all ${step > s.no ? "bg-green-500" : "bg-gray-200"}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ═══ STEP 1: Lokasi + BMKG Info ═══ */}
      {step === 1 && (
        <div className="space-y-4">
          {/* Lokasi */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <MapPin className="w-5 h-5 text-green-700" />
              </div>
              <div>
                <h2 className="text-gray-800 font-bold text-lg">Lokasi Lahan Anda</h2>
                <p className="text-gray-500 text-sm">Pilih lokasi agar data cuaca diambil otomatis dari BMKG</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label text="Nama Lahan" />
                <input
                  type="text"
                  placeholder="Contoh: Sawah Pak Budi Blok A (opsional)"
                  value={form.namaLahan}
                  onChange={(e) => upd("namaLahan", e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 text-base text-gray-700 outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label text="Provinsi" required />
                  <select
                    value={form.provinsi}
                    onChange={(e) => upd("provinsi", e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 text-base text-gray-700 outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 bg-white transition-all"
                  >
                    {provinsiList.map((p) => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <Label text="Kabupaten/Kota" />
                  <input
                    type="text"
                    placeholder="Nama kab/kota..."
                    value={form.kabupaten}
                    onChange={(e) => upd("kabupaten", e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 text-base text-gray-700 outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* BMKG Info Card — READ ONLY */}
          <div className="bg-sky-50 rounded-2xl p-6 border-2 border-sky-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-sky-200 rounded-lg flex items-center justify-center text-lg">🌤️</div>
              <div>
                <p className="text-sky-800 font-bold text-base">Data Cuaca Otomatis dari BMKG</p>
                <p className="text-sky-600 text-sm">Berdasarkan lokasi: {form.provinsi}</p>
              </div>
              <span className="ml-auto text-[11px] bg-sky-200 text-sky-800 px-2.5 py-1 rounded-full font-semibold">Otomatis</span>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              {[
                { label: "🌧️ Curah Hujan", value: bmkg.curahHujan },
                { label: "🌡️ Suhu Rata-rata", value: bmkg.suhu },
                { label: "🌊 Status ENSO", value: bmkg.enso },
                { label: "📋 Status Umum", value: bmkg.status },
              ].map((item) => (
                <div key={item.label} className="bg-white rounded-xl p-3.5 border border-sky-100">
                  <p className="text-xs text-sky-600 font-medium mb-0.5">{item.label}</p>
                  <p className="text-sm font-bold text-gray-800 leading-snug">{item.value}</p>
                </div>
              ))}
            </div>
            <div className="flex items-start gap-2 bg-sky-100 rounded-xl p-3">
              <Info className="w-4 h-4 text-sky-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-sky-700 leading-relaxed">
                Data cuaca diambil otomatis dari server BMKG dan <strong>tidak bisa diubah secara manual</strong>. Data ini digunakan sebagai pertimbangan dalam prediksi.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ═══ STEP 2: BLOK A — Diisi Petani ═══ */}
      {step === 2 && (
        <div className="bg-white rounded-2xl shadow-sm border-2 border-green-600 overflow-hidden">
          {/* Header Blok A */}
          <div className="bg-green-700 px-6 py-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-lg">Blok A — Diisi oleh Petani</p>
              <p className="text-green-200 text-sm">Informasi mengenai lahan dan kondisi padi Anda</p>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Luas Lahan */}
            <div>
              <Label text="Luas Lahan (hektar)" required />
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Contoh: 1.5"
                  value={form.luasLahan}
                  onChange={(e) => upd("luasLahan", e.target.value)}
                  min="0.01" step="0.01"
                  className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-3.5 text-base text-gray-700 outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all"
                />
                <div className="bg-green-50 border-2 border-green-200 rounded-xl px-4 py-3.5 text-green-700 font-semibold text-base whitespace-nowrap">Ha</div>
              </div>
              {form.luasLahan && parseFloat(form.luasLahan) > 0 && (
                <p className="text-sm text-green-600 mt-1.5 ml-1">
                  = {(parseFloat(form.luasLahan) * 10000).toLocaleString("id-ID")} m²
                </p>
              )}
            </div>

            {/* Jenis Lahan */}
            <div>
              <Label text="Jenis Lahan Sawah" required />
              <div className="space-y-2">
                {[
                  {
                    value: "sawah_irigasi_teknis",
                    label: "Sawah Irigasi Teknis",
                    desc: "Air irigasi dari saluran resmi, ketersediaan air terjamin sepanjang musim",
                    emoji: "💧",
                  },
                  {
                    value: "setengah_teknis",
                    label: "Sawah Setengah Teknis",
                    desc: "Irigasi sederhana (pompa atau saluran desa), kadang bergantung pada curah hujan",
                    emoji: "🌤️",
                  },
                  {
                    value: "tadah_hujan",
                    label: "Sawah Tadah Hujan",
                    desc: "Tidak ada irigasi, sepenuhnya bergantung pada curah hujan alami",
                    emoji: "🌧️",
                  },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => upd("jenisLahan", opt.value)}
                    className={`w-full flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                      form.jenisLahan === opt.value
                        ? "border-green-600 bg-green-50"
                        : "border-gray-200 bg-white hover:border-green-300"
                    }`}
                  >
                    <span className="text-2xl mt-0.5">{opt.emoji}</span>
                    <div className="flex-1">
                      <p className={`text-base font-semibold ${form.jenisLahan === opt.value ? "text-green-800" : "text-gray-700"}`}>{opt.label}</p>
                      <p className="text-sm text-gray-500 leading-relaxed mt-0.5">{opt.desc}</p>
                    </div>
                    {form.jenisLahan === opt.value && <span className="ml-auto text-green-600 text-xl flex-shrink-0">✓</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Varietas Padi */}
            <div>
              <Label text="Varietas Padi yang Ditanam" required />
              <select
                value={form.varietasPadi}
                onChange={(e) => upd("varietasPadi", e.target.value)}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 text-base text-gray-700 outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 bg-white transition-all mb-2"
              >
                {varietasList.map((v) => (
                  <option key={v.value} value={v.value}>{v.label}</option>
                ))}
              </select>
              {/* Deskripsi varietas terpilih */}
              {(() => {
                const vSelected = varietasList.find((v) => v.value === form.varietasPadi);
                return vSelected ? (
                  <div className="flex items-start gap-2.5 bg-green-50 rounded-xl p-3.5 border border-green-200">
                    <span className="text-lg flex-shrink-0">🌾</span>
                    <div>
                      <p className="text-green-800 font-semibold text-sm">{vSelected.label}</p>
                      <p className="text-green-700 text-xs leading-relaxed mt-0.5">{vSelected.desc}</p>
                    </div>
                  </div>
                ) : null;
              })()}
              <p className="text-sm text-gray-400 mt-2 ml-1">
                Jika varietas Anda tidak ada di daftar, pilih yang paling mendekati.
              </p>
            </div>

            {/* Musim Tanam */}
            <div>
              <Label text="Musim Tanam Sekarang" required />
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: "MT1", label: "MT 1", sub: "November – Maret", emoji: "🌧️", desc: "Musim hujan — ketersediaan air lebih baik" },
                  { value: "MT2", label: "MT 2", sub: "April – September", emoji: "☀️", desc: "Musim kemarau — perlu perhatian ekstra terhadap air" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => upd("musimTanam", opt.value)}
                    className={`p-4 rounded-xl border-2 text-center transition-all ${
                      form.musimTanam === opt.value ? "border-green-600 bg-green-50" : "border-gray-200 bg-white hover:border-green-300"
                    }`}
                  >
                    <p className="text-2xl mb-1">{opt.emoji}</p>
                    <p className={`text-base font-bold ${form.musimTanam === opt.value ? "text-green-800" : "text-gray-700"}`}>{opt.label}</p>
                    <p className="text-sm text-gray-500">{opt.sub}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Kondisi Irigasi — READ ONLY, selalu Lancar */}
            <div>
              <Label text="Kondisi Irigasi" />
              <div className="flex items-center gap-3 bg-sky-50 rounded-xl p-4 border-2 border-sky-200">
                <div className="w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center text-xl flex-shrink-0">💧</div>
                <div className="flex-1">
                  <p className="text-sky-800 font-bold text-base">Lancar (Standar)</p>
                  <p className="text-sky-600 text-sm">Diasumsikan kondisi irigasi lancar untuk seluruh prediksi</p>
                </div>
                <span className="text-xs bg-sky-200 text-sky-800 px-2.5 py-1 rounded-full font-semibold whitespace-nowrap">Otomatis</span>
              </div>
            </div>

            {/* Kondisi Hama */}
            <div>
              <Label text="Kondisi Hama / Penyakit Tanaman" required />
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: "tidak_ada", label: "Tidak Ada", emoji: "✅", desc: "Tanaman sehat, tidak ada gejala serangan" },
                  { value: "ringan", label: "Ringan", emoji: "🟡", desc: "Ada sedikit serangan, belum mengganggu hasil" },
                  { value: "sedang", label: "Sedang", emoji: "🟠", desc: "Serangan cukup luas, perlu segera ditangani" },
                  { value: "berat", label: "Berat", emoji: "🔴", desc: "Serangan masif, berisiko besar pada hasil panen" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => upd("kondisiHama", opt.value)}
                    className={`p-3.5 rounded-xl border-2 text-left transition-all ${
                      form.kondisiHama === opt.value ? "border-green-600 bg-green-50" : "border-gray-200 bg-white hover:border-green-300"
                    }`}
                  >
                    <p className="text-lg mb-0.5">{opt.emoji}</p>
                    <p className={`text-sm font-bold ${form.kondisiHama === opt.value ? "text-green-800" : "text-gray-700"}`}>{opt.label}</p>
                    <p className="text-xs text-gray-400 leading-relaxed">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ STEP 3: BLOK B — Rekomendasi ═══ */}
      {step === 3 && (
        <div className="bg-white rounded-2xl shadow-sm border-2 border-amber-400 overflow-hidden">
          {/* Header Blok B */}
          <div className="bg-amber-400 px-6 py-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-300 rounded-xl flex items-center justify-center text-xl">⚙️</div>
            <div>
              <p className="text-amber-900 font-bold text-lg">Blok B — Nilai Rekomendasi</p>
              <p className="text-amber-800 text-sm">Nilai baku Kementan & Balitbangtan · Tidak bisa diubah</p>
            </div>
          </div>

          <div className="px-6 py-5">
            {/* Info banner */}
            <div className="flex items-start gap-3 bg-amber-50 rounded-xl p-4 border border-amber-200 mb-5">
              <Lock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800 leading-relaxed">
                Semua nilai di bawah ini sudah ditetapkan berdasarkan <strong>standar resmi Kementerian Pertanian (Kementan)</strong> dan <strong>Balitbangtan</strong>.
                Nilai ini tidak bisa diubah agar hasil prediksi tetap konsisten dan akurat.
              </p>
            </div>

            <div className="space-y-3">
              {[
                {
                  label: "Dosis Benih",
                  value: "25",
                  satuan: "kg/ha",
                  desc: "Standar Kementan: 25 kg/ha untuk menghindari persaingan antar tanaman dan memastikan kerapatan optimal",
                  emoji: "🌱",
                },
                {
                  label: "Dosis Pupuk Urea",
                  value: "200",
                  satuan: "kg/ha",
                  desc: "Pupuk nitrogen utama untuk mendorong pertumbuhan daun dan batang padi. Diberikan bertahap 3 kali",
                  emoji: "🧪",
                },
                {
                  label: "Dosis Pupuk NPK",
                  value: "300",
                  satuan: "kg/ha",
                  desc: "Pupuk majemuk untuk mendukung pembungaan, pengisian, dan pemasakan gabah secara optimal",
                  emoji: "🌿",
                },
                {
                  label: "Frekuensi Pestisida",
                  value: "3",
                  satuan: "× per musim",
                  desc: "Penyemprotan pestisida sebanyak 3 kali per musim sesuai pedoman pengendalian hama terpadu",
                  emoji: "🛡️",
                },
                {
                  label: "Estimasi Biaya Produksi",
                  value: "8.500.000",
                  satuan: "Rp/ha",
                  desc: "Estimasi total biaya per hektar mencakup benih, pupuk, pestisida, tenaga kerja, dan pengolahan lahan",
                  emoji: "💰",
                },
              ].map((field) => (
                <div
                  key={field.label}
                  className="rounded-xl border-2 border-amber-200 bg-amber-50 p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{field.emoji}</span>
                      <span className="text-base font-semibold text-gray-700">{field.label}</span>
                    </div>
                    <span className="text-xs bg-amber-200 text-amber-800 px-2.5 py-1 rounded-full font-semibold flex items-center gap-1 whitespace-nowrap">
                      <Lock className="w-3 h-3" /> Kementan
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex-1 bg-white border-2 border-amber-200 rounded-xl px-4 py-3 text-base font-bold text-gray-700 cursor-not-allowed select-none">
                      {field.value}
                    </div>
                    <span className="text-sm text-gray-500 font-medium whitespace-nowrap">{field.satuan}</span>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">{field.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center gap-2 bg-gray-50 rounded-xl p-3.5 border border-gray-200">
              <Info className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <p className="text-xs text-gray-500 leading-relaxed">
                Nilai-nilai di atas merupakan standar nasional yang berlaku untuk lahan padi sawah di Indonesia. Untuk kondisi lahan yang sangat spesifik, konsultasikan dengan PPL setempat.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Navigasi ── */}
      <div className="flex gap-3">
        {step > 1 && (
          <button
            onClick={() => setStep(step - 1)}
            className="flex items-center gap-2 px-5 py-3.5 border-2 border-gray-200 rounded-xl text-base font-medium text-gray-600 hover:bg-gray-50 transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
            Kembali
          </button>
        )}

        {step < 3 && (
          <button
            onClick={() => setStep(step + 1)}
            disabled={step === 1 ? !isStep1Valid : !isStep2Valid}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 bg-green-700 hover:bg-green-600 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white rounded-xl text-base font-bold transition-all shadow-md"
          >
            Lanjutkan
            <ChevronRight className="w-5 h-5" />
          </button>
        )}

        {step === 3 && (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 bg-green-700 hover:bg-green-600 disabled:bg-gray-200 disabled:cursor-not-allowed text-white rounded-xl text-base font-bold transition-all shadow-md shadow-green-200"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Menghitung Prediksi...
              </>
            ) : (
              <>
                📊 Lihat Hasil Prediksi
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        )}
      </div>

      {step === 2 && !isStep2Valid && (
        <p className="text-sm text-gray-400 text-center">
          * Isi semua field yang bertanda bintang merah untuk melanjutkan
        </p>
      )}
    </div>
  );
}