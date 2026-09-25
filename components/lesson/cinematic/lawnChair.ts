// ─────────────────────────────────────────────────────────────────────────────
// THE LAWN CHAIR AND THE MUG — geometry only, zero imports.
//
// The owner, 2026-09-25: *"grab a chair out of noware, like a lawn chair, set it up,
// and then sit down … maybe pull out some coffee or tea … you should never guess
// to what you are seeing, if something is a little lawn chair and hes sitting down,
// I should never need to guess."* Approved from `npm run sheet:chair` the same day.
//
// Drawn against a reference (scratchpad/ref/wlawncha-1.png, the classic webbed
// aluminium folding lawn chair): a bare tube frame, flat white armrests, and a seat
// and back WOVEN in coloured straps. Seen exactly side-on the webbing is edge-on and
// the chair is a few sticks, so it is turned a little toward the reader — the object
// library's table does the same (objects.ts) — and the back and seat show their
// straps as a striped face. Folded, it is held face-on: a flat striped package.
//
// EVERY PART IS A ROTATED RECTANGLE, because the app draws it with Views (§17 rule
// 7: never an animated <Svg>) and a View is a rectangle that can rotate. The sheet
// draws the same rectangles, so what the owner approved is what ships.
//
// Zero imports, like rig.ts and objects.ts. A part carries a ROLE, not a colour; the
// drawing layer maps roles onto tone.ts.
//
// FRAME: rig units in the chair's own frame — x forward (the way the sitter faces),
// y DOWN positive, the ground at y 0, the sitter's pelvis above x 0.
// ─────────────────────────────────────────────────────────────────────────────

export type ChairRole = 'frame' | 'strap' | 'weave' | 'arm' | 'line' | 'mug' | 'rim' | 'steam';

/**
 * A rectangle: centre, length along its angle, width across it, angle in radians —
 * and `sk`, the tangent of a skew along its length (0 for a plain bar). A View does
 * this as `[translate, rotate, skewX]`, so a slanted webbing face is still one View.
 */
export interface ChairRect {
  role: ChairRole;
  cx: number;
  cy: number;
  len: number;
  w: number;
  ang: number;
  sk: number;
}

type P = [number, number];

function lerp2(a: P, b: P, u: number): P {
  'worklet';
  return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u];
}

/** A bar of width `w` from a to b. */
function bar(role: ChairRole, a: P, b: P, w: number): ChairRect {
  'worklet';
  const dx = b[0] - a[0]; const dy = b[1] - a[1];
  return { role, cx: (a[0] + b[0]) / 2, cy: (a[1] + b[1]) / 2, len: Math.hypot(dx, dy), w, ang: Math.atan2(dy, dx), sk: 0 };
}

/**
 * A strip laid along the rail a→b and pushed back into depth by d: the webbing's
 * visible face, a PARALLELOGRAM. In the rail's own frame d is (along, across); the
 * strip is as wide as the across part and skewed by along/across, which is exactly
 * the slanted face the approved sheet drew. (A plain rectangle was tried first and
 * stood the seat's straps up on end.)
 */
function face(role: ChairRole, a: P, b: P, d: P, t0: number, t1: number): ChairRect {
  'worklet';
  const r = bar(role, lerp2(a, b, t0), lerp2(a, b, t1), 1);
  const ex = Math.cos(r.ang); const ey = Math.sin(r.ang);
  const along = d[0] * ex + d[1] * ey;
  const across = -d[0] * ey + d[1] * ex;
  const w = Math.abs(across) > 0.01 ? Math.abs(across) : 0.01;
  return { ...r, cx: r.cx + d[0] / 2, cy: r.cy + d[1] / 2, w, sk: Math.abs(across) > 0.01 ? along / across : 0 };
}

// The key points, open. The seat is at knee height for a figure whose thigh is 19 and
// shin 18 (rig.U), so a sitter's pelvis rests at y −20 with his feet flat. Plain
// numbers rather than an object of tuples, so a worklet closes over them cleanly.
const O_SEATF_X = 14; const O_SEATF_Y = -17;
const O_SEATB_X = -7; const O_SEATB_Y = -18;
const O_BACKT_X = -12; const O_BACKT_Y = -52;
const O_ARMF_X = 13; const O_ARMF_Y = -29;
const O_ARMB_X = -9; const O_ARMB_Y = -30;
const O_FOOTF_X = 16; const O_FOOTF_Y = 0;
const O_FOOTB_X = -11; const O_FOOTB_Y = 0;
// FOLDED: a flat package stood on end, every point on one line 44 tall.
const F_SEATF_X = 2; const F_SEATF_Y = -20;
const F_SEATB_X = 0; const F_SEATB_Y = -22;
const F_BACKT_X = 0; const F_BACKT_Y = -44;
const F_ARMF_X = 2; const F_ARMF_Y = -24;
const F_ARMB_X = 0; const F_ARMB_Y = -26;
const F_FOOTF_X = 2; const F_FOOTF_Y = 0;
const F_FOOTB_X = 0; const F_FOOTB_Y = -2;
/** How far the back and seat faces turn toward the reader when open (the 3/4 depth). */
const DEPTH_X = -9; const DEPTH_Y = -3;
/**
 * AND FOLDED IT IS HELD FACE-ON. A folded lawn chair side-on is a line two units
 * wide — drawn that way on the first sheet it was a stick behind his leg. Held by
 * the side it shows its webbing, a flat striped package.
 */
const FDEPTH_X = -15; const FDEPTH_Y = 0;

export const CHAIR_BACK_PARTS = 15;
export const CHAIR_FRONT_PARTS = 2;

/**
 * The chair at `open` (0 folded … 1 set up), as rectangles. `layer` 'back' is the
 * webbing and the frame, drawn behind the sitter; 'front' is the near armrest, drawn
 * IN FRONT of him — the cartoon convention, and the only way the part that names the
 * chair stays visible once he is in it. Fixed counts, so the app mounts a fixed set
 * of Views: CHAIR_BACK_PARTS and CHAIR_FRONT_PARTS.
 */
export function chairRects(open: number, layer: 'back' | 'front'): ChairRect[] {
  'worklet';
  const u = open < 0 ? 0 : open > 1 ? 1 : open;
  const m = (fx: number, fy: number, ox: number, oy: number): P => {
    'worklet';
    return [fx + (ox - fx) * u, fy + (oy - fy) * u];
  };
  const armF = m(F_ARMF_X, F_ARMF_Y, O_ARMF_X, O_ARMF_Y);
  const armB = m(F_ARMB_X, F_ARMB_Y, O_ARMB_X, O_ARMB_Y);
  if (layer === 'front') {
    return [bar('line', armB, armF, 4.6), bar('arm', armB, armF, 3.0)];
  }
  const seatF = m(F_SEATF_X, F_SEATF_Y, O_SEATF_X, O_SEATF_Y);
  const seatB = m(F_SEATB_X, F_SEATB_Y, O_SEATB_X, O_SEATB_Y);
  const backT = m(F_BACKT_X, F_BACKT_Y, O_BACKT_X, O_BACKT_Y);
  const footF = m(F_FOOTF_X, F_FOOTF_Y, O_FOOTF_X, O_FOOTF_Y);
  const footB = m(F_FOOTB_X, F_FOOTB_Y, O_FOOTB_X, O_FOOTB_Y);
  const d = m(FDEPTH_X, FDEPTH_Y, DEPTH_X, DEPTH_Y);
  const out: ChairRect[] = [];
  // THE WEBBING FACES first: the back, then the seat — a white weave with the
  // coloured straps laid across it in bands.
  out.push(face('weave', seatB, backT, d, 0, 1));
  for (let i = 0; i < 5; i += 1) out.push(face('strap', seatB, backT, d, (i + 0.18) / 5, (i + 0.82) / 5));
  out.push(face('weave', seatF, seatB, d, 0, 1));
  for (let i = 0; i < 3; i += 1) out.push(face('strap', seatF, seatB, d, (i + 0.18) / 3, (i + 0.82) / 3));
  // THE TUBE FRAME: rear leg, back upright, seat rail, front leg, and the runner
  // along the ground that joins the two legs (the reference's U-tube).
  out.push(bar('frame', footB, seatB, 2.4));
  out.push(bar('frame', seatB, backT, 2.4));
  out.push(bar('frame', seatB, seatF, 2.4));
  out.push(bar('frame', armF, footF, 2.4));
  out.push(bar('frame', footB, footF, 1.8));
  return out;
}

export const MUG_PARTS = 14;

/**
 * THE MUG, in the frame of the hand holding it (the fist centre at 0,0): a squat cup
 * in the palette's spark, a paper rim, a handle on the far side, and — while it is
 * hot — two wisps of steam that drift on the clock. `steam` 0…1 thins them out.
 * Always MUG_PARTS rectangles; spent steam is a rectangle of width 0.
 */
export function mugRects(t: number, steam: number): ChairRect[] {
  'worklet';
  const out: ChairRect[] = [];
  out.push({ role: 'line', cx: 3.5, cy: -4.5, len: 11, w: 13, ang: 0, sk: 0 });
  out.push({ role: 'mug', cx: 3.5, cy: -4.5, len: 9, w: 11, ang: 0, sk: 0 });
  out.push({ role: 'rim', cx: 3.5, cy: -9.3, len: 9, w: 1.4, ang: 0, sk: 0 });
  out.push(bar('line', [8, -7.5], [11.5, -7], 1.6));
  out.push(bar('line', [11.5, -7], [11.8, -3.5], 1.6));
  out.push(bar('line', [11.8, -3.5], [8, -2.5], 1.6));
  const sw = steam > 0.05 ? 1.1 * steam : 0;
  for (let w = 0; w < 2; w += 1) {
    const x0 = 1.5 + w * 3.5;
    const ph = t * 2.2 + w * 1.7;
    let px = x0; let py = -12;
    for (let s = 1; s <= 4; s += 1) {
      const y = -12 - s * 3;
      const x = x0 + Math.sin(ph + s * 0.9) * 1.4;
      out.push(bar('steam', [px, py], [x, y], sw));
      px = x; py = y;
    }
  }
  return out;
}

/** A rectangle's four corners, for drawing it offline. */
export function rectCorners(r: ChairRect): P[] {
  const c = Math.cos(r.ang); const s = Math.sin(r.ang);
  const hx = r.len / 2; const hy = r.w / 2;
  // skewX first, then rotate, then translate — the order a View applies them in.
  return [[-hx, -hy], [hx, -hy], [hx, hy], [-hx, hy]]
    .map(([x0, y]) => { const x = x0 + y * r.sk; return [r.cx + x * c - y * s, r.cy + x * s + y * c] as P; });
}

/** The seated pelvis height above the ground, rig units (for the sitter's `bob`). */
export const SEAT_PELVIS_Y = -20;
