# Hard paywall and the professor's intro lecture

Date: 2026-09-25 · Status: draft for owner review

## Why

The owner's research found a hard paywall converts better than freemium. Ashmere
moves from "one free lesson a day" to: **every lesson needs the Scholar's Pass or
its 3-day free trial; everything else in the app stays free.** A short lecture
from a professor stickman makes the case before the paywall appears. It is the
reader's first door into the lessons — Home's Quick Start and the Learn tab both
lead to it until it has been watched — and it never plays by itself.

## Decisions already made by the owner

| Question | Answer |
|---|---|
| Existing free readers | Everyone without the Pass gets the hard paywall, including readers mid-streak. No grandfathering. |
| Who sees the intro | Everyone, once: new and existing readers. Pass holders see it too, but skip the paywall step. |
| When | Only when the reader opens it: Home's Quick Start is the intro until it is seen, and Learn shows the intro instead of the branches until it is seen. Never auto-played. |
| Playback | Plays by itself (no tapping), words rising under the picture as he speaks, a Skip button that goes to the end. |
| Voice | The lesson voice (Chirp 3 HD Algieba, en-GB). |
| How it is built | A standalone film on the seated-welcome engine, not a lesson inside `CinematicPlayer`. |

## 1. The intro lecture

**Component:** `components/professor/ProfessorIntro.tsx`, with its choreography
in a zero-import `professorAt.ts` (pure function of time, like `seatedHost.ts`),
so it can be stepped at 60 fps in plain Node. One clock drives everything: the
figure, the chalk, the words, the voice's line starts.

**Stage:**
- The professor wears the `mortarboard` costume from the wardrobe, plus spectacles
  if they read at his size (checked on a sheet before deciding).
- **Chalkboard:** a large slate board on an easel, taking the top two thirds of
  the stage, in the palette's DEEP (`#2A4343`) with a wooden frame and a chalk
  ledge. Chalk is PAPER, with a secondary chalk in SAGE.
- **Props, drawn from reference pictures** (`npm run ref`, as with the lesson
  objects): a lectern with an open book, a stack of books on the floor, a globe,
  and a wall clock.
- The palette's floor, and a soft shadow under the figure.
- Colours come from `constants/design.ts` and `tone.ts` only. `check:professor`
  bans a hex literal anywhere in `components/professor/`, the same rule the
  welcome screen is held to.

**Timeline (≈ 40 s):**
1. He walks in from the right and stops beside the board (≈ 2.5 s).
2. He turns to the reader and speaks six lines (≈ 35 s). On each line he gestures
   toward the board, and the chalk for that line draws itself stroke by stroke.
3. The paywall opens (or, for a Pass holder, the lesson they tapped).

**Draft script** (≈ 106 words ≈ 38 s at the lesson pace; for owner approval before
anything is recorded):

| # | Spoken | Chalk that draws itself |
|---|---|---|
| 1 | "Welcome. Before your first lesson, let me show you what you're about to learn." | `LECTURE ONE`, underlined |
| 2 | "Philosophy has six branches, and each one trains a skill you use every day." | the six branch names in two columns, each with its icon |
| 3 | "Logic teaches you to spot a bad argument before it fools you. Ethics helps you decide what's right when it's hard." | a crossed-out bad syllogism beside a balance scale |
| 4 | "Epistemology asks how you know what you know, which matters every time you read the news." | a large question mark: `HOW DO YOU KNOW?` |
| 5 | "Every lesson is short, narrated and animated, and it ends with a question you have to think through." | `SHORT ✓ NARRATED ✓ ANIMATED ✓` |
| 6 | "Every lesson comes with the Scholar's Pass, and your first three days are free." | `SCHOLAR'S PASS`, then `3 DAYS FREE` circled |

Notes on the script:
- **No lesson count is spoken**, because a recording cannot be re-derived when the
  library grows (§14's rule).
- **"Three days" is fixed in the recording** while the trial length is read live
  from the store. If the Play trial ever changes length, line 6 must be
  re-recorded. That fact is recorded next to the constant in the code.

**Chalk writing:**
- Letters are drawn from a single-stroke vector font (Hershey Simplex, public
  domain), revealed with a dash offset stroke by stroke, the same technique as the
  launch drawing.
- Each stroke is its own small `<Svg>` sized to its box, so no board-sized
  animated SVG is ever repainted (§17 rule 7, §19 GPU budget).
- A faint smudge of dust stays under finished chalk, so the board reads as chalk
  rather than vector type.

**Voice:**
- The six lines are rendered through the existing character ledger, installed and
  encoded into one mp3 the way `make-welcome-voice.mjs` does it.
- A generated `professorVoice.ts` holds the per-line start times and estimated word
  times, which drive the rising words and the chalk timing.
- A listening pass is owed before shipping (AC11).
- The web plays silently, as everywhere else.

**Skip:** a small "Skip" in the top corner. It stops the voice and goes straight
to step 3.

**Seen flag:**
- `seenProfessorIntro: boolean` in `userDataStore`, persisted and cloud-synced. The
  merge is OR, so a signed-in reader never sees it twice.
- It is set when the intro finishes or is skipped.
- There is no XP and no streak for the intro: it is not a stop on the road.

## 2. The trigger — the reader opens it, it never plays by itself

Owner, 2026-09-25: *"they will only see this intro if they are on the home and
click a quickstart which will be the Intro, or if they go to the learn tab they
must click the intro before actually having access to see any of the branches …
I dont want it to force play right away."* A reader can walk round the whole app
without ever meeting it.

The intro is its own hidden route, `app/(app)/intro.tsx` (registered like
`paywall.tsx`, `href: null`), and it has exactly two doors while
`seenProfessorIntro` is false:

1. **Home:** the Quick Start card becomes the intro card — the same card, sky and
   ledge, labelled `QUICK START · INTRO`, titled "Lecture One: What You'll Learn",
   with the button `▶ START THE INTRO`.
2. **Learn:** the six branch cards are not rendered. In their place is one intro
   card with a line saying the branches open after it. Once the flag is true the
   branches appear and the card is gone.

**After the intro** (finished or skipped, the flag is set either way):
- Pass, trial, reviewer or on-device trial (`passState` not `free`): back to the
  screen they came from, which now shows the branches or a real Quick Start.
- Free: the paywall replaces the intro (`source: 'intro'`). Closing it goes back;
  starting the trial or buying goes back too, with everything open.

**Backstop:** a lesson can still be reached another way (a deep link, a thinker's
page). If the flag is false there, the lesson route plays the intro first and then
the lesson or the paywall. That is still a reader tapping something, never an
unprompted play.

**Intro seen, reader free:** tapping a lesson opens the paywall instead of the
lesson (this replaces `LessonLocked` and `DailyLimit`).

The lesson loader and the lesson guide keep their current order behind the intro.

## 3. The hard paywall

- **The gate.**
  - `lessonAccessibility()` returns `gatedByPro: true` for every lesson when
    `isPro` is false.
  - The reading-order rules (sequential within units, units in order for free
    readers) collapse: a free reader has no lessons, and a Pass holder keeps
    today's any-unit, any-lesson access.
- **Unit reviews need the Pass too.** The review route gains the same check (it
  has none today). `check:review` §5's "a review costs a free reader nothing" rule
  is retired, because there is no free lesson day left to protect.
- **Removed:**
  - `FREE_DAILY_LESSON_LIMIT` and the daily-limit screen (`DailyLimit.tsx`).
  - The frozen per-lesson daily gate.
  - The AdMob interstitial after a free reader's lesson. The ads module stays in
    the tree unused, to be deleted in its own commit.
- **Kept:**
  - `dailyLessonCount`, which Home's daily-goal dots still read.
  - Rest days, which still work for Pass holders.
- **Free and open to everyone:** Thinkers (all 341, their quotes, quizzes and facts),
  saving quotes, Profile, ranks, badges, the streak screens, Quote of the Day, the
  widget, settings and the Learn road itself. A locked stop on the road shows its
  title, and tapping it opens the paywall.
- **Existing free readers** lose lesson access the moment the update lands. Their
  progress, XP, ranks, badges and saved quotes are untouched and come back into
  use when they subscribe. Their streak will lapse unless they subscribe. The
  owner accepted this.

## 4. The Pass screens

- **The comparison.** `PassChart` becomes two columns, and `passValue.ts` /
  `passCompare.ts` are rewritten to the new rules:
  - **Free:** thinkers, quotes, profile, ranks and badges, streak screens, Quote of
    the Day.
  - **Scholar's Pass:** every lesson, narrated and animated, plus the unit reviews.
- **Rows that go:** the rows that differed only by quantity — lessons a day,
  replay, start any unit, rest days and ads. The lesson row reads as a cross for
  Free and "Every lesson" for the Pass.
- **The door.** The trial stays the main button and the "subscribe today" box stays
  under it. `trialTerms.ts`'s required wording is unchanged.
- **Same chart everywhere:** the Pass tab, Settings › Subscription, the post-intro
  paywall and the locked-lesson paywall.
- **Retired:** `TrialOffer`'s post-lesson placement (free readers no longer finish
  lessons), `DailyLimit`, and `LessonLocked`, which is folded into the paywall.
- **The paywall screen.**
  - It is `app/(app)/paywall.tsx`, reached with the lesson it should return to.
  - The chart has an arrival animation.
  - A close button in the corner returns to the road.

## 5. Analytics

New declared events in `lib/analytics/taxonomy.ts` (`check:events` requires both
halves):
- `intro_started`
- `intro_skipped`, with `at_line`
- `intro_completed`
- `paywall_shown`, with `source: 'intro' | 'locked_lesson' | 'pass_tab' | 'settings'`

The events that belonged to the daily limit are removed.

## 6. Checks

- **`check:professor`** (offline, new):
  - Steps the timeline at 60 fps: no teleport in the figure, and his feet stay
    planted while he talks.
  - Every chalk stroke stays inside the board.
  - Every chalk word lands on or after the voice reaches its line.
  - The script's word times match the rendered take.
  - No hex literals.
  - Chalk on DEEP clears 4.5:1.
  - Nothing is typed as a number of lessons.
- **`sheet:professor`** (browser): a filmstrip of the whole intro at 390 and 320,
  measured for clipped or overlapping words. It is used to look at the drawing
  before the owner does.
- **`check:pass`**: rewritten to the new rules, so that no screen can claim a free
  lesson and every Free row is re-derived from what is actually open.
- **`check:access`**: rewritten so every lesson is closed to a free reader and open
  to a Pass holder, with unit reviews included.
- **`check:review`** §5: replaced by "a review needs the Pass".
- **Flow proof in the browser**, with a seeded store:
  1. Not seen: Home's Quick Start is the intro card, and Learn shows the intro
     card and no branch card. Nothing plays until one is tapped.
  2. A free reader taps the intro: the intro, then the paywall.
  3. A trial holder taps the intro: the intro, then back to Learn with the
     branches showing.
  4. Seen: Home shows a real Quick Start and Learn shows the six branches.
  5. A free reader who has seen it taps a lesson: the paywall.
  6. A Pass holder who has seen it taps a lesson: the lesson.
  7. Backstop: a lesson URL opened with the flag false plays the intro first.
- **Counter-tests** for the new rules, staged on copies (group AL's rule).

## 7. Shipping

- **No native change**, so this ships over the air to build 22's runtime.
- **The Play listing and store screenshots** may still say "free lessons". The
  owner updates those by hand when this goes live.
- **CLAUDE.md §14** is rewritten to the new model, and §12 and §7 are touched where
  they mention the free daily lesson.

## Constraints

- **Another session is editing** `cinematicKit.tsx`, `moves.ts`, CLAUDE.md and
  about twenty lesson scripts and scenes. This work does not touch
  `CinematicPlayer`, `cinematicKit` or any lesson file. CLAUDE.md is edited last,
  on top of whatever that session has committed.
- **Nothing is committed or published** until the owner asks.

## Out of scope

- Deleting the dead card runner, the ads module or `LessonRunner`.
- Changing the welcome screen or the onboarding questions.
- Changing trial length or price. Those are set in Play Console.
