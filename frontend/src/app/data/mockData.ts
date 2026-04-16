import { PackageItem, User } from "../lib/types";

type StoredUser = User & {
  senha: string;
  contato: string;
};

const USERS_KEY = "intertrack_users_v1";

export const mockUsers: User[] = [
  { id: "1", nome: "João Silva", ra: "123456", tipo: "aluno" },
  { id: "2", nome: "Maria Santos", ra: "999999", tipo: "funcionario" },
];

function getStoredUsers(): StoredUser[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(USERS_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as StoredUser[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveStoredUsers(users: StoredUser[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export const mockPackages: PackageItem[] = [
  {
    id: "enc-001",
    codigo: "ENC-2024-001",
    aluno: "João Silva",
    ra: "123456",
    dataChegada: "2024-02-20",
    status: "disponivel",
  },
  {
    id: "enc-002",
    codigo: "ENC-2024-002",
    aluno: "João Silva",
    ra: "123456",
    dataChegada: "2024-02-22",
    status: "disponivel",
  },
  {
    id: "enc-003",
    codigo: "ENC-2024-003",
    aluno: "João Silva",
    ra: "123456",
    dataChegada: "2024-02-15",
    dataRetirada: "2024-02-18",
    responsavelRegistro: "Maria Santos",
    collectedAt: "2024-02-18T14:35:00.000Z",
    collectedBy: "Maria Santos",
    status: "entregue",
  },
  {
    id: "enc-004",
    codigo: "ENC-2024-004",
    aluno: "Maria Oliveira",
    ra: "654321",
    dataChegada: "2024-02-23",
    status: "disponivel",
  },
  {
    id: "enc-005",
    codigo: "ENC-2024-005",
    aluno: "Pedro Costa",
    ra: "789012",
    dataChegada: "2024-02-24",
    status: "disponivel",
  },
  {
    id: "enc-006",
    codigo: "ENC-2024-006",
    aluno: "Ana Santos",
    ra: "345678",
    dataChegada: "2024-02-19",
    dataRetirada: "2024-02-21",
    responsavelRegistro: "Maria Santos",
    collectedAt: "2024-02-21T16:10:00.000Z",
    collectedBy: "Maria Santos",
    status: "entregue",
  },
];

export function authenticateUser(ra: string, password: string): User | null {
  const normalizedRa = ra.trim();

  if (normalizedRa === "123456") {
    return mockUsers[0];
  }
  if (normalizedRa === "999999") {
    return mockUsers[1];
  }

  const storedUsers = getStoredUsers();
  const found = storedUsers.find((user) => user.ra === normalizedRa);
  if (!found) return null;
  if (found.senha !== password) return null;

  return {
    id: found.id,
    nome: found.nome,
    ra: found.ra,
    tipo: found.tipo,
  };

}

export function registerUser(payload: {
  nome: string;
  ra: string;
  contato: string;
  senha: string;
}) {
  const normalizedRa = payload.ra.trim();
  const normalizedName = payload.nome.trim();
  const normalizedContact = payload.contato.trim();

  if (!normalizedName || !normalizedRa || !payload.senha.trim() || !normalizedContact) {
    return { ok: false, error: "Preencha todos os campos." };
  }

  if (normalizedRa === "123456" || normalizedRa === "999999") {
    return { ok: false, error: "Este RA/usuário já está em uso." };
  }

  const storedUsers = getStoredUsers();
  const alreadyExists = storedUsers.some(
    (user) => user.ra.toLowerCase() === normalizedRa.toLowerCase()
  );

  if (alreadyExists) {
    return { ok: false, error: "Já existe um cadastro com esse RA." };
  }

  const nextUser: StoredUser = {
    id: crypto.randomUUID(),
    nome: normalizedName,
    ra: normalizedRa,
    tipo: "aluno",
    contato: normalizedContact,
    senha: payload.senha,
  };

  saveStoredUsers([nextUser, ...storedUsers]);
  return {
    ok: true,
    user: {
      id: nextUser.id,
      nome: nextUser.nome,
      ra: nextUser.ra,
      tipo: nextUser.tipo,
    } as User,
  };
}
