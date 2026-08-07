"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Mock data representing patients
const patients = Array.from({ length: 100 }).map((_, i) => ({
  id: i,
  x: Math.random() * 100, // Demographics / proxy feature
  y: Math.random() * 100, // True Risk
  tested: i < 50, // Top 50 are tested, rest are untested marginalized
  isHighRisk: Math.random() > 0.6
}));

export default function ProxySlcdScatter() {
  const [slcdEnabled, setSlcdEnabled] = useState(false);

  return (
    <div className="w-full h-full flex flex-col p-4 text-white">
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-semibold text-lg">Revealing the Invisible Cohort</h4>
        <button 
          onClick={() => setSlcdEnabled(!slcdEnabled)}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            slcdEnabled ? 'bg-teal-600 hover:bg-teal-500' : 'bg-slate-700 hover:bg-slate-600'
          }`}
        >
          {slcdEnabled ? 'Proxy-SLCD: ON' : 'Proxy-SLCD: OFF'}
        </button>
      </div>

      <div className="flex-1 relative bg-slate-950 rounded-lg overflow-hidden border border-slate-800">
        <AnimatePresence>
          {patients.map((p) => {
            // If SLCD is off, only show tested patients
            if (!slcdEnabled && !p.tested) return null;

            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ duration: 0.5, type: "spring" }}
                style={{
                  position: 'absolute',
                  left: `${p.x}%`,
                  bottom: `${p.y}%`,
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: p.tested ? '#3b82f6' : '#ef4444', // Blue for tested, Red for invisible
                  boxShadow: p.tested ? '0 0 8px #3b82f6' : '0 0 8px #ef4444'
                }}
              />
            );
          })}
        </AnimatePresence>
      </div>
      <div className="mt-4 flex gap-4 text-sm text-slate-400">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]"></div>
          Tested Patients (Visible)
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]"></div>
          Untested Marginalized (Invisible without SLCD)
        </div>
      </div>
    </div>
  );
}
