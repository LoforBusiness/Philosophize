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
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const REPO = process.cwd();
const { transform } = await import(
  pathToFileURL(path.join(REPO, 'node_modules/sucrase/dist/index.js')).href,
);

async function load(rel) {
  const src = readFileSync(path.join(REPO, rel), 'utf8');
  const js = transform(src, { transforms: ['typescript'] }).code;
  return import('data:text/javascript;base64,' + Buffer.from(js).toString('base64'));
}

const R = await load('components/lesson/cinematic/rig.ts');

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
      const world = d + s[foot].x;                 // body advances by d
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

// ── check 3 · a hand asking for a point outside the arm's reach ──────────────
//
// MEASURE THE CLAMP'S INPUT, NOT ITS OUTPUT. The first version of this compared
// the SOLVED wrist against the arm length, and every motion came back at ~100%
// — because `reachable()` pulls any impossible target back onto the reach circle,
// so the solved wrist sits AT 32.98 by construction exactly when it is clamped.
// It was measuring the clamp reporting its own boundary. The real question is
// what the pose ASKED for: shoulder → fist TARGET, before the clamp.
//
// Why it matters: past full extension the elbow is pinned dead straight, the hand
// stops tracking its target, and the next move back inside range springs it out in
// a single frame. `seated` in rig.ts carries a long comment about being retuned to
// ~92% for precisely this, and it measures 0% over-reach here — so the standard is
// demonstrably reachable.
const KNOWN_OVERREACH = {
  // PRE-EXISTING AND DELIBERATELY NOT FIXED HERE. Measured: walk's far (left) arm
  // asks for 36.19 of a 33-unit arm — 110% — on 61% of the stride, and stand's on
  // 20%. Both ship in all 84 cinematic lessons, and Task 2 of this work requires
  // walk() stay byte-identical, so correcting them is a separate change with its
  // own before/after on every walking figure. Listed rather than silenced: the
  // threshold stays honest for new motions, and these are printed on every run so
  // they cannot quietly become the standard.
  'walk (baseline)': 'the far arm, 110% on 61% of the stride',
  'stand (baseline)': 'the far arm, 100% on 20% of the idle',
};
function checkReach(name, m) {
  for (const [fist, sh] of [['fistL', 'shL'], ['fistR', 'shR']]) {
    let over = 0;
    for (let i = 0; i <= FRAMES; i++) {
      const s = m.at(sampleAt(m, i));
      const j = solveAt(s, 200);
      // The fist target is PELVIS-relative; the shoulder comes back in stage
      // coordinates. dir = 1 and k = 1, so the two frames coincide.
      const d = Math.hypot(j.pel.x + s[fist].x - j[sh].x, j.pel.y + s[fist].y - j[sh].y);
      if (d > ARM) over++;
    }
    const pct = Math.round((over / (FRAMES + 1)) * 100);
    if (pct > 15 && !KNOWN_OVERREACH[name]) {
      note(name, 'reach', `${fist} asks past the arm's reach on ${pct}% of frames — the elbow is pinned straight there`);
    }
  }
}

// ── check 4 · smoothness, measured rather than judged ────────────────────────
// A per-frame jump in any field is exactly what "not smooth" means. The budget is
// generous because a real motion moves fast; it is here to catch discontinuities,
// not to police speed.
function checkContinuity(name, m) {
  let prev = null, worstK = '', worst = 0;
  for (let i = 0; i <= FRAMES; i++) {
    const s = m.at(sampleAt(m, i));
    const flat = {
      tilt: s.tilt * 60, neck: s.neck * 60, bob: s.bob,
      flx: s.footL.x, fly: s.footL.y, frx: s.footR.x, fry: s.footR.y,
      hlx: s.fistL.x, hly: s.fistL.y, hrx: s.fistR.x, hry: s.fistR.y,
    };
    if (prev) {
      for (const k of Object.keys(flat)) {
        const d = Math.abs(flat[k] - prev[k]);
        if (d > worst) { worst = d; worstK = k; }
      }
    }
    prev = flat;
  }
  if (worst > 12) note(name, 'continuity', `${worstK} jumps ${worst.toFixed(1)} units between frames`);
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

// ── the register ─────────────────────────────────────────────────────────────
// `gait`   : at(distance) -> Stance, cycle = distance per stride cycle
// `oneShot`: at(u 0..1)   -> Stance
// `lands`  : optional destination pose a transition must equal at u = 1
const T = 3.0;                               // a fixed clock, so runs are comparable
const MOTIONS = [
  { name: 'walk (baseline)', kind: 'gait', cycle: R.WALK.S / R.WALK.stance, at: (d) => R.walk(d, R.WALK) },
  { name: 'stand (baseline)', kind: 'oneShot', at: () => R.stand(T) },
  { name: 'seated (baseline)', kind: 'oneShot', at: () => R.seated(21, T) },
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
    { name: 'probe reach', kind: 'oneShot', at: () => ({ ...st, fistR: { x: 60, y: -20 } }) },
    { name: 'probe continuity', kind: 'oneShot', at: (u) => ({ ...st, bob: st.bob + (u > 0.5 ? 40 : 0) }) },
    { name: 'probe landing', kind: 'oneShot', at: () => st, lands: () => R.seated(21, T) },
  );
}

for (const m of MOTIONS) {
  checkSkate(m.name, m); checkGround(m.name, m);
  checkReach(m.name, m); checkContinuity(m.name, m); checkLanding(m.name, m);
}

// NO SILENT EXEMPTIONS. Anything the run declines to judge is printed, so a
// waiver stays visible instead of turning into the standard by being forgotten.
for (const [k, why] of Object.entries(KNOWN_OVERREACH)) {
  if (MOTIONS.some((m) => m.name === k)) console.log(`  ~ ${k}: reach check waived — ${why}`);
}

if (fail.length) {
  console.log(`\n${fail.length} problem(s):\n`);
  for (const f of fail) console.log(`  ${f.motion.padEnd(22)} ${f.check.padEnd(11)} ${f.detail}`);
  process.exit(1);
}
console.log(`${MOTIONS.length} motion(s) pass all five checks.`);
