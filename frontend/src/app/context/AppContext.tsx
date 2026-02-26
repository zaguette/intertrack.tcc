import React, { createContext, useContext, useEffect, useState } from "react";
import { authenticateUser, mockPackages } from "../data/mockData";
import {
  clearSession,
  getStoredPackages,
  getStoredSession,
  savePackages,
  saveSession,
} from "../lib/storage";
import { PackageItem, User } from "../lib/types";

interface AppContextType {
  user: User | null;
  packages: PackageItem[];
  login: (ra: string, password: string) => User | null;
  logout: () => void;
  addPackage: (pkg: PackageItem) => void;
  updatePackage: (id: string, updates: Partial<PackageItem>) => void;
  deletePackage: (id: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [packages, setPackages] = useState<PackageItem[]>([]);

  useEffect(() => {
    const storedSession = getStoredSession();
    setUser(storedSession);

    const storedPackages = getStoredPackages();
    if (storedPackages.length === 0) {
      setPackages(mockPackages);
      savePackages(mockPackages);
    } else {
      setPackages(storedPackages);
    }
  }, []);

  useEffect(() => {
    if (packages.length > 0) {
      savePackages(packages);
    }
  }, [packages]);

  function login(ra: string, _password: string): User | null {
    const found = authenticateUser(ra);
    if (!found) return null;
    setUser(found);
    saveSession(found);
    return found;
  }

  function logout() {
    clearSession();
    setUser(null);
  }

  function addPackage(pkg: PackageItem) {
    setPackages((prev) => [pkg, ...prev]);
  }

  function updatePackage(id: string, updates: Partial<PackageItem>) {
    setPackages((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  }

  function deletePackage(id: string) {
    setPackages((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <AppContext.Provider
      value={{ user, packages, login, logout, addPackage, updatePackage, deletePackage }}
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
