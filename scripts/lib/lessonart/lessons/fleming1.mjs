// science-penicillin-1 — "The Mould on the Plate" (LESSON_RULES AW5, AM13): Fleming's small
// laboratory at St Mary's Hospital, Paddington, in September 1928; the back room where the
// mould is grown on broth that winter; the Medical Research Club's lecture room, February
// 1929; and the same laboratory at evening.
//
// Every picture is in SCENE units with the band [214, 514], 400 × 300. Flat fills lit from
// the top left, a darker shaded side, one dark outline; real colours, no gradients, no glows.
// A place is laid in ONE WORLD 1200 wide (the lab x 0–400, the back room 400–800, the club
// 800–1200): each place's pictures are drawn in their own 0–400 and placed by `box`.
//
// REFERENCES (npm run ref, scratchpad/ref/fl1*):
//   fl1lab-2  Fleming at his bench at St Mary's (IWM D17801): a bench of dark wood running
//             under TALL steel-framed windows of small panes (three across, four high), the
//             walls pale and plain with a picture rail, a framed picture, stacks of glass
//             Petri dishes in towers on the bench, racks of cotton-plugged test tubes, bottles,
//             a microscope at the end of the bench, drawers in the bench front.
//   fl1lab-1  the Alexander Fleming Laboratory Museum's sign — the famous plate: the mould a
//             round fringed colony near the edge, the Staphylococcus colonies scattered over
//             the rest of the dish as small round domes, and the ones nearest the mould ghosts.
//   fl1staph-1 Staphylococcus aureus on agar: golden-cream round colonies, smooth domes with a
//             lit edge; under the microscope (panel I) purple spheres in irregular clusters
//             like bunches of grapes.
//   fl1penicillium-1 a Penicillium colony: a velvety blue-green centre, a broad white rim.
//   fl1lantern-2 a magic lantern: a black box body, a tall bent chimney, a brass lens tube
//             in front, a slide carrier slotted across between them.

const OUT = '#2B2420';
const f2 = (n) => Number(n.toFixed(2));
const fill = (d, c, w = 1) => `<path d="${d}" fill="${c}" stroke="${OUT}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"/>`;
const flat = (d, c, o = 1) => `<path d="${d}" fill="${c}"${o < 1 ? ` opacity="${o}"` : ''}/>`;
const rect = (x, y, w, h, c, lw = 1, r = 0) => `<rect x="${f2(x)}" y="${f2(y)}" width="${f2(w)}" height="${f2(h)}" rx="${r}" fill="${c}" stroke="${OUT}" stroke-width="${lw}" stroke-linejoin="round"/>`;
const box = (x, y, w, h, c, o = 1) => `<rect x="${f2(x)}" y="${f2(y)}" width="${f2(w)}" height="${f2(h)}" fill="${c}"${o < 1 ? ` opacity="${o}"` : ''}/>`;
const line = (d, c, w) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const circ = (x, y, r, c, lw = 0.8) => `<circle cx="${f2(x)}" cy="${f2(y)}" r="${f2(r)}" fill="${c}" stroke="${OUT}" stroke-width="${lw}"/>`;
const ell = (x, y, rx, ry, c, lw = 0.8) => `<ellipse cx="${f2(x)}" cy="${f2(y)}" rx="${f2(rx)}" ry="${f2(ry)}" fill="${c}" stroke="${OUT}" stroke-width="${lw}"/>`;
const dot = (x, y, r, c, o = 1) => `<circle cx="${f2(x)}" cy="${f2(y)}" r="${f2(r)}" fill="${c}"${o < 1 ? ` opacity="${o}"` : ''}/>`;
const oval = (x, y, rx, ry, c, o = 1) => `<ellipse cx="${f2(x)}" cy="${f2(y)}" rx="${f2(rx)}" ry="${f2(ry)}" fill="${c}"${o < 1 ? ` opacity="${o}"` : ''}/>`;

// a seeded random, so a drawing is the same every bake (the stamp depends on it)
function rng(seed) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

// ── palette ──────────────────────────────────────────────────────────────────
const WALL = '#E6DFC8', WALL_D = '#D3CBB0', DADO = '#8FA08A', DADO_D = '#7A8B75', RAIL = '#B9AE90';
const FRAME = '#3F4542', FRAME_L = '#5A615D';
const BENCH = '#5E3F28', BENCH_L = '#7A5536', BENCH_D = '#462E1C', TOP = '#3E2A1B';
const FLOOR = '#7D5C42', FLOOR_D = '#6A4C35', FLOOR_L = '#8E6C50';
const BRASS = '#C49A3C', BRASS_D = '#9A7428', BLACK = '#2E2C2A', BLACK_L = '#4A4744';
const GLASS = '#D6E9EC', GLASS_D = '#AFCBD0', GLASS_L = '#F2FAFB';
const AGAR = '#EBD79A', AGAR_D = '#D9C27A', AGAR_L = '#F4E6B8';
const STAPH = '#E2AE3A', STAPH_D = '#B8862A', STAPH_L = '#F3D27A';
const MOULD_W = '#F6F4EE', MOULD_G = '#4E8A7C', MOULD_GD = '#3A6E62';
const BROTH = '#E3B93E', BROTH_D = '#C49A2A', BROTH_PALE = '#EFE2B0';
const COTTON = '#F4F1E8';
const BRICK = '#9A5A42', BRICK_D = '#7E4632', MORTAR = '#B88A72', STONE = '#D7CFBE';
const PAPER = '#F3EEDF', PAPER_D = '#D9D1BC', INKLINE = '#7A7466';

// ══════════════════════════════════════════════════════════════════════════════
// PLACE 0 — FLEMING'S LABORATORY, ST MARY'S (world x 0–400)
// ══════════════════════════════════════════════════════════════════════════════

const WIN = { x0: 170, x1: 324, y0: 238, y1: 444 };

/** FAR: Praed Street through the window — a grey London sky, the brick terrace opposite. */
function streetView(eve) {
  const o = [];
  const sky = eve ? ['#3E4A6E', '#6A6688', '#B88A86', '#E7B482'] : ['#A9BCCB', '#B9C9D4', '#C9D5DC', '#D8DFE2'];
  const cut = [0, 0.3, 0.55, 0.78, 1];
  const y0 = 230, h = 120;
  for (let k = 0; k < 4; k++) o.push(box(160, y0 + h * cut[k], 175, h * (cut[k + 1] - cut[k]) + 0.4, sky[k]));
  // the terrace opposite: a long brick front, stone sills, sash windows, a cornice, chimney pots
  const b = eve ? '#5E3E36' : BRICK, bd = eve ? '#4A3029' : BRICK_D;
  o.push(box(160, 336, 175, 114, b));
  for (let y = 340; y < 450; y += 6) o.push(box(160, y, 175, 0.6, eve ? '#6A4A40' : MORTAR, 0.55));
  o.push(box(160, 332, 175, 6, eve ? '#8C8476' : STONE));
  o.push(box(160, 338, 175, 1.4, bd));
  // the slate roof and its chimney stacks, and a far dome against the sky
  o.push(fill('M160,332 L172,306 L324,306 L336,332 Z', eve ? '#3E4252' : '#6E747C', 0.8));
  for (const x of [190, 262]) {
    o.push(rect(x, 286, 18, 22, bd, 0.7));
    for (const dx of [3, 9, 15]) o.push(rect(x + dx - 1.6, 280, 3.2, 7, eve ? '#6E6A62' : '#B0745A', 0.4));
  }
  o.push(flat('M300,306 C300,288 318,286 322,306 Z', eve ? '#4A5068' : '#9AAAB8'));
  for (const [x, y] of [[176, 350], [216, 350], [256, 350], [296, 350], [176, 400], [216, 400], [256, 400], [296, 400]]) {
    const lit = eve && (x + y) % 3 !== 0;
    o.push(rect(x, y, 22, 34, lit ? '#F2C66E' : (eve ? '#2E3242' : '#4C5560'), 0.6));
    o.push(box(x + 10.4, y, 1.2, 34, eve ? '#3A2A22' : '#E8E4DA'));
    o.push(box(x, y + 16, 22, 1.2, eve ? '#3A2A22' : '#E8E4DA'));
    o.push(box(x - 2, y + 34, 26, 2.6, eve ? '#8C8476' : STONE));
    if (!lit) o.push(box(x + 1, y + 1, 9, 14, eve ? '#3E4458' : '#6F7C88', 0.8));
  }
  // a gas lamp on the pavement
  o.push(box(312, 400, 2.4, 50, eve ? '#2A2A2A' : '#3A3A38'));
  o.push(fill('M307,396 L319,396 L317,406 L309,406 Z', eve ? '#F2C66E' : '#D9D2BC', 0.6));
  return o.join('');
}
export function labFar() { return streetView(false); }
export function labFarEve() { return streetView(true); }

/** A London omnibus's top deck, seen over the sill as it passes (its own frame, centred). */
export function bus() {
  const o = [];
  o.push(rect(-34, -16, 68, 18, '#B3312A', 0.9, 3));
  o.push(box(-32, -14, 64, 2, '#D8574C'));
  for (let x = -28; x < 30; x += 11) o.push(rect(x, -11, 8, 7, '#CFDCE2', 0.5, 1));
  o.push(rect(-30, 2, 60, 6, '#E8DEC4', 0.6));
  o.push(fill('M-12,3.2 L12,3.2 L12,6.8 L-12,6.8 Z', '#B3312A', 0));
  return o.join('');
}

/** The laboratory itself (behind the people): the walls, the tall window, the door's frame and the corridor, a shelf, the bench and what lives on it, the floor. */
export function lab() {
  const o = [];
  // the walls: pale cream above the picture rail and the dado, a grey-green dado below
  // (cut round the window, so the street shows through its panes)
  o.push(`<defs><mask id="fl1win"><rect x="0" y="200" width="400" height="320" fill="white"/><rect x="${WIN.x0}" y="${WIN.y0}" width="${WIN.x1 - WIN.x0}" height="${WIN.y1 - WIN.y0}" fill="black"/></mask></defs><g mask="url(#fl1win)">`);
  o.push(box(0, 214, 400, 250, WALL));
  o.push(box(0, 214, 400, 10, WALL_D));
  o.push(box(0, 286, 400, 2.4, RAIL));
  o.push(box(0, 288, 400, 1, '#A39878'));
  o.push(box(0, 420, 400, 44, DADO));
  o.push(box(0, 420, 400, 2, DADO_D));
  o.push('</g>');
  // the window: a deep reveal, then a dark steel frame of small panes, three across, four high (panes open: the street shows through)
  o.push(box(WIN.x0 - 8, WIN.y0 - 6, WIN.x1 - WIN.x0 + 16, 6, WALL_D));
  const panes = [];
  const cw = (WIN.x1 - WIN.x0) / 3, ch = (WIN.y1 - WIN.y0) / 4;
  let frame = `M${WIN.x0 - 5},${WIN.y0 - 2} L${WIN.x1 + 5},${WIN.y0 - 2} L${WIN.x1 + 5},${WIN.y1 + 2} L${WIN.x0 - 5},${WIN.y1 + 2} Z`;
  for (let c = 0; c < 3; c++) for (let r = 0; r < 4; r++) {
    const x = WIN.x0 + c * cw + 2.2, y = WIN.y0 + r * ch + 2.2, w = cw - 4.4, h = ch - 4.4;
    panes.push(`M${f2(x)},${f2(y)} L${f2(x + w)},${f2(y)} L${f2(x + w)},${f2(y + h)} L${f2(x)},${f2(y + h)} Z`);
  }
  o.push(`<path d="${frame} ${panes.join(' ')}" fill="${FRAME}" fill-rule="evenodd" stroke="${OUT}" stroke-width="1"/>`);
  // the lit edge of each glazing bar, and a stay with its hook (the reference's hinged pane)
  for (let c = 1; c < 3; c++) o.push(box(WIN.x0 + c * cw - 2.2, WIN.y0, 1, WIN.y1 - WIN.y0, FRAME_L));
  for (let r = 1; r < 4; r++) o.push(box(WIN.x0, WIN.y0 + r * ch - 2.2, WIN.x1 - WIN.x0, 1, FRAME_L));
  o.push(line(`M${WIN.x1 - 22},${WIN.y0 + ch * 2 + 8} L${WIN.x1 - 8},${WIN.y0 + ch * 2 + 26}`, '#2A2D2B', 1.4));
  // the sill
  o.push(rect(WIN.x0 - 10, WIN.y1 + 2, WIN.x1 - WIN.x0 + 20, 6, '#C9C0A4', 0.8));
  // the number painted over the window, as in the photograph
  o.push(`<text x="${(WIN.x0 + WIN.x1) / 2}" y="${WIN.y0 - 10}" font-family="Georgia, serif" font-size="9" fill="#5A5446" text-anchor="middle">9</text>`);
  // the door's frame on the left and the dark corridor behind it (the door leaf is the scene's)
  o.push(box(14, 318, 46, 182, '#4E463A'));
  o.push(box(14, 318, 46, 30, '#3E372D'));
  // stairs going down in the corridor (the mould lab is downstairs)
  for (let k = 0; k < 5; k++) o.push(box(16 + k * 8, 466 + k * 6, 44 - k * 8, 2, '#6A6050'));
  o.push(rect(8, 312, 58, 6, '#B49C74', 0.8));
  o.push(rect(8, 312, 6, 190, '#B49C74', 0.8));
  o.push(rect(60, 312, 6, 190, '#B49C74', 0.8));
  // a framed picture (the reference has two: a portrait and a chart of plates)
  o.push(rect(96, 236, 30, 38, '#3A2E24', 1));
  o.push(rect(100, 240, 22, 30, '#E9E4D4', 0.5));
  o.push(oval(111, 252, 5, 6, '#8C8270'));
  o.push(box(105, 258, 12, 9, '#8C8270'));
  o.push(line('M111,236 L104,226 L118,226 Z', '#3A2E24', 0.8));
  // a wall shelf with bottles: brown, blue, a clear one with a ground stopper
  o.push(rect(78, 374, 74, 4, BENCH_L, 0.8));
  o.push(line('M84,378 L90,386 M146,378 L140,386', BENCH_D, 1.4));
  for (const [x, c, h] of [[86, '#7A4A26', 22], [98, '#2F5A8A', 18], [110, '#7A4A26', 26], [124, '#CFE3E6', 20], [138, '#2F5A8A', 16]]) {
    o.push(rect(x - 4.5, 374 - h, 9, h, c, 0.7, 1.5));
    o.push(rect(x - 2, 374 - h - 5, 4, 5, c === '#CFE3E6' ? '#E8F2F3' : '#3A2A1E', 0.5, 1));
    if (c !== '#CFE3E6') o.push(rect(x - 3.4, 374 - h * 0.6, 6.8, 6, PAPER, 0.4));
  }
  // the floor: dark boards meeting the wall behind the bench
  o.push(box(0, 462, 400, 52, FLOOR));
  for (let y = 470; y < 514; y += 8) o.push(box(0, y, 400, 1, FLOOR_D));
  for (const [x, y] of [[30, 470], [120, 478], [210, 470], [300, 478], [80, 486], [250, 494], [360, 486], [160, 502], [330, 502]]) o.push(box(x, y, 1, 8, FLOOR_D));
  // the door's sill over the boards
  o.push(box(8, 498, 58, 3, '#9C8460'));
  // THE BENCH: a dark wooden top on a front of drawers, x 72–398, its top at 462 (hip high)
  o.push(rect(72, 458, 328, 7, TOP, 1));
  o.push(box(74, 459, 324, 1.6, BENCH_L));
  o.push(rect(76, 465, 320, 33, BENCH, 1));
  o.push(box(78, 467, 316, 2, BENCH_D));
  for (const x of [80, 160, 240, 320]) {
    o.push(rect(x + 3, 470, 70, 11, BENCH_L, 0.6));
    o.push(rect(x + 34, 474, 8, 3, BRASS, 0.4, 1.2));
    o.push(box(x + 3, 484, 70, 13, BENCH_D));
  }
  // on the bench, left to right: papers and a notebook; the manuscript; a Bunsen burner; the
  // microscope; a rack of cotton-plugged tubes and a jar of wire loops
  o.push(fill('M132,458 L156,455 L160,458 Z', PAPER, 0.6));
  o.push(fill('M226,458 L232,452 L252,453 L250,458 Z', PAPER_D, 0.6));
  // the manuscript: a fat stack of foolscap tied with string
  o.push(rect(276, 438, 30, 20, PAPER, 1, 1));
  for (let y = 442; y < 458; y += 2.6) o.push(box(277, y, 28, 0.6, PAPER_D));
  o.push(rect(274, 436, 34, 3, '#E6DCC2', 0.8));
  o.push(box(290, 436, 1.4, 22, '#9C6A3A'));
  o.push(box(274, 446, 34, 1.2, '#9C6A3A'));
  // the Bunsen burner and its red rubber hose
  o.push(ell(322, 456.5, 7, 2.4, '#5A5856', 0.7));
  o.push(rect(319.6, 434, 4.8, 22, '#8C8A86', 0.7, 1));
  o.push(rect(318.6, 448, 6.8, 4, '#6E6C68', 0.6));
  o.push(line('M328,456 C334,456 336,462 332,466', '#A63A2E', 2.2));
  // THE MICROSCOPE: a black horseshoe foot, a brass pillar and stage, the arm, the tube, the eyepiece
  // the horseshoe foot, the pillar, the square stage, the C-shaped arm behind, and the
  // upright brass tube with its objective below and its eyepiece on top
  o.push(fill('M338,458 L368,458 C368,454 364,451 358,451 L348,451 C342,451 338,454 338,458 Z', BLACK, 1));
  o.push(rect(357, 434, 5, 17, BLACK_L, 0.8));
  o.push(fill('M360,436 C370,430 372,412 364,400 L360,402 C366,412 365,428 357,433 Z', BLACK, 0.9));
  o.push(rect(338, 434, 26, 3.4, BLACK_L, 0.8));
  o.push(rect(343, 402, 8, 26, BRASS, 0.9, 1));
  o.push(box(344.4, 403, 1.8, 24, '#E5C46A'));
  o.push(rect(344.5, 427, 5, 5, BLACK, 0.6));
  o.push(rect(342, 395, 10, 7, BLACK_L, 0.8, 1.5));
  o.push(rect(350, 412, 10, 4, BLACK, 0.6, 1));
  o.push(circ(361, 414, 2.6, BRASS_D, 0.6));
  // the rack of tubes, plugged with cotton wool, a jar of wire loops
  o.push(rect(372, 446, 24, 12, BENCH_L, 0.8));
  for (let k = 0; k < 4; k++) {
    const x = 375 + k * 5.4;
    o.push(rect(x, 428, 3.6, 22, GLASS, 0.5, 1.6));
    o.push(box(x + 0.5, 440 + (k % 2) * 3, 2.6, 9 - (k % 2) * 3, k % 2 ? AGAR : '#E9C76E'));
    o.push(oval(x + 1.8, 428, 2.6, 2.6, COTTON));
  }
  o.push(rect(372, 446, 24, 4, BENCH, 0.6));
  return o.join('');
}

/** The door leaf, hinged at its left edge (its own frame: the hinge at x 0, the leaf 46 wide, 180 high, the foot at y 0). */
export function door() {
  const o = [];
  o.push(rect(0, -182, 46, 182, '#8E6A44', 1));
  o.push(box(1, -181, 44, 2, '#A57E54'));
  o.push(rect(6, -172, 34, 62, '#7E5C3A', 0.7));
  o.push(rect(10, -168, 26, 40, '#D9E7EA', 0.6));
  o.push(box(22.4, -168, 1.2, 40, '#7E5C3A'));
  o.push(rect(6, -96, 34, 80, '#7E5C3A', 0.7));
  o.push(circ(39, -92, 2.4, BRASS, 0.6));
  o.push(rect(9, -150, 28, 9, PAPER, 0.4));
  return o.join('');
}

/** His small leather suitcase (its own frame: standing on y 0, centred). */
export function suitcase() {
  const o = [];
  o.push(rect(-15, -20, 30, 20, '#8A5A34', 1, 2));
  o.push(box(-14, -19, 28, 2, '#A8723F'));
  o.push(box(-15, -11, 30, 1.6, '#6A4426'));
  for (const x of [-10, 10]) o.push(rect(x - 1.6, -21, 3.2, 21, '#5E3C22', 0.5));
  o.push(fill('M-5,-20 C-5,-26 5,-26 5,-20 L3,-20 C3,-23.5 -3,-23.5 -3,-20 Z', '#3E2A1A', 0.6));
  o.push(rect(-12, -16, 6, 4, '#E8DCC0', 0.4));
  return o.join('');
}

/** The shallow enamel tray of Lysol: white enamel with a blue rim, the cleaning fluid in it (its own frame: standing on y 0, 44 wide). */
export function tray() {
  const o = [];
  o.push(fill('M-22,-9 L22,-9 L19,0 L-19,0 Z', '#F2F1EC', 1));
  o.push(flat('M10,-9 L22,-9 L19,0 L8,0 Z', '#D9D8D2'));
  o.push(rect(-23, -11, 46, 2.6, '#2F4E80', 0.8, 1.2));
  o.push(oval(0, -8.4, 20.5, 1.4, '#C9A86A', 0.9));
  o.push(box(-14, -8.8, 8, 0.6, '#E8D6A6'));
  o.push(rect(-4, -6, 8, 3.4, '#2F4E80', 0.3, 0.8));
  return o.join('');
}
/** The tray's near lip, drawn over the dishes in it (the fluid's surface line and the front wall). */
export function trayFront() {
  const o = [];
  o.push(fill('M-21.2,-7.8 L21.2,-7.8 L19,0 L-19,0 Z', '#F2F1EC', 1));
  o.push(flat('M10,-7.8 L21.2,-7.8 L19,0 L8,0 Z', '#D9D8D2'));
  o.push(rect(-4, -5.2, 8, 3, '#2F4E80', 0.3, 0.8));
  o.push(box(-20, -7.8, 40, 1.1, '#C9A86A', 0.85));
  return o.join('');
}

// ── the Petri dish, seen from above (a lens shows it large) ───────────────────

/** A dish seen from above, on a 100 × 100 frame centred on 0: the glass rim, the agar. */
function dishBase(o) {
  o.push(circ(0, 0, 48, GLASS_D, 1.4));
  o.push(circ(0, 0, 45, GLASS, 0.6));
  o.push(circ(0, 0, 42.6, AGAR, 0.6));
  // the light from the top left on the jelly, and a highlight on the glass rim
  o.push(flat('M-36,-20 C-30,-34 -16,-40 -2,-41 C-18,-36 -28,-28 -33,-16 Z', AGAR_L, 0.9));
  o.push(flat('M-40,-22 C-34,-36 -20,-44 -6,-46 C-22,-41 -32,-33 -37,-21 Z', GLASS_L));
  o.push(flat('M30,30 C36,22 40,12 41,2 C42,14 38,26 30,33 Z', AGAR_D, 0.6));
}
/** One golden Staphylococcus colony: a dome with a lit edge (a ghost: see-through, dissolved). */
function colony(o, x, y, r, ghost = false) {
  if (ghost) {
    o.push(`<circle cx="${f2(x)}" cy="${f2(y)}" r="${f2(r)}" fill="#FFF6D6" fill-opacity="0.55" stroke="${STAPH_D}" stroke-width="0.4" stroke-dasharray="1 0.8"/>`);
    return;
  }
  o.push(circ(x, y, r, STAPH, 0.45));
  o.push(dot(x - r * 0.3, y - r * 0.3, r * 0.45, STAPH_L));
  o.push(flat(`M${f2(x + r * 0.2)},${f2(y + r * 0.85)} A${f2(r)},${f2(r)} 0 0 0 ${f2(x + r * 0.85)},${f2(y + r * 0.2)} L${f2(x + r * 0.55)},${f2(y + r * 0.2)} A${f2(r * 0.7)},${f2(r * 0.7)} 0 0 1 ${f2(x + r * 0.2)},${f2(y + r * 0.55)} Z`, STAPH_D, 0.7));
}
/** The Penicillium mould: a fringed white rim round a blue-green velvet centre. */
function mould(o, x, y, r) {
  const n = 22;
  let d = '';
  for (let k = 0; k <= n; k++) {
    const a = (k / n) * Math.PI * 2;
    const rr = r * (k % 2 ? 0.86 : 1.04);
    d += `${k ? 'L' : 'M'}${f2(x + rr * Math.cos(a))},${f2(y + rr * Math.sin(a))} `;
  }
  o.push(fill(d + 'Z', MOULD_W, 0.6));
  o.push(circ(x, y, r * 0.62, MOULD_G, 0.4));
  o.push(dot(x - r * 0.16, y - r * 0.18, r * 0.3, '#6FA898'));
  for (const [dx, dy] of [[0.3, 0.2], [-0.25, 0.3], [0.1, -0.35]]) o.push(dot(x + dx * r, y + dy * r, r * 0.09, MOULD_GD));
}
/** Where the colonies are on a plate (a seeded scatter inside the jelly, clear of `avoid`). */
function scatter(seed, n, avoid) {
  const R = rng(seed);
  const pts = [];
  let guard = 0;
  while (pts.length < n && guard++ < 4000) {
    const a = R() * Math.PI * 2, d = Math.sqrt(R()) * 38;
    const x = d * Math.cos(a), y = d * Math.sin(a), r = 1.7 + R() * 1.9;
    if (pts.some((p) => Math.hypot(p.x - x, p.y - y) < p.r + r + 1.6)) continue;
    if (avoid && Math.hypot(avoid.x - x, avoid.y - y) < avoid.r + r) continue;
    pts.push({ x, y, r });
  }
  return pts;
}
export const MOULD_AT = { x: -22, y: -24, r: 12 };
/** The colonies that grow on b3 (the scene pops them up one by one), as [x, y, r] on the 100-frame. */
export const COLONIES = scatter(7, 30).map((p) => [f2(p.x), f2(p.y), f2(p.r)]);
/** An empty dish of agar (b2, b3: the scene grows the colonies on it). */
export function dishEmpty() { const o = []; dishBase(o); return o.join(''); }
/** A dish golden all over with colonies (Q1, a normal plate). */
export function dishFull() {
  const o = []; dishBase(o);
  for (const p of scatter(11, 70)) colony(o, p.x, p.y, p.r);
  return o.join('');
}
/** A dish with a mould at its edge and the colonies growing right up to it (Q1, a mould that kills nothing). */
export function dishUpTo() {
  const o = []; dishBase(o);
  const m = { x: 24, y: 22, r: 10 };
  for (const p of scatter(23, 62, { x: m.x, y: m.y, r: m.r + 1 })) colony(o, p.x, p.y, p.r);
  mould(o, m.x, m.y, m.r);
  return o.join('');
}
/** THE PLATE: the mould near the edge, a clear zone round it, ghost colonies at its border, golden ones beyond. */
const RING_R = 31;
function ringPlate(o, cleared) {
  dishBase(o);
  const m = MOULD_AT;
  for (const p of scatter(41, 72, { x: m.x, y: m.y, r: m.r + 2 })) {
    const d = Math.hypot(p.x - m.x, p.y - m.y);
    if (!cleared) colony(o, p.x, p.y, p.r);
    else if (d < RING_R - 7) continue;
    else colony(o, p.x, p.y, p.r, d < RING_R);
  }
  mould(o, m.x, m.y, m.r);
}
export function dishRing() { const o = []; ringPlate(o, true); return o.join(''); }
export const RING = { x: MOULD_AT.x, y: MOULD_AT.y, r: RING_R };

/** A dish of agar seen side-on, cut through (b2's lens): the lid, the jelly, the glass. */
export function dishSection() {
  const o = [];
  o.push(circ(0, 0, 48, '#F7F4EA', 0));
  o.push('<g transform="scale(0.9)">');
  // the base: a shallow glass dish
  o.push(fill('M-42,4 L-42,20 C-42,23 -40,24 -37,24 L37,24 C40,24 42,23 42,20 L42,4 L39,4 L39,20 L-39,20 L-39,4 Z', GLASS_D, 1));
  // the agar: a thin layer of jelly in the bottom
  o.push(fill('M-39,12 L39,12 L39,20 L-39,20 Z', AGAR, 0.7));
  o.push(box(-38, 12.2, 76, 1.4, AGAR_L));
  // golden colonies sitting on the jelly
  for (const x of [-26, -8, 14, 28]) o.push(fill(`M${x - 4},12 C${x - 4},8 ${x + 4},8 ${x + 4},12 Z`, STAPH, 0.5));
  // the lid, a size larger, resting over the base
  o.push(fill('M-46,-6 L-46,8 L-43,8 L-43,-3 L43,-3 L43,8 L46,8 L46,-6 Z', GLASS, 1));
  o.push(box(-44, -5, 40, 1, GLASS_L));
  o.push('</g>');
  return o.join('');
}

/** The microscope's field (b4's lens): Staphylococcus, stained purple, in clusters like grapes. */
export function staphField() {
  const o = [];
  o.push(circ(0, 0, 48, '#EFF1D8', 0));
  const R = rng(5);
  const centres = [[-22, -18], [12, -26], [26, 4], [-6, 8], [-28, 18], [8, 30], [-34, -2], [32, -18]];
  for (const [cx, cy] of centres) {
    const n = 5 + Math.floor(R() * 5);
    for (let k = 0; k < n; k++) {
      const a = R() * Math.PI * 2, d = R() * 6.4;
      const x = cx + d * Math.cos(a), y = cy + d * Math.sin(a);
      o.push(circ(x, y, 3.1, '#5B3C8E', 0.4));
      o.push(dot(x - 0.9, y - 0.9, 1.1, '#8A6CC0'));
    }
  }
  return o.join('');
}

// ══════════════════════════════════════════════════════════════════════════════
// PLACE 1 — THE BACK ROOM, WINTER 1928 (world x 400–800; drawn in its own 0–400)
// ══════════════════════════════════════════════════════════════════════════════

/** A flat-bottomed flask of broth with a white felt of mould on top (its own frame: the foot at y 0, centred). */
function brothFlask(o, x, y, w, pale = false) {
  const h = w * 0.62;
  o.push(fill(`M${x - w / 2},${y} L${x + w / 2},${y} L${x + w / 2},${y - h * 0.62} C${x + w / 2},${y - h * 0.86} ${x + w * 0.16},${y - h * 0.8} ${x + w * 0.12},${y - h} L${x - w * 0.12},${y - h} C${x - w * 0.16},${y - h * 0.8} ${x - w / 2},${y - h * 0.86} ${x - w / 2},${y - h * 0.62} Z`, GLASS, 0.8));
  o.push(box(x - w / 2 + 1, y - h * 0.5, w - 2, h * 0.5 - 1, pale ? BROTH_PALE : BROTH));
  o.push(box(x - w / 2 + 1, y - h * 0.5, w - 2, 1.2, pale ? '#F6EED0' : '#F0D06A'));
  // the felt of mould riding on the broth: white, with blue-green patches
  o.push(fill(`M${x - w / 2 + 1},${y - h * 0.5} C${x - w * 0.3},${y - h * 0.66} ${x + w * 0.3},${y - h * 0.66} ${x + w / 2 - 1},${y - h * 0.5} Z`, MOULD_W, 0.5));
  o.push(oval(x - w * 0.12, y - h * 0.55, w * 0.1, h * 0.05, MOULD_G));
  o.push(oval(x + w * 0.16, y - h * 0.54, w * 0.07, h * 0.04, MOULD_G));
  o.push(rect(x - w * 0.12, y - h - 3.4, w * 0.24, 4, COTTON, 0.5, 1));
  o.push(flat(`M${x - w / 2 + 2},${y - h * 0.6} L${x - w / 2 + 4},${y - h * 0.6} L${x - w / 2 + 4},${y - 3} L${x - w / 2 + 2},${y - 3} Z`, GLASS_L));
}
export function backRoom() {
  const o = [];
  // the walls: white-glazed tiles to the dado, distemper above
  o.push(box(0, 214, 400, 250, '#DCD8C6'));
  o.push(box(0, 214, 400, 10, '#C9C4AE'));
  o.push(box(0, 380, 400, 84, '#EDEDE6'));
  for (let y = 386; y < 464; y += 8) o.push(box(0, y, 400, 0.6, '#C9CCC4'));
  for (let y = 380, r = 0; y < 464; y += 8, r++) for (let x = (r % 2) * 7; x < 400; x += 14) o.push(box(x, y, 0.6, 8, '#C9CCC4'));
  o.push(box(0, 378, 400, 3, '#4E7A6A'));
  // a small window, winter: a grey sky, snow on the roofs, frost in the corners
  o.push(box(214, 248, 92, 104, '#B9C2C8'));
  o.push(fill('M214,318 L240,300 L262,316 L262,352 L214,352 Z', '#8C7A6E', 0.6));
  o.push(fill('M214,318 L240,300 L262,316 L258,318 L240,305 L218,320 Z', '#F4F6F6', 0.4));
  o.push(fill('M262,326 L290,312 L306,322 L306,352 L262,352 Z', '#7A6A60', 0.6));
  o.push(fill('M262,326 L290,312 L306,322 L302,324 L290,316 L266,328 Z', '#F4F6F6', 0.4));
  o.push(box(276, 296, 5, 18, '#6A5A50'));
  o.push(`<path d="M210,244 L310,244 L310,356 L210,356 Z M216,250 L258,250 L258,298 L216,298 Z M262,250 L304,250 L304,298 L262,298 Z M216,302 L258,302 L258,350 L216,350 Z M262,302 L304,302 L304,350 L262,350 Z" fill="${FRAME}" fill-rule="evenodd" stroke="${OUT}" stroke-width="1"/>`);
  for (const [x, y] of [[216, 250], [262, 250], [216, 302], [262, 302]]) o.push(flat(`M${x},${y} L${x + 12},${y} C${x + 6},${y + 3} ${x + 3},${y + 6} ${x},${y + 12} Z`, '#F2F6F7', 0.85));
  o.push(rect(206, 356, 108, 5, '#C9C0A4', 0.8));
  // a snow line on the outer sill
  o.push(box(216, 347, 42, 3, '#F4F6F6'));
  // TALL SHELVES of flasks on the left, the mould growing on broth in every one
  o.push(rect(6, 250, 128, 214, '#7A5A3C', 1));
  o.push(box(10, 254, 120, 206, '#5E4430'));
  for (const y of [300, 346, 392, 438]) {
    o.push(rect(6, y, 128, 5, '#8E6C4A', 0.8));
    for (const [x, w] of [[30, 30], [66, 30], [102, 30]]) if (!(y === 438 && x === 102)) brothFlask(o, x, y, w, false);
  }
  // a gas pendant from the ceiling
  o.push(box(165, 214, 1.6, 40, '#3A3A38'));
  o.push(fill('M156,254 L176,254 L172,264 L160,264 Z', '#D9D2BC', 0.7));
  // THE INCUBATOR: a copper-sided cabinet with a glass door and a thermometer, behind the bench
  o.push(rect(140, 372, 62, 92, '#B8743E', 1, 2));
  o.push(box(142, 374, 6, 88, '#D08C52'));
  o.push(rect(150, 382, 42, 50, '#3E3A34', 0.8));
  for (const y of [396, 414]) o.push(box(152, y, 38, 1.4, '#8C8A84'));
  for (const x of [158, 172]) o.push(rect(x, 404, 9, 9, GLASS, 0.4));
  o.push(box(184, 418, 6, 12, BROTH));
  o.push(rect(166, 358, 4, 16, '#E8ECEC', 0.5, 2));
  o.push(box(167.2, 362, 1.6, 11, '#B3312A'));
  o.push(circ(194, 444, 4, BRASS, 0.6));
  // the floor
  o.push(box(0, 462, 400, 52, '#7A6A5A'));
  for (let x = 0; x < 400; x += 20) for (let y = 462, r = 0; y < 514; y += 13, r++) o.push(rect(x + (r % 2) * 10, y, 20, 13, r % 2 ? '#857464' : '#76665A', 0.3));
  // THE BENCH, x 136–316, its top at 460
  o.push(rect(136, 456, 182, 7, TOP, 1));
  o.push(box(138, 457, 178, 1.6, BENCH_L));
  o.push(rect(140, 463, 174, 35, BENCH, 1));
  for (const x of [144, 230]) {
    o.push(rect(x, 468, 80, 12, BENCH_L, 0.6));
    o.push(rect(x + 36, 472, 8, 3, BRASS, 0.4, 1.2));
    o.push(box(x, 484, 80, 13, BENCH_D));
  }
  // the filter stand on the bench: a heavy foot, a rod, a ring holding a glass funnel, and the collecting flask under it
  o.push(rect(166, 451, 30, 5, '#3A3836', 0.8, 1));
  o.push(rect(169, 396, 3.2, 56, '#6E6C68', 0.6, 1));
  o.push(line('M171,418 L184,418', '#4A4846', 2));
  o.push(fill('M176,412 L198,412 L190,424 L190,432 L186,432 L186,424 Z', GLASS, 0.8));
  o.push(box(178, 412.5, 18, 1.2, GLASS_L));
  o.push(fill('M174,456 L202,456 L198,446 L192,442 L192,434 L184,434 L184,442 L178,446 Z', GLASS, 0.8));
  o.push(box(177, 448, 2, 6, GLASS_L, 0.8));
  // the dilution rack: four tubes of juice, each paler than the last
  o.push(rect(262, 446, 40, 10, BENCH_L, 0.8));
  for (let k = 0; k < 4; k++) {
    const x = 266 + k * 9;
    const c = ['#E3B93E', '#EAC965', '#F0D98E', '#F4E7B8'][k];
    o.push(rect(x, 424, 5, 30, GLASS, 0.5, 2));
    o.push(box(x + 0.6, 436, 3.8, 16, c));
    o.push(oval(x + 2.5, 424, 3.2, 3, COTTON));
  }
  o.push(rect(262, 446, 40, 4, BENCH, 0.6));
  // THE RABBIT HUTCH on the floor, x 332–398 (the rabbit is the scene's; its wire front is drawn over it)
  o.push(rect(332, 446, 66, 54, '#9C7448', 1));
  o.push(box(334, 448, 62, 4, '#B48A5A'));
  o.push(box(338, 456, 54, 38, '#5A4430'));
  o.push(fill('M338,494 L392,494 L392,488 C380,484 352,484 338,488 Z', '#D8C68A', 0.4));
  o.push(rect(330, 442, 70, 5, '#7E5A36', 0.8));
  return o.join('');
}
/** The hutch's wire front and its frame, over the rabbit (scene's local 0–400). */
export function hutchFront() {
  const o = [];
  o.push(`<path d="M332,446 L398,446 L398,500 L332,500 Z M338,456 L392,456 L392,494 L338,494 Z" fill="#9C7448" fill-rule="evenodd" stroke="${OUT}" stroke-width="1"/>`);
  for (let x = 343; x < 392; x += 5.5) o.push(box(x, 456, 0.5, 38, '#8C8C88', 0.9));
  for (let y = 461; y < 494; y += 5.5) o.push(box(338, y, 54, 0.5, '#8C8C88', 0.9));
  o.push(rect(362, 470, 3, 8, '#4A4846', 0.4, 1));
  return o.join('');
}
/** A white rabbit, sitting, facing left (its own frame: standing on y 0, centred). */
export function rabbit() {
  const o = [];
  o.push(fill('M-12,0 C-16,-2 -17,-10 -12,-15 C-6,-20 8,-19 13,-12 C16,-7 15,-1 11,0 Z', '#F4F2EC', 0.8));
  o.push(flat('M2,-18 C8,-17 13,-12 14,-6 C15,-2 13,0 11,0 L4,0 C8,-6 6,-14 2,-18 Z', '#DCD8CE'));
  o.push(fill('M-14,-14 C-19,-15 -21,-20 -18,-24 C-14,-27 -8,-25 -7,-20 C-7,-16 -10,-13 -14,-14 Z', '#F4F2EC', 0.8));
  o.push(dot(-16.4, -20, 1.2, '#C2405A'));
  o.push(dot(-20.6, -18.6, 0.8, '#D88C9A'));
  o.push(fill('M14,-6 C18,-6 19,-2 15,-1 Z', '#FFFFFF', 0.5));
  return o.join('');
}
/** The rabbit's two ears, pivoting at their root (its own frame: the root at 0,0). */
export function rabbitEars() {
  return fill('M-2,0 C-4,-6 -4,-14 -1,-17 C1,-14 1,-6 1,0 Z', '#F4F2EC', 0.7)
    + flat('M-1.6,-2 C-2.6,-7 -2.4,-12 -1,-14 C0,-12 0,-7 -0.2,-2 Z', '#E8B4BE')
    + fill('M1,0 C2,-6 4,-12 7,-14 C8,-10 5,-4 3,0 Z', '#E4E0D6', 0.7);
}
/** A white mouse, sitting up a little, facing left (its own frame: on y 0, centred). */
export function mouse() {
  const o = [];
  o.push(line('M5,-1 C10,0 12,-4 10,-7', '#E2A8B0', 0.9));
  o.push(fill('M-7,0 C-9,-2 -9,-5 -6,-7 C-2,-9 4,-8 6,-4 C7,-1 5,0 2,0 Z', '#F4F2EC', 0.6));
  o.push(fill('M-6,-6 C-9,-6 -12,-4 -12,-3 C-10,-2 -8,-2 -6,-3 Z', '#F4F2EC', 0.5));
  o.push(circ(-5, -7.6, 2, '#F0D2D6', 0.4));
  o.push(dot(-9, -4.6, 0.7, '#C2405A'));
  return o.join('');
}
/** The glass jar the mouse sits in, with a gauze top (drawn over him; its own frame: on y 0). */
export function jar() {
  const o = [];
  o.push(`<path d="M-11,0 L11,0 L11,-20 C11,-22 9,-22 8,-22 L-8,-22 C-9,-22 -11,-22 -11,-20 Z" fill="${GLASS}" fill-opacity="0.35" stroke="${OUT}" stroke-width="0.8"/>`);
  o.push(rect(-9, -25, 18, 3.4, '#E8E2D2', 0.6, 1));
  o.push(box(-9, -2, 18, 2, '#D8C68A'));
  o.push(flat('M-9,-19 L-7,-19 L-7,-3 L-9,-3 Z', GLASS_L, 0.9));
  return o.join('');
}
/** A flask of broth in a hand (its own frame: the foot at y 0, centred) — fresh and gone pale. */
export function flask() { const o = []; brothFlask(o, 0, 0, 22, false); return o.join(''); }
export function flaskPale() { const o = []; brothFlask(o, 0, 0, 22, true); return o.join(''); }
/** A flask cut away (b11's lens): the felt of mould on top, the yellow juice under it. */
export function flaskSection() {
  const o = [];
  o.push(circ(0, 0, 48, '#F5F1E4', 0));
  o.push('<g transform="translate(0,3) scale(0.82)">');
  o.push(fill('M-38,34 L38,34 L38,-4 C38,-16 14,-14 10,-28 L10,-38 L-10,-38 L-10,-28 C-14,-14 -38,-16 -38,-4 Z', GLASS, 1.2));
  o.push(box(-37, 4, 74, 29, BROTH));
  o.push(box(-37, 4, 74, 2, '#F0D06A'));
  for (const [x, y] of [[-20, 20], [8, 26], [24, 14], [-4, 12]]) o.push(dot(x, y, 1.2, '#F0D06A'));
  // the felt: thick, white, wrinkled, blue-green on top
  o.push(fill('M-37,5 C-30,-6 -18,-3 -8,-6 C2,-9 14,-4 24,-7 C30,-8 36,-3 37,5 Z', MOULD_W, 0.8));
  o.push(fill('M-28,-1 C-20,-6 -10,-4 -2,-6 C6,-8 14,-4 20,-5 C14,-2 4,-3 -4,-1 C-14,1 -22,-1 -28,-1 Z', MOULD_G, 0.4));
  o.push(rect(-9, -42, 18, 6, COTTON, 0.6, 2));
  o.push('</g>');
  return o.join('');
}
/** THE TRENCH PLATE (b12–b14's lens): a trench cut down the agar near the left, full of yellow mould juice. Streaks are the scene's. */
export function trenchPlate() {
  const o = [];
  dishBase(o);
  o.push(fill('M-30,-31 L-22,-31 L-22,31 L-30,31 Z', '#D9C27A', 0.7));
  o.push(fill('M-29,-29 L-23,-29 L-23,29 L-29,29 Z', BROTH, 0.4));
  o.push(box(-29, -29, 2, 58, '#F0D06A'));
  return o.join('');
}
/** The same plate small, lying on the bench (side-on, foreshortened; its own frame: on y 0, centred). */
export function benchPlate() {
  const o = [];
  o.push(ell(0, -2.4, 16, 3.8, GLASS_D, 0.8));
  o.push(ell(0, -3, 14.4, 3, AGAR, 0.5));
  o.push(box(-10, -5.4, 3, 4.6, BROTH));
  return o.join('');
}

// ══════════════════════════════════════════════════════════════════════════════
// PLACE 2 — THE MEDICAL RESEARCH CLUB, FEBRUARY 1929 (world x 800–1200; own 0–400)
// ══════════════════════════════════════════════════════════════════════════════

const OAK = '#7A5232', OAK_L = '#946640', OAK_D = '#5C3C24';
/** A bentwood chair in profile, facing right (its back on the left), standing on y 500. */
function chair(o, x) {
  o.push(line(`M${x - 11},500 L${x - 9},485 M${x + 11},500 L${x + 9},485`, '#3E2A1A', 2.2));
  o.push(line(`M${x - 6},500 L${x - 5},486`, '#2E1E12', 1.6));
  o.push(rect(x - 13, 482, 26, 4.4, '#6A4426', 0.9, 1.4));
  o.push(line(`M${x - 11},483 C${x - 13},470 ${x - 14},456 ${x - 12},446`, '#3E2A1A', 2.4));
  o.push(fill(`M${x - 15},446 C${x - 14},442 ${x - 10},441 ${x - 9},445 L${x - 10},460 L${x - 13},460 Z`, '#6A4426', 0.7));
}
export const CHAIRS = [64, 110, 156, 202];
export function club() {
  const o = [];
  // the walls: deep green paper above, oak panelling below, a moulded rail between
  o.push(box(0, 214, 400, 250, '#3E5A4A'));
  for (let x = 6; x < 400; x += 16) o.push(box(x, 214, 1, 180, '#46634F'));
  o.push(rect(-2, 388, 404, 8, OAK_L, 0.9));
  o.push(box(0, 396, 400, 68, OAK));
  for (let x = 4; x < 400; x += 50) {
    o.push(rect(x + 4, 402, 40, 54, OAK_D, 0.7, 1.5));
    o.push(box(x + 6, 404, 36, 2, OAK_L));
  }
  // a tall window on the right, a winter evening outside, the curtains drawn back
  o.push(box(330, 238, 56, 120, '#2E3A58'));
  o.push(dot(372, 258, 4, '#E8E4D4'));
  o.push(fill('M330,330 L346,322 L360,330 L372,318 L386,326 L386,358 L330,358 Z', '#1E2638', 0));
  o.push(`<path d="M326,234 L390,234 L390,362 L326,362 Z M332,240 L356,240 L356,298 L332,298 Z M360,240 L384,240 L384,298 L360,298 Z M332,302 L356,302 L356,356 L332,356 Z M360,302 L384,302 L384,356 L360,356 Z" fill="#E8E0CC" fill-rule="evenodd" stroke="${OUT}" stroke-width="1"/>`);
  o.push(fill('M318,230 L334,230 C330,270 332,320 330,372 L318,372 Z', '#8E2E2A', 0.9));
  o.push(fill('M382,230 L398,230 L398,372 L386,372 C384,320 386,270 382,230 Z', '#8E2E2A', 0.9));
  o.push(rect(314, 226, 88, 5, '#C9A23A', 0.7, 2));
  // a portrait of a founder in a gilt frame, over the chairs
  o.push(rect(30, 244, 40, 50, '#C9A23A', 1));
  o.push(rect(35, 249, 30, 40, '#3A2A22', 0.5));
  o.push(oval(50, 264, 7, 8, '#C9A27E'));
  o.push(fill('M38,289 C40,276 60,276 62,289 Z', '#1E1A18', 0.4));
  o.push(box(46, 266, 8, 2, '#E8E0D0'));
  // THE SCREEN: a white sheet hung from a roller, the lantern's picture is the scene's
  o.push(rect(112, 238, 196, 6, '#3A2A1E', 0.8, 2));
  o.push(rect(118, 244, 184, 128, '#F4F2EA', 0.9));
  o.push(box(120, 246, 4, 124, '#E4E1D6'));
  o.push(rect(116, 370, 188, 4, '#3A2A1E', 0.7, 2));
  // the floor: a worn red carpet over boards
  o.push(box(0, 464, 400, 50, OAK_D));
  o.push(box(0, 478, 400, 36, '#8A3A30'));
  for (let x = 6; x < 400; x += 22) o.push(box(x, 486, 10, 1.2, '#A24A3C', 0.8));
  o.push(box(0, 478, 400, 1.6, '#6E2A22'));
  // the chairs, a row facing the speaker
  for (const x of CHAIRS) chair(o, x);
  // THE LANTERN on a low table at the back on the left: a black body, a bent chimney, a brass lens
  o.push(rect(2, 466, 30, 6, OAK_L, 0.8));
  o.push(line('M6,472 L6,500 M28,472 L28,500', OAK_D, 2.2));
  o.push(rect(6, 444, 22, 22, BLACK, 1, 1.5));
  o.push(box(7, 445, 3, 20, BLACK_L));
  o.push(fill('M13,444 L13,430 C13,424 19,422 22,426 L20,428 C18,426 17,428 17,430 L17,444 Z', BLACK, 0.8));
  o.push(rect(28, 450, 8, 10, BRASS, 0.8, 1.5));
  o.push(rect(35, 448.6, 3, 12.8, BRASS_D, 0.6, 1));
  o.push(rect(4, 452, 26, 6, '#8E2E2A', 0.6));
  return o.join('');
}
/** The reading desk in front of the speaker (drawn over him): hip high, a sloped rest on top (own frame: on y 0, centred). */
export function desk() {
  const o = [];
  o.push(rect(-24, -32, 48, 32, OAK, 1, 1));
  o.push(box(-22, -30, 3, 28, OAK_L));
  o.push(rect(-20, -26, 40, 22, OAK_D, 0.7, 1));
  o.push(fill('M-26,-36 L26,-42 L26,-36 L-26,-32 Z', OAK_L, 0.9));
  o.push(box(-26, -32.4, 52, 1, OAK_D));
  o.push(rect(-26, -2, 52, 3, OAK_D, 0.8));
  return o.join('');
}
/** The lantern's beam, from its lens across the room to the screen (scene's local 0–400). */
export function beam() {
  return '<path d="M38,451 L38,459 L150,356 L150,256 Z" fill="#FFF3CC"/>';
}
/** THE LANTERN SLIDE on the screen: the trench plate, grown, in a photograph's greys. */
export function slide() {
  const o = [];
  o.push(box(-60, -50, 120, 100, '#2A2622'));
  o.push(circ(0, 0, 44, '#7A766E', 1));
  o.push(circ(0, 0, 40, '#BDB6A6', 0.4));
  o.push(box(-28, -28, 7, 56, '#8C8576'));
  // the three streaks: the top one stopping short, the others to the trench
  for (const [y, x0] of [[-14, -6], [0, -20], [14, -20]]) {
    for (let x = 36; x > x0; x -= 3.4) o.push(dot(x, y + ((x * 7) % 3) * 0.4 - 0.4, 2.1, '#F2EEE2', 1));
  }
  o.push(box(-60, -50, 120, 3, '#1A1714'));
  return o.join('');
}

// ══════════════════════════════════════════════════════════════════════════════
// THE EVENING (rest beat): the bell jar over the plate
// ══════════════════════════════════════════════════════════════════════════════

/** A glass bell jar with a knob, standing over the dish on the bench (own frame: on y 0, centred). */
export function bellJar() {
  const o = [];
  o.push(`<path d="M-15,0 L-15,-18 C-15,-28 -8,-32 0,-32 C8,-32 15,-28 15,-18 L15,0 Z" fill="${GLASS}" fill-opacity="0.32" stroke="${OUT}" stroke-width="0.9"/>`);
  o.push(circ(0, -34, 2.6, GLASS_D, 0.7));
  o.push(flat('M-11,-20 C-11,-26 -7,-29 -3,-30 C-7,-27 -9,-24 -9,-18 L-9,-4 L-11,-4 Z', GLASS_L, 0.9));
  o.push(ell(0, -1.6, 12, 2.6, GLASS_D, 0.6));
  o.push(ell(0, -2, 10, 1.9, AGAR, 0.4));
  o.push(dot(-5, -2.2, 1.4, MOULD_W));
  return o.join('');
}

const FULL = { x: 0, y: 214, w: 400, h: 300 };
const D100 = { x: -50, y: -50, w: 100, h: 100 };
const on = (x) => ({ x, y: 214, w: 400, h: 300 });
const at = (name, svg, view, box = view) => ({ name: `fleming1-${name}`, svg, view, box });
export const ART = [
  at('street', labFar, { x: 160, y: 230, w: 175, h: 220 }),
  at('street-eve', labFarEve, { x: 160, y: 230, w: 175, h: 220 }),
  at('bus', bus, { x: -36, y: -18, w: 72, h: 28 }),
  at('lab', lab, FULL),
  at('door', door, { x: -1, y: -183, w: 48, h: 184 }),
  at('suitcase', suitcase, { x: -16, y: -27, w: 32, h: 28 }),
  at('tray', tray, { x: -24, y: -12, w: 48, h: 13 }),
  at('tray-front', trayFront, { x: -22, y: -9, w: 44, h: 10 }),
  at('dish-empty', dishEmpty, D100),
  at('dish-full', dishFull, D100),
  at('dish-upto', dishUpTo, D100),
  at('dish-ring', dishRing, D100),
  at('dish-section', dishSection, D100),
  at('staph-field', staphField, D100),
  at('back', backRoom, FULL, on(400)),
  at('hutch-front', hutchFront, { x: 330, y: 444, w: 70, h: 58 }, { x: 730, y: 444, w: 70, h: 58 }),
  at('rabbit', rabbit, { x: -22, y: -28, w: 40, h: 29 }),
  at('rabbit-ears', rabbitEars, { x: -5, y: -18, w: 13, h: 19 }),
  at('mouse', mouse, { x: -13, y: -10, w: 26, h: 11 }),
  at('jar', jar, { x: -12, y: -26, w: 24, h: 27 }),
  at('flask', flask, { x: -12, y: -18, w: 24, h: 19 }),
  at('flask-pale', flaskPale, { x: -12, y: -18, w: 24, h: 19 }),
  at('flask-section', flaskSection, D100),
  at('trench-plate', trenchPlate, D100),
  at('bench-plate', benchPlate, { x: -17, y: -7, w: 34, h: 8 }),
  at('club', club, FULL, on(800)),
  at('desk', desk, { x: -27, y: -43, w: 54, h: 45 }),
  at('beam', beam, { x: 36, y: 254, w: 116, h: 207 }, { x: 836, y: 254, w: 116, h: 207 }),
  at('slide', slide, { x: -60, y: -50, w: 120, h: 100 }),
  at('bell-jar', bellJar, { x: -16, y: -38, w: 32, h: 39 }),
];
