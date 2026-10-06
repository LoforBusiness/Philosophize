// economics-foundations-2, "Supply and Demand" — A STREET CORNER IN THE RAIN, drawn
// (LESSON_RULES AM13). The rain cloud and the delivery van, each replacing a shape-built
// object of the same box. Flat fills lit from the top left, a shaded side, one dark outline.
//
// REFERENCES (scratchpad/ref/):
//   e2van-1    a white long-wheelbase panel van in side view (Ford Transit): the cab's raked
//              windscreen and one side window, a flat roof running back over a windowless
//              cargo box, a stripe along the flank, deep wheel arches over silver hubs, a
//              grey bumper and a yellow headlamp at the front.
//   e2cloud-1/2  rain-cloud icons: a flat base and three overlapping round lobes, the
//              middle one tallest.
// Zero imports.

const INK = '#2B2420';
const fill = (d, c, w) => `<path d="${d}" fill="${c}" stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"/>`;
const tone = (d, c, o = 1) => `<path d="${d}" fill="${c}"${o < 1 ? ` opacity="${o}"` : ''}/>`;

// ── the rain cloud, 92 × 52 ──────────────────────────────────────────────────
function cloud() {
  const o = '1.1';
  return [
    fill('M12,44 C3,44 0,34 7,29 C5,19 17,14 24,19 C27,8 44,3 53,12 C59,6 74,9 74,20 C86,19 92,32 84,38 C82,42 78,44 74,44 Z', '#8A959D', o),
    tone('M8,36 C20,41 60,41 87,33 C86,41 80,44 74,44 L12,44 C6,44 3,40 8,36 Z', '#646E76'),
    tone('M10,28 C12,21 18,18 24,20 C20,22 15,25 13,30 Z', '#B1BBC2'),
    tone('M30,15 C36,7 46,6 52,12 C45,10 37,11 32,18 Z', '#B1BBC2'),
    tone('M60,10 C66,8 72,11 73,17 C69,14 64,13 60,15 Z', '#B1BBC2'),
  ].join('');
}

// ── the delivery van, 148 × 65, facing left ─────────────────────────────────
// The doorway is 58–96 × 8–52; the sliding door is its own picture and the umbrellas of
// the load are drawn between the two.
function van() {
  const o = '1.1';
  const WHITE = '#F3F1EA', SHADE = '#D3D0C5';
  const out = [];
  out.push(fill('M4,52 L3,41 Q3,36 8,35 L15,32 L30,6 Q32,4 36,4 L140,4 Q146,4 146,10 L146,50 Q146,52 144,52 Z', WHITE, o));
  out.push(tone('M5,46 L145,46 L145,50 Q145,52 143,52 L4,52 Z', SHADE));
  out.push(tone('M31,6 L139,5.5 L139,7.5 L30,8 Z', '#FFFFFF'));
  // the flank stripe
  out.push(tone('M3,40 L146,40 L146,44 L3,44 Z', '#2E5C9C'));
  // the cab: windscreen and side window, a seam and a handle
  out.push(fill('M18,31 L31,9 L38,9 L38,31 Z', '#9CC3DB', '0.9'));
  out.push(tone('M23,28 L32,12 L34,12 L27,28 Z', '#C9E0EE'));
  out.push(`<path d="M40,6 L40,46" stroke="${INK}" stroke-width="0.7" fill="none"/>`);
  out.push(`<rect x="42" y="27" width="5" height="2.2" rx="1" fill="${SHADE}" stroke="${INK}" stroke-width="0.5"/>`);
  // the doorway onto the load, a dark cargo space
  out.push(`<rect x="58" y="8" width="38" height="44" rx="1.5" fill="#3A302B"/>`);
  // the sliding door's track along the roof
  out.push(`<path d="M52,6.6 L144,6.6" stroke="${INK}" stroke-width="0.8" fill="none"/>`);
  // the headlamp, bumper and mirror
  out.push(fill('M1,38 L4.6,38 L4.6,42 L1,42 Z', '#F2D45C', '0.7'));
  out.push(fill('M0.5,49 L9,49 L9,54 L0.5,54 Z', '#B9BDC0', '0.8'));
  out.push(fill('M13,23 L16.4,23 L16.4,29 L13,29 Z', '#3A3A3A', '0.6'));
  // the rear lamps
  out.push(fill('M144,14 L146.4,14 L146.4,22 L144,22 Z', '#C2392C', '0.6'));
  // wheel arches, tyres and hubs
  for (const cx of [20, 118]) {
    out.push(`<path d="M${cx - 12},52 A12,12 0 0 1 ${cx + 12},52 Z" fill="#3A3A3A" stroke="${INK}" stroke-width="0.9"/>`);
    out.push(`<circle cx="${cx}" cy="56" r="9" fill="#2B2B2B" stroke="${INK}" stroke-width="1"/>`);
    out.push(`<circle cx="${cx}" cy="56" r="5" fill="#C3C8CC" stroke="${INK}" stroke-width="0.7"/>`);
    out.push(`<circle cx="${cx}" cy="56" r="1.6" fill="#7B8288"/>`);
    out.push(`<path d="M${cx - 3.6},56 L${cx + 3.6},56 M${cx},52.4 L${cx},59.6" stroke="#7B8288" stroke-width="0.8"/>`);
  }
  return out.join('');
}

// ── the sliding door, 148 × 65 frame ────────────────────────────────────────
function vanDoor() {
  const WHITE = '#F3F1EA', SHADE = '#D3D0C5';
  return [
    fill('M57,7.5 L97,7.5 L97,52 L57,52 Z', WHITE, '1.1'),
    tone('M58,46 L96,46 L96,51 L58,51 Z', SHADE),
    tone('M58,40 L96,40 L96,44 L58,44 Z', '#2E5C9C'),
    tone('M58,8.5 L96,8.5 L96,10 L58,10 Z', '#FFFFFF'),
    `<rect x="62" y="26" width="6" height="2.4" rx="1.2" fill="${SHADE}" stroke="${INK}" stroke-width="0.5"/>`,
    `<path d="M97,7.5 L97,52" stroke="${INK}" stroke-width="1.1"/>`,
  ].join('');
}

export const ART = [
  { name: 'econ2-cloud', svg: cloud, view: { x: 0, y: 0, w: 92, h: 52 }, box: { x: -46, y: -26, w: 92, h: 52 } },
  { name: 'econ2-van', svg: van, view: { x: 0, y: 0, w: 148, h: 65 }, box: { x: 250, y: 435, w: 148, h: 65 } },
  { name: 'econ2-vandoor', svg: vanDoor, view: { x: 0, y: 0, w: 148, h: 65 }, box: { x: 250, y: 435, w: 148, h: 65 } },
];
