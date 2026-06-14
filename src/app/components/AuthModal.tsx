import { useState, useEffect, useRef, useCallback } from "react";
import {
  X, Eye, EyeOff, CheckCircle2, Loader2,
  User, Lock, Phone, MapPin, Mail, Leaf,
} from "lucide-react";
import type { UserType } from "../App";

// ─── Helpers ──────────────────────────────────────────────────────────────────

import { provinsiList } from "../../utils/constants";


const validateEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
const validateHP = (v: string) =>
  /^(\+62|62|0)[0-9]{8,13}$/.test(v.replace(/[\s-]/g, ""));

function getPasswordStrength(pass: string): { level: number; label: string; color: string } {
  if (!pass) return { level: 0, label: "", color: "" };
  let score = 0;
  if (pass.length >= 8) score++;
  if (pass.length >= 12) score++;
  if (/[A-Z]/.test(pass)) score++;
  if (/[0-9]/.test(pass)) score++;
  if (/[^A-Za-z0-9]/.test(pass)) score++;
  if (score <= 1) return { level: 1, label: "Lemah", color: "bg-red-400" };
  if (score <= 2) return { level: 2, label: "Sedang", color: "bg-amber-400" };
  if (score <= 3) return { level: 3, label: "Kuat", color: "bg-green-500" };
  return { level: 4, label: "Sangat Kuat", color: "bg-green-700" };
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface RegForm {
  namaLengkap: string;
  email: string;
  noHP: string;
  provinsi: string;
  password: string;
  konfirmasiPassword: string;
  setuju: boolean;
}

interface LoginForm {
  emailOrHP: string;
  password: string;
  ingat: boolean;
}

type RegErrors = Partial<Record<keyof RegForm, string>>;
type LoginErrors = { emailOrHP?: string; password?: string };

interface Props {
  mode: "login" | "register";
  onClose: () => void;
  onLogin: (user: UserType) => void;
  onSwitchMode: (mode: "login" | "register") => void;
  isGateMode?: boolean; // true = tampil inline di AuthGate, tanpa wrapper & backdrop
}

// ─── Component ────────────────────────────────────────────────────────────────

// Shared sub-components HARUS di luar AuthModal — kalau di dalam, tiap render
// membuat tipe baru → React unmount+remount → fokus input hilang setiap ketik.

function inputClass(hasError: boolean) {
  return `w-full border-2 rounded-xl pl-11 pr-4 py-3.5 text-base text-gray-800 outline-none transition-all bg-white ${
    hasError
      ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100"
      : "border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100"
  }`;
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p className="flex items-center gap-1.5 text-red-500 text-sm mt-1.5" role="alert">
      <span aria-hidden>⚠</span> {msg}
    </p>
  );
}

function InputWrapper({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="relative">
      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
        {icon}
      </div>
      {children}
    </div>
  );
}

// ─── AuthModal ────────────────────────────────────────────────────────────────

const INIT_REG: RegForm = {
  namaLengkap: "", email: "", noHP: "", provinsi: "Jawa Tengah",
  password: "", konfirmasiPassword: "", setuju: false,
};
const INIT_LOGIN: LoginForm = { emailOrHP: "", password: "", ingat: false };

export function AuthModal({ mode, onClose, onLogin, onSwitchMode, isGateMode = false }: Props) {
  // Form state
  const [reg, setReg] = useState<RegForm>(INIT_REG);
  const [login, setLogin] = useState<LoginForm>(INIT_LOGIN);

  // Error state
  const [regErr, setRegErr] = useState<RegErrors>({});
  const [loginErr, setLoginErr] = useState<LoginErrors>({});

  // UI state
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showRegPass, setShowRegPass] = useState(false);
  const [showRegConf, setShowRegConf] = useState(false);
  const [showLoginPass, setShowLoginPass] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const strength = getPasswordStrength(reg.password);

  // Reset when switching mode
  useEffect(() => {
    setLoading(false);
    setSuccess(false);
    setRegErr({});
    setLoginErr({});
  }, [mode]);

  // Lock body scroll (hanya aktif saat modal floating, bukan gate mode)
  useEffect(() => {
    if (isGateMode) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [isGateMode]);

  // ESC to close (hanya aktif saat modal floating)
  const handleEsc = useCallback((e: KeyboardEvent) => {
    if (isGateMode) return;
    if (e.key === "Escape") onClose();
  }, [onClose, isGateMode]);
  useEffect(() => {
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [handleEsc]);

  // Click outside modal to close (dinonaktifkan di gate mode)
  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isGateMode) return;
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  // Updaters
  const updReg = <K extends keyof RegForm>(k: K, v: RegForm[K]) =>
    setReg((p) => ({ ...p, [k]: v }));
  const updLogin = <K extends keyof LoginForm>(k: K, v: LoginForm[K]) =>
    setLogin((p) => ({ ...p, [k]: v }));

  // ── Validations ──

  const validateReg = (): RegErrors => {
    const e: RegErrors = {};
    if (!reg.namaLengkap.trim()) {
      e.namaLengkap = "Nama lengkap wajib diisi";
    } else if (reg.namaLengkap.trim().length < 3) {
      e.namaLengkap = "Nama minimal 3 karakter";
    }
    if (!reg.email.trim()) {
      e.email = "Email wajib diisi";
    } else if (!validateEmail(reg.email)) {
      e.email = "Format email tidak valid";
    }
    if (reg.noHP && !validateHP(reg.noHP)) {
      e.noHP = "Format tidak valid (contoh: 08123456789)";
    }
    if (!reg.password) {
      e.password = "Password wajib diisi";
    } else if (reg.password.length < 8) {
      e.password = "Password minimal 8 karakter";
    } else if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(reg.password)) {
      e.password = "Password harus mengandung huruf dan angka";
    }
    if (!reg.konfirmasiPassword) {
      e.konfirmasiPassword = "Konfirmasi password wajib diisi";
    } else if (reg.konfirmasiPassword !== reg.password) {
      e.konfirmasiPassword = "Password tidak cocok";
    }
    if (!reg.setuju) {
      e.setuju = "Anda harus menyetujui syarat & ketentuan";
    }
    return e;
  };

  const validateLogin = (): LoginErrors => {
    const e: LoginErrors = {};
    if (!login.emailOrHP.trim()) {
      e.emailOrHP = "Email atau nomor HP wajib diisi";
    }
    if (!login.password) {
      e.password = "Password wajib diisi";
    }
    return e;
  };

  // ── Submits ──

  const handleRegister = async () => {
    const errs = validateReg();
    setRegErr(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      const payload = {
        nama_lengkap: reg.namaLengkap.trim(),
        email: reg.email.trim().toLowerCase(),
        no_hp: reg.noHP.trim() || undefined,
        provinsi: reg.provinsi,
        password: reg.password
      };
      
      const API_URL = "/api";
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Registrasi gagal");
      }
      
      const data = await res.json();
      const mappedUser = {
        namaLengkap: data.user.nama_lengkap,
        email: data.user.email,
        provinsi: data.user.provinsi,
        role: data.user.role
      };
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("user_data", JSON.stringify(mappedUser));
      
      setSuccess(true);
      setTimeout(() => {
        onLogin(mappedUser);
      }, 2200);
    } catch (error: any) {
      setRegErr({ email: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    const errs = validateLogin();
    setLoginErr(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      const payload = {
        email: login.emailOrHP.trim().toLowerCase(),
        password: login.password
      };
      
      const API_URL = "/api";
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Login gagal");
      }
      
      const data = await res.json();
      const mappedUser = {
        namaLengkap: data.user.nama_lengkap,
        email: data.user.email,
        provinsi: data.user.provinsi,
        role: data.user.role
      };
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("user_data", JSON.stringify(mappedUser));
      
      onLogin(mappedUser);
    } catch (error: any) {
      setLoginErr({ emailOrHP: error.message });
    } finally {
      setLoading(false);
    }
  };

  // ── Render ──

  // Gate mode: render hanya konten form (tanpa backdrop & wrapper modal)
  if (isGateMode) {
    return (
      <div ref={modalRef} className="max-h-[70vh] overflow-y-auto">
        {/* ── Header Blok B — disembunyikan di gate mode (tab sudah di AuthGate) ── */}

        {/* SUCCESS STATE */}
        {success && mode === "register" && (
          <div className="px-6 pb-8 pt-6 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-gray-800 font-bold text-xl mb-2">Pendaftaran Berhasil!</h2>
            <p className="text-green-700 font-semibold text-base mb-1">{reg.namaLengkap.trim()}</p>
            <p className="text-gray-500 text-sm mb-4">
              Selamat datang di SiPadiPrediksi! Akun Anda sudah aktif.
            </p>
            <div className="flex items-center justify-center gap-2 text-gray-400 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              Sedang masuk ke akun Anda...
            </div>
          </div>
        )}

        {/* LOGIN FORM */}
        {!success && mode === "login" && (
          <div className="px-6 py-5 space-y-4">
            <div>
              <h2 className="text-gray-800 font-bold text-lg mb-0.5">Selamat Datang Kembali</h2>
              <p className="text-gray-500 text-sm">Masuk untuk mengakses semua fitur</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5" htmlFor="gate-login-emailOrHP">
                Email atau Nomor HP <span className="text-red-500">*</span>
              </label>
              <InputWrapper icon={<Mail className="w-5 h-5" />}>
                <input
                  id="gate-login-emailOrHP"
                  type="text"
                  autoComplete="username"
                  placeholder="email@contoh.com atau 08xxxxxxxx"
                  value={login.emailOrHP}
                  onChange={(e) => updLogin("emailOrHP", e.target.value)}
                  className={inputClass(!!loginErr.emailOrHP)}
                  disabled={loading}
                />
              </InputWrapper>
              <FieldError msg={loginErr.emailOrHP} />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-semibold text-gray-700" htmlFor="gate-login-pass">
                  Password <span className="text-red-500">*</span>
                </label>
                <button type="button" className="text-green-700 text-xs font-medium hover:underline">Lupa password?</button>
              </div>
              <InputWrapper icon={<Lock className="w-5 h-5" />}>
                <input
                  id="gate-login-pass"
                  type={showLoginPass ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Masukkan password"
                  value={login.password}
                  onChange={(e) => updLogin("password", e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !loading) handleLogin(); }}
                  className={`${inputClass(!!loginErr.password)} pr-11`}
                  disabled={loading}
                />
                <button type="button" onClick={() => setShowLoginPass(!showLoginPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showLoginPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </InputWrapper>
              <FieldError msg={loginErr.password} />
            </div>
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-green-700 hover:bg-green-600 disabled:bg-gray-200 disabled:cursor-not-allowed text-white disabled:text-gray-400 font-bold py-4 rounded-2xl text-base transition-all shadow-md shadow-green-200"
            >
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Memverifikasi...</> : "Masuk ke Akun"}
            </button>
          </div>
        )}

        {/* REGISTER FORM */}
        {!success && mode === "register" && (
          <div className="px-6 py-5 space-y-4">
            <div>
              <h2 className="text-gray-800 font-bold text-lg mb-0.5">Buat Akun Baru — Gratis</h2>
              <p className="text-gray-500 text-sm">Isi data di bawah untuk mulai menggunakan SiPadiPrediksi</p>
            </div>
            {/* Nama */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5" htmlFor="gate-reg-nama">
                Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <InputWrapper icon={<User className="w-5 h-5" />}>
                <input id="gate-reg-nama" type="text" autoComplete="name"
                  placeholder="Nama sesuai KTP / nama panggilan"
                  value={reg.namaLengkap} onChange={(e) => updReg("namaLengkap", e.target.value)}
                  className={inputClass(!!regErr.namaLengkap)} disabled={loading} />
              </InputWrapper>
              <FieldError msg={regErr.namaLengkap} />
            </div>
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5" htmlFor="gate-reg-email">
                Email <span className="text-red-500">*</span>
              </label>
              <InputWrapper icon={<Mail className="w-5 h-5" />}>
                <input id="gate-reg-email" type="email" autoComplete="email"
                  placeholder="email@contoh.com"
                  value={reg.email} onChange={(e) => updReg("email", e.target.value)}
                  className={inputClass(!!regErr.email)} disabled={loading} />
              </InputWrapper>
              <FieldError msg={regErr.email} />
            </div>
            {/* No HP */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5" htmlFor="gate-reg-hp">
                Nomor HP <span className="text-gray-400 font-normal">(opsional)</span>
              </label>
              <InputWrapper icon={<Phone className="w-5 h-5" />}>
                <input id="gate-reg-hp" type="tel" autoComplete="tel"
                  placeholder="08123456789"
                  value={reg.noHP} onChange={(e) => updReg("noHP", e.target.value)}
                  className={inputClass(!!regErr.noHP)} disabled={loading} />
              </InputWrapper>
              <FieldError msg={regErr.noHP} />
            </div>
            {/* Provinsi */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5" htmlFor="gate-reg-prov">
                Provinsi Tempat Bertani <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  <MapPin className="w-5 h-5" />
                </div>
                <select id="gate-reg-prov" value={reg.provinsi}
                  onChange={(e) => updReg("provinsi", e.target.value)}
                  className={`${inputClass(!!regErr.provinsi)} appearance-none`} disabled={loading}>
                  {provinsiList.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <FieldError msg={regErr.provinsi} />
            </div>
            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5" htmlFor="gate-reg-pass">
                Password <span className="text-red-500">*</span>
              </label>
              <InputWrapper icon={<Lock className="w-5 h-5" />}>
                <input id="gate-reg-pass" type={showRegPass ? "text" : "password"} autoComplete="new-password"
                  placeholder="Min. 8 karakter, huruf dan angka"
                  value={reg.password} onChange={(e) => updReg("password", e.target.value)}
                  className={`${inputClass(!!regErr.password)} pr-11`} disabled={loading} />
                <button type="button" onClick={() => setShowRegPass(!showRegPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showRegPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </InputWrapper>
              {reg.password && (
                <div className="mt-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((lvl) => (
                      <div key={lvl} className={`h-1.5 flex-1 rounded-full transition-all ${strength.level >= lvl ? strength.color : "bg-gray-200"}`} />
                    ))}
                  </div>
                  <p className={`text-xs mt-1 font-medium ${strength.level <= 1 ? "text-red-500" : strength.level === 2 ? "text-amber-500" : "text-green-600"}`}>
                    Kekuatan password: {strength.label}
                  </p>
                </div>
              )}
              <FieldError msg={regErr.password} />
            </div>
            {/* Konfirmasi */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5" htmlFor="gate-reg-conf">
                Konfirmasi Password <span className="text-red-500">*</span>
              </label>
              <InputWrapper icon={<Lock className="w-5 h-5" />}>
                <input id="gate-reg-conf" type={showRegConf ? "text" : "password"} autoComplete="new-password"
                  placeholder="Ulangi password di atas"
                  value={reg.konfirmasiPassword} onChange={(e) => updReg("konfirmasiPassword", e.target.value)}
                  className={`${inputClass(!!regErr.konfirmasiPassword)} pr-11`} disabled={loading} />
                <button type="button" onClick={() => setShowRegConf(!showRegConf)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showRegConf ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </InputWrapper>
              {reg.konfirmasiPassword && reg.konfirmasiPassword === reg.password && !regErr.konfirmasiPassword && (
                <p className="flex items-center gap-1.5 text-green-600 text-sm mt-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Password cocok
                </p>
              )}
              <FieldError msg={regErr.konfirmasiPassword} />
            </div>
            {/* Setuju */}
            <div>
              <label className={`flex items-start gap-3 cursor-pointer select-none rounded-xl p-3 border-2 transition-colors ${regErr.setuju ? "border-red-300 bg-red-50" : "border-gray-200 hover:border-green-300"}`}>
                <input type="checkbox" checked={reg.setuju} onChange={(e) => updReg("setuju", e.target.checked)}
                  className="w-4 h-4 accent-green-700 mt-0.5 flex-shrink-0" disabled={loading} />
                <span className="text-sm text-gray-600 leading-relaxed">
                  Saya menyetujui{" "}
                  <button type="button" className="text-green-700 font-semibold hover:underline">Syarat & Ketentuan</button>
                  {" "}dan{" "}
                  <button type="button" className="text-green-700 font-semibold hover:underline">Kebijakan Privasi</button>
                  {" "}SiPadiPrediksi
                </span>
              </label>
              <FieldError msg={regErr.setuju} />
            </div>
            {/* Submit */}
            <button
              onClick={handleRegister}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-green-700 hover:bg-green-600 disabled:bg-gray-200 disabled:cursor-not-allowed text-white disabled:text-gray-400 font-bold py-4 rounded-2xl text-base transition-all shadow-md shadow-green-200"
            >
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Mendaftarkan Akun...</> : "🌾 Daftar Sekarang — Gratis"}
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleBackdrop}
      role="dialog"
      aria-modal="true"
      aria-label={mode === "login" ? "Form Masuk" : "Form Pendaftaran"}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-3xl w-full max-w-md shadow-2xl max-h-[92vh] overflow-y-auto"
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-700 rounded-xl flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-gray-900 font-bold text-lg leading-tight">SiPadiPrediksi</p>
              <p className="text-gray-400 text-xs">Prediksi Panen Padi Nasional</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Tabs ── */}
        <div className="flex mx-6 mb-5 bg-gray-100 rounded-2xl p-1">
          {(["login", "register"] as const).map((t) => (
            <button
              key={t}
              onClick={() => onSwitchMode(t)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                mode === t
                  ? "bg-white text-green-800 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t === "login" ? "Masuk" : "Daftar Akun"}
            </button>
          ))}
        </div>

        {/* ═════════════════════════════════════ */}
        {/* SUCCESS STATE (register) */}
        {/* ══════════════════════════════════════ */}
        {success && mode === "register" && (
          <div className="px-6 pb-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-gray-800 font-bold text-xl mb-2">Pendaftaran Berhasil!</h2>
            <p className="text-green-700 font-semibold text-base mb-1">{reg.namaLengkap.trim()}</p>
            <p className="text-gray-500 text-sm mb-4">
              Selamat datang di SiPadiPrediksi! Akun Anda sudah aktif.
            </p>
            <div className="flex items-center justify-center gap-2 text-gray-400 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              Sedang masuk ke akun Anda...
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════ */}
        {/* LOGIN FORM */}
        {/* ══════════════════════════════════════ */}
        {!success && mode === "login" && (
          <div className="px-6 pb-6 space-y-4">
            <div>
              <h2 className="text-gray-800 font-bold text-lg mb-0.5">Selamat Datang Kembali</h2>
              <p className="text-gray-500 text-sm">Masuk untuk mengakses riwayat dan fitur lengkap</p>
            </div>

            {/* Email / HP */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5" htmlFor="login-emailOrHP">
                Email atau Nomor HP <span className="text-red-500">*</span>
              </label>
              <InputWrapper icon={<Mail className="w-5 h-5" />}>
                <input
                  id="login-emailOrHP"
                  type="text"
                  autoComplete="username"
                  placeholder="email@contoh.com atau 08xxxxxxxx"
                  value={login.emailOrHP}
                  onChange={(e) => updLogin("emailOrHP", e.target.value)}
                  className={inputClass(!!loginErr.emailOrHP)}
                  disabled={loading}
                />
              </InputWrapper>
              <FieldError msg={loginErr.emailOrHP} />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-semibold text-gray-700" htmlFor="login-pass">
                  Password <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  className="text-green-700 text-xs font-medium hover:underline"
                  tabIndex={0}
                >
                  Lupa password?
                </button>
              </div>
              <InputWrapper icon={<Lock className="w-5 h-5" />}>
                <input
                  id="login-pass"
                  type={showLoginPass ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Masukkan password"
                  value={login.password}
                  onChange={(e) => updLogin("password", e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !loading) handleLogin(); }}
                  className={`${inputClass(!!loginErr.password)} pr-11`}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPass(!showLoginPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showLoginPass ? "Sembunyikan password" : "Tampilkan password"}
                >
                  {showLoginPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </InputWrapper>
              <FieldError msg={loginErr.password} />
            </div>

            {/* Remember me */}
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={login.ingat}
                onChange={(e) => updLogin("ingat", e.target.checked)}
                className="w-4 h-4 accent-green-700 rounded"
                disabled={loading}
              />
              <span className="text-sm text-gray-600">Ingat saya di perangkat ini</span>
            </label>

            {/* Submit */}
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-green-700 hover:bg-green-600 disabled:bg-gray-200 disabled:cursor-not-allowed text-white disabled:text-gray-400 font-bold py-4 rounded-2xl text-base transition-all shadow-md shadow-green-200"
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Memverifikasi...</>
              ) : (
                "Masuk ke Akun"
              )}
            </button>

            <p className="text-center text-sm text-gray-500">
              Belum punya akun?{" "}
              <button
                type="button"
                onClick={() => onSwitchMode("register")}
                className="text-green-700 font-bold hover:underline"
              >
                Daftar Sekarang — Gratis
              </button>
            </p>
          </div>
        )}

        {/* ══════════════════════════════════════ */}
        {/* REGISTER FORM */}
        {/* ══════════════════════════════════════ */}
        {!success && mode === "register" && (
          <div className="px-6 pb-6 space-y-4">
            <div>
              <h2 className="text-gray-800 font-bold text-lg mb-0.5">Buat Akun Baru</h2>
              <p className="text-gray-500 text-sm">
                Gratis selamanya · Simpan riwayat prediksi Anda
              </p>
            </div>

            {/* Nama Lengkap */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5" htmlFor="reg-nama">
                Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <InputWrapper icon={<User className="w-5 h-5" />}>
                <input
                  id="reg-nama"
                  type="text"
                  autoComplete="name"
                  placeholder="Nama sesuai KTP / nama panggilan"
                  value={reg.namaLengkap}
                  onChange={(e) => updReg("namaLengkap", e.target.value)}
                  className={inputClass(!!regErr.namaLengkap)}
                  disabled={loading}
                />
              </InputWrapper>
              <FieldError msg={regErr.namaLengkap} />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5" htmlFor="reg-email">
                Email <span className="text-red-500">*</span>
              </label>
              <InputWrapper icon={<Mail className="w-5 h-5" />}>
                <input
                  id="reg-email"
                  type="email"
                  autoComplete="email"
                  placeholder="email@contoh.com"
                  value={reg.email}
                  onChange={(e) => updReg("email", e.target.value)}
                  className={inputClass(!!regErr.email)}
                  disabled={loading}
                />
              </InputWrapper>
              <FieldError msg={regErr.email} />
            </div>

            {/* Nomor HP */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5" htmlFor="reg-hp">
                Nomor HP{" "}
                <span className="text-gray-400 font-normal">(opsional)</span>
              </label>
              <InputWrapper icon={<Phone className="w-5 h-5" />}>
                <input
                  id="reg-hp"
                  type="tel"
                  autoComplete="tel"
                  placeholder="08123456789"
                  value={reg.noHP}
                  onChange={(e) => updReg("noHP", e.target.value)}
                  className={inputClass(!!regErr.noHP)}
                  disabled={loading}
                />
              </InputWrapper>
              <FieldError msg={regErr.noHP} />
            </div>

            {/* Provinsi */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5" htmlFor="reg-prov">
                Provinsi Tempat Bertani <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  <MapPin className="w-5 h-5" />
                </div>
                <select
                  id="reg-prov"
                  value={reg.provinsi}
                  onChange={(e) => updReg("provinsi", e.target.value)}
                  className={`${inputClass(!!regErr.provinsi)} appearance-none`}
                  disabled={loading}
                >
                  {provinsiList.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <FieldError msg={regErr.provinsi} />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5" htmlFor="reg-pass">
                Password <span className="text-red-500">*</span>
              </label>
              <InputWrapper icon={<Lock className="w-5 h-5" />}>
                <input
                  id="reg-pass"
                  type={showRegPass ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Min. 8 karakter, huruf dan angka"
                  value={reg.password}
                  onChange={(e) => updReg("password", e.target.value)}
                  className={`${inputClass(!!regErr.password)} pr-11`}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowRegPass(!showRegPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showRegPass ? "Sembunyikan" : "Tampilkan"}
                >
                  {showRegPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </InputWrapper>
              {/* Strength bar */}
              {reg.password && (
                <div className="mt-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((lvl) => (
                      <div
                        key={lvl}
                        className={`h-1.5 flex-1 rounded-full transition-all ${
                          strength.level >= lvl ? strength.color : "bg-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`text-xs mt-1 font-medium ${
                    strength.level <= 1 ? "text-red-500" :
                    strength.level === 2 ? "text-amber-500" : "text-green-600"
                  }`}>
                    Kekuatan password: {strength.label}
                  </p>
                </div>
              )}
              <FieldError msg={regErr.password} />
            </div>

            {/* Konfirmasi Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5" htmlFor="reg-conf">
                Konfirmasi Password <span className="text-red-500">*</span>
              </label>
              <InputWrapper icon={<Lock className="w-5 h-5" />}>
                <input
                  id="reg-conf"
                  type={showRegConf ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Ulangi password di atas"
                  value={reg.konfirmasiPassword}
                  onChange={(e) => updReg("konfirmasiPassword", e.target.value)}
                  className={`${inputClass(!!regErr.konfirmasiPassword)} pr-11`}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowRegConf(!showRegConf)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showRegConf ? "Sembunyikan" : "Tampilkan"}
                >
                  {showRegConf ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </InputWrapper>
              {reg.konfirmasiPassword && reg.konfirmasiPassword === reg.password && !regErr.konfirmasiPassword && (
                <p className="flex items-center gap-1.5 text-green-600 text-sm mt-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Password cocok
                </p>
              )}
              <FieldError msg={regErr.konfirmasiPassword} />
            </div>

            {/* Syarat & Ketentuan */}
            <div>
              <label className={`flex items-start gap-3 cursor-pointer select-none rounded-xl p-3 border-2 transition-colors ${
                regErr.setuju ? "border-red-300 bg-red-50" : "border-gray-200 hover:border-green-300"
              }`}>
                <input
                  type="checkbox"
                  checked={reg.setuju}
                  onChange={(e) => updReg("setuju", e.target.checked)}
                  className="w-4 h-4 accent-green-700 mt-0.5 flex-shrink-0"
                  disabled={loading}
                />
                <span className="text-sm text-gray-600 leading-relaxed">
                  Saya menyetujui{" "}
                  <button type="button" className="text-green-700 font-semibold hover:underline">
                    Syarat & Ketentuan
                  </button>{" "}
                  dan{" "}
                  <button type="button" className="text-green-700 font-semibold hover:underline">
                    Kebijakan Privasi
                  </button>{" "}
                  SiPadiPrediksi
                </span>
              </label>
              <FieldError msg={regErr.setuju} />
            </div>

            {/* Submit */}
            <button
              onClick={handleRegister}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-green-700 hover:bg-green-600 disabled:bg-gray-200 disabled:cursor-not-allowed text-white disabled:text-gray-400 font-bold py-4 rounded-2xl text-base transition-all shadow-md shadow-green-200"
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Mendaftarkan Akun...</>
              ) : (
                " Daftar Sekarang — Gratis"
              )}
            </button>

            <p className="text-center text-sm text-gray-500">
              Sudah punya akun?{" "}
              <button
                type="button"
                onClick={() => onSwitchMode("login")}
                className="text-green-700 font-bold hover:underline"
              >
                Masuk di sini
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}