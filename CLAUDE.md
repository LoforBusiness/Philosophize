# Philosophize — Project Bible

> Philosophy as gameplay, not lecture. Interactive micro-lessons that make thinking feel like a superpower.

---

## 1. Project Overview

**Philosophize** is a mobile philosophy learning app for iOS and Android. It makes philosophy interactive, visual, and gamified — using micro-lesson cards, XP systems, streaks, and curiosity-driven progression instead of walls of text.

**Target audience:** Ages 16–35, curious beginners with no prior philosophy background.

**Core principle:** Every screen should make the user feel smarter, not more confused.

**Live: SHIPPED on Google Play**, full public rollout, package `com.philosophize.app`.
Current binary is **versionCode 16**. Content and JS ship over the air between
binaries (see §18) — a new build is only needed for native changes, app icons,
splash, or anything else baked into the APK.

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
| Reminders | expo-notifications | ~56 | **LOCAL only** — no server, no push token. Added after build 16, so it is absent from every shipped binary (§22) |
| Widget | react-native-android-widget | 0.20 | Android home-screen "Quote of the Day" |
| Validation | Zod | 4.x | API boundary validation only |
| Date math | date-fns | 4.x | Streak calculation |
| Haptics | expo-haptics | ~56 | Installed; used ONLY in `lesson/story/*` — still not in the runner |

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
│       ├── stats/               # Insights (sketch charts)
│       ├── profile/             # Rank, badges, streak, saved quotes
│       ├── settings.tsx         # Hidden route. 9 sections down a LABELLED rail:
│       │                        #   Profile · Account · Notifications · Learning ·
│       │                        #   Display · Privacy · Feedback · Subscription ·
│       │                        #   Danger Zone. Notifications only when §22 says
│       │                        #   the binary can schedule one
│       └── paywall.tsx          # Hidden route (Scholar's Pass)
├── components/
│   ├── lesson/                  # LessonRunner, CardShell, LessonReward, LessonLoader
│   │   ├── cards/               # 8 card components (incl. DilemmaCard, QuoteCard)
│   │   ├── interactions/        # MultipleChoice, TrueFalse, SortItems (3 live)
│   │   ├── cinematic/           # THE BIG ONE — 102 wired cinematic lessons, the
│   │   │                        #   shared rig.ts, Stickman.tsx, CinematicPlayer,
│   │   │                        #   per-lesson *Scene.tsx + *Script.ts (§17)
│   │   ├── feedback/            # CorrectFeedback, IncorrectFeedback (built, unwired)
│   │   ├── scenes/ inkScenes    # per-branch illustration art
│   │   └── story/               # SnowWalkStory, ExistenceStory, PaintScene (unwired)
│   ├── launch/                  # LaunchScreen + launchScenes + LaunchFigure (§19)
│   ├── home/                    # QuickStartCard, StickmanStroll
│   ├── gamification/            # StreakBook, StreakWeek, RankUpScreen
│   ├── widget/                  # Android home-screen widget surface
│   └── shared/                  # SketchIcon, Glyph, PhilosopherSheet, RanksBadgesSheet,
│                                #   SavedQuotesSheet, PaywallSheet, QuoteBook, RankSeal,
│                                #   UpdateGate, DailyQuoteWidget, Sketch{Pie,Bar,Line}Chart,
│                                #   Portrait, ScreenTransition, PressableScale
├── data/                        # Curriculum + reference content (version-controlled)
│   ├── types.ts                 # ALL type definitions — the load-bearing file
│   ├── index.ts                 # ALL_BRANCHES + getLessonById, lessonAccessibility,
│   │                            #   branchCountsFromUnits, getLessonUnitInfo
│   ├── branches/                # 6 branches · 28 units · 192 lessons (§5)
│   ├── philosophers.ts          # BASE + composes ALL_PHILOSOPHERS (~223)
│   ├── extra-philosophers/      # ancient/eastern/medieval/modern/contemporary/
│   │                            #   expansion, expansion2a/2b/3/4 (+ *-facts)
│   ├── philosopherFacts.ts      # "Did you know?" facts, 3 per philosopher
│   ├── ranks.ts                 # 25 ranks; rankForXP() + awardedRank()
│   └── badges.ts                # 50 badges + earned(stats) predicates
├── stores/                      # Zustand: lessonStore, uiStore, subscriptionStore,
│                                #   userDataStore (persisted + cloud-synced)
├── lib/
│   ├── supabase/                # client, auth, secureStorage, sync, useCloudSync,
│   │                            #   tombstone, useSession
│   ├── ads/ purchases/ auth/    # each: types + real + stub + index.web (native-safe)
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

**Every branch holds exactly 32 lessons, of which exactly 17 are cinematic** —
53% of the way through the takeover. Both numbers are deliberate invariants rather
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
  in one pass. Adding one lesson to one branch breaks both at once.

| Branch | Units | Lessons | of which cinematic | card decks left |
|---|---|---|---|---|
| Metaphysics | 5 | 32 | 17 | 15 |
| Epistemology | 5 | 32 | 17 | 15 |
| Logic | 5 | 32 | 17 | 15 |
| Ethics | 5 | 32 | 17 | 15 |
| Aesthetics | 3 | 32 | 17 | 15 |
| Political Philosophy | 5 | 32 | 17 | 15 |
| **Total** | **28** | **192** | **102 (53%)** | **90** |

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
> (`scripts/validate-lessons.mjs`) — 192/192 clean. Cinematic lessons have their own
> shape check, `npm run check:cinematic` (§17). `npm run check` runs tsc plus both.

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

**Streak:** Maintained by completing at least one lesson per calendar day. Alive if the last activity is today or yesterday (`lib/utils/streak.ts`). Stored in `userDataStore`.

**Stars:** 100% score = 3 stars. ≥70% = 2 stars. Any completion = 1 star.

**Progression systems (live):**
- **Badges** — **50** in `data/badges.ts`, each `{ id, name, glyph, earned(stats) }`; evaluated by `recomputeBadges()` and shown in `RanksBadgesSheet`.
- **Ranks** — **25** tiers in `data/ranks.ts` (Novice → Grand Philosopher). Two
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

**Keep every branch at 32, and at 16 cinematic (§5).** The counts were 27–30 and it
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

**Validation:** `npm run check` = `tsc` + both structural validators. `check:cards` enforces the card contract above (hook first, summary last, 4–10 cards, ≥1 question/dilemma, exactly one correct MC answer) across all 192 lessons; `check:cinematic` enforces the cinematic shape rules (group H of the rule book) across every wired scene, and carries the two takeover ratchets from §5. Both are clean today, so anything they print is yours.

**Cinematic lessons have their own rule book:** [`docs/LESSON_RULES.md`](docs/LESSON_RULES.md) — figure scale and proportion, reach and joint rules, motion and end-poses, band/deck/box/wrap clipping, and the text-must-match-the-picture rule. Read it before authoring a cinematic lesson and run its Part 3 checks before calling one done.

---

## 12. Current Status

**Phase 5 — shipped and iterating in public.** Live on Google Play, versionCode 16.

- **Content:** 6 branches · **28 units** · **192 lessons**. **~223 philosophers**
  with bios, eras, 4–6 quotes and three "Did you know?" facts apiece.
- **Lessons:** 8 card types; 3 interactions; swipe pager with question/dilemma
  gating; **102 cinematic lessons** (animated stickman scenes, §17); animated
  `LessonReward` with XP count-up, streak and rank-up.
- **Gamification:** 50 badges, 25 ranks with a conferred-rank ceremony, XP +
  level curve, daily streak.
- **Screens:** Home (with Quick Start, §19), Learn → branch → unit accordion →
  lesson, Thinkers, Stats, Profile, Settings, paywall, widget, saved quotes.
- **Money:** RevenueCat `scholars_pass` entitlement; AdMob interstitial after a
  free user's lesson; free daily lesson limit.
- **Infra:** Supabase auth + cloud sync; PostHog; EAS Build + EAS Update;
  forced-update gate (§20).
- **Identity:** hand-drawn black-and-white "paper-and-ink" editorial aesthetic,
  light theme only — with photographic backgrounds behind branch cards, branch
  mastheads, the launch screen and Quick Start (§19).

**Known gaps / tech debt:**
- **Half the lessons are still card decks** — 90 of 192. That is now the number
  that matters; see the takeover rule at the top of §5.
- **`fill-blank` and `match` are closed as won't-do.** They were the oldest open
  item in this file. Finishing an interaction for the format being retired is work
  pointed the wrong way, so the stubs stay stubs.
- **Built but not wired:** `story/` scenes, `KineticNarration` voice, `feedback/`
  panels. Decide to ship or delete them.
- **Haptics** is used only inside `lesson/story/*` — still absent from every
  runner the user actually reaches.
- **Daily Review / spaced repetition does not exist.** It is the headline
  Scholar's Pass promise in §14 and the P0 in §15, and nothing has been built.
- **`lib/utils/progress.ts` is legacy** — `isLessonUnlocked` / `isPathUnlocked`
  encode the *old* per-branch model. The live gate is
  `lessonAccessibility()` in `data/index.ts`. Don't call the old ones.
- Aesthetics has 3 units where the others have 5.

---

## 13. Lesson Design Principles (north star)

> ⚠️ **Before writing or changing any cinematic lesson, read [`docs/LESSON_RULES.md`](docs/LESSON_RULES.md).**
> That is the binding rule book — 93 numbered rules in eight groups (truth of the
> picture · the figure · motion · nothing hidden · questions · writing · engine · the
> house shape), an authoring checklist, and the six exact verification checks. Groups
> A–G each exist because a real lesson broke that rule and it was caught on a real
> phone; group **H** is the reverse — the conventions all 48 built lessons already
> share, counted out of the source, so a new one comes out a sibling rather than an odd
> note. This section is the *why*; that file is the *how*, with the numbers.
>
> Rule A1 above all: **what the text says, the picture must do.** A lesson that says
> someone is on the floor and draws them standing is not acceptable at any polish level.

Lessons are the product. They must *look*, *feel*, and *teach* well enough that a curious beginner would pay to keep going. Every lesson should honor:

- **Teach, don't lecture.** One idea per card; concrete example before the abstract term; never a wall of text.
- **Productive struggle.** Every lesson earns its payoff with a real question or dilemma. A good "trick" answer is tempting for a *nameable* reason — so the explanation should **name the bias/fallacy and say why the tempting choice fails.**
- **Ground it in a real thinker.** Pair the concept with a primary-source `quote` card. Authenticity ("here is the sentence Descartes actually wrote") is what makes it feel valuable, not gamified trivia.
- **Give it an arc.** Hook (provocation) → build → struggle → a "what you now know" payoff on the summary.
- **Retention over completion.** Finishing a lesson is worthless if it's forgotten by Friday. Concepts must come back (see Daily Review, §15).
- **Make it feel crafted.** Hand-drawn B&W ink identity, micro-animations, haptics + subtle sound, calm pacing, swipe = page-turn.
- **Rotate the interaction.** Don't let two lessons in a row feel identical — vary the card mix and interaction type.
- **Reward curiosity & give a sense of mastery.** Saveable quotes, tappable philosophers, and path-mastery checks that feel like a small credential.

---

## 14. Premium Experience & Monetization

The Scholar's Pass paywall UI already exists; this is the value model it should sell.

**Free tier** — enough to fall in love: the first path of each branch (or N lessons/day), basic streak + XP, and full philosopher browsing.

**Scholar's Pass** — all branches & paths, **Daily Review** (spaced repetition), unlimited + offline lessons, exclusive deep-dive lessons, and the full saveable-quote library/export.

**Why someone pays (the thesis):**
1. They actually **retain** what they learn (spaced review), not just tap through it.
2. The **cinematic, narrated** lessons feel like nothing else in the category.
3. **Breadth** — 6 branches, 192 lessons, ~223 thinkers — is a genuine library.
4. **Credential & mastery** — ranks + path-mastery give visible proof of progress.
5. The **daily habit** (streak + review) makes the subscription part of a routine.

---

## 15. Ideas Backlog / Roadmap (prioritized)

**P0 — Daily Review (spaced repetition).** The retention engine and the strongest reason to subscribe. Resurface concepts from completed lessons on a spacing schedule via quick `multiple-choice` / `true-false` / `reinforcement` prompts; add a "Review" entry on Home; completing a review counts toward the streak. Track per-concept last-seen + strength in `userDataStore`.

**P0 — Convert the remaining 90 card decks (§5).** Six at a time, one per branch, so
the per-branch counts stay level, until `check:cinematic` reports 0 card decks left.
Then `LessonRunner`, `cards/` and `interactions/` can go. Every lesson added along
the way is cinematic.

**P0 — Sensory polish.**
- Add **haptics** (`expo-haptics`: light on correct, warning on incorrect, success on lesson complete) and **subtle sound** (page-turn on swipe, ink-scratch on reveal, soft chime on correct) — gated behind a Settings sound/haptics toggle.

**P1 — Finish the orphaned premium machinery.** Wire the cinematic **story scenes** (`SnowWalkStory`, `ExistenceStory`) in as a path's hook or capstone; ship a **"Read to me"** narration toggle (`KineticNarration`); and decide to either **show** the `feedback/` panels in the runner or delete them.

**P2 — Growth loops.** Add **unit-mastery quizzes** (`XP_PER_PATH_MASTERY` is
defined and unused). Add **shareable B&W quote/streak cards**. Aesthetics has 3
units where every other branch has 5 — level it up.

**P3 — Foundations.** Delete the legacy `lib/utils/progress.ts` and
`constants/achievements.ts` once nothing imports them. (The **lesson-contract
validation script** that used to head this item is done — `npm run check`, see §11.)

**Done since this list was written** — kept so nobody re-plans them: content grew
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

**This is the format the app is converging on** — 102 of the 192 lessons are here
already, and the card runner is what they are replacing (§5). They are not card
decks at all: they are tap-advanced animated scenes.
`app/(app)/branches/[branchSlug]/[pathSlug]/lesson/[lessonId].tsx` holds a
`CINEMATIC` map from lesson id → component; anything absent falls through to the
normal `LessonRunner`. **Removing an entry is a complete, safe rollback** for one
lesson.

A cinematic lesson = a **script** (beats) + a **scene** component, played by
`CinematicPlayer`. Two lessons predate the shared player and carry their own
copies of it: `ArgumentFightLesson` and `PremisesBuilderLesson`.

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

**Rules that keep biting, in rough order of how often:**

1. **Every hook must sit above `if (done) return null`.** All three players carry
   that early return near the bottom. Hooks were once added below it; `done`
   flips on the final tap, React counted fewer hooks than the previous render and
   threw, which took down the whole tree **including the reward modal that had
   just been mounted** — every cinematic lesson ended on a blank screen with no
   way forward. A hook below that line is not a style nit; it breaks finishing a
   lesson. Each early return now carries a comment saying so.
2. **`K_FIG` is 1.0 and lives in `cinematicKit`.** A file declaring its own local
   `K_FIG` shadows it and silently misses future corrections.
3. **Figure-to-figure distances scale with the figure; figure-to-prop distances
   do not.** Props are fixed-size, so a shrinking figure against a prop is the
   point; two figures placed against each other must keep their separation
   proportional or the staging goes limp.
4. **The BAND must contain every pixel a beat can draw.** Each lesson crops the
   400×560 design space to the slice its art occupies and scales that up. Adding
   art outside the band clips it. Re-measure when you add anything.
5. **A plain JS closure cannot cross into a worklet.** Pass numbers, not
   functions. This crashed the launch screen in production (§19).
6. **An animated full-screen `<Svg>` costs ~10fps on an S24.** Any animated art
   is inert SVG with native Views moving on top of it.

---

## 18. Shipping: EAS Build and Over-the-Air Updates

### The runtime-version trap — read this before every publish

An OTA only reaches binaries whose **runtime version matches**. Builds do not
share one:

| Build | Runtime version |
|---|---|
| 16 (current) | `bd0c0637f7e636eef9e8ddbbe61db9c9c9ae513c` |
| 15, 14 | `7655f410f4b7050d121f65fcfb33bb7c2da56b5a` |

The runtime is a **fingerprint of the native project**, so it changes whenever
app icons, `app.json`, `eas.json` or any native dependency changes. Publishing to
one runtime while users sit on another means **the update reaches nobody**, and
the failure is completely silent.

> **Publish to every runtime still in the wild**, newest first. Drop an old one
> only once nobody is left on that binary.

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
> moved again, to `285fd93f…`, because a few pure-JS font packages were added — the
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

**The welcome end card** (`assets/images/welcome/sky.jpg`) is the one background
that is a *drawing* rather than a photograph, and it follows the same rule for the
same reason: the ink hatching runs to near-black in places, so the wordmark's
contrast is set by the scrim, not by the crop. Its scrim is shaped rather than flat
— 72% through the band the type occupies (y 0.40–0.62) and 22% elsewhere, so the sky
is plainly visible and the type still measures **8.7:1**. A flat 90% wash was tried
first and erased the drawing, which defeated the point of having it.

> **It only reaches new users in a NEW BINARY.** `hasSeenWelcome` persists and gates
> this screen to one showing per install, and a fresh install runs the *embedded*
> bundle on its first launch (there is no `fallbackToCacheTimeout`, so the OTA lands
> on the second). By then the flag is already set. Anything that changes the welcome
> animation therefore needs an EAS build + Play upload to be seen by anybody; an OTA
> carries it but shows it to no one.

---

## 20. Forced Update Gate

`components/shared/UpdateGate.tsx`, mounted last in the root layout so it covers
everything. `MIN_VERSION_CODE` is a constant in that file.

It compares against **`Application.nativeBuildVersion`** — the versionCode
compiled into the APK — and *not* the version in `app.json`, because that one
travels with OTA updates: an old binary carrying new JS would report the new
number and walk straight past the gate.

**It fails open, deliberately.** On Android the value is `"16"`, but `parseInt`
would turn an unexpected `"1.0.0"` into `1`, and against a minimum of 16 that
locks out *every user on earth including up-to-date ones*, with no way back. So
only whole digits count; anything else, and anything null (web, Expo Go, dev
client), is unknown — and unknown never blocks. iOS is skipped entirely.

**Raising `MIN_VERSION_CODE` has two conditions:** the target release must
already be live and fully rolled out, and the update must be published to **every
runtime still in the wild** (§18). A gate published only to the current runtime
reaches exactly the people who do not need it.

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
- **React Native Web needs a real `click` event**; synthetic `pointerdown` +
  `pointerup` alone do not trigger a `Pressable`.
- **Measure, don't eyeball.** Sampling geometry every frame catches what
  screenshots miss. Beware the opposite error too: an animation once looked like
  it "snapped" purely because the sampler was starved — slow the animation to ~3s
  and re-measure before believing it.
- A stale Metro server will serve a bundle that never boots. Restart with
  `--clear` before concluding the app is broken.
- `jimp-compact` is available (via `@expo/image-utils`) for offline image work —
  resizing, desaturating, compositing icon layers, checking transparency.

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

> **`expo-notifications` was added AFTER build 16, so no shipped APK contains it,
> and an OTA cannot add a native module to a binary that lacks one.**

That is why `notifications.isSupported()` exists and why the Settings entry is
built from it — on an old binary the section is *absent*, not disabled, because
six switches that cannot possibly work is the exact thing this section removed.
It is also why `lib/notifications/index.ts` requires `./real` inside a
`try`/`catch`: `real.ts` imports the native module at module scope and **throws**
on the way in when it is missing. Catching that is the difference between "the
reminders section is hidden until they update" and "the app crashes on launch for
everyone still on the old build". **Never turn that into a static import**, and
never reference `expo-notifications` from anywhere else.

Consequences to remember:

1. Adding the dependency **moved the fingerprint** — see §18, and generate it
   rather than assuming.
2. Reminders reach nobody until a new binary is built and rolled out. The JS is
   safe to ship over the air in the meantime; it simply hides the section.
3. When that build happens, decide whether `app.json` wants an
   `expo-notifications` plugin entry for the small Android status-bar icon.
   Without one Android silhouettes the launcher icon, which for a feather on
   white may come out as a blob. Changing `app.json` moves the fingerprint again,
   so do it *with* the build, never just before an OTA.
