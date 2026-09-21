"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const BRAND = "#075a72";
const DIMENSION_COLORS = ["#075a72", "#16a34a", "#d97706", "#dc2626", "#7c3aed"];

const fmt = (v: unknown) => Number(v).toFixed(2);

export function CriteriaRadar({ data }: { data: { name: string; value: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={420}>
      <RadarChart data={data} outerRadius="70%">
        <PolarGrid />
        <PolarAngleAxis dataKey="name" tick={{ fontSize: 11 }} />
        <PolarRadiusAxis domain={[0, 5]} tickCount={6} tick={{ fontSize: 10 }} />
        <Radar isAnimationActive={false} dataKey="value" stroke={BRAND} fill={BRAND} fillOpacity={0.35} />
        <Tooltip formatter={fmt} />
      </RadarChart>
    </ResponsiveContainer>
  );
}

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
            <Cell fill={BRAND} />
            <Cell fill="#e5e5e5" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-semibold">{value.toFixed(2)}</span>
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
      <BarChart data={data} margin={{ bottom: 40 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" interval={0} angle={-30} textAnchor="end" tick={{ fontSize: 11 }} />
        <YAxis domain={[0, 5]} />
        <Tooltip formatter={fmt} />
        <Legend verticalAlign="top" />
        <Bar isAnimationActive={false} dataKey="grad" name="Digitalisierungsgrad" stackId="a" fill={BRAND} />
        <Bar isAnimationActive={false} dataKey="potential" name="Digitalisierungspotential" stackId="a" fill="#d4d4d4" />
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
      <BarChart data={data} margin={{ bottom: 40 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" interval={0} angle={-30} textAnchor="end" tick={{ fontSize: 11 }} />
        <YAxis domain={[0, 5]} />
        <Tooltip formatter={fmt} />
        <Legend verticalAlign="top" />
        {dimensions.map((d, i) => (
          <Bar isAnimationActive={false} key={d} dataKey={d} fill={DIMENSION_COLORS[i % DIMENSION_COLORS.length]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
