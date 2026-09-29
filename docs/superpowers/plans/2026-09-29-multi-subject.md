# Multi-subject Ashmere (Phase 1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn Ashmere from a philosophy app into a seven-subject app: a subject carousel on Home, a subject grid on Learn, a subject page per subject (Philosophy's lists its six branch roads, the rest show a stickman road ending at a Coming-soon signpost), four tabs, and the Thinkers/quote surfaces outside lessons removed.

**Architecture:** One data list (`data/subjects.ts`) drives Home and Learn. Subject and branch drawings live in one zero-import module (`components/subjects/subjectArt.ts`) built on the lesson object parts (`objects.ts` part types, drawn by `ObjectArt`), so a plain-Node sheet can render them for approval. The Learn tab keeps its route name `branches`; a static `subject/[subjectSlug]` route is added inside it, and every entry from outside the stack goes through `components/lesson/lessonNav.ts`.

**Tech Stack:** Expo Router 56.2 (nested Stack with `anchor`, `withAnchor`, `dismissTo`), React Native Views, Reanimated 4, Moti, Zustand, plain-Node check scripts (`scripts/check-*.mjs`) run by `npm run check`.

**Spec:** `docs/superpowers/specs/2026-09-29-multi-subject-design.md`

## Global Constraints

- Subjects, in this order: Philosophy (live) · Psychology · Personal Growth & Self-Help · Business & Leadership · Economics & Finance · Science & Technology · History & Politics (all `soon`).
- Tab bar: exactly four tabs — Home · Learn · Pass · Profile. The tab icons themselves are unchanged.
- Route name for the Learn tab stays `branches`. No lesson id, unit id or branch slug changes.
- Progress is shown as a count (`N DONE`), never "N of M" (CLAUDE.md §19).
- No hex literal in any new component: colours come from `constants/design.ts`, `components/shared/tone.ts`, `stageToneOf()`, or `data/subjects.ts` (the one place a subject hue is declared).
- Subject hues: tame (chroma inside the palette's band), clear of the green verdict wedge (hue 130–175), and no two closer than ΔE 11.4 (the floor `design.ts` holds the branch hues to). Philosophy's hue is `DEEP` (`#2A4343`).
- Depth kit only: flat faces, `C.edge` borders, hard ledges (`Card`, `lipOf`), no gradients on new surfaces, no full-card or full-screen `<Svg>` (§19 GPU rule).
- The stickman never bobs on a clock (group AL); the Coming-soon road reuses `BranchWorld`, which already obeys this.
- Do NOT edit: any `components/lesson/cinematic/*Scene.tsx` or `*Script.ts`, `rig.ts`, `portal.ts`, `mustBoxes.*`, `tours.ts`, `gazeTargets.ts`, `data/lessonThoughts.ts`, `data/lessonWander.ts`, `data/lessonWardrobe.ts`, `components/gamification/*`, `components/welcome/*`, `scripts/check-replay.mjs`, `scripts/check-streak.mjs` — other sessions own them.
- Commits stage only this plan's files (`git add <paths>`, never `git add -A`). Never run `eas update` / `eas build`.
- Any `app/preview*.tsx` made for screenshots is deleted before committing (`check:routes`).
- Run the suite as `npm run check > "$SCRATCH/check.log" 2>&1; echo $?` — never through a pipe (§21).

## Review Focus

1. **Back from a branch road entered from outside the stack** (Home's Continue card → lesson → reward lands on the branch → back). Expected: the Philosophy page, then the Learn grid — never Home, never a Learn tab stuck on one branch. Pinned in Task 6.
2. **The intro not yet watched.** Expected: Philosophy page shows the intro card and hides the six branches; Home's Continue card opens the intro; finishing or skipping the intro from the Learn side lands on the Philosophy page. Pinned in Tasks 5 and 6.
3. **A 320-wide phone.** Expected: no subject name ("Personal Growth & Self-Help" is the long one) truncated or clipped in a grid tile, a carousel card or a masthead. Pinned in Task 3 (offline `.ttf` measure) and Task 10 (render).
4. **The widget's thinker deep link after the Thinkers tab is gone.** Expected: the app opens on Home with that thinker's sheet open, not a missing route. Pinned in Task 8.
5. **An old install whose settings still hold the removed quote-card keys.** Expected: `sanitizeSettings()` drops them on load and nothing crashes. Pinned in Task 9.

---

### Task 1: The subject catalogue and its check

**Files:**
- Create: `data/subjects.ts`
- Create: `scripts/check-subjects.mjs`
- Modify: `package.json` (add `check:subjects`, and append `&& node --import ./scripts/lib/register.mjs scripts/check-subjects.mjs` to `check`, before `check-rules`)

**Interfaces:**
- Produces:
  ```ts
  export type SubjectSlug = 'philosophy' | 'psychology' | 'personal-growth' | 'business' | 'economics' | 'science' | 'history';
  export interface Subject {
    slug: SubjectSlug;
    name: string;          // display name
    short: string;         // name for a narrow tile/card; equals name unless too long
    blurb: string;         // one line
    hue: string;           // the subject's colour
    status: 'live' | 'soon';
    courses: readonly string[]; // branch slugs (BranchKey) for live subjects; [] for soon
  }
  export const SUBJECTS: readonly Subject[];
  export function getSubject(slug: string): Subject | undefined;
  export function subjectOfBranch(branchSlug: string): Subject | undefined;
  ```

- [ ] **Step 1: Write the failing check.** `scripts/check-subjects.mjs`, in the house style (an `ok(cond, label, detail)` helper, a fail count, `process.exit(fails ? 1 : 0)`), importing `@/data/subjects`, `@/constants/design` and `@/components/lesson/cinematic/stageTones` through `scripts/lib/register.mjs` exactly as `check-pass.mjs` does:
  ```js
  const S = await import('@/data/subjects');
  const D = await import('@/constants/design');
  const T = await import('@/components/lesson/cinematic/stageTones');
  const want = ['philosophy','psychology','personal-growth','business','economics','science','history'];
  ok(JSON.stringify(S.SUBJECTS.map((s) => s.slug)) === JSON.stringify(want), 'subjects are the seven, in the owner\'s order');
  ok(S.SUBJECTS.filter((s) => s.status === 'live').map((s) => s.slug).join() === 'philosophy', 'only philosophy is live');
  for (const s of S.SUBJECTS) {
    ok(s.name && s.short && s.blurb, `${s.slug} has name, short and blurb`);
    ok(/^#[0-9A-F]{6}$/i.test(s.hue), `${s.slug} hue is a hex`);
    if (s.status === 'soon') ok(s.courses.length === 0, `${s.slug} is coming soon and lists no course`);
    for (const c of s.courses) ok(c in D.BRANCH, `${s.slug} course ${c} is a real branch`);
    const [L, a, b] = T.lab(s.hue); const C = Math.hypot(a, b); const h = ((Math.atan2(b, a) * 180) / Math.PI + 360) % 360;
    ok(!(h >= 130 && h <= 175), `${s.slug} hue is clear of the verdict wedge`, `h ${h.toFixed(0)}`);
    ok(C <= 38, `${s.slug} is tame`, `C* ${C.toFixed(1)}`);
  }
  for (let i = 0; i < S.SUBJECTS.length; i++) for (let j = i + 1; j < S.SUBJECTS.length; j++) {
    const d = T.deltaE(S.SUBJECTS[i].hue, S.SUBJECTS[j].hue);
    ok(d >= 11.4, `${S.SUBJECTS[i].slug} and ${S.SUBJECTS[j].slug} are told apart`, `ΔE ${d.toFixed(1)}`);
  }
  ok(S.getSubject('philosophy')?.courses.length === 6, 'philosophy lists the six branches');
  ok(S.subjectOfBranch('ethics')?.slug === 'philosophy', 'a branch knows its subject');
  ```
- [ ] **Step 2: Run it.** `node --import ./scripts/lib/register.mjs scripts/check-subjects.mjs` → FAIL (module not found).
- [ ] **Step 3: Write `data/subjects.ts`.** Zero imports except `import type { BranchKey } from '@/constants/design'`. Start hues from these candidates (from the owner's family, spread across it), and adjust in the check's output until every rule passes:

  | slug | name / short | blurb | hue (start) | courses |
  |---|---|---|---|---|
  | philosophy | Philosophy | Reality, knowledge, right and wrong | `#2A4343` (DEEP) | metaphysics, epistemology, logic, ethics, aesthetics, political-philosophy |
  | psychology | Psychology | How minds think, feel and decide | `#4E5578` (dusk slate-violet) | — |
  | personal-growth | Personal Growth & Self-Help / Personal Growth | Habits, focus and a better you | `#6E7A4A` (moss) | — |
  | business | Business & Leadership / Business | Leading people and building things | `#7A5A2E` (bronze) | — |
  | economics | Economics & Finance / Economics | Money, markets and why prices move | `#3A6E86` (harbour blue) | — |
  | science | Science & Technology / Science & Tech | How the world works, and what we built | `#2F6F73` (lab teal) | — |
  | history | History & Politics / History | Power, people and how we got here | `#8E5646` (brick) | — |

  `getSubject` is a `find` by slug; `subjectOfBranch` finds the subject whose `courses` include the slug. Order of philosophy's courses is today's Learn order.
- [ ] **Step 4: Run the check** → PASS. If a ΔE pair fails, move the lighter/darker of the pair by lightness first, then hue, and re-run. Paste the final ΔE table into a comment at the top of `data/subjects.ts`.
- [ ] **Step 5: Run `npx tsc --noEmit`** → exit 0.
- [ ] **Step 6: Commit** `git add data/subjects.ts scripts/check-subjects.mjs package.json` — `feat: the seven subjects, one list`.

### Task 2: The drawings — and the owner's approval (GATE)

**Files:**
- Create: `components/subjects/subjectArt.ts` (zero runtime imports; `import type { ObjPart } from '@/components/lesson/cinematic/objects'` only)
- Create: `components/subjects/SubjectArt.tsx`
- Create: `scripts/sheet-subjects.mjs`; add `"sheet:subjects": "node scripts/sheet-subjects.mjs"` to `package.json`
- Reference pictures: `npm run ref -- "<query>"` (Wikimedia Commons), read with the Read tool before drawing.

**Interfaces:**
- Consumes: `SubjectSlug`, `SUBJECTS` (Task 1); `oEll/oRect/oBar/oTri` part shapes and `Role` from `objects.ts` (re-declare the four constructors locally, as `objects.ts` does for `Silhouette`, so this file keeps zero runtime imports); `ObjectArt` and `stageToneOf(hue)`.
- Produces:
  ```ts
  // subjectArt.ts — every drawing in a 100×100 design box, lamp top-left.
  export type ArtKey = SubjectSlug | 'metaphysics' | 'epistemology' | 'logic' | 'ethics' | 'aesthetics' | 'political-philosophy';
  export const ART: Record<ArtKey, readonly ObjPart[]>;
  export function artIn(key: ArtKey, x: number, y: number, w: number, h: number): ObjPart[]; // lays the 100-box into the LARGEST SQUARE inside w×h (never stretched — OddOneOut's `squareIn` lesson)
  // SubjectArt.tsx
  export default function SubjectArt(props: { art: ArtKey; hue: string; size: number; style?: ViewStyle }): JSX.Element;
  ```
  `SubjectArt` renders `<ObjectArt parts={artIn(art, 0, 0, size, size)} tone={stageToneOf(hue)} />` inside a `size × size` View, plus one small EMBER spark (a `tri` or `ell` part of role `lit` tinted `EMBER` via a separate absolute View) in the top-right third — the tab-icon language.

- [ ] **Step 1: Fetch references**, one per scene, and look at each before drawing: classical marble bust; open book three-quarter; head silhouette profile; thought bubble cartoon; seedling sprout; stair steps; leather briefcase; bar chart; stack of coins; stock price line chart; Erlenmeyer flask; Bohr atom model; Doric column; parchment scroll rolled; balance scale; interlocking gears; eye illustration; infinity/orbit (metaphysics: a planet with a ring); gem/picture frame (aesthetics: an easel with a canvas); flag on a pole / forum (political: a flag and a podium).
- [ ] **Step 2: Draw the 13 scenes** in `subjectArt.ts` as part lists, each a two-object still life on a short ground ledge (a `rect` of role `face` across the bottom 12%), the principal object ≥ 55% of the box height, the second object smaller and overlapping behind or beside it. State the reference's construction in a comment above each (the `objects.ts` rule). Scenes:
  - philosophy — bust (head `ell`, neck `rect`, socle `rect`, hair band `line`) + open book (two leaves as `tri`/`rect` falling from a V gutter)
  - psychology — head in profile (skull `ell`, jaw `rect` rotated, neck) + thought bubble (three `ell` trailing discs, one large cloud of 4 `ell`)
  - personal-growth — three stair blocks rising left→right + a sprout (stem `bar`, two `ell` leaves) on the top step
  - business — briefcase (body `rect` rad, flap `rect` face, handle `bar`, clasp `lit`) + three rising bars behind it with an arrow `tri`
  - economics — stack of 4 coins (`ell` rims over `rect` edges) + a price line (3 `bar` segments rising, dot `ell` at the end)
  - science — flask (neck `rect`, body `tri` up with liquid `face` band) + atom (nucleus `ell`, two orbit rings as thin `ell` rotated ±35°, marks role `line`)
  - history — Doric column (capital, fluted shaft with 3 `line` flutes, base) + rolled scroll (`rect` sheet with `ell` rolls each end)
  - metaphysics — planet with a ring (`ell` + rotated thin `ell`) over a small plinth
  - epistemology — open eye (almond from two `tri`, iris `ell`, pupil `line`) over an open book
  - logic — two interlocking gears (`ell` + 8 `rect` teeth each)
  - ethics — balance scale (post `bar`, beam `bar`, two pans `ell` on `bar` chains)
  - aesthetics — easel (three `bar` legs) with a canvas `rect` and a sun `ell` painted on it (`lit`)
  - political-philosophy — podium `rect`/`face` with a flag on a pole (`bar` + `tri` right)
- [ ] **Step 3: Write `scripts/sheet-subjects.mjs`** by copying `sheet-objects.mjs`'s loader (`load()` with sucrase, `rasterpath.mjs`, Jimp) and its painting of `ObjPart` roles; draw each `ART` key at 240×240 on its subject/branch hue's tile (`stageToneOf(hue)`), plus each at 96×96 (the size a grid tile uses), labelled, into `$TMP/subjects-sheet.png`. Branch keys use `BRANCH[key]`, subject keys `getSubject(key).hue`.
- [ ] **Step 4: Run `npm run sheet:subjects`**, Read the PNG, and correct anything that reads as the wrong object (the `objects.ts` header lists how the last batch failed: a hull as a bowl, a lamp as a road sign). Repeat until every drawing reads as its name at 96px.
- [ ] **Step 5: GATE — send the sheet to the owner** (SendUserFile) with one line per drawing, and STOP. Do not start Task 3 until the owner approves; apply their corrections and re-send.
- [ ] **Step 6: Run `npx tsc --noEmit`** → exit 0. Add to `check-subjects.mjs`: every `ArtKey` exists in `ART`, every part lies inside 0..100 after `artIn(key,0,0,100,100)`, and every subject slug has art. Run it → PASS.
- [ ] **Step 7: Commit** `git add components/subjects/subjectArt.ts components/subjects/SubjectArt.tsx scripts/sheet-subjects.mjs scripts/check-subjects.mjs package.json` — `feat: drawn scenes for the seven subjects and six branches`.

### Task 3: The three tile components

**Files:**
- Create: `components/subjects/SubjectTile.tsx` (square grid tile; `wide` variant for Philosophy's full-width tile)
- Create: `components/subjects/SubjectCard.tsx` (Home carousel card)
- Create: `components/subjects/BranchCard.tsx` (a philosophy branch on the Philosophy page)
- Modify: `scripts/check-subjects.mjs` (text-fit rule)

**Interfaces:**
- Consumes: `Subject` (Task 1), `SubjectArt` / `ArtKey` (Task 2), `Card` (`tone`, `ledge`, `onPress`, `containerStyle`, `accessibilityLabel`), `lipOf`, `C`, `TYPE`, `StatSticker`.
- Produces:
  ```ts
  SubjectTile(props: { subject: Subject; done: number; size: number; wide?: boolean; onPress: () => void })
  SubjectCard(props: { subject: Subject; done: number; width: number; onPress: () => void })
  BranchCard(props: { slug: BranchKey; name: string; desc: string; units: number; done: number; onPress: () => void })
  // shared: components/subjects/tag.tsx
  export function DoneTag({ done }: { done: number }): JSX.Element | null; // "N DONE" pill with StatSticker, null when 0
  export function SoonTag(): JSX.Element;                                 // "COMING SOON" pill
  ```
  All three: a `Card` with `tone="paper"`, `ledge={lipOf(hue)}`, the art on a flat face tinted `stageToneOf(hue).RULE`, the name in `TYPE.title` ink, and a `DoneTag` or `SoonTag`. `SubjectTile` shows `short` when `size < 180`, else `name`. `SubjectCard` shows art (≈55% of card height), `name`, `blurb`, and the tag. `BranchCard` shows its drawing, the branch name, `desc`, and `N UNITS` plus `DoneTag`.
- [ ] **Step 1: Add the failing fit rule** to `check-subjects.mjs` using `scripts/lib/ttfwidth.mjs` (as `check-fits.mjs` does): for each subject, the string a tile shows at the 320dp grid width (tile inner width = `(320 - 2*20 - 12) / 2 - 2*12` = 118) at `TYPE.title`'s font and size fits on at most two lines; the carousel card's `name` fits one line at `320*0.78 - 32`. Run → FAIL (no components yet; the rule reads the widths from constants exported by `SubjectTile.tsx`: `export const TILE_PAD = 12, GRID_GAP = 12`).
- [ ] **Step 2: Build the three components and `tag.tsx`.** No hex literals; pressed state comes from `Card`.
- [ ] **Step 3: Run `check-subjects`** → PASS. If "Personal Growth & Self-Help" fails, it already uses `short`; if `short` fails, lower the tile title to `TYPE.label` at that width.
- [ ] **Step 4: `npx tsc --noEmit`** → 0.
- [ ] **Step 5: Commit** `git add components/subjects scripts/check-subjects.mjs` — `feat: subject tiles, carousel cards and branch cards`.

### Task 4: Learn — the subject grid

**Files:**
- Modify (rewrite): `app/(app)/branches/index.tsx`

**Interfaces:**
- Consumes: `SUBJECTS`, `SubjectTile`, `branchCountsFromUnits`, `openSubject` (Task 6 — until then use `router.push(\`/(app)/branches/subject/${slug}\`)`).
- Produces: nothing new.

- [ ] **Step 1: Rewrite the screen.** Keep `ScreenTransition`, the top bar (`ASHMERE · LEARN`) and `LearnPlate` is removed (it draws the six branch shelf). Body: a `ScrollView`, Philosophy as `SubjectTile wide` (full width, `done` = sum of `branchCountsFromUnits(lessonsByUnit)` over its courses), then the other six in a two-column row-wrap grid (`flexDirection: 'row', flexWrap: 'wrap', gap: GRID_GAP`, tile `size = (width - 2*PAD - GRID_GAP) / 2`, `alignItems: 'flex-start'` so a wrapped row does not stretch a tile). Footer: "More subjects are on the way". Tapping any tile opens its subject page. The intro card and its gating move to Task 5 — this screen no longer reads `seenProfessorIntro`.
- [ ] **Step 2: Update `components/professor/openIntro.ts` `leaveIntro('learn')`** to `router.navigate('/(app)/branches/subject/philosophy' as never)` so a reader who watched the intro from the Philosophy page returns to it.
- [ ] **Step 3: `npx tsc --noEmit`** → 0; `node scripts/check-ui.mjs` — if a rule names `LearnPlate` or the branch cards on this screen, update that rule to the grid (it must still find the screen's accessibility labels) and note why in the rule's comment.
- [ ] **Step 4: Commit** `git add "app/(app)/branches/index.tsx" components/professor/openIntro.ts scripts/check-ui.mjs` — `feat: Learn is a grid of subjects`.

### Task 5: The subject page and the Coming-soon road

**Files:**
- Create: `app/(app)/branches/subject/[subjectSlug].tsx`
- Create: `components/subjects/SubjectMasthead.tsx`
- Create: `components/subjects/ComingSoonRoad.tsx`
- Modify: `components/branch/BranchWorld.tsx` (one optional `signpost` flag on `WorldLesson`, drawn as a post-and-board marker; no other change)

**Interfaces:**
- Consumes: `getSubject`, `BranchCard`, `SubjectArt`, `BranchWorld`/`WorldLesson`, `openIntro('learn')`, `getBranchBySlug`, `branchCountsFromUnits`, `useUserDataStore(s => s.seenProfessorIntro)`.
- Produces:
  ```ts
  SubjectMasthead(props: { subject: Subject; onBack: () => void })
  ComingSoonRoad(props: { subject: Subject }) // BranchWorld with ONE synthetic stop
  // WorldLesson gains: signpost?: boolean
  ```

- [ ] **Step 1: Masthead.** Back arrow (same `backRow` look as the branch screen), the subject's art at 120, name in `TYPE.display`, blurb in italic Playfair, on a flat face in the subject's `stageToneOf(hue).RULE` with a `C.edge` foot rule.
- [ ] **Step 2: Philosophy body.** If `!seenProfessorIntro`: the "Your first lecture" card moved verbatim from the old Learn screen (its `ImageBackground`/scrim/CTA, `nativeID="learn-intro"`, `openIntro('learn')`), and the six branches are not shown. Otherwise: six `BranchCard`s in course order, `done` from `branchCountsFromUnits`, units from `getBranchBySlug(slug).paths.length`, each pushing `/(app)/branches/${slug}` (a plain push is correct here — the stack is already `[grid, subject]`).
- [ ] **Step 3: Coming-soon body.** `ComingSoonRoad`: `<BranchWorld lessons={[stop]} current={0} onOpen={() => {}} place={FALLBACK_PLACE} />` where `stop = { id: \`${slug}-soon\`, title: 'COMING SOON', unitId: \`${slug}-soon\`, unitSlug: 'soon', unitTitle: subject.name, done: false, accessible: false, signpost: true }`. In `BranchWorld`, a `signpost` marker draws a post and a board reading its title instead of the lesson card, is not tappable, and never shows a lock. Under the road: "Courses for {name} are on the way." in italic Playfair. Read `BranchWorld`'s marker code first and confirm a one-stop road lays out (it walks to index 0); if `layout()` needs two markers, pass a leading invisible start marker rather than changing `layout`.
- [ ] **Step 4: Unknown slug** → render the masthead-less "Subject not found" line with a back arrow; never crash.
- [ ] **Step 5: Temporary preview.** `app/previewsubject.tsx` rendering the screen for `philosophy` (intro seen and not seen) and `psychology`, following `scripts/lib/previewpass.txt`'s pattern (release `launchDone`). Start a verification Metro on a free port (not 8847/8861/8869/8893, which other harnesses use), load it at 390×844 and 320×780 in headless Chrome, screenshot, Read the PNGs. Confirm: no clipped text, the stickman walks to the signpost and stands (not bobbing), the six branch cards show. Delete `app/previewsubject.tsx`.
- [ ] **Step 6: `npx tsc --noEmit`** → 0; `node scripts/check-walk.mjs` → PASS (BranchWorld touched).
- [ ] **Step 7: Commit** `git add "app/(app)/branches/subject" components/subjects/SubjectMasthead.tsx components/subjects/ComingSoonRoad.tsx components/branch/BranchWorld.tsx` — `feat: a page for every subject, and a road that ends at Coming soon`.

### Task 6: Navigation — into subjects, and back from a road

**Files:**
- Modify: `components/lesson/lessonNav.ts`
- Modify: `app/(app)/branches/[branchSlug]/index.tsx` (the back arrow only, line ~331)
- Modify: `scripts/check-nav.mjs`

**Interfaces:**
- Produces:
  ```ts
  export function openSubject(slug: SubjectSlug): void;  // router.push('/(app)/branches/subject/<slug>', { withAnchor: true })
  export function backFromBranch(branchSlug: string): void; // router.dismissTo('/(app)/branches/subject/<subjectOfBranch(slug).slug>')
  ```
  `dismissTo` pops to the subject page when it is in the stack (`[grid, subject, branch]` → `[grid, subject]`), and when it is not (`[grid, branch]`, reached from Home's Continue card or the reward's `landOnBranch`) it REPLACES the branch with the subject page → `[grid, subject]`. Both leave the grid underneath. This replace is of the BRANCH, never of the grid, so it does not reintroduce the defect `lessonNav`'s header records.
- [ ] **Step 1: Failing check.** In `check-nav.mjs` add: `lessonNav.ts` exports `openSubject` and `backFromBranch`; `openSubject` pushes with `withAnchor: true`; the branch screen's back arrow calls `backFromBranch` (not `router.back()`); no file outside the branches stack pushes `/branches/subject/` except through `openSubject`. Keep its existing "nothing here replaces" rule true by allowing `dismissTo` only inside `backFromBranch`, with the reason in a comment. Run → FAIL.
- [ ] **Step 2: Implement** both helpers and switch the Learn grid (Task 4) and the branch back arrow to them.
- [ ] **Step 3: Run `node scripts/check-nav.mjs`** → PASS.
- [ ] **Step 4: Replay against the real router** in a browser (a throwaway `app/previewnav.tsx` or the real app URL): (a) Learn → Philosophy → Ethics → back → back: Philosophy, then grid. (b) Load `/branches/ethics` directly, press back: Philosophy page with grid under it (press back again: grid). (c) From Home, `openSubject('psychology')`, back: Home; then the Learn tab shows the grid. Record the stack after each step. Delete the preview route.
- [ ] **Step 5: Commit** `git add components/lesson/lessonNav.ts "app/(app)/branches/[branchSlug]/index.tsx" scripts/check-nav.mjs` — `feat: subjects open from anywhere, and a road goes back to its subject`.

### Task 7: Home — header, Continue, subject carousel

**Files:**
- Modify (rewrite body): `app/(app)/index.tsx`
- Create: `components/home/SubjectCarousel.tsx`
- Modify: `components/home/QuickStartCard.tsx` (styling to the depth kit only, if it still uses the old flat border; keep its behaviour)

**Interfaces:**
- Consumes: `HomeHeader`, `QuickStartCard`, `SubjectCard`, `SUBJECTS`, `openSubject`, `branchCountsFromUnits`, `RatePromptHost`, `AddWidgetSheet`, `useWidgetPlaced`.
- Produces: `SubjectCarousel(props: {})` — a horizontal `FlatList` (`snapToInterval = cardW + gap`, `decelerationRate="fast"`, `cardW = width * 0.78`, contentInset so the first card starts at the page padding and the next one peeks), section heading "Subjects" in the `SectionHead` style.

- [ ] **Step 1: Rewrite Home**: `RuledPaper`, `HomeHeader`, `QuickStartCard` (Arrive 0), `SubjectCarousel` (Arrive 1), the Android add-widget prompt, `AddWidgetSheet`, `RatePromptHost`. Delete from this file: `QUOTE_POOL`, `DailyReflection`, `ThinkerOfTheDay`, `HabitCard`, `StickmanStroll`, `openPhilosopher`, the streak/rest/XP derivations only `HabitCard` used, and the `DailyQuoteWidget` home placement.
- [ ] **Step 2: Leave the component files** `DailyReflection.tsx`, `ThinkerOfTheDay.tsx`, `HabitCard.tsx`, `StickmanStroll.tsx` in place if anything else imports them (grep); delete any now imported by nothing, and delete `lib/utils/thinkerOfDay.ts` if unused.
- [ ] **Step 3: `npx tsc --noEmit`** → 0; run `check-ui.mjs`, `check-streak.mjs` (read-only for us — if it fails because Home no longer draws `HabitCard`, STOP: that check is another session's file; report it to the owner rather than editing it), `check-rate.mjs`, `check-events.mjs` → PASS or fix our own rules.
- [ ] **Step 4: Preview** Home at 390 and 320 (throwaway route or the real app with a seeded store), swipe the carousel via `scrollTo`, screenshot, confirm the next card peeks and snapping lands on a card edge. Delete the preview route.
- [ ] **Step 5: Commit** `git add "app/(app)/index.tsx" components/home` (only the files this task changed or deleted) — `feat: Home is the next lesson and a shelf of subjects`.

### Task 8: Four tabs — Thinkers removed

**Files:**
- Modify: `app/(app)/_layout.tsx` (remove the `philosophers` `Tabs.Screen`, drop `'philosophers'` from `WARM`, update the WARM comment about widget deep links)
- Delete: `app/(app)/philosophers/` (both files), `components/thinkers/`, `lib/utils/thinkerStats.ts` if unused afterwards
- Modify: `app/_layout.tsx:412-413` — `router.replace('/(app)')` always; if `pendingPhilosopherId` is set, open the sheet after landing: `useUIStore.getState().openPhilosopher(id)` then clear it.
- Modify: `app/thinker/[id].tsx` — redirect to `/(app)` and open the sheet the same way.
- Modify: `components/shared/TabIcon.tsx` — remove the `thinkers` name only if nothing else draws it (`StatSticker` uses `TabGlyph`; keep the glyph if it does).
- Modify: `scripts/check-ui.mjs:785-790,1091` (the WARM rule becomes `'index','branches',…,'pass','profile'` without `'philosophers'`; drop the deleted files from its list), `scripts/check-bible.mjs` (tab count), and any other check the grep in Step 1 finds.

- [ ] **Step 1: Grep** `grep -rn "philosophers'\|/philosophers\|components/thinkers\|thinkerStats" app components lib stores scripts` and list every hit.
- [ ] **Step 2: Update the checks first** (WARM rule, file lists) so they describe four tabs; run `node scripts/check-ui.mjs` → FAIL against the unchanged layout.
- [ ] **Step 3: Make the changes** above.
- [ ] **Step 4: Run** `npx tsc --noEmit`, `node scripts/check-ui.mjs`, `node scripts/check-nav.mjs`, `node scripts/check-routes.mjs` → PASS.
- [ ] **Step 5: Browser**: the bar shows four icons at 320 and 390; load `/thinker/<a real id>` → Home with that thinker's sheet open.
- [ ] **Step 6: Commit** the touched and deleted paths explicitly — `feat: four tabs; the Thinkers tab is gone`.

### Task 9: Quote surfaces outside lessons

**Files:**
- Modify: `app/(app)/profile/index.tsx` — remove the saved-quotes card (~line 656–680), the `profileQuote` block and `openSavedQuotes` header button (~473), and the thinker-score/branch-interest sections that exist only to rank thinkers by saved quotes and views (~231–246) if they render only on this screen. Keep every `useMemo` section's dependency list correct (§12 warning); re-run the §19 equivalence idea by screenshotting Profile before and after at the same seed.
- Modify: `app/(app)/settings.tsx` — remove the Quotes `MiniStat` (~479), "Clear Saved Quotes" (~1149–1173), and the quote-card display controls (`widgetEnabled`/`widgetPlacement` UI, ~734).
- Modify: `stores/userDataStore.ts` — delete `widgetEnabled` and `widgetPlacement` from `AppSettings`/`DEFAULT_SETTINGS` ONLY if nothing else reads them after Task 7 (the Android OS widget uses `components/widget/*`, not these); `sanitizeSettings()` then prunes them from old installs automatically. Keep `savedQuotes`, `philosopherViews` and `toggleQuote` in the store.
- Delete: `components/shared/SavedQuotesSheet.tsx`, `components/shared/DailyQuoteWidget.tsx` and their mounts/openers in `app/_layout.tsx` and `stores/uiStore.ts` (`openSavedQuotes`), if nothing else uses them.
- Modify: `lib/utils/passValue.ts` / `lib/utils/passCompare.ts` — drop the `thinkers` and `quotations` free tiles (and `quizzes` if it is a thinker quiz); keep `ranks`, `badges`, `streak`. Update `scripts/check-pass.mjs:280-313` to the new `IDS` list and remove the thinker/quote counts.
- Modify: `components/lesson/cinematic/cinematicKit.tsx` ~1996–2012 — stop passing `onToggleSave` to `QuotePlate` (read `QuotePlate` first: if the save control renders only when `onToggleSave` is given, omit it; otherwise add an optional `saveable?: boolean` prop defaulting `true` and pass `false`). No scene file changes.

- [ ] **Step 1: Failing checks.** In `check-pass.mjs` set `IDS` to the reduced list; add to `check-subjects.mjs`: `profile/index.tsx` and `settings.tsx` do not mention `SavedQuotes`/`savedQuotes`/`openSavedQuotes`; `cinematicKit.tsx` does not pass `onToggleSave`; `DEFAULT_SETTINGS` has no key nothing reads (reuse `check-ui`'s settings-reader rule if it exists). Add a sanitize test: `sanitizeSettings({ ...DEFAULT_SETTINGS, widgetPlacement: 'home', quoteCard: true })` returns only `DEFAULT_SETTINGS` keys. Run → FAIL.
- [ ] **Step 2: Make the changes.**
- [ ] **Step 3: Run** `npx tsc --noEmit`, `check-pass`, `check-subjects`, `check-ui`, `check-quotes`, `check-events` → PASS (if `check-quotes` counts the lesson quote card's save button, update its rule and say why in a comment).
- [ ] **Step 4: Browser**: Profile and Settings at 390 and 320 — no gaps where the removed sections were, nothing clipped; a lesson's quote beat shows the quotation with no save control.
- [ ] **Step 5: Commit** the touched paths explicitly — `feat: no saved quotes outside lessons; the Pass stops advertising them`.

### Task 10: The whole suite, the renders, and the bible

**Files:**
- Modify: `CLAUDE.md` — §1 (Ashmere is multi-subject), §3 (layout: `data/subjects.ts`, `components/subjects/`, `app/(app)/branches/subject/`, `philosophers/` gone, 4 tabs), §12 (Screens, Known gaps: Phase 2 list), §14 (free tier no longer lists thinkers/quotes), §11 validator list (+`check-subjects`). Short, factual additions; do not rewrite other sessions' sections.
- Modify: `scripts/check-bible.mjs` if its tab/validator counts need the new numbers.

- [ ] **Step 1: `npm run check > "$SCRATCH/check.log" 2>&1; echo $?`** → 0. Any failure in a file another session owns: STOP and report, do not edit it.
- [ ] **Step 2: `npm run check:bible`** → PASS.
- [ ] **Step 3: Renders for the owner** at 390×844 and 320×780: Home (carousel at rest and swiped once), Learn grid, Philosophy page (intro not seen, and seen), Psychology Coming-soon page, a branch road, Profile. Send them with SendUserFile.
- [ ] **Step 4: `git status`** — confirm no `app/preview*.tsx` of ours remains and nothing of the other sessions is staged.
- [ ] **Step 5: Commit** `git add CLAUDE.md scripts/check-bible.mjs docs/superpowers` — `docs: Ashmere is seven subjects`. Do not publish; tell the owner it is local until they ask for an update.
