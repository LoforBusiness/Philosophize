// philosophy-foundations-7 — the recap: the Athenian agora on a sunny morning, then the
// harbour at Piraeus (LESSON_RULES AM13; the recap's full settings, built in layers).
//
// Every picture is in SCENE units with the band [214, 514], 400 × 300. Flat fills lit from
// the top left, a darker shaded side, one dark outline; real colours, no gradients, no glows.
//
// REFERENCES (npm run ref, scratchpad/ref/p7*):
//   p7acro-1  "Athens - Acropolis from Theseion": the rock is a flat-topped plateau with
//             sheer pale cliffs, the Parthenon a long low colonnade on its crown left of
//             centre, the Propylaia's blocks on the right end, walls along the lip, dark
//             cypresses and olives on the slope, tiled houses at its foot.
//   p7agora-1 "Stoa of Attalos": a long two-storey colonnade of pale fluted columns on a
//             stepped base, a deep shaded interior, a plain architrave and a cornice with a
//             row of antefixes along the roof edge.
//   p7fount-1 "Black-figure hydria, women at a fountain house" (Boston MFA 61.195): a Doric
//             porch, two columns under an entablature, a lion's-head spout in the back wall
//             pouring into the basin.
//   p7scale-2 "Roman bronze balance, Pompeii": a straight beam hung from a hook at its
//             middle, three chains down from each end to a shallow round pan.
//   p7trireme-1/2 "The trireme Olympias": a long low hull of horizontal strakes, the bow low
//             with an eye, the stern sweeping up in a tall curl, one mast with its yard.
//   p7sund-3  "Hellenistic sundial, Paros": a marble slab with hour lines fanned across it,
//             read by the shadow of a bronze gnomon.
//   p7harb-1  "Remains of the harbour of Zea": pale stone quays, green-blue water.

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
const SKY = ['#7DB6E3', '#93C4E8', '#AAD2EC', '#C3DFEE'];
const HAZE_HILL = '#A9B9C4', HAZE_HILL_D = '#94A7B5';
const ROCK = '#D8C7A4', ROCK_D = '#B9A47E', ROCK_DD = '#9C8762';
const SCRUB = '#93A061', SCRUB_D = '#7A874C';
const OLIVE = '#71834A', OLIVE_D = '#5C6C3B';
const CYPRESS = '#3F5C3D', CYPRESS_D = '#2F4630';
const MARBLE = '#F4EDDE', MARBLE_D = '#DCCFB6', MARBLE_DD = '#C4B596';
const TILE = '#C2643E', TILE_D = '#9E4C2D';
const PLASTER = '#EFE3C8', PLASTER_D = '#D5C4A0';
const PAVE = '#DCCAA4', PAVE_D = '#C5B18A', PAVE_L = '#E8DAB9', PAVE_LINE = '#B39E77';
const WOOD = '#9A6638', WOOD_D = '#734A27', WOOD_L = '#B98451';
const STONE = '#CDBE9F', STONE_D = '#AE9E7E';
const INSIDE = '#B39A78', INSIDE_D = '#957D5C';
const RED = '#B8432F', BLUE = '#3D6E9E', CREAM = '#F3E7C9', OCHRE = '#D8A548';
const WATER = '#6FB1CF', WATER_D = '#4F92B4';

/** A sky in flat bands, lightest at the horizon. */
function sky(x, y0, w, h) {
  const out = [];
  const bands = [0, 0.26, 0.5, 0.72, 1];
  for (let k = 0; k < 4; k++) out.push(box(x, y0 + h * bands[k], w, h * (bands[k + 1] - bands[k]) + 0.3, SKY[k]));
  return out.join('');
}
/** A cypress: a tall flame, lit on its left. */
function cypress(x, yb, h, w = 6) {
  return fill(`M${x},${yb - h} C${x + w * 0.6},${yb - h * 0.7} ${x + w * 0.7},${yb - h * 0.25} ${x + w * 0.5},${yb} L${x - w * 0.5},${yb} C${x - w * 0.7},${yb - h * 0.25} ${x - w * 0.6},${yb - h * 0.7} ${x},${yb - h} Z`, CYPRESS, 0.7)
    + flat(`M${x},${yb - h + 2} C${x + w * 0.5},${yb - h * 0.7} ${x + w * 0.6},${yb - h * 0.25} ${x + w * 0.45},${yb - 0.6} L${x + 0.6},${yb - 0.6} C${x + 1.6},${yb - h * 0.4} ${x + 1},${yb - h * 0.75} ${x},${yb - h + 2} Z`, CYPRESS_D);
}
/** An olive: a low, wide, grey-green crown on a crooked trunk. */
function olive(x, yb, s) {
  return line(`M${x},${yb} C${x - s * 0.1},${yb - s * 0.3} ${x + s * 0.15},${yb - s * 0.45} ${x},${yb - s * 0.6}`, WOOD_D, s * 0.14)
    + fill(`M${x - s},${yb - s * 0.62} C${x - s * 1.05},${yb - s * 1.05} ${x - s * 0.4},${yb - s * 1.2} ${x},${yb - s * 1.1} C${x + s * 0.5},${yb - s * 1.25} ${x + s * 1.1},${yb - s * 1} ${x + s * 0.95},${yb - s * 0.6} C${x + s * 0.6},${yb - s * 0.42} ${x - s * 0.6},${yb - s * 0.4} ${x - s},${yb - s * 0.62} Z`, OLIVE, 0.7)
    + flat(`M${x + s * 0.95},${yb - s * 0.6} C${x + s * 0.6},${yb - s * 0.42} ${x - s * 0.3},${yb - s * 0.44} ${x - s * 0.7},${yb - s * 0.55} C${x - s * 0.2},${yb - s * 0.62} ${x + s * 0.5},${yb - s * 0.66} ${x + s * 0.95},${yb - s * 0.8} Z`, OLIVE_D);
}
/** A small house: a whitewashed box under a tiled roof, a door, a window. */
function house(x, yb, w, h, flip = false) {
  const r = 5;
  return rect(x, yb - h, w, h, PLASTER, 0.7)
    + box(flip ? x : x + w * 0.62, yb - h + 0.4, w * 0.38, h - 0.8, PLASTER_D)
    + fill(P([[x - 1.5, yb - h + 0.5], [x + w / 2, yb - h - r], [x + w + 1.5, yb - h + 0.5]]), TILE, 0.7)
    + box(x + w * 0.2, yb - h * 0.55, w * 0.16, h * 0.55, '#7A5A3E')
    + box(x + w * 0.58, yb - h * 0.72, w * 0.14, h * 0.2, '#5C4632');
}
/** A painted person at a distance: head, a chiton, arms, as a market crowd. */
function person(x, yb, h, robe, robeD, skin = '#C98F64', dir = 1) {
  const hw = h * 0.17;
  return fill(`M${x - hw},${yb} L${x - hw * 0.7},${yb - h * 0.72} L${x + hw * 0.7},${yb - h * 0.72} L${x + hw},${yb} Z`, robe, 0.6)
    + flat(`M${x + hw * 0.1 * dir},${yb - h * 0.7} L${x + hw * 0.7 * dir},${yb - h * 0.72} L${x + hw * dir},${yb} L${x + hw * 0.2 * dir},${yb} Z`, robeD)
    + circ(x + dir * 0.5, yb - h * 0.82, h * 0.12, skin, 0.6)
    + flat(`M${x - h * 0.12 + dir},${yb - h * 0.86} C${x - h * 0.1},${yb - h * 0.99} ${x + h * 0.12},${yb - h * 0.99} ${x + h * 0.13 + dir},${yb - h * 0.86} Z`, '#3E2C20');
}
/** An amphora standing: a tall jar with two handles, terracotta. */
function amphora(x, yb, h, c = '#C57A48', cd = '#A35E33') {
  const w = h * 0.36;
  return fill(`M${x - w * 0.18},${yb - h} L${x + w * 0.18},${yb - h} L${x + w * 0.2},${yb - h * 0.86} C${x + w * 0.95},${yb - h * 0.7} ${x + w * 0.85},${yb - h * 0.25} ${x + w * 0.1},${yb} L${x - w * 0.1},${yb} C${x - w * 0.85},${yb - h * 0.25} ${x - w * 0.95},${yb - h * 0.7} ${x - w * 0.2},${yb - h * 0.86} Z`, c, 0.6)
    + flat(`M${x + w * 0.3},${yb - h * 0.8} C${x + w * 0.85},${yb - h * 0.62} ${x + w * 0.75},${yb - h * 0.25} ${x + w * 0.1},${yb - 0.4} L${x + w * 0.25},${yb - h * 0.3} Z`, cd)
    + line(`M${x - w * 0.2},${yb - h * 0.92} C${x - w * 0.7},${yb - h * 0.95} ${x - w * 0.7},${yb - h * 0.72} ${x - w * 0.5},${yb - h * 0.7} M${x + w * 0.2},${yb - h * 0.92} C${x + w * 0.7},${yb - h * 0.95} ${x + w * 0.7},${yb - h * 0.72} ${x + w * 0.5},${yb - h * 0.7}`, OUT, 0.7);
}
/** A fluted column seen front on, lit on its left, with capital and base. */
function column(x, top, yb, w, lit = MARBLE, shade = MARBLE_D) {
  const o = [];
  o.push(rect(x - w / 2 - 2, top - 3, w + 4, 3, lit, 0.7));                         // abacus
  o.push(fill(`M${x - w / 2 - 1},${top} L${x + w / 2 + 1},${top} L${x + w / 2},${top + 3} L${x - w / 2},${top + 3} Z`, lit, 0.6)); // echinus
  o.push(rect(x - w / 2, top + 3, w, yb - top - 6, lit, 0.7));
  o.push(box(x + w * 0.12, top + 3.4, w * 0.38 - 0.4, yb - top - 6.8, shade));
  for (const fx of [-0.25, 0.0, 0.25]) o.push(line(`M${x + w * fx},${top + 5} L${x + w * fx},${yb - 5}`, shade === MARBLE_D ? MARBLE_DD : shade, 0.45));
  o.push(rect(x - w / 2 - 1.5, yb - 3, w + 3, 3, lit, 0.6));                        // base
  return o.join('');
}

// ══════════════════════════════════════════════════════════════════════════════
// THE AGORA
// ══════════════════════════════════════════════════════════════════════════════

/** FAR: the morning sky, Mount Hymettos in haze, the Acropolis on its rock, the city at its foot. */
export function agoraFar() {
  const o = [];
  o.push(sky(0, 214, 400, 190));
  // Hymettos, a long blue-grey ridge in the haze
  o.push(flat('M0,372 C40,358 90,352 140,360 C190,348 250,340 310,350 C350,344 380,350 400,346 L400,410 L0,410 Z', HAZE_HILL));
  o.push(flat('M210,352 C260,344 300,350 330,352 C360,346 385,351 400,348 L400,410 L230,410 Z', HAZE_HILL_D));
  // the rock: a flat crown with pale cliffs, the shaded face on its right
  o.push(fill('M14,388 C26,376 36,356 48,344 L62,330 L78,326 L206,324 L222,330 C230,342 238,358 252,372 L264,388 Z', ROCK, 1));
  o.push(flat('M168,326 L206,324 L222,330 C230,342 238,358 252,372 L264,388 L196,388 C204,370 196,350 186,338 Z', ROCK_D));
  // cliff fissures
  o.push(line('M70,334 L66,352 M96,328 L100,346 M128,328 L124,344 M196,330 L200,350 M214,336 L220,356', ROCK_DD, 0.8));
  // the walls along the lip
  o.push(fill('M60,330 L64,322 L210,320 L222,328 Z', '#E2D3B2', 0.7));
  o.push(line('M66,326 L216,324', ROCK_DD, 0.5));
  // the Parthenon: stylobate, a long colonnade, the entablature, a low pediment
  const px0 = 98, px1 = 172, pt = 300, pb = 320;
  o.push(rect(px0 - 3, pb - 1.5, px1 - px0 + 6, 2.6, MARBLE, 0.6));
  o.push(box(px0, pt + 4, px1 - px0, pb - pt - 5, '#C9BC9E'));
  for (let k = 0; k <= 15; k++) {
    const cx = px0 + 1.5 + k * ((px1 - px0 - 3) / 15);
    o.push(box(cx - 1.2, pt + 4, 2.4, pb - pt - 5, k > 11 ? MARBLE_D : MARBLE));
  }
  o.push(rect(px0 - 2, pt, px1 - px0 + 4, 4.6, MARBLE, 0.6));
  o.push(fill(P([[px0 - 2, pt], [px0 + 8, pt - 4.4], [px1 - 8, pt - 4.4], [px1 + 2, pt]]), MARBLE_D, 0.6));
  o.push(line(`M${px0},${pt + 2.3} L${px1},${pt + 2.3}`, MARBLE_DD, 0.4));
  // the Erechtheion, small, beside it
  o.push(rect(178, 309, 18, 11, MARBLE, 0.6));
  for (let k = 0; k < 5; k++) o.push(box(180 + k * 3.4, 312, 1.4, 8, MARBLE_D));
  o.push(fill(P([[177, 309], [187, 305], [197, 309]]), MARBLE_D, 0.5));
  // the Propylaia, the gate at the west (left) end
  o.push(rect(64, 312, 20, 12, MARBLE, 0.6));
  for (let k = 0; k < 5; k++) o.push(box(66 + k * 3.8, 315, 1.6, 9, MARBLE_D));
  o.push(rect(84, 316, 9, 8, MARBLE_D, 0.5));
  // the slope: scrub, olives and cypresses
  o.push(fill('M0,404 C12,392 22,384 40,380 C80,386 120,384 160,382 C200,384 240,380 270,388 C300,396 340,400 400,402 L400,430 L0,430 Z', SCRUB, 0.8));
  o.push(flat('M210,384 C240,380 262,384 270,388 C300,396 340,400 400,402 L400,430 L230,430 Z', SCRUB_D));
  for (const [x, h] of [[30, 26], [44, 20], [118, 22], [136, 30], [152, 18], [236, 24], [250, 30], [266, 20]]) o.push(cypress(x, 392 + (x % 7), h, 5.5));
  for (const [x, s] of [[70, 9], [94, 8], [176, 10], [204, 8], [300, 10], [330, 9], [366, 10]]) o.push(olive(x, 400 + (x % 5), s));
  // the city at its foot
  for (const [x, w, h, f] of [[4, 22, 14, false], [30, 18, 12, true], [52, 24, 16, false], [80, 16, 11, false], [100, 22, 13, true],
    [128, 20, 15, false], [152, 24, 12, true], [180, 18, 14, false], [200, 22, 12, false], [226, 20, 15, true]]) o.push(house(x, 432, w, h, f));
  return o.join('');
}

/** MID + NEAR: the paving, the fountain house, the market and the merchant's stall, the stoa. */
export function agoraMid() {
  const o = [];
  // the back of the square: a low terrace wall where the city meets the agora
  o.push(rect(-2, 430, 404, 14, STONE, 0.7));
  o.push(box(0, 438, 400, 5.6, STONE_D));
  for (let x = 6; x < 400; x += 22) o.push(line(`M${x},431 L${x},437 M${x + 11},438 L${x + 11},443`, STONE_D, 0.5));
  // the paving
  o.push(rect(-2, 443, 404, 73, PAVE, 0.8));
  o.push(box(0, 443.5, 400, 6, PAVE_D));
  const rows = [452, 464, 480, 500];
  for (const y of rows) o.push(line(`M0,${y} L400,${y}`, PAVE_LINE, 0.55));
  rows.forEach((y, r) => {
    const h = (rows[r + 1] ?? 516) - y;
    const step = 20 + r * 10;
    for (let x = (r % 2) * step * 0.5; x < 400; x += step) o.push(line(`M${f2(x)},${y} L${f2(x - 2 - r)},${f2(y + h)}`, PAVE_LINE, 0.5));
    for (let x = step * 0.25 + (r % 2) * 7; x < 400; x += step * 2.3) o.push(box(x, y + 1.5, step * 0.5, Math.min(4, h - 3), PAVE_L, 0.8));
  });

  // ── the background crowd in the market (between the fountain and the stall) ──
  o.push(person(92, 448, 30, '#C9A86A', '#A98A52', '#C98F64', 1));
  o.push(amphora(101, 448, 13));
  o.push(person(208, 446, 28, '#7E9AB4', '#627F99', '#B9805A', -1));

  // ── the fountain house (left) ──
  o.push(rect(2, 368, 74, 80, STONE, 0.9));                                         // back wall
  o.push(box(46, 369, 29, 78, STONE_D));
  for (let y = 380; y < 446; y += 11) o.push(line(`M3,${y} L75,${y}`, STONE_D, 0.5));
  // the lion's-head spout in the back wall
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * Math.PI * 2;
    o.push(circ(38 + 7.4 * Math.cos(a), 420 + 7.4 * Math.sin(a), 2.6, '#A9772A', 0.5));   // the mane
  }
  o.push(circ(38, 420, 7.2, '#A9772A', 0));
  o.push(circ(38, 420.6, 5.4, OCHRE, 0.7));                                          // the face
  o.push(flat('M38,415.6 C41,416 43,418.4 43,421 C42,424 40,425.6 38,426 Z', '#C08F35'));
  o.push(circ(35.8, 418.8, 0.8, OUT, 0));
  o.push(circ(40.2, 418.8, 0.8, OUT, 0));
  o.push(fill('M36.6,421 L39.4,421 L38,422.8 Z', '#7A5420', 0.4));                     // the nose
  o.push(ell(38, 424.6, 1.8, 1.3, '#5A3E18', 0.5));                                     // the open mouth the water runs from
  // the porch: two Doric columns and the entablature, the pediment and its tiles
  o.push(column(8, 372, 448, 7));
  o.push(column(70, 372, 448, 7));
  o.push(rect(-1, 362, 80, 8, MARBLE, 0.8));
  for (let k = 0; k < 7; k++) o.push(box(3 + k * 11, 363.6, 3, 5, MARBLE_DD));
  o.push(fill(P([[-3, 362], [38, 346], [81, 362]]), MARBLE, 0.8));
  o.push(flat('M38,349 L76,361 L38,361 Z', MARBLE_D));
  o.push(fill(P([[-4, 362], [38, 344], [82, 362], [80, 364], [38, 347], [-2, 364]]), TILE, 0.7));
  // the basin: a stone trough with water in it
  o.push(rect(0, 444, 78, 4, '#5E9FBE', 0.6));
  o.push(rect(-1, 447, 80, 22, STONE, 0.9));
  o.push(box(52, 448, 26, 20, STONE_D));
  o.push(rect(-2, 444, 82, 4.4, MARBLE, 0.7));                                       // the rim
  // ── the official's table, by the fountain ──
  o.push(rect(82, 458, 34, 4, WOOD_L, 0.8));
  o.push(rect(85, 462, 3, 22, WOOD_D, 0.6));
  o.push(rect(110, 462, 3, 22, WOOD_D, 0.6));
  o.push(rect(84, 470, 30, 2.2, WOOD, 0.5));
  o.push(fill('M88,454 L104,454 C106,454 106,458 104,458 L88,458 C86,458 86,454 88,454 Z', CREAM, 0.6));  // a scroll
  o.push(ell(110, 456.6, 3.2, 1.4, '#7A6248', 0.5));                                  // a bronze dish

  // ── the merchant's stall: posts, a striped awning, a counter, jars and figs ──
  const S0 = 112, S1 = 222;
  o.push(rect(S0 + 2, 396, 3, 58, WOOD_D, 0.7));
  o.push(rect(S1 - 5, 396, 3, 58, WOOD_D, 0.7));
  // the goods behind the counter
  o.push(rect(S0 + 6, 428, S1 - S0 - 12, 3, WOOD, 0.6));                             // a shelf
  for (const [x, h, c, cd] of [[124, 15, '#C57A48', '#A35E33'], [136, 13, '#D18F57', '#AE6F3C'], [148, 15, '#C57A48', '#A35E33']]) o.push(amphora(x, 428, h, c, cd));
  o.push(ell(196, 425, 10, 4, '#B48A52', 0.7));                                       // a basket
  for (const [x, y] of [[190, 422.6], [194, 421.6], [198, 422], [202, 422.8], [193, 424], [199, 424]]) o.push(circ(x, y, 1.9, '#6E3D5A', 0.4));
  o.push(ell(176, 426, 7, 3, '#B48A52', 0.6));
  for (const [x, y] of [[173, 424.4], [177, 424], [180, 424.6]]) o.push(circ(x, y, 1.6, '#7F9442', 0.35));
  // the awning: a striped cloth on its beam, scalloped valance
  o.push(rect(S0 - 2, 393, S1 - S0 + 4, 4, WOOD, 0.7));
  const stripes = 9, sw = (S1 - S0 + 8) / stripes;
  for (let k = 0; k < stripes; k++) {
    const x0 = S0 - 4 + k * sw;
    o.push(fill(P([[x0 + 3, 384], [x0 + sw + 3, 384], [x0 + sw, 397], [x0, 397]]), k % 2 ? CREAM : BLUE, 0.6));
  }
  o.push(flat(`M${S0 - 4},393 L${S1 + 4},393 L${S1 + 4},397 L${S0 - 4},397 Z`, '#000', 0.12));
  for (let k = 0; k < stripes; k++) {
    const x0 = S0 - 4 + k * sw;
    o.push(fill(`M${f2(x0)},397 Q${f2(x0 + sw / 2)},404 ${f2(x0 + sw)},397 Z`, k % 2 ? CREAM : BLUE, 0.6));
  }
  // the counter
  o.push(rect(S0 - 4, 449, S1 - S0 + 8, 5, WOOD_L, 0.9));
  o.push(rect(S0 - 2, 454, S1 - S0 + 4, 34, WOOD, 0.9));
  o.push(box(S1 - 30, 454.6, 31, 33, WOOD_D, 0.55));
  for (let y = 462; y < 488; y += 8) o.push(line(`M${S0 - 1},${y} L${S1 + 1},${y}`, WOOD_D, 0.5));
  // the balance's hook on the beam
  o.push(line('M166,397 L166,402', OUT, 1));

  // ── the stoa (right): stepped base, the shaded hall, the colonnade, the roof ──
  const X0 = 226;
  o.push(rect(X0, 272, 180, 176, INSIDE, 0.9));                                      // the hall, in shade
  o.push(box(X0 + 1, 273, 178, 16, INSIDE_D));
  // the back wall's doors and a painted band
  for (const x of [256, 300, 344, 388]) {
    o.push(rect(x - 7, 400, 14, 44, '#7E6648', 0.6));
    o.push(box(x, 401, 6.4, 42, '#6A5439'));
  }
  o.push(box(X0 + 1, 392, 178, 4, RED, 0.85));
  // the morning sun between the columns: lit slants on the back wall
  for (const x of [244, 288, 332, 376]) o.push(flat(`M${x + 8},300 L${x + 30},300 L${x + 44},446 L${x + 22},446 Z`, '#E0C9A2', 0.45));
  // the ceiling beams in shadow
  for (let x = X0 + 10; x < 404; x += 22) o.push(box(x, 292, 5, 6, INSIDE_D));
  // the columns
  for (const x of [238, 282, 326, 370, 414]) o.push(column(x, 292, 450, 10));
  // the entablature, triglyphs, the cornice and the antefixes along the roof
  o.push(rect(X0 - 2, 280, 184, 12, MARBLE, 0.9));
  o.push(line(`M${X0},285 L404,285`, MARBLE_DD, 0.5));
  for (let x = X0 + 6; x < 404; x += 14) o.push(box(x, 286, 4, 5.4, '#5C6E80'));
  o.push(rect(X0 - 5, 275, 190, 5, MARBLE, 0.8));
  o.push(fill(`M${X0 - 6},275 L${X0 + 8},262 L410,262 L410,275 Z`, TILE, 0.8));
  o.push(flat(`M${X0 + 8},262 L410,262 L410,268 L${X0 + 2},268 Z`, TILE_D));
  for (let x = X0 - 2; x < 404; x += 9) o.push(fill(`M${x},275 L${x + 2.2},270.6 L${x + 4.4},275 Z`, MARBLE, 0.4));
  // the steps the colonnade stands on
  o.push(rect(X0 - 4, 448, 184, 4, MARBLE, 0.8));
  o.push(rect(X0 - 8, 452, 190, 4, MARBLE_D, 0.7));
  // the hall's shadow on the paving under the roof
  o.push(flat(`M${X0 - 8},456 L404,456 L404,462 L${X0 - 2},462 Z`, '#000', 0.08));
  return o.join('');
}

/** NEAR: the philosopher's stone table, drawn over his legs. */
export function agoraTable() {
  const o = [];
  // the top slab, its lit edge, the front face, two stout legs
  o.push(rect(250, 452, 142, 7, MARBLE, 1));
  o.push(box(252, 456.2, 138, 2.2, MARBLE_D));
  o.push(rect(256, 459, 130, 8, MARBLE_D, 0.9));
  o.push(rect(262, 467, 14, 27, MARBLE, 0.9));
  o.push(box(270, 468, 5, 25, MARBLE_D));
  o.push(rect(366, 467, 14, 27, MARBLE, 0.9));
  o.push(box(374, 468, 5, 25, MARBLE_D));
  o.push(line('M260,463 L382,463', MARBLE_DD, 0.5));
  return o.join('');
}

// ══════════════════════════════════════════════════════════════════════════════
// THE HARBOUR — drawn in its own frame (x 0–400), laid at world x 400.
// ══════════════════════════════════════════════════════════════════════════════

/** FAR: the sky, the open sea, Salamis in the haze, the hill of Mounichia and its town. */
export function harbourFar() {
  const o = [];
  o.push(sky(0, 214, 400, 176));
  // Salamis, across the water, and the far mountains
  o.push(flat('M120,386 C170,370 220,366 260,372 C300,362 350,364 400,370 L400,392 L120,392 Z', HAZE_HILL));
  o.push(flat('M290,368 C330,362 370,366 400,370 L400,392 L300,392 Z', HAZE_HILL_D));
  // the sea to the horizon
  o.push(box(0, 388, 400, 80, WATER));
  o.push(box(0, 388, 400, 6, '#8CC3DB'));
  for (const [x, y, w] of [[140, 398, 20], [212, 404, 26], [300, 400, 18], [356, 410, 24], [170, 420, 30], [260, 428, 22], [330, 440, 28]]) o.push(box(x, y, w, 1.2, '#A9D6E8'));
  // Mounichia: a green hill on the left with houses climbing it
  o.push(fill('M-4,380 C14,338 50,318 92,322 C118,326 140,350 156,384 L156,410 L-4,410 Z', SCRUB, 0.8));
  o.push(flat('M80,322 C112,326 138,348 156,384 L156,410 L110,410 C112,376 100,342 80,322 Z', SCRUB_D));
  for (const [x, yb, w, h, f] of [[30, 340, 14, 9, false], [52, 336, 16, 10, true], [74, 340, 14, 9, false], [14, 356, 16, 10, true],
    [38, 354, 18, 11, false], [62, 352, 14, 9, true], [86, 354, 16, 10, false], [108, 360, 16, 10, true], [124, 372, 16, 9, false]]) o.push(house(x, yb, w, h, f));
  o.push(fill('M76,330 L76,316 L90,316 L90,330 Z', MARBLE, 0.6));
  o.push(fill(P([[74, 316], [83, 311], [92, 316]]), TILE, 0.5));
  for (const [x, yb] of [[8, 368], [100, 346], [140, 378]]) o.push(cypress(x, yb, 18, 5));
  // a tiny sail far out
  o.push(fill('M232,384 L232,374 L239,384 Z', CREAM, 0.5));
  o.push(fill('M228,385 L242,385 L240,387 L230,387 Z', WOOD_D, 0.4));
  return o.join('');
}

/** MID + NEAR: the shipsheds, the quay and its sundial, bollards, rope and jars (the ship is its own picture). */
export function harbourMid() {
  const o = [];
  // the shipsheds: a row of gabled roofs on columns, slipways running down into the water
  const sheds = [[-6, 50], [40, 50], [86, 50]];
  for (const [x, w] of sheds) {
    o.push(rect(x, 372, w, 70, '#8F7A5E', 0.8));                                      // the dark inside of a shed
    o.push(box(x + 2, 380, w - 4, 60, '#7A664C'));
    o.push(fill(P([[x - 3, 376], [x + w / 2, 356], [x + w + 3, 376]]), TILE, 0.8));
    o.push(flat(`M${x + w / 2},359 L${x + w + 1},375 L${x + w / 2},375 Z`, TILE_D));
    o.push(rect(x - 2, 374, w + 4, 5, MARBLE, 0.7));
    o.push(column(x + 3, 380, 446, 6, STONE, STONE_D));
    // a hull drawn up inside, in shadow
    o.push(fill(`M${x + 9},428 C${x + 18},436 ${x + w - 12},436 ${x + w - 6},426 L${x + w - 8},420 L${x + 10},422 Z`, '#5C452E', 0.6));
  }
  o.push(column(133, 380, 446, 6, STONE, STONE_D));
  // the quay: a pale stone edge, then its top running to the front
  o.push(rect(-2, 440, 404, 76, PAVE, 0.9));
  o.push(rect(-2, 440, 404, 7, '#E6D8B6', 0.8));                                      // the coping along the water
  o.push(box(0, 447, 400, 4, PAVE_D));
  const rows = [458, 474, 494];
  for (const y of rows) o.push(line(`M0,${y} L400,${y}`, PAVE_LINE, 0.55));
  rows.forEach((y, r) => {
    const h = (rows[r + 1] ?? 516) - y;
    const step = 26 + r * 12;
    for (let x = (r % 2) * step * 0.5 + 6; x < 400; x += step) o.push(line(`M${f2(x)},${y} L${f2(x - 2 - r)},${f2(y + h)}`, PAVE_LINE, 0.5));
    for (let x = step * 0.3 + (r % 2) * 9; x < 400; x += step * 2.1) o.push(box(x, y + 1.5, step * 0.5, Math.min(4, h - 3), PAVE_L, 0.8));
  });
  for (let x = 4; x < 400; x += 30) o.push(line(`M${x},441 L${x},446`, PAVE_D, 0.5));
  // bollards and a coil of rope
  for (const x of [168, 380]) {
    o.push(rect(x - 4, 444, 8, 9, STONE_D, 0.8));
    o.push(ell(x, 444, 5, 2, STONE, 0.7));
  }
  o.push(ell(352, 470, 11, 4, '#C9A66B', 0.8));
  o.push(ell(352, 468.6, 7.6, 2.6, '#B48F55', 0.6));
  o.push(ell(352, 467.4, 4, 1.4, '#9C7A44', 0.5));
  // jars waiting to be loaded
  for (const [x, h] of [[300, 22], [314, 20], [307, 18]]) o.push(amphora(x, x === 307 ? 474 : 468, h));
  // the sundial: a stone pedestal and a slab with its hour lines, read by a bronze gnomon
  const DX = 66;
  o.push(rect(DX - 9, 452, 18, 40, STONE, 0.9));
  o.push(box(DX + 2, 453, 6.4, 38, STONE_D));
  o.push(rect(DX - 12, 488, 24, 6, STONE_D, 0.8));
  o.push(rect(DX - 12, 448, 24, 5, MARBLE, 0.8));
  o.push(fill(`M${DX - 20},445 A20,8 0 0 0 ${DX + 20},445 Z`, MARBLE, 0.9));
  o.push(fill(`M${DX - 20},445 A20,8 0 0 0 ${DX + 20},445 L${DX + 20},448 A20,8 0 0 1 ${DX - 20},448 Z`, MARBLE_D, 0.8));
  // the hour lines fanned from the gnomon's foot across the half-round
  for (let k = -5; k <= 5; k++) {
    const a = (k / 5) * 1.45;
    const ex = DX + Math.sin(a) * 19, ey = 445 + Math.cos(a) * 7.4;
    o.push(line(`M${DX},445.4 L${f2(ex)},${f2(ey)}`, k === 0 ? RED : MARBLE_DD, k === 0 ? 1 : 0.5));
  }
  // the gnomon: a bronze fin standing up at the back
  o.push(fill(`M${DX - 0.8},445.4 L${DX - 0.8},432 L${DX + 9},445.4 Z`, '#B07A34', 0.7));
  return o.join('');
}

/** The old ship, her planks a patchwork of new honey wood and old grey-brown. Facing left. */
export function oldShip() {
  const o = [];
  const NEW = '#DDA867', NEW_D = '#C08A4C', OLD = '#7C6650', OLD_D = '#5E4C3B';
  // the mast, its yard and the sail furled on it, the stays
  o.push(rect(104, 232, 5, 176, WOOD, 0.9));
  o.push(box(106.6, 233, 2, 174, WOOD_D));
  o.push(fill('M58,248 C80,244 134,244 156,248 L156,252 C134,249 80,249 58,252 Z', WOOD, 0.8));
  o.push(fill('M62,252 C80,262 134,262 152,252 C150,258 140,262 128,262 C110,266 90,264 74,262 C68,260 62,256 62,252 Z', CREAM, 0.8));
  o.push(flat('M106,255 C120,256 140,255 150,253 C148,259 138,262 126,262 C116,264 108,262 106,262 Z', '#D8C9A3'));
  for (const x of [74, 90, 122, 138]) o.push(line(`M${x},252 L${x + 1},262`, '#C9B78F', 0.5));
  o.push(line('M106,236 L6,404 M106,236 L214,392 M58,250 L40,404 M156,250 L176,398', '#3A2E24', 0.55));
  o.push(fill('M106,232 L106,222 L122,226 L106,230 Z', RED, 0.6));                  // the pennant
  // the hull: a long low body, the bow low on the left with its ram, the stern sweeping up
  const hull = 'M2,414 L14,408 C40,404 150,404 196,400 C210,398 220,388 222,370 C224,358 230,350 238,352 C232,356 230,366 232,378 C234,396 226,414 214,424 C190,442 150,452 60,452 C30,452 10,446 -2,432 L-12,430 L-12,424 L0,424 Z';
  o.push(fill(hull, OLD, 1.1));
  // the strakes: four rows of planks, each plank new or old
  const rows = [[412, 6], [418, 7], [425, 8], [433, 8], [441, 7]];
  let seed = 7;
  const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
  rows.forEach(([y, h], r) => {
    let x = 4 + r * 3;
    while (x < 210 - r * 10) {
      const w = 22 + rnd() * 18;
      const isNew = rnd() > 0.42;
      const x1 = Math.min(x + w, 210 - r * 10);
      o.push(box(x, y, x1 - x - 0.6, h - 0.6, isNew ? NEW : OLD));
      o.push(box(x, y + h - 2.2, x1 - x - 0.6, 1.6, isNew ? NEW_D : OLD_D));
      o.push(line(`M${f2(x1 - 0.3)},${y} L${f2(x1 - 0.3)},${y + h - 0.6}`, OUT, 0.45));
      x = x1;
    }
  });
  // redraw the hull's outline over the strakes, and the gunwale with its rail
  o.push(`<path d="${hull}" fill="none" stroke="${OUT}" stroke-width="1.1" stroke-linejoin="round"/>`);
  o.push(fill('M0,410 C40,402 150,402 198,398 L200,401 C150,405 40,405 2,413 Z', WOOD_L, 0.8));
  for (let x = 20; x < 196; x += 16) o.push(line(`M${x},403.6 L${x},397`, WOOD_D, 0.9));
  o.push(line('M14,397 L196,394', WOOD_D, 1));
  // the stern post's curl and the steering oar
  o.push(fill('M222,370 C224,356 230,348 240,350 C246,352 246,360 240,362 C236,358 232,360 232,368 Z', NEW_D, 0.8));
  o.push(line('M206,404 L236,458', WOOD_D, 2.6));
  o.push(fill('M230,446 L240,444 L246,462 L236,464 Z', WOOD, 0.7));
  // the eye on the bow, and the ram
  o.push(ell(26, 413, 4.6, 3, CREAM, 0.7));
  o.push(circ(27, 413, 1.6, OUT, 0));
  o.push(fill('M-12,424 L2,422 L2,430 L-12,430 Z', '#9A7A3C', 0.7));
  return o.join('');
}

/** A gull gliding, wings spread, facing right. */
export function gull() {
  return fill('M-12,1 C-8,-4 -4,-3 0,1 C4,-3 8,-4 12,1 C8,-1 4,0 1,3 L-1,3 C-4,0 -8,-1 -12,1 Z', '#F5F3EE', 0.6)
    + flat('M8.4,-3 C10,-2.4 11.2,-0.8 12,1 C11,-0.4 9.6,-1.2 8.4,-1.4 Z', '#4A4A4A')
    + flat('M-8.4,-3 C-10,-2.4 -11.2,-0.8 -12,1 C-11,-0.4 -9.6,-1.2 -8.4,-1.4 Z', '#4A4A4A')
    + ell(1.4, 2, 2.8, 1.6, '#F5F3EE', 0.5)
    + fill('M4,1.6 L6,2.2 L4,2.8 Z', OCHRE, 0.3);
}

export const ART = [
  { name: 'phil7-agora-far', svg: agoraFar, view: { x: 0, y: 214, w: 400, h: 300 }, box: { x: 0, y: 214, w: 400, h: 300 } },
  { name: 'phil7-agora-mid', svg: agoraMid, view: { x: 0, y: 214, w: 400, h: 300 }, box: { x: 0, y: 214, w: 400, h: 300 } },
  { name: 'phil7-agora-table', svg: agoraTable, view: { x: 246, y: 448, w: 150, h: 50 }, box: { x: 246, y: 464, w: 150, h: 50 } },
  { name: 'phil7-harbour-far', svg: harbourFar, view: { x: 0, y: 214, w: 400, h: 300 }, box: { x: 400, y: 214, w: 400, h: 300 } },
  { name: 'phil7-harbour-mid', svg: harbourMid, view: { x: 0, y: 214, w: 400, h: 300 }, box: { x: 400, y: 214, w: 400, h: 300 } },
  { name: 'phil7-ship', svg: oldShip, view: { x: -14, y: 218, w: 260, h: 250 }, box: { x: -14, y: 218, w: 260, h: 250 } },
  { name: 'phil7-gull', svg: gull, view: { x: -13, y: -5, w: 26, h: 9 }, box: { x: -13, y: -5, w: 26, h: 9 } },
];
