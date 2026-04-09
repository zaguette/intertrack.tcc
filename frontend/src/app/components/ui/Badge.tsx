import React from "react";
import { cn } from "./cn";

type BadgeVariant = "pending" | "available" | "collected";

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

const variants: Record<BadgeVariant, string> = {
  pending: "bg-amber-500/15 text-amber-600",
  available: "bg-emerald-500/15 text-emerald-600",
  collected: "bg-slate-500/15 text-[var(--muted-text)]",
};

export function Badge({ variant = "pending", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
