export type UserTipo = "aluno" | "funcionario";

export type User = {
  id: string;
  nome: string;
  ra: string;
  tipo: UserTipo;
};

export type PackageStatus = "disponivel" | "entregue";

export type PackageItem = {
  id: string;
  codigo: string;
  aluno: string;
  ra: string;
  dataChegada: string;
  dataRetirada?: string;
  responsavelRegistro?: string;
  collectedAt?: string;
  collectedBy?: string;
  collectedByRa?: string;
  status: PackageStatus;
};
