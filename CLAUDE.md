# Philosophize — Project Bible

> Philosophy as gameplay, not lecture. Interactive micro-lessons that make thinking feel like a superpower.

---

## 1. Project Overview

**Philosophize** is a Duolingo-style mobile philosophy learning app for iOS and Android. It makes philosophy interactive, visual, and gamified — using micro-lesson cards, XP systems, streaks, and curiosity-driven progression instead of walls of text.

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
| State (server) | TanStack Query | v5 | Progress, XP, streak data from Supabase |
| Backend | Supabase | latest | PostgreSQL + Auth + Row Level Security |
| Auth storage | AsyncStorage | latest | Persists Supabase auth session on device |
| Icons | @expo/vector-icons | built-in | Ionicons throughout the app |
| Fonts | @expo-google-fonts | latest | Playfair Display (headings) + Inter (body) |
| Validation | Zod | latest | API boundary validation only |
| Date math | date-fns | latest | Streak calculation |
| Haptics | expo-haptics | latest | Correct/incorrect/achievement feedback |

**Why NOT:**
- Redux over Zustand: too verbose for simple session state
- Firebase over Supabase: Supabase has PostgreSQL for relational progress queries + RLS
- MUI/Chakra over NativeWind: opinionated defaults fight the custom philosophy aesthetic

---

## 3. Repository Layout

```
Philosophize/
├── app/                    # Expo Router routes (file = screen)
│   ├── _layout.tsx         # Root: fonts, providers, auth guard
│   ├── index.tsx           # Landing / onboarding
│   ├── (auth)/             # Login + signup (no tab bar)
│   └── (app)/              # Authenticated tab shell
│       ├── index.tsx       # Dashboard
│       ├── branches/       # Branch + path + lesson navigator
│       ├── profile/        # User stats + achievements
│       └── achievements/   # Full achievements list
├── components/
│   ├── lesson/             # LessonRunner + 6 card types + interactions
│   ├── gamification/       # XPBar, StreakDisplay, DailyGoalRing, etc.
│   ├── curriculum/         # BranchCard, PathNode, LessonRow
│   └── shared/             # Loading, empty states, confetti
├── data/                   # Curriculum content (TypeScript, version-controlled)
│   ├── types.ts            # ALL type definitions — the load-bearing file
│   ├── index.ts            # ALL_BRANCHES array + helper functions
│   └── branches/           # One folder per branch, one folder per path
├── stores/                 # Zustand stores (lessonStore, uiStore)
├── lib/
│   ├── supabase/           # client.ts, auth.ts, progress.ts
│   └── utils/              # xp.ts, streak.ts, progress.ts
├── constants/              # Colors.ts, xp.ts, achievements.ts
├── supabase/migrations/    # SQL migration files
└── global.css              # Tailwind base/components/utilities import
```

---

## 4. Architecture Decisions

**Content in TypeScript files first, not Supabase:**
Curriculum content lives in `data/branches/` as strongly-typed TypeScript files. This keeps content in version control, enables build-time type checking via `tsc`, and avoids API calls during the lesson experience. Content can migrate to Supabase later for CMS-driven updates.

**Reanimated 4 vs Moti boundary:**
- Use **Reanimated directly** for gesture-driven interactions (drag-to-sort, swipe)
- Use **Moti** for declarative enter/exit animations (feedback panels, XP popups, toasts, card transitions)
- Never mix both animation systems on the same component

**Zustand for session / TanStack Query for server:**
- `lessonStore` (Zustand): card index, answers, session XP — ephemeral, reset on lesson end
- `uiStore` (Zustand): modal visibility, pending achievements
- Progress/XP/streak data: TanStack Query hitting Supabase — cached, auto-invalidated after lesson completion

**Card components are static imports, not dynamic:**
`LessonRunner` uses a `switch` on `card.type` to render the correct component. All 6 card components are statically imported. This avoids dynamic import waterfalls inside the lesson screen and ensures zero loading delay between cards.

---

## 5. Curriculum Data Model

### The Critical File: `data/types.ts`

All curriculum types are defined here. The key pattern is **discriminated unions** on the `type` field.

```typescript
// CardData is a discriminated union — TypeScript narrows by card.type
type CardData = HookCard | ConceptCard | ExampleCard | QuestionCard | ReinforcementCard | SummaryCard;

// InteractionData is a nested discriminated union inside QuestionCard
type InteractionData = MultipleChoiceInteraction | TrueFalseInteraction | SortItemsInteraction | FillBlankInteraction | MatchInteraction;
```

### Card Sequence Contract
Every lesson MUST:
- Start with a `HookCard`
- End with a `SummaryCard`
- Have between 4 and 10 cards total
- Have at least one `QuestionCard`
- Have exactly one correct answer in every `MultipleChoiceInteraction`

### Content Limits
| Card Type | Max Words |
|---|---|
| HookCard headline | 12 words |
| ConceptCard body | 60 words |
| ExampleCard scenario | 80 words |
| QuestionCard prompt | 25 words |
| ReinforcementCard body | 50 words |
| SummaryCard key point | 12 words each |

---

## 6. Database Schema Reference

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

| Reward | Amount |
|---|---|
| XP per correct answer | 5 |
| XP per lesson completion | 25 |
| XP per perfect lesson (100% score) | +25 bonus = 50 total |
| XP per path mastery | 100 |

**Level formula:** Level N requires `Math.floor(50 * N * Math.sqrt(N))` total XP.

**Streak:** Maintained by completing at least one lesson per calendar day. Alive if `last_activity_date` is today or yesterday.

**Stars:** 100% score = 3 stars. ≥70% = 2 stars. Any completion = 1 star.

**Achievements:** 20 defined in `constants/achievements.ts`. Each has an `id`, `name`, `description`, `icon`, `xpBonus`, and `category`.

---

## 8. Development Commands

```bash
# Start dev server (shows QR code for Expo Go)
npm start

# Start on Android emulator
npm run android

# Start on iOS simulator (macOS only)
npm run ios

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
- **Styling:** NativeWind utility classes via `className` prop. Use `Colors` constants for dynamic styles that NativeWind can't handle.
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

---

## 12. Current Status

**Phase 1 ✅** — Project scaffolded, dependencies installed, NativeWind configured, design tokens set, types written, Logic branch seeded (3 lessons).

**Phase 2 🔄** — App screens being built (root layout, auth, lesson runner, card components).

**Phase 3 ⏳** — Gamification UI + Supabase wiring.

**Phase 4 ⏳** — Full content for all 6 branches + polish.

**Known limitations:**
- Supabase keys not yet configured (add to `.env.local`)
- Only Logic → Arguments path has lesson content
- SortItems + PhilosopherMatch interactions not yet implemented
