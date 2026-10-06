// philosophy-foundations-6 — the carousel at the fair, drawn (LESSON_RULES AM13).
// REFERENCE (npm run ref, scratchpad/ref/p6cf-*): the carousel pictograms (Fluent / Twemoji /
// Noto 1f3a0) and the Pinhead icon all agree on the build: a shallow conical roof with a
// wider eave, a deep rounding board under it, ONE central column, a low platform, the horse
// on a pole between them. Scene units; the box is the one ph6Carousel(318, 352, 184, 216)
// filled (226-410 x 244-460), so the horses, poles and bulbs the scene lays on it stay put.
const OUT = '#3B2418';
const RED = '#C2392C', REDS = '#9C2B22', CREAM = '#F4E8C8', CREAMS = '#DCCBA0';
const BRASS = '#D2A33C', BRASSS = '#A97D22', GLOW = '#F6D98F', GLOWD = '#E2B867';
const WOOD = '#8A5A34', WOODS = '#6B4326', MIRROR = '#9DB7C9', MIRRORS = '#7D98AC';
const f2 = (n) => Number(n.toFixed(2));
const fill = (d, c, w = 1) => `<path d="${d}" fill="${c}" stroke="${OUT}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"/>`;
const tone = (d, c, o = 1) => `<path d="${d}" fill="${c}"${o < 1 ? ` opacity="${o}"` : ''}/>`;
const rect = (x, y, w, h, c, r = 0) => `<rect x="${f2(x)}" y="${f2(y)}" width="${f2(w)}" height="${f2(h)}" rx="${r}" fill="${c}" stroke="${OUT}" stroke-width="1" stroke-linejoin="round"/>`;

export function carousel() {
  const o = [];
  const CX = 92;
  // the lit inside, behind everything
  o.push(rect(6, 78, 172, 126, GLOW, 1));
  o.push(tone('M92,78 L178,78 L178,204 L92,204 Z', GLOWD, 0.35));
  // the centre column with its mirror panels
  o.push(rect(79, 80, 26, 122, BRASS, 2));
  o.push(tone('M92,81 L104,81 L104,201 L92,201 Z', BRASSS, 0.55));
  for (const y of [90, 144]) {
    o.push(rect(83, y, 18, 44, MIRROR, 2));
    o.push(tone(`M92,${y + 1} L100,${y + 1} L100,${y + 43} L92,${y + 43} Z`, MIRRORS, 0.5));
    o.push(`<path d="M86,${y + 36} L94,${y + 6}" stroke="#fff" stroke-width="1.3" stroke-linecap="round" opacity="0.7"/>`);
  }
  // the platform and its red skirt
  o.push(rect(6, 199, 172, 12, WOOD, 2));
  o.push(tone('M7,205 L177,205 L177,210 L7,210 Z', WOODS, 0.7));
  o.push(rect(8, 209, 168, 6, RED, 1.5));
  o.push(`<path d="M12,201.2 L172,201.2" stroke="#E7B98A" stroke-width="0.9" stroke-linecap="round"/>`);
  // the rounding board: a deep band with red panels and a scalloped gilt valance
  o.push(rect(4, 54, 176, 24, CREAM, 2));
  o.push(tone('M5,70 L179,70 L179,76 L5,76 Z', CREAMS, 0.8));
  for (let k = 0; k < 4; k++) o.push(rect(14 + k * 43, 58, 33, 14, RED, 2.5));
  for (let k = 0; k < 4; k++) o.push(tone(`M${f2(15 + k * 43)},${f2(66)} L${f2(46 + k * 43)},66 L${f2(46 + k * 43)},70 L${f2(15 + k * 43)},70 Z`, REDS, 0.8));
  for (let k = 0; k < 4; k++) o.push(`<path d="M${f2(38 + k * 43)},62 l3,3 l-3,3 l-3,-3 Z" fill="${BRASS}" stroke="${OUT}" stroke-width="0.6"/>`);
  o.push(`<path d="M5,55.4 L179,55.4" stroke="${BRASS}" stroke-width="1.6"/><path d="M5,76.6 L179,76.6" stroke="${BRASS}" stroke-width="1.6"/>`);
  let sc = '';
  for (let k = 0; k < 7; k++) {
    const x0 = 6 + k * 24.57, x1 = x0 + 24.57;
    sc += `<path d="M${f2(x0)},78 Q${f2((x0 + x1) / 2)},96 ${f2(x1)},78 Z" fill="${k % 2 ? CREAM : RED}" stroke="${OUT}" stroke-width="1" stroke-linejoin="round"/>`;
  }
  o.push(sc);
  o.push(`<path d="M6,78.6 Q92,78.6 178,78.6" stroke="${BRASS}" stroke-width="1.2" fill="none"/>`);
  // the roof: a shallow cone, alternating red and cream wedges meeting at the finial
  const wedges = 8, x0 = 6, x1 = 178, apexY = 22, eaveY = 55;
  for (let k = 0; k < wedges; k++) {
    const a = x0 + (k * (x1 - x0)) / wedges, b = x0 + ((k + 1) * (x1 - x0)) / wedges;
    o.push(fill(`M${CX},${apexY} L${f2(a)},${eaveY} Q${f2((a + b) / 2)},${eaveY + 4} ${f2(b)},${eaveY} Z`, k % 2 ? CREAM : RED, 1));
  }
  // the lit side of the roof (top left) and its shaded right half
  o.push(tone(`M${CX},${apexY} L6,${eaveY} L48,${eaveY} Z`, '#fff', 0.14));
  o.push(tone(`M${CX},${apexY} L178,${eaveY} L136,${eaveY} Z`, '#2B1010', 0.2));
  // the finial and its pennant
  o.push(rect(91, 4, 2, 20, BRASS, 0.6));
  o.push(`<circle cx="92" cy="22" r="3.4" fill="${BRASS}" stroke="${OUT}" stroke-width="0.9"/>`);
  o.push(fill('M93,4.6 L106,8 L93,11.4 Z', RED, 0.9));
  return o.join('');
}

export const ART = [
  { name: 'phil6-carousel', svg: carousel, view: { x: 0, y: 0, w: 184, h: 216 }, box: { x: 226, y: 244, w: 184, h: 216 } },
];
