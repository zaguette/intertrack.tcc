import { PackageStatus } from "../lib/types";

interface StatusBadgeProps {
  status: PackageStatus;
  className?: string;
}

const config: Record<PackageStatus, { label: string; className: string }> = {
  em_separacao: {
    label: "Em Separação",
    className: "bg-yellow-100 text-yellow-800 border border-yellow-200",
  },
  disponivel: {
    label: "Disponível",
    className: "bg-green-100 text-green-800 border border-green-200",
  },
  entregue: {
    label: "Entregue",
    className: "bg-blue-100 text-blue-800 border border-blue-200",
  },
};

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const { label, className: cls } = config[status];
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${cls} ${className}`}
    >
      {label}
    </span>
  );
}

export function statusLabel(status: PackageStatus): string {
  return config[status].label;
}
