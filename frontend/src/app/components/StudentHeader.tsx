import { Bell, Menu } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useApp } from "../context/AppContext";
import { UNASPLogo } from "./UNASPLogo";

interface StudentHeaderProps {
  availableCount?: number;
  onOpenSidebar?: () => void;
}

export function StudentHeader({ availableCount = 0, onOpenSidebar }: StudentHeaderProps) {
  const { packages, user } = useApp();
  const navigate = useNavigate();
  const lastAvailableIdsRef = useRef<string[] | null>(null);

  const availablePackages = useMemo(() => {
    if (!user || user.tipo !== "aluno") return [];
    return packages.filter((pkg) => pkg.ra === user.ra && pkg.status === "disponivel");
  }, [packages, user]);

  useEffect(() => {
    if (!user || user.tipo !== "aluno") {
      lastAvailableIdsRef.current = null;
      return;
    }

    const currentIds = availablePackages.map((pkg) => pkg.id).sort();
    const previousIds = lastAvailableIdsRef.current;

    if (previousIds) {
      const newAvailablePackages = availablePackages.filter(
        (pkg) => !previousIds.includes(pkg.id)
      );

      if (newAvailablePackages.length > 0) {
        const message =
          newAvailablePackages.length === 1
            ? `Sua encomenda ${newAvailablePackages[0].codigo} já está disponível para retirada.`
            : `${newAvailablePackages.length} novas encomendas estão disponíveis para retirada.`;

        if (typeof window !== "undefined" && "Notification" in window) {
          if (window.Notification.permission === "granted") {
            new window.Notification("Intertrack", { body: message });
          } else if (window.Notification.permission === "default") {
            window.Notification.requestPermission().then((permission) => {
              if (permission === "granted") {
                new window.Notification("Intertrack", { body: message });
              } else {
                toast.info(message);
              }
            });
          } else {
            toast.info(message);
          }
        } else {
          toast.info(message);
        }
      }
    }

    lastAvailableIdsRef.current = currentIds;
  }, [availablePackages, user]);

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--app-border)] bg-[var(--panel-bg)]/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSidebar}
            className="rounded-lg p-1.5 text-[var(--muted-text)] hover:bg-black/5 lg:hidden"
          >
            <Menu size={22} />
          </button>
          <UNASPLogo />
        </div>
        <button
          onClick={() => navigate("/aluno/historico")}
          className="relative rounded-lg p-1.5 text-[var(--muted-text)] transition hover:bg-black/5"
          title="Abrir notificações"
        >
          <Bell size={20} className="text-[var(--muted-text)]" />
          {availableCount > 0 && (
            <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-500 px-1 text-[10px] font-bold text-white">
              {availableCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
