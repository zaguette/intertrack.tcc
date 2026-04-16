import { Bell, Menu } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useApp } from "../context/AppContext";
import { UNASPLogo } from "./UNASPLogo";

interface StudentHeaderProps {
  availableCount?: number;
  onOpenSidebar?: () => void;
}

export function StudentHeader({ availableCount = 0, onOpenSidebar }: StudentHeaderProps) {
  const { packages, user } = useApp();
  const lastAvailableIdsRef = useRef<string[] | null>(null);
  const lastDeliveredIdsRef = useRef<string[] | null>(null);
  const readLoadedRef = useRef(false);
  const bellContainerRef = useRef<HTMLDivElement | null>(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>([]);

  const readNotificationSet = useMemo(
    () => new Set(readNotificationIds),
    [readNotificationIds]
  );

  const availablePackages = useMemo(() => {
    if (!user || user.tipo !== "aluno") return [];
    return packages.filter((pkg) => pkg.ra === user.ra && pkg.status === "disponivel");
  }, [packages, user]);

  const deliveredPackages = useMemo(() => {
    if (!user || user.tipo !== "aluno") return [];
    return packages.filter(
      (pkg) => pkg.ra === user.ra && pkg.status === "entregue" && !!pkg.collectedBy
    );
  }, [packages, user]);

  const notifications = useMemo(() => {
    const availableNotifications = availablePackages.map((pkg) => ({
      id: `available:${pkg.id}`,
      message: `Sua encomenda ${pkg.codigo} está disponível para retirada.`,
      detail: `Chegada: ${formatDate(pkg.dataChegada)}`,
      sortDate: pkg.dataChegada,
    }));

    const deliveredNotifications = deliveredPackages.map((pkg) => ({
      id: `delivered:${pkg.id}:${pkg.collectedAt ?? pkg.dataRetirada ?? ""}`,
      message: `Sua encomenda ${pkg.codigo} foi retirada por: ${pkg.collectedBy}.`,
      detail: `Retirada: ${formatDate(pkg.dataRetirada)}`,
      sortDate: pkg.collectedAt ?? pkg.dataRetirada ?? pkg.dataChegada,
    }));

    return [...deliveredNotifications, ...availableNotifications].sort((a, b) =>
      b.sortDate.localeCompare(a.sortDate)
    );
  }, [availablePackages, deliveredPackages]);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !readNotificationSet.has(notification.id)).length,
    [notifications, readNotificationSet]
  );

  const notificationCount =
    user?.tipo === "aluno" ? unreadCount : availableCount;

  function formatDate(date: string) {
    const [year, month, day] = date.split("-");
    return `${day}/${month}/${year}`;
  }

  function sendRealtimeNotification(message: string) {
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

  function getReadStorageKey() {
    if (!user) return null;
    return `intertrack_read_notifications_v2_${user.tipo}_${user.ra}`;
  }

  useEffect(() => {
    if (!user || user.tipo !== "aluno") {
      setReadNotificationIds([]);
      readLoadedRef.current = false;
      return;
    }

    const storageKey = getReadStorageKey();
    if (!storageKey) return;
    const raw = localStorage.getItem(storageKey);
    if (!raw) {
      setReadNotificationIds([]);
      readLoadedRef.current = true;
      return;
    }

    try {
      const parsed = JSON.parse(raw) as string[];
      setReadNotificationIds(Array.isArray(parsed) ? parsed : []);
    } catch {
      setReadNotificationIds([]);
    }

    readLoadedRef.current = true;
  }, [user]);

  useEffect(() => {
    if (!user || user.tipo !== "aluno") return;
    if (!readLoadedRef.current) return;

    const storageKey = getReadStorageKey();
    if (!storageKey) return;

    localStorage.setItem(storageKey, JSON.stringify(readNotificationIds));
  }, [readNotificationIds, user]);

  useEffect(() => {
    const validIds = new Set(notifications.map((notification) => notification.id));
    setReadNotificationIds((prev) => prev.filter((id) => validIds.has(id)));
  }, [notifications]);

  function markNotificationAsRead(id: string) {
    setReadNotificationIds((prev) => {
      if (prev.includes(id)) return prev;
      return [...prev, id];
    });
  }

  useEffect(() => {
    if (!user || user.tipo !== "aluno") {
      lastAvailableIdsRef.current = null;
      lastDeliveredIdsRef.current = null;
      return;
    }

    const currentAvailableIds = availablePackages.map((pkg) => pkg.id).sort();
    const previousAvailableIds = lastAvailableIdsRef.current;

    if (previousAvailableIds) {
      const newAvailablePackages = availablePackages.filter(
        (pkg) => !previousAvailableIds.includes(pkg.id)
      );

      if (newAvailablePackages.length > 0) {
        const message =
          newAvailablePackages.length === 1
            ? `Sua encomenda ${newAvailablePackages[0].codigo} já está disponível para retirada.`
            : `${newAvailablePackages.length} novas encomendas estão disponíveis para retirada.`;

        sendRealtimeNotification(message);
      }
    }

    lastAvailableIdsRef.current = currentAvailableIds;
  }, [availablePackages, user]);

  useEffect(() => {
    if (!user || user.tipo !== "aluno") {
      lastDeliveredIdsRef.current = null;
      return;
    }

    const currentDeliveredIds = deliveredPackages.map((pkg) => pkg.id).sort();
    const previousDeliveredIds = lastDeliveredIdsRef.current;

    if (previousDeliveredIds) {
      const newDeliveredPackages = deliveredPackages.filter(
        (pkg) => !previousDeliveredIds.includes(pkg.id)
      );

      if (newDeliveredPackages.length > 0) {
        const first = newDeliveredPackages[0];
        const message =
          newDeliveredPackages.length === 1
            ? `Sua encomenda ${first.codigo} foi retirada por: ${first.collectedBy}.`
            : `${newDeliveredPackages.length} encomendas foram registradas como retiradas.`;

        sendRealtimeNotification(message);
      }
    }

    lastDeliveredIdsRef.current = currentDeliveredIds;
  }, [deliveredPackages, user]);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (!bellContainerRef.current) return;
      if (!bellContainerRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

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
        <div className="relative" ref={bellContainerRef}>
          <button
            onClick={() => setNotificationsOpen((current) => !current)}
            className="relative rounded-lg p-1.5 text-[var(--muted-text)] transition hover:bg-black/5"
            title="Abrir notificações"
          >
            <Bell size={20} className="text-[var(--muted-text)]" />
            {notificationCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-500 px-1 text-[10px] font-bold text-white">
                {notificationCount}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 z-50 mt-2 w-[22rem] rounded-xl border border-[var(--app-border)] bg-[var(--panel-bg)] p-3 shadow-xl">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[var(--app-text)]">Notificações</h3>
                <span className="text-xs text-[var(--muted-text)]">Não lidas: {unreadCount}</span>
              </div>

              {notifications.length === 0 ? (
                <p className="rounded-lg bg-black/5 px-3 py-2 text-xs text-[var(--muted-text)]">
                  Você não possui notificações no momento.
                </p>
              ) : (
                <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                  {notifications.map((notification) => {
                    const isRead = readNotificationSet.has(notification.id);
                    return (
                      <button
                        key={notification.id}
                        onClick={() => markNotificationAsRead(notification.id)}
                        className={`w-full rounded-lg border px-3 py-2 text-left transition ${
                          isRead
                            ? "border-[var(--app-border)] bg-[var(--panel-bg)]/70"
                            : "border-emerald-500/35 bg-[var(--accent-bg)]"
                        }`}
                      >
                        <p className="text-sm font-semibold text-[var(--app-text)]">
                          {notification.message}
                        </p>
                        <p className="mt-1 text-xs text-[var(--muted-text)]">{notification.detail}</p>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
