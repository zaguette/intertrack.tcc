import { PackageItem, User } from "./types";

export const PACKAGES_KEY = "intertrack_packages_v2";
export const SESSION_KEY = "intertrack_session_v2";
export const USERS_KEY = "intertrack_users_v1";

export function getStoredPackages(): PackageItem[] {
  const raw = localStorage.getItem(PACKAGES_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as PackageItem[];
  } catch {
    return [];
  }
}

export function savePackages(items: PackageItem[]) {
  localStorage.setItem(PACKAGES_KEY, JSON.stringify(items));
}

export function getStoredSession(): User | null {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function saveSession(user: User) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export function getStoredUsers() {
  if (typeof window === "undefined") return [] as any[];
  const raw = localStorage.getItem(USERS_KEY);
  if (!raw) return [] as any[];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [] as any[];
  }
}

export function saveUsers(users: any[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

