import { useState, useEffect } from "react";
import { Search, Filter, Download, Eye, X, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { fetchWithAuth } from "../../../services/api";

// ─── Mock Data ────────────────────────────────────────────────────────────────

interface Prediksi {
  id: number;
  petani: string;
  provinsi: string;
  luas: number;
  cultivar: string;
  waterCode: string;
  sowingDoy: number;
  nTotal: number;
  plantPop: number;
  yieldKgHa: number;
  kategori: "Sangat Baik" | "Baik" | "Cukup" | "Perlu Perhatian";
  tanggal: string;
}

// Kategori berdasarkan yield (kg/ha) relatif terhadap rata-rata nasional ~4207 kg/ha
// Sangat Baik: >8000, Baik: >5000, Cukup: >3000, Perlu Perhatian: ≤3000

// (MOCK Data removed. Data is fetched from API)

const kategoriCfg = {
  "Sangat Baik":    { color: "bg-green-100 text-green-700",  dot: "bg-green-500" },
  "Baik":           { color: "bg-blue-100 text-blue-700",    dot: "bg-blue-500" },
  "Cukup":          { color: "bg-amber-100 text-amber-700",  dot: "bg-amber-500" },
  "Perlu Perhatian":{ color: "bg-red-100 text-red-700",      dot: "bg-red-500" },
};

const VARIETAS_LIST = ["Semua Varietas", "IR 72", "IR 64", "IR 36"];
const KATEGORI_LIST = ["Semua Kategori", "Sangat Baik", "Baik", "Cukup", "Perlu Perhatian"];
const WATER_LABEL: Record<string, string> = { A: "Irigasi", N: "Tadah Hujan" };
const PER_PAGE = 8;

// ─── Detail Modal ─────────────────────────────────────────────────────────────

function DetailModal({ p, onClose }: { p: Prediksi; onClose: () => void }) {
  const cfg = kategoriCfg[p.kategori];
  const totalKg = Math.round(p.yieldKgHa * p.luas);
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <h2 className="text-gray-800 font-bold text-lg">Detail Prediksi #{p.id}</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-400">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-6 pb-6 space-y-4">
          {/* Kategori badge */}
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold ${cfg.color}`}>
            <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
            {p.kategori}
          </span>

          {/* Hasil utama */}
          <div className="bg-green-50 rounded-2xl p-4 text-center">
            <p className="text-gray-500 text-xs mb-1">Estimasi Hasil Panen</p>
            <p className="text-green-800 font-bold text-2xl">{p.yieldKgHa.toLocaleString("id-ID")} kg/ha</p>
            <p className="text-gray-500 text-sm mt-1">≈ {totalKg.toLocaleString("id-ID")} kg total ({p.luas} Ha)</p>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Petani", val: p.petani },
              { label: "Tanggal", val: p.tanggal },
              { label: "Provinsi", val: p.provinsi },
              { label: "Luas Lahan", val: `${p.luas} Ha` },
              { label: "Varietas", val: p.cultivar },
              { label: "Waktu Tanam", val: `DOY ${p.sowingDoy}` },
              { label: "Dosis Nitrogen", val: `${p.nTotal} kg/ha` },
              { label: "Kepadatan Tanam", val: `${p.plantPop} tan/m²` },
              { label: "Sistem Pengairan", val: WATER_LABEL[p.waterCode] },
            ].map((r) => (
              <div key={r.label} className="bg-gray-50 rounded-xl p-3">
                <p className="text-gray-400 text-xs">{r.label}</p>
                <p className="text-gray-800 text-sm font-semibold mt-0.5">{r.val}</p>
              </div>
            ))}
          </div>

          <button onClick={onClose} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl text-sm transition-colors">
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function AdminPrediksi() {
  const [search, setSearch] = useState("");
  const [varietasFilter, setVarietasFilter] = useState("Semua Varietas");
  const [kategoriFilter, setKategoriFilter] = useState("Semua Kategori");
  const [currentPage, setCurrentPage] = useState(1);
  const [selected, setSelected] = useState<Prediksi | null>(null);
  const [predictions, setPredictions] = useState<Prediksi[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWithAuth('/admin/predictions')
      .then(data => {
        setPredictions(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Gagal mengambil data prediksi:", err);
        setLoading(false);
      });
  }, []);

  const filtered = predictions.filter((p) => {
    const matchSearch = p.petani.toLowerCase().includes(search.toLowerCase()) ||
      p.provinsi.toLowerCase().includes(search.toLowerCase());
    const matchVarietas = varietasFilter === "Semua Varietas" || p.cultivar === varietasFilter;
    const matchKategori = kategoriFilter === "Semua Kategori" || p.kategori === kategoriFilter;
    return matchSearch && matchVarietas && matchKategori;
  });

  const totalPage = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  const rataHasil = predictions.length > 0 ? Math.round(predictions.reduce((s, p) => s + p.yieldKgHa, 0) / predictions.length) : 0;

  const getPaginationGroup = () => {
    const pages = [];
    if (totalPage <= 7) {
      for (let i = 1; i <= totalPage; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', totalPage);
      } else if (currentPage >= totalPage - 3) {
        pages.push(1, '...', totalPage - 4, totalPage - 3, totalPage - 2, totalPage - 1, totalPage);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPage);
      }
    }
    return pages;
  };

  if (loading) return <div className="p-8 text-center text-gray-500"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" /> Memuat data prediksi...</div>;

  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-gray-900 font-bold text-2xl">Data Prediksi</h1>
          <p className="text-gray-500 text-sm">{predictions.length} prediksi · rata-rata {rataHasil.toLocaleString("id-ID")} kg/ha</p>
        </div>
      </div>

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Sangat Baik",    n: predictions.filter((p) => p.kategori === "Sangat Baik").length,    color: "bg-green-50 border-green-200 text-green-700",  sub: ">8.000 kg/ha" },
          { label: "Baik",           n: predictions.filter((p) => p.kategori === "Baik").length,           color: "bg-blue-50 border-blue-200 text-blue-700",     sub: "5.000–8.000 kg/ha" },
          { label: "Cukup",          n: predictions.filter((p) => p.kategori === "Cukup").length,          color: "bg-amber-50 border-amber-200 text-amber-700",  sub: "3.000–5.000 kg/ha" },
          { label: "Perlu Perhatian",n: predictions.filter((p) => p.kategori === "Perlu Perhatian").length,color: "bg-red-50 border-red-200 text-red-700",        sub: "<3.000 kg/ha" },
        ].map((c) => (
          <div key={c.label} className={`rounded-2xl border p-4 ${c.color}`}>
            <p className="text-2xl font-bold">{c.n}</p>
            <p className="text-sm font-medium mt-0.5">{c.label}</p>
            <p className="text-xs opacity-70 mt-1">{c.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari petani atau provinsi..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="w-full border-2 border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none transition-all"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <select
            value={varietasFilter}
            onChange={(e) => { setVarietasFilter(e.target.value); setCurrentPage(1); }}
            className="border-2 border-gray-200 focus:border-green-500 rounded-xl pl-10 pr-8 py-2.5 text-sm text-gray-700 appearance-none outline-none bg-white"
          >
            {VARIETAS_LIST.map((v) => <option key={v}>{v}</option>)}
          </select>
        </div>
        <div className="relative">
          <select
            value={kategoriFilter}
            onChange={(e) => { setKategoriFilter(e.target.value); setCurrentPage(1); }}
            className="border-2 border-gray-200 focus:border-green-500 rounded-xl px-4 py-2.5 text-sm text-gray-700 appearance-none outline-none bg-white"
          >
            {KATEGORI_LIST.map((k) => <option key={k}>{k}</option>)}
          </select>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {["#", "Petani", "Provinsi", "Varietas", "Luas", "Pengairan", "N (kg/ha)", "Yield (kg/ha)", "Kategori", "Tanggal", ""].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginated.length === 0 ? (
                <tr><td colSpan={11} className="px-5 py-12 text-center text-gray-400 text-sm">Tidak ada hasil yang cocok</td></tr>
              ) : (
                paginated.map((p) => {
                  const cfg = kategoriCfg[p.kategori];
                  return (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4 text-gray-400 text-sm">{p.id}</td>
                      <td className="px-5 py-4">
                        <p className="text-gray-800 text-sm font-semibold whitespace-nowrap">{p.petani}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-gray-500 text-sm whitespace-nowrap">{p.provinsi}</p>
                      </td>
                      <td className="px-5 py-4 text-gray-600 text-sm whitespace-nowrap">{p.cultivar}</td>
                      <td className="px-5 py-4 text-gray-600 text-sm">{p.luas} Ha</td>
                      <td className="px-5 py-4">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${p.waterCode === "A" ? "bg-sky-100 text-sky-700" : "bg-orange-100 text-orange-700"}`}>
                          {WATER_LABEL[p.waterCode]}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-gray-600 text-sm">{p.nTotal}</td>
                      <td className="px-5 py-4">
                        <span className="text-gray-800 font-bold text-sm">{p.yieldKgHa.toLocaleString("id-ID")}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${cfg.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                          {p.kategori}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-gray-400 text-sm whitespace-nowrap">{p.tanggal}</td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => setSelected(p)}
                          className="text-green-700 hover:text-green-600 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
          <p className="text-gray-400 text-sm">
            {Math.min((currentPage - 1) * PER_PAGE + 1, filtered.length)}–{Math.min(currentPage * PER_PAGE, filtered.length)} dari {filtered.length}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
            {getPaginationGroup().map((n, i) => (
              n === '...' ? (
                <span key={`ell-${i}`} className="px-2 text-gray-400">...</span>
              ) : (
                <button
                  key={`page-${n}`}
                  onClick={() => setCurrentPage(n as number)}
                  className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-semibold transition-colors ${
                    currentPage === n ? "bg-green-700 text-white" : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {n}
                </button>
              )
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPage, p + 1))}
              disabled={currentPage === totalPage}
              className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {selected && <DetailModal p={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
