"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Clock, User } from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import UncertaintyCone from "@/components/patient/UncertaintyCone";
import AIAPanel from "@/components/patient/AIAPanel";
import IRLGauge from "@/components/patient/IRLGauge";
import VitalsTimeline from "@/components/patient/VitalsTimeline";
import type { PatientDetail } from "@/lib/types";

export default function PatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<PatientDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/v1/patients/${id}`);
        const json = await res.json();
        if (json.success) {
          setPatient(json.data);
        } else {
          setError(json.error);
        }
      } catch (err) {
        setError(String(err));
      }
    }
    void load();
  }, [id]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <p className="text-red-400 text-sm">{error}</p>
        <Link href="/dashboard/patients" className="text-emerald-400 text-sm hover:underline">
          ← Back to patients
        </Link>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const statusMap: Record<string, "healthy" | "warning" | "critical"> = {
    stable: "healthy",
    deteriorating: "warning",
    critical: "critical",
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/patients"
          className="p-2 rounded-lg hover:bg-white/5 transition text-slate-400 hover:text-white"
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/20 flex items-center justify-center">
              <User size={18} className="text-emerald-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{patient.name}</h1>
              <p className="text-xs text-slate-500 flex items-center gap-2">
                <span className="font-mono">{patient.id}</span>
                <span>•</span>
                <span>{patient.age}{patient.sex}</span>
                <span>•</span>
                <span>{patient.unit}</span>
                <span>•</span>
                <span>{patient.ethnicity}</span>
              </p>
            </div>
          </div>
        </div>
        <StatusBadge status={statusMap[patient.status]} label={patient.status} />
      </div>

      {/* Top Row: Uncertainty Cone + IRL Gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <UncertaintyCone data={patient.trajectory} actionSet={patient.conformalSet} />
        </div>
        <div>
          <IRLGauge alignment={patient.irlAlignment} />
        </div>
      </div>

      {/* Middle Row: AIA Panel + Action History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AIAPanel recommendations={patient.evsiRecommendations} />

        {/* Action History */}
        <div className="glass-card p-6">
          <h3 className="text-base font-semibold text-white mb-1">
            Action Timeline
          </h3>
          <p className="text-xs text-slate-500 mb-5">
            Recent clinical decisions and system recommendations
          </p>

          <div className="space-y-4">
            {patient.actionHistory.map((entry, i) => (
              <div key={i} className="flex items-start gap-3 relative">
                {i < patient.actionHistory.length - 1 && (
                  <div className="absolute left-[11px] top-7 w-px h-full bg-slate-700/50" />
                )}
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                  entry.source === "TrueState AIA"
                    ? "bg-amber-500/15 border border-amber-500/30"
                    : "bg-slate-700/50 border border-slate-600/30"
                }`}>
                  <Clock size={10} className={
                    entry.source === "TrueState AIA" ? "text-amber-400" : "text-slate-400"
                  } />
                </div>
                <div>
                  <div className="text-sm text-white font-medium">{entry.action}</div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                    <span>{entry.time}</span>
                    <span>•</span>
                    <span className={entry.source === "TrueState AIA" ? "text-amber-400" : ""}>
                      {entry.source}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Vitals */}
      <VitalsTimeline data={patient.vitals} />
    </div>
  );
}
