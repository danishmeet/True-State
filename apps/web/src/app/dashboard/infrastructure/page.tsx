"use client";

import React, { useEffect, useState } from "react";
import { Server, Wifi } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid,
} from "recharts";
import MetricCard from "@/components/ui/MetricCard";
import StatusBadge from "@/components/ui/StatusBadge";
import FHIRStreamMonitor from "@/components/infrastructure/FHIRStreamMonitor";
import FeatureStoreStatus from "@/components/infrastructure/FeatureStoreStatus";
import type { InfrastructureData } from "@/lib/types";

export default function InfrastructurePage() {
  const [data, setData] = useState<InfrastructureData | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/v1/infrastructure");
        const json = await res.json();
        if (json.success) setData(json.data);
      } catch (err) {
        console.error(err);
      }
    }
    void load();
  }, []);

  if (!data) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const healthyCount = data.services.filter((s) => s.status === "healthy").length;
  const avgLatency = Math.round(
    data.services.reduce((a, s) => a + s.latencyMs, 0) / data.services.length
  );
  const errorCount = data.fhirEvents.filter((e) => e.status === "error").length;

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Server className="text-emerald-400" size={24} />
          Infrastructure Health
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          FHIR R4 ingestion, feature store, and service health monitoring
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="Services Healthy"
          value={`${healthyCount} / ${data.services.length}`}
          trend={healthyCount === data.services.length ? "up" : "down"}
          trendValue={healthyCount === data.services.length ? "All clear" : "Issues detected"}
          icon={<Server size={18} />}
          accentColor={healthyCount === data.services.length ? "emerald" : "amber"}
        />
        <MetricCard
          title="Avg Latency"
          value={`${avgLatency}ms`}
          trend="up"
          trendValue="Within SLA"
          icon={<Wifi size={18} />}
          accentColor="cyan"
        />
        <MetricCard
          title="FHIR Errors"
          value={errorCount}
          subtitle="last 30 events"
          accentColor={errorCount > 2 ? "red" : "emerald"}
        />
        <MetricCard
          title="Cache Hit Rate"
          value={`${Math.round(data.featureStore.cacheHitRate * 100)}%`}
          trend="up"
          trendValue="Optimal"
          accentColor="indigo"
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FHIRStreamMonitor events={data.fhirEvents} />
        <FeatureStoreStatus data={data.featureStore} />
      </div>

      {/* Throughput Chart */}
      <div className="glass-card p-6">
        <h3 className="text-base font-semibold text-white mb-1">
          FHIR Throughput (24h)
        </h3>
        <p className="text-xs text-slate-500 mb-4">Events per second over the last 24 hours</p>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.throughput} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="throughputGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(51,65,85,0.3)" />
              <XAxis
                dataKey="time" tick={{ fontSize: 10, fill: "#64748b" }}
                axisLine={false} tickLine={false} interval={3}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#64748b" }}
                axisLine={false} tickLine={false}
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
                type="monotone" dataKey="eventsPerSec" name="Events/sec"
                stroke="#06b6d4" strokeWidth={2} fill="url(#throughputGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Service Health Grid */}
      <div>
        <h3 className="text-base font-semibold text-white mb-4">
          Service Health
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.services.map((svc) => (
            <div
              key={svc.name}
              className="glass-card p-4 flex items-center justify-between"
            >
              <div>
                <div className="text-sm font-medium text-white">{svc.name}</div>
                <div className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                  <span>{svc.uptime}% uptime</span>
                  <span>•</span>
                  <span>{svc.latencyMs}ms</span>
                </div>
              </div>
              <StatusBadge
                status={svc.status === "healthy" ? "healthy" : svc.status === "degraded" ? "warning" : "critical"}
                label={svc.status}
                size="sm"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
