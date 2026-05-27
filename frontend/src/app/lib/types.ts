export type UserTipo = "aluno" | "funcionario";

export type UserRole = "student" | "staff" | "admin" | "aluno" | "funcionario";

export type User = {
  id: string;
  nome?: string;
  ra?: string;
  tipo?: UserTipo;
  // optional fields used by auth/register components
  username?: string;
  password?: string;
  role?: UserRole;
  contato?: string;
  name?: string;
};

export type PackageStatus =
  | "disponivel"
  | "entregue"
  | "pending"
  | "available"
  | "collected";

export type PackageItem = {
  id: string;
  // portuguese fields
  codigo?: string;
  aluno?: string;
  ra?: string;
  dataChegada?: string;
  dataRetirada?: string;
  responsavelRegistro?: string;
  // english fields used by some components
  studentName?: string;
  code?: string;
  protocol?: string;
  description?: string;
  createdAt?: string;
  availableAt?: string;
  collectedAt?: string;
  collectedBy?: string;
  collectedByRa?: string;
  // common
  status: PackageStatus;
};
