// psychology-milgram-1 — "The Memory Study That Wasn't" (LESSON_RULES AW5, AM13): Stanley
// Milgram's office at Yale in the autumn of 1961, and the Interaction Laboratory where the
// obedience study ran, drawn as a CUTAWAY (a dollhouse) of three rooms side by side: the
// learner's room, the laboratory with its shock generator, and the observation booth behind
// a one-way mirror.
//
// Every picture is in SCENE units with the band [214, 514], 400 × 300. The office is world
// x 0–400; the laboratory runs world x 400–1230 (the scene's camera pans and cuts along it).
// Flat fills lit from the top left, a darker shaded side, one dark outline; real colours.
//
// REFERENCES (npm run ref, scratchpad/ref/mg*):
//   mg-yale-1   Yale's Old Campus: brownstone Collegiate Gothic and red Georgian brick under
//               big trees; the office window looks out on that, in October.
//   mg-gothic-1 a Gothic window in Sterling Memorial Library: a pointed stone arch, slim
//               mullions, leaded panes in a small grid, a deep stone sill, oak panelling below.
//   mg-exp-1    Milgram's advert in the New Haven Register: "Persons Needed for a Study of
//               Memory", "$4.00 for one hour of your time".
//   mg-exp-3    the plan of the experiment: experimenter and teacher in one room, the
//               learner behind a wall, the generator's wire running through to him.
//   mg-tog-1    a vintage panel: chrome bat-handle toggles in round bezels, a square red
//               indicator lamp above, black lettering on the metal.
//   mg-reel-1/2 a reel-to-reel tape recorder of the period (the sessions were recorded).
//   The generator itself (Milgram 1963): a long grey panel lettered SHOCK GENERATOR, TYPE
//   ZLB, DYSON INSTRUMENT COMPANY, a voltage meter, and thirty lever switches in a row, each
//   with its voltage and a lamp, grouped under SLIGHT SHOCK … DANGER: SEVERE SHOCK, XXX.

const OUT = '#2B241E';
const f2 = (n) => Number(n.toFixed(2));
const fill = (d, c, w = 1) => `<path d="${d}" fill="${c}" stroke="${OUT}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"/>`;
const flat = (d, c, o = 1) => `<path d="${d}" fill="${c}"${o < 1 ? ` opacity="${o}"` : ''}/>`;
const rect = (x, y, w, h, c, lw = 1, r = 0) => `<rect x="${f2(x)}" y="${f2(y)}" width="${f2(w)}" height="${f2(h)}" rx="${r}" fill="${c}" stroke="${OUT}" stroke-width="${lw}" stroke-linejoin="round"/>`;
const box = (x, y, w, h, c, o = 1) => `<rect x="${f2(x)}" y="${f2(y)}" width="${f2(w)}" height="${f2(h)}" fill="${c}"${o < 1 ? ` opacity="${o}"` : ''}/>`;
const line = (d, c, w) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const circ = (x, y, r, c, lw = 0.8) => `<circle cx="${f2(x)}" cy="${f2(y)}" r="${f2(r)}" fill="${c}" stroke="${OUT}" stroke-width="${lw}"/>`;
const ell = (x, y, rx, ry, c, lw = 0.8) => `<ellipse cx="${f2(x)}" cy="${f2(y)}" rx="${f2(rx)}" ry="${f2(ry)}" fill="${c}" stroke="${OUT}" stroke-width="${lw}"/>`;
const dot = (x, y, r, c, o = 1) => `<circle cx="${f2(x)}" cy="${f2(y)}" r="${f2(r)}" fill="${c}"${o < 1 ? ` opacity="${o}"` : ''}/>`;
const text = (x, y, s, size, c, w = 700, anchor = 'middle', ls = 0) =>
  `<text x="${f2(x)}" y="${f2(y)}" font-family="Arial, Helvetica, sans-serif" font-weight="${w}" font-size="${size}" fill="${c}" text-anchor="${anchor}"${ls ? ` letter-spacing="${ls}"` : ''}>${s}</text>`;

// ── palette ──────────────────────────────────────────────────────────────────
const PLASTER = '#E8E0CB', PLASTER_D = '#D6CCB2';
const OAK = '#7A5232', OAK_D = '#5E3E25', OAK_L = '#946642', OAK_DD = '#47301D';
const FLOOR = '#9B6A43', FLOOR_D = '#80553A', FLOOR_L = '#B07C52';
const STONE = '#C9B79A', STONE_D = '#A8977A', STONE_L = '#DDCEB4';
const LEAD = '#3B3A36';
const SKY = '#C8DCE6', SKY_L = '#DCE9EF';
const BROWN = '#8C5A44', BROWN_D = '#6F4434', BRICK = '#9E4B3A';
const LEAF_O = '#D9822B', LEAF_Y = '#E8B33A', LEAF_R = '#B5462B', LEAF_G = '#8A8F3A';
const SLATE = '#2F3B33', SLATE_L = '#3C4A40';
const CORK = '#C49A6C', CORK_D = '#A97F52';
const METAL = '#7D8578', METAL_D = '#646B5F', METAL_L = '#959C90';
const GREEN_LAMP = '#2F6B4A';
const LAB = '#D5D9C3', LAB_D = '#BEC3AA', LAB_L = '#E2E5D2';
const LROOM = '#BCC7B2', LROOM_D = '#A4B09A';
const TILE = '#CFCAB6', TILE_D = '#AAA591', TILE_L = '#DBD7C6';
const CUT = '#585B55', CUT_L = '#6E716A';
const BOOTH = '#5A4636', BOOTH_D = '#46362A', BOOTH_FLOOR = '#4A4440';
const GLASS = '#9FB8C2', GLASS_D = '#7F9AA6', GLASS_L = '#C7DAE0';
const GENC = '#9A9E9B', GEN_D = '#7E8280', GEN_L = '#B4B8B4', GEN_FACE = '#AEB2AE';
const CHROME = '#D9DDE0', CHROME_D = '#9DA3A8';
const RED_LAMP = '#7A2A24', RED_LAMP_L = '#B03A2E';
const WOOD = '#A57A4E', WOOD_D = '#86603A', WOOD_L = '#BC8F60';
const BLACK = '#232323';

// ══════════════════════════════════════════════════════════════════════════════
// PLACE 0 — MILGRAM'S OFFICE AT YALE, OCTOBER 1961 (world x 0–400)
// ══════════════════════════════════════════════════════════════════════════════

/** The view through the window: an autumn sky, brownstone Gothic and red brick under big trees. */
function windowView() {
  const o = [];
  o.push(box(166, 250, 82, 180, SKY));
  o.push(box(166, 250, 82, 40, SKY_L));
  // the brownstone hall across the quad, a crenellated tower, and red brick to its right
  o.push(fill('M166,330 L196,330 L196,300 L200,300 L200,296 L204,296 L204,300 L208,300 L208,296 L212,296 L212,330 L230,330 L230,318 L248,318 L248,430 L166,430 Z', BROWN, 0.6));
  o.push(flat('M212,330 L230,330 L230,318 L248,318 L248,430 L212,430 Z', BROWN_D));
  for (const [x, y] of [[172, 340], [182, 340], [172, 360], [182, 360], [218, 336], [236, 336], [218, 356], [236, 356], [200, 312]]) {
    o.push(box(x, y, 6, 10, '#3F3A3A'));
    o.push(box(x, y, 6, 1.4, STONE_L));
  }
  o.push(box(236, 324, 12, 30, BRICK));
  for (const y of [328, 336, 344]) o.push(box(238, y, 4, 5, '#3F3A3A'));
  // the trees on the quad in October: big masses of orange, yellow and rust, dark trunks
  o.push(fill('M160,372 C164,346 182,334 198,340 C206,326 228,326 236,342 C252,340 258,362 252,376 C258,392 244,404 228,398 C218,410 196,410 188,400 C170,404 156,390 160,372 Z', LEAF_O, 0.6));
  o.push(flat('M206,342 C220,334 234,338 238,350 C250,350 254,366 246,378 C236,374 222,366 206,342 Z', LEAF_Y));
  o.push(flat('M164,384 C172,394 186,398 196,394 C188,404 172,404 164,384 Z', LEAF_R));
  o.push(flat('M222,388 C232,392 242,392 250,384 C248,396 236,402 222,388 Z', LEAF_R));
  o.push(line('M196,430 L198,404 L192,392 M198,404 L206,394 M228,430 L226,400 L234,390', '#4A3426', 2.2));
  // the lawn below
  o.push(box(166, 414, 82, 16, LEAF_G));
  o.push(box(166, 414, 82, 3, '#A0A64A'));
  return o.join('');
}

/** FAR: the panelled office — plaster above oak wainscot, the Gothic window, a slate board,
 *  the corkboard, the clock, a diploma, a filing cabinet, the door to the corridor, a rug. */
export function officeFar() {
  const o = [];
  // plaster wall, a picture rail, the cornice
  o.push(box(0, 214, 400, 216, PLASTER));
  o.push(box(0, 214, 400, 8, PLASTER_D));
  o.push(box(0, 222, 400, 2, OAK_D));
  o.push(box(0, 318, 400, 2.2, OAK));
  o.push('<g transform="translate(10,0)">');
  // the window: a pointed stone arch, mullions, leaded panes, a deep sill
  const arch = 'M164,432 L164,300 C164,272 186,254 206,246 C226,254 248,272 248,300 L248,432 Z';
  o.push(fill('M158,436 L158,300 C158,268 182,246 206,238 C230,246 254,268 254,300 L254,436 Z', STONE, 1));
  o.push(`<clipPath id="mgwin"><path d="${arch}"/></clipPath><g clip-path="url(#mgwin)">${windowView()}`
    + [178, 192, 220, 234].map((x) => line(`M${x},250 L${x},432`, LEAD, 0.6)).join('')
    + [266, 282, 298, 314, 330, 346, 362, 378, 394, 410].map((y) => line(`M164,${y} L248,${y}`, LEAD, 0.45)).join('')
    + `</g>`);
  o.push(fill('M164,432 L164,300 C164,272 186,254 206,246 C226,254 248,272 248,300 L248,432', 'none', 1.2));
  o.push(rect(203.5, 262, 5, 170, STONE_L, 0.8));
  o.push(fill('M206,262 C196,274 188,290 186,304 L190,304 C192,292 198,278 206,268 C214,278 220,292 222,304 L226,304 C224,290 216,274 206,262 Z', STONE_L, 0.6));
  o.push(rect(154, 428, 104, 7, STONE_L, 0.9));
  o.push(box(156, 433, 100, 2, STONE_D));
  // the pendant light: a milk-glass globe on a rod
  o.push(line('M206,224 L206,246', '#3A3430', 1.2));
  o.push(fill('M196,250 C196,244 216,244 216,250 C216,258 196,258 196,250 Z', '#F1EEE4', 0.8));
  o.push(flat('M206,244 C212,245 216,247 216,250 C216,256 210,258 206,258 Z', '#DCD7C9'));
  o.push(rect(203, 242, 6, 3, '#6A5A48', 0.6));
  o.push('</g>');
  // the oak wainscot, panelled
  o.push(rect(-2, 430, 404, 56, OAK, 1));
  o.push(box(0, 430, 400, 3, OAK_L));
  for (let x = 6; x < 400; x += 44) {
    o.push(rect(x, 438, 36, 38, OAK_D, 0.6));
    o.push(box(x + 1, 439, 34, 2, OAK_DD));
    o.push(box(x + 1, 473, 34, 1.4, OAK_L));
  }
  o.push(box(0, 478, 400, 6, OAK_DD));
  // the slate blackboard on the wall, framed in oak, with its chalk tray (the scene writes on it)
  o.push(rect(42, 360, 60, 68, OAK_L, 1));
  o.push(rect(46, 364, 52, 60, SLATE, 0.7));
  o.push(flat('M46,364 L98,364 L98,367 L46,367 Z', SLATE_L));
  o.push(line('M50,418 C56,416 64,419 70,417', '#56645A', 0.6));
  o.push(rect(40, 426, 64, 4, OAK_D, 0.8));
  o.push(rect(52, 423.6, 7, 2.4, '#F2EFE6', 0.4));
  o.push(rect(84, 424.4, 5, 1.8, '#E6C9A8', 0.3));
  // the coat hook (the grey lab coat hangs on it; the scene draws the coat)
  o.push(rect(27, 366, 6, 4, '#8A7A60', 0.6));
  o.push(line('M30,370 L30,375 C30,378 33,378 33,376', '#6A5A44', 1.2));
  // the corkboard: two notes and a postcard pinned; the advert goes in the middle
  o.push(rect(114, 358, 54, 56, OAK_L, 1));
  o.push(rect(117, 361, 48, 50, CORK, 0.6));
  for (const [x, y] of [[121, 404], [160, 400], [150, 366]]) o.push(dot(x, y, 0.7, CORK_D));
  o.push(rect(118, 362, 8, 10, '#F4F1E6', 0.5));
  o.push(rect(156, 402, 8, 7, '#E9D27A', 0.5));
  for (const [x, y, c] of [[122, 363, '#B03A2E'], [160, 403, '#2F4A73']]) o.push(circ(x, y, 1, c, 0.3));
  // a framed diploma and the wall clock (its hands are drawn by the scene)
  o.push(rect(280, 332, 26, 20, OAK_D, 0.8));
  o.push(rect(283, 335, 20, 14, '#F2ECD8', 0.4));
  o.push(line('M286,339 L300,339 M287,342 L299,342 M288,345 L298,345', '#9A8E6E', 0.4));
  o.push(dot(299, 346.5, 1.2, '#B03A2E'));
  o.push(circ(330, 284, 14, OAK_D, 1));
  o.push(circ(330, 284, 11.5, '#F4F0E4', 0.6));
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * Math.PI * 2;
    o.push(line(`M${f2(330 + Math.sin(a) * 9)},${f2(284 - Math.cos(a) * 9)} L${f2(330 + Math.sin(a) * 10.6)},${f2(284 - Math.cos(a) * 10.6)}`, '#3A3430', k % 3 ? 0.5 : 1));
  }
  // the door to the corridor, ajar: dark beyond, a frosted pane lettered for the department
  o.push(rect(350, 362, 50, 124, OAK_L, 1));
  o.push(rect(354, 366, 44, 120, '#3A332D', 0.6));
  o.push(fill('M356,368 L384,372 L384,486 L356,486 Z', OAK, 0.8));
  o.push(rect(360, 378, 20, 36, '#D9DCD4', 0.5));
  o.push(text(370, 394, 'PSYCH', 4.2, '#4A4A44', 700));
  o.push(text(370, 400, 'DEPT', 3.6, '#4A4A44', 700));
  o.push(circ(380, 432, 1.6, '#C9A84A', 0.4));
  // the floor: oak boards, a burgundy rug under the desk
  o.push(rect(-2, 484, 404, 32, FLOOR, 0.8));
  o.push(box(0, 484.5, 400, 3, FLOOR_D));
  for (const y of [492, 500, 508]) o.push(line(`M0,${y} L400,${y}`, FLOOR_D, 0.55));
  for (const [y, step, off] of [[492, 52, 10], [500, 64, 30], [508, 76, 4]]) {
    for (let x = off; x < 400; x += step) o.push(line(`M${x},${y - 8} L${x},${y}`, FLOOR_D, 0.5));
    for (let x = off + 14; x < 400; x += step * 1.6) o.push(box(x, y - 6.4, step * 0.35, 1.4, FLOOR_L));
  }
  o.push(fill('M86,490 L276,490 L290,510 L72,510 Z', '#7A3B33', 0.8));
  o.push(line('M92,493 L272,493 M80,506 L284,506', '#B6905A', 0.8));
  o.push(flat('M86,490 L276,490 L278,493 L84,493 Z', '#6A322B'));
  // the filing cabinet: two drawers of olive steel, hip high (its top at 456)
  o.push(rect(292, 456, 42, 44, METAL, 1));
  o.push(flat('M322,457 L333,457 L333,499 L322,499 Z', METAL_D));
  o.push(box(293, 456.6, 40, 2, METAL_L));
  for (const y of [460, 480]) {
    o.push(rect(296, y, 34, 17, METAL, 0.6));
    o.push(rect(306, y + 3, 12, 4, '#E8E4D6', 0.4));
    o.push(rect(307, y + 9, 10, 2.4, '#B9BDB4', 0.4));
  }
  return o.join('');
}

/** NEAR: Milgram's chair, and the pedestal desk with its lamp, telephone and typewriter. */
export function officeNear() {
  const o = [];
  // his wooden office chair (he sits facing right; its back on the left)
  o.push(rect(98, 474, 34, 5, OAK_L, 0.9));
  o.push(box(99, 477.6, 32, 1.4, OAK_D));
  for (const x of [101, 127]) o.push(rect(x, 479, 3.4, 21, OAK, 0.6));
  o.push(rect(112, 479, 3.4, 18, OAK_D, 0.5));
  o.push(fill('M96,476 L96,434 C96,430 100,428 104,430 L104,476 Z', OAK, 0.9));
  o.push(rect(95, 432, 10, 18, OAK_L, 0.6));
  // the desk: two pedestals of drawers, a kneehole, a top with a lip
  o.push(rect(150, 466, 32, 34, OAK, 1));
  o.push(rect(220, 466, 32, 34, OAK, 1));
  o.push(flat('M244,467 L251,467 L251,499 L244,499 Z', OAK_D));
  for (const x of [150, 220]) for (const y of [469, 480, 490]) {
    o.push(rect(x + 3, y, 26, 8.6, OAK_L, 0.5));
    o.push(rect(x + 13, y + 3.6, 6, 1.6, '#C9A84A', 0.3));
  }
  o.push(rect(182, 466, 38, 10, OAK_D, 0.7));
  o.push(rect(146, 460, 110, 7, OAK_L, 1));
  o.push(box(147, 465, 108, 1.6, OAK_D));
  // a green banker's lamp
  o.push(rect(156, 456, 10, 4, '#C9A84A', 0.6));
  o.push(rect(160, 444, 2, 12, '#C9A84A', 0.4));
  o.push(fill('M152,446 C152,440 170,440 170,446 Z', GREEN_LAMP, 0.7));
  o.push(flat('M152,446 L170,446 L170,447.4 L152,447.4 Z', '#F4E7A8'));
  // a black telephone with its dial
  o.push(fill('M172,460 L174,452 L190,452 L192,460 Z', BLACK, 0.6));
  o.push(fill('M170,451 C170,446 194,446 194,451 L190,451 C188,449 176,449 174,451 Z', BLACK, 0.6));
  o.push(circ(182, 456, 2.6, '#E8E4D8', 0.4));
  // a typewriter with a sheet in it
  o.push(fill('M198,460 L201,446 L229,446 L232,460 Z', '#3D4A44', 0.8));
  o.push(rect(197, 442, 36, 5, '#2E3833', 0.6));
  o.push(rect(206, 432, 18, 11, '#F6F3EA', 0.5));
  o.push(line('M208,436 L222,436 M208,439 L218,439', '#8A8A84', 0.4));
  for (let x = 204; x < 228; x += 4) o.push(dot(x, 454, 1, '#D8D4C8'));
  return o.join('');
}

// ══════════════════════════════════════════════════════════════════════════════
// PLACE 1 — THE INTERACTION LABORATORY (world x 400–1230), a cutaway of three rooms:
//   the learner's room 400–620 · wall W1 with its doorway 620–632 · the laboratory
//   632–1040 · wall W2 with the one-way mirror 1040–1052 · the observation booth 1052–1230.
// ══════════════════════════════════════════════════════════════════════════════

/** A wall seen cut through (the cutaway): a dark band, an opening `y0`–`y1` left open. */
function cutWall(x, w, open) {
  const o = [];
  if (!open) { o.push(rect(x, 214, w, 302, CUT, 0.8)); o.push(box(x + 1, 215, 2, 300, CUT_L)); return o.join(''); }
  o.push(rect(x, 214, w, open[0] - 214, CUT, 0.8));
  o.push(box(x + 1, 215, 2, open[0] - 216, CUT_L));
  if (open[1] < 500) { o.push(rect(x, open[1], w, 516 - open[1], CUT, 0.8)); o.push(box(x + 1, open[1] + 1, 2, 514 - open[1], CUT_L)); }
  return o.join('');
}
/** Linoleum tiles in a checker, a row toward us. */
function tiles(x0, x1, a = TILE, b = TILE_D) {
  const o = [];
  o.push(box(x0, 484, x1 - x0, 32, a));
  o.push(box(x0, 483.6, x1 - x0, 0.8, OUT));
  o.push(box(x0, 484.5, x1 - x0, 2.6, b));
  [[488, 8, 18], [496, 9, 20], [505, 10, 22]].forEach(([y, h, s], r) => {
    const k0 = Math.floor(x0 / s);
    for (let k = k0; k * s < x1; k++) if ((k + r) % 2 === 0) { const x = Math.max(x0, k * s); o.push(box(x, y, Math.min(k * s + s, x1) - x, h, b, 0.8)); }
  });
  for (const y of [488, 496, 505]) o.push(box(x0, y - 0.3, x1 - x0, 0.6, b));
  return o.join('');
}

/** FAR, the left half: the learner's room, the wall between, the laboratory's entrance. */
export function labFarA() {
  const o = [];
  // the learner's room: pale institutional green, a high window with a blind, a wall speaker
  o.push(box(400, 214, 220, 272, LROOM));
  o.push(box(400, 214, 220, 6, LROOM_D));
  o.push(box(400, 420, 220, 2, LROOM_D));
  o.push(rect(436, 286, 52, 44, '#E6E2D2', 0.9));
  o.push(rect(440, 290, 44, 36, '#C8D6DC', 0.5));
  for (let y = 292; y < 326; y += 3.4) o.push(box(441, y, 42, 1.6, '#EDE9DB'));
  o.push(line('M486,292 L486,330', '#8A8574', 0.5));
  o.push(rect(438, 428, 48, 30, '#C9C6B8', 0.8));
  for (let x = 442; x < 484; x += 5) o.push(rect(x, 430, 3, 26, '#B4B1A2', 0.3));
  o.push(rect(566, 316, 20, 16, '#7A6A54', 0.7));
  for (let y = 319; y < 330; y += 2.6) o.push(line(`M569,${y} L583,${y}`, '#3E352A', 0.6));
  o.push(line('M576,316 L576,236', '#5E5A50', 0.7));
  o.push(rect(400, 476, 220, 8, '#8A9480', 0.6));
  o.push(tiles(398, 622, '#C2C3B4', '#A0A291'));
  // the laboratory's back wall: painted green-cream, a dado rail, a fluorescent fitting
  o.push(box(632, 214, 220, 272, LAB));
  o.push(box(632, 214, 220, 6, LAB_D));
  o.push(box(632, 418, 220, 2.4, LAB_D));
  o.push(box(632, 420, 220, 56, LAB_L));
  o.push(rect(632, 476, 220, 8, '#9AA08C', 0.6));
  o.push(rect(690, 218, 120, 6, '#E9ECEA', 0.7));
  o.push(box(692, 222, 116, 1.4, '#BFC6C4'));
  // the entrance: a door with a wired-glass light, lettered for the laboratory
  o.push(rect(642, 364, 44, 122, OAK_L, 1));
  o.push(rect(646, 368, 36, 116, OAK, 0.7));
  o.push(flat('M676,369 L681,369 L681,483 L676,483 Z', OAK_D));
  o.push(rect(652, 376, 24, 30, '#D7DFDC', 0.5));
  for (let x = 656; x < 676; x += 4) o.push(line(`M${x},377 L${x},405`, '#B7C2BF', 0.35));
  o.push(rect(650, 412, 28, 12, '#E9E4D2', 0.5));
  o.push(text(664, 417, 'INTERACTION', 3.4, '#3A342C', 700));
  o.push(text(664, 422, 'LABORATORY', 3.4, '#3A342C', 700));
  o.push(circ(678, 432, 1.8, '#C9A84A', 0.4));
  // a notice board and the lab clock (hands by the scene)
  o.push(rect(712, 330, 40, 30, '#B99366', 0.8));
  o.push(rect(716, 334, 14, 18, '#F4F1E6', 0.4));
  o.push(rect(734, 336, 14, 10, '#E9D27A', 0.4));
  o.push(line('M718,338 L728,338 M718,341 L727,341 M718,344 L726,344', '#8A8A84', 0.35));
  o.push(circ(800, 300, 11, '#3A3A38', 1));
  o.push(circ(800, 300, 9, '#F4F0E4', 0.5));
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * Math.PI * 2;
    o.push(line(`M${f2(800 + Math.sin(a) * 7)},${f2(300 - Math.cos(a) * 7)} L${f2(800 + Math.sin(a) * 8.4)},${f2(300 - Math.cos(a) * 8.4)}`, '#3A3430', k % 3 ? 0.45 : 0.9));
  }
  o.push(tiles(630, 852));
  // the wall W1, cut, with its doorway; the door stands open against the learner's side
  o.push(cutWall(620, 12, [384, 501]));
  o.push(box(620, 384, 12, 100, '#9EA791'));
  o.push(box(620, 484, 12, 32, '#B7B8A8'));
  o.push(fill('M604,384 L620,382 L620,486 L604,488 Z', OAK, 0.8));
  o.push(circ(608, 434, 1.4, '#C9A84A', 0.3));
  return o.join('');
}

/** FAR, the right half: the laboratory, the one-way mirror in W2, the observation booth. */
export function labFarB() {
  const o = [];
  o.push(box(850, 214, 190, 272, LAB));
  o.push(box(850, 214, 190, 6, LAB_D));
  o.push(box(850, 418, 190, 2.4, LAB_D));
  o.push(box(850, 420, 190, 56, LAB_L));
  o.push(rect(850, 476, 190, 8, '#9AA08C', 0.6));
  o.push(rect(900, 218, 110, 6, '#E9ECEA', 0.7));
  o.push(box(902, 222, 106, 1.4, '#BFC6C4'));
  // a framed Yale notice and a ventilation grille
  o.push(rect(866, 318, 30, 22, '#3D4D6E', 0.8));
  o.push(text(881, 327, 'YALE', 6, '#F1EEE4', 700));
  o.push(text(881, 335, 'UNIVERSITY', 3.6, '#F1EEE4', 700));
  o.push(rect(990, 238, 30, 14, '#C5C8BC', 0.6));
  for (let x = 993; x < 1018; x += 3) o.push(line(`M${x},240 L${x},250`, '#8E9286', 0.5));
  o.push(tiles(848, 1042));
  // the observation booth: dark panelled, a low desk with a tape recorder, a desk lamp
  o.push(box(1052, 214, 180, 272, BOOTH));
  o.push(box(1052, 214, 180, 6, BOOTH_D));
  for (let x = 1060; x < 1232; x += 30) o.push(box(x, 220, 1.4, 256, BOOTH_D));
  o.push(rect(1052, 476, 180, 8, '#3E3128', 0.6));
  o.push(rect(1050, 484, 182, 32, BOOTH_FLOOR, 0.8));
  o.push(box(1052, 484.5, 180, 3, '#3A3532'));
  // the booth's own lamp, a pool of light on the desk drawn as a flat shape
  o.push(fill('M1136,240 L1146,240 L1150,256 L1132,256 Z', '#2F3A34', 0.7));
  o.push(line('M1141,214 L1141,240', '#2A2420', 0.8));
  o.push(flat('M1132,256 L1150,256 L1182,462 L1104,462 Z', '#7A6450', 0.45));
  // the low desk and the reel-to-reel recorder on it, its two reels
  o.push(rect(1150, 462, 74, 6, '#6E5440', 0.9));
  for (const x of [1154, 1216]) o.push(rect(x, 468, 4, 32, '#5A4434', 0.6));
  o.push(rect(1160, 444, 50, 18, '#3E4446', 0.8));
  o.push(rect(1162, 446, 46, 3, '#5A6264', 0.4));
  for (const x of [1172, 1198]) { o.push(circ(x, 437, 8, '#7E868A', 0.7)); o.push(circ(x, 437, 4.5, '#3A3A3A', 0.5)); o.push(dot(x, 437, 1.2, '#C9CDD0')); }
  o.push(line('M1172,445 L1198,445', '#2A2A2A', 0.8));
  o.push(rect(1176, 454, 18, 5, '#C9CDD0', 0.4));
  // W2, cut, with the one-way mirror set in it at face height
  o.push(cutWall(1040, 12, [396, 458]));
  o.push(rect(1040, 396, 12, 62, GLASS, 0.8));
  o.push(flat('M1041,397 L1046,397 L1046,457 L1041,457 Z', GLASS_L));
  o.push(line('M1043,404 L1050,396 M1042,420 L1051,408', '#E8F1F3', 0.6));
  o.push(rect(1038, 456, 16, 4, CUT_L, 0.6));
  return o.join('');
}

/** NEAR, the left half: the learner's wooden armchair, its wire, and the long hat table. */
export function labNearA() {
  const o = [];
  // the armchair (he sits facing right; the back on the left), straps on its arms
  o.push(rect(480, 470, 44, 7, WOOD, 1));
  o.push(box(481, 475, 42, 1.6, WOOD_D));
  for (const x of [482, 518]) o.push(rect(x, 477, 4, 23, WOOD_D, 0.7));
  o.push(fill('M476,476 L476,404 C476,400 480,398 484,400 L486,476 Z', WOOD, 1));
  o.push(flat('M481,401 L486,402 L486,476 L482,476 Z', WOOD_D));
  o.push(rect(478, 452, 52, 5, WOOD_L, 0.8));
  o.push(rect(522, 457, 5, 13, WOOD_D, 0.6));
  // the learner's answer box on the end of the arm, four little paddles
  o.push(rect(522, 444, 14, 8, '#4A4D52', 0.6));
  for (let k = 0; k < 4; k++) o.push(rect(523.6 + k * 3.2, 442, 2, 2.6, '#C9CDD0', 0.3));
  // the wire: from the chair's arm down to the floor, out through the doorway, across the lab
  o.push(line('M486,457 C490,470 492,486 500,497 L616,499 L640,499 L826,499', '#2A2A2A', 1.6));
  o.push(line('M532,452 C536,470 534,490 540,498', '#2A2A2A', 1.1));
  // the long hat table: a plain wooden top on four legs (top at 462)
  o.push(rect(686, 462, 120, 6, WOOD_L, 1));
  o.push(box(687, 466, 118, 1.6, WOOD_D));
  for (const x of [690, 798]) o.push(rect(x, 468, 4, 32, WOOD, 0.7));
  for (const x of [704, 784]) o.push(rect(x, 468, 3, 28, WOOD_D, 0.5));
  o.push(line('M694,488 L798,488', WOOD_D, 1.2));
  return o.join('');
}

/**
 * NEAR, the right half: the long steel table, and on it THE SHOCK GENERATOR (its face 860–984
 * × 426–466), a meter at its left, thirty lever switches in a row with a lamp over each, the
 * voltages, the groups and the maker's plate; a desk microphone on its top.
 */
export const GEN = { x0: 860, x1: 984, top: 426, base: 466, sw0: 866, swStep: 112 / 29, swY: 457, lampY: 449 };
export function labNearB() {
  const o = [];
  // the table
  o.push(rect(846, 466, 146, 6, '#8E9294', 1));
  o.push(box(847, 470, 144, 1.6, '#6E7274'));
  for (const x of [850, 984]) o.push(rect(x, 472, 4, 28, '#6E7274', 0.7));
  // a plain wooden chair against the wall by the mirror (Mr Wallace waits on it)
  o.push(rect(1002, 474, 30, 5, WOOD_L, 0.9));
  for (const x of [1005, 1027]) o.push(rect(x, 479, 3.4, 21, WOOD, 0.6));
  o.push(fill('M1030,476 L1030,436 C1030,432 1034,430 1036,433 L1036,476 Z', WOOD, 0.9));
  // the generator: a long grey steel box, its top lit, its right end in shade
  o.push(fill(`M${GEN.x0 - 2},${GEN.top} L${GEN.x0 + 4},${GEN.top - 6} L${GEN.x1 + 6},${GEN.top - 6} L${GEN.x1},${GEN.top} Z`, GEN_L, 0.8));
  o.push(rect(GEN.x0 - 2, GEN.top, GEN.x1 - GEN.x0 + 2, GEN.base - GEN.top, GEN_FACE, 1));
  o.push(fill(`M${GEN.x1},${GEN.top} L${GEN.x1 + 6},${GEN.top - 6} L${GEN.x1 + 6},${GEN.base - 6} L${GEN.x1},${GEN.base} Z`, GEN_D, 0.8));
  // the black title strip with the maker's lettering
  o.push(rect(GEN.x0 + 16, GEN.top + 2, GEN.x1 - GEN.x0 - 18, 5, BLACK, 0.4));
  o.push(text((GEN.x0 + GEN.x1) / 2 + 8, GEN.top + 5.9, 'SHOCK GENERATOR · TYPE ZLB · DYSON INSTRUMENT CO.', 2.6, '#E8E4D8', 700));
  // the voltage meter at the left end
  o.push(rect(GEN.x0, GEN.top + 2, 13, 10, '#F2EFE4', 0.5));
  o.push(fill(`M${GEN.x0 + 2},${GEN.top + 10} C${GEN.x0 + 3},${GEN.top + 4} ${GEN.x0 + 10},${GEN.top + 4} ${GEN.x0 + 11},${GEN.top + 10}`, 'none', 0.4));
  o.push(line(`M${GEN.x0 + 6.5},${GEN.top + 10.5} L${GEN.x0 + 4},${GEN.top + 5.6}`, '#B03A2E', 0.5));
  // the group words across the top of the switches (eight groups of four, the last two XXX)
  const groups = ['SLIGHT', 'MODERATE', 'STRONG', 'V. STRONG', 'INTENSE', 'EXTREME', 'DANGER', 'XXX'];
  for (let g = 0; g < 8; g++) {
    const a = GEN.sw0 + g * 4 * GEN.swStep - 1.6;
    const w = (g < 7 ? 4 : 2) * GEN.swStep - 0.6;
    o.push(rect(a, GEN.top + 9, w, 4.2, g >= 6 ? '#E9C9C2' : '#E4E2D6', 0.3));
    o.push(text(a + w / 2, GEN.top + 12.3, groups[g], 2.4, g >= 6 ? '#8E241F' : '#2A2A2A', 700));
  }
  // thirty switches: the voltage, the lamp, the chrome toggle in its bezel (all UP)
  for (let k = 0; k < 30; k++) {
    const x = GEN.sw0 + k * GEN.swStep;
    o.push(text(x, GEN.top + 18.4, String((k + 1) * 15), 1.7, '#2A2A2A', 700));
    o.push(rect(x - 1.3, GEN.lampY - 1.6, 2.6, 2.6, RED_LAMP, 0.25));
    o.push(circ(x, GEN.swY, 1.5, CHROME_D, 0.3));
    o.push(rect(x - 0.55, GEN.swY - 4.6, 1.1, 4.4, CHROME, 0.25));
    o.push(dot(x, GEN.swY - 4.6, 0.9, CHROME));
  }
  // the maker's plate along the foot
  o.push(rect(GEN.x0 + 30, GEN.base - 5, 60, 3.4, '#7E8280', 0.3));
  // the desk microphone standing on its top at the left
  o.push(rect(866, 422, 14, 4, BLACK, 0.6));
  o.push(rect(872, 410, 2, 12, '#5A5E60', 0.4));
  o.push(fill('M868,404 C868,398 878,398 878,404 L878,410 C878,413 868,413 868,410 Z', '#3E4446', 0.7));
  for (let y = 403; y < 411; y += 2.2) o.push(line(`M869,${y} L877,${y}`, '#7E868A', 0.4));
  return o.join('');
}

/** The cloth cover thrown over the generator (its own frame: the generator's box). */
export function cover() {
  const o = [];
  o.push(fill('M854,468 C854,446 856,428 864,420 C900,414 950,414 986,418 C992,424 994,446 994,468 C980,464 970,470 958,466 C944,470 930,464 916,468 C900,470 884,464 870,468 C864,470 858,466 854,468 Z', '#6E7468', 1));
  o.push(flat('M960,416 C976,416 984,416 986,418 C992,424 994,446 994,468 C984,465 976,468 966,467 C970,446 968,428 960,416 Z', '#5A6056'));
  o.push(line('M880,420 C884,440 882,456 886,466 M930,418 C934,436 930,454 934,467', '#5A6056', 0.8));
  return o.join('');
}

/** The newspaper, opened, front page out (its own frame, centred on the fold). */
export function paper() {
  const o = [];
  o.push(rect(-24, -16, 48, 32, '#F1EEE2', 0.7));
  o.push(line('M0,-16 L0,16', '#C9C4B2', 0.6));
  o.push(text(-12, -10.4, 'NEW HAVEN', 3, '#2A2A2A', 700));
  o.push(text(-12, -6.4, 'REGISTER', 2.4, '#2A2A2A', 700));
  o.push(rect(-22, -4.4, 20, 2.8, BLACK, 0));
  o.push(text(-12, -2.2, 'EICHMANN', 2.4, '#F1EEE2', 700));
  o.push(text(-12, 1.6, 'ON TRIAL', 3.2, '#2A2A2A', 700));
  o.push(rect(-21, 3.4, 9, 9, '#9A9890', 0.3));
  for (let y = 4; y < 13; y += 1.8) o.push(line(`M-10.4,${y} L-3,${y}`, '#8A8A84', 0.45));
  for (let y = -12; y < 14; y += 1.8) o.push(line(`M3,${y} L21,${y}`, '#8A8A84', 0.45));
  o.push(rect(4, -6, 10, 8, '#A9A79E', 0.3));
  return o.join('');
}

/** The grey lab coat, hung by its collar (its own frame: the collar at 0,0). */
export function labCoat() {
  const o = [];
  o.push(fill('M-8,0 L8,0 L13,8 L14,40 L-14,40 L-13,8 Z', '#9EA3A3', 0.9));
  o.push(flat('M3,0 L8,0 L13,8 L14,40 L4,40 Z', '#868B8B'));
  o.push(fill('M-8,0 L0,10 L8,0 L4,0 L0,5 L-4,0 Z', '#B8BCBC', 0.5));
  o.push(line('M0,10 L0,40', '#6E7272', 0.6));
  for (const y of [16, 24, 32]) o.push(dot(1.6, y, 0.9, '#5A5E5E'));
  o.push(rect(-12, 22, 7, 6, '#8E9393', 0.4));
  return o.join('');
}

/** A grey felt fedora, crown up (its own frame: the brim's middle at 0,0). */
export function fedoraGrey() {
  return fill('M-12,0 C-12,-2 12,-2 12,0 C12,2 -12,2 -12,0 Z', '#6E6A64', 0.6)
    + fill('M-7,-1 C-7,-9 -3,-11 0,-9 C3,-11 7,-9 7,-1 Z', '#7E7A72', 0.6)
    + box(-7, -3.2, 14, 1.8, '#3A3632');
}
/** The same hat upside down, its crown down, holding the two folded slips. */
export function fedoraUp() {
  return fill('M-7,1 C-7,9 -3,11 0,9 C3,11 7,9 7,1 Z', '#7E7A72', 0.6)
    + fill('M-12,0 C-12,-2 12,-2 12,0 C12,2 -12,2 -12,0 Z', '#6E6A64', 0.6)
    + fill('M-4,-1 L-1,-5 L2,-2 Z', '#F4F1E6', 0.3) + fill('M0,-1 L3,-4.6 L5,-1.4 Z', '#F4F1E6', 0.3);
}
/** The volunteer's own brown hat (crown up). */
export function fedoraBrown() {
  return fill('M-11,0 C-11,-2 11,-2 11,0 C11,2 -11,2 -11,0 Z', '#6A4A30', 0.6)
    + fill('M-6.5,-1 C-6.5,-8.6 -3,-10.4 0,-8.6 C3,-10.4 6.5,-8.6 6.5,-1 Z', '#7C5A3C', 0.6)
    + box(-6.5, -3, 13, 1.7, '#3A2A1E');
}

const at = (name, fn, view) => ({ name: `milgram1-${name}`, svg: fn, view, box: view });
export const ART = [
  at('office-far', officeFar, { x: 0, y: 214, w: 400, h: 300 }),
  at('office-near', officeNear, { x: 90, y: 426, w: 172, h: 76 }),
  at('lab-far-a', labFarA, { x: 398, y: 214, w: 456, h: 300 }),
  at('lab-far-b', labFarB, { x: 846, y: 214, w: 388, h: 300 }),
  at('lab-near-a', labNearA, { x: 470, y: 396, w: 340, h: 108 }),
  at('lab-near-b', labNearB, { x: 844, y: 396, w: 196, h: 106 }),
  at('cover', cover, { x: 852, y: 412, w: 144, h: 60 }),
  at('paper', paper, { x: -25, y: -17, w: 50, h: 34 }),
  at('coat', labCoat, { x: -15, y: -1, w: 30, h: 42 }),
  at('hat-grey', fedoraGrey, { x: -13, y: -12, w: 26, h: 15 }),
  at('hat-up', fedoraUp, { x: -13, y: -6, w: 26, h: 18 }),
  at('hat-brown', fedoraBrown, { x: -12, y: -11.4, w: 24, h: 14 }),
];
