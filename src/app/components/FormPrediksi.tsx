import { useState } from "react";
import { ChevronRight, ChevronLeft, Info, Loader2, MapPin, Leaf } from "lucide-react";
import type { DataLahan, HasilType } from "../../types";
import {
  provinsiList, cultivarList, sowingDoyList, plantPopList,
  nTotalRange, waterCodeList, provinsiGeo,
} from "../../utils/constants";
import { hitungPrediksi } from "../../services/predictionService";

// ─── Default Values ───────────────────────────────────────────────────────────

const INIT_FORM: DataLahan = {
  namaLahan: "",
  provinsi: "Jawa Tengah",
  luasLahan: "",
  cultivarName: "IR_72",
  sowingDoy: 154,
  nTotalKgHa: 100,
  plantPop: 25,
  waterCode: "A",
};

// ─── Komponen Form ────────────────────────────────────────────────────────────

export function FormPrediksi({ onHasil }: { onHasil: (h: HasilType) => void }) {
  const [form, setForm] = useState<DataLahan>(INIT_FORM);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const upd = <K extends keyof DataLahan>(k: K, v: DataLahan[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const geo = provinsiGeo[form.provinsi];

  const isStep1Valid = !!form.provinsi;
  const isStep2Valid =
    !!form.luasLahan &&
    parseFloat(form.luasLahan) > 0 &&
    !!form.cultivarName &&
    form.sowingDoy > 0 &&
    form.plantPop > 0 &&
    !!form.waterCode;

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const hasil = await hitungPrediksi(form);
      onHasil(hasil);
    } catch (error: any) {
      alert(error.message || "Terjadi kesalahan saat memprediksi");
    } finally {
      setLoading(false);
    }
  };

  // ── Field Label ──
  const Label = ({ text, required }: { text: string; required?: boolean }) => (
    <label className="block text-base font-semibold text-gray-700 mb-2">
      {text} {required && <span className="text-red-500">*</span>}
    </label>
  );

  // ── Steps indicator ──
  const steps = [
    { no: 1, label: "Lokasi" },
    { no: 2, label: "Parameter Model" },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Step indicator */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-center gap-4">
          {steps.map((s, i) => (
            <div key={s.no} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  step > s.no ? "bg-green-600 text-white" : step === s.no ? "bg-green-700 text-white shadow-lg shadow-green-200" : "bg-gray-100 text-gray-400"
                }`}>
                  {step > s.no ? "✓" : s.no}
                </div>
                <p className={`text-xs mt-1.5 font-medium ${step >= s.no ? "text-green-700" : "text-gray-400"}`}>{s.label}</p>
              </div>
              {i < steps.length - 1 && (
                <div className={`w-20 h-0.5 mx-3 mb-5 transition-all ${step > s.no ? "bg-green-500" : "bg-gray-200"}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ═══ STEP 1: Lokasi ═══ */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <MapPin className="w-5 h-5 text-green-700" />
              </div>
              <div>
                <h2 className="text-gray-800 font-bold text-lg">Lokasi Lahan Anda</h2>
                <p className="text-gray-500 text-sm">Pilih provinsi — data lokasi lahan terisi otomatis</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label text="Nama Lahan" />
                <input
                  type="text"
                  placeholder="Contoh: Sawah Pak Budi Blok A (opsional)"
                  value={form.namaLahan}
                  onChange={(e) => upd("namaLahan", e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 text-base text-gray-700 outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all"
                />
              </div>
              <div>
                <Label text="Provinsi" required />
                <select
                  value={form.provinsi}
                  onChange={(e) => upd("provinsi", e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 text-base text-gray-700 outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 bg-white transition-all"
                >
                  {provinsiList.map((p) => <option key={p}>{p}</option>)}
                </select>
              </div>

              {/* Info Geo Card — READ ONLY */}
              {geo && (
                <div className="bg-sky-50 rounded-2xl p-5 border-2 border-sky-200">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 bg-sky-200 rounded-lg flex items-center justify-center text-sm">📍</div>
                    <p className="text-sky-800 font-bold text-sm">Data Lokasi Lahan</p>
                    <span className="ml-auto text-[11px] bg-sky-200 text-sky-800 px-2.5 py-1 rounded-full font-semibold">Otomatis</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white rounded-xl p-3 border border-sky-100 text-center">
                      <p className="text-xs text-sky-600 font-medium mb-0.5">Latitude</p>
                      <p className="text-sm font-bold text-gray-800">{geo.lat}</p>
                    </div>
                    <div className="bg-white rounded-xl p-3 border border-sky-100 text-center">
                      <p className="text-xs text-sky-600 font-medium mb-0.5">Longitude</p>
                      <p className="text-sm font-bold text-gray-800">{geo.lon}</p>
                    </div>
                    <div className="bg-white rounded-xl p-3 border border-sky-100 text-center">
                      <p className="text-xs text-sky-600 font-medium mb-0.5">Elevasi</p>
                      <p className="text-sm font-bold text-gray-800">{geo.elev} m</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 bg-sky-100 rounded-xl p-3 mt-3">
                    <Info className="w-4 h-4 text-sky-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-sky-700 leading-relaxed">
                      Data lokasi ditentukan otomatis berdasarkan provinsi yang Anda pilih dan <strong>tidak bisa diubah manual</strong>.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══ STEP 2: Parameter Model ═══ */}
      {step === 2 && (
        <div className="bg-white rounded-2xl shadow-sm border-2 border-green-600 overflow-hidden">
          {/* Header */}
          <div className="bg-green-700 px-6 py-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-lg">Parameter Prediksi</p>
              <p className="text-green-200 text-sm">Isi data lahan Anda untuk mendapatkan prediksi</p>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Luas Lahan */}
            <div>
              <Label text="Luas Lahan (hektar)" required />
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Contoh: 1.5"
                  value={form.luasLahan}
                  onChange={(e) => upd("luasLahan", e.target.value)}
                  min="0.01" step="0.01"
                  className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-3.5 text-base text-gray-700 outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all"
                />
                <div className="bg-green-50 border-2 border-green-200 rounded-xl px-4 py-3.5 text-green-700 font-semibold text-base whitespace-nowrap">Ha</div>
              </div>
              <p className="text-xs text-gray-400 mt-1.5 ml-1">Luas lahan digunakan untuk menghitung total produksi, bukan sebagai fitur model</p>
            </div>

            {/* Kultivar / Varietas */}
            <div>
              <Label text="Varietas Padi (Kultivar)" required />
              <div className="space-y-2">
                {cultivarList.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => upd("cultivarName", c.value)}
                    className={`w-full flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                      form.cultivarName === c.value
                        ? "border-green-600 bg-green-50"
                        : "border-gray-200 bg-white hover:border-green-300"
                    }`}
                  >
                    <span className="text-2xl mt-0.5">🌾</span>
                    <div className="flex-1">
                      <p className={`text-base font-semibold ${form.cultivarName === c.value ? "text-green-800" : "text-gray-700"}`}>
                        {c.label}
                      </p>
                      <p className="text-sm text-gray-500 leading-relaxed mt-0.5">{c.desc}</p>
                    </div>
                    {form.cultivarName === c.value && <span className="ml-auto text-green-600 text-xl flex-shrink-0">✓</span>}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-2 ml-1">
                Fitur model: <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">cultivar_name</code>
              </p>
            </div>

            {/* Waktu Tanam (Sowing DOY) */}
            <div>
              <Label text="Waktu Rencana Tanam" required />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {sowingDoyList.map((s) => (
                  <button
                    key={s.doy}
                    type="button"
                    onClick={() => upd("sowingDoy", s.doy)}
                    className={`p-3.5 rounded-xl border-2 text-center transition-all ${
                      form.sowingDoy === s.doy
                        ? "border-green-600 bg-green-50"
                        : "border-gray-200 bg-white hover:border-green-300"
                    }`}
                  >
                    <p className={`text-sm font-bold ${form.sowingDoy === s.doy ? "text-green-800" : "text-gray-700"}`}>{s.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-2 ml-1">
                Fitur model: <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">sowing_doy</code>
              </p>
            </div>

            {/* Total Nitrogen */}
            <div>
              <Label text="Total Pupuk Nitrogen (kg/ha)" required />
              <div className="bg-gray-50 rounded-xl p-5 border-2 border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-500 text-sm">{nTotalRange.min} kg/ha</span>
                  <span className="text-green-800 font-bold text-2xl">{form.nTotalKgHa} <span className="text-base font-normal text-gray-500">kg/ha</span></span>
                  <span className="text-gray-500 text-sm">{nTotalRange.max} kg/ha</span>
                </div>
                <input
                  type="range"
                  min={nTotalRange.min}
                  max={nTotalRange.max}
                  step={nTotalRange.step}
                  value={form.nTotalKgHa}
                  onChange={(e) => upd("nTotalKgHa", parseInt(e.target.value))}
                  className="w-full h-3 rounded-lg appearance-none bg-green-200 accent-green-700 cursor-pointer"
                />
                <div className="flex justify-between mt-1 px-0.5">
                  {Array.from({ length: (nTotalRange.max - nTotalRange.min) / nTotalRange.step + 1 }, (_, i) => (
                    <span key={i} className="text-[10px] text-gray-400">{nTotalRange.min + i * nTotalRange.step}</span>
                  ))}
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2 ml-1">
                Fitur model: <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">n_total_kg_ha</code> — Total seluruh sumber nitrogen (Urea + NPK)
              </p>
            </div>

            {/* Populasi Tanaman */}
            <div>
              <Label text="Populasi Tanaman (per m²)" required />
              <div className="grid grid-cols-3 gap-2">
                {plantPopList.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => upd("plantPop", p.value)}
                    className={`p-3.5 rounded-xl border-2 text-center transition-all ${
                      form.plantPop === p.value
                        ? "border-green-600 bg-green-50"
                        : "border-gray-200 bg-white hover:border-green-300"
                    }`}
                  >
                    <p className={`text-base font-bold ${form.plantPop === p.value ? "text-green-800" : "text-gray-700"}`}>{p.value}</p>
                    <p className="text-xs text-gray-400 mt-0.5">per m²</p>
                  </button>
                ))}
              </div>
              {(() => {
                const sel = plantPopList.find((p) => p.value === form.plantPop);
                return sel ? (
                  <div className="flex items-start gap-2.5 bg-green-50 rounded-xl p-3.5 border border-green-200 mt-2">
                    <span className="text-lg flex-shrink-0">📏</span>
                    <div>
                      <p className="text-green-800 font-semibold text-sm">{sel.label}</p>
                      <p className="text-green-700 text-xs leading-relaxed mt-0.5">{sel.desc}</p>
                    </div>
                  </div>
                ) : null;
              })()}
              <p className="text-xs text-gray-400 mt-2 ml-1">
                Fitur model: <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">plant_pop</code>
              </p>
            </div>

            {/* Kode Irigasi / Water Code */}
            <div>
              <Label text="Sistem Pengairan" required />
              <div className="grid grid-cols-2 gap-3">
                {waterCodeList.map((w) => (
                  <button
                    key={w.value}
                    type="button"
                    onClick={() => upd("waterCode", w.value)}
                    className={`p-4 rounded-xl border-2 text-center transition-all ${
                      form.waterCode === w.value ? "border-green-600 bg-green-50" : "border-gray-200 bg-white hover:border-green-300"
                    }`}
                  >
                    <p className="text-2xl mb-1">{w.emoji}</p>
                    <p className={`text-base font-bold ${form.waterCode === w.value ? "text-green-800" : "text-gray-700"}`}>{w.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{w.desc}</p>
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-2 ml-1">
                Fitur model: <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">water_code</code> — A = Irigasi Otomatis, N = Tadah Hujan
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Navigasi ── */}
      <div className="flex gap-3">
        {step > 1 && (
          <button
            onClick={() => setStep(step - 1)}
            className="flex items-center gap-2 px-5 py-3.5 border-2 border-gray-200 rounded-xl text-base font-medium text-gray-600 hover:bg-gray-50 transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
            Kembali
          </button>
        )}

        {step < 2 && (
          <button
            onClick={() => setStep(step + 1)}
            disabled={!isStep1Valid}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 bg-green-700 hover:bg-green-600 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white rounded-xl text-base font-bold transition-all shadow-md"
          >
            Lanjutkan
            <ChevronRight className="w-5 h-5" />
          </button>
        )}

        {step === 2 && (
          <button
            onClick={handleSubmit}
            disabled={loading || !isStep2Valid}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 bg-green-700 hover:bg-green-600 disabled:bg-gray-200 disabled:cursor-not-allowed text-white rounded-xl text-base font-bold transition-all shadow-md shadow-green-200"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Menghitung Prediksi...
              </>
            ) : (
              <>
                📊 Lihat Hasil Prediksi
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        )}
      </div>

      {step === 2 && !isStep2Valid && (
        <p className="text-sm text-gray-400 text-center">
          * Isi semua field yang bertanda bintang merah untuk melanjutkan
        </p>
      )}
    </div>
  );
}