import React from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  icon?: React.ReactNode | string;
  className?: string;
}

export default function StatCard({
  title,
  value,
  subtitle,
  trend,
  trendValue,
  icon,
  className = "",
}: StatCardProps) {
  const trendColors = {
    up: "text-success-700 bg-success-100",
    down: "text-danger-700 bg-danger-100",
    neutral: "text-gray-700 bg-gray-100",
  } as const;

  return (
    <div className={`glass rounded-xl sm:rounded-2xl p-4 sm:p-6 ${className}`}>
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <p className="text-xs sm:text-sm font-medium text-gray-600">{title}</p>
          {icon && (
            <div className="text-xl sm:text-2xl flex-shrink-0 ml-2 leading-none">
              {typeof icon === "string" ? icon : icon}
            </div>
          )}
        </div>

        <p className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight break-words">
          {value}
        </p>

        {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}

        {trend && trendValue && (
          <div className="flex items-center">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${trendColors[trend]}`}>
              {trend === "up" && "↑"}
              {trend === "down" && "↓"}
              {trend === "neutral" && "→"}
              <span className="ml-1">{trendValue}</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
