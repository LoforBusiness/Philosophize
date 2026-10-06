// economics-foundations-1, "What Is Economics?" — A SATURDAY MARKET STALL, drawn
// (LESSON_RULES AM13). Each picture replaces a shape-built object of the same box, so the
// scene's layout and every hand-off are unchanged. Flat fills lit from the top left, a
// shaded side, one dark outline; real colours. Zero imports.
//
// REFERENCES (scratchpad/ref/, fetched with `npm run ref`):
//   e1stall-3       Shepherd's Bush Market (public domain): a green-and-white striped awning
//                   whose stripes run front to back down its slope, a flat valance along the
//                   front, and green cloths over the trestle tables under it.
//   e1stall-1       a street stall under a striped awning on two posts.
//   econ1-pie3-1    a cherry pie with a lattice top in its glass dish: red filling in squares
//                   between golden strips, a crimped rim; econ1-pie4-1 the same seen side-on,
//                   the crust domed over its tin.
//   econ1-loaf-1    bloomers on a market stall in Epping: a long dome on a flat base, baked
//                   darker on top, slashed across at a slant, dusted with flour.
//   e1bunting-1     cotton bunting: triangles hanging point down from a string that sags.
//   e1threep-1      a twelve-sided brass coin; e1bimet-3 a two-metal coin, a ring round a
//                   disc of the other metal (a pound coin is gold round silver).
//   e1note-1, e1banknote-1   banknotes: a printed border, a portrait in an oval at one end,
//                   the value large in a medallion at the other.
//   e1aboard2-1     a chalkboard sign on a pavement, a wooden frame round the slate.

const INK = '#2B2420';
const fill = (d, c, w) => `<path d="${d}" fill="${c}" stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"/>`;
const tone = (d, c, o = 1) => `<path d="${d}" fill="${c}" opacity="${o}"/>`;
const line = (d, c, w) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const f2 = (v) => (+v).toFixed(2);

// ── the stall's awning and posts: box 200–380 × 340–500 ─────────────────────
// The awning slopes from its back edge (y 344) down to the valance (y 362); its eight
// stripes run down the slope, so each is a quad that widens toward the front. The
// valance hangs in front, scalloped along its foot, its panels green and white by turns.
function stall() {
  const o = '1.1';
  const GREEN = '#2E7D4F', GREENL = '#3C9563', GREEND = '#225E3B';
  const WHITE = '#F4F2EA', WHITED = '#D9D6CB';
  const WOOD = '#8A5A2E', WOODD = '#62401F', WOODL = '#A97646';
  const out = [];
  // the two posts, down to the ground, a shaded right side on each
  for (const x of [209, 371]) {
    out.push(fill(`M${x - 2.8},360 L${x + 2.8},360 L${x + 2.8},499 L${x - 2.8},499 Z`, WOOD, '0.9'));
    out.push(tone(`M${x + 0.8},361 L${x + 2.3},361 L${x + 2.3},498.5 L${x + 0.8},498.5 Z`, WOODD));
    out.push(tone(`M${x - 2.2},361 L${x - 1.3},361 L${x - 1.3},498.5 L${x - 2.2},498.5 Z`, WOODL));
  }
  // the awning's top, sloping down to the front
  const bx0 = 216, bx1 = 364, fx0 = 200, fx1 = 380, by = 344, fy = 362;
  out.push(fill(`M${bx0},${by} L${bx1},${by} L${fx1},${fy} L${fx0},${fy} Z`, WHITE, o));
  const N = 8;
  for (let k = 0; k < N; k++) {
    const a = k / N, z = (k + 1) / N;
    const bA = bx0 + (bx1 - bx0) * a, bZ = bx0 + (bx1 - bx0) * z;
    const fA = fx0 + (fx1 - fx0) * a, fZ = fx0 + (fx1 - fx0) * z;
    const green = k % 2 === 0;
    // lit from the top left: the stripes nearer the lamp are a touch lighter
    const c = green ? (k < 4 ? GREENL : GREEN) : WHITE;
    out.push(tone(`M${f2(bA)},${by} L${f2(bZ)},${by} L${f2(fZ)},${fy} L${f2(fA)},${fy} Z`, c));
  }
  // the fold of the canvas over the front rail, and the shade the slope throws on it
  out.push(tone(`M${fx0},${fy - 2.2} L${fx1},${fy - 2.2} L${fx1},${fy} L${fx0},${fy} Z`, '#000', 0.12));
  out.push(line(`M${bx0},${by} L${bx1},${by} L${fx1},${fy} L${fx0},${fy} Z`, INK, o));
  // the valance: a band of panels, each scalloped at its foot
  const vy = fy, vh = 9, sc = 4.2;
  const pw = (fx1 - fx0) / N;
  for (let k = 0; k < N; k++) {
    const x0 = fx0 + k * pw, x1 = x0 + pw;
    const green = k % 2 === 0;
    const d = `M${f2(x0)},${vy} L${f2(x1)},${vy} L${f2(x1)},${vy + vh} Q${f2((x0 + x1) / 2)},${vy + vh + sc * 2} ${f2(x0)},${vy + vh} Z`;
    out.push(fill(d, green ? GREEN : WHITE, '0.8'));
    // the scallop's lower curve turns away from the lamp
    out.push(tone(`M${f2(x0 + pw * 0.5)},${vy + vh + sc} Q${f2(x0 + pw * 0.8)},${vy + vh + sc * 0.9} ${f2(x1 - 0.4)},${vy + vh + 0.3} L${f2(x1 - 0.4)},${vy + vh - 1.2} Q${f2(x0 + pw * 0.75)},${vy + vh + sc * 0.4} ${f2(x0 + pw * 0.5)},${vy + vh + sc - 1.6} Z`, green ? GREEND : WHITED));
  }
  // the hemmed top of the valance, and its rail
  out.push(tone(`M${fx0 + 1},${vy + 1.2} L${fx1 - 1},${vy + 1.2} L${fx1 - 1},${vy + 2} L${fx0 + 1},${vy + 2} Z`, '#000', 0.18));
  out.push(fill(`M${fx0 - 1.5},${vy - 1.2} L${fx1 + 1.5},${vy - 1.2} L${fx1 + 1.5},${vy + 0.8} L${fx0 - 1.5},${vy + 0.8} Z`, WOODD, '0.6'));
  return out.join('');
}

// ── the counter: a trestle table under a green cloth, box 200–380 × 474–500 ──
// The goods stand on its top at y 477.
function counter() {
  const o = '1';
  const WOOD = '#9C6A3A', WOODL = '#C08C55', WOODD = '#6E4826';
  const CLOTH = '#2F6B4A', CLOTHD = '#24553A', CLOTHL = '#3C7F59';
  const out = [];
  // two trestle feet under the cloth, splayed
  for (const x of [214, 366]) {
    out.push(fill(`M${x - 5},499.5 L${x - 2},494 L${x + 2},494 L${x + 5},499.5 Z`, WOODD, '0.7'));
  }
  // the board's top face, lit, and its front edge
  out.push(fill('M200.5,475 L379.5,475 L379.5,480 L200.5,480 Z', WOOD, o));
  out.push(tone('M201.4,475.7 L378.6,475.7 L378.6,477.3 L201.4,477.3 Z', WOODL));
  // the cloth over the front, falling in soft folds to a little above the ground
  const hem = [];
  for (let k = 0; k <= 12; k++) hem.push([201 + k * (178 / 12), 495.5 + (k % 2 ? 1.1 : 0)]);
  out.push(fill(`M201,478.6 L379,478.6 L379,${f2(hem[12][1])} ${hem.slice().reverse().map(([x, y]) => `L${f2(x)},${f2(y)}`).join(' ')} Z`, CLOTH, o));
  // folds: a shaded crease every so often, the lamp on the left of each
  for (const x of [226, 262, 298, 334, 366]) {
    out.push(tone(`M${x},479.5 C${x + 1.5},486 ${x + 2.5},491 ${x + 3},496 L${x + 6.5},496 C${x + 5},490 ${x + 3},485 ${x + 1.4},479.5 Z`, CLOTHD));
    out.push(tone(`M${x - 4},480 C${x - 3.2},486 ${x - 2.6},491 ${x - 2.2},495.5 L${x - 0.8},495.5 C${x - 1.4},490 ${x - 2.2},485 ${x - 2.6},480 Z`, CLOTHL, 0.8));
  }
  // where the cloth turns over the board's edge, a lit hem
  out.push(line('M201.5,479.6 L378.5,479.6', CLOTHL, '0.9'));
  out.push(line('M201,478.6 L379,478.6', INK, '0.8'));
  return out.join('');
}

// ── the pavement A-board: box 66–170 × 414–500 ──────────────────────────────
// A wooden frame round the slate (the slate itself is the scene's own View, laid at
// 82–154 × 423–474, so the chalk can change), a handle cut through the top rail, two
// front legs splayed to the pavement with the back pair just showing behind them.
function aboard() {
  const o = '1';
  const WOOD = '#A06D3B', WOODL = '#C49058', WOODD = '#74491F', BACK = '#5E3B1A';
  const out = [];
  // the back legs, behind
  out.push(fill('M92,480 L95,480 L99,499.5 L95.5,499.5 Z', BACK, '0.7'));
  out.push(fill('M141,480 L144,480 L140.5,499.5 L137,499.5 Z', BACK, '0.7'));
  // the front legs, splayed
  out.push(fill('M78,478 L84.5,478 L77,499.5 L70,499.5 Z', WOOD, o));
  out.push(fill('M151.5,478 L158,478 L166,499.5 L159,499.5 Z', WOOD, o));
  out.push(tone('M82.6,479 L84,479 L76.6,498.8 L75,498.8 Z', WOODD));
  out.push(tone('M156,479 L157.3,479 L165,498.8 L163.6,498.8 Z', WOODD));
  // the frame, with its top rail raised for the handle
  out.push(fill('M77,420 Q77,415 82,415 L154,415 Q159,415 159,420 L159,481 L77,481 Z', WOOD, o));
  // the shaded right side and foot of the frame, the lit top and left
  out.push(tone('M155.5,418 L158,419.5 L158,480 L155.5,477.5 Z', WOODD));
  out.push(tone('M78,477.5 L158,477.5 L158,480 L78,480 Z', WOODD));
  out.push(tone('M78.6,419.5 Q79,416.4 82.4,416.2 L153,416.2 L152,418 L82.6,418 Q80.4,418.2 80.2,420.4 L80.2,476 L78.6,476 Z', WOODL));
  // the handle cut through the top rail
  out.push(fill('M108,417.2 Q108,416.2 109,416.2 L127,416.2 Q128,416.2 128,417.2 L128,420 Q128,421 127,421 L109,421 Q108,421 108,420 Z', '#3A2814', '0.5'));
  // the slate's recess, dark (the slate View covers its middle)
  out.push(fill('M81.2,422.2 L154.8,422.2 L154.8,474.8 L81.2,474.8 Z', '#2C3134', '0.6'));
  // two brass hinges where the legs meet the frame
  out.push(fill('M84,476.5 L90,476.5 L90,481 L84,481 Z', '#C9A24A', '0.4'));
  out.push(fill('M146,476.5 L152,476.5 L152,481 L146,481 Z', '#C9A24A', '0.4'));
  return out.join('');
}

// ── bunting from the edge of the stage to the stall's post: box -2–214 × 343–369 ─
// The string sags low at x 106 (the scene's own stringY), each pennant hanging by its top
// edge where the string is, its far half turned from the lamp.
function bunting() {
  const SAG = Math.tan((1.6 * Math.PI) / 180);
  const sy = (x) => (x < 106 ? 348.1 + (x - 53) * SAG : 348.1 - (x - 159) * SAG);
  const COL = [['#C0392B', '#962C21'], ['#E0A82E', '#B9861E'], ['#2E7F7A', '#21605C'], ['#F4F1E8', '#D6D1C4']];
  const out = [line(`M-1,${f2(sy(-1))} Q106,${f2(sy(106) + (sy(106) - sy(-1)))} 213,${f2(sy(213))}`, INK, '0.9')];
  for (let k = 0; k < 8; k++) {
    const cx = 18.5 + k * 23;
    const y0 = sy(cx);
    const w = 12.4, h = 13;
    const [c, d] = COL[k % 4];
    const lean = ((k % 3) - 1) * 0.8;           // a breath of wind: not every flag hangs plumb
    out.push(fill(`M${f2(cx - w / 2)},${f2(y0 + 0.4)} L${f2(cx + w / 2)},${f2(y0 + 0.4)} L${f2(cx + lean)},${f2(y0 + h)} Z`, c, '0.55'));
    out.push(tone(`M${f2(cx + 0.6)},${f2(y0 + 0.9)} L${f2(cx + w / 2 - 0.7)},${f2(y0 + 0.9)} L${f2(cx + lean + 0.2)},${f2(y0 + h - 1)} Z`, d));
    // the hem the string runs through
    out.push(line(`M${f2(cx - w / 2)},${f2(y0 + 0.9)} L${f2(cx + w / 2)},${f2(y0 + 0.9)}`, d, '0.8'));
  }
  return out.join('');
}

// ── the cherry pie in its dish (a rider; its foot at y 0): box -18–18 × -21–1 ──
function pie() {
  const o = '0.6';
  const DISH = '#F2EFE7', DISHD = '#D4CFC2';
  const CRUST = '#E2B46C', CRUSTD = '#BE8E47', CRUSTL = '#F1CF8E';
  const CHERRY = '#9B2335', CHERRYD = '#6F1925';
  const out = [];
  // the dish, tapering to its foot, with a lip round its top
  out.push(fill('M-16.6,-7.2 L16.6,-7.2 L12.4,0 L-12.4,0 Z', DISH, o));
  out.push(tone('M6,-6.6 L16,-6.6 L12,-0.6 L6,-0.6 Z', DISHD));
  out.push(fill('M-17.6,-8.6 L17.6,-8.6 Q17.9,-6.8 16.6,-6.6 L-16.6,-6.6 Q-17.9,-6.8 -17.6,-8.6 Z', DISH, '0.5'));
  // the crust's domed side, rising out of the dish
  out.push(fill('M-16.4,-12.6 C-16.4,-9.4 -13,-6.4 0,-6.4 C13,-6.4 16.4,-9.4 16.4,-12.6 L16.4,-12.8 C10,-9 -10,-9 -16.4,-12.8 Z', CRUST, o));
  out.push(tone('M5,-6.6 C12.4,-7 16.2,-9.4 16.3,-12.4 C14,-10.6 11,-9.6 7.4,-9.2 C8,-8.2 7,-7.2 5,-6.6 Z', CRUSTD));
  // the top, seen a little from above: a crimped rim, fluted all the way round
  const rim = [];
  for (let k = 0; k <= 144; k++) {
    const a = (k / 144) * Math.PI * 2;
    const r = 1 + 0.03 * Math.cos(a * 20);
    rim.push(`${f2(16.2 * r * Math.cos(a))},${f2(-13 + 5.8 * r * Math.sin(a))}`);
  }
  out.push(fill(`M${rim.join(' L')} Z`, CRUST, o));
  // the rim's far inside and near outside turned from the lamp
  out.push(tone('M8,-8.2 C12.6,-8.8 15.6,-10.6 16,-12.6 C16.6,-10 13.6,-7.6 8,-7.4 Z', CRUSTD));
  // the filling inside the rim
  out.push(fill('M-13.6,-13.2 C-13.6,-18.1 13.6,-18.1 13.6,-13.2 C13.6,-9 -13.6,-9 -13.6,-13.2 Z', CHERRY, '0.35'));
  out.push(tone('M-12.2,-14.6 C-10,-17 10,-17 12.2,-14.6 C10,-16.2 -10,-16.2 -12.2,-14.6 Z', CHERRYD));
  // the lattice over it: two strips across, three leaning with the dish, red between
  const clip = '<clipPath id="e1pieTop"><path d="M-13.6,-13.2 C-13.6,-18.1 13.6,-18.1 13.6,-13.2 C13.6,-9 -13.6,-9 -13.6,-13.2 Z"/></clipPath>';
  const strips = [];
  for (const [x0, x1] of [[-6.2, -7], [0, 0], [6.2, 7]]) strips.push(`<path d="M${x0 - 0.85},-17.8 L${x0 + 0.85},-17.8 L${x1 + 0.95},-9 L${x1 - 0.95},-9 Z" fill="${CRUST}" stroke="${CRUSTD}" stroke-width="0.3"/>`);
  for (const y of [-14.8, -11.7]) strips.push(`<rect x="-14" y="${y - 0.7}" width="28" height="1.4" fill="${CRUST}" stroke="${CRUSTD}" stroke-width="0.3"/>`);
  out.push(`${clip}<g clip-path="url(#e1pieTop)">${strips.join('')}</g>`);
  // the glaze catching the lamp on the rim's near-left
  out.push(tone('M-14.6,-15.4 C-12,-17.6 -7,-18.4 -3,-18.5 C-7,-17.8 -11.6,-16.8 -14,-15 Z', CRUSTL));
  return out.join('');
}

// ── the bloomer (a rider; its base at y 0): box -17–17 × -15–1 ───────────────
function loaf() {
  const o = '0.6';
  const CRUST = '#C07B35', CRUSTD = '#94571F', TOP = '#A9662A', LIT = '#DDA463', CRUMB = '#F0DDB2', FLOUR = '#F6EEDD';
  const out = [];
  out.push(fill('M-15.6,0 C-17.4,-0.6 -17,-5.6 -14.4,-8.4 C-10.6,-12.8 -4,-14 0.4,-14 C5.4,-14 11.6,-12.6 14.8,-8.6 C17.2,-5.6 17.2,-0.6 15.4,0 Z', CRUST, o));
  // the top, baked darker; the lower right side turned from the lamp
  out.push(tone('M-13,-8.6 C-9,-12.6 -3.6,-13.4 0.4,-13.4 C5,-13.4 10.6,-12.4 13.8,-8.8 C9,-10.6 -8,-10.6 -13,-8.6 Z', TOP));
  out.push(tone('M4,-0.6 C10,-0.8 15,-1 15.4,-0.2 C16.8,-1.6 16.6,-5.8 14.6,-8.4 C15,-5.4 11,-2.2 4,-0.6 Z', CRUSTD));
  out.push(tone('M-14.6,-6.6 C-12.4,-10.4 -7,-12.8 -2,-13 C-6.4,-12 -11,-9.6 -13.2,-6.4 Z', LIT));
  // four scores slashed across at a slant, each open to the pale crumb
  for (let k = 0; k < 4; k++) {
    const x = -9.6 + k * 6.4;
    out.push(fill(`M${f2(x - 1.6)},-5 C${f2(x - 0.6)},-8.4 ${f2(x + 1)},-11 ${f2(x + 2.6)},-12.2 C${f2(x + 2.2)},-10 ${f2(x + 1)},-7.4 ${f2(x - 0.2)},-4.6 Z`, CRUMB, '0.35'));
  }
  // a dusting of flour along the top
  for (const [x, y, r] of [[-6, -11.6, 0.5], [-2.4, -12.6, 0.45], [2.6, -12.4, 0.5], [7, -11.2, 0.4], [-8.8, -9.8, 0.35], [4.8, -10.4, 0.35]]) {
    out.push(`<circle cx="${x}" cy="${y}" r="${r}" fill="${FLOUR}"/>`);
  }
  return out.join('');
}

// ── the orange paperback lying flat (a rider; its foot at y 0): box -15–15 × -13–1 ─
function book() {
  const o = '0.5';
  const COVER = '#D9732A', COVERD = '#AE5A1D', COVERL = '#EC934C', PAGES = '#F3EDDD', PAGESD = '#D8CFBA';
  const out = [];
  // the back cover's edge at the foot, the block of pages, the front cover on top
  out.push(fill('M-14.4,-1.4 L14.4,-1.4 L14.4,0 L-14.4,0 Z', COVERD, '0.4'));
  out.push(fill('M-14,-4.6 L14.2,-4.6 L14.2,-1.3 L-14,-1.3 Z', PAGES, o));
  out.push(line('M-13,-3.5 L13.4,-3.5 M-13,-2.4 L13.4,-2.4', PAGESD, '0.3'));
  out.push(fill('M-12.6,-12.4 L12.6,-12.4 L14.6,-4.5 L-14.6,-4.5 Z', COVER, o));
  // the cover faces the lamp, its spine side in shade
  out.push(tone('M-14.4,-4.9 L-12.6,-12 L-11.2,-12 L-12.8,-4.9 Z', COVERD));
  out.push(tone('M-11,-11.8 L12.2,-11.8 L12.4,-11.2 L-11.2,-11.2 Z', COVERL));
  // the white title panel and the author's line
  out.push(fill('M-7.2,-10.6 L8.6,-10.6 L9.2,-7.6 L-7.6,-7.6 Z', '#FBF8F0', '0.3'));
  out.push(line('M-4.6,-9.1 L6.2,-9.1', INK, '0.7'));
  out.push(line('M-6,-6 L5,-6', COVERD, '0.6'));
  return out.join('');
}

// ── the ten-pound note (a rider; its middle at 0): box -10–10 × -5.5–5.5 ──────
function note() {
  const o = '0.4';
  const BASE = '#E39A52', LIGHT = '#F1C08A', DARK = '#B46E2E', CREAM = '#FBEBD3';
  return [
    fill('M-9.6,-5.1 L9.6,-5.1 L9.6,5.1 L-9.6,5.1 Z', BASE, o),
    // the printed border, and a paler field inside it
    tone('M-8.4,-4 L8.4,-4 L8.4,4 L-8.4,4 Z', LIGHT),
    // the portrait in its oval, at the right-hand end
    `<ellipse cx="4.6" cy="0" rx="3" ry="3.5" fill="${CREAM}" stroke="${DARK}" stroke-width="0.35"/>`,
    tone('M3.2,3.4 C3.2,1.4 3.8,0.4 4.6,0.4 C5.6,0.4 6.2,1.4 6.2,3.4 Z', DARK),
    `<circle cx="4.7" cy="-1.2" r="1.25" fill="${DARK}"/>`,
    // the value, large, in its medallion at the left
    `<circle cx="-4.6" cy="0" r="3.1" fill="${CREAM}" stroke="${DARK}" stroke-width="0.35"/>`,
    `<text x="-4.6" y="1.45" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="4" fill="${DARK}">10</text>`,
    // the fold across the middle catches the lamp on its left half
    line('M0,-4.6 L0,4.6', DARK, '0.25'),
    tone('M-9.2,-4.7 L-0.2,-4.7 L-0.2,-4.2 L-9.2,-4.2 Z', '#FFFFFF', 0.45),
  ].join('');
}

// ── two pound coins of change (a rider; their middle at 0): box -7–7 × -4.5–4.5 ─
// Twelve-sided, a gold ring round a silver centre.
function coins() {
  const GOLD = '#D9AC3C', GOLDD = '#A57E22', SILVER = '#D6D7D2', SILVERD = '#ABADA7';
  const one = (cx, cy, r) => {
    const pts = [];
    for (let k = 0; k < 12; k++) {
      const a = (k / 12) * Math.PI * 2 + Math.PI / 12;
      pts.push(`${f2(cx + r * Math.cos(a))},${f2(cy + r * Math.sin(a))}`);
    }
    return [
      `<path d="M${pts.join(' L')} Z" fill="${GOLD}" stroke="${INK}" stroke-width="0.32" stroke-linejoin="round"/>`,
      // the lower right of the ring turned from the lamp
      tone(`M${f2(cx + r * 0.95)},${f2(cy - r * 0.3)} A${r * 0.98},${r * 0.98} 0 0 1 ${f2(cx - r * 0.3)},${f2(cy + r * 0.95)} L${f2(cx - r * 0.2)},${f2(cy + r * 0.62)} A${r * 0.65},${r * 0.65} 0 0 0 ${f2(cx + r * 0.62)},${f2(cy - r * 0.2)} Z`, GOLDD),
      `<circle cx="${f2(cx)}" cy="${f2(cy)}" r="${f2(r * 0.6)}" fill="${SILVER}" stroke="${GOLDD}" stroke-width="0.22"/>`,
      tone(`M${f2(cx + r * 0.55)},${f2(cy)} A${r * 0.55},${r * 0.55} 0 0 1 ${f2(cx)},${f2(cy + r * 0.55)} L${f2(cx)},${f2(cy + r * 0.3)} A${r * 0.3},${r * 0.3} 0 0 0 ${f2(cx + r * 0.3)},${f2(cy)} Z`, SILVERD),
      `<circle cx="${f2(cx - r * 0.42)}" cy="${f2(cy - r * 0.48)}" r="${f2(r * 0.14)}" fill="#FFF7DA"/>`,
    ].join('');
  };
  return one(2.9, -0.6, 3.5) + one(-2.9, 0.6, 3.5);
}

const at = (x, y, w, h) => ({ view: { x, y, w, h }, box: { x, y, w, h } });

export const ART = [
  { name: 'econ1-stall', svg: stall, ...at(200, 340, 180, 160) },
  { name: 'econ1-counter', svg: counter, ...at(200, 474, 180, 26) },
  { name: 'econ1-aboard', svg: aboard, ...at(66, 414, 104, 86) },
  { name: 'econ1-bunting', svg: bunting, ...at(-2, 343, 216, 26) },
  { name: 'econ1-pie', svg: pie, ...at(-18, -21, 36, 22) },
  { name: 'econ1-loaf', svg: loaf, ...at(-17, -15, 34, 16) },
  { name: 'econ1-book', svg: book, ...at(-15, -13, 30, 14) },
  { name: 'econ1-note', svg: note, ...at(-10, -5.5, 20, 11) },
  { name: 'econ1-coins', svg: coins, ...at(-7, -4.5, 14, 9) },
];
