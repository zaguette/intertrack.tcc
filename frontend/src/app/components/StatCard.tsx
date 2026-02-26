import React from "react";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  iconBg: string;
  className?: string;
}

export function StatCard({ title, value, icon, iconBg, className = "" }: StatCardProps) {
  return (
    <div className={`rounded-2xl bg-white border border-gray-200 p-5 shadow-sm flex items-center gap-4 ${className}`}>
      <div className={`flex h-12 w-12 items-center justify-center rounded-full flex-shrink-0 ${iconBg}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{title}</p>
        <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}
