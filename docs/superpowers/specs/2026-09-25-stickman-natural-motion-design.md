# Stickman natural motion: fixes, pairs, and the lawn chair

Date: 2026-09-25. Status: approved in conversation; awaiting spec review.

## What the owner asked for

> "the stickman will sometimes make a movement with his hand and then at the end of
> the animation … the hand will very quickly move down … I dont want any of these
> really fast movements."
> "one of the movements where the stickman I think is looking down and up looks bad,
> its like his head moves up but his body down."
> "the lying down animation is pretty bad, dont really know what I am looking at."
> "grab a chair out of noware, like a lawn chair, set it up, and then sit down, mabye
> fidget his hand and arms just a little, maybe pull out some coffee or tea, crossing
> his legs sometimes, and then looking down sometimes when words are being read out,
> or looking up sometimes as well."
> "if there is more than 1 stickman on screen they must be communicating and
> operating in some way that looks natural."
> "you should never guess to what you are seeing."
> And, on approving the design: find a route that does not take hours, or a faster
> way to measure and see changes.

Decisions taken with the owner (2026-09-25):

- The chair routine spans several taps: set up on one screen, seated for the next
  few, folded away on the last.
- It rotates: roughly one lesson in three; the others get a lighter set piece; two
  neighbouring lessons never repeat one.
- The chair comes from behind his back (the cartoon gag), is flicked open, set down
  with a small bounce, and sat in.
- Two or more figures face each other (a crowd faces the speaker), take turns, and
  the listener reacts. A shared task means both face the thing.
- "Lying down" means the drift layer's floor sit (`wander.ts` `sitStance`), which
  reads as neither sitting nor lying.

## Findings that shaped the design (measured, not guessed)

- **The fast hand drop is in the PLAYED one-shot actions**, not in rig's shared
  `lift()` curve (whose worst frame is under 2 units). `emoteAnyLive` squeezes every
  action into `PLAY_SECONDS = 1.5`, and many actions spend their last 10–15% of `u`
  returning to the stand. Measured hand speed per frame, worst first, with the time
  it happens: act 114 (code 413) 6.9 u/frame at 1.05s, act 80 (379) 5.2 at 1.37s,
  act 138 (437) 5.2 at 1.38s, act 134 (433) 4.6 at 1.40s, act 136 (435) 4.3 at 1.38s.
  Codes 379, 380 and 383 appear in about 42, 48 and 93 scripts. The act 80 filmstrip
  shows the arm falling from overhead to his side across two frames.
- **The look carries no direction.** In `wander.ts` `looked()`, a look down drops the
  pelvis 4.5 and bends forward while the head stays level, so the body appears to sink
  under a still head. The head is a plain disc with no face, so the neck angle alone
  is invisible (N12).
- **The floor sit** leans back with the legs out and the arms lost inside the trunk
  (rule 1b), so it reads as a half-lie.
- **22 scenes draw more than one `<Stickman>`**, plus 32 lessons where the player
  draws the visitor (AA8).

## Speed: no multi-hour browser sweeps

Every stage is chosen so its verification is offline unless proven otherwise:

| Change | Why it needs no browser re-measure |
|---|---|
| Played-action retiming (`moves.ts`) | `moves.ts` is outside `muststamp`; the pose-reach bookkeeping (`seed-pose-reach`, `regrow-pose`) grows stored figure boxes arithmetically, and only where a pose REACHES further. Slower returns do not change end poses. |
| Look up/down and floor sit (`wander.ts`) | Offline layer; `check:wander` replays it through the real rig; room is already measured. |
| Chair and mug (`Stickman.tsx`, new `props` drawing) | Drawn by the figure like wardrobe pieces; outside `muststamp` by design. Placement is computed offline from existing `mustBoxes` (the `make:wander` method), so the chair is only ever put where the stage is already known to be clear. |
| Two figures facing (scene edits) | The only scene edits. A facing change moves only that figure's box, which is regrown arithmetically from the rig; stamps are renewed by a two-part proof (the `restamp-lip`/`restamp-skin` pattern: the diff against HEAD touches only facing and pose arguments, and the regrown boxes are written). Any lesson whose diff fails the proof is re-measured alone. |

Visual verification is `sheet:moves` / `sheet:wander` / a new `sheet:idle` filmstrip in
plain Node (seconds). Real-app confirmation is `sheet:beats` on only the lessons a stage
touched, never a corpus sweep (owner's standing rule: re-check only what was fixed).

## Stage 1 — no fast hand movement

- Every played action gets a return phase that brings its hands to rest over at least
  0.45 s of beat time, easing out with zero velocity at rest. Actions whose motion is
  front-loaded keep their timing; only the tail is retimed. Where a whole action is too
  dense for 1.5 s, it gets its own play length (a per-act table read by
  `emoteAnyLive`); `PLAY_SECONDS` stays the default. The held (`u = 1`) pose of every
  act is unchanged, so `carryFrom`/`keepHeld` continuity (group L) still holds.
- Rig's `lift()` becomes a bump with zero velocity at both ends (`sin²`), because a
  sine returns to zero at its fastest.
- **New check, in `check:moves` (or `check:idle` if it fits there better):** a hand-speed
  ceiling. For every emote 0–99 and every played action, hand travel per 60 Hz frame may
  not exceed a limit (initial value set just above the measured worst of the actions
  that already read well, then ratcheted). A declared set of intentional snaps (double
  take, startle) is exempt by name. `countertest` puts act 80's old tail back and
  must fail.
- Rule added to LESSON_RULES group N.

## Stage 2 — looks that read, and a floor sit that reads

- `looked()` is rewritten so the whole upper body moves one way:
  - **Up:** lean back from the hips, head furthest back, one hand rising to shade the
    brow (the hand is the readable cue on a faceless head).
  - **Down:** bow forward from the hips with the head leading; hands clasp behind the
    back. The pelvis does not drop and the head must end lower than it started.
  - **New rule in `check:wander`:** the head centre travels at least a set distance in
    the look's direction, and the chest never moves against it. The old
    "head level, body sinks" look must fail it.
- `sitStance` is redrawn: knees up with the forearms wrapped round the shins (arms
  outside the trunk, rule 1b), plus a cross-legged variant. The transition down and back
  up keeps the existing continuity guarantees.
- Filmstrips of both go to the owner for approval before the table is regenerated.

## Stage 3 — two figures communicate

- **Facing:** in every scene with two figures on a beat, each faces the other; in a
  crowd, each faces the speaker; when a beat's figures share a task, each faces the
  task's object. The visitor already turns to the lead on arrival.
- **Turn-taking:** the speaker on a beat is the figure whose pose is a gesture; the
  other is given a listening reaction from a small set (nod, head tilt, hand to chin),
  never the same one twice in a row.
- **Exceptions** are declared in the scene with a comment the checker reads (for
  example, a figure walking away is the point of the beat).
- **New check `check:pair`:** reads each multi-figure scene's per-beat facing and poses
  (offline, the way `check:turn` finds the travelling pose) and fails a beat where two
  figures face away from each other or both stand silent in the same frozen pose.
- Crowd scenes (`politicalScene`, `political9Scene`) follow the speaker rule and are
  looked at individually.

## Stage 4 — the lawn chair and the lighter set pieces

### What the reader sees

- **Chair stretch, 3–5 consecutive screens:**
  - **Set-up screen:** he reaches behind his back, pulls out a folded lawn chair
    (clearly a folded chair in his hand before it opens), flicks it open, sets it down
    with a small bounce, turns and sits.
  - **Seated screens:** cross legs, uncross; a mug appears from behind his back with a
    thread of steam, he sips and lowers it; he looks up or down while the voice reads;
    small fidgets (fingers drumming on the armrest, a shift in the seat).
  - **Last screen:** he stands, folds the chair, tucks it away behind him.
- **The chair is a palette object, not ink:** an aluminium-grey frame with striped
  webbing in two tame swatches, so it can never merge with the solid-ink figure. The
  mug is a small cup in a palette colour with a paper-white steam thread. Neither uses
  the ember except as a tiny accent. Exact colours are chosen from a rendered sheet the
  owner approves.
- **Lighter set pieces for the other lessons:** coffee while standing, the new floor
  sit, leaning. Neighbouring lessons never share a set piece (the costume rule).

### Where it may happen

A stretch is only placed on consecutive beats where all of these hold:

- no graded question;
- the scene's pose for him is not a prop or working pose;
- he does not travel (the x track is constant);
- no visitor;
- no thought bubble whose placement assumes a standing head;
- the floor beside him has room for the chair on every beat of the stretch, measured
  from `mustBoxes` against the frames `tours.ts` shows.

Room is checked for the chair's full footprint, including while it is being opened.

### How it is built

- **Drawing:** `Stickman.tsx` gains a props layer beside the wardrobe: the chair drawn
  BEHIND the far limbs (before them in paint order), the mug hung off a hand. Both are
  Views, never SVG (§17 rule 7), hung off joints the bundle already carries.
- **Motion:** a seated-stretch state added to the drift layer (`wander.ts`), driven by
  the same pure-function-of-time rule and read through `lookPose`, so no scene is
  edited. The stretch is lesson-level: each beat of it has a phase (set up / seated
  activity / put away). Continuity is carried in the same memory `carry` uses, so:
  - a tap mid-move hurries the move to its end over about 0.4 s rather than cutting;
  - a tap back runs the phase in reverse;
  - leaving the stretch early (a graded beat, a skip) always walks through put-away
    first.
- **Choreography data:** `data/lessonIdle.ts`, generated by `npm run make:idle` from the
  rules above and the rotation; the chair's sit time is aligned to narration pauses
  like `make:wander`.
- **Generator chain:** `make:idle` runs after `make:thoughts` and before `make:wander`,
  and the drift layer skips beats a stretch owns.

### New checks

- **`check:idle`** (an extension) or a new `check:chair`: every stretch fits its room on
  every beat; the chair and mug stay inside the band; the figure's pelvis sits on the
  seat within tolerance for every seated frame; no frame jumps (group L), including
  taps at every tenth of a second and taps back; the rotation holds.
- `countertest-chair` stages each defect on a copy.

## Order and approval gates

1. Stage 1: retime, add the speed check, filmstrip of the worst ten before and after.
   **Owner approves the strip.**
2. Stage 2: new looks and floor sit filmstrips. **Owner approves.** Regenerate wander
   and thoughts.
3. Stage 3: the pair audit, fixes, check, and a `sheet:beats` look at the changed
   lessons.
4. Stage 4: chair and mug drawn on a sheet first (**owner approves the look**), then the
   motion filmstrip (**owner approves**), then the generator and wiring, then a
   real-app look at three or four lessons.

Each stage ends with `npm run check` exit 0 (captured to a file, never through a pipe)
and CLAUDE.md / LESSON_RULES updated. Nothing is committed or published without the
owner's instruction.

## Out of scope

- A face on the stickman (it would change the mascot).
- Changing camera tours.
- Speech bubbles between figures.
