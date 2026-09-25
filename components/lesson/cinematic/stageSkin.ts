// ─────────────────────────────────────────────────────────────────────────────
// THE PICTURE GETS THE APP'S OWN DEPTH (group AG).
//
// The five tabs were given a depth kit on 2026-09-17 — "a thing you can press
// stands on a hard ledge; a thing you only read is a flat panel with an edge; a
// chosen thing is pressed in" — and the lessons were deliberately left out of it.
// The owner then asked for the other half:
//
//   *"I have recently updated the UI of the app. Everything in the app other than
//    the lessons looks more gamified … can you also do research and look at the
//    kind of design that has been done into lessons? … we will select the gamified
//    look that is in the app as well … that gamified, that really clean, gamified
//    depth look."*
//
// ── WHAT THE RESEARCH SAYS, AND WHERE IT AGREES WITH THE APP ────────────────
//
// Duolingo's illustration rules (design.duolingo.com), which is the reference the
// tab kit was built from and the one the reader keeps naming:
//
//   · every shape is a rounded rectangle, a circle or a rounded triangle, and
//     "pointy shapes are off-brand";
//   · flat fills — no gradients, no glass, no glow;
//   · a shadow sits BELOW a character or an object as a PILL, never an oval,
//     because an oval implies a perspective the drawing does not have;
//   · anything pressable carries a chunky bottom ledge.
//
// The app's own kit says the same thing in its own words, and the lessons already
// had two thirds of it: `stageTones` put a branch hue on every mass and `lip-stage`
// stood every toned plate on a hard shaded lip (T7). What was missing is what makes
// an object sit in a PLACE rather than float on paper — the ground under it — and a
// corner radius that reads as drawn rather than as a diagram's box.
//
// ── WHAT THIS FILE IS ───────────────────────────────────────────────────────
//
// Four decorations, derived from the branch tone the scene already has, applied by
// `scripts/skin-stage.mjs`. NONE of them moves a box: a radius, a shadow and a
// colour change no layout, which is what makes the pass affordable — the must-box
// stamps are renewed by proof (`restamp-lip`'s pattern) rather than by a re-measure.
//
// ZERO REACT, so a checker can load it in plain Node.
// ─────────────────────────────────────────────────────────────────────────────
import { C } from '@/constants/design';
import type { StageTone } from './stageTones';

/** Ink, as the scenes use it — the one line weight and the one dark. */
const INK = C.ink;

/**
 * THE GROUND, as a band rather than a hairline.
 *
 * 172 scenes lay a floor of flat `RULE` from the ground line to the foot of the
 * band; before that the figure and everything he looked at stood on 1.5 units of
 * rule and bare paper. The band was the single biggest lift in the tonal pass, and
 * it is still only a flat fill.
 *
 * So it gets the two edges an object gets: a LIT hairline along the top, where the
 * light this app has always used (top left, never moving) would catch the near edge
 * of the ground, and the tone's own SHADE along the foot, which reads as the floor
 * turning away. Both are inside the band's own box.
 */
export function floorStyle(tone: StageTone, ground: number) {
  return {
    position: 'absolute' as const,
    left: 0,
    right: 0,
    top: ground,
    bottom: 0,
    backgroundColor: tone.RULE,
    borderTopWidth: 1.5,
    borderTopColor: '#FFFFFF',
    boxShadow: `inset 0px -7px 0px ${tone.SHADE}`,
  };
}

/**
 * THE LEDGE A PLATE STANDS ON.
 *
 * `lip-stage` gave every toned plate `0px 3px 0px SHADE`, which is the Duolingo
 * button's own construction — a hard band of a darker tone under the face, not a
 * blur. This adds the second half of it: a soft ink drop one unit further down, so
 * the plate also casts onto whatever it is standing on. Duolingo's own is 4px of
 * ledge on a 90px tile; a lesson's plates are 24–40 units tall, so 3 plus a 2-unit
 * drop is the same proportion.
 */
export function lipOf(tone: StageTone): string {
  return [
    // The top edge, lit from inside: the same top-left light everything struck in
    // this app has used since `tone.ts`, and the one thing that makes a flat fill
    // read as a FACE rather than as a shape. Inside the plate's own box, so it
    // moves no layout.
    'inset 0px 1.5px 0px rgba(255, 255, 255, 0.85)',
    // The ledge — a hard band of the tone's own shade, not a blur.
    `0px 4px 0px ${tone.SHADE}`,
    // …and what the plate casts onto whatever it is standing on.
    '0px 6px 0px rgba(26, 26, 26, 0.12)',
  ].join(', ');
}

/**
 * THE CORNER A PLATE TURNS.
 *
 * Measured across the corpus before the pass: 210 plates at radius 3, 282 at 4,
 * 163 at 2, and 89 at 1.5 or less. At 2 units on a 28-unit plate the corner is a
 * diagram's box; Duolingo's smallest radius is a quarter of the shape's short side.
 * This is the floor a codemod raises a plate to — not the ceiling, because a scene
 * that has drawn a real object with its own radius keeps it.
 */
export const PLATE_RADIUS = 8;

/**
 * THE FACE OF A TILE — white, like the app's own cards.
 *
 * The owner chose it from three rendered options of the same real lesson: today's
 * tinted tile, the tinted tile with the new depth, and this. Two reasons it is the
 * right answer rather than the prettiest one:
 *
 *   · **it is the kit the rest of the app already uses.** The five tabs draw a
 *     raised surface as white on a hairline with a hard ledge, and the owner's ask
 *     was explicitly to bring the lessons into that.
 *   · **it drops the beige.** `STONE` is the branch hue at L\* 81 — a tan on the
 *     warm branches — and a face of it is exactly the "gold look in the background
 *     of a lot of the information" the owner had removed from every other surface
 *     (§7). The hue does not leave the stage; it moves to the GROUND, the LEDGE and
 *     the shaded side, which is where this app has always kept its colour.
 *
 * ONLY A TILE. A mass — a stone, a wall, a hull, a hill — keeps its tone, because
 * a white stone is not a stone (A1), and because `check:shade` counts filled tonal
 * masses per scene and a white face on paper is not one. `skin-stage` tells them
 * apart by construction rather than by name: a tile is bordered, rounded, small
 * enough to hold a word, and CENTRES something.
 */
export const PLATE_FACE = '#FFFFFF';

/**
 * THE SHADOW UNDER A FIGURE, AS A PILL.
 *
 * *"shadows always appear below characters and objects as a pill shape — never an
 * oval, because ovals imply perspective."* This app's whole drawing is flat and
 * seen straight on, so the rule applies exactly.
 *
 * It is drawn by `Stickman` rather than by a scene, so every figure in every lesson
 * gets it — and it is sized from the figure's own scale, because a fixed pill under
 * a figure drawn at 1.16× reads as a puddle he is standing beside.
 *
 * ── AND ITS FIRST DRAWING WAS A GREY OBJECT, NOT A SHADOW ───────────────────
 *
 * The owner: *"I dont want that gray thing at the stickmans feet that follows him
 * around, I like the idea of a shadow but this doesnt look very good."* Rendered
 * through the real rig onto the real floor (`sheet:shadow`), it was three separate
 * faults and only the first needs a new mechanism:
 *
 *   · A HARD EDGE. It was a flat 16% slab with a hard boundary, in an app where
 *     every struck thing has a lit or shaded edge. A hard-edged grey capsule is
 *     an object lying on the floor; at this alpha it is *"a gray thing"* exactly.
 *   · WIDER THAN HE IS. 34 units against a foot span of about 12, so it stood 11
 *     units clear on each side and read as a mat he was standing on.
 *   · ACROSS THE GROUND LINE, not below it. Centred on his ankles, half its height
 *     lay on PAPER above the floor and it crossed the floor's own white hairline —
 *     a grey lozenge laid over a boundary.
 *
 * ── A FILL PLUS A HALO, AND THE RATIO IS THE WHOLE TRICK ────────────────────
 *
 * The obvious soft shadow — a transparent View with a blurred `boxShadow` — does
 * not work: CSS clips an outer box-shadow to OUTSIDE the border box, so what comes
 * back is a hollow RING with its middle knocked out. What works is a fill and a
 * halo together, and the seam between them is invisible at exactly one ratio. A
 * gaussian across a step edge reads half the inside value AT the edge, so the fill
 * must be half the halo's alpha — otherwise there is a visible step where the box
 * ends, which is the hard edge back again under a blur.
 *
 * THIS IS THE FIRST BLURRED SHADOW IN THE APP. Every other `boxShadow` here is a
 * hard band at 0px blur, on purpose (see `lipOf`). The failure mode is the reason
 * that is acceptable: if a platform ignores the blur, what is left is the fill —
 * a narrower, quieter pill sitting below the hairline, which is still better than
 * what it replaced and never worse.
 */
export const PILL_ALPHA = 0.26;

export function pillStyle(k: number) {
  const w = 26 * k;
  const h = 3 * k;
  return {
    position: 'absolute' as const,
    left: -w / 2,
    // BELOW the ground line rather than across it: `Stickman` translates this to
    // the ankle, and the floor's lit top edge starts there.
    top: -h / 2 + 1.5 * k,
    width: w,
    height: h,
    borderRadius: h / 2,
    backgroundColor: `rgba(26, 26, 26, ${PILL_ALPHA / 2})`,
    boxShadow: `0px 0px ${7 * k}px rgba(26, 26, 26, ${PILL_ALPHA})`,
  };
}

/** The ink the pill and the drop are mixed from, for a checker to re-derive. */
export const SKIN_INK = INK;
