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
│   └── (app)/                   # Authenticated tab shell (5 tabs)
│       ├── _layout.tsx          # Tabs: Home · Learn · Thinkers · Stats · Profile
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
│       └── paywall.tsx          # Hidden route — hosts PaywallContent full-screen
├── components/
│   ├── lesson/                  # LessonRunner, CardShell, LessonReward, LessonLoader
│   │   ├── cards/               # 8 card components (incl. DilemmaCard, QuoteCard)
│   │   ├── interactions/        # MultipleChoice, TrueFalse, SortItems (3 live)
│   │   ├── cinematic/           # THE BIG ONE — 132 wired cinematic lessons, the
│   │   │                        #   shared rig.ts, Stickman.tsx, CinematicPlayer,
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
│   │                            #   comparison), DailyLimit, LessonLocked (§14)
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
│   ├── ranks.ts                 # 40 ranks in 8 orders of 5; rankForXP(),
│   │                            #   awardedRank(), rankOrder(), rankDegree()
│   ├── rankLore.ts              # the 8 Circles + a one-line epithet per rank
│   └── badges.ts                # 68 badges, 5 tiers + goal(stats)/need pairs
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

**Streak:** Maintained by completing at least one lesson per calendar day. Alive if the last activity is today or yesterday (`lib/utils/streak.ts`). Stored in `userDataStore`.

**Stars:** 100% score = 3 stars. ≥70% = 2 stars. Any completion = 1 star.

**Progression systems (live):**
- **Badges** — **70** in `data/badges.ts`, each `{ id, name, glyph, family, tier,
  goal(stats), need }`; evaluated by `recomputeBadges()` and shown in
  `RanksBadgesSheet`. **Five tiers**, struck in four of the rank orders plus gold
  (`constants/insignia.ts`), so both reward ladders speak one language. The ids
  are FROZEN and `check:badges` holds the roll — the roll is a literal list in
  `validate-badges.mjs`, so **adding one is a deliberate two-file act**, which is
  what the last two (32,000 and 50,000 XP) were.
- **Ranks** — **48** in `data/ranks.ts` (Novice → Grand Philosopher), in **eight
  orders of six**: clay, iron, bronze, jade, lapis, crimson, amethyst, aurum.
  Three things change as you climb, and between them **no two consecutive
  promotions look alike**:
  - the **MATERIAL**, every six ranks (`constants/insignia.ts`, and the third
    place §19 licenses colour);
  - the **SHAPE**, every six ranks — `components/shared/rankShapes.ts` gives each
    order its own silhouette, escalating by accretion: disc → cut plate →
    hexagon → notched gem → shield → crested shield → winged → crowned. The
    footprint grows from 66 to 96 units of a 100-unit tile while the mark's room
    stays flat at 0.36–0.40, so everything the ladder gains it gains OUTSIDE the
    glyph. That discipline is the whole reason it survives being drawn at 44px;
  - the **FINISH**, every rank — inner rule, two/four/six studs, then the
    capstone's outer collar.

  **`npm run sheet:ranks` renders all forty-eight in plain Node** and is how they
  are judged; `check:ui` is what stops them breaking (a frame that outgrows the
  viewBox is clipped silently on every screen at once). Two
  functions, and the difference matters: `rankForXP(totalXP)` is what the XP
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

**Validation:** `npm run check` is **twenty-eight** validators plus `tsc`, in this order —
`check-routes` runs FIRST, before even the typecheck, because a stray preview route
makes every browser-derived result in the run suspect and would ship if a build
followed:
`check-routes` · `validate-worklets` · `validate-lessons` · `validate-cinematic` · `check-echo` · `check-prompts` ·
`validate-badges` · `validate-sound` · `check-walk` · `check-props` · `check-scale` ·
`check-camera` · `check-tour` · `check-streak` · `check-answers` · `check-quotes` · `check-mentions` ·
`check-poll` · `check-access` · `check-pass` · `check-rest` · `check-stats` · `check-launch` ·
`check-ui` · `check-thinkers` · `check-words` · `check-smooth` · `check-moves`. It exits 0 today, so anything any of them prints is yours. (Several
carry high-water budgets rather than zeroes — `check-scale` allows 18 oversized
figures and 6 hand-built ones, `check-moves` 6 head-clearance defects. A budget
line that still says the same number is not a pass, it is a debt.) `check:cards` enforces the card contract above (hook first, summary last, 4–10 cards, ≥1 question/dilemma, exactly one correct MC answer) across all 222 lessons; `check:cinematic` enforces the cinematic shape rules (group H of the rule book) across every wired scene, and carries the two takeover ratchets from §5. Both are clean today, so anything they print is yours.

> **`check-moves` was the last one on that list to actually run, and for a long
> time it did not.** It existed, this section quoted its budget, and
> `docs/LESSON_RULES.md` told authors to run it — but it was in no npm script and
> not in `npm run check`, so its 6-defect high-water mark could not ratchet and a
> seventh would have shipped in silence. A budget nobody executes is not a budget.
> If you add a validator, add it to `check` in the same commit, and name it above:
> `check:bible` compares this list against `package.json` and will tell you.

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
  `plot` · `split` · `field` (§17, group R); animated `LessonReward` with XP
  count-up, streak and rank-up.
- **Gamification:** 70 badges in 5 tiers, **48 ranks in 8 coloured orders, each
  order struck in its own silhouette** (§7), a conferred-rank ceremony that shows
  the pin they held handing over to the pin they just earned, a three-badge
  profile cabinet, XP + level curve, daily streak. Top rank at 50,000 XP.
- **Screens:** Home (with Quick Start, §19), Learn → branch → unit accordion →
  lesson, Thinkers, Stats, Profile, Settings, paywall, widget, saved quotes.
- **Money:** RevenueCat `scholars_pass` entitlement; AdMob interstitial after a
  free user's lesson; free daily lesson limit. The offer, the daily limit and the
  locked lesson are **one family** (`components/paywall/`) built out of the
  reader's own account — their rank pin, six mastery bars, and the wait to finish
  the library drawn in real days. Every claim on them is derived from the gate
  that enforces it and re-checked by `check:pass` (§14).
- **Infra:** Supabase auth + cloud sync; PostHog; EAS Build + EAS Update;
  forced-update gate (§20).
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
- **Built but not wired:** `story/` scenes, `KineticNarration` voice, `feedback/`
  panels. Decide to ship or delete them.
- **Daily Review / spaced repetition does not exist.** It is the headline
  Scholar's Pass promise in §14 and the P0 in §15, and nothing has been built.
- **`lib/utils/progress.ts` is legacy** — `isLessonUnlocked` / `isPathUnlocked`
  encode the *old* per-branch model. The live gate is
  `lessonAccessibility()` in `data/index.ts`. Don't call the old ones.
- Aesthetics has 3 units where the others have 5.
- **Deprecated RN style APIs — a KNOWN and deliberately un-swept debt.** ~1,000
  `pointerEvents=` props, 48 `shadow*` declarations across 11 files, and
  `textShadow*` in 9. All three are deprecated, and the decision is to leave them
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
> **answers that are a quantity rather than a pick**), an
> authoring checklist, and the exact verification checks. Groups A–G each exist because
> a real lesson broke that rule and it was caught on a real phone; group **H** is the
> reverse — the conventions the built lessons already share, counted out of the source,
> so a new one comes out a sibling rather than an odd note. Group **Q** is the newest
> and it is about NEIGHBOURS rather than about any one lesson: what a reader meets when
> they finish sixteen and open seventeen. This section is the *why*; that file is the
> *how*, with the numbers.
>
> Rule A1 above all: **what the text says, the picture must do.** A lesson that says
> someone is on the floor and draws them standing is not acceptable at any polish level.

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
| one of a few NAMED settings on a ladder | `lever` | an arm with detents (`LeverPick`) |
| what happens to a thing AS another changes | `plot` | a curve you draw (`ShapePlot`) |
| how one thing DIVIDES between two | `split` | a seam in one bar (`SplitBar`) |
| two INDEPENDENT yes/no questions | `field` | a token on a pad (`FieldPick`) |

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

Forty-four graded beats are on the analogue family now — 26 `drag`, 6 `lever`, and
4 each of `plot`, `split` and `field` — and following the control is OPTIONAL, so
check which a scene does before reasoning about it. The four newest that do are
worth reading as the pattern: `metaphysics21` furnishes the two halves of a
timeline off the pad's two axes, `political22` makes the pad BE the switch,
`aesthetics22` drains a heart meter as the seam moves, and `political24` stands
five generations of speakers back up as the lever travels. A scene reads `dragPos`
**only on its own graded beat** and the script's own track everywhere else — one
value, two sources, and the picture never disagrees with whichever is in charge.
The flag is derived from the beat itself (`b.interact?.lever ? 1 : 0`) rather than
declared as a channel, so it cannot fall out of step with the control and it costs
`check:echo` nothing.

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
   functions. This crashed the launch screen in production (§19).
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
- **Four harnesses step the real lessons in a browser**, because some questions
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
  behind is deleted on the way past. `npm run check:frame` measures every
  element a scene draws against the stage's own crop and reports what the camera
  is cutting in half; `npm run measure:must` records what each beat has on stage
  and writes `components/lesson/cinematic/mustBoxes.ts`, which is what stops the
  camera cropping it (H60c); `npm run check:spoiler` reads the whole visible page
  at every graded beat BEFORE answering it and fails if any of the reveal is
  already legible (group O). All three want Metro on 8847 and a headless Chrome
  on 9382 — the header of each script has the exact commands.

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

  **That rule is now a shared file rather than four copies of a snippet.** Adding
  `lever`, `plot`, `split` and `field` (§17) meant four more ways to answer arriving
  at once, and four harnesses that each knew how to click and drag. They all import
  `scripts/lib/answerctl.mjs` now: one `CONTROL_IDS` list, one `ANSWER_CONTROL`
  expression that finds whichever control is on the beat by its `nativeID` and works
  it with a pointer sequence. A fifth control is one line there, and every harness
  gets it — which is the only version of this rule that survives being forgotten.

  **A fifth harness, and it is not about lessons.** `npm run sheet:pass` loads the
  three Scholar's Pass screens (§14) for real and reports whether React actually
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
