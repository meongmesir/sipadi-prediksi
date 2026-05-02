import { useState } from "react";
import {
  User, Mail, Bell, Shield, Database, Globe,
  Save, RotateCcw, CheckCircle2, Eye, EyeOff,
  Server, Wifi, Clock,
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
  const [showPass, setShowPass] = useState(false);
  const [saved, setSaved] = useState(false);

  // Notifikasi
  const [notifPengguna, setNotifPengguna] = useState(true);
  const [notifPrediksi, setNotifPrediksi] = useState(true);
  const [notifHarga, setNotifHarga] = useState(true);
  const [notifEmail, setNotifEmail] = useState(false);

  // Sistem
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [registrasiBuka, setRegistrasiBuka] = useState(true);
  const [autoBackup, setAutoBackup] = useState(true);
  const [logAktivitas, setLogAktivitas] = useState(true);

  // Harga
  const [autoUpdateHarga, setAutoUpdateHarga] = useState(false);
  const [intervalUpdate, setIntervalUpdate] = useState("7");

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
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
            className={`flex items-center gap-2 font-semibold px-5 py-2.5 rounded-xl text-sm transition-all shadow-sm ${
              saved
                ? "bg-green-100 text-green-700 border-2 border-green-300"
                : "bg-green-700 hover:bg-green-600 text-white"
            }`}
          >
            {saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saved ? "Tersimpan!" : "Simpan Perubahan"}
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

      {/* ── Notifikasi ── */}
      <SectionCard title="Notifikasi" icon={Bell}>
        <SettingRow label="Pengguna Baru Daftar" desc="Notifikasi saat ada akun baru yang menunggu verifikasi">
          <Toggle enabled={notifPengguna} onChange={setNotifPengguna} />
        </SettingRow>
        <SettingRow label="Prediksi Masuk" desc="Notifikasi saat ada prediksi panen baru dari petani">
          <Toggle enabled={notifPrediksi} onChange={setNotifPrediksi} />
        </SettingRow>
        <SettingRow label="Perubahan Harga Signifikan" desc="Notifikasi jika harga gabah berubah lebih dari 5%">
          <Toggle enabled={notifHarga} onChange={setNotifHarga} />
        </SettingRow>
        <SettingRow label="Kirim via Email" desc="Kirim notifikasi ke email admin (memerlukan konfigurasi SMTP)">
          <Toggle enabled={notifEmail} onChange={setNotifEmail} />
        </SettingRow>
      </SectionCard>

      {/* ── Sistem ── */}
      <SectionCard title="Pengaturan Sistem" icon={Server}>
        <SettingRow
          label="Mode Pemeliharaan"
          desc="Saat aktif, situs tidak dapat diakses pengguna. Hanya admin yang bisa login."
        >
          <Toggle enabled={maintenanceMode} onChange={setMaintenanceMode} />
        </SettingRow>
        <SettingRow label="Registrasi Pengguna Baru" desc="Izinkan petani membuat akun baru">
          <Toggle enabled={registrasiBuka} onChange={setRegistrasiBuka} />
        </SettingRow>
        <SettingRow label="Backup Otomatis" desc="Backup database harian secara otomatis pukul 00.00 WIB">
          <Toggle enabled={autoBackup} onChange={setAutoBackup} />
        </SettingRow>
        <SettingRow label="Log Aktivitas" desc="Catat semua aktivitas pengguna dan admin">
          <Toggle enabled={logAktivitas} onChange={setLogAktivitas} />
        </SettingRow>
      </SectionCard>

      {/* ── Harga Komoditas ── */}
      <SectionCard title="Update Harga Komoditas" icon={Globe}>
        <SettingRow
          label="Update Harga Otomatis"
          desc="Ambil data harga gabah terbaru dari API BPS secara otomatis"
        >
          <Toggle enabled={autoUpdateHarga} onChange={setAutoUpdateHarga} />
        </SettingRow>
        {autoUpdateHarga && (
          <SettingRow label="Interval Update" desc="Seberapa sering sistem mengambil data harga terbaru">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <select
                value={intervalUpdate}
                onChange={(e) => setIntervalUpdate(e.target.value)}
                className="border-2 border-gray-200 focus:border-green-500 rounded-xl px-3 py-2 text-sm text-gray-700 outline-none"
              >
                <option value="1">Setiap hari</option>
                <option value="3">Setiap 3 hari</option>
                <option value="7">Setiap minggu</option>
                <option value="30">Setiap bulan</option>
              </select>
            </div>
          </SettingRow>
        )}
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
            { icon: Server,   label: "Versi Aplikasi",    val: "SiPadiPrediksi v2.0.1" },
            { icon: Database, label: "Status Database",   val: "🟢 Online · 42 ms" },
            { icon: Wifi,     label: "Status API BMKG",   val: "🟢 Terhubung" },
            { icon: Clock,    label: "Server Time",        val: "Senin, 14 Apr 2026 · 14:23 WIB" },
            { icon: Database, label: "Backup Terakhir",    val: "14 Apr 2026 · 00:01 WIB" },
            { icon: Shield,   label: "Sesi Login Admin",  val: "Aktif sejak 13:45 WIB" },
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

      {/* ── Danger Zone ── */}
      <div className="bg-red-50 rounded-2xl border border-red-200 p-5">
        <h3 className="text-red-700 font-bold text-base mb-3 flex items-center gap-2">
          <Shield className="w-4 h-4" /> Zona Berbahaya
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-red-100">
            <div>
              <p className="text-red-700 text-sm font-semibold">Hapus Semua Data Prediksi</p>
              <p className="text-red-500 text-xs">Menghapus seluruh riwayat prediksi. Tidak dapat dikembalikan!</p>
            </div>
            <button className="bg-red-100 hover:bg-red-200 text-red-700 font-semibold px-4 py-2 rounded-xl text-sm transition-colors border border-red-300">
              Hapus Data
            </button>
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-red-700 text-sm font-semibold">Reset Semua Pengguna</p>
              <p className="text-red-500 text-xs">Nonaktifkan semua akun pengguna sekaligus</p>
            </div>
            <button className="bg-red-100 hover:bg-red-200 text-red-700 font-semibold px-4 py-2 rounded-xl text-sm transition-colors border border-red-300">
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}