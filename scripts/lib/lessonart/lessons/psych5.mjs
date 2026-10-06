// psych5 — THE LANDING FIELD (psychology-foundations-5). The three packed suitcases and the
// prophet's fruit crate, drawn as real objects in SCENE units (view = box) so each lands
// exactly where the shape-built one stood. REFERENCE: p5-suit-1 (Pinhead suitcase icon: a
// squat body, TWO vertical straps, a handle that stands on top) and p5-crate-1 (Delapouite
// wooden crate: a frame of planks, upright slats and one diagonal brace). Flat fills lit
// from the top left, a shaded right side, one dark outline, no gradients.

const INK = '#2B2420';
const f = (d, c, w = '1') => `<path d="${d}" fill="${c}" stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"/>`;
const t = (d, c) => `<path d="${d}" fill="${c}"/>`;
const ln = (d, c, w) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;

// A suitcase centred on cx, standing on y 500: body 54 wide, 41 tall, handle to y 452.
function suitcase(cx, body, lit, dark, strap) {
  const L = cx - 27, R = cx + 27, T = 459, B = 500;
  return [
    // the handle stands up from the lid
    ln(`M${cx - 8},${T + 1} L${cx - 8},${T - 3.5} Q${cx - 8},${T - 6.5} ${cx - 5},${T - 6.5} L${cx + 5},${T - 6.5} Q${cx + 8},${T - 6.5} ${cx + 8},${T - 3.5} L${cx + 8},${T + 1}`, INK, '3.4'),
    ln(`M${cx - 8},${T + 1} L${cx - 8},${T - 3.5} Q${cx - 8},${T - 6.5} ${cx - 5},${T - 6.5} L${cx + 5},${T - 6.5} Q${cx + 8},${T - 6.5} ${cx + 8},${T - 3.5} L${cx + 8},${T + 1}`, strap, '1.7'),
    // the body: rounded corners, a shaded right side
    f(`M${L + 4},${T} L${R - 4},${T} Q${R},${T} ${R},${T + 4} L${R},${B - 3} Q${R},${B} ${R - 3},${B} L${L + 3},${B} Q${L},${B} ${L},${B - 3} L${L},${T + 4} Q${L},${T} ${L + 4},${T} Z`, body, '1.1'),
    t(`M${R - 7},${T + 1} L${R - 4},${T + 1} Q${R - 1},${T + 1} ${R - 1},${T + 4} L${R - 1},${B - 3} Q${R - 1},${B - 1} ${R - 3},${B - 1} L${R - 7},${B - 1} Z`, dark),
    // the lit top edge, the lid seam and the dark foot
    ln(`M${L + 4},${T + 1.2} L${R - 9},${T + 1.2}`, lit, '1.4'),
    ln(`M${L + 1},${T + 11} L${R - 1},${T + 11}`, dark, '0.9'),
    t(`M${L + 2},${B - 2.4} L${R - 2},${B - 2.4} L${R - 3},${B - 0.6} L${L + 3},${B - 0.6} Z`, dark),
    // two buckled straps
    ...[L + 11, R - 11].map((x) => f(`M${x - 2.6},${T} L${x + 2.6},${T} L${x + 2.6},${B} L${x - 2.6},${B} Z`, strap, '0.8')),
    ...[L + 11, R - 11].map((x) => t(`M${x + 0.8},${T + 0.6} L${x + 2.2},${T + 0.6} L${x + 2.2},${B - 0.6} L${x + 0.8},${B - 0.6} Z`, dark)),
    // brass clasps and corner guards
    f(`M${cx - 3},${T + 9.5} L${cx + 3},${T + 9.5} L${cx + 3},${T + 14.5} L${cx - 3},${T + 14.5} Z`, '#D9A93A', '0.8'),
    t(`M${cx - 2.2},${T + 10.2} L${cx + 0.4},${T + 10.2} L${cx + 0.4},${T + 11.6} L${cx - 2.2},${T + 11.6} Z`, '#F2D27A'),
    ...[[L + 0.4, T + 0.4], [R - 4.6, T + 0.4]].map(([x, y]) => t(`M${x},${y} L${x + 4.2},${y} L${x + 4.2},${y + 4.2} L${x},${y + 4.2} Z`, '#D9A93A')),
    ...[L + 11, R - 11].map((x) => f(`M${x - 2},${T + 16} L${x + 2},${T + 16} L${x + 2},${T + 20} L${x - 2},${T + 20} Z`, '#D9A93A', '0.6')),
  ].join('');
}
const tan = () => suitcase(252, '#B98A4E', '#D8B27A', '#8F6A38', '#6B4A27');
const red = () => suitcase(310, '#B8433A', '#DB7569', '#8D2F2A', '#5E2420');
const green = () => suitcase(368, '#456B4A', '#6E967A', '#31503A', '#2B2420');

// THE PROPHET'S CRATE, 70–162 × 474–500: a plank frame, upright slats, one diagonal brace.
function crate() {
  const W = '#C48B4B', WL = '#DDAE72', WD = '#9A6A34', X0 = 70.5, X1 = 161.5, T = 474.5, B = 499.5;
  const out = [
    f(`M${X0},${T} L${X1},${T} L${X1},${B} L${X0},${B} Z`, W, '1.1'),
    t(`M${X0 + 1},${T + 1} L${X1 - 1},${T + 1} L${X1 - 1},${T + 3.2} L${X0 + 1},${T + 3.2} Z`, WL),
    t(`M${X1 - 6},${T + 3.4} L${X1 - 1},${T + 3.4} L${X1 - 1},${B - 1} L${X1 - 6},${B - 1} Z`, WD),
    // the frame inside
    f(`M${X0 + 6},${T + 6} L${X1 - 6},${T + 6} L${X1 - 6},${B - 5} L${X0 + 6},${B - 5} Z`, '#B27A3E', '0.8'),
  ];
  for (let x = X0 + 6 + 15.1; x < X1 - 8; x += 15.1) out.push(ln(`M${x},${T + 6.4} L${x},${B - 5.4}`, WD, '0.8'));
  // the diagonal brace, with a nail at each end
  out.push(f(`M${X0 + 8},${B - 5} L${X0 + 17},${B - 5} L${X1 - 8},${T + 6} L${X1 - 17},${T + 6} Z`, W, '0.9'));
  out.push(t(`M${X0 + 10},${B - 6} L${X0 + 14},${B - 6} L${X1 - 12},${T + 7.2} L${X1 - 16},${T + 7.2} Z`, WL));
  for (const [x, y] of [[X0 + 3, T + 3.2], [X1 - 3, T + 3.2], [X0 + 3, B - 2.6], [X1 - 3, B - 2.6]]) out.push(`<circle cx="${x}" cy="${y}" r="0.9" fill="#4A3A2C"/>`);
  return out.join('');
}

export const ART = [
  // ps5CaseTan/Red/Green(cx, 476, 54, 48)
  { name: 'psych5-case-tan', svg: tan, view: { x: 225, y: 452, w: 54, h: 48 }, box: { x: 225, y: 452, w: 54, h: 48 } },
  { name: 'psych5-case-red', svg: red, view: { x: 283, y: 452, w: 54, h: 48 }, box: { x: 283, y: 452, w: 54, h: 48 } },
  { name: 'psych5-case-green', svg: green, view: { x: 341, y: 452, w: 54, h: 48 }, box: { x: 341, y: 452, w: 54, h: 48 } },
  // ps5Crate(116, 487, 92, 26)
  { name: 'psych5-crate', svg: crate, view: { x: 70, y: 474, w: 92, h: 26 }, box: { x: 70, y: 474, w: 92, h: 26 } },
];
