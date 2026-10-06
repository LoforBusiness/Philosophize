// economics-foundations-4, "Why Do People Trade?" — TWO BACK GARDENS OVER A LOW FENCE.
// The things on its stage that cannot be built from boxes (LESSON_RULES AM13): the apple
// tree over the back hedge, the clipped privet hedge, her two staked tomato plants, a
// ripe tomato, and the hens. Each takes the box the shape-built object it replaces had,
// so nothing on the stage moves. Flat fills lit from the top left, a shaded side, one
// dark outline. Zero imports.

const INK = '#2B2420';
const fill = (d, c, w) => `<path d="${d}" fill="${c}" stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"/>`;
const tone = (d, c, o = 1) => `<path d="${d}" fill="${c}"${o < 1 ? ` opacity="${o}"` : ''}/>`;
const line = (d, c, w) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const f2 = (v) => v.toFixed(2);

/** A small seeded random, so a drawing is the same every time it is baked. */
function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * A leafy mass with a SCALLOPED edge: points round an ellipse, each joined to the next by a
 * curve bowed outward, so the outline is a run of rounded leaf clumps rather than a smooth
 * oval (the reference's crown, and every hedge's top).
 */
function scallop(cx, cy, rx, ry, n, bulge, seed, a0 = 0) {
  const r = rng(seed);
  const pts = [];
  for (let k = 0; k < n; k++) {
    const a = a0 + (k / n) * Math.PI * 2 + (r() - 0.5) * (Math.PI / n) * 0.6;
    const j = 0.9 + r() * 0.2;
    pts.push([cx + Math.cos(a) * rx * j, cy + Math.sin(a) * ry * j]);
  }
  let d = `M${f2(pts[0][0])},${f2(pts[0][1])}`;
  for (let k = 0; k < n; k++) {
    const [ax, ay] = pts[k];
    const [bx, by] = pts[(k + 1) % n];
    const mx = (ax + bx) / 2, my = (ay + by) / 2;
    const ox = mx - cx, oy = my - cy;
    const L = Math.hypot(ox, oy) || 1;
    const seg = Math.hypot(bx - ax, by - ay);
    const b = seg * bulge * (0.8 + r() * 0.5);
    d += ` Q${f2(mx + (ox / L) * b)},${f2(my + (oy / L) * b)} ${f2(bx)},${f2(by)}`;
  }
  return `${d} Z`;
}

// ── the apple tree over the back hedge ──────────────────────────────────────
// REFERENCE (Commons: "Garden apple tree in Nuthurst, West Sussex" and "Apple tree, Easton
// Lodge Gardens walled garden"): a garden apple tree is a SHORT trunk that forks low into
// two or three boughs, under a broad, rounded crown that is ONE leafy mass with a lumpy
// edge — lit clumps on its upper left, darker clumps under it on the right, a few gaps
// where the boughs show through — and red apples hanging in small groups.
// Its box was gardenTree(140, 372, 150, 148): 65–215 × 298–446, the hedge in front of
// everything under y 404.
export function appleTree() {
  const o = '1.3';
  const BARK = '#7A5A3C', BARKD = '#5A4029', BARKL = '#98764F';
  const LEAF = '#5C8B3A', LEAFD = '#3F6A28', LEAFDD = '#2F5220', LEAFL = '#7FAE52';
  const APPLE = '#C8382B', APPLED = '#962719';
  const crown = scallop(75, 50, 70, 44, 15, 0.32, 11, -Math.PI / 2);
  // the clumps inside the crown: shade lower right, light upper left
  const shade = [[100, 66, 34, 20, 3], [56, 72, 30, 16, 5], [118, 46, 18, 14, 7], [82, 82, 36, 12, 9]];
  const lit = [[46, 30, 28, 17, 13], [82, 22, 24, 14, 17], [30, 52, 16, 12, 19], [70, 44, 18, 11, 23]];
  const apples = [[40, 64], [46, 67], [96, 78], [102, 76], [118, 60], [62, 40], [108, 34], [26, 46]];
  return [
    // trunk and the two boughs it forks into, reaching up into the crown
    fill('M66,148 C68,128 68,114 64,98 C60,88 52,80 44,74 L50,70 C58,76 66,84 72,92 C76,82 84,74 94,68 L98,73 '
      + 'C88,80 80,90 78,102 C76,118 78,132 82,148 Z', BARK, o),
    tone('M76,148 C74,132 72,116 76,102 C78,92 86,82 96,72 L98,73 C88,80 80,90 78,102 C76,118 78,132 82,148 Z', BARKD),
    line('M68,140 C69,128 69,118 67,106', BARKL, '1'),
    line('M58,92 C54,84 48,78 40,74', BARK, '3'), line('M80,92 C86,84 94,78 104,74', BARK, '3'),
    // the crown
    fill(crown, LEAF, o),
    ...shade.map(([x, y, rx, ry, s]) => tone(scallop(x, y, rx, ry, 9, 0.3, s), LEAFD)),
    tone(scallop(96, 84, 30, 8, 8, 0.3, 29), LEAFDD),
    ...lit.map(([x, y, rx, ry, s]) => tone(scallop(x, y, rx, ry, 8, 0.3, s), LEAFL)),
    // the crown's own lower edge, deepest in shade where it meets the trunk
    tone(scallop(76, 86, 22, 6, 7, 0.3, 31), LEAFDD),
    // the apples, in small groups, lit top-left
    ...apples.map(([x, y]) => fill(`M${x - 3.2},${y} a3.2,3.4 0 1,0 6.4,0 a3.2,3.4 0 1,0 -6.4,0 Z`, APPLE, '0.8')
      + tone(`M${x + 0.2},${y + 3.2} a3,3 0 0,0 2.8,-3.6 a3.6,3.6 0 0,1 -2.8,3.6 Z`, APPLED)
      + `<circle cx="${x - 1.2}" cy="${y - 1.2}" r="0.9" fill="#F2B3A6"/>`),
  ].join('');
}

// ── the clipped privet hedge at the back of both gardens ────────────────────
// REFERENCE (Commons: "Ligustrum hedge, Lanai City"; the box hedges in "Apple tree,
// Easton Lodge Gardens"): a clipped hedge is a long block of dense small leaves, its top
// cut FLAT but leafy at the edge, its upper corners rounded off, the front face mottled
// with lit and shaded clumps of leaves, darker underneath where the clipping stops and
// the stems show near the ground.
// Its box was gardenHedge(200, 452, 400, 96): 0–400 × 404–500.
export function privetHedge() {
  const o = '1.2';
  const H = '#8DB262', HD = '#6F9149', HDD = '#55753A', HL = '#A9CB7C', STEM = '#6A5238';
  const r = rng(4242);
  // the top edge, cut flat but leafy: small bumps along it
  let top = 'M0,100 L0,12';
  for (let x = 0; x < 400; x += 8) {
    const b = 2.2 + r() * 2.2;
    top += ` Q${f2(x + 4)},${f2(8 - b)} ${f2(x + 8)},${f2(8 + (r() - 0.5) * 1.2)}`;
  }
  top += ' L400,100 Z';
  const clumps = [];
  for (let row = 0; row < 7; row++) {
    for (let k = 0; k < 30; k++) {
      const x = k * 14 + (row % 2) * 7 + (r() - 0.5) * 5;
      const y = 16 + row * 11 + (r() - 0.5) * 4;
      const w = 4 + r() * 3.4;
      const h = 2.4 + r() * 1.6;
      const c = r() < 0.5 ? HL : HD;
      if (row > 4 && c === HL) continue;
      clumps.push(tone(`M${f2(x - w)},${f2(y)} Q${f2(x - w * 0.4)},${f2(y - h * 1.6)} ${f2(x)},${f2(y - h * 0.4)} `
        + `Q${f2(x + w * 0.5)},${f2(y - h * 1.5)} ${f2(x + w)},${f2(y)} Q${f2(x)},${f2(y + h * 0.7)} ${f2(x - w)},${f2(y)} Z`, c, row > 4 ? 0.9 : 0.85));
    }
  }
  const stems = [];
  for (let x = 6; x < 400; x += 11 + r() * 6) {
    stems.push(line(`M${f2(x)},100 L${f2(x + (r() - 0.5) * 4)},${f2(88 - r() * 4)}`, STEM, '1.1'));
  }
  return [
    fill(top, H, o),
    // the shaded lower third, under the clipped face
    tone('M0,70 C80,74 200,72 400,70 L400,100 L0,100 Z', HD),
    tone('M0,86 C100,88 300,88 400,86 L400,100 L0,100 Z', HDD),
    ...stems,
    ...clumps,
    // the lit top, where the shears cut
    tone('M0,12 L400,12 L400,17 C300,18 100,18 0,17 Z', HL, 0.9),
  ].join('');
}

// ── the staked tomato plant ─────────────────────────────────────────────────
// REFERENCE (Commons: "Ripe tomato on tomato plant in home garden"; "Organic home-grown
// tomatoes - unripe to ripe"): a tomato tied to a bamboo CANE, the main stem climbing
// beside it; side shoots that reach out and droop at their ends under COMPOUND leaves —
// a tip leaflet and pairs of broad, pointed, toothed leaflets, blue-green, paler under —
// and TRUSSES on bent stalks hanging fruit in a cluster, ripe red beside hard green, each
// tomato round and a little flattened with a green star of a calyx.
// 44 × 82 real units, the soil at y 82, the cane at x 22 (as tomatoPlant was). `pick`
// leaves off the two ripe tomatoes on its right at TOMATO_PICK (34, 44) and (36.5, 57),
// which the scene draws as things a hand takes; `flip` mirrors it.
function leaflet(x, y, len, wid, ang, c) {
  // one pointed, toothed leaflet from its base at (x, y)
  const a = (ang * Math.PI) / 180;
  const ux = Math.cos(a), uy = Math.sin(a), nx = -uy, ny = ux;
  const P = (s, t) => `${f2(x + ux * s + nx * t)},${f2(y + uy * s + ny * t)}`;
  return fill(`M${P(0, 0)} Q${P(len * 0.3, wid * 0.62)} ${P(len * 0.55, wid * 0.5)} L${P(len * 0.6, wid * 0.62)} `
    + `Q${P(len * 0.8, wid * 0.4)} ${P(len, 0)} Q${P(len * 0.8, -wid * 0.4)} ${P(len * 0.6, -wid * 0.62)} `
    + `L${P(len * 0.55, -wid * 0.5)} Q${P(len * 0.3, -wid * 0.62)} ${P(0, 0)} Z`, c, '0.45')
    + line(`M${P(len * 0.1, 0)} L${P(len * 0.8, 0)}`, '#3F6A2E', '0.3');
}
/** A compound leaf: a midrib from (x, y) at `ang`, a tip leaflet and two pairs on it. */
function compound(x, y, ang, s, lit) {
  const a = (ang * Math.PI) / 180;
  const ux = Math.cos(a), uy = Math.sin(a);
  const L = 11 * s;
  const C = lit ? '#6E9E4C' : '#588540';
  const parts = [line(`M${f2(x)},${f2(y)} L${f2(x + ux * L)},${f2(y + uy * L)}`, '#4E7A36', f2(0.7 * s))];
  for (const [t, side] of [[0.38, 1], [0.38, -1], [0.7, 1], [0.7, -1]]) {
    parts.push(leaflet(x + ux * L * t, y + uy * L * t, 5.2 * s, 2.6 * s, ang + side * 52, side > 0 ? C : '#4E7A36'));
  }
  parts.push(leaflet(x + ux * L, y + uy * L, 6.2 * s, 3 * s, ang, C));
  return parts.join('');
}
function tomato(x, y, ripe, s = 1) {
  const R = ripe ? '#D23A2A' : '#9CBF5A', RD = ripe ? '#A32B1F' : '#7A9C42', RL = ripe ? '#F08A6E' : '#C9DE92';
  const rx = 3 * s, ry = 2.7 * s;
  return [
    fill(`M${f2(x - rx)},${f2(y)} C${f2(x - rx)},${f2(y - ry * 1.2)} ${f2(x + rx)},${f2(y - ry * 1.2)} ${f2(x + rx)},${f2(y)} `
      + `C${f2(x + rx)},${f2(y + ry * 1.25)} ${f2(x - rx)},${f2(y + ry * 1.25)} ${f2(x - rx)},${f2(y)} Z`, R, f2(0.45 * s)),
    tone(`M${f2(x + rx * 0.2)},${f2(y + ry * 1.05)} C${f2(x + rx)},${f2(y + ry)} ${f2(x + rx * 1.05)},${f2(y)} ${f2(x + rx * 0.8)},${f2(y - ry * 0.6)} `
      + `C${f2(x + rx * 0.8)},${f2(y + ry * 0.4)} ${f2(x + rx * 0.5)},${f2(y + ry * 0.8)} ${f2(x + rx * 0.2)},${f2(y + ry * 1.05)} Z`, RD),
    `<ellipse cx="${f2(x - rx * 0.4)}" cy="${f2(y - ry * 0.35)}" rx="${f2(rx * 0.32)}" ry="${f2(ry * 0.22)}" fill="${RL}"/>`,
    // the calyx, a small green star on top
    fill(`M${f2(x)},${f2(y - ry * 0.95)} l${f2(-1.9 * s)},${f2(-0.5 * s)} l${f2(1.4 * s)},${f2(-0.2 * s)} l${f2(0.5 * s)},${f2(-1.1 * s)} `
      + `l${f2(0.5 * s)},${f2(1.1 * s)} l${f2(1.4 * s)},${f2(0.2 * s)} Z`, '#4E7A36', f2(0.25 * s)),
  ].join('');
}
function tomatoPlant(pick) {
  const STEM = '#5C8A3C', CANE = '#C8AC6E', CANED = '#A58A50', TWINE = '#8C6A3E';
  return [
    // the bamboo cane, with its nodes
    fill('M21.1,1.5 L22.9,1.5 L22.9,82 L21.1,82 Z', CANE, '0.45'),
    tone('M22.2,1.5 L22.9,1.5 L22.9,82 L22.2,82 Z', CANED),
    ...[14, 32, 50, 68].map((y) => line(`M21,${y} L23,${y}`, CANED, '0.6')),
    // the main stem, climbing beside the cane
    line('M23.4,82 C24.6,72 22,64 23.6,54 C25,44 22.4,34 23.8,24 C24.6,16 22.8,9 23.2,3', STEM, '1.5'),
    // side shoots, reaching out and drooping
    line('M23.4,70 C19,67 14,68 10,71', STEM, '1.1'),
    line('M23.8,58 C28,55 32,56 36,59', STEM, '1.1'),
    line('M23.2,44 C19,41 14,42 10,45', STEM, '1'),
    line('M23.8,32 C28,29 32,30 35,33', STEM, '1'),
    line('M23.2,20 C19,17 15,17 12,19', STEM, '0.9'),
    // the compound leaves, every one kept inside the plant's own 44 units: the lower ones
    // in shade, the upper lit, the plant a full bush of them rather than a few on a stick
    compound(23, 76, 168, 1.15, false), compound(23, 74, 12, 1.1, false),
    compound(23, 66, 196, 1.05, false), compound(23, 62, -16, 1.1, false),
    compound(23, 54, 160, 1.1, false), compound(23, 50, 20, 1.05, true),
    compound(23, 44, 200, 1.0, true), compound(23, 38, -12, 1.05, true),
    compound(23, 32, 172, 1.0, true), compound(23, 26, 8, 1.0, true),
    compound(23, 20, 200, 0.9, true), compound(23, 15, -22, 0.9, true),
    compound(23, 10, 214, 0.75, true), compound(23, 7, -40, 0.75, true), compound(23, 5, -92, 0.6, true),
    // the trusses: bent stalks with the fruit hanging off them
    line('M23.4,47 C20,48 18,50 17,51', STEM, '0.6'), line('M23.4,73 C20,74 18,75 16,76', STEM, '0.6'),
    line('M23.8,25 C27,26 29,27 30,28', STEM, '0.6'),
    tomato(16, 53, true), tomato(20.8, 55.6, false), tomato(15, 78, true), tomato(19.8, 79, true),
    tomato(29.6, 30, false, 0.9), tomato(33.2, 32.6, false, 0.9),
    ...(pick ? [] : [line('M24,42 C28,42 31,43 33,44', STEM, '0.5'), line('M24,55 C29,55 33,56 35,57', STEM, '0.5'),
      tomato(34, 44.4, true), tomato(36.5, 57.4, true)]),
    // the twine tying the stem to the cane
    line('M20.8,34.5 L25,35.2 M20.8,58.5 L25,59.2', TWINE, '0.7'),
  ].join('');
}
const mirror = (body, w) => `<g transform="translate(${w},0) scale(-1,1)">${body}</g>`;
export const tomatoPlantFull = () => mirror(tomatoPlant(false), 44);
export const tomatoPlantPicked = () => tomatoPlant(true);
/** One ripe tomato, 6 × 6, its middle at (3, 3.4) as tomatoFruit's. */
export const tomatoOne = () => tomato(3, 3.9, true, 0.8);

// ── the hen ─────────────────────────────────────────────────────────────────
// REFERENCE (Commons: "A Brown Hen"; "Lohmann Brown adult hen in homebird-yard"): a hen
// side-on is a plump EGG of a body — full and low in the breast, the back rising to a
// short TAIL of stiff feathers cocked up behind — on an upright NECK whose hackles fall
// over the shoulders, a small head with a serrated red COMB along its crown, a bare red
// face, a red WATTLE under a short hooked yellow BEAK, and a round eye. The folded WING
// is a darker shield on the flank, its flight feathers in layered scallops; the legs come
// out of the fluffy underside near the middle. Real 26 × 22, facing right, feet at y 22,
// the hip at (13, 16): the BODY and the LEGS are separate pictures, so a scene tips the
// body about her hip to peck while her feet stay planted.
const HEN_COL = {
  russet: { B: '#A0522D', D: '#7A3D20', DD: '#5E2C16', L: '#C2733F', T: '#4E2814' },
  white: { B: '#F3EFE4', D: '#D2CBB8', DD: '#B8B09A', L: '#FFFFFF', T: '#E2DCCB' },
};
function henBody(c) {
  const o = '0.5';
  const COMB = '#C9302C', COMBD = '#9C2421', BEAK = '#E3B341';
  return [
    // the tail, cocked up behind: three stiff feathers fanning back
    fill('M10.2,8.4 C9.4,6 8.4,3.4 7,1.4 C5.2,1.6 3.8,3.2 3.6,5.4 C3.4,7.6 4.4,9.6 6,10.8 Z', c.T, o),
    line('M8.6,8.6 C7.8,6.4 6.6,4.2 5.4,2.6 M7,9.6 C6,8 5,6.4 4.2,5', c.DD, '0.35'),
    // the body: full breast, belly, the back rising to the tail
    fill('M9.2,8 C11.6,7.6 14.8,8 17.6,8.2 C20.6,8.6 22.6,10.6 22.4,13.4 C22.2,16.6 19.6,18.8 15.6,19 '
      + 'C12,19.2 8.6,18.4 6.8,16.4 C5.4,14.8 5.2,12.6 5.8,10.8 C6.4,9.4 7.6,8.4 9.2,8 Z', c.B, o),
    // the fluffy underside, in shade
    tone('M6.8,16.4 C8.6,18.4 12,19.2 15.6,19 C19.6,18.8 22.2,16.6 22.4,13.4 C21.4,15.6 19,17 15.4,17.2 C11.8,17.4 8.8,17 6.8,16.4 Z', c.D),
    // the neck, hackles falling over the shoulder
    fill('M16.6,9 C17,6.6 17.8,4.4 18.8,3.2 C20.4,1.8 22.8,2 23.8,3.6 C24.6,5 24.2,6.6 23.4,8 '
      + 'C22.8,9.4 22.6,10.8 22.2,12 C20.6,11.6 18.4,10.8 16.6,9 Z', c.B, o),
    tone('M17.4,9.4 C18.4,10.4 20.4,11.4 22.2,12 C22.4,11 22.6,10 22.8,9.2 C21,9.4 19,9.4 17.4,9.4 Z', c.D),
    // the lamp along her back and the top of her neck
    tone('M9.4,8.6 C12,8.2 15,8.6 16.8,8.8 C14.6,9.4 11.8,9.4 9.4,9.6 Z', c.L),
    tone('M19,3.6 C20,2.6 21.8,2.4 22.8,3.2 C21.4,3.4 20.2,4 19.6,5 Z', c.L),
    // the folded wing: a darker shield, flight feathers in scallops at its back
    fill('M18.8,11.4 C17.6,10 14.6,9.8 12.4,10.4 C10.4,11 8.8,12.2 7.6,13.8 C8.8,13.6 9.6,14.2 10.2,14.8 '
      + 'C11,14.2 11.8,14.6 12.4,15.4 C13.2,14.8 14.2,15.2 14.8,15.8 C15.8,15.2 17.4,14.6 18.4,13.6 C19,12.9 19.2,12 18.8,11.4 Z', c.D, '0.3'),
    line('M9.6,13.4 C11.4,12.6 13.4,12.4 15.4,12.6 M11.6,14.2 C13.2,13.6 15,13.6 16.8,13.4', c.DD, '0.35'),
    tone('M11,11 C13,10.4 15.6,10.4 17.4,11.4 C15.2,11.2 13,11.4 11,12 Z', c.L, 0.6),
    // the comb along the crown, the bare red face, the wattle
    fill('M18.8,3.6 C18.6,2.6 19.2,1.8 19.8,2.2 C20,1 20.8,0.6 21.4,1.4 C21.8,0.6 22.8,0.8 22.9,1.8 '
      + 'C23.6,1.6 24.2,2.4 23.8,3.4 C22.2,3.2 20.4,3.2 18.8,3.6 Z', COMB, '0.4'),
    tone('M21.4,3.8 C22.6,3.4 23.8,3.8 24.2,5.2 C23.8,6.4 22.6,6.8 21.6,6.2 C20.9,5.6 20.9,4.4 21.4,3.8 Z', COMB),
    fill('M22.8,6.4 C23.6,6.4 24.4,7 24.2,8.2 C24,9.2 23,9.4 22.6,8.6 C22.3,7.8 22.3,7 22.8,6.4 Z', COMB, '0.35'),
    tone('M23.2,8.8 C23.8,8.6 24.1,8 24.1,7.6 C24.2,8.4 23.9,9 23.2,8.8 Z', COMBD),
    // the beak, short and hooked
    fill('M24.1,4.4 C24.9,4.4 25.5,4.8 25.8,5.3 C25.2,5.6 24.6,5.8 24.1,5.8 Z', BEAK, '0.35'),
    // the eye
    `<circle cx="22.7" cy="4.5" r="0.62" fill="#1A120C"/><circle cx="22.9" cy="4.3" r="0.2" fill="#FFFFFF"/>`,
  ].join('');
}
function henLegs() {
  const LEG = '#E3B341', LEGD = '#B98D2A';
  return [
    line('M12,17 L11.4,21.4 M15,17 L15.6,21.4', LEGD, '1.5'),
    line('M12,17 L11.4,21.4 M15,17 L15.6,21.4', LEG, '1'),
    // the toes, three forward and a short one back
    line('M11.4,21.4 L9.4,21.6 M11.4,21.4 L13,21.7 M11.4,21.4 L11.9,21.9 M15.6,21.4 L14.2,21.6 M15.6,21.4 L17.6,21.7 M15.6,21.4 L16.3,21.9', LEG, '0.7'),
  ].join('');
}

const henView = { x: 0, y: 0, w: 26, h: 22 };

export const ART = [
  { name: 'econ4-tree', svg: appleTree, view: { x: 0, y: 0, w: 150, h: 148 }, box: { x: 65, y: 298, w: 150, h: 148 } },
  { name: 'econ4-hedge', svg: privetHedge, view: { x: 0, y: 0, w: 400, h: 100 }, box: { x: 0, y: 404, w: 400, h: 96 } },
  // her plants: tomatoPlant(32, 441, 44, 82, false, flip) and tomatoPlant(74, 441, 44, 82, pick)
  { name: 'econ4-plant-a', svg: tomatoPlantFull, view: { x: 0, y: 0, w: 44, h: 82 }, box: { x: 10, y: 400, w: 44, h: 82 } },
  { name: 'econ4-plant-b', svg: tomatoPlantPicked, view: { x: 0, y: 0, w: 44, h: 82 }, box: { x: 52, y: 400, w: 44, h: 82 } },
  // a tomato a hand moves: tomatoFruit(0, -0.4, 6, 6), about its middle
  { name: 'econ4-tomato', svg: tomatoOne, view: { x: 0, y: 0, w: 6, h: 6 }, box: { x: -3, y: -3.4, w: 6, h: 6 } },
  // the hens: henBird(0, -11, 26, 22, col, 'legs') about her feet, and the body about her hip
  { name: 'econ4-hen-legs', svg: henLegs, view: henView, box: { x: -13, y: -22, w: 26, h: 22 } },
  { name: 'econ4-hen-russet', svg: () => henBody(HEN_COL.russet), view: henView, box: { x: -13, y: -16, w: 26, h: 22 } },
  { name: 'econ4-hen-white', svg: () => henBody(HEN_COL.white), view: henView, box: { x: -13, y: -16, w: 26, h: 22 } },
];
