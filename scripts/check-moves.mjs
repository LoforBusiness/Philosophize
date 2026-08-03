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
    .replace(/(from\s+['"])\.\/rig(['"])/g, '$1./rig.mjs$2');
  const out = path.join(TMP, name);
  writeFileSync(out, js);
  return pathToFileURL(out).href;
}

emit('components/lesson/cinematic/rig.ts', 'rig.mjs');
const R = await import(pathToFileURL(path.join(TMP, 'rig.mjs')).href);
const M = await import(emit('components/lesson/cinematic/moves.ts', 'moves.mjs'));

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

// ── check 2 · nothing may go through the floor ───────────────────────────────
function checkGround(name, m) {
  for (let i = 0; i <= FRAMES; i++) {
    const j = solveAt(m.at(sampleAt(m, i)), 200);
    for (const [k, p] of Object.entries(j)) {
      if (p.y > GROUND + 0.5) {
        note(name, 'ground', `${k} is ${(p.y - GROUND).toFixed(1)} below the ground line`);
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
const MOTIONS = [
  { name: 'walk (baseline)', kind: 'gait', cycle: R.WALK.S / R.WALK.stance, at: (d) => R.walk(d, R.WALK) },
  { name: 'stand (baseline)', kind: 'oneShot', at: () => R.stand(T) },
  { name: 'seated (baseline)', kind: 'oneShot', at: () => R.seated(21, T) },

  // ── the movement library ───────────────────────────────────────────────────
  // 12 travel modes · 15 postures · 28 one-shot actions.
  ...Array.from({ length: 12 }, (_, mode) => ({
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
  ...Array.from({ length: 28 }, (_, i) => ({
    name: `act ${i + 1}`, kind: 'oneShot', at: (u) => M.actStance(i + 1, T, u),
  })),
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

for (const m of MOTIONS) {
  checkSkate(m.name, m); checkGround(m.name, m);
  checkContinuity(m.name, m); checkLanding(m.name, m);
}


if (fail.length) {
  console.log(`\n${fail.length} problem(s):\n`);
  for (const f of fail) console.log(`  ${f.motion.padEnd(22)} ${f.check.padEnd(11)} ${f.detail}`);
  process.exit(1);
}
console.log(`${MOTIONS.length} motion(s) pass all five checks.`);
