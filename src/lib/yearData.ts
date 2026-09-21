import type { MeasurementResult } from "@/lib/scoring";

function round(v: number | null): number {
  return v === null ? 0 : Number(v.toFixed(2));
}

// Zeilen: Gesamt + je Dimension; Spalten: je Jahr (Säulen nebeneinander)
export function yearBarDimensions(results: MeasurementResult[]) {
  const rows: Record<string, number | string>[] = [{ name: "Gesamt" }];
  for (const r of results) rows[0][String(r.year)] = round(r.overallScore);
  const template = results[results.length - 1];
  template.dimensions.forEach((dim, di) => {
    const row: Record<string, number | string> = { name: dim.name };
    for (const r of results) row[String(r.year)] = round(r.dimensions[di]?.average ?? null);
    rows.push(row);
  });
  return { data: rows, years: results.map((r) => String(r.year)) };
}

// Zeilen: je Kriterium; Spalten: je Jahr
export function yearBarCriteria(results: MeasurementResult[]) {
  const rows: Record<string, number | string>[] = [];
  const template = results[results.length - 1];
  template.dimensions.forEach((dim, di) => {
    dim.criteria.forEach((crit, ci) => {
      const row: Record<string, number | string> = { name: crit.name };
      for (const r of results) {
        row[String(r.year)] = round(r.dimensions[di]?.criteria[ci]?.average ?? null);
      }
      rows.push(row);
    });
  });
  return { data: rows, years: results.map((r) => String(r.year)) };
}
