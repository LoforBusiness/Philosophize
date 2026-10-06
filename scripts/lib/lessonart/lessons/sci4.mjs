// science-foundations-4, "Why Measure More Than Once?" — A PLAYGROUND SWING (LESSON_RULES
// AM13). The things on this stage whose shape is a curve, drawn as curves against fetched
// references and baked to pictures by `node scripts/make-lesson-art.mjs <name>`.
//
// Flat fills lit from the top left, a shaded side, one outline; real colours. A thing far
// off is outlined in a darker shade of its own colour rather than in ink, so the park
// stays behind the two people in it. Zero imports.

const INK = '#2B2420';

/** A filled shape with an outline. */
const fill = (d, c, line = INK, w = 0.6) => `<path d="${d}" fill="${c}" stroke="${line}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"/>`;
/** A shade or highlight laid inside a shape, with no outline. */
const tone = (d, c, o = 1) => `<path d="${d}" fill="${c}" opacity="${o}"/>`;
/** A drawn line. */
const line = (d, c, w) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;

/** A tiny repeatable random, so a canopy's edge is the same every bake. */
function rnd(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}
/** A closed smooth path through points (Catmull-Rom, as cubic Béziers). */
function smooth(pts) {
  const n = pts.length;
  const f = (v) => v.toFixed(2);
  let d = `M${f(pts[0][0])},${f(pts[0][1])}`;
  for (let k = 0; k < n; k++) {
    const p0 = pts[(k - 1 + n) % n], p1 = pts[k], p2 = pts[(k + 1) % n], p3 = pts[(k + 2) % n];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${f(c1[0])},${f(c1[1])} ${f(c2[0])},${f(c2[1])} ${f(p2[0])},${f(p2[1])}`;
  }
  return d + ' Z';
}
/**
 * A leafy canopy's outline: ONE mass with a scalloped edge (the reference's lesson — five
 * equal lobes is broccoli). `n` lobes round an ellipse, each pushed out by its own amount,
 * flattened underneath where the crown is lifted off the trunk.
 */
function canopy(cx, cy, rx, ry, n, seed, flat = 0.55) {
  // points round an ellipse, each joined to the next by a convex bump: a cloud of leaf
  // clumps meeting in small notches, never a star of spikes
  const r = rnd(seed);
  const pts = [];
  for (let k = 0; k < n; k++) {
    const a = (k / n) * Math.PI * 2 - Math.PI / 2 + (r() - 0.5) * 0.12;
    const out = 0.92 + 0.08 * r();
    const x = cx + Math.cos(a) * rx * out;
    let y = cy + Math.sin(a) * ry * out;
    if (y > cy) y = cy + (y - cy) * flat;
    pts.push([x, y]);
  }
  const f = (v) => v.toFixed(2);
  let d = 'M' + f(pts[0][0]) + ',' + f(pts[0][1]);
  for (let k = 0; k < n; k++) {
    const p = pts[k], q = pts[(k + 1) % n];
    const mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2;
    const dx = mx - cx, dy = my - cy;
    const len = Math.hypot(dx, dy) || 1;
    const bulge = 0.5 * Math.hypot(q[0] - p[0], q[1] - p[1]) * (0.7 + 0.35 * r());
    d += ' Q' + f(mx + (dx / len) * bulge) + ',' + f(my + (dy / len) * bulge) + ' ' + f(q[0]) + ',' + f(q[1]);
  }
  return d + ' Z';
}

// ── the park behind the swing: a far line of trees, two near ones, a clipped hedge ──
// REFERENCES (scratchpad/ref/sci4-parktree-1, -2, -3: the People's Park, Limerick): a
// town park's lime and plane trees are single heavy crowns with a scalloped edge, lifted
// clear on a trunk that forks a third of the way up; a line of further trees is the same
// shape smaller, paler and bluer with the distance; a clipped hedge is a flat-topped
// green wall whose top is lit and whose face goes darker toward the ground (and the
// playground hedge in sci4-swing-2). Laid in SCENE units: x 0–400, y 330–448, its foot
// tucked under the mown grass that starts at 446.
export const PARK_VIEW = { x: 0, y: 330, w: 400, h: 118 };
function park() {
  const FAR = '#A9C79A', FARD = '#93B385';
  const LEAF = '#5F8E3B', LEAFD = '#45692A', LEAFL = '#7FAA55', LEAFO = '#2F4A1D';
  const BARK = '#6B5643', BARKD = '#4E3E30';
  const HEDGE = '#4F7A30', HEDGED = '#3B5C24', HEDGEL = '#6E9A44';
  const out = [];
  // the far line of trees, all across, one silhouette with a soft top
  const farTop = [];
  const r = rnd(7);
  for (let x = -6; x <= 416; x += 13) farTop.push([x, 404 - 10 * r() - (Math.sin(x / 37) + 1) * 4]);
  let farD = `M-10,452 L-10,${farTop[0][1].toFixed(1)}`;
  for (let k = 1; k < farTop.length; k++) {
    const [x0, y0] = farTop[k - 1];
    const [x1, y1] = farTop[k];
    farD += ` Q${((x0 + x1) / 2).toFixed(1)},${(Math.min(y0, y1) - 7).toFixed(1)} ${x1.toFixed(1)},${y1.toFixed(1)}`;
  }
  farD += ' L412,452 Z';
  out.push(fill(farD, FAR, FARD, 0.5));
  out.push(tone('M-10,452 L-10,428 C80,424 200,430 300,426 C350,424 380,427 412,426 L412,452 Z', FARD, 0.8));
  // three near trees: a broad lime behind the student's side, one at either edge. Each
  // crown is one mass, shaded INSIDE itself (clipped to its own outline) and outlined
  // last, so no shade can spill past the edge.
  let clipN = 0;
  const tree = (x, top, rx, ry, seed) => {
    const cy = top + ry;
    const foot = cy + ry * 0.78;
    const crown = canopy(x, cy, rx * 0.9, ry * 0.86, 15, seed, 0.82);
    // the trunk, flaring at the root and forking into two limbs that vanish into the crown
    out.push(fill(`M${x - 4.2},450 C${x - 3.4},${foot + 16} ${x - 3},${foot + 6} ${x - 7.5},${foot - 6} L${x - 4},${foot - 7} C${x - 1},${foot - 1} ${x + 1},${foot - 1} ${x + 4},${foot - 8} L${x + 7.6},${foot - 6} C${x + 3.4},${foot + 6} ${x + 3.4},${foot + 16} ${x + 4.6},450 Z`, BARK, LEAFO, 0.55));
    out.push(tone(`M${x + 1.2},450 C${x + 1.4},${foot + 16} ${x + 1.8},${foot + 6} ${x + 5.4},${foot - 6.4} L${x + 7.6},${foot - 6} C${x + 3.4},${foot + 6} ${x + 3.4},${foot + 16} ${x + 4.6},450 Z`, BARKD));
    const id = `sci4c${clipN++}`;
    out.push(`<clipPath id="${id}"><path d="${crown}"/></clipPath>`);
    out.push(`<path d="${crown}" fill="${LEAF}"/>`);
    out.push(`<g clip-path="url(#${id})">`);
    // the side away from the lamp, then leaf masses inside it in both lights
    out.push(tone(canopy(x + rx * 0.42, cy + ry * 0.5, rx * 0.95, ry * 0.75, 11, seed + 1, 0.9), LEAFD));
    out.push(tone(canopy(x - rx * 0.3, cy - ry * 0.38, rx * 0.5, ry * 0.42, 8, seed + 2, 0.85), LEAFL, 0.95));
    out.push(tone(canopy(x + rx * 0.28, cy - ry * 0.62, rx * 0.26, ry * 0.2, 6, seed + 3, 0.85), LEAFL, 0.8));
    out.push(tone(canopy(x - rx * 0.62, cy + ry * 0.1, rx * 0.26, ry * 0.22, 6, seed + 4, 0.85), LEAFL, 0.55));
    out.push(tone(canopy(x + rx * 0.1, cy + ry * 0.12, rx * 0.22, ry * 0.18, 6, seed + 5, 0.85), LEAFD, 0.75));
    out.push(tone(canopy(x - rx * 0.12, cy + ry * 0.58, rx * 0.4, ry * 0.2, 7, seed + 6, 0.85), LEAFD, 0.9));
    out.push('</g>');
    out.push(`<path d="${crown}" fill="none" stroke="${LEAFO}" stroke-width="0.6" stroke-linejoin="round"/>`);
  };
  tree(236, 338, 50, 34, 31);
  tree(378, 352, 38, 27, 53);
  tree(14, 358, 32, 23, 77);
  // the clipped hedge: a flat lit top, a face darker at its foot, leaf scallops along it
  const hr = rnd(91);
  let hedgeTop = 'M-8,430';
  for (let x = 2; x <= 412; x += 10) hedgeTop += ` Q${x - 5},${(426.4 + hr() * 1.4).toFixed(1)} ${x},${(428.6 + hr() * 1.6).toFixed(1)}`;
  out.push(fill(`${hedgeTop} L412,452 L-8,452 Z`, HEDGE, LEAFO, 0.6));
  out.push(tone(`${hedgeTop} L412,433.4 C300,434 100,433 -8,434 Z`, HEDGEL, 0.9));
  out.push(tone('M-8,441 C100,440 300,441.4 412,440.4 L412,452 L-8,452 Z', HEDGED, 0.95));
  const tx = rnd(5);
  for (let x = 3; x < 400; x += 9) {
    const y = 436 + tx() * 3;
    out.push(tone(`M${x},${y.toFixed(1)} q2.4,-2.6 4.8,0 q-2.4,1.6 -4.8,0 Z`, HEDGED, 0.55));
  }
  return out.join('');
}

// ── the swing's seat: a black rubber strap on two clamps ──────────────────────────
// REFERENCES (scratchpad/ref/sci4-swing-1, -2): a park swing's seat is a curved STRAP of
// black rubber, its two ends held in steel clamps that the chains' last links hook into;
// it sags a little in the middle and its edge shows a lit lip. Turned the way the frame
// is, it slants up and away. Drawn about its middle, in the old 16 × 16 box (−8 … 8).
export const SEAT_VIEW = { x: -8, y: -8, w: 16, h: 16 };
function seat() {
  const RUB = '#33363A', RUBD = '#1F2124', RUBL = '#5A5E64', STEEL = '#A9AEB3', STEELD = '#6B7075';
  return [
    // the strap, sagging between its clamps, with its thickness under it
    fill('M-6.6,2.2 C-3,4.2 2.4,1.8 6.6,-2.8 L6.8,-1 C2.8,3.8 -3,6.4 -6.6,4.2 Z', RUB, INK, 0.45),
    tone('M-6.6,3.6 C-3,5.6 2.6,3 6.8,-1.6 L6.8,-1 C2.8,3.8 -3,6.4 -6.6,4.2 Z', RUBD),
    line('M-5.6,2.6 C-2.6,4.2 2,2 5.6,-1.8', RUBL, '0.5'),
    // the two clamps, each a little steel saddle with a bolt
    // (each centred under its chain's end: the near one at (−4.5, 2.1), the far at (4.5, −2.1))
    fill('M-5.8,1.6 L-3.2,1.4 L-3,4.6 L-5.6,5 Z', STEEL, INK, 0.4),
    tone('M-4.4,1.5 L-3.2,1.4 L-3,4.6 L-4.2,4.8 Z', STEELD),
    fill('M3.2,-2.8 L5.8,-3.2 L6,0 L3.4,0.4 Z', STEEL, INK, 0.4),
    tone('M4.6,-3 L5.8,-3.2 L6,0 L4.8,0.2 Z', STEELD),
    // the chain's last links hooked into the clamps (the chains themselves are drawn by the scene)
    `<ellipse cx="-4.5" cy="1" rx="0.8" ry="1.2" fill="none" stroke="${STEELD}" stroke-width="0.5"/>`,
    `<ellipse cx="4.5" cy="-3.3" rx="0.8" ry="1.2" fill="none" stroke="${STEELD}" stroke-width="0.5"/>`,
  ].join('');
}

const same = (v) => ({ view: v, box: v });
export const ART = [
  { name: 'sci4-park', svg: park, ...same(PARK_VIEW) },
  { name: 'sci4-seat', svg: seat, ...same(SEAT_VIEW) },
];
