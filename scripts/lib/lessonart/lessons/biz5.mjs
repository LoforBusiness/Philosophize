// business-foundations-5, "Profit Isn't Cash": the balloon, its basket and burner, the gas
// cylinders and the booking board, drawn as pictures (LESSON_RULES AM13). Each takes the box
// of the shape-built object it replaces, so nothing moves. Flat fills lit from the top left,
// a shaded side, one dark outline, real colours. Zero imports.
// REFERENCES (Wikimedia Commons): "Hot air balloon envelope patterns" (CC0) and "Hot air
// balloon deflation port" (PD) for the envelope: an ONION, a round crown tapering to a short
// throat, made of vertical GORES whose panels alternate colour, a darker band round the lower
// skirt, seams as thin dark lines; "Basket with burner" for the wicker basket (woven rows, a
// padded leather rim, a suede foot band, rope handles, a step hole) and the burner frame
// (padded uprights, a steel frame, a coil drum); a delivered propane bottle (domed shoulder,
// guard collar with a hand-hole, label, foot ring); a sign easel (two splayed front legs, a
// prop leg, a framed slate on a chalk tray).

const INK = '#2B2420';
const f = (n) => (+n).toFixed(2);
const fill = (d, c, w = 1.4) => `<path d="${d}" fill="${c}" stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"/>`;
const tone = (d, c, o = 1) => `<path d="${d}" fill="${c}"${o < 1 ? ` opacity="${o}"` : ''}/>`;
const line = (d, c, w, o = 1) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"${o < 1 ? ` opacity="${o}"` : ''}/>`;
const rect = (x, y, w, h, r = 0) => `M${f(x + r)},${f(y)} L${f(x + w - r)},${f(y)} Q${f(x + w)},${f(y)} ${f(x + w)},${f(y + r)} L${f(x + w)},${f(y + h - r)} Q${f(x + w)},${f(y + h)} ${f(x + w - r)},${f(y + h)} L${f(x + r)},${f(y + h)} Q${f(x)},${f(y + h)} ${f(x)},${f(y + h - r)} L${f(x)},${f(y + r)} Q${f(x)},${f(y)} ${f(x + r)},${f(y)} Z`;
const ell = (cx, cy, rx, ry) => `M${f(cx - rx)},${f(cy)} A${f(rx)},${f(ry)} 0 1 0 ${f(cx + rx)},${f(cy)} A${f(rx)},${f(ry)} 0 1 0 ${f(cx - rx)},${f(cy)} Z`;
/** A thick straight member with the house outline: an outlined stroke under a coloured one. */
const bar = (x1, y1, x2, y2, w, c) => `${line(`M${x1},${y1} L${x2},${y2}`, INK, w + 2.2)}${line(`M${x1},${y1} L${x2},${y2}`, c, w)}`;

// ── THE ENVELOPE, 141 × 126, the mouth at the bottom (y −12), the crown at y −138 ────────
// The right-hand outline from the mouth up to the crown, scaled in x by s: s = 1 is the edge
// of the balloon and every smaller s is a gore seam, so the seams follow the shape exactly.
const up = (s) => `C${f(30 * s)},-30 ${f(70.5 * s)},-52 ${f(70.5 * s)},-84 C${f(70.5 * s)},-118 ${f(40 * s)},-138 0,-138`;
const OUT = 'M-18.3,-12 C-30,-30 -70.5,-52 -70.5,-84 C-70.5,-118 -40,-138 0,-138 C40,-138 70.5,-118 70.5,-84 C70.5,-52 30,-30 18.3,-12 Z';
const gore = (a, b) => `M${f(18.3 * a)},-12 ${up(a)} C${f(40 * b)},-138 ${f(70.5 * b)},-118 ${f(70.5 * b)},-84 C${f(70.5 * b)},-52 ${f(30 * b)},-30 ${f(18.3 * b)},-12 Z`;
const GORES = ['#C8362E', '#F2E6C8', '#2F5FA3', '#E8A92B', '#C8362E', '#F2E6C8', '#2F5FA3', '#E8A92B', '#C8362E'];
export const ENV_VIEW = { x: -72, y: -140, w: 144, h: 130 };
export function envelope() {
  const S = [-1, -0.78, -0.56, -0.33, -0.11, 0.11, 0.33, 0.56, 0.78, 1];
  const o = [];
  o.push(`<defs><clipPath id="env"><path d="${OUT}"/></clipPath></defs>`);
  o.push('<g clip-path="url(#env)">');
  for (let i = 0; i < 9; i++) o.push(tone(gore(S[i], S[i + 1]), GORES[i]));
  // a horizontal band of cream and a darker skirt band, as on the references
  o.push(tone('M-72,-96 L72,-96 L72,-84 L-72,-84 Z', '#F2E6C8', 0.55));
  o.push(tone('M-72,-96 L72,-96 L72,-94 L-72,-94 Z', '#2B2420', 0.35));
  o.push(tone('M-72,-84 L72,-84 L72,-82.4 L-72,-82.4 Z', '#2B2420', 0.35));
  o.push(tone('M-72,-36 L72,-36 L72,-10 L-72,-10 Z', '#2B3140', 0.9));
  // the lit crown, top left, and the shaded side, right
  o.push(tone(gore(-1, -0.5), '#FFFFFF', 0.16));
  o.push(tone(gore(0.35, 1), '#1A1A1A', 0.14));
  o.push(tone(gore(0.7, 1), '#1A1A1A', 0.16));
  for (const s of S.slice(1, -1)) o.push(line(`M${f(18.3 * s)},-12 ${up(s)}`, INK, 0.5, 0.5));
  o.push('</g>');
  o.push(`<path d="${OUT}" fill="none" stroke="${INK}" stroke-width="1.5" stroke-linejoin="round"/>`);
  o.push(fill(ell(0, -137.2, 5, 1.8), '#3A3F46', 0.8));
  return o.join('');
}

// ── THE SKIRT AND ITS CABLES, 70 × 52, x −35…35, y −12…40 ────────────────────────────────
export const SKIRT_VIEW = { x: -35, y: -12, w: 70, h: 52 };
export function skirt() {
  const o = [];
  for (const [x1, x2] of [[-9, -13], [9, 13]]) o.push(line(`M${x1},-1 L${x2},39.5`, '#6C7279', 0.8));
  for (const [x1, x2] of [[-17.5, -33], [17.5, 33]]) {
    o.push(line(`M${x1},-1 L${x2},39.5`, INK, 2.2));
    o.push(line(`M${x1},-1 L${x2},39.5`, '#B8BEC4', 1.1));
  }
  o.push(fill('M-19,-12 L19,-12 L16.5,0 L-16.5,0 Z', '#2B3140', 1.2));
  o.push(tone('M-19,-12 L-6,-12 L-5,0 L-16.5,0 Z', '#4A5368', 0.8));
  o.push(fill(ell(0, -1, 14, 2.2), '#161A22', 0.9));
  o.push(line('M-15,-7 L15,-7', '#E8A92B', 1.4, 0.9));
  return o.join('');
}

// ── THE BASKET, 150 × 32, x −75…75, y −32…0 ──────────────────────────────────────────────
const WICKER = '#B98A4F', WICKER_L = '#D2A769', WICKER_S = '#8E6636', WICKER_D = '#6B4A27';
const LEATHER = '#5A3A24', LEATHER_L = '#7A5236', SUEDE = '#E7DCC4', SUEDE_S = '#CBBE9F';
export const BASKET_VIEW = { x: -75, y: -32, w: 150, h: 32 };
export function basket() {
  const o = [];
  o.push(fill(rect(-75, -30, 150, 30, 3), WICKER, 1.5));
  // woven rows: a lighter strand over a darker one, staggered
  for (let r = 0; r < 4; r++) {
    const y = -24 + r * 5;
    o.push(tone(`M-73,${y} L73,${y} L73,${y + 1.1} L-73,${y + 1.1} Z`, WICKER_D, 0.55));
    for (let x = -72 + (r % 2) * 2.5; x < 66; x += 5) o.push(tone(rect(x, y + 1.2, 3.4, 3.4, 1), WICKER_L, 0.75));
  }
  o.push(tone(rect(63, -29, 11, 28, 2), WICKER_S, 0.85));
  // the suede band at the foot
  o.push(fill(rect(-74.5, -9.6, 149, 9.6, 3), SUEDE, 1.2));
  o.push(tone(rect(-74, -3, 148, 2.4, 1), SUEDE_S));
  // leather corner straps down both ends
  for (const x of [-72.5, 66.5]) o.push(fill(rect(x, -29, 6, 29, 1.6), LEATHER, 1.1));
  // rope handles looped over the suede
  for (const x of [-34, 0, 34]) {
    o.push(line(`M${x},-6.4 Q${x + 5},0.6 ${x + 10},-6.4`, '#8A6B3E', 1.5));
    o.push(line(`M${x},-6.4 Q${x + 5},0.6 ${x + 10},-6.4`, '#C9A56A', 0.6));
  }
  // a step hole with its bar
  o.push(fill(rect(-50, -22, 11, 8, 1), '#2A2018', 1));
  o.push(line('M-52,-18 L-38,-18', '#9AA0A6', 1.6));
  // the padded leather rim
  o.push(fill(rect(-75.5, -32, 151, 7.6, 3.6), LEATHER, 1.5));
  o.push(tone(rect(-72, -31.2, 130, 2.4, 1.2), LEATHER_L));
  o.push(line('M-70,-26.6 L70,-26.6', '#2A1B10', 0.6, 0.7));
  return o.join('');
}
export const BACK_VIEW = { x: -75, y: -38, w: 150, h: 14 };
export function basketBack() {
  const o = [];
  o.push(fill(rect(-70, -35, 140, 11.5, 1.5), WICKER_S, 1.3));
  for (let x = -66; x < 64; x += 5) o.push(tone(rect(x, -29, 3.2, 3.6, 1), WICKER_D, 0.5));
  o.push(line('M-68,-30.5 L68,-30.5', WICKER_D, 0.9, 0.7));
  o.push(fill(rect(-70, -38, 140, 6.4, 3), LEATHER, 1.3));
  o.push(tone(rect(-66, -37.2, 100, 1.8, 0.9), LEATHER_L));
  return o.join('');
}

// ── THE BURNER AND ITS FRAME, 150 × 76, x −75…75, y −108…−32 ─────────────────────────────
export const FRAME_VIEW = { x: -75, y: -108, w: 150, h: 76 };
export function frame() {
  const o = [];
  o.push(bar(-57, -42, -29, -88, 2.8, '#4A2F1D'));
  o.push(bar(57, -42, 29, -88, 2.8, '#4A2F1D'));
  o.push(bar(-33, -88, 33, -88, 3, '#C4C8CC'));
  o.push(tone('M-33,-86.8 L33,-86.8 L33,-86 L-33,-86 Z', '#8D939A'));
  o.push(fill(rect(-15, -106, 30, 17, 3), '#C4C8CC', 1.4));
  o.push(tone(rect(-14, -105, 10, 15, 2.4), '#E8EBEC'));
  o.push(tone(rect(8, -105, 6, 15, 2.2), '#8D939A'));
  for (const y of [-102, -98, -94]) o.push(line(`M-13,${y} L13,${y}`, '#5C6269', 1.5));
  o.push(fill(rect(-7, -108, 14, 4, 1.2), '#8D939A', 1.1));
  o.push(bar(-69, -33, -31, -88, 3.6, '#5A3A24'));
  o.push(bar(69, -33, 31, -88, 3.6, '#5A3A24'));
  o.push(line('M-70.4,-34 L-32.4,-88.6', '#7A5236', 1.1));
  o.push(line('M67.6,-34 L29.6,-88.6', '#7A5236', 1.1));
  for (const x of [-31, 31]) o.push(fill(rect(x - 3, -91, 6, 5, 1), '#9AA0A6', 1));
  // the blast valve's lever, hanging under the frame
  o.push(line('M-7,-86.5 L-12,-68', INK, 3));
  o.push(line('M-7,-86.5 L-12,-68', '#D84A3A', 1.5));
  o.push(fill(ell(-12, -67.5, 2, 2), '#D84A3A', 1));
  return o.join('');
}

// ── A PROPANE CYLINDER, 12 × 40 ──────────────────────────────────────────────────────────
const cyl = (ox, oy, body, bodyL, bodyS) => {
  const o = [];
  const x = (n) => f(ox + n), y = (n) => f(oy + n);
  o.push(fill(`M${x(0.4)},${y(10)} Q${x(0.6)},${y(4)} ${x(6)},${y(4)} Q${x(11.4)},${y(4)} ${x(11.6)},${y(10)} L${x(11.6)},${y(37)} Q${x(11.6)},${y(39)} ${x(9.8)},${y(39)} L${x(2.2)},${y(39)} Q${x(0.4)},${y(39)} ${x(0.4)},${y(37)} Z`, body, 1.2));
  o.push(tone(`M${x(8.2)},${y(7)} Q${x(11.2)},${y(7.4)} ${x(11.2)},${y(11)} L${x(11.2)},${y(37)} Q${x(11.2)},${y(38.6)} ${x(9.6)},${y(38.6)} L${x(8.2)},${y(38.6)} Z`, bodyS));
  o.push(tone(`M${x(1.6)},${y(10)} Q${x(1.8)},${y(6)} ${x(4)},${y(5.4)} L${x(4)},${y(36)} L${x(1.6)},${y(36)} Z`, bodyL, 0.8));
  o.push(fill(rect(ox + 1.6, oy + 20, 8.8, 8, 0.8), '#F3EFE6', 0.7));
  o.push(tone(rect(ox + 1.6, oy + 22.6, 8.8, 1.6, 0), '#C8362E'));
  o.push(fill(rect(ox + 0.8, oy + 36.2, 10.4, 3.6, 1), '#33363A', 1));
  o.push(fill(rect(ox + 2, oy + 0.4, 8, 6.4, 1.6), '#C4C8CC', 1.1));
  o.push(tone(rect(ox + 2.6, oy + 1, 2.2, 5.2, 1), '#EEF0F1'));
  o.push(fill(rect(ox + 4.2, oy + 1.8, 3.6, 2.4, 1), '#2A2018', 0.5));
  return o.join('');
};
export const CYL_RED_VIEW = { x: -6, y: -3, w: 12, h: 40 };
export const cylRed = () => cyl(-6, -3, '#B5392F', '#D85548', '#8A2B23');
export const CYL_L_VIEW = { x: -68, y: -40, w: 12, h: 40 };
export const cylSteelL = () => cyl(-68, -40, '#B6BBC0', '#E1E4E6', '#8D939A');
export const CYL_R_VIEW = { x: 56, y: -40, w: 12, h: 40 };
export const cylSteelR = () => cyl(56, -40, '#B6BBC0', '#E1E4E6', '#8D939A');

// ── THE BOOKING BOARD ON ITS EASEL, 88 × 96: x 42…130, y 404…500 ────────────────────────
const OAK = '#8E5F37', OAK_L = '#A97646', OAK_S = '#6F4527', SLATE = '#3C4347';
export const EASEL_VIEW = { x: 42, y: 404, w: 88, h: 96 };
export function easel() {
  const o = [];
  o.push(bar(88, 410, 88, 499, 3, OAK_S));
  o.push(bar(80, 406, 50, 499, 3.4, OAK));
  o.push(bar(92, 406, 122, 499, 3.4, OAK_S));
  o.push(line('M78.6,407 L48.6,499', OAK_L, 1));
  o.push(bar(56, 486, 118, 486, 2, OAK_S));
  o.push(fill(rect(46, 411, 80, 60, 2), OAK, 1.5));
  o.push(tone(rect(46.8, 411.8, 78.4, 2.4, 1), OAK_L));
  o.push(tone(rect(122, 413, 3.2, 57, 1), OAK_S));
  o.push(fill(rect(49, 414, 74, 54, 1), SLATE, 1));
  o.push(tone(rect(50, 415, 72, 3, 0), '#5A6368', 0.5));
  o.push(tone('M52,462 Q70,458 96,461 Q108,463 120,460 L120,466 L52,466 Z', '#FFFFFF', 0.06));
  o.push(fill(rect(43, 470, 86, 5.2, 1.4), OAK_L, 1.3));
  o.push(tone(rect(43.6, 473, 84.8, 1.8, 0.8), OAK_S));
  return o.join('');
}

const same = (v) => ({ view: v, box: v });
export const ART = [
  { name: 'biz5-envelope', svg: envelope, ...same(ENV_VIEW) },
  { name: 'biz5-skirt', svg: skirt, ...same(SKIRT_VIEW) },
  { name: 'biz5-basket', svg: basket, ...same(BASKET_VIEW) },
  { name: 'biz5-basket-back', svg: basketBack, ...same(BACK_VIEW) },
  { name: 'biz5-frame', svg: frame, ...same(FRAME_VIEW) },
  { name: 'biz5-cyl-red', svg: cylRed, ...same(CYL_RED_VIEW) },
  { name: 'biz5-cyl-steel-l', svg: cylSteelL, ...same(CYL_L_VIEW) },
  { name: 'biz5-cyl-steel-r', svg: cylSteelR, ...same(CYL_R_VIEW) },
  { name: 'biz5-easel', svg: easel, ...same(EASEL_VIEW) },
];
