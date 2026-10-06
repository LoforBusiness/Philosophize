// history-foundations-1, "What Is History?" — the bakery's broken window, drawn
// (LESSON_RULES AM13). Each picture replaces a shape-built object of the same box, so
// nothing on the stage moves. Flat fills lit from the top left, a shaded side, one dark
// outline. Zero imports.

const INK = '#2B2420';
const P = (n) => +n.toFixed(2);

const fill = (d, c, w) => `<path d="${d}" fill="${c}" stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"/>`;
const tone = (d, c, o = 1) => `<path d="${d}" fill="${c}"${o < 1 ? ` opacity="${o}"` : ''}/>`;
const line = (d, c, w, o = 1) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"${o < 1 ? ` opacity="${o}"` : ''}/>`;
const poly = (pts) => `M${pts.map(([x, y]) => `${P(x)},${P(y)}`).join(' L')} Z`;

/** A crack: a sliver that tapers from `w0` to nothing along a polyline. */
function crack(pts, w0, c, o = 1) {
  const L = [], R = [];
  for (let k = 0; k < pts.length; k++) {
    const [x, y] = pts[k];
    const [ax, ay] = pts[Math.max(0, k - 1)];
    const [bx, by] = pts[Math.min(pts.length - 1, k + 1)];
    let dx = bx - ax, dy = by - ay;
    const n = Math.hypot(dx, dy) || 1; dx /= n; dy /= n;
    const w = (w0 * (1 - k / (pts.length - 1))) / 2 + 0.04;
    L.push([x - dy * w, y + dx * w]); R.push([x + dy * w, y - dx * w]);
  }
  return tone(poly([...L, ...R.reverse()]), c, o);
}
const polar = (a, r) => { const t = (a * Math.PI) / 180; return [Math.sin(t) * r, -Math.cos(t) * r]; };

// ── the football in the window (16 × 16, centred on the ball) ────────────────
// REFERENCE: "GermanyFootball.svg" (Wikimedia Commons, public domain) — the classic
// 32-panel ball seen three-quarter on: one black pentagon low of centre, two over its
// shoulders, part-pentagons at the rims, white hexagons between, every seam a curve.
// The panel corners below are read off that drawing, on a unit circle.
const BALL_PENTS = [
  [[-0.332, 0.072], [0.110, 0.147], [0.175, 0.568], [-0.217, 0.741], [-0.523, 0.423]],
  [[-0.776, -0.397], [-0.689, -0.713], [-0.320, -0.888], [-0.171, -0.685], [-0.472, -0.374]],
  [[0.285, -0.579], [0.540, -0.729], [0.841, -0.404], [0.766, -0.110], [0.425, -0.192]],
  [[0.836, 0.311], [1.05, 0.33], [0.68, 0.86], [0.50, 0.86], [0.556, 0.631]],
  [[-0.970, -0.040], [-0.841, 0.357], [-0.825, 0.537], [-1.1, 0.5], [-1.1, -0.05]],
];
const BALL_SEAMS = [
  [[-0.472, -0.374], [-0.332, 0.072], -0.06], [[-0.171, -0.685], [0.285, -0.579], 0.05],
  [[0.425, -0.192], [0.110, 0.147], 0.04], [[0.175, 0.568], [0.556, 0.631], -0.04],
  [[-0.217, 0.741], [-0.222, 1.0], 0.02], [[-0.523, 0.423], [-0.841, 0.357], 0.04],
  [[-0.776, -0.397], [-0.970, -0.040], -0.05], [[0.766, -0.110], [0.836, 0.311], 0.04],
  [[-0.320, -0.888], [-0.02, -1.0], 0.03], [[0.540, -0.729], [0.35, -0.95], -0.03],
  [[0.841, -0.404], [0.97, -0.33], 0.02],
];
export function football() {
  const R = 7.4, s = (v) => v * R;
  const pt = ([x, y]) => `${P(s(x))},${P(s(y))}`;
  const ow = '0.7';
  const out = [`<defs><clipPath id="h1ball"><circle cx="0" cy="0" r="${R}"/></clipPath></defs>`];
  out.push(`<circle cx="0" cy="0" r="${R}" fill="#F4F4F0"/>`);
  out.push(`<g clip-path="url(#h1ball)">`);
  // the shaded side, low and to the right, away from the lamp
  out.push(tone(`M${P(-R)},${P(R * 0.25)} C${P(-R * 0.4)},${P(R * 1.1)} ${P(R * 0.9)},${P(R * 0.9)} ${P(R)},${P(-R * 0.3)} L${P(R * 1.2)},${P(R * 1.2)} L${P(-R * 1.2)},${P(R * 1.2)} Z`, '#C8C9C2'));
  for (const pg of BALL_PENTS) out.push(`<path d="M${pg.map(pt).join(' L')} Z" fill="#232323" stroke="#232323" stroke-width="0.25" stroke-linejoin="round"/>`);
  // a lit face on the pentagon nearest the lamp
  out.push(tone(`M${pt([-0.70, -0.70])} L${pt([-0.36, -0.84])} L${pt([-0.26, -0.70])} L${pt([-0.62, -0.62])} Z`, '#555555'));
  for (const [a, b, bend] of BALL_SEAMS) {
    const mx = (a[0] + b[0]) / 2 - (b[1] - a[1]) * bend * 3, my = (a[1] + b[1]) / 2 + (b[0] - a[0]) * bend * 3;
    out.push(line(`M${pt(a)} Q${pt([mx, my])} ${pt(b)}`, '#2A2A2A', '0.32'));
  }
  out.push('</g>');
  // the gloss the lamp puts on it, and the one outline
  out.push(`<ellipse cx="${P(-R * 0.42)}" cy="${P(-R * 0.36)}" rx="${P(R * 0.22)}" ry="${P(R * 0.12)}" transform="rotate(-38 ${P(-R * 0.42)} ${P(-R * 0.36)})" fill="#FFFFFF" opacity="0.85"/>`);
  out.push(`<circle cx="0" cy="0" r="${R}" fill="none" stroke="${INK}" stroke-width="${ow}"/>`);
  return out.join('');
}

// ── the hole in the window (56 × 50, centred on the break) ───────────────────
// REFERENCES: "Broken-Window-20130513.jpg" and "Broken window … Praça de Londres,
// Lisbon" (Wikimedia Commons, CC BY-SA) and Lorc's "Cracked glass" (CC BY): a ball
// through plate glass leaves a JAGGED hole — sharp points of the pane still in the frame
// round its rim — with long RADIAL cracks running out from it and short cross cracks
// joining them in rings, so the glass round the hole is crazed into pieces that each
// catch the light a little differently. The dark of the shut shop shows through.
const HOLE = [
  [0, -11], [3, -7], [8, -10], [7, -4], [13, -3], [8, 1], [12, 6], [5, 5], [6, 11],
  [1, 7], [-4, 12], [-4, 6], [-11, 8], [-7, 2], [-13, -1], [-7, -3], [-10, -9], [-4, -6],
];
const RADIALS = [
  [[2, -10], [3, -16], [1, -22], [3, -25]],
  [[10, -8], [15, -13], [19, -19], [25, -22]],
  [[12, -2], [18, -3], [23, -6], [28, -5]],
  [[11, 5], [17, 9], [21, 15], [26, 19]],
  [[5, 10], [7, 16], [6, 21], [9, 25]],
  [[-4, 11], [-6, 17], [-11, 21], [-13, 25]],
  [[-11, 7], [-17, 10], [-21, 15], [-27, 17]],
  [[-12, -1], [-18, -2], [-23, -5], [-28, -4]],
  [[-9, -8], [-14, -13], [-17, -19], [-21, -25]],
];
// the rings of short cracks between neighbouring radials, at two radii
const RINGS = [
  [[3, -16], [15, -13]], [[15, -13], [18, -3]], [[18, -3], [17, 9]], [[17, 9], [7, 16]],
  [[7, 16], [-6, 17]], [[-6, 17], [-17, 10]], [[-17, 10], [-18, -2]], [[-18, -2], [-14, -13]],
  [[-14, -13], [3, -16]],
  [[19, -19], [23, -6]], [[21, 15], [6, 21]], [[-11, 21], [-21, 15]], [[-23, -5], [-17, -19]],
];
export function glassBreak() {
  const out = [];
  // the crazed ring: the pieces round the hole, each tipped a touch toward the lamp
  const PIECE = ['#6E8896', '#566E7A', '#7C95A2', '#4F6672', '#688290', '#5C7480', '#728C99', '#4C626D', '#6A8491'];
  for (let k = 0; k < 9; k++) {
    const a = RADIALS[k], b = RADIALS[(k + 1) % 9];
    out.push(tone(poly([a[0], a[1], a[2], b[2], b[1], b[0]]), PIECE[k], 0.55));
  }
  // the hole, with the dark of the shop behind it
  out.push(`<path d="${poly(HOLE)}" fill="#141B1F" stroke="${INK}" stroke-width="0.6" stroke-linejoin="miter"/>`);
  // the broken edge catching the light along the top and left of the hole
  out.push(line(`M${HOLE.slice(14).concat(HOLE.slice(0, 4)).map(([x, y]) => `${x},${y}`).join(' L')}`, '#E6EEF1', '0.7', 0.9));
  // a point of glass left hanging into the hole
  out.push(tone(poly([[8, 1], [3, 2], [6.5, 4.5]]), '#8FA6B1'));
  out.push(tone(poly([[-7, 2], [-3, 0.5], [-5.5, -1]]), '#8FA6B1'));
  // the radial cracks, bright where they leave the hole and fading out
  for (const r of RADIALS) out.push(crack(r, 1.3, '#E6EEF1', 0.9));
  for (const [a, b] of RINGS) out.push(crack([a, [(a[0] + b[0]) / 2 + 0.8, (a[1] + b[1]) / 2 + 0.6], b], 0.6, '#E6EEF1', 0.75));
  return out.join('');
}

// ── two loaves on the display bed (50 × 16) ──────────────────────────────────
// REFERENCES: "Artisan Loaves of Bread (Unsplash)" (CC0) and "Tin Loaf — one slash in
// the crust" (CC BY 2.0): a baker's bloomer is a long dome on a flat foot, its crust
// darkest on top and golden down the sides, cut with diagonal SLASHES that open as it
// bakes so the paler crumb shows in each; a cob is a round dome with a cross cut in it.
export function loaves() {
  const ow = '0.6';
  const CRUST = '#B9783A', TOP = '#9C5F27', LIT = '#D59A55', SHADE = '#8E5A28', CRUMB = '#EBD39A';
  const out = [];
  // the bloomer, 24 long, centred at x 13 (scene 262)
  out.push(fill('M1.5,14.6 C0.6,9.6 3.2,4.8 8,3.4 C11,2.5 16,2.5 19,3.6 C23,5 25.2,9.4 24.6,14.6 Z', CRUST, ow));
  out.push(tone('M3.2,9 C4.4,5.6 7.2,4 10.6,3.5 C8,4.8 5.6,6.8 4.6,9.6 Z', LIT));
  out.push(tone('M17,4.1 C21,5.2 24,8.8 24,14.6 L21,14.6 C21.6,10.2 20.4,6.6 17,4.1 Z', SHADE));
  out.push(tone('M5,6 C9,3.4 17,3.4 21,6 C17,4.6 9,4.6 5,6 Z', TOP));
  for (const x of [6, 10.5, 15, 19.5]) {
    out.push(`<path d="M${x - 1.6},9.4 C${x - 1},6.8 ${x + 0.4},5.4 ${x + 1.8},4.8 C${x + 1.2},6.6 ${x + 0.2},8.6 ${x - 1.6},9.4 Z" fill="${CRUMB}" stroke="${SHADE}" stroke-width="0.35"/>`);
  }
  out.push(line('M2,14.4 L24.2,14.4', SHADE, '0.5'));
  // the cob, 22 across, centred at x 38 (scene 287), a little behind
  out.push(fill('M27.6,14.6 C26.8,9.2 30.6,5 38,5 C45.4,5 49.2,9.2 48.4,14.6 Z', CRUST, ow));
  out.push(tone('M29.4,10.4 C30.4,7.4 33.2,5.8 36.4,5.4 C33.6,6.6 31.6,8.4 30.8,10.8 Z', LIT));
  out.push(tone('M42,5.8 C46,7 48.6,10 48,14.6 L45,14.6 C45.4,10.6 44.4,7.8 42,5.8 Z', SHADE));
  out.push(`<path d="M32.4,9.6 C35.4,7.6 40.6,7.6 43.6,9.6 C40.6,8.6 35.4,8.6 32.4,9.6 Z" fill="${CRUMB}" stroke="${SHADE}" stroke-width="0.35"/>`);
  out.push(`<path d="M37.2,6.2 C38.4,8 38.6,10.4 38,12.6 C37.4,10.4 37.2,8 37.2,6.2 Z" fill="${CRUMB}" stroke="${SHADE}" stroke-width="0.35"/>`);
  out.push(line('M28.2,14.4 L48,14.4', SHADE, '0.5'));
  return out.join('');
}

// ── glass on the pavement (44 × 12) ──────────────────────────────────────────
// REFERENCE: as the hole. Plate glass lands as flat slivers, long thin triangles and
// strips at every angle, each with one bright edge catching the light.
const SHARDS = [
  [[1, 9], [9, 5.5], [15, 9.4]], [[14, 10.4], [19, 7.6], [24, 10.6]], [[23, 9.6], [30, 8.4], [29, 10.2], [22.6, 10.8]],
  [[30, 10.4], [36, 4.8], [38, 10.2]], [[38.6, 9.4], [43, 8], [42.6, 10.6]],
];
export function shards() {
  const out = [];
  for (const s of SHARDS) {
    out.push(`<path d="${poly(s)}" fill="#D7E2E7" stroke="${INK}" stroke-width="0.45" stroke-linejoin="round"/>`);
    out.push(line(`M${P(s[0][0] + 0.6)},${P(s[0][1] - 0.2)} L${P(s[1][0])},${P(s[1][1] + 0.6)}`, '#FFFFFF', '0.55'));
  }
  return out.join('');
}

// ── the twig on the pavement (40 × 14, centred) ──────────────────────────────
// REFERENCE: "Twig and leaves" (geograph 603277, CC BY-SA 2.0): a thin brown stick,
// knobbly where each bud was, crooked at every node, a side shoot off it, and leaves
// with a pale midrib and a pointed tip. Lying down, so the leaves fall either side.
export function twig() {
  const BARK = '#7A5636', BARKD = '#5A3E26', LEAF = '#6E9A3A', LEAFD = '#4F7428', VEIN = '#B7D08A';
  const ow = '0.55';
  const stick = (pts, w0, w1) => {
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
    return fill(poly([...L, ...R.reverse()]), BARK, ow);
  };
  const leaf = (x, y, a, l) => {
    const d = `M0,0 C${l * 0.3},${-l * 0.32} ${l * 0.75},${-l * 0.3} ${l},0 C${l * 0.75},${l * 0.3} ${l * 0.3},${l * 0.32} 0,0 Z`;
    return `<g transform="translate(${x} ${y}) rotate(${a})">${fill(d, LEAF, ow)}`
      + tone(`M${l * 0.1},0.2 C${l * 0.35},${l * 0.26} ${l * 0.75},${l * 0.24} ${l * 0.98},0.1 Z`, LEAFD)
      + line(`M${l * 0.08},0 L${l * 0.9},0`, VEIN, '0.35') + '</g>';
  };
  return [
    stick([[-19, 4.5], [-10, 3.2], [-2, 4], [7, 2.4], [18, 3.4]], 2.1, 1.1),
    stick([[-4, 3.6], [0, -0.6], [5, -2.6]], 1.3, 0.7),
    line('M-18,4 L-3,3.4', BARKD, '0.4', 0.7),
    `<circle cx="-10" cy="3.2" r="0.9" fill="${BARKD}"/>`, `<circle cx="7" cy="2.4" r="0.8" fill="${BARKD}"/>`,
    leaf(5, -2.6, -18, 9),
    leaf(17, 3, 28, 7.5),
    leaf(-1, 0, -128, 6),
  ].join('');
}

export const ART = [
  // football(326, 444, 16, 16): drawn about the ball's centre; the scene places it there
  { name: 'hist1-ball', svg: football, view: { x: -8, y: -8, w: 16, h: 16 }, box: { x: -8, y: -8, w: 16, h: 16 } },
  // glassBreak(304, 402, 56, 50)
  { name: 'hist1-break', svg: glassBreak, view: { x: -28, y: -25, w: 56, h: 50 }, box: { x: 276, y: 377, w: 56, h: 50 } },
  // loaf(262, 444, 24, 15) and loaf(287, 445, 22, 13), on the display bed
  { name: 'hist1-loaves', svg: loaves, view: { x: 0, y: 0, w: 50, h: 16 }, box: { x: 249, y: 436, w: 50, h: 16 } },
  // glassShards(300, 476, 44, 44): its slivers lie along the foot of that square
  { name: 'hist1-shards', svg: shards, view: { x: 0, y: 0, w: 44, h: 12 }, box: { x: 278, y: 486, w: 44, h: 12 } },
  // twig(346, 481, 40, 40): its stick lies along y 489–498; drawn about (346, 492)
  { name: 'hist1-twig', svg: twig, view: { x: -20, y: -7, w: 40, h: 14 }, box: { x: -20, y: -7, w: 40, h: 14 } },
];
