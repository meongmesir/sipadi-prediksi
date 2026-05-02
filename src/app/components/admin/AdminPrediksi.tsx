import { useState } from "react";
import { Search, Filter, Download, Eye, X, ChevronLeft, ChevronRight } from "lucide-react";

// ─── Mock Data ────────────────────────────────────────────────────────────────

interface Prediksi {
  id: number;
  petani: string;
  provinsi: string;
  kabupaten: string;
  luas: number;
  varietas: string;
  jenisLahan: string;
  hasil: number;
  harga: number;
  kategori: "Sangat Baik" | "Baik" | "Cukup" | "Perlu Perhatian";
  pendapatan: number;
  tanggal: string;
}

const MOCK: Prediksi[] = [
  { id: 1,  petani: "Budi Santoso",    provinsi: "Jawa Tengah",      kabupaten: "Klaten",        luas: 1.5, varietas: "Ciherang",  jenisLahan: "Irigasi Teknis",    hasil: 5.6, harga: 5800, kategori: "Sangat Baik",    pendapatan: 48720000, tanggal: "14 Apr 2026" },
  { id: 2,  petani: "Siti Rahayu",     provinsi: "Jawa Barat",       kabupaten: "Majalengka",    luas: 0.8, varietas: "Inpari 32", jenisLahan: "Irigasi Teknis",    hasil: 5.1, harga: 5750, kategori: "Baik",           pendapatan: 23460000, tanggal: "14 Apr 2026" },
  { id: 3,  petani: "Ahmad Dahlan",    provinsi: "Sulawesi Selatan", kabupaten: "Bone",          luas: 2.0, varietas: "Mekongga",  jenisLahan: "Setengah Teknis",   hasil: 4.3, harga: 5700, kategori: "Cukup",          pendapatan: 49020000, tanggal: "14 Apr 2026" },
  { id: 4,  petani: "Dewi Sartika",    provinsi: "Jawa Timur",       kabupaten: "Ngawi",         luas: 0.5, varietas: "IR64",      jenisLahan: "Tadah Hujan",       hasil: 3.8, harga: 5600, kategori: "Perlu Perhatian",pendapatan: 10640000, tanggal: "14 Apr 2026" },
  { id: 5,  petani: "Rudi Hartono",    provinsi: "Sumatera Utara",   kabupaten: "Deli Serdang",  luas: 1.2, varietas: "Ciherang",  jenisLahan: "Irigasi Teknis",    hasil: 5.3, harga: 5800, kategori: "Baik",           pendapatan: 36912000, tanggal: "13 Apr 2026" },
  { id: 6,  petani: "Fatimah Zahra",   provinsi: "NTB",              kabupaten: "Lombok Tengah", luas: 0.7, varietas: "Inpari 30", jenisLahan: "Irigasi Teknis",    hasil: 5.8, harga: 5850, kategori: "Sangat Baik",    pendapatan: 23765500, tanggal: "13 Apr 2026" },
  { id: 7,  petani: "Maria Goreti",    provinsi: "NTT",              kabupaten: "Ende",          luas: 1.0, varietas: "Situ Bagendit", jenisLahan: "Tadah Hujan",   hasil: 4.0, harga: 5500, kategori: "Cukup",          pendapatan: 22000000, tanggal: "13 Apr 2026" },
  { id: 8,  petani: "Sukardi",         provinsi: "DI Yogyakarta",    kabupaten: "Bantul",        luas: 0.6, varietas: "Ciherang",  jenisLahan: "Setengah Teknis",   hasil: 4.9, harga: 5750, kategori: "Baik",           pendapatan: 16905000, tanggal: "12 Apr 2026" },
  { id: 9,  petani: "Yusuf Maulana",   provinsi: "Aceh",             kabupaten: "Aceh Utara",    luas: 1.8, varietas: "Inpari 32", jenisLahan: "Irigasi Teknis",    hasil: 5.5, harga: 5750, kategori: "Sangat Baik",    pendapatan: 56925000, tanggal: "12 Apr 2026" },
  { id: 10, petani: "Ratna Dewi",      provinsi: "Jawa Tengah",      kabupaten: "Demak",         luas: 1.1, varietas: "IR64",      jenisLahan: "Irigasi Teknis",    hasil: 4.6, harga: 5700, kategori: "Baik",           pendapatan: 28842000, tanggal: "11 Apr 2026" },
  { id: 11, petani: "Ningrum Wati",    provinsi: "Bali",             kabupaten: "Tabanan",       luas: 0.4, varietas: "Ciherang",  jenisLahan: "Irigasi Teknis",    hasil: 5.2, harga: 5900, kategori: "Baik",           pendapatan: 12272000, tanggal: "11 Apr 2026" },
  { id: 12, petani: "Setiawan",        provinsi: "Jawa Barat",       kabupaten: "Indramayu",     luas: 2.5, varietas: "Inpari 32", jenisLahan: "Irigasi Teknis",    hasil: 6.0, harga: 5800, kategori: "Sangat Baik",    pendapatan: 87000000, tanggal: "10 Apr 2026" },
];

const kategoriCfg = {
  "Sangat Baik":    { color: "bg-green-100 text-green-700",  dot: "bg-green-500" },
  "Baik":           { color: "bg-blue-100 text-blue-700",    dot: "bg-blue-500" },
  "Cukup":          { color: "bg-amber-100 text-amber-700",  dot: "bg-amber-500" },
  "Perlu Perhatian":{ color: "bg-red-100 text-red-700",      dot: "bg-red-500" },
};

const VARIETAS_LIST = ["Semua Varietas", "Ciherang", "Inpari 32", "Inpari 30", "IR64", "Mekongga", "Situ Bagendit"];
const KATEGORI_LIST = ["Semua Kategori", "Sangat Baik", "Baik", "Cukup", "Perlu Perhatian"];
const PER_PAGE = 8;

// ─── Detail Modal ─────────────────────────────────────────────────────────────

function DetailModal({ p, onClose }: { p: Prediksi; onClose: () => void }) {
  const cfg = kategoriCfg[p.kategori];
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

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Petani", val: p.petani },
              { label: "Tanggal", val: p.tanggal },
              { label: "Provinsi", val: p.provinsi },
              { label: "Kabupaten", val: p.kabupaten },
              { label: "Luas Lahan", val: `${p.luas} Ha` },
              { label: "Varietas", val: p.varietas },
              { label: "Jenis Lahan", val: p.jenisLahan },
              { label: "Hasil Panen", val: `${p.hasil} t/ha` },
              { label: "Harga Gabah", val: `Rp ${p.harga.toLocaleString("id-ID")}/kg` },
              { label: "Est. Pendapatan", val: `Rp ${(p.pendapatan / 1e6).toFixed(1)}jt` },
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

  const filtered = MOCK.filter((p) => {
    const matchSearch = p.petani.toLowerCase().includes(search.toLowerCase()) ||
      p.kabupaten.toLowerCase().includes(search.toLowerCase()) ||
      p.provinsi.toLowerCase().includes(search.toLowerCase());
    const matchVarietas = varietasFilter === "Semua Varietas" || p.varietas === varietasFilter;
    const matchKategori = kategoriFilter === "Semua Kategori" || p.kategori === kategoriFilter;
    return matchSearch && matchVarietas && matchKategori;
  });

  const totalPage = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  const rataHasil = (MOCK.reduce((s, p) => s + p.hasil, 0) / MOCK.length).toFixed(1);

  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-gray-900 font-bold text-2xl">Data Prediksi</h1>
          <p className="text-gray-500 text-sm">{MOCK.length} prediksi · rata-rata {rataHasil} t/ha</p>
        </div>
        <button className="flex items-center gap-2 bg-green-700 hover:bg-green-600 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors shadow-sm">
          <Download className="w-4 h-4" />
          Export Excel
        </button>
      </div>

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Sangat Baik", n: MOCK.filter((p) => p.kategori === "Sangat Baik").length, color: "bg-green-50 border-green-200 text-green-700" },
          { label: "Baik",        n: MOCK.filter((p) => p.kategori === "Baik").length,        color: "bg-blue-50 border-blue-200 text-blue-700" },
          { label: "Cukup",       n: MOCK.filter((p) => p.kategori === "Cukup").length,       color: "bg-amber-50 border-amber-200 text-amber-700" },
          { label: "Perlu Perhatian", n: MOCK.filter((p) => p.kategori === "Perlu Perhatian").length, color: "bg-red-50 border-red-200 text-red-700" },
        ].map((c) => (
          <div key={c.label} className={`rounded-2xl border p-4 ${c.color}`}>
            <p className="text-2xl font-bold">{c.n}</p>
            <p className="text-sm font-medium mt-0.5">{c.label}</p>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari petani, kabupaten, provinsi..."
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
                {["#", "Petani", "Lokasi", "Varietas", "Luas", "Hasil (t/ha)", "Harga/kg", "Kategori", "Tanggal", ""].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginated.length === 0 ? (
                <tr><td colSpan={10} className="px-5 py-12 text-center text-gray-400 text-sm">Tidak ada hasil yang cocok</td></tr>
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
                        <p className="text-gray-500 text-sm whitespace-nowrap">{p.kabupaten}, {p.provinsi.split(" ").slice(-1)[0]}</p>
                      </td>
                      <td className="px-5 py-4 text-gray-600 text-sm whitespace-nowrap">{p.varietas}</td>
                      <td className="px-5 py-4 text-gray-600 text-sm">{p.luas} Ha</td>
                      <td className="px-5 py-4">
                        <span className="text-gray-800 font-bold text-sm">{p.hasil}</span>
                      </td>
                      <td className="px-5 py-4 text-gray-600 text-sm whitespace-nowrap">
                        Rp {p.harga.toLocaleString("id-ID")}
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
            {Array.from({ length: totalPage }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => setCurrentPage(n)}
                className={`w-9 h-9 rounded-xl text-sm font-semibold transition-colors ${
                  currentPage === n ? "bg-green-700 text-white" : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {n}
              </button>
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
