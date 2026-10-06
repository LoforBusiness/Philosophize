// science-foundations-2, "What Makes a Fair Test?" — the two paper planes, drawn (LESSON_RULES AM13).
//
// REFERENCES (npm run ref, scratchpad/ref/s2-*): a classic paper dart seen from just above
// the side — a long central keel fold, two swept wings that fan back from the nose, the near
// wing lit and the far wing in shade, a small rear notch; her plane's nose is a long sharp
// point (pink paper), his is the stubby blunt fold with the front corner turned square.
// Each is drawn about its middle, nose to the right, in the box the shape-built plane had
// (centred on the carrying point). Flat fills lit from the top left, one dark outline.

const INK = '#2B2420';
const fill = (d, c, w = 1.1) => `<path d="${d}" fill="${c}" stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"/>`;
const line = (d, c, w) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;

function plane(noseX, lit, shade, fold, blunt) {
  const n = noseX;
  const nose = blunt ? `L${n - 5},9 L${n},13 L${n - 5},17` : '';
  return [
    // far wing, in shade, fanning up and back
    fill(`M${n},13 L8,2.4 L5.5,12.6 L22,13.6 Z`, shade),
    // the keel: the folded belly beneath, in shade
    fill(`M${n - 8},13.4 L6,13.2 L13,20.4 L${n - 16},15.4 Z`, shade, 0.9),
    // near wing, lit
    fill(`M${n},13 L7,23.6 L5.2,13.4 L${n - 14},12.4 Z`, lit),
    // the central fold, a crisp dark crease from nose to tail
    line(`M${n},13 L5.4,13.1`, fold, 1),
    // wing-tip crease and the little tail notch
    line(`M${n - 14},12.6 L7.5,22.4`, fold, 0.6),
    line(`M5.4,13 L8.4,9`, fold, 0.6),
    blunt ? fill(`M${n - 6},9.6 L${n},13 L${n - 6},16.4 Z`, lit, 0.9) : '',
  ].join('');
}

export const ART = [
  {
    name: 'sci2-hers',
    svg: () => plane(58, '#F4B3C6', '#D4809C', '#A9456B', false),
    view: { x: 0, y: 0, w: 60, h: 26 },
    box: { x: -15, y: -6.7, w: 30, h: 13 },
  },
  {
    name: 'sci2-his',
    svg: () => plane(50, '#FAF6EA', '#CFC6AE', '#7C735C', true),
    view: { x: 0, y: 0, w: 60, h: 26 },
    box: { x: -15, y: -6.7, w: 30, h: 13 },
  },
];
