# The Lesson Rule Book

Every rule in groups **A–G** exists because a real lesson broke it and it was caught on
a real phone. They are not style preferences — each one is a defect that shipped, or a
direction the product owner gave after looking at one.

Group **H** is the opposite and was written later: the conventions the 48 finished
lessons already share, counted out of the source rather than chosen. Nothing in it is a
bug report. It is there so lesson 49 comes out a sibling of the other 48 instead of an
odd note, and so the next author does not have to reverse-engineer the house style from
twenty thousand lines of scene code.

Read this **before** writing a new cinematic lesson, and run the checks in Part 3
**before** calling one finished. The point is that a new lesson comes out right the
first time instead of being repaired later.

Vocabulary: a lesson is a **script** (`<name>Script.ts`, an array of beats) plus a
**scene** (`<name>Scene.tsx`, the animated stage). The shell that plays them is
`CinematicPlayer.tsx`; the figure solver is `rig.ts`. The design space is 400×560
units with the ground line at y = 500.

---

## Part 1 — The rules

> **A rule that can be arithmetic belongs in the rig, not in this file.**
>
> Everything here is something I can forget on a busy lesson. Where a rule is a
> number, it should instead be enforced somewhere every scene has to pass through,
> so no future lesson can break it even by accident. Four are already enforced that
> way, and each of them was written down here *first* and broken anyway:
>
> | Rule | Enforced by |
> |---|---|
> | a hand is never drawn inside the head disc (B11/B13) | `boxMove` → `clearHead`, `GLOVE_CLEAR` |
> | a walk takes the time its distance needs (C17) | `moveTr` / `WALK_SPEED` |
> | a moved figure walks rather than slides (C18) | `travelStance` |
> | two figures never move as one (B14) | the `seed` on `guard` / `strideStance` |
> | a reader-facing XP figure matches the model (H63) | `CORRECT_LABEL` ← `XP_PER_CORRECT_ANSWER` |
> | an explanation fits the deck (D27) | `check:cinematic`, 290 characters |
>
> When a new defect turns out to be a number, add the guard rail and then point the
> rule at it — don't just write a sterner sentence.

### A. The picture must tell the truth

**A1. What the text says, the picture must do.** This is the first rule because
breaking it is the worst failure: it makes the lesson look like nobody checked it.
If a beat says *"someone is on the floor by their bed"*, the figure is **on the
floor**. If it says *"you cross the room and get down beside them"*, the figure
**gets down**. If it says *"a third camp shrugs"*, the figure **shrugs**.

> *"What the text says and what the stickman is doing must correlate. If the text
> says someone is on the floor by their bed and the stickman is not on the floor by
> their bed, then that doesn't make sense."*

**A2. If the vocabulary can't say it, extend the vocabulary — never substitute the
nearest wrong pose.** The floor bug happened because `rig.ts` had no floor-level
pose at all, so the author reached for `46 slump`, which is a *standing* slump.
Adding `48 sit-on-floor` and `49 kneel-beside` cost twenty lines. Guessing cost a
shipped lesson.

**A2b. Look in `moves.ts` before you conclude the vocabulary can't say it — and
list the directory before you conclude anything.** A2 says to extend the
vocabulary rather than substitute a wrong pose. The failure mode on the other side
is extending something that already exists: `components/lesson/cinematic/moves.ts`
holds **12 travel modes** (stroll, hurry, run, trudge, march, sneak, limp, skip,
tiptoe, back away, pace), **15 postures** (crouch, kneel, sit, perch, recline,
squat, sprawl…), **28 one-shot actions** (sit down, stand up, jump, throw, push,
drag, stumble, fall, get up…), plus `gazeAt`/`pointAt` — which turn the head and
hand toward a real stage point instead of a hard-coded `neck` that only looked
right where it was written — and `dirTurn`/`turnDip` for turning on the spot.

A whole redundant expansion was specced here on the belief that the rig had one
walk and no way to sit down, because the check was `grep` for `export function
run|jump|sneak` **against `rig.ts` alone**. `moves.ts` names its functions
`moveStance` / `actStance` / `postureHold`, which match no verb, and the directory
was never listed. **Grepping for the names you expect only finds the design you
already have in mind.**

`interact.ts` is the third file, and it is the one to reach for whenever a beat
involves anything that is not the figure's own body:

- **`handAt(stance, placed)`** — the stage position of a hand. Draw a held object
  THERE. Without it a prop is placed by eye and drifts out of the grip the moment
  the figure breathes, walks, or plays a different beat, which is why every
  "held" object in the app before this was really an object the figure stood next
  to. `headStage` does the same for the head, and `reachHandTo` is the inverse —
  put a named hand on a stage point.
- **`carryMode(mode, dist, hold)`** — travel while holding something (a box, a
  bag, a tray, a cradled thing, something over the shoulder). A figure that had
  just picked something up used to walk off swinging both arms.
- **`propAct(code, t, u)`** — catch · lift heavy · set down gently · pull · hold
  out · place high · open · crank.
- **`handshake` / `passObject` / `converse` / `leanToward` / `pairPosture`** —
  two figures as one action. `passObject` returns the OBJECT's position along
  with both stances, so the prop is in a real hand at every frame of the pass.

**Two figures only touch within about 60 stage units** (at k = 1) — a hand gets
roughly 30 forward of its own figure. `canShakeHands` answers it exactly; past
that the arms genuinely cannot meet and the staging has to move them closer.

**A2c. The figure is checkable in plain Node — use it before and after any pose
work.** `node scripts/check-moves.mjs` runs every motion in the library through
four measurements: a planted foot that moves (skating), a limb through the floor,
a genuine discontinuity, and a transition that misses its destination pose.
`node scripts/sheet-moves.mjs posture:8 act:3 move:7` draws filmstrips at the
renderer's true stroke weights for what numbers cannot see. Neither needs Metro or
a device, because `rig.ts` has zero imports.

It found three real defects on its first run over motions that had already
shipped: a limp skating its planted foot 7.3 units per stride, a jump teleporting
the pelvis 13 units at take-off, and a squat with a knee 4.9 units under the floor.

Two of its checks had to be **deleted or rebuilt because they fired on almost
everything**, which is the same lesson as D30's: a reach check flagged 30 of 55
motions before it turned out that over-reach is the *intended* way to straighten a
pointing arm, and a smoothness check called every fast snap a defect until it
learned to re-sample 16× finer and see whether the jump shrinks. **A check that
fires on almost everything has told you nothing — fix the check.**

**A3. Secondary figures count.** The narrator's pose comes from the script and is
easy to eyeball. A second figure — the friend, the opponent, the apprentice — is
often posed from a **hard-coded** code inside the scene, where nobody looks. That is
exactly where the floor bug lived.

**A4. Metaphors are not stage directions.** "The gap **sits** between the premises",
"trust would **collapse**", "beauty **sitting** in the object", "whose verdict should
**carry** more weight" — figures of speech. Do not stage them literally. The rule is
about *concrete physical claims about a figure on screen*.

**A5. Record deliberate exceptions in the scene's header comment.** Some things look
wrong by the numbers and are right on purpose: aesthetics-6's mountain dwarfs the
figure — that *is* the sublime lesson; logic-7's board is oversized because the text
on it must be readable; ethics-6's bridge parapet is knee-height because a real one
would hide the figures. Write down *why*, or the next audit "fixes" them.

**A5b. A defect is never one lesson's.** A problem is reported on the lesson where it
was *noticed*, which is almost never the same as where it *lives*. The hole in the
figure's body was reported on the trolley lessons and was in the rig — so every figure
in every lesson had it, and it had already been there for months; the enlarged stages
merely made it visible. It then took **four** separate fixes across three passes,
because each pass repaired the sites it happened to be looking at: 23 gesture codes and
`stand()` first, then `walk()` — which meant *every walking figure in the app* still
had it after the "fix" — then `builderHold` and `seated()`.

So the order is: find whether the defect lives in this lesson or in shared code; if it
is shared, it is in all 48 and the lesson that reported it is a sample, not the scope.
Then build the cheapest thing that can find **every** instance before declaring it
fixed — a grep for the numeric shape (hanging fist targets with y between −10 and +2),
a harness sheet rendering all 48 gestures at once, a script that scrapes every scene's
constants. Reasoning about where else it might be is exactly how the three misses
happened.

> *"Make sure no other stickmen in other lessons are like this … find an easy way to
> find this problem then fix."*

### B. The figure

**B6. One figure scale for the whole app.** The shared `K_FIG` in `cinematicKit.tsx`
is the single source of truth (currently `1.0` → a 103-unit figure, crown at y 397).
**Never declare a local `K_FIG`.** Two lessons did, at `1.35`, shadowing the shared
constant — so when the app-wide size correction landed, the first two lessons every
new user plays kept drawing figures 35% larger than the other 46. Relative sizes are
fine and must be **derived**: `K_FIG * 0.88` (apprentice), `K_FIG * 1.16` (a nearer
figure), `K_FIG * 0.82` (background citizens).

**B7. The figure must be in proportion to the objects around it.** The test is not
"does the figure look nice alone" but "does it look right next to the prop". Sanity
numbers: a ring's corner post ≈ **0.8×** a boxer; a stone arch a person is building
≈ **1.1×** them. Before correction the boxer stood head and shoulders over his own
corner post (0.58×).

> *"I dont want the stickman larger than they should be or smaller than they should
> be based on the surrounding elements."*

**B8. Figure-to-PROP distances stay; figure-to-FIGURE distances scale.** When the
figure's size changes, this decides what moves:

- Against a **prop** (a builder beside a fixed brick stack) the figure **stays put** —
  that is precisely what puts it back in proportion.
- Against **another figure** (two boxers squaring off) the gap **scales with the
  body**. Their separation was derived from their own head size; left alone, smaller
  boxers drift apart and the confrontation goes limp.

**B9. Two figures need ≥ ~100 stage units between them.** Below that the two heads
read as one black mass on a phone long before the bodies touch — heads are ~40% of
figure height. It forced the boxers apart in lesson 1 and bit again in ethics-8 at 76
units. ~104–112 reads cleanly. **Check the gap at the CLOSEST beat, not the average.**

**Where two figures INTERACT, author the distance from intent, not by hand.** A fight
needs four distances and each is a sum of reaches and radii, not a taste call: OUT
(~112, nothing can reach), TRADING (~80 = 35 punch + 26 his raised glove + 18 radii),
LANDING (~62, closer than the static sum because the defender is already moving away
by the time the fist arrives), CLINCH (~76). Lesson 1 derives the standing distance
from the exchange's declared intent plus each move's own lunge (`MOVE_ADV`), because
hand-typed distances forget the lunges — a clinch at "74" closed another 32 and the
two men became one black heart-shaped blob.

**A GUARD'S HANDS BELONG AT THE JAW, NOT IN FRONT OF IT.** This is a two-figure rule
even though it looks like a pose rule. Hands parked 27–33 units ahead of a head whose
centre is at x 6 are not a guard, and two figures doing it at punching range put four
9-radius gloves in the same few units of paper: the pair fused into a single dark
bridge at exactly the moments the fight was busiest. Pulled back under the chin they
clear the head disc, leave the middle empty for whatever is actually being thrown, and
give every punch a longer and more visible extension.

**And "closest" includes root motion, not just the resting marks.** Lesson 1's boxers
sat at a comfortable 96 and still fused, because a cross carries `adv: 18` and the
answer carries its own — a real exchange closed them to about 60. Separation is set by
`base − (max adv of A) − (max adv of B) − any idle drift`, and *that* number is what
has to clear 100. The same arithmetic gives the upper bound: a punch reaches x ≈ 38,
so if the closed distance drops much under ~65 the fist is drawn **through** the other
figure's head instead of arriving at it.

**B9a. The span to check is the one the POSE makes, not the one the body makes.** A
resting figure spans about x ± 36, and that number is the one that ends up in the
composition comment. Then a beat holds gesture `47 frame-it-up`, which sizes something
with both hands, and the same figure spans ± 40 — and the answer card laid out to the
old number is drawn 2 units into his hand. This was caught by measuring rather than by
looking, on a lesson that had already been "checked". **Take the extent from the rig at
the pose the beat actually holds**, and take it across the whole transition, because a
walk's arm swing is wider than either end of it.

**B9b. Anything that POINTS at a figure must point at the HEAD, not at its x.** A
figure's x is the spot between its feet, and a leaning one carries its head several
units ahead of that — two boxers leaning toward each other are much closer at the
head than on the floor. Every speech-bubble tail in lesson 1 sat a head's width wide
until it used `headAt(tilt, neck)` instead. Applies to threads, labels and leader
lines as much as to bubbles.

**B10. Anything pinned to the figure must be derived from the figure.** A halo, a
speech bubble, a thread between two heads — write it in terms of `K_FIG` and the
rig's landmarks so it tracks. Hand-placed literals rot silently: metaphysics-5's aura
was a literal at `GROUND − 150` and ended up floating 33 units above the head it
encircled; ethics-8's thread hung 60 units above everyone.

Landmarks (rig units × `K_FIG`): pelvis **34** above ground; head centre **83** above
ground (49 above the pelvis); head radius **20**; crown **103**; shoulder (±3, −26)
from the pelvis; arm reach **33**; leg reach **37**; body+arms span about **x ± 36**.

**B11. Reach rules.**
- A **hanging** hand belongs at about **y +6**, near arm's length below the shoulder.
  At y −4 the solver folds the elbow, the arm bows outward, and it encloses a paper
  triangle that reads as **a hole punched through the body**. This defect has been
  fixed in four separate places; when auditing, grep for hanging-arm fist targets
  with y between −10 and +2.
- A **raised** hand must clear the head disc — anything within ~24 units of (0, −49)
  fuses into the skull. Hands overhead belong at |x| ≈ 26, not 14. Exceptions are
  poses where touching the face *is* the gesture.
  **The head does not stay still, so checking the target alone is not enough.** `neck`
  tips the head forward — a duck is −0.25 — and swings the disc onto hands that were
  perfectly clear standing upright. Every combination of pose and neck angle is a
  separate latent bug, which is why boxing now enforces it instead of listing it:
  `boxMove` re-derives the head from the pose's own tilt/neck and pushes any fist
  inside `GLOVE_CLEAR` back out. Gesture libraries are still checked by hand — so when
  adding one, check the target against the head position *that pose* produces.
- **A hand inside the head is not "close to the head" — it is GONE, and so is the
  gesture.** The fist is a disc of radius 5.5 and the head is 20, so a wrist within
  14.5 of the head centre is *entirely* swallowed and the pose renders as a figure
  standing still. Three shipped gestures did this: `11 forehead` aimed at (6, −52),
  `12 scratch-head` at (4, −56) and `34 shield-eyes` at (4, −48), against a head
  centred near (0, −49). Fourteen beats across the app said someone was thinking hard
  or shielding their eyes and drew nobody doing anything.
  **And the fix is never "reach higher."** The arm is 33 from a shoulder 23 below the
  head centre, so the crown is out of range entirely — the only part of the head the
  hand can reach is its FRONT rim, about eye level. Aim the fist AT the rim (centre
  ~20–25 out) so it half-overlaps: that reads as a hand at the temple, and it is the
  most this figure can do. Tell such gestures apart by the head angle and the other
  hand, not by the working fist.
- **An ink limb on an ink torso is invisible, wherever you put it.** `10 arms-crossed`
  parked both hands 9 units either side of the spine, so both forearms lay along a
  12-thick torso in the same colour and the pose drew a figure with no arms. Moving one
  hand *behind* does not help — nothing on the torso reads. A pose that has to be seen
  must put the limb against open paper: folded IN FRONT, the two forearms are two
  horizontals against nothing, which is also what folded arms look like in profile.
  Same rule, same cause as B16b on a leaning figure.
- **A hand near EITHER end of the arm's range makes the elbow whip, and a hand crossing
  its own shoulder is the worst case.** The IK puts the elbow from the direction of the
  shoulder→wrist vector, so when that vector is short its direction swings wildly for a
  hand that is barely moving. The loafer's folded hand rested 7 units from a 33-unit
  arm and its path to the wave took it within **0.67 units of the shoulder itself** —
  the arm collapsed to nothing and re-extended, and the elbow travelled at **4.92
  units/frame against a hand doing 0.80**. Six times the speed of the thing it is
  following is exactly what "that doesn't move like an arm" looks like.
  The far end does the same in reverse: at 95%+ the elbow pins dead straight and snaps
  the moment the hand comes back in range. **Keep working hands between roughly 30% and
  90% of reach**, and where a gesture starts from a fold, take the hand OUT before UP so
  the vector lengthens before it rotates — which is also just what a person does
  unfolding their arms. When auditing, measure the elbow's speed against the hand's; if
  the elbow is faster, the hand is in a singularity.
- **A hand's clearance is measured from its EDGE, not its centre.** The fist is a disc
  of radius `limb/2` = 5.5, so a wrist 24 units from a head of radius 20 has its fist
  1.5 units *inside* the skull. The wave was cleared at 23.9 and still drew across his
  own face. The bar is `headR + 5.5 + margin` ≈ **29 to the wrist**, and it applies to
  the whole sweep of a gesture, not just its peak — an oscillation that swings back
  toward the head is checked at its inner extreme.
- **Oscillate a hand in POLAR terms about the shoulder, never by adding to its x** —
  and for a figure in profile, oscillate the RADIUS. Adding ±4 to x drags the hand
  toward the head on every inward stroke and changes the arm's extension on every
  stroke, so both the clearance and the singularity checks have to be redone per frame.
  Polar fixes that. But which polar term matters: the figure is drawn side-on, so a
  real wave — a hand rocking left and right — happens straight through the screen and
  cannot be drawn at all. What reads in profile is the forearm rocking **fore and aft**,
  which is the reach. Swinging the ANGLE looks like the same fix and is not: at 19°
  above horizontal, rotating the arm moves the hand almost entirely up and down, and it
  measured 0 lateral reversals against 2.7 units of x-range — the vertical twitch it was
  meant to replace, in a costume. Reach ±5.5 gives 9.5 units of x against 4.7 of y and
  6 reversals. **State the axis you expect the motion on, then measure that it happened
  on that axis.**
- **A clamp makes distinct inputs identical.** `solve` pulls any fist past the arm's
  33-unit reach back onto the reach circle, so two different over-reaching targets
  land in the same place. The jab (55, −31) and the cross (60, −29) both did: 1.5
  units apart on screen, two of the four punches the same picture, for months. Keep
  punch targets *inside* the reach so each keeps its own line, and whenever a value
  passes through a clamp, verify the things that should differ still do.
- The **pelvis cannot outrun the legs**: a planted foot needs `34 + bob − footLift ≤ 36`.
- Going **low** is fine (knees bend), but a low pelvis needs the feet moved
  **forward**, or the leg folds straight down and throws the knee out sideways.

**B11b. What this figure can actually reach — the table, so you stop designing poses
it cannot hold.** Measured off `stand()` at 88% of reach, which is inside both the
folded and the stretched singularity. Shoulder (1.2, −25.7); head centre (−3.8, −48.8),
radius 20; arm 33; fist radius 5.5.

| hand at y | furthest forward x | against the head |
|---|---|---|
| 0 (hip) | 15 | 27 clear |
| −10 | 26 | 23 clear |
| −20 | **30** | 19 clear |
| −30 | **30** | 13 clear |
| −40 | 26 | 6 clear |
| −45 | 23 | grazes it (1.5) |
| −50 | 17 | **fist inside the head** |
| −55 | — | the ceiling: nothing higher is reachable at all |

Three things fall straight out of it, and each has cost a defect already:

- **The hand cannot go above the head. Ever.** It tops out at y −55 and the crown is
  at −69 — fourteen units short. Every pose written as "reaches up to…" is really
  "reaches forward and a bit up", so a ladder rung, a high shelf or a raised trophy has
  to come to the hand rather than the other way round (C22d2).
- **The working band is y −10 to −40.** That is where the hand is both far from the
  body and clear of the head; the widest point is x 30 at chest height. Props the
  figure touches belong there.
- **Above y −45 the head is in the way**, and it gets worse as the figure leans, since
  a lean carries the head forward into exactly the space the hand wants (§B9a).

**B11c. A gesture that blends OUT of a base pose must be written relative to that
base — and changing a base means re-measuring everything downstream of it.** The
completion-screen wave carried a `dip` of a fixed 12 units, tuned when the resting hand
sat at y −17. The rest pose later moved to −8, entirely reasonably and for its own good
reasons, and the same fixed 12 then pushed the hand to (24, +4): **99% of reach**, where
the IK clamps and the elbow snaps. Nothing about the wave had changed; nothing about the
rest pose was wrong; the two were just measured against different worlds.

Write the offset as a function of the base — *"carry the hand to at least y −6, and by
zero if it is already lower"* — not as a magnitude that happens to work today. And when
a `*Hold` moves, sweep every `*Live`, every gesture and every scene that blends from it
before calling the change done. This is A5b in miniature: the defect was not in the
thing that was edited.

**B12. Feet stay narrow and near-vertical when standing** — a wide sliding stance
makes near-straight legs read as two segmented bars with a gap between them. And
**deep crouch/kneel/squat feet must be STAGGERED, never mirrored**: two 11-thick legs
folded to the same angle merge into one black mass and the figure loses its legs.

**B13. Accessories must not fuse with the body.** A glove's radius must be **under
half** the head radius (9 vs 20) or head and gloves read as one mass. Crowns, horns
and swords attach by reading the figure bundle's `head` / `wrR` transform in a
`useAnimatedStyle` — that works well; guessing a fixed offset does not.

**B14. No two figures in lockstep — and that includes standing still.** Two figures
running the same gait from the same clock move like a mirror. `strideStance`/
`travelStance` take a trailing `seed` — give any companion a non-zero one. The tell
when auditing: two `pose()` calls whose x comes from the same expression (`bx` and
`bx + GAP`).

**The idle counts too, and it is the easier one to miss**, because nothing in the
choreography looks wrong. Lesson 1's boxers threw different punches on different
beats and still read as one body, since both called `guard(t)` with the same clock and
the same frequencies: they bounced, swayed and breathed on identical frames between
the punches. `guard` now takes the same `seed` for its own tempo, phase, bounce depth
and stance width. Any shared idle — `guard`, `stand`, a custom loop — needs one.

**But `stand()` has no seed, so for standing figures the lever is the CLOCK.** This
rule used to say "give the companion a non-zero seed" and then send you to a function
that does not take one: `strideStance`, `travelStance` and `guard` accept a seed,
`stand` and therefore `emoteHold`/`emoteLive` do not. For two or more figures idling
side by side, pass each a **shifted clock** — `emoteHold(code, t + 4.3)` — which
desynchronises the breathing, the weight rock and the head drift just as well. Use both
when a figure does both: a seed on its walk, an offset on its stand. Five figures share
one stage in political-9 and each gets `t + k · 1.63`; three share ethics-10 at 0, +2.1
and +5.6. Pick offsets that are not multiples of each other, or two of them will come
back into phase on the slow terms.

**B15. Every figure on stage must have a reason to be there.** ethics-5 carried a
second walker left over from an earlier draft of the script; the narration no longer
referred to either figure and the two moved identically.

> *"There are 2 stickman doing the same action, I dont know why there are 2, and why
> they are both moving the same way."*

**B16. Joints must not show.** The figure is one smooth silhouette. Three separate
causes have produced visible beads at elbow, knee, wrist and ankle:
- a joint circle drawn **wider** than the bone it caps (a cap at exactly half the
  bone thickness is already a perfect capsule; anything wider is a bead on a stick);
- a **1px-wide** bone stretched by `scaleX`, which rasterises imprecisely and leaves
  white nicks — hence `BONE_SRC = 100` with `scaleX: len / 100`. **The two are a
  matched pair; never change one alone.**
- a **missing** cap where two bones meet (the shoulders had none).

Never "fix" a seam by making a cap bigger. Find which of the three it is.

> *"I want the segment character to be more smooth, and you can't see the joints."*

**B16b. A leaning figure's hanging arm vanishes into its own torso.** B11 puts a
resting hand at about y +6, and that is right for an **upright** body — but on a figure
that leans, the arm runs down the length of the torso instead of hanging clear of it,
and at this stroke weight the two merge into a single lump with no arm in it. The
completion screen's waiting figure leans on the rule, so his arms are **folded**; a
hand resting on the prop he leans against works too. Whenever the lean is more than
slight, give the arms somewhere to be.

**B16b-2. A fist tucked BACK past its own shoulder puts the ELBOW behind the head —
and the pose to check first is the one the figure is doing when nothing is happening.**
Both halves of this were found the same day, on the reward screen's leaning figure.

The geometry: fold a hand back to x −8 at chest height and the arm has to double
over, which swings the elbow up and back to (−18, −30) — **4.1 units inside a
20-radius head disc**, on the arm that draws in *front* of the head. Anything at
x ≤ −4 in that y-band does it; bringing the hand forward to x ≈ 4 drops the elbow to
(−11, −11) and clears by 11.6. A hand tucked back and **low** (y ≥ +4) is fine — it is
the combination of back *and* raised that folds the arm. Hands low and forward also
read better on a leaning figure than folded arms, which is what this pose had been.

The process half matters more. That figure's gesture library had been through three
separate documented fixes — the wave alone carries notes on a shoulder singularity, a
missing hold and a wave that was vertical instead of lateral — and the wave measured
**clear of the head by 8–13 units**. The defect was in the pose it returns to between
gestures, which nobody had measured, and which it holds for **54% of a 13-second
loop**. Effort had gone entirely into the 46% that moves.

So: an idle figure's RESTING pose is the one the reader actually stares at. Measure it
first, and measure it for the whole loop rather than at the peak of each gesture — the
question is not "does this gesture clear the head" but "how many seconds out of every
thirteen is an arm inside it". Sweep the resting fist across a grid and read the elbow
clearance off the rig; do not judge a folded arm by eye, because the elbow is the part
that fails and the elbow is derived, not authored.

**B16c. An outline closes up at small sizes.** A shape drawn as a stroked outline is
only legible while its interior is wider than its stroke. The `scroll` glyph carried a
2px stroke that was fine at authoring size and, at the 54px it actually renders in the
ranks list, closed its own interior into a featureless dark pill. Judge every shape at
the size it will really be drawn — then either fill the body so the silhouette reads,
or thin the stroke in proportion. This applies to any small prop, icon or token in a
scene, not just to glyphs.

### C. Motion and life

**C17. Movement takes the time it actually needs.** A walk's duration comes from its
distance (`moveTr`, ~74 units/second), never a flat crossfade. Every scene ran its
transition over a fixed 0.85s no matter how far the figure walked, so a short
sidestep looked fine and a hundred-unit crossing was sprinted. The feet never
skated — it was purely a timing bug.

> *"I dont want 'fast walking' … I always want this movements to look natural."*

**C18. A walk must be ≥ 60 stage units** (~1.5 strides) or it reads as a shuffle. If
the beat doesn't need the distance, don't move the figure at all.

**And if it does move them, route it through `travelStance` — never interpolate x
under a standing pose.** A stand whose x is lerped is a figure sliding across the
floor with its feet planted, and it is invisible in the source because nothing says
"walk" anywhere. Lesson 1 shipped four of them per run: the narrator slid 131 units
the moment he arrived, then 68 units back and forth between his easel mark and his
centre mark on every board beat in act 3. `travelStance` picks correctly on its own —
walk if x changed, blend the gesture if it didn't — so the rule is simply that figure
motion has exactly one route and this is it.

**Keep a figure's x-track monotonic unless you are deliberately staging a turn.**
`dir` is ±1 and flips in a single frame, so a figure that walks left and then right
snaps between mirrored copies of itself; there is no in-between to animate, because
interpolating `dir` squashes the body flat through zero. A track that only ever
advances one way never has to turn — and a narrator working steadily across the stage
as the lesson progresses is better staging than one pacing back and forth anyway.

**C19. Vary the movement. Every beat a different gesture, no loops.** Figures should
move around the stage rather than stand and semaphore. This is why the gesture
library and the travel modes exist — use them.

> *"Create a larger movement library … more options for movement and being unique and
> also to look more and more like a real moving person with everything it interacts
> with and everything it does."*
>
> *"Make the character have different walking habits so it doesnt just look like the
> stickman is walking back and forth in the exact same motion."*

Every walk already gets its own habit from `gaitVary` (stride length, clearance,
bob, lean, arm swing) seeded from its own journey — same journey walks the same way,
different journeys never match. Don't defeat it by reusing one x-pair everywhere.

**Two gestures must differ in SILHOUETTE, not in one wrist's height.** A gesture
library that only ever moves the working hand produces poses that are technically
distinct and visually identical — and the problem hides until the arms come down,
because a hand at −48 and a hand at −30 *are* obviously different pictures, while the
same two lowered to −16 and −18 are not. `narratorHold` had exactly this shape and all
seven of its gestures settled into the same figure. Pose **both** hands and the lean;
the left hand and the torso are what make a pose readable at a glance.

**C20. Every movement must END in a pose a person would still be in.** A beat holds
until the reader taps — up to ten seconds — so the settled pose is what they actually
stare at. **A `*Hold` pose is the arm-down version**; the raised instant lives in the
matching `*Live` pose's `lift`, which must return to exactly zero (by 1.5s), because
the next beat's transition blends out of the hold and a lift still up when the reader
taps would snap the arm down in one frame. Exempt: poses a person *can* hold (hands on
hips, arms folded, hands behind the back, a hand at brow or chin, a slump) and
anything anchored to a prop.

**This applies to EVERY gesture library, and checking one is not checking them all.**
The rule was written after fixing `emoteHold`, and `narratorHold` — the library
lessons 1 and 2 actually use, via `masterHold` — kept its raised rest poses for months
afterwards, because nothing connected the two. Two of its seven were worse than
frozen: codes 4 and 6 rested their fist at (9, −50) and (12, −56), *inside* a
20-radius head centred near (0, −49), so the thinking gesture had no visible hand or
forearm at all. When a rule turns out to be about a shared helper, grep for every
helper of that shape before calling it fixed.

> *"Sometimes the end movement is his hands up in the air or something awkward with
> his hands … I want it to be fixed so the end movements never look strange."*

**C20e. Anything inside a windowed gesture must be a function of THAT WINDOW, not of
the free-running clock.** A gesture fades in and out over its own slice of the loop, so
a wobble written as `sin(t · 9)` has a phase nobody chose: it is wherever the monotonic
clock happens to be when the window opens. The loafer's wave wobbled that way and the
hand could be travelling *down* while the arm was still going up. Give the window a
progress value and shape everything off it — `sin(wu · π · 4)` is zero at both ends by
construction, so the gesture starts and finishes dead still without needing an envelope
to hide it.

**And a gesture needs somewhere to STOP.** `pulse` is a triangle: it arrives and leaves
in the same instant, so a wave built on one is never actually waving, only travelling
out and back. Rise, **hold**, fall — with the repeated part living in the hold — and
make the fall longer than the rise, because a hand goes up with intent and comes down
because it is finished.

**C20b. Nobody materialises on stage.** A figure arriving from off-stage must be at
full opacity *before* they are visible, not faded up where the reader can see it.
Lesson 1 ramped the narrator's opacity across his whole 2.2s entrance, so he finished
condensing out of the paper about two-thirds of the way in, standing beside a fight —
which reads as a ghost appearing rather than a person walking on. Park them well off
the edge (screen x −185, in that case) and finish the fade inside the first fifth of
the move, while they are still in the wing. Same for exits.

**C20c. A beat clock resets on every tap, so only animate what actually CHANGED.**
`bt` goes back to zero each time the reader advances. Anything whose opacity or
position is a function of `bt` therefore replays from nothing on every single tap,
whether or not it has anything new to say — and a graphic replaying identically is
not a transition, it is a flicker the reader cannot account for. Lesson 1's
scoreboard was `(bt − k·0.045) / 0.2` per cell, so a meter that was already full
dropped to empty and swept back in behind the reader every time they moved on.
The fix is always the same shape: give the element its PREVIOUS beat's state as well
as its current one, hold what is unchanged, animate only the difference.

**C20d. A reaction must be DELAYED past the action that causes it.** Two figures
driven by the same `u` peak together, so a punch and the head that answers it arrive
at the same instant — the head has already gone by the time the fist gets there and
the shot lands on empty paper. `hitReact` and `stagger` start at u 0.34 and peak at
0.65, after the punch's 0.42, which leaves a frame where the glove is actually on the
head. Anything caused by something else — a recoil, a splash, a shadow, a domino —
needs the same offset, and it must be small enough that both still finish together.

**C21. The lesson must never flash.** Layout changes only while the thing being
re-laid-out is invisible. The summary beat hides the stage and gives its height to
the text panel; keyed off the current beat, that collapse happened in the same frame
the index changed — while the panel still showed the **previous** beat's text, so the
old screen visibly leapt into the new screen's slot.

**C22. The stage must never resize, and text never cross-fades.** Stage/deck/hint are
fixed proportions (42/50/8) so the figures don't jump every time the deck grows —
that reflow was the original "glitch at the top". And overlapping two paragraphs at
partial opacity is a muddy double-exposure: fade the deck fully **out**, swap while
invisible, fade **in**. Only one thing on screen, ever.

**C22b. Nothing bounces.** The XP total on the completion screen arrived on a spring at
damping 11, so it overshot its own value and wobbled back — and a wobbling number reads
as a toy. The identity is ink on paper: things are **drawn on**, wiped on, uncovered, or
counted up. A paper cover sliding off left-to-right while the digits count up under it
is the house move. Springy overshoot belongs to a different product, and there is none
left anywhere on the reward screen.

**C22e. Smoothness is not a finishing pass, it is the acceptance criterion.** The
product owner has said this in some form after nearly every build, and it is worth
having written down as its own line rather than distributed across C17, C21 and C22:

> *"Transitions are always very smooth … It always must be incredibly smooth."*

What that has meant in practice, every time it has been raised: something arrived at
full speed out of stillness (an `easeOutCubic` where a smoothstep belonged), something
overshot and came back (a spring), something replayed that had not changed (`bt`),
something moved without taking the time its distance needed (a flat crossfade), or two
things that should have been sequential overlapped for a tenth of a second. Before
calling a scene done, sample it: **frame-to-frame velocity should have no steps in it,
and every motion should start and end at zero speed.** A `sin(π·x)` envelope does not —
its slope at the ends is π. `pulse` smoothsteps first, which is what it is for.

**C22c. A multi-part reveal plays in order, and a tap runs it out.** Two rules in one,
both from the rank-up sequence. **Order:** each step starts as the one before it lands
and nothing overlaps — mark, then burst, then the old name out and the new name in,
then the bar, then the button. A reveal where everything happens at once has no reading
order and registers as a flash. **Escape:** anybody who has seen it before must be able
to tap anywhere to jump straight to the end state, because a celebration that cannot be
skipped becomes a toll on the tenth viewing. Any control involved stays inert until it
is actually visible, or the skip-tap presses it.

**C22d2. A locomotion cycle and the world it moves through must run at the SAME RATE,
and the prop must be placed off the POSE.** Two separate ways the ladder climb was
wrong, and both are general:

- **Rate.** The rungs scrolled at 46 units a second while `climb(t · 3.4)` takes 1.85s
  per sine — two steps, so 0.92s a step. One rung should pass per step: 22 ÷ 0.92 = 24
  units a second. At 46 the ladder ran past him at twice his stride, and the figure
  read as being winched up a rope rather than climbing it. Whenever a cycle drives
  against a scrolling world, **derive the scroll from the cycle's period**, never
  set both by eye.
- **Placement.** The rails were centred on his mark, which is where his FEET are. His
  hands are 21–26 units in front of that, so the near rail sat three units behind the
  nearest hand: a man climbing the air just beside a ladder. A prop the figure GRIPS is
  positioned from the hand the pose actually produces (B9a), not from the x he stands
  on. Hang the prop off the pose, or move the mark — but measure which one you did.

And the honest half: this figure **cannot** put a hand on a rung above its own head,
for the reach reasons in B11. The climb had been written as though it could, so the
hands stayed at chest height, the arms stayed tucked, and it read as a hunched bob on
the spot. What carries a climb here is the LEGS — a knee driving up *and forward* onto
the next rung — plus the lean, the pelvis pump, and hands working the rail. Write the
cycle for the body you have.

**C22d. To move a figure UP, move the world down past it.** Raising the figure up a
static ladder does not read as climbing — it reads as a figure sliding up a picture of
a ladder, and it was rejected on sight. What works is the reverse: put the rungs in an
`overflow: hidden` clip and **scroll them downward** past a figure running the `climb`
cycle on the spot. Rungs must be laid out **0-based inside the clip** (`top: r * RUNG_SP`);
the first attempt used `top: 300 + r * RUNG_SP`, which pushed every rung out of the clip
so none of them showed at all. The same inversion is the answer for descending, falling
and any other vertical travel.

### D. Nothing is hidden, cut, or covered

**D23. Props must never cover the figure, and the figure must never cover the props.**
Both halves matter. Rendering teaching labels *in front* fixed an arm cutting through
"Socrates is a m[an]" — but then buried the builders behind the bricks, and the next
note back was *"make sure the stickmen aren't completely behind the bricks"*. The
resolution is layout, not z-order.

**D24. A prop the figure interacts with must sit BESIDE or ABOVE it, in its own
band — never a wide slab the figure stands inside.** Make it a narrow column the
figures **flank**. Confirmed twice: the brick structure and the ship's hull both had
to be reshaped after the first device look.

**D25. The band must contain every pixel the scene can draw.** The crop shows
*exactly* the declared `[top, bottom]` on every device, so ink outside it is clipped
for **everyone** — never a device quirk. Measure against every beat, include every
prop at its extreme position, and if the scene has a camera, measure **after** it.
Don't trust a comment: logic-8 declared a band starting at 96 while its rule card —
the thing the lesson is about — started at 32.

**D26. Don't reserve empty band either.** A band much taller than its art makes the
lesson height-limited, so it renders smaller *and* letterboxed for nothing.
epistemology-8 reserved 74 empty rows and rendered at 0.75 while its siblings ran at
0.90.

> *"Make sure especially where the user will be watching the animations happen that
> they are large enough so they are easy to see."*

**D27. Deck text must fit the deck.** The deck is `overflow: hidden` and exactly half
the body height, so a line past its bottom is unreadable. Check the **answered**
state of question beats — prompt + pick + answer + explanation is the tallest the
deck ever gets.

**And there is a number for it: ~290 characters of explanation.** That is the longest
one among the lessons that have actually been seen on a phone, so anything at or under
it fits by precedent. This is worth having as a figure because explanations drift long
without anyone noticing — a batch of six new lessons came in at a **median of 327 and a
max of 403, with nine of twelve longer than any of the 97 that existed**, purely from
wanting to explain the trap properly. They read fine in the editor. They would have
been cut off mid-sentence on the device, on the one beat the reader most needs to read.
`npm run check:cinematic` now bars anything over 290. Prompts and options were inside
the envelope on the same batch, so it is the explanation specifically to watch.

**D28. Text must fit its own box.** Two ways a word gets lost that the band and deck
checks cannot see: the card **clips** it (`scrollHeight > clientHeight`), or it
**spills** past the border onto whatever is underneath.

**D29. Budget for Android font padding.** RN Android `<Text>` defaults to
`includeFontPadding: true`, ~2–4px extra top *and* bottom **per Text**. A card sized
by arithmetic to fit two lines still clipped on device. Set
`includeFontPadding: false` on label/body styles **and** add ~10px of slack to any
card with wrapping text.

**D30. No orphaned line breaks. A word needs MARGIN in its box, not a fit — 8%, and
`numberOfLines={1}` so it cannot break at all.** A short label that wraps strands a
fragment on its own line — "OVERWHELM / S", "TOMORRO / W", "SYMPHON / Y". The box just
grows, so nothing clips and no overflow check fires.

This rule existed as the sentence "a label of ≤26 characters should occupy one line"
and a word was split anyway, so here is the number and the check instead.

- **"It fits" is not a measurement.** ethics-11's `SYMPHONY` measured **55.39 units
  inside 56** — it fitted by six tenths of a unit. That is not a fit, it is a
  coincidence, and Android's metrics run a shade wider than the browser's, so on a
  real phone it broke in half. Anything under **8% margin** is one font away from
  splitting on somebody's device. Measure the LONGEST WORD against the box's inner
  width (minus border AND padding), in design units.
- **Tracking is charged per CHARACTER, including after the last one.** `letterSpacing:
  0.2` on an eight-letter word buys 1.6 units of width for almost nothing optically at
  9px — more than the entire margin that label had left. Treat tracking as width you
  are spending. ethics-3's card carries a comment putting `CONSEQUENCES` at "~88 in
  100"; it actually measures **98**, and the missing 9.6 is exactly its twelve
  characters of 0.8 tracking. An estimate that forgets tracking under-counts by the
  whole of it, which is usually the whole of the margin.
- **`numberOfLines={1}` is the structural half.** Room makes a split unlikely; a single
  line makes it impossible. Use both on any label that is one word, because the font is
  not something this repo controls.
- **A label that is MEANT to wrap has only the margin.** political-11's plates read
  "ONE SOVEREIGN" over two lines by design, so `numberOfLines={1}` is not available and
  nothing structural stops the long word breaking — 8% is the whole of the protection,
  and it must be measured against the longest WORD, never the whole string.
- **When the margin is short, spend tracking before geometry.** Three of the four real
  cases sat in rows whose PITCH is tuned for tap targets (`TOK_PITCH`, `PLOT_PITCH`),
  where widening the box eats the gutter that makes the answer reliably tappable — you
  would fix D30 by breaking E37b. Tracking is free to give back: it costs nothing
  optically at 8–9px and it is usually the entire overflow.
- **Three ways to measure this wrong**, all of which produced confident nonsense before
  the real defect turned up:
  - Comparing a box measured INSIDE the `scale(fit)` stage against text measured
    outside it. Every word in a fit-0.9 lesson came back at exactly −11.1% — forty
    "defects" that were one division. **A constant error across unrelated lessons is
    arithmetic announcing itself, never a real finding.**
  - Measuring the `<Text>` rather than the box. A shrink-wrapping Text reports its own
    content width, so every word "exactly fits itself" at 0%. Walk up to the first
    ancestor that actually bounds it.
  - **Measuring the on-screen rectangle of a box that is mid-animation.** Most of these
    boxes pop in under a `scale`, and one lands under `rotate: -13deg`, for which the
    browser reports the axis-aligned box AROUND the tilted one. **A transform never
    re-wraps text** — lines are decided at layout size and the result is then scaled —
    so the screen rectangle is not the width the text was laid out in. Sampling mid-pop
    made one `VALID` stamp read −5.3% and +5.3% in the same lesson, and made
    aesthetics-4's `CONFERRED`, which has 14% clear at rest, look 8.9% overflowed.
    Measure `clientWidth`, which is layout and ignores transforms entirely.
- **Known false positive: a box with no `width` at all.** A speech bubble, or any
  absolutely-positioned tag carrying only `paddingHorizontal`, grows to whatever the
  text needs, so it reads ~0% and can never split. Before changing anything, check the
  style for an explicit width — `bubbleBox` and valid3's `falseTag` both have none, and
  all four of their "findings" were nothing. Note that "is the parent wider?" does NOT
  settle it: a shrink-wrap box usually sits inside a shrink-wrap parent, so both report
  the same width. The style is the answer.

**D31. Nothing opaque may cover text, and props sharing a column must be ordered.**
ethics-6's chart footing landed on the tally below it: "THE FIVE" was sliced in half
and its bracket hidden entirely.

**A stamp, badge or seal drawn "across" something is the same defect wearing a costume.**
Lesson 1's CONTRADICTION stamp sat at `top: 232`, which is exactly
`STACK_TOP + 2 × (ROW_H + GAP)` — the y of the third Socratic line. Being narrower than
the row, it covered the middle of it, so the question that actually breaks Meletus, and
the entire point of the beat, was unreadable behind a black slab. The intent ("it comes
down across the exchange") is not a licence: put it below, or in a gap, and let it
overlap a border rather than a word. When any overlay's `top` is within a row-height of
a text row's computed `top`, that is a collision, not a design.

> *"Every word that shows up, every object on screen, and every animation … make sure
> nothing is covered up … dont unnecessarily cover or look not apealing to the user."*

**D32. Legibility can outrank literal scale.** A board drawn larger than life so its
writing is readable is correct. B7 is about *ground-sharing* props; most scene
furniture sits above the figure's crown and is an information surface, not an object
in the room.

**D31b. A speech bubble must be unmistakably HIS.** Not a caption at the top of the
stage, not a box parked at the left margin: a box centred over the speaker's head, with
a tail and a **leader line running down toward him**, that tracks him if he moves and
leans its pointer back at him when the box has to be clamped inside the stage. With two
figures talking in turn, a box pinned to a fixed corner says nothing about who spoke,
and the reader has to work it out from the words — which is exactly the note that
produced this rule.

> *"I need it to be more obvious that they're saying those words, so more like a
> talking box above them that is more distinct and a line slightly coming out towards
> them so you know it's them talking."*

One at a time, too: the outgoing bubble fades fully out before the incoming one starts
(0→0.18, then 0.22→0.52 in `Bubble`). Overlapping them for even a tenth of a second
reads as a flicker rather than as a reply.

**D31b. Words must not sit on the rule that boxes them: 4dp of clearance, measured
in DP and measured at the GLYPHS.** D28 catches text that clips or spills; this is
the near-miss that still looks wrong — a label hard against its own border, which
reads as cramped even when every character is technically inside.

- **Clearance is a DP number, not a padding value.** Scene boxes are authored in
  design units and multiplied by `fit`, so `paddingHorizontal: 8` is 7.2dp at fit
  0.9 and **4.8dp at fit 0.6** — and the box's own 2-unit border eats into that.
  The same source value therefore looks fine in one lesson and cramped in another.
  Audited across all 54, scene padding ran from **2 to 12 units** with no
  convention at all; the deck's own boxes use 13–18 and never have this problem.
- **The vertical failures are WRAPPING, not padding.** Text is centred in a
  fixed-height box, so clearance is `(boxH − textH) / 2` — and a caption that turns
  out to be two lines rather than one blows straight through it. aesthetics-5 fits
  a 17-unit title plus a 15-unit caption in a 48-unit box, which works right up
  until "a picture worth framing" wraps. Adding padding cannot fix this; the box
  has to be taller or the words fewer.
- **Android is 2–4px tighter than anything you measure on web**, because
  `includeFontPadding` defaults to true and adds height above AND below every
  `<Text>` (D29). Set `includeFontPadding: false` on every scene text style — 88
  were missing it, concentrated in one authoring batch, and those lessons are
  exactly the ones that measured worst.
- **Measure the glyphs, not the element.** A centred `<Text>` is laid out at the
  full inner width of its box, so its element rect touches both borders while the
  words sit comfortably centred. Measuring element rects reported 145 collisions;
  measuring a `Range` over the text node reported 106, and the 39 difference were
  all fiction. Part 3 already warns about this — it is easy to "fix" 39 boxes that
  were never broken, and shrinking their text is what finally makes them wrap.

**D32b. Hand-break short text to a MEASURED width.** D30 says a stranded fragment is a
defect; this is how to stop writing them. For any text in a narrow container — a
speech bubble, a thought cloud, a card label — render it once, measure how many
characters the container actually fits, then break every line by hand to that number.
The completion screen's thought lines are broken at **nineteen** characters, measured
off a real render, and that number was only discovered because "Descartes doubted all."
stranded "all." on a line of its own. Counting characters in the editor is guessing;
the font, the padding and the device width all get a vote.

### E. Questions and interaction

**E33. Vary how the reader answers.** Not every question is A/B/C/D under a picture.
Scenes can own their answer UI (`InteractBlock` + `InteractPanel`): tap the weak link,
feed a chute, choose a path, tip a balance, tap the true map.

> *"Different ways to answer questions"* — and illustrations with machines,
> conveyors, charts, backgrounds and activities, *"not just A/B/C/D + a circle."*

**E34. Scene-taps for the OBVIOUS choice; A/B/C/D for the NUANCED one.** A subtle
trade-off hidden in a small tap target is what reads as *"confusing and very small"*.
If the answer needs weighing, put it in the deck where the options can be read.

**E35. The whole body is the tap target.** Wrapping only the "Tap to continue" text
left most of the screen dead and a reader stuck on beat 1. One `Pressable` around the
body; choice buttons and the bookmark handle their own.

**E36. Decorative full-bleed wrappers need `pointerEvents="none"`.** An
`absoluteFill` overlay **eats taps even at opacity 0** — opacity is not
`pointerEvents`. A decorative balance frame silently blocked a fork's signpost taps
and cost an OTA. Keep it OFF the wrapper that contains the interactive Pressables.

**E37. Beats advance on TAP, never auto-play.** That was a deliberate product choice;
pacing belongs to the reader.

**E37b. A tap target must live in the same coordinate space as the art it belongs to.**
When a scene owns its answer UI, the Pressable and the picture it sits on have to be
transformed by the same thing, or the reader taps a fork's signpost and hits paper an
inch away. The exemplar (`logic7Scene`) avoids the problem entirely by having **no
scene-wide camera at all** — props are laid out directly in stage coordinates, so a
Pressable is exactly where its art is. If a scene does need a camera, then figures,
props and Pressables all go **inside** it; never place interactive elements outside a
transform that moves the thing they represent. Pair this with E36 — a decorative
full-bleed wrapper above them eats the taps regardless.

**E37b-2. A scene tap target is measured in DP, and the number that matters is the
PITCH.** Scene targets are authored in design units and then multiplied by `fit`, so
the same card is a different size in every lesson — and `fit` is often well under 1.
logic-8's band is 493 of 560 units, so it renders height-constrained at **fit ≈ 0.60**
on a 360dp phone and its 40-unit answer cards came out **24dp tall with 3.6dp between
them**. Android asks 48dp of a touch target and a fingertip covers about 45dp, so a tap
aimed at one card physically overlapped its neighbours. That produces BOTH reported
symptoms at once — "it didn't register" and "it picked a different one" — from one
cause, and neither is an event-handling bug: hit-testing was verified correct
(`elementFromPoint` returned the right card every time).

- **Enlarging a card does not fix mis-taps; increasing the PITCH does.** Two 48dp cards
  4dp apart still can't be told apart by a finger. Author the centre-to-centre distance
  first, then fill it.
- **`hitSlop` is a finisher, never the fix.** It can only claim the gap that is already
  there — and slop wider than HALF the gap makes neighbouring targets overlap, at which
  point the topmost silently wins and the wrong-answer problem gets *worse*. Cap it at
  `(pitch − height) / 2`.
- **Check it at the smallest fit the lesson can render at**, not in the design space.
  A number that looks generous at 400×560 is the thing the reader cannot hit.

Measure with the harness in Part 3: step to the interact beat, read every target's
`getBoundingClientRect()`, and report height, gap and pitch **in dp**.

**E37c. The scene's graded questions must agree with the lesson's data file.** The
`Lesson` in `data/branches/…` is the curriculum contract, and it still drives the card
runner for every lesson that has no scene — so the two must teach and score the same
thing. Re-cutting the *wording* to fit the staging is expected and good: logic-7's data
asks *"If it rains, the streets are wet. It is raining." What follows?* while the scene
asks the reader to tap the card that must be true. What may **not** drift is the
substance — the number of graded questions, the concept each one tests, and which
answer is correct. If the scene needs a question the data doesn't have, add it to the
data too.

### F. Writing the lesson

**F38. Reuse the engine; invent the story.** The design system does **not** get
reinvented per lesson — reuse the rig, the transitions, the layout, the deck. What
must be new every time is the **content and the in-lesson metaphor/beats/interaction**,
*"so it's new for the users."* Copy the closest exemplar scene and vary the story.

**F39. Tell philosophy like a story.** Entertaining first, informative second,
interactive throughout, and premium enough that someone would pay to keep going.

**F40. Give it an arc.** Hook (provocation) → build → productive struggle → a "what
you now know" payoff on the summary. One idea per beat; concrete example **before**
the abstract term; never a wall of text.

**F41. Name the trap.** Every graded question earns its payoff by being tempting for
a *nameable* reason. The explanation must name the bias or fallacy and say why the
tempting choice fails — "The trap: …" is the house pattern.

**F42. Ground it in a real thinker.** Pair the concept with a primary-source `quote`
card — a real sentence someone actually wrote, with author, work and era. Authenticity
is what makes it feel worth paying for, not gamified trivia.

**F43. Rotate the interaction.** Don't let two consecutive lessons feel identical;
vary the beat mix and the question type.

**F44. Respect the content limits.** Hook headline ≤ 12 words · concept body ≤ 60 ·
example ≤ 80 · question prompt ≤ 25 · reinforcement ≤ 50 · summary point ≤ 12 each ·
dilemma scenario ≤ 80 · quote ≈ 28. A beat that needs more words needs to be two
beats.

**F44b. `text` is read aloud — write it for the ear as well as the eye.** `beat.text`
is the one string the narrator speaks (`cite`, `quote.text` and question prompts are
deliberately never spoken), so it is prose with two audiences at once. The corpus is
already in good shape — median sentence **10 words**, only one of 1,409 over 32 — and
the aim is to keep it there. What actually breaks aloud:

- **CAPITALS for emphasis are the dangerous one.** The lessons set the load-bearing
  word in caps — "an argument is VALID", "the claim is TRUE. You BELIEVE it." An audit
  found ~25 of them, and engines commonly read an all-caps token as an initialism and
  spell it out, so the most important word in the sentence is the one most likely to
  arrive as "V, A, L, I, D". `forSpeech` now lowercases them **for the voice only** —
  caps buy nothing spoken, since TTS has no emphasis to render — so the display keeps
  its emphasis. Two-letter caps are ambiguous (`IS` is a word, `AB` is a line segment)
  and are decided by a list; if you write a new two-letter initialism, add it there.
- **Punctuation is the only pacing control there is.** There is no emotion parameter.
  An engine pauses at a comma, a full stop and a semicolon; it swallows an ellipsis
  and is inconsistent about a colon. `forSpeech` converts em dashes and ellipses to
  the pause they were drawing; anything else you want heard as a beat should be a
  comma or a full stop in the first place.
- **A quotation mark is silent.** 51 lines put a phrase in quotes; the voice reads
  straight through. If the quotation matters, the sentence has to say so in words.
- **Keep a sentence inside one breath.** Under 25 words. Long is not wrong on the
  page and is hard to follow read aloud, where the listener cannot go back.

Do **not** rewrite prose purely for the voice at the cost of the picture: A1 still
wins, and the scene is built around the words. Where display and speech genuinely
want different strings, fix it in `forSpeech` (it is shared) rather than bending the
line.

**F45. Never cross-reference a lesson by number.** "As we saw in Lesson 4" breaks
silently the moment anything is reordered and `tsc` will never tell you. Write
"earlier you saw…".

**F45b. Confirm a lesson's id by grepping `id:` — never by counting.** A lesson's id
number is its position in its branch's **original single-path order**, and the units are
contiguous slices of *different lengths* — epistemology's first unit holds 9 lessons
where the others hold 8, so "the seventh lesson" is `epistemology-knowledge-8` there and
`logic-arguments-7` next door. Nor does a scene component's name settle it. Counting
within a unit has mislabeled work more than once; grep the data for `id:` and read it.

**F45c. Build a batch from one verified exemplar.** The method that produced 11 lessons
in a single pass with zero errors and a clean `tsc` on the first try: write **one**
gold-standard lesson yourself and verify it on a real device, then give every
subsequent author (a) that exemplar to read first, (b) the exact API surface they may
import, (c) the full footgun list, (d) a per-lesson design brief — metaphor, walk
choreography, interaction type — and (e) a self-check list. State the occlusion
geometry as **numbers**, not prose: the figure is 103 stage units tall with its crown at
y 397 on GROUND 500 and spans about x ± 36, so props belong in an x-range the figure
never enters, or entirely above its crown.

Keep every author inside their own two files. Wire the `CINEMATIC` map yourself, at the
end, so no two of them touch a shared file — and if a pass is interrupted, run
`npx tsc --noEmit` **first**: an author stopped mid-edit leaves references to components
it never wrote, and the fastest repair for a half-designed file is `git checkout --` on
it rather than guessing at somebody's unfinished intent.

### G. Engine and tooling

**G46. Figures are native Views driven by Reanimated transforms.** SVG is only for
small, bounded illustration — react-native-svg has no partial invalidation, so any
animated child re-uploads the whole `<Svg>` every frame (~10fps full-screen on an
S24 Ultra).

**G47. Worklet footguns.** A default parameter referencing a module constant is **not**
captured into the worklet runtime — pass gaits explicitly (`strideStance(…, WALK)`).
A worklet calling a worklet defined **later** in the file captures `undefined` and
blanks the screen — define a worklet after everything it calls. Numeric-literal
defaults are safe. (Hit again this pass, extracting a dispatch behind a wrapper: the
symptom is `ReferenceError: Cannot access 'X' before initialization` in the page/device
log and a lesson that never mounts at all, so it fails loudly — but only if something
is watching the log. Splitting one worklet into two is the usual way to introduce it.) And never build React elements inside a `withTiming` completion
callback — that is a worklet; `runOnJS` first.

**G48. Scatter fields need a decorrelated hash.** `x: a + (k*137)%W, y: b + (k*89)%H`
steps both axes together and the points march in a diagonal streak. Use
`hash(n) = frac(sin(n) * 43758.5453)` with a different seed per axis.

**G49. Don't rely on a ghosted duplicate figure.** A translucent second Stickman
(opacity 0.5–0.85) would not render legibly on device even at 0.85. Use a prop
instead. A *full* figure at partial opacity does work.

**G50. Edit source with the Edit/Write tools, never PowerShell string-replace** —
it mojibakes em-dashes and `·` straight into user-visible narration. `sed` in Bash is
byte-safe for these UTF-8 files. `StyleSheet.absoluteFillObject` does not type-check
in this project; use the longhand.

**G51. Production OTAs reach real users.** `eas update --branch production` goes to
everyone on the Play Store — keep every production push clean and shippable, and
**never** bump `FREE_DAILY_LESSON_LIMIT` (the account already has Scholar's Pass, so
testing does not need it).

**And an OTA bundles the WORKING TREE, so check whose work is in it.** More than one
session edits this repo at a time, and `git status` before a publish is not a
formality: on the last one the tree carried another session's brand-new gesture whose
hand target sat 3.8 units beyond the arm, so `solve` clamped it and the elbow snapped —
it would have shipped inside a release that had nothing to do with it. Read the diff of
anything you did not write, measure it if it is a pose, and either fix it or wait. The
mirror of that rule: **never `git add` a file you did not change.** Stage paths
explicitly, never `-A`; if one file genuinely holds both sessions' work and cannot be
split, commit it and say so in the message rather than quietly taking credit or quietly
reverting someone.

**G51b. Finish by handing off to the GLOBAL reward — never render `LessonReward`
inline.** A player that renders the reward itself reproduces a bug that reached the
user twice. The reward is a fullscreen `Modal`, and the finished lesson screen never
left the Branches tab's stack: its `router.back()` returned to Home through *tab*
history instead of popping the lesson, so every later visit to the Learn tab
re-rendered the finished screen and re-showed the reward, blocking the branches list
outright. The inline Modal also failed to cover the tab bar, so the reader could tab
away mid-reward.

The shape every player uses, and every new one must: on completion call
`showReward({ xp: lessonXP(correct, asked), correct, total, branchSlug, lessonId })`,
then `exitLesson()` immediately — which pops cleanly, because no tab switch has
happened yet — and render `null` while done. A single `LessonRewardHost` above the tabs
in `app/_layout.tsx` draws it. That host owns **every** completion side effect —
progress, streak, badges, the daily counter, ads, the widget — so scoring runs exactly
once and is decoupled from the screen being popped. Never award XP yourself, and never
compute the number by hand: `lessonXP()` in `constants/xp.ts` is the only place the
model is written down, and the four runners each carrying their own `COMPLETION_XP`
is precisely the discrepancy it was created to end.

**G51c. `Fade` snapshots its content — anything that can change WITHIN a beat must be
in `revision`.** The render-prop takes a picture of what it renders and holds it until
the trigger changes, which is what makes the sequential fade clean. The cost is that
mid-beat state freezes: the answer the reader just picked, a quote's bookmark filling
on save. Both were real — the bookmark would not fill until `quoteSaved` was added to
the revision string. Beat changes fade; same-beat changes swap live, but only if you
declared them.

**G51d. A lesson is not shipped until it is in the `CINEMATIC` map.** The route resolves
`const Runner = CINEMATIC[lessonId] ?? LessonRunner`, so a finished scene that was never
mapped silently plays as plain cards — which looks exactly like the lesson was never
built, and `tsc` is perfectly happy. The same line is the rollback: deleting one entry
restores that lesson's card version instantly and touches nothing else, which is why
the map is the only shared file a lesson should need to modify.

### H. The house shape — what the 48 built lessons agree on

> Everything above is a defect. **This group is the reverse: patterns the existing
> lessons already follow, measured out of the source.** They are not bugs waiting to
> happen — they are what makes 48 separately-authored lessons feel like one product.
> Every number below was counted, not chosen, and a new lesson that departs from one
> should do it on purpose.

**H52. The spine is eight beats.** Across the 46 lessons on the shared player: 7–11
beats, and **8 is the mode** (22 of 46). All 48 carry **exactly two graded questions,
exactly one saveable quote, and exactly one summary — always the last beat.** As a
fraction of the way through, the first graded question lands at **0.62**, the second at
**0.83**, the quote at **0.53**. The canonical eight:

| # | beat |
|---|---|
| 0 | **hook** — the provocation. No teaching yet |
| 1–2 | **build** — the concrete example, then the name for it |
| 3 | **the quote** — a rest, and where the lesson gets its authority |
| 4 | **the turn** — the complication, objection or second camp |
| 5 | **Q1** |
| 6 | **Q2** |
| 7 | **summary** |

Ten- and eleven-beat lessons stretch the build and move the quote to the **penultimate**
beat, where it reads as a benediction before the summary. Both placements are in use and
both work. What no lesson does is put the quote on the hook, on a question beat, or last.

**H53. Two graded questions is an economy, not a preference.** `lessonXP` is
`25 + 10 × correct + 15 if perfect`, so a clean two-question lesson pays **60**. A third
graded question would make that one lesson pay **70** — 17% more than its 47 siblings
for the same work — and a single question pays 50. If a lesson genuinely needs a third
interaction, make it a **`tap`**: it gates the reader and shows an explanation exactly
like `mc`, but scores nothing. That is what `tap` is for.

**H54. Staging lives in the SCRIPT, beside the words it has to match.** Every script
declares its own beat type, one doc-commented field per channel:

```ts
export interface Aes2Beat extends BaseBeat {
  /** Artist gesture (emote code). */ a?: number;
  /** Viewer gesture (emote code). */ v?: number;
  /** A feeling-pulse crosses from artist to viewer this beat. */ wave?: boolean;
}
```

and the scene lifts each channel into a module-level array **once**
(`const P = BEATS.map((b) => b.p ?? 0)`) rather than reaching into `BEATS` per frame.

This is what makes A1 auditable. The sentence and the pose that has to illustrate it sit
in the same object four lines apart, so *"he is on the floor"* and *`p: 48`* get read
together. A scene that hard-codes its poses hides them from that check — which is
precisely where the floor bug lived (A3). The doc comment on each channel is the only
documentation the next author gets; write it.

**H55. `dur` is inert — the reader sets the pace.** Every beat carries one and **nothing
reads it anywhere in the app**; it is left over from before beats advanced on tap (E37),
and 94 of them are just `1.0`. Keep filling it in, because the type demands it, but
never reach for it to fix pacing. Pacing is beat count and word count, and nothing else.

**H56. The scene's header comment states the composition in NUMBERS.** The good scenes
open with a sentence of what the picture is, then an occlusion block of real
coordinates — this is `ethics8Scene`:

> · the narrator WALKS x = 80 → 146 → 208, then back to 112. Widest body span x ≈ 32…256
> · the slumped figure is FIXED at x = 284 → at least 76 units of clear paper between them
> · the bed lives at x = 328…394 — right of everything either figure occupies
> · the grid (y 46–114) and the cards (y 176–308) sit above every body: a standing crown
>   is y 397, kneeling 415, seated on the floor 423

That block is what lets B9, D23 and D25 be checked by *reading* the file instead of
rendering it, and it is the first thing to update when a mark moves. `ethics8Scene` and
`logic7Scene` are the models to copy.

**H57. One derived value per scene, not one per prop.** A single `useDerivedValue`
worklet computes the whole frame and returns an object; every `useAnimatedStyle` reads a
field off it. All 46 are built this way. It buys one clock read per frame, one place
where the beat blend `tr` is defined, and one place to look when a frame comes out wrong.

**H58. Interpolate previous → current, and animate only what CHANGED.** The house
pattern in full:

```ts
const n = bi.value, p = n > 0 ? n - 1 : 0;
const tr = ease01(bt.value / moveTr(X[p], X[n], 0.85));
const ruleFade = (cur.rule ?? 0) !== (prev?.rule ?? 0);   // computed in JS, from the beats
…
rule: lerp(RULEV[p], RULEV[n], tr) * (ruleFade ? grow : 1),
```

Three things at once: nothing cuts, because every value blends out of the beat before
it; a prop whose value is identical on both beats **holds** instead of re-revealing
itself (C20c, stated positively); and the transition's length comes from `moveTr`, so a
beat where the figure walks further simply takes longer (C17).

**H59. The band is arithmetic, and it has a floor.** The bottom is the ground line plus
a little — every lesson lands in **508–518** (GROUND is 500). The top is wherever the
highest ink is. Heights currently run 274–493, median **298**.

The number worth knowing: **cropping tighter than ~280 units buys nothing.** The stage
region is roughly 923×647 device px, the fit is `min(923/400, 647/h)`, and the width
caps it at **2.31** as soon as `h ≤ 280`. Above that it costs real size:

| band height | on-screen scale |
|---|---|
| ≤ 280 | 2.31 (width-limited — free) |
| 300 | 2.16 |
| 400 | 1.62 |
| 490 | 1.31 |

So **a scene that puts art in the top third is choosing to draw everything a third
smaller.** Ask whether that art earns its rows before adding it — D26 is this same fact
from the other side.

**H60. Four colours, and all four come from the kit.** `INK #1A1A1A`, `PAPER #FAFAF7`,
`SOFT #6B6B6B`, `RULE #E4E1D8`. **Not one of the 46 scenes declares a hex value of its
own**, and that is most of why they read as a single product. Emphasis comes from weight
and from fill — a card filled INK with PAPER text is the "this one" state everywhere —
never from a hue.

**H61. A scene-owned answer target looks like the deck's option.** Pressable → inner
View, 2px INK border, radius 4; once answered the correct one fills INK with PAPER text,
the wrong pick drops to a SOFT border at 0.45 opacity, and every target is `disabled`
from that moment. `logic7Scene`'s `pickCard` / `pickRight` / `pickWrong` is the shape.
E33 asks for variety in **what gets tapped** — a chute, a balance, a signpost, a card on
a board — not in what a right answer looks like. The reader should never have to learn a
new answer UI.

**H62. Every non-interactive element on the stage carries `pointerEvents="none"`.** All
46 scenes do this on **every element**, not only on the full-bleed wrappers E36 is about.
The body is one big Pressable (E35), so an absolutely-positioned child that forgets is a
dead patch in the middle of the tap target — and a dead patch is indistinguishable, to
the reader, from a lesson that has frozen.

**H63. A number shown to the reader is DERIVED from the model, never typed.** All four
runners told the reader `Correct · +5 XP` while `lessonXP` was paying 10 — every
cinematic lesson under-promised by half from the day the XP model was rebalanced, and
`tsc` had nothing to say about it. It is now `CORRECT_LABEL` in `cinematicKit`, built
from `XP_PER_CORRECT_ANSWER`. Any streak, rank, level or XP figure a lesson ever prints:
import the constant.

**H64. One picture that IS the lesson, and build the stage around it.** This is the
single strongest predictor of whether a cinematic lesson lands, and it is what the good
ones all have: not a set of illustrations for the beats, but **one image whose change
over the lesson is the argument**. A gap between two panels that a thought sets out
across and cannot finish. A gauge where knowledge is allowed to live, and the moment
the shaded band moves off the far end. Two boxes drawn identically on purpose, so the
only difference on the whole stage is what they are standing on. A majority walking at
one person and stopping at a line.

Write that sentence *before* the beats. If it cannot be said in one — "the picture is X,
and over the lesson X does Y" — the scene will come out as decoration with narration
over it, which is what the card runner already does more cheaply. The test after
building: cover the deck and see whether someone could still tell you roughly what the
lesson claimed.

**H65. The second graded question is answered ON THE STAGE.** Two questions, and they
should not both be four sentences in a list. The house pattern is one `mc` in the deck
for the question that needs weighing, and one `interact` in the scene for the one the
picture can put directly: tap the claim the cogito actually gets you, plant the flag
where knowledge begins, tap the reply that goes at the man, tap the difference that
carries no moral weight, hang the label under the plinth, tap what stops the majority.

E34 is the rule for which goes where — the *nuanced* one belongs in the deck where the
options can be read, the one with an obvious shape belongs on the stage. E33 asks for
variety in **what gets tapped**; H61 says a right answer must still look the same
everywhere. A lesson with two deck questions is not wrong, but it has left the best
thing this format can do on the table.

**H66. The wrong answers are the real rival positions, not filler.** A distractor
nobody would pick teaches nothing and makes the question feel like a formality. The
ones that work are the arguments an actual person actually makes: for "which reply is
the ad hominem", the decoy is a *straw man* — also a dodge, also wrong, and wrong in a
different way that the explanation then gets to name. For "where does knowledge begin",
the decoy is the demand for certainty, which is the position the whole lesson is
against. Then F41's "the trap is…" writes itself, because the trap is a real view held
by real people rather than a joke option.

**H67. A figure at rest still has business.** The completion screen's loafer is on a
13-second loop — he looks around, checks his nails, waves — and he is the most
commented-on thing on that screen. The general rule: wherever a figure is on screen and
not doing anything, give it a slow loop of small human business rather than a breathing
idle. Idle is not the same as still, and still reads as broken.

> *"have a stickman … that is leaning against something … pretending he's looking at
> its nails or waving or just looking around, being funny."*

**H68. When the app speaks in its own voice, it is at the reader's expense.** The
thought-bubble lines are all gentle digs — *"Descartes doubted everything. You doubted
B."* — and never compliments, for a specific reason: the screen is already telling the
reader they did well, so praise on top of praise reads as a machine flattering them. A
joke at their expense reads as somebody being in the room. Keep it fond, keep it short,
and keep it pointed at **them** rather than at philosophy in general.

> *"Make it funny comments towards the user … get funny comments that are directly
> toward the user."*

---

## Part 2 — Authoring checklist

**Shape** — before writing a word, lay the beats out and count them (H52, H53).
- [ ] **The one-sentence picture written down first**: "the picture is X, and over the
      lesson X does Y" (H64). If it won't fit in a sentence, the scene isn't found yet.
- [ ] One question in the deck, one answered on the stage (H65); the distractors are
      real rival positions, not filler (H66).
- [ ] 7–11 beats; 8 unless there is a reason.
- [ ] Exactly two graded questions (`mc` and/or `interact`); a third interaction is an
      ungraded `tap`, so the lesson still pays 60 like its siblings (H53).
- [ ] Exactly one saveable quote, on a rest beat — never the hook, a question, or last
      (H52).
- [ ] Exactly one summary, and it is the final beat (H52).

**Story and script**
- [ ] New metaphor and beats; engine reused, not reinvented (F38).
- [ ] A per-lesson `Beat extends BaseBeat` with a doc comment on every staging channel,
      so the pose sits beside the sentence it illustrates (H54).
- [ ] `dur` filled in and not used to fix pacing — nothing reads it (H55).
- [ ] Hook → build → struggle → payoff, one idea per beat (F40).
- [ ] Every graded question names its trap (F41); a real primary-source quote (F42).
- [ ] Word limits respected (F44); no "Lesson N" references (F45).
- [ ] Every beat's text and pose agree — concrete claims only (A1, A4).
- [ ] A different gesture each beat; no loops (C19), differing in SILHOUETTE rather
      than in one wrist's height — pose both hands (C19).
- [ ] Every `*Hold` in the library you are using rests arm-down, not just `emoteHold`
      (C20); every gesture shaped by its own window rather than the free clock, and
      given a hold to happen in (C20e).
- [ ] Working hands between ~30% and ~90% of reach, never crossing their own shoulder;
      elbow speed measured against hand speed (B11).
- [ ] Every pose the beat calls for actually SHOWS the limb doing it — wrist ≥ 14.5
      from the head centre and clear of the torso, or the gesture renders as nothing
      (B11).
- [ ] Props the figure touches placed in the reachable band, y −10…−40, widest x 30 —
      and nothing asked for above the head, which it cannot reach (B11b).
- [ ] Any gesture blending out of a base written relative to that base; any base pose
      you changed re-measured against everything downstream (B11c).
- [ ] Companion figures desynchronised — a seed on the walk, a shifted CLOCK on the
      stand, since `stand()` takes no seed (B14).
- [ ] Any cycle running against a scrolling world derived from the cycle's period, and
      any prop the figure grips placed off the pose's hand (C22d2).
- [ ] Any physical claim the vocabulary can't express → add a pose (A2).
- [ ] Secondary figures posed deliberately (A3).
- [ ] Explanations fit the answered deck (D27).
- [ ] Graded questions agree with the lesson's data file in count, concept and correct
      answer — wording may be re-cut for the staging (E37c).
- [ ] The lesson id confirmed by grepping `id:`, never counted within a unit (F45b).

**Scene**
- [ ] Header comment states the composition as coordinates — every figure's x-track,
      every prop's x and y range, and the clearance between them (H56).
- [ ] One `useDerivedValue` for the whole frame; styles read fields off it (H57).
- [ ] Everything blends `[p] → [n]` with `tr` from `moveTr`, and anything unchanged
      between the two beats holds rather than replaying (H58, C20c).
- [ ] Channels lifted from `BEATS` once at module level, not read per frame (H54).
- [ ] Only INK / PAPER / SOFT / RULE — no scene declares a colour (H60).
- [ ] `pointerEvents="none"` on every non-interactive element, not just wrappers (H62).
- [ ] Scene-owned answer targets use the standard card states and go `disabled` on
      answer (H61).
- [ ] Shared `K_FIG`; relative sizes derived (B6); in proportion to ground props (B7).
- [ ] Two figures ≥ ~100 units apart at their closest beat — computed WITH root
      motion (`base − advA − advB − drift`), not from the resting marks (B9).
- [ ] Anything pinned to the figure derived from `K_FIG` + landmarks (B10); a speech
      bubble centred on the speaker with its tail and leader aimed at him (D31b).
- [ ] Every prop rectangle checked against the figure's extent AT THE POSE THAT BEAT
      HOLDS, across the whole transition — not against ±36 (B9a).
- [ ] Any figure standing around has a slow loop of business, not a bare idle (H67).
- [ ] Companion figures given a non-zero seed — the shared IDLE (`guard`, `stand`, a
      custom loop) as well as the walk (B14); every figure has a reason (B15).
- [ ] Every x change routed through `travelStance`, never lerped under a stand, and
      the track monotonic so nobody flips facing in one frame (C18).
- [ ] Nothing driven by `bt` replays on a beat where it did not change (C20c); any
      reaction offset past the action that causes it (C20d).
- [ ] Two-figure distances derived from intent + `MOVE_ADV`, not hand-typed (B9);
      anything pointing at a figure aimed via `headAt` (B9b).
- [ ] Figures arrive at full opacity from off-stage, never fade up on screen (C20b).
- [ ] No overlay's `top` within a row-height of a text row's `top` (D31).
- [ ] Interactive props beside/above the figure, never a slab it stands in (D24).
- [ ] Neither props nor figure occlude the other (D23).
- [ ] Walks ≥ 60 units and driven by `moveTr` (C17, C18).
- [ ] Every prop's y-range in a comment; band measured to hold it with a few units of
      air — no more (D25, D26). Bottom in 508–518; height near 280–300, and any art
      that pushes it past 300 has earned the size the whole scene loses (H59).
- [ ] Labels fit their columns on one line (D30); cards have font-padding slack (D29).
- [ ] Decorative overlays have `pointerEvents="none"` (E36), and every tap target sits
      in the same coordinate space as its art (E37b).
- [ ] Nothing springs or overshoots (C22b); any multi-part reveal is ordered and can be
      tapped to its end state (C22c); vertical travel moves the world, not the figure
      (C22d).
- [ ] Leaning figures fold or place their arms (B16b); every small shape is legible at
      the size it actually renders (B16c).
- [ ] Text in narrow containers hand-broken to a measured width (D32b).
- [ ] Deliberate exceptions written down (A5).

**Wiring**
- [ ] Completion calls `showReward(…)` then `exitLesson()` and renders `null`; XP comes
      from `lessonXP()`; `LessonReward` is never rendered by the lesson (G51b).
- [ ] Anything that changes within a beat is in the `Fade` `revision` (G51c).
- [ ] Every XP / streak / rank figure shown to the reader comes from a constant (H63).
- [ ] The lesson is registered in the `CINEMATIC` map (G51d).

**Then run Part 3. Do not skip it because it "looks fine".**

---

## Part 3 — How to verify

**Run the shape check first — it costs a second and needs no browser.**

```
npm run check          # tsc + both validators
npm run check:cinematic
```

`scripts/validate-cinematic.mjs` enforces the group-H rules that are arithmetic — beat
count, exactly two graded questions, one quote placed legally, the summary last, a
declared band whose bottom is on the ground line, no scene-declared colours, no XP
figure typed into a string. Its sibling `validate-lessons.mjs` does the same for the
card decks. The baseline is clean, so **anything it prints is yours**; it also reports
the band budget so a new lesson can see what its crop is costing against the other 46.

It cannot see anything about the picture. That is what the rest of this part is for.

**Sheet the WHOLE vocabulary before trusting any of it.** Rendering all 50 gestures
into one grid takes seconds and is the only thing that finds a pose which is *valid*
and *meaningless* — `arms-crossed` drew a figure with no arms, `scratch-head` drew one
doing nothing, and both passed every numeric check because nothing was out of range.
Numbers find geometry; only the sheet finds "that does not look like the thing it is
called". Do the same for a locomotion cycle **in its scene**: a climb cycle on its own
tells you the figure is moving, and the figure against its own scrolling ladder tells
you whether it is climbing.

Beware the reverse error just as much. A first pass of this sweep flagged 99 of 100
poses, which meant the probe was wrong, not the app: it counted a naturally hanging arm
(94% of reach) as "clamped", a heel lifting 2 units in a weight shift as "floating", and
a hand deliberately at the chin as "inside the head". **A check that fires on almost
everything has told you nothing** — fix the check.

**For the FIGURE, draw it in Node — no Metro, no browser, about two seconds a sheet.**
`rig.ts` has zero imports precisely so it can be run outside the app: `sucrase` strips
the types, `solve()` gives the joints, and `jimp-compact` (both already in
`node_modules`) draws bones as thick lines and joints as discs. A twenty-frame
filmstrip of one gesture costs nothing and answers questions no number can — the
loafer's wave measured "clear of the head" three times running and the first sheet
showed the fist sitting on his jaw.

**And the occlusion sheet is computable too, which is the cheapest real check there
is.** Every prop in a scene is an absolutely-positioned rectangle built from top-level
constants, and every figure's extent comes out of `solve()`. So: `eval` the scene's own
constants for the prop rects, take each figure's bounding box from the rig at the pose
each beat holds, and intersect them. Six new lessons went through this in one run and
it found a card drawn 2 units into a figure's hand — on a lesson whose composition
comment already claimed the columns were clear, because the comment had been written
against ±36 instead of against the pose (B9a). It also prints each figure's y-extent
against the declared band, which is the BAND check for free.

Three things will make these sheets lie to you, and all three did:
- **`dotBase(r)` in `Stickman` takes a RADIUS** (`width: 2r`) while a line-drawing
  helper usually takes a WIDTH. Halving either draws a figure that is not the one that
  ships: a head of radius 10 against the real 20 made a touching fist look comfortable.
- **A probe that keeps its own copy of the component's constants** will pass while the
  component is broken. Read them out of the source and `eval` them, so the check cannot
  drift from the thing it is checking.
- **Merging two props into one bounding box invents collisions.** The rights rail and
  its caption are one prop in the source and two rectangles on the paper — a rail down
  at y 330–500 and a word up at 312–330. Boxed together they "overlapped" a figure that
  neither of them comes near. When a probe reports a collision, check the rectangle
  before changing the scene.

**Measure, don't squint.** A 48-lesson review by eye misses exactly the defects that
matter, because clipped text and covered labels look plausible in a thumbnail. The
harness renders each lesson under react-native-web, walks every beat, and records the
exact rectangle of everything drawn. Rebuild it from
`memory/lesson-layout-audit-harness.md` — full recipe, DOM hooks, and the two gotchas
(Metro's bundling overlay renders *on top of* a mounted player; `CI=1` disables file
watching, so restart after editing).

Six checks are exact rather than matters of taste:

| Check | What it proves |
|---|---|
| **BAND** | Ink outside the declared crop is clipped on every device (D25) |
| **DECK** | Text past the deck's bottom is unreadable (D27) |
| **BOX** | A card clipping or spilling its own text (D28) |
| **WRAP** | A short label broken onto two lines (D30) |
| **POSE** | A beat's copy makes a physical claim its pose contradicts (A1, A3) |
| **SHAPE** | `npm run check:cinematic` — the group-H rules, statically (H52–H63) |

Then a **device pass**, because some truths only appear there: framing and scale, two
heads merging, a translucent figure failing to render, Android font padding. Deep-link
with `philosophize://branches/<b>/<anything>/lesson/<id>` — send it **twice**, the
first intent after a cold launch lands on Home. The package is **`com.philosophize.app`**
(not the EAS account name — getting this wrong makes `force-stop` fail silently and
every screenshot come from a stale process). **Never blind-tap inside a lesson**: a
tap at a guessed coordinate once bookmarked a quote into the real user's collection.

**Read the screenshot's byte size before opening it.** It answers the first question
faster than looking does, and it distinguishes the three failures that look alike:

| Size | Meaning |
|---|---|
| ~32 KB, all dark | a worklet crash — check the log for `undefined is not a function` or a `ReferenceError` (G47) |
| very small | a blank render — the lesson mounted and drew nothing |
| ~83 KB | the **"not yet unlocked"** gate, not a defect — see below |
| ~90–140 KB | a real lesson frame |

A **burst** of 5–8 captures whose sizes all differ is proof the scene is animating;
sizes that are identical across a burst mean it is frozen, finished, or stuck on a
gated beat. This is also how transitions get checked — capture straight through a tap,
because a blank frame mid-swap is tiny and a double-exposure is *larger* than the
settled frame.

**A locked lesson is not a bug.** Progression is sequential within a unit, so a lesson
can only be reached on the device once its earlier siblings are complete there — four
of a twelve-lesson batch showed the gate rather than the lesson, with identical byte
sizes, which is the tell. Complete the siblings on that device, or review through the
web harness, which bypasses the gate.

**A white Learn tab after deep-link testing is a test artefact.** Deep-linking puts the
lesson on the Branches tab as a foreign stack entry, so finishing it pops across to
Home and leaves the finished screen — which renders `null` — behind on that tab. No
in-app path deep-links into a lesson, so a real reader cannot reach this. Relaunch;
don't chase it as a regression.

**Known false positives — verify before "fixing":**
- Elements masked by an ancestor `overflow: hidden` — `getBoundingClientRect` ignores
  ancestor clipping.
- PAPER-on-PAPER shapes, which are invisible anyway.
- A centred `Text` whose *box* overhangs while its glyphs don't.
- Intentional exits: a car looping off-stage, a dog walking out of frame.
- Overflows of **2–3 units are line-box rounding**, everywhere, and benign. Bar at ≥4.
- Never call a collision from a low-resolution contact sheet — zoom the raw capture
  first.
