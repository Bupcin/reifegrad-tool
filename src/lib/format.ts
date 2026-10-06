// Einheitliche Zahlenanzeige: eine Nachkommastelle, deutsches Komma (z. B. 2,9)
export function fmt1(v: number | null | undefined, fallback = "–"): string {
  if (v === null || v === undefined || Number.isNaN(v)) return fallback;
  return v.toFixed(1).replace(".", ",");
}
