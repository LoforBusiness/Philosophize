// The objects for ranks 1–24 (the Clay, Iron, Bronze and Jade orders), keyed by the
// rank's glyph name in data/ranks.ts. See components/shared/insigniaObjects.ts for
// the style and the rules. Zero runtime imports.
import {
  P, lit, dark, mix, rect, circ, ell, poly, line, flame, fill, hi, stroke, type Part,
} from '../insigniaObjects';

// ── local geometry ─────────────────────────────────────────────────────────

/** A bar of width `w` from one point to another, with square ends (a tube, a handle). */
function seg(x1: number, y1: number, x2: number, y2: number, w: number): string {
  const dx = x2 - x1, dy = y2 - y1;
  const L = Math.hypot(dx, dy) || 1;
  const nx = (-dy / L) * (w / 2), ny = (dx / L) * (w / 2);
  return poly([[x1 + nx, y1 + ny], [x2 + nx, y2 + ny], [x2 - nx, y2 - ny], [x1 - nx, y1 - ny]]);
}

/** Points round a rotated ellipse, from angle a0 to a1 (degrees), as an open line. */
function arc(cx: number, cy: number, rx: number, ry: number, rotDeg: number, a0: number, a1: number): string {
  const r = (rotDeg * Math.PI) / 180;
  const pts: [number, number][] = [];
  const n = Math.max(8, Math.round(Math.abs(a1 - a0) / 8));
  for (let i = 0; i <= n; i++) {
    const a = ((a0 + ((a1 - a0) * i) / n) * Math.PI) / 180;
    const x = Math.cos(a) * rx, y = Math.sin(a) * ry;
    pts.push([cx + x * Math.cos(r) - y * Math.sin(r), cy + x * Math.sin(r) + y * Math.cos(r)]);
  }
  return line(pts);
}

/** A quadrilateral point by bilinear interpolation over four corners (tl, tr, br, bl). */
function quadAt(q: [number, number][], u: number, v: number): [number, number] {
  const [tl, tr, br, bl] = q;
  const top: [number, number] = [tl[0] + (tr[0] - tl[0]) * u, tl[1] + (tr[1] - tl[1]) * u];
  const bot: [number, number] = [bl[0] + (br[0] - bl[0]) * u, bl[1] + (br[1] - bl[1]) * u];
  return [top[0] + (bot[0] - top[0]) * v, top[1] + (bot[1] - top[1]) * v];
}

/** A footprint-shaped sandal sole: wide round toe at `top`, narrower heel. */
function sole(cx: number, top: number, len: number, h: number): string {
  const k = h * 1.15;
  return `M${cx} ${top} C${cx + k} ${top} ${cx + h * 1.05} ${top + len * 0.45} ${cx + h * 0.7} ${top + len * 0.72}`
    + ` C${cx + h * 0.55} ${top + len} ${cx - h * 0.55} ${top + len} ${cx - h * 0.7} ${top + len * 0.72}`
    + ` C${cx - h * 1.05} ${top + len * 0.45} ${cx - k} ${top} ${cx} ${top} Z`;
}

const PARCHMENT = mix(P.page, P.wood, 0.22);
const SLATE = '#46565C';
const BOARD_DARK = mix(P.woodDark, P.wood, 0.25);

export const RANK_OBJECTS_A: Record<string, () => Part[]> = {
  // 1 NOVICE — a lit candle in a brass holder: the first light anyone reads by.
  candle: () => [
    fill(ell(50, 80, 26, 7), P.goldDark),
    fill(ell(50, 77, 26, 7), P.gold),
    fill(rect(38, 40, 24, 38, 3), P.wax),
    hi(rect(52, 40, 10, 38, 0), dark(P.wax, 0.12)),
    stroke(line([[50, 40], [50, 33]]), P.ink, 2.2, false),
    fill(flame(50, 34, 13, 24, 1.5), P.flame),
    hi(flame(50, 33, 6.5, 13, 1), P.flameHot),
  ],

  // 2 SEEKER — an open book, the pages fanned.
  book: () => [
    fill('M14 30 Q30 24 50 32 Q70 24 86 30 L86 76 Q70 70 50 78 Q30 70 14 76 Z', P.leather),
    fill('M18 27 Q32 22 49 29 L49 72 Q32 66 18 71 Z', P.paper),
    fill('M51 29 Q68 22 82 27 L82 71 Q68 66 51 72 Z', dark(P.paper, 0.08)),
    stroke(line([[24, 36], [43, 39]]), dark(P.page, 0.25), 2, false),
    stroke(line([[24, 44], [43, 47]]), dark(P.page, 0.25), 2, false),
    stroke(line([[24, 52], [38, 54.5]]), dark(P.page, 0.25), 2, false),
    stroke(line([[57, 39], [76, 36]]), dark(P.page, 0.3), 2, false),
    stroke(line([[57, 47], [76, 44]]), dark(P.page, 0.3), 2, false),
    stroke(line([[57, 55], [72, 52.5]]), dark(P.page, 0.3), 2, false),
  ],

  // 3 APPRENTICE — a white quill standing in a squat navy ink pot.
  quill: () => [
    // the feather first, so the pot hides its nib
    fill('M46 50 C44 34 60 16 86 12 C82 30 70 44 52 52 Z', P.white),
    hi('M49 50 C60 42 74 30 86 12 C82 30 70 44 52 52 Z', dark(P.white, 0.14)),
    hi(poly([[62, 36], [57, 31], [60, 30]]), dark(P.white, 0.14)),
    hi(poly([[71, 26], [67, 21], [70, 20]]), dark(P.white, 0.14)),
    stroke(line([[44, 56], [84, 14]]), mix(P.page, P.wood, 0.35), 2.6, false),
    // the pot
    fill(rect(26, 56, 48, 30, 11), P.night),
    hi(rect(52, 58, 20, 26, 9), dark(P.night, 0.25)),
    fill(rect(38, 49, 24, 9, 2), dark(P.night, 0.15)),
    fill(rect(34, 45, 32, 6, 3), lit(P.night, 0.18)),
    hi(ell(35, 68, 3.5, 7), lit(P.night, 0.45)),
  ],

  // 4 STUDENT — a scroll hanging half unrolled between two wooden rollers.
  scroll: () => [
    fill(rect(26, 22, 48, 42), PARCHMENT),
    hi(rect(60, 24, 14, 40), dark(PARCHMENT, 0.1)),
    stroke(line([[32, 33], [64, 33]]), dark(PARCHMENT, 0.4), 2.6, false),
    stroke(line([[32, 41], [64, 41]]), dark(PARCHMENT, 0.4), 2.6, false),
    stroke(line([[32, 49], [54, 49]]), dark(PARCHMENT, 0.4), 2.6, false),
    // the rolled-up remainder at the foot
    fill(rect(22, 60, 56, 14, 7), PARCHMENT),
    hi(rect(24, 61, 52, 4, 2), lit(PARCHMENT, 0.45)),
    hi(rect(24, 69, 52, 4, 2), dark(PARCHMENT, 0.18)),
    fill(circ(18, 67, 6), P.wood),
    fill(circ(82, 67, 6), P.woodDark),
    // the top roller
    fill(rect(18, 15, 64, 10, 5), P.wood),
    hi(rect(22, 16, 56, 3, 1.5), lit(P.wood, 0.3)),
    fill(circ(15, 20, 6), P.wood),
    fill(circ(85, 20, 6), P.woodDark),
    // a red seal
    fill(circ(62, 78, 6), P.red),
    hi(circ(60.5, 76.5, 2.2), lit(P.red, 0.4)),
  ],

  // 5 READER — three books stacked flat, round reading glasses folded on top.
  page: () => [
    fill(rect(13, 68, 72, 15, 2), P.teal),
    hi(rect(13, 78, 72, 5, 0), dark(P.teal, 0.25)),
    stroke(line([[22, 69], [22, 82]]), P.gold, 2.6, false),
    stroke(line([[76, 69], [76, 82]]), P.gold, 2.6, false),
    fill(rect(20, 54, 64, 14, 2), P.violet),
    hi(rect(20, 64, 64, 4, 0), dark(P.violet, 0.25)),
    stroke(line([[30, 55], [30, 67]]), P.gold, 2.6, false),
    stroke(line([[74, 55], [74, 67]]), P.gold, 2.6, false),
    fill(rect(16, 41, 66, 13, 2), P.ember),
    hi(rect(16, 50, 66, 4, 0), dark(P.ember, 0.25)),
    stroke(line([[25, 42], [25, 53]]), P.flameHot, 2.6, false),
    // the glasses
    stroke(arc(50, 30, 6, 5, 0, 200, 340), P.goldDark, 3.2, false),
    fill(circ(36, 31, 9.5), P.goldDark),
    fill(circ(64, 31, 9.5), P.goldDark),
    hi(circ(36, 31, 6.8), P.glass),
    hi(circ(64, 31, 6.8), P.glass),
    stroke('M31.5 30 Q32 26 36 25.4', P.white, 2.2, false),
    stroke('M59.5 30 Q60 26 64 25.4', P.white, 2.2, false),
  ],

  // 6 SCRIBE — a slate in a wooden frame, a red feather pen writing on it.
  feather: () => [
    fill(rect(14, 22, 60, 64, 5), P.wood),
    hi(rect(16, 24, 56, 4, 2), lit(P.wood, 0.3)),
    fill(rect(21, 29, 46, 50, 2), SLATE, false),
    hi(rect(21, 29, 46, 6, 0), dark(SLATE, 0.3)),
    stroke('M27 42 Q31 38 35 42 T43 42 T51 42 T59 42', P.cream, 2.6, false),
    stroke('M27 53 Q31 49 35 53 T43 53 T51 53', P.cream, 2.6, false),
    stroke('M27 64 Q30 61 33 64', P.cream, 2.6, false),
    // the pen, its nib at the end of the last line
    fill('M36 65 C40 46 60 26 88 18 C80 36 64 52 41 67 Z', P.rose),
    hi('M39 66 C52 54 68 40 88 18 C80 36 64 52 41 67 Z', dark(P.rose, 0.22)),
    stroke(line([[34, 68], [86, 20]]), mix(P.page, P.wood, 0.4), 2.6, false),
  ],

  // 7 QUESTIONER — a speech bubble holding one big question mark.
  question: () => [
    fill(rect(14, 14, 72, 56, 18), P.teal),
    fill(poly([[28, 64], [20, 86], [44, 66]]), P.teal),
    hi(rect(56, 18, 26, 48, 14), dark(P.teal, 0.18)),
    hi(ell(28, 26, 7, 4), lit(P.teal, 0.4)),
    stroke('M39 33 C39 21 62 21 62 33 C62 43 50 42 50 52', P.white, 8, false),
    fill(circ(50, 61, 4.8), P.white, false),
  ],

  // 8 DOUBTER — a magnifying glass: brass rim, pale lens with a glint, wooden handle.
  magnifier: () => [
    stroke(line([[62, 62], [80, 80]]), P.woodDark, 10),
    hi(seg(60, 58, 78, 76, 3), lit(P.woodDark, 0.25)),
    fill(seg(55, 55, 63, 63, 12), P.goldDark),
    fill(circ(42, 42, 25), P.gold),
    hi('M42 17 A25 25 0 0 1 67 42 A25 25 0 0 1 42 67 Z', dark(P.gold, 0.18)),
    fill(circ(42, 42, 18), P.glass),
    hi(circ(46, 46, 14), mix(P.glass, P.sky, 0.45)),
    stroke(arc(42, 42, 12, 12, 0, 195, 255), P.white, 4, false),
    hi(circ(52, 51, 2.4), P.white),
  ],

  // 9 INQUIRER — a spyglass: leather barrel, silver draw tubes, a lens at the big end.
  eye: () => [
    fill(seg(16, 84, 30, 70, 10), P.steel),
    fill(seg(28, 72, 48, 52, 14), P.silver),
    hi(seg(29, 75, 49, 55, 4), dark(P.silver, 0.18)),
    fill(seg(46, 54, 76, 24, 21), P.leather),
    hi(seg(51, 57, 79, 29, 7), dark(P.leather, 0.28)),
    hi(seg(43, 46, 69, 20, 3.5), lit(P.leather, 0.3)),
    fill(seg(44, 56, 50, 50, 23), P.silver),
    fill(seg(71, 29, 79, 21, 25), P.silver),
    hi(seg(76, 30, 82, 24, 9), dark(P.silver, 0.2)),
    fill(arc(79.5, 20.5, 12.5, 4.6, 45, 0, 360), P.glass),
    hi(arc(78.5, 19.5, 7, 2, 45, 0, 360), P.white, 0.9),
  ],

  // 10 EXAMINER — an exam paper on a clipboard, red ticks and a cross down the margin.
  xcross: () => [
    fill(rect(20, 16, 60, 72, 5), P.wood),
    hi(rect(64, 18, 14, 68, 4), dark(P.wood, 0.2)),
    fill(rect(26, 25, 48, 57, 1), P.paper),
    hi(rect(62, 25, 12, 57, 0), dark(P.paper, 0.06)),
    fill(rect(37, 11, 26, 13, 3), P.silver),
    hi(rect(39, 13, 22, 3, 1.5), P.white),
    fill(circ(50, 17.5, 2.6), P.steel, false),
    stroke(line([[46, 38], [68, 38]]), P.stone, 3, false),
    stroke(line([[46, 52], [68, 52]]), P.stone, 3, false),
    stroke(line([[46, 66], [64, 66]]), P.stone, 3, false),
    stroke(line([[31, 37], [35, 41], [41, 33]]), P.red, 4, false),
    stroke(line([[31, 51], [35, 55], [41, 47]]), P.red, 4, false),
    stroke(line([[32, 61], [40, 69]]), P.red, 4, false),
    stroke(line([[40, 61], [32, 69]]), P.red, 4, false),
  ],

  // 11 SCEPTIC — a chain snapped in the middle: two whole links, two opened halves.
  chain: () => [
    stroke(arc(25, 75, 13, 7.5, -45, 0, 360), P.steel, 6.5),
    stroke(arc(38, 62, 13, 7.5, -45, 75, 375 - 85), P.steel, 6.5),
    stroke(arc(62, 38, 13, 7.5, -45, -105, 105), P.steel, 6.5),
    stroke(arc(75, 25, 13, 7.5, -45, 0, 360), P.steel, 6.5),
    stroke(arc(25, 75, 13, 7.5, -45, 200, 250), lit(P.steel, 0.55), 2.4, false),
    stroke(arc(75, 25, 13, 7.5, -45, 200, 250), lit(P.steel, 0.55), 2.4, false),
    stroke(arc(38, 62, 13, 7.5, -45, 200, 250), lit(P.steel, 0.55), 2.4, false),
    stroke(arc(62, 38, 13, 7.5, -45, 200, 250), lit(P.steel, 0.55), 2.4, false),
    stroke(line([[46, 46], [42, 42]]), P.ember, 2.6, false),
    stroke(line([[54, 54], [58, 58]]), P.ember, 2.6, false),
    stroke(line([[52, 44], [56, 40]]), P.ember, 2.6, false),
  ],

  // 12 CYNIC — a violet theatre mask with a lopsided smile, gold ribbons at the sides.
  mask: () => [
    stroke('M20 34 Q10 46 14 60', P.gold, 4),
    stroke('M80 34 Q90 46 86 60', P.gold, 4),
    fill('M18 24 Q50 10 82 24 Q86 58 50 88 Q14 58 18 24 Z', P.violet),
    hi('M50 17 Q70 16 82 24 Q86 58 50 88 Z', dark(P.violet, 0.18)),
    hi(ell(30, 28, 6, 3.5), lit(P.violet, 0.4)),
    fill('M26 42 Q34 32 44 42 Q34 46 26 42 Z', P.ink, false),
    fill('M56 42 Q66 32 74 42 Q66 46 56 42 Z', P.ink, false),
    stroke('M27 34 Q34 28 42 33', dark(P.violet, 0.45), 2.6, false),
    stroke('M58 31 Q66 26 74 31', dark(P.violet, 0.45), 2.6, false),
    fill('M32 58 Q52 64 70 52 Q66 72 48 72 Q36 70 32 58 Z', P.ink, false),
    hi('M40 66 Q50 70 60 66 Q54 71 48 71 Q43 70 40 66 Z', P.red),
  ],

  // 13 REASONER — brass balance scales, the beam level.
  scales: () => [
    fill(poly([[30, 86], [70, 86], [62, 78], [38, 78]]), P.goldDark),
    fill(rect(46, 30, 8, 50, 2), P.gold),
    hi(rect(50, 30, 4, 50, 0), dark(P.gold, 0.2)),
    fill(rect(14, 27, 72, 6, 3), P.gold),
    fill(circ(50, 26, 6), P.gold),
    hi(circ(48.5, 24.5, 2.2), lit(P.gold, 0.55)),
    stroke(line([[18, 32], [12, 58], [36, 58], [30, 32]]), P.goldDark, 2.4, false),
    stroke(line([[70, 32], [64, 58], [88, 58], [82, 32]]), P.goldDark, 2.4, false),
    fill('M10 58 H38 Q36 70 24 70 Q12 70 10 58 Z', P.gold),
    hi('M24 58 H38 Q36 70 24 70 Z', dark(P.gold, 0.2)),
    fill('M62 58 H90 Q88 70 76 70 Q64 70 62 58 Z', P.gold),
    hi('M76 58 H90 Q88 70 76 70 Z', dark(P.gold, 0.2)),
  ],

  // 14 LOGICIAN — a white knight standing on the corner of a chessboard.
  grid: () => {
    const q: [number, number][] = [[22, 62], [78, 62], [88, 84], [12, 84]];
    const parts: Part[] = [
      fill(poly([[12, 84], [88, 84], [88, 89], [12, 89]]), P.woodDark),
      fill(poly(q), mix(P.page, P.wood, 0.15)),
    ];
    const cols = 4, rows = 2;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if ((r + c) % 2 === 0) continue;
        parts.push(hi(poly([
          quadAt(q, c / cols, r / rows), quadAt(q, (c + 1) / cols, r / rows),
          quadAt(q, (c + 1) / cols, (r + 1) / rows), quadAt(q, c / cols, (r + 1) / rows),
        ]), BOARD_DARK));
      }
    }
    parts.push(
      fill(rect(30, 64, 40, 9, 4), P.marble),
      hi(rect(52, 65, 17, 7, 3), dark(P.marble, 0.14)),
      fill(rect(35, 58, 30, 8, 3), P.marble),
      fill('M38 60 C36 50 40 44 46 40 L34 42 C27 42 25 35 30 31 L44 20 C46 17 50 16 52 16'
        + ' L55 11 L59 17 C67 20 71 30 69 42 C68 50 65 54 63 60 Z', P.marble),
      hi('M59 17 C67 20 71 30 69 42 C68 50 65 54 63 60 L56 60 C60 50 62 36 58 20 Z', dark(P.marble, 0.14)),
      fill(circ(45, 28, 2.3), P.ink, false),
    );
    return parts;
  },

  // 15 DIALECTICIAN — two speech bubbles facing each other, blue and green.
  cycle: () => [
    fill(rect(12, 14, 50, 34, 14), P.lapis),
    fill(poly([[20, 42], [14, 58], [34, 46]]), P.lapis),
    hi(ell(24, 22, 6, 3), lit(P.lapis, 0.4)),
    fill(circ(26, 31, 3.6), P.white, false),
    fill(circ(37, 31, 3.6), P.white, false),
    fill(circ(48, 31, 3.6), P.white, false),
    fill(rect(38, 50, 50, 34, 14), P.jade),
    fill(poly([[80, 78], [86, 92 - 4], [66, 82]]), P.jade),
    hi(ell(50, 58, 6, 3), lit(P.jade, 0.4)),
    fill(circ(52, 67, 3.6), P.white, false),
    fill(circ(63, 67, 3.6), P.white, false),
    fill(circ(74, 67, 3.6), P.white, false),
  ],

  // 16 ANALYST — an archery target with an arrow in the bullseye.
  dottarget: () => [
    fill(circ(44, 56, 31), P.red),
    fill(circ(44, 56, 24), P.cream, false),
    fill(circ(44, 56, 17), P.red, false),
    fill(circ(44, 56, 10), P.cream, false),
    fill(circ(44, 56, 5), P.red, false),
    hi('M44 25 A31 31 0 0 1 44 87 A28 31 0 0 0 44 25 Z', dark(P.red, 0.25), 0.55),
    stroke(line([[46, 54], [78, 22]]), P.wood, 4.5),
    fill(poly([[72, 22], [78, 12], [88, 12], [80, 20]]), P.teal),
    fill(poly([[78, 28], [88, 22], [88, 12], [80, 20]]), dark(P.teal, 0.2)),
  ],

  // 17 RHETORICIAN — a speaker's podium with a scroll laid on its sloping top.
  wheel: () => [
    fill(rect(24, 80, 52, 8, 2), P.woodDark),
    fill(poly([[27, 38], [73, 38], [67, 82], [33, 82]]), P.wood),
    hi(poly([[58, 38], [73, 38], [67, 82], [56, 82]]), dark(P.wood, 0.2)),
    fill(circ(50, 58, 8), P.gold),
    hi(circ(48, 56, 3), lit(P.gold, 0.5)),
    fill(poly([[16, 32], [84, 32], [80, 42], [20, 42]]), P.woodDark),
    hi(poly([[18, 33], [82, 33], [81, 35.5], [19, 35.5]]), lit(P.woodDark, 0.3)),
    fill(rect(26, 20, 48, 12, 6), P.paper),
    hi(rect(28, 26, 44, 5, 2.5), dark(P.paper, 0.12)),
    fill(ell(26, 26, 4, 6), P.page),
    fill(ell(74, 26, 4, 6), P.page),
    fill(poly([[44, 31], [56, 31], [52, 38], [48, 38]]), P.red, false),
  ],

  // 18 DISPUTANT — an iron anvil with a hammer laid across its face.
  anvil: () => [
    fill('M12 38 Q22 33 32 33 L86 33 L86 45 L66 47 Q58 51 60 62 L76 70 L78 80 L22 80 L24 70 L40 62 Q42 51 34 47 Q22 45 12 38 Z', P.iron),
    hi('M30 34 L85 34 L85 38 L30 38 Q20 37 14 38 Q22 34 30 34 Z', lit(P.iron, 0.35)),
    hi('M60 47 L66 47 Q58 51 60 62 L76 70 L78 80 L58 80 L56 66 Z', dark(P.iron, 0.25)),
    stroke(line([[44, 23], [84, 15]]), P.wood, 5.5),
    fill(seg(37, 13, 41, 32, 10), P.steel),
    hi(seg(35.2, 13.4, 39, 31.6, 3.2), lit(P.steel, 0.4)),
  ],

  // 19 NATURALIST — a broadleaf tree: one scalloped crown over a short trunk.
  tree: () => [
    fill(ell(50, 84, 22, 4), P.moss),
    fill('M44 84 L46 58 L54 58 L56 84 Q50 82 44 84 Z', P.wood),
    hi('M51 58 L54 58 L56 84 Q53 83 51 83 Z', P.woodDark),
    fill(circ(50, 30, 17), P.leaf),
    fill(circ(31, 41, 14), P.leaf),
    fill(circ(69, 41, 14), P.leaf),
    fill(circ(38, 55, 12), P.leaf),
    fill(circ(62, 55, 12), P.leaf),
    fill(circ(50, 46, 16), P.leaf),
    hi(circ(64, 50, 12), P.leafDark),
    hi(circ(54, 58, 8), P.leafDark),
    hi(circ(43, 27, 9), lit(P.leaf, 0.22)),
    hi(circ(29, 38, 6), lit(P.leaf, 0.22)),
  ],

  // 20 ETHICIST — a red heart, cut like a stone: lit left half, shaded right.
  heart: () => [
    fill('M50 84 C28 68 14 54 14 38 C14 26 23 18 33 18 C41 18 47 23 50 29 C53 23 59 18 67 18 C77 18 86 26 86 38 C86 54 72 68 50 84 Z', P.red),
    hi('M50 29 C53 23 59 18 67 18 C77 18 86 26 86 38 C86 54 72 68 50 84 Z', dark(P.red, 0.22)),
    hi(ell(30, 32, 7, 5), lit(P.red, 0.45)),
    hi(circ(24, 40, 2.4), P.white, 0.9),
  ],

  // 21 MORALIST — a weeping willow: a dome whose fronds hang down to the ground.
  willow: () => {
    // the curtain's hem: long thin frond tips, opening in the middle onto the trunk
    const hem: [number, number][] = [
      [84, 76], [81, 86], [78, 70], [74, 84], [70, 66], [66, 80], [62, 62], [58, 56],
      [42, 56], [38, 62], [34, 80], [30, 66], [26, 84], [22, 70], [19, 86], [16, 76],
    ];
    const crown = 'M16 76 C10 46 26 16 50 15 C74 16 90 46 84 76 L'
      + hem.slice(1).map(([x, y]) => `${x} ${y}`).join(' L') + ' Z';
    return [
      fill(ell(50, 86, 14, 3), P.leafDark),
      fill('M45 87 L47 52 L53 52 L55 87 Z', P.wood),
      hi('M50.5 52 L53 52 L55 87 L51.5 87 Z', P.woodDark),
      fill(crown, P.moss),
      hi('M50 15 C74 16 90 46 84 76 L81 86 L78 70 L74 84 L70 66 L66 80 L62 62 Q72 40 50 15 Z', dark(P.moss, 0.2)),
      hi(ell(36, 26, 8, 4.5), lit(P.moss, 0.3)),
      // Hanging strands, heavier and lighter than before: at 22pt the fronds are
      // what says WILLOW rather than a green dome.
      stroke('M24 38 Q17 58 22 84', lit(P.moss, 0.42), 3.4, false),
      stroke('M33 27 Q26 50 30 80', lit(P.moss, 0.42), 3.4, false),
      stroke('M42 21 Q37 42 39 60', lit(P.moss, 0.42), 3.4, false),
      stroke('M58 21 Q63 42 61 60', dark(P.moss, 0.38), 3.4, false),
      stroke('M67 27 Q74 50 70 80', dark(P.moss, 0.38), 3.4, false),
      stroke('M76 38 Q83 58 78 84', dark(P.moss, 0.38), 3.4, false),
    ];
  },

  // 22 STOIC — a grey boulder, a small flower growing out of a crack in it.
  flower: () => [
    stroke('M50 46 C49 36 52 30 50 24', P.leafDark, 3.2),
    fill('M50 40 C42 34 36 38 36 42 C42 44 46 43 50 40 Z', P.leaf),
    fill('M51 34 C58 28 64 30 65 34 C59 37 55 37 51 34 Z', P.leaf),
    fill(circ(50, 15, 5), P.rose),
    fill(circ(57, 20, 5), P.rose),
    fill(circ(54, 28, 5), P.rose),
    fill(circ(46, 28, 5), P.rose),
    fill(circ(43, 20, 5), P.rose),
    fill(circ(50, 22, 4.2), P.flameHot, false),
    fill('M12 84 C8 68 16 52 30 48 C36 40 52 38 60 44 C74 42 88 54 88 70 C89 80 86 84 80 84 Z', P.stone),
    hi('M60 44 C74 42 88 54 88 70 C89 80 86 84 80 84 L62 84 C70 70 68 54 60 44 Z', P.stoneDark),
    hi(ell(28, 56, 7, 4), lit(P.stone, 0.4)),
    stroke(line([[50, 41], [46, 52], [52, 60], [48, 72]]), dark(P.stoneDark, 0.35), 3, false),
  ],

  // 23 PERIPATETIC — a pair of leather sandals, one stepping ahead of the other.
  lotus: () => {
    const tan = lit(P.wood, 0.22);
    const one = (cx: number, top: number): Part[] => [
      fill(sole(cx, top, 62, 13), tan),
      hi(sole(cx + 2.5, top + 3, 56, 9), dark(tan, 0.12)),
      stroke(line([[cx - 12, top + 24], [cx, top + 11], [cx + 12, top + 24]]), P.leather, 4.5, false),
      stroke(line([[cx, top + 11], [cx, top + 22]]), P.leather, 4.5, false),
      stroke(line([[cx - 10, top + 46], [cx + 10, top + 46]]), P.leather, 4.5, false),
      stroke(line([[cx - 11, top + 24], [cx + 11, top + 24]]), P.leatherDark, 4.5, false),
    ];
    return [...one(32, 24), ...one(67, 12)];
  },

  // 24 COSMOPOLITE — a hump-backed stone arch bridge over blue water.
  // The first drawing read as a bowl: a flat-topped block over a half-circle. A
  // humpback bridge is its HUMP — the deck rises steeply to a crest — and its arch
  // with the reflection under it, which makes the full ring every reference shows.
  bridge: () => {
    const voussoirs: Part[] = [];
    for (let i = 1; i < 8; i++) {
      const a = Math.PI + (i * Math.PI) / 8;
      voussoirs.push(stroke(line([
        [50 + 27 * Math.cos(a), 78 + 27 * Math.sin(a)],
        [50 + 34 * Math.cos(a), 78 + 34 * Math.sin(a)],
      ]), dark(P.stoneDark, 0.2), 2.4, false));
    }
    return [
      fill(rect(4, 76, 92, 16, 3), P.sea),
      hi(ell(50, 80, 22, 9), dark(P.sea, 0.28)),
      hi(ell(50, 80, 16, 5), dark(P.sea, 0.12)),
      stroke('M10 87 Q14 85 18 87 M80 87 Q84 85 88 87', lit(P.sea, 0.45), 2.2, false),
      fill('M2 78 Q8 70 18 72 L24 78 Z', P.moss),
      fill('M98 78 Q92 70 82 72 L76 78 Z', dark(P.moss, 0.12)),
      fill('M6 66 Q50 10 94 66 L94 78 L77 78 A27 27 0 0 0 23 78 L6 78 Z', P.stone),
      hi('M50 38 Q74 40 94 66 L94 78 L77 78 A27 27 0 0 0 50 51 Z', P.stoneDark, 0.65),
      hi('M6 66 Q50 10 94 66 L94 70 Q50 16 6 70 Z', lit(P.stone, 0.45)),
      stroke(arc(50, 78, 27, 27, 0, 180, 360), dark(P.stoneDark, 0.3), 3, false),
      ...voussoirs,
    ];
  },
};

