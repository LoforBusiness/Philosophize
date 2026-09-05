// THE TOUR RULE — how a beat's measured contents become a sequence of framings.
//
// Its own file with no imports, for the same reason mustrule.mjs and camera.ts have
// none: the arguable part of group K is this file, and it should be possible to
// change the rule and regenerate every tour (scripts/make-tours.mjs) without paying
// for another browser sweep. measure-must.mjs collects the things; this decides how
// the camera should visit them.
//
// ── WHAT A STATION IS FOR ───────────────────────────────────────────────────
//
// H60c binds the camera to contain everything a beat draws, and a beat draws
// everything it will ever draw, so one framing per beat is as wide as the widest
// thing in it — measured, 72% of beats sit at exactly 1.0. Splitting the beat into
// stations moves that guarantee from "per beat" to "per instant". The arithmetic on
// the shipped measurements: 462 of 884 beats support a tour, and on those the
// ceiling goes 1.056× → 1.671×.
//
// ── AND WHAT A STATION IS NOT FOR: THE LAP ──────────────────────────────────
//
// The first version of this rule read H60c as "the reader must have seen the whole
// picture BY THE END OF THE BEAT", and implemented it by ending every tour on the
// beat's full must-box. That one line produced everything a reader then described as
// "a loop of movement": 2.39 stations a beat, 527 toured beats, and — the tell — a
// closing move that reveals nothing, because the shot it pulls back to is the shot
// the beat opened on.
//
// The commonest tour in the app was [tight on the man, 1.2s] → [the whole stage].
// The close-up taught nothing, and then the camera undid it. A reader sees a dip,
// not a decision.
//
// So the rule is now the one its own name always said: **every must-see thing is
// framed at some point in the beat**, not at the end of it. A camera that pans from
// a man to a chart and stays on the chart has not hidden the man. That single change
// is what removes the lap, and it makes the rest fall out:
//
//   · A tour is at most TWO stations, and the last one HOLDS until the tap.
//   · Two stations exist only when the beat's contents actually split into two
//     subjects, each worth stopping for. Then station 1 is one of them and station 2
//     is the other, so between them nothing is lost — the coverage is structural,
//     because `cluster` partitions every item into one group or the other.
//   · A lone subject among the words about it gets NO tour. It cannot: a station
//     that covers every item is by definition at least as wide as the must-box, so
//     it can never be tighter than the shot the beat already has. That beat rests on
//     its `followMoves` shot — which pushes in on the figure one beat in three
//     anyway, at the beat level, where a push reads as a push.
//   · A FOLLOW is one continuous move that tracks a walk, and it may pan once more
//     afterwards if there is genuinely something else to read. It is the one shot
//     allowed to end on its subject rather than on everything, because a walk IS the
//     beat and framing the whole stage as well is precisely what it exists not to do.

export const STAGE_W = 400;
export const STAGE_H = 560;

/** K5 — `tight`. Past this the frame is inside the figure. */
export const CAP = 1.72;
/** K4 — below this on its longer side, a station is a microscope, not a camera. */
export const MIN_SUBJECT = 88;
/** K4 — a station must be at least this much tighter than the closing wide shot. */
export const MIN_GAIN = 0.12;
/** The narrowest empty corridor that counts as a real separation between subjects. */
export const MIN_GAP = 34;
/**
 * K4b — HOW FAR OFF THE MIDDLE A STATION MAY LEAVE ITS SUBJECT.
 *
 * A share of the frame's width. 0.18 is a hair past the rule-of-thirds line (0.167),
 * which is where a subject stops reading as *placed* and starts reading as a camera
 * that was aimed badly.
 *
 * This exists because the camera physically cannot centre a subject near the edge of
 * the stage. `fit` may not let the window leave the design space, so the centre is
 * clamped to [200/s, 400 − 200/s]; for a subject at x 72 that needs s ≥ 2.78, and K5
 * caps every station at 1.72. Measured on the shipped tours: **76 stations sat more
 * than 12% off centre and the worst was 35.5%** — a man pinned against the left edge
 * of a frame that had just travelled to look at him, which is exactly what the reader
 * described.
 *
 * Tightening the scale makes it WORSE, not better, which is the counter-intuitive
 * part: a wider frame has its centre pinned nearer the stage centre. So there is no
 * scale that rescues an edge subject, and the honest move is not to go. A beat that
 * fails this keeps the shot it already had — where the whole stage is visible and the
 * subject being off to one side is the composition, not the camera.
 */
export const MAX_OFF = 0.18;
/**
 * K3 — how far a figure must travel before the camera treats him as the beat's
 * change. Below this he is breathing and gesturing, which every figure does on every
 * beat; above 60 he is walking and gets a follow (K9) instead.
 */
export const FIG_MOVE = 24;

/**
 * Can the camera put this box near the middle of the frame? Mirrors `fit`'s x-clamp
 * exactly — including its one unit of slack — because agreeing with the shipping
 * maths is the whole point of deciding this here.
 */
export function centrable(box, band) {
  const s = Math.max(1, Math.min(CAP, scaleFor(box, band)));
  const halfW = STAGE_W / (2 * s);
  const bx = box[0] + box[2] / 2;
  const cx = Math.min(Math.max(bx, halfW - 1), STAGE_W + 1 - halfW);
  return Math.abs(bx - cx) / (2 * halfW) <= MAX_OFF;
}
/**
 * K8 — the whole tour, and there is no closing station on top of it.
 *
 * Two, because two is the smallest number that can express "look here, now look
 * there" and the largest that is not a lap. Three framings in one beat means the
 * camera has visited something it did not need to, which is what the reader saw.
 */
export const MAX_STATIONS = 2;

/**
 * Travel and dwell. One shape now, because there is one tour length.
 *
 *   0.70 travel + 1.60 dwell + 0.70 travel = 3.00s, then it holds until the tap.
 *
 * The dwell went 1.2 → 1.6 with the lap removed. Under the old rule the first
 * station was one of three or four and the reader was being hurried through it;
 * now it is half the beat, and it owns that much of the scene clock (K1), so it
 * needs long enough for what it is framing to actually happen.
 */
export const PACE = {
  2: { tr: 0.7, dwell: 1.6 },
};

// ── A TRAVEL TAKES AS LONG AS ITS DISTANCE NEEDS (K8) ───────────────────────
//
// Every station shipped at a FLAT 0.7s, whatever it was travelling. That is the
// same defect §17 records for the walk, in the same words: "a FIXED length,
// whatever the distance ... 145 walking beats, every one too fast", where
// `rig.moveTr` already existed to derive it. The camera had no equivalent.
//
// A push to the 1.72× ceiling and a nudge to 1.05× are not the same move, and at
// 0.7s the big one arrives as a snap — which is what a reader called the screen
// "resetting", and why their own suggestion was that it "needs to be held out
// longer". Measured frame by frame it was never discontinuous; it was just fast.
//
// So the duration is interpolated across the station's own scale, between a floor
// that is not a jump-cut and K8's own ceiling. Both ends are the numbers
// `checkTour` already enforces (0.35 and 1.2), so this cannot generate a tour that
// its own validator rejects: the ceiling is the rule, not a taste.
const TR_MIN = 0.55;      // K8 calls anything under 0.35 a jump-cut; this keeps room
const TR_MAX = 1.2;       // K8's ceiling exactly
// CAP (1.72, camera.ts SCALE.tight) is already declared above and is reused here.

/** The scale a station would settle at — camera.ts's own `stationShot` rule. */
function scaleOf(box, band) {
  const bandH = band[1] - band[0];
  const w = Math.max(Array.isArray(box) ? box[2] : box.w, 1);
  const h = Math.max(Array.isArray(box) ? box[3] : box.h, 1);
  return Math.max(1, Math.min(CAP, Math.min(400 / w, bandH / h)));
}

/**
 * How long a travel should take, from how far it actually goes.
 *
 * THE DISTANCE IS THE RATIO, NOT THE DESTINATION. The first draft scored the
 * station's own scale, which gets the push right and the PULL-OUT exactly
 * backwards: coming home to the whole stage is scale 1, so a 1.72× → 1.0 retreat
 * — the same distance as the push that set it up, and the half a reader actually
 * calls "it reset" — would have been given the shortest travel in the table.
 */
export function stationTr(box, band, from = null) {
  const to = scaleOf(box, band);
  const at = from ? scaleOf(from, band) : 1;
  const r = Math.max(to / at, at / to);
  const t = TR_MIN + (TR_MAX - TR_MIN) * Math.min(1, Math.log(r) / Math.log(CAP));
  return Math.round(Math.max(TR_MIN, Math.min(TR_MAX, t)) * 100) / 100;
}

export const union = (items) => {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const it of items) {
    x0 = Math.min(x0, it.b[0]); y0 = Math.min(y0, it.b[1]);
    x1 = Math.max(x1, it.b[0] + it.b[2]); y1 = Math.max(y1, it.b[1] + it.b[3]);
  }
  return [x0, y0, x1 - x0, y1 - y0];
};

/** The scale that just contains a box, before any clamping. */
export const scaleFor = (box, band) =>
  Math.min(STAGE_W / Math.max(box[2], 1), (band[1] - band[0]) / Math.max(box[3], 1));

/**
 * Split a group along one axis at its widest empty corridor.
 *
 * Corridor rather than midpoint: what separates two subjects on a stage is the blank
 * paper between them, and a midpoint split cuts whichever subject happens to straddle
 * the middle. Returns the gap it found so the caller can compare candidate splits
 * across both axes and take the most decisive one.
 */
export function splitAt(items, axis) {
  const lo = axis === 'x' ? (it) => it.b[0] : (it) => it.b[1];
  const hi = axis === 'x' ? (it) => it.b[0] + it.b[2] : (it) => it.b[1] + it.b[3];
  const sorted = [...items].sort((a, b) => lo(a) - lo(b));
  let best = 0, at = -1, reach = hi(sorted[0]);
  for (let i = 1; i < sorted.length; i++) {
    const gap = lo(sorted[i]) - reach;
    if (gap > best) { best = gap; at = i; }
    reach = Math.max(reach, hi(sorted[i]));
  }
  return at < 0 ? null : { gap: best, left: sorted.slice(0, at), right: sorted.slice(at) };
}

/** Repeatedly split whichever group has the most decisive corridor left in it. */
export function cluster(items, max) {
  let groups = [items];
  while (groups.length < max) {
    let bi = -1, bs = null, bg = MIN_GAP;
    groups.forEach((g, i) => {
      if (g.length < 2) return;
      for (const ax of ['x', 'y']) {
        const s = splitAt(g, ax);
        if (s && s.gap > bg) { bg = s.gap; bi = i; bs = s; }
      }
    });
    if (bi < 0) break;
    groups = [...groups.slice(0, bi), bs.left, bs.right, ...groups.slice(bi + 1)];
  }
  return groups;
}

/**
 * ROUNDED OUTWARD, and the table stores integers, which is the point.
 *
 * `make-tours` writes every station through `Math.round`, so a box validated at
 * y 232.5 ships as y 233 — half a unit tighter than the one every check was run
 * against. That is enough: epistemology-13 beat 2 had five labels sitting exactly on
 * y 232.5, inside the framing the generator approved and sliced by the one it wrote.
 * Growing outward makes the stored box a superset of the computed one, so nothing the
 * generator proved can be lost in the write.
 */
const outward = (box) => [
  Math.floor(box[0]), Math.floor(box[1]),
  Math.ceil(box[0] + box[2]) - Math.floor(box[0]),
  Math.ceil(box[1] + box[3]) - Math.floor(box[1]),
];

const clampToBand = (box, band) => {
  const x0 = Math.max(0, box[0]);
  const y0 = Math.max(band[0], box[1]);
  const x1 = Math.min(STAGE_W, box[0] + box[2]);
  const y1 = Math.min(band[1], box[1] + box[3]);
  return outward([x0, y0, Math.max(0, x1 - x0), Math.max(0, y1 - y0)]);
};

/** What the camera has to hold: the figure and the words always, art unless it bleeds. */
export const wanted = (items) => (items ?? []).filter((it) => it.k !== 'art' || !it.bleed);

/**
 * The window a station on `box` would actually show, mirroring `stationShot` + `fit`.
 *
 * Kept here rather than imported so this file stays zero-import (see the header); the
 * cost is that the two must agree, and the reason it is worth paying is that the
 * next function needs to know what a framing CUTS before deciding whether to make it.
 */
export function windowOf(box, band, ground) {
  const s = Math.max(1, Math.min(CAP, scaleFor(box, band)));
  const halfW = STAGE_W / (2 * s);
  const oTop = (band[0] - STAGE_H / 2) / s;
  const oBot = (band[1] - STAGE_H / 2) / s;

  // ── fit(): clamp the window inside the design space and above the ground ──
  let cx = Math.min(Math.max(box[0] + box[2] / 2, halfW - 1), STAGE_W + 1 - halfW);
  let cyLo = -1 - oTop;
  const cyHi = STAGE_H + 1 - oBot;
  if (ground != null && s > 1.02) cyLo = Math.max(cyLo, ground - oBot);
  let cy = Math.min(Math.max(box[1] + box[3] / 2, cyLo), cyHi);

  // ── AND THEN containShot(), WHICH IS THE HALF I LEFT OUT ─────────────────
  //
  // `stationShot` is fit-then-contain, and modelling only the first half put this
  // 56 units out vertically while agreeing exactly across — so `cleanEdges` was
  // testing a window the camera never shows, and passed captions it was in fact
  // slicing (aesthetics-1 beat 0, the panel's caption at y 254 against a real window
  // starting at 264). Horizontal agreement is what made it look right.
  cx = Math.max(halfW, Math.min(STAGE_W - halfW, cx));
  cy = Math.max(-oTop, Math.min(STAGE_H - oBot, cy));
  cx = Math.max(Math.min(cx, box[0] + halfW), box[0] + box[2] - halfW);
  cy = Math.max(Math.min(cy, box[1] - oTop), box[1] + box[3] - oBot);

  return { left: cx - halfW, right: cx + halfW, top: cy + oTop, bottom: cy + oBot };
}

/**
 * D — THE CAMERA MAY NOT CUT A WORD IN HALF.
 *
 * A cost of holding on a station instead of ending wide. Under the old rule the beat
 * always resolved to the whole stage, so a mid-tour framing slicing a label was a
 * moment rather than the picture the reader was left with. Now it IS the picture:
 * aesthetics-1 beat 0 came back framing the sunset beautifully with the chart panel
 * beside it chopped down its middle, reading "APP… SUN… BEAU…".
 *
 * So a station grows to swallow any TEXT it would otherwise slice. Art is exempt —
 * art bleeding off a frame edge is ordinary composition, and `wanted` already drops
 * the pieces that are meant to bleed. If growing costs the station its gain, `worth`
 * rejects it and the beat holds wide, which is the correct answer: it means the beat
 * cannot be framed tightly without cutting a word.
 */
export function cleanEdges(box, band, all, ground) {
  let out = box;
  for (let pass = 0; pass < 4; pass++) {
    const w = windowOf(out, band, ground);
    const cut = (all ?? []).filter((it) => {
      if (it.k !== 'text') return false;
      // ONLY WHAT THE CAMERA COULD HAVE FRAMED. Text drawn outside the lesson's band
      // is unreachable at any shot — the band is the camera's vertical world — so
      // growing for it never converges and the fault is H59's, in the scene, not the
      // camera's. Blaming the camera for it would also hide the real ones.
      if (it.b[1] < band[0] - 0.5 || it.b[1] + it.b[3] > band[1] + 0.5) return false;
      const [x, y, bw, bh] = it.b;
      const overlaps = x < w.right && x + bw > w.left && y < w.bottom && y + bh > w.top;
      const whole = x >= w.left - 0.5 && x + bw <= w.right + 0.5 && y >= w.top - 0.5 && y + bh <= w.bottom + 0.5;
      return overlaps && !whole;
    });
    if (!cut.length) return out;
    out = clampToBand(union([{ b: out }, ...cut]), band);
  }
  return out;
}

/**
 * Does this framing still cut a word in half?
 *
 * `cleanEdges` grows a box until nothing is half in frame, and it does not always
 * converge: widening a box lowers its scale, which widens the window, which can
 * newly clip something that was wholly outside it a moment earlier. Six stations
 * survived that oscillation for a long time, and raising the type in every scene
 * (D34) made it eight.
 *
 * The answer is not a bigger budget. A framing that cannot hold a word whole is
 * not worth holding, and the wide shot is always clean — so the caller drops the
 * station rather than shipping a station that slices a label.
 */
export function slicesWord(box, band, all, ground) {
  const w = windowOf(box, band, ground);
  for (const it of all ?? []) {
    if (it.k !== 'text') continue;
    const [x, y, bw, bh] = it.b;
    // Text outside the band is unreachable at any shot — an H59 fault in the
    // scene, not a framing the camera chose (same reason `cleanEdges` skips it).
    if (y < band[0] - 0.5 || y + bh > band[1] + 0.5) continue;
    const overlaps = x < w.right && x + bw > w.left && y < w.bottom && y + bh > w.top;
    const whole = x >= w.left - 0.5 && x + bw <= w.right + 0.5
      && y >= w.top - 0.5 && y + bh <= w.bottom + 0.5;
    if (overlaps && !whole) return true;
  }
  return false;
}

/** Is an item's box wholly inside `o`? Half a unit of slack for rounding. */
const inside = (b, o) =>
  b[0] >= o[0] - 0.5 && b[1] >= o[1] - 0.5 &&
  b[0] + b[2] <= o[0] + o[2] + 0.5 && b[1] + b[3] <= o[1] + o[3] + 0.5;


/** Is a box wholly inside a visible window? */
const inWindow = (b, w) =>
  b[0] >= w.left - 0.5 && b[0] + b[2] <= w.right + 0.5 &&
  b[1] >= w.top - 0.5 && b[1] + b[3] <= w.bottom + 0.5;

/** Two framings that differ by less than this are the same shot; moving is a twitch. */
const SAME = 12;
const sameBox = (a, b) =>
  !!a && !!b && Math.abs(a[0] - b[0]) < SAME && Math.abs(a[1] - b[1]) < SAME &&
  Math.abs(a[2] - b[2]) < SAME && Math.abs(a[3] - b[3]) < SAME;

/** What ARRIVES during a beat — the beat's subject. A living figure does not count. */
export function freshOf(raw) {
  const figs = raw.filter((it) => it.k === 'fig');
  let moved = 0;
  if (figs.length > 1) {
    const ord = [...figs].sort((a, b) => (a.r ?? 0) - (b.r ?? 0));
    const cx = (it) => it.b[0] + it.b[2] / 2;
    moved = Math.abs(cx(ord[ord.length - 1]) - cx(ord[0]));
  }
  return raw.filter((it) => (it.r ?? 0) > 0 && (it.k !== 'fig' || moved >= FIG_MOVE));
}

/**
 * A WHOLE LESSON'S CAMERA, decided in order, with a memory of where it is pointing.
 *
 * ── WHY THIS IS SEQUENTIAL AND THE OLD ONE WAS NOT ──────────────────────────
 *
 * Deciding each beat on its own cannot help but bounce. Beat 0 finds a subject and
 * pushes in; beat 1 finds nothing and therefore has no reason to be anywhere, so it
 * falls back to the whole stage; beat 2 finds the same subject and pushes in again.
 * A reader watching that sees exactly what one reported: *"it'll zoom in, then zoom
 * out, and then two clicks later, it'll be the exact same zoom in and zoom out"* —
 * and every lesson does it the same way, because the pattern comes from the rule
 * rather than from the lesson.
 *
 * The camera is a PATH. It is somewhere, and it moves when the next thing to see is
 * not already in front of it. So this walks the beats carrying `held` — the framing
 * the camera will be sitting in — and emits a move only when that framing does not
 * already contain what the beat is about. Everything else emits `null`, which the
 * player now reads as **hold what you have** rather than as "fall back to wide".
 *
 * Three consequences, and they are the three things that were asked for:
 *
 *   · **One move per beat at most, and usually none.** A lesson becomes a handful of
 *     deliberate moves instead of a push and a pull on every tap.
 *   · **No two moves in a row to the same place.** `sameBox` refuses a move that
 *     would land within 12 units of where the camera already is.
 *   · **It differs per lesson by construction**, because the path is driven by where
 *     that lesson's content actually is and when it arrives — not by a seeded cycle
 *     dealing push/pull/hold to every lesson alike.
 *
 * @param beats  per beat: { items, wide, single, dur }
 * @returns per beat: an array of stations, or null to hold
 */
export function lessonTours(beats, band, ground) {
  const WHOLE = [0, band[0], STAGE_W, band[1] - band[0]];
  const out = [];
  // `null` means the camera is showing the whole stage, which is where it starts and
  // where every graded beat puts it back (K6 — an answer target must take the
  // identity transform or the tap has to survive a camera offset).
  let held = null;
  const heldWindow = () => windowOf(held ?? WHOLE, band, ground);

  for (const beat of beats) {
    const { items, wide, single, dur } = beat;
    if (single || !wide) { out.push(null); held = null; continue; }
    const raw = wanted(items ?? []);
    if (raw.length < 2) { out.push(null); continue; }

    const wideS = Math.max(1, Math.min(CAP, scaleFor(wide, band)));
    const worth = (box) =>
      Math.max(box[2], box[3]) >= MIN_SUBJECT &&
      Math.max(1, Math.min(CAP, scaleFor(box, band))) > wideS + MIN_GAIN &&
      centrable(box, band);

    // ── K9 · the subject is walking → go WITH it ─────────────────────────────
    const figs = raw.filter((it) => it.k === 'fig').sort((a, b) => (a.r ?? 0) - (b.r ?? 0));
    const bucket = new Map();
    for (const f of figs) bucket.set(f.r ?? 0, (bucket.get(f.r ?? 0) ?? 0) + 1);
    const alone = [...bucket.values()].every((n) => n === 1);
    let followed = null;
    if (figs.length > 1 && alone && bucket.size > 1) {
      const a = figs[0], b = figs[figs.length - 1];
      const travelled = Math.abs((b.b[0] + b.b[2] / 2) - (a.b[0] + a.b[2] / 2));
      if (travelled >= 60) {
        const near = clampToBand([a.b[0], a.b[1], a.b[2], a.b[3]], band);
        const far = clampToBand([b.b[0], b.b[1], b.b[2], b.b[3]], band);
        if (centrable(near, band) && centrable(far, band)) followed = { near, far };
      }
    }
    if (followed) {
      const hold = Math.max(1.6, Math.min(4.2, dur || 2.6));
      out.push([{ box: followed.near, to: followed.far, tr: stationTr(followed.near, band, held), dwell: hold }]);
      held = followed.far;
      continue;
    }

    // ── WHAT HAPPENS THIS BEAT, AND IS IT ALREADY IN FRAME? ──────────────────
    const fresh = freshOf(raw);
    if (!fresh.length) { out.push(null); continue; }              // nothing happens: hold
    const need = clampToBand(union(fresh), band);
    const box = cleanEdges(need, band, raw, ground);

    // A STATION THAT STILL CUTS A WORD IS NOT A STATION — hold the wide shot,
    // which frames everything whole by construction. See `slicesWord`.
    if (slicesWord(box, band, raw, ground)) { out.push(null); continue; }

    // ── THE REASON TO MOVE IS EMPHASIS, NOT VISIBILITY ───────────────────────
    //
    // Read the other way round this rule does nothing at all: the camera starts on
    // the whole stage, so everything is already in frame, so there is never anything
    // to go to — measured, 47 moves across 905 beats and most lessons dead still.
    // The camera pushes in because the beat is ABOUT this thing, not because the
    // thing would otherwise be invisible.
    //
    // So `worth` (K4 — big enough, tighter enough, centrable) decides whether there
    // is a framing here at all, and only when there is not does visibility get a say.
    if (worth(box)) {
      // Already framing exactly this — hold. This is the line that kills the bounce:
      // a run of beats about one subject is ONE move, not a move per beat.
      if (sameBox(box, held)) { out.push(null); continue; }
      out.push([{ box, tr: stationTr(box, band, held), dwell: 9 }]);
      held = box;
      continue;
    }
    // No framing worth making. If it can be seen from where the camera already is,
    // stay — otherwise come back to the whole stage, which always contains it.
    if (inWindow(need, heldWindow())) { out.push(null); continue; }
    if (held === null) { out.push(null); continue; }
    out.push([{ box: WHOLE, tr: stationTr(WHOLE, band, held), dwell: 9 }]);
    held = null;
  }
  return out;
}
