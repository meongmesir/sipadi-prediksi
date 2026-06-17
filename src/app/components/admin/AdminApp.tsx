import { useState, useRef, useEffect } from "react";
import {
  Leaf, LayoutDashboard, Users, BarChart3, DollarSign,
  FileText, Settings, LogOut, Menu, X, ChevronDown,
  Shield, UserCog, Crown,
} from "lucide-react";
import type { UserType } from "../../App";
import { AdminDasbor } from "./AdminDasbor";
import { AdminPengguna } from "./AdminPengguna";
import { AdminKelolaAdmin } from "./AdminKelolaAdmin";
import { AdminPrediksi } from "./AdminPrediksi";
import { AdminLaporan } from "./AdminLaporan";
import { AdminPengaturan } from "./AdminPengaturan";

// ─── Types ────────────────────────────────────────────────────────────────────
export type AdminPage =
  | "dasbor"
  | "pengguna"
  | "kelola-admin"
  | "prediksi"
  | "laporan";

interface NavItem {
  page: AdminPage;
  label: string;
  icon: typeof LayoutDashboard;
  badge?: number;
  dividerBefore?: boolean;
}

interface Props {
  user: UserType;
  onLogout: () => void;
  role: "admin" | "superadmin";
}

const adminNavItems: NavItem[] = [
  { page: "dasbor",   label: "Dasbor",          icon: LayoutDashboard },
  { page: "prediksi", label: "Data Prediksi",    icon: BarChart3 },
  { page: "laporan",  label: "Laporan",          icon: FileText },
];

const superAdminNavItems: NavItem[] = [
  { page: "dasbor",       label: "Dasbor",          icon: LayoutDashboard },
  { page: "pengguna",     label: "Kelola Pengguna", icon: Users,      dividerBefore: false },
  { page: "kelola-admin", label: "Kelola Admin",    icon: UserCog,    dividerBefore: false },
  { page: "prediksi",     label: "Data Prediksi",   icon: BarChart3,  dividerBefore: true },
  { page: "laporan",      label: "Laporan",         icon: FileText },
];

// ─── Helper ───────────────────────────────────────────────────────────────────
function getInisial(nama: string) {
  const parts = nama.trim().split(/\s+/);
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : nama.substring(0, 2).toUpperCase();
}

// ─── AdminApp ─────────────────────────────────────────────────────────────────
export function AdminApp({ user, onLogout, role }: Props) {
  const [page, setPage] = useState<AdminPage>("dasbor");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const inisial = getInisial(user.namaLengkap);
  const isSuperAdmin = role === "superadmin";
  const navItems = isSuperAdmin ? superAdminNavItems : adminNavItems;

  // Close user menu on outside click
  useEffect(() => {
    if (!userMenuOpen) return;
    const h = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node))
        setUserMenuOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [userMenuOpen]);

  // Close sidebar on ESC
  useEffect(() => {
    if (!sidebarOpen) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") setSidebarOpen(false); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [sidebarOpen]);

  const navigate = (p: AdminPage) => {
    setPage(p);
    setSidebarOpen(false);
  };

  const currentNav = navItems.find((n) => n.page === page);

  // Badge config
  const badgeConfig = isSuperAdmin
    ? { bg: "bg-violet-100", text: "text-violet-800", border: "border-violet-200", label: "SUPER ADMIN", icon: Crown }
    : { bg: "bg-amber-100",  text: "text-amber-800",  border: "border-amber-200",  label: "ADMIN",       icon: Shield };

  const BadgeIcon = badgeConfig.icon;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">

      {/* ══════════════ TOP NAVBAR ══════════════ */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="px-4 py-3 flex items-center justify-between gap-3">

          {/* Left: Hamburger + Logo */}
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle sidebar"
            >
              {sidebarOpen
                ? <X className="w-5 h-5 text-gray-600" />
                : <Menu className="w-5 h-5 text-gray-600" />}
            </button>

            {/* Logo */}
            <button
              onClick={() => navigate("dasbor")}
              className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
            >
              <div className="w-9 h-9 bg-green-700 rounded-xl flex items-center justify-center">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="text-gray-900 font-bold text-base leading-tight">SiPadiPrediksi</p>
                <p className="text-gray-400 text-xs leading-tight hidden sm:block">
                  {isSuperAdmin ? "Panel Super Admin" : "Panel Admin"}
                </p>
              </div>
            </button>

            {/* Role badge */}
            <span className={`hidden sm:flex items-center gap-1.5 ${badgeConfig.bg} ${badgeConfig.text} border ${badgeConfig.border} text-xs font-bold px-2.5 py-1 rounded-full`}>
              <BadgeIcon className="w-3 h-3" />
              {badgeConfig.label}
            </span>
          </div>

          {/* Right: Breadcrumb + User */}
          <div className="flex items-center gap-3">
            {/* Current page */}
            <span className="hidden md:block text-gray-400 text-sm">
              {currentNav?.label}
            </span>

            {/* User menu */}
            <div ref={userMenuRef} className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${isSuperAdmin ? "bg-violet-700" : "bg-green-700"}`}>
                  {inisial}
                </div>
                <span className="hidden sm:block text-gray-700 text-sm font-semibold max-w-[100px] truncate">
                  {user.namaLengkap.split(" ")[0]}
                </span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-200 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 ${isSuperAdmin ? "bg-violet-700" : "bg-green-700"}`}>
                        {inisial}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-gray-800 text-sm truncate">{user.namaLengkap}</p>
                        <p className="text-gray-500 text-xs truncate">{user.email}</p>
                        <span className={`inline-flex items-center gap-1 ${badgeConfig.bg} ${badgeConfig.text} text-[10px] font-bold px-1.5 py-0.5 rounded-full mt-1`}>
                          <BadgeIcon className="w-2.5 h-2.5" />
                          {isSuperAdmin ? "Super Administrator" : "Administrator"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="py-1">
                  </div>
                  <div className="border-t border-gray-100 py-1">
                    <button
                      onClick={onLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 text-red-600 text-sm transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Keluar dari{isSuperAdmin ? " Super Admin" : " Admin"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ══════════════ BODY (SIDEBAR + CONTENT) ══════════════ */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── SIDEBAR ── */}
        <>
          {/* Mobile overlay */}
          {sidebarOpen && (
            <div
              className="lg:hidden fixed inset-0 bg-black/40 z-30"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          <aside
            className={`fixed lg:sticky top-[57px] left-0 h-[calc(100vh-57px)] lg:h-[calc(100vh-57px)] w-64 bg-white border-r border-gray-200 flex flex-col z-30 transition-transform duration-200 ${
              sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
            }`}
          >
            {/* Nav items */}
            <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest px-3 py-2">
                Menu Utama
              </p>
              {navItems.map((item) => (
                <div key={item.page}>
                  {item.dividerBefore && (
                    <div className="my-2 border-t border-gray-100" />
                  )}
                  <button
                    onClick={() => navigate(item.page)}
                    className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      page === item.page
                        ? isSuperAdmin
                          ? "bg-violet-700 text-white shadow-sm"
                          : "bg-green-700 text-white shadow-sm"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <item.icon className="w-4 h-4 flex-shrink-0" />
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.badge && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        page === item.page
                          ? "bg-white/20 text-white"
                          : "bg-amber-100 text-amber-700"
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                </div>
              ))}
            </nav>

            {/* Sidebar footer */}
            <div className="p-3 border-t border-gray-100">
              {/* Role info */}
              <div className={`flex items-center gap-2 px-3 py-2 rounded-xl mb-2 ${isSuperAdmin ? "bg-violet-50" : "bg-amber-50"}`}>
                <BadgeIcon className={`w-4 h-4 flex-shrink-0 ${isSuperAdmin ? "text-violet-700" : "text-amber-600"}`} />
                <div className="min-w-0">
                  <p className={`text-xs font-bold ${isSuperAdmin ? "text-violet-700" : "text-amber-700"}`}>
                    {isSuperAdmin ? "Super Admin" : "Admin"}
                  </p>
                  <p className="text-gray-400 text-[10px] truncate">{user.email}</p>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Keluar
              </button>
              <p className="text-gray-400 text-[10px] text-center mt-3">
                SiPadiPrediksi v2.1 · {isSuperAdmin ? "Super Admin" : "Admin"}
              </p>
            </div>
          </aside>
        </>

        {/* ── MAIN CONTENT ── */}
        <main className="flex-1 overflow-y-auto min-w-0">
          <div className="p-4 md:p-6 max-w-7xl mx-auto">
            {page === "dasbor"       && <AdminDasbor onNavigate={navigate} role={role} />}
            {page === "pengguna"     && isSuperAdmin && <AdminPengguna />}
            {page === "kelola-admin" && isSuperAdmin && <AdminKelolaAdmin />}
            {page === "prediksi"     && <AdminPrediksi />}
            {page === "laporan"      && <AdminLaporan />}
          </div>
        </main>
      </div>
    </div>
  );
}
