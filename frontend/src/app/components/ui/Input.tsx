import React from "react";
import { cn } from "./cn";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export function Input({ label, className, ...props }: InputProps) {
  return (
    <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
      {label && <span>{label}</span>}
      <input
        className={cn(
          "h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus:border-unasp-orange focus:outline-none focus:ring-2 focus:ring-orange-200",
          className
        )}
        {...props}
      />
    </label>
  );
}
