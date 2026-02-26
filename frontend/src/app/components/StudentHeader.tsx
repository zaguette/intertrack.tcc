import { Bell, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { UNASPLogo } from "./UNASPLogo";

interface StudentHeaderProps {
  availableCount?: number;
}

export function StudentHeader({ availableCount = 0 }: StudentHeaderProps) {
  const { logout } = useApp();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-blue-800 bg-blue-900 shadow-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <UNASPLogo dark />
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bell size={20} className="text-blue-200" />
            {availableCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-green-500 text-[10px] font-bold text-white">
                {availableCount}
              </span>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-lg border border-blue-700 bg-blue-800 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            <LogOut size={15} />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </div>
    </header>
  );
}
