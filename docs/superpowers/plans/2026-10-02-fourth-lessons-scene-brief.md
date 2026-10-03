# Brief for a scene builder — one FOURTH dialogue lesson (2026-10-02)

> Built on the third lessons' brief (`2026-10-01-third-lessons-scene-brief.md`) and the
> second lessons' brief (`2026-09-30-second-lessons-scene-brief.md`), which you must read
> in full: everything in them still holds, except where this page says otherwise. What
> changed since, in order of how often it would go wrong:
>
> 1. **GROUP AR IS NOW LAW, AND IT IS WHAT THE OWNER LOOKS AT FIRST** (LESSON_RULES
>    lines ~11373–11537). Read AR1–AR7 in full before drawing anything:
>    - **AR1: every object is drawn in the colours it really is**, from `NATURAL` in
>      `objects.ts` (`tint(parts, key)` or parts carrying `nat`). The branch stage tone is
>      ONLY for the floor, the plates a word sits on and the answer plates. A thing with
>      several colours has several entries. `check:replay` fails an object drawing whose
>      body is more than half the stage tone.
>    - **AR2: a thing is held where a person holds it** (the table in AR2), drawn about
>      its GRIP point, and that point rides the wrist every frame (AR7.4: read `wrR`/`wrL`
>      off the pose bundle, never off a carried track).
>    - **AR4: no hand ever goes behind the body.** To reach something behind him he TURNS
>      first (AR7.1: a turn is a track, `[[share of line, facing], …]`, eased through
>      `facing()` from the facing on screen). `check:replay` fails a raised hand more than
>      8 units behind the spine, a hanging one more than 18.
>    - **AR5: a stroke plays at most twice** (stirring, chalking, writing, waving). A long
>      action is a PATH the hand travels once (AR7.5). `check:replay` fails a hand that
>      turns back on itself more than four times in a row.
>    - **AR6: a held thing is held still and close**, in front, below the shoulder.
> 2. **The model scenes are the newest ones on YOUR road**: read your road's
>    `<stem>1Scene.tsx`, `<stem>2Scene.tsx` and `<stem>3Scene.tsx` — all three were
>    brought up to group AR on 2026-10-02 — and copy their techniques, never their sets.
>    Yours follows lesson 3 directly: a DIFFERENT place with different objects.
>    `econ1Scene.tsx` is still the owner's standard for a dialogue lesson.
> 3. **Some lessons cast only TWO people** (AP13): phil4 (top hat + plain) and sci4 (top
>    hat + bun). Two figures still talk to each other, face each other, and the listener
>    is alive (N21) — and with only two on stage, give them room and real business with
>    the objects.
> 4. **The object sheet is `npm run sheet:lesson-objects <name> …`** (`sheet:objects` now
>    draws the rank and badge objects). `SIZE=22` draws a thing at the size a scene
>    actually uses, which is where outline problems show (AM12).
> 5. **Several builders share one Metro.** Every save of `objects.ts` hot-reloads every
>    other builder's page. Re-read `objects.ts` before every edit, edit only between your
>    markers, and if a beat sheet looks scrambled, wait a minute and take it again.

## Your lesson

| stem | lesson id | branch tone | your Chrome CDP port | your route |
|---|---|---|---|---|
| phil4 | philosophy-foundations-4 | `philosophy` | 9411 | `previewb4phil` |
| psych4 | psychology-foundations-4 | `psychology` | 9412 | `previewb4psych` |
| growth4 | personal-growth-foundations-4 | `personal-growth` | 9413 | `previewb4growth` |
| biz4 | business-foundations-4 | `business` | 9414 | `previewb4biz` |
| econ4 | economics-foundations-4 | `economics` | 9415 | `previewb4econ` |
| sci4 | science-foundations-4 | `science` | 9416 | `previewb4sci` |
| hist4 | history-foundations-4 | `history` | 9417 | `previewb4hist` |

The script is `components/lesson/cinematic/<stem>Script.ts`; its `act` doc comment says
what happens on each beat, and each question flag's doc comment names the three things on
the stage to tap. The voice is recorded: your LINES (`dur` per beat) come from
`lib/narration/manifest.ts` under your lesson id. The placeholder scene is
`<stem>Scene.tsx` — replace it whole, keeping the exported `<Cap>Lesson` name and
signature.

Your objects go ONLY directly above `// ── <stem>: objects for this lesson go ABOVE this
line ──` in `objects.ts`, registered in `OBJECTS` on your own `// <stem>:` line, and your
colours on your own `// <stem> colours:` line in `NATURAL`.

## Checks you run — fix everything about YOUR scene

```
npx tsc --noEmit
REPLAY_ONLY=<id> node scripts/check-replay.mjs        (AR1, AR4, AR5, AQ1, N21, C20c, cuts)
node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON scripts/check-dialogue.mjs   (AP2, AP13, AP18)
node scripts/check-smooth.mjs          node scripts/check-still.mjs
node scripts/check-idle.mjs            node scripts/check-turn.mjs
node scripts/check-fits.mjs            node scripts/check-legible.mjs
node scripts/check-shade.mjs           node scripts/check-objects.mjs
node scripts/check-scale.mjs           node scripts/check-props.mjs
node scripts/validate-worklets.mjs     node scripts/check-answers-shape.mjs
node scripts/validate-cinematic.mjs
```

Also check that every `carry(cv, slot, …)` slot is distinct and that `useCarry(N)` covers
the highest slot: `check-smooth` fails a collision (L5), and a collided slot shows up in
`check-replay` as something blinking off and on at every tap (C20c).

`validate-cinematic` will say your lesson has no measured must-boxes and that the solid
floor is off while other scenes are placeholders: IGNORE those (the coordinator measures
every lesson at the end). Other lessons' failures are not yours.

**Look at it** with the beat sheet, on your own port and route — Metro is on port 8861:

```
WEB_PORT=8861 CDP_PORT=<your port> BEAT_ROUTE=<your route> BEAT_TAG=<stem> node scripts/sheet-beats.mjs <id> <beat count>
```

Read the PNG. Then look CLOSE at every hand act at several moments inside it (AR2, AR3,
AR6 are judged by eye): crop the frames or take a beat sheet with a bigger cell. Do not
start or stop Metro or Chrome.

## Do not

- commit, push, `git add`, publish, or run `npm run check`;
- run `measure:must`, any `make:*` generator, `render-narration`, or anything that
  spends voice characters or rewrites shared tables;
- change any `text`, `speaker`, `pace`, `quote`, `summary`, `interact.prompt`/`explain`,
  `dur`, or the number/order of beats in your script. You MAY edit its channel fields and
  `act` doc comment;
- edit any file other than your scene, your script's channels, and your markers in
  `objects.ts`. If a shared file must change, STOP and say so in your report.

## Report back

The composition in stage units, the objects you added and the references you looked
at, what each beat shows, every check's result, the path of your final beat-sheet PNG,
and anything you were unsure of.
