import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import {
  TrendingUp, TrendingDown, RefreshCw, Home, Download, Share2,
  AlertTriangle, CheckCircle2, Info,
} from "lucide-react";
import type { HasilType } from "../App";

interface Props {
  hasil: HasilType;
  onUlang: () => void;
  onBeranda: () => void;
}

const kategoriCfg = {
  "Sangat Baik": {
    emoji: "🏆", color: "text-green-700", bg: "bg-green-100", border: "border-green-300",
    badgeBg: "bg-green-700", barColor: "#15803d",
    desc: "Kondisi lahan Anda sangat mendukung panen optimal!",
  },
  "Baik": {
    emoji: "✅", color: "text-blue-700", bg: "bg-blue-100", border: "border-blue-300",
    badgeBg: "bg-blue-700", barColor: "#1d4ed8",
    desc: "Kondisi lahan baik. Perawatan rutin akan memaksimalkan hasil.",
  },
  "Cukup": {
    emoji: "⚠️", color: "text-amber-700", bg: "bg-amber-100", border: "border-amber-300",
    badgeBg: "bg-amber-600", barColor: "#b45309",
    desc: "Ada beberapa hal yang bisa diperbaiki untuk meningkatkan hasil.",
  },
  "Perlu Perhatian": {
    emoji: "🔴", color: "text-red-700", bg: "bg-red-100", border: "border-red-300",
    badgeBg: "bg-red-700", barColor: "#b91c1c",
    desc: "Kondisi lahan perlu perbaikan. Ikuti rekomendasi di bawah ini.",
  },
};

const varietasLabel: Record<string, string> = {
  inpari32: "Inpari 32", inpari30: "Inpari 30", ciherang: "Ciherang",
  ir64: "IR64", mekongga: "Mekongga", membamo: "Membamo", situ_bagendit: "Situ Bagendit",
};

const jenisLahanLabel: Record<string, string> = {
  sawah_irigasi_teknis: "Sawah Irigasi Teknis",
  setengah_teknis: "Sawah Setengah Teknis",
  tadah_hujan: "Sawah Tadah Hujan",
};

export function HasilPrediksi({ hasil, onUlang, onBeranda }: Props) {
  const cfg = kategoriCfg[hasil.kategori];
  const luasSatuan = `${parseFloat(hasil.data.luasLahan).toLocaleString("id-ID")} Ha`;

  const hargaAkhir = hasil.prediksiHarga[hasil.prediksiHarga.length - 1]?.harga ?? hasil.hargaSaatIni;
  const trendHarga = ((hargaAkhir - hasil.hargaSaatIni) / hasil.hargaSaatIni) * 100;

  // Build unified chart data with two separate keys to avoid duplicate key warnings
  const chartData = hasil.prediksiHarga.map((d) => ({
    bulan: d.bulan,
    aktual: d.jenis === "aktual" ? d.harga : null,
    prediksi: d.jenis === "prediksi" ? d.harga : null,
    // Bridge: last actual point also appears as start of prediksi line
    ...(d.bulan === hasil.prediksiHarga[2]?.bulan ? { prediksi: d.harga } : {}),
  }));

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
                {hasil.data.namaLahan || `Lahan ${varietasLabel[hasil.data.varietasPadi] || "Padi"}`}
              </h2>
              <p className="text-gray-500 text-base">
                {varietasLabel[hasil.data.varietasPadi]} · {luasSatuan} · {hasil.data.provinsi}
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
          {/* Hasil per hektar */}
          <div className="bg-green-50 rounded-2xl p-5 border-2 border-green-200 text-center col-span-1">
            <p className="text-green-600 text-sm font-medium mb-1">Hasil per Hektar</p>
            <p className="text-green-800 font-bold text-4xl">{hasil.hasilPerHa}</p>
            <p className="text-green-600 text-lg font-semibold">ton/ha</p>
          </div>

          {/* Hasil total */}
          <div className="bg-emerald-50 rounded-2xl p-5 border-2 border-emerald-200 text-center">
            <p className="text-emerald-600 text-sm font-medium mb-1">Total Hasil Lahan</p>
            <p className="text-emerald-800 font-bold text-4xl">{hasil.hasilTotal}</p>
            <p className="text-emerald-600 text-lg font-semibold">ton</p>
            <p className="text-gray-400 text-sm mt-1">dari {luasSatuan}</p>
          </div>

          {/* vs rata-rata daerah */}
          <div className={`rounded-2xl p-5 border-2 text-center ${hasil.selisihRataRata >= 0 ? "bg-blue-50 border-blue-200" : "bg-orange-50 border-orange-200"}`}>
            <p className={`text-sm font-medium mb-1 ${hasil.selisihRataRata >= 0 ? "text-blue-600" : "text-orange-600"}`}>vs Rata-rata Daerah</p>
            <div className={`flex items-center justify-center gap-1 ${hasil.selisihRataRata >= 0 ? "text-blue-800" : "text-orange-700"}`}>
              {hasil.selisihRataRata >= 0
                ? <TrendingUp className="w-6 h-6" />
                : <TrendingDown className="w-6 h-6" />}
              <p className="font-bold text-4xl">{hasil.selisihRataRata > 0 ? "+" : ""}{hasil.selisihRataRata}%</p>
            </div>
            <p className={`text-sm font-semibold mt-0.5 ${hasil.selisihRataRata >= 0 ? "text-blue-600" : "text-orange-600"}`}>
              {hasil.selisihRataRata >= 0 ? "Di atas rata-rata" : "Di bawah rata-rata"}
            </p>
            <p className="text-gray-400 text-xs mt-1">Rata-rata: {hasil.rataRataDaerah} ton/ha</p>
          </div>
        </div>

        {/* Pendapatan & keuntungan */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-2xl p-5 text-center shadow-md">
            <p className="text-green-200 text-sm mb-1">💰 Estimasi Pendapatan</p>
            <p className="text-white font-bold text-xl">
              Rp {hasil.estimasiPendapatan.toLocaleString("id-ID")}
            </p>
            <p className="text-green-200 text-xs mt-0.5">@ Rp {hasil.hargaSaatIni.toLocaleString()}/kg</p>
          </div>
          <div className={`rounded-2xl p-5 text-center shadow-sm border-2 ${hasil.estimasiKeuntungan >= 0 ? "bg-teal-50 border-teal-200" : "bg-red-50 border-red-200"}`}>
            <p className={`text-sm mb-1 ${hasil.estimasiKeuntungan >= 0 ? "text-teal-600" : "text-red-600"}`}>
              🏦 Estimasi Keuntungan Bersih
            </p>
            <p className={`font-bold text-xl ${hasil.estimasiKeuntungan >= 0 ? "text-teal-800" : "text-red-700"}`}>
              {hasil.estimasiKeuntungan >= 0 ? "+" : ""}Rp {hasil.estimasiKeuntungan.toLocaleString("id-ID")}
            </p>
            <p className="text-gray-400 text-xs mt-0.5">Setelah dikurangi biaya produksi</p>
          </div>
        </div>
      </div>

      {/* ══ Kartu 2: Prediksi Harga Gabah ══ */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center text-xl">📈</div>
            <div>
              <h3 className="text-gray-800 font-bold text-lg">Prediksi Harga Gabah</h3>
              <p className="text-gray-500 text-sm">Tren harga 3 bulan ke depan (Rp/kg)</p>
            </div>
          </div>
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold ${trendHarga >= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            {trendHarga >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {trendHarga >= 0 ? "+" : ""}{trendHarga.toFixed(1)}% prediksi
          </div>
        </div>

        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="bulan" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              domain={["auto", "auto"]}
            />
            <Tooltip
              contentStyle={{ fontSize: 13, borderRadius: 10, border: "1px solid #e5e7eb", padding: "10px 14px" }}
              formatter={(v: number, name: string) => [
                `Rp ${v.toLocaleString("id-ID")}`,
                name === "aktual" ? "Aktual" : "Prediksi",
              ]}
            />
            <ReferenceLine
              x={hasil.prediksiHarga[2]?.bulan}
              stroke="#9ca3af"
              strokeDasharray="4 4"
              label={{ value: "Sekarang", fontSize: 11, fill: "#6b7280", position: "top" }}
            />
            <Line
              type="monotone"
              dataKey="aktual"
              name="aktual"
              stroke="#15803d"
              strokeWidth={2.5}
              dot={{ r: 5, fill: "#15803d", strokeWidth: 2, stroke: "#fff" }}
              connectNulls={false}
            />
            <Line
              type="monotone"
              dataKey="prediksi"
              name="prediksi"
              stroke="#d97706"
              strokeWidth={2.5}
              strokeDasharray="6 4"
              dot={{ r: 5, fill: "#d97706", strokeWidth: 2, stroke: "#fff" }}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>

        {/* Tabel ringkasan harga */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          {hasil.prediksiHarga.filter((d) => d.jenis === "prediksi").map((d) => (
            <div key={d.bulan} className="bg-amber-50 rounded-xl p-3.5 border border-amber-100 text-center">
              <p className="text-amber-600 text-xs font-medium mb-0.5">{d.bulan}</p>
              <p className="text-amber-800 font-bold text-base">Rp {d.harga.toLocaleString("id-ID")}</p>
              <p className="text-gray-400 text-xs">per kg</p>
            </div>
          ))}
        </div>

        <div className="flex items-start gap-2 bg-blue-50 rounded-xl p-3.5 mt-4 border border-blue-100">
          <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-blue-700 leading-relaxed">
            Prediksi harga berdasarkan data historis dan tren pasar gabah nasional. Harga aktual dapat berbeda tergantung kondisi pasar lokal.
          </p>
        </div>
      </div>

      {/* ══ Kartu 3: Rekomendasi Aksi ══ */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-9 h-9 bg-purple-100 rounded-xl flex items-center justify-center text-xl">💡</div>
          <h3 className="text-gray-800 font-bold text-lg">Rekomendasi & Catatan Risiko</h3>
        </div>

        {/* Waktu jual terbaik */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-5 mb-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0 text-xl">🕐</div>
            <div>
              <p className="text-green-200 text-sm font-medium mb-1">Waktu Jual Gabah Terbaik</p>
              <p className="text-white text-base font-semibold leading-snug">{hasil.waktuJualTerbaik}</p>
            </div>
          </div>
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

      {/* ══ Ringkasan Input ══ */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-gray-800 font-bold text-base mb-4">📋 Ringkasan Data yang Anda Masukkan</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { label: "Varietas Padi", value: varietasLabel[hasil.data.varietasPadi] || hasil.data.varietasPadi },
            { label: "Luas Lahan", value: luasSatuan },
            { label: "Provinsi", value: hasil.data.provinsi },
            { label: "Jenis Lahan", value: jenisLahanLabel[hasil.data.jenisLahan] || hasil.data.jenisLahan },
            { label: "Musim Tanam", value: hasil.data.musimTanam === "MT1" ? "MT1 (Nov–Mar)" : "MT2 (Apr–Sep)" },
            { label: "Kondisi Irigasi", value: "Lancar (Standar)" },
            { label: "Kondisi Hama", value: hasil.data.kondisiHama.charAt(0).toUpperCase() + hasil.data.kondisiHama.slice(1).replace("_", " ") },
            { label: "Dosis Benih", value: `${hasil.data.dosisBenih || 25} kg/ha` },
            { label: "Dosis Urea", value: `${hasil.data.dosisUrea || 200} kg/ha` },
            { label: "Dosis NPK", value: `${hasil.data.dosisNPK || 300} kg/ha` },
            { label: "Pestisida", value: `${hasil.data.frekuensiPestisida || 3}× per musim` },
            { label: "Biaya Produksi", value: `Rp ${parseInt(hasil.data.biayaProduksi || "8500000").toLocaleString("id-ID")}/ha` },
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
        <button className="flex items-center gap-2 px-6 py-3.5 border-2 border-gray-200 text-gray-600 rounded-xl text-base font-medium hover:bg-gray-50 transition-all">
          <Download className="w-5 h-5" />
          Simpan Hasil
        </button>
        <button className="flex items-center gap-2 px-6 py-3.5 border-2 border-gray-200 text-gray-600 rounded-xl text-base font-medium hover:bg-gray-50 transition-all">
          <Share2 className="w-5 h-5" />
          Bagikan
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
          ⓘ <strong>Catatan:</strong> Hasil prediksi ini bersifat estimasi berdasarkan data yang Anda masukkan dan referensi data pertanian nasional.
          Untuk hasil lebih akurat, konsultasikan dengan <strong>Penyuluh Pertanian Lapangan (PPL)</strong> di daerah Anda.
        </p>
      </div>
    </div>
  );
}