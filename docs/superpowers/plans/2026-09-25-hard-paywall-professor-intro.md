# Hard Paywall and Professor Intro — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Every lesson needs the Scholar's Pass or its trial. Before a reader can
reach any lesson they open a ~40 s self-playing lecture from a professor stickman at
a chalkboard, which ends on the paywall. It is opened from Home's Quick Start or
from the Learn tab, and never plays by itself.

**Architecture:**
- **The gate:** one rule change in `lessonAccess`, with every screen that reads it
  following. The free daily lesson, the post-lesson ad and the post-lesson trial
  offer are deleted.
- **One paywall:** a single component, `HardPaywall`, composed from the existing
  `PassChart` and `PassDoor`, replaces `LessonLocked`, `DailyLimit` and
  `PaywallContent`.
- **The intro:** a standalone film on the seated-welcome engine, in
  `components/professor/`, driven by one clock and one mp3. It lives on its own
  hidden route, `app/(app)/intro.tsx`. While `seenProfessorIntro` is false, Home's
  Quick Start card becomes the intro card and Learn shows an intro card in place
  of the branches. The lesson route plays it only as a backstop, for a lesson
  reached some other way.

**Tech Stack:** Expo 56 / RN / Reanimated 4 / react-native-svg / Zustand / Google
Chirp 3 HD (Algieba en-GB) through the existing TTS ledger.

**Spec:** `docs/superpowers/specs/2026-09-25-hard-paywall-professor-intro-design.md`

## Global Constraints

- **Never touched:**
  - `CinematicPlayer.tsx`, `cinematicKit.tsx`, `moves.ts`, and any `*Scene.tsx` or
    `*Script.ts`.
  - `components/welcome/SeatedWelcome.tsx`, which has uncommitted changes that are
    not ours.
- **Colours:** only from `constants/design.ts` and `components/shared/tone.ts`. No
  hex literal anywhere in `components/professor/`.
- **Voice:** `en-GB-Chirp3-HD-Algieba`, rendered only through
  `scripts/lib/ttsledger.mjs` (the character ledger). Never call Google directly.
- **No typed lesson count** in any UI string or in the recording. Counts are
  derived from `ALL_BRANCHES`.
- **Any `<Svg>` is sized to its own art, never board-sized** (CLAUDE.md §17 rule
  7, §19 GPU budget).
- **Worklets:** a worklet may only call worklets declared above it
  (`check:worklets`), and no plain closure may be referenced inside a worklet.
- **Files are written LF.** Never write edit scripts through a shell heredoc
  (backslashes are eaten); use the editor or a `.mjs` file.
- **Nothing is committed or published** without the owner's say-so. Commit steps
  below stage ONLY the files that task names.

## Review Focus

1. **A reader who starts the trial on the paywall AFTER the intro** must come back
   to the screen they opened it from with the branches now showing. If they came in
   through the lesson backstop, they must land in the lesson they tapped. Both are
   in Task 10's flow proof.
2. **A reader whose trial EXPIRES while a lesson is open** must finish that lesson
   (the lesson route's one-way `everOpen` latch must still hold). The test is
   Task 1's latch case.
3. **Signing in on a second phone** must not replay the intro: the flag merges with
   OR. The test is Task 5's merge case.
4. **Skip on the intro:** it must stop the voice immediately and mark the intro
   seen. Otherwise every Skip replays the intro on the next lesson. The test is
   Task 9's skip case.
5. **Web and Expo Go always report `isPro` false**, so every harness that opens
   lessons (`measure-must`, `check:readable`, `sheet:beats`, …) would now hit the
   paywall and measure nothing. Harnesses render lesson components directly
   rather than through the route, but any that go through the route must pass
   `?test=1`. Task 1 verifies this with a grep.
6. **Nothing plays unprompted.** Opening the app, landing on Home or opening
   Learn must never start the intro; only a tap on one of its two doors does. The
   test is Task 10's case 1, which waits 5 s on each screen and asserts that no
   intro stage has mounted.

---

### Task 1: The access rule is a hard paywall

**Files:**
- Modify: `data/index.ts:97-130` (`lessonAccess`, `lessonAccessibility`)
- Modify: `scripts/check-access.mjs` (expectations)
- Modify: `app/(app)/branches/[branchSlug]/index.tsx:103-104` (the `startable`
  comment only; the logic follows `lessonAccess`)

**Interfaces:**
- Produces: `lessonAccess(li, unitDone, unitStartable, isPro): { open, needsPass }`
  (same signature). When `isPro` is false, every lesson returns
  `{ open: false, needsPass: true }`.

- [ ] **Step 1: Rewrite `check-access.mjs`'s assertions to the new rule.** Keep the
  loader at the top of the file and replace the cases:

```js
// FREE: nothing opens, and the Pass is always the reason.
for (const [li, done, st] of [[0,0,true],[0,0,false],[3,3,true],[2,5,true],[6,2,true]]) {
  const a = lessonAccess(li, done, st, false);
  ok(!a.open && a.needsPass, `free reader, lesson ${li} of a unit at ${done}`, JSON.stringify(a));
}
// PASS: the next lesson and every replay open; one not reached yet is closed with no paywall.
ok(lessonAccess(3, 3, true, true).open, 'pass: the next lesson opens');
ok(lessonAccess(1, 3, true, true).open, 'pass: a replay opens');
ok(lessonAccess(3, 3, false, true).open, 'pass: any unit may be started');
const ahead = lessonAccess(5, 3, true, true);
ok(!ahead.open && !ahead.needsPass, 'pass: a lesson not reached yet is not a paywall');
// THE LATCH: the route keeps an opened lesson open for the visit. The
// transition that matters now is a trial EXPIRING mid-lesson.
ok(lessonAccess(3, 3, true, true).open && !lessonAccess(3, 3, true, false).open,
  'a lesson open on the Pass closes without it — the route latch must hold it');
```

- [ ] **Step 2: Run** `node scripts/check-access.mjs`. Expected: FAIL on the free
  cases (today the free reader's first lesson opens).
- [ ] **Step 3: Implement** in `data/index.ts`:

```ts
export function lessonAccess(
  li: number, unitDone: number, unitStartable: boolean, isPro: boolean
): { open: boolean; needsPass: boolean } {
  // A HARD PAYWALL (2026-09-25): every lesson needs the Pass or its trial.
  if (!isPro) return { open: false, needsPass: true };
  if (li > unitDone) return { open: false, needsPass: false };   // not reached yet
  return { open: true, needsPass: false };                       // next, or a replay
}
```

  Also rewrite the doc comment above it: the three-way reasoning goes, and the one
  line of history stays. `unitStartable` remains in the signature so that no caller
  changes; note that it is now always true for the Pass.

- [ ] **Step 4: Run** `node scripts/check-access.mjs` and `npx tsc --noEmit`.
  Expected: PASS.
- [ ] **Step 5: Harness guard (Review Focus 5).** Run
  `grep -rn "lesson/\${" scripts/*.mjs`. Every harness URL that goes through the
  lesson ROUTE must carry `test=1`. Add it where it is missing.
- [ ] **Step 6: Commit** (with the owner's approval): `data/index.ts`,
  `scripts/check-access.mjs`, the branch screen and any harness touched.

### Task 2: The free daily lesson, the post-lesson ad and the post-lesson offer are gone

**Files:**
- Modify: `constants/subscription.ts` (delete `FREE_DAILY_LESSON_LIMIT`; keep
  `lessonsWord` only if still used)
- Modify: `app/(app)/branches/[branchSlug]/[pathSlug]/lesson/[lessonId].tsx`
  (delete `atLimitRef`/`atLimit`, the `DailyLimit` import and branch, and the
  `FREE_DAILY_LESSON_LIMIT` import)
- Modify: `components/lesson/LessonReward.tsx` (delete `atLimit`, `offer`,
  `TrialOffer`, `ads.showInterstitial()`, and `openPaywall` on Continue.
  `StreakCeremony`'s `moreToday` becomes `true`)
- Modify: every other importer that `grep -rn FREE_DAILY_LESSON_LIMIT` finds
  (`_layout.tsx`, `PhilosopherSheet.tsx`, `devlessons.tsx`, `settings.tsx`,
  `passValue.ts`)
- Delete: `components/paywall/DailyLimit.tsx`, `components/paywall/TrialOffer.tsx`
  (only if nothing else imports it after this task)

- [ ] **Step 1: Add the ratchet first.** In `scripts/check-pass.mjs` add a section
  that fails if `FREE_DAILY_LESSON_LIMIT`, `DailyLimit`, `showInterstitial` or
  `TrialOffer` appears in any `.ts`/`.tsx` under `app/`, `components/`, `lib/` or
  `constants/` (comments stripped first, per L8). Run
  `npm run check:pass`. Expected: FAIL, listing every current site.
- [ ] **Step 2: Remove each site.** At each one, delete the branch and its imports.
  In `LessonReward.handleContinue` the flow becomes: commit, then exit, with no ad
  and no paywall. Keep `dailyLessonCount` and `bumpDailyLessons` (Home's goal dots
  read them).
- [ ] **Step 3: Run** `npx tsc --noEmit && npm run check:pass`. Expected: tsc is
  clean. `check:pass` still fails, but only on its old PASS_LINES assertions, which
  Task 4 replaces.
- [ ] **Step 4: Commit** the files above.

### Task 3: Unit reviews need the Pass

**Files:**
- Modify: `app/(app)/branches/[branchSlug]/[pathSlug]/review.tsx`
- Modify: `app/(app)/branches/[branchSlug]/index.tsx` (a review stop on the road
  opens the paywall for a free reader)
- Modify: `scripts/check-review.mjs` §5

- [ ] **Step 1: Replace `check-review` §5.** The old rule says a review must never
  call the daily counter. The new rule: `review.tsx` must read
  `useSubscriptionStore((s) => s.isPro)`, and when it is false must render
  `<HardPaywall source="locked_review" …/>` instead of `UnitReview`. It is checked
  on comment-stripped source. Run it. Expected: FAIL.
- [ ] **Step 2: Implement** in `review.tsx`:

```tsx
const isPro = useSubscriptionStore((s) => s.isPro);
if (!isPro && !testing) {
  return <HardPaywall source="locked_review" onClose={() => router.back()} />;
}
```

  Then, in the road's `onPress` for a stop where `l.review` is true: if `!isPro`,
  call `openPaywall()` instead of `openReview`.
- [ ] **Step 3: Run** `npm run check:review && npx tsc --noEmit`. Expected: PASS.
  This depends on Task 6's `HardPaywall`, so do Task 6 first, or stub the import
  and finish this task after Task 6.
- [ ] **Step 4: Commit.**

### Task 4: What the Pass buys, re-derived for a hard paywall

**Files:**
- Modify: `lib/utils/passValue.ts` (`PASS_LINES`, `longFree`, `longPass`,
  `includedLines`; delete `daysAtFreePace`, `paceLabel`, `allowanceLabel`,
  `msToRenewal` and `renewalLabel` if no importer remains)
- Modify: `lib/utils/passCompare.ts` (`compareRows`, `includedTiles`)
- Modify: `components/paywall/PassChart.tsx` (labels and column headers only; the
  drawing stays)
- Modify: `scripts/check-pass.mjs` (§1–§7, §9)

**Interfaces:**
- Produces:
  - `PASS_LINES: readonly PassLine[]`, with `PassLine.id` in `'lessons' | 'reviews'`.
  - `FREE_THINGS: readonly { id: 'thinkers'|'quotes'|'profile'|'ranks'|'streak'|'daily'; label: string; figure: string | null }[]`
  - `compareRows()` returns the lessons and reviews rows (Free = cross, Pass = the
    words).
  - `includedTiles()` returns one tile per `FREE_THINGS` entry.

- [ ] **Step 1: Rewrite `check-pass`'s claims first:**
  - (a) Every row's Free cell is a cross. No Free cell may contain a digit or the
    word "lesson".
  - (b) Every `FREE_THINGS` figure is re-counted independently: thinkers from
    `ALL_PHILOSOPHERS`, saveable quotes by the existing count, ranks and badges.
  - (c) Retired ids (`ads`, `replay`, `units`, `rest`) must not appear.
  - (d) The Pass tab and Settings sources contain no literal digit (the existing
    rule, kept).
  - (e) `trialTerms` sentences are still present on every door (the existing §9g,
    kept).

  Run it. Expected: FAIL.
- [ ] **Step 2: Implement.** The new `PASS_LINES`:

```ts
export const PASS_LINES: readonly PassLine[] = [
  { id: 'lessons', label: 'Lessons', free: null, pass: `All ${libraryShape().lessons}, narrated` },
  { id: 'reviews', label: 'Unit reviews', free: null, pass: `All ${libraryShape().units}` },
];
export const FREE_THINGS = [
  { id: 'thinkers', label: 'Thinkers', figure: `${PHILOSOPHER_COUNT}` },
  { id: 'quotes',   label: 'Saved quotes', figure: `${saveableQuotes()}` },
  { id: 'profile',  label: 'Your profile', figure: null },
  { id: 'ranks',    label: 'Ranks & badges', figure: `${RANK_COUNT + BADGE_COUNT}` },
  { id: 'streak',   label: 'Streak', figure: null },
  { id: 'daily',    label: 'Quote of the day', figure: null },
] as const;
```

  `PassChart` reads `compareRows()` and `includedTiles()` exactly as today. Change
  only its header text: the Free column says "Free" and its tiles sit under the
  heading "FREE FOR EVERYONE". Measure the narrow phone with
  `DEVICE_W=320 npm run sheet:pass`.
- [ ] **Step 3: Run** `npm run check:pass && npx tsc --noEmit && npm run sheet:pass`
  and `DEVICE_W=320 npm run sheet:pass`. Expected: PASS, with nothing clipped at
  either width. Look at the PNGs.
- [ ] **Step 4: Commit.**

### Task 5: The seen flag

**Files:**
- Modify: `stores/userDataStore.ts` (state `seenProfessorIntro: boolean`, default
  `false`; action `markProfessorIntroSeen()`; include it in `partialize`; reset in
  `resetForSignOut`)
- Modify: `lib/supabase/sync.ts` (add it to `CloudState` and `SYNC_FIELDS`; merge
  with OR)
- Modify: `scripts/check-rest.mjs` or whichever check already exercises the sync
  merge (grep for `mergeCloud`); if none does, add
  `scripts/check-seen-intro.mjs` and add it to the `check` script

- [ ] **Step 1: Write the test.** Import the merge function via
  `scripts/lib/register.mjs`, then assert:
  - `merge({seenProfessorIntro:false},{seenProfessorIntro:true}).seenProfessorIntro === true`
  - `merge({seenProfessorIntro:true},{seenProfessorIntro:false}).seenProfessorIntro === true`
  - `merge({}, {})` gives `false`.

  Run it. Expected: FAIL (the field is unknown).
- [ ] **Step 2: Implement.** In the merge:
  `seenProfessorIntro: !!(local.seenProfessorIntro || remote.seenProfessorIntro)`.
  Follow `badgesInitialized`'s path through `snapshotLocal` and the apply step.
- [ ] **Step 3: Run the test and tsc.** Expected: PASS.
- [ ] **Step 4: Commit.**

### Task 6: One paywall, `HardPaywall`

**Files:**
- Create: `components/paywall/HardPaywall.tsx`
- Modify: `components/shared/PaywallSheet.tsx` (renders `HardPaywall`)
- Modify: `app/(app)/paywall.tsx` (renders `HardPaywall`; reads `lesson` and
  `branch` search params so a purchase can resume the lesson)
- Modify: the lesson route (the `locked` branch renders `HardPaywall`)
- Delete: `components/paywall/LessonLocked.tsx`, and
  `components/shared/PaywallContent.tsx` once nothing imports it
- Modify: `lib/analytics/taxonomy.ts` (add `paywall_shown` with
  `source: 'intro'|'locked_lesson'|'locked_review'|'pass_tab'|'settings'`; retire
  events only the deleted screens sent)

**Interfaces:**
- Produces:
  `export default function HardPaywall(props: { source: PaywallSource; onClose: () => void; onUnlocked?: () => void }): JSX.Element`
  - `PaywallSource` is the union above.
  - `onUnlocked` fires once `isPro` becomes true while the screen is mounted, after
    a trial starts or a purchase lands.
- Layout, top to bottom:
  - A close button, top left (44 pt target).
  - A heading: "Unlock every lesson".
  - `<TrialStatus>`, only while a trial is running.
  - `<PassChart arrival />`.
  - `<PassDoor source={source} />`.
  - The `trialTerms` small print that `PassDoor` already carries.
  - It scrolls on a 320 × 640 phone.

- [ ] **Step 1: Extend `scripts/sheet-pass.mjs`.** Add a `hardpaywall` case that
  mounts `HardPaywall` through `scripts/lib/previewpass.txt`, both with and without
  `basePlan`, and checks the same things the sheet already checks (mounted, no
  overflow, nothing clipped, 4.5:1). Run it. Expected: FAIL (the component does not
  exist yet).
- [ ] **Step 2: Implement the component.** It calls
  `track('paywall_shown', { source })` once on mount, and uses a
  `useEffect(() => { if (isPro) onUnlocked?.(); }, [isPro])` guarded by a ref so it
  fires once.
- [ ] **Step 3: Wire the three places it appears.** In the lesson route, the locked
  branch becomes:

```tsx
if (locked) {
  return (
    <ScreenTransition bg={Page}>
      <HardPaywall source="locked_lesson" onClose={exitLesson} onUnlocked={() => { /* live access flips; nothing to do */ }} />
    </ScreenTransition>
  );
}
```

  Because access is computed live, a successful purchase re-renders the route
  straight into the lesson.
- [ ] **Step 4: Run** `npx tsc --noEmit && npm run sheet:pass && DEVICE_W=320 npm run sheet:pass && npm run check:events`.
  Expected: PASS. Look at the PNGs.
- [ ] **Step 5: Commit.**

### Task 7: The professor's recording

**Files:**
- Create: `components/professor/professorScript.ts` (zero imports:
  `export const LINES: { id: string; text: string; chalk: ChalkId }[]`, the six
  lines from the spec, verbatim)
- Create: `scripts/make-professor-voice.mjs`, copied from
  `scripts/make-welcome-voice.mjs` with the job name `professor`, the lines read
  from `professorScript.ts`, and output to `assets/professor/voice/professor.mp3`
  plus `components/professor/professorVoice.ts`
  (`VOICE_LINES: { text: string; at: number; end: number; words: number[] }[]`)
- Modify: `package.json` (`"make:professor-voice": "node scripts/make-professor-voice.mjs"`)

- [ ] **Step 1: Read `make-welcome-voice.mjs` end to end.** Note its ledger calls,
  its pause markup (`[pause long]` after each line, which prevents the mid-word
  cut-off recorded in memory `seated-welcome`), its encoder call (`FFMPEG` env) and
  its word-time estimator.
- [ ] **Step 2: Write the script file and the maker.** Put a `[pause long]` after
  each line. Record `renders.json`-style provenance so a changed line fails a
  check.
- [ ] **Step 3: Render.** Run `FFMPEG=<path> npm run make:professor-voice`.
  Expected: one mp3 of about 38 s, with each line's `at` increasing.
- [ ] **Step 4: Check for a broken take.** Run the narration burst test on it: reuse
  `scripts/lib/narration.mjs`'s clip limits (peak run, loudest 50 ms, pace band).
  If a take is refused, re-request with a varied request (sample rate stated, or
  speaking rate 0.99), per memory `tts-narration-plan`.
- [ ] **Step 5: Commit** the script, the maker, the mp3, the generated voice file
  and `package.json`.

### Task 8: The chalkboard and the chalk

**Files:**
- Create: `components/professor/hershey.ts` (zero imports; Hershey Simplex glyph
  stroke data for `A–Z`, `0–9`, `'`, `?`, `✓` drawn as a 2-stroke tick, and a
  space; public domain)
- Create: `components/professor/chalk.ts` (zero imports;
  `layoutChalk(id: ChalkId, box: {w:number,h:number}): ChalkStroke[]` where
  `ChalkStroke = { d: string; len: number; box: {x,y,w,h}; t0: number; t1: number }`
  and times are fractions 0..1 of that line's chalk window; also the diagrams: the
  six branch names with their glyph ids, the crossed-out syllogism, the balance
  scale, the question mark, the tick list, the circled `3 DAYS FREE`)
- Create: `components/professor/ChalkStroke.tsx` (one `<Svg>` sized to
  `stroke.box`, with `strokeDashoffset` driven by a derived value from the one
  clock; PAPER at 0.92 opacity, width 2.2, round caps, plus a 0.18-opacity 5-px
  dust underlay drawn once the stroke finishes)
- Create: `scripts/sheet-chalk.mjs` (plain Node, using
  `scripts/lib/rasterpath.mjs`: draws every `ChalkId` at its finished state onto
  DEEP, one PNG per id, at 390-wide scale)

- [ ] **Step 1: Write `check:professor`'s chalk section first**
  (`scripts/check-professor.mjs`, added to `check` and to `package.json`):
  - Every stroke box lies inside the board box.
  - Every `t0 < t1`, with values in [0, 1].
  - Each line's strokes are ordered by `t0`.
  - Every chalk word's glyphs exist in `hershey.ts`.
  - PAPER on DEEP clears 4.5:1.
  - No hex literal appears in `components/professor/`.

  Run it. Expected: FAIL (the modules do not exist).
- [ ] **Step 2: Implement `hershey.ts` and `chalk.ts`.** Deal each line's time out
  by stroke LENGTH, so the chalk moves at one speed, as the launch drawing's
  schedule does.
- [ ] **Step 3: Run** `npm run check:professor && node scripts/sheet-chalk.mjs`.
  Look at every PNG. The branch names must read at phone size, and the tick list
  must not collide.
- [ ] **Step 4: Commit.**

### Task 9: The professor, the room and the film

**Files:**
- Create: `components/professor/professorAt.ts` (zero imports:
  `professorAt(t: number): { x: number; mode: 'walk'|'turn'|'speak'|'point'; lineIdx: number; lineT: number }`,
  plus `T_WALK`, `T_END` and `LINE_AT` read from `professorVoice.ts`)
- Create: `components/professor/lectureRoom.ts` (zero imports: part lists for the
  board and easel, the lectern with an open book, the book stack, the globe and the
  wall clock, in `Silhouette`'s `ell`/`rect`/`bar`/`tri` part format; each drawn
  after a reference fetched with `npm run ref`)
- Create: `components/professor/ProfessorIntro.tsx`
- Create: `scripts/sheet-professor.mjs` (browser filmstrip at 18 instants, 390 and
  320 wide, via its own preview route written with `claimRoute`; measures clipped
  or overlapping words)
- Modify: `scripts/check-professor.mjs` (timeline section)

**Interfaces:**
- Consumes:
  - `LINES` (Task 7), `VOICE_LINES` (Task 7), `layoutChalk` and `ChalkStroke` (Task 8).
  - `Stickman` with wardrobe `mortarboard`, and the rig from
    `components/lesson/cinematic/rig.ts`, imported read-only.
  - `hostVoice` from `components/welcome/hostVoice.ts` (its interface; the file is
    not edited).
- Produces:
  `export default function ProfessorIntro(props: { onDone: (how: 'finished' | 'skipped') => void }): JSX.Element`

- [ ] **Step 1: Write `check:professor`'s timeline section.** Step
  `professorAt` at 60 fps:
  - The figure moves under 12 units per frame.
  - No planted foot slides more than 3 units while he speaks.
  - `lineIdx` never decreases.
  - `T_END` lies within 30–45 s.
  - Every chalk window starts at or after its line's `at`.

  Run it. Expected: FAIL.
- [ ] **Step 2: Implement `professorAt`.**
  - **The walk:** he walks in from x 430 to x 300 (off stage right), using
    `rig.moveTr` for the duration and `strideStance` for the gait, the same way
    `seatedHost` does.
  - **The turn:** he turns to face the reader.
  - **Each line:** a gesture toward the board at the line's start (move code 183,
    point), then a talking hold. There is no vertical wobble (group AL).
- [ ] **Step 3: Implement `lectureRoom.ts`.** Fetch the references first:
  `npm run ref -- "school chalkboard easel"`, `"wooden lectern"`,
  `"desk globe"`, `"school wall clock"`, `"stack of old books"`. Read each image,
  then draw it. Render the pieces with the existing `Silhouette` component. Check
  them on a sheet (`node scripts/sheet-professor.mjs --room`) before moving on.
- [ ] **Step 4: Implement `ProfessorIntro.tsx`.** Model it on `SeatedWelcome`'s
  structure (one `useFrameCallback` clock, the voice started at `t=0` through
  `hostVoice`, `RisingText`-style words under the stage from `VOICE_LINES`). Lay it
  out as:
  - the stage (the room plus the figure),
  - the board with a `ChalkStroke` per stroke for lines up to the current one,
  - the caption band,
  - a "Skip" button in the top-right, 44 pt.

  Skip calls `hostVoice.stop()` and then `onDone('skipped')`. Reaching `T_END`
  calls `onDone('finished')`. It tracks `intro_started` on mount,
  `intro_skipped {at_line}` and `intro_completed`, all declared in the taxonomy.
- [ ] **Step 5: Run** `npm run check:professor`, `node scripts/sheet-professor.mjs`
  and `DEVICE_W=320 node scripts/sheet-professor.mjs`. Look at every frame: the
  figure beside the board, chalk inside the board, and no word clipped or
  overlapping. Send the owner the strip.
- [ ] **Step 6: Commit.**

### Task 10: The two doors (Home and Learn), the intro route, and the backstop

**Files:**
- Create: `app/(app)/intro.tsx` (a hidden route hosting `ProfessorIntro`; takes
  optional `lesson`/`branch`/`unit` params only when the lesson backstop is the
  caller)
- Modify: `app/(app)/_layout.tsx` (register `intro` with `href: null`, exactly as
  `paywall` is registered)
- Modify: `components/home/QuickStartCard.tsx` (intro variant while the flag is false)
- Modify: `app/(app)/branches/index.tsx` (the Learn tab: intro card instead of the
  branch cards while the flag is false)
- Modify: `app/(app)/branches/[branchSlug]/[pathSlug]/lesson/[lessonId].tsx` (the
  backstop)
- Create: `scripts/check-paywall-flow.mjs` (+ `package.json` script `check:paywall-flow`)

**Interfaces:**
- Consumes: `seenProfessorIntro`/`markProfessorIntroSeen` (Task 5), `HardPaywall`
  (Task 6), `ProfessorIntro` (Task 9), `passState` from `subscriptionStore`.
- Produces: `components/professor/openIntro.ts` →
  `export function openIntro(): void` (`router.push('/(app)/intro')`), the one
  call both doors make, so the route string is in one place.

- [ ] **Step 1: Write the flow proof,** `scripts/check-paywall-flow.mjs`: a browser
  harness on its own preview route (claimed with `claimRoute`, so it cannot delete
  another harness's), with a seeded store. It runs seven cases:
  1. not seen: Home mounts a card labelled `QUICK START · INTRO` and Learn mounts
     `nativeID="learn-intro"` with zero branch cards (`accessibilityLabel` starting
     "Open "). After 5 s on each, no `nativeID="professor-stage"` exists (Review
     Focus 6);
  2. free, taps the Learn intro card: the professor stage mounts, and after Skip
     `HardPaywall` mounts with `source=intro` and the flag is true;
  3. trial (seeded `isPro` true, `passState` trial), taps the Home card: the intro
     plays, then after Skip it goes back to Home, whose card is now a real lesson;
  4. seen: Home's card names a lesson and Learn shows six branch cards;
  5. free, seen, opens a lesson URL: `HardPaywall` with `source=locked_lesson`;
  6. Pass, seen, opens a lesson URL: the lesson stage mounts;
  7. backstop: free, not seen, opens a lesson URL: the intro first, then after Skip
     `HardPaywall`.

  Run it. Expected: FAIL.
- [ ] **Step 2: The intro route.** `app/(app)/intro.tsx`:

```tsx
export default function IntroRoute() {
  const passState = useSubscriptionStore((s) => s.passState);
  const markSeen = useUserDataStore((s) => s.markProfessorIntroSeen);
  const [phase, setPhase] = useState<'film' | 'paywall'>('film');
  // Every hook above this line (§17 rule 1).
  const leave = () => (router.canGoBack() ? router.back() : router.replace('/(app)'));
  if (phase === 'film') {
    return (
      <ProfessorIntro onDone={() => {
        markSeen();
        if (passState === 'free') setPhase('paywall'); else leave();
      }} />
    );
  }
  return <HardPaywall source="intro" onClose={leave} onUnlocked={leave} />;
}
```

  Register it in `app/(app)/_layout.tsx` beside `paywall`, hidden from the tab bar.
- [ ] **Step 3: Home's door.** In `QuickStartCard`, read
  `seenProfessorIntro`. When it is false, render the same card (same sky, scrim,
  tab and ledge) with the tab text `QUICK START · INTRO`, the title
  `Lecture One: What You'll Learn`, the meta line `WITH THE PROFESSOR · 1 MIN`, the
  button `▶   START THE INTRO`, and `onPress={openIntro}`. The title fits the
  existing two-line clamp: measure it at 320 wide against
  `PlayfairDisplay_700Bold` 34 with `scripts/lib/ttfwidth.mjs`. The `if (!pick)
  return null` early return moves BELOW the intro branch, so a reader who has
  finished everything still gets a door.
- [ ] **Step 4: Learn's door.** In `app/(app)/branches/index.tsx`, read
  `seenProfessorIntro`. When it is false, render `LearnPlate`, then one `Card
  tone="ink"` (`nativeID="learn-intro"`, the first branch photograph as its face,
  kicker `START HERE`, title `Lecture One`, the line "A one-minute introduction.
  The branches open after it.", and `onPress={openIntro}`). No branch card is
  rendered. The footer reads "Watch the introduction to begin". When the flag is
  true the screen is exactly as it is today.
- [ ] **Step 5: The backstop in the lesson route.** After the hydration guard, and before `locked`:

```tsx
const seenIntro = useUserDataStore((s) => s.seenProfessorIntro);
const markSeen = useUserDataStore((s) => s.markProfessorIntroSeen);
const [afterIntro, setAfterIntro] = useState(false);
// … (hooks above every early return)
if (!seenIntro && !testing && !afterIntro) {
  return (
    <ScreenTransition bg={Page}>
      <ProfessorIntro onDone={() => { markSeen(); setAfterIntro(true); }} />
    </ScreenTransition>
  );
}
if (locked) {
  return (
    <ScreenTransition bg={Page}>
      <HardPaywall source={afterIntro ? 'intro' : 'locked_lesson'} onClose={exitLesson} />
    </ScreenTransition>
  );
}
```

  Every hook must sit above the first early return; add a comment saying so (§17
  rule 1). This branch only runs for a lesson reached some way other than the two
  doors, which is still a reader's tap.
- [ ] **Step 6: Run** `node scripts/check-paywall-flow.mjs && npx tsc --noEmit &&
  npm run check:nav`. Expected: all seven cases pass. `check:routes` will flag
  `app/(app)/intro.tsx` until it is git-tracked (git is its oracle); that clears at
  commit and is expected until then. Send the owner screenshots of both doors.
- [ ] **Step 7: Commit.**

### Task 11: Documentation and the whole suite

**Files:**
- Modify: `CLAUDE.md`:
  - §14: rewrite "What the Pass actually buys" as a hard paywall, and add a section
    on the professor intro.
  - §12: the Money bullet.
  - §2: note the analytics events.
  - §3: add `components/professor/`.
  - Remove "one free lesson a day" everywhere it appears (`grep -n "free lesson\|daily lesson\|FREE_DAILY" CLAUDE.md`).
- Modify: `docs/LESSON_RULES.md`, only if it mentions the free daily lesson.

- [ ] **Step 1: Run** `npm run check > /tmp/check.log 2>&1; echo $?`. Read the
  failures and fix only what this work introduced (memory `ratchets-move-sideways`).
- [ ] **Step 2: Run** `npm run check:bible`. Expected: exit 0.
- [ ] **Step 3: Update memory.** Add a project note on the hard paywall and the
  professor intro.
- [ ] **Step 4: Report to the owner.** Include the filmstrip and the paywall PNGs.
  Ask before committing or publishing. The Play listing text ("free lessons") is
  theirs to update.
