import React, { createContext, useContext, useEffect, useState } from "react";
import { clearSession, getStoredSession, saveSession } from "../lib/storage";
import {
  fetchPackages as fetchPackagesFromApi,
  fetchUsers,
  apiLogin,
  apiRegister,
  createPackage,
  updatePackageStatus,
  deletePackage as apiDeletePackage,
  setApiToken
} from "../lib/api";
import { PackageItem, User } from "../lib/types";
import { fromEncomendaApi, toEncomendaPayload, toStatusId } from "../lib/adapters";

type ActionResult = { ok: boolean; error?: string };

interface AppContextType {
  user: User | null;
  packages: PackageItem[];
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
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Sempre relê a lista do banco: a tela mostra exatamente o que está no MySQL
  async function reloadPackages() {
    const list = await fetchPackagesFromApi();
    setPackages(list.map(fromEncomendaApi));
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

  // Carrega encomendas da API. Lista vazia é resposta válida (sem mock).
  useEffect(() => {
    if (!user) {
      setPackages([]);
      return;
    }

    reloadPackages().catch((e) => {
      console.error("Erro ao carregar encomendas:", e);
      setPackages([]);
    });
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
        ra: serverUser.ra ?? serverUser.email ?? "",
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
      // Hoje a API só persiste o status (não guarda quem retirou)
      await updatePackageStatus(id, toStatusId(updates.status));
      await reloadPackages();
      return { ok: true };
    } catch (e) {
      return { ok: false, error: errorMessage(e, "Erro ao atualizar encomenda.") };
    }
  }

  async function deletePackage(id: string): Promise<ActionResult> {
    try {
      await apiDeletePackage(id);
      await reloadPackages();
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