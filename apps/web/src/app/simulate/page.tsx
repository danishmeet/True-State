"use client";

import { useState, useEffect } from "react";
import { SimulationController } from "@/components/simulation/controller";
import { Activity } from "lucide-react";
import { IvOpilChart } from "@/components/simulation/iv-opil-chart";
import { SlcdScatterPlot } from "@/components/simulation/slcd-scatter";
import { ActionSetVisualizer } from "@/components/simulation/action-set";

// Mock data generation for visualizations
function generateTimeSeries(baseRisk: number, trueRisk: number) {
  return Array.from({ length: 12 }).map((_, i) => ({
    time: i,
    baseRisk: Math.max(0, Math.min(100, baseRisk * 100 + (Math.random() * 10 - 5))),
    opilRisk: i > 4 ? Math.max(0, Math.min(100, trueRisk * 100 + (Math.random() * 5 - 2.5))) : null,
  }));
}

const scatterData = [
  ...Array.from({ length: 40 }).map((_, i) => ({
    id: `o${i}`,
    risk: Math.random() * 100,
    testingFrequency: Math.random() * 8 + 2,
    type: "observed" as const,
  })),
  ...Array.from({ length: 20 }).map((_, i) => ({
    id: `m${i}`,
    risk: Math.random() * 40 + 60, // High risk
    testingFrequency: Math.random() * 2, // Low testing
    type: "missing" as const,
  })),
];

export default function SimulatePage() {
  const [result, setResult] = useState<any>(null);
  const [showOpil, setShowOpil] = useState(false);
  const [showMissing, setShowMissing] = useState(false);

  // Time series state
  const [timeSeries, setTimeSeries] = useState(() => generateTimeSeries(0.35, 0.78));

  useEffect(() => {
    if (result) {
      // Generate new time series based on result
      const baseRisk = result.base_model?.risk_score || 0.35;
      const trueRisk = result.truestate_model?.final_risk_score || 0.78;
      setTimeSeries(generateTimeSeries(baseRisk, trueRisk));
      
      // Sequence the animations
      setTimeout(() => setShowOpil(true), 500);
      setTimeout(() => setShowMissing(true), 1500);
    } else {
      setShowOpil(false);
      setShowMissing(false);
    }
  }, [result]);

  return (
    <div className="container mx-auto p-4 lg:p-8 max-w-6xl animate-fade-in-up">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Activity className="text-emerald-400" size={24} />
          TrueState Demo: Anatomy of a Decision
        </h1>
        <p className="text-sm text-slate-500 mt-2">
          Select a patient profile to run it through the biased base model and the TrueState debiased pipeline.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Controls and Raw Output */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          <SimulationController onSimulationResult={(data) => setResult(data)} />
          
          <div className="glass-card overflow-hidden flex flex-col flex-1 min-h-[300px]">
            <div className="p-4 border-b border-white/5 bg-white/[0.02]">
              <h3 className="text-sm font-medium text-slate-300 uppercase tracking-wider">Pipeline Output (JSON)</h3>
            </div>
            <div className="p-4 overflow-auto flex-1 bg-slate-900/50">
              {result ? (
                <pre className="text-xs text-emerald-400 font-mono">
                  {JSON.stringify(result, null, 2)}
                </pre>
              ) : (
                <div className="text-sm text-slate-500 flex items-center justify-center h-full border border-dashed border-slate-700/50 rounded-xl">
                  Awaiting simulation
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Right Column: Visualizations */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <IvOpilChart data={timeSeries} showOpil={showOpil} />
            <SlcdScatterPlot data={scatterData} showMissing={showMissing} />
          </div>
          
          <div className="mt-2">
            <ActionSetVisualizer
              initialSet={result?.h_cdp?.initial_action_set || ["monitor", "order_labs", "treat"]}
              refinedSet={showMissing ? result?.h_cdp?.refined_action_set : undefined}
              recommendation={result?.h_cdp?.aia_recommendation}
              confidence={result?.h_cdp?.confidence_bound}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
