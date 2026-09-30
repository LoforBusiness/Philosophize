# Dialogue lessons, and Economics lesson 1 — design

Date: 2026-09-29 · Status: approved in conversation, awaiting written-spec review

## Goal

Economics & Finance gets its first lesson, **"What Is Economics?"**, built in a new
lesson format: the **dialogue lesson**. Instead of one narrator under a stage while a
stickman performs, three stickmen ARE the speakers, each with a fixed voice, talking to
each other and to the reader inside a real-life scenario with real, reference-drawn
objects. The lesson is a foundation: what the subject is and why it is worth the
reader's time, never a deep dive.

## Owner's requirements (verbatim intent)

- A subject's first lesson sets a solid, general foundation and makes the reader want more.
- Three voices, all Google Chirp 3 HD, all through the same free-tier source and the
  same character ledger (cap 900,000 a month; report the running total after renders):
  - **Top Hat** stickman → `en-GB-Chirp3-HD-Algieba` (the app's existing voice)
  - **Plain** stickman, no costume → `en-GB-Chirp3-HD-Sadachbia`
  - **Cap** stickman (newsboy cap — chosen by Claude) → `en-AU-Chirp3-HD-Zubenelgenubi`
- A voice is heard only when its stickman is the one speaking.
- Realistic scenarios; stickmen interact with each other and with objects while they talk.
- Simpler content and staging than the redesigned philosophy lessons: fewer moving
  parts, fewer errors, clean, entertaining.
- Every object drawn against a fetched online reference, in the palette, good-looking.
- Natural stickman motion only.
- Intellectual wording, but personal: Top Hat speaks to the reader; the others speak to
  each other.
- Speech that sounds human: pauses, pacing, phrasing.
- Easy, clearly understood questions in fresh visual forms; no order questions.
- Create/update/remove lesson rules as needed.

## Decisions

| Decision | Choice |
|---|---|
| Where spoken words appear | Below the stage, rising letters as today, with a small face tag showing who speaks |
| Economics in the app | Goes LIVE with one course, *Foundations of Economics*; road = this lesson, then a "more coming soon" stop |
| Scenario | Saturday market stall |
| Australian-voice figure | Newsboy cap (`stroller` costume) |

## The lesson

**"What Is Economics?"** · Economics & Finance › Foundations of Economics · lesson 1

Cast: Top Hat (economist, mostly to the reader) · Cap (stall-holder) · Plain (shopper
with one £10 note).

Set (every object from a reference first): striped awning over a trestle counter, crate
of apples, a pie, a book, loaves, a chalk price board, a £10 note, coins as change.

| # | Speaker | Stage | Line (draft) |
|---|---|---|---|
| 1 | Plain → Cap | walks up holding the £10 note | "One ten-pound note. And I want everything on this table." |
| 2 | Cap → Plain | lifts the pie, taps the book | "Everyone does, mate. Pie's six. Book's eight." |
| 3 | Top Hat → reader | steps in, turns to the reader | "What you're watching has a name. Economics… the study of how people choose, when they can't have it all." |
| 4 | Top Hat → reader | gestures over the stall | "Wants never run out. Money, time, bread… they do. That gap is called scarcity." |
| 5 | Plain → Cap | looks pie ↔ book, hands over the note, takes £2 change | "The book, then." |
| 6 | Q1 (stage tap) | pie, £10 note and book glow | "What did that book really cost him?" → **the pie** (opportunity cost) |
| 7 | Top Hat → reader | — | "Everything you choose has one. An hour here is an hour not spent anywhere else." |
| 8 | Cap → both | a second shopper, one loaf left; Cap reaches for the chalk | "One loaf, two customers. Watch this." |
| 9 | Q2 (stage tap) | the price board shows ↑ / → / ↓ | Cap to reader: "What do I do with my price?" → **up** (a price is a signal) |
| 10 | Top Hat → reader | quote | Lionel Robbins, *An Essay on the Nature and Significance of Economic Science* (1932): economics studies human behaviour as a relationship between ends and scarce means which have alternative uses |
| 11 | Summary | — | Scarcity · every choice costs the next-best thing · prices are signals. Closing: "Next time you pay for anything, ask what you gave up. That's where economics begins." |

Lines may be tightened for the ear during writing (group AC/AD); the teaching points and
the question answers above are fixed.

## Engine

- **`speaker` on the beat.** `BaseBeat.speaker?: 'tophat' | 'cap' | 'plain'`. The player
  draws the speaker's face tag beside the narration text when present. Absent on every
  existing lesson, which therefore renders exactly as before.
- **Voice follows the speaker.** One table (`CAST_VOICE`) maps speaker → Chirp voice
  name + language code + speaking rate. The renderer reads the voice from it; no line
  names a voice itself. All lines still encode into the lesson's single `lesson.mp3`,
  so manifest, rising letters, back/forward and seeking are unchanged.
- **`renders.json` records the voice** a take was rendered with; `install-narration`
  refuses a take whose voice disagrees with its beat's speaker.
- **Fixed costumes.** Dialogue lessons declare their cast's costumes; `make:wardrobe`
  and `make:visitor` skip them.
- **Player layers off** for a dialogue lesson: wander, thought bubbles, visitor, lawn
  chair, pen marks. The lesson's generated tables get no entries for it.
- **Staging:** the speaker faces whom he addresses (or the reader) and gestures; the
  listeners hold a listening pose; at most two figures move at once; objects pass
  hand to hand.
- **Voice craft:** pauses in the words (commas, full stops, `[pause short]` markup);
  per-character speaking rate (Top Hat ~0.95, Cap ~1.0, Plain ~1.0). Chirp 3 HD has no
  pitch/volume control, so quieter moments come from phrasing and pauses. Every take
  passes `audioFaults`; a waveform look before install.

## App plumbing

- `BranchKey` gains an economics course key; `constants/design` gains its hue (the
  Economics subject hue family, clear of the verdict wedge).
- `data/subjects.ts`: Economics → `status: 'live'`, `courses: [<economics key>]`,
  `COURSE_LINE` entry.
- The course is a `Branch` with one unit holding the one lesson, added so the lesson
  route, `getLessonById` and the road resolve it; the road ends in a "more coming soon"
  stop after the lesson.
- `check:cinematic`'s 41-lessons-per-branch and level-branch invariants are scoped to
  Philosophy's six branches. Other philosophy-only checks (`check:echo` neighbours,
  `check-mentions`, `check-pass` counts) are reviewed and scoped where they assume
  philosophy.
- Hard paywall applies as to every lesson.

## Rules — new group AP in docs/LESSON_RULES.md

- AP1 A dialogue lesson's every spoken beat has exactly one `speaker` from its cast.
- AP2 A voice is locked to a costume: tophat→Algieba, plain→Sadachbia, cap→Zubenelgenubi.
- AP3 A subject's first lesson is a foundation lesson.
- AP4 Top Hat addresses the reader; the others address each other; nobody narrates.
- AP5 Every drawn object has a fetched reference (group AM applies unchanged).
- AP6 No `order` control in dialogue lessons; stage-tap questions preferred.
- AP7 At most two figures move at once; a listener holds a listening pose.
- AP8 The narrated-lesson player layers are off in dialogue lessons.

## Checks

- **`check:dialogue`** (added to `npm run check`): AP1, AP2 (speaker ↔ voice in
  `renders.json`), fixed costumes, AP6, AP8 (no generated-table entries).
- Existing checks run on the new lesson as on any other (narration, fits, readable where
  run, replay, smooth, objects, still, etc.).

## Budget

~11 lines, ~900 characters; with retakes < 5,000. Ledger today 336,294 / 900,000.
Report the exact figure after rendering.

## Out of scope

More economics lessons; dialogue conversion of existing philosophy lessons; speech
bubbles; per-subject professor intro.
