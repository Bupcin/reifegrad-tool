"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import { dimensionColor } from "@/lib/dimensionColors";

export interface CriteriaRadarDatum {
  name: string;
  value: number;
  dimIndex: number;
}

interface AngleTickProps {
  x?: number | string;
  y?: number | string;
  textAnchor?: string;
  payload?: { value: string };
}

function AngleTick(props: AngleTickProps & { colorMap: Map<string, number> }) {
  const { x, y, textAnchor, payload, colorMap } = props;
  if (!payload) return null;
  const color = dimensionColor(colorMap.get(payload.value) ?? 0);
  return (
    <text x={x} y={y} textAnchor={textAnchor as never} fill={color} fontSize={10}>
      {payload.value}
    </text>
  );
}

function ColoredDot(props: { cx?: number | string; cy?: number | string; payload?: CriteriaRadarDatum }) {
  const { cx, cy, payload } = props;
  if (cx === undefined || cy === undefined || !payload) return null;
  return <circle cx={cx} cy={cy} r={4} fill={dimensionColor(payload.dimIndex)} stroke="#fff" strokeWidth={1} />;
}

export default function CriteriaRadarChart({ data }: { data: CriteriaRadarDatum[] }) {
  const colorMap = new Map(data.map((d) => [d.name, d.dimIndex]));

  return (
    <ResponsiveContainer width="100%" height={420}>
      <RadarChart data={data} outerRadius="68%" margin={{ top: 10, right: 50, bottom: 10, left: 50 }}>
        <PolarGrid />
        <PolarAngleAxis
          dataKey="name"
          tick={(props: AngleTickProps) => <AngleTick {...props} colorMap={colorMap} />}
        />
        <PolarRadiusAxis angle={90} domain={[0, 5]} tickCount={6} tick={{ fontSize: 10 }} />
        <Radar
          isAnimationActive={false}
          name="Reifegrad"
          dataKey="value"
          stroke="#1964FF"
          fill="#1964FF"
          fillOpacity={0.25}
          dot={<ColoredDot />}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
