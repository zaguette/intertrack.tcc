import { Bell, Menu } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useApp } from "../context/AppContext";
import { UNASPLogo } from "./UNASPLogo";

interface StudentHeaderProps {
  availableCount?: number;
  onOpenSidebar?: () => void;
}

function normalizeNotificationId(id: string) {
  const deliveredLegacyMatch = id.match(/^delivered:([^:]+):.+$/);
  if (deliveredLegacyMatch) {
    return `delivered:${deliveredLegacyMatch[1]}`;
  }

  return id;
}

export function StudentHeader({ availableCount = 0, onOpenSidebar }: StudentHeaderProps) {
  const { packages, user } = useApp();
  const lastAvailableIdsRef = useRef<string[] | null>(null);
  const lastDeliveredIdsRef = useRef<string[] | null>(null);
  const bellContainerRef = useRef<HTMLDivElement | null>(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>([]);
  const [readNotificationsHydrated, setReadNotificationsHydrated] = useState(false);

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
      packageId: pkg.id,
      message: `Sua encomenda ${pkg.codigo} está disponível para retirada.`,
      detail: `Chegada: ${formatDate(pkg.dataChegada)}`,
      sortDate: pkg.dataChegada,
    }));

    const deliveredNotifications = deliveredPackages.map((pkg) => ({
      id: `delivered:${pkg.id}`,
      packageId: pkg.id,
      message: `Sua encomenda ${pkg.codigo} foi retirada por: ${pkg.collectedBy}.`,
      detail: `Retirada: ${formatDate(pkg.dataRetirada ?? pkg.dataChegada)}`,
      sortDate: pkg.collectedAt ?? pkg.dataRetirada ?? pkg.dataChegada,
    }));

    return [...deliveredNotifications, ...availableNotifications].sort((a, b) =>
      b.sortDate.localeCompare(a.sortDate)
    );
  }, [availablePackages, deliveredPackages]);

  const unreadCount = useMemo(
    () => {
      if (!readNotificationsHydrated) return 0;

      return notifications.filter((notification) => !isNotificationRead(notification)).length;
    },
    [notifications, readNotificationSet, readNotificationsHydrated]
  );

  const notificationCount =
    user?.tipo === "aluno"
      ? readNotificationsHydrated
        ? unreadCount
        : 0
      : availableCount;

  function isNotificationRead(notification: { id: string; packageId: string }) {
    return (
      readNotificationSet.has(notification.id) ||
      readNotificationSet.has(`pkg:${notification.packageId}`)
    );
  }

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
      setReadNotificationsHydrated(false);
      return;
    }

    const storageKey = getReadStorageKey();
    if (!storageKey) {
      setReadNotificationsHydrated(true);
      return;
    }
    const raw = localStorage.getItem(storageKey);
    if (!raw) {
      setReadNotificationIds([]);
      setReadNotificationsHydrated(true);
      return;
    }

    try {
      const parsed = JSON.parse(raw) as string[];
      const normalized = Array.isArray(parsed)
        ? Array.from(
            new Set(
              parsed
                .filter((item): item is string => typeof item === "string")
                .map((item) => normalizeNotificationId(item))
            )
          )
        : [];
      setReadNotificationIds(normalized);

      localStorage.setItem(storageKey, JSON.stringify(normalized));
    } catch {
      setReadNotificationIds([]);
    }

    setReadNotificationsHydrated(true);
  }, [user]);

  useEffect(() => {
    if (!user || user.tipo !== "aluno") return;
    if (!readNotificationsHydrated) return;

    const storageKey = getReadStorageKey();
    if (!storageKey) return;

    localStorage.setItem(storageKey, JSON.stringify(readNotificationIds));
  }, [readNotificationIds, user]);

  function markNotificationAsRead(id: string) {
    const normalizedId = normalizeNotificationId(id);
    const packageId = normalizedId.split(":")[1];

    setReadNotificationIds((prev) => {
      const nextSet = new Set(prev);
      nextSet.add(normalizedId);
      if (packageId) {
        nextSet.add(`pkg:${packageId}`);
      }

      if (nextSet.size === prev.length) return prev;

      const next = Array.from(nextSet);
      const storageKey = getReadStorageKey();
      if (storageKey) {
        localStorage.setItem(storageKey, JSON.stringify(next));
      }
      return next;
    });
  }

  function markPackagesAsRead(packageIds: string[]) {
    if (packageIds.length === 0) return;

    setReadNotificationIds((prev) => {
      const nextSet = new Set(prev);

      packageIds.forEach((packageId) => {
        nextSet.add(`pkg:${packageId}`);
        nextSet.add(`available:${packageId}`);
        nextSet.add(`delivered:${packageId}`);
      });

      if (nextSet.size === prev.length) return prev;

      const next = Array.from(nextSet);
      const storageKey = getReadStorageKey();
      if (storageKey) {
        localStorage.setItem(storageKey, JSON.stringify(next));
      }
      return next;
    });
  }

  function handleToggleNotifications() {
    setNotificationsOpen((current) => {
      const next = !current;

      if (next) {
        setReadNotificationIds((prev) => {
          const merged = new Set(prev);
          notifications.forEach((notification) => {
            merged.add(normalizeNotificationId(notification.id));
            merged.add(`pkg:${notification.packageId}`);
          });
          const nextIds = Array.from(merged);
          const storageKey = getReadStorageKey();
          if (storageKey) {
            localStorage.setItem(storageKey, JSON.stringify(nextIds));
          }
          return nextIds;
        });
      }

      return next;
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
        markPackagesAsRead(newAvailablePackages.map((pkg) => pkg.id));
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
        markPackagesAsRead(newDeliveredPackages.map((pkg) => pkg.id));
      }
    }

    lastDeliveredIdsRef.current = currentDeliveredIds;
  }, [deliveredPackages, user]);

  useEffect(() => {
    if (!notificationsOpen) return;

    setReadNotificationIds((prev) => {
      const merged = new Set(prev);
      notifications.forEach((notification) => {
        merged.add(normalizeNotificationId(notification.id));
        merged.add(`pkg:${notification.packageId}`);
      });
      const nextIds = Array.from(merged);

      if (nextIds.length === prev.length) return prev;

      const storageKey = getReadStorageKey();
      if (storageKey) {
        localStorage.setItem(storageKey, JSON.stringify(nextIds));
      }

      return nextIds;
    });
  }, [notificationsOpen, notifications]);

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
    <header className="sticky top-0 z-40 bg-[var(--topbar-bg)] px-4 py-3 shadow-[0_4px_24px_rgba(0,0,0,0.06)] text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSidebar}
            className="rounded-lg p-1.5 text-blue-100 hover:bg-white/10 lg:hidden"
          >
            <Menu size={22} />
          </button>
          <div className="block lg:hidden">
            <UNASPLogo dark={true} />
          </div>
        </div>
        <div className="relative" ref={bellContainerRef}>
          <button
            onClick={handleToggleNotifications}
            className="relative rounded-lg p-1.5 text-blue-100 transition hover:bg-white/10"
            title="Abrir notificações"
          >
            <Bell size={20} className="text-blue-100" />
            {notificationCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-500 px-1 text-[10px] font-bold text-white shadow-sm ring-2 ring-[var(--topbar-bg)]">
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
                    const isRead = isNotificationRead(notification);
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
