import {
  TrendingUp, TrendingDown, RefreshCw, Home,
  AlertTriangle, CheckCircle2, Info,
} from "lucide-react";
import type { HasilType } from "../../types";
import {
  kategoriCfg, cultivarList, sowingDoyList, plantPopList,
  waterCodeList, provinsiGeo, datasetStats,
} from "../../utils/constants";

interface Props {
  hasil: HasilType;
  onUlang: () => void;
  onBeranda: () => void;
}

export function HasilPrediksi({ hasil, onUlang, onBeranda }: Props) {
  const cfg = kategoriCfg[hasil.kategori];
  const luasHa = parseFloat(hasil.data.luasLahan) || 1;
  const geo = provinsiGeo[hasil.data.provinsi];

  // Lookup labels
  const cultivarLabel = cultivarList.find((c) => c.value === hasil.data.cultivarName)?.label || hasil.data.cultivarName;
  const sowingLabel = sowingDoyList.find((s) => s.doy === hasil.data.sowingDoy)?.label || `DOY ${hasil.data.sowingDoy}`;
  const plantPopLabel = plantPopList.find((p) => p.value === hasil.data.plantPop)?.label || `${hasil.data.plantPop}/m²`;
  const waterLabel = waterCodeList.find((w) => w.value === hasil.data.waterCode)?.label || hasil.data.waterCode;

  return (
    <div className="max-w-3xl mx-auto space-y-5">

      {/* ══ Kartu Header ══ */}
      <div className={`bg-white rounded-3xl p-6 shadow-sm border-2 ${cfg.border} relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-48 h-48 bg-green-50 rounded-full -mr-16 -mt-16 opacity-60" />
        <div className="relative">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
            <div>
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold ${cfg.bg} ${cfg.color} mb-3`}>
                {cfg.emoji} Hasil Prediksi: {hasil.kategori}
              </div>
              <h2 className="text-gray-800 font-bold text-xl mb-1">
                {hasil.data.namaLahan || `Lahan ${cultivarLabel}`}
              </h2>
              <p className="text-gray-500 text-base">
                {cultivarLabel} · {luasHa.toLocaleString("id-ID")} Ha · {hasil.data.provinsi}
              </p>
              <p className="text-gray-400 text-sm mt-1 italic">{cfg.desc}</p>
            </div>
            {/* Potensi gauge */}
            <div className="text-center flex-shrink-0">
              <div className="relative w-24 h-24">
                <svg viewBox="0 0 36 36" className="w-24 h-24 -rotate-90">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f0fdf4" strokeWidth="3" />
                  <circle
                    cx="18" cy="18" r="15.9" fill="none"
                    stroke={cfg.barColor}
                    strokeWidth="3.5"
                    strokeDasharray={`${hasil.persentasePotensi} ${100 - hasil.persentasePotensi}`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-xl font-bold" style={{ color: cfg.barColor }}>{hasil.persentasePotensi}%</p>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-1">Potensi Hasil</p>
            </div>
          </div>
        </div>
      </div>

      {/* ══ Kartu 1: Estimasi Hasil Panen ══ */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center text-xl">⚖️</div>
          <h3 className="text-gray-800 font-bold text-lg">Estimasi Hasil Panen</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
          {/* Yield per hektar (kg/ha) — output utama model */}
          <div className="bg-green-50 rounded-2xl p-5 border-2 border-green-200 text-center col-span-1">
            <p className="text-green-600 text-sm font-medium mb-1">Yield per Hektar</p>
            <p className="text-green-800 font-bold text-4xl">{hasil.yieldKgHa.toLocaleString("id-ID")}</p>
            <p className="text-green-600 text-lg font-semibold">kg/ha</p>
            <p className="text-gray-400 text-xs mt-1">= {hasil.yieldTonHa} ton/ha</p>
          </div>

          {/* Total produksi */}
          <div className="bg-emerald-50 rounded-2xl p-5 border-2 border-emerald-200 text-center">
            <p className="text-emerald-600 text-sm font-medium mb-1">Total Produksi</p>
            <p className="text-emerald-800 font-bold text-4xl">{hasil.totalProduksiKg.toLocaleString("id-ID")}</p>
            <p className="text-emerald-600 text-lg font-semibold">kg</p>
            <p className="text-gray-400 text-xs mt-1">dari {luasHa.toLocaleString("id-ID")} Ha</p>
          </div>

          {/* vs rata-rata nasional */}
          <div className={`rounded-2xl p-5 border-2 text-center ${hasil.selisihPersen >= 0 ? "bg-blue-50 border-blue-200" : "bg-orange-50 border-orange-200"}`}>
            <p className={`text-sm font-medium mb-1 ${hasil.selisihPersen >= 0 ? "text-blue-600" : "text-orange-600"}`}>vs Rata-rata Nasional</p>
            <div className={`flex items-center justify-center gap-1 ${hasil.selisihPersen >= 0 ? "text-blue-800" : "text-orange-700"}`}>
              {hasil.selisihPersen >= 0
                ? <TrendingUp className="w-6 h-6" />
                : <TrendingDown className="w-6 h-6" />}
              <p className="font-bold text-4xl">{hasil.selisihPersen > 0 ? "+" : ""}{hasil.selisihPersen}%</p>
            </div>
            <p className={`text-sm font-semibold mt-0.5 ${hasil.selisihPersen >= 0 ? "text-blue-600" : "text-orange-600"}`}>
              {hasil.selisihPersen >= 0 ? "Di atas rata-rata" : "Di bawah rata-rata"}
            </p>
            <p className="text-gray-400 text-xs mt-1">Rata-rata: {datasetStats.meanYield.toLocaleString("id-ID")} kg/ha</p>
          </div>
        </div>

        {/* Info tentang sumber prediksi */}
        <div className="flex items-start gap-2 bg-blue-50 rounded-xl p-3.5 border border-blue-100">
          <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-blue-700 leading-relaxed">
            Prediksi dihasilkan oleh <strong>sistem kecerdasan buatan</strong> yang dibangun dari data simulasi pertanian.
            Yield dalam satuan <strong>kg/ha</strong> (kilogram per hektar).
          </p>
        </div>
      </div>

      {/* ══ Kartu 2: Rekomendasi & Risiko ══ */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-9 h-9 bg-purple-100 rounded-xl flex items-center justify-center text-xl">💡</div>
          <h3 className="text-gray-800 font-bold text-lg">Rekomendasi & Catatan Risiko</h3>
        </div>

        {/* Catatan Risiko */}
        <div className="mb-4">
          <p className="text-gray-700 font-bold text-base mb-2.5 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            Catatan Risiko
          </p>
          <div className="space-y-2">
            {hasil.catatanRisiko.map((r, i) => (
              <div key={i} className={`flex items-start gap-3 rounded-xl p-3.5 border ${
                r.includes("Tidak ada") ? "bg-green-50 border-green-200" : "bg-orange-50 border-orange-200"
              }`}>
                {r.includes("Tidak ada")
                  ? <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  : <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                }
                <p className={`text-sm leading-relaxed ${r.includes("Tidak ada") ? "text-green-700" : "text-orange-700"}`}>
                  {r}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Rekomendasi tindakan */}
        <div>
          <p className="text-gray-700 font-bold text-base mb-2.5 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            Saran Tindakan
          </p>
          <div className="space-y-2">
            {hasil.rekomendasi.map((r, i) => (
              <div key={i} className="flex items-start gap-3 bg-gray-50 rounded-xl p-3.5 border border-gray-100">
                <div className="w-6 h-6 bg-green-700 text-white rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{r}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══ Ringkasan Parameter Input ══ */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-gray-800 font-bold text-base mb-4">📋 Ringkasan Data yang Anda Masukkan</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { label: "Provinsi", value: hasil.data.provinsi },
            { label: "Latitude", value: geo ? `${geo.lat}` : "-" },
            { label: "Longitude", value: geo ? `${geo.lon}` : "-" },
            { label: "Elevasi", value: geo ? `${geo.elev} m` : "-" },
            { label: "Varietas Padi", value: cultivarLabel },
            { label: "Waktu Tanam", value: sowingLabel },
            { label: "Dosis Nitrogen", value: `${hasil.data.nTotalKgHa} kg/ha` },
            { label: "Kepadatan Tanam", value: plantPopLabel },
            { label: "Sistem Pengairan", value: waterLabel },
            { label: "Luas Lahan", value: `${luasHa.toLocaleString("id-ID")} Ha` },
          ].map((item) => (
            <div key={item.label} className="bg-gray-50 rounded-xl p-3.5 border border-gray-100">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{item.label}</p>
              <p className="text-sm font-semibold text-gray-800 mt-0.5">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ══ Tombol Aksi ══ */}
      <div className="flex flex-wrap gap-3 justify-center">
        <button
          onClick={onUlang}
          className="flex items-center gap-2 px-6 py-3.5 bg-green-700 hover:bg-green-600 text-white rounded-xl text-base font-bold shadow-md transition-all hover:scale-105"
        >
          <RefreshCw className="w-5 h-5" />
          Prediksi Lahan Baru
        </button>
        <button
          onClick={onBeranda}
          className="flex items-center gap-2 px-6 py-3.5 border-2 border-gray-200 text-gray-600 rounded-xl text-base font-medium hover:bg-gray-50 transition-all"
        >
          <Home className="w-5 h-5" />
          Beranda
        </button>
      </div>

      <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 text-center">
        <p className="text-sm text-amber-700 leading-relaxed">
          ⓘ <strong>Catatan:</strong> Hasil prediksi ini bersifat estimasi berdasarkan data simulasi pertanian.
          Untuk hasil lebih akurat, konsultasikan dengan <strong>Penyuluh Pertanian Lapangan (PPL)</strong> di daerah Anda.
        </p>
      </div>
    </div>
  );
}