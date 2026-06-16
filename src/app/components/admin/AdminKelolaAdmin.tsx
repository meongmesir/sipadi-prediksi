import { useState, useEffect } from "react";
import { fetchWithAuth } from "../../../services/api";
import {
  Search, Plus, Eye, UserCheck, UserX, X,
  Mail, Shield, Clock, ChevronLeft, ChevronRight,
  CheckCircle2, Loader2, Crown, EyeOff,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AdminData {
  id: number;
  nama: string;
  email: string;
  tglDibuat: string;
  loginTerakhir: string;
  jumlahAksi: number;
  status: "Aktif" | "Nonaktif";
}

// ─── Mock Data Dihapus, Menggunakan API ──────────────────────────────────────

const statusCfg = {
  Aktif:    { color: "bg-green-100 text-green-700 border-green-200", dot: "bg-green-500" },
  Nonaktif: { color: "bg-gray-100 text-gray-500 border-gray-200",   dot: "bg-gray-400" },
};

const PER_PAGE = 8;

// ─── Detail Modal ─────────────────────────────────────────────────────────────

function DetailModal({
  admin,
  onClose,
  onToggleStatus,
}: {
  admin: AdminData;
  onClose: () => void;
  onToggleStatus: (id: number) => void;
}) {
  const cfg = statusCfg[admin.status];
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <h2 className="text-gray-800 font-bold text-lg">Detail Admin</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-6 pb-6 space-y-4">
          {/* Avatar + Name */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-violet-700 rounded-2xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
              {admin.nama.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()}
            </div>
            <div>
              <p className="text-gray-800 font-bold text-lg leading-tight">{admin.nama}</p>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg.color}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                {admin.status}
              </span>
            </div>
          </div>

          {/* Role badge */}
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            <Shield className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <div>
              <p className="text-amber-800 font-semibold text-sm">Administrator</p>
              <p className="text-amber-600 text-xs">Akses: Data Prediksi, Laporan</p>
            </div>
          </div>

          {/* Info */}
          <div className="space-y-3 bg-gray-50 rounded-2xl p-4">
            {[
              { icon: Mail,  label: "Email",            val: admin.email },
              { icon: Clock, label: "Tgl Dibuat",       val: admin.tglDibuat },
              { icon: Clock, label: "Login Terakhir",   val: admin.loginTerakhir },
              { icon: Shield, label: "Jumlah Aksi",     val: `${admin.jumlahAksi} aksi tercatat` },
            ].map((r) => (
              <div key={r.label} className="flex items-center gap-3">
                <r.icon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <div>
                  <p className="text-gray-400 text-xs">{r.label}</p>
                  <p className="text-gray-700 text-sm font-medium">{r.val}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {admin.status === "Aktif" ? (
              <button
                onClick={() => { onToggleStatus(admin.id); onClose(); }}
                className="flex-1 flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 font-semibold py-3 rounded-xl text-sm transition-colors"
              >
                <UserX className="w-4 h-4" /> Nonaktifkan
              </button>
            ) : (
              <button
                onClick={() => { onToggleStatus(admin.id); onClose(); }}
                className="flex-1 flex items-center justify-center gap-2 bg-green-50 hover:bg-green-100 text-green-700 font-semibold py-3 rounded-xl text-sm transition-colors"
              >
                <UserCheck className="w-4 h-4" /> Aktifkan
              </button>
            )}
            <button
              onClick={onClose}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl text-sm transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Tambah Admin Modal ───────────────────────────────────────────────────────

function TambahAdminModal({
  onClose,
  onSimpan,
}: {
  onClose: () => void;
  onSimpan: (nama: string, email: string) => void;
}) {
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<{ nama?: string; email?: string; password?: string }>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!nama.trim() || nama.trim().length < 3) e.nama = "Nama minimal 3 karakter";
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      e.email = "Format email tidak valid";
    if (!password || password.length < 8)
      e.password = "Password minimal 8 karakter";
    else if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(password))
      e.password = "Password harus mengandung huruf dan angka";
    return e;
  };

  const handleSimpan = async () => {
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setSuccess(true);
    setTimeout(() => {
      onSimpan(nama.trim(), email.trim().toLowerCase());
    }, 1500);
  };

  const inputCls = (hasErr?: string) =>
    `w-full border-2 rounded-xl px-4 py-3 text-sm text-gray-800 outline-none transition-all ${
      hasErr
        ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100"
        : "border-gray-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
    }`;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-violet-700 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-gray-900 font-bold text-base leading-tight">Tambah Admin Baru</p>
              <p className="text-gray-400 text-xs">Role: Administrator</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {success ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-violet-700" />
              </div>
              <p className="text-gray-800 font-bold text-lg mb-1">Admin Berhasil Ditambahkan!</p>
              <p className="text-gray-500 text-sm">{nama} kini memiliki akses sebagai Administrator</p>
            </div>
          ) : (
            <>
              {/* Info Box */}
              <div className="bg-violet-50 border border-violet-200 rounded-xl p-3.5 flex items-start gap-2.5">
                <Crown className="w-4 h-4 text-violet-700 flex-shrink-0 mt-0.5" />
                <p className="text-violet-700 text-xs leading-relaxed">
                  Admin baru akan mendapatkan akses ke: Data Prediksi, dan Laporan. Akses Kelola Pengguna & Pengaturan hanya untuk Super Admin.
                </p>
              </div>

              {/* Nama */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Nama admin"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  className={inputCls(errors.nama)}
                  disabled={loading}
                />
                {errors.nama && (
                  <p className="text-red-500 text-xs mt-1">⚠ {errors.nama}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder="admin@sipadi.id"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputCls(errors.email)}
                  disabled={loading}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">⚠ {errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    placeholder="Min. 8 karakter, huruf dan angka"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`${inputCls(errors.password)} pr-11`}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">⚠ {errors.password}</p>
                )}
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={onClose}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl text-sm transition-colors"
                  disabled={loading}
                >
                  Batal
                </button>
                <button
                  onClick={handleSimpan}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 bg-violet-700 hover:bg-violet-600 disabled:bg-gray-200 disabled:cursor-not-allowed text-white disabled:text-gray-400 font-bold py-3 rounded-xl text-sm transition-all"
                >
                  {loading
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</>
                    : <><Plus className="w-4 h-4" /> Tambah Admin</>
                  }
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function AdminKelolaAdmin() {
  const [admins, setAdmins] = useState<AdminData[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [currentPage, setCurrentPage] = useState(1);
  const [selected, setSelected] = useState<AdminData | null>(null);
  const [showTambah, setShowTambah] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWithAuth('/admin/users')
      .then((data: any[]) => {
        const adminUsers = data.filter((u: any) => u.role === 'admin' || u.role === 'superadmin');
        const mapped = adminUsers.map((u: any) => ({
          id: u.id,
          nama: u.nama_lengkap,
          email: u.email,
          tglDibuat: u.created_at ? new Date(u.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : "Tidak diketahui",
          loginTerakhir: "Baru-baru ini",
          jumlahAksi: u.role === "superadmin" ? 99 : 10,
          status: "Aktif" as const
        }));
        setAdmins(mapped);
      })
      .catch((err) => console.error("Gagal mengambil data user:", err))
      .finally(() => setLoading(false));
  }, []);

  // Filter
  const filtered = admins.filter((a) => {
    const matchSearch =
      a.nama.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "Semua" || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPage = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  const totalAktif = admins.filter((a) => a.status === "Aktif").length;

  const handleToggleStatus = (id: number) => {
    setAdmins((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, status: a.status === "Aktif" ? "Nonaktif" : "Aktif" }
          : a
      )
    );
  };

  const handleTambahAdmin = (nama: string, email: string) => {
    const newAdmin: AdminData = {
      id: admins.length + 1,
      nama,
      email,
      tglDibuat: "14 Apr 2026",
      loginTerakhir: "Belum pernah login",
      jumlahAksi: 0,
      status: "Aktif",
    };
    setAdmins((prev) => [newAdmin, ...prev]);
    setShowTambah(false);
  };

  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-gray-900 font-bold text-2xl">Kelola Admin</h1>
          <p className="text-gray-500 text-sm">{admins.length} administrator terdaftar · {totalAktif} aktif</p>
        </div>
        <button
          onClick={() => setShowTambah(true)}
          className="flex items-center gap-2 bg-violet-700 hover:bg-violet-600 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors shadow-sm shadow-violet-200"
        >
          <Plus className="w-4 h-4" />
          Tambah Admin Baru
        </button>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Admin",     nilai: admins.length,                                         bg: "bg-violet-50",  text: "text-violet-700", icon: "🛡️" },
          { label: "Admin Aktif",     nilai: totalAktif,                                            bg: "bg-green-50",   text: "text-green-700",  icon: "✅" },
          { label: "Admin Nonaktif",  nilai: admins.filter((a) => a.status === "Nonaktif").length,  bg: "bg-gray-50",    text: "text-gray-600",   icon: "⏸️" },
          { label: "Aksi Total",      nilai: admins.reduce((acc, a) => acc + a.jumlahAksi, 0),      bg: "bg-amber-50",   text: "text-amber-700",  icon: "⚡" },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-4 border border-transparent`}>
            <p className="text-xl mb-2">{s.icon}</p>
            <p className={`font-bold text-2xl ${s.text}`}>{s.nilai}</p>
            <p className="text-gray-500 text-xs mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nama atau email admin..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="w-full border-2 border-gray-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-100 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none transition-all"
          />
        </div>

        {/* Status Filter */}
        <div className="flex rounded-xl overflow-hidden border-2 border-gray-200">
          {["Semua", "Aktif", "Nonaktif"].map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setCurrentPage(1); }}
              className={`px-4 py-2.5 text-sm font-medium transition-colors ${
                statusFilter === s ? "bg-violet-700 text-white" : "bg-white text-gray-600 hover:bg-gray-50"
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
                {["#", "Administrator", "Email", "Tgl Dibuat", "Login Terakhir", "Aksi", "Status", ""].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wide whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-gray-400 text-sm">
                    Tidak ada admin yang cocok dengan filter
                  </td>
                </tr>
              ) : (
                paginated.map((a) => {
                  const cfg = statusCfg[a.status];
                  return (
                    <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4 text-gray-400 text-sm">{a.id}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-violet-700 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {a.nama.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()}
                          </div>
                          <div>
                            <p className="text-gray-800 text-sm font-semibold whitespace-nowrap">{a.nama}</p>
                            <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                              <Shield className="w-2.5 h-2.5" /> Admin
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-gray-500 text-sm">{a.email}</td>
                      <td className="px-5 py-4 text-gray-500 text-sm whitespace-nowrap">{a.tglDibuat}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-gray-500 text-sm whitespace-nowrap">
                          <Clock className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
                          {a.loginTerakhir}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-gray-800 font-bold text-sm">{a.jumlahAksi}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                          {a.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelected(a)}
                            className="flex items-center gap-1.5 text-violet-700 hover:text-violet-600 text-sm font-semibold transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            Detail
                          </button>
                          {a.status === "Aktif" ? (
                            <button
                              onClick={() => handleToggleStatus(a.id)}
                              className="flex items-center gap-1 text-red-500 hover:text-red-600 text-sm font-semibold transition-colors"
                              title="Nonaktifkan"
                            >
                              <UserX className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleToggleStatus(a.id)}
                              className="flex items-center gap-1 text-green-600 hover:text-green-700 text-sm font-semibold transition-colors"
                              title="Aktifkan"
                            >
                              <UserCheck className="w-4 h-4" />
                            </button>
                          )}
                        </div>
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
            Menampilkan {Math.min((currentPage - 1) * PER_PAGE + 1, filtered.length)}–
            {Math.min(currentPage * PER_PAGE, filtered.length)} dari {filtered.length} admin
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
                  currentPage === n ? "bg-violet-700 text-white" : "border border-gray-200 text-gray-600 hover:bg-gray-50"
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

      {/* ── Info Box ── */}
      <div className="bg-violet-50 border border-violet-200 rounded-2xl p-4 flex items-start gap-3">
        <div className="w-8 h-8 bg-violet-700 rounded-xl flex items-center justify-center flex-shrink-0">
          <Crown className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-violet-800 font-semibold text-sm">Hak Akses Super Admin</p>
          <p className="text-violet-600 text-sm mt-0.5">
            Hanya Super Admin yang dapat membuat, mengedit, dan menonaktifkan akun Administrator.
            Admin tidak dapat mengakses halaman ini.
          </p>
        </div>
      </div>

      {/* ── Modals ── */}
      {selected && (
        <DetailModal
          admin={selected}
          onClose={() => setSelected(null)}
          onToggleStatus={handleToggleStatus}
        />
      )}
      {showTambah && (
        <TambahAdminModal
          onClose={() => setShowTambah(false)}
          onSimpan={handleTambahAdmin}
        />
      )}
    </div>
  );
}
