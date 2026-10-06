// science-foundations-3, "Correlation Isn't Causation" — A SEASIDE (LESSON_RULES AM13).
// The sun, the fair-weather cloud and a far sailing boat, drawn as curves. References
// (Wikimedia Commons, `npm run ref`): a flat-illustration sun is a disc with ONE ring of
// short rounded rays of alternating length; a cumulus is one flat-bottomed mass of
// overlapping domes; a dinghy is a shallow hull under a tall triangular mainsail and a
// smaller jib. Flat fills lit from the top left, a shaded side, one outline, no glow.
const INK = '#2B2420';
const fill = (d, c, line = INK, w = 0.7) => `<path d="${d}" fill="${c}" stroke="${line}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"/>`;
const tone = (d, c, o = 1) => `<path d="${d}" fill="${c}" opacity="${o}"/>`;

const sunSvg = () => {
  let rays = '';
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * Math.PI * 2;
    const r0 = 11.4, r1 = k % 2 ? 15.2 : 17;
    const x0 = Math.cos(a) * r0, y0 = Math.sin(a) * r0, x1 = Math.cos(a) * r1, y1 = Math.sin(a) * r1;
    rays += `<path d="M${x0.toFixed(2)},${y0.toFixed(2)} L${x1.toFixed(2)},${y1.toFixed(2)}" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>`;
    rays += `<path d="M${x0.toFixed(2)},${y0.toFixed(2)} L${x1.toFixed(2)},${y1.toFixed(2)}" stroke="#F4C430" stroke-width="2.4" stroke-linecap="round"/>`;
  }
  return rays
    + fill('M0,-10.5 A10.5,10.5 0 1 1 0,10.5 A10.5,10.5 0 1 1 0,-10.5 Z', '#F4C430', INK, 1.1)
    + tone('M3,-9.6 A9.6,9.6 0 0 1 3,9.6 A12,12 0 0 0 3,-9.6 Z', '#D6A41A')
    + tone('M-6.5,-5 A7.6,7.6 0 0 1 -1,-8.3 A9,9 0 0 0 -6.5,-5 Z', '#FFE58A');
};

const cloudSvg = () =>
  fill('M-27,8 C-30,8 -30,0 -24,0 C-24,-6 -16,-8 -13,-4 C-11,-12 3,-13 5,-5 C9,-10 20,-8 19,0 C26,-1 29,7 24,8 Z', '#FFFFFF', INK, 0.9)
  + tone('M-27,8 C-30,8 -30,2 -25,1 L24,8 Z', '#D9E3EA')
  + tone('M-14,-4 C-11,-10 -3,-11 0,-8 C-6,-9 -11,-7 -14,-4 Z', '#FFFFFF');

const boatSvg = () =>
  fill('M2,-27 L2,-3 L-12,-3 Z', '#FFFFFF', '#5A6B74', 0.7)
  + tone('M2,-27 L2,-3 L-2,-3 Z', '#DCE6EC')
  + fill('M4.5,-22 L4.5,-3 L14,-3 Z', '#E8E1D2', '#5A6B74', 0.7)
  + fill('M-15,-1.5 L17,-1.5 L12,4 L-10,4 Z', '#B53B2E', '#5A6B74', 0.7)
  + tone('M-15,-1.5 L17,-1.5 L16,0.2 L-14.4,0.2 Z', '#D8584A')
  + `<path d="M2.4,-29 L2.4,-1.5" stroke="#5A6B74" stroke-width="0.9" stroke-linecap="round"/>`;

export const ART = [
  { name: 'sci3-sun', svg: sunSvg, view: { x: -19, y: -19, w: 38, h: 38 }, box: { x: -19, y: -19, w: 38, h: 38 } },
  { name: 'sci3-cloud', svg: cloudSvg, view: { x: -32, y: -14, w: 62, h: 25 }, box: { x: -32, y: -14, w: 62, h: 25 } },
  { name: 'sci3-boat', svg: boatSvg, view: { x: -17, y: -30, w: 36, h: 36 }, box: { x: -17, y: -30, w: 36, h: 36 } },
];
