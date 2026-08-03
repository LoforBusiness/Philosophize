# Stickman Movement Library Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add eighteen stickman motions — six travel gaits, two asymmetric gaits, four one-shots and six change-of-level transitions — so lessons can stage movement the current library cannot express, and so a figure changing level stops sliding its feet.

**Architecture:** All new motions live in a new `components/lesson/cinematic/moves.ts` that imports only from `./rig`. `rig.ts` gets exactly one change: an optional `armY` field on `Gait`, read by `walk()`. Verification is a Node script that loads the TypeScript directly through sucrase and measures the figure numerically, plus filmstrip sheets rendered with jimp-compact.

**Tech Stack:** TypeScript, React Native Reanimated worklets, Node 24 for verification, sucrase (transpile TS in Node), jimp-compact (draw sheets). Both verification libraries are already in `node_modules`.

## Global Constraints

- **`rig.ts` must keep zero imports.** It is what lets the rig run in plain Node. `moves.ts` may import from `./rig`; `rig.ts` must never import from `./moves` (that would be a cycle).
- **Every exported motion function carries `'worklet'` as its first statement.** These run on the UI thread. A missing directive fails at runtime, not at compile time.
- **No existing lesson may change.** All 84 cinematic lessons must be untouched by this work.
- **`npm run check` must stay green** — `npx tsc --noEmit && node scripts/validate-lessons.mjs && node scripts/validate-cinematic.mjs`.
- **Rig conventions:** pelvis origin; `+x` is facing; **negative y is up**; foot targets are GROUND-relative (`y: 0` = planted, negative = lifted); fist targets are PELVIS-relative.
- **Figure dimensions:** arm reach `U.uarm + U.farm` = **33**; leg `U.thigh + U.shin` = **37**; standing pelvis height `U.standH` = **34**; head radius `STR.headR` = **20**, head centre near `(0, −49)`.
- **No new colours anywhere.** Motions return pose data only.
- **Commit after every task.**

---

## File Structure

| File | Responsibility |
|---|---|
| `components/lesson/cinematic/rig.ts` | **Modify.** Add optional `armY` to `Gait`; read it in `walk()`. Nothing else. |
| `components/lesson/cinematic/moves.ts` | **Create.** All eighteen motions plus the `MOVES` index. |
| `scripts/check-moves.mjs` | **Create.** The verification harness: five numeric checks over every motion. Runs in plain Node. |
| `scripts/sheet-moves.mjs` | **Create.** Filmstrip renderer — writes one PNG per motion for eyeballing. |

---

## Two facts the harness depends on (verified, not assumed)

**1. `Cfg` is flat.** `solve()` does *not* take a nested stance. The stance fields spread in alongside the placement fields:

```js
solve({ x: 200, groundY: 500, k: 1, dir: 1, ...stance })
```

Passing `{ ..., s: stance }` silently produces a broken figure. `solve()` returns joints keyed:
`pel chest head shB shL shR hipL hipR kneeL kneeR ankL ankR elL elR wrL wrR`.

**2. Loading `rig.ts` in Node works via sucrase + a data URL.** Verified: 84 exports, and `walk()`'s planted foot drifts **0.0000 units** over a full stride. That zero is the calibration baseline for the skating check — a check that cannot report zero on `WALK` is broken.

---

### Task 1: The verification harness

Build the harness first: it is the test cycle for every task after this one, and it must be calibrated against the *existing* motions before any new motion trusts it.

**Files:**
- Create: `scripts/check-moves.mjs`
- Create: `scripts/sheet-moves.mjs`

**Interfaces:**
- Consumes: `rig.ts` exports (`walk`, `WALK`, `stand`, `seated`, `solve`, `U`, `STR`).
- Produces: `node scripts/check-moves.mjs` exits 0 when every registered motion passes all five checks and non-zero otherwise, printing the failing motion, check and measurement. `scripts/sheet-moves.mjs` writes PNGs to `.moves-sheets/`.

- [ ] **Step 1: Write the harness with the five checks, registering only EXISTING motions**

Create `scripts/check-moves.mjs`:

```js
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
    const s = m.at(m.kind === 'gait' ? (i / FRAMES) * m.cycle : i / FRAMES);
    const j = solveAt(s, 200);
    for (const [k, p] of Object.entries(j)) {
      if (p.y > GROUND + 0.5) {
        note(name, 'ground', `${k} is ${(p.y - GROUND).toFixed(1)} below the ground line`);
        return;
      }
    }
  }
}

// ── check 3 · a hand pinned at full reach makes the elbow snap ───────────────
// At >=98% of a 33-unit arm the IK clamps: the elbow sits a fraction off dead
// straight, and any move back inside range springs it out in a single frame. The
// `seated` comment in rig.ts documents this at length. Brief full extension is
// fine and normal — a SUSTAINED one is the defect, so this measures duration.
function checkReach(name, m) {
  for (const [hand, sh] of [['wrL', 'shL'], ['wrR', 'shR']]) {
    let run = 0, worst = 0;
    for (let i = 0; i <= FRAMES; i++) {
      const s = m.at(m.kind === 'gait' ? (i / FRAMES) * m.cycle : i / FRAMES);
      const j = solveAt(s, 200);
      const d = Math.hypot(j[hand].x - j[sh].x, j[hand].y - j[sh].y);
      run = d >= ARM * 0.98 ? run + 1 : 0;
      worst = Math.max(worst, run);
    }
    if (worst > FRAMES * 0.25) {
      note(name, 'reach', `${hand} clamped at full extension for ${Math.round((worst / FRAMES) * 100)}% of the motion`);
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
    const s = m.at(m.kind === 'gait' ? (i / FRAMES) * m.cycle : i / FRAMES);
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

for (const m of MOTIONS) {
  checkSkate(m.name, m); checkGround(m.name, m);
  checkReach(m.name, m); checkContinuity(m.name, m); checkLanding(m.name, m);
}

if (fail.length) {
  console.log(`\n${fail.length} problem(s):\n`);
  for (const f of fail) console.log(`  ${f.motion.padEnd(22)} ${f.check.padEnd(11)} ${f.detail}`);
  process.exit(1);
}
console.log(`${MOTIONS.length} motion(s) pass all five checks.`);
```

- [ ] **Step 2: Run it against the existing motions to calibrate**

Run: `node scripts/check-moves.mjs`
Expected: **PASS** — `3 motion(s) pass all five checks.`

This is the calibration gate. If any baseline fails, the check is wrong, not `walk`/`stand`/`seated` — those three ship in 84 lessons. Fix the check before continuing.

- [ ] **Step 3: Prove each check can actually fail**

Temporarily add this deliberately broken motion to `MOTIONS`, run, confirm it is caught, then delete it:

```js
  { name: 'BROKEN probe', kind: 'gait', cycle: 40,
    at: (d) => ({ ...R.walk(d, R.WALK), footL: { x: d * 0.5, y: 0 } }) },
```

Run: `node scripts/check-moves.mjs`
Expected: **FAIL**, reporting `BROKEN probe  skate  planted foot drifts ...`.
A check that never fails is not a check. Delete the probe once it has fired.

- [ ] **Step 4: Write the filmstrip renderer**

Create `scripts/sheet-moves.mjs`:

```js
// Twenty frames of a motion drawn side by side, so a pose that is numerically
// valid and visually meaningless gets caught. Numbers find geometry; only the
// sheet finds "that does not look like the thing it is called".
import { readFileSync, mkdirSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import Jimp from 'jimp-compact';

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

const N = 20, CELL = 150, H = 260, GROUND = 210;
const INK = 0x1a1a1aff, PAPER = 0xfafaf7ff, RULE = 0xd8d5ccff;

function line(img, a, b, w) {
  const n = Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) * 2) + 1;
  for (let i = 0; i <= n; i++) {
    const x = a.x + ((b.x - a.x) * i) / n, y = a.y + ((b.y - a.y) * i) / n;
    for (let dx = -w; dx <= w; dx++) for (let dy = -w; dy <= w; dy++) {
      if (dx * dx + dy * dy <= w * w) img.setPixelColor(INK, Math.round(x + dx), Math.round(y + dy));
    }
  }
}
function disc(img, c, r) {
  for (let dx = -r; dx <= r; dx++) for (let dy = -r; dy <= r; dy++) {
    if (dx * dx + dy * dy <= r * r) img.setPixelColor(INK, Math.round(c.x + dx), Math.round(c.y + dy));
  }
}

export async function sheet(name, frames) {
  const img = new Jimp(CELL * N, H, PAPER);
  for (let i = 0; i < N; i++) {
    const ox = i * CELL;
    for (let x = 0; x < CELL; x++) img.setPixelColor(RULE, ox + x, GROUND);
    const j = R.solve({ x: ox + CELL / 2, groundY: GROUND, k: 1.1, dir: 1, ...frames[i] });
    line(img, j.pel, j.chest, 3);
    line(img, j.hipL, j.kneeL, 2); line(img, j.kneeL, j.ankL, 2);
    line(img, j.hipR, j.kneeR, 2); line(img, j.kneeR, j.ankR, 2);
    line(img, j.shL, j.elL, 2); line(img, j.elL, j.wrL, 2);
    line(img, j.shR, j.elR, 2); line(img, j.elR, j.wrR, 2);
    disc(img, j.head, 9);
  }
  mkdirSync(path.join(REPO, '.moves-sheets'), { recursive: true });
  await img.writeAsync(path.join(REPO, '.moves-sheets', `${name}.png`));
  console.log(`.moves-sheets/${name}.png`);
}

// Sheet the baselines, to prove the renderer draws a figure that looks like one.
const T = 3.0;
await sheet('walk', Array.from({ length: N }, (_, i) => R.walk((i / N) * (R.WALK.S / R.WALK.stance), R.WALK)));
await sheet('seated', Array.from({ length: N }, () => R.seated(21, T)));
```

- [ ] **Step 5: Run the renderer and LOOK at the output**

Run: `node scripts/sheet-moves.mjs`
Then read `.moves-sheets/walk.png`.
Expected: twenty figures walking, feet alternating, arms swinging opposite the legs. If it does not read as a person walking, the renderer is wrong — fix it now, because every later task trusts it.

- [ ] **Step 6: Ignore the sheet output directory**

Add to `.gitignore`:

```
.moves-sheets/
```

- [ ] **Step 7: Commit**

```bash
git add scripts/check-moves.mjs scripts/sheet-moves.mjs .gitignore
git commit -m "Add the movement-library verification harness

Five numeric checks (skate, ground, reach-clamp, continuity, landing)
plus a filmstrip renderer, both running rig.ts in plain Node through
sucrase. Calibrated against walk/stand/seated first: a check that cannot
pass the three motions already shipping in 84 lessons is a broken check."
```

---

### Task 2: `armY` on `Gait`

The only change to `rig.ts`. A runner's hands ride near the ribs, but `walk()` hard-codes hanging fists at `y: 7`.

**Files:**
- Modify: `components/lesson/cinematic/rig.ts` — `Gait` interface (~line 92) and `walk()` (~lines 1253–1254)
- Modify: `scripts/check-moves.mjs`

**Interfaces:**
- Produces: `Gait.armY?: number`, consumed by every gait preset in Task 3.

- [ ] **Step 1: Write the failing identity test**

`walk()` is used by every walking figure in all 84 cinematic lessons, so the default must provably move nothing. Add to `scripts/check-moves.mjs`, just above the register:

```js
// walk() feeds every walking figure in 84 lessons. `armY` must be a pure
// addition: with the field absent, the output has to be BIT-IDENTICAL, not
// "close enough" — this samples a whole stride and compares every field.
function checkWalkUnchanged() {
  const EXPECT = JSON.parse(readFileSync(path.join(REPO, 'scripts/walk-baseline.json'), 'utf8'));
  const got = Array.from({ length: 24 }, (_, i) => R.walk(i * 2.5, R.WALK));
  if (JSON.stringify(got) !== JSON.stringify(EXPECT)) {
    note('walk (identity)', 'regression', 'walk(dist, WALK) output changed');
  }
}
checkWalkUnchanged();
```

- [ ] **Step 2: Capture the baseline BEFORE touching rig.ts**

Run this now, while `rig.ts` is still untouched — the baseline is worthless if captured afterwards:

```bash
node -e "
const {readFileSync,writeFileSync}=require('fs');
const {transform}=require('./node_modules/sucrase');
const js=transform(readFileSync('components/lesson/cinematic/rig.ts','utf8'),{transforms:['typescript']}).code;
import('data:text/javascript;base64,'+Buffer.from(js).toString('base64')).then(R=>{
  writeFileSync('scripts/walk-baseline.json',
    JSON.stringify(Array.from({length:24},(_,i)=>R.walk(i*2.5,R.WALK))));
  console.log('baseline captured');
});
"
```

Run: `node scripts/check-moves.mjs`
Expected: PASS (nothing has changed yet — this proves the comparison itself works).

- [ ] **Step 3: Add the field**

In `rig.ts`, replace the `Gait` interface:

```ts
export interface Gait {
  S: number; lift: number; stance: number; bob: number; bobSign: number;
  tilt: number; armBase: number; armSwing: number; standH: number;
  /**
   * Hand height while travelling, in rig units, POSITIVE = LOWER (see the note in
   * `walk` about why 7 is the hanging value). Optional, defaulting to exactly the
   * 7 that used to be hard-coded, so every existing gait is untouched.
   * Negative rides the hands up toward the ribs, which is what separates a run
   * from a fast walk as much as the stride length does.
   */
  armY?: number;
}
```

- [ ] **Step 4: Read it in `walk()`**

In `walk()`, replace the two `fistL`/`fistR` lines with:

```ts
    // `armY` defaults to the 7 this line used to hard-code — see Gait.armY.
    fistL: { x: 3 + Math.cos(ph) * swing * 24, y: (g.armY ?? 7) - Math.abs(Math.cos(ph)) * 2 },
    fistR: { x: 3 + Math.cos(ph + Math.PI) * swing * 24, y: (g.armY ?? 7) - Math.abs(Math.cos(ph + Math.PI)) * 2 },
```

- [ ] **Step 5: Verify nothing moved**

Run: `node scripts/check-moves.mjs`
Expected: PASS — identical output, since `WALK` has no `armY`.

Run: `npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 6: Commit**

```bash
git add components/lesson/cinematic/rig.ts scripts/check-moves.mjs scripts/walk-baseline.json
git commit -m "Add an optional armY to Gait, defaulting to the hard-coded 7

A runner's hands ride at the ribs; walk() pinned them at mid-thigh. The
default is the old constant restated as data, and a captured baseline of a
full stride proves the output is byte-identical for WALK -- which matters
because walk() feeds every walking figure in all 84 cinematic lessons."
```

---

### Task 3: Travel gaits

**Files:**
- Create: `components/lesson/cinematic/moves.ts`
- Modify: `scripts/check-moves.mjs`, `scripts/sheet-moves.mjs`

**Interfaces:**
- Consumes: `Gait` and `Gait.armY` from Task 2.
- Produces: `STROLL`, `MARCH`, `TRUDGE`, `JOG`, `RUN`, `SNEAK` — all `Gait`, all usable anywhere `WALK` is.

- [ ] **Step 1: Write the failing check**

Add all six to the register in `scripts/check-moves.mjs` (and add the import line at the top of the register section):

```js
const M = await load('components/lesson/cinematic/moves.ts');
```

```js
  ...['STROLL', 'MARCH', 'TRUDGE', 'JOG', 'RUN', 'SNEAK'].map((g) => ({
    name: g.toLowerCase(), kind: 'gait',
    cycle: M[g].S / M[g].stance,
    at: (d) => R.walk(d, M[g]),
  })),
```

- [ ] **Step 2: Run to verify it fails**

Run: `node scripts/check-moves.mjs`
Expected: FAIL — `Cannot find module .../moves.ts` (the file does not exist yet).

- [ ] **Step 3: Create `moves.ts` with the six presets**

```ts
// ─────────────────────────────────────────────────────────────────────────────
// Movement vocabulary, layered on the rig.
//
// This file exists so `rig.ts` does not grow past 2,400 lines, and it imports
// ONLY from `./rig` — which must stay true in that direction, because rig.ts's
// zero imports are what let the whole rig run in plain Node for verification
// (CLAUDE.md §17). Never import this file from rig.ts.
// ─────────────────────────────────────────────────────────────────────────────
import {
  WALK, clamp01, ease01, footTarget, lerp, life2, mixStance, phaseFor, pulse, seated,
  seatBob, seg, stand, walk, type Gait, type P2, type Stance,
} from './rig';

// ── travel ───────────────────────────────────────────────────────────────────
//
// WHY THESE ARE ONLY DATA.
//
// Two properties of the rig do all the work, and both are worth knowing before
// tuning any number here:
//
//   · A FLIGHT PHASE FALLS OUT OF `stance`. It is the fraction of the cycle a foot
//     is planted. At WALK's 0.62 the two feet overlap and somebody is always on the
//     ground. Below 0.5 they cannot overlap, so there are two airborne moments per
//     cycle — which is the actual difference between a run and a fast walk.
//
//   · STRIDE IS DRIVEN BY DISTANCE, NOT TIME. `phaseFor` returns
//     2π·dist·stance/S, so the planted foot advances exactly `S` while it is down,
//     at any speed. Every preset therefore foot-locks for free and composes with
//     travelStance, strideStance, moveTr and gaitVary with no change to any of them.
//
// The number that decides whether a gait reads as the same character moving
// differently is the CYCLE DISTANCE, S/stance — given in the comment on each.

/** Unhurried, short steps, almost no arm. 34 units per cycle. */
export const TRUDGE: Gait = {
  S: 24, lift: 7, stance: 0.70, bob: 2.0, bobSign: -1,
  tilt: 0.16, armBase: 0.09, armSwing: 0.22, armY: 8, standH: 34,
};
/** Ambling, relaxed. 42 units per cycle. */
export const STROLL: Gait = {
  S: 28, lift: 9, stance: 0.66, bob: 2.4, bobSign: -1,
  tilt: 0.06, armBase: 0.09, armSwing: 0.32, armY: 7, standH: 34,
};
/** Upright, deliberate, high knee and a big arm. 59 units per cycle. */
export const MARCH: Gait = {
  S: 34, lift: 18, stance: 0.58, bob: 3.6, bobSign: -1,
  tilt: 0.04, armBase: 0.09, armSwing: 0.55, armY: 2, standH: 34,
};
/** Crouched and careful — `standH` 28 does the crouch. 33 units per cycle. */
export const SNEAK: Gait = {
  S: 20, lift: 15, stance: 0.60, bob: 1.5, bobSign: -1,
  tilt: 0.20, armBase: 0.09, armSwing: 0.15, armY: -4, standH: 28,
};
/** Airborne 8% of the cycle. 91 units per cycle. */
export const JOG: Gait = {
  S: 42, lift: 17, stance: 0.46, bob: 4.5, bobSign: -1,
  tilt: 0.14, armBase: 0.09, armSwing: 0.50, armY: -8, standH: 34,
};
/** Airborne 28% of the cycle, hands at the ribs. 150 units per cycle. */
export const RUN: Gait = {
  S: 54, lift: 22, stance: 0.36, bob: 6.0, bobSign: -1,
  tilt: 0.22, armBase: 0.09, armSwing: 0.62, armY: -12, standH: 34,
};
```

- [ ] **Step 4: Run the checks**

Run: `node scripts/check-moves.mjs`
Expected: PASS — 9 motions.

If `run` or `jog` fails `skate`, the cause is `stance` and `S` disagreeing, not the check: at `stance < 0.5` there are frames where neither foot is planted, and the skate check must skip them (it does — it only compares within one continuous planted run).

- [ ] **Step 5: Sheet all six and LOOK at them**

Add to `scripts/sheet-moves.mjs`:

```js
const M = await load('components/lesson/cinematic/moves.ts');
for (const g of ['TRUDGE', 'STROLL', 'MARCH', 'SNEAK', 'JOG', 'RUN']) {
  const cyc = M[g].S / M[g].stance;
  await sheet(g.toLowerCase(), Array.from({ length: N }, (_, i) => R.walk((i / N) * cyc, M[g])));
}
```

Run: `node scripts/sheet-moves.mjs`
Then read `.moves-sheets/run.png` and `.moves-sheets/sneak.png`.
Expected: `run` shows frames with **both feet off the ground**; `sneak` is visibly lower than `walk` throughout. If `run` never leaves the ground, `stance` is too high.

- [ ] **Step 6: Commit**

```bash
git add components/lesson/cinematic/moves.ts scripts/check-moves.mjs scripts/sheet-moves.mjs
git commit -m "Add six travel gaits: trudge, stroll, march, sneak, jog, run

Data only. A flight phase falls out of stance < 0.5, and phaseFor derives
stride from distance, so all six foot-lock without new code and work with
travelStance/strideStance/gaitVary unchanged."
```

---

### Task 4: Asymmetric gaits

**Files:**
- Modify: `components/lesson/cinematic/moves.ts`, `scripts/check-moves.mjs`, `scripts/sheet-moves.mjs`

**Interfaces:**
- Produces: `limp(dist: number, g?: Gait, bad?: -1 | 1): Stance` and `carryHeavy(dist: number, g?: Gait): Stance`. `bad` is `-1` for the left leg (default), `1` for the right.

- [ ] **Step 1: Write the failing check**

Add to the register:

```js
  { name: 'limp', kind: 'gait', cycle: M.WALK_LIMP.S / M.WALK_LIMP.stance, at: (d) => M.limp(d) },
  { name: 'carryHeavy', kind: 'gait', cycle: M.WALK_LIMP.S / M.WALK_LIMP.stance, at: (d) => M.carryHeavy(d) },
```

- [ ] **Step 2: Run to verify it fails**

Run: `node scripts/check-moves.mjs`
Expected: FAIL — `M.limp is not a function`.

- [ ] **Step 3: Implement both**

Append to `moves.ts`:

```ts
// ── asymmetric gaits ─────────────────────────────────────────────────────────
//
// WHY THESE CANNOT BE PRESETS, AND WHAT MUST STAY SYMMETRIC.
//
// A `Gait` describes ONE leg pattern, and both of these need the two legs to
// differ — so they have to be functions. The trap is which field carries the
// difference: `phaseFor` derives phase from `S` and `stance`, so giving each foot
// its own value for either desynchronises them, the two feet travel different
// distances per cycle, and both skate. `S` and `stance` therefore stay IDENTICAL
// for both legs and the asymmetry lives entirely in `lift` (which only moves the
// foot vertically) and in the pelvis.

/** The gait a limp is built on — WALK with a shorter, more cautious step. */
export const WALK_LIMP: Gait = { ...WALK, S: 26, lift: 10, stance: 0.68, tilt: 0.13 };

/**
 * A limp. The bad leg barely leaves the ground and the body drops onto it,
 * which is what a limp physically is — so the constraint that keeps the feet
 * locked and the thing that makes it read as a limp are the same thing.
 */
export function limp(dist: number, g: Gait = WALK_LIMP, bad: -1 | 1 = -1): Stance {
  'worklet';
  const base = walk(dist, g);
  const ph = phaseFor(dist, g);
  const phBad = bad < 0 ? ph + Math.PI : ph;
  // Same S, same stance — only the lift differs, so the foot-lock is untouched.
  const gBad: Gait = { ...g, lift: g.lift * 0.34 };
  const fBad = footTarget(phBad, gBad);
  // How far through its planted phase the bad leg is, 0 at the extremes.
  const uBad = ((phBad / (2 * Math.PI)) % 1 + 1) % 1;
  const onBad = uBad < g.stance ? Math.sin(Math.PI * (uBad / g.stance)) : 0;
  return {
    ...base,
    footL: bad < 0 ? fBad : base.footL,
    footR: bad > 0 ? fBad : base.footR,
    bob: base.bob - 3.4 * onBad,          // the body drops onto the bad leg
    tilt: base.tilt - 0.05 * onBad,       // and pitches forward over it
    neck: base.neck + 0.03 * onBad,
  };
}

/**
 * Carrying something heavy in both hands. The arms stop swinging — they are
 * holding a load — the torso leans BACK to counterweight it, and the step
 * shortens. The hands are placed at a fixed forward-low point rather than
 * swinging, which is the single clearest read of "carrying" in profile.
 */
export function carryHeavy(dist: number, g: Gait = WALK_LIMP): Stance {
  'worklet';
  const base = walk(dist, g);
  const ph = phaseFor(dist, g);
  const sway = Math.sin(ph) * 1.4;                 // the load swings a little
  return {
    ...base,
    tilt: base.tilt - 0.16,                        // leaning back against the weight
    neck: base.neck + 0.06,
    bob: base.bob - 2.5,                           // knees a touch more bent
    fistL: { x: 17 + sway, y: 2 },
    fistR: { x: 21 + sway, y: 0 },
  };
}
```

- [ ] **Step 4: Run the checks**

Run: `node scripts/check-moves.mjs`
Expected: PASS — 11 motions.

- [ ] **Step 5: Sheet both and LOOK**

Add to `scripts/sheet-moves.mjs`:

```js
const cycL = M.WALK_LIMP.S / M.WALK_LIMP.stance;
await sheet('limp', Array.from({ length: N }, (_, i) => M.limp((i / N) * cycL)));
await sheet('carryHeavy', Array.from({ length: N }, (_, i) => M.carryHeavy((i / N) * cycL)));
```

Run: `node scripts/sheet-moves.mjs`, then read `.moves-sheets/limp.png`.
Expected: one leg visibly lifting less than the other, and the body dipping as it lands on that leg. If both legs look the same, `bad` is being applied to the wrong phase.

- [ ] **Step 6: Commit**

```bash
git add components/lesson/cinematic/moves.ts scripts/check-moves.mjs scripts/sheet-moves.mjs
git commit -m "Add limp and carryHeavy, the two asymmetric gaits

Both keep S and stance identical between the legs -- giving each foot its
own value desynchronises them via phaseFor and both feet skate. The
asymmetry lives in lift and in the pelvis, which is also what the motions
physically are."
```

---

### Task 5: One-shots

**Files:**
- Modify: `components/lesson/cinematic/moves.ts`, `scripts/check-moves.mjs`, `scripts/sheet-moves.mjs`

**Interfaces:**
- Produces: `hop(t, u)`, `stumble(t, u)`, `turnToFace(t, u)`, `doubleTakeStep(t, u)` — all `(t: number, u: number) => Stance`, `u` running 0→1, each returning the standing pose at both ends.

- [ ] **Step 1: Write the failing check**

Add to the register:

```js
  ...['hop', 'stumble', 'turnToFace', 'doubleTakeStep'].map((n) => ({
    name: n, kind: 'oneShot', at: (u) => M[n](T, u),
  })),
```

Plus an ends-at-standing check, since that is this group's contract. Add beside the other check functions and call it in the loop for `oneShot` motions whose name is in this group:

```js
// A one-shot must start and end at the standing pose, or it cannot be dropped
// into a beat without the scene arranging an entry and an exit for it.
function checkOneShotEnds(name, m) {
  if (m.kind !== 'oneShot' || !m.endsStanding) return;
  const st = R.stand(T);
  for (const [u, label] of [[0, 'start'], [1, 'end']]) {
    const s = m.at(u);
    const gap = Math.max(
      Math.abs(s.bob - st.bob), Math.abs(s.tilt - st.tilt) * 60,
      Math.hypot(s.footL.x - st.footL.x, s.footL.y - st.footL.y),
      Math.hypot(s.fistR.x - st.fistR.x, s.fistR.y - st.fistR.y),
    );
    if (gap > 0.01) note(name, 'ends', `${label} is ${gap.toFixed(2)} off the standing pose`);
  }
}
```

Mark the four with `endsStanding: true` in the register and call `checkOneShotEnds(m.name, m)` in the loop.

- [ ] **Step 2: Run to verify it fails**

Run: `node scripts/check-moves.mjs`
Expected: FAIL — `M.hop is not a function`.

- [ ] **Step 3: Implement the four**

Append to `moves.ts`:

```ts
// ── one-shots ────────────────────────────────────────────────────────────────
//
// Contract, matching the boxing moves already in rig.ts: (t, u) => Stance, u
// running 0→1, and the pose EQUALS the standing pose at both u = 0 and u = 1 so
// any of these can be dropped into a beat without the scene arranging an entry
// or an exit. The checker enforces both ends.

/**
 * A hop. Crouch, extend, fly, absorb.
 *
 * The feet are GROUND-relative, so when the whole body leaves the floor they must
 * rise by exactly the same amount the pelvis does or the legs stretch: `lift`
 * appears in `bob` and in both feet. The landing compression is what stops it
 * reading as a lift on a wire — a body that arrives at the floor and stops dead
 * has no weight.
 */
export function hop(t: number, u: number): Stance {
  'worklet';
  const s = stand(t);
  const e = clamp01(u);
  const crouch = pulse(seg(e, 0, 0.24));
  const air = Math.sin(Math.PI * seg(e, 0.24, 0.76));
  const land = pulse(seg(e, 0.76, 1));
  const rise = 19 * air;
  return {
    ...s,
    bob: s.bob - 8 * crouch + rise - 6.5 * land,
    tilt: s.tilt - 0.07 * crouch + 0.04 * air,
    neck: s.neck - 0.05 * air,
    footL: { x: s.footL.x, y: -rise - 5 * air },
    footR: { x: s.footR.x, y: -rise - 4 * air },
    fistL: { x: s.fistL.x - 5 * crouch + 4 * air, y: s.fistL.y + 4 * crouch - 13 * air },
    fistR: { x: s.fistR.x - 4 * crouch + 5 * air, y: s.fistR.y + 4 * crouch - 15 * air },
    adv: 0,
  };
}

/**
 * A stumble: the lead foot catches, the torso pitches forward ahead of the feet,
 * the arms fly up to catch balance, and a recovery step brings it back. The arms
 * lead the recovery and the feet follow, because that is the order it happens in.
 */
export function stumble(t: number, u: number): Stance {
  'worklet';
  const s = stand(t);
  const e = clamp01(u);
  const catchIt = pulse(seg(e, 0.05, 0.4));        // the trip
  const pitch = Math.sin(Math.PI * seg(e, 0.05, 0.62));
  const recover = pulse(seg(e, 0.45, 1));          // the step that saves it
  return {
    ...s,
    tilt: s.tilt - 0.34 * pitch,
    neck: s.neck + 0.20 * pitch,
    bob: s.bob - 7 * pitch - 3 * recover,
    footL: { x: s.footL.x + 3 * catchIt, y: -10 * catchIt },
    footR: { x: s.footR.x + 19 * recover, y: -12 * pulse(seg(e, 0.45, 0.8)) },
    fistL: { x: s.fistL.x + 10 * pitch, y: s.fistL.y - 30 * pitch },
    fistR: { x: s.fistR.x + 14 * pitch, y: s.fistR.y - 26 * pitch },
    adv: 0,
  };
}

/**
 * The weight shift and step of turning on the spot.
 *
 * THIS MOTION IS DELIBERATELY PARTIAL. Facing is `dir` in `Cfg`, not a field of
 * `Stance`, so this function cannot turn the figure — it can only supply the
 * footwork. THE SCENE MUST FLIP `dir` AT u = 0.5, at the moment both feet are
 * gathered under the body. A caller who forgets gets a figure that shuffles and
 * stays facing the wrong way, which looks like this motion is broken rather than
 * misused, so it is worth saying at the call site too.
 */
export function turnToFace(t: number, u: number): Stance {
  'worklet';
  const s = stand(t);
  const e = clamp01(u);
  const gather = Math.sin(Math.PI * e);            // feet come together mid-turn
  const stepA = pulse(seg(e, 0, 0.5));
  const stepB = pulse(seg(e, 0.5, 1));
  return {
    ...s,
    bob: s.bob - 2.5 * gather,
    tilt: s.tilt + 0.05 * gather,
    neck: s.neck - 0.06 * gather,
    footL: { x: s.footL.x + 7 * gather, y: -7 * stepA },
    footR: { x: s.footR.x - 7 * gather, y: -7 * stepB },
    fistL: { x: s.fistL.x + 3 * gather, y: s.fistL.y - 5 * gather },
    fistR: { x: s.fistR.x - 3 * gather, y: s.fistR.y - 5 * gather },
    adv: 0,
  };
}

/**
 * The double-take: a small step back with a head snap, for the beat where the
 * figure notices something. The head leads and the foot follows by a hair — a
 * simultaneous head-and-foot reads as a flinch instead.
 */
export function doubleTakeStep(t: number, u: number): Stance {
  'worklet';
  const s = stand(t);
  const e = clamp01(u);
  const snap = Math.sin(Math.PI * seg(e, 0, 0.3));
  const back = pulse(seg(e, 0.12, 0.7));
  const settle = Math.sin(Math.PI * seg(e, 0.3, 1));
  return {
    ...s,
    neck: s.neck - 0.26 * snap + 0.05 * settle,
    tilt: s.tilt + 0.13 * back,
    bob: s.bob - 3.5 * back,
    footL: { x: s.footL.x - 9 * back, y: -6 * back },
    footR: { x: s.footR.x - 3 * back, y: 0 },
    fistL: { x: s.fistL.x - 4 * back, y: s.fistL.y - 9 * back },
    fistR: { x: s.fistR.x - 3 * back, y: s.fistR.y - 12 * back },
    adv: 0,
  };
}
```

- [ ] **Step 4: Run the checks**

Run: `node scripts/check-moves.mjs`
Expected: PASS — 15 motions.

If any fails `ends`, the cause is an envelope that is not exactly zero at `u = 0` or `u = 1`. `pulse(seg(e, a, b))` is zero outside `[a, b]` and `Math.sin(Math.PI * x)` is zero at `x = 0` and `x = 1` — check the segment bounds rather than adding a fudge term.

- [ ] **Step 5: Sheet all four and LOOK**

Add to `scripts/sheet-moves.mjs`:

```js
for (const n of ['hop', 'stumble', 'turnToFace', 'doubleTakeStep']) {
  await sheet(n, Array.from({ length: N }, (_, i) => M[n](T, i / (N - 1))));
}
```

Run: `node scripts/sheet-moves.mjs`, then read `.moves-sheets/hop.png` and `.moves-sheets/stumble.png`.
Expected: `hop` shows a crouch, then frames clear of the ground line, then a compressed landing. `stumble` shows the torso ahead of the feet with the arms up.

- [ ] **Step 6: Commit**

```bash
git add components/lesson/cinematic/moves.ts scripts/check-moves.mjs scripts/sheet-moves.mjs
git commit -m "Add four one-shot motions: hop, stumble, turnToFace, doubleTake

Each equals the standing pose at u=0 and u=1, enforced by the checker, so
they drop into any beat with no entry or exit staging. turnToFace is
deliberately partial -- facing is dir in Cfg, so the scene flips it at the
midpoint while this supplies the footwork."
```

---

### Task 6: Level transitions

The group that fixes the defect. Read the construction note before writing code.

**Files:**
- Modify: `components/lesson/cinematic/moves.ts`, `scripts/check-moves.mjs`, `scripts/sheet-moves.mjs`

**Interfaces:**
- Produces: `standToSit(seatH, t, u)`, `sitToStand(seatH, t, u)`, `standToFloor(t, u)`, `floorToStand(t, u)`, `lieDown(t, u)`, `getUp(t, u)`. Each `=> Stance`, `u` 0→1.
- `standToSit` lands exactly on `seated(seatH, t)`; `standToFloor` lands on the floor-sit pose; `lieDown` lands on the lying pose.

- [ ] **Step 1: Write the failing check**

Add to the register, using the `lands` hook the harness already supports:

```js
  { name: 'standToSit', kind: 'oneShot', at: (u) => M.standToSit(21, T, u), lands: () => R.seated(21, T) },
  { name: 'sitToStand', kind: 'oneShot', at: (u) => M.sitToStand(21, T, u), lands: () => R.stand(T) },
  { name: 'standToFloor', kind: 'oneShot', at: (u) => M.standToFloor(T, u), lands: () => M.FLOOR_SIT(T) },
  { name: 'floorToStand', kind: 'oneShot', at: (u) => M.floorToStand(T, u), lands: () => R.stand(T) },
  { name: 'lieDown', kind: 'oneShot', at: (u) => M.lieDown(T, u), lands: () => M.LYING(T) },
  { name: 'getUp', kind: 'oneShot', at: (u) => M.getUp(T, u), lands: () => R.stand(T) },
```

Add the feet-settle-early check, which is this group's specific contract:

```js
// FEET SETTLE EARLY, THEN LOCK. A person shuffles their feet and THEN sits; the
// feet must not still be travelling while the hips are going down, or the motion
// reads as a slide. Everything after u = 0.45 must hold the feet still.
function checkFeetSettle(name, m) {
  if (!m.settles) return;
  let ref = null, worst = 0;
  for (let i = 0; i <= FRAMES; i++) {
    const u = i / FRAMES;
    if (u < 0.45) continue;
    const s = m.at(u);
    if (!ref) { ref = s; continue; }
    worst = Math.max(worst, Math.abs(s.footL.x - ref.footL.x), Math.abs(s.footR.x - ref.footR.x));
  }
  if (worst > 0.6) note(name, 'feet', `feet still travelling ${worst.toFixed(2)} units after u=0.45`);
}
```

Mark all six with `settles: true` and call `checkFeetSettle(m.name, m)` in the loop.

- [ ] **Step 2: Run to verify it fails**

Run: `node scripts/check-moves.mjs`
Expected: FAIL — `M.standToSit is not a function`.

- [ ] **Step 3: Implement the six**

Append to `moves.ts`:

```ts
// ── change of level ──────────────────────────────────────────────────────────
//
// THESE ARE NOT LERPS BETWEEN END POSES, AND THAT IS THE WHOLE POINT.
//
// A `mixStance` from standing to sitting interpolates the pelvis and both feet
// independently, so the body passes through positions it never really occupies:
// the feet slide along the ground the entire time the hips are sinking. It was
// the one thing in the movement library that looked wrong rather than missing.
//
// Four rules, all of which the checker enforces:
//
//   1. THE FEET SETTLE EARLY AND THEN LOCK. A person shuffles their feet and then
//      sits. All foot travel finishes by u ≈ 0.4, after which they do not move —
//      so the repositioning reads as a deliberate step, not a slide.
//   2. THE PELVIS DESCENDS ON A CURVE, and dips slightly past its destination
//      before settling. Mass does not stop dead.
//   3. THE TORSO PITCHES FORWARD ON THE WAY DOWN and comes upright at the end.
//      A body that sits by translating straight downward reads as a lift.
//   4. THE HANDS ARRIVE LATE. Limbs settle after the mass does.
//
// Rules 2–4 ride on `arc`, a sine that is ZERO AT BOTH ENDS — which is what makes
// the landing exact: at u = 1 every extra term vanishes and the pose is precisely
// the destination, so a beat can hold afterwards with no snap.

const mixP = (a: P2, b: P2, t: number): P2 => {
  'worklet';
  return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) };
};

/** The floor-sit destination: pelvis 8 above the ground, legs out along it. */
export function FLOOR_SIT(t: number): Stance {
  'worklet';
  const s = stand(t);
  return {
    ...s,
    tilt: s.tilt + 0.08, neck: 0.18, bob: s.bob - 26,
    footL: { x: 26, y: 0 }, footR: { x: 32, y: 0 },
    fistL: { x: 11, y: 12 }, fistR: { x: 17, y: 10 },
    adv: 0,
  };
}

/** Flat on the back: pelvis almost on the ground, legs and arms extended. */
export function LYING(t: number): Stance {
  'worklet';
  const s = stand(t);
  const breath = 0.4 * (0.5 - 0.5 * Math.cos(t * 1.3));
  return {
    ...s,
    tilt: s.tilt + 0.42, neck: 0.10, bob: s.bob - 31 + breath,
    footL: { x: 33, y: 0 }, footR: { x: 36, y: 0 },
    fistL: { x: -12, y: 6 }, fistR: { x: -7, y: 8 },
    adv: 0,
  };
}

/** Shared construction for every change of level. See the block comment above. */
function levelChange(a: Stance, b: Stance, u: number, dip: number, pitch: number): Stance {
  'worklet';
  const e = ease01(clamp01(u));
  const arc = Math.sin(Math.PI * clamp01(u));       // zero at BOTH ends
  const s = mixStance(a, b, e);
  return {
    ...s,
    bob: s.bob - dip * arc,
    tilt: s.tilt - pitch * arc,
    neck: s.neck + 0.09 * arc,
    // Feet: all travel done by u = 0.4, then locked (rule 1).
    footL: mixP(a.footL, b.footL, ease01(seg(u, 0, 0.36))),
    footR: mixP(a.footR, b.footR, ease01(seg(u, 0.04, 0.4))),
    // Hands: leave early, arrive late (rule 4).
    fistL: mixP(a.fistL, b.fistL, ease01(seg(u, 0.22, 1))),
    fistR: mixP(a.fistR, b.fistR, ease01(seg(u, 0.28, 1))),
    adv: 0,
  };
}

/** Standing to sitting on a seat `seatH` above the ground. Lands on `seated`. */
export function standToSit(seatH: number, t: number, u: number): Stance {
  'worklet';
  return levelChange(stand(t), seated(seatH, t), u, 4.5, 0.15);
}
/** The reverse. Lands on `stand`. */
export function sitToStand(seatH: number, t: number, u: number): Stance {
  'worklet';
  // Pitching FORWARD is how you get up — you bring your weight over your feet
  // first — so the pitch term keeps the same sign as sitting down.
  return levelChange(seated(seatH, t), stand(t), u, 3.0, 0.18);
}
/** Standing to sitting on the floor. Lands on `FLOOR_SIT`. */
export function standToFloor(t: number, u: number): Stance {
  'worklet';
  return levelChange(stand(t), FLOOR_SIT(t), u, 6.0, 0.20);
}
/** Floor to standing. Lands on `stand`. */
export function floorToStand(t: number, u: number): Stance {
  'worklet';
  return levelChange(FLOOR_SIT(t), stand(t), u, 4.0, 0.24);
}
/** Sitting on the floor to flat on the back. Lands on `LYING`. */
export function lieDown(t: number, u: number): Stance {
  'worklet';
  return levelChange(FLOOR_SIT(t), LYING(t), u, 2.0, -0.10);
}
/** Flat on the back to standing, through the floor-sit. */
export function getUp(t: number, u: number): Stance {
  'worklet';
  // Two stages, because nobody rises from lying to standing in one move: up onto
  // the seat first, then onto the feet. Splitting at 0.45 keeps the mid-point
  // exactly FLOOR_SIT, so neither half has to fudge its ends.
  if (u < 0.45) return levelChange(LYING(t), FLOOR_SIT(t), seg(u, 0, 0.45), 2.0, -0.08);
  return levelChange(FLOOR_SIT(t), stand(t), seg(u, 0.45, 1), 4.0, 0.24);
}
```

- [ ] **Step 4: Run the checks**

Run: `node scripts/check-moves.mjs`
Expected: PASS — 21 motions.

If `landing` fails, an extra term is non-zero at `u = 1`: `arc` is zero there, and `seg(1, a, 1)` is 1, so the usual cause is a segment whose upper bound is not exactly 1.

- [ ] **Step 5: Sheet all six and LOOK — this is the group that must be eyeballed**

Add to `scripts/sheet-moves.mjs`:

```js
const LEVEL = [
  ['standToSit', (u) => M.standToSit(21, T, u)],
  ['sitToStand', (u) => M.sitToStand(21, T, u)],
  ['standToFloor', (u) => M.standToFloor(T, u)],
  ['floorToStand', (u) => M.floorToStand(T, u)],
  ['lieDown', (u) => M.lieDown(T, u)],
  ['getUp', (u) => M.getUp(T, u)],
];
for (const [n, f] of LEVEL) {
  await sheet(n, Array.from({ length: N }, (_, i) => f(i / (N - 1))));
}
```

Run: `node scripts/sheet-moves.mjs`, then read `.moves-sheets/standToSit.png`.
Expected: the feet reposition in the first few frames and then stay put while the hips descend; the torso leans forward through the middle and is upright by the last frame. If the feet are still moving in the later frames, `levelChange`'s foot segments are wrong.

- [ ] **Step 6: Commit**

```bash
git add components/lesson/cinematic/moves.ts scripts/check-moves.mjs scripts/sheet-moves.mjs
git commit -m "Add six change-of-level transitions

The group that fixes something rather than adding to it: a figure changing
level was a mixStance lerp between end poses, which slid the feet along the
ground for the whole descent. These settle the feet early and then lock
them, curve the pelvis, pitch the torso and land the hands late -- and
every extra term rides a sine that is zero at both ends, so each transition
lands exactly on its destination pose and a beat can hold with no snap."
```

---

### Task 7: The named index

**Files:**
- Modify: `components/lesson/cinematic/moves.ts`
- Modify: `docs/LESSON_RULES.md`

**Interfaces:**
- Produces: `MOVES`, a frozen index of every motion with a one-line description.

- [ ] **Step 1: Add the index**

Append to `moves.ts`:

```ts
// ── the index ────────────────────────────────────────────────────────────────
//
// One place to browse the vocabulary. Today a gesture is a bare number (`p: 25`)
// whose meaning lives in a fifty-branch if-chain inside rig.ts, and the fifty-first
// entry only makes that worse — so everything added here is named, and listed with
// a description of what it DEPICTS rather than what it does to the rig.
//
// The existing emote codes are deliberately NOT renamed: that would be a mechanical
// diff across all 84 shipped lesson scripts for no behaviour change.
export const MOVES = {
  /** Gaits — pass to `walk(dist, g)`, `travelStance`, `strideStance`. */
  travel: {
    TRUDGE: 'heavy, short-stepped, worn down',
    STROLL: 'ambling, relaxed, in no hurry',
    WALK: 'the default (in rig.ts)',
    MARCH: 'upright and deliberate, high knee',
    SNEAK: 'crouched and careful, barely swinging',
    JOG: 'light run, briefly airborne',
    RUN: 'full run, long flight phase, hands at the ribs',
  },
  /** Asymmetric gaits — functions, since the two legs differ. */
  uneven: {
    limp: 'favouring one leg, body dropping onto it',
    carryHeavy: 'both hands full, leaning back against the load',
  },
  /** One-shots — `(t, u)`, standing at both ends. */
  oneShot: {
    hop: 'crouch, spring, land and absorb',
    stumble: 'trips, pitches forward, recovers with a step',
    turnToFace: 'the footwork of turning — THE SCENE MUST FLIP `dir` AT u = 0.5',
    doubleTakeStep: 'notices something and steps back, head first',
  },
  /** Change of level — `(…, t, u)`, landing exactly on the destination pose. */
  level: {
    standToSit: 'down onto a seat of height `seatH`',
    sitToStand: 'up off a seat',
    standToFloor: 'down onto the floor',
    floorToStand: 'up off the floor',
    lieDown: 'from sitting on the floor to flat on the back',
    getUp: 'from flat on the back to standing, via the floor-sit',
  },
} as const;
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 3: Record the vocabulary in the rule book**

Rule **A2** already says *"If the vocabulary can't say it, extend the vocabulary — never substitute the nearest wrong pose."* Add immediately after it:

```markdown
**A2b. The vocabulary now includes travel and change of level — check `MOVES`
before reaching for the nearest standing pose.** A2 was written after a script
said someone was on the floor and got a *standing* slump, because no floor pose
existed. The same substitution is available for movement: a figure that should
hurry gets a walk, one that should sit gets a lerp that slides its feet along the
ground. `components/lesson/cinematic/moves.ts` exports seven gaits, two uneven
ones, four one-shots and six change-of-level transitions, all indexed in `MOVES`
with a line each. Two things about it are worth knowing before use:

- **A change of level lands exactly on its destination pose**, so the following
  beat can hold it with no snap. Do not blend out of one yourself.
- **`turnToFace` cannot turn the figure.** Facing is `dir` in `Cfg`, not a field
  of `Stance`. The motion supplies the footwork and **the scene must flip `dir` at
  u = 0.5**. Forgetting it looks like a broken motion rather than a misused one.

`node scripts/check-moves.mjs` measures every motion for skating, ground
penetration, IK clamping, per-frame discontinuity and landing accuracy;
`node scripts/sheet-moves.mjs` draws filmstrips. Both run in plain Node — no
Metro, no device.
```

- [ ] **Step 4: Full verification**

Run: `node scripts/check-moves.mjs`
Expected: PASS — 21 motions.

Run: `npm run check`
Expected: tsc clean, 180 lesson files OK, cinematic files clean (the pre-existing `ethicsScene.tsx` band warning is expected and unrelated).

Run: `git status --short`
Expected: no cinematic *lesson* file is modified — only `rig.ts`, `moves.ts`, the two scripts, `.gitignore`, `walk-baseline.json` and `LESSON_RULES.md`.

- [ ] **Step 5: Commit**

```bash
git add components/lesson/cinematic/moves.ts docs/LESSON_RULES.md
git commit -m "Index the movement vocabulary and record it as rule A2b

A2 exists because a script that needed a floor pose got a standing slump.
The same substitution is available for movement -- a figure that should
hurry gets a walk -- so the rule now points at MOVES, and flags the two
things a caller can get wrong: transitions land on their destination pose
already, and turnToFace needs the scene to flip dir at the midpoint."
```

---

## Self-Review

**Spec coverage:** every section of the spec maps to a task — travel gaits → Task 3; asymmetric → Task 4; one-shots → Task 5; transitions → Task 6; naming layer → Task 7; the `armY` risk → Task 2 with an explicit byte-identity baseline; the five numeric checks and the filmstrips → Task 1, with the sixth and seventh (`ends`, `feet settle`) added in Tasks 5 and 6 where their contracts appear. The spec's "guard against the checks themselves" is Task 1 Steps 2–3, which calibrate on shipped motions and then prove a check can fail.

**Type consistency:** `Stance`, `Gait`, `P2` come from `rig.ts` throughout. `FLOOR_SIT`/`LYING` are defined in Task 6 before the `lands` hooks reference them. `WALK_LIMP` is defined in Task 4 and used by both functions there. The harness's `at`/`cycle`/`kind`/`lands`/`endsStanding`/`settles` keys are introduced in Task 1 and used unchanged after.

**One deliberate deviation from the spec:** the spec listed five numeric checks; this plan has seven, because the one-shot "ends standing" contract and the transition "feet settle early" contract are each measurable and each guard a specific way those groups go wrong. Both are additive.

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-08-02-stickman-movement-library.md`.
