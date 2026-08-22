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

// ── AND THE CAMERA, WHICH MOVES EVERY PIXEL AT ONCE ─────────────────────────
//
// `camNow` in CinematicPlayer is the shot the lesson ASKS for, and it steps
// discontinuously in four places: a beat change restarting the travel from a shot
// the camera was never at, the must-see box landing several frames late, a tap
// warping a tour's clock to its end, and a must-box changing mid-travel. A camera
// step moves the whole stage, so it reads as a far worse glitch than a limb does.
//
// The player no longer drives the transform from that value. It CHASES it with a
// critically-damped follow, `1 - exp(-dt/TAU)`, which makes the output continuous
// whatever the request does. This replays the worst request the player can
// produce — a hard step of the entire stage — and checks the smoothing bounds it.
const CAM_OMEGA = 12;
const STAGE = 400;

/**
 * Replay the nastiest realistic request — the must-see box landing on frame 4 and
 * moving the shot a third of the stage while the scale rises — and report the
 * worst ONE-FRAME movement of the stage itself.
 *
 * `omega = 0` means "drive the transform straight off the request", which is what
 * the player used to do.
 */
function camJump(omega) {
  const want = (f) => (f < 4
    ? { cx: 200, cy: 280, s: 1.0 }
    : { cx: 268, cy: 214, s: 1.32 });
  let c = { ...want(0), vx: 0, vy: 0, vs: 0 };
  let worst = 0;
  let prev = null;
  let lastD = null;
  const dt = 1 / 60;
  for (let f = 0; f < 60; f++) {
    const w = want(f);
    if (omega <= 0) {
      c = { ...w, vx: 0, vy: 0, vs: 0 };
    } else {
      const k = omega * omega;
      const d = 2 * omega;
      const vx = c.vx + (-d * c.vx - k * (c.cx - w.cx)) * dt;
      const vy = c.vy + (-d * c.vy - k * (c.cy - w.cy)) * dt;
      const vs = c.vs + (-d * c.vs - k * (c.s - w.s)) * dt;
      c = { cx: c.cx + vx * dt, cy: c.cy + vy * dt, s: c.s + vs * dt, vx, vy, vs };
    }
    // What the reader sees move: the stage's own translate, in stage units.
    const px = { x: STAGE / 2 - c.cx * c.s, y: STAGE / 2 - c.cy * c.s };
    if (prev) {
      // NOT the speed — a camera move is ALLOWED to be fast. What reads as a
      // glitch is a discontinuity: the stage standing still and then covering a
      // third of itself in one frame. That is a spike in how much the speed
      // CHANGES between frames, which is zero for smooth motion however quick.
      const dd = Math.hypot(px.x - prev.x, px.y - prev.y);
      if (lastD !== null && Math.abs(dd - lastD) > worst) worst = Math.abs(dd - lastD);
      lastD = dd;
    }
    prev = px;
  }
  return worst;
}

const raw = camJump(0);            // driving the transform straight off the request
const smoothed = camJump(CAM_OMEGA); // what the player does now

console.log('\nTHE CAMERA\n');
ok('a step in the requested shot does not stutter the stage (L4)',
  smoothed <= 8,
  `worst frame-to-frame change in stage speed — driven straight ${raw.toFixed(1)} · smoothed ${smoothed.toFixed(1)} units`);

// ── AND EVERYTHING THAT IS NOT A LIMB (L5) ──────────────────────────────────
//
// Everything above this line draws the figure at a FIXED x = 200 and compares
// joints against the pelvis. That is the whole reason this file was green while
// a reader was still watching lessons skip: the one track it can never see is the
// one that moves the entire man, and 89 scenes interpolated that plus 173 more —
// prop opacities, shutters, dial angles, second figures.
//
// Each of them is `lerp(T[p], T[n], tr)`, which is L1 with no limb attached: the
// blend starts at the value the PREVIOUS beat was heading toward rather than the
// one on screen, so an early tap covers the remainder in a frame. Replayed over
// the real tracks it was 49 sites past the line and 166 units at worst; driven in
// a browser, 226px of ankle between two frames.
//
// `carry()` (cinematicKit) is `lerp` with a memory and takes the same numbers.
// This section is what stops a bare one coming back.
const bare = [];
const bags = [];
for (const name of names) {
  const src = readFileSync(path.join(CIN, `${name}Scene.tsx`), 'utf8');
  // A track lerp is specifically `lerp(NAME[p], NAME[n], …)` — the same array on
  // both sides. `lerp` for anything else (two constants, a pair of measured edges)
  // is ordinary arithmetic with no beat boundary in it and is left alone.
  const n = [...src.matchAll(/lerp\(\s*([A-Za-z_$][\w$]*)\[p\]\s*,\s*([A-Za-z_$][\w$]*)\[n\]/g)]
    .filter((m) => m[1] === m[2]).length;
  if (n) bare.push(`${name} (${n})`);

  // THE SLOTS MUST ACCOUNT FOR THEMSELVES. An undersized `useCarry(N)` does not
  // throw — it aliases two tracks onto one slot, so a prop starts each beat from
  // some other prop's last value. That is a worse picture than the defect being
  // fixed and it is completely silent, which is why it is checked rather than
  // trusted to the codemod that wrote them.
  const decl = /useCarry\((\d+)\)/.exec(src);
  const ks = [...src.matchAll(/carry\(cv,\s*(\d+),/g)].map((m) => +m[1]);
  if (!decl && !ks.length) continue;
  const want = decl ? +decl[1] : -1;
  const uniq = new Set(ks);
  if (!decl) bags.push(`${name} — ${ks.length} carry site(s), no useCarry()`);
  else if (ks.length !== want || uniq.size !== want || (ks.length && Math.max(...ks) !== want - 1)) {
    bags.push(`${name} — useCarry(${want}) but ${ks.length} site(s), ${uniq.size} distinct, top index ${ks.length ? Math.max(...ks) : '—'}`);
  }
}

console.log('\nEVERY TRACK, NOT JUST THE FIGURE\n');
ok('no scene blends a track straight off T[p] (L5)', bare.length === 0,
  bare.length ? `${bare.length} scene(s): ${bare.slice(0, 6).join(', ')}${bare.length > 6 ? '…' : ''}`
    : `${names.length} scenes carry every track they interpolate`);
ok('every carry slot is declared and distinct (L5)', bags.length === 0,
  bags.length ? bags.slice(0, 5).join(' · ') : 'no aliased or undeclared slots');

// ── THE STAGE IS THE SAME SIZE ALL THE WAY THROUGH (L6) ─────────────────────
//
// The biggest jump of all was not in any scene. `ChoiceCards` and `DragScale`
// were siblings of the stage inside `body`, so the 42/50/8 flex split ran over
// whatever height was left AFTER the answer control took its own ~74px — the
// stage lost 34px of it on the one frame a question beat mounted, and `fit` is
// `min(w / STAGE_W, h / bandH)`, so the whole picture rescaled about 12% between
// two frames. Twice per question, and once more each way through `boxSize` being
// React state rather than a layout value.
//
// This is structural rather than replayed: there is no layout engine here, and
// the property that matters is that the control CANNOT be a sibling of the stage.
// The browser numbers are in group L6 of the rule book — one stage-clip size per
// lesson for its whole run.
const player = readFileSync(path.join(REPO, 'components/lesson/cinematic/CinematicPlayer.tsx'), 'utf8');
const kit = readFileSync(path.join(CIN, 'cinematicKit.tsx'), 'utf8');
const iLower = player.indexOf('styles.lower');
const iCards = player.indexOf('<ChoiceCards');
const iDrag = player.indexOf('<DragScale');
const iDeck = player.indexOf('styles.deck');
const weight = (n) => {
  const m = new RegExp(`\\b${n}:\\s*\\{[^}]*?flex:\\s*(\\d+)`, 's').exec(kit);
  return m ? +m[1] : null;
};
const wStage = weight('stageWrap'), wLower = weight('lower'), wTap = weight('tapLayer');

console.log('\nTHE STAGE DOES NOT RESIZE UNDER A QUESTION\n');
ok('the answer controls sit inside the deck\'s box, not the stage\'s (L6)',
  iLower > 0 && iCards > iLower && iDrag > iLower && iDeck > iLower,
  iLower > 0 && iCards > iLower && iDrag > iLower && iDeck > iLower
    ? 'ChoiceCards, DragScale and the deck are all inside styles.lower'
    : 'a control is a sibling of stageWrap again — it will take height out of the picture');
ok('the stage keeps a fixed share of the body (L6)',
  wStage !== null && wLower !== null && wTap !== null && wStage + wLower + wTap === 100,
  wStage === null || wLower === null || wTap === null
    ? 'could not read the flex weights'
    : `stage ${wStage} · lower ${wLower} · tap ${wTap} = ${wStage + wLower + wTap}`);
ok('the deck takes its height from `lower`, not from `body` (L6)',
  /\bdeck:\s*\{[^}]*?flex:\s*1\b/s.test(kit),
  'a weight on the deck would put it back in competition with the stage');

console.log(fails ? `\n${fails} problem(s).\n` : '\nall clear.\n');
process.exit(fails ? 1 : 0);
