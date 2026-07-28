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

**B14. No two figures in lockstep.** Two figures running the same gait from the same
clock move like a mirror. `strideStance`/`travelStance` take a trailing `seed` —
give any companion a non-zero one. The tell when auditing: two `pose()` calls whose x
comes from the same expression (`bx` and `bx + GAP`).

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

### C. Motion and life

**C17. Movement takes the time it actually needs.** A walk's duration comes from its
distance (`moveTr`, ~74 units/second), never a flat crossfade. Every scene ran its
transition over a fixed 0.85s no matter how far the figure walked, so a short
sidestep looked fine and a hundred-unit crossing was sprinted. The feet never
skated — it was purely a timing bug.

> *"I dont want 'fast walking' … I always want this movements to look natural."*

**C18. A walk must be ≥ 60 stage units** (~1.5 strides) or it reads as a shuffle. If
the beat doesn't need the distance, don't move the figure at all.

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

**C20. Every movement must END in a pose a person would still be in.** A beat holds
until the reader taps — up to ten seconds — so the settled pose is what they actually
stare at. **`emoteHold` is the arm-down version**; the raised instant lives in
`emoteLive`'s `lift`, which must return to exactly zero (by 1.5s), because the next
beat's transition blends out of `emoteHold` and a lift still up when the reader taps
would snap the arm down in one frame. Exempt: poses a person *can* hold (hands on
hips, arms folded, hands behind the back, a hand at brow or chin, a slump) and
anything anchored to a prop.

> *"Sometimes the end movement is his hands up in the air or something awkward with
> his hands … I want it to be fixed so the end movements never look strange."*

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

> *"Every word that shows up, every object on screen, and every animation … make sure
> nothing is covered up … dont unnecessarily cover or look not apealing to the user."*

**D32. Legibility can outrank literal scale.** A board drawn larger than life so its
writing is readable is correct. B7 is about *ground-sharing* props; most scene
furniture sits above the figure's crown and is an information surface, not an object
in the room.

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

### G. Engine and tooling

**G46. Figures are native Views driven by Reanimated transforms.** SVG is only for
small, bounded illustration — react-native-svg has no partial invalidation, so any
animated child re-uploads the whole `<Svg>` every frame (~10fps full-screen on an
S24 Ultra).

**G47. Worklet footguns.** A default parameter referencing a module constant is **not**
captured into the worklet runtime — pass gaits explicitly (`strideStance(…, WALK)`).
A worklet calling a worklet defined **later** in the file captures `undefined` and
blanks the screen — define a worklet after everything it calls. Numeric-literal
defaults are safe. And never build React elements inside a `withTiming` completion
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

---

## Part 2 — Authoring checklist

**Story and script**
- [ ] New metaphor and beats; engine reused, not reinvented (F38).
- [ ] Hook → build → struggle → payoff, one idea per beat (F40).
- [ ] Every graded question names its trap (F41); a real primary-source quote (F42).
- [ ] Word limits respected (F44); no "Lesson N" references (F45).
- [ ] Every beat's text and pose agree — concrete claims only (A1, A4).
- [ ] A different gesture each beat; no loops (C19).
- [ ] Any physical claim the vocabulary can't express → add a pose (A2).
- [ ] Secondary figures posed deliberately (A3).
- [ ] Explanations fit the answered deck (D27).

**Scene**
- [ ] Shared `K_FIG`; relative sizes derived (B6); in proportion to ground props (B7).
- [ ] Two figures ≥ ~100 units apart at their closest beat (B9).
- [ ] Anything pinned to the figure derived from `K_FIG` + landmarks (B10).
- [ ] Companion figures given a non-zero seed (B14); every figure has a reason (B15).
- [ ] Interactive props beside/above the figure, never a slab it stands in (D24).
- [ ] Neither props nor figure occlude the other (D23).
- [ ] Walks ≥ 60 units and driven by `moveTr` (C17, C18).
- [ ] Every prop's y-range in a comment; band measured to hold it with a few units of
      air — no more (D25, D26).
- [ ] Labels fit their columns on one line (D30); cards have font-padding slack (D29).
- [ ] Decorative overlays have `pointerEvents="none"` (E36).
- [ ] Deliberate exceptions written down (A5).

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

**Known false positives — verify before "fixing":**
- Elements masked by an ancestor `overflow: hidden` — `getBoundingClientRect` ignores
  ancestor clipping.
- PAPER-on-PAPER shapes, which are invisible anyway.
- A centred `Text` whose *box* overhangs while its glyphs don't.
- Intentional exits: a car looping off-stage, a dog walking out of frame.
- Overflows of **2–3 units are line-box rounding**, everywhere, and benign. Bar at ≥4.
- Never call a collision from a low-resolution contact sheet — zoom the raw capture
  first.
