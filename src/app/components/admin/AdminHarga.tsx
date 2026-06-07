import { useState, useEffect } from "react";
import { fetchWithAuth } from "../../../services/api";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from "recharts";
import { TrendingUp, TrendingDown, Edit2, Save, X, RotateCcw } from "lucide-react";

// ─── Mock Data ────────────────────────────────────────────────────────────────

interface HargaProvinsi {
  provinsi: string;
  hargaSaatIni: number;
  hpp: number;
  updatedAt: string;
  trend: "naik" | "turun" | "stabil";
  delta: number;
}

// ─── Mock Data (Tren Nasional) ────────────────────────────────────────────────

const trenNasional = [
  { bulan: "Okt", harga: 5400, prediksi: null },
  { bulan: "Nov", harga: 5520, prediksi: null },
  { bulan: "Des", harga: 5680, prediksi: null },
  { bulan: "Jan", harga: 5750, prediksi: null },
  { bulan: "Feb", harga: 5820, prediksi: null },
  { bulan: "Mar", harga: 5790, prediksi: null },
  { bulan: "Apr", harga: 5850, prediksi: null },
  { bulan: "Mei", harga: null, prediksi: 5920 },
  { bulan: "Jun", harga: null, prediksi: 5980 },
  { bulan: "Jul", harga: null, prediksi: 6050 },
];

// ─── Edit Modal ───────────────────────────────────────────────────────────────

function EditModal({ item, onSave, onClose }: {
  item: HargaProvinsi;
  onSave: (provinsi: string, harga: number) => void;
  onClose: () => void;
}) {
  const [val, setVal] = useState(item.hargaSaatIni.toString());
  const parsed = parseInt(val.replace(/\D/g, ""), 10) || 0;
  const valid = parsed >= 4000 && parsed <= 10000;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <h2 className="text-gray-800 font-bold text-lg">Update Harga Gabah</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-6 pb-6 space-y-4">
          <div className="bg-green-50 rounded-2xl p-4">
            <p className="text-green-800 font-bold text-base">{item.provinsi}</p>
            <p className="text-green-600 text-sm">Harga saat ini: Rp {item.hargaSaatIni.toLocaleString("id-ID")}/kg</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Harga Baru (Rp/kg) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-semibold">Rp</span>
              <input
                type="number"
                value={val}
                onChange={(e) => setVal(e.target.value)}
                className={`w-full border-2 rounded-xl pl-10 pr-4 py-3.5 text-base outline-none transition-all ${
                  valid || !val
                    ? "border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100"
                    : "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                }`}
                placeholder="5850"
                min={4000}
                max={10000}
              />
            </div>
            {!valid && val && (
              <p className="text-red-500 text-sm mt-1">Harga harus antara Rp 4.000 – Rp 10.000/kg</p>
            )}
            <p className="text-gray-400 text-xs mt-1.5">
              HPP: Rp {item.hpp.toLocaleString("id-ID")}/kg · {parsed > 0 && parsed < item.hpp
                ? `⚠️ Di bawah HPP (−Rp ${(item.hpp - parsed).toLocaleString("id-ID")})`
                : "✅ Di atas HPP"}
            </p>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={() => { if (valid) { onSave(item.provinsi, parsed); onClose(); } }}
              disabled={!valid}
              className="flex-1 flex items-center justify-center gap-2 bg-green-700 hover:bg-green-600 disabled:bg-gray-200 disabled:cursor-not-allowed text-white disabled:text-gray-400 font-bold py-3.5 rounded-2xl text-sm transition-all"
            >
              <Save className="w-4 h-4" />
              Simpan Harga
            </button>
            <button onClick={onClose} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3.5 rounded-2xl text-sm transition-colors">
              Batal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function AdminHarga() {
  const [data, setData] = useState<HargaProvinsi[]>([]);
  const [editing, setEditing] = useState<HargaProvinsi | null>(null);
  const [loading, setLoading] = useState(true);
  const [hppVal, setHppVal] = useState("6500");
  const [editHpp, setEditHpp] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    setLoading(true);
    fetchWithAuth('/admin/harga')
      .then((res: any[]) => {
        const mapped = res.map((r) => ({
          provinsi: r.provinsi,
          hargaSaatIni: r.harga_saat_ini,
          hpp: r.hpp,
          updatedAt: new Date(r.updated_at).toLocaleDateString("id-ID"),
          trend: "stabil" as const,
          delta: 0
        }));
        setData(mapped);
        if (mapped.length > 0) {
          setHppVal(mapped[0].hpp.toString());
        }
      })
      .catch((err: any) => console.error("Error fetching harga:", err))
      .finally(() => setLoading(false));
  };

  const handleSave = async (provinsi: string, val: number) => {
    try {
      await fetchWithAuth(`/admin/harga/update?provinsi=${encodeURIComponent(provinsi)}`, {
        method: "POST",
        body: JSON.stringify({ harga_saat_ini: val })
      });
      fetchData();
    } catch (err) {
      alert("Gagal menyimpan harga: " + err);
    }
  };

  const handleSaveHppGlobally = async () => {
    const v = parseInt(hppVal, 10);
    if (v >= 4000 && v <= 15000) {
      try {
        await Promise.all(data.map(d => 
          fetchWithAuth(`/admin/harga/update?provinsi=${encodeURIComponent(d.provinsi)}`, {
            method: "POST",
            body: JSON.stringify({ hpp: v })
          })
        ));
        fetchData();
      } catch (err) {
        alert("Gagal menyimpan HPP global: " + err);
      }
    }
    setEditHpp(false);
  };

  const hpp = parseInt(hppVal, 10) || 6500;
  const rataHarga = data.length ? Math.round(data.reduce((acc, d) => acc + d.hargaSaatIni, 0) / data.length) : 0;
  const diAtasHpp = data.filter((d) => d.hargaSaatIni >= d.hpp).length;

  if (loading) return <div className="p-8 text-center text-gray-500">Memuat data harga...</div>;

  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <div>
        <h1 className="text-gray-900 font-bold text-2xl">Harga Komoditas Gabah</h1>
        <p className="text-gray-500 text-sm">Kelola & pantau harga gabah per provinsi</p>
      </div>

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-gray-500 text-sm">Rata-rata Nasional</p>
          <p className="text-gray-900 font-bold text-2xl mt-1">Rp {rataHarga.toLocaleString("id-ID")}</p>
          <p className="text-gray-400 text-xs mt-1">per kg · per 14 Apr 2026</p>
        </div>

        {/* HPP Card */}
        <div className="bg-amber-50 rounded-2xl border border-amber-200 shadow-sm p-5">
          <div className="flex items-center justify-between">
            <p className="text-amber-700 text-sm font-semibold">HPP Kementan</p>
            {editHpp ? (
              <div className="flex gap-1">
                <button
                  onClick={handleSaveHppGlobally}
                  className="p-1 rounded-lg bg-green-700 text-white"
                >
                  <Save className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => { setHppVal(hpp.toString()); setEditHpp(false); }} className="p-1 rounded-lg hover:bg-amber-200 text-amber-700">
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button onClick={() => setEditHpp(true)} className="p-1 rounded-lg hover:bg-amber-200 text-amber-600">
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          {editHpp ? (
            <input
              type="number"
              value={hppVal}
              onChange={(e) => setHppVal(e.target.value)}
              className="mt-2 w-full border-2 border-amber-300 rounded-xl px-3 py-2 text-lg font-bold text-amber-800 outline-none bg-white"
            />
          ) : (
            <p className="text-amber-800 font-bold text-2xl mt-1">Rp {hpp.toLocaleString("id-ID")}</p>
          )}
          <p className="text-amber-600 text-xs mt-1">per kg GKP</p>
        </div>

        <div className="bg-green-50 rounded-2xl border border-green-200 shadow-sm p-5">
          <p className="text-green-700 text-sm font-semibold">Di Atas HPP</p>
          <p className="text-green-800 font-bold text-2xl mt-1">{diAtasHpp} / {data.length}</p>
          <p className="text-green-600 text-xs mt-1">provinsi harga ≥ HPP</p>
        </div>
      </div>

      {/* ── Tren Harga Nasional ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-gray-800 font-bold text-base">Tren & Prediksi Harga Nasional</h3>
            <p className="text-gray-400 text-sm">Historis 7 bulan + prediksi 3 bulan ke depan</p>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-green-700 inline-block" /> Aktual</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-amber-400 border-dashed inline-block border-t-2" /> Prediksi</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={trenNasional}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="bulan" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false}
              domain={[5000, 6500]}
              tickFormatter={(v) => `${(v / 1000).toFixed(1)}k`}
            />
            <Tooltip
              contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 13 }}
              formatter={(v: number, name: string) => [
                `Rp ${v.toLocaleString("id-ID")}/kg`,
                name === "harga" ? "Aktual" : "Prediksi",
              ]}
            />
            <ReferenceLine y={hpp} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: "HPP", fill: "#b45309", fontSize: 11, position: "right" }} />
            <Line type="monotone" dataKey="harga" stroke="#15803d" strokeWidth={2.5} dot={{ fill: "#15803d", r: 4 }} connectNulls={false} />
            <Line type="monotone" dataKey="prediksi" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" dot={{ fill: "#f59e0b", r: 3 }} connectNulls={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* ── Tabel Harga per Provinsi ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="text-gray-800 font-bold text-base">Harga Gabah per Provinsi</h3>
          <p className="text-gray-400 text-sm">{data.length} provinsi terdaftar</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {["Provinsi", "Harga (Rp/kg)", "HPP", "Status vs HPP", "Tren", "Diperbarui", "Aksi"].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.map((d) => {
                const diAtasHppItem = d.hargaSaatIni >= hpp;
                return (
                  <tr key={d.provinsi} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 text-gray-800 text-sm font-semibold whitespace-nowrap">{d.provinsi}</td>
                    <td className="px-5 py-4">
                      <span className="text-gray-900 font-bold text-sm">Rp {d.hargaSaatIni.toLocaleString("id-ID")}</span>
                    </td>
                    <td className="px-5 py-4 text-gray-500 text-sm">Rp {d.hpp.toLocaleString("id-ID")}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        d.hargaSaatIni >= d.hpp
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}>
                        {d.hargaSaatIni >= d.hpp
                          ? `+Rp ${(d.hargaSaatIni - d.hpp).toLocaleString("id-ID")}`
                          : `−Rp ${(d.hpp - d.hargaSaatIni).toLocaleString("id-ID")}`}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {d.trend === "naik" ? (
                        <span className="flex items-center gap-1 text-green-600 text-sm font-semibold">
                          <TrendingUp className="w-4 h-4" /> +{d.delta}
                        </span>
                      ) : d.trend === "turun" ? (
                        <span className="flex items-center gap-1 text-red-500 text-sm font-semibold">
                          <TrendingDown className="w-4 h-4" /> {d.delta}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">Stabil</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-gray-400 text-sm whitespace-nowrap">{d.updatedAt}</td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => setEditing(d)}
                        className="flex items-center gap-1.5 text-green-700 hover:text-green-600 text-sm font-semibold transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        Edit
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {editing && <EditModal item={editing} onSave={handleSave} onClose={() => setEditing(null)} />}
    </div>
  );
}
