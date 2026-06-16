import { useState, useEffect } from "react";
import { fetchWithAuth } from "../../../services/api";
import {
  User, Mail, Bell, Shield, Database, Globe,
  Save, RotateCcw, CheckCircle2, Eye, EyeOff,
  Server, Wifi, Clock, Loader2
} from "lucide-react";

// ─── Toggle Switch ─────────────────────────────────────────────────────────────

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${enabled ? "bg-green-700" : "bg-gray-200"}`}
    >
      <span
        className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${enabled ? "translate-x-5" : "translate-x-0.5"}`}
      />
    </button>
  );
}

// ─── Section Card ─────────────────────────────────────────────────────────────

function SectionCard({ title, icon: Icon, children }: {
  title: string; icon: typeof User; children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-gray-50">
        <div className="w-8 h-8 bg-green-700 rounded-xl flex items-center justify-center">
          <Icon className="w-4 h-4 text-white" />
        </div>
        <h3 className="text-gray-800 font-bold text-base">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

// ─── Row ──────────────────────────────────────────────────────────────────────

function SettingRow({ label, desc, children }: {
  label: string; desc?: string; children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-gray-50 last:border-0 gap-4">
      <div className="flex-1 min-w-0">
        <p className="text-gray-700 text-sm font-semibold">{label}</p>
        {desc && <p className="text-gray-400 text-xs mt-0.5 leading-relaxed">{desc}</p>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface Props {
  adminName: string;
  adminEmail: string;
}

export function AdminPengaturan({ adminName, adminEmail }: Props) {
  // Admin profile
  const [nama, setNama] = useState(adminName);
  const [email, setEmail] = useState(adminEmail);
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [saved, setSaved] = useState(false);

  // Sistem
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [registrasiBuka, setRegistrasiBuka] = useState(true);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [systemInfo, setSystemInfo] = useState<any>(null);

  useEffect(() => {
    Promise.all([
      fetchWithAuth('/admin/settings'),
      fetchWithAuth('/admin/system-info')
    ])
      .then(([resSettings, resInfo]) => {
        setMaintenanceMode(resSettings.maintenance_mode ?? false);
        setRegistrasiBuka(resSettings.registrasi_buka ?? true);
        setSystemInfo(resInfo);
      })
      .catch(err => console.error("Gagal load setting atau info", err))
      .finally(() => setIsLoading(false));
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await fetchWithAuth('/admin/settings', {
        method: 'PUT',
        body: JSON.stringify({
          maintenance_mode: maintenanceMode,
          registrasi_buka: registrasiBuka
        })
      });
      
      const pData: any = { nama_lengkap: nama, email };
      // Hanya kirim password jika diubah (jika input password ada nilainya, kita bisa tambah state password)
      // saat ini input password di ui belum disambung ke state, mari kita tambahkan state password
      
      await fetchWithAuth('/admin/profile', {
        method: 'PUT',
        body: JSON.stringify(pData)
      });
      
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Gagal menyimpan", err);
      alert("Gagal menyimpan pengaturan.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-gray-900 font-bold text-2xl">Pengaturan Sistem</h1>
          <p className="text-gray-500 text-sm">Kelola konfigurasi dan preferensi admin</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 border-2 border-gray-200 hover:border-gray-300 text-gray-600 font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors">
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading || isSaving}
            className={`flex items-center gap-2 font-semibold px-5 py-2.5 rounded-xl text-sm transition-all shadow-sm ${
              saved
                ? "bg-green-100 text-green-700 border-2 border-green-300"
                : "bg-green-700 hover:bg-green-600 text-white disabled:bg-gray-300"
            }`}
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {isSaving ? "Menyimpan..." : saved ? "Tersimpan!" : "Simpan Perubahan"}
          </button>
        </div>
      </div>

      {/* ── Profil Admin ── */}
      <SectionCard title="Profil Administrator" icon={User}>
        <div className="space-y-4">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-16 h-16 bg-green-700 rounded-2xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
              {adminName.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()}
            </div>
            <div>
              <p className="text-gray-800 font-bold text-base">{adminName}</p>
              <p className="text-gray-500 text-sm">{adminEmail}</p>
              <span className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full mt-1">
                <Shield className="w-3 h-3" /> Super Administrator
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nama Admin</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  className="w-full border-2 border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 rounded-xl pl-10 pr-4 py-3 text-sm outline-none transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Admin</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border-2 border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 rounded-xl pl-10 pr-4 py-3 text-sm outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password Baru <span className="text-gray-400 font-normal">(kosongkan jika tidak diubah)</span></label>
            <div className="relative max-w-sm">
              <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type={showPass ? "text" : "password"}
                placeholder="Min. 8 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border-2 border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 rounded-xl pl-10 pr-12 py-3 text-sm outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* ── Sistem ── */}
      <SectionCard title="Pengaturan Sistem" icon={Server}>
        <SettingRow
          label="Mode Pemeliharaan"
          desc="Saat aktif, situs tidak dapat diakses pengguna umum. Hanya admin yang bisa login."
        >
          <Toggle enabled={maintenanceMode} onChange={setMaintenanceMode} />
        </SettingRow>
        <SettingRow label="Registrasi Pengguna Baru" desc="Izinkan pengguna/petani membuat akun baru di halaman depan">
          <Toggle enabled={registrasiBuka} onChange={setRegistrasiBuka} />
        </SettingRow>
      </SectionCard>



      {/* ── Info Sistem ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-slate-700 rounded-xl flex items-center justify-center">
            <Database className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-gray-800 font-bold text-base">Informasi Sistem</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: Server,   label: "Versi Aplikasi",    val: systemInfo?.version || "-" },
            { icon: Database, label: "Status Database",   val: systemInfo?.db_status || "-" },
            { icon: Wifi,     label: "Status Model ML",   val: systemInfo?.ml_status || "-" },
            { icon: Clock,    label: "Waktu Server",      val: systemInfo?.server_time || "-" },
            { icon: Globe,    label: "Environment",       val: import.meta.env.MODE === "production" ? "🔵 Production" : "🟡 Development" },
            { icon: Shield,   label: "Sesi Login",        val: `Aktif sebagai ${adminName}` },
          ].map((info) => (
            <div key={info.label} className="bg-gray-50 rounded-xl p-3.5">
              <div className="flex items-center gap-2 mb-1">
                <info.icon className="w-3.5 h-3.5 text-gray-400" />
                <p className="text-gray-400 text-xs">{info.label}</p>
              </div>
              <p className="text-gray-700 text-sm font-semibold">{info.val}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}