# Launch screen rebuild — layered landscapes and contemplative motion

**Date:** 2026-08-11
**Status:** approved design, not yet implemented.
**Scope:** `components/launch/*` and two new scripts. Nothing outside that directory
changes except the two new `scripts/` files and one line in `package.json`.

---

## 1. Why

The launch screen shows one of six hand-drawn outdoor scenes with a small figure
living in it. The user likes the idea and the idle animation, and dislikes two
things: the **backgrounds**, and three of the six **activities** (kite, tire swing,
picnic blanket).

The backgrounds are not weak because of the drawing. They are weak because of a
rule at the top of `launchScenes.tsx`:

> 1. The sky wash reaches full PAPER by y≈470 and nothing dark is drawn below
>    y=560. That band carries the philosopher quote, always dark ink on light paper.

That reserves roughly **40% of the frame as a blank sheet**. Every reference image
the user supplied — Alto's Odyssey, Firewatch-family dusk pieces, a teal forest, an
amber church at sunset — puts its darkest, crispest, most detailed mass *exactly
there*. The architecture forbids the single thing that makes those pictures work.
Rendering better art into the top half cannot fix it.

The fix is to invert the legibility scheme, which the repo already does elsewhere:
`constants/branchArt.ts` lays a fixed gradient scrim over photographs and sets type
in one fixed cream with its own shadow (CLAUDE.md §19).

## 2. Decisions taken

| # | Decision | Chosen |
|---|---|---|
| 1 | Quote treatment | **Flip it.** Full-bleed scene with a dark foreground; quote in cream over a fixed scrim. |
| 2 | Palette | **One hue family per scene, desaturated.** Six tonal steps each. Not strict B&W, not saturated. |
| 3 | Activities | **Keep walk / sip / read.** Replace kite → thinker, swing → stargazer, picnic → lookout. Six scenes total. |
| 4 | Figure scale | **Per-scene `k`, tuned to equal visual mass** so seated poses do not read smaller than standing ones. |
| 5 | Art module | **New `components/launch/launchArt.ts`**, portrait-authored. Not a reuse or extension of `components/branch/sceneArt.ts`. |
| 6 | Masthead | **Change `PHILOSOPHIZE` → `DEEPLY`.** The app was renamed in `5a5d979`; this screen still shows the old name. |

Decision 2 supersedes the 2026-08-08 note that recorded "muted, not strong colours"
as warm greys only. The reference images the user selected are each essentially one
hue family plus value steps, and that structure — not grey — is what was approved.

Decision 5 rejects reusing `sceneArt.ts` because it is authored for a **1000×360
horizontal road tile** with `NEAR_TOP` at the figure's knee. Cropping a wide strip
into a 400×800 portrait frame discards the sky, which is where the celestial anchor
and most of the depth live. Extending it to serve both orientations was also
rejected: the branch road is shipped, validated by `check:walk`, and tuned over five
rounds of contact sheets; regressing it to serve a new caller is the expensive
failure.

## 3. Architecture

| File | Change |
|---|---|
| `components/launch/launchArt.ts` | **NEW.** Palettes, sky stops, celestial disc, depth planes, crest contours. Pure data and path strings. |
| `components/launch/launchScenes.tsx` | **Rewritten.** Consumes `launchArt`; remains the only file that builds an `<Svg>`. Drops ~330 lines of per-scene hand-drawing. |
| `components/launch/launchMotion.ts` | **Extended.** Three activities out, three in. |
| `components/launch/LaunchFigure.tsx` | **Simplified.** Delete kite and swing prop code (~90 lines). Cup and book stay. |
| `components/launch/LaunchScreen.tsx` | **Chrome only.** Masthead text, chrome colour source, quote colour and scrim. |
| `scripts/sheet-launch.mjs` | **NEW.** Offline contact sheet. |
| `scripts/check-launch.mjs` | **NEW.** Validator; added to `npm run check`. |

### 3.1 `launchArt.ts` — what it exports

```ts
import { STAGE_W, STAGE_H } from '@/components/lesson/cinematic/rig';

export type SceneKey = 'walk' | 'sip' | 'read' | 'thinker' | 'stargazer' | 'lookout';

export interface Palette {
  /** Six tonal steps, index 0 darkest → 5 lightest. One hue family. */
  steps: readonly [string, string, string, string, string, string];
  /** The celestial anchor's fill. May sit slightly warmer than the family. */
  disc: string;
}

export const PALETTES: Record<SceneKey, Palette>;

/** Gradient stops for the sky, top → horizon. */
export function skyStops(key: SceneKey): Array<{ offset: number; color: string }>;

/** The one celestial anchor. Exactly one per scene. */
export function discFor(key: SceneKey): { cx: number; cy: number; r: number; fill: string };

/** 4–6 receding planes, back to front. `d` is path data only — see §6.1. */
export function planesFor(key: SceneKey): Array<{ d: string; fill: string }>;

/**
 * The contour the figure stands on, as PLAIN NUMBERS.
 * Deliberately not a function: the pose is solved inside a Reanimated worklet, and
 * a plain JS closure captured by a worklet is not callable there — it throws
 * "Object is not a function" and takes the app down. Same reason as `groundWave`.
 */
export function crestFor(key: SceneKey): { base: number; amp: number; off: number; per: number };

/** Ink or cream, DERIVED from the sky band's own tone. Never chosen per scene. */
export function chromeOn(key: SceneKey): string;
```

**On imports.** `launchArt.ts` imports `STAGE_W/STAGE_H` from `rig.ts` rather than
redeclaring them. This is safe for offline execution: `scripts/check-moves.mjs`
already transpiles a TS module *and its TS imports* into a temp directory and loads
them in Node via sucrase 3.35.1, which is exactly how `moves.ts` → `./rig` is
handled today. The "zero imports" rule in CLAUDE.md §17 means **no React Native
imports**, not no imports at all. Redeclaring the stage size would reintroduce the
`K_FIG` shadowing trap for no benefit.

## 4. The legibility contract

The two rules at the top of `launchScenes.tsx` are deleted. Their *reasoning* is
kept and inverted: **each element's background is decided by construction, never
guessed per scene.** Three rules replace them, all measured by script rather than
asserted in a comment.

```
┌──────────────────────────────┐  y 0
│  ░ sky · palette steps 4-5 ░ │
│         D E E P L Y          │  ← chrome: chromeOn(key)
│      ◯  celestial anchor     │
│  ▁▂▃ far planes · step 3 ▃▂▁ │
│ ──────────── 62% ─────────── │  ← progress stroke
│  ▂▄ mid planes · step 2 ▄▂   │
│ ═══════ CREST ═══════  ·ᴋ·   │  ← figure: sky behind BODY
│ ▓▓▓ near plane · step 1 ▓▓▓  │
│ ███ foreground · step 0 ███  │
│ ▒▒▒▒▒▒ scrim ▒▒▒▒▒▒▒▒▒▒▒▒▒▒ │
│   "The unexamined life…"     │  ← cream #F4F1EA + shadow
│          — SOCRATES          │
└──────────────────────────────┘  y 800
```

**Rule 1 — chrome colour is derived, not picked.** `chromeOn(key)` computes the
WCAG relative luminance of the sky band's mean tone (the palette steps actually used
between y 0 and y 300) and returns whichever of ink `#1A1A1A` or cream `#F4F1EA`
scores the higher contrast ratio against it. No hand-picking, no per-scene override.
This is what permits a *night* scene to exist: two of the supplied references have
dark skies, and a fixed "the sky is always light" rule would have banned them. A
per-scene hand-picked colour is the failure the current file exists to prevent, and
is not reintroduced.

**Rule 2 — the quote band is a fixed scrim.** Bottom ~26%, gradient to near-solid,
cream `#F4F1EA` with its own shadow. Straight from §19. The welcome end card
measures 8.7:1 with this treatment; the validator holds the launch quote to ≥7:1.

**Rule 3 — the figure is silhouetted against sky, standing on dark.** Replaces
*"nothing is drawn where the figure stands."* His body band — crown to knee — must
have sky or a pale plane behind it; the dark mass sits **below his feet**. This is
the road's `NEAR_TOP` rule ported to portrait, and it is how every supplied
reference stages its figure. Without it the ink figure disappears into the new dark
foreground, which is the failure §17 describes as "not drama, it is the man
vanishing."

## 5. The six scenes

| Scene | Hue family | Celestial anchor | Composition | Reference |
|---|---|---|---|---|
| walk | amber dusk | low sun behind the ridge | long crossing ridge, far mesas, warm haze | desert / Alto |
| sip | pale gold morning | high hazy sun | grass crest, distant ruin on a knoll | grass + ruins |
| read | cool slate | pale disc through mist | layered conifer spires, snow-light | winter forest |
| thinker | forest teal | low glow between trunks | deep canopy, cliff edge, valley below | dark green trees |
| stargazer | dusk blue | large moon, high — the dominant one | sparse stars, far treeline, open slope | red-sun night |
| lookout | muted rose dusk | setting sun, largest disc | receding ridges to a far spire | church sunset |

Starting palette values for three of the six, to be tuned against contact sheets
rather than committed on first guess:

```
forest teal   #16302B  #24473F  #3A6357  #5C8779  #8FB3A4  #C4D8CE
dusk blue     #1B2230  #2C3849  #465468  #6B7A8E  #9BA7B6  #CDD4DC
amber dusk    #3A2A26  #5E4038  #8A5E45  #B98A5E  #DFB98A  #F2DCBC
```

The remaining three — pale gold morning, cool slate, muted rose dusk — are built the
same way and to the same width of ramp: six steps, one hue family, index 0 darkest.
They are authored during implementation rather than pre-specified here, because all
six get tuned together against a single contact sheet.

**Tonal range must be real.** `tone.ts` shipped a first pass at `#FEFEFC`→`#DFDBD1`
— a 7% range — and it read as flat at every size. It needed `#FFFFFF`→`#C6C0B2`
before it registered as shading at all. The ramps above are deliberately wide for
the same reason.

## 6. The animations

`launchStance` in `launchMotion.ts` gains three branches and loses three. All three
new activities are **pure pose — no props**, which is why removing kite and swing is
a net deletion.

```
thinker    postureHold(9)  + postureLive   elbow on knee, chin in hand.
                                           moves.ts:841 already damps this one:
                                           "the thinker barely moves; that is the point"
stargazer  postureHold(5)  + postureLive   reclined, propped on both arms
lookout    actStance(18)   + cycle(...)    hand up, sweep the valley, lower
```

Deleted: `swingPhaseAt`, the `kite` and `pivot` fields on `LaunchScene`, the
`kiteStance` call site, and the rope / tire / kite / string views in
`LaunchFigure.tsx`.

**The governing rule of this file is unchanged: the loop must close.** Every
envelope is a there-and-back — 0 at both ends, so the modulo wrap lands on a pose
identical to the one it left — and nothing visible may teleport. `postureLive` is
continuous rather than windowed; `actStance(18)`'s envelope window must be
**verified by the sampler, not assumed**. Envelope windows are set by running
`check-launch.mjs`, which is what that file is for.

**Worklet ordering.** Any new worklet must be declared before any worklet that calls
it (§17 rule 2). `npm run check:worklets` covers this, with the caveat recorded in
§17 that an earlier version read only the first four lines of a declaration and
skipped anything with a longer signature — so confirm the validator is actually
looking at the new functions.

### 6.1 Figure scale

`k` is already a per-scene field, so decision 4 needs no structural change. Standing
scenes stay at `FAR = 0.6` (103 rig units × 0.6 = 61.8 of an 800-unit stage = 7.7%
of screen height). Seated and reclined scenes take a higher `k` so apparent mass
matches. **The multipliers are measured off the rig in Node, not estimated** — the
figures floated during design (≈0.72 seated, ≈0.80 reclined) are placeholders for
that measurement and must not be committed as-is.

## 7. Verification

### 7.1 `scripts/sheet-launch.mjs`

Renders all six scenes to one PNG through `scripts/lib/rasterpath.mjs`, **with the
figure drawn in** — a backdrop that swallows an ink stickman is invisible otherwise.

This imposes one constraint on `launchArt`: it must emit **path data only**. No
`<Circle>` elements and no `A` (arc) commands — the rasteriser and `sceneArt`'s band
measurement both assume every command's arguments are (x, y) pairs. The current
`launchScenes.tsx` uses `<Circle>` heavily for cumulus puffs and foliage clumps, so
those become paths.

### 7.2 `scripts/check-launch.mjs`

Five assertions. Added to `npm run check`, making it the fourteenth validator.

| # | Assertion |
|---|---|
| 1 | Every scene declares exactly one celestial anchor |
| 2 | Measured contrast: masthead and % ≥ 4.5:1, quote ≥ 7:1, against the composited background |
| 3 | No plane at the palette's darkest two steps inside the figure's crown-to-knee band at his x |
| 4 | Loop closure: sample each activity across its period; the wrap pose equals the start pose |
| 5 | No colour literal in `launchScenes.tsx` that is not from its palette |

### 7.3 On device / in a browser

**A contact sheet cannot catch a module-load or React fault.** It renders path
strings and never imports the component. The `airborne` dead zone passed tsc, three
validators and five contact sheets, and took one browser load to find. So the real
screen gets loaded per §21 before this is called done.

## 8. Risk on the record

`LaunchScreen` animates `sceneScale` 1 → 1.04 over 3800ms on the `Animated.View`
wrapping the full-screen `<Svg>`. §17 rule 7 is explicit that putting an `<Svg>`
under an animated parent **does not** buy the performance exemption — that reading is
what made the branch world unusable on a real phone.

It ships today and `needsOffscreenAlphaCompositing` is set on that view, which may be
making the scale cheap by compositing from a cached offscreen buffer. This cannot be
settled offline. Richer art raises the stakes, so: **measure it on device, and drop
the breathe if it costs frames.** Not silently changed as part of this work.

## 9. Out of scope

- Everything on the loading screen other than the scene art, the six activities, the
  chrome colours and the masthead string. Choreography, timings, the quote pool, the
  progress stroke shape, and `skipAnimation` behaviour are untouched.
- `components/branch/sceneArt.ts` and the six branch roads.
- `LessonLoader`, which is a different screen.
