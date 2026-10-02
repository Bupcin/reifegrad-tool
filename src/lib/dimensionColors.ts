// Feste Farbe je Dimension (Reihenfolge 1-5 wie im Fragenkatalog), statt
// wertabhängiger Ampelfarbe - für Radar-Unterkategorien und Dimensionsbalken.
export const DIMENSION_COLORS = [
  "#eab308", // 1) Technologie - gelb
  "#2563eb", // 2) Prozessdaten - blau
  "#dc2626", // 3) Prozessqualität - rot
  "#16a34a", // 4) Kundinnen und Kunden - grün
  "#1f2937", // 5) Skills und Kultur - schwarz/dunkelgrau
];

export function dimensionColor(index: number): string {
  return DIMENSION_COLORS[index % DIMENSION_COLORS.length];
}
