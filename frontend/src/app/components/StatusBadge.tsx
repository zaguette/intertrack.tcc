import { PackageStatus } from "../lib/types";

interface StatusBadgeProps {
  status: PackageStatus;
  className?: string;
}

const config: Record<string, { label: string; className: string }> = {
  disponivel: {
    label: "Disponível",
    className: "bg-green-100 text-green-800 border border-green-200",
  },
  entregue: {
    label: "Entregue",
    className: "bg-blue-100 text-blue-800 border border-blue-200",
  },
  pending: {
    label: "Aguardando",
    className: "bg-amber-100 text-amber-800 border border-amber-200",
  },
  available: {
    label: "Disponível",
    className: "bg-green-100 text-green-800 border border-green-200",
  },
  collected: {
    label: "Retirada",
    className: "bg-slate-100 text-slate-800 border border-slate-200",
  },
};

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const { label, className: cls } = config[status] ?? { label: String(status), className: "" };
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
