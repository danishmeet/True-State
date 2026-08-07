"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Users, Search, ChevronRight } from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import type { Patient } from "@/lib/types";

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const params = new URLSearchParams({ page: "1", pageSize: "50" });
        if (search) params.set("search", search);
        if (statusFilter !== "all") params.set("status", statusFilter);
        const res = await fetch(`/api/v1/patients?${params}`);
        const json = await res.json();
        if (json.success) setPatients(json.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    const timer = setTimeout(() => void load(), 200);
    return () => clearTimeout(timer);
  }, [search, statusFilter]);

  const statusMap: Record<string, "healthy" | "warning" | "critical"> = {
    stable: "healthy",
    deteriorating: "warning",
    critical: "critical",
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Users className="text-emerald-400" size={24} />
          Patient Trajectory Explorer
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          H-CDP conformal action sets and AIA test recommendations
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search patients by name or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition"
          />
        </div>
        <div className="flex gap-1 bg-slate-800/40 rounded-lg p-1">
          {["all", "stable", "deteriorating", "critical"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors capitalize ${
                statusFilter === s
                  ? "bg-emerald-500/15 text-emerald-400"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Patient Table */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {["Patient", "Age/Sex", "Unit", "Risk", "Action Set", "IRL Align", "Status", ""].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {patients.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-5 py-3.5">
                    <div className="text-sm font-medium text-white">{p.name}</div>
                    <div className="text-xs text-slate-500 font-mono">{p.id}</div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-300">
                    {p.age}{p.sex === "M" ? "M" : "F"}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-400">{p.unit}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            p.riskScore > 75 ? "bg-red-400" : p.riskScore > 45 ? "bg-amber-400" : "bg-emerald-400"
                          }`}
                          style={{ width: `${p.riskScore}%` }}
                        />
                      </div>
                      <span className="text-sm font-mono text-slate-300">{p.riskScore}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex gap-1 flex-wrap">
                      {p.conformalSet.map((a) => (
                        <span key={a} className="px-2 py-0.5 rounded text-[10px] font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          {a}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm font-mono text-slate-300">
                    {p.irlAlignment}%
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={statusMap[p.status]} label={p.status} size="sm" />
                  </td>
                  <td className="px-5 py-3.5">
                    <Link
                      href={`/dashboard/patients/${p.id}`}
                      className="p-2 rounded-lg hover:bg-white/5 transition text-slate-400 hover:text-emerald-400 inline-flex"
                    >
                      <ChevronRight size={16} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
