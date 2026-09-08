// ─────────────────────────────────────────────────────────────────────────────
// THE THOUGHT BUBBLE — DOES IT FIT, AND IS IT IN CHARACTER?
//
//   npm run check:thoughts
//
// A reader asked for bubbles above the mascot's head and was specific about the
// one thing that would ruin them: *"I don't want them to be huge. Nothing like
// big paragraphs … pretty short in the words"*, and *"not for it to be a huge
// thing that covers anything."* Both halves are measurable, and neither is
// measurable by counting characters.
//
// **A CHARACTER COUNT IS NOT A WIDTH**, which §7 already paid to learn on the
// reward cloud: in Inter 12.5 "Wittgenstein" is 78px and "illiterate," is 51, so
// a rule counted in characters either lets a line overflow or forbids a good one.
// Every line here is measured against the real advance widths out of the real
// `.ttf`, at the real size, in the real box — in plain Node, so it costs
// milliseconds rather than a Metro and a browser.
// ─────────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';
import path from 'node:path';
import { loadFont, wrap } from './lib/ttfwidth.mjs';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\//, '')), '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');

let fails = 0;
const ok = (m, d = '') => console.log(`  ok    ${m}${d ? `  ${d}` : ''}`);
const bad = (m, d = '') => { fails += 1; console.log(`  FAIL  ${m}${d ? `  ${d}` : ''}`); };

console.log('\nTHE THOUGHT BUBBLE\n');

// ── the box, read out of the component rather than retyped ──────────────────
//
// The same rule `check:streak` applies to the stamp's legend and `check:ui` to
// SETTLE_MS: a pair of numbers in two files where only one can be changed is a
// pair that drifts. If somebody widens the bubble, this check widens with it.
const KIT = read('components/lesson/cinematic/cinematicKit.tsx');
const num = (re, what) => {
  const m = KIT.match(re);
  if (!m) { bad(`could not read ${what} out of cinematicKit`); return null; }
  return parseFloat(m[1]);
};
const BOX_W = num(/const THINK_W = ([\d.]+);/, 'THINK_W');
const PAD = num(/thoughtBox:\s*\{[^}]*paddingHorizontal:\s*([\d.]+)/s, 'the bubble padding');
const SIZE = num(/thoughtText:\s*\{[^}]*fontSize:\s*([\d.]+)/s, 'the bubble font size');
const BORDER = num(/thoughtBox:\s*\{[^}]*borderWidth:\s*([\d.]+)/s, 'the bubble border');
const VPAD = num(/thoughtBox:\s*\{[^}]*paddingVertical:\s*([\d.]+)/s, 'the bubble padding');
const LH = num(/thoughtText:\s*\{[^}]*lineHeight:\s*([\d.]+)/s, 'the bubble line height');
if (BOX_W === null || PAD === null || SIZE === null || BORDER === null) process.exit(1);

// 1px of headroom, for the reason the offline text-fit check records: a line that
// measures EXACTLY its box wraps somewhere else on a real engine.
const INNER = BOX_W - 2 * PAD - 2 * BORDER - 1;
console.log(`  the box is ${BOX_W} wide · ${INNER.toFixed(1)} of room for words at ${SIZE}px\n`);

const INTER = loadFont('node_modules/@expo-google-fonts/inter/500Medium/Inter_500Medium.ttf');

/** Quoted strings out of a TS array, comments stripped (L8). */
function strings(src, name) {
  const block = src.match(new RegExp(`${name}[^=]*=\\s*\\[([\\s\\S]*?)\\];`));
  if (!block) return null;
  const clean = block[1].replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/[^\n]*/g, '$1');
  return [...clean.matchAll(/(['"])((?:\\.|(?!\1)[^\\])*)\1/g)].map((m) => m[2]);
}

const QUIPS = read('components/lesson/cinematic/quips.ts');
const RIGHT = strings(QUIPS, 'RIGHT');
const WRONG = strings(QUIPS, 'WRONG');
if (!RIGHT || !WRONG) { bad('could not read the quip pools'); process.exit(1); }

// ── 1 · TWO LINES, NEVER THREE ──────────────────────────────────────────────
//
// The bubble hangs above his head with a trail of discs under it, so a third row
// does not push anything down — it grows UP, toward the top of the band, which is
// the same arithmetic §7 records for the reward cloud being anchored at its
// bottom. Two rows clear every band measured; three do not.
const MAX_ROWS = 2;
const tall = [];
const widest = { line: '', w: 0 };
for (const line of [...RIGHT, ...WRONG]) {
  const rows = wrap(line, SIZE, INNER, INTER);
  for (const r of rows) {
    const w = INTER.width(r, SIZE);
    if (w > widest.w) { widest.w = w; widest.line = r; }
  }
  if (rows.length > MAX_ROWS) tall.push(`"${line}" wraps to ${rows.length}`);
}
if (!tall.length) {
  ok(`all ${RIGHT.length + WRONG.length} answer lines fit ${MAX_ROWS} rows`,
    `widest row "${widest.line}" at ${widest.w.toFixed(0)} of ${INNER.toFixed(0)}`);
} else {
  bad(`${tall.length} answer line(s) need a third row`, tall.slice(0, 4).join(' · '));
}

// ── 2 · THE JOKE IS ON THE ANSWER, NOT THE ANSWERER ─────────────────────────
//
// §7's rule, carried into a fourth pool: he needles the CHOICE, the question or
// himself. This is the one check here that is about the product rather than the
// layout, and it is deliberately crude — it cannot read tone, so it holds the one
// thing that is unambiguous: a wrong-answer line may not address the reader's own
// mind. "You are not thinking" passes every width test ever written.
const AT_THE_READER = /\b(you('re| are)?\s+(wrong|slow|bad|lost|confused|not)|your\s+(brain|head|mind|fault)|idiot|stupid|silly|clueless|hopeless|obviously you|try harder|pay attention|do better|come on)\b/i;
const mean = WRONG.filter((l) => AT_THE_READER.test(l));
if (!mean.length) ok(`no wrong-answer line is aimed at the reader (§7)`, `${WRONG.length} lines`);
else bad(`${mean.length} wrong-answer line(s) needle the reader, not the answer`, mean.slice(0, 3).join(' · '));

// ── 3 · A POOL THAT REPEATS IS NOT A CHARACTER ──────────────────────────────
//
// §7: count per BUCKET, not per file. A reader who is getting things right only
// ever draws from RIGHT, so the pool that matters is the one they are in.
const FLOOR = 12;
for (const [name, pool] of [['RIGHT', RIGHT], ['WRONG', WRONG]]) {
  const uniq = new Set(pool);
  if (uniq.size !== pool.length) bad(`${name} repeats a line`, `${pool.length - uniq.size} duplicate(s)`);
  else if (pool.length < FLOOR) bad(`${name} holds only ${pool.length}`, `floor ${FLOOR}`);
  else ok(`${name} holds ${pool.length} distinct lines`, `floor ${FLOOR}`);
}

// ── 4 · AND THE PICK IS DERIVED, NOT RANDOM ─────────────────────────────────
//
// The same reader coming back to the same lesson must meet the same character
// rather than two of them. `Math.random` in this file would be invisible until
// somebody noticed the mascot had no memory.
if (/Math\.random/.test(QUIPS)) bad('quips.ts reaches for Math.random');
else ok('the line is derived from the lesson and the beat, never random');

// ── 5 · ZERO IMPORTS, SO THIS CHECK CAN EXIST AT ALL ────────────────────────
if (/^\s*import\s/m.test(QUIPS)) bad('quips.ts has grown an import', 'it must stay readable in plain Node');
else ok('quips.ts still has zero imports');

// ── 6 · THE 1,041 AUTHORED THOUGHTS, WHICH NOTHING WAS CHECKING ─────────────
//
// The pools above are 32 lines and were checked from the first commit. The
// thoughts are a thousand, written by hand over a long sitting, and every failure
// mode the pools have they have thirty times over.
const { loadTs } = await import('./lib/loadts.mjs');
const { corpus } = await import('./lib/gestures.mjs');
const { THOUGHTS } = await loadTs('data/lessonThoughts.ts');
const LESSONS = corpus();

const tall2 = [];
const onGraded = [];
const mismatched = [];
const orphaned = [];
let lines = 0;

for (const l of LESSONS) {
  const row = THOUGHTS[l.id];
  if (!row) continue;
  // A row whose length has drifted from the script is a row whose every index is
  // pointing at the wrong beat — J9's stale "the trap is B", one table over.
  if (row.say.length !== l.beats.length) {
    mismatched.push(`${l.id}: ${row.say.length} entries for ${l.beats.length} beats`);
    continue;
  }
  for (const [i, text] of row.say.entries()) {
    if (!text) continue;
    lines += 1;
    if (wrap(text, SIZE, INNER, INTER).length > MAX_ROWS) tall2.push(`${l.id}[${i}] "${text}"`);
    // GROUP O. A thought over his head while the reader is still choosing is a
    // hint at best. The player refuses to draw one and the generator refuses to
    // place one; this refuses to let one be WRITTEN, so the three cannot drift.
    if (l.beats[i].graded) onGraded.push(`${l.id}[${i}]`);
    // A thought with no placement never reaches the screen. That is now the
    // NORMAL case rather than a shortfall: `make:thoughts` shows two a lesson and
    // leaves the rest of the writing on the shelf, so this counts rather than
    // complains. Section 8 is what holds the number.
    if (!row.at[i]) orphaned.push(`${l.id}[${i}]`);
  }
}

if (mismatched.length) bad(`${mismatched.length} row(s) no longer match their script`, mismatched.slice(0, 3).join(' · '));
else ok(`every row matches its lesson's beat count`, `${LESSONS.length} lessons`);

if (tall2.length) bad(`${tall2.length} thought(s) need a third row`, tall2.slice(0, 3).join(' · '));
else ok(`all ${lines} authored thoughts fit ${MAX_ROWS} rows`);

if (onGraded.length) bad(`${onGraded.length} thought(s) sit on a graded beat (group O)`, onGraded.slice(0, 4).join(' · '));
else ok('no thought sits on a beat the reader is still answering (group O)');

// ── 7 · AND NOT ONE OF THEM COVERS A WORD (D31) ─────────────────────────────
//
// The placement is generated, so this re-derives it rather than trusting it —
// the same discipline `check:focus` applies to the maxims and `check:wardrobe` to
// the costume reach. A generator that silently stops avoiding words would leave
// every table entry looking exactly as it does now.
const J = JSON.parse(fs.readFileSync('components/lesson/cinematic/mustBoxes.ts.json', 'utf8'));
const TRAIL_H = { 3: 27.5, 2: 16, 1: 7 };
const hits = (a, b) => a[0] < b[0] + b[2] && b[0] < a[0] + a[2] && a[1] < b[1] + b[3] && b[1] < a[1] + a[3];
const covered = [];
let placed = 0;
for (const l of LESSONS) {
  const row = THOUGHTS[l.id];
  const beats = J.words[l.id];
  if (!row || !beats) continue;
  for (const [i, at] of row.at.entries()) {
    if (!at || !beats[i]) continue;
    const text = l.beats[i].graded ? 'Wrong, but in good company.' : row.say[i];
    if (!text) continue;
    placed += 1;
    const rows = wrap(text, SIZE, INNER, INTER).length;
    const h = rows * LH + 2 * VPAD + 2 * BORDER;
    const box = [at[0] - BOX_W / 2, at[1] - TRAIL_H[at[2]] - h, BOX_W, h];
    for (const it of beats[i]) {
      if (it.k !== 'text') continue;
      if (hits(box, it.b)) { covered.push(`${l.id}[${i}] over "${(it.t || '').slice(0, 18)}"`); break; }
    }
  }
}
if (covered.length) bad(`${covered.length} bubble(s) cover a word (D31)`, covered.slice(0, 3).join(' · '));
else ok(`none of ${placed} placed bubbles covers a word (D31)`);

// ── 8 · HE THINKS TWICE A LESSON, NOT EVERY TIME THE READER TAPS ────────────
//
// The first version drew a bubble on every beat that had a line: 1,113 of them,
// half of all 2,237 beats in the app. The reader: *"it appears way too much …
// I don't want it every single tab."*
//
// So the WORDS stay and the showing is rationed, which is the trade worth stating
// — the writing is the expensive half and the choosing is the cheap one, so a
// line held back today can be shown tomorrow by moving a weight in the generator,
// where re-authoring it could not. What this holds is the number a reader meets.
// The answer line is not counted: it lands only when they have answered something,
// on the two graded beats, and it is the half they asked for by name.
const SHOW = 2;
const chatty = [];
let thoughts = 0;
for (const l of LESSONS) {
  const row = THOUGHTS[l.id];
  if (!row) continue;
  const n = row.at.filter((a, i) => a && row.say[i] && !l.beats[i].graded).length;
  thoughts += n;
  if (n > SHOW) chatty.push(`${l.id}: ${n}`);
}
if (chatty.length) bad(`${chatty.length} lesson(s) show more than ${SHOW} thoughts`, chatty.slice(0, 4).join(' · '));
else ok(`no lesson shows more than ${SHOW} thoughts`, `${thoughts} across ${LESSONS.length}, ${(thoughts / LESSONS.length).toFixed(2)} a lesson · ${orphaned.length} lines written and held back`);

// ── 9 · AND THE BUBBLE HANGS OFF HIS HEAD, NOT OFF HIS RAISED HAND ──────────
//
// *"the thinking bubbles need to be closer to the sigma. They seem to be really
// far up above the stickman for a lot of them."*
//
// They were, and nothing here could see it, because the height was measured
// against the wrong thing twice over. `mustBoxes` records the union of ONE
// figure's limb Views and a beat draws several — `ethics-ethics-6` draws
// twenty-five — so the anchor was the top of the tallest person on stage. And
// even for the right person a box top is not a skull: a raised hand is in the
// union, so the box top sits a median FOURTEEN units above his head and as much
// as ninety.
//
// Measured against his actual head, out of the rig, the shipped table sat a
// median of 21 units clear of it with a p90 of 48. This re-derives the same two
// answers the generator does — whose box, and where his head is inside it — and
// holds what came out.
const { loadRig, skullRise } = await import('./lib/loadrig.mjs');
const { walkOf, scaleOf, crownOf } = await import('./lib/scenefig.mjs');
const { RIG, MOVES } = await loadRig();
const rise = new Map();
const riseOf = (c) => {
  if (!rise.has(c)) rise.set(c, skullRise(RIG, MOVES, c));
  return rise.get(c);
};
/** Half a head of paper. Past this the trail stops connecting the two. */
const FLOAT = 20;
/**
 * AND HOW FAR SIDEWAYS IT MAY SIT, which is geometry rather than taste (AB12).
 *
 * `logic-arguments-21` beat 6 placed a thought 154 units to his LEFT while he
 * walked 136 units to the RIGHT: the box crossed a third of the stage away from
 * the man it belonged to.
 *
 * Read out of the component, which now STATES it. Deriving it from the trail's
 * clamp went wrong twice — the speech bubble writes the identical expression with
 * a different constant one component up, and then the discs began fanning and
 * there was no single clamp left to read.
 */
const DRIFT = num(/export const THINK_DRIFT = ([\d.]+);/, 'the drift limit');
const HAT = J.wardrobeReach || {};
const far = [];
const adrift = [];
const gaps = [];
let unsure = 0;
for (const l of LESSONS) {
  const row = THOUGHTS[l.id];
  const beats = J.words[l.id];
  if (!row || !beats) continue;
  const walk = await walkOf(l.id);
  const k = scaleOf(l.id);
  const hat = HAT[l.id]?.up ?? 0;
  for (const [i, a] of row.at.entries()) {
    // Only his own THOUGHTS. An answer line cannot be declined — it is a reply to
    // something the reader just did — so a hard rule over it would fail on stages
    // that simply have no room, and the honest place for that number is the
    // generator's own report.
    if (!a || !beats[i] || !row.say[i] || l.beats[i].graded) continue;
    const c = crownOf(beats[i].filter((it) => it.k === 'fig'), walk ? walk[i] : undefined,
      riseOf(l.beats[i].code) * k, hat);
    if (!c || !c.sure) { unsure += 1; continue; }
    const gap = c.crown - a[1];
    gaps.push(gap);
    if (gap > FLOAT) far.push(`${l.id}[${i}] ${gap.toFixed(0)} clear`);
    const side = Math.abs(a[0] - a[3]);
    if (side > DRIFT) adrift.push(`${l.id}[${i}] ${side.toFixed(0)} sideways`);
  }
}
gaps.sort((x, y) => x - y);
const med = gaps.length ? gaps[Math.floor(gaps.length / 2)] : 0;
if (far.length) bad(`${far.length} thought(s) hang more than ${FLOAT} units clear of his head`, far.slice(0, 4).join(' · '));
// A CHECK THAT MEASURED NOTHING MUST NOT LOOK CLEAN — §21's rule, which this
// file's own inputs make easy to break: where the walk track names no figure the
// crown falls back to the union and this declines to judge it, so the count of
// what it skipped is printed beside the count of what it held.
else ok(`every thought hangs within ${FLOAT} units of his head`, `${gaps.length} measured, median ${med.toFixed(0)} · ${unsure} skipped, no figure the walk track names`);

if (DRIFT === null) bad('could not read the drift limit out of cinematicKit');
else if (adrift.length) bad(`${adrift.length} thought(s) sit further sideways than the trail can lean`, adrift.slice(0, 4).join(' · '));
else ok('every thought sits where its trail can still point at him', `within ${DRIFT.toFixed(0)} units`);

console.log(fails ? `\n${fails} failing.\n` : '\nall clear.\n');
process.exit(fails ? 1 : 0);
