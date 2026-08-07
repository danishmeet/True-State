"use client";

import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Eye, Shuffle } from "lucide-react";
import type { RootCause } from "@/lib/types";

interface RootCauseTracerProps {
  data: RootCause[];
}

const iconMap = {
  opil: <Eye size={16} />,
  slcd: <AlertTriangle size={16} />,
  stochastic: <Shuffle size={16} />,
};

const colorMap = {
  opil: { bar: "from-emerald-500 to-emerald-400", text: "text-emerald-400", bg: "bg-emerald-400/10" },
  slcd: { bar: "from-cyan-500 to-cyan-400", text: "text-cyan-400", bg: "bg-cyan-400/10" },
  stochastic: { bar: "from-slate-500 to-slate-400", text: "text-slate-400", bg: "bg-slate-400/10" },
};

export default function RootCauseTracer({ data }: RootCauseTracerProps) {
  return (
    <div className="glass-card p-6">
      <h3 className="text-base font-semibold text-white mb-1">
        Root-Cause Attribution
      </h3>
      <p className="text-xs text-slate-500 mb-6">
        When uncertainty spikes, TrueState traces the cause
      </p>

      <div className="space-y-5">
        {data.map((cause) => {
          const colors = colorMap[cause.type];
          return (
            <div key={cause.type}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`p-1.5 rounded-md ${colors.bg} ${colors.text}`}>
                    {iconMap[cause.type]}
                  </span>
                  <span className="text-sm font-medium text-slate-200">
                    {cause.label}
                  </span>
                </div>
                <span className={`text-lg font-bold ${colors.text}`}>
                  {cause.percentage}%
                </span>
              </div>

              {/* Bar */}
              <div className="h-2.5 bg-slate-800/80 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full bg-gradient-to-r ${colors.bar}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${cause.percentage}%` }}
                  transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                />
              </div>

              <p className="text-[11px] text-slate-500 mt-1.5">
                {cause.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
