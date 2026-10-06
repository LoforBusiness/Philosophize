// economics-foundations-5, "The Rat-Tail Reward" — THE TOWN HALL.
// The furniture and the cellar hatch, drawn instead of stacked from boxes (LESSON_RULES
// AM13). REFERENCE (Commons "Sawhorse.svg", an oak frame in flat tones): a plank is a LIT
// top face, a mid-tone front and a pale cut edge, with ONE dark outline round each piece;
// iron is near-black with a lighter upper edge. Flat fills lit from the top left, no
// gradients, no glows. Each picture takes the box of the object it replaces. Zero imports.

const INK = '#2B2420';
const OAK = { lit: '#C99555', mid: '#A8743F', dark: '#7A5230', edge: '#E0B77C' };
const STN = { lit: '#BDB6A5', mid: '#A19A89', dark: '#7C7667' };
const IRON = { base: '#3B3B40', lit: '#6A6A72' };
const f = (v) => +v.toFixed(2);
const r = (x, y, w, h, c, o = 0.9, rx = 0.5) =>
  `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" rx="${rx}" fill="${c}" stroke="${INK}" stroke-width="${o}" stroke-linejoin="round"/>`;
const n = (x, y, w, h, c, rx = 0) => `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" rx="${rx}" fill="${c}"/>`;
const ln = (x1, y1, x2, y2, c, w) => `<path d="M${f(x1)},${f(y1)} L${f(x2)},${f(y2)}" stroke="${c}" stroke-width="${w}" stroke-linecap="round" fill="none"/>`;
const poly = (d, c, o = 0.9) => `<path d="${d}" fill="${c}" stroke="${INK}" stroke-width="${o}" stroke-linejoin="round"/>`;

// ── the mayor's table: 154 × 30. A thick plank top seen slightly from above, an apron,
// two turned legs with a stretcher between, and a few plank joints and grain marks. ──
function table() {
  let s = '';
  // legs and stretcher first (behind the apron)
  for (const x of [8, 138]) {
    s += r(x, 12, 9, 18, OAK.mid, 0.9, 1);
    s += n(x + 1, 13, 2.2, 16, OAK.lit, 0.6);
    s += r(x - 1.2, 27.4, 11.4, 2.6, OAK.dark, 0.9, 1); // foot block
    s += r(x - 0.5, 12, 10, 2.4, OAK.dark, 0.8, 0.8); // collar
  }
  s += r(17, 21.5, 121, 3.6, OAK.mid, 0.9, 0.8);
  s += n(18, 22, 119, 1, OAK.lit);
  // apron
  s += r(4, 8, 146, 5.4, OAK.dark, 0.9, 0.8);
  s += n(5, 8.8, 144, 1, OAK.mid);
  // top: lit face, then the front edge
  s += poly('M1.5,1.4 Q1.5,0.6 2.4,0.6 L151.6,0.6 Q152.5,0.6 152.5,1.4 L154,6 Q154,8 152.4,8 L1.6,8 Q0,8 0,6 Z', OAK.lit);
  s += n(1.8, 5.2, 150.4, 2.6, OAK.mid);
  s += ln(2, 5.2, 152, 5.2, OAK.dark, 0.5);
  // plank joints and grain on the top face
  for (const x of [42, 88, 120]) s += ln(x, 1.2, x, 5, OAK.dark, 0.5);
  for (const [x, w] of [[12, 22], [52, 28], [96, 18], [128, 16]]) s += ln(x, 2.3, x + w, 2.3, OAK.edge, 0.6);
  // iron corner straps
  for (const x of [6, 143]) s += r(x, 0.4, 5, 7.8, IRON.base, 0.5, 0.6);
  return s;
}

// ── the dais: 168 × 22. A low stone step: lit top, a face of dressed blocks. ──
function dais() {
  let s = poly('M3,0.6 L165,0.6 L168,5 L0,5 Z', STN.lit);
  s += ln(5, 2.2, 160, 2.2, '#D6D0C0', 0.6);
  s += r(0, 5, 168, 17, STN.mid, 0.9, 1);
  s += n(1, 5.9, 166, 1.4, STN.lit);
  // two courses of blocks, the joints staggered
  const rows = [[6, 28], [11.5, 34]];
  s += ln(1, 13.5, 167, 13.5, STN.dark, 0.7);
  for (let k = 0; k < 6; k += 1) s += ln(8 + k * 29, 6.5, 8 + k * 29, 13.5, STN.dark, 0.7);
  for (let k = 0; k < 6; k += 1) s += ln(22 + k * 29, 13.5, 22 + k * 29, 21.5, STN.dark, 0.7);
  s += n(1, 19.2, 166, 2.2, STN.dark, 0.5);
  void rows;
  return s;
}

// ── the cellar hatch, hinged along its far edge. Shut it is a 50 × 15 foreshortened
// lid of planks; standing up it is 50 × 34 and shows its underside. ──
function hole() {
  // the opening in the flagstones: a stone rim round a black drop, with the top rungs of a ladder
  let s = poly('M3,0.8 L47,0.8 Q49.4,0.8 49.4,3 L49.4,13 Q49.4,14.4 48,14.4 L2,14.4 Q0.6,14.4 0.6,13 L0.6,3 Q0.6,0.8 3,0.8 Z', STN.mid);
  s += n(2.6, 2.6, 44.8, 9.6, '#16120F', 1);
  s += n(2.6, 2.6, 44.8, 2.2, '#241E19', 0.6);
  s += r(11, 3.6, 2, 8, OAK.mid, 0.5, 0.4) + r(37, 3.6, 2, 8, OAK.mid, 0.5, 0.4);
  s += r(11, 6.2, 28, 1.6, OAK.lit, 0.5, 0.4) + r(11, 9.6, 28, 1.6, OAK.lit, 0.5, 0.4);
  s += n(1.2, 12.4, 47.6, 1.6, STN.lit, 0.4);
  return s;
}
function lidTop() {
  let s = r(0.6, 0.6, 48.8, 13.6, OAK.mid, 1, 1);
  s += n(1.4, 1.4, 47.2, 2.2, OAK.lit, 0.6);
  for (const x of [13, 25, 37]) s += ln(x, 1.4, x, 13.4, OAK.dark, 0.6);
  for (const [x, w] of [[3, 8], [15, 8], [27, 9], [39, 7]]) s += ln(x, 6, x + w, 6, OAK.edge, 0.5);
  // iron strap hinges at the far end and a ring pull on the near edge
  for (const x of [5, 38]) s += r(x, 0.6, 7, 3.4, IRON.base, 0.5, 0.6) + n(x + 0.6, 0.9, 5.8, 0.7, IRON.lit);
  s += r(41.6, 11.1, 2.6, 2.6, IRON.base, 0.5, 1.3);
  s += `<circle cx="42.9" cy="11.4" r="2.1" fill="none" stroke="${INK}" stroke-width="1.5"/><circle cx="42.9" cy="11.4" r="2.1" fill="none" stroke="${IRON.lit}" stroke-width="0.7"/>`;
  return s;
}
function lidUnder() {
  // upright, seen from behind-below: dark planks with two cross battens, 50 × 34
  let s = r(0.6, 0.6, 48.8, 32.8, OAK.dark, 1, 1);
  for (const x of [13, 25, 37]) s += ln(x, 1.2, x, 33, '#5A3B22', 0.6);
  s += r(0.6, 6, 48.8, 4.2, OAK.mid, 0.8, 0.6);
  s += r(0.6, 23.6, 48.8, 4.2, OAK.mid, 0.8, 0.6);
  s += n(1.4, 6.6, 47.2, 0.9, OAK.lit, 0.3) + n(1.4, 24.2, 47.2, 0.9, OAK.lit, 0.3);
  for (const x of [4, 45]) { s += `<circle cx="${x}" cy="8.1" r="0.9" fill="${IRON.base}"/><circle cx="${x}" cy="25.7" r="0.9" fill="${IRON.base}"/>`; }
  s += `<circle cx="42.9" cy="31" r="2.1" fill="none" stroke="${INK}" stroke-width="1.5"/><circle cx="42.9" cy="31" r="2.1" fill="none" stroke="${IRON.lit}" stroke-width="0.7"/>`;
  return s;
}

// ── the cabbage crate: 36 × 22, slatted, with a dark inside above the front board ──
function crate() {
  let s = r(0.6, 0.6, 34.8, 20.8, OAK.dark, 1, 1);
  s += r(0.6, 5.4, 34.8, 4.6, OAK.lit, 0.9, 0.6);
  s += r(0.6, 11, 34.8, 4.8, OAK.mid, 0.9, 0.6);
  s += r(0.6, 16.4, 34.8, 4.8, OAK.lit, 0.9, 0.6);
  for (const x of [4, 32]) s += r(x - 2, 0.6, 4, 20.6, OAK.mid, 0.9, 0.6) + n(x - 1.2, 1.2, 1, 19.4, OAK.lit);
  s += ln(8, 7.6, 26, 7.6, OAK.edge, 0.5) + ln(9, 13.4, 20, 13.4, OAK.edge, 0.5) + ln(14, 18.8, 28, 18.8, OAK.edge, 0.5);
  return s;
}

export const ART = [
  { name: 'econ5-table', svg: table, view: { x: 0, y: 0, w: 154, h: 30 }, box: { x: 10, y: 452, w: 154, h: 30 } },
  { name: 'econ5-dais', svg: dais, view: { x: 0, y: 0, w: 168, h: 22 }, box: { x: 2, y: 478, w: 168, h: 22 } },
  { name: 'econ5-hole', svg: hole, view: { x: 0, y: 0, w: 50, h: 15 }, box: { x: 0, y: 0, w: 50, h: 15 } },
  { name: 'econ5-lid-top', svg: lidTop, view: { x: 0, y: 0, w: 50, h: 15 }, box: { x: 0, y: 0, w: 50, h: 15 } },
  { name: 'econ5-lid-under', svg: lidUnder, view: { x: 0, y: 0, w: 50, h: 34 }, box: { x: 0, y: 0, w: 50, h: 34 } },
  { name: 'econ5-crate', svg: crate, view: { x: 0, y: 0, w: 36, h: 22 }, box: { x: 298, y: 478, w: 36, h: 22 } },
];
