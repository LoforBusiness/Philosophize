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
> | a walk takes the time its distance needs (C17) | `moveTr` / `WALK_SPEED`, **and `check:sound`, which is what makes it stick — see C17b** |
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

**A2d. A BROWSER AUDIT MEASURES WHATEVER IS ON SCREEN, WHICH IS NOT ALWAYS THE
SCENE.** The split-word audit ran over all 102 lessons and reported **278 broken
words across 53 of them**. Every one was the check's fault, in two distinct ways,
and both are easy to write again:

- **`stageOf() || document.body`.** The stage is the div measuring exactly
  400×560. When it is not mounted — during the launch screen, and again once the
  reward modal replaces the lesson — that fallback silently widened the search to
  the entire page. The tell was that the *same five strings* appeared in all 53
  lessons: `PHILOSOPHERS`, `Philosopher`, `0%`, `+25`, `+10`. Fifty-three lessons
  do not share a defect; one component does. **No fallback: if the stage is absent,
  return and measure nothing.**
- **`Range.getClientRects()` returns one rect per TEXT NODE, not per line.** With
  the scope fixed, one finding survived: `100%` in metaphysics-6, "split over 2
  lines". It is not. `{Math.round(v * 100)}%` is two JSX children, so React renders
  two adjacent text nodes — `"100"` and `"%"` — and the Range returns a rect for
  each. Measured: both at **y 108.9**, at x 341.5 and 378.3. Side by side, one
  baseline. **Count distinct rounded `y` values, not rects.**

After both fixes the whole corpus measures **zero split words**. The margin audit
agrees: its four remaining sub-8% findings are all shrink-wrap boxes (a speech
bubble is styled with `maxWidth` and no width, so it grows to its text and can
never split) — and note its `grows` tell, `parent.clientWidth > box.clientWidth + 8`,
**misses a bubble because the parent shrink-wraps too**. `MORON!` at "60.1 in 60"
is a box that fits itself, inside a `maxWidth: 216` that it never approaches.

The general form, and the reason this keeps happening: **these checks predict a
defect from geometry, and geometry has more ways of looking broken than of being
broken.** Before fixing anything a browser audit reports, find the one measurement
that shows the defect *itself* — is the word on two lines, y against y — because
"fixing" a box that was never broken is how type gets shrunk until it really wraps.

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

**A6. EVERY LIVING THING ON STAGE IS ALIVE — including the ones in the background,
and no matter how small.** A figure that stands perfectly still while another
breathes beside it does not read as "in the background", it reads as a cardboard
cut-out, and it drags the figure next to it down with it. There is no size at
which this stops mattering: a small still thing is more obviously dead than a
large one, because the eye has nothing else to look at in it.

The bar is not "it has an animation somewhere". It is that the thing is a
function of a clock **on every frame**. In practice:

- Anything posed through the rig gets this for free — `stand(t)` carries breath, a
  weight rock and a head drift, and `emoteHold(code, t)` adds a hand drift
  specifically "so a hold never freezes". **Passing a figure through `pose()` with
  a stance that never saw `t` is the defect**, not the rig's shape.
- Anything drawn by hand out of `View`s has none of that and must be given it
  explicitly, or it must go through a rig of its own (see A7).

**This is checkable, and it was checked.** Trace every `pose(NAME, …)` back to
where `NAME` is bound and ask whether that expression reaches a clock:

```
121 of 123 rig figures alive · 0 frozen · 2 untraceable by name (both boxers, both alive)
```

So the rig side of the app was already sound. **Both real offenders were animals**
— see A7 — which is the useful part of the result: the thing that felt like a
widespread stickman problem was actually two hand-built creatures with no
skeleton. A separate check for "alive but holds ONE gesture for the whole lesson"
found two more (`ethics8` code 48, `ethics10` code 24); both are figures the
script says are sitting still, so both are correct.

**A7. IF IT IS A REAL ANIMAL, IT MUST BE THAT ANIMAL.** A dog has to read as a
dog, not as "a quadruped". The two in the app failed this completely: ethics-1's
was a 48×20 pill, a circle, four straight 3.5px sticks and a line for a tail, and
political-31's was a pill with *two* legs. Neither is a species; "generic animal"
is the visual equivalent of writing "some philosopher said something".

Keep the house style — ink, line, the same weights the figures are drawn in. The
stickman look is not the problem and must not change. What must change is that
the *proportions and joints* are the real creature's:

- **The topline.** A dog's falls from withers to croup; an ox's is level. A level
  back on a dog is a table.
- **The underline.** Deep chest, then a tuck at the waist. A constant-depth body
  is a pill, which is exactly what was there.
- **The hind leg.** Stifle forward, hock back — a clear Z. This is the single
  strongest cue and the one that separates a dog from a goat, a horse or a stool.
- **The head.** A wedge on a rising neck with a muzzle projecting forward. One
  circle is a seal.

And it is alive, by A6: breath in the chest and not the belly, a head drift, an
ear that flicks, a tail that wags, and a gait cycled on DISTANCE rather than on
the wall clock (a walk driven by `t` slides its feet the moment speed changes).

> **Draw it in plain Node before it reaches a device.** `critters.ts` has zero
> imports for the same reason `rig.ts` does, so a contact sheet of every pose
> answers "is this a dog?" without Metro. Two passes have already been rejected on
> that sheet: the first had no elbow, so the forelegs were one vertical post, and
> the second still read as a deer — spike tail, horn ear, a solid wedge for a
> ribcage. **A stick-dog is harder than a stick-person**, because a person is
> identified by proportion alone and an animal is identified by silhouette.

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
- a **1px-wide** bone stretched by `scaleX` — hence `BONE_SRC = 100` with
  `scaleX: len / 100`. **The two are a matched pair; never change one alone.**

  This is worse than "rasterises imprecisely", and the difference matters. The
  element is rasterised at its LAYOUT size — one pixel of source — and the upscale
  loses the far end **in proportion to the length**. Measured directly, outside
  React, on the same stack:

  | source | length asked for | length drawn |
  |---|---|---|
  | 1px × 99 | 99 | **79** |
  | 1px × 57 | 57 | **45** |
  | 1px × 41.8 | 41.8 | **33** |
  | 4px × 24.8 | 99 | 99 ✓ |
  | 12px × 8.3 | 99 | 99 ✓ |

  **Every bone comes out a fifth short.** On a short bone that is a nick the joint
  cap happens to hide, which is why it read as a cosmetic seam for so long. On a
  long one it is a hole: the welcome host's 99-unit spine lost twenty units and
  opened a gap between his head and his shoulders. So the symptom you see depends
  on the bone, and a figure that looks fine is not evidence the rule is being
  followed — **check the source width, not the silhouette.** Anything from about
  4px up draws true.
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
distance (`moveTr`, ~56 units/second), never a flat crossfade. Every scene ran its
transition over a fixed 0.85s no matter how far the figure walked, so a short
sidestep looked fine and a hundred-unit crossing was sprinted. The feet never
skated — it was purely a timing bug.

> *"I dont want 'fast walking' … I always want this movements to look natural."*

**C17b. And it came back in FIFTY-FOUR scenes, with the sound as its second
symptom.** This rule was written, `moveTr` was built to enforce it, the table at
the top of Part 1 listed it as enforced — and the newest lesson in every branch
was written as

```ts
const TR = 0.82;
const tr = ease01(bt.value / TR);        // a FIXED length, whatever the distance
```

which is the defect verbatim, in the file the next author would copy. 145 walking
beats, every one of them too fast, the worst at **246 stage units a second against
an intended 56**.

The reader reported it as two things and they were one thing:

> *"the stickman will sometimes walk faster and now the sounds in lessons for
> walking is no longer lined up correctly"*

The footfalls are scheduled by the PLAYER from `footfallTrack`, which uses
`moveTr(x0, x1, 0.85)`. So a scene that draws the walk in 0.82s while the player
sounds it over 4.79s does not merely look hurried: the last footstep lands **four
seconds after the figure has stopped**. Sound and pace are the same bug seen from
two sides.

Two things follow, and the second is the general one:

1. **The denominator is `moveTr(X[p], X[n], 0.85)`. Always, with base 0.85**, so
   it agrees with what the player scheduled. `npm run check:sound` now re-derives
   both durations from the scene's own x track and fails on any disagreement.
2. **An enforcement that callers can decline is documentation.** `moveTr` could
   only enforce C17 for scenes that called it, and nothing checked that they did.
   A guard rail that lives in a helper needs a second check that the helper is on
   the path — which is L7 with the words changed.

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

**C20f. The ELBOW settles too, and `npm run check:rest` is what proves it.** C20 was
written about hands, fixed twice by reading the source, and reported broken again
months later — because a settled pose was only ever checked at the *fist target*, and
the drawn arm is shoulder → **elbow** → wrist. An elbow can wing back behind the skull
or sit inside the head disc while the hand it belongs to is somewhere perfectly
reasonable, and a fist-only reading passes every one of those. Five of the fifty
gestures were doing exactly that: `both-wide`, `reach-out`, `sway-conduct` and
`frame-it-up` all pulled the OFF hand back and up — and the figure is drawn in
**profile**, so a hand at x −32 is not "wide", it is *behind the person*, which threw
the left elbow to x −21 at head height. `tap-high-on-board` reached so high it drove
its own elbow into the face.

So the settled pose is now checked in numbers, on the solved skeleton, and the check
distinguishes the two cases that look identical in a diff:

- **A hand may touch the head.** "At the chin", "at the temple", "shielding the eyes"
  are all real poses, and a fist centred on the rim half overlaps and half shows —
  that is the *intended* picture. Only a hand driven well inside the disc (< 0.8 r)
  has actually disappeared.
- **An elbow may not touch it at all.** No gesture ever wants an elbow in the face, so
  it must stay off the disc, below the crown, and in front of the spine.

`scripts/check-rest.mjs` sweeps every code of every gesture library at eight clocks
and five beat-times past the lift, plus the four scenes that pose their own hands, and
fails the build on any of them. **When a settled pose looks wrong, fix the pose and
re-run it — do not widen the check.** The thresholds are the rule.

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

**C22f. A FOOT NEVER SLIDES — AND STOPPING IS WHERE IT SLIDES.** A planted foot's
world position must not change, ever. The walk cycle itself gets this exactly right by
construction: over one stance the foot's local x travels −S while the figure advances
+S, so a foot on the floor does not move at all. Mid-walk skating is therefore not a
thing that happens here. **The skate is always in the hand-off from walking to
standing**, and it was measured at up to 113% of a stride — more than a whole step of
drift, at the exact moment the viewer is looking at the feet because the figure is
arriving somewhere.

Three separate mistakes produce it, and all three are now handled inside
`strideStance` / `strideMode`, so a lesson gets the fix by calling them:

- **Never ease the travel distance twice.** The scene positions the body at
  `lerp(x0, x1, tr)` having ALREADY eased `tr`. Easing it again to drive the legs puts
  the feet on `span·ease01(ease01(u))` while the body is on `span·ease01(u)` — two
  curves that meet only at the endpoints, and glide in between. The distance handed to
  the gait must be the SAME distance the scene moves the body.
- **The arrival feet are pinned in the WORLD, not in the figure's frame.** A settled
  pose has fixed ground-relative feet, so the moment the blend into it begins the
  planted foot stops counter-translating and rides along with the body. Offset the
  arrival target by the distance still to travel, so the body closes the gap instead of
  dragging the foot.
- **The foot with further to go LIFTS.** The walk holds the feet a stride apart and the
  stance holds them a hand's width apart; something has to cover the difference, and
  both feet cannot be pinned at once. A foot that travels while touching the floor *is*
  the skate. So it takes a real step — lifted, arced, set down where it stays. Pinning
  alone cannot fix this half, and leaving it out is why the first two attempts still
  slid.

And the settle is a **distance, not a fraction of the journey**. `clamp01((tr − 0.78) /
0.22)` blends over the last 22% of the trip whatever the trip was, so the further the
figure walked the more ground it covered while its feet were locking to a static pose —
the slide grew with the journey, which is exactly backwards.

> Verify by measurement, not by eye: `rig.ts` and `moves.ts` are pure maths with no
> imports, so a walk can be sampled in plain Node and the world position of every
> planted foot compared frame to frame. Count a foot as "on the floor" if it is within
> ~1.5 units of it — testing `y === 0` lets a token lift hide a real skate.

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

**D33. Nothing may be painted across a word — and that is now measured, at the
glyphs, in the browser's own paint order.**

D31 has said "nothing opaque may cover text" since ethics-6 sliced "THE FIVE" in
half. It was never measured, and a reader hit it in a shipped lesson: a small
labelled box with a rule drawn through it, the word cut in two. Their words:

> *"a small box that had the word in it was behind another line … it was being
> intersected, and the word was being cut off. This is a big red flag, and it
> makes everything look cheap."*

**Nothing in the repo could have caught it, and the reason is worth stating.** Two
harnesses already render every lesson beat by beat: `check-frame` measures each
element against the CAMERA CROP, and `measure-must` measures a beat's boxes against
the SHOT. Both are about the frame's *edge*. Neither has ever compared one drawn
element to another, so a line laid across a label was outside every instrument the
app owns.

`npm run check:cover` is that instrument. For every beat of every cinematic lesson
it takes each word's glyph rectangle, samples it on a 2px grid, and asks
`document.elementsFromPoint` what is on top. Anything inked painted above the
glyphs is the defect. Paint order comes from the browser rather than from this
script reasoning about z-index, stacking contexts and transforms — which is the
only reason the answer can be trusted.

**A mark that is MEANT to cross a word must say so.** Some are the lesson: valid3
draws a corner-to-corner cross over "PREMISES TRUE / CONCLUSION FALSE" because that
pairing is what validity forbids. Geometry cannot tell those from a stray rule, so
intent is declared rather than inferred — give the mark a `nativeID` beginning
`strike` or `crossout` and it counts as an annotation. That puts the decision in the
scene, where somebody made it, and leaves the undeclared count meaning exactly one
thing.

**Six things had to be true before the number meant anything**, and every one was
found by screenshotting a reported hit rather than by thinking harder:

- **A strike-through is a rule across a word on purpose.** political-1 draws a 2px
  bar through "WAR OF ALL AGAINST ALL" to say the sovereign ends it. Geometrically
  that is the defect exactly. What separates them is EXTENT: a decoration starts
  and stops at the word, within about an eighth of its width at each end.
- **A word covering itself is not a covered word.** Several scenes stack two
  identical `<Text>` nodes on one rect; that was 17 hits of the first 212.
- **Judge everything on the whole opacity chain.** Scenes mount every beat's labels
  and fade the ones they are not showing — usually by fading a *parent* — so a
  `<Text>` at opacity 1 inside a group at opacity 0 passes an element-level test
  while being invisible. epistemology-1 reported *"UNTESTED is 100% covered by JUST
  LUCK"* on a beat whose screenshot contains neither word.
- **Wait for the frame, not for the camera.** A beat change cross-fades, and for a
  few hundred milliseconds two captions genuinely do sit on one another. Settling
  on `#stage-cam`'s transform alone measures the middle of that.
- **A frame around a word is not a cover.** `elementsFromPoint` returns an element
  for any point inside its border box, fill or no fill — so a card outline enclosing
  its own caption came back as covering 100% of it, fourteen times in
  metaphysics-being-7, every one a label sitting correctly inside its own box. For
  an unfilled element only the border BAND is ink, so the sample point has to land
  on it.
- **A word behind a SOLID PANEL is hidden, not sliced — and that is a different
  thing.** Scenes replace a beat's diagram with the next beat's cards in the same
  place and leave the old labels mounted underneath. Taking "the topmost inked
  element" gets this exactly backwards: the topmost thing over political-5's
  "GUARDIANS" is the *card's own text*, so it reads as two labels interleaved when
  in fact a solid card sits between them. Scan the whole span from the top down to
  the word; any opaque background in it settles the question. A word that is not on
  screen cannot look cut in half. This one alone was **36 of 94** apparent defects,
  and it is why political-5 went from the worst lesson in the app to clean without
  a line of its source changing.

Together those took the sweep from **212 hits across 8 lessons — seven in eight
dirty, which per Part 3 is a check that has told you nothing — to something that
names real defects and nothing else.**

**And 0 is what a check reports when it has quietly stopped looking, so this one
carries its own counter-test.** `SELFTEST=1 npm run check:cover` lays a real 2px bar
across the middle third of a word on every beat and requires the probe to find every
one. It has already earned its keep twice, and the second time is the important one:

- It caught the sampler missing **5 of 68** planted bars, because three sample rows
  on a 17px word are under 5px apart and a 2px rule can fall between two of them.
  The sampler cannot be coarser than the thing it hunts — hence 2px in *both*
  directions.
- Then, after the "behind a solid panel" exemption was added, it reported **0 of
  67**. An ink rule *is* opaque, so the escape hatch for a word behind a panel was
  swallowing the exact defect the file exists to find. A full 132-lesson sweep had
  already run and produced a tidy-looking 12 lessons / 45 occurrences — every
  number of it meaningless, and nothing else would have said so. A backing surface
  now has to ENCLOSE the word (95% of its glyph rect) and be panel-shaped in its
  PRE-TRANSFORM box, because a rotated 168×2.5 bar has axis-aligned bounds of
  163×42 and would otherwise qualify.

**Run the self-test whenever the probe's logic changes.** Not the sweep — the
self-test. A sweep that reports fewer defects is indistinguishable from a sweep that
has gone blind.

**The one thing that is deliberately NOT measured here.** "The word is sitting on a
line rather than on paper" is the same defect from underneath, and as geometry it is
easy to compute — but geometry cannot tell a caption printed on a dark panel, which
is correct and everywhere, from a caption buried in one. epistemology-1 alone
produced 38 hits of that shape, all of them cream labels doing their job. The real
question underneath is CONTRAST between the glyph colour and what it lands on, which
is a different instrument; shipping the geometric version would have buried the real
hits in correct ones.


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

**G51e. NOTHING MAY BE READ BEFORE IT EXISTS, and `tsc` cannot tell you.** Two
initialisation-order faults, both of which throw at run time, both of which passed every
check this project had, and both of which shipped:

- **A worklet must be declared AFTER any worklet it calls.** Reanimated's babel plugin
  builds a worklet's closure when the MODULE is evaluated, so calling one declared
  further down the file captures it in its temporal dead zone. It throws at *import*,
  which fails the whole route tree — a blank screen on every lesson, not a broken
  animation on one. `settleStep` was added to `rig.ts` at line 172 calling `mixStance`
  at line 1331, and the rule was already written four lines above `lift` in that same
  file.
- **A hook whose callback runs during render must be declared AFTER the shared values it
  reads.** `useDerivedValue`, `useAnimatedStyle`, `useAnimatedProps` and
  `useAnimatedReaction` all invoke their callback immediately to establish an initial
  value; `useEffect` and `useCallback` defer and are safe. The camera in
  `CinematicPlayer` read `bi.value` eighteen lines above `const bi = useSharedValue(0)`.

The second one broke **exactly one lesson**, which is why nobody caught it: the worklet's
first line returns early when a lesson passes no `shots`, and `ethics-ethics-8` is the
only lesson with a camera — so 101 lessons took the early return and never reached the
dead zone. A crash that only fires on the one file exercising a new feature is the
easiest kind to ship and the hardest to attribute.

> **Why `tsc` is structurally blind to both.** Referencing a later declaration from
> inside a function body is legal, because the function normally runs later. TypeScript
> has no way to know that Reanimated evaluates the closure eagerly. So this is checked by
> `npm run check:worklets` instead, which runs FIRST in the chain because an import-time
> throw makes every check after it meaningless. It strips comments before matching — its
> first draft reported `solve` calling `lift` and `strideStance` calling `moveTr`, neither
> of which happens, one of them from inside the very docstring that states this rule — and
> it scopes per component, because a file-wide scan flagged three correct components whose
> props merely shared a name with a later local.

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

### I. Being followable — the reader must never be confused about what to do

Group A–H exist because a lesson looked wrong. This group exists because a lesson
*read* wrong: the reader knew something was being asked and could not tell what.
Every rule here was measured across all 102 cinematic lessons at once, not spotted
in one.

**I70 — an answer target must be a `<Target>`.**
82 lessons ask their question by having the reader tap the picture. Measured across
every one of them: **69 of 82 prompts already said "tap"**, so the instruction was
never missing — but only **13 of 82 named something you can actually see**, and 15
pointed at an abstraction (*"tap the claim that is still owed an account"*). The
targets were drawn exactly like the scenery around them, so nothing on the stage
said *these two rectangles are the buttons*.

`components/lesson/cinematic/Target.tsx` is the fix and it is one component on
purpose: it puts a breathing ink ring just **outside** each target's bounds (outside,
so it never covers the thing being chosen), removes it the instant an answer lands,
and **counts itself**, so the panel underneath can say "Tap one of the 3 outlined
parts above" without any lesson declaring a number it could get wrong.

`npm run check:cinematic` carries this as a debt ratchet, `UNRINGED_BUDGET`, the same
shape as `CARD_BUDGET`: a high-water mark that may only fall. A new scene that answers
by tapping and does not use `Target` raises it and fails the build.

**I71 — the prompt must name something that is on the screen.**
"Tap the difference Singer says carries no moral weight" is a fine sentence and a bad
prompt: the reader has to derive which drawn object *is* "the difference". Name the
thing as it is drawn — *"one of these two children is nearer. Tap the one Singer says
that fact does not excuse."* If the prompt cannot name a visible thing, the scene has
not drawn the question yet (A1 again, from the other end).

**I72 — no back-reference to a sentence that has scrolled away.**
"Which board does *that line* belong on?" asks the reader to hold a sentence from the
previous beat. They will not have. Restate the claim inside the prompt, or put it on
the stage where it can be pointed at.

**I73 — one idea per prompt, and under 18 words.**
Measured: in-scene prompts average 13.4 words and 8 are over 18; the longest is 27.
Past about 18 the prompt stops being a question and becomes a paragraph with a
question at the end, which is the format the cinematic lessons exist to replace.

**I74 — a scene that answers by tapping may not carry `pointerEvents="none"` on its
root.**
The other rules in this group are about a reader who cannot tell what to do. This one
is about a reader who knows exactly what to do and is not allowed to do it.

`pointerEvents="none"` blocks the View **and every descendant** — `box-none` is the
value that lets children through. A scene root carrying `none` therefore renders its
`Target`s, breathes their rings, prints "Tap one of the 3 outlined parts above", and
swallows every tap on them. The beat is gated on an answer, so the lesson stops dead:
no console error, no visual tell, nothing that separates it from a lesson that works.

It shipped in `metaphysics2Scene`, copied from the sibling "lesson 2" scenes, which
carry the prop **correctly** because they ask with the deck and have nothing tappable
on stage. That is the trap worth remembering: the prop is right in three of the four
files it appears in, so it reads as house style rather than as a bug.

Nothing is bought by it either. The Scene mounts INSIDE the player's advance
`Pressable`; a plain View is never a touch responder, so taps already bubble through
to advance, and a `Target` stops that bubble for itself. All 60 other Target-using
scenes leave the root at its default.

`npm run check:cinematic` fails any scene that imports `Target` and carries the prop.
The check keys on **the import**, not on `onPick(` — a scene hands `onPick` to a
Target as a prop rather than calling it, and the first version of this check borrowed
I70's regex and so sat green over the very file it was written for. It was only caught
by re-introducing the bug on purpose. A check nobody has watched fail is a check
nobody has tested.

---

## Group J — the words the reader reads

Every other group in this book guards the picture. This one guards the prose, which
is what the reader actually spends the lesson doing. It exists because a reader said
the lessons were *"sometimes difficult to understand because of the wording, and
sometimes just too much to read"* — and because nothing in `npm run check` had ever
looked at a sentence.

**The measurement first, because it overturned the obvious theory.** Across 884 beats
the app's own voice is good: the median narration beat is 22 words at 9 words a
sentence, roughly how a person explains something out loud. The obvious culprit —
verbatim source prose from Nagel, Singer, Mill, Danto, Carlson and Burke, which really
does sit in the narration slot — turned out to be innocent: beats carrying a `cite`
read **better** than beats without one (11 words a sentence against 11.5, 8% long words
against 11%). Attribution was never the problem.

What the 69 hardest sentences share is a **device**. 48 contain an em-dash, 14 a colon,
23 two or more commas; only 5 are plainly long with nothing joining them. The habit is
to bolt a second complete thought onto the first with a dash instead of ending the
sentence. That is what makes a beat feel like work.

**J1 — one thought per sentence, and under 20 words.**
The median is 11 and the app rarely reaches 20 on its own. When it does, a dash is
almost always joining two things that should have been two sentences. The fix is a
full stop, not a rewrite. `check-words` counts them.

**J2 — a beat of narration stays under 45 words.**
The median is 22 and the longest honest beat is 44, so this only bites on something
genuinely overstuffed. A beat is one thing said once, not a paragraph.

**J3 — an explanation after an answer stays under 50 words.**
It is the longest thing anyone reads (median 34) and it lands at the moment attention
is lowest: the reader has already committed to a choice and wants to know if they were
right. Say that, say why the tempting answer tempted, stop.

**J4 — no beat is more than 35% long words.**
Deliberately loose, and loosened once already. At 30 it caught exactly one beat —
*"Philosophy means something completely different by the word. An argument is a machine
with parts."* — which is the plainest sentence in that lesson and carries the concrete
image the rule exists to protect. A checker that would have had **that** reworded is
measuring the wrong thing, so the number moved rather than the prose. The subject *is*
long words: "consequentialism" is the lesson, not a failure. This now catches only a
beat that is wall-to-wall abstraction with nothing concrete to hold onto.

### The second measurement: there are two voices, and the worse one is at the front door

Length was never the whole complaint. Read all 102 lessons end to end and the app plainly
has **two voices** — one that stages an idea and walks you through it, and one that reads
like an encyclopaedia entry: names stacked three to a sentence, Greek dropped in
untranslated, questions that ask what you remember rather than what you can work out.

It tracks **where the reader meets it**, and it is backwards:

| | names crammed mid-sentence | trivia-recall questions |
|---|---|---|
| lessons 1–9 | 0.56 / beat | **20 of 110** |
| lessons 10+ | 0.16 / beat | 4 of 96 |

Three and a half times the name density and four and a half times the trivia, in the
lessons **every reader sees first**. The cause is heritage rather than carelessness: the
low numbers were written as card decks and later converted, so they kept a deck's voice,
while the high numbers were authored for a stage from the start. J6–J9 are that
difference made countable.

**J6 — at most two names crammed mid-sentence in one beat.**
A name that *starts* its own sentence is free: "Nozick reads only that strip" gives the
man a clause and a verb, and reads well. What costs is three surnames riding along inside
other clauses — *"Plato and Aristotle: art is mimesis, skilled imitation. Later Tolstoy
and Collingwood: art is the expression of feeling"* put four names into 22 words and
taught none of them. A **budget, not a zero**, and honestly so: the count cannot tell a
person from a place, and three of the four beats over the line are "in Greece, in India,
in China" and its kind.

**J7 — a term arrives alone, and the sentence around it says what it means.**
Not countable; judgement, like J5. One new word per beat, after the thing it names has
been shown. *"India's word is dharma: doing what your place in life actually asks of you"*
works because the gloss is attached. Four Greek terms in one explanation does not.

**And check what the stage already says.** `metaphysics5` draws the label
**EVERY FACT NEEDS A REASON** on screen, and the narration was saying "his Principle of
Sufficient Reason" over the top of it — a term added, no meaning added, and the scene's
own plain-language choice undone. `ethics2`'s table reads **OUTCOMES · DUTY · CHARACTER**
while its narration recited "Consequentialism · Deontology · Virtue ethics". Read the
scene before naming anything; half the time it has already picked the better word.

**J8 — ask what the reader can work out, not what they can remember.**
*"Who said 'knowledge itself is power'?"* is a memory test of the slide two beats back.
Ask which thinker **held the position** and it is the same tap and a real question. The
tell is the subject: a recall prompt's subject is a person or a work ("According to X",
"For X, what", "What did X call"). A *What/Which* opener proves nothing on its own —
*"Which single fact proves 'All cats are black' false?"* opens the same way and is
genuine reasoning. A budget, falling.

**J9 — an explanation points at something the reader can see.**
A zero, and it is here because **27 explanations failed it silently**. They said "the
trap is B", "C over-corrects", "Not B or D" — written when a question had four lettered
options, and left behind when the two-card answer replaced them. The reader now sees two
unlabelled cards, so every one of those letters named nothing at all. Nothing failed and
nothing could: a stale letter still typechecks and still renders. Say *which card*.

**J5 — write it as you would say it to someone who does not know the subject.**
The one rule here that cannot be counted, and the one the others serve. Name a concrete
thing before the abstract term for it. Prefer the short word where it means the same.
If a sentence would sound strange said out loud to a friend, it is wrong on the page
too. The countable rules above exist because this one is a matter of judgement and
judgement drifts; they are the floor, not the standard.

**A `quote` block is exempt from all of it.** That is what it is for: a primary source,
framed as a quotation, attributed, saveable. §13 wants the reader to see the sentence
Descartes actually wrote — in the quote card where it is announced, not in the narration
where it reads as the app.

---

## Group K — the tour: the camera moves, and nothing moves without it

Every other group in this book guards a *picture*. This one guards **time** — the
order the reader is shown things in, and the guarantee that the camera is pointed at
each one when it happens.

It exists because the two camera rules before it pulled in opposite directions and
H60c won. H60b asks the camera to move and to get close. H60c says a shot may never
crop anything the beat is showing. Both are right, and together they are a vice:
**one framing has to hold everything the beat will ever draw, so the framing is the
widest thing the beat contains.** The measured cost is in H60c — mean shot 1.124×
→ 1.017×, 72% of beats sitting at exactly 1.0. The camera was made safe by being
made timid, and a reader put it plainly: everything is one long shot of a small man.

The way out is not to loosen H60c. It is to stop asking one frame to do the work of
a sequence.

**A beat is a TOUR of STATIONS.** A station is one framing of one thing, held long
enough to read. The camera travels between them; H60c then binds **per station**
instead of per beat, because at any instant the only thing that must fit is the thing
being shown *now*. That is the entire trade, and it is what buys the zoom back:
measured across the same 884 beats, 462 of them support a tour, and on those the
ceiling goes from **1.056× to 1.671×**.

### K1 · The clock waits for the camera

**Scene time does not advance while the camera is in transit.** A beat's clock runs
during a station and freezes during the travel between stations.

This is the rule the whole group exists for, and it is **structural** — the player
gates the clock it hands the scene, so a scene obeys this by doing nothing. There is
no version of this an author can forget, which matters at 102 lessons.

What it guarantees: nothing the reader is meant to watch can happen while the camera
is on its way somewhere else. An animation that would have played to an empty frame
now waits, and plays when it is being looked at.

> The corollary is the reason it must be the clock and not a convention: **a scene
> animates on `bt` and has no idea a camera exists.** Gating `bt` is the only
> intervention that reaches all 102 scenes without editing one of them. Anything
> requiring a scene to ask "has the camera arrived?" would be 102 files of judgement
> and would be wrong in some of them within a month.

### K2 · Station order is REVEAL order, and it is measured, not guessed

Because the clock is chunked by K1, station *j* is showing whatever the scene reveals
in scene-time window *j*. So the order of the stations has to be the order the scene
reveals things in, or the gate makes the problem worse rather than better: the camera
sits on the right-hand label while the left-hand one draws itself off screen.

**Spatial order is not a safe substitute.** Reading order looks like a reasonable
proxy and is not one — scenes routinely build the right side first, drop a headline
in last, or animate a prop before the label that names it.

So reveal time is **sampled from the real render** and stored, the same way the
must-see boxes are (H60c): `scripts/measure-must.mjs` records, per item, the first
scene-time it is drawn at. Stations are then ordered by the earliest reveal in each,
and ties broken by reading order.

### K3 · The camera is a PATH with a memory, and it moves when it must

**It is somewhere. It moves when the next thing to see is not already in front of
it. Otherwise it holds.** A lesson is therefore a handful of deliberate moves — three
in a typical eight-beat lesson — and the tap between them is what advances the story,
not the camera.

Three parts, and the third is the one that took two attempts:

1. **The subject of a beat is what ARRIVES during it.** Every measured item carries
   the reading it was first seen in, so `r > 0` is exactly "this happened while the
   beat was playing". A living figure does not count — see the note below.
2. **The reason to move is emphasis, not visibility.** Read the other way round the
   rule does nothing: the camera starts on the whole stage, so everything is already
   in frame, so there is never anywhere to go — measured, **47 moves across 905
   beats** and most lessons dead still. It pushes in because the beat is *about* this
   thing. `worth` (K4, K4b) decides whether there is a framing here at all; only when
   there is not does visibility get a say, and then the answer is the whole stage.
3. **It is decided for the whole lesson at once, in order** (`lessonTours`). Deciding
   each beat alone cannot help but bounce: beat 0 finds a subject and pushes, beat 1
   finds nothing and so has no reason to be anywhere and falls back to wide, beat 2
   finds the same subject and pushes again. A reader watching that said so exactly —
   *"it'll zoom in, then zoom out, and then two clicks later, it'll be the exact same
   zoom in and zoom out"* — and **every lesson did it the same way, because the
   pattern came from the rule rather than from the lesson.**

A `null` in the table means **hold what you have**, and the player must honour it or
the two disagree — the generator holding while the player pulls back out is the bounce
rebuilt from both ends. The only beats that park at their own framing are a **graded**
one (K6 — an answer target needs the identity transform) and the **summary**, and both
sides know it.

> `followMoves` no longer chooses framings at all. It used to deal a verb per beat
> from the figure's track plus a seeded three-phase cycle, which gave every lesson in
> the app the same rhythm; a cycle cannot help but repeat, that is what a cycle is. It
> now deals `pull` for a question or a summary and `hold` for everything else. **`whip`
> went with it, and with `whip` the last overshooting move in the app** — "that same
> bouncy camera movement" was `easeBack`, which nothing else ever dealt.

#### The camera frames what CHANGES, and then it stays there

**A station exists to show something that happens.** The subject of a beat is not its
contents — it is the part of them that arrives while the beat is playing. Everything
already on stage when the beat opened was carried in from the shot the reader was
looking at a moment ago, and there is nothing to move for.

The sweep already records this: every measured item carries the reading it was first
seen in, so `r > 0` *is* "this appeared during the beat". The tour is built from those
items and from nothing else.

Then the camera **holds until the tap**. No closing station, no coming back out.

> #### What this replaced, and why
>
> This rule used to say the opposite: *the last station of every tour frames the
> beat's whole must-box*, so a reader always finished a beat having seen everything.
> It sounded like a safety property. It was the single line that produced what a
> reader described as **"this loop of movement… it will move 3 different times just
> to be sure it shows everything, that is inefficient and doesn't really make
> sense"**.
>
> Measured, it had put **2.39 stations on every toured beat, 1262 of them across 527
> beats**, and the commonest tour in the whole app was `[tight on the man for 1.2s]
> → [the whole stage]`. The close-up taught nothing and the camera then undid it —
> because the shot it pulled back to was the shot the beat had opened on. A reader
> sees a dip, not a decision.
>
> The honest reading of H60c was always "if the reader is told to look at it, the
> camera must frame it" — **at some point in the beat**, not at the end of it. A
> camera that pans from a man to a chart and stays on the chart has not hidden the
> man. Removing the lap took stations from **1262 → 502** and camera stops from
> **1.81 → 1.10 per beat**.
>
> The one thing genuinely lost is the old rollback property: emptying the table no
> longer leaves every lesson byte-for-byte its old self, because the table is now the
> camera rather than motion added ahead of it. Which was in fact already true and
> merely unstated — measured on the base shots alone, **66 lessons never move at
> all**: `frame()` contains every beat by its must-box, most must-boxes are
> near-full-stage, and what was left after containment was one static wide.

#### Three things about K3 that only a screenshot found

Each of these passed `tsc`, the generator's own verifier and `check:tour`, and each
was wrong on the real screen. The offline harness cannot see any of them.

- **A living figure is not a change.** `stand()` gives every figure breath, a weight
  rock and head drift, so his measured box differs in all four readings whatever he is
  doing — which made the man the freshest thing on every beat in the app. The camera
  pushed in on him, and aesthetics-1 beat 0 came back as a full-frame close-up of a
  stickman under the words *"Look at it. Beautiful, obviously"*, with the sunset those
  words are about off the stage. **A1, produced by a camera rule.** He now counts as
  changing at **24 units** of centre travel: above breathing (2–3) and an arm coming
  out (~10), below the 60 that makes it a walk to follow.
- **A held framing may not cut a word in half.** While every tour ended wide, a
  framing that sliced a caption was a moment on the way somewhere. Now it is the
  picture the beat rests on — the same beat came back with the chart panel chopped
  down its middle reading *"APP… SUN… BEAU…"*. `cleanEdges` grows a station to swallow
  any text it would otherwise cut; art is exempt, because art bleeding off a frame
  edge is ordinary composition. If growing costs the station its gain, the beat holds
  wide, which is the right answer: it cannot be framed tightly without cutting a word.
- **The table is written in integers, and it must round OUTWARD.** `make-tours` stores
  every station through `Math.round`, so a box validated at y 232.5 shipped as y 233 —
  half a unit tighter than everything had been checked against, which was enough to
  slice five labels sitting exactly on that line in epistemology-13. Rounding outward
  makes the stored box a superset of the proven one.

> **And the guard that silently inverted.** `CinematicPlayer` refused any tour with
> `raw.length < 2`. That was harmless for exactly as long as K3 forced a closing wide
> station, which made two the minimum any generator could emit — "fewer than two"
> meant "degenerate". With the lap gone the ordinary tour is a SINGLE station, and the
> line quietly discarded **300 of them**: generated, verified, written to the table,
> and dropped on load. Every lesson looked precisely as it had. A condition whose
> meaning depends on a rule kept somewhere else goes stale without ever failing.

### K4 · A station needs a subject worth stopping for

Not every cluster of ink deserves its own framing. A station is only made when both
hold:

- the subject is at least **88 scene units** on its longer side — below that the
  camera is framing a single word, and the closest station measured on the raw data
  was **32.6×**, which is not drama, it is a microscope;
- it is at least **0.12×** tighter than the closing wide shot. A move that changes
  the framing by less than that reads as drift, not as a decision.

Everything failing either test is merged back into its neighbour.

**And the figure is a subject even when nothing separates it.** The tests above find
subjects by looking for blank paper between them, which misses the commonest
composition in the app: a person standing among the words about him. Measured, 243
beats produced a single cluster while 263 untoured beats had a figure on stage — so
gap-splitting alone was leaving the most obvious close-up in the vocabulary unused,
and H60b's first bullet is *"push in on the figure"*. A beat with exactly one person
therefore gets a station on him whether or not the layout separates him.

**With several people it is the GROUP, not one of them.** "Which man do we push in
on" has no answer worth guessing, and that was first read as a reason to skip the
beat — which left six lessons with no camera at all, every one of them a two-hander.
The subject was never one figure; it is *the people*, and their union is a two-shot.
Measured, 143 multi-figure beats frame the group at least 0.12× tighter than the
whole stage and only 11 gain nothing.

A single figure is the same rule with one member, and there the reading buckets
decide which box to take: a man who walks leaves several, and a static station on a
slow mover should sit where he ends up rather than splitting the difference.

**Not on every beat, though**, and this is a lesson `followMoves` already paid for.
Its first pass pushed in on two beats out of three and left the reader with a camera
that never rests, at which point the moves stop registering as moves. So the figure
station runs on a seeded two-in-three cycle — seeded per lesson, so the beats that
rest are not the same index every time. The result is 55% of beats toured, a mean of
58% per lesson, and **no lesson where every beat moves**.

A beat left with no qualifying station keeps a single shot.

### K4b · If it cannot be centred, do not go

**A shot that travels to something must put it near the middle of the frame** — within
**18%** of frame width, a hair past the rule-of-thirds line, which is where a subject
stops reading as *placed* and starts reading as a camera that missed. Otherwise the
move is not made and the frame stays where it is.

This is the second half of what the reader asked for: *"make sure that when the camera
moves to anything that it is centered, not mainly to the left or right side of the
screen, but the center."*

**It is a hard geometric limit, not a preference.** `fit` may never let the window
leave the design space, so the centre is clamped to `[200/s, 400 − 200/s]`. A figure
standing at x 72 needs `s ≥ 2.78` before its own centre is even reachable, and K5 caps
every station at 1.72. The clamp wins, the camera arrives, and the man is pinned
against the edge of a frame that has just travelled to look at him.

Two things about it are worth knowing before trying to be clever:

- **Tightening makes it worse, not better.** Relative offset is `0.5 − bx/(2h)` with
  `h = 200/s`, so a *wider* frame has its centre pinned nearer the stage centre and
  the subject further from it. There is no scale that rescues an edge subject.
- **Overhang would fix it and is not worth it.** Letting the window run past the
  design space would allow a true centre, but scenes stop their ground lines short of
  the stage edge (`left: 20, right: 14` is typical), so the frame would show a rule
  ending in mid-air. `checkShots` forbids it, and should keep forbidding it.

Measured across the app before this rule: **983 pushed shots, 709 of them past the
thirds line, the worst 35.6% off centre.** After: **528 pushed shots and 2 past the
line.**

> **Where it bites, it is a staging note and not a camera one.** Three lessons —
> `logic-arguments-12`, `political-political-32`, `aesthetics-aesthetics-34` — stand
> their figure at x 15–35 on every beat, so nothing in them is centrable and they now
> hold one wide shot throughout. That is the correct trade (the whole stage is
> legible, and the figure is at the left because that is where the scene draws them),
> but the real fix is in the scene: move the figure inward and the camera comes back
> on its own.

### K5 · Nothing goes closer than `tight`

**1.72× is the ceiling**, the existing `tight` framing. Past it the frame is inside
the figure — a 103-unit body in a ~300-unit band already fills the height at 1.72×.
The cap is applied after containment, so it can only ever make a station wider.

### K6 · Graded beats, drag beats and the summary get exactly ONE station, at 1.0

Unchanged and non-negotiable, and now for a second reason on top of the old one.

The old one (H60b): answer targets are `Pressable`s and scale 1 is the identity
transform, so a tap must not have to survive a camera offset. The new one: a tour
holds the clock, and a beat whose clock is held is a beat whose *answer* can be held
with it. A reader who has decided must be able to act immediately.

`drag` beats (§17) are the same case — `dragPos` drives the picture live, and a
gated clock between the hand and the drawing is exactly the lag that makes a scrub
feel broken.

### K7 · A tap fast-forwards the tour; it never skips it

The beat is tap-advanced, so a reader can always outrun the camera. The first tap
during a tour **completes it** — every station's content resolves and the camera
lands on the closing wide shot; the next tap advances the beat.

The alternative was locking the tap until the tour finished, and it is worse than
the problem: `locked` already exists for unanswered questions and is felt as the app
being unresponsive. Fast-forward respects an impatient reader without costing them
anything, because K3 guarantees the thing they land on is the complete picture.

### K8 · A tour fits inside a beat a reader will actually sit through

- travel **0.55–0.9s** — under 0.35 reads as a jump-cut (`checkShots` already says
  so), over ~1s and the reader taps;
- dwell **≥0.7s**, and long enough to cover its own reveal window;
- **at most 2 stations**, and the last one holds until the tap;
- **≤5.5s of the reader being kept waiting.**

**Two, and there is no third.** Two is the smallest number that can say "look here,
now look there" and the largest that is not a lap. Measured after K3 was rewritten,
**1.22 stations per toured beat** — so the ordinary tour is a single move, and the
second one is the shape the reader themselves named as worth having: *"the camera
zooms into a moving thing, then pans to information after that."*

That last figure counts travel and *static* dwell only, and the distinction is not a
loophole. A follow station's dwell (K9) is the walk the beat already contained, now
tracked instead of watched from across the room — the reader is watching the lesson,
not waiting for the camera. Charging it to the budget would make the one shot this
group exists to enable the one shot it forbids.

A beat carrying more than four things worth separate framings is a composition
problem, not a camera problem — see H52 and the one-idea-per-beat rule.

### K8b · Nothing chases the camera — it IS the camera

**The requested shot is driven straight to the transform. There is no smoother.**

There was one: a critically-damped spring chasing `camNow`, hired when the requested
shot was discontinuous in four separate places. All four are now fixed at source — the
travel carries the shot actually drawn (group L), a question beat frames with its
static must-box immediately, a tap no longer warps the clock out from under a travel,
and a beat with nothing to go to holds. **Smoothing something already smooth only buys
lag**, and a reader reported that lag twice without knowing it was one thing:

- *"the camera zooms in and the thing is on the left side, and then over a little bit
  of time it eventually corrects to the center."* That is the spring settling. The
  travel had arrived; the follower had not.
- *"it sees the movement and then moves after — I want it to move WITH the stickman
  walking, the same moment it is walking."* A chase has a steady-state error against a
  moving target. Feeding the target's velocity forward shrank it and could not remove
  it, because a measured velocity is always one frame old.

Both are one sentence: **a follower cannot be in two places at once, and the place the
reader wants it is the requested one.** `shotAt` already eases every travel out of rest
and back into it — smoothstep on the centre, geometric on the scale — so the motion is
smooth with nothing chasing it, and it *arrives*, on the frame it was meant to, centred.

`LEAD` went to **0** in the same pass. Looking a little into a move is an operator's
habit and it is still the camera disagreeing with its subject about where the subject
is; "move with" is the instruction, and it is now literal.

### K9 · A follow is not a travel, and its clock runs

When the camera tracks something that is itself moving — a figure walking on, a prop
being carried — that is one continuous station whose target moves, not two stations
with a transit between them. The clock runs throughout, or the walk stutters.

This is the distinction the user's own description turns on: *"the camera is very
close to him, following him walk"* is a station; *"then the camera moves over to
another part"* is a transit, and only the second one freezes the clock.

**How it is found, and why it needs the same measurement K2 does.** The sweep samples
each beat four times, so a figure crossing the stage leaves four boxes at four
positions; ordered by reveal index they are a trajectory, and its first and last
entries are the two ends of the track. Unordered they are a set, and the figure could
as easily be walking the other way — which is why a follow, like a multi-station tour,
is only generated from a sweep that recorded reveal order.

**Both ends are framed at one shared scale** — the tighter of the two requirements —
so the shot slides rather than zooming. That also makes it legal for free: at a fixed
scale the legal range of the centre is a plain interval, so any point between two
legal centres is legal and nothing can clamp halfway through the move. `checkTour`
still tests both ends, because the far end is the half that can lose him.

The floor is C18's: **60 stage units**. Under that a walk does not read as a walk, and
a camera sliding after it reads as drift. 318 of 891 beats clear it and the longest
crosses 350 — the full width of the stage, which as a single static station is
necessarily the widest shot in the lesson. That shot is precisely what a reader
described as one long take of a small man.

The dwell is the beat's own declared `dur`, clamped to 1.6–4.2s: the same number the
footfalls and gesture sounds are already measured against, so the camera and the feet
are working off one clock.

### K10 · The tour is generated, and the generator is the authority

Station tables are **derived** from the measured parts, not hand-written, for the
same reason the must-see boxes are: there are ~880 beats and hand-authoring
rectangles at that scale is how the four-in-eleven error rate in `camera.ts`'s own
header happened.

`components/lesson/cinematic/tours.ts` is generated. A beat may still declare its own
`tour` and that wins — the override for what measurement cannot see. Re-run the
generator after changing a scene's layout, and note that the stamp mechanism from
H60c covers this too: a tour derived from a scene that has since moved is stale in
the same silent, dangerous direction.

> **What is not yet proven.** Groups A–G each exist because a real lesson broke that
> rule on a real phone. This one is the opposite: it is a design, measured offline
> against 884 beats and verified in a browser, and it has not yet met a reader. The
> numbers above are the ones it was built to; treat them as a starting calibration
> rather than as findings, and expect K8's timings in particular to want tuning once
> somebody has actually watched twenty lessons end to end.

### K11 · The generator must model the camera the APP has, not one that resembles it

Six stations kept cutting a word in half, and `make-tours` had already been taught
to ask the real camera and drop any station that did. It dropped the wrong ones,
because it was asking a camera nobody ships:

```js
const m = scene.match(/ground=\{(\d+)\}/);
return m ? +m[1] : undefined;        // <- and NO scene passes the prop
```

`fit()` skips its ground clamp when `ground == null` — the clamp that stops a push
ending the frame ABOVE the line the figure stands on. `CinematicPlayer` defaults
`ground = GROUND` (500) and `check-tour` has always passed 500, so the generator
was the only one of the three laying out for an unclamped camera. Defaulting it
took the slicing stations from **6 to 0** and brought back 21 stations that had
been demoted to holds.

The player's own comment records this bug from the other side — *"the checker was
resolving with the clamp and the app was resolving without it"* — which is what
makes it worth its own rule. **When three programs share a geometry, an optional
argument is a place for them to disagree in silence.** Give it one default, in one
place, and let all three read it.

---

### K12 · A station answers for every word it can reach, not just the ones beside it

K11 fixed the camera the generator was modelling. This is about the WORDS it was
modelling, and it is three separate mistakes with one shape: each drew the circle
of "what this station could possibly cut" too small, and every one of them shipped
half-cut words while `check-tour` read **0 of 359 stations cut a word in half**.

**1 · The words it could see.** The list of what a beat has on stage is measured
and stored, and the stamp that says whether it is fresh did not cover the probe
that measured it (D36's neighbour — see `scripts/lib/muststamp.mjs`). An older
probe had recorded roughly one word a beat. A station is refused only when it can
see a word being sliced, so with those lists it saw nothing and pushed to 1.68×
over labels it had no record of. `ethics-13` drew COWARD seventeen pixels off the
left of the screen and RECKLESS forty-two off the right, on three consecutive
beats, for as long as the file had existed.

**2 · Both ends of a FOLLOW.** A follow's window SLIDES, and only its start was
tested. `political-8`'s EYE LINE sat 48 units clear of the opening framing and 12
units INSIDE the closing one. The window travels monotonically, so the swept
region is the union of the two ends and the always-visible region is their
intersection: **a word is safe when it is wholly inside the intersection or wholly
outside the union, and sliced anywhere between.**

**3 · Every beat it REACHES.** This is the one worth remembering, because nothing
in the tour's own vocabulary suggests it. A beat with no camera move of its own
keeps the framing it was handed — so a station's push does not end when its beat
does. `metaphysics-8` has stations on beats 1, 3 and 5, and beats 2 and 4 sit at
1.72× with nothing of their own, slicing captions no station was ever asked about.
**The station caused it, so the station answers for it.**

Testing the next beat alone was the first guess and it was short by three:
`political-18` has ONE station, and its framing held across four beats, shaving
the top off SAME BICYCLE · SAME MONEY on every one of them. The reach ends at the
next beat with a station of its own, since that is what re-frames.

**And it has to be a FIXPOINT, because dropping a station lengthens the reach of
the one before it.** Deciding beats in order can only consult the CANDIDATE list,
and `aesthetics-7`'s single station was judged against a reach that stopped at
three candidates which were then all dropped — so its 1.72× actually ran four
beats past where it had been tested, and cut A MASTERWORK down to 4% of itself on
every one of them. The generator now re-tests what survived against what survived,
and repeats until nothing changes. It settles quickly: a pass either removes a
station or removes none.

**And a station needs CLEARANCE, both ways.** Sitting on the line is where the
generator and the app disagree — the boxes come from one instant and the reader
sees every instant, and the resolved scale drifts about a percent. Judged on the
raw numbers, `political-14`'s THE TRADES cleared its window by 1.1 units and
reached the reader as a sliver; `epistemology-13` ranked its numbers at exactly a
station's top edge, passed as *wholly inside* by half a unit, and reached the
reader with 5.5 units shaved off each one. The two margins are different numbers
on purpose: widening the union only ever refuses a station, so it is generous at
10 units, while shrinking the intersection refuses one for every word near an
edge — 10 there cost 55% of the tour and 6 costs 20%, for the same defects caught.

The tour is worth 447 → 224 stations to get this right, and that is the trade the
group already states: **a framing that cannot hold a word whole is not worth
holding, and the wide shot is clean by construction.**

---

## Group L — nothing may teleport

A reader watching real lessons on a real phone: *"in changing of scenes, an answered
question, a change of direction of walking for the stickman, no matter how fast the
user taps the screen, all of these need smooth transitions… it looks as if there is a
glitch on screen, or a frame miss."*

Four symptoms, and measurement found they are **two defects**, both of them in three
lines every scene shares. `npm run check:smooth` replays all 112 lessons at 60fps in
plain Node — `rig.ts` and `moves.ts` have zero imports, so this needs no phone.

### What a beat change actually does

`CinematicPlayer` rewinds the beat clock during render, `bt.value = 0`, and the scene
then builds its picture from:

```js
const n = bi.value, p = n - 1;
const tr = ease01(bt.value / 0.7);
mixStance(emoteHold(P[p], t), emoteLive(P[n], t, bt.value), tr)
```

**L1 — a blend starts from the pose that is on screen, never from `P[p]`.**
`P[p]` is the pose the *previous* beat was heading toward, not the one being drawn. Tap
before that blend finished and the figure covers the whole remaining distance in one
frame. The jump is `(1 − tr_reached) × the gap`, which is precisely why it gets worse
the faster the reader taps — and why the reader described it as tap-rate dependent.

**L2 — the gesture's own clock restarts too.** `emoteLive(code, t, bt)` uses `bt` as the
gesture's local phase, so a hand halfway through a swing snaps back to the start of that
swing *even when the blend fraction was already complete*. This is why the worst measured
case was a tap at exactly 0.70s — the blend was done and the gesture was not.

Both are fixed by the same three-line helper in `cinematicKit`: `useHeld()` keeps the last
stance the scene emitted, `carryFrom()` makes it the next blend's source, `keepHeld()`
records it. The first frame of a new beat is then *identical* to the last frame of the old
one, so it cannot pop at any tap rate — the two frames either side of the change are the
same picture.

**L3 — a figure turns, it does not mirror.** `pose(s, x, ground, k, dir)` takes `dir` as a
raw ±1, and 30 lessons flip it. Flipping the sign inverts the whole man between two frames:
measured at 31 units, and unlike L1 it happens *however patiently* the reader taps. `facing()`
eases the sign through zero so he turns through a profile, which is what a body does.

### The numbers

| | before | after |
|---|---|---|
| lessons that teleport on an early tap | **97 of 112** | **0** |
| median worst one-frame limb move, fast tap | 24.9 units | **1.3** |
| worst single case | 40.5 (a wrist) | under 8 |

A limb travelling naturally covers about 3 units a frame; the patient-tap worst across the
library is 3.5. The threshold is **8** — comfortably above honest motion and comfortably
below a teleport. `check-smooth` is a **zero**, not a budget: the fix is mechanical and
there is no reason for a new scene to reintroduce it.

> **The general rule this is an instance of.** Any value driven by `bt` is discontinuous at
> a beat change, because `bt` is discontinuous at a beat change. If a scene interpolates
> `lerp(TRACK[p], TRACK[n], tr)` for a prop, that prop has the identical defect — it simply
> has no limb for the checker to measure. When you add an animated track, ask what it does
> if the reader taps at 0.3s, and if the answer is "jumps", carry the value the same way.

### L5 · Every scalar track carries, not just the stance

That warning stood in this file for weeks and was correct the whole time, and nothing
acted on it, because a rule with no number attached is a note. The same reader came back:

> *"the transition from an animation and words to a question usually has a glitch or not
> a smooth animation… after an animation, and it's just information, and then when you
> click the screen, it's a kind of glitch or a skip in frames."*

L1–L3 were all in force and `check:smooth` was green at zero. It was green because it
**draws the figure at a fixed `x = 200` and measures limbs relative to the pelvis** — so
the one track it can never see is the one that moves the whole man, and 89 scenes were
interpolating that plus 173 other things:

```js
fig:  pose(s, lerp(X[p], X[n], tr), …)      // where he STANDS
film: lerp(FILM[p], FILM[n], tr)            // a prop's opacity
shut: lerp(SHUT[p], SHUT[n], ease01(seg(tr, 0.4, 1)))
```

Every one of those starts at `T[p]` — the value the previous beat was heading toward,
not the value on screen — which is L1 exactly, with no limb attached. Replayed against
the real tracks: **49 of 262 over the 8-unit line, worst 166 units** in
`metaphysics7`. Driven in a browser on the real page, tapping every 320ms, the ankle
moved **226px between two frames** — the man crossing 60% of the stage in one frame.

**`carry` is `lerp` with a memory**, and it takes the same three numbers plus the slot
to remember them in:

```js
lerp(X[p], X[n], tr)   →   carry(cv, 0, n, X[p], X[n], tr)
```

`useCarry(N)` once per scene declares the slots; `scripts/carry-tracks.mjs` did the 262
existing sites and `check:smooth` fails a scene that grows a bare one back.

**The multiplier goes INSIDE the carry.** The house pattern for "only what changed
re-draws itself" (C20c / H58) is `lerp(F[p], F[n], tr) * (fFade ? grow : 1)`, so the
product is what reaches the screen. Carry the bare `lerp` and you remember a value that
was never drawn: interrupt a fade-in at 0.10 and the next beat — which has nothing to
fade, so no `grow` — resumes at 0.29 and the prop pops brighter on the tap. Pass it as
the last argument instead.

| | before | after |
|---|---|---|
| worst prop/position teleport, replayed | 166 units | **under 8** |
| worst measured in a browser, `metaphysics7` ankle | 226.1px | **20.5px** |
| …and that 20.5px is at a beat change | yes | **no** — the bar does not move on that frame |

The residue is honest: a figure crossing 260 stage units in under a second genuinely
moves that fast, and with a *patient* tap the worst frame is larger still (29px) and also
mid-beat. **That is the test for "is what is left a defect":** if the worst frame does
not coincide with a beat change, it is staging, not a teleport.

### L6 · The stage may not resize when a question arrives

The largest one of these was never in a scene at all, and it is the one the reader named
first — *"from an animation and words to a question."*

`ChoiceCards` and `DragScale` were siblings of the stage inside `body`, so the flex split
ran `stageWrap: 42`, `deck: 50`, `tapLayer: 8` **over whatever height was left after the
answer control took its own**. A control is about 74px, so the stage lost 42/100 of it —
34px — on the single frame a question beat mounted, and got it back on the frame the next
beat unmounted it.

The stage does not merely move when that happens, it **rescales**: `fit` is
`min(w / STAGE_W, h / bandH)` off the measured box, so the entire picture stepped about
12% between two frames, twice per question — and once more each way, because `boxSize` is
React state rather than a layout value, so one frame draws the old scale inside the new
box before the snap. A camera cut nobody wrote, moving every pixel at once.

**So the answer control and the deck are ONE box.** `styles.lower` carries the flex
weight; the control comes out of the deck's 50, never out of the stage's 42. The stage is
now 42% of the body on every beat of every lesson.

Measured in the browser, every lesson reports **one** stage-clip size for its whole run —
`361×341` for `metaphysics-being-7`, `390×287` for `aesthetics-aesthetics-12`. Two sizes
in that list is this defect, back.

> A control whose height is not constant (a card label that wraps to three lines) still
> changes the *deck's* room and never the stage's. That is the right place for it to
> land: the deck is text with `overflow: hidden` and no measurement depends on it, while
> the stage is what every camera shot, every band and all 132 must-see boxes are
> computed against.

### L7 · When a lesson gains a new way to move, the checker gains one too

`check:smooth` was green through all of L5 and L6 because it models the figure and
nothing else — the same shape of failure as the four browser harnesses in §21, where a
new way to *answer* a question left the sweep quietly measuring less. It now replays
each scene's declared tracks out of its script as well, and asserts the stage is a
constant fraction of the body.

If you add a track that is not `lerp`/`carry` over a `BEATS.map` array — a spring, a
value read from a gesture, anything with its own clock — say so in the scene header and
add the measurement in the same commit. A budget nobody executes is not a budget.

### L8 · A rule that can be renamed out of existence is not a rule

L5 shipped, reported **148 scenes carry every track they interpolate**, and was wrong
about 38 of them. The detector matched `lerp(NAME[p], NAME[n], …)`; every one of those
38 scenes had written

```ts
const L = (a: number, b: number) => { 'worklet'; return lerp(a, b, tr); };
…
boxesOn: L(BOXES[p], BOXES[n]),          // ← identical arithmetic, invisible
```

— the same call with two arguments instead of three and a one-letter name. Neither
`check-smooth` nor `carry-tracks.mjs` could see it, and **169 tracks across 38 scenes
were blending straight off `T[p]`** the whole time the file said they were not.

Three things are worth taking from it, in order of how much they cost:

- **It was the CURRENT house idiom.** The newest lesson in all six branches used the
  alias, so anyone doing the right thing — copy the best recent exemplar — inherited
  the exact defect the exemplar was supposed to have fixed. A defect that spreads by
  imitation outruns one that spreads by accident.
- **The detector must read the SHAPE, not the spelling.** No scene may declare a local
  lerp alias at all now, and a track lerped out of an array-of-arrays
  (`lerp(LOCKS[p][0], …)`) or off endpoints derived from a track
  (`lerp(P[p] > 0 ? 1 : 0, …)`) is caught too. Five of those survived the codemod and
  were carried by hand.
- **Comments are not code.** The hardened detector's first run reported a scene as
  defective because the note explaining why a track had been carried by hand *quoted
  the call it was explaining*. Anything that greps for a shape has to strip comments
  first, or it will eventually find itself.

Counter-test a detector before trusting it: put the defect back, watch it fail, take
it out again. A green checker and an absent one are indistinguishable from the outside.

---

## Group M — the narrator is a character, and the character is passive-aggressive

Group J says *how* to write a sentence. This one says **who is saying it**.

The words sit under a figure who is plainly the one speaking them, and until now he
had no manner at all — he explained things pleasantly and identically for 114
lessons. A voice costs nothing to add and is most of what makes an app feel like it
was made by someone. The voice chosen is **dry, faintly put-upon, fond of you and
tired of his subject**: a man who has explained Kant before and will explain him
again, thanks.

The reference implementation is **aesthetics 1** — Kant needed a whole book to say
you don't want to eat a sunset, Hume's fix for taste is suspiciously tidy, and a
private feeling has the nerve to summon eight people to agree with it.

**M1 — the barb lands on the subject, never on the reader.**
He may be tired of Kant. He may never be tired of *you*. "He needed a whole book to
say that" is the voice; "take your time" aimed at someone deciding between two cards
is not, and at the scale this ships it is just an app being unpleasant to a stranger.
The test is mechanical: name who the sentence is at the expense of. If the answer is
the reader, rewrite it.

**M2 — it is what he doesn't say.**
Passive-aggression is implication. *"Philosophy has been working on why for three
hundred years. No rush."* never calls anyone slow. Stating the insult outright is
sarcasm, which is a different and much cheaper thing, and it dates badly on a second
reading — which every reader who repeats a lesson will give it.

**M3 — the information survives the attitude.**
Delete every dry aside and the beat must still teach exactly what it taught before.
The manner is a layer over a complete lesson, never a substitute for a clause of it.
If cutting the joke also cuts the point, the joke was carrying teaching weight and
the beat is now worse than the plain version it replaced.

**M4 — one barb a beat.**
Two is a comedian; one is a person. Most beats should have none at all — the voice
reads as character precisely because it is intermittent, and a narrator who lands a
zinger every four seconds is exhausting by lesson three.

**M5 — three places stay straight.** The summary **points**, any **quote**, and the
**explanation after an answer**. These are the moments the reader is being told the
truth and has to be able to trust the app flatly: the payoff they are meant to walk
away with, someone else's actual sentence, and the verdict on a choice they have
already committed to. An explanation may be dry about the *losing idea* — *"Stronger
is not the difference. A toothache is strong too."* teaches why the axis was wrong —
but never about the person who picked it. The summary's **closing** line is the
exception and the release valve: that is where he gets the last word.

**M6 — the body agrees with the voice (A1, applied to tone).**
A figure standing there explaining cheerfully underneath a dry line undoes it. The
put-upon poses are `SIGH` in `cinematicKit` — folded arms, a shrug, a hand on the
hip, a hand to the head — and they are codes into the **wide** emote library,
because not one of the seven narrator gestures can fold its arms.

Three things learned putting them on: **in profile a hand on the hip is a bulge at the
waist**, indistinguishable from the neutral stand, so `SIGH.HIP` costs a must-box
re-measure and buys nothing on a still beat. A **shrug is the right pose for a
question beat** — the reader is reading two cards rather than watching, and "well,
that is what the man said" is exactly the attitude to hold while they decide. And the
**summary beat covers the stage**, so a pose written there draws nothing at all: the
sign-off is the closing *line*, and it has no body to deliver it with.

The first two came off a contact sheet (Part 3); the third only came off a
screenshot of the real screen, because a pose that is never drawn is numerically
perfect.

**None of this is countable, and that is stated rather than faked.** A checker cannot
tell dry from mean, and a "sarcasm budget" would be a number that measured nothing.
Group M is judgement, like J5 and J7 — with one thing the machine *does* hold: pose
codes are written as literal digits in a script, never as `SIGH.FOLDED`, because
`check-smooth` reads the pose track out of the source with a regex and would score a
named constant as pose 0 — quietly reporting a lesson it had not actually replayed.

---

## Group N — the figure has a vocabulary, and half of it was behind a locked door

A beat carries one pose code in `p:`, and `emoteAny` resolves it. Which number you
write decides whether the reader sees anything at all, and until this group was
written the answer was usually no.

### N1 · A HELD code shows the pose an action ENDS in

`emoteAny(code, t)` calls `actStance(code − 99, t, 1)` — u pinned to 1. Every one-shot
in `moves.ts` is authored to begin and end at the neutral stand, so that consecutive
actions meet without a cross-fade. Hold one and you get the stand.

This is not a hypothetical. Counted across every `*Script.ts` in the app, the only
codes above 99 any lesson used were **128, 129, 130, 137, 139, 141, 144 and 147** —
eight codes across seventy-five beats, and every one of them from the handful of
actions that loop on `t` and ignore `u`. Ninety-odd one-shots and thirty prop actions
were unreachable, and nothing reported it: a script asking for SHRUG type-checked,
validated, rendered, and drew a figure standing still.

### N2 · The three bands, and which one you want

| code | what it does | use it when |
|---|---|---|
| `0–99` | rig's 49 gestures, held | the beat is *about* an attitude |
| `100–195` | an action from `moves.ts`, **held at its end** | you want the pose it finishes in — a posture transition like `191` (kneel down), or one of the loops |
| `158–177` | the **living holds** — they loop on `t` for ever | the figure is *being* someone for the length of the beat |
| `300–395` | the same action **played once** as the beat opens, then settled | the figure *does* something and then carries on |

The two you will reach for most:

- **`167` — talking with the hands.** A lesson beat is somebody talking, and this is
  what talking looks like from the neck down. It is the default for a narrated beat
  with nothing else going on.
- **`378` — shrug**, `379` the idea, `380` weigh it up, `389` refuse. Played, not held.

The arithmetic is `hold = 99 + n` and `play = 299 + n` for action *n*, and it is
off-by-one bait — this table was first written with all five numbers one too high.
Call **`holdCode(n)`** and **`playCode(n)`** instead; `check-moves` re-derives both
against the shipping resolver, so a wrong number here fails rather than draws the
wrong gesture. (The anchor that settles it: `128` is the code every existing script
uses for ARMS LOOSE, which is action 29, and 99 + 29 = 128.)

### N3 · A played action is smooth because its held twin is its END pose

`carryFrom`/`keepHeld` blend the outgoing beat against `emoteAny(code, t)` while
`emoteAnyLive` drives the incoming one (group L). Because the held value of a 300 code
is *identical* to its 100 twin, the two agree the moment the action finishes and there
is nothing to pop. An action that ends somewhere other than the stand — 1 sits down,
92 kneels — therefore holds its destination, which is exactly what the next beat should
inherit.

`PLAY_SECONDS` is 1.5, the window rig's own speech accents already decay over. It does
**not** repeat: a gesture that restarted every 1.5 s is a tic.

### N4 · Two forearms on a 12-thick torso are no forearms at all

The single most repeated defect in this library, and it passes every numeric check
because nothing is out of range. Hands folded at the natural-looking `(8, −19)` sit
almost on the spine; both forearms then lie along the torso in the same ink and the
figure renders **with no arms**. Rig's `arms-crossed` carries the corrected targets —
`(18, −22)` and `(13, −17)`, forward of the body, where each forearm is a horizontal
against open paper — and any new pose that folds an arm must clear the torso the same
way. It has now been made three times: once in rig, once in a completion screen, and
twice more in the same afternoon in `62` and `74`.

Only the contact sheet finds it. `node scripts/sheet-moves.mjs act:79 hold:68
posture:17` draws twenty frames in plain Node in about two seconds.

### N5 · Sheet a living hold with `hold:`, never `act:`

59–78 ignore `u`. `act:63` therefore draws the same frame twenty times and produces a
sheet that *looks* checked; `hold:63` sweeps the clock across twelve seconds, which is
also the only way the rare events are seen at all — the re-settle in `62` fires about
every ten seconds and the scratch in `66` about every eight. `check-moves` registers
them the same way, under the name `hold N`.

---

## Group O — the reader answers first, and only then is told

Reported by a reader, in their own words: on a two-answer question *"even before you
press on one, it says the not quite thing that would happen if you got it wrong. This
is not supposed to fill up until the user answers."*

That is one rule with three faces, and it is worth stating separately from the rest of
group H because it is the only rule about **time** rather than about layout: the same
pixels that are correct after a pick are a defect before one.

### O1 · Nothing from the reveal may be legible before the pick

A graded beat owns three things the reader must not see until they have committed:

- **the verdict** — `Correct`, `That's the one`, `Not quite`;
- **the explanation** — the `explain` string, in whole or in part;
- **the answer state on the options** — the green/red faces, the ✓/✕ seals, the
  lift on the true card, the crumple on the discarded one, the `+10 XP`.

Before the pick, a graded beat shows exactly: the kicker (`QUESTION · +10 XP` or
`YOUR TURN`), the prompt, the answer controls in their neutral state, and the nudge.
Nothing else.

**Why it is a rule and not a preference.** It is a spoiler, first — a reader who can
read the explanation can score the question without thinking, which is the whole
lesson format defeated, the same way `ChoiceCards` shuffles because the true card was
the left one 130 times out of 130. And it is a *staging* fault second: a panel that is
already full has nothing left to do when the answer lands, so the moment the lesson
has been building to arrives and nothing happens. The reader noticed the second one
before the first — "it doesn't look right" came before "I could see the answer".

### O2 · The gate is `answered`, and it is one expression

Every reveal hangs off `picked !== null` — passed down as `answered` — and nothing
else. Not a timer, not a beat index, not "the animation has started". There are five
places that own this and they all already do it: `Choices` and `InteractPanel` in
`cinematicKit`, `Reveal` inside them, `ChoiceCards`, `DragScale`, and the two
bespoke players (`ArgumentFightLesson`, `PremisesBuilderLesson`).

A scene that draws its own answer state does the same, through its own helper:

```tsx
const wrong = (id: string) => answered && picked === id;   // aesthetics35, metaphysics31
const right = answered && g.correct;                        // aesthetics5, political2
```

**A helper without `answered` in it is the bug this rule exists for.** `wrong(id)`
that reads `picked === id` alone is correct today only because `picked` is null until
the pick — it stops being correct the moment anything else writes to it, and it reads
as an accident either way. Put `answered` in the helper.

### O3 · Mount it, do not hide it

A reveal that is rendered at `opacity: 0`, or behind a `height: 0`, is still there:
its text is in the accessibility tree and a screen reader says it out loud. This is
not hypothetical in this codebase — `ChoiceCards` carries the same note about its ✓
seal, which was measured reading "It did not rain ✓" from the moment the card
appeared. Return `null` until answered; do not style it away.

### O4 · The readout on a drag is NOT a reveal

`ScaleZone.reads` — the word above the knob that changes as it travels — is lesson
copy under group J and is *supposed* to be visible from the first frame. It is what
makes a drag teach rather than merely slide: the reader finds the boundary by hunting
for the flip. What must stay hidden on a drag beat is the same three things as
everywhere else: the verdict, the `explain`, and the mark showing where the right
answer was.

### Verifying it

`npm run check:spoiler` steps every wired lesson in a browser, and at each graded beat
reads the whole visible page **before** answering, comparing it against that beat's own
`explain` and against the verdict wording. It needs Metro and a headless Chrome — the
header of `scripts/check-spoiler.mjs` has the exact commands.

Two things about it that are load-bearing, both learned by getting them wrong:

- **The preview route must exist before Metro starts.** Expo Router builds its route
  table at bundle time, so a route written afterwards serves "This screen doesn't
  exist" — which renders no buttons, so every lesson reports "could not be answered"
  and the sweep finishes GREEN having measured nothing at all.
- **A short sweep is not a clean sweep.** Anything the harness could not step to the
  end is reported as a failure of the check, not as a pass, and exits non-zero. The
  first version of this file reported 130 lessons clean while rendering a 404 for
  every one of them.

---

## Group P — the figure and the things it holds

A reader described the carry in The Puzzle of Equality without needing any of the
vocabulary in this file:

> *"the stickman carries an object, it doesnt look good, his arms arent out, the
> object is just floating and it just disapears all the suddon."*

Three complaints, one cause, and `interact.ts` had already written it down before
any of these scenes existed: **`pose()` hands a scene a Bundle of transforms and
never exposes a joint, so a scene drawing a box in someone's hands has no way to
ask where the hands ARE.** It hard-codes a rectangle at a position that looked
right once, and the moment the figure breathes, walks or changes pose the object
drifts out of the grip. Every prop in the app that a figure "holds" was really a
prop the figure stands next to.

political-8 is the worked example, and it is six lines:

```
carried:  { position: 'absolute', left: -17, top: 444, ... }   // a fixed height
carryX:   fx + DIR[n] * 30                                     // a fixed offset
carry:    lerp(CARRYV[p], CARRYV[n], tr)  → opacity            // a fade
```

- `top: 444` never moved, so the crate floated while he did — **"just floating"**.
- The figure walked on `travelStance`'s WALK gait, arms swinging through the
  cycle, with a crate beside him — **"his arms arent out"**.
- `carry` was 1 on one beat and 0 on the next, so the crate came out of nothing
  and went back to nothing — **"it just disapears all the suddon"**.

### P1 · A held object's position comes from the HAND, every frame

`gripAt(stance, placed)` returns the midpoint of the two wrists in stage units,
solved from the live Stance — so it tracks the breath, the walk cycle and every
pose change for free. `handAt(stance, placed, which)` does one hand. Both are in
`interact.ts` and both are worklets, so they belong in the same
`useDerivedValue` the scene already runs.

**Anchor the object by the edge that touches.** A box rests ON hands, so its
BOTTOM edge goes at the grip point (`top: -BOX_H` on a centred absolute box), not
its centre. political-8 was first written with centres and the crate came to rest
eleven units above the floor at the other end of the journey.

### P2 · It is never an opacity. It is a position between two places

```
position = lerp(where it rests, gripAt(...), held)
```

`held` is 0 when the object is on its pile, its table or the ground, and 1 when it
is in the hands. Everything in between is the lift or the set-down. Nothing about
a held object ever fades.

That single line also gets the pick-up and the put-down for free, which is the
half the reader noticed: an object that is always somewhere cannot appear out of
nothing, and the frames where `held` is between 0 and 1 ARE the reach.

**Change `held` at the DESTINATION, not during the walk.** Pack it into the last
quarter of the move (`clamp01((tr − 0.72) / 0.28)`) and the trip reads as "walk
over, lift, walk back, put down". Spread it across the whole move and the object
slides into his hands somewhere in the middle of the room.

### P3 · The arms come out, and the legs keep walking

`carryHands(stance, amount)` pins both fists forward-low under the load and
leaves everything else alone, so a walk cycle keeps its legs, its bob and its
lean while the arms stop swinging. Blend it by the same `held` fraction and the
arms come out as the weight arrives.

The targets are rig emote 42's — 18 and 26 forward at y +2 — and they are not
arbitrary: far enough out that the forearm has paper behind it rather than torso
(B11b / the folded-forearm defect), low enough that nothing goes near the head.

### P4 · If it came off a stack, take it OFF the stack

political-8 drew three crates on the spare pile AND a fourth in his arms, so the
stack never got shorter. It draws two now, and the crate he carries is the third —
the same object, the same 40×22, resting on top of them until he lifts it. A
carried object that is a different size from the one it came from is a different
object, and the reader is entitled to notice.

### P5 · What is measured

`npm run check:hold` sweeps every cinematic lesson in a browser and looks for
props that RIDE the figure — an element whose offset to the figure's centre stays
fixed while the figure walks. For each one it asks the two questions above:

- does it **pop** — appear or vanish between adjacent beats rather than moving to
  or from somewhere?
- does it sit at the **grip** — within a hand's reach of the figure's own hands?

A prop that rides the figure and passes both is a held object. One that fails
either is the defect a reader called "cheap".

**Getting that to mean anything took four narrowings, and each was caught by the
check's own counter-test rather than by thinking harder.** `SELFTEST=1` plants a
real object on the figure — in a hand on even beats, adrift on odd ones, under one
identity — and requires the probe to report every adrift one.

- *Overlapping his body box* flagged **six lessons in the first ten**: a figure
  walking in FRONT of a chart overlaps it, and so does every board and fence he
  stands against. A held object is also SMALL (under 40% of his body box) and
  PAINTED IN FRONT of him, which is asked of the browser's own hit-test stack
  rather than reasoned about.
- Then it flagged the crate he had just **set down**. That object is small, in
  front, overlapping him and nowhere near his hands — every condition, and
  correct. An object on the floor has its underside level with his feet.
- And **his feet are not the bottom of his box**: an ankle joint is a disc centred
  exactly on the ground line, so the box hangs half a joint below it. Measured at
  the box, political-8's crate read as floating 29px from a hand while sitting
  perfectly on the ground. `Stickman` gives the ankles a testID for this, as it
  now does the fists.
- Then it would have flagged every **speech bubble**, which correctly appears and
  goes. An element only qualifies at all if on at least one beat it is genuinely
  IN a hand — then both questions are about a thing he demonstrably holds.

The self-test also has to validate its own aim: a plant on a faded figure, or one
too big for the size gate, or at a spot where the figure's stacking context sits
above it, is a plant the probe is RIGHT to ignore. Counting those made it report
blindness that was its own.

---

## Group Q — no lesson may read as the one before it

Every other group in this book asks whether ONE lesson is right. This one is about
the only thing a reader who works through a branch actually experiences, which is
lesson 17 arriving straight after lesson 16.

**F43 has asked for this since the card era** — *"don't let two consecutive lessons
feel identical"* — and for its whole life it was a sentence with nothing behind it.
It became a rule when it was asked for in the plainest possible terms:

> *"no two lessons by each other can be the same … I always want lessons to present
> information/animations/and everything else in lessons to be done in a unique way,
> not just copying over and over again."*

`npm run check:echo` measures three things, and each threshold below is the CURRENT
MEASURED WORST rather than a number chosen to feel strict.

### Q1 · Two neighbours may not be the same machine

The channels a script declares ARE the scene's moving parts. `[p, x, rule, fact,
concl, pick]` is a board being written on; `[p, hotel, shift, dbl, live]` is a
building emptying. Adjacent lessons in reading order may share no more than
**0.50** of their channel names by Jaccard overlap, which is where the corpus
already sits (epistemology-31 → 32). Ordinary shared machinery — `p`, `x`, `live`,
`pick` — costs about 0.2 on its own, so the budget is really "two distinctive
channels in common, never three".

The two pre-player lessons declare no beat interface at all and are exempt by
having nothing to measure. Q1 asserts there are only ever two of them, so that
cannot quietly become a way of opting out.

### Q2 · Two neighbours may not ask the same question

The content words of both graded prompts, compared the same way. Ceiling **0.20**.
This is the axis the reader meets with their thumb rather than their eye: two
lessons running "tap the claim that actually follows" back to back are one
interaction wearing different nouns, however different the art above them is.

### Q3 · Every lesson says what its picture is, and no two say the same

H64 already requires the author to be able to finish *"the picture is X, and over
the lesson X does Y"* **before** writing any beats. `// Theme:` is that sentence,
in the file, on one line, in caps — so it can be compared with its neighbours
instead of living in somebody's head.

```ts
// Cinematic logic-arguments-16, "After It Is Not Because Of It"
// Theme: SIX MORNINGS IN A ROW, AND THE ONE WHERE NOBODY CROWED.
```

Three things are checked: the count only ever goes UP (`THEME_FLOOR`); no two
lessons anywhere declare the same picture; and neighbouring pictures share at most
**two** nouns. Two is a coincidence — "two", "line" and "one" turn up everywhere.
Three is the same drawing described twice.

### What Q deliberately does NOT check

The house shape. 7–11 beats, exactly two graded questions, one quote, one summary
and it is last (H52) are supposed to be identical everywhere, and
`validate-cinematic` enforces them. **Sameness of STRUCTURE is what makes 168
lessons one product; sameness of PICTURE is what makes them a chore.** A checker
that confused the two would push authors to break the wrong thing.

### The practical consequence when writing one

Before the beats, read the lesson BEFORE yours and the lesson AFTER it in the same
branch — `npm run check:echo` prints neither, so this is a real step. Write your
`// Theme:` line first. If it shares its central noun with either neighbour, you
have not got a new lesson yet, you have got a variation.

---

## Group R — when the answer is a quantity, not a pick

`drag` (§17) opened this door and then stood in it alone for twelve lessons. The
reader asked for the rest of the room in as many words:

> *"I want to try out for these 3 new lessons that the questions below the stickman
> have not just boxes that you tab, but I want a similar way the learning app
> Brilliant does their questions. With interactive questions, leavers being moved,
> line graphs that you slide … lines that you slide a bar from one side to the
> other or the middle."*

There are now **five** analogue controls beside the two-card deck, and they are not
five skins on one widget. Each answers a differently SHAPED question, and picking
the wrong one is the mistake this group exists to stop.

### R1 · Pick the control from the shape of the claim, not from variety

| The claim is… | Control | It reads |
|---|---|---|
| one quantity on a scale | `drag` | `DragScale` — a knob on a rail |
| one of a few NAMED settings on a ladder | `lever` | `LeverPick` — an arm with detents |
| what happens to a thing AS another changes | `plot` | `ShapePlot` — a curve you draw |
| how one thing DIVIDES between two | `split` | `SplitBar` — a seam in one bar |
| two INDEPENDENT yes/no questions | `field` | `FieldPick` — a token on a pad |
| anything else, including most of them | `cards` | two `ChoiceCards` |

Read the middle column as a set of tests, not a menu:

- **`lever`, not `cards`,** when the answers are ORDERED — could not have · could,
  if you had wanted to · could, full stop. Cards throw the order away, and the
  order was half the content.
- **`plot`, not `drag`,** when the reader believes something about a SHAPE. "How
  much aura is left" is a number; "how the aura goes as the copies multiply" is a
  curve, and a rail cannot hold one. Four cards describing four curves makes the
  reader choose between four sentences instead of committing to a shape.
- **`split`, not `drag`,** when giving one side more has to visibly take it off the
  other. A rail with a label at each end says "more this way" and says nothing
  about what you gave up.
- **`field`, not two questions,** when the whole lesson is that the two questions
  come apart. Presentism, the growing block and eternalism are three of four
  corners; non-domination is the corner where "left alone" and "nobody holds that
  power" disagree. Ask those as a pick and you have quietly answered the
  interesting half.

**`cards` is still the right answer most of the time — 155 lessons to 44.** An
analogue control on a claim that genuinely has two sides is a worse question with
more moving parts.

### R2 · The readout is lesson copy, not scoring furniture

Every one of the five carries a live word above it that changes as the reader
moves: `reads` on a `ScaleZone`, `LeverStop`, `PlotShape`, `SplitZone` or
`FieldQuad`. That string is under **group J** like any other sentence the reader
sees — short, plain, one thought.

It is what makes the control teach rather than merely slide. The reader hunts for
the description that matches what they already believe, and finds out on the way
that what they believed has a shape, a boundary or a price.

So write the wrong readouts as carefully as the right one. "the crank: all in, all
kept" and "the dogmatist: nothing gets a hearing" are the two failure modes of
open-mindedness, named, and a reader who never lands on them has been taught less.

### R3 · Grade by REGION, never by hitting a number

None of the five compares a float to a target.

- `drag`, `lever`, `split` — the value falls in a **zone** or on a **detent**.
- `plot` — the drawn curve is scored to the **nearest profile** by RMS, so a reader
  who draws a cliff gets "a cliff" whether it falls at 0.9 or at 0.7.
- `field` — the token is in one of **four quadrants**.

A tolerance dressed up as precision is a worse question, not a stricter one. The
thing being tested is whether they think the value collapses, not whether they can
place a thumb.

### R4 · A wrong region has to be a position somebody holds

H66 applies to every zone, stop, quadrant and profile, and it bites harder here
because the reader can VISIT them. A quadrant labelled "nonsense" is a quarter of
the pad that punishes exploring. Every wrong region should be somewhere a real
argument lives — the happy slave, the shrinking tree, the crank, the sharp
boundary nobody can locate — and the explanation should say what is wrong with it.

### R5 · The control is part of the DECK, never a sibling of the stage

All five render inside `styles.lower` in `CinematicPlayer`, with the choice deck.
This is L6 and it is not negotiable: a control that is a sibling of the stage takes
its height out of the stage's flex share, and the stage does not merely move when
that happens — it **rescales**, because `fit` is computed from the measured box.
The whole picture steps about 12% on the single frame a question mounts.

`npm run check:smooth` asserts, by reading `CinematicPlayer.tsx`, that every one of
the six control tags appears after `styles.lower`, and that the prompt hint names
every one of them. Add a seventh control and add it to both lists in the same
commit.

### R6 · A new way to answer means a new way for the harness to answer

This is the rule the browser harnesses have now learned four times (§21), and each
time the failure looked identical: a sweep that measures less and says nothing.

- CDP mouse events do not drive a React Native Web `Pressable`; only a synthetic
  `click` does.
- Deck choices are bare `Pressable`s, so `[role="button"]` alone finds half the
  buttons in this app.
- A `drag`, `lever`, `plot`, `split` or `field` beat has **no button anywhere**, so
  a harness that only knows how to click measures 6 beats of 9 and reports them as
  measured. A short sweep is indistinguishable from a clean one unless something
  counts.
- `react-native-gesture-handler` listens on POINTER events, and needs several
  `pointermove`s rather than one jump — `onUpdate` integrates `translationX`, and a
  single leap does not clear the pan recogniser activation check.

So: every control carries a `nativeID` (`drag-strip`, `lever-arc`, `shape-plot`,
`split-bar`, `field-pad`), and **all four harnesses share one snippet**,
`scripts/lib/answerctl.mjs`, which knows how to work each of them. Adding a control
means adding its id there, in the same commit as the control.

### R7 · If the scene follows the control, it follows it only on its own beat

The knob, seam, arm, curve mean and token live on the PLAYER as `dragPos` (and
`dragPos2` for the pad's second axis) and reach the scene through `SceneApi`. A
scene that reads them makes the reader move the picture rather than a widget beside
one — the tower comes apart, the painting cleans, the crowd grows while every life
in it shrinks. One gesture, on the UI thread, with no React render in between.

The condition is the beat: the scene reads `dragPos` **only on its own graded beat**
and the script's own track everywhere else. One value, two sources, and the picture
never disagrees with whichever is in charge. Derive that flag from the beat rather
than declaring a channel for it —

```ts
const PULL = BEATS.map((b) => (b.interact?.lever ? 1 : 0));
```

— so it cannot fall out of step with the control it is about, and it costs
`check:echo` nothing.

**Hand over THROUGH `carry`, not around it.** The obvious spelling is wrong:

```ts
pub: pulling ? dragPos.value : carry(cv, 2, n, PUB[p], PUB[n], tr),   // pops
pub: carry(cv, 2, n, PUB[p], pulling ? dragPos.value : PUB[n], tr),   // hands over
```

The first swaps the value on the single frame the beat changes, from wherever the
previous beat left the track to wherever the control happens to start — which is
exactly the discontinuity L1 and L5 exist to stop, on a track with no limb attached
for `check:smooth` to measure. The second eases from the remembered value into the
live one over the transition and then tracks it exactly, and it keeps the carry slot
written, so leaving the beat is smooth too.

### R7c · The stage MOVES with the control — it is not optional any more

R7 says that if a scene follows the control it follows it only on its own beat.
For a long time that was the whole of it, and following was a nicety: **30 scenes
of 186 moved**, and the other 150 held perfectly still while the reader dragged a
knob underneath them. The reader found the difference and named it:

> *"I want something to change within the animation above the stickman, like it
> reacts during the user moving something, I saw you did this for one lesson and
> it makes the lessons better."*

That is the difference between moving a WIDGET and moving the PICTURE. A control
with a dead stage is a slider with a lesson printed next to it. `npm run
check:react` counts it, and the budget only goes down.

**The wiring is three lines, and the judgement is one.** The boilerplate:

```ts
const REACT = BEATS.map((b) => (b.interact?.split ? 1 : 0));   // beat-derived (R7)
…
const reacting = REACT[i] === 1;
```

and then the one decision — **which track the control drives**:

```ts
door: carry(cv, 1, n, DOOR[p], reacting ? dragPos.value : DOOR[n], grow),
```

Four things make this cheap and safe rather than a rebuild:

- **Use a track the scene ALREADY carries.** Almost every scene has one whose 0→1
  means roughly what the control's 0→1 means — a door, a meter, a needle, a bar,
  how many of something are drawn. New art is rarely needed; ethics-14's seam cuts
  a doorway through the wall both men built, and the wall was already there.
- **Hand it over THROUGH `carry`, never around it**, for the reason R7 already
  gives: `reacting ? dragPos.value : X[n]` inside the carry eases in over the
  transition, and outside it swaps on the single frame the beat opens (L1/L5).
- **The mapping may be inverted, or a tent.** Drag toward *nothing is right or
  wrong* and the shared moral floor goes OUT (`1 - dragPos`). A lever whose MIDDLE
  setting is the case gets `1 - Math.abs(dragPos * 2 - 1)`, so the second apple
  exists only at the setting that says there are two of them.
- **A `field` should drive BOTH axes**, or the pad is a rail with a spare
  dimension. epistemology-23 is the model: the mouth of the hopper opens across,
  the mesh tightens up, and the reader builds the machine the lesson is about.

**Some lessons should NOT do this, and that is a finding rather than a gap.**
aesthetics-16 asks what changed when you learned the painter was cruel, and the
answer is *the painting did not*. Wiring the canvas to the knob would teach the
opposite of the lesson — A1 outranks this rule.

**149 of 182 now.** The first pass took it from 30 to 123 and stopped at the
scenes that looked hard; going back through the remaining 59 one at a time found
that most of them were not hard at all, because the scene had already drawn the
thing the control is about and simply was not letting the reader touch it —
political-31's field is bare at *ask each herder to take less* and grows back at
*change what taking too much costs*; epistemology-12's three pipes ARE the lever's
three stops; aesthetics-31 takes strings off the instrument as the token moves
toward *very hard to play*; political-15's night lifts off the stair as it moves
toward *done in the open*.

**What is left is genuinely left.** Three shapes, and it is worth being able to
name which one a lesson is before deciding it is a gap:

1. **A ladder that is not a scale.** A lever whose stops are three unrelated
   diagnoses — *one ruler pressing down* · *an outside power* · *the many closing
   in* — has no quantity behind it, so any monotone track lies at two of the three
   settings. That is A1, and A1 wins.
2. **A track that is deliberately monotone.** metaphysics-2's `gone` carries a
   comment saying it may never come back, because a road the lesson has just
   finished proving is not there must not quietly return. Driving it would undo a
   fix.
3. **Nothing but the figure's own x**, where there is honestly nothing to move.

A fourth was tempting and is a trap: driving a value that a `withTiming` owns on
the JS side rather than a track the scene carries. aesthetics-8's canvas mode is
the case — the mapping is perfect (three stops, three renderings) and the plumbing
is a rebuild, not a wiring.

### R7b · The seam's position is the LEFT side's share, and six blocks read it backwards

`SplitBar` prints `pos * 100` under `left` and `100 - pos * 100` under `right`. So
a zone declared `upto: 0.34` is the region where the LEFT side holds about a third,
and `upto: 1` is where the LEFT side holds nearly all of it. **Write the high-`upto`
zone as the one where `left` wins.**

Read it the other way round and the readout contradicts the two numbers printed
directly beside it:

```
IN THE NOTES  34                    66  IN THE LISTENER
         "the sadness sits in the sound"        <- says the opposite
```

Six shipped blocks did exactly that. What is worth remembering is not the
convention but **why nothing caught it**: the types are satisfied, the control
works, the zone boundaries are legal, `start` is properly outside the correct zone,
and the lesson passes every check in Part 3. The only way to find it is to read the
sentence against the number. Some defects are a checker's job and some are a
reading's, and pretending the second kind does not exist is how they ship.

The fix is to swap the two LABELS rather than rewrite the prose — the readings are
usually right about the philosophy and wrong only about which end of the bar they
are printed at.

### R8 · Two graded beats, and they may not be the same control

H52 still says exactly two graded questions per lesson. Group Q says neighbouring
lessons may not ask the same question. Between them the working rule is simple:
**a lesson's two questions use two different controls, and a lesson does not use
the same control as either neighbour.** A branch that runs lever · lever · lever is
back to boxes you tap, wearing a nicer hat.

---

### R9 · The rotation: what a thumb is asked to do, lesson after lesson

R1 picks the control for one CLAIM. This is the other question, and only a reader
working through a branch ever feels it — does lesson 17 ask for anything my thumb
did not already do in lesson 16?

> *"I want that to be implemented into all the lessons on a good rotation. I still
> want a couple every now and then for the old way of answering below the
> stickman, and I also want ways to answer above the stickman too."*

`npm run check:rotation` measures three things, and each is a high-water mark:

- **The deck is not the default.** Two `ChoiceCards` was 47% of every question in
  the corpus, not because 47% of claims are either/or but because a deck is the
  quickest thing to write. It is **10%** now — 36 of 368 — and the ceiling has
  come down to 14% to hold it.
- **Neighbours differ.** Two lessons running in reading order should not both be
  answered by the same control. 133 pairs did, then 112; **27** now.
- **One question stays on the STAGE.** H65 already said one in the deck and one
  above the figure, and **36 lessons ask both of theirs below it** — every one an
  early lesson, which is exactly where the picture most needs to be the thing
  being answered. That budget is the "above the stickman" half of the work, and it
  is the half still outstanding: a stage question needs the SCENE to draw targets,
  so it is not a script-only edit like the ones below.

**The sweep is done: 127 lessons had no analogue control and 2 do now**, and both
of those ask both their questions on the stage, which is the other thing the reader
asked for. `node scripts/rotation-worklist.mjs --needed` prints whatever is left,
and `--stageless` prints the other list.

**Converting one deck question is a small, self-contained job** — script only, no
scene change, because the player renders whichever control the beat declares. The
order is: take the next lesson whose neighbour shares its control, read the claim,
pick the control from R1's table, and write the `reads` strings as lesson copy
(R2). Then rewrite the `explain`, because an explanation that says *"the other
card"* names nothing once the cards are gone — that is J9, and a conversion is the
commonest way to create one.

A conversion that reaches for a control the claim does not want is worse than
leaving the deck alone. The 36 decks that remain are the ones where a genuine
either/or was the honest shape.

---

### J10 · Plain enough to read on a bus

J1–J9 cap how LONG a sentence is, and the corpus passed all of them while being
unreadable:

> *"the wording in lessons it seems to be difficult to understand what I'm
> reading. It's a bit too cryptic and advanced… I like a philosophical text, but
> also simple to read, not something that takes a lot of effort to even try
> understand"*

Short sentences made of long words are still heavy, and — the bigger half — short
sentences made of SHORT words can point at nothing you can name. `npm run
check:plain` measures both, and both are arithmetic rather than taste.

- **Reading ease at least 55.** Standard Flesch. A named position counts as two
  syllables rather than five, because a reader learns `compatibilism` once and
  then reads it as one token; so does a philosopher's name. What the score then
  measures is everything else the sentence is doing. The corpus sits at 82.
- **At most 12% pointers.** `it · that · this · they · these · which` are how a
  sentence refers to something without naming it. A few are ordinary English.
  Above one word in eight the reader is holding a stack of unnamed things:

  > "Both of them arrived. Only one of them can find it again."

  Nothing in that is a hard word and nothing in it is nameable either. **The fix
  is never a longer sentence. It is to say the noun.** 218 pieces failed one test
  or the other; rewriting them moved nothing about what the lessons claim, which
  matters, because the picture has to keep doing what the text says (A1).

  A **prompt is exempt**, deliberately: I71 requires a question to point at
  something on the stage, and "Tap the one it changed" is doing its job. Pointing
  is a fault only when there is nothing to point at.

---

### D34 · No word on the stage may be too small to read

The stage fits a 400-wide design space into the box the player gives it:

```
fit = min(stageW / STAGE_W, stageH / bandH)
```

On a 390-wide phone the WIDTH binds at about 0.935 for most lessons — but a
lesson with a tall band is bound by its HEIGHT instead, and then everything it
draws shrinks, labels included. `logic-arguments-8` declared 8.5pt captions in a
493-unit band and they reached the reader at **5.1pt**.

That is not a small caption. It is what the reader reported as:

> *"the words in questions or the words in boxes or words in general above the
> stickman aren't visible. It's just blank boxes."*

**Nothing in the repo could see it.** The must-see sweep records every word that
reached the screen, so it reported those lessons as fully lettered — the words
WERE there, at a size that is a grey texture rather than a word. A checker that
asks "is there text" passes this every time; the question has to be **how big is
it when it lands**.

`npm run check:legible` enforces `declared × fit ≥ 8pt`. Only the sizes under the
floor were raised, so a scene keeps its typographic hierarchy: in `logic8` that is
two captions, and the 11.5–13pt body text was left alone. 338 labels across 147
scenes needed it, which is to say **the house style itself was too small**, not
one careless file.

---

### D35 · A word is legible or it is absent — never dimmed to a smear

D34 fixed the SIZE and the reader came straight back:

> *"I am still seeing that there are boxes that are blank and I cannot see what
> is in them, this still needs to be fixed."*

Size was one cause of three, and this is the second. Ghosting a whole layer to
push it into the background is ordinary staging and the scenes are right to do
it — but the layer usually has a caption inside it, and

```ts
opacity: 0.24 + 0.76 * spr        // the garden is a hint until it matters
```

puts INK on PAPER at **1.3:1**. That is a grey smear in the shape of a word which
will not resolve however hard the reader looks, and §19 already names the failure
in another part of the app: *"the same thing, dimmer is indistinguishable from a
rendering fault"*. A locked rank pin is drawn FLAT AND COOL rather than faint, for
exactly this reason.

**The fix costs nothing, because the driver is already there.** The caption comes
out of the dimmed layer into a sibling of its own, and rides the raw track instead
of the composed opacity:

```ts
const gardenStyle      = useAnimatedStyle(() => ({ opacity: 0.24 + 0.76 * S.value.spr }));
const gardenLabelStyle = useAnimatedStyle(() => ({ opacity: S.value.spr }));
```

`spr` is 0 exactly where the layer sits at its dim floor and 1 where the layer is
full, so the word is **absent** while the art is a hint and **arrives with it** —
and the unreadable band is crossed only while the fade is travelling, which is
what a fade is. Two things come free: no step at the crossover (group L), and the
answer stops being named before the question is asked (group O).

**Measured, not judged.** `npm run check:readable` composites every word over what
is actually behind it at the opacity it is actually drawn with, and then confirms
each suspect against the PIXELS of a screenshot — because walking a word's
ancestors for a background colour cannot see a sibling painted underneath, which
is how a two-state label is normally built:

```tsx
<View style={bolt}>                     {/* backgroundColor: PAPER */}
  <Animated.View style={boltFill} />    {/* backgroundColor: INK, grows */}
  <Text style={{ color: PAPER }}>TRUE</Text>
```

Reading upward gives paper-on-paper at 1.0:1; on screen it is cream on solid ink
and perfectly clear. A first pass called 205 words faint and the screen disagreed
about most of them. **Where a measurement needs a theory of what is behind a
pixel, take the picture.**

**And it measures the QUESTION as well as the picture, which it did not at first.**
The check scanned `#stage-clip` only — so it never once looked at the half of the
screen the reader answers with: the control's own labels, its live readout, the
prompt, the explanation. The reader read that half:

> *"for the new answering of questions, I have noticed a lot of the words are cut
> off from there"*

And there is a mechanism waiting for exactly that. A control takes its natural
height off the top of the lower box and the deck below it is `overflow: hidden`,
so a tall control eats the room the words were given. D27 caps an explanation at
290 characters on the reasoning that *"the deck holds ~290"*, and that figure was
worked out for a deck with nothing above it.

**Two reads per graded beat, and they count different things.** Before the pick,
everything: size, fade, clipping. After it, **clipping only** — because once a
question is answered the deck is choreographing. The rejected card crumples away
at 0.14, layers dim to make room for the reveal, the wrong option recedes. Those
are words deliberately on their way out, and counting them turned 11 findings into
147, every one of them something the scene meant to discard. A box too small is
not choreography, and the explanation only exists after the pick, so that is the
one thing the second read is for.

**And the first thing that half of the screen gave up was in a CONTROL rather than
a lesson.** `FieldPick` gives its y axis a 52-unit gutter and capped it at two
lines, and its x ends one line each. An axis label is a whole claim — SOMETHING
FORCED YOUR HAND, YOU ACTED FROM YOUR OWN WANTS — which is three lines in that
gutter and two across that end, so everything past the cap was cut off, in every
`field` lesson at once. **A control's own labels are lesson copy** and are measured
like any other words. The pad is 104 tall, so three 10pt lines at each end use 60
of it and never meet in the middle.

**A DIM CANNOT BE TUNED, BECAUSE THE GROUND FADES WITH THE INK.** The obvious
repair to a ghosted caption is a shallower floor, and it does not work: the box's
paper fades at the same rate as the ink on it, so the contrast between them falls
however gently you fade. Measured, ink on paper needs about **0.84 opacity** to
hold 3:1 — which is not a dim at all. `logic-9` had already had one tag's floor
lifted from 0.72 to 0.45 with a comment citing this rule, and its quoted claim
still only reached 2.2:1.

So the two are separated rather than balanced. **The furniture recedes and the
words do not**: the frame keeps the fade, the text becomes a sibling on its own
track, and the reader gets an unlit card with a legible line on it. That is §19's
locked-pin rule in another place — unlit against lit, never the same thing dimmer.
Four scenes carried this fault (`logic-9`, `ethics-11`, `aesthetics-18`,
`epistemology-14`), and two of them were a CONTROL driving the opacity, which is
the version to watch for: a reaction wired to a layer's opacity rests wherever the
reader leaves the knob, so the word is dim for exactly as long as they are
thinking about it (R7c).

**And half a thing is half a word.** `aesthetics-20` staged its substitutes as
`swaps: 0.5` across three rows — one and a half of them, and the half was a
half-drawn A CAMERA at 2:1. It was also half an argument: the sentence names one
substitution. A staged fraction should land on a whole row.

**And a word drawn twice in one place is one word in two states.** The pattern
above — an INK-filled overlay carrying PAPER letters over a paper plate carrying
INK ones — leaves the covered copy sitting on a fill of its own colour. It
measures at exactly 1.0:1 and is perfectly legible on screen, because its twin is
the thing being read. Walking the paint stack cannot see it: `elementsFromPoint`
skips anything with `pointerEvents="none"`, and a scene sets that on nearly
everything it draws. So the check judges the PAIR — same string, same place, one
copy above the floor, no finding — which is the same shape as the rule that keeps
political-7's torn charter from reading as thirty-three sliced words.

---

### D36 · A word outside the stage or the band is unreachable at any shot

The camera moves the scene under a fixed crop; it never widens it, and a shot may
never scale below 1 — that is the whole safety story of `camera.ts`. So a word
drawn beyond x 0…400, or above the band's top, or below its bottom, is cut on
**every beat of every play**, and nothing downstream can rescue it.

That much is obvious. What was not obvious is that the check standing nearest to
it was written to look away:

```js
// Text outside the band is unreachable at any shot — an H59 fault in the
// scene rather than a framing the camera chose.
if (y < band[0] - 0.5 || y + bh > band[1] + 0.5) return false;
```

The tour generator refuses a station that cuts a word in half, and it correctly
declines to blame the camera for a word the camera could never have held. The
reasoning is right; the consequence was that nobody held it at all. Four words had
been drawn outside the space for months — `epistemology35`'s third plate twenty
units past the right edge, `ethics36`'s gift label sixteen, `logic35`'s CAUSES?
two units above its own band — and every validator was green.

`npm run check:space` is the missing half. It reads the measurements already on
disk, so it costs milliseconds and needs no browser, and it prints the overhang in
units, so the edit is a subtraction rather than a judgement.

Two things it teaches about bands. **A band is a declaration, and nothing was
reading the art back into it** — `logic35`'s header said "ink runs y 240" while
its arrow label started at 232, and both had been true-looking for months. And
**widening the band is usually the better fix than moving the word**: it costs a
few percent of scale and no composition at all, where moving a label out of one
crop generally pushes it into something else.

---

### T4 · The ring has to match the shape, and the count has to match the answers

`Target` draws a breathing ink ring on its own bounds — that is what tells a
reader which parts of the picture are the buttons. Two things about it are easy
to get wrong and impossible to see in the source:

- **It takes a `radius`, and its own comment says why**: "Match the target's own
  corner, so the ring does not square off a round thing." A target wrapping a
  circle and not passing it draws a SQUARE around a disc. `metaphysics31`'s hole
  arrived wearing two nested squares, and the reader's report was "when you tap
  on an answer, it's kind of confusing."
- **The question panel COUNTS the mounted targets** and prints the number —
  "tap one of the 3 marked parts above". So offering one answer through two
  targets (a labelled tab AND the thing it labels) tells the reader there are
  more choices than there are. `epistemology14` said five for three.

`npm run check:shape` holds both, and it is cheap — no browser, no Metro.

## Part 2 — Authoring checklist

**Shape** — before writing a word, lay the beats out and count them (H52, H53).
- [ ] **Anything the figure holds is held** (group P): its position is
      `lerp(rest, gripAt(...), held)`, its arms are pinned with `carryHands`, and it
      is never faded in or out. `npm run check:hold`.
- [ ] **Nothing is painted across a word** (D33). Run `npm run check:cover` on the new
      lesson; a rule, a prop edge, a second label or the figure lying over a caption
      is the defect a reader called "cheap", and it is the one thing no offline check
      can see.
- [ ] **Every beat's pose code is from the right band** (N2): `300+` to PLAY an action
      once as the beat opens, `158–177` for a hold that lives for the whole beat.
      A one-shot written in the `100+` band draws a figure standing still (N1).
- [ ] **The one-sentence picture written down first**: "the picture is X, and over the
      lesson X does Y" (H64). If it won't fit in a sentence, the scene isn't found yet.
- [ ] One question in the deck, one answered on the stage (H65); the distractors are
      real rival positions, not filler (H66).
- [ ] **The control matches the shape of the claim** (R1): a scale is `drag`, an
      ordered set of named settings is `lever`, a curve is `plot`, a division of one
      thing is `split`, two independent yes/no questions are `field`, and everything
      else is `cards` — which is still most of them. The two graded beats do not use
      the same control, and neither does either neighbour (R8).
- [ ] **Nothing is drawn where no shot can reach it** (D36): every word inside
      x 0…400 and inside the declared band. `npm run check:space` — offline, and it
      prints the overhang in units.
- [ ] **The rotation holds** (R9): the control differs from the lesson before it,
      one question is still answered on the STAGE, and the deck is not the default.
      `npm run check:rotation`.
- [ ] **It reads plainly** (J10): reading ease 55 or better, and under 12% of the
      words are `it · that · this · they · these · which`. Say the noun.
      `npm run check:plain`.
- [ ] **Every label lands at 8pt or more** (D34) — `declared × fit`, where a tall
      band shrinks everything. `npm run check:legible`.
- [ ] **Every `reads` string is lesson copy** (R2) and every wrong region is a
      position somebody actually holds (R4). If a quadrant is filler, the pad is
      punishing the reader for exploring it.
- [ ] 7–11 beats; 8 unless there is a reason.
- [ ] Exactly two graded questions (`mc` and/or `interact`); a third interaction is an
      ungraded `tap`, so the lesson still pays 60 like its siblings (H53).
- [ ] Exactly one saveable quote, on a rest beat — never the hook, a question, or last
      (H52).
- [ ] **That quote's `id` means ONE quotation.** Reuse the data file's id only when you
      are quoting the same sentence; a different quotation takes a new suffix.
      `savedQuotes` dedups on the id alone, so a second quotation under a borrowed id
      can never be collected and renders as already held. `npm run check:quotes`.
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
- [ ] Nothing keyed to `bt` assumes it is real seconds — it is GATED by the camera,
      and stops while the camera travels between stations (K1). This is free to obey
      and impossible to obey wrongly; it is listed so nobody "fixes" a pause.
- [ ] After changing a layout: `node scripts/measure-must.mjs && node scripts/make-tours.mjs`.
      A tour derived from a picture that has moved points at where things used to be,
      and unlike a stale must-box it does not merely crop — it spends the beat looking
      at the wrong thing (K10).
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
npm run check:tour     # group K, offline, against each lesson's own band
```

> **`measure-must` does not currently reproduce its own table, and that is unsettled.**
> Re-measuring `aesthetics-aesthetics-4` — a lesson nobody had touched, whose source
> stamp in `mustBoxes.ts` matches byte for byte — returns `[34, 222, 342, 288]` where
> the committed table holds `[12, 222, 376, 288]`: 22 units narrower on each side, on
> the same viewport, through the same route, with tours off. Something about the
> environment the table was made in is not captured by the script.
>
> The consequence is practical: a lesson whose scene changes cannot have its box
> re-measured in isolation, because splicing one fresh reading into a table of stale
> ones mixes two environments — and a must-box is what stops the camera cropping the
> very words this group is about. Until it reproduces, treat the table as
> regenerate-everything-or-nothing, and do not hand-edit it to silence the stamp
> check. Two lessons carry a stale stamp today for exactly this reason
> (`aesthetics-aesthetics-3`, `logic-arguments-3`); the boxes are the ones that were
> measured, and the scenes have moved a caption and a strike bar since.

**Then the two browser sweeps, which answer questions arithmetic cannot.** They want
Metro and a headless Chrome — the header of each script has the exact commands, and
they default to different ports so both can run at once.

```
npm run check:frame    # what the CAMERA cuts in half   (edge of the frame)
npm run check:cover    # what is painted ON a word      (D33, element vs element)
npm run check:hold     # objects that ride the figure   (group P, grip and pop)
SELFTEST=1 npm run check:cover   # prove the cover check can still see a defect
```

`scripts/validate-cinematic.mjs` enforces the group-H rules that are arithmetic — beat
count, exactly two graded questions, one quote placed legally, the summary last, a
declared band whose bottom is on the ground line, no scene-declared colours, no XP
figure typed into a string. Its sibling `validate-lessons.mjs` does the same for the
card decks. The baseline is clean, so **anything it prints is yours**; it also reports
the band budget so a new lesson can see what its crop is costing against the other 46.

It cannot see anything about the picture. That is what the rest of this part is for.

**`check:tour` is the exception that proves it, and worth reading for the technique.**
Group K's whole safety property — every station contains its own subject, no station
goes past the ceiling, the tour ends on the beat's full must-box — is settled by
arithmetic against `camera.ts`, the same module the player runs, transpiled rather
than reimplemented. Nothing is sampled and nothing is eyeballed, so it covers every
station in the app in about a second rather than the eight lessons a browser sweep
gets through. **That is only possible because the tours are generated from
measurements**: hand-authored stations would each need looking at.

The corollary matters as much. `measure-must.mjs` and `check-frame.mjs` both load the
lesson with tours switched OFF (`?notour=1`), because measuring through a gated clock
reads less content per beat, shrinks the boxes, and generates tighter tours next time
— a ratchet, turning the wrong way, and invisible in the output. The browser harnesses
measure the scene's own timeline; the tour built on top of it is proved offline.

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

---

## H57 · A person in a scene is drawn by the RIG, never out of Views

A circle for a head and a rectangle for a body is not a small figure, it is a
different species standing next to one. The five people roped to the trolley
track in ethics-3 were `Peg` — a disc, a bar and two rectangles rotated ±7° — and
ethics-6's were a disc on a bar with **no legs at all**, both beside fully
articulated figures that breathe. Enlarging them never helped, because size was
never the problem: they had no joints and no motion, so they read as bollards
with heads.

If a scene needs a person at any size, call `pose()` and render a `Stickman`.
The rig scales: the trolley row runs at `k = 0.70` and the bridge row at `0.64`,
which are the exact heights those hand-built shapes already used.

**A crowd needs its own seeds.** Figures sharing one motion read as one figure
duplicated, not as several people — give each a different phase.

## H58 · One figure may not own more than ~38% of the band

`K_FIG` is 1.0 (a 103-unit figure) and the median scene puts that at **35% of its
declared band**, which is where a character sits in an illustrated scene without
being the scene. Two ways to break it, and both have been shipped:

- multiplying `K_FIG` locally (×1.08, ×1.16), and
- cropping to a **short band**, which is the commoner one — the band is what the
  reader actually sees, so a 103-unit figure in a 182-unit band is 57% of the
  picture no matter what `K_FIG` says.

The band is width-limited on a phone (`fit = min(boxW/400, boxH/bandH)`), so for
any band under about 490 **widening it costs nothing on screen** — it does not
shrink the art, it reveals more stage around it. That is usually the fix, and it
is the safe one: shrinking a figure shortens its reach, so every scene where a
hand meets a prop has to be re-checked when you do it.

`npm run check:scale` measures both and holds a ratchet on each.

## H59 · A prop does not leave the room and come back

See `npm run check:props`. A cue that reads `0100000100` fades a prop out for
five beats and brings it back — the reader sees objects vanishing and
reappearing. A gap in the *script* is fine; the scene wraps the cue in `held()`
so the prop stays on stage between its first and last beat.

## H60 · The camera must CONTAIN what the beat is about, not aim at it

A camera verb takes `at: [x, y]` — a **point**. Nothing in the shot maths ever
knew how big the thing at that point was, which is exactly how a push framed the
figure and cropped half an answer plate off the top right. A point cannot be
cropped; a box can.

So the targets measure themselves against the camera view and report a union box
in scene coordinates, and `containShot` (camera.ts) pulls the shot only as far as
it must for that box to fit:

- the scale comes **down** to fit and is never raised — this is a floor on what
  must be visible, not a re-framing;
- then the centre slides the shortest distance that brings the box inside;
- a shot already wide enough comes back **untouched**, which is why the camera
  work on every other beat is unaffected. A tight push stays a tight push; it just
  moves over.

Measured in Node against camera.ts (which has no imports, so it runs there): a
2.2× push at a box in the top right keeps its 2.2× and slides the centre; a box
wider than half the stage drops the scale to 1.11; a shot that already contained
its box returns identical.

**The fallback is half the rule.** Until a box has been reported for an
interactive beat — its first frames, or if `measureLayout` ever fails on a device
— the shot is `NEUTRAL`, the whole declared band, which cannot crop anything the
scene draws. Blunt is acceptable; unreachable is not.

`npm run check:camera` guards the one hole: a scene that rolls its own camera
transform bypasses the player and so bypasses all of this. There are none today.

> **And for eight months the checker was checking a camera nobody ran.** Two
> separate faults, both found in the same audit, both of the shape "the harness
> agrees with the intention instead of the device":
>
> - `validate-cinematic` read each beat's figure position with `/^\s{4}x:/m` — `x:`
>   as the *first key on its line*. Every script writes `p: 25, x: 200,`, so it
>   matched nothing in any of 96 lessons and every beat fell back to the default.
>   `followMoves` picks its verb from how far the figure moved, so it was picking
>   verbs for a man who never moved: 44 lessons have a track that varies, 42 got
>   different shots than the ones checked, **149 shots were never checked as they
>   actually are**, and `to` / `drift` / `whip` — 113 moves, every one a camera
>   chasing something — could not be reached at all. Same shape as the
>   `validate-worklets` blind spot in §17.
> - The checker resolved with `ground = 500`; the player passed its `ground` prop,
>   which **no scene sets**, so `fit()` dropped its ground clamp. The checker was
>   validating the safer of two different cameras, and ethicsScene shipped three
>   beats whose frame ended up to 37 units above the ground line — the man standing
>   on nothing — with every validator green.
>
> Both are fixed, and both left a guard behind rather than just a correction: a beat
> whose `x:` cannot be read is an error, the verb mix is printed so a flat sweep of
> `to`/`drift`/`whip` fails the build, and the player defaults `ground` to `GROUND`
> so the two callers cannot drift apart again.

> **The guarantee is NOT a function called `openForTargets`.** check-camera used to
> say so in its header and in its success line, and no such function has ever
> existed — it is `needsBox` + `containShot`, inline in `CinematicPlayer`. A safety
> property asserted under a name nobody can grep is a dead end for the next person
> auditing it, which is the whole reason this note exists.

## H60b · USE the camera — a still wide shot is a wasted one

H60 is a floor, not a style. It says what the camera may never crop; it does not
ask for a camera that sits still. The stage is 400×560 and a figure is ~103 tall in
it, so a locked wide shot spends most of the frame on empty paper and renders every
lesson at the same distance — which is why they read as one long shot of a small man.

> **The count in this paragraph used to be "55 of the 100 lessons have none at all".
> It is now 2 of 102**, and both are the lessons that predate the shared player and
> carry their own copy of it: `logic-arguments-1` has a hand-rolled camera of its
> own, `logic-arguments-2` has none. Every one of the 100 scene lessons moves.
>
> The last three to get one — ethics-ethics-2, ethics-ethics-5, political-political-1
> — are worth reading as a set, because all three had a *stated* reason for having no
> camera and none of the three reasons was about composition. One said the camera had
> been static on every beat; one said identity made the constants easier to read; one
> was about a translate that had made the band unmeasurable and had been fixed years
> ago. "It was not doing anything" is a case for a better camera, not for none.
>
> They also could not safely have been given one before H60c: all three put their
> teaching art above the figure — a verdict board, an axial chart, a headline and two
> meters — and a close push shows y 321..561. The measured must-see boxes are what
> made adding a camera to them a change rather than a regression.
>
> `npm run check:cinematic` prints the live figure; do not trust the one written here.

So the default is to MOVE, and the three things worth moving for:

- **Push in on the figure**, and follow him when a walk is long enough to be worth
  following. A traverse of 60+ stage units (the C18 minimum for a walk to read as
  one at all) is long enough that a locked frame turns it into a figure shrinking
  across a still picture. Track him.
- **Push in on the thing being talked about** — a prop he is working, an
  illustration, a diagram, a label. If a beat's text names an object, the shot
  should be able to see that object at a size worth naming.
- **Do NOT push in on a question.** This bullet used to say the opposite — that a
  question is "the best case for a close shot, and the safest, because
  `containShot` already guarantees the answer targets stay inside it" — and it
  contradicted the rule three paragraphs down, `followMoves`, and
  `validate-cinematic`, all three of which force a graded beat to scale 1 and treat
  anything else as an error. `containShot` guarantees the targets are *visible*; it
  cannot make a tap land accurately through a camera offset, and a Pressable the
  reader misses is worse than a wide shot. Scale 1 on every graded beat, no
  exceptions.

**Wide is a choice, not a default.** Keep it wide when the beat is about the space
itself — a figure alone in a room, a distance being crossed, two figures far apart
— and say so in the scene header, the same way every other composition decision is
stated in numbers.

## H60c · If the reader is told to look at it, the camera must frame it

H60 guarantees a shot contains what the beat is *about* — but only a question ever
declared what that was. Everything else the reader is pointed at (a diagram being
drawn, a labelled prop, a box filling in, an animation the text names) had nothing
to report, so the camera framed it by luck. With `followMoves` dealing pushes of up
to 1.24×, luck is not good enough.

**The rule: a beat that shows the reader a specific thing reports that thing's box,
and the camera then either holds wide enough or moves onto it.** Not "aims near
it" — H60's whole point is that a point cannot be cropped and a box can.

### The rule was written before anything could obey it

For a while this section described a mechanism that did not exist. It said the box
was "the one questions already use, now available on every beat" — and
`CinematicPlayer` did honour a box on any beat, so that half was true. The half
that was not: **`SceneApi` gives a scene no way to report one.** The only thing
that ever called `onBox` was `TargetCountProvider`, which mounts answer targets, so
in practice a box existed on question beats and nowhere else. Nought of 100 scenes
followed this rule, and none could have.

The bill came in when it was finally measured. `scripts/check-frame.mjs` steps a
lesson in a browser and compares everything the scene draws against the stage's own
crop: **8 of 8 lessons sampled were slicing words in half, 285 elements between
them.** The same 8 with the camera switched off came back with 6 — so it was the
camera doing it, not the layouts. metaphysics-being-7 was cutting "PAST", "NOW" and
"FUTURE" off a timeline, which is the entire subject of that lesson.

### What actually enforces it now

**It protects the FIGURE, the WORDS and the ART — not just the words.** The first
version of this measured text only, on the reasoning that scenery being cropped is
what a push IS. A reader then reported the camera cutting the stickman in half and
slicing the illustration above him, and both were true: the frame audit had counted
438 clipped art elements and the rule had been written to ignore them. That reasoning
holds for a ground line running off both edges and is false for the thing the lesson
teaches with.

So the measurement records three kinds and the rule (`scripts/lib/mustrule.mjs`)
decides what to do with each:

- **figure** — the union of one `Stickman`'s limb Views, and every figure on stage.
  The root is a zero-size absolute box, so it carries a `testID` and the extent is
  its descendants. This matters: `validate-cinematic` models the figure as a single
  `x` and a head-and-feet height, which cannot see a reaching arm, cannot see what
  he is holding, and cannot see a second figure at all — metaphysics-being-7 has
  THREE and only one was ever checked.
- **text** — always. If it is set in words the reader is meant to read it.
- **art** — unless it already bleeds off the stage edge. A ground line drawn from
  x −20 to x 420 is meant to continue past the frame; demanding the camera hold it
  would pin every shot to 1.0 for nothing.

**And the box is clamped to the BAND, which is not tidiness.** `containShot` has two
clamps per axis — show the near edge, show the far edge. While the box fits they
agree; once it does not they contradict, and the one applied last wins. logic-arguments-5
is the worked example: its band is 224..510 and the measured box came to 240..546,
because the scene draws 36 units below its own band. Asking for the bottom of that
dragged the window down on every beat and sliced "AB = AC" — a label at y 256, well
inside the band and perfectly visible if nothing had asked for the impossible. **The
box was not protecting the label; the box was why it was cut.** Anything outside the
band is an H59 fault and belongs to the scene.

Scenes draw their labels as raw `<Text>` with local styles, so there was no
reporting component to hang this on and no honest way to hand-author ~800
rectangles. So the boxes are **measured from the real render** and stored:

- `scripts/measure-must.mjs` steps every lesson in a browser and records, per beat,
  the union of the words that lesson has on stage — in scene coordinates, recovered
  from `#stage-cam`, whose client rect top-left *is* the image of scene (0,0) and
  whose width is `STAGE_W × fit × scale`.
- `components/lesson/cinematic/mustBoxes.ts` is the generated table.
- `CinematicPlayer` feeds it to `containShot`, which **only loosens** — the scale
  comes down to fit and the centre slides the shortest distance. **A shot that
  already showed its words is returned untouched**, which is why this cost the
  authored camera work nothing anywhere it was already right.
- A beat may still set its own `must: [x, y, w, h]`, and that wins. It is the
  override for what measurement cannot see: art with no words in it that the beat
  is nonetheless about.

**What it costs, measured rather than guessed.** Across 771 beats the mean shot goes
1.124 → 1.017, the peak is 1.10×, and 72% of beats sit at 1.0. That is most of the
camera's zoom, and it is not the rule being greedy — it is the scenes. Their content
runs edge to edge: in metaphysics-being-7 the text and figures ALONE span x 12..388
of a 400-wide stage before any art is counted. Any push crops something, so the
honest shot is the wide one.

**The fix for that is in the scenes, not the camera.** Move an outlying label
inboard and the push returns by itself, because `containShot` only ever loosens —
no camera has to be re-authored. Re-run `node scripts/measure-must.mjs` and the room
reappears.

`npm run camera:wins` says where that is worth doing, offline and in a second, from
the measurements already stored. It reports each lesson's ceiling now against the
ceiling it would have if the single most extreme thing on each edge were pulled in.
A large gap is one stray label holding a whole lesson flat; a small one means the
content genuinely fills the stage and only a redesign would help.

As of this writing **29 lessons would regain 0.10× or more from one nudge per edge**
— aesthetics-19 goes 1.01 → 1.23, ethics-11 1.03 → 1.24, political-9 1.06 → 1.26 —
and 35 would gain almost nothing. logic-arguments-8 is the extreme case and is not a
nudge at all: its band is 493 tall, the tallest in the app, with art at y 33 and
y 517, so it spans nearly the whole design space by construction.

> Do not trust those figures here; run the script. They are a snapshot of a moving
> repo and the whole point of the script is that it re-derives them.

**Measured data rots, so it is stamped.** `MUST_STAMP` fingerprints the scene and
script each box was taken from, and `check:cinematic` fails when one diverges —
because the dangerous direction is silent. A box that has gone stale and *too
small* still looks like a guarantee while letting a push crop the very label it was
recorded to protect. **Re-run `node scripts/measure-must.mjs` after changing a
scene's layout.**

> Questions keep their stronger guarantee on top of all this: they are forced to
> scale 1.0 outright, because answer targets are Pressables and a tap must not have
> to survive a camera offset. Where a question beat also has a measured box, the
> shot has to hold both, so the two contains are applied in series — each only
> loosens, so the order does not matter.

**What is still on the author.** The measurement sees words. A diagram made of
lines, an unlabelled prop the narration points at, a bar that fills — none of those
carry text, so none of them are in the table. If a beat's text names something the
scene draws without words, give that beat a `must` by hand.

---

## Group S — a word must fit the box it is in, and nothing may be laid over it

Everything above this group is about the STAGE — what the scene draws, what the
camera can crop, whether a caption is big enough or dark enough. Group S is about
something smaller and, it turns out, commoner: a box that is not as wide or as tall
as the words inside it.

It exists because the reader has now reported the same defect four separate times,
in four different places, and every check in the suite was green through all four:

> "still words are cut off the screen from the left and the right"
> "letters are cut off to the right"
> "there are plenty of words that arent correctly in their boxes, and words get
>  covered by other things … look at all other cinimatic lessons for this too"
> "many words are cut off from all of the 4 new ways to asnwer questions"

### S1 · A word may not overflow its own box — measured on the box, not on the crop

`check-readable`'s KEEP measures a word against whatever is **clipping** it, which
in a scene is almost always the stage crop. That is the right question for a
caption drifting off the edge and completely the wrong one for a label that
overruns its own little plate three hundred pixels inside the frame. The plate is
not clipping anything; it is simply too small, and the word hangs out of it or is
truncated by a `numberOfLines` cap.

The element's own scroll box answers directly, so **SPILL** is now a finding:
`scrollWidth > clientWidth` or `scrollHeight > clientHeight`, on every word in the
stage and the deck, with 2px of slack for sub-pixel rounding. React Native's
`numberOfLines` is a line clamp with `overflow: hidden`, so a truncated label
arrives here as extra scrollHeight — which makes this the general form of every
"cut off" the reader has described.

`logic8` is the worked example, and it is worth reading because every one of its
four faults was invisible to arithmetic done by eye on the source:

| box | column | needed | what the reader saw |
|---|---|---|---|
| `THE TEMPTING MOVE` | 120 | 173dp | three lines in a 17-unit slot |
| the trap sentence | 120 | 223dp | three lines in a 34-unit slot, cut |
| `WHAT THE WET STREET PROVES · TAP ONE` | 256 | 343dp | second line printed across the first answer card |
| `WET PATCH` | 76 | 92dp | second line printed across the puddle it names |

A lesson called *Two Tempting Traps* in which the second trap was sliced in half.

**How to answer it without a browser.** Widths are one component times a list of
strings, so measure them offline with the real face — `scripts/check-controls.mjs`
does exactly this for the controls and takes two minutes for 1,127 labels with no
Metro at all. For a scene, hand the same measurement a list of `{text, font, size,
track, room}` read off the stylesheet. Guessing at 8dp a character will be wrong by
a third, and in the wrong direction.

### S2 · Nothing may be painted on top of a word — and that is now measured

D31 and D33 already say this. Nothing enforced it, and the reason is worth
knowing: `check-readable` decides what a word sits on with `elementsFromPoint` and
then scans **downward** from the word for a background colour. That is exactly
right for contrast — what is behind the glyph is what it has to contrast with —
and it means anything painted **over** the word was skipped entirely. A caption
with an opaque panel across it measured a perfect contrast against a ground it no
longer reaches.

**UNDER** is the other half: any element ABOVE the word in the same paint stack,
which is not one of its own ancestors, with a composited alpha of 0.6 or more.
Ancestors are excluded and they are most of the stack — an ancestor with a
background paints behind its own text, never over it. What is left is a sibling or
a cousin drawn later, which is the defect.

Half-covered is covered. A wash at 0.6 over a word is a word nobody reads; anything
thinner is legitimate scrim.

### S3 · A control's readout is the biggest word on the beat, and it must wrap

The reading above an analogue control — the sentence that changes as the reader
moves it — was an `ACounter`, which is `Animated(TextInput)`, which on the web is
an `<input>`. **An `<input>` cannot wrap.** So 285 of the 1,127 readings in the
corpus ran off the right-hand edge, some of them by a third of the sentence, at
17pt, dead centre, on the most important line of the beat.

The TextInput was chosen so Reanimated could write it from the UI thread and the
drag would cost zero React renders. That reasoning is sound for a NUMBER —
SplitBar's two running percentages are still ACounters and must be. It never
applied to the reading, because **the reading does not change every frame**: it
changes when the value crosses into a new zone, stop, quadrant or nearest profile,
which is the same event that already fires the haptic tick. A wrapping `<Text>`
driven by state on that crossing costs about four renders of one small leaf per
gesture.

Two things follow, and both are load-bearing:

- **The height is fixed at two lines, always**, whether the reading uses one or
  two. The reading changes under the reader's thumb, so a content-sized box would
  resize the deck mid-drag — and the deck's height is what `styles.lower` hands
  out, so the stage would rescale on the frame a word got longer. That is L6, the
  camera cut nobody wrote, arriving through a text box instead of a control.
- **15pt, not 17.** Two lines of 17 would have taken 44px out of the deck, which is
  `overflow: hidden` and holds the prompt and the explanation. At 15 every reading
  in the corpus fits two lines at 360dp, measured with the real face.

### S4 · Lifting a finger is only an answer when the control has one value

Four of the five analogue controls hold a single number, so release-is-commit is
right for them: when the finger comes up there is nothing left to say.

**A plot holds one value per column**, and the only way to set four of them is to
lift between them. `ShapePlot` committed in `onEnd` anyway, so the reader set the
first column, lifted to reach the second, and the question was already over:

> "when you move one up or down then want to go to the next it simply thinks your
>  done and doesnt let you finish"

A drag straight across still sets every column and still works. What has gone is
the assumption that it was the only way anybody would do it. The commit is a button
now — flat and cool until there is something to commit, in the left gutter the axis
label already occupies, so it costs the deck no height at all.

**The general form: a control's commit gesture is derived from how many values it
holds, never copied from the control next to it.**

### S5 · The grip goes where the finger is — 1:1, not merely in the right direction

`DragScale`, `SplitBar` and `LeverPick` were fixed once already, when the reader
said the far end was unreachable: they had integrated `translationX / width`, so a
full sweep cost a full width of travel. All five place the value at **where the
finger is** now.

The lever was still wrong, and the reader said so: *"make it so the lever moves
easier instead of it feeling like a struggle to move over."* The VALUE was
absolute; the PICTURE was not. The arm was 52 long swinging ±52°, so its grip
travelled 82dp while the finger travelled the pad's full 308 — a gain of 0.27. The
control had already obeyed the gesture and was visibly refusing it, which is
precisely what "a struggle" describes.

A rotating arm can only span the pad if it is long enough, and an arm 231 tall does
not fit in a 70-tall control. So it is **dropped**: the pivot sits 190 below the
pad, the pad clips, and the reader sees the top 56 of a big lever whose fulcrum is
off-stage. The angle is `asin(dx / ARM_LEN)`, which puts the grip exactly under the
thumb at every position, and a full sweep is 42° of real tilt.

**When a control's value tracks the finger, check that its DRAWING does too.** They
are two different things and only the second one is felt.

### S6 · A check that walks a list of element kinds cannot see a new kind

This is the meta-rule, and it is why S1–S3 survived for months with a full green
suite.

`check-controls` measures every label a control draws — and did not list the
readout. `check-readable` scans the lower deck as well as the stage — and walks
`div,span`, so an `<input>` was never once read. **Two instruments, one blind spot
each, and the two lined up exactly on the largest word on the beat.**

It is the same shape as L7 and R6, which say that a new way to MOVE and a new way
to ANSWER each need the checker to gain one in the same commit. S6 is the third
face of it: a new kind of ELEMENT does too.

So, when adding to a control or a scene:

- a new **element type** (an input, a canvas, an SVG text) → add it to
  `check-readable`'s node walk in the same commit;
- a new **label slot** on a control → add it to `SLOTS` in `check-controls`;
- a new **control** → add it to `CONTROL_IDS` in `scripts/lib/answerctl.mjs`, and
  if it does not commit on release, teach that snippet how it does commit.

And counter-test every one of them by putting the defect back and watching it go
red. `check-readable` reported all 186 lessons clean for a whole run once because
its probe threw on the first word of the first beat — a null read was treated
exactly like a finished lesson. **A harness that measures nothing must not look
clean.**

### S7 · The reading may not go through React — a rail is not a lever

S3 made the reading wrap by taking it off the `<input>` and driving it from React
state, updated on each boundary crossing. The reader came straight back:

> "when you start to move them, the words above it that change as you move it
>  start to stutter and start to glitch, and you can't even read what's going on
>  when you do that … Actually, the lever, I think, looks okay … It's a lot with
>  the line when you slide it."

Both halves of that are exactly right, and the difference between the two controls
is the whole diagnosis. **A lever has three or four detents**, so a sweep crosses
two or three of them and the reading changes two or three times. **A rail is
continuous** — `drag` and `split` divide 0…1 into zones and a thumb travelling the
width crosses every one in a few hundred milliseconds. That coarseness hid three
faults at once:

1. **Each change was a hard cut** — a whole sentence at 15pt replaced between one
   frame and the next, several times a second, directly above the thumb.
2. **The box re-centred.** One-line and two-line readings centre at different
   heights, so the words jumped vertically on every swap.
3. **It re-rendered the control mid-gesture.** `DragScale` builds its `Gesture.Pan`
   inline, so every reading change handed `GestureDetector` a new gesture object
   while a finger was down on it.

So every possible reading is mounted at once, stacked in one fixed-height box, and
an index **SharedValue** cross-fades between them on the UI thread. No render, no
cut, no jump, and the drag keeps one gesture object for its whole life.

Measured on a real 1.5-second sweep, sampling every animation frame:

| | before | after |
|---|---|---|
| biggest opacity step between two frames | 1.000 | **0.226** |
| distinct box tops during the sweep | several | **1** (0.0px spread) |

`node scripts/sweep-read.mjs <lessonId>` is that measurement, and it was
counter-tested by setting the crossfade to 0 and watching the step go back to
1.000. It needs Metro and a browser, so the rule it protects is ratcheted offline
instead: **`check:controls` fails if any control holds React state, or hands
`ControlRead` anything but a shared value.** One allowance is listed by name —
`ShapePlot`'s `drawn`, which flips once per question and gates the commit button
rather than the reading.

**The general form: coarse controls hide continuous defects.** A thing that
changes three times per gesture and a thing that changes thirty times are not the
same thing, and testing only the first will tell you the second is fine.

---

## Group T — a scene needs mass, not just outlines

### T1 · Two values is a diagram; four is a picture

A reader named the two lessons they liked best and asked for what those have:

> "for the lesson where rights come from in political philosophy, I really, really
>  like all the animations, all of the artwork and everything that moves … There's
>  also a lesson where it has three figures and a fence … I really like how those
>  two lessons have done it … like the idea of adding different dark shading in
>  there that the political philosophy lesson has. It looks really good when
>  there's different contrasts of darker shading."

Counted out of the source, the difference is exact — and it is not about animation
at all. `political7` lays down **ten** filled tonal masses and `political8`
**seven**. Across the corpus, **81 of 184 scenes use exactly one and 48 use two**,
and that one is usually the ground's own hairline. A scene with one tone is an
outline diagram on white: two values, no depth. Rendered side by side, the flat
one reads as a wiring diagram and the praised one reads as objects standing in a
room, and nothing else about them differs.

`npm run check:shade` counts it, prints the flattest lessons so the work is
pickable, and ratchets — the number of scenes below the floor may only go DOWN,
the same shape as `CARD_BUDGET` and `SOLID_FLOOR`.

### T2 · The recipe: the big surface takes the tone, the message stays white

This is not "everything a shade darker", which would be a worse picture, not a
better one. What `political7` actually does is put **things at different values**:
a light stone tablet, a WHITE charter hanging in front of it, and a dark seal.
Take the white away and the contrast that makes it read goes with it.

So, per scene:

- the **structural mass** — the plinth, the housing, the wall, the podium, the
  thing the picture is built on — takes `STONE`;
- a **secondary surface** takes `RULE`, the light mass;
- whatever **carries the message** stays `PAPER`;
- where a mass has two faces, the upper one is the lighter — one light, from the
  top left, the same one `tone.ts` uses for every rank pin and badge (§19).

Verified by rendering: `aesthetics10`'s projector housing was white with five
white filmstrip cells inside it, and the cells had nothing to sit against. One
`RULE` fill on the housing and the picture has a foreground and a background.

**And the biggest box is not always the right one.** A first pass picked the
largest bordered surface in each scene automatically; in `aesthetics10` that is
the *answer card*, and toning it would have removed exactly the white the tablet
needs to be seen against. In `aesthetics10` it also picked a panel that spends
most of the lesson hidden behind a shutter, so the change was invisible to a
reader. Pick by what the scene is BUILT ON, and confirm by rendering it.

### T2b · The ground line is not the ground

Every scene draws its ground as a 1.5pt rule and, until this pass, nothing else —
so the figure and everything it is looking at stood on bare page. Both of the
lessons the reader holds up put their subject on a filled mass, and the cheapest
version of that is one View:

```ts
floor: { position: 'absolute', left: 0, right: 0, top: GROUND, bottom: 0, backgroundColor: RULE },
```

Drawn FIRST inside the scene root, so it sits behind every other layer, and
clipped by the band — a lesson whose band ends at 512 gets twelve points of floor
and one that runs deeper gets more. It is the single change that lifted the most
scenes off the flat list, and it costs nothing to author.

### T2c · A pip is not a mass, and a control is not scenery

Two failures the automatic pass made, and both are the same mistake wearing
different clothes: treating a box's presence as evidence that it is what the
picture is built on.

- **`ethics19.affSelf` is a 10×10 dot.** It was the only bordered box left in the
  scene that was not an answer, so the fallback toned it. A marker, a stud, a pip
  or a tick is never the mass — anything under about 26 on either axis is
  furniture, whatever it is called.
- **A style used inside a `<Target>` is a CONTROL.** Toning one removes exactly
  the white the tone exists to contrast against, and an answer that arrives
  already filled reads as pre-selected. Where the only bordered boxes in a scene
  are its answer cards, the right move is to tone NOTHING and add the floor.

The corpus went from 111 flat scenes to 0 with those two exclusions plus the
name test in T2, and every batch was checked on a contact sheet afterwards —
`node scripts/sheet-lessons.mjs a b c …` renders many lessons and stitches their
stages into one grid, because a flat scene looks fine on its own and obviously
empty beside one that is not.

### T3 · Type on a tone is INK

The one way these greys can make a lesson worse. Measured:

| tone | INK on it | SOFT on it |
|---|---|---|
| `RULE` #E4E1D8 | 13.31 | 4.08 |
| `STONE` #CFCABC | 10.63 | **3.26** |
| `SHADE` #A8A296 | 6.86 | **2.10** |

`SOFT` is a 5.1:1 grey on paper and does not survive being put on a grey — the
identical trap §19 records three times over for metal tones reaching onto paper.
`check:shade` catches it, and it caught one the moment this batch landed:
`logic9`'s tag became `STONE` while its label was still `SOFT`.

### T4 · A tone nobody can see is worse than no tone

A `WASH` at `#EFEDE6` was added to the ramp first, as "a breath above the paper",
applied to eighteen scenes, and rendered. **It is white.** §19 had already measured
why — *"a 7% tonal range is invisible"* — and paper to wash is 11%. `RULE` is 21%
off the paper, which is why `political7` fills its tablet with it and why that
tablet reads.

It was deleted rather than kept "for subtle work". A tone that does not register
is a trap for the next author, who will believe the source and not the screen —
and the source is where the wrong number gets written down. `epistemology8`'s
comment claiming `BECAUSE` was 35.3dp when it is 46.1 is the same failure in a
different measurement.
