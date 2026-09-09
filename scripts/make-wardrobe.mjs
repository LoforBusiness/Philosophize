// WHO WEARS WHAT — writes data/lessonWardrobe.ts.
//
//   npm run make:wardrobe
//
// A reader asked for the mascot to stop looking identical in every lesson. The
// costume is DERIVED rather than authored 186 times, and rotated so that no two
// lessons a reader meets in a row dress the same — which is group Q's rule ("no
// lesson may read as the one before it") applied to the figure instead of to the
// script. A generated table rather than a runtime hash, for the same reason
// `lessonNames` and `gazeTargets` are tables: it can be read, diffed and checked.
//
// ── THREE RULES, AND THE SECOND IS THE ONE THAT MATTERS ─────────────────────
//
// 1. NEIGHBOURS DIFFER. Consecutive lessons in a branch never share a costume.
//
// 2. A GRAVE LESSON DOES NOT WEAR A JOKE. `liveliness.GRAVE` already decides
//    which lessons are too heavy for a pratfall (N11 — "nothing funny goes near
//    a grave lesson, applied to the whole lesson and not just the sentence"), and
//    a top hat and monocle on a lesson about slavery is exactly the same insult
//    in a different medium. Those lessons get `plain` or one of the sober looks.
//    This is the rule most likely to be relaxed by somebody wanting more variety;
//    it is the reason the feature is safe to ship at all.
//
// 3. THE MASCOT IS STILL THE MASCOT. The reader was explicit — *"I still want the
//    core stickman to be the main mascot"* — so `plain` is the single commonest
//    entry, and the loudest costumes are the rarest. A figure who is in fancy
//    dress every single lesson has no default to vary FROM.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { pathToFileURL } from 'node:url';
import { grave } from './lib/liveliness.mjs';
import { mustBox, renderTable, STAGE_W } from './lib/mustrule.mjs';
import { loadRig } from './lib/loadrig.mjs';
import { corpus } from './lib/gestures.mjs';
import { widestOn, secondFor, ROLL, SOBER } from './lib/wardroberule.mjs';

const REPO = path.resolve(path.dirname(new URL(import.meta.url).pathname).replace(/^\//, ''), '..');
const { transform } = await import(
  pathToFileURL(path.join(REPO, 'node_modules/sucrase/dist/index.js')).href
);
const TMP = path.join(os.tmpdir(), 'ph-mkwardrobe');
fs.mkdirSync(TMP, { recursive: true });
const wsrc = path.join(TMP, 'wardrobe.mjs');
fs.writeFileSync(wsrc, transform(
  fs.readFileSync(path.join(REPO, 'components/lesson/cinematic/wardrobe.ts'), 'utf8'),
  { transforms: ['typescript'] },
).code);
const W = await import(pathToFileURL(wsrc).href);

const K_FIG = 1.0;
/** The pad `mustBox` puts round every box, which absorbs the first units of any
 *  pose change. Read from the rule rather than retyped, so the two cannot drift. */
const MUST_PAD = 4;
const { RIG: RIGM, MOVES: M } = await loadRig();
/** Which pose each beat holds — `lessons` below is built from the route and has no beats. */
const CODES = new Map(corpus().map((l) => [l.id, l.beats.map((b) => b.code)]));

/**
 * A SYNTHETIC BOX IS AN OUTPUT, NOT AN INPUT — drop last run's before reading.
 *
 * The visitor's body is written into `words` as a `fig` item tagged `v`. Left in
 * place across runs it is read by BOTH the costume fit test and the growth loop,
 * so the box this script wrote last time decides what it writes this time — and
 * `make:wardrobe` stopped being idempotent the moment the visitor existed (1007
 * boxes moved on one run, 620 on the next, with nothing changed between). Every
 * tagged item goes before anything looks at the file.
 */
function dropSynthetic(side) {
  for (const per of Object.values(side.words)) {
    for (const items of per || []) {
      if (!items) continue;
      for (let i = items.length - 1; i >= 0; i -= 1) if (items[i].v) items.splice(i, 1);
    }
  }
}
const SIDE = path.join(REPO, 'components/lesson/cinematic/mustBoxes.ts.json');
const side = JSON.parse(fs.readFileSync(SIDE, 'utf8'));
dropSynthetic(side);

/**
 * The visitor cues, if they have been generated — see make-visitor.mjs.
 *
 * A lesson with a visitor is a TWO-HANDER even though its scene file mounts one
 * figure, because the player mounts the other. Deciding that by grepping the
 * scene for `role="second"` gave `ethics-ethics-17` a second costume of `plain`
 * and put two identical figures on stage facing each other.
 */
const VIS_FILE = path.join(REPO, 'data/lessonVisitor.ts');
const VISITOR = {};
if (fs.existsSync(VIS_FILE)) {
  const vs = fs.readFileSync(VIS_FILE, 'utf8');
  for (const m of vs.matchAll(/'([a-z-]+-[a-z]+-\d+)':\s*\{ enter: (\d+), x: (-?\d+), from: (-?\d+), dir: (-?\d+) \}/g)) {
    VISITOR[m[1]] = { enter: +m[2], x: +m[3], from: +m[4], dir: +m[5] };
  }
}

/**
 * WILL THIS COSTUME FIT INSIDE THE LESSON'S BAND?
 *
 * The figure is inside every must-see box, and `mustBox` CLAMPS that box to the
 * band — so a hat that pokes above the band is not merely unprotected by the
 * camera, it is an H59 fault ("the band must contain every pixel a beat can
 * draw"). A costume that does not fit is refused here rather than shipped and
 * cropped, which is why the generator reads the recorded geometry at all.
 *
 * The figure's recorded top is its CROWN or a raised hand, whichever is higher,
 * and the hat is measured above the crown — so using the box top over-estimates
 * whenever a hand is up. That is the safe direction: it can refuse a costume that
 * would have fitted, and never accepts one that will not.
 */
function fits(id, costume, band) {
  const reach = W.reachOf(costume);
  if (!reach.up && !reach.side) return true;
  // AGAINST THE BARE FIGURE, NOT THE DRESSED ONE. The stored box already holds
  // whatever costume was applied last time, so measuring it directly makes this a
  // FEEDBACK LOOP: the expansion changes what fits, which changes the costume,
  // which changes the expansion, and the generator never settles. Proven rather
  // than reasoned about — the second run of the first version moved 3,851 boxes
  // that should not have moved.
  const was = (side.wardrobeReach || {})[id] || { up: 0, side: 0 };
  const beats = side.words[id] || [];
  for (const items of beats) {
    for (const it of items || []) {
      if (it.k !== 'fig') continue;
      const x = it.b[0] + was.side * K_FIG;
      const y = it.b[1] + was.up * K_FIG;
      const w = it.b[2] - 2 * was.side * K_FIG;
      if (y - reach.up * K_FIG < band[0]) return false;
      if (x - reach.side * K_FIG < 0) return false;
      if (x + w + reach.side * K_FIG > STAGE_W) return false;
    }
  }
  return true;
}

/** Each lesson's declared band, off the component that mounts the player. */
function bandOf(stem) {
  for (const f of [`${stem}Scene.tsx`, `${stem[0].toUpperCase()}${stem.slice(1)}Lesson.tsx`]) {
    const p = path.join(REPO, DIR, f);
    if (!fs.existsSync(p)) continue;
    const m = fs.readFileSync(p, 'utf8').match(/band=\{\[(\d+),\s*(\d+)\]\}/);
    if (m) return [+m[1], +m[2]];
  }
  return null;
}

const DIR = 'components/lesson/cinematic';
const ROUTE = 'app/(app)/branches/[branchSlug]/[pathSlug]/lesson/[lessonId].tsx';
const OUT = 'data/lessonWardrobe.ts';

/**
 * The rotation, weighted.
 *
 * `plain` appears about one lesson in three; the sober looks carry the middle;
 * the two loudest turn up rarely enough to still be a surprise. The order is the
 * cycle a branch walks, so it is also what guarantees rule 1 before the
 * neighbour check has to do anything.
 */
const CYCLE = [
  'plain', 'gent', 'plain', 'scholar', 'smoker', 'traveller', 'plain', 'dandy',
  'stroller', 'plain', 'lecturer', 'smoker', 'magistrate', 'plain', 'gent',
  'aesthete', 'plain', 'scholar', 'smoker', 'stroller', 'plain', 'traveller', 'ringmaster',
];

// THREE SLOTS FOR THE FEZ, AND THE NUMBER IS THE WHOLE DECISION.
//
// `smoker` is the only look in the roll that fits a figure standing at x = 0, and
// the scenes put him there in 205 lessons of 244 (see FEZ in wardrobe.ts). So in
// most of the corpus this cycle collapses to `plain` against `smoker`, and its
// share of the slots IS the share of lessons that end up dressed — nothing else
// in the list can compete for them.
//
// Rule 1 already forbids two neighbours matching, so six slots would alternate
// plain, fez, plain, fez down a whole branch and the hat would stop being an
// event. Three against seven `plain` puts a fez on roughly one lesson in three of
// the constrained ones, which is the "sometimes" that was asked for — and it is
// one number to move if that reads as too many or too few.


const route = fs.readFileSync(ROUTE, 'utf8');
const lessons = [];
for (const m of route.matchAll(/'([a-z-]+-[a-z]+-(\d+))':\s*([A-Za-z0-9]+)/g)) {
  const comp = m[3].replace(/Lesson$/, '');
  lessons.push({
    id: m[1], n: +m[2], branch: m[1].split('-')[0],
    stem: `${comp[0].toLowerCase()}${comp.slice(1)}`,
  });
}

const byBranch = {};
for (const L of lessons) (byBranch[L.branch] = byBranch[L.branch] || []).push(L);
for (const b of Object.keys(byBranch)) byBranch[b].sort((a, c) => a.n - c.n);

/** Everything a lesson says, so a grave word anywhere takes the whole lesson out. */
function textOf(stem) {
  const p = path.join(DIR, `${stem}Script.ts`);
  if (!fs.existsSync(p)) return '';
  const src = fs.readFileSync(p, 'utf8');
  return [...src.matchAll(/\b(?:text|explain|prompt|cite|reads):\s*(['"])((?:\\.|(?!\1)[^\\])*)\1/g)]
    .map((m) => m[2]).join(' ');
}

const out = {};
const seconds = {};

/** Would this costume fit on a figure standing at the visitor's own x? */
function fitsAtX(id, cue, costume, band) {
  const reach = W.reachOf(costume);
  // AGAINST THE BARE FIGURE — the same feedback loop `fits` already had. The
  // stored lead box carries LAST run's costume growth, so reading it raw lets the
  // previous answer decide this one and the generator stops settling.
  const was = (side.wardrobeReach || {})[id] || { up: 0, side: 0 };
  const per = side.words[id] || [];
  for (let b = cue.enter; b < per.length; b += 1) {
    const lead = (per[b] || []).find((it) => it.k === 'fig');
    if (!lead) continue;
    const w = lead.b[2] - 2 * was.side * K_FIG;
    if (cue.x - w / 2 - reach.side * K_FIG < 0) return false;
    if (cue.x + w / 2 + reach.side * K_FIG > STAGE_W) return false;
    if (lead.b[1] + was.up * K_FIG - reach.up * K_FIG < band[0]) return false;
  }
  return true;
}

/** Does this scene put a second, dressed figure on stage? (AA4) */
function twoHander(L) {
  if (VISITOR[L.id]) return true;
  const p = path.join(REPO, DIR, `${L.stem}Scene.tsx`);
  return fs.existsSync(p) && /role="second"/.test(fs.readFileSync(p, 'utf8'));
}
const tally = {};
let graveCount = 0;
let refused = 0;
for (const b of Object.keys(byBranch).sort()) {
  let prev = null;
  let cursor = 0;
  for (const L of byBranch[b]) {
    const heavy = grave(textOf(L.stem));
    if (heavy) graveCount += 1;
    // ONE CURSOR, INTO ONE CYCLE. The first draft walked a separate SOBER array
    // with the cursor it had been advancing against CYCLE, so the two indexings
    // desynchronised and the rotation collapsed — `ringmaster` came out once in
    // 186 lessons and `aesthete` three times, which is not a wardrobe. A grave
    // lesson now SKIPS to the next entry that is sober rather than switching to
    // a different list, so the rotation stays in step either way.
    const band = bandOf(L.stem);
    let pick = null;
    for (let i = 0; i < CYCLE.length; i += 1) {
      const c = CYCLE[(cursor + i) % CYCLE.length];
      // RULE 1 IS ABOUT COSTUMES, AND `plain` IS THE ABSENCE OF ONE.
      //
      // Excluding it alongside the rest looks like consistency and is what locked
      // the back half of every branch into a strict bare, fez, bare, fez. Where
      // only two entries fit a lesson — and after the fez arrived that is 205 of
      // 244, because it is the only hat narrow enough for a figure standing at
      // x = 0 — "neighbours differ" has just one move left and takes it every
      // time. Changing the slot weights from three to two moved the count by one
      // lesson and did not touch the pattern, which is the tell that the weights
      // were never what was deciding it.
      //
      // Two undressed lessons running do not read as a repeated costume; they read
      // as the mascot, which is what rule 3 asks for. The fallback below has been
      // emitting plain twice in a row all along whenever nothing fitted, so this
      // only makes the weights govern the case where something does.
      if (c === prev && c !== 'plain') continue;
      if (heavy && !SOBER.includes(c)) continue;
      const cos = W.BY_ID[c];
      if (band && cos && !fits(L.id, cos, band)) { refused += 1; continue; }
      pick = c;
      cursor = (cursor + i + 1) % CYCLE.length;
      break;
    }
    pick = pick || 'plain';

    // AND THE SECOND FIGURE'S COSTUME IS CHOSEN HERE TOO, not derived at runtime.
    //
    // `secondFor` gives a look that differs from the lead and from the lead's
    // neighbours, which is all a component can know. It cannot know the BAND —
    // and `ethics3`'s lead is `plain`, so its second was handed a dandy whose top
    // hat pokes seven units above that lesson's band. Only this script can see
    // that, so the fallback walks the roll for one that fits and settles on
    // `plain` if none does.
    let second = 'plain';
    if (twoHander(L)) {
      const start = ROLL.indexOf(secondFor(pick));
      for (let i = 0; i < ROLL.length; i += 1) {
        const c = ROLL[(start + i) % ROLL.length];
        if (c === pick) continue;
        if (heavy && !SOBER.includes(c)) continue;
        if (band && !fits(L.id, W.BY_ID[c], band)) continue;
        // AND IT HAS TO FIT WHERE HE ACTUALLY STANDS. `fits` measures against the
        // LEAD's recorded boxes; a visitor stands somewhere else entirely, often
        // near a stage edge, so a costume with a wide satchel cleared the test on
        // the lead's x and then poked out of the stage on the visitor's. Five
        // lessons did exactly that.
        const cue = VISITOR[L.id];
        if (cue && band && !fitsAtX(L.id, cue, W.BY_ID[c], band)) continue;
        second = c;
        break;
      }
    }
    seconds[L.id] = second;
    out[L.id] = pick;
    tally[pick] = (tally[pick] || 0) + 1;
    prev = pick;
  }
}

const lines = Object.entries(out).map(([id, c]) => `  '${id}': ['${c}', '${seconds[id] || 'plain'}'],`);
fs.writeFileSync(OUT, `// GENERATED by scripts/make-wardrobe.mjs — do not edit by hand.
//
// What each lesson's figure is wearing. See components/lesson/cinematic/wardrobe.ts
// for the pieces themselves and for the one rule that governs them (a piece must
// change the SILHOUETTE, because the figure is solid ink with no face).
//
// Each entry is [LEAD, SECOND]. The second is only used by a scene that mounts a
// figure with role="second" (AA4), and it is chosen HERE rather than derived in
// the component because only this script can see the lesson's band.
//
// Neighbours never match, and a lesson carrying a grave word wears nothing louder
// than a mortarboard — N11, one medium over.

export const WARDROBE: Record<string, [string, string]> = {
${lines.join('\n')}
};
`);

console.log(`wrote ${OUT} — ${Object.keys(out).length} lessons`);
console.log(`  ${graveCount} grave lesson(s) held to the sober set`);
console.log(`  ${refused} costume(s) refused for not fitting their lesson's band`);
const sorted = Object.entries(tally).sort((a, b) => b[1] - a[1]);
for (const [c, n] of sorted) console.log(`  ${c.padEnd(12)} ${String(n).padStart(3)}  ${((100 * n) / lessons.length).toFixed(0)}%`);

// ── AND THE CAMERA HAS TO BE TOLD ───────────────────────────────────────────
//
// The figure is inside EVERY must-see box (`mustrule`: "the whole man, arms
// included, and every figure on stage"), so a hat makes 186 stored boxes wrong —
// and `Stickman.tsx` is deliberately NOT in `muststamp`, so nothing would have
// gone red. That is the silent-rot shape this repo keeps recording, and it is
// why the boxes are recomputed HERE, in the same script that assigns the
// costumes, rather than in a second one somebody could forget to run.
//
// It computes exactly what a re-measure would record. The worn Views are
// children of the figure's own group, so `mustprobe` — which unions that group's
// descendants — picks them up on its own the next time it runs. Offline and in
// the browser therefore agree, and neither is authoritative over the other.
const bands = new Map();
for (const L of lessons) {
  const b = bandOf(L.stem);
  if (b) bands.set(L.id, b);
}

// IT MUST BE IDEMPOTENT, AND THE FIRST VERSION WAS NOT.
//
// Growing every figure box by the costume's reach is correct once and wrong
// every time after: a second run grows the already-grown box again, and nothing
// would ever have said so — the boxes only get LOOSER, so no check goes red and
// the camera just quietly stops pushing in. So the reach that was last applied
// is recorded in the side file and taken back off before the new one goes on.
// Re-running this script is then a no-op, which is what a generator has to be.
const applied = side.wardrobeReach || {};
let grown = 0;
for (const L of lessons) {
  const was = applied[L.id] || { up: 0, side: 0 };
  // THE WIDEST COSTUME ON THAT STAGE, not the lead's.
  //
  // A scene may mount several figures and they wear DIFFERENT things (AA4): the
  // lead, one `second` in a two-hander, and nothing for a crowd. `mustBoxes`
  // records one `fig` item per figure and does not say which is which, so the
  // grow has to cover the largest of them. Over-growing a crowd figure's box by a
  // few units costs a little zoom; under-growing the second's crops a hat.
  const lead = W.reachOf(W.BY_ID[out[L.id]] || { pieces: [] });
  const sec = W.reachOf(W.BY_ID[seconds[L.id]] || { pieces: [] });
  const now = { up: Math.max(lead.up, sec.up), side: Math.max(lead.side, sec.side) };
  const dUp = (now.up - was.up) * K_FIG;
  const dSide = (now.side - was.side) * K_FIG;
  applied[L.id] = { up: now.up, side: now.side };
  const per = side.words[L.id];
  if (!per || (!dUp && !dSide)) continue;
  for (const items of per) {
    for (const it of items || []) {
      if (it.k !== 'fig') continue;
      it.b[0] -= dSide;
      it.b[1] -= dUp;
      it.b[2] += 2 * dSide;
      it.b[3] += dUp;
      grown += 1;
    }
  }
}
side.wardrobeReach = applied;

// ── AND THE SAME BILL FOR A POSE THAT CHANGED SHAPE ─────────────────────────
//
// `mustBoxes` records what a beat drew ON THE DAY IT WAS MEASURED, and nothing
// invalidates it when a POSE changes: `muststamp` hashes the scene, the script and
// the probe, and `moves.ts` is none of the three. So widening an act's stance
// makes every stored box that holds it quietly too small, no check goes red, and
// the camera crops a hand.
//
// That is exactly why moves.ts rule 1b left the first living shelf alone —
// "changing them moves the figure's box in every lesson that holds one, which is a
// corpus-wide re-measure". A reader then hit what the shelf was hiding (*"I don't
// like that movement of the hands, it doesn't seem quite natural"*: acts 59, 60,
// 65 and 66 hung the hands at x ±6 inside a trunk 12 thick and rendered as a head
// on a slab), the shelf was rewritten to ±14, and this is the cheaper half of the
// bill — 7 units wider a side, of which `mustBox`'s own 4-unit pad absorbs four.
//
// GROWN RATHER THAN RE-MEASURED, and the reason is the bookkeeping right above.
// `measure:must` renders through the player, which DRESSES the figure, so fresh
// boxes already hold the costume — while `wardrobeReach` would still claim that
// growth is owed. Fresh boxes plus a stale reach means the next run subtracts
// something that is not there. This touches only the `fig` items on the beats
// whose act actually moved.
//
// Idempotent for the reason the costume growth is: boxes only ever get LOOSER, so
// a double-add is invisible. What was applied is recorded per beat and taken back
// off before the new value goes on.
// AN ABSENT RECORD MEANS THE BOX ALREADY HOLDS ITS POSE, WHICH IS THE ONLY SAFE
// DEFAULT. Treating it as zero and growing by the full reach is what the first
// draft did, and it moved 7,589 boxes on a corpus where nine acts had changed:
// a measured box holds whatever the figure was doing when it was measured, so
// the baseline is the reach AT MEASUREMENT TIME, never nothing.
// `scripts/seed-pose-reach.mjs` writes that baseline once, from the moves.ts the
// boxes were recorded against.
const poseWas = side.poseReach || {};
const poseNow = {};
let posed = 0; const posedIn = new Set();
for (const L of lessons) {
  const per = side.words[L.id];
  if (!per) continue;
  const was = poseWas[L.id] || [];
  const now = [];
  (CODES.get(L.id) || []).forEach((code, i) => {
    // The WRIST plus the glove, sampled across the loop, less the trunk it has to
    // clear and less the pad already allowed. The living acts read the monotonic
    // clock and never stop, so one sample answers for a pose that is still moving.
    let r = 0;
    for (const t of [0, 0.6, 1.2, 1.8, 2.4, 3.0, 3.6, 4.2, 4.8, 5.4]) {
      const st = M.emoteAny(code, t);
      for (const f of [st.fistL, st.fistR]) if (f) r = Math.max(r, Math.abs(f.x));
    }
    now[i] = +Math.max(0, (r + RIGM.STR.glove / 2) - RIGM.STR.torso / 2 - MUST_PAD).toFixed(2);
    const d = (now[i] - (was[i] ?? now[i])) * K_FIG;
    if (!d || !per[i]) return;
    for (const it of per[i]) {
      if (it.k !== 'fig' || it.v) continue;
      it.b[0] -= d;
      it.b[2] += 2 * d;
      posed += 1;
    }
    posedIn.add(L.id);
  });
  poseNow[L.id] = now;
}
side.poseReach = poseNow;

// ── AND THE VISITOR'S OWN BODY GOES INTO THE BOXES ──────────────────────────
//
// He is a second figure standing on the stage from his entrance beat onward, and
// `mustrule` puts "every figure on stage" inside the must-see box. The stored
// measurements predate him, so without this the camera would frame the lesson as
// though he were not there and crop him on the beat he arrives.
//
// Written as a synthetic `fig` item tagged `v`, and every tagged item is dropped
// before new ones are added — the same idempotence the costume growth needs, for
// the same reason: boxes only ever get looser, so a double-add is invisible.
let visitorBoxes = 0;
for (const L of lessons) {
  const per = side.words[L.id];
  if (!per) continue;
  const cue = VISITOR[L.id];
  if (!cue) continue;
  for (let b = cue.enter; b < per.length; b += 1) {
    const items = per[b];
    if (!items) continue;
    // The LEAD's own recorded box is the template, so the visitor's height and
    // width are whatever this lesson actually draws a figure as — no constant to
    // drift. Plus whatever his costume reaches.
    const lead = items.find((it) => it.k === 'fig');
    if (!lead) continue;
    const reach = W.reachOf(W.BY_ID[seconds[L.id]] || { pieces: [] });
    const w = lead.b[2];
    items.push({
      k: 'fig',
      v: 1,
      b: [cue.x - w / 2 - reach.side * K_FIG, lead.b[1] - reach.up * K_FIG, w + 2 * reach.side * K_FIG, lead.b[3] + reach.up * K_FIG],
    });
    visitorBoxes += 1;
  }
}

const rendered = renderTable(side.words, side.stamps, 'all', bands);
fs.writeFileSync(SIDE, JSON.stringify(
  { boxes: rendered.boxes, words: side.words, stamps: side.stamps, wardrobeReach: applied, poseReach: poseNow }, null, 1,
));
fs.writeFileSync(path.join(REPO, 'components/lesson/cinematic/mustBoxes.ts'), rendered.text);
console.log(`
  ${grown} figure box(es) grown to hold a costume
  ${posed} figure box(es) resized to hold the pose the rig draws today, in ${posedIn.size} lesson(s)`);
console.log(`  ${visitorBoxes} beat(s) given the visitor's own body; mustBoxes rewritten`);
console.log('  now run: npm run make:tours   (the boxes moved, so the shots do)');
