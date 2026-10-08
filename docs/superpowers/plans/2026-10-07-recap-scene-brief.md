# Brief: build a RECAP lesson's scene (2026-10-07)

Everything you need is on this page plus the files it names. Do NOT read `docs/LESSON_RULES.md`
or CLAUDE.md (huge). Spec: `docs/superpowers/specs/2026-10-07-recap-lessons-design.md` (short —
read it). Work in `C:\Users\landy\Documents\Philosophize-hands` (in Bash, begin every command
with `cd /c/Users/landy/Documents/Philosophize-hands &&`). Metro is on port **8861**; your CDP
port and route are in your prompt.

## The owner's ask
*"A recap lesson for each subject … the tophat stickman in a couple different situations … in
the philosophy recap I want him in some ancient Greece environment … the recap starts off slow,
like the stickman in a lab doing experiments and with just sound effects … I have liked the
design and the objects … I just want an improvement of backgrounds. Usually there's no really
background in sight and it's kind of more boring. I want it to be a bit more real … if you need
to use more of the screen … increase the size and then have more backgrounds and more realistic
settings, like when you're in a lab you're in a room and it looks real, or if you're outside in
ancient Greece it looks like you're outside in ancient Greece … I really want the art style to
be really nice and to be gamified and to be smooth for the objects and the animations."*

## What exists already (do not change these)
- The script `components/lesson/cinematic/<stem>Script.ts`: every line voiced and installed.
  Its header lists, per beat, what the scene choreographs (`act`), where they are (`place`),
  what is held, and the three question channels with what is to be tapped. NEVER change
  `text`, `speaker`, `pace`, `quote`, `summary`, `interact.*`, `dur`, `bed`, `sfx`,
  `voiceAfter`, or the number/order of beats. You may add channel fields you need.
- A placeholder `components/lesson/cinematic/<stem>Scene.tsx` with `band={[214, 514]}`: the
  stage is **400 × 300 scene units now** (it was 400 × 208 in the lessons), and it fills the
  phone's stage box. Keep that band. Ground line at 500 unless you have a reason.
- Voice lengths: each voiced beat's seconds are in `lib/narration/manifest.ts` (`dur`). Build the
  scene's `const LINES = [...]` (one number per beat, 0 for a beat with no voice) from it:
  `node -e "const s=require('fs').readFileSync('lib/narration/manifest.ts','utf8');const a=s.indexOf('\"<id>\"');const b=s.slice(a,s.indexOf('\n  },',a));console.log([...b.matchAll(/\n {4}(\d+): \{[\s\S]*?dur: ([\d.]+),/g)].map(m=>m[1]+':'+m[2]).join(' '))"`
  (round each UP to 2 decimals). A beat with `voiceAfter` starts its line that many seconds in.

## Model files (read these, copy their patterns)
- `components/lesson/cinematic/phil6Scene.tsx` (+ its script): the newest scene — figures,
  cast comments, `legsOf`/`faceOf` tracks, `carry` slots, Targets for stage questions with
  right/wrong reactions, `LINES`, camera, `LessonPicture`, phases (`emoteStill(code, t, phase)`
  — each figure its own phase number, 0 and 1; see N22 below).
- `scripts/lib/lessonart/props.mjs` and `scripts/lib/lessonart/lessons/phil6.mjs`: how a drawn
  picture is written (flat fills lit from the top left, a darker shaded side, one dark outline
  ~1–1.5 of the view, real colours, no gradients, no glows).

## What to build
1. **Two full settings, each a real PLACE, not a strip.** The whole 400 × 300 band is
   picture: sky or ceiling, far wall or hills, middle ground, floor or paving — no bare paper
   anywhere. Build each in LAYERS for depth: FAR (sky, distant hills or the back wall) · MID
   (buildings, columns, shelves, a ship) · NEAR (floor/paving, the table, props he uses).
   Draw the far and mid layers as SVG pictures from references (`npm run ref "<query>"`,
   Wikimedia Commons, Read 2–3 per thing; if HTTP 429 wait a minute; never draw from memory;
   name the reference in a comment) in `scripts/lib/lessonart/lessons/<stem>.mjs`, bake each
   with `node scripts/make-lesson-art.mjs <name>`, place with `<LessonPicture name=… />`. A
   backdrop picture's `box` is the full band (x 0, y 214, w 400, h 300) or the part it covers.
   Things that MOVE (water, a flag, gulls, a fountain's stream, the shadow on a sundial, a
   purse, a tablet, a stylus) are separate parts or small pictures so they can animate.
   The look is the owner's favourite: clean, flat, gamified, warm light, real colours — think
   a polished mobile game backdrop, not a diagram.
2. **The change of place** (`place` 0 → 1): a smooth move between the two settings — e.g. the
   camera pans/cuts on a walk, or a quick fade through, carried so nothing jumps on a tap.
3. **The slow open (beat 0):** the line waits `voiceAfter` seconds. In that wait the top hat is
   alone and busy, and every `sfx` cue on beat 0 must land on the action it belongs to (a
   stylus scratch when the stylus moves on the tablet, the page sound when he rubs a line out,
   etc.). Small living moments: he squints, taps his chin, eats a fig, looks up at the view.
   The second figure arrives on beat 1.
4. **Three question games on the stage** (the channels named in the script's header): each a
   different small game with real objects to tap (Targets), clearly tappable, and a clear
   physical reaction for right and for wrong (a stamp, a pop-and-settle, a shake, a thing
   dropping into place), not only a colour.
5. **Every `act`** in the header happens on its beat, timed across that beat's line, and each
   `sfx` cue lands on its action (cue times are seconds into the beat).

## Rules you must keep
- Figures: the cast comment `{/* cast: tophat */}` / `{/* cast: plain */}` above each
  `<Stickman>`; `wear={BY_ID.<costume>.pieces}` as in phil6. Both on stage whenever they speak
  (the camera must show the speaker). **N22:** each figure its own `phase` (0 and 1) in every
  emoteStill/emoteStillLive/postureStill call that poses it; two figures never move in unison.
- Every per-beat track goes through `carry(cv, slot, …)` so nothing jumps on a tap; ease in and
  out; a small overshoot or squash on landing; weight when set down.
- Hands hold things by handles/edges, never thrown behind the body, no stroke repeated more than
  twice, arms still unless the scene moves them. Every object in its real colours.
- Words: plates struck white on a hard ledge (`lipOf(tone)` as a `boxShadow` `0 3px 0 <lip>`),
  nothing in front of a word, no word under 8pt at the stage's scale, and a Text box wider than
  its letters (stretch it across its plate or give it a `width`, AQ2 — padding does NOT help).
- Performance: still layers are baked pictures; keep the live View count under ~700.
- Edit only your scene, your script's channel fields, `scripts/lib/lessonart/lessons/<stem>.mjs`
  and the PNGs it bakes, and your own stem-prefixed keys in `objects.ts`. Throwaway files go in
  `scratchpad/` and must NOT end in `.ts`/`.tsx`. Do not commit, publish, run `npm run check`,
  `measure:must`, `make:tours` or other `make:*` generators, or anything that spends voice
  characters. Do not start/stop Metro or Chrome; do not delete `app/preview*` files.

## Checks (green for your lesson; ignore stale must-box stamps and other lessons)
```
npx tsc --noEmit 2>&1 | grep -v "^scratchpad" | head
REPLAY_ONLY=<id> node scripts/check-replay.mjs
node scripts/check-objects.mjs && node scripts/check-lesson-art.mjs && node scripts/validate-worklets.mjs
node scripts/check-smooth.mjs && node scripts/check-fits.mjs && node scripts/check-legible.mjs && node scripts/check-shade.mjs
node --import ./scripts/lib/register.mjs scripts/check-sfx.mjs
node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON scripts/check-dialogue.mjs
```
Render and LOOK, often: `WEB_PORT=8861 CDP_PORT=<port> BEAT_ROUTE=<route> BEAT_TAG=<stem>-v1 node scripts/sheet-beats.mjs <id> <beats>`
then Read the PNG. Judge it as the owner would: does it look like a real place, full of depth,
gamified and clean? Iterate until yes. Look at all three questions answered right AND wrong.
Last: `echo '["<id>"]' > scratchpad/<stem>-ids.json && CDP_PORT=<port> WEB_PORT=8861 LANES=1 READ_ROUTE=<route>read node scripts/check-readable.mjs scratchpad/<stem>-ids.json`
and fix what it reports. Run everything in the FOREGROUND, and leave nothing running when you report.

## Report (≤ 15 lines)
The two settings and their layers; the pictures baked; how the change of place works; the three
games and their reactions; check results (incl. check:readable); the final sheet path.
