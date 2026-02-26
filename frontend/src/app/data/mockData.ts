import { PackageItem, User } from "../lib/types";

export const mockUsers: User[] = [
  { id: "1", nome: "João Silva", ra: "123456", tipo: "aluno" },
  { id: "2", nome: "Maria Santos", ra: "admin", tipo: "funcionario" },
];

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
    status: "em_separacao",
  },
  {
    id: "enc-003",
    codigo: "ENC-2024-003",
    aluno: "João Silva",
    ra: "123456",
    dataChegada: "2024-02-15",
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
    status: "em_separacao",
  },
  {
    id: "enc-006",
    codigo: "ENC-2024-006",
    aluno: "Ana Santos",
    ra: "345678",
    dataChegada: "2024-02-19",
    status: "entregue",
  },
];

export function authenticateUser(ra: string): User | null {
  if (ra.trim() === "123456") {
    return mockUsers[0];
  }
  if (ra.trim().toLowerCase() === "admin") {
    return mockUsers[1];
  }
  return null;
}
