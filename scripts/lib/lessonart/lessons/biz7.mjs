// business-foundations-7 — the recap: an old general store after closing on a wet evening,
// then a cobbled market street the next morning (LESSON_RULES AM13; the recap's full
// settings, built in layers).
//
// Every picture is in SCENE units with the band [214, 514], 400 × 300. Flat fills lit from
// the top left, a darker shaded side, one dark outline; real colours, no gradients, no glows.
//
// REFERENCES (npm run ref, scratchpad/ref/b7*):
//   b7store-1 "Adams Corner - General Store": a long counter of dark red-brown tongue-and-
//             groove boards under a plain worn top; behind it, dark board walls with shelf
//             bays to the ceiling, jars and tins along the shelves, a pale plank ceiling, a
//             brass register at the counter's end, a hanging cord.
//   b7store-2 "Children inside a general store, Ravenswood": shelves of tins and packets
//             floor to ceiling, sacks on the floor, a counter across the room.
//   b7till-1/2 "Antique Cash Register Collection": an ornate brass case, a curved front with
//             rows of round keys on stalks, a raised flag window on top, a wooden cash drawer
//             along the base that slides out.
//   b7abac-2  "20th Century Small Wooden Abacus": two upright wooden ends, ten horizontal
//             rods, round painted beads in rows, pushed to one side to count.
//   b7chest-1/2, b7cart-1 "The chestnut roaster", "chestnut seller street cart": a box cart
//             on two spoked wheels with a canopy on posts, a round iron roaster drum with a
//             tray of chestnuts on it, paper cones, a printed licence pinned to the side.
//   b7shop-1/2 "Shop fronts, Camden High Street", "Old shop fronts, High Street": painted
//             brick and render terraces, multi-paned bay windows, a hanging bracket sign,
//             a doorway between, chimney stacks on the roofline.
//   b7scaf-1  "Worker at Scaffolding": a grid of steel poles and ledgers with timber
//             boards, a worker in a hard hat and orange hi-vis vest.
//   b7market-1/2 "street market … under green awnings", "Flower market": stalls in a row
//             under striped and plain awnings, crates of produce at the front.

const OUT = '#2E241C';
const f2 = (n) => Number(n.toFixed(2));
const P = (pts) => 'M' + pts.map(([x, y]) => `${f2(x)},${f2(y)}`).join(' L') + ' Z';
const fill = (d, c, w = 1) => `<path d="${d}" fill="${c}" stroke="${OUT}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"/>`;
const flat = (d, c, o = 1) => `<path d="${d}" fill="${c}"${o < 1 ? ` opacity="${o}"` : ''}/>`;
const rect = (x, y, w, h, c, lw = 1, r = 0) => `<rect x="${f2(x)}" y="${f2(y)}" width="${f2(w)}" height="${f2(h)}" rx="${r}" fill="${c}" stroke="${OUT}" stroke-width="${lw}" stroke-linejoin="round"/>`;
const box = (x, y, w, h, c, o = 1) => `<rect x="${f2(x)}" y="${f2(y)}" width="${f2(w)}" height="${f2(h)}" fill="${c}"${o < 1 ? ` opacity="${o}"` : ''}/>`;
const line = (d, c, w) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const circ = (x, y, r, c, lw = 0.8) => `<circle cx="${f2(x)}" cy="${f2(y)}" r="${f2(r)}" fill="${c}" stroke="${OUT}" stroke-width="${lw}"/>`;
const ell = (x, y, rx, ry, c, lw = 0.8) => `<ellipse cx="${f2(x)}" cy="${f2(y)}" rx="${f2(rx)}" ry="${f2(ry)}" fill="${c}" stroke="${OUT}" stroke-width="${lw}"/>`;
const text = (x, y, s, size, c, extra = '') => `<text x="${f2(x)}" y="${f2(y)}" font-family="Georgia, 'Times New Roman', serif" font-weight="700" font-size="${size}" fill="${c}" text-anchor="middle"${extra}>${s}</text>`;

// ── palette ──────────────────────────────────────────────────────────────────
const WALL = '#6B3F27', WALL_D = '#55311E', WALL_L = '#7E4C30';
const SHELF = '#8A5532', SHELF_D = '#6A3F24', SHELF_L = '#A06840';
const CEIL = '#E9D9B8', CEIL_D = '#D4C29C', BEAM = '#5A3620';
const FLOOR = '#A7703F', FLOOR_D = '#8C5A2F', FLOOR_L = '#B98049';
const COUNTER = '#8E3B22', COUNTER_D = '#6F2C18', COUNTER_TOP = '#A86B45', COUNTER_TOP_L = '#C08356';
const GLASS_NIGHT = '#3E5468', GLASS_NIGHT_D = '#2F4254', GOLD = '#D9B24A', GOLD_D = '#A9852E';
const BRASS = '#CFA54A', BRASS_D = '#A27E2E', BRASS_L = '#E6C677';
const CREAM = '#F3E8CC', CREAM_D = '#DCCDA8';
const SACK = '#D8C49A', SACK_D = '#BCA578';
const LAMP_GREEN = '#3F7A4E', LAMP_GREEN_D = '#2D5A39';
const TINS = [['#B5372C', '#8E2820'], ['#2F6E9A', '#22557A'], ['#D3A43A', '#AD8228'], ['#3D7A4A', '#2C5B36'], ['#E2DACA', '#C4BBA8']];
const JAR = '#DCEBEE', JAR_D = '#B9D2D8';
const SWEETS = ['#E0505A', '#F2C14E', '#62B06A', '#5B8FD6', '#E98AC0', '#F08A3C'];

/** A tin standing on a shelf: a coloured cylinder with a paper band and a lid rim. */
function tin(x, yb, w, h, k) {
  const [c, cd] = TINS[k % TINS.length];
  return rect(x - w / 2, yb - h, w, h, c, 0.6)
    + box(x + w * 0.12, yb - h + 0.4, w * 0.38 - 0.3, h - 0.8, cd)
    + box(x - w / 2 + 0.4, yb - h * 0.66, w - 0.8, h * 0.32, CREAM)
    + box(x + w * 0.12, yb - h * 0.66, w * 0.38 - 0.3, h * 0.32, CREAM_D)
    + rect(x - w / 2 - 0.3, yb - h - 1.2, w + 0.6, 1.6, cd, 0.5);
}
/** A glass jar of sweets: a rounded jar, a lid, coloured sweets inside. */
function jar(x, yb, w, h, k) {
  const o = [];
  o.push(rect(x - w / 2, yb - h, w, h, JAR, 0.6, 2));
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      o.push(`<circle cx="${f2(x - w * 0.28 + c * w * 0.28)}" cy="${f2(yb - 2 - r * 2.6)}" r="1.15" fill="${SWEETS[(k + r * 3 + c) % SWEETS.length]}"/>`);
    }
  }
  o.push(box(x + w * 0.2, yb - h + 1, w * 0.18, h - 2, JAR_D, 0.8));
  o.push(rect(x - w / 2 + 0.6, yb - h - 2.4, w - 1.2, 2.6, k % 2 ? '#B5372C' : BRASS, 0.5));
  return o.join('');
}
/** A sack of flour slumped on the floor, its neck tied. */
function sack(x, yb, w, h) {
  return fill(`M${x - w / 2},${yb} C${x - w / 2 - 1},${yb - h * 0.6} ${x - w * 0.3},${yb - h} ${x},${yb - h} C${x + w * 0.3},${yb - h} ${x + w / 2 + 1},${yb - h * 0.6} ${x + w / 2},${yb} Z`, SACK, 0.7)
    + flat(`M${x + w * 0.1},${yb - h + 1} C${x + w * 0.35},${yb - h} ${x + w / 2 + 0.6},${yb - h * 0.6} ${x + w / 2 - 0.4},${yb - 0.4} L${x + w * 0.15},${yb - 0.4} Z`, SACK_D)
    + text(x, yb - h * 0.35, 'FLOUR', w * 0.22, '#7A5A34');
}
/** A packet box on a shelf. */
function packet(x, yb, w, h, c, cd) {
  return rect(x - w / 2, yb - h, w, h, c, 0.6) + box(x + w * 0.15, yb - h + 0.4, w * 0.35 - 0.3, h - 0.8, cd)
    + box(x - w / 2 + 0.8, yb - h * 0.62, w * 0.55, h * 0.24, CREAM);
}

// ══════════════════════════════════════════════════════════════════════════════
// THE GENERAL STORE AFTER CLOSING
// ══════════════════════════════════════════════════════════════════════════════

/** FAR + MID: the plank ceiling, the shop window on the rain, the door frame, the shelves to the ceiling, the floor. */
export function storeFar() {
  const o = [];
  // the walls, dark boards
  o.push(box(0, 214, 400, 300, WALL));
  for (let x = 3; x < 400; x += 7) o.push(line(`M${x},240 L${x},446`, WALL_D, 0.5));
  // the ceiling: pale planks running back, two dark beams
  o.push(box(0, 214, 400, 26, CEIL));
  for (let y = 219; y < 240; y += 5) o.push(line(`M0,${y} L400,${y}`, CEIL_D, 0.6));
  o.push(rect(-2, 236, 404, 6, BEAM, 0.8));
  o.push(box(0, 240, 400, 2, '#3F2615'));

  // ── the shop front on the left: the door frame (the door is its own picture) and the window ──
  // the door frame and the dark night through it
  o.push(rect(8, 340, 50, 110, '#4A2B18', 0.9));
  o.push(box(12, 344, 42, 104, '#2B3B48'));
  o.push(box(12, 344, 42, 30, '#33475A'));
  // the transom over the door, rain-dark, and the bell's bracket
  o.push(rect(8, 322, 50, 18, '#4A2B18', 0.8));
  o.push(rect(12, 325, 42, 12, GLASS_NIGHT, 0.6));
  o.push(line('M33,325 L33,337', '#4A2B18', 1.2));
  o.push(fill('M30,318 L36,318 L36,322 L30,322 Z', BRASS_D, 0.5));
  // the window: a big pane of rain-dark night with the shop's name painted backwards on it
  const WX0 = 66, WX1 = 176, WY0 = 268, WY1 = 420;
  o.push(rect(WX0 - 5, WY0 - 5, WX1 - WX0 + 10, WY1 - WY0 + 10, '#4A2B18', 1));
  o.push(box(WX0, WY0, WX1 - WX0, WY1 - WY0, GLASS_NIGHT));
  // the street outside at night: a lamp-post's light pool, the houses opposite
  o.push(box(WX0, 352, WX1 - WX0, 68, GLASS_NIGHT_D));
  for (const [x, w, h] of [[70, 26, 62], [98, 30, 76], [130, 22, 56], [154, 22, 70]]) {
    o.push(box(x, WY1 - h - 30, w, h, '#2A3846'));
    for (let wy = WY1 - h - 24; wy < WY1 - 40; wy += 14) o.push(box(x + 5, wy, 5, 6, '#E9C772'), box(x + w - 10, wy, 5, 6, '#3A4A5A'));
  }
  o.push(box(WX0, 400, WX1 - WX0, 20, '#24303B'));
  o.push(rect(120, 330, 2.4, 70, '#1E262E', 0.4));
  o.push(fill('M115,326 L127,326 L125,333 L117,333 Z', '#F2D78A', 0.5));
  // the glazing bars
  o.push(rect(WX0 + (WX1 - WX0) / 2 - 1.5, WY0, 3, WY1 - WY0, '#4A2B18', 0.6));
  o.push(rect(WX0, WY0 + 52, WX1 - WX0, 3, '#4A2B18', 0.6));
  // the name, gilt, painted on the outside and so read backwards from in here
  o.push(`<g transform="translate(${(WX0 + WX1) / 2},0) scale(-1,1)">`
    + `<text x="0" y="${WY0 + 22}" font-family="Georgia, serif" font-weight="700" font-size="12" fill="${GOLD}" stroke="${GOLD_D}" stroke-width="0.4" text-anchor="middle" letter-spacing="1">PARK &amp; SON</text>`
    + `<text x="0" y="${WY0 + 40}" font-family="Georgia, serif" font-weight="700" font-size="9" fill="${GOLD}" stroke="${GOLD_D}" stroke-width="0.3" text-anchor="middle" letter-spacing="0.8">GENERAL STORE</text>`
    + '</g>');
  // the sill and the wainscot below it
  o.push(rect(WX0 - 7, WY1 + 4, WX1 - WX0 + 14, 5, SHELF_L, 0.8));
  o.push(rect(WX0 - 4, WY1 + 9, WX1 - WX0 + 8, 30, WALL_L, 0.7));
  for (let x = WX0 + 4; x < WX1; x += 22) o.push(rect(x, WY1 + 14, 16, 20, WALL, 0.5));
  // a wall clock between the window and the shelves
  o.push(circ(42, 286, 13, '#7A4A2A', 1));
  o.push(circ(42, 286, 10.4, CREAM, 0.7));
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * Math.PI * 2;
    o.push(line(`M${f2(42 + 8.6 * Math.cos(a))},${f2(286 + 8.6 * Math.sin(a))} L${f2(42 + 9.8 * Math.cos(a))},${f2(286 + 9.8 * Math.sin(a))}`, OUT, 0.6));
  }
  o.push(line('M42,286 L42,279 M42,286 L47,289', OUT, 1));
  o.push(rect(39, 298, 6, 14, '#7A4A2A', 0.6));

  // ── the shelves behind the counter, floor to ceiling ──
  const SX0 = 184, SX1 = 404;
  o.push(rect(SX0, 246, SX1 - SX0 + 4, 226, SHELF_D, 1));
  o.push(box(SX0 + 2, 248, SX1 - SX0, 222, '#4E2E1A'));
  // the uprights
  for (const x of [SX0, 256, 330, 400]) o.push(rect(x - 3, 246, 6, 226, SHELF, 0.7), box(x + 0.5, 247, 2.2, 224, SHELF_D));
  const levels = [282, 318, 354, 390];
  for (const y of levels) {
    o.push(rect(SX0, y, SX1 - SX0 + 4, 4, SHELF_L, 0.7));
    o.push(box(SX0 + 1, y + 4, SX1 - SX0 + 2, 2, '#3A2212', 0.6));
  }
  // what is on each shelf
  let k = 0;
  // top shelf (on 282): big tins and boxes
  for (const x of [196, 212, 228, 244]) o.push(tin(x, 282, 12, 20, k++));
  for (const x of [268, 284, 300, 316]) o.push(packet(x, 282, 13, 22, k % 2 ? '#C9682E' : '#7A5AA0', k % 2 ? '#A4511F' : '#5E447F'), (k += 1, ''));
  for (const x of [344, 360, 376, 390]) o.push(tin(x, 282, 12, 18, k++));
  // second shelf (318): jars of sweets
  for (const x of [198, 216, 234]) o.push(jar(x, 318, 13, 20, k++));
  for (const x of [270, 288, 306, 320]) o.push(jar(x, 318, 13, 22, k++));
  for (const x of [344, 362, 380]) o.push(jar(x, 318, 13, 20, k++));
  // third shelf (354): tins in a row and bottles
  for (const x of [196, 210, 224, 238]) o.push(tin(x, 354, 11, 16, k++));
  for (const x of [268, 280, 292, 304, 316]) {
    o.push(fill(`M${x - 3},354 L${x - 3},343 C${x - 3},340 ${x - 1.4},339 ${x - 1.4},336 L${x - 1.4},332 L${x + 1.4},332 L${x + 1.4},336 C${x + 1.4},339 ${x + 3},340 ${x + 3},343 L${x + 3},354 Z`, k % 2 ? '#4E7A3E' : '#7A3A2E', 0.6));
    o.push(box(x - 2.4, 345, 4.8, 5, CREAM));
    k++;
  }
  for (const x of [344, 360, 376, 390]) o.push(packet(x, 354, 13, 18, k % 2 ? '#2F6E9A' : '#B5372C', k % 2 ? '#22557A' : '#8E2820'), (k += 1, ''));
  // fourth shelf (390): boxes and a row of tins
  for (const x of [198, 216, 234]) o.push(packet(x, 390, 15, 24, k % 2 ? '#D3A43A' : '#3D7A4A', k % 2 ? '#AD8228' : '#2C5B36'), (k += 1, ''));
  for (const x of [270, 286, 302, 318]) o.push(tin(x, 390, 13, 20, k++));
  for (const x of [346, 366, 386]) o.push(jar(x, 390, 15, 22, k++));
  // the lowest bay: sacks of flour on the floor behind the counter (mostly hidden by it)
  const levels2 = [426];
  for (const y of levels2) { o.push(rect(SX0, y, SX1 - SX0 + 4, 4, SHELF_L, 0.7)); o.push(box(SX0 + 1, y + 4, SX1 - SX0 + 2, 2, '#3A2212', 0.6)); }
  for (const x of [204, 230, 290, 360]) o.push(sack(x, 470, 24, 30));
  for (const x of [262, 316, 386]) o.push(packet(x, 426, 16, 22, '#C9682E', '#A4511F'));
  // the ladder on its rail, leaning against the shelves on the right
  o.push(rect(SX0, 250, SX1 - SX0 + 4, 3, BRASS, 0.6));
  o.push(line('M372,251 L384,470 M388,251 L400,470', SHELF_L, 3));
  o.push(line('M372,251 L384,470 M388,251 L400,470', OUT, 0.5));
  for (let y = 270; y < 466; y += 20) {
    const t = (y - 251) / 197;
    o.push(line(`M${f2(372 + 12 * t)},${y} L${f2(388 + 12 * t)},${y}`, SHELF_L, 2));
  }
  o.push(circ(373, 251, 2.4, BRASS, 0.6), circ(389, 251, 2.4, BRASS, 0.6));

  // ── the floor: boards running back from the front ──
  o.push('<clipPath id="b7floor"><path d="M-4,446 L184,446 L184,470 L404,470 L404,516 L-4,516 Z"/></clipPath><g clip-path="url(#b7floor)">');
  o.push(rect(-2, 446, 406, 70, FLOOR, 0.9));
  o.push(box(0, 446, 400, 5, FLOOR_D));
  for (let k2 = 0; k2 < 22; k2++) {
    const xb = -60 + k2 * 24;
    o.push(line(`M${f2(xb * 0.6 + 80)},451 L${f2(xb)},514`, FLOOR_D, 0.6));
  }
  for (const [x, y, w] of [[30, 470, 30], [120, 490, 40], [70, 504, 34], [160, 460, 22]]) o.push(box(x, y, w, 1.4, FLOOR_L));
  o.push('</g>');
  // the skirting along the back
  o.push(rect(-2, 442, 186, 5, WALL_D, 0.6));
  return o.join('');
}

/** The shop door: a panelled door with its glass, hinged on its left edge. */
export function storeDoor() {
  const o = [];
  o.push(rect(12, 344, 42, 104, '#6E3F22', 1));
  o.push(box(40, 345, 13, 102, '#5A321A'));
  o.push(rect(17, 350, 32, 42, GLASS_NIGHT, 0.7));
  o.push(line('M33,350 L33,392', '#6E3F22', 1.4));
  o.push(text(33, 372, 'CLOSED', 6.4, CREAM));
  o.push(rect(17, 400, 14, 40, '#7E4A2A', 0.6), rect(35, 400, 14, 40, '#7E4A2A', 0.6));
  o.push(circ(48, 398, 1.8, BRASS, 0.5));
  return o.join('');
}

/** The pendant lamp over the counter: a green enamel shade on its cord. Hung from its top. */
export function lamp() {
  const o = [];
  o.push(line('M0,0 L0,46', '#2A1E16', 0.8));
  o.push(fill('M-3,46 L3,46 L3,50 L-3,50 Z', BRASS_D, 0.5));
  o.push(fill('M-3,50 L3,50 L15,60 L-15,60 Z', LAMP_GREEN, 0.9));
  o.push(flat('M1,50 L3,50 L15,60 L4,60 Z', LAMP_GREEN_D));
  o.push(fill('M-15,60 L15,60 L13,62 L-13,62 Z', '#F6E7B4', 0.6));
  return o.join('');
}

/** The bell over the door, hung from its top. */
export function bell() {
  return line('M0,0 L0,3', BRASS_D, 0.8)
    + fill('M-3.4,9 C-3.4,4 -2,2.6 0,2.6 C2,2.6 3.4,4 3.4,9 L4.4,10 L-4.4,10 Z', BRASS, 0.6)
    + flat('M0.8,3 C2.2,3.4 3.2,5 3.2,9 L1,9 Z', BRASS_D)
    + circ(0, 10.6, 1, BRASS_D, 0.4);
}

/** NEAR: the long counter, drawn over the accountant's legs, and what stays put on it. */
export function storeCounter() {
  const o = [];
  const X0 = 186, X1 = 404, TOP = 468;
  // the front: dark red tongue-and-groove boards, a kick plate at the foot
  o.push(rect(X0 + 2, TOP + 6, X1 - X0, 28, COUNTER, 1));
  for (let x = X0 + 6; x < X1; x += 6) o.push(line(`M${x},${TOP + 8} L${x},${TOP + 30}`, COUNTER_D, 0.6));
  o.push(box(X0 + 3, TOP + 7, X1 - X0 - 2, 3, COUNTER_D));
  o.push(rect(X0 + 1, TOP + 30, X1 - X0 + 2, 4, '#5A2414', 0.7));
  // the top: a worn wooden slab with a lit front edge
  o.push(rect(X0 - 2, TOP, X1 - X0 + 6, 6, COUNTER_TOP, 1));
  o.push(box(X0 - 1, TOP + 0.6, X1 - X0 + 4, 1.4, COUNTER_TOP_L));
  o.push(box(X0 - 1, TOP + 4.2, X1 - X0 + 4, 1.4, '#8A5333'));
  // a teacup on its saucer, gone cold
  const CX = 272;
  o.push(ell(CX, TOP + 0.4, 6, 1.4, '#F4F0E6', 0.6));
  o.push(fill(`M${CX - 4},${TOP - 7} L${CX + 4},${TOP - 7} C${CX + 4},${TOP - 2} ${CX + 2.4},${TOP - 0.6} ${CX},${TOP - 0.6} C${CX - 2.4},${TOP - 0.6} ${CX - 4},${TOP - 2} ${CX - 4},${TOP - 7} Z`, '#F4F0E6', 0.6));
  o.push(line(`M${CX + 4},${TOP - 5.6} C${CX + 7},${TOP - 5.6} ${CX + 7},${TOP - 2.6} ${CX + 3.6},${TOP - 2.6}`, OUT, 0.6));
  o.push(box(CX - 3.2, TOP - 6.6, 6.4, 1.2, '#8A5A34'));
  o.push(line(`M${CX - 3.6},${TOP - 4} L${CX + 3.6},${TOP - 4}`, '#3E7AA8', 0.6));
  // the receipt spike, its old receipts
  const SPX = 358;
  o.push(ell(SPX, TOP - 0.8, 4.4, 1.4, '#5A5048', 0.6));
  o.push(line(`M${SPX},${TOP - 1} L${SPX},${TOP - 20}`, '#6E6A64', 0.9));
  o.push(fill(`M${SPX - 4},${TOP - 4} L${SPX + 4},${TOP - 5} L${SPX + 4},${TOP - 2} L${SPX - 4},${TOP - 1.6} Z`, '#F3EEDF', 0.4));
  o.push(fill(`M${SPX - 3.6},${TOP - 7.4} L${SPX + 4.2},${TOP - 7} L${SPX + 3.8},${TOP - 4.6} L${SPX - 4},${TOP - 5} Z`, '#EDE5CF', 0.4));
  return o.join('');
}

/** The brass cash register, its drawer shut (the drawer is drawn live in front of it). */
export function till() {
  const o = [];
  // the base the drawer sits in
  o.push(rect(-14, 12, 28, 6, '#6E3F22', 0.8));
  // the body: an ornate brass case with a sloped key bed
  o.push(fill('M-12,12 L-12,-6 C-12,-9 -10,-10 -8,-10 L8,-10 C10,-10 12,-9 12,-6 L12,12 Z', BRASS, 0.9));
  o.push(flat('M3,-9.6 L8,-9.6 C10,-9.6 11.6,-8.6 11.6,-6 L11.6,11.6 L3,11.6 Z', BRASS_D));
  o.push(line('M-10,-6 C-6,-8 6,-8 10,-6 M-10,9 L10,9', BRASS_D, 0.6));
  // the scrollwork on the case
  o.push(line('M-9,3 C-7,0 -4,0 -4,3 C-4,6 -7,6 -7,4 M9,3 C7,0 4,0 4,3 C4,6 7,6 7,4', '#8C6A26', 0.6));
  // the key bed: three rows of round keys
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 5; c++) o.push(circ(-7.6 + c * 3.8, -5 + r * 3.2, 1.25, CREAM, 0.45));
  }
  // the flag window on top, showing the last sale
  o.push(rect(-7, -18, 14, 8, BRASS_L, 0.7));
  o.push(rect(-5, -16.4, 10, 4.8, CREAM, 0.5));
  o.push(text(0, -12.6, '£0', 4.2, '#2E241C'));
  o.push(fill('M-8,-18 C-6,-21 6,-21 8,-18 Z', BRASS_L, 0.6));
  // the crank on the side
  o.push(line('M12,2 L16,2 L16,-4', '#6E6A64', 1.1));
  o.push(circ(16, -4.6, 1.3, '#2E241C', 0.4));
  return o.join('');
}

/** The ledger lying open: two cream pages in a green cloth binding, written in. */
export function ledgerOpen() {
  const o = [];
  o.push(fill('M-19,4 L19,4 L17,-3 L-17,-3 Z', '#2F5D45', 0.9));                       // the cover
  o.push(fill('M-17,2.6 L-0.6,3 L-0.6,-4.2 L-15.6,-4.6 Z', CREAM, 0.6));              // left page
  o.push(fill('M0.6,3 L17,2.6 L15.6,-4.6 L0.6,-4.2 Z', CREAM, 0.6));                    // right page
  o.push(flat('M0.6,3 L17,2.6 L16.4,0.4 L0.6,0.9 Z', CREAM_D));
  for (let r = 0; r < 4; r++) {
    o.push(line(`M${-14.6 + r * 0.3},${f2(-3.2 + r * 1.5)} L${-2},${f2(-2.9 + r * 1.5)}`, '#8A9AB0', 0.35));
    o.push(line(`M2,${f2(-2.9 + r * 1.5)} L${f2(14.6 - r * 0.3)},${f2(-3.2 + r * 1.5)}`, '#8A9AB0', 0.35));
  }
  o.push(line('M-13,-2.5 L-6,-2.4 M-13,-1 L-8,-0.9 M-13,0.5 L-5,0.6', '#3A3430', 0.5));
  o.push(line('M3,-2.4 L10,-2.5 M3,-0.9 L8,-1', '#3A3430', 0.5));
  o.push(line('M3,1.6 L13,1.5', '#B23A2E', 0.7));                                           // the profit line, in red
  return o.join('');
}
/** The same ledger shut: a fat green book, its page edges showing. */
export function ledgerShut() {
  return fill('M-17,4 L17,4 L15,-4 L-15,-4 Z', '#2F5D45', 0.9)
    + flat('M3,-3.6 L15,-3.6 L16.6,3.6 L3,3.6 Z', '#244A37')
    + rect(-15.5, 0.4, 31, 2.2, CREAM, 0.4)
    + box(-14, -2, 3, 5.6, '#7A3A2E');
}

/** The wooden abacus: two uprights on a foot, three rods (the beads are live). */
export function abacus() {
  const o = [];
  o.push(rect(-24, 22, 48, 4, '#8A5532', 0.9));
  o.push(rect(-23, -26, 5, 48, '#A06840', 0.9));
  o.push(box(-20.6, -25, 1.8, 46, '#8A5532'));
  o.push(rect(18, -26, 5, 48, '#A06840', 0.9));
  o.push(box(20.4, -25, 1.8, 46, '#8A5532'));
  o.push(rect(-24, -28, 48, 4, '#A06840', 0.9));
  for (const y of [-14, -1, 12]) o.push(line(`M-18,${y} L18,${y}`, '#7A7068', 0.8));
  return o.join('');
}

// ══════════════════════════════════════════════════════════════════════════════
// THE MARKET STREET NEXT MORNING — drawn in its own frame (x 0–400), laid at world x 400.
// ══════════════════════════════════════════════════════════════════════════════

const SKY = ['#9CCBEB', '#B1D6EE', '#C8E2F1', '#E2EEF2'];
const BRICK = '#B9643F', BRICK_D = '#9A4E31', RENDER = '#EFE6D2', RENDER_D = '#D6CAAE';
const STONE = '#D9CCB0', STONE_D = '#BDAE8F';
const COBBLE = '#8E8A82', COBBLE_D = '#77736C', COBBLE_L = '#A6A29A';
const PAVE = '#CFC6B6', PAVE_D = '#B5AC9B', PAVE_LINE = '#A39A88';
const POLE = '#9CA4AA', POLE_D = '#7B848A', BOARD = '#B98A52';
const HIVIS = '#EE7A2A', HAT = '#F2C230';

function sky(x, y0, w, h) {
  const out = [];
  const bands = [0, 0.3, 0.56, 0.8, 1];
  for (let k = 0; k < 4; k++) out.push(box(x, y0 + h * bands[k], w, h * (bands[k + 1] - bands[k]) + 0.3, SKY[k]));
  return out.join('');
}
/** A sash window with its panes. */
function sash(x, y, w, h, frame = '#F4EFE4') {
  return rect(x, y, w, h, frame, 0.6) + box(x + 1.6, y + 1.6, w - 3.2, h / 2 - 2, '#5E7A8E') + box(x + 1.6, y + h / 2 + 0.4, w - 3.2, h / 2 - 2, '#5E7A8E')
    + line(`M${x + w / 2},${y + 1.6} L${x + w / 2},${y + h - 1.6}`, frame, 0.8)
    + box(x + 1.6, y + 1.6, (w - 3.2) * 0.35, h / 2 - 2, '#7E98AA');
}
/** A painted figure at a distance (a builder on the scaffold): hard hat, hi-vis vest. */
function builderFar(x, yb, h, dir = 1) {
  const hw = h * 0.16;
  return fill(`M${x - hw * 0.8},${yb} L${x - hw * 0.7},${yb - h * 0.4} L${x + hw * 0.7},${yb - h * 0.4} L${x + hw * 0.8},${yb} Z`, '#3E4A5E', 0.5)
    + fill(`M${x - hw},${yb - h * 0.38} L${x - hw * 0.8},${yb - h * 0.76} L${x + hw * 0.8},${yb - h * 0.76} L${x + hw},${yb - h * 0.38} Z`, HIVIS, 0.5)
    + box(x - hw * 0.9, yb - h * 0.55, hw * 1.8, h * 0.05, '#F4EFE4')
    + circ(x + dir * 0.4, yb - h * 0.85, h * 0.1, '#C98F64', 0.5)
    + fill(`M${x - h * 0.13},${yb - h * 0.88} C${x - h * 0.12},${yb - h * 1.02} ${x + h * 0.12},${yb - h * 1.02} ${x + h * 0.13},${yb - h * 0.88} Z`, HAT, 0.5);
}
/** A painted shopper at a distance. */
function shopper(x, yb, h, coat, coatD, dir = 1) {
  const hw = h * 0.17;
  return fill(`M${x - hw},${yb} L${x - hw * 0.7},${yb - h * 0.72} L${x + hw * 0.7},${yb - h * 0.72} L${x + hw},${yb} Z`, coat, 0.5)
    + flat(`M${x + hw * 0.1 * dir},${yb - h * 0.7} L${x + hw * 0.7 * dir},${yb - h * 0.72} L${x + hw * dir},${yb} L${x + hw * 0.2 * dir},${yb} Z`, coatD)
    + circ(x + dir * 0.5, yb - h * 0.82, h * 0.12, '#D4A07A', 0.5)
    + flat(`M${x - h * 0.12 + dir},${yb - h * 0.86} C${x - h * 0.1},${yb - h * 0.99} ${x + h * 0.12},${yb - h * 0.99} ${x + h * 0.13 + dir},${yb - h * 0.86} Z`, '#4A3424');
}
/** A market stall: a striped awning on two posts over a table of produce in crates. */
function stall(x0, x1, top, stripeA, stripeB, goods) {
  const o = [];
  const yb = 444;
  o.push(rect(x0 + 2, top, 2.4, yb - top, '#5A4632', 0.5), rect(x1 - 4.4, top, 2.4, yb - top, '#5A4632', 0.5));
  // the table and its crates of goods
  o.push(rect(x0 - 2, yb - 16, x1 - x0 + 4, 3, '#8A6A44', 0.6));
  o.push(rect(x0, yb - 13, x1 - x0, 13, '#E8DFC8', 0.5));
  o.push(box(x0, yb - 13, x1 - x0, 3, '#D6CBAE'));
  const n = Math.floor((x1 - x0 - 4) / 12);
  for (let k = 0; k < n; k++) {
    const cx = x0 + 4 + k * 12;
    o.push(rect(cx, yb - 22, 10, 6, '#B98A52', 0.5));
    const [c, cd] = goods[k % goods.length];
    for (let j = 0; j < 4; j++) o.push(`<circle cx="${f2(cx + 1.8 + j * 2.2)}" cy="${f2(yb - 22.4 - (j % 2) * 0.8)}" r="1.5" fill="${c}" stroke="${cd}" stroke-width="0.4"/>`);
  }
  // the awning
  const stripes = Math.max(4, Math.round((x1 - x0) / 9));
  const sw = (x1 - x0 + 8) / stripes;
  for (let k = 0; k < stripes; k++) {
    const sx = x0 - 4 + k * sw;
    o.push(fill(P([[sx + 3, top - 10], [sx + sw + 3, top - 10], [sx + sw, top + 2], [sx, top + 2]]), k % 2 ? stripeB : stripeA, 0.5));
  }
  for (let k = 0; k < stripes; k++) {
    const sx = x0 - 4 + k * sw;
    o.push(fill(`M${f2(sx)},${top + 2} Q${f2(sx + sw / 2)},${top + 8} ${f2(sx + sw)},${top + 2} Z`, k % 2 ? stripeB : stripeA, 0.5));
  }
  return o.join('');
}

/** FAR + MID: the morning sky, the terrace across the road (scaffolded house, the bank and its clock, shops), the stalls, the road. */
export function streetFar() {
  const o = [];
  o.push(sky(0, 214, 400, 110));
  // a far roofline beyond, in haze
  o.push(flat('M0,300 L30,300 L30,286 L64,286 L64,296 L110,296 L110,280 L150,280 L150,292 L210,292 L210,284 L262,284 L262,296 L320,296 L320,282 L360,282 L360,294 L400,294 L400,330 L0,330 Z', '#B9C6CE'));

  // ── the house under scaffolding (left) ──
  o.push(rect(0, 296, 138, 148, BRICK, 1));
  o.push(box(96, 297, 41, 146, BRICK_D));
  for (let y = 302; y < 444; y += 5) o.push(line(`M0,${y} L138,${y}`, BRICK_D, 0.35));
  for (const [x, y] of [[14, 312], [56, 312], [98, 312], [14, 360], [56, 360], [98, 360]]) o.push(sash(x, y, 24, 32));
  o.push(rect(-4, 290, 146, 6, STONE, 0.8));
  o.push(rect(40, 404, 30, 40, '#3E5A6E', 0.7));
  // chimney stacks
  o.push(rect(20, 268, 14, 22, BRICK, 0.7), rect(18, 264, 18, 5, STONE, 0.6));
  o.push(rect(100, 272, 12, 18, BRICK, 0.7), rect(98, 268, 16, 5, STONE, 0.6));
  // the scaffold: standards, ledgers, boards, a ladder, two builders on it
  for (const x of [6, 46, 86, 126]) o.push(rect(x - 1.4, 290, 2.8, 154, POLE, 0.5));
  for (const y of [302, 346, 392]) {
    o.push(rect(0, y - 1.2, 140, 2.4, POLE, 0.5));
    o.push(rect(0, y + 1.2, 140, 4, BOARD, 0.6));
    o.push(box(0, y + 3.6, 140, 1.6, '#8E6838'));
  }
  o.push(line('M6,346 L46,392 M86,302 L126,346', POLE_D, 1.2));
  o.push(line('M108,392 L114,346 M118,392 L124,346', '#9A7A50', 1.4));
  for (let y = 352; y < 392; y += 7) o.push(line(`M${f2(108 + (392 - y) * 0.15)},${y} L${f2(118 + (392 - y) * 0.15)},${y}`, '#9A7A50', 1));
  o.push(builderFar(30, 346, 36, 1));
  o.push(builderFar(72, 392, 38, -1));
  // a bucket on a rope
  o.push(line('M100,302 L100,330', '#5A4632', 0.5));
  o.push(fill('M96,330 L104,330 L103,337 L97,337 Z', '#7E8890', 0.5));

  // ── the bank (centre): stone front, columns, a pediment with a clock (the hands are live) ──
  const BX0 = 140, BX1 = 262;
  o.push(rect(BX0, 300, BX1 - BX0, 144, STONE, 1));
  o.push(box(BX1 - 34, 301, 33, 142, STONE_D));
  o.push(fill(P([[BX0 - 4, 300], [(BX0 + BX1) / 2, 266], [BX1 + 4, 300]]), STONE, 1));
  o.push(flat(`M${(BX0 + BX1) / 2},270 L${BX1},299 L${(BX0 + BX1) / 2},299 Z`, STONE_D));
  o.push(rect(BX0 - 4, 298, BX1 - BX0 + 8, 5, '#E6DCC4', 0.7));
  o.push(circ(201, 287, 11, CREAM, 1));
  o.push(circ(201, 287, 9, '#FBF6EA', 0.5));
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * Math.PI * 2;
    o.push(line(`M${f2(201 + 7.2 * Math.cos(a))},${f2(287 + 7.2 * Math.sin(a))} L${f2(201 + 8.4 * Math.cos(a))},${f2(287 + 8.4 * Math.sin(a))}`, OUT, 0.6));
  }
  o.push(text(201, 314, 'BANK', 9, '#5A4A34', ' letter-spacing="2"'));
  for (const x of [154, 178, 224, 248]) {
    o.push(rect(x - 4, 322, 8, 104, '#EDE4CF', 0.7));
    o.push(box(x + 0.6, 323, 2.8, 102, STONE_D));
    o.push(rect(x - 5.5, 320, 11, 3, '#EDE4CF', 0.5), rect(x - 5.5, 424, 11, 3, '#EDE4CF', 0.5));
  }
  o.push(rect(190, 372, 22, 54, '#5A3A26', 0.8));
  o.push(box(201, 373, 10, 52, '#47301F'));
  o.push(rect(BX0 - 2, 426, BX1 - BX0 + 4, 4, '#E6DCC4', 0.6));
  o.push(rect(BX0 - 5, 430, BX1 - BX0 + 10, 4, STONE_D, 0.6));

  // ── the shop fronts (right): a rendered terrace, bay windows, hanging signs ──
  o.push(rect(262, 290, 140, 154, RENDER, 1));
  o.push(rect(330, 290, 72, 154, '#C8D8C8', 1));
  o.push(box(380, 291, 21, 152, '#B0C2B0'));
  o.push(box(310, 291, 19, 152, RENDER_D));
  for (const [x, y] of [[272, 304], [300, 304], [342, 304], [370, 304]]) o.push(sash(x, y, 18, 26));
  o.push(rect(258, 284, 146, 6, '#8A5A3A', 0.7));
  // the shopfronts at street level
  o.push(rect(264, 362, 64, 82, '#2F6E9A', 0.9));
  o.push(rect(268, 372, 36, 52, '#E9EEF0', 0.6));
  o.push(line('M280,372 L280,424 M292,372 L292,424 M268,398 L304,398', '#2F6E9A', 1));
  o.push(rect(308, 380, 16, 64, '#22557A', 0.6));
  o.push(rect(264, 352, 64, 10, '#22557A', 0.7));
  o.push(text(296, 360, 'BAKERY', 6.6, CREAM, ' letter-spacing="1"'));
  o.push(rect(332, 362, 70, 82, '#6E3F2E', 0.9));
  o.push(rect(338, 372, 40, 52, '#E9EEF0', 0.6));
  o.push(line('M351,372 L351,424 M365,372 L365,424 M338,398 L378,398', '#6E3F2E', 1));
  o.push(rect(382, 380, 16, 64, '#55301F', 0.6));
  o.push(rect(332, 352, 70, 10, '#55301F', 0.7));
  o.push(text(367, 360, 'IRONMONGER', 6, CREAM));
  // hanging bracket signs
  o.push(line('M262,340 L282,340', '#2E241C', 0.9));
  o.push(rect(266, 342, 14, 10, '#D9B24A', 0.6));
  o.push(line('M402,336 L384,336', '#2E241C', 0.9));
  o.push(fill('M384,338 L398,338 L398,348 L384,348 Z', '#3D7A4A', 0.6));
  // the far pavement
  o.push(rect(-2, 444, 404, 8, PAVE, 0.8));
  o.push(box(0, 450, 400, 2, PAVE_D));

  // ── the market stalls on the far pavement, in front of the shops ──
  o.push(stall(270, 324, 404, '#C8463A', '#F4EBD8', [['#E04A3A', '#A8302A'], ['#F2B23A', '#C48A22'], ['#7CB04A', '#5A8A32']]));
  o.push(stall(338, 398, 404, '#2F7A5A', '#F4EBD8', [['#C9D6DE', '#9AAAB4'], ['#E8B8A0', '#C48E76'], ['#C9D6DE', '#9AAAB4']]));
  // fish laid on the second stall's ice
  for (const x of [344, 356, 368, 380]) o.push(fill(`M${x},420 C${x + 3},418 ${x + 7},418 ${x + 9},420 L${x + 11},418 L${x + 11},422 L${x + 9},420 C${x + 7},422 ${x + 3},422 ${x},420 Z`, '#A8B8C2', 0.4));
  // shoppers
  o.push(shopper(330, 446, 30, '#7E5A8E', '#634572', -1));
  o.push(shopper(256, 446, 28, '#4E6E5A', '#3C5646', 1));
  o.push(shopper(146, 446, 29, '#A0603A', '#824A2B', 1));

  // ── the road: cobbles in rows ──
  o.push(rect(-2, 452, 404, 30, COBBLE, 0.8));
  for (let r = 0; r < 5; r++) {
    const y = 454 + r * 5.6;
    o.push(line(`M0,${f2(y + 5)} L400,${f2(y + 5)}`, COBBLE_D, 0.5));
    for (let x = (r % 2) * 4; x < 400; x += 8) {
      o.push(box(x + 0.6, y + 0.6, 6.6, 4.2, r % 3 === 0 ? COBBLE_L : COBBLE));
      o.push(line(`M${x + 7.6},${f2(y)} L${x + 7.6},${f2(y + 5)}`, COBBLE_D, 0.45));
    }
  }
  // the kerb and the near pavement
  o.push(rect(-2, 480, 404, 5, '#D9D2C2', 0.8));
  o.push(rect(-2, 485, 404, 31, PAVE, 0.8));
  for (const y of [496, 508]) o.push(line(`M0,${y} L400,${y}`, PAVE_LINE, 0.5));
  for (let x = 10; x < 400; x += 26) o.push(line(`M${x},485 L${x - 2},496 M${x + 13},496 L${x + 11},508`, PAVE_LINE, 0.5));
  return o.join('');
}

/** NEAR: the chestnut cart on its pavement, drawn over the seller's legs. In street x. */
export function cart() {
  const o = [];
  const X0 = 164, X1 = 278, TOP = 466;
  // the canopy on two posts
  o.push(rect(167, 398, 3, TOP - 398, '#5A3A26', 0.6));
  o.push(rect(272, 398, 3, TOP - 398, '#5A3A26', 0.6));
  const stripes = 12, sw = (X1 - X0 + 16) / stripes;
  for (let k = 0; k < stripes; k++) {
    const sx = X0 - 8 + k * sw;
    o.push(fill(P([[sx + 4, 384], [sx + sw + 4, 384], [sx + sw, 398], [sx, 398]]), k % 2 ? '#F4EBD8' : '#B5372C', 0.6));
  }
  for (let k = 0; k < stripes; k++) {
    const sx = X0 - 8 + k * sw;
    o.push(fill(`M${f2(sx)},398 Q${f2(sx + sw / 2)},404 ${f2(sx + sw)},398 Z`, k % 2 ? '#F4EBD8' : '#B5372C', 0.6));
  }
  o.push(rect(X0 - 10, 382, X1 - X0 + 22, 3, '#5A3A26', 0.6));
  // the brazier: a round iron drum, its fire door, a tray of chestnuts on top
  o.push(rect(228, 446, 24, 20, '#3F4448', 1));
  o.push(box(242, 447, 9, 18, '#2C3033'));
  o.push(line('M228,452 L252,452 M228,460 L252,460', '#2C3033', 0.6));
  o.push(rect(233, 454, 10, 8, '#2C3033', 0.6));
  o.push(rect(225, 441, 30, 5, '#5E6468', 0.8));
  for (let k = 0; k < 9; k++) o.push(circ(228.5 + k * 2.9, 440.4 - (k % 2) * 0.8, 1.6, '#7A4A2A', 0.4));
  // the seller's pile of paper bags at the right
  for (let k = 0; k < 3; k++) o.push(rect(258 + k * 1.2, 456 - k * 1.4, 8, 10, '#C99B62', 0.5));
  // the accountant's end: a pile of paper bags
  for (let k = 0; k < 3; k++) o.push(rect(168 + k * 1.2, 456 - k * 1.4, 8, 10, '#C99B62', 0.5));
  // the cart body: a wooden box, its top, a painted name
  o.push(rect(X0, TOP, X1 - X0, 6, '#B98451', 1));
  o.push(rect(X0 + 2, TOP + 6, X1 - X0 - 4, 22, '#2F5D45', 1));
  o.push(box(X1 - 30, TOP + 7, 27, 20, '#244A37'));
  o.push(text(240, TOP + 21, 'HOT CHESTNUTS', 6.4, '#E8C870', ' letter-spacing="0.6"'));
  // the rent notice pinned to its side
  o.push(rect(176, TOP + 9, 24, 17, '#F7F2E4', 0.6));
  o.push(text(188, TOP + 16, 'PITCH', 4.6, '#2E241C'));
  o.push(text(188, TOP + 23, '£60 A DAY', 4.2, '#B23A2E'));
  o.push(circ(178, TOP + 10.4, 0.9, '#B23A2E', 0.3), circ(198, TOP + 10.4, 0.9, '#B23A2E', 0.3));
  // the handles and the wheel
  o.push(line(`M${X1},${TOP + 4} L${X1 + 18},${TOP - 2}`, '#5A3A26', 2.2));
  o.push(circ(232, TOP + 22, 12.5, '#3A2A1E', 1));
  o.push(circ(232, TOP + 22, 10, '#B98451', 0.6));
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI;
    o.push(line(`M${f2(232 - 9.4 * Math.cos(a))},${f2(TOP + 22 - 9.4 * Math.sin(a))} L${f2(232 + 9.4 * Math.cos(a))},${f2(TOP + 22 + 9.4 * Math.sin(a))}`, '#7A5232', 0.8));
  }
  o.push(circ(232, TOP + 22, 2.2, '#5A3A26', 0.5));
  o.push(rect(170, TOP + 28, 3, 6, '#5A3A26', 0.5));
  return o.join('');
}

/** A builder from across the road, come for chestnuts: hard hat, hi-vis vest, facing left, arm out. */
export function builder() {
  const o = [];
  // legs and boots
  o.push(fill('M-9,0 L-7,-38 L1,-38 L-1,0 Z', '#3E4A5E', 0.8));
  o.push(fill('M1,0 L1,-38 L9,-38 L9,0 Z', '#33405A', 0.8));
  o.push(fill('M-12,0 L-12,-4 L-1,-4 L-1,0 Z', '#5A3A26', 0.6));
  o.push(fill('M1,0 L1,-4 L11,-4 L11,0 Z', '#5A3A26', 0.6));
  // the body in a grey jumper under an orange vest with its silver stripe
  o.push(fill('M-11,-36 L-10,-68 C-8,-72 8,-72 10,-68 L11,-36 Z', '#6E7880', 0.9));
  o.push(fill('M-10,-38 L-9,-66 L9,-66 L10,-38 Z', HIVIS, 0.8));
  o.push(flat('M2,-66 L9,-66 L10,-38 L2,-38 Z', '#D0621E'));
  o.push(box(-9.6, -52, 19.4, 3, '#E8ECEE'));
  // the far arm hangs; the near arm is drawn live, reaching
  o.push(fill('M7,-66 L11,-64 L13,-44 L9,-44 Z', '#6E7880', 0.7));
  // the head and the hard hat
  o.push(circ(-1, -78, 7.6, '#D4A07A', 0.8));
  o.push(flat('M-1,-85.6 C3,-85 6.6,-82 6.6,-78 L2,-78 Z', '#B9845E'));
  o.push(fill('M-10,-80 C-10,-90 8,-90 8,-80 Z', HAT, 0.8));
  o.push(fill('M-13,-80 L9,-80 L9,-78 L-13,-78 Z', '#D9A81E', 0.6));
  return o.join('');
}

export const ART = [
  { name: 'biz7-store-far', svg: storeFar, view: { x: 0, y: 214, w: 400, h: 300 }, box: { x: 0, y: 214, w: 400, h: 300 } },
  { name: 'biz7-store-door', svg: storeDoor, view: { x: 10, y: 342, w: 46, h: 108 }, box: { x: 10, y: 342, w: 46, h: 108 } },
  { name: 'biz7-store-counter', svg: storeCounter, view: { x: 182, y: 446, w: 218, h: 56 }, box: { x: 182, y: 446, w: 218, h: 56 } },
  { name: 'biz7-lamp', svg: lamp, view: { x: -16, y: -1, w: 32, h: 64 }, box: { x: -16, y: -1, w: 32, h: 64 } },
  { name: 'biz7-bell', svg: bell, view: { x: -5, y: -0.5, w: 10, h: 12.5 }, box: { x: -5, y: -0.5, w: 10, h: 12.5 } },
  { name: 'biz7-till', svg: till, view: { x: -15, y: -22, w: 33, h: 41 }, box: { x: -15, y: -22, w: 33, h: 41 } },
  { name: 'biz7-ledger-open', svg: ledgerOpen, view: { x: -20, y: -5.5, w: 40, h: 10.5 }, box: { x: -20, y: -5.5, w: 40, h: 10.5 } },
  { name: 'biz7-ledger-shut', svg: ledgerShut, view: { x: -18, y: -5, w: 36, h: 10 }, box: { x: -18, y: -5, w: 36, h: 10 } },
  { name: 'biz7-abacus', svg: abacus, view: { x: -25, y: -29, w: 50, h: 56 }, box: { x: -25, y: -29, w: 50, h: 56 } },
  { name: 'biz7-street-far', svg: streetFar, view: { x: 0, y: 214, w: 400, h: 300 }, box: { x: 400, y: 214, w: 400, h: 300 } },
  { name: 'biz7-cart', svg: cart, view: { x: 150, y: 380, w: 150, h: 122 }, box: { x: 550, y: 380, w: 150, h: 122 } },
  { name: 'biz7-builder', svg: builder, view: { x: -14, y: -91, w: 28, h: 92 }, box: { x: -14, y: -91, w: 28, h: 92 } },
];
