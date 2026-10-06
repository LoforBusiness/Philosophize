// philosophy-foundations-2, "What Makes an Argument Good?" — A PAVEMENT CAFÉ, drawn
// (LESSON_RULES AM13). Every picture is drawn in its own box's units and takes the box of
// the shape-built object it replaces, so nothing on the stage moves. Flat fills lit from
// the top left, a shaded side, ONE dark outline, the colours the real things are. Zero imports.
//
// REFERENCES (Commons, fetched with `npm run ref`):
//   p2cake-1  "Carrot cake slice and latte" (Saltmarsh Farmhouse & Cafe) — a brown spiced
//             sponge, a cream-cheese frosting piped in overlapping swirls on top, chopped
//             walnuts scattered on it, on a white china plate.
//   psy1cafe  a café counter — glass, steel and a warm lit room behind the hatch.
//   Plus the earlier café references already in objects.ts: a round marble top on one
//   cast-iron pedestal with a collar and a flared foot; a canvas awning in broad stripes
//   ending in a scalloped valance over a painted-wood front.
//
//   phil2-table   the standing bistro table, at (214, 474) 36 × 26 — and phil2-table-w at 254
//   phil2-cake    the slice, about its centre, 20 × 13 (the eaten-clip rider keeps it)
//   phil2-plate   the white plate, about its centre, 30 × 10
//   phil2-cafe    the café front, 296–400 × 306–500: striped awning, name board, hatch, ledge

const INK = '#2B2420';
const fill = (d, c, w = 0.5) => `<path d="${d}" fill="${c}" stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"/>`;
const tone = (d, c, o = 1) => `<path d="${d}" fill="${c}"${o < 1 ? ` opacity="${o}"` : ''}/>`;
const line = (d, c, w) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const ell = (cx, cy, rx, ry, c, w = 0.5) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${c}"${w ? ` stroke="${INK}" stroke-width="${w}"` : ''}/>`;
const rect = (x, y, w, h, c, sw = 0.5, r = 0) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${c}"${sw ? ` stroke="${INK}" stroke-width="${sw}" stroke-linejoin="round"` : ''}/>`;

// ── the standing bistro table (box 214, 474, 36 × 26) ────────────────────────
function table() {
  const o = [];
  // the cast-iron foot, flaring to the floor, then the column and its collar
  o.push(fill('M16,19 C15,21.2 11.5,22.4 8.4,23.4 C6.8,24 6.9,25.5 9,25.6 L27,25.6 C29.1,25.5 29.2,24 27.6,23.4 C24.5,22.4 21,21.2 20,19 Z', '#565B61'));
  o.push(tone('M20,19 C21,21.2 24.5,22.4 27.6,23.4 C29.2,24 29.1,25.5 27,25.6 L24,25.6 C25.5,24.4 22.5,22.2 19.4,20.4 Z', '#393D42'));
  o.push(tone('M9,24 C10,23.5 12.5,22.8 14.5,22 L14.5,22.6 C12,23.5 10,24.2 9.2,24.6 Z', '#7D838A'));
  o.push(fill('M16.5,7.4 L19.5,7.4 L19.8,19.4 L16.2,19.4 Z', '#565B61'));
  o.push(tone('M18.4,7.4 L19.5,7.4 L19.8,19.4 L18.6,19.4 Z', '#393D42'));
  o.push(tone('M16.7,8 L17.3,8 L17.1,19 L16.5,19 Z', '#7D838A'));
  o.push(fill('M15.4,12.2 L20.6,12.2 L20.4,13.4 L15.6,13.4 Z', '#565B61'));        // the ring on the column
  o.push(fill('M13.4,5.6 L22.6,5.6 L20.2,7.8 L15.8,7.8 Z', '#565B61'));            // the collar under the top
  // the marble top: its edge in shade, then the round top lit from the top left, veined
  o.push(fill('M0.2,2.6 L0.2,4.4 C0.2,6.2 35.8,6.2 35.8,4.4 L35.8,2.6 Z', '#C8C5BC'));
  o.push(tone('M0.6,4 C2,5.4 12,5.8 18,5.8 C10,5.4 3,5 0.6,4 Z', '#B4B1A8'));
  o.push(ell(18, 2.5, 17.8, 2.3, '#ECEAE4'));
  o.push(tone('M3,2.6 C6,0.9 12,0.7 17,0.9 C12,1.7 7,2.4 3,3.2 Z', '#FFFFFF', 0.8));  // the lamp on the marble
  o.push(line('M9,3.4 C13,2.4 17,3.6 22,2.6', '#BDBAB1', 0.35));                     // veining
  o.push(line('M20,1.6 C23,2 26,1.4 30,2.4', '#C9C6BD', 0.3));
  return o.join('');
}

// ── the slice (box 20 × 13 about its centre) ─────────────────────────────────
function cake() {
  const o = [];
  const SP = '#9A6036', SPD = '#764728', CREAM = '#F5E8BE', CREAMD = '#E3D09C';
  // two sponge layers with a stripe of cream cheese between, the right side in shade
  o.push(fill('M-9.5,-0.6 L9.5,-0.6 L9.5,5.6 C9.5,6.2 9,6.4 8.4,6.4 L-8.4,6.4 C-9,6.4 -9.5,6.2 -9.5,5.6 Z', SP));
  o.push(tone('M5.4,-0.6 L9.5,-0.6 L9.5,5.6 C9.5,6.2 9,6.4 8.4,6.4 L5.4,6.4 Z', SPD));
  o.push(tone('M-9.5,2.5 L9.5,2.5 L9.5,3.5 L-9.5,3.5 Z', CREAM));
  o.push(line('M-9.5,2.5 L9.5,2.5 M-9.5,3.5 L9.5,3.5', INK, 0.3));
  // carrot flecks and a raisin
  for (const [x, y] of [[-7, 0.9], [-2.6, 1.3], [3, 0.6], [7, 1.4], [-5.4, 4.8], [-0.4, 5], [4.6, 4.7], [7.6, 5.2]]) o.push(ell(x, y, 0.62, 0.38, '#E8832A', 0));
  o.push(ell(0.6, 5.5, 0.55, 0.4, '#4A2A1C', 0));
  // the cap of frosting, piped in three overlapping swirls, a lit side and a shaded one
  o.push(fill('M-10,-0.4 C-10.4,-2.8 -9,-4.4 -6.6,-4.6 C-5.6,-6 -3.4,-6 -2.4,-4.8 C-1.2,-6.2 1.2,-6.2 2.2,-4.8 C3.4,-6 5.6,-5.8 6.4,-4.4 C8.6,-4.4 10.3,-2.8 10,-0.4 Z', CREAM));
  o.push(tone('M5,-4.6 C7.6,-4.6 10.2,-3 10,-0.4 L5.6,-0.4 C6.4,-2 6.4,-3.6 5,-4.6 Z', CREAMD));
  o.push(line('M-8.6,-1.8 C-6.6,-2.6 -4.4,-2.6 -2.6,-1.6 M-1.2,-1.6 C0.8,-2.6 3,-2.6 4.6,-1.6', CREAMD, 0.5));
  // chopped walnuts on the frosting
  for (const [x, y, r] of [[-5.6, -3.6, 0.6], [-1.2, -4.4, 0.55], [3.2, -3.8, 0.6], [7, -2.6, 0.5], [0.4, -1.6, 0.45]]) o.push(`<path d="M${x - r},${y} L${x},${y - r} L${x + r},${y + 0.1} L${x + 0.2},${y + r} Z" fill="#8A5A36"/>`);
  // the marzipan carrot on top, its green tuft
  o.push(fill('M-1.4,-5.4 C0.6,-6.2 2.8,-5.8 3.8,-5 C2.8,-4.2 0.6,-4.2 -1.4,-4.8 Z', '#EE8A2B', 0.35));
  o.push(fill('M-1.4,-5.2 L-2.6,-5.9 L-2.4,-4.6 Z', '#4F8A3C', 0.3));
  return o.join('');
}

// ── the white plate (box 30 × 10 about its centre) ───────────────────────────
function plate() {
  const o = [];
  o.push(fill('M-6.2,1.5 L6.2,1.5 L5.6,2.9 L-5.6,2.9 Z', '#D6D0C3'));                  // the low foot ring, in shade
  o.push(fill('M-15,0 C-15,2.4 15,2.4 15,0 C15,-2.4 -15,-2.4 -15,0 Z', '#F4F1EA'));    // the rim
  o.push(tone('M-14.4,0.5 C-12,2.2 12,2.2 14.4,0.5 C13,2.7 -13,2.7 -14.4,0.5 Z', '#D6D0C3'));
  o.push(ell(0, 0.1, 10, 1.15, '#E6E1D5', 0.3));                                       // the well
  o.push(line('M-12.6,-0.9 C-10,-1.7 -6,-1.9 -3,-1.9', '#FFFFFF', 0.5));               // the lamp on the glaze
  return o.join('');
}

// ── the café front (box 296, 306, 104 × 194) ─────────────────────────────────
function cafe() {
  const o = [];
  const G = '#2F5E52', GD = '#234840', GL = '#3E7565', RED = '#A12E36', CRM = '#F3EBD8';
  const WD = '#8E5F37', WDD = '#6B4829', WDL = '#A87848';
  // the wall, painted green, with a corner pilaster either side of the hatch
  o.push(rect(12.5, 30, 91.5, 164, G, 0.7));
  o.push(tone('M104,30 L104,194 L98,194 L98,30 Z', GD));
  o.push(rect(14, 40, 9, 154, GL, 0.5));
  o.push(tone('M20,40 L23,40 L23,194 L20,194 Z', GD));
  o.push(rect(98, 40, 6, 154, GD, 0.5));
  // the kick-board panelling under the ledge: three lighter inset panels
  for (const x of [30, 53, 76]) { o.push(rect(x, 170, 19, 18, GL, 0.5, 1)); o.push(tone(`M${x + 14},171 L${x + 19},171 L${x + 19},188 L${x + 14},188 Z`, GD, 0.7)); }
  o.push(rect(12.5, 188, 91.5, 6, GD, 0.6));
  // the hatch: a wooden frame round a warm lit room
  o.push(rect(27.6, 98, 71.6, 62, WD, 0.7));
  o.push(rect(30.4, 100.8, 66, 57, '#F2E6CC', 0.5));
  o.push(tone('M30.4,100.8 L96.4,100.8 L96.4,108 L30.4,108 Z', '#E4D5B2'));
  // the shelf, a row of blue mugs on it, a jar of beans, a pendant lamp
  o.push(rect(30.4, 120, 66, 3, WDL, 0.5));
  for (const x of [38, 47, 56, 85]) {
    o.push(fill(`M${x - 3},113.4 L${x + 3},113.4 L${x + 2.6},120 L${x - 2.6},120 Z`, '#3D6E99', 0.4));
    o.push(tone(`M${x + 0.8},113.4 L${x + 3},113.4 L${x + 2.6},120 L${x + 0.6},120 Z`, '#2C5273'));
    o.push(line(`M${x + 3},114.8 C${x + 5.4},114.8 ${x + 5.4},118.4 ${x + 2.8},118.6`, INK, 0.5));
  }
  o.push(fill('M72,111 L80,111 L80,120 L72,120 Z', '#EAE2CC', 0.4)); o.push(ell(76, 117, 3.2, 2.2, '#5A3A26', 0));
  o.push(rect(71.2, 109.8, 9.6, 1.6, '#565B61', 0.4));
  o.push(line('M63.4,100.8 L63.4,106', INK, 0.5));
  o.push(fill('M59,106 C59,103.6 67.8,103.6 67.8,106 L69,110 L57.8,110 Z', '#E8C75A', 0.5));
  // a lit worktop below the shelf, behind the ledge
  o.push(rect(30.4, 145, 66, 12.8, '#E0D2AE', 0.4));
  // the wooden frame, shaded on its lower right
  o.push(tone('M99.2,98 L99.2,160 L96.4,157.8 L96.4,100.8 Z', WDD));
  o.push(tone('M27.6,160 L99.2,160 L96.4,157.8 L30.4,157.8 Z', WDD));
  // the ledge along the sill, where her plate waits
  o.push(fill('M27,157.7 L99.8,157.7 L99.8,164.3 L27,164.3 Z', WD, 0.6));
  o.push(rect(27, 157.7, 72.8, 1.6, WDL, 0, 0));
  o.push(tone('M27,163 L99.8,163 L99.8,164.3 L27,164.3 Z', WDD));
  // the name board: pale paper in a dark frame on two brackets (the scene sets CAFÉ on it)
  o.push(line('M44,66 L44,70 M82,66 L82,70', INK, 0.9));
  o.push(rect(40.5, 51.4, 45.8, 13.6, '#F4EEDF', 0.7, 1.2));
  o.push(rect(41.8, 52.7, 43.2, 11, 'none', 0.3, 0.6));
  // the awning: broad red and cream stripes ending in a scalloped valance
  const xs = [0, 13, 26, 39, 52, 65, 78, 91];
  o.push(rect(0, 6, 104, 29, CRM, 0.7));
  xs.forEach((x, i) => { if (i % 2 === 0) o.push(`<rect x="${x}" y="6" width="13" height="29" fill="${RED}"/>`); });
  o.push(tone('M0,6 L104,6 L104,13 L0,13 Z', '#000000', 0.12));                        // the canvas falling away under its rail
  o.push(rect(0, 6, 104, 29, 'none', 0.7));
  xs.forEach((x, i) => {
    const c = i % 2 === 0 ? RED : CRM;
    o.push(fill(`M${x},34.6 L${x + 13},34.6 L${x + 13},37 C${x + 13},43 ${x},43 ${x},37 Z`, c, 0.6));
  });
  o.push(tone('M91,6 L104,6 L104,36 C104,40 99,42 97,42 L97,6 Z', '#000000', 0.1));  // the shaded right end
  o.push(line('M1,5.6 L103,5.6', INK, 1.4));                                          // the awning's rail
  return o.join('');
}

export const ART = [
  { name: 'phil2-table', svg: table, view: { x: 0, y: 0, w: 36, h: 26 }, box: { x: 214, y: 474, w: 36, h: 26 } },
  { name: 'phil2-table-w', svg: table, view: { x: 0, y: 0, w: 36, h: 26 }, box: { x: 254, y: 474, w: 36, h: 26 } },
  { name: 'phil2-cake', svg: cake, view: { x: -10, y: -6.5, w: 20, h: 13 }, box: { x: -10, y: -6.5, w: 20, h: 13 } },
  { name: 'phil2-plate', svg: plate, view: { x: -15, y: -5, w: 30, h: 10 }, box: { x: -15, y: -5, w: 30, h: 10 } },
  { name: 'phil2-cafe', svg: cafe, view: { x: 0, y: 0, w: 104, h: 194 }, box: { x: 296, y: 306, w: 104, h: 194 } },
];
