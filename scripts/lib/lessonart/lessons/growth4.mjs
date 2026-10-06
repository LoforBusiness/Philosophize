// growth4 — personal-growth-foundations-4, "How to Learn From a Mistake": A POTTERY STUDIO.
// Drawn pictures (LESSON_RULES AM13), each in SCENE units with view = box, so a picture
// drops onto the stage (or onto a moving rider) exactly where the shape-built object was.
// Zero imports.
//
// REFERENCES looked at (scratchpad/ref/):
//   c2-throw-1  "Hand positions used during wheel-throwing pottery" (CC BY 3.0): a wet
//               thrown pot is a ROUND BELLY over a narrower foot, THROWING RINGS round the
//               wall, a shoulder that turns in to a short neck and a lip that flares out.
//   c2-ewheel-1 "Electric potter's wheel" (CC BY-SA 4.0): a white two-piece SPLASH PAN, a
//               wide shallow tub with a rolled rim and a seam tab, round a dark WHEEL HEAD
//               with a lighter bat on it, over a cream body on legs.
//   c2-kiln-1   "Dualing Kilns" (CC BY-SA 2.0): a top-loading electric kiln is a FACETED
//               steel drum (eight sides, so three faces show), held in steel BANDS, under
//               a hinged lid with a handle, a red CONTROL BOX bolted to its side, on a
//               low stand; small peephole plugs down its front face.

const INK = '#2B2420';
const fill = (d, c, w) => `<path d="${d}" fill="${c}" stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"/>`;
const tone = (d, c, o = 1) => `<path d="${d}" fill="${c}" opacity="${o}"/>`;
const line = (d, c, w) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;

// wet stoneware, as NATURAL.wetClay, with a wet highlight
const CLAY = '#93857A', CLAYD = '#706458', CLAYL = '#B3A698', SLIP = '#7E7166';

// ── the pot's lower wall: a belly over a foot (pot space: foot centre at 0,0) ─
// The shoulder meets the neck piece at y -11, x ±6.2 (the hinge is its right end).
function potBelly() {
  const o = '0.42';
  return [
    fill('M-4.6,0 C-6.4,-1.4 -7.1,-4 -7,-6.2 C-6.9,-8.4 -6.6,-10 -6.2,-11.2 L6.2,-11.2 C6.6,-10 6.9,-8.4 7,-6.2 '
      + 'C7.1,-4 6.4,-1.4 4.6,0 Z', CLAY, o),
    // the side away from the lamp
    tone('M3.4,-11.2 L6.2,-11.2 C6.6,-10 6.9,-8.4 7,-6.2 C7.1,-4 6.4,-1.4 4.6,0 L2.6,0 C4,-1.6 4.6,-4 4.6,-6.2 '
      + 'C4.6,-8.4 4.1,-10 3.4,-11.2 Z', CLAYD, 0.75),
    // throwing rings, following the belly's curve
    line('M-6.7,-3.4 C-3,-2.6 3,-2.6 6.7,-3.4', SLIP, '0.32'),
    line('M-7,-6.4 C-3,-5.6 3,-5.6 7,-6.4', SLIP, '0.32'),
    line('M-6.6,-9.2 C-3,-8.5 3,-8.5 6.6,-9.2', SLIP, '0.32'),
    // wet: the lamp in a long streak down the lit side
    line('M-4.6,-9.8 C-5.3,-7.4 -5.3,-4.6 -4.2,-2.2', CLAYL, '0.8'),
  ].join('');
}

// ── the pot's neck and lip, in the HINGE frame (0,0 = the right end of the shoulder) ─
// It spans x -12.4..0 at its foot (the shoulder's width) and rises 10 units; folded
// 160° about the hinge it hangs down outside the pot, a collapsed wet wall.
function potNeck() {
  const o = '0.42';
  return [
    // the shoulder turning in to the neck, the neck rising, the lip flaring out
    fill('M-12.4,0.6 C-12,-2 -10.4,-3.4 -9.6,-5 C-9.2,-6.4 -9.8,-7.6 -10.8,-8.6 L-1.6,-8.6 C-2.6,-7.6 -3.2,-6.4 -2.8,-5 '
      + 'C-2,-3.4 -0.4,-2 0,0.6 Z', CLAY, o),
    tone('M-3.8,0.6 L0,0.6 C-0.4,-2 -2,-3.4 -2.8,-5 C-3.2,-6.4 -2.6,-7.6 -1.6,-8.6 L-3.4,-8.6 C-4.4,-7.4 -4.8,-6.2 -4.6,-5 '
      + 'C-4.2,-3 -3.6,-1.4 -3.8,0.6 Z', CLAYD, 0.75),
    // the lip: a rolled rim seen a little from above, with the mouth dark inside it
    fill('M-11.6,-8.6 C-11.6,-10 -1,-10 -0.8,-8.6 C-1,-7.4 -11.6,-7.4 -11.6,-8.6 Z', CLAY, o),
    tone('M-9.8,-8.7 C-9.6,-9.5 -2.8,-9.5 -2.6,-8.7 C-2.8,-8.2 -9.6,-8.2 -9.8,-8.7 Z', '#4E443B'),
    line('M-12,-1.6 C-8,-0.8 -4.4,-0.8 -0.4,-1.6', SLIP, '0.32'),
    line('M-10.2,-5.2 C-8,-4.7 -4.6,-4.7 -2.6,-5.2', SLIP, '0.3'),
    line('M-10.6,-1.2 C-9.8,-3 -8.6,-4.2 -8.6,-6', CLAYL, '0.7'),
  ].join('');
}

// ── clay centred on the wheel: a low dome, wider than tall (foot centre at 0,0) ─
function clayDome() {
  const o = '0.42';
  return [
    fill('M-8.4,0 C-8.8,-3 -6.6,-6.6 -3,-8.2 C-1.2,-8.9 1.2,-8.9 3,-8.2 C6.6,-6.6 8.8,-3 8.4,0 Z', CLAY, o),
    tone('M3,-8.2 C6.6,-6.6 8.8,-3 8.4,0 L4.2,0 C5.6,-2.6 5.4,-6 3,-8.2 Z', CLAYD, 0.75),
    line('M-7.6,-3 C-3,-2.2 3,-2.2 7.6,-3', SLIP, '0.32'),
    line('M-5.6,-5.8 C-2,-5.2 2,-5.2 5.6,-5.8', SLIP, '0.3'),
    line('M-4.4,-6.4 C-5.8,-5 -6.4,-3.4 -6.2,-1.6', CLAYL, '0.8'),
  ].join('');
}

// ── the electric wheel, its splash pan and its head (box 176..216 × 466..500) ─
function wheel() {
  const o = '0.6';
  const CREAM = '#E9E7DF', CREAMD = '#C6C3B8', CREAML = '#F7F6F1', STEEL = '#565B61', STEELD = '#393D42';
  const HEAD = '#4A4E52', BAT = '#9AA0A4';
  return [
    // splayed steel legs, the back pair between the front
    fill('M184.6,486 L180.4,499.2 L183,499.2 L187.4,486 Z', STEEL, o),
    fill('M207.4,486 L211.8,499.2 L209.2,499.2 L204.8,486 Z', STEELD, o),
    fill('M191,486 L189.6,499 L191.8,499 L193.2,486 Z', STEELD, o),
    fill('M199.2,486 L200.6,499 L202.4,499 L201,486 Z', STEELD, o),
    // the motor body under the pan
    fill('M184.8,478 L207.2,478 L207.2,487.6 C207.2,488.4 206.6,489 205.8,489 L186.2,489 C185.4,489 184.8,488.4 184.8,487.6 Z', CREAM, o),
    tone('M201.6,478 L207.2,478 L207.2,487.6 C207.2,488.4 206.6,489 205.8,489 L201.6,489 Z', CREAMD),
    // the splash pan: a shallow tub, tapering a little to its foot
    fill('M177.2,472.8 L214.8,472.8 L212.6,480.6 C212.2,481.6 211.2,482.2 210,482.2 L182,482.2 C180.8,482.2 179.8,481.6 179.4,480.6 Z', CREAM, o),
    tone('M206,472.8 L214.8,472.8 L212.6,480.6 C212.2,481.6 211.2,482.2 210,482.2 L205,482.2 Z', CREAMD),
    // the seam tab where its two halves clip together
    line('M189.2,474.6 L189.6,481.4', CREAMD, '0.5'),
    // the wheel head: a dark disc, a pale bat on it, standing just proud of the rim
    fill('M183.4,469.4 C183.4,468.6 208.6,468.6 208.6,469.4 L208.6,472.2 C208.6,473 183.4,473 183.4,472.2 Z', HEAD, '0.5'),
    tone('M184.6,469.3 C185,468.9 207,468.9 207.4,469.3 C207,469.8 185,469.8 184.6,469.3 Z', BAT),
    // the rolled rim, in front of the head's foot
    fill('M176.2,472.8 C176.2,471.6 177,471.2 178,471.2 L214,471.2 C215,471.2 215.8,471.6 215.8,472.8 C215.8,474 215,474.4 214,474.4 '
      + 'L178,474.4 C177,474.4 176.2,474 176.2,472.8 Z', CREAM, o),
    line('M178.4,472.2 L196,472.2', CREAML, '0.7'),
    line('M181.4,476.4 L183.6,480.4', CREAML, '0.8'),
  ].join('');
}

// ── the top-loading kiln (box 330..384 × 458..500) ───────────────────────────
function kiln() {
  const o = '0.6';
  const STEEL = '#C4C8CC', STEELM = '#ADB3B8', STEELD = '#8E959B', BAND = '#7C838A', RED = '#B8382A', REDD = '#8E2A20';
  return [
    // the stand
    fill('M335,494 L369,494 L368,499.4 L336,499.4 Z', '#565B61', o),
    // three faces of the drum: the near-left facet lit, the front, the far-right shaded
    fill('M333,465 L341,463.6 L341,494.6 L334,493.4 Z', STEEL, o),
    fill('M341,463.6 L363,463.6 L363,494.6 L341,494.6 Z', STEELM, o),
    fill('M363,463.6 L371,465 L370,493.4 L363,494.6 Z', STEELD, o),
    // two steel bands round it
    line('M333.3,474 L341,473.2 L363,473.2 L370.8,474', BAND, '1.1'),
    line('M333.8,485.6 L341,485.2 L363,485.2 L370.4,485.6', BAND, '1.1'),
    // peephole plugs down the front, and the lid's latch
    `<circle cx="352" cy="479.4" r="1.3" fill="#E7DCC7" stroke="${INK}" stroke-width="0.4"/>`,
    `<circle cx="352" cy="489.6" r="1.3" fill="#E7DCC7" stroke="${INK}" stroke-width="0.4"/>`,
    fill('M350,465 L354,465 L354,468.4 L350,468.4 Z', BAND, '0.4'),
    // the lid: a slab a little wider than the drum, its handle on top
    fill('M331.8,463.8 L341,461 L363,461 L372.2,463.8 L372.2,465.6 L331.8,465.6 Z', '#D7DBDE', o),
    line('M341,461.6 L363,461.6', '#F2F4F5', '0.6'),
    fill('M348,461 C348,458.6 356,458.6 356,461', 'none', '0.7'),
    // the red control box on the drum's side, two dials and a switch
    fill('M371,468.6 L382.4,468.6 L382.4,489 L371,489 Z', RED, o),
    tone('M379.4,468.6 L382.4,468.6 L382.4,489 L379.4,489 Z', REDD),
    `<circle cx="376" cy="473.6" r="1.6" fill="#2A2B2E" stroke="${INK}" stroke-width="0.35"/>`,
    `<circle cx="376" cy="479" r="1.6" fill="#2A2B2E" stroke="${INK}" stroke-width="0.35"/>`,
    fill('M374.6,483.4 L377.4,483.4 L377.4,486 L374.6,486 Z', '#EFE6CB', '0.35'),
    // the lamp on the lit facet
    line('M335.6,467 L336.4,491.4', '#E6E9EB', '0.9'),
  ].join('');
}

const box = (x, y, w, h) => ({ x, y, w, h });
const same = (b) => ({ view: b, box: b });

export const ART = [
  { name: 'growth4-pot-belly', svg: potBelly, ...same(box(-7.6, -11.8, 15.2, 12.2)) },
  { name: 'growth4-pot-neck', svg: potNeck, ...same(box(-12.8, -10.4, 13.2, 11.4)) },
  { name: 'growth4-clay-dome', svg: clayDome, ...same(box(-9, -9.4, 18, 9.8)) },
  { name: 'growth4-wheel', svg: wheel, ...same(box(175.6, 466.4, 40.8, 33.4)) },
  { name: 'growth4-kiln', svg: kiln, ...same(box(330.6, 457.6, 53, 42.2)) },
];
