import React from "react";
import { cn } from "./cn";

type BadgeVariant = "pending" | "available" | "collected";

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

const variants: Record<BadgeVariant, string> = {
  pending: "bg-amber-100 text-amber-700",
  available: "bg-emerald-100 text-emerald-700",
  collected: "bg-slate-200 text-slate-600",
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
