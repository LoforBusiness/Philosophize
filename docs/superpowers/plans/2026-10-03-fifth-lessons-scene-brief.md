# Brief for a scene builder — one FIFTH dialogue lesson (2026-10-03)

> Built on the fourth lessons' brief (`2026-10-02-fourth-lessons-scene-brief.md`), which
> is built on the third and second lessons' briefs. **Read all three in full**: everything
> in them still holds, except where this page says otherwise. Group AR (objects in their
> own colours, hands that use things as people do) is still what the owner looks at first.
>
> What is NEW for the fifth lessons, and why — the owner, 2026-10-03:
>
> > *"I want the foundations to ramp up … the complexity and the things shown in lessons
> > will become more complicated … make sure that these lessons are very entertaining …
> > different ways that the user can answer questions. Unique ways, fun ways … unique
> > situations, not just everyday situations … out of the ordinary situations … exciting
> > situations."*
>
> 1. **AN EXCITING PLACE, DRAWN LIKE ONE.** Every earlier lesson is a café, a stall, a
>    garden. These are a space lab, a hilltop at midnight, a circus big top, a balloon
>    field at dawn, a medieval town hall and a Scottish loch at night. The set is the hook:
>    a reader should know where they are, and want to be there, before anyone speaks.
>    Draw it from fetched references (`npm run ref`), in its own colours (AR1 — a night
>    sky is navy, a lantern glows amber, a balloon is striped in its real colours; add each
>    colour to `NATURAL` on your own line). Give the place DEPTH (a far layer, a middle, the
>    floor the cast stand on) and something alive in it that is not a person: a flame
>    flickering, water lapping, stars, mist drifting, the Earth turning past a window —
>    on `clock`, never on `bt` (L1).
> 2. **KEEP THE SET LIGHT ENOUGH TO STAY SMOOTH.** A big set drawn from Views costs every
>    frame (AT7 — the Athens court was 2,799 and lagged). Keep the whole stage under
>    about 700 Views, with nothing big under a moving camera; prefer a few large flat
>    shapes to many small ones. Do NOT make plates (`make:plates` is the coordinator's).
>    Report your count.
> 3. **EACH QUESTION IS A SMALL GAME, AND IT IS NAMED IN YOUR SCRIPT.** Each question
>    flag's doc comment starts with the mechanic in capitals — FOLLOW HIM, CALL IT BEFORE
>    IT HAPPENS, PICK THE ROPE, RUMMAGE THE PROP TRUNK, FOLLOW THE MONEY, PICK THE BOOKING,
>    LOOK BEHIND A DOOR, SEAL A DECREE, CATCH A BOTTLE, READ THE RESULTS, WEIGH THE CLAIMS,
>    READ THE LUGGAGE TAGS — and names the three things to tap. It is still one tap on the
>    stage (AP6, `Target` + `onPick`, three targets, `check:shape`), but it must FEEL like
>    the game its name says:
>    - **the three things are real objects in the scene**, big enough to tap (each target
>      at least 44 × 44 stage units after the band's scale), their words on them in their
>      own plates (AQ1), never a row of word-buttons laid over the picture;
>    - **the scene ANSWERS in the game's own way** once `picked` is set: the right door
>      swings open and rats peep out; the chosen scroll takes a red wax seal; the bottle
>      lifts out of the water; the rope the reader picked lights and she steps toward it;
>      the right luggage tag flips over. A wrong pick gets its own small, readable
>      reaction (it sinks, rattles shut, droops) — not the same animation as the right one.
>      Every reaction is carried (AH4: never switched on between two frames), and changes
>      nothing on a beat that is not graded (C20c);
>    - **a thing that moves while it is tappable moves gently** (the bottles bob, the
>      ropes sway): at most 4 stage units, on `clock`, so a tap never misses.
> 4. **MORE ACTION, STILL SIMPLE.** These lessons carry harder ideas, so the stage has to
>    work harder at showing them: every `act` in your script is a real piece of business
>    across its whole line (the owner's rule: the stage keeps acting through the voiced
>    line). AP7 still caps the movers at two at once, and AR5 still caps any repeated
>    stroke (rowing, chalking, waving) at two, then rest — a long action is a path.
> 5. **ONLY THE CAST.** No silent extras (AT2 is for a staged scene, and these are not).
>    A figure on a SCREEN (phil5's double on the Moon) is the same cast member, marked
>    `{/* cast: plain */}`, and moves when the volunteer moves. If `check:dialogue`
>    objects to the second figure, tell the coordinator rather than working around it.
> 6. **SOUND IS THE COORDINATOR'S, BUT YOU KNOW WHEN THINGS HAPPEN.** Do not add `bed` or
>    `sfx`. In your report, list every moment that would make a sound (a door, a splash,
>    a coin, a zap, a whistle, a seal pressed, a burner roar, a bell), as
>    `beat N: what — at fraction F of LINES[N] (the stage call that carries it)`.

## Your lesson

| stem | lesson id | branch tone | Chrome CDP port | route |
|---|---|---|---|---|
| phil5 | philosophy-foundations-5 | `philosophy` | 9411 | `previewb5phil` |
| psych5 | psychology-foundations-5 | `psychology` | 9412 | `previewb5psych` |
| growth5 | personal-growth-foundations-5 | `personal-growth` | 9413 | `previewb5growth` |
| biz5 | business-foundations-5 | `business` | 9414 | `previewb5biz` |
| econ5 | economics-foundations-5 | `economics` | 9415 | `previewb5econ` |
| sci5 | science-foundations-5 | `science` | 9416 | `previewb5sci` |

The script is `components/lesson/cinematic/<stem>Script.ts`; its header says who is who,
its `act` doc comment says what happens on each beat, and each question flag's doc comment
names the game and the three things to tap. The voice is recorded: your LINES (`dur` per
beat) come from `lib/narration/manifest.ts` under your lesson id. The placeholder scene is
`<stem>Scene.tsx` — replace it whole, keeping the exported `<Cap>Lesson` name and
signature. The model scenes are your road's `<stem>1`–`<stem>4` scenes (copy their
techniques, never their sets) and `econ1Scene.tsx`.

Your objects go ONLY directly above `// ── <stem>: objects for this lesson go ABOVE this
line ──` in `objects.ts`, registered in `OBJECTS` on your own `// <stem>:` line, and your
colours on your own `// <stem> colours:` line in `NATURAL`.

Lesson notes the script does not spell out:

- **phil5**: the pod, the console, the recycling hatch under the pod and a big screen
  showing the Moon base, with the Earth through a round window. The philosopher FLOATS in
  through a hatch (it is a space lab: a slow drift, feet off the floor, then he settles).
  On `beam` the volunteer is drawn ON the screen, smaller, stepping out of the Moon pod;
  from `jam` on there are two of him, and on `claim` the one on the screen copies the
  gesture of the one in the pod at the same moment, which is the joke.
- **psych5**: night. Lanterns on poles mark out a landing strip on the grass; a clock on
  a post (the clock reads before twelve until `past` is 1); the crate the prophet stands
  on; three packed suitcases with big luggage tags. The psychologist is half-hidden behind
  a gorse bush, head and notebook visible, until `seen`. The three signs for the first
  question lean against the crate.
- **growth5**: the inside of a big top — striped canvas, the ring, a ladder up to the
  high wire under the roof, the middle rope at knee height over a net, the rope on the
  floor. The ringmaster's cane is held (a costume piece in the hand is fine; nothing on a
  body). The net BOUNCES her on `wobble`. The prop trunk is open, its three things poking
  out. The high wire is high: the band may need to be tall, so check `check:legible`.
- **biz5**: dawn, a field, a big striped balloon lying half-filled then standing up, the
  wicker basket, the burner (its flame animated on `clock`), the gas man's trolley with
  two cylinders, the chalk booking board, the cash tin. On `liftoff` the basket rises off
  the grass with the owner in it: lift the whole balloon, the basket and the figure as
  one, and keep his feet in the basket.
- **econ5**: a stone town hall with a heavy table, a sack of silver coins, the mayor's
  scrolls and wax seal, a crate of cabbages by the door, a cellar hatch in the floor, a
  bakery door and a well lid seen through an arch. Rats are animals (Z9, `Silhouette.tsx`
  part lists), drawn against a reference: a nose, round ears, a long bare tail.
- **sci5**: night on a loch: dark water with a moving shimmer, mist, a wooden jetty
  where the scientist stands with a lamp, and a rowing boat with the two others seated.
  The sonar screen is in the boat (a green sweep line on `clock`). For the second question
  a line is strung across the boat with three results pegged on it. On `month` it is dawn
  (`dawn` 1): the sky lightens, the mist thins.

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

Every `carry(cv, slot, …)` slot distinct, and `useCarry(N)` covering the highest slot.
`validate-cinematic` will say your lesson has no measured must-boxes and that the solid
floor is off while other scenes are placeholders: IGNORE those. Other lessons' failures
are not yours.

**Look at it** with the beat sheet, on your own port and route — Metro is on port 8861:

```
WEB_PORT=8861 CDP_PORT=<your port> BEAT_ROUTE=<your route> BEAT_TAG=<stem> node scripts/sheet-beats.mjs <id> <beat count>
```

Read the PNG. Then look CLOSE at every hand act and at both question games, answered
right AND wrong, at several moments inside them. Do not start or stop Metro or Chrome.

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

The composition in stage units and your View count, the objects you added and the
references you looked at, what each beat shows, how each question game answers right and
wrong, the sound moments (item 6), every check's result, the path of your final
beat-sheet PNG, and anything you were unsure of.
