import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { clearSession, getStoredSession, saveSession } from "../lib/storage";
import {
  fetchPackages as fetchPackagesFromApi,
  fetchNotifications,
  fetchUsers,
  apiLogin,
  apiRegister,
  createPackage,
  updatePackageStatus,
  deletePackage as apiDeletePackage,
  setApiToken
} from "../lib/api";
import { AppNotification, PackageItem, User } from "../lib/types";
import { fromEncomendaApi, toEncomendaPayload, toStatusId } from "../lib/adapters";

type ActionResult = { ok: boolean; error?: string };

interface AppContextType {
  user: User | null;
  packages: PackageItem[];
  notifications: AppNotification[];
  theme: "light" | "dark";
  login: (identificador: string, password: string) => Promise<User | null>;
  register: (payload: {
    nome: string;
    ra: string;
    email: string;
    senha: string;
    contato?: string;
  }) => Promise<ActionResult>;
  logout: () => void;
  addPackage: (pkg: PackageItem) => Promise<ActionResult>;
  updatePackage: (id: string, updates: Partial<PackageItem>) => Promise<ActionResult>;
  deletePackage: (id: string) => Promise<ActionResult>;
  toggleTheme: () => void;
}

const AppContext = createContext<AppContextType | null>(null);
const LEGACY_THEME_KEY = "intertrack_theme_v1";

function getThemeStorageKey(user: User | null) {
  if (!user) return `${LEGACY_THEME_KEY}_guest`;
  return `intertrack_theme_v2_${user.tipo}_${user.ra}`;
}

function getStoredTheme(user: User | null): "light" | "dark" {
  const userTheme = localStorage.getItem(getThemeStorageKey(user));
  if (userTheme === "dark" || userTheme === "light") return userTheme;

  const legacyTheme = localStorage.getItem(LEGACY_THEME_KEY);
  return legacyTheme === "dark" ? "dark" : "light";
}

function persistTheme(theme: "light" | "dark", user: User | null) {
  localStorage.setItem(getThemeStorageKey(user), theme);
  localStorage.setItem(LEGACY_THEME_KEY, theme);
}

function applyTheme(theme: "light" | "dark") {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
}

function errorMessage(e: unknown, fallback: string) {
  return e instanceof Error && e.message ? e.message : fallback;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const packagesRequestVersion = useRef(0);
  const notificationsRequestVersion = useRef(0);

  // Sempre relê a lista do banco: a tela mostra exatamente o que está no MySQL
  async function reloadPackages() {
    const requestVersion = ++packagesRequestVersion.current;
    const list = await fetchPackagesFromApi();
    if (requestVersion !== packagesRequestVersion.current) return;
    const mapped = list.map(fromEncomendaApi);
    mapped.sort((a, b) => {
      const first = new Date(a.createdAt ?? a.dataChegada ?? 0).getTime();
      const second = new Date(b.createdAt ?? b.dataChegada ?? 0).getTime();
      return second - first;
    });
    setPackages(mapped);
  }

  async function reloadNotifications() {
    const requestVersion = ++notificationsRequestVersion.current;
    const list = await fetchNotifications();
    if (requestVersion !== notificationsRequestVersion.current) return;
    setNotifications(
      list.map((notification) => ({
        id: notification.id,
        message:
          notification.mensagem ??
          `Sua encomenda ${notification.encomenda?.codigo_rastreio ?? ""} está disponível para retirada.`,
        packageId: notification.encomenda?.codigo_rastreio ?? notification.encomenda?.id ?? "",
        createdAt: notification.created_at
      }))
    );
  }

  // Restaura sessão e tema
  useEffect(() => {
    const storedSession = getStoredSession();
    setUser(storedSession);

    const nextTheme = getStoredTheme(storedSession);
    setTheme(nextTheme);
    applyTheme(nextTheme);
    persistTheme(nextTheme, storedSession);
  }, []);

  // Carrega encomendas da API e configura atualização automática
  useEffect(() => {
    if (!user) {
      setPackages([]);
      setNotifications([]);
      return;
    }

    // Carrega imediatamente ao entrar
    reloadPackages().catch((e) => {
      console.error("Erro ao carregar encomendas:", e);
      setPackages([]);
    });

    // Mantém o estado de encomendas sincronizado com o banco.
    const interval = setInterval(() => {
      reloadPackages().catch(console.error);
    }, 3000);

    reloadNotifications().catch((e) => console.error("Erro ao carregar notificações:", e));
    const notificationsInterval = setInterval(() => {
      reloadNotifications().catch(console.error);
    }, 3000);

    // Limpa o intervalo ao sair do aplicativo
    return () => {
      clearInterval(interval);
      clearInterval(notificationsInterval);
    };
  }, [user?.id]);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    const nextTheme = getStoredTheme(user);
    setTheme((current) => (current === nextTheme ? current : nextTheme));
    applyTheme(nextTheme);
    persistTheme(nextTheme, user);
  }, [user]);

  async function login(identificador: string, password: string): Promise<User | null> {
    try {
      const resp = await apiLogin(identificador, password);
      const serverUser = resp.user;

      const mapped: User = {
        id: serverUser.id,
        nome: serverUser.nome,
        email: serverUser.email,
        ra: serverUser.ra ?? "",
        tipo: serverUser.tipo, // "aluno" | "funcionario" vindo da API
        cargo: serverUser.cargo
      } as User;

      const nextTheme = getStoredTheme(mapped);
      setTheme(nextTheme);
      applyTheme(nextTheme);
      persistTheme(nextTheme, mapped);

      setUser(mapped);
      saveSession(mapped);
      return mapped;
    } catch (e) {
      console.error("Erro no login:", e);
      return null;
    }
  }

  async function register(payload: {
    nome: string;
    ra: string;
    email: string;
    senha: string;
    contato?: string;
  }): Promise<ActionResult> {
    try {
      await apiRegister({
        nome: payload.nome,
        ra: payload.ra,
        email: payload.email,
        senha: payload.senha,
        telefone: payload.contato
      });
      return { ok: true };
    } catch (e) {
      return { ok: false, error: errorMessage(e, "Erro ao cadastrar usuário.") };
    }
  }

  function logout() {
    persistTheme(theme, null);
    clearSession();
    setApiToken(null);
    setPackages([]);
    setNotifications([]);
    setUser(null);
  }

  async function addPackage(pkg: PackageItem): Promise<ActionResult> {
    try {
      // A API não recebe RA: descobrimos o ID do aluno pela lista de usuários
      const users = await fetchUsers();

      if (users.length > 0 && users.every((u) => u.ra === undefined)) {
        return {
          ok: false,
          error: "A API de usuários não retorna o RA (adicione ra: true no select de findAll)."
        };
      }

      const alvo = users.find((u) => (u.ra ?? "").trim() === (pkg.ra ?? "").trim());
      if (!alvo) {
        return { ok: false, error: `Nenhum aluno encontrado com o RA ${pkg.ra}.` };
      }
      if (alvo.ativo === false) {
        return { ok: false, error: "Este aluno está desativado." };
      }

      await createPackage(toEncomendaPayload(pkg, alvo.id));
      await reloadPackages();
      await reloadNotifications();
      return { ok: true };
    } catch (e) {
      return { ok: false, error: errorMessage(e, "Erro ao cadastrar encomenda.") };
    }
  }

  async function updatePackage(
    id: string,
    updates: Partial<PackageItem>
  ): Promise<ActionResult> {
    try {
      if (!updates.status) {
        return { ok: false, error: "Nenhuma alteração de status informada." };
      }
      await updatePackageStatus(id, toStatusId(updates.status), updates.retiradoPor ?? updates.collectedBy);
      await reloadPackages();
      await reloadNotifications();
      return { ok: true };
    } catch (e) {
      return { ok: false, error: errorMessage(e, "Erro ao atualizar encomenda.") };
    }
  }

  async function deletePackage(id: string): Promise<ActionResult> {
    try {
      await apiDeletePackage(id);
      await reloadPackages();
      await reloadNotifications();
      return { ok: true };
    } catch (e) {
      return { ok: false, error: errorMessage(e, "Erro ao excluir encomenda.") };
    }
  }

  function toggleTheme() {
    setTheme((current) => {
      const next = current === "light" ? "dark" : "light";
      persistTheme(next, user);
      return next;
    });
  }

  return (
    <AppContext.Provider
      value={{
        user,
        packages,
        notifications,
        theme,
        login,
        register,
        logout,
        addPackage,
        updatePackage,
        deletePackage,
        toggleTheme
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}