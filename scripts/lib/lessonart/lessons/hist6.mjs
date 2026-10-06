// history-foundations-6, "Who Really Won?" — the rest of the temple hall, drawn
// (LESSON_RULES AM13). The carving and the gold king are in ../hist6Carving.mjs; these are
// the Osiride pillar and the three finds. Every curve is drawn here against fetched
// references; nothing is traced. Zero imports.
//
// REFERENCES (npm run ref, scratchpad/ref/g2*):
//   g2osiride-2  the great hall at Abu Simbel (CC0): Ramesses standing against each square
//                pillar, arms crossed on his chest with the crook and the flail, the
//                nemes headcloth falling to his shoulders, the false beard, a pleated kilt
//                with an apron, legs together, feet on a block; the pillar behind him
//                carved with columns of signs down each side.
//   g2osiride-3  the same hall from the side: the double crown standing tall over the
//                nemes, the statues a little over twice a person's height.
//   g2osiride-1  the hall lit warm, the sandstone a pale orange where the light falls.
//   g2tablet-*, g2frag-*, g2card-* — the finds; see beside each drawing.

const OUT = '#5E3A20';        // a statue's edge in torchlight
const PILLAR = '#D5A26B', PILLARS = '#B8854F', PILLARD = '#9C6D3F';
const STONE = '#E7BA83', STONES = '#C9955F', STONED = '#A87645', LIT = '#F6D7A7';
const BLUE = '#3E6290', RED = '#A9442D', GOLD = '#C6993F', WHITE = '#EFE2C2', WHITES = '#D6C49D';
const f2 = (n) => Number(n.toFixed(2));
const fill = (d, c, w = 1, s = OUT) => `<path d="${d}" fill="${c}" stroke="${s}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"/>`;
const tone = (d, c, o = 1) => `<path d="${d}" fill="${c}"${o < 1 ? ` opacity="${o}"` : ''}/>`;
const line = (d, c, w, o = 1) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"${o < 1 ? ` opacity="${o}"` : ''}/>`;
/** A rounded limb along a centre line, wide at its start and narrower at its end. */
function tube(pts, w0, w1, c) {
  const L = [], R = [];
  for (let k = 0; k < pts.length; k++) {
    const [x, y] = pts[k];
    const [ax, ay] = pts[Math.max(0, k - 1)];
    const [bx, by] = pts[Math.min(pts.length - 1, k + 1)];
    let dx = bx - ax, dy = by - ay;
    const n = Math.hypot(dx, dy) || 1; dx /= n; dy /= n;
    const w = (w0 + (w1 - w0) * (k / (pts.length - 1))) / 2;
    L.push([x - dy * w, y + dx * w]); R.push([x + dy * w, y - dx * w]);
  }
  const all = [...L, ...R.reverse()];
  return fill(`M${all.map(([x, y]) => `${f2(x)},${f2(y)}`).join(' L')} Z`, c, 1);
}
const rect = (x, y, w, h, c, o = 1) => `<rect x="${f2(x)}" y="${f2(y)}" width="${f2(w)}" height="${f2(h)}" fill="${c}"${o < 1 ? ` opacity="${o}"` : ''}/>`;

// ── the Osiride pillar ───────────────────────────────────────────────────────
// Scene units: the pillar stands 324–400 × 262–476 (the box hi6Osiris filled), the king
// centred on x 362, his crown's top at 268, his feet on a block at 462–476.
export function osiride() {
  const o = [];
  const CX = 362;
  // the square pillar behind him, its right side turning away from the light
  o.push(fill('M325,262 L400,262 L400,476 L325,476 Z', PILLAR, 1.1));
  o.push(rect(392, 262, 8, 214, PILLARS));
  o.push(rect(325.6, 262.6, 2.2, 213, LIT, 0.55));
  // columns of signs down both flanks, cut into the stone: small marks in a rule
  const glyphs = (x0, x1) => {
    const g = [line(`M${x0},266 L${x0},472 M${x1},266 L${x1},472`, PILLARD, 0.6)];
    const cx = (x0 + x1) / 2;
    for (let k = 0; k < 15; k++) {
      const y = 272 + k * 13.4;
      const kind = k % 5;
      if (kind === 0) g.push(`<ellipse cx="${cx}" cy="${y}" rx="2.4" ry="1.7" fill="none" stroke="${PILLARD}" stroke-width="0.7"/>`);
      else if (kind === 1) g.push(line(`M${cx - 2.6},${y + 1.4} L${cx + 2.6},${y + 1.4} M${cx - 1.2},${y - 2} L${cx - 1.2},${y + 1.4}`, PILLARD, 0.7));
      else if (kind === 2) g.push(line(`M${cx - 2.6},${y} C${cx - 1.2},${y - 2.6} ${cx + 1.2},${y + 2.6} ${cx + 2.6},${y}`, PILLARD, 0.7));
      else if (kind === 3) g.push(`<path d="M${cx - 2.4},${y + 2} L${cx},${y - 2.4} L${cx + 2.4},${y + 2} Z" fill="none" stroke="${PILLARD}" stroke-width="0.7" stroke-linejoin="round"/>`);
      else g.push(line(`M${cx},${y - 2.4} L${cx},${y + 2.4} M${cx - 2},${y - 0.6} L${cx + 2},${y - 0.6}`, PILLARD, 0.7));
    }
    return g.join('');
  };
  o.push(glyphs(327.5, 335.5));
  o.push(glyphs(389.5, 397.5));
  // the block he stands on
  o.push(fill('M339,462 L387,462 L387,476 L339,476 Z', STONES, 1));
  o.push(rect(339.6, 462.6, 46.8, 1.8, LIT, 0.6));
  o.push(rect(380, 463, 6.4, 12.4, STONED, 0.6));

  // legs together, the feet side by side on the block
  o.push(fill(`M${CX - 12},418 L${CX - 1},418 L${CX - 1.6},456 L${CX - 11},456 Z`, STONE, 1));
  o.push(fill(`M${CX + 1},418 L${CX + 12},418 L${CX + 11},456 L${CX + 1.6},456 Z`, STONE, 1));
  o.push(tone(`M${CX + 7},418 L${CX + 12},418 L${CX + 11},456 L${CX + 7.4},456 Z`, STONES));
  o.push(line(`M${CX - 6.4},432 C${CX - 5.4},434 ${CX - 5.4},437 ${CX - 6.4},439 M${CX + 6.4},432 C${CX + 5.4},434 ${CX + 5.4},437 ${CX + 6.4},439`, STONED, 0.7));
  o.push(fill(`M${CX - 13},455 C${CX - 13},461.6 ${CX - 1},461.6 ${CX - 1},455 Z`, STONE, 1));
  o.push(fill(`M${CX + 1},455 C${CX + 1},461.6 ${CX + 13},461.6 ${CX + 13},455 Z`, STONE, 1));
  o.push(tone(`M${CX + 8},456 C${CX + 11},456 ${CX + 12.6},458 ${CX + 12},460.2 L${CX + 8},460.4 Z`, STONES));

  // the kilt: a pleated wrap from the belt to the knee, the apron standing out in front
  o.push(fill(`M${CX - 16},384 L${CX + 16},384 L${CX + 18},420 C${CX + 6},423 ${CX - 6},423 ${CX - 18},420 Z`, STONE, 1));
  o.push(tone(`M${CX + 8},384 L${CX + 16},384 L${CX + 18},420 C${CX + 14},421 ${CX + 11},421.6 ${CX + 8},421.8 Z`, STONES));
  for (let k = -3; k <= 3; k++) o.push(line(`M${CX + k * 4.2},389 L${CX + k * 4.9},419`, STONED, 0.45, 0.7));
  o.push(fill(`M${CX - 7},387 L${CX + 7},387 L${CX + 9},418 L${CX - 9},418 Z`, LIT, 0.9));
  o.push(tone(`M${CX + 3},387 L${CX + 7},387 L${CX + 9},418 L${CX + 4},418 Z`, WHITES));
  for (const y of [394, 401, 408]) o.push(line(`M${CX - 6.6},${y} L${CX + 6.6},${y}`, GOLD, 0.8, 0.8));
  // the belt, with a little of its paint
  o.push(fill(`M${CX - 16.4},380 L${CX + 16.4},380 L${CX + 16.4},386.4 L${CX - 16.4},386.4 Z`, STONES, 0.9));
  for (let k = -3; k <= 3; k++) o.push(rect(CX + k * 4.6 - 1, 381.4, 2, 3.6, k % 2 ? BLUE : RED, 0.55));

  // the torso, under crossed arms
  o.push(fill(`M${CX - 21},346 C${CX - 22},360 ${CX - 18},374 ${CX - 15},382 L${CX + 15},382 C${CX + 18},374 ${CX + 22},360 ${CX + 21},346 Z`, STONE, 1));
  o.push(tone(`M${CX + 9},346 L${CX + 21},346 C${CX + 22},360 ${CX + 18},374 ${CX + 15},382 L${CX + 9},382 Z`, STONES));
  // the broad collar across the shoulders: rows of beads, the last of the blue
  o.push(fill(`M${CX - 21},346 C${CX - 14},356 ${CX + 14},356 ${CX + 21},346 C${CX + 12},350 ${CX - 12},350 ${CX - 21},346 Z`, STONE, 0.8));
  o.push(line(`M${CX - 17},348.6 C${CX - 9},354.6 ${CX + 9},354.6 ${CX + 17},348.6`, BLUE, 1.3, 0.7));
  o.push(line(`M${CX - 14},351 C${CX - 7},356 ${CX + 7},356 ${CX + 14},351`, GOLD, 1, 0.75));

  // the arms, crossed on the chest: upper arms down the sides, forearms meeting in an X,
  // a fist at each shoulder holding the crook (his right) and the flail (his left)
  o.push(fill(`M${CX - 25},347 C${CX - 28},356 ${CX - 27},366 ${CX - 23},373 L${CX - 16},371 C${CX - 18},363 ${CX - 18},354 ${CX - 16},348 Z`, STONE, 1));
  o.push(fill(`M${CX + 25},347 C${CX + 28},356 ${CX + 27},366 ${CX + 23},373 L${CX + 16},371 C${CX + 18},363 ${CX + 18},354 ${CX + 16},348 Z`, STONES, 1));
  // forearms: rounded, a little narrower at the wrist, crossing just under the fists
  o.push(tube([[CX + 20.6, 371], [CX + 6, 362.6], [CX - 6.4, 356.4]], 8.2, 6.4, STONES));
  o.push(tube([[CX - 20.6, 371], [CX - 6, 362.6], [CX + 6.4, 356.4]], 8.2, 6.4, STONE));
  o.push(line(`M${CX - 19},368.4 L${CX - 6},361.4`, LIT, 0.8, 0.8));
  // the crook: its staff over his right fist, its hook curling up beside the shoulder
  o.push(line(`M${CX + 2},368 L${CX - 15},344 C${CX - 18},339 ${CX - 22},339 ${CX - 22.6},343.4`, OUT, 3));
  o.push(line(`M${CX + 2},368 L${CX - 15},344 C${CX - 18},339 ${CX - 22},339 ${CX - 22.6},343.4`, GOLD, 1.8));
  o.push(line(`M${CX - 4},359.4 L${CX - 2},362.4 M${CX - 8.6},352.6 L${CX - 6.6},355.6`, BLUE, 1.2));
  // the flail: its handle over his left fist, three strands hanging over the shoulder
  o.push(line(`M${CX - 2},368 L${CX + 14},344`, OUT, 2.8));
  o.push(line(`M${CX - 2},368 L${CX + 14},344`, GOLD, 1.6));
  for (const dx of [0, 2.6, 5.2]) o.push(line(`M${CX + 14},344 C${CX + 17 + dx},346 ${CX + 19 + dx},352 ${CX + 19 + dx * 0.8},358`, GOLD, 1, 0.95));
  // the fists, over the crossing
  o.push(`<ellipse cx="${CX + 6}" cy="${355.4}" rx="4.2" ry="3.6" fill="${STONE}" stroke="${OUT}" stroke-width="0.9"/>`);
  o.push(`<ellipse cx="${CX - 6}" cy="${355.4}" rx="4.2" ry="3.6" fill="${STONE}" stroke="${OUT}" stroke-width="0.9"/>`);

  // the nemes headcloth: wings either side of the face, lappets to the collar, stripes
  o.push(fill(`M${CX - 13},316 C${CX - 19},322 ${CX - 20},332 ${CX - 18},338 L${CX - 15},350 L${CX - 9},350 L${CX - 8},326 Z`, STONE, 1));
  o.push(fill(`M${CX + 13},316 C${CX + 19},322 ${CX + 20},332 ${CX + 18},338 L${CX + 15},350 L${CX + 9},350 L${CX + 8},326 Z`, STONES, 1));
  for (const y of [324, 330, 336, 342]) {
    o.push(line(`M${CX - 17.6},${y} L${CX - 9.2},${y + 1}`, BLUE, 0.9, 0.55));
    o.push(line(`M${CX + 17.6},${y} L${CX + 9.2},${y + 1}`, BLUE, 0.9, 0.55));
  }
  // the face: brow, the line of the eyes in paint, the nose, a calm mouth
  o.push(fill(`M${CX - 8.6},318 L${CX + 8.6},318 C${CX + 9.4},326 ${CX + 8.6},334 ${CX + 5},339 L${CX - 5},339 C${CX - 8.6},334 ${CX - 9.4},326 ${CX - 8.6},318 Z`, STONE, 1));
  o.push(tone(`M${CX + 3.4},318 L${CX + 8.6},318 C${CX + 9.4},326 ${CX + 8.6},334 ${CX + 5},339 L${CX + 2},339 Z`, STONES));
  o.push(line(`M${CX - 6.6},325.6 L${CX - 2.4},325.2 M${CX + 2.4},325.2 L${CX + 6.6},325.6`, OUT, 1.1));
  o.push(line(`M${CX - 6.4},325.6 L${CX - 7.8},326.8 M${CX + 6.4},325.6 L${CX + 7.8},326.8`, OUT, 0.7));
  o.push(line(`M${CX},326 L${CX - 1},332 L${CX + 1.2},332.6`, STONED, 0.7));
  o.push(line(`M${CX - 2.6},335.4 C${CX - 1},336.2 ${CX + 1},336.2 ${CX + 2.6},335.4`, OUT, 0.7));
  // the false beard, square-ended, under the chin
  o.push(fill(`M${CX - 2.6},338.6 L${CX + 2.6},338.6 L${CX + 2.2},347.4 L${CX - 2.2},347.4 Z`, STONES, 0.9));
  for (const y of [341, 343.6, 346]) o.push(line(`M${CX - 2.3},${y} L${CX + 2.3},${y}`, STONED, 0.45));
  // the headcloth's band across the brow
  o.push(fill(`M${CX - 12.6},314 L${CX + 12.6},314 L${CX + 13},319 L${CX - 13},319 Z`, STONE, 0.9));
  o.push(rect(CX - 12, 315.4, 24, 1.4, BLUE, 0.55));
  // the double crown: the red crown's low back and curl, the tall white crown in it
  o.push(fill(`M${CX - 13},314 L${CX - 12},298 L${CX + 3},298 L${CX + 4},290 L${CX + 13},288 L${CX + 13},314 Z`, RED, 1));
  o.push(tone(`M${CX + 7},289 L${CX + 13},288 L${CX + 13},314 L${CX + 7},314 Z`, '#8C3622'));
  o.push(line(`M${CX - 10},298 C${CX - 16},294 ${CX - 15},287 ${CX - 10.4},287.6`, RED, 1.4));
  o.push(fill(`M${CX - 9},300 C${CX - 10},286 ${CX - 8},272 ${CX - 3},268.4 C${CX},266.6 ${CX + 3.4},267.8 ${CX + 4.6},270.6 C${CX + 7},278 ${CX + 7.4},290 ${CX + 7},300 Z`, WHITE, 1));
  o.push(tone(`M${CX + 1},268 C${CX + 3.4},267.8 ${CX + 4.6},270.6 ${CX + 4.6},270.6 C${CX + 7},278 ${CX + 7.4},290 ${CX + 7},300 L${CX + 2},300 Z`, WHITES));
  o.push(`<ellipse cx="${CX - 3}" cy="268.6" rx="2.4" ry="1.8" fill="${WHITE}" stroke="${OUT}" stroke-width="0.8"/>`);
  o.push(line(`M${CX - 6},284 C${CX - 5.6},278 ${CX - 4.4},274 ${CX - 2.6},271.6`, LIT, 0.9, 0.8));
  // the uraeus at the brow
  o.push(line(`M${CX},314.4 C${CX - 1.6},312 ${CX - 0.8},309.6 ${CX + 0.6},310`, GOLD, 1.4));
  return o.join('');
}

// ── the finds in the tray ────────────────────────────────────────────────────
// Each is drawn in the frame its shape-built object had, about the point where it stands
// in the sand (0, 0 at its foot in the sand), so it rides the same rider and moves as it
// did: the carved fragment 44 × 36, the treaty tablet 40 × 36, the postcard 37 × 28.

/** A fragment of painted relief: a king's head in the blue crown, broken off a wall. */
// REFERENCE g2frag-*: a sandstone relief fragment — an irregular slab, its broken edges
// stepped, a raised profile head in the blue war crown, the paint worn, a column of signs.
export function fragment() {
  const S = '#D9AE7A', SS = '#B98D5C', SD = '#8E6539', SKIN = '#B4572F', SKINS = '#8C4022';
  const o = [];
  // the slab, broken on top and at its right edge, standing on its foot in the sand
  o.push(fill('M-20,0 L-20,-27 L-15,-30 L-9,-28.6 L-4,-33 L1,-29 L6,-31.4 L9,-27 L15,-27.6 L19,-23 L18,-15 L20.4,-9 L19,0 Z', S, 1, '#4A2E18'));
  o.push(tone('M13,-27.6 L15,-27.6 L19,-23 L18,-15 L20.4,-9 L19,0 L13,0 Z', SS));
  o.push(tone('M-19.4,-26.6 L-15,-29.4 L-9,-28 L-4,-32.2 L-4,-30 L-9,-26.6 L-15,-28 L-19.4,-25 Z', '#F0CB98'));
  // a sunk ground round the figure, the figure raised out of it
  o.push(tone('M-16,-3 L-16,-24 L6,-24 L6,-3 Z', SS, 0.55));
  // the king's head in profile, facing right: the blue crown, the face, the ear, a collar
  o.push(fill('M-9,-14 C-9,-20 -6.6,-23.4 -2.4,-24.2 C2,-25 5,-22.4 5,-18.4 C5,-16.4 3.8,-15 2.2,-14.6 L-9,-14 Z', '#3667A7', 0.8, '#4A2E18'));
  o.push(tone('M-6.6,-21.6 C-4.4,-23 -1.6,-23.4 0.6,-22.8 C-1.6,-22 -4.4,-21.4 -6.6,-20.4 Z', '#6E93C4'));
  for (const [x, y] of [[-4, -19], [-1, -20], [1.8, -18.6], [-2.6, -16.6]]) o.push(`<circle cx="${x}" cy="${y}" r="0.7" fill="#E4C76A"/>`);
  o.push(fill('M-2,-14.8 L3.4,-15 C4.8,-13.6 6.6,-12.6 6.4,-11 L5,-10.4 L5.6,-8.6 L4.2,-7.6 L4.6,-5.6 C2.6,-4.4 0,-4.6 -1.4,-5.2 Z', SKIN, 0.8, '#4A2E18'));
  o.push(tone('M2.6,-14.6 C4.4,-13.2 6.4,-12.6 6.2,-11.2 L4.6,-10.6 Z', SKINS));
  o.push(line('M0.6,-12 L3.4,-12', '#2B2420', 0.8));
  o.push(`<ellipse cx="-1.6" cy="-11.4" rx="1.3" ry="1.8" fill="${SKINS}"/>`);
  o.push(fill('M-6,-4.4 C-3,-6.2 3,-6.2 6,-3.6 L5,-2 C2,-4 -2,-4 -5,-2.4 Z', '#D9A93C', 0.6, '#4A2E18'));
  // a column of signs on the right, in its own rules
  o.push(line('M9,-24 L9,-3 M16,-24 L16,-3', SD, 0.6));
  o.push(`<ellipse cx="12.5" cy="-20" rx="2" ry="1.4" fill="none" stroke="${SD}" stroke-width="0.7"/>`);
  o.push(line('M10.4,-14.6 L14.6,-14.6 M11.4,-17 L11.4,-14.6', SD, 0.7));
  o.push(line('M10.4,-9.6 C11.6,-11.6 13.4,-7.6 14.6,-9.6', SD, 0.7));
  o.push('<path d="M10.6,-4.4 L12.5,-7.4 L14.4,-4.4 Z" fill="none" stroke="' + SD + '" stroke-width="0.7" stroke-linejoin="round"/>');
  // a crack running down from the break
  o.push(line('M-4,-33 L-6,-27 L-3.6,-22', SD, 0.6));
  return o.join('');
}

/** The treaty: a clay tablet in cuneiform, its corners rounded by handling, a crack across. */
// REFERENCE g2tablet-*: the Egyptian-Hittite peace treaty tablet (Istanbul Archaeology
// Museum): a thick slab of pinkish clay, softly rounded, packed with tiny wedge-shaped
// signs in ruled lines, one corner chipped away, a crack across it.
export function treaty() {
  const C = '#CDA290', CS = '#A97F6D', CD = '#7C584A', CL = '#E4C2B2';
  const o = [];
  // the tablet stands on its foot in the sand, a little thick: a face and its right edge
  o.push(fill('M-17,-1 C-18.6,-1 -19,-2.6 -19,-4 L-19,-29 C-19,-31.6 -17.4,-33 -15,-33 L11.6,-33 L15.4,-29 L16.4,-3.4 C16.4,-1.6 15,-1 13.6,-1 Z', C, 1, '#4A2E18'));
  o.push(fill('M15.4,-29 L17.8,-27 L18.6,-5 C18.6,-2.6 17.4,-1.2 15.6,-1.2 L16.4,-3.4 Z', CS, 0.9, '#4A2E18'));
  o.push(tone('M-17.4,-31.6 C-16.4,-32.4 -15.4,-32.6 -14,-32.6 L10.6,-32.6 L10.2,-31.4 L-14,-31.4 C-16,-31.4 -17,-30.8 -17.4,-30.2 Z', CL));
  // the chipped top corner, and a crack running down from it
  o.push(tone('M11.6,-33 L15.4,-29 L11,-28 Z', CS));
  o.push(line('M11,-28 L7.4,-22 L9,-17 L5.6,-11.6', CD, 0.8));
  // ruled lines of tiny wedges: short strokes with a triangular head
  for (let r = 0; r < 7; r++) {
    const y = -28.4 + r * 3.9;
    o.push(line(`M-16.4,${f2(y + 1.6)} L13.6,${f2(y + 1.6)}`, CS, 0.35, 0.8));
    for (let k = 0; k < 9; k++) {
      const x = -15.2 + k * 3.25 + ((r * 7 + k * 3) % 4) * 0.25;
      if ((r * 5 + k * 2) % 7 === 6) continue;
      const v = (r + k) % 3;
      if (v === 0) o.push(`<path d="M${f2(x)},${f2(y - 0.6)} L${f2(x + 1.2)},${f2(y - 0.6)} L${f2(x + 0.6)},${f2(y + 0.3)} Z M${f2(x + 0.6)},${f2(y + 0.3)} L${f2(x + 0.6)},${f2(y + 1.2)}" fill="${CD}" stroke="${CD}" stroke-width="0.35"/>`);
      else if (v === 1) o.push(`<path d="M${f2(x)},${f2(y - 0.6)} L${f2(x)},${f2(y + 0.6)} L${f2(x + 0.9)},${f2(y)} Z M${f2(x + 0.9)},${f2(y)} L${f2(x + 2)},${f2(y)}" fill="${CD}" stroke="${CD}" stroke-width="0.35"/>`);
      else o.push(`<path d="M${f2(x)},${f2(y - 0.7)} L${f2(x + 1)},${f2(y - 0.7)} L${f2(x + 0.5)},${f2(y + 0.1)} Z M${f2(x + 1.4)},${f2(y - 0.5)} L${f2(x + 2.2)},${f2(y + 0.4)}" fill="${CD}" stroke="${CD}" stroke-width="0.35"/>`);
    }
  }
  return o.join('');
}

/** A holiday postcard of the temple's front: four seated colossi under a blue sky. */
// REFERENCE g2card-*: the great temple's façade — four seated colossi in the cliff, the
// doorway between the middle pair, a cornice of baboons along the top — under a hard blue
// sky; a postcard's white border, a little curl at its corner.
export function postcard() {
  const SKY = '#A9D3EE', SKYS = '#72AAD6', ROCK = '#D8A86A', ROCKS = '#B9884F', ROCKD = '#8F6234', PAPER = '#FBF7EE', PAPERS = '#E1D9C8';
  const o = [];
  // the card, standing in the sand on its foot, its top corner curling toward us
  o.push(fill('M-17.4,0 L-17.4,-26 L14.6,-26 L17.4,-23.2 L17.4,0 Z', PAPER, 1, '#4A2E18'));
  o.push(fill('M14.6,-26 L17.4,-23.2 L14.2,-22.6 Z', PAPERS, 0.6, '#4A2E18'));
  // the picture inside its white border
  o.push(`<rect x="-15.2" y="-23.6" width="30.4" height="21.6" fill="${SKY}"/>`);
  o.push(`<rect x="-15.2" y="-23.6" width="30.4" height="6" fill="${SKYS}" opacity="0.55"/>`);
  o.push(`<circle cx="10.4" cy="-19.4" r="2" fill="#F5D467"/>`);
  // the cliff and the façade cut into it
  o.push(tone('M-15.2,-2 L-15.2,-14 L-12,-16 L12,-16 L15.2,-13.6 L15.2,-2 Z', ROCK));
  o.push(tone('M9,-16 L12,-16 L15.2,-13.6 L15.2,-2 L9,-2 Z', ROCKS));
  o.push(rect(-12, -16, 24, 1.4, ROCKD, 0.7));
  // the four seated kings: a crowned head, a body, the knees, between them the door
  for (const x of [-9.2, -3.6, 3.6, 9.2]) {
    o.push(`<rect x="${f2(x - 1.6)}" y="-14.2" width="3.2" height="3.4" rx="1" fill="${ROCKS}" stroke="${ROCKD}" stroke-width="0.4"/>`);
    o.push(`<rect x="${f2(x - 2.2)}" y="-10.8" width="4.4" height="5.4" rx="0.8" fill="${ROCK}" stroke="${ROCKD}" stroke-width="0.4"/>`);
    o.push(`<rect x="${f2(x - 2.4)}" y="-5.6" width="4.8" height="3.6" fill="${ROCKS}" stroke="${ROCKD}" stroke-width="0.4"/>`);
  }
  o.push(`<rect x="-1.2" y="-8.6" width="2.4" height="6.6" fill="${ROCKD}"/>`);
  // the sand in front
  o.push(`<rect x="-15.2" y="-3.2" width="30.4" height="1.2" fill="#EBD3A4"/>`);
  return o.join('');
}

export const ART = [
  // replaces hi6Osiris(362, 369, 76, 214): the pillar 324–400 × 262–476
  { name: 'hist6-osiride', svg: osiride, view: { x: 324, y: 262, w: 76, h: 214 }, box: { x: 324, y: 262, w: 76, h: 214 } },
  // the finds, each about its foot in the sand: hi6Fragment(0, -18, 44, 36),
  // hi6Treaty(0, -18, 40, 36) and hi6Postcard(0, -14, 37, 28)
  { name: 'hist6-fragment', svg: fragment, view: { x: -22, y: -36, w: 44, h: 36 }, box: { x: -22, y: -36, w: 44, h: 36 } },
  { name: 'hist6-treaty', svg: treaty, view: { x: -20, y: -36, w: 40, h: 36 }, box: { x: -20, y: -36, w: 40, h: 36 } },
  { name: 'hist6-postcard', svg: postcard, view: { x: -18.5, y: -28, w: 37, h: 28 }, box: { x: -18.5, y: -28, w: 37, h: 28 } },
];
