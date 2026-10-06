// personal-growth-foundations-2, "How Habits Work": the kitchen pictures. Each replaces a
// shape-built object of growth2Scene and takes its box, so nothing on the stage moves.
// REFERENCE: a spindle-back wooden chair (Commons, "Windsor Chair.svg": turned rear posts,
// a curved top rail, thin spindles, a slab seat, tapered splayed legs, one stretcher) and
// glass clip-top biscuit jars. Flat fills lit from the top left, one dark outline. Zero imports.
const INK = '#2B2420';
const n2 = (v) => (Math.round(v * 100) / 100).toString();
const fill = (d, c, w = '0.7') => `<path d="${d}" fill="${c}" stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"/>`;
const tone = (d, c, o = 1) => `<path d="${d}" fill="${c}"${o < 1 ? ` opacity="${o}"` : ''}/>`;
const line = (d, c, w) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const circ = (cx, cy, r, c, w = '0.45') => `<circle cx="${n2(cx)}" cy="${n2(cy)}" r="${n2(r)}" fill="${c}" stroke="${INK}" stroke-width="${w}"/>`;

const WOOD = '#A97646', WOOD_M = '#8E5F37', WOOD_S = '#6B4829', WOOD_L = '#C08A58';

// the kitchen chair: back at the left of its box (cx - 15 to cx + 15, 466 to 500)
function chairBody(cx) {
  const x = (v) => n2(cx + v);
  const o = [];
  // far legs, behind the seat
  o.push(fill(`M${x(-8)},488 L${x(-5.4)},488 L${x(-5)},498.6 L${x(-7.2)},498.6 Z`, WOOD_S, '0.5'));
  o.push(fill(`M${x(9)},488 L${x(11.6)},488 L${x(12.4)},498.6 L${x(10.2)},498.6 Z`, WOOD_S, '0.5'));
  // stretcher
  o.push(fill(`M${x(-11)},494.4 L${x(12)},494.4 L${x(12)},496 L${x(-11)},496 Z`, WOOD_M, '0.5'));
  // near legs, tapering to the floor
  o.push(fill(`M${x(-13.6)},489.5 L${x(-9.6)},489.5 L${x(-10.2)},500 L${x(-13.2)},500 Z`, WOOD, '0.6'));
  o.push(fill(`M${x(10.4)},489.5 L${x(14.4)},489.5 L${x(14.4)},500 L${x(11.2)},500 Z`, WOOD, '0.6'));
  o.push(tone(`M${x(-11.6)},490 L${x(-9.6)},490 L${x(-10.2)},500 L${x(-11.4)},500 Z`, WOOD_S, 0.55));
  o.push(tone(`M${x(12.6)},490 L${x(14.4)},490 L${x(14.4)},500 L${x(12.4)},500 Z`, WOOD_S, 0.55));
  // spindles, then the back post and the curved top rail
  for (const sx of [-9.8, -6.4, -3, 0.4]) {
    o.push(fill(`M${x(sx)},471.6 L${x(sx + 1.1)},471.6 L${x(sx + 1.2)},486 L${x(sx + 0.1)},486 Z`, WOOD_L, '0.4'));
  }
  o.push(fill(`M${x(-14.6)},468 Q${x(-4)},466.6 ${x(4)},469 L${x(4)},472.6 Q${x(-4)},470.6 ${x(-14.6)},471.8 Z`, WOOD, '0.6'));
  o.push(tone(`M${x(-14.6)},468 Q${x(-4)},466.6 ${x(4)},469 L${x(4)},469.8 Q${x(-4)},467.8 ${x(-14.6)},469 Z`, WOOD_L));
  o.push(fill(`M${x(-14.8)},468.4 L${x(-11.6)},468.4 L${x(-10.6)},488 L${x(-14.2)},488 Z`, WOOD, '0.65'));
  o.push(tone(`M${x(-12.6)},469 L${x(-11.6)},469 L${x(-10.6)},488 L${x(-11.8)},488 Z`, WOOD_S, 0.5));
  o.push(circ(cx - 13.2, 466.9, 1.5, WOOD_L, '0.5'));
  // the seat: a lit top face, a thick shaded front edge
  o.push(fill(`M${x(-15)},486.2 L${x(13.4)},486.2 L${x(15)},487.8 L${x(-15)},488.2 Z`, WOOD_L, '0.6'));
  o.push(fill(`M${x(-15)},488.2 L${x(15)},487.8 L${x(14.6)},490.4 L${x(-14.6)},490.4 Z`, WOOD_M, '0.6'));
  o.push(tone(`M${x(-14.6)},489.6 L${x(14.6)},489.6 L${x(14.6)},490.4 L${x(-14.6)},490.4 Z`, WOOD_S, 0.6));
  return o.join('');
}
const chairLeft = () => chairBody(238);
// the housemate's chair faces left: the same drawing turned about its own middle
const chairRight = () => `<g transform="translate(684,0) scale(-1,1)">${chairBody(342)}</g>`;

// the table: 248 to 332, top face 467 to 474, legs to the floor
function table() {
  const o = [];
  o.push(fill('M256,478 L259.4,478 L259.2,498.4 L256.8,498.4 Z', WOOD_S, '0.5'));
  o.push(fill('M321,478 L324.4,478 L323.8,498.4 L321.6,498.4 Z', WOOD_S, '0.5'));
  o.push(fill('M251.4,479 L256.6,479 L255.8,500 L252.4,500 Z', WOOD, '0.65'));
  o.push(tone('M254,479 L256.6,479 L255.8,500 L254.2,500 Z', WOOD_S, 0.5));
  o.push(fill('M323.4,479 L328.6,479 L327.8,500 L324.4,500 Z', WOOD, '0.65'));
  o.push(tone('M326,479 L328.6,479 L327.8,500 L326.2,500 Z', WOOD_S, 0.5));
  o.push(fill('M252,477 L328,477 L328,481.2 L252,481.2 Z', WOOD_M, '0.6'));
  o.push(fill('M251,467 L330.4,467 L333,474 L248,474 Z', WOOD_L, '0.7'));
  o.push(fill('M248,474 L333,474 L332.4,477.6 L248.6,477.6 Z', WOOD, '0.7'));
  o.push(line('M290,467.4 L290.6,473.6', WOOD_M, '0.5'));
  o.push(line('M256,470 Q270,469.4 284,470.2', WOOD, '0.4'));
  o.push(line('M296,471.6 Q310,470.8 326,471.8', WOOD, '0.4'));
  o.push(tone('M248.6,476.6 L332.4,476.6 L332.4,477.6 L248.6,477.6 Z', WOOD_S, 0.55));
  return o.join('');
}

// the biscuit jar's body (97 to 119 by 449 to 475): glass, a wire clip, biscuits
function jar() {
  const o = [];
  const GL = '#D3E6EA', GL_S = '#A6C3CB', BIS = '#D9A25B', BIS_S = '#B57E3C', CHIP = '#5A3A22';
  const body = 'M100.6,453 L115.4,453 Q116.4,456 118.6,458.6 Q119.8,461 119.8,465 L119.8,472.6 Q119.8,475.4 117,475.4 L100,475.4 Q97.2,475.4 97.2,472.6 L97.2,465 Q97.2,461 98.4,458.6 Q100,456 100.6,453 Z';
  o.push(fill(body, GL, '0.8'));
  o.push(tone('M115.4,453 Q116.4,456 118.6,458.6 Q119.8,461 119.8,465 L119.8,472.6 Q119.8,475.4 117,475.4 L113.6,475.4 Q116.4,474 116.4,470 L116.4,461 Q116,456 112.8,453 Z', GL_S, 0.75));
  const bis = [[102.4, 472, 3.4], [108.6, 473, 3.5], [114.2, 472, 3.3], [105.4, 468.6, 3.4], [111.4, 468.8, 3.4], [108, 464.8, 3.3], [102.2, 465.6, 2.8], [114, 465.2, 2.8]];
  for (const [bx, by, r] of bis) {
    o.push(circ(bx, by, r, BIS, '0.45'));
    o.push(tone(`M${n2(bx - r * 0.1)},${n2(by + r * 0.9)} Q${n2(bx + r * 0.9)},${n2(by + r * 0.6)} ${n2(bx + r * 0.8)},${n2(by - r * 0.4)} Q${n2(bx + r * 0.7)},${n2(by + r * 0.5)} ${n2(bx - r * 0.1)},${n2(by + r * 0.9)} Z`, BIS_S));
    o.push(circ(bx - r * 0.3, by - r * 0.2, 0.35, CHIP, '0'));
    o.push(circ(bx + r * 0.35, by + r * 0.3, 0.32, CHIP, '0'));
  }
  o.push(`<path d="${body}" fill="none" stroke="${INK}" stroke-width="0.8" stroke-linejoin="round"/>`);
  o.push(tone('M99.4,459 Q99,463 99.2,470 L100.6,470 Q100.4,463 101,459.4 Z', '#FFFFFF', 0.7));
  o.push(line('M113.4,453.6 L113.4,458 Q114.2,464 112.4,470', '#8C9399', '0.9'));
  o.push(line('M113.4,453.6 L113.4,458 Q114.2,464 112.4,470', INK, '0.25'));
  return o.join('');
}

export const ART = [
  { name: 'growth2-chair-cap', svg: chairLeft, view: { x: 223, y: 466, w: 30, h: 34 }, box: { x: 223, y: 466, w: 30, h: 34 } },
  { name: 'growth2-chair-pl', svg: chairRight, view: { x: 327, y: 466, w: 30, h: 34 }, box: { x: 327, y: 466, w: 30, h: 34 } },
  { name: 'growth2-table', svg: table, view: { x: 247, y: 466, w: 87, h: 35 }, box: { x: 247, y: 466, w: 87, h: 35 } },
  { name: 'growth2-jar', svg: jar, view: { x: 96, y: 449, w: 25, h: 27 }, box: { x: 96, y: 449, w: 25, h: 27 } },
];
