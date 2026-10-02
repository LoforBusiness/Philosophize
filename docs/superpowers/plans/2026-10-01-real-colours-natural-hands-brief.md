# Brief — one subject road: real colours and natural hands (2026-10-01)

You own ONE road: its three dialogue lessons, `<stem>1Scene.tsx`, `<stem>2Scene.tsx` and
`<stem>3Scene.tsx` in `components/lesson/cinematic/`. Six other people are doing the
other six roads at the same time, in the same folder.

## Where you work — read this first

- **Work ONLY in `C:\Users\landy\Documents\Philosophize-hands`** (a git worktree on branch
  `lesson-hands`). NEVER read from, write to or run anything in
  `C:\Users\landy\Documents\Philosophize` — another session is working there.
- Metro for this worktree is already running on port **8881**, headless Chrome on **9401**.
  Do not start or stop either.

## What the owner asked (2026-10-01)

1. *"These lessons [are] created only with the color palette … I want these lessons to be
   made so that they all have different colors that are right for the objects. Like for
   the first economics one, the pie or the different objects don't actually look like the
   object. So this needs to be done correctly."*
2. *"When stickmen interact with objects, they interact with them only in a natural way.
   Like when they grab umbrellas, they actually grab them in a human-like way. Or if they
   take a coffee … it looks like they're just grabbing the cup. If there's a saucer, then
   they grab the saucer and the cup, but then when they drink it … off the saucer … the
   woman stickman that has a cup moves her arm in a back way, which is a way I do not want
   stickmen to move their arms … no movement of the arm that looks awkward, like too far
   backwards, or continuous, the same movement over and over again. Only natural,
   real-looking movements."* *"This is very important to get correct."*

## Read before you touch anything

- `docs/LESSON_RULES.md`: **Group AR** (the new rules, AR1–AR6 — the whole of them),
  **AP11** (the colour table and its label rule), **AP18** (arms still unless the scene
  moves them), **AQ1** (words fit their plates), **AP5 / group AM** (objects from
  references), and N21 (listeners move their heads).
- `docs/superpowers/plans/2026-10-01-third-lessons-scene-brief.md` (how these scenes are
  built and checked). Everything in it still holds except where this brief says otherwise.
- Your three scenes and their scripts, whole.
- `components/lesson/cinematic/interact.ts`: `lipsAt`, `sipHandAt`, `saucerHandAt`,
  `sipTilt`, `sipHead` (the one way to drink, AR3), `reachHandTo`, `carryMode`.

## Your findings

`C:/Users/landy/AppData/Local/Temp/claude/c--Users-landy-Documents-Philosophize/4f568529-9b2b-4fca-97c9-d98373c5948d/scratchpad/hands/find-<road>.txt`
lists what `check:replay` found in your road on the day the rules were written: TONED
(AR1), BEHIND (AR4) and LOOP (AR5), each with the beat, the scene line of the figure and
the second in the beat. It is the start, not the whole: AR2, AR3, AR6 and the View-drawn
parts of AR1 are judged by LOOKING.

## The work, for each of your three lessons

1. **Colours (AR1).** Every object is drawn in the colours it really is — food, furniture,
   counters, walls, signs' frames, cups, coins, notes, books, tools, plants, canopies. Look
   at the beat sheet and list every thing on the stage. For each:
   - `<ObjectArt>`: `tint(parts, key)`, or better, give the drawing's parts their own
     `nat` keys so a thing with several colours has several (a pie's crust and its darker
     glaze; a stall's wooden posts and its striped canvas; a book's cover and its page
     edges). One colour over a whole object is not enough.
   - Things the scene draws in Views (walls, panels, a slate, bunting, a canopy): their
     `backgroundColor` comes from `NATURAL.<key>.base` / `.shade`.
   - New colours go in `NATURAL` in `objects.ts`, under YOUR lessons' `// <stem>N colours:`
     marker lines, each `{ base, shade, label, what }`, shade darker than base, label
     4.5:1 on base (`check:objects` holds it). New object drawings go ABOVE your
     `// ── <stem>N: objects for this lesson go ABOVE this line ──` marker, and their names
     into the export list under your `// <stem>N:` marker.
   - **objects.ts is shared with six other people working right now.** Re-read the lines
     just before each edit, make small edits anchored on YOUR marker lines only, never
     rewrite or reformat anything else in the file, and never use a script that rewrites
     the whole file.
   - What keeps the branch's stage tone: the floor (`floorStyle`), the ground line, a plate
     a word is printed on, answer targets, a diagram. Nothing else.
   - **A word on a recoloured surface keeps its contrast**: use the entry's `label` ink, on
     the lit face. `check:shade`, `check:fits`, `check:legible` and AQ1 must stay green.
   - **And it must look like the thing** (AM, AP5). Where an object reads as a blob or a
     disc, redraw it against a reference: `node scripts/get-reference.mjs <slug> "<object in its own world>" 3`
     fetches pictures to disk (it prints where; `KIND=filetype:bitmap` for photographs),
     then Read the image to look at it. Search for the thing in its own world ("apple pie
     on a plate", not "pie"): a bare noun pulls diagrams and scanned books. Draw it in `objects.ts`
     from the four primitives; look at it with
     `BRANCH=<branch> OUT=scripts/.lesson-shots/objects-<stem>.png SIZE=22 node scripts/sheet-lesson-objects.mjs <name>`
     (plain Node, seconds), then in the scene.
2. **No arm thrown back (AR4).** Fix every BEHIND finding. The fix is almost always to turn
   the figure to face what he shows, offers or reaches for (change his facing for that beat,
   or for the stretch of it the act needs, with `facing()` so the turn is eased), or to move
   the target in front of him. Never just clamp the hand: a hand must still meet what it
   holds.
3. **No stroke repeated (AR5).** Window every repeating hand motion to at most two
   back-and-forths, then the hand rests where the stroke ended (e.g. multiply the sine by
   `1 - st(a, b)` over the right window, or replace a clock loop with a path that travels).
   Keep the `// AP18:` comment on any clock-driven target you keep.
4. **Grips (AR2), drinking (AR3), held still (AR6)** — by eye, every beat:
   - each held thing is drawn about its GRIP POINT and its rider puts that point on the
     wrist: a cup by its handle, a saucer flat on the palm, a jug by its handle, an umbrella
     by its crook hanging straight down, a spoon/pen/chalk by the end of its handle, a book
     by its bottom edge, a coin between the fingers;
   - a held thing keeps its orientation (upright cup, hanging umbrella) unless being poured,
     drunk from or shown;
   - a drink goes to the lips with the `interact.ts` helpers, tips toward the face, the head
     meets it, then it comes back down; a cup on a saucer is lifted WITH its saucer, the
     saucer then held flat at the chest in the other hand (`saucerHandAt`) while the cup
     alone goes to the mouth and back onto it;
   - while a figure listens, a thing in his hand rests close in front of him below the
     shoulder — not held out at arm's length or up by his head;
   - a cup is about half a head wide (the head is 30 stage units across at K 0.76); a bigger
     one reads as a bucket.

## What must NOT change

- Any `text`, `speaker`, `pace`, `quote`, `summary`, `interact.prompt` / `explain`, `dur`,
  `markup`, or the number or order of beats in a script. You may change a script's channel
  fields and its `act` doc comment.
- The voice timing: actions stay paced by `LINES`.
- AP18 still-arm poses (`emoteStill` / `emoteStillLive` / `postureStill`), N21 (listeners'
  heads move — NOD 263), AQ1, C20c and the cut budget.
- Any file other than your three scenes, your scripts' channels, and your marker sections
  of `objects.ts`. If a shared file must change (rig.ts, interact.ts, moves.ts, Stickman,
  ObjectArt, check scripts…), STOP and say so in your report instead.

## Checks — all must pass for YOUR three lessons

```
cd C:\Users\landy\Documents\Philosophize-hands
npx tsc --noEmit
REPLAY_ONLY=<id1>,<id2>,<id3> node scripts/check-replay.mjs     (AR1, AR4, AR5 at 0; AQ1, N21, C20c)
node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON scripts/check-dialogue.mjs
node scripts/check-objects.mjs       node scripts/check-shade.mjs
node scripts/check-fits.mjs          node scripts/check-legible.mjs
node scripts/check-smooth.mjs        node scripts/check-still.mjs
node scripts/check-idle.mjs          node scripts/check-turn.mjs
node scripts/check-scale.mjs         node scripts/check-props.mjs
node scripts/validate-worklets.mjs   node scripts/check-answers-shape.mjs
```

`validate-cinematic` will report stale must-box stamps for the scenes you edit: IGNORE that
(the coordinator re-measures every lesson at the end). Another road's failures are not
yours — but if a shared check fails on YOUR lesson, it is yours.

## Look at it — this is the real test

```
cd C:\Users\landy\Documents\Philosophize-hands
CDP_PORT=9401 WEB_PORT=8881 BEAT_ROUTE=previewhands<N> BEAT_COLS=4 BEAT_TAG=<stem><n> node scripts/sheet-beats.mjs <lesson-id> <beat count>
```

Use YOUR route number `<N>` (given in your task) so you never share a route with another
person. The PNG lands in `scripts/.lesson-shots/<tag>.png`; Read it. A first run after
Metro rebuilds may report NEVER RENDERED A STAGE: run it again. A still frame cannot show a
hand in motion, so for each act you changed, also read the hand's path in the code against
the timing, and where a hand moves through a beat, look at it mid-act:
`REPLAY_TRACE=<stem>Scene:<beat>:<figure index> REPLAY_TRACE_FILE=<file>` records a
figure's ankles per frame if you need numbers; the AR4/AR5 measures are the check.

Look at every beat of all three lessons before and after. Compare the objects with their
references. Would a person who has never seen this app say "that is a pie", "she is
drinking her coffee", "he is holding an umbrella"? That is the bar.

## Do not

- commit, push, `git add`, publish, or run `npm run check`;
- run `measure:must`, any `make:*` generator, `render-narration`, or anything that spends
  voice characters or rewrites shared tables.

## Report back

For each lesson: what you recoloured (and the NATURAL entries you added), what you redrew
and the references you looked at, every AR4/AR5 finding and how you fixed it, every grip,
drink and held thing you changed (AR2/AR3/AR6), every check's result, the paths of your
final beat-sheet PNGs, and anything you were unsure of or could not do.
