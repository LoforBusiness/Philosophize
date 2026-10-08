// history-foundations-7 — the recap: a museum's record room, then the museum's dig among
// the ruins of an old Greek town (LESSON_RULES AM13; the recap's full settings, in layers).
//
// Every picture is in SCENE units with the band [214, 514], 400 × 300. Flat fills lit from
// the top left, a darker shaded side, one dark outline; real colours, no gradients, no glows.
//
// REFERENCES (npm run ref, scratchpad/ref/h7*):
//   h7arch-1  "Storage vault": grey steel shelving, uprights with punched holes, buff
//             cardboard archive boxes stacked two and three deep with white end labels,
//             tissue-wrapped bundles lying on the shelves.
//   h7lamp-1  "Desk lamp": the banker's lamp — a green glass half-cylinder shade on a
//             brass stem, a round stepped brass foot, a pull chain.
//   h7dig-2   "Archaeological excavation, Roman villa, Rabat": square-cut trenches in pale
//             rubble, coursed limestone walls standing two or three courses high, buckets,
//             a town and trees behind on the skyline, a hard blue sky.
//   h7olive-1 "The ancient theatre of Sparta": low ruined walls in dusty ground, the olive
//             grove as rows of round grey-green crowns, white houses in a line beyond.
//   h7wel-1   "Kalal na šterni (vodnjaku)": a village well — a square stone wellhead worn
//             smooth on top, a wooden bucket with iron hoops hung from a chain.
//   h7stele-1 "Grave stele of Aristion (NAMA 29)": a tall narrow marble slab, the warrior
//             in low relief filling its whole height, helmet, cuirass, a spear held upright;
//             the slab stands on a squared base.
//   h7ruin-1  "Fallen column of the Temple of Olympian Zeus": the column lies where it fell
//             as a row of drums, each a short fluted cylinder, slightly out of line, the
//             capital at one end.
//   h7booth-2 "Tiny ticket sale kiosk, Seurasaari": a small timber kiosk, a pitched roof
//             with a deep overhang, a serving window with a ledge, plank walls.

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

// ── palette ──────────────────────────────────────────────────────────────────
const CEIL = '#5E4330', CEIL_D = '#4A3324', CEIL_L = '#70513B';
const WALL = '#E9DCBE', WALL_D = '#D6C6A2', WALL_DD = '#C2B089';
const PANEL = '#80583A', PANEL_D = '#684630', PANEL_L = '#946A47';
const FLOOR = '#A87647', FLOOR_D = '#8F6139', FLOOR_L = '#BC8A5B';
const CORK = '#C99A62', CORK_D = '#B0824D', CORK_DOT = '#A97A45', FRAME = '#6B4A2E';
const PAPER = '#EFE1B9', PAPER_D = '#DCC99A', INKMAP = '#7A5B3A';
const STEEL = '#9AA2A8', STEEL_D = '#788087', STEEL_L = '#B4BBC0';
const BOX = '#D8BA8A', BOX_D = '#BE9E6C', BOX_L = '#E6CEA4', LABEL = '#F5EFDF';
const SKY = '#A9D1EA', SKY_D = '#8DBEDD';
const ROOF = '#B5573A', ROOF_D = '#934531';
const OAK = '#7C4F2B', OAK_D = '#5F3B1F', OAK_L = '#9A673C';
const GREEN = '#2F7A50', GREEN_D = '#225E3C', GREEN_L = '#4D9A6C';
const BRASS = '#CDA24C', BRASS_D = '#A27D31';
const WICKER = '#C49A5A', WICKER_D = '#A27B3E';
const RED = '#B8432F', RED_D = '#923222';

// the dig
const DSKY = ['#8EC4E6', '#A2CFEA', '#B8DAEE', '#CDE4EF'];
const HAZE = '#A8BDB9', HAZE_D = '#93AAA6';
const GROVE = '#7E9157', GROVE_D = '#67784A', GROVE_L = '#93A66A';
const HILL = '#C8B27E', HILL_D = '#B09A66';
const LIME = '#E6D7B4', LIME_D = '#CDBB92', LIME_DD = '#B3A078';
const MARBLE = '#F1EADB', MARBLE_D = '#D8CCB2', MARBLE_DD = '#BFB194';
const DUST = '#D9C28F', DUST_D = '#C3AA74', DUST_L = '#E6D2A4';
const SOIL = '#8A6440', SOIL_D = '#6E4E31';
const PLASTER = '#F3EBDA', PLASTER_D = '#D9CDB4';
const TIMBER = '#C99A60', TIMBER_D = '#A67A44', TIMBER_L = '#DDB27B';
const TRIM = '#3F6E94';
const CYPRESS = '#3F5C3D', CYPRESS_D = '#2F4630';

/** A sky in flat bands, lightest at the horizon. */
function sky(x, y0, w, h, bands = DSKY) {
  const out = [];
  const cut = [0, 0.3, 0.55, 0.78, 1];
  for (let k = 0; k < 4; k++) out.push(box(x, y0 + h * cut[k], w, h * (cut[k + 1] - cut[k]) + 0.3, bands[k]));
  return out.join('');
}
/** An archive box seen end-on: buff card, a darker side, a white end label. */
function archiveBox(x, y, w, h) {
  return rect(x, y, w, h, BOX, 0.6)
    + box(x + w * 0.72, y + 0.4, w * 0.28 - 0.4, h - 0.8, BOX_D)
    + box(x, y, w, 1.6, BOX_L)
    + rect(x + w * 0.18, y + h * 0.3, w * 0.42, h * 0.32, LABEL, 0.35)
    + line(`M${f2(x + w * 0.24)},${f2(y + h * 0.42)} L${f2(x + w * 0.52)},${f2(y + h * 0.42)} M${f2(x + w * 0.24)},${f2(y + h * 0.52)} L${f2(x + w * 0.46)},${f2(y + h * 0.52)}`, '#8E8170', 0.35);
}
/** A steel shelving bay: two uprights, shelves, and boxes on each (`skip` leaves a slot empty). */
function shelving(x0, x1, top, yb, shelves, skip = -1) {
  const o = [];
  const gap = (yb - top) / shelves;
  o.push(box(x0, top, x1 - x0, yb - top, '#5E5A54'));                                 // the shadow behind the bay
  for (let s = 0; s < shelves; s++) {
    const y = top + gap * (s + 1);
    if (s !== skip) {
      let x = x0 + 3;
      let k = 0;
      while (x < x1 - 14) {
        const w = 15 + ((k * 7 + s * 3) % 4) * 1.5;
        const h = gap - 5 - ((k + s) % 3 === 0 ? 2 : 0);
        if (x + w > x1 - 3) break;
        o.push(archiveBox(x, y - 1.6 - h, w, h));
        x += w + 1;
        k += 1;
      }
    }
    o.push(rect(x0, y - 2, x1 - x0, 2.6, STEEL, 0.5));
    o.push(box(x0, y + 0.2, x1 - x0, 0.6, STEEL_D));
  }
  for (const ux of [x0, x1 - 3]) {
    o.push(rect(ux, top - 2, 3, yb - top + 2, STEEL, 0.6));
    o.push(box(ux + 1.8, top - 1.6, 1, yb - top + 1.4, STEEL_D));
    for (let y = top + 4; y < yb - 2; y += 6) o.push(box(ux + 1, y, 1, 1.6, STEEL_D));
  }
  return o.join('');
}

// ══════════════════════════════════════════════════════════════════════════════
// THE RECORD ROOM
// ══════════════════════════════════════════════════════════════════════════════

/** FAR: the ceiling and its beams, the high windows over the town, the wall, the door, the
 *  corkboard and its town map, the steel shelves of boxes, the board floor. */
export function roomFar() {
  const o = [];
  // the ceiling: boards between dark beams, receding
  o.push(box(0, 214, 400, 36, CEIL));
  for (let x = 0; x < 400; x += 9) o.push(line(`M${x},214 L${x},250`, CEIL_D, 0.5));
  for (const x of [20, 112, 204, 296, 388]) {
    o.push(rect(x - 6, 214, 12, 38, CEIL_L, 0.8));
    o.push(box(x + 1.5, 214.5, 4, 37, CEIL_D));
  }
  // the wall, a moulding along its top
  o.push(box(0, 250, 400, 222, WALL));
  o.push(rect(-2, 248, 404, 5, WALL_D, 0.7));
  // the high windows: three, each sky with the town's roofs and a chimney in it
  for (const x of [118, 182, 246]) {
    o.push(rect(x - 2, 256, 50, 30, WALL_DD, 0.8));
    o.push(box(x + 1, 258.6, 44, 25, SKY));
    o.push(box(x + 1, 258.6, 44, 7, SKY_D));
    o.push(fill(P([[x + 1, 283.6], [x + 1, 276], [x + 9, 270], [x + 17, 276], [x + 17, 271], [x + 27, 266], [x + 37, 273], [x + 45, 270], [x + 45, 283.6]]), ROOF, 0.5));
    o.push(flat(P([[x + 27, 266], [x + 37, 273], [x + 45, 270], [x + 45, 283.6], [x + 30, 283.6]]), ROOF_D));
    o.push(rect(x + 31, 262, 4, 8, '#8C6E58', 0.4));
    o.push(line(`M${x + 23},258.6 L${x + 23},283.6 M${x + 1},271 L${x + 45},271`, '#F3EFE6', 1.3));
    o.push(rect(x - 3, 285, 52, 3, WALL_D, 0.6));                                     // the sill
  }
  // the light from the windows, in pale slants down the wall
  for (const x of [118, 182, 246]) o.push(flat(`M${x + 6},288 L${x + 40},288 L${x + 58},470 L${x + 22},470 Z`, '#FFF6DE', 0.3));
  // the wainscot along the bottom of the wall
  o.push(rect(-2, 420, 404, 50, PANEL, 0.8));
  o.push(box(0, 421, 400, 3, PANEL_L));
  for (let x = 8; x < 400; x += 40) {
    o.push(rect(x, 430, 32, 32, PANEL_D, 0.5));
    o.push(box(x + 1, 430.5, 31, 2, PANEL_L));
  }
  o.push(rect(-2, 418, 404, 4, PANEL_L, 0.6));
  // the door, its frame and the dim corridor beyond (the leaf is its own picture)
  o.push(rect(14, 372, 48, 100, OAK_L, 0.9));
  o.push(rect(19, 377, 38, 95, '#5B5048', 0.6));
  o.push(box(19.5, 377.5, 37, 40, '#6E6359'));
  o.push(box(26, 386, 20, 26, '#8D8172'));                                            // a lit window down the corridor
  o.push(line('M36,386 L36,412 M26,399 L46,399', '#6E6359', 1));
  o.push(box(19.5, 450, 37, 22, '#4D433C'));
  // a wall clock over the door (its hands move: the scene draws them)
  o.push(circ(38, 344, 12, '#F7F1E2', 1.2));
  o.push(circ(38, 344, 12.8, 'none', 0.8));
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * Math.PI * 2;
    o.push(line(`M${f2(38 + 9.4 * Math.sin(a))},${f2(344 - 9.4 * Math.cos(a))} L${f2(38 + 10.8 * Math.sin(a))},${f2(344 - 10.8 * Math.cos(a))}`, OUT, k % 3 ? 0.5 : 1));
  }
  // the corkboard in its frame
  o.push(rect(96, 291, 224, 98, FRAME, 1.1));
  o.push(rect(100, 295, 216, 90, CORK, 0.6));
  o.push(box(100.5, 295.5, 215, 3, CORK_D));
  for (let k = 0; k < 140; k++) {
    const x = 102 + ((k * 37) % 211), y = 299 + ((k * 53) % 83);
    o.push(box(x, y, 0.9, 0.9, CORK_DOT));
  }
  // the old town map: the river, the streets, the rows of wooden houses packed close on
  // the left, the bakery (its chimney) on the right, a compass rose
  o.push(fill('M106,300 L212,299 L214,382 L105,383 Z', PAPER, 0.8));
  o.push(flat('M188,300 L212,299 L214,382 L196,383 Z', PAPER_D));
  o.push(flat('M106,352 C132,348 150,360 170,356 C186,352 200,360 213,357 L213,363 C200,366 186,358 170,362 C150,366 132,354 106,358 Z', '#9FC2D0'));
  o.push(line('M106,352 C132,348 150,360 170,356 C186,352 200,360 213,357 M106,358 C132,354 150,366 170,362 C186,358 200,366 213,363', INKMAP, 0.4));
  o.push(line('M108,318 L211,316 M108,338 L211,336 M108,374 L211,373 M140,301 L140,382 M176,300 L176,382', INKMAP, 0.6));
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 4; c++) {
      const x = 110 + c * 7.2, y = 304 + r * 11;
      if (y + 7 > 336) continue;
      o.push(rect(x, y + 2.4, 5.6, 4.6, '#B88A5A', 0.35));
      o.push(fill(P([[x - 0.4, y + 2.6], [x + 2.8, y], [x + 6, y + 2.6]]), '#8E6440', 0.3));
    }
  }
  for (let c = 0; c < 4; c++) {
    const x = 144 + c * 7.4;
    o.push(rect(x, 324, 5.6, 4.6, '#B88A5A', 0.35));
    o.push(fill(P([[x - 0.4, 324.2], [x + 2.8, 321.6], [x + 6, 324.2]]), '#8E6440', 0.3));
  }
  o.push(rect(184, 322, 11, 9, '#C9AE84', 0.5));                                     // the bakery
  o.push(fill(P([[183, 322.4], [189.5, 318], [196, 322.4]]), '#8E6440', 0.4));
  o.push(rect(192, 315, 2.4, 5, '#6E5644', 0.3));
  o.push(line('M120,368 L124,376 M128,368 L124,376', INKMAP, 0.5));
  o.push(circ(124, 372, 5, 'none', 0.5));
  o.push(flat('M193,300 C200,306 205,312 212,314 L212,299 Z', '#000', 0.08));      // a curled corner
  // the steel shelves on the right, a slot left empty at desk height for the box
  o.push(shelving(346, 400, 281, 460, 5, 4));
  o.push(shelving(346, 400, 460, 466, 1, 0));
  // the skirting and the floor of boards
  o.push(rect(-2, 466, 404, 7, PANEL_D, 0.7));
  o.push(rect(-2, 472, 404, 44, FLOOR, 0.8));
  o.push(box(0, 472.5, 400, 4, FLOOR_D));
  for (const y of [482, 494, 507]) o.push(line(`M0,${y} L400,${y}`, FLOOR_D, 0.6));
  [[472, 482], [482, 494], [494, 507], [507, 516]].forEach(([y0, y1], r) => {
    for (let x = 10 + r * 23; x < 400; x += 58 + r * 6) o.push(line(`M${x},${y0} L${x - 1},${y1}`, FLOOR_D, 0.5));
    for (let x = 30 + r * 17; x < 400; x += 90) o.push(box(x, y0 + 2, 22, 2, FLOOR_L, 0.8));
  });
  return o.join('');
}

/** Two pendant lamps hanging from the beams: enamel shades on cords (light pools under them). */
export function roomPendants() {
  const o = [];
  for (const x of [74, 356]) {
    o.push(line(`M${x},250 L${x},270`, '#3A3A3A', 0.7));
    o.push(fill(`M${x - 9},279 C${x - 8},272 ${x - 4},270 ${x},270 C${x + 4},270 ${x + 8},272 ${x + 9},279 Z`, '#3F6B58', 0.7));
    o.push(flat(`M${x + 2},270.6 C${x + 6},271 ${x + 8},273 ${x + 9},279 L${x + 4},279 Z`, '#2F5444'));
    o.push(ell(x, 279.4, 9, 1.4, '#F6E9C2', 0.5));
  }
  return o.join('');
}

/** The door leaf, hinged on its left edge (x 19), seen closed: oak planks, panels, a knob. */
export function doorLeaf() {
  return rect(19, 377, 38, 95, OAK, 0.9)
    + box(46, 377.6, 10.4, 93.8, OAK_D)
    + rect(23, 382, 30, 36, OAK_L, 0.5) + rect(23, 424, 30, 42, OAK_L, 0.5)
    + box(44, 382.5, 8.5, 35, OAK, 0.8) + box(44, 424.5, 8.5, 41, OAK, 0.8)
    + circ(52, 426, 1.8, BRASS, 0.5);
}

/** NEAR: the long oak desk over their legs, the banker's lamp on it, the ink pad, the
 *  waste-paper basket on the floor at the left. */
export function roomDesk() {
  const o = [];
  // the waste-paper basket: woven, flaring, a crumpled sheet in it
  o.push(fill('M136,482 L156,482 L154,500 L138,500 Z', WICKER, 0.8));
  o.push(flat('M149,482.4 L155.6,482.4 L153.6,499.6 L147,499.6 Z', WICKER_D));
  for (const y of [486, 490, 494]) o.push(line(`M137,${y} L155,${y}`, WICKER_D, 0.5));
  o.push(rect(135, 480.6, 22, 2.6, WICKER_D, 0.6));
  o.push(circ(142, 480, 2.6, '#F2EBDA', 0.4));
  // the desk, LOW (2026-10-08): its top at y 460, 40 units over the floor, at a stickman's hip;
  // drawn BEHIND the figures, who stand at it rather than in it. The top's lit edge, its
  // front, two pedestals of drawers.
  const DY = 9;
  o.push(rect(152, 460, 194, 5, OAK_L, 1));
  o.push(box(154, 463.6, 190, 1.4, OAK));
  o.push(rect(156, 465, 186, 6, OAK, 0.9));
  o.push(rect(160, 471, 30, 29, OAK, 0.9));
  o.push(box(179, 471.6, 10, 27.8, OAK_D));
  o.push(rect(308, 471, 30, 29, OAK, 0.9));
  o.push(box(327, 471.6, 10, 27.8, OAK_D));
  for (const x of [160, 308]) {
    for (const y of [474, 486]) {
      o.push(rect(x + 3, y, 24, 9, OAK_L, 0.5));
      o.push(rect(x + 12, y + 3.6, 6, 1.8, BRASS, 0.3));
    }
  }
  o.push(line('M164,468 L334,468', OAK_D, 0.6));
  o.push(rect(156, 499, 186, 1.6, OAK_D, 0.4));
  // the banker's lamp: a round brass foot, a stem, an arm, the green shade over the blotter
  o.push(ell(278, 450 + DY, 7, 1.8, BRASS, 0.7));
  o.push(rect(276.6, 418 + DY, 2.8, 31, BRASS, 0.5));
  o.push(box(278.4, 418.5 + DY, 1, 30, BRASS_D));
  o.push(line(`M278,${419 + DY} L266,${419 + DY}`, BRASS_D, 1.2));
  o.push(fill(`M250,${424 + DY} C250,${416 + DY} 256,${413 + DY} 264,${413 + DY} C272,${413 + DY} 278,${416 + DY} 278,${424 + DY} Z`, GREEN, 0.8));
  o.push(flat(`M266,${413.4 + DY} C272,${413.6 + DY} 277.4,${416.4 + DY} 277.6,${423.6 + DY} L270,${423.6 + DY} C270,${418 + DY} 268.6,${415 + DY} 266,${413.4 + DY} Z`, GREEN_D));
  o.push(flat(`M254,${421 + DY} C254.6,${417 + DY} 258,${415 + DY} 262,${414.6 + DY} C258.6,${416 + DY} 256.4,${418.4 + DY} 256,${421 + DY} Z`, GREEN_L));
  o.push(line(`M272,${424 + DY} L272,${431 + DY}`, '#9A9A8C', 0.4));
  o.push(circ(272, 432 + DY, 0.8, BRASS, 0.3));
  // the leather blotter under the lamp, and the ink pad
  o.push(rect(246, 449.4 + DY, 30, 2.2, '#4C6A52', 0.4));
  o.push(rect(305, 447.6 + DY, 14, 3.6, '#3A4E6E', 0.6));
  o.push(box(306.4, 448.2 + DY, 11.2, 1.2, RED_D));
  return o.join('');
}

/** The open box of the fire's papers, its lid leant behind it, letters tied in string: 32 × 20,
 *  drawn over what is in it (the scene stands the booklet and the notebook inside). */
export function fireBox() {
  const o = [];
  o.push(rect(-14, -20, 26, 6, BOX_L, 0.5));                                         // the lid, leant behind
  o.push(rect(-15, -12, 32, 12, BOX, 0.8));
  o.push(box(8, -11.5, 8.6, 11, BOX_D));
  o.push(rect(-9, -9, 16, 5, LABEL, 0.35));
  o.push(line('M-7,-7.6 L3,-7.6 M-7,-5.8 L0,-5.8', '#8E8170', 0.35));
  o.push(rect(-13, -15, 8, 4, '#F3EAD3', 0.4));
  o.push(line('M-13,-13 L-5,-13', '#B0423B', 0.5));
  return o.join('');
}

/** An archive box with its lid off (the lid is its own picture), front-on: 24 × 13. */
export function archiveBoxPic() {
  return rect(-12, -13, 24, 13, BOX, 0.8)
    + box(5, -12.5, 6.6, 12, BOX_D)
    + rect(-10, -15, 7, 3, '#F3EAD3', 0.3)
    + rect(-2, -14.4, 6, 2.4, '#E8DBBD', 0.3)
    + rect(-8, -9, 9, 5.5, LABEL, 0.4)
    + line('M-11.6,-6 L-8,-6', '#A27D50', 0.5);
}
/** Its lid: 26 × 4. */
export function archiveLid() {
  return rect(-13, -2, 26, 4, BOX_L, 0.7) + box(5, -1.6, 7.6, 3.2, BOX);
}

/** The framed painting of the fire, propped up on its easel back: 20 × 24. */
export function painting() {
  const o = [];
  o.push(line('M4,-4 L9,0', OAK_D, 1.2));                                             // the strut behind
  o.push(rect(-10, -24, 20, 22, '#C8973E', 1));                                      // the gilt frame
  o.push(box(2, -23.4, 7.4, 20.8, '#A97B2C'));
  o.push(rect(-7, -21, 14, 16, '#2E2A3E', 0.5));                                     // night
  o.push(fill('M-7,-5 L-7,-10 L-4,-12 L-2,-9 L0,-14 L2,-10 L4,-15 L6,-9 L7,-11 L7,-5 Z', '#E2672E', 0.3));
  o.push(flat('M-5,-5 L-3,-9 L-1,-7 L0,-11 L2,-7 L4,-10 L5,-5 Z', '#F2B33D'));
  o.push(box(-6, -8, 3, 3, '#3A2A22'));
  o.push(box(2, -8.6, 3.4, 3.6, '#3A2A22'));
  o.push(flat('M-7,-21 L7,-21 L7,-17 C3,-15 -2,-18 -7,-16 Z', '#5A5368'));         // smoke
  o.push(rect(-11, -3, 22, 3, '#B5852F', 0.6));
  return o.join('');
}

/** The glossy souvenir booklet, flames on its cover: 14 × 18, held upright. */
export function booklet() {
  return rect(-7, -18, 14, 18, '#F4EEE2', 0.8)
    + box(-6.2, -17.2, 12.4, 10, '#2B2F52')
    + fill('M-6.2,-7.2 L-6.2,-10.4 L-3.6,-13.4 L-1.6,-10.6 L0.6,-15.6 L2.6,-11 L4.4,-13.6 L6.2,-10.2 L6.2,-7.2 Z', '#E8622C', 0.3)
    + flat('M-4,-7.2 L-2,-10.4 L0.4,-8.6 L1.6,-12 L3.4,-8.4 L4.4,-7.2 Z', '#F6C043')
    + box(-5.2, -5.4, 10.4, 1.4, RED)
    + box(-5.2, -3, 7, 0.9, '#8C867A')
    + flat('M-6.2,-17.2 L-2,-17.2 L-6.2,-11 Z', '#FFFFFF', 0.25)
    + box(5.4, -17.6, 1.2, 17.2, '#D9D2C2');
}
/** The fireman's notebook, closed: a black oilcloth cover, smoke-stained, a strap: 12 × 16. */
export function notebookShut() {
  return rect(-6, -16, 12, 16, '#2C2A28', 0.8)
    + flat('M-5.4,-15.4 C-1,-14 2,-12 5.4,-13 L5.4,-6 C2,-8 -2,-5 -5.4,-7 Z', '#5D564C', 0.8)
    + flat('M-3,-4 C0,-6 3,-3 5.4,-4.4 L5.4,-0.6 L-3,-0.6 Z', '#4A443C', 0.8)
    + box(3.6, -15.6, 1.2, 15.2, '#7A5A3A')
    + box(-6.6, -15.4, 1.2, 14.8, '#E9DDBE');
}
/** The same notebook open, its pencilled pages smudged: 22 × 15. */
export function notebookOpen() {
  const o = [];
  o.push(fill('M-11,-1 L-11,-13 C-6,-14.6 -2,-14.2 0,-13 C2,-14.2 6,-14.6 11,-13 L11,-1 C6,-2.2 2,-2 0,-0.4 C-2,-2 -6,-2.2 -11,-1 Z', '#EDE2C4', 0.8));
  o.push(flat('M0,-13 C2,-14.2 6,-14.6 11,-13 L11,-1 C6,-2.2 2,-2 0,-0.4 Z', '#DDCFAB'));
  for (let k = 0; k < 5; k++) {
    const y = -11.2 + k * 2;
    o.push(line(`M-9.4,${y} L-1.6,${y + 0.3}`, '#56534E', 0.45));
    o.push(line(`M1.6,${y + 0.3} L${k === 4 ? 6 : 9.4},${y}`, '#56534E', 0.45));
  }
  o.push(flat('M-10,-6 C-7,-8 -4,-5 -2,-7 L-2,-3 C-5,-2 -8,-4 -10,-3 Z', '#8A8172', 0.5));
  o.push(line('M0,-13 L0,-0.4', '#B8A882', 0.5));
  return o.join('');
}
/** The rubber stamp: a red turned handle, a wooden block, the rubber under it: 12 × 15. */
export function rubberStamp() {
  return ell(0, -13, 4.2, 2.6, RED, 0.7)
    + rect(-1.6, -12, 3.2, 5, RED_D, 0.6)
    + rect(-6, -7.4, 12, 5, OAK_L, 0.8)
    + box(2.6, -7, 3, 4.2, OAK)
    + rect(-5.4, -2.6, 10.8, 2.6, '#3A2E2A', 0.5);
}
/** The magnifying glass: a brass ring round a pale lens, a turned wooden handle: 18 × 8. */
export function magnifier() {
  return rect(-9, -1.5, 9, 3, OAK_L, 0.7)
    + box(-9, 0.2, 9, 1.2, OAK)
    + circ(4, 0, 5, '#D9EDF2', 1.2)
    + flat('M1.4,-2.6 C2.6,-3.8 4.4,-3.8 5.6,-3 C4,-2.6 2.8,-2 2,-0.6 Z', '#FFFFFF', 0.8)
    + `<circle cx="4" cy="0" r="5" fill="none" stroke="${BRASS}" stroke-width="1.2"/>`;
}

// ══════════════════════════════════════════════════════════════════════════════
// THE DIG — drawn in its own frame (x 0–400), laid at world x 400.
// ══════════════════════════════════════════════════════════════════════════════

/** An olive tree: a low grey-green crown on a crooked trunk. */
function olive(x, yb, s, c = GROVE, cd = GROVE_D) {
  return line(`M${x},${yb} C${x - s * 0.1},${yb - s * 0.3} ${x + s * 0.15},${yb - s * 0.45} ${x},${yb - s * 0.6}`, '#6E5238', s * 0.16)
    + fill(`M${x - s},${yb - s * 0.62} C${x - s * 1.05},${yb - s * 1.05} ${x - s * 0.4},${yb - s * 1.2} ${x},${yb - s * 1.1} C${x + s * 0.5},${yb - s * 1.25} ${x + s * 1.1},${yb - s},${x + s * 0.95},${yb - s * 0.6} C${x + s * 0.6},${yb - s * 0.42} ${x - s * 0.6},${yb - s * 0.4} ${x - s},${yb - s * 0.62} Z`, c, 0.6)
    + flat(`M${x + s * 0.95},${yb - s * 0.6} C${x + s * 0.6},${yb - s * 0.42} ${x - s * 0.3},${yb - s * 0.44} ${x - s * 0.7},${yb - s * 0.55} C${x - s * 0.2},${yb - s * 0.62} ${x + s * 0.5},${yb - s * 0.66} ${x + s * 0.95},${yb - s * 0.8} Z`, cd);
}
function cypress(x, yb, h, w = 6) {
  return fill(`M${x},${yb - h} C${x + w * 0.6},${yb - h * 0.7} ${x + w * 0.7},${yb - h * 0.25} ${x + w * 0.5},${yb} L${x - w * 0.5},${yb} C${x - w * 0.7},${yb - h * 0.25} ${x - w * 0.6},${yb - h * 0.7} ${x},${yb - h} Z`, CYPRESS, 0.6)
    + flat(`M${x},${yb - h + 2} C${x + w * 0.5},${yb - h * 0.7} ${x + w * 0.6},${yb - h * 0.25} ${x + w * 0.45},${yb - 0.6} L${x + 0.6},${yb - 0.6} C${x + 1.6},${yb - h * 0.4} ${x + 1},${yb - h * 0.75} ${x},${yb - h + 2} Z`, CYPRESS_D);
}
/** A village house: whitewash, a tiled roof, a blue door. */
function house(x, yb, w, h, flip = false) {
  return rect(x, yb - h, w, h, PLASTER, 0.6)
    + box(flip ? x + 0.3 : x + w * 0.64, yb - h + 0.3, w * 0.36 - 0.3, h - 0.6, PLASTER_D)
    + fill(P([[x - 1.2, yb - h + 0.4], [x + w / 2, yb - h - 4], [x + w + 1.2, yb - h + 0.4]]), ROOF, 0.6)
    + box(x + w * 0.24, yb - h * 0.5, w * 0.16, h * 0.5, TRIM)
    + box(x + w * 0.56, yb - h * 0.72, w * 0.14, h * 0.2, '#4A5E70');
}
/** A course of squared limestone blocks, the ruined wall of a house or a street. */
function wallCourse(x0, x1, y, h, seed = 1) {
  const o = [];
  let x = x0;
  let k = seed;
  while (x < x1) {
    const w = Math.min(x1 - x, 11 + ((k * 7) % 9));
    o.push(rect(x, y, w - 0.6, h, LIME, 0.6));
    o.push(box(x + w * 0.62, y + 0.4, w * 0.36 - 0.8, h - 0.8, LIME_D));
    o.push(box(x + 0.4, y + 0.4, w - 1.4, 1.2, '#F2E8D0'));
    x += w;
    k += 1;
  }
  return o.join('');
}
/** A column drum lying on its side, fluted: a squat cylinder seen side-on. */
function drum(x, y, w, h) {
  const o = [];
  o.push(rect(x, y - h, w, h, MARBLE, 0.8, 1.2));
  o.push(box(x + 0.4, y - h * 0.38, w - 0.8, h * 0.36, MARBLE_D));
  for (let k = 1; k < 5; k++) o.push(line(`M${f2(x + 0.6)},${f2(y - h + (h * k) / 5)} L${f2(x + w - 0.6)},${f2(y - h + (h * k) / 5)}`, MARBLE_DD, 0.45));
  o.push(ell(x + w, y - h / 2, 2.2, h / 2, MARBLE_D, 0.7));
  return o.join('');
}

/** FAR: the hot sky, the hazy mountains, the olive grove on the slope, the village on its
 *  hill with a church, a broken temple on the far ridge, the dusty plain below. */
export function digFar() {
  const o = [];
  o.push(sky(0, 214, 400, 170));
  // the far mountains in the haze
  o.push(flat('M0,360 C40,334 80,326 120,336 C160,322 210,314 250,326 C300,312 350,318 400,330 L400,400 L0,400 Z', HAZE));
  o.push(flat('M250,326 C300,312 350,318 400,330 L400,400 L280,400 C300,370 290,340 250,326 Z', HAZE_D));
  // the near ridge: dry grass and rock, the broken temple on its crown (left)
  o.push(fill('M-4,392 C30,366 70,354 110,358 C150,362 170,374 196,384 L196,420 L-4,420 Z', HILL, 0.8));
  o.push(flat('M110,358 C150,362 170,374 196,384 L196,420 L140,420 C150,396 134,370 110,358 Z', HILL_D));
  o.push(rect(46, 350, 52, 4, MARBLE, 0.6));
  for (const x of [50, 60, 70, 88]) o.push(rect(x, 354, 4, x === 70 ? 6 : 14, MARBLE, 0.5));
  o.push(rect(78, 362, 4, 6, MARBLE, 0.5));
  o.push(rect(44, 367, 58, 3, MARBLE_D, 0.5));
  // the village on its hill (right): a church dome, white houses stepping down
  o.push(fill('M200,404 C230,368 270,350 310,350 C350,350 384,362 404,372 L404,420 L200,420 Z', HILL, 0.8));
  o.push(flat('M310,350 C350,350 384,362 404,372 L404,420 L350,420 C356,390 340,360 310,350 Z', HILL_D));
  o.push(rect(296, 336, 18, 14, PLASTER, 0.6));
  o.push(fill('M296,336 C296,326 314,326 314,336 Z', '#4E7DA6', 0.6));
  o.push(rect(304, 322, 2, 6, OUT, 0));
  o.push(line('M302.4,324 L307.6,324', OUT, 0.6));
  for (const [x, yb, w, h, f] of [[258, 362, 14, 9, false], [276, 356, 14, 10, true], [318, 360, 16, 9, false], [338, 364, 14, 9, true],
    [244, 376, 16, 10, true], [268, 374, 14, 9, false], [286, 370, 16, 10, false], [356, 374, 16, 9, false], [376, 372, 14, 10, true],
    [300, 384, 16, 10, true], [322, 386, 14, 9, false], [230, 390, 14, 9, false]]) o.push(house(x, yb, w, h, f));
  for (const [x, yb, h] of [[236, 380, 18], [350, 382, 16], [392, 380, 20], [130, 374, 16], [20, 380, 18]]) o.push(cypress(x, yb, h, 5));
  // the olive grove, rows of round crowns down the slope
  o.push(fill('M-4,420 C60,404 140,406 200,410 C260,404 330,404 404,412 L404,446 L-4,446 Z', '#A9A06A', 0.6));
  for (let r = 0; r < 3; r++) {
    for (let k = 0; k < 13; k++) {
      const x = 6 + k * 31 + (r % 2) * 15;
      const yb = 414 + r * 9;
      o.push(olive(x, yb, 6.6 + r * 0.8, r === 2 ? GROVE_L : GROVE));
    }
  }
  return o.join('');
}

/** MID: the plain of the dig — dusty ground, ruined walls standing a course or three, the
 *  village well with its frame and pulley, the fallen column, the carved stone, the new
 *  ticket hut, a sieve on its frame, buckets, the back edge of the trench. */
export function digMid() {
  const o = [];
  // the ground
  o.push(rect(-2, 440, 404, 76, DUST, 0.8));
  o.push(box(0, 440.5, 400, 4, DUST_D));
  for (const [x, y, w] of [[20, 452, 26], [120, 458, 18], [276, 450, 24], [330, 498, 30], [60, 504, 22], [160, 508, 26], [250, 470, 16], [380, 462, 14]]) {
    o.push(box(x, y, w, 1.6, DUST_L));
    o.push(box(x + 4, y + 2, w * 0.6, 1, DUST_D));
  }
  for (const [x, y] of [[14, 476], [104, 494], [210, 452], [292, 506], [368, 490], [178, 470], [44, 460]]) o.push(ell(x, y, 2.4, 1.2, LIME_D, 0.4));
  // the ruined walls of the old town behind the work
  o.push(wallCourse(96, 178, 434, 8, 2));
  o.push(wallCourse(104, 162, 426, 8, 5));
  o.push(wallCourse(190, 296, 432, 9, 3));
  o.push(wallCourse(206, 266, 423, 9, 7));
  o.push(wallCourse(226, 250, 414, 9, 1));
  o.push(box(96, 441.5, 82, 2.6, '#000', 0.08));
  o.push(box(190, 440.6, 106, 2.6, '#000', 0.08));
  // a standing column stump behind the walls
  o.push(rect(176, 396, 11, 40, MARBLE, 0.8));
  o.push(box(183, 396.6, 3.4, 38.8, MARBLE_D));
  for (const x of [179, 181.5]) o.push(line(`M${x},398 L${x},434`, MARBLE_DD, 0.4));
  o.push(fill('M175,396 L178,392 L186,393 L188,396 Z', MARBLE_D, 0.6));
  // the excavation strings: pegs and a grid of string over the far trench
  for (const x of [104, 134, 164]) o.push(line(`M${x},446 L${x},440`, '#8A6A44', 1));
  o.push(line('M104,441 L164,441', '#E24F3C', 0.5));

  // ── THE WELL (x 70): a marble wellhead worn by ropes, a stone frame, beam and pulley ──
  o.push(rect(44, 404, 6, 52, LIME, 0.8));
  o.push(box(47.6, 404.6, 2, 51, LIME_D));
  o.push(rect(90, 404, 6, 52, LIME, 0.8));
  o.push(box(93.6, 404.6, 2, 51, LIME_D));
  o.push(rect(40, 398, 60, 7, LIME, 0.9));
  o.push(box(41, 402, 58, 2.4, LIME_D));
  o.push(circ(70, 409, 4.4, '#8C6A44', 0.8));                                         // the pulley wheel
  o.push(circ(70, 409, 1.4, '#5E4630', 0.4));
  o.push(line('M70,405 L70,401', '#5E4630', 1));
  // the wellhead (its mouth is behind the rim; the bucket is the scene's)
  o.push(ell(70, 456, 21, 4, '#3B2E24', 0.8));                                         // the dark mouth
  o.push(rect(49, 456, 42, 30, MARBLE, 1, 2));
  o.push(box(77, 456.6, 13.4, 28.8, MARBLE_D));
  o.push(box(49.5, 465, 41, 2, MARBLE_DD));
  for (const x of [56, 62, 82]) o.push(line(`M${x},458 L${x - 0.6},464`, MARBLE_DD, 0.5));  // rope grooves worn into the rim
  o.push(fill('M49,456 C52,458.6 88,458.6 91,456 L91,458.8 C88,461.4 52,461.4 49,458.8 Z', '#E6DCC4', 0.6));
  o.push(rect(46, 484, 48, 5, LIME_D, 0.7));
  // a clay water jar waiting by the well
  o.push(fill('M100,486 C96,478 98,470 104,468 L104,465 L110,465 L110,468 C116,470 118,478 114,486 Z', '#C57A48', 0.6));
  o.push(flat('M108,469 C114,471 116,478 113,485.6 L108,485.6 Z', '#A35E33'));

  // ── THE FALLEN COLUMN (x 120–178): drums lying where they fell, its capital at the end ──
  o.push(box(118, 487, 62, 2.4, '#000', 0.1));
  o.push(drum(120, 488, 13, 15));
  o.push(drum(134, 487.6, 13, 15.4));
  o.push(drum(148, 488.4, 12, 14.8));
  o.push(rect(161, 471, 7, 18, MARBLE, 0.8));                                       // the capital's echinus
  o.push(rect(167, 468, 9, 22, MARBLE, 0.8, 1));
  o.push(box(172.4, 468.6, 3, 20.8, MARBLE_D));

  // ── THE CARVED STONE (x 231): a tall stele on a base; the giant general in relief ──
  o.push(rect(217, 474, 30, 9, LIME_D, 0.9));
  o.push(fill('M220,474 L220,390 C224,384 238,384 242,390 L242,474 Z', MARBLE, 1));
  o.push(flat('M236,388 C239,388 241,389 242,390 L242,474 L236,474 Z', MARBLE_D));
  o.push(rect(223, 392, 16, 79, '#E6DDC8', 0.5));
  // the general: helmet and crest, a great round shield, his spear upright
  o.push(line('M236,394 L236,470', '#8E8068', 0.9));
  o.push(fill('M226,402 C226,397 232,396 233,401 L232,405 L227,405 Z', '#D5C9AE', 0.5));
  o.push(fill('M227,397 C230,393 233,394 234,398', '#D5C9AE', 0.5));
  o.push(fill('M226,406 L234,406 L235,432 L225,432 Z', '#D5C9AE', 0.5));
  o.push(circ(229, 420, 7.4, '#CFC2A4', 0.6));
  o.push(circ(229, 420, 2.4, '#BDAF8E', 0.4));
  o.push(fill('M226,432 L229,432 L228,466 L225,466 Z', '#D5C9AE', 0.4));
  o.push(fill('M231,432 L234,432 L235,466 L232,466 Z', '#D5C9AE', 0.4));
  o.push(line('M234,412 L236,414', '#8E8068', 0.6));
  // the tiny enemy army fleeing round his feet
  for (const [x, y] of [[225, 470], [230, 468.6], [234.6, 470]]) {
    o.push(circ(x, y - 3.4, 0.9, '#BDAF8E', 0.3));
    o.push(line(`M${x},${y - 2.6} L${x - 0.6},${y} M${x - 1.6},${y - 1.6} L${x + 1.4},${y - 2.2}`, '#8E8068', 0.4));
  }
  o.push(line('M224,474 L240,474', MARBLE_DD, 0.4));

  // ── THE TICKET HUT (x 322–382): new timber, a pitched roof, a serving window ──
  o.push(box(318, 487, 70, 3, '#000', 0.1));
  o.push(rect(324, 430, 56, 58, TIMBER, 1));
  o.push(box(364, 430.6, 15.4, 56.8, TIMBER_D));
  for (let y = 437; y < 488; y += 6) o.push(line(`M325,${y} L379,${y}`, TIMBER_D, 0.45));
  o.push(rect(332, 440, 28, 18, '#3E4A55', 0.8));                                      // the window
  o.push(box(333, 441, 13, 16, '#56646F'));
  o.push(line('M346,440 L346,458', TRIM, 1.2));
  o.push(rect(330, 458, 32, 3, TIMBER_L, 0.7));                                       // the ledge
  o.push(rect(340, 466, 12, 21, '#2F5D82', 0.6));                                     // a blue door
  o.push(circ(349, 477, 0.9, '#E2C35E', 0.3));
  o.push(fill('M318,432 L352,412 L386,432 L384,435 L352,416 L320,435 Z', '#A9443A', 0.9));
  o.push(fill('M352,416 L384,435 L380,435 L352,419 L324,435 L320,435 Z', '#7F3329', 0.4));
  o.push(fill(P([[328, 432], [352, 418], [376, 432]]), TIMBER_L, 0.6));
  o.push(rect(346, 421, 12, 8, '#F4EEDC', 0.5));                                      // its little sign
  o.push(rect(349, 423, 6, 3.6, '#2F5D82', 0.3));
  // a sieve on its frame, a wheelbarrow, buckets, a trowel and a brush
  o.push(line('M286,488 L294,466 M306,488 L298,466', '#7A5A3A', 1.4));
  o.push(rect(284, 462, 26, 5, '#9A7448', 0.7));
  o.push(line('M286,464.5 L308,464.5', '#5E4630', 0.4));
  for (const [x, c] of [[262, '#2E6CA8'], [272, '#D4502F']]) {
    o.push(fill(`M${x - 4.4},480 L${x + 4.4},480 L${x + 3.4},489 L${x - 3.4},489 Z`, c, 0.6));
    o.push(line(`M${x - 4.2},480 C${x - 3},476 ${x + 3},476 ${x + 4.2},480`, OUT, 0.4));
  }
  o.push(fill('M396,476 L404,476 L404,488 L392,488 Z', '#5F7F54', 0.6));
  // the back edge of the trench she works in
  o.push(fill('M176,494 L246,494 L244,499 L178,499 Z', SOIL_D, 0.6));
  o.push(box(178, 494.5, 66, 2, SOIL));
  return o.join('');
}

/** NEAR: the front of the ground — the trench cut, its strings and pegs, a trowel, pebbles. */
export function digNear() {
  const o = [];
  o.push(fill('M170,498 L252,498 L254,514 L168,514 Z', SOIL, 0.8));
  o.push(flat('M170,498 L252,498 L251,503 L171,503 Z', SOIL_D));
  for (const [x, y] of [[186, 508], [204, 506], [226, 510], [240, 505]]) o.push(ell(x, y, 2.6, 1.2, LIME_D, 0.4));
  for (const x of [168, 211, 254]) o.push(rect(x - 1, 494, 2, 10, '#8A6A44', 0.4));
  o.push(line('M168,496 L254,496', '#E24F3C', 0.5));
  o.push(line('M211,496 L211,514', '#E24F3C', 0.4));
  // a trowel and a soft brush left on the edge
  o.push(fill('M260,500 L270,497 L272,500 L262,503 Z', '#B9BEC2', 0.5));
  o.push(rect(254, 500.6, 7, 2, '#8C5A30', 0.4));
  o.push(rect(130, 503, 10, 2.4, '#8C5A30', 0.4));
  o.push(rect(139, 502, 5, 4.4, '#E7D6A7', 0.4));
  return o.join('');
}

/** The villager at the well: a woman in a headscarf and apron, both hands on the rope, facing
 *  right, in the old frame (feet at y 0): 18 × 40. */
export function villager() {
  const SKIN = '#C08A62';
  return fill('M-6,0 L-5,-24 C-4.4,-27 4.4,-27 5,-24 L6,0 Z', '#4F6E8C', 0.6)
    + flat('M1.6,-25.6 C3.6,-25.6 4.6,-25 5,-24 L6,0 L2.2,0 Z', '#3D5871')
    + fill('M-3.6,-23 L3.6,-23 L4.6,-4 L-4.6,-4 Z', '#E9DFC6', 0.5)
    + fill('M-1,-26 L1,-26 L1,-24 L-1,-24 Z', SKIN, 0.3)
    + circ(0.6, -30.4, 4.2, SKIN, 0.6)
    + fill('M-4.4,-30.4 C-5,-36 4.6,-37 5,-31.6 C3.6,-34 -2,-34.6 -3,-29 L-3.6,-24.6 L-5.4,-25.6 Z', '#B33B33', 0.5)
    + line('M3,-22 C6,-20 8,-19 9,-18 M1.6,-19 C5,-16.4 7.6,-15.4 9.4,-15.4', '#4F6E8C', 2.4)
    + circ(9.4, -17, 1.4, SKIN, 0.4)
    + circ(9.8, -15, 1.4, SKIN, 0.4)
    + flat('M-6,0 L6,0 L5.6,-1.6 L-5.6,-1.6 Z', '#2E2A26');
}
/** The wooden well bucket with iron hoops and a bail, hanging (its top at y 0): 10 × 10. */
export function bucket() {
  return line('M-4.4,-0.6 C-3,-5 3,-5 4.4,-0.6', '#4A4440', 0.7)
    + fill('M-5,0 L5,0 L4,10 L-4,10 Z', '#A9773E', 0.7)
    + flat('M1.4,0.4 L4.6,0.4 L3.6,9.6 L1.6,9.6 Z', '#86592B')
    + line('M-4.8,2.2 L4.8,2.2 M-4.2,8 L4.2,8', '#4A4440', 0.8);
}
/** The juror's bronze ballot: a disc with a short rod through its middle, seen face on: 12 × 8. */
export function ballot() {
  return line('M-6,0 L6,0', '#7A5626', 1.6)
    + circ(0, 0, 3.6, '#B98A3E', 0.6)
    + circ(0, 0, 1.4, '#94692A', 0.3)
    + flat('M-2.6,-1.8 C-1.8,-2.8 -0.4,-3 0.6,-2.8 C-0.6,-2.2 -1.6,-1.6 -2,-0.8 Z', '#E3BE72');
}
/** The dig's brown paper label on its string: 38 × 16 (the word is the scene's). */
export function tag() {
  return fill('M-14,-8 L20,-8 L20,8 L-14,8 L-18,0 Z', '#E8D2A8', 0.7)
    + flat('M-14,6 L20,6 L20,8 L-14,8 L-17,2 Z', '#D2B585')
    + circ(-13.6, 0, 1.4, '#FAF6EC', 0.4);
}

export const ART = [
  { name: 'hist7-room-far', svg: roomFar, view: { x: 0, y: 214, w: 400, h: 300 }, box: { x: 0, y: 214, w: 400, h: 300 } },
  { name: 'hist7-room-pendants', svg: roomPendants, view: { x: 60, y: 248, w: 310, h: 34 }, box: { x: 60, y: 248, w: 310, h: 34 } },
  { name: 'hist7-door', svg: doorLeaf, view: { x: 18, y: 376, w: 40, h: 97 }, box: { x: 18, y: 376, w: 40, h: 97 } },
  { name: 'hist7-room-desk', svg: roomDesk, view: { x: 120, y: 410, w: 228, h: 104 }, box: { x: 120, y: 410, w: 228, h: 104 } },
  { name: 'hist7-firebox', svg: fireBox, view: { x: -16, y: -21, w: 34, h: 22 }, box: { x: -16, y: -21, w: 34, h: 22 } },
  { name: 'hist7-lid', svg: archiveLid, view: { x: -14, y: -3, w: 28, h: 6 }, box: { x: -14, y: -3, w: 28, h: 6 } },
  { name: 'hist7-box', svg: archiveBoxPic, view: { x: -13, y: -16, w: 26, h: 17 }, box: { x: -13, y: -16, w: 26, h: 17 } },
  { name: 'hist7-painting', svg: painting, view: { x: -12, y: -25, w: 24, h: 26 }, box: { x: -12, y: -25, w: 24, h: 26 } },
  { name: 'hist7-booklet', svg: booklet, view: { x: -8, y: -19, w: 16, h: 20 }, box: { x: -8, y: -19, w: 16, h: 20 } },
  { name: 'hist7-notebook', svg: notebookShut, view: { x: -7, y: -17, w: 14, h: 18 }, box: { x: -7, y: -17, w: 14, h: 18 } },
  { name: 'hist7-notebook-open', svg: notebookOpen, view: { x: -12, y: -15, w: 24, h: 16 }, box: { x: -12, y: -15, w: 24, h: 16 } },
  { name: 'hist7-stamp', svg: rubberStamp, view: { x: -7, y: -16, w: 14, h: 17 }, box: { x: -7, y: -16, w: 14, h: 17 } },
  { name: 'hist7-glass', svg: magnifier, view: { x: -10, y: -6, w: 20, h: 12 }, box: { x: -10, y: -6, w: 20, h: 12 } },
  { name: 'hist7-dig-far', svg: digFar, view: { x: 0, y: 214, w: 400, h: 300 }, box: { x: 400, y: 214, w: 400, h: 300 } },
  { name: 'hist7-dig-mid', svg: digMid, view: { x: 0, y: 214, w: 400, h: 300 }, box: { x: 400, y: 214, w: 400, h: 300 } },
  { name: 'hist7-dig-near', svg: digNear, view: { x: 120, y: 488, w: 160, h: 26 }, box: { x: 520, y: 488, w: 160, h: 26 } },
  { name: 'hist7-villager', svg: villager, view: { x: -8, y: -38, w: 20, h: 39 }, box: { x: -8, y: -38, w: 20, h: 39 } },
  { name: 'hist7-bucket', svg: bucket, view: { x: -6, y: -5, w: 12, h: 16 }, box: { x: -6, y: -5, w: 12, h: 16 } },
  { name: 'hist7-ballot', svg: ballot, view: { x: -7, y: -4.5, w: 14, h: 9 }, box: { x: -7, y: -4.5, w: 14, h: 9 } },
  { name: 'hist7-tag', svg: tag, view: { x: -19, y: -9, w: 40, h: 18 }, box: { x: -19, y: -9, w: 40, h: 18 } },
];
