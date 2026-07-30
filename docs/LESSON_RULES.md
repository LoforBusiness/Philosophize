# The Lesson Rule Book

Every rule here exists because a real lesson broke it and it was caught on a real
phone. They are not style preferences — each one is a defect that shipped, or a
direction the product owner gave after looking at one.

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
- **A clamp makes distinct inputs identical.** `solve` pulls any fist past the arm's
  33-unit reach back onto the reach circle, so two different over-reaching targets
  land in the same place. The jab (55, −31) and the cross (60, −29) both did: 1.5
  units apart on screen, two of the four punches the same picture, for months. Keep
  punch targets *inside* the reach so each keeps its own line, and whenever a value
  passes through a clamp, verify the things that should differ still do.
- The **pelvis cannot outrun the legs**: a planted foot needs `34 + bob − footLift ≤ 36`.
- Going **low** is fine (knees bend), but a low pelvis needs the feet moved
  **forward**, or the leg folds straight down and throws the knee out sideways.

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

**C22c. A multi-part reveal plays in order, and a tap runs it out.** Two rules in one,
both from the rank-up sequence. **Order:** each step starts as the one before it lands
and nothing overlaps — mark, then burst, then the old name out and the new name in,
then the bar, then the button. A reveal where everything happens at once has no reading
order and registers as a flash. **Escape:** anybody who has seen it before must be able
to tap anywhere to jump straight to the end state, because a celebration that cannot be
skipped becomes a toll on the tenth viewing. Any control involved stays inert until it
is actually visible, or the skip-tap presses it.

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

**D28. Text must fit its own box.** Two ways a word gets lost that the band and deck
checks cannot see: the card **clips** it (`scrollHeight > clientHeight`), or it
**spills** past the border onto whatever is underneath.

**D29. Budget for Android font padding.** RN Android `<Text>` defaults to
`includeFontPadding: true`, ~2–4px extra top *and* bottom **per Text**. A card sized
by arithmetic to fit two lines still clipped on device. Set
`includeFontPadding: false` on label/body styles **and** add ~10px of slack to any
card with wrapping text.

**D30. No orphaned line breaks.** A short label that wraps strands a fragment on its
own line — "OVERWHELM / S", "TOMORRO / W", a tick split from its word. The box just
grows, so nothing clips and no overflow check fires. A label of ≤26 characters should
occupy one line.

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

---

## Part 2 — Authoring checklist

**Story and script**
- [ ] New metaphor and beats; engine reused, not reinvented (F38).
- [ ] Hook → build → struggle → payoff, one idea per beat (F40).
- [ ] Every graded question names its trap (F41); a real primary-source quote (F42).
- [ ] Word limits respected (F44); no "Lesson N" references (F45).
- [ ] Every beat's text and pose agree — concrete claims only (A1, A4).
- [ ] A different gesture each beat; no loops (C19), differing in SILHOUETTE rather
      than in one wrist's height — pose both hands (C19).
- [ ] Every `*Hold` in the library you are using rests arm-down, not just `emoteHold`
      (C20).
- [ ] Any physical claim the vocabulary can't express → add a pose (A2).
- [ ] Secondary figures posed deliberately (A3).
- [ ] Explanations fit the answered deck (D27).
- [ ] Graded questions agree with the lesson's data file in count, concept and correct
      answer — wording may be re-cut for the staging (E37c).
- [ ] The lesson id confirmed by grepping `id:`, never counted within a unit (F45b).

**Scene**
- [ ] Shared `K_FIG`; relative sizes derived (B6); in proportion to ground props (B7).
- [ ] Two figures ≥ ~100 units apart at their closest beat — computed WITH root
      motion (`base − advA − advB − drift`), not from the resting marks (B9).
- [ ] Anything pinned to the figure derived from `K_FIG` + landmarks (B10).
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
      air — no more (D25, D26).
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
- [ ] The lesson is registered in the `CINEMATIC` map (G51d).

**Then run Part 3. Do not skip it because it "looks fine".**

---

## Part 3 — How to verify

**Measure, don't squint.** A 48-lesson review by eye misses exactly the defects that
matter, because clipped text and covered labels look plausible in a thumbnail. The
harness renders each lesson under react-native-web, walks every beat, and records the
exact rectangle of everything drawn. Rebuild it from
`memory/lesson-layout-audit-harness.md` — full recipe, DOM hooks, and the two gotchas
(Metro's bundling overlay renders *on top of* a mounted player; `CI=1` disables file
watching, so restart after editing).

Five checks are exact rather than matters of taste:

| Check | What it proves |
|---|---|
| **BAND** | Ink outside the declared crop is clipped on every device (D25) |
| **DECK** | Text past the deck's bottom is unreadable (D27) |
| **BOX** | A card clipping or spilling its own text (D28) |
| **WRAP** | A short label broken onto two lines (D30) |
| **POSE** | A beat's copy makes a physical claim its pose contradicts (A1, A3) |

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
