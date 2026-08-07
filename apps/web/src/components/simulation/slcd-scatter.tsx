"use client";

import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ZAxis,
  Cell,
  ReferenceArea
} from "recharts";

interface ScatterPoint {
  id: string;
  risk: number;
  testingFrequency: number;
  type: "observed" | "missing";
}

export function SlcdScatterPlot({
  data,
  showMissing = false,
}: {
  data: ScatterPoint[];
  showMissing?: boolean;
}) {
  const visibleData = data.filter((d) => showMissing || d.type === "observed");

  return (
    <div className="w-full h-64 bg-slate-800/20 rounded-xl p-4 border border-slate-700/50 relative">
      <h4 className="text-sm font-semibold text-slate-300 mb-2 text-center">
        Proxy-SLCD: Uncovering Invisible Patients
      </h4>
      <p className="text-xs text-slate-500 text-center mb-4">
        X: True Risk, Y: Testing Frequency
      </p>
      <div className="w-full h-48 relative">
        {showMissing && (
          <div className="absolute top-0 right-0 p-2 bg-rose-500/10 border border-rose-500/30 rounded text-[10px] text-rose-400 font-medium z-10 pointer-events-none">
            High Risk / Untested
          </div>
        )}
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(51, 65, 85, 0.3)" />
            <XAxis
              type="number"
              dataKey="risk"
              name="True Risk"
              domain={[0, 100]}
              stroke="#64748b"
              fontSize={11}
              tickFormatter={(v) => `${v}%`}
            />
            <YAxis
              type="number"
              dataKey="testingFrequency"
              name="Tests per day"
              domain={[0, 10]}
              stroke="#64748b"
              fontSize={11}
            />
            <ZAxis type="number" range={[40, 100]} />
            <Tooltip
              cursor={{ strokeDasharray: "3 3" }}
              contentStyle={{
                backgroundColor: "rgba(15, 23, 42, 0.9)",
                border: "1px solid rgba(51, 65, 85, 0.5)",
                borderRadius: "8px",
                color: "#f1f5f9",
                fontSize: "12px"
              }}
            />
            {showMissing && (
              <ReferenceArea
                x1={60}
                x2={100}
                y1={0}
                y2={3}
                fill="rgba(244, 63, 94, 0.1)"
                strokeOpacity={0}
              />
            )}
            <Scatter name="Patients" data={visibleData} animationDuration={800}>
              {visibleData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.type === "observed" ? "#06b6d4" : "#f43f5e"}
                  opacity={entry.type === "observed" ? 0.6 : 0.9}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
