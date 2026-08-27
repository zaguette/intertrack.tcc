import React, { createContext, useContext, useEffect, useState } from "react";
import { authenticateUser, mockPackages, registerUser } from "../data/mockData";
import {
  clearSession,
  getStoredPackages,
  getStoredSession,
  PACKAGES_KEY,
  savePackages,
  saveSession,
} from "../lib/storage";
import { 
  fetchPackages as fetchPackagesFromApi, 
  apiLogin, 
  apiRegister,
  createPackage,
  updatePackageStatus,
  deletePackage as apiDeletePackage
} from "../lib/api";
import { PackageItem, PackageStatus, User } from "../lib/types";

interface AppContextType {
  user: User | null;
  packages: PackageItem[];
  theme: "light" | "dark";
  login: (ra: string, password: string) => Promise<User | null>;
  register: (payload: { 
    nome: string; 
    ra: string; 
    email: string; 
    senha: string; 
    contato?: string; 
  }) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  addPackage: (pkg: PackageItem) => Promise<void>;
  updatePackage: (id: string, updates: Partial<PackageItem>) => Promise<void>;
  deletePackage: (id: string) => Promise<void>;
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

function normalizeStatus(status?: string): PackageStatus {
  if (!status) return "pending";
  const s = status.toString().toLowerCase();
  if (s === "entregue" || s === "collected") return "collected";
  if (s === "disponivel" || s === "available") return "available";
  if (s === "pending") return "pending";
  return "pending";
}

function normalizePackage(pkg: Partial<PackageItem>): PackageItem {
  return {
    ...(pkg as PackageItem),
    status: normalizeStatus((pkg as PackageItem).status),
  } as PackageItem;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const storedSession = getStoredSession();
    setUser(storedSession);

    const nextTheme = getStoredTheme(storedSession);
    setTheme(nextTheme);
    applyTheme(nextTheme);
    persistTheme(nextTheme, storedSession);

    async function loadPackages() {
      const storedPackages = getStoredPackages().map(normalizePackage);

      try {
        const apiResp = await fetchPackagesFromApi();
        if (Array.isArray(apiResp) && apiResp.length > 0) {
          setPackages(apiResp.map(normalizePackage));
          return;
        }
      } catch (e) {
        // Fallback local caso a API não responda
      }

      if (storedPackages.length === 0) {
        const normalizedMocks = mockPackages.map(normalizePackage);
        setPackages(normalizedMocks);
        savePackages(normalizedMocks);
      } else {
        setPackages(storedPackages);
      }
    }

    loadPackages();
  }, []);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    const nextTheme = getStoredTheme(user);
    setTheme((current) => (current === nextTheme ? current : nextTheme));
    applyTheme(nextTheme);
    persistTheme(nextTheme, user);
  }, [user]);

  useEffect(() => {
    if (packages.length > 0) {
      savePackages(packages);
    }
  }, [packages]);

  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (event.key !== PACKAGES_KEY) return;
      setPackages(getStoredPackages().map(normalizePackage));
    }

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  async function login(ra: string, _password: string): Promise<User | null> {
    try {
      const resp = await apiLogin(ra, _password);
      const serverUser = resp.user;

      const mapped: User = {
        id: serverUser.id,
        nome: serverUser.nome,
        ra: (serverUser.ra as string) ?? serverUser.email ?? "",
        tipo: "aluno",
      };

      const nextTheme = getStoredTheme(mapped);
      setTheme(nextTheme);
      applyTheme(nextTheme);
      persistTheme(nextTheme, mapped);

      setUser(mapped);
      saveSession(mapped);
      return mapped;
    } catch (e) {
      const found = authenticateUser(ra, _password);
      if (!found) return null;

      const nextTheme = getStoredTheme(found);
      setTheme(nextTheme);
      applyTheme(nextTheme);
      persistTheme(nextTheme, found);

      setUser(found);
      saveSession(found);
      return found;
    }
  }

  async function register(payload: { 
    nome: string; 
    ra: string; 
    email: string; 
    senha: string; 
    contato?: string; 
  }) {
    try {
      await apiRegister({ 
        nome: payload.nome, 
        email: payload.email, 
        senha: payload.senha, 
        telefone: payload.contato ?? payload.email 
      });
      return { ok: true };
    } catch (e: any) {
      if (e?.response?.data?.message) {
        return { ok: false, error: e.response.data.message };
      }
    }

    const result = registerUser({
      nome: payload.nome,
      ra: payload.ra,
      email: payload.email,
      contato: payload.email,
      senha: payload.senha,
    } as any);

    if (!result.ok) {
      return { ok: false, error: result.error };
    }
    return { ok: true };
  }

  function logout() {
    persistTheme(theme, null);
    clearSession();
    setUser(null);
  }

  async function addPackage(pkg: PackageItem) {
    try {
      const apiResponse = await createPackage(pkg);
      setPackages((prev) => [normalizePackage(apiResponse), ...prev]);
    } catch (error) {
      console.error("Erro ao cadastrar encomenda na API:", error);
      setPackages((prev) => [normalizePackage(pkg), ...prev]);
    }
  }

  async function updatePackage(id: string, updates: Partial<PackageItem>) {
    try {
      if (updates.status) {
        await updatePackageStatus(id, updates.status);
      }
      setPackages((prev) =>
        prev.map((p) => (p.id === id ? normalizePackage({ ...p, ...updates }) : p))
      );
    } catch (error) {
      console.error("Erro ao atualizar status na API:", error);
    }
  }

  async function deletePackage(id: string) {
    try {
      await apiDeletePackage(id);
      setPackages((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      console.error("Erro ao deletar encomenda na API:", error);
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
        toggleTheme,
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