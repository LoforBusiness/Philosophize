# Stickman movement library — expansion

**Date:** 2026-08-02
**Status:** approved, not yet implemented

## Why

`rig.ts` is broad in standing gesture and narrow in everything else. It has roughly
fifty emote codes, a set of situational stances (seated, lean, read, sip, swing,
kite, picnic, climb) and twenty-six boxing moves — but **exactly one way to
travel**, and no transition between body positions.

Two consequences, and only the second is a defect:

1. Every figure in every lesson moves at the same speed with the same carriage.
   A script cannot say "he hurries over", "he creeps up on it", "he trudges back".
   That is a *limit*.
2. A figure changing level — standing to sitting, standing to the floor — is a
   straight `mixStance` lerp between the two end poses. A lerp interpolates the
   pelvis and both feet independently, so the body passes through positions it
   never really occupies: the feet slide along the ground while the hips sink.
   That is a *defect*, and it is the thing that currently looks unnatural rather
   than merely absent.

This expansion is speculative breadth for lessons not yet written, so the bar is
that each motion is usable without being tuned again at the call site.

## Scope

Eighteen motions in four groups (6 travel · 2 asymmetric · 4 one-shot · 6
transitions), plus a naming layer. No existing lesson changes.

## Where the code lives

New file `components/lesson/cinematic/moves.ts`, importing only from `./rig`.

`rig.ts` is already 1,973 lines with ~60 exports, and this work would add ~450
more. The constraint that decides the split is that **`rig.ts` has zero imports
specifically so it runs in plain Node** (CLAUDE.md §17) — that is what makes the
filmstrip verification below possible at all. A two-file chain still loads under
sucrase, so the property survives.

Scenes import new motions from `./moves`. `moves.ts` must not be imported *by*
`rig.ts` — that would be a cycle.

## Group 1 — travel gaits

Data only. New `Gait` presets beside the existing `WALK`.

`STROLL` · `MARCH` · `TRUDGE` · `JOG` · `RUN` · `SNEAK`

Two properties of the existing rig make this nearly free, and both are load-bearing:

- **A flight phase falls out of `stance`.** `g.stance` is the fraction of the cycle
  a foot is planted; at `WALK`'s 0.62 the two feet overlap and someone is always on
  the ground. Below 0.5 they cannot overlap, so there are two airborne moments per
  cycle — which is the difference between a run and a fast walk, and it needs no
  new code.
- **Stride is distance-driven, not time-driven.** `phaseFor(dist, g)` returns
  `2π·dist·stance/S`, so the planted foot advances exactly `S` while it is down, at
  any speed. Every preset therefore foot-locks automatically and composes with
  `travelStance`, `strideStance`, `moveTr` and `gaitVary` with no change to any of
  them.

Starting values, to be tuned against the sheets rather than trusted as authored.
Cycle distance is `S/stance` and is given because it is the number that decides
whether a gait reads as the same character moving differently:

| Gait | S | lift | stance | bob | tilt | armSwing | armY | standH | cycle |
|---|---|---|---|---|---|---|---|---|---|
| TRUDGE | 24 | 7 | 0.70 | 2.0 | 0.16 | 0.22 | 8 | 34 | 34 |
| STROLL | 28 | 9 | 0.66 | 2.4 | 0.06 | 0.32 | 7 | 34 | 42 |
| WALK *(existing)* | 34 | 13 | 0.62 | 3.0 | 0.09 | 0.42 | 7 | 34 | 55 |
| MARCH | 34 | 18 | 0.58 | 3.6 | 0.04 | 0.55 | 2 | 34 | 59 |
| SNEAK | 20 | 15 | 0.60 | 1.5 | 0.20 | 0.15 | −4 | 28 | 33 |
| JOG | 42 | 17 | 0.46 | 4.5 | 0.14 | 0.50 | −8 | 34 | 91 |
| RUN | 54 | 22 | 0.36 | 6.0 | 0.22 | 0.62 | −12 | 34 | 150 |

`SNEAK` crouches by lowering `standH` to 28 — `standH` is already a `Gait` field,
so a crouch costs nothing extra.

`bobSign` and `armBase` keep `WALK`'s values (−1 and 0.09) for every preset; they
are omitted from the table only because they do not vary. `armY` is the new
optional field, and `WALK`'s 7 is the existing hard-coded value restated as data.

### The one change to existing code

A runner's hands ride near the ribs; `walk()` hard-codes hanging fists at `y: 7`.
This needs an optional `armY` on `Gait`, read as `g.armY ?? 7`.

`walk()` is used by every walking figure in all 84 cinematic lessons, so the
default must provably move nothing: the acceptance check is that `walk()` output
for `WALK` is **numerically identical** across a full cycle before and after the
change, not merely "looks the same".

## Group 2 — asymmetric gaits

`LIMP` and `CARRY_HEAVY`, as functions rather than presets, because the two legs
differ. Both are asymmetric for the same reason: a limp shortens the load on the
bad leg, and a one-sided heavy load lists the torso away from the weight and
shortens the step on the loaded side. A `Gait` describes one leg pattern, so
neither can be expressed as a preset.

The trap: giving each foot its own `Gait` with a different `stance` or `S`
desynchronises them, because `phaseFor` derives phase from both — the feet would
travel different distances per cycle and skate. So **`S` and the cycle stay
identical for both legs**, and the asymmetry lives in:

- per-foot `lift` (the bad leg barely leaves the ground)
- a pelvis dip timed to when weight lands on the bad leg
- a small torso tilt toward the good side during that stance

That is also what a limp physically is, so the constraint and the appearance agree.

## Group 3 — one-shots

`hop` · `stumble` · `turnToFace` · `doubleTakeStep`

Contract matches the existing boxing moves exactly: `(t: number, u: number) =>
Stance`, with `u` running 0→1 and the pose returning to standing at **both** ends,
so any of them can be dropped into a beat without the scene arranging an entry or
exit.

`turnToFace` is a partial motion by necessity: facing is `dir` in `Cfg`, not a
field of `Stance`, so the function can only supply the weight shift and the step.
The scene flips `dir` at `u = 0.5`. This must be documented at the call site,
because a caller who forgets gets a figure that shuffles and stays facing the
wrong way — which will look like the motion is broken rather than misused.

## Group 4 — level transitions

`standToSit` · `sitToStand` · `standToFloor` · `floorToStand` · `lieDown` · `getUp`

The group that fixes the defect, so the construction matters more than the list.

**These are not lerps between end poses.** They are built from the same principle
that makes `walk` work — the feet are driven by ground contact, not by
interpolation:

- the planted feet stay where they are and do not slide
- the pelvis descends on an eased curve, never linearly
- the torso pitches forward on the way down and comes upright at the end, because
  a body that sits by translating straight downward reads as a lift, not a person
- the hands leave the standing pose early and arrive at the destination pose late,
  so the limbs settle after the mass does

Each transition **must land exactly on an existing pose** — `seated(seatH, t)` for
the chair, emote 48 for the floor sit, emote 49 for the kneel — so a beat can hold
after the transition without a visible jump. This is checkable and is one of the
acceptance criteria below.

`standToSit` takes `seatH` and lands on `seatBob(seatH)`; the floor variants land
on the fixed floor poses.

## Naming layer

Named exports (`RUN`, `SNEAK`, `SIT_DOWN`, …) plus a `MOVES` index grouping them
as travel / one-shot / change-of-level, each with a one-line description of what
it depicts.

The values are the same gaits and functions, so nothing is slower and no existing
lesson changes. The point is discoverability: today a gesture is a bare number
(`p: 25`) whose meaning lives in a fifty-branch if-chain, and the fifty-first
entry makes that worse. Existing emote codes are **not** renamed — that would be a
mechanical diff across all 84 shipped lesson scripts for no behaviour change.

## Verification

Sheets first, then numbers, per `docs/LESSON_RULES.md` Part 3. Neither alone is
sufficient: sheets find poses that are valid and meaningless, numbers find
everything a still frame cannot show.

**Filmstrips.** Twenty frames per motion rendered in plain Node — sucrase strips
the types, `solve()` gives the joints, `jimp-compact` draws bones as thick lines
and joints as discs. Both are already in `node_modules`. A cyclic gait is also
sheeted *against travel*, because a cycle on its own only proves the figure is
moving, not that it is moving at the right speed for the ground it covers.

**Numeric checks**, each targeting a specific known failure:

| Check | Catches |
|---|---|
| Planted foot's world x is constant between frames | skating — the defect that made this whole area suspect |
| No joint below the ground line; pelvis above its floor | a transition passing the body through the stage |
| No hand held at ≥98% of the 33-unit arm for a sustained stretch | IK clamping, where the elbow pins straight then snaps — the failure the `seated` comment documents at length |
| Bounded per-frame delta across every field | non-smoothness, measured directly rather than judged |
| Transition at `u = 1` equals its target pose within epsilon | the visible jump when a beat holds after a transition |

**Guard against the checks themselves.** A pass that flags almost everything has
told you nothing (LESSON_RULES Part 3): an earlier sweep flagged 99 of 100 poses
because it counted a naturally hanging arm as clamped. If a check fires broadly,
fix the check before touching a motion.

## Acceptance criteria

1. `walk()` with `WALK` produces numerically identical output to before, across a
   full cycle.
2. All 84 cinematic lessons unchanged; `npm run check` green (tsc, 180 lesson
   files, cinematic shape checks).
3. Every new motion has a filmstrip that has been looked at.
4. All five numeric checks pass for every new motion.
5. Each transition lands on its target pose within epsilon at `u = 1`.
6. No new colours, no scene-level constants shadowing rig constants (§17 rule 2).

## Out of scope

- Renaming the existing fifty emote codes.
- Two-figure interaction (handshake, hand-off, leading) and object handling
  (push, pull, throw, catch) — both were considered and deferred; they are the
  obvious next expansions once these are in use.
- Any change to `Stickman.tsx` rendering. Everything here is pose data; the
  renderer already draws whatever `solve()` returns.
