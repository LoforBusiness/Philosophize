# Brief for a lesson redesigner — three existing dialogue lessons (2026-10-05)

> The owner, 2026-10-05, after the drawn objects of the sixth lessons (LESSON_RULES AM13):
> *"I also want you to improve the designs of past lessons, like you did for these seven
> subjects, where you take more reference photos and you see when there's just shapes or
> there's a cluttered design or the design of anything on screen doesn't look very good.
> Either doesn't look like how it should, or it could just be improved with more gamified
> look. A better working UI or animations with the objects. Because I really want improved
> artwork and improved objects with more gamification look to them … make sure that letters
> aren't cut off at any point."*
>
> And on the same day: *"on the table where it says one coin, the end of coin is slightly
> cut off. And I've noticed this for other words, where they'll be slightly cut off on the
> right side."* That is LESSON_RULES **AQ2**, new today: read it before you start.

You are redesigning THREE lessons that already exist and are already voiced. The lesson's
words, timing, questions and sound stay exactly as they are; what changes is everything a
reader SEES on the stage. Read in full before you touch anything:

- `docs/LESSON_RULES.md` groups **AM** (AM13 above all), **AQ** (AQ1 and AQ2), **AR**, **AG**,
  **AH**, **AL**, **AP18** and **AT7**, and the checklist at the end of **AP12**.
- `docs/superpowers/plans/2026-10-04-sixth-lessons-scene-brief.md` — the house techniques,
  the checks, the harness commands. Everything in it holds unless this page says otherwise.
- The three new things in the code since then: `components/lesson/cinematic/LessonPicture.tsx`,
  `scripts/make-lesson-art.mjs`, and the drawings in `scripts/lib/lessonart/hist6Carving.mjs`
  and `props.mjs` — the standard a drawing is held to (hist6's carving, phil6's carousel
  horse, sci6's hammocks, econ6's wreck).

## Your lessons

| you | stems | Chrome CDP port | route prefix |
|---|---|---|---|
| A1 | phil1 phil2 phil3 | 9411 | `previewra1` |
| A2 | phil4 phil5 phil6 | 9412 | `previewra2` |
| B1 | psych1 psych2 psych3 | 9413 | `previewrb1` |
| B2 | psych4 psych5 psych6 | 9414 | `previewrb2` |
| C1 | growth1 growth2 growth3 | 9415 | `previewrc1` |
| C2 | growth4 growth5 growth6 | 9416 | `previewrc2` |
| D1 | biz1 biz2 biz3 | 9417 | `previewrd1` |
| D2 | biz4 biz5 biz6 | 9418 | `previewrd2` |
| E1 | econ1 econ2 econ3 | 9419 | `previewre1` |
| E2 | econ4 econ5 econ6 | 9420 | `previewre2` |
| F1 | sci1 sci2 sci3 | 9421 | `previewrf1` |
| F2 | sci4 sci5 sci6 | 9422 | `previewrf2` |
| G1 | hist1 hist2 hist3 | 9423 | `previewrg1` |
| G2 | hist4 hist5 hist6 | 9424 | `previewrg2` |

Lesson ids are `<subject>-foundations-N` (philosophy, psychology, personal-growth, business,
economics, science, history). Metro is on port **8861**, serving this worktree. Do the three
lessons one after the other, finishing each (checks green, sheets looked at) before the
next.

## What to do, per lesson

1. **Look at it as it is.** Render every beat:
   `WEB_PORT=8861 CDP_PORT=<port> BEAT_ROUTE=<prefix><stem> BEAT_TAG=<stem>-before node scripts/sheet-beats.mjs <id> <beat count>`
   and Read the PNG. Also draw its library objects at the size the scene uses them:
   `SIZE=22 npm run sheet:lesson-objects -- <keys…>`.
2. **Write down what is weak**, with a reason each, before changing anything. Look for:
   - **a thing built from shapes that does not look like the thing** — an animal, a person
     in a picture, a tree, a vehicle, a building, food, a machine, anything with curves.
     AM13: draw it as curves against a reference and bake it.
   - **clutter** — too many small things competing, labels crowding, objects overlapping,
     no clear subject. Cut, group and simplify; one subject a beat.
   - **flat, ungamified UI on the stage** — plates and tap targets that are bare outlines or
     flat boxes. The house look (group AG, `stageSkin.ts`): struck plates on a hard ledge, a
     lit top edge, a pill shadow under what stands, rounded corners, one light from the top
     left. A thing you tap must look tappable and must REACT when tapped: right and wrong
     each get their own clear, physical answer (a pop and settle, a stamp, a shake, a
     thing falling into place), not just a colour change.
   - **dead or cheap animation with objects** — things that appear instead of arriving,
     slide at constant speed, stop dead, or pass through each other. Anticipation, then
     the move with easing, then a settle (a small squash or overshoot on landing); weight
     on things set down; nothing teleports (`carry`); hands meet what they hold (group AR).
   - **cut-off letters** — `REPLAY_ONLY=<id> node scripts/check-replay.mjs` lists every
     `CLIPPED` label (AQ2). Fix them all, by giving the Text a content box wider than its
     ink — NEVER with padding, which Android clips inside of.
3. **Fetch references** for everything you redraw: `npm run ref "<query>"` (Wikimedia
   Commons, to `scratchpad/ref/`), then Read the PNG. Several per object. Commons rate-limits
   after a burst (HTTP 429): space your searches, wait a minute when refused, and never
   fall back to drawing from memory. Name the reference in a comment beside the drawing.
4. **Redraw.** A curved or detailed thing becomes a drawing in your lesson's OWN module,
   `scripts/lib/lessonart/lessons/<stem>.mjs` (create it; export `ART`, an array of
   `{ name: '<stem>-…', svg: () => '<svg body>', view: {x,y,w,h}, box: {x,y,w,h} }` — see
   `index.mjs` for the shape). Bake ONE picture at a time with
   `node scripts/make-lesson-art.mjs <name>` and place it with `<LessonPicture name="…" />`.
   The house drawing look: flat fills lit from the top left, a shaded side, one dark
   outline, real colours (`NATURAL`-style); no gradients, no glows. Something whose parts
   move separately stays parts or is a picture per part. A rigid simple thing (a crate, a
   cup, a sign) may stay `objects.ts` parts, but make it look like the real thing.
5. **Improve the motion and the answers** where step 2 found them weak, keeping every action
   on the same moment of its line (the sound cues are timed to them).
6. **Check, then look again.** Render every beat afresh (`BEAT_TAG=<stem>-after`) and Read
   it; look CLOSE at both questions answered right AND wrong. Then sweep for unreadable
   words on your own port:
   `echo '["<id>"]' > scratchpad/<stem>-ids.json` and
   `CDP_PORT=<port> WEB_PORT=8861 LANES=1 READ_ROUTE=<prefix>read node scripts/check-readable.mjs scratchpad/<stem>-ids.json`
   and fix anything it reports.

## Checks you run — green for YOUR lessons

```
npx tsc --noEmit
REPLAY_ONLY=<id> node scripts/check-replay.mjs        (AQ1, AQ2, AR1, AR4, AR5, N21, C20c, cuts)
node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON scripts/check-dialogue.mjs
node scripts/check-smooth.mjs   node scripts/check-still.mjs   node scripts/check-idle.mjs
node scripts/check-turn.mjs     node scripts/check-fits.mjs    node scripts/check-legible.mjs
node scripts/check-shade.mjs    node scripts/check-objects.mjs node scripts/check-scale.mjs
node scripts/check-props.mjs    node scripts/validate-worklets.mjs
node scripts/check-answers-shape.mjs   node scripts/check-camera.mjs
node scripts/check-lesson-art.mjs      node scripts/check-sfx.mjs
```

Ignore `validate-cinematic`'s stale must-box stamps for your lessons (the coordinator
re-measures everything at the end) and other people's failures. Fourteen people are editing
this tree at once: a failure in a lesson that is not yours is not yours to fix. Stay under
about 700 Views a scene.

## Do not

- commit, push, `git add`, publish, or run `npm run check`;
- run `measure:must`, `make:tours`, `make:gaze`, `make:plates` (G2 may, for hist5 only), any
  other `make:*` generator than `make-lesson-art.mjs <one name>`, `render-narration`, or
  anything that spends voice characters;
- change any `text`, `speaker`, `pace`, `quote`, `summary`, `interact.prompt`/`explain`,
  `dur`, `bed`, `sfx`, or the number or order of beats in a script. You MAY edit a script's
  channel fields and its `act` doc comment;
- edit any file other than your lessons' scenes, their scripts' channels, your lessons'
  `lessonart/lessons/<stem>.mjs`, the PNGs those bake, and your lessons' own keys between
  their markers in `objects.ts` (keep those edits small: a key prefixed with your stem). If
  a shared file must change, STOP and say so in your report;
- start or stop Metro or Chrome, or touch another person's route or port.

## Report back, short

Per lesson: what you found weak and what you changed (one line each), the references you
looked at, the pictures you baked, any action whose moment moved (so the coordinator can
move its sound cue), every check's result including `check:readable`, and the path of the
final beat-sheet PNG. Keep the report under 40 lines a lesson.
