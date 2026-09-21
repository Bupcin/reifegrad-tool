import type { MeasurementResult } from "@/lib/scoring";
import { scoreToColor, scoreToTextColor } from "@/lib/colorScale";

function ScoreCell({ value, bold }: { value: number | null; bold?: boolean }) {
  return (
    <td
      className={`border border-neutral-200 px-3 py-1 text-center text-xs ${bold ? "font-semibold" : "font-medium"}`}
      style={{ backgroundColor: scoreToColor(value), color: scoreToTextColor(value) }}
    >
      {value !== null ? value.toFixed(2) : "nv"}
    </td>
  );
}

function DeltaCell({ from, to, bold }: { from: number | null; to: number | null; bold?: boolean }) {
  if (from === null || to === null) {
    return <td className="border border-neutral-200 px-3 py-1 text-center text-xs text-neutral-400">–</td>;
  }
  const d = to - from;
  const color = d > 0.05 ? "#15803d" : d < -0.05 ? "#b91c1c" : "#737373";
  const arrow = d > 0.05 ? "▲" : d < -0.05 ? "▼" : "▬";
  return (
    <td
      className={`border border-neutral-200 px-3 py-1 text-center text-xs ${bold ? "font-semibold" : ""}`}
      style={{ color }}
    >
      {arrow} {d > 0 ? "+" : ""}
      {d.toFixed(2)}
    </td>
  );
}

// Jahre nebeneinander; Veränderung = letztes Jahr gegenüber dem davor liegenden.
export default function YearCompareTable({ results }: { results: MeasurementResult[] }) {
  if (results.length === 0) return null;
  const last = results[results.length - 1];
  const prev = results.length > 1 ? results[results.length - 2] : null;
  const deltaLabel = prev ? `Veränderung ${prev.year} → ${last.year}` : "";

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-neutral-50 text-left">
            <th className="border border-neutral-200 px-3 py-2">Dimension / Kriterium</th>
            {results.map((r) => (
              <th key={r.measurementId} className="border border-neutral-200 px-3 py-2 text-center">
                {r.year}
              </th>
            ))}
            {prev && (
              <th className="border border-neutral-200 px-3 py-2 text-center text-xs">{deltaLabel}</th>
            )}
          </tr>
        </thead>
        <tbody>
          <tr className="bg-neutral-50">
            <td className="border border-neutral-200 px-3 py-1.5 font-semibold">Gesamtreifegrad</td>
            {results.map((r) => (
              <ScoreCell key={r.measurementId} value={r.overallScore} bold />
            ))}
            {prev && <DeltaCell from={prev.overallScore} to={last.overallScore} bold />}
          </tr>
          {last.dimensions.map((dim, di) => (
            <DimensionRows key={dim.dimensionId} dim={dim} di={di} results={results} prev={prev} last={last} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DimensionRows({
  dim,
  di,
  results,
  prev,
  last,
}: {
  dim: MeasurementResult["dimensions"][number];
  di: number;
  results: MeasurementResult[];
  prev: MeasurementResult | null;
  last: MeasurementResult;
}) {
  return (
    <>
      <tr>
        <td className="border border-neutral-200 px-3 py-1.5 font-medium">
          {dim.order}) {dim.name}
        </td>
        {results.map((r) => (
          <ScoreCell key={r.measurementId} value={r.dimensions[di]?.average ?? null} bold />
        ))}
        {prev && <DeltaCell from={prev.dimensions[di]?.average ?? null} to={last.dimensions[di]?.average ?? null} bold />}
      </tr>
      {dim.criteria.map((c, ci) => (
        <tr key={c.criterionId}>
          <td className="border border-neutral-200 py-1 pl-8 pr-3 text-xs text-neutral-600">{c.name}</td>
          {results.map((r) => (
            <ScoreCell key={r.measurementId} value={r.dimensions[di]?.criteria[ci]?.average ?? null} />
          ))}
          {prev && (
            <DeltaCell
              from={prev.dimensions[di]?.criteria[ci]?.average ?? null}
              to={last.dimensions[di]?.criteria[ci]?.average ?? null}
            />
          )}
        </tr>
      ))}
    </>
  );
}
