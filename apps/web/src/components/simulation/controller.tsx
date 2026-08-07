"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface PatientProfile {
  id: string;
  label: string;
  age: number;
  ses: number;
  obs_freq: number;
  iv_weekend: boolean;
}

export function SimulationController({ onSimulationResult }: { onSimulationResult: (data: any) => void }) {
  const [profiles, setProfiles] = useState<PatientProfile[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadPatients() {
      try {
        const response = await fetch("http://localhost:4000/api/v1/patients");
        if (response.ok) {
          const resJson = await response.json();
          setProfiles(resJson.data);
          if (resJson.data.length > 0) {
            setSelectedProfileId(resJson.data[0].id);
          }
        }
      } catch (error) {
        console.error("Failed to load patients from database", error);
      }
    }
    loadPatients();
  }, []);

  const handleSimulate = async () => {
    setLoading(true);
    const profile = profiles.find((p) => p.id === selectedProfileId);
    if (!profile) return;

    try {
      // Proxy through Express API Gateway (port 4000)
      const response = await fetch("http://localhost:4000/api/v1/inference/simulate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          patient_id: profile.id,
          age: profile.age,
          ses: profile.ses,
          obs_freq: profile.obs_freq,
          iv_weekend: profile.iv_weekend,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        onSimulationResult(data);
      } else {
        console.error("Simulation failed", response.status);
      }
    } catch (error) {
      console.error("Error connecting to Express backend:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white">TrueState Simulator</h3>
        <p className="text-xs text-slate-500 mt-1">Configure and execute the simulation pipeline.</p>
      </div>
      
      <div className="flex flex-col gap-2">
        <label className="text-sm text-slate-400 font-medium">Select Patient Profile</label>
        <select
          value={selectedProfileId}
          onChange={(e) => setSelectedProfileId(e.target.value)}
          className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition"
        >
          {profiles.map((p) => (
            <option key={p.id} value={p.id} className="bg-slate-800 text-white">
              {p.label}
            </option>
          ))}
        </select>
      </div>
      <Button
        onClick={handleSimulate}
        disabled={loading}
        className="w-full py-2.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition-colors"
      >
        {loading ? (
          <span className="flex items-center gap-2 justify-center">
            <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
            Running Models...
          </span>
        ) : (
          "Run Simulation"
        )}
      </Button>
    </div>
  );
}
