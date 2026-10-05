// THE KADESH CARVING in history-foundations-6, drawn as a carved relief (LESSON_RULES AM,
// AU3). Proportions are taken from photographs of the real relief in the great temple at
// Abu Simbel (Ramesses II in his chariot, one horse in the flying gallop with tall
// plumes, enemies under its hooves, columns of hieroglyphs): the king far larger than
// anyone, which is the point of the question. Nothing is traced; every curve is drawn here.
//
// Coordinates are SCENE units: the carving fills x 24–304, y 272–418 of the stage, so the
// picture drops into the scene with no conversion. Zero imports.

const STONE = '#D7A068';      // the wall's face
const FACE = '#E4B47C';       // a raised figure's face
const GROOVE = '#8A5631';     // the carved outline
const DEEP = '#6E4224';       // the shadow side of a cut
const LIT = '#F4D2A0';        // the lit lip of a cut
const BLUE = '#3E6290';       // what is left of the paint
const RED = '#B1472F';
const GOLD = '#C6993F';
const WHITE = '#F3E6CC';

/** A raised shape: its shadow down and right, its face, and its carved edge. */
function relief(d, fill = FACE, w = 1.1) {
  return `<path d="${d}" fill="${DEEP}" transform="translate(0.8 0.9)" opacity="0.55"/>`
    + `<path d="${d}" fill="${fill}" stroke="${GROOVE}" stroke-width="${w}" stroke-linejoin="round"/>`
    + `<path d="${d}" fill="none" stroke="${LIT}" stroke-width="0.45" transform="translate(-0.45 -0.45)" opacity="0.8"/>`;
}
/** A limb: a carved tube along a path, wide at the top and narrow at the foot. */
function limb(pts, w0, w1, fill = FACE) {
  // build the tube's outline from the centre line, offset either side
  const L = [], R = [];
  for (let k = 0; k < pts.length; k++) {
    const [x, y] = pts[k];
    const [ax, ay] = pts[Math.max(0, k - 1)];
    const [bx, by] = pts[Math.min(pts.length - 1, k + 1)];
    let dx = bx - ax, dy = by - ay;
    const n = Math.hypot(dx, dy) || 1;
    dx /= n; dy /= n;
    const w = (w0 + (w1 - w0) * (k / (pts.length - 1))) / 2;
    L.push([x - dy * w, y + dx * w]);
    R.push([x + dy * w, y - dx * w]);
  }
  const all = [...L, ...R.reverse()];
  const d = `M${all.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' L')} Z`;
  return relief(d, fill, 0.9);
}
/** A carved line cut into the face: a groove with a lit lip. */
function cut(d, w = 0.8, color = GROOVE) {
  return `<path d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`
    + `<path d="${d}" fill="none" stroke="${LIT}" stroke-width="0.35" stroke-linecap="round" transform="translate(-0.5 -0.5)" opacity="0.7"/>`;
}

// ── the horse, in the flying gallop, facing right ───────────────────────────
function horse() {
  const body = 'M140,332 C158,325 182,326 198,320 C198,306 203,295 210,290 L208,282 L214,287 '
    + 'C222,290 232,300 240,311 C243,315 241,320 236,320 C232,320 229,317 226,315 '
    + 'C222,322 218,330 216,340 C215,348 210,354 203,355 C188,357 168,357 152,353 '
    + 'C142,351 134,345 134,338 C134,334 136,332 140,332 Z';
  return [
    // far legs, a shade darker, behind the body
    limb([[200, 350], [214, 362], [226, 372], [237, 374]], 8, 3.8, '#D6A46D'),
    limb([[154, 350], [146, 370], [134, 388], [125, 396]], 9, 3.8, '#D6A46D'),
    // the tail, streaming back
    relief('M136,335 C126,334 118,340 113,352 C116,346 122,342 127,343 C124,348 122,354 123,360 C127,350 132,343 137,341 Z'),
    relief(body),
    // near legs: the fore pair reaching forward, the hind pair thrust back
    limb([[208, 348], [222, 358], [233, 366], [245, 366]], 9.5, 4.2),
    limb([[146, 346], [134, 364], [123, 379], [111, 383]], 11, 4.2),
    // the mane along the neck, and the saddle cloth
    cut('M199,319 C200,308 204,298 210,291', 1.4),
    relief('M168,326 L194,322 L197,337 L171,341 Z', RED, 0.8),
    cut('M171,334 L196,330', 0.6, GOLD),
    // the breast collar, the bridle, the eye, the nostril
    cut('M216,333 C212,342 205,348 196,349', 1.8, RED),
    cut('M216,292 L238,313 M222,303 L228,298 M229,316 C232,318 236,318 238,316', 0.7),
    `<circle cx="221.5" cy="298" r="1.5" fill="${GROOVE}"/>`,
    `<circle cx="237.5" cy="314" r="0.9" fill="${GROOVE}"/>`,
    // the plumes: three tall feathers from the poll, the last of the paint on them
    relief('M209,286 C205,281 203,277 204,273 C207,277 210,282 211,286 Z', RED, 0.6),
    relief('M212,286 C211,280 212,276 216,273 C216,278 215,283 214,287 Z', BLUE, 0.6),
    relief('M215,287 C217,282 220,279 224,278 C221,282 219,285 217,288 Z', RED, 0.6),
  ].join('');
}

// ── the chariot: a D-shaped cab, a six-spoked wheel at its back, the pole to the yoke ─
function chariot() {
  const spokes = [0, 60, 120].map((a) => {
    const r = (a * Math.PI) / 180;
    const c = Math.cos(r) * 15.5, s = Math.sin(r) * 15.5;
    return `M${(70 - c).toFixed(1)},${(398 - s).toFixed(1)} L${(70 + c).toFixed(1)},${(398 + s).toFixed(1)}`;
  }).join(' ');
  return [
    // the pole, rising from the cab's floor to the yoke on the horse's withers
    cut('M108,389 C136,382 170,356 198,333', 2.2),
    cut('M108,389 C136,382 170,356 198,333', 0.6, GOLD),
    // the wheel: tyre, nave, six spokes
    `<circle cx="70" cy="398" r="17" fill="none" stroke="${DEEP}" stroke-width="3.6" transform="translate(0.7 0.8)" opacity="0.5"/>`,
    `<circle cx="70" cy="398" r="17" fill="none" stroke="${GROOVE}" stroke-width="3.2"/>`,
    `<circle cx="70" cy="398" r="17" fill="none" stroke="${GOLD}" stroke-width="1.4"/>`,
    cut(spokes, 1.4),
    `<circle cx="70" cy="398" r="3.2" fill="${GOLD}" stroke="${GROOVE}" stroke-width="0.9"/>`,
    // the cab, gold-covered, with its quiver slung across the side
    relief('M58,392 L110,392 C113,383 111,375 104,369 C92,368 76,369 64,372 C61,378 59,385 58,392 Z', GOLD, 1.1),
    cut('M64,380 C80,377 96,377 108,380', 0.6),
    relief('M90,371 L95,369 L112,388 L107,391 Z', RED, 0.7),
    cut('M58,392 L111,392', 1.6),
  ].join('');
}

// ── the king, standing in the cab, drawing his bow ─────────────────────────
function kingParts(paint = true) {
  const p = (c) => (paint ? c : FACE);
  const body = 'M76,312 C84,307 100,307 108,312 L106,320 C101,330 99,340 101,348 L83,348 C83,338 80,326 76,312 Z';
  return [
    // the bow: a tall recurve held at arm's length, its string drawn back to his hand
    cut('M136,280 C152,293 152,333 136,346', 2.2, GROOVE),
    cut('M136,280 C152,293 152,333 136,346', 0.9, GOLD),
    cut('M136,280 L98,319 L136,346', 0.5, DEEP),
    // the arrow on the string
    cut('M98,319 L156,316', 0.9),
    relief('M156,314 L161,316 L156,318 Z', GOLD, 0.5),
    // body, kilt, the near arm pushing the bow out
    relief(body),
    relief('M82,346 L103,346 C108,352 112,360 114,368 L84,370 C82,362 82,354 82,346 Z', p(WHITE), 1.0),
    cut('M86,352 L108,362', 0.5),
    limb([[103, 315], [118, 316], [136, 314]], 6, 4.4),
    // the drawing arm, across his chest, pulling the string back to his collar
    limb([[82, 318], [80, 331], [91, 327], [99, 320]], 5.2, 3.8),
    // the broad collar, the neck, the head in profile, and the blue war crown
    relief('M80,312 C88,318 98,318 105,312 L104,309 C96,313 88,313 81,309 Z', p(BLUE), 0.6),
    relief('M90,312 L98,312 L99,303 L91,303 Z'),
    relief('M88,303 C88,296 90,290 96,289 C101,289 104,293 104,297 L107,301 L104,302 C104,306 102,309 98,309 L91,309 C89,307 88,305 88,303 Z'),
    `<circle cx="99" cy="295.5" r="1.1" fill="${GROOVE}"/>`,
    relief('M86,296 C84,286 86,277 94,274 C102,273 107,279 106,288 C106,292 104,294 101,294 C99,291 92,291 88,297 Z', p(BLUE), 0.9),
    cut('M89,292 C94,289 100,289 104,291', 0.6, p(GOLD)),
    relief('M104,280 C108,278 110,281 108,283 Z', p(GOLD), 0.4),
    // the streamers from the back of the crown, flying in the wind of the charge
    cut('M86,292 C78,294 72,300 68,308', 1.0, p(RED)),
    cut('M86,294 C80,298 76,304 74,312', 1.0, p(RED)),
  ].join('');
}

// ── the enemy: Hittites tumbling under the hooves, small ───────────────────
function foe(x, y, rot) {
  const parts = [
    limb([[0, 0], [-6, 5], [-12, 3]], 4.2, 3),
    limb([[0, 0], [-4, 7], [-9, 11]], 4.2, 3),
    limb([[0, 0], [10, -6]], 6.4, 5.2),
    limb([[8, -5], [14, 0], [19, -2]], 3.2, 2.4),
    limb([[7, -5], [5, -11], [9, -15]], 3.2, 2.4),
    relief('M-2,-1 L4,-4 L6,2 L0,4 Z', WHITE, 0.6),
    '<circle cx="13.5" cy="-8.5" r="3.4" fill="' + FACE + '" stroke="' + GROOVE + '" stroke-width="0.8"/>',
  ].join('');
  return '<g transform="translate(' + x + ' ' + y + ') rotate(' + rot + ')">' + parts + '</g>';
}

// ── the columns of hieroglyphs ─────────────────────────────────────────────
function glyphs() {
  const out = [];
  // the column rules
  for (const x of [240, 256, 272, 288, 302]) out.push(cut(`M${x},278 L${x},410`, 0.7));
  // a cartouche in the first column: the king's name, ringed
  out.push(relief('M244,282 C244,279 252,279 252,282 L252,316 C252,319 244,319 244,316 Z', FACE, 0.8));
  out.push(cut('M248,287 C246,289 246,292 248,293 C250,292 250,289 248,287 Z M245.5,299 L250.5,299 M248,303 L248,312 M245.5,306 L250.5,306', 0.6, BLUE));
  out.push(cut('M243,320 L253,320', 0.8));
  // single signs down each column, spaced like a real inscription
  const sign = {
    owl: (x, y) => cut(`M${x - 3},${y + 4} C${x - 4},${y - 3} ${x - 1},${y - 5} ${x + 1},${y - 4} C${x + 3},${y - 3} ${x + 3},${y + 1} ${x + 4},${y + 4} M${x - 1},${y - 2} L${x - 1},${y - 1.5} M${x + 1.5},${y - 2} L${x + 1.5},${y - 1.5}`, 0.6),
    reed: (x, y) => cut(`M${x},${y + 5} C${x - 2},${y} ${x - 1},${y - 3} ${x + 1},${y - 5} M${x + 1},${y - 5} L${x + 3},${y - 3}`, 0.6),
    water: (x, y) => cut(`M${x - 5},${y} L${x - 3},${y - 1.5} L${x - 1},${y} L${x + 1},${y - 1.5} L${x + 3},${y} L${x + 5},${y - 1.5}`, 0.6),
    loaf: (x, y) => cut(`M${x - 4},${y + 2} C${x - 4},${y - 3} ${x + 4},${y - 3} ${x + 4},${y + 2} Z`, 0.6),
    ankh: (x, y) => cut(`M${x},${y - 1} C${x - 2.5},${y - 3} ${x - 2},${y - 6} ${x},${y - 6} C${x + 2},${y - 6} ${x + 2.5},${y - 3} ${x},${y - 1} M${x - 3},${y - 1} L${x + 3},${y - 1} M${x},${y - 1} L${x},${y + 5}`, 0.6),
    mouth: (x, y) => cut(`M${x - 4},${y} C${x - 2},${y - 2} ${x + 2},${y - 2} ${x + 4},${y} C${x + 2},${y + 2} ${x - 2},${y + 2} ${x - 4},${y} Z`, 0.6),
    leg: (x, y) => cut(`M${x - 1},${y - 5} L${x},${y + 3} L${x + 3},${y + 4}`, 0.6),
    hawk: (x, y) => cut(`M${x - 3},${y + 4} L${x - 2},${y - 2} C${x - 1},${y - 5} ${x + 2},${y - 5} ${x + 2},${y - 2} L${x + 4},${y - 1} L${x + 1},${y + 1} L${x + 2},${y + 4}`, 0.6),
  };
  const cols = [
    [248, ['ankh', 'reed', 'water', 'loaf', 'owl', 'leg']],
    [264, ['hawk', 'water', 'mouth', 'reed', 'ankh', 'loaf', 'owl', 'water', 'leg']],
    [280, ['reed', 'owl', 'loaf', 'water', 'hawk', 'mouth', 'reed', 'ankh', 'water']],
    [295, ['water', 'leg', 'reed', 'mouth', 'owl', 'loaf', 'hawk', 'water', 'reed']],
  ];
  for (const [x, list] of cols) {
    const top = x === 248 ? 330 : 288;
    const step = (404 - top) / list.length;
    list.forEach((s, k) => out.push(sign[s](x, top + step * (k + 0.5))));
  }
  return out.join('');
}

const VIEW = { x: 24, y: 272, w: 280, h: 146 };

/** The whole carving: the wall's panel, every figure, the inscription. */
export function carvingSvg() {
  const frame = [
    `<rect x="24" y="272" width="280" height="146" fill="${STONE}"/>`,
    // a little wear on the stone, so it is not a flat card
    `<rect x="24" y="272" width="280" height="146" fill="url(#grain)" opacity="0.5"/>`,
    cut('M24,275 L304,275', 1.0), cut('M24,414 L304,414', 1.4),
  ].join('');
  const defs = `<defs><pattern id="grain" width="14" height="9" patternUnits="userSpaceOnUse">`
    + `<path d="M0,3 L5,2.6 M8,7 L13,6.4 M3,8 L6,8" stroke="${DEEP}" stroke-width="0.3" opacity="0.35"/></pattern></defs>`;
  return svg(defs + frame + glyphs() + chariot() + horse() + kingParts(true)
    + foe(196, 404, -20) + foe(226, 400, 25) + foe(166, 407, 5));
}

/** The king alone, for the gold copy that lifts off the wall: his figure in gold leaf. */
export function kingSvg() {
  const gold = kingParts(false)
    .replaceAll(FACE, '#E8C060').replaceAll(LIT, '#FFF0B8').replaceAll(GROOVE, '#8A6418').replaceAll(DEEP, '#6A4A10');
  return svg(gold, { x: 60, y: 272, w: 104, h: 100 });
}
export const KING_VIEW = { x: 60, y: 272, w: 104, h: 100 };
export const CARVING_VIEW = VIEW;

function svg(body, v = VIEW) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${v.x} ${v.y} ${v.w} ${v.h}" width="${v.w}" height="${v.h}">${body}</svg>`;
}
