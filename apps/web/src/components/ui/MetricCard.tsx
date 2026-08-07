"use client";

import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  icon?: React.ReactNode;
  accentColor?: "emerald" | "cyan" | "amber" | "red" | "indigo";
}

const accentMap = {
  emerald: {
    border: "border-emerald-500/20",
    iconBg: "bg-emerald-500/10",
    iconText: "text-emerald-400",
    valueBg: "from-emerald-300 to-cyan-300",
  },
  cyan: {
    border: "border-cyan-500/20",
    iconBg: "bg-cyan-500/10",
    iconText: "text-cyan-400",
    valueBg: "from-cyan-300 to-blue-300",
  },
  amber: {
    border: "border-amber-500/20",
    iconBg: "bg-amber-500/10",
    iconText: "text-amber-400",
    valueBg: "from-amber-300 to-orange-300",
  },
  red: {
    border: "border-red-500/20",
    iconBg: "bg-red-500/10",
    iconText: "text-red-400",
    valueBg: "from-red-300 to-rose-300",
  },
  indigo: {
    border: "border-indigo-500/20",
    iconBg: "bg-indigo-500/10",
    iconText: "text-indigo-400",
    valueBg: "from-indigo-300 to-violet-300",
  },
};

export default function MetricCard({
  title,
  value,
  subtitle,
  trend,
  trendValue,
  icon,
  accentColor = "emerald",
}: MetricCardProps) {
  const accent = accentMap[accentColor];

  return (
    <div className={`glass-card p-5 ${accent.border}`}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
          {title}
        </span>
        {icon && (
          <div className={`p-2 rounded-lg ${accent.iconBg}`}>
            <span className={accent.iconText}>{icon}</span>
          </div>
        )}
      </div>

      <div className={`text-3xl font-bold bg-gradient-to-r ${accent.valueBg} bg-clip-text text-transparent`}>
        {value}
      </div>

      <div className="flex items-center gap-2 mt-2">
        {trend && (
          <span
            className={`flex items-center gap-1 text-xs font-medium ${
              trend === "up"
                ? "text-emerald-400"
                : trend === "down"
                ? "text-red-400"
                : "text-slate-400"
            }`}
          >
            {trend === "up" && <TrendingUp size={12} />}
            {trend === "down" && <TrendingDown size={12} />}
            {trend === "neutral" && <Minus size={12} />}
            {trendValue}
          </span>
        )}
        {subtitle && (
          <span className="text-xs text-slate-500">{subtitle}</span>
        )}
      </div>
    </div>
  );
}
