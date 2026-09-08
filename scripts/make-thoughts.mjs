// ─────────────────────────────────────────────────────────────────────────────
// WHERE THE THOUGHT BUBBLE CAN SIT WITHOUT COVERING THE PICTURE
//
//   node scripts/make-thoughts.mjs            write data/lessonThoughts.ts
//   node scripts/make-thoughts.mjs --dry      report, change nothing
//
// The reader asked for bubbles over the mascot's head and named the one thing
// that would ruin them: *"not for it to be a huge thing that covers anything."*
// The first version placed them at a fixed height above his crown and did exactly
// that — on `ethics21` the bubble landed across the PAIN GONE plate, because that
// lesson's art runs from y 224 down to 394 and his crown is at 393.
//
// So placement is MEASURED, the way `make:visitor` measures the floor before it
// puts a second figure on it. `mustBoxes` already records every item every beat
// draws; this asks the same question upward.
//
// ── THE RULE IS D31, AND IT IS WHAT MAKES THIS POSSIBLE AT ALL ──────────────
//
// Held to "clear of everything", a 130-wide bubble has nowhere to go in **41 of
// 186 lessons** — these stages are full, which is the whole point of the tonal
// mass pass. Held to D31 — *"nothing painted over a word is acceptable, including
// the app's own decoration"* — and allowed to sit over ART, it fails in **13**.
//
// That is the right line rather than a convenient one. A word covered for two
// seconds is a word the reader does not get; a corner of a diagram behind a small
// opaque box is the same thing every comic has always done. The generator still
// PREFERS a fully clear spot and only spends the licence when it must, so the
// compromise is taken 51 times rather than 165.
//
// ── AND THE HEIGHT IS PER BEAT, BECAUSE THE TEXT IS ─────────────────────────
//
// A one-row thought needs 34 units and a two-row one needs 48, and the difference
// is worth 11 lessons. So this wraps the REAL string against the real Inter `.ttf`
// at the real size and places the box that beat will actually draw — including
// the answer line, which `quipFor` makes deterministic, so the exact words are
// known here before the reader has answered.
//
// ── IT KEEPS THE WORDS ──────────────────────────────────────────────────────
//
// `say` is AUTHORED and `at` is GENERATED, in one file. A generator that rewrites
// the file must therefore read what is already there and put it back, or a
// placement run silently deletes a corpus of writing. `make:wardrobe` learned the
// same lesson from the other end: a synthetic value left in place across runs
// decides its own next value.
// ─────────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';
import path from 'node:path';
import { loadFont, wrap } from './lib/ttfwidth.mjs';
import { corpus } from './lib/gestures.mjs';
import { loadTs } from './lib/loadts.mjs';
import { loadRig, skullRise } from './lib/loadrig.mjs';
import { sceneOf, walkOf, scaleOf, crownOf } from './lib/scenefig.mjs';

const DRY = process.argv.includes('--dry');
const DIR = 'components/lesson/cinematic';
const OUT = 'data/lessonThoughts.ts';

const J = JSON.parse(fs.readFileSync(`${DIR}/mustBoxes.ts.json`, 'utf8'));
const INTER = loadFont('node_modules/@expo-google-fonts/inter/500Medium/Inter_500Medium.ttf');

// ── the box, read out of the component so the two cannot drift ──────────────
const KIT = fs.readFileSync(`${DIR}/cinematicKit.tsx`, 'utf8');
const pick = (re) => { const m = KIT.match(re); if (!m) throw new Error(`cannot read ${re}`); return parseFloat(m[1]); };
const BOX_W = pick(/const THINK_W = ([\d.]+);/);
const PAD = pick(/thoughtBox:\s*\{[^}]*paddingHorizontal:\s*([\d.]+)/s);
const VPAD = pick(/thoughtBox:\s*\{[^}]*paddingVertical:\s*([\d.]+)/s);
const BORDER = pick(/thoughtBox:\s*\{[^}]*borderWidth:\s*([\d.]+)/s);
const SIZE = pick(/thoughtText:\s*\{[^}]*fontSize:\s*([\d.]+)/s);
const LH = pick(/thoughtText:\s*\{[^}]*lineHeight:\s*([\d.]+)/s);
const INNER = BOX_W - 2 * PAD - 2 * BORDER - 1;
// HOW FAR SIDEWAYS THE BOX MAY SIT AND STILL BE HIS (AB12).
//
// `logic-arguments-21` beat 6 placed a thought 154 units to his left while he
// walked 136 units to the right, so the box drifted the OTHER WAY across a third
// of the stage from the man it belonged to.
//
// STATED IN THE COMPONENT AND READ HERE, not inferred from its trail geometry.
// It used to be derived from the clamp expression, and that broke twice over:
// the speech bubble one component up writes the identical clamp with a different
// constant, so an unanchored pattern answered 20 where the truth was 14 — and
// then the trail started FANNING its discs and stopped having a single number to
// read at all.
const DRIFT = pick(/export const THINK_DRIFT = ([\d.]+);/);
// Box bottom → the smallest disc, for a trail of three, two or one.
//
// THE TRAIL IS A FREE PARAMETER, and treating it as fixed cost thirteen lessons.
// `logic-arguments-3` leaves 48 units between its VALID MEANS block and his
// crown; a one-row box and a full trail need 62, and a one-row box with a single
// disc needs 41. Shortening the trail is a smaller loss than showing nothing.
const TRAILS = [
  { discs: 3, h: 3 + 9 + 2.5 + 6.5 + 2.5 + 4 },
  { discs: 2, h: 3 + 6.5 + 2.5 + 4 },
  { discs: 1, h: 3 + 4 },
];

const boxH = (text) => {
  const rows = wrap(text, SIZE, INNER, INTER).length;
  return { rows, h: rows * LH + 2 * VPAD + 2 * BORDER };
};

// ── the bands, per lesson ───────────────────────────────────────────────────
const route = fs.readFileSync('app/(app)/branches/[branchSlug]/[pathSlug]/lesson/[lessonId].tsx', 'utf8');
const COMP = new Map([...route.matchAll(/^\s*'([a-z0-9-]+)':\s*(\w+),/gm)].map((m) => [m[1], m[2]]));
function bandOf(id) {
  const s = sceneOf(id);
  if (s === null) return null;
  const m = s.match(/band=\{\[\s*(-?\d+)\s*,\s*(-?\d+)\s*\]\}/);
  return m ? [+m[1], +m[2]] : [0, 560];
}

// ── what is already authored ────────────────────────────────────────────────
function existingSay() {
  if (!fs.existsSync(OUT)) return {};
  const src = fs.readFileSync(OUT, 'utf8');
  const out = {};
  for (const m of src.matchAll(/'([a-z0-9-]+)':\s*\{[\s\S]*?say:\s*\[([\s\S]*?)\],\s*\},/g)) {
    out[m[1]] = [...m[2].matchAll(/null|'((?:\\.|[^'\\])*)'/g)]
      .map((q) => (q[0] === 'null' ? null : q[1].replace(/\\'/g, "'")));
  }
  return out;
}
const SAY = existingSay();

// ── the graded beats, so the answer line can be placed too ──────────────────
// The quip pool is loaded rather than re-typed, so the words this places a box
// for are the exact words the player will draw. quips.ts has zero imports for
// precisely this reason.
const { quipFor, visitorSays } = await loadTs('components/lesson/cinematic/quips.ts');
const { VISITOR } = await loadTs('data/lessonVisitor.ts');
/** A standing figure's crown, with the ground at 500 — measured, not quoted. */
const CROWN = 397;
const GRADED = new Map();
// AND HOW MANY BEATS THE SCRIPT HAS, which is not how many were MEASURED: the
// summary hides the stage, so `mustBoxes` holds one row fewer. Emitting the
// measured count truncated every authored array by one and left `check:thoughts`
// reporting eighty-six rows out of step with their own lesson.
const NBEATS = new Map();
const CODES = new Map();
for (const l of corpus()) {
  GRADED.set(l.id, l.beats.map((b) => !!b.graded));
  NBEATS.set(l.id, l.beats.length);
  CODES.set(l.id, l.beats.map((b) => b.code));
}

// Where his head is, per pose code — the rig's own answer rather than the union
// of his limbs. Cached, because 198 lessons reach for about a hundred codes.
const { RIG, MOVES } = await loadRig();
const RISE = new Map();
const riseOf = (code) => {
  if (!RISE.has(code)) RISE.set(code, skullRise(RIG, MOVES, code));
  return RISE.get(code);
};
/** How far above the bare figure the costume reaches, per lesson (make:wardrobe). */
const HAT = J.wardrobeReach || {};

const hit = (a, b) => a[0] < b[0] + b[2] && b[0] < a[0] + a[2] && a[1] < b[1] + b[3] && b[1] < a[1] + a[3];

/**
 * The best place for a box of this size on this beat.
 *
 * Two passes: fully clear first, then clear of WORDS only (D31). Within each, the
 * tail creeps up from just above his crown and the box slides left and right — so
 * the answer is always the one nearest his head that works, and "directly above,
 * touching" wins whenever it is available.
 */
function place(items, w, h, bandTop, at, mx, head) {
  // WHOSE HEAD, AND WHERE THE TOP OF IT IS — `crownOf`, shared with the check
  // that re-derives this. The caller can name it outright instead: the second
  // figure's line is placed against his own cue, because a union puts the bubble
  // in the air between two people rather than over either.
  //
  // THE TOP OF HIS BOX IS NOT THE TOP OF HIS HEAD, and anchoring on it is what
  // the reader saw. The box is the union of one figure's LIMB Views, so a beat
  // where he lifts a hand, points, or wears a hat reports a top a median of
  // fourteen units above his skull and as much as ninety. Hung four units above
  // THAT, the bubble floats a head's height clear of him: *"they seem to be
  // really far up above the stickman."*
  //
  // The bubble is drawn after the scene, so where his own raised arm crosses it
  // the bubble is in front — which is what every comic has always done, and the
  // opposite of the fault, because an arm through a balloon reads as depth while
  // a balloon parked in empty paper reads as a mistake.
  let cx; let crown;
  if (at) {
    cx = at.cx; crown = at.crown;
  } else {
    const c = crownOf(items.filter((it) => it.k === 'fig'), mx, head.rise, head.hat);
    if (!c) return null;
    ({ cx, crown } = c);
  }
  // ── THE TRADE IS SCORED, NOT NESTED ───────────────────────────────────────
  //
  // Loop order is a way of expressing a preference and it kept expressing the
  // wrong one. Trail outermost walked the bubble 120 units sideways into the
  // middle of an argument card. Mode outermost preferred a FULLY CLEAR spot
  // eighty-four units above his crown to one four units above it that grazed a
  // diagram — and eighty-four units of blank paper between the last disc and his
  // head reads as a caption that has come loose, which is the one thing the
  // bubble must never look like.
  //
  // So every candidate is costed and the cheapest wins. The weights say, in
  // order: never cover a word (that is not costed, it is excluded); stay near his
  // head, vertically about twice as much as sideways; prefer not to sit on art;
  // keep the trail long. They are stated here rather than implied by nesting so
  // that changing the priority is one number rather than a re-shuffle.
  const OVER_ART = 26;
  const SHORT_TRAIL = 6;
  let best = null;
  for (const mode of ['all', 'text']) {
    const block = items.filter((it) => it.k !== 'fig' && (mode === 'all' || it.k === 'text'));
    for (let up = 4; up <= 96; up += 4) {
      for (let d = 0; d <= 120; d += 6) {
        for (const sx of d === 0 ? [0] : [-d, d]) {
          const bx = cx + sx - w / 2;
          if (bx < 6 || bx + w > 394) continue;
          for (const t of TRAILS) {
            // ROUND FIRST, THEN TEST. The table stores integers and the first
            // version validated the unrounded position and rounded it on the way
            // out — which moved the box by up to half a unit AFTER it had been
            // cleared, and `check:thoughts` duly found eleven bubbles grazing a
            // word by four tenths of a unit. A measurement is only as good as the
            // number that actually gets written down.
            const tailY = Math.round(crown - up);
            const rx = Math.round(cx + sx);
            const bxr = rx - w / 2;
            const top = tailY - t.h - h;
            if (top < bandTop + 2) continue;
            if (block.some((it) => hit([bxr, top, w, h], it.b))) continue;
            const cost = up * 2 + Math.abs(sx)
              + (mode === 'text' ? OVER_ART : 0) + (3 - t.discs) * SHORT_TRAIL;
            if (!best || cost < best.cost) {
              best = {
                cost, up, x: rx, headX: Math.round(cx),
                tailY, discs: t.discs, over: mode === 'text',
              };
            }
          }
        }
      }
    }
  }
  if (best) return best;
  return null;
}

// ── HOW MANY OF THEM A READER ACTUALLY MEETS ────────────────────────────────
//
// The first version drew one on every beat that had a line, which came to 1,113
// bubbles — HALF of all 2,237 beats — and the reader said what that is like:
// *"it appears way too much … I don't want it every single tab."*
//
// So the words stay and the SHOWING is rationed. `say` still holds every line
// that was authored, because the writing is the expensive half and the choosing
// is the cheap one — a line that is not drawn today can be drawn tomorrow by
// changing a weight here, where re-authoring it could not. What decides is `at`:
// no placement, no bubble, which is a rule the player already obeyed.
//
// TWO THINGS ARE SCORED AND THE SECOND ONE IS NOT OBVIOUS. Which beat gets a
// bubble is mostly a question of where the bubble can SIT — the reader's other
// complaint was that they *"seem to be really far up above the stickman"*, and
// with six candidates and two slots the generator can simply decline the ones
// that float. And the pair has to be SPREAD: two bubbles three beats apart in an
// eleven-beat lesson is the same complaint in miniature, so a pair is scored on
// where it falls as well as on how it sits.
const SHOW = 2;
/** Beats apart, minimum. Two in a row reads as the bubble being back on. */
const MIN_GAP = 2;
/**
 * Above this many units clear of his head, a bubble reads as a caption rather
 * than as his: the head is 40 across, so half a head of empty paper between the
 * last disc and his skull is the point at which the trail stops connecting them.
 * A THOUGHT above it is declined outright — there are other beats. An answer LINE
 * cannot be declined (it is a reply to something the reader just did) so it is
 * only counted and printed.
 */
const FLOAT = 20;
/** Where in the lesson the pair wants to land, as a fraction of its beats. */
const IDEAL = [0.3, 0.75];
const SPREAD_W = 34;
/**
 * A graded beat draws the ANSWER line, and the beat beside one is a bad
 * neighbour: think, tap, reply is three bubbles running. Same for the beat the
 * second figure walks in on, where he already has a line up.
 */
const NEIGHBOUR = 30;

function choosePair(all, n, busy) {
  // A thought that can only be hung a long way clear of his head is not shown at
  // all. That is the whole licence the rationing buys: with five candidates and
  // two slots there is no reason to spend one on the bad placement, and "no
  // bubble" reads as him listening while a floating one reads as a fault.
  const cands = all.filter((c) => c.up <= FLOAT && c.side <= DRIFT);
  if (!cands.length) return [];
  const near = (i) => (busy.some((b) => Math.abs(b - i) <= 1) ? NEIGHBOUR : 0);
  const at = (i) => (n > 1 ? i / (n - 1) : 0);
  if (cands.length === 1) return [cands[0].i];
  let best = null;
  for (let a = 0; a < cands.length; a += 1) {
    for (let b = a + 1; b < cands.length; b += 1) {
      if (cands[b].i - cands[a].i < MIN_GAP) continue;
      const s = cands[a].cost + cands[b].cost + near(cands[a].i) + near(cands[b].i)
        + SPREAD_W * (Math.abs(at(cands[a].i) - IDEAL[0]) + Math.abs(at(cands[b].i) - IDEAL[1]));
      if (!best || s < best.s) best = { s, pair: [cands[a].i, cands[b].i] };
    }
  }
  // Every candidate crowded into a run shorter than MIN_GAP: show the best one
  // rather than none, since one thought is still him working it out.
  if (!best) return [cands.reduce((p, q) => (p.cost + near(p.i) < q.cost + near(q.i) ? p : q)).i];
  return best.pair;
}

let clear = 0; let overArt = 0; let nowhere = 0; let visLines = 0; let shown = 0; let held = 0;
const ups = []; const sides = []; const replyUps = []; const rows = []; const floaters = []; const perLesson = [];
for (const [id, beats] of Object.entries(J.words)) {
  const band = bandOf(id);
  if (!band) continue;
  const graded = GRADED.get(id) || [];
  const said = SAY[id] || [];
  const walk = await walkOf(id);
  const codes = CODES.get(id) || [];
  const k = scaleOf(id);
  const hat = (HAT[id]?.up ?? 0);
  const at = [];
  const cands = [];
  for (const [i, items] of beats.entries()) {
    // What this beat would actually draw: his thought, or — on a graded beat —
    // the longer of the two answer lines it could land on.
    let text = null;
    if (graded[i]) {
      const a = quipFor(id, i, true);
      const b = quipFor(id, i, false);
      text = boxH(a).h >= boxH(b).h ? a : b;
    } else if (said[i]) text = said[i];
    if (!text) { at.push(null); continue; }
    const { h } = boxH(text);
    // The band is passed IN, because a box above its top edge is not subtle, it
    // is gone (H59) — and checking it afterwards would throw away a placement a
    // shorter trail could have saved.
    const p = place(items, BOX_W, h, band[0], null, walk ? walk[i] : undefined,
      { rise: riseOf(codes[i]) * k, hat });
    if (!p) { at.push(null); nowhere += 1; continue; }
    at.push([p.x, p.tailY, p.discs, p.headX]);
    // The answer line is not rationed — it is his reply to something the reader
    // did, it arrives only on the two graded beats, and it is the half of this
    // the reader asked for by name. Only the running commentary is chosen from.
    if (!graded[i]) cands.push({ i, cost: p.cost, up: p.up, side: Math.abs(p.x - p.headX) });
    else {
      replyUps.push(p.up);
      if (p.up > FLOAT) floaters.push(`${id}[${i}] ${p.up} up`);
    }
    if (p.over) overArt += 1; else clear += 1;
  }
  // ── AND THE SECOND FIGURE, ON THE BEAT HE ARRIVES ────────────────────────
  //
  // He never speaks on the QUESTION beat (group O) — a second figure staking a
  // claim while the reader is still choosing is a hint wearing a hat — so his one
  // line lands as he walks in, which is also when a reader is looking at him.
  let vis = null;
  const cue = VISITOR[id];
  if (cue && beats[cue.enter]) {
    const { h } = boxH(visitorSays(id));
    const p = place(beats[cue.enter], BOX_W, h, band[0], { cx: cue.x, crown: CROWN });
    if (p) { vis = [cue.enter, p.x, p.tailY, p.discs]; visLines += 1; }
  }
  // ── AND NOW THE RATIONING, LAST, SO EVERY CANDIDATE WAS COSTED FIRST ─────
  //
  // The busy beats are the ones already carrying a box: the two graded beats
  // draw the answer line, and the entrance beat draws the visitor's.
  const busy = [...at.keys()].filter((i) => graded[i] && at[i]);
  if (vis) busy.push(vis[0]);
  const keep = new Set(choosePair(cands, at.length, busy));
  for (const c of cands) {
    if (keep.has(c.i)) { shown += 1; ups.push(c.up); sides.push(c.side); } else { at[c.i] = null; held += 1; }
  }
  perLesson.push(keep.size);
  rows.push({ id, at, say: said, vis, n: NBEATS.get(id) ?? beats.length });
}

const body = rows.map((r) => {
  const at = Array.from({ length: r.n }, (_, i) => {
    const a = r.at[i];
    return a ? `[${a[0]}, ${a[1]}, ${a[2]}, ${a[3]}]` : 'null';
  }).join(', ');
  const say = Array.from({ length: r.n }, (_, i) => {
    const s = r.say[i];
    return s ? `'${s.replace(/'/g, "\\'")}'` : 'null';
  }).join(', ');
  const vis = r.vis ? `\n    vis: [${r.vis.join(', ')}],` : '';
  return `  '${r.id}': {\n    at: [${at}],\n    say: [${say}],${vis}\n  },`;
}).join('\n');

const HEAD = fs.readFileSync(OUT, 'utf8').split('export const THOUGHTS')[0];
const out = `${HEAD}export const THOUGHTS: Record<string, LessonThoughts> = {\n${body}\n};\n`;

const stat = (A) => {
  const s = [...A].sort((a, b) => a - b);
  const q = (p) => (s.length ? s[Math.floor(s.length * p)] : 0);
  return `median ${q(0.5)}  p90 ${q(0.9)}  worst ${s[s.length - 1] ?? 0}`;
};
console.log(`${rows.length} lessons`);
console.log(`  ${shown} thought(s) shown — ${(shown / rows.length).toFixed(2)} a lesson, of ${shown + held} authored`);
console.log(`  a thought's tail clears his head by:   ${stat(ups)}`);
console.log(`  and sits sideways of it by:           ${stat(sides)}  (a trail leans ${DRIFT.toFixed(0)})`);
console.log(`  an answer line's, which cannot move:   ${stat(replyUps)}`);
console.log(`  ${floaters.length} answer line(s) more than ${FLOAT} clear of his head${floaters.length ? `: ${floaters.slice(0, 3).join(' · ')}` : ''}`);
console.log(`  thoughts a lesson: ${[0, 1, 2].map((n) => `${perLesson.filter((v) => v === n).length}×${n}`).join(' · ')}`);
console.log(`  ${clear} placement(s) sit in fully clear space`);
console.log(`  ${overArt} sit over ART but never over a word (D31)`);
console.log(`  ${nowhere} beat(s) have nowhere at all and show none`);
console.log(`  ${visLines} second figures say something as they walk in`);
if (!DRY) { fs.writeFileSync(OUT, out); console.log(`\nwrote ${OUT}`); }
