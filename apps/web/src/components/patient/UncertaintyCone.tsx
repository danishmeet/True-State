"use client";

import React from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { TrajectoryPoint } from "@/lib/types";

interface UncertaintyConeProps {
  data: TrajectoryPoint[];
  actionSet: string[];
}

export default function UncertaintyCone({ data, actionSet }: UncertaintyConeProps) {
  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-white">Uncertainty Cone</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Conformal prediction bands — 95% coverage guarantee
          </p>
        </div>
        <div className="flex gap-1.5">
          {actionSet.map((a) => (
            <span
              key={a}
              className="px-3 py-1 rounded-lg text-xs font-semibold bg-indigo-500/15 text-indigo-400 border border-indigo-500/25"
            >
              {a}
            </span>
          ))}
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="coneGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(51,65,85,0.3)" />
            <XAxis
              dataKey="hour" tick={{ fontSize: 10, fill: "#64748b" }}
              axisLine={false} tickLine={false}
              label={{ value: "Hours", position: "insideBottom", offset: -2, fontSize: 10, fill: "#64748b" }}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#64748b" }}
              axisLine={false} tickLine={false}
              domain={[0, 100]}
              label={{ value: "Risk %", angle: -90, position: "insideLeft", fontSize: 10, fill: "#64748b" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(15,23,42,0.95)",
                border: "1px solid rgba(51,65,85,0.5)",
                borderRadius: 12,
                fontSize: 12,
              }}
            />
            <Area
              type="monotone" dataKey="riskUpper" name="Upper Bound"
              stroke="transparent" fill="url(#coneGrad)" fillOpacity={1}
            />
            <Area
              type="monotone" dataKey="riskLower" name="Lower Bound"
              stroke="transparent" fill="var(--ts-bg-primary)" fillOpacity={1}
            />
            <Area
              type="monotone" dataKey="riskMean" name="Risk Estimate"
              stroke="#818cf8" strokeWidth={2.5} fill="none"
              dot={{ r: 2, fill: "#818cf8" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
