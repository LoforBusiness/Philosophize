# Stickman movement library — verification harness

**Date:** 2026-08-02
**Status:** done. This file REPLACES an earlier design doc that was wrong; see below.

## What the earlier version of this file claimed, and why it was wrong

It proposed adding eighteen motions — travel gaits, asymmetric gaits, one-shots and
change-of-level transitions — on the stated premise that `rig.ts` had *"exactly one
way to travel, and no transition between body positions."*

**That premise was false when it was written.**
`components/lesson/cinematic/moves.ts` had been in the repo since 2026-07-27
(commit `9c8e3de`, "Rig: a much larger movement library") and already had:

| | |
|---|---|
| 12 travel modes | walk · stroll · hurry · run · trudge · march · sneak · limp · skip · tiptoe · back away · pace |
| 15 postures | crouch · kneel · sit on the ground · perch · recline · squat · sprawl · … |
| 28 one-shot actions | sit down · stand up · jump · throw · push · drag · stumble · fall · get up · … |
| aiming | `gazeAt` / `pointAt` — the head and hand track a real stage point |
| turning | `dirTurn` / `turnDip` |

The proposed eighteen were almost entirely a rebuild of those.

**How it was missed:** the search was `grep "export function \(run\|jump\|sneak\|…\)"`
run against **`rig.ts` alone**. The directory was never listed, and `moves.ts` names
its functions `moveStance` / `actStance` / `postureHold`, which match no verb in that
pattern. A single `ls` of the directory would have caught it.

The lesson worth keeping: **before proposing to build a capability, list the
directory.** Grepping for the names you expect only finds the design you already
have in mind.

## What was actually built

**`scripts/check-moves.mjs`** — numeric verification for the whole movement library,
running `rig.ts` and `moves.ts` in plain Node through sucrase. No Metro, no device.
Four checks:

| Check | Catches |
|---|---|
| skate | a planted foot moving in world space |
| ground | a limb driven through the floor, allowing for authored sink and kneels |
| discontinuity | a real gap in the function, told from merely-fast by re-sampling |
| landing | a transition ending off its destination pose |

`--probe` registers a deliberately broken motion per check and expects all of them
to fire. A check that never fails is not a check.

**`scripts/sheet-moves.mjs`** — filmstrips at the renderer's true stroke weights,
for the failures no number can see. `node scripts/sheet-moves.mjs posture:8 act:3`.

## Three defects it found, all now fixed

1. **`move 7` (limp) skated its planted foot 7.3 units per stride.** It scaled
   `footR.x` as well as the lift; the foot-lock depends on a planted foot advancing
   by exactly `S`, so shortening its travel drags it along the floor.
2. **`act 3` (jump) teleported the pelvis 13 units at take-off.** `load` fell 1 → 0
   in one step while the flight term was still zero.
3. **`posture 8` (squat) drove a knee 4.9 units below the ground line.** The back
   foot at −13 folded the leg to 18 of its 37 units and the solver bent the knee
   down and back.

## Two checks that had to be thrown away or rebuilt

Both failed the same way, and it is the failure mode to expect here:

- **A reach check** flagged ~30 of 55 motions. `moves.ts` states the rule it was
  violating: past ~33 units the solver clamps and the arm goes straight, which is
  **safe** and is how a pointing arm is made; the real defect is the 18–30 middle,
  where the elbow bows out and cuts a hole against the torso. That depends on what
  the author meant, so it is a sheet's job, not a number's. Removed.
- **A continuity check** could not tell a snap from a teleport. It now samples 16×
  finer and compares: a fast-but-continuous move's per-frame delta shrinks with the
  interval, a real gap does not. `act 19` went 12.34 → 0.22 (fine); `act 3` held
  13.95 → 13.02 (a cliff).

**A check that fires on almost everything has told you nothing.** It happened twice
in one day — here, and on the word-margin sweep that reported 40 split words and
then 8, nearly all of them arithmetic.

## Not done, deliberately

`armY` on `Gait` was built and then reverted: `moves.ts` gives each travel mode its
own hand positions in `moveBody`, so the field had no reader, and an unused field on
a core type is the same clutter as a setting nothing reads.

## The gaps that were real — now filled

Two-figure interaction and object handling *were* genuinely absent, and became
`components/lesson/cinematic/interact.ts`.

The enabler is **`handAt`**: `pose()` hands a scene transforms and never a joint,
so a scene drawing an object in someone's hands had no way to ask where the hands
were. Every held prop in the app was really a prop the figure stood beside. With
`handAt` (body → stage point) alongside the existing `gazeAt`/`pointAt` (stage
point → body), an object can sit in a real grip, and a second figure can reach for
that same point.

On top of it: `carryMode` (travel while holding — a figure that had just picked
something up used to walk away swinging both arms), `propAct` (8 actions:
catch, lift heavy, set down, pull, hold out, place high, open, crank), and the
pair set — `handshake`, `passObject` (which returns the object's position, so the
prop is in a hand at every frame), `converse`, `leanToward`, `pairPosture`.

**A sixth check came with them.** Two figures each posed correctly can still reach
past each other — it looks right in either figure alone and wrong in the frame, so
no per-motion check would ever find it. `checkMeet` measures whether the two hands
ever occupy the same point. It caught a bug on its first run, and then a second one
in itself: `solveAt` assumed `dir = 1`, so the left-facing figure's hand came out on
the wrong side of its body and a working handshake reported 56 units apart.

It also pinned down a real limit: **two figures only touch within about 60 stage
units.** `canShakeHands` computes it from the geometry — at the handshake height a
hand gets 30.1 forward of its figure — after a first version using a round fudge
factor answered "no" at separations where the hands measurably do meet.

