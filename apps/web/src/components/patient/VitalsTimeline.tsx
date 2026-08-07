"use client";

import React from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";
import type { VitalPoint } from "@/lib/types";

interface VitalsTimelineProps {
  data: VitalPoint[];
}

export default function VitalsTimeline({ data }: VitalsTimelineProps) {
  const formatted = data.map((v) => ({
    ...v,
    time: new Date(v.timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
  }));

  return (
    <div className="glass-card p-6">
      <h3 className="text-base font-semibold text-white mb-1">
        Vitals Timeline
      </h3>
      <p className="text-xs text-slate-500 mb-4">Last 48 hours</p>

      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={formatted} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(51,65,85,0.3)" />
            <XAxis
              dataKey="time" tick={{ fontSize: 9, fill: "#64748b" }}
              axisLine={false} tickLine={false} interval={7}
            />
            <YAxis
              tick={{ fontSize: 9, fill: "#64748b" }}
              axisLine={false} tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(15,23,42,0.95)",
                border: "1px solid rgba(51,65,85,0.5)",
                borderRadius: 12,
                fontSize: 11,
              }}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Line
              type="monotone" dataKey="hr" name="HR (bpm)"
              stroke="#ef4444" strokeWidth={1.5} dot={false}
            />
            <Line
              type="monotone" dataKey="map" name="MAP (mmHg)"
              stroke="#3b82f6" strokeWidth={1.5} dot={false}
            />
            <Line
              type="monotone" dataKey="spo2" name="SpO₂ (%)"
              stroke="#10b981" strokeWidth={1.5} dot={false}
            />
            <Line
              type="monotone" dataKey="temp" name="Temp (°C)"
              stroke="#f59e0b" strokeWidth={1.5} dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
