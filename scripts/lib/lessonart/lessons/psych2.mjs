// psych2 — A SUPERMARKET JAM AISLE (psychology-foundations-2). The end-of-aisle shelving
// with its 24 jars and the aisle floor, drawn as curves (LESSON_RULES AM13), in SCENE units
// with view = box so the picture lands exactly where the shape-built shelf stood.
// REFERENCE: psych2-shelf-2 ("Honey Jar icon", Commons): a jar is a glass body with ROUNDED
// SHOULDERS, a wide paper label across its belly, the jam showing above and below it, and
// a metal screw lid with a pale top. And the gondola end of a shop aisle: a pale steel
// upright, a back panel, a thin lit plank under every row, a plinth at the foot.
// Flat fills lit from the top left, a darker shaded side, ONE dark outline. Zero imports.

const INK = '#2B2420';
const f = (d, c, w = '0.5') => `<path d="${d}" fill="${c}" stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"/>`;
const t = (d, c, o = 1) => `<path d="${d}" fill="${c}"${o < 1 ? ` opacity="${o}"` : ''}/>`;
const box = (x, y, w, h, r, c, o = 1) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${c}"${o < 1 ? ` opacity="${o}"` : ''}/>`;
const rr = (x, y, w, h, r, c, sw = '0.6') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${c}" stroke="${INK}" stroke-width="${sw}"/>`;

const FILLS = {
  marmalade: ['#E58A1F', '#C06C10', '#F4B25A'],
  blackcurrant: ['#5B2A55', '#431C3F', '#8A5A84'],
  jam: ['#B8283A', '#8F1B2C', '#E0707E'],
};

// one jar, 11 wide × 12 tall, its centre at (cx, cy)
function jar(cx, cy, kind) {
  const [base, shade, lit] = FILLS[kind];
  const x = cx - 5.5, y = cy - 6;
  return [
    // glass body with rounded shoulders, filled with the jam
    f(`M${x + 1.4},${y + 2.6} C${x + 0.2},${y + 3.4} ${x},${y + 4.6} ${x},${y + 6} L${x},${y + 10.2} C${x},${y + 11.4} ${x + 0.8},${y + 12} ${x + 1.8},${y + 12} `
      + `L${x + 9.2},${y + 12} C${x + 10.2},${y + 12} ${x + 11},${y + 11.4} ${x + 11},${y + 10.2} L${x + 11},${y + 6} C${x + 11},${y + 4.6} ${x + 10.8},${y + 3.4} ${x + 9.6},${y + 2.6} Z`, base),
    // its shaded right side and a lit streak down the left
    t(`M${x + 8.4},${y + 3} L${x + 9.6},${y + 2.6} C${x + 10.8},${y + 3.4} ${x + 11},${y + 4.6} ${x + 11},${y + 6} L${x + 11},${y + 10.2} C${x + 11},${y + 11.4} ${x + 10.2},${y + 12} ${x + 9.2},${y + 12} L${x + 8.2},${y + 12} Z`, shade),
    t(`M${x + 1.5},${y + 4.6} L${x + 2.5},${y + 4.6} L${x + 2.5},${y + 10.4} L${x + 1.5},${y + 10.4} Z`, lit, 0.7),
    // the paper label across its belly, a band of colour on it
    `<rect x="${x + 0.2}" y="${y + 5.4}" width="10.6" height="4.4" fill="#F6F1E6" stroke="${INK}" stroke-width="0.3"/>`,
    `<rect x="${x + 8.6}" y="${y + 5.6}" width="2.2" height="4" fill="#DDD5C2"/>`,
    box(x + 2.4, y + 6.6, 6, 0.9, 0.3, base),
    box(x + 3.4, y + 8.2, 4, 0.6, 0.3, shade),
    // the screw lid: a metal band and a pale top
    rr(x + 1.2, y + 0.4, 8.6, 2.6, 0.7, '#B8B0A2', '0.4'),
    box(x + 1.7, y + 0.7, 7.6, 0.8, 0.3, '#E6E0D3'),
    box(x + 7.8, y + 1.5, 1.8, 1.3, 0.3, '#948C7E'),
  ].join('');
}

// ── THE SHELVING AT THE END OF THE AISLE, 312–396 × 372–500 ─────────────────
// Rows (centre y of a jar): 390.5, 418.5, 444.5, 470.5. The first jar of the third shelf
// is the one she took: that gap is left empty.
export function shelving() {
  const STEEL = '#B9C0C6', STEELD = '#8E979E', STEELL = '#DCE1E5', BACK = '#E9E5DA', BACKD = '#D3CDBF';
  const rows = [
    [390.5, ['marmalade', 'marmalade', 'marmalade', 'marmalade', 'marmalade']],
    [418.5, ['blackcurrant', 'blackcurrant', 'blackcurrant', 'blackcurrant', 'blackcurrant']],
    [444.5, ['jam', 'jam', 'jam', 'jam', 'jam']],
    [470.5, ['jam', 'marmalade', 'jam', 'marmalade', 'jam']],
  ];
  const xs = [327, 341, 355, 369, 383];
  const out = [
    // the upright's frame and back panel
    rr(314, 374, 80, 126, 2, STEEL, '0.9'),
    box(389, 376, 4, 122, 1.4, STEELD),
    box(315.5, 376, 2.2, 122, 1, STEELL),
    rr(319, 380, 70, 114, 1, BACK, '0.5'),
    box(319.5, 380.5, 69, 2.4, 0.6, BACKD),
    // the red price rail on top, with its little tags
    rr(316, 374, 76, 5, 1.4, '#C2392C', '0.6'),
    box(317, 375, 74, 1, 0.4, '#E0786C'),
  ];
  for (const [cy, kinds] of rows) {
    // the shelf plank under the row, then the jars standing on it
    out.push(rr(318, cy + 6, 72, 3, 0.8, STEEL, '0.5'), box(318.6, cy + 6.4, 70.8, 0.8, 0.3, STEELL));
    // a soft shadow along the back panel under the plank above the row
    out.push(box(319.5, cy - 7.6, 69, 1.4, 0.4, BACKD, 0.6));
    kinds.forEach((k, j) => {
      if (cy === 444.5 && j === 0) return;
      out.push(jar(xs[j], cy, k));
    });
  }
  // the plinth at the foot
  out.push(rr(312, 490, 84, 10, 1.6, STEELD, '0.8'), box(313, 491, 82, 2, 0.6, STEEL));
  return out.join('');
}

// ── THE AISLE FLOOR: tile joints in perspective, 0–400 × 500–514 ────────────
export function tiles() {
  const J = '#C9C4D6';
  const out = [];
  // far joint, then two nearer, spaced as the floor comes toward the viewer
  for (const y of [503.5, 509.5, 514]) out.push(`<path d="M0,${y} L400,${y}" stroke="${J}" stroke-width="0.7" fill="none"/>`);
  for (let x = -40; x <= 440; x += 52) {
    out.push(`<path d="M${200 + (x - 200) * 0.82},500 L${x},514" stroke="${J}" stroke-width="0.7" fill="none"/>`);
  }
  return out.join('');
}

export const ART = [
  { name: 'psych2-shelving', svg: shelving, view: { x: 312, y: 372, w: 84, h: 128 }, box: { x: 312, y: 372, w: 84, h: 128 } },
  { name: 'psych2-tiles', svg: tiles, view: { x: 0, y: 500, w: 400, h: 14 }, box: { x: 0, y: 500, w: 400, h: 14 } },
];
