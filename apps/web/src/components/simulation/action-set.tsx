"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, ArrowRight, CheckCircle2 } from "lucide-react";

interface ActionSetProps {
  initialSet: string[];
  refinedSet?: string[];
  recommendation?: string;
  confidence?: number;
}

export function ActionSetVisualizer({
  initialSet = ["monitor", "order_labs", "treat"],
  refinedSet,
  recommendation,
  confidence,
}: ActionSetProps) {
  const currentSet = refinedSet || initialSet;

  return (
    <div className="w-full h-64 bg-slate-800/20 rounded-xl p-4 border border-slate-700/50 flex flex-col">
      <h4 className="text-sm font-semibold text-slate-300 mb-4 text-center">
        H-CDP Conformal Action Set
      </h4>

      <div className="flex-1 flex flex-col justify-center items-center gap-4">
        {/* Valid Action Set visual */}
        <div className="flex flex-wrap gap-2 justify-center max-w-sm">
          <AnimatePresence mode="popLayout">
            {currentSet.map((action) => (
              <motion.div
                key={action}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8, y: 10 }}
                transition={{ duration: 0.4, type: "spring", bounce: 0.3 }}
                className="px-4 py-2 bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 rounded-lg text-sm font-medium uppercase tracking-wider shadow-[0_0_15px_rgba(99,102,241,0.1)]"
              >
                {action.replace("_", " ")}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Action set size shrinking indicator */}
        <div className="text-xs text-slate-500 flex items-center gap-2 h-6">
          <span className="font-mono">|C(X)| = {currentSet.length}</span>
          {refinedSet && refinedSet.length < initialSet.length && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-emerald-400 flex items-center gap-1"
            >
              <CheckCircle2 size={14} /> Refined Set
            </motion.span>
          )}
        </div>
      </div>

      {/* AIA Recommendation Alert */}
      <div className="h-16 mt-auto">
        <AnimatePresence mode="wait">
          {recommendation && !refinedSet ? (
            <motion.div
              key="rec"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 flex items-start gap-3"
            >
              <AlertCircle className="text-amber-400 shrink-0 mt-0.5" size={16} />
              <div className="text-xs text-amber-200/90 leading-relaxed">
                <span className="font-semibold text-amber-400">AIA EVSI:</span> Ordering{" "}
                <strong className="text-white">{recommendation}</strong> has a{" "}
                {confidence ? Math.round(confidence * 100) : 90}% probability of shrinking the valid action set to a single decision.
              </div>
            </motion.div>
          ) : refinedSet ? (
            <motion.div
              key="done"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3 flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="text-emerald-400" size={16} />
              <div className="text-xs text-emerald-200/90 font-medium">
                Test results processed. Action set refined.
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
