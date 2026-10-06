// science-foundations-1, "What Is Science?" — the back yard, drawn (LESSON_RULES AM13).
//
// Every picture is in SCENE units, so it drops onto the stage at its box with no
// conversion: the yard (wall, pier and paving) is still scenery and is ONE picture where
// the bricks were some three hundred Views; the stepladder, the slate's frame and the two
// balls are pictures in the boxes their shape-built objects had, so nothing on the stage
// moved. Flat fills lit from the top left, a shaded side, one dark outline. Zero imports.
//
// REFERENCES (npm run ref, scratchpad/ref/f1-*):
//   f1-ladder-1   "Wooden stepladder with green top" (Commons, CC BY-SA 4.0): two front
//                 stiles splaying wider at the foot, flat treads housed into them with a lit
//                 top and a front edge in shade, a wide top board painted green, the rear
//                 legs splaying back behind with a brace between them, paint spatter.
//   f1-brickwall-1 "Garden south path to Old Palace, Hatfield House": an old garden wall in
//                 stretcher bond with the bricks no two the same red, a brick PIER standing
//                 proud of it under a stone cap with a ball finial, and ivy climbing it.
//   f1-shotput-*  a cast-iron shot put: a dark sphere, no seam, a hard highlight high on
//                 the lit side, a pitted face, a crescent of shade.
//   f1-tennis-*   a tennis ball: optic-yellow felt with a white seam as two facing curves.
//   f1-slate-*    a framed writing slate: a dark slate panel in a plain wooden frame,
//                 mitred at the corners, a ledge along the foot.

const INK = '#2B2420';

const fill = (d, c, w = 0.9) => `<path d="${d}" fill="${c}" stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"/>`;
const tone = (d, c, o = 1) => `<path d="${d}" fill="${c}"${o < 1 ? ` opacity="${o}"` : ''}/>`;
const line = (d, c, w) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const rect = (x, y, w, h, c) => `<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${w.toFixed(2)}" height="${h.toFixed(2)}" fill="${c}"/>`;
const P = (pts) => `M${pts.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(' L')} Z`;

/** A fixed, repeatable scatter: the same wall every time it is baked. */
function rng(seed) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

// ── THE YARD: brick wall, pier, coping and paving, x 0–400, y 380–518 ──────
// Where the shape-built yard put them: the wall's coping 404–413, the pier 330–374 under
// its cap at 396, the brickwork to the paving at 500, the paving 500–516.
const BRICKS = ['#A8553A', '#B15D3F', '#9C4B33', '#A65A41', '#B86846', '#954630', '#AD5A3C', '#A14F37'];
const MORTAR = '#CDB9A0';
const MORTAR_D = '#A99579';
const STONE = '#C2BBAB', STONE_L = '#DAD4C6', STONE_D = '#9E9888';
const IVY = '#4F7A3A', IVY_D = '#35592A', IVY_L = '#79A055';

function bricksIn(x0, x1, y0, y1, seed, course = 8.6, len = 19) {
  const r = rng(seed);
  const out = [];
  let row = 0;
  for (let y = y0; y < y1 - 0.01; y += course, row++) {
    const h = Math.min(course, y1 - y);
    let x = x0 - (row % 2 ? len / 2 : 0);
    for (; x < x1; x += len) {
      const a = Math.max(x, x0), b = Math.min(x + len, x1);
      if (b - a < 0.5) continue;
      const c = BRICKS[Math.floor(r() * BRICKS.length)];
      out.push(rect(a + 0.6, y + 0.6, b - a - 1.2, h - 1.2, c));
      // the brick's lit top edge, and now and then a weathered face
      out.push(rect(a + 0.6, y + 0.6, b - a - 1.2, 1.1, '#C9785A'));
      if (r() < 0.06) out.push(rect(a + 2 + r() * 6, y + 2.6, 3 + r() * 4, 1.6, '#BE7C5E'));
    }
  }
  return out.join('');
}

function ivySprig(x, y, n, seed, dir = 1) {
  // a trailing stem with leaves along it, three-lobed, darker below
  const r = rng(seed);
  const out = [];
  let cx = x, cy = y;
  const pts = [[cx, cy]];
  for (let k = 0; k < n; k++) { cx += dir * (r() * 3 - 0.8); cy += 4 + r() * 2; pts.push([cx, cy]); }
  out.push(line(`M${pts.map(([a, b]) => `${a.toFixed(1)},${b.toFixed(1)}`).join(' L')}`, IVY_D, 0.7));
  for (let k = 1; k < pts.length; k++) {
    const [a, b] = pts[k];
    const s = 2.6 + r() * 1.4;
    const side = k % 2 ? 1 : -1;
    const lx = a + side * s * 0.8, ly = b - 0.6;
    const leaf = `M${lx},${ly - s} C${lx + s * 0.9},${ly - s * 0.9} ${lx + s},${ly} ${lx},${ly + s * 0.7} C${lx - s},${ly} ${lx - s * 0.9},${ly - s * 0.9} ${lx},${ly - s} Z`;
    out.push(`<path d="${leaf}" fill="${r() < 0.4 ? IVY_L : IVY}" stroke="${IVY_D}" stroke-width="0.45"/>`);
  }
  return out.join('');
}

export function yard() {
  const o = [];
  // the brickwork behind everything, the mortar showing between the bricks
  o.push(rect(0, 413, 400, 87, MORTAR));
  o.push(bricksIn(0, 330, 413, 500, 11));
  o.push(bricksIn(374, 400, 413, 500, 12));
  // the coping's shadow on the brick under it, and the damp band at the foot
  o.push(tone('M0,413 L330,413 L330,416.4 L0,416.4 Z', '#5A2A1C', 0.45));
  o.push(tone('M374,413 L400,413 L400,416.4 L374,416.4 Z', '#5A2A1C', 0.45));
  o.push(tone('M0,492 L400,492 L400,500 L0,500 Z', '#4A2418', 0.28));
  // the coping: stone slabs along the top, a lit top face and a front in shade
  o.push(fill('M-1,404 L330,404 L330,413 L-1,413 Z', STONE));
  o.push(tone('M0,404.5 L330,404.5 L330,407 L0,407 Z', STONE_L));
  o.push(tone('M0,410.6 L330,410.6 L330,413 L0,413 Z', STONE_D));
  for (const x of [42, 96, 150, 205, 262]) o.push(line(`M${x},404.6 L${x},412.6`, STONE_D, 0.8));
  o.push(fill('M374,404 L401,404 L401,413 L374,413 Z', STONE));
  o.push(tone('M374.4,404.5 L400,404.5 L400,407 L374.4,407 Z', STONE_L));
  o.push(tone('M374.4,410.6 L400,410.6 L400,413 L374.4,413 Z', STONE_D));
  // the pier, standing proud: its own brick, its right face in shade, a stone band
  o.push(rect(330, 402, 44, 98, MORTAR_D));
  o.push(bricksIn(330, 374, 402, 500, 13, 8.6, 14.6));
  o.push(tone('M366,402 L374,402 L374,500 L366,500 Z', '#3A1A10', 0.32));
  o.push(fill('M329,452 L375,452 L375,457.5 L329,457.5 Z', STONE));
  o.push(tone('M329.5,452.4 L374.5,452.4 L374.5,454 L329.5,454 Z', STONE_L));
  o.push(fill('M330,402 L374,402 L374,500 L330,500 Z', 'none', 1.1));
  // the pier's cap with its overhang and its shadow, and a stone ball on top
  o.push(tone('M330,402 L374,402 L374,406 L330,406 Z', '#3A1A10', 0.35));
  o.push(fill('M326,396 L378,396 L377,402.4 L327,402.4 Z', STONE));
  o.push(tone('M326.6,396.5 L377.4,396.5 L377.2,398.4 L326.8,398.4 Z', STONE_L));
  o.push(fill('M345.5,396 L358.5,396 L357,393 L347,393 Z', STONE_D));
  o.push(fill('M352,380.4 C356.6,380.4 359.4,383.6 359.4,387.2 C359.4,390.8 356.4,393.4 352,393.4 C347.6,393.4 344.6,390.8 344.6,387.2 C344.6,383.6 347.4,380.4 352,380.4 Z', STONE));
  o.push(tone('M355,382.4 C358,383.8 359,386.4 358.6,388.8 C357.4,391.6 354.6,392.8 352,392.8 C355.6,391 357,387.6 355,382.4 Z', STONE_D));
  o.push(tone('M348.6,383.2 C349.6,382 351.2,381.6 352.4,381.8 C351,382.8 350,384 349.8,385.6 Z', STONE_L));
  // ivy, trailing down the pier's left edge from under its cap, and a sprig at the right
  o.push(ivySprig(332, 403, 7, 31, 1));
  o.push(ivySprig(338, 404, 4, 37, -1));
  o.push(ivySprig(392, 412, 6, 41, -1));
  // the paving: square grey flags, a lit top, a front edge in shade, the joints
  o.push(fill('M-1,500 L401,500 L401,516.4 L-1,516.4 Z', '#A4A69F'));
  o.push(tone('M0,500.5 L400,500.5 L400,502.2 L0,502.2 Z', '#C4C5BE'));
  o.push(tone('M0,511.8 L400,511.8 L400,516 L0,516 Z', '#82847D'));
  for (const x of [32, 96, 160, 224, 288, 352]) o.push(line(`M${x},500.6 L${x + (x - 200) * 0.03},511.6`, '#82847D', 1.1));
  const r = rng(77);
  for (let k = 0; k < 18; k++) {
    const x = r() * 400, y = 503 + r() * 7;
    o.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(0.35 + r() * 0.4).toFixed(2)}" fill="#8E9089"/>`);
  }
  return o.join('');
}

// ── THE STEPLADDER, x 229–271, y 424–500 ─────────────────────────────────────
// Its treads' tops at 448, 466 and 484 (where a foot stands) and its top board at 424,
// as the shape-built ladder had them.
const PINE = '#B27F4E', PINE_L = '#CFA06E', PINE_D = '#875A33', PINE_DD = '#6A4426';
const GREEN = '#3E7A4E', GREEN_L = '#5C9A6A', GREEN_D = '#2D5B3A';
const lx = (y) => 240.8 - ((240.8 - 234.9) * (y - 427)) / (499.3 - 427);   // the left stile's centre
const rx = (y) => 259.2 + ((265.1 - 259.2) * (y - 427)) / (499.3 - 427);   // the right stile's centre
export function ladder() {
  const o = [];
  // the rear legs, splayed back behind, and the brace between them, in shade
  o.push(fill(P([[257.6, 428], [261, 428], [271.6, 499.4], [268, 499.4]]), PINE_D, 0.8));
  o.push(fill(P([[262.6, 470.6], [267.6, 470.6], [267.8, 473], [263, 473]]), PINE_DD, 0.5));
  // the treads, each a lit top and a front edge in shade, housed between the stiles
  for (const ty of [448, 466, 484]) {
    const a = lx(ty) - 1.6, b = rx(ty) + 1.6;
    o.push(fill(P([[a + 1.2, ty - 0.6], [b - 1.2, ty - 0.6], [b, ty + 2.6], [a, ty + 2.6]]), PINE_L, 0.7));
    o.push(fill(P([[a, ty + 2.6], [b, ty + 2.6], [b, ty + 5.4], [a, ty + 5.4]]), PINE_D, 0.7));
    // paint spatter on the step, from years of decorating
    o.push(`<circle cx="${(a + 6 + (ty % 7)).toFixed(1)}" cy="${(ty + 0.9).toFixed(1)}" r="0.55" fill="#F2EEE4"/>`);
    o.push(`<circle cx="${(b - 7).toFixed(1)}" cy="${(ty + 1.3).toFixed(1)}" r="0.4" fill="${GREEN_L}"/>`);
  }
  // the two front stiles, splaying wider at the foot, the left one lit along its edge
  const stile = (cx0, cx1) => P([[cx0 - 1.8, 427], [cx0 + 1.8, 427], [cx1 + 1.9, 499.6], [cx1 - 1.9, 499.6]]);
  o.push(fill(stile(240.8, 234.9), PINE, 0.85));
  o.push(line('M239.3,429 L233.4,498.4', PINE_L, 0.9));
  o.push(fill(stile(259.2, 265.1), PINE, 0.85));
  o.push(line('M258,429 L264,498.4', PINE_L, 0.6));
  o.push(line('M260.8,429 L267,498.4', PINE_D, 0.8));
  // the bolts that hold the treads, and a scuffed foot on each stile
  for (const ty of [448, 466, 484]) {
    o.push(`<circle cx="${lx(ty).toFixed(2)}" cy="${(ty + 4).toFixed(2)}" r="0.55" fill="${INK}"/>`);
    o.push(`<circle cx="${rx(ty).toFixed(2)}" cy="${(ty + 4).toFixed(2)}" r="0.55" fill="${INK}"/>`);
  }
  // the top board, painted green, overhanging the stiles, its front edge in shade
  o.push(fill(P([[235.4, 423.6], [264.6, 423.6], [265.4, 428.2], [234.6, 428.2]]), GREEN, 0.85));
  o.push(tone(P([[236.2, 424.2], [263.8, 424.2], [264, 425.3], [236, 425.3]]), GREEN_L));
  o.push(fill(P([[234.6, 428.2], [265.4, 428.2], [265.4, 430.8], [234.6, 430.8]]), GREEN_D, 0.85));
  o.push(`<circle cx="241.5" cy="425.6" r="0.55" fill="#F2EEE4"/><circle cx="257" cy="426.2" r="0.4" fill="#F2EEE4"/>`);
  return o.join('');
}

// ── THE SLATE'S FRAME, x 4–132, y 420–500 ────────────────────────────────────
// The slate face, where the scene chalks, is 11.7–119.2 × 427.2–492.8: the frame round it,
// mitred, lit along the top and the left, its own edge showing on the right where it
// leans back against the wall, and a chalk ledge along its foot.
export function slateFrame() {
  const o = [];
  const X0 = 4, X1 = 126.9, Y0 = 420, Y1 = 500;
  const fx0 = 11.7, fx1 = 119.2, fy0 = 427.2, fy1 = 492.8;
  const OAK = '#8E5F37', OAK_L = '#B07C4A', OAK_D = '#6B4829';
  // the board's edge, leaning back, in shade
  o.push(fill(P([[X1 - 0.6, Y0 + 1.6], [X1 + 4.8, Y0 + 3.2], [X1 + 4.8, Y1 - 0.4], [X1 - 0.6, Y1]]), OAK_D, 0.9));
  // the frame: four mitred rails, lit top and left, shaded bottom and right
  o.push(fill(P([[X0, Y0], [X1, Y0], [fx1, fy0], [fx0, fy0]]), OAK_L, 0.9));
  o.push(fill(P([[X0, Y0], [fx0, fy0], [fx0, fy1], [X0, Y1]]), OAK, 0.9));
  o.push(fill(P([[X1, Y0], [X1, Y1], [fx1, fy1], [fx1, fy0]]), OAK_D, 0.9));
  o.push(fill(P([[X0, Y1], [fx0, fy1], [fx1, fy1], [X1, Y1]]), OAK, 0.9));
  // the grain along the rails
  o.push(line(`M${X0 + 9},${Y0 + 2.6} L${X1 - 12},${Y0 + 2.4} M${X0 + 2.4},${Y0 + 12} L${X0 + 2.8},${Y1 - 14}`, OAK, 0.5));
  // the slate itself, with the ghosts of old wiping on it
  o.push(fill(P([[fx0, fy0], [fx1, fy0], [fx1, fy1], [fx0, fy1]]), '#3C4347', 0.7));
  o.push(tone(P([[fx0, fy0], [fx1, fy0], [fx1, fy0 + 2.4], [fx0, fy0 + 2.4]]), '#262B2E', 0.8));
  o.push(line('M22,470 C40,462 70,474 98,463 M30,484 C52,478 84,488 108,480', '#5B6368', 2.6).replace('stroke="#5B6368"', 'stroke="#5B6368" opacity="0.22"'));
  // the chalk ledge along the foot, with a stub of chalk on it
  o.push(fill(P([[X0 + 6, Y1 - 4.4], [X1 - 6, Y1 - 4.4], [X1 - 5, Y1 - 1.6], [X0 + 5, Y1 - 1.6]]), OAK_L, 0.7));
  o.push(fill('M96,494.2 L103.6,494.2 L103.6,496 L96,496 Z', '#F4F1EA', 0.45));
  return o.join('');
}

// ── THE TWO BALLS, each drawn about its own centre ───────────────────────────
export function ironBall() {
  const R = 7.5;
  return [
    `<circle cx="0" cy="0" r="${R}" fill="#565B61" stroke="${INK}" stroke-width="0.7"/>`,
    // the crescent of shade on the far side, away from the lamp
    tone(`M${R * 0.15},${-R * 0.98} A${R},${R} 0 0 1 ${-R * 0.98},${R * 0.2} A${R * 1.05},${R * 1.05} 0 0 0 ${R * 0.15},${-R * 0.98} Z`, '#565B61'),
    tone(`M${R * 0.98},${-R * 0.2} A${R},${R} 0 0 1 ${-R * 0.3},${R * 0.95} C${R * 0.4},${R * 0.62} ${R * 0.78},${R * 0.2} ${R * 0.98},${-R * 0.2} Z`, '#393D42'),
    // the pitted face of the casting
    `<circle cx="2.4" cy="1.8" r="0.55" fill="#3E4247"/><circle cx="-1.6" cy="3.2" r="0.45" fill="#3E4247"/><circle cx="3.4" cy="-1.4" r="0.4" fill="#3E4247"/>`,
    // the lamp's hard highlight, high on the lit side
    `<ellipse cx="-2.7" cy="-3.1" rx="2.2" ry="1.3" transform="rotate(-35 -2.7 -3.1)" fill="#9AA1A8"/>`,
    `<circle cx="-3.1" cy="-3.4" r="0.7" fill="#F4F6F8"/>`,
  ].join('');
}
export function tennisBall() {
  const R = 5;
  return [
    `<circle cx="0" cy="0" r="${R}" fill="#D3DE45" stroke="${INK}" stroke-width="0.6"/>`,
    tone(`M${R * 0.97},${-R * 0.25} A${R},${R} 0 0 1 ${-R * 0.35},${R * 0.94} C${R * 0.45},${R * 0.6} ${R * 0.8},${R * 0.2} ${R * 0.97},${-R * 0.25} Z`, '#A9B42C'),
    `<ellipse cx="-1.7" cy="-2" rx="1.5" ry="0.9" transform="rotate(-35 -1.7 -2)" fill="#EEF3A0"/>`,
    // the seam: two facing curves round the ball
    line(`M${-R * 0.72},${-R * 0.69} C${-R * 0.1},${-R * 0.25} ${-R * 0.1},${R * 0.25} ${-R * 0.72},${R * 0.69}`, '#FBFBF4', 0.75),
    line(`M${R * 0.72},${-R * 0.69} C${R * 0.1},${-R * 0.25} ${R * 0.1},${R * 0.25} ${R * 0.72},${R * 0.69}`, '#FBFBF4', 0.75),
  ].join('');
}

export const ART = [
  { name: 'sci1-yard', svg: yard, view: { x: 0, y: 378, w: 400, h: 140 }, box: { x: 0, y: 378, w: 400, h: 140 } },
  { name: 'sci1-ladder', svg: ladder, view: { x: 227, y: 421, w: 46, h: 81 }, box: { x: 227, y: 421, w: 46, h: 81 } },
  { name: 'sci1-slate', svg: slateFrame, view: { x: 2, y: 418, w: 136, h: 84 }, box: { x: 2, y: 418, w: 136, h: 84 } },
  { name: 'sci1-iron', svg: ironBall, view: { x: -8.2, y: -8.2, w: 16.4, h: 16.4 }, box: { x: -8.2, y: -8.2, w: 16.4, h: 16.4 } },
  { name: 'sci1-tennis', svg: tennisBall, view: { x: -5.6, y: -5.6, w: 11.2, h: 11.2 }, box: { x: -5.6, y: -5.6, w: 11.2, h: 11.2 } },
];
