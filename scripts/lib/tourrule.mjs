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
/** K8 — including the closing wide station. */
export const MAX_STATIONS = 4;

/**
 * Travel and dwell per tour length, chosen so the total always clears K8's 5.5s.
 *
 *   2 stations  0.70 + 1.20 + 0.70                        = 2.60s
 *   3 stations  0.70 + 1.10 + 0.70 + 1.10 + 0.70          = 4.30s
 *   4 stations  0.65 + 0.95 thrice, then 0.65             = 5.45s
 *
 * The last station's dwell is not in the sum: K3 makes it the beat's full must-box
 * and it holds until the reader taps.
 */
export const PACE = {
  2: { tr: 0.7, dwell: 1.2 },
  3: { tr: 0.7, dwell: 1.1 },
  4: { tr: 0.65, dwell: 0.95 },
};

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

const clampToBand = (box, band) => {
  const x0 = Math.max(0, box[0]);
  const y0 = Math.max(band[0], box[1]);
  const x1 = Math.min(STAGE_W, box[0] + box[2]);
  const y1 = Math.min(band[1], box[1] + box[3]);
  return [x0, y0, Math.max(0, x1 - x0), Math.max(0, y1 - y0)];
};

/** What the camera has to hold: the figure and the words always, art unless it bleeds. */
export const wanted = (items) => (items ?? []).filter((it) => it.k !== 'art' || !it.bleed);

/**
 * ONE BEAT'S TOUR, or null if it does not earn one.
 *
 * @param items   the measured parts for this beat (mergeReadings output)
 * @param wide    the beat's full must-box — K3's closing station
 * @param band    the lesson's band
 * @param single  true for graded / drag / summary beats, which get one shot (K6)
 * @param reveal  whether the measurements carry reveal-order data at all
 * @param dur     the beat's own declared duration, for a follow station's dwell
 * @param seed    a per-lesson number, so the beats that rest differ between lessons
 * @param k       the beat index, which with `seed` decides which beats rest
 *
 * ── WHEN THE REVEAL ORDER IS NOT KNOWN ──────────────────────────────────────
 *
 * K2 says a tour's order must be measured, because with the clock gated a
 * mis-ordered tour parks the camera on one subject while another draws itself off
 * screen — worse than not touring at all. A sweep taken before reveal times were
 * recorded cannot answer that, and "everything was in the first reading" is
 * indistinguishable from "nobody looked".
 *
 * So without it the tour is capped at ONE detail station plus the closing wide.
 * That is safe by construction rather than by assumption: with a single detail
 * there is no order to get wrong, and K3 still guarantees the beat resolves to the
 * whole picture. The multi-station tours come back by re-running the sweep, which
 * is the only thing that can honestly authorise them.
 */
export function tourFor(items, wide, band, single, reveal = true, dur = 0, seed = 0, k = 0) {
  if (single || !wide) return null;
  const raw = wanted(items);
  if (raw.length < 2) return null;

  // ── K9 · IS THE SUBJECT WALKING? ───────────────────────────────────────────
  //
  // If it is, that beat wants a FOLLOW, not a pair of parked framings — "the camera
  // is very close to him, following him walk" is one continuous station whose target
  // moves. The sweep samples each beat four times, so a figure that crosses the
  // stage leaves four boxes at four x positions; ordered by reveal index they are a
  // trajectory, and the first and last of them are the two ends of the track.
  //
  // Needs the reveal order for the same reason everything else here does: without it
  // the samples are an unordered set and the figure could as easily be walking the
  // other way. 318 of 891 beats move a figure and the longest crosses 350 units, the
  // full width of the stage — which as ONE static station is necessarily the widest
  // shot in the lesson, and is exactly the shot readers described as a small man in
  // a long take.
  if (reveal) {
    const figs = raw.filter((it) => it.k === 'fig').sort((a, b) => (a.r ?? 0) - (b.r ?? 0));
    // ONE FIGURE PER READING, OR THIS CANNOT BE A WALK.
    //
    // Two people standing 200 units apart leave exactly the same trace as one person
    // who walked 200 units: a set of figure boxes at different x. The readings are
    // what tell them apart — a walker contributes ONE box per reading and moves
    // between them, whereas a crowd contributes several to the same reading and the
    // samples cannot be matched to owners at all.
    //
    // So a bucket holding more than one figure means the beat has company, and the
    // follow is abandoned rather than guessed. Conservative on purpose: the failure
    // it prevents is the camera gliding smoothly from one motionless person to
    // another as though it were tracking, which reads as the app being confused
    // about what it is looking at.
    const bucket = new Map();
    for (const f of figs) bucket.set(f.r ?? 0, (bucket.get(f.r ?? 0) ?? 0) + 1);
    const alone = [...bucket.values()].every((n) => n === 1);
    if (figs.length > 1 && alone && bucket.size > 1) {
      const a = figs[0], b = figs[figs.length - 1];
      const travelled = Math.abs((b.b[0] + b.b[2] / 2) - (a.b[0] + a.b[2] / 2));
      // C18's floor: under 60 units a walk does not read as a walk, and a camera
      // sliding after it reads as drift.
      if (travelled >= 60) {
        const near = clampToBand([a.b[0], a.b[1], a.b[2], a.b[3]], band);
        const far = clampToBand([b.b[0], b.b[1], b.b[2], b.b[3]], band);
        const hold = Math.max(1.6, Math.min(4.2, dur || 2.6));
        return [
          { box: near, to: far, tr: 0.7, dwell: hold },
          { box: wide, tr: 0.7, dwell: 9 },
        ];
      }
    }
  }

  const wideS = Math.max(1, Math.min(CAP, scaleFor(wide, band)));

  // K4 twice over: big enough to be a subject, and tight enough to be a move.
  const groups = cluster(raw, MAX_STATIONS - 1)
    .filter((g) => g.length)
    .map((g) => ({ items: g, box: clampToBand(union(g), band) }))
    .filter((g) => Math.max(g.box[2], g.box[3]) >= MIN_SUBJECT)
    .map((g) => ({ ...g, s: Math.max(1, Math.min(CAP, scaleFor(g.box, band))) }))
    .filter((g) => g.s > wideS + MIN_GAIN);

  // K2 — REVEAL ORDER, from the reading each thing was first seen in. Ties, and
  // beats whose things all arrived together, fall back to reading order: top band
  // first, then left to right. That fallback is only ever applied WITHIN one reveal
  // bucket, where by construction the reader saw them appear at the same time and
  // no order can be wrong.
  const firstSeen = (g) => Math.min(...g.items.map((it) => it.r ?? 0));
  groups.sort((a, b) => {
    const d = firstSeen(a) - firstSeen(b);
    if (d !== 0) return d;
    const ay = Math.round(a.box[1] / 40), by = Math.round(b.box[1] / 40);
    return ay !== by ? ay - by : a.box[0] - b.box[0];
  });

  // No measured reveal order — keep one detail and drop the rest, so there is no
  // order left to be wrong about. The one kept is whichever holds a FIGURE, and
  // failing that the largest subject: a lone incidental label getting the beat's
  // only close-up reads as the camera having missed the point, and the figure is
  // what the reader is following.
  let picked = !groups.length ? [] : reveal ? groups : [
    groups.find((g) => g.items.some((it) => it.k === 'fig'))
      ?? groups.reduce((a, b) => (a.box[2] * a.box[3] >= b.box[2] * b.box[3] ? a : b)),
  ];

  // ── THE FIGURE IS A SUBJECT, NOT A REGION ──────────────────────────────────
  //
  // Everything above separates subjects by finding blank paper between them, and
  // that misses the commonest composition in the app: a person standing among the
  // words about him. Measured, 243 beats produce a single cluster and 263 untoured
  // beats have a figure on stage — so gap-splitting alone leaves the most obvious
  // close-up in the whole vocabulary on the table. H60b's first bullet is "push in
  // on the figure"; this is what lets that happen when nothing else separates.
  //
  // Only when there is exactly ONE person, decided by the reading buckets rather
  // than the sample count: a figure that walks contributes several boxes and is
  // still one man, whereas two people contribute several to the same reading and
  // "which one do we push in on" has no answer worth guessing.
  if (!picked.length) {
    const figs = raw.filter((it) => it.k === 'fig');
    const bucket = new Map();
    for (const f of figs) bucket.set(f.r ?? 0, (bucket.get(f.r ?? 0) ?? 0) + 1);
    const one = figs.length > 0 && [...bucket.values()].every((n) => n === 1);
    // NOT EVERY BEAT, and this is the lesson followMoves already paid for: its first
    // pass pushed in on two beats out of three and left the reader with a camera that
    // never rests, at which point the moves stop registering as moves. A push reads as
    // a push against stillness. Seeded by the lesson so the beats that rest are not
    // the same ones in every lesson.
    if (one && (k + seed) % 3 !== 2) {
      const box = clampToBand(union([figs[figs.length - 1]]), band);
      const s = Math.max(1, Math.min(CAP, scaleFor(box, band)));
      if (Math.max(box[2], box[3]) >= MIN_SUBJECT && s > wideS + MIN_GAIN) {
        picked = [{ box, s }];
      }
    }
  }

  // K3 — always end on the whole beat. This doubles as the NEXT beat's establishing
  // shot: every beat therefore opens on the full picture without spending a station
  // on it, which is why a tour can be three framings long and still read as four.
  if (!picked.length) return null;
  const stations = [...picked.map((g) => g.box), wide];
  const pace = PACE[Math.min(stations.length, MAX_STATIONS)] ?? PACE[4];
  return stations.map((box, i) => ({
    box,
    tr: pace.tr,
    // The last dwell is unbounded — it holds until the tap. A number is stored so
    // the table has one shape, and the player ignores it on the final station.
    dwell: i === stations.length - 1 ? 9 : pace.dwell,
  }));
}
