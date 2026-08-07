// ─────────────────────────────────────────────────────────────────────────────
// ANIMALS — simple, and alive.
//
// ZERO IMPORTS, like rig.ts, so a contact sheet renders in plain Node and "is
// that a dog?" gets answered before it reaches a device.
//
// ONLY WHAT THE LESSONS ASK FOR. Two animals exist across 102 lessons: the dog in
// ethics-1 (shares our instincts, never judges itself) and the cow in
// political-31 (a herd on a common). Nothing else is invented.
//
// ── SIMPLE ON PURPOSE ───────────────────────────────────────────────────────
//
// The first two attempts drew real anatomy — brisket, tuck, stifle, hock — and
// both read as a DEER, because a thicket of thin bones has no silhouette. What
// reads as an animal at 60px is a child's line drawing: ONE THICK BAR for the
// body, a neck, a head with a snout, an ear, four legs with one knee each, a
// tail. Ten segments, and the mass of that body bar does most of the work.
//
// ── AND FILLED OUT, LIKE THE FIGURES ────────────────────────────────────────
//
// The body bar was the only part that ever got that memo. Measured against the
// person standing next to it in ethics-1 — a 103-unit figure with 11-unit limbs
// and a 40-unit head — the first dog came out at:
//
//                       dog        the figure beside it
//   limb ÷ height       5.1%       10.7%
//   limb ÷ leg length   8.2%       29.7%
//   head ÷ height      15.1%       38.8%
//
// so a slab of chest at human-torso mass, on legs a third the weight, under a
// head smaller than the person's thigh is wide. That is the whole of "thin and
// bony": not the barrel, everything hung off it.
//
// The strokes below close most of that gap and deliberately not all of it. A dog
// really is more slender than a person — at full parity its legs would be nearly
// as deep as its own chest and it would read as a hippo — so the target is the
// figure's PROPORTION, softened one notch: limbs about 9% of height rather than
// 10.7%, head about 24% rather than 39%.
//
// The other half of the fill is caps. A bone here is a butt-capped rectangle, so
// every bone END is a square cut; Stickman.tsx solves that with a disc of exactly
// the bone's half-width at each joint, and the union is a smooth capsule. The
// animal had those at its knees only, which left the chest and rump as sawn-off
// slab ends and the feet as cut wires. Same rule, same radii, now at both ends of
// the barrel, at all four feet and at the bend of the tail. A cap WIDER than the
// bone's half-width is a bead threaded on the limb, not a cap — see the long note
// in Stickman.tsx before changing any radius here.
//
// The MOTION is borrowed wholesale from the figures (rig.ts): the same two-sine
// `life2` so a long stare never finds the loop, the same chest breath, and a gait
// cycled on DISTANCE rather than the wall clock — a walk driven by `t` slides its
// feet the moment the animal's speed changes.
//
// Wither units: shoulder height = 1. x runs FORWARD, negative y is UP (rig.ts).
// ─────────────────────────────────────────────────────────────────────────────

export type CritterKind = 'dog' | 'cow';

export interface Seg { x1: number; y1: number; x2: number; y2: number; w: number }
export interface Dot { x: number; y: number; r: number }
export interface Critter { seg: Seg[]; dot: Dot[] }

function life2(t: number, f1: number, f2: number, ph: number): number {
  'worklet';
  return Math.sin(t * f1) * 0.62 + Math.sin(t * f2 + ph) * 0.38;
}

interface Build {
  len: number; body: number; drop: number;
  neck: number; rise: number; snout: number; skull: number;
  ear: number; earBack: number; knee: number;
  tail: number; tailUp: number; limb: number; horn: number;
}

const SHAPE: Record<CritterKind, Build> = {
  // Longer than tall, head up, tail up, ear laid back.
  dog: {
    len: 0.92, body: 0.32, drop: 0.05, neck: 0.25, rise: 0.20,
    snout: 0.21, skull: 0.20, ear: 0.18, earBack: 1, knee: 0.07,
    tail: 0.32, tailUp: 0.26, limb: 0.13, horn: 0,
  },
  // Heavier barrel, level back, head LOW (the grazing cue), tail hanging, horns.
  //
  // The neck is longer than a cow's looks, because the head has to clear the
  // chest cap: at the old 0.16 a skull this size sat half inside the barrel and
  // the two fused into one lump with a muzzle sticking out of it.
  cow: {
    len: 1.10, body: 0.46, drop: -0.02, neck: 0.33, rise: 0.02,
    snout: 0.23, skull: 0.22, ear: 0.16, earBack: 0, knee: 0.05,
    tail: 0.40, tailUp: -0.26, limb: 0.145, horn: 0.17,
  },
};

/**
 * One animal at this instant.
 *
 * @param t     idle clock — breath, head drift, ear flick, tail
 * @param gait  0 standing … 1 walking (blends, so it can amble off without a cut)
 * @param phase distance travelled, in wither units — what the legs cycle on
 */
export function critter(kind: CritterKind, t: number, gait = 0, phase = 0): Critter {
  'worklet';
  const B = SHAPE[kind];
  const seg: Seg[] = [];
  const dot: Dot[] = [];
  const S = (x1: number, y1: number, x2: number, y2: number, w: number) => seg.push({ x1, y1, x2, y2, w });

  // Breath lifts the shoulder end only, so it reads as a chest rather than as the
  // whole animal scaling.
  const br = (0.5 - 0.5 * Math.cos(t * 1.9)) * 0.016;
  const sh = -1 - br;                 // shoulder
  const rp = -1 + B.drop;             // rump

  // ── the body: ONE thick bar. This is the silhouette.
  //
  // Capped at BOTH ends, at exactly the bar's half-width, so the chest and the
  // haunch are round masses rather than the two square cuts a butt-capped
  // rectangle leaves. This is the single biggest part of the fill: a slab with
  // sawn ends reads as furniture, and the same slab rounded reads as a ribcage.
  S(0, sh, -B.len, rp, B.body);
  dot.push({ x: 0, y: sh, r: B.body / 2 });
  dot.push({ x: -B.len, y: rp, r: B.body / 2 });

  // ── neck and head
  const hd = life2(t, 0.47, 0.29, 1.3) * 0.035;
  const nx = B.neck, ny = sh - B.rise + hd;
  S(0, sh, nx, ny, B.body * 0.72);
  dot.push({ x: nx, y: ny, r: B.skull });
  // THE MUZZLE IS MEASURED FROM THE FACE, NOT FROM THE HEAD'S CENTRE.
  //
  // It used to run from `nx`, so `snout` was a distance from the middle of the
  // skull — which meant enlarging the skull ate the muzzle. At skull 0.20 the bar
  // ran x 0.25 → 0.46 inside a head already reaching 0.45, and one hundredth of a
  // wither unit of nose stuck out: the dog lost its face the moment it stopped
  // being pin-headed. Now `snout` is the part that PROJECTS, and the two can be
  // changed independently.
  const mz = ny + B.skull * 0.32;
  const nose = nx + B.skull + B.snout;
  S(nx + B.skull * 0.30, mz, nose, mz + B.skull * 0.22 + hd * 0.4, B.limb * 1.5);
  dot.push({ x: nose, y: mz + B.skull * 0.22 + hd * 0.4, r: B.limb * 0.75 });
  // The ear is the one thing that must NOT scale with the limb. At limb × 1.3 a
  // leg thick enough to carry the animal gave it an ear wider than it was long,
  // which is a paddle, so the ear got its own length and a slimmer stroke.
  const flick = Math.max(0, Math.sin(t * 0.62 + 1.1)) ** 8 * 0.09;
  S(nx - B.skull * 0.2, ny - B.skull * 0.5,
    nx - B.skull * 0.2 - B.ear * B.earBack,
    ny - B.skull * 0.5 - B.ear * (1 - B.earBack * 0.45) + flick, B.limb * 0.9);
  if (B.horn > 0) {
    S(nx + B.skull * 0.1, ny - B.skull * 0.7,
      nx + B.skull * 0.1 + B.horn * 0.5, ny - B.skull * 0.7 - B.horn, B.limb);
  }

  // ── four legs, ONE knee each, diagonal pairs half a cycle apart
  const leg = (hx: number, hy: number, ph: number, w: number) => {
    const sw = Math.sin(phase * 2 * Math.PI + ph) * gait * 0.20;
    const up = Math.max(0, Math.sin(phase * 2 * Math.PI + ph + Math.PI / 2)) * gait * 0.11;
    const kx = hx - B.knee + sw * 0.45, ky = hy * 0.48;
    const fx = hx + sw, fy = -up;
    S(hx, hy, kx, ky, w);
    S(kx, ky, fx, fy, w * 0.9);
    dot.push({ x: kx, y: ky, r: w * 0.5 });
    // A PAW, sitting ON the line rather than centred on it. The shin's butt cap
    // already ends flush with the ground, so a disc centred at the foot would
    // bury half a paw under the floor — the ankle circles on the figures hang
    // below the ground line and get away with it because a person's ankle is
    // above their foot, which a dog's is not.
    const pr = w * 0.45;
    dot.push({ x: fx, y: fy - pr, r: pr });
  };
  const fy0 = sh + B.body * 0.30, hy0 = rp + B.body * 0.30;
  leg(-0.06, fy0, 0, B.limb);
  leg(-0.16, fy0, Math.PI, B.limb * 0.82);
  leg(-B.len + 0.06, hy0, Math.PI, B.limb);
  leg(-B.len + 0.16, hy0, 0, B.limb * 0.82);

  // ── tail: two segments. A dog's wags; a cow's swishes slowly.
  const wag = kind === 'dog'
    ? life2(t, 2.4, 1.5, 0.4) * 0.15 + Math.sin(t * 5.6) * 0.05 * gait
    : life2(t, 0.9, 0.55, 0.2) * 0.09;
  const t1x = -B.len - B.tail * 0.5, t1y = rp - B.tailUp * 0.6 + wag * 0.45;
  S(-B.len, rp, t1x, t1y, B.limb * 1.1);
  S(t1x, t1y, -B.len - B.tail, rp - B.tailUp + wag, B.limb * 0.85);
  // Capped at the SMALLER of the two half-widths meeting here. The wider bone's
  // own corners already reach past it, so this fills the notch on the outside of
  // the bend without beading the thin end.
  dot.push({ x: t1x, y: t1y, r: B.limb * 0.85 * 0.5 });

  return { seg, dot };
}

/** Extent, for checking it sits on the ground and inside the band. */
export function critterBounds(c: Critter) {
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  for (const s of c.seg) {
    x0 = Math.min(x0, s.x1 - s.w, s.x2 - s.w); x1 = Math.max(x1, s.x1 + s.w, s.x2 + s.w);
    y0 = Math.min(y0, s.y1 - s.w, s.y2 - s.w); y1 = Math.max(y1, s.y1 + s.w, s.y2 + s.w);
  }
  for (const d of c.dot) {
    x0 = Math.min(x0, d.x - d.r); x1 = Math.max(x1, d.x + d.r);
    y0 = Math.min(y0, d.y - d.r); y1 = Math.max(y1, d.y + d.r);
  }
  return { x0, x1, y0, y1, w: x1 - x0, h: y1 - y0 };
}
