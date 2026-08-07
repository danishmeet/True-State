"use client";

import React from "react";
import { motion } from "framer-motion";
import { CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import type { FHIREvent } from "@/lib/types";

interface FHIRStreamMonitorProps {
  events: FHIREvent[];
}

const statusIcon = {
  success: <CheckCircle size={12} className="text-emerald-400" />,
  warning: <AlertTriangle size={12} className="text-amber-400" />,
  error: <XCircle size={12} className="text-red-400" />,
};

const statusColor = {
  success: "border-emerald-500/10",
  warning: "border-amber-500/10",
  error: "border-red-500/10",
};

export default function FHIRStreamMonitor({ events }: FHIRStreamMonitorProps) {
  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-white">
            FHIR R4 Stream Monitor
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Live Epic / Oracle incoming data streams
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 status-dot-healthy" />
          <span className="text-xs text-emerald-400 font-medium">LIVE</span>
        </div>
      </div>

      <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
        {events.map((evt, i) => (
          <motion.div
            key={evt.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03 }}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-800/30 border ${statusColor[evt.status]}`}
          >
            {statusIcon[evt.status]}
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
              evt.source === "Epic"
                ? "bg-blue-500/10 text-blue-400"
                : "bg-orange-500/10 text-orange-400"
            }`}>
              {evt.source}
            </span>
            <span className="text-xs text-slate-300 flex-1">
              {evt.resourceType}
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              {evt.latencyMs}ms
            </span>
            <span className="text-[10px] text-slate-600">
              {new Date(evt.timestamp).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false,
              })}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
