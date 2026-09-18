# Lessons: whole-body movement, an event on every tap, and the gamified look

2026-09-17. Asked for by the owner in three parts, and approved in this shape:

1. The stickman moves his whole body between taps — looks up and down, walks a few
   steps, crouches, sits on the ground — rather than only moving his arms.
2. Every tap in every lesson changes the picture, not just the figure. 612 taps
   across 213 lessons do not today. Each one gets an event written for that lesson,
   taken from what its line says, to the standard of the 18 openers.
3. The pictures take the app's own gamified depth look — solid faces on hard
   ledges, rounder shapes, a real floor, a shadow under things that stand on it.

The owner's own words set two limits that outrank everything below: **the camera is
not to change**, and nothing may read as decoration bolted on ("AI-looking").

## What the research says

- **Duolingo's illustration rules** (design.duolingo.com): every shape is a rounded
  rectangle, circle or rounded triangle; nothing pointy; the fewest shapes that
  carry the idea; flat fills, no gradients; a **pill-shaped shadow** under every
  character and object, never an oval, because an oval implies perspective; a
  chunky bottom ledge on anything that can be pressed.
- **Duolingo's characters** are a state machine driven by the audio: idle
  behaviours, glances and reactions are triggered against the line being spoken,
  and cut short the moment the learner moves on.
- **Brilliant** (ustwo's account) puts small flourishes inside the lesson at the
  moment the learner does something, and keeps the rest quiet.
- **Idle-animation practice**: an idle reads as alive through weight shifts,
  glances and small habitual acts, and through *secondary* action — the body
  carrying what the hands are doing. A looping idle must return to its own start.

The three together are the argument for part 1 being timed to the narration rather
than to a loop, and for part 3's events being one event a tap rather than constant
motion.

## Part 1 — the movement layer

### Where it lives

`lookPose` in `cinematicKit.tsx` is the one call every scene makes for the lead
figure (244 of 244 scenes call it exactly once), and it already carries the answer
reaction through a module-level shared value that no scene mentions. The movement
layer goes the same way: **no scene file is edited, so no must-box stamp goes
stale.**

- `components/lesson/cinematic/wander.ts` — the maths. `wanderState(plan, t, start)`
  is pure numbers; `wanderStance(base, state, t, k)` composes the rig. Imports only
  `rig` and `moves`, so it runs in plain Node for checking, like `rig.ts` itself.
- `cinematicKit.tsx` holds the shared values beside `REACT` (`WANDER_PLAN`,
  `WANDER_T0`, `WANDER_GEN`, `WANDER_MEM`) and applies the layer inside `lookPose`.
- `CinematicPlayer.tsx` writes the beat's plan on every beat change, and resets on
  unmount.

### The vocabulary

A plan is a list of moves, each `[kind, at, dur, target]`, timed in seconds from
the start of the beat. Kinds:

| kind | what it does |
|---|---|
| `STEP` | walks to an offset from where the scene stands him, feet driven by the distance (`strideStance`), so no foot ever skates |
| `TURN` | sweeps the facing through a profile (`dirTurn` + `turnDip`) — he turns before he walks and turns back after |
| `LOOK` | up or down, written on the spine as well as the neck (N12) |
| `SIT` | down onto the ground and back up — `postureHold(3)`, legs out, through a squat rather than sliding down |
| `CROUCH` | down on the balls of the feet (`postureHold(0)`) and back up |
| `LEAN` | a weight shift big enough to read, for a short line with no room to walk |

Timing comes from the narration: `lib/narration/manifest.ts` gives each beat's
length and each word's start, so a move begins in a pause between phrases and the
plan is over before the line is.

### What decides whether he may move, and how far

`scripts/make-wander.mjs` writes `data/lessonWander.ts`, per lesson per beat:

- **Never** on a graded beat, on the summary, or where the pose has him working at
  a prop, kneeling, already seated, dancing, or performing a gag (the classification
  lives in `scripts/lib/wanderrule.mjs`, keyed on the same pose codes
  `liveliness.mjs` already classifies).
- **Only in place** — no steps, no sitting — on a beat that draws a thought bubble,
  because the bubble is placed against his resting head.
- **The room is measured**, from `mustBoxes.ts.json`, exactly as `make:visitor`
  measures the floor for the second figure: every box that reaches figure height
  blocks him, the visitor's own box blocks him, and a pen mark's box blocks him.
- **He stays in the shot.** The frames the camera shows on that beat come from
  `tours.ts` the way `make:thoughts` reads them, and his box must sit inside every
  one of them. The camera itself is untouched.
- **He is home when it matters.** A plan ends back where the scene put him whenever
  the next beat is graded or moves him, and a tap that interrupts a step lets him
  finish that step and then stand.

### How it is checked

- `scripts/check-wander.mjs` — offline. Re-derives the room and fails a plan that
  leaves it, a move on a beat that may not have one, a plan that outlives its line,
  a sit with no room for his legs, and a corpus that has converged on one move.
- `scripts/sheet-wander.mjs` — a filmstrip of every move kind through the real rig,
  in plain Node, because only a picture can say whether a move reads.
- `scripts/countertest-wander.mjs` — puts each defect back.
- `check:idle`, `check:moves`, `check:smooth` and `check:life` keep working
  unchanged: the layer is inert when the table is empty, which is what they replay.
- `tourFlag.ts` gains a switch, as the bubbles and the marks have, so the measuring
  harnesses see a figure standing still.

## Part 2 — the look

One shared style change, not 246 hand edits, and it has to be free of layout
movement or it costs a full re-measure. What may change without moving a box:
colours, corner radii, `boxShadow` ledges, and art drawn inside an existing box.

The direction, from the research above and the app's own depth kit: a flat face, one
hard darker side, a ledge under anything that stands, rounder corners, a real floor
band, and a pill shadow under the figure and under objects on the ground.

**The owner picks from rendered options before any of it is applied.** Three
treatments of two real lessons, rendered in the browser from the real scenes.

## Part 3 — an event on every tap

612 taps, 213 lessons, written per lesson in reading order, one branch at a time.

- Each event is taken from that beat's own words and drawn in the chosen look.
- It is placed inside the frame the camera already shows, so no station changes.
- Each edited lesson is re-measured (`measure:must` by splice), then the derived
  tables are regenerated in the order `make:visitor` → `make:wardrobe` →
  `make:gaze` → `make:thoughts` → `make:marks` → `make:wander`.
- `check:idle`'s dead-tap budget stays 0, and a new ratchet holds the number of
  taps on which the scene itself changes.

## Order of work

Part 1, then part 2's options and the pick, then part 3 branch by branch — because
a tap event has to be drawn in the look before it is worth drawing, and the
movement layer is independent of both.
