import { PackageItem, User } from "./types";

const PACKAGES_KEY = "intertrack_packages_v2";
const SESSION_KEY = "intertrack_session_v2";

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

