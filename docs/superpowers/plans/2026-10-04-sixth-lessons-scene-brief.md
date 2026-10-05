# Brief for a scene builder — one SIXTH dialogue lesson (2026-10-04)

> Built on the fifth lessons' brief (`2026-10-03-fifth-lessons-scene-brief.md`), which is
> built on the fourth, third and second lessons' briefs. **Read all four in full**:
> everything in them still holds, except where this page says otherwise. LESSON_RULES group
> AU (a road ramps up, and a lesson is a show) and group AR are what the owner looks at
> first.
>
> The owner, 2026-10-04: *"be creative on different situations. Make sure the learning is
> continually going up. Unique question asking. The animations are smooth and look good.
> Remember, you can always take as many reference photos or look online so you can best
> build the lessons."*
>
> What the fifth lessons taught the coordinator, so you do not repeat it:
>
> 1. **Pass `camera={…}` to `CinematicPlayer`.** A scene without a camera has no
>    `#stage-cam`, and `measure-must` then reads ZERO beats from it. Use the house follow
>    (`followMoves(xs, BEATS.map(kindOf), seedOf('<road>'))` from `./camera`), as every
>    fifth scene but one did.
> 2. **Nothing may stand in front of a word, at any moment of the lesson.** An opened lid
>    rose in front of its own CELLAR plaque, and a roll hung across the last line of a
>    decree; both failed `check:readable` (UNDER, STRIKE). If a thing moves in front of a
>    label, fade the label as it is covered, or move the label. Leave a clear line of space
>    between the last line of text and the edge of whatever holds it.
> 3. **Stay under about 700 Views.** One fifth scene reached 728. Mount a thing only on the
>    beats it can be seen, and draw big flat shapes rather than many small ones.
> 4. **Fetch references, lots of them.** `npm run ref "<query>"` pulls freely licensed
>    pictures from Wikimedia Commons to `scratchpad/ref/`; Read the PNG to look at it. The
>    owner asked for it in so many words. Commons rate-limits after a burst (HTTP 429):
>    space your searches, and if one is refused, wait a minute and try again rather than
>    drawing from memory.
> 5. **Report your sound moments** as before (`beat N: what — at fraction F of LINES[N]`);
>    the coordinator writes the cues.

## Your lesson

| stem | lesson id | branch tone | Chrome CDP port | route |
|---|---|---|---|---|
| phil6 | philosophy-foundations-6 | `philosophy` | 9411 | `previewb6phil` |
| psych6 | psychology-foundations-6 | `psychology` | 9412 | `previewb6psych` |
| growth6 | personal-growth-foundations-6 | `personal-growth` | 9413 | `previewb6growth` |
| biz6 | business-foundations-6 | `business` | 9414 | `previewb6biz` |
| econ6 | economics-foundations-6 | `economics` | 9415 | `previewb6econ` |
| sci6 | science-foundations-6 | `science` | 9416 | `previewb6sci` |
| hist6 | history-foundations-6 | `history` | 9417 | `previewb6hist` |

The script is `components/lesson/cinematic/<stem>Script.ts`: its header says who is who and
what the lesson teaches, its `act` doc comment says what happens on each beat, and each
question flag's doc comment names the GAME (in capitals) and the three things to tap. The
voice is recorded: your LINES (`dur` per beat) come from `lib/narration/manifest.ts` under
your lesson id. Replace the placeholder `<stem>Scene.tsx` whole, keeping the exported
`<Cap>Lesson` name and signature. Your road's `<stem>5Scene.tsx` is the newest model; copy
its techniques, never its set. Your objects and colours go between your own markers in
`objects.ts` (`// ── <stem>: objects …`, `// <stem>:` in `OBJECTS`, `// <stem> colours:`
in `NATURAL`), with a `<stem>`-style prefix on every key so nobody collides.

Lesson notes the script does not spell out:

- **phil6** — a Victorian fairground at night: carousel lights behind, bunting, a brass
  fortune-telling automaton in a glass booth (a mechanical figure with a turban or a
  crystal ball, a crank on the side, a card slot and tray), and a counter with three
  glass sweet jars (fudge, mint, toffee). The cards the machine prints are the joke: make
  them readable when held up. Q1's three targets: the card in the tray, a pair of dice on
  the counter, and the customer himself.
- **psych6** — a seaside pier arcade at night: neon, a row of three claw machines with lit
  signs on top (the claw drops on a cable, opens and closes, and the purple bear slips),
  the sea and pier rail through the open side. The phones in Q2 stand on a little display
  stand, screens facing the reader.
- **growth6** — the lamp room at the top of a lighthouse: the big lens and its lamp, a
  desk with a Morse key and notes, windows onto the sea. Calm evening at first; then a
  storm (rain streaks, a dark sea, a ship's light blinking out at sea in S O S rhythm).
  The ship's blinks on `sos` are the real pattern (three short, three long, three short).
  Three calendars hang on the wall for Q2.
- **biz6** — a haunted castle attraction at night: a gatehouse with an iron gate, cobwebs,
  lanterns, a bat or two, a ticket booth, a turnstile with a big mechanical counter whose
  digits roll as `guests` changes. The rent bill is pinned to the gate. A chalk board with
  two lines that cross (sales and costs) appears on `point`. Spooky but friendly, not
  frightening.
- **econ6** — a pirate island beach at golden hour: palm trees, the sea, a wrecked ship's
  hull on the rocks, a treasure chest of gold coins, a coconut stall with a chalk slate
  (the price changes with `price`), and a jetty with three crates for Q2.
- **sci6** — below decks on an 18th-century sailing ship: the sick bay with hammocks slung
  between beams, a lantern swinging gently as the ship rolls (the whole room may tilt a
  degree or two on `clock`), the surgeon's chest, a crate of oranges and lemons, a mast
  with notes pinned on it for Q1. The ship's roll is the life of the scene; keep it gentle.
- **hist6** — inside an Egyptian temple hall at Abu Simbel, lit by torches: a huge wall
  carving in the Egyptian style, the king in his chariot drawn far larger than the soldiers
  around him (look at photographs of the real Kadesh reliefs), hieroglyph borders, columns,
  an archaeologist's dig tray on a trestle with a clay tablet and, for Q2, three finds.

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
node scripts/validate-cinematic.mjs    node scripts/check-camera.mjs
```

Every `carry(cv, slot, …)` slot distinct, and `useCarry(N)` covering the highest slot.
Ignore `validate-cinematic`'s "never measured" note for your lesson, and other lessons'
failures.

**Look at it** on your own port and route — Metro is on port 8861:

```
WEB_PORT=8861 CDP_PORT=<your port> BEAT_ROUTE=<your route> BEAT_TAG=<stem> node scripts/sheet-beats.mjs <id> <beat count>
```

Then look CLOSE at every hand act and at both question games answered right AND wrong, at
several moments inside them. Then, last of all, sweep your lesson for unreadable words:

```
echo '["<id>"]' > scratchpad/<stem>-ids.json
CDP_PORT=<your port> WEB_PORT=8861 LANES=1 node scripts/check-readable.mjs scratchpad/<stem>-ids.json
```

and fix anything it reports (TINY, CUT, FAINT, SPILL, UNDER, STRIKE). Do not start or stop
Metro or Chrome.

## Do not

- commit, push, `git add`, publish, or run `npm run check`;
- run `measure:must`, any `make:*` generator, `render-narration`, or anything that spends
  voice characters or rewrites shared tables;
- change any `text`, `speaker`, `pace`, `quote`, `summary`, `interact.prompt`/`explain`,
  `dur`, `bed`, `sfx`, or the number/order of beats in your script. You MAY edit its
  channel fields and `act` doc comment;
- edit any file other than your scene, your script's channels, and your markers in
  `objects.ts`. If a shared file must change, STOP and say so in your report.

## Report back

The composition in stage units and your View count, the objects you added and the
references you looked at, what each beat shows, how each question game answers right and
wrong, the sound moments, every check's result (including `check:readable`), the path of
your final beat-sheet PNG, and anything you were unsure of.
