import { useState } from "react";
import { ChartColumn, Filter, LayoutDashboard, LogOut, Menu, PackagePlus, SunMoon, X } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { UNASPLogo } from "./UNASPLogo";

interface StaffLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { to: "/funcionario", label: "Página Inicial", icon: LayoutDashboard, end: true },
  { to: "/funcionario/cadastrar", label: "Cadastrar", icon: PackagePlus, end: false },
  { to: "/funcionario/gerenciar", label: "Filtros", icon: Filter, end: false },
  { to: "/funcionario/graficos", label: "Gráficos", icon: ChartColumn, end: false },
];

export function StaffLayout({ children }: StaffLayoutProps) {
  const { user, logout, toggleTheme, theme } = useApp();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate("/");
  }

  const SidebarContent = ({ showLogo = true }: { showLogo?: boolean }) => (
    <div className="flex h-full flex-col bg-[var(--sidebar-bg)] text-white relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 pointer-events-none"></div>
      
      {/* Logo */}
      {showLogo && (
        <div className="border-b border-white/10 px-5 py-5 relative z-10">
          <UNASPLogo size="md" dark={true} />
        </div>
      )}

      {/* User info */}
      <div className="border-b border-white/10 px-5 py-4 relative z-10">
        <p className="text-xs font-medium uppercase tracking-wide text-blue-200">Funcionário</p>
        <p className="mt-1 text-sm font-semibold text-white">{user?.nome}</p>
        <p className="text-xs text-blue-200">Administrador</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 relative z-10">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                isActive
                  ? "bg-[var(--unasp-orange)] text-white shadow-sm"
                  : "text-blue-200 hover:bg-white/10 hover:text-white"
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}

      </nav>

      {/* Sidebar controls */}
      <div className="border-t border-white/10 px-3 py-4 space-y-2 relative z-10">
        <button
          onClick={toggleTheme}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-blue-200 transition hover:bg-white/10 hover:text-white"
          title={theme === "light" ? "Ativar modo escuro" : "Ativar modo claro"}
        >
          <SunMoon size={18} />
          {theme === "light" ? "Modo escuro" : "Modo claro"}
        </button>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-blue-200 transition hover:bg-red-500/20 hover:text-red-300"
        >
          <LogOut size={18} />
          Sair
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[var(--app-bg)] text-[var(--app-text)]">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-72 flex-shrink-0 flex-col sticky top-0 h-screen overflow-hidden ring-1 ring-black/5 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 flex-col bg-[var(--sidebar-bg)] text-white transition-transform duration-300 lg:hidden flex ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-4 relative z-10">
          <UNASPLogo size="sm" dark={true} />
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-1.5 text-blue-200 hover:bg-white/10"
          >
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-hidden relative z-10 w-full h-full">
          <SidebarContent showLogo={false} />
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-[var(--topbar-bg)] px-4 py-3 shadow-[0_4px_24px_rgba(0,0,0,0.06)] text-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="rounded-lg p-1.5 text-blue-100 hover:bg-white/10 lg:hidden"
              >
                <Menu size={22} />
              </button>
            </div>
            <div className="text-sm font-medium text-white/90 hidden sm:block">
              {user?.nome}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
