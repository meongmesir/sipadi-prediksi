import { useState, useRef, useEffect } from "react";
import {
  Leaf, Home, History, PlusCircle, Menu, X, LogOut, ChevronDown, Lock,
} from "lucide-react";
import { HalamanUtama } from "./components/HalamanUtama";
import { FormPrediksi } from "./components/FormPrediksi";
import { HasilPrediksi } from "./components/HasilPrediksi";
import { RiwayatPrediksi } from "./components/RiwayatPrediksi";
import { AuthModal } from "./components/AuthModal";
import { AdminApp } from "./components/admin/AdminApp";

import type { HasilType, UserType } from "../types";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getInisial(nama: string): string {
  const parts = nama.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return nama.substring(0, 2).toUpperCase();
}

// ─── App ──────────────────────────────────────────────────────────────────────

type Page = "beranda" | "form" | "hasil" | "riwayat";
type AuthMode = "login" | "register";

export default function App() {
  // Page state
  const [page, setPage] = useState<Page>("beranda");
  const [hasilAktif, setHasilAktif] = useState<HasilType | null>(null);
  const [riwayat, setRiwayat] = useState<HasilType[]>([]);

  // UI state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Auth state
  const [user, setUser] = useState<UserType | null>(() => {
    try {
      const stored = localStorage.getItem("user_data");
      if (!stored) return null;
      const parsed = JSON.parse(stored);
      // Fix corrupted data from previous versions (snake_case to camelCase)
      if (parsed && !parsed.namaLengkap && parsed.nama_lengkap) {
        parsed.namaLengkap = parsed.nama_lengkap;
      }
      return parsed.namaLengkap ? parsed : null;
    } catch {
      return null;
    }
  });
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("register");
  const [gateMode, setGateMode] = useState<"login" | "register">("register");
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user dropdown on click outside
  useEffect(() => {
    if (!userMenuOpen) return;
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [userMenuOpen]);

  // Close mobile menu on ESC
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [mobileMenuOpen]);

  // ── Auth helpers ──
  const openAuth = (mode: AuthMode) => {
    setAuthMode(mode);
    setShowAuth(true);
    setMobileMenuOpen(false);
  };

  const handleLoginSuccess = (u: UserType) => {
    setUser(u);
    setShowAuth(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("user_data");
    localStorage.removeItem("access_token");
    setUser(null);
    setUserMenuOpen(false);
    setPage("beranda");
    setHasilAktif(null);
  };

  // ── Prediction helpers ──
  const handleHasil = (hasil: HasilType) => {
    setHasilAktif(hasil);
    setRiwayat((prev) => [hasil, ...prev]);
    setPage("hasil");
  };

  const handleLihatRiwayat = (h: HasilType) => {
    setHasilAktif(h);
    setPage("hasil");
  };

  const handleHapusRiwayat = (index: number) => {
    setRiwayat((prev) => prev.filter((_, i) => i !== index));
  };

  const navigateTo = (p: Page) => {
    setPage(p);
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  };

  // ── Nav items ──
  const navItems: { page: Page; label: string; icon: typeof Home }[] = [
    { page: "beranda", label: "Beranda", icon: Home },
    { page: "form",    label: "Prediksi Baru", icon: PlusCircle },
    { page: "riwayat", label: "Riwayat", icon: History },
  ];

  const inisial = user ? getInisial(user.namaLengkap) : "";

  // ─── Auth Gate (full-screen, shown when not logged in) ────────────────────────

  function AuthGate({
    onLogin,
    onSwitchMode,
    mode,
    onModeChange,
  }: {
    onLogin: (user: UserType) => void;
    onSwitchMode: (mode: "login" | "register") => void;
    mode: "login" | "register";
    onModeChange: (m: "login" | "register") => void;
  }) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-teal-700 flex flex-col">
        {/* Top bar */}
        <div className="flex items-center gap-3 px-6 py-5">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-lg leading-tight">SiPadiPrediksi</p>
            <p className="text-green-300 text-xs">Prediksi Panen Padi Nasional</p>
          </div>
        </div>

        <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-10 px-6 py-8 max-w-5xl mx-auto w-full">
          {/* Left: Info */}
          <div className="flex-1 text-center md:text-left max-w-md">
            <div className="text-6xl mb-4">🌾</div>
            <h1 className="text-white text-3xl md:text-4xl font-bold leading-tight mb-4">
              Prediksi Panen Padi<br />
              <span className="text-amber-300">Lebih Akurat,</span><br />
              Lebih Menguntungkan
            </h1>
            <p className="text-green-200 text-base leading-relaxed mb-6">
              Platform prediksi hasil panen dan harga gabah khusus petani padi Indonesia.
              Daftar akun gratis untuk mulai menggunakan semua fitur.
            </p>

            {/* Fitur highlight */}
            <div className="space-y-3">
              {[
                { emoji: "📊", text: "Prediksi hasil panen berdasarkan data lahan Anda" },
                { emoji: "🔬", text: "Berbasis data simulasi pertanian yang teruji" },
                { emoji: "🗺️", text: "Mencakup 38 provinsi di seluruh Indonesia" },
                { emoji: "📁", text: "Simpan & akses riwayat prediksi kapan saja" },
              ].map((f) => (
                <div key={f.text} className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3 border border-white/10">
                  <span className="text-xl flex-shrink-0">{f.emoji}</span>
                  <p className="text-white text-sm leading-snug">{f.text}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center gap-2 text-green-300 text-sm">
              <Lock className="w-4 h-4 flex-shrink-0" />
              <p>Akun diperlukan untuk menjaga keamanan dan kelengkapan data prediksi Anda</p>
            </div>
          </div>

          {/* Right: Auth form inline */}
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
            {/* Tabs */}
            <div className="flex bg-gray-50 border-b border-gray-100">
              {(["register", "login"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => onModeChange(t)}
                  className={`flex-1 py-4 text-sm font-bold transition-all border-b-2 ${
                    mode === t
                      ? "border-green-700 text-green-800 bg-white"
                      : "border-transparent text-gray-400 hover:text-gray-600"
                  }`}
                >
                  {t === "register" ? "🌾 Daftar Akun — Gratis" : "Sudah Punya Akun? Masuk"}
                </button>
              ))}
            </div>

            {/* Render the auth form content without the outer modal wrapper */}
            <AuthModal
              mode={mode}
              onClose={() => {}} // no-op: tidak bisa ditutup di gate
              onLogin={onLogin}
              onSwitchMode={onSwitchMode}
              isGateMode
            />
          </div>
        </div>

        <div className="text-center text-green-500 text-xs pb-6">
          © 2026 SiPadiPrediksi · Dikembangkan oleh Tim RSI
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════
  // GATE: Jika belum login, tampilkan halaman auth penuh
  // ══════════════════════════════════════════════════════
  if (!user) {
    return (
      <AuthGate
        mode={gateMode}
        onModeChange={setGateMode}
        onLogin={handleLoginSuccess}
        onSwitchMode={setGateMode}
      />
    );
  }

  // ══════════════════════════════════════════════════════
  // ADMIN / SUPERADMIN: Jika role admin atau superadmin, render AdminApp
  // ══════════════════════════════════════════════════════
  if (user.role === "admin" || user.role === "superadmin") {
    return <AdminApp user={user} onLogout={handleLogout} role={user.role as "admin" | "superadmin"} />;
  }

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ════════════════════ NAVBAR ════════════════════ */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-3">

          {/* Logo */}
          <button
            onClick={() => navigateTo("beranda")}
            className="flex items-center gap-2.5 hover:opacity-80 transition-opacity flex-shrink-0"
          >
            <div className="w-9 h-9 bg-green-700 rounded-xl flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <p className="text-gray-900 font-bold text-base leading-tight">SiPadiPrediksi</p>
              <p className="text-gray-400 text-xs leading-tight hidden md:block">Prediksi Panen Padi Nasional</p>
            </div>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {navItems.map((item) => (
              <button
                key={item.page}
                onClick={() => navigateTo(item.page)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  page === item.page
                    ? "bg-green-700 text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
                {item.page === "riwayat" && riwayat.length > 0 && (
                  <span className="ml-1 bg-amber-400 text-green-900 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {riwayat.length}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* User menu (selalu ada karena sudah login) */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div ref={userMenuRef} className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors"
                aria-expanded={userMenuOpen}
                aria-haspopup="true"
              >
                <div className="w-8 h-8 bg-green-700 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {inisial}
                </div>
                <div className="text-left">
                  <p className="text-gray-800 text-sm font-semibold leading-tight max-w-[100px] truncate">
                    {user.namaLengkap.split(" ")[0]}
                  </p>
                  <p className="text-gray-400 text-xs leading-tight">{user.provinsi}</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Dropdown */}
              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-200 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-700 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                        {inisial}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-gray-800 text-sm truncate">{user.namaLengkap}</p>
                        <p className="text-gray-500 text-xs truncate">{user.email}</p>
                        <p className="text-gray-400 text-xs mt-0.5">📍 {user.provinsi}</p>
                      </div>
                    </div>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => navigateTo("riwayat")}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-gray-700 text-sm transition-colors"
                    >
                      <History className="w-4 h-4 text-gray-400" />
                      Riwayat Prediksi
                      {riwayat.length > 0 && (
                        <span className="ml-auto bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full">
                          {riwayat.length}
                        </span>
                      )}
                    </button>
                  </div>
                  <div className="border-t border-gray-100 py-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 text-red-600 text-sm transition-colors rounded-b-2xl"
                    >
                      <LogOut className="w-4 h-4" />
                      Keluar dari Akun
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Hamburger (mobile) */}
            <button
              className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Tutup menu" : "Buka menu"}
            >
              {mobileMenuOpen
                ? <X className="w-5 h-5 text-gray-600" />
                : <Menu className="w-5 h-5 text-gray-600" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1 shadow-lg">
            <div className="flex items-center gap-3 px-3 py-3 bg-green-50 rounded-2xl mb-2 border border-green-100">
              <div className="w-10 h-10 bg-green-700 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {inisial}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-gray-800 text-sm truncate">{user.namaLengkap}</p>
                <p className="text-gray-500 text-xs truncate">{user.email}</p>
              </div>
            </div>

            {navItems.map((item) => (
              <button
                key={item.page}
                onClick={() => navigateTo(item.page)}
                className={`flex items-center gap-3 w-full px-4 py-3.5 rounded-2xl text-base font-medium transition-all ${
                  page === item.page ? "bg-green-700 text-white" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
                {item.page === "riwayat" && riwayat.length > 0 && (
                  <span className="ml-auto bg-amber-400 text-green-900 text-xs font-bold px-2 py-0.5 rounded-full">
                    {riwayat.length}
                  </span>
                )}
              </button>
            ))}

            <div className="pt-1">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-4 py-3.5 rounded-2xl text-base font-medium text-red-600 hover:bg-red-50 transition-all"
              >
                <LogOut className="w-5 h-5" />
                Keluar dari Akun
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ════════════════════ MAIN CONTENT ═══════════════════ */}
      <main className="max-w-4xl mx-auto px-4 py-6 pb-24 md:pb-10">
        {page === "beranda" && (
          <HalamanUtama
            onMulai={() => navigateTo("form")}
            onDaftar={() => {}}
            isLoggedIn={true}
            userName={user.namaLengkap}
          />
        )}
        {page === "form" && (
          <FormPrediksi onHasil={handleHasil} />
        )}
        {page === "hasil" && hasilAktif && (
          <HasilPrediksi
            hasil={hasilAktif}
            onUlang={() => navigateTo("form")}
            onBeranda={() => navigateTo("beranda")}
          />
        )}
        {page === "riwayat" && (
          <RiwayatPrediksi
            onPrediksi={() => navigateTo("form")}
          />
        )}
      </main>

      {/* ════════════════════ MOBILE BOTTOM NAV ════════════════════ */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-2 z-40 flex items-center justify-around">
        {navItems.map((item) => (
          <button
            key={item.page}
            onClick={() => navigateTo(item.page)}
            className={`relative flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-all ${
              page === item.page ? "text-green-700" : "text-gray-400"
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[11px] font-medium">{item.label}</span>
            {item.page === "riwayat" && riwayat.length > 0 && (
              <span className="absolute -top-0.5 right-1.5 bg-amber-400 text-green-900 text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                {riwayat.length}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}