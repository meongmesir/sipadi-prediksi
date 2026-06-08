import { useState, useEffect } from "react";
import {
  Search, Filter, ChevronLeft, ChevronRight,
  Eye, UserCheck, UserX, X, Mail, Phone, MapPin, BarChart3,
} from "lucide-react";
import { fetchWithAuth } from "../../../services/api";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Pengguna {
  id: number;
  nama: string;
  email: string;
  hp: string;
  provinsi: string;
  tglDaftar: string;
  jumlahPrediksi: number;
  status: "Aktif" | "Nonaktif" | "Menunggu";
}

const statusCfg = {
  Aktif:     { color: "bg-green-100 text-green-700 border-green-200",  dot: "bg-green-500" },
  Nonaktif:  { color: "bg-gray-100 text-gray-500 border-gray-200",     dot: "bg-gray-400" },
  Menunggu:  { color: "bg-amber-100 text-amber-700 border-amber-200",  dot: "bg-amber-500" },
};

const PROVINSI_FILTER = [
  "Semua Provinsi", "Jawa Tengah", "Jawa Barat", "Jawa Timur",
  "Sulawesi Selatan", "Sumatera Utara", "NTB", "NTT", "DI Yogyakarta",
  "Kalimantan Selatan", "Aceh", "Bali",
];

const PER_PAGE = 8;

// ─── Detail Modal ─────────────────────────────────────────────────────────────

function DetailModal({ p, onClose }: { p: Pengguna; onClose: () => void }) {
  const cfg = statusCfg[p.status];
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <h2 className="text-gray-800 font-bold text-lg">Detail Pengguna</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-400">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-6 pb-6 space-y-4">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-green-700 rounded-2xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
              {p.nama.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()}
            </div>
            <div>
              <p className="text-gray-800 font-bold text-lg leading-tight">{p.nama}</p>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg.color}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                {p.status}
              </span>
            </div>
          </div>

          {/* Info */}
          <div className="space-y-3 bg-gray-50 rounded-2xl p-4">
            {[
              { icon: Mail, label: "Email", val: p.email },
              { icon: Phone, label: "Nomor HP", val: p.hp },
              { icon: MapPin, label: "Provinsi", val: p.provinsi },
              { icon: BarChart3, label: "Jumlah Prediksi", val: `${p.jumlahPrediksi} prediksi` },
            ].map((r) => (
              <div key={r.label} className="flex items-center gap-3">
                <r.icon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <div>
                  <p className="text-gray-400 text-xs">{r.label}</p>
                  <p className="text-gray-700 text-sm font-medium">{r.val}</p>
                </div>
              </div>
            ))}
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 text-gray-400 flex-shrink-0 text-xs font-bold">📅</div>
              <div>
                <p className="text-gray-400 text-xs">Tanggal Daftar</p>
                <p className="text-gray-700 text-sm font-medium">{p.tglDaftar}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {p.status === "Menunggu" && (
              <button className="flex-1 flex items-center justify-center gap-2 bg-green-700 hover:bg-green-600 text-white font-semibold py-3 rounded-xl text-sm transition-colors">
                <UserCheck className="w-4 h-4" /> Verifikasi
              </button>
            )}
            {p.status === "Aktif" && (
              <button className="flex-1 flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 font-semibold py-3 rounded-xl text-sm transition-colors">
                <UserX className="w-4 h-4" /> Nonaktifkan
              </button>
            )}
            {p.status === "Nonaktif" && (
              <button className="flex-1 flex items-center justify-center gap-2 bg-green-50 hover:bg-green-100 text-green-700 font-semibold py-3 rounded-xl text-sm transition-colors">
                <UserCheck className="w-4 h-4" /> Aktifkan
              </button>
            )}
            <button onClick={onClose} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl text-sm transition-colors">
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function AdminPengguna() {
  const [pengguna, setPengguna] = useState<Pengguna[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [provinsiFilter, setProvinsiFilter] = useState("Semua Provinsi");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [currentPage, setCurrentPage] = useState(1);
  const [selected, setSelected] = useState<Pengguna | null>(null);

  useEffect(() => {
    fetchWithAuth('/admin/users')
      .then((data: any[]) => {
        const mapped: Pengguna[] = data.map((u: any) => ({
          id: u.id,
          nama: u.nama_lengkap,
          email: u.email,
          hp: u.no_hp || "-",
          provinsi: u.provinsi,
          tglDaftar: u.created_at ? new Date(u.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-",
          jumlahPrediksi: u.jumlah_prediksi ?? 0,
          status: "Aktif",
        }));
        setPengguna(mapped);
      })
      .catch((err) => console.error("Gagal memuat pengguna:", err))
      .finally(() => setLoading(false));
  }, []);

  // Filter
  const filtered = pengguna.filter((p) => {
    const matchSearch = p.nama.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase());
    const matchProv = provinsiFilter === "Semua Provinsi" || p.provinsi === provinsiFilter;
    const matchStatus = statusFilter === "Semua" || p.status === statusFilter;
    return matchSearch && matchProv && matchStatus;
  });

  const totalPage = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  const totalAktif    = pengguna.filter((p) => p.status === "Aktif").length;
  const totalMenunggu = pengguna.filter((p) => p.status === "Menunggu").length;

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Memuat data pengguna...</div>;
  }

  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-gray-900 font-bold text-2xl">Data Pengguna</h1>
          <p className="text-gray-500 text-sm">{pengguna.length} total pengguna terdaftar</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="bg-green-100 text-green-700 font-bold px-3 py-1.5 rounded-xl">{totalAktif} Aktif</span>
          <span className="bg-amber-100 text-amber-700 font-bold px-3 py-1.5 rounded-xl">{totalMenunggu} Menunggu</span>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nama atau email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="w-full border-2 border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none transition-all"
          />
        </div>

        {/* Provinsi Filter */}
        <div className="relative">
          <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <select
            value={provinsiFilter}
            onChange={(e) => { setProvinsiFilter(e.target.value); setCurrentPage(1); }}
            className="border-2 border-gray-200 focus:border-green-500 rounded-xl pl-10 pr-8 py-2.5 text-sm text-gray-700 appearance-none outline-none bg-white"
          >
            {PROVINSI_FILTER.map((p) => <option key={p}>{p}</option>)}
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex rounded-xl overflow-hidden border-2 border-gray-200">
          {["Semua", "Aktif", "Menunggu", "Nonaktif"].map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setCurrentPage(1); }}
              className={`px-3.5 py-2.5 text-sm font-medium transition-colors ${
                statusFilter === s ? "bg-green-700 text-white" : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {["#", "Nama Pengguna", "Email", "Provinsi", "Tgl Daftar", "Prediksi", "Status", "Aksi"].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-gray-400 text-sm">
                    Tidak ada pengguna yang cocok dengan filter
                  </td>
                </tr>
              ) : (
                paginated.map((p) => {
                  const cfg = statusCfg[p.status];
                  return (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4 text-gray-400 text-sm">{p.id}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-green-700 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {p.nama.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()}
                          </div>
                          <p className="text-gray-800 text-sm font-semibold whitespace-nowrap">{p.nama}</p>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-gray-500 text-sm">{p.email}</td>
                      <td className="px-5 py-4 text-gray-600 text-sm whitespace-nowrap">{p.provinsi}</td>
                      <td className="px-5 py-4 text-gray-500 text-sm whitespace-nowrap">{p.tglDaftar}</td>
                      <td className="px-5 py-4">
                        <span className="text-gray-800 font-bold text-sm">{p.jumlahPrediksi}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                          {p.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => setSelected(p)}
                          className="flex items-center gap-1.5 text-green-700 hover:text-green-600 text-sm font-semibold transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          Detail
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
            Menampilkan {Math.min((currentPage - 1) * PER_PAGE + 1, filtered.length)}–{Math.min(currentPage * PER_PAGE, filtered.length)} dari {filtered.length} pengguna
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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
              className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Detail Modal ── */}
      {selected && <DetailModal p={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
