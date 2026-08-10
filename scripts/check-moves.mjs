// Numeric verification for the stickman movement library.
//
// rig.ts has zero imports precisely so it can run outside the app (CLAUDE.md §17),
// which is what makes this possible: sucrase strips the types, solve() gives the
// joints, and nothing needs Metro or a device.
//
// CALIBRATION FIRST. Every check below is run against the EXISTING motions before
// any new one is trusted. A check that cannot report a clean pass on `walk` is
// broken, and a check that fires on almost everything has told you nothing
// (LESSON_RULES Part 3) — fix the check, not the motion.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import os from 'node:os';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const REPO = process.cwd();
const { transform } = await import(
  pathToFileURL(path.join(REPO, 'node_modules/sucrase/dist/index.js')).href,
);

// A data: URL has no base path, so a module that imports anything relative — as
// moves.ts imports './rig' — cannot be loaded that way. Transpiling both into one
// temp directory and rewriting the specifier to './rig.mjs' gives the imports
// somewhere to resolve, and keeps generated .mjs out of a components/ folder
// where Metro would find it.
const TMP = path.join(os.tmpdir(), 'philosophize-moves-check');
mkdirSync(TMP, { recursive: true });

function emit(rel, name) {
  const src = readFileSync(path.join(REPO, rel), 'utf8');
  const js = transform(src, { transforms: ['typescript'] }).code
    .replace(/(from\s+['"])\.\/(rig|moves)(['"])/g, '$1./$2.mjs$3');
  const out = path.join(TMP, name);
  writeFileSync(out, js);
  return pathToFileURL(out).href;
}

emit('components/lesson/cinematic/rig.ts', 'rig.mjs');
emit('components/lesson/cinematic/moves.ts', 'moves.mjs');
const R = await import(pathToFileURL(path.join(TMP, 'rig.mjs')).href);
const M = await import(pathToFileURL(path.join(TMP, 'moves.mjs')).href);
const I = await import(emit('components/lesson/cinematic/interact.ts', 'interact.mjs'));

const GROUND = 500;
const ARM = R.U.uarm + R.U.farm;          // 33
// Cfg IS FLAT — the stance spreads in beside the placement fields. Nesting it as
// `{ s: stance }` yields a silently broken figure rather than an error.
const solveAt = (stance, x) => R.solve({ x, groundY: GROUND, k: 1, dir: 1, ...stance });

const FRAMES = 48;
const fail = [];
const note = (motion, check, detail) => fail.push({ motion, check, detail });

/** The sample point for frame `i` — distance for a gait, u for everything else. */
const sampleAt = (m, i) => (m.kind === 'gait' ? (i / FRAMES) * m.cycle : i / FRAMES);

// ── check 1 · a planted foot must not move in world space ────────────────────
// This is what stops feet skating, and it is the check the whole library rests on.
function checkSkate(name, m) {
  if (m.kind !== 'gait') return;
  let worst = 0;
  const step = m.cycle / FRAMES;
  for (const foot of ['footL', 'footR']) {
    let anchor = null, prevPlanted = false;
    for (let i = 0; i <= FRAMES; i++) {
      const d = i * step;
      const s = m.at(d);
      const planted = s[foot].y === 0;
      const world = d * (m.dirSign ?? 1) + s[foot].x;   // body advances by d
      if (planted && !prevPlanted) anchor = world;  // a new footfall
      else if (planted && anchor !== null) worst = Math.max(worst, Math.abs(world - anchor));
      prevPlanted = planted;
    }
  }
  if (worst > 0.01) note(name, 'skate', `planted foot drifts ${worst.toFixed(3)} units`);
}

// ── check 2 · a limb through the floor, as opposed to resting on it ──────────
//
// A planted ankle sits exactly ON the ground line and its joint disc straddles it;
// that is how every standing figure in the app is drawn, so "no ink below the
// line" would be a stricter rule than the rig's own and would fail everything.
// The line is about joint CENTRES.
//
// Two things then have to be separated from a real defect, or this reports eight
// poses that are all fine:
//
//   · AN AUTHORED SINK IS INTENT. Postures 3, 5 and 10 write `footR: { y: 1 }` or
//     `{ y: 2 }` — the author deliberately pushed the far foot a little into the
//     floor. Whatever the solver then does under that foot is what was asked for.
//   · A KNEELING KNEE BELONGS ON THE FLOOR. Postures 1, 2 and 14 are kneels, and a
//     knee touching or just breaking the line is the pose working, not failing.
//     A leg driven several units THROUGH it is not — hence a tolerance rather than
//     an exemption, so a genuinely buried leg still reports.
const KNEE_REST = 3.0;
function checkGround(name, m) {
  for (let i = 0; i <= FRAMES; i++) {
    const s = m.at(sampleAt(m, i));
    const j = solveAt(s, 200);
    // How far the author themselves pushed each foot under the line.
    const sunk = Math.max(0, s.footL.y, s.footR.y);
    for (const [k, p] of Object.entries(j)) {
      const depth = p.y - GROUND;
      const allow = 0.5 + sunk + (k.startsWith('knee') ? KNEE_REST : 0);
      if (depth > allow) {
        note(name, 'ground', `${k} is ${depth.toFixed(1)} below the ground line`);
        return;
      }
    }
  }
}

// ── check 3 · REMOVED, and worth recording why ───────────────────────────────
//
// There was a check here that flagged a fist target reaching past the arm's 33
// units, on the theory (from the long note on `seated` in rig.ts) that a clamped
// arm is pinned straight and springs when it comes back in range.
//
// It fired on roughly THIRTY of the fifty-five motions in moves.ts, which by the
// rule book's own standard means the check was wrong, not the library. And the
// reason is written at the top of moves.ts:
//
//     "Over ~33 the solver clamps it and the arm goes straight, which is safe;
//      between about 18 and 30 is where an unintended hole appears."
//
// Over-reach is the INTENDED idiom — it is how a pointing or reaching arm is made
// to go straight. The actual defect is the MIDDLE of the range, where the elbow
// bows out and encloses a triangle of paper against the torso. That cannot be
// detected mechanically, because whether a bent elbow is a defect or a folded-arms
// pose depends on what the author meant. It is a job for the filmstrip sheet.
//
// Left as a comment rather than deleted, so the next person to have this idea can
// see it was tried and why it does not work here.

// ── check 4 · a genuine DISCONTINUITY, told apart from merely fast ───────────
//
// "Not smooth" cannot be measured at one sampling rate. A startle recoil and a
// teleport both show a big per-frame delta at 48 frames, and the first version of
// this check called both a defect — it flagged `act 19`, whose only crime is being
// a snap, which is what a startle IS.
//
// The test that separates them is REFINEMENT. Sample the same motion four times as
// finely: a fast-but-continuous move's per-frame delta falls by roughly the same
// factor, because it is just a steep slope. A real discontinuity does not move at
// all, because the gap is in the function rather than in the sampling.
//
// Measured on this library: act 19 went 12.34 → 3.37 → 0.86 → 0.22 across 48 → 3072
// frames (a slope), while act 3 held 13.95 → 13.49 → 13.09 → 13.02 (a cliff — the
// pelvis teleports 13 units at takeoff).
const FIELDS = (s) => ({
  tilt: s.tilt * 60, neck: s.neck * 60, bob: s.bob,
  flx: s.footL.x, fly: s.footL.y, frx: s.footR.x, fry: s.footR.y,
  hlx: s.fistL.x, hly: s.fistL.y, hrx: s.fistR.x, hry: s.fistR.y,
});
function worstStep(m, n) {
  let prev = null, worstK = '', worst = 0, at = 0;
  for (let i = 0; i <= n; i++) {
    const u = m.kind === 'gait' ? (i / n) * m.cycle : i / n;
    const flat = FIELDS(m.at(u));
    if (prev) {
      for (const k of Object.keys(flat)) {
        const d = Math.abs(flat[k] - prev[k]);
        if (d > worst) { worst = d; worstK = k; at = i / n; }
      }
    }
    prev = flat;
  }
  return { worst, worstK, at };
}
// ── the head is not a place to put a hand ────────────────────────────────────
//
// Both library headers state this and nothing enforced it: the head is a
// 20-radius disc, a fist is another ~6, so a hand whose centre comes within about
// 26 of the head's centre is DRAWN INSIDE IT and disappears — forearm included.
// The figure loses a hand and the shape of its skull in one go.
//
// It is invisible in the source, because the numbers that break it look perfectly
// reasonable one at a time: a hand at (20, −35) is a sensible reach, and it is
// 24.4 from a head centred at (0, −49). Only the arithmetic says so.
//
// EXEMPT: the poses where touching the face IS the gesture. Named rather than
// pattern-matched, so adding one is a decision somebody makes on purpose.
const FACE_OK = new Set([
  'act 14',          // DUCK — hands go over the head, which is the gesture
  'act 17',          // FACEPALM — the hand is ON the face by definition
  'act 18',          // LOOK AROUND — the hand is shading the eyes
  'act 49',          // SCRATCH THE HEAD — the hand goes to the skull by definition
  'act 19',          // STARTLE — hands fly to the face, which is the gesture
  'posture 9',       // the thinker — chin in hand
  'carry hurry/5',   // something long over the shoulder passes the head by design
]);

// Poses that break it and predate the check. Each is a hand DISAPPEARING into the
// skull — a throw whose winding hand is gone, a reach for a high shelf with
// nothing on the end of the arm — so they are defects rather than exemptions, and
// they are carried as a ratchet rather than fixed blind at the end of a session.
// DOWN ONLY.
const HEAD_DEBT = new Set(['act 3', 'act 6', 'act 9', 'act 13', 'posture 11', 'prop 6']);
const HEAD_DEBT_BUDGET = 6;
const headDebt = [];
// From rig's HEAD_CLEAR — one source with check-rest, both derived from STR.headR.
// `moving` rather than `rest`: these are hands MID-GESTURE, and a sweep through the
// skull reads as a limb passing behind the face, so it needs more room than a
// settled pose that is allowed to touch the rim.
const HEAD_CLEAR = R.HEAD_CLEAR.moving;
function checkHead(name, m) {
  if (FACE_OK.has(name)) return;
  let worst = Infinity, at = 0, which = '';
  for (let i = 0; i <= FRAMES; i++) {
    const s = m.at(sampleAt(m, i));
    const j = solveAt(s, 200);
    for (const k of ['wrL', 'wrR']) {
      const d = Math.hypot(j[k].x - j.head.x, j[k].y - j.head.y);
      if (d < worst) { worst = d; at = i / FRAMES; which = k; }
    }
  }
  if (worst < HEAD_CLEAR) {
    if (HEAD_DEBT.has(name)) { headDebt.push(`${name} (${worst.toFixed(1)})`); return; }
    note(name, 'head', `${which} is ${worst.toFixed(1)} from the head centre at u=${at.toFixed(2)} (needs ${HEAD_CLEAR})`);
  }
}

function checkContinuity(name, m) {
  const coarse = worstStep(m, FRAMES);
  if (coarse.worst <= 2) return;                       // nothing worth refining
  const fine = worstStep(m, FRAMES * 16);
  // Continuous ⇒ the step shrinks with the sampling interval. Anything still
  // carrying most of its size at 16× finer is a real gap in the function.
  if (fine.worst > coarse.worst * 0.5 && fine.worst > 2) {
    note(name, 'discontinuity',
      `${fine.worstK} jumps ${fine.worst.toFixed(1)} units at u=${fine.at.toFixed(3)} and stays that size when sampled 16x finer`);
  }
}

// ── check 5 · a transition must land exactly on its destination pose ─────────
// Otherwise the beat that holds afterwards starts with a visible snap.
function checkLanding(name, m) {
  if (!m.lands) return;
  const end = m.at(1), dst = m.lands();
  const d = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const gap = Math.max(
    Math.abs(end.bob - dst.bob), Math.abs(end.tilt - dst.tilt) * 60,
    Math.abs(end.neck - dst.neck) * 60,
    d(end.footL, dst.footL), d(end.footR, dst.footR),
    d(end.fistL, dst.fistL), d(end.fistR, dst.fistR),
  );
  if (gap > 0.01) note(name, 'landing', `ends ${gap.toFixed(3)} units off its destination pose`);
}

// ── check 6 · two hands that are supposed to meet must actually meet ─────────
//
// The defect this exists for is the one two-figure staging always has: each figure
// is posed correctly on its own, both look like they are reaching, and the hands
// pass ten units apart — so it reads as two people grasping at the air near each
// other. It cannot be seen in either figure alone, which is why no per-motion check
// would ever find it.
//
// A handshake and a hand-over both go through a moment where the two hands are the
// same point. The test is simply whether that moment exists.
function checkMeet(pairs) {
  for (const [key, sides] of Object.entries(pairs)) {
    if (!sides.a || !sides.b) continue;
    let best = Infinity, at = 0;
    for (let i = 0; i <= FRAMES; i++) {
      const u = i / FRAMES;
      // EACH FIGURE MUST BE SOLVED WITH ITS OWN FACING. `solveAt` assumes dir = 1,
      // and figure B faces left — solved the wrong way its hand comes out on the
      // far side of its body, which reported 56 units for a handshake that works.
      const ha = R.solve({ ...PA, ...sides.a.at(u) }).wrR;
      const hb = R.solve({ ...PB, ...sides.b.at(u) }).wrR;
      const d = Math.hypot(ha.x - hb.x, ha.y - hb.y);
      if (d < best) { best = d; at = u; }
    }
    // A hand is drawn as a joint of radius limb/2 ≈ 5.5, so two hands within a few
    // units are touching. Ten apart is the failure this is looking for.
    if (best > 4) {
      note(key, 'meet', `the two hands never get closer than ${best.toFixed(1)} units (best at u=${at.toFixed(2)})`);
    }
  }
}

// ── walk() must never change ─────────────────────────────────────────────────
// walk() feeds every walking figure in all 84 cinematic lessons, so `armY` has to
// be a pure addition: with the field absent the output must be BIT-IDENTICAL, not
// "close enough". The baseline was captured from an unmodified rig.ts before the
// field existed — captured afterwards it would prove nothing.
function checkWalkUnchanged() {
  const expect = JSON.parse(readFileSync(path.join(REPO, 'scripts/walk-baseline.json'), 'utf8'));
  const got = Array.from({ length: 24 }, (_, i) => R.walk(i * 2.5, R.WALK));
  if (JSON.stringify(got) !== JSON.stringify(expect)) {
    note('walk (identity)', 'regression', 'walk(dist, WALK) output changed — 84 lessons depend on it');
  }
}

// ── the register ─────────────────────────────────────────────────────────────
// `gait`   : at(distance) -> Stance, cycle = distance per stride cycle
// `oneShot`: at(u 0..1)   -> Stance
// `lands`  : optional destination pose a transition must equal at u = 1
const T = 3.0;                               // a fixed clock, so runs are comparable
// Two figures 56 stage units apart, facing each other. Inside the ~60 the arms can
// span, so their hands are supposed to actually touch.
const PA = { x: 172, groundY: GROUND, k: 1, dir: 1 };
const PB = { x: 228, groundY: GROUND, k: 1, dir: -1 };
const MOTIONS = [
  { name: 'walk (baseline)', kind: 'gait', cycle: R.WALK.S / R.WALK.stance, at: (d) => R.walk(d, R.WALK) },
  { name: 'stand (baseline)', kind: 'oneShot', at: () => R.stand(T) },
  { name: 'seated (baseline)', kind: 'oneShot', at: () => R.seated(21, T) },

  // ── the movement library ───────────────────────────────────────────────────
  // 24 travel modes · 15 postures · 58 one-shot actions · 30 prop actions.
  ...Array.from({ length: 24 }, (_, mode) => ({
    name: `move ${mode}`, kind: 'gait',
    cycle: M.gaitFor(mode).S / M.gaitFor(mode).stance,
    // Mode 10 backs away: it runs the cycle in reverse, so the body advances by
    // -d and the skate check has to follow it rather than assume +d.
    dirSign: mode === 10 ? -1 : 1,
    at: (d) => M.moveStance(mode, d),
  })),
  ...Array.from({ length: 15 }, (_, code) => ({
    name: `posture ${code}`, kind: 'oneShot', at: () => M.postureHold(code, T),
  })),
  ...Array.from({ length: 58 }, (_, i) => ({
    name: `act ${i + 1}`, kind: 'oneShot', at: (u) => M.actStance(i + 1, T, u),
  })),

  // ── interact.ts: props and pairs ───────────────────────────────────────────
  // Carrying rides a travel mode, so it must still foot-lock — that is the whole
  // risk of layering an upper body onto a gait.
  ...[1, 2, 3, 4, 5].map((hold) => ({
    name: `carry walk/${hold}`, kind: 'gait',
    cycle: M.gaitFor(0).S / M.gaitFor(0).stance,
    at: (d) => I.carryMode(0, d, hold),
  })),
  ...[1, 2, 3, 4, 5].map((hold) => ({
    name: `carry hurry/${hold}`, kind: 'gait',
    cycle: M.gaitFor(2).S / M.gaitFor(2).stance,
    at: (d) => I.carryMode(2, d, hold),
  })),
  ...Array.from({ length: 30 }, (_, i) => ({
    name: `prop ${i + 1}`, kind: 'oneShot', at: (u) => I.propAct(i + 1, T, u),
  })),

  // Two figures 56 apart and facing — inside the reach limit, so their hands are
  // supposed to meet. `pair` carries the shared point the check verifies against.
  { name: 'handshake A', kind: 'oneShot', at: (u) => I.handshake(T, u, PA, PB).a, pair: 'shake', side: 'a' },
  { name: 'handshake B', kind: 'oneShot', at: (u) => I.handshake(T, u, PA, PB).b, pair: 'shake', side: 'b' },
  { name: 'passObject A', kind: 'oneShot', at: (u) => I.passObject(T, u, PA, PB).a, pair: 'pass', side: 'a' },
  { name: 'passObject B', kind: 'oneShot', at: (u) => I.passObject(T, u, PA, PB).b, pair: 'pass', side: 'b' },
];

// SELF-TEST. `--probe` registers a deliberately broken motion for each check and
// expects every one to be caught. A check that never fails is not a check, and
// this is cheaper than remembering to hand-verify that after every edit.
if (process.argv.includes('--probe')) {
  const st = R.stand(T);
  MOTIONS.length = 0;
  MOTIONS.push(
    { name: 'probe skate', kind: 'gait', cycle: 40, at: (d) => ({ ...R.walk(d, R.WALK), footL: { x: d * 0.5, y: 0 } }) },
    { name: 'probe ground', kind: 'oneShot', at: () => ({ ...st, bob: st.bob - 90 }) },
    { name: 'probe continuity', kind: 'oneShot', at: (u) => ({ ...st, bob: st.bob + (u > 0.5 ? 40 : 0) }) },
    { name: 'probe landing', kind: 'oneShot', at: () => st, lands: () => R.seated(21, T) },
  );
}

if (!process.argv.includes('--probe')) checkWalkUnchanged();

const PAIRS = {};
for (const m of MOTIONS) {
  if (!m.pair) continue;
  PAIRS[m.pair] = PAIRS[m.pair] || {};
  PAIRS[m.pair][m.side] = m;
}
checkMeet(PAIRS);

for (const m of MOTIONS) {
  checkSkate(m.name, m); checkGround(m.name, m);
  checkContinuity(m.name, m); checkLanding(m.name, m); checkHead(m.name, m);
}


if (fail.length) {
  console.log(`\n${fail.length} problem(s):\n`);
  for (const f of fail) console.log(`  ${f.motion.padEnd(22)} ${f.check.padEnd(11)} ${f.detail}`);
  process.exit(1);
}
if (headDebt.length > HEAD_DEBT_BUDGET) {
  console.log(`\nhead debt grew: ${headDebt.length} against a budget of ${HEAD_DEBT_BUDGET}`);
  process.exit(1);
}
if (headDebt.length) {
  console.log(
    `\nhead debt ${headDebt.length}/${HEAD_DEBT_BUDGET} — a hand inside the skull, ` +
      `from before the check existed:\n  ${headDebt.join('\n  ')}\n` +
      '  Push the hand FORWARD, not up. Fix one and lower HEAD_DEBT_BUDGET.',
  );
}
console.log(`${MOTIONS.length} motion(s) pass all six checks.`);
