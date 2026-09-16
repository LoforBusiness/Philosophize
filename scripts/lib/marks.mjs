// ─────────────────────────────────────────────────────────────────────────────
// STAGE MARKS: THE GEOMETRY AND THE RULES, ONCE.
//
// make-marks writes the table and check-marks re-derives it. Both read these
// functions, so the two cannot drift into two implementations of one rule — the fault
// CLAUDE.md has recorded three times (make:tours against checkTour is the live one).
// ─────────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';

export const STAGE_W = 400;

/** The rotation. `arrowL` stands left of its label and points right; `arrowR` the reverse. */
export const STYLES = ['ring', 'underline', 'bracket', 'box', 'arrowL', 'arrowR'];

/** Keys a beat carries that are prose or structure rather than a channel the scene reads. */
export const PROSE = new Set(['text', 'cite', 'say', 'quote', 'tap', 'mc', 'interact', 'summary', 'must', 'dur']);

/** Where a mark of `style` is drawn around a label box `[x, y, w, h]`. */
export function markBox(style, [x, y, w, h]) {
  switch (style) {
    case 'ring': return [x - 7, y - 6, w + 14, h + 12];
    case 'underline': return [x - 3, y + h + 1, w + 6, 8];
    case 'bracket': return [x - 9, y - 4, w + 18, h + 8];
    case 'box': return [x - 5, y - 4, w + 10, h + 8];
    case 'arrowL': return [x - 34, y + h / 2 - 8, 29, 16];
    case 'arrowR': return [x + w + 5, y + h / 2 - 8, 29, 16];
    default: throw new Error(`no mark style ${style}`);
  }
}

const hits = (a, b, m = 0) => a[0] < b[0] + b[2] + m && b[0] < a[0] + a[2] + m && a[1] < b[1] + b[3] + m && b[1] < a[1] + a[3] + m;

/**
 * Whether a mark box is clear: inside the stage and the lesson's band, off every OTHER
 * word the beat draws, and off every figure. The marked label itself is inside a ring,
 * a box and a pair of brackets by design, and an underline and an arrow sit beside it.
 */
export function fitsMark(box, label, items, [bandT, bandB]) {
  const [x, y, w, h] = box;
  if (x < 2 || x + w > STAGE_W - 2 || y < bandT + 2 || y + h > bandB - 2) return false;
  for (const it of items) {
    if (it === label) continue;
    if (it.k === 'text' && it.t && hits(box, it.b, 1.5)) return false;
    if (it.k === 'fig' && hits(box, it.b, 0)) return false;
  }
  return true;
}

/**
 * HOW FAR THE INK REACHES FROM THE PATH: half the 2.3-unit stroke, the 2.2-unit paper
 * halo either side of it, and a hair. StageMark.tsx is the source of both widths.
 */
export const PEN_REACH = 2.4;
/** A painted box whose border the audit did not record is treated as a plate's. */
const ASSUMED_BORDER = 2.5;

/**
 * Every point the pen passes through, in STAGE units, a unit apart at most. The
 * stroke's own points are its corners; a box side is one segment ninety units long,
 * so testing the corners alone would let a side run straight through a tick box.
 */
export function penPoints(stroke, box) {
  const out = [];
  const [bx, by] = box;
  const pts = stroke.pts;
  for (let k = 0; k < pts.length; k += 1) {
    const [x, y] = pts[k];
    out.push([bx + x, by + y]);
    const nxt = pts[k + 1];
    if (!nxt) continue;
    const n = Math.floor(Math.hypot(nxt[0] - x, nxt[1] - y));
    for (let j = 1; j < n; j += 1) out.push([bx + x + ((nxt[0] - x) * j) / n, by + y + ((nxt[1] - y) * j) / n]);
  }
  return out;
}

/**
 * Whether the pen touches a painted box's EDGE — a plate border, a tick box, a rule —
 * as recorded by scripts/audit-marks.mjs (`[x, y, w, h, border]`). Its edge is the band
 * from the outside of the box to the inside of its border: a pen further out than its
 * reach is off it, and one deeper inside than the border and its reach is on the
 * plate's face, which is the plate being the mark's ground. Measured on the drawn path,
 * not the mark's box: the first version tested boxes and passed a ring laid along
 * THE GENERAL WILL's border, because the plate "contained" the ring's box while its
 * own border ran inside that same box.
 */
export function penCrosses(points, rect) {
  const [rx, ry, rw, rh] = rect;
  const border = rect[4] ?? ASSUMED_BORDER;
  const radii = rect[5] ?? [0, 0, 0, 0];
  const cx = rx + rw / 2, cy = ry + rh / 2;
  for (const [px, py] of points) {
    // The signed distance to a rounded rectangle, with the radius of the quadrant the
    // point is in: negative inside, and its size is the depth below the edge.
    const r = radii[px < cx ? (py < cy ? 0 : 3) : (py < cy ? 1 : 2)];
    const qx = Math.abs(px - cx) - (rw / 2 - r);
    const qy = Math.abs(py - cy) - (rh / 2 - r);
    const d = Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r;
    if (d > 0) { if (d <= PEN_REACH) return true; continue; }
    if (-d <= border + PEN_REACH) return true;
  }
  return false;
}

/** The pen stays clear of every audited edge. */
export const clearOfEdges = (points, rects) => rects.every((r) => !penCrosses(points, r));

const gap = ([px, py], [lx, ly, lw, lh]) => Math.hypot(Math.max(lx - px, 0, px - (lx + lw)), Math.max(ly - py, 0, py - (ly + lh)));

/** The pen never runs over the word it marks. */
export function penOffLabel(points, box) {
  return points.every((p) => gap(p, box) > PEN_REACH);
}

const ENCLOSING = new Set(['ring', 'box', 'bracket']);
const within = ([ax, ay, aw, ah], [bx, by, bw, bh], m = 0.5) => ax >= bx - m && ay >= by - m && ax + aw <= bx + bw + m && ay + ah <= by + bh + m;

/**
 * THE PLATE A LABEL SITS ON, when it sits on one: the largest audited painted box that
 * holds the label with a margin and is not much bigger than it. A ring or a box drawn
 * INSIDE a plate lies along the plate's own border — there is no room between a word
 * and the edge of the tile it is printed on — so a label on a plate is marked the way
 * a teacher marks a tile on a board: round the tile. Null for a label on open paper.
 */
export function plateOf(label, rects) {
  const [lx, ly, lw, lh] = label;
  let best = null;
  for (const r of rects ?? []) {
    const [rx, ry, rw, rh] = r;
    if (!(rx <= lx - 1 && ry <= ly - 1 && rx + rw >= lx + lw + 1 && ry + rh >= ly + lh + 1)) continue;
    if (rw > lw + 70 || rh > lh + 50) continue;
    if (!best || rw * rh > best[2] * best[3]) best = r;
  }
  return best ? best.slice(0, 4).map((v) => Math.round(v * 10) / 10) : null;
}

/** What a mark on `label` may be drawn round: the word itself, then the plate under it. */
export const targetsOf = (label, rects) => [label, plateOf(label, rects)].filter(Boolean);

/**
 * WHY A MARK DOES NOT FIT, or null when it does. The one test make-marks chooses by
 * and check-marks re-derives, so the two cannot drift apart.
 *
 *   · the mark's box is on the stage, inside the band and inside the held shot;
 *   · no other word and no figure is inside the mark's box — except, for a ring, a
 *     box or brackets round a PLATE, the words printed on that plate, which is what
 *     marking the plate means;
 *   · the drawn pen stays clear of its target, of every word, and of every painted
 *     edge the audit recorded.
 */
export function markFits({ style, box, target, label, items, band, win, rects, pen }) {
  const [x, y, w, h] = box;
  const [bandT, bandB] = band;
  if (x < 2 || x + w > STAGE_W - 2 || y < bandT + 2 || y + h > bandB - 2) return 'off the band';
  if (!insideWindow(box, win)) return 'outside the shot';
  const onPlate = target !== label;
  for (const it of items) {
    if (it.b === label) continue;
    if (it.k === 'fig' && hits(box, it.b, 0)) return 'over a figure';
    if (it.k !== 'text' || !it.t) continue;
    if (onPlate && ENCLOSING.has(style) && within(it.b, target)) continue;
    if (hits(box, it.b, 1.5)) return `over "${it.t}"`;
  }
  if (!penOffLabel(pen, target)) return 'the pen runs over what it marks';
  for (const it of items) if (it.k === 'text' && it.t && !penOffLabel(pen, it.b)) return `the pen touches "${it.t}"`;
  if (!clearOfEdges(pen, rects)) return 'the pen touches a painted edge';
  return null;
}

const STOP = new Set(('the a an of and or to in on is it its it\'s that this these those what which who whom for not no nor be are was were as at by '
  + 'with from but if so all any each can do does did has have had he she they them their his her you your we our us i me my '
  + 'than then there here when where why how out up down over into onto one two three off only also just very more most much '
  + 'some such own same other again ever never yes could would should might must may will shall been being '
  + 'about because while whether without within upon those every').split(' '));

/** A label's content words: lowercase, letters and digits only, three letters or more. */
export function contentTokens(label) {
  return (String(label).toLowerCase().match(/[a-z0-9']+/g) || [])
    .map((t) => t.replace(/'/g, ''))
    .filter((t) => t.length >= 3 && !STOP.has(t));
}

const stemOf = (t) => t.replace(/(ies)$/, 'y').replace(/(ing|ed|es|s)$/, '');

/**
 * WORDS THAT CANNOT CARRY A MATCH ON THEIR OWN. Read off the matcher's own pairings:
 * `epistemology-knowledge-9` circled "fits the web" — the COHERENCE theory — while the
 * voice defined the correspondence theory, because both say "fit"; `metaphysics-being-28`
 * marked WHY MATTER EXISTS on "once matter reaches a certain level"; "Your friend" put
 * a ring round YOURS. Each is a common word in a different sense, and a mark on the
 * wrong thing is worse than no mark. These still count as a SECOND hit on a label.
 */
const WEAK = new Set(('right look fit being act matter time way thing make take give know see say good case part kind point '
  + 'place line side form view work world real just still even well back turn hold keep leave left stay show given long '
  + 'first last next new old same whole half full open close yet now your yours get set put run come go end start').split(' '));
const weak = (t) => WEAK.has(t) || WEAK.has(stemOf(t));
const numeric = (t) => /^\d+$/.test(t) || /^(one|two|three|four|five|six|seven|eight|nine|ten)$/.test(t);

/**
 * Whether a label is named by a sentence, given which of its content words were said.
 * One-word labels need a strong word; two-word labels need both, or one long strong
 * word beside a number; longer labels need two of their words.
 */
export function labelNamed(want, saidMask) {
  const hits = want.filter((_, k) => saidMask[k]);
  if (want.length === 1) return hits.length === 1 && !weak(want[0]) && want[0].length >= 4;
  if (want.length === 2) {
    if (hits.length === 2) return true;
    if (hits.length !== 1 || weak(hits[0])) return false;
    const other = want.find((t) => t !== hits[0]);
    return hits[0].length >= 6 || (hits[0].length >= 4 && numeric(other));
  }
  return hits.length >= 2;
}

/** One word of the narration and one of a label name the same thing. */
export function sameStem(said, want) {
  if (!said || !want) return false;
  if (said === want) return true;
  const a = stemOf(said), b = stemOf(want);
  if (a.length < 3 || b.length < 3) return false;
  return a === b || (a.length >= 4 && b.length >= 4 && (a.startsWith(b) || b.startsWith(a)) && Math.abs(a.length - b.length) <= 2);
}

/** Every string value inside a block, however deeply it nests. */
function stringsOf(v, out = []) {
  if (typeof v === 'string') out.push(v);
  else if (Array.isArray(v)) v.forEach((x) => stringsOf(x, out));
  else if (v && typeof v === 'object') Object.values(v).forEach((x) => stringsOf(x, out));
  return out;
}

/** The question a beat asks, whichever shape it takes, or null. */
export const questionOf = (b) => (b && (b.interact || b.mc || b.tap)) || null;

/**
 * GROUP O, NARROWLY. The words that point at a question's ANSWER: everything its
 * options, readings and explanation say, less what its prompt already says. A mark on
 * the beat before a question may point at the SUBJECT the prompt names — the narration
 * is about it anyway — and never at a label that is, or names, one of the answers.
 * Every option counts, right and wrong, because a mark on any of them is a hint about
 * which ones matter.
 */
export function answerWords(q) {
  if (!q) return [];
  const prompt = contentTokens(q.prompt || '');
  const rest = stringsOf({ ...q, prompt: '' }).flatMap(contentTokens);
  return [...new Set(rest)].filter((t) => !prompt.some((p) => sameStem(p, t)));
}

/**
 * The beats whose SCENE did not change from the beat before: every channel but the
 * figure's own pose and x holds its value. A channel missing on one beat and present
 * on the next counts as changed, because the scene reads `b.ch ?? default` and the
 * default need not be what the other beat says.
 */
export function frozenBeats(beats, poseField) {
  const keys = new Set();
  for (const b of beats) for (const k of Object.keys(b)) if (!PROSE.has(k) && k !== poseField && k !== 'x') keys.add(k);
  const out = [];
  for (let i = 1; i < beats.length; i += 1) {
    const same = [...keys].every((k) => JSON.stringify(beats[i - 1][k] ?? null) === JSON.stringify(beats[i][k] ?? null));
    if (same) out.push(i);
  }
  return out;
}

/** For each lesson, the beats data/lessonThoughts.ts shows a bubble on. */
export function thoughtBeats(src) {
  const out = {};
  for (const m of src.matchAll(/^ {2}'([a-z0-9-]+)': \{\n {4}at: \[(.*)\],$/gm)) {
    const cells = m[2].split(/,(?![^[]*\])/).map((s) => s.trim());
    out[m[1]] = new Set(cells.flatMap((c, i) => (c.startsWith('[') ? [i] : [])));
  }
  return out;
}

/**
 * WHAT THE CAMERA SHOWS ON BEAT `i`, the way make:thoughts models it — and for the same
 * reason: a beat with no tour of its own that is not a question does not move the
 * camera, CinematicPlayer HOLDS the shot it was drawing, so a mark placed for the beat's
 * own resting frame can sit off the picture (epistemology-knowledge-7 did that to a
 * thought bubble). Returns `{ toured }` for a beat whose camera travels — a mark is not
 * laid over a moving shot — or the window, or null for a scene with no camera, which
 * shows its whole band.
 */
export function cameraWindow({ id, i, beats, tours, boxes, band, cameraOn, windowOf, ground = 500 }) {
  if (!cameraOn) return null;
  const graded = (k) => !!questionOf(beats[k]);
  const toured = (k) => !graded(k) && (tours?.[id]?.[k]?.length ?? 0) > 0;
  const mustWin = (k) => (boxes?.[id]?.[k] ? windowOf(boxes[id][k], band, ground) : null);
  const leaves = (k) => {
    if (toured(k)) {
      const t = tours[id][k];
      const last = t[t.length - 1];
      return windowOf(last.length === 10 ? last.slice(6, 10) : last.slice(0, 4), band, ground);
    }
    if (k === 0 || graded(k)) return mustWin(k);
    return leaves(k - 1);
  };
  if (toured(i)) return { toured: true };
  return i === 0 || graded(i) ? mustWin(i) : leaves(i - 1);
}

/** A mark box lies wholly inside a camera window, with a unit of margin. */
export const insideWindow = ([x, y, w, h], win) => !win
  || (x >= win.left + 1 && x + w <= win.right - 1 && y >= win.top + 1 && y + h <= win.bottom - 1);

/** A scene's declared band, `[top, bottom]` in stage units, or null. */
export function bandOf(sceneFile) {
  if (!fs.existsSync(sceneFile)) return null;
  const m = fs.readFileSync(sceneFile, 'utf8').match(/band=\{\[\s*(-?\d+)\s*,\s*(-?\d+)\s*\]\}/);
  return m ? [Number(m[1]), Number(m[2])] : null;
}
