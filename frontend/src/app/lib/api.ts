const API_PREFIX = "/api";
const TOKEN_KEY = "intertrack_api_token";

function getAuthHeader(): Record<string, string> {
  const token = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function setApiToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export async function fetchPackages() {
  const headers: Record<string, string> = { "Content-Type": "application/json", ...getAuthHeader() };
  const res = await fetch(`${API_PREFIX}/encomendas`, { headers });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API error: ${res.status} ${text}`);
  }

  return res.json();
}

export async function apiLogin(email: string, senha: string) {
  const res = await fetch(`${API_PREFIX}/usuarios/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, senha }),
  });

  if (!res.ok) {
    const payload = await res.json().catch(() => ({}));
    throw new Error(payload.erro || "Login failed");
  }

  const data = await res.json();
  // data: { auth: true, token, user }
  if (data.token) await setApiToken(data.token);
  return data;
}

export async function apiRegister(payload: { nome: string; email: string; senha: string; telefone?: string }) {
  const res = await fetch(`${API_PREFIX}/usuarios/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json.erro || "Register failed");
  }

  return res.json();
}

export async function createPackage(pkg: any) {
  const headersCreate: Record<string, string> = { "Content-Type": "application/json", ...getAuthHeader() };
  const res = await fetch(`${API_PREFIX}/encomendas`, {
    method: "POST",
    headers: headersCreate,
    body: JSON.stringify(pkg),
  });

  if (!res.ok) throw new Error("Failed to create package");
  return res.json();
}

export async function updatePackageStatus(id: string, status: string) {
  const headersPatch: Record<string, string> = { "Content-Type": "application/json", ...getAuthHeader() };
  const res = await fetch(`${API_PREFIX}/encomendas/${id}/status`, {
    method: "PATCH",
    headers: headersPatch,
    body: JSON.stringify({ status }),
  });

  if (!res.ok) throw new Error("Failed to update status");
  return res.json();
}

export async function deletePackage(id: string) {
  const headersDel: Record<string, string> = { ...getAuthHeader() };
  const res = await fetch(`${API_PREFIX}/encomendas/${id}`, {
    method: "DELETE",
    headers: headersDel,
  });

  if (!res.ok) throw new Error("Failed to delete");
  return res.json();
}

export default {
  fetchPackages,
  apiLogin,
  apiRegister,
  createPackage,
  updatePackageStatus,
  deletePackage,
  setApiToken,
};
