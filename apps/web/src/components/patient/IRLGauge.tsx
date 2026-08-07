"use client";

import React from "react";

interface IRLGaugeProps {
  alignment: number;
}

export default function IRLGauge({ alignment }: IRLGaugeProps) {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDash = (alignment / 100) * circumference;
  const color =
    alignment >= 80
      ? "#10b981"
      : alignment >= 60
      ? "#f59e0b"
      : "#ef4444";

  return (
    <div className="glass-card p-6 flex flex-col items-center">
      <h3 className="text-sm font-semibold text-white mb-4">
        IRL Reward Alignment
      </h3>

      <div className="relative w-36 h-36">
        <svg viewBox="0 0 140 140" className="w-full h-full -rotate-90">
          <circle
            cx="70" cy="70" r={radius}
            stroke="rgba(51,65,85,0.3)"
            strokeWidth="10"
            fill="none"
          />
          <circle
            cx="70" cy="70" r={radius}
            stroke={color}
            strokeWidth="10"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${strokeDash} ${circumference}`}
            style={{
              transition: "stroke-dasharray 1s ease-out",
              filter: `drop-shadow(0 0 8px ${color}40)`,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-white">{alignment}%</span>
          <span className="text-[10px] text-slate-500 mt-0.5">
            expert match
          </span>
        </div>
      </div>

      <p className="text-xs text-slate-500 mt-4 text-center max-w-[200px]">
        Alignment with historical expert clinician decision trajectories
      </p>
    </div>
  );
}
