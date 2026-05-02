import { Eye, Trash2, PlusCircle, Clock, TrendingUp, TrendingDown } from "lucide-react";
import type { HasilType } from "../App";

interface Props {
  riwayat: HasilType[];
  onLihat: (h: HasilType) => void;
  onPrediksi: () => void;
}

const varietasLabel: Record<string, string> = {
  inpari32: "Inpari 32", inpari30: "Inpari 30", ciherang: "Ciherang",
  ir64: "IR64", mekongga: "Mekongga", membamo: "Membamo", situ_bagendit: "Situ Bagendit",
};

const kategoriCfg = {
  "Sangat Baik": { color: "bg-green-100 text-green-700 border-green-200", emoji: "🏆" },
  "Baik":        { color: "bg-blue-100 text-blue-700 border-blue-200", emoji: "✅" },
  "Cukup":       { color: "bg-amber-100 text-amber-700 border-amber-200", emoji: "⚠️" },
  "Perlu Perhatian": { color: "bg-red-100 text-red-700 border-red-200", emoji: "🔴" },
};

export function RiwayatPrediksi({ riwayat, onLihat, onPrediksi }: Props) {
  if (riwayat.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-3xl p-14 shadow-sm border border-gray-100 text-center">
          <div className="text-7xl mb-4">📋</div>
          <h2 className="text-gray-800 font-bold text-xl mb-2">Belum Ada Riwayat Prediksi</h2>
          <p className="text-gray-500 text-base mb-7 max-w-sm mx-auto">
            Anda belum melakukan prediksi panen padi. Mulai prediksi pertama Anda sekarang!
          </p>
          <button
            onClick={onPrediksi}
            className="inline-flex items-center gap-2 bg-green-700 hover:bg-green-600 text-white font-bold px-7 py-4 rounded-2xl text-base shadow-md transition-all hover:scale-105"
          >
            <PlusCircle className="w-5 h-5" />
            Mulai Prediksi Panen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-800 font-bold text-xl">Riwayat Prediksi</h2>
          <p className="text-gray-500 text-base">{riwayat.length} prediksi tersimpan di sesi ini</p>
        </div>
        <button
          onClick={onPrediksi}
          className="flex items-center gap-2 bg-green-700 hover:bg-green-600 text-white font-bold px-5 py-3 rounded-xl text-base shadow-sm transition-all"
        >
          <PlusCircle className="w-5 h-5" />
          Prediksi Baru
        </button>
      </div>

      {/* List */}
      <div className="space-y-3">
        {riwayat.map((h, i) => {
          const cfg = kategoriCfg[h.kategori];
          const luasSatuan = `${parseFloat(h.data.luasLahan).toLocaleString("id-ID")} Ha`;

          return (
            <div
              key={i}
              className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:border-green-200 transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-4 flex-1">
                  {/* Icon */}
                  <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">
                    🌾
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Nama & badge */}
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <p className="text-gray-800 font-bold text-base">
                        {h.data.namaLahan || `Lahan ${varietasLabel[h.data.varietasPadi] || "Padi"}`}
                      </p>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${cfg.color}`}>
                        {cfg.emoji} {h.kategori}
                      </span>
                    </div>

                    {/* Detail baris */}
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-3">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        Prediksi ke-{riwayat.length - i}
                      </span>
                      <span>📍 {h.data.provinsi}</span>
                      <span>📐 {luasSatuan}</span>
                      <span>🌱 {varietasLabel[h.data.varietasPadi]}</span>
                    </div>

                    {/* Hasil summary */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-green-50 rounded-xl p-3 text-center border border-green-100">
                        <p className="text-xs text-gray-500 mb-0.5">Hasil Panen</p>
                        <p className="text-green-700 font-bold text-base">{h.hasilPerHa} t/ha</p>
                      </div>
                      <div className={`rounded-xl p-3 text-center border ${h.selisihRataRata >= 0 ? "bg-blue-50 border-blue-100" : "bg-orange-50 border-orange-100"}`}>
                        <p className="text-xs text-gray-500 mb-0.5">vs Rata-rata</p>
                        <div className={`flex items-center justify-center gap-0.5 ${h.selisihRataRata >= 0 ? "text-blue-700" : "text-orange-700"}`}>
                          {h.selisihRataRata >= 0
                            ? <TrendingUp className="w-3.5 h-3.5" />
                            : <TrendingDown className="w-3.5 h-3.5" />
                          }
                          <p className="font-bold text-base">{h.selisihRataRata > 0 ? "+" : ""}{h.selisihRataRata}%</p>
                        </div>
                      </div>
                      <div className="bg-amber-50 rounded-xl p-3 text-center border border-amber-100">
                        <p className="text-xs text-gray-500 mb-0.5">Potensi</p>
                        <p className="text-amber-700 font-bold text-base">{h.persentasePotensi}%</p>
                      </div>
                    </div>

                    {/* Pendapatan */}
                    <div className="mt-2 bg-gray-50 rounded-xl p-2.5 border border-gray-100 flex items-center justify-between">
                      <p className="text-sm text-gray-500">Estimasi Pendapatan:</p>
                      <p className="text-base font-bold text-gray-800">
                        Rp {h.estimasiPendapatan.toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <button
                    onClick={() => onLihat(h)}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-green-700 text-white rounded-xl text-sm font-bold hover:bg-green-600 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    Lihat
                  </button>
                  <button className="flex items-center gap-1.5 px-4 py-2.5 border-2 border-gray-200 text-gray-500 rounded-xl text-sm font-medium hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors">
                    <Trash2 className="w-4 h-4" />
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info */}
      <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 text-center">
        <p className="text-sm text-amber-700">
          ⓘ Riwayat prediksi hanya tersimpan selama sesi ini. Gunakan tombol <strong>"Simpan Hasil"</strong> pada halaman hasil untuk menyimpan ke perangkat Anda.
        </p>
      </div>
    </div>
  );
}
