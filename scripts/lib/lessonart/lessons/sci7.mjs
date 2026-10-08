// science-foundations-7 — the recap: an old laboratory after dark, then the observatory
// dome on its roof (LESSON_RULES AM13; the recap's full settings, built in layers).
//
// Every picture is in SCENE units with the band [214, 514], 400 × 300. Flat fills lit from
// the top left, a darker shaded side, one dark outline; real colours, no gradients, no glows.
//
// REFERENCES (npm run ref, scratchpad/ref/sc7*):
//   sc7chem-1 "Faraday at work in his laboratory at the Royal Institution" (Wellcome M0004586):
//             a high room, the walls lined floor to ceiling with SHELVES OF JARS, a long
//             heavy wooden bench on a brick base, a doorway into the next room, plank floor.
//   sc7chem-3 "Laboratory at the Royal Institution, 1819": a vaulted ceiling with skylights,
//             gas pipes run along the walls to the benches, a sink trough, a stove, benches
//             with closed cupboard bases.
//   sc7burner-3 "Bunsen Burner Set Up": a heavy round base, a straight tube with the air
//             collar near its foot, an ORANGE RUBBER HOSE to the gas tap; a three-legged
//             iron tripod over it carrying a square of wire gauze.
//   sc7bunsen-1 "Bunsen burner flame types": closed collar = a tall wavering yellow flame;
//             open = a short blue cone with a bright inner cone.
//   sc7glass-1 "Laboratory glassware": a conical (Erlenmeyer) flask, straight beakers with a
//             lip, tall measuring cylinders.
//   sc7yerkes-2 "Yerkes 40-inch refractor" (2006): inside a dome — pale panels between
//             curved ribs converging overhead, a long tube on a massive pier, a ring
//             balcony round the drum, a red BRICK drum wall below.
//   sc7refr-1 "Brass refracting telescope" (Science Museum 1982-919): a long brass tube with
//             a dew cap at the front, a slimmer draw tube and eyepiece at the back, on a
//             fork mount above a wooden tripod.
//   sc7obs-1  "Brera - cupole": the dome a drum with a vertical SLIT whose shutter doors
//             stand open.

const OUT = '#2A2420';
const f2 = (n) => Number(n.toFixed(2));
const P = (pts) => 'M' + pts.map(([x, y]) => `${f2(x)},${f2(y)}`).join(' L') + ' Z';
const fill = (d, c, w = 1) => `<path d="${d}" fill="${c}" stroke="${OUT}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"/>`;
const flat = (d, c, o = 1) => `<path d="${d}" fill="${c}"${o < 1 ? ` opacity="${o}"` : ''}/>`;
const rect = (x, y, w, h, c, lw = 1, r = 0) => `<rect x="${f2(x)}" y="${f2(y)}" width="${f2(w)}" height="${f2(h)}" rx="${r}" fill="${c}" stroke="${OUT}" stroke-width="${lw}" stroke-linejoin="round"/>`;
const box = (x, y, w, h, c, o = 1) => `<rect x="${f2(x)}" y="${f2(y)}" width="${f2(w)}" height="${f2(h)}" fill="${c}"${o < 1 ? ` opacity="${o}"` : ''}/>`;
const line = (d, c, w) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const circ = (x, y, r, c, lw = 0.8) => `<circle cx="${f2(x)}" cy="${f2(y)}" r="${f2(r)}" fill="${c}" stroke="${OUT}" stroke-width="${lw}"/>`;
const dot = (x, y, r, c, o = 1) => `<circle cx="${f2(x)}" cy="${f2(y)}" r="${f2(r)}" fill="${c}"${o < 1 ? ` opacity="${o}"` : ''}/>`;
const ell = (x, y, rx, ry, c, lw = 0.8) => `<ellipse cx="${f2(x)}" cy="${f2(y)}" rx="${f2(rx)}" ry="${f2(ry)}" fill="${c}" stroke="${OUT}" stroke-width="${lw}"/>`;
const txt = (x, y, s, c, t, w = 800, anchor = 'middle') => `<text x="${f2(x)}" y="${f2(y)}" font-family="Arial, Helvetica, sans-serif" font-weight="${w}" font-size="${s}" fill="${c}" text-anchor="${anchor}">${t}</text>`;

// ── palette ──────────────────────────────────────────────────────────────────
const NIGHT = ['#18213F', '#1F2A4E', '#27355D', '#33426B'];
const ROOF = '#141A2E', ROOF_D = '#0F1424';
const LIT = '#F3C766';
const PLASTER = '#E7D8B8', PLASTER_D = '#D2BF98', PLASTER_DD = '#BDA77E';
const WAIN = '#7A4E2C', WAIN_D = '#5E3A20', WAIN_L = '#93633B';
const WOOD = '#8F5D33', WOOD_D = '#6B4425', WOOD_L = '#AE7745', WOOD_DD = '#4E301A';
const BEAM = '#5C3B22', BEAM_D = '#45301C';
const FLOOR = '#9A6B40', FLOOR_D = '#7E5531', FLOOR_L = '#B07E4E';
const TOP = '#4B3A2E', TOP_L = '#5E4A3B', TOP_D = '#3A2C22';     // a dark slate bench top
const BRASS = '#C9A043', BRASS_D = '#9E7A2A', BRASS_L = '#E2BF68';
const IRON = '#3E4448', IRON_D = '#2A2F33';
const HOSE = '#D9692E', HOSE_D = '#B4521F';
const STONE = '#C9C2B2', STONE_D = '#A9A190';
const BOARD = '#2F4A3A', BOARD_D = '#243A2D';
const GLASS = '#D8EDF1', GLASS_D = '#AFCFD6';
const JAR_AMBER = '#B5702A', JAR_GREEN = '#4F8A55', JAR_BLUE = '#3E6EA8', JAR_CLEAR = '#CFE2E2', JAR_RED = '#9C3A2E', JAR_CREAM = '#E9DEC1';
const LABEL = '#F3ECD6';

function nightSky(x, y0, w, h) {
  const o = [];
  const bands = [0, 0.3, 0.58, 0.8, 1];
  for (let k = 0; k < 4; k++) o.push(box(x, y0 + h * bands[k], w, h * (bands[k + 1] - bands[k]) + 0.3, NIGHT[k]));
  return o.join('');
}
/** A sprinkle of stars inside a box, seeded so it never changes between bakes. */
function stars(x0, y0, w, h, n, seed = 3) {
  let s = seed;
  const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  const o = [];
  for (let k = 0; k < n; k++) {
    const x = x0 + rnd() * w, y = y0 + rnd() * h, r = 0.35 + rnd() * 0.55;
    o.push(dot(x, y, r, rnd() > 0.85 ? '#FFE7B0' : '#F4F1E6', 0.6 + rnd() * 0.4));
  }
  return o.join('');
}
/** Rooftops of a town against the night, with chimneys and a few lit windows. */
function roofs(x0, x1, yb, seed = 5) {
  let s = seed;
  const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  const o = [];
  let x = x0 - 4;
  while (x < x1) {
    const w = 14 + rnd() * 16, h = 10 + rnd() * 14;
    const top = yb - h;
    o.push(box(x, top, w, h + 2, rnd() > 0.5 ? ROOF : ROOF_D));
    if (rnd() > 0.35) o.push(flat(P([[x - 1, top], [x + w / 2, top - 6 - rnd() * 4], [x + w + 1, top]]), ROOF));
    if (rnd() > 0.5) o.push(box(x + w * 0.7, top - 9, 3, 7, ROOF_D));
    for (let k = 0; k < 2; k++) if (rnd() > 0.55) o.push(box(x + 3 + rnd() * (w - 7), top + 3 + rnd() * (h - 7), 2.2, 2.6, LIT));
    x += w - 1;
  }
  return o.join('');
}
/** A tall arched sash window looking out at the night. */
function nightWindow(x, top, w, h, seed) {
  const o = [];
  const r = w / 2;
  const arch = `M${x},${top + r} A${r},${r} 0 0 1 ${x + w},${top + r} L${x + w},${top + h} L${x},${top + h} Z`;
  o.push(fill(`M${x - 4},${top + r} A${r + 4},${r + 4} 0 0 1 ${x + w + 4},${top + r} L${x + w + 4},${top + h + 3} L${x - 4},${top + h + 3} Z`, WAIN, 0.9));  // the frame
  o.push(`<clipPath id="w${seed}"><path d="${arch}"/></clipPath>`);
  o.push(`<g clip-path="url(#w${seed})">${nightSky(x, top, w, h)}${stars(x, top, w, h * 0.7, 14, seed)}${roofs(x, x + w, top + h, seed + 2)}</g>`);
  o.push(`<path d="${arch}" fill="none" stroke="${OUT}" stroke-width="0.9"/>`);
  // the glazing bars
  o.push(line(`M${x + w / 2},${top} L${x + w / 2},${top + h}`, WAIN_D, 1.6));
  for (const fy of [0.42, 0.68]) o.push(line(`M${x},${top + h * fy} L${x + w},${top + h * fy}`, WAIN_D, 1.4));
  o.push(line(`M${x},${top + h * 0.55} L${x + w},${top + h * 0.55}`, WAIN_D, 2.2));             // the meeting rail
  // the sill
  o.push(rect(x - 7, top + h + 2, w + 14, 4, WAIN_L, 0.8));
  return o.join('');
}
/** A wall shelf of jars and bottles (the Faraday room's walls). */
function jarShelf(x0, x1, y, seed) {
  let s = seed;
  const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  const cols = [JAR_AMBER, JAR_GREEN, JAR_BLUE, JAR_CLEAR, JAR_RED, JAR_CREAM, JAR_AMBER, JAR_CLEAR];
  const o = [];
  let x = x0 + 2;
  while (x < x1 - 6) {
    const w = 5 + rnd() * 4, h = 9 + rnd() * 9;
    const c = cols[Math.floor(rnd() * cols.length)];
    if (rnd() > 0.5) {
      // a bottle: body and a neck
      o.push(rect(x, y - h, w, h, c, 0.5, 1.2));
      o.push(rect(x + w * 0.32, y - h - 3.4, w * 0.36, 3.6, c, 0.45, 0.6));
    } else {
      // a stoppered jar with a paper label
      o.push(rect(x, y - h, w, h, c, 0.5, 1.4));
      o.push(rect(x - 0.4, y - h - 1.6, w + 0.8, 1.8, WOOD_D, 0.4, 0.5));
      o.push(box(x + 1, y - h * 0.62, w - 2, h * 0.3, LABEL));
    }
    o.push(box(x + w * 0.62, y - h + 1, w * 0.28, h - 2, '#000', 0.14));   // its shaded side
    x += w + 1 + rnd() * 2.5;
  }
  o.push(rect(x0 - 2, y, x1 - x0 + 4, 3, WOOD_L, 0.8));
  o.push(box(x0 - 1, y + 2, x1 - x0 + 2, 1, WOOD_D));
  return o.join('');
}
/** A wall gas bracket: a brass pipe curling out from the wall, a glass shade. */
function gasBracket(x, y) {
  return line(`M${x},${y + 18} L${x},${y + 8} C${x},${y + 2} ${x + 6},${y + 2} ${x + 8},${y + 2}`, BRASS_D, 2.2)
    + line(`M${x},${y + 18} L${x},${y + 8} C${x},${y + 2} ${x + 6},${y + 2} ${x + 8},${y + 2}`, BRASS, 1.2)
    + rect(x - 2.5, y + 17, 5, 4, BRASS, 0.6, 1)
    + fill(`M${x + 4},${y + 1} L${x + 12},${y + 1} L${x + 13.6},${y - 7} L${x + 2.4},${y - 7} Z`, '#F6E8C4', 0.6);
}

// ══════════════════════════════════════════════════════════════════════════════
// THE LABORATORY
// ══════════════════════════════════════════════════════════════════════════════

/** FAR: the vaulted ceiling and its beams, the plastered back wall, three tall windows on
 *  the night, shelves of jars, the panelled dado, the gas brackets, the floor. */
export function labFar() {
  const o = [];
  // the back wall, gaslit plaster
  o.push(box(0, 214, 400, 300, PLASTER));
  // the wall is lit from the gas brackets: a darker band high up under the ceiling
  o.push(box(0, 236, 400, 22, PLASTER_D));
  o.push(box(0, 258, 400, 4, PLASTER_D, 0.55));
  // the ceiling and its beams
  o.push(rect(-2, 212, 404, 26, BEAM, 0.9));
  for (let x = 6; x < 400; x += 40) {
    o.push(rect(x, 214, 12, 26, BEAM_D, 0.7));
    o.push(box(x + 8, 215, 3.4, 24, '#36261A'));
  }
  o.push(rect(-2, 236, 404, 5, WAIN, 0.8));                                         // the cornice board
  // a gas pipe running along the wall under the cornice
  o.push(line('M0,248 L400,248', BRASS_D, 2));
  o.push(line('M0,247.6 L400,247.6', BRASS, 0.9));
  // three tall windows
  o.push(nightWindow(30, 262, 50, 128, 11));
  o.push(nightWindow(118, 262, 50, 128, 23));
  o.push(nightWindow(300, 262, 50, 128, 37));
  // a crescent moon in the middle window
  o.push(dot(150, 292, 6.2, '#F6EFD2'));
  o.push(dot(153, 290.4, 5.6, NIGHT[0]));
  // the wall between the windows: shelves of jars, floor to ceiling, as in Faraday's room
  for (const y of [282, 312, 342, 372]) o.push(jarShelf(180, 290, y, y));
  for (const y of [282, 312]) o.push(jarShelf(360, 398, y, y + 5));
  // the panelled dado under everything
  o.push(rect(-2, 404, 404, 112, WAIN, 0.9));
  o.push(box(0, 405, 400, 4, WAIN_L));
  for (let x = 6; x < 400; x += 36) {
    o.push(rect(x, 414, 28, 40, WAIN_D, 0.6, 1));
    o.push(box(x + 1, 415, 26, 2.2, WAIN_L, 0.7));
  }
  // the doorway on the left: a dark passage behind the open door
  o.push(rect(-3, 300, 30, 202, '#3A2A1E', 0.9));
  o.push(box(0, 302, 24, 198, '#2C2017'));
  o.push(box(0, 302, 24, 40, '#4A3628', 0.6));                                     // light from the passage
  o.push(rect(24, 294, 6, 210, WAIN_L, 0.8));                                       // the door jamb
  o.push(rect(-3, 290, 36, 8, WAIN_L, 0.8));                                        // the lintel
  // the floor: wide planks running back
  o.push(rect(-2, 486, 404, 30, FLOOR, 0.8));
  o.push(box(0, 486.5, 400, 3, FLOOR_D));
  for (let x = -20; x < 420; x += 24) o.push(line(`M${x},489 L${x - 14},514`, FLOOR_D, 0.6));
  for (const [x, y] of [[20, 496], [96, 504], [160, 494], [238, 506], [320, 498], [372, 508]]) o.push(box(x, y, 12, 1.4, FLOOR_L, 0.8));
  return o.join('');
}

/** MID: the stone sink and its brass tap, the blackboard, the reagent shelf over the bench,
 *  the gas brackets. (Everything on them that moves is drawn by the scene.) */
export function labMid() {
  const o = [];
  // gas brackets on the wall
  o.push(gasBracket(96, 330));
  o.push(gasBracket(178, 386));
  o.push(gasBracket(360, 330));
  // the sink: a stone trough on brick piers, the brass tap over it
  o.push(rect(38, 470, 6, 30, '#9C4A32', 0.7));
  o.push(rect(88, 470, 6, 30, '#9C4A32', 0.7));
  for (const y of [476, 484, 492]) o.push(line(`M38,${y} L44,${y} M88,${y} L94,${y}`, '#7A3824', 0.4));
  o.push(rect(34, 452, 64, 18, STONE, 0.9));
  o.push(box(76, 453, 21, 16, STONE_D));
  o.push(rect(37, 452, 58, 4, '#8A8374', 0.6));                                     // the trough's inside
  o.push(line('M40,430 L40,418 C40,410 54,410 56,416 L56,420', BRASS_D, 2.6));       // the swan-neck tap
  o.push(line('M40,430 L40,418 C40,410 54,410 56,416 L56,420', BRASS, 1.3));
  o.push(rect(37, 428, 6, 24, BRASS, 0.6, 1));
  o.push(rect(36, 424, 8, 3, BRASS_D, 0.5, 1));                                     // the handle
  // a towel on a hook, a scrubbing brush on the rim
  o.push(fill('M70,420 L84,420 L86,446 L68,446 Z', '#E9E2CF', 0.6));
  o.push(box(68, 438, 18, 3, '#B9483A', 0.85));
  o.push(rect(74, 417, 6, 3, BRASS_D, 0.5));
  o.push(rect(60, 448, 12, 4, '#B48A52', 0.5, 1));
  // the blackboard on the wall, with its chalk ledge and old sums half rubbed out
  o.push(rect(254, 396, 60, 62, WOOD_L, 0.9, 1.5));
  o.push(rect(257, 399, 54, 56, BOARD, 0.6));
  o.push(box(298, 400, 12, 54, BOARD_D));
  o.push(line('M260,404 C266,402 272,406 280,403 M300,446 L308,446', '#56705F', 0.6));
  o.push(rect(253, 456, 62, 3, WOOD_D, 0.7));
  o.push(rect(300, 454, 6, 2, '#F4F1E6', 0.3));                                     // a stub of chalk on the ledge
  o.push(rect(286, 454.6, 9, 1.8, '#E5DEC9', 0.3));                                 // the duster
  // the reagent shelf over the bench's right end (Q2's three things stand on it)
  o.push(rect(300, 428, 98, 4, WOOD_L, 0.8));
  o.push(box(301, 431, 96, 1.4, WOOD_D));
  for (const x of [306, 392]) o.push(fill(`M${x},432 L${x},440 L${x - 4},432 Z`, WOOD_D, 0.6));   // brackets
  return o.join('');
}

/** The long bench, stood BEHIND both people (they work at its near side, nothing of them
 *  hidden): a slate top at hip height (38 above the floor) on an open frame of four square
 *  legs, an apron under the top and a low stretcher shelf near the floor — so the room
 *  shows through it and their legs read against the floor, not against a dark cupboard —
 *  and the still apparatus on it: the burners, their tripods and hoses, the gas tap, the
 *  sugar bowl, the notebook. */
export function labBench() {
  const o = [];
  // the four legs, the low stretcher shelf between them, and a crate stored on it
  for (const x of [108, 204, 300, 392]) {
    o.push(rect(x, 466, 4.4, 34, WOOD_D, 0.8));
    o.push(box(x + 2.6, 467, 1.4, 32, WOOD_DD, 0.6));
  }
  o.push(rect(108, 487, 288, 3, WOOD, 0.8));
  o.push(box(109, 487.4, 286, 0.9, WOOD_L, 0.8));
  o.push(rect(338, 477, 26, 10, WOOD_L, 0.8));
  o.push(box(339, 481.6, 24, 1, WOOD_D, 0.7));
  // the apron under the top
  o.push(rect(106, 467.4, 292, 4, WOOD_D, 0.8));
  o.push(box(107, 467.9, 290, 1, WOOD, 0.8));
  // the slate top and its lit edge
  o.push(rect(104, 462, 296, 6, TOP_L, 1));
  o.push(box(105, 462.6, 294, 1.6, '#7A685A'));
  // the gas tap tower between the two kit burners, its hoses curling out to each
  o.push(line('M170,462 C166,460 162,461 158,462.4', HOSE_D, 2.4));
  o.push(line('M170,462 C166,460 162,461 158,462.4', HOSE, 1.3));
  o.push(line('M176,462 C180,460 184,461 188,462.4', HOSE_D, 2.4));
  o.push(line('M176,462 C180,460 184,461 188,462.4', HOSE, 1.3));
  o.push(rect(170, 448, 6, 15, BRASS, 0.6, 1));
  o.push(box(173.6, 449, 2, 13, BRASS_D));
  // his own burner's hose, off to the right
  o.push(line('M290,462.4 C296,460 304,461 310,462', HOSE_D, 2.4));
  o.push(line('M290,462.4 C296,460 304,461 310,462', HOSE, 1.3));
  o.push(rect(308, 456, 4, 7, BRASS, 0.5, 1));
  // three burners: a heavy round base and a straight tube with its collar
  for (const [x, top] of [[158, 450], [188, 450], [290, 454]]) {
    o.push(ell(x, 461.6, 6.4, 2, IRON, 0.7));
    o.push(rect(x - 1.8, top, 3.6, 461.5 - top, '#8E959B', 0.6));
    o.push(box(x + 0.4, top + 0.6, 1.2, 460.4 - top, '#6E757B'));
    o.push(rect(x - 2.4, 456.4, 4.8, 2.4, '#6E757B', 0.5));                          // the air collar
  }
  // three tripods with their wire gauze (his own is a lower one)
  for (const [x, g] of [[158, 439.6], [188, 439.6], [290, 445.6]]) {
    o.push(line(`M${x - 8},462 L${x - 6.4},${g + 1} M${x + 8},462 L${x + 6.4},${g + 1}`, IRON_D, 1.3));
    o.push(line(`M${x - 8},462 L${x - 6.4},${g + 1} M${x + 8},462 L${x + 6.4},${g + 1}`, IRON, 0.6));
    o.push(rect(x - 8.6, g, 17.2, 1.8, '#8E959B', 0.6));                               // the gauze, edge on
  }
  // the sugar bowl
  o.push(fill('M140.4,456 L149.6,456 C149.6,461 147,462 145,462 C143,462 140.4,461 140.4,456 Z', '#E8E2D2', 0.7));
  o.push(ell(145, 456, 4.6, 1.2, '#FAFAF4', 0.5));
  // his notebook lying open on the bench
  o.push(fill('M301,460.6 L314,460.6 L315,462.6 L300,462.6 Z', '#F3ECD9', 0.6));
  o.push(line('M307.5,460.6 L307.5,462.6', '#C9BEA0', 0.4));
  return o.join('');
}

/** The laboratory door: a panelled leaf with a glass pane, hinged at its left edge. */
export function door() {
  return rect(0, 0, 24, 200, WAIN_L, 1)
    + box(14, 1, 9, 198, WAIN, 0.7)
    + rect(4, 12, 16, 46, '#BFD9DE', 0.8)
    + box(13, 13, 6, 44, '#9EBFC6')
    + line('M12,12 L12,58 M4,35 L20,35', WAIN_D, 1)
    + rect(4, 70, 16, 54, WAIN, 0.7, 1)
    + rect(4, 132, 16, 58, WAIN, 0.7, 1)
    + circ(20, 104, 1.6, BRASS, 0.5);
}

/** His conical flask: clear glass over whatever is in it (the liquid is drawn behind it). */
export function flask() {
  return `<path d="M-2.4,-22 L2.4,-22 L2.4,-14 L8.6,-1.2 C9,0 8.4,0.6 7.4,0.6 L-7.4,0.6 C-8.4,0.6 -9,0 -8.6,-1.2 L-2.4,-14 Z" fill="${GLASS}" fill-opacity="0.38" stroke="${OUT}" stroke-width="0.8" stroke-linejoin="round"/>`
    + rect(-3.2, -23.4, 6.4, 1.8, GLASS_D, 0.5, 0.6)
    + line('M-5.6,-4 L-1.6,-13', '#FFFFFF', 0.8);
}

/** What is in his flask: the same cone, filled, drawn behind the glass and shown from the
 *  bottom up as it is poured. */
export function liquid() {
  return '<path d="M-2.4,-13.6 L2.4,-13.6 L8.2,-1.2 C8.6,0 8,0.4 7,0.4 L-7,0.4 C-8,0.4 -8.6,0 -8.2,-1.2 Z" fill="#3E7FCF"/>'
    + '<path d="M2.4,-13.6 L8.2,-1.2 C8.6,0 8,0.4 7,0.4 L3,0.4 Z" fill="#2C63A8"/>';
}

/** A crate of matching plain bottles, all the same, with no labels. */
export function crate() {
  const o = [];
  for (let k = 0; k < 4; k++) {
    const x = -10.5 + k * 7;
    o.push(rect(x - 2.2, -22, 4.4, 12, '#CFE2DD', 0.55, 1.2));
    o.push(rect(x - 1, -25.4, 2, 3.8, '#CFE2DD', 0.45, 0.6));
    o.push(rect(x - 1.3, -26.4, 2.6, 1.4, '#B98A55', 0.4, 0.4));
    o.push(box(x + 0.6, -21, 1.2, 10, '#A9C7C0'));
  }
  o.push(rect(-14, -13, 28, 13, '#C99A5E', 0.9));
  o.push(box(5, -12.4, 8.4, 12, '#A97B44'));
  o.push(line('M-14,-6.5 L14,-6.5', '#8A6335', 0.6));
  return o.join('');
}

/** The MIRACLE label: a big gold rosette label with a scalloped edge. */
export function sign() {
  const o = [];
  const n = 18, R = 12.4, r = 11.2;
  const pts = [];
  for (let k = 0; k < n * 2; k++) {
    const a = (k / (n * 2)) * Math.PI * 2;
    const rr = k % 2 ? r : R;
    pts.push([rr * Math.cos(a), rr * Math.sin(a) * 0.82]);
  }
  o.push(fill('M-6,6 L-9,17 L-4,14 L-1.4,18 L0,8 Z', '#B83A32', 0.6));
  o.push(fill('M6,6 L9,17 L4,14 L1.4,18 L0,8 Z', '#B83A32', 0.6));
  o.push(fill(P(pts), '#E2B33C', 0.9));
  o.push(ell(0, 0, 9.4, 7.8, '#F0CB5A', 0.5));
  o.push(flat('M0,-7.8 A9.4,7.8 0 0 1 9.4,0 L5,0 Z', '#C99A28', 0.5));
  o.push(txt(0, 2.2, 5.6, '#5A3A10', 'MIRACLE'));
  return o.join('');
}

// ══════════════════════════════════════════════════════════════════════════════
// THE OBSERVATORY DOME — drawn in its own frame (x 0–400), laid at world x 400.
// ══════════════════════════════════════════════════════════════════════════════

const DOME = '#E4DCC8', DOME_D = '#CFC5AC', DOME_L = '#EFE8D7', RIB = '#9A8E74';
const BRICK = '#A54A33', BRICK_D = '#843A27';
const SLIT = { x0: 96, x1: 236, top: 214, bot: 410 };

/** FAR: the dome's inner shell with its ribs, the shutter slit open on the night — a last
 *  glow of sunset low on the left, the stars, Mars, the town's roofs and street lamps —
 *  the brick drum, the balcony rail, the plank floor. */
export function domeFar() {
  const o = [];
  // the inner shell: pale panels between ribs curving up to the crown
  o.push(box(0, 214, 400, 200, DOME));
  o.push(box(260, 214, 140, 200, DOME_D));
  o.push(box(0, 214, 70, 200, DOME_L, 0.7));
  // the ribs rise from the drum and lean in toward the crown, over the slit
  for (const [x0, cx] of [[-40, 30], [12, 60], [60, 90]]) o.push(line(`M${x0},414 C${x0 + 6},330 ${cx},260 ${cx + 30},214`, RIB, 1.6));
  for (const [x0, cx] of [[440, 370], [388, 340], [336, 300], [284, 258]]) o.push(line(`M${x0},414 C${x0 - 6},330 ${cx},260 ${cx - 30},214`, RIB, 1.6));
  for (const y of [262, 312, 362]) o.push(line(`M0,${y + 8} C120,${y - 8} 280,${y - 8} 400,${y + 8}`, RIB, 1.1));
  // the slit, open to the night
  const { x0, x1, top, bot } = SLIT;
  o.push(box(x0, top, x1 - x0, bot - top, NIGHT[0]));
  o.push(box(x0, 300, x1 - x0, 50, NIGHT[1]));
  o.push(box(x0, 350, x1 - x0, 28, NIGHT[2]));
  o.push(box(x0, 378, x1 - x0, 14, NIGHT[3]));
  // the last of the sunset, low on the left of the slit
  o.push(box(x0, 388, x1 - x0, 22, '#5B4A6E'));
  o.push(flat(`M${x0},386 C${x0 + 30},384 ${x0 + 60},392 ${x0 + 90},398 L${x0 + 90},410 L${x0},410 Z`, '#C9784A'));
  o.push(flat(`M${x0},394 C${x0 + 24},392 ${x0 + 44},398 ${x0 + 62},404 L${x0 + 62},410 L${x0},410 Z`, '#E8A55A'));
  o.push(stars(x0 + 2, top + 4, x1 - x0 - 4, 160, 46, 41));
  // the town below the parapet: roofs, a church spire, the street lamps on their posts
  o.push(roofs(x0 + 70, x1, 410, 19));
  o.push(roofs(x0, x0 + 74, 412, 13).replace(/#141A2E|#0F1424/g, '#1A2034'));
  o.push(fill(`M188,410 L188,380 L192,368 L196,380 L196,410 Z`, ROOF, 0.4));
  for (const x of [112, 140, 168, 206, 226]) {
    o.push(line(`M${x},410 L${x},398`, '#0C1020', 0.8));
    o.push(dot(x, 397, 1.5, '#FFE08A'));
  }
  // the shutter doors, slid open each side of the slit
  o.push(rect(x0 - 12, top - 2, 12, bot - top + 4, '#B9AE93', 0.9));
  o.push(rect(x1, top - 2, 12, bot - top + 4, '#A79C80', 0.9));
  for (let y = 226; y < bot; y += 26) o.push(line(`M${x0 - 11},${y} L${x0 - 1},${y} M${x1 + 1},${y} L${x1 + 11},${y}`, RIB, 0.7));
  // the drum: a balcony rail over red brick
  o.push(rect(-2, 410, 404, 6, '#6E5A44', 0.9));
  o.push(rect(-2, 416, 404, 34, BRICK, 0.9));
  o.push(box(0, 417, 400, 4, BRICK_D));
  for (let y = 424; y < 450; y += 6) {
    o.push(line(`M0,${y} L400,${y}`, BRICK_D, 0.5));
    for (let x = (y % 12) ? 4 : 13; x < 400; x += 18) o.push(line(`M${x},${y} L${x},${y + 6}`, BRICK_D, 0.5));
  }
  // the floor: wide boards running back
  o.push(rect(-2, 448, 404, 68, '#8C6440', 0.8));
  o.push(box(0, 448.5, 400, 4, '#6E4D30'));
  for (let x = -40; x < 440; x += 28) o.push(line(`M${x},452 L${x - 30},514`, '#6E4D30', 0.6));
  for (const [x, y] of [[30, 470], [112, 486], [190, 466], [260, 494], [340, 476]]) o.push(box(x, y, 14, 1.4, '#A87B52', 0.8));
  return o.join('');
}

/** MID: the head of the spiral stair at the left, the telescope's pier, the observer's desk
 *  with its star chart and a lamp at the right. (The tube, the poster and the diary are
 *  their own pictures, because they move.) */
export function domeMid() {
  const o = [];
  // the stair: an iron newel and a rail curling down out of the floor
  o.push(fill('M0,452 L46,452 L46,458 L0,458 Z', '#2F2A26', 0.7));
  o.push(line('M4,500 L4,430 M40,458 L40,432', IRON_D, 2.2));
  o.push(line('M4,430 C14,424 32,424 40,432', IRON_D, 2.2));
  o.push(line('M4,430 C14,424 32,424 40,432', '#5C646A', 0.9));
  for (const x of [12, 20, 28, 34]) o.push(line(`M${x},${426 + Math.abs(x - 22) * 0.2} L${x},452`, IRON_D, 0.9));
  // the telescope's pier: a cast-iron column on a stepped foot, painted green
  const PX = 272;
  o.push(rect(PX - 20, 494, 40, 7, '#3F5A4B', 0.9));
  o.push(rect(PX - 14, 486, 28, 9, '#4C6B59', 0.9));
  o.push(fill(`M${PX - 9},486 L${PX - 6},446 L${PX + 6},446 L${PX + 9},486 Z`, '#4C6B59', 1));
  o.push(flat(`M${PX + 1},446 L${PX + 6},446 L${PX + 9},486 L${PX + 2},486 Z`, '#3B5446'));
  o.push(rect(PX - 9, 440, 18, 7, '#5E7E6B', 0.9, 1));                                 // the head
  o.push(rect(PX - 3, 434, 6, 8, BRASS, 0.7, 1));                                       // the fork's foot
  // the observer's desk, a star chart pinned flat on it, a brass oil lamp
  o.push(rect(340, 458, 60, 5, WOOD_L, 0.9));
  o.push(rect(344, 463, 4, 37, WOOD_D, 0.7));
  o.push(rect(392, 463, 4, 37, WOOD_D, 0.7));
  o.push(rect(346, 470, 48, 3, WOOD, 0.6));
  o.push(fill('M348,457.6 L372,457.6 L374,459.4 L346,459.4 Z', '#253458', 0.6));
  o.push(stars(350, 457.8, 20, 1.2, 6, 7));
  o.push(fill('M384,458 L392,458 L390,452 L386,452 Z', BRASS, 0.6));
  o.push(fill('M385.4,452 C384,446 384,440 388,436 C392,440 392,446 390.6,452 Z', '#F6E8C4', 0.6, 0.85));
  return o.join('');
}

/** The telescope tube: long brass with a dew cap at the front (to the LEFT) and the draw
 *  tube and eyepiece at the back, pivoting about (0, 0) on its fork. */
export function scope() {
  const o = [];
  o.push(rect(-118, -4.6, 104, 9.2, BRASS, 1, 2));                                      // the main tube
  o.push(box(-116, 0.6, 100, 3.6, BRASS_D));
  o.push(rect(-132, -5.6, 16, 11.2, BRASS_L, 1, 1.5));                                  // the dew cap
  o.push(box(-130, 1, 12, 4, BRASS));
  for (const x of [-96, -60, -28]) o.push(rect(x, -5.2, 3, 10.4, BRASS_D, 0.6, 0.6));  // the bands
  o.push(rect(-14, -3, 22, 6, '#B08A3A', 0.9, 1));                                       // the draw tube
  o.push(rect(8, -2, 9, 4, '#3A3A3A', 0.8, 1));                                          // the eyepiece
  o.push(rect(-74, -11, 30, 4, '#8A6A2A', 0.6, 1));                                      // the finder scope
  o.push(line('M-66,-7 L-66,-4.6 M-52,-7 L-52,-4.6', '#5A4A2A', 0.9));
  o.push(rect(-4, -7, 8, 14, '#5E7E6B', 0.8, 1));                                        // the cradle on the fork
  return o.join('');
}

/** A poster of the planets in a row, pinned to the dome wall. */
export function poster() {
  const o = [];
  o.push(rect(0, 0, 64, 46, '#F1E9D2', 0.9));
  o.push(box(46, 1, 17, 44, '#E1D6B8'));
  o.push(box(4, 4, 56, 30, '#1F2A4E'));
  o.push(stars(5, 5, 54, 28, 14, 29));
  o.push(fill('M4,10 C12,14 12,26 4,30 Z', '#F2B33A', 0.5));                             // the sun at the edge
  const planets = [[16, 20, 1.6, '#A8A39A'], [22, 20, 2.2, '#E3C07A'], [29, 20, 2.4, '#4E8BC9'], [35, 20, 1.9, '#D2563A'],
    [43, 20, 4.4, '#D9A56A'], [53, 20, 3.6, '#E4CF8E']];
  for (const [x, y, r, c] of planets) o.push(circ(x, y, r, c, 0.4));
  o.push(line('M47.8,21.2 L58.2,18.8', '#C9B77A', 0.8));                                  // the rings
  o.push(txt(32, 42, 5.4, '#2A2420', 'THE PLANETS'));
  o.push(circ(5, 3, 1.2, '#B83A32', 0.4));
  o.push(circ(59, 3, 1.2, '#B83A32', 0.4));
  return o.join('');
}

export const ART = [
  { name: 'sci7-lab-far', svg: labFar, view: { x: 0, y: 214, w: 400, h: 300 }, box: { x: 0, y: 214, w: 400, h: 300 } },
  { name: 'sci7-lab-mid', svg: labMid, view: { x: 0, y: 214, w: 400, h: 300 }, box: { x: 0, y: 214, w: 400, h: 300 } },
  { name: 'sci7-lab-bench', svg: labBench, view: { x: 100, y: 436, w: 300, h: 70 }, box: { x: 100, y: 436, w: 300, h: 70 } },
  { name: 'sci7-door', svg: door, view: { x: -1, y: -1, w: 26, h: 202 }, box: { x: -1, y: -1, w: 26, h: 202 } },
  { name: 'sci7-flask', svg: flask, view: { x: -10, y: -25, w: 20, h: 26.5 }, box: { x: -10, y: -25, w: 20, h: 26.5 } },
  { name: 'sci7-liquid', svg: liquid, view: { x: -10, y: -25, w: 20, h: 26.5 }, box: { x: -10, y: -25, w: 20, h: 26.5 } },
  { name: 'sci7-crate', svg: crate, view: { x: -15, y: -27.5, w: 30, h: 28.5 }, box: { x: -15, y: -27.5, w: 30, h: 28.5 } },
  { name: 'sci7-sign', svg: sign, view: { x: -13.5, y: -11.5, w: 27, h: 30.5 }, box: { x: -13.5, y: -11.5, w: 27, h: 30.5 } },
  { name: 'sci7-dome-far', svg: domeFar, view: { x: 0, y: 214, w: 400, h: 300 }, box: { x: 400, y: 214, w: 400, h: 300 } },
  { name: 'sci7-dome-mid', svg: domeMid, view: { x: 0, y: 214, w: 400, h: 300 }, box: { x: 400, y: 214, w: 400, h: 300 } },
  { name: 'sci7-scope', svg: scope, view: { x: -134, y: -12.5, w: 153, h: 20 }, box: { x: -134, y: -12.5, w: 153, h: 20 } },
  { name: 'sci7-poster', svg: poster, view: { x: -1, y: -1, w: 66, h: 48 }, box: { x: -1, y: -1, w: 66, h: 48 } },
];
