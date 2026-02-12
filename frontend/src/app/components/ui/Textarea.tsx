import React from "react";
import { cn } from "./cn";

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
};

export function Textarea({ label, className, ...props }: TextareaProps) {
  return (
    <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
      {label && <span>{label}</span>}
      <textarea
        className={cn(
          "min-h-[96px] rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-unasp-orange focus:outline-none focus:ring-2 focus:ring-orange-200",
          className
        )}
        {...props}
      />
    </label>
  );
}
