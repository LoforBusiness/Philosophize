// THE MUST-SEE RULE — which of a beat's measured things the camera has to hold.
//
// Its own file, and with no imports, for the same reason rig.ts and camera.ts have
// none: the rule is the arguable part of H60c and it should be possible to change
// it and regenerate the whole table (scripts/regen-must.mjs) without paying for
// another browser sweep. measure-must.mjs collects the things; this decides what
// they add up to.

export const STAGE_W = 400;
export const STAGE_H = 560;

/**
 * The readings taken across one beat, pooled.
 *
 * No attempt is made to match a thing to itself between readings, because it does
 * not matter: the output is a union either way, and the union over all readings is
 * exactly the coverage wanted — wherever a thing travelled during the beat, the box
 * contains it. Duplicates are dropped only to keep the sidecar small.
 */
export function mergeReadings(...readings) {
  const out = [];
  const seen = new Set();
  for (const list of readings) {
    for (const it of list ?? []) {
      const key = `${it.k}|${it.t ?? ''}|${it.b.map((n) => Math.round(n)).join(',')}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(it);
    }
  }
  return out;
}

/**
 * WHAT COUNTS AS SOMETHING THE READER MUST SEE WHOLE.
 *
 * The first version of this was words only, and it was wrong in the way that
 * matters. A reader reported the camera cutting the stickman in half and slicing
 * the illustration above him — and the frame audit had already counted 438 clipped
 * art elements, which the rule had been written to ignore on the grounds that
 * cropping scenery is what a push IS. That is true of scenery and false of the
 * lesson: the figure and the diagram above him are the thing being taught with.
 *
 * So:
 *   fig   ALWAYS. The whole man, arms included, and every figure on stage — not the
 *         single point and head-height that validate-cinematic models, which cannot
 *         see a reaching hand or a second figure.
 *   text  ALWAYS. If it is set in words the reader is meant to read it.
 *   art   UNLESS IT BLEEDS. A ground line drawn from x -20 to x 420 is meant to
 *         continue past the frame and demanding the camera hold it would pin every
 *         shot to scale 1 for nothing. A prop that sits wholly inside the stage is a
 *         thing with edges, and slicing it reads as damage.
 *
 * `mode` exists so the cost of each of these can be measured against the same
 * recordings instead of argued about: 'text' is the old rule, 'figure' adds the
 * man, 'all' is the shipped rule.
 */
export function mustBox(items, _prev, mode = 'all', band = [0, STAGE_H]) {
  if (!items || !items.length) return null;
  const want = (it) => {
    if (it.k === 'fig') return mode !== 'text';
    if (it.k === 'text') return true;
    return mode === 'all' && !it.bleed;
  };
  const use = items.filter(want);
  if (!use.length) return null;
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const it of use) {
    x0 = Math.min(x0, it.b[0]); y0 = Math.min(y0, it.b[1]);
    x1 = Math.max(x1, it.b[0] + it.b[2]); y1 = Math.max(y1, it.b[1] + it.b[3]);
  }
  // A FOUR-UNIT PAD. The audit was reporting figures at 96–98% inside — one to four
  // pixels of a shoulder or a heel over the edge, from rounding between the measured
  // box and the shot that contains it. Four units on a 400-wide stage costs nothing
  // in zoom and takes those off the board, so the remaining hits are real ones.
  x0 = Math.floor(x0) - 4; y0 = Math.floor(y0) - 4;
  x1 = Math.ceil(x1) + 4; y1 = Math.ceil(y1) + 4;
  // CLAMPED TO WHAT THE CAMERA CAN ACTUALLY SHOW — the stage across, the lesson's
  // BAND down. This is not tidiness; an impossible box is worse than no box at all.
  //
  // containShot has two clamps per axis: "the box's near edge is visible" and "its
  // far edge is visible". While the box fits they agree. Once it does not they
  // contradict, and the second one is applied last, so it wins — the window is
  // dragged toward the far edge and the near edge is cut.
  //
  // logic-arguments-5 is the worked example. Its band is 224..510, 286 tall; the
  // measured box came to 240..546, 306 tall, because the scene draws 36 units below
  // its own band. Asking for the bottom of that pulled the window down to y 260 on
  // every beat and sliced "AB = AC" — which sits at y 256, comfortably INSIDE the
  // band and perfectly visible if nothing had asked for the impossible. The box was
  // not protecting the label; it was the reason the label was cut.
  //
  // Anything outside the band is an H59 fault (the band must contain every pixel a
  // beat can draw) and belongs to the scene. The camera's job is to frame what is
  // reachable, so that is all it is asked for.
  x0 = Math.max(0, x0); y0 = Math.max(band[0], y0);
  x1 = Math.min(STAGE_W, x1); y1 = Math.min(band[1], y1);
  if (x1 - x0 < 1 || y1 - y0 < 1) return null;
  return [x0, y0, x1 - x0, y1 - y0];
}

/** The generated file, from a map of lesson id -> per-beat item lists. */
export function renderTable(words, stamps, mode = 'all', bands = new Map()) {
  const boxes = {};
  for (const [id, per] of Object.entries(words)) {
    boxes[id] = per.map((items, i) => mustBox(items, i > 0 ? per[i - 1] : null, mode, bands.get(id) ?? [0, STAGE_H]));
  }
  const lines = [
    '// GENERATED by scripts/measure-must.mjs — do not hand-edit.',
    '//',
    '// Per beat, the box (scene coordinates) the camera must contain, measured from',
    '// the real render: every figure on stage, every word, and every piece of art that',
    "// does not already bleed off the stage edge. H60c — \"if the reader is told to look",
    '// at it, the camera must frame it".',
    '//',
    '// CinematicPlayer feeds these to containShot, which only ever LOOSENS a shot: the',
    '// scale comes down to fit and the centre slides the shortest distance. A beat whose',
    '// shot already showed everything is returned untouched, so the authored camera work',
    '// survives everywhere it was already right.',
    '//',
    '// MUST_STAMP fingerprints the scene and script each box was measured from.',
    '// validate-cinematic fails when one diverges, because the dangerous direction is',
    '// silent: a box that has gone stale and too SMALL lets a push crop the very thing',
    '// it was recorded to protect. Re-run measure-must.mjs after changing a layout.',
    '',
    'export type MustBox = readonly [x: number, y: number, w: number, h: number];',
    '',
    'export const MUST: Record<string, readonly (MustBox | null)[]> = {',
  ];
  for (const id of Object.keys(boxes).sort()) {
    lines.push(`  '${id}': [${boxes[id].map((b) => (b ? `[${b.join(', ')}]` : 'null')).join(', ')}],`);
  }
  lines.push('};', '', 'export const MUST_STAMP: Record<string, string> = {');
  for (const id of Object.keys(stamps).sort()) lines.push(`  '${id}': '${stamps[id]}',`);
  lines.push('};', '');
  return { text: lines.join('\n'), boxes };
}
