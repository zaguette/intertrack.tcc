import { PackageItem, User } from "./types";

const PACKAGES_KEY = "unasp_mail_packages";
const USERS_KEY = "unasp_mail_users";
const SESSION_KEY = "unasp_mail_session";

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

export function getStoredUsers(): User[] {
  const raw = localStorage.getItem(USERS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as User[];
  } catch {
    return [];
  }
}

export function saveUsers(users: User[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
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
