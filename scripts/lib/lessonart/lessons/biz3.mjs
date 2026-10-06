// business-foundations-3, "How Do You Set a Price?" — the craft-fair stall, drawn as pictures
// (LESSON_RULES AM13). Each takes the box of the shape-built object it replaces.
// REFERENCES: "13-365 My Bath & Body Works candle OBSESSION" (Wikimedia Commons, CC BY 2.0):
// a SQUAT glass jar, wax visible through it, a metal LID with a bright rim, a paper LABEL
// round the middle. "Stondin yr Eglwys Ffair Cricieth" (CC BY-SA 2.0): a stall table under a
// long CLOTH that hangs in soft vertical folds to near the ground, lit lighter on its top.
// Flat fills lit from the top left, a darker shaded side, one dark outline. Zero imports.

const INK = '#2B2420';
const f = (n) => (+n).toFixed(2);
const fill = (d, c, w = 0.7) => `<path d="${d}" fill="${c}" stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"/>`;
const tone = (d, c, o = 1) => `<path d="${d}" fill="${c}"${o < 1 ? ` opacity="${o}"` : ''}/>`;
const rect = (x, y, w, h, r = 0) => `M${f(x + r)},${f(y)} L${f(x + w - r)},${f(y)} Q${f(x + w)},${f(y)} ${f(x + w)},${f(y + r)} L${f(x + w)},${f(y + h - r)} Q${f(x + w)},${f(y + h)} ${f(x + w - r)},${f(y + h)} L${f(x + r)},${f(y + h)} Q${f(x)},${f(y + h)} ${f(x)},${f(y + h - r)} L${f(x)},${f(y + r)} Q${f(x)},${f(y)} ${f(x + r)},${f(y)} Z`;

const WAX = {
  lav: ['#B9A6D8', '#9585B8'], rose: ['#E79AB0', '#C47590'], sage: ['#A9C49A', '#84A276'], cran: ['#B02F44', '#86222F'],
};
const GLASS = '#DDE9EC', GLASS_S = '#B4C8CE', LID = '#D7B24E', LID_S = '#A9852F', PAPER = '#FBF6E8';

/** A squat jar candle: lid, glass, wax seen through it, a paper label. x,y = top-left. */
function jar(x, y, w, h, wax, lit = true) {
  const o = [];
  const lidH = h * 0.2;
  o.push(fill(rect(x, y + lidH * 0.6, w, h - lidH * 0.6, w * 0.14), GLASS, 0.6));
  if (wax) {
    const [a, s] = WAX[wax];
    o.push(tone(rect(x + w * 0.08, y + lidH + h * 0.12, w * 0.84, h - lidH - h * 0.2, w * 0.1), a));
    o.push(tone(rect(x + w * 0.5, y + lidH + h * 0.12, w * 0.42, h - lidH - h * 0.2, w * 0.1), s, 0.8));
    o.push(fill(rect(x + w * 0.2, y + h * 0.5, w * 0.6, h * 0.26, 0.4), PAPER, 0.35));
    o.push(tone(rect(x + w * 0.3, y + h * 0.58, w * 0.4, h * 0.05, 0), '#8A7B66', 0.8));
  } else {
    o.push(tone(rect(x + w * 0.5, y + lidH + h * 0.1, w * 0.42, h - lidH - h * 0.18, w * 0.1), GLASS_S, 0.9));
    o.push(tone(rect(x + w * 0.1, y + lidH + h * 0.5, w * 0.8, h * 0.04, 0), GLASS_S));
  }
  if (lit) o.push(tone(rect(x + w * 0.12, y + lidH + h * 0.12, w * 0.1, h * 0.5, w * 0.05), '#FFFFFF', 0.6));
  if (wax) {
    o.push(fill(rect(x - w * 0.02, y, w * 1.04, lidH + h * 0.04, 0.5), LID, 0.55));
    o.push(tone(rect(x + w * 0.5, y + 0.2, w * 0.5, lidH * 0.8, 0.3), LID_S, 0.8));
  } else {
    o.push(fill(rect(x - w * 0.02, y, w * 1.04, h * 0.1, 0.4), GLASS, 0.5));
  }
  return o.join('');
}

// ── the riser crate with five candles, 148–230 × 449–477 in scene units ──────
function shelf() {
  const o = [];
  // the wooden riser crate 150–192 × 463–477, planks and a lit top edge
  o.push(fill(rect(150, 463, 42, 14, 0.8), '#A97646', 0.7));
  o.push(tone(rect(150.5, 463.5, 41, 2.2, 0.6), '#C79A66'));
  o.push(tone(rect(172, 466, 19.5, 10.5, 0.5), '#8E5F37', 0.7));
  o.push(tone('M150.5,470.5 L191.5,470.5 L191.5,471.2 L150.5,471.2 Z', '#6E4626', 0.8));
  o.push(tone('M156,463.5 L156,476.5 L156.7,476.5 L156.7,463.5 Z M186,463.5 L186,476.5 L186.7,476.5 L186.7,463.5 Z', '#6E4626', 0.7));
  const J = [[157, 457, 'lav'], [171, 457, 'rose'], [185, 457, 'sage'], [206, 471, 'rose'], [219, 471, 'lav']];
  for (const [cx, by, w] of J) o.push(jar(cx - 5.5, by - 6, 11, 12, w));
  return o.join('');
}

// ── the cloth hanging over the trestle, 100–296 × 477–501 ────────────────────
function cloth() {
  const o = [];
  const CR = '#EDE3C8', CR_S = '#CDBF9C', CR_L = '#FBF6E6';
  o.push(fill('M0,0.5 L196,0.5 L196,24 L0,24 Z', CR, 0.8));
  o.push(tone('M0.4,0.9 L195.6,0.9 L195.6,4 L0.4,4 Z', CR_L));              // the table top
  o.push(tone('M0.4,4 L195.6,4 L195.6,5 L0.4,5 Z', CR_S));                  // the edge it folds over
  for (let k = 0; k < 7; k++) {                                               // soft vertical folds
    const x = 10 + k * 28;
    o.push(tone(`M${f(x)},5 Q${f(x + 3)},14 ${f(x - 1)},23.6 L${f(x + 7)},23.6 Q${f(x + 8)},14 ${f(x + 6)},5 Z`, CR_S, 0.75));
    o.push(tone(`M${f(x + 9)},5 Q${f(x + 11)},14 ${f(x + 10)},23.6 L${f(x + 12)},23.6 Q${f(x + 13)},14 ${f(x + 11)},5 Z`, CR_L, 0.7));
  }
  o.push(tone('M0.4,21 L195.6,21 L195.6,23.6 L0.4,23.6 Z', '#C97B5A'));      // a terracotta hem band
  o.push(tone('M0.4,21 L195.6,21 L195.6,21.7 L0.4,21.7 Z', '#9E5A40'));
  return o.join('');
}

// ── the two things that are carried: a cranberry candle, an empty jar ────────
const candle = () => jar(0, 0, 12, 13, 'cran');
const empty = () => jar(0, 0, 12, 13, null);

export const ART = [
  { name: 'biz3-cloth', svg: cloth, view: { x: 0, y: 0, w: 196, h: 24 }, box: { x: 100, y: 477, w: 196, h: 24 } },
  { name: 'biz3-shelf', svg: shelf, view: { x: 148, y: 449, w: 82, h: 28 }, box: { x: 148, y: 449, w: 82, h: 28 } },
  { name: 'biz3-candle', svg: candle, view: { x: 0, y: 0, w: 12, h: 13 }, box: { x: -6, y: -6.5, w: 12, h: 13 } },
  { name: 'biz3-jar', svg: empty, view: { x: 0, y: 0, w: 12, h: 13 }, box: { x: -6, y: -6.5, w: 12, h: 13 } },
];
