# Stage 1: No fast hand drop at the end of a gesture — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Every played one-shot action (codes 300+) brings the hands back to rest slowly and settles, instead of dropping them in the last two or three frames.

**Architecture:** `emoteAnyLive` stops mapping beat time to action progress linearly over 1.5 s. A time warp (`playU`) plays the first 65% of every action at nearly today's speed and gives the last 35% (where every action returns to the stand) over a second, ending with zero velocity. The held pose at `u = 1` is untouched, so group L continuity is untouched. A new section of `check:moves` measures hand speed in the ending of every played action and fails over a ceiling. Stages 2–4 of the spec get their own plans after their filmstrip gates.

**Tech Stack:** TypeScript worklets (`moves.ts`, `rig.ts`, zero-import), Node `.mjs` checkers loaded through sucrase.

**Spec:** `docs/superpowers/specs/2026-09-25-stickman-natural-motion-design.md` (Stage 1)

## Global Constraints

- The held pose of every played code is identical to its 100-band twin (check:moves §7 already asserts this; it must stay green).
- A played action must have settled onto its held twin by `PLAY_SECONDS + 0.5` (check:moves §7).
- Worklets only: every new function in `moves.ts`/`rig.ts` starts with `'worklet'` and is declared before any worklet that calls it (§17 rule 2).
- `rig.ts`, `moves.ts`, `wander.ts` keep zero React imports.
- No browser re-measure. `moves.ts` is outside `muststamp`; end poses do not change, so no figure box grows.
- `npm run check` exit 0, captured to a file and echoed, never through a pipe.
- Nothing is committed or published without the owner's instruction.

## Review Focus

1. **A reader taps at 1.5 s, where an action used to be finished and is now mid-return.** The next beat's `carryFrom` must blend from the drawn pose without a jump. `check:smooth` replays taps across all lessons, so it must stay green.
2. **Wander timing:** `make:wander` waits `PLAY_SECONDS + 0.4` after a played action before scheduling a move. Its copy of the constant in `wanderrule.mjs` must change with `moves.ts`, or a drift move starts while the arm is still coming down. Task 1 adds an assertion that the two constants match.
3. **Welcome host:** `components/welcome/hostFigure.ts` also calls `emoteAnyLive`. `check:host` must stay green.
4. **Intentional snaps stay snappy:** acts 3 (jump landing), 97 (double take), 114 (overshoot) and 117 (heel click) are exempt by name. The exemption list is asserted to be short and named.
5. **Beats shorter than 2.4 s** (a J12 split piece): a played code inside a run already replays on every piece (N7 bans it outside the clock acts), so nothing new is exposed. `check:life` must stay green.

---

### Task 1: The ending-speed check (failing first)

**Files:**
- Modify: `scripts/check-moves.mjs` (new section after check 7, before the final summary)
- Modify: `scripts/lib/wanderrule.mjs:131-132` (assertion target only; the value changes in Task 2)

**Interfaces:**
- Consumes: `M.emoteAnyLive(code, t, bt)`, `M.playCode(act)`, `M.PLAY_SECONDS`, `R.solve(...)` (all already loaded in check-moves as `M` and `R`).
- Produces: a console line `endings: worst <x>u/frame (ceiling 2.0)` and exit 1 on failure.

- [ ] **Step 1: Add the section**

```js
// ── check 8 · a gesture ENDS slowly (owner, 2026-09-25) ───────────────────────
//
// "the stickman will sometimes make a movement with his hand and then at the end
// of the animation … the hand will very quickly move down." Measured, it was the
// PLAYED band: every action squeezed into 1.5 s, returning to the stand in its
// last 10–15% of u — act 80 dropped the arm at 5.2 u a frame. This measures the
// solved wrists, frame by frame at 60 Hz, over the ENDING of every played action
// (from 0.55 of its play window on), which is where the return lives.
{
  const ENDING_CEILING = 2.0;               // stage units per 60 Hz frame
  const FAST_BY_DESIGN = new Set([3, 97, 114, 117]); // jump landing, double take, overshoot, heel click
  const T8 = 7.3;
  const over = [];
  let worstAll = 0;
  for (let act = 1; act <= 400; act += 1) {
    const code = M.playCode(act);
    let probe;
    try { probe = M.emoteAnyLive(code, T8, 0); } catch { break; }
    if (!probe) break;
    if (FAST_BY_DESIGN.has(act)) continue;
    const from = 0.55 * M.PLAY_SECONDS;
    let prev = null; let worst = 0; let at = 0;
    for (let bt = from - 1 / 60; bt <= M.PLAY_SECONDS + 0.2; bt += 1 / 60) {
      const j = R.solve({ x: 200, groundY: 500, k: 1, dir: 1, ...M.emoteAnyLive(code, T8 + bt, bt) });
      if (prev) {
        for (const w of ['wrL', 'wrR']) {
          const d = Math.hypot(j[w].x - prev[w].x, j[w].y - prev[w].y);
          if (d > worst) { worst = d; at = bt; }
        }
      }
      prev = j;
    }
    worstAll = Math.max(worstAll, worst);
    if (worst > ENDING_CEILING) over.push(`act ${act} (code ${code}) ${worst.toFixed(2)}u/frame at ${at.toFixed(2)}s`);
  }
  if (FAST_BY_DESIGN.size > 4) note('endings', 'fast', 'the fast-by-design list grew — each one needs the owner');
  if (over.length) {
    console.log(`\n${over.length} played action(s) end faster than ${ENDING_CEILING}u a frame:`);
    for (const o of over) console.log(`  ${o}`);
    process.exit(1);
  }
  console.log(`endings: worst ${worstAll.toFixed(2)}u/frame (ceiling ${ENDING_CEILING})`);
}
```

The loop's upper bound breaks on the first act number `actStance` does not know. If `actStance` returns a neutral stand for unknown codes instead of throwing, replace the bound with the highest `code === N` in `actStance` (read with `grep -o "if (code === [0-9]*)" moves.ts | sort -t= -k3 -n | tail -1`).

- [ ] **Step 2: Add the constant-sync assertion** in the same section:

```js
{
  const WR = await import(pathToFileURL(path.join(process.cwd(), 'scripts/lib/wanderrule.mjs')).href);
  if (WR.PLAY_SECONDS !== M.PLAY_SECONDS) {
    note('wanderrule', 'sync', `wanderrule.PLAY_SECONDS ${WR.PLAY_SECONDS} ≠ moves.PLAY_SECONDS ${M.PLAY_SECONDS}`);
  }
}
```

(Use whatever `pathToFileURL`/`path` imports check-moves already has; add them if missing.)

- [ ] **Step 3: Run it and see it fail on today's code**

Run: `node scripts/check-moves.mjs > "$TMP/cm.log" 2>&1; echo $?; tail -30 "$TMP/cm.log"`
Expected: exit 1, with acts 80 and 138 among roughly 20 listed.

### Task 2: The time warp

**Files:**
- Modify: `components/lesson/cinematic/moves.ts:3988-4010` (`PLAY_SECONDS`, new `playU`, `emoteAnyLive`)
- Modify: `scripts/lib/wanderrule.mjs:131-132`
- Modify: `components/welcome/hostFigure.ts` comment at 203–204 (the 1.5 s figure)

**Interfaces:**
- Produces: `export function playU(bt: number): number` (0 → 1, C1, zero velocity at 1) and `PLAY_SECONDS = 2.4`.

- [ ] **Step 1: Replace the constant and add the warp** above `emoteAny`:

```ts
/**
 * How long a played action takes before he is standing there again.
 *
 * It was 1.5, and every action spent its last 10–15% of u putting the hands back —
 * so the return was squeezed into a fifth of a second and read as the arm being
 * dropped (owner, 2026-09-25; act 80 measured 5.2 units a frame). It is longer now,
 * and `playU` spends the extra time on the ENDING only.
 */
export const PLAY_SECONDS = 2.4;

/** Where the warp hands over: the first 45% of the time covers the first 65% of u. */
const PLAY_KNEE_T = 0.45;
const PLAY_KNEE_U = 0.65;

/**
 * Beat time → action progress. Linear up to the knee (the front plays at 0.60 u/s,
 * within 10% of the old 0.667), then a cubic Hermite that leaves the knee at the
 * same slope and arrives at u = 1 with zero velocity — so every return to the stand
 * decelerates into it rather than stopping dead.
 */
export function playU(bt: number): number {
  'worklet';
  const tau = clamp01(bt / PLAY_SECONDS);
  const m = PLAY_KNEE_U / PLAY_KNEE_T;
  if (tau <= PLAY_KNEE_T) return tau * m;
  const s = (tau - PLAY_KNEE_T) / (1 - PLAY_KNEE_T);
  const d = 1 - PLAY_KNEE_U;
  const m0 = (m * (1 - PLAY_KNEE_T)) / d;
  const h = (-2 * s * s * s + 3 * s * s) + (s * s * s - 2 * s * s + s) * m0;
  return PLAY_KNEE_U + d * h;
}
```

(`m0` = 2.46 < 3, so the Hermite is monotone: u never runs backwards.)

- [ ] **Step 2: Use it** in `emoteAnyLive`:

```ts
  if (code >= 300) return actStance(code - 299, t, playU(bt));
```

and update the comment above it ("u runs 0 → 1 over PLAY_SECONDS through `playU` and then stays there…").

- [ ] **Step 3: Sync wanderrule**: `export const PLAY_SECONDS = 2.4;` with the comment pointing at `moves.PLAY_SECONDS` and check-moves §8's sync assertion.

- [ ] **Step 4: Run check-moves**

Run: `node scripts/check-moves.mjs > "$TMP/cm.log" 2>&1; echo $?; tail -15 "$TMP/cm.log"`
Expected: exit 1 with only acts 80 and 138 left (about 2.4 and 2.1).

### Task 3: Hand-tune the two slow returns and soften `lift()`

**Files:**
- Modify: `components/lesson/cinematic/moves.ts:2140-2163` (act 80), `:3236-3247` (act 138)
- Modify: `components/lesson/cinematic/rig.ts:390-393` (`lift`)

- [ ] **Step 1: Act 80.** Its return is `off = 1 - ease01(clamp01((p - 0.80) / 0.20))`. Widen it to start earlier and last longer:

```ts
    const off = 1 - ease01(clamp01((p - 0.72) / 0.28));
```

- [ ] **Step 2: Act 138.** Same shape: `(p - 0.84) / 0.16` becomes `(p - 0.74) / 0.26`.

- [ ] **Step 3: `lift()`** returns to zero at its fastest (a sine). Replace it with a bump that is still at both ends:

```ts
export function lift(bt: number): number {
  'worklet';
  const s = Math.sin(Math.min(bt, 1.5) / 1.5 * Math.PI);
  return s * s;
}
```

- [ ] **Step 4: Run check-moves again**

Expected: exit 0, and `endings: worst ≤ 2.0u/frame`. If an act is still over, widen its own return window the same way (never raise the ceiling).

- [ ] **Step 5: Counter-test.** Temporarily put act 80's old `(p - 0.80) / 0.20` back with `PLAY_SECONDS` 1.5 in a COPY loaded through `RIG_SRC`, or by editing, running and reverting in one script. check-moves must exit 1 naming act 80. Record the result in the task notes.

### Task 4: Regenerate what depends on the timing, run the suite, show the owner

**Files:**
- Regenerated: `data/lessonWander.ts` (`npm run make:wander`)
- Modify: `docs/LESSON_RULES.md` (group N: new rule "a played action ends slowly", naming check:moves §8)
- Modify: `CLAUDE.md` §17 (a short note beside group N's section) — keep it brief

- [ ] **Step 1:** `npm run make:wander`, then `npm run check:wander`. Record the plan count against the 862 before, and name why it moved (wander now waits 2.8 s after a played action instead of 1.9 s).
- [ ] **Step 2:** `npm run check > "$TMP/check.log" 2>&1; echo $?`, then read the tail. Expected: 0. Pay particular attention to check:smooth, check:replay, check:life, check:idle, check:host, check:thoughts and check:rules.
- [ ] **Step 3: Before/after filmstrip for the owner.** `FRAMES=12 node scripts/sheet-moves.mjs` renders across `u`, which hides the warp. Add an env flag to `sheet-moves.mjs` (`PLAYED=1`) that samples `emoteAnyLive(playCode(n), t, bt)` across `bt ∈ [0, PLAY_SECONDS + 0.3]` instead. Render acts 80, 81, 84, 134, 136 and 138 with it. Render the "before" strip from `git show HEAD:components/lesson/cinematic/moves.ts` in a temp copy.
- [ ] **Step 4:** Send both strips to the owner with SendUserFile. **Gate: the owner approves before Stage 2 starts.**
- [ ] **Step 5:** Do not commit. Report the numbers and wait.
