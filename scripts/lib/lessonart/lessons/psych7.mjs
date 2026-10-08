// psychology-foundations-7 — the recap: an Edwardian psychology laboratory in the morning,
// then a busy railway concourse (LESSON_RULES AM13; the recap's full settings, in layers).
//
// Every picture is in SCENE units with the band [214, 514], 400 × 300. Flat fills lit from
// the top left, a darker shaded side, one dark outline; real colours, no gradients, no glows.
//
// REFERENCES (npm run ref, scratchpad/ref/ps7*):
//   ps7lab-1     Wundt's laboratory, Leipzig (public domain photograph): dark wood
//                panelling, a plain table carrying brass apparatus and a telegraph key on
//                wires, a big wall clock, a chart of curves pinned to the wall.
//   ps7chrono-1/2  Hipp chronoscope, c. 1890 (MSI Chicago, CC0): brass clockwork with two
//                white dials under a GLASS DOME, standing on a wooden plinth carried by
//                four black columns with turned brass collars, a weight hanging between.
//   ps7metro-1   Maelzel metronome: a tall wooden pyramid, a brass scale up its open
//                face, a steel pendulum rod with a sliding weight, the pivot low down.
//   ps7snellen-1 Snellen chart: one big letter on top, rows of black capitals shrinking.
//   ps7shed-1    St Pancras train shed: a great pointed arch of riveted iron ribs, glazing
//                between them, a brick screen wall with tall arched openings below.
//   ps7station-2 London Victoria: an iron-and-glass roof over a stone and red-brick facade.
//   ps7board-1   a flap departures board: a black case, rows of times in amber, a
//                platform number in a white square.
//   ps7clock-2   a double-sided railway clock hung from a wrought-iron bracket: a navy
//                case, a cream face, heavy black hour bars.
//   ps7vend-1    Stollwerck chocolate vending machines (CC BY-SA): tall narrow cabinets
//                on a plinth, a little window on the goods, a coin slot and a drawer.

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
const txt = (x, y, s, size, c = OUT, anchor = 'middle', weight = 700) => `<text x="${f2(x)}" y="${f2(y)}" font-family="Arial, Helvetica, sans-serif" font-weight="${weight}" font-size="${size}" fill="${c}" text-anchor="${anchor}">${s}</text>`;

// ── palette ──────────────────────────────────────────────────────────────────
const CEIL = '#EFE6D2', CEIL_D = '#DCCFB2';
const WALL = '#E6D7B6', WALL_D = '#D2C09A', WALL_L = '#F0E4C8';
const OAK = '#7E5434', OAK_D = '#5F3D24', OAK_L = '#9C6C44', OAK_DD = '#4A2F1B';
const FLOOR = '#C79A63', FLOOR_D = '#AD8250', FLOOR_L = '#DDB47E';
const SKY = ['#8DC3E6', '#A6D0EC', '#BDDDF0', '#D3E8F3'];
const PAINT = '#F2EDE2', PAINT_D = '#D9D1BF';
const SLATE = '#2F3D37', SLATE_D = '#25302B', CHALK = '#ECE9DC';
const BRASS = '#CDA54C', BRASS_D = '#A27F2E', BRASS_L = '#E6C677';
const GLASS = '#CFE3EA', GLASS_D = '#AFCAD4';
const LEATHER = '#7A3E2C', LEATHER_D = '#5C2C1F';
const GREEN = '#3E6B4C', GREEN_D = '#2C4F37';
const BRICK = '#A9553A', BRICK_D = '#8A4029', BRICK_L = '#BE6A4C';
const STONE = '#DCCFB4', STONE_D = '#C1B293', STONE_L = '#EAE0CA';
const IRON = '#3E4A52', IRON_D = '#2B343A';
const NAVY = '#2E3F6E', NAVY_D = '#22305A';

/** Flat bands of sky, lightest at the horizon. */
function sky(x, y0, w, h) {
  const out = [];
  const bands = [0, 0.3, 0.55, 0.78, 1];
  for (let k = 0; k < 4; k++) out.push(box(x, y0 + h * bands[k], w, h * (bands[k + 1] - bands[k]) + 0.3, SKY[k]));
  return out.join('');
}
/** A tall arched window: sky and the town's roofs outside, a painted frame, glazing bars. */
function archWindow(x0, x1, top, sill) {
  const o = [];
  const w = x1 - x0, r = w / 2, cx = x0 + r;
  const arch = `M${x0},${sill} L${x0},${top + r} A${r},${r} 0 0 1 ${x1},${top + r} L${x1},${sill} Z`;
  o.push(`<clipPath id="win${x0}"><path d="${arch}"/></clipPath>`);
  o.push(`<g clip-path="url(#win${x0})">`);
  o.push(sky(x0, top, w, sill - top));
  // the town outside: slate roofs and chimneys, a church spire
  o.push(flat(`M${x0},${sill - 30} L${x0 + w * 0.2},${sill - 40} L${x0 + w * 0.42},${sill - 32} L${x0 + w * 0.42},${sill} L${x0},${sill} Z`, '#8B97A3'));
  o.push(flat(`M${x0 + w * 0.42},${sill - 26} L${x0 + w * 0.7},${sill - 36} L${x1},${sill - 28} L${x1},${sill} L${x0 + w * 0.42},${sill} Z`, '#76838F'));
  o.push(box(x0 + w * 0.6, sill - 64, 3, 30, '#76838F'));
  o.push(flat(`M${x0 + w * 0.6 - 1},${sill - 64} L${x0 + w * 0.6 + 1.5},${sill - 80} L${x0 + w * 0.6 + 4},${sill - 64} Z`, '#76838F'));
  for (const [fx, h] of [[0.12, 10], [0.3, 8], [0.52, 9], [0.84, 11]]) {
    o.push(box(x0 + w * fx, sill - 40 - h + (fx > 0.42 ? 6 : 0), 4, h, '#9B6B52'));
    o.push(box(x0 + w * fx - 0.6, sill - 40 - h + (fx > 0.42 ? 6 : 0), 5.2, 1.6, '#7E5640'));
  }
  o.push(flat(`M${x0},${sill - 14} L${x1},${sill - 18} L${x1},${sill} L${x0},${sill} Z`, '#B9A98E'));
  // the morning sun on the glass: a pale flat slant
  o.push(flat(`M${x0 + w * 0.15},${top + r} L${x0 + w * 0.35},${top + r} L${x0 + w * 0.1},${sill} L${x0 - w * 0.1},${sill} Z`, '#FFFFFF', 0.18));
  o.push('</g>');
  // glazing bars
  o.push(line(`M${cx},${top} L${cx},${sill}`, PAINT, 2));
  for (let y = top + r + 6; y < sill - 4; y += 22) o.push(line(`M${x0},${y} L${x1},${y}`, PAINT, 1.6));
  o.push(line(`M${x0 + 4},${top + r} A${r - 4},${r - 4} 0 0 1 ${x1 - 4},${top + r}`, PAINT, 1.4));
  // the frame and the deep reveal on its right (the light comes from the left)
  o.push(`<path d="${arch}" fill="none" stroke="${PAINT}" stroke-width="4"/>`);
  o.push(`<path d="${arch}" fill="none" stroke="${OUT}" stroke-width="1"/>`);
  o.push(flat(`M${x1 + 2},${top + r} L${x1 + 7},${top + r + 4} L${x1 + 7},${sill} L${x1 + 2},${sill} Z`, WALL_D));
  // the sill
  o.push(rect(x0 - 6, sill, w + 12, 5, PAINT, 0.8));
  o.push(box(x0 - 5, sill + 3.2, w + 10, 1.6, PAINT_D));
  return o.join('');
}
/** A shelf jar: glass, coloured contents, a cork or a cap. */
function jar(x, yb, w, h, c, cd, cap = '#8A6A44') {
  return rect(x - w / 2, yb - h, w, h, GLASS, 0.6, 1.2)
    + box(x - w / 2 + 0.8, yb - h * 0.62, w - 1.6, h * 0.62 - 0.8, c)
    + box(x + w * 0.1, yb - h * 0.62, w * 0.35, h * 0.62 - 0.8, cd)
    + box(x - w / 2 + 1, yb - h + 1.4, 1, h - 3, '#FFFFFF', 0.6)
    + rect(x - w / 2 - 0.4, yb - h - 2, w + 0.8, 2.2, cap, 0.5);
}
/** A traveller at a distance: a coat, a hat, a face, perhaps a case. */
function traveller(x, yb, h, coat, coatD, hat, opts = {}) {
  const { dir = 1, skin = '#D9A27A', skirt = false, case_ = null } = opts;
  const o = [];
  const hw = h * 0.16;
  if (skirt) o.push(fill(`M${x - hw * 1.5},${yb} L${x - hw * 0.7},${yb - h * 0.72} L${x + hw * 0.7},${yb - h * 0.72} L${x + hw * 1.5},${yb} Z`, coat, 0.6));
  else {
    o.push(box(x - hw * 0.6, yb - h * 0.3, hw * 0.5, h * 0.3, '#2E2A28'));
    o.push(box(x + hw * 0.1, yb - h * 0.3, hw * 0.5, h * 0.3, '#2E2A28'));
    o.push(fill(`M${x - hw * 1.05},${yb - h * 0.26} L${x - hw * 0.75},${yb - h * 0.74} L${x + hw * 0.75},${yb - h * 0.74} L${x + hw * 1.05},${yb - h * 0.26} Z`, coat, 0.6));
  }
  o.push(flat(`M${x + hw * 0.15 * dir},${yb - h * 0.73} L${x + hw * 0.75 * dir},${yb - h * 0.74} L${x + hw * (skirt ? 1.5 : 1.05) * dir},${yb - (skirt ? 0 : h * 0.26)} L${x + hw * 0.3 * dir},${yb - (skirt ? 0 : h * 0.26)} Z`, coatD));
  o.push(circ(x + dir * 0.4, yb - h * 0.83, h * 0.105, skin, 0.6));
  if (hat === 'bowler') {
    o.push(fill(`M${x - h * 0.15},${yb - h * 0.88} L${x + h * 0.15},${yb - h * 0.88} L${x + h * 0.11},${yb - h * 0.9} C${x + h * 0.11},${yb - h * 1.02} ${x - h * 0.11},${yb - h * 1.02} ${x - h * 0.11},${yb - h * 0.9} Z`, '#2B2622', 0.5));
  } else if (hat === 'boater') {
    o.push(rect(x - h * 0.15, yb - h * 0.9, h * 0.3, h * 0.025, '#E8D29A', 0.4));
    o.push(rect(x - h * 0.09, yb - h * 0.98, h * 0.18, h * 0.08, '#E8D29A', 0.4));
    o.push(box(x - h * 0.09, yb - h * 0.935, h * 0.18, h * 0.025, '#2E3F6E'));
  } else if (hat === 'lady') {
    o.push(ell(x, yb - h * 0.91, h * 0.17, h * 0.035, '#5A3B5E', 0.5));
    o.push(ell(x - h * 0.03, yb - h * 0.95, h * 0.09, h * 0.05, '#5A3B5E', 0.5));
    o.push(circ(x + h * 0.06, yb - h * 0.97, h * 0.03, '#D8A0B4', 0.3));
  } else if (hat === 'cap') {
    o.push(fill(`M${x - h * 0.11},${yb - h * 0.9} C${x - h * 0.1},${yb - h * 1} ${x + h * 0.12},${yb - h * 1} ${x + h * 0.12},${yb - h * 0.9} L${x + h * 0.17 * dir},${yb - h * 0.89} Z`, '#4E4A3E', 0.5));
  }
  if (case_) o.push(rect(x + dir * hw * 1.2 - (dir < 0 ? h * 0.3 : 0), yb - h * 0.3, h * 0.3, h * 0.22, case_, 0.6, 1)
    + line(`M${x + dir * hw * 1.2 + (dir < 0 ? -h * 0.2 : h * 0.1)},${yb - h * 0.3} l${h * 0.1},-${h * 0.04}`, OUT, 0.5));
  return o.join('');
}

// ══════════════════════════════════════════════════════════════════════════════
// THE LABORATORY (x 0–400)
// ══════════════════════════════════════════════════════════════════════════════

/** FAR: the ceiling and cornice, the plaster wall with the arched window, the eye chart,
 *  the blackboard with its reaction-time graph, the oak panelling and the parquet floor. */
export function labFar() {
  const o = [];
  // the ceiling and its beams
  o.push(box(0, 214, 400, 26, CEIL));
  o.push(box(0, 232, 400, 8, CEIL_D));
  for (const x of [60, 200, 340]) o.push(rect(x - 6, 214, 12, 20, CEIL_D, 0.6));
  // the wall
  o.push(box(0, 240, 400, 180, WALL));
  o.push(box(290, 240, 110, 180, WALL_D, 0.35));
  // the cornice under the ceiling
  o.push(rect(-2, 236, 404, 6, PAINT, 0.7));
  o.push(box(0, 241.4, 400, 2, PAINT_D));
  // a picture rail
  o.push(line('M0,282 L400,282', OAK_D, 1.4));
  // the arched window, with its light thrown down to the right across the floor
  o.push(archWindow(46, 104, 254, 404));
  // the laboratory clock on the wall over the cabinet (Wundt's room had one)
  o.push(line('M143,262 L143,266', OUT, 0.8));
  o.push(circ(143, 284, 17, OAK, 1));
  o.push(circ(143, 284, 13.6, '#F7F2E4', 0.7));
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * Math.PI * 2;
    o.push(line(`M${f2(143 + Math.sin(a) * 10.6)},${f2(284 - Math.cos(a) * 10.6)} L${f2(143 + Math.sin(a) * 12.6)},${f2(284 - Math.cos(a) * 12.6)}`, OUT, k % 3 ? 0.6 : 1.2));
  }
  o.push(flat('M152,272 C157,276 159,282 158,290 C156,284 154,278 150,274 Z', '#5F3D24', 0.5));
  // two green enamel pendant lamps on their cords
  for (const x of [196, 316]) {
    o.push(line(`M${x},240 L${x},258`, '#2B2622', 0.8));
    o.push(fill(`M${x - 9},266 C${x - 9},258 ${x + 9},258 ${x + 9},266 Z`, GREEN, 0.8));
    o.push(flat(`M${x + 2},258.6 C${x + 6},259.4 ${x + 9},262 ${x + 9},266 L${x + 3},266 Z`, GREEN_D));
    o.push(rect(x - 2, 256, 4, 3, BRASS, 0.5));
    o.push(ell(x, 266.2, 7.6, 1.4, '#F4E7B4', 0.5));
  }
  // the eye chart: a white card on the wall, letters shrinking row by row
  o.push(rect(178, 292, 40, 62, '#FBF8F0', 0.9, 1));
  o.push(box(210, 293, 7, 60, '#E8E2D2'));
  o.push(txt(198, 309, 'E', 13));
  o.push(txt(198, 320, 'F P', 6.6));
  o.push(txt(198, 328, 'T O Z', 5));
  o.push(txt(198, 335, 'L P E D', 3.8));
  o.push(txt(198, 341, 'P E C F D', 3));
  o.push(txt(198, 346, 'E D F C Z P', 2.4));
  o.push(line('M188,349 L208,349', '#B23A2E', 0.5));
  o.push(line('M198,290 L198,286', OUT, 0.6));
  // the blackboard in its oak frame, a chalk graph of reaction times
  o.push(rect(232, 288, 156, 84, OAK, 1.1, 1.5));
  o.push(rect(237, 293, 146, 74, SLATE, 0.7));
  o.push(box(318, 294, 64, 72, SLATE_D, 0.6));
  o.push(line('M250,300 L250,356 L372,356', CHALK, 1.1));                       // the axes
  for (let k = 1; k < 6; k++) o.push(line(`M${250 + k * 20},356 L${250 + k * 20},358.6`, CHALK, 0.7));
  for (let k = 1; k < 5; k++) o.push(line(`M247.4,${356 - k * 11} L250,${356 - k * 11}`, CHALK, 0.7));
  // a bell curve of reaction times, and its dots
  o.push(line('M252,353 C276,352 290,346 300,328 C306,316 312,306 318,306 C326,306 332,318 338,330 C348,348 360,352 370,353', CHALK, 1.2));
  for (const [x, y] of [[268, 350], [282, 345], [294, 334], [304, 318], [314, 307], [324, 309], [332, 320], [342, 337], [354, 348]]) o.push(circ(x, y, 1.1, CHALK, 0));
  o.push(line('M318,302 L318,356', '#E9C46A', 0.7));
  o.push(txt(262, 304, 'ms', 6, CHALK, 'start', 400));
  o.push(txt(352, 366, '0.2 s', 5.2, CHALK, 'start', 400));
  // the chalk ledge, a stick of chalk and a duster
  o.push(rect(234, 371, 152, 3.4, OAK_L, 0.7));
  o.push(rect(270, 368.6, 9, 2.4, '#7A5A3C', 0.4));
  o.push(rect(352, 369.6, 7, 1.8, CHALK, 0.3));
  // the panelling: a dado rail, raised panels, a skirting
  // a light honey oak, so a figure in ink stands out against it
  o.push(box(0, 412, 400, 78, '#B88A5A'));
  o.push(rect(-2, 410, 404, 5, '#CFA171', 0.8));
  for (let x = 4; x < 400; x += 40) {
    o.push(rect(x, 420, 32, 58, '#A87A4C', 0.6, 1));
    o.push(box(x + 2, 421, 28, 3, '#CFA171', 0.6));
    o.push(box(x + 26, 424, 5, 53, '#8E6440', 0.5));
  }
  o.push(rect(-2, 482, 404, 6, OAK_DD, 0.8));
  // the parquet floor: herringbone in honey oak, the sun's patch from the window
  o.push(box(0, 488, 400, 26, FLOOR));
  o.push(line('M0,488 L400,488', OUT, 1));
  for (let r = 0; r < 4; r++) {
    const y = 489 + r * 6.4;
    o.push(line(`M0,${f2(y + 6.4)} L400,${f2(y + 6.4)}`, FLOOR_D, 0.4));
    for (let x = (r % 2) * 7 - 8; x < 410; x += 14) {
      o.push(line(`M${f2(x)},${f2(y)} L${f2(x + 7)},${f2(y + 6.4)} M${f2(x + 14)},${f2(y)} L${f2(x + 7)},${f2(y + 6.4)}`, FLOOR_D, 0.5));
      if ((x + r * 3) % 28 < 14) o.push(flat(P([[x + 1, y + 0.6], [x + 6, y + 5.6], [x + 8.6, y + 5.6], [x + 3.6, y + 0.6]]), FLOOR_L, 0.55));
    }
  }
  o.push(flat('M70,488 L128,488 L176,514 L102,514 Z', '#FFF3D6', 0.32));
  return o.join('');
}

/** MID: the door frame and its dark doorway, the glass-fronted cabinet, the coat stand. */
export function labMid() {
  const o = [];
  // the doorway: a moulded oak frame round a dark hall
  o.push(rect(2, 368, 44, 122, OAK_L, 1));
  o.push(rect(7, 374, 34, 114, '#3A2C22', 0.8));
  o.push(box(8, 375, 32, 20, '#2C2119'));
  o.push(box(8, 470, 32, 18, '#4A3A2C'));
  o.push(rect(0, 364, 48, 6, OAK, 0.8));
  // the coat stand: a bentwood pole, a bowler on a peg, a coat, an umbrella against it
  const cx = 64;
  o.push(line(`M${cx},392 L${cx},486`, OAK_D, 3));
  o.push(line(`M${cx - 8},486 L${cx},476 L${cx + 8},486`, OAK_D, 2.2));
  o.push(line(`M${cx},396 C${cx - 6},394 ${cx - 9},397 ${cx - 9},401 M${cx},396 C${cx + 6},394 ${cx + 9},397 ${cx + 9},401`, OAK_D, 1.6));
  o.push(fill(`M${cx - 12},402 L${cx - 5},400 L${cx - 2},432 L${cx - 14},434 Z`, '#55606E', 0.8));
  o.push(flat(`M${cx - 6},401 L${cx - 5},400 L${cx - 2},432 L${cx - 6},432.6 Z`, '#424C58'));
  o.push(fill(`M${cx + 2},393 L${cx + 16},393 L${cx + 13},391.6 C${cx + 13},384 ${cx + 5},384 ${cx + 5},391.6 Z`, '#2B2622', 0.7));
  o.push(line(`M${cx + 9},430 L${cx + 13},484`, '#2B2622', 1.2));
  o.push(fill(`M${cx + 7},432 C${cx + 4},446 ${cx + 8},470 ${cx + 12},478 C${cx + 15},466 ${cx + 15},446 ${cx + 10},431 Z`, '#2D3B52', 0.7));
  o.push(line(`M${cx + 9},430 C${cx + 9},426 ${cx + 6},425 ${cx + 5},428`, '#6B4A2E', 1.2));
  // a bentwood chair under the window
  o.push(line('M88,488 L90,462 M104,488 L102,462', '#5A3A22', 1.8));
  o.push(rect(84, 459, 24, 3.6, '#7A5232', 0.7));
  o.push(line('M88,459 C86,446 88,436 96,434 C104,436 106,446 104,459', '#5A3A22', 1.8));
  o.push(line('M90,452 C92,446 100,446 102,452', '#5A3A22', 1.1));
  // the cabinet: a cornice, two glazed doors, shelves of jars and apparatus, a cupboard base
  const X0 = 114, X1 = 172;
  o.push(rect(X0 - 3, 318, X1 - X0 + 6, 7, OAK_L, 1));
  o.push(rect(X0, 325, X1 - X0, 112, OAK, 1));
  o.push(rect(X0 + 4, 329, (X1 - X0) / 2 - 6, 104, GLASS, 0.7));
  o.push(rect(X0 + (X1 - X0) / 2 + 2, 329, (X1 - X0) / 2 - 6, 104, GLASS, 0.7));
  // the shelves and what is on them
  for (const y of [356, 384, 412]) o.push(box(X0 + 4, y, X1 - X0 - 8, 1.6, OAK_D));
  o.push(jar(122, 356, 6, 13, '#C9862F', '#A86A1E'));
  o.push(jar(130, 356, 5, 10, '#6E9A5A', '#557D43'));
  o.push(jar(152, 356, 7, 15, '#B84A3A', '#963828'));
  o.push(jar(162, 356, 5, 11, '#E8E2C8', '#CFC7A6'));
  // a model of a brain on a stand, the phrenologist's head beside it
  o.push(fill('M126,383 C122,383 120,378 123,374 C123,370 128,368 132,370 C135,367 141,368 141,373 C144,376 142,382 137,382 Z', '#E2A3A0', 0.6));
  o.push(line('M125,377 C128,375 130,378 133,375 M130,372 C132,374 135,372 137,375 M128,380 C131,378 134,381 137,378', '#B97B78', 0.6));
  o.push(rect(129, 382, 6, 2, OAK_D, 0.4));
  o.push(fill('M150,384 L150,380 C146,380 145,374 146,370 C146,364 150,362 155,362 C160,362 163,366 163,371 C163,376 160,380 158,380 L158,384 Z', '#F2EBDA', 0.6));
  o.push(line('M149,368 L162,368 M147,373 L163,373 M155,363 L155,380', '#9A8A6A', 0.4));
  o.push(jar(124, 412, 6, 14, '#5C88A8', '#466D8A'));
  o.push(jar(134, 412, 5, 9, '#D9B64F', '#B8962F'));
  o.push(rect(146, 404, 18, 8, BRASS, 0.6, 1));          // a brass instrument case
  o.push(circ(155, 407.6, 2.4, '#F4EFE2', 0.4));
  o.push(rect(118, 426, 10, 7, '#7A5A3C', 0.5));         // two little boxes
  o.push(rect(130, 428, 12, 5, '#4E6E5E', 0.5));
  o.push(ell(156, 431, 7, 2, '#E8E2C8', 0.5));
  // the glass, catching the window's light
  for (const gx of [X0 + 8, X0 + (X1 - X0) / 2 + 6]) o.push(flat(P([[gx, 334], [gx + 6, 334], [gx + 1, 352], [gx - 5, 352]]), '#FFFFFF', 0.4));
  o.push(box(X0 + (X1 - X0) / 2 - 2, 329, 4, 104, OAK));
  o.push(circ(X0 + (X1 - X0) / 2 - 3, 381, 1, BRASS, 0.3));
  o.push(circ(X0 + (X1 - X0) / 2 + 3, 381, 1, BRASS, 0.3));
  // the base cupboard
  o.push(rect(X0 - 2, 437, X1 - X0 + 4, 51, OAK_L, 1));
  o.push(rect(X0 + 3, 442, (X1 - X0) / 2 - 4, 40, OAK, 0.6));
  o.push(rect(X0 + (X1 - X0) / 2 + 1, 442, (X1 - X0) / 2 - 4, 40, OAK, 0.6));
  o.push(box(X1 - 14, 438, 15, 49, OAK_D, 0.5));
  o.push(box(X0 + 4, 325.6, X1 - X0 - 8, 2, OAK_D));
  // the cabinet's shadow on the panelling
  o.push(flat(`M${X1 + 2},326 L${X1 + 8},330 L${X1 + 8},488 L${X1 + 2},488 Z`, '#000', 0.14));
  return o.join('');
}

/** NEAR: the long oak bench over his legs: its top, apron and legs, the green lamp, the
 *  stack of notebooks, the tray of saucers, the coffee pot, the key's wires. */
export function labBench() {
  const o = [];
  // the floor shadow under it
  o.push(flat('M206,500 L398,500 L400,506 L204,506 Z', '#000', 0.12));
  // the legs (back legs first, a touch higher and darker), the stretcher
  o.push(rect(214, 470, 7, 28, OAK_D, 0.8));
  o.push(rect(386, 470, 7, 28, OAK_D, 0.8));
  o.push(rect(206, 470, 8, 31, OAK, 0.9));
  o.push(box(210.5, 471, 3, 29, OAK_D));
  o.push(rect(390, 470, 8, 31, OAK, 0.9));
  o.push(box(394.5, 471, 3, 29, OAK_D));
  o.push(rect(213, 490, 178, 3.4, OAK_D, 0.7));
  // the top: the far edge, the lit top face, the front edge and the apron
  o.push(fill('M206,461 L398,461 L400,466 L204,466 Z', OAK_L, 0.9));
  o.push(rect(203, 466, 198, 4.4, OAK, 0.9));
  o.push(box(204, 469, 196, 1.2, OAK_D));
  o.push(rect(208, 470.4, 188, 9, OAK_D, 0.8));
  o.push(line('M260,475 L262,475 M320,475 L322,475', BRASS, 1.2));       // drawer pulls
  o.push(line('M232,470.4 L232,479.4 M292,470.4 L292,479.4 M352,470.4 L352,479.4', OAK_DD, 0.6));
  // the wires from the key along the back of the bench to the timer
  o.push(line('M343,465 C330,463 300,462.4 280,462.2 C266,462 258,462.6 254,462', '#7A3B2A', 0.7));
  o.push(line('M343,464.4 C330,462.6 300,461.8 280,461.6 C266,461.4 260,462 255,461.4', '#2F4E68', 0.6));
  // the tray of saucers (the cups sit on them), and the coffee pot behind
  o.push('<g transform="translate(298 465.6) scale(1.3) translate(-298 -465.6)">');
  o.push(fill('M278,465.6 L314,465.6 L312,463.4 L280,463.4 Z', '#C9CCCE', 0.7));
  o.push(line('M277,464.4 L276,462.8 M315,464.4 L316,462.8', '#9EA2A6', 0.8));
  o.push(ell(289.2, 463.4, 5.2, 1.1, '#F6F3EC', 0.5));
  o.push(ell(305, 463.4, 5.2, 1.1, '#F6F3EC', 0.5));
  // the coffee pot: enamel, a lid knob, a curved spout and a handle
  o.push(fill('M290.4,461.6 L301.6,461.6 L300.2,447.4 C300.2,445 291.8,445 291.8,447.4 Z', '#E9E4D6', 0.8));
  o.push(flat('M297,447 C299,447.4 300.2,447.8 300.2,448 L301.6,461.6 L297.6,461.6 Z', '#CFC8B4'));
  o.push(fill('M292.6,446 C292.6,443.4 299.4,443.4 299.4,446 Z', '#E9E4D6', 0.6));
  o.push(circ(296, 442.8, 0.9, '#3B3B3B', 0.3));
  o.push(line('M291.6,452 C288,450 287.4,447 286,445.4', '#E9E4D6', 1.8));
  o.push(line('M291.6,452 C288,450 287.4,447 286,445.4', OUT, 0.35));
  o.push(line('M300.6,449 C304.6,449 305,457 300.8,457.6', '#3B3B3B', 1.1));
  o.push(line('M291.4,456 L300.8,456', '#2F4E68', 0.9));
  o.push('</g>');
  // the saucer his own cup sits on, at the back
  o.push(ell(328, 461.2, 6.5, 1.3, '#F6F3EC', 0.5));
  // the stack of leather notebooks, the green-shaded lamp
  o.push('<g transform="translate(386 461) scale(1.22) translate(-386 -461)">');
  o.push(rect(372, 456, 15, 3, '#5E3A2A', 0.6, 0.6));
  o.push(rect(373, 453, 13, 3, '#2F4E44', 0.6, 0.6));
  o.push(rect(371.4, 450, 15, 3, '#7A3E2C', 0.6, 0.6));
  o.push(rect(374, 447.6, 12, 2.4, '#3E3A5C', 0.5, 0.6));
  o.push(box(372, 456.8, 14, 1, '#F0E8D4'));
  o.push(ell(391, 461, 5.4, 1.4, BRASS, 0.6));
  o.push(line('M391,461 L391,446', BRASS_D, 1.2));
  o.push(line('M391,446 L388,442', BRASS_D, 1));
  o.push(fill('M380,442.6 C380,437 396,437 396,442.6 Z', GREEN, 0.8));
  o.push(flat('M388,437.6 C392.6,437.8 396,439.6 396,442.6 L390,442.6 Z', GREEN_D));
  o.push(box(381, 442.2, 14, 1.2, '#F4E7B4'));
  o.push('</g>');
  return o.join('');
}

/** The Hipp chronoscope, origin at the middle of its plinth's foot: a wooden plinth on four
 *  black columns, the brass works with two white dials under a glass dome. */
export function chronoscope() {
  const o = [];
  // base and plinth
  o.push(rect(-11, -3, 22, 3, OAK, 0.7, 0.6));
  o.push(box(3, -2.6, 7.6, 2.2, OAK_D));
  for (const x of [-8.6, -4, 4, 8.6]) {
    o.push(rect(x - 1, -14, 2, 11, '#222', 0.4));
    o.push(box(x - 1.2, -6, 2.4, 1.2, BRASS));
    o.push(box(x - 1.2, -13.4, 2.4, 1.2, BRASS));
  }
  // the weight hanging between the columns
  o.push(line('M0,-14.6 L0,-9', '#6B5A3A', 0.4));
  o.push(rect(-2.2, -9, 4.4, 3.4, BRASS, 0.4, 0.6));
  o.push(rect(-10.6, -16.4, 21.2, 2.4, OAK_L, 0.7, 0.4));
  // the works and dials
  o.push(rect(-6, -29, 12, 12.4, BRASS, 0.7, 0.6));
  o.push(box(1.6, -28.4, 4, 11.2, BRASS_D));
  o.push(circ(-0.4, -25.4, 3.2, '#F4EFE2', 0.5));
  o.push(circ(-0.4, -20.2, 2.6, '#F4EFE2', 0.5));
  o.push(line('M-0.4,-25.4 L-0.4,-28 M-0.4,-20.2 L1.4,-21.2', OUT, 0.4));
  // the dome
  o.push(`<path d="M-8.4,-16.4 L-8.4,-27 C-8.4,-35.4 8.4,-35.4 8.4,-27 L8.4,-16.4 Z" fill="${GLASS}" fill-opacity="0.35" stroke="${OUT}" stroke-width="0.6"/>`);
  o.push(flat('M-6.6,-26 C-6.6,-30.6 -3.6,-32.6 -1,-33 C-3.8,-31 -5,-28.6 -5,-24 L-5,-18 L-6.6,-18 Z', '#FFFFFF', 0.7));
  o.push(rect(-9.4, -17.6, 18.8, 1.6, '#2B2622', 0.4));
  return o.join('');
}

/** A white cup without its saucer, origin at the middle of its foot, handle to the right. */
export function cup() {
  return fill('M-3.6,-6.4 L3.6,-6.4 L3,-1.6 C2.6,-0.4 1.6,0 0,0 C-1.6,0 -2.6,-0.4 -3,-1.6 Z', '#F6F3EC', 0.55)
    + flat('M1.4,-6 L3.4,-6 L2.8,-1.6 C2.5,-0.7 2,-0.3 1,-0.2 Z', '#D9D3C4')
    + line('M3.4,-5.2 C5.8,-5.4 5.8,-2.2 3,-2.4', '#F6F3EC', 0.9)
    + line('M3.4,-5.2 C5.8,-5.4 5.8,-2.2 3,-2.4', OUT, 0.3)
    + `<ellipse cx="0" cy="-6.4" rx="3.6" ry="0.7" fill="#5C3A22" stroke="${OUT}" stroke-width="0.35"/>`;
}

/** A jar of coffee beans, origin at its foot: glass, the beans, a brass screw lid. */
export function beanJar() {
  const o = [];
  o.push(rect(-5, -13, 10, 13, GLASS, 0.6, 1.6));
  o.push(box(-4.2, -10, 8.4, 9.2, '#5A3620'));
  o.push(box(0.8, -10, 3.4, 9.2, '#43281A'));
  for (const [x, y] of [[-3, -8.4], [-0.6, -9], [1.8, -8.2], [-2, -5.6], [0.6, -6.2], [2.8, -5], [-3.2, -2.8], [-0.8, -3.2], [1.6, -2.4]]) {
    o.push(ell(x, y, 0.9, 0.6, '#7A4A2A', 0.2));
    o.push(line(`M${x - 0.5},${y} L${x + 0.5},${y}`, '#2E1A10', 0.2));
  }
  o.push(flat('M-4,-12 L-3,-12 L-3,-1.4 L-4,-1.4 Z', '#FFFFFF', 0.6));
  o.push(rect(-5.4, -15.6, 10.8, 3, BRASS, 0.6, 0.6));
  o.push(line('M-4.6,-14.6 L4.6,-14.6', BRASS_D, 0.4));
  return o.join('');
}

/** His notebook, shut and lying flat, origin at the middle of its foot: a brown cover
 *  seen from the front and a little above, a paper label on it. */
export function opinionBook() {
  return fill('M-10,-1.2 L-7.6,-5.4 L10,-5.4 L10,-1.2 Z', LEATHER, 0.6)
    + rect(-10, -1.4, 20, 1.6, '#F2EAD6', 0.5)
    + flat('M-1,-5 L5.8,-5 L5,-2.4 L-1.8,-2.4 Z', '#F2EAD6')
    + line('M-0.6,-4 L4.8,-4 M-1,-3.2 L3.6,-3.2', '#7A6A54', 0.3)
    + line('M-7.6,-5.4 L-10,-1.2', LEATHER_D, 0.7);
}

/** The logbook lying OPEN, origin at the middle of its foot: two pages ruled, a ribbon. */
export function logbookOpen() {
  const o = [];
  o.push(fill('M-12,-0.4 L-10,-6.4 L10,-6.4 L12,-0.4 Z', '#5E3A2A', 0.6));
  o.push(fill('M-11,-1 L-9.2,-6 C-5,-6.6 -1.6,-6.4 0,-5.6 L0,-0.6 C-3,-1.6 -7,-1.6 -11,-1 Z', '#FBF6EA', 0.45));
  o.push(fill('M11,-1 L9.2,-6 C5,-6.6 1.6,-6.4 0,-5.6 L0,-0.6 C3,-1.6 7,-1.6 11,-1 Z', '#F0E8D4', 0.45));
  for (let k = 0; k < 4; k++) {
    const y = -5 + k * 1.05;
    o.push(line(`M${-8.6 + k * 0.3},${f2(y)} L-1.4,${f2(y + 0.2)}`, '#7A8AA8', 0.25));
    o.push(line(`M1.4,${f2(y + 0.2)} L${8.6 - k * 0.3},${f2(y)}`, '#7A8AA8', 0.25));
  }
  o.push(line('M0,-5.6 L0.6,0.8', '#B23A2E', 0.5));
  return o.join('');
}
/** The logbook SHUT, origin at the middle of its foot. */
export function logbookShut() {
  return fill('M-10.4,-1.6 L-8.4,-6 L10.4,-6 L10.4,-1.6 Z', '#5E3A2A', 0.6)
    + rect(-10.4, -1.8, 20.8, 1.8, '#F2EAD6', 0.5)
    + line('M-6,-5.2 L-3,-5.2', BRASS, 0.6)
    + flat('M2,-5.4 L6.4,-5.4 L6,-3 L1.6,-3 Z', '#E9C46A');
}

/** The metronome, origin at the middle of its foot: a wooden pyramid, the brass scale
 *  and the dark recess its rod swings in (the rod and weight are drawn live). */
export function metronome() {
  return fill('M-6.6,0 L-2.2,-22 L2.2,-22 L6.6,0 Z', '#8A5530', 0.7)
    + flat('M1.2,-21.6 L2.2,-22 L6.6,0 L3.4,0 Z', '#6E3F20')
    + fill('M-3.4,-5 L-1.4,-19.6 L1.4,-19.6 L3.4,-5 Z', '#2B211A', 0.4)
    + box(-0.6, -19, 1.2, 13, BRASS)
    + fill('M-2.2,-22 L0,-24 L2.2,-22 Z', '#6E3F20', 0.5)
    + rect(-7.4, -5, 14.8, 5, '#8A5530', 0.6)
    + box(1.6, -4.6, 5.2, 4.2, '#6E3F20');
}

/** The door's oak leaf, origin at its hinge (the left edge, at the floor). */
export function doorLeaf() {
  return rect(0, -112, 32, 112, OAK, 0.9)
    + rect(4, -106, 24, 40, OAK_D, 0.6, 0.6)
    + rect(4, -60, 24, 52, OAK_D, 0.6, 0.6)
    + box(22, -105, 5, 38, OAK_DD, 0.6)
    + box(22, -59, 5, 50, OAK_DD, 0.6)
    + rect(6, -103, 20, 34, '#E7E2C9', 0.4, 0.4)
    + txt(16, -84, 'LABOR-', 3.2, OUT, 'middle', 700)
    + txt(16, -79.6, 'ATORY', 3.2, OUT, 'middle', 700)
    + circ(27.4, -56, 1.6, BRASS, 0.5);
}

// ══════════════════════════════════════════════════════════════════════════════
// THE RAILWAY CONCOURSE — drawn in its own frame (x 0–400), laid at world x 400.
// ══════════════════════════════════════════════════════════════════════════════

/** FAR: the train shed's iron-and-glass roof, the platforms beyond the screen wall, the
 *  train waiting at gate 2 and the steam hanging under the glass. */
export function hallFar() {
  const o = [];
  // the glazing: pale sky through the panes
  o.push(sky(0, 214, 400, 150));
  // the far end of the shed: a great glazed end screen, then the platforms under it
  o.push(box(0, 330, 400, 50, '#BFD4DC'));
  for (let x = 6; x < 400; x += 16) o.push(line(`M${x},330 L${x},380`, '#9AB0BA', 0.7));
  o.push(line('M0,348 L400,348 M0,366 L400,366', '#9AB0BA', 0.7));
  // the platforms and tracks
  o.push(box(0, 380, 400, 92, '#A79C8A'));
  o.push(box(0, 380, 400, 6, '#B9AE9A'));
  for (const y of [410, 432, 456]) {
    o.push(box(0, y, 400, 3, '#7E6E5C'));
    o.push(line(`M0,${y - 1} L400,${y - 1}`, '#6E747A', 0.8));
  }
  // the train standing at gate 2: green carriages and their windows
  o.push(rect(-6, 392, 170, 36, '#3E6650', 0.9, 2));
  o.push(rect(-6, 392, 170, 5, '#2E4E3C', 0.6, 1));
  for (let x = 4; x < 160; x += 14) o.push(rect(x, 400, 9, 9, '#F1DFA8', 0.5, 1));
  o.push(box(-6, 418, 170, 3, '#E2C26A'));
  o.push(box(-6, 428, 170, 6, '#2B2622'));
  for (const x of [16, 42, 110, 136]) o.push(circ(x, 434, 4, '#2B2622', 0.5));
  // the iron roof: a pointed arch of riveted ribs radiating over the glass
  o.push(fill('M-4,214 L404,214 L404,250 C330,236 270,232 200,232 C130,232 70,236 -4,250 Z', IRON, 0.6));
  for (let k = 0; k <= 10; k++) {
    const x = 200 + (k - 5) * 46;
    o.push(line(`M${x},232 L${200 + (k - 5) * 120},372`, IRON, 2.4));
    o.push(line(`M${x},232 L${200 + (k - 5) * 120},372`, '#56646E', 0.8));
  }
  for (const y of [258, 286, 316]) o.push(line(`M-4,${y} C120,${y - 18} 280,${y - 18} 404,${y}`, IRON, 1.4));
  // the shed's big ribs springing from the walls, and the cross bracing
  o.push(line('M-4,372 C30,300 90,248 200,232 C310,248 370,300 404,372', IRON_D, 4));
  o.push(line('M-4,372 C30,300 90,248 200,232 C310,248 370,300 404,372', '#56646E', 1.2));
  // steam hanging under the glass, flat and pale
  o.push(flat('M10,300 C24,290 44,292 52,300 C64,294 82,298 84,308 C70,314 30,314 10,300 Z', '#F4F2EC', 0.75));
  o.push(flat('M240,284 C254,276 270,278 276,286 C290,282 304,288 302,296 C284,300 254,298 240,284 Z', '#F4F2EC', 0.6));
  return o.join('');
}

/** MID + NEAR: the brick-and-stone screen wall with the arched gates 2 and 5 (open, so the
 *  platforms and trains show through), the gate numbers, the stone floor, the porter's
 *  trolley, the slatted bench and the red chocolate machine. */
export function hallMid() {
  const o = [];
  const gates = [[52, 150], [262, 360]];
  // the screen wall with its two arched openings cut out (even-odd)
  let wall = 'M-2,352 L402,352 L402,474 L-2,474 Z';
  for (const [a, b] of gates) {
    const r = (b - a) / 2;
    wall += ` M${a},474 L${a},${396} A${r},${r * 0.5} 0 0 1 ${b},396 L${b},474 Z`;
  }
  o.push(`<path d="${wall}" fill="${BRICK}" fill-rule="evenodd" stroke="${OUT}" stroke-width="1"/>`);
  // brick courses
  for (let y = 358; y < 472; y += 6) {
    let seg = `M-2,${y} L402,${y}`;
    o.push(line(seg, BRICK_D, 0.4));
  }
  // stone dressings: a cornice, piers, the arch rings with keystones
  o.push(rect(-4, 346, 408, 8, STONE, 0.9));
  o.push(box(-2, 351.6, 404, 2, STONE_D));
  for (const x of [0, 186, 226, 380]) {
    o.push(rect(x, 354, 20, 120, STONE, 0.8));
    o.push(box(x + 13, 355, 6, 118, STONE_D));
    for (let y = 366; y < 472; y += 14) o.push(line(`M${x},${y} L${x + 20},${y}`, STONE_D, 0.5));
  }
  for (const [a, b] of gates) {
    const r = (b - a) / 2, cx = (a + b) / 2;
    o.push(`<path d="M${a - 6},474 L${a - 6},396 A${r + 6},${(r + 6) * 0.5} 0 0 1 ${b + 6},396 L${b + 6},474 L${b},474 L${b},396 A${r},${r * 0.5} 0 0 0 ${a},396 L${a},474 Z" fill="${STONE_L}" stroke="${OUT}" stroke-width="0.9"/>`);
    o.push(fill(P([[cx - 6, 362], [cx + 6, 362], [cx + 4.4, 372], [cx - 4.4, 372]]), STONE, 0.7));
    // the iron gates, folded back to each side
    for (const side of [a + 2, b - 14]) {
      o.push(rect(side, 424, 12, 48, 'none', 0.9));
      for (let k = 0; k <= 4; k++) o.push(line(`M${side + k * 3},424 L${side + k * 3},472`, IRON, 0.9));
      o.push(line(`M${side},436 L${side + 12},436 M${side},460 L${side + 12},460`, IRON, 1));
      for (let k = 0; k <= 4; k++) o.push(fill(P([[side + k * 3 - 1, 424], [side + k * 3, 420.4], [side + k * 3 + 1, 424]]), IRON, 0.3));
    }
    // the shadow of the arch on the platform behind
    o.push(flat(`M${a},396 A${r},${r * 0.5} 0 0 1 ${b},396 L${b},402 A${r},${r * 0.5} 0 0 0 ${a},402 Z`, '#000', 0.18));
  }
  // the gate numbers: enamel plates on the keystones' wall
  for (const [x, n] of [[101, '2'], [311, '5']]) {
    o.push(rect(x - 10, 330, 20, 16, NAVY, 0.9, 2));
    o.push(rect(x - 7.4, 332.4, 14.8, 11.2, '#F5F1E6', 0.4, 1.4));
    o.push(txt(x, 342.4, n, 10.6, NAVY));
    o.push(line(`M${x - 4},330 L${x - 4},322 M${x + 4},330 L${x + 4},322`, IRON, 0.7));
  }
  // the stone floor, its flags in perspective
  o.push(rect(-2, 472, 404, 44, STONE, 0.9));
  o.push(box(0, 472.6, 400, 3, STONE_D));
  for (const y of [482, 496]) o.push(line(`M0,${y} L400,${y}`, STONE_D, 0.6));
  for (let x = -40; x < 440; x += 30) o.push(line(`M${f2(200 + (x - 200) * 0.8)},475.6 L${f2(200 + (x - 200) * 1.25)},514`, STONE_D, 0.55));
  for (const [x, y] of [[40, 485], [130, 499], [250, 486], [340, 500], [190, 507]]) o.push(box(x, y, 14, 3, STONE_L, 0.8));
  // the porter's trolley with a trunk and a hatbox, at the left
  o.push(rect(4, 474, 40, 4, '#6B4A2E', 0.8));
  o.push(circ(10, 481, 4, '#2B2622', 0.6));
  o.push(circ(38, 481, 4, '#2B2622', 0.6));
  o.push(line('M44,474 L52,450', '#6B4A2E', 1.6));
  o.push(rect(6, 456, 30, 18, '#8A5A32', 0.8, 1.4));
  o.push(box(6, 462, 30, 2, '#5E3B1C'));
  o.push(rect(10, 446, 16, 10, '#C9AC7E', 0.7, 3));
  // the slatted bench: iron ends, wooden slats, its seat at the height a sitter needs
  const B0 = 270, B1 = 334;
  o.push(flat(`M${B0 - 2},500 L${B1 + 2},500 L${B1 + 4},504 L${B0 - 4},504 Z`, '#000', 0.12));
  for (const x of [B0 + 2, B1 - 2]) {
    o.push(line(`M${x - 3},500 L${x},484 L${x + 3},500`, IRON, 1.6));
    o.push(line(`M${x},484 L${x - 1},466`, IRON, 1.6));
  }
  o.push(rect(B0 - 3, 482.4, B1 - B0 + 6, 3, '#9A6638', 0.8, 0.6));
  o.push(rect(B0 - 2, 485.6, B1 - B0 + 4, 2, '#734A27', 0.6, 0.4));
  for (const y of [468, 473]) o.push(rect(B0 - 2, y, B1 - B0 + 4, 3, '#9A6638', 0.7, 0.6));
  // the chocolate machine: a tall red cabinet on a plinth, a window on its goods, the
  // coin slot, the drawer the bar drops into
  const M0 = 360, M1 = 394;
  o.push(rect(M0 - 2, 494, M1 - M0 + 4, 6, '#2B2622', 0.8));
  o.push(rect(M0, 408, M1 - M0, 86, '#B8322A', 1, 1.5));
  o.push(box(M1 - 9, 409, 8, 84, '#93241E'));
  o.push(fill(`M${M0 - 2},408 C${M0 + 2},398 ${M1 - 2},398 ${M1 + 2},408 Z`, '#93241E', 0.9));
  o.push(rect(M0 + 4, 404.6, M1 - M0 - 8, 4, '#E2B84E', 0.5, 1));
  o.push(rect(M0 + 4, 414, M1 - M0 - 8, 8, '#E2B84E', 0.6, 1));
  o.push(txt((M0 + M1) / 2, 419.8, 'CHOCOLAT', 4, '#7A1A14'));
  o.push(rect(M0 + 5, 426, M1 - M0 - 10, 26, '#2B1E18', 0.7, 1));
  for (let k = 0; k < 4; k++) {
    o.push(rect(M0 + 7, 428 + k * 6, M1 - M0 - 14, 4.4, '#6E3A22', 0.4, 0.4));
    o.push(box(M0 + 7.4, 428.4 + k * 6, 8, 3.6, '#E2B84E'));
  }
  o.push(flat(`M${M0 + 6},427 L${M0 + 10},427 L${M0 + 7},450 L${M0 + 6},450 Z`, '#FFFFFF', 0.3));
  o.push(rect(M0 + 13, 457, 8, 4, BRASS, 0.6, 1));
  o.push(box(M0 + 15, 458.4, 4, 1.2, '#2B1E18'));
  o.push(rect(M0 + 6, 470, M1 - M0 - 12, 9, '#2B1E18', 0.7, 1.2));
  o.push(rect(M0 + 6, 470, M1 - M0 - 12, 2.4, BRASS_D, 0.4, 0.4));
  o.push(rect(M0 + 3, 484, M1 - M0 - 6, 6, '#93241E', 0.6));
  // the shadow the wall throws on the floor
  o.push(flat('M-2,474 L402,474 L402,478 L-2,478 Z', '#000', 0.1));
  return o.join('');
}

/** The train at gate 5, origin at the left of its rail line: an engine and a carriage. */
export function train5() {
  const o = [];
  // the carriage
  o.push(rect(0, -40, 120, 34, '#7A2E2A', 0.9, 2));
  o.push(rect(0, -40, 120, 5, '#5E201D', 0.6, 1));
  for (let x = 8; x < 116; x += 13) o.push(rect(x, -32, 8, 9, '#F1DFA8', 0.5, 1));
  o.push(box(0, -20, 120, 2.4, '#E2C26A'));
  o.push(box(0, -6, 120, 5, '#2B2622'));
  for (const x of [14, 36, 84, 106]) o.push(circ(x, -1, 4, '#2B2622', 0.5));
  // the engine behind it (to the right, leading out)
  o.push(rect(124, -30, 60, 24, '#2E4E3C', 0.9, 2));
  o.push(rect(170, -46, 18, 40, '#2E4E3C', 0.9, 1));
  o.push(rect(172, -42, 12, 10, '#F1DFA8', 0.5, 1));
  o.push(rect(132, -40, 7, 10, '#2B2622', 0.6, 1));
  o.push(box(124, -12, 66, 6, '#2B2622'));
  for (const x of [136, 156, 176]) {
    o.push(circ(x, -3, 6, '#B23A2E', 0.7));
    o.push(circ(x, -3, 1.4, '#2B2622', 0));
  }
  o.push(line('M136,-3 L176,-3', '#C9CCCE', 1.2));
  return o.join('');
}

/** A knot of travellers bunched at a gate, origin at their feet's middle. */
function knot(k) {
  if (k === 0) {
    return traveller(-20, 0, 56, '#4E5E74', '#3D4A5C', 'bowler', { dir: 1, case_: '#7A4A2A' })
      + traveller(5, 0, 48, '#8A4A5E', '#6E3A4A', 'lady', { dir: -1, skirt: true, skin: '#E6B896' })
      + traveller(24, 0, 53, '#6E6450', '#57503F', 'cap', { dir: -1 });
  }
  if (k === 1) {
    return traveller(-13, 0, 52, '#3E5A48', '#2F4636', 'boater', { dir: 1, skin: '#C98F64' })
      + traveller(13, 0, 57, '#5C4A3E', '#47392F', 'bowler', { dir: -1, case_: '#3E3A5C' });
  }
  return traveller(-11, 0, 47, '#B07A3A', '#8E6029', 'lady', { dir: 1, skirt: true })
    + rect(5, -13, 12, 12, '#D7C49A', 0.6, 4)
    + traveller(22, 0, 51, '#3B3B48', '#2C2C36', 'bowler', { dir: -1 });
}
export const crowdA = () => knot(0);
export const crowdB = () => knot(1);
export const crowdC = () => knot(2);

/** The departures board, origin at its top middle: a black case on rods, three rows. */
export function board() {
  const o = [];
  o.push(line('M-34,-14 L-34,0 M34,-14 L34,0', IRON, 1));
  o.push(rect(-48, 0, 96, 46, '#1E1E22', 1.1, 2));
  o.push(rect(-46, 2, 92, 8, '#2B2B32', 0.5, 1));
  o.push(txt(0, 8.4, 'DEPARTURES', 5.6, '#E8C060'));
  for (let r = 0; r < 3; r++) {
    const y = 13 + r * 10.6;
    o.push(rect(-45, y, 90, 9, '#121215', 0.4, 0.6));
    for (let k = 0; k < 15; k++) o.push(box(-44 + k * 6, y + 4.3, 5.2, 0.4, '#2E2E36'));
  }
  return o.join('');
}

/** The hanging station clock, origin at its centre: the wrought-iron bracket, a navy case. */
export function stationClock() {
  const o = [];
  o.push(line('M-12,-34 L-12,-18 M12,-34 L12,-18 M-12,-28 C-6,-22 6,-22 12,-28 M-12,-22 C-6,-28 6,-28 12,-22', IRON, 1));
  o.push(line('M-14,-34 L14,-34', IRON, 1.4));
  o.push(line('M0,-18 L0,-15', IRON, 1.2));
  o.push(circ(0, 0, 15, NAVY, 1));
  o.push(flat('M2,-14.6 C9,-13 14.6,-7 15,0 C14,9 8,14 2,14.8 C9,10 11,4 11,0 C11,-6 8,-11 2,-14.6 Z', NAVY_D));
  o.push(circ(0, 0, 11.6, '#E6B85A', 0));
  o.push(circ(0, 0, 10.6, '#F7F2E4', 0.5));
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * Math.PI * 2;
    o.push(line(`M${f2(Math.sin(a) * 7.6)},${f2(-Math.cos(a) * 7.6)} L${f2(Math.sin(a) * 9.8)},${f2(-Math.cos(a) * 9.8)}`, OUT, k % 3 ? 0.8 : 1.4));
  }
  return o.join('');
}

export const ART = [
  { name: 'psych7-lab-far', svg: labFar, view: { x: 0, y: 214, w: 400, h: 300 }, box: { x: 0, y: 214, w: 400, h: 300 } },
  { name: 'psych7-lab-mid', svg: labMid, view: { x: 0, y: 214, w: 400, h: 300 }, box: { x: 0, y: 214, w: 400, h: 300 } },
  { name: 'psych7-lab-bench', svg: labBench, view: { x: 200, y: 434, w: 202, h: 80 }, box: { x: 200, y: 434, w: 202, h: 80 } },
  { name: 'psych7-timer', svg: chronoscope, view: { x: -12, y: -36, w: 24, h: 37 }, box: { x: -12, y: -36, w: 24, h: 37 } },
  { name: 'psych7-cup', svg: cup, view: { x: -4.4, y: -7.4, w: 10.6, h: 7.8 }, box: { x: -4.4, y: -7.4, w: 10.6, h: 7.8 } },
  { name: 'psych7-jar', svg: beanJar, view: { x: -6.2, y: -16.4, w: 12.4, h: 16.8 }, box: { x: -6.2, y: -16.4, w: 12.4, h: 16.8 } },
  { name: 'psych7-opinion', svg: opinionBook, view: { x: -10.6, y: -6, w: 21.2, h: 6.6 }, box: { x: -10.6, y: -6, w: 21.2, h: 6.6 } },
  { name: 'psych7-log-open', svg: logbookOpen, view: { x: -12.6, y: -7, w: 25.2, h: 8.2 }, box: { x: -12.6, y: -7, w: 25.2, h: 8.2 } },
  { name: 'psych7-log-shut', svg: logbookShut, view: { x: -11, y: -6.6, w: 22, h: 7 }, box: { x: -11, y: -6.6, w: 22, h: 7 } },
  { name: 'psych7-metronome', svg: metronome, view: { x: -8, y: -25, w: 16, h: 25.6 }, box: { x: -8, y: -25, w: 16, h: 25.6 } },
  { name: 'psych7-door', svg: doorLeaf, view: { x: -1, y: -113, w: 34, h: 114 }, box: { x: -1, y: -113, w: 34, h: 114 } },
  { name: 'psych7-hall-far', svg: hallFar, view: { x: 0, y: 214, w: 400, h: 300 }, box: { x: 400, y: 214, w: 400, h: 300 } },
  { name: 'psych7-train', svg: train5, view: { x: -1, y: -47, w: 192, h: 51 }, box: { x: -1, y: -47, w: 192, h: 51 } },
  { name: 'psych7-hall-mid', svg: hallMid, view: { x: 0, y: 214, w: 400, h: 300 }, box: { x: 400, y: 214, w: 400, h: 300 } },
  { name: 'psych7-crowd-a', svg: crowdA, view: { x: -34, y: -60, w: 68, h: 61 }, box: { x: -34, y: -60, w: 68, h: 61 } },
  { name: 'psych7-crowd-b', svg: crowdB, view: { x: -26, y: -60, w: 54, h: 61 }, box: { x: -26, y: -60, w: 54, h: 61 } },
  { name: 'psych7-crowd-c', svg: crowdC, view: { x: -22, y: -53, w: 54, h: 54 }, box: { x: -22, y: -53, w: 54, h: 54 } },
  { name: 'psych7-board', svg: board, view: { x: -50, y: -15, w: 100, h: 63 }, box: { x: -50, y: -15, w: 100, h: 63 } },
  { name: 'psych7-clock', svg: stationClock, view: { x: -16, y: -35, w: 32, h: 51 }, box: { x: -16, y: -35, w: 32, h: 51 } },
];
