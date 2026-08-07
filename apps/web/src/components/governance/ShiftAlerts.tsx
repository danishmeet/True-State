"use client";

import React from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from "recharts";
import type { ShiftAlert } from "@/lib/types";

interface ShiftAlertsProps {
  data: ShiftAlert[];
}

export default function ShiftAlerts({ data }: ShiftAlertsProps) {
  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-white">
            Distribution Shift Monitor
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            KL Divergence over 30 days — threshold at 0.15
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-emerald-400 rounded-full" />
            OPIL Drift
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-cyan-400 rounded-full" />
            SLCD Drift
          </span>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="klGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="opilGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(51,65,85,0.3)" />
            <XAxis
              dataKey="day" tick={{ fontSize: 10, fill: "#64748b" }}
              axisLine={false} tickLine={false} interval={4}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#64748b" }}
              axisLine={false} tickLine={false}
              domain={[0, 0.35]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(15,23,42,0.95)",
                border: "1px solid rgba(51,65,85,0.5)",
                borderRadius: 12,
                fontSize: 12,
              }}
            />
            <ReferenceLine
              y={0.15} stroke="#ef4444" strokeDasharray="6 3"
              label={{ value: "Threshold", fill: "#ef4444", fontSize: 10, position: "right" }}
            />
            <Area
              type="monotone" dataKey="opilDrift" name="OPIL Drift"
              stroke="#10b981" strokeWidth={2} fill="url(#klGrad)"
            />
            <Area
              type="monotone" dataKey="slcdDrift" name="SLCD Drift"
              stroke="#06b6d4" strokeWidth={2} fill="url(#opilGrad)"
            />
            <Area
              type="monotone" dataKey="klDivergence" name="Total KL"
              stroke="#f59e0b" strokeWidth={1.5} fill="none" strokeDasharray="4 2"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
