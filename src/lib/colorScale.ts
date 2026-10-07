// Farbstufen wie die bedingte Formatierung im Excel-Blatt „MaßnahmenIdentifizierung":
//   4,6 - 5,0 dunkelgrün | 3,6 - 4,5 hellgrün | 3,0 - 3,5 gelb | 1,0 - 2,9 rot
// Bewertet wird der auf eine Nachkommastelle gerundete (= angezeigte) Wert.
// „nicht bewertbar" bleibt wie in Excel ohne Füllung.

export const SCORE_STEPS = [
  { color: "#00B050", range: "4,6 – 5,0" },
  { color: "#92D050", range: "3,6 – 4,5" },
  { color: "#FFFF00", range: "3,0 – 3,5" },
  { color: "#FF0000", range: "1,0 – 2,9" },
];

export function scoreToColor(value: number | null): string {
  if (value === null || Number.isNaN(value)) return "transparent";
  const r = Math.round(value * 10) / 10;
  if (r >= 4.6) return SCORE_STEPS[0].color;
  if (r >= 3.6) return SCORE_STEPS[1].color;
  if (r >= 3.0) return SCORE_STEPS[2].color;
  return SCORE_STEPS[3].color;
}

export function scoreToTextColor(value: number | null): string {
  return value === null ? "#737373" : "#000000";
}
