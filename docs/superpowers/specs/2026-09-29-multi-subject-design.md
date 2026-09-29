# Ashmere goes multi-subject — Phase 1 design

Date: 2026-09-29 · Status: approved in conversation, awaiting spec review

## Why

The owner is taking Ashmere from a philosophy app to a many-subject learning app
to reach a wider audience. Philosophy stays the one live subject; six more are
announced now and filled with courses later. The shape is Brilliant's: swipe
through subjects on Home, browse them as tiles on Learn, open one to reach its
course roads.

## What the owner decided

| Question | Decision |
|---|---|
| What opens when a subject is tapped | A **subject page**, listing that subject's courses. Philosophy's courses are its six branches; each opens its existing stickman road. |
| Tab bar | **Four tabs**: Home · Learn · Pass · Profile. Thinkers is removed. |
| Quotes and thinkers removed in Phase 1 | Home's quote and Thinker of the Day; saved quotes in Profile and Settings. |
| Kept for now | The Quote of the Day phone widget; quotes and tappable philosopher names inside lessons. |
| Home keeps | The header with the streak, and the Continue card (today's Quick Start). Plus the new subject carousel. |
| Home loses | Daily reflection, Thinker of the Day, habit panel, the walking stickman. |
| Coming soon | Each new subject has its **own subject page** with a short road on which the stickman walks up to a "Coming soon" signpost. |
| Subject art | **Drawn object scenes** in the app's flat inked style, one colour per subject. |
| Learn layout | **Two-column grid** of square tiles. |
| Professor's intro | Lives **inside the Philosophy page**: the "Your first lecture" card sits above the six branches, which open after it. Home's Continue card is the intro until it is watched. Never force-plays. |
| Philosophy branch cards | **Redrawn** as drawn scenes too, so the Learn flow is one look. The road screens are unchanged. |
| Lesson quote save button | **Hidden** for now (one change in the shared quote card), so nothing can be saved to a shelf that no longer exists. |

## Phases

- **Phase 1 (this spec):** subjects, Home, Learn, subject pages, Coming-soon pages,
  the Thinkers tab removed, the quote surfaces above removed.
- **Phase 2 (later, after the other sessions finish with lesson files):** quotes and
  tappable names inside lessons, quote/thinker badges and XP, the widget's content,
  and an intro per subject.

## Subjects

`data/subjects.ts` is the one list both Home and Learn read, in this order:

| id | name | status | scene |
|---|---|---|---|
| `philosophy` | Philosophy | live | a classical bust beside an open book |
| `psychology` | Psychology | soon | a head in profile with a thought bubble |
| `personal-growth` | Personal Growth & Self-Help | soon | a sprout climbing a small staircase |
| `business` | Business & Leadership | soon | a briefcase beside a rising bar chart |
| `economics` | Economics & Finance | soon | a stack of coins beside a price line |
| `science` | Science & Technology | soon | a flask with an atom orbiting it |
| `history` | History & Politics | soon | a column beside a rolled scroll |

Each entry has a `name`, a one-line `blurb`, a `hue`, a `status` and `courses`: for
philosophy, the six branch slugs in today's display order; for the others, `[]`. A
new subject later is one entry here.

**Colours.** Each subject takes a hue fitted to the six-swatch palette: tame
(C\* in the palette's own 10–33 band for surfaces), no two closer than the ΔE
floor `design.ts` holds the branch hues to, and clear of the green wedge (hue
130–175) reserved for the verdict. Philosophy's is the palette's DEEP teal.

## Routes

The Learn tab keeps its route name `branches`, so every lesson link, the road,
reviews, `lessonNav` and the stack's `anchor: 'index'` keep working.

| Route | Screen |
|---|---|
| `/(app)/branches` | Learn: the subject grid |
| `/(app)/branches/subject/[subjectSlug]` | Subject page (static `subject` segment outranks `[branchSlug]`) |
| `/(app)/branches/[branchSlug]` | Branch road, unchanged except its back target |
| `/(app)/branches/[branchSlug]/[pathSlug]/lesson/[lessonId]` | Lesson, unchanged |

- **Home carousel card:** pushes the subject page with `withAnchor: true`, through
  `lessonNav`-style helpers, so back returns to Home and the Learn stack has its
  grid underneath.
- **Learn tile:** pushes the subject page; back returns to the grid.
- **Branch road:** back returns to the Philosophy page. A road entered from outside
  the stack (e.g. Continue, the reward screen) gets the Philosophy page pushed under
  it rather than the grid alone.

## Screens

**Home.** Top to bottom:

1. The header with the streak (`HomeHeader`), unchanged.
2. The Continue card (`QuickStartCard`), restyled to the depth kit. It opens the
   professor's intro until it is watched, then the next philosophy lesson.
3. **Subjects** — a horizontal carousel of large cards (about 78% of the width, the
   next card peeking in), snapping one at a time. Each card is the subject's
   drawn scene on its colour, the name, the blurb, and either the reader's progress
   (`N DONE`, never "of N") or a `COMING SOON` tag. Philosophy is first.

Removed from Home: the daily reflection, Thinker of the Day, the habit panel and the
walking stickman. The rating prompt's host stays, and so does the add-widget prompt
on Android, because the widget stays.

**Learn.** A two-column grid of square tiles. Philosophy is a full-width tile on
top as the only live subject, with the reader's progress; the other six fill three
rows below with a `COMING SOON` tag. Every tile is struck in the depth kit: a flat
face on a hard ledge in its own colour, pressed in when tapped. It must fit a
320-wide phone.

**Subject page.** A masthead with the subject's scene, name and blurb, then:

- *Philosophy:* the "Your first lecture" intro card until `seenProfessorIntro` is
  set (moved from the Learn tab, same behaviour), then the six branch cards,
  redrawn as drawn scenes in their branch hues, each with `N DONE` and its unit
  line, each opening its road.
- *Coming soon:* a short stretch of road in the subject's colour. The stickman walks
  in, stops at a signpost reading `COMING SOON`, and waits there, alive but never
  bobbing (group AL). A line under it says courses are on the way. Built from the
  existing road parts (`walkFigure`, `worldPath`, `sceneArt`), not a new engine.

**Tab bar.** `thinkers` leaves the bar and the warm-up list; the four remaining icons
are unchanged.

## Art

- A new zero-import module (like `objects.ts`) holds all 13 drawings: 7 subject
  scenes and 6 branch scenes (e.g. Ethics a balance scale, Logic interlocking
  gears). Flat fills, one ink outline weight, a hard-edged darker side, one small
  ember spark, no gradients — the tab-icon and lesson-object language.
- Each is drawn from a fetched reference picture (`npm run ref`), not from memory.
- **The owner approves a contact sheet of all 13 before any screen is wired.** A
  plain-Node sheet script renders it, as `sheet:objects` does.
- Drawn as Views, or as SVG sized to the tile only; no full-screen or card-sized
  `<Svg>` beyond what the GPU budget rule (§19) allows.

## Removed in Phase 1

- `app/(app)/philosophers/` and `components/thinkers/`, and every link into them.
  The root layout's widget deep link (`pendingThinker`) opens that thinker's
  `PhilosopherSheet` over Home instead of the Thinkers tab. `app/thinker/[id].tsx`
  does the same.
- Home: `DailyReflection`, `ThinkerOfTheDay`, `HabitCard`, `StickmanStroll` usage.
- Profile: the saved-quotes card and anything scored from saved quotes or thinker
  views that is only shown there.
- Settings: the Quotes stat, "Clear Saved Quotes", and the quote-card display
  setting, pruned through `sanitizeSettings()` as §22 requires.
- Pass: the chart's free tiles that name thinkers or saved quotations, with
  `check:pass` updated to match.
- The lesson quote card's save button (shared quote card in `cinematicKit.tsx`, no
  scene file touched).

Data stays in the store (`savedQuotes`, `philosopherViews`) so nothing is lost if
the decision changes; only the screens go.

## Not touched

Lesson scenes and scripts, `rig.ts`, `portal.ts`, the must-box/tour tables,
`RankUpScreen`, `StreakCeremony`, `SeatedWelcome` and the welcome voice — all
being edited by other sessions. The first-install welcome stays philosophy's. No
publish without the owner saying so.

## Verification

- `tsc` and `npm run check`, captured to a file with the exit code echoed.
- `check:nav`, `check:pass`, `check:ui` (warm-up list), `check:events` and
  `check:bible` updated for four tabs and the subject routes.
- A new `check:subjects`: every subject has a drawing, a hue, a blurb; hues are
  distinct and clear of the verdict wedge; every live course is a real branch; no
  Coming-soon subject lists a course.
- Browser screenshots at 390 and 320 wide of Home, Learn, the Philosophy page, a
  Coming-soon page and a branch road, sent to the owner; plus the back-navigation
  paths above replayed against the real router.
- Commits stage only this work's files.
