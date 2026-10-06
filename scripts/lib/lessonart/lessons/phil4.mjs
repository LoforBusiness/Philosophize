// philosophy-foundations-4, "How Do You Know?" — A RAILWAY PLATFORM, drawn (LESSON_RULES
// AM13). Every picture is drawn in SCENE units, so its viewBox is its box and it drops onto
// the stage where the shape-built object it replaces stood. Flat fills lit from the top
// left, a shaded side, one dark outline, the colours the real things are. Zero imports.
//
//   phil4-station   the station behind them: the canopy's fascia and its pointed valance,
//                   the buff stone wall under it with two arched sash windows, the open
//                   end of the platform beyond the canopy (sky, a far hill), and the
//                   PLATFORM 2 board fixed to the wall on two brackets. It replaces the
//                   sign that stood on two posts, which ran through the bench's ends.
//   phil4-clock     the pillar clock, at the old clock's box (180–220 × 350–500)
//   phil4-tunnel    the brick portal at the end of the line (0–64 × 428–500)
//   phil4-bench     the slatted bench with cast-iron ends (71–127 × 472–500)

const INK = '#2B2420';

const fill = (d, c, w = 0.7) => `<path d="${d}" fill="${c}" stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"/>`;
const tone = (d, c, o = 1) => `<path d="${d}" fill="${c}"${o < 1 ? ` opacity="${o}"` : ''}/>`;
const line = (d, c, w) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const circ = (cx, cy, r, c, w = 0.7) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${c}"${w ? ` stroke="${INK}" stroke-width="${w}"` : ''}/>`;
const f = (n) => +n.toFixed(2);

// ── the station behind them ──────────────────────────────────────────────────
// REFERENCES (Commons): "Halifax station, Up platform" — a canopy whose edge is a VALANCE
// of vertical boards cut to points, carried on a painted fascia; "Platform clock, Keighley
// station" — a buff stone wall behind the platform, tall round-headed windows, and the
// railway's signs fixed flat to the wall; "Smitham railway station in 1985" — the platform
// running on past the end of the canopy into the open.
export function station() {
  const SKY = '#DCE8EE', HILL = '#B9CBA8', HILLD = '#A7BB95';
  const WALL = '#E8DCC2', WALLD = '#DACBAB', JOINT = '#DDCFB2';
  const FASCIA = '#3E6A50', FASCIAD = '#2C503B', VAL = '#F1E9D3', VALD = '#D9CDB0';
  const GLASS = '#CFDDE2', GLASSD = '#B9CCD3', FRAME = '#F4EEDF', SILL = '#CBBB98';
  const out = [];
  // the open end of the platform, past the canopy: sky and a far hill
  out.push(`<rect x="0" y="300" width="64" height="200" fill="${SKY}"/>`);
  out.push(tone('M0,420 C14,404 34,398 52,404 C58,406 62,409 64,412 L64,500 L0,500 Z', HILL));
  out.push(tone('M0,430 C16,418 36,414 64,420 L64,500 L0,500 Z', HILLD));
  // the wall, buff stone in courses, the ashlar joints staggered
  out.push(`<rect x="60" y="300" width="340" height="200" fill="${WALL}"/>`);
  for (let y = 330, r = 0; y < 500; y += 8, r += 1) {
    out.push(line(`M60,${y} L400,${y}`, JOINT, 0.45));
    for (let x = 60 + (r % 2 ? 14 : 0); x < 400; x += 28) out.push(line(`M${x},${y} L${x},${y + 8}`, JOINT, 0.4));
  }
  // its plinth along the platform, a course of darker stone
  out.push(`<rect x="60" y="490" width="340" height="10" fill="${WALLD}"/>`);
  out.push(line('M60,490 L400,490', '#F3EBD9', 0.6));
  // the building's corner: long and short quoin stones, a shade proud of the wall
  for (let y = 326, k = 0; y < 490; y += 12, k += 1) out.push(tone(`M60,${y} L${k % 2 ? 66 : 70},${y} L${k % 2 ? 66 : 70},${y + 11} L60,${y + 11} Z`, '#EFE5CE'), line(`M60,${y + 11.3} L${k % 2 ? 66 : 70},${y + 11.3} L${k % 2 ? 66 : 70},${y}`, '#D2C3A2', 0.5));
  out.push(line('M60,311 L60,500', '#C9B894', 0.8));
  // two arched sash windows, one above where each of them stands
  for (const cx of [160, 268]) {
    const l = cx - 15, r = cx + 15, top = 350, foot = 404;
    const arch = `M${l},${foot} L${l},${top} C${l},${top - 20} ${r},${top - 20} ${r},${top} L${r},${foot} Z`;
    // the stone surround, a little proud of the wall
    out.push(fill(`M${l - 3},${foot + 2} L${l - 3},${top} C${l - 3},${top - 24} ${r + 3},${top - 24} ${r + 3},${top} L${r + 3},${foot + 2} Z`, '#EFE6D0', 0.6));
    out.push(fill(arch, GLASS, 0.6));
    // the far half of the glass in shade, and a reflection across it
    out.push(tone(`M${cx},${top - 15} C${r - 4},${top - 14} ${r},${top - 8} ${r},${top} L${r},${foot} L${cx},${foot} Z`, GLASSD));
    out.push(line(`M${l + 4},${top + 10} L${l + 12},${top + 2}`, '#F2F7F8', 1.2));
    // the sash bars: a meeting rail and two uprights, cream
    out.push(line(`M${l},${top + 22} L${r},${top + 22}`, FRAME, 1.6));
    out.push(line(`M${cx},${top - 15} L${cx},${foot}`, FRAME, 1.2));
    out.push(line(`M${l},${top + 22} L${r},${top + 22}`, INK, 0.25));
    // the sill
    out.push(fill(`M${l - 5},${foot + 2} L${r + 5},${foot + 2} L${r + 4},${foot + 5} L${l - 4},${foot + 5} Z`, SILL, 0.6));
  }
  // the canopy over it all: the fascia, and the valance hanging from it, cut to points
  out.push(fill('M58,300 L400,300 L400,311 L58,311 Z', FASCIA, 0.7));
  out.push(tone('M58,308.6 L400,308.6 L400,311 L58,311 Z', FASCIAD));
  out.push(line('M58.5,300.8 L400,300.8', '#5E8A6E', 0.8));
  const boards = [];
  for (let x = 60; x < 400; x += 6) boards.push(`L${x},311 L${x},322 L${x + 3},327 L${x + 6},322`);
  out.push(fill(`M60,311 ${boards.join(' ')} L${60 + Math.ceil(340 / 6) * 6},311 Z`, VAL, 0.6));
  for (let x = 60; x < 400; x += 6) out.push(tone(`M${x + 3},311.4 L${x + 6},311.4 L${x + 6},322 L${x + 3},327 Z`, VALD));
  // the end of the canopy, a bracket turned down
  out.push(fill('M58,300 L61,300 L61,330 C61,333 58,333 58,330 Z', FASCIA, 0.6));
  return out.join('');
}


// ── the PLATFORM 2 board ─────────────────────────────────────────────────────
// REFERENCE: the Keighley photograph — the railway's signs are boards in its colour, white
// letters inside a white rule, fixed FLAT to the station wall on short iron brackets. Its
// own picture so it can answer a tap; its words are the scene's (inside 65–133 × 399–416).
export function sign() {
  const BLUE = '#24487A', BLUED = '#1A365C', WHITE = '#F7F5EE', IRON = '#3B3F43';
  const out = [];
  out.push(line('M72,388 L72,396 M126,388 L126,396', IRON, 1.6));
  out.push(circ(72, 388, 1.3, IRON, 0.4), circ(126, 388, 1.3, IRON, 0.4));
  out.push(tone('M63,398.5 L139,398.5 L139,421.5 L63,421.5 Z', '#CDBD9C'));      // its shadow on the wall
  out.push(fill('M61,396 L137,396 L137,419 L61,419 Z', BLUE, 0.7));
  out.push(tone('M134.6,396.5 L136.6,396.5 L136.6,418.6 L134.6,418.6 Z', BLUED));
  out.push(`<rect x="64" y="398.6" width="70" height="17.8" fill="none" stroke="${WHITE}" stroke-width="0.8"/>`);
  out.push(line('M61.6,396.6 L136.4,396.6', '#3A64A0', 0.7));
  return out.join('');
}

// ── the station's pillar clock ───────────────────────────────────────────────
// REFERENCES (Commons): "Platform clock, Keighley station" — a round double-faced clock
// high on a slim cast-iron post with a spiked finial, the post standing on a square
// cabinet pedestal with a sunk panel and a moulded plinth, all painted maroon; "Clock at
// Wellington railway station" — a cream dial in a deep dark rim, bar markers, the quarters
// heavier, broad black hands. It STOPPED at a quarter past nine last night: the hour hand a
// quarter of the way from nine to ten, the minute hand on the three, the red second hand on
// forty. The dial's centre is (200, 379) and the case's radius 19, as before.
export function clock() {
  const M = '#7A2632', MD = '#581B24', ML = '#A2404C', DIAL = '#F8F2E2', DIALD = '#ECE3CA', GOLD = '#C9A24A';
  const cx = 200, cy = 379;
  const out = [];
  // the plinth, the pedestal and its cap
  out.push(fill('M182,500 L218,500 L217,494 C217,492.4 215.6,491 214,491 L186,491 C184.4,491 183,492.4 183,494 Z', M));
  out.push(tone('M214,491.4 C215.6,491.4 216.6,492.6 216.7,494 L217.6,499.6 L211,499.6 L211,491.4 Z', MD));
  out.push(fill('M186,491 L214,491 L214,471 L186,471 Z', M));
  out.push(tone('M209.5,471.4 L213.6,471.4 L213.6,490.6 L209.5,490.6 Z', MD));
  out.push(fill('M189.5,474.5 L206,474.5 L206,488 L189.5,488 Z', MD, 0.5));      // the sunk panel
  out.push(`<rect x="191" y="476" width="13.5" height="10.5" fill="none" stroke="${GOLD}" stroke-width="0.5"/>`);
  out.push(line('M189.8,487.6 L205.8,487.6', ML, 0.6));                            // its lit lower lip
  out.push(fill('M183.5,471 L216.5,471 L215,466.5 L185,466.5 Z', M));
  out.push(line('M185.4,467.2 L214.6,467.2', ML, 0.6));
  // the post: flared at its foot, two collars, tapering to the case
  out.push(fill('M194,466.5 C196,463 196.8,458 197,452 L197.6,404 L202.4,404 L203,452 C203.2,458 204,463 206,466.5 Z', M));
  out.push(tone('M201,406 L202.4,404 L203,452 C203.2,458 204,463 206,466.5 L202.6,466.5 C201.8,462 201.4,456 201.2,452 Z', MD));
  out.push(line('M198.6,407 L198.4,460', ML, 0.7));
  for (const y of [424, 448]) {
    out.push(fill(`M195.6,${y} L204.4,${y} L204.4,${y + 3} L195.6,${y + 3} Z`, M, 0.5));
    out.push(line(`M196,${y + 0.6} L204,${y + 0.6}`, ML, 0.5));
  }
  // the bracket under the case
  out.push(fill('M193,398 C195,401 197,404 197.6,405 L202.4,405 C203,404 205,401 207,398 Z', M));
  // the finial over it: a spike on a ball on a neck
  out.push(fill('M198.4,361 L201.6,361 L201,357 L199,357 Z', M, 0.5));
  out.push(circ(200, 355.4, 2.4, M, 0.5));
  out.push(fill('M199.3,353.4 L200,349.6 L200.7,353.4 Z', GOLD, 0.35));
  out.push(`<circle cx="199.3" cy="354.6" r="0.8" fill="${ML}"/>`);
  // the case: a deep rim, lit at its top left and shaded at its foot right
  out.push(circ(cx, cy, 19, M, 0.8));
  out.push(tone(`M${cx + 13.4},${cy - 13.4} C${cx + 21},${cy - 4} ${cx + 18},${cy + 14} ${cx + 4},${cy + 18.6} C${cx + 13},${cy + 12} ${cx + 16},${cy - 2} ${cx + 13.4},${cy - 13.4} Z`, MD));
  out.push(line(`M${cx - 16.4},${cy - 6} C${cx - 14},${cy - 13} ${cx - 8},${cy - 17} ${cx - 2},${cy - 17.6}`, ML, 1.1));
  out.push(circ(cx, cy, 16.2, MD, 0.5));                                           // the bezel's inner edge
  out.push(circ(cx, cy, 15, DIAL, 0.5));
  out.push(tone(`M${cx + 10},${cy + 11} C${cx + 15},${cy + 5} ${cx + 15},${cy - 3} ${cx + 13},${cy - 7.5} C${cx + 15.5},${cy + 2} ${cx + 13},${cy + 10} ${cx + 4},${cy + 14.4} C${cx + 6.4},${cy + 13.6} ${cx + 8.6},${cy + 12.4} ${cx + 10},${cy + 11} Z`, DIALD));
  // the minutes, then the hours (the quarters heavier)
  for (let m = 0; m < 60; m += 1) {
    if (m % 5 === 0) continue;
    const a = (m * 6 * Math.PI) / 180;
    out.push(line(`M${f(cx + Math.sin(a) * 13.4)},${f(cy - Math.cos(a) * 13.4)} L${f(cx + Math.sin(a) * 14.2)},${f(cy - Math.cos(a) * 14.2)}`, '#6B625A', 0.3));
  }
  for (let h = 0; h < 12; h += 1) {
    const a = (h * 30 * Math.PI) / 180, q = h % 3 === 0;
    const r0 = q ? 9.8 : 11.2;
    out.push(line(`M${f(cx + Math.sin(a) * r0)},${f(cy - Math.cos(a) * r0)} L${f(cx + Math.sin(a) * 14)},${f(cy - Math.cos(a) * 14)}`, INK, q ? 1.6 : 0.9));
  }
  const hand = (deg, len, tail, w, c) => {
    const a = (deg * Math.PI) / 180, s = Math.sin(a), k = -Math.cos(a);
    return line(`M${f(cx - s * tail)},${f(cy - k * tail)} L${f(cx + s * len)},${f(cy + k * len)}`, c, w);
  };
  out.push(hand(277.5, 7.6, 1.8, 2, INK));                                           // a quarter past nine
  out.push(hand(90, 11.6, 2, 1.3, INK));
  out.push(circ(cx, cy, 1.4, INK, 0));
  // (the red second hand, stopped on forty, is the scene's: it twitches when the clock is chosen)
  // the glass: a sheen across its upper left
  out.push(line(`M${cx - 11},${cy - 4} C${cx - 10},${cy - 8} ${cx - 7},${cy - 11} ${cx - 3},${cy - 12}`, '#FFFFFF', 1.1).replace('/>', ' opacity="0.7"/>'));
  return out.join('');
}

// ── the tunnel at the end of the line ────────────────────────────────────────
// REFERENCES (Commons): "Burdale Tunnel North Portal", "Queensbury tunnel portal",
// "Driving Creek Railway Brick Tunnel Portal": a brick face set into a grassed bank, a
// stone coping along its top, the mouth a round arch whose ring of brick headers stands
// proud of the wall, a keystone at its crown, and inside nothing but dark, deeper toward
// the middle. The mouth's dark runs 16–44 and stands on the rails; the train's lamp lights
// at (30, 482).
export function tunnel() {
  const GRASS = '#8FB06A', GRASSD = '#76955A', BRICK = '#A85A3C', BRICKD = '#8A4630', JOINT = '#93503A';
  const RING = '#94482F', RINGL = '#B66A4A', STONE = '#D7CFBE', STONED = '#B8AE98';
  const out = [];
  // the bank over the portal, grassed, falling away to the right
  out.push(fill('M0,446 L0,434 C8,429 20,427 32,428 C44,429 54,433 64,440 L64,452 Z', GRASS));
  out.push(tone('M30,431 C42,431 54,435 63.4,441 L63.4,451 L44,448 C50,444 44,437 30,431 Z', GRASSD));
  out.push(line('M8,433 L9,430.6 M10,432.6 L11.6,430.2 M40,431 L41,428.8 M43,431.4 L44.6,429.2', GRASSD, 0.6));
  // the brick face, and its wing wall stepping down at the right
  out.push(fill('M0,446 L58,446 L64,454 L64,500 L0,500 Z', BRICK));
  out.push(tone('M58,446.6 L63.6,454 L63.6,499.6 L58,499.6 Z', BRICKD));
  for (let y = 451, r = 0; y < 500; y += 4.2, r += 1) {
    out.push(line(`M0,${f(y)} L${y < 454 ? 58 + (y - 446) * 0.75 : 64},${f(y)}`, JOINT, 0.4));
    for (let x = r % 2 ? 4 : 0; x < 62; x += 8) out.push(line(`M${x},${f(y)} L${x},${f(y + 4.2)}`, JOINT, 0.35));
  }
  // the coping along its top, and down the wing
  out.push(fill('M-1,443 L58.6,443 L65,451.6 L65,455 L57.2,446.6 L-1,446.6 Z', STONE, 0.6));
  out.push(tone('M57.6,446.4 L64.6,454.6 L64.6,451.8 L58.4,443.6 Z', STONED));
  out.push(line('M0,443.6 L58,443.6', '#EFEADF', 0.6));
  // the ring of headers round the arch, a keystone at its crown
  out.push(fill('M10,500 L10,470 C10,443.4 50,443.4 50,470 L50,500 Z', RING));
  for (let k = 0; k <= 12; k += 1) {
    const a = Math.PI - (k * Math.PI) / 12;
    out.push(line(`M${f(30 + Math.cos(a) * 14)},${f(470 - Math.sin(a) * 14)} L${f(30 + Math.cos(a) * 20)},${f(470 - Math.sin(a) * 20)}`, '#7A3B26', 0.45));
  }
  out.push(line('M11.6,468 C12,456 20,450 28,449.4', RINGL, 0.9));
  out.push(fill('M27.4,449.6 L32.6,449.6 L33.4,456.4 L26.6,456.4 Z', STONE, 0.5));
  out.push(line('M10,478 L10,500 M50,478 L50,500', INK, 0.5));
  // the mouth: dark, and deeper toward the middle
  out.push(fill('M16,500 L16,470 C16,451.4 44,451.4 44,470 L44,500 Z', '#2E2A27'));
  out.push(tone('M20,500 L20,472 C20,458 40,458 40,472 L40,500 Z', '#211E1C'));
  out.push(tone('M24,500 L24,476 C24,466 36,466 36,476 L36,500 Z', '#161413'));
  // the rails running in, catching a little light
  out.push(line('M17,500 L25,486 M43,500 L35,486', '#7E8286', 0.9));
  out.push(line('M20,495.6 L40,495.6 M22.4,491.4 L37.6,491.4', '#3E3832', 0.8));
  return out.join('');
}

// ── the platform bench ───────────────────────────────────────────────────────
// REFERENCES (Commons): "GWR and BR(W) Cast Iron Platform Benches, Kemble", "Station
// bench" and "2019 at Charlbury station — GWR bench": two broad slats in the back and two
// in the seat, between cast-iron ends — a back post that leans back, an arm that sweeps
// forward to a scroll, a front leg that curls out into a foot. Seen from the front, each
// end shows its edge as a post with the arm's scroll standing out from it.
export function bench() {
  const IRON = '#2E5A40', IROND = '#21432F', IRONL = '#4A7A5C', WOOD = '#A9733F', WOODD = '#82552D', WOODL = '#C99560';
  const out = [];
  // the back slats, behind the ends' posts
  for (const y of [474.5, 480]) {
    out.push(fill(`M75,${y} L125,${y} L125,${y + 4} L75,${y + 4} Z`, WOOD, 0.6));
    out.push(tone(`M75.4,${y + 2.9} L124.6,${y + 2.9} L124.6,${y + 3.6} L75.4,${y + 3.6} Z`, WOODD));
    out.push(line(`M75.6,${y + 0.7} L124.4,${y + 0.7}`, WOODL, 0.5));
  }
  // the ends: the post, the arm with its scroll, the front leg curling into its foot
  for (const [x, s] of [[76, -1], [124, 1]]) {
    out.push(fill(`M${x - 1.6},472.6 L${x + 1.6},472.6 L${x + 1.6},499.4 L${x - 1.6},499.4 Z`, IRON, 0.6));
    out.push(fill(`M${x},486.6 C${x + s * 3},486.4 ${x + s * 4.4},484.6 ${x + s * 5.2},483.2 C${x + s * 6},481.8 ${x + s * 4.4},480.4 ${x + s * 3.4},481.6 C${x + s * 2.8},482.4 ${x + s * 3.6},483.4 ${x + s * 4.2},482.8 L${x + s * 4.6},484.6 C${x + s * 3.4},486.6 ${x + s * 1.6},488.4 ${x},488.6 Z`, IRON, 0.5));
    out.push(fill(`M${x - 1.4},497.6 C${x + s * 2},497.6 ${x + s * 4.6},497 ${x + s * 5.4},498.4 C${x + s * 5.8},499.6 ${x + s * 4},500.4 ${x + s * 2},500 L${x - 1.6},500 Z`, IRON, 0.5));
    out.push(line(`M${x - 0.6},473.6 L${x - 0.6},497`, IRONL, 0.5));
  }
  // the seat: two slats and their front edge in shade
  out.push(fill('M71.5,487.4 L128.5,487.4 L128.5,491.6 L71.5,491.6 Z', WOOD, 0.6));
  out.push(line('M72,488.2 L128,488.2', WOODL, 0.6));
  out.push(fill('M71.5,491.6 L128.5,491.6 L128,494 L72,494 Z', WOODD, 0.5));
  out.push(line('M100,487.6 L100,491.4', WOODD, 0.4));
  return out.join('');
}

export const ART = [
  { name: 'phil4-station', svg: station, view: { x: 0, y: 300, w: 400, h: 200 }, box: { x: 0, y: 300, w: 400, h: 200 } },
  { name: 'phil4-sign', svg: sign, view: { x: 60, y: 386, w: 80, h: 37 }, box: { x: 60, y: 386, w: 80, h: 37 } },
  { name: 'phil4-clock', svg: clock, view: { x: 180, y: 348, w: 40, h: 152 }, box: { x: 180, y: 348, w: 40, h: 152 } },
  { name: 'phil4-tunnel', svg: tunnel, view: { x: -1, y: 426, w: 66, h: 74 }, box: { x: -1, y: 426, w: 66, h: 74 } },
  { name: 'phil4-bench', svg: bench, view: { x: 70, y: 471, w: 60, h: 30 }, box: { x: 70, y: 471, w: 60, h: 30 } },
];
