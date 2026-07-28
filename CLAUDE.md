# Philosophize — Project Bible

> Philosophy as gameplay, not lecture. Interactive micro-lessons that make thinking feel like a superpower.

---

## 1. Project Overview

**Philosophize** is a mobile philosophy learning app for iOS and Android. It makes philosophy interactive, visual, and gamified — using micro-lesson cards, XP systems, streaks, and curiosity-driven progression instead of walls of text.

**Target audience:** Ages 16–35, curious beginners with no prior philosophy background.

**Core principle:** Every screen should make the user feel smarter, not more confused.

**Live:** Not yet deployed. Development phase.

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
| Backend | Supabase | latest | **Auth only today**; progress persists locally (see §4) |
| Auth storage | AsyncStorage | latest | Persists Supabase auth session on device |
| Icons | react-native-svg | latest | Hand-drawn B&W `SketchIcon` + `Glyph` sets (not Ionicons) |
| Fonts | @expo-google-fonts | latest | Playfair Display (headings), Inter (body), Caveat + IM Fell English (accents) |
| Validation | Zod | latest | API boundary validation only |
| Date math | date-fns | latest | Streak calculation |
| Haptics | expo-haptics | latest | Installed; not yet wired into the runner (Roadmap P0) |

**Why NOT:**
- Redux over Zustand: too verbose for simple session state
- Firebase over Supabase: Supabase has PostgreSQL for relational progress queries + RLS
- MUI/Chakra over NativeWind: opinionated defaults fight the custom philosophy aesthetic

---

## 3. Repository Layout

```
Philosophize/
├── app/                         # Expo Router routes (file = screen)
│   ├── _layout.tsx              # Root: fonts, auth guard, QueryClient + global sheets
│   ├── index.tsx                # Landing / onboarding (isometric hero)
│   ├── (auth)/                  # login.tsx + signup.tsx (no tab bar)
│   └── (app)/                   # Authenticated tab shell (5 tabs)
│       ├── _layout.tsx          # Tabs: Home · Branches · Thinkers · Stats · Profile
│       ├── index.tsx            # Home (daily quote, action cards, streak)
│       ├── branches/            # Branch → path → lesson/[lessonId] navigator
│       ├── philosophers/        # "Thinkers" directory
│       ├── stats/               # Insights (sketch charts)
│       ├── profile/             # Stats, streak, saved quotes
│       └── settings.tsx         # Hidden route (multi-section settings)
├── components/
│   ├── lesson/                  # LessonRunner, CardShell, LessonReward, LessonLoader
│   │   ├── cards/               # 8 card components (incl. DilemmaCard, QuoteCard)
│   │   ├── interactions/        # MultipleChoice, TrueFalse, SortItems (3 live)
│   │   ├── feedback/            # CorrectFeedback, IncorrectFeedback (built, unwired)
│   │   ├── scenes/              # LessonScene (isometric per-branch art)
│   │   └── story/               # Cinematic: SnowWalkStory, ExistenceStory, PaintScene (unwired)
│   ├── gamification/            # StreakFlame, StreakWeek
│   └── shared/                  # SketchIcon, Glyph, PhilosopherSheet, RanksBadgesSheet,
│                                #   DailyQuoteWidget, Sketch{Pie,Bar,Line}Chart, Portrait,
│                                #   ScreenTransition, PressableScale, LessonPath
├── data/                        # Curriculum + reference content (version-controlled)
│   ├── types.ts                 # ALL type definitions — the load-bearing file
│   ├── index.ts                 # ALL_BRANCHES array + helper functions
│   ├── branches/                # 6 branches × 1 path × 10 lessons (60 total)
│   ├── philosophers.ts          # BASE philosophers + composes ALL_PHILOSOPHERS (~255)
│   ├── extra-philosophers/      # ancient/eastern/medieval/modern/contemporary/expansion* (+ *-facts)
│   ├── philosopherFacts.ts      # 3 "Did you know?" facts per philosopher
│   ├── ranks.ts                 # 25 ranks + rankForXP()
│   └── badges.ts                # 50 badges + earned(stats) predicates
├── stores/                      # Zustand: lessonStore, uiStore, userDataStore (persisted)
├── lib/
│   ├── supabase/                # client.ts, auth.ts (live), progress.ts (dormant)
│   └── utils/                   # streak.ts, week.ts, progress.ts, xp.ts
├── constants/                   # Colors.ts, xp.ts, achievements.ts (legacy)
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

**Implemented interactions:** `multiple-choice`, `true-false`, `sort`. **`fill-blank` and `match` are type-only stubs** — no component exists and `QuestionCard.tsx` renders nothing for them (Roadmap P0).

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

> No script enforces this yet — `tsc` checks types only. A validation script is a P3 roadmap item; follow the contract by hand until then.

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

**Intended XP model** (`constants/xp.ts`):

| Reward | Amount |
|---|---|
| XP per correct answer | 5 |
| XP per lesson completion | 25 |
| XP per perfect lesson (100% score) | 50 total |
| XP per path mastery | 100 |

> ⚠️ **Discrepancy to reconcile:** the live runner (`LessonRunner.tsx`, `COMPLETION_XP = 5`) actually awards **5 + 5×correct** with **no perfect bonus** — it does not use the `constants/xp.ts` values above. Pick one model and make the runner and constants agree (Roadmap P3).

**Level formula:** Level N requires `Math.floor(50 * N * Math.sqrt(N))` total XP (`getXPForLevel`).

**Streak:** Maintained by completing at least one lesson per calendar day. Alive if the last activity is today or yesterday (`lib/utils/streak.ts`). Stored in `userDataStore`.

**Stars:** 100% score = 3 stars. ≥70% = 2 stars. Any completion = 1 star.

**Progression systems (live):**
- **Badges** — **50** in `data/badges.ts`, each `{ id, name, glyph, earned(stats) }`; evaluated by `recomputeBadges()` and shown in `RanksBadgesSheet`.
- **Ranks** — **25** tiers in `data/ranks.ts` (Novice → Grand Philosopher) via `rankForXP(totalXP)`.
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

To add a new lesson:

1. Create a file in `data/branches/<branch>/paths/<path>/lessons/<slug>.ts`
2. Export a `Lesson` object matching the interface in `data/types.ts`
3. First card must be `{ type: 'hook' }`, last must be `{ type: 'summary' }`
4. Import and add to the path's `lessons` array in the path's `index.ts`
5. Run `npx tsc --noEmit` to validate types

To add a new path: create an `index.ts` in the path directory, import all lessons, export a `Path` object, add to the branch's `paths` array.

To add a new branch: create an `index.ts` in the branch directory, export a `Branch` object, add to `ALL_BRANCHES` in `data/index.ts`.

**Card-type notes:**
- A `quote` card needs a stable unique `id` (e.g. `lq-ethics-3-1`) so it can be saved; include `author`, `era`, optional `work`, and a `philosopherId` to link the Thinkers tab.
- A `dilemma` card has a `scenario`, `prompt`, 2–4 `choices`, and 2–4 `views` (each a thinker's `stance` + `why`) revealed after the user chooses. Like `question`, it gates the forward swipe.
- One clear idea per card; follow the Lesson Design Principles (§13).

**To add a philosopher:** add the object to the right file in `data/extra-philosophers/*` (name, lifespan, era, oneLiner, bio, areas, branchSlugs, 4–6 quotes) and **exactly 3 facts** to the matching `*-facts.ts`. It flows into `ALL_PHILOSOPHERS` / `PHILOSOPHER_FACTS` automatically.

**Validation:** there is **no runtime lesson-contract check yet** — `tsc` verifies types, not the hook-first/summary-last/≥1-question rules. A validation script is a P3 roadmap item; follow the contract by hand until then.

**Cinematic lessons have their own rule book:** [`docs/LESSON_RULES.md`](docs/LESSON_RULES.md) — figure scale and proportion, reach and joint rules, motion and end-poses, band/deck/box/wrap clipping, and the text-must-match-the-picture rule. Read it before authoring a cinematic lesson and run its Part 3 checks before calling one done.

---

## 12. Current Status

**Phase 4 — content complete, polishing.** The app is far past the original scaffold:

- **Content:** all 6 branches seeded — **~60 lessons** (1 path × 10 lessons each). **~255 philosophers** with bios, eras, 4–6 quotes, and 3 "Did you know?" facts apiece.
- **Lessons:** 8 card types live; 3 interactions (multiple-choice, true-false, sort); swipe pager with question/dilemma gating; animated `LessonReward` (XP count-up + streak).
- **Gamification:** 50 badges (`data/badges.ts`), 25 ranks (`data/ranks.ts`), XP + level curve, daily streak (StreakFlame + week row).
- **Screens:** Home, Branches→Path→Lesson, Thinkers (directory + bottom-sheet profiles), Stats (sketch charts), Profile, Settings (full multi-section panel), Scholar's Pass paywall, daily quote widget, saved-quotes collection.
- **Identity:** hand-drawn black-and-white "paper-and-ink" editorial aesthetic (SketchIcon/Glyph, Playfair + Inter), light theme only.

**Known gaps / tech debt:**
- Only **1 path per branch** (the original vision was ~10 paths/branch) — depth is the main content lever left.
- **`fill-blank` and `match` interactions are unimplemented** (type-only).
- **Built but not wired into lessons:** cinematic story scenes (`story/`), voice narration (`KineticNarration`), and the `feedback/` panels.
- **Haptics** (`expo-haptics`) is a dependency but never called in the runner.
- **XP model is unreconciled** — see §7.
- **Supabase progress is dormant** — all progress is local (§4).

---

## 13. Lesson Design Principles (north star)

> ⚠️ **Before writing or changing any cinematic lesson, read [`docs/LESSON_RULES.md`](docs/LESSON_RULES.md).**
> That is the binding rule book — 51 numbered rules in seven groups (truth of the
> picture · the figure · motion · nothing hidden · questions · writing · engine), an
> authoring checklist, and the five exact verification checks. Every rule in it exists
> because a real lesson broke it and it was caught on a real phone. This section is the
> *why*; that file is the *how*, with the numbers.
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
3. **Breadth** — 6 branches, ~255 thinkers — is a genuine library.
4. **Credential & mastery** — ranks + path-mastery give visible proof of progress.
5. The **daily habit** (streak + review) makes the subscription part of a routine.

---

## 15. Ideas Backlog / Roadmap (prioritized)

**P0 — Daily Review (spaced repetition).** The retention engine and the strongest reason to subscribe. Resurface concepts from completed lessons on a spacing schedule via quick `multiple-choice` / `true-false` / `reinforcement` prompts; add a "Review" entry on Home; completing a review counts toward the streak. Track per-concept last-seen + strength in `userDataStore`.

**P0 — New interactions + sensory polish.**
- Implement **`fill-blank`** and **`match` / Philosopher-Match** (match a quote to its thinker, reusing the ~255-philosopher DB to tie lessons back to the Thinkers tab). Wire both into `QuestionCard.tsx`.
- Add **haptics** (`expo-haptics`: light on correct, warning on incorrect, success on lesson complete) and **subtle sound** (page-turn on swipe, ink-scratch on reveal, soft chime on correct) — gated behind a Settings sound/haptics toggle.

**P1 — Finish the orphaned premium machinery.** Wire the cinematic **story scenes** (`SnowWalkStory`, `ExistenceStory`) in as a path's hook or capstone; ship a **"Read to me"** narration toggle (`KineticNarration`); and decide to either **show** the `feedback/` panels in the runner or delete them.

**P2 — Content depth & growth loops.** Add more **paths per branch** (e.g. Logic → Fallacies, Critical Thinking; Ethics → Applied Ethics, Metaethics). Add **path-mastery quizzes** (use `XP_PER_PATH_MASTERY`). Add **shareable B&W quote/streak cards** for a growth loop.

**P3 — Foundations.** Reconcile the XP model (§7); add a **lesson-contract validation script** (enforce hook-first / summary-last, 4–10 cards, ≥1 question/dilemma, exactly one correct MC answer); revisit Supabase for multi-device sync.

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
