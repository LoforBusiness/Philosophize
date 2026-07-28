# The Lesson Rule Book

Every rule here exists because a real lesson broke it and it was caught on a real
phone. They are not style preferences — each one is a defect that shipped.

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

> How it actually broke: ethics-8 said someone was on the floor by their bed three
> separate times — in the narration, in the scene's own header comment, and in the
> question prompt ("You are down on the floor beside them") — and drew them
> **standing up**, hunched, on the ground line.

**A2. If the vocabulary can't say it, extend the vocabulary — never substitute the
nearest wrong pose.** The floor bug happened because `rig.ts` had no floor-level
pose at all. The author reached for `46 slump`, which is a *standing* slump, and the
sentence and the picture parted company. Adding codes `48 sit-on-floor` and
`49 kneel-beside` cost twenty lines. Guessing cost a shipped lesson.

**A3. Secondary figures count.** The narrator's pose comes from the script's `p`
field and is easy to eyeball. A second figure — the friend, the opponent, the
apprentice, the crowd — is often posed from a **hard-coded** code inside the scene,
where nobody looks. That is exactly where the floor bug lived. Check every figure on
the stage, not just the one that talks.

**A4. Metaphors are not stage directions.** "The gap **sits** between the premises",
"trust would **collapse**", "beauty **sitting** in the object", "whose verdict should
**carry** more weight" — these are figures of speech. Do not stage them literally.
The rule is about *concrete physical claims about a figure on screen*.

### B. The figure

**B5. One figure scale for the whole app.** The shared `K_FIG` in `cinematicKit.tsx`
is the single source of truth (currently `1.0` → a 103-unit figure, crown at y 397).
**Never declare a local `K_FIG`.** Two lessons did, at `1.35`, which shadowed the
shared constant — so when the app-wide size correction landed, the first two lessons
every new user plays kept drawing figures 35% larger than the other 46. Relative
sizes are fine and should be *derived*: `K_FIG * 0.88` for a shorter apprentice,
`K_FIG * 1.16` for a nearer figure in perspective.

**B6. The figure must be in proportion to the objects around it.** The test is not
"does the figure look nice alone" but "does it look right next to the prop". Sanity
numbers: a boxing ring's corner post is about **0.8×** a boxer; a stone arch that a
person is building tops them at about **1.1×**. Before the correction the boxer stood
head and shoulders over his own corner post (0.58×) and the builder towered over the
arch (0.81×).

**B7. Figure-to-PROP distances stay; figure-to-FIGURE distances scale.** When the
figure's size changes, this is the distinction that decides what moves:

- A figure placed against a **prop** (a builder beside a fixed brick stack, a
  narrator beside an easel) **stays where it is** — that is precisely what puts it
  back in proportion with the prop.
- A figure placed against **another figure** (two boxers squaring off) must have the
  gap **scaled with the body**. Their 130-unit separation was derived from their own
  head size; left alone, smaller boxers just drift apart and the confrontation goes
  limp.

**B8. Anything pinned to the figure must be derived from the figure, not hand-placed.**
A halo, a speech bubble, a thread between two heads — write it in terms of `K_FIG`
and the rig's landmarks so it tracks when the figure changes. Hand-placed literals
rot silently:

- metaphysics-5's aura ring was a literal at `GROUND − 150`; when the figure shrank,
  it floated 33 units above the head it was meant to encircle.
- ethics-8's connecting thread sat at y 336, measured against the old crown at 361;
  at the new crown of 397 it hung in clear paper 60 units above everyone.

Useful landmarks (rig units, multiply by `K_FIG`): pelvis **34** above ground;
head centre **83** above ground (49 above the pelvis); head radius **20**; crown
**103** above ground; shoulder at (±3, −26) from the pelvis; arm reach **33**; leg
reach **37**.

**B9. Reach rules.** From `moves.ts`, and they are load-bearing:

- A **hanging** hand belongs at about **y +6**, near arm's length below the shoulder.
  Park it at y −4 and the solver folds the elbow, the arm bows outward, and it
  encloses a triangle of paper that reads as a hole punched through the body.
- A **raised** hand must clear the head disc. Anything within ~24 units of (0, −49)
  fuses into the skull and the figure loses both its hand and the shape of its head.
  Hands overhead belong at |x| ≈ 26, not |x| ≈ 14. The exceptions are poses where
  touching the face *is* the gesture — a facepalm, a hand at the chin, shielded eyes.
- The **pelvis cannot outrun the legs**: a planted foot needs `34 + bob − footLift ≤ 36`.
- Going **low** is fine (knees bend), but a low pelvis needs the feet moved
  **forward**, or the leg folds straight down and throws the knee out sideways. This
  is why `48 sit-on-floor` puts the feet at x 26–32.

**B10. Feet stay narrow and near-vertical when standing.** A wide sliding stance makes
near-straight legs read as two segmented bars with a gap between them. Deep crouches
and kneels are exempt — bent legs read fine.

**B11. No two figures in lockstep.** Two figures running the same gait from the same
clock move like a mirror and look mechanical. Give each its own seed/habit. (One
lesson also simply had a vestigial duplicate walker nobody noticed.)

**B12. Joints must not show.** The figure is one smooth silhouette. Three separate
causes have produced visible beads at the elbow, knee, wrist and ankle:
- a joint circle drawn **wider** than the bone it caps;
- a **1px-wide** bone stretched by `scaleX`, which rasterises imprecisely and leaves
  white nicks — fixed by drawing bones at `BONE_SRC = 100` and scaling by `len / 100`;
- a **missing** cap where two bones meet (the shoulders had none).
Never "fix" a seam by making a cap bigger. Find which of the three it is.

### C. Motion

**C13. Movement takes the time it actually needs.** A walk's duration comes from its
distance (`moveTr`, ~74 units/second), never a flat crossfade. Every scene ran its
beat transition over a fixed 0.85s no matter how far the figure walked, so a short
sidestep looked fine and a hundred-unit crossing was sprinted. The feet never
skated — the gait is distance-driven — it was purely a timing bug, the right number
of steps crammed into a third of the time.

**C14. Every movement must END in a pose a person would still be in.** A beat holds
until the reader taps, which can be ten seconds, so the settled pose is what they
actually stare at. Fourteen gestures used to rest with a hand in the air —
`celebrate` and `reach-up-high` with both arms locked overhead, `wave` frozen
mid-wave. The rule: **`emoteHold` is the arm-down version**; the raised instant lives
in `emoteLive`'s `lift`, which must return to exactly zero (by 1.5s), because the
next beat's transition blends out of `emoteHold` and a lift still up when the reader
taps would snap the arm down in a single frame.

Poses that are exempt — because a person *can* hold them, or the hand is doing a job:
hands on hips, arms folded, hands behind the back, a hand at the brow or chin, a
slump, and anything anchored to a prop (a lever, a board, a carried load).

**C15. The lesson must never flash.** Layout changes only while the thing being
re-laid-out is invisible. The summary beat hides the stage and gives its height to
the text panel; keyed off the current beat, that collapse happened in the same frame
the index changed — while the panel still showed the **previous** beat's text for
another 168ms, so the old screen visibly leapt into the new screen's slot. Layout
follows the beat the deck is *showing*, which advances on the crossfade's swap.

### D. Nothing is hidden, cut, or covered

**D16. The band must contain every pixel the scene can draw.** The crop shows
*exactly* the declared `[top, bottom]` on every device, so ink outside it is clipped
for **everyone** — this is never a device quirk. Measure the band against every beat,
including elements that animate in, and don't trust a comment: logic-8 declared a
band starting at 96 while its rule card — the thing the lesson is about — started at
32, so only "THEN streets wet" showed, half cut.

**D17. Don't reserve empty band either.** A band much taller than its art makes the
lesson height-limited, so it renders smaller *and* letterboxed for nothing.
epistemology-8 reserved 74 empty rows above its heading and rendered at 0.75 while
its siblings ran at 0.90.

**D18. Deck text must fit the deck.** The deck is `overflow: hidden` and exactly half
the body height, so a line whose bottom passes the deck bottom is simply unreadable.
Check the **answered** state of question beats — prompt + pick + answer + explanation
is the tallest the deck ever gets, and it is where two lessons cut an explanation off
mid-sentence.

**D19. Text must fit its own box.** Two ways a word gets lost that the band and deck
checks cannot see: the card **clips** it (`scrollHeight > clientHeight`), or the text
**spills** past the card's border onto whatever is underneath. aesthetics-5's three
answer cards were 5 units too short for their own subtitles, so "a picture worth
framing" lost "framing".

**D20. No orphaned line breaks.** A short label that wraps strands a fragment on a
line of its own — "OVERWHELM / S", "TOMORRO / W", a tick separated from its word.
The box just grows, so nothing clips and no overflow check fires. A label of ≤26
characters should occupy one line; if it doesn't, the column is too narrow or the
tracking too wide.

**D21. Nothing opaque may cover text.** ethics-6's chart footing landed on the
tally below it: "THE FIVE" was sliced in half by the footing's border and the tally
bracket was hidden behind it entirely. When two props share a column, order them
top-to-bottom explicitly and check the gaps.

**D22. Legibility can outrank literal scale.** A whiteboard drawn larger than life so
its writing is readable, or a mountain that dwarfs the figure on purpose, is correct.
Rule B6 is about *ground-sharing* props. Most scene furniture — charts, cards,
timelines — sits above the figure's crown and is an information surface, not an
object in the room.

### E. House style

**E23. Figures are native Views driven by Reanimated transforms.** SVG is only for
small, bounded illustration. A full-screen animated `<Svg>` measured ~10fps on an
S24 Ultra.

**E24. Worklet footguns.** A default parameter that references a module constant is
**not** captured into the worklet runtime — pass gaits explicitly. A worklet calling
a worklet defined later captures `undefined`. Numeric-literal defaults are safe.

**E25. Don't cross-reference lessons by number.** "As we saw in Lesson 4" breaks
silently the moment anything is reordered, and `tsc` will never tell you. Write
"earlier you saw…".

---

## Part 2 — Authoring checklist

Work top to bottom. Every line is a rule above.

**Script**
- [ ] Every beat's text and its pose agree (A1). Concrete claims only, not metaphors (A4).
- [ ] Any physical claim the pose vocabulary can't express → add a pose (A2).
- [ ] Secondary figures posed deliberately, not left on a hard-coded default (A3).
- [ ] Explanations are short enough for the answered deck (D18).
- [ ] No "Lesson N" cross-references (E25).

**Scene**
- [ ] Uses the shared `K_FIG`; relative sizes derived from it (B5).
- [ ] Figure reads in proportion to the props it shares ground with (B6, D22).
- [ ] Anything pinned to the figure is written in terms of `K_FIG` + landmarks (B8).
- [ ] Walks use `moveTr`, not a flat duration (C13).
- [ ] Two figures don't share a gait phase (B11).
- [ ] Every prop's y-range written down in a comment, and the band measured to hold
      all of it with a few units of air — no more (D16, D17).
- [ ] Labels fit their columns on one line (D20); cards fit their own text (D19).
- [ ] Props sharing a column are ordered and gapped (D21).

**Then run the checks in Part 3. Do not skip them because it "looks fine".**

---

## Part 3 — How to verify

**Measure, don't squint.** A 48-lesson visual review by eye misses exactly the
defects that matter, because clipped text and covered labels look plausible in a
thumbnail. The harness renders each lesson under react-native-web, walks every beat,
and records the exact rectangle of everything drawn. Rebuild it from
`memory/lesson-layout-audit-harness.md` — it has the full recipe, the DOM hooks, and
the two gotchas (Metro's bundling overlay renders *on top of* a mounted player;
`CI=1` disables file watching, so restart after editing).

Four checks are exact rather than matters of taste:

| Check | What it proves |
|---|---|
| **BAND** | Ink outside the declared crop is clipped on every device (D16) |
| **DECK** | Text past the deck's bottom is unreadable (D18) |
| **BOX** | A card clipping or spilling its own text (D19) |
| **WRAP** | A short label broken onto two lines (D20) |

Plus a text/pose scan (A1) that reads every beat's copy for concrete physical claims
and compares them against the pose code — including secondary figures (A3).

**Known false positives — verify before "fixing":**
- Elements masked by an ancestor `overflow: hidden` — `getBoundingClientRect` ignores
  ancestor clipping, so a ladder rung scrolled out of its own window still reports.
- PAPER-on-PAPER shapes, which are invisible anyway.
- A centred `Text` whose *box* overhangs while its glyphs don't.
- Intentional exits: a car looping off-stage, a dog walking out of frame.
- Overflows of **2–3 units are line-box rounding**, everywhere, and benign. Set the
  bar at ≥4.
- Never call a collision from a low-resolution contact sheet — zoom the raw capture
  first. One "collision" turned out to have clear air around it.
