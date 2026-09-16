// Farbskala analog zur bedingten Formatierung im Excel-Cockpit:
// 1 = rot (nicht digital) ... 3 = gelb (teilweise) ... 5 = grün (vollständig digital)

function lerp(a: number, b: number, t: number): number {
  return Math.round(a + (b - a) * t);
}

function mix(c1: [number, number, number], c2: [number, number, number], t: number) {
  return `rgb(${lerp(c1[0], c2[0], t)}, ${lerp(c1[1], c2[1], t)}, ${lerp(c1[2], c2[2], t)})`;
}

const RED: [number, number, number] = [220, 38, 38]; // #dc2626
const YELLOW: [number, number, number] = [234, 179, 8]; // #eab308
const GREEN: [number, number, number] = [22, 163, 74]; // #16a34a
const NEUTRAL = "rgb(229, 229, 229)"; // neutral-200, für "nv"

export function scoreToColor(value: number | null): string {
  if (value === null) return NEUTRAL;
  const clamped = Math.min(5, Math.max(1, value));
  if (clamped <= 3) {
    return mix(RED, YELLOW, (clamped - 1) / 2);
  }
  return mix(YELLOW, GREEN, (clamped - 3) / 2);
}

export function scoreToTextColor(value: number | null): string {
  if (value === null) return "rgb(115, 115, 115)"; // neutral-500
  return value < 2.5 ? "#7f1d1d" : value < 4 ? "#713f12" : "#14532d";
}
