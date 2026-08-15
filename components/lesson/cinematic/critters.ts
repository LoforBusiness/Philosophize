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
  //
  // FATTER, AND WITH A NECK. The previous numbers drew a dachshund-lizard: the
  // barrel was a flat slab, the legs were wire against it, and `rise` 0.20 put
  // the skull's underside exactly on the shoulder line so the head FUSED into the
  // body and the muzzle read as a snout growing straight out of the chest. The
  // head has to clear the barrel's top edge before it reads as a head at all.
  dog: {
    len: 0.90, body: 0.42, drop: 0.05, neck: 0.27, rise: 0.40,
    snout: 0.20, skull: 0.21, ear: 0.20, earBack: 1, knee: 0.07,
    tail: 0.32, tailUp: 0.26, limb: 0.17, horn: 0,
  },
  // Heavier barrel, level back, head LOW (the grazing cue), tail hanging, horns.
  //
  // The neck is longer than a cow's looks, because the head has to clear the
  // chest cap: at the old 0.16 a skull this size sat half inside the barrel and
  // the two fused into one lump with a muzzle sticking out of it.
  cow: {
    len: 1.08, body: 0.56, drop: -0.02, neck: 0.36, rise: 0.14,
    snout: 0.22, skull: 0.23, ear: 0.16, earBack: 0, knee: 0.05,
    tail: 0.40, tailUp: -0.26, limb: 0.19, horn: 0.17,
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
  // CHEST AND HAUNCH ARE WIDER THAN THE BAR, and that is the whole of "fed".
  //
  // A capsule of constant depth is a sausage: the same thickness at the brisket,
  // the waist and the rump, which is the one silhouette no animal has. Two discs
  // a little larger than the bar's half-width swell the ends, and a third, low
  // and just behind the middle, gives the underline a belly instead of a straight
  // rule. The union of the four is one mass — no outlines to line up — so this
  // costs three dots and buys the whole shape.
  // A CHAIN, NOT THREE DISCS.
  //
  // Three widely-spaced circles of different sizes do not make one mass — between
  // them the outline drops back to the bar's own half-width and rises again, so
  // the belly reads as two round bulges with a notch bitten out between them. You
  // can SEE the parts, which is the one thing a filled silhouette must not show.
  //
  // The fix is spacing, not size. Discs whose radius varies smoothly AND whose
  // centres are close enough that each overlaps its neighbour well past its own
  // centre produce a single smooth envelope — the standard capsule-chain result.
  // Nine of them across the barrel is dense enough that the outline never returns
  // to the bar between two discs, which is exactly the condition being violated.
  //
  // The profile still has a shape: fullest at the chest and the haunch, a little
  // tucked at the waist, and hanging lower toward the rear. It is the same animal
  // the three discs were aiming at, drawn as one continuous edge.
  const chest = B.body * 0.62, haunch = B.body * 0.66;
  const BELLY = 9;
  for (let i = 0; i < BELLY; i++) {
    const u = i / (BELLY - 1);                       // 0 chest … 1 haunch
    // Radius: chest → waist → haunch, as a smooth curve rather than three steps.
    const waist = Math.sin(u * Math.PI) * 0.085;      // the tuck, subtracted
    const r = (chest * (1 - u) + haunch * u) - B.body * waist;
    // Centre line: dropped, then sagging toward the middle-rear where a belly
    // hangs. THE CONSTANT 0.09 IS NOT TASTE — it is what keeps every disc's TOP
    // at or below the bar's top edge. A disc of radius 0.62·body centred only
    // 0.05·body under the spine reaches 0.57·body above it, against the bar's own
    // 0.50, so each one crested the back by 0.07 and the topline came out
    // scalloped. Dropping the chain hides it under the bar and the swell shows
    // only where it should: below.
    const sag = 0.09 + Math.sin(u * Math.PI) * 0.07 + u * 0.02;
    dot.push({
      x: -B.body * 0.10 - u * (B.len - B.body * 0.22),
      y: (sh * (1 - u) + rp * u) + B.body * (0.05 + sag),
      r,
    });
  }

  // ── neck and head
  const hd = life2(t, 0.47, 0.29, 1.3) * 0.035;
  const nx = B.neck, ny = sh - B.rise + hd;
  S(0, sh, nx, ny, B.body * 0.56);   // a NECK, not a second barrel
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
  S(nx + B.skull * 0.30, mz, nose, mz + B.skull * 0.22 + hd * 0.4, B.limb * 1.05);
  dot.push({ x: nose, y: mz + B.skull * 0.22 + hd * 0.4, r: B.limb * 0.55 });
  // The ear is the one thing that must NOT scale with the limb. At limb × 1.3 a
  // leg thick enough to carry the animal gave it an ear wider than it was long,
  // which is a paddle, so the ear got its own length and a slimmer stroke.
  const flick = Math.max(0, Math.sin(t * 0.62 + 1.1)) ** 8 * 0.09;
  const earX = nx - B.skull * 0.2 - B.ear * B.earBack;
  const earY = ny - B.skull * 0.5 - B.ear * (1 - B.earBack * 0.45) + flick;
  S(nx - B.skull * 0.2, ny - B.skull * 0.5, earX, earY, B.limb * 0.9);
  // ROUND THE TIP. A butt-capped bar ends in two square corners, and on an ear —
  // which sticks out into paper with nothing behind it — those corners are the
  // most visible thing on the animal. It read as a folded card, not an ear.
  dot.push({ x: earX, y: earY, r: B.limb * 0.45 });
  if (B.horn > 0) {
    const hx2 = nx + B.skull * 0.1 + B.horn * 0.5, hy2 = ny - B.skull * 0.7 - B.horn;
    S(nx + B.skull * 0.1, ny - B.skull * 0.7, hx2, hy2, B.limb);
    dot.push({ x: hx2, y: hy2, r: B.limb * 0.5 });
  }

  // ── four legs, ONE knee each, diagonal pairs half a cycle apart
  const leg = (hx: number, hy: number, ph: number, w: number) => {
    const sw = Math.sin(phase * 2 * Math.PI + ph) * gait * 0.20;
    const up = Math.max(0, Math.sin(phase * 2 * Math.PI + ph + Math.PI / 2)) * gait * 0.11;
    const kx = hx - B.knee + sw * 0.45, ky = hy * 0.48;
    const fx = hx + sw, fy = -up;
    // THIGH THICKER THAN SHIN. A leg of one width is a stick; the taper is what
    // makes it a limb with muscle at the top, and it is also what stops a fatter
    // barrel from looking like it is balanced on wire.
    S(hx, hy, kx, ky, w * 1.18);
    // THE SHIN STOPS SHORT OF THE GROUND, and the paw finishes the leg.
    //
    // It used to run all the way to fy, where its butt cap left two square
    // corners at ±0.41w — and the paw disc, tangent to the ground, has narrowed
    // to nothing exactly there, so it could not cover them. Hence square feet.
    // Ending the shin 0.30w up puts its corners where the disc is still 0.42w
    // wide, so they are inside it, and the foot is a rounded paw sitting ON the
    // line rather than a post with tabs.
    S(kx, ky, fx, fy - w * 0.30, w * 0.82);
    dot.push({ x: kx, y: ky, r: w * 0.59 });
    // A PAW, TANGENT to the ground — centred a radius above it, so the animal
    // stands on the line instead of sinking through it. A person's ankle can hang
    // below the ground line and get away with it because their foot is beneath
    // it; a dog's is not.
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
  const t2x = -B.len - B.tail, t2y = rp - B.tailUp + wag;
  S(-B.len, rp, t1x, t1y, B.limb * 1.1);
  S(t1x, t1y, t2x, t2y, B.limb * 0.85);
  // Capped at the SMALLER of the two half-widths meeting here. The wider bone's
  // own corners already reach past it, so this fills the notch on the outside of
  // the bend without beading the thin end.
  dot.push({ x: t1x, y: t1y, r: B.limb * 0.85 * 0.5 });
  // AND THE TIP, which never had one. This was the 14th dot the view silently
  // dropped (CritterView rendered 13), so even when it existed it was invisible —
  // the tail ended in two square corners and read as a plank nailed to the rump.
  dot.push({ x: t2x, y: t2y, r: B.limb * 0.85 * 0.5 });

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
