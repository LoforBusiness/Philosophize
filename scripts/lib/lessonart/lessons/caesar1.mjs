// history-caesar-1 — "Caesar and the Pirates" (LESSON_RULES AW5, AM13): a Roman merchant
// ship on the Aegean, the pirates' island cove by day, and the same cove by night.
//
// Every picture is in SCENE units with the band [214, 514], 400 × 300. Flat fills lit from
// the top left, a darker shaded side, one dark outline; real colours, no gradients, no glows.
//
// REFERENCES (npm run ref, scratchpad/ref/c1*):
//   c1tor-1   "Periplus 210 Merchant Ship" (woodcut): a round-bellied hull of long strakes,
//             high curled posts at both ends, ONE mast amidships with a broad square sail on
//             a yard, the sail crossed by a grid of reinforcing bands, a steering oar aft.
//   c1tor-2   Torlonia relief (a corbita in harbour): the swan's-neck stern post curling
//             forward over the deck, the yard hung from the masthead by halyards.
//   c1bireme-2 "Greek bireme, about 500 BC" (vase painting): a long low black hull, the ram
//             at the waterline at the bow, a raised fighting deck with rowers' heads along
//             it, a dark square sail on a yard that bows down at its ends, the stern rising.
//   c1chest-1/2 Wellcome iron-bound chests: a box of dark wood held by iron straps riveted
//             along their length, a hasp and lock plate in the middle of the front.
//   c1ring-1/2 Roman signet rings: a thick gold hoop swelling to a flat oval bezel.
//   c1cove-1  a rocky Adriatic shore at dusk: pale cliffs and walls, the sea glassy, the
//             mountains behind it hazed flat into one blue.

const OUT = '#2E2219';
const f2 = (n) => Number(n.toFixed(2));
const P = (pts) => 'M' + pts.map(([x, y]) => `${f2(x)},${f2(y)}`).join(' L') + ' Z';
const fill = (d, c, w = 1) => `<path d="${d}" fill="${c}" stroke="${OUT}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"/>`;
const flat = (d, c, o = 1) => `<path d="${d}" fill="${c}"${o < 1 ? ` opacity="${o}"` : ''}/>`;
const rect = (x, y, w, h, c, lw = 1, r = 0) => `<rect x="${f2(x)}" y="${f2(y)}" width="${f2(w)}" height="${f2(h)}" rx="${r}" fill="${c}" stroke="${OUT}" stroke-width="${lw}" stroke-linejoin="round"/>`;
const box = (x, y, w, h, c, o = 1) => `<rect x="${f2(x)}" y="${f2(y)}" width="${f2(w)}" height="${f2(h)}" fill="${c}"${o < 1 ? ` opacity="${o}"` : ''}/>`;
const line = (d, c, w) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const circ = (x, y, r, c, lw = 0.8) => `<circle cx="${f2(x)}" cy="${f2(y)}" r="${f2(r)}" fill="${c}" stroke="${OUT}" stroke-width="${lw}"/>`;
const ell = (x, y, rx, ry, c, lw = 0.8) => `<ellipse cx="${f2(x)}" cy="${f2(y)}" rx="${f2(rx)}" ry="${f2(ry)}" fill="${c}" stroke="${OUT}" stroke-width="${lw}"/>`;
const dot = (x, y, r, c, o = 1) => `<circle cx="${f2(x)}" cy="${f2(y)}" r="${f2(r)}" fill="${c}"${o < 1 ? ` opacity="${o}"` : ''}/>`;

// ── palette ──────────────────────────────────────────────────────────────────
const SKY = ['#74B1E0', '#8CC0E7', '#A6CFEB', '#C4DFEE'];
const SEA = '#3E8DBF', SEA_D = '#2D6F9E', SEA_L = '#68ACD3', SEA_FAR = '#5A9CC6', FOAM = '#E4F3F9';
const ISLE = '#8E9C6A', ISLE_D = '#73814F', ISLE_ROCK = '#C8B38A', HAZE = '#9FB6C6', HAZE_D = '#8CA6B8';
const WOOD = '#9A6638', WOOD_D = '#734A27', WOOD_DD = '#5A381D', WOOD_L = '#B98451';
const DECK = '#C9A06A', DECK_D = '#AD8552', DECK_L = '#DDB67F', DECK_LINE = '#94703F';
const SAIL = '#EFE2C1', SAIL_D = '#D7C397', SAIL_BAND = '#C4AC7A';
const ROPE = '#A88A5E';
const TAR = '#3A2A22', TAR_L = '#54402F', TAR_D = '#271B15', PIRATE_RED = '#A6382B', PSAIL = '#93402F', PSAIL_D = '#6E2C22';
const IRON = '#4D4A46', IRON_L = '#6E6A64';
const CLAY = '#C57A48', CLAY_D = '#A35E33';
const CREAM = '#F3E7C9', BRONZE = '#B9853C';

// ══════════════════════════════════════════════════════════════════════════════
// PLACE 0 — THE MERCHANT SHIP AT SEA (world x 0–400)
// ══════════════════════════════════════════════════════════════════════════════

/** A sky in flat bands, lightest at the horizon. */
function sky(x, y0, w, h, bands = SKY) {
  const out = [];
  const cut = [0, 0.28, 0.52, 0.74, 1];
  for (let k = 0; k < 4; k++) out.push(box(x, y0 + h * cut[k], w, h * (cut[k + 1] - cut[k]) + 0.3, bands[k]));
  return out.join('');
}

/** FAR: the morning sky, the open Aegean, Pharmacusa on the horizon, a far headland. */
export function seaFar() {
  const o = [];
  o.push(sky(0, 214, 400, 166));
  // a far headland on the left, hazed into one blue
  o.push(flat('M-4,382 C14,370 36,362 62,364 C84,366 100,374 116,382 Z', HAZE));
  o.push(flat('M62,364 C84,366 100,374 116,382 L78,382 C76,374 70,368 62,364 Z', HAZE_D));
  // Pharmacusa: a rocky island, its cliffs pale, scrub on its back
  o.push(fill('M262,382 C270,370 284,352 300,344 C312,338 322,340 334,348 C346,356 356,368 372,376 C380,379 388,380 394,382 Z', ISLE, 0.7));
  o.push(flat('M318,341 C330,346 342,356 352,366 C362,372 378,378 394,382 L338,382 C340,370 332,354 318,341 Z', ISLE_D));
  o.push(fill('M286,382 L290,370 C294,364 300,362 306,364 L312,374 L316,382 Z', ISLE_ROCK, 0.5));
  o.push(flat('M300,363 L306,364 L312,374 L316,382 L306,382 C306,374 304,368 300,363 Z', '#B09B73'));
  // the sea to the horizon, darker toward us
  o.push(box(0, 380, 400, 22, SEA_FAR));
  o.push(box(0, 380, 400, 3, '#86B9D8'));
  o.push(box(0, 402, 400, 112, SEA));
  o.push(box(0, 440, 400, 74, SEA_D, 0.5));
  for (const [x, y, w] of [[20, 392, 22], [130, 396, 30], [214, 390, 18], [360, 394, 26], [60, 410, 34], [176, 414, 26], [292, 408, 30],
    [12, 426, 40], [140, 430, 36], [250, 424, 44], [348, 432, 38]]) o.push(box(x, y, w, 1.4, '#9CCAE3'));
  return o.join('');
}

/** A gull gliding, wings spread, facing right. */
export function gull() {
  return fill('M-12,1 C-8,-4 -4,-3 0,1 C4,-3 8,-4 12,1 C8,-1 4,0 1,3 L-1,3 C-4,0 -8,-1 -12,1 Z', '#F5F3EE', 0.6)
    + flat('M8.4,-3 C10,-2.4 11.2,-0.8 12,1 C11,-0.4 9.6,-1.2 8.4,-1.4 Z', '#4A4A4A')
    + flat('M-8.4,-3 C-10,-2.4 -11.2,-0.8 -12,1 C-11,-0.4 -9.6,-1.2 -8.4,-1.4 Z', '#4A4A4A')
    + ell(1.4, 2, 2.8, 1.6, '#F5F3EE', 0.5)
    + fill('M4,1.6 L6,2.2 L4,2.8 Z', '#D8A548', 0.3);
}

/**
 * THE PIRATE GALLEY at its berth alongside (scene units; the scene slides it in from the
 * right). A long low tarred hull, the bronze ram at the waterline under the bow (left), a
 * red stripe along the oar ports, a raised deck rail at 432 (the pirates stand on it), the
 * stern sweeping up into a curl on the right, a dark sail on a yard that bows at its ends.
 */
export function galley() {
  const o = [];
  // the mast and the yard, the sail hung from it, bellied
  o.push(rect(334, 252, 5, 182, WOOD_D, 0.8));
  o.push(fill('M262,262 C290,254 384,254 410,262 L410,266 C384,259 290,259 262,266 Z', WOOD, 0.8));
  o.push(fill('M268,265 C296,258 378,258 404,265 C410,300 408,354 400,392 C370,404 302,404 276,392 C268,354 264,300 268,265 Z', PSAIL, 1));
  o.push(flat('M340,262 C378,260 398,262 404,265 C410,300 408,354 400,392 C380,400 360,402 340,402 Z', PSAIL_D));
  for (const x of [288, 312, 364, 388]) o.push(line(`M${x},262 C${x - 1},300 ${x - 2},350 ${x},398`, '#4E1C16', 0.6));
  for (const y of [300, 340, 374]) o.push(line(`M270,${y} C300,${y + 5} 380,${y + 5} 404,${y}`, '#4E1C16', 0.6));
  // the stays
  o.push(line('M336,252 L232,430 M337,252 L414,424', '#3A2A1E', 0.6));
  // the hull: the bow low on the left with its ram, the stern sweeping up on the right
  const hull = 'M222,446 L232,434 C260,430 360,428 396,424 C408,418 414,404 416,392 C418,384 424,380 428,384 C422,390 422,402 424,414 C426,432 418,452 404,462 C380,476 300,480 250,478 C236,476 226,468 222,462 L208,460 L208,452 L222,452 Z';
  o.push(fill(hull, TAR, 1.1));
  o.push(flat('M300,430 C340,428 380,426 396,424 C408,418 414,404 416,392 C418,388 420,386 422,386 C420,398 420,412 420,426 C416,446 408,458 396,466 C370,476 330,478 300,478 Z', TAR_D));
  // the deck rail the pirates stand on, and the red stripe along the oar ports
  o.push(fill('M226,432 C260,428 360,426 398,422 L398,426 C360,430 260,432 228,436 Z', TAR_L, 0.8));
  o.push(fill('M228,442 C262,438 360,436 400,430 L400,436 C360,442 262,444 230,448 Z', PIRATE_RED, 0.7));
  for (let x = 240; x < 392; x += 13) o.push(circ(x, 443 - (x - 240) * 0.07, 1.5, '#1A120E', 0));
  // the oars, angled down into the sea
  for (let x = 246; x < 392; x += 13) o.push(line(`M${x},${443 - (x - 240) * 0.07} L${x - 16},486`, '#6E4A2A', 1.6));
  // the stern curl, the steering oar, the ram and the eye
  o.push(fill('M416,392 C418,380 424,374 432,378 C438,382 436,390 430,390 C428,386 424,386 422,392 Z', TAR_L, 0.8));
  o.push(line('M392,430 L416,482', WOOD_DD, 2.4));
  o.push(fill('M206,452 L222,450 L222,460 L206,460 Z', BRONZE, 0.7));
  o.push(ell(238, 450, 4.2, 2.8, CREAM, 0.6));
  o.push(circ(239, 450, 1.5, OUT, 0));
  // a pennant at the masthead
  o.push(fill('M336,252 L336,242 L352,247 L336,250 Z', PIRATE_RED, 0.6));
  return o.join('');
}

/**
 * NEAR: our merchant ship — the swan's-neck stern post curling over the deck on the left,
 * the mast at 46 with its yard and halyards and stays, the bulwark the people stand in
 * front of (its rail at 446), the deck they stand on (planks from 484), lashed amphorae by
 * the stern, a coil of rope, a hatch.
 */
export const MAST_X = 46;
export function shipDeck() {
  const o = [];
  // the shrouds from the masthead down to the rail, behind everything else
  o.push(line(`M${MAST_X},226 L4,446 M${MAST_X + 2},226 L120,446 M${MAST_X + 2},226 L178,446`, '#4A3A28', 0.7));
  // the bulwark: planks, a heavy top rail, stanchions
  o.push(rect(-2, 446, 404, 40, WOOD, 1));
  o.push(box(0, 474, 400, 11, WOOD_D));
  for (const y of [454, 462, 470]) o.push(line(`M0,${y} L400,${y}`, WOOD_D, 0.6));
  for (let x = 12; x < 400; x += 34) {
    o.push(rect(x, 448, 5, 37, WOOD_L, 0.6));
    o.push(box(x + 3, 449, 1.6, 35, WOOD_D));
  }
  o.push(rect(-2, 442, 404, 5.4, WOOD_L, 1));
  o.push(box(0, 445, 400, 1.6, WOOD_D));
  // the deck
  o.push(rect(-2, 484, 404, 32, DECK, 1));
  o.push(box(0, 484.5, 400, 3.4, DECK_D));
  for (const y of [492, 500, 508]) o.push(line(`M0,${y} L400,${y}`, DECK_LINE, 0.55));
  [[0, 492, 46], [1, 500, 58], [2, 508, 70]].forEach(([r, y, step]) => {
    for (let x = (r * 23) % step; x < 400; x += step) o.push(line(`M${x},${y - 8} L${x},${y}`, DECK_LINE, 0.5));
    for (let x = (r * 17) % step + 8; x < 400; x += step * 1.7) o.push(box(x, y - 6.5, step * 0.4, 1.6, DECK_L));
  });
  // a hatch in the deck (behind where people stand), with its iron ring
  o.push(rect(232, 486, 48, 5, DECK_D, 0.7));
  o.push(ell(256, 488.5, 3, 1.2, IRON, 0.5));
  // a coil of rope by the rail
  o.push(ell(394, 488, 13, 4, ROPE, 0.8));
  o.push(ell(394, 487, 8, 2.4, '#8C6F48', 0.6));
  o.push(ell(394, 486.4, 3.4, 1, '#6E5434', 0.5));
  // amphorae lashed by the stern
  for (const [x, h] of [[20, 26], [30, 24]]) {
    const w = h * 0.34;
    o.push(fill(`M${x - w * 0.18},${486 - h} L${x + w * 0.18},${486 - h} L${x + w * 0.2},${486 - h * 0.86} C${x + w},${486 - h * 0.7} ${x + w * 0.85},${486 - h * 0.25} ${x + w * 0.1},486 L${x - w * 0.1},486 C${x - w * 0.85},${486 - h * 0.25} ${x - w},${486 - h * 0.7} ${x - w * 0.2},${486 - h * 0.86} Z`, CLAY, 0.6));
    o.push(flat(`M${x + w * 0.3},${486 - h * 0.8} C${x + w * 0.85},${486 - h * 0.62} ${x + w * 0.75},${486 - h * 0.25} ${x + w * 0.1},485.6 L${x + w * 0.25},${486 - h * 0.3} Z`, CLAY_D));
  }
  o.push(line('M10,470 L40,470', ROPE, 1.2));
  // the swan's-neck stern post rising at the left edge, curling forward
  o.push(fill('M-6,486 L-6,420 C-6,388 2,362 18,352 C30,346 40,352 38,364 C36,372 28,372 26,366 C28,360 24,356 18,360 C8,368 6,392 8,420 L8,486 Z', WOOD, 1));
  o.push(flat('M2,486 L2,420 C2,392 6,370 14,360 C10,372 8,394 8,420 L8,486 Z', WOOD_D));
  o.push(circ(31, 358, 1.3, OUT, 0));
  o.push(fill('M36,362 L42,364 L37,366 Z', '#D8A548', 0.5));
  // the mast, through the deck, with its partners; the yard and the halyards
  o.push(rect(MAST_X - 4, 216, 8, 272, WOOD, 1));
  o.push(box(MAST_X + 0.6, 217, 3, 270, WOOD_D));
  o.push(rect(MAST_X - 9, 480, 18, 6, WOOD_D, 0.8));
  o.push(fill(`M2,236 C30,231 ${MAST_X + 60},230 146,236 L146,240 C${MAST_X + 60},235 30,236 2,240 Z`, WOOD_L, 0.9));
  o.push(line(`M${MAST_X},218 L14,236 M${MAST_X},218 L120,236`, '#4A3A28', 0.6));
  o.push(rect(MAST_X - 5, 214, 10, 6, WOOD_D, 0.8));
  return o.join('');
}

/** THE SAIL, hung from the yard (y 240), bellied to the right; the scene fills and luffs it. */
export function sail() {
  const o = [];
  const d = 'M8,240 L138,240 C145,272 146,322 140,364 C104,371 42,371 12,364 C17,322 15,272 8,240 Z';
  o.push(fill(d, SAIL, 1));
  o.push(flat('M94,240 L138,240 C145,272 146,322 140,364 C124,367 108,369 94,370 C99,322 99,272 94,240 Z', SAIL_D));
  for (const x of [38, 66, 94, 120]) o.push(line(`M${x},240 C${x + 4},282 ${x + 4},330 ${x + 2},368`, SAIL_BAND, 0.9));
  for (const y of [268, 296, 324, 348]) o.push(line(`M12,${y} C52,${y + 4} 104,${y + 4} 142,${y}`, SAIL_BAND, 0.9));
  // the sheets from its foot down to the rail
  o.push(line('M12,364 L4,444 M140,364 L166,444', '#4A3A28', 0.6));
  return o.join('');
}

/** An iron-bound chest, front on (its own frame: the base at y 0, 40 wide, 22 tall). */
export function chest() {
  const o = [];
  o.push(rect(-20, -22, 40, 22, WOOD, 1));
  o.push(box(7, -21.4, 12.4, 20.8, WOOD_D));
  o.push(line('M-19,-11 L19,-11', WOOD_D, 0.5));
  // the iron straps, riveted
  for (const x of [-17, 14]) {
    o.push(rect(x, -22, 3, 22, IRON, 0.5));
    for (const y of [-18, -11, -4]) o.push(dot(x + 1.5, y, 0.6, IRON_L));
  }
  o.push(rect(-20, -2.6, 40, 2.6, IRON, 0.5));
  // the feet
  o.push(rect(-19, -0.6, 5, 1.6, WOOD_DD, 0.4));
  o.push(rect(14, -0.6, 5, 1.6, WOOD_DD, 0.4));
  return o.join('');
}
/** The chest's lid, closed: an arched top with an iron rim (its own frame: the hinge line at y 0). */
export function lid() {
  const o = [];
  o.push(fill('M-20.6,0 L-20.6,-4.4 C-16,-8.4 16,-8.4 20.6,-4.4 L20.6,0 Z', WOOD_L, 1));
  o.push(flat('M7,-7.2 C13,-6.8 18,-5.6 20.6,-4.4 L20.6,0 L7,0 Z', WOOD));
  o.push(line('M-20.6,-1 L20.6,-1', IRON, 1.1));
  for (const x of [-15.5, 15.5]) o.push(line(`M${x},-7.2 L${x},0`, IRON, 2.6));
  // the hasp hanging over the front
  o.push(rect(-2.2, -1.8, 4.4, 5.4, IRON_L, 0.5));
  return o.join('');
}
/** The inside of the lid, standing open behind the chest (its own frame: the hinge at y 0). */
export function lidIn() {
  const o = [];
  o.push(rect(-20, -20, 40, 20, '#B48A58', 1));
  o.push(box(7, -19.4, 12.4, 18.8, '#9A7246'));
  for (const y of [-13, -7]) o.push(line(`M-19,${y} L19,${y}`, '#8A6640', 0.5));
  for (const x of [-17, 14]) o.push(box(x, -20, 3, 20, IRON));
  return o.join('');
}
/** A sack of silver, tied at the neck (its own frame: standing on y 0). */
export function sack() {
  const o = [];
  o.push(fill('M-9,0 C-11,-6 -10,-13 -5,-16 L-3,-19 L3,-19 L5,-16 C10,-13 11,-6 9,0 Z', '#B89A68', 1));
  o.push(flat('M2,-16 L5,-16 C10,-13 11,-6 9,0 L3,0 C5,-6 5,-12 2,-16 Z', '#987B4E'));
  o.push(fill('M-4,-19 L-2,-22 L2,-22 L4,-19 Z', '#B89A68', 0.7));
  o.push(line('M-4.4,-18.6 L4.4,-18.6', '#6E4A2A', 1.4));
  for (const [x, y] of [[-4, -7], [3, -10], [-1, -3]]) o.push(line(`M${x},${y} l2,1`, '#8A6F45', 0.5));
  return o.join('');
}

// ══════════════════════════════════════════════════════════════════════════════
// PLACES 1 AND 2 — THE PIRATES' COVE, BY DAY AND BY NIGHT (its own x 0–400, laid at 400)
// ══════════════════════════════════════════════════════════════════════════════
//
// One drawing, two lights: the same cove is drawn twice from one function, once in the
// noon palette and once in the night one, and the scene lays the night over the day.

const DAY = {
  sky: SKY, sea: '#3B97B9', seaD: '#2A7B9E', seaL: '#7CC3D6', shallow: '#8FD0C9', foam: FOAM,
  far: HAZE, farD: HAZE_D, cliff: '#D2B985', cliffD: '#B09564', cliffDD: '#8E7650', scrub: '#8C9A5A', scrubD: '#6F7D44',
  sand: '#E8D4A6', sandD: '#D2BB88', sandL: '#F2E3BF', wet: '#C9B184', rock: '#A79D8C', rockD: '#857B6B', rockL: '#C2B8A6',
  tar: TAR, tarD: TAR_D, psail: PSAIL, psailD: PSAIL_D, awn: '#C9643E', awnD: '#A84D2B', awnL: '#EEDDB7', wood: WOOD, woodD: WOOD_D, woodL: WOOD_L,
  mat: '#C9A65E', stone: '#8F877C', stoneD: '#6F675D', ash: '#5A524A', night: false,
};
const NIGHT = {
  sky: ['#141B33', '#1A2442', '#222E52', '#2C3962'], sea: '#1F3554', seaD: '#172A45', seaL: '#3E5C83', shallow: '#2E4B6B', foam: '#8FA6C4',
  far: '#2A3556', farD: '#232D4A', cliff: '#4C4A64', cliffD: '#3D3B53', cliffDD: '#302F44', scrub: '#33435A', scrubD: '#283649',
  sand: '#6F6A7E', sandD: '#5D586C', sandL: '#827C90', wet: '#545064', rock: '#4E4C60', rockD: '#3E3C50', rockL: '#615E74',
  tar: '#1C1820', tarD: '#141118', psail: '#2C1F2A', psailD: '#211722', awn: '#6B3742', awnD: '#552A34', awnL: '#8C8496', wood: '#4E3A35', woodD: '#3C2C29', woodL: '#644B44',
  mat: '#6E6450', stone: '#4A4655', stoneD: '#3A3744', ash: '#2E2A30', night: true,
};

/** FAR: the sky, the sea and its far islands, the two headlands, the beached galley. */
function coveFar(K) {
  const o = [];
  o.push(sky(0, 214, 400, 150, K.sky));
  if (K.night) {
    // stars, and a flat moon
    let s = 11;
    const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
    for (let k = 0; k < 46; k++) o.push(dot(rnd() * 400, 216 + rnd() * 120, 0.5 + rnd() * 0.7, '#E8E4D2', 0.5 + rnd() * 0.5));
    o.push(circ(300, 246, 11, '#EFE8CC', 0.6));
    o.push(flat('M300,235 C307,237 311,242 311,247 C310,253 305,257 300,257 C304,253 305,248 304,244 C303,240 301,237 300,235 Z', '#D9D0AE'));
  }
  // far islands on the horizon
  o.push(flat('M120,364 C140,354 162,350 182,356 C196,352 208,356 220,364 Z', K.far));
  o.push(flat('M168,353 C182,352 206,354 220,364 L184,364 C182,360 176,356 168,353 Z', K.farD));
  // the sea, and the light on it
  o.push(box(0, 362, 400, 100, K.sea));
  o.push(box(0, 362, 400, 3, K.seaL));
  for (const [x, y, w] of [[150, 372, 24], [228, 368, 18], [110, 384, 30], [186, 390, 22], [252, 380, 26], [140, 402, 36], [214, 410, 30]]) o.push(box(x, y, w, 1.3, K.seaL));
  // the left headland: pale cliffs, scrub on the top
  o.push(fill('M-6,254 C14,250 40,262 60,280 C80,300 92,330 104,356 C112,374 118,400 120,430 L-6,430 Z', K.cliff, 1));
  o.push(flat('M60,280 C80,300 92,330 104,356 C112,374 118,400 120,430 L84,430 C86,392 78,342 60,280 Z', K.cliffD));
  for (const d of ['M16,272 L24,300 L18,330', 'M44,292 L50,320 L46,350 L52,380', 'M78,326 L84,352 L80,380', 'M30,350 L36,380 L32,410']) o.push(line(d, K.cliffDD, 0.7));
  o.push(fill('M-6,254 C14,248 34,252 52,264 C40,268 24,264 -6,270 Z', K.scrub, 0.7));
  // the right headland, higher, falling to the beach
  o.push(fill('M406,236 C384,238 360,252 344,270 C330,288 322,312 312,340 C304,362 296,388 290,430 L406,430 Z', K.cliff, 1));
  o.push(flat('M406,236 C394,240 384,246 376,254 C364,300 360,370 358,430 L406,430 Z', K.cliffD));
  for (const d of ['M366,262 L360,292 L366,322', 'M340,300 L334,330 L340,360', 'M386,300 L380,340 L386,380', 'M322,350 L316,384']) o.push(line(d, K.cliffDD, 0.7));
  o.push(fill('M406,236 C390,236 372,242 358,252 C374,252 392,248 406,252 Z', K.scrub, 0.7));
  // the shallows and the beach line
  o.push(flat('M0,430 C80,424 200,422 300,428 L400,432 L400,448 L0,448 Z', K.shallow));
  o.push(line('M0,431 C80,425 200,423 300,429 L400,433', K.foam, 1.2));
  // the far beach
  o.push(fill('M-4,444 C80,438 200,436 300,440 C340,442 380,442 404,444 L404,470 L-4,470 Z', K.wet, 0.8));
  // the beached pirate galley, far right on the shore, its sail furled
  o.push(fill('M226,440 L236,430 C270,426 320,426 350,424 C358,420 362,412 364,404 C368,402 370,404 368,410 C366,424 362,436 352,442 C330,450 270,452 240,450 Z', K.tar, 0.9));
  o.push(flat('M300,426 C330,426 346,424 350,424 C358,420 362,412 364,404 C366,412 364,428 358,438 C346,446 320,450 300,450 Z', K.tarD));
  o.push(rect(296, 364, 3, 64, K.woodD, 0.6));
  o.push(fill('M262,372 C280,368 316,368 334,372 L334,376 C316,372 280,372 262,376 Z', K.psail, 0.7));
  o.push(line('M298,366 L238,428 M298,366 L350,424', K.woodD, 0.5));
  for (let x = 246; x < 344; x += 12) o.push(line(`M${x},436 L${x - 10},452`, K.woodD, 1));
  return o.join('');
}

/**
 * MID + NEAR: the sand the people stand on, the low rock the captain sits on (300), the
 * declaiming rock (38, top 476), the fire pit (244), a seat stone by it (206), the
 * striped awning on its poles over the barrels and the water jars (back), driftwood.
 */
export const COVE = { capRock: 300, declaim: 38, fire: 244, seatA: 206 };
function coveMid(K) {
  const o = [];
  // the sand
  o.push(fill('M-4,456 C80,452 220,450 404,456 L404,518 L-4,518 Z', K.sand, 1));
  o.push(flat('M-4,456 C80,452 220,450 404,456 L404,462 C220,456 80,458 -4,462 Z', K.sandD));
  for (const [x, y, w] of [[30, 472, 26], [120, 480, 34], [260, 476, 22], [340, 488, 30], [80, 500, 28], [196, 506, 36], [306, 508, 24]]) o.push(box(x, y, w, 1.2, K.sandL));
  for (const [x, y] of [[60, 488], [150, 470], [230, 494], [372, 470], [12, 506], [280, 498]]) o.push(ell(x, y, 2.2, 1, K.sandD, 0.4));
  // the awning (back, behind the mat and the fire): two poles, a striped canopy with its
  // scalloped edge; barrels and a water jar in its shade
  o.push(rect(96, 402, 3, 60, K.woodD, 0.7));
  o.push(rect(184, 404, 3, 58, K.woodD, 0.7));
  o.push(rect(108, 440, 18, 22, K.wood, 0.8));
  o.push(box(119, 441, 6, 20, K.woodD));
  for (const y of [445, 456]) o.push(line(`M108,${y} L126,${y}`, '#4A4642', 1.2));
  o.push(rect(128, 444, 15, 18, K.wood, 0.8));
  o.push(line('M128,452 L143,452', '#4A4642', 1.2));
  o.push(fill('M152,462 L150,448 C150,442 160,442 160,448 L158,462 Z', K.night ? '#5A4048' : CLAY, 0.6));
  const sw = 12;
  for (let k = 0; k < 8; k++) {
    const x0 = 92 + k * sw;
    o.push(fill(P([[x0 + 4, 394], [x0 + sw + 4, 394], [x0 + sw, 406], [x0, 406]]), k % 2 ? K.awnL : K.awn, 0.6));
    o.push(fill(`M${x0},406 Q${x0 + sw / 2},412 ${x0 + sw},406 Z`, k % 2 ? K.awnL : K.awn, 0.5));
  }
  // driftwood and a net heap at the right, by the water where boats come in
  o.push(fill('M236,462 C256,458 296,458 316,462 L316,466 C296,463 256,463 236,466 Z', K.woodL, 0.6));
  o.push(fill('M356,470 C350,462 378,460 384,468 C378,472 362,474 356,470 Z', K.night ? '#4A5160' : '#7F8C7A', 0.6));
  for (const d of ['M358,467 L380,465', 'M362,470 L376,463', 'M368,471 L372,462']) o.push(line(d, K.night ? '#3A404C' : '#5F6A5A', 0.4));
  // the declaiming rock (left): a big flat-topped boulder, top at 476
  const D = COVE.declaim;
  o.push(fill(`M${D - 30},500 C${D - 32},490 ${D - 28},480 ${D - 20},476 L${D + 18},475 C${D + 26},478 ${D + 30},488 ${D + 30},500 Z`, K.rock, 1));
  o.push(flat(`M${D + 6},476 L${D + 18},475 C${D + 26},478 ${D + 30},488 ${D + 30},500 L${D + 8},500 C${D + 12},492 ${D + 10},482 ${D + 6},476 Z`, K.rockD));
  o.push(line(`M${D - 22},477 L${D + 16},476`, K.rockL, 1));
  o.push(line(`M${D - 14},486 L${D - 8},492 M${D + 2},482 L${D - 2},490`, K.rockD, 0.6));
  // the captain's low rock (right), top at 482
  const C = COVE.capRock;
  o.push(fill(`M${C - 20},500 C${C - 22},492 ${C - 16},483 ${C - 6},482 L${C + 10},482 C${C + 18},484 ${C + 22},492 ${C + 21},500 Z`, K.rock, 1));
  o.push(flat(`M${C + 4},482 L${C + 10},482 C${C + 18},484 ${C + 22},492 ${C + 21},500 L${C + 6},500 C${C + 8},494 ${C + 7},487 ${C + 4},482 Z`, K.rockD));
  o.push(line(`M${C - 14},483 L${C + 8},482.6`, K.rockL, 0.9));
  // a seat stone by the fire
  for (const x of [COVE.seatA]) {
    o.push(fill(`M${x - 11},501 C${x - 12},494 ${x - 8},489 ${x - 2},488.6 L${x + 4},488.6 C${x + 10},490 ${x + 12},495 ${x + 11},501 Z`, K.stone, 0.9));
    o.push(flat(`M${x + 2},489 L${x + 4},488.6 C${x + 10},490 ${x + 12},495 ${x + 11},501 L${x + 3},501 C${x + 4},496 ${x + 4},492 ${x + 2},489 Z`, K.stoneD));
  }
  // the fire pit: a ring of stones round the ash, two logs crossed in it
  const F = COVE.fire;
  o.push(ell(F, 497, 17, 4.4, K.ash, 0.8));
  o.push(fill(`M${F - 13},498 L${F + 12},490 L${F + 14},493 L${F - 11},501 Z`, K.woodD, 0.7));
  o.push(fill(`M${F - 13},491 L${F + 13},499 L${F + 11},501.6 L${F - 15},493.6 Z`, K.wood, 0.7));
  for (let k = 0; k < 9; k++) {
    const a = Math.PI * (0.05 + (k / 8) * 0.9);
    o.push(ell(F - 18 * Math.cos(a), 498 + 4.4 * Math.sin(a), 3.6, 2.4, K.stone, 0.6));
  }
  return o.join('');
}
export const coveFarDay = () => coveFar(DAY);
export const coveFarNight = () => coveFar(NIGHT);
export const coveMidDay = () => coveMid(DAY);
export const coveMidNight = () => coveMid(NIGHT);

/**
 * THE RANSOM BOAT from Miletus: a rowing boat, bow left, two iron-bound chests in her and a
 * raised stern where her boatman stands to scull (the scene draws him, and his oar). Its own
 * frame: the waterline at y 0, the bow's tip at x −60, the stern at 60.
 */
export function rowBoat() {
  const o = [];
  // the hull, its strakes, the gunwale
  o.push(fill('M-62,-18 C-54,-16 -20,-14 40,-14 L58,-20 L62,-18 C62,-8 58,0 50,6 C14,12 -30,12 -48,6 C-58,0 -62,-8 -62,-18 Z', '#8F5E36', 1));
  o.push(flat('M10,-14 L40,-14 L58,-20 L62,-18 C62,-8 58,0 50,6 C34,9 22,10 10,10 Z', '#6E4526'));
  for (const y of [-8, -1]) o.push(line(`M-58,${y} C-30,${y + 2} 30,${y + 2} 58,${y - 4}`, '#6E4526', 0.6));
  o.push(fill('M-62,-18 C-54,-16 -20,-14 40,-14 L58,-20 L58,-17 L40,-11 C-20,-11 -54,-13 -61,-15 Z', '#B98451', 0.8));
  // the stern platform the boatman stands on
  o.push(rect(38, -18, 22, 3, '#7A5230', 0.6));
  // two chests in the boat
  for (const x of [-34, -8]) {
    o.push(rect(x - 11, -30, 22, 15, '#7E5230', 0.8));
    o.push(box(x + 4, -29.4, 6, 14, '#62401F'));
    o.push(fill(`M${x - 11.4},-30 C${x - 8},-34.4 ${x + 8},-34.4 ${x + 11.4},-30 Z`, '#A0703F', 0.7));
    o.push(box(x - 8, -33, 2.4, 18, IRON));
    o.push(box(x + 6, -33, 2.4, 18, IRON));
  }
  return o.join('');
}

/**
 * A ROMAN WARSHIP (a liburnian) run in bow first (its own frame: the deck at the bow at y 0,
 * the bow's tip at x 0, the hull running off to the right and down into the shallows). A
 * bronze ram at the waterline, the eye on the bow, red shields hung along the rail, oars
 * lifted, a furled sail, a standard at the bow; torch posts at the bow and amidships (the
 * scene draws their flames).
 */
export const WARSHIP_TORCHES = [[16, -40], [150, -44]];
export function warship() {
  const o = [];
  const H = '#5B3B2C', HD = '#432A1F', HL = '#7A5440';
  // the mast with its furled sail and the stays
  o.push(rect(176, -210, 6, 212, '#3E2A20', 0.8));
  o.push(fill('M110,-196 C150,-204 220,-204 256,-196 L256,-188 C220,-196 150,-196 110,-188 Z', '#B8A984', 0.8));
  o.push(line('M178,-210 L10,-4 M180,-210 L340,-6', '#2E2018', 0.6));
  // the hull: the ram forward at the waterline, the bow rising to the deck, the stern off right
  o.push(fill('M0,0 L6,-10 L360,-10 L360,60 C260,68 110,68 46,58 C30,52 18,42 10,30 L-26,30 L-26,18 L6,18 Z', H, 1.2));
  o.push(flat('M190,-10 L360,-10 L360,60 C290,66 230,68 190,68 Z', HD));
  o.push(fill('M3,-10 L360,-10 L360,-3 L5,-3 Z', HL, 0.8));
  for (const y of [26, 40]) o.push(line(`M${y === 26 ? 14 : 30},${y} C110,${y + 6} 260,${y + 6} 360,${y + 2}`, HD, 0.8));
  // shields hung on the rail, red with a bronze boss
  for (let x = 40; x < 360; x += 26) {
    o.push(ell(x, 3, 10, 8.4, '#A63A2E', 0.8));
    o.push(circ(x, 3, 2.2, '#C9A23A', 0.4));
  }
  // the oars, lifted clear of the water as she glides
  for (let x = 50; x < 360; x += 20) o.push(line(`M${x},20 L${x - 14},44`, '#6E4A2A', 1.8));
  // the ram and the eye
  o.push(fill('M-28,16 L8,16 L8,32 L-28,32 Z', BRONZE, 0.8));
  o.push(line('M-26,24 L6,24', '#8E6428', 0.8));
  o.push(ell(26, 10, 5.4, 3.8, CREAM, 0.7));
  o.push(circ(27, 10, 2, OUT, 0));
  // the standard at the bow: a red cloth on a crossbar
  o.push(rect(32, -66, 2.4, 56, '#3E2A20', 0.5));
  o.push(rect(25, -64, 16, 2, '#C9A23A', 0.4));
  o.push(fill('M26,-62 L40,-62 L40,-46 L33,-42 L26,-46 Z', '#A63A2E', 0.6));
  // the torch posts
  for (const [x, y] of WARSHIP_TORCHES) {
    o.push(rect(x - 1.6, y, 3.2, -y - 10, '#3E2A20', 0.5));
    o.push(fill(`M${x - 4},${y} L${x + 4},${y} L${x + 3},${y + 5} L${x - 3},${y + 5} Z`, '#5A4636', 0.5));
  }
  return o.join('');
}

/** The rest of the fleet, at anchor far out: two warships, their torches drawn by the scene. */
export const FLEET_TORCHES = [[34, -14], [150, -12]];
export function fleet() {
  const o = [];
  for (const [x0, s] of [[0, 0.9], [120, 0.75]]) {
    const T = (x, y) => `${f2(x0 + x * s)},${f2(y * s)}`;
    o.push(`<path d="M${T(0, 0)} L${T(4, -8)} L${T(130, -8)} L${T(130, 14)} C${T(90, 18)} ${T(40, 18)} ${T(14, 14)} L${T(-10, 8)} L${T(4, 8)} Z" fill="#2A2230" stroke="${OUT}" stroke-width="0.8" stroke-linejoin="round"/>`);
    o.push(`<rect x="${f2(x0 + 62 * s)}" y="${f2(-80 * s)}" width="${f2(3 * s)}" height="${f2(74 * s)}" fill="#24182A"/>`);
    o.push(`<path d="M${T(36, -72)} L${T(92, -72)} L${T(92, -68)} L${T(36, -68)} Z" fill="#6E6858"/>`);
    for (let x = 16; x < 128; x += 12) o.push(`<ellipse cx="${f2(x0 + x * s)}" cy="${f2(-4 * s)}" rx="${f2(4 * s)}" ry="${f2(3.4 * s)}" fill="#6E2E2C"/>`);
  }
  return o.join('');
}

/** A low camp table, 112 wide, its top at y −26 (its own frame: standing on y 0). */
export function table() {
  const o = [];
  for (const x of [-50, 44]) {
    o.push(rect(x, -22, 6, 22, '#7A5230', 0.8));
    o.push(box(x + 3.6, -21.4, 1.8, 21, '#5A3A1E'));
  }
  o.push(line('M-46,-8 L46,-8', '#5A3A1E', 1.6));
  o.push(rect(-56, -26, 112, 4, '#B48452', 1));
  o.push(rect(-55, -22.4, 110, 2.6, '#8E6236', 0.7));
  return o.join('');
}

/** An iron key, lying on its side (its own frame, centred). */
export function key() {
  const o = [];
  o.push(fill('M-9,-2.6 C-12,-2.6 -12,2.6 -9,2.6 C-7,2.6 -6,1 -6,0 C-6,-1 -7,-2.6 -9,-2.6 Z', '#5E5A54', 0.6));
  o.push(circ(-9, 0, 1, '#8C7A5A', 0.3));
  o.push(rect(-6, -0.9, 13, 1.8, '#5E5A54', 0.5));
  o.push(rect(5, 0.6, 2, 2.6, '#5E5A54', 0.4));
  o.push(rect(2, 0.6, 1.6, 2, '#5E5A54', 0.4));
  return o.join('');
}

const at = (name, fn, view) => ({ name: `caesar1-${name}`, svg: fn, view, box: view });
const FULL = { x: 0, y: 214, w: 400, h: 300 };
export const ART = [
  at('sea', seaFar, FULL),
  { name: 'caesar1-galley', svg: galley, view: { x: 200, y: 236, w: 236, h: 252 }, box: { x: 200, y: 236, w: 236, h: 252 } },
  at('deck', shipDeck, FULL),
  { name: 'caesar1-sail', svg: sail, view: { x: -6, y: 236, w: 182, h: 214 }, box: { x: -6, y: 236, w: 182, h: 214 } },
  at('chest', chest, { x: -21, y: -23, w: 42, h: 25 }),
  at('lid', lid, { x: -21.5, y: -9, w: 43, h: 13 }),
  at('lid-in', lidIn, { x: -21, y: -21, w: 42, h: 22 }),
  at('sack', sack, { x: -12, y: -23, w: 24, h: 24 }),
  at('gull', gull, { x: -13, y: -5, w: 26, h: 9 }),
  { name: 'caesar1-cove-far', svg: coveFarDay, view: FULL, box: { x: 400, y: 214, w: 400, h: 300 } },
  { name: 'caesar1-cove-mid', svg: coveMidDay, view: FULL, box: { x: 400, y: 214, w: 400, h: 300 } },
  { name: 'caesar1-cove-far-night', svg: coveFarNight, view: FULL, box: { x: 400, y: 214, w: 400, h: 300 } },
  { name: 'caesar1-cove-mid-night', svg: coveMidNight, view: FULL, box: { x: 400, y: 214, w: 400, h: 300 } },
  at('boat', rowBoat, { x: -64, y: -37, w: 128, h: 50 }),
  at('warship', warship, { x: -30, y: -214, w: 394, h: 284 }),
  at('fleet', fleet, { x: -12, y: -74, w: 236, h: 92 }),
  at('table', table, { x: -57, y: -27, w: 114, h: 28 }),
  at('key', key, { x: -13, y: -4, w: 22, h: 8 }),
];
