// The objects for ranks 25–48 (the Lapis, Crimson, Amethyst and Aurum orders), keyed
// by the rank's glyph name in data/ranks.ts. See components/shared/insigniaObjects.ts
// for the style and the rules. Zero runtime imports.
//
// Within each order of six, neighbours differ in SILHOUETTE and in DOMINANT COLOUR;
// the last six (Aurum) are the richest — gold, a jewel, an outlined white glint.
import {
  P, lit, dark, rect, circ, ell, poly, line, starPath, flame, fill, hi, stroke, type Part,
} from '../insigniaObjects';

type Pt = [number, number];
const RAD = Math.PI / 180;

/** Points along an ellipse from a0 to a1 degrees (y down, so +90 is straight down). */
function arcPts(cx: number, cy: number, rx: number, ry: number, a0: number, a1: number, n = 28, rot = 0): Pt[] {
  const out: Pt[] = [];
  const cr = Math.cos(rot * RAD), sr = Math.sin(rot * RAD);
  for (let i = 0; i <= n; i++) {
    const a = (a0 + ((a1 - a0) * i) / n) * RAD;
    const x = Math.cos(a) * rx, y = Math.sin(a) * ry;
    out.push([cx + x * cr - y * sr, cy + x * sr + y * cr]);
  }
  return out;
}
/** A rotated ellipse, as a closed polygon. */
const ellR = (cx: number, cy: number, rx: number, ry: number, rot: number) =>
  poly(arcPts(cx, cy, rx, ry, 0, 360, 48, rot).slice(0, -1));
/** Rotate points about (cx, cy) by deg (clockwise on screen). */
function rotP(pts: Pt[], cx: number, cy: number, deg: number): Pt[] {
  const c = Math.cos(deg * RAD), s = Math.sin(deg * RAD);
  return pts.map(([x, y]) => [cx + (x - cx) * c - (y - cy) * s, cy + (x - cx) * s + (y - cy) * c]);
}
/** A pointed leaf from its base, along `deg`. */
function leaf(x: number, y: number, deg: number, len: number, w: number): string {
  const dx = Math.cos(deg * RAD), dy = Math.sin(deg * RAD);
  const tx = x + dx * len, ty = y + dy * len;
  const mx = x + dx * len * 0.5, my = y + dy * len * 0.5;
  const f = (v: number) => Math.round(v * 100) / 100;
  return `M${f(x)} ${f(y)} Q${f(mx - dy * w)} ${f(my + dx * w)} ${f(tx)} ${f(ty)}`
    + ` Q${f(mx + dy * w)} ${f(my - dx * w)} ${f(x)} ${f(y)} Z`;
}
/** A four-point glint. On a pale window it needs its outline, so it is a fill. */
const glint = (cx: number, cy: number, r: number): Part => fill(starPath(cx, cy, r, r * 0.3, 4), P.white);
/** Intersections of two circles. */
function meet(c1: Pt, r1: number, c2: Pt, r2: number): [Pt, Pt] {
  const dx = c2[0] - c1[0], dy = c2[1] - c1[1], d = Math.hypot(dx, dy);
  const a = (r1 * r1 - r2 * r2 + d * d) / (2 * d), h = Math.sqrt(r1 * r1 - a * a);
  const mx = c1[0] + (a * dx) / d, my = c1[1] + (a * dy) / d;
  return [[mx + (h * dy) / d, my - (h * dx) / d], [mx - (h * dy) / d, my + (h * dx) / d]];
}
/** The angles from a to b on a circle, going the way that passes `via`. */
function arcVia(c: Pt, r: number, a: number, b: number, via: number, n = 30): Pt[] {
  const m = (v: number) => ((v % 360) + 360) % 360;
  const ccw = m(b - a);
  const span = m(via - a) < ccw ? ccw : ccw - 360;
  return arcPts(c[0], c[1], r, r, a, a + span, n);
}
const ang = (c: Pt, p: Pt) => Math.atan2(p[1] - c[1], p[0] - c[0]) / RAD;
/** A crescent: circle 1 with circle 2 bitten out of it. */
function crescent(c1: Pt, r1: number, c2: Pt, r2: number): string {
  const [p, q] = meet(c1, r1, c2, r2);
  const outer = arcVia(c1, r1, ang(c1, p), ang(c1, q), ang(c2, c1));
  const end = outer[outer.length - 1];
  const inner = arcVia(c2, r2, ang(c2, end), ang(c2, outer[0]), ang(c2, c1));
  return poly([...outer, ...inner.slice(1, -1)]);
}
/**
 * A star struck with a bevel: the whole outline, then every half-arm a facet lit by
 * how much it faces the top-left lamp.
 */
function bevelStar(cx: number, cy: number, pts: Pt[], base: string): Part[] {
  const parts: Part[] = [fill(poly(pts), base)];
  const L: Pt = [-0.6, -0.8];
  for (let i = 0; i < pts.length; i += 2) {
    const tip = pts[i];
    for (const j of [i - 1, i + 1]) {
      const inn = pts[(j + pts.length) % pts.length];
      const mx = (tip[0] + inn[0]) / 2 - cx, my = (tip[1] + inn[1]) / 2 - cy;
      const len = Math.hypot(mx, my) || 1;
      const t = (mx * L[0] + my * L[1]) / len;
      const c = t > 0 ? lit(base, 0.42 * t) : dark(base, 0.3 * -t);
      parts.push(hi(poly([[cx, cy], tip, inn]), c));
    }
  }
  return parts;
}

const SAND = '#DDB676';
const VERD = '#5E9E8E';
const BRICK = '#B85C40';
const MOON = '#F2DC86';
const ORB = '#A98BDB';
const TAWNY = '#A8754A';
const PALETTE_WOOD = '#C99A62';
const FRAME = '#2F6A66';

export const RANK_OBJECTS_B: Record<string, () => Part[]> = {
  // ── LAPIS (25–30) ────────────────────────────────────────────────────────

  // 25 METAPHYSICIAN — a stone pyramid with the sun rising behind its tip.
  pyramid: () => {
    const lx = (y: number) => 48 - ((y - 24) * 34) / 54;
    const rx = (y: number) => 48 + ((y - 24) * 10) / 54;
    const ex = (y: number) => 48 + ((y - 24) * 38) / 54;
    const courses = [40, 54, 66].flatMap((y) => [
      stroke(line([[lx(y), y], [rx(y), y]]), dark(SAND, 0.18), 2, false),
      stroke(line([[rx(y), y], [ex(y), y]]), dark(SAND, 0.45), 2, false),
    ]);
    return [
      fill(circ(48, 30, 18), P.flame),
      hi(circ(46, 28, 11), P.flameHot),
      fill(poly([[48, 24], [86, 78], [14, 78]]), SAND),
      hi(poly([[48, 24], [14, 78], [58, 78]]), lit(SAND, 0.3)),
      hi(poly([[48, 24], [58, 78], [86, 78]]), dark(SAND, 0.3)),
      ...courses,
      fill(rect(10, 76, 80, 8, 4), dark(SAND, 0.42)),
    ];
  },

  // 26 EPISTEMOLOGIST — an armillary sphere: silver rings round a blue globe.
  target: () => [
    fill(ell(50, 82, 17, 5), P.goldDark),
    fill(poly([[44, 80], [56, 80], [53, 66], [47, 66]]), P.gold),
    stroke(poly(arcPts(50, 42, 27, 27, 0, 360, 48).slice(0, -1)), P.steel, 4.2),
    fill(circ(50, 42, 11), P.lapis),
    hi(circ(46.5, 38.5, 5.5), lit(P.lapis, 0.35)),
    stroke(ellR(50, 42, 27, 8, -22), P.silver, 4.2),
    stroke(ellR(50, 42, 27, 11, 30), lit(P.silver, 0.2), 5.5),
    fill(circ(50, 14, 3.5), P.gold),
  ],

  // 27 ONTOLOGIST — a domed observatory, the dome green with weather.
  dome: () => [
    fill(rect(14, 76, 72, 8, 2), P.stoneDark),
    hi(rect(14, 76, 72, 3, 1), P.stone),
    fill(rect(22, 50, 56, 27), P.marble),
    hi(rect(64, 50, 14, 27), dark(P.marble, 0.14)),
    hi(rect(27, 53, 4, 22), dark(P.marble, 0.1)),
    hi('M44 77 V64 A6 6 0 0 1 56 64 V77 Z', dark(P.marble, 0.45)),
    fill(rect(18, 46, 64, 6, 1.5), P.stone),
    hi(rect(18, 49, 64, 3), P.stoneDark),
    stroke(line([[58, 34], [72, 20]]), P.goldDark, 4.5),
    fill('M22 47 A28 26 0 0 1 78 47 Z', VERD),
    hi('M50 21 A28 26 0 0 1 78 47 L50 47 Z', dark(VERD, 0.22)),
    hi('M27 44 A23 21 0 0 1 42 25.5 L40 30 A19 18 0 0 0 31 44 Z', lit(VERD, 0.35)),
    hi(rect(54, 24, 7, 23, 1), dark(VERD, 0.6)),
    fill(circ(50, 19, 3.5), P.gold),
  ],

  // 28 IDEALIST — a drop of water about to land, rings spreading where one fell.
  ripple: () => [
    fill(ell(50, 71, 37, 13), P.sea),
    hi(ell(50, 74, 34, 9), dark(P.sea, 0.18)),
    stroke(ellR(50, 70, 25, 7.5, 0), lit(P.sea, 0.55), 2.6, false),
    stroke(ellR(50, 70, 12, 3.6, 0), lit(P.sea, 0.7), 2.6, false),
    fill(flame(50, 50, 20, 34), P.glass),
    hi(flame(54, 49, 8, 18, 1), dark(P.glass, 0.12)),
    hi(ellR(44.5, 40, 2.6, 5, 15), P.white),
  ],

  // 29 RATIONALIST — brass dividers standing over a red set square.
  infinity: () => [
    fill(poly([[15, 84], [15, 28], [71, 84]]), P.red),
    hi(poly([[15, 28], [20, 36], [20, 80], [15, 84]]), lit(P.red, 0.3)),
    hi(poly([[24, 76], [24, 52], [48, 76]]), P.cream),
    stroke(line([[24, 76], [24, 52], [48, 76]]), dark(P.red, 0.4), 2.2, false),
    fill(poly([[54, 23], [61, 26], [42, 85]]), P.steel),
    fill(poly([[59, 26], [66, 23], [84, 80]]), P.steel),
    hi(poly([[55, 24], [58, 25.5], [43, 82]]), lit(P.steel, 0.4)),
    hi(poly([[62, 24.5], [65, 23.5], [82, 76]]), lit(P.steel, 0.3)),
    fill(rect(56.5, 10, 7, 10, 2), P.gold),
    fill(circ(60, 23, 6.5), P.gold),
    hi(circ(58, 21, 2.6), lit(P.gold, 0.45)),
  ],

  // 30 EMPIRICIST — a glass prism splitting a beam of white light into a rainbow.
  prism: () => {
    const bands = ['#D9483B', '#F08A2E', '#F5CF3A', '#5DAA4E', '#3E7FD0', '#7E5CB0'];
    const a0: Pt = [60, 40], a1: Pt = [64, 48];
    const at = (t: number): Pt => [a0[0] + (a1[0] - a0[0]) * t, a0[1] + (a1[1] - a0[1]) * t];
    const out = (t: number): Pt => [88, 38 + 44 * t];
    return [
      fill(poly([[10, 54], [10, 61], [36, 47], [35, 42]]), P.white),
      fill(poly([a0, out(0), out(1), a1]), bands[0]),
      ...bands.map((c, i) => hi(poly([at(i / 6), out(i / 6), out((i + 1) / 6), at((i + 1) / 6)]), c)),
      fill(poly([[48, 16], [76, 68], [20, 68]]), P.glass),
      hi(poly([[48, 16], [44, 68], [20, 68]]), lit(P.glass, 0.5)),
      hi(poly([[48, 16], [76, 68], [56, 68]]), dark(P.glass, 0.14)),
      hi(poly([[48, 24], [51, 30], [36, 60], [31, 60]]), P.white, 0.8),
    ];
  },

  // ── CRIMSON (31–36) ──────────────────────────────────────────────────────

  // 31 AESTHETE — a painter's palette with its brushes.
  torch: () => [
    stroke(line([[58, 52], [76, 26]]), P.leather, 5),
    stroke(line([[76, 26], [80, 20]]), P.silver, 5.5),
    stroke(line([[80, 20], [83, 15]]), P.lapis, 4.5),
    stroke(line([[66, 56], [86, 38]]), P.woodDark, 4.5),
    stroke(line([[84, 39.5], [88, 36]]), P.red, 4),
    fill('M16 52 C14 34 34 22 54 24 C74 26 88 40 86 56 C84 72 66 82 46 80 C40 79 40 72 34 71 C27 70 17 66 16 52 Z', PALETTE_WOOD),
    hi('M86 56 C84 72 66 82 46 80 C56 76 74 70 80 56 Z', dark(PALETTE_WOOD, 0.22)),
    hi(ell(35, 59, 5, 4), P.cream),
    stroke(line(arcPts(35, 59, 5, 4, 180, 360)), dark(PALETTE_WOOD, 0.5), 2, false),
    hi(circ(32, 41, 6), P.red),
    hi(circ(48, 34, 6), P.gold),
    hi(circ(65, 37, 6), P.lapis),
    hi(circ(74, 53, 5.5), P.white),
    hi(circ(60, 66, 5.5), P.leaf),
    hi(circ(30, 39, 1.8), lit(P.red, 0.6)),
    hi(circ(46, 32, 1.8), lit(P.gold, 0.6)),
    hi(circ(63, 35, 1.8), lit(P.lapis, 0.6)),
  ],

  // 32 POLEMICIST — a speaking trumpet, red with brass, shouting.
  lamp: () => [
    stroke(line([[28, 54], [28, 66], [38, 66], [38, 58]]), P.goldDark, 3.5),
    fill(poly([[17, 42], [64, 22], [64, 74], [17, 54]]), P.red),
    hi(poly([[19, 43], [62, 25], [62, 33], [19, 46.5]]), lit(P.red, 0.3)),
    hi(poly([[19, 51], [62, 64], [62, 72], [19, 53.5]]), dark(P.red, 0.25)),
    hi(poly([[38, 33.1], [42, 31.4], [42, 64.6], [38, 62.9]]), P.gold),
    fill(rect(10, 43, 9, 10, 2.5), P.gold),
    fill(ell(65, 48, 8, 27), P.gold),
    hi(ell(66.5, 48, 4.8, 22.5), dark(P.goldDark, 0.45)),
    stroke(line(arcPts(64, 48, 17, 17, -38, 38, 16)), P.ink, 3, false),
    stroke(line(arcPts(64, 48, 24, 24, -32, 32, 16)), P.ink, 3, false),
  ],

  // 33 ICONOCLAST — a marble bust, a hammer cracking its head, chips flying.
  shieldcross: () => {
    const cx = 40, cy = 38, rx = 14, ry = 17;
    const hair: Pt[] = [...arcPts(cx, cy, rx, ry, 196, 344, 20)];
    for (let i = 0; i <= 10; i++) {
      const x = cx + 13.4 - (i * 26.8) / 10;
      hair.push([x, 29 + (i % 2 ? 2.4 : 0)]);
    }
    const hc: Pt = [67, 30];
    const u: Pt = [Math.cos(160 * RAD), Math.sin(160 * RAD)];
    const v: Pt = [Math.cos(70 * RAD), Math.sin(70 * RAD)];
    const corner = (a: number, b: number): Pt => [hc[0] + u[0] * a + v[0] * b, hc[1] + u[1] * a + v[1] * b];
    return [
      fill(rect(20, 76, 40, 9, 2), P.stoneDark),
      hi(rect(20, 76, 40, 3), P.stone),
      fill('M12 78 C12 63 26 59 40 59 C54 59 68 63 68 78 Z', P.marble),
      hi('M48 60 C58 62 68 66 68 78 L52 78 Z', dark(P.marble, 0.15)),
      fill(rect(34, 50, 12, 12), P.marble),
      hi(rect(34, 54, 12, 5), dark(P.marble, 0.18)),
      fill(ell(cx, cy, rx, ry), P.marble),
      hi(poly(arcPts(cx, cy, rx, ry, -60, 60, 16).concat([[cx + 6, cy + 10], [cx + 7, cy - 10]])), dark(P.marble, 0.12)),
      hi(poly(hair), dark(P.marble, 0.22)),
      hi(ell(35, 40, 3, 1.8), dark(P.marble, 0.42)),
      hi(ell(45, 40, 3, 1.8), dark(P.marble, 0.42)),
      hi(poly([[39.5, 38], [42.5, 47], [37.5, 47]]), dark(P.marble, 0.22)),
      hi(rect(36.5, 50, 7, 1.8, 0.9), dark(P.marble, 0.38)),
      stroke(line([[55, 34], [50, 31], [52.5, 26.5], [46, 22.5]]), P.ink, 2.6, false),
      stroke(line([[50, 31], [45, 34.5]]), P.ink, 2.2, false),
      fill(poly([[54, 14], [59, 12], [58, 18]]), P.marble),
      fill(poly([[62, 19], [66, 17], [65, 22]]), P.marble),
      stroke(line([hc, [hc[0] + v[0] * 46, hc[1] + v[1] * 46]]), P.wood, 5.5),
      fill(poly([corner(11, -5.5), corner(-11, -5.5), corner(-11, 5.5), corner(11, 5.5)]), P.iron),
      hi(poly([corner(11, -5.5), corner(-11, -5.5), corner(-11, -1.5), corner(11, -1.5)]), lit(P.iron, 0.35)),
    ];
  },

  // 34 HERETIC — an iron gate standing open between brick posts.
  gate: () => {
    const leafL = (x0: number, x1: number) => {
      const top = (x: number) => 36 + ((x - x0) * 6) / (x1 - x0);
      const bot = (x: number) => 80 - ((x - x0) * 4) / (x1 - x0);
      const xs = [x0 + (x1 - x0) / 3, x0 + (2 * (x1 - x0)) / 3];
      return [
        stroke(poly([[x0, top(x0)], [x1, top(x1)], [x1, bot(x1)], [x0, bot(x0)]]), P.iron, 3),
        ...xs.map((x) => stroke(line([[x, top(x)], [x, bot(x)]]), P.iron, 2.6)),
      ];
    };
    return [
      fill(poly([[12, 86], [88, 86], [80, 62], [20, 62]]), P.leaf),
      hi(poly([[38, 86], [62, 86], [54, 62], [46, 62]]), P.stone),
      hi(poly([[12, 86], [88, 86], [86, 80], [14, 80]]), P.leafDark),
      stroke(line(arcPts(50, 34, 26, 12, 180, 360, 24)), P.iron, 3),
      ...leafL(26, 38),
      ...leafL(74, 62),
      fill(rect(14, 28, 12, 56, 1), BRICK),
      fill(rect(74, 28, 12, 56, 1), BRICK),
      hi(rect(21, 28, 5, 56), dark(BRICK, 0.22)),
      hi(rect(81, 28, 5, 56), dark(BRICK, 0.22)),
      fill(rect(12, 24, 16, 6, 1), P.stone),
      fill(rect(72, 24, 16, 6, 1), P.stone),
      fill(circ(20, 18, 5), P.stone),
      fill(circ(80, 18, 5), P.stone),
      hi(circ(18.5, 16.5, 2), P.marble),
      hi(circ(78.5, 16.5, 2), P.marble),
    ];
  },

  // 35 REVOLUTIONARY — a sailing ship under full sail, pennant flying.
  ship: () => [
    fill('M12 76 Q19 72 26 76 T40 76 T54 76 T68 76 T82 76 L88 76 L88 86 L12 86 Z', P.sea),
    stroke(line([[50, 62], [50, 14]]), P.woodDark, 3.5),
    fill(poly([[50, 10], [65, 13.5], [50, 17]]), P.red),
    fill('M36 19 Q50 15 64 19 Q68 26 64 32 Q50 29 36 32 Q32 26 36 19 Z', P.cream),
    hi('M50 16.5 Q57 16.5 64 19 Q68 26 64 32 Q57 30 50 29.5 Z', dark(P.cream, 0.12)),
    fill('M28 36 Q50 31 72 36 Q78 47 72 58 Q50 53 28 58 Q22 47 28 36 Z', P.cream),
    hi('M50 33 Q61 33 72 36 Q78 47 72 58 Q61 55 50 54 Z', dark(P.cream, 0.12)),
    fill('M12 56 L26 61 L86 61 L76 78 L26 78 Z', P.wood),
    hi(poly([[14, 58], [26, 63], [84, 63], [82, 66], [26, 66], [14, 61]]), lit(P.wood, 0.3)),
    hi(poly([[20, 71], [80, 71], [76, 78], [26, 78]]), dark(P.wood, 0.3)),
    hi(circ(40, 67, 1.8), P.woodDark),
    hi(circ(52, 67, 1.8), P.woodDark),
    hi(circ(64, 67, 1.8), P.woodDark),
  ],

  // 36 FIREBRAND — a beacon: an iron brazier on a tripod, burning high.
  beacon: () => [
    stroke(line([[44, 66], [30, 86]]), P.iron, 3.5),
    stroke(line([[56, 66], [70, 86]]), P.iron, 3.5),
    stroke(line([[50, 66], [50, 86]]), dark(P.iron, 0.2), 3.5),
    fill(flame(37, 50, 14, 22, -4), P.ember),
    fill(flame(63, 50, 14, 22, 4), P.ember),
    fill(flame(50, 50, 34, 42, 2), P.ember),
    hi(flame(50, 49, 23, 31, 1.5), P.flame),
    hi(flame(50, 48, 11, 17, 1), P.flameHot),
    fill('M27 51 L73 51 L64 67 L36 67 Z', P.iron),
    hi('M55 51 L73 51 L64 67 L57 67 Z', dark(P.iron, 0.3)),
    stroke(line([[36, 53], [40, 66]]), dark(P.iron, 0.4), 2, false),
    stroke(line([[46, 53], [47, 66]]), dark(P.iron, 0.4), 2, false),
    fill(rect(25, 47, 50, 6, 2), P.goldDark),
    hi(rect(25, 47, 50, 2.5, 1), lit(P.goldDark, 0.3)),
  ],

  // ── AMETHYST (37–42) ─────────────────────────────────────────────────────

  // 37 SAGE — a crescent moon with a star in its arms.
  crescent: () => [
    fill(crescent([44, 50], 31, [62, 40], 26), MOON),
    hi(crescent([44, 50], 31, [52, 46], 26), dark(MOON, 0.16)),
    hi(crescent([44, 50], 31, [70, 36], 31), lit(MOON, 0.45)),
    fill(starPath(69, 51, 10, 4.2, 5), P.gold),
    hi(starPath(68, 50, 4.5, 1.9, 5), lit(P.gold, 0.45)),
    fill(starPath(80, 26, 5, 2, 5), P.gold),
  ],

  // 38 MYSTIC — a crystal ball on a gilt stand, mist turning inside.
  hexagram: () => [
    fill('M28 85 L72 85 L66 74 L34 74 Z', P.woodDark),
    hi('M28 85 L72 85 L71 82 L29 82 Z', dark(P.woodDark, 0.3)),
    fill('M33 74 Q50 82 67 74 L61 64 L39 64 Z', P.gold),
    hi('M55 66 L61 64 L67 74 Q61 77 56 78 Z', P.goldDark),
    fill(circ(50, 42, 26), dark(ORB, 0.18)),
    hi(circ(47, 39, 21), ORB),
    stroke(line(arcPts(50, 46, 12, 7, 200, 520, 40).map(([x, y], i) => [x + i * 0.12, y - i * 0.1] as Pt)), lit(ORB, 0.6), 3, false),
    hi(ellR(39, 30, 7, 3.6, -40), P.white),
    hi(starPath(63, 52, 4.5, 1.4, 4), P.white),
  ],

  // 39 ILLUMINATE — a lantern, its glass lit from within.
  ring: () => [
    stroke(poly(arcPts(50, 14, 5, 5, 0, 360, 24).slice(0, -1)), FRAME, 3),
    fill(rect(45, 18, 10, 6, 2), FRAME),
    fill(poly([[33, 34], [67, 34], [57, 22], [43, 22]]), FRAME),
    hi(poly([[33, 34], [43, 22], [47, 22], [40, 34]]), lit(FRAME, 0.3)),
    fill(rect(36, 34, 28, 36), P.flameHot),
    hi(rect(41, 37, 18, 30, 3), lit(P.flameHot, 0.55)),
    fill(rect(46, 58, 8, 10, 1), P.wax),
    hi(flame(50, 58, 11, 18, 1), P.flame),
    hi(flame(50, 57, 5, 9, 0.5), lit(P.flameHot, 0.5)),
    fill(rect(33, 34, 5, 36, 1), FRAME),
    fill(rect(62, 34, 5, 36, 1), dark(FRAME, 0.2)),
    fill(rect(30, 69, 40, 7, 2), FRAME),
    fill(rect(34, 76, 7, 5, 1), FRAME),
    fill(rect(59, 76, 7, 5, 1), FRAME),
    stroke(line([[25, 46], [17, 42]]), P.flame, 3.5),
    stroke(line([[25, 56], [16, 58]]), P.flame, 3.5),
    stroke(line([[75, 46], [83, 42]]), P.flame, 3.5),
    stroke(line([[75, 56], [84, 58]]), P.flame, 3.5),
  ],

  // 40 ORACLE — an owl perched on a branch, eyes wide open.
  owl: () => [
    fill(ell(50, 54, 22, 25), TAWNY),
    fill(ell(50, 36, 21, 17), TAWNY),
    hi(ell(31, 58, 7, 17), dark(TAWNY, 0.25)),
    hi(ell(69, 58, 7, 17), dark(TAWNY, 0.3)),
    hi(ell(50, 62, 12, 15), lit(TAWNY, 0.5)),
    hi(poly([[44, 58], [46, 61], [48, 58]]), dark(TAWNY, 0.15)),
    hi(poly([[52, 58], [54, 61], [56, 58]]), dark(TAWNY, 0.15)),
    hi(poly([[47, 66], [49, 69], [51, 66]]), dark(TAWNY, 0.15)),
    hi(poly([[53, 66], [55, 69], [57, 66]]), dark(TAWNY, 0.15)),
    hi(circ(41, 37, 10), lit(TAWNY, 0.62)),
    hi(circ(59, 37, 10), lit(TAWNY, 0.62)),
    hi(circ(41, 37, 6.5), P.flame),
    hi(circ(59, 37, 6.5), P.flame),
    hi(circ(41, 37, 3.6), P.ink),
    hi(circ(59, 37, 3.6), P.ink),
    hi(circ(39.5, 35.5, 1.5), P.white),
    hi(circ(57.5, 35.5, 1.5), P.white),
    hi(poly([[46.5, 43], [53.5, 43], [50, 51]]), P.goldDark),
    fill(rect(12, 76, 76, 7, 3.5), P.woodDark),
    hi(rect(12, 76, 76, 2.5, 1.2), lit(P.woodDark, 0.25)),
    fill(rect(40, 73, 7, 5, 2), P.goldDark),
    fill(rect(53, 73, 7, 5, 2), P.goldDark),
  ],

  // 41 VISIONARY — a large cut emerald, catching the light.
  gem: () => {
    const T = [34, 50, 66].map((x) => [x, 24] as Pt);
    const G = [14, 32, 50, 68, 86].map((x) => [x, 42] as Pt);
    const B: Pt = [50, 84];
    const g = P.jade;
    const crown: [Pt[], string][] = [
      [[T[0], G[0], G[1]], lit(g, 0.5)],
      [[T[0], G[1], T[1]], lit(g, 0.32)],
      [[T[1], G[1], G[2]], lit(g, 0.15)],
      [[T[1], G[2], G[3]], g],
      [[T[1], G[3], T[2]], dark(g, 0.12)],
      [[T[2], G[3], G[4]], dark(g, 0.3)],
    ];
    const pav: [Pt[], string][] = [
      [[G[0], G[1], B], lit(g, 0.2)],
      [[G[1], G[2], B], g],
      [[G[2], G[3], B], dark(g, 0.2)],
      [[G[3], G[4], B], dark(g, 0.4)],
    ];
    return [
      fill(poly([T[0], T[2], G[4], B, G[0]]), g),
      ...crown.map(([p, c]) => hi(poly(p), c)),
      ...pav.map(([p, c]) => hi(poly(p), c)),
      hi(poly([[36, 25.5], [42, 25.5], [24, 40], [18, 40]]), P.white, 0.75),
      glint(22, 20, 9),
    ];
  },

  // 42 HIEROPHANT — an ornate golden key, a ruby set in its bow.
  key: () => {
    const R = (pts: Pt[]) => rotP(pts, 50, 50, 40);
    const bc = R([[28, 50]])[0];
    const lobes = ([[9, 0], [-9, 0], [0, 9], [0, -9]] as Pt[]).map(([dx, dy]) => R([[28 + dx, 50 + dy]])[0]);
    return [
      fill(poly(R([[64, 53], [84, 53], [84, 66], [80, 66], [80, 60], [75, 60], [75, 67], [70, 67], [70, 57], [64, 57]])), P.goldDark),
      fill(poly(R([[34, 46.5], [86, 46.5], [86, 53.5], [34, 53.5]])), P.gold),
      hi(poly(R([[36, 47], [85, 47], [85, 49.5], [36, 49.5]])), lit(P.gold, 0.4)),
      fill(poly(R([[39, 43], [45, 43], [45, 57], [39, 57]])), P.goldDark),
      ...lobes.map((c) => fill(circ(c[0], c[1], 8), P.gold)),
      fill(circ(bc[0], bc[1], 9), P.gold),
      hi(circ(lobes[3][0] - 1.5, lobes[3][1] - 1.5, 4), lit(P.gold, 0.4)),
      hi(circ(lobes[1][0] - 1.5, lobes[1][1] - 1.5, 4), lit(P.gold, 0.4)),
      hi(circ(bc[0], bc[1], 6), dark(P.goldDark, 0.2)),
      hi(circ(bc[0], bc[1], 4.8), P.red),
      hi(circ(bc[0] - 1.6, bc[1] - 1.6, 1.8), lit(P.red, 0.6)),
    ];
  },

  // ── AURUM (43–48) ────────────────────────────────────────────────────────

  // 43 ARCHON — a gold crown over red velvet, set with rubies, a sapphire and pearls.
  crown: () => {
    const tips: Pt[] = [[16, 36], [33, 30], [50, 24], [67, 30], [84, 36]];
    return [
      fill('M24 54 C24 22 76 22 76 54 Z', P.red),
      hi('M50 25.5 C66 26 76 36 76 54 L50 54 Z', dark(P.red, 0.25)),
      fill(poly([[16, 76], [16, 36], [24.5, 54], [33, 30], [41.5, 54], [50, 24], [58.5, 54], [67, 30], [75.5, 54], [84, 36], [84, 76]]), P.gold),
      hi(poly([[50, 24], [58.5, 54], [67, 30], [75.5, 54], [84, 36], [84, 62], [50, 62]]), dark(P.gold, 0.14)),
      hi(poly([[16, 36], [24.5, 54], [20, 62], [16, 62]]), lit(P.gold, 0.35)),
      ...tips.map(([x, y]) => fill(circ(x, y - 3, 4), P.cream)),
      fill(rect(13, 61, 74, 16, 3), P.gold),
      hi(rect(13, 61, 74, 4, 2), lit(P.gold, 0.4)),
      hi(rect(13, 72, 74, 5, 2), P.goldDark),
      hi(circ(30, 69, 5), P.red),
      hi(poly([[50, 62.5], [56.5, 69], [50, 75.5], [43.5, 69]]), P.lapis),
      hi(circ(70, 69, 5), P.red),
      hi(circ(28.5, 67.5, 1.8), lit(P.red, 0.6)),
      hi(circ(48.5, 67, 1.8), lit(P.lapis, 0.6)),
      hi(circ(68.5, 67.5, 1.8), lit(P.red, 0.6)),
      glint(84, 20, 8),
    ];
  },

  // 44 LUMINARY — a bevelled gold star, a glint at its point.
  star: () => {
    const pts: Pt[] = [];
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      const r = i % 2 ? 15 : 36;
      pts.push([50 + Math.cos(a) * r, 54 + Math.sin(a) * r]);
    }
    return [
      ...bevelStar(50, 54, pts, P.gold),
      fill(circ(50, 54, 5.5), P.red),
      hi(circ(48.5, 52.5, 2), lit(P.red, 0.6)),
      glint(79, 22, 9),
      glint(22, 26, 5),
    ];
  },

  // 45 MAGUS — a ringed planet with its small silver moon.
  orbit: () => {
    const front = arcPts(48, 52, 38, 10, 0, 180, 30, -18);
    return [
      stroke(ellR(48, 52, 38, 10, -18), P.goldDark, 5),
      fill(circ(48, 52, 22), P.teal),
      hi(circ(44, 48, 17), lit(P.teal, 0.2)),
      hi(poly(arcPts(48, 52, 22, 22, 205, 250, 10).concat(arcPts(48, 52, 15, 15, 250, 205, 10))), lit(P.teal, 0.5)),
      stroke(line(arcPts(48, 52, 21, 6, 10, 170, 16, -18).map(([x, y]) => [x, y - 9] as Pt)), dark(P.teal, 0.2), 3, false),
      stroke(line(front), '#2B2420', 8.5, false),
      stroke(line(front), P.gold, 5, false),
      fill(circ(80, 22, 7), P.silver),
      hi(circ(82, 24, 2.2), P.steel),
      glint(20, 20, 7),
    ];
  },

  // 46 IMMORTAL — a gold laurel wreath tied with a red ribbon and a sapphire.
  sunface: () => {
    const side = (mirror: boolean): Part[] => {
      const out: Part[] = [];
      const X = (x: number) => (mirror ? 100 - x : x);
      for (let a = 108; a <= 246; a += 23) {
        const px = 50 + Math.cos(a * RAD) * 30, py = 48 + Math.sin(a * RAD) * 30;
        const tang = a + 90;
        const outA = tang - 32, inA = tang + 32;
        const m = (d: number) => (mirror ? 180 - d : d);
        out.push(fill(leaf(X(px), py, m(outA), 15, 5.5), mirror ? P.gold : lit(P.gold, 0.32)));
        out.push(fill(leaf(X(px), py, m(inA), 13, 4.8), mirror ? P.goldDark : P.gold));
      }
      return out;
    };
    return [
      stroke(line(arcPts(50, 48, 30, 30, 100, 250, 24)), P.goldDark, 3),
      stroke(line(arcPts(50, 48, 30, 30, 80, -70, 24)), P.goldDark, 3),
      ...side(false),
      ...side(true),
      fill(poly([[50, 79], [38, 74], [38, 86]]), P.red),
      fill(poly([[50, 79], [62, 74], [62, 86]]), dark(P.red, 0.15)),
      fill(circ(50, 79, 5.5), P.lapis),
      hi(circ(48.5, 77.5, 2), lit(P.lapis, 0.6)),
      glint(50, 20, 8),
    ];
  },

  // 47 TRANSCENDENT — a gold astrolabe, its night-blue plate under a compass rose.
  starcompass: () => {
    const rose: Pt[] = [];
    for (let k = 0; k < 16; k++) {
      const a = -Math.PI / 2 + (k * Math.PI) / 8;
      const r = k % 4 === 0 ? 23 : k % 2 === 0 ? 14 : 6;
      rose.push([50 + Math.cos(a) * r, 55 + Math.sin(a) * r]);
    }
    const ticks = Array.from({ length: 12 }, (_, i) => {
      const a = (i * 30) * RAD;
      return stroke(line([[50 + Math.cos(a) * 27, 55 + Math.sin(a) * 27], [50 + Math.cos(a) * 31, 55 + Math.sin(a) * 31]]), P.goldDark, 2, false);
    });
    return [
      stroke(poly(arcPts(50, 14, 5, 5, 0, 360, 24).slice(0, -1)), P.gold, 3.5),
      fill(poly([[41, 26], [59, 26], [55, 18], [45, 18]]), P.gold),
      fill(circ(50, 55, 33), P.gold),
      hi(circ(47, 52, 29), lit(P.gold, 0.25)),
      hi(circ(50, 55, 26), P.night),
      hi(circ(50, 55, 16), lit(P.night, 0.12)),
      ...ticks,
      ...bevelStar(50, 55, rose, P.gold).map((p) => ({ ...p, edge: false })),
      hi(circ(50, 55, 4), P.red),
      glint(82, 22, 8),
    ];
  },

  // 48 GRAND PHILOSOPHER — an open golden book, a ruby above it throwing out light.
  bookrays: () => {
    const rays: Part[] = [];
    for (let i = 0; i < 7; i++) {
      const a = (180 + 15 + (i * 150) / 6) * RAD;
      const d = (a + Math.PI / 2);
      const w = 3.2;
      const r0 = 13, r1 = i % 2 ? 19 : 23;
      const bx = 50 + Math.cos(a) * r0, by = 33 + Math.sin(a) * r0;
      const tx = 50 + Math.cos(a) * r1, ty = 33 + Math.sin(a) * r1;
      rays.push(fill(poly([[bx + Math.cos(d) * w, by + Math.sin(d) * w], [tx, ty], [bx - Math.cos(d) * w, by - Math.sin(d) * w]]), lit(P.gold, 0.3)));
    }
    return [
      ...rays,
      fill('M12 55 Q30 50 50 57 Q70 50 88 55 L88 82 Q70 78 50 86 Q30 78 12 82 Z', P.gold),
      hi('M50 57 Q70 50 88 55 L88 82 Q70 78 50 86 Z', P.goldDark),
      fill('M16 52 Q32 47 49 54 L49 80 Q32 75 16 79 Z', P.paper),
      fill('M51 54 Q68 47 84 52 L84 79 Q68 75 51 80 Z', P.page),
      stroke(line([[22, 59], [43, 62]]), dark(P.page, 0.25), 2, false),
      stroke(line([[22, 66], [43, 69]]), dark(P.page, 0.25), 2, false),
      stroke(line([[57, 62], [78, 59]]), dark(P.page, 0.3), 2, false),
      stroke(line([[57, 69], [78, 66]]), dark(P.page, 0.3), 2, false),
      fill(poly([[50, 22], [60, 33], [50, 44], [40, 33]]), P.red),
      hi(poly([[50, 22], [50, 33], [40, 33]]), lit(P.red, 0.4)),
      hi(poly([[50, 33], [60, 33], [50, 44]]), dark(P.red, 0.3)),
      glint(83, 24, 7),
    ];
  },
};
