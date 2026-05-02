import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import {
  Users, BarChart3, TrendingUp, DollarSign,
  ArrowUpRight, ArrowDownRight, ChevronRight,
  MapPin, Sprout, AlertTriangle, Crown, Shield, Activity,
} from "lucide-react";
import type { AdminPage } from "./AdminApp";

// ─── Mock Data ────────────────────────────────────────────────────────────────

const prediksiPerBulan = [
  { bulan: "Nov", jumlah: 98 },
  { bulan: "Des", jumlah: 134 },
  { bulan: "Jan", jumlah: 112 },
  { bulan: "Feb", jumlah: 145 },
  { bulan: "Mar", jumlah: 167 },
  { bulan: "Apr", jumlah: 187 },
];

const distribusiVarietas = [
  { varietas: "Ciherang",  persen: 34, warna: "#15803d" },
  { varietas: "Inpari 32", persen: 24, warna: "#16a34a" },
  { varietas: "IR64",      persen: 17, warna: "#22c55e" },
  { varietas: "Inpari 30", persen: 13, warna: "#4ade80" },
  { varietas: "Mekongga",  persen: 8,  warna: "#86efac" },
  { varietas: "Lainnya",   persen: 4,  warna: "#bbf7d0" },
];

const trenHargaNasional = [
  { bulan: "Okt", harga: 5400 },
  { bulan: "Nov", harga: 5520 },
  { bulan: "Des", harga: 5680 },
  { bulan: "Jan", harga: 5750 },
  { bulan: "Feb", harga: 5820 },
  { bulan: "Mar", harga: 5790 },
  { bulan: "Apr", harga: 5850 },
];

const topProvinsi = [
  { provinsi: "Jawa Tengah",    pengguna: 38, prediksi: 214, rata: 5.4 },
  { provinsi: "Jawa Timur",     pengguna: 29, prediksi: 178, rata: 5.1 },
  { provinsi: "Jawa Barat",     pengguna: 24, prediksi: 153, rata: 5.2 },
  { provinsi: "Sulawesi Sel.",  pengguna: 14, prediksi: 87,  rata: 5.0 },
  { provinsi: "Sumatera Utara", pengguna: 11, prediksi: 64,  rata: 4.8 },
];

const aktivitasTerbaru = [
  { petani: "Budi Santoso",    lokasi: "Klaten, Jateng",    varietas: "Ciherang",  hasil: 5.6, kategori: "Sangat Baik", waktu: "5 menit lalu" },
  { petani: "Siti Rahayu",     lokasi: "Majalengka, Jabar", varietas: "Inpari 32", hasil: 5.1, kategori: "Baik",        waktu: "18 menit lalu" },
  { petani: "Ahmad Dahlan",    lokasi: "Bone, Sulsel",      varietas: "Mekongga",  hasil: 4.3, kategori: "Cukup",       waktu: "42 menit lalu" },
  { petani: "Dewi Sartika",    lokasi: "Ngawi, Jatim",      varietas: "IR64",      hasil: 3.8, kategori: "Perlu Perhatian", waktu: "1 jam lalu" },
  { petani: "Rudi Hartono",    lokasi: "Deli Serdang, Sumut", varietas: "Ciherang", hasil: 5.3, kategori: "Baik",      waktu: "2 jam lalu" },
];

const kategoriCfg = {
  "Sangat Baik":    { color: "bg-green-100 text-green-700",  dot: "bg-green-500" },
  "Baik":           { color: "bg-blue-100 text-blue-700",    dot: "bg-blue-500" },
  "Cukup":          { color: "bg-amber-100 text-amber-700",  dot: "bg-amber-500" },
  "Perlu Perhatian":{ color: "bg-red-100 text-red-700",      dot: "bg-red-500" },
};

const adminAktif = [
  { nama: "Budi Wijaya",    email: "budi.admin@sipadi.id",   loginTerakhir: "Hari ini · 09:30", status: "Online",  aksi: 14 },
  { nama: "Dewi Kusuma",    email: "dewi.admin@sipadi.id",   loginTerakhir: "Kemarin · 14:22",  status: "Offline", aksi: 8  },
  { nama: "Hendra Gunawan", email: "hendra.admin@sipadi.id", loginTerakhir: "3 hari lalu",      status: "Offline", aksi: 21 },
];

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({
  label, nilai, sub, icon: Icon, iconBg, naik, delta,
}: {
  label: string; nilai: string; sub: string;
  icon: typeof Users; iconBg: string;
  naik?: boolean; delta?: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-start gap-4">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-gray-500 text-sm">{label}</p>
        <p className="text-gray-900 font-bold text-2xl mt-0.5">{nilai}</p>
        <div className="flex items-center gap-1.5 mt-1">
          {delta && (
            <span className={`flex items-center gap-0.5 text-xs font-bold ${naik ? "text-green-600" : "text-red-500"}`}>
              {naik
                ? <ArrowUpRight className="w-3 h-3" />
                : <ArrowDownRight className="w-3 h-3" />}
              {delta}
            </span>
          )}
          <span className="text-gray-400 text-xs">{sub}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface Props {
  onNavigate: (page: AdminPage) => void;
  role: "admin" | "superadmin";
}

export function AdminDasbor({ onNavigate, role }: Props) {
  const isSuperAdmin = role === "superadmin";
  return (
    <div className="space-y-6">

      {/* ── Page Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 font-bold text-2xl">
            {isSuperAdmin ? "Dasbor Super Admin" : "Dasbor Admin"}
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">Selasa, 14 April 2026 · Ringkasan sistem SiPadiPrediksi</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-green-700 text-sm font-semibold">Sistem Aktif</span>
        </div>
      </div>

      {/* ── Super Admin Extra Banner ── */}
      {isSuperAdmin && (
        <div className="bg-gradient-to-r from-violet-600 to-violet-800 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Crown className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-base">Mode Super Admin</p>
              <p className="text-violet-200 text-sm">Anda memiliki akses penuh ke seluruh sistem termasuk kelola admin & pengaturan</p>
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={() => onNavigate("pengguna")}
              className="bg-white/20 hover:bg-white/30 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-colors"
            >
              Kelola Pengguna
            </button>
            <button
              onClick={() => onNavigate("kelola-admin")}
              className="bg-white hover:bg-violet-50 text-violet-700 font-semibold px-4 py-2 rounded-xl text-sm transition-colors"
            >
              Kelola Admin
            </button>
          </div>
        </div>
      )}

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          label="Total Pengguna"
          nilai="127"
          sub="dari bulan lalu"
          icon={Users}
          iconBg="bg-green-700"
          naik
          delta="+12"
        />
        <KpiCard
          label="Total Prediksi"
          nilai="843"
          sub="dari bulan lalu"
          icon={BarChart3}
          iconBg="bg-blue-600"
          naik
          delta="+11.2%"
        />
        <KpiCard
          label="Rata-rata Hasil"
          nilai="5,2 t/ha"
          sub="musim tanam ini"
          icon={Sprout}
          iconBg="bg-teal-600"
          naik
          delta="+0.3"
        />
        <KpiCard
          label="Harga Gabah Nasional"
          nilai="Rp 5.850"
          sub="per kg · Apr 2026"
          icon={DollarSign}
          iconBg="bg-amber-500"
          naik
          delta="+0.7%"
        />
      </div>

      {/* ── Super Admin: Status Admin ── */}
      {isSuperAdmin && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-violet-100 rounded-xl flex items-center justify-center">
                <Shield className="w-4 h-4 text-violet-700" />
              </div>
              <div>
                <h3 className="text-gray-800 font-bold text-base">Status Admin</h3>
                <p className="text-gray-400 text-sm">Aktivitas admin terdaftar</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate("kelola-admin")}
              className="text-violet-700 text-sm font-semibold hover:underline flex items-center gap-1"
            >
              Kelola Admin <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-3 gap-4 mb-5">
              {[
                { label: "Total Admin", nilai: "4", icon: "🛡️", color: "bg-violet-50 text-violet-700" },
                { label: "Admin Aktif",  nilai: "3", icon: "🟢", color: "bg-green-50 text-green-700"  },
                { label: "Aksi Hari Ini", nilai: "23", icon: "⚡", color: "bg-amber-50 text-amber-700" },
              ].map((s) => (
                <div key={s.label} className={`rounded-xl p-3.5 text-center ${s.color}`}>
                  <p className="text-xl mb-1">{s.icon}</p>
                  <p className="font-bold text-xl">{s.nilai}</p>
                  <p className="text-xs mt-0.5 opacity-80">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              {adminAktif.map((a) => (
                <div key={a.email} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                  <div className="w-9 h-9 bg-violet-700 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {a.nama.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-800 text-sm font-semibold truncate">{a.nama}</p>
                    <p className="text-gray-400 text-xs truncate">{a.loginTerakhir}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500 text-xs">{a.aksi} aksi</span>
                    <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                      a.status === "Online"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${a.status === "Online" ? "bg-green-500" : "bg-gray-400"}`} />
                      {a.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Row 2: Bar Chart + Distribusi Varietas ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Prediksi per Bulan */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-gray-800 font-bold text-base">Prediksi per Bulan</h3>
              <p className="text-gray-400 text-sm">6 bulan terakhir</p>
            </div>
            <button
              onClick={() => onNavigate("prediksi")}
              className="text-green-700 text-sm font-semibold hover:underline flex items-center gap-1"
            >
              Lihat semua <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={prediksiPerBulan} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="bulan" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 13 }}
                formatter={(v: number) => [`${v} prediksi`, "Jumlah"]}
              />
              <Bar dataKey="jumlah" radius={[6, 6, 0, 0]}>
                {prediksiPerBulan.map((_, i) => (
                  <Cell key={i} fill={i === prediksiPerBulan.length - 1 ? "#15803d" : "#86efac"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Distribusi Varietas */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-gray-800 font-bold text-base mb-1">Varietas Padi</h3>
          <p className="text-gray-400 text-sm mb-4">Distribusi seluruh prediksi</p>
          <div className="space-y-3">
            {distribusiVarietas.map((v) => (
              <div key={v.varietas}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-gray-700 text-sm">{v.varietas}</span>
                  <span className="text-gray-500 text-sm font-semibold">{v.persen}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${v.persen}%`, backgroundColor: v.warna }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Row 3: Tren Harga + Top Provinsi ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Tren Harga Nasional */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-gray-800 font-bold text-base">Tren Harga Gabah Nasional</h3>
              <p className="text-gray-400 text-sm">Rata-rata nasional (Rp/kg)</p>
            </div>
            <button
              onClick={() => onNavigate("harga")}
              className="text-green-700 text-sm font-semibold hover:underline flex items-center gap-1"
            >
              Kelola <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <ResponsiveContainer width="100%" height={190}>
            <LineChart data={trenHargaNasional}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="bulan" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false}
                domain={[5000, 6200]}
                tickFormatter={(v) => `${(v / 1000).toFixed(1)}k`}
              />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 13 }}
                formatter={(v: number) => [`Rp ${v.toLocaleString("id-ID")}`, "Harga"]}
              />
              <Line
                type="monotone" dataKey="harga" stroke="#15803d" strokeWidth={2.5}
                dot={{ fill: "#15803d", r: 4 }} activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top Provinsi */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-gray-800 font-bold text-base">Top Provinsi</h3>
              <p className="text-gray-400 text-sm">Pengguna aktif</p>
            </div>
            <MapPin className="w-4 h-4 text-gray-300" />
          </div>
          <div className="space-y-3">
            {topProvinsi.map((p, i) => (
              <div key={p.provinsi} className="flex items-center gap-3">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  i === 0 ? "bg-amber-400 text-white" : "bg-gray-100 text-gray-500"
                }`}>
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-700 text-sm font-medium truncate">{p.provinsi}</p>
                  <p className="text-gray-400 text-xs">{p.prediksi} prediksi · {p.rata} t/ha</p>
                </div>
                <span className="text-gray-500 text-sm font-semibold flex-shrink-0">{p.pengguna}</span>
              </div>
            ))}
          </div>
          {isSuperAdmin && (
            <button
              onClick={() => onNavigate("pengguna")}
              className="w-full mt-4 text-violet-700 text-sm font-semibold hover:underline flex items-center justify-center gap-1"
            >
              Lihat semua pengguna <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* ── Row 4: Aktivitas Terbaru ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h3 className="text-gray-800 font-bold text-base">Aktivitas Prediksi Terbaru</h3>
            <p className="text-gray-400 text-sm">5 prediksi terakhir masuk</p>
          </div>
          <button
            onClick={() => onNavigate("prediksi")}
            className="text-green-700 text-sm font-semibold hover:underline flex items-center gap-1"
          >
            Lihat semua <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {["Petani", "Lokasi", "Varietas", "Hasil (t/ha)", "Kategori", "Waktu"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {aktivitasTerbaru.map((a, i) => {
                const cfg = kategoriCfg[a.kategori as keyof typeof kategoriCfg];
                return (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="text-gray-800 text-sm font-semibold">{a.petani}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-gray-500 text-sm">{a.lokasi}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-gray-700 text-sm">{a.varietas}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-gray-800 text-sm font-bold">{a.hasil}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        {a.kategori}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-gray-400 text-sm">{a.waktu}</p>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Alert Banner ── */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
        <div className="w-8 h-8 bg-amber-400 rounded-xl flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-amber-800 font-semibold text-sm">3 Pengguna Baru Menunggu Verifikasi</p>
          <p className="text-amber-600 text-sm mt-0.5">
            Ada 3 pendaftaran akun baru yang perlu ditinjau.{" "}
            {isSuperAdmin ? (
              <button onClick={() => onNavigate("pengguna")} className="font-bold underline">
                Tinjau sekarang →
              </button>
            ) : (
              <span>Hubungi Super Admin untuk meninjau.</span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}