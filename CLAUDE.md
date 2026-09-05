# Ashmere — Project Bible

> **The app is called Ashmere. The repo, the slug and the package are not.**
> `slug: Philosophize`, `scheme: philosophize` and `package: com.philosophize.app`
> all stay as they are — a Play package name is immutable once published, and the
> slug keys the EAS project. Only `expo.name` carries the brand, and it is a
> COMPILED resource (§18). The app has been renamed twice: Philosophize → Deeply
> in build 20, Deeply → Ashmere in build 21.

> Philosophy as gameplay, not lecture. Interactive micro-lessons that make thinking feel like a superpower.

---

## 1. Project Overview

**Ashmere** is a mobile philosophy learning app for iOS and Android. It makes philosophy interactive, visual, and gamified — using micro-lesson cards, XP systems, streaks, and curiosity-driven progression instead of walls of text.

**Target audience:** Ages 16–35, curious beginners with no prior philosophy background.

**Core principle:** Every screen should make the user feel smarter, not more confused.

> **`npm run check:bible` re-derives every number in this file from the repo** —
> the gate constant, the composed philosopher array, the cinematic validator,
> package.json, app.json. It is not in `npm run check`, because a legitimate
> version bump should not break an unrelated build; run it whenever you change
> something this file talks about. It exists because a single audit found this
> file claiming versionCode 16 while 19 was live and gating every user, ~223
> philosophers against 322, and a whole section explaining that reminders reach
> nobody — four days after the binary carrying them shipped.

**Live: SHIPPED on Google Play**, full public rollout, package `com.philosophize.app`.
Current binary is **versionCode 21** (2026-08-19), carrying the Ashmere name and
the reader icon. 17 and 18 exist in `eas build:list` but both ERRORED, so 19 is
the successor to 16. Content and JS ship over the air between binaries (see §18)
— a new build is only needed for native changes, app icons, splash, or anything
else baked into the APK.

> **A rename is a BUILD, and this is why.** `expo.name` becomes the `app_name`
> string resource and then `android:label` — a compiled resource, like the icons,
> the splash and the notification icon. No OTA can touch any of them. So a reader
> on an older binary gets an app that calls itself Ashmere on every screen while
> their home screen still says something else under a different picture, and
> nothing but the store can reconcile that. Verify a rename the same way you
> verify an icon: unzip the AAB (§18). Build 21's resources contain "Ashmere"
> once and "Deeply" and "Philosophize" zero times.

**Three binaries did more than bump a version.** 19 was the first carrying
`expo-notifications` and `expo-audio`, which made reminders (§22) and sound (§2)
— both described as unreachable in this file at the time — live for everyone who
can open the app. **20 carries `lib/updates/firstRun.ts`**, which takes the newest
published bundle before deciding what a brand-new reader sees, and so ends the one
thing an OTA could never reach: the welcome screen (§19). **21 is the rename to
Ashmere** and the new mark — the seated reader with his mug and his book,
replacing the letterpress D.

---

## 2. Tech Stack Reference

| Layer | Tool | Version | Role |
|---|---|---|---|
| Framework | Expo | ~56 | Managed React Native, OTA updates, EAS Build |
| Language | TypeScript | ~6 | Strict mode; discriminated unions for card types |
| Navigation | Expo Router v3 | ~56.2 | File-based routing with typed routes |
| Styling | NativeWind v4 | latest | Tailwind CSS utility classes in React Native |
| Animations | React Native Reanimated | 4.x | Gesture-driven interactions (drag, swipe) |
| Declarative Anim | Moti | latest | Enter/exit animations (feedback panels, toasts) |
| State (session) | Zustand | latest | Active lesson state — ephemeral, never persisted |
| State (server) | TanStack Query | v5 | Provider mounted; **unused for progress today** (see §4) |
| Backend | Supabase | 2.x | Auth **and** cloud sync of the progress snapshot (see §4) |
| Auth storage | expo-secure-store | ~56 | Session in the Keychain/Keystore, **not** plaintext AsyncStorage |
| Local storage | AsyncStorage | 2.2 | Persists `userDataStore` (key `philosophize-userdata`) |
| Icons | react-native-svg | 15.15 | Hand-drawn B&W `SketchIcon` + `Glyph` sets (not Ionicons) |
| Fonts | @expo-google-fonts | latest | Playfair Display (headings), Inter (body), Caveat, IM Fell English, Cormorant + EB Garamond |
| Gradients | expo-linear-gradient | ~56 | Scrims over photographic backgrounds (§19) |
| Build version | expo-application | ~56 | Real APK versionCode — powers the forced-update gate (§20) |
| OTA | expo-updates | ~56 | EAS Update; **runtime-versioned** — read §18 before publishing |
| Subscriptions | react-native-purchases | 10.x | RevenueCat; entitlement `scholars_pass` |
| Ads | react-native-google-mobile-ads | 16.x | AdMob interstitial for free users only |
| Analytics | posthog-react-native | 4.x | Manual `$screen` events; consent-gated |
| Reminders | expo-notifications | ~56 | **LOCAL only** — no server, no push token. Live since build 19 (§22) |
| Widget | react-native-android-widget | 0.20 | Android home-screen "Quote of the Day" |
| Validation | Zod | 4.x | API boundary validation only |
| Date math | date-fns | 4.x | Streak calculation |
| Haptics | expo-haptics | ~56 | Live in the runners via `lib/feedback.ts` |
| Sound | expo-audio | ~56 | Live since build 19; clips are GENERATED, not sampled (`scripts/make-sounds.mjs`) |

Every native-dependent module has a `stub.ts` + `index.web.ts` pair (`lib/ads`,
`lib/purchases`, `lib/auth/social`) so the app still runs on web and in Expo Go,
which is what makes browser-based verification possible at all (§21).

**Why NOT:**
- Redux over Zustand: too verbose for simple session state
- Firebase over Supabase: Supabase has PostgreSQL for relational progress queries + RLS
- MUI/Chakra over NativeWind: opinionated defaults fight the custom philosophy aesthetic

---

## 3. Repository Layout

```
Philosophize/
├── app/                         # Expo Router routes (file = screen)
│   ├── _layout.tsx              # Root: fonts, auth, QueryClient, global sheets,
│   │                            #   LaunchScreen, LessonRewardHost, UpdateGate
│   ├── index.tsx                # Landing / onboarding
│   ├── sign-in.tsx              # Modal presentation
│   ├── thinker/[id].tsx         # Deep-link target (philosophize://thinker/<id>)
│   └── (app)/                   # Authenticated tab shell (6 tabs)
│       ├── _layout.tsx          # Tabs: Home · Learn · Thinkers · Insights ·
│       │                        #   Pass · Profile
│       │                        #   animation:'fade' cross-dissolve, 340ms (§19)
│       ├── index.tsx            # Home: reflection → QuickStart → actions → streak
│       ├── branches/            # _layout (fade_from_bottom push) → index (Learn)
│       │                        #   → [branchSlug] (units accordion)
│       │                        #   → [pathSlug]/lesson/[lessonId]
│       ├── philosophers/        # "Thinkers" directory (+ its own stack _layout)
│       ├── stats/               # Insights — the ledger, branch/era rails,
│       │                        #   the thinker league (§19)
│       ├── profile/             # Rank, badges, streak, saved quotes
│       ├── settings.tsx         # Hidden route. 9 sections down a LABELLED rail:
│       │                        #   Profile · Account · Notifications · Learning ·
│       │                        #   Display · Privacy · Feedback · Subscription ·
│       │                        #   Danger Zone. Notifications only when §22 says
│       │                        #   the binary can schedule one
│       ├── pass.tsx             # THE PASS TAB — two certificates and a herald
│       │                        #   (§14). The only permanent address the offer
│       │                        #   has; the rest of the family are interruptions
│       └── paywall.tsx          # Hidden route — hosts PaywallContent full-screen
├── components/
│   ├── lesson/                  # LessonRunner, CardShell, LessonReward, LessonLoader
│   │   ├── cards/               # 8 card components (incl. DilemmaCard, QuoteCard)
│   │   ├── interactions/        # MultipleChoice, TrueFalse, SortItems (3 live)
│   │   ├── cinematic/           # THE BIG ONE — 132 wired cinematic lessons, the
│   │   │                        #   shared rig.ts, Stickman.tsx, CinematicPlayer,
│   │   │                        #   NarrationText + ThinkerPeek (the marked deck),
│   │   │                        #   per-lesson *Scene.tsx + *Script.ts (§17)
│   │   ├── feedback/            # CorrectFeedback, IncorrectFeedback (built, unwired)
│   │   ├── scenes/ inkScenes    # per-branch illustration art
│   │   └── story/               # SnowWalkStory, ExistenceStory, PaintScene (unwired)
│   ├── branch/                  # THE ROAD — BranchWorld (the walked strip on a
│   │                            #   branch screen) + worldPath (layout, speed,
│   │                            #   obstacles, jump) + walkFigure + sceneArt.
│   │                            #   worldPath/sceneArt have ZERO imports (§17)
│   ├── launch/                  # LaunchScreen + launchArt + launchScenes +
│   │                            #   LaunchFigure + launchMotion (§19)
│   ├── home/                    # QuickStartCard, StickmanStroll
│   ├── paywall/                 # THE PASS FAMILY — PassParts (the reader's
│   │                            #   standing, the wall in days, the five-row
│   │                            #   comparison), DailyLimit, LessonLocked,
│   │                            #   Certificate (the engraved object + its
│   │                            #   schedule rows), PassHerald (§14)
│   ├── gamification/            # StreakBook, StreakWeek, RankUpScreen
│   ├── widget/                  # Android home-screen widget surface
│   └── shared/                  # SketchIcon, Glyph, PhilosopherSheet, RanksBadgesSheet,
│                                #   SavedQuotesSheet, PaywallSheet, RankSeal,
│                                #   UpdateGate, DailyQuoteWidget, QuotePlate,
│                                #   Sketch{Bar,Line}Chart (both ORPHANED — nothing
│                                #   imports them; ship or delete),
│                                #   Portrait, ScreenTransition, PressableScale
├── data/                        # Curriculum + reference content (version-controlled)
│   ├── types.ts                 # ALL type definitions — the load-bearing file
│   ├── index.ts                 # ALL_BRANCHES + getLessonById, lessonAccessibility,
│   │                            #   branchCountsFromUnits, getLessonUnitInfo
│   ├── branches/                # 6 branches · 28 units · 222 lessons (§5)
│   ├── philosophers.ts          # BASE + composes ALL_PHILOSOPHERS (322)
│   ├── extra-philosophers/      # ancient/eastern/medieval/modern/contemporary/
│   │                            #   expansion, expansion2a/2b/3/4 (+ *-facts)
│   ├── philosopherFacts.ts      # "Did you know?" facts, 3 per philosopher
│   ├── lessonNames.ts           # GENERATED — which words in which lesson's
│   │                            #   narration are philosophers (make:names)
│   ├── lessonFocus.ts           # AUTHORED — one maxim per lesson, struck in
│   │                            #   the deck (make:focus proposes, a person picks)
│   ├── ranks.ts                 # 40 ranks in 8 orders of 5; rankForXP(),
│   │                            #   awardedRank(), rankOrder(), rankDegree()
│   ├── rankLore.ts              # the 8 Circles + a one-line epithet per rank
│   └── badges.ts                # 70 badges, 5 tiers + goal(stats)/need pairs
├── stores/                      # Zustand: lessonStore, uiStore, subscriptionStore,
│                                #   userDataStore (persisted + cloud-synced)
├── lib/
│   ├── supabase/                # client, auth, secureStorage, sync, useCloudSync,
│   │                            #   tombstone, useSession
│   ├── ads/ purchases/ auth/    # each: types + real + stub + index.web (native-safe)
│   ├── sound/                   # same four-file pattern; `cue()` in lib/feedback.ts
│   │                            #   is the ONE call site for haptics + sound together
│   ├── notifications/           # same pattern + useReminders (§22)
│   ├── widget/                  # render.tsx, pin.ts, pinWidget.ts
│   └── utils/                   # streak, week, progress, xp, quickStart,
│                                #   useTodayKey, userBio
├── constants/                   # Colors, xp, subscription, branchArt, achievements (legacy)
├── assets/images/branches/      # 6 branch photographs (§19)
├── assets/images/quickstart/    # 5 Quick Start backgrounds (§19)
├── assets/images/welcome/       # sky.jpg — the welcome END CARD only (§19)
└── supabase/migrations/         # 0001_user_state, 0002_security_hardening,
                                 #   001_initial_schema (the dormant relational one, §6)
└── global.css                   # Tailwind base/components/utilities import
```

---

## 4. Architecture Decisions

**Content in TypeScript files first, not Supabase:**
Curriculum content lives in `data/branches/` as strongly-typed TypeScript files. This keeps content in version control, enables build-time type checking via `tsc`, and avoids API calls during the lesson experience. Content can migrate to Supabase later for CMS-driven updates.

**Reanimated 4 vs Moti boundary:**
- Use **Reanimated directly** for gesture-driven interactions (drag-to-sort, swipe)
- Use **Moti** for declarative enter/exit animations (feedback panels, XP popups, toasts, card transitions)
- Never mix both animation systems on the same component

**State & persistence (current reality):**
- `lessonStore` (Zustand): card index, answers, session XP — ephemeral, reset on lesson end
- `uiStore` (Zustand): philosopher sheet + ranks/badges sheet visibility
- `userDataStore` (Zustand + AsyncStorage, key `philosophize-userdata`): **the live source of truth** for all progress — streak, totalXP, lessonsByBranch, earnedBadges, savedQuotes, philosopherViews, profile, settings
- **Supabase cloud sync is LIVE (local-first).** `userDataStore` is still the on-device source of truth, but its persisted slice is mirrored to Supabase and merged back on sign-in via `lib/supabase/sync.ts` + `lib/supabase/useCloudSync.ts` (table `public.user_state`, one JSON snapshot row per user). Sync is best-effort — failures never block offline play. `useCloudSync` tags the store with `_syncOwnerId` so a shared/guest device adopts the account's own snapshot instead of fusing in the previous user's data, and `resetForSignOut()` wipes local data on sign-out.
  - The older relational sketch (`lib/supabase/progress.ts`, and the `profiles`/`user_xp`/… tables in `001_initial_schema.sql`) is **still dormant** — the app syncs the JSON `user_state` snapshot, not those per-metric tables. §6 documents that dormant relational schema; the live path is the single `user_state` row.
  - Auth session is stored in the OS Keychain/Keystore (`expo-secure-store`), not plaintext AsyncStorage. RLS is enabled + forced on `user_state` (`auth.uid() = user_id`); see `supabase/migrations/0001_user_state.sql` + `0002_security_hardening.sql`.

**Card components are static imports, not dynamic:**
`LessonRunner` uses a `switch` on `card.type` to render the correct component. All 8 card components are statically imported. This avoids dynamic import waterfalls inside the lesson screen and ensures zero loading delay between cards.

---

## 5. Curriculum Data Model

### Shape today

### 🎬 THE DIRECTION: CINEMATIC IS TAKING OVER

**Cinematic lessons are replacing the card decks, not sitting beside them.** The
card runner is the *old* format and the target is zero of it. Two consequences,
and they are not suggestions:

1. **Never write a new card-only lesson again.** Every lesson added from now on
   ships with a `*Script.ts`, a `*Scene.tsx` and a `CINEMATIC` entry. If it is not
   worth a scene, it is not worth adding.
2. **Keep converting the ones that exist.** Six at a time, one per branch, so the
   per-branch counts stay level while the card count falls.
3. **Convert in READING ORDER — the next unconverted lesson in the branch, not the
   one that best suits a scene.** This is the rule that got learned the hard way.
   The first 96 were picked by concept fit and the new ones were appended to the
   end of their unit, which produced the worst possible pattern: a reader walks
   three animated lessons, drops back into three card decks, and then finds one
   more animated lesson at the end of the unit. Aesthetics "Puzzles at the Edge"
   made you do **ten** card decks to reach a single scene. Stepping *backwards* in
   format mid-unit reads as something being broken; a unit that is uniformly old
   does not. So the converted region must always be a contiguous run from the
   start of a branch, and the frontier only ever moves forward.

**`npm run check:cinematic` counts all three and will not let any slip backwards.**
Two ratchets in `scripts/validate-cinematic.mjs`, both high-water marks:

- **`CARD_BUDGET`** — how many card-only lessons are left. May only go DOWN.
  Adding a card-only lesson raises it and fails the build.
- **`SOLID_FLOOR`** — the total length of the unbroken cinematic run at the front
  of each branch. May only go UP. This is what enforces reading order: converting
  a lesson *behind* the frontier lowers `CARD_BUDGET` without moving `SOLID_FLOOR`,
  and the check says so. It also prints **the next lesson to convert in each
  branch**, so "in order" is never a judgement call.

When `CARD_BUDGET` reaches 0 the takeover is done, and `LessonRunner`, `cards/`,
`interactions/` and that whole half of §3 can be deleted.

> The two things that do NOT change: **`fill-blank` / `match` stay unimplemented on
> purpose** — they are card interactions, and building them now is work on the
> format being retired. Cinematic lessons answer questions in the scene instead
> (E33, H65), which is strictly the better mechanic and is why the format won.

### Shape today

**Every branch holds exactly 37 lessons, of which exactly 28 are cinematic** —
76% of the way through the takeover. Both numbers are deliberate invariants rather
than where the counts happened to land: the totals were 27–30 and the cinematic
share was 11–14, and both showed on the Learn cards. `check:cinematic` enforces
that all six branches match on both.

They constrain each other, and there are exactly two moves that respect both:

- **To raise the CINEMATIC count, give an EXISTING card lesson a scene.** Writing
  twelve new cinematic lessons instead would have taken the totals to
  33/32/30/33/31/33 and broken the first invariant to satisfy the second.
  Converting costs a `*Script.ts` + `*Scene.tsx` + a `CINEMATIC` entry, and usually
  a second graded question added to the data file (E37c). It moves nothing else,
  and it is the move that advances the takeover.
- **To raise the LESSON count, add the same number to every branch and make each
  new one cinematic.** Two per branch took 30/14 to 32/16 and held both invariants
  in one pass; three per branch, in three rounds of six, took 34/19 to 37/22 the
  same way. Adding one lesson to one branch breaks both at once.

> **AND EVERY NEW LESSON NOW HAS TO BE UNLIKE ITS NEIGHBOURS, MEASURABLY.** F43
> has asked for that since the card era and nothing enforced it, so the corpus
> stayed varied on the author's goodwill alone. `npm run check:echo` is group Q
> of the rule book: adjacent lessons in reading order may share no more than half
> their declared channels, no more than a fifth of their graded-prompt words, and
> at most two nouns of the one-line `// Theme:` each script now states before its
> beats. The thresholds are the corpus's own measured worst, not numbers picked
> to feel strict — and the structure (H52's eight beats, two questions, one quote)
> is deliberately NOT checked, because sameness of structure is what makes the
> lessons one product and sameness of picture is what makes them a chore.

> **A round of three per branch moves the FRONTIER by far more than eighteen,**
> and that is worth expecting rather than being surprised by. The solid front is
> the unbroken cinematic run at the START of a branch, so converting the next
> three unconverted lessons in reading order also absorbs every already-converted
> lesson sitting behind them. 22 → 25 took the front 79 → 100; 28 → 31 took it
> 124 → 146. `SOLID_FLOOR` and `CARD_BUDGET` both have to be raised in the same
> commit, and `check:cinematic` prints the numbers to put in them.

| Branch | Units | Lessons | of which cinematic | card decks left |
|---|---|---|---|---|
| Metaphysics | 5 | 37 | 31 | 6 |
| Epistemology | 5 | 37 | 31 | 6 |
| Logic | 5 | 37 | 31 | 6 |
| Ethics | 5 | 37 | 31 | 6 |
| Aesthetics | 3 | 37 | 31 | 6 |
| Political Philosophy | 5 | 37 | 31 | 6 |
| **Total** | **28** | **222** | **186 (84%)** | **36** |

> Numbers go stale; the check does not. `npm run check:cinematic` prints the live
> figures and the next lesson to convert in each branch every time it runs.

> **`Path` IS a unit.** The type is still called `Path` in `data/types.ts`, but
> every screen calls it a *unit* and `branch.paths` is the unit list
> (`import type { Path as Unit }` in the branch screen). The old
> "1 path of 10 lessons per branch" model is long gone. Renaming the type would
> touch every lesson file, so the alias is the accepted compromise — don't be
> confused by the two names for one thing.

Progress is tracked **per unit** (`lessonsByUnit`), never per path/branch alone;
`lessonsByBranch` is a derived mirror (§4).

### The Critical File: `data/types.ts`

All curriculum types are defined here. The key pattern is **discriminated unions** on the `type` field.

```typescript
// CardData is a discriminated union — TypeScript narrows by card.type (8 types)
type CardData = HookCard | ConceptCard | ExampleCard | QuestionCard
  | ReinforcementCard | SummaryCard | DilemmaCard | QuoteCard;

// InteractionData — 5 declared, but only 3 implemented in the UI today
type InteractionData = MultipleChoiceInteraction | TrueFalseInteraction | SortItemsInteraction
  | FillBlankInteraction | MatchInteraction;
```

**Implemented interactions:** `multiple-choice`, `true-false`, `sort`. **`fill-blank` and `match` are type-only stubs** — no component exists and `QuestionCard.tsx` renders nothing for them. **They are staying that way**: both belong to the card runner, and the card runner is being retired (§5). A cinematic lesson answers its questions on the stage instead (E33, H65).

**Two added card types beyond the original six:**
- `dilemma` — "Choose Your Belief": a `scenario` + `choices`, then 2–4 philosophers' `views` (stance + why) revealed after the user picks. Gates the forward swipe like `question`.
- `quote` — a saveable quotation with `author`, `era`, optional `work`, and optional `philosopherId` (links the Thinkers tab).

### Card Sequence Contract
Every lesson MUST:
- Start with a `HookCard`
- End with a `SummaryCard`
- Have between 4 and 10 cards total
- Have at least one `QuestionCard` **or** `DilemmaCard`
- Have exactly one correct answer in every `MultipleChoiceInteraction`

> `tsc` checks types only, so these are enforced by `npm run check:cards`
> (`scripts/validate-lessons.mjs`) — 222/222 clean. Cinematic lessons have their own
> shape check, `npm run check:cinematic` (§17). `npm run check` runs tsc plus ten
> validators — see §11.

### Content Limits
(Authoritative source is the comments in `data/types.ts`.)

| Card Type | Max Words |
|---|---|
| HookCard headline | 12 words |
| ConceptCard body | 60 words |
| ExampleCard scenario | 80 words |
| QuestionCard prompt | 25 words |
| ReinforcementCard body | 50 words |
| SummaryCard key point | 12 words each |
| DilemmaCard scenario | 80 words |
| QuoteCard quote | ~28 words |

---

## 6. Dormant Relational Schema (not the live sync path)

> **Status: dormant — NOT how sync works today.** The live cloud sync (see §4) mirrors the whole `userDataStore` slice into a single JSON `public.user_state` row (`lib/supabase/sync.ts`), **not** the per-metric relational tables below. This section documents the older relational sketch (`lib/supabase/progress.ts` + `supabase/migrations/001_initial_schema.sql`), which is written and RLS-protected but **never called** by the app. Keep it as a reference for a possible future migration to normalized tables; it is not current behavior.

### profiles
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | References auth.users(id) |
| username | text unique | Display name |
| avatar_url | text | Optional |
| created_at | timestamptz | default now() |
| daily_goal | integer | default 1 |
| timezone | text | default 'UTC' |

### user_xp
| Column | Type | Notes |
|---|---|---|
| user_id | uuid FK | References profiles(id), unique |
| total_xp | integer | default 0 |
| current_level | integer | Stored for query perf |
| updated_at | timestamptz | |

### user_streaks
| Column | Type | Notes |
|---|---|---|
| user_id | uuid FK | unique |
| current_streak | integer | default 0 |
| longest_streak | integer | default 0 |
| last_activity_date | date | |

### user_lesson_progress
| Column | Type | Notes |
|---|---|---|
| user_id | uuid FK | |
| lesson_id | text | matches Lesson.id in data/ |
| completed_at | timestamptz | |
| score | numeric(5,2) | 0–100 percent correct |
| stars | integer | 0–3 |
| xp_earned | integer | |
| time_spent_secs | integer | |

Index on (user_id, lesson_id).

**RLS:** Every table has Row Level Security enabled. Policy: `user_id = auth.uid()`.

---

## 7. Gamification Rules

**XP model** — `constants/xp.ts` is now the single source, and every runner calls
`lessonXP(correct, total)` rather than carrying its own arithmetic:

| Reward | Amount |
|---|---|
| Lesson completion | 25 |
| Per correct answer | 10 |
| Perfect-lesson bonus | 15 |
| Path/unit mastery | 100 |
| Saved quote · philosopher met | 3 · 2 |
| Philosopher quiz · perfect | 5 · 15 |

> The old discrepancy (constants said one thing, `LessonRunner`'s local
> `COMPLETION_XP = 5` did another) is closed by `lessonXP()`. All four runners —
> `LessonRunner`, `CinematicPlayer`, `ArgumentFightLesson`, `PremisesBuilderLesson`
> — import it. **If you add a runner, call `lessonXP()`; never re-derive XP.**

**Level formula:** Level N requires `Math.floor(50 * N * Math.sqrt(N))` total XP (`getXPForLevel`).

> **21,400 IS A FIRST PASS, NOT A CEILING — and this file said otherwise for a
> long time.** Counted out of the tree: 222 lessons at a perfect 60 each is
> 13,320, all 28 units mastered 2,800, all 132 saveable quotes 396, all 322
> thinkers met 644, every one of their quizzes aced 6,440 — **21,400 XP for doing
> everything in the app, perfectly, once**. That number was then used to argue a
> 52,000-XP ladder was unreachable and to cut it to 16,000.
>
> The argument was wrong, and one line in `recordLessonComplete` is why: *"XP is
> still awarded on every completion."* The unit pointer uses `max()` so a re-read
> cannot skip anyone forward, but **the XP pays every time**. So the ladder tops
> out at **50,000** now, which is the app read through once and then some, and a
> perfect single pass lands a reader at **rank 31 of 48** — a real achievement
> with seventeen visible rungs above it.
>
> Re-derive both figures before retuning anything: 21,400 is what the CONTENT
> contains, 50,000 is what the LADDER costs, and they are not the same kind of
> number.

### The stickman talks, and three boxes have to hold it

He has a voice in three places, and it is one character in all of them: smug when
you are winning, pointed when you are late, wounded once you have actually lost
something. **He needles ATTENDANCE, never ABILITY** — "you did not come" is a fact
and a fair thing to nag about; "you are bad at this" is the sentence most likely to
make a beginner leave, and `check:quips` makes it unsayable in all three pools.

| where | file | pool |
|---|---|---|
| the streak tab | `lib/utils/streakMood.ts` | 92 lines across six moods |
| the reward screen | `components/gamification/RewardLoafer.tsx` | 217 thoughts in the cloud |
| Profile's "who you're becoming" | `lib/utils/userBio.ts` | 84 openers + assembled receipts |

**Which line shows is derived, never random**, and the three do it differently for
three reasons. The mascot picks from the DAY, so a reader who opens the app twice
is not talking to two different people. The cloud picks from `${lessonId}:${streak}`
through a Murmur finaliser — a plain `h·31 + c` left the low bits dominated by the
characters every seed on a given day shares, and two lessons back to back repeated
**8% of the time**. The bio reseeds on every lesson and every launch, and takes
~527 refreshes to repeat.

**THE POOL SIZE THAT MATTERS IS THE ONE A READER ACTUALLY DRAWS FROM.** The bio's
openers looked like a pool of 50; they are six pools of 14, because a reader whose
top interest is ethics never sees another branch's. The mascot's 92 are six pools,
and a reader stuck in `urgent` for a week only ever meets `urgent`. Count per
bucket, not per file.

**And `npm run check:quips` measures the boxes, because two of the three cannot
grow.** `scripts/lib/ttfwidth.mjs` reads the real advance widths out of the real
`.ttf` in plain Node — the same zero-import rule as `rig.ts` and `tone.ts`, so this
costs milliseconds rather than a Metro and a browser. What it holds:

- **A CHARACTER COUNT IS NOT A WIDTH.** `RewardLoafer` states its budget as "about
  nineteen characters", but in Inter 12.5 "Wittgenstein" is 78px and "illiterate,"
  is 51. The widest row that fits is 22 characters and the narrowest that does not
  is 20, so a rule counted in characters either lets a line overflow or forbids a
  good one. The 112 lines added in the second pass were written FLAT and broken by
  a scorer — fewest rows first, then the most even, then the ones landing on a full
  stop — rather than typed with `\n` by eye.
- **The cloud is anchored from its BOTTOM**, so that it hangs at his head. A row
  too many therefore does not push anything down; it grows UP, off the top of the
  block. Three rows clear it by 6px and a fourth does not.
- **A missing glyph is invisible to a width test**, because `.notdef` is narrow —
  a row of tofu measures comfortably inside budget and passes. All three faces are
  checked for coverage.
- **The orphan rule had to learn the difference between the design and the
  defect**, which is the trap §21 records `check-intro` falling into. Any short
  final row flagged "This is not a / personality. / Yet." — which is the punchline,
  and most of this character's timing. A tail is only orphaned when the row above
  does not END a sentence. Re-scoped, it immediately found a real one that had
  shipped: `"Epictetus was a / slave. You are / tired."`, where the joined line
  fits at 119.4px.

> **One counter-test failed before it passed, and the checker was right.** Cyrillic
> was staged as "something a handwriting face obviously will not have" — and Caveat
> ships Cyrillic. A counter-test that stages the wrong defect proves nothing in
> either direction, so check what the font actually has before concluding the
> detector is blind.

**Streak:** Maintained by completing at least one lesson per calendar day. Alive if the last activity is today or yesterday (`lib/utils/streak.ts`). Stored in `userDataStore`.

> **THREE HUES NOW, AND THE THIRD ONE WAS RESEARCHED RATHER THAN FELT.**
> `constants/streak.ts` licenses a single colour for the whole app on the grounds
> that a streak has to say ALIVE or ABOUT TO DIE from across a room. Two attempts
> cleared every contrast floor in the file and were rejected on sight anyway.
>
> **AN ORANGE IS A SEASON.** `#B4541E`: *"it just looks like it is fall or it's
> Halloween … the orange just looks like a festive colour."* Measured afterwards
> they were describing something real — L\* 47 C\* 59 h 53 is the **loudest warm
> value in the app**, above CRIMSON and above AURUM, at the most autumnal hue
> there is.
>
> **AND A VERDIGRIS READS AS BLUE.** `#068177`, chosen because a patina is proof
> of time served where an ember is something you are about to lose. The metaphor
> was right and the colour was not: *"the blue look kidish, and not very good.
> The color just looks to strange."* The on-ink twin was the real offender —
> `#2BACB0` sits at **hue 200**, which is not teal any more, and it was the
> brightest thing on Home's dark panel. It collided too: ΔE 9 from the EASTERN
> era's jade, in an app that already owns four blue-greens.
>
> **THE CATEGORY WAS LOOKED UP INSTEAD OF GUESSED, AND IT IS UNANIMOUS.** Every
> streak worth copying is WARM and every dead one is grey — Duolingo's flame is
> `#FF9600` and its documented mechanism is that a lapsed one turns grey, so the
> colour *is* the state; Brilliant's refresh puts streaks on a warm pear
> spectrum; Snapchat's is a fire. The one this app shipped was the outlier.
>
> **BUT THE HIGH-CHROMA WARM BAND *IS* THE REJECTED EMBER, and that is the
> finding.** Searching the gold band the way the previous two searches were run —
> maximise chroma at the contrast floor — returns h60 C\* 54, which measures
> **ΔE 8 from `#B4541E`**. That is not a new answer, it is Halloween under a new
> name, and anything at h50–65 above C\* 48 is the same trap. The escape is the
> axis neither search moved: **chroma DOWN**. Every committed colour in this app
> sits at C\* 33–59, so C\* 38 in the gold band is genuinely unoccupied ground —
> and low chroma is what "premium" has meant on every other surface here, where
> the colour lives in edges and shading rather than in a flood.
>
> So it is **GILT**, `#926B33` — tarnished gilding, L\* 48 C\* 38 h 76 — against
> `SLATE` for a run that has gone out. **The two-ground test is what actually
> selected it**, and that was not expected: Home's panel is near-black and
> Profile's is cream, so the pair must be legible on both — and a red walked
> bright enough for 4.5:1 on ink becomes PINK (measured, every candidate h16–h42),
> while a teal walked bright enough becomes CYAN, which is precisely what shipped.
> Gold is the one hue that is rich on cream and still gold on black.
>
> ΔE 28.5 from the ember, 33.7 from slate, and 15.2/15.9 from AURUM and BRONZE —
> the two rank metals it can actually meet, on Profile and on the reward screen.
> `check:streak` holds all five as floors, counter-tested by putting each colour
> back and watching it go red.
>
> **AND THE READER'S SECOND SENTENCE WAS ABOUT THE ANIMATION:** *"the animation
> for the day streak is just a blue dot and it isnt a clean cool animation."*
> Two faults, not one.
>
> **IT WAS A DOT.** Today's day was a flat 22px circle of one flat colour. Every
> other reward in this app is STRUCK — a lit corner, a shaded one, a rim, one
> light from the top left — and the one that decides whether somebody comes back
> tomorrow was the last flat fill in the app. **IT ALSO POPPED RATHER THAN
> LANDING**: a spring from 0.4 up to 1 is a thing inflating, and nothing in the
> metaphor inflates.
>
> A seal is a DIE coming down onto paper, so the sequence is now a strike, and
> the order is the design: the die falls **accelerating** (`Easing.in` — the half
> everyone gets backwards; `Easing.out` decelerates into the paper, which is
> exactly what made the old one read as a pop), squashes to 0.94 on contact,
> recoils to 1.05, settles. A **press ring** leaves the seal's edge on the frame
> it lands — one View, and the whole difference between a stamp and a fade-in.
> The count then starts **on contact** rather than on its own delay, which is
> what Brilliant's own write-up names as making a streak animation feel caused by
> the reader; then the chain draws through the week and today's token is struck
> last, the same fall in miniature. The week is a RUN now rather than seven
> islands, its geometry fixed arithmetic rather than a measured pitch — seven
> equal columns of a known width, so no `onLayout` and no state.
>
> **AND THE STAMP HAS A LEGEND ON IT, WHICH IS WHAT MAKES IT A STAMP.** A blank
> disc is a token; a disc with words on it is an impression, and the reader asked
> for exactly that — *"a couple words that are crooked on the stamp"*. It reads
> DAY DONE, set in the typewriter face the app already loads and never used, tilted
> 8 degrees, showing 60ms AFTER the die is down rather than riding in with it: a
> legend that fades in during the fall is painted on the object, one that appears
> once it has landed was left behind by it.
>
> **THE LENGTH OF THE LEGEND IS THE BOX, NOT A PREFERENCE.** It sits in a 44 ring
> inside a 54 face, so the room for a line is the CHORD at that line's height,
> less the stroke, less a breath, less what the tilt costs — 35.5 units. Measured
> against the real `.ttf` in plain Node, that is the difference between a legend
> a reader can read and one they cannot: DAY DONE sets at 12px, DAY SEALED at
> 8.75, DAY COUNTED at 7.25. `check:streak` re-measures it, so a longer legend
> fails the build rather than the phone — and holds one more rule the arithmetic
> cannot see: the stamp may not echo the heading directly above it, which is why
> DAY KEPT was dropped despite setting larger than the one that shipped.
>
> Two things the render corrected that no measurement would have. Type on a 135°
> gradient has no single contrast — INK reads 6.62:1 at the lit corner and 3.62:1
> at the middle stop the legend sits on — so the words carry a PAPER-coloured
> shadow down-right, the app's own emboss read backwards, and that is what carries
> them across the shaded half. And `justifyContent` centres the two line BOXES on
> the ring exactly while the INK still sits high, because a typewriter face keeps
> its caps near the top of the em box and reserves the rest for descenders an
> all-caps legend never uses.
>
> **The flame went with the fire.** `StreakCelebration` drew a literal one, right
> while the streak was an ember and a metaphor arguing with itself once it was
> not. It is the calendar's own struck token now, held up large, wearing the
> milestone collar on a landmark day — so the reward screen and the grid agree
> about which days were the big ones instead of each having a private opinion.
> Home's and Profile's day tokens are struck off the same `ramp()` for the same
> reason, and `check:streak` measures the mark on them: it survives only because
> it is CENTRED, on the face's middle stop at 4.59:1, where the lit corner is
> 2.52:1 — §19's "a tone fitted for METAL is invisible on PAPER" for the fifth
> time.

> **AND THE MONTH GRID WAS "A HALF HARD DESIGN", WHICH IT WAS.** Three faults,
> and the first is what made it read as unfinished:
>
> - **The connecting rail was drawn PER CELL** — each day painted its own stub,
>   inset a quarter of a cell and pulled 6pt past its own edge to meet its
>   neighbour's. Where two lit days sat side by side that worked; everywhere else
>   it left a pale tab poking out of a disc into empty paper. It is one element
>   per RUN now, measured across the row.
> - **It could not wrap.** The joins were explicitly disabled at row edges —
>   correct given stubs — so a run crossing a Sunday stopped and started again
>   with nothing said. A run is one thing; the week break is an accident of how
>   weeks are printed.
> - **Every day was the same flat circle**, in an app where the rank pins, the
>   badges, the certificates and the quote plates are all struck off one light.
>
> Plus two things it never said at all: `STREAK_MILESTONES` existed and the grid
> was blind to them (a landmark day wears a **collar** now, the same ring a
> capstone pin and a tier-V badge wear), and TODAY-unfed was a hollow ring
> quieter than a lit day, in the one cell the reader can still do something
> about. It breathes.
>
> **THE RAIL WAS THEN INVISIBLE, AND THE SCREENSHOT LIED ABOUT WHY.** Drawn in
> `PATINA_SOFT` it measures 1.24:1 on paper — the floor for a faint FILL, which
> is the wrong floor for the one object in the grid the reader came to look at.
> Reading the render, it looked like the wrap had failed; measuring the DOM, all
> three spans were exactly where they should be (x 348→374, then 16→374, then
> 16→195) and simply could not be seen. **Measure before concluding the geometry
> is wrong.**
>
> `npm run check:streak` holds the palette, the rail's tone and all four
> structural properties, counter-tested six ways. **`npm run sheet:streak` is
> what the numbers cannot do**: it loads all five surfaces — Home's panel, the
> tab, the grid, the celebration and a lapsed streak — and reports where the rail
> actually runs. `DEVICE_W=320` renders the narrow phone.

**Stars:** 100% score = 3 stars. ≥70% = 2 stars. Any completion = 1 star.

**Progression systems (live):**
- **Badges** — **70** in `data/badges.ts`, each `{ id, name, glyph, family, tier,
  goal(stats), need }`; evaluated by `recomputeBadges()` and shown in
  `RanksBadgesSheet`. **Five tiers**, struck in four of the rank orders plus gold
  (`constants/insignia.ts`), so both reward ladders speak one language — **and
  five MOUNTINGS**, one per tier: the medal alone, then a ribbon, then two laurel
  sprigs, then the SAME SPRIGS GROWN — wider, taller, nine leaves apiece and in
  fruit — then a collar struck outside the edge. Tiers IV and V were added to the
  roll and given no furniture of their own, so thirty-three badges — every one
  that takes months — were the tier-III object in a different metal, which is the
  same fault the rank ladder was carrying at the same time. **`npm run
  sheet:badges` draws the whole case in plain Node**; that is what found it, and
  what found the wreath being drawn in white on cream (see §19).

  > **AND THE FIRST ANSWER FOR TIER IV WAS TO CLOSE THE WREATH OVER THE CROWN,
  > WHICH IS THE CROSSED SWORDS AGAIN.** Closing an arc means bending it INWARD,
  > and inward is where the medal is: eight of that wreath's eighteen leaves sat
  > entirely behind a medal and the whole thing reached 34.7 units from the centre
  > where tier III's OPEN sprigs reach 40.2. So the higher tier wore the smaller
  > wreath, and all a reader could see of it was two leaf tips over the crown.
  > They said so — *"for the red badges … those white things on the side to be out
  > more instead of behind, like what the green badge looks like"* — which is
  > almost word for word why the swords were rejected years earlier.
  >
  > **A flourish only counts if it is OUTSIDE the medal**, because the part behind
  > it is not subtle, it is absent, and the fragment that does show reads as a
  > fault. So the step up is outward: 26 marks against 14, 45.5 units of reach
  > against 40.2, a top edge at y 11.8 against 22.6, and nothing behind a medal on
  > any of the six silhouettes. **`check:badges` §4 re-derives every one of those
  > numbers**, and it is the ratchet that was missing both times — every check in
  > that file was green for the whole life of the closed wreath, because the mark
  > still fitted, the roll had not moved and the outline was the right length.

  The ids
  are FROZEN and `check:badges` holds the roll — the roll is a literal list in
  `validate-badges.mjs`, so **adding one is a deliberate two-file act**, which is
  what the last two (32,000 and 50,000 XP) were.
- **Ranks** — **48** in `data/ranks.ts` (Novice → Grand Philosopher), in **eight
  orders of six**: clay, iron, bronze, jade, lapis, crimson, amethyst, aurum.
  **TWO AXES, and a pin is the pair.** `order` picks the MATERIAL and the
  VOCABULARY; `degree` picks how much of that vocabulary is built. No two of the
  forty-eight draw the same thing, and `check:ui` measures that on the paths
  rather than on the numbers.
  - the **VOCABULARY** is per order and never repeats: disc · hex · plate · gem ·
    cross · mariner · burst · grand. Each is a core shape, a counter-rotated
    UNDERPLATE behind it, and a facet count (`VOCAB` in
    `components/shared/rankShapes.ts`).
  - the **BUILD** is the same six steps in every order, and it RESETS at each new
    colour: core → inner rule → facets → underplate → studs → collar. Five
    additions for five rungs, one each.
  - so complexity is a **sawtooth that climbs**. Clay's capstone is a disc on a
    square plate; aurum's is a flared cross patée on a twenty-four ray sunburst,
    cut into facets and ringed twice. Same six steps, nothing in common to look
    at, and the capstone reach climbs 39 → 48.5 across the ladder.

  > **AND THE TOP HALF WERE ALL FLOWERS, WHICH IS WHY THEY WENT.** The four
  > orders above jade were a scallop, a notched star, a twelve-lobe coronet and
  > an eight-lobe rosette, and the reader threw all four out in one sentence:
  > *"every rank icon starting with the blue and then to the grand philosopher,
  > all of those rank icons I really do not like their design."* Laid out side by
  > side the reason is one reason — **lobes spaced evenly round a circle read as
  > a daisy or a bottle cap however finely they are cut**, and four daisies in
  > four paints are not four vocabularies.
  >
  > **The references were fetched rather than guessed**, which is what the reader
  > asked for, and the two families agree with each other. A real breast star
  > (the Order of the Bath, photographed) is a bundle of rays whose LENGTH VARIES
  > WITH ANGLE — long on four axes, short between — so the silhouette is a cross
  > or a lozenge and never a circle, with a cross over the rays and a medallion
  > over that. A modern game ladder (Valorant's nine tiers, pulled from their own
  > CDN into one sheet) changes the SILHOUETTE at every tier — oval, kite,
  > diamond, pentagon, hexagon, star — and not one of the nine is a rosette.
  >
  > So the top four are `patee` and `radiant` now, two new primitives, and the
  > escalation is in the STRUCTURE rather than the edge count: a cross on a star,
  > a star on a star, a finer star on a finer star, and then a cross on a burst —
  > the top pin being the two orders below it at once, which is exactly what the
  > star of an order is.
  >
  > **Three drafts, and each was named by looking at the sheet.** A waist of 0.44
  > under 0.18-wide arms is a **D-PAD**, not a cross — a patée's arms are most of
  > the shape and the waist only nips them. Eight broad arms at a shallow waist
  > is a **COG**; eight narrow ones at a deep waist is a **SNOWFLAKE**; four
  > flared ones is a cross. And an underplate of rays needs its clocking STATED —
  > the default half-step put a long ray behind every arm, so sixteen were drawn
  > and four showed.

  > **This is the third attempt and the first two each fixed half of it.** The
  > shape used to escalate ONCE across all forty-eight ranks, one silhouette per
  > order, and the reader named two faults: *"it only becomes actually complex
  > when the user is really far along … I want it to become complex when the user
  > gets far on a certain colour, then the colour resets"*, and *"the ranks that
  > do get more complex … look like horns and then look as if [they gain] wings.
  > I don't want this design at all."* An escalation with forty-eight rungs to
  > fill runs out of edge to work long before it runs out of rungs, so it starts
  > adding LIMBS.
  >
  > Cycling six shapes inside every order fixed the pacing and broke the other
  > half — *"especially for the more complex ones for each colour, they are all
  > the same, I want uniqueness"* — because the capstone of clay and the capstone
  > of aurum were then one drawing in two paints, which is where the whole thing
  > came in. **Cycling is about PACING; uniqueness is about VOCABULARY.** Treating
  > complexity as one number is what made them look like a trade-off.
  >
  > **And "the design just isn't cool looking" was the other half of the note.**
  > It was a flat polygon with one gradient across it. Three things fix that
  > without a limb: the **underplate** (pure silhouette, symmetric, cannot become
  > a horn); **facets**, where the face is CUT — each wedge lit by the cosine of
  > its own angle to the lamp, so a pin reads as one material catching light at a
  > dozen angles; and a **bevel band** instead of an outline, so the edge is
  > brighter on the side the lamp is on.
  >
  > Two things the contact sheet caught that no number would have. The facets
  > were being **painted out** by the inner rule, which the offline renderer fakes
  > as two fills — three renders came back identical before anyone asked why. And
  > painting them in **white** desaturated every faceted pin, so the middle rung
  > of each order looked like a washed copy of the rung below rather than a richer
  > one; they take the material's own `lit` and `rim` now.

  **`check:ui` holds six things a picture cannot report:** that every rung adds an
  element, that each order's capstone reaches at least as far as the last, that
  all forty-eight drawings are distinct, that every underplate clears its own core
  by 4 units, that nothing declares a wing or a coronet again, and that the facets
  are painted in the material. Every one was confirmed by putting the defect back
  and watching it fail.

  The mark's room stays flat at 0.34–0.40 across all eight while the drawn area
  grows by half again, so everything a rung gains it gains OUTSIDE the glyph.
  That discipline is the whole reason it survives being drawn at 44px.

  **`npm run sheet:ranks` renders all forty-eight in plain Node** and is how they
  are judged — `PIN=50` draws them at the size the ladder actually uses, and
  `sheet:ranks jade` draws one order large. It is the only instrument this
  project has for "does it look good", and every correction above came from it. `check:ui` is what
  stops them breaking (a frame that outgrows the viewBox is clipped silently on
  every screen at once). Two functions, and the difference matters: `rankForXP(totalXP)` is what the XP
  alone would earn, while `awardedRank(rankIndex, totalXP)` is what has actually
  been *conferred*. `userDataStore.rankIndex` advances at most one tier per
  finished lesson, so a rank-up always lands on the reward screen
  (`RankUpScreen`) instead of appearing silently in the Thinkers tab.
- `constants/achievements.ts` holds a legacy ~20-achievement list (`xpBonus`/`category`); badges are the system actually surfaced in the UI.

---

## 8. Development Commands

```bash
# Start dev server (shows QR code for Expo Go)
npm start

# TypeScript check
npx tsc --noEmit

# Install a new expo-compatible package
npx expo install <package-name>
```

---

## 9. Environment Variables

Create `.env.local` in the project root (gitignored):

```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Both are required. Get them from your Supabase project → Settings → API.
`EXPO_PUBLIC_` prefix is required for Expo to expose them to client code.

---

## 10. Component Conventions

- **Naming:** PascalCase files and components. One component per file.
- **Styling:** In practice most components use `StyleSheet.create` with shared ink/paper theme tokens (`components/lesson/theme.ts`, `constants/Colors.ts`); NativeWind is configured and available via `className` but used sparingly.
- **Server vs Client:** Everything is a React Native component (no server/client distinction). Supabase calls happen in TanStack Query hooks or in Zustand actions.
- **Loading states:** Each data-fetching screen renders a skeleton UI when `isLoading` is true.
- **Error states:** Show an `EmptyState` component with a retry button.

---

## 11. Content Creation Guide

> Directory names still say `paths/`, but a "path" **is a unit** — see §5.

> ⚠️ **A NEW LESSON IS A CINEMATIC LESSON.** Steps 1–5 below build the data file,
> which every lesson still needs — the card deck is the fallback the runner uses if
> the `CINEMATIC` entry is ever removed, which is what makes a scene safe to roll
> back (§17). But steps 6–8 are not optional any more, and `check:cinematic` fails
> the build if the card-only count goes up (§5).

1. Create a file in `data/branches/<branch>/paths/<unit>/lessons/<slug>.ts`
2. Export a `Lesson` object matching the interface in `data/types.ts`
3. First card must be `{ type: 'hook' }`, last must be `{ type: 'summary' }`
4. Import and add to the unit's `lessons` array in that unit's `index.ts`
5. Run `npx tsc --noEmit` to validate types
6. Write `components/lesson/cinematic/<name>Script.ts` — the beats, to the house
   shape in group H of the rule book
7. Write `components/lesson/cinematic/<name>Scene.tsx` — the stage, with a measured
   band and a header stating the composition in numbers (H56)
8. Add the id → component entry to `CINEMATIC` in
   `app/(app)/branches/[branchSlug]/[pathSlug]/lesson/[lessonId].tsx`, then run
   `npm run make:names` (the deck colours philosopher names off a generated
   index, and a new lesson naming somebody is invisible to it until you do) and
   `npm run check`

**Where a lesson lands changes what it means.** Units are contiguous slices of a
branch in teaching order, and `lessonsByUnit` counts completions **by position**.
Inserting a lesson mid-unit therefore shifts every later lesson down one slot, so
someone who had finished 3 of 5 now appears to have a different lesson 3.
**Append to the end of a unit** unless you intend that.

A unit's `index.ts` exports an array of `Path` objects (the units); each needs a
stable `id` — `lessonsByUnit` is keyed on it, so **renaming an id silently resets
that unit's progress for every existing user.**

**Keep every branch at 37, and at 31 cinematic (§5).** The counts were 27–30 and it
showed on the Learn cards, so they were levelled deliberately; adding one lesson to
one branch puts them back out. Add six, one per branch — and give each of the six a
scene, or the cinematic invariant goes out instead of the lesson one.

**Grep for the free id; do not assume it is the next number.** Every branch runs
1…32 unbroken today, but that is recent: the ids used to carry *gaps* where lessons
had been removed — ethics had no 9, aesthetics no 11 or 16, epistemology no 2, 13 or
21 — and those six gaps were exactly the six lessons missing when the branches were
levelled. So grep the branch's `id:` values, take a vacant number, and **append the
lesson to the end of whichever unit suits it** rather than slotting it where its
number would sort. The id is cosmetic; the position is load-bearing (F45b, and the
`lessonsByUnit` warning above).

To add a new branch: create an `index.ts` in the branch directory, export a
`Branch` object, add to `ALL_BRANCHES` in `data/index.ts`.

**Card-type notes:**
- A `quote` card needs a stable unique `id` (e.g. `lq-ethics-3-1`) so it can be saved; include `author`, `era`, optional `work`, and a `philosopherId` to link the Thinkers tab.
- A `dilemma` card has a `scenario`, `prompt`, 2–4 `choices`, and 2–4 `views` (each a thinker's `stance` + `why`) revealed after the user chooses. Like `question`, it gates the forward swipe.
- One clear idea per card; follow the Lesson Design Principles (§13).

**To add a philosopher:** add the object to the right file in `data/extra-philosophers/*` (name, lifespan, era, oneLiner, bio, areas, branchSlugs, 4–6 quotes) and **exactly 3 facts** to the matching `*-facts.ts`. It flows into `ALL_PHILOSOPHERS` / `PHILOSOPHER_FACTS` automatically.

**Validation:** `npm run check` is **forty-nine** validators plus `tsc`, in this order —
`check-routes` runs FIRST, before even the typecheck, because a stray preview route
makes every browser-derived result in the run suspect and would ship if a build
followed:
`check-routes` · `check-nav` · `validate-worklets` · `validate-lessons` · `validate-cinematic` · `check-echo` · `check-prompts` ·
`validate-badges` · `validate-sound` · `check-walk` · `check-props` · `check-scale` ·
`check-camera` · `check-tour` · `check-space` · `check-controls` · `check-shade` · `check-lift` · `check-fits` ·
`check-plainwords` · `check-streak` · `check-quips` ·
`check-answers` · `check-answers-shape` · `check-quotes` · `check-mentions` ·
`check-names` · `check-focus` ·
`check-poll` · `check-access` · `check-pass` · `check-rest` · `check-stats` · `check-launch` ·
`check-host` · `check-ui` · `check-events` · `check-thinkers` · `check-words` · `check-legible` · `check-plain` · `check-clear` · `check-rate` · `check-rotation` · `check-react` · `check-smooth` · `check-turn` · `check-moves` · `check-life`. It does NOT exit 0 today, and the two that fail are not this section's:
`check-clear` (untracked, and failing at 72 against a budget of 11) and `check-plain`
(20 pieces against a budget of 18) are both measuring lesson prose that is being
rewritten in another session's working tree. Everything else is green, so anything
the other forty-seven print is yours. (Several
carry high-water budgets rather than zeroes — `check-scale` allows 18 oversized
figures and 6 hand-built ones, and `check-moves` 6 head-clearance defects. A budget
line that still says the same number is not a pass, it is a debt.) `check:cards` enforces the card contract above (hook first, summary last, 4–10 cards, ≥1 question/dilemma, exactly one correct MC answer) across all 222 lessons; `check:cinematic` enforces the cinematic shape rules (group H of the rule book) across every wired scene, and carries the two takeover ratchets from §5. Both are clean today, so anything they print is yours.

> **`check-moves` was the last one on that list to actually run, and for a long
> time it did not.** It existed, this section quoted its budget, and
> `docs/LESSON_RULES.md` told authors to run it — but it was in no npm script and
> not in `npm run check`, so its 6-defect high-water mark could not ratchet and a
> seventh would have shipped in silence. A budget nobody executes is not a budget.
> If you add a validator, add it to `check` in the same commit, and name it above:
> `check:bible` compares this list against `package.json` and will tell you.

**Five of those validators are named above and explained nowhere, and each one
is a RULE rather than a chore.** They were added a fortnight after the groups
they belong to, so the rule book has them and this file did not:

- **E39 · `check:lift` — the thing that moves must be the thing that was
  chosen.** A reveal that animates the whole row, or a `<Target … />` that
  reacts to nothing, tells the reader their tap did something it did not. The
  fix always SIMPLIFIES the scene — one loop instead of two — and it is a
  high-water mark like `CARD_BUDGET`.
- **S8 · `check:fits` — no word on the stage may be cut off by its own box.**
  S1 already forbade the overflow; what was missing was anything that measured
  it. This one is OFFLINE: `scripts/lib/ttfwidth.mjs` reads real advance widths
  out of the real `.ttf`, so it costs milliseconds rather than a Metro and a
  browser. `check:readable` finds the same class in a rendered page; this finds
  it before the page exists.
- **J11 · `check:plainwords` — a word the lesson is not teaching must be one the
  reader already has.** `check-words` measures sentence LENGTH and was green
  through the complaint that prompted this. They fail differently: a long
  sentence loses the thread, a hard word stops the reader dead on one token with
  nothing to recover on. A long word the lesson is ABOUT is the lesson and is
  never flagged.
- **`check:shape` (`check-answers-shape`) — a thing the reader taps must look
  like what it is.** `Target` has taken a `radius` all along and scenes were not
  passing it, so a circular hole arrived wearing a square. It also counts the
  mounted targets against what the question panel says out loud, which is how
  "tap one of the 4 outlined parts" was found sitting over three answers.
- **`check:nav` — a nested stack that can be entered deep must declare its
  `anchor`.** Expo Router builds the stack from the href you enter by, so a tab
  entered from outside itself has nothing beneath it: `router.back()` hands the
  press to the tab navigator and the reader lands on Home with the tab still
  holding the screen they left. The root stack is exempt on purpose — read the
  script's header before "fixing" that.

**Cinematic lessons have their own rule book:** [`docs/LESSON_RULES.md`](docs/LESSON_RULES.md) — figure scale and proportion, reach and joint rules, motion and end-poses, band/deck/box/wrap clipping, and the text-must-match-the-picture rule. Read it before authoring a cinematic lesson and run its Part 3 checks before calling one done.

---

## 12. Current Status

**Phase 5 — shipped and iterating in public.** Live on Google Play, versionCode 21, as Ashmere.

- **Content:** 6 branches · **28 units** · **222 lessons**. **322 philosophers**
  with bios, eras and **1,780 quotes** between them — and all 322 have exactly
  three "Did you know?" facts, with nothing missing.
- **Lessons:** 8 card types; 3 interactions; swipe pager with question/dilemma
  gating; **186 cinematic lessons** (animated stickman scenes, §17), answered six
  ways — scene targets, two cards, and the analogue family of `drag` · `lever` ·
  `plot` · `split` · `field` (§17, group R). **The analogue family is now the
  majority**: 182 graded beats against 150 on the stage and 36 left in the deck,
  and every lesson but two has one (the two ask both their questions on the stage
  instead). **149 of those 182 move the picture as the reader moves the control**
  (R7c, §17). Animated `LessonReward` with XP count-up, streak and rank-up.
  **The narration deck marks two things**: a philosopher's name, in their era's
  colour and tappable for a one-line snapshot (78 lessons, 153 name forms), and
  one maxim a lesson, struck on a band — 162 of 186, with 24 carrying none on
  purpose (§17).
- **Gamification:** 70 badges in 5 tiers, **48 ranks in 8 coloured orders, each
  order struck in a better material and six worked shapes cycling inside every
  one of them** (§7), a conferred-rank ceremony that shows
  the pin they held handing over to the pin they just earned, a three-badge
  profile cabinet, XP + level curve, daily streak. Top rank at 50,000 XP.
- **Screens:** Home (with Quick Start, §19), Learn → branch → unit accordion →
  lesson, Thinkers, Insights, **Pass**, Profile, Settings, paywall, widget,
  saved quotes. Six tabs since the Pass got one of its own (§14).
- **Money:** RevenueCat `scholars_pass` entitlement; AdMob interstitial after a
  free user's lesson; free daily lesson limit. The offer, the daily limit and the
  locked lesson are **one family** (`components/paywall/`) built out of the
  reader's own account — their rank pin, six mastery bars, and the wait to finish
  the library drawn in real days. Every claim on them is derived from the gate
  that enforces it and re-checked by `check:pass` (§14).
- **Infra:** Supabase auth + cloud sync; EAS Build + EAS Update; forced-update
  gate (§20). **PostHog, and its events are a declared set** —
  `lib/analytics/taxonomy.ts` holds all 29 with their properties and `npm run
  check:events` fails the build if the app sends one that is not declared, or
  declares one nothing sends, or declares a property the PII scrubber deletes in
  flight. That last case is the dangerous one: the event still arrives, the
  breakdown built on it is empty forever, and an empty chart reads as an answer.
  `npm run sheet:events` prints the build sheet. Autocapture is OFF on both
  channels — `$screen` is sent by hand because PostHog does not understand Expo
  Router, and turning navigation autocapture on would double-count every screen.
- **Identity:** hand-drawn black-and-white "paper-and-ink" editorial aesthetic,
  light theme only — with photographic backgrounds behind branch cards, branch
  mastheads, the launch screen and Quick Start (§19).

**Known gaps / tech debt:**
- **Card decks are now a minority** — 36 of 222. That is now the number
  that matters; see the takeover rule at the top of §5.
- **Six shipped lessons key two different quotations off one saveable id.**
  `savedQuotes` dedups on the id alone, so the second quotation can never be
  collected and renders as already held. Held at six by `npm run check:quotes`,
  which may only go down. They are the six that are already committed — the rest
  were fixed on sight. Fixing these is a small MIGRATION rather than an edit: a
  reader who has already saved one keeps their copy under the old id and could
  then save the identical text again under the new one. Do it when the saved
  collection is next opened up, not before.
- **`fill-blank` and `match` are closed as won't-do.** They were the oldest open
  item in this file. Finishing an interaction for the format being retired is work
  pointed the wrong way, so the stubs stay stubs.
- **Profile's sections are memoised and its dependency lists are not
  type-checked.** A missed one is a section that silently stops updating. The
  equivalence harness in §19 is the only thing that catches it — record the page,
  mutate the store, record it again — and it lives in a scratchpad rather than in
  `npm run check`, because it needs Metro and a browser. Rebuild it before
  touching that file.
- **Built but not wired:** `story/` scenes, `KineticNarration` voice, `feedback/`
  panels. Decide to ship or delete them.
- **Daily Review / spaced repetition does not exist.** It is the headline
  Scholar's Pass promise in §14 and the P0 in §15, and nothing has been built.
- **`lib/utils/progress.ts` is legacy** — `isLessonUnlocked` / `isPathUnlocked`
  encode the *old* per-branch model. The live gate is
  `lessonAccessibility()` in `data/index.ts`. Don't call the old ones.
- Aesthetics has 3 units where the others have 5.
- **Deprecated RN style APIs — a KNOWN and deliberately un-swept debt.** ~1,400
  `pointerEvents=` props, 60 `shadow*` declarations across 13 files, and
  `textShadow*` in 10. All three are deprecated, and the decision is to leave them
  until someone can do it with a device attached. The reasoning, because it is
  the sort of thing that gets "tidied" by the next reader:
  - **Both warnings come from `react-native-web`, not React Native.**
    `createDOMProps/index.js` emits the `pointerEvents` one and
    `StyleSheet/preprocess.js` the two shadow ones. Nothing in
    `react-native/Libraries` warns, and Android — the only thing that ships —
    supports all three APIs unwarned. So the sweep buys zero user-facing change
    today.
  - **They are `warnOnce`.** Three lines per page load, deduped, not three per
    element. They are not drowning the browser console that §21 depends on.
  - **`shadow*` → `boxShadow` is not a like-for-like swap.** `boxShadow` paints
    on Android where `shadow*` needed `elevation`, and the offset/spread
    semantics differ, so converting 48 sites silently restyles every card, medal
    and pin in the app — and none of it is verifiable in a browser, which is
    where this project can actually look at itself.
  - **`pointerEvents` is not purely mechanical either.** Many of the ~1,000 sites
    are on custom components (`Target`, wrappers) for which it is an ordinary
    prop they forward, not a View prop. Rewriting those into `style` breaks them,
    and telling which is which is 1,000 judgements, not a regex.

  When it is done: do `shadow*` first (48 sites, one visual review), on a device,
  as its own commit. Leave `pointerEvents` until RN actually schedules removal.

---

## 13. Lesson Design Principles (north star)

> ⚠️ **Before writing or changing any cinematic lesson, read [`docs/LESSON_RULES.md`](docs/LESSON_RULES.md).**
> That is the binding rule book — its numbered rules in groups A–R (truth of the
> picture · the figure · motion · nothing hidden · questions · writing · engine · the
> house shape · being followable · the words · the tour · teleporting · the narrator ·
> the vocabulary · answer-before-reveal · held objects · not repeating yourself ·
> **answers that are a quantity rather than a pick** · **the two marked words in
the paragraph**), an
> authoring checklist, and the exact verification checks. Groups A–G each exist because
> a real lesson broke that rule and it was caught on a real phone; group **H** is the
> reverse — the conventions the built lessons already share, counted out of the source,
> so a new one comes out a sibling rather than an odd note. Group **Q** is the newest
> and it is about NEIGHBOURS rather than about any one lesson: what a reader meets when
> they finish sixteen and open seventeen. This section is the *why*; that file is the
> *how*, with the numbers.
>
> Three rules were added the day a reader said the lessons were unreadable, and
> all three are arithmetic rather than taste: **D34** no word on the stage may
> land under 8pt (a tall band shrinks every label, and `logic8`'s captions were
> reaching the reader at 5.1pt); **J10** reading ease at least 55 and at most
> 12% of the words pointing rather than naming; **R9** the rotation — the deck
> is not the default, neighbours differ, and one question stays on the stage.
>
> **The reader then said the boxes were STILL blank, and they were right: size
> was one cause of three.** **D35** is the second — a word ghosted with its layer
> reaches the eye at 1.3:1, which is a smear in the shape of a word, so a caption
> now rides the raw driver track and is legible or absent rather than dim. The
> third is plain clipping, a caption that outgrew its fixed-height box. Neither is
> visible in the source, so `npm run check:readable` renders every lesson and
> measures every word at the size, opacity and clipping it lands with — and
> confirms each suspect against the PIXELS, because reading a word's ancestors for
> a background cannot see a sibling painted underneath. **R7b** is the same lesson
> in a smaller key: the seam of a `split` is the LEFT side's share, six blocks
> read it backwards, and nothing could catch it but reading the sentence against
> the number.
>
> Rule A1 above all: **what the text says, the picture must do.** A lesson that says
> someone is on the floor and draws them standing is not acceptable at any polish level.

> **AND "THE PICTURE MUST DO IT" HAS A SECOND HALF NOBODY WAS CHECKING: the
> picture must BE the thing it names.** A reader went through the corpus and
> stopped on `metaphysics31`: *"nothing looks like cheese ... if it is supposed
> to look like cheese, it needs to actually look like cheese and to have some
> depth."* They were right, and the source says why in one line — the cheese was
> a PAPER rectangle with an ink border and five horizontal RULE rules across it,
> and the holes were PAPER-filled circles sitting on top of it. Every part of
> that is an OUTLINE OF A DIAGRAM rather than a drawing of an object: the rules
> read as ruled paper, and a hole the same colour as the page is not a hole, it
> is a dot. A1 was satisfied the whole time — the text said cheese and a thing
> labelled cheese was on the stage.
>
> What it takes, and none of it is expensive: a filled mass rather than an
> outline (STONE, the tone added for this); a second face so a block is a BLOCK;
> a rind where the two faces meet; and cavities instead of discs — a dark mouth
> with a lit crescent low and right inside it, because the light in this app
> falls from the top left and never moves. Two Views per hole, and it is the
> whole difference between a dot and a void.
>
> **The answering was the other half of the same complaint** — *"when you tap on
> an answer, it's kind of confusing"* — and the rendered page said it out loud:
> the question offered FOUR outlined parts for THREE answers, because the rim
> had both a labelled tab and the ring itself, and the ring's target sat
> concentric inside the gap's. The panel underneath counted them: "Tap one of
> the 4 outlined parts above." Three answers are three IDENTICAL controls now,
> each on a leader to what it names. `Target` has taken a `radius` all along —
> "so the ring does not square off a round thing" — and nobody had passed it, so
> a circular hole arrived wearing two nested squares.

> **`node scripts/survey-lessons.mjs` is the instrument, and it RANKS rather than
> judges.** `check-words` already holds sentence length, beat length and reading
> density, and it PASSED on the very lesson the complaint was about: "Drag to how
> well just say perforated actually works" is nine words with no long ones.
> Nothing counted can tell you that sentence is broken English. So the survey
> finds the cells worth looking at — Flesch reading ease per piece, a technical
> term used in a question the lesson never taught, and a clause used as a noun
> with no quotation marks around it — and a person reads them. Across 186 lessons
> it found **37 pieces**, which is small enough to fix by hand and was.
>
> Its first two drafts were both wrong in the direction §21 keeps recording.
> Flagging any uncommon eight-letter word reported 885 findings — "observation",
> "judgement", "tolerate" — and the noise buried the real hits. And its picture
> metric ranked `political8`, the lesson the reader holds up as the standard, as
> the MOST box-built scene in the app: 186 of 186 scenes draw no vector path at
> all, so "it is made of boxes" cannot be the defect. The visual axis that does
> separate them is tonal mass, which `check:shade` already owns.

> **AND THEN EVERY FLAT SCENE GOT ITS MASS: 111 → 0.** The axis that separates
> the two lessons the reader holds up from the rest was already measured —
> `check:shade` counts filled tonal masses per scene, and 111 of 184 drew fewer
> than three while `political7` draws ten. What was missing was a way to work
> through them that was not one screenshot at a time.
>
> - **`scripts/sheet-lessons.mjs`** renders many lessons and stitches their
>   stages into one grid. Comparison is the point: a flat scene looks fine on its
>   own and obviously empty beside one that is not. Its first version cropped to
>   the TEXT DECK on every lesson and returned eight paragraphs of narration; it
>   anchors on the scene's own `transformOrigin` now, which is exact.
> - **A FLOOR, NOT A HAIRLINE.** Every scene drew its ground as 1.5pt of rule and
>   nothing else, so the figure and everything it looked at stood on bare page.
>   One View — `top: GROUND, bottom: 0`, drawn first so it sits behind everything,
>   clipped by the band — lifted more scenes off the list than anything else.
> - **A picker that EXCLUDES rather than ranks.** The previous automatic attempt
>   failed by toning the largest box, which in several scenes is the answer card.
>   This one never considers a style used inside a `<Target>`, anything named like
>   furniture, anything under 26 units on either axis, or anything drawn with a
>   dashed border — a dashed outline is a BOUNDARY, and filling `political34`'s
>   "reach" turned how far something extends into a slab.
>
> **Every batch was then looked at, and that is not ceremony.** The sheets caught
> the three reverts above and five scenes where the fill was right and the caption
> on it was `SOFT` — 3.26:1 on STONE, under the floor, which is the trap §19
> records three separate marks falling into.

> **AND THE CHEESE HAD FOUR SIBLINGS, FOUND BY SHORTLISTING AND THEN LOOKING.**
> The reader asked for the rest of the corpus to be held to the same rule —
> *"if there's a bird on screen, it looks like a bird … look online for good
> reference and then fix it in the lesson if it does not look like this"* — and
> the shape of the job is worth recording, because half of it cannot be a checker.
>
> **What IS countable is the shortlist.** Every style whose NAME is a real-world
> object, with what it is actually built from: **105 named objects across 69
> scenes, 31 of them built only from square, un-rotated rectangles.** Then render
> and look. Most of the 31 were fine — a wall IS a rectangle, and so are a door, a
> canvas and a table top — and **four were not**, with no static rule separating
> them:
>
> - **`aesthetics5`'s kestrel was a scarecrow.** Uniform rounded bars for wings
>   and a narrow bar hanging straight down for a tail, beating BELOW the
>   horizontal on every frame so it read as falling. The reference says the same
>   two things everywhere: *"long, POINTED wings … a delicate, dagger-like form"*
>   and *"they extend the tips of their wings and FAN their tail feathers —
>   nearly always shows a fan-shaped tail-band when hovering."* Two field marks,
>   two shapes.
> - **`metaphysics10`'s rose was a lollipop**, and its header had already reasoned
>   its way there: *"at 40 units a stroked flower closes into a blob (B16c) … a
>   labelled plate beats an ambiguous shape."* The constraint is true and the
>   conclusion was wrong — a FILLED shape need not be a featureless one. Five
>   petals round a paper eye is the heraldic rose, contains no line to close up,
>   and reads at 22 units.
> - **`epistemology35`'s zebra was a barcode** — a rounded rectangle with five
>   bars, with ZEBRA printed underneath doing all the work. It is a barrel, a neck
>   at an angle, a head, four legs and a tail now, and both pens still draw from
>   the same styles so they stay indistinguishable by construction.
> - **`political17`'s well was a counter.** One post under a beam is a T; a well
>   frame has an upright each side with the rope down the middle, and the mouth
>   has to be a HOLE — the lip was laid on top of a solid drum, which is a plinth.
>
> **THE FIRST INVENTORY WAS WRONG IN THE DIRECTION THAT WASTES A DAY.** It matched
> `borderRadius:` against a literal, so `borderRadius: SUN_R` counted as a bare
> rectangle and it reported the sun, the coin and the eye as the cheese shape. It
> never looked at `borderBottomLeftRadius` (the cup, the bowl) or at a CSS
> triangle, which has no radius at all and is not a rectangle (the horn). **Check
> a shortlist against the objects whose answer you already know before spending
> anything on it.**
>
> **Two things cost a render each, both about pivots.** A neck rotated about its
> own centre swings BOTH ends, so the zebra's head floated clear of a barrel the
> neck no longer reached; `transformOrigin: '50% 100%'` pins the shoulder. And a
> CSS triangle has a ZERO-SIZE box, so a percentage origin on it resolves against
> nothing — the kestrel's wing is a tapered triangle inside a sized wrapper that
> carries the flap.
>
> **And `check:scale` could not tell an animal from a person.** Its PEOPLE NOT
> DRAWN BY THE RIG rule looks for a rounded `*head*` beside a `*body*`, which is
> the right shape to look for and blind to what the creature is: four of the seven
> it reported were a bird, a hen, a zebra and a cow, all correct as drawn, all
> sitting inside a budget of 6 where they hid the three that are real. Exempting
> them by stem took the budget DOWN to 3.

> **AND THE PICTURE IS A PHOTOGRAPH BETWEEN TAPS — MEASURED IN PIXELS, NOT GREP.**
> Counted from the source, 166 of 184 scenes read the monotonic clock for nothing
> but the figure. That number finds candidates and is not the measurement: a grep
> cannot tell an idle wobble that is visible from one multiplied by zero, and
> `epistemology11`'s new second hand proves it — the source test still calls that
> scene dead and the pixels say ALIVE.
>
> **`npm run check:alive <lesson-id> …`** takes two screenshots from ONE page load
> a couple of seconds apart and differences them, with the stickman's box excluded
> (he has had ambient life since group N and would mask everything). **One page
> load is the whole trick**: the scene clock starts at 0 on every load, so two runs
> at the same delay reproduce the same frame and would report the entire app as
> dead. It carries no budget on purpose — a scene about a thing that is
> deliberately still SHOULD come back a photograph, and only a person can say
> which those are. Measured this way, `political7` — the lesson the reader holds up
> as the standard — is one.
>
> **AND THE CANDIDATES DO NOT COME FROM THE NARRATION.** `logic7` says "rain is
> falling" more than any other script and its stage is an argument BOARD; putting
> rain there would be adding art the composition has not got, to satisfy a word.
> The two done are the two whose DRAWN subject moves by nature —
> `epistemology11`'s running clock, which contrasts with a stopped one and was
> equally motionless, so the whole point of the lesson could not be seen; and
> `epistemology37`'s hull, which stood on a 260×2 line without moving. Both ride
> the monotonic clock and never `bt`, which resets every beat and would restart the
> motion on every tap (L1), and both needed `transformOrigin` in px at the object —
> on an `absoluteFill` a bare rotate swings about the middle of the design space
> and throws the ship off its own water.

> **The tap targets got their own check, and it is cheap.** `npm run check:shape`
> holds two things the cheese rebuild turned up, both invisible everywhere else
> because both are about the AFFORDANCE rather than the art: a round target
> wearing a square ring (`Target` has taken a `radius` all along — "so the ring
> does not square off a round thing" — and two scenes never passed it), and a
> scene offering one answer through two targets. The question panel COUNTS the
> mounted targets and prints the number, so `epistemology14` was telling the
> reader there were five choices when there were three. Three hits corpus-wide,
> so the cheese was an outlier rather than typical.

> **CLEARING THE FLOOR IS NOT REACHING THE STANDARD, AND THE HISTOGRAM SAYS SO.**
> The pass above took the flat count to zero, and zero is measured against
> `MIN_MASSES = 3`. Print the distribution instead of the failures and the real
> picture arrives: **115 of 184 scenes sit at exactly three**, which is the floor,
> while the two lessons the reader actually named sit at ten and seven. A ratchet
> that has reached its budget is telling you the debt stopped growing, not that it
> is paid.
>
> **What the extra seven are is now settled by looking rather than by arguing.**
> Rendered side by side, every scene that reads as well as `political7` has the
> same shape in it: **a WHITE message-carrier sitting on a STONE mass.** The gate
> of knowing with its TRUE · BELIEF · REASONS plates, the cave wall, the hull, the
> bench under its chips, the poem board, Duchamp's readymade on its plinth. That
> is T2 stated as a composition instead of as a colour rule, and it is why
> "everything darker" fails: the tone is there to be the thing the white is read
> against.
>
> Two the sheet also settled in the other direction. `aesthetics33`'s frame
> CONTAINS the painting whose sky the lesson spends eight beats cleaning, so
> filling it fights the lesson — its `hill` is the mass. And `aesthetics14`'s cask
> is full of wine at the beat that matters, so toning it buys nothing. **Neither is
> visible in the source, and no counting rule would ever have caught either.**

> **FOUR PROBES IN A ROW REPORTED A CLEAN CORPUS, AND ALL FOUR WERE BLIND.** Every
> `new RegExp('\\b' + name + ':\\s*…')` written into a scratch file here came back
> with its escapes halved before node ever read it, so the pattern was `\b`
> (backspace) followed by `s*`, and it matched nothing. The reports were not wrong
> in the ordinary way — they said **0 scenes have an unpainted structural surface**,
> three times, with increasing confidence, while 38 of them did.
>
> The tell was that a filter which should have been loose was returning nothing at
> all. **Print what each stage of a probe rejected before believing the total**, and
> in this toolchain build patterns as regex LITERALS — a literal's single
> backslashes survive, a string's doubled ones do not. `scripts/lib/tonefit.mjs`
> carries that warning at the top because the next person will write the string
> version, and it will look right.

> **AND `check:shade`'S CONTRAST RULE HAD A HOLE THE SIZE OF AN ABBREVIATION.** It
> paired a fill with its caption by NAME — `slab` with `slabText` — which is the
> house convention and therefore invisible when somebody does not follow it.
> `epistemology23` calls the hopper's caption `hopText`, so giving the hopper STONE
> produced a 3.26:1 caption that the file itself declared clean.
>
> It pairs by BOX as well now (`softOnToneByBox`), and the first run found **eleven**
> real failures, six of them left behind by the previous tonal pass and passing
> every check since. Two guards were needed before it could be trusted, and both
> came from false positives it reported: a fill under 24×12 is a cap rule and
> carries no word, and a style at `left: 0, top: 0` is almost always somebody's
> child, so comparing it against stage space pairs two things that are nowhere near
> each other. Counter-tested four ways — clean, defect, defect with the name rule
> deliberately blinded, and a 5px cap rule that must stay silent.
>
> **The direction of the fix is not constant, which is the part worth remembering.**
> Type on STONE goes to INK; type on INK goes light. SOFT fails both at 3.26:1 and
> 3.36:1, so a rule that always answers "use INK" would have painted three labels
> invisibly onto a night sky.

> **AND THE BOX RULE HAD A HOLE TOO, WHICH IS WHY THERE ARE NOW THREE (T6).**
> Pairing by NAME needs somebody to follow the convention; pairing by BOX needs
> both styles to resolve to coordinates. `ethics31`'s DUTY lamp has neither — the
> fill is `lampBox`, the word is `lampOff`, and `lampOff` is `position:'absolute'`
> with no left, top, width or height at all, because its parent centres it. So it
> shipped **3.26:1 unanswered and 3.27:1 once the reveal fills the box INK — under
> the floor in both of its states** — while `check:shade` printed *"no SOFT type
> sits on a tone it cannot be read against"*. Two blind spots met on one style.
>
> The third pairing is the JSX TREE (`scripts/lib/tonenest.mjs`): a word is on
> whatever its nearest painted ANCESTOR paints, which needs no naming convention
> and no resolvable box, and is what the other two were approximating all along.
> It found **62 captions in 45 scenes**, every one left behind by the tonal pass
> that gave those boxes their fill — `node scripts/tone-soft-to-ink.mjs` did them.
>
> **It is narrow ON PURPOSE, and the wide version is why.** Paired against every
> colour it returned **247** findings, nearly all `onInk` overrides measured
> against the tone they exist to replace — PAPER on STONE at 1.57:1, which would
> be a catastrophe in forty lessons if it were real. It could not tell a STATE
> from a defect, which is exactly what got the boxiness metric deleted. So: only
> SOFT (the one colour with no second reading — it clears nothing below RULE and
> is never the lit half of anything), and only styles applied UNCONDITIONALLY,
> because `[styles.word, answered && styles.onInk]` means the override arrives
> *with* its own change of ground.
>
> **And a two-state label cannot carry its state in the word's colour on a mid
> tone**, because one of the two states always loses. The lamp carries lit and
> unlit itself now, with a ring on its face.

> **One metric was built, checked, and thrown away, and that is the cheapest thing
> that happened all day.** Counting how many of a scene's drawn elements are plain
> rectangles looked like a way to find "labelled diagram" scenes — until it ranked
> `political7`, the reader's own good example, at the median, and nominated three
> scenes that draw nested rings and a tower that scatters. It reads only
> `StyleSheet` entries, so it is blind to every shape carried in a
> `useAnimatedStyle` — which is exactly the animated half. **Check a new metric
> against the examples whose answer you already know, and delete it when it
> disagrees with them** rather than acting on it and calling the result a finding.


Lessons are the product. They must *look*, *feel*, and *teach* well enough that a curious beginner would pay to keep going. Every lesson should honor:

- **Teach, don't lecture.** One idea per card; concrete example before the abstract
  term; never a wall of text. **This is now countable — group J of the rule book,
  enforced by `check-words`.** Write it as you would say it to someone who does not
  know the subject: one thought per sentence, under 20 words. The habit that broke
  it was bolting a second complete thought onto the first with a dash — 48 of the
  69 over-long sentences did exactly that, and the fix is a full stop, not a rewrite.
  A long WORD is fine; "consequentialism" is the lesson. A long sentence is where
  the reader loses the thread.

  **Length was only half of it, and the smaller half.** Read all 102 lessons and there
  are two voices in here: one that stages an idea and walks you through it, and one
  that reads like an encyclopaedia entry. The second tracks **where the reader meets
  it** — lessons 1–9 carried 3.5× the crammed-in names and **20 of 110** trivia-recall
  questions, against 4 of 96 later. That is the wrong way round: the worst-written
  lessons were the first ones every reader sees. It is heritage rather than
  carelessness — the low numbers were card decks that got converted and kept a deck's
  voice. J6–J9 are that difference made countable; the recall questions are down to 5.

  **Read the stage before naming anything.** `metaphysics5` draws
  **EVERY FACT NEEDS A REASON** on screen while the narration said "his Principle of
  Sufficient Reason" over the top of it. `ethics2`'s table reads **OUTCOMES · DUTY ·
  CHARACTER** while its narration recited "Consequentialism · Deontology · Virtue
  ethics". Half the time the scene has already picked the better word.

  **J9 is a zero because 27 explanations failed it silently.** "The trap is B",
  "C over-corrects", "Not B or D" — written when a question had four lettered options,
  and left behind when the two-card answer replaced them. The reader sees two
  unlabelled cards, so every one of those letters named nothing. Nothing failed and
  nothing could: a stale letter still typechecks and still renders. Say *which card*.

  **AND THE WORDS WERE NEVER THE PROBLEM — THE PACKING WAS.** Checked against the
  published measures rather than against taste: Flesch's own bands put 60–69 at
  *standard* (plain English, 8th–9th grade), the federal plain-language guideline
  is an average of 15–20 words a sentence, and this corpus measures **83.2 mean
  reading ease and 10.2 words a sentence**. 86% of it reads *fairly easy* or
  better. Every published test says these lessons already read easily.
  
  What was wrong was the RULE: J10's floor sat at 55, which is inside the
  *fairly difficult* band — two bands below anything shipped, cleared by 96% of the
  corpus by more than twenty points. **A floor that permits worse than everything
  you have written protects nobody.** It is 60 now, the standard's own line, with
  the 68 stragglers as a ratchet.

  **The density is what no rule could see (J12).** `CinematicPlayer` draws the whole
  of `beat.text` as one block, so a beat is not a paragraph to skim — it is
  everything the reader receives before pressing to continue. **A beat is a
  segment**, and the segmenting principle (10 of 10 experimental tests, median
  effect size 0.79; Mayer's own example uses one or two sentences a segment) says
  what belongs in one. **466 of 872 narration beats — 53% — held three or more**,
  and J1 caps a SENTENCE while J2 caps a beat's WORDS, so three tight sentences
  passed both while still being three things at once.
  
  `scripts/split-beats.mjs` cut them, and the load-bearing detail is what it
  copies: **every channel value goes to each piece verbatim, so the picture holds
  still and only the words advance.** The scene is not re-cut; the reader is handed
  it in pieces they can hold. 872 beats → 1,291; 53% packed → **5.4%**; H52's range
  7–11 → 7–13.
  
  **The cap is the point, and the first plan was wrong without it.** Splitting
  everything reaches a mean of 11.4 beats with 23 lessons past 13, some at 18–20,
  which is not a micro-lesson any more. Most-packed-first, stopping at thirteen,
  lands 396 of 466 — 85% of the benefit at a mean of 11.0. The 70 left are named
  in the rule book, because lowering them further needs either a higher ceiling or
  shorter beats and both are product decisions rather than a checker's.
- **Productive struggle.** Every lesson earns its payoff with a real question or dilemma. A good "trick" answer is tempting for a *nameable* reason — so the explanation should **name the bias/fallacy and say why the tempting choice fails.**
- **Ground it in a real thinker.** Pair the concept with a primary-source `quote` card. Authenticity ("here is the sentence Descartes actually wrote") is what makes it feel valuable, not gamified trivia.
- **Give it an arc.** Hook (provocation) → build → struggle → a "what you now know" payoff on the summary.
- **Retention over completion.** Finishing a lesson is worthless if it's forgotten by Friday. Concepts must come back (see Daily Review, §15).
- **Make it feel crafted.** Hand-drawn B&W ink identity, micro-animations, haptics + subtle sound, calm pacing, swipe = page-turn.
- **Rotate the interaction.** Don't let two lessons in a row feel identical — vary the card mix and interaction type.
- **Reward curiosity & give a sense of mastery.** Saveable quotes, tappable philosophers, and path-mastery checks that feel like a small credential.

---

## 14. Premium Experience & Monetization

> **THIS SECTION USED TO BE THE PROBLEM IT WARNS ABOUT.** It sold "Daily Review,
> offline lessons, exclusive deep-dive lessons, and the full saveable-quote
> library/export" — four things, none of which exist. The paywall screen never
> printed them, so nobody was actually lied to; but this is the file people build
> from, and a value model listing four unbuilt features is how they end up on a
> screen. **What the Pass buys is now DERIVED, in `lib/utils/passValue.ts`, and
> `npm run check:pass` re-derives every row from the function that enforces it.**
> The aspiration is still below, and it is labelled as one.

### What the Pass actually buys, today

Five things differ by tier, and all five are enforced in code:

| | Free | Scholar's Pass | Enforced by |
|---|---|---|---|
| Lessons a day | `FREE_DAILY_LESSON_LIMIT` (1) | unlimited | the lesson route's frozen gate |
| Advertisements | one after each lesson | none | `LessonReward.handleContinue` |
| Reopen a finished lesson | **no** | any, any time | `lessonAccess(li < unitDone)` |
| Start a unit out of order | no | any unit, any time | `startable = isPro \|\| …` |
| Rest days | 2 held · 1 per 10 | 5 held · 1 per 5 | `restCap` / `restEarnEvery` |

**Replay and jumping ahead were missing from the paywall for its whole life**, so
the two biggest things the Pass buys were being given away for nothing. That is
the failure mode a hand-written benefit list has in the direction nobody watches
for — everyone guards against over-promising, and nothing guards against silence.

### The Pass has a tab now, and it is a shop rather than an ambush

Every other member of this family is an INTERRUPTION — the daily limit, the
locked lesson, the sheet after a lesson. All three arrive when a reader has just
been stopped, which is the worst moment to ask somebody to read a price. So the
offer also has a permanent address between Insights and Profile, which is the
shape Duolingo and Brilliant both use and the reason is not imitation: a reader
can walk in, read the terms at their own pace, and walk out again.

**Two certificates, and the second one is the argument.** The SCHOLAR'S PASS is
engraved in gold and carries everything — the five things the Pass adds, struck
and recessed and railed, then the six things every reader already has, flat.
Below it, in paper instead of gold, the DAY PASS says what the free tier really
gives: the same six included rows, then the identical five rows showing the other
column. They are the same object in two materials, so the comparison needs no
explaining.

- **The highlight is a MATERIAL, not a colour.** The obvious way to mark the Pass
  rows is a tint behind them, and §19 records that exact move — large saturated
  fills on paper — as what made Insights read cheap. A `granted` row is instead
  CUT INTO the page: a recess running StruckNiche's gradient backwards, a 3pt
  gold rail down the cut edge, a gold-rimmed tick. It differs from its neighbours
  by depth and by metal, which is how every other reward in this app already
  differs from the thing below it.
- **A limit is not a tick.** The free certificate's rows carry an open square with
  a bar across it. A tick meaning "you have this, but only a bit of it" is the
  kind of half-true a screen that takes money must not print.
- **The guilloché is what makes it read as a document.** Two sine trains at a
  1:1.618 beat, sampled as polylines, at 0.5px. It is the strongest "this is a
  certificate" signal available and it costs no colour at all. It stops above the
  motto — drawn full-bleed it ran behind the one line set in a light italic,
  which is the type least able to hold its own against texture.
- **The herald stands ON the certificate's top edge**, not beside it. The literal
  layout was drawn and does not survive a narrow phone: at 320dp a 96pt figure
  leaves 184pt for a certificate carrying eleven ruled rows, which stops being a
  certificate and becomes a receipt.

**AND EVERY FIGURE ON BOTH CERTIFICATES IS COUNTED, INCLUDING THE ONES THAT ARE
NOT GATES.** `PASS_LINES` already held the five differences; `includedLines()`
now counts the library, the thinkers, the saveable quotes, the ranks and the
badges out of the tree, and `check:pass` re-derives every one of them by counting
again independently. This is not fussiness — the curriculum has gone 60 → 192 →
222 lessons, and CLAUDE.md was still saying 132 saveable quotes when the real
figure was **228**. A number typed onto a certificate is a number nobody
re-derives. The check also reads the tab's source with the JSX braces stripped
and fails on any digit left in literal text.

> **THE NARROW PHONE BROKE IT AGAIN, AND THAT IS TWICE NOW.** The title sets in
> Cinzel capitals with tracking: "THE SCHOLAR’S" is 210pt wide at 21px, against
> 208pt of room inside the head at 320dp. Two points. It passed a type check, a
> contact sheet and a mounted-and-measured browser sweep at 390dp, and on the
> narrow phone it rendered as **"THE SCHOLAR’S …"** — an ellipsis where the name
> of the product goes — with its first line sliced off by a head that was a fixed
> 96pt. §19 records the identical shape for "PER ACTIVE DAY", measured fine at
> 390 and broken at 360. The head grows now, the title scales, and `check:pass`
> measures both against Cinzel's own `.ttf` at every width the app supports.

> **AND THE SIXTH SURFACE WAS NOT IN THE FAMILY AT ALL.** Settings › Subscription
> spent its whole life as two hand-written pricing cards, and every failure this
> section exists to prevent was sitting in it at once: **"All 50 badges"** against
> a roll of seventy, **two of the five things the Pass adds** with replay and
> jumping ahead simply absent, and **the price typed twice, in dollars**, on a
> screen that ships to every currency Play sells in. Nothing could fail: a stale
> claim still typechecks and still renders.
>
> It is the same certificate now, issued small — `Certificate` with `compact`,
> the same `PASS_LINES`, the same struck rows. **A claim cannot be true on one
> screen and stale on the other, because there is only one claim**, and
> `check:pass` §7 now reads the settings section for all three rules the tab is
> held to.
>
> **ONE certificate there, not two.** The tab is a shop and shows the offer and
> then the comparison; Settings is where a reader goes to do one thing, and a
> second certificate is 300pt of engraving between them and the button that does
> it. A Scholar sees the SCHOLAR'S PASS with its ACTIVE plate; everybody else
> sees THE DAY PASS and where it stops. Measured in the real screen, the whole
> section went from 859pt (which scrolls on a 390×844 phone) to 844 (which does
> not), and the button from y 646 to y 601.
>
> **A POCKET COPY IS NOT A SMALLER RENDER, IT IS A DIFFERENT SET OF DECISIONS**,
> and three of them cost a browser run each. Setting the holder's note beside
> their name to save a line rendered **"Lan…"** — the title's own failure, one
> row down. The title's floor had to come down to 12px, because the settings card
> is about half the page and 13 needed 130pt into 126. And the schedule's labels
> are written for the tab's full width, so at 320dp two of them clamped to
> **"Replay what you …"** — they get a third line on the small copy.
>
> That last one is the instrument's lesson rather than the design's: `sheet:pass`
> skipped every `numberOfLines` clamp on the correct reasoning that a declared
> clamp is deliberate, and so reported a screen with two truncated entitlements
> on it as clean. **Declaring a clamp is deliberate; running out of lines inside
> one is a word the reader does not get** — the distinction `check:readable`
> already draws as SPILL (§21). It measures `scrollHeight` against the clamp now,
> and `DEVICE_W=320` renders the width that has broken this object twice.

> **The sixth tab, and the note that argued against one.** `_layout.tsx` rejected
> a streak tab because "at 390pt that is ~62pt a tab and the labels clip". Sound,
> and it does not apply: `tabBarShowLabel` is false, so there is nothing to clip.
> Measured in the real navigator at 320dp — six icons, 30pt each, centres 53pt
> apart, which is a 53pt slot against the 44pt both stores ask for. What did have
> to be re-argued is whether a sixth destination earns the room, and the streak
> still does not: it is already one tap from every screen that shows the count.

**Free tier** — enough to fall in love: a lesson a day, every branch's first unit
in order, the full streak, XP, rank and badge systems, and all 322 thinkers.

**Why someone pays (the thesis — the aspiration, not the current feature list):**
1. They actually **retain** what they learn (spaced review), not just tap through it.
2. The **cinematic, narrated** lessons feel like nothing else in the category.
3. **Breadth** — 6 branches, 222 lessons, 322 thinkers — is a genuine library.
4. **Credential & mastery** — ranks + path-mastery give visible proof of progress.
5. The **daily habit** (streak + review) makes the subscription part of a routine.

---

## 15. Ideas Backlog / Roadmap (prioritized)

**P0 — Daily Review (spaced repetition).** The retention engine and the strongest reason to subscribe. Resurface concepts from completed lessons on a spacing schedule via quick `multiple-choice` / `true-false` / `reinforcement` prompts; add a "Review" entry on Home; completing a review counts toward the streak. Track per-concept last-seen + strength in `userDataStore`.

**P0 — Convert the remaining 36 card decks (§5).** Six at a time, one per branch, so
the per-branch counts stay level, until `check:cinematic` reports 0 card decks left.
Then `LessonRunner`, `cards/` and `interactions/` can go. Every lesson added along
the way is cinematic.


**P1 — Finish the orphaned premium machinery.** Wire the cinematic **story scenes** (`SnowWalkStory`, `ExistenceStory`) in as a path's hook or capstone; ship a **"Read to me"** narration toggle (`KineticNarration`); and decide to either **show** the `feedback/` panels in the runner or delete them.

**P2 — Growth loops.** Add **unit-mastery quizzes** (`XP_PER_PATH_MASTERY` is
defined and unused). Add **shareable B&W quote/streak cards**. Aesthetics has 3
units where every other branch has 5 — level it up.

**P3 — Foundations.** Delete the legacy `lib/utils/progress.ts` and
`constants/achievements.ts` once nothing imports them. (The **lesson-contract
validation script** that used to head this item is done — `npm run check`, see §11.)

**Done since this list was written** — kept so nobody re-plans them: sensory
polish shipped (haptics AND generated sound, both behind one `cue()` call in
`lib/feedback.ts` and one Settings toggle); content grew
from 60 lessons to 192 across 28 units; Supabase cloud sync went live; 102
cinematic lessons shipped; the app launched on Google Play with ads,
subscriptions and a widget; the XP model was reconciled behind `lessonXP()`;
ranks gained a conferred-rank ceremony; and the branch screen became a
one-unit-at-a-time accordion.

---

## 16. Collaboration Protocol — Grill Me First

**Before implementing any non-trivial plan or design, grill the user to a shared understanding first.** This is a default working habit here, not a special request the user must remember to ask for.

**Grill proactively when:**
- About to build a feature, design a component, or make a multi-step / architectural change.
- The request has unresolved branches, ambiguous scope, or decisions with real trade-offs.
- The user says "grill me" or invokes the grill-me skill.

**Skip it for** trivial or mechanical work — typo fixes, renames, one-line changes, pure read-only questions, or anything the user has already fully specified. When the change is small and the intent is clear, just act (see the "act when you have enough information" principle).

**How to grill:**
- Interview relentlessly about every aspect of the plan until you and the user share the same picture. Walk down each branch of the design tree, resolving dependencies between decisions one by one.
- **Ask one question at a time** (use the AskUserQuestion tool).
- **For every question, give your recommended answer** with brief reasoning.
- **If a question can be answered by exploring the codebase, explore it instead of asking.**
- Continue until the decision tree is resolved — then implement (or, in plan mode, write the plan and exit plan mode).

---

## 17. Cinematic Lessons

**This is the format the app is converging on** — 186 of the 222 lessons are here
already, and the card runner is what they are replacing (§5). They are not card
decks at all: they are tap-advanced animated scenes.
`app/(app)/branches/[branchSlug]/[pathSlug]/lesson/[lessonId].tsx` holds a
`CINEMATIC` map from lesson id → component; anything absent falls through to the
normal `LessonRunner`. **Removing an entry is a complete, safe rollback** for one
lesson.

A cinematic lesson = a **script** (beats) + a **scene** component, played by
`CinematicPlayer`. Two lessons predate the shared player and carry their own
copies of it: `ArgumentFightLesson` and `PremisesBuilderLesson`.

### Six ways to answer, and five of them can move the picture

A graded beat carries `interact`, and that block now has six shapes. **Scene
targets** (the original 82): the scene draws its own tap targets and calls
`onPick`. **`cards`**: two short `ChoiceCards` under the art, which replaced the
A/B/C/D deck, and still the right answer for 155 lessons. And then the **analogue
family** — `drag`, `lever`, `plot`, `split` and `field` — where the answer is a
quantity, a setting, a shape, a division or a position rather than a pick.

The family exists because "which of these" is the wrong shape for a large part of
philosophy, and because the product owner asked for the rest of it in as many
words: *"leavers being moved, line graphs that you slide … lines that you slide a
bar from one side to the other or the middle."* They are five controls, not five
skins, and **group R of the rule book is how to tell which one a claim wants**:

| The claim is… | Control | It reads |
|---|---|---|
| one quantity on a scale | `drag` | a knob on a rail (`DragScale`) |
| what CATEGORY a named thing belongs to | `sort` | a chip and labelled bins (`SortBins`) |
| which POSITION you would defend | `poll` | a ballot, then who held each (`PollBallot`) |
| what happens to a thing AS another changes | `plot` | a curve you draw (`ShapePlot`) |
| how one thing DIVIDES between two | `split` | a seam in one bar (`SplitBar`) |

> **THE LEVER AND THE PAD ARE GONE, AND THE READER WAS RIGHT ABOUT BOTH.** The
> four-box pad was *"always really difficult … it makes a long time to understand
> what is actually being said"*, and the lever *"isn't that different from the
> line you drag back and forth."*
>
> That last clause is the diagnosis, and reading all fifty lever questions
> confirms it: **not one was a quantity.** Every one names a subject and offers
> three or four candidate claims — "the fear is faked · the fun is faked · the
> fear is real, with the consequences taken out". A pick wearing a slider is
> indistinguishable from a slider, because a slider is what the thumb is doing.
> The pad is the same fault in two dimensions: its corners ARE named positions,
> but the reader has to rebuild them from two axis labels before they can read
> the question.
>
> **Not one `reads` string changed in either conversion**, which is the test for
> whether the control was wrong rather than the question. `sort` asks "where does
> this belong"; `poll` lists the positions and then shows **who actually held
> each** — the reader's own idea, and the thing that turns a right answer into a
> place you stand relative to the tradition.
>
> **AND BOTH HAD A POSITIONAL TELL NOTHING WAS MEASURING.** `check-answers` has
> existed since all 130 two-card questions put the true card on the left, and it
> only ever looked at the deck. Measured on the day they were retired: the
> lever's answer was its LAST stop in **35 of 50 (70%)** and the pad's its FIRST
> quadrant in **15 of 22 (68%)**. On an arc and a pad that is half hidden by
> geometry; in a ballot it is "always tap the top row". Both new controls permute
> through `ChoiceCards.orderFor`, and `check:answers` now measures every control
> with slots — poll 56%, sort 61%.
>
> **The prompts were the other half.** 132 of 368 named the control instead of
> asking anything ("Drag to what Plato put first", "Set the lever to…"). All 132
> are questions now, and `check:controls` measures the new controls' labels — it
> found 41 of the author's own chips too long for their box on the first run.

> **AND THEN THEY WERE "PRETTY BORING AND NOT VERY COOL. NOT VERY GAMIFIED",
> WHICH THEY WERE.** Both controls shipped as bordered rectangles, on a screen
> where the rank pins, the badges, the certificates, the streak calendar and the
> profile's tiles are all STRUCK — lit from the top left, shaded corner, rim,
> shadow. §19 records the quote plate as *"the one object in the app still drawn
> as an outline while every button, card and rank pin sat on a lip"*. The answer
> controls were the next ones.
>
> **A thing you press is a raised face; a thing you press it INTO is a recess.**
> A poll row sinks and stops casting when you take it and the correct one gets a
> gold rail; a sort chip lifts, grows and casts further while held, and its bins
> are sockets whose floors run the same gradient BACKWARDS. That inversion is the
> only thing that says cut-in rather than raised.
>
> **A WIDE SURFACE BARELY SHADES, AND §19 HAD ALREADY MEASURED THAT.** The first
> pass ran `StruckTile`'s full ramp across a 350dp poll row and it came back as a
> **tan stain down the right-hand half** — word for word what §19 says happened
> to the profile's panels. A third of the fall-off, running mostly DOWN rather
> than across, plus a lit top rim. The depth of a big flat thing is in its EDGES.
>
> And the first socket pass dimmed every un-hovered bin to 0.35, which made the
> labels *harder* to read than before — the exact opposite of the other half of
> the same request. **Emphasis goes on the live one; it is never taken from the
> others.**

> **AND A TAPPABLE THING NEEDS A MARK, NOT ANOTHER OUTLINE (R15).** The same
> reader: *"it is difficult to know exactly which box or which thing to tap."*
> `Target` had drawn a breathing 2px ink ring since the affordance was added, and
> it still did not read — for a structural reason worth stating plainly: **a
> cinematic scene IS ink outlines on paper**, so one more ink outline is
> camouflage however slowly it breathes.
>
> Three things fix it and the middle one does most of the work: a soft HALO
> outside the hard ring (a shape the art never makes), a **PIP** — one small
> filled disc in the top-right of every live target, ringed in paper so it
> survives landing on dark art — and an **opening sweep**, where every target
> flares once in mount order. A sweep reads as "these are your choices"; the same
> flare on all of them at once reads as a dropped frame.
>
> **Changing `Target` re-measures the corpus.** Its StyleSheet is in `muststamp`'s
> SHARED list, so one style added here marked **148 lessons stale at once** — by
> design, since this component decides how big a scene's art is. Budget the sweep
> before starting.

The distinctions are load-bearing rather than decorative. Three answers that are
ORDERED lose the order the moment they become cards. "How the aura goes as the
copies multiply" is a curve, and a rail cannot hold one. Presentism, the growing
block and eternalism are three corners of one pad, and asking them as a pick
quietly answers the interesting half — which of the two questions you were being
asked.

Three things make the whole family teach rather than merely slide:

- **The readout is the lesson.** A word above the control changes as it travels —
  "a hunch" → "a good bet" → "knowledge", or "the crank: all in, all kept" →
  "hears everything, keeps almost none of it" — so the reader finds the boundary by
  hunting for the flip. Every `reads` string is lesson copy under group J, not
  scoring furniture, and the WRONG ones matter most: they are where the failure
  modes get named.
- **Nothing is graded on hitting a number.** A zone, a detent, a quadrant, or —
  for `plot` — the nearest profile by RMS, so a reader who draws a cliff gets "a
  cliff" whether it falls at 0.9 or 0.7. A tolerance dressed up as precision would
  be a worse question, not a stricter one.
- **The scene reads the same value.** The control lives on the player as `dragPos`
  (and `dragPos2` for the pad's second axis) and reaches the scene through
  `SceneApi`, so the reader is not moving a widget beside a picture, they are
  moving the picture: the tower comes apart, the painting cleans, the crowd grows
  while every life in it shrinks. One gesture, on the UI thread, with no React
  render in between.

**182 graded beats are on the analogue family now** — 65 `drag`, 50 `lever`, 34
`split`, 22 `field` and 11 `plot` — against 36 left in the two-card deck, which is
10% of all questions and is meant to stay a minority rather than reach zero
(*"I still want a couple every now and then for the old way"*). It got there by
conversion rather than by writing new lessons: **127 lessons had no analogue
control at all and 2 do now**, and both of those ask both their questions on the
stage instead. A conversion is a SCRIPT-ONLY edit — the player renders whichever
control the beat declares — so it costs a control block, a rewritten `prompt` and
a rewritten `explain` (an explanation that says "the other card" names nothing
once the cards are gone, which is J9). `node scripts/rotation-worklist.mjs`
prints what is left, with each claim, in reading order.

**THE SCENE FOLLOWING THE CONTROL IS NO LONGER OPTIONAL (R7c).** It used to be:
30 scenes of 186 moved and the other 150 held still while the reader dragged a
knob under them. **149 of 182 do now**, because the reader said what the
difference was — *"I want something to change within the animation above the
stickman, like it reacts during the user moving something"* — and it is the
difference between moving a widget and moving the picture. The wiring is a
beat-derived flag and one changed argument inside an existing `carry`, and the
judgement is which track: almost every scene already has one whose 0→1 means what
the control's 0→1 means. `npm run check:react` counts it and prints, for each
lesson still unwired, the tracks it could use.

**The second pass is the one worth reading, because the first stopped early.**
30 → 123 took the scenes where the mapping was obvious and left 59 that "looked
hard". Going back through those one at a time, most were not hard: the scene had
already drawn the thing the control is about and simply was not letting the reader
touch it. `political31`'s field is bare at *ask each herder to take less* and grows
back at *change what taking too much costs*; `epistemology12`'s three pipes ARE the
lever's three stops; `aesthetics31` takes strings off the instrument as the token
moves toward *very hard to play*; `political15`'s night lifts off the stair as it
moves toward *done in the open*; `metaphysics11`'s MEMORIES plate rides across to
whoever woke up with the recollections as the seam gives memory more of the person.
**"It looks hard" is a description of the reader's attention, not of the scene.**

The 33 left are three shapes, and naming which one a lesson is comes before calling
it a gap. **A ladder that is not a scale** — a lever whose stops are *one ruler
pressing down* · *an outside power* · *the many closing in* has no quantity behind
it, so any monotone track lies at two of the three settings, and A1 outranks R7c.
**A track that is deliberately monotone** — `metaphysics2`'s `gone` carries a
comment saying it may never come back, so driving it would undo a fix. **Nothing
but the figure's own x.** Plus `aesthetics16`, which must NOT do it, because its
answer is that the painting did not change. Check which a scene is before reasoning
about it. Four of the earlier ones are still the pattern to copy:
worth reading as the pattern: `metaphysics21` furnishes the two halves of a
timeline off the pad's two axes, `political22` makes the pad BE the switch,
`aesthetics22` drains a heart meter as the seam moves, and `political24` stands
five generations of speakers back up as the lever travels. A scene reads `dragPos`
**only on its own graded beat** and the script's own track everywhere else — one
value, two sources, and the picture never disagrees with whichever is in charge.
The flag is derived from the beat itself (`b.interact?.lever ? 1 : 0`) rather than
declared as a channel, so it cannot fall out of step with the control and it costs
`check:echo` nothing.

> **AND THAT LAST SENTENCE WAS WRONG ABOUT 51 SCENES, WHICH IS THE WHOLE POINT.**
> A flag derived from the beat cannot disagree with the beat — but it does not
> survive **the control being retired**. `lever` became `sort` and `field` became
> `poll` across the corpus, and no script has shipped either since, so in 51
> scenes `reacting` was permanently false and the stage held perfectly still under
> the reader's thumb. A reader found it from the outside: *"the animations aren't
> very smooth … it's not very gamified."*
>
> **`check:react` counted every one of them as wired**, because its test was
> `/\bdragPos2?\b/.test(scene)` — whether the scene MENTIONS the value — and they
> all still did, inside a branch that could never run. It also had `sort` and
> `poll` missing from its `ANALOGUE` list, so every lesson carrying one was
> skipped by the entire file: 110 counted where there are 182. A flag that cannot
> fire is worse than no flag, because it is the SHAPE of a wired scene and nobody
> looks again.
>
> **THE RENAME IS ONLY HALF, AND THE OTHER HALF WOULD HAVE BEEN A WORSE BUG.** A
> lever's value was 0..1 along its stops and a sort's is 0..1 along its bins in
> the same authored order, so those 34 are a rename. Pointing the other 17 at
> `dragPos` would have been the confident kind of wrong: **`poll` and `sort`
> PERMUTE their options** through `ChoiceCards.orderFor`, the fairness device
> added because the lever put its answer in the last slot 70% of the time. On
> those two, `dragPos` is DISPLAY space — *which row*, *how far the chip has
> travelled* — so a scene animated off it would move its art in an order a
> shuffle decided. That is A1 broken in exactly the lessons where the shuffle
> happened to be interesting, and it would have looked like polish.
>
> Hence **`SceneApi.pickPos`**: the same reading in the QUESTION's own space, 0..1
> across the options as the AUTHOR wrote them, eased so a scene track cannot cover
> a whole step in one frame. `pickAt(table, pickPos)` reads a per-option table, so
> the picture TRAVELS between the named positions instead of cutting between four
> stills — the reader watches the mouth close as their answer moves from *hears
> everything* to *the dogmatist*, which four separate pictures could never say.
> A `field` was two axes where a `poll` is one, so those 17 could not be renamed
> at all; each got a table per driven track, and **every row is read off the
> option's own words against the track's own doc comment**, with that sentence in
> the comment above it. That is what makes a table of magic numbers checkable.

> **AND THE OTHER RATCHET HAD REACHED ZERO THE SAME WAY: 87 SCENES DECLARED A
> FLOOR AND DREW NOTHING.** §13 records the tonal pass that took the flat-scene
> count 111 → 0 and names the floor — *"one View, `top: GROUND, bottom: 0`, drawn
> first"* — as the single thing that lifted the most scenes off the list. It added
> the `floor:` entry to 111 StyleSheets and the matching `<View>` to 24 of them.
> `check:shade` counts `backgroundColor: RULE` **inside the StyleSheet** and never
> asked whether the style was used, so 87 scenes were recorded as fixed and were
> pixel-identical; counting only what the render body reaches, 17 were still below
> the three-mass floor the ratchet exists to enforce. Both checks measure the
> current now, and both were counter-tested by putting the defect back.
>
> **One measurement was wrong before it was right.** After the codemod, three
> scenes drew the floor and two did not, from byte-identical source — which reads
> exactly like a half-failed codemod. Metro had served a stale bundle for the two;
> restarted with `--clear`, all three drew a 390×59 floor with 12 units inside the
> band. A result that differs between files whose source is identical is a fact
> about the instrument (§21).

> **AND THE BOX THE READER WAS ASKED TO TAP WAS TWO THIRDS EMPTY (S11).**
>
> > *"there are three boxes on the right, and they're just blank boxes, and
> >  you're supposed to click on one of them … it's just a blank box that really,
> >  really looks bad, and it's really confusing about what you're actually
> >  answering."*
>
> `aesthetics14`, measured in the rendered page: the Pressable 146×47, `Target`'s
> ring 146×47, and the card carrying the words **146×15**. A strip of type with
> thirty-two units of bare paper under it, all inside one breathing outline, three
> of them side by side at the moment the lesson asks its question.
>
> **The words were never missing** — `mustBoxes` records all three and the source
> has a `<Text>` in every target. What was missing was HEIGHT. `Target` puts its
> children in a wrapper that carries the answer reaction and, until now, carried
> nothing else; it was an ordinary flex child with an auto main size, so a child
> sizing itself with `flex: 1` had nothing to size against — `flex: 1` is
> `flexBasis: 0%`, and a percentage basis against an indefinite main size
> contributes zero. The ring does not collapse with it, because it is
> `absoluteFill` on the PRESSABLE. **This is S10 on the other axis**: that one
> collapses the CROSS axis under `alignItems` and gives a zero-WIDTH label, this
> one collapses the MAIN axis under `flex` and gives a short one.
>
> `flexGrow: 1` and **not** `flex: 1` — the latter would also set the basis to 0
> and collapse the wrapper to nothing wherever the Pressable is sized BY its
> child, which is most of the 193 targets in the corpus.
>
> **Two more came out of the same tap, and both are the component lying.** The
> ring consulted `answered` and never `disabled`, and **132 targets are written
> `disabled={!live || answered}`** — so for six beats out of eight the reader
> watched outlines breathe at them and nothing happened when they touched one
> (measured: `aria-disabled="true"` on beats 0–3 with the rings at 0.35–0.88 and
> still pulsing). And the reply was dimmed twice: `Target`'s header said the
> component "deliberately does NOT style the answered state", every scene
> therefore wrote its own — almost always an opacity — and then the reaction was
> added and nothing went back to the scenes. **0.5 × 0.45 = 0.225**, on the one
> card the reader chose, in **113 places**, while the untouched loser sat at the
> intended 0.7. Target owns the opacity and the scale now; a scene marks by form.
>
> **`npm run check:shape` holds the dimming and `npm run check:blank` holds the
> emptiness**, and the split is not arbitrary: whether a style dims is in the
> source, whether a ring has anything in it depends on what the whole scene draws
> underneath and can only be answered by rendering. The second measures coverage
> on a 24×24 grid rather than as a union box — two thin strips at opposite ends of
> a tall box have a union of the whole box and cover almost none of it — and it
> ignores four things that each cost a false-positive class: a hit box over art
> drawn elsewhere (the commonest correct shape in the corpus), a stage-sized panel
> the target merely sits on, a target at opacity 0, and a target that is disabled.
>
> **Its two guards matter more than its findings.** A lesson that stops before its
> last beat is reported as partly audited, and a lesson whose scene imports
> `Target` but where no live one was ever seen is reported as NOT audited — because
> under three lanes on a busy machine `logic19` stopped before its graded beat and
> printed *"no scene targets"*, which reads exactly like a lesson that has none.
> **They then caught 16 lessons on the first full sweep, none of which was a
> lesson defect**, and the three fixes are worth knowing because two looked right
> and were not. `TargetRing` draws a ring with no Pressable and so no
> `accessibilityRole` — invisible to a probe selecting on role, which is the
> when-a-lesson-gains-a-way-to-be-answered rule arriving a fifth time. The probe
> reads once and `settle()` waits for the CAMERA, which is not what mounts a
> target, so under lanes it saw three disabled boxes and called them nothing. And
> **the beat index is not a safe key for the retry**: the loop counter drifts, and
> reading the real one off the progress bar is worse, because the bar fills
> CONTINUOUSLY through a beat — so `stamp()` is routinely one short, and settling
> on it makes `settle` burn its whole budget every beat, which put two
> just-fixed lessons straight back into the failing list. Asking the page whether
> it is waiting for an answer needs no index and cannot drift. And a BLANK is
> **confirmed a second later** before it is believed, because one read can land
> inside an entrance — ethics19's rows grow in, and the sweep caught one 9 units
> tall and 11% painted, which is a perfectly drawn row measured while arriving.
>
> **AND IT MEASURES THE ANSWERED FRAME, WHICH NOTHING ELSE DOES.** `check:frame`,
> `check:readable` and `check:spoiler` all probe at the START of a beat and answer
> only to advance, so the one frame carrying the reply — the ten-unit rise, the six
> percent swell, the dimming — had no instrument at all. It reads every word twice,
> before and after, and reports only the DIFFERENCE, which is what kills the
> false-positive class that sinks a naive overlap probe: every ground the word
> already sat on is in both readings. **CUT** is a word the crop now cuts (the band
> was measured against the resting pose); **BURIED** is a word the reaction now
> covers.
>
> **BURIED was wrong twice before it was right, and the RENDER caught it both
> times.** It ignored paint order, so logic3's own winning card title reported two
> coverers while being white on black (20 findings → 9); and it could not see a
> two-state label built as a SIBLING plate rather than a parent, so metaphysics7's
> NOW reported itself buried (9 → 3 real). It stays advisory for that reason. The
> three real ones are one shape — **a stack packed tighter than the lift, whose
> winner rises into the line above it**; logic3's cards are 44 tall on a 50 step and
> slice TAP THE VERDICT in half. `useAnswerSpent` retires a spent instruction; a
> caption that is a LABEL goes inside the Target, because a thing and the word for
> it ride together.
>
> **Adding that second measurement then made the first one lie**: BLANK went 0 → 12
> purely from load, all twelve gone on a quiet machine. Two readings are taken and
> the BETTER one wins, not the later one.
>
> **And `measure-must` was overwriting good data.** It says when it reached fewer
> beats than a lesson has — and wrote the short row anyway, at a stamp that still
> matched, so `check:cinematic` reported every stamp clean while eight beats of
> boxes had become seven. It refuses now. The stamp also hashes only a shared
> component's **StyleSheet block**, not the whole file: hashing all of `Target.tsx`
> made 186 lessons stale for a new hook that moves nothing, and a two-hour
> re-measure for a no-op is how a ratchet stops being run.
>
> **The corpus reads 186 lessons · 509 target-beats · 0 BLANK**, nothing
> unaudited. The nine hollow readings left are sparse-but-complete art — a rubble
> heap, an ash heap, a provenance rail — or a card caught mid-lift, which is why
> hollow reports and does not fail.
>
> **And the must-box stamp could not see any of it.** `muststamp` hashes the scene,
> the script and the probe, so changing `Target` resized the art in 146 scenes with
> every stamp still matching — the apparatus rule from §21 arriving one level out.
> A shared component that decides how big a scene's art is now goes in the hash, for
> the scenes that actually import it. `cinematicKit.tsx` would be more correct still
> and is deliberately left out: it is the highest-traffic file in the repo, and a
> ratchet that goes red on most working days is a ratchet nobody runs.

> **AND S11 HAD A SECOND HALF NOBODY HAD CHECKED: THE WORD BESIDE THE BOX.**
> `epistemology23` was the lesson a reader named — *"a lot of the words are
> covered or the shading is bad, so you cannot quite clearly tell what is being
> said above the stickman"* — and rendered beat by beat it was four faults, none
> of which any check could see.
>
> **A CAPTION WITH THE MACHINE'S OWN RAIL THROUGH IT.** `THE MOUTH` was printed at
> `MOUTH_Y − 7` and the mouth's rail runs at `MOUTH_Y`, so a 2-unit ink line
> crossed the middle of the word on every beat of the lesson. Four checks passed
> it and each was right about what it measures: `check:readable`'s STRIKE looks
> for something painted ON TOP of a word and the caption was painted last;
> `check:fits` asks whether a word fits its box, and it did; `check:shade` asks
> what tone it sits on; `check:frame` asks what the CAMERA cuts. **The gap all
> four leave is a word that is legible as a set of glyphs and unreadable as a
> word.** `check:cover` DOES own this class — it reads ink across a word and takes
> a `nativeID` beginning `strike` or `crossout` as a declaration that the mark is
> deliberate — and it is **not in `npm run check`**, because it needs Metro and a
> browser. That is §11's warning about `check:moves` arriving in a second place.
>
> An offline version was built out of the recorded must-boxes and then DELETED:
> the side file records no ids, so it cannot tell a declared strike from an
> accident, and a detector that cannot tell the design from the defect is the
> boxiness metric again. Two of the twenty lessons it named were deliberate
> annotations, including one whose own comment explains why.
>
> The other three: the twelve falling claims came to rest **on** those captions;
> the graded beat offered **three identical 203-unit blank bars**, stacked, each
> covering the label of the part it stood for; and the machine **stopped** — a
> scene introduced with *"claims arrive all day"* moved `fall` 0→1 on beat 1 and
> pinned it there for six more.
>
> **Every fix is general.** The part names moved to the MARGIN on hairline
> leaders, which is what a labelled instrument looks like and means nothing can be
> printed across a word because no word is printed across the picture; each name
> is the CONTENT of its own target, which is S11's own remedy; the chute, throat
> and tray are filled and rimmed rather than two hairlines and nine ticks; and the
> claims run a continuous loop off `clock`, each disc on its own phase. That last
> one is the cheapest thing on the list that reads as *game* rather than *slide* —
> secondary motion is what tells a reader the world is running whether or not they
> are touching it.
>
> **`npm run sheet:beats <lesson-id>` is what found all four**, and it is the axis
> `sheet:lessons` does not have: ONE lesson at EVERY beat, rather than many
> lessons at one. A complaint about a sequence — *"it's kinda difficult to
> understand what's really going on"* — cannot be answered by a single frame. Its
> own two traps are the ones §21 lists: taking the first `[role=button]` in the
> DOCUMENT presses the header's BACK ARROW, so the run leaves the lesson and
> photographs six frames of a different one while reporting nine clean beats (it
> scopes to `stage-clip` now); and a beat that cannot be answered parks the run,
> so every later frame is a copy of the one it stuck on.

> **THE READER COULD NOT MOVE THE LEVER FAR ENOUGH, AND THE CAUSE WAS THE GAIN.**
> `DragScale`, `SplitBar` and `LeverPick` all integrated `translationX / width`,
> so the full range cost a full WIDTH of finger travel — and the reader reported
> the consequence exactly: *"my finger gets to the end of the screen, and I'll
> answer wrong because I can't move it enough."* From anywhere but the far edge,
> the far end was literally unreachable inside the screen. All three place the
> value at WHERE THE FINGER IS now, which also makes a tap work and leaves no gain
> to get wrong. `FieldPick` and `ShapePlot` were built that way and are the two
> nobody complained about.

> **AND THE READING STUTTERED ON A RAIL WHILE LOOKING FINE ON A LEVER (S7).**
> Wrapping it meant driving it from React state on each zone crossing, which is
> two or three changes on a lever and *every zone in a few hundred milliseconds*
> on a rail — the reader reported exactly that split: *"the lever, I think, looks
> okay … it's a lot with the line when you slide it."* Three faults the lever's
> coarseness hid: each change was a hard cut, the box re-centred between one-line
> and two-line readings, and the re-render handed `GestureDetector` a new gesture
> object with a finger down on it. Every reading is mounted at once now and an
> index shared value cross-fades between them on the UI thread. Measured on a real
> sweep, the worst one-frame opacity step went **1.000 → 0.226** and the box never
> moves. `node scripts/sweep-read.mjs` is that measurement;
> `check:controls` is the offline ratchet, because a rule that needs Metro is a
> rule nobody runs.
>
> **The general form: a coarse control hides a continuous defect.** Three changes
> per gesture and thirty are not the same thing, and testing the first says
> nothing about the second.

> **AND THE GAIN WAS ONLY HALF OF IT — THE PICTURE HAD IT TOO.** The reader came
> back: *"make it so the lever moves easier instead of it feeling like a struggle
> to move over."* The VALUE was already absolute; the DRAWING was not. `LeverPick`
> swung a 52-long arm through ±52°, so its grip travelled 82dp while the finger
> travelled the pad's full 308 — a control that had already obeyed the gesture
> while visibly refusing it, and only the second half is felt.
>
> The obvious fix, a long arm on a pivot dropped below the control, was built and
> then measured in the rendered DOM: **a rigid arm's tip traces a circle**, so it
> sinks by `L(1 − cos θ)`. Spanning 308 at 42° needs L = 230, and 230 × (1 − cos 42°)
> is 59 units of sink inside a control 70 tall — the tilted tip measured at y 501
> against a pad ending at 485, off the box entirely. So it is a **lever in a
> straight gate** now: the grip rides a horizontal gate at a constant height and
> the arm runs from a fixed fulcrum up to it, lengthening as it leans, with
> `L = hypot(dx, dy)` and `angle = atan2(dx, dy)`. Exact, one drawing, and nothing
> that can fall out of the box.

> **A PLOT DOES NOT COMMIT ON RELEASE, AND FOR FOUR YEARS OF CONTROLS IT DID.**
> Four of the five analogue controls hold ONE value, so lifting the finger is the
> answer. A plot holds one per column and the only way to set four is to lift
> between them — so `ShapePlot`'s `onEnd` ended the question on the first lift:
> *"when you move one up or down then want to go to the next it simply thinks your
> done and doesnt let you finish."* The commit is a button now, in the left gutter
> the axis label already occupies, so it costs the deck no height. **A control's
> commit gesture is derived from how many values it holds, never copied from the
> control beside it** (S4).

> **THE READING ABOVE EVERY CONTROL WAS AN `<input>`, AND AN `<input>` CANNOT
> WRAP.** It was an `ACounter` so Reanimated could write it from the UI thread —
> right for a NUMBER (SplitBar's two percentages still are), wrong for a sentence,
> because **the reading does not change every frame**: it changes when the value
> crosses into a new zone, which is the same event that already fires the haptic
> tick. So it cost nothing to make it a wrapping `<Text>` driven by state on that
> crossing, and until it was, **285 of the 1,127 readings in the corpus ran off the
> right-hand edge** — some by a third of the sentence, at 17pt, dead centre.
>
> It survived because **two instruments had one blind spot each and the two lined
> up on it**: `check:controls` measures every label a control draws and did not
> list the readout, and `check:readable` scans the lower deck but walks
> `div,span`. That is S6, and it is the third face of L7 and R6 — a new kind of
> ELEMENT needs the checker to gain one, exactly as a new way to move or to answer
> does. The reading is `components/lesson/cinematic/ControlRead.tsx`, fixed at two
> lines tall because a box that grew under the reader's thumb would resize the
> deck and rescale the stage (L6).

> **Two things that cost a run each, and will again.** All six controls render
> inside `styles.lower` with the deck, never as a sibling of the stage — that is
> L6, and a control outside it does not merely move the picture, it **rescales**
> it by about 12% on the frame a question mounts. And every control carries a
> `nativeID` (`drag-strip`, `lever-arc`, `shape-plot`, `split-bar`, `field-pad`)
> because a beat with no button on it is invisible to a harness that only knows
> how to click: the first sweep of the twelve drag lessons measured 6 or 7 beats
> of 9 and reported them as measured. All four harnesses drive them through one
> shared snippet, `scripts/lib/answerctl.mjs`. **A new control is added to both
> lists in the same commit** — `check:smooth` asserts both.

**AND THE ROTATION IS ITS OWN RULE (R9).** Which control a CLAIM wants is R1;
what a reader's thumb is asked to do lesson after lesson is R9, and only the
second one is felt by somebody working through a branch. `npm run check:rotation`
holds three high-water marks: the two-card deck is at most 14% of all questions
(it is 10% now, and the floor came down from 55% as the analogue family took
over), neighbouring lessons do not both use the same control (133 pairs did, now
27), and **36 lessons ask both of their questions BELOW the
figure** — every one an early lesson, which is exactly where the picture most
needs to be the thing being answered. That last budget is the "above the
stickman" half of the work, and converting one is a self-contained job.

**They all have the same shape, and `npm run check:cinematic` enforces it**: 7–11
beats (8 is the mode), **exactly two graded questions**, one saveable quote on a rest
beat, one summary and it is last, a declared band whose bottom sits on the ground line,
no scene-declared colours, no XP figure typed into a string. That is group **H** of the
rule book — the conventions the 48 already share, as opposed to groups A–G, which are
defects they already made. Read H before laying out a new lesson's beats.

**The figure.** `components/lesson/cinematic/rig.ts` is pure maths with **zero
imports** — which is what lets it run in plain Node for verification. Pelvis
origin, `+x` = facing, **negative y = up**, feet ground-relative. Everything is
drawn as native Views (`Stickman.tsx`), never SVG — see the performance rule below.

### Nothing may teleport (group L)

A reader saw "a glitch on screen, or a frame miss" on scene changes, answered
questions, the figure turning round, and fast tapping. Measured with
`npm run check:smooth` — which replays all 130 lessons at 60fps in plain Node —
those four symptoms were **two defects**, both living in the three lines every
scene shares:

- **The blend started from the wrong pose.** `mixStance(emoteHold(P[p], …), …)`
  begins at the pose the PREVIOUS beat was heading toward, not the one on screen.
  Tap before that blend finished and the figure covers the whole remaining
  distance in one frame — `(1 − tr_reached) × the gap`, which is exactly why it
  got worse the faster you tapped.
- **The gesture's own clock restarted.** `emoteLive(code, t, bt)` uses `bt` as the
  gesture's phase, so a hand mid-swing snapped back to the start of the swing even
  when the blend itself was done. The worst case measured was a tap at exactly
  0.70s — blend complete, gesture not.

`useHeld` / `carryFrom` / `keepHeld` in `cinematicKit` fix both: the first frame of
a new beat is *identical* to the last frame of the old one, so it cannot pop at any
tap rate. **97 of 112 lessons → 0**; median worst one-frame limb move on a fast tap
**24.9 → 1.3 units**.

Separately, `pose(…, dir)` took a raw ±1 and **30 lessons flip it**, mirroring the
whole man between two frames (31 units, at any tap speed). `facing()` eases the sign
through zero so he turns through a profile.

> **The general form, worth remembering when adding any track:** anything driven by
> `bt` is discontinuous at a beat change, because `bt` is. A prop interpolated as
> `lerp(TRACK[p], TRACK[n], tr)` has the identical defect and merely has no limb for
> the checker to measure.

### That warning was right, and nothing acted on it (L5, L6)

The same reader came back: *"the transition from an animation and words to a
question usually has a glitch… after an animation, and it's just information, and
then when you click the screen, it's a kind of glitch or a skip in frames."*
L1–L3 were all in force and `check:smooth` was green at zero. **Two defects, and
neither of them was anything the checker could see.**

- **Every other track had the stance's defect and no limb attached (L5).**
  `check-smooth` draws the figure at a FIXED `x = 200` and measures joints against
  the pelvis — so the one track it can never see is the one that moves the whole
  man, and 89 scenes were interpolating that plus 173 more. Replayed against the
  real tracks: 49 sites past the 8-unit line, **166 units at worst**. Driven in a
  browser, `metaphysics7`'s ankle moved **226px between two frames**.
  `carry()` in `cinematicKit` is `lerp` with a memory and takes the same numbers;
  `scripts/carry-tracks.mjs` did the 262 existing sites. **226px → 20.5px, and the
  20.5 is no longer at a beat change** — with a patient tap the worst frame is
  larger still (29px) and also mid-beat, which is the test for whether what is left
  is a defect or just staging.
- **The stage RESIZED when a question arrived (L6), and that was the big one.**
  `ChoiceCards` and `DragScale` were siblings of the stage, so `body`'s 42/50/8
  flex split ran over whatever height was left after the control took its ~74px.
  The stage lost 34px of it on the single frame a question beat mounted — and it
  does not merely move, it **rescales**, because `fit` is `min(w/STAGE_W, h/bandH)`
  off the measured box. The whole picture stepped about 12% between two frames,
  twice per question, plus one more each way through `boxSize` being React state.
  A camera cut nobody wrote, moving every pixel at once. The control and the deck
  are one box now (`styles.lower`); every lesson reports a single stage-clip size
  for its whole run.

### And L5 was itself renamed out of existence (L8)

`check:smooth` printed **"148 scenes carry every track they interpolate"** and was
wrong about 38 of them. Its detector matched `lerp(NAME[p], NAME[n], …)`; those 38
scenes had all written the identical call behind a one-letter local alias —

```ts
const L = (a: number, b: number) => { 'worklet'; return lerp(a, b, tr); };
…  boxesOn: L(BOXES[p], BOXES[n]),
```

— two arguments instead of three, so neither the checker nor `carry-tracks.mjs`
could see it. **169 tracks across 38 scenes were blending straight off `T[p]`** for
as long as the file claimed otherwise.

The part worth remembering is not the regex. **It was the current house idiom**:
the newest lesson in all six branches used the alias, so the correct instinct —
copy the best recent exemplar — was propagating the exact defect the exemplar was
supposed to have fixed. A defect that spreads by imitation outruns one that spreads
by accident, and it looks like craft while it does it.

Three shapes are caught now: the alias itself (no scene may declare one), a track
lerped out of an array-of-arrays, and one lerped off endpoints derived from a track.
The last two were five real sites the codemod could not express, carried by hand.
And the hardened detector's first run reported a scene as defective because the
comment explaining a hand-carried track quoted the call it was explaining — so it
strips comments now, and **a detector is counter-tested by putting the defect back
and watching it fail.**

> And the lesson under both, which is the same one §21 keeps learning: **when a
> lesson gains a new way to move, the checker gains one too, in the same commit.**
> A checker that models only the figure will stay green through anything that is
> not a figure, and say so confidently.

### And 55 of them walked BACKWARDS, which is the same blind spot again (C18)

> *"the stickman will walk backwards while its legs are moving the wrong way. The
> stickman won't actually turn to walk a different way."*

`pose()` takes the facing as its fifth argument, and **55 scenes handed it a
literal `1`** — so the figure faced right all lesson and moonwalked every beat
whose `x` went down. `epistemology-knowledge-22` is the worked example: 200 → 132
→ 268, so he slides backwards through the middle of the journey and walks the last
leg normally, which is why it reads as a fault in that lesson rather than a style.

**The gait was never wrong.** `strideStance` drives the feet from distance and is
symmetric, so in the figure's own frame the legs do exactly the right thing. It is
the FRAME that is never flipped, and nothing in the rig can notice, because the rig
is handed the direction rather than deriving it. Two lines fix it, and the 47
scenes that already turn all write them identically:

```ts
const DIR = dirsFrom(X, 1);          // +1 rising, −1 falling, HOLD while still
…K_FIG, facing(DIR[p], DIR[n], bt.value), 1)
```

**`check:smooth` could never have caught it**: it replays every lesson at 60fps and
measures joints against the pelvis **at a fixed x = 200**, so the one thing it
cannot see is which way the whole man points. That is L5's blind spot arriving a
second time — and both halves of this one are static, so `npm run check:turn` reads
the source instead. It must find the TRAVELLING `pose()` — the call whose x comes
from `X` — because a scene may pin a second, static figure on purpose; picking the
first `pose()` in the file reported 101 lessons, most of them wrongly.

> **The codemod wrote to the wrong line first, and that is the part to remember.**
> `addImport` matched `import\s*\{([\s\S]*?)\}\s*from './rig'` — non-greedy but
> UNBOUNDED, so it ran from the first `import {` in the file through every import
> in between, and all 55 got `facing, dirsFrom` inserted into their **react-native**
> import. `tsc` caught it instantly; the point is that a codemod which writes to the
> wrong line is exactly the kind that gets believed when it doesn't fail. The group
> must not cross a brace. And **reverting it re-materialised all 55 as CRLF**, which
> is the §21 trap that makes `validate-cinematic` see zero beats and call a file
> clean — normalise to LF after any `git restore` here, and check with `file`.

### The walk was too fast in 54 scenes, and the footsteps were the tell

> *"the stickman will sometimes walk faster and now the sounds in lessons for
> walking is no longer lined up correctly"*

Two symptoms, one cause, and the cause was a rule that had already been written
down and already been "enforced". `rig.moveTr` exists so a walk takes as long as
its distance needs at `WALK_SPEED`; the 46 older scenes call it. **The 54 newest
scenes — the most recently written lesson in every branch — did this instead:**

```ts
const TR = 0.82;
const tr = ease01(bt.value / TR);        // a FIXED length, whatever the distance
```

145 walking beats, every one too fast, the worst running **246 stage units a
second against an intended 56**. And because the PLAYER schedules footfalls from
`footfallTrack`, which uses `moveTr(x0, x1, 0.85)`, the sound was timed for a walk
the scene never drew: on the worst beat the last footstep landed **four seconds
after the figure had stopped**. Pace and sync are the same defect from two sides.

Three things worth carrying:

- **The fix is one expression**, `ease01(bt.value / moveTr(X[p], X[n], 0.85))`,
  and the base must be 0.85 because that is what the player assumed.
- **Nothing could have caught it.** Every sound check loaded `rig.ts` and
  `footfalls.ts` and asked whether they agreed with each other; they always did.
  The disagreement was between `footfalls.ts` and its fifty-four callers.
  `check:sound` reads the scenes now and replays both durations beat by beat.
- **The current house idiom was the defect** — the same shape as L8 below. The
  newest lesson in all six branches was the wrong exemplar, so copying the best
  recent work propagated it. That is the second time this has happened and it is
  worth expecting a third: when a defect spreads by imitation it looks like craft
  while it does it.

### The camera reset on a tap, and three separate things were wrong

> *"in the ethics of care … a lot of the time after I tap the screen, it's like it
>  resets and zooms back in … it used to be very smooth."*

Measured frame by frame in a browser at three tap rates — `npm run sheet:cam` —
that lesson's camera had **no discontinuity at all**: every move is a continuous
ramp, worst single frame 10.8 units. `check:smooth`, `check:tour` and
`check:camera` were all green and all correct about what they measure. The fault
was in three things none of them looked at, and each is the same shape: a number
that is generated, validated, written to a table, and then not used.

- **A HAND-WRITTEN SHOT LIST IS INDEXED BY BEAT, AND J12 CHANGED HOW MANY BEATS
  THERE ARE.** `ethics8Scene` is the only lesson with an authored `SHOTS` table.
  It was written for 11 beats; the segmenting pass cut the packed ones in two and
  made it 18, and every shot after the first split slid one place — 1.62 on the
  first half of the opening line and 1.0 on the second, then 1.24 where the arc
  wanted 1.0. **Tap, zoom out, tap, zoom in**, which is exactly what was reported.
  The splitter copies every CHANNEL verbatim so the picture holds still, and a
  shot is not a channel; `make:tours` and `measure:must` both re-derive per beat
  and had been re-run. Only the hand-written table was left behind, and beats past
  its end are CLAMPED rather than throwing, so the tail merely held wide.
  `check:camera` now holds one shot per beat.

- **THE TRAVEL TIME NEVER REACHED THE CAMERA — 197 STATIONS OF 201.** `shotAt`
  reads the travel off the shot it is moving to, defaulting to `tr ?? 0.8`, and
  `tourStartShots` spread `tr` onto its result **only on the follow branch**; a
  static station came back bare. So every push in every lesson took a flat 0.8
  seconds however far it went, and K8's 0.35–1.2s window was being enforced on a
  value nothing read. Nothing could catch it by reading the table, because the
  table was right — it took measuring a push at **0.79s against a table saying
  1.2** after a change to the generator made no difference to the render at all.
  `check:tour` now puts a station of each kind through the real function.

- **AND A ONE-STATION TOUR FAST-FORWARDED INTO A HARD CUT.** `tourSkip` is
  documented as "the start of the last travel … not the end of the tour: landing
  the reader ON the final shot would make an impatient tap a hard cut." With ONE
  station `tourEnd - trs[last]` comes out as that station's own dwell, which is
  past the only travel there is — so the warp produced precisely the hard cut the
  rule exists to prevent. **Every tour in the app is a single station now** (201
  of them, 1.00 per toured beat); the shape changed when the lap was removed and
  the expression kept answering for the old one. A reader tapping while the camera
  was still travelling saw it jump the rest of the way and pull straight back out.

**THE FIXED TRAVEL TIME WAS THE SAME DEFECT THE WALK ALREADY HAD.** Every station
shipped at 0.7s whatever it was travelling, which is §17's *"a FIXED length,
whatever the distance … 145 walking beats, every one too fast"* one system over —
and `rig.moveTr` had existed for the walk all along. `stationTr` in
`scripts/lib/tourrule.mjs` derives it from the distance actually covered, between
K8's own floor and ceiling so the generator cannot emit a tour its validator
rejects. **The distance is the RATIO, not the destination**: the first draft
scored the station's own scale, which gets the push right and the pull-OUT exactly
backwards, since coming home to the whole stage is scale 1 and would have been
given the shortest travel in the table. Measured after: the push 0.79 → 1.17s,
worst frame 10.9 → 8.6 units.

> **AND THE AUTHORED ARC IN THAT LESSON HAS BEEN DEAD SINCE MUST-BOXES EXISTED.**
> Re-measured, all 17 of its beats report a subject that spans the whole stage, so
> `containShot` pins every shot to ~1.0 and the eleven-shot arc the file's header
> describes cannot happen. `measure-must` prints the finding itself — *"a
> near-full-stage box is a beat whose subject already spans it — the camera there
> was pushing past its own labels, and holding wide is the correct answer."* The
> shot list is repaired and one-per-beat, but what a reader sees in that lesson is
> the tour, and the arc is decoration until the scene draws something smaller.

> **One thing measured and NOT explained, recorded rather than tidied away.**
> `epistemology-knowledge-31` still completes a 1.15× push in 0.16s where its
> table says 0.55, with a peak of 13.8 units in a frame. It is not the shot list
> (that lesson has none), not the station `tr` (fixed above and verified on the
> same run), and not a verb — the slowest entry in `MOVE` is 0.5s and the fastest
> that is not `snap` is 0.55. Whatever shortens it is a fourth thing. `npm run
> sheet:cam -- epistemology-knowledge-31` reproduces it in a minute.

### Two things in the paragraph are no longer ordinary words

> *"when there are certain philosophers names … in the wording for the quotes,
>  but just for the words that are said … their name will also show up in that
>  colour … and if the user pushes on their name, a very small slide down shows up
>  … a quick snapshot."* and *"highlight certain information … like the maxim or
>  the big punchline."*

The deck was one flat `<Text>`: 1,364 beats in which every word arrived at exactly
the same weight, including the two kinds that carry more than the rest.

- **A NAME.** These lessons name people constantly, and a name is the one word on
  the screen a reader might want to stop and ask about. It is drawn in its ERA's
  colour — `ERA` in `constants/design.ts`, the app's licensed "one place a hue
  means something", already used on every quote plate — with a rule under it, and
  it opens `ThinkerPeek`: name, dates and the `oneLiner` the roster already keeps
  for all 322. **Nothing new had to be written for any thinker**, which is the
  whole reason this was cheap.
- **A MAXIM.** One phrase per lesson, struck on a band. 162 of 186 lessons carry
  one and **24 deliberately carry none** — the floor in `make-focus` exists
  because a highlighter on a merely-acceptable sentence tells the reader that a
  prop in the story is the thing to carry away, which is worse than no mark.

`npm run check:names` and `npm run check:focus` hold both, counter-tested nine
ways by `scripts/countertest-focus.mjs` — including the one direction that must
stay SILENT, since a lesson with no maxim is a decision rather than a defect.

**THE MAXIM LIVES IN A TABLE AND NOT ON THE BEAT, for a reason that is nothing to
do with design.** It was `BaseBeat.focus` first, which is the obvious home. But
`muststamp` hashes each lesson's SCRIPT so that a scene edited without
re-measuring is a build error rather than a silent crop — so writing a maxim into
186 scripts marks all 186 must-box measurements stale and demands a full
`measure:must` sweep, hours of browser time, to record something that never
touches the stage. The stamp is right to be conservative and weakening it would
be the wrong trade, so the content moved to `data/lessonFocus.ts` instead. The
cost is that a rewritten beat can orphan its own maxim, which is exactly J9's
stale "the trap is B" — hence `check:focus` re-derives every phrase against the
beat it claims to sit in.

**THREE TRAPS, AND THE THIRD ONE IS THE GENERAL LESSON.**

- **React Native Web renders a pressable nested `<Text>` as a real `<button>`.**
  Every probe in this repo selects `div,span`, so four successive measurements
  reported "no coloured name reached in 30 beats" while the name was rendering
  perfectly at `rgb(106, 92, 47)` with an underline. That is §21's *"selecting on
  `[role=button]` alone finds half the buttons in this app"* arriving upside down.
  It also made the names **dangerous**: six harnesses answer a two-card question
  by taking the first `[role="button"],[tabindex]` below the stage that is wide
  enough, and check-spoiler's guard is `width > 60` — a 70-unit name matches it
  outright. Every name now carries `testID="thinker-name"` and all six skip it.
- **The press has to stop at the name.** The deck sits inside the player's body
  `Pressable`, whose `onPress` is `advance`, and `advance` calls `setPeek(null)`.
  On a device the two would never collide, because a Text with `onPress` claims
  the touch responder; it is react-native-web turning it into a `<button>` whose
  click bubbles. So the defect exists only on the one platform this project can
  actually look at, which is the reverse of §21's usual blind spot and just as
  expensive.
- **`Fade` HOLDS THE DECK IN STATE, so a state the deck draws must be named in
  its `revision` or it is never shown.** This is the one worth carrying. The
  handler fired, `setPeek` ran, React re-rendered the player — and the paragraph
  on screen stayed the one `Fade` had built before any of it, because `peek` was
  in neither `trigger` nor `revision`. Nothing throws and nothing logs. Measured
  from outside it is **indistinguishable from an `onPress` that was never wired**,
  and three separate hypotheses were tested against it before the instrument was
  good enough to tell them apart: a counter inside the handler, and the button's
  own background, which changes only when the open name re-renders.

> **THE SNAPSHOT DRAWS ITSELF IN, AND THE TIMING IS MEASURED RATHER THAN FELT.**
> A leader hairline draws DOWN from under the tapped name, and the card unfurls
> beneath it — so it reads as pulled out of that word rather than as a panel that
> appeared. The line lives in a `TETHER`-tall strip BELOW the paragraph, which is
> empty by construction, because a leader drawn from the name's own baseline would
> cross every line of narration between it and the card (group S).
>
> **ONE LINEAR DRIVER, AND THE EXIT IS THE ENTRANCE READ BACKWARDS.** Every stage
> is a slice of the same 0→1 value, so the close undoes the open in the order it
> arrived: words, then card, then line. Two things were learned by measuring:
> putting Material 3's `emphasized decelerate` on the DRIVER made the leader draw
> its full 15 units in **10 milliseconds** — that curve is so front-loaded that a
> stage occupying the first 42% of the value occupies almost none of the time, so
> a stage window is only honest on a linear driver. And with the easing moved into
> each stage, `1 - (1-u)³` run forwards is a decelerate and the identical
> expression read backwards is an accelerate — M3's entrance/exit pair for free.
> Measured: leader 97ms, card 249ms in; card 149ms then leader 68ms out, 217ms
> against 346ms, which is their "exits are shorter" rule.
>
> **AND `onLayout` ON A NESTED PRESSABLE TEXT FIRES SOMETIMES.** The leader needs
> the name's x, and the obvious tool does not work: react-native-web fired it ONCE
> across a whole lesson in one case and NEVER in another, so the line landed under
> the right word in `aesthetics3` and at the margin in `political4`. A callback
> that fires sometimes is worse than one that never does, because it looks correct
> wherever you happen to check. It is `measureInWindow` at press time now — asked
> of a view that is on screen and attached, which is the one condition §21 records
> it needing — and `sheet:peek` asserts the line is within 6 units of the name's
> centre.
>
> **The card also had to be taught to outlive its own close.** It rendered from
> `id`, under a comment claiming it was kept mounted so the exit could play; the
> moment `id` went null the subtree unmounted and the card vanished instead of
> retracting. The comment described the intention and the line did the opposite,
> which is why measuring it rather than reading it is what found it.

> **The four names the general rule refuses.** `make-names` believes a bare
> surname only when exactly one philosopher has it, it is over three characters,
> and it is not an ordinary English word — the right defaults, and they refuse
> **Mill, Bacon, Moore and Sen**, which this corpus uses across twelve lessons.
> Aristotle tappable in one lesson and Mill plain text in the next reads as a bug.
> So there is an `OVERRIDE`, and it was **measured rather than assumed**: all
> sixteen sentences using those four were printed and read, and not one is the
> ordinary word. `check:names` re-derives each id against the roster, and holds
> that the shared `COMMON` list has not drifted apart from `make-mentions` — one
> rule, two readers, asserted rather than commented.

**Rules that keep biting, in rough order of how often:**

1. **Every hook must sit above `if (done) return null`.** All three players carry
   that early return near the bottom. Hooks were once added below it; `done`
   flips on the final tap, React counted fewer hooks than the previous render and
   threw, which took down the whole tree **including the reward modal that had
   just been mounted** — every cinematic lesson ended on a blank screen with no
   way forward. A hook below that line is not a style nit; it breaks finishing a
   lesson. Each early return now carries a comment saying so.
2. **A worklet must be declared BEFORE any worklet that calls it.** The babel
   plugin rewrites `function foo()` carrying `'worklet'` into a `const`, then
   builds every worklet's closure at module scope — so calling one declared
   further down the file hits its temporal dead zone and throws **at import**,
   taking down the whole route tree rather than one animation. Function
   declarations hoist and worklets do not, which is exactly why this looks fine.
   `npm run check:worklets` catches it, but **check that it is actually looking
   at your function**: it decides "is this a worklet" from the start of the body,
   and an earlier version read only the first four lines of the declaration —
   so anything with a signature longer than three lines was skipped entirely and
   never checked at all. That is how `walkFigure.figureAt` shipped a broken
   bundle past a green validator.
3. **`K_FIG` is 1.0 and lives in `cinematicKit`.** A file declaring its own local
   `K_FIG` shadows it and silently misses future corrections.
4. **Figure-to-figure distances scale with the figure; figure-to-prop distances
   do not.** Props are fixed-size, so a shrinking figure against a prop is the
   point; two figures placed against each other must keep their separation
   proportional or the staging goes limp.
5. **The BAND must contain every pixel a beat can draw.** Each lesson crops the
   400×560 design space to the slice its art occupies and scales that up. Adding
   art outside the band clips it. Re-measure when you add anything.
6. **A plain JS closure cannot cross into a worklet.** Pass numbers, not
   functions. This crashed the launch screen in production (§19) — **and then it
   crashed the whole app in an OTA, which is why it now has a checker.**

   > **THE HELPER IS THE CLOSURE, AND A ONE-LINE HELPER IS THE EASIEST THING IN
   > THE WORLD TO WRITE.** `Dial.tsx` had `const rad = (deg) => deg * Math.PI /
   > 180` at module scope and called it from `useAnimatedStyle`. Reanimated packs
   > a non-worklet function found in a worklet's closure as a **RemoteFunction**,
   > and the only thing a RemoteFunction does on the UI thread is throw
   > (`react-native-worklets/memory/valueUnpacker.native.js` — read it rather than
   > arguing about it). The transformed bundle says so out loud:
   > `__closure={rad,w,lift,out,TILT,dimmed}`.
   >
   > An uncaught throw in a style worklet is fatal in release, the Insights tab is
   > one of the five WARMED at startup (§19), and so the app died a few seconds
   > after every launch without the reader going anywhere near the chart.
   >
   > **AND IT IS INVISIBLE IN A BROWSER, WHICH IS WHERE THIS PROJECT LOOKS.**
   > react-native-web has no second thread: every worklet runs on the JS thread
   > with a real closure, so the plain function is simply CALLED and the screen is
   > perfect. It passed tsc, `check:ui`, `sheet:dial`'s four mounted-and-measured
   > cases and a contact sheet. §21's whole method is structurally blind here, the
   > same way it is blind to `measureInWindow` on a detached view — so the check
   > has to be static, and `npm run check:worklets` is now it. Its first run found
   > **two** sites: the one that had just shipped, and `logic33Scene`'s `gridY`,
   > sitting ten lines above a `fit` that got the directive right and live since
   > 13 Aug.
   >
   > One false positive is worth knowing about because it will recur: **an alias
   > is the same function.** `import { walk as rigWalk }` reads as a plain call to
   > anything that only looks at the call site, and the first run duly reported
   > one of the most-used worklets in the app. Resolve the local name back to the
   > exported one before judging it.
7. **An animated full-screen `<Svg>` costs ~10fps on an S24.** Any animated art
   is inert SVG with native Views moving on top of it.
   **Putting the `<Svg>` under an animated parent does NOT buy the exemption** —
   the branch world was built on that reading and was unusable on a real phone.
   What costs is the AREA being repainted, and a moving parent repaints all of
   it. So: a surface that moves is only as tall and as wide as its own art
   (measure the band, don't close every layer to the full tile), and it is
   tiled into separate children so the off-screen ones are culled.
   The same arithmetic applies to plain Views: **hundreds of them under one
   transform is the same bill.** 320 rectangles drawing a hillside is one path's
   worth of picture and three hundred views' worth of cost.

### The figure was accurate and never once alive

> *"the stickman's movements are usually pretty boring, and a lot of times
>  they'll just repeat movements over and over again in lessons … I want
>  something that will make the user smile, like the stick man is actually alive."*

Measured, all three complaints were true, and **none of them was visible to any
check in the suite**: `check-moves` verifies that each MOTION is geometrically
sound and says nothing about which motions the lessons use, and `check-echo`
compares neighbours on channels, prompt words and theme nouns — gestures are none
of those. So the corpus could converge on ten poses indefinitely, and had.

| | before | after |
|---|---|---|
| distinct poses used across 1,944 beats | 63 | **102** |
| the ten commonest, as a share of all gesture calls | 68% | **53%** |
| lessons that ever PERFORM an action rather than hold a pose | **4** | **144** |
| beats holding the pose the beat before them held | 499 | 386, all continuous |

**THE DOOR HAD BEEN BUILT AND NOBODY WALKED THROUGH IT.** `moves.ts` already held
96 actions, 21 postures and 24 travel modes, and group N of the rule book already
documented the 300 band that plays one once. A fortnight later the lessons still
reached eight codes above 99 between them. A catalogue is not a vocabulary until
something puts it into the scripts.

**AND MOST OF THE REPETITION WAS SELF-INFLICTED (N7).** J12 cut 466 over-packed
beats into pieces and copied every channel verbatim so the picture would hold
still while the words advanced — and **445 of the 499 repeated poses are those
pieces.** Holding still was right for the SCENE and wrong for the FIGURE: rig's
`emoteLive` reads `bt`, which resets every beat, so a pose carrying a `lift`
re-raises its arm on every piece of one sentence. Four pieces, four identical arm
lifts. A living hold (acts 59–78) fixes it exactly, because it reads `t` and
ignores `bt` — the figure keeps moving straight through the beat changes, and
`carryFrom` blends two identical values so there is not even a seam.

**The comic shelf is 97–120**, twenty-four actions built on TIMING rather than on
pose: every one has at least two events and a gap. A single arc — rise, hold,
fall, which is every action above it in the file — cannot be a joke.

Three things that cost a render each, all in group N:

- **A head move is not a move (N12).** `U.head` is 16, so the neck pivots the head
  centre 5.3 units at the angle these were written at, against a head 40 across.
  Three of four "looking" actions drew a figure standing perfectly still. Write
  attention on the SPINE (`U.spine` 33, and it carries the torso), then the neck,
  then give it a limb. And LEFT and RIGHT do not exist inside a pose at all — the
  facing is a scene-level argument to `pose()`.
- **A joke must be about something the beat says (N9).** Placed by POSITION, the
  first file got a pratfall on *"They drained the cask, and a key was lying at the
  bottom on a leather thong."* Every gag now carries the cues that make it apt and
  **43 lessons get none**, which is the rule working rather than a shortfall.
- **Nothing funny goes near a grave lesson (N11)**, applied to the whole lesson and
  not just the sentence. 39 of 174 are excluded; ethics and political philosophy
  lose most of theirs, and that is the right answer.

`npm run check:life` holds all of it and `node scripts/countertest-life.mjs` puts
each defect back — including the direction that must stay SILENT, since a played
action on a run's tail is legal and the joke pass depends on it. **Its first run
caught a bug that would have shipped:** `VARIANTS` reached for the comic shelf for
six of its rows, so the variant pass was placing gags without checking fit,
gravity or rotation — ten about nothing, three in grave lessons, six told twice
within three lessons. `liveliness.mjs` now throws on that at import.

### And he was alive but not PRESENT — he never once looked at the lesson

> *"look at the new ads … I like how the objects interact with the stickman in a
>  very clean and, like, actual good looking way … I want the stickman more
>  interactive with objects and lessons and reacts in better ways and acts in
>  better ways. That is more entertaining and more real."*

The reader is comparing the lessons with this app's own ad reels, where he walks
to a shelf, takes a book down, sits and reads it (DEMO-11), and where he wades
into a pond and lifts a child out (DEMO-9). **Counted, the machinery for all of
that already existed and nothing called it** — group N's finding one library
along, and the third time this file has recorded the shape.

`interact.ts` is a thousand lines of the figure's relationship to what is outside
it. Across 184 scenes: `gripAt` 1 · `carryHands` 1 · `propAct` 1 · **the other
fourteen exports 0**. `moves.gazeAt` **0**. `moves.pointAt` **0**. Three calls in
total, in two files, and one of those two is `political8` — the lesson the reader
already holds up as the standard, which is the only one that puts an object in
his hands.

**AND THE REASON NOBODY EVER CALLED `gazeAt` IS THAT ON ITS OWN IT DOES NOTHING.**
N12 already says it about the four "looking" actions in `moves.ts` — `U.head` is
16, so a neck angle pivots the head centre about five units against a head forty
across — and **this figure has no face**, so a turned head on a plain disc is
invisible from the side. Measured on the real rig (`scripts/sheet-gaze.mjs`, plain
Node, no browser): the neck alone moves the head **3.4–7.4** units; carried by the
SPINE as N12 says attention must be, **7.3–16.0**. `lookPose` takes the lean from
how far the neck actually turned, so the two cannot drift apart, and 164 scenes
use it in place of `pose` — one substitution, because `gazeAt` needs the same `x`
and `dir` that every scene writes inline inside its own `pose(...)` call.

**The target is the PICTURE, not a guess at the beat's subject.** `npm run
make:gaze` derives it from `mustBoxes.ts.json` — the area-weighted centre of
everything a beat draws that is not the figure. Aiming at what CHANGED since the
previous beat was tried first and is not reliable: on a beat where six things move
it picks one arbitrarily, and where nothing moves it has no answer. The picture's
centre is never wrong in an embarrassing way, and when a prop enters on one side
the centre shifts and he follows it — the reaction without the guesswork. Re-run
it beside `make:tours`.

> **HE CANNOT TOUCH ANYTHING, AND THAT IS THE COMPOSITION'S FAULT — WHICH IS WHY
> ATTENTION IS THE PART THAT GENERALISES.** Of the 60 scenes with a sized, filled
> prop, **41 stage every prop entirely above his head**: his crown is 397, a
> hanging hand is 450, and the median lowest prop edge is 256. So `propAct` and
> `gripAt` cannot be wired without moving something, and contact is per-lesson
> staging rather than a pass. A look works at any distance; a hand does not.
>
> **The first instrument said something different and was wrong.** `mustBoxes`
> records only LEAF elements, so a labelled plate — a bordered View with a `<Text>`
> child, which is half the props here — is invisible to it as art. A reach metric
> built on that reported `political8`, the one scene that DOES put a crate in his
> hands, as no nearer its props than the median. Measure staging from the source.
>
> `ethics10` is the worked contact example and it is deliberately the lesson the
> ad covers: he wades into Singer's pond and used to stand in the water beside the
> child with his arms at his sides. `pointAt` lays the arm along the line to a
> target and stops inside arm's length, so a child 68 units away — twice what an
> arm covers — reads as a straight arm AIMED at it rather than a stretched one
> touching it, which is the honest picture of someone who has waded in and not got
> hold of it yet.

### The branch road — the same rig, outside a lesson

`components/branch/` puts the rig on a **branch screen**: a 360-tall strip the
reader's figure walks along, one marker per lesson, seven seconds to the next.
Four files, and two of them (`worldPath.ts`, `sceneArt.ts`) hold the zero-import
rule for the same reason `rig.ts` does — the whole world can be laid out,
measured and *drawn* in plain Node.

`npm run check:walk` runs the exact motion code frame by frame; `node
scripts/sheet-scene.mjs` renders all six places × five weathers to a PNG. Between
them almost nothing here needs a phone.

What a viewer complained about, and what the answers cost:

- **One speed.** The traverse runs on `travelEase`, a trapezoid. It replaced
  `Easing.inOut(Easing.quad)`, which peaks at **twice** the average — so he
  accelerated for three and a half seconds and braked for three and a half more,
  with the stride cadence obediently doubling. Never use a symmetric ease for
  something that is supposed to be walking.
- **One speed each, though — a shared duration inverts the cadence.** The span
  is a fixed 322 units and it used to take 7 seconds *whatever the gait*, which
  fixes the speed; and because foot phase is driven by distance,
  `cadence = speed / stride`. Hold the speed and the gait with the SHORTEST steps
  is forced to take the MOST of them, so the trudge churned at 6.18 steps a
  second while the run ambled at 2.65 — backwards, and the trudge is the thing
  that is supposed to look slow. `spanSeconds` gives each gait its own duration
  (4.8s–9.0s) and `moves.ts` carries a **road shelf** of gaits at roughly double
  the lesson strides, because a human gait cycle is ~0.8 of their own height and
  the lesson walk's is 0.49 — fine across a stage in a second, half a stride at
  road distance. It is a separate shelf because **53 scenes walk figures with
  `WALK`** through `travelStance`; retuning the shared table would have restrided
  every one of them.
- **The ground is FLAT, on purpose.** It was a continuous curve, and the figure
  spent a whole branch trudging over knolls that also tilted him. What stops a
  level road being a progress bar is what grows on it and lies across it.
- **`SETTLE_UNITS` is a fifth of a STRIDE, so compute it from one.** 7 is a fifth
  of 34 and that was the only stride in the app, so the constant passed for one.
  At road strides it is a ninth, the arrival had more to absorb in half the room,
  and the settle went from 0.96 world units a frame to 2.32 — a scrape. Anything
  written as an absolute that *means* a proportion breaks the day a second value
  turns up.
- **"Planted" is a branch of `footTarget`, not a distance from the ground.**
  `check:walk` tested `|gap| < 0.05`, which cannot tell a foot that is DOWN from
  one still coming down — the swing foot descends continuously, so whatever the
  threshold, the last airborne sample falls inside it while travelling at full
  swing speed, and a *landing* gets reported as a skate. Tightening the number
  only changes which airborne sample is caught. Stance returns y **exactly 0**;
  test that, and a planted foot measures 0.0000%.
- **He only jumps at something drawn.** `obstacleAt` puts a log or boulder in
  about one span in three and `jumpForSpan` aims the apex at it. A hop over
  nothing is rule A1 in its plainest form, and it is what a flat road would
  otherwise have produced.
- **Nothing dark may stand at his height.** The figure is solid ink, head
  included, and walks in front of every scenery layer. A near-black mass behind
  him is not drama, it is the man vanishing. Anything above `NEAR_TOP` (his knee)
  is a mid tone or lighter; the dark band is scrub at his feet. Enforced by
  `check:walk`, which measures contrast against ink rather than trusting anyone.
- **A departure is a foot skate waiting to happen.** A walk that begins at cycle
  phase 0 starts mid-stance with the feet a full stride apart and both planted,
  and blending out of a standing pose reintroduces the body's motion in
  proportion to how much stand is left in the mix. Both were true here and cost
  13 world units of slide per departure. `strideMode(..., fromStand)` and a
  world-locked blend source fixed it.
- **`gaitVary` CLAMPS stance into `[STANCE_MIN, STANCE_MAX]`.** A run's tabled
  0.40 is a gait no journey has ever actually walked. Read `stanceUsed(g)`, never
  `gaitFor(mode).stance`, when reasoning about the cycle.

> And the trap that cost the most: this is where the **worklet ordering** rule in
> the list above was learned the second time. `figureAt` called a worklet declared
> below it, `tsc` and every validator passed, and the bundle threw on import —
> blank app. Only loading it in a browser found it.

---

## 18. Shipping: EAS Build and Over-the-Air Updates

### The runtime-version trap — read this before every publish

An OTA only reaches binaries whose **runtime version matches**. Builds do not
share one:

| Build | Runtime version | Can its users still open the app? |
|---|---|---|
| **21 (current)** | `8c32d9181fa168c587b1109a48d0d89108cfe32b` | **yes** |
| 20 | `b6f745e0007d2de75837eff60dc50fd3dd5b38c5` | no — below `MIN_VERSION_CODE` (raised 2026-08-19) |
| 19 | `29eb709aad3b70740f0c92239b1a350820c81247` | no — below `MIN_VERSION_CODE` |
| 18, 17 | — | never finished; both ERRORED |
| 16 | `bd0c0637f7e636eef9e8ddbbe61db9c9c9ae513c` | no — below `MIN_VERSION_CODE` |
| 15, 14 | `7655f410f4b7050d121f65fcfb33bb7c2da56b5a` | no — below `MIN_VERSION_CODE` |

So today there is again exactly **one** runtime worth publishing to, and the third
column is why: with the gate at 21, every older binary is held behind the update
wall and an OTA to its runtime lands on people who are already stopped.

> **It was two for the length of one afternoon, and that window is the lesson.**
> Build 21 shipped on 2026-08-19 with the gate deliberately left at 20 (§20), so
> for as long as the rollout was running, build 20 readers could still open the
> app and still needed every update — and an OTA sent only to 21's runtime would
> have reached only the people who had already updated. That is the same silent
> failure as publishing to a dead runtime, wearing the opposite disguise, and
> nothing would have reported it.
>
> The window closed the way it is supposed to: 21 reached 100%, the gate went to
> 21, and **that release was published to build 20's runtime FIRST**. A gate raise
> that does not reach the binaries it is about to block is a wall nobody is told
> about. Expect this window every time a rename or a native change ships.

> **This table goes stale the moment a build finishes, and a stale row here is
> not a documentation nit — it is updates published into a void.** Build 20
> finished on 2026-08-09 and raised the gate to 20, and several OTAs went out to
> build 19's runtime afterwards: every one of them targeted people the update wall
> was already holding. Nothing errored, because nothing can. **Run
> `eas build:list` and read `MIN_VERSION_CODE` before every publish** — the two
> together are the only way to know which runtime is actually reachable.

The runtime is a **fingerprint of the native project**, so it changes whenever
app icons, `app.json`, `eas.json` or any native dependency changes. Publishing to
one runtime while users sit on another means **the update reaches nobody**, and
the failure is completely silent.

> **Publish to every runtime still in the wild**, newest first. Drop an old one
> only once nobody is left on that binary.

**"In the wild" means reachable, not merely installed.** A binary below
`MIN_VERSION_CODE` (§20) is held behind the full-screen update wall, so its users
cannot open a lesson at all — and an OTA to that runtime lands on people who are
already stopped. Once the gate was raised past 16, runtime `7655f410…` (builds
15/14) stopped needing updates entirely, and several were published to it anyway
before anyone noticed.

So the rule has two halves that must be read together: **publish to every runtime
whose users can still reach the app, and check `MIN_VERSION_CODE` to know which
those are.** They come apart again the moment the gate is raised: the release that
raises it must reach the runtimes it is about to block, or it locks out people it
never told to update.

### The fingerprint tracks your working tree, not the build

`runtimeVersion` is `{ "policy": "fingerprint" }`, and the fingerprint is
computed from the **current working tree** — `eas.json`, `app.json` and the icon
/ splash assets are all inputs. So it equals a build's runtime only while the
tree still matches what that build was made from. Change an icon and it moves.

That is how an update gets published to a runtime **no build has**, and it has
already happened here: an update sits on `8ca4a96872a65829c561c9cdaf2929c66bbc9018`,
which belongs to no build in `eas build:list`. It reached zero devices and gave
no error. (It was superseded, so no harm done — but nothing would have told us.)

**So check before every publish, don't assume:**

```
npx expo-updates fingerprint:generate --platform android   # last hash in the JSON
eas build:list --limit 5 --json                            # runtimeVersion per build
```

If the local fingerprint matches the runtime you're targeting, publish as-is.
Otherwise pin it explicitly, which is always safe:

1. Set `"runtimeVersion": "<the build's runtime>",` in `app.json`
2. `$env:CI=1; eas update --branch production --environment production --message "..." --non-interactive`
3. **Revert** to `{ "policy": "fingerprint" }` and confirm a clean tree.

Repeat for each runtime. **Always** verify `git status` is clean afterwards; a
left-behind pin will silently mis-target the next publish.

> This file has now claimed three different things about the local fingerprint, which
> is the point: **it is a moving value and the only safe move is to generate it.**
> First it said the fingerprint could never match because of an autolinked widget-pin
> module. Then, at build 16, it matched exactly (`bd0c0637…`). As of 2026-07-30 it has
> moved again, to `285fd93f…`, and as of **2026-08-08** it is `3dbfa1be…` — the
> fingerprint hashes `package.json` and the lockfile, so **adding a dependency moves it
> even when that dependency has no native code at all.**
>
> So the pinned-publish path in the steps above is not the exception, it is the normal
> case. That publish went out pinned to `bd0c0637…` (build 16) and `7655f410…`
> (builds 15/14); left on the fingerprint policy it would have gone to `285fd93f…`,
> which no build has, and reached nobody without erroring.

### Builds

`eas.json` uses `appVersionSource: remote` with `autoIncrement: true`, so
versionCode bumps itself. Android credentials/keystore are remote — the same
signing identity every time, which is what lets Play accept the upload.

```
$env:CI=1; eas build --platform android --profile production --non-interactive
```

There is **no** `eas submit` service account configured; the AAB is uploaded to
Play by hand. Builds run on the free tier, which cannot silently charge — over
the allowance a build queues or is refused, never billed.

**Verify an icon actually landed** by unzipping the AAB and reading
`base/res/mipmap-xxxhdpi-v4/ic_launcher_*.webp`, rather than trusting the config.

### Before ANY publish

1. `npx tsc --noEmit` must exit 0.
2. `git status` — a build or OTA bundles the **working tree**, including someone
   else's half-finished edits. This has caught a total blocker more than once.
3. **`git log -1`, immediately before the publish command — not five minutes
   before.** The tree is a moving target while someone is working in it, and
   `git status` only answers "is anything uncommitted", which is the wrong
   question if the answer changed by being *committed*.

   This is not hypothetical. An unfinished badge redesign was deliberately
   stashed so that a narration-only update could go out clean; the tree verified
   empty and `tsc` passed. Six minutes later the other person saved their buffers
   and committed, which put all 1,556 lines back on disk — and the publish that
   followed bundled every one of them. The stash had been the right tool at the
   moment it was taken and the wrong one by the time it mattered, because **work
   stops being protected by a stash the instant it is committed.**

   The tell was in plain sight and went unread: `eas update` prints the HEAD
   commit it published, and it printed a hash that was not the one stashed
   against. **Read that line in the output.** If it is not the commit you meant
   to ship, the bundle is not what you meant to ship either.

   Isolating a publish from someone's in-flight work is therefore only reliable
   when nobody is touching the tree. If they are, either wait, or ask them to
   stop and confirm before you start — a five-minute publish window is long
   enough for a whole feature to land in it.

---

## 19. Photographic Backgrounds and the Scrim Rule

Photographs sit behind the branch cards, the branch mastheads, the launch screen
and Quick Start. They are the one place the strict B&W identity bends, and they
are all desaturated to keep it.

**The rule: never take text contrast from the artwork.** The images range from
near-black to almost white, so nothing can be read reliably off them. Every
surface lays a **fixed gradient scrim** — near-clear at the top so the picture
reads, near-solid ink where the words are — and the type is one fixed cream with
its own shadow. Tone is decided by construction, never per image. Shared values
live in `constants/branchArt.ts`.

Hard-won specifics:

- **`ImageBackground` must be given an explicit `width`.** Without one it takes
  the *picture's* intrinsic width, so narrow images leave a bare strip down the
  side and wide ones overhang.
- **A masthead scrim that is too heavy stops being a picture.** At 0.62–0.86 a
  branch whose crop landed on a dark band read as a plain black box. It is now
  0.40–0.70, with the text carrying its own shadow.
- Images are re-encoded to JPEG. The six branch PNGs were 1.9 MB and became
  381 KB; every OTA would otherwise carry the difference.
- Quick Start's rotation is keyed on the **date alone**, so finishing a lesson
  swaps the lesson under the same sky.
- Source images are only ~330–500px wide, so they upscale softly on a full-width
  card. Replacing them with higher-resolution files needs no code change — same
  filenames in `assets/images/branches/` and `assets/images/quickstart/`.

### And the overscroll at the top, where the clipping never reached

> *"when you're already at the top … when you try scroll up even more … it's
> really lag[gy]. And if you scroll down, it's fine. For all the other tabs, it
> is smooth when you do this."*

**PROFILE IS A GENUINE OUTLIER, AND IT IS WORTH HAVING THE NUMBERS.** Measured in
the real page at 390×844: 2770 units of content — 3.3 screens — against Home's
1316 and Insights' 1399, and **716 nodes and 50 SVGs** against 164/8 and 208/2.
Android 12+ does not scroll past the end, it applies a `StretchEffect`, which is
a RenderEffect over the scrolling subtree; §17's rule 7 already records what a
moving parent over SVG content costs here.

**AND THE OPTIMISATION MEANT TO CONTAIN THAT HAS NEVER ONCE RUN.**
`removeClippedSubviews` works per DIRECT CHILD, and this ScrollView has exactly
**two**: the header, and one body View 2471 units tall. The body spans the
viewport at every scroll position, so neither child is ever fully off screen —
**at the top the pass could detach 0 of 716 nodes.** The comment claimed it
"keeps the fling cheap on Android". It was never true of this content shape, and
nothing had ever measured it.

One level down is where it works: `styles.body` has **nineteen** children, and
twelve of them — 1411 units, **525 of the page's 716 nodes and 44 of its 50
SVGs** — start below the fold when the reader is at the top. React Native only
recurses into nested clipping groups from a ScrollView that carries the flag
itself, so the ScrollView keeps it as the ROOT of the pass and the body carries
the one that can reach something.

> **AND THE INSTRUMENT COULD NOT SETTLE THE MECHANISM, WHICH IS WORTH ADMITTING.**
> A browser cannot reproduce Android's stretch, so the nearest proxy is animating
> a transform on the scroll content and counting frame gaps. It gave Profile 33ms
> a frame against 16.7 for the other two — and then, on a third run of the same
> code, 16.7 for everything. **Two of three runs agreed and the third did not**,
> which by this file's own standard (§19: "an instrument that cannot repeat itself
> cannot judge a refactor") makes it evidence of a difference and not a
> measurement of one. The structural finding above needed no such proxy: it is
> counted, not timed. What is still unverified is whether detaching 73% of the
> page at the top is enough on a real device, and that needs `adb`.

### On a page this long, a `setState` is not a small thing

> *"the app will begin to lag after completing a lesson and when I go to the
> profile and scroll, it lags a lot … this may not happen every time but it
> happens a good amount. I need this to be compltely fixed."*

Profile is ONE component of **~890 nodes and 45 SVGs**, so any state change
re-renders all of it in a single blocking commit. That is the whole finding, and
every symptom above is a consequence of it.

**Measured, not guessed.** Step the whole page at 6× CPU throttle, sample every
frame, and split the bill with Chrome's own counters (script / layout / style).
Two triggers were found, and each was confirmed by a bisect that changed ONE
variable — same remount, same first paint, same measure calls:

| | worst frame | script |
|---|---|---|
| the in-view flag firing | **976ms** | 1148ms |
| …with that one update suppressed | **23ms** | 88ms |
| the chart recording it was seen | **1774ms** | 2142ms |
| …with that one write suppressed | **64ms** | 220ms |

Both were the same shape: **a boolean that gated a child's animation was being
kept by the screen.** Profile had exactly two `useState`s — "is the tab focused"
and "is the chart on screen" — and both existed only to compute ONE prop for ONE
child. `chartSeenXP` was the same mistake wearing a store: Profile supplied it
AND subscribed to it, so the chart finishing its own intro re-rendered the page.

So the rule, and it is now checked by `check:ui` from both ends: **a flag that
gates a child belongs to the child.** `useInView` keeps its state in refs and
publishes it (`useSeen`, a `useSyncExternalStore` subscription); `RankClimbChart`
reads and writes `chartSeenXP` itself under `selfSeen`. Profile holds no state at
all now. After both fixes, on the same instrument:

    scrolling the whole page, steady          27ms → 22ms
    a fresh visit (worst case, a remount)    976ms → 371ms
    the pass where the chart plays          1774ms → 232ms

> **Three theories died before the right one, and the instrument killed all
> three.** An uncancelled `withRepeat(-1)` in `TapNudge` looked certain — a lesson
> starts it, nothing cancels it, and `HomeHeader` already carries a comment about
> exactly that costing "a small cost and a permanent one". Mounting 24 of them and
> taking them out again returned **100% of the cost**: Reanimated does clean up on
> unmount, and the whole accumulation story was wrong. Then the first scroll
> measurements said Profile got FASTER after a lesson — because passes 1 and 2 are
> one-time work and pass 3 is the truth, so comparing a cold pass with a warm one
> blames the lesson for the page merely having been new. And finishing a lesson
> costs **1ms of JS**; it was never the lesson.
>
> Which is the point: this is a symptom people describe by what they were doing
> when they noticed it, and what they were doing is not the cause. Measure the
> steady state, bisect one variable, and believe the number.

> **AND THEN THE SCREEN WAS SPLIT, WHICH IS THE OTHER HALF.** The two fixes above
> stopped Profile re-rendering for flags that were never its business. They could
> not help with a write that genuinely changes what it shows — finishing a lesson
> moves six of the fifteen store fields this screen reads — and every mounted tab
> pays that, because all five are built at startup and stay mounted for the
> session.
>
> Every section is wrapped in `useMemo` now, so React gets the SAME ELEMENT back
> where that section's own inputs have not moved, and an unchanged element is a
> subtree it skips. The derivations went the same way: `philScores` maps all 322
> thinkers and filters the saved quotes for each, `branchInterest` does six passes
> over the same 322, and both ran on every render including the ones that produced
> an identical page. `chartInk` was four constants rebuilt per render and handed
> to three charts as a fresh object, which is enough on its own to defeat any memo
> those charts might be given.
>
> | | at the start | after the flags | after the split |
> |---|---|---|---|
> | first scroll through | 955ms | 233ms | **134ms** |
> | the pass where the chart plays | 1774ms | 232ms | **64ms** |
> | a fresh visit | 976ms | 371ms | **87ms** |
> | one lesson-complete write, to paint | ~190ms | ~188ms | **86ms** |
>
> **The dependency lists are the danger and they are not type-checked.** A missed
> one is a section that quietly stops updating, which no screenshot and no static
> comparison can see. What made the refactor safe was an equivalence harness that
> records every element's box, colour, font, weight, opacity and text at three
> scroll positions — and then does it AGAIN after mutating the store the way a
> finished lesson mutates it. A stale section shows up there as a row that did not
> change when it should have. Six signatures, ~750 rows each, identical before and
> after.
>
> **Its control run is the part worth copying.** Run before and after with NOTHING
> changed, and it reported 1350 differing rows — the store persists to
> localStorage, the browser profile survives between runs, so run two saw run
> one's `chartSeenXP`, drew the recap instead of the entrance, and every y below
> the chart moved 24px. An instrument that cannot repeat itself cannot judge a
> refactor, and this one would have been believed. Pin the seed, clear the
> storage, compare fixed scroll offsets rather than a clamped bottom, and ignore
> anything with no area.
>
> **And the wrapping itself failed once, silently to the compiler.** The sections
> were spliced back-to-front on the assumption that later indices stay valid —
> but each section's end anchor is the next section's START, and once that next
> section is wrapped the anchor sits inside its wrapper, so the block swallowed
> the wrapper's opening lines and the hooks nested. `tsc` was perfectly happy;
> React said "Do not call Hooks inside useMemo(...)" at runtime. Compute every
> boundary on the pristine text first, then splice.


**What is still true, and is the next thing to do.** Every mounted tab re-renders
on every store write, and all five are built at startup — so an XP write during a
lesson re-renders Profile's 890 nodes even though Profile is nowhere on screen.
Measured at **~190ms to the next paint, unthrottled**, per write. It is off the
critical path for Profile itself but it lands on whatever IS on screen, which
after a lesson is the reward. The real fix is to stop Profile being one component
— split it into memoised sections so a write costs only the section that changed
— and that is a refactor of a 961-line file, not a patch.


### Struck things are shaded, and that is not a second colour

Rank pins and badges carry **tone**: a lit side, a shaded side and a small drop
shadow, so a frame reads as an object rather than an outline. This does not bend
the B&W rule, because there is no new hue in it — every value in
`components/shared/tone.ts` is ink, grey, or the warm paper the app is already
printed on. What changed is that those greys are now arranged as *lighting*.

**One light, top-left, and it never moves.** The face gradient runs light→dark
down-right, the rim highlight sits top-left, the shadow falls bottom-right.
Seventy-five marks lit from one direction read as a set; lit from wherever suited
each one, they read as clip art. `tone.ts` has zero imports for the same reason
`rig.ts` does — a contact sheet of every pin and badge can be rendered and looked
at in plain Node, which is how the first two attempts were caught.

**Locked is flat and cool** (`GHOST`, a slate off the warm ramp), with no
gradient and no shadow. "The same thing, dimmer" is indistinguishable from a
rendering fault; unlit against lit is the reward for earning it.

Two findings worth not rediscovering:

- **A 7% tonal range is invisible.** The first pass ran `#FEFEFC`→`#DFDBD1` and
  read as flat at every size. It needs a real swing (`#FFFFFF`→`#C6C0B2`) before
  it registers as shading at all.
- **A tone fitted for METAL is invisible on PAPER, and this has now caught three
  different marks.** `on` and `rule` in `constants/insignia.ts` are toned for the
  face they sit on — and `on` is `#FFFFFF` for all eight orders by construction,
  while seven of the eight `rule` values fail 3:1 against paper. So: the rank
  pin's ray halo was painted in `rule` and vanished; the badge case's **laurel
  wreath was stroked in `on`, which meant every tier-III badge shipped a white
  wreath on cream for months**; and then the capstone collar reached for `rule` on
  both ladders at once. The moment a mark is drawn BEYOND an edge it is on paper
  and needs a paper tone — the material's `base`, which clears 4.5:1 on every
  order. `check:ui` §4d re-derives all sixteen values and asserts that neither the
  collar, the laurel nor the ribbon reaches for a metal tone again.
- **Crossed swords do not work behind a medal**, however heraldic the reference.
  The medal covers the crossing, so all that shows is two tips above and two
  hilts below — horns at 168px, mush at the 66px the badge grid actually draws.
  A laurel is a continuous curved mass, so being half-covered costs it nothing.
  `swordPaths` is kept in `badgeShapes.ts` so the decision is one line to revisit.

### A quote is a struck thing too, and its metal is the era

Quotes were the flattest surface in the app, and the cause was structural rather
than a matter of taste: **four screens each drew their own rectangle** — Quote of
the Day, the saved collection, a thinker's profile, and the lesson deck — a
hairline border, italic Playfair, the same two greys, in four files that had
never been reconciled. So a quotation said nothing about who wrote it or when,
nothing changed about it when you kept it, and it was the one object in the app
still drawn as an outline while every button, card and rank pin sat on a lip.

`components/shared/QuotePlate.tsx` is the one object all of them use now, and
`tone.plate(hue)` derives its five roles from a single hex by the same two mixes
`ramp()` uses — so the light direction cannot drift between eras.

- **The colour is a LABEL and it already existed.** `ERA` in `constants/design.ts`
  is the licensed "one place a hue means something", keyed on the five groups
  `data/philosophers.ts` already sorts 322 thinkers by. Five recognisable colours
  is what makes a list of twenty quotes scannable; one tone is what made it a
  pile.
- **The identity does not bend.** The rim is ink and the quotation is ink. The
  era lives in the spine, the printer's mark, the byline and the ledge — edges
  and marks, never a flooded surface. That is `HUE`'s own rule applied to five
  hues, and it is why a shelf of these still reads as printed matter.
- **Two states are worn by the OBJECT, not just the button.** Saved fills the
  spine (3px rail → 7px struck spine); featured folds the corner. A toggle that
  only changes an icon is not a collection.
- **The Saved sheet leads with the SET, not the count.** Five era tiles, held ones
  lit and empty ones flat and cool — `LOCKED_FACE` under `GHOST`, the exact
  treatment a locked rank pin gets, for the reason stated above. The readout is
  "3 of 5 eras · 8 thinkers", and the tiles are the filter.

Two things that were measured rather than judged, and both had already failed:

- **A colour measured on one ground does not survive another.** All five ERA hues
  clear 4.5:1 on `paper` by construction, but the byline sits in the plate's
  SHADED corner, and jade measured **4.20:1** there — under the floor, on a value
  that had passed its own check. Hence `plate().label` carries its own tone.
  `check:ui` re-derives all twenty-five pairs.
- **The kicker and the printer's mark cannot share a band.** At one offset the
  mark was painted across QUOTE OF THE DAY; at the next it was painted across the
  quotation's first word. Both were rendered and looked at, and they bracket a
  4px gap that a 24px glyph does not go into — so the answer was not a better
  offset but `kickerGap`, which makes the band. **Nothing painted over a word is
  acceptable (D31), including the app's own decoration.**

### Insights is coloured now, and no target comes from a total

The tab drew the same numbers three times — a pie of "interest", a pie of
thinkers, a bar chart of "interactions" — in six greys, at a point where
`constants/design.ts` already held six measured branch hues put there for
exactly this job. Its own comment calls one-tone readings "the 'dull' the
redesign was asked to fix", and Insights was the last screen still doing it.

It is four different readings now, all struck by `components/profile/Struck.tsx`
so the light matches the profile rather than starting a second system: a ledger
of four counts, the branches by lessons, a thinker league, and thinkers by era.
`SketchPieChart` is deleted — five names in a pie is the least readable form a
ranking can take, since it asks a reader to compare five arcs and then hunt a
legend for whose arc is whose.

**The load-bearing part is that no target may come from a ceiling.** The tap
interaction used to say "4 more lessons finishes Logic", and the reader named
what is wrong with it: *"since I will be continuing adding lessons that doesnt
make sense."* It is worse than untidy — the curriculum has gone 60 → 192 → 222
lessons and is still growing, so a ceiling-based target **moves away from a
reader who has done nothing wrong** every time content ships. Effort is supposed
to be permanent.

`lib/utils/statsMilestone.ts` has two target shapes left, both immune: OVERTAKE
(pass the next thing along — both sides are the reader's own numbers) and MARK
(the next round number of something actually done). `npm run check:stats` runs
every synthetic profile against a **32-lesson and a 900-lesson** curriculum and
fails if a single milestone differs; today 4,078 come out identical. It also
holds that a target never retreats as you work.

> The same "N of M" shape still lives on Profile's `MasteryRow` ("22 / 34"), and
> it has the identical problem for the identical reason. It was left alone only
> because that file was being edited elsewhere at the time.

**The ring came back, and the tap stopped stating the obvious.** Two follow-up
notes from the reader, both right:

- *"I liked how that graphs looked before, I want more graphs like that look, but
  redone in a way that is more visually pleasing."* A ranking answers "which is
  biggest"; a ring answers "what is the shape of my reading", and those are
  different questions. `components/stats/Donut.tsx` is the ring — the six BRANCH
  hues, one light across the whole object, a groove behind it so an empty reader
  still sees the shape, and the total in the hub. It shares its selection with
  the bars under it, so the two are one chart rather than two views.
- *"I dont like the obvious information ... like '5 more lessons and your at 20
  lessons done' this is obvious and isnt informative."* Also right, and it was
  the shape of a progress bar wearing words. `lib/utils/statsDiscovery.ts`
  replaced it: tapping a branch or an era names a thinker from it the reader has
  **never opened**, with their symbol, their dates and their idea in ten words;
  tapping a thinker in the league gives one of their three "Did you know?" facts.
  Every card ends in a door. `check:stats` asserts the complaint directly — no
  card may ever contain "N more".

**The bounce is feedback, not decoration, and that distinction is the design.**
`bounceTo` squeezes to 0.82 and then springs past to about 1.07 — anticipation
then overshoot, which is the whole reason a bounce reads as a thing *reacting*.
It plays on the ring every visit that has news, and on rows **only where the
reader's own number went up**: `grownKeys` recovers that from the previous
fingerprint, which the tab already stores, so no new store key was needed. A
grown row squeezes from its CURRENT length rather than from zero — reset it to
zero first and the reader sees the bar being rebuilt, which reads as a reload.

Measured in a browser rather than eyeballed: ring 0.82 → 1.07, the one grown row
0.82 → 1.07, and all fifteen others 0 → 1 with no overshoot at all.

> **The entrance was snapping to its end state, and nothing looked wrong.**
> `markStatsSeen` writes the fingerprint, which re-renders, which changes the
> focus callback's identity, which makes `useFocusEffect` run it AGAIN — and on
> that pass the fingerprints match, so the old code called `setAnimate(false)`
> while every spring was still travelling. Every child keys on `animate`, so all
> of them jumped to the end. The instrument is what found it: the ring and all
> seventeen bars sat at exactly 1.000 through a growth event that should have
> bounced. The flag never needed clearing — children re-run on `playToken`, which
> only moves when there is news.

### An arrival is not a reaction, and the tab could not tell them apart

> *"sometimes if I'm in the statistics section and I click on a philosopher …
> and then go back. Sometimes the information will go blank on the very top and
> will say zero lessons, zero thinkers, zero quotes, and zero days."*

Exactly what it says, and it was the entrance animation firing at the wrong
moment. **Every animated part of the tab treated a change in the fingerprint as
an arrival** — shared values to 0, counters restarting from nothing, the four
ledger tiles to `opacity: 0` and `scale: 0` and then a second of counting back
up. Right for reaching the tab; completely wrong for anything that happens while
the reader is already looking at it.

And opening a thinker from inside Insights **does** move the fingerprint:
`recordPhilosopherView` increments that era's met count. So the reader's own tap
made the screen announce itself as new and wipe its own top row. That also
explains the *"sometimes"* — only a thinker they had **never met** moves a
counted number, and their message says so: *"it shows up a someone you have not
met, and I click on that."* Meeting someone already met changes nothing and the
tab holds perfectly still, which is what made it look intermittent.

Two modes now, threaded to every animated child as `entrance`: an ARRIVAL sweeps
in from nothing, a REACTION resets nothing at all — numbers roll from the figure
on screen to the new one, and only the rows that actually grew move.

**Telling them apart needs TWO focus effects, and that is the load-bearing
part.** `useFocusEffect` re-runs its callback in place whenever the callback's
identity changes, and this screen's changes with the fingerprint — so the flag
that remembers "we have been here a while" must live in an effect whose deps are
`[]`. Merge them and the flag is cleared by the very event it exists to detect.

> **The first fix consulted `entrance` and still blanked the ledger.** These
> effects also depend on the FIGURE they draw, because the number has to follow
> the store even when nothing bumps `playToken` — so the store updates, the
> effect fires on the value alone, and it reads the PREVIOUS play's `entrance`.
> A probe in the browser: one tap ran the ledger effect four times, and the third
> ran at play 1 with a stale `true`, 71ms before the screen had worked out that
> this was a reaction. Hence `newPlay`, uniformly: **an entrance is something the
> screen announces, never something a changing number can trigger by itself.**
>
> `check:stats` now reads the source for it — an effect that depends on
> `playToken` and zeroes a value must mention both `entrance` and `newPlay` — and
> it is counter-tested by putting all three defects back and watching it go red.
> It strips comments first, for the reason §17's L8 gives.

Measured through a real meet-a-thinker event, ledger tiles:

| tile | reads | opacity floor | scale |
|---|---|---|---|
| LESSONS | 41 → 41 | 1 | still |
| **THINKERS** | **14 → 15** | **1** | **0.82 → 1.07** |
| QUOTES · DAYS | unchanged | 1 | still |

> **AND THEN THE READER SAW ZEROS AGAIN, AND THE SECOND ONE WAS NOT A BUG.**
> Driven through every tap a reader can make in the tab — legend rows, era rows,
> league names, the discovery CTA, meeting someone never met — 651 samples of all
> eight counters came back with **zero zeros** and no remounts. The remaining way
> to see zeros was the ARRIVAL doing exactly what it was written to do: re-enter
> the tab with anything new and the four totals and the four metrics all read
> zero for up to a second and a half while they climbed.
>
> **A count-up is a flourish; "your figures are gone" is a fright**, and it is the
> only failure this readout can have. So no figure the reader can read is
> animated through zero any more. The number on a tile is true from the first
> frame it is drawn, the TILE does the arriving (fade, and 0.72 → 1 rather than
> out of a speck, so nothing ever fully disappears), and the digits move only
> when the figure behind them moves — which is also the only time a moving number
> tells anyone anything. `check:stats` reads the source for it: every shared
> value that reaches an `ACounter`'s `text` must start at its real figure and
> must never be assigned 0, counter-tested in both directions including the one
> BORN at zero, which no effect can undo.
>
> **The bounce needed its own scale to survive that.** Folding the feedback beat
> into the arrival's 0.72 → 1 ramp flattened the squeeze from 0.82 → 1.07 to
> 0.95 → 1.02 — measured, and not a bounce. They are two statements and one
> shared value cannot make both, so `rise` and `beat` multiply. Final reading
> through a real meet-a-thinker event: the three untouched tiles dead still at
> opacity 1, the one that moved at **0.82 → 1.07**, every figure true throughout.
>
> **And the harness lied first, in the way §21 warns about.** A fixed three-second
> wait before marking the end of the arrival was enough when the page loaded in
> two seconds and not when it loaded in four — so the arrival got labelled as the
> reaction and the summary showed tiles fading to zero opacity on a tap, which
> reads exactly like the bug being back. It settles on the data now. Before
> believing an instrument that says the defect returned, check that it is
> measuring the window it claims to be.

> **"PER ACTIVE DAY" was the one caption in the app nobody could read.** Fourteen
> tracked characters at 7.5px in a metric cell about 78px wide, cut to an
> ellipsis, and the reader said so: *"I cannot read what the other one says."*
> Tightened to 0.7 letter-spacing and given a two-line box that all four cells
> share, so the long one wraps rather than truncates and the strip's foot stays
> level. Measured unclipped at both 390dp and **360dp**, where it wraps — check
> the narrow phone, because that is the one the caption breaks on. Shortening the
> label was the other option and it loses the meaning: this is XP per day ACTIVE,
> which is not XP per day.


### The two paper boxes, and why a tile's shading does not scale

> *"for the who you read most and thinkers by era, I want this information to be
> put in a box or boxes and to add some depth to the texts and to the box in
> general."*

`StruckPanel` in `components/profile/Struck.tsx` — the paper counterpart to the
dark instrument. Insights read "object, object, page", and the two readings that
are most personal to the reader were the two with no edges at all.

- **The head is a RECESS and the body is the face.** That is the whole of the
  depth, and it obeys the rule `StruckNiche` already states: a groove is bright
  where a dome is dark. The band's gradient runs the opposite way to the card's,
  takes the dark hairline along its top where light cannot reach into the cut and
  the pale one along the bottom where it catches the far wall.
- **A tile's shading does not survive being scaled up.** `StruckTile` runs the
  full `PAPER_LIT → PAPER_SHADE` across about 80px and reads as a lit face; the
  identical three stops across a 350px card came out as a **tan stain** in the
  bottom corner. A big flat surface lit from one side barely shades at all — its
  depth is in its EDGES. The panel runs a third of the fall-off and gets the rest
  from a lit top rim, a hairline rule and the shadow it sits on.
- **The emboss is an INK shadow, not a paper highlight.** The obvious letterpress
  — type pressed into the sheet, lit from below — cannot work on this palette:
  `PAPER` is `#FAFAF7` and `PAPER_LIT` is `#FFFFFF`, a 2% swing, and §19 already
  measured what that looks like. So the type sits proud and drops its shadow
  down-right along the one light. `EMBOSS` is one exported style so §12's
  `textShadow*` sweep stays a one-line change, and it goes on display type only.
- **`includeFontPadding` was why the league numeral sat low in its disc**, not
  the flexbox centring, which was right all along. Android adds the font's own
  top/bottom padding to the line box and Playfair Display's is deep and
  asymmetric, so flex was centring a padded box while the reader saw a digit
  sitting low. Turning it off makes the line box the glyph's real ascent and
  descent. Measured on all five discs: **dx 0.00, dy 0.00**. No magic offset — an
  offset would only be right at one size.

> **And a numeral that looks sliced at 2× may be whole at 4×.** All five era
> counts read as if their right sides had been cut off, and the measurement said
> every one of them sat inside its row with zero overhang. One capture at device
> scale 4 settled it: the numerals are complete and the reading of the smaller
> picture was wrong. Trust the measurement, then go and look bigger — do not
> "fix" a defect only a downscaled screenshot can see.


### The instrument, and what "cheap" actually was

The tab was rebuilt again, and the brief looked contradictory: *"the whole tab
looks too much childish, I need more premium feel and vibrent colors, not just a
bunch of colors that make the app feel cheep."*

**What made it cheap was never the palette. It was the AREA.** Six saturated
fills on white, all large, all at once — a 26px ring, twelve-pixel rounded pill
bars, pastel tinted cards behind the prose. Six big colours competing on paper
is a rainbow, and a rainbow is the cheapest an interface can look.

So the readings that ARE charts moved onto one dark panel
(`components/stats/Instrument.tsx`), where the same six hues appear as a 14px arc
and an 8px swatch and read as cut stones. The ledger, the thinker league and the
era rail stay on paper: they are lists of the reader's own achievements, and one
instrument on a page of paper is a plate in a book, where a wholly dark tab would
be a dashboard belonging to some other product.

- **`tone.glow()` cuts the branch hues for the dark ground, and both obvious ways
  of doing it fail.** Mixing toward `PAPER` — what `ramp().lit` does —
  DESATURATES, and the six came out `#8E768E`, `#5A93A1`, `#7C96BC`: pastel, not
  rich. Pushing HSL saturation instead runs to `#C651CD` electric magenta and
  `#41DCA5` neon mint, which is the exact corner `design.ts` records its own
  colour search falling into. The band between is the branch's own hue with its
  chroma lifted a quarter and lightness at the midpoint.
- **The dial has a sixty-tick bezel**, and it is not decoration: a bezel implies
  the ring is measured against something, which is the difference between an
  instrument and a pie. It is also the cheapest depth available.
- **One accent for everything that is not a branch.** The XP line is `METAL.GOLD`
  and nothing else — the same material a first-place league disc is struck in,
  and XP is what gold already means here. A second data colour would start a
  palette; one accent plus six labels is a system.
- **Type on the panel is never a branch colour.** Measured on `PANEL_BASE` the
  six run 3.8:1 to 9.1:1 — past the 3:1 a mark needs, and three of them under the
  4.5:1 text needs. So the hues encode and every word is cream.

**The line chart is thirty days of XP** from `dailyXP`, with its seven-day mean
dashed under it, the best day marked, and four figures beneath: best day, per
active day, days active, streak. Not one SVG property animates — the chart is
drawn once and revealed by a CURTAIN of the panel's own ground sliding right,
which is also why the chart block sits on flat `PANEL_BASE` while the panel above
it carries the gradient. A curtain can only be invisible if it is exactly the
colour of what it covers.

Three things measured rather than judged, and the first two were checks being
wrong rather than colours:

- **sRGB distance is the wrong instrument for a palette pinned to one lightness.**
  The first draft held the jewel set to a raw-sRGB floor of 60 and failed two
  pairs. In CIELAB — the metric `design.ts` uses, for the reason it states — the
  closest pair is **ΔE 34.9**, against the **25.1** the shipped branch palette
  manages. The tones are better separated than the ones they are cut from.
- **The bezel check measured the gradient, not the bezel.** The panel's gradient
  top is supposed to be barely there; the 1px hairline drawn on it is what has to
  be seen. Two different floors, and the first draft applied one to both.
- **A row's bounce nearly went missing in the move.** The branch bars carried it,
  and as legend rows their fill became a WIDTH rather than a transform — so the
  one row the reader had actually moved stopped reacting and only the dial
  popped. Measured through a real growth event: dial **0.82 → 1.07**, the grown
  row **0.82 → 1.07**, every other row a calm **0 → 1.055**. The entrance sweep
  was damped from 11 to 16 for that last number: at 11 it overshot to 1.19, which
  is both springier than a premium readout wants and slightly untrue about the
  data.

> **Two sessions writing routes into `app/` will delete each other's.** Mid-verification
> the preview route vanished and the page went blank with no error anywhere —
> the other session had swept `app/` while its own harness ran. Metro also wedged
> and served nothing on a port that was still LISTENING. If a preview route stops
> rendering for no reason, check that the file still exists before debugging the app.

Two things measured rather than judged:

- **The bar headroom is 30% and it is load-bearing.** Bars draw against
  `max × 1.3`, so the LEADER — the row a reader taps first — still has track left
  to draw its ghost in. Re-scaling on selection instead would move every bar at
  once, which is the camera cut group L is about.
- **`ACounter` needs an explicit width and `counterStyle` cannot give it one.**
  It is a `TextInput`, and an unstyled `<input>` claims ~20 characters of
  intrinsic width, which silently eats a flex row. It squeezed a label with
  plenty of room into "EPISTEMOL…" — invisible on a device, obvious in a browser.

> **AND THE DIAL WAS STILL FLAT, WHICH IS A DIFFERENT COMPLAINT FROM CHEAP.**
> The ring above fixed AREA and GROUND — six saturated fills on paper became a
> 14px arc on near-black — and the reader came back: *"it looks a little bit doo
> kiddish, and a little bit too not very premium looking. Looks very flat … I
> wanted to have depth."* They supplied a reference: solid pies seen at an angle,
> with an extruded side, one slice pulled out, in a muted palette.
>
> **A RING CANNOT HAVE A LIT SIDE, BECAUSE A RING IS A LINE.** Everything else
> premium in this app is a struck solid — the pins, the badges, the certificates,
> the streak calendar — so the chart is a solid now: a tipped disc whose every
> wedge is three surfaces, a lid running lit→base along the one light, an
> extruded WALL drawn only where its arc faces the viewer, and a rim where the
> two meet. `components/stats/Dial.tsx`, one `<Svg>` per wedge so the chosen one
> can slide out along its own bisector on a transform (§17's rule 7 forbids
> animating an SVG's properties; moving the View that holds it costs nothing).
>
> **THE PALETTE WAS ALREADY RIGHT AND `glow` WAS THROWING IT AWAY.** `BRANCH` in
> design.ts is aubergine, petrol, slate blue, pine, dusty rose and burnt sienna
> — L 31–46, chroma 24–46, exactly the register the reference is in. `glow`
> exists to make a fourteen-pixel arc visible on near-black and does it by
> forcing every hue to L 0.5 and pushing saturation, so all six came out at
> L 47–71: pine as mint, aubergine as orchid. Six colours that differed in
> LIGHTNESS now differed only in hue, all of them bright, which is the definition
> of a crayon set. `tone.disc()` lifts the source by a constant 0.08 and touches
> nothing else.
>
> **0.08 IS NOT A TASTE, IT IS THE MOST THE PALETTE CAN AFFORD.** The branch set's
> own tightest pair is epistemology against logic at ΔE 25.1, barely over the 24
> design.ts holds them to — and lifting compresses toward white, so 0.10 is
> already under the floor. Two searches came back wrong first, both the obvious
> move: maximising distance from the panel returned neon, and matching the
> ember's chroma returned emerald, because equal chroma is not equal loudness
> across hues.
>
> **AND THE CHART'S TAP HAD NEVER WORKED IN A BROWSER.** `locationX` is a React
> Native field and **react-native-web does not set it**, so the hit test computed
> `NaN` — and every guard written against it passed, because every comparison
> with NaN is false. The bounds check let it through, no wedge matched, nothing
> was selected. A native CDP mouse press, a CDP touch and two synthetic sequences
> carrying real coordinates all reported the same nothing before the search moved
> off the event and onto the arithmetic. The old ring read `locationX` too.
>
> The maths is `lib/utils/dialHit.ts` now — zero imports, so `check:ui` §11 feeds
> it the exact points rather than anyone reasoning about a screenshot — and
> `pressPoint` reads `locationX`, then `offsetX`, and returns **null** rather than
> falling back to zero, because zero is a real point (the top-left corner) and
> defaulting to it turns "no coordinates" into a press on whichever wedge reaches
> that corner.
>
> **`npm run sheet:dial` is what the numbers cannot do** — it loads the tab for
> real at four shapes (skewed, even, empty, and one with a wedge tapped), counts
> the surfaces the chart is actually made of, and asserts that the chosen wedge
> MOVED. That last one is why the tap bug was found at all: the first run
> reported "clicked" and two screenshots the eye could not tell apart.

> **AND THE TILT WAS THE WRONG HALF OF WHAT THE SOLID BOUGHT.** The reader again:
> *"I don't like how it looks further away on one end and closer on the other.
> This is not what I meant when I want a depth … right now, it looks sideways or
> like it's fallen over."*
>
> **PERSPECTIVE IS NOT THE ONLY KIND OF DEPTH, AND FOR A CHART OF SHARES IT IS THE
> WRONG ONE.** A tipped circle foreshortens its far side, so the same share covers
> about half the area at 12 o'clock that it covers at 6 — and a reader compares
> areas whether they mean to or not. It also gives an extruded wall to two wedges
> and none to the other four, so a third of the object is drawn in a vocabulary
> the rest of it does not have. **Every other struck thing in this app is seen
> STRAIGHT ON** — the pins, the badges, the certificates, the streak calendar —
> and they are solid because of how they are LIT, not where the camera is.
>
> So it is a rosette now: six chamfered pieces, parted by a groove of constant
> width, set around a spindle in a socket they cast a shadow into. **The palette
> needed no change at all** — `rim` and `wall` were the lid's edge and its wall,
> and they are the lit and shaded ends of the chamfer, which is the same two jobs.
>
> **THE TWO THINGS THAT COST A RENDER EACH ARE BOTH ABOUT WHAT A GRADIENT CAN AND
> CANNOT SAY.** A linear gradient lights a surface by WHERE IT IS. On the outer arc
> that is exact, because on a circle the outward normal is the position. On the two
> RADIAL CUTS it is exactly wrong: both walls of one groove are in the same place
> and face opposite ways, so they came out the same tone and every groove read as a
> black slot cut through the disc. They are flat quads lit from their own normals
> now (`LAMP`, stated as a number), and that one change is the difference between a
> pie with gaps in it and six pieces of metal. And the first chamfer was
> INVISIBLE on four of the six pieces, because `rim` was `mix(face, PAPER, 0.30)`
> — a value chosen when it was a STROKE, where 0.40 read as an outline drawn round
> the chart. A chamfer is not a stroke: it only reaches its lit value on the
> lamp's side, so it can afford far more, and at 0.30 it sat within a few percent
> of the face it was supposed to be turning off.
>
> One smaller trap, and it is the kind that survives review: `mix(PANEL_BASE,
> C.ink, …)` **lightens**. Ink is `#1A1A1A` and the panel is `#0E0E0E`, so the
> socket's shaded end shipped its first draft paler than the surface it was
> supposed to be cut into. Mix toward black when you mean darker.

> **AND THE TWO PAPER PANELS UNDER IT WENT THE OTHER WAY: LESS, NOT MORE.**
> *"who you read most and the thinkers by era … I don't want it to be really
> complicated … more clean and not as AI looking. Right now the who you read
> most looks pretty AI, especially the one, two, three, four, five circles and
> the designs on them. They look really bad."*
>
> **THE SAME READER ASKED FOR THOSE CIRCLES**, a fortnight earlier and in the
> opposite direction: *"the numbers on the left side … look very boring and not
> very premium looking … one two three four will have a more and more complex
> design as the numbers go up."* That was answered with a five-rung ladder of
> furniture — ticks, then arcs, then laurel sprigs, then rays and a second rim —
> every mark outside the disc, every rule from the badge case obeyed. It was
> still wrong, and both notes are true at once.
>
> **A NUMERAL AT LABEL SIZE IS A LABEL; A NUMERAL AT DISPLAY SIZE IS THE
> ORNAMENT.** At 14pt inside a 30px disc it needed decoration to stop being
> boring. At 25pt in a gutter of its own it is the largest thing in the row and
> needs nothing round it — which is how a printed ranking has always done it.
> `PlaceMark.tsx` is deleted; the rows are type, rules and hairlines.
>
> Three things measured rather than judged:
>
> - **Only FIRST place can take a metal.** On paper the three run gold 5.66:1,
>   bronze 8.36:1 and **silver 3.86:1** — under the 4.5 a word needs, which is
>   §19's "a tone fitted for METAL is invisible on PAPER" for the fourth time. A
>   podium with one unreadable place is not a podium, so the leader is gold and
>   the rest are ink.
> - **The leader's measure has to stop short.** At 100% a coloured line runs from
>   margin to margin under a name, which is an UNDERLINE — it stops saying
>   "furthest ahead" and says nothing. It takes the same 30% headroom the era
>   bars already use, and lands at 77%.
> - **A 9px chip with a 1.5px border beside a label is a CHECKBOX.** Five of them
>   unticked down the left of a panel was the single most dashboard-like thing on
>   the page. The row's colour is carried by its figure and its rule, both of
>   which were already coloured.
>
> `StruckBar` was left alone — it is right at the 9–10px Profile and the Pass
> draw it at, and it has three other callers; five of them on one panel is what
> read as a row of glossy capsules. These two use a flat 3–4px rule instead.
>
> **`npm run sheet:boards` is the instrument**, and its ratchet is the one that
> matters: **zero `<svg>` inside either panel**. Both are set rather than drawn
> now, so an svg back in a league row means the furniture has returned. It also
> holds that every row figure shares one right edge — the whole reason a bare
> numeral can carry a ranking without a disc round it — counter-tested by taking
> the width off the gutter and by removing the headroom, and both went red.


> The lesson deck's quote card (`cinematicKit.tsx`) is the one surface not yet
> converted — see §17; it is the highest-traffic file in the repo and was being
> refactored across ninety scenes at the time. It is a drop-in when that settles.

**Verified without Metro.** `tone.ts` is zero-import, so a contact sheet of every
era's plate — held, kept, featured, pressed — renders in plain Node against a
headless Chrome, reading the palette from `tone.plate()` and the size table out
of the component rather than retyping either. That is how both defects above were
found. Two CDP traps cost an hour: `Page.captureScreenshot` with
`captureBeyondViewport` + `clip` **hangs** in `--headless=new`, and attaching to
`/json/list[0]` rather than a tab made by `PUT /json/new` makes `Page.navigate` a
silent no-op — use `scripts/peek.mjs`'s pattern.

### Two of the six launch poses could not be read, and it is one rule

> *"the one where the stickman is laying down, supposedly reading a book. And
> then the other one … where it's sitting down and its arm is, like, crossed into
> his head. These two really do not look good."* — and, of the two that work,
> *"the one that the stickman is slowly walking or the one where it's sitting
> down and has a cup of coffee."*

**THE FIGURE IS SEVENTY PIXELS TALL HERE** — eight per cent of the panel — so
nothing survives but the SILHOUETTE. The rig already writes the rule down twice:
`seated()` says *"a fist near the body buries the whole forearm inside the torso
silhouette at this stroke weight and the figure loses an arm"*, and `sipStance`
says *"held OUT in front of the chin, not against it."* The coffee scene obeys
both, which is exactly why it is one of the two a reader likes.

- **READ** folded the legs flat along the ground and leaned the torso over them,
  so leg, torso and both arms merged into one horizontal mass. That is how a
  SEATED pose came to be described as lying down.
- **THINKER** put the fist under the jaw, which welds the forearm to the head
  disc and leaves a lozenge with a bump on it.

Both are rebuilt on `seated()` — the primitive the coffee scene already uses —
with the working limb kept clear and a motion big enough to see. The first
attempt gave the thinker a more distinctive SEAT (one knee up, the far arm
propped behind); rendered, that was worse, because a propping arm and splayed
legs widen the base into a low mound and **the base is what is on screen for most
of the cycle**. `seated()`'s own legs and resting hands are already tuned against
exactly that, so only the working arm moves — which is all `sipStance` changes
either.

> **AND NEITHER OF THEM MOVED, WHICH NO CHECK COULD SEE.** Everything
> `check:launch` asked was whether the motion was SMOOTH, and a pose that never
> changes passes all of it perfectly — a still image has no jumps and no wrap.
> Sampled across a whole period, `read` travelled 0.2 units (its page-turn window
> was 0.8s of a 5.6s cycle) and the thinker was damped to nothing on purpose.
>
> The range-of-motion check that closes that hole found **a third one nobody had
> reported**: `stargazer` moved not one of its four tracked points by a single
> unit — all its life was in `postureLive`'s settle, so it was, in the terms that
> matter, a photograph. Its free hand drifts toward the sky it is looking at now.

> **AND A SECOND CHECK WAS BUILT, FAILED THREE WAYS, AND DELETED.** The
> silhouette rule looks measurable and is not. "A hand gets clear of the torso
> axis" is satisfied by the RESTING hand, which `seated()` parks on the knee, so
> a gesture folding back under the jaw passed. Re-aimed at the head, same defect,
> same reason. Following the hand that actually GESTURES finally discriminated —
> and immediately flagged `lookout`, whose whole gesture is raising a hand to
> SHADE THE EYES, and which reads perfectly. **A metric that disagrees with an
> example whose answer you already know is a broken metric, not a finding**, so
> it is not in the file; only the reasoning is. The silhouette rule is held by
> `node scripts/sheet-launch.mjs <scene>`, which draws the figure at the size it
> ships at and is the only instrument that ever saw the fault.

### The first four seconds, and the two cuts hiding in them

> *"it still has that glitchy start … if there are any other glitches or not
> smooth things in this beggining start screen, fix them."*

Two hard cuts, both at the seams where one thing hands over to another, and
neither of them visible in a browser — the first because the browser has no
native splash, the second because it is a status bar.

- **The app's first frame was a light-to-dark flash.** `expo-splash-screen`
  paints `#E4E4DF` and `hideAsync()` does not fade; `LaunchScreen`'s root painted
  `PALETTES[scene].steps[0]`, and all six of those are near-black. Measured, the
  mildest of the six is a **10.7:1 luminance step** on the very first frame of the
  app, followed by the scene fading up out of it. The ground starts on
  `SPLASH_BG` now and deepens into the scene on the same curve the art arrives
  on. The splash colour is a COMPILED resource (§18) and this side is not, which
  is exactly why the constant lives in `launchArt.ts` and `check-launch` compares
  the two — a pair in two files where only one half can be changed over the air
  is a pair that drifts.
- **The status bar crossed on the UNMOUNT rather than on the picture.**
  `LaunchScreen` is the only thing in the app that sets `barStyle`, and it sets it
  light for the near-black illustration. It then held light through the whole
  520ms dissolve onto a cream welcome page — white icons on cream, which is to say
  no icons — and snapped back when the component finally left the tree. A clock
  and a battery blinking out and back at the moment of the hand-off is the other
  half of what a reader means by a glitchy start. It flips at `screenOpacity < 0.5`
  now, so the icons change on the frame the ground under them does.

### And the third thing in those four seconds was the app building itself

> *"the first screen stutter … I believe it has been diagnosed, but I don't
> think it has been fixed yet."*

They were right on both counts. The diagnosis was in the repo, in
`app/(app)/_layout.tsx`, written as a REASON TO DO IT:

> *"There is already a launch animation sitting over the app for a couple of
> seconds while auth and hydration finish, and it runs on the UI thread, so JS
> mounting screens underneath does not stutter it."*

That is what `lazy: false` on the tab navigator was for, and the goal was right
— tabs lazy-mount, so the first visit to each one used to pay for its whole
tree just as the reader arrived. The sentence justifying WHERE the cost went is
what was wrong. Measured against the real app in a browser, same URL, two runs
each, one variable:

| | `lazy: false` | staggered |
|---|---|---|
| stalls while the launch screen is up | 12 · 17 | **2 · 2** |
| frames lost in that window | 837ms · 1101ms | **175ms · 162ms** |
| 99th-percentile frame gap | 78ms · 92ms | **29ms · 27ms** |
| the percentage opens | 0% held 392ms, **jumps to 19** | 0% held 229ms, then 11 |

**Two things put those stalls on the animation, and only one of them is
arguable.** A mount is not only JS: the views are created and measured on the UI
thread, which is the thread Reanimated animates on, so five screens being built
is not something an animation can be insulated from. And the percentage IS JS —
React state, set from a worklet through `runOnJS` — so it queues behind the mount
on every platform there is. That second one is the half a reader sees, and it is
why this reads as a stutter rather than as a slow boot: the count sticks on zero
and then jumps twenty.

So the cost is paid AFTERWARDS, one screen at a time, gated on `launchDone` and
yielding to `InteractionManager` at every step. `lazy` is read per screen on
every render — `BottomTabView` checks the descriptor each pass, not a mount-time
snapshot — so turning it off later is what builds that tab, and all five are
still built without ever being visited.

**`SETTLE_MS` and the launch screen's outro are a pair in two files, and
`check:ui` §10 re-derives both.** `launchDone` fires when the screen begins to
LIFT, and its outro runs on for 280 + 240 + 520 = 1040ms after that — so the
first draft's 900 warmed a tab 140ms before the last frame of the dissolve, which
is the same stall on a different animation and would look wrong in neither file.
The check reads the three durations out of `LaunchScreen.tsx` rather than
restating them, the same rule `check:launch` applies to `SPLASH_BG`, and it is
counter-tested from both sides.

> **The instrument mattered more than the fix, and its first two numbers were
> useless.** Total frames lost across a boot swings by seconds between runs on a
> dev server, because most of it is bundle delivery — comparing totals compares
> Metro, not the app. What is comparable is the window the reader is actually
> watching an animation in, so the probe marks when the launch screen appears and
> when it goes, and counts only the stalls between. That number was stable to
> within 13ms across repeated runs and is what the table above reports.
>
> It also cleared two suspects. The WELCOME intro plays with **zero** frame gaps
> over 50ms across its whole 25 seconds, and the landing path — same boot, no tab
> shell — loses one 48ms frame. Neither is the stutter; both would have been
> plausible places to go looking.


### And then it was clunky, and every word of that was measurable

> *"it kinda seems a little clunky and not very smooth … especially at the very
> end when the stick man kinda runs off. hit bronze off in a kinda weird way,
> not in a very cool, funny animated way."*

`hostAtRig` is a pure function of `t` built out of the lesson rig, so the whole
performance can be stepped at 60fps in plain Node — no Metro, no browser, the
same property that lets `check:smooth` replay 130 lessons. `npm run check:host`
is that replay, and it found four things, none of them visible in the source.

**HALF THE EXIT HAPPENED OFF SCREEN.** The stage is 400 wide and `X_AWAY` was
560, so of the 244 units he travelled, **more than half were past the edge** —
and the whole distance still had to fit in `T_BOLT`. That is what forced 530
stage units a second against the march's 89: six times faster leaving than
arriving, with the ankle moving 23 units between frames. Not a sprint, a smear.
470 clears the stage by a figure-width and hands the time back to the part a
reader can watch.

**AND THE LAUNCH WAS A TELEPORT.** `x` advanced linearly from the frame the bolt
began, so the body went from a dead stop to full speed in one frame — 19,096
u/s². It accelerates now, on a curve whose first coefficient is *solved* rather
than chosen: `f(u) = c·u + (1−c)·u²` with `c` set so `f′(0)` reproduces the
wind-up's own cycle rate. The legs never change speed at the seam; the body
gathers pace under them.

**THE EXIT BROKE THE CONTRACT `strideStance` STATES ABOUT ITSELF** — *"the stride
follows the body"*. It handed the stride `carried` (0.35→1) of a journey while
putting the body at `tr` (0→1) of the same one: two different fractions, so a
foot the pose called PLANTED slid **10.9 units in a frame**. The fix is to solve
for the journey that makes them agree — `lerp(X_LAUNCH, X_AWAY, WIND_TR) ===
X_MARK` — so the wind-up's 0.35 is spent exactly where he stands and the bolt's
0.65 covers the real distance. Derived, so moving the mark cannot put it back.

**AND HE STOPPED DEAD FOR 0.36s, WHICH IS THE ONE NOTHING ELSE COULD SEE.** `tr`
is clamped, so through `T_STOP` `strideStance` returns one fixed arrival pose:
**0.00 units of movement per frame for twenty-two frames**, sitting between the
walk and the turn. Perfect stillness is not a discontinuity — it is the absence
of one — so every instrument in the suite that hunts for jumps was blind to it by
construction. `withSpeechLife`, the overlay the talking phase already uses, at a
third strength.

| | before | after |
|---|---|---|
| worst on-screen frame | 23.4u | 12.9u |
| bolt peak speed | 530 u/s | 258 u/s |
| launch acceleration | 19,096 u/s² | 3,752 u/s² |
| planted-foot slide | 10.90u | 2.60u |
| the settle | 0.00u — frozen | 0.44u |
| of the bolt, on screen | 47% | 84% |

Every figure is a high-water mark in `check:host`, counter-tested by putting each
of the five defects back.

> **AND `rig.ts` HAS A WHOLE DEAD GESTURE SYSTEM.** `handTargets`, `GP` and
> `GESTURES` are a complete hand-target solver that nothing imports — left behind
> when the host was rebuilt onto the lesson rig, which drives gestures by move
> CODE through `hostFigure`'s own `GESTURE` map instead. A note added here a day
> earlier reasoned about `GP.point`'s reach to explain why a gesture did not
> read; that reasoning was about code the screen does not run. The gesture change
> itself was real — `point` and `shrug` are move codes 183 and 178 — but check
> which of two systems is live before explaining a render with one of them.

### And then the words themselves were the problem

> *"the words were very AI sounding and not very good ... this is the first thing
> a user sees."*

They were, and the fault has a shape worth recognising: **the old script
EXPLAINED THE PRODUCT.** "Philosophy has six branches." "Three hundred and
twenty-two thinkers." "A little every day, and it adds up." "Ready to think
differently?" — a feature, a spec, a platitude and an advert. It also opened by
telling the reader what they think ("Think philosophy is boring, or too
difficult?"), which is the one thing a stranger cannot know.

**THE RESEARCH IS UNANIMOUS AND SAYS THE OPPOSITE OF ALL OF IT.** Loewenstein's
information-gap account — the effect a first screen is trying to produce — is
that a gap motivates in proportion to how SPECIFIC and REACHABLE it is; a stated
fact opens nothing, while "Is it ever right to lie?" is a gap the reader can feel
the edges of and already half-answers. Activation research on this category
lands in the same place from the other end: onboarding that works is not an
explanation, it is the product happening — Duolingo's is a lesson before an
account, and the measure is whether somebody thinks *"I have started"*, not
whether they absorbed a feature list.

So the demo is the spine now. The opener makes a claim about the WORLD and
leaves a gap; the answer is framed as an argument you are having rather than a
fact you are given ("Then Kant argues back"); the branches arrive as where that
one question LIVES; the count arrives as company; and the close hands over
instead of asking permission. "Ready to think differently?" is a slogan.
"Your turn." is a door.

> **AND THE BOARD WAS STILL SAYING THE PLATITUDE.** GrowthChart's own headline
> read "It compounds." — the same register the spoken line had just been
> rewritten to lose, and with the host now saying "One lesson a day" over the
> board's own ONE A DAY kicker he was echoing it twice. It names the x-axis in
> human terms now ("Two months of that."), which is what the eight bars are.

> **A LINE IS FOUR CONSTRAINTS AT ONCE, AND THE OFFLINE MODEL LIED ABOUT ONE.**
> Two rows of bubble, 0.9s standing complete, no tail under five characters, no
> faster than 230ms a word. Three are arithmetic, so candidates were scored in
> plain Node — and the wrap was scored against `BUB.maxTextW`, which is 322 and
> is NOT where the browser breaks. Two lines the model called two rows came back
> three. Bracketed from the real render's own breaks the true budget is 288, and
> **an offline model is calibrated against the instrument it stands in for, not
> against the constant it reads.**

> **THE GESTURE WAS PICKED OFF A RENDER, WHICH IS streakMood's RULE ARRIVING
> HERE.** `point` was the obvious choice for "Everyone has opinions" — he points
> at the reader, which is the joke — and shot at the beat's own peak it looked
> like no gesture at all. (The first explanation written here blamed `GP.point`'s
> reach; `GP` is dead code, see the section above. The move actually played is
> library code 183.) `shrug` throws both hands wide and low, is symmetric, and survives being
> drawn 100px tall. `emphasize` had been declared and never used for the life of
> the file — the same defect `check:quips` holds over the herald's poses — and it
> is the offering pose, so "Here." is the offer.
>
> A stronger gesture blend (0.6 → 0.88) was tried and REVERTED: frame capture on
> this screen drifts a second between runs because the launch animation varies,
> so it could not be confirmed, and an unverified change to a tuned animation
> constant is not worth keeping.

### The words were too fast, and the line broke in the wrong place

> *"slow down the words being spoken a little bit … when it shows different
> philosophers names, the simine de beuvior, his last name goes too far under it,
> that doesnt look good."*

Both measured in a browser rather than argued about, which is the only way either
one is a number: the words were arriving every **190–210ms** and are now at
**259–284ms**.

**The surprise is what that cost: +0.5 seconds over the whole intro.** Per-word
reveal went 0.17 → 0.24, and most beats already had enough slot to pay for it —
only four needed widening. The floor that protects the other end is
`check-thinkers`, which re-derives how long every line stands COMPLETE before it
dissolves; the worst line went **0.96s → 1.13s** in the same change. Slower words
and a longer read, on a timeline half a second longer.

**The line break was not a wrap bug.** 322 units of bubble at 27px Playfair Bold
cannot hold four names when one of them is three words, so
"Socrates. Kant. Nietzsche. Simone de Beauvoir." broke as

    Socrates. Kant.  /  Nietzsche. Simone de  /  Beauvoir.

— a third line holding one word, and that word the surname of the only woman on
the board. The line says what the BOARD says now: `ThinkersChart` draws BEAUVOIR
(it has to — the full form overruns 300 units) and the host was saying something
else over the top of it, which is rule A1 read backwards. Naming all four by
surname is also the only reading in which the four are treated alike.

The sweep found **a second one nobody had reported**: "A little every day. It adds
up." broke as "…It adds / up.", cutting a phrasal verb in half. A comma gives the
wrap somewhere sensible to fall.

> **`npm run check:intro` is the harness, and the file already had a name.**
> `MapChart.tsx` has pointed at `scripts/check-intro.mjs` since the branch names
> were fixed, and no such file existed — a citation to a check nobody could run.
> It exists now, and it holds seven things: two rows and never three, no line
> ending on a stranded scrap, nothing lit clipped by the bubble, no beat coming up
> wordless, no two names on a board touching, and a **floor under the reveal
> pace** — because a reader has now asked about that pace twice, in opposite
> directions, and the second answer needs a ratchet.
>
> It has to be a browser: where a line breaks depends on the real widths of real
> glyphs, and `MapChart` already records what estimating those costs.
>
> **Two of its rules were wrong before they were right, and both in the same
> direction — a checker that cannot tell the design from the defect.** Testing
> every word for clipping reported all eleven lines as broken, because the bubble
> hides the line he has not reached YET on purpose; only a lit word can be said to
> be cut off. And "boxes that overlap vertically must not overlap horizontally"
> reported the growth board's kicker and its headline as 103px through one another
> — an SVG text's rect is its em box, so two labels stacked a comfortable 19px
> apart still graze. Compare baselines, not edges. The tightest real pair on any
> board is DESCARTES/NIETZSCHE at **9.4px**.


**The welcome end card** (`assets/images/welcome/sky.jpg`) is the one background
that is a *drawing* rather than a photograph, and it follows the same rule for the
same reason: the ink hatching runs to near-black in places, so the wordmark's
contrast is set by the scrim, not by the crop. Its scrim is shaped rather than flat
— 72% through the band the type occupies (y 0.40–0.62) and 22% elsewhere, so the sky
is plainly visible and the type still measures **8.7:1**. A flat 90% wash was tried
first and erased the drawing, which defeated the point of having it.

> **It used to reach new users only in a NEW BINARY, and that is now fixed.**
> `hasSeenWelcome` persists and gates this screen to one showing per install, and a
> fresh install runs the *embedded* bundle on its first launch — so whatever a
> brand-new reader saw first was frozen at build time, and the flag was already set
> by the time an OTA landed. Build 19 shipped a welcome that was rewritten the next
> day: every new install played the OLD intro and then the NEW one on its second
> launch.
>
> `lib/updates/firstRun.ts` closes it. On a first run from the embedded bundle it
> takes any waiting update and restarts into it BEFORE the first-run experience is
> decided — bounded by `BUDGET_MS`, hidden behind the launch animation, and with a
> loop guard for the rollback case. **It shipped in build 20**, so from that binary
> on the welcome screen is updatable over the air like anything else. It had to be
> in a binary once; it never has to be again.

---

## 20. Forced Update Gate

`components/shared/UpdateGate.tsx`, mounted last in the root layout so it covers
everything. `MIN_VERSION_CODE` is a constant in that file.

It compares against **`Application.nativeBuildVersion`** — the versionCode
compiled into the APK — and *not* the version in `app.json`, because that one
travels with OTA updates: an old binary carrying new JS would report the new
number and walk straight past the gate.

**It fails open, deliberately.** `MIN_VERSION_CODE` is **21**, matching the current
binary. On a current Android binary `nativeBuildVersion` reads `"21"`, but `parseInt`
would turn an unexpected `"1.0.0"` into `1`, and against that minimum that
locks out *every user on earth including up-to-date ones*, with no way back. So
only whole digits count; anything else, and anything null (web, Expo Go, dev
client), is unknown — and unknown never blocks. iOS is skipped entirely.

**Raising `MIN_VERSION_CODE` has two conditions:** the target release must
already be live and fully rolled out, and the update must be published to **every
runtime still in the wild** (§18). A gate published only to the current runtime
reaches exactly the people who do not need it.

**The gate LAGS the build on purpose, and 21 is the worked example.** Build 21
shipped with this constant still reading 20, because a gate is JavaScript: raising
it only reaches a binary through an update published to THAT binary's runtime. Set
it to 21 inside the build that carries 21 and you wall nobody who is not already
on 21 — you have merely armed a wall aimed at a release that may still be rolling
out, and if the rollout stalls it points at a version nobody can download.

So the sequence is always: ship the build → let it reach 100% → raise the constant
→ publish to **both** runtimes, oldest first. The raise is the only change in this
file that can lock a user out with no way back, and it is the one worth being
slowest about. While it is pending, §18's table has two live rows, not one.

**21 ran that sequence in full on 2026-08-19** and it is the worked example: built
on the 19th with the gate at 20, left alone through review and rollout, raised to
21 only once Play reported 100%, then published to build 20's runtime before 21's.

---

## 21. Verifying Without a Device

The phone is usually not attached, so most verification happens in a browser
against the real app — which is why the web stubs in §2 matter.

```
npx expo start --web --port <free port> --clear
```

Then warm the bundle with a direct request to
`http://localhost:<port>/index.bundle?platform=web&dev=true&...` before pointing a
browser at it; the first transform can take longer than a navigation timeout.

- **Authenticated screens are not reachable by URL.** Add a throwaway
  `app/preview*.tsx` that seeds `userDataStore` and renders the screen directly.
  **Delete it before committing** — any file in `app/` is a real route.
  **`npm run check:routes` now enforces that, and it runs FIRST in `npm run check`,
  ahead of even the typecheck.** It used to be a rule you had to remember, which is
  the same shape of mistake as a budget nobody executes (§11): an orphan was found
  on disk by hand twice in one afternoon, both times with a build minutes away, and
  the scaffolding is not inert — `previewcover.tsx` forces `_hasHydrated` and
  `launchDone`, so anyone reaching it gets a store lying about its own state.
- **React Native Web needs a real `click` event**; synthetic `pointerdown` +
  `pointerup` alone do not trigger a `Pressable`.
- **Measure, don't eyeball.** Sampling geometry every frame catches what
  screenshots miss. Beware the opposite error too: an animation once looked like
  it "snapped" purely because the sampler was starved — slow the animation to ~3s
  and re-measure before believing it.
- A stale Metro server will serve a bundle that never boots. Restart with
  `--clear` before concluding the app is broken.
- **Generated art can be looked at WITHOUT a device or a browser.**
  `scripts/lib/rasterpath.mjs` turns SVG path data into pixels in plain Node —
  flatten, scanline-fill by non-zero winding, anti-alias — and
  `scripts/sheet-scene.mjs` uses it to composite the branch road exactly as the
  phone does. This is the fastest loop in the repo for anything shape-shaped, and
  it is how the scenery went from "five grey stripes" to something worth shipping
  in five rounds. Two rules learned in those five: **draw the FIGURE into the
  sheet too** (a backdrop that swallows an ink stickman is invisible otherwise),
  and no `A` (arc) commands anywhere — the rasteriser, and `sceneArt`'s own band
  measurement, both assume every command's arguments are (x, y) pairs.
- **A contact sheet cannot catch a module-load or React fault.** It renders path
  strings; it never imports the component. The `airborne` dead zone (§17) passed
  tsc, three validators and five contact sheets, and took one browser load to
  find. When a real screen changes, load the real screen.
- `jimp-compact` is available (via `@expo/image-utils`) for offline image work —
  resizing, desaturating, compositing icon layers, checking transparency.
- **Five harnesses step the real lessons in a browser**, because some questions
  cannot be answered by arithmetic at all. **They share one lock**
  (`scripts/lib/previewroute.mjs`) because they also share a Metro, a Chrome and —
  fatally — a filename: `check-frame` and `check-spoiler` both write
  `app/previewframe.tsx`, and for a while only `measure-must` took a lock at all.
  Two together means one deletes the other's route mid-sweep and the victim reports
  lesson after lesson as NEVER RENDERED A STAGE while every symptom points at the
  app. The lock is per ROUTE, not per repo, so two harnesses on two different
  routes still run at once; it is taken with the `wx` flag so two starting in the
  same millisecond cannot both win; and **a dead owner is not an owner** — stopping
  a background task does not always kill the node process under it, so a lock whose
  pid has gone is taken over rather than obeyed, and the orphaned route it left
  behind is deleted on the way past. `npm run check:intro` plays the WELCOME
  screen and measures where its lines break, how fast its words arrive and
  whether any two names on a board touch (8856/9396 — see §19).
  `npm run check:frame` measures every
  element a scene draws against the stage's own crop and reports what the camera
  is cutting in half; `npm run measure:must` records what each beat has on stage
  and writes `components/lesson/cinematic/mustBoxes.ts`, which is what stops the
  camera cropping it (H60c); `npm run check:spoiler` reads the whole visible page
  at every graded beat BEFORE answering it and fails if any of the reveal is
  already legible (group O). **`npm run check:readable` is the newest, and it is
  the one that answers "is this box blank"** — it measures every word a scene
  draws at the size, the opacity and the clipping it actually lands with, and its
  second stage is a SCREENSHOT: a suspect is only a finding once the pixels agree.
  That stage exists because reading a word's ancestors for a background colour
  cannot see a sibling painted underneath, and a two-state label is normally built
  exactly that way — a first pass called 205 words faint and the screen disagreed
  about most of them. It runs on its own ports (8861/9391) so it never contends
  with the other four. All three want Metro on 8847 and a headless Chrome
  on 9382 — the header of each script has the exact commands.
  **`npm run check:blank` is the sixth, and it asks the OTHER blank question**
  (S11, §17): `check:readable` measures a word that is drawn, this measures a box
  that has no word in it — how much of every tap target's ring anything actually
  paints, per beat, counted on a 24×24 grid rather than as a union box. It has to
  render for the same reason `check:spoiler` does: whether a ring is empty depends
  on what the whole scene draws underneath it, and the source cannot say. Its own
  ports are 8869/9399.

  **`check:spoiler` exists because reading the source said the app was clean and
  the reader could see that it was not.** Every shared component gates its reveal
  on `answered` — `Choices`, `InteractPanel`, `Reveal`, `ChoiceCards`,
  `DragScale`, both bespoke players — and so does every scene's own
  `wrong(id)` helper. A grep therefore proves nothing here; only the rendered
  page does.

  **A SECOND SESSION IS NOT COVERED BY THE LOCK, AND IT LOOKS LIKE A BUG IN THE
  APP.** The lock stops two harnesses in one repo colliding. It does nothing about
  a second Claude session driving its own Metro and its own Chrome against the
  same working tree — and that session writes `app/previewframe.tsx` too, and
  deletes it on the way out. Mid-run, a page that had been rendering lessons
  started answering **"This screen doesn't exist"**, which reads exactly like a
  broken route table and is really somebody else's cleanup. The escape is already
  built: `MUST_ROUTE=previewmust` (and the same variable on the other harnesses)
  gives a run its own file and its own URL. Use it whenever another session is
  live — and note that three Metro instances on one machine take a page load from
  ~13s to ~160s, so a sweep that used to take forty minutes will not finish.

  **AND A SLOW MACHINE REPORTS ITSELF AS THIRTY BROKEN LESSONS.** `measure-must`
  waited a fixed 110s for the stage on a lane's first lesson and 30s after that,
  which is generous when a page loads in 13s and useless when it loads in 180 —
  and what it prints when the wait runs out is `NEVER RENDERED A STAGE`, per
  lesson, for all of them. Thirty of those in a column is indistinguishable from
  thirty broken scenes, and the lessons it named had been watched playing in a
  browser minutes earlier. The patience figures are `STAGE_TRIES_FIRST` and
  `STAGE_TRIES` now, and `LANES` was already there. **Raise them before concluding
  anything about the scenes** — and check a single page by hand first, because
  that is the measurement that tells you which kind of failure you have.

  It also puts a question against the rule directly below. `app/previewmust.tsx`
  was created with Metro ALREADY UP and registered without a restart, so the route
  context does hot-update at least in this version — which means the original
  "doesn't exist" may have been this same deletion rather than an ordering
  problem. Writing the route first is still free and still the advice; just do not
  conclude from a missing screen that you started Metro in the wrong order until
  you have checked the file is still on disk.

  **And it needs its preview route to exist BEFORE Metro starts.** Expo Router
  builds its route table at bundle time, so `app/previewframe.tsx` written after
  the dev server is up serves "This screen doesn't exist" — which renders no
  buttons, so every lesson reports "could not be answered" and the sweep finishes
  GREEN having measured nothing. Its first run did exactly that for all 130.
  `SPOILER_KEEP=1` leaves the route in place between runs while iterating.

  **Three things they got wrong first, all worth knowing before writing the
  fourth harness of this kind.** Its taps did not advance the beat at all, so the
  first sweep was one beat read nine times and reported as eight clean lessons —
  CDP's `Input.dispatchMouseEvent` does not drive a React Native Web Pressable,
  only a synthetic `click` does. It then judged "did the beat change" from a hash
  of the page text, which cannot tell a dead tap from two beats that read alike;
  the progress bar carries `nativeID="beat-progress"` now and *is* the beat index.
  And it could not answer a question, so every lesson stopped at its first graded
  beat — scene answers are `Target`s (they set an accessibility role) but deck
  choices are bare `Pressable`s, which React Native Web gives a `tabindex` and no
  role. **Selecting on `[role="button"]` alone finds half the buttons in this app.**

  **A fourth, from the drag lessons, and it is the same shape a third time.** A
  `drag` question (§17) has no button anywhere on the beat, so both answer snippets
  found nothing and the first sweep of the twelve measured **6 or 7 beats of 9 and
  reported them as measured** — a short sweep is indistinguishable from a clean one
  unless something counts. Two things fixed it: the rail carries `nativeID="drag-strip"`
  so the harness never has to guess which element to drive, and the answer is a
  POINTER sequence, because react-native-gesture-handler listens on pointer events
  and a `MouseEvent` does nothing to it however carefully aimed. It also needs
  several `pointermove`s rather than one jump — `onUpdate` integrates
  `translationX`, and a single leap from the press point does not clear the pan
  recogniser's activation check.

  The rule underneath all four: **when a lesson gains a new way to be answered, the
  harness gains one too, in the same commit.** Otherwise the next sweep quietly
  measures less and says nothing.

  **AND A MEASUREMENT IS ONLY AS GOOD AS THE PROBE THAT TOOK IT — WHICH NOTHING
  WAS WATCHING.** `measure-must` records what each beat has on stage and stamps it
  with a hash, and `validate-cinematic` re-derives that hash so a scene edited
  without re-measuring is an error rather than a silent crop. The stamp covered the
  scene and the script. It did not cover the PROBE.

  So when the probe was improved, every stamp stayed green and every stored
  measurement stayed stale. An older collector had recorded roughly **one word a
  beat**; the tour generator (§17, group K) drops a station only when it can see a
  word being sliced, so with those lists it saw nothing to protect and pushed to
  **1.68×** straight over labels it had no record of. `ethics-ethics-13` drew its
  five-name rail with COWARD seventeen pixels off the left of the screen and
  RECKLESS forty-two off the right, on three consecutive beats, for as long as the
  file has existed. Forty-nine cut words across twenty-four lessons, and every
  check in the suite green.

  The fix is one line and the lesson is general: **the apparatus goes in the hash.**
  `scripts/lib/muststamp.mjs` hashes the scene, the script AND the probe, and the
  probe lives in `scripts/lib/mustprobe.mjs` so the harness that runs it and the
  validator that judges it read the same text rather than two copies of it. Change
  the probe and all 186 lessons are stale at once, which is the truth.

  Rot in a scene announces itself, because a scene is what everyone is looking at.
  Rot in the thing doing the measuring does not — it makes the reports *quieter*,
  which reads exactly like progress. **Whenever a checker gets better at seeing,
  ask what its stored answers were derived from, and whether anything invalidates
  them.**

  **`check:readable` answers two more questions now, and both came from the
  reader.** *"there are plenty of words that arent correctly in their boxes, and
  words get covered by other things."* **SPILL** is a word whose own scroll box
  overflows — `scrollWidth > clientWidth`, or a `numberOfLines` clamp truncating —
  which KEEP could never see, because KEEP measures a word against what is
  CLIPPING it and that is almost always the stage crop rather than the little
  plate the word is actually too big for. **UNDER** is anything opaque painted ON
  TOP of a word: `groundAt` scans DOWNWARD from the glyph for its background, so
  everything above it was skipped by construction, and a caption with a panel
  across it measured a perfect contrast against a ground it no longer reached.
  Across the corpus: 57 SPILL and 94 UNDER on the first sweep.

  **UNDER is confirmed against the PIXELS, and that is what makes it usable.** The
  paint stack can say something opaque is above a word; it cannot say the word is
  hidden, and this codebase has at least two shapes where it is not — `political-7`
  hangs a charter that TEARS by drawing the same sheet in two clipped windows, so
  every word across the seam sits under its own twin, and a two-state label is
  built the same way on purpose. Shooting each suspect's rectangle and measuring
  its real contrast took UNDER from **94 words in 17 lessons to 6 in 2**. Same
  instrument, same argument, one more class — see FAINT above.

  **AND UNDER HAD BEEN STRUCTURALLY BLIND SINCE IT WAS WRITTEN, WHICH IS WHY THE
  READER HAD TO REPORT IT.** It found what covers a word with `elementsFromPoint`,
  and **hit-testing skips anything with `pointer-events: none`** — which is nearly
  every decorative element in these scenes. It had been reporting zero honestly and
  seeing almost nothing. It reads real DOM geometry in one paint-order pass now,
  and splits the answer in two, because the two want different fixes: **UNDER** is
  covered at the CENTRE (the word is buried — move the word) and **STRIKE** is
  covered only at an EDGE (the word is sliced or ruled through — break the thing
  around it). `political19` had both on one beat.

  **Its first corpus run then returned 316 findings across 77 lessons, and that is
  the same failure upside down.** A list naming 42% of the corpus is a broken
  instrument with a confident tone, and it costs a day before anybody says so. Four
  false-positive classes, the last two structural and both worth expecting again:
  a cross-fading caption still in the DOM at opacity 0 (gate WORDS on opacity, not
  just painted boxes); two wrapped lines of one paragraph grazing; **an unfilled
  bordered box counted as a solid slab**, through `ea * ((c && c.a) || 1)` — a
  transparent background parses to alpha 0, which is falsy, so `|| 1` promoted it
  to fully opaque; and **`getBoundingClientRect()` does not know about
  `overflow: hidden`**, so the floor every scene now lays down reported a rect
  running out into the deck, and a rung parked outside its own scrolling window
  reported one lying across a label. Intersect every box with EVERY clipping
  ancestor. After all four: 0 on the sample, and the political19 defect still
  reproduces 6-to-0 when put back.

  **AND THE CORPUS SWEEP FOUND ITS BEST DEFECT IN THE PLACE NOBODY LOOKS: A
  MEASUREMENT THAT CAME BACK EMPTY.** `ethics13` puts five named plates on a rail
  — COWARD · TIMID · COURAGE · RASH · RECKLESS — and every one of them rendered
  **zero units wide**. `Target` puts its children in a wrapper carrying the answer
  reaction, and that wrapper is an ordinary flex child: `alignItems` on the hit box
  made it shrink to its content, and its content is a plate sized with
  `left: 0, right: 0`, which against a collapsed parent is nothing.
  
  The second failure is the one worth carrying. `mustprobe` drops anything under
  1.5 units, so those five words were never recorded as WORDS on any beat —
  **eight beats, one text item, "HOW MUCH FEAR?"** — and `make-tours` refuses a
  station only when it can SEE a word being sliced. It saw none, framed a 214-wide
  strip of the rail at the 1.72× ceiling, and pushed COWARD **73% off the left of
  the screen**, while `check:tour` printed "0 stations cut a word in half"
  throughout. **A layout fault made a camera fault invisible to the check that
  exists to prevent it**, and neither check was wrong about what it measured.
  
  Deleting one line fixed both: the labels measure 68–79px, the probe records them,
  and the next `make-tours` drops that station of its own accord. The camera fault
  needed no separate fix. `check:shape` holds the layout half (S10), and the
  general form is the third time this file has recorded it — **when a checker's
  input comes from another instrument, ask what happens when that instrument
  returns nothing.** `muststamp` already invalidates the table when the probe
  CHANGES; nothing was watching for the probe finding nothing to record.
  
  Across the corpus that pass took **CUT from 19 words in 5 lessons to zero**.

  **And the vertical threshold has to be loose while the horizontal one is tight.**
  Content wider than its box is always a cut letter, so 2px of slack. Content
  TALLER is not: every scene sets a lineHeight tighter than its face's natural
  one, and that overflows by a pixel or three on perfectly ordinary type. Half a
  line — 6px — is the smallest overflow that can be a lost line.

  `npm run check:space` is the other half of the same finding: the tour generator
  deliberately ignores a word outside the band, on the correct reasoning that no
  shot could ever have held it — which left nobody at all holding it (D36). It
  reads the measurements already on disk, so it costs milliseconds and no browser.

  **A HARNESS THAT MEASURES NOTHING MUST NOT LOOK CLEAN, AND THIS ONE DID.**
  `check-readable` treated a probe that THREW exactly like a lesson that had
  finished — `if (!a) break`. So when one variable in the probe shadowed another
  (a per-edge `over` over the colour-compositing helper of the same name), the page
  threw on the first word of the first beat and all 186 lessons came back "ONLY 1
  BEAT REACHED", zero findings, exit 0. It reads as a clean sweep. It is the same
  failure §21 already records three times over, arriving by a fourth route.
  A dead probe is a finding now: the lesson is marked, the summary says so, and the
  run exits non-zero. `READ_DEBUG=1` prints what the page actually threw.

  **A RULE THAT REMOVES EVIDENCE CAN BREAK A RULE THAT COUNTS IT.** The same file
  had a guard that dropped a word outright when the paint stack put another word
  above it — right for the two-state label it was written for, and quietly fatal
  next door. `political-7` hangs a charter that TEARS by drawing the same sheet in
  two clipped windows, so every word across the seam is half in each and whole only
  when the two halves are added together; dropping one half made the sum 0.5 and
  twelve intact words read as sliced. It is gone, replaced by a rule that compares
  the two copies' CONTRAST instead of deleting one of them.

  **And a defect is a defect a second later AT THE SAME VALUE.** Two reads are
  taken per beat and only what survives both is a finding — but `settle` waits for
  the camera, and a scene's own transitions outlast it, so a label fading out over
  a four-second walk is still fading at both reads and looks like a label resting
  at 0.58. The two readings are compared by value now, not just by name.

  **That rule is now a shared file rather than four copies of a snippet.** Adding
  `lever`, `plot`, `split` and `field` (§17) meant four more ways to answer arriving
  at once, and four harnesses that each knew how to click and drag. They all import
  `scripts/lib/answerctl.mjs` now: one `CONTROL_IDS` list, one `ANSWER_CONTROL`
  expression that finds whichever control is on the beat by its `nativeID` and works
  it with a pointer sequence. A fifth control is one line there, and every harness
  gets it — which is the only version of this rule that survives being forgotten.

  **A fifth harness, and it is not about lessons.** `npm run sheet:pass` loads the
  Scholar's Pass screens (§14) — the tab, the offer, the daily limit and the three
  locked readings, eight in all — for real and reports whether React actually
  mounted, whether anything sticks out past the viewport, and whether any line of
  text is cut off inside its own box — then writes a PNG of each so they can be
  looked at. Its own two lessons, both of which cost a run:
  **release the launch gate** (`useUIStore.setState({ launchDone: true })`, as
  `previewcover` does) or the page photographs blank with no error anywhere; and
  **poll for the mount rather than sleeping at it** — a fixed wait returned four
  screens mounted and three "module or render fault" on one run and the reverse on
  the next, which reads exactly like an intermittent bug and is not one.
  Its route source is `scripts/lib/previewpass.txt` rather than a template literal
  in the script, so JSX braces need no escaping. Ports 8853/9393.

### And one class of defect a browser will always call clean

`measureInWindow` is the load-bearing call in every "has the reader actually
scrolled to this yet" guard, and **it answers for a view that is not attached to
a window by handing back the window ORIGIN at the view's real size** — Android's
`getLocationInWindow` short-circuits to (0, 0) when `mAttachInfo` is null. So the
thing furthest from the screen produces the most convincingly *on screen* reading
there is, and three ordinary situations produce it: the first layout pass, a tab
`react-native-screens` has detached, and `removeClippedSubviews`, which Profile
turns on for fling performance and which detaches every direct child of the
scroll content outside the viewport.

The rank climb's intro was gated on exactly that, latched at mount 900 points
below the fold, spent its one animation on nobody and marked itself seen. **The
guard did not fail to fire; it fired for the wrong reason and reported success.**

The part worth carrying forward is not the null check. It is that **a browser
measures a detached element correctly**, so no harness in §21 could ever have
reproduced this, and adding one would not help. The arithmetic therefore lives in
`lib/utils/inViewMath.ts` — zero imports, the same rule as `rig.ts` and `tone.ts`
— and `check:ui` feeds it the exact reading that broke it. When the platform's
answer is the thing that is wrong, the check has to be written against the
answer, not against the screen.

> A second thing was wrong in the same place and is worth separating: **the guard
> latched for the lifetime of the screen, and a tab screen is mounted for the
> whole session.** So "seen" quietly meant "seen once, ever" — one look disqualified
> every look after it. `useInView` re-arms on the way out now. Any latch on a
> mounted-forever screen wants that question asked of it.

> **A CHECKER CAN BE BLINDED BY A LINE ENDING, AND IT LOOKS LIKE PROGRESS.**
> `validate-cinematic` splits a script into beats on the literal string
> `'\n  {\n'`. Ten scripts edited from a Python helper came back with CRLF —
> `io.open(p, 'w')` translates on Windows — so every one of them reported **zero
> beats**, every finding inside them silently vanished, and the suite got
> QUIETER. Two budgets were then ratcheted down against that reading, which is
> the worst possible outcome: a tighter number recorded on a partly blind
> instrument. `tsc` passed throughout, because CRLF is perfectly valid
> TypeScript.
>
> Two rules out of it. **Write files with `newline='\n'` explicitly** — the
> repo is LF and git's autocrlf hides the difference until something parses by
> hand. And **a budget that improves without a change that should have improved
> it is a measurement to distrust**, not a win to bank.

> **AND ONE OF THESE NOTES WENT MISSING BETWEEN TWO COMMITS.** Both sessions
> working in this repo isolate a shared file the same way — rebuild it from
> `HEAD` plus your own edits, stage that, put the shared copy back — which keeps
> each commit clean. It is only safe while HEAD is still what you branched your
> edit from. A rebuild taken from a base two commits stale silently dropped 64
> lines of somebody else's section, and nothing failed: the file was valid, the
> checks were green, and the only tell was a `grep` returning zero. **Re-read the
> file you are about to rebuild, not the one you remember.**

**On device**, `adb` lives in the session scratchpad. Applying an OTA takes two
launches: force-stop → launch (downloads) → force-stop → launch (applies).
Crashes: `adb logcat -d -b crash`.

---

## 22. Settings Must Do Something

Settings held **eighteen** controls that wrote to a store key nothing else read.
A daily goal in minutes when no screen has ever timed a session; three
"who can see my profile" switches in an app with no other users; an auto-backup
flag the sync layer never consulted; six notification toggles with no
notification library installed. Plus a **Save Changes** button that flashed
"Saved ✓" and wrote nothing. They looked like settings and behaved like
decoration.

**The rule now: a settings key earns its place by having a reader outside
Settings.** Wire it in the same commit or leave it out. `AppSettings` in
`stores/userDataStore.ts` carries the rule in a comment; `sanitizeSettings()`
right beneath it is the enforcement — it keeps only the keys still in
`DEFAULT_SETTINGS`, which is the one place that can prune both AsyncStorage and
the cloud snapshot at once. Plain `{...defaults, ...persisted}` would re-adopt
`dailyGoalMinutes` on every load and push it straight back up forever.

Where the live ones are read: **daily goal** → the dot row under the streak on
Home; **auto-advance** → `LessonReward.handleContinue` via `nextLessonInUnit()`;
**auto-backup** → `useCloudSync` gates the upload (never the pull-and-merge, so
signing in on a new phone still restores); **usage analytics** → the root layout;
**quote card + placement** → Home / Profile / Insights.

Two decisions worth not re-litigating:

- **Auto-advance stops at the unit boundary.** Running on would skip the unit
  list — the one screen that shows a unit was just finished — and on a free
  account the next unit is usually locked, so the reader would be auto-advanced
  into a paywall. It also goes through `lessonAccessibility()`, so it can never
  be a side door into a lesson that has not been earned or paid for.
- **The goal counts lessons, not minutes.** Nothing in this app has ever
  recorded a duration. `dailyLessonCount` already exists for the free-tier gate,
  so a lesson goal is one the app can actually measure you against.

### Notifications need a binary, and the section knows it

Everything scheduled is **local** — `expo-notifications`, no server, no push
token — so reminders work with the app closed and the phone offline. The cost is
that nothing can be composed at send time: whatever a notification will say is
decided while the app is open. Hence the shapes in `lib/notifications/real.ts`:
the daily nudge is the one *repeating* trigger (fixed copy, never runs out); the
streak warning is **seven one-shot evenings** re-laid on every foreground, so
tonight's is dropped once a lesson is done and only tonight's quotes the real
streak number; the quote of the day is written days ahead from
`getQuoteForDay(day)` so the lock screen and the app agree.

> **This was the blocker and it is now cleared.** `expo-notifications` was added
> on 2026-08-01, after build 16 — so for a week no shipped APK contained it, and
> an OTA cannot add a native module to a binary that lacks one. **Build 19
> (2026-08-05) contains it**, `app.json` carries the plugin and the status-bar
> icon, and the gate at 19 means every reachable user is on that binary.
> Reminders work today.

The guard stays anyway, and this is the part worth not undoing. `notifications.isSupported()`
exists and the Settings entry is built from it — on a binary without the module the
section is *absent*, not disabled, because six switches that cannot possibly work is
the exact thing this section removed. It still earns its place on web, in Expo Go and
in any dev client, and it is what makes the next native module cheap to add.
It is also why `lib/notifications/index.ts` requires `./real` inside a
`try`/`catch`: `real.ts` imports the native module at module scope and **throws**
on the way in when it is missing. Catching that is the difference between "the
reminders section is hidden until they update" and "the app crashes on launch for
everyone still on the old build". **Never turn that into a static import**, and
never reference `expo-notifications` from anywhere else.

Consequences to remember:

1. Adding the dependency **moved the fingerprint** — see §18, and generate it
   rather than assuming. This is the one consequence that never expires: it is
   true of every dependency, native or not.
2. ~~Reminders reach nobody until a new binary ships.~~ **Settled by build 19.**
3. ~~Decide whether `app.json` wants an `expo-notifications` plugin entry.~~
   **Decided:** it has one, pointing at `assets/images/notification-icon.png`
   with colour `#1A1A1A`. Without it Android silhouettes the launcher icon, which
   for a feather on white comes out as a blob. It went in *with* build 19 rather
   than just before an OTA, which is the rule that made it safe.
