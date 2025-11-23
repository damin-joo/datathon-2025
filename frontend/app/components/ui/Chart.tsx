"use client";

import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const dummyData = [
  { month: "Jan", score: 0 },
  { month: "Feb", score: 0 },
  { month: "Mar", score: 0 },
  { month: "Apr", score: 0 },
  { month: "May", score: 0 },
  { month: "Jun", score: 0 },
  { month: "Jul", score: 0 },
];

export default function Chart({ data = dummyData }) {
  return (
    <div className="rounded-2xl bg-white">
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid
              stroke="#e5e7eb"
              strokeDasharray="3 3"
            />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12, fill: "#6b7280" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "#6b7280" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "12px",
                border: "1px solid #e5e7eb",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
            />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#22c55e"
              strokeWidth={3}
              dot={{ r: 4, fill: "#22c55e" }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
