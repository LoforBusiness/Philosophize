// ─────────────────────────────────────────────────────────────────────────────
// WHAT HE IS LOOKING AT — authored, beat by beat, moment by moment.
//
// Owner, 2026-09-28: *"If something's being taught and he should be looking up
// because an animation is happening, he should look up. But not just keep staring
// up in the sky when there's nothing there … If something's happening on scene,
// the stick man should be looking at it or should be interacting with it."*
//
// The generated gaze (`make:gaze`) aims every beat at the area-weighted centre of
// everything the beat draws. That is never wrong in an embarrassing way on a busy
// stage, and it is exactly wrong on a set built of real objects: a tall bookcase,
// a wall map or a night sky puts the centre of the picture above his head, so he
// stares up at nothing for the whole beat, and nothing he looks at is ever the
// thing that is MOVING. Attention is a claim about the moment, not about the
// picture, so it is authored by the scene that stages the moment.
//
// A beat's attention is a list of KEYS, flat: `[t, x, y, w, t, x, y, w, …]`. From
// time `t` into the beat he looks at stage point (x, y) with weight `w` (0 = his
// pose's own head, eyes front; 1 = fully on the point). Each key takes over from
// the one before across `SHIFT` seconds, eased, which is about how long a person
// takes to move their eyes and head to something new.
//
// A key whose `w` is 0 is the important one: it is "nothing to look at", and it
// hands the head back to the pose rather than leaving it parked on the last thing.
//
// Zero imports, like rig.ts: a scene imports this, and a check can too, in plain Node.
// ─────────────────────────────────────────────────────────────────────────────

/** How long a look takes to move from one thing to the next, in seconds. */
export const SHIFT = 0.45;

function ease(t: number): number {
  'worklet';
  const u = t < 0 ? 0 : t > 1 ? 1 : t;
  return u * u * (3 - 2 * u);
}

/**
 * Where he is looking `b` seconds into a beat whose keys are `keys`. Before the
 * first key he looks where `from` says — the end of the previous beat — so a tap
 * never snaps his head.
 */
export function attendAt(
  keys: readonly number[], b: number, fx: number, fy: number, fw: number,
): { x: number; y: number; w: number } {
  'worklet';
  let x = fx;
  let y = fy;
  let w = fw;
  for (let k = 0; k + 3 < keys.length; k += 4) {
    const t = keys[k];
    if (b <= t) break;
    const u = ease((b - t) / SHIFT);
    const tx = keys[k + 1];
    const ty = keys[k + 2];
    const tw = keys[k + 3];
    // from nothing to something, the eyes go straight to it rather than sweeping
    // across the stage from wherever the last look happened to leave the point
    if (tw > 0 && w < 0.05) { x = tx; y = ty; }
    // a key with no weight keeps the point where it was, so the head eases home
    // from the thing he was last looking at rather than swinging across the stage
    x = tw > 0 ? x + (tx - x) * u : x;
    y = tw > 0 ? y + (ty - y) * u : y;
    w = w + (tw - w) * u;
  }
  return { x, y, w };
}

/** Where a beat's attention ends up — what the next beat starts from. */
export function attendEnd(keys: readonly number[], fx: number, fy: number, fw: number): { x: number; y: number; w: number } {
  'worklet';
  return attendAt(keys, 1e6, fx, fy, fw);
}
