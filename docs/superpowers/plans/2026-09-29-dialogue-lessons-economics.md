# Dialogue Lessons + Economics Lesson 1 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a new "dialogue lesson" format (three stickmen speak in three fixed Chirp 3 HD voices, face tag under the stage) and use it for Economics & Finance's first lesson, "What Is Economics?", with Economics made live as one course.

**Architecture:** A zero-import `cast.ts` is the single source of speaker → costume → voice. `BaseBeat.speaker` drives a face tag in the player's deck; each line is rendered in its speaker's voice and still packed into the lesson's one `lesson.mp3`. A new `economics` branch (BranchKey) holds one unit and one lesson; philosophy-only invariants are scoped to philosophy. Player layers built for narrated lessons stay off because generators skip dialogue lessons (`scripts/lib/dialogue.mjs`). A new `check:dialogue` holds the format's rules (group AP).

**Tech Stack:** Expo RN, Reanimated 4, react-native-svg (posters only), the cinematic rig (`rig.ts`, `moves.ts`, `objects.ts`), Google Chirp 3 HD through `scripts/lib/ttsledger.mjs`, Node validators.

**Spec:** docs/superpowers/specs/2026-09-29-dialogue-lessons-economics-design.md

## Global Constraints

- Voices, fixed: tophat → `en-GB-Chirp3-HD-Algieba`; plain → `en-GB-Chirp3-HD-Sadachbia`; cap → `en-AU-Chirp3-HD-Zubenelgenubi`. Every request through `openLedger().spend(...)`; month cap 900,000; report the ledger after rendering.
- Costumes, fixed: tophat → `magistrate` (top hat only); cap → `stroller` (newsboy cap); plain → no pieces.
- Every drawn object has a fetched reference (`npm run ref`), is drawn in `objects.ts` roles (no hex in scenes), and is looked at on `npm run sheet:objects` before use.
- No `order` control; both questions are stage taps (`Target`).
- Never publish or push without the owner saying so in that message. Stage explicit paths; never `git add -A`; never commit `app/preview*`.
- Scripts LF only. Regexes written with the editor, not through a shell heredoc.
- Philosophy's six branches keep every invariant they have today (41 lessons each, level, cards, reviews).
- Art tasks cannot carry final code in the plan: their contract is the acceptance criteria and the instruments named (sheet, replay, readable), iterated until clean.

## Review Focus

1. A reader on the Economics page with the professor's intro unseen: the intro card is philosophy's — Economics must list its course directly, not demand the philosophy intro.
2. Back/forward through the lesson: the face tag must follow `shown` (the beat on screen), never lag or flash the previous speaker.
3. A take whose voice disagrees with its beat's speaker must be refused by install-narration (a mis-voiced line is the silent failure this format invites).
4. Existing 246 lessons: no `speaker` → deck renders byte-identically (no tag, no layout shift).
5. Road end: after lesson 1 the figure walks to the "MORE COMING SOON" sign and it is not tappable; a finished course does not crash `firstUndone`.

---

### Task 1: `cast.ts`, `BaseBeat.speaker`, and `check:dialogue` (skeleton)

**Files:**
- Create: `components/lesson/cinematic/cast.ts` (zero imports)
- Modify: `components/lesson/cinematic/cinematicKit.tsx` (BaseBeat)
- Modify: `scripts/lib/marks.mjs` (add `speaker` to `PROSE`)
- Create: `scripts/lib/dialogue.mjs`, `scripts/check-dialogue.mjs`, `scripts/countertest-dialogue.mjs`
- Modify: `package.json` (`check:dialogue`, append to `check`)

**Interfaces:**
- Produces: `type Speaker = 'tophat' | 'cap' | 'plain'`; `CAST: Record<Speaker, { costume: 'magistrate'|'stroller'|'plain'; voice: { name: string; languageCode: string; rate: number }; label: string }>`; `BaseBeat.speaker?: Speaker`; `isDialogue(lessonId): boolean` and `dialogueLessons(): string[]` in `scripts/lib/dialogue.mjs` (a lesson is a dialogue lesson when its script has any `speaker:` field).

- [ ] Write `cast.ts`:
```ts
// THE CAST OF A DIALOGUE LESSON — who speaks, what they wear, and with whose voice.
// Zero imports, so scripts read it in plain Node. A voice is locked to a costume
// (LESSON_RULES AP2): no line names a voice; the renderer reads it from here.
export type Speaker = 'tophat' | 'cap' | 'plain';
export const SPEAKERS: readonly Speaker[] = ['tophat', 'cap', 'plain'];
export const CAST = {
  tophat: { costume: 'magistrate', label: 'Top hat', voice: { name: 'en-GB-Chirp3-HD-Algieba', languageCode: 'en-GB', rate: 0.95 } },
  cap:    { costume: 'stroller',   label: 'Cap',     voice: { name: 'en-AU-Chirp3-HD-Zubenelgenubi', languageCode: 'en-AU', rate: 1.0 } },
  plain:  { costume: 'plain',      label: 'Plain',   voice: { name: 'en-GB-Chirp3-HD-Sadachbia', languageCode: 'en-GB', rate: 1.0 } },
} as const;
/** The voice every non-dialogue lesson is read in. */
export const NARRATOR_VOICE = { name: 'en-GB-Chirp3-HD-Algieba', languageCode: 'en-GB', rate: 1 } as const;
```
- [ ] Add `speaker?: import('./cast').Speaker;` to `BaseBeat` with a doc comment; add `'speaker'` to `PROSE` in `scripts/lib/marks.mjs` (a speaker change is not a stage event — check:still/idle must still demand the picture change).
- [ ] Write `check-dialogue.mjs` rules, each failing with a named message: (a) every spoken beat in a dialogue lesson has `speaker` ∈ SPEAKERS; (b) the lesson's scene forces each figure's costume with `wear=` matching CAST (by speaker comment `// cast: <speaker>` on each `<Stickman`); (c) no `order:` block; (d) no row for the lesson in `data/lessonThoughts.ts`, `lessonMarks.ts`, `lessonWander.ts`, `lessonChair.ts`, `lessonVisitor.ts`, `lessonWardrobe.ts`; (e) every `renders.json` record for the lesson carries `voice` equal to CAST[speaker].voice.name, and every record for a non-dialogue lesson carries none or NARRATOR_VOICE.name.
- [ ] Countertest stages each defect on a COPY (env `DIALOGUE_ROOT`), asserts each is caught by its own rule and the clean tree passes. Run: `node scripts/countertest-dialogue.mjs` → all staged defects caught, clean passes.
- [ ] `npm run check:dialogue` → passes (no dialogue lessons yet → "0 dialogue lessons"). Add to `check` after `check-subjects`. Commit.

### Task 2: Speaker tag in the player

**Files:** Create `components/lesson/cinematic/SpeakerTag.tsx`; modify `CinematicPlayer.tsx` (deck render ~L1689, `Fade` revision), `cinematicKit.tsx` styles.
- [ ] SpeakerTag draws a small struck disc with the speaker's head (the rig head + the costume's head piece, same pieces `wardrobe.ts` draws, scaled into a 26dp disc — Views, not SVG) and the label, inline before the narration line. Coloured by the stage tone; ink on white disc (contrast ≥ 4.5:1).
- [ ] Render `{beat.speaker ? <SpeakerTag who={beat.speaker} /> : null}` beside `cite`, keyed on `i` so it follows the shown beat (Review Focus 2).
- [ ] Non-dialogue lessons: nothing rendered (Review Focus 4). Verify with a preview route on `ethics-ethics-1` (tag absent) — delete the route after.
- [ ] tsc 0; commit.

### Task 3: Voice pipeline — per-speaker voice, recorded and enforced

**Files:** Create `scripts/render-narration.mjs`; modify `scripts/install-narration.mjs`, `scripts/lib/narration.mjs` (`writeRenders` keeps `voice`; pace band per voice if the new voices fall outside 0.09–0.5).
- [ ] `render-narration.mjs <lessonId> <outDir> [beat…]`: reads the lesson's spoken beats (`spoken()`), picks `CAST[beat.speaker].voice` or `NARRATOR_VOICE`, sends `{input:{markup}, voice:{name, languageCode}, audioConfig:{LINEAR16, 24000, speakingRate}}` through `ledger.spend(...)` (token via gcloud ADC as `scratchpad/welcome/render.mjs` does; project header `x-goog-user-project: app-narration`), writes `<outDir>/<lesson>/beat-NN.wav` and a `job.json` whose items carry `voice`. Markup = the beat's text with authored pauses (`[pause short]` allowed in an optional `beat.markup`; if absent, text).
- [ ] install-narration: refuse an item whose `voice` ≠ expected voice for its beat (Review Focus 3); record `voice` in renders.json.
- [ ] Test: `node scripts/install-narration.mjs <job with wrong voice> <dir> --dry-run` → REFUSED naming the beat. Commit.

### Task 4: The economics course in the data and the app

**Files:** `constants/design.ts` (BranchKey + BRANCH hue), `data/subjects.ts` (live, courses, COURSE_LINE), `data/branches/economics/index.ts`, `data/branches/economics/paths/foundations/index.ts`, `data/branches/economics/paths/foundations/lessons/what-is-economics.ts`, `data/index.ts` (ALL_BRANCHES), `components/lesson/cinematic/questionTone.ts`, `stageTones.ts` (PREFIX `econ`→economics), `components/shared/branchMarks.ts`, `constants/branchArt.ts` / branch masthead fallback, `app/(app)/branches/[branchSlug]/index.tsx` (trailing signpost), `app/(app)/branches/subject/[subjectSlug].tsx` (intro card only for philosophy; "1 COURSE" singular), `components/subjects/SubjectTile.tsx` (singular), `data/types.ts` (`Branch.more?: boolean`).
- [ ] Choose the economics BRANCH hue with a script that searches the Economics subject hue family for a colour passing check-ui's floors (≥4.5:1 on paper and surface, L* band, C* 12–30, ΔE ≥ 11 from all six). Record the measured numbers in the comment.
- [ ] Lesson data file `economics-foundations-1` with a card fallback (hook, concept, question with one correct MC, quote `lq-economics-foundations-1-1` Robbins, summary) — passes validate-lessons.
- [ ] Road: after the last lesson of a branch with `more: true`, push `{id:`${slug}-more`, title:'MORE COMING SOON', unit fields of the last unit, done:false, accessible:false, signpost:true}`.
- [ ] Subject page: the professor's intro gate applies to philosophy only (Review Focus 1).
- [ ] tsc 0.

### Task 5: Scope the philosophy-only checks

**Files:** `scripts/validate-cinematic.mjs` (level/count invariants over philosophy dirs; SOLID_FLOOR → 247), `scripts/check-ui.mjs` (six philosophy branches + economics; keys = dirs), `scripts/check-subjects.mjs` (live set = philosophy, economics; course lines/pills), `scripts/check-review.mjs` (units of philosophy branches only), `data/lessonMentions.ts` via `npm run make:mentions`, `scripts/check-echo.mjs` if it trips.
- [ ] Each change is a scoping, never a loosening for philosophy: counter-verify by temporarily breaking a philosophy invariant and seeing it still fail.
- [ ] `npm run check > log; echo $?` → 0 except checks owed by later tasks (narration: UNVOICED until Task 8 — wire the CINEMATIC entry only in Task 7).

### Task 6: The market objects

**Files:** `components/lesson/cinematic/objects.ts`, `scripts/check-objects.mjs` roll if it lists objects.
- [ ] From the fetched references (`scratchpad/ref/econ-*`), add: `awning` (striped scalloped valance over two poles), `pie` (dish, fluted rim, lattice top), `loaf` (domed boule, three scores), `note` (banknote: portrait oval left, big numeral right, border), `chalkboard` (framed A-board with ledge), `apple` (round, dimple, stalk, leaf). Reuse `table`, `crate`, `book`, `coin`.
- [ ] `npm run sheet:objects awning pie loaf note chalkboard apple` → look; iterate until each reads as the thing at lesson size (Z-group rule). `npm run check:objects` → 0.
- [ ] Commit.

### Task 7: Script and scene — econ1

**Files:** Create `components/lesson/cinematic/econ1Script.ts`, `econ1Scene.tsx`, (`econ1Set.ts` if the set grows); modify the lesson route's CINEMATIC map.
- [ ] Script: 11 beats per the spec table, `// Theme:` line unique, `export interface Econ1Beat extends BaseBeat`, each spoken beat `speaker`, `text` written for the ear (AC/AD, check:ear), two `interact` questions with `prompt`, `explain`, `xp: 5`, one Robbins quote beat (not first, not last, not graded), summary last. Channels that CHANGE on every non-question tap (check:still budget 0).
- [ ] Scene: stall set centre-right; three `<Stickman … wear={BY_ID.<costume>.pieces} />` each tagged `// cast: <speaker>`; speaker faces the listener or the reader and plays a talk gesture; listeners take listening holds; ≤ 2 figures move per beat; the note, the change and the chalk are drawn at the hand that holds them (hand position from the stance) so they pass hand to hand; Q1 Targets on pie/note/book (round radius on the pie), Q2 Targets on three chalk marks on the board; `stageAnswered` gating (E41). Band measured; header states the composition in numbers (H56).
- [ ] Wire `'economics-foundations-1': Econ1Lesson` in CINEMATIC. `npm run measure:must -- economics-foundations-1` (own route if another session is live), then `make:tours`, `make:gaze`. Generators that must skip it (thoughts, marks, wardrobe, chair, visitor, wander) skip via `dialogue.mjs`.
- [ ] Verify: `npm run sheet:beats economics-foundations-1`, `LANES=1 npm run check:readable -- economics-foundations-1`, `npm run check:replay`, `check:smooth`, `check:still`, `check:idle`, `check:fits`, `check:legible`, `check:shade`. Iterate until clean and it LOOKS right.
- [ ] Commit.

### Task 8: Voice it

- [ ] Write each spoken line's markup (pauses) and read it aloud against AC rules; `node scripts/tts-ledger.mjs` (record before).
- [ ] `node scripts/render-narration.mjs economics-foundations-1 <scratch>` → WAVs; look at each waveform (bursts, stalls); retake any fault with a changed request.
- [ ] `node scripts/install-narration.mjs <job> <dir>`; add to `LESSONS`; `FFMPEG=<scratch ffmpeg> node scripts/encode-narration.mjs`; `node scripts/make-narration.mjs`; `npm run check:narration` → 0.
- [ ] `node scripts/tts-ledger.mjs` → report used / 900,000.
- [ ] Commit.

### Task 9: Rules and docs

- [ ] `docs/LESSON_RULES.md`: group AP (AP1–AP8 from the spec) with the checker each is held by; `npm run check:rules` → 0.
- [ ] CLAUDE.md: §11 validator list gains `check-dialogue`; §5/§12 counts where they state totals (247 cinematic, 1 economics); §23 Economics live with one course and the dialogue format. `npm run check:bible` → 0.
- [ ] Commit.

### Task 10: Final verification

- [ ] `npm run check > log 2>&1; echo $?` → 0.
- [ ] Render the lesson beat sheet and the Economics page / road; send to the owner. State it is local until published.
- [ ] Update memory. Do not publish or push.
