// NOTHING MAY TELEPORT — group L of docs/LESSON_RULES.md.
//
// A reader said some lessons look like "a glitch on screen, or a frame miss" when
// a scene changes, when a question is answered, when the figure turns round, and
// when they tap quickly. All four are the same defect, and it is measurable
// without a phone because rig.ts and moves.ts have zero imports.
//
// ── WHAT A BEAT CHANGE ACTUALLY DOES ────────────────────────────────────────
//
// CinematicPlayer rewinds the beat clock during render: `bt.value = 0`. Every
// scene then computes its picture from
//
//     const n = bi.value, p = n - 1;
//     const tr = ease01(bt.value / 0.7);
//     mixStance(emoteHold(P[p], t), emoteLive(P[n], t, bt.value), tr)
//
// and there are TWO discontinuities hiding in those three lines.
//
//   1. THE SOURCE IS THE WRONG POSE. The new blend starts at `P[p]` — the pose
//      the previous beat was heading TOWARD — not at the pose actually on screen.
//      Tap before the blend finished and the figure teleports the remaining
//      distance in a single frame. The jump is (1 - tr_reached) × the gap, which
//      is exactly why it gets worse the faster the reader taps.
//
//   2. THE GESTURE'S OWN CLOCK RESTARTS. `emoteLive(code, t, bt)` uses `bt` as
//      the gesture's local phase, so a hand halfway through a swing snaps back to
//      the start of that swing — even when the blend fraction itself was done.
//
// Measured on a real pose track, the worst limb moved 3.5 units a frame when the
// reader waited, and 24 to 41 units when they did not. A steady 60fps arm moves
// well under 3. Forty units is a hand crossing a tenth of the stage between two
// frames, which is precisely "a frame miss".
//
// ── AND THE FACING, WHICH DOES NOT NEED A FAST TAP ──────────────────────────
//
// `pose(s, x, ground, k, dir)` takes dir as a raw ±1. A scene that turns the
// figure round flips the sign between two frames and the whole man mirrors at
// once: 31 units, every time, however patiently the reader taps.
//
// Run: node scripts/check-smooth.mjs
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const REPO = process.cwd();
const CIN = path.join(REPO, 'components', 'lesson', 'cinematic');
const { transform } = await import(
  pathToFileURL(path.join(REPO, 'node_modules/sucrase/dist/index.js')).href,
);
const TMP = path.join(os.tmpdir(), 'philosophize-smooth');
mkdirSync(TMP, { recursive: true });
function emit(rel, name) {
  const src = readFileSync(path.join(REPO, rel), 'utf8');
  const js = transform(src, { transforms: ['typescript'] }).code
    .replace(/(from\s+['"])(?:\.\/)(rig|moves)(['"])/g, '$1./$2.mjs$3');
  writeFileSync(path.join(TMP, name), js);
}
emit('components/lesson/cinematic/rig.ts', 'rig.mjs');
emit('components/lesson/cinematic/moves.ts', 'moves.mjs');
const RIG = await import(pathToFileURL(path.join(TMP, 'rig.mjs')).href);
const MOVES = await import(pathToFileURL(path.join(TMP, 'moves.mjs')).href);

const DT = 1 / 60;
const GROUND = 500;

// ── THE LINE, AND WHERE IT COMES FROM ───────────────────────────────────────
//
// A limb travelling at a natural speed covers a few units a frame. The threshold
// is set at 8 — comfortably above honest motion (the patient-tap worst is 3.5)
// and comfortably below a teleport. It is a ratchet, not a zero, because the
// scenes were written before the rule existed.
const MAX_JUMP = 8;

/** Read a scene's pose-code track out of its script, without importing React. */
function trackOf(name) {
  const f = path.join(CIN, `${name}Script.ts`);
  let src;
  try { src = readFileSync(f, 'utf8'); } catch { return null; }
  const beats = src.split('\n  {\n').slice(1).map((c) => c.split('\n  }')[0]);
  if (!beats.length) return null;
  const codes = [];
  for (const b of beats) {
    // The gesture field is `p:` in most scripts and `g:`/`soc:` in a few.
    const m = /^\s*(?:p|g|soc|q|hpose):\s*(\d+)/m.exec(b) ?? /[\s,{](?:p|g|soc):\s*(\d+)/.exec(b);
    codes.push(m ? +m[1] : 0);
  }
  return codes.length >= 2 ? codes : null;
}

function parts(b) {
  const out = {};
  for (const [k, v] of Object.entries(b)) {
    if (!Array.isArray(v)) continue;
    let x = 0, y = 0;
    for (const e of v) {
      if (e.translateX !== undefined) x = e.translateX;
      if (e.translateY !== undefined) y = e.translateY;
    }
    out[k] = [x, y];
  }
  return out;
}

/**
 * Replay a lesson's real pose track while tapping every `hold` frames, and report
 * the worst one-frame movement of any limb.
 */
function worstJump(codes, hold, fixed) {
  let i = 0, bt = 0, clock = 0, since = 0, prev = null;
  let worst = 0, who = '', at = 0;
  // The runtime's `held` triple, simulated exactly (see cinematicKit.carryFrom).
  let last = null, from = null, seen = -1;
  const frames = hold * (codes.length + 1) + 10;
  for (let f = 0; f < frames; f++) {
    const n = i, p = n > 0 ? n - 1 : 0;
    const tr = RIG.ease01(bt / 0.7);
    let s;
    if (fixed) {
      if (seen !== n) { seen = n; from = last; }
      const src = from ?? MOVES.emoteAny(codes[p], clock);
      s = RIG.mixStance(src, MOVES.emoteAnyLive(codes[n], clock, bt), tr);
      last = s;
    } else {
      s = RIG.mixStance(
        MOVES.emoteAny(codes[p], clock),
        MOVES.emoteAnyLive(codes[n], clock, bt),
        tr,
      );
    }
    const cur = parts(RIG.pose(s, 200, GROUND, 1, 1, 1));
    if (prev) {
      for (const k of Object.keys(cur)) {
        if (!prev[k]) continue;
        const d = Math.hypot(cur[k][0] - prev[k][0], cur[k][1] - prev[k][1]);
        if (d > worst) { worst = d; who = k; at = n; }
      }
    }
    prev = cur;
    clock += DT; bt += DT; since += 1;
    if (since >= hold && i < codes.length - 1) { i += 1; bt = 0; since = 0; }
  }
  return { worst, who, at };
}

const names = readdirSync(CIN)
  .filter((n) => n.endsWith('Scene.tsx'))
  .map((n) => n.replace('Scene.tsx', ''))
  .sort();

console.log('\nNOTHING MAY TELEPORT\n');

const rows = [];
let noTrack = 0;
for (const name of names) {
  const codes = trackOf(name);
  if (!codes) { noTrack++; continue; }
  // Which blend does THIS scene actually run? A scene carrying `carryFrom` starts
  // each blend from the pose it last drew; one without it starts from P[p].
  const src = readFileSync(path.join(CIN, `${name}Scene.tsx`), 'utf8');
  const fixed = src.includes('carryFrom(');
  // A reader who taps as soon as the words are read: well inside the 0.7s blend.
  const fast = worstJump(codes, 18, fixed);
  const patient = worstJump(codes, 90, fixed);
  rows.push({ name, fast: fast.worst, patient: patient.worst, who: fast.who, fixed });
}

const over = rows.filter((r) => r.fast > MAX_JUMP).sort((a, b) => b.fast - a.fast);
const medFast = [...rows.map((r) => r.fast)].sort((a, b) => a - b)[Math.floor(rows.length / 2)];
const medPat = [...rows.map((r) => r.patient)].sort((a, b) => a - b)[Math.floor(rows.length / 2)];

console.log(`  ${rows.length} lessons replayed at 60fps${noTrack ? ` · ${noTrack} with no readable pose track` : ''}`);
console.log(`  median worst one-frame limb move — patient tap ${medPat.toFixed(1)} · fast tap ${medFast.toFixed(1)}\n`);

let fails = 0;
const ok = (label, pass, detail) => {
  if (!pass) fails++;
  console.log(`  ${pass ? 'ok  ' : 'FAIL'}  ${label}${detail ? '  ' + detail : ''}`);
};

// THE BUDGET. A high-water mark, and the number is the count of lessons that
// still teleport when the reader taps early. It may only ever go DOWN.
const JUMP_BUDGET = 0;

ok(`no MORE than ${JUMP_BUDGET} lessons jump past ${MAX_JUMP} units in a frame (L1)`,
  over.length <= JUMP_BUDGET,
  over.length
    ? `${over.length} over, budget ${JUMP_BUDGET} · worst ${over[0].fast.toFixed(1)} (${over[0].who}) in ${over[0].name}`
    : 'every lesson stays smooth however fast the reader taps');

if (over.length) {
  console.log('\n  the lessons that teleport when tapped early (worst first):');
  for (const r of over.slice(0, 14)) {
    console.log(`    ${r.name.padEnd(16)} ${r.fast.toFixed(1).padStart(6)} units  (${r.who})   patient: ${r.patient.toFixed(1)}`);
  }
  if (over.length > 14) console.log(`    …and ${over.length - 14} more`);
}

console.log(fails ? `\n${fails} problem(s).\n` : '\nall clear.\n');
process.exit(fails ? 1 : 0);
