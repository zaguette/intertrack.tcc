export type UserRole = "student" | "staff";

export type User = {
  username: string;
  password: string;
  role: UserRole;
  name: string;
};

export type PackageStatus = "pending" | "available" | "collected";

export type PackageItem = {
  id: string;
  studentName: string;
  code: string;
  protocol?: string; // número de protocolo
  description?: string;
  status: PackageStatus;
  createdAt: string;
  availableAt?: string;
  collectedAt?: string;
  collectedBy?: string; // nome de quem retirou
};
