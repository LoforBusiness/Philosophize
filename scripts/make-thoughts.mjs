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
  const c = COMP.get(id);
  if (!c) return null;
  const base = `${c[0].toLowerCase()}${c.slice(1).replace(/Lesson$/, '')}Scene.tsx`;
  for (const f of [base, `${c}.tsx`]) {
    const p = path.join(DIR, f);
    if (!fs.existsSync(p)) continue;
    const m = fs.readFileSync(p, 'utf8').match(/band=\{\[\s*(-?\d+)\s*,\s*(-?\d+)\s*\]\}/);
    if (m) return [+m[1], +m[2]];
  }
  return [0, 560];
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
for (const l of corpus()) {
  GRADED.set(l.id, l.beats.map((b) => !!b.graded));
  NBEATS.set(l.id, l.beats.length);
}

const hit = (a, b) => a[0] < b[0] + b[2] && b[0] < a[0] + a[2] && a[1] < b[1] + b[3] && b[1] < a[1] + a[3];

/**
 * The best place for a box of this size on this beat.
 *
 * Two passes: fully clear first, then clear of WORDS only (D31). Within each, the
 * tail creeps up from just above his crown and the box slides left and right — so
 * the answer is always the one nearest his head that works, and "directly above,
 * touching" wins whenever it is available.
 */
function place(items, w, h, bandTop, at) {
  // WHOSE HEAD. Normally the union of the figure boxes — but on a beat where the
  // SECOND figure has walked in there are two of them, and a union puts the
  // bubble in the space between two people rather than over either. So the caller
  // can name the head it means, and the visitor's is taken from his own cue.
  let cx; let crown;
  if (at) {
    cx = at.cx; crown = at.crown;
  } else {
    const figs = items.filter((it) => it.k === 'fig');
    if (!figs.length) return null;
    const fx0 = Math.min(...figs.map((f) => f.b[0]));
    const fx1 = Math.max(...figs.map((f) => f.b[0] + f.b[2]));
    crown = Math.min(...figs.map((f) => f.b[1]));
    cx = (fx0 + fx1) / 2;
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
                cost, x: rx, headX: Math.round(cx),
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

let clear = 0; let overArt = 0; let nowhere = 0; let visLines = 0; const rows = [];
for (const [id, beats] of Object.entries(J.words)) {
  const band = bandOf(id);
  if (!band) continue;
  const graded = GRADED.get(id) || [];
  const said = SAY[id] || [];
  const at = [];
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
    const p = place(items, BOX_W, h, band[0]);
    if (!p) { at.push(null); nowhere += 1; continue; }
    at.push([p.x, p.tailY, p.discs, p.headX]);
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

console.log(`${rows.length} lessons`);
console.log(`  ${clear} bubble(s) sit in fully clear space`);
console.log(`  ${overArt} sit over ART but never over a word (D31)`);
console.log(`  ${nowhere} beat(s) have nowhere at all and show none`);
console.log(`  ${visLines} second figures say something as they walk in`);
if (!DRY) { fs.writeFileSync(OUT, out); console.log(`\nwrote ${OUT}`); }
