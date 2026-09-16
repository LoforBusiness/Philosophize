// ─────────────────────────────────────────────────────────────────────────────
// THE LIVING HOLDS, MEASURED: DO THE ARMS SHOW, AND DOES THE POSE ACTUALLY MOVE?
//
//   node scripts/check-idle.mjs
//
// Two rules, both of which a living hold can break while looking perfectly fine
// in the source.
//
// ── 1 · RULE 1b, ON BOTH SHELVES ────────────────────────────────────────────
//
// `moves.ts` rule 1b: the torso is 12 thick and a limb is 11 in the same ink, so a
// fist held at x ±6 puts the forearm INSIDE the trunk and about two pixels of it
// show at lesson size. N15 measured that, found seven used acts doing it across
// 208 beats, and grew 903 boxes to fix them — on the FIRST living shelf. The
// second shelf (157–168) was written later and was never held to it.
//
// This is what a reader means by "it doesn't seem quite natural": not the timing,
// the fact that the man has no arms.
//
// ── 2 · A LIVING HOLD THAT DOES NOT LIVE ────────────────────────────────────
//
// The whole contract of these acts is that they read `t` and never stop, so a run
// of split beats keeps moving straight through the beat changes. `check:moves`
// already proves they ignore `u` (which is what makes them legal on a run) — and
// ignoring `u` while ALSO not moving on `t` is a photograph that passes every
// existing test. §19 records exactly that shipping on the launch screen: three
// poses that "travelled 0.2 units" and were, in the terms that matter, stills.
//
// Both are high-water budgets, so a new act cannot quietly reintroduce either.
// ─────────────────────────────────────────────────────────────────────────────
import { loadRig } from './lib/loadrig.mjs';
import { CLOCK_ACTS, STILL_TWIN } from './lib/liveliness.mjs';

const { RIG, MOVES } = await loadRig();

/**
 * Acts that break one of these rules ON PURPOSE, with the reason from their own
 * header. A checker that cannot tell the design from the defect is the boxiness
 * metric again (§13), so the exemptions are named rather than the budget raised.
 */
const ARMLESS_OK = new Map([
  [65, 'GAZING UP — "head back, arms forgotten" IS the pose'],
]);
const STILL_OK = new Map([
  [75, 'AT ATTENTION — "almost nothing, on purpose"; the library needs one stillness'],
  [61, 'CHIN IN HAND — "thinking, and barely moving" is its own header'],
  [157, 'READING, AND STILL READING — the name is the specification'],
]);

// A fist this far from the centre line clears the trunk and shows a forearm.
// torso/2 + glove/2 is where the ink stops overlapping; 13 is N15's own landing.
const CLEAR = RIG.STR.torso / 2 + RIG.STR.glove / 2;
const SWEEP = Array.from({ length: 120 }, (_, i) => i * 0.15);   // 18s, past every cycle here

const buried = [];
const frozen = [];
const rows = [];

// THE FEET ARE IN HERE, AND THEY WERE NOT AT FIRST. Leaving them out under-reads
// every act whose whole content is below the waist — IMPATIENT is a tapping foot,
// STEPPING IN PLACE is two of them, PACING ON THE SPOT is the pose a reader asked
// for by name — and it reported all three as barely moving while the arms, which
// those poses deliberately keep still, were the only thing being measured.
const track = (s) => [s.fistL?.x ?? 0, s.fistL?.y ?? 0, s.fistR?.x ?? 0, s.fistR?.y ?? 0,
  s.footL?.x ?? 0, s.footL?.y ?? 0, s.footR?.x ?? 0, s.footR?.y ?? 0,
  s.neck ?? 0, s.tilt ?? 0, s.bob ?? 0];

const dist = (a, b) => Math.hypot(
  a[0] - b[0], a[1] - b[1], a[2] - b[2], a[3] - b[3],
  a[4] - b[4], a[5] - b[5], a[6] - b[6], a[7] - b[7],
  (a[8] - b[8]) * RIG.U.head, (a[9] - b[9]) * RIG.U.spine, a[10] - b[10],
);

/**
 * How far a stance table travels from its own first frame, in comparable units —
 * joints in units, the two angles scaled by the limb they actually swing, because
 * N12 is exactly the mistake of counting a neck angle as a movement: `U.head` is
 * 16, so 0.04 rad moves the head 0.6 units against a head 40 across.
 */
function travel(poses) {
  const a0 = track(poses[0]);
  return Math.max(...poses.map((p) => dist(track(p), a0)));
}

/**
 * The most it moves in half a second — whether it reads as MOVING rather than as
 * slowly having drifted. A pose can score well on travel by creeping somewhere
 * over twenty seconds and still be a photograph at any moment a reader looks.
 */
function rate(poses, step) {
  const n = Math.max(1, Math.round(0.5 / step));
  let r = 0;
  for (let i = n; i < poses.length; i += 1) r = Math.max(r, dist(track(poses[i]), track(poses[i - n])));
  return r;
}

// THE FLOOR IS CALIBRATED, NOT PICKED. `stand` already breathes and rocks — its
// own note says "under two units" — so a living hold that travels no further than
// the breath underneath it is not adding a movement, it is adding a name for one.
const BREATH = travel(SWEEP.map((t) => RIG.stand(t)));
const BREATH_RATE = rate(SWEEP.map((t) => RIG.stand(t)), 0.15);

// TWO TIERS, because "alive" and "reads" are different questions.
//
//   ALIVE  — beats the bare breath. A hold that does not is not adding a movement,
//            it is adding a NAME for one, and `stand` was already doing it.
//   READS  — 1.5x the breath. This is the pool a STILL BEAT may draw from: on a
//            beat where no scene channel changes, the figure is the only thing
//            moving on screen, and a quiet idle there is the reader's own
//            complaint ("maybe the stickman does a really small movement").
//
// A quiet hold is perfectly good on a beat where the scene is doing something —
// which is why the floor is not simply raised for everything.
const FLOOR = BREATH;
const READS = BREATH * 1.5;

for (const act of [...CLOCK_ACTS].sort((a, b) => a - b)) {
  const code = 99 + act;                       // hold(act) — see moves.holdCode
  const poses = SWEEP.map((t) => MOVES.emoteAny(code, t));
  // RULE 1b is about where a pose SITS, not where it passes through: hands cross
  // in front of the body while talking and that is what talking looks like. So
  // measure the share of the cycle with BOTH arms inside the trunk, not the worst
  // single frame — act 160 swings through 8.1 for an instant and reads perfectly.
  const inside = poses.filter((s) =>
    Math.max(Math.abs(s.fistL?.x ?? 0), Math.abs(s.fistR?.x ?? 0)) < CLEAR).length / poses.length;
  const span = travel(poses);
  const rt = rate(poses, 0.15);
  rows.push({ act, code, inside: +(inside * 100).toFixed(0), span: +span.toFixed(2), rate: +rt.toFixed(2) });
  if (inside > 0.25 && !ARMLESS_OK.has(act)) buried.push({ act, inside: +(inside * 100).toFixed(0) });
  if (span < FLOOR && !STILL_OK.has(act)) frozen.push({ act, span: +span.toFixed(2) });
}

console.log('ARE THE LIVING HOLDS ALIVE?\n');
console.log(`  a fist clears the trunk at |x| ≥ ${CLEAR.toFixed(1)} (torso ${RIG.STR.torso} + glove ${RIG.STR.glove})`);
console.log(`  stand() alone travels ${BREATH.toFixed(2)} units at ${BREATH_RATE.toFixed(2)}/half-second`);
console.log(`  ALIVE beats ${FLOOR.toFixed(2)} · READS (what a still beat may use) beats ${READS.toFixed(2)}`);
console.log(`  ${rows.length} living holds swept over 18s\n`);

const BUDGET = { buried: 0, frozen: 0 };
let bad = 0;
const rule = (list, budget, ok, fail) => {
  if (list.length > budget) { bad += 1; console.log(`  ✗   ${fail}`); } else console.log(`  ok  ${ok}`);
};

rule(buried, BUDGET.buried,
  `every living hold keeps an arm clear of the trunk  ${ARMLESS_OK.size} exempt by name`,
  `${buried.length} living hold(s) bury BOTH arms in the trunk (rule 1b, N15):`);
for (const b of buried) console.log(`        act ${b.act} — both arms inside the trunk for ${b.inside}% of the cycle`);

rule(frozen, BUDGET.frozen,
  `every living hold out-moves the bare breath  ${STILL_OK.size} exempt by name`,
  `${frozen.length} living hold(s) move no more than standing still does:`);
for (const f of frozen) console.log(`        act ${f.act} — travels ${f.span}, and stand() alone travels ${BREATH.toFixed(2)}`);

// THE POOL IS A RATCHET. A still beat may only be given a hold that reads, so the
// number of those is the vocabulary that pass has to draw on — and it may not
// shrink, or the corpus quietly converges on a handful of idles again (N14).
const reads = rows.filter((r) => r.span >= READS);
const POOL_FLOOR = 28;
if (reads.length < POOL_FLOOR) {
  bad += 1;
  console.log(`  ✗   only ${reads.length} living hold(s) READ well enough for a still beat  floor ${POOL_FLOOR}`);
} else {
  console.log(`  ok  ${reads.length} living holds read well enough to carry a still beat  floor ${POOL_FLOOR}`);
}

// EVERY TWIN A STILL BEAT CAN BE GIVEN MUST BE ONE THAT READS. The table lives in
// liveliness.mjs and the measurement lives here, so the two are asserted against
// each other rather than kept in step by hand.
const pool = new Set(reads.map((r) => r.code));
const weak = [...new Set(Object.values(STILL_TWIN))].filter((c) => !pool.has(c));
if (weak.length) {
  bad += 1;
  console.log(`  ✗   ${weak.length} STILL_TWIN target(s) do not read: ${weak.join(', ')}`);
} else {
  console.log(`  ok  all ${new Set(Object.values(STILL_TWIN)).size} STILL_TWIN targets read (${Object.keys(STILL_TWIN).length} frozen poses mapped)`);
}

if (process.argv.includes('--table')) {
  console.log('\n  act   code   travel   both arms inside');
  for (const r of [...rows].sort((a, b) => b.span - a.span)) {
    console.log(`  ${String(r.act).padStart(3)}   ${String(r.code).padStart(4)}   ${r.span.toFixed(2).padStart(6)}   ${r.rate.toFixed(2).padStart(8)}   ${String(r.inside).padStart(3)}%`);
  }
}

// ── AND THE TAPS THEMSELVES: ON HOW MANY DOES NOTHING ON SCREEN MOVE? ─────────
//
// Everything above is about the vocabulary. This is the number the reader felt:
// "three tabs in one lesson where there is no animation above the words". A tap is
// DEAD when no scene channel changed, every posed figure holds the same code and
// none of them is a living hold, and the player draws nothing of its own on it — no
// pen mark (data/lessonMarks.ts) and no thought (data/lessonThoughts.ts). A
// question, a quotation and the summary are events in themselves and never count.
// It was 289 on 2026-09-15 and 135 a day later; a ratchet, so it only goes down.
const { LESSONS, beatsOf } = await import('./lib/narration.mjs');
const { poseTrack, poseTracks } = await import('./lib/posetrack.mjs');
const { thoughtBeats, PROSE } = await import('./lib/marks.mjs');
const { loadTs } = await import('./lib/loadts.mjs');
const { holdsARun } = await import('./lib/liveliness.mjs');
const fsm = (await import('node:fs')).default;
const CIN = 'components/lesson/cinematic';
const { MARKS } = await loadTs('data/lessonMarks.ts');
const thoughts = thoughtBeats(fsm.readFileSync('data/lessonThoughts.ts', 'utf8'));
const dead = [];
for (const [id, file] of Object.entries(LESSONS)) {
  const stem = file.replace(/Script\.ts$/, '');
  if (!fsm.existsSync(`${CIN}/${stem}Scene.tsx`)) continue;       // the two with their own player
  const one = poseTrack(CIN, stem);
  const tracks = one ? [one] : poseTracks(CIN, stem);
  const fields = tracks.map((tk) => tk.field);
  const beats = beatsOf(file);
  for (let k = 1; k < beats.length; k += 1) {
    const a = beats[k - 1], b = beats[k];
    if (b.interact || b.mc || b.tap || b.quote || b.summary) continue;
    if (MARKS[id]?.[k] || thoughts[id]?.has(k)) continue;
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    const moved = [...keys].some((key) => !PROSE.has(key) && JSON.stringify(a[key] ?? null) !== JSON.stringify(b[key] ?? null));
    if (moved) continue;
    if (tracks.some((tk) => holdsARun(Number(b[tk.field] ?? tk.dflt)))) continue;
    if (!tracks.length && fields.length === 0) { /* no readable pose: judged by its scene channels alone */ }
    dead.push(`${id} beat ${k}`);
  }
}
// 0 since 16 Sep 2026: from 289 two days earlier, through the working shelf, the
// openers' scene events and the pen marks. A tap that leaves everything still is a
// build failure now, not a number to watch.
const DEAD_TAPS_BUDGET = 0;
if (dead.length > DEAD_TAPS_BUDGET) {
  bad += 1;
  console.log(`\n  ✗   ${dead.length} taps leave the whole picture still, up from ${DEAD_TAPS_BUDGET}`);
  for (const d of dead.slice(0, 12)) console.log(`        ${d}`);
} else {
  console.log(`\n  ok  ${dead.length} tap(s) leave the whole picture still  budget ${DEAD_TAPS_BUDGET}`);
  if (process.argv.includes('--dead')) for (const d of dead) console.log(`        ${d}`);
  if (dead.length < DEAD_TAPS_BUDGET) console.log(`      lower DEAD_TAPS_BUDGET to ${dead.length} in scripts/check-idle.mjs`);
}

const quiet = rows.filter((r) => r.span < 4).length;
console.log(`\n  travel over a cycle: median ${rows.map((r) => r.span).sort((a, b) => a - b)[rows.length >> 1]} units · ${quiet} under 4`);
console.log(bad ? '\nfailed.' : '\nall clear.');
process.exit(bad ? 1 : 0);
