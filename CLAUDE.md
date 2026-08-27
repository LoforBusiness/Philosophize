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

> **THE ONE COLOUR WAS AN ORANGE, AND AN ORANGE IS A SEASON.** `constants/streak.ts`
> licensed a single hue for the whole app on the grounds that a streak has to say
> ALIVE or ABOUT TO DIE from across a room, and every contrast floor in it was
> measured and cleared. The reader looked at it: *"it just looks like it is fall
> or it's Halloween … the orange just looks like a festive colour."* They were
> right, and the ratios were never the thing — a palette can be entirely correct
> and still be about October.
>
> It is **verdigris** now, `PATINA #068177`, the green a bronze takes from being
> left out in the weather, against `SLATE` for a run that has gone out. The
> object is better than the ember was: an ember is something you are about to
> lose, a patina is proof of time already served, and a streak is the second one.
>
> **TWO SEARCHES CAME BACK WRONG BEFORE THE THIRD, and both are the obvious
> thing to do.** Maximising CIELAB distance from slate returned `#11BE84` and
> `#64F2C2` — electric mint, the exact corner `design.ts` records its own colour
> search falling into. Then matching the ember's own chroma returned `#048544`, a
> vivid emerald: **equal chroma is not equal loudness across hues**, because the
> eye peaks in the green-yellow band, so an orange at chroma 59 reads as warm
> where a green at 53 reads as a highlighter. The anchor that works is what this
> app already ships in that hue — JADE's base at 32, LAPIS at 37.
>
> The separation from slate falls 56.2 → 32.1 ΔE and that is arithmetic rather
> than a regression: a teal and a warm grey are genuinely nearer in Lab than an
> orange and a warm grey. The floor is 20, and the state is still carried by HUE
> — 2.8 L apart — which is the property that matters and the one checked.
>
> **The flame went with it.** `StreakCelebration` drew a literal one, right while
> the streak was an ember and a metaphor arguing with itself once it was not. It
> is the calendar's own struck token now, held up large, wearing the milestone
> collar on a landmark day — so the reward screen and the grid agree about which
> days were the big ones instead of each having a private opinion.

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
    scallop · star · coronet · sunburst. Each is a core shape, a counter-rotated
    UNDERPLATE behind it, and a facet count (`VOCAB` in
    `components/shared/rankShapes.ts`).
  - the **BUILD** is the same six steps in every order, and it RESETS at each new
    colour: core → inner rule → facets → underplate → studs → collar. Five
    additions for five rungs, one each.
  - so complexity is a **sawtooth that climbs**. Clay's capstone is a disc on a
    square plate; aurum's is an eight-lobe rosette inside a sixteen-point burst,
    cut into facets and ringed twice. Same six steps, nothing in common to look
    at, and the capstone reach climbs 39 → 47.5 across the ladder.

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

  The mark's room stays flat at 0.36–0.40 across all eight while the drawn area
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

**Validation:** `npm run check` is **forty-two** validators plus `tsc`, in this order —
`check-routes` runs FIRST, before even the typecheck, because a stray preview route
makes every browser-derived result in the run suspect and would ship if a build
followed:
`check-routes` · `check-nav` · `validate-worklets` · `validate-lessons` · `validate-cinematic` · `check-echo` · `check-prompts` ·
`validate-badges` · `validate-sound` · `check-walk` · `check-props` · `check-scale` ·
`check-camera` · `check-tour` · `check-space` · `check-controls` · `check-shade` · `check-lift` · `check-fits` ·
`check-plainwords` · `check-streak` · `check-quips` ·
`check-answers` · `check-answers-shape` · `check-quotes` · `check-mentions` ·
`check-poll` · `check-access` · `check-pass` · `check-rest` · `check-stats` · `check-launch` ·
`check-ui` · `check-events` · `check-thinkers` · `check-words` · `check-legible` · `check-plain` · `check-rotation` · `check-react` · `check-smooth` · `check-moves`. It exits 0 today, so anything any of them prints is yours. (Several
carry high-water budgets rather than zeroes — `check-scale` allows 18 oversized
figures and 6 hand-built ones, `check-moves` 6 head-clearance defects, `check-shade`
112 flat scenes. A budget
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
  `plot` · `split` · `field` (§17, group R). **The analogue family is now the
  majority**: 182 graded beats against 150 on the stage and 36 left in the deck,
  and every lesson but two has one (the two ask both their questions on the stage
  instead). **149 of those 182 move the picture as the reader moves the control**
  (R7c, §17). Animated `LessonReward` with XP count-up, streak and rank-up.
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
holds three high-water marks: the two-card deck is at most 55% of all questions
(it was 47% and falling), neighbouring lessons do not both use the same control
(133 pairs did, now 112), and **36 lessons ask both of their questions BELOW the
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
