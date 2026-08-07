"use client";

import React from "react";

interface StatusBadgeProps {
  status: "healthy" | "warning" | "critical" | "degraded" | "down";
  label?: string;
  size?: "sm" | "md";
}

const statusConfig = {
  healthy: { color: "bg-emerald-400", pulse: "status-dot-healthy", text: "text-emerald-400", bg: "bg-emerald-400/10" },
  warning: { color: "bg-amber-400", pulse: "status-dot-warning", text: "text-amber-400", bg: "bg-amber-400/10" },
  critical: { color: "bg-red-400", pulse: "status-dot-critical", text: "text-red-400", bg: "bg-red-400/10" },
  degraded: { color: "bg-amber-400", pulse: "status-dot-warning", text: "text-amber-400", bg: "bg-amber-400/10" },
  down: { color: "bg-red-500", pulse: "status-dot-critical", text: "text-red-400", bg: "bg-red-400/10" },
};

export default function StatusBadge({ status, label, size = "md" }: StatusBadgeProps) {
  const config = statusConfig[status];
  const dotSize = size === "sm" ? "w-2 h-2" : "w-2.5 h-2.5";

  return (
    <span className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full ${config.bg}`}>
      <span className={`${dotSize} rounded-full ${config.color} ${config.pulse}`} />
      {label && (
        <span className={`text-xs font-medium ${config.text} capitalize`}>
          {label ?? status}
        </span>
      )}
    </span>
  );
}
