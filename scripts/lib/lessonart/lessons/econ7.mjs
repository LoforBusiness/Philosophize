// economics-foundations-7 — the recap: an old trading exchange at dawn, then a harbour
// market in the morning (LESSON_RULES AM13; the recap's full settings, built in layers).
//
// Every picture is in SCENE units with the band [214, 514], 400 × 300. Flat fills lit from
// the top left, a darker shaded side, one dark outline; real colours, no gradients, no glows.
//
// REFERENCES (npm run ref, scratchpad/ref/e7*):
//   e7hall-1/2  "Leeds Corn Exchange": a glazed vault of cream iron ribs over the hall, a
//               moulded cornice, a ring of tall round-arched bays with green doors and
//               windows, a balcony with a black iron railing, round signs and a clock over
//               the arches, a honey wooden floor.
//   e7ticker-2  "Thomas Edison stock ticker" (NMAH): a brass type-wheel and its works under
//               a tall glass dome, on a round black japanned base with gold lining.
//   e7urn-2     "Tea urn" (MET DP208084): a tall silver vase body on a waisted foot and a
//               square plinth, a domed lid and finial, two tall loop handles, a tap with an
//               ivory key low on the body.
//   e7fish-2    "Fish stall at market": fish laid on a steel tray of ice, crates of fish
//               stacked in front, the seller behind his counter, an awning overhead.
//   e7harb-2    "Circular Quay" (ANMM): square-rigged ships moored at a stone quay, tall
//               masts with their yards crossed and sails furled, a town of warehouses and
//               a church tower behind, crates and timber on the quay.
//   e7notice-1  "Broadwell village notice board": a brown wooden board with an arched
//               head, papers pinned behind it.

const OUT = '#33261C';
const f2 = (n) => Number(n.toFixed(2));
const P = (pts) => 'M' + pts.map(([x, y]) => `${f2(x)},${f2(y)}`).join(' L') + ' Z';
const fill = (d, c, w = 1) => `<path d="${d}" fill="${c}" stroke="${OUT}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"/>`;
const flat = (d, c, o = 1) => `<path d="${d}" fill="${c}"${o < 1 ? ` opacity="${o}"` : ''}/>`;
const rect = (x, y, w, h, c, lw = 1, r = 0) => `<rect x="${f2(x)}" y="${f2(y)}" width="${f2(w)}" height="${f2(h)}" rx="${r}" fill="${c}" stroke="${OUT}" stroke-width="${lw}" stroke-linejoin="round"/>`;
const box = (x, y, w, h, c, o = 1) => `<rect x="${f2(x)}" y="${f2(y)}" width="${f2(w)}" height="${f2(h)}" fill="${c}"${o < 1 ? ` opacity="${o}"` : ''}/>`;
const line = (d, c, w) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const circ = (x, y, r, c, lw = 0.8) => `<circle cx="${f2(x)}" cy="${f2(y)}" r="${f2(r)}" fill="${c}" stroke="${OUT}" stroke-width="${lw}"/>`;
const ell = (x, y, rx, ry, c, lw = 0.8) => `<ellipse cx="${f2(x)}" cy="${f2(y)}" rx="${f2(rx)}" ry="${f2(ry)}" fill="${c}" stroke="${OUT}" stroke-width="${lw}"/>`;
const text = (x, y, s, size, c, anchor = 'start', weight = 800, ls = 0.6) =>
  `<text x="${f2(x)}" y="${f2(y)}" font-family="Arial, Helvetica, sans-serif" font-weight="${weight}" font-size="${size}" letter-spacing="${ls}" fill="${c}" text-anchor="${anchor}">${s}</text>`;
/** An arch: a box with a round top, from x0 to x1, its spring at ys, its foot at yb. */
const arch = (x0, x1, ys, yb) => {
  const r = (x1 - x0) / 2;
  return `M${f2(x0)},${f2(yb)} L${f2(x0)},${f2(ys)} A${f2(r)},${f2(r)} 0 0 1 ${f2(x1)},${f2(ys)} L${f2(x1)},${f2(yb)} Z`;
};

// ── palette ──────────────────────────────────────────────────────────────────
const DAWN = ['#7E8FC4', '#B69AC4', '#E8A9B4', '#F6C7A2', '#FBE0B4'];   // high lilac → low peach
const ROOF_SIL = '#8A7090', ROOF_SIL_D = '#735C7A';
const RIB = '#F1E6CC', RIB_D = '#D8C8A6';
const GLASS = '#C7B3D3', GLASS_L = '#D9C7DE';
const PLASTER = '#F2E6CC', PLASTER_D = '#DCCBA7', PLASTER_DD = '#C6B38C';
const CORNICE = '#E7D6B0';
const GREEN = '#3F6B57', GREEN_D = '#2E5243', GREEN_L = '#56826C';
const IRON = '#2E2B2A';
const WOOD = '#8A5A33', WOOD_D = '#6A4325', WOOD_L = '#A8744A', WOOD_DD = '#4F311B';
const MAHOG = '#6E3B26', MAHOG_D = '#542A1A', MAHOG_L = '#8A5136';
const FLOOR = '#D8A866', FLOOR_D = '#C08F50', FLOOR_L = '#E8BE80', FLOOR_LINE = '#A87A42';
const SLATE = '#38423F', SLATE_D = '#2C3432', SLATE_L = '#46514D';
const CHALK = '#EEF0E6';
const GILT = '#D6A93E', GILT_D = '#B08524';
const BRASS = '#CFA349', BRASS_D = '#A57E2E', BRASS_L = '#E5C46E';
const SILVER = '#D9DCDD', SILVER_D = '#AEB3B5', SILVER_L = '#F0F2F2';
const JAPAN = '#232120', JAPAN_L = '#3A3634';
const DOMEGLASS = '#DCEEF2';

const SKY = ['#A9C8E8', '#C1D8EC', '#E4D9DA', '#F6D9BC'];             // morning: blue high, warm low
const SEA = '#4F8FB0', SEA_D = '#3E7898', SEA_L = '#7FB4CC', SEA_FAR = '#8DB5C6';
const HAZE = '#A7B5C3', HAZE_D = '#92A2B2';
const BRICK = '#A9583B', BRICK_D = '#8A4530', BRICK_L = '#BE6C4C';
const STONE = '#C9BFA9', STONE_D = '#ADA28A', STONE_L = '#DDD4C0', STONE_DD = '#918670';
const SETT = '#B9AF9C', SETT_D = '#A19781', SETT_L = '#CCC3B1', SETT_LINE = '#8C826E';
const ROOF = '#556270', ROOF_D = '#434E5A';
const HULL = '#3C3F45', HULL_D = '#2C2E33', HULL_L = '#4D5158';
const SAIL = '#EFE6CF', SAIL_D = '#D6CAAB';
const NAVY = '#2F3E5C', NAVY_D = '#243049';
const RED = '#C2402F', CREAM = '#F5EDD8';
const BURLAP = '#B89462', BURLAP_D = '#977546';
const ICE = '#E6F2F5', ICE_D = '#C3DCE3';
const FISH = '#8FA6B4', FISH_D = '#6C8494', FISH_L = '#C8D6DE';
const CORK = '#C9A06A', CORK_D = '#AD8450';
const PAPER = '#F7F2E4', PAPER_D = '#E2D9C1';
const SKIN = '#D9A27A';

/** A sky in flat bands, lightest at the horizon. */
function bands(x, y0, w, h, cols, stops) {
  const out = [];
  for (let k = 0; k < cols.length; k++) out.push(box(x, y0 + h * stops[k], w, h * (stops[k + 1] - stops[k]) + 0.3, cols[k]));
  return out.join('');
}

// ══════════════════════════════════════════════════════════════════════════════
// THE EXCHANGE
// ══════════════════════════════════════════════════════════════════════════════

/** A tall round-arched window with the dawn in it, rooftops and a chimney low in the pane. */
function dawnWindow(x0, x1, ys, yb, seed) {
  const o = [];
  const r = (x1 - x0) / 2;
  // the reveal (the wall's thickness, in shade) and the frame
  o.push(fill(arch(x0 - 3, x1 + 3, ys, yb + 2), PLASTER_D, 0.8));
  o.push(`<clipPath id="w${seed}"><path d="${arch(x0, x1, ys, yb)}"/></clipPath>`);
  o.push(`<g clip-path="url(#w${seed})">`);
  o.push(bands(x0, ys - r, x1 - x0, yb - ys + r, DAWN, [0, 0.22, 0.44, 0.66, 0.84, 1]));
  // the town outside: roofs, a chimney, a dome
  const base = yb - 22;
  o.push(flat(`M${x0},${base} L${x0 + 6},${base - 8} L${x0 + 14},${base - 8} L${x0 + 18},${base - 3} L${x0 + 26},${base - 12} L${x0 + 34},${base - 4} L${x1},${base - 6} L${x1},${yb} L${x0},${yb} Z`, ROOF_SIL));
  o.push(flat(`M${x0 + 10},${base - 8} L${x0 + 10},${base - 18} L${x0 + 13},${base - 18} L${x0 + 13},${base - 8} Z`, ROOF_SIL_D));
  if (seed % 2) o.push(flat(`M${x0 + 20},${base - 10} A8,8 0 0 1 ${x0 + 36},${base - 10} Z`, ROOF_SIL_D));
  o.push(flat(`M${x0},${base + 2} L${x1},${base + 2} L${x1},${yb} L${x0},${yb} Z`, ROOF_SIL_D));
  o.push('</g>');
  // glazing bars
  const mid = (x0 + x1) / 2;
  o.push(line(`M${mid},${ys - r + 1} L${mid},${yb}`, IRON, 1.1));
  for (let y = ys + 6; y < yb; y += 18) o.push(line(`M${x0},${y} L${x1},${y}`, IRON, 0.8));
  o.push(line(`M${x0 + r * 0.3},${ys - r * 0.72} L${mid},${ys} L${x1 - r * 0.3},${ys - r * 0.72}`, IRON, 0.7));
  o.push(`<path d="${arch(x0, x1, ys, yb)}" fill="none" stroke="${OUT}" stroke-width="1.2"/>`);
  // the sill
  o.push(rect(x0 - 5, yb, x1 - x0 + 10, 4, PLASTER, 0.8));
  o.push(box(x0 - 4, yb + 2.4, x1 - x0 + 8, 1.4, PLASTER_DD));
  return o.join('');
}

/** FAR: the glazed vault at dawn, the cornice, the gallery and its railing, the arcade, the floor. */
export function hallFar() {
  const o = [];
  // ── the vault: lilac dawn through glass between cream iron ribs ──
  o.push(bands(0, 214, 400, 52, ['#B7A5CF', '#C9B2D2', '#DCBDCF'], [0, 0.4, 0.75, 1]));
  for (let k = -8; k <= 8; k++) {                                                    // ribs fanning down from the crown
    const xb = 200 + k * 28;
    o.push(line(`M${f2(200 + k * 6)},212 C${f2(200 + k * 14)},236 ${f2(xb)},250 ${f2(xb)},264`, RIB, 2.4));
    o.push(line(`M${f2(201 + k * 6)},212 C${f2(201 + k * 14)},236 ${f2(xb + 1.2)},250 ${f2(xb + 1.2)},264`, RIB_D, 0.7));
  }
  for (const y of [226, 240, 252]) o.push(line(`M0,${y + 6} C120,${y - 2} 280,${y - 2} 400,${y + 6}`, RIB, 1.6));
  o.push(flat('M0,214 L400,214 L400,222 C280,216 120,216 0,222 Z', GLASS_L, 0.6));
  // ── the cornice, with its gilt name ──
  o.push(rect(-2, 262, 404, 14, CORNICE, 0.9));
  o.push(box(0, 271, 400, 4, PLASTER_DD));
  for (let x = 4; x < 400; x += 7) o.push(box(x, 264.2, 3.4, 3, PLASTER_D));
  o.push(rect(140, 263.5, 120, 10, '#5A3A28', 0.6));
  o.push(text(200, 271.6, 'THE EXCHANGE', 8.4, GILT, 'middle', 800, 1.4));
  // ── the wall: plaster, the gallery's arches, a black iron railing ──
  o.push(rect(-2, 276, 404, 146, PLASTER, 0.8));
  o.push(box(0, 276, 400, 6, PLASTER_D));
  for (const [x0, x1] of [[160, 192], [204, 236], [256, 288], [300, 332]]) {
    o.push(fill(arch(x0, x1, 296, 326), PLASTER_DD, 0.7));
    o.push(flat(arch(x0 + 3, x1 - 3, 298, 326), '#A08A66'));
  }
  // the railing
  o.push(rect(-2, 326, 404, 4, WOOD_D, 0.7));
  for (let x = 2; x < 400; x += 5) o.push(line(`M${x},330 L${x},340`, IRON, 0.8));
  for (let x = 6; x < 400; x += 20) o.push(line(`M${x - 4},336 C${x - 2},332 ${x + 2},332 ${x + 4},336`, IRON, 0.6));
  o.push(rect(-2, 340, 404, 3, IRON, 0.5));
  // pilasters between the bays
  for (const x of [48, 146, 354]) {
    o.push(rect(x - 4, 343, 8, 80, PLASTER, 0.7));
    o.push(box(x + 1, 344, 2.6, 78, PLASTER_D));
  }
  // the great clock over the board, like the one over the arches
  o.push(circ(246, 304, 21, '#5A3A28', 1.1));
  o.push(circ(246, 304, 17.6, '#FBF6E8', 0.9));
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * Math.PI * 2;
    const r0 = k % 3 ? 14.6 : 13, r1 = 16.4;
    o.push(line(`M${f2(246 + Math.sin(a) * r0)},${f2(304 - Math.cos(a) * r0)} L${f2(246 + Math.sin(a) * r1)},${f2(304 - Math.cos(a) * r1)}`, OUT, k % 3 ? 0.6 : 1.2));
  }
  o.push(circ(246, 283, 3, GILT, 0.6));
  // ── the arcade: the street doors (left), two windows on the dawn, a third over the desk ──
  // the doors: tall, round-headed, green, the right leaf standing open on the street
  o.push(fill(arch(4, 44, 372, 452), PLASTER_D, 0.8));
  o.push(`<clipPath id="door"><path d="${arch(6, 42, 372, 452)}"/></clipPath>`);
  o.push('<g clip-path="url(#door)">');
  o.push(bands(6, 352, 36, 100, ['#E8A9B4', '#F6C7A2', '#FBE0B4'], [0, 0.4, 0.7, 1]));
  o.push(flat('M6,420 L18,412 L30,416 L42,408 L42,452 L6,452 Z', ROOF_SIL));
  o.push(flat('M6,436 L42,436 L42,452 L6,452 Z', '#9A8572'));
  o.push(rect(6, 352, 17, 100, GREEN, 0.8));
  o.push(box(17, 354, 5, 96, GREEN_D));
  for (const y of [380, 410, 432]) o.push(rect(8.6, y, 11.8, 18, GREEN_L, 0.5));
  o.push('</g>');
  o.push(fill(P([[42, 372], [52, 366], [52, 456], [42, 452]]), GREEN_D, 0.8));   // the open leaf, folded back
  o.push(`<path d="${arch(4, 44, 372, 452)}" fill="none" stroke="${OUT}" stroke-width="1.2"/>`);
  o.push(circ(20, 432, 1.3, BRASS, 0.4));
  o.push(dawnWindow(58, 92, 368, 418, 1));
  o.push(dawnWindow(100, 134, 368, 418, 2));
  o.push(dawnWindow(362, 396, 368, 418, 3));
  // ── the dado: dark panelling ──
  o.push(rect(-2, 422, 404, 32, WOOD, 0.9));
  o.push(box(0, 422, 400, 3, WOOD_L));
  for (let x = 4; x < 400; x += 32) {
    o.push(rect(x, 428, 26, 20, WOOD_D, 0.5));
    o.push(box(x + 1, 429, 24, 2, WOOD_DD, 0.6));
  }
  o.push(rect(-2, 450, 404, 4, WOOD_DD, 0.6));
  // ── the floor: honey boards in a herringbone, the dawn lying on it ──
  o.push(rect(-2, 454, 404, 62, FLOOR, 0.8));
  o.push(box(0, 454, 400, 4, FLOOR_D));
  const rows = [460, 470, 482, 496, 514];
  for (let r = 0; r < rows.length - 1; r++) {
    const y = rows[r], h = rows[r + 1] - y;
    o.push(line(`M0,${y} L400,${y}`, FLOOR_LINE, 0.5));
    const step = 8 + r * 3;
    for (let x = (r % 2) * step * 0.5; x < 404; x += step) o.push(line(`M${f2(x)},${y} L${f2(x + step * 0.5)},${y + h}`, FLOOR_LINE, 0.4));
  }
  // the light from the two windows, lying across the boards
  o.push(flat('M62,456 L96,456 L120,514 L72,514 Z', FLOOR_L, 0.75));
  o.push(flat('M104,456 L138,456 L170,514 L122,514 Z', FLOOR_L, 0.75));
  o.push(flat('M366,456 L398,456 L404,500 L380,500 Z', FLOOR_L, 0.6));
  return o.join('');
}

/** The price board's slate tile, with its painted name (marks are chalked on it live). */
function slateTile(x, y, w, h, label, lx, anchor = 'start') {
  return rect(x, y, w, h, SLATE, 0.8)
    + box(x + 1, y + h - 5, w - 2, 4, SLATE_D)
    + box(x + 1, y + 1, w - 2, 2, SLATE_L)
    + text(lx, y + 11, label, 9.2, GILT, anchor, 800, 0.8);
}

/** MID: the price board on its legs, the urn on its table, the ticker's pedestal, the clerk's desk. */
export function hallMid() {
  const o = [];
  // ── the urn table (left) ──
  // (the table stands at 28–76, the urn at 48, so the woman at 84 pours at its tap without
  //  her body hiding the urn)
  o.push(rect(28, 456, 48, 5, WOOD_L, 0.8));
  o.push(rect(31, 461, 42, 6, WOOD, 0.7));
  for (const x of [33, 67]) { o.push(rect(x, 467, 4, 30, WOOD_D, 0.6)); }
  o.push(rect(33, 486, 38, 2.4, WOOD_D, 0.5));
  // the urn: square plinth, waisted foot, the vase body, the lid and finial, two loop handles
  const UX = 48;
  o.push(rect(UX - 9, 451, 18, 5, SILVER, 0.7));
  o.push(fill(`M${UX - 4},451 C${UX - 3},446 ${UX - 3},444 ${UX - 6},441 L${UX + 6},441 C${UX + 3},444 ${UX + 3},446 ${UX + 4},451 Z`, SILVER, 0.7));
  o.push(fill(`M${UX - 11},412 C${UX - 12},426 ${UX - 9},437 ${UX - 3},442 L${UX + 3},442 C${UX + 9},437 ${UX + 12},426 ${UX + 11},412 Z`, SILVER, 0.9));
  o.push(flat(`M${UX + 3},413 C${UX + 9},414 ${UX + 10},426 ${UX + 9},434 C${UX + 7},439 ${UX + 4},441 ${UX + 2},441 C${UX + 5},432 ${UX + 6},422 ${UX + 3},413 Z`, SILVER_D));
  o.push(flat(`M${UX - 8},416 C${UX - 9},424 ${UX - 8},430 ${UX - 6},434 L${UX - 5},434 C${UX - 6.4},428 ${UX - 6.6},422 ${UX - 6},416 Z`, SILVER_L));
  o.push(rect(UX - 12, 410, 24, 3, SILVER, 0.7));
  o.push(fill(`M${UX - 9},410 C${UX - 7},403 ${UX - 3},400 ${UX - 2},396 L${UX + 2},396 C${UX + 3},400 ${UX + 7},403 ${UX + 9},410 Z`, SILVER, 0.8));
  o.push(circ(UX, 394, 2.2, SILVER_L, 0.6));
  o.push(line(`M${UX - 11},414 C${UX - 19},412 ${UX - 19},398 ${UX - 15},397 C${UX - 13},405 ${UX - 13},420 ${UX - 10},428`, OUT, 1.6));
  o.push(line(`M${UX - 11},414 C${UX - 19},412 ${UX - 19},398 ${UX - 15},397 C${UX - 13},405 ${UX - 13},420 ${UX - 10},428`, SILVER, 0.9));
  o.push(line(`M${UX + 11},414 C${UX + 19},412 ${UX + 19},398 ${UX + 15},397 C${UX + 13},405 ${UX + 13},420 ${UX + 10},428`, OUT, 1.6));
  o.push(line(`M${UX + 11},414 C${UX + 19},412 ${UX + 19},398 ${UX + 15},397 C${UX + 13},405 ${UX + 13},420 ${UX + 10},428`, SILVER, 0.9));
  // the tap with its ivory key, pointing right
  o.push(rect(UX + 8, 438.4, 8, 2.6, SILVER_D, 0.5));
  o.push(fill(`M${UX + 16},438 L${UX + 18},438 L${UX + 18},443.6 L${UX + 16},443.6 Z`, SILVER_D, 0.5));
  o.push(rect(UX + 11.2, 434.4, 2.6, 4.2, '#EDE3C8', 0.4));
  // cups and saucers waiting on the table
  for (const x of [32.5]) {
    o.push(ell(x, 455.4, 4, 1.1, '#F7F5EE', 0.4));
    o.push(fill(`M${x - 2.6},450.4 L${x + 2.6},450.4 L${x + 2},455 L${x - 2},455 Z`, '#F7F5EE', 0.5));
  }

  // ── the ticker's pedestal: a fluted iron column, a round black base with gold lining ──
  const TX = 112;
  o.push(rect(TX - 9, 492, 18, 5, JAPAN, 0.7));
  o.push(fill(`M${TX - 5},492 L${TX - 4},458 L${TX + 4},458 L${TX + 5},492 Z`, JAPAN_L, 0.8));
  for (const dx of [-2, 0.4, 2.6]) o.push(line(`M${TX + dx},460 L${TX + dx},490`, '#1A1817', 0.5));
  o.push(rect(TX - 8, 454, 16, 4, JAPAN, 0.6));
  o.push(fill(`M${TX - 15},452 L${TX + 15},452 L${TX + 13},440 L${TX - 13},440 Z`, JAPAN, 0.9));
  o.push(line(`M${TX - 13.6},444 L${TX + 13.6},444 M${TX - 14.4},449 L${TX + 14.4},449`, GILT, 0.6));
  for (const dx of [-9, -5, -1, 3, 7]) o.push(circ(TX + dx, 446.6, 1.1, BRASS, 0.3));
  o.push(rect(TX - 12, 437, 24, 3.6, '#5A3A28', 0.6));
  // the works on the base (the wheel spins live above it)
  o.push(fill(`M${TX - 6},437 L${TX - 2},428 L${TX + 2},428 L${TX + 6},437 Z`, BRASS_D, 0.6));
  o.push(rect(TX - 1, 420, 2, 9, BRASS_D, 0.4));
  o.push(rect(TX - 9, 431, 6, 6, '#3A3634', 0.5));
  o.push(circ(TX + 6, 432, 2.4, BRASS, 0.5));
  o.push(rect(TX - 15, 443, 3, 3, BRASS_D, 0.4));                                     // the tape's slot, left side

  // ── the price board: mahogany, a gilt crest, four slates, a chalk ledge, two stout legs ──
  const B0 = 140, B1 = 352;
  for (const x of [150, 336]) {
    o.push(rect(x, 474, 8, 22, MAHOG, 0.8));
    o.push(box(x + 4.6, 475, 2.4, 20, MAHOG_D));
    o.push(rect(x - 4, 494, 16, 3, MAHOG_D, 0.6));
  }
  o.push(fill(`M${B0},392 L${B0},354 L196,354 C206,340 286,340 296,354 L${B1},354 L${B1},392 Z`, MAHOG, 1.1));
  o.push(rect(B0, 352, B1 - B0, 126, MAHOG, 1.1));
  o.push(box(B0 + 1, 353, B1 - B0 - 2, 3, MAHOG_L));
  o.push(box(B1 - 8, 356, 7, 120, MAHOG_D));
  // the crest's gilt plate and its name
  o.push(fill('M204,354 C212,345 280,345 288,354 L288,358 L204,358 Z', GILT, 0.6));
  o.push(rect(160, 360, 172, 30, '#3E2418', 0.7));
  o.push(rect(163, 363, 166, 24, '#4A2C1E', 0.4));
  o.push(text(246, 380.6, 'TODAY’S PRICES', 12.4, GILT, 'middle', 800, 1.2));
  o.push(line('M168,368 L190,368 M302,368 L324,368 M168,384 L190,384 M302,384 L324,384', GILT_D, 0.7));
  // the four slates (marks are chalked on live): WHEAT · WOOL / COAL · UMBRELLAS
  o.push(slateTile(148, 398, 96, 38, 'WHEAT', 154));
  o.push(slateTile(248, 398, 96, 38, 'WOOL', 338, 'end'));
  o.push(slateTile(148, 440, 96, 36, 'COAL', 154));
  o.push(slateTile(248, 440, 96, 36, 'UMBRELLAS', 338, 'end'));
  // yesterday's prices, faint, and coal LEVEL (chalked last night)
  o.push(line('M220,464 L232,464', CHALK, 1.6));
  for (const [x, y] of [[156, 426], [156, 466], [304, 426]]) o.push(text(x, y, x < 200 ? '9s 4d' : '1s 2d', 7.4, '#8E9A95', 'start', 700, 0.3));
  // the chalk ledge, with a smear of dust and a stick of chalk at its end
  o.push(rect(B0 - 3, 476, B1 - B0 + 6, 5, MAHOG_L, 0.8));
  o.push(box(B0, 479, B1 - B0, 1.6, MAHOG_D));
  o.push(flat('M170,476.6 L220,476.6 L218,478 L172,478 Z', '#E6E3D6', 0.5));
  o.push(rect(146, 474, 8, 2.2, CHALK, 0.3));

  // ── the clerk's desk (right), hip-high to the man beside it: a sloped top, ledgers, an
  //    inkwell, a brass balance (the near edge of the top is 40 above the floor at 500) ──
  o.push(fill('M356,460 L404,453 L404,460 L356,466 Z', MAHOG_L, 0.9));
  o.push(rect(358, 466, 46, 9, MAHOG, 0.8));
  for (const x of [360, 398]) o.push(rect(x, 475, 4, 22, MAHOG_D, 0.6));
  o.push(rect(362, 488, 40, 2.4, MAHOG_D, 0.5));
  // ledgers on the shelf under it
  for (const [x, c] of [[364, '#7A2E2A'], [372, '#2F4A5E'], [380, '#5E4A2A'], [388, '#7A2E2A']]) o.push(rect(x, 477, 7, 11, c, 0.5));
  // an inkwell and a quill
  o.push(rect(392, 449, 7, 5, '#2A2A30', 0.5));
  o.push(line('M396,449 L404,439', '#F2EEE2', 1.2));
  // the balance: a post on the desk, a beam, two pans (the coin lies on the left one, live)
  o.push(rect(367, 440, 2.4, 19, BRASS_D, 0.5));
  o.push(rect(364, 458, 8, 2, BRASS_D, 0.4));
  o.push(rect(356, 439, 26, 2, BRASS, 0.5));
  o.push(circ(368.2, 440, 1.6, BRASS_L, 0.4));
  for (const x of [358, 380]) {
    o.push(line(`M${x - 3},451 L${x},441 L${x + 3},451`, BRASS_D, 0.4));
    o.push(fill(`M${x - 5},451 L${x + 5},451 C${x + 4},454 ${x - 4},454 ${x - 5},451 Z`, BRASS, 0.5));
  }
  o.push(ell(380, 450.2, 2.4, 0.9, BRASS_L, 0.3));                                       // a weight on the right pan                                       // a weight on the right pan
  return o.join('');
}

/** The ticker's glass dome, laid over the spinning wheel. */
export function tickerDome() {
  return `<path d="${arch(101, 123, 413, 437)}" fill="${DOMEGLASS}" fill-opacity="0.35" stroke="${OUT}" stroke-width="0.8"/>`
    + flat('M104,414 C104,407 107,404 110,403 C108,407 107,412 107,430 L104,432 Z', '#FFFFFF', 0.55)
    + rect(100, 435, 24, 2.4, BRASS_D, 0.5);
}

// ══════════════════════════════════════════════════════════════════════════════
// THE HARBOUR MARKET — drawn in its own frame (x 0–400), laid at world x 400.
// ══════════════════════════════════════════════════════════════════════════════

/** A gabled warehouse across the water, in brick. */
function warehouse(x, yb, w, h, c = BRICK, cd = BRICK_D) {
  const o = [];
  o.push(rect(x, yb - h, w, h, c, 0.7));
  o.push(box(x + w * 0.66, yb - h + 0.5, w * 0.34 - 0.5, h - 1, cd));
  o.push(fill(P([[x - 1.5, yb - h + 0.4], [x + w / 2, yb - h - w * 0.32], [x + w + 1.5, yb - h + 0.4]]), ROOF, 0.6));
  for (let r = 0; r < Math.floor(h / 9); r++) for (let k = 0; k < Math.floor(w / 8); k++) o.push(box(x + 3 + k * 8, yb - h + 4 + r * 9, 3, 4, '#3E2E2A'));
  o.push(box(x + w / 2 - 3, yb - 9, 6, 9, '#3E2E2A'));
  return o.join('');
}

/** FAR: the morning sky, the town across the water, the sea, the headland and its lighthouse. */
export function harbourFar() {
  const o = [];
  o.push(bands(0, 214, 400, 168, SKY, [0, 0.36, 0.66, 0.86, 1]));
  // the town across the water: warehouses and a church tower
  o.push(flat('M0,376 L0,350 C40,344 80,342 120,346 L140,376 Z', HAZE));
  for (const [x, w, h] of [[2, 22, 22], [26, 18, 18], [46, 24, 26], [72, 20, 16], [94, 22, 20]]) o.push(warehouse(x, 376, w, h, '#B47A63', '#9C6550'));
  o.push(rect(118, 330, 9, 46, '#B7A88C', 0.6));
  o.push(fill(P([[116.5, 330], [122.5, 316], [128.5, 330]]), ROOF, 0.5));
  o.push(box(121, 340, 2.4, 4, '#3E2E2A'));
  // the headland on the right and its lighthouse
  o.push(fill('M256,378 C290,362 330,352 360,350 C380,350 396,356 404,360 L404,382 L256,382 Z', '#7F9668', 0.8));
  o.push(flat('M340,352 C370,350 392,356 404,360 L404,382 L330,382 C342,372 344,360 340,352 Z', '#6A8256'));
  o.push(rect(362, 324, 8, 28, CREAM, 0.6));
  o.push(box(362.6, 332, 6.8, 4, RED));
  o.push(box(362.6, 342, 6.8, 4, RED));
  o.push(rect(361, 318, 10, 6, '#E9D9A8', 0.6));
  o.push(fill(P([[360, 318], [366, 312], [372, 318]]), '#7A2E2A', 0.5));
  // the sea to the horizon, and its swell lines
  o.push(box(0, 376, 400, 80, SEA));
  o.push(box(0, 376, 400, 8, SEA_FAR));
  for (const [x, y, w] of [[20, 392, 26], [140, 396, 30], [210, 390, 22], [300, 400, 26], [60, 410, 34], [180, 416, 28], [320, 420, 30], [100, 432, 30], [250, 436, 26]]) o.push(box(x, y, w, 1.3, SEA_L));
  // a small sail out at sea
  o.push(fill('M190,380 L190,368 L198,380 Z', CREAM, 0.5));
  o.push(fill('M186,381 L201,381 L199,384 L188,384 Z', HULL, 0.4));
  return o.join('');
}

/** The brig at her mooring: a dark hull with a painted band, two masts, yards and furled sails. Riding on the water. */
export function brig() {
  const o = [];
  // masts, topmasts and their yards with the sails furled on them
  for (const [mx, top] of [[262, 238], [336, 244]]) {
    o.push(rect(mx - 2.4, top, 4.8, 420 - top, WOOD, 0.8));
    o.push(box(mx, top + 1, 2, 420 - top - 2, WOOD_D));
    for (const [y, half] of [[top + 18, 18], [top + 50, 28], [top + 88, 36], [top + 128, 44]]) {
      o.push(rect(mx - half, y, half * 2, 2.4, WOOD_D, 0.6));
      o.push(fill(`M${mx - half + 2},${y + 2.4} C${mx - half / 2},${y + 8} ${mx + half / 2},${y + 8} ${mx + half - 2},${y + 2.4} Z`, SAIL, 0.6));
      o.push(flat(`M${mx},${y + 3} C${mx + half / 2},${y + 7} ${mx + half - 3},${y + 4} ${mx + half - 2},${y + 2.4} Z`, SAIL_D));
    }
    o.push(rect(mx - 4, top + 140, 8, 3, WOOD_D, 0.5));                               // the top
  }
  // the flag at the main truck
  o.push(fill('M336,244 L336,232 L350,236 L336,240 Z', RED, 0.6));
  // the bowsprit and the stays
  o.push(line('M222,412 L196,396', WOOD_D, 2.4));
  o.push(line('M262,240 L198,397 M262,240 L330,418 M336,246 L264,330 M336,246 L398,420 M262,300 L226,412 M336,300 L376,420', '#3A2E24', 0.55));
  // the cargo net hanging from the fore yard over the side
  o.push(line('M232,366 L236,392', '#3A2E24', 0.6));
  o.push(fill('M226,392 L246,392 L244,408 C240,412 232,412 228,408 Z', '#C9B48A', 0.6));
  for (const x of [230, 236, 242]) o.push(line(`M${x},392 L${x - 1},410`, '#7E6440', 0.4));
  for (const y of [398, 404]) o.push(line(`M226,${y} L246,${y}`, '#7E6440', 0.4));
  // the hull: black with a cream band, the bow on the left, a gilded stern
  const hull = 'M206,404 L216,402 C260,404 340,404 392,398 L398,398 L396,410 C392,428 380,444 360,448 L230,448 C220,440 212,424 206,404 Z';
  o.push(fill(hull, HULL, 1.1));
  o.push(flat('M212,412 C260,414 340,414 396,408 L395,414 C340,420 260,420 214,418 Z', CREAM));
  for (let x = 222; x < 390; x += 14) o.push(box(x, 413, 6, 4, HULL_D));               // the painted ports
  o.push(flat('M300,420 C340,420 380,416 396,412 C392,430 380,444 360,448 L300,448 Z', HULL_D));
  o.push(fill('M204,400 L230,402 L230,405 L206,404 Z', WOOD_L, 0.6));                    // the rail
  o.push(line('M214,401 L392,396', WOOD_D, 1));
  o.push(fill('M390,396 L398,392 L402,400 L398,410 L394,406 Z', GILT, 0.6));
  // the waterline shadow
  o.push(flat('M228,446 L362,446 L354,452 L236,452 Z', SEA_D));
  return o.join('');
}

/** A herring gull gliding, wings spread, facing right. */
export function gull() {
  return fill('M-12,1 C-8,-4 -4,-3 0,1 C4,-3 8,-4 12,1 C8,-1 4,0 1,3 L-1,3 C-4,0 -8,-1 -12,1 Z', '#F5F3EE', 0.6)
    + flat('M8.4,-3 C10,-2.4 11.2,-0.8 12,1 C11,-0.4 9.6,-1.2 8.4,-1.4 Z', '#4A4A4A')
    + flat('M-8.4,-3 C-10,-2.4 -11.2,-0.8 -12,1 C-11,-0.4 -9.6,-1.2 -8.4,-1.4 Z', '#4A4A4A')
    + ell(1.4, 2, 2.8, 1.6, '#F5F3EE', 0.5)
    + fill('M4,1.6 L6,2.2 L4,2.8 Z', '#E2A93A', 0.3);
}

/** A painted townsperson at a distance: head, coat, a cap. */
function person(x, yb, h, coat, coatD, cap, dir = 1) {
  const hw = h * 0.17;
  return fill(`M${x - hw},${yb} L${x - hw * 0.7},${yb - h * 0.72} L${x + hw * 0.7},${yb - h * 0.72} L${x + hw},${yb} Z`, coat, 0.6)
    + flat(`M${x + hw * 0.1 * dir},${yb - h * 0.7} L${x + hw * 0.7 * dir},${yb - h * 0.72} L${x + hw * dir},${yb} L${x + hw * 0.2 * dir},${yb} Z`, coatD)
    + circ(x + dir * 0.5, yb - h * 0.82, h * 0.12, SKIN, 0.6)
    + fill(`M${x - h * 0.14 + dir},${yb - h * 0.86} C${x - h * 0.12},${yb - h * 1.0} ${x + h * 0.14},${yb - h * 1.0} ${x + h * 0.15 + dir},${yb - h * 0.86} L${x + h * 0.2 * dir + dir},${yb - h * 0.85} Z`, cap, 0.5);
}

/** A sack of grain, tied at the neck. */
function grainSack(x, yb, w, h) {
  return fill(`M${x - w / 2},${yb} C${x - w / 2 - 1},${yb - h * 0.5} ${x - w * 0.42},${yb - h * 0.85} ${x - w * 0.2},${yb - h} L${x + w * 0.2},${yb - h} C${x + w * 0.42},${yb - h * 0.85} ${x + w / 2 + 1},${yb - h * 0.5} ${x + w / 2},${yb} Z`, BURLAP, 0.7)
    + flat(`M${x + w * 0.1},${yb - h * 0.9} C${x + w * 0.4},${yb - h * 0.7} ${x + w / 2},${yb - h * 0.4} ${x + w / 2 - 0.6},${yb - 0.6} L${x + w * 0.1},${yb - 0.6} Z`, BURLAP_D)
    + line(`M${x - w * 0.22},${yb - h * 0.9} L${x + w * 0.22},${yb - h * 0.9}`, '#6E5430', 0.8);
}
/** A wooden crate, side on. */
function crateBox(x, yb, w, h) {
  return rect(x - w / 2, yb - h, w, h, WOOD_L, 0.7)
    + box(x + w * 0.18, yb - h + 0.5, w * 0.32 - 0.5, h - 1, WOOD)
    + line(`M${x - w / 2},${yb - h * 0.5} L${x + w / 2},${yb - h * 0.5} M${x - w / 2 + 2},${yb - h + 2} L${x + w / 2 - 2},${yb - 2}`, WOOD_D, 0.6);
}

/** MID + NEAR: the quay, the harbourmaster's hut and his board, the fish stall, cargo, a lamp post. */
export function harbourMid() {
  const o = [];
  // ── the quay: a coping along the water, then setts to the front ──
  o.push(rect(-2, 446, 404, 70, SETT, 0.9));
  o.push(rect(-2, 446, 404, 7, STONE_L, 0.8));
  o.push(box(0, 453, 400, 3, SETT_D));
  const rows = [462, 474, 488, 504];
  for (const y of rows) o.push(line(`M0,${y} L400,${y}`, SETT_LINE, 0.5));
  rows.forEach((y, r) => {
    const h = (rows[r + 1] ?? 516) - y;
    const step = 12 + r * 4;
    for (let x = (r % 2) * step * 0.5 + 3; x < 404; x += step) o.push(line(`M${f2(x)},${y} L${f2(x - 1 - r * 0.6)},${f2(y + h)}`, SETT_LINE, 0.45));
    for (let x = step * 0.4 + (r % 2) * 5; x < 400; x += step * 3.1) o.push(box(x, y + 1.4, step * 0.6, Math.min(3.4, h - 3), SETT_L, 0.8));
  });
  for (let x = 6; x < 400; x += 26) o.push(line(`M${x},447 L${x},452`, STONE_D, 0.5));
  // bollards
  for (const x of [226, 302]) {
    o.push(rect(x - 4, 440, 8, 10, '#3C3B3A', 0.8));
    o.push(ell(x, 440, 5.4, 2, '#4C4A48', 0.7));
  }
  // ── cargo waiting on the quay: crates and sacks of grain ──
  o.push(crateBox(250, 452, 22, 18));
  o.push(crateBox(274, 452, 22, 18));
  o.push(crateBox(262, 434, 20, 16));
  o.push(grainSack(290, 452, 14, 16));
  o.push(grainSack(240, 452, 12, 14));
  o.push(text(250, 446, 'TEA', 5.6, '#4F311B', 'middle', 800, 0.3));
  // ── the harbourmaster's hut: stone, a slate roof, a door with him in it, his notice board ──
  const H0 = 108, H1 = 216;
  o.push(rect(H0, 346, H1 - H0, 106, STONE, 0.9));
  o.push(box(H1 - 26, 347, 25, 104, STONE_D));
  for (let y = 356; y < 452; y += 9) for (let x = H0 + ((y / 9) % 2 ? 4 : 10); x < H1 - 4; x += 14) o.push(line(`M${x},${y} L${x + 8},${y}`, STONE_DD, 0.4));
  o.push(fill(P([[H0 - 6, 348], [H0 + 10, 324], [H1 - 10, 324], [H1 + 6, 348]]), ROOF, 0.9));
  o.push(flat(`M${H1 - 10},324 L${H1 + 6},348 L${H1 - 30},348 Z`, ROOF_D));
  for (const y of [330, 336, 342]) o.push(line(`M${H0 + 2},${y} L${H1 - 2},${y}`, ROOF_D, 0.5));
  o.push(rect(H0 + 16, 314, 7, 12, BRICK, 0.6));                                       // the chimney
  // the door, open, the harbourmaster in it: navy coat, peaked cap, a white beard
  o.push(rect(118, 394, 28, 58, '#2E2622', 0.9));
  o.push(fill(P([[146, 394], [154, 398], [154, 454], [146, 452]]), '#5E6E7E', 0.7));
  o.push(fill('M124,452 L126,420 L138,420 L140,452 Z', NAVY, 0.6));
  o.push(flat('M133,420 L138,420 L140,452 L134,452 Z', NAVY_D));
  for (const y of [428, 436]) o.push(circ(131.6, y, 0.8, GILT, 0.2));
  o.push(circ(132, 412, 5.4, SKIN, 0.6));
  o.push(fill('M127,413 C127,420 137,420 137,413 C135,416 129,416 127,413 Z', '#F2EEE6', 0.5));
  o.push(fill('M126.4,409 C127,404 137,404 137.6,409 Z', NAVY, 0.5));
  o.push(fill('M137,408.6 L141,409.6 L137,410 Z', '#1E1E1E', 0.4));
  o.push(circ(132, 406, 0.9, GILT, 0.2));
  // the sign over the door
  o.push(rect(111, 382, 44, 10, "#2F4A5E", 0.6));
  o.push(text(133, 389.6, "HARBOUR", 6, CREAM, "middle", 800, 0.3));
  // the notice board: a brown arched head, cork, two old notices and a gap for a new one
  o.push(fill('M156,364 C162,356 202,356 208,364 L208,404 L156,404 Z', WOOD, 0.9));
  o.push(rect(160, 366, 44, 34, CORK, 0.6));
  o.push(box(161, 395, 42, 4, CORK_D));
  for (const [x, y, w, h] of [[163, 369, 12, 14], [176, 372, 10, 12]]) {
    o.push(rect(x, y, w, h, PAPER_D, 0.4));
    for (let k = 0; k < 3; k++) o.push(line(`M${x + 2},${y + 4 + k * 3} L${x + w - 2},${y + 4 + k * 3}`, '#9A907A', 0.5));
    o.push(circ(x + w / 2, y + 1.6, 0.8, '#C0392B', 0.2));
  }
  // the line the new notices hang on, from the hut's eave to the lamp post
  o.push(line('M216,348 C280,354 340,354 388,346', '#5E4A30', 0.7));
  // ── the lamp post at the end of the quay ──
  o.push(rect(387, 344, 4, 106, '#2E2B2A', 0.6));
  o.push(rect(383, 448, 12, 4, '#2E2B2A', 0.5));
  o.push(fill('M382,344 L396,344 L393,332 L385,332 Z', '#3E3B38', 0.6));
  o.push(rect(385.4, 334, 7.2, 8, '#F4E2A6', 0.4));
  o.push(fill('M383,332 L389,326 L395,332 Z', '#2E2B2A', 0.5));

  // ── the fish stall (left): posts, a striped awning, a counter with fish on ice, the fisher ──
  const S0 = 0, S1 = 98;
  // the fisher behind the counter, in an oilskin apron
  o.push(person(42, 458, 56, '#E5E2D8', '#C9C5B8', '#5E6E7E', 1));
  o.push(fill('M36,444 L48,444 L50,458 L34,458 Z', '#E2B437', 0.5));
  // the price chalkboard hung under the awning
  o.push(line('M76,402 L76,406 M92,402 L92,406', '#5E4A30', 0.5));
  o.push(rect(70, 406, 28, 16, SLATE, 0.7));
  o.push(text(84, 413.4, 'FISH', 5.8, CHALK, 'middle', 800, 0.4));
  o.push(text(84, 419.6, '2d', 5.4, CHALK, 'middle', 700, 0.2));
  // the posts
  for (const x of [S0 + 2, S1 - 5]) o.push(rect(x, 396, 4, 62, WOOD_D, 0.7));
  // the awning: red and cream stripes, a scalloped edge
  o.push(rect(S0 - 2, 392, S1 - S0 + 4, 4, WOOD, 0.7));
  const stripes = 8, sw = (S1 - S0 + 8) / stripes;
  for (let k = 0; k < stripes; k++) {
    const x0 = S0 - 4 + k * sw;
    o.push(fill(P([[x0 + 4, 378], [x0 + sw + 4, 378], [x0 + sw, 396], [x0, 396]]), k % 2 ? CREAM : RED, 0.6));
  }
  for (let k = 0; k < stripes; k++) {
    const x0 = S0 - 4 + k * sw;
    o.push(fill(`M${f2(x0)},396 Q${f2(x0 + sw / 2)},403 ${f2(x0 + sw)},396 Z`, k % 2 ? CREAM : RED, 0.6));
  }
  // the counter: the ice tray on top with fish laid on it, plank front
  o.push(rect(S0 - 2, 456, S1 - S0 + 2, 5, WOOD_L, 0.9));
  o.push(rect(S0, 461, S1 - S0 - 2, 36, WOOD, 0.9));
  o.push(box(S1 - 26, 461.6, 23, 35, WOOD_D, 0.6));
  for (let y = 469; y < 496; y += 8) o.push(line(`M${S0 + 1},${y} L${S1 - 3},${y}`, WOOD_D, 0.5));
  o.push(rect(4, 449, 60, 7, ICE, 0.7));
  o.push(box(5, 453, 58, 2.4, ICE_D));
  for (const [x, y, d] of [[14, 451, 1], [28, 449.6, -1], [42, 451.4, 1], [54, 450, -1]]) {
    o.push(fill(`M${x - 7 * d},${y} C${x - 3 * d},${y - 3} ${x + 3 * d},${y - 3} ${x + 6 * d},${y} C${x + 3 * d},${y + 2.4} ${x - 3 * d},${y + 2.4} ${x - 7 * d},${y} Z`, FISH, 0.5));
    o.push(fill(`M${x + 6 * d},${y} L${x + 9 * d},${y - 2.2} L${x + 9 * d},${y + 2.2} Z`, FISH_D, 0.4));
    o.push(circ(x - 4.6 * d, y - 0.4, 0.55, OUT, 0));
  }
  // a crate of fish on the quay in front of the stall
  o.push(rect(6, 488, 30, 10, '#7FA6B8', 0.6));
  for (const x of [12, 19, 26, 32]) o.push(ell(x, 488, 3.2, 1.2, FISH_L, 0.3));
  return o.join('');
}

// ── small props that move ───────────────────────────────────────────────────────

/** A crate of tomatoes with a rope handle (carried by the handle; 20 × 22, the handle's top at 0). */
export function tomatoCrate() {
  const o = [];
  o.push(line('M-6,6 C-6,-1 6,-1 6,6', '#8A6A3E', 1.4));
  o.push(rect(-10, 6, 20, 16, WOOD_L, 0.7));
  o.push(box(3, 6.6, 6.4, 15, WOOD));
  o.push(line('M-10,14 L10,14', WOOD_D, 0.6));
  for (const [x, y] of [[-6, 6], [-1.6, 5.2], [3, 6], [7, 5.6], [-3.8, 3.8], [1.4, 3.6], [5.4, 3.8]]) {
    o.push(circ(x, y, 2.5, '#D2352A', 0.5));
    o.push(flat(`M${x - 0.8},${y - 2.2} L${x + 0.8},${y - 2.2} L${x},${y - 3.1} Z`, '#4F7A2E'));
  }
  return o.join('');
}
/** A mackerel, held by the tail (14 × 6, its tail's root at 0, its head to the left). */
export function heldFish() {
  return fill('M-3,0 C-6,-3 -12,-3 -16,0 C-12,3 -6,3 -3,0 Z', FISH, 0.5)
    + flat('M-4,-1.4 C-7,-2.6 -11,-2.6 -14,-0.6 L-4,-0.4 Z', '#4E6F86')
    + fill('M-3,0 L1,-2.4 L1,2.4 Z', FISH_D, 0.4)
    + circ(-13, -0.4, 0.6, OUT, 0);
}
/** A sack of litter, tied, things poking out of its neck (22 × 22, sitting on 0). */
export function litterSack() {
  const o = [];
  o.push(line('M-2,-20 L-5,-24 M2,-20 L4,-25 M0,-20 L0,-24', '#6E6A64', 1));
  o.push(fill('M-3,-25 L-1,-27 L1,-24 Z', '#B9D2DA', 0.4));
  o.push(fill('M-10,0 C-12,-10 -8,-17 -3,-20 L3,-20 C8,-17 12,-10 10,0 Z', '#7E7A5E', 0.8));
  o.push(flat('M3,-19 C8,-16 11,-10 9.6,-0.6 L2,-0.6 C4,-8 4,-14 3,-19 Z', '#66624A'));
  o.push(line('M-3.6,-18 L3.6,-18', '#4A4636', 0.9));
  o.push(fill('M-6,-8 L-3,-11 L-1,-7 Z', '#9AA4A8', 0.4));
  return o.join('');
}
/** A wicker basket, empty (26 × 18, sitting on 0). */
export function wickerBasket() {
  const o = [];
  o.push(fill('M-12,-14 L12,-14 L10,0 L-10,0 Z', '#C79B5C', 0.8));
  o.push(flat('M4,-13.4 L11.4,-13.4 L9.6,-0.6 L3,-0.6 Z', '#A87F44'));
  for (const y of [-11, -7.4, -3.8]) o.push(line(`M-11.4,${y} L11.4,${y}`, '#8E6A36', 0.5));
  for (const x of [-7, -2.4, 2.4, 7]) o.push(line(`M${x},-14 L${x * 0.85},0`, '#8E6A36', 0.4));
  o.push(rect(-13, -16, 26, 2.6, '#B48A4E', 0.6, 1.2));
  o.push(line('M-8,-16 C-8,-24 8,-24 8,-16', '#8E6A36', 1.3));
  return o.join('');
}
/** A borrowed fishing rod, lying on the quay, with its reel and line (40 × 8, its butt at 0). */
export function fishingRod() {
  return line('M0,-1 L40,-6', '#6E4A2A', 1.8)
    + line('M0,-1 L40,-6', '#A8744A', 0.8)
    + fill('M6,-4.6 C6,-7 10,-7 10,-4.6 C10,-2.6 6,-2.6 6,-4.6 Z', '#9A9EA2', 0.5)
    + line('M40,-6 C42,-2 36,0 30,-0.4', '#E6E2D6', 0.4)
    + fill('M-1,-2.6 L5,-3.4 L5,0.6 L-1,1 Z', '#3E2E24', 0.5);
}

export const ART = [
  { name: 'econ7-hall-far', svg: hallFar, view: { x: 0, y: 214, w: 400, h: 300 }, box: { x: 0, y: 214, w: 400, h: 300 } },
  { name: 'econ7-hall-mid', svg: hallMid, view: { x: 0, y: 214, w: 400, h: 300 }, box: { x: 0, y: 214, w: 400, h: 300 } },
  { name: 'econ7-dome', svg: tickerDome, view: { x: 98, y: 400, w: 28, h: 40 }, box: { x: 98, y: 400, w: 28, h: 40 } },
  { name: 'econ7-harbour-far', svg: harbourFar, view: { x: 0, y: 214, w: 400, h: 300 }, box: { x: 400, y: 214, w: 400, h: 300 } },
  { name: 'econ7-harbour-mid', svg: harbourMid, view: { x: 0, y: 214, w: 400, h: 300 }, box: { x: 400, y: 214, w: 400, h: 300 } },
  { name: 'econ7-brig', svg: brig, view: { x: 190, y: 226, w: 214, h: 228 }, box: { x: 190, y: 226, w: 214, h: 228 } },
  { name: 'econ7-gull', svg: gull, view: { x: -13, y: -5, w: 26, h: 9 }, box: { x: -13, y: -5, w: 26, h: 9 } },
  { name: 'econ7-crate', svg: tomatoCrate, view: { x: -12, y: -2, w: 24, h: 25 }, box: { x: -12, y: -2, w: 24, h: 25 } },
  { name: 'econ7-fish', svg: heldFish, view: { x: -17, y: -4, w: 19, h: 8 }, box: { x: -17, y: -4, w: 19, h: 8 } },
  { name: 'econ7-sack', svg: litterSack, view: { x: -13, y: -28, w: 26, h: 29 }, box: { x: -13, y: -28, w: 26, h: 29 } },
  { name: 'econ7-basket', svg: wickerBasket, view: { x: -14, y: -24, w: 28, h: 25 }, box: { x: -14, y: -24, w: 28, h: 25 } },
  { name: 'econ7-rod', svg: fishingRod, view: { x: -2, y: -9, w: 44, h: 11 }, box: { x: -2, y: -9, w: 44, h: 11 } },
];
