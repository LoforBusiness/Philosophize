// business-foundations-2, "Who Is Your Customer?" — the bakery counter's two food pictures,
// drawn as pictures (LESSON_RULES AM13). Each takes the box of the shape-built object it
// replaces. REFERENCES: Commons "Macaron.svg" (CC0): a domed top shell over a ruffled rim
// ("foot"), a pale cream between, a bottom shell; and "Noun Project baked glass cake stand
// icon" (CC BY 3.0): a plate on a flared pedestal foot, a two-tier cake, a scalloped icing
// band and a berry on top. Flat fills lit from the top left, a shaded side, one dark outline.
const INK = '#2B2420';
const f = (n) => (+n).toFixed(2);
const fill = (d, c, w) => `<path d="${d}" fill="${c}" stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"/>`;
const tone = (d, c, o = 1) => `<path d="${d}" fill="${c}"${o < 1 ? ` opacity="${o}"` : ''}/>`;
const rect = (x, y, w, h, r = 0) => `M${f(x + r)},${f(y)} L${f(x + w - r)},${f(y)} Q${f(x + w)},${f(y)} ${f(x + w)},${f(y + r)} L${f(x + w)},${f(y + h - r)} Q${f(x + w)},${f(y + h)} ${f(x + w - r)},${f(y + h)} L${f(x + r)},${f(y + h)} Q${f(x)},${f(y + h)} ${f(x)},${f(y + h - r)} L${f(x)},${f(y + r)} Q${f(x)},${f(y)} ${f(x + r)},${f(y)} Z`;
const circ = (cx, cy, r) => `M${f(cx - r)},${f(cy)} A${f(r)},${f(r)} 0 1 0 ${f(cx + r)},${f(cy)} A${f(r)},${f(r)} 0 1 0 ${f(cx - r)},${f(cy)} Z`;

const PINK = ['#F6B3C8', '#DC84A3'], LILAC = ['#D3BFEE', '#A68CCB'], MINT = ['#BDE6CF', '#8CC3A4'];
const CREAM = '#FFF4DE';

/** One macaron, w wide, centred on cx with its foot on baseline y. */
function macaron(cx, y, w, [c, s], lw) {
  const h = w * 0.74, x0 = cx - w / 2;
  const bot = fill(`M${f(x0 + 0.5)},${f(y - h * 0.3)} L${f(x0 + w - 0.5)},${f(y - h * 0.3)} Q${f(x0 + w)},${f(y)} ${f(x0 + w * 0.8)},${f(y)} L${f(x0 + w * 0.2)},${f(y)} Q${f(x0)},${f(y)} ${f(x0 + 0.5)},${f(y - h * 0.3)} Z`, c, lw);
  const cream = fill(rect(x0 + 0.2, y - h * 0.5, w - 0.4, h * 0.22, h * 0.1), CREAM, lw * 0.8);
  const top = fill(`M${f(x0 + 0.4)},${f(y - h * 0.46)} Q${f(x0 + w * 0.08)},${f(y - h)} ${f(cx)},${f(y - h)} Q${f(x0 + w * 0.92)},${f(y - h)} ${f(x0 + w - 0.4)},${f(y - h * 0.46)} Z`, c, lw);
  // lit shoulder top left, shade low right, the ruffled foot under the dome
  const hi = tone(`M${f(x0 + w * 0.2)},${f(y - h * 0.62)} Q${f(x0 + w * 0.3)},${f(y - h * 0.88)} ${f(x0 + w * 0.5)},${f(y - h * 0.9)} Q${f(x0 + w * 0.3)},${f(y - h * 0.8)} ${f(x0 + w * 0.2)},${f(y - h * 0.62)} Z`, '#FFFFFF', 0.55);
  const sh = tone(`M${f(x0 + w * 0.72)},${f(y - h * 0.5)} L${f(x0 + w - 0.5)},${f(y - h * 0.5)} L${f(x0 + w - 0.5)},${f(y - h * 0.3)} L${f(x0 + w * 0.8)},${f(y - h * 0.3)} Z`, s, 0.7);
  return bot + sh + cream + top + hi;
}

export function macarons() {
  let o = '';
  // the plate: a white rim with its edge in shade (40 × 13 units)
  o += fill(rect(1, 9.6, 38, 2.6, 1.3), '#F7F3EC', 0.7) + tone(rect(2, 11.2, 36, 0.9, 0.4), '#CFC8BC');
  const back = [[9.75, PINK], [17.25, LILAC], [24.75, MINT], [32.25, PINK]];
  const front = [[6, MINT], [13.5, PINK], [21, LILAC], [28.5, MINT]];   // the gap is left at x 36
  for (const [x, c] of back) o += macaron(x, 8, 6.8, c, 0.55);
  for (const [x, c] of front) o += macaron(x, 10.4, 7, c, 0.6);
  return o;
}

export function cake() {
  let o = '';
  const LW = 0.9;
  // pedestal foot, then the plate
  o += fill('M10,28 Q9,27.2 10.2,26 Q12,25.4 12.4,23.4 L13.6,23.4 Q14,25.4 15.8,26 Q17,27.2 16,28 Z', '#E4DDD1', LW);
  o += tone('M10.6,27.3 L15.4,27.3 L15.8,26.2 Q13,26.6 10.6,26.2 Z', '#BDB5A8', 0.8);
  o += fill(rect(1, 21, 24, 2.8, 1.4), '#F7F3EC', LW) + tone(rect(2, 22.7, 22, 0.9, 0.4), '#CFC8BC');
  // lower tier: sponge, a scalloped icing band, a pink side shade
  o += fill(rect(3.5, 10.5, 19, 10.6, 2), '#F4D9A6', LW);
  o += tone(rect(18.5, 11.6, 3.4, 8.8, 1.2), '#D9B873', 0.8);
  o += fill('M3.5,13 Q3.5,10.5 6,10.5 L20,10.5 Q22.5,10.5 22.5,13 L22.5,15 Q21,17.2 19.4,15.2 Q17.8,17.2 16.2,15.2 Q14.6,17.2 13,15.2 Q11.4,17.2 9.8,15.2 Q8.2,17.2 6.6,15.2 Q5,17.2 3.5,15 Z', '#F4A3BE', LW);
  o += tone('M4.5,11.4 L12,11.4 Q8,12 4.6,13.6 Z', '#FFFFFF', 0.45);
  // upper tier
  o += fill(rect(6.5, 4.8, 13, 6, 1.8), '#F4D9A6', LW);
  o += fill('M6.5,6.6 Q6.5,4.8 8.3,4.8 L17.7,4.8 Q19.5,4.8 19.5,6.6 L19.5,8.2 Q18.4,9.6 17.2,8.2 Q16,9.6 14.8,8.2 Q13.6,9.6 12.4,8.2 Q11.2,9.6 10,8.2 Q8.8,9.6 6.5,8.2 Z', '#F4A3BE', LW);
  o += tone(rect(17, 5.6, 2, 2.6, 0.8), '#D9809F', 0.7);
  // a cherry and a berry on top, each with its lit spot
  o += fill(circ(12.2, 3.2, 1.9), '#C8283C', 0.8) + tone(circ(11.5, 2.5, 0.55), '#FFFFFF', 0.8);
  o += fill(circ(15.2, 3.9, 1.3), '#7A4FB0', 0.7) + tone(circ(14.8, 3.4, 0.35), '#FFFFFF', 0.8);
  o += `<path d="M12.2,1.4 Q12.8,0.2 14,0.1" fill="none" stroke="#4E7A3A" stroke-width="0.6" stroke-linecap="round"/>`;
  return o;
}

export const ART = [
  // macaronTray(344, TOP - 6.5, 40, 13): 324–364 × 464–477
  { name: 'biz2-macarons', svg: macarons, view: { x: 0, y: 0, w: 40, h: 13 }, box: { x: 324, y: 464, w: 40, h: 13 } },
  // cakeStand(0, 0, 26, 28) on a rider; the scene lifts it from under the counter
  { name: 'biz2-cake', svg: cake, view: { x: 0, y: 0, w: 26, h: 28 }, box: { x: -13, y: -14, w: 26, h: 28 } },
];
