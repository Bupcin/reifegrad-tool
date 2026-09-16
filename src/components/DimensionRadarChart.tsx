"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

export interface RadarDatum {
  dimension: string;
  score: number;
}

export default function DimensionRadarChart({ data }: { data: RadarDatum[] }) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <RadarChart data={data} outerRadius="75%">
        <PolarGrid />
        <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 12 }} />
        <PolarRadiusAxis domain={[1, 5]} tickCount={5} tick={{ fontSize: 10 }} />
        <Radar
          name="Reifegrad"
          dataKey="score"
          stroke="#2563eb"
          fill="#2563eb"
          fillOpacity={0.35}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
