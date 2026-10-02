// The objects in the 37 live BADGES, keyed by the badge's id in data/badges.ts. Each
// one says what its badge is for — a cave mouth for the first lesson, an hourglass for
// a hundred days, a galleon for thirty-two thousand XP. Within a family every object
// differs in SILHOUETTE and in DOMINANT COLOUR, because the complaint that started this
// was that every badge looked the same. See components/shared/insigniaObjects.ts for
// the style and the rules. Zero runtime imports.
import {
  P, lit, dark, mix, rect, circ, ell, poly, line, flame, starPath, fill, hi, stroke, type Part,
} from '../insigniaObjects';

// ── local helpers ──────────────────────────────────────────────────────────

type Pt = [number, number];
const r2 = (v: number) => Math.round(v * 100) / 100;

/** Points rotated by `deg` about (cx, cy) and then moved by (dx, dy). */
function rot(pts: Pt[], cx: number, cy: number, deg: number, dx = 0, dy = 0): Pt[] {
  const a = (deg * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a);
  return pts.map(([x, y]) => [cx + dx + (x - cx) * c - (y - cy) * s, cy + dy + (x - cx) * s + (y - cy) * c]);
}
/** An ellipse turned by `deg`. */
function ellR(cx: number, cy: number, rx: number, ry: number, deg: number): string {
  const a = (deg * Math.PI) / 180;
  const x0 = cx - rx * Math.cos(a), y0 = cy - rx * Math.sin(a);
  const x1 = cx + rx * Math.cos(a), y1 = cy + rx * Math.sin(a);
  return `M${r2(x0)} ${r2(y0)} A${rx} ${ry} ${deg} 1 0 ${r2(x1)} ${r2(y1)} A${rx} ${ry} ${deg} 1 0 ${r2(x0)} ${r2(y0)} Z`;
}
/** A circle wound the other way: inside a filled circle it cuts a HOLE (non-zero fill). */
function circRev(cx: number, cy: number, r: number): string {
  return `M${r2(cx - r)} ${r2(cy)} A${r} ${r} 0 1 1 ${r2(cx + r)} ${r2(cy)} A${r} ${r} 0 1 1 ${r2(cx - r)} ${r2(cy)} Z`;
}
/** A crescent: the disc (cx, cy, r) with a disc of radius `k·r` bitten out at an offset. */
function crescent(cx: number, cy: number, r: number, ox: number, oy: number, k = 0.86): string {
  // Two arcs between the circles' intersection points.
  const R = r * k;
  const d = Math.hypot(ox, oy);
  const a = (r * r - R * R + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(0, r * r - a * a));
  const mx = cx + (a * ox) / d, my = cy + (a * oy) / d;
  const p1: Pt = [mx + (h * -oy) / d, my + (h * ox) / d];
  const p2: Pt = [mx - (h * -oy) / d, my - (h * ox) / d];

  return `M${r2(p1[0])} ${r2(p1[1])} A${r} ${r} 0 1 1 ${r2(p2[0])} ${r2(p2[1])} A${R} ${R} 0 1 0 ${r2(p1[0])} ${r2(p1[1])} Z`;
}
/** A long prism crystal pointing up from (bx, by), turned by `deg`: body, lit and dark facets. */
function crystal(bx: number, by: number, w: number, L: number, deg: number, c: string): Part[] {
  const h = w / 2, tip = L - w * 0.75;
  const body = rot([[bx - h, by], [bx - h, by - tip], [bx, by - L], [bx + h, by - tip], [bx + h, by]], bx, by, deg);
  const left = rot([[bx - h, by], [bx - h, by - tip], [bx, by - L], [bx - h * 0.1, by]], bx, by, deg);
  const tipF = rot([[bx - h, by - tip], [bx, by - L], [bx + h, by - tip], [bx, by - tip + w * 0.35]], bx, by, deg);
  return [fill(poly(body), dark(c, 0.18)), hi(poly(left), c), hi(poly(tipF), lit(c, 0.42))];
}

// Materials this file needs beyond the shared palette.
const ROCK = mix(P.stoneDark, P.woodDark, 0.45);
const SAND = mix(P.gold, P.stone, 0.45);
const TERRA = mix(P.ember, P.wood, 0.4);
const SOIL = '#7A5434';
const ROOT = '#E6CFA2';
const WILLOW = P.moss;
const SLATE = mix(P.steel, P.violet, 0.18);
const COPPER = '#C47544';
const BRONZE = '#B4743A';
const CRIMSON = '#A8283A';
const AMETHYST = '#8B5CC4';
const VELVET = P.red;

export const BADGE_OBJECTS: Record<string, () => Part[]> = {
  // ── LESSONS ──────────────────────────────────────────────────────────────

  // first-light · OUT OF THE CAVE — a rough cave mouth, and through it the sun on a green field.
  'first-light': () => [
    fill('M12 86 L15 62 Q19 40 33 31 L45 23 Q57 19 67 26 L79 35 Q87 47 88 63 L88 86 Z', ROCK),
    hi('M67 26 L79 35 Q87 47 88 63 L88 86 L74 86 L71 48 Z', dark(ROCK, 0.28)),
    hi('M15 62 Q19 40 33 31 L45 23 L39 37 L23 57 Z', lit(ROCK, 0.22)),
    fill('M31 86 L31 62 Q33 42 50 40 Q67 42 69 62 L69 86 Z', P.sky),
    hi(circ(50, 66, 10), P.flameHot),
    hi('M32 72 Q50 66 68 72 L68 86 L32 86 Z', P.moss),
    hi('M32 79 Q50 74 68 79 L68 86 L32 86 Z', P.leaf),
  ],

  // star-pupil · THE EXAMINED LIFE — an ornate gold hand mirror, beaded rim, two glints on the silvered glass.
  'star-pupil': () => {
    const T = -22, cx = 46, cy = 38;
    const handle = rot([[42, 61], [50, 61], [51, 80], [54, 86], [38, 86], [41, 80]], cx, cy, T);
    const hshade = rot([[46, 61], [50, 61], [51, 80], [54, 86], [46, 86]], cx, cy, T);
    // Twelve beads round the rim were noise at 22pt. A tall OVAL, a finial on the
    // crown and a knob on the handle are what keep it a mirror and not the round
    // magnifier the Doubter already wears.
    const fin = rot([[cx, cy - 37], [cx + 6, cy - 29], [cx, cy - 25], [cx - 6, cy - 29]], cx, cy, T);
    const knob = rot([[46, 89]], cx, cy, T)[0];
    const g1 = rot([[36, 26], [43, 18], [41, 38], [34, 46]], cx, cy, T);
    const g2 = rot([[46, 26], [49, 23], [45, 42], [42, 45]], cx, cy, T);
    return [
      fill(poly(handle), P.gold),
      hi(poly(hshade), P.goldDark),
      fill(circ(knob[0], knob[1], 5), P.goldDark),
      fill(poly(fin), P.gold),
      fill(ellR(cx, cy, 19, 28, T), P.gold),
      hi(ellR(cx + 2, cy + 3, 16, 25, T), P.goldDark, 0.5),
      fill(ellR(cx, cy, 13, 22, T), mix(P.silver, P.glass, 0.45)),
      hi(ellR(cx + 3, cy + 5, 8, 15, T), mix(P.silver, P.steel, 0.4)),
      hi(poly(g1), P.white),
      hi(poly(g2), P.white, 0.85),
    ];
  },

  // arch-of-wisdom · THE THRESHOLD — a cut-stone archway, its door swung in on warm light.
  'arch-of-wisdom': () => [
    fill('M20 87 L20 46 Q20 15 50 15 Q80 15 80 46 L80 87 Z', P.stone),
    hi('M64 18 Q80 26 80 46 L80 87 L70 87 L70 46 Q70 30 62 24 Z', dark(P.stone, 0.18)),
    fill('M33 87 L33 48 Q33 28 50 28 Q67 28 67 48 L67 87 Z', P.flameHot),
    hi('M36 87 L36 60 L64 60 L64 87 Z', lit(P.flameHot, 0.4)),
    fill(poly([[33, 87], [33, 46], [44, 52], [44, 84]]), P.leather),
    hi(poly([[38, 85.5], [38, 49], [44, 52], [44, 84]]), P.leatherDark),
    fill(poly([[44, 13], [56, 13], [54, 27], [46, 27]]), lit(P.stone, 0.25)),
    stroke(line([[24, 34], [34, 40]]), P.stoneDark, 2.5, false),
    stroke(line([[76, 34], [66, 40]]), P.stoneDark, 2.5, false),
    stroke(line([[20, 62], [33, 62]]), P.stoneDark, 2.5, false),
    stroke(line([[67, 62], [80, 62]]), P.stoneDark, 2.5, false),
  ],

  // true-north · A FIXED POINT — the north star, and under it a compass whose red needle points to it.
  'true-north': () => [
    fill(circ(50, 63, 24), P.steel),
    hi('M30 50 A24 24 0 0 1 63 42 L58 48 A17 17 0 0 0 36 55 Z', lit(P.steel, 0.35)),
    fill(circ(50, 63, 17), P.cream),
    hi(poly([[50, 48], [55.5, 63], [44.5, 63]]), P.red),
    hi(poly([[50, 78], [55.5, 63], [44.5, 63]]), P.iron),
    hi(circ(50, 63, 3.2), P.gold),
    fill(starPath(50, 23, 13, 4.2, 4), P.flameHot),
    hi(poly([[50, 10], [53, 20], [50, 23]]), P.white),
  ],

  // the-pillars · THE LONG COLONNADE — three white marble columns under one lintel.
  'the-pillars': () => {
    const parts: Part[] = [
      fill(rect(12, 77, 76, 10, 1.5), P.stone),
      hi(rect(12, 82, 76, 5), P.stoneDark),
      fill(rect(14, 14, 72, 9, 1.5), P.marble),
      hi(rect(14, 19, 72, 4), dark(P.marble, 0.12)),
    ];
    for (const x of [20, 44, 68]) {
      parts.push(
        fill(rect(x - 2, 23, 16, 6, 1), P.marble),
        fill(rect(x, 29, 12, 48), P.marble),
        hi(rect(x + 8, 29, 4, 48), dark(P.marble, 0.16)),
        stroke(line([[x + 4, 32], [x + 4, 74]]), dark(P.marble, 0.2), 2, false),
      );
    }
    return parts;
  },

  // grid-thinker · THE METHOD — a squared notebook on its spiral, a yellow pencil across it.
  'grid-thinker': () => {
    const parts: Part[] = [
      fill(rect(28, 22, 46, 64, 3), P.teal),
      fill(rect(22, 17, 46, 64, 3), P.paper),
    ];
    for (const y of [32, 42, 52, 62, 72]) parts.push(stroke(line([[25, y], [65, y]]), lit(P.sky, 0.2), 1.8, false));
    for (const x of [32, 42, 52, 62]) parts.push(stroke(line([[x, 25], [x, 78]]), lit(P.sky, 0.2), 1.8, false));
    for (const x of [28, 37, 46, 55, 64]) parts.push(stroke(`M${x - 2} 21 A3 4 0 0 1 ${x + 2} 15`, P.iron, 2.6, false));
    // The pencil, tip at the lower left.
    const c = 66, d = 60, T = -52;
    const body = rot([[c - 20, d - 5], [c + 22, d - 5], [c + 22, d + 5], [c - 20, d + 5]], c, d, T);
    const band = rot([[c + 22, d - 5], [c + 26, d - 5], [c + 26, d + 5], [c + 22, d + 5]], c, d, T);
    const rub = rot([[c + 26, d - 5], [c + 31, d - 5], [c + 31, d + 5], [c + 26, d + 5]], c, d, T);
    const cone = rot([[c - 20, d - 5], [c - 20, d + 5], [c - 33, d]], c, d, T);
    const lead = rot([[c - 29, d - 1.6], [c - 29, d + 1.6], [c - 33, d]], c, d, T);
    const shade = rot([[c - 20, d + 1], [c + 22, d + 1], [c + 22, d + 5], [c - 20, d + 5]], c, d, T);
    parts.push(
      fill(poly(cone), lit(P.wood, 0.35)),
      hi(poly(lead), P.ink),
      fill(poly(body), P.flameHot),
      hi(poly(shade), P.gold),
      fill(poly(band), P.silver),
      fill(poly(rub), P.rose),
    );
    return parts;
  },

  // ascent · THE LONG ASCENT — a flight of sandstone steps climbing up and to the right.
  ascent: () => {
    const prof: Pt[] = [[13, 87], [13, 74], [28, 74], [28, 61], [43, 61], [43, 48], [58, 48], [58, 35], [73, 35], [73, 22], [87, 22], [87, 87]];
    const parts: Part[] = [fill(poly(prof), SAND)];
    parts.push(hi(poly([[80, 22], [87, 22], [87, 87], [80, 87]]), dark(SAND, 0.22)));
    for (const [x, y] of [[13, 74], [28, 61], [43, 48], [58, 35], [73, 22]]) {
      parts.push(hi(rect(x, y, 15, 4.5), lit(SAND, 0.4)));
      parts.push(stroke(line([[x + 15, y], [x + 15, y + 13]]), dark(SAND, 0.3), 2.5, false));
    }
    return parts;
  },

  // summit · NEAR THE SUMMIT — a snow-capped mountain with a red flag planted on its peak.
  summit: () => [
    fill(poly([[46, 87], [70, 46], [88, 70], [88, 87]]), lit(SLATE, 0.18)),
    fill(poly([[12, 87], [48, 30], [80, 87]]), SLATE),
    hi(poly([[48, 30], [80, 87], [56, 87], [52, 58]]), dark(SLATE, 0.22)),
    fill(poly([[48, 30], [57.5, 45], [53, 48], [49, 43], [44, 49], [39.5, 45]]), P.white),
    stroke(line([[48, 31], [48, 12]]), P.woodDark, 2.6),
    fill(poly([[49, 12], [66, 16.5], [49, 22]]), P.red),
    hi(poly([[49, 17.5], [66, 16.5], [49, 22]]), dark(P.red, 0.15)),
  ],

  // the-great-question · EVERY LAST ONE — a tall bookcase with every shelf full.
  'the-great-question': () => {
    const parts: Part[] = [
      fill(rect(22, 12, 56, 76, 2), P.woodDark),
      hi(rect(26, 16, 48, 68), dark(P.woodDark, 0.4)),
    ];
    const rows: [number, number][] = [[16, 36], [40, 60], [64, 84]];
    const spines = [P.red, P.lapis, P.gold, P.leaf, P.violet, P.teal, P.rose, P.paper];
    let k = 0;
    for (const [top, bot] of rows) {
      let x = 27;
      const widths = [7, 5, 8, 6, 6, 8].map((w, i) => w + ((k + i) % 2));
      for (const w of widths) {
        if (x + w > 73.5) break;
        const h = bot - top - ((k * 3 + x) % 5);
        const col = spines[k % spines.length];
        parts.push(hi(rect(x, bot - h, w, h), col));
        parts.push(hi(rect(x, bot - h + 3, w, 2.4), lit(col, 0.45)));
        x += w + 0.8;
        k++;
      }
      parts.push(hi(rect(26, bot, 48, 4), P.wood));
    }
    return parts;
  },

  // ── STREAK ───────────────────────────────────────────────────────────────

  // turning-point · THREE DAYS RUNNING — three short lit candles on one iron dish.
  'turning-point': () => {
    const parts: Part[] = [
      fill(ell(50, 82, 37, 7), dark(P.iron, 0.2)),
      fill(ell(50, 79, 37, 7), P.iron),
    ];
    for (const [x, top] of [[22, 58], [43, 48], [64, 62]] as Pt[]) {
      parts.push(
        fill(rect(x, top, 14, 80 - top, 2), P.wax),
        hi(rect(x + 9, top, 5, 80 - top), dark(P.wax, 0.14)),
        stroke(line([[x + 7, top], [x + 7, top - 5]]), P.ink, 2.2, false),
        fill(flame(x + 7, top - 3, 10, 18, 1), P.flame),
        hi(flame(x + 7, top - 3.5, 5, 9, 0.5), P.flameHot),
      );
    }
    return parts;
  },

  // lamp-bearer · A WEEK UNBROKEN — a terracotta oil lamp, its flame burning at the spout.
  'lamp-bearer': () => [
    stroke('M24 58 Q12 56 14 66 Q16 74 28 68', TERRA, 4.5),
    fill(rect(36, 70, 22, 9, 2), dark(TERRA, 0.2)),
    fill('M22 62 Q22 49 46 49 Q65 49 74 55 L85 53 Q89 58 84 62 L74 66 Q64 75 46 75 Q22 75 22 62 Z', TERRA),
    hi('M24 60 Q26 52 46 51 Q60 51 66 55 Q50 54 36 58 Z', lit(TERRA, 0.35)),
    hi('M30 70 Q46 74 64 68 Q60 74 46 74 Q34 74 30 70 Z', dark(TERRA, 0.25)),
    hi(ell(46, 53, 6, 2.2), dark(TERRA, 0.55)),
    fill(flame(84, 53, 13, 30, 2), P.flame),
    hi(flame(84, 52, 6.5, 15, 1), P.flameHot),
  ],

  // moonlit-path · THREE WEEKS — a crescent moon over a pale path winding into night hills.
  'moonlit-path': () => [
    fill('M12 87 L12 64 Q30 52 50 58 Q70 50 88 60 L88 87 Z', P.night),
    hi('M60 54 Q74 50 88 60 L88 87 L72 87 Q70 66 60 54 Z', dark(P.night, 0.3)),
    hi('M37 87 Q53 77 46 70 Q41 64 51 59 L55 59 Q48 64 53 70 Q62 78 61 87 Z', lit(P.stone, 0.15)),
    fill(crescent(52, 31, 19, 9, -5), lit(P.flameHot, 0.35)),
    hi(starPath(22, 26, 5.5, 1.8, 4), lit(P.flameHot, 0.4)),
    hi(starPath(82, 40, 4.5, 1.5, 4), lit(P.flameHot, 0.4)),
  ],

  // solar-mind · FIFTY DAYS — a blazing sun with flat wedge rays.
  'solar-mind': () => [
    fill(starPath(50, 50, 38, 24, 12, -Math.PI / 2), P.flame),
    hi(starPath(50, 50, 30, 22, 12, -Math.PI / 2 + Math.PI / 12), lit(P.flame, 0.3)),
    fill(circ(50, 50, 23), P.flameHot),
    hi('M31 44 A20 20 0 0 1 56 30 Q40 34 36 50 Z', lit(P.flameHot, 0.55)),
    hi('M71 54 A21 21 0 0 1 48 72 Q64 68 68 52 Z', P.gold, 0.7),
  ],

  // the-hourglass · ONE HUNDRED DAYS — a wooden hourglass, sand running into the lower bulb.
  'the-hourglass': () => [
    fill(rect(29, 20, 5, 60), P.woodDark),
    fill(rect(66, 20, 5, 60), P.woodDark),
    fill('M37 21 Q37 41 48 50 Q37 59 37 79 L63 79 Q63 59 52 50 Q63 41 63 21 Z', P.glass),
    hi('M41 33 Q45 42 50 47 Q55 42 59 33 Z', SAND),
    hi('M39 79 Q44 63 50 61 Q56 63 61 79 Z', SAND),
    stroke(line([[50, 47], [50, 62]]), SAND, 2.6, false),
    hi('M40 24 Q40 34 44 40 L42 41 Q38 34 38 24 Z', P.white, 0.85),
    fill(rect(23, 12, 54, 9, 2.5), P.wood),
    hi(rect(23, 17, 54, 4), dark(P.wood, 0.2)),
    fill(rect(23, 79, 54, 9, 2.5), P.wood),
    hi(rect(23, 84, 54, 4), dark(P.wood, 0.2)),
  ],

  // deep-roots · TEN DAYS IN — a sprout above the soil, and its roots below it, showing.
  'deep-roots': () => [
    fill(rect(14, 50, 72, 37, 5), SOIL),
    hi(rect(14, 50, 72, 5), P.leaf),
    hi(rect(62, 55, 24, 32), dark(SOIL, 0.2)),
    stroke('M50 52 Q49 64 44 72 Q40 78 34 82', ROOT, 3, false),
    stroke('M49 62 Q58 68 62 80', ROOT, 2.6, false),
    stroke('M46 69 Q38 66 30 68', ROOT, 2.4, false),
    stroke('M56 70 Q66 70 72 74', ROOT, 2.2, false),
    stroke('M50 50 Q50 38 51 28', P.leafDark, 3.2),
    fill('M51 34 Q40 18 22 24 Q30 40 51 36 Z', P.leaf),
    hi('M51 35 Q34 30 24 25 Q34 38 51 36 Z', P.leafDark),
    fill('M51 30 Q60 14 78 18 Q72 34 51 32 Z', lit(P.leaf, 0.15)),
    hi('M51 31 Q66 24 77 19 Q70 32 51 32 Z', P.leaf),
  ],

  // the-willow · FIFTY DAYS IN — a weeping willow, its long fronds falling to the grass.
  'the-willow': () => {
    // The canopy's lower edge is a fringe of long narrow fronds, open in the middle on the trunk.
    const fronds: Pt[] = [
      [16, 80], [20, 64], [24, 82], [28, 62], [32, 78], [36, 58], [40, 52],
      [60, 52], [64, 58], [68, 78], [72, 62], [76, 82], [80, 64], [84, 80],
    ];
    const canopyR = 'M87 76 Q90 24 50 15 Q10 24 13 76 ' + fronds.map(([x, y]) => `L${x} ${y}`).join(' ') + ' Z';
    return [
      fill(ell(50, 84, 34, 4.5), P.leaf),
      fill('M44 87 Q47 66 46 48 L55 48 Q53 66 57 87 Z', P.wood),
      hi('M51 48 L55 48 Q53 66 57 87 L52 87 Q53 66 51 48 Z', P.woodDark),
      fill(canopyR, WILLOW),
      hi('M58 17 Q90 26 87 76 L84 80 L80 64 L76 82 L72 62 L68 78 L64 58 Q70 36 58 17 Z', dark(WILLOW, 0.18)),
      hi('M20 36 Q30 20 48 17 Q32 26 26 44 Z', lit(WILLOW, 0.4)),
      ...[[24, 34, 22, 66], [32, 28, 30, 70], [40, 24, 38, 50], [62, 24, 64, 52], [70, 28, 72, 68], [78, 34, 80, 70]]
        .map(([x0, y0, x1, y1]) => stroke(`M${x0} ${y0} Q${x0 - 1} ${(y0 + y1) / 2} ${x1} ${y1}`,
          dark(WILLOW, x0 > 50 ? 0.38 : 0.24), 2.4, false)),
    ];
  },

  // the-keep · A HUNDRED AND FIFTY — a single grey stone tower, crenellated, one slit window.
  'the-keep': () => [
    fill(rect(32, 26, 36, 61), P.stone),
    hi(rect(56, 26, 12, 61), dark(P.stone, 0.18)),
    fill('M27 16 H35 V21 H41 V16 H47 V21 H53 V16 H59 V21 H65 V16 H73 V30 H27 Z', lit(P.stone, 0.1)),
    hi(rect(61, 16, 12, 14), dark(P.stone, 0.18)),
    stroke(line([[35, 46], [65, 46]]), P.stoneDark, 2, false),
    stroke(line([[35, 64], [65, 64]]), P.stoneDark, 2, false),
    stroke(line([[44, 30], [44, 46]]), P.stoneDark, 2, false),
    stroke(line([[56, 46], [56, 64]]), P.stoneDark, 2, false),
    fill('M46 58 L46 44 Q50 38 54 44 L54 58 Z', P.ink),
    fill('M42 87 L42 76 Q50 66 58 76 L58 87 Z', P.wood),
  ],

  // the-fortress · THREE HUNDRED DAYS — a castle: a gated wall between two blue-roofed towers, flags flying.
  'the-fortress': () => {
    const STONE = mix(P.stone, P.gold, 0.28);
    const parts: Part[] = [
      fill('M26 50 H32 V45 H38 V50 H44 V45 H50 V50 H56 V45 H62 V50 H68 V45 H74 V87 H26 Z', STONE),
      fill('M41 87 L41 70 Q50 59 59 70 L59 87 Z', P.ink),
    ];
    for (const x of [12, 70]) {
      parts.push(
        stroke(line([[x + 9, 24], [x + 9, 12]]), P.woodDark, 2.4),
        fill(poly([[x + 10, 12], [x + 21, 15], [x + 10, 18.5]]), P.red),
        fill(rect(x + 1, 38, 16, 49), STONE),
        hi(rect(x + 11, 38, 6, 49), dark(STONE, 0.18)),
        fill(poly([[x - 2, 39], [x + 9, 22], [x + 20, 39]]), P.lapis),
        hi(poly([[x + 9, 22], [x + 20, 39], [x + 10, 39]]), dark(P.lapis, 0.22)),
        fill('M' + (x + 6) + ' 58 V50 Q' + (x + 9) + ' 46 ' + (x + 12) + ' 50 V58 Z', P.ink),
      );
    }
    return parts;
  },

  // ── XP ───────────────────────────────────────────────────────────────────

  // bright-star · FIRST FIVE HUNDRED — one gold coin, a star struck on its face.
  'bright-star': () => [
    fill(circ(50, 54, 33), P.goldDark),
    fill(circ(50, 50, 33), P.gold),
    hi(circ(50, 50, 25), lit(P.gold, 0.22)),
    hi('M27 42 A25 25 0 0 1 58 26 Q38 30 30 48 Z', lit(P.gold, 0.55)),
    hi(starPath(51.5, 52.5, 15, 6.5, 5), P.goldDark),
    hi(starPath(50, 51, 15, 6.5, 5), P.gold),
  ],

  // radiant-mind · TWO THOUSAND — two stacks of copper coins, the taller behind.
  'radiant-mind': () => {
    const parts: Part[] = [];
    const stack = (cx: number, base: number, n: number, rx: number) => {
      for (let i = 0; i < n; i++) {
        const y = base - i * 9;
        parts.push(
          fill(`M${cx - rx} ${y - 5} V${y} A${rx} 7 0 0 0 ${cx + rx} ${y} V${y - 5} Z`, dark(COPPER, 0.2)),
          stroke(line([[cx - rx * 0.4, y - 3], [cx - rx * 0.4, y + 4]]), dark(COPPER, 0.4), 2, false),
          stroke(line([[cx + rx * 0.4, y - 3], [cx + rx * 0.4, y + 4]]), dark(COPPER, 0.4), 2, false),
        );
      }
      const top = base - (n - 1) * 9 - 5;
      parts.push(fill(ell(cx, top, rx, 7), COPPER), hi(ell(cx - 2, top - 1, rx * 0.6, 3.6), lit(COPPER, 0.4)));
    };
    stack(60, 70, 6, 20);
    stack(34, 82, 4, 20);
    return parts;
  },

  // the-crown · FIVE THOUSAND — a royal crown: red velvet, gold arches and orb, an ermine rim.
  'the-crown': () => [
    fill('M27 62 Q25 30 50 28 Q75 30 73 62 Z', VELVET),
    hi('M58 30 Q75 34 73 62 L62 62 Q64 40 58 30 Z', dark(VELVET, 0.22)),
    stroke('M28 60 Q28 30 50 26', P.gold, 5),
    stroke('M72 60 Q72 30 50 26', P.gold, 5),
    stroke(line([[50, 26], [50, 60]]), P.gold, 5),
    fill(circ(50, 20, 6), P.gold),
    hi(circ(48.5, 18.5, 2.2), lit(P.gold, 0.6)),
    fill(rect(24, 56, 52, 11, 1.5), P.gold),
    hi(rect(24, 62, 52, 5), P.goldDark),
    hi(circ(38, 61.5, 2.8), P.lapis),
    hi(circ(50, 61.5, 3.2), P.red),
    hi(circ(62, 61.5, 2.8), P.jade),
    fill(rect(21, 67, 58, 13, 6), P.white),
    hi(rect(21, 75, 58, 5, 0), dark(P.white, 0.1)),
    ...[31, 44, 57, 70].map((x) => hi(ell(x, 73, 1.8, 3), P.ink)),
  ],

  // diamond-eye · NINE THOUSAND — a brilliant-cut diamond, its facets catching the light.
  'diamond-eye': () => {
    const G = P.glass, SK = mix(P.glass, P.sea, 0.35);
    return [
      fill(poly([[30, 28], [70, 28], [86, 44], [50, 86], [14, 44]]), G),
      hi(poly([[30, 28], [42, 28], [36, 44], [14, 44]]), lit(G, 0.6)),
      hi(poly([[42, 28], [58, 28], [64, 44], [36, 44]]), lit(G, 0.3)),
      hi(poly([[58, 28], [70, 28], [86, 44], [64, 44]]), SK),
      hi(poly([[14, 44], [36, 44], [50, 86]]), lit(G, 0.15)),
      hi(poly([[36, 44], [64, 44], [50, 86]]), mix(G, P.sea, 0.18)),
      hi(poly([[64, 44], [86, 44], [50, 86]]), mix(G, P.sea, 0.5)),
      hi(starPath(76, 20, 8, 2, 4), P.white),
    ];
  },

  // star-of-david · THIRTEEN THOUSAND — a six-rayed silver order star with a gold centre, on a violet ribbon.
  'star-of-david': () => {
    const cx = 50, cy = 60, R = 27, r = 14;
    const parts: Part[] = [
      fill(poly([[30, 12], [44, 12], [55, 42], [45, 45]]), P.violet),
      fill(poly([[56, 12], [70, 12], [55, 45], [45, 42]]), dark(P.violet, 0.12)),
      hi(poly([[35, 12], [39, 12], [49, 40], [46, 41]]), lit(P.violet, 0.45)),
      hi(poly([[61, 12], [65, 12], [54, 41], [51, 40]]), lit(P.violet, 0.3)),
      fill(starPath(cx, cy, R, r, 6), P.silver),
    ];
    for (let i = 0; i < 6; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / 3, b = a + Math.PI / 6;
      parts.push(hi(poly([[cx, cy], [cx + Math.cos(a) * R, cy + Math.sin(a) * R], [cx + Math.cos(b) * r, cy + Math.sin(b) * r]]),
        dark(P.silver, 0.2)));
    }
    parts.push(fill(circ(cx, cy, 10), P.gold), hi(circ(cx - 2.5, cy - 2.5, 4), lit(P.gold, 0.45)));
    return parts;
  },

  // the-gate · SIXTEEN THOUSAND — tall stone gateposts and a wrought-iron gate standing open on light.
  'the-gate': () => {
    const parts: Part[] = [
      fill('M24 87 L24 40 Q50 22 76 40 L76 87 Z', lit(P.flameHot, 0.3)),
      hi(poly([[40, 87], [60, 87], [54, 60], [46, 60]]), lit(P.flameHot, 0.6)),
      stroke('M24 40 Q50 18 76 40', P.iron, 3.6),
      fill(circ(50, 24, 4), P.gold),
    ];
    // Two leaves, swung inward, foreshortened.
    const leaf = (x0: number, x1: number) => {
      parts.push(stroke(line([[x0, 44], [x1, 50]]), P.iron, 3, false), stroke(line([[x0, 84], [x1, 80]]), P.iron, 3, false));
      for (let i = 0; i <= 3; i++) {
        const x = x0 + ((x1 - x0) * i) / 3, top = 44 + (6 * i) / 3, bot = 84 - (4 * i) / 3;
        parts.push(stroke(line([[x, top - 3], [x, bot]]), P.iron, 2.8, false));
      }
    };
    leaf(25, 38);
    leaf(75, 62);
    for (const x of [12, 76]) {
      parts.push(
        fill(rect(x, 34, 12, 53), P.stone),
        hi(rect(x + 8, 34, 4, 53), dark(P.stone, 0.18)),
        fill(rect(x - 2, 30, 16, 6, 1), lit(P.stone, 0.15)),
        fill(circ(x + 6, 24, 5.5), P.gold),
      );
    }
    return parts;
  },

  // the-shield · TWENTY-ONE THOUSAND — a heraldic shield: lapis field, silver chevron, gold rim.
  'the-shield': () => [
    fill('M19 15 L81 15 L81 45 Q81 72 50 87 Q19 72 19 45 Z', P.gold),
    fill('M25 21 L75 21 L75 45 Q75 67 50 80 Q25 67 25 45 Z', P.lapis),
    hi('M50 21 L75 21 L75 45 Q75 67 50 80 Z', dark(P.lapis, 0.2)),
    hi(poly([[25, 58], [50, 36], [75, 58], [75, 70], [50, 48], [25, 70]]), P.silver),
    hi(poly([[50, 36], [75, 58], [75, 70], [50, 48]]), dark(P.silver, 0.15)),
    hi('M50 87 Q81 72 81 45 L81 15 L75 21 L75 45 Q75 67 50 80 Z', P.goldDark),
  ],

  // the-ship · THIRTY-TWO THOUSAND — a galleon under full sail, high stern, pennant flying.
  'the-ship': () => [
    stroke(line([[50, 62], [50, 12]]), P.woodDark, 3),
    stroke(line([[71, 62], [71, 22]]), P.woodDark, 3),
    stroke(line([[29, 58], [29, 24]]), P.woodDark, 3),
    fill(poly([[50, 12], [64, 15], [50, 18]]), P.red),
    fill('M39 21 Q50 18 61 21 L62 32 Q50 29 38 32 Z', P.paper),
    fill('M36 35 Q50 31 64 35 L66 55 Q50 51 34 55 Z', P.paper),
    hi('M52 35 Q58 33 64 35 L66 55 Q60 53 54 53 Z', P.page),
    fill('M63 25 Q71 23 79 25 L80 50 Q71 47 62 50 Z', P.paper),
    hi('M72 24 Q76 24 79 25 L80 50 Q76 48 73 48 Z', P.page),
    fill(poly([[29, 26], [29, 52], [17, 52]]), P.paper),
    fill('M13 50 L28 50 L30 60 L74 60 L87 54 L80 79 Q50 85 21 79 Z', P.wood),
    hi('M15 66 L84 64 L83 69 L17 71 Z', P.gold),
    hi('M50 82 Q66 81 80 79 L84 66 L86 54 L76 62 Z', P.woodDark),
    hi(rect(17, 53, 9, 4), P.woodDark),
  ],

  // the-beacon · FIFTY THOUSAND — a red-and-white lighthouse throwing its beam both ways.
  'the-beacon': () => [
    hi(poly([[50, 25], [12, 13], [12, 37]]), P.flameHot, 0.75),
    hi(poly([[50, 25], [88, 13], [88, 37]]), P.flameHot, 0.75),
    fill(ell(50, 84, 24, 5), P.stoneDark),
    fill(poly([[37, 83], [63, 83], [58, 36], [42, 36]]), P.white),
    hi(poly([[40.4, 68], [59.6, 68], [60.9, 80], [39.1, 80]]), P.red),
    hi(poly([[42.3, 48], [57.7, 48], [59, 60], [41, 60]]), P.red),
    hi(poly([[50, 36], [58, 36], [63, 83], [52, 83]]), '#000000', 0.12),
    fill(rect(38, 32, 24, 5, 1), P.iron),
    fill(rect(42.5, 20, 15, 12), P.flameHot),
    hi(rect(48, 20, 4, 12), P.white, 0.7),
    fill('M40 21 Q50 9 60 21 Z', P.red),
  ],

  // ── MASTERY ──────────────────────────────────────────────────────────────

  // order-bronze · THE BRONZE CIRCLE — a bronze medal hung on a striped ribbon.
  'order-bronze': () => [
    fill(poly([[30, 12], [46, 12], [56, 42], [44, 46]]), P.red),
    fill(poly([[54, 12], [70, 12], [56, 46], [44, 42]]), dark(P.red, 0.15)),
    hi(poly([[36, 12], [40, 12], [50, 42], [47, 43]]), P.cream),
    hi(poly([[60, 12], [64, 12], [53, 43], [50, 42]]), P.cream),
    fill(circ(50, 64, 23), BRONZE),
    hi(circ(50, 64, 16), lit(BRONZE, 0.2)),
    hi('M32 58 A19 19 0 0 1 52 45 Q38 50 35 64 Z', lit(BRONZE, 0.5)),
    stroke(circ(50, 64, 9.5), dark(BRONZE, 0.25), 2.6, false),
    hi('M70 70 A21 21 0 0 1 52 86 Q64 80 68 66 Z', dark(BRONZE, 0.25)),
  ],

  // order-jade · THE JADE CIRCLE — a carved jade bi disc, a red cord through its hole.
  'order-jade': () => {
    // A flat disc with a thickness under it, a red silk cord tied through the hole.
    const parts: Part[] = [
      stroke('M50 49 L50 22', P.red, 3.4),
      fill(poly([[44, 14], [56, 14], [53, 22], [47, 22]]), P.red),
      fill(circ(50, 61, 29) + ' ' + circRev(50, 61, 10), dark(P.jade, 0.25)),
      fill(circ(50, 58, 29) + ' ' + circRev(50, 58, 10), P.jade),
      hi('M24 50 A28 28 0 0 1 58 30.5 L56 37 A22 22 0 0 0 30 52 Z', lit(P.jade, 0.35)),
      hi('M76 66 A28 28 0 0 1 42 85.5 L44 79 A22 22 0 0 0 70 64 Z', dark(P.jade, 0.15)),
      stroke(circ(50, 58, 19.5), dark(P.jade, 0.18), 2.2, false),
    ];
    for (let i = 0; i < 12; i++) {
      const a = (i * Math.PI) / 6;
      parts.push(hi(circ(50 + Math.cos(a) * 14.5, 58 + Math.sin(a) * 14.5, 1.5), lit(P.jade, 0.35)));
      parts.push(hi(circ(50 + Math.cos(a + 0.26) * 24, 58 + Math.sin(a + 0.26) * 24, 1.5), lit(P.jade, 0.3)));
    }
    parts.push(stroke('M50 48 L50 54', P.red, 3.4, false));
    return parts;
  },

  // order-lapis · THE LAPIS CIRCLE — a lapis lazuli pendant in a gold bezel, flecked with gold.
  'order-lapis': () => [
    stroke(line([[50, 30], [28, 12]]), P.goldDark, 2.6),
    stroke(line([[50, 30], [72, 12]]), P.goldDark, 2.6),
    stroke(circ(50, 31, 4), P.gold, 3),
    fill(ell(50, 61, 23, 27), P.gold),
    fill(ell(50, 61, 17.5, 21.5), P.lapis),
    hi('M35 58 Q34 42 50 40 Q40 46 39 62 Z', lit(P.lapis, 0.35)),
    hi('M66 64 Q66 80 50 82 Q62 76 62 62 Z', dark(P.lapis, 0.3)),
    hi(circ(44, 66, 1.6), P.flameHot),
    hi(circ(56, 52, 1.4), P.flameHot),
    hi(circ(54, 72, 1.8), P.flameHot),
    hi(circ(46, 50, 1.2), P.flameHot),
    hi('M68 54 A20 24 0 0 1 56 86 Q66 80 70 62 Z', P.goldDark),
  ],

  // order-crimson · THE CRIMSON CIRCLE — a crimson swallow-tailed banner hung from a gold rod.
  'order-crimson': () => [
    fill(poly([[28, 20], [72, 20], [72, 87], [50, 74], [28, 87]]), CRIMSON),
    hi(poly([[58, 20], [72, 20], [72, 87], [61, 80.5], [62, 22]]), dark(CRIMSON, 0.25)),
    hi(poly([[30, 20], [36, 20], [36, 81.5], [30, 85]]), lit(CRIMSON, 0.25)),
    hi(poly([[28, 64], [50, 52], [72, 64], [72, 70], [50, 58], [28, 70]]), P.gold),
    fill(starPath(50, 38, 10, 4.2, 5), P.gold),
    fill(rect(18, 15, 64, 6, 3), P.gold),
    fill(circ(17, 18, 4.5), P.goldDark),
    fill(circ(83, 18, 4.5), P.goldDark),
  ],

  // order-amethyst · THE AMETHYST CIRCLE — a cluster of amethyst crystals on a rough grey stone.
  'order-amethyst': () => [
    ...crystal(32, 74, 13, 36, -30, AMETHYST),
    ...crystal(68, 74, 13, 36, 30, AMETHYST),
    ...crystal(50, 76, 17, 62, 0, AMETHYST),
    ...crystal(40, 80, 10, 22, -12, lit(AMETHYST, 0.15)),
    ...crystal(61, 80, 10, 24, 14, lit(AMETHYST, 0.15)),
    fill('M16 87 Q16 74 30 74 Q50 70 70 74 Q84 74 84 87 Z', P.stoneDark),
    hi('M60 73 Q84 74 84 87 L64 87 Q66 80 60 73 Z', dark(P.stoneDark, 0.22)),
  ],

  // order-aurum · THE AURUM CIRCLE — a gold trophy cup with two handles on a stepped foot.
  'order-aurum': () => [
    stroke('M30 26 Q14 24 16 38 Q18 50 34 52', P.gold, 4.5),
    stroke('M70 26 Q86 24 84 38 Q82 50 66 52', P.gold, 4.5),
    fill(rect(45, 56, 10, 16), P.goldDark),
    fill(rect(34, 70, 32, 8, 2), P.gold),
    fill(rect(29, 77, 42, 9, 2), dark(P.wood, 0.15)),
    hi(rect(29, 82, 42, 4), P.woodDark),
    fill('M27 18 L73 18 Q73 52 50 60 Q27 52 27 18 Z', P.gold),
    hi('M58 18 L73 18 Q73 52 50 60 Q64 48 62 18 Z', P.goldDark),
    hi('M32 22 L39 22 Q39 42 46 52 Q33 46 32 22 Z', lit(P.gold, 0.55)),
    hi(rect(27, 18, 46, 4), lit(P.gold, 0.3)),
  ],

  // ── SUBJECTS ─────────────────────────────────────────────────────────────

  // second-subject · A SECOND SUBJECT — two books leaning into each other on a shelf.
  'second-subject': () => {
    const book = (cx: number, deg: number, c: string): Part[] => {
      const by = 84;
      const cover = rot([[cx - 13, by], [cx - 13, by - 54], [cx + 13, by - 54], [cx + 13, by]], cx, by, deg);
      const pages = rot([[cx + 8, by - 2], [cx + 8, by - 52], [cx + 13, by - 52], [cx + 13, by - 2]], cx, by, deg);
      const band1 = rot([[cx - 13, by - 46], [cx + 8, by - 46], [cx + 8, by - 42], [cx - 13, by - 42]], cx, by, deg);
      const band2 = rot([[cx - 13, by - 14], [cx + 8, by - 14], [cx + 8, by - 10], [cx - 13, by - 10]], cx, by, deg);
      const label = rot([[cx - 8, by - 34], [cx + 3, by - 34], [cx + 3, by - 24], [cx - 8, by - 24]], cx, by, deg);
      return [fill(poly(cover), c), hi(poly(pages), P.paper), hi(poly(band1), P.gold), hi(poly(band2), P.gold),
        hi(poly(label), lit(c, 0.55))];
    };
    return [
      ...book(37, 0, P.teal),
      ...book(72, -8, P.violet),
      fill(rect(14, 83, 72, 5, 2), P.wood),
    ];
  },

  // four-subjects · FOUR SUBJECTS — a folded map in four panels, a red route dashed across it.
  'four-subjects': () => {
    const MAP = lit(P.page, 0.3);
    const parts: Part[] = [];
    const tops = [22, 28, 22, 28, 22], bots = [80, 86, 80, 86, 80];
    for (let i = 0; i < 4; i++) {
      const x0 = 14 + i * 18, x1 = x0 + 18;
      parts.push(fill(poly([[x0, tops[i]], [x1, tops[i + 1]], [x1, bots[i + 1]], [x0, bots[i]]]), i % 2 ? dark(MAP, 0.14) : MAP));
    }
    parts.push(
      hi('M17 40 Q24 32 32 38 Q30 50 20 50 Z', P.moss, 0.9),
      hi('M54 58 Q62 50 72 56 Q74 68 60 70 Q52 66 54 58 Z', P.moss, 0.9),
      stroke('M44 25 Q40 44 50 54 Q60 64 56 83', P.sky, 3.2, false),
    );
    const route: Pt[] = [[20, 64], [27, 60], [34, 62], [41, 56], [48, 50], [55, 44], [62, 40], [69, 36]];
    for (let i = 0; i < route.length - 1; i += 2) parts.push(stroke(line([route[i], route[i + 1]]), P.red, 3, false));
    parts.push(
      stroke(line([[72, 30], [80, 38]]), P.red, 3.4, false),
      stroke(line([[80, 30], [72, 38]]), P.red, 3.4, false),
    );
    return parts;
  },

  // all-seven · ALL SEVEN — a traveller's leather backpack, buckled, with a front pocket.
  'all-seven': () => [
    stroke('M40 24 Q40 12 50 12 Q60 12 60 24', P.woodDark, 4),
    fill(rect(22, 22, 56, 65, 11), P.wood),
    hi(rect(64, 26, 14, 58), dark(P.wood, 0.2)),
    fill('M22 34 Q22 22 34 22 L66 22 Q78 22 78 34 L78 48 Q50 56 22 48 Z', dark(P.wood, 0.12)),
    hi('M26 32 Q26 25 34 25 L50 25 Q34 28 30 40 Z', lit(P.wood, 0.3)),
    fill(rect(31, 60, 38, 22, 6), dark(P.wood, 0.08)),
    hi(rect(31, 60, 38, 4, 2), lit(P.wood, 0.25)),
    hi(rect(35, 46, 6, 22), P.woodDark),
    hi(rect(59, 46, 6, 22), P.woodDark),
    fill(rect(33.5, 55, 9, 7, 1.5), P.gold),
    fill(rect(57.5, 55, 9, 7, 1.5), P.gold),
  ],

  // the-grand-tour · THE GRAND TOUR — a globe on a brass meridian and a wooden stand.
  'the-grand-tour': () => [
    fill(ell(50, 84, 22, 5), P.woodDark),
    fill(poly([[46, 72], [54, 72], [57, 83], [43, 83]]), P.wood),
    stroke('M27 62 A27 27 0 0 1 64 19', P.goldDark, 4.5),
    fill(circ(50, 43, 24), P.sea),
    hi('M36 28 Q46 24 50 30 Q48 38 40 38 Q38 46 32 44 Q28 36 36 28 Z', P.leaf),
    hi('M54 44 Q64 40 70 48 Q66 60 58 62 Q52 54 54 44 Z', P.leaf),
    hi('M48 58 Q52 56 54 62 Q50 66 46 63 Z', P.leaf),
    hi('M30 34 A21 21 0 0 1 46 22 Q36 28 33 40 Z', lit(P.sea, 0.45), 0.8),
    hi('M73 46 A23 23 0 0 1 52 66 Q66 60 70 44 Z', dark(P.sea, 0.25)),
    stroke('M64 19 A27 27 0 0 1 36 66', P.gold, 4.5),
    fill(circ(50, 71, 3.5), P.gold),
  ],
};
