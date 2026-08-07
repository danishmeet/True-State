"use client";

import React from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import type { FeatureStoreMetrics } from "@/lib/types";

interface FeatureStoreStatusProps {
  data: FeatureStoreMetrics;
}

export default function FeatureStoreStatus({ data }: FeatureStoreStatusProps) {
  const hitPct = Math.round(data.cacheHitRate * 100);

  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDash = (data.cacheHitRate) * circumference;

  return (
    <div className="glass-card p-6">
      <h3 className="text-base font-semibold text-white mb-1">
        Feast Feature Store
      </h3>
      <p className="text-xs text-slate-500 mb-5">
        Cache performance and latency distribution
      </p>

      <div className="grid grid-cols-2 gap-6">
        {/* Cache Hit Gauge */}
        <div className="flex flex-col items-center">
          <div className="relative w-24 h-24">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle
                cx="50" cy="50" r={radius}
                stroke="rgba(51,65,85,0.3)"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="50" cy="50" r={radius}
                stroke="#10b981"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${strokeDash} ${circumference}`}
                style={{
                  transition: "stroke-dasharray 1s ease-out",
                  filter: "drop-shadow(0 0 6px #10b98140)",
                }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-bold text-white">{hitPct}%</span>
              <span className="text-[9px] text-slate-500">hit rate</span>
            </div>
          </div>
          <div className="mt-3 text-center">
            <div className="text-sm font-medium text-slate-300">
              {data.avgLatencyMs}ms avg
            </div>
            <div className="text-[10px] text-slate-500">
              {data.activeFeatures} active features
            </div>
          </div>
        </div>

        {/* Latency Histogram */}
        <div className="h-36">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.latencyHistogram} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(51,65,85,0.2)" />
              <XAxis
                dataKey="bucket" tick={{ fontSize: 9, fill: "#64748b" }}
                axisLine={false} tickLine={false}
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
              <Bar
                dataKey="count" name="Requests"
                fill="#06b6d4" radius={[4, 4, 0, 0]}
                fillOpacity={0.7}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
