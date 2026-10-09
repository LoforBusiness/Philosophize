// business-amazon-1 — "Cadabra in the Garage" (LESSON_RULES AW5, AM13): an office high up
// in Midtown Manhattan at night (1994), an old Chevy Blazer on the interstate across the
// plains at dusk (with a close-up of the road atlas on its dashboard), and a two-car garage
// in Bellevue in the autumn.
//
// Every picture is in SCENE units with the band [214, 514], 400 × 300. Flat fills lit from
// the top left, a darker shaded side, one dark outline; real colours, no gradients, no glows.
//
// REFERENCES (npm run ref, scratchpad/ref/am1*):
//   am1nyc-2     "Manhattan from Weehawken": Midtown at night is a crowd of dark slabs of
//                every height, their windows a scatter of warm yellow points (most rows half
//                lit), the Empire State Building taller than all of them with its lit top
//                stepping in and its mast, and red beacons on the masts.
//   am1chrysler-2 "Chrysler Building at night": the crown is a stack of arches shrinking
//                upward, each ring set with triangular windows lit white, under a needle.
//   am1dotmatrix-3 "fan-fold paper": pale paper with broad green bars across it and a strip
//                of round sprocket holes down each edge, folded in a zigzag stack.
//   am1blazer-1/2 a square-body Chevrolet K5 Blazer: a tall slab-sided box with a long flat
//                hood, an upright windscreen, a big door window, a long rear side window over
//                the cargo bay, round-cornered wheel arches, a chrome bumper at each end and a
//                trim strip along the flank; two-tone, the roof and upper body one colour and
//                the flanks another.
//   am1hwy-1     "Interstate 80, Wyoming": a two-lane blacktop with a dashed centre line,
//                pale golden grass running to low hills, wire fences on thin posts.
//   am1usa-2     "Blank US Map (states only)": the outline traced for the road atlas.
//   am1rain-2    "Seattle": Mount Rainier is a broad white cone, far bigger than the city,
//                above blue hills and the water of the Sound.
//   am1stove-3   "PotbellyStove": a round iron belly between a flat top with a collar and a
//                square base on four bowed legs, a door with a round draught in its belly, a
//                flue pipe up and over.
//   am1saw-1     "Sawhorse": a top beam on two pairs of splayed legs, raw pale pine.
//   am1gd-1      "Garage door opener": a sectional door of raised panels on side tracks, the
//                opener motor hung from the ceiling on its rail, raw taped drywall.
//   am1sun-1     "Sun SPARCstation 5": a flat beige pizza box with grey end caps, a CRT on it.
//   am1tp-1      laptops of the early 1990s: black slabs with a thick bezel round a small
//                grey-blue screen.

const OUT = '#2A2220';
const f2 = (n) => Number(n.toFixed(2));
const P = (pts) => 'M' + pts.map(([x, y]) => `${f2(x)},${f2(y)}`).join(' L') + ' Z';
const fill = (d, c, w = 1) => `<path d="${d}" fill="${c}" stroke="${OUT}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"/>`;
const flat = (d, c, o = 1) => `<path d="${d}" fill="${c}"${o < 1 ? ` opacity="${o}"` : ''}/>`;
const rect = (x, y, w, h, c, lw = 1, r = 0) => `<rect x="${f2(x)}" y="${f2(y)}" width="${f2(w)}" height="${f2(h)}" rx="${r}" fill="${c}" stroke="${OUT}" stroke-width="${lw}" stroke-linejoin="round"/>`;
const box = (x, y, w, h, c, o = 1) => `<rect x="${f2(x)}" y="${f2(y)}" width="${f2(w)}" height="${f2(h)}" fill="${c}"${o < 1 ? ` opacity="${o}"` : ''}/>`;
const line = (d, c, w, o = 1) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"${o < 1 ? ` opacity="${o}"` : ''}/>`;
const circ = (x, y, r, c, lw = 0.8) => `<circle cx="${f2(x)}" cy="${f2(y)}" r="${f2(r)}" fill="${c}" stroke="${OUT}" stroke-width="${lw}"/>`;
const ell = (x, y, rx, ry, c, lw = 0.8) => `<ellipse cx="${f2(x)}" cy="${f2(y)}" rx="${f2(rx)}" ry="${f2(ry)}" fill="${c}" stroke="${OUT}" stroke-width="${lw}"/>`;
const dot = (x, y, r, c, o = 1) => `<circle cx="${f2(x)}" cy="${f2(y)}" r="${f2(r)}" fill="${c}"${o < 1 ? ` opacity="${o}"` : ''}/>`;
const text = (x, y, s, size, c, anchor = 'start', weight = 700, family = 'Arial, Helvetica, sans-serif', ls = 0) =>
  `<text x="${f2(x)}" y="${f2(y)}" font-family="${family}" font-size="${size}" font-weight="${weight}" fill="${c}" text-anchor="${anchor}"${ls ? ` letter-spacing="${ls}"` : ''}>${s}</text>`;
function rng(seed) {
  let s = seed;
  return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
}

// ══════════════════════════════════════════════════════════════════════════════
// PLACE 0 — D. E. SHAW, MIDTOWN MANHATTAN, A NIGHT IN 1994
// ══════════════════════════════════════════════════════════════════════════════
//
// The window wall runs x 62–328 (y 230–446); the glass door is in the frosted partition at
// the left (x 6–58); the right wall (328–400) carries a clock and the cork board (336–398,
// y 392–440). The desk is x 150–318 (top 456, hip high), the empty bookcase x 340–404 (top
// 460; book rows standing on 480 and 498). Feet at 500.

const NIGHT_SKY = ['#0D1430', '#152044', '#1F2C55', '#2E3866'];
const TOWER = ['#1B1F33', '#22263C', '#262B45', '#1E2236', '#2A2F4A'];
const LIT = ['#F3D58A', '#E9C46A', '#F6E2A8', '#C9D9EA'];

/** One Manhattan tower: a slab with lit windows, setbacks, perhaps a mast and beacon. */
function tower(o, r, x, top, w, c, opts = {}) {
  const base = 470;
  o.push(rect(x, top, w, base - top, c, 0.6));
  o.push(box(x + w * 0.62, top + 0.5, w * 0.38 - 0.5, base - top - 1, '#000000', 0.18));
  if (opts.setback) {
    const [sw, sh] = opts.setback;
    o.push(rect(x + (w - sw) / 2, top - sh, sw, sh, c, 0.6));
  }
  // the windows: rows of points, about half lit
  const cols = Math.max(2, Math.floor((w - 4) / 4));
  for (let yy = top + 4; yy < base - 4; yy += 5) {
    for (let k = 0; k < cols; k++) {
      if (r() < (opts.lit ?? 0.45)) {
        const c2 = LIT[Math.floor(r() * (r() < 0.85 ? 3 : 4))];
        o.push(box(x + 2.5 + k * ((w - 5) / cols), yy, 1.6, 2.2, c2));
      }
    }
  }
}

/** FAR: the night sky and Midtown — the Empire State Building, the Chrysler crown. */
export function city() {
  const o = [];
  const h = 300, bands = [0, 0.3, 0.55, 0.78, 1];
  for (let k = 0; k < 4; k++) o.push(box(0, 214 + h * bands[k], 400, h * (bands[k + 1] - bands[k]) + 0.3, NIGHT_SKY[k]));
  // the city's own glow low on the sky, flat bands
  o.push(box(0, 384, 400, 30, '#3B3F6E', 0.7));
  o.push(box(0, 404, 400, 20, '#4A4675', 0.6));
  const r = rng(7);
  // a few stars that beat the city light
  for (let k = 0; k < 16; k++) o.push(dot(r() * 400, 236 + r() * 70, 0.5 + r() * 0.4, '#DDE3F2', 0.5 + r() * 0.4));
  // far towers, low and hazed
  for (let x = 60; x < 340; x += 9) {
    const tp = 392 + r() * 30;
    o.push(box(x, tp, 9.4, 470 - tp, '#2C3152'));
    for (let yy = tp + 3; yy < 450; yy += 6) if (r() < 0.4) o.push(box(x + 2 + r() * 4, yy, 1.2, 1.6, '#D9C27E', 0.8));
  }
  // THE EMPIRE STATE BUILDING (centre left): slab, setbacks, the lit crown, the mast
  {
    const cx = 132;
    o.push(rect(cx - 15, 330, 30, 140, '#20243A', 0.7));
    o.push(rect(cx - 11, 312, 22, 20, '#20243A', 0.6));
    o.push(rect(cx - 7, 298, 14, 15, '#262A40', 0.6));
    // the lit top: three steps of floodlit white over gold
    o.push(rect(cx - 6, 284, 12, 15, '#F4E6B4', 0.6));
    o.push(rect(cx - 4.4, 272, 8.8, 13, '#F7EDC6', 0.5));
    o.push(rect(cx - 2.8, 262, 5.6, 11, '#FAF3D8', 0.5));
    o.push(box(cx + 1.5, 284.5, 4, 14, '#D9C27E'));
    o.push(box(cx + 1, 272.5, 3, 12, '#E2CC8C'));
    // the mast
    o.push(rect(cx - 1.1, 236, 2.2, 27, '#9AA0AE', 0.4));
    o.push(line(`M${cx},236 L${cx},226`, '#9AA0AE', 0.8));
    const r2 = rng(31);
    for (let yy = 336; yy < 466; yy += 5) for (let k = 0; k < 6; k++) if (r2() < 0.5) o.push(box(cx - 13 + k * 4.6, yy, 1.6, 2.2, LIT[Math.floor(r2() * 3)]));
    for (let yy = 316; yy < 330; yy += 5) for (let k = 0; k < 4; k++) if (r2() < 0.5) o.push(box(cx - 9 + k * 5, yy, 1.6, 2.2, LIT[0]));
  }
  // THE CHRYSLER BUILDING (right): shaft, the arched crown with its lit triangles, the needle
  {
    const cx = 262;
    o.push(rect(cx - 13, 362, 26, 108, '#23273D', 0.7));
    o.push(rect(cx - 10, 344, 20, 19, '#262A42', 0.6));
    // seven arches, each narrower, the steel crown
    for (let k = 0; k < 6; k++) {
      const w = 18 - k * 2.6, y = 344 - k * 8;
      o.push(fill(`M${cx - w / 2},${y} L${cx - w / 2},${y - 3} C${cx - w / 2},${y - 9} ${cx + w / 2},${y - 9} ${cx + w / 2},${y - 3} L${cx + w / 2},${y} Z`, '#B9BFCA', 0.5));
      for (let j = -2; j <= 2; j++) {
        const tx = cx + j * w * 0.18;
        if (Math.abs(j * w * 0.18) < w / 2 - 1.5) o.push(flat(P([[tx - 1, y - 1], [tx + 1, y - 1], [tx, y - 4.6]]), '#FFFBEA'));
      }
    }
    o.push(fill(`M${cx - 2},${296} L${cx + 2},${296} L${cx},${268} Z`, '#C9CED7', 0.5));
    const r3 = rng(53);
    for (let yy = 366; yy < 466; yy += 5) for (let k = 0; k < 5; k++) if (r3() < 0.5) o.push(box(cx - 11 + k * 4.6, yy, 1.6, 2.2, LIT[Math.floor(r3() * 3)]));
  }
  // nearer towers of every height, with their window points
  const near = [[64, 360, 34, 0, null], [100, 404, 20, 1, null], [152, 372, 30, 2, [16, 10]], [184, 396, 26, 3, null],
    [210, 352, 30, 4, [18, 14]], [282, 380, 28, 0, null], [306, 340, 26, 1, [14, 16]]];
  for (const [x, top, w, c, sb] of near) tower(o, r, x, top, w, TOWER[c], { setback: sb });
  // a water tower on a low roof, as New York roofs have
  o.push(fill('M190,396 L190,386 C190,382 200,382 200,386 L200,396 Z', '#3B2E2A', 0.5));
  o.push(fill('M189,387 L195,380 L201,387 Z', '#2E2422', 0.5));
  for (const x of [190.5, 199.5]) o.push(line(`M${x},396 L${x - 1},400`, '#2E2422', 0.8));
  return o.join('');
}

/**
 * MID: the office — the ceiling, the frosted partition with the door opening (the corridor
 * dim beyond it), the window wall's frames and sill and the heater under it, the right wall
 * with its clock and cork board and the typed list of twenty pinned on it, the carpet.
 */
export function office() {
  const o = [];
  // the ceiling, and its light panels
  o.push(box(0, 214, 400, 16, '#CEC7B8'));
  o.push(box(0, 228, 400, 2.4, '#A79F8E'));
  for (const x of [84, 196, 300]) { o.push(rect(x, 217, 52, 6, '#F3F0E4', 0.5)); o.push(box(x + 2, 221, 48, 1.4, '#DAD5C4')); }
  // THE PARTITION: frosted glass on an aluminium frame, the door opening in it
  o.push(rect(-2, 230, 64, 252, '#AEBBC2', 0.8));
  o.push(box(0, 300, 62, 3, '#C7D2D8'));
  o.push(box(0, 230, 62, 6, '#8E979D'));
  // the corridor seen through the opening: a dim wall and its light
  o.push(rect(6, 238, 52, 242, '#4C5560', 0.8));
  o.push(box(6, 238, 52, 22, '#3E4650'));
  o.push(box(18, 262, 28, 3, '#E9E2C8'));
  o.push(box(6, 448, 52, 32, '#3A414A'));
  o.push(line('M6,238 L6,480 M58,238 L58,480 M6,238 L58,238', '#8E979D', 3));
  // THE WINDOW WALL: the frames (the panes are left clear so the city shows through)
  for (const x of [62, 128, 194, 260, 324]) {
    o.push(rect(x, 230, 4.5, 218, '#7C858B', 0.6));
    o.push(box(x + 0.6, 231, 1.3, 216, '#A9B1B6'));
  }
  o.push(rect(62, 230, 266, 4, '#7C858B', 0.6));
  // reflections: a few long faint streaks on the glass
  for (const [x0, x1] of [[78, 108], [150, 172], [214, 250], [276, 300]]) o.push(line(`M${x0},300 L${x1},236`, '#FFFFFF', 1.4, 0.07));
  // the sill and the heater cabinet under it
  o.push(rect(60, 445, 270, 5, '#C9C2B2', 0.8));
  o.push(rect(62, 450, 266, 30, '#BFB7A5', 0.8));
  for (let x = 70; x < 322; x += 7) o.push(box(x, 455, 4, 10, '#A39A86'));
  // THE RIGHT WALL: walnut panelling, the clock, the cork board
  o.push(rect(328, 230, 74, 250, '#8E6E4E', 0.8));
  for (const x of [346, 364, 382]) o.push(line(`M${x},232 L${x},478`, '#7A5C3F', 0.8));
  o.push(box(328, 230, 6, 250, '#7A5C3F'));
  // the clock: ten to eleven
  o.push(circ(365, 292, 14, '#F2EEE2', 1.4));
  o.push(circ(365, 292, 11.4, '#FBF8EE', 0.4));
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * Math.PI * 2;
    o.push(line(`M${f2(365 + 9.4 * Math.sin(a))},${f2(292 - 9.4 * Math.cos(a))} L${f2(365 + 10.8 * Math.sin(a))},${f2(292 - 10.8 * Math.cos(a))}`, OUT, k % 3 ? 0.5 : 1));
  }
  o.push(line(`M365,292 L${f2(365 + 6 * Math.sin((10.83 / 12) * 6.283))},${f2(292 - 6 * Math.cos((10.83 / 12) * 6.283))}`, OUT, 1.4));
  o.push(line(`M365,292 L${f2(365 + 8.6 * Math.sin((50 / 60) * 6.283))},${f2(292 - 8.6 * Math.cos((50 / 60) * 6.283))}`, OUT, 0.9));
  o.push(dot(365, 292, 1.1, '#A6322B'));
  // the cork board
  o.push(rect(336, 392, 62, 48, '#6E4F33', 1));
  o.push(rect(339, 395, 56, 42, '#C99D62', 0.5));
  const r = rng(91);
  for (let k = 0; k < 60; k++) o.push(dot(340 + r() * 54, 396 + r() * 40, 0.35, '#A27A46'));
  // THE LIST OF TWENTY, typed, pinned on the right half
  o.push(rect(370, 397, 24, 38, '#FBFAF4', 0.5));
  for (let k = 0; k < 20; k++) {
    const y = 400.2 + k * 1.7;
    o.push(box(372, y, 1.2, 0.7, '#7A7A7A'));
    o.push(box(374.2, y, 7 + ((k * 7) % 11), 0.7, '#4A4A4A'));
  }
  o.push(circ(382, 397.6, 1.6, '#C8372E', 0.4));
  // the baseboard and the carpet
  o.push(box(0, 478, 400, 4, '#5A5248'));
  o.push(rect(-2, 482, 404, 34, '#4F5C6E', 0.8));
  o.push(box(0, 482, 400, 3, '#45505F'));
  for (let x = 0; x < 400; x += 10) for (const y of [490, 498, 506]) o.push(box(x + ((y / 8) % 2) * 5, y, 2.4, 0.9, '#5C6A7D'));
  return o.join('');
}

/** NEAR: the desk with its lamp, the computer and the printer, the fan-fold paper; the bookcase. */
export const DESK = { x0: 150, x1: 318, top: 466 };
export function desk() {
  const o = [];
  const { x0, x1, top } = DESK;
  // the paper box under the desk end, the paper feeding up behind the printer
  // the desk body: front panel, a drawer pedestal on the right, the top
  o.push(rect(x0 + 2, top + 5, x1 - x0 - 4, 500 - top - 5, '#5C3C27', 1));
  o.push(box(x0 + 3, top + 6, 8, 500 - top - 7, '#6E4A31'));
  o.push(rect(x1 - 52, top + 8, 46, 12, '#6A4630', 0.7));
  o.push(rect(x1 - 52, top + 21, 46, 12, '#6A4630', 0.7));
  for (const y of [top + 14, top + 27]) o.push(rect(x1 - 33, y - 1.2, 8, 2.4, '#C9A24A', 0.4));
  o.push(rect(x0, top, x1 - x0, 6, '#8A5E3E', 1));
  o.push(box(x0 + 1, top + 0.6, x1 - x0 - 2, 1.6, '#A87650'));
  o.push(box(x0 + 1, top + 4, x1 - x0 - 2, 1.4, '#6E4A31'));
  // the lamp's pool of light on the desk top
  o.push(flat(`M${x0 + 2},${top + 0.6} L${x0 + 34},${top + 0.6} L${x0 + 30},${top + 3.6} L${x0 + 2},${top + 3.6} Z`, '#C08A5E', 0.8));
  // THE BANKER'S LAMP: a brass foot and stem, a green glass shade
  const lx = 164;
  o.push(ell(lx, top - 1.2, 7, 1.8, '#C9A24A', 0.7));
  o.push(rect(lx - 1, top - 16, 2, 15, '#B48E3C', 0.5));
  o.push(fill(`M${lx - 13},${top - 16} C${lx - 12},${top - 26} ${lx + 12},${top - 26} ${lx + 13},${top - 16} Z`, '#2F7149', 0.9));
  o.push(flat(`M${lx + 3},${top - 23.6} C${lx + 9},${top - 22} ${lx + 12},${top - 19} ${lx + 13},${top - 16} L${lx + 3},${top - 16} Z`, '#245A39'));
  o.push(box(lx - 12, top - 16.4, 24, 1.6, '#F6E7A6'));
  o.push(line(`M${lx + 6},${top - 16} L${lx + 6},${top - 9}`, '#B48E3C', 0.5));
  o.push(dot(lx + 6, top - 8.4, 0.9, '#B48E3C'));
  // a pen cup
  o.push(rect(176, top - 9, 6, 9, '#3A3A3E', 0.5));
  for (const [dx, h, c] of [[-1.6, 6, '#E8B83A'], [0.6, 7.4, '#3A6FB0'], [2.2, 5.4, '#E8B83A']]) o.push(line(`M${179 + dx},${top - 8.5} L${179 + dx * 1.6},${top - 9 - h}`, c, 1.1));
  // THE COMPUTER: a beige CRT on the desk, its screen dark green with lines of green text
  const mx = 258;
  o.push(rect(mx + 6, top - 5, 20, 5, '#CBC3AC', 0.7));
  o.push(rect(mx, top - 36, 32, 31, '#DCD4BE', 1, 2));
  o.push(box(mx + 25, top - 35.4, 6.4, 30, '#C6BDA5'));
  o.push(rect(mx + 3.5, top - 33, 22, 18, '#16301F', 0.8, 2));
  for (let k = 0; k < 6; k++) o.push(box(mx + 6, top - 30.5 + k * 2.6, 6 + ((k * 5) % 11), 1, '#6FD08C'));
  o.push(box(mx + 6, top - 15, 2, 1, '#6FD08C'));
  o.push(dot(mx + 27, top - 9, 0.8, '#4CAF50'));
  // the keyboard in front of it
  o.push(rect(mx - 6, top - 3, 30, 3, '#D8D0BA', 0.6));
  // THE DOT-MATRIX PRINTER at the end, the printed paper coming over its front and down
  const px = 293;
  o.push(rect(px, top - 12, 25, 12, '#D7CFB8', 1, 1.5));
  o.push(box(px + 17, top - 11.4, 7.4, 10.8, '#C4BBA2'));
  o.push(rect(px + 3, top - 14.6, 19, 3, '#8E8775', 0.5));
  o.push(box(px + 4, top - 6, 16, 1.2, '#3A3832'));
  o.push(dot(px + 4, top - 2.6, 0.7, '#E25B3B'));
  // the printed paper rising out of the top and curling back over the printer
  o.push(fill(`M${px + 5},${top - 14} C${px + 4},${top - 24} ${px + 10},${top - 30} ${px + 18},${top - 28} C${px + 22},${top - 27} ${px + 22},${top - 22} ${px + 20},${top - 20} C${px + 16},${top - 24} ${px + 12},${top - 22} ${px + 20},${top - 14} Z`, '#F4F1E6', 0.6));
  o.push(line(`M${px + 7},${top - 18} C${px + 7},${top - 24} ${px + 11},${top - 27} ${px + 16},${top - 26}`, '#B9D6B1', 1.6));
  // the fan-fold supply, a zigzag pile on the floor by the desk end
  for (let k = 0; k < 5; k++) {
    const y = 500 - k * 3, x0 = 318;
    o.push(fill(`M${x0 + 1 - (k % 2) * 1.6},${y} L${x0 + 20 + (k % 2) * 1.6},${y} L${x0 + 20 + ((k + 1) % 2) * 1.6},${y - 3} L${x0 + 1 - ((k + 1) % 2) * 1.6},${y - 3} Z`, k % 2 ? '#EDE9DC' : '#F4F1E6', 0.5));
    o.push(box(x0 + 3, y - 2.2, 15, 0.8, '#CFE3C9'));
  }
  o.push(line(`M${px + 22},${top - 6} C${px + 30},${top - 2} ${px + 30},${top + 14} ${px + 34},${top + 20}`, '#E9E5D6', 2.4));
  // THE BOOKCASE, hip high: empty, waiting (the books are riders)
  const bx = 340;
  o.push(rect(bx, 466, 70, 38, '#7A5236', 1));
  o.push(box(bx + 4, 470, 62, 14, '#3E2817'));
  o.push(box(bx + 4, 487, 62, 13, '#3E2817'));
  o.push(box(bx + 4, 470, 62, 2.4, '#2E1C10'));
  o.push(box(bx + 4, 487, 62, 2.4, '#2E1C10'));
  o.push(rect(bx, 484, 70, 3, '#8E6242', 0.6));
  o.push(rect(bx - 1, 465, 72, 5, '#946646', 0.8));
  o.push(box(bx, 466, 70, 1.2, '#B07E58'));
  o.push(rect(bx, 500, 70, 4, '#6A4630', 0.6));
  return o.join('');
}

/** The glass door, closed (its own frame: the hinge at x 0, the top of the leaf at y 0). */
export function glassDoor() {
  const o = [];
  o.push(box(3, 3, 46, 234, '#BFDCE6', 0.32));
  o.push(line('M2,2 L50,2 L50,238 L2,238 Z', '#8E979D', 3.6));
  o.push(line('M2,2 L50,2 L50,238 L2,238 Z', OUT, 0.6));
  o.push(rect(5, 118, 42, 3.4, '#C6CCD0', 0.6));
  o.push(text(26, 70, 'D. E. SHAW', 4.6, '#D9B45A', 'middle', 700, 'Georgia, serif', 0.2));
  o.push(text(26, 76, '&amp; CO.', 4.2, '#D9B45A', 'middle', 700, 'Georgia, serif', 0.2));
  o.push(line('M10,96 L30,66', '#FFFFFF', 1.4, 0.22));
  o.push(line('M14,104 L26,86', '#FFFFFF', 0.8, 0.22));
  return o.join('');
}

/** The printout: green-bar fan-fold, sprocket holes, a chart whose line climbs almost straight up. */
export function printout() {
  const o = [];
  o.push(fill('M-15,-20 L15,-20 L15,19 L12,20 L9,18.6 L5,20 L1,18.4 L-3,20 L-7,18.6 L-11,20 L-15,19 Z', '#F6F3E8', 0.7));
  for (let y = -17; y < 18; y += 6) o.push(box(-12, y, 24, 2.8, '#D3E6CD'));
  for (let y = -18; y < 18; y += 3) { o.push(dot(-13.6, y, 0.6, '#BFB9A6')); o.push(dot(13.6, y, 0.6, '#BFB9A6')); }
  // the chart: axes, a few gridlines, the line flat and then straight up
  o.push(line('M-10,13 L10,13 M-10,13 L-10,-13', '#3A3A3A', 0.7));
  o.push(line('M-10,13 C-4,12.6 1,11.4 4,8 C6.4,4.6 7.6,-4 8.6,-14', '#C0392B', 1.5));
  o.push(fill('M8.6,-15.6 L6.8,-11.6 L10.4,-11.6 Z', '#C0392B', 0.3));
  o.push(text(-9, -15, '2300%', 4.4, '#2A2A2A', 'start', 700));
  return o.join('');
}

/** The three things on the desk (each standing on y 0, centred on x 0). */
export function softBox() {
  const o = [];
  o.push(rect(-8, -21, 16, 21, '#2E5FA6', 0.9, 0.8));
  o.push(box(3.4, -20.4, 4, 19.8, '#244C86'));
  o.push(box(-7.4, -16, 14.8, 4, '#F2F2EE'));
  o.push(box(-5, -15, 6, 1.2, '#2E5FA6'));
  // the floppy disk on its front
  o.push(rect(-4.4, -9.4, 8.8, 8.4, '#1E1E22', 0.4, 0.4));
  o.push(rect(-2.4, -9.4, 4.4, 3.2, '#C9CED4', 0.3));
  o.push(rect(-3, -4.4, 6, 3, '#F2F2EE', 0.3));
  return o.join('');
}
export function cd() {
  const o = [];
  o.push(rect(-8, -16, 16, 16, '#C93F35', 0.9, 0.6));
  o.push(box(-8, -16, 2.4, 16, '#9E2F27'));
  o.push(circ(1.2, -8, 6.4, '#D6DCE2', 0.6));
  o.push(flat('M1.2,-14.4 A6.4,6.4 0 0 1 7.6,-8 L1.2,-8 Z', '#E9C2E6', 0.8));
  o.push(flat('M1.2,-8 L-5.2,-8 A6.4,6.4 0 0 1 1.2,-14.4 Z', '#BDE6E2', 0.8));
  o.push(circ(1.2, -8, 1.8, '#F4F4F2', 0.4));
  o.push(rect(-8, -16, 16, 16, 'none', 0.9, 0.6));
  o.push(box(-7.4, -15.4, 14.8, 1, '#FFFFFF', 0.5));
  return o.join('');
}
export function book() {
  const o = [];
  // a hardback standing, three-quarter: the cover, the spine on the left, the page edges
  o.push(fill('M-6,-20 L7,-20 L8.6,-18.6 L8.6,0 L-6,0 Z', '#F3EAD2', 0.7));
  for (let y = -17; y < -1; y += 2) o.push(line(`M7.4,${y} L8.2,${y}`, '#CDBF9C', 0.4));
  o.push(rect(-7, -21, 13.4, 21, '#8E2C2C', 0.9, 0.6));
  o.push(box(-7, -21, 3, 21, '#6E1F1F'));
  o.push(box(-3, -16, 8, 1.2, '#D9B45A'));
  o.push(box(-3, -13.4, 8, 0.8, '#D9B45A'));
  o.push(box(-3, -5, 8, 0.8, '#D9B45A'));
  return o.join('');
}

/** A row of books for the shelf, 150 long (its own frame: standing on y 0 from x 0). */
const BOOK_COL = ['#8E2C2C', '#2E5A8A', '#3E6E48', '#C9A24A', '#6B3E6E', '#2A2A2E', '#B85C2E', '#E2D6B6', '#4A7F8C', '#9C3A4E'];
function bookRow(seed, hmax) {
  const o = [];
  const r = rng(seed);
  let x = 0.5;
  while (x < 150) {
    const w = 2.6 + r() * 2.6, h = hmax - 4 + r() * 4, c = BOOK_COL[Math.floor(r() * BOOK_COL.length)];
    o.push(rect(x, -h, w, h, c, 0.45));
    if (r() < 0.6) o.push(box(x + 0.6, -h + 2.4, w - 1.2, 0.8, r() < 0.5 ? '#E8D79E' : '#F2EEE2'));
    if (r() < 0.4) o.push(box(x + 0.6, -3.4, w - 1.2, 0.7, '#E8D79E'));
    x += w + 0.25;
  }
  return o.join('');
}
export const booksTop = () => bookRow(17, 13.4);
export const booksLow = () => bookRow(29, 12.4);

/** A cardboard box of his things: a fern, a framed photograph, a rolled poster (on y 0). */
export function cardBox() {
  const o = [];
  // the fern behind, the poster and the frame
  for (const [x, y, a] of [[-8, -26, -30], [-3, -30, -10], [3, -29, 14], [8, -24, 34], [-11, -21, -48]]) {
    o.push(line(`M0,-16 Q${f2(x * 0.5)},${f2(y + 2)} ${x},${y}`, '#3E7A3E', 1.4));
    o.push(line(`M0,-16 Q${f2(x * 0.5 + 1)},${f2(y + 4)} ${x + 1},${y + 3}`, '#5A9A4E', 0.8));
  }
  o.push(fill('M7,-25 L10,-26 L13,-14 L10,-13 Z', '#E8E2D2', 0.5));
  o.push(rect(-12, -22, 9, 11, '#2A2A2E', 0.6));
  o.push(box(-10.6, -20.6, 6.2, 8.2, '#9CB7C9'));
  o.push(dot(-7.6, -16, 1.8, '#5A4A3A'));
  // the box, its flaps open
  o.push(fill('M-15,-15 L-21,-20 L-14,-21 L-12,-15 Z', '#C69B63', 0.6));
  o.push(fill('M15,-15 L21,-20 L14,-21 L12,-15 Z', '#B48852', 0.6));
  o.push(rect(-15, -16, 30, 16, '#C69B63', 0.9));
  o.push(box(5, -15.4, 9.4, 14.8, '#AE8450'));
  o.push(box(-14.4, -9, 28.8, 2.2, '#D9C49A', 0.8));
  return o.join('');
}

/** Shaw's camel overcoat folded over his forearm (its own frame: the fold at the wrist, at 0,0). */
export function coat() {
  const o = [];
  o.push(fill('M-7,-1.4 C-7,-3.4 7,-3.4 7,-1.4 L8.6,19 L4,22 L1,19.4 L-3,22.6 L-8.4,19 Z', '#A27E52', 0.8));
  o.push(flat('M2,-2.4 C5,-2.4 7,-2 7,-1.4 L8.6,19 L4,22 L1,19.4 L2,-2 Z', '#86663E'));
  o.push(line('M-2.4,0 L-3.4,20', '#7A5C36', 0.6));
  o.push(line('M-6,6 L-1,6', '#C9A774', 0.6));
  o.push(rect(-7.4, -2.6, 14.8, 3, '#8E6C44', 0.5, 1.2));
  return o.join('');
}

// ══════════════════════════════════════════════════════════════════════════════
// PLACE 1 — THE BLAZER ON THE INTERSTATE, JULY 1994, DUSK
// ══════════════════════════════════════════════════════════════════════════════
//
// The Blazer faces right (west, into the sunset), from x 50 to 374; its wheels touch the
// near lane at y 500. The roof is at 358, the windows 366–446 (the door window x 128–252,
// the rear side window 68–112). MacKenzie drives (x 162); Bezos sits turned toward her
// in the passenger seat (x 236) with a laptop on his knees. The atlas lies on the dash.

const DUSK = ['#3C3567', '#6A4A7C', '#B5627A', '#E58B66', '#F4B677'];

/** FAR: the dusk sky, the sun low ahead, buttes on the horizon, the prairie. */
export function dusk() {
  const o = [];
  const cuts = [214, 268, 310, 346, 374, 394];
  for (let k = 0; k < 5; k++) o.push(box(0, cuts[k], 400, cuts[k + 1] - cuts[k] + 0.4, DUSK[k]));
  // long thin clouds, lit from below
  for (const [x, y, w] of [[30, 262, 90], [170, 252, 120], [290, 288, 80], [60, 300, 60], [210, 324, 100]]) {
    o.push(flat(`M${x},${y} C${x + w * 0.2},${y - 4} ${x + w * 0.8},${y - 4} ${x + w},${y} C${x + w * 0.8},${y + 2.4} ${x + w * 0.2},${y + 2.4} ${x},${y} Z`, '#F0A486', 0.8));
    o.push(flat(`M${x + 6},${y + 0.6} C${x + w * 0.3},${y + 1.6} ${x + w * 0.7},${y + 1.6} ${x + w - 6},${y + 0.6} Z`, '#FAD0A2', 0.8));
  }
  // the sun, low ahead in the west
  o.push(circ(338, 377, 15, '#FFE3A1', 0));
  o.push(dot(338, 377, 11, '#FFF0C4'));
  // the buttes and the low hills, purple with distance
  o.push(flat('M0,394 L0,378 C20,376 40,370 54,368 L60,356 L104,356 L110,368 C130,372 150,380 170,384 C200,380 230,386 260,388 C300,384 330,390 400,388 L400,394 Z', '#6E4C76'));
  o.push(flat('M60,356 L104,356 L110,368 L96,368 L92,358 Z', '#5D3F66'));
  o.push(flat('M0,394 C60,388 120,392 180,389 C240,393 320,389 400,392 L400,396 L0,396 Z', '#865C78'));
  // the prairie, gold going brown toward us
  o.push(box(0, 394, 400, 18, '#C9935A'));
  o.push(box(0, 412, 400, 22, '#B78350'));
  o.push(box(0, 434, 400, 40, '#A27242'));
  // a farmstead far off, one window lit
  o.push(flat('M88,398 L88,392 L94,388 L100,392 L100,398 Z', '#4E3A3E'));
  o.push(flat('M102,398 L102,386 C102,383 108,383 108,386 L108,398 Z', '#4E3A3E'));
  o.push(box(92, 393, 2, 2, '#FCE09A'));
  // grass texture: short strokes in the near prairie
  const r = rng(13);
  for (let k = 0; k < 120; k++) {
    const x = r() * 400, y = 400 + r() * 70;
    o.push(line(`M${f2(x)},${f2(y)} l${f2(r() * 1.6 - 0.8)},-2.4`, y > 430 ? '#8C6236' : '#B88550', 0.6));
  }
  return o.join('');
}

/** MID, scrolling: telegraph poles and their wires, a wire fence, sagebrush (800 long, wraps at 400). */
export function plainsStrip() {
  const o = [];
  for (const base of [0, 400]) {
    for (const px of [60, 260]) {
      const x = base + px;
      o.push(rect(x - 1.4, 356, 2.8, 108, '#4E3828', 0.5));
      o.push(rect(x - 10, 362, 20, 2.4, '#4E3828', 0.4));
      for (const dx of [-8, -3, 3, 8]) o.push(dot(x + dx, 361.6, 0.9, '#7A8A8E'));
    }
    // the wires sag between the poles
    for (const dx of [-8, 8]) {
      o.push(line(`M${base + 60 + dx},362 Q${base + 160 + dx},372 ${base + 260 + dx},362`, '#3E2E26', 0.5));
      o.push(line(`M${base + 260 + dx},362 Q${base + 360 + dx},372 ${base + 460 + dx},362`, '#3E2E26', 0.5));
    }
    // the wire fence
    for (let x = base + 10; x < base + 400; x += 34) o.push(rect(x - 0.8, 448, 1.6, 16, '#5A4230', 0.3));
    o.push(line(`M${base},452 L${base + 400},452 M${base},458 L${base + 400},458`, '#4A3A30', 0.4));
    // sagebrush
    const r = rng(base ? 41 : 41);
    for (let k = 0; k < 9; k++) {
      const x = base + 20 + k * 44 + r() * 14, y = 466 + r() * 4, s = 0.8 + r() * 0.6;
      o.push(fill(`M${f2(x - 8 * s)},${f2(y)} C${f2(x - 8 * s)},${f2(y - 6 * s)} ${f2(x - 2 * s)},${f2(y - 8 * s)} ${f2(x + 2 * s)},${f2(y - 6 * s)} C${f2(x + 7 * s)},${f2(y - 7 * s)} ${f2(x + 9 * s)},${f2(y - 3 * s)} ${f2(x + 8 * s)},${f2(y)} Z`, '#7E8A62', 0.5));
      o.push(flat(`M${f2(x + 1 * s)},${f2(y)} C${f2(x + 2 * s)},${f2(y - 5 * s)} ${f2(x + 6 * s)},${f2(y - 6 * s)} ${f2(x + 8 * s)},${f2(y)} Z`, '#66724E'));
    }
  }
  return o.join('');
}

/** NEAR: the interstate — the far shoulder, the blacktop, the near edge line, the gravel. */
export function road() {
  const o = [];
  o.push(box(0, 470, 400, 8, '#8E6A40'));
  o.push(rect(-2, 476, 404, 34, '#4C4A52', 0.8));
  o.push(box(0, 476, 400, 4, '#5E5B63'));
  o.push(box(0, 478, 400, 1.4, '#E7DFC8'));
  o.push(box(0, 504, 400, 1.8, '#E7DFC8'));
  o.push(rect(-2, 508, 404, 8, '#8C7C66', 0.6));
  const r = rng(77);
  for (let k = 0; k < 70; k++) o.push(dot(r() * 400, 509 + r() * 4, 0.5, '#6E604E'));
  for (let k = 0; k < 40; k++) o.push(box(r() * 400, 482 + r() * 20, 3 + r() * 6, 0.6, '#57545C'));
  return o.join('');
}
/** The dashed centre line, scrolling (800 long, wraps at 400). */
export function dashes() {
  const o = [];
  for (let x = 0; x < 800; x += 50) o.push(box(x, 489.4, 24, 1.8, '#EDE4C8'));
  return o.join('');
}

/** The Cascades and Mount Rainier, the Sound under them: the road ahead's destination. */
export function cascades() {
  const o = [];
  o.push(flat('M200,394 L220,384 L236,386 L252,378 L268,382 L284,374 L300,380 L318,372 L338,380 L360,374 L384,380 L400,378 L400,394 Z', '#6A7896'));
  // Rainier: a broad white cone above the ranges, far off ahead
  o.push(fill('M280,384 L306,358 C309,355 313,354 316,357 L344,384 Z', '#E8EEF4', 0.5));
  o.push(flat('M311,355.4 C313,355.6 314,356 316,357 L344,384 L320,384 C321,374 318,363 311,355.4 Z', '#C2CDDC'));
  o.push(flat('M292,374 L298,376 L304,370 L310,377 L316,372 L322,378 L330,374 L338,380 L344,384 L280,384 Z', '#7484A2', 0.8));
  // the Sound catching the last light, dark firs on its shore
  o.push(box(204, 388, 196, 5, '#C99278'));
  o.push(box(204, 389.4, 196, 1, '#F6C59A'));
  for (let x = 206; x < 400; x += 6) o.push(flat(`M${x},394 L${x + 2.6},385 L${x + 5.2},394 Z`, '#3A5444'));
  return o.join('');
}

/**
 * THE BLAZER, INSIDE (behind the people): the far door's trim through the windows, the two
 * bucket seats, the steering wheel and the dash on the far side, the cargo bay full of boxes
 * through the rear window, the dark wheel wells.
 */
export const CAR = { roof: 358, sill: 446, wheelR: 23, rearW: 112, frontW: 300, wy: 477 };
export function carIn() {
  const o = [];
  // the wheel wells
  for (const wx of [CAR.rearW, CAR.frontW]) o.push(fill(`M${wx - 29},482 C${wx - 29},${CAR.wy - 32} ${wx + 29},${CAR.wy - 32} ${wx + 29},482 Z`, '#1C1A1A', 0.6));
  // the far side through the windows: the headliner, the far door's trim below its window
  o.push(box(62, 362, 194, 7, '#C9B18A'));
  o.push(box(62, 430, 200, 18, '#7A5C40'));
  o.push(box(62, 430, 200, 2, '#5E4430'));
  o.push(line('M124,368 L124,430', '#4A3426', 3));
  // the cargo bay through the rear window: boxes, a lamp shade, a rolled rug
  o.push(rect(66, 412, 24, 20, '#C69B63', 0.7));
  o.push(box(80, 412.6, 9.4, 18.8, '#AE8450'));
  o.push(rect(70, 398, 18, 14, '#D2A86E', 0.7));
  o.push(box(72, 404, 14, 1.4, '#E8D4A8'));
  o.push(fill('M92,412 L97,396 L109,396 L113,412 Z', '#EFE2BE', 0.7));
  o.push(line('M102,412 L102,432', '#6E5A44', 1.4));
  o.push(rect(88, 426, 26, 6, '#8E3E34', 0.6, 3));
  // THE SEATS: the high-backed driver's bucket in tan vinyl (the passenger's is hidden
  // behind its own occupant's knees), and the bench of the back seat beyond the pillar
  {
    const sx = 132;
    o.push(fill(`M${sx},446 L${sx},392 C${sx},384 ${sx + 4},380 ${sx + 10},380 L${sx + 16},380 C${sx + 22},380 ${sx + 24},386 ${sx + 23},392 L${sx + 20},446 Z`, '#B88A58', 0.9));
    o.push(flat(`M${sx + 14},381 C${sx + 20},381 ${sx + 23},386 ${sx + 23},392 L${sx + 20},446 L${sx + 14},446 Z`, '#9C7246'));
    for (const y of [400, 414, 428]) o.push(line(`M${sx + 2},${y} L${sx + 20},${y}`, '#9C7246', 0.6));
  }
  // THE DASH and the steering column, the wheel on the far side
  o.push(fill('M222,436 L244,422 L262,424 L262,448 L222,448 Z', '#4E3B2E', 0.9));
  o.push(box(234, 424, 26, 3, '#6A5240'));
  o.push(line('M192,420 L230,442', '#2A2420', 3.2));
  o.push(`<ellipse cx="190" cy="418" rx="4.2" ry="14" transform="rotate(-24 190 418)" fill="none" stroke="#2A2420" stroke-width="3"/>`);
  o.push(dot(191, 419, 2.4, '#3A3430'));
  return o.join('');
}

/**
 * THE BLAZER, OUTSIDE (in front of the people): the near flank in two tones, the windows
 * left open (the door window 166–252, the rear side window 76–154), the long flat hood,
 * the chrome bumpers and trim, the arches over the wheels, the mirror, the lamps.
 */
export function carOut() {
  const o = [];
  const { roof, sill } = CAR;
  const UP = '#6B4530', UP_D = '#553624', LOW = '#CCAE7E', LOW_D = '#AE9062', CHROME = '#D9DEE2';
  // the body below the windows: from the tail to the nose, the arches cut out
  const body = `M52,${sill} L262,${sill} L272,428 L364,430 C369,431 371,436 371,442 L371,482 L330,482 C330,462 270,462 270,482 L142,482 C142,462 82,462 82,482 L52,482 Z`;
  o.push(fill(body, UP, 1.2));
  // the lower flank in tan, under the trim strip
  o.push(flat(`M53,458 L370,458 L370,481 L330,481 C330,461 270,461 270,481 L142,481 C142,461 82,461 82,481 L53,481 Z`, LOW));
  o.push(flat(`M53,474 L370,474 L370,481 L330,481 C329,476 326,474 325,474 L275,474 C273,474 271,477 270,481 L142,481 C141,477 139,474 137,474 L87,474 C85,474 83,477 82,481 L53,481 Z`, LOW_D));
  o.push(box(53, 456, 317, 2.6, CHROME));
  o.push(box(53, 458.4, 317, 0.6, '#8A8F94'));
  // the hood, a little lighter on top
  o.push(flat('M272,428 L364,430 L364,433 L270,431 Z', '#80563E'));
  // THE CABIN: the roof, the pillars round the open windows
  const cab = `M56,${sill} L56,${roof + 6} C56,${roof + 1} 60,${roof} 66,${roof} L246,${roof} C251,${roof} 254,${roof + 2} 256,${roof + 6} L272,428 L262,${sill} Z`;
  const holes = `M68,366 L112,366 L112,${sill - 2} L68,${sill - 2} Z M128,366 L250,366 L260,${sill - 2} L128,${sill - 2} Z`;
  o.push(`<path d="${cab} ${holes}" fill="${UP}" fill-rule="evenodd" stroke="${OUT}" stroke-width="1.1" stroke-linejoin="round"/>`);
  o.push(box(58, roof + 1, 192, 2.4, '#80563E'));
  o.push(line(`M68,366 L112,366 L112,${sill - 2} L68,${sill - 2} Z`, '#3E281C', 1.4));
  o.push(line(`M128,366 L250,366 L260,${sill - 2} L128,${sill - 2} Z`, '#3E281C', 1.4));
  // the door seams, the handle, the mirror
  o.push(line(`M120,${sill} L120,480 M262,${sill} L264,480`, '#3E281C', 0.8));
  o.push(rect(132, 462, 10, 2.4, CHROME, 0.5));
  o.push(line('M258,430 L264,424', '#3E3632', 1.2));
  o.push(rect(260, 412, 9, 12, '#2E2A28', 0.7, 1.5));
  o.push(box(261.4, 413.4, 3, 9, '#5A6A80'));
  // the bumpers and the lamps
  o.push(rect(362, 458, 13, 10, CHROME, 0.9, 2));
  o.push(rect(46, 458, 12, 10, CHROME, 0.9, 2));
  o.push(rect(366, 438, 6, 8, '#F2A93B', 0.5, 1));
  o.push(rect(366, 446, 6, 5, '#F5F2E6', 0.5, 1));
  o.push(rect(52, 434, 5, 14, '#B3322A', 0.5, 1));
  // the arches' lips
  for (const [a, b] of [[82, 142], [270, 330]]) o.push(line(`M${a},481 C${a},459 ${b},459 ${b},481`, '#3E281C', 1.6));
  return o.join('');
}

/** A wheel: the tyre, the rally rim, the hub (its own frame, centred). */
export function wheel() {
  const o = [];
  o.push(circ(0, 0, 23, '#1E1D21', 1));
  o.push(circ(0, 0, 13, '#3A3A40', 0.6));
  o.push(circ(0, 0, 11.4, '#C9CED3', 0.5));
  o.push(circ(0, 0, 7.2, '#55555C', 0.4));
  for (let k = 0; k < 6; k++) {
    const a = (k / 6) * Math.PI * 2;
    o.push(dot(f2(9.3 * Math.cos(a)), f2(9.3 * Math.sin(a)), 1.4, '#3A3A40'));
    o.push(dot(f2(4.8 * Math.cos(a + 0.5)), f2(4.8 * Math.sin(a + 0.5)), 0.7, '#D9DEE2'));
  }
  o.push(circ(0, 0, 2.4, '#D9DEE2', 0.4));
  // tread blocks, so the turning shows
  for (let k = 0; k < 16; k++) {
    const a = (k / 16) * Math.PI * 2;
    o.push(line(`M${f2(19 * Math.cos(a))},${f2(19 * Math.sin(a))} L${f2(22.4 * Math.cos(a))},${f2(22.4 * Math.sin(a))}`, '#34333A', 1.6));
  }
  return o.join('');
}

/** The laptop on his knees, a spreadsheet on its screen (its own frame: the base's back edge at 0,0). */
export function laptop() {
  const o = [];
  o.push(fill('M0,0 L24,0 L26,2.6 L2,2.6 Z', '#2B2B2F', 0.6));
  o.push(fill('M0,0 L3,-1 L7,-22 L4,-23 Z', '#2B2B2F', 0.6));
  // the screen, turned a little toward us: grey-blue, ruled in cells
  o.push(fill('M3.4,-1.4 L23,-2 L24,-21 L6.6,-22 Z', '#2B2B2F', 0.6));
  o.push(fill('M5.4,-3.4 L21.4,-3.8 L22.2,-19.4 L7.8,-20 Z', '#B9D2DF', 0.4));
  for (let k = 0; k < 6; k++) o.push(line(`M${f2(5.8 + k * 0.04)},${f2(-5.8 - k * 2.4)} L${f2(21.6 + k * 0.12)},${f2(-6.2 - k * 2.4)}`, '#7FA2B8', 0.4));
  for (const t of [0.3, 0.55, 0.78]) o.push(line(`M${f2(5.6 + t * 16)},${f2(-3.6)} L${f2(7.8 + t * 14.4)},${f2(-19.8)}`, '#7FA2B8', 0.4));
  o.push(box(6.6, -18.8, 14, 1.4, '#3E7FB0'));
  return o.join('');
}

/** The road atlas lying open on the dash (side view; its own frame, the spine at 0,0). */
export function atlasDash() {
  const o = [];
  o.push(fill('M-15,0 C-10,-2.4 -3,-2.4 0,-0.6 C3,-2.4 10,-2.4 15,0 L15,1.6 L-15,1.6 Z', '#F3ECD8', 0.6));
  o.push(line('M-13,-0.6 C-9,-1.8 -3,-1.8 -0.4,-0.4 M13,-0.6 C9,-1.8 3,-1.8 0.4,-0.4', '#8FB07C', 0.6));
  o.push(rect(-15.6, 1.4, 31.2, 1.6, '#2F5D9E', 0.5));
  return o.join('');
}
/** The atlas held up open (face on, a cheat so it reads; its own frame, centred). */
export function atlasHeld() {
  const o = [];
  o.push(rect(-17, -11, 34, 22, '#2F5D9E', 0.8, 1));
  o.push(rect(-16, -10, 15.6, 20, '#F3ECD8', 0.4));
  o.push(rect(0.4, -10, 15.6, 20, '#EFE7D0', 0.4));
  o.push(flat('M-15,-8 C-12,-9 -8,-7 -4,-8 L-1,-6 L-1,8 L-13,8 C-15,4 -16,-2 -15,-8 Z', '#B9D19C'));
  o.push(flat('M1,-6 L14,-7 L14,7 L1,8 Z', '#C9D9A6'));
  o.push(line('M-12,6 L-6,0 L-4,-6', '#C0392B', 0.6));
  o.push(dot(-11.4, -6, 1.3, '#D23A32'));
  o.push(line('M0,-10 L0,10', '#8C7E62', 0.6));
  return o.join('');
}

/** A red map pin (its own frame: the point at 0,0, leaning a little). */
export function pin() {
  const o = [];
  o.push(line('M0,0 L3.4,-11', '#9AA2AA', 1.3));
  o.push(circ(3.8, -13, 4.4, '#D23A32', 0.8));
  o.push(dot(2.4, -14.6, 1.3, '#F28C80'));
  return o.join('');
}

// ── THE ROAD ATLAS, CLOSE UP: on the dashboard, the road ahead through the windscreen ──
//
// The map is the contiguous US traced from am1usa-2 (960 × 590): x' = 66 + (x − 10)·0.29,
// y' = 341 + (y − 5)·0.29. The scene keeps the same numbers for the pins (MAP_PINS).
const MX = (x) => 66 + (x - 10) * 0.29;
const MY = (y) => 341 + (y - 5) * 0.29;
export const MAP_PINS = {
  seattle: [MX(72), MY(40)], sf: [MX(28), MY(240)], boulder: [MX(305), MY(245)], fortWorth: [MX(455), MY(390)], here: [MX(290), MY(160)],
};
const USA = [[68, 12], [95, 8], [185, 28], [360, 55], [465, 62], [500, 62], [540, 74], [560, 98], [590, 88], [615, 102], [618, 150], [612, 214],
  [640, 212], [640, 150], [660, 128], [690, 160], [700, 190], [732, 194], [760, 176], [800, 150], [840, 112], [868, 82], [880, 42], [905, 38],
  [925, 85], [900, 116], [904, 160], [868, 182], [842, 214], [846, 242], [834, 268], [842, 318], [790, 352], [760, 410], [770, 470], [796, 548],
  [772, 560], [746, 482], [690, 456], [640, 466], [610, 470], [600, 494], [540, 500], [500, 512], [456, 566], [420, 522], [395, 484], [345, 468],
  [300, 430], [240, 436], [140, 386], [94, 378], [60, 340], [36, 272], [16, 192], [30, 140], [40, 80], [60, 40]];
const STATES = [
  // a few of the western borders, faint, as an atlas prints them
  [[95, 8], [92, 90], [30, 90]], [[185, 28], [150, 170]], [[36, 150], [150, 170], [260, 190]], [[150, 170], [100, 290], [175, 360]],
  [[175, 245], [255, 255]], [[255, 255], [235, 430]], [[155, 300], [380, 320]], [[265, 225], [378, 235], [373, 320]], [[255, 140], [350, 150], [345, 240]],
  [[350, 150], [470, 155], [475, 320]], [[360, 55], [355, 130]], [[465, 62], [470, 155]], [[378, 235], [495, 240]], [[380, 320], [505, 330]],
  [[355, 330], [350, 430], [290, 430]], [[408, 380], [500, 400]], [[505, 330], [505, 420]],
];
export function insert() {
  const o = [];
  // THROUGH THE WINDSCREEN: the dusk, the sun ahead and to the left, the prairie, the road
  // running straight to the horizon, the end of the brown hood
  const cuts = [214, 240, 262, 282, 298, 306];
  for (let k = 0; k < 5; k++) o.push(box(0, cuts[k], 400, cuts[k + 1] - cuts[k] + 0.4, DUSK[k]));
  o.push(circ(146, 296, 12, '#FFE3A1', 0));
  o.push(dot(146, 296, 8.6, '#FFF0C4'));
  o.push(flat('M0,306 L0,298 C40,296 70,292 92,294 L98,288 L124,288 L130,294 C170,298 230,296 280,300 C320,296 360,300 400,298 L400,306 Z', '#6E4C76'));
  o.push(box(0, 305, 400, 30, '#B7834E'));
  o.push(box(0, 312, 400, 30, '#A27242'));
  o.push(flat('M196,306 L204,306 L300,336 L100,336 Z', '#4C4A52'));
  o.push(line('M198,306 L150,336 M202,306 L250,336', '#E7DFC8', 0.8));
  for (const [y0, y1] of [[307, 309], [312, 315.6], [320, 326]]) o.push(flat(P([[199.6, y0], [200.4, y0], [200.4 + (y1 - 306) * 0.08, y1], [199.6 - (y1 - 306) * 0.08, y1]]), '#EDE4C8'));
  // fence posts running off to the horizon on both sides
  for (let k = 0; k < 7; k++) {
    const t = k / 7, y = 306 + 26 * t * t, s = 0.3 + t;
    o.push(box(196 - 30 - 150 * t * t, y - 4 * s, 1.2 * s, 4 * s, '#4E3828'));
    o.push(box(204 + 30 + 150 * t * t, y - 4 * s, 1.2 * s, 4 * s, '#4E3828'));
  }
  // the hood's end and the windscreen's frame: the pillars, the header, the mirror
  o.push(flat('M40,336 C80,326 320,326 360,336 L360,340 L40,340 Z', '#6B4530'));
  o.push(flat('M60,334 C120,328 280,328 340,334', '#80563E'));
  o.push(fill('M-4,214 L40,214 L28,340 L-4,340 Z', '#3E2A1E', 1));
  o.push(fill('M404,214 L360,214 L372,340 L404,340 Z', '#3E2A1E', 1));
  o.push(rect(-4, 214, 408, 10, '#C9B18A', 1));
  o.push(line('M200,224 L200,232', '#2A2420', 1.6));
  o.push(rect(176, 232, 48, 12, '#2A2420', 0.8, 3));
  o.push(rect(179, 234, 42, 8, '#9C6E5A', 0.4, 2));
  // THE DASHBOARD: a broad brown top, the defroster slots, the gauges' hood on the left
  o.push(rect(-4, 336, 408, 180, '#5A4232', 1.2));
  o.push(box(-4, 336, 408, 8, '#6E5240'));
  for (let x = 70; x < 340; x += 9) o.push(box(x, 339, 6, 1.6, '#3A2A20'));
  o.push(fill('M-4,350 L30,346 L42,380 L-4,392 Z', '#46342A', 0.8));
  // THE ATLAS, open across the dash: a blue cover, two cream pages, the map across them
  o.push(fill('M44,326 L356,326 L360,512 L40,512 Z', '#2F5D9E', 1.1));
  o.push(fill('M50,330 L198,332 L198,508 L48,506 Z', '#F4EDD8', 0.8));
  o.push(fill('M202,332 L350,330 L352,506 L202,508 Z', '#EFE6CC', 0.8));
  o.push(box(196, 332, 8, 176, '#D8CDAE', 0.7));
  o.push(line('M200,332 L200,508', '#A89A78', 0.8));
  // the sea round the country, pale blue; the country, pale green and tan
  o.push(box(50, 333, 300, 174, '#CFE3EE', 0.55));
  const pts = USA.map(([x, y]) => [MX(x), MY(y)]);
  o.push(fill(P(pts), '#E7E2C4', 0.7));
  // the western half in a greener print, the plains in tan, as atlases tint relief
  o.push(`<clipPath id="am1us"><path d="${P(pts)}"/></clipPath>`);
  o.push(`<g clip-path="url(#am1us)">`);
  o.push(flat(P([[MX(0), MY(0)], [MX(350), MY(0)], [MX(330), MY(450)], [MX(0), MY(450)]]), '#CFDDB0'));
  o.push(flat(P([[MX(180), MY(60)], [MX(330), MY(60)], [MX(320), MY(420)], [MX(200), MY(380)]]), '#C9D3A2'));
  for (const s of STATES) o.push(line('M' + s.map(([x, y]) => `${f2(MX(x))},${f2(MY(y))}`).join(' L'), '#A99E80', 0.5));
  o.push(`</g>`);
  o.push(line('M' + pts.map(([x, y]) => `${f2(x)},${f2(y)}`).join(' L') + ' Z', '#6E8EA8', 0.9));
  // the interstates, thin red lines
  for (const s of [[[72, 40], [290, 160], [470, 170], [700, 180]], [[28, 240], [255, 255], [470, 250], [620, 250]], [[455, 390], [310, 250], [300, 140], [240, 60]]]) {
    o.push(line('M' + s.map(([x, y]) => `${f2(MX(x))},${f2(MY(y))}`).join(' L'), '#D9776A', 0.6));
  }
  // where they started, and the pencil line of the way they have come
  const fw = MAP_PINS.fortWorth, hr = MAP_PINS.here;
  o.push(circ(fw[0], fw[1], 2, '#2A2A2A', 0.4));
  o.push(line(`M${f2(fw[0])},${f2(fw[1])} C${f2(fw[0] - 8)},${f2(fw[1] - 20)} ${f2(hr[0] + 14)},${f2(hr[1] + 22)} ${f2(hr[0])},${f2(hr[1])}`, '#4A4744', 1.1));
  o.push(fill(`M${f2(hr[0] - 3)},${f2(hr[1] - 3)} L${f2(hr[0] + 3)},${f2(hr[1] + 3)} M${f2(hr[0] + 3)},${f2(hr[1] - 3)} L${f2(hr[0] - 3)},${f2(hr[1] + 3)}`, 'none', 1.2));
  // the names
  const label = (x, y, s, a = 'start') => text(x, y, s, 7.2, '#2A2A2A', a, 700, 'Arial, Helvetica, sans-serif', 0.2);
  o.push(label(MAP_PINS.seattle[0] + 9, MAP_PINS.seattle[1] + 3, 'SEATTLE'));
  o.push(label(MAP_PINS.sf[0] + 9, MAP_PINS.sf[1] + 3, 'SAN FRANCISCO'));
  o.push(label(MAP_PINS.boulder[0] + 9, MAP_PINS.boulder[1] + 3, 'BOULDER'));
  o.push(label(fw[0] + 5, fw[1] + 9, 'FORT WORTH'));
  o.push(text(276, 494, 'ROAD ATLAS · UNITED STATES', 5, '#6E6450', 'middle', 700));
  // the page corners curling, the gutter's shade
  o.push(flat('M48,506 L58,506 L48,496 Z', '#D9CFB2'));
  o.push(flat('M352,506 L342,506 L352,496 Z', '#D9CFB2'));
  return o.join('');
}
/** The road ahead turning toward the mountains and the sea (over the windscreen's view). */
export function insertDest() {
  const o = [];
  o.push(`<clipPath id="am1ws"><path d="M40,224 L360,224 L362,332 L38,332 Z"/></clipPath><g clip-path="url(#am1ws)">`);
  o.push(flat('M30,300 L80,280 L110,288 L140,268 L170,284 L196,262 L230,282 L262,270 L300,286 L340,274 L370,290 L370,306 L30,306 Z', '#5E6E8E'));
  o.push(fill('M196,294 L238,250 C242,246 248,245 252,249 L300,294 Z', '#E8EEF4', 0.6));
  o.push(flat('M246,245.6 C249,246 250,247 252,249 L300,294 L258,294 C260,280 256,260 246,245.6 Z', '#C2CDDC'));
  o.push(flat('M214,282 L224,284 L232,276 L242,286 L252,278 L262,288 L276,282 L300,294 L196,294 Z', '#6E7FA0', 0.75));
  o.push(box(30, 296, 340, 10, '#C99278'));
  o.push(box(30, 298, 340, 1.4, '#F6C59A'));
  for (let x = 30; x < 370; x += 8) if (x < 150 || x > 250) o.push(flat(`M${x},306 L${x + 3.6},290 L${x + 7.2},306 Z`, '#2E4A3C'));
  // the road bending away toward them
  o.push(flat('M196,306 C210,302 236,300 254,300 L258,301 C240,302 214,304 204,306 Z', '#4C4A52'));
  o.push(`</g>`);
  return o.join('');
}

// ══════════════════════════════════════════════════════════════════════════════
// PLACE 2 — THE GARAGE IN BELLEVUE, AUTUMN 1994
// ══════════════════════════════════════════════════════════════════════════════
//
// The pot-bellied stove at the left (x 10–48), the back-wall door (62–102) Kaphan comes
// in by, the sectional garage door across the back (124–290) with autumn in its windows,
// the door desk on its sawhorses (x 126–266, top 464; the sawhorses at 150 and 242), a
// stack of doors leaning on the wall (296–340), the stepladder (348–376), and the sign
// hung above it at x 334–390. Feet at 500.

export const GARAGE = { saw: [150, 242], deskX0: 126, deskX1: 266, top: 464, ladder: 362 };
export function garageFar() {
  const o = [];
  // the raw drywall, taped at the seams
  o.push(rect(-2, 214, 404, 270, '#D9D1BF', 0.8));
  for (const x of [50, 110, 300, 350]) o.push(box(x - 2, 230, 4, 252, '#E8E2D2'));
  for (const y of [300, 390]) o.push(box(0, y - 1.5, 124, 3, '#E8E2D2'));
  for (const y of [300, 390]) o.push(box(290, y - 1.5, 112, 3, '#E8E2D2'));
  for (let k = 0; k < 40; k++) o.push(dot(4 + ((k * 37) % 392), 240 + ((k * 53) % 230), 0.5, '#C9BFAA'));
  // the ceiling joists
  o.push(box(0, 214, 400, 14, '#B79A72'));
  for (let x = 6; x < 400; x += 40) o.push(rect(x, 214, 8, 18, '#C9A97E', 0.6));
  o.push(box(0, 228, 400, 3, '#8E7552'));
  // THE GARAGE DOOR, closed: four rows of raised panels, a row of windows with autumn in them
  const gx0 = 124, gx1 = 290;
  o.push(rect(gx0 - 6, 286, gx1 - gx0 + 12, 196, '#B9AE98', 0.8));
  o.push(rect(gx0, 292, gx1 - gx0, 190, '#ECE7DA', 1));
  for (let row = 0; row < 4; row++) {
    const y = 292 + row * 47.5;
    o.push(line(`M${gx0},${y} L${gx1},${y}`, '#B9B2A2', 1));
    if (row === 0) {
      for (let k = 0; k < 4; k++) {
        const x = gx0 + 6 + k * 40.5;
        o.push(rect(x, y + 10, 32, 18, '#8A8F86', 0.8));
        // outside: a grey wet sky, a maple in full orange, the rain
        o.push(box(x + 1, y + 11, 30, 16, '#AEB6BA'));
        o.push(flat(`M${x + 1},${y + 27} C${x + 6},${y + 14} ${x + 26},${y + 12} ${x + 31},${y + 20} L${x + 31},${y + 27} Z`, k % 2 ? '#D9752E' : '#E08A34'));
        o.push(flat(`M${x + 10},${y + 27} C${x + 14},${y + 18} ${x + 24},${y + 17} ${x + 31},${y + 22} L${x + 31},${y + 27} Z`, k % 2 ? '#B85A22' : '#C4642A'));
        for (let j = 0; j < 5; j++) o.push(line(`M${x + 4 + j * 6},${y + 12} l-2,6`, '#E8EEF2', 0.4, 0.8));
      }
    } else {
      for (let k = 0; k < 4; k++) {
        const x = gx0 + 6 + k * 40.5;
        o.push(rect(x, y + 8, 32, 31, '#E2DCCD', 0.6));
        o.push(box(x + 1, y + 9, 30, 2, '#F4F1E8'));
        o.push(box(x + 1, y + 36, 30, 2, '#CFC8B6'));
      }
    }
  }
  // its tracks, and the opener hung from the ceiling
  for (const x of [gx0 - 4, gx1 + 4]) o.push(line(`M${x},292 L${x},482`, '#8A8F94', 1.6));
  o.push(line('M200,236 L200,286', '#5A5F64', 2));
  o.push(rect(184, 232, 36, 12, '#3A3D42', 0.8, 2));
  o.push(box(186, 240, 32, 2, '#55595F'));
  // THE BACK DOOR's opening (the door is a rider): the dark wet outside, a leaf going by
  o.push(rect(60, 334, 44, 148, '#7A6A54', 1));
  o.push(box(64, 338, 36, 144, '#4E5A5E'));
  o.push(flat('M64,420 C74,410 92,408 100,416 L100,482 L64,482 Z', '#3E4A3C'));
  o.push(flat('M70,400 C80,392 94,394 100,402 L100,420 C90,414 76,414 70,420 Z', '#C4642A'));
  for (let j = 0; j < 6; j++) o.push(line(`M${68 + j * 6},${342 + (j % 2) * 18} l-2,8`, '#DDE5EA', 0.5, 0.8));
  // a shelf of paint cans and boxes high on the right, a pegboard of tools under it
  o.push(rect(296, 296, 104, 4, '#9A7448', 0.7));
  for (const [x, w, h, c] of [[300, 10, 12, '#C6463A'], [312, 10, 12, '#3E6EA8'], [326, 22, 16, '#C69B63'], [352, 12, 10, '#E8D57A'], [368, 26, 20, '#B98D58']]) {
    o.push(rect(x, 296 - h, w, h, c, 0.6));
    if (w < 14) o.push(box(x, 296 - h, w, 2, '#9AA0A6'));
  }
  o.push(rect(300, 306, 96, 42, '#C9A272', 0.8));
  for (let x = 304; x < 396; x += 5) for (let y = 310; y < 346; y += 5) o.push(dot(x, y, 0.45, '#8E6E46'));
  o.push(line('M310,312 L310,330', '#5A5F64', 2.4));
  o.push(rect(306, 310, 8, 4, '#C6463A', 0.4));
  o.push(line('M324,312 L330,334', '#7A5A3A', 1.6));
  o.push(rect(320, 310, 10, 4, '#7A7F84', 0.4));
  o.push(fill('M342,312 L350,312 L349,330 L343,330 Z', '#E2742D', 0.5));
  o.push(line('M362,310 L362,334 M358,334 L366,334', '#5A5F64', 1.4));
  o.push(fill('M376,312 C384,312 388,318 386,324 L378,332 L374,328 L380,322 C378,318 376,316 376,312 Z', '#9AA0A6', 0.5));
  // an outlet low on the wall at the left, by the stove
  o.push(rect(52, 446, 6, 8, '#F4F1E8', 0.5));
  // the floor: concrete, a seam, an oil stain
  o.push(rect(-2, 482, 404, 34, '#A9A398', 0.8));
  o.push(box(0, 482, 400, 3, '#8E897F'));
  o.push(line('M0,500 L400,498', '#948E83', 0.6));
  o.push(flat('M198,506 C210,503 230,503 238,506 C232,509 206,509 198,506 Z', '#8E887C'));
  return o.join('');
}

/**
 * MID: the stove and its flue, the sawhorses, the stack of doors (the front one is a
 * rider), the stepladder, the extension cords across the floor.
 */
export function garageMid() {
  const o = [];
  // THE POT-BELLIED STOVE at the left: four bowed legs, a square base, the round belly
  // with its door and its round draught, a flat top with a collar, the flue up to the roof
  const sx = 29;
  o.push(rect(sx - 24, 496, 48, 4, '#6A6E72', 0.6));
  o.push(line(`M${sx},388 L${sx},226`, '#2E2C2C', 7));
  o.push(line(`M${sx - 1.2},386 L${sx - 1.2},228`, '#4A4644', 2));
  for (const y of [300, 344]) o.push(rect(sx - 5, y, 10, 4, '#3A3836', 0.6));
  o.push(rect(sx - 4.5, 226, 9, 4, '#3A3836', 0.6));
  for (const dx of [-14, 10]) o.push(fill(`M${sx + dx},496 C${sx + dx - 3},492 ${sx + dx - 2},486 ${sx + dx},484 L${sx + dx + 4},484 L${sx + dx + 3},496 Z`, '#2A2828', 0.6));
  o.push(rect(sx - 17, 474, 34, 11, '#2E2C2C', 0.9, 1.5));
  o.push(box(sx - 12, 477, 12, 6, '#3E3A38'));
  o.push(fill(`M${sx - 14},474 C${sx - 22},456 ${sx - 22},414 ${sx - 12},398 L${sx + 12},398 C${sx + 22},414 ${sx + 22},456 ${sx + 14},474 Z`, '#2E2B2A', 1));
  o.push(flat(`M${sx + 4},398 L${sx + 12},398 C${sx + 22},414 ${sx + 22},456 ${sx + 14},474 L${sx + 6},474 C${sx + 12},450 ${sx + 12},420 ${sx + 4},398 Z`, '#1E1C1C'));
  o.push(flat(`M${sx - 12},404 C${sx - 16},420 ${sx - 16},446 ${sx - 11},466 L${sx - 8},466 C${sx - 12},446 ${sx - 12},420 ${sx - 9},404 Z`, '#6A4A3A', 0.8));
  o.push(rect(sx - 19, 438, 38, 5, '#3A3634', 0.8, 2));
  o.push(rect(sx - 15, 392, 30, 7, '#3A3634', 0.9, 3));
  o.push(rect(sx - 8, 386, 16, 7, '#2E2C2C', 0.8, 2));
  // the stove door, its round draught glowing
  o.push(rect(sx - 8, 410, 16, 20, '#3E3A38', 0.8, 2));
  o.push(circ(sx, 420, 4.4, '#E8742D', 0.6));
  o.push(dot(sx, 420, 2.4, '#F8C25A'));
  // a log box beside it
  o.push(rect(sx + 22, 484, 18, 14, '#7A5434', 0.6));
  for (const y of [482, 478]) o.push(rect(sx + 22, y, 18, 4, '#9A6E44', 0.5, 2));
  // THE STACK OF DOORS leaning on the wall: their edges, the back ones darker
  for (let k = 3; k >= 1; k--) {
    const x = 300 + k * 6;
    o.push(fill(P([[x - 4, 358], [x + 34, 358], [x + 40, 482], [x + 2, 482]]), k === 3 ? '#B8955E' : k === 2 ? '#C6A36C' : '#D2AF78', 0.8));
    o.push(box(x + 34, 360, 2, 120, '#A8864F'));
  }
  // THE SAWHORSES: a top beam (its top at 462), two pairs of splayed legs
  for (const cx of GARAGE.saw) {
    o.push(fill(`M${cx - 18},467 L${cx - 12},467 L${cx - 18},500 L${cx - 24},500 Z`, '#D9BB84', 0.7));
    o.push(fill(`M${cx + 12},467 L${cx + 18},467 L${cx + 24},500 L${cx + 18},500 Z`, '#C9AB74', 0.7));
    o.push(fill(`M${cx - 10},467 L${cx - 5},467 L${cx - 8},498 L${cx - 13},498 Z`, '#BE9E68', 0.6));
    o.push(rect(cx - 22, 462, 44, 6, '#E2C48E', 0.8));
    o.push(box(cx - 21, 466, 42, 1.4, '#C4A26C'));
  }
  // THE STEPLADDER (an A seen from the side): the front rail the treads hang from, the
  // back leg, a top cap, a spreader between them
  const L = GARAGE.ladder;
  o.push(fill(`M${L + 14},500 L${L + 19},500 L${L + 9},432 L${L + 5},432 Z`, '#B8955E', 0.8));
  o.push(line(`M${L - 1},466 L${L + 14},466`, '#8A6E44', 1));
  o.push(fill(`M${L - 16},500 L${L - 11},500 L${L + 2},432 L${L - 3},432 Z`, '#D9B67E', 0.9));
  for (const [y, dx] of [[484, -10], [468, -7.4], [452, -4.8]]) o.push(rect(L + dx - 9, y - 1.8, 15, 4, '#E4C38C', 0.7));
  o.push(rect(L - 6, 428, 18, 5, '#C69F66', 0.8, 1));
  // THE EXTENSION CORDS, orange, from the outlet across the floor
  o.push(line('M55,454 C58,470 52,488 76,494 C110,500 150,488 190,494 C226,500 250,492 270,496', '#E2742D', 1.8));
  o.push(line('M120,497 C150,505 210,504 250,509 C280,512 330,506 360,510', '#E89A3C', 1.6));
  o.push(rect(266, 493, 8, 5, '#3A3A3E', 0.4));
  return o.join('');
}

/** The back door's leaf (its own frame: the hinge at x 0, the top at 0). */
export function backDoor() {
  const o = [];
  o.push(rect(0, 0, 36, 144, '#7E907E', 1));
  o.push(box(26, 1, 9, 142, '#6C7E6C'));
  o.push(rect(6, 10, 24, 30, '#5E6E70', 0.6));
  o.push(box(7, 11, 22, 28, '#A9B4B8'));
  o.push(line('M18,10 L18,40 M6,25 L30,25', '#7E907E', 1.4));
  o.push(rect(5, 50, 26, 34, '#869886', 0.6));
  o.push(rect(5, 92, 26, 44, '#869886', 0.6));
  o.push(circ(30, 76, 2, '#C9A24A', 0.5));
  return o.join('');
}

/** A plain flat door: its face 140 × 34, a hole bored for a knob (its own frame, centred). */
export function doorFace() {
  const o = [];
  o.push(rect(-70, -17, 140, 34, '#DDBF8C', 1));
  o.push(box(-69.4, 9, 138.8, 7.4, '#C9A874'));
  for (const y of [-11, -4, 3]) o.push(line(`M-66,${y} C-30,${y + 1.4} 20,${y - 1.4} 66,${y + 0.6}`, '#C9A874', 0.6));
  o.push(circ(58, 0, 2.6, '#6E5434', 0.5));
  o.push(rect(-70, -17, 140, 34, 'none', 1));
  return o.join('');
}
/** The same door laid flat across the trestles: its top as a slab with its front edge. */
export function doorTop() {
  const o = [];
  o.push(fill('M-70,-6 L-66,-10 L74,-10 L70,-6 Z', '#E4C795', 0.8));
  o.push(rect(-70, -6, 140, 6, '#C9A874', 0.9));
  o.push(box(-69.4, -2, 138.8, 1.4, '#B08E5C'));
  return o.join('');
}
/** A 2x4 leg (its own frame: the top at 0,0, the floor 26 below). */
export function deskLeg() {
  return rect(-2.6, 0, 5.2, 26, '#D8B87E', 0.7) + `<rect x="0.4" y="0.6" width="1.6" height="24.8" fill="#BE9E68"/>`;
}
/** A cordless drill (its own frame: the grip's foot at 0,0, the bit pointing up). */
export function drill() {
  const o = [];
  o.push(fill('M-3,0 L3,0 L3.6,-9 L-2.4,-9 Z', '#1E7C86', 0.6));
  o.push(rect(-4, 0, 8, 4, '#2A2A2E', 0.5, 1));
  o.push(fill('M-4,-9 L6,-9 C8,-9 8,-14 6,-14 L-4,-14 C-6,-14 -6,-9 -4,-9 Z', '#2A9AA6', 0.7));
  o.push(rect(6, -13, 4, 3, '#2A2A2E', 0.4));
  o.push(line('M10,-11.5 L15,-11.5', '#A9B0B6', 1));
  return o.join('');
}
/** A backpack (its own frame: the strap's top at 0,0, hanging behind). */
export function backpack() {
  const o = [];
  o.push(fill('M-5,0 C-11,0 -13,4 -13,10 L-13,22 C-13,24 -11,25 -9,25 L-1,25 C1,25 2,23 2,21 L2,6 C2,2 0,0 -5,0 Z', '#2C5E8A', 0.8));
  o.push(flat('M-6,10 L-6,24 L-1,24 C1,24 2,23 2,21 L2,10 Z', '#234C70'));
  o.push(rect(-12, 14, 9, 7, '#24507A', 0.5, 1.5));
  o.push(line('M-1,1 C2,6 2,14 0,20', '#1E3E5E', 1.2));
  return o.join('');
}
/** The workstation the first site ran on: a beige pizza box, a CRT on it (standing on y 0). */
export function workstation() {
  const o = [];
  o.push(rect(-20, -6, 40, 6, '#DAD4C2', 0.8, 1));
  o.push(rect(-20, -6, 5, 6, '#A9ACAE', 0.5));
  o.push(rect(15, -6, 5, 6, '#A9ACAE', 0.5));
  o.push(rect(-13, -10, 26, 4, '#B9BCBE', 0.6, 1));
  o.push(rect(-16, -38, 32, 28, '#C9CBCC', 0.9, 2));
  o.push(box(9, -37.4, 6.4, 26.8, '#B4B7B9'));
  o.push(rect(-13, -35, 22, 19, '#2E3F5C', 0.6, 1.5));
  o.push(rect(-11, -33, 10, 7, '#9AA8C2', 0.3));
  o.push(rect(-6, -27, 12, 8, '#C9D2E0', 0.3));
  for (let k = 0; k < 3; k++) o.push(box(-4.6, -24.6 + k * 2, 8, 0.6, '#5A6A88'));
  o.push(rect(-12, -2, 22, 2, '#2A2A2E', 0.4));
  return o.join('');
}
/** Night in the garage: the windows gone dark, rain on them (laid over the far wall). */
export function garageNight() {
  const o = [];
  for (let k = 0; k < 4; k++) {
    const x = 124 + 6 + k * 40.5;
    o.push(box(x + 1, 303, 30, 16, '#1E2638'));
    for (let j = 0; j < 5; j++) o.push(line(`M${x + 4 + j * 6},${304 + (j % 2) * 4} l-2,6`, '#8A9AB4', 0.5));
  }
  o.push(box(64, 338, 36, 144, '#1A2230'));
  return o.join('');
}

// ── the table make-lesson-art reads ──────────────────────────────────────────
const at = (name, fn, view) => ({ name: `amazon1-${name}`, svg: fn, view, box: view });
const FULL = { x: 0, y: 214, w: 400, h: 300 };
export const ART = [
  // the office
  at('city', city, FULL),
  at('office', office, FULL),
  at('desk', desk, FULL),
  at('door', glassDoor, { x: -2, y: -2, w: 56, h: 244 }),
  at('printout', printout, { x: -16, y: -21, w: 32, h: 42 }),
  at('softbox', softBox, { x: -9, y: -22, w: 18, h: 23 }),
  at('cd', cd, { x: -9, y: -17, w: 18, h: 18 }),
  at('book', book, { x: -8, y: -22, w: 18, h: 23 }),
  at('books-top', booksTop, { x: 0, y: -14, w: 152, h: 14.5 }),
  at('books-low', booksLow, { x: 0, y: -13, w: 152, h: 13.5 }),
  at('box', cardBox, { x: -22, y: -32, w: 44, h: 33 }),
  at('coat', coat, { x: -9, y: -4, w: 18, h: 29 }),
  // the road
  at('dusk', dusk, FULL),
  at('plains', plainsStrip, { x: 0, y: 340, w: 800, h: 140 }),
  at('road', road, FULL),
  at('dashes', dashes, { x: 0, y: 488, w: 800, h: 4 }),
  at('cascades', cascades, { x: 176, y: 334, w: 224, h: 62 }),
  at('car-in', carIn, FULL),
  at('car-out', carOut, FULL),
  at('wheel', wheel, { x: -24, y: -24, w: 48, h: 48 }),
  at('laptop', laptop, { x: -1, y: -24, w: 28, h: 28 }),
  at('atlas-dash', atlasDash, { x: -17, y: -4, w: 34, h: 8 }),
  at('atlas-held', atlasHeld, { x: -18, y: -12, w: 36, h: 24 }),
  at('pin', pin, { x: -2, y: -19, w: 11, h: 21 }),
  at('insert', insert, FULL),
  at('insert-dest', insertDest, FULL),
  // the garage
  at('garage-far', garageFar, FULL),
  at('garage-mid', garageMid, FULL),
  at('backdoor', backDoor, { x: -1, y: -1, w: 38, h: 146 }),
  at('door-face', doorFace, { x: -71, y: -18, w: 142, h: 36 }),
  at('door-top', doorTop, { x: -71, y: -11, w: 146, h: 12 }),
  at('leg', deskLeg, { x: -4, y: -1, w: 8, h: 28 }),
  at('drill', drill, { x: -7, y: -15, w: 23, h: 20 }),
  at('backpack', backpack, { x: -14, y: -1, w: 17, h: 27 }),
  at('workstation', workstation, { x: -21, y: -39, w: 42, h: 40 }),
  at('garage-night', garageNight, FULL),
];
