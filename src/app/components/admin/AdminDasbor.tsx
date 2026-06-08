import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import {
  Users, BarChart3, TrendingUp,
  ArrowUpRight, ArrowDownRight, ChevronRight,
  MapPin, Sprout, Crown, Shield,
} from "lucide-react";
import type { AdminPage } from "./AdminApp";
import { useState, useEffect } from "react";
import { fetchWithAuth } from "../../../services/api";

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface DasborStats {
  total_users: number;
  total_predictions: number;
  avg_yield: number;
  best_yield: number;
  user_delta: string | null;
  prediction_delta: string | null;
  top_provinsi: any[];
  distribusi_varietas: any[];
  prediksi_per_bulan: any[];
  aktivitas_terbaru: any[];
  admin_users: any[];
}

const kategoriCfg = {
  "Sangat Baik":    { color: "bg-green-100 text-green-700",  dot: "bg-green-500" },
  "Baik":           { color: "bg-blue-100 text-blue-700",    dot: "bg-blue-500" },
  "Cukup":          { color: "bg-amber-100 text-amber-700",  dot: "bg-amber-500" },
  "Perlu Perhatian":{ color: "bg-red-100 text-red-700",      dot: "bg-red-500" },
};

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

export function AdminDasbor({ onNavigate, role }: { onNavigate: (page: AdminPage) => void; role: "admin" | "superadmin" }) {
  const [stats, setStats] = useState<DasborStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWithAuth('/admin/dashboard/stats')
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load dashboard stats", err);
        setLoading(false);
      });
  }, []);

  if (loading || !stats) {
    return <div className="p-8 text-center text-gray-500">Memuat data dasbor...</div>;
  }
  
  const isSuperAdmin = role === "superadmin";
  return (
    <div className="space-y-6">

      {/* ── Page Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 font-bold text-2xl">
            {isSuperAdmin ? "Dasbor Super Admin" : "Dasbor Admin"}
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">{new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })} · Ringkasan sistem SiPadiPrediksi</p>
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
          nilai={stats.total_users.toString()}
          sub="dari bulan lalu"
          icon={Users}
          iconBg="bg-green-700"
          naik={stats.user_delta ? !stats.user_delta.startsWith("-") : false}
          delta={stats.user_delta || undefined}
        />
        <KpiCard
          label="Total Prediksi"
          nilai={stats.total_predictions.toString()}
          sub="dari bulan lalu"
          icon={BarChart3}
          iconBg="bg-blue-600"
          naik={stats.prediction_delta ? !stats.prediction_delta.startsWith("-") : false}
          delta={stats.prediction_delta || undefined}
        />
        <KpiCard
          label="Rata-rata Hasil Panen"
          nilai={`${stats.avg_yield.toLocaleString("id-ID")} kg/ha`}
          sub="musim tanam ini"
          icon={Sprout}
          iconBg="bg-teal-600"
        />
        <KpiCard
          label="Prediksi Terbaik"
          nilai={`${Math.round(stats.best_yield).toLocaleString("id-ID")} kg/ha`}
          sub="hasil tertinggi"
          icon={TrendingUp}
          iconBg="bg-amber-500"
        />
      </div>

      {/* ── Super Admin: Status Admin ── */}
      {isSuperAdmin && stats.admin_users?.length > 0 && (
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
            <div className="space-y-3">
              {stats.admin_users.map((a: any) => (
                <div key={a.email} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                  <div className="w-9 h-9 bg-violet-700 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {a.nama.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-800 text-sm font-semibold truncate">{a.nama}</p>
                    <p className="text-gray-400 text-xs truncate">{a.role === "superadmin" ? "Super Admin" : "Admin"} · {a.loginTerakhir}</p>
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
            <BarChart data={stats.prediksi_per_bulan} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="bulan" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 13 }}
                formatter={(v: number) => [`${v} prediksi`, "Jumlah"]}
              />
              <Bar dataKey="jumlah" radius={[6, 6, 0, 0]}>
                {stats.prediksi_per_bulan.map((_, i) => (
                  <Cell key={i} fill={i === stats.prediksi_per_bulan.length - 1 ? "#15803d" : "#86efac"} />
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
            {stats.distribusi_varietas.map((v) => (
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

      {/* ── Row 3: Top Provinsi ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-gray-800 font-bold text-base">Top Provinsi</h3>
            <p className="text-gray-400 text-sm">Pengguna aktif & rata-rata yield</p>
          </div>
          <MapPin className="w-4 h-4 text-gray-300" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {stats.top_provinsi.map((p, i) => (
            <div key={p.provinsi} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50">
              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                i === 0 ? "bg-amber-400 text-white" : i === 1 ? "bg-gray-300 text-gray-700" : "bg-gray-100 text-gray-500"
              }`}>
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-gray-700 text-sm font-medium truncate">{p.provinsi}</p>
                <p className="text-gray-400 text-xs">{p.prediksi} prediksi · {(p.rata * 1000).toLocaleString("id-ID")} kg/ha rata-rata</p>
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
                {["Petani", "Provinsi", "Varietas", "Hasil (kg/ha)", "Kategori", "Waktu"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {stats.aktivitas_terbaru.map((a, i) => {
                const cfg = kategoriCfg[a.kategori as keyof typeof kategoriCfg] || { color: "bg-gray-100 text-gray-700", dot: "bg-gray-500" };
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
                      <p className="text-gray-800 text-sm font-bold">{a.hasil.toLocaleString("id-ID")}</p>
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

      {/* ── Info Banner ── */}
      {stats.total_users > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-start gap-3">
          <div className="w-8 h-8 bg-green-700 rounded-xl flex items-center justify-center flex-shrink-0">
            <Sprout className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-green-800 font-semibold text-sm">Sistem SiPadiPrediksi Aktif</p>
            <p className="text-green-600 text-sm mt-0.5">
              {stats.total_users} petani terdaftar · {stats.total_predictions} prediksi telah dibuat · Rata-rata hasil {stats.avg_yield.toLocaleString("id-ID")} kg/ha
            </p>
          </div>
        </div>
      )}
    </div>
  );
}