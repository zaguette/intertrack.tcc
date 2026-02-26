import React from "react";
import { cn } from "./cn";

type CardProps = React.HTMLAttributes<HTMLDivElement>;

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-white p-5 shadow-soft",
        className
      )}
      {...props}
    />
  );
}
