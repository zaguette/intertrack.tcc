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
import { PackageItem, PackageStatus, User } from "../lib/types";

interface AppContextType {
  user: User | null;
  packages: PackageItem[];
  theme: "light" | "dark";
  login: (ra: string, password: string) => User | null;
  register: (payload: { nome: string; ra: string; contato: string; senha: string }) => { ok: boolean; error?: string };
  logout: () => void;
  addPackage: (pkg: PackageItem) => void;
  updatePackage: (id: string, updates: Partial<PackageItem>) => void;
  deletePackage: (id: string) => void;
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

function normalizeStatus(status: string | undefined): PackageStatus {
  if (status === "entregue") return "entregue";
  return "disponivel";
}

function normalizePackage(pkg: PackageItem): PackageItem {
  return {
    ...pkg,
    status: normalizeStatus(pkg.status),
  };
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

    const storedPackages = getStoredPackages().map(normalizePackage);
    if (storedPackages.length === 0) {
      const normalizedMocks = mockPackages.map(normalizePackage);
      setPackages(normalizedMocks);
      savePackages(normalizedMocks);
    } else {
      setPackages(storedPackages);
    }
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

  function login(ra: string, _password: string): User | null {
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

  function register(payload: { nome: string; ra: string; contato: string; senha: string }) {
    const result = registerUser(payload);
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

  function addPackage(pkg: PackageItem) {
    setPackages((prev) => [normalizePackage(pkg), ...prev]);
  }

  function updatePackage(id: string, updates: Partial<PackageItem>) {
    const normalizedUpdates = {
      ...updates,
      status: updates.status ? normalizeStatus(updates.status) : updates.status,
    };

    setPackages((prev) =>
      prev.map((p) => (p.id === id ? normalizePackage({ ...p, ...normalizedUpdates }) : p))
    );
  }

  function deletePackage(id: string) {
    setPackages((prev) => prev.filter((p) => p.id !== id));
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
