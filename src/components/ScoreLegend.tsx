import { SCORE_STEPS } from "@/lib/colorScale";

// Farblegende zu den Bewertungstabellen - steht immer unterhalb der Tabelle.
export default function ScoreLegend() {
  return (
    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-600">
      {SCORE_STEPS.map((s) => (
        <span key={s.color} className="flex items-center gap-1.5">
          <span
            className="inline-block h-3 w-5 rounded-sm border border-neutral-300"
            style={{ backgroundColor: s.color }}
          />
          {s.range}
        </span>
      ))}
      <span className="flex items-center gap-1.5">
        <span className="inline-block h-3 w-5 rounded-sm border border-neutral-300 bg-white" />
        nv = nicht bewertbar
      </span>
    </div>
  );
}
