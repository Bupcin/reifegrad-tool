"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DIMENSION_COLORS } from "@/lib/dimensionColors";
import { fmt1 } from "@/lib/format";

// Farben aus den Excel-Diagrammen: Ring blau, Digitalisierungsgrad blau, Potential grau
const EXCEL_BLUE = "#1964FF";
const EXCEL_GRAD = "#4472C4";
const EXCEL_POTENTIAL = "#A5A5A5";

const fmt = (v: unknown) => fmt1(Number(v));

export function GaugeDonut({
  value,
  label,
  max = 5,
}: {
  value: number;
  label: string;
  max?: number;
}) {
  const data = [
    { name: "Wert", value },
    { name: "Rest", value: Math.max(0, max - value) },
  ];
  return (
    <div className="relative mx-auto h-52 w-52">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie isAnimationActive={false}
            data={data}
            dataKey="value"
            innerRadius="68%"
            outerRadius="100%"
            startAngle={90}
            endAngle={-270}
            stroke="none"
          >
            <Cell fill={EXCEL_BLUE} />
            <Cell fill="#e5e5e5" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-semibold">{fmt1(value)}</span>
        <span className="text-xs text-neutral-500">{label}</span>
      </div>
    </div>
  );
}

export function GroupStackedChart({
  data,
}: {
  data: { name: string; grad: number; potential: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={380}>
      <BarChart data={data} margin={{ bottom: 10 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" interval={0} angle={-30} textAnchor="end" height={70} tick={{ fontSize: 11 }} />
        <YAxis domain={[0, 5]} />
        <Tooltip formatter={fmt} />
        <Legend verticalAlign="bottom" itemSorter={null} />
        <Bar isAnimationActive={false} dataKey="grad" name="Digitalisierungsgrad" stackId="a" fill={EXCEL_GRAD} />
        <Bar isAnimationActive={false} dataKey="potential" name="Digitalisierungspotential" stackId="a" fill={EXCEL_POTENTIAL} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function DimensionColumnChart({
  data,
  dimensions,
}: {
  data: Record<string, number | string>[];
  dimensions: string[];
}) {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data} margin={{ bottom: 10 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" interval={0} angle={-30} textAnchor="end" height={70} tick={{ fontSize: 11 }} />
        <YAxis domain={[0, 5]} />
        <Tooltip formatter={fmt} />
        <Legend verticalAlign="bottom" itemSorter={null} />
        {dimensions.map((d, i) => (
          <Bar isAnimationActive={false} key={d} dataKey={d} fill={DIMENSION_COLORS[i % DIMENSION_COLORS.length]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
