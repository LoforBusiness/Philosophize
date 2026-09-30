# Brief for a scene builder — one intro dialogue lesson (2026-09-30)

You are building ONE lesson's animated scene for Ashmere, a stickman learning app.
The owner holds up `economics-foundations-1` ("What Is Economics?", a market stall)
as the standard: "I love the simplicity of it. I love the voices. I love how the
animations work … This is how I want future lessons to be made for all subjects."
Your scene must be built exactly the way that one is.

## Read first (all of it matters)

- `components/lesson/cinematic/econ1Scene.tsx` and `econ1Script.ts` — THE model. Copy
  its structure: `useHeld`/`carryFrom`/`keepHeld` per figure, `useCarry` + `carry` +
  `carrySource` for every track, the `walkOf` helper (a figure walks from WHERE HE IS
  ON SCREEN), `hand()` via `reachHandTo`, `lineOf`/`stage`/`bump` from `pace.ts` to pace
  every act across the voiced line, `Rider` for objects that move with hands,
  `Target` for the two questions, `useLinger`, `followMoves` camera, band, header
  comment stating the composition in numbers.
- Your lesson's script: `components/lesson/cinematic/<stem>Script.ts` (the `act`
  docs say what happens on each beat).
- `components/lesson/cinematic/cast.ts` (who wears what), `wardrobe.ts` (`BY_ID`),
  `objects.ts` (the object library and `NATURAL` colours), `ObjectArt.tsx`, `pace.ts`,
  `interact.ts` (`reachHandTo`), `Target.tsx`, `stageSkin.ts`, `stageTones.ts`.
- `docs/LESSON_RULES.md`: group AP (lines ~10842–11057, dialogue lessons), AM
  (~10465, objects drawn from references), AH (~9933, every tap changes the picture),
  AL (~10357, nothing bobs up and down on a clock), L (~2397, nothing teleports),
  S (~5283, words fit their boxes, nothing laid over a word), T (~5506, tonal mass),
  E41 (~5872, one place to answer), H57–H60 (~4626).

## What you deliver

1. `components/lesson/cinematic/<stem>Scene.tsx` — replace the PLACEHOLDER. Keep the
   exported `<Cap>Lesson` component name and signature.
2. New objects in `components/lesson/cinematic/objects.ts`, ONLY directly above your
   own marker line `// ── <stem>: objects for this lesson go ABOVE this line ──`, and
   registered in `OBJECTS` on your own `// <stem>:` line. A real-world colour goes in
   `NATURAL` on your own `// <stem> colours:` line. Other sessions are editing the same
   file at the same time: re-read before each edit and touch nothing outside your
   markers.
3. You MAY edit your own script's channel fields (`act`, flags, add a flag) and its
   `act` doc comment. You may NOT change any `text`, `markup`, `speaker`, `quote`,
   `summary`, `interact.prompt`/`explain`, `dur`, or the number/order of beats — every
   spoken line is already recorded in a voice, keyed by beat index.

## The rules that make it look like the economics lesson

- **One real place**, few objects, each one REAL: before drawing any object, fetch
  references — `node scripts/get-reference.mjs <slug> "<search>" 3` (try
  `KIND=filetype:bitmap` for photos) — and LOOK at them with the Read tool. Draw in
  `objects.ts`'s parts/roles vocabulary (study existing entries like STALL, PIE, LOAF,
  APPLE). Check each with `npm run sheet:objects <name> …` and Read the PNG; iterate
  until it reads as the thing at lesson size. An object nobody touches is decoration.
- **Real colours** for things known by their colour (AP11): `tint(parts, key)` with a
  `NATURAL` entry; never a hex in the scene. Plates, floor and diagrams stay in the
  lesson's stage tone (`stageTone('<branch>')`).
- **The cast** (AP2, AP13): each figure `<Stickman … wear={BY_ID.<costume>.pieces} />`
  (plain → `wear={[]}`), with a `{/* cast: <speaker> */}` comment on the line before.
  Costumes: tophat → `magistrate`, cap → `stroller`, bun → `bun`, plain → none.
  Nothing else is drawn on a figure's body. Nobody on stage who never speaks.
- **Staging** (AP4, AP7, AP10, group Y): at most two figures move at once; each faces
  whom he is talking to (the teacher may face the reader); listeners hold a listening
  pose that is alive but still (see econ's TALK/EXPLAIN/LISTEN/NOD/LEAN codes);
  hands MEET what they hold (`reachHandTo`; safe reach ≈ 23 stage units from the
  shoulder at the econ scale `K = K_FIG * 0.76`); an object passes hand to hand at a
  point both arms reach; a counter or table sits at the HIP; the teacher walks in on
  `arrive` from off the frame and tips his hat.
- **Motion through the whole line** (AH, pace.ts): every spoken beat's act runs
  across the measured length of its line — the lines are in
  `lib/narration/manifest.ts` under your lesson id (`dur` per beat index). Build a
  `LINES` array like econ's (0 for non-spoken beats). Every non-question tap changes
  the picture (check:still). Carry every track (group L) — a tap mid-act must never
  jump. Nothing on a clock moves a figure up and down (AL).
- **Questions** (E41, AP6, group O): two, both answered by tapping things ON THE
  STAGE with `Target` (`radius` for round things, `sealAt`), gated exactly like
  econ's `CostTargets`/`PriceTargets` (`on(Q)`, `live={Q[i] === 1}`,
  `disabled={answered}`). The correct answer is the one the beat's `explain` names.
  Nothing on stage may give the answer away before it is picked. Labels on targets
  must fit (check:fits) and be at least 8pt as drawn (check:legible).
- **Words on the stage** are few, short and legible; nothing is laid over a word.

## Checks you run (all offline unless noted) — fix everything about YOUR scene

```
npx tsc --noEmit
REPLAY_ONLY=<id> node scripts/check-replay.mjs
node scripts/check-smooth.mjs          node scripts/check-still.mjs
node scripts/check-idle.mjs            node scripts/check-turn.mjs
node scripts/check-fits.mjs            node scripts/check-legible.mjs
node scripts/check-shade.mjs           node scripts/check-objects.mjs
node scripts/check-scale.mjs           node scripts/check-props.mjs
node scripts/validate-worklets.mjs     node scripts/check-answers-shape.mjs
node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON scripts/check-dialogue.mjs
node scripts/validate-cinematic.mjs
```

`validate-cinematic` will say your lesson has no measured must-boxes and that card
decks are over budget while other scenes are still placeholders: IGNORE those two (the
coordinator measures every lesson at the end). Fix anything else it says about your
scene. Other lessons' failures are not yours.

**Look at it** — this is the instrument that matters. Metro is already running on
port 8861 and a headless Chrome on your CDP port:

```
WEB_PORT=8861 CDP_PORT=<your port> BEAT_ROUTE=<your route> BEAT_TAG=<stem> node scripts/sheet-beats.mjs <id> <beat count>
```

It writes a PNG strip of every beat (path printed); Read it. Iterate until every beat
reads clearly: the place is recognisable, the objects are the things they name, the
people are doing what the words say, nothing overlaps a word, nothing floats. Do NOT
start or stop Metro or Chrome, and use only your own route name and port. If the page
reports "This screen doesn't exist", wait and rerun (the route file is written on
demand).

## Do not

- commit, push, `git add`, publish, or run `npm run check` (the whole suite);
- run `measure:must`, `make:*` generators, or anything that rewrites shared tables;
- edit any file other than your scene, your script's channels, and your markers in
  `objects.ts`. If you believe a shared file must change, STOP and say so in your report.

## Report back

The composition (what stands where, in stage units), the objects you added and the
references you looked at, what each beat shows, every check's result, the path of your
final beat-sheet PNG, and anything you were unsure of.
