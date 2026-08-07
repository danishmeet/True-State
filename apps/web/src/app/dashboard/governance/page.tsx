"use client";

import React, { useEffect, useState } from "react";
import { Shield, AlertTriangle, CheckCircle, Activity } from "lucide-react";
import MetricCard from "@/components/ui/MetricCard";
import StatusBadge from "@/components/ui/StatusBadge";
import ShiftAlerts from "@/components/governance/ShiftAlerts";
import RootCauseTracer from "@/components/governance/RootCauseTracer";
import FairnessScorecard from "@/components/governance/FairnessScorecard";
import type { GovernanceData } from "@/lib/types";

export default function GovernancePage() {
  const [data, setData] = useState<GovernanceData | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/v1/governance");
        const json = await res.json();
        if (json.success) setData(json.data);
      } catch (err) {
        // silently handle in prototype
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

  const maxKl = Math.max(...data.shiftAlerts.map((s) => s.klDivergence));
  const breaches = data.shiftAlerts.filter((s) => s.klDivergence > s.threshold).length;
  const avgTprGain =
    data.fairnessMetrics.reduce((a, m) => a + (m.tprAfter - m.tprBefore), 0) /
    data.fairnessMetrics.length;

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Shield className="text-emerald-400" size={24} />
            Global Command Center
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time AI integrity monitoring across all clinical models
          </p>
        </div>
        <StatusBadge status={data.overallHealth} label={data.overallHealth} />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="System Health"
          value={data.overallHealth === "healthy" ? "Nominal" : "Alert"}
          trend={data.overallHealth === "healthy" ? "up" : "down"}
          trendValue={data.overallHealth === "healthy" ? "All clear" : "Action needed"}
          icon={<CheckCircle size={18} />}
          accentColor={data.overallHealth === "healthy" ? "emerald" : "amber"}
        />
        <MetricCard
          title="Peak KL Divergence"
          value={maxKl.toFixed(3)}
          trend={maxKl > 0.15 ? "down" : "up"}
          trendValue={maxKl > 0.15 ? "Above threshold" : "Below threshold"}
          icon={<Activity size={18} />}
          accentColor={maxKl > 0.15 ? "red" : "cyan"}
        />
        <MetricCard
          title="Threshold Breaches"
          value={`${breaches} / 30`}
          subtitle="last 30 days"
          icon={<AlertTriangle size={18} />}
          accentColor={breaches > 3 ? "red" : breaches > 0 ? "amber" : "emerald"}
        />
        <MetricCard
          title="Avg TPR Gain (SLCD)"
          value={`+${Math.round(avgTprGain * 100)}%`}
          trend="up"
          trendValue="post-debiasing"
          icon={<Shield size={18} />}
          accentColor="indigo"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ShiftAlerts data={data.shiftAlerts} />
        </div>
        <div>
          <RootCauseTracer data={data.rootCauses} />
        </div>
      </div>

      {/* Fairness */}
      <FairnessScorecard data={data.fairnessMetrics} />
    </div>
  );
}
