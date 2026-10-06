// philosophy-foundations-1, "What Is Philosophy?" — the bicycle workshop's detailed art,
// drawn as curves (LESSON_RULES AM13) and baked by make-lesson-art.mjs. Every drawing takes
// the box of the shape-built object it replaces, so nothing on the stage moves. Flat fills
// lit from the top left, a shaded side, one dark outline. Zero imports.
//
// REFERENCES (npm run ref, scratchpad/ref/a1-*): a-1 bicycle-3, Eddy Merckx's Faema steel
// racing bicycle (CC BY 2.0) — lugged red tubes, a black leather saddle on a long post,
// the chainring's teeth, a crank and pedal, thirty-two wire spokes laced across each
// other; a1-bicycle-2, a bare LeMond frame in a Park Tool stand — the head tube's
// lugs, the fork's rake, the dropouts; a1-bikestand-3, a red frame in a stand at the
// Bicycle Kitchen, Los Angeles, with a MANILA JOB TAG hung off the bars on a string; and
// slatted fruit crates (ec6crate-1/2, ps5-crate-1).

const INK = '#2B2420';

const fill = (d, c, w) => `<path d="${d}" fill="${c}" stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"/>`;
const tone = (d, c, o = 1) => `<path d="${d}" fill="${c}" opacity="${o}"/>`;
const line = (d, c, w) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const circ = (cx, cy, r, c, w) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${c}" stroke="${INK}" stroke-width="${w}"/>`;
const f2 = (v) => v.toFixed(2);

/** A tube from a to b of width w: an outlined round-ended bar, with a lit stripe along its top. */
function tubeBar([ax, ay], [bx, by], w, c, lit, ow) {
  // drawn as two strokes, ink under paint, so tubes that meet share one outline
  return {
    under: line(`M${ax},${ay} L${bx},${by}`, INK, w + 2 * ow),
    over: line(`M${ax},${ay} L${bx},${by}`, c, w)
      + (lit ? line(`M${f2(ax + 0.22 * w * Math.sign(by - ay || 1))},${f2(ay - 0.25 * w)} L${f2(bx)},${f2(by - 0.25 * w)}`, lit, w * 0.28) : ''),
  };
}

// ── a wheel, in the frame's units: tyre centre-line radius 17, outer 19.3 ──────────
// Thirty-two spokes laced across each other (each leaves the hub flange at a tangent),
// a bright rim inside a dark tyre, a small barrel hub — the reference's open wheel, with
// daylight between the spokes.
function wheel(cx, cy, { tyre, tyreLit, rim, spoke, hub, wobble = 0 }) {
  const out = [];
  // a road tyre: narrow, black, its lit edge along the top left
  out.push(circ(cx, cy, 17.2, 'none', 3.4 + 1.1));
  out.push(`<circle cx="${cx}" cy="${cy}" r="17.2" fill="none" stroke="${tyre}" stroke-width="3.4"/>`);
  out.push(`<path d="M${cx - 15.9},${cy - 6.6} A17.2,17.2 0 0 1 ${cx + 6.6},${cy - 15.9}" fill="none" stroke="${tyreLit}" stroke-width="0.8" stroke-linecap="round"/>`);
  out.push(`<circle cx="${cx}" cy="${cy}" r="15" fill="none" stroke="${rim}" stroke-width="1.2"/>`);
  out.push(`<circle cx="${cx}" cy="${cy}" r="14.2" fill="none" stroke="${INK}" stroke-width="0.35"/>`);
  for (let k = 0; k < 32; k++) {
    const a = (k / 32) * Math.PI * 2 + wobble;
    const s = k % 2 ? 1 : -1;
    const h = a + s * 0.9;
    const x0 = cx + Math.cos(h) * 2.4, y0 = cy + Math.sin(h) * 2.4;
    const x1 = cx + Math.cos(a) * 14.3, y1 = cy + Math.sin(a) * 14.3;
    out.push(`<path d="M${f2(x0)},${f2(y0)} L${f2(x1)},${f2(y1)}" stroke="${spoke}" stroke-width="0.32"/>`);
  }
  out.push(circ(cx, cy, 2.9, hub, 0.5));
  out.push(`<circle cx="${cx - 0.9}" cy="${cy - 0.9}" r="0.9" fill="#FFFFFF" opacity="0.7"/>`);
  out.push(`<circle cx="${cx}" cy="${cy}" r="0.9" fill="${INK}"/>`);
  return out.join('');
}

const NEW_WHEEL = { tyre: '#26221F', tyreLit: '#5A524C', rim: '#D9DDE0', spoke: '#8D949A', hub: '#C4C8CC' };
const OLD_WHEEL = { tyre: '#3B302A', tyreLit: '#6B5A4C', rim: '#A2673F', spoke: '#7A4F35', hub: '#94583A' };

// ── the bicycle on its stand, front to the LEFT ───────────────────────────────────
// Drawn in bicycleFrame's own 100-unit square, so every point a hand takes (BIKE_AT:
// grip 41,44.3 · saddle 68,45.5 · seat post 65,54 · top tube 50,58.6) and both axles
// (20,81 and 80,81) are where the scene already reaches for them.
const RED = '#B03A2E', RED_D = '#852A21', RED_L = '#D9665A';
const STEEL = '#C4C8CC', STEEL_D = '#9CA2A8';
const LEATHER = '#2E2723', LEATHER_L = '#5C4E45';

export const BIKE_VIEW = { x: 0, y: 39, w: 100, h: 62 };
export function bike() {
  const ow = 0.75;
  const BB = [56.5, 83.6], HT0 = [34.6, 51.5], HT1 = [31, 61.5], ST1 = [64, 58.5];
  const RA = [80, 81], FA = [20, 81];
  const tubes = [
    tubeBar(HT0.map((v, i) => v + [0.4, 1][i]), ST1, 3.1, RED, RED_L, ow),     // the top tube
    tubeBar(HT1, BB, 3.9, RED, RED_L, ow),                                      // the down tube
    tubeBar(BB, ST1, 3.4, RED, RED_L, ow),                                      // the seat tube
    tubeBar(ST1, RA, 2.1, RED, null, ow),                                       // the seat stays
    tubeBar(BB, RA, 2.3, RED, null, ow),                                        // the chain stays
    tubeBar(HT0, HT1, 4.6, RED, RED_L, ow),                                     // the head tube
  ];
  const out = [];
  out.push(wheel(...RA, NEW_WHEEL));
  out.push(wheel(...FA, NEW_WHEEL));
  // the fork: a raked blade down to the front axle, steel-chromed at its tips
  out.push(line('M31,61 C29.4,68 27,74 21.6,80.6', INK, 2.9 + 2 * ow));
  out.push(line('M31,61 C29.4,68 27,74 21.6,80.6', RED, 2.9));
  out.push(line('M24.6,77.6 C23.6,79 22.6,80 21.6,80.6', STEEL, 2.2));
  // the frame, ink under paint so every joint is one outline
  for (const t of tubes) out.push(t.under);
  for (const t of tubes) out.push(t.over);
  // the lugs: the head tube's, the seat cluster, the bottom bracket shell
  out.push(fill('M33.2,50 L36.4,50.6 L36,54.6 L32.6,54 Z', STEEL, 0.45));
  out.push(fill('M30,59.4 L33.2,60 L32.6,63.4 L29.4,62.6 Z', STEEL, 0.45));
  out.push(circ(64, 58.5, 2.1, STEEL, 0.45));
  // the chain: a loop over the chainring and the sprocket, its links showing
  out.push(line('M56.5,76.8 L80,78.3 M56.5,90.4 L80,83.7', INK, 1.5));
  out.push(line('M56.5,76.8 L80,78.3 M56.5,90.4 L80,83.7', '#6D7076', 0.8));
  out.push(`<path d="M57,76.8 L80,78.3" stroke="${STEEL}" stroke-width="0.55" stroke-dasharray="0.7 0.9"/>`);
  out.push(circ(80, 81, 2.9, STEEL_D, 0.5));
  // the chainring: a toothed ring with five arms, and its crank down to the pedal
  const teeth = [];
  for (let k = 0; k < 36; k++) {
    const a = (k / 36) * Math.PI * 2;
    const r = k % 2 ? 6.6 : 7.4;
    teeth.push(`${f2(BB[0] + Math.cos(a) * r)},${f2(BB[1] + Math.sin(a) * r)}`);
  }
  out.push(fill(`M${teeth.join(' L')} Z`, STEEL, 0.5));
  out.push(`<circle cx="${BB[0]}" cy="${BB[1]}" r="4.6" fill="none" stroke="${STEEL_D}" stroke-width="1.6"/>`);
  for (let k = 0; k < 5; k++) {
    const a = (k / 5) * Math.PI * 2 - 0.4;
    out.push(line(`M${BB[0]},${BB[1]} L${f2(BB[0] + Math.cos(a) * 5.6)},${f2(BB[1] + Math.sin(a) * 5.6)}`, STEEL_D, 1.1));
  }
  out.push(line('M56.5,83.6 L49.6,91.2', INK, 2.9));
  out.push(line('M56.5,83.6 L49.6,91.2', STEEL, 1.7));
  out.push(circ(56.5, 83.6, 1.5, STEEL, 0.45));
  out.push(fill('M45.8,90.6 L53.4,90.6 L53.2,92.8 L46,92.8 Z', '#3A3633', 0.45));
  // the seat post, and the saddle: leather, long nose, broad back, on its rails
  out.push(line('M64,58.6 L66.3,50.8', INK, 2.4 + 2 * ow));
  out.push(line('M64,58.6 L66.3,50.8', STEEL, 2.4));
  out.push(line('M63.9,48.2 L72.6,48.4', STEEL_D, 0.7));
  out.push(fill('M59.6,46.6 C62,45.2 66,44.9 70.6,44.6 C74.4,44.4 76.6,45.2 76.6,46.6 C76.6,48 74.6,48.6 71.4,48.6 C67,48.4 63,48 59.6,47.6 Z', LEATHER, 0.55));
  out.push(tone('M61,46.2 C64.4,45.2 69,45 72.8,44.9 C74.6,44.9 75.6,45.3 75.6,45.7 C71,45.6 65.6,45.8 61,46.2 Z', LEATHER_L));
  // the stem, and the bars swept back to their grips, black rubber on the ends
  out.push(line('M34.4,51 L33.6,47.4', INK, 2.6 + 2 * ow));
  out.push(line('M34.4,51 L33.6,47.4', STEEL, 2.6));
  out.push(line('M32.8,47.6 C35,45 38,44.2 41,44.3', INK, 2.1 + 2 * ow));
  out.push(line('M32.8,47.6 C35,45 38,44.2 41,44.3', STEEL, 2.1));
  out.push(line('M39.4,44.2 L43.6,44.6', INK, 2.9 + 2 * ow));
  out.push(line('M39.4,44.2 L43.6,44.6', '#2A2624', 2.9));
  // the bell, a little chrome dome on the bars
  out.push(fill('M35.6,45.6 C35.6,43.8 38,43.8 38,45.6 Z', STEEL, 0.4));
  // the shaded underside of the down tube and the top tube
  out.push(line('M31.8,63.6 L55.4,85.2', RED_D, 1.1));
  out.push(line('M37,55.2 L62.8,59.8', RED_D, 0.8));
  return out.join('');
}

// ── the old wheel, rusted, slightly out of true ──────────────────────────────────
export const OLD_WHEEL_VIEW = { x: -19.6, y: -19.6, w: 39.2, h: 39.2 };
export const oldWheel = () => wheel(0, 0, { ...OLD_WHEEL, wobble: 0.05 })
  // a broken spoke hanging loose, and the rust bloom on the rim
  + line('M2,-2 C5,1 6,4 5.2,8', '#7A4F35', 0.5)
  + `<path d="M-8,-11.4 A14.3,14.3 0 0 1 4,-13.7" fill="none" stroke="#6E412B" stroke-width="1.3"/>`;

// ── the crate of old parts: back (with what is in it) and front, one 100-unit box ─
const WOOD = '#8E5F37', WOOD_D = '#6B4829', WOOD_L = '#B27E4E', INSIDE = '#4A3424';
const RUST = '#94583A', RUST_D = '#6E412B';
export function crateBack() {
  const ow = 1.6;
  const out = [];
  // the back boards and the dark inside, seen from a little above
  out.push(fill('M1,50 L1,34 L99,34 L99,50 Z', WOOD, ow));
  out.push(tone('M5,50 L5,40 L95,40 L95,50 Z', INSIDE));
  out.push(line('M3,36 L97,36', WOOD_L, 1.6));
  out.push(line('M3,38.6 L97,38.6', WOOD_D, 0.8));
  // an old chain draped over the back board, its links dark with grease
  out.push(line('M30,40 C34,33 40,33 44,38 C46,41 48,44 50,48', INK, 3.4));
  out.push(`<path d="M30,40 C34,33 40,33 44,38 C46,41 48,44 50,48" fill="none" stroke="#6D6560" stroke-width="2" stroke-dasharray="1.6 1"/>`);
  // the old saddle, sprung, tipped against the back board: the same long nose and broad
  // back as the new one, its leather cracked and two coil springs under its back
  out.push(`<g transform="translate(-3 -6.4) rotate(-16 86 36)">`
    + line('M84,38 L84,42.6 M92,38.2 L92,42.8', INK, 2.6)
    + line('M84,38 L84,42.6 M92,38.2 L92,42.8', '#7A7570', 1.6)
    + `<path d="M82.6,39.4 L85.4,39.4 M82.6,41.2 L85.4,41.2 M90.6,39.6 L93.4,39.6 M90.6,41.4 L93.4,41.4" stroke="${INK}" stroke-width="0.5"/>`
    + fill('M74,36.4 C77,34.6 83,34.2 89,33.8 C94,33.6 97.4,34.4 97.4,36.2 C97.4,37.8 94.6,38.6 90.4,38.6 C84,38.4 78.6,38 74,37.6 Z', '#4E3A2C', 1.2)
    + line('M77,36 C82,35 88,34.6 94.6,34.8', '#7A604C', 0.8)
    + line('M86,34.4 L87.6,37.4 L89,36', INK, 0.6)
    + '</g>');
  // the old frame tube, bent at its crack, rust bloom and a sawn end
  out.push(line('M70,50 L77,24 L92,11', INK, 7.4));
  out.push(line('M70,50 L77,24 L92,11', RUST, 5.4));
  out.push(line('M71.4,46 L77.2,24.6', '#B07450', 1.4));
  out.push(fill('M75.6,25.8 L79,22.6 L77.4,27 Z', RUST_D, 0.6));
  out.push(`<ellipse cx="92.6" cy="10.6" rx="3.1" ry="2.6" fill="${RUST_D}" stroke="${INK}" stroke-width="1.1" transform="rotate(-40 92.6 10.6)"/>`);
  out.push(`<ellipse cx="92.6" cy="10.6" rx="1.4" ry="1.1" fill="${INK}" transform="rotate(-40 92.6 10.6)"/>`);
  return out.join('');
}
export function crateFront() {
  const ow = 1.6;
  const out = [];
  // three slats across, with dark gaps; square corner posts they are nailed to
  for (const [y0, y1] of [[51, 65.4], [68, 82.4], [85, 99]]) {
    out.push(fill(`M6,${y0} L94,${y0} L94,${y1} L6,${y1} Z`, WOOD, ow));
    out.push(line(`M8,${y0 + 1.6} L92,${y0 + 1.6}`, WOOD_L, 1.4));
    out.push(line(`M8,${y1 - 1.3} L92,${y1 - 1.3}`, WOOD_D, 1.2));
    // a little grain, and the knot in the middle slat
    out.push(line(`M20,${(y0 + y1) / 2 + 1} C34,${(y0 + y1) / 2 - 1.2} 52,${(y0 + y1) / 2 + 1.6} 70,${(y0 + y1) / 2}`, WOOD_D, 0.6));
  }
  out.push(`<ellipse cx="58" cy="75" rx="2.4" ry="1.4" fill="none" stroke="${WOOD_D}" stroke-width="0.7"/>`);
  out.push(tone('M6,65.4 L94,65.4 L94,68 L6,68 Z', INSIDE));
  out.push(tone('M6,82.4 L94,82.4 L94,85 L6,85 Z', INSIDE));
  for (const x of [1, 89]) {
    out.push(fill(`M${x},48 L${x + 10},48 L${x + 10},100 L${x},100 Z`, WOOD_D, ow));
    out.push(line(`M${x + 2.2},50 L${x + 2.2},98`, '#8A6040', 1.1));
    for (const y of [58, 75, 92]) out.push(`<circle cx="${x + 5}" cy="${y}" r="1.2" fill="${INK}"/>`);
  }
  return out.join('');
}
export const CRATE_VIEW = { x: 0, y: 0, w: 100, h: 100 };

// ── a manila job tag, as a workshop hangs on a bicycle (a1-bikestand-3) ──────────
// A card with its hanging end CUT at both corners, a brass-ringed eyelet in that end, and
// the scene's words on the face. Drawn blank: the words are the scene's, so they are Text.
export function tag(W = 68, H = 26) {
  const C = '#E6CF9C', CD = '#C9AE76', CL = '#F4E6C2';
  return [
    fill(`M9,0.6 L${W - 0.6},0.6 L${W - 0.6},${H - 0.6} L9,${H - 0.6} L0.6,${H - 7.6} L0.6,7.6 Z`, C, 0.9),
    tone(`M9,${H - 3} L${W - 0.6},${H - 3} L${W - 0.6},${H - 0.6} L9,${H - 0.6} L6.6,${H - 3} Z`, CD),
    line(`M9.4,2.2 L${W - 2},2.2`, CL, 1),
    `<circle cx="6.4" cy="${H / 2}" r="2.6" fill="#C9A13B" stroke="${INK}" stroke-width="0.8"/>`,
    `<circle cx="6.4" cy="${H / 2}" r="1.25" fill="#3C2E22"/>`,
  ].join('');
}

const at = (cx, cy, s, v) => ({ x: cx + (v.x - 50) * (s / 100), y: cy + (v.y - 50) * (s / 100), w: v.w * (s / 100), h: v.h * (s / 100) });
const WD = (17 * 0.7) / 0.44;
const wk = WD / 38.64;   // the old library wheel: tyre centre-line 17 of a 38.64 box

export const ART = [
  // the bicycle: bicycleFrame(248, 458.4, 70, 70) and its two wheels, one picture
  { name: 'phil1-bike', svg: bike, view: BIKE_VIEW, box: at(248, 458.4, 70, BIKE_VIEW) },
  // the old wheel, drawn about its hub and carried by a rider (bicycleWheel(0, 0, WD, WD))
  { name: 'phil1-wheel-old', svg: oldWheel, view: OLD_WHEEL_VIEW, box: { x: -19.6 * wk, y: -19.6 * wk, w: 39.2 * wk, h: 39.2 * wk } },
  // the crate: partsCrateBack/Front(180, 476, 48, 48)
  { name: 'phil1-crate-back', svg: crateBack, view: CRATE_VIEW, box: { x: 156, y: 452, w: 48, h: 48 } },
  { name: 'phil1-crate-front', svg: crateFront, view: CRATE_VIEW, box: { x: 156, y: 452, w: 48, h: 48 } },
  // the job tags, drawn about their top-left corner at the size the scene hangs them
  { name: 'phil1-tag', svg: () => tag(68, 26), view: { x: 0, y: 0, w: 68, h: 26 }, box: { x: 0, y: 0, w: 68, h: 26 } },
  { name: 'phil1-tag-short', svg: () => tag(50, 26), view: { x: 0, y: 0, w: 50, h: 26 }, box: { x: 0, y: 0, w: 50, h: 26 } },
];
