import React from "react";
import { cn } from "./cn";
import { PackageStatus } from "../../lib/types";

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: PackageStatus;
};

function mapStatusToVariant(status?: PackageStatus) {
  switch (status) {
    case "pending":
      return "bg-amber-500/15 text-amber-600";
    case "available":
      return "bg-emerald-500/15 text-emerald-600";
    case "collected":
      return "bg-slate-500/15 text-[var(--muted-text)]";
    case "disponivel":
      return "bg-emerald-500/15 text-emerald-600";
    case "entregue":
      return "bg-slate-500/15 text-[var(--muted-text)]";
    default:
      return "bg-amber-500/15 text-amber-600";
  }
}

export function Badge({ variant = "pending", className, ...props }: BadgeProps) {
  const cls = mapStatusToVariant(variant as PackageStatus);
  return (
    <span
      className={cn(
        "rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide",
        cls,
        className
      )}
      {...props}
    />
  );
}
