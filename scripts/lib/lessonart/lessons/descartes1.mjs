// philosophy-descartes-1 — "The Stove-Heated Room" (LESSON_RULES AW5, AM13): a snowy
// Bavarian town on the Danube in the winter of 1619, the stove-heated room by day, and the
// same room by night.
//
// Every picture is in SCENE units with the band [214, 514], 400 × 300. Flat fills lit from
// the top left, a darker shaded side, one dark outline; real colours, no gradients, no glows.
//
// REFERENCES (npm run ref, scratchpad/ref/d1*):
//   d1town-1  Merian, "Mülldorff" (Topographia Bavariae, 1644): a walled Bavarian town on
//             its river, square towers, steep gabled roofs packed in rows, an onion-domed
//             church tower, a gate tower, a fence along the road in front.
//   d1snow-1  Valckenborch, "Winter Landscape with Snowfall" (1586): an overcast grey-green
//             sky, roofs under thick snow with dark gable ends, bare trees, the river frozen
//             at its edges, far spires hazed into the sky, flakes falling everywhere.
//   d1stube-2 Sperl, "Bauernstube": whitewashed walls, a dark beamed ceiling, a deep window
//             niche of small leaded panes, a wooden bench and wainscot round the walls,
//             broad floorboards.
//   d1stove-1/2 a Kachelofen (Nabburg open-air museum): a tower of green glazed tiles, each
//             tile cushioned and patterned, a moulded cornice on top, small iron fire doors.
//   d1cannon-1 a 17th-century cannon: a long bronze barrel on a two-wheeled wooden carriage.
//   d1basket-1 van Gogh, "Basket of Apples": a round wicker basket, apples heaped in it.

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
/** A deterministic scatter, so a redraw never moves a flake. */
const rnd = (k) => { const s = Math.sin(k * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

// ── palette ──────────────────────────────────────────────────────────────────
const SKY = ['#B7C4C6', '#C4CFCF', '#D2DAD8', '#DFE4E1'];
const HILL = '#CDD5D6', HILL_D = '#AFBCC1', FIR = '#6F7E7A', FAR_TOWN = '#9EACB1', FAR_TOWN_D = '#8C9BA1';
const RIVER = '#7D989C', RIVER_D = '#6A858A', ICE = '#E6ECEC';
const SNOW = '#F3F5F4', SNOW_D = '#D6DEE2', SNOW_DD = '#BFCAD0';
const TIMBER = '#5A4030', ROOF = '#8C4A36', ROOF_D = '#6E3829';
const PLASTER = ['#E8D8B6', '#DDBBA2', '#CFD3C3', '#E2CFA6'];
const STONE = '#B9B1A1', STONE_D = '#9E9584';
const COPPER = '#5F8C77', COPPER_D = '#4A7060';
const CANVAS = '#E4D9C0', CANVAS_D = '#C7BA98';
const BRONZE = '#8E6C3A', BRONZE_D = '#6E5229', WOOD = '#6B4B2F', WOOD_D = '#4E3521', WOOD_L = '#8A6640';
const BLUE = '#3B78BC', WHITE = '#F6F6F2';

// ══════════════════════════════════════════════════════════════════════════════
// PLACE 0 — THE TOWN ON THE DANUBE, WINTER 1619 (world x 0–400)
// ══════════════════════════════════════════════════════════════════════════════

/** A sky in flat bands, lightest at the horizon. */
function sky(x, y0, w, h, bands) {
  const out = [];
  const cut = [0, 0.3, 0.55, 0.78, 1];
  for (let k = 0; k < 4; k++) out.push(box(x, y0 + h * cut[k], w, h * (cut[k + 1] - cut[k]) + 0.3, bands[k]));
  return out.join('');
}

/** FAR: the overcast sky, white hills with firs, the far bank's spires hazed, the Danube with ice. */
export function townFar() {
  const o = [];
  o.push(sky(0, 214, 400, 160, SKY));
  // a low cloud bank
  o.push(flat('M0,262 C40,254 80,258 120,252 C170,246 210,256 260,250 C310,244 360,252 400,248 L400,270 L0,270 Z', '#CBD3D3', 0.8));
  // white hills, their shaded flanks, dark firs on them
  o.push(fill('M-4,376 C30,350 70,340 112,346 C150,350 176,336 214,334 C254,332 280,346 318,342 C354,338 380,344 404,350 L404,384 L-4,384 Z', HILL, 0.6));
  o.push(flat('M112,346 C150,350 176,336 214,334 C200,346 176,360 150,372 L120,376 C126,364 124,352 112,346 Z', HILL_D));
  o.push(flat('M318,342 C354,338 380,344 404,350 L404,372 C380,360 356,352 330,350 Z', HILL_D));
  for (let k = 0; k < 26; k++) {
    const x = 6 + k * 15 + rnd(k) * 8;
    const y = 352 + rnd(k + 40) * 14;
    const h = 5 + rnd(k + 80) * 4;
    o.push(flat(`M${f2(x)},${f2(y - h)} L${f2(x + 2.4)},${f2(y)} L${f2(x - 2.4)},${f2(y)} Z`, FIR, 0.85));
  }
  // the far bank: a town hazed into the sky, two spires and a tower
  o.push(flat('M150,384 L150,372 L158,372 L158,366 L166,366 L166,374 L176,374 L176,360 L180,352 L184,360 L184,374 L198,374 L198,368 L210,368 L210,376 L232,376 L232,370 L240,364 L248,370 L248,378 L262,378 L262,384 Z', FAR_TOWN));
  o.push(flat('M180,352 L181,330 L182,352 Z', FAR_TOWN_D));
  o.push(flat('M240,364 L241,348 L242,364 Z', FAR_TOWN_D));
  o.push(box(150, 382, 112, 2, FAR_TOWN_D));
  // the Danube: grey-green water, ice along both banks, floes drifting
  o.push(box(0, 384, 400, 30, RIVER));
  o.push(box(0, 400, 400, 14, RIVER_D, 0.6));
  o.push(flat('M0,384 C60,386 120,385 180,386 C260,387 330,385 400,386 L400,390 C320,391 240,390 160,391 C90,391 40,390 0,390 Z', ICE));
  for (const [x, y, w] of [[30, 395, 22], [96, 402, 16], [160, 396, 26], [236, 405, 18], [300, 397, 24], [362, 404, 20], [210, 392, 12]]) {
    o.push(fill(`M${x},${y} L${x + w * 0.2},${y - 2} L${x + w},${y - 1.6} L${x + w * 0.9},${y + 1.4} L${x + w * 0.1},${y + 1.6} Z`, ICE, 0.4));
  }
  return o.join('');
}

/** A gabled house: plaster, timber framing, a steep snowy roof with a dark gable end. */
function house(x, base, w, h, roofH, wall, opts = {}) {
  const o = [];
  const top = base - h;
  o.push(rect(x, top, w, h, wall, 0.9));
  // the timber framing, the way Bavarian half-timbering reads: posts, a rail, braces
  if (opts.timber) {
    for (const px of [x + 2, x + w / 2 - 1, x + w - 4]) o.push(box(px, top, 2, h, TIMBER));
    o.push(box(x, top + h * 0.48, w, 2, TIMBER));
    o.push(line(`M${x + 3},${top + h * 0.48} L${x + w / 2 - 1},${top + 2} M${x + w - 3},${top + h * 0.48} L${x + w / 2 + 1},${top + 2}`, TIMBER, 1.4));
  }
  // the shaded side
  o.push(box(x + w * 0.62, top + 1, w * 0.38 - 0.5, h - 1.5, '#000', 0.08));
  // windows: two rows of small dark panes with snow on the sills
  const rows = opts.rows ?? 2;
  for (let r = 0; r < rows; r++) {
    const wy = top + 6 + r * (h - 10) / rows;
    for (let c = 0; c < (opts.cols ?? 2); c++) {
      const wx = x + 5 + c * (w - 14) / Math.max(1, (opts.cols ?? 2) - 1);
      o.push(rect(wx, wy, 5, 6, '#3E4A52', 0.5));
      o.push(box(wx - 0.5, wy + 6, 6, 1.2, SNOW));
    }
  }
  if (opts.door) o.push(rect(x + w / 2 - 3.5, base - 11, 7, 11, WOOD, 0.6));
  // the roof: tiles under thick snow, the gable end dark, an overhang of snow
  const peak = x + w / 2;
  o.push(fill(`M${x - 3},${top + 1} L${peak},${top - roofH} L${x + w + 3},${top + 1} Z`, SNOW, 0.9));
  o.push(flat(`M${peak},${top - roofH} L${x + w + 3},${top + 1} L${peak + 2},${top + 1} Z`, SNOW_D));
  o.push(flat(`M${x + 3},${top + 1} L${peak},${top - roofH + 6} L${x + w - 3},${top + 1} Z`, ROOF, 0.9));
  o.push(flat(`M${peak},${top - roofH + 6} L${x + w - 3},${top + 1} L${peak},${top + 1} Z`, ROOF_D));
  o.push(fill(`M${x + 6},${top + 1} L${peak},${top - roofH + 12} L${x + w - 6},${top + 1} Z`, wall, 0.5));
  o.push(rect(peak - 2, top - roofH + 18, 4, 5, '#3E4A52', 0.4));
  // icicles under the eaves
  for (let k = 0; k < 4; k++) o.push(flat(`M${x + 2 + k * (w / 4)},${top + 1} l1.2,${3 + (k % 2) * 2} l1.2,-${3 + (k % 2) * 2} Z`, '#E6EEF1'));
  return o.join('');
}

/** MIDDLE + NEAR: the army's winter camp, the town wall, the old town, the quarters, the street. */
export const QUARTERS_CHIMNEY = { x: 352, y: 300 };
export function townMid() {
  const o = [];
  // the near riverbank under snow
  o.push(fill('M-4,404 C60,400 140,402 220,398 C300,396 360,400 404,398 L404,514 L-4,514 Z', SNOW, 0.8));
  // the street: trodden snow, two cart ruts, the fence posts along its far side
  o.push(fill('M-4,476 C80,474 160,476 240,474 C300,473 360,474 404,474 L404,514 L-4,514 Z', SNOW, 0.6));
  o.push(flat('M-4,484 C120,482 260,483 404,481 L404,483 C260,485 120,485 -4,486 Z', SNOW_DD));
  o.push(flat('M-4,500 C120,498 260,499 404,497 L404,499.4 C260,501.4 120,501 -4,502.4 Z', SNOW_DD));
  o.push(flat('M-4,506 C120,505 260,506 404,505 L404,514 L-4,514 Z', SNOW_D));
  // the town wall: grey stone, a gate tower, snow along its walk
  o.push(rect(120, 372, 284, 30, STONE, 0.8));
  for (let x = 124; x < 404; x += 9) o.push(box(x, 380 + ((x / 9) % 2) * 9, 6, 1, STONE_D));
  o.push(box(120, 370, 284, 3, SNOW));
  o.push(rect(132, 344, 24, 58, STONE, 0.9));
  o.push(fill('M129,346 L144,326 L159,346 Z', ROOF, 0.8));
  o.push(fill('M129,346 L144,326 L146,330 L134,346 Z', SNOW, 0));
  o.push(fill('M139,402 L139,388 C139,382 149,382 149,388 L149,402 Z', '#3A3430', 0.6));
  // the back row of the old town: gables over the wall, packed close
  for (const [hx, hw, hh, rh, c] of [[262, 24, 18, 20, 3], [300, 26, 22, 22, 1], [330, 22, 16, 18, 2], [354, 26, 20, 24, 0], [380, 24, 18, 20, 3]]) {
    o.push(house(hx, 372, hw, hh, rh, PLASTER[c], { cols: 2, rows: 1 }));
  }
  // the church: white walls, a tower with an onion dome (copper, a cap of snow), a cross
  o.push(rect(200, 352, 52, 46, '#EDEAE0', 0.9));
  o.push(fill('M196,353 L226,334 L256,353 Z', SNOW, 0.9));
  o.push(flat('M226,334 L256,353 L228,353 Z', SNOW_D));
  o.push(rect(178, 306, 22, 92, '#E9E5DA', 0.9));
  o.push(box(192, 307, 7, 90, '#000', 0.07));
  o.push(rect(184, 318, 10, 13, '#4A4F55', 0.6));
  o.push(fill('M184,318 C184,312 194,312 194,318 Z', '#4A4F55', 0.5));
  o.push(fill('M176,306 C172,296 182,288 189,282 C196,288 206,296 202,306 Z', COPPER, 0.9));
  o.push(flat('M189,282 C196,288 206,296 202,306 L190,306 C194,298 194,290 189,282 Z', COPPER_D));
  o.push(fill('M181,293 C184,288 186,286 189,282 C192,286 194,288 197,293 C192,291 186,291 181,293 Z', SNOW, 0.5));
  o.push(rect(187, 270, 4, 12, COPPER_D, 0.5));
  o.push(fill('M185.5,280 C185.5,275 192.5,275 192.5,280 Z', COPPER, 0.4));
  o.push(line('M189,270 L189,258 M185,262 L193,262', '#4E4A40', 1.4));
  for (const wx of [210, 226, 240]) o.push(fill(`M${wx},372 L${wx},362 C${wx},358 ${wx + 6},358 ${wx + 6},362 L${wx + 6},372 Z`, '#4A4F55', 0.5));
  // the old town packed inside the wall: gables at every height
  o.push(house(256, 398, 30, 34, 26, PLASTER[1], { timber: true, cols: 2 }));
  o.push(house(160, 398, 22, 28, 20, PLASTER[2], { cols: 1 }));
  // THE QUARTERS: a tall half-timbered house at the right, its chimney smoking
  o.push(rect(QUARTERS_CHIMNEY.x - 4, 282, 9, 24, '#9A5A44', 0.8));
  o.push(box(QUARTERS_CHIMNEY.x - 5, 280, 11, 3, SNOW));
  o.push(house(290, 470, 106, 112, 52, PLASTER[0], { timber: true, cols: 3, rows: 3, door: true }));
  o.push(fill('M336,470 L336,452 C336,444 350,444 350,452 L350,470 Z', WOOD_D, 0.8));
  o.push(box(342, 452, 1.2, 18, WOOD));
  o.push(rect(330, 470, 26, 3, STONE, 0.6));
  // a hanging sign over the door: a pot (an inn as well as a house)
  o.push(line('M360,438 L374,438 M367,438 L367,442', '#3A3634', 1.2));
  o.push(rect(361, 442, 12, 9, '#C9A060', 0.6));
  o.push(fill('M364,446 C364,444 370,444 370,446 L369,449 L365,449 Z', '#5A4A40', 0.3));
  // THE CAMP at the left, outside the wall: two ridge tents under snow, a cannon, a fence
  for (const [tx, tw, th] of [[2, 62, 52], [58, 54, 46]]) {
    const ty = 474;
    o.push(fill(`M${tx},${ty} L${tx + tw * 0.5},${ty - th} L${tx + tw},${ty} Z`, CANVAS, 0.9));
    o.push(flat(`M${tx + tw * 0.5},${ty - th} L${tx + tw},${ty} L${tx + tw * 0.56},${ty} Z`, CANVAS_D));
    o.push(fill(`M${tx + tw * 0.5 - 6},${ty} L${tx + tw * 0.5},${ty - th * 0.45} L${tx + tw * 0.5 + 6},${ty} Z`, '#4A3F34', 0.6));
    o.push(fill(`M${tx + tw * 0.22},${ty - th * 0.44} L${tx + tw * 0.5},${ty - th} L${tx + tw * 0.78},${ty - th * 0.44} L${tx + tw * 0.62},${ty - th * 0.5} L${tx + tw * 0.5},${ty - th + 7} L${tx + tw * 0.38},${ty - th * 0.5} Z`, SNOW, 0.5));
    o.push(line(`M${tx + tw * 0.5},${ty - th} L${tx + tw * 0.5},${ty - th - 6}`, WOOD_D, 1.6));
    o.push(line(`M${tx + 2},${ty} L${tx - 6},${ty + 6} M${tx + tw - 2},${ty} L${tx + tw + 6},${ty + 6}`, '#8A7A60', 0.6));
  }
  // the banner pole (the flag is its own picture, so it can stir)
  o.push(rect(84, 380, 2.6, 94, WOOD_D, 0.6));
  o.push(circ(85.3, 379, 2, '#C9A23A', 0.4));
  // the cannon on its carriage, its barrel and wheels under snow
  o.push(fill('M104,480 L150,472 L152,478 L108,488 Z', WOOD, 0.8));
  o.push(fill('M112,474 L162,466 C164,466 165,470 163,471 L114,481 C110,481 110,475 112,474 Z', BRONZE, 0.8));
  o.push(flat('M113,478 L163,470 L163,471 L114,481 Z', BRONZE_D));
  o.push(circ(162.5, 468.5, 2.2, '#2A2420', 0.4));
  o.push(fill('M114,474 C126,470 150,466 162,465 C150,463 126,467 114,472 Z', SNOW, 0.3));
  o.push(circ(122, 486, 11, '#5E4026', 1));
  o.push(circ(122, 486, 8, 'none', 0.6));
  for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; o.push(line(`M122,486 L${f2(122 + 8 * Math.cos(a))},${f2(486 + 8 * Math.sin(a))}`, WOOD_D, 1.1)); }
  o.push(circ(122, 486, 2.2, '#3A3634', 0.4));
  o.push(fill('M112,476 C116,472 128,472 133,476 C128,475 116,475 112,477 Z', SNOW, 0.3));
  // a drift of snow round the camp, a stack of shot
  for (const [x, y] of [[150, 494], [156, 494], [153, 489.5]]) o.push(circ(x, y, 3, '#3E3C3A', 0.4));
  for (let x = 168; x < 290; x += 17) {
    o.push(rect(x, 456, 3, 20, WOOD, 0.6));
    o.push(box(x - 0.5, 455, 4, 2, SNOW));
  }
  o.push(line('M168,462 L290,462 M168,470 L290,470', WOOD_L, 1.2));
  // a bare tree by the wall, its twigs fine against the sky
  o.push(fill('M246,474 C246,440 244,420 246,398 L250,398 C250,420 252,440 252,474 Z', '#4A3A30', 0.6));
  o.push(line('M248,410 C238,398 230,392 222,386 M248,404 C258,392 264,384 272,378 M247,398 C244,386 242,378 240,370 M250,398 C252,386 256,378 260,372 M230,392 L226,380 M264,384 L270,372 M240,378 L232,372', '#4A3A30', 1.1));
  // NEAR: a woodpile under a lean-to by the quarters, drifts along the foot of the picture
  o.push(rect(250, 486, 34, 14, '#7A5634', 0.8));
  for (let k = 0; k < 6; k++) o.push(ell(254 + (k % 3) * 11, 490 + Math.floor(k / 3) * 6, 3.4, 2.6, '#D8B07A', 0.5));
  o.push(fill('M246,487 C256,480 278,480 288,487 Z', SNOW, 0.6));
  o.push(fill('M-4,514 C20,504 50,502 80,510 C100,514 110,514 120,514 Z', SNOW_D, 0.5));
  o.push(fill('M300,514 C330,506 370,504 404,508 L404,514 Z', SNOW_D, 0.5));
  return o.join('');
}

/** The Bavarian banner: white and blue lozenges on a cloth, its top edge on the pole (own frame: the hoist at x 0). */
export function banner() {
  const o = [];
  o.push(fill('M0,0 L30,1 C30,8 30,14 31,20 L0,20 Z', WHITE, 0.8));
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 5; c++) {
      const cx = 3 + c * 6 + (r % 2) * 3;
      const cy = 2.5 + r * 5;
      if (cx > 30) continue;
      o.push(flat(`M${cx},${cy - 2.5} L${cx + 3},${cy} L${cx},${cy + 2.5} L${cx - 3},${cy} Z`, BLUE));
    }
  }
  o.push(fill('M0,0 L30,1 C30,8 30,14 31,20 L0,20 Z', 'none', 0.8));
  return o.join('');
}

// ══════════════════════════════════════════════════════════════════════════════
// PLACES 1, 2 — THE STOVE-HEATED ROOM (its own x 0–400; laid at world x 400–800)
// ══════════════════════════════════════════════════════════════════════════════

/** Where things are in the room (its own x). */
export const ROOM = {
  door: { x0: 8, x1: 56, top: 336 },
  win: { x0: 70, x1: 150, top: 318, sill: 412 },
  cot: { x0: 66, x1: 170, top: 482 },
  stove: { x0: 320, x1: 396, top: 286, fire: { x0: 344, x1: 376, top: 444, bot: 474 } },
};
const DAY = {
  wall: '#ECE6D6', wallD: '#D9D0BA', beam: '#4E3A2A', ceil: '#6B5240', ceilD: '#5A4434',
  wood: '#7A5A3C', woodD: '#5E4430', woodL: '#94714C', floor: '#A27C54', floorD: '#8A6644', floorLine: '#765638',
  niche: '#F4EFE3', nicheD: '#DCD3C0', lead: '#3C3A38',
  sky: '#D2D9D9', roofSnow: '#F4F6F6', roofSnowD: '#D3DCE0', roofDark: '#6E5446', townWall: '#C9C0AE',
  tile: '#2F6B4A', tileL: '#3F8A60', tileD: '#1F4A33', glaze: '#86C49A', iron: '#2E2A28', ironL: '#4A4440',
  doorway: '#2A2420', straw: '#D4BF86', strawD: '#B8A26A', blanket: '#8E4A3A', blanketD: '#6E3628',
  lit: null,
};
const NIGHT = {
  wall: '#454C62', wallD: '#363C50', beam: '#1E1A1A', ceil: '#2A2428', ceilD: '#221D20',
  wood: '#3E3028', woodD: '#2E241E', woodL: '#4E3E32', floor: '#4E3E30', floorD: '#3E3026', floorLine: '#32261E',
  niche: '#4E566C', nicheD: '#3E4558', lead: '#1A1A1C',
  sky: '#22305A', roofSnow: '#C9D2E2', roofSnowD: '#A4AFC6', roofDark: '#1E2234', townWall: '#3A4058',
  tile: '#1F4A36', tileL: '#2C5E44', tileD: '#163828', glaze: '#4E7A5E', iron: '#1E1A18', ironL: '#2E2826',
  doorway: '#141214', straw: '#8A7A56', strawD: '#6E6044', blanket: '#5E3028', blanketD: '#46221C',
  lit: '#C98A4A',
};

/** The view through the window: the crooked old town, roofs at every angle, a leaning tower. */
function windowView(P) {
  const { x0, x1, top, sill } = ROOM.win;
  const o = [];
  o.push(box(x0, top, x1 - x0, sill - top, P.sky));
  // a leaning tower, crooked old roofs climbing over each other
  o.push(fill(`M${x0 + 50},${sill} L${x0 + 56},${top + 22} L${x0 + 66},${top + 24} L${x0 + 62},${sill} Z`, P.townWall, 0.7));
  o.push(fill(`M${x0 + 54},${top + 23} L${x0 + 62},${top + 8} L${x0 + 68},${top + 25} Z`, P.roofSnow, 0.6));
  const roofs = [[x0 - 4, 62, 30, 18, -10], [x0 + 18, 70, 28, 14, 8], [x0 + 40, 58, 26, 20, -6], [x0 + 60, 66, 30, 16, 12], [x0 + 6, 80, 34, 12, 4], [x0 + 38, 82, 36, 12, -8]];
  for (const [rx, ry, rw, rh, skew] of roofs) {
    const y = top + ry;
    o.push(fill(`M${rx},${y + rh} L${rx + rw * 0.5 + skew * 0.3},${y} L${rx + rw},${y + rh + skew * 0.2} L${rx + rw},${sill} L${rx},${sill} Z`, P.roofDark, 0.6));
    o.push(fill(`M${rx - 1},${y + rh + 1} L${rx + rw * 0.5 + skew * 0.3},${y - 1} L${rx + rw + 1},${y + rh + skew * 0.2 + 1} L${rx + rw * 0.6},${y + rh * 0.6} Z`, P.roofSnow, 0.4));
    if (P.lit) o.push(box(rx + rw * 0.3, y + rh + 4, 3, 4, '#E8C070'));
  }
  // the panes: a lattice of lead
  for (let x = x0 + 13.3; x < x1 - 1; x += 13.3) o.push(box(x - 0.6, top, 1.2, sill - top, P.lead));
  for (let y = top + 15.6; y < sill - 1; y += 15.6) o.push(box(x0, y - 0.6, x1 - x0, 1.2, P.lead));
  o.push(box(x0 + (x1 - x0) / 2 - 1.4, top, 2.8, sill - top, P.woodD));
  o.push(box(x0, top + (sill - top) * 0.5 - 1.4, x1 - x0, 2.8, P.woodD));
  return o.join('');
}

function room(P) {
  const o = [];
  const { door, win, cot, stove } = ROOM;
  // the whitewashed wall, its shaded corner on the right
  o.push(box(0, 214, 400, 300, P.wall));
  o.push(box(300, 244, 100, 220, P.wallD, 0.6));
  // the dark beamed ceiling: boards, then beam ends coming toward us
  o.push(box(0, 214, 400, 26, P.ceil));
  o.push(box(0, 236, 400, 4, P.ceilD));
  for (let x = 10; x < 400; x += 46) {
    o.push(rect(x, 230, 18, 16, P.beam, 0.8));
    o.push(box(x + 1, 243, 16, 2, P.ceilD));
  }
  o.push(rect(-2, 228, 404, 6, P.beam, 0.8));
  // a shelf on the wall with a jug and two plates, a crucifix by the door (a Catholic house)
  o.push(rect(196, 330, 92, 4, P.wood, 0.7));
  o.push(fill('M206,330 L206,318 C206,312 216,312 216,318 L216,330 Z', '#B9A07A', 0.6));
  o.push(fill('M214,320 C220,318 222,326 216,327', 'none', 0.6));
  for (const px of [234, 254, 270]) o.push(ell(px, 322, 7, 8, '#E2DCCB', 0.6));
  o.push(line('M70,288 L70,306 M64,293 L76,293', P.woodD, 2));
  // the wainscot and the wall bench round the room (the Stube's), low
  o.push(rect(-2, 452, 404, 34, P.wood, 0.8));
  for (let x = 30; x < 400; x += 44) o.push(box(x, 454, 1.4, 30, P.woodD));
  o.push(rect(-2, 450, 404, 5, P.woodL, 0.7));
  // the floor: broad boards running toward us
  o.push(box(0, 486, 400, 28, P.floor));
  o.push(box(0, 500, 400, 14, P.floorD, 0.5));
  for (const y of [491, 498, 506]) o.push(box(0, y, 400, 0.8, P.floorLine));
  for (let x = 20; x < 400; x += 53) o.push(box(x, 486, 0.8, 5, P.floorLine));
  for (let x = 44; x < 400; x += 61) o.push(box(x, 498, 0.8, 8, P.floorLine));
  // THE DOORWAY at the left (the door itself is its own picture, so it can swing)
  o.push(rect(door.x0 - 3, door.top - 4, door.x1 - door.x0 + 6, 500 - door.top + 4, P.woodD, 0.9));
  o.push(box(door.x0, door.top, door.x1 - door.x0, 500 - door.top, P.doorway));
  // THE WINDOW in its deep niche: a plaster reveal, a sill, the leaded panes
  o.push(fill(`M${win.x0 - 12},${win.sill + 10} L${win.x0 - 12},${win.top - 10} L${win.x1 + 12},${win.top - 10} L${win.x1 + 12},${win.sill + 10} Z`, P.niche, 0.8));
  o.push(flat(`M${win.x0 - 12},${win.top - 10} L${win.x0},${win.top} L${win.x0},${win.sill} L${win.x0 - 12},${win.sill + 10} Z`, P.nicheD));
  o.push(flat(`M${win.x0 - 12},${win.top - 10} L${win.x1 + 12},${win.top - 10} L${win.x1},${win.top} L${win.x0},${win.top} Z`, P.nicheD, 0.6));
  o.push(windowView(P));
  o.push(rect(win.x0 - 2, win.top - 2, win.x1 - win.x0 + 4, win.sill - win.top + 4, 'none', 1.6));
  o.push(rect(win.x0 - 14, win.sill + 1, win.x1 - win.x0 + 28, 6, P.woodL, 0.8));
  // THE COT under the window: a low wooden frame, a straw mattress, a folded blanket
  o.push(rect(cot.x0, cot.top + 4, cot.x1 - cot.x0, 10, P.wood, 0.9));
  for (const lx of [cot.x0 + 2, cot.x1 - 6]) o.push(rect(lx, cot.top + 12, 4, 500 - cot.top - 12, P.woodD, 0.6));
  o.push(fill(`M${cot.x0 + 2},${cot.top + 5} C${cot.x0 + 2},${cot.top - 1} ${cot.x1 - 2},${cot.top - 1} ${cot.x1 - 2},${cot.top + 5} Z`, P.straw, 0.8));
  o.push(rect(cot.x0 + 4, cot.top - 3, 18, 7, '#E8E2D2', 0.6));
  o.push(rect(cot.x1 - 34, cot.top - 2, 30, 6, P.blanket, 0.7));
  o.push(box(cot.x1 - 34, cot.top + 1.5, 30, 2.4, P.blanketD));
  // THE STOVE: a tower of green glazed tiles on a stone foot, a moulded cornice, an iron fire door
  const sx0 = stove.x0, sx1 = stove.x1;
  o.push(rect(sx0 - 2, 476, sx1 - sx0 + 4, 24, '#9E9686', 0.9));
  o.push(rect(sx0 - 6, stove.top - 10, sx1 - sx0 + 12, 8, P.tileD, 1));
  o.push(rect(sx0 - 3, stove.top - 3, sx1 - sx0 + 6, 5, P.tile, 0.8));
  o.push(rect(sx0 - 8, 334, sx1 - sx0 + 16, 6, P.tileD, 0.9));
  o.push(rect(sx0 - 4, 438, sx1 - sx0 + 8, 6, P.tileD, 0.9));
  const tileRow = (y0, y1, x0, x1, n) => {
    const tw = (x1 - x0) / n, th = 19;
    for (let y = y0; y < y1 - 2; y += th) {
      for (let c = 0; c < n; c++) {
        const tx = x0 + c * tw, h = Math.min(th, y1 - y);
        o.push(rect(tx + 0.4, y + 0.4, tw - 0.8, h - 0.8, P.tile, 0.7, 2));
        o.push(flat(`M${f2(tx + tw * 0.5)},${f2(y + 3)} C${f2(tx + tw - 3)},${f2(y + 3)} ${f2(tx + tw - 3)},${f2(y + h - 3)} ${f2(tx + tw * 0.5)},${f2(y + h - 3)} Z`, P.tileD));
        o.push(ell(tx + tw * 0.38, y + h * 0.4, tw * 0.18, h * 0.2, P.tileL, 0));
        o.push(dot(tx + tw * 0.3, y + h * 0.3, 1.3, P.glaze));
      }
    }
  };
  tileRow(stove.top + 2, 334, sx0 + 4, sx1 - 4, 3);
  tileRow(340, 438, sx0, sx1, 4);
  tileRow(444, 476, sx0, sx1, 4);
  // the fire door (closed here; the open one is its own picture)
  const fd = stove.fire;
  o.push(rect(fd.x0, fd.top, fd.x1 - fd.x0, fd.bot - fd.top, P.iron, 1, 1.5));
  o.push(rect(fd.x0 + 3, fd.top + 3, fd.x1 - fd.x0 - 6, fd.bot - fd.top - 6, P.ironL, 0.5, 1));
  o.push(rect(fd.x1 - 7, fd.top + 12, 4, 6, '#8C8070', 0.4));
  if (P.lit) {
    // by night the fire behind the door throws its light on the tiles and the floor, as flat shapes
    o.push(flat(`M${sx0 - 30},${514} L${sx0 + 8},${486} L${sx1 + 4},${486} L${sx1 + 20},${514} Z`, P.lit, 0.35));
    o.push(flat(`M${fd.x0 - 6},${fd.bot} L${fd.x0 - 2},${fd.top - 10} L${fd.x1 + 2},${fd.top - 10} L${fd.x1 + 6},${fd.bot} Z`, P.lit, 0.25));
  }
  return o.join('');
}
export const roomDay = () => room(DAY);
export const roomNight = () => room(NIGHT);

/** Frost round the edge of the panes, ferns growing in from the frame (the window's own region). */
function frostFerns(seed, cx, cy, span, n) {
  const o = [];
  for (let k = 0; k < n; k++) {
    const a = rnd(seed + k) * Math.PI * 2;
    const x = cx + Math.cos(a) * span * rnd(seed + k + 9);
    const y = cy + Math.sin(a) * span * 0.8 * rnd(seed + k + 19);
    const len = 6 + rnd(seed + k + 29) * 8;
    const b = a + Math.PI;
    const ex = x + Math.cos(b) * len, ey = y + Math.sin(b) * len;
    o.push(line(`M${f2(x)},${f2(y)} L${f2(ex)},${f2(ey)}`, '#FFFFFF', 0.7));
    for (let s = 1; s < 4; s++) {
      const px = x + (ex - x) * s / 4, py = y + (ey - y) * s / 4;
      o.push(line(`M${f2(px)},${f2(py)} l${f2(Math.cos(b + 0.7) * 2.6)},${f2(Math.sin(b + 0.7) * 2.6)} M${f2(px)},${f2(py)} l${f2(Math.cos(b - 0.7) * 2.6)},${f2(Math.sin(b - 0.7) * 2.6)}`, '#FFFFFF', 0.5));
    }
  }
  return o.join('');
}
export function frostEdge() {
  const { x0, x1, top, sill } = ROOM.win;
  const o = [];
  const w = x1 - x0, h = sill - top;
  o.push(flat(`M${x0},${top} L${x1},${top} L${x1},${sill} L${x0},${sill} Z M${x0 + 10},${top + 9} C${x0 + w * 0.4},${top + 4} ${x1 - 8},${top + 12} ${x1 - 9},${top + h * 0.4} C${x1 - 6},${sill - 18} ${x1 - 20},${sill - 8} ${x0 + w * 0.5},${sill - 9} C${x0 + 14},${sill - 6} ${x0 + 6},${sill - 26} ${x0 + 8},${top + h * 0.45} C${x0 + 6},${top + 22} ${x0 + 8},${top + 12} ${x0 + 10},${top + 9} Z`, '#F2F6F8', 0.55));
  o.push(frostFerns(3, x0 + w / 2, top + h / 2, w * 0.62, 14));
  return o.join('');
}
export function frostPane() {
  const { x0, x1, top, sill } = ROOM.win;
  const w = x1 - x0, h = sill - top;
  return flat(`M${x0 + 8},${top + 8} L${x1 - 8},${top + 8} L${x1 - 8},${sill - 8} L${x0 + 8},${sill - 8} Z`, '#EEF3F6', 0.86)
    + frostFerns(51, x0 + w / 2, top + h / 2, w * 0.4, 14);
}

/** The plank door on its strap hinges, closed (its hinge at the LEFT edge, x 0 of its own frame). */
export function door() {
  const o = [];
  const w = ROOM.door.x1 - ROOM.door.x0, h = 500 - ROOM.door.top;
  o.push(rect(0, 0, w, h, '#7A5638', 1));
  for (let x = w / 4; x < w - 1; x += w / 4) o.push(box(x - 0.5, 1, 1, h - 2, '#5E4230'));
  o.push(box(w * 0.55, 2, w * 0.45 - 1, h - 3, '#000', 0.08));
  for (const y of [22, h - 30]) o.push(rect(-1, y, w * 0.8, 4, '#3A3634', 0.5, 1));
  o.push(circ(w - 8, h * 0.52, 2.4, '#3A3634', 0.5));
  o.push(rect(w - 10, h * 0.52 + 3, 3, 8, '#3A3634', 0.4));
  return o.join('');
}

/** The open fire door: the firebox mouth with the logs burning in it (the stove's fire region). */
export function stoveOpen() {
  const { x0, x1, top, bot } = ROOM.stove.fire;
  const o = [];
  o.push(rect(x0, top, x1 - x0, bot - top, '#1A1412', 1, 1.5));
  o.push(fill(`M${x0 + 3},${bot - 3} L${x0 + 8},${bot - 8} L${x1 - 6},${bot - 9} L${x1 - 3},${bot - 3} Z`, '#5A3A26', 0.5));
  o.push(fill(`M${x0 + 5},${bot - 4} C${x0 + 6},${top + 12} ${x0 + 12},${top + 8} ${x0 + 14},${bot - 12} C${x0 + 16},${top + 4} ${x1 - 10},${top + 8} ${x1 - 8},${bot - 10} C${x1 - 6},${top + 12} ${x1 - 3},${bot - 10} ${x1 - 4},${bot - 4} Z`, '#E9822E', 0.4));
  o.push(fill(`M${x0 + 9},${bot - 5} C${x0 + 10},${top + 16} ${x0 + 16},${top + 14} ${x0 + 17},${bot - 10} C${x0 + 20},${top + 14} ${x1 - 10},${top + 16} ${x1 - 9},${bot - 5} Z`, '#F6C35A', 0));
  // the door, swung back flat against the tiles on its hinge
  o.push(rect(x1 + 1, top, 7, bot - top, '#2E2A28', 0.8));
  return o.join('');
}

// ── props, each in its own frame (standing on y 0 unless said) ─────────────────

/** A low oak table, its top at y −34 (hip high), 104 wide. */
export function table() {
  const o = [];
  for (const x of [-48, 42]) o.push(rect(x, -32, 6, 32, '#6E4A2C', 0.8));
  o.push(rect(-44, -24, 88, 4, '#6E4A2C', 0.6));
  o.push(rect(-52, -36, 104, 5, '#B4855A', 1));
  o.push(rect(-51, -31.6, 102, 3, '#8E6238', 0.7));
  for (const x of [-30, -6, 20]) o.push(box(x, -35.4, 0.8, 3.6, '#8E6238'));
  return o.join('');
}
/** A three-legged stool, its seat at y −22. */
export function stool() {
  const o = [];
  o.push(line('M-7,-20 L-11,0 M7,-20 L11,0 M0,-20 L1,0', '#5E4430', 2.4));
  o.push(rect(-11, -24, 22, 4.5, '#9A6E44', 0.9, 2));
  return o.join('');
}
/** A wicker log basket heaped with split logs. */
export function bin() {
  const o = [];
  o.push(fill('M-15,-22 L15,-22 L13,0 L-13,0 Z', '#B08A50', 1));
  for (let y = -18; y < 0; y += 4) o.push(line(`M${-14 + (y + 22) * 0.08},${y} L${14 - (y + 22) * 0.08},${y}`, '#8A6A38', 0.8));
  for (let x = -10; x < 14; x += 5) o.push(line(`M${x},-22 L${x * 0.9},0`, '#8A6A38', 0.6));
  for (const [x, y] of [[-8, -24], [0, -26], [8, -24], [-4, -29], [5, -30]]) {
    o.push(fill(`M${x - 6},${y - 3} L${x + 4},${y - 3.5} C${x + 6},${y - 3.5} ${x + 6},${y + 2.5} ${x + 4},${y + 2.5} L${x - 6},${y + 3} Z`, '#7A5634', 0.6));
    o.push(ell(x + 4.4, y - 0.5, 1.8, 3, '#D8B07A', 0.5));
  }
  return o.join('');
}
/** A bundle of split logs tied with a rope (centred). */
export function logs() {
  const o = [];
  for (const [x, y] of [[0, 4], [-1, -1], [1, -6], [-2, 9]]) {
    o.push(fill(`M${x - 14},${y - 2.6} L${x + 12},${y - 3} C${x + 14},${y - 3} ${x + 14},${y + 2.6} ${x + 12},${y + 2.6} L${x - 14},${y + 2.6} Z`, '#7A5634', 0.6));
    o.push(ell(x + 12.5, y - 0.2, 1.6, 2.6, '#D8B07A', 0.4));
  }
  o.push(line('M-6,-9 L-6,12 M5,-9 L5,12', '#A88A5E', 1.6));
  return o.join('');
}
/** One split log (centred). */
export function log() {
  return fill('M-10,-2.6 L8,-3 C10,-3 10,2.6 8,2.6 L-10,2.6 Z', '#7A5634', 0.6) + ell(8.6, -0.2, 1.5, 2.6, '#D8B07A', 0.4);
}
/** A round wicker basket (empty; the apples are drawn by the scene), its rim at y −16. */
export function basket() {
  const o = [];
  o.push(fill('M-15,-16 C-15,-4 -10,0 0,0 C10,0 15,-4 15,-16 Z', '#C29A5A', 1));
  for (let y = -12; y < 0; y += 3.4) o.push(line(`M${-14 + (y + 16) * 0.2},${y} C-5,${y + 2.2} 5,${y + 2.2} ${14 - (y + 16) * 0.2},${y}`, '#956E38', 0.7));
  o.push(ell(0, -16, 15, 3, '#A88048', 0.9));
  o.push(ell(0, -16, 12, 1.8, '#5E4228', 0));
  o.push(line('M-13,-17 C-12,-30 12,-30 13,-17', '#8A6234', 2));
  return o.join('');
}
/** A soldier's leather knapsack, flap down, on the floor. */
export function pack() {
  const o = [];
  o.push(rect(-12, -18, 24, 18, '#7A5432', 1, 3));
  o.push(fill('M-12,-15 L12,-15 L12,-6 C6,-3 -6,-3 -12,-6 Z', '#946A40', 0.8));
  o.push(rect(-2, -7, 4, 4, '#C9A23A', 0.4));
  return o.join('');
}
/** The dream's table: a lighter table, a fat dictionary, the book of poems lying open. */
export function dreamTable() {
  const o = [];
  for (const x of [-48, 42]) o.push(rect(x, -32, 6, 32, '#8A9CC0', 0.8));
  o.push(rect(-52, -36, 104, 5, '#B8C6E2', 1));
  o.push(rect(-51, -31.6, 102, 3, '#93A4C8', 0.7));
  // the dictionary: fat, closed, its spine banded
  o.push(rect(14, -52, 30, 16, '#7A2E2A', 1, 1.5));
  o.push(rect(15, -51, 28, 4, '#EDE3C8', 0.4));
  for (const x of [20, 30]) o.push(box(x, -52, 1.6, 16, '#C9A23A'));
  // the book of poems, open, its leaves falling from the gutter
  o.push(fill('M-34,-37 C-26,-42 -16,-42 -12,-39 C-8,-42 2,-42 10,-37 L10,-36 L-34,-36 Z', '#F1E8D0', 0.9));
  o.push(line('M-12,-39 L-12,-36', '#8A7A60', 0.8));
  for (const y of [-39.4, -38.2]) o.push(line(`M-30,${y} L-15,${y} M-9,${y} L6,${y}`, '#9A8E74', 0.5));
  o.push(rect(-35, -37, 46, 1.6, '#3E5E8A', 0.4));
  return o.join('');
}
/** A brass candlestick, its flame drawn by the scene at y −20. */
export function candle() {
  const o = [];
  o.push(ell(0, -1.5, 6, 2, '#B8903A', 0.7));
  o.push(rect(-1.6, -9, 3.2, 8, '#B8903A', 0.6));
  o.push(ell(0, -9, 3.6, 1.2, '#B8903A', 0.5));
  o.push(rect(-1.8, -17, 3.6, 8, '#F2EAD4', 0.6));
  o.push(line('M0,-17 L0,-19', '#2A2420', 0.6));
  return o.join('');
}
/** A tin lantern with a horn window, held by its ring (the ring at y 0). */
export function lantern() {
  const o = [];
  o.push(ell(0, 1.5, 3, 2, 'none', 0.9));
  o.push(fill('M-6,4 L6,4 L4,7 L-4,7 Z', '#6A6460', 0.6));
  o.push(rect(-5, 7, 10, 13, '#E9C978', 0.8, 1));
  o.push(line('M-2,7 L-2,20 M2,7 L2,20', '#6A6460', 0.8));
  o.push(rect(-6, 20, 12, 2.6, '#6A6460', 0.6));
  return o.join('');
}

const at = (name, fn, view, box2 = view) => ({ name: `descartes1-${name}`, svg: fn, view, box: box2 });
const FULL = { x: 0, y: 214, w: 400, h: 300 };
const ROOMBOX = { x: 400, y: 214, w: 400, h: 300 };
const winView = { x: ROOM.win.x0, y: ROOM.win.top, w: ROOM.win.x1 - ROOM.win.x0, h: ROOM.win.sill - ROOM.win.top };
const fireView = { x: ROOM.stove.fire.x0 - 1, y: ROOM.stove.fire.top - 1, w: ROOM.stove.fire.x1 - ROOM.stove.fire.x0 + 10, h: ROOM.stove.fire.bot - ROOM.stove.fire.top + 2 };
export const ART = [
  at('town-far', townFar, FULL),
  at('town-mid', townMid, FULL),
  at('banner', banner, { x: -1, y: -1, w: 33, h: 22 }),
  at('room', roomDay, FULL, ROOMBOX),
  at('room-night', roomNight, FULL, ROOMBOX),
  at('frost', frostEdge, winView, { ...winView, x: winView.x + 400 }),
  at('frost-pane', frostPane, winView, { ...winView, x: winView.x + 400 }),
  at('door', door, { x: -2, y: -1, w: ROOM.door.x1 - ROOM.door.x0 + 3, h: 500 - ROOM.door.top + 2 }),
  at('stove-open', stoveOpen, fireView, { ...fireView, x: fireView.x + 400 }),
  at('table', table, { x: -53, y: -37, w: 106, h: 38 }),
  at('stool', stool, { x: -12, y: -25, w: 24, h: 26 }),
  at('bin', bin, { x: -16, y: -34, w: 32, h: 35 }),
  at('logs', logs, { x: -17, y: -12, w: 33, h: 25 }),
  at('log', log, { x: -11, y: -4, w: 22, h: 8 }),
  at('basket', basket, { x: -16, y: -31, w: 32, h: 32 }),
  at('pack', pack, { x: -13, y: -19, w: 26, h: 20 }),
  at('dream-table', dreamTable, { x: -53, y: -53, w: 106, h: 54 }),
  at('candle', candle, { x: -7, y: -20, w: 14, h: 21 }),
  at('lantern', lantern, { x: -7, y: -1, w: 14, h: 24 }),
];
