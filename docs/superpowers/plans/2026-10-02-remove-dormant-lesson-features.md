# Brief — remove the dormant narrated-lesson features and the broken dev tools (2026-10-02)

The owner: *"you can remove those two next. Just be sure that you're not accidentally
removing things that I have in current lessons."* Philosophy's 246 narrated lessons were
deleted earlier today (commit fd32464d). The app now holds 21 DIALOGUE lessons
(`*-foundations-1..3` on seven roads; scenes `phil1…hist3` in
`components/lesson/cinematic/`). Several player layers existed only for the narrated
lessons; no dialogue lesson uses them (the generators skip any script whose beats carry a
`speaker`, AP8). Remove them, and the dev tools that only served the deleted lessons.

## Where you work

- ONLY in `C:\Users\landy\Documents\Philosophize-hands` (git worktree, branch
  `lesson-hands`). NEVER touch `C:\Users\landy\Documents\Philosophize` — another session
  may work there.
- Metro (8881) and headless Chrome (9401) are running for this worktree; do not start or
  stop them.
- Do NOT commit, push, publish, or run `measure:must`, `render-narration` or anything
  that spends voice characters. Do not `git add -A`.
- Write scripts and regexes with the Write/Edit tools: heredocs and `node -e` eat
  backslashes and backticks in this shell.

## PART 1 — remove these layers, with everything that is theirs alone

1. **Thought bubbles** (group AB): `data/lessonThoughts.ts`, the `Thought` component and
   its use in `CinematicPlayer.tsx` (the `bubbles` list, `spot`, `figX`/`figTr` if only
   the bubbles use them), `quipFor`/`visitorSays` in `quips.ts` if nothing else uses them,
   `thoughtsOff` in `tourFlag.ts` if nothing else uses it, `scripts/make-thoughts.mjs`,
   `scripts/check-thoughts.mjs`, `scripts/check-bubble.mjs`, `scripts/pick-bubble-work.mjs`.
2. **Pen marks** (group AE): `data/lessonMarks.ts`, `StageMark.tsx`, the `marks` list in
   the player, `scripts/make-marks.mjs`, `scripts/check-marks.mjs`, `scripts/lib/marks.mjs`,
   `scripts/audit-marks.mjs`, `scripts/countertest-marks.mjs`.
3. **Wander** (group AF): `data/lessonWander.ts`, `wander.ts`, `WANDER`/`wanderReset` in
   `cinematicKit.tsx` and the player, the wander step inside `lookPose`,
   `scripts/make-wander.mjs`, `scripts/check-wander.mjs`, `scripts/lib/wanderrule.mjs`,
   `scripts/sheet-wander.mjs`, `scripts/shot-wander.mjs`, `scripts/countertest-wander.mjs`.
4. **The lawn chair and mug** (group AO): `data/lessonChair.ts`, `chairPlay.ts`,
   `ChairArt.tsx`, `lawnChair.ts`, `chairRoutine.ts`, `CHAIR`/`chairReset` in the player,
   the chair prop in `Stickman.tsx` (`useHasProp`), `scripts/make-chair.mjs`,
   `scripts/check-chair.mjs`, `scripts/sheet-chair.mjs`, `scripts/countertest-chair.mjs`.
5. **The visiting second figure** (AA8): `data/lessonVisitor.ts`, `Visitor.tsx`, `VISIT`
   in `cinematicKit.tsx`, the player's `visitorCue`, `visitorOff`, the `VISIT` resets in
   the lesson and review routes, `scripts/make-visitor.mjs`, `leadFacing`
   (`REPLAY_FACING`) if only `make:visitor` reads it, and check-replay's VISITOR rule.
6. **The costume rotation** (AA1–AA4, AA7): `data/lessonWardrobe.ts`, `wardrobeContext.tsx`
   / `WardrobeProvider` (Stickman then uses `wear ?? []`), `scripts/make-wardrobe.mjs`,
   the rotation rules in `scripts/check-wardrobe.mjs`, and the must-box reach bookkeeping
   that only the rotation needed (`wardrobeReach`/`poseReach` in `mustBoxes.ts.json`,
   `seed-pose-reach`, `regrow-pose`) — **after checking what reads them**.
7. **The card runner**: `LessonRunner.tsx`, `CardShell`, `components/lesson/cards/`,
   `components/lesson/interactions/`, and the lesson route's fallback to it (a lesson id
   not in `CINEMATIC` then opens nothing, as a retired id already does). Anything in
   those folders that a dialogue lesson, the unit review or the player imports STAYS —
   check every import first.

For each: delete the files, take the imports and the code paths out of the player and the
kit, remove its npm scripts from `package.json` and from the `check` chain, and fix
anything that read it.

## WHAT STAYS — a dialogue lesson uses these (verify, do not assume)

- `wardrobe.ts` and every costume PIECE: the cast wears them (`wear={BY_ID.….pieces}` in
  every dialogue scene), and AA6's seating/geometry rules in `check-wardrobe` stay with
  them (only the ROTATION rules go). `cast.ts`, `SpeakerTag`.
- `objects.ts` whole, including `kitchenChair` and every `NATURAL` colour (growth2 draws
  two kitchen chairs; they are not the lawn chair).
- `tourFlag.ts`'s `wanderOff()` is read by `useLinger.ts`, which every dialogue scene uses:
  it is the measuring harness's switch, not the wander. Keep it (rename only if you
  update every reader).
- The camera, `tours.ts`, `mustBoxes`, `gazeTargets`, `make:tours`, `make:gaze`,
  `lookPose`/`reactPose` and `REACT`/`LEAD_HEAD` (gaze and the nod are not in the list:
  strip only the wander and chair steps out of `lookPose`), narration, `SpeakerTag`,
  every answer control, `Target`, `useLinger`, `pace.ts`, `interact.ts`, `moves.ts`,
  `rig.ts`, `Stickman.tsx` (minus the chair prop), the unit-review machinery
  (`review/`), `LESSON_FOCUS`/`ThinkerPeek`/names (phase 2), footfall/swish tracks
  (silent but not in the list).
- Anything a dialogue scene imports. Before deleting any file, grep the 21 scenes,
  scripts, the player, the routes and `app/` for it.

## PART 2 — the dev tools that only served the deleted lessons

Find every script in `scripts/` that (a) names a deleted lesson id or file
(`grep -lE "(aesthetics-aesthetics|ethics-ethics|logic-arguments|metaphysics-being|epistemology-knowledge|political-political)-[0-9]+|(logic|ethics|metaphysics|epistemology|aesthetics|political|valid|strong|knowHow)[0-9]*(Scene|Script|Set)"`),
or (b) imports a file deleted today or in Part 1, or (c) is a generator/codemod for the
narrated library (`liven-*`, `spread-lessons`, `split-beats`, `carry-tracks`, the
`restamp-*` one-offs, `prose-worklist`, `rotation-worklist`, `still-worklist`,
`survey-lessons`, `lesson-dossier` …). For each, decide:
- **Delete** when it only served the deleted lessons or deleted layers.
- **Keep and fix** when it is a general tool the dialogue lessons still use (e.g.
  `sheet-beats`, `measure-must`, `check-replay`, `check-readable`, `countertest-*` for a
  check that stays): replace a deleted-lesson fixture with a dialogue lesson, and run it
  to prove it works.
List every decision with one line of reason in your report.

## PROOF THAT NOTHING CURRENT CHANGED (all required)

1. **Scene frames identical**: before you start, nothing — the baseline is already at
   `C:/Users/landy/AppData/Local/Temp/claude/c--Users-landy-Documents-Philosophize/4f568529-9b2b-4fca-97c9-d98373c5948d/scratchpad/dormant/dump-before.json`.
   When done: `REPLAY_DUMP=<that dir>/dump-after.json node scripts/check-replay.mjs` and
   compare the two files — they must be byte-identical (if `check-replay`'s own code
   changed the dump's shape, explain exactly why and show the per-lesson frames still
   match).
2. `npx tsc --noEmit` exit 0; `npm run check` exit 0 (capture to a file, read `$?`, never
   through a pipe); `npm run check:bible` exit 0; `node scripts/check-rules.mjs` clean.
3. **The docs**: the rule book cites commands, script paths and constants, and
   `check-rules` fails one that no longer exists; CLAUDE.md's validator list is checked by
   `check:bible`. Mark each removed group (AA rotation/visitor, AB, AE, AF, AO) with ONE
   dated line (`> **REMOVED 2026-10-02** with the narrated library; kept as a finding.`)
   and un-cite the deleted commands/paths (plain text, not code spans) rather than
   rewriting the findings. Update CLAUDE.md's validator list and count, the §3 tree, and
   the §23 "The old library is deleted" bullet (its last sentence says this machinery is
   still in the player — it no longer is).
4. Re-run the import-reachability scan
   (`UROOT=C:/Users/landy/Documents/Philosophize-hands node C:/Users/landy/AppData/Local/Temp/claude/c--Users-landy-Documents-Philosophize/4f568529-9b2b-4fca-97c9-d98373c5948d/scratchpad/unused.mjs`)
   and report anything newly orphaned.

## Report back

What you removed (files, npm scripts, check-chain entries), what you kept that looked
dormant and why, every dev-tool decision, the proof results (with the dump comparison),
and anything you were unsure of.
