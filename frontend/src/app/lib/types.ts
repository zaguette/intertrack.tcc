export type UserTipo = "aluno" | "funcionario";

export type User = {
  id: string;
  nome: string;
  ra: string;
  tipo: UserTipo;
};

export type PackageStatus = "em_separacao" | "disponivel" | "entregue";

export type PackageItem = {
  id: string;
  codigo: string;
  aluno: string;
  ra: string;
  dataChegada: string;
  status: PackageStatus;
};
