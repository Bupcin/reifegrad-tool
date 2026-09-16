"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#2563eb", "#16a34a", "#d97706", "#dc2626", "#7c3aed", "#0891b2"];

export default function YearComparisonChart({
  data,
  series,
}: {
  data: Record<string, number | string>[];
  series: string[];
}) {
  return (
    <ResponsiveContainer width="100%" height={340}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="year" />
        <YAxis domain={[1, 5]} />
        <Tooltip />
        <Legend />
        {series.map((key, i) => (
          <Line
            key={key}
            type="monotone"
            dataKey={key}
            stroke={COLORS[i % COLORS.length]}
            strokeWidth={key === "Gesamt" ? 3 : 1.5}
            connectNulls
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
