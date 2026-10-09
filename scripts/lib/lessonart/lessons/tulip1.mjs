// economics-tulips-1 — "The Flower That Broke" (LESSON_RULES AW5, AM13): the Leiden
// university garden, the hortus botanicus, in the autumn of 1593 and the spring of 1594; the
// same garden by night after the theft; and its potting corner by the street gate in a later
// spring.
//
// Every picture is in SCENE units with the band [214, 514], 400 × 300. Flat fills lit from
// the top left, a darker shaded side, one dark outline; real colours, no gradients, no glows.
//
// REFERENCES (npm run ref, scratchpad/ref/t1*):
//   t1hortus-1  "Horti publici academiae Lugduno-Batavae" (engraving, 1610): the garden is
//               long narrow beds edged low and laid in blocks, gravel walks between; along
//               the back the AMBULACRUM, a long low gallery opening on round arches, its
//               hipped roof crowned with dormers and a small central lantern; a high plain
//               wall down the side, trees showing over it.
//   t1semper-1  the Semper Augustus (watercolour, 17th c.): a white cup flamed and feathered
//               in crimson down every petal, the flames darkest at the petal's middle; a
//               long bare stem; two broad grey-green leaves curling from the base.
//   t1rapenburg-1 Leiden canal houses: narrow brick fronts, STEPPED gables, tall windows in
//               white frames with small panes, one house rendered pale ochre among the brick.
//   t1pot-1     terracotta pots: a rolled rim a little wider than the body, the body tapering
//               to a narrower foot, darker where it is wet.

const OUT = '#2E2219';
const f2 = (n) => Number(n.toFixed(2));
const fill = (d, c, w = 1) => `<path d="${d}" fill="${c}" stroke="${OUT}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"/>`;
const flat = (d, c, o = 1) => `<path d="${d}" fill="${c}"${o < 1 ? ` opacity="${o}"` : ''}/>`;
const rect = (x, y, w, h, c, lw = 1, r = 0) => `<rect x="${f2(x)}" y="${f2(y)}" width="${f2(w)}" height="${f2(h)}" rx="${r}" fill="${c}" stroke="${OUT}" stroke-width="${lw}" stroke-linejoin="round"/>`;
const box = (x, y, w, h, c, o = 1) => `<rect x="${f2(x)}" y="${f2(y)}" width="${f2(w)}" height="${f2(h)}" fill="${c}"${o < 1 ? ` opacity="${o}"` : ''}/>`;
const line = (d, c, w) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const circ = (x, y, r, c, lw = 0.8) => `<circle cx="${f2(x)}" cy="${f2(y)}" r="${f2(r)}" fill="${c}" stroke="${OUT}" stroke-width="${lw}"/>`;
const ell = (x, y, rx, ry, c, lw = 0.8) => `<ellipse cx="${f2(x)}" cy="${f2(y)}" rx="${f2(rx)}" ry="${f2(ry)}" fill="${c}" stroke="${OUT}" stroke-width="${lw}"/>`;
const dot = (x, y, r, c, o = 1) => `<circle cx="${f2(x)}" cy="${f2(y)}" r="${f2(r)}" fill="${c}"${o < 1 ? ` opacity="${o}"` : ''}/>`;
function rng(seed) {
  let s = seed;
  return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
}

// ── the garden's lights ──────────────────────────────────────────────────────
const AUTUMN = {
  sky: ['#9CB9D2', '#AFC7DA', '#C4D6E3', '#DCE5EA'], night: false,
  brick: '#A9583D', brickD: '#874330', brickL: '#C06F52', mortar: '#7C3D2B',
  roof: '#8F4532', roofD: '#6F3426', roofL: '#A85840', stone: '#E2D6B6', stoneD: '#C2B48E', hole: '#3B2A24',
  gable: ['#9A4E35', '#B5764F', '#C9A56C'], gableD: ['#7A3C29', '#93593A', '#A8844F'], win: '#3E4A55', winL: '#F2EEE2',
  gravel: '#D9CEB3', gravelD: '#C3B595', gravelL: '#E8DFC9', soil: '#6E4C33', soilD: '#563A27', soilL: '#86603F',
  box: '#3F6A36', boxD: '#2F5229', boxL: '#5C8749', wood: '#7E5A39', woodD: '#5E4129', woodL: '#9C7650',
  tree: '#C88A33', treeD: '#A66B25', treeL: '#E0A84A', trunk: '#5B4232', glow: '#F6D27A',
};
const NIGHT = {
  sky: ['#141C34', '#1A2442', '#222E50', '#2B385E'], night: true,
  brick: '#4A3A48', brickD: '#3A2D3A', brickL: '#5A4858', mortar: '#2E2430',
  roof: '#3A2A36', roofD: '#2C2029', roofL: '#4A3644', stone: '#6E6A7E', stoneD: '#58546A', hole: '#141018',
  gable: ['#40303E', '#4C3C48', '#56504E'], gableD: ['#32252F', '#3C2E38', '#45403F'], win: '#1C2230', winL: '#F2C76A',
  gravel: '#5E5A6C', gravelD: '#4E4A5C', gravelL: '#6E6A7C', soil: '#2E2428', soilD: '#221A1E', soilL: '#3C3034',
  box: '#22362E', boxD: '#192A23', boxL: '#2E4638', wood: '#3E3030', woodD: '#2E2424', woodL: '#4C3C3A',
  tree: '#3A3A44', treeD: '#2E2E38', treeL: '#46464E', trunk: '#241C1E', glow: '#F2C76A',
};

/** A sky in flat bands, lightest at the horizon. */
function sky(x, y0, w, h, bands) {
  const out = [];
  const cut = [0, 0.3, 0.55, 0.78, 1];
  for (let k = 0; k < 4; k++) out.push(box(x, y0 + h * cut[k], w, h * (cut[k + 1] - cut[k]) + 0.3, bands[k]));
  return out.join('');
}
/** Brick courses: thin mortar lines with staggered joints, inside a box. */
function courses(x, y, w, h, K, step = 4.2) {
  const o = [];
  let r = 0;
  for (let yy = y + step; yy < y + h - 0.5; yy += step, r++) {
    o.push(box(x, yy, w, 0.5, K.mortar, 0.55));
    for (let xx = x + (r % 2 ? 4 : 0); xx < x + w; xx += 9) o.push(box(xx, yy - step + 0.6, 0.5, step - 0.6, K.mortar, 0.35));
  }
  return o.join('');
}
/** A tall window in a white frame with small panes; lit at night if `lit`. */
function window_(x, y, w, h, K, lit = false) {
  return rect(x, y, w, h, K.winL, 0.6) + box(x + 1, y + 1, w - 2, h - 2, lit && K.night ? K.glow : K.win)
    + box(x + w / 2 - 0.3, y + 1, 0.6, h - 2, K.winL) + box(x + 1, y + h * 0.45, w - 2, 0.6, K.winL);
}
/** A Leiden house front with a STEPPED gable (t1rapenburg-1). Base at `by`, top step at `ty`. */
function gableHouse(x, w, by, ty, c, cd, K, lit) {
  const o = [];
  const sh = (by - ty) * 0.42;        // the shoulder where the steps begin
  const sy = ty + sh;
  const st = 3;                        // steps a side
  const pts = [[x, by], [x, sy]];
  for (let k = 0; k < st; k++) {
    const xs = x + ((k + 1) * w) / (2 * (st + 1));
    const ys = sy - ((k + 1) * sh) / (st + 1);
    pts.push([xs - (w / (2 * (st + 1))), ys], [xs, ys]);
  }
  pts.push([x + w / 2 - 3, ty], [x + w / 2 + 3, ty]);
  for (let k = st - 1; k >= 0; k--) {
    const xs = x + w - ((k + 1) * w) / (2 * (st + 1));
    const ys = sy - ((k + 1) * sh) / (st + 1);
    pts.push([xs, ys], [xs + w / (2 * (st + 1)), ys]);
  }
  pts.push([x + w, sy], [x + w, by]);
  // tidy the step stairs into a polygon
  const d = 'M' + pts.map(([px, py]) => `${f2(px)},${f2(py)}`).join(' L') + ' Z';
  o.push(fill(d, c, 0.9));
  o.push(box(x + w * 0.72, sy + 1, w * 0.28 - 0.6, by - sy - 1, cd));
  const cols = w > 40 ? 3 : 2;
  const ww = 6.4, gap = (w - cols * ww) / (cols + 1);
  for (let row = 0; row < 2; row++) {
    for (let k = 0; k < cols; k++) {
      o.push(window_(x + gap + k * (ww + gap), sy + 4 + row * 15, ww, 11, K, lit && row === 0 && k === 1));
    }
  }
  o.push(window_(x + w / 2 - 2.6, ty + sh * 0.35, 5.2, 7.4, K, false));
  return o.join('');
}
/** One tulip's flower, a cup on a stem with its two leaves (base at y, s = scale). */
function tulip(x, y, s, c, cd, leaf, leafD, broken = false, lean = 0) {
  const o = [];
  const h = 24 * s;
  const hx = x + lean * h;
  // leaves curling from the base (t1semper-1)
  o.push(fill(`M${f2(x)},${f2(y)} C${f2(x - 5 * s)},${f2(y - 4 * s)} ${f2(x - 7 * s)},${f2(y - 10 * s)} ${f2(x - 6 * s)},${f2(y - 14 * s)} C${f2(x - 3.4 * s)},${f2(y - 9 * s)} ${f2(x - 1 * s)},${f2(y - 5 * s)} ${f2(x + 0.6 * s)},${f2(y)} Z`, leaf, 0.45));
  o.push(fill(`M${f2(x + 0.4)},${f2(y)} C${f2(x + 5 * s)},${f2(y - 3 * s)} ${f2(x + 6.6 * s)},${f2(y - 8 * s)} ${f2(x + 5.4 * s)},${f2(y - 12 * s)} C${f2(x + 3.4 * s)},${f2(y - 7 * s)} ${f2(x + 1.4 * s)},${f2(y - 4 * s)} ${f2(x - 0.4 * s)},${f2(y)} Z`, leafD, 0.45));
  o.push(line(`M${f2(x)},${f2(y)} C${f2(x)},${f2(y - h * 0.5)} ${f2(hx)},${f2(y - h * 0.7)} ${f2(hx)},${f2(y - h)}`, leafD, 1.1 * s));
  // the cup: three petals showing, the middle one notched over the outer two
  const t = y - h;
  const cup = `M${f2(hx - 3.4 * s)},${f2(t)} C${f2(hx - 4 * s)},${f2(t - 4 * s)} ${f2(hx - 3 * s)},${f2(t - 7.4 * s)} ${f2(hx - 1.4 * s)},${f2(t - 8 * s)} L${f2(hx)},${f2(t - 6 * s)} L${f2(hx + 1.4 * s)},${f2(t - 8 * s)} C${f2(hx + 3 * s)},${f2(t - 7.4 * s)} ${f2(hx + 4 * s)},${f2(t - 4 * s)} ${f2(hx + 3.4 * s)},${f2(t)} C${f2(hx + 2.2 * s)},${f2(t + 1.8 * s)} ${f2(hx - 2.2 * s)},${f2(t + 1.8 * s)} ${f2(hx - 3.4 * s)},${f2(t)} Z`;
  o.push(fill(cup, broken ? '#F6F1EA' : c, 0.55));
  if (broken) {
    // crimson flames feathered up every petal, darkest in the middle (t1semper-1)
    for (const [dx, k] of [[-2.4, 0.9], [-0.9, 1], [0.7, 1], [2.2, 0.85]]) {
      o.push(flat(`M${f2(hx + dx * s)},${f2(t + 0.8 * s)} C${f2(hx + (dx - 0.9) * s)},${f2(t - 2.6 * s)} ${f2(hx + (dx + 0.4) * s)},${f2(t - 4.6 * s * k)} ${f2(hx + dx * 0.8 * s)},${f2(t - 7 * s * k)} C${f2(hx + (dx + 0.8) * s)},${f2(t - 4 * s)} ${f2(hx + (dx + 0.6) * s)},${f2(t - 1.4 * s)} ${f2(hx + dx * s)},${f2(t + 0.8 * s)} Z`, c));
    }
    o.push(flat(`M${f2(hx - 0.5 * s)},${f2(t + 0.6 * s)} L${f2(hx)},${f2(t - 5.6 * s)} L${f2(hx + 0.5 * s)},${f2(t + 0.6 * s)} Z`, cd));
  } else {
    o.push(flat(`M${f2(hx + 0.4 * s)},${f2(t - 6 * s)} L${f2(hx + 1.4 * s)},${f2(t - 8 * s)} C${f2(hx + 3 * s)},${f2(t - 7.4 * s)} ${f2(hx + 4 * s)},${f2(t - 4 * s)} ${f2(hx + 3.4 * s)},${f2(t)} C${f2(hx + 2.6 * s)},${f2(t + 1.2 * s)} ${f2(hx + 1.4 * s)},${f2(t + 1.5 * s)} ${f2(hx + 0.6 * s)},${f2(t + 1.5 * s)} Z`, cd));
  }
  return o.join('');
}
const LEAF = '#5E8A4A', LEAF_D = '#45703A';
const RED = ['#C8322C', '#9E2420'], YEL = ['#F2C531', '#D19D16'], PINK = ['#E77FA0', '#C45A7E'], WHT = ['#F4EFE3', '#D9D0BC'], ORG = ['#E9772E', '#C2591A'];
/** Rows of tulips across a bed: a back row smaller, a front row. */
function rows(x0, x1, by, palette, seed, night = false) {
  const o = [];
  const r = rng(seed);
  for (const [dy, s, step, off] of [[-6, 0.82, 9.5, 4], [0, 1, 11, 0]]) {
    for (let x = x0 + 4 + off; x < x1 - 3; x += step) {
      const p = palette[Math.floor(r() * palette.length)];
      const c = night ? '#4A3A50' : p[0];
      const cd = night ? '#3A2C40' : p[1];
      o.push(tulip(x + (r() - 0.5) * 2, by + dy, s * (0.92 + r() * 0.14), c, cd, night ? '#2E4034' : LEAF, night ? '#22322A' : LEAF_D, false, (r() - 0.5) * 0.12));
    }
  }
  return o.join('');
}

// ══════════════════════════════════════════════════════════════════════════════
// PLACE A — THE GARDEN BEDS, AUTUMN 1593 → SPRING 1594, AND BY NIGHT (world x 0–400)
// ══════════════════════════════════════════════════════════════════════════════
//
// Far: the sky; the AMBULACRUM across the back on the left (x −4–238), a long low gallery on
// round arches under a hipped tile roof with dormers and a lantern (t1hortus-1); Leiden's
// stepped gables beyond the side wall on the right. Mid: the back WALL (x 238–404, coping
// 400) with its arched GATE (302–336) between two piers; a strip of clipped box knots along
// the back walk (452–474); the two BEDS the people stand in front of (soil 470–484, box hedge
// 482–493): bed 1 x 8–178, bed 2 (the best bed) x 194–342; the gravel walk from 488.

export const A = { bed1: [8, 178], bed2: [194, 342], gate: [302, 336], wallTop: 400, soil: 480 };

function gardenFar(K) {
  const o = [];
  o.push(sky(0, 214, 400, 240, K.sky));
  if (K.night) {
    const r = rng(7);
    for (let k = 0; k < 40; k++) o.push(dot(r() * 400, 218 + r() * 100, 0.4 + r() * 0.6, '#E8E4D2', 0.4 + r() * 0.5));
    o.push(circ(346, 248, 10, '#EFE8CC', 0.6));
    o.push(flat('M346,238 C352,240 356,244 356,249 C355,254 351,258 346,258 C349,254 350,249 349,245 C348,242 347,240 346,238 Z', '#D9D0AE'));
  } else {
    // two flat clouds
    for (const [x, y, w] of [[60, 246, 70], [270, 264, 54]]) {
      o.push(flat(`M${x},${y} C${x + w * 0.15},${y - 9} ${x + w * 0.4},${y - 12} ${x + w * 0.55},${y - 6} C${x + w * 0.7},${y - 12} ${x + w * 0.95},${y - 8} ${x + w},${y} Z`, '#F4F6F6'));
      o.push(box(x + 4, y - 1.4, w - 8, 1.4, '#DCE3E6'));
    }
  }
  // the gables beyond the side wall
  o.push(gableHouse(236, 46, 404, 318, K.gable[0], K.gableD[0], K, true));
  o.push(gableHouse(284, 40, 404, 330, K.gable[2], K.gableD[2], K, false));
  o.push(gableHouse(326, 50, 404, 312, K.gable[1], K.gableD[1], K, true));
  o.push(gableHouse(378, 40, 404, 334, K.gable[0], K.gableD[0], K, false));
  // a tree behind the gallery's end (autumn gold; the scene lays spring over it)
  o.push(rect(214, 360, 6, 60, K.trunk, 0.7));
  o.push(fill('M190,372 C178,360 182,336 198,330 C200,312 222,304 236,314 C252,310 264,326 258,342 C268,352 262,372 246,376 C232,384 204,384 190,372 Z', K.tree, 1));
  o.push(flat('M236,314 C252,310 264,326 258,342 C268,352 262,372 246,376 C238,380 228,382 220,382 C236,366 242,340 236,314 Z', K.treeD));
  for (const [x, y] of [[200, 344], [214, 330], [230, 352], [246, 336]]) o.push(flat(`M${x},${y} c3,-3 7,-3 9,0 c-3,1 -6,1 -9,0 Z`, K.treeL));
  // THE AMBULACRUM: the hipped roof, its dormers and lantern, then the arcade
  o.push(fill('M-6,370 L18,330 L206,330 L232,370 Z', K.roof, 1));
  o.push(flat('M150,330 L206,330 L232,370 L176,370 Z', K.roofD));
  for (let y = 336; y < 370; y += 6) o.push(line(`M${f2(-4 + (370 - y) * 0.6)},${y} L${f2(230 - (370 - y) * 0.65)},${y}`, K.roofD, 0.5));
  for (const x of [30, 70, 150, 190]) {
    o.push(fill(`M${x - 6},352 L${x - 6},344 L${x},338 L${x + 6},344 L${x + 6},352 Z`, K.stone, 0.6));
    o.push(box(x - 3, 345, 6, 6, K.win));
  }
  // the central lantern, its little dome and vane
  o.push(rect(102, 312, 20, 22, K.stone, 0.8));
  o.push(box(115, 313, 6.4, 20, K.stoneD));
  for (const x of [105, 112]) o.push(box(x, 316, 4, 10, K.win));
  o.push(fill('M98,313 C100,302 124,302 126,313 Z', K.roof, 0.8));
  o.push(line('M112,303 L112,292', K.woodD, 1));
  o.push(fill('M112,293 L120,295 L112,297 Z', K.night ? '#6E6A7E' : '#C9A23A', 0.4));
  // the gallery wall and its arches
  o.push(rect(-6, 368, 240, 86, K.brick, 1));
  o.push(courses(-5, 369, 238, 84, K));
  o.push(box(-5, 368.6, 238, 4, K.stone));
  for (let k = 0; k < 7; k++) {
    const x = 6 + k * 32;
    o.push(fill(`M${x},452 L${x},404 C${x},392 ${x + 22},392 ${x + 22},404 L${x + 22},452 Z`, K.stone, 0.8));
    o.push(flat(`M${x + 2.6},452 L${x + 2.6},405 C${x + 2.6},396 ${x + 19.4},396 ${x + 19.4},405 L${x + 19.4},452 Z`, K.hole));
    // the far side of the gallery seen through the arch: a lit back wall
    o.push(box(x + 5, 414, 12, 38, K.night ? '#221A20' : '#5A4136'));
  }
  o.push(box(-5, 450, 238, 3, K.stoneD));
  return o.join('');
}

function gardenMid(K, night) {
  const o = [];
  // the side wall and its gate
  o.push(rect(236, A.wallTop, 170, 54, K.brick, 1));
  o.push(courses(237, A.wallTop + 1, 168, 52, K));
  o.push(rect(234, A.wallTop - 4, 172, 5, K.stone, 0.8));
  o.push(box(236, A.wallTop - 1.4, 170, 1.4, K.stoneD));
  // the gate's opening (the street beyond, dark) and its two piers with stone balls
  const [g0, g1] = A.gate;
  o.push(flat(`M${g0},452 L${g0},${A.wallTop + 12} C${g0},${A.wallTop + 2} ${g1},${A.wallTop + 2} ${g1},${A.wallTop + 12} L${g1},452 Z`, night ? '#0E0C14' : '#4A4A50'));
  if (!night) o.push(box(g0 + 2, 440, g1 - g0 - 4, 12, '#8A8578'));
  for (const x of [g0 - 7, g1]) {
    o.push(rect(x, A.wallTop - 14, 7, 68, K.brickL, 0.9));
    o.push(courses(x + 0.5, A.wallTop - 13, 6, 66, K));
    o.push(rect(x - 1.2, A.wallTop - 17, 9.4, 4, K.stone, 0.7));
    o.push(circ(x + 3.5, A.wallTop - 21, 4, K.stone, 0.7));
  }
  if (night) {
    // the gate shut for the night, and the ladder the thieves left against the wall
    o.push(gateLeaf(K));
  }
  // the back walk and its clipped box knots
  o.push(box(-4, 452, 408, 64, K.gravel));
  o.push(box(-4, 452, 408, 22, K.gravelD));
  o.push(box(-4, 452, 408, 2, K.gravelL));
  for (let x = 6; x < 400; x += 24) {
    o.push(fill(`M${x},468 C${x - 1},461 ${x + 3},457 ${x + 8},457 C${x + 13},457 ${x + 17},461 ${x + 16},468 Z`, K.box, 0.7));
    o.push(flat(`M${x + 9},457.4 C${x + 13},457.6 ${x + 17},461 ${x + 16},468 L${x + 9},468 Z`, K.boxD));
  }
  // the beds: soil, and the clipped box hedge along the front
  for (const [x0, x1] of [A.bed1, A.bed2]) {
    o.push(rect(x0, 470, x1 - x0, 16, K.soil, 0.9));
    o.push(box(x0 + 1, 470.6, x1 - x0 - 2, 2.4, K.soilL));
    const r = rng(x0 + 3);
    for (let k = 0; k < (x1 - x0) / 7; k++) o.push(ell(x0 + 4 + r() * (x1 - x0 - 8), 475 + r() * 7, 1.6, 0.7, K.soilD, 0));
    o.push(fill(`M${x0 - 2},493 L${x0 - 2},485 C${x0 - 2},482 ${x0},481.6 ${x0 + 3},481.6 L${x1 - 3},481.6 C${x1},481.6 ${x1 + 2},482 ${x1 + 2},485 L${x1 + 2},493 Z`, K.box, 0.9));
    o.push(box(x0, 488.4, x1 - x0, 4, K.boxD));
    for (let x = x0 + 3; x < x1 - 2; x += 5) o.push(box(x, 483, 2.4, 1.2, K.boxL));
  }
  // the gravel walk the people stand on
  o.push(rect(-4, 492.6, 408, 24, K.gravel, 0.9));
  o.push(box(-4, 493.2, 408, 2, K.gravelD));
  const r = rng(31);
  for (let k = 0; k < 70; k++) o.push(dot(r() * 400, 497 + r() * 16, 0.5 + r() * 0.5, r() < 0.5 ? K.gravelD : K.gravelL));
  if (night) {
    // bed 1 still in flower in the dark; bed 2 pocked with empty holes and heaped soil
    o.push(rows(A.bed1[0], A.bed1[1], 478, [RED], 3, true));
    const rr = rng(77);
    for (let x = A.bed2[0] + 10; x < A.bed2[1] - 6; x += 15) {
      const y = 476 + rr() * 5;
      o.push(ell(x + 5, y + 1.6, 6.2, 2, K.soilL, 0.4));
      o.push(ell(x, y, 3.8, 1.8, '#0A0608', 0.4));
    }
    // a trampled leaf or two
    for (const x of [230, 268, 310]) o.push(flat(`M${x},480 c3,-2 7,-1 9,1 c-3,1 -6,1 -9,-1 Z`, '#2E4034'));
    // THE LADDER the thieves left: from the walk up to the coping
    o.push(line('M318,497 L302,398 M330,497 L314,398', '#3C3030', 2.6));
    o.push(line('M318,497 L302,398 M330,497 L314,398', '#5A4A44', 1.4));
    for (let k = 1; k < 8; k++) {
      const f = k / 8;
      o.push(line(`M${f2(318 - 16 * f)},${f2(497 - 99 * f)} L${f2(330 - 16 * f)},${f2(497 - 99 * f)}`, '#5A4A44', 1.6));
    }
  }
  return o.join('');
}
/** The garden gate, shut: boards in an arched frame, two iron straps (its own place in the wall). */
function gateLeaf(K = AUTUMN) {
  const [g0, g1] = A.gate;
  const o = [];
  o.push(fill(`M${g0},452 L${g0},${A.wallTop + 12} C${g0},${A.wallTop + 2} ${g1},${A.wallTop + 2} ${g1},${A.wallTop + 12} L${g1},452 Z`, K.wood, 1));
  for (let x = g0 + 5.6; x < g1 - 1; x += 5.6) o.push(line(`M${f2(x)},${A.wallTop + 6} L${f2(x)},451`, K.woodD, 0.6));
  for (const y of [418, 440]) o.push(box(g0 + 1, y, g1 - g0 - 2, 2.2, K.night ? '#2A2A30' : '#4A4744'));
  o.push(circ(g1 - 6, 430, 1.4, K.night ? '#4A4A50' : '#3A3734', 0.4));
  return o.join('');
}
export const gardenFarDay = () => gardenFar(AUTUMN);
export const gardenFarNight = () => gardenFar(NIGHT);
export const gardenMidDay = () => gardenMid(AUTUMN, false);
export const gardenMidNight = () => gardenMid(NIGHT, true);
export const gate = () => gateLeaf(AUTUMN);
/** The tree in its spring leaves, laid over the autumn one from the bloom on. */
export function treeSpring() {
  const o = [];
  o.push(fill('M190,372 C178,360 182,336 198,330 C200,312 222,304 236,314 C252,310 264,326 258,342 C268,352 262,372 246,376 C232,384 204,384 190,372 Z', '#7FAE52', 1));
  o.push(flat('M236,314 C252,310 264,326 258,342 C268,352 262,372 246,376 C238,380 228,382 220,382 C236,366 242,340 236,314 Z', '#5F8E3E'));
  for (const [x, y] of [[200, 344], [214, 330], [230, 352], [246, 336], [222, 366]]) o.push(flat(`M${x},${y} c3,-3 7,-3 9,0 c-3,1 -6,1 -9,0 Z`, '#A3CC6E'));
  return o.join('');
}
/** The beds in flower, spring 1594: bed 1 red and yellow, bed 2 every colour. */
export const rows1 = () => rows(A.bed1[0], A.bed1[1], 478, [RED, YEL, RED, ORG], 3);
export const rows2 = () => rows(A.bed2[0], A.bed2[1], 478, [PINK, RED, YEL, WHT, ORG], 11);

/**
 * THE WHEELBARROW with two crates packed in straw side by side (its own frame: the wheel
 * touches the ground at (0, 0), the handles run back to the right). The front crate's lid is
 * the scene's, hinged at (22, −36).
 */
export function barrow() {
  const o = [];
  const W = '#8A6340', WD = '#674A2F', WL = '#A97F55';
  // the legs and the handles
  o.push(line('M30,-12 L34,0', WD, 2.2));
  o.push(line('M8,-16 L52,-20', WD, 2.6));
  o.push(line('M8,-16 L52,-20', W, 1.4));
  // the tray
  o.push(fill('M2,-14 L40,-14 L44,-24 L-2,-24 Z', W, 1));
  o.push(flat('M26,-14 L40,-14 L44,-24 L28,-24 Z', WD));
  o.push(line('M0,-19 L42,-19', WD, 0.5));
  // two crates of bulbs, straw sticking out of their slats
  for (const [x, y, w, h] of [[2, -36, 20, 12], [23, -36, 20, 12]]) {
    o.push(rect(x, y, w, h, '#C69A62', 0.8));
    o.push(box(x + w * 0.66, y + 0.5, w * 0.34 - 0.5, h - 1, '#A57D4A'));
    o.push(line(`M${x},${y + h / 2} L${x + w},${y + h / 2}`, '#8E6A3E', 0.5));
    for (let k = 0; k < 6; k++) o.push(line(`M${x + 2 + k * (w - 4) / 5},${y + 0.4} l${k % 2 ? 1.5 : -1.2},-2.6`, '#E3C66E', 0.7));
  }
  // the wheel
  o.push(circ(0, -7, 7, '#5A4129', 1));
  o.push(circ(0, -7, 4.6, '#8A6340', 0.6));
  o.push(line('M-4.6,-7 L4.6,-7 M0,-11.6 L0,-2.4', '#5A4129', 0.8));
  o.push(circ(0, -7, 1.2, '#3A3734', 0.3));
  return o.join('');
}

// ══════════════════════════════════════════════════════════════════════════════
// PLACE B — THE POTTING CORNER BY THE STREET GATE, A LATER SPRING (world x 400–800)
// ══════════════════════════════════════════════════════════════════════════════
//
// Far: a spring sky; beyond the wall the long roof and square tower of the Pieterskerk
// (60–222) and three stepped gables; a cherry in blossom over the wall on the left. Mid:
// the back wall across the whole place (coping 400) with the arched STREET GATE (330–366);
// the box knots; BED F in full flower (x 0–158) with a gap at 124 where the broken tulip
// stands (the scene draws it, so it can be dug); the gravel walk. Near: the POTTING BENCH
// (168–272, top 468) and the PLANK on two upturned crates by the gate (298–394, top 472).

export const B = { gate: [330, 366], bed: [0, 158], broken: 124, bench: [168, 272], benchTop: 468, plank: [298, 394], plankTop: 472 };
const SPRING = {
  ...AUTUMN, sky: ['#7FB4E3', '#97C3EA', '#B2D3EF', '#CFE3F2'],
};
export function cornerFar() {
  const K = SPRING;
  const o = [];
  o.push(sky(0, 214, 400, 240, K.sky));
  for (const [x, y, w] of [[150, 240, 64], [300, 256, 80]]) {
    o.push(flat(`M${x},${y} C${x + w * 0.15},${y - 9} ${x + w * 0.4},${y - 12} ${x + w * 0.55},${y - 6} C${x + w * 0.7},${y - 12} ${x + w * 0.95},${y - 8} ${x + w},${y} Z`, '#F6F8FA'));
    o.push(box(x + 4, y - 1.4, w - 8, 1.4, '#DDE6EC'));
  }
  // THE PIETERSKERK: the long nave roof, its buttressed wall and pointed windows, the tower
  o.push(fill('M70,404 L70,366 L222,366 L222,404 Z', '#B9785A', 1));
  o.push(fill('M64,368 L96,326 L210,326 L228,368 Z', '#5F6A72', 1));
  o.push(flat('M170,326 L210,326 L228,368 L190,368 Z', '#4C565E'));
  for (let x = 82; x < 220; x += 22) {
    o.push(fill(`M${x},400 L${x},384 C${x},376 ${x + 8},376 ${x + 8},384 L${x + 8},400 Z`, '#5A6470', 0.6));
    o.push(box(x + 12, 370, 3, 34, '#9A6048'));
  }
  o.push(rect(30, 300, 34, 104, '#B07052', 1));
  o.push(box(52, 301, 11.4, 102, '#93593F'));
  for (const y of [318, 352]) o.push(fill(`M40,${y + 16} L40,${y + 4} C40,${y} 52,${y} 52,${y + 4} L52,${y + 16} Z`, '#3E4A55', 0.6));
  o.push(rect(28, 296, 38, 6, '#D8CDB0', 0.7));
  o.push(fill('M32,296 L47,262 L62,296 Z', '#5F6A72', 0.9));
  o.push(line('M47,262 L47,250', '#3A3734', 1));
  o.push(fill('M47,251 L55,253 L47,255 Z', '#C9A23A', 0.4));
  // the gables
  o.push(gableHouse(236, 44, 404, 320, K.gable[1], K.gableD[1], K, false));
  o.push(gableHouse(282, 52, 404, 306, K.gable[0], K.gableD[0], K, false));
  o.push(gableHouse(336, 42, 404, 326, K.gable[2], K.gableD[2], K, false));
  o.push(gableHouse(380, 40, 404, 316, K.gable[0], K.gableD[0], K, false));
  // a cherry in blossom over the wall, left
  o.push(rect(12, 360, 6, 46, '#5B4232', 0.7));
  o.push(fill('M-8,378 C-14,360 -4,340 12,340 C18,326 40,326 46,342 C62,346 64,366 54,376 C48,388 6,390 -8,378 Z', '#F2D6DE', 1));
  o.push(flat('M46,342 C62,346 64,366 54,376 C50,382 40,386 30,386 C44,374 48,358 46,342 Z', '#E0B4C2'));
  for (const [x, y] of [[0, 360], [14, 348], [30, 362], [38, 344], [20, 372]]) o.push(dot(x, y, 2.4, '#FBEFF2'));
  return o.join('');
}
export function cornerMid() {
  const K = SPRING;
  const o = [];
  o.push(rect(-6, A.wallTop, 412, 54, K.brick, 1));
  o.push(courses(-5, A.wallTop + 1, 410, 52, K));
  o.push(rect(-6, A.wallTop - 4, 412, 5, K.stone, 0.8));
  o.push(box(-5, A.wallTop - 1.4, 410, 1.4, K.stoneD));
  // the street gate, shut, between its piers
  const [g0, g1] = B.gate;
  for (const x of [g0 - 7, g1]) {
    o.push(rect(x, A.wallTop - 14, 7, 68, K.brickL, 0.9));
    o.push(courses(x + 0.5, A.wallTop - 13, 6, 66, K));
    o.push(rect(x - 1.2, A.wallTop - 17, 9.4, 4, K.stone, 0.7));
    o.push(circ(x + 3.5, A.wallTop - 21, 4, K.stone, 0.7));
  }
  o.push(fill(`M${g0},452 L${g0},${A.wallTop + 12} C${g0},${A.wallTop + 2} ${g1},${A.wallTop + 2} ${g1},${A.wallTop + 12} L${g1},452 Z`, K.wood, 1));
  for (let x = g0 + 6; x < g1 - 1; x += 6) o.push(line(`M${x},${A.wallTop + 6} L${x},451`, K.woodD, 0.6));
  for (const y of [418, 440]) o.push(box(g0 + 1, y, g1 - g0 - 2, 2.2, '#4A4744'));
  o.push(circ(g0 + 6, 430, 1.4, '#3A3734', 0.4));
  // a climbing rose on the wall right of the gate
  for (const [x, y] of [[378, 414], [388, 424], [384, 438], [394, 410], [372, 430]]) {
    o.push(dot(x, y, 4.6, '#4E7A3E'));
    o.push(dot(x + 1, y - 1, 1.6, '#D8506A'));
  }
  // the back walk and its box knots
  o.push(box(-4, 452, 408, 64, K.gravel));
  o.push(box(-4, 452, 408, 22, K.gravelD));
  o.push(box(-4, 452, 408, 2, K.gravelL));
  for (let x = 6; x < 400; x += 24) {
    o.push(fill(`M${x},468 C${x - 1},461 ${x + 3},457 ${x + 8},457 C${x + 13},457 ${x + 17},461 ${x + 16},468 Z`, K.box, 0.7));
    o.push(flat(`M${x + 9},457.4 C${x + 13},457.6 ${x + 17},461 ${x + 16},468 L${x + 9},468 Z`, K.boxD));
  }
  // BED F, in full flower, the broken tulip's place left empty
  const [b0, b1] = B.bed;
  o.push(rect(b0 - 6, 470, b1 - b0 + 6, 16, K.soil, 0.9));
  o.push(box(b0 - 5, 470.6, b1 - b0 + 4, 2.4, K.soilL));
  const r = rng(5);
  for (const [dy, s, step, off] of [[-6, 0.82, 9.5, 4], [0, 1, 11, 0]]) {
    for (let x = b0 + off; x < b1 - 3; x += step) {
      if (dy === 0 && Math.abs(x - B.broken) < 8) continue;
      const p = [RED, YEL, PINK, ORG, WHT][Math.floor(r() * 5)];
      o.push(tulip(x + (r() - 0.5) * 2, 478 + dy, s * (0.92 + r() * 0.14), p[0], p[1], LEAF, LEAF_D, false, (r() - 0.5) * 0.12));
    }
  }
  o.push(fill(`M${b0 - 8},493 L${b0 - 8},485 C${b0 - 8},482 ${b0 - 6},481.6 ${b0 - 3},481.6 L${b1 - 3},481.6 C${b1},481.6 ${b1 + 2},482 ${b1 + 2},485 L${b1 + 2},493 Z`, K.box, 0.9));
  o.push(box(b0 - 6, 488.4, b1 - b0 + 6, 4, K.boxD));
  for (let x = b0; x < b1 - 2; x += 5) o.push(box(x, 483, 2.4, 1.2, K.boxL));
  // the gravel walk
  o.push(rect(-4, 492.6, 408, 24, K.gravel, 0.9));
  o.push(box(-4, 493.2, 408, 2, K.gravelD));
  const rr = rng(41);
  for (let k = 0; k < 70; k++) o.push(dot(rr() * 400, 497 + rr() * 16, 0.5 + rr() * 0.5, rr() < 0.5 ? K.gravelD : K.gravelL));
  return o.join('');
}
/** THE POTTING BENCH: a thick top on four legs, a shelf below with stacked pots and a trowel. */
export function bench() {
  const o = [];
  const [x0, x1] = B.bench;
  const T = B.benchTop;
  const W = '#9B7148', WD = '#76522F', WL = '#B88C5E';
  for (const x of [x0 + 4, x1 - 10]) {
    o.push(rect(x, T + 4, 6, 500 - T - 3, W, 0.8));
    o.push(box(x + 3.6, T + 4.6, 1.8, 500 - T - 4.4, WD));
  }
  o.push(rect(x0 + 2, 486, x1 - x0 - 4, 3.4, WD, 0.7));
  // stacked pots and a trowel on the shelf
  for (const [x, n] of [[x0 + 26, 3], [x0 + 46, 2]]) {
    for (let k = 0; k < n; k++) o.push(fill(`M${x - 7},${486 - k * 3.4} L${x - 6},${482 - k * 3.4} L${x + 6},${482 - k * 3.4} L${x + 7},${486 - k * 3.4} Z`, k === n - 1 ? '#C87A4E' : '#B66A40', 0.5));
  }
  o.push(fill(`M${x1 - 46},485.6 L${x1 - 30},484 L${x1 - 30},485.6 Z`, '#8E8A84', 0.5));
  o.push(rect(x1 - 30, 484, 9, 1.8, WD, 0.4));
  // the top, thick, with a splash of soil on it
  o.push(rect(x0, T, x1 - x0, 5, WL, 1));
  o.push(box(x0 + 0.6, T + 3, x1 - x0 - 1.2, 1.6, WD));
  o.push(flat(`M${x0 + 8},${T + 0.6} c4,-1.4 10,-1.2 14,0 Z`, '#6E4C33'));
  return o.join('');
}
/** THE PLANK on two upturned crates, by the street gate. */
export function plank() {
  const o = [];
  const [x0, x1] = B.plank;
  const T = B.plankTop;
  for (const x of [x0 + 4, x1 - 24]) {
    o.push(rect(x, T + 4, 20, 500 - T - 4, '#C69A62', 0.8));
    o.push(box(x + 14, T + 4.6, 5.4, 500 - T - 5.2, '#A57D4A'));
    for (const y of [T + 11, T + 18]) o.push(line(`M${x},${y} L${x + 20},${y}`, '#8E6A3E', 0.5));
  }
  o.push(rect(x0, T, x1 - x0, 4.4, '#A9845A', 1));
  o.push(box(x0 + 0.6, T + 2.6, x1 - x0 - 1.2, 1.4, '#86643E'));
  return o.join('');
}
/** A clay pot of soil (its own frame: standing on y 0, 22 across the rim). */
export function pot() {
  const o = [];
  o.push(fill('M-8,0 L-9.4,-12 L9.4,-12 L8,0 Z', '#C46F42', 1));
  o.push(flat('M3,0 L3.6,-12 L9.4,-12 L8,0 Z', '#A3562F'));
  o.push(rect(-11, -16, 22, 4.4, '#D27E52', 0.9));
  o.push(box(4, -15.4, 6.4, 3.2, '#B0623A'));
  o.push(ell(0, -15.6, 9.4, 1.6, '#5A3E2A', 0.5));
  return o.join('');
}
/** A potted tulip's flower on its own (base at y 0, the pot's soil): red, yellow, or broken. */
export const flRed = () => tulip(0, 0, 1.15, RED[0], RED[1], LEAF, LEAF_D);
export const flYellow = () => tulip(0, 0, 1.15, YEL[0], YEL[1], LEAF, LEAF_D);
export const flStriped = () => tulip(0, 0, 1.15, '#C02A2A', '#8E1B1B', LEAF, LEAF_D, true);
/** The broken tulip in the bed (bigger, it is the one the reader looks at). */
export const broken = () => tulip(0, 0, 1.3, '#C02A2A', '#8E1B1B', LEAF, LEAF_D, true, 0.04);
/** A tulip bulb, dug up: brown tunic, roots, and two tiny offsets at its side (frame: its top at y 0). */
export function bulb() {
  const o = [];
  for (const dx of [-2.4, -0.8, 0.8, 2.4]) o.push(line(`M${dx},11 l${dx * 0.6},4`, '#D8C9A6', 0.6));
  o.push(fill('M0,0 C-2,2 -5.6,5 -5.4,8.4 C-5.2,11 -2.4,12 0,12 C2.4,12 5.2,11 5.4,8.4 C5.6,5 2,2 0,0 Z', '#A06A3E', 0.7));
  o.push(flat('M0,0 C2,2 5.6,5 5.4,8.4 C5.2,11 2.4,12 0.6,12 C2.6,8 2.4,4 0,0 Z', '#7E4E2A'));
  o.push(fill('M6.4,8 C5.8,9.4 6,11.4 7.6,11.6 C9.2,11.4 9.4,9.4 8.6,8 C8,7.2 7,7.2 6.4,8 Z', '#B07A48', 0.5));
  o.push(fill('M-6.4,9 C-7,10.2 -6.8,11.8 -5.6,11.9 C-4.4,11.8 -4.2,10.2 -4.8,9 C-5.2,8.4 -6,8.4 -6.4,9 Z', '#B07A48', 0.5));
  return o.join('');
}
/** A wooden plant tag painted with what the pot will give: a red tulip, a broken one, or nothing. */
function tag(kind) {
  const o = [];
  o.push(rect(-0.9, -2, 1.8, 16, '#B88C5E', 0.4));
  o.push(rect(-8, -17, 16, 15, '#F1E6C8', 0.8));
  o.push(box(-7.4, -16.4, 14.8, 1.6, '#E0D2AE'));
  if (kind === 'bare') {
    o.push(fill('M-5,-5 C-3,-8.6 3,-8.6 5,-5 Z', '#7E5A3A', 0.5));
    o.push(line('M-4,-12 L4,-6 M4,-12 L-4,-6', '#5A4636', 0.9));
  } else {
    o.push(line('M0,-4.4 L0,-9.4', LEAF_D, 0.9));
    o.push(flat('M0,-4.4 C-2.6,-5.6 -3.4,-7.6 -3,-9 C-1.6,-7.4 -0.6,-6 0,-4.4 Z', LEAF));
    const c = kind === 'red' ? RED[0] : '#F6F1EA';
    o.push(fill('M-3,-9.4 C-3.4,-12 -2.6,-14.6 -1.4,-15 L0,-13.6 L1.4,-15 C2.6,-14.6 3.4,-12 3,-9.4 C2,-8.4 -2,-8.4 -3,-9.4 Z', c, 0.5));
    if (kind === 'striped') {
      o.push(line('M-1.8,-9.2 L-1.6,-13.8 M0,-9 L0,-13.4 M1.8,-9.2 L1.6,-13.8', '#C02A2A', 0.9));
    }
  }
  return o.join('');
}
export const tagRed = () => tag('red');
export const tagStriped = () => tag('striped');
export const tagBare = () => tag('bare');
/** A heavy brass price tag on its loop of string (frame: the string's top at y 0). */
export function priceTag() {
  const o = [];
  o.push(line('M0,0 L0,5', '#7A6A4E', 0.7));
  o.push(fill('M-5,5 L5,5 L6.6,8 L6.6,17 L-6.6,17 L-6.6,8 Z', '#CFA23C', 0.8));
  o.push(flat('M2,5 L5,5 L6.6,8 L6.6,17 L2,17 Z', '#A88028'));
  o.push(circ(0, 8, 1.3, '#5A4A2E', 0.4));
  o.push(line('M-3.6,12 L3.6,12 M-3.6,14.6 L2,14.6', '#7A5A1C', 0.7));
  return o.join('');
}
/** One striped bulb on a velvet cloth (frame: the cloth lies on y 0). */
export function velvet() {
  const o = [];
  o.push(fill('M-16,0 L-13,-3.4 L13,-3.4 L16,0 Z', '#7A2440', 0.8));
  o.push(flat('M6,-3.4 L13,-3.4 L16,0 L8,0 Z', '#5C1A30'));
  o.push(line('M-15,-0.8 L15,-0.8', '#C9A23A', 0.6));
  o.push(fill('M0,-15 C-2,-13 -5.4,-10 -5.2,-6.8 C-5,-4.2 -2.4,-3.4 0,-3.4 C2.4,-3.4 5,-4.2 5.2,-6.8 C5.4,-10 2,-13 0,-15 Z', '#A06A3E', 0.7));
  o.push(flat('M0,-15 C2,-13 5.4,-10 5.2,-6.8 C5,-4.2 2.4,-3.4 0.6,-3.4 C2.6,-7 2.4,-11 0,-15 Z', '#7E4E2A'));
  return o.join('');
}

const at = (name, fn, view) => ({ name: `tulip1-${name}`, svg: fn, view, box: view });
const FULL = { x: 0, y: 214, w: 400, h: 300 };
const atB = (name, fn) => ({ name: `tulip1-${name}`, svg: fn, view: FULL, box: { x: 400, y: 214, w: 400, h: 300 } });
export const ART = [
  at('a-far', gardenFarDay, FULL),
  at('a-mid', gardenMidDay, FULL),
  at('a-far-night', gardenFarNight, FULL),
  at('a-mid-night', gardenMidNight, FULL),
  at('a-tree', treeSpring, { x: 176, y: 300, w: 92, h: 90 }),
  at('gate', gate, { x: 300, y: 400, w: 38, h: 54 }),
  at('rows1', rows1, { x: 0, y: 436, w: 186, h: 50 }),
  at('rows2', rows2, { x: 186, y: 436, w: 164, h: 50 }),
  at('barrow', barrow, { x: -10, y: -52, w: 64, h: 54 }),
  atB('b-far', cornerFar),
  atB('b-mid', cornerMid),
  { name: 'tulip1-bench', svg: bench, view: { x: 164, y: 462, w: 112, h: 40 }, box: { x: 564, y: 462, w: 112, h: 40 } },
  { name: 'tulip1-plank', svg: plank, view: { x: 294, y: 468, w: 104, h: 34 }, box: { x: 694, y: 468, w: 104, h: 34 } },
  at('pot', pot, { x: -12, y: -17, w: 24, h: 18 }),
  at('fl-red', flRed, { x: -10, y: -38, w: 20, h: 39 }),
  at('fl-yellow', flYellow, { x: -10, y: -38, w: 20, h: 39 }),
  at('fl-striped', flStriped, { x: -10, y: -38, w: 20, h: 39 }),
  at('broken', broken, { x: -11, y: -43, w: 22, h: 44 }),
  at('bulb', bulb, { x: -9, y: -1, w: 18, h: 17 }),
  at('tag-red', tagRed, { x: -9, y: -18, w: 18, h: 33 }),
  at('tag-striped', tagStriped, { x: -9, y: -18, w: 18, h: 33 }),
  at('tag-bare', tagBare, { x: -9, y: -18, w: 18, h: 33 }),
  at('price', priceTag, { x: -8, y: -1, w: 16, h: 19 }),
  at('velvet', velvet, { x: -17, y: -16, w: 34, h: 17 }),
];
