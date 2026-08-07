"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface ChartDataPoint {
  time: number;
  baseRisk: number | null;
  opilRisk: number | null;
}

export function IvOpilChart({
  data,
  showOpil = false,
}: {
  data: ChartDataPoint[];
  showOpil?: boolean;
}) {
  return (
    <div className="w-full h-64 bg-slate-800/20 rounded-xl p-4 border border-slate-700/50">
      <h4 className="text-sm font-semibold text-slate-300 mb-4 text-center">
        Risk Score Over Time (Observation Policy Bias)
      </h4>
      <div className="w-full h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(51, 65, 85, 0.3)" vertical={false} />
            <XAxis
              dataKey="time"
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `t+${value}h`}
            />
            <YAxis
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(15, 23, 42, 0.9)",
                border: "1px solid rgba(51, 65, 85, 0.5)",
                borderRadius: "8px",
                color: "#f1f5f9",
              }}
              itemStyle={{ color: "#f1f5f9" }}
            />
            <Legend wrapperStyle={{ fontSize: "12px", color: "#94a3b8" }} />
            <Line
              type="monotone"
              dataKey="baseRisk"
              name="Standard AI (Biased)"
              stroke="#ef4444"
              strokeWidth={2}
              dot={{ r: 3, fill: "#ef4444" }}
              activeDot={{ r: 5 }}
            />
            {showOpil && (
              <Line
                type="monotone"
                dataKey="opilRisk"
                name="TrueState IV-OPIL"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ r: 4, fill: "#10b981" }}
                activeDot={{ r: 6 }}
                strokeDasharray="5 5"
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
