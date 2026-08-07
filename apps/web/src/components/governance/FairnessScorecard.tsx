"use client";

import React, { useState } from "react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Radar, ResponsiveContainer, Legend, Tooltip,
} from "recharts";
import type { FairnessMetric } from "@/lib/types";

interface FairnessScorecardProps {
  data: FairnessMetric[];
}

export default function FairnessScorecard({ data }: FairnessScorecardProps) {
  const [showDebiased, setShowDebiased] = useState(true);

  const chartData = data.map((m) => ({
    group: m.group,
    "Before SLCD": Math.round(m.tprBefore * 100),
    "After SLCD": Math.round(m.tprAfter * 100),
  }));

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-white">
            Fairness Audit Scorecard
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            True Positive Rate by demographic — before vs. after Proxy-SLCD
          </p>
        </div>
        <button
          onClick={() => setShowDebiased(!showDebiased)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            showDebiased
              ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30"
              : "bg-slate-800 text-slate-400 border border-slate-700"
          }`}
        >
          {showDebiased ? "Showing: Before & After" : "Showing: Before Only"}
        </button>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={chartData}>
            <PolarGrid stroke="rgba(51,65,85,0.4)" />
            <PolarAngleAxis
              dataKey="group"
              tick={{ fontSize: 11, fill: "#94a3b8" }}
            />
            <PolarRadiusAxis
              angle={30} domain={[0, 100]}
              tick={{ fontSize: 9, fill: "#64748b" }}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(15,23,42,0.95)",
                border: "1px solid rgba(51,65,85,0.5)",
                borderRadius: 12,
                fontSize: 12,
              }}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Radar
              name="Before SLCD" dataKey="Before SLCD"
              stroke="#ef4444" fill="#ef444420" strokeWidth={2}
              fillOpacity={0.15}
            />
            {showDebiased && (
              <Radar
                name="After SLCD" dataKey="After SLCD"
                stroke="#06b6d4" fill="#06b6d420" strokeWidth={2}
                fillOpacity={0.2}
              />
            )}
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3 mt-4">
        {[
          { label: "Avg TPR Gain", value: `+${Math.round((data.reduce((a, m) => a + (m.tprAfter - m.tprBefore), 0) / data.length) * 100)}%`, color: "text-emerald-400" },
          { label: "Worst-Group TPR", value: `${Math.round(Math.min(...data.map((m) => m.tprAfter)) * 100)}%`, color: "text-cyan-400" },
          { label: "Coverage", value: `${Math.round((data.reduce((a, m) => a + m.coverage, 0) / data.length) * 100)}%`, color: "text-indigo-400" },
        ].map((s) => (
          <div key={s.label} className="text-center p-2 rounded-lg bg-slate-800/40">
            <div className={`text-lg font-bold ${s.color}`}>{s.value}</div>
            <div className="text-[10px] text-slate-500">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
