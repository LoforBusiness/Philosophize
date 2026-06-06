import { Dimensions } from 'react-native';

/* -------------------------------------------------------------------------- *
 *  Shared kit for the snow-walk story scene: dimensions, the cream-paper /
 *  ink / watercolour palette, hand-drawn path helpers, and the watercolour
 *  displacement filter. Imported by both PaintScene (the visual engine) and
 *  SnowWalkStory (the dialogue/question shell).
 * -------------------------------------------------------------------------- */

export const SW = Dimensions.get('window').width;
export const SH = Dimensions.get('window').height;
export const HZN = Math.round(SH * 0.6); // low horizon → big empty cream sky above
export const FOOT_Y = Math.round(SH * 0.78); // ground line the walkers stand on
export const M1_X = Math.round(SW * 0.3);
export const M2_X = Math.round(SW * 0.3 + 42);

// Cream-paper / ink / watercolour palette.
export const PAPER = '#F6F0E2';
export const PAPER_HI = '#FBF7EE';
export const PAPER_MID = '#E7DECB';
export const SNOW_BLUE = '#C9D6DC';
export const HAZE_BLUE = '#AEC2CC';
export const SAGE = '#B7C2B0';
export const OCHRE = '#E6B66A';
export const OCHRE_DEEP = '#D89A52';
export const TERRA = '#C98B5E';
export const TAUPE = '#6E635A';
export const INK = '#3A332B';
export const INK_SEPIA = '#5A4A3C';
export const FLAKE = '#8C9AA0';
// dusk grade target (cool blue the scene drifts toward as the walk goes on)
export const DUSK = '#5B6B86';

export const absoluteFill = { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 } as const;

// deterministic pseudo-random — stable across renders for a given input
export const rand = (n: number) => {
  const x = Math.sin(n * 127.1 + 0.5) * 43758.5453;
  return x - Math.floor(x);
};
export const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

// A wobbly, hand-drawn open path through `pts` using Catmull-Rom → bezier.
export function roughPath(pts: [number, number][], seed: number, jitter = 2.4): string {
  if (pts.length < 2) return '';
  const P = pts.map(([x, y], i): [number, number] => [
    x + (rand(seed + i * 2) - 0.5) * 2 * jitter,
    y + (rand(seed + i * 2 + 1) - 0.5) * 2 * jitter,
  ]);
  const f = (n: number) => n.toFixed(1);
  let d = `M ${f(P[0][0])} ${f(P[0][1])}`;
  for (let i = 0; i < P.length - 1; i++) {
    const p0 = P[i - 1] ?? P[i];
    const p1 = P[i];
    const p2 = P[i + 1];
    const p3 = P[i + 2] ?? p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${f(c1x)} ${f(c1y)} ${f(c2x)} ${f(c2y)} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d;
}

// 3 boil variants of a rough path (same points, different jitter seed).
export function boilVariants(pts: [number, number][], seed: number, jitter = 2.4): string[] {
  return [0, 1, 2].map((v) => roughPath(pts, seed + v * 1000, jitter));
}
