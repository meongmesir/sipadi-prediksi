import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";
import { Download, FileText, Filter, Calendar, TrendingUp, Users, Sprout } from "lucide-react";

// ─── Mock Data ────────────────────────────────────────────────────────────────

const ringkasanBulanan = [
  { bulan: "Nov 2025", prediksi: 98,  pengguna: 72,  rataHasil: 4.9, rataHarga: 5520 },
  { bulan: "Des 2025", prediksi: 134, pengguna: 85,  rataHasil: 5.0, rataHarga: 5680 },
  { bulan: "Jan 2026", prediksi: 112, pengguna: 91,  rataHasil: 5.1, rataHarga: 5750 },
  { bulan: "Feb 2026", prediksi: 145, pengguna: 103, rataHasil: 5.2, rataHarga: 5820 },
  { bulan: "Mar 2026", prediksi: 167, pengguna: 118, rataHasil: 5.2, rataHarga: 5790 },
  { bulan: "Apr 2026", prediksi: 187, pengguna: 127, rataHasil: 5.3, rataHarga: 5850 },
];

const distribusiKategori = [
  { kategori: "Sangat Baik",    jumlah: 312, persen: 37, warna: "#15803d" },
  { kategori: "Baik",           jumlah: 287, persen: 34, warna: "#3b82f6" },
  { kategori: "Cukup",          jumlah: 168, persen: 20, warna: "#f59e0b" },
  { kategori: "Perlu Perhatian",jumlah: 76,  persen: 9,  warna: "#ef4444" },
];

const tabelProvinsi = [
  { no: 1,  provinsi: "Jawa Tengah",       prediksi: 214, rata: 5.4, sangat: 89, baik: 78, cukup: 37, perlu: 10 },
  { no: 2,  provinsi: "Jawa Timur",        prediksi: 178, rata: 5.1, sangat: 64, baik: 67, cukup: 35, perlu: 12 },
  { no: 3,  provinsi: "Jawa Barat",        prediksi: 153, rata: 5.2, sangat: 59, baik: 55, cukup: 30, perlu: 9 },
  { no: 4,  provinsi: "Sulawesi Selatan",  prediksi: 87,  rata: 5.0, sangat: 28, baik: 32, cukup: 20, perlu: 7 },
  { no: 5,  provinsi: "Sumatera Utara",    prediksi: 64,  rata: 4.8, sangat: 18, baik: 24, cukup: 15, perlu: 7 },
  { no: 6,  provinsi: "DI Yogyakarta",     prediksi: 47,  rata: 5.1, sangat: 17, baik: 18, cukup: 9,  perlu: 3 },
  { no: 7,  provinsi: "NTB",               prediksi: 38,  rata: 5.0, sangat: 12, baik: 15, cukup: 8,  perlu: 3 },
  { no: 8,  provinsi: "Bali",              prediksi: 29,  rata: 5.3, sangat: 11, baik: 12, cukup: 5,  perlu: 1 },
];

const BULAN_LIST = ["Apr 2026", "Mar 2026", "Feb 2026", "Jan 2026", "Des 2025", "Nov 2025"];

// ─── Main Component ───────────────────────────────────────────────────────────

export function AdminLaporan() {
  const [bulan, setBulan] = useState("Apr 2026");
  const [jenis, setJenis] = useState("ringkasan");

  const bulanData = ringkasanBulanan.find((r) => r.bulan === bulan) ?? ringkasanBulanan[ringkasanBulanan.length - 1];

  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-gray-900 font-bold text-2xl">Laporan</h1>
          <p className="text-gray-500 text-sm">Ringkasan & analisis data sistem SiPadiPrediksi</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 border-2 border-gray-200 hover:border-green-500 text-gray-700 font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors">
            <FileText className="w-4 h-4" />
            Export PDF
          </button>
          <button className="flex items-center gap-2 bg-green-700 hover:bg-green-600 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors shadow-sm">
            <Download className="w-4 h-4" />
            Export Excel
          </button>
        </div>
      </div>

      {/* ── Filter ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <select
            value={bulan}
            onChange={(e) => setBulan(e.target.value)}
            className="border-2 border-gray-200 focus:border-green-500 rounded-xl px-4 py-2.5 text-sm text-gray-700 appearance-none outline-none bg-white pr-8"
          >
            {BULAN_LIST.map((b) => <option key={b}>{b}</option>)}
          </select>
        </div>
        <div className="flex rounded-xl overflow-hidden border-2 border-gray-200">
          {[
            { key: "ringkasan", label: "Ringkasan" },
            { key: "provinsi",  label: "Per Provinsi" },
            { key: "kategori",  label: "Per Kategori" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setJenis(t.key)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors ${
                jenis === t.key ? "bg-green-700 text-white" : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ═══ RINGKASAN ═══ */}
      {jenis === "ringkasan" && (
        <>
          {/* KPI bulan terpilih */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { icon: FileText, label: "Total Prediksi", val: `${bulanData.prediksi}`, sub: bulan, color: "bg-blue-600" },
              { icon: Users,    label: "Pengguna Aktif",  val: `${bulanData.pengguna}`, sub: "pengguna terdaftar", color: "bg-green-700" },
              { icon: Sprout,   label: "Rata-rata Hasil", val: `${bulanData.rataHasil} t/ha`, sub: "rata nasional", color: "bg-teal-600" },
              { icon: TrendingUp, label: "Harga Rata-rata", val: `Rp ${bulanData.rataHarga.toLocaleString("id-ID")}`, sub: "per kg", color: "bg-amber-500" },
            ].map((c) => (
              <div key={c.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${c.color}`}>
                  <c.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-gray-500 text-xs">{c.label}</p>
                  <p className="text-gray-900 font-bold text-lg mt-0.5">{c.val}</p>
                  <p className="text-gray-400 text-xs">{c.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Bar chart tren bulanan */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-gray-800 font-bold text-base mb-1">Tren Prediksi Bulanan</h3>
            <p className="text-gray-400 text-sm mb-4">6 bulan terakhir</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={ringkasanBulanan} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="bulan" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 13 }}
                  formatter={(v: number, name: string) => [
                    name === "prediksi" ? `${v} prediksi` : `${v} pengguna`,
                    name === "prediksi" ? "Prediksi" : "Pengguna",
                  ]}
                />
                <Bar dataKey="prediksi" name="prediksi" radius={[6, 6, 0, 0]}>
                  {ringkasanBulanan.map((d, i) => (
                    <Cell key={i} fill={d.bulan === bulan ? "#15803d" : "#86efac"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Tabel ringkasan */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h3 className="text-gray-800 font-bold text-base">Tabel Ringkasan 6 Bulan</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {["Bulan", "Prediksi", "Pengguna", "Rata Hasil (t/ha)", "Rata Harga (Rp/kg)"].map((h) => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wide whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {[...ringkasanBulanan].reverse().map((r) => (
                    <tr key={r.bulan} className={`transition-colors ${r.bulan === bulan ? "bg-green-50" : "hover:bg-gray-50"}`}>
                      <td className="px-5 py-4 text-gray-800 text-sm font-semibold">{r.bulan}</td>
                      <td className="px-5 py-4 text-gray-700 text-sm">{r.prediksi}</td>
                      <td className="px-5 py-4 text-gray-700 text-sm">{r.pengguna}</td>
                      <td className="px-5 py-4 text-gray-700 text-sm">{r.rataHasil}</td>
                      <td className="px-5 py-4 text-gray-700 text-sm">Rp {r.rataHarga.toLocaleString("id-ID")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ═══ PER PROVINSI ═══ */}
      {jenis === "provinsi" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h3 className="text-gray-800 font-bold text-base">Laporan per Provinsi — {bulan}</h3>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-300" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {["#", "Provinsi", "Total Prediksi", "Rata Hasil", "Sangat Baik", "Baik", "Cukup", "Perlu Perhatian"].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {tabelProvinsi.map((r) => (
                  <tr key={r.no} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 text-gray-400 text-sm">{r.no}</td>
                    <td className="px-5 py-4 text-gray-800 text-sm font-semibold whitespace-nowrap">{r.provinsi}</td>
                    <td className="px-5 py-4 text-gray-700 text-sm font-bold">{r.prediksi}</td>
                    <td className="px-5 py-4 text-gray-700 text-sm">{r.rata} t/ha</td>
                    <td className="px-5 py-4"><span className="text-green-700 font-bold text-sm">{r.sangat}</span></td>
                    <td className="px-5 py-4"><span className="text-blue-600 font-bold text-sm">{r.baik}</span></td>
                    <td className="px-5 py-4"><span className="text-amber-600 font-bold text-sm">{r.cukup}</span></td>
                    <td className="px-5 py-4"><span className="text-red-600 font-bold text-sm">{r.perlu}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══ PER KATEGORI ═══ */}
      {jenis === "kategori" && (
        <div className="space-y-4">
          {/* Visual bars */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-gray-800 font-bold text-base mb-4">Distribusi Kategori Prediksi — {bulan}</h3>
            <div className="space-y-4">
              {distribusiKategori.map((k) => (
                <div key={k.kategori}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-gray-700 text-sm font-medium">{k.kategori}</span>
                    <span className="text-gray-500 text-sm">
                      {k.jumlah} prediksi ({k.persen}%)
                    </span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${k.persen}%`, backgroundColor: k.warna }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
              <span className="text-gray-500 text-sm">Total Prediksi</span>
              <span className="text-gray-800 font-bold text-lg">
                {distribusiKategori.reduce((s, k) => s + k.jumlah, 0)} prediksi
              </span>
            </div>
          </div>

          {/* Detail cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {distribusiKategori.map((k) => (
              <div key={k.kategori} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-700 font-semibold text-sm">{k.kategori}</span>
                  <span
                    className="text-2xl font-bold"
                    style={{ color: k.warna }}
                  >
                    {k.persen}%
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${k.persen}%`, backgroundColor: k.warna }}
                  />
                </div>
                <p className="text-gray-400 text-sm">{k.jumlah} dari {distribusiKategori.reduce((s, d) => s + d.jumlah, 0)} total prediksi</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
