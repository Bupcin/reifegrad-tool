// Farben je Dimension (Reihenfolge 1-5) exakt aus dem Excel-Cockpit.
// Diagramme und Balken: Serienfarben der Excel-Diagramme.
export const DIMENSION_COLORS = [
  "#FFC000", // 1) Technologie - gelb
  "#FF0000", // 2) Prozessdaten - rot
  "#07262D", // 3) Prozessqualität - dunkel (fast schwarz)
  "#00B050", // 4) Kundinnen und Kunden - grün
  "#1964FF", // 5) Skills und Kultur - blau
];

// Tabellenköpfe im Blatt „Tabellarische Auswertung": starke Farbe für die
// Dimension (und deren Ø-Spalte), helle Farbe für die Kriterien darunter.
export const DIMENSION_HEADER_STRONG = ["#FAC800", "#FF5041", "#07262D", "#28D296", "#1964FF"];
export const DIMENSION_HEADER_LIGHT = ["#FAF0E1", "#FFF0E6", "#D9D9D9", "#E6F5E6", "#EBF5FF"];
// Textfarbe auf der starken Kopffarbe (dunkle Flächen weiß)
export const DIMENSION_HEADER_TEXT = ["#07262D", "#07262D", "#FFFFFF", "#07262D", "#FFFFFF"];

export function dimensionColor(index: number): string {
  return DIMENSION_COLORS[index % DIMENSION_COLORS.length];
}
