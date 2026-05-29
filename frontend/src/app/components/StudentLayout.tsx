import { LayoutDashboard, LogOut, MoonStar, Search, UserRound, X } from "lucide-react";
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { StudentHeader } from "./StudentHeader";
import { UNASPLogo } from "./UNASPLogo";

interface StudentLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { to: "/aluno", label: "Página Inicial", icon: LayoutDashboard, end: true },
  { to: "/aluno/historico", label: "Histórico", icon: Search, end: false },
  { to: "/aluno/perfil", label: "Perfil", icon: UserRound, end: false },
];

export function StudentLayout({ children }: StudentLayoutProps) {
  const { user, packages, logout, toggleTheme, theme } = useApp();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const myPackages = packages.filter((pkg) => pkg.ra === user?.ra);
  const availableCount = myPackages.filter((pkg) => pkg.status === "disponivel").length;

  function handleLogout() {
    logout();
    navigate("/");
  }

  const SidebarContent = ({ showLogo = true }: { showLogo?: boolean }) => (
    <div className="flex h-full flex-col bg-[var(--sidebar-bg)] text-white relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 pointer-events-none"></div>

      {showLogo && (
        <div className="border-b border-white/10 px-5 py-5 relative z-10">
          <UNASPLogo size="md" dark={true} />
        </div>
      )}

      <div className="border-b border-white/10 px-5 py-4 relative z-10">
        <p className="text-xs font-medium uppercase tracking-wide text-blue-200">Aluno</p>
        <p className="mt-1 text-sm font-semibold text-white">{user?.nome}</p>
        <p className="text-xs text-blue-200">RA: {user?.ra}</p>
      </div>

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

      <div className="border-t border-white/10 px-3 py-4 space-y-2 relative z-10">
        <button
          onClick={toggleTheme}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-blue-200 transition hover:bg-white/10 hover:text-white"
          title={theme === "light" ? "Ativar modo escuro" : "Ativar modo claro"}
        >
          <MoonStar size={18} />
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
      <aside className="hidden lg:flex w-72 flex-shrink-0 flex-col sticky top-0 h-screen overflow-hidden ring-1 ring-black/5 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <SidebarContent />
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

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

      <div className="flex flex-1 flex-col min-w-0">
        <StudentHeader
          availableCount={availableCount}
          onOpenSidebar={() => setSidebarOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
