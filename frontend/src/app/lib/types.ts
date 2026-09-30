export type UserTipo = "aluno" | "funcionario";

export type UserRole = "student" | "staff" | "admin" | "aluno" | "funcionario";

export type User = {
  id: string;
  nome?: string;
  email?: string;
  ra?: string;
  nomesAlternativos?: string[];
  tipo?: UserTipo;
  cargo?: string; // "administrador" | "supervisor" | "recebimento" | "porteiro" (vem da API)
  // optional fields used by auth/register components
  username?: string;
  password?: string;
  role?: UserRole;
  contato?: string;
  name?: string;
};

export type PackageStatus =
  | "pendente"
  | "retirado"
  | "disponivel"
  | "entregue"
  | "pending"
  | "available"
  | "collected";

export type PackageItem = {
  id: string;
  // portuguese fields
  codigo?: string;
  destinatario?: string;
  aluno?: string;
  ra?: string;
  dataChegada?: string;
  horarioChegada?: string;
  dataRetirada?: string;
  horarioRetirada?: string;
  retiradoPor?: string;
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
  history?: { id: string; status: string; createdAt?: string }[];
  // common
  status: PackageStatus;
};

export type AppNotification = {
  id: string;
  message: string;
  packageId: string;
  createdAt: string;
};

export type RegisterPayload = {
  nome: string;
  ra: string;
  email: string;
  senha: string;
  contato?: string;
};