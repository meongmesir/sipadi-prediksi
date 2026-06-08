import { useState, useEffect } from "react";
import { Eye, Trash2, PlusCircle, Clock, TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import { kategoriCfg, cultivarList } from "../../utils/constants";
import { getRiwayatPrediksi } from "../../services/predictionService";

// ─── Interface hasil dari API backend ────────────────────────────────────────

interface PrediksiDB {
  id: number;
  provinsi: string;
  cultivar_name: string;
  sowing_doy: number;
  n_total_kg_ha: number;
  plant_pop: number;
  water_code: string;
  luas_lahan_ha: number;
  yield_kg_ha: number;
  kategori: string;
  catatan_risiko: string[];
  rekomendasi: string[];
  created_at: string;
}

interface Props {
  onPrediksi: () => void;
  onViewDetail?: (hasil: any) => void;
}

export function RiwayatPrediksi({ onPrediksi, onViewDetail }: Props) {
  const [items, setItems] = useState<PrediksiDB[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRiwayat();
  }, []);

  const fetchRiwayat = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getRiwayatPrediksi(1, 20);
      setItems(res.items || []);
    } catch (err: any) {
      setError("Gagal memuat riwayat. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-3xl p-14 shadow-sm border border-gray-100 text-center">
          <Loader2 className="w-12 h-12 text-green-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-base">Memuat riwayat prediksi...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-3xl p-14 shadow-sm border border-gray-100 text-center">
          <div className="text-7xl mb-4">⚠️</div>
          <p className="text-gray-700 font-bold text-lg mb-2">{error}</p>
          <button onClick={fetchRiwayat} className="mt-4 px-5 py-2 bg-green-700 text-white rounded-xl text-sm font-bold">
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
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
          <p className="text-gray-500 text-base">{items.length} prediksi tersimpan</p>
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
        {items.map((h, i) => {
          const cfg = kategoriCfg[h.kategori] || kategoriCfg["Baik"];
          const cultivarLabel = cultivarList.find((c) => c.value === h.cultivar_name || c.label === h.cultivar_name)?.label || h.cultivar_name;
          const totalKg = h.yield_kg_ha * h.luas_lahan_ha;
          const selisihPersen = parseFloat((((h.yield_kg_ha - 4207) / 4207) * 100).toFixed(1));
          const tglFormatted = new Date(h.created_at).toLocaleDateString("id-ID", {
            day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
          });

          return (
            <div
              key={h.id}
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
                        {h.cultivar_name} — {h.provinsi}
                      </p>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${cfg.badgeClass}`}>
                        {cfg.emoji} {h.kategori}
                      </span>
                    </div>

                    {/* Detail baris */}
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-3">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {tglFormatted}
                      </span>
                      <span>📐 {h.luas_lahan_ha} Ha</span>
                      <span>💧 {h.water_code === "A" ? "Irigasi" : "Tadah Hujan"}</span>
                    </div>

                    {/* Hasil summary */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-green-50 rounded-xl p-3 text-center border border-green-100">
                        <p className="text-xs text-gray-500 mb-0.5">Yield</p>
                        <p className="text-green-700 font-bold text-base">{h.yield_kg_ha.toLocaleString("id-ID")}</p>
                        <p className="text-green-600 text-[10px] font-medium">kg/ha</p>
                      </div>
                      <div className={`rounded-xl p-3 text-center border ${selisihPersen >= 0 ? "bg-blue-50 border-blue-100" : "bg-orange-50 border-orange-100"}`}>
                        <p className="text-xs text-gray-500 mb-0.5">vs Rata-rata</p>
                        <div className={`flex items-center justify-center gap-0.5 ${selisihPersen >= 0 ? "text-blue-700" : "text-orange-700"}`}>
                          {selisihPersen >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                          <p className="font-bold text-base">{selisihPersen > 0 ? "+" : ""}{selisihPersen}%</p>
                        </div>
                      </div>
                      <div className="bg-amber-50 rounded-xl p-3 text-center border border-amber-100">
                        <p className="text-xs text-gray-500 mb-0.5">Total</p>
                        <p className="text-amber-700 font-bold text-sm">{totalKg.toLocaleString("id-ID")} kg</p>
                      </div>
                    </div>

                    {/* Rekomendasi singkat */}
                    {h.rekomendasi && h.rekomendasi.length > 0 && (
                      <div className="mt-2 bg-gray-50 rounded-xl p-2.5 border border-gray-100">
                        <p className="text-xs text-gray-500">💡 {h.rekomendasi[0]}</p>
                      </div>
                    )}
                    {/* Actions */}
                    <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                      <button
                        onClick={() => {
                          if (onViewDetail) {
                            const hasilTypeMapped = {
                              data: {
                                namaLahan: `Lahan ${cultivarLabel} (${tglFormatted})`,
                                provinsi: h.provinsi,
                                luasLahan: String(h.luas_lahan_ha),
                                cultivarName: h.cultivar_name,
                                sowingDoy: h.sowing_doy,
                                nTotalKgHa: h.n_total_kg_ha,
                                plantPop: h.plant_pop,
                                waterCode: h.water_code,
                              },
                              yieldKgHa: h.yield_kg_ha,
                              yieldTonHa: h.yield_kg_ha / 1000,
                              totalProduksiKg: totalKg,
                              rataRataNasionalKgHa: 4207,
                              selisihPersen: selisihPersen,
                              kategori: h.kategori,
                              persentasePotensi: Math.min(100, Math.round((h.yield_kg_ha / 13083) * 100)),
                              catatanRisiko: h.catatan_risiko,
                              rekomendasi: h.rekomendasi,
                            };
                            onViewDetail(hasilTypeMapped);
                          }
                        }}
                        className="flex items-center gap-1.5 text-green-700 hover:text-green-800 text-sm font-semibold bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        Lihat Detail
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info */}
      <div className="bg-green-50 rounded-2xl p-4 border border-green-100 text-center">
        <p className="text-sm text-green-700">
          ✅ Riwayat tersimpan permanen di akun Anda dan bisa diakses kapan saja.
        </p>
      </div>
    </div>
  );
}
