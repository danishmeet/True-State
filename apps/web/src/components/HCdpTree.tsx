"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const allActions = [
  { id: 'monitor', label: 'Continuous Monitor' },
  { id: 'wait', label: 'Watch & Wait' },
  { id: 'lactate', label: 'Order Lactate Test' },
  { id: 'antibiotics', label: 'Start Empiric Antibiotics' }
];

export default function HCdpTree() {
  const [aiaEnabled, setAiaEnabled] = useState(false);

  // When AIA is enabled, the model requests 'lactate', which shrinks the valid action set to just ['lactate', 'antibiotics'] 
  const validActions = aiaEnabled 
    ? allActions.filter(a => a.id === 'lactate' || a.id === 'antibiotics')
    : allActions;

  return (
    <div className="w-full h-full flex flex-col p-4 text-white">
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-semibold text-lg">Shrinking the Decision Set</h4>
        <button 
          onClick={() => setAiaEnabled(!aiaEnabled)}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            aiaEnabled ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-slate-700 hover:bg-slate-600'
          }`}
        >
          {aiaEnabled ? 'Active Information Acq: ON' : 'H-CDP Base: ON'}
        </button>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center relative">
        <h5 className="text-slate-400 mb-8 font-mono text-sm">
          {aiaEnabled ? 'Action Set after AIA Recommendation' : 'Initial Conformal Action Set'}
        </h5>
        
        <div className="flex flex-wrap gap-4 justify-center max-w-lg">
          <AnimatePresence>
            {validActions.map((action) => (
              <motion.div
                key={action.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.4 }}
                className="px-6 py-4 bg-slate-800 border border-slate-700 rounded-lg shadow-lg flex items-center justify-center text-center font-medium"
              >
                {action.label}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        
        {aiaEnabled && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 text-indigo-400 border border-indigo-900 bg-indigo-950/30 px-4 py-2 rounded-md"
          >
            System confident bounds met by acquiring: <strong>Lactate Test</strong>
          </motion.div>
        )}
      </div>
    </div>
  );
}
