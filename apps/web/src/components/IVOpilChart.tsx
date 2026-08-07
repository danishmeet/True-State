"use client";
import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  { time: '0h', patientA: 20, patientB: 20, debiasedA: 20, debiasedB: 20 },
  { time: '4h', patientA: 40, patientB: 25, debiasedA: 30, debiasedB: 30 },
  { time: '8h', patientA: 65, patientB: 30, debiasedA: 40, debiasedB: 40 },
  { time: '12h', patientA: 85, patientB: 35, debiasedA: 55, debiasedB: 55 },
  { time: '16h', patientA: 95, patientB: 45, debiasedA: 65, debiasedB: 65 },
];

export default function IVOpilChart() {
  const [debiased, setDebiased] = useState(false);

  return (
    <div className="w-full h-full flex flex-col p-4 text-white">
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-semibold text-lg">Disentangling Observation Policy</h4>
        <button 
          onClick={() => setDebiased(!debiased)}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            debiased ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-slate-700 hover:bg-slate-600'
          }`}
        >
          {debiased ? 'IV-OPIL: ON' : 'IV-OPIL: OFF'}
        </button>
      </div>
      
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="time" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155' }} />
            <Legend />
            {debiased ? (
              <>
                <Line type="monotone" dataKey="debiasedA" name="Patient A (True Risk)" stroke="#10b981" strokeWidth={3} />
                <Line type="monotone" dataKey="debiasedB" name="Patient B (True Risk)" stroke="#10b981" strokeDasharray="5 5" strokeWidth={3} />
              </>
            ) : (
              <>
                <Line type="monotone" dataKey="patientA" name="Patient A (ICU - High Freq)" stroke="#ef4444" strokeWidth={2} />
                <Line type="monotone" dataKey="patientB" name="Patient B (Ward - Low Freq)" stroke="#3b82f6" strokeWidth={2} />
              </>
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
