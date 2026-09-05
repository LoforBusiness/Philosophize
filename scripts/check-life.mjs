// ─────────────────────────────────────────────────────────────────────────────
// IS THE FIGURE ALIVE?  (group N of the rule book)
//
//   npm run check:life
//
// A reader went through the lessons and said the stickman's movements were
// "usually pretty boring", that it "will just repeat movements over and over
// again", and that none of it looked like somebody actually alive. Measured, all
// three were true and none of them was visible to any existing check:
//
//   63 distinct poses across 1,944 beats · ten of them 68% of every gesture call
//   `think` alone 208 times · FOUR calls in the played band in the whole app
//   499 beats striking the pose the beat before them already held
//
// `check-moves` verifies that each MOTION is geometrically sound and says nothing
// about which motions the lessons use; `check-echo` compares neighbouring lessons
// on channels, prompt words and theme nouns, and gestures are none of those. So
// the corpus could converge on ten poses indefinitely with the suite green.
//
// Every budget here is a HIGH-WATER MARK in the `CARD_BUDGET` idiom: it may only
// move in the direction that is better. A budget still reading its original
// number is a debt, not a pass.
// ─────────────────────────────────────────────────────────────────────────────
import { corpus } from './lib/gestures.mjs';
import {
  VARIANTS, LIVING_RUN, COMIC, COMIC_CODES, comicName, play,
  grave, channels, reachesCatalogue, branchOf, cueFits,
} from './lib/liveliness.mjs';
import { decomment, readScript } from './lib/gestures.mjs';
import fs from 'node:fs';
import path from 'node:path';

/** Where the scenes live, for the attention rule at the foot of this file. */
const SCENE_DIR = 'components/lesson/cinematic';

let fails = 0;
const ok = (m, d) => console.log(`  ok    ${m}${d ? `  ${d}` : ''}`);
const bad = (m, d) => { fails++; console.log(`  FAIL  ${m}${d ? `  ${d}` : ''}`); };

const lessons = corpus().filter((l) => l.key && reachesCatalogue(l.comp));

// ── the same run detection the codemod uses ──────────────────────────────────
function runsOf(lesson) {
  const raw = readScript(lesson.file);
  const m = raw.match(/BEATS[^=]*=\s*\[([\s\S]*)\n\];/);
  if (!m) return { cont: new Set(), chunks: [] };
  const parts = m[1].split(/(\n\s{2}\},?\s*\n?)/);
  const chunks = [];
  for (let i = 0; i < parts.length; i += 2) if (/\S/.test(parts[i])) chunks.push(parts[i]);
  const cont = new Set();
  for (let i = 1; i < chunks.length; i++) {
    const a = channels(decomment(chunks[i - 1]));
    const b = channels(decomment(chunks[i]));
    if (a && a === b) cont.add(i);
  }
  // THE HEAD OF A RUN IS IN THE RUN. `cont` holds continuations only, so a rule
  // written against it alone counts the head as a free-standing beat — which put
  // one false N6 finding on the board, because the codemod correctly leaves run
  // heads to pass 0 and the checker was correctly told they were not runs.
  // The checker and the codemod have to draw this boundary in the same place.
  const inRun = new Set();
  for (const i of cont) {
    let head = i; while (cont.has(head)) head--;
    inRun.add(i); inRun.add(head);
  }
  const tail = new Set([...inRun].filter((i) => !cont.has(i + 1)));
  return { cont, inRun, tail, chunks };
}

console.log('\nIS THE FIGURE ALIVE?\n');
console.log(`  ${lessons.length} lessons reach the movement catalogue`);

// ── 1 · the vocabulary is not ten poses ──────────────────────────────────────
const use = new Map();
let beats = 0;
for (const l of lessons) {
  for (const b of l.beats) { beats++; use.set(b.code, (use.get(b.code) || 0) + 1); }
}
const total = [...use.values()].reduce((a, b) => a + b, 0);
const ranked = [...use].sort((a, b) => b[1] - a[1]);
const top10 = (100 * ranked.slice(0, 10).reduce((a, [, v]) => a + v, 0)) / total;

// 68% before group N was enforced, 53% after. DOWN ONLY — and 53 is a DEBT
// rather than a target: it is still ten poses doing half the work, and the way
// down is more VARIANTS rows, because a pose with no second body can never be
// anything but itself.
const TOP10_BUDGET = 53;
if (top10 <= TOP10_BUDGET + 0.5) {
  ok(`the ten commonest poses are ${top10.toFixed(0)}% of every gesture call`,
    `budget ${TOP10_BUDGET}% · was 68% before group N was enforced`);
} else {
  bad(`the ten commonest poses are ${top10.toFixed(0)}% of every gesture call`,
    `over the ${TOP10_BUDGET}% budget — the figure is converging on a handful of poses again`);
}

// UP ONLY.
const DISTINCT_FLOOR = 90;
if (use.size >= DISTINCT_FLOOR) {
  ok(`${use.size} distinct poses in use across ${beats} beats`, `floor ${DISTINCT_FLOOR} · was 63`);
} else {
  bad(`only ${use.size} distinct poses in use`, `floor is ${DISTINCT_FLOOR}`);
}

// ── 2 · N6 · no lesson strikes the same pose twice outside a run ──────────────
const twice = [];
for (const l of lessons) {
  const { inRun } = runsOf(l);
  const seen = new Map();
  for (const b of l.beats) {
    if (b.declared === null) continue;
    const hit = seen.get(b.declared) || 0;
    seen.set(b.declared, hit + 1);
    // Inside a run the repeat is REQUIRED (N7): the whole sentence is one
    // movement. Only a repeat that is not a continuation is a repeat.
    if (hit > 0 && !inRun.has(b.i) && VARIANTS[b.declared]) {
      twice.push(`${l.id} beat ${b.i} (pose ${b.declared}, ${hit + 1}${hit ? 'nd/rd/th' : ''} use)`);
    }
  }
}
const TWICE_BUDGET = 0;
if (twice.length <= TWICE_BUDGET) {
  ok('no lesson strikes the same pose twice where a variant exists (N6)');
} else {
  bad(`${twice.length} repeated pose(s) that have an unused variant (N6)`,
    twice.slice(0, 4).join(', '));
}

// ── 3 · N7 · a split run is one continuous living movement ───────────────────
const frozenRuns = [];
for (const l of lessons) {
  const { cont, tail } = runsOf(l);
  for (let i = 1; i < l.beats.length; i++) {
    if (!cont.has(i)) continue;
    const code = l.beats[i].declared;
    if (code === null) continue;
    // A run member in the 300 band replays its action once per piece — the tic
    // N7 exists to forbid. A run member whose pose has a living twin that was
    // never taken is a lift re-raising on every piece of one sentence.
    // The LAST piece of a run may carry a played action: N7's own exception, and
    // the shape the joke pass relies on — hold, hold, hold, react.
    if (code >= 300 && !tail.has(i)) {
      frozenRuns.push(`${l.id} beat ${i}: played action ${code} in a run's MIDDLE — it replays per piece`);
    } else if (LIVING_RUN[code] !== undefined && LIVING_RUN[code] !== code) {
      frozenRuns.push(`${l.id} beat ${i}: pose ${code} has a living twin ${LIVING_RUN[code]}`);
    }
  }
}
const RUN_BUDGET = 0;
if (frozenRuns.length <= RUN_BUDGET) {
  ok('every split run is one continuous living movement (N7)');
} else {
  bad(`${frozenRuns.length} split-run beat(s) restart their gesture mid-sentence (N7)`,
    frozenRuns.slice(0, 4).join('; '));
}

// ── 4 · N8 · every lesson performs something ─────────────────────────────────
const never = lessons.filter((l) => !l.beats.some((b) => b.declared !== null && b.declared >= 300));
// 173 of 177 before, 32 now. The 30 that remain have no beat that can carry an
// action at all: every candidate is graded, a quote, the hook, the summary, or
// sits inside a split run where a played action would replay per piece. Lowering
// this means giving one of those lessons a beat, not loosening the placement
// rules. DOWN ONLY.
const STILL_BUDGET = 32;
if (never.length <= STILL_BUDGET) {
  ok(`${lessons.length - never.length} of ${lessons.length} lessons perform an action (N8)`,
    `${never.length} still hold poses only · budget ${STILL_BUDGET} · was 170`);
} else {
  bad(`${never.length} lessons never perform anything (N8)`, `budget ${STILL_BUDGET}`);
}

// ── 5 · N11 · nothing funny anywhere near a grave lesson ─────────────────────
const tasteless = [];
for (const l of lessons) {
  const whole = l.beats.map((b) => b.text).join(' ');
  const lessonGrave = grave(whole);
  for (const b of l.beats) {
    if (b.declared === null || !COMIC_CODES.has(b.declared)) continue;
    if (lessonGrave) {
      tasteless.push(`${l.id} beat ${b.i}: "${comicName(b.declared)}" in a lesson that mentions ${(whole.match(grave.re || /$^/) || [''])[0] || 'a grave subject'}`);
    } else if (grave(b.text)) {
      tasteless.push(`${l.id} beat ${b.i}: "${comicName(b.declared)}" on a grave beat`);
    } else if (b.graded) {
      tasteless.push(`${l.id} beat ${b.i}: "${comicName(b.declared)}" on a graded beat`);
    } else if (b.quote) {
      tasteless.push(`${l.id} beat ${b.i}: "${comicName(b.declared)}" on a quote beat`);
    } else if (b.i === l.beats.length - 1) {
      tasteless.push(`${l.id} beat ${b.i}: "${comicName(b.declared)}" on the summary`);
    }
  }
}
if (!tasteless.length) {
  ok('no gag lands on a grave lesson, a grave beat, a question, a quote or a summary (N11)');
} else {
  bad(`${tasteless.length} gag(s) in a place a gag must not be (N11)`);
  for (const t of tasteless.slice(0, 6)) console.log(`        ${t}`);
}

// ── 6 · N9 · a gag is about something the beat says ──────────────────────────
const unfit = [];
for (const l of lessons) {
  for (const b of l.beats) {
    if (b.declared === null || !COMIC_CODES.has(b.declared)) continue;
    const gag = COMIC.find((c) => play(c.act) === b.declared);
    if (!gag) continue;
    if (!cueFits(gag, b.text)) {
      unfit.push(`${l.id} beat ${b.i}: "${gag.name}" against "${b.text.slice(0, 52)}…"`);
    }
  }
}
if (!unfit.length) {
  ok('every gag is about something its own beat says (N9)');
} else {
  bad(`${unfit.length} gag(s) about nothing in their beat (N9)`);
  for (const u of unfit.slice(0, 5)) console.log(`        ${u}`);
}

// ── 7 · N10 · no branch tells the same joke twice ────────────────────────────
const byBranch = new Map();
for (const l of lessons) {
  const br = branchOf(l.id);
  if (!byBranch.has(br)) byBranch.set(br, []);
  byBranch.get(br).push(l);
}
const reused = [];
let placed = 0;
for (const [br, list] of byBranch) {
  const at = new Map();
  list.forEach((l, pos) => {
    for (const b of l.beats) {
      if (b.declared === null || !COMIC_CODES.has(b.declared)) continue;
      placed++;
      const seen = at.get(b.declared) || [];
      // TWICE IN A BRANCH IS THE CAP, AND EIGHT LESSONS IS THE SEPARATION.
      // Twice in thirty-seven lessons, well apart, is not a running gag — it is
      // a thing the reader will have forgotten. Three times is.
      if (seen.length >= 2) reused.push(`${br}: "${comicName(b.declared)}" a third time in ${l.id}`);
      else if (seen.some((q) => Math.abs(q - pos) < 8)) {
        reused.push(`${br}: "${comicName(b.declared)}" again only ${Math.min(...seen.map((q) => Math.abs(q - pos)))} lessons later in ${l.id}`);
      }
      at.set(b.declared, [...seen, pos]);
    }
  });
}
if (!reused.length) {
  ok(`${placed} gags placed, none repeated inside a branch within eight lessons (N10)`);
} else {
  bad(`${reused.length} gag(s) told again too soon (N10)`, reused.slice(0, 4).join('; '));
}

// ── 8 · one lesson, one gag ──────────────────────────────────────────────────
const crowded = lessons
  .map((l) => [l.id, l.beats.filter((b) => b.declared !== null && COMIC_CODES.has(b.declared)).length])
  .filter(([, n]) => n > 1);
if (!crowded.length) {
  ok('no lesson carries more than one gag');
} else {
  bad(`${crowded.length} lesson(s) carry more than one gag`,
    crowded.slice(0, 4).map(([id, n]) => `${id} (${n})`).join(', '));
}

// ── 9 · the comic shelf itself is not shrinking ──────────────────────────────
const SHELF_FLOOR = 32;
if (COMIC.length >= SHELF_FLOOR) {
  ok(`${COMIC.length} gags on the shelf`, `floor ${SHELF_FLOOR} — enough that a busiest branch of 30 never repeats`);
} else {
  bad(`only ${COMIC.length} gags on the shelf`, `floor ${SHELF_FLOOR}`);
}
const noCue = COMIC.filter((c) => !c.fits);
if (noCue.length) bad(`${noCue.length} gag(s) carry no cue, so nothing can place them aptly (N9)`);

// ── 10 · he looks at what the beat is about (N12) ────────────────────────────
//
// `moves.gazeAt` and `moves.pointAt` have existed since the rig was written and
// were called ZERO times across 184 scenes: the figure narrated a diagram he
// never once looked at. `interact.ts` was the same story one level out — 14 of
// its 17 exports, the whole vocabulary for holding, reaching, passing objects
// and shaking hands, also called zero times.
//
// A scene wires it by using `lookPose` in place of `pose`, which takes the beat's
// generated target off SceneApi. A scene posing TWO figures is exempt: which of
// them is the narrator is a judgement, and `check:turn` records that guessing it
// from the first `pose()` in a file misreported 101 lessons.
//
// A high-water mark like every other budget here.
const LOOK_BUDGET = 0;
const sceneFiles = fs.readdirSync(SCENE_DIR).filter((f) => f.endsWith('Scene.tsx')).sort();
const blind = [];
let twoFigure = 0;
for (const f of sceneFiles) {
  const src = decomment(fs.readFileSync(path.join(SCENE_DIR, f), 'utf8'));
  if (/\blookPose\b/.test(src)) continue;
  const poses = (src.match(/(?<![A-Za-z0-9_])pose\(/g) || []).length;
  if (poses > 1) { twoFigure += 1; continue; }
  blind.push(f.replace('Scene.tsx', ''));
}
if (blind.length <= LOOK_BUDGET) {
  ok(`${sceneFiles.length - blind.length - twoFigure} scenes turn the figure toward the beat's own subject`,
    `${twoFigure} pose two figures and are exempt · ${blind.length} still blind, budget ${LOOK_BUDGET}`);
  if (blind.length < LOOK_BUDGET) console.log(`        lower LOOK_BUDGET to ${blind.length} to lock it in`);
} else {
  bad(`${blind.length} scene(s) never look at anything, budget ${LOOK_BUDGET}`, blind.slice(0, 8).join(', '));
}

console.log(fails ? `\n${fails} failing.\n` : '\nall clear.\n');
process.exit(fails ? 1 : 0);
