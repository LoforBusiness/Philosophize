# Brief for a scene builder — one THIRD dialogue lesson (2026-10-01)

> Built on the second lessons' brief (`2026-09-30-second-lessons-scene-brief.md`), which
> you must read in full: everything in it still holds. What changed since, in order of
> how often it went wrong:
>
> 1. **Read BOTH earlier lessons on your road** (`<subject stem>1Scene.tsx` and
>    `<subject stem>2Scene.tsx`). Yours follows the second one directly. Build a
>    DIFFERENT place with different objects; reuse techniques, never sets.
> 2. **ARMS ARE STILL UNLESS THE SCENE MOVES THEM (LESSON_RULES AP18).** Pose every
>    figure with `emoteStill` / `emoteStillLive` / `postureStill` from `moves.ts` —
>    never `emoteAny`, `emoteAnyLive`, `postureHold`, `postureLive`, `emoteHold`,
>    `emoteLive` or `lookPose`. A hand moves only to reach, hold, carry, point, pour or
>    perform a played action (300 + act), timed to the line. A hand target that moves on
>    the clock (`Math.sin(t…)`, a `drift`) is allowed only when the motion IS the action
>    (a spoon stirring) and the line carries an `// AP18: <what it is doing>` comment.
>    `check:dialogue` fails anything else. Model the poses on `growth2Scene.tsx`.
> 3. **EVERY WORD FITS ITS PLATE WITH TWO UNITS OF AIR (AQ1).** A tap target's label, a
>    sign, a tag, a price: measure the word against its plate. `check:replay` runs your
>    scene and fails a word wider than its plate's room less 2 units (BROKEN), a label
>    needing more lines than its plate is tall (OVERFLOW), or a plate hanging off the
>    object it is mounted on (OFF). Give the plate the room first; loosen tracking a
>    little second; shrink type last and never under 8pt as drawn.
> 4. **NOBODY STANDS FROZEN (N21).** With still arms, a listener's life is his HEAD:
>    on a beat someone else talks, and on question and quote beats, a listener holds
>    NOD (263) or another pose whose head moves. `check:replay` fails a figure frozen
>    while another talks — check every beat, including short ones.
> 5. **SPREAD THE PEOPLE OUT.** Three of seven second-lesson scenes came back with figures
>    bunched or overlapping, an object off the stage, or a person in front of what she
>    works at. Give each figure his own floor (at least ~60 units apart at K 0.76), and
>    put the things they handle within their reach without crossing anyone.
> 6. **The voice is recorded and PACED (AP17).** Read your LINES (`dur` per beat) from
>    `lib/narration/manifest.ts` under your lesson id, and pace each act across the
>    whole line.
> 7. **Your two questions are named in your script** (not `q1`/`q2`): each question
>    flag's doc comment names the three things on the stage to tap, and the beat's
>    `explain` names the right one.

The model scenes are `econ1Scene.tsx` (the owner's standard for a dialogue lesson) and
`growth2Scene.tsx` (the owner's standard for pace, and already written to AP18). Copy
their structure.

## Checks you run — fix everything about YOUR scene

```
npx tsc --noEmit
REPLAY_ONLY=<id> node scripts/check-replay.mjs        (N21, AQ1, C20c, cuts)
node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON scripts/check-dialogue.mjs   (AP2, AP16, AP18)
node scripts/check-smooth.mjs          node scripts/check-still.mjs
node scripts/check-idle.mjs            node scripts/check-turn.mjs
node scripts/check-fits.mjs            node scripts/check-legible.mjs
node scripts/check-shade.mjs           node scripts/check-objects.mjs
node scripts/check-scale.mjs           node scripts/check-props.mjs
node scripts/validate-worklets.mjs     node scripts/check-answers-shape.mjs
node scripts/validate-cinematic.mjs
```

`validate-cinematic` will say your lesson has no measured must-boxes and that the solid
floor or card budget is off while other scenes are placeholders: IGNORE those (the
coordinator measures every lesson at the end). Other lessons' failures are not yours.

**Look at it** with the beat sheet, exactly as the second lessons' brief says, on your own
CDP port and route: Metro is on port 8861. Do not start or stop Metro or Chrome.

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
