# Insights tab — chart motion

**Date:** 2026-08-11
**Status:** approved, ready for an implementation plan
**Screen:** `app/(app)/stats/index.tsx` (the "Philosophy Statistics" tab)

---

## The problem

The Insights tab presents good information and looks right, and it is completely
inert. Nothing moves on arrival, nothing responds to touch, and every visit shows
the identical picture. In the reader's words: *"I really like how this tab looks
and the information it presents. I just don't like how static it feels."*

The second half of the ask is the harder half, and it is the one that decides
whether this is worth building: the motion should make someone **want to do
another lesson**, not merely decorate what they have already done.

---

## What the tab draws today

| Chart | Component | Data |
|---|---|---|
| Top Philosophers | `SketchPieChart` | `views×3 + quotes×5 + lessons in their areas` |
| Areas of Interest | `SketchPieChart` | `interest = lessons×3 + quotes×2 + views` |
| Activity Breakdown | inline `ActivityBars` | `interactions = lessons + quotes + views` |

All three are `react-native-svg`, rendered once, never animated.

> `SketchBarChart` and `SketchLineChart` exist in `components/shared/` and **no
> screen imports them**. They are out of scope here; noted so nobody assumes the
> Activity bars come from `SketchBarChart` — they do not, they are inline.

---

## Decisions

### 1. Entrance — "grow from nothing", gated on change

The pie springs from `scale 0 → 1` with a slight rotation; the bars punch past
their height and settle, staggered ~80ms apart. About 600ms end to end.

It fires **only when the numbers differ from the last time this reader looked at
them.** Not on every focus, not once per launch.

This was the reader's own rule and it is better than any of the three offered.
It turns the animation into a **signal** — movement means something happened
since last time — and it removes entrance fatigue completely, because a tab you
open twice in a minute only animates once.

**Accepted consequence, stated so it is not a surprise:** on a visit where
nothing has changed, this tab is exactly as static as it is today. The tap-ghost
below is what carries those visits.

*Rejected:* "ink draw-on" (rim strokes on, slices ink in) — the most
hand-drawn-looking option and the closest to the app's identity, but it animates
SVG path properties per frame, which is the expensive shape §17 warns about.
"Rise and settle" — cheapest, but it is what the tab effectively does now.

### 2. Tap — the ghost of the nearest milestone

Tapping a slice or a bar grows a **dashed ink ghost** out of it toward the
nearest milestone, ticks the number up to the projected value, and shows one
line of copy naming what it unlocks. Tapping again, or elsewhere, dismisses it.

All three charts respond, including Top Philosophers.

*Rejected:* "focus and count-up" (lift the slice, dim the others) — handsome but
it only re-states what is already on screen, so it gives no reason to do another
lesson. "Expand to a detail card" — richest, but it is a new screen's worth of
layout for the same nudge.

### 3. The milestone is adaptive, not a fixed "+1 lesson"

`interest = lessons×3 + …`, so one extra lesson moves a slice by roughly one to
two percentage points. A literal "+1 lesson" ghost is a 4° sliver — too thin to
read as an animation at all, which defeats the purpose.

So the ghost aims at whichever target is **cheapest in actions**:

| Candidate | Applies to | Cost measured in |
|---|---|---|
| Overtake the element ranked immediately above | all | actions to exceed that value |
| Reach the next round 10% of the total | pies only | actions to reach it |
| Finish the unit currently in progress | branch elements | lessons left in that unit |

**Cost is counted in the action the reader can actually take:**

- **Branch elements** (Areas pie, Activity bars) — cost in **lessons**.
- **Philosopher elements** (Top Philosophers pie) — cost in **saved quotes**
  (`+5`) or **lessons in that thinker's areas**, whichever reaches the target in
  fewer actions. The copy names whichever it chose.

**Tie-break**, cheapest-first, then: overtake → finish the unit → round number.
An overtake names another thing on the same screen, so it reads as the most
concrete.

**The ghost must be visible.** If the chosen candidate would draw a ghost under
6° of arc (pie) or 8px (bar), it is discarded and the next-cheapest is used. If
no candidate clears the bar, the target becomes branch completion, which is
always large. A far-but-visible ghost beats an invisible near one, and the copy
stays truthful either way.

**Nothing left to reach.** An element that is ranked first and whose branch is
complete has no next step: the copy reads "Ethics is complete." and no ghost is
drawn.

---

## Architecture

### Performance — nothing animates an SVG property

§17's rule is that the painted **area** is the cost and that a moving parent
repaints all of it. `check-poll` exists because this exact kind of animation —
`setInterval` driving `setState` inside a component that draws SVG — made the
Profile's XP graph sticky. Both are respected by construction:

- **The pie stays SVG and stays inert.** One `Animated.View` (150×150) scales the
  whole chart as a single composited layer. No per-path writes.
- **The bars stop being SVG.** They are rectangles; they become native `View`s
  with a background colour and a 1.5px ink border, absolutely positioned over an
  inert `<Svg>` that draws only the baseline. Each gets its own `scaleY` anchored
  at the bottom. This is cheaper than today's `<Svg>` and is the only reason they
  can be animated independently at all.
- **The ghost is inert too.** It is drawn at full size as a dashed path and
  revealed by scaling its wrapper from the pie's centre, so it grows outward
  radially. No `d` animation.
- **The counting number reuses `ACounter`** from `components/shared/RankClimbChart.tsx`
  — `Animated.createAnimatedComponent(TextInput)` with `animatedProps={{ text }}`,
  written as a native prop from the UI thread. This is the sanctioned pattern and
  the one `check-poll` points at in its failure message.

Reanimated drives everything (transforms and native props); Moti is not used
here, per the §4 boundary — these are not enter/exit transitions of mounting
components, they are driven from a focus event and a tap.

`AccessibilityInfo.isReduceMotionEnabled()` short-circuits every animation to its
final state.

### Files

| File | Change |
|---|---|
| `lib/utils/statsMilestone.ts` | **new** — the milestone rule and the fingerprint. **Zero imports**, like `rig.ts` and `worldPath.ts`, so it runs in plain Node. |
| `components/shared/SketchPieChart.tsx` | entrance transform; tappable slices; ghost arc; `ACounter` on the tapped value |
| `app/(app)/stats/index.tsx` | `ActivityBars` rebuilt as Views over an inert baseline; focus/fingerprint wiring |
| `stores/userDataStore.ts` | **new persisted field** `statsSeenFingerprint: string` |
| `scripts/check-stats.mjs` | **new** validator, added to `npm run check` |
| `CLAUDE.md` §11 | validator count and list (currently thirteen → fourteen) |

`ACounter` is currently local to `RankClimbChart.tsx`; it moves to
`components/shared/ACounter.tsx` so both call sites share one copy rather than a
second one drifting from the first.

### Data flow

1. `statsFingerprint(...)` builds a string from exactly the numbers the three
   charts render: each branch's `interest` and `interactions`, and the top-five
   philosopher ids with their scores.
2. On focus (`useFocusEffect` from `expo-router`, as the branch and philosopher
   screens already use), compare against `statsSeenFingerprint`.
   - different, or missing/unreadable → run the entrance, then store the new one
   - identical → render the final state immediately, no flash
3. A tap calls `milestoneFor(element)` — pure, synchronous — and the returned
   `{ ghostFrac, projected, copy }` drives the ghost, the counter and the line.
4. `cue()` from `lib/feedback.ts` fires the existing haptic + sound on tap. No
   new feedback primitives.

**A missing or corrupt fingerprint animates.** The safe default is "treat as
changed" — a spurious animation is a much smaller failure than a tab that never
animates again.

**The fingerprint rides the cloud snapshot**, since it lives in the persisted
slice. Consequence: viewing on a phone and then opening a tablet will not
re-animate there. Accepted — it is the same reader and the same "have I seen
this" question.

---

## Verification

`scripts/check-stats.mjs`, run in plain Node against the pure module, wired into
`npm run check`:

- every element yields a milestone or an explicit "complete" — never a blank
- **every ghost clears the visibility floor** (6° arc / 8px bar). This is the
  failure that killed the "+1 lesson" design and it must not come back by
  accident.
- the copy never names a milestone already achieved
- **the fingerprint changes if and only if a rendered number changes** — swept
  over synthetic stores that touch unrelated fields (settings, streak, rank) and
  must not move, and over each charted field, which must. This is how
  "animate on change" silently degrades into "animate always", and it would
  never be noticed by eye.
- cost is always ≥ 1 action, and the projected value never exceeds the maximum
  the branch or thinker can reach

Then, per §21, the real screen is loaded in a browser — a contact sheet cannot
catch a module-load or hook fault, and this change adds hooks to a component that
renders conditionally. A throwaway `app/preview*.tsx` seeds `userDataStore`,
**deleted before committing**, since anything in `app/` is a live route.

---

## Out of scope

- The Profile's `RankClimbChart` — already animated, already fixed for lag.
- `SketchBarChart` / `SketchLineChart` — unused by any screen; deleting them is a
  separate decision.
- Any new Settings toggle. §22's rule is that a settings key earns its place by
  having a reader outside Settings; motion follows the OS reduce-motion flag
  instead, which needs no key.
- Changing what the charts measure. The formulas stay exactly as they are.

## Risks

- **The fingerprint over-triggers.** If it accidentally includes a field that
  changes on every launch, the entrance fires every time and the "signal" meaning
  is lost — silently, because the result looks like a working animation. The
  if-and-only-if check above is aimed squarely at this.
- **The rebuilt bars drift from the SVG version.** Positions are currently
  computed inline against `slot`/`barW`; the View version must reproduce them
  exactly or the labels will no longer line up with the bars.
