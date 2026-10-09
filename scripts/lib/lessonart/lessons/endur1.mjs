// personal-growth-endurance-1 — "Proceed" (LESSON_RULES AW5, AM13): the Endurance's deck at
// her London berth on 1 August 1914; her deck again at the whaling station at Grytviken,
// South Georgia, in November; and the pack ice of the Weddell Sea, where she is held fast.
//
// Every picture is in SCENE units with the band [214, 514], 400 × 300. Flat fills lit from
// the top left, a darker shaded side, one dark outline; real colours, no gradients, no glows.
//
// REFERENCES (npm run ref, scratchpad/ref/en1*):
//   en1ship-2  Hurley, "Endurance under full sail" (1915): a barquentine — the FOREMAST
//              square-rigged with three yards, the main and mizzen fore-and-aft; a tall thin
//              FUNNEL between fore and main; a black hull, a pale bulwark and deckhouse.
//   en1ship-1  Hurley, the ship beset at sunrise: the hull sunk to its rail in a floe of
//              rumpled snow, rigging furred with rime, the funnel aft of the foremast, the
//              pack running flat to a pale horizon under a lilac-pink sky.
//   en1gryt-2  Grytviken from the hill: a teal bay walled by dark, snow-streaked mountains,
//              tussock slopes, rust-red cylindrical oil tanks and red-roofed white sheds on
//              the flat, the white church with its spire behind the station.
//   en1gryt-3  Grytviken's jetties: long timber jetties on piles, a steam whale catcher at
//              the berth (black hull, tall funnel, a harpoon gun on her bow platform).
//   en1dock-1  London's riverside: brick warehouses with rows of arched windows, wall cranes
//              (jiggers) on the river face, a quay edge of stone with iron bollards.

const OUT = '#26211C';
const f2 = (n) => Number(n.toFixed(2));
const P = (pts) => 'M' + pts.map(([x, y]) => `${f2(x)},${f2(y)}`).join(' L') + ' Z';
const fill = (d, c, w = 1) => `<path d="${d}" fill="${c}" stroke="${OUT}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"/>`;
const flat = (d, c, o = 1) => `<path d="${d}" fill="${c}"${o < 1 ? ` opacity="${o}"` : ''}/>`;
const rect = (x, y, w, h, c, lw = 1, r = 0) => `<rect x="${f2(x)}" y="${f2(y)}" width="${f2(w)}" height="${f2(h)}" rx="${r}" fill="${c}" stroke="${OUT}" stroke-width="${lw}" stroke-linejoin="round"/>`;
const box = (x, y, w, h, c, o = 1) => `<rect x="${f2(x)}" y="${f2(y)}" width="${f2(w)}" height="${f2(h)}" fill="${c}"${o < 1 ? ` opacity="${o}"` : ''}/>`;
const line = (d, c, w) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const circ = (x, y, r, c, lw = 0.8) => `<circle cx="${f2(x)}" cy="${f2(y)}" r="${f2(r)}" fill="${c}" stroke="${OUT}" stroke-width="${lw}"/>`;
const ell = (x, y, rx, ry, c, lw = 0.8) => `<ellipse cx="${f2(x)}" cy="${f2(y)}" rx="${f2(rx)}" ry="${f2(ry)}" fill="${c}" stroke="${OUT}" stroke-width="${lw}"/>`;
const dot = (x, y, r, c, o = 1) => `<circle cx="${f2(x)}" cy="${f2(y)}" r="${f2(r)}" fill="${c}"${o < 1 ? ` opacity="${o}"` : ''}/>`;
const text = (x, y, s, size, c, w = 700, anchor = 'middle', ls = 0) => `<text x="${f2(x)}" y="${f2(y)}" font-family="Georgia, 'Times New Roman', serif" font-size="${size}" font-weight="${w}" fill="${c}" text-anchor="${anchor}" letter-spacing="${ls}">${s}</text>`;
let seed = 7;
const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };

/** A sky in flat bands, lightest at the horizon. */
function sky(x, y0, w, h, bands) {
  const out = [];
  const n = bands.length;
  for (let k = 0; k < n; k++) out.push(box(x, y0 + (h * k) / n, w, h / n + 0.4, bands[k]));
  return out.join('');
}
/** A flat cloud: a row of lobes on a flat foot, with a shaded underside. */
function cloud(x, y, s, c, cd) {
  const d = `M${x - 30 * s},${y} C${x - 30 * s},${y - 8 * s} ${x - 20 * s},${y - 12 * s} ${x - 12 * s},${y - 9 * s} C${x - 8 * s},${y - 18 * s} ${x + 6 * s},${y - 20 * s} ${x + 10 * s},${y - 11 * s} C${x + 18 * s},${y - 15 * s} ${x + 30 * s},${y - 9 * s} ${x + 30 * s},${y} Z`;
  return flat(d, c) + flat(`M${x - 30 * s},${y} L${x + 30 * s},${y} C${x + 22 * s},${y - 3 * s} ${x - 22 * s},${y - 3 * s} ${x - 30 * s},${y} Z`, cd);
}

// ── the Endurance's own fittings, used on both decks ──────────────────────────
const BULK = '#D8D0BE', BULK_D = '#B9AF98', BULK_L = '#ECE6D8';   // the bulwark's painted inside
const RAIL = '#8A5A33', RAIL_L = '#AE7A4A', RAIL_D = '#68431F';     // the varnished cap rail
const PLANK = '#C9AE82', PLANK_D = '#A88D62', PLANK_L = '#DCC49A', SEAM = '#5E4A33';
const MAST = '#A87442', MAST_D = '#7E5530', TOPMAST = '#3A3330';
const TAR = '#3A322B';

/**
 * A DECK of the Endurance seen from the side: the far bulwark (its cap rail at 440), its
 * stanchions and scuppers, and the holystoned pine deck people stand on (feet at 500).
 * `masts` are drawn rising out of the deck past the top of the band, with the shrouds
 * coming down to the rail; `from`/`to` leave the gangway opening.
 */
function deck(from, to, masts) {
  const o = [];
  // the shrouds behind everything, from the masthead (off the band) down to the rail
  for (const m of masts) {
    o.push(line(`M${m.x},214 L${m.x - 44},440 M${m.x},214 L${m.x - 26},440 M${m.x},214 L${m.x + 30},440 M${m.x},214 L${m.x + 48},440`, TAR, 0.7));
    // ratlines across the shrouds
    for (const y of [312, 336, 360, 384, 408, 430]) {
      const f = (y - 214) / 226;
      o.push(line(`M${m.x - 44 * f},${y} L${m.x - 26 * f},${y} M${m.x + 30 * f},${y} L${m.x + 48 * f},${y}`, TAR, 0.5));
    }
  }
  // the bulwark: its painted inside, planked, with stanchions and a varnished cap rail
  o.push(rect(from - 2, 440, to - from + 4, 46, BULK, 1));
  o.push(box(from, 474, to - from, 11, BULK_D));
  for (const y of [452, 463]) o.push(line(`M${from},${y} L${to},${y}`, BULK_D, 0.6));
  for (let x = from + 14; x < to - 4; x += 38) {
    o.push(rect(x, 442, 6, 43, BULK_L, 0.6));
    o.push(box(x + 4, 443, 1.8, 41, BULK_D));
    o.push(rect(x - 3, 481, 12, 4, '#6A6258', 0.4));   // the scupper under it
  }
  o.push(rect(from - 3, 436, to - from + 6, 6, RAIL, 1));
  o.push(box(from - 2, 436.6, to - from + 4, 1.6, RAIL_L));
  o.push(box(from - 2, 440, to - from + 4, 1.4, RAIL_D));
  // the masts, through the rail and the deck, with their wedges (the partners)
  for (const m of masts) {
    o.push(rect(m.x - 5, 206, 10, 284, MAST, 1));
    o.push(box(m.x + 1, 207, 3.4, 282, MAST_D));
    o.push(rect(m.x - 10, 482, 20, 6, MAST_D, 0.8));
    for (const y of [430, 446]) o.push(rect(m.x - 7, y, 14, 3, '#5A4A3E', 0.5));   // the iron mast bands
    if (m.yard) {
      o.push(fill(`M${m.x - 62},${m.yard} L${m.x + 62},${m.yard} L${m.x + 60},${m.yard + 4} L${m.x - 60},${m.yard + 4} Z`, MAST, 0.8));
      o.push(fill(`M${m.x - 58},${m.yard + 4} C${m.x - 30},${m.yard + 10} ${m.x + 30},${m.yard + 10} ${m.x + 58},${m.yard + 4} L${m.x + 56},${m.yard + 9} C${m.x + 30},${m.yard + 15} ${m.x - 30},${m.yard + 15} ${m.x - 56},${m.yard + 9} Z`, '#E9E2CF', 0.7));
    }
  }
  // the deck: planks running along her, their caulked seams, the waterway at the bulwark's foot
  o.push(rect(from - 2, 484, to - from + 4, 32, PLANK, 1));
  o.push(box(from, 484.5, to - from, 3.2, PLANK_D));
  for (const [y, step, off] of [[492, 52, 10], [500, 64, 30], [508, 76, 4]]) {
    o.push(line(`M${from},${y} L${to},${y}`, SEAM, 0.5));
    for (let x = from + off; x < to; x += step) o.push(line(`M${x},${y - 8} L${x},${y}`, SEAM, 0.45));
    for (let x = from + off + 14; x < to - 20; x += step * 1.6) o.push(box(x, y - 6.4, step * 0.4, 1.4, PLANK_L));
  }
  return o.join('');
}

// ══════════════════════════════════════════════════════════════════════════════
// PLACE 0 — LONDON, 1 AUGUST 1914: THE ENDURANCE AT HER BERTH IN THE THAMES
// ══════════════════════════════════════════════════════════════════════════════

/**
 * FAR: a hazy summer morning over the river — the Thames, grey-green, the far bank's brick
 * warehouses with their rows of arched windows and wall cranes, St Paul's dome over the
 * roofs, a chimney's smoke, and a Thames sailing barge under her red-ochre sails. Drawn
 * 40 units wider than the stage at its left, so it can slide as the ship eases away.
 */
export function londonFar() {
  const o = [];
  o.push(sky(-40, 214, 480, 150, ['#9FC0DA', '#AFCBE0', '#C2D7E6', '#D5E2EA', '#E3E8E8']));
  o.push(cloud(40, 262, 1.1, '#F6F8FA', '#DCE4EA'));
  o.push(cloud(250, 244, 0.8, '#F6F8FA', '#DCE4EA'));
  o.push(cloud(360, 286, 0.6, '#F6F8FA', '#DCE4EA'));
  // the far bank: a hazed skyline, St Paul's dome and its lantern, two church spires
  o.push(flat('M-40,372 L-40,350 L10,350 L10,342 L40,342 L40,352 L84,352 L84,338 L120,338 L120,350 L150,350 L150,362 L440,362 L440,372 Z', '#B8BFC3'));
  o.push(fill('M150,346 C150,324 160,312 176,310 C192,312 202,324 202,346 Z', '#A9B0B4', 0.6));
  o.push(flat('M176,310 C192,312 202,324 202,346 L184,346 C186,330 182,316 176,310 Z', '#979EA3'));
  o.push(rect(146, 344, 60, 6, '#A2A9AD', 0.5));
  o.push(rect(172, 298, 8, 12, '#A9B0B4', 0.5));
  o.push(fill('M172,298 L176,288 L180,298 Z', '#A9B0B4', 0.4));
  o.push(rect(140, 350, 72, 14, '#ADB4B8', 0.5));
  for (const x of [262, 318]) {
    o.push(rect(x, 330, 6, 32, '#B0B6BA', 0.4));
    o.push(fill(`M${x},330 L${x + 3},314 L${x + 6},330 Z`, '#B0B6BA', 0.4));
  }
  // a low hazed row of roofs and wharves along the whole far bank
  o.push(flat('M-40,398 L-40,366 L20,366 L20,360 L70,360 L70,368 L130,368 L130,362 L190,362 L190,358 L240,358 L240,366 L300,366 L300,360 L360,360 L360,368 L440,368 L440,398 Z', '#B4AEA6'));
  for (let x = -36; x < 440; x += 14) o.push(box(x, 374, 6, 4, '#9E978E'));
  // the warehouses on the far bank, brick, with their arched windows; wall cranes
  const WH = [[-40, 46, 360], [8, 58, 352], [68, 40, 366], [214, 64, 356], [280, 52, 362], [334, 70, 350], [402, 40, 360]];
  for (const [x, w, top] of WH) {
    o.push(rect(x, top, w, 400 - top, '#A9785F', 0.7));
    o.push(box(x + w * 0.62, top + 0.5, w * 0.38 - 0.5, 400 - top - 1, '#93664F'));
    o.push(fill(`M${x - 1},${top} L${x + w / 2},${top - 8} L${x + w + 1},${top} Z`, '#7E5848', 0.6));
    for (let yy = top + 6; yy < 394; yy += 9) for (let xx = x + 5; xx < x + w - 4; xx += 8) o.push(rect(xx, yy, 3.6, 5, '#5E4438', 0, 1.6));
  }
  for (const [x, y] of [[40, 352], [250, 358], [370, 352]]) {
    o.push(line(`M${x},${y} L${x + 12},${y - 6} L${x + 12},${y + 14}`, '#4E4038', 1.2));
  }
  // a chimney and its smoke
  o.push(rect(118, 318, 7, 34, '#8E6A56', 0.5));
  for (const [x, y, r] of [[124, 312, 5], [130, 304, 6.5], [138, 298, 7.5], [148, 294, 8]]) o.push(dot(x, y, r, '#D9DDE0', 0.85));
  // the river wall and the Thames
  o.push(box(-40, 396, 480, 6, '#8C877C'));
  o.push(box(-40, 402, 480, 60, '#7F918A'));
  o.push(box(-40, 402, 480, 3, '#9AACA3'));
  for (const [x, y, w] of [[-20, 412, 40], [60, 420, 30], [140, 414, 36], [230, 424, 28], [300, 410, 40], [380, 418, 34], [20, 432, 30], [190, 434, 36]]) o.push(box(x, y, w, 1.3, '#A9BAB2'));
  // a Thames sailing barge, her red-ochre spritsail and her tan hull
  o.push(fill('M226,426 L292,426 L286,436 L232,436 Z', '#2E2925', 0.8));
  o.push(rect(258, 344, 3, 82, '#4A3C30', 0.6));
  o.push(fill('M261,350 L296,362 L294,420 L262,420 Z', '#A4543A', 0.8));
  o.push(flat('M280,356 L296,362 L294,420 L280,420 Z', '#86412C'));
  o.push(line('M261,352 L296,416', '#5E2C1E', 0.7));
  o.push(fill('M257,368 L236,420 L257,420 Z', '#B66444', 0.7));
  o.push(fill('M261,346 L280,344 L261,358 Z', '#A4543A', 0.5));
  return o.join('');
}

/**
 * THE QUAY at the right: the brick warehouse she is moored under, its loading doors one
 * above another and the wall crane's jib; the stone quay edge, an iron bollard, and the
 * gangplank sloping down from her deck's end (x 352) to the quay below the stage.
 */
export function londonQuay() {
  const o = [];
  o.push(rect(342, 230, 70, 214, '#9E6A4F', 1));
  o.push(box(380, 231, 32, 212, '#875A42'));
  for (let y = 240; y < 440; y += 6) o.push(line(`M343,${y} L411,${y}`, '#8A5C45', 0.35));
  for (const y of [246, 296, 346]) {
    o.push(rect(356, y, 22, 32, '#4E3A30', 0.7));
    o.push(box(357, y + 1, 10, 30, '#6E4E3C'));
    o.push(line(`M356,${y + 32} L378,${y + 32}`, '#C8B9A6', 1.4));
  }
  // the crane's jib and its hook
  o.push(line('M342,262 L314,250 L342,236', '#3E3530', 2));
  o.push(line('M316,250 L316,300', '#3E3530', 0.7));
  o.push(fill('M313,300 L319,300 L318,306 C316,309 313,307 313,304 Z', '#3E3530', 0.4));
  // the quay wall and its stone edge, an iron bollard on it
  o.push(rect(338, 440, 74, 34, '#9A958A', 1));
  for (const y of [448, 458, 466]) o.push(line(`M338,${y} L412,${y}`, '#7E796E', 0.5));
  for (const [x, y] of [[352, 440], [372, 448], [392, 440], [362, 458], [384, 458]]) o.push(line(`M${x},${y} L${x},${y + 8}`, '#7E796E', 0.5));
  o.push(rect(336, 436, 78, 5, '#B8B3A6', 0.8));
  o.push(rect(390, 424, 9, 12, '#2E2B28', 0.7));
  o.push(rect(388, 422, 13, 4, '#3E3A36', 0.6));
  // the river in the gap between her side and the quay wall, the wall's foot green with weed
  o.push(box(338, 474, 78, 44, '#5E6E66'));
  o.push(box(338, 474, 78, 4, '#4E6A52'));
  for (const [x, y, w] of [[344, 486, 22], [376, 496, 26], [352, 506, 30]]) o.push(box(x, y, w, 1.2, '#8A9E94'));
  // the gangplank, from her deck's end down to the quay below
  o.push(fill('M348,494 L414,526 L414,534 L346,500 Z', '#A88458', 1));
  for (let k = 0; k < 6; k++) {
    const x = 356 + k * 10, y = 498 + k * 4.85;
    o.push(line(`M${x},${y} L${x - 1.6},${y + 5}`, '#6E5434', 1.2));
  }
  o.push(line('M346,486 L414,518', '#4A3C2C', 0.8));
  return o.join('');
}

/** The DECK at London: the foremast (x 132) with its yard, the main (x 300), the gangway at the right. */
export function londonDeck() {
  const o = [];
  o.push(deck(-4, 352, [{ x: 132, yard: 250 }, { x: 300, yard: 0 }]));
  // the ship's bell on its belfry by the foremast, a coil of rope, the stack of stores by the gangway
  o.push(rect(22, 456, 4, 28, '#5A4A3E', 0.5));
  o.push(rect(14, 452, 20, 4, '#6A5446', 0.6));
  o.push(fill('M18,456 C18,462 16,468 14,470 L34,470 C32,468 30,462 30,456 Z', '#C79A3C', 0.8));
  o.push(flat('M26,456 C28,462 30,467 34,470 L26,470 Z', '#A07A26'));
  for (const [x, y, w, h, c] of [[316, 456, 30, 28, '#B08A58'], [322, 432, 22, 24, '#9E7A4A']]) {
    o.push(rect(x, y, w, h, c, 0.8));
    o.push(box(x + w * 0.66, y + 0.5, w * 0.34 - 0.5, h - 1, '#86643C'));
    o.push(line(`M${x},${y + h / 2} L${x + w},${y + h / 2}`, '#6E5434', 0.5));
  }
  o.push(ell(8, 494, 12, 3.6, '#B79A6C', 0.7));
  o.push(ell(8, 493, 7, 2.2, '#94784C', 0.5));
  // the bitt by the gangway the mooring line is made fast to
  o.push(rect(342, 470, 7, 18, '#3E3A36', 0.7));
  o.push(rect(340, 476, 11, 3, '#2E2B28', 0.5));
  return o.join('');
}

/**
 * THE MAP CASE: a tall sledging case stood on end (its own frame: the deck at y 0, 48 wide),
 * with a map of Antarctica pinned across its face — the continent white on a blue sea, the
 * Weddell Sea a bite out of the near coast, the Ross Sea one out of the far, a red line
 * dotted from one to the other over the Pole.
 */
export function mapCase() {
  const o = [];
  o.push(rect(-24, -60, 48, 60, '#A98252', 1));
  o.push(box(8, -59.5, 15.5, 59, '#8E6A3E'));
  for (const y of [-40, -20]) o.push(line(`M-24,${y} L24,${y}`, '#6E5230', 0.5));
  o.push(rect(-25, -62, 50, 4, '#8E6A3E', 0.7));
  // the map, pinned at its corners
  o.push(rect(-20, -56, 40, 34, '#F1EAD6', 0.8));
  o.push(rect(-18, -54, 36, 30, '#8DB4D1', 0.5));
  o.push(fill('M-12,-50 C-6,-53 6,-53 12,-49 C16,-45 15,-34 11,-30 C6,-27 -6,-27 -11,-30 C-15,-35 -16,-45 -12,-50 Z', '#F8F8F4', 0.6));
  o.push(flat('M-11,-31 C-8,-35 -4,-35 -2,-31 Z', '#8DB4D1'));          // the Weddell Sea
  o.push(flat('M3,-49.5 C5,-45 9,-45 11,-48.6 Z', '#8DB4D1'));           // the Ross Sea
  o.push(flat('M-15,-45 L-20,-42 L-16,-40 Z', '#F8F8F4'));               // the Antarctic Peninsula
  o.push(line('M-6,-33 L-2,-38 L1,-42 L5,-46', '#B23A2E', 1));
  o.push(circ(0, -40, 0.9, '#B23A2E', 0));
  for (const [x, y] of [[-19, -55], [19, -55], [-19, -23], [19, -23]]) o.push(circ(x, y, 1, '#C9A23A', 0.3));
  return o.join('');
}

/** The mail sack, bulging with letters (its own frame: standing on y 0). */
export function mailSack() {
  const o = [];
  o.push(fill('M-13,0 C-16,-8 -15,-18 -9,-23 L-6,-27 L6,-27 L9,-23 C15,-18 16,-8 13,0 Z', '#C2AE84', 1));
  o.push(flat('M3,-23 L9,-23 C15,-18 16,-8 13,0 L5,0 C8,-8 8,-17 3,-23 Z', '#A6926A'));
  o.push(text(0, -8, 'G.P.O.', 5, '#7A2E28', 700));
  // letters spilling out of its neck
  for (const [x, y, r, c] of [[-6, -29, -18, '#F4F0E4'], [-1, -31, 6, '#EDE5D2'], [4, -30, 22, '#F4F0E4'], [1, -27, -4, '#E8DEC6']]) {
    o.push(`<g transform="translate(${x},${y}) rotate(${r})">${rect(-5, -3.4, 10, 6.8, c, 0.5)}${line('M-5,-3.4 L0,0 L5,-3.4', '#B9AE96', 0.4)}</g>`);
  }
  o.push(line('M-7,-25 L7,-25', '#6E4A2A', 1.4));
  return o.join('');
}

/**
 * THE LONG CASE: a sledging case laid flat on the deck, 156 wide and hip high (its own
 * frame: the deck at y 0, its lid at y −30), stencilled with the expedition's initials.
 */
export function longCase() {
  const o = [];
  o.push(rect(-78, -28, 156, 28, '#B08A58', 1));
  o.push(box(34, -27.5, 43.5, 27, '#94703F'));
  o.push(line('M-78,-14 L78,-14', '#7E5E36', 0.5));
  for (const x of [-72, 68]) o.push(rect(x, -28, 4, 28, '#6E5A48', 0.5));
  o.push(rect(-79, -31, 158, 4, '#C29C68', 0.9));
  o.push(text(-10, -9, 'I.T.A.E.', 7, '#3E3128', 700, 'middle', 0.6));
  o.push(rect(-79, -2, 158, 2.4, '#6E5A48', 0.4));
  return o.join('');
}

/** A crate of stores (its own frame: base at y 0, 26 wide, 20 tall). */
export function crate() {
  const o = [];
  o.push(rect(-13, -20, 26, 20, '#B48C58', 1));
  o.push(box(5, -19.5, 7.5, 19, '#957040'));
  o.push(line('M-13,-20 L13,0 M-13,0 L13,-20', '#8A6A3E', 0.7));
  o.push(rect(-13, -20, 26, 20, 'none', 1));
  return o.join('');
}

/** The telegraph boy's tray (its own frame: its floor at y 0, 156 wide). */
export function tray() {
  const o = [];
  o.push(rect(-76, -5, 152, 5, '#7A5232', 0.9));
  o.push(box(38, -4.5, 37.5, 4, '#62401F'));
  o.push(rect(-78, -7, 4, 7, '#8E6238', 0.6));
  o.push(rect(74, -7, 4, 7, '#8E6238', 0.6));
  return o.join('');
}

/** A telegram envelope standing in the tray, sealed (its own frame: its foot at y 0, 48 × 26). */
export function envelope() {
  const o = [];
  o.push(rect(-24, -26, 48, 26, '#E9D6A6', 0.9));
  o.push(flat('M11,-25.5 L23.5,-25.5 L23.5,-0.5 L11,-0.5 Z', '#D6C08C'));
  o.push(line('M-24,-26 L0,-14 L24,-26', '#B89E68', 0.7));
  o.push(text(0, -19.6, 'POST OFFICE TELEGRAPHS', 2.6, '#7A2E28', 700));
  return o.join('');
}

/** The telegram form inside, unfolded (its own frame: centred, 52 × 36). */
export function form() {
  const o = [];
  o.push(rect(-26, -18, 52, 36, '#F4EAD0', 0.8));
  o.push(box(-25.5, -17.5, 51, 9, '#E2CFA4'));
  o.push(text(0, -11, 'ADMIRALTY', 5, '#7A2E28', 700, 'middle', 0.3));
  o.push(line('M-18,16 L18,16', '#C9B48A', 0.5));
  return o.join('');
}

// ══════════════════════════════════════════════════════════════════════════════
// PLACE 1 — GRYTVIKEN, SOUTH GEORGIA, NOVEMBER 1914
// ══════════════════════════════════════════════════════════════════════════════

/**
 * FAR + MIDDLE: the bay walled by dark mountains streaked with snow, the tussock slopes,
 * and the whaling station on its flat — the rust-red oil tanks, the red-roofed boiling
 * sheds and their chimney, the white church with its spire, the jetties on their piles,
 * a whale catcher at her berth. Drawn 70 units wider at the left, so it can slide as the
 * ship slips out of the bay.
 */
export function grytviken() {
  seed = 23;
  const o = [];
  o.push(sky(-70, 214, 480, 120, ['#8FB2CF', '#A2BFD7', '#B8CDDE', '#CCD9E3']));
  o.push(cloud(-20, 250, 1.2, '#F4F6F8', '#D3DCE4'));
  o.push(cloud(170, 236, 1, '#F4F6F8', '#D3DCE4'));
  o.push(cloud(330, 258, 0.9, '#F4F6F8', '#D3DCE4'));
  // the far range, blue-grey, snow on its peaks
  o.push(fill('M-70,330 L-50,300 L-20,288 L4,262 L30,280 L58,254 L92,286 L130,270 L170,300 L214,276 L250,292 L290,262 L328,284 L366,258 L410,280 L410,376 L-70,376 Z', '#6E7684', 0.8));
  for (const [x, y] of [[4, 262], [58, 254], [130, 270], [214, 276], [290, 262], [366, 258]]) {
    o.push(flat(`M${x - 12},${y + 12} L${x},${y} L${x + 14},${y + 13} L${x + 6},${y + 10} L${x + 1},${y + 15} L${x - 5},${y + 9} Z`, '#F2F4F6'));
  }
  // the near mountains, dark rock with gullies of snow, falling to tussock slopes
  o.push(fill('M-70,356 C-50,330 -24,300 10,292 C40,286 62,306 86,324 C104,336 118,350 140,362 L-70,372 Z', '#5D5651', 1));
  o.push(fill('M190,364 C214,340 240,318 270,304 C300,292 330,300 352,288 C372,278 392,286 412,296 L412,372 L190,372 Z', '#5D5651', 1));
  o.push(flat('M300,296 C330,300 352,288 372,280 C380,300 380,330 376,366 L320,366 C322,336 314,312 300,296 Z', '#4A4440'));
  for (const [x, y, h] of [[2, 300, 30], [32, 294, 40], [252, 318, 26], [334, 298, 34], [374, 284, 30], [-30, 322, 22]]) {
    o.push(flat(`M${x - 3},${y} C${x + 2},${y + h * 0.3} ${x - 1},${y + h * 0.6} ${x + 2},${y + h} L${x + 4},${y + h * 0.9} C${x + 3},${y + h * 0.6} ${x + 6},${y + h * 0.3} ${x + 3},${y} Z`, '#EEF1F4'));
    o.push(flat(`M${x - 6},${y + 2} L${x},${y - 4} L${x + 7},${y + 2} L${x + 1},${y + 6} Z`, '#EEF1F4'));
  }
  o.push(flat('M-70,368 C-30,360 40,356 100,360 C150,362 200,360 260,356 C320,352 370,356 412,360 L412,392 L-70,392 Z', '#8E8C5A'));
  o.push(flat('M-70,380 C0,376 100,374 200,378 C300,380 360,376 412,378 L412,392 L-70,392 Z', '#7A7A4C'));
  for (let k = 0; k < 40; k++) o.push(dot(-70 + rnd() * 480, 364 + rnd() * 24, 1 + rnd() * 1.2, '#9E9A62', 0.8));
  // the bay
  o.push(box(-70, 390, 480, 126, '#4F8C95'));
  o.push(box(-70, 452, 480, 64, '#457F88'));
  o.push(box(-70, 390, 480, 2.4, '#7DB0B6'));
  for (const [x, y, w] of [[-40, 400, 40], [40, 406, 30], [120, 398, 44], [220, 410, 36], [300, 402, 40], [-10, 418, 34], [170, 424, 30], [270, 428, 42], [360, 416, 28]]) o.push(box(x, y, w, 1.3, '#83B8BC'));
  // the station on its flat at the head of the bay: oil tanks, sheds, the chimney, the church
  for (const [x, w, h] of [[-48, 22, 22], [-22, 26, 26], [8, 22, 20], [36, 24, 24]]) {
    o.push(rect(x, 384 - h, w, h, '#A3552F', 0.8));
    o.push(box(x + w * 0.6, 384 - h + 0.5, w * 0.4 - 0.5, h - 1, '#86442A'));
    o.push(ell(x + w / 2, 384 - h, w / 2, 2.2, '#B86A40', 0.6));
  }
  for (const [x, w, h] of [[64, 44, 18], [112, 34, 14], [150, 40, 16]]) {
    o.push(rect(x, 386 - h, w, h, '#EDE8DC', 0.7));
    o.push(box(x + w * 0.66, 386 - h + 0.5, w * 0.34 - 0.5, h - 1, '#D3CDBE'));
    o.push(fill(`M${x - 2},${386 - h} L${x + w * 0.5},${386 - h - 8} L${x + w + 2},${386 - h} Z`, '#9B3B2E', 0.7));
    for (let xx = x + 5; xx < x + w - 4; xx += 9) o.push(rect(xx, 386 - h + 5, 4, 5, '#4A4440', 0, 0.6));
  }
  o.push(rect(98, 334, 6, 34, '#5A4D46', 0.6));
  for (const [x, y, r] of [[102, 328, 4], [108, 320, 5.6], [116, 314, 6.6], [126, 310, 7.4]]) o.push(dot(x, y, r, '#E4E6E8', 0.85));
  // the white Norwegian church, its spire, set back on the slope
  o.push(rect(196, 352, 18, 14, '#F4F2EC', 0.7));
  o.push(fill('M194,352 L205,344 L216,352 Z', '#5A4D46', 0.6));
  o.push(rect(186, 344, 9, 22, '#F4F2EC', 0.6));
  o.push(fill('M185,344 L190.5,326 L196,344 Z', '#5A4D46', 0.6));
  // the jetty on its piles, and the whale catcher at her berth
  o.push(rect(168, 384, 120, 4, '#7A5E44', 0.7));
  for (let x = 172; x < 288; x += 12) o.push(rect(x, 388, 2.4, 10, '#5A4432', 0.3));
  o.push(fill('M226,380 L232,372 L296,372 L304,368 L306,374 C300,384 290,388 280,390 L240,390 C232,388 228,386 226,380 Z', '#2A2B2E', 0.9));
  o.push(box(232, 373, 64, 2, '#8E2F2B'));
  o.push(rect(262, 344, 7, 28, '#2A2B2E', 0.6));
  o.push(box(262, 348, 7, 4, '#B8443A'));
  o.push(rect(250, 362, 20, 10, '#E6E1D4', 0.6));
  o.push(rect(282, 336, 2, 36, '#3A332E', 0.4));
  o.push(line('M283,336 L232,372 M283,336 L304,368', '#3A332E', 0.4));
  o.push(rect(226, 368, 6, 4, '#3A332E', 0.4));
  o.push(line('M224,368 L216,364', '#3A332E', 1.4));           // the harpoon gun on her bow
  // the jetty she lies against, below her gangway at the right, and the gangplank down to it
  o.push(rect(352, 508, 70, 8, '#8A6A4C', 1));
  o.push(box(354, 512, 66, 3.4, '#6E5238'));
  o.push(rect(392, 494, 7, 14, '#2E2B28', 0.6));
  o.push(fill('M348,494 L414,512 L414,519 L346,500 Z', '#A88458', 1));
  for (let k = 0; k < 6; k++) {
    const x = 356 + k * 10, y = 497.6 + k * 2.75;
    o.push(line(`M${x},${y} L${x - 1.2},${y + 5}`, '#6E5434', 1.2));
  }
  return o.join('');
}

/**
 * The DECK at Grytviken: the foremast (x 96) and main (x 262); the gangway at the right end
 * (the jetty and the plank are in the bay's picture, so they leave with it); and the dogs'
 * KENNELS lashed in a row along the bulwark — small wooden houses with round doors and tarred roofs.
 */
export const KENNELS = [176, 212, 248, 284, 320];
export function grytDeck() {
  const o = [];
  o.push(deck(-4, 352, [{ x: 96, yard: 262 }, { x: 262, yard: 0 }]));
  o.push(rect(348, 430, 8, 58, RAIL, 0.9));
  // the kennels along the rail
  for (const x of KENNELS) {
    o.push(rect(x - 16, 462, 32, 22, '#A07A4A', 0.9));
    o.push(box(x + 6, 462.5, 9.5, 21, '#86643A'));
    o.push(fill(`M${x - 19},463 L${x},452 L${x + 19},463 Z`, '#4A3E36', 0.8));
    o.push(fill(`M${x - 7},484 L${x - 7},476 C${x - 7},470 ${x + 7},470 ${x + 7},476 L${x + 7},484 Z`, '#2A2420', 0.6));
    o.push(line(`M${x - 18},468 L${x + 18},468`, '#6E5434', 0.4));
  }
  o.push(line(`M${KENNELS[0] - 18},474 L${KENNELS[4] + 18},474`, '#B9A47C', 0.9));   // the lashing
  return o.join('');
}

/** A husky's head and shoulders looking out of a kennel door (its own frame: the door's foot at 0). */
export function huskyHead() {
  const o = [];
  o.push(fill('M-6,0 C-7,-5 -6,-9 -4,-11 L-5,-17 L-1.6,-13 L1.6,-13 L5,-17 L4,-11 C6,-9 7,-5 6,0 Z', '#7C7E80', 0.7));
  o.push(fill('M-3.4,-6 C-3.4,-9.4 3.4,-9.4 3.4,-6 C3.4,-3 1.6,-1.6 0,-1.6 C-1.6,-1.6 -3.4,-3 -3.4,-6 Z', '#F2F0EA', 0.4));
  o.push(fill('M-1.6,-11.6 C-1,-12.4 1,-12.4 1.6,-11.6 L0.8,-8 L-0.8,-8 Z', '#F2F0EA', 0));
  o.push(dot(-2, -9.4, 0.8, '#2A2622'));
  o.push(dot(2, -9.4, 0.8, '#2A2622'));
  o.push(ell(0, -5.6, 1.3, 0.9, '#2A2622', 0));
  return o.join('');
}

/** A husky pup, curled in a man's arms (its own frame: centred, facing right). */
export function pup() {
  const o = [];
  o.push(fill('M-9,2 C-10,-3 -6,-6 0,-6 C5,-6 8,-4 9,-1 C10,2 6,5 0,5 C-5,5 -9,5 -9,2 Z', '#8A8A8A', 0.7));
  o.push(fill('M-4,3 C-2,1 4,1 6,3 C4,5 -2,5 -4,3 Z', '#F0EEE8', 0.3));
  o.push(fill('M5,-5 C6,-9 12,-9 13,-5 C13,-2 10,0 7,-1 C5,-2 5,-3 5,-5 Z', '#8A8A8A', 0.7));
  o.push(fill('M6,-8 L6.6,-12 L8.6,-9 Z', '#8A8A8A', 0.5));
  o.push(fill('M10,-8.6 L11.6,-12 L12.4,-8 Z', '#8A8A8A', 0.5));
  o.push(fill('M8,-5 C8,-7 12,-7 12.6,-5 C12.6,-3 11,-2 9.6,-2.4 C8.6,-2.8 8,-3.6 8,-5 Z', '#F0EEE8', 0.3));
  o.push(dot(9, -6, 0.6, '#2A2622'));
  o.push(dot(11.6, -6, 0.6, '#2A2622'));
  o.push(dot(12.6, -4.2, 0.7, '#2A2622'));
  o.push(fill('M-9,0 C-13,-2 -14,-6 -12,-8 C-11,-5 -9,-4 -8,-3 Z', '#8A8A8A', 0.5));
  return o.join('');
}

/** A cask of the stores (its own frame: base at y 0, 26 wide, 30 tall — hip high). */
export function barrel() {
  const o = [];
  o.push(fill('M-12,0 C-14,-10 -14,-20 -12,-30 L12,-30 C14,-20 14,-10 12,0 Z', '#9C6B3A', 1));
  o.push(flat('M5,-30 L12,-30 C14,-20 14,-10 12,0 L5,0 C6,-10 6,-20 5,-30 Z', '#7E5430'));
  for (const y of [-26, -18, -12, -4]) o.push(line(`M${-13 + (y === -18 || y === -12 ? -0.8 : 0)},${y} L${13 + (y === -18 || y === -12 ? 0.8 : 0)},${y}`, '#4A4440', 1.4));
  o.push(ell(0, -30, 12, 2.4, '#B07E4A', 0.8));
  for (const x of [-6, 0, 6]) o.push(line(`M${x},-28 L${x},-2`, '#6E4A28', 0.4));
  return o.join('');
}

// ══════════════════════════════════════════════════════════════════════════════
// PLACE 2 — THE WEDDELL SEA, JANUARY–FEBRUARY 1915: THE SHIP HELD FAST IN THE PACK
// ══════════════════════════════════════════════════════════════════════════════

/**
 * FAR: a low sun on a pale horizon, a lilac sky, and the pack running flat to it — white
 * floes, their blue shadows, ridges of broken ice where floes have been pushed together,
 * a dark lead of open water far off that the ship can never reach.
 */
export function iceFar() {
  seed = 41;
  const o = [];
  o.push(sky(0, 214, 400, 168, ['#8EA6C8', '#A3B3D1', '#B9C0D8', '#CFC8DA', '#E2D3D8', '#EFDCCF', '#F4E3C8']));
  o.push(flat('M0,300 C60,296 120,300 180,298 C240,296 300,300 400,296 L400,302 C300,306 200,304 0,306 Z', '#C8C6DC', 0.7));
  o.push(flat('M40,330 C100,326 160,330 220,328 L220,332 C160,334 100,332 40,334 Z', '#DCCFD8', 0.7));
  o.push(circ(86, 372, 13, '#F8E6B8', 0.5));
  // the pack to the horizon, in bands of light and shadow
  o.push(box(0, 380, 400, 90, '#E9EEF3'));
  o.push(box(0, 380, 400, 2.4, '#C5D2E0'));
  for (const [x, w] of [[0, 120], [150, 90], [280, 120]]) o.push(box(x, 383, w, 3, '#D3DEE9'));
  o.push(flat('M112,389 C130,387 150,388 176,389 C150,390.6 130,390.4 112,389 Z', '#3E5468'));   // a far lead of open water
  // pressure ridges: broken blocks heaped along a line, lit on their left faces
  for (const [x0, y0, n] of [[10, 396, 7], [180, 402, 9], [300, 392, 6]]) {
    for (let k = 0; k < n; k++) {
      const x = x0 + k * 11 + rnd() * 4, h = 5 + rnd() * 6, w = 8 + rnd() * 5;
      o.push(fill(`M${x},${y0} L${x + w * 0.3},${y0 - h} L${x + w * 0.8},${y0 - h + 1.5} L${x + w},${y0} Z`, '#F7F9FB', 0.5));
      o.push(flat(`M${x + w * 0.55},${y0 - h + 0.8} L${x + w * 0.8},${y0 - h + 1.5} L${x + w},${y0} L${x + w * 0.6},${y0} Z`, '#B9CADA'));
    }
  }
  for (let k = 0; k < 18; k++) {
    const x = rnd() * 400, y = 408 + rnd() * 56, w = 20 + rnd() * 40;
    o.push(flat(`M${x},${y} C${x + w * 0.3},${y - 1.6} ${x + w * 0.7},${y - 1.6} ${x + w},${y} Z`, '#C9D6E3'));
  }
  return o.join('');
}

/**
 * THE ENDURANCE HELD FAST (its box at the stage's right): her black hull sunk to its rail
 * in snow-drifted ice, the bow at x 196; the white deckhouse, the funnel aft of the
 * foremast, the foremast with its three yards, the main and mizzen, the rigging rimed; her
 * name on the bow; portholes along the hull; a stovepipe on the deckhouse.
 */
export const PORTHOLES = [[262, 428], [292, 430], [322, 431], [352, 431], [382, 430]];
export const STOVEPIPE = { x: 334, y: 368 };
export function shipInIce() {
  const o = [];
  const HULL = '#232122', HULL_L = '#3A3638', RIG = '#3A3532', RIME = '#F4F7FA';
  const FORE = 230, MAIN = 318, MIZ = 380;
  // the rigging first, behind everything: the stays, the shrouds down to the rail, rimed
  const rig = [
    `M${FORE},206 L150,384`, `M${FORE},250 L158,386`, `M${FORE},206 L${MAIN},214`, `M${MAIN},214 L${MIZ},226`,
    `M${FORE},214 L196,404`, `M${FORE},214 L206,404`, `M${FORE},214 L254,404`, `M${FORE},214 L262,404`,
    `M${MAIN},216 L290,404`, `M${MAIN},216 L298,404`, `M${MAIN},216 L340,404`, `M${MAIN},216 L348,404`,
    `M${MIZ},228 L360,404`, `M${MIZ},228 L398,404`,
  ];
  for (const d of rig) o.push(line(d, RIG, 0.7));
  for (const d of [`M${FORE},206 L150,384`, `M${FORE},214 L196,404`, `M${MAIN},216 L290,404`]) o.push(line(d, RIME, 0.35));
  // the masts, the foremast's three yards with their furled sails (rime along them)
  for (const [x, top, w] of [[FORE, 206, 6], [MAIN, 210, 6], [MIZ, 222, 5]]) {
    o.push(rect(x - w / 2, top, w, 404 - top, '#7A5634', 0.8));
    o.push(box(x + 0.4, top + 1, w / 2 - 0.6, 402 - top, '#5A3E24'));
    o.push(rect(x - w / 2 - 2, top + 40, w + 4, 4, '#4A3628', 0.5));
  }
  for (const [y, w] of [[236, 34], [270, 44], [306, 54]]) {
    o.push(rect(FORE - w, y, w * 2, 3.6, '#6A4A2C', 0.6));
    o.push(fill(`M${FORE - w + 2},${y + 3.6} C${FORE - w / 2},${y + 9} ${FORE + w / 2},${y + 9} ${FORE + w - 2},${y + 3.6} Z`, '#EEEAE0', 0.5));
    o.push(line(`M${FORE - w + 1},${y} L${FORE + w - 1},${y}`, RIME, 0.9));
  }
  // the gaffs and booms of the fore-and-aft main and mizzen
  o.push(line(`M${MAIN},258 L${MAIN + 44},284 M${MAIN},372 L${MAIN + 52},372`, '#4A3628', 2));
  o.push(line(`M${MIZ},270 L${MIZ + 30},292 M${MIZ},378 L${MIZ + 34},378`, '#4A3628', 1.8));
  // the bowsprit and the jib boom running out over the ice, a furled jib along it
  o.push(fill('M206,404 L136,378 L134,382 L204,410 Z', '#6A4A2C', 0.8));
  o.push(line('M140,380 L196,402', RIME, 0.9));
  o.push(line('M136,380 L150,410 L196,412', RIG, 0.6));
  // the funnel, aft of the foremast, banded; the white deckhouse; the stovepipe; a boat on davits
  o.push(rect(262, 340, 11, 64, '#1E1C1C', 0.8));
  o.push(box(262, 344, 11, 3.4, '#C9B48A'));
  o.push(rect(292, 380, 76, 24, '#E8E4DA', 0.8));
  o.push(box(348, 380.5, 19.5, 23, '#CFCABD'));
  for (const x of [300, 316, 332]) o.push(rect(x, 386, 8, 7, '#4A5868', 0.4));
  o.push(rect(STOVEPIPE.x - 2, STOVEPIPE.y, 4, 13, '#2A2626', 0.6));
  o.push(rect(STOVEPIPE.x - 3.4, STOVEPIPE.y - 2, 6.8, 3, '#2A2626', 0.5));
  o.push(fill('M290,380 C300,376 350,376 370,380 Z', RIME, 0.5));
  o.push(line('M380,380 L384,364 M398,380 L402,364', '#4A3628', 1.2));
  o.push(fill('M376,366 C380,374 404,374 408,366 Z', '#E2DCCB', 0.7));
  // the hull: the bow raked forward at the left, black, its rail, her name, the portholes
  const hull = 'M190,404 C196,398 204,396 214,396 L408,398 L408,470 L206,470 C198,452 192,428 190,404 Z';
  o.push(fill(hull, HULL, 1.1));
  o.push(flat('M300,398 L408,398 L408,470 L300,470 Z', '#1A1819'));
  o.push(fill('M208,392 L408,394 L408,399 L210,398 Z', '#8A7A62', 0.7));
  o.push(fill('M196,400 L408,402 L408,405 L196,403 Z', HULL_L, 0));
  for (let x = 216; x < 404; x += 12) o.push(box(x, 392.6, 1.4, 5, '#5A4A3A'));
  o.push(text(232, 416, 'ENDURANCE', 6.4, '#D9CBA4', 700, 'middle', 0.8));
  o.push(circ(206, 414, 2.2, '#D9CBA4', 0.3));
  for (const [x, y] of PORTHOLES) o.push(circ(x, y, 3.2, '#4A5868', 0.8));
  // rime along the rail
  o.push(line('M210,392 L408,394', RIME, 1.4));
  // the ice heaped against her, drifted snow along the hull
  o.push(fill('M180,478 C184,458 196,448 214,450 C240,444 270,452 300,446 C330,442 370,452 410,444 L410,480 L180,480 Z', '#F4F7FA', 0.9));
  o.push(flat('M300,452 C330,448 370,456 410,450 L410,478 L300,478 Z', '#D6E1EB'));
  for (const [x, y] of [[226, 454], [262, 456], [346, 454], [386, 452]]) o.push(flat(`M${x},${y} L${x + 10},${y - 7} L${x + 18},${y} Z`, '#CBD8E4'));
  for (const [x, y] of [[214, 450], [252, 448], [318, 446]]) o.push(fill(`M${x},${y} L${x + 5},${y - 12} L${x + 13},${y - 9} L${x + 15},${y} Z`, '#F7F9FB', 0.6));
  return o.join('');
}

/**
 * NEAR: the floe the people stand on — rumpled snow, lit and shaded, sastrugi ridges, and
 * a crack running across it. (The cut channel is drawn by the scene, over this.)
 */
export function iceNear() {
  seed = 59;
  const o = [];
  o.push(fill('M-4,470 C40,466 120,468 200,472 C280,476 340,470 404,472 L404,518 L-4,518 Z', '#EEF2F6', 1));
  o.push(flat('M-4,470 C40,466 120,468 200,472 C280,476 340,470 404,472 L404,477 C340,475 280,481 200,477 C120,473 40,471 -4,475 Z', '#D3DEE8'));
  for (let k = 0; k < 22; k++) {
    const x = rnd() * 400, y = 482 + rnd() * 30, w = 10 + rnd() * 26;
    o.push(flat(`M${x},${y} C${x + w * 0.3},${y - 2.2} ${x + w * 0.7},${y - 2.2} ${x + w},${y} C${x + w * 0.6},${y - 0.6} ${x + w * 0.3},${y - 0.6} ${x},${y} Z`, '#C3D2E0'));
    o.push(box(x + 2, y - 2.8, w * 0.5, 0.8, '#FBFCFD'));
  }
  o.push(line('M246,476 L262,488 L258,498 L276,508 L272,516', '#9FB4C8', 0.8));
  return o.join('');
}

/** The folding table (its own frame: standing on y 0, its top at y −26, 110 wide). */
export function foldTable() {
  const o = [];
  o.push(line('M-46,0 L40,-24 M46,0 L-40,-24', '#5A3E26', 2.4));
  o.push(line('M-46,0 L40,-24 M46,0 L-40,-24', '#7A5634', 1.2));
  o.push(rect(-55, -27, 110, 4, '#9A6E44', 0.9));
  o.push(box(-54, -24, 108, 1.4, '#6E4E30'));
  return o.join('');
}

/** The ship's log standing open on its writing slope (its own frame: the slope's foot at y 0, 112 × 80). */
export function logSlope() {
  const o = [];
  o.push(fill('M-58,0 L-52,-80 L58,-80 L58,0 Z', '#6A4A2E', 1));
  o.push(rect(-54, -78, 110, 76, '#4A2E1E', 0.9));          // the log's leather boards
  o.push(rect(-51, -76, 104, 72, '#F3ECD8', 0.6));          // its page
  o.push(box(-50.5, -75.5, 103, 9, '#E6DBBE'));
  for (const y of [-46, -26]) o.push(line(`M-46,${y} L48,${y}`, '#CDBF9C', 0.5));
  o.push(line('M-38,-75.5 L-38,-4.5', '#D9A5A0', 0.5));
  return o.join('');
}

const at = (name, fn, view, box2 = view) => ({ name: `endur1-${name}`, svg: fn, view, box: box2 });
const FULL = { x: 0, y: 214, w: 400, h: 300 };
export const ART = [
  at('london-far', londonFar, { x: -40, y: 214, w: 480, h: 240 }),
  at('london-quay', londonQuay, { x: 300, y: 214, w: 116, h: 300 }),
  at('london-deck', londonDeck, FULL),
  at('mapcase', mapCase, { x: -26, y: -64, w: 52, h: 65 }),
  at('sack', mailSack, { x: -17, y: -36, w: 34, h: 37 }),
  at('case', longCase, { x: -80, y: -32, w: 160, h: 33 }),
  at('crate', crate, { x: -14, y: -21, w: 28, h: 22 }),
  at('tray', tray, { x: -79, y: -8, w: 158, h: 9 }),
  at('envelope', envelope, { x: -25, y: -27, w: 50, h: 28 }),
  at('form', form, { x: -27, y: -19, w: 54, h: 38 }),
  at('gryt', grytviken, { x: -70, y: 214, w: 480, h: 302 }),
  at('gryt-deck', grytDeck, FULL),
  at('husky', huskyHead, { x: -8, y: -18, w: 16, h: 19 }),
  at('pup', pup, { x: -15, y: -13, w: 29, h: 19 }),
  at('barrel', barrel, { x: -15, y: -33, w: 30, h: 34 }),
  at('ice-far', iceFar, FULL),
  at('ship', shipInIce, { x: 130, y: 200, w: 282, h: 282 }),
  at('ice-near', iceNear, { x: -6, y: 462, w: 412, h: 56 }),
  at('table', foldTable, { x: -57, y: -29, w: 114, h: 30 }),
  at('log', logSlope, { x: -60, y: -82, w: 120, h: 83 }),
];
