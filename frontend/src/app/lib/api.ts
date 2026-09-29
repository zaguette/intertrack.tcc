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

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_PREFIX}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
        ...((options.headers as Record<string, string>) ?? {}),
      },
    });
  } catch {
    throw new Error("Não foi possível conectar ao servidor.");
  }

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.erro || `Erro ${res.status} ao acessar o servidor.`);
  }

  return data as T;
}

export type ApiLoginResponse = {
  auth: boolean;
  token: string;
  user: {
    id: string;
    nome: string;
    email?: string;
    ra?: string;
    tipo: "aluno" | "funcionario";
    cargo?: string;
  };
};

// O back-end atual só aceita { email, senha } no login.
export async function apiLogin(email: string, senha: string) {
  const data = await request<ApiLoginResponse>("/usuarios/login", {
    method: "POST",
    body: JSON.stringify({ email: email.trim(), senha }),
  });

  if (data.token) await setApiToken(data.token);
  return data;
}

export async function apiRegister(payload: {
  nome: string;
  ra: string;
  email: string;
  senha: string;
  telefone?: string;
}) {
  return request<{ mensagem: string }>("/usuarios/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export type ApiUser = { id: string; ra?: string; nome: string; email: string; ativo?: boolean };

export async function fetchUsers() {
  return request<ApiUser[]>("/usuarios");
}

export async function fetchPackages() {
  return request<any[]>("/encomendas");
}

export async function fetchNotifications() {
  return request<
    {
      id: string;
      mensagem?: string | null;
      created_at: string;
      encomenda?: { id: string; codigo_rastreio?: string | null };
    }[]
  >("/encomendas/notificacoes");
}

export async function createPackage(payload: {
  codigo_rastreio: string;
  destinatario_usuario_id: string;
  status_atual_id: string;
}) {
  return request<any>("/encomendas", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updatePackageStatus(
  id: string,
  statusAtualId: string,
  retiradoPor?: string
) {
  return request<any>(`/encomendas/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({
      status_atual_id: statusAtualId,
      ...(retiradoPor ? { retirado_por: retiradoPor } : {})
    }),
  });
}

export async function deletePackage(id: string) {
  return request<{ mensagem: string }>(`/encomendas/${id}`, { method: "DELETE" });
}

export default {
  fetchPackages,
  fetchNotifications,
  fetchUsers,
  apiLogin,
  apiRegister,
  createPackage,
  updatePackageStatus,
  deletePackage,
  setApiToken,
};