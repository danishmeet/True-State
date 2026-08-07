"use client";

import React from "react";
import { motion } from "framer-motion";
import { FlaskConical, Zap } from "lucide-react";
import type { EVSIRecommendation } from "@/lib/types";

interface AIAPanelProps {
  recommendations: EVSIRecommendation[];
}

export default function AIAPanel({ recommendations }: AIAPanelProps) {
  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-2 mb-1">
        <Zap size={16} className="text-amber-400" />
        <h3 className="text-base font-semibold text-white">
          Active Information Acquisition
        </h3>
      </div>
      <p className="text-xs text-slate-500 mb-5">
        Tests ranked by Expected Value of Sample Information (EVSI)
      </p>

      <div className="space-y-3">
        {recommendations.map((rec, i) => (
          <motion.div
            key={rec.testName}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`p-4 rounded-xl border transition-colors ${
              i === 0
                ? "bg-emerald-500/5 border-emerald-500/20"
                : "bg-slate-800/30 border-slate-700/30"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <FlaskConical size={14} className={i === 0 ? "text-emerald-400" : "text-slate-400"} />
                <span className="text-sm font-medium text-white">
                  {rec.testName}
                </span>
              </div>
              <span className={`text-xs font-mono font-bold ${
                i === 0 ? "text-emerald-400" : "text-slate-400"
              }`}>
                EVSI: {(rec.evsi * 100).toFixed(0)}%
              </span>
            </div>

            {/* Probability Bar */}
            <div className="h-2 bg-slate-800/80 rounded-full overflow-hidden mb-2">
              <motion.div
                className={`h-full rounded-full ${
                  i === 0
                    ? "bg-gradient-to-r from-emerald-500 to-cyan-400"
                    : "bg-gradient-to-r from-slate-500 to-slate-400"
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${rec.resolutionProbability * 100}%` }}
                transition={{ duration: 0.8, delay: 0.2 + i * 0.1 }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>
                Resolution probability: <span className="text-slate-300 font-medium">{Math.round(rec.resolutionProbability * 100)}%</span>
              </span>
              <span>
                Set size: {rec.currentSetSize} → {rec.projectedSetSize}
              </span>
            </div>

            {i === 0 && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-3 text-xs text-emerald-400/80 bg-emerald-500/5 px-3 py-2 rounded-lg border border-emerald-500/10"
              >
                ⚡ Ordering <strong>{rec.testName}</strong> has a {Math.round(rec.resolutionProbability * 100)}% probability of shrinking the valid action set to a single optimal decision.
              </motion.p>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
