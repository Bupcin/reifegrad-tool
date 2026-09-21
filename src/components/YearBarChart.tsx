"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// deutlich unterscheidbare Farben, ältestes Jahr zuerst
const YEAR_COLORS = ["#f59e0b", "#075a72", "#16a34a", "#7c3aed", "#dc2626", "#0ea5e9"];

const fmt = (v: unknown) => Number(v).toFixed(2);

export default function YearBarChart({
  data,
  years,
  height = 380,
}: {
  data: Record<string, number | string>[];
  years: string[];
  height?: number;
}) {
  const colors = years.map((_, i) => YEAR_COLORS[i % YEAR_COLORS.length]);
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 20, bottom: 50 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" interval={0} angle={-30} textAnchor="end" tick={{ fontSize: 11 }} />
        <YAxis domain={[0, 5]} />
        <Tooltip formatter={fmt} />
        <Legend verticalAlign="top" />
        {years.map((y, i) => (
          <Bar key={y} dataKey={y} isAnimationActive={false} fill={colors[i]}>
            <LabelList dataKey={y} position="top" formatter={fmt} style={{ fontSize: 10 }} />
          </Bar>
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
