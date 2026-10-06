// psych3 — A MUSEUM GALLERY (psychology-foundations-3), the set drawn as curves (AM13).
// REFERENCES: p3-mug-2 ("Coffee Mug Flat", Commons): a mug is a plain body with a squared
// handle loop standing off one side, a shine streak down the lit side; the stoneware one
// here is treacle brown with a CHIP of bare buff body out of the rim. A museum plinth (a
// moulded cap slab, a die with a sunk panel, a plinth foot) in pale marble carrying a
// brass-framed glass showcase on a velvet pad; a round-headed gallery window with a stone
// sill, a gilt-framed landscape, a three-legged oak stool. Flat fills lit from the top
// left, a darker shaded side, ONE dark outline, real colours, no gradients, no glows.

const INK = '#2B2420';
const f = (d, c, w = '0.6') => `<path d="${d}" fill="${c}" stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"/>`;
const t = (d, c, o = 1) => `<path d="${d}" fill="${c}"${o < 1 ? ` opacity="${o}"` : ''}/>`;
const rr = (x, y, w, h, r, c, sw = '0.6') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${c}" stroke="${INK}" stroke-width="${sw}"/>`;
const bx = (x, y, w, h, r, c, o = 1) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${c}"${o < 1 ? ` opacity="${o}"` : ''}/>`;
const el = (cx, cy, rx, ry, c, sw = '0.6', o = 1) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${c}"${sw !== '0' ? ` stroke="${INK}" stroke-width="${sw}"` : ''}${o < 1 ? ` opacity="${o}"` : ''}/>`;

const GILT = '#C9A13B', GILTD = '#9C7B2A', GILTL = '#E8CC73';
const MARB = '#E9E5DB', MARBD = '#CFC9BB', MARBL = '#FBFAF6';
const OAK = '#B98B57', OAKD = '#94693F', OAKL = '#D2A874';
const BROWN = '#7E4524', BROWND = '#5C311A', BROWNL = '#A5663A', BUFF = '#D9BC8C';

// ── THE GILT-FRAMED LANDSCAPE 62–130 × 370–430 ─────────────────────────────────────────
export function painting() {
  return `<g transform="translate(-32,-25)">${paintingBody()}</g>`;
}
function paintingBody() {
  const out = [];
  // the gilt-framed landscape 64–128 × 372–422
  out.push(rr(64, 372, 64, 50, 1.5, GILT, '0.8'));
  out.push(bx(65.2, 373.2, 61.6, 1.6, 0.6, GILTL));
  out.push(bx(65.2, 373.2, 1.6, 47.6, 0.6, GILTL, 0.8));
  out.push(bx(125.2, 374, 1.6, 46.8, 0.6, GILTD));
  out.push(bx(65.2, 419.2, 61.6, 1.6, 0.6, GILTD));
  out.push(rr(69.5, 377.5, 53, 39, 0.6, '#BFD8E6', '0.6'));
  out.push(t('M70,400 C80,391 90,396 100,392 C108,389 116,394 122,391 L122,416 L70,416 Z', '#8DA593'));
  out.push(t('M70,408 C82,401 96,408 108,403 C114,401 118,404 122,403 L122,416 L70,416 Z', '#6F8F3F'));
  out.push(t('M96,408 C102,405 112,405 122,408 L122,416 L96,416 Z', '#58762F'));
  out.push(`<rect x="82.4" y="396" width="2.4" height="9" fill="${BROWND}"/>`);
  out.push(el(83.6, 392.5, 6, 5.4, '#4F7A30', '0.5'));
  out.push(t('M80,392 C81,389 85,388 87,390 C86,393 83,395 80,394 Z', '#6F9A45'));
  out.push(el(111, 384, 3, 3, '#F4E7A8', '0'));
  out.push(el(98, 383, 6, 1.6, '#FFFFFF', '0', 0.8));
  out.push(rr(88, 424.5, 16, 4, 0.8, GILT, '0.5'));
  return out.join('');
}

// ── THE WINDOW 327–399 × 370–466 ────────────────────────────────────────────
export function window() {
  return `<g transform="translate(-32,-44)">${windowBody()}</g>`;
}
function windowBody() {
  const out = [];
  const arch = 'M331,460 L331,404 C331,386 345,372 363,372 C381,372 395,386 395,404 L395,460 Z';
  out.push(f(arch, '#E4DCC8', '0.9'));
  out.push(t('M331,404 C331,386 345,372 363,372 L363,376 C349,377 335,390 335,404 L335,460 L331,460 Z', '#F6F1E2'));
  out.push(t('M391,404 L395,404 L395,460 L391,460 Z', '#C9C0A8'));
  const glassD = 'M335.5,456 L335.5,404 C335.5,389 347,376.5 363,376.5 C379,376.5 390.5,389 390.5,404 L390.5,456 Z';
  out.push(f(glassD, '#C4DDEC', '0.7'));
  out.push(`<clipPath id="p3w"><path d="${glassD}"/></clipPath>`);
  out.push(`<g clip-path="url(#p3w)">`
    + t('M330,440 C345,432 355,438 368,431 C380,426 388,432 396,430 L396,460 L330,460 Z', '#8FB08C')
    + t('M330,449 C348,443 362,450 378,445 C386,443 392,446 396,446 L396,460 L330,460 Z', '#6E9A55')
    + el(350, 414, 7, 2.6, '#FFFFFF', '0', 0.85) + el(356, 412, 4.5, 2.4, '#FFFFFF', '0', 0.85)
    + el(380, 399, 6, 2.1, '#FFFFFF', '0', 0.8)
    + `</g>`);
  out.push(bx(362.2, 376.5, 1.8, 80, 0, '#E4DCC8'));
  out.push(bx(335.5, 411, 55, 1.8, 0, '#E4DCC8'));
  out.push(`<path d="M335.5,404 C335.5,389 347,376.5 363,376.5 C379,376.5 390.5,389 390.5,404" fill="none" stroke="#E4DCC8" stroke-width="1.6"/>`);
  out.push(rr(327, 457.5, 72, 6.5, 1.4, '#E9E2D0', '0.8'));
  out.push(bx(328, 458.6, 70, 1.6, 0.6, MARBL));
  out.push(bx(328, 461.6, 70, 1.8, 0.6, MARBD));
  return out.join('');
}

// ── THE PLINTH, THE VELVET PAD AND THE LABEL'S FOOT, 146–256 × 440–502 ───────
export function plinth() {
  const out = [];
  out.push(rr(150, 494, 100, 6, 1.2, MARBD, '0.8'));
  out.push(bx(151, 495, 98, 1.6, 0.6, MARB));
  out.push(rr(155, 479.5, 90, 15, 0.8, MARB, '0.8'));
  out.push(t('M232,480.3 L244.2,480.3 L244.2,494 L232,494 Z', MARBD));
  out.push(bx(156, 480.4, 2.2, 13.2, 0.6, MARBL, 0.9));
  out.push(`<rect x="164" y="483" width="68" height="8.4" rx="0.8" fill="${MARBD}" opacity="0.55" stroke="${INK}" stroke-width="0.35"/>`);
  out.push(rr(150, 474, 100, 5.8, 1.2, MARBL, '0.8'));
  out.push(bx(150.8, 478, 98.4, 1.5, 0.5, MARBD));
  // the velvet pad under the mug
  out.push(rr(157, 470.6, 36, 3.4, 1.2, '#7A2432', '0.5'));
  out.push(bx(158.4, 471.1, 33, 0.9, 0.4, '#B04A5A'));
  // the label's brass foot and strut
  out.push(rr(204, 471.4, 44, 2.6, 0.9, GILT, '0.5'));
  out.push(bx(205, 471.8, 42, 0.8, 0.3, GILTL));
  out.push(f('M236,464 L242,464 L245,471.4 L238,471.4 Z', GILTD, '0.45'));
  return out.join('');
}

// ── THE SHOWCASE GLASS, 152–198 × 444–476 ────────────────────────────────────
export function glass() {
  return [
    `<rect x="154.4" y="446.4" width="41.2" height="27.2" fill="#DDEEF6" opacity="0.28"/>`,
    t('M160,447 L166,447 L158,473 L154.6,473 L154.6,466 Z', '#FFFFFF', 0.5),
    t('M169,447 L171.6,447 L163.6,473 L161.2,473 Z', '#FFFFFF', 0.4),
    `<rect x="154.4" y="446.4" width="41.2" height="27.2" fill="none" stroke="#8FB0C2" stroke-width="0.5" opacity="0.8"/>`,
  ].join('');
}

// ── THE SHOWCASE'S BRASS FRAME, 150–200 × 440–478 ────────────────────────────
export function frame() {
  return [
    rr(152, 443.2, 46, 4.6, 1, GILT, '0.7'),
    bx(153, 444, 44, 1.2, 0.5, GILTL),
    rr(152, 446.6, 3.4, 27.4, 0.5, GILT, '0.6'),
    bx(152.7, 447.4, 1, 25, 0.4, GILTL, 0.9),
    rr(194.6, 446.6, 3.4, 27.4, 0.5, GILTD, '0.6'),
    rr(152, 472.6, 46, 4, 1, GILT, '0.7'),
    bx(153, 473.2, 44, 1, 0.4, GILTL),
    bx(153, 475.2, 44, 1, 0.4, GILTD),
  ].join('');
}

// ── THE OAK STOOL, 320–352 × 482–502 ─────────────────────────────────────────
export function stool() {
  return [
    f('M337,491 L338.4,491 L338.6,500 L336.6,500 Z', OAKD, '0.5'),
    f('M326,491 L329.4,491 L326.4,500 L323.8,500 Z', OAK, '0.55'),
    f('M342.6,491 L346,491 L348.4,500 L345.8,500 Z', OAKD, '0.55'),
    bx(326, 495.6, 20, 1.5, 0.4, OAKD),
    rr(322.6, 485.6, 26.8, 5.6, 2.4, OAK, '0.8'),
    bx(324.4, 486.4, 23, 1.4, 0.6, OAKL),
    bx(324, 489.6, 24, 1.3, 0.5, OAKD),
  ].join('');
}

// ── THE CHIPPED MUG, held by its handle (origin = the grip, 18 × 16) ─────────
export function mug() {
  return [
    `<path d="M-4.4,-2.6 L-0.9,-2.6 L-0.9,3.8 L-4.2,3.8" fill="none" stroke="${INK}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>`,
    `<path d="M-4.4,-2.6 L-0.9,-2.6 L-0.9,3.8 L-4.2,3.8" fill="none" stroke="${BROWN}" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"/>`,
    f('M-14.6,-4.4 L-4.6,-4.4 L-3.6,6.4 C-3.6,6.9 -4.1,7.2 -4.6,7.2 L-14.6,7.2 C-15.1,7.2 -15.6,6.9 -15.6,6.4 Z', BROWN, '0.7'),
    t('M-8.6,-4 L-4.8,-4 L-3.9,6.4 C-3.9,6.8 -4.3,7 -4.7,7 L-8.6,7 Z', BROWND),
    bx(-14.2, -2.4, 1.6, 8.4, 0.7, BROWNL, 0.85),
    `<path d="M-14.8,5 L-3.8,5" stroke="${BROWND}" stroke-width="0.4" fill="none"/>`,
    el(-9.6, -4.4, 5.2, 1.5, BROWND, '0.6'),
    el(-9.6, -4.3, 4.1, 1, '#E6D3AE', '0'),
    t('M-14,-5 C-13.2,-6.3 -11.6,-6.3 -11,-5.2 C-11.8,-4.7 -13,-4.2 -14,-4.4 Z', BUFF),
    el(-13.3, -4, 1.2, 0.6, BUFF, '0'),
  ].join('');
}

// ── THE MUG TURNED OVER (origin = the handle's end, 22 × 17) ─────────────────
export function mugBase() {
  return [
    `<path d="M-6.4,0 L-0.2,0" stroke="${INK}" stroke-width="3.2" stroke-linecap="round" fill="none"/>`,
    `<path d="M-6.4,0 L-0.2,0" stroke="${BROWN}" stroke-width="1.9" stroke-linecap="round" fill="none"/>`,
    el(-12.2, 0, 7.2, 7.2, BROWN, '0.7'),
    el(-12.2, 0, 5.8, 5.8, BUFF, '0.4'),
    el(-12.2, 0, 4.5, 4.5, BROWN, '0.4'),
    el(-12.2, 0, 3.6, 2.9, '#FFFFFF', '0.5'),
    bx(-14.7, -1.2, 4.6, 0.55, 0.2, '#8A8A86'),
    bx(-14.7, 0.1, 3.2, 0.55, 0.2, '#8A8A86'),
    el(-9.9, 1.2, 0.75, 0.75, '#B8322A', '0'),
  ].join('');
}

// ── THE CARD HE LAYS OVER THE LABEL (origin = its right-hand end, 48 × 26) ───
export function card() {
  return [
    bx(-47, -10.8, 48, 26, 2.4, '#1A1A1A', 0.18),
    rr(-48, -13, 47.4, 25.4, 2.4, '#F7F2E4', '0.8'),
    `<rect x="-46.2" y="-11.2" width="43.8" height="21.8" rx="1.4" fill="none" stroke="#CFC4A8" stroke-width="0.6"/>`,
    bx(-47.4, -12.4, 46, 1.2, 0.5, '#FFFFFF', 0.9),
  ].join('');
}

export const ART = [
  { name: 'psych3-painting', svg: painting, view: { x: 30, y: 345, w: 68, h: 60 }, box: { x: 30, y: 345, w: 68, h: 60 } },
  { name: 'psych3-window', svg: window, view: { x: 294, y: 326, w: 74, h: 96 }, box: { x: 294, y: 326, w: 74, h: 96 } },
  { name: 'psych3-plinth', svg: plinth, view: { x: 146, y: 440, w: 110, h: 62 }, box: { x: 146, y: 440, w: 110, h: 62 } },
  { name: 'psych3-glass', svg: glass, view: { x: 152, y: 444, w: 46, h: 32 }, box: { x: 152, y: 444, w: 46, h: 32 } },
  { name: 'psych3-frame', svg: frame, view: { x: 150, y: 440, w: 50, h: 38 }, box: { x: 150, y: 440, w: 50, h: 38 } },
  { name: 'psych3-stool', svg: stool, view: { x: 320, y: 482, w: 32, h: 20 }, box: { x: 320, y: 482, w: 32, h: 20 } },
  { name: 'psych3-mug', svg: mug, view: { x: -16.4, y: -8.57, w: 18, h: 16 }, box: { x: -16.4, y: -8.57, w: 18, h: 16 } },
  { name: 'psych3-mugbase', svg: mugBase, view: { x: -20.8, y: -8.5, w: 22, h: 17 }, box: { x: -20.8, y: -8.5, w: 22, h: 17 } },
  { name: 'psych3-card', svg: card, view: { x: -49, y: -14, w: 50, h: 28 }, box: { x: -49, y: -14, w: 50, h: 28 } },
];
