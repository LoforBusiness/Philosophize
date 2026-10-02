// THE WIDGET'S COLOURS — after Pixel Weather's Material 3 Expressive widgets.
//
// ZERO IMPORTS (check:widget and the contact sheet load it in plain Node).
//
// The owner chose this direction from three mocks (2026-10-02): one deep container,
// the streak as the hero number where Weather puts the temperature, and lighter
// rounded pills inside it for the week and the fact. No illustration. The tones are
// the app's own DEEP (#2A4343) taken toward black for the container and toward white
// for the type, so the widget is the app's colour on a home screen; the streak's
// ember is the one warm spark, as everywhere else in the app (§7).

const hex2 = (n: number) => Math.round(n).toString(16).padStart(2, '0');
const rgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
export function mix(a: string, b: string, t: number): string {
  const A = rgb(a), B = rgb(b);
  return `#${hex2(A[0] + (B[0] - A[0]) * t)}${hex2(A[1] + (B[1] - A[1]) * t)}${hex2(A[2] + (B[2] - A[2]) * t)}`.toUpperCase();
}
const lin = (c: number) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const lum = (h: string) => { const [r, g, b] = rgb(h); return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b); };
export const contrast = (a: string, b: string) => { const [x, y] = [lum(a), lum(b)]; return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };

const DEEP = '#2A4343';
export const W = {
  /** The container. */
  bg: mix(DEEP, '#000000', 0.42),
  /** A pill inside it. */
  pill: mix(DEEP, '#000000', 0.18),
  /** Type. */
  on: mix(DEEP, '#FFFFFF', 0.9),
  /** Quieter type. */
  soft: mix(DEEP, '#FFFFFF', 0.64),
  /** A day not studied, or still to come. */
  faint: mix(DEEP, '#FFFFFF', 0.24),
  /** The streak's spark: a studied day, the flame. */
  ember: '#D35E36',
  /** The status when the streak ends tonight: the ember, lifted to read as type. */
  risk: '#FFB49A',
  /** Done today. */
  done: '#9ED9B0',
  /** A rest day. */
  rest: '#B9C6E8',
  /** A streak of nothing: the flame goes grey. */
  out: '#8A9297',
} as const;

/** A subject's hue, lifted until it reads as a mark on a pill (3:1). */
export function markFor(hue: string, ground: string = W.pill, floor = 3): string {
  for (let t = 0.3; t <= 1.0001; t += 0.05) {
    const c = mix(hue, '#FFFFFF', t);
    if (contrast(c, ground) >= floor) return c;
  }
  return '#FFFFFF';
}

/** The status row's colour for each tone. */
export const STATUS_COLOR: Record<string, string> = {
  calm: W.on, risk: W.risk, done: W.done, rest: W.rest, lapsed: W.on,
};
/** The status row's mark for each tone. */
export const STATUS_ICON: Record<string, 'play' | 'flame' | 'check' | 'rest'> = {
  calm: 'play', risk: 'flame', done: 'check', rest: 'rest', lapsed: 'play',
};
