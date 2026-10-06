# Lean brief: redesign ONE existing dialogue lesson (2026-10-05)

Everything you need is on this page. Do NOT read `docs/LESSON_RULES.md`, CLAUDE.md or the
older briefs: they are huge and the rules that matter are below. Be economical: read only
your scene, your script's header and channels, and the two example files named here.

Work in `C:\Users\landy\Documents\Philosophize-hands` (in Bash, begin every command with
`cd /c/Users/landy/Documents/Philosophize-hands &&`). Metro is on port **8861**. Your CDP
port and route are given in your prompt.

## The owner's ask

*"Improve the designs … take more reference photos … when there's just shapes or there's a
cluttered design or the design of anything on screen doesn't look very good … more gamified
look … a better working UI or animations with the objects … make sure that letters aren't
cut off at any point."* The words, timing and sound of the lesson stay exactly as they are;
what changes is what a reader SEES on the stage.

## Steps

1. If `git diff HEAD --stat -- components/lesson/cinematic/<stem>Scene.tsx` shows changes, a
   builder before you started this lesson and was cut off: read that diff, keep what is
   good, finish the job. Otherwise start fresh.
2. Render it once: `WEB_PORT=8861 CDP_PORT=<port> BEAT_ROUTE=<route> BEAT_TAG=<stem>-before node scripts/sheet-beats.mjs <id> <beats>`
   and Read the PNG. List (for yourself) the 2–5 weakest things, judged by:
   - **a thing built from shapes that doesn't look like the real thing** (animals, people in
     pictures, trees, vehicles, buildings, food, machines, anything curved) → redraw it;
   - **clutter** → cut, group, simplify; one clear subject per beat;
   - **flat UI on the stage** (bare outlines, flat boxes for plates and tap targets) → plates
     struck white on a hard ledge (`lipOf(tone)` from `stageSkin.ts` as a `boxShadow`
     `0 3px 0 <lip>`), `PLATE_RADIUS` corners, a `pillStyle(k)` shadow under things that
     stand; a tap target looks tappable;
   - **a weak answer**: right and wrong must each get a clear physical reaction on the stage
     (a pop-and-settle, a stamp, a shake, a thing dropping into place), not only a colour;
   - **cheap motion**: things that appear instead of arriving, constant-speed slides, dead
     stops. Ease in and out, a small overshoot or squash on landing, weight when set down.
     Every per-beat track goes through `carry(cv, slot, …)` (`useCarry(N)` covers the
     highest slot; slots distinct) so nothing jumps on a tap.
   **Do not stop at the answer plates.** Every lesson has objects to improve: furniture
   (tables, chairs, counters, shelves), food, shop fronts, plants, vehicles, tools. A grey
   pedestal for a café table or a blob for a slice of cake is exactly what the owner means
   by "just shapes". Redraw at least the main objects of the set, with references.
3. **References**: `npm run ref "<query>"` (Wikimedia Commons → `scratchpad/ref/`), Read at
   most 2–3 pictures per object. If refused (HTTP 429), wait a minute and retry; never draw
   from memory. Name the reference in a comment.
4. **Draw** a curved or detailed thing as SVG in `scripts/lib/lessonart/lessons/<stem>.mjs`:
   `export const ART = [{ name: '<stem>-thing', svg: () => '<svg body, no <svg> tag>', view: {x,y,w,h}, box: {x,y,w,h} }]`.
   `view` is the drawing's viewBox; `box` is where it sits in the parent View, in scene units
   (if it replaces an object, take that object's box so nothing moves). Look at
   `scripts/lib/lessonart/props.mjs` (`carouselHorse`, `wreck`) for the house look: flat
   fills lit from the top left, a darker shaded side, ONE dark outline (`#1A1A1A`-ish,
   stroke ~1–1.5 of the view), real colours, no gradients, no glows. Bake ONE picture:
   `node scripts/make-lesson-art.mjs <name>`, then place it:
   `import LessonPicture from './LessonPicture';` … `<LessonPicture name="<stem>-thing" />`
   inside a View positioned at the box's parent. A thing whose parts move separately stays
   separate pictures (or parts).
5. **Cut-off letters (AQ2)**: `REPLAY_ONLY=<id> node scripts/check-replay.mjs` lists every
   `CLIPPED` label. Android clips a Text to its own CONTENT box, so a handwriting face
   (Caveat) loses the end of its last letter. **Padding does NOT fix it.** Give the Text a
   box wider than its letters: stretch it across its plate (`alignSelf: 'stretch'` +
   `textAlign`, or `width` = the plate's inner width); a free label gets `width` +
   `textAlign: 'center'` placed at `left: cx - width/2`. Keep the plate wide enough (≥ the
   word + ~0.25 × fontSize each side when centred).

## Rules you must keep

- Never change `text`, `speaker`, `pace`, `quote`, `summary`, `interact.prompt/explain`,
  `dur`, `bed`, `sfx`, or the number/order of beats. Keep each action on the same moment of
  its line (sounds are timed to them). You may edit channel fields and the `act` comment.
- Keep `camera={…}` on `CinematicPlayer`. Under ~700 Views. Every object in its own real
  colours (no stage-grey objects). Hands: hold things by handles/edges, never thrown behind
  the body, no stroke repeated more than twice, arms still unless the scene moves them.
- Nothing may stand in front of a word at any moment; leave clear space round text.
  No word on the stage under 8pt at the stage's scale.
- Edit only: your scene, your script's channels, `scripts/lib/lessonart/lessons/<stem>.mjs`
  and the PNGs it bakes, and your own stem-prefixed keys in `objects.ts`. Throwaway files
  go in `scratchpad/` and must NOT end in `.ts`/`.tsx` (tsc reads them). Do not commit,
  `git add`, publish, run `npm run check`, `measure:must`, other `make:*` generators, or
  anything that spends voice characters. Do not start/stop Metro or Chrome; do not delete
  `app/preview*` files.

## Checks (green for your lesson; ignore other lessons and stale must-box stamps)

```
npx tsc --noEmit 2>&1 | grep -v "^scratchpad" | head
REPLAY_ONLY=<id> node scripts/check-replay.mjs
node scripts/check-objects.mjs && node scripts/check-lesson-art.mjs && node scripts/validate-worklets.mjs
node scripts/check-smooth.mjs && node scripts/check-fits.mjs && node scripts/check-legible.mjs && node scripts/check-shade.mjs
node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON scripts/check-dialogue.mjs
```

Then render once more (`BEAT_TAG=<stem>-after`), Read it, and look at both questions
answered right AND wrong. Last: `echo '["<id>"]' > scratchpad/<stem>-ids.json &&
CDP_PORT=<port> WEB_PORT=8861 LANES=1 READ_ROUTE=<route>read node scripts/check-readable.mjs scratchpad/<stem>-ids.json`
and fix what it reports. Run it in the FOREGROUND (Bash timeout 600000), never in the
background, and leave nothing running when you report: the next builder uses your port.

## Report (≤ 12 lines)

What was weak → what you changed; pictures baked; any action whose moment moved; check
results (incl. check:readable); the final sheet path.
