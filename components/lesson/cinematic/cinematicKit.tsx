import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet, type LayoutChangeEvent } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withRepeat, withSequence, withSpring,
  makeMutable, Easing, FadeInDown, LinearTransition, runOnJS, type SharedValue,
} from 'react-native-reanimated';
import SketchIcon from '@/components/shared/SketchIcon';
import { XP_PER_CORRECT_ANSWER } from '@/constants/xp';
import { C, RADIUS, LIP } from '@/constants/design';
import { ease01, seg, type Stance } from './rig';

// ─────────────────────────────────────────────────────────────────────────────
// Shared kit for cinematic lessons — the parts that are identical across every
// lesson, extracted from the logic-arguments-1 / -2 players so a new lesson is
// just a SCRIPT (beats) + a SCENE (the animated stage). This module owns the deck
// (the sequential Fade, the narration, the graded/tap questions, the saveable
// quote card, the summary) and the small shared vocabulary of types and tokens.
//
// The player shell lives in CinematicPlayer.tsx; the scene is per-lesson.
// ─────────────────────────────────────────────────────────────────────────────

export const INK = '#1A1A1A';
export const PAPER = '#FAFAF7';
export const SOFT = '#6B6B6B';
export const RULE = '#E4E1D8';

// ── THE TONAL RAMP: THREE GREYS THAT DID NOT EXIST, AND WHY THEY DO NOW ──────
//
// A reader named two lessons — `political7` (Where Rights Come From) and
// `political8` (the fence) — and asked for what they have:
//
//   "I really like all the animations, all of the artwork … the idea of adding
//    different dark shading in there that the political philosophy lesson has. It
//    looks really good when there's different contrasts of darker shading."
//
// Counted out of the source, the difference is exact and it is not about
// animation at all. Those two scenes lay down SEVEN and TEN filled tonal masses;
// **81 of the 184 scenes use exactly one, and 48 use two.** A lesson with one tone
// is an outline diagram on white — two values, no depth — and that is what most
// of the corpus was. political7 puts a light-grey stone slab, a white card and a
// dark seal in the same picture, and it reads as objects standing in a space.
//
// The palette could not express that. It ran PAPER · RULE · SOFT · INK, and the
// step from RULE to SOFT is the whole middle of the range in one jump: there was
// nowhere to put a mass that is plainly darker than the paper but plainly not ink.
// These two fill it, and they are still greys — no hue, so §19's rule that the
// identity does not bend is untouched.
//
// ── WHAT MAY SIT ON THEM, MEASURED ──────────────────────────────────────────
//
//   tone            INK on it     SOFT on it
//   RULE  #E4E1D8     13.31           4.08     ← the light mass, already here
//   STONE #CFCABC     10.63           3.26     ← SOFT fails here
//   SHADE #A8A296      6.86           2.10     ← and here, badly
//
// So the rule that comes with them, and `check:shade` enforces it: **type on a
// tone is INK.** SOFT is a 5.1:1 grey on paper and it does not survive being put
// on a grey — the identical trap §19 records three times over for metal tones
// reaching onto paper. Below RULE, ink is the only text colour.
//
// ── AND ONE LIGHT, AS EVERYWHERE ELSE ───────────────────────────────────────
//
// If a mass takes two tones to read as solid, the lighter one goes on the
// top-left face and the darker on the bottom-right, exactly as `tone.ts` lights
// every rank pin and badge. Seventy-five marks lit from one direction read as a
// set; lit from wherever suited each one they read as clip art, and a stage full
// of props is no different.
// THERE IS NO TONE BETWEEN PAPER AND RULE, AND THAT WAS TRIED.
//
// A `WASH` at #EFEDE6 was added here first, as "a breath above the paper". It was
// applied to eighteen scenes, rendered, and photographed — and it is WHITE. §19
// had already measured why and the note was not read: "a 7% tonal range is
// invisible", and paper to wash is 11%. RULE is the light mass, it is 21% off the
// paper, and `political7` fills its tablet with it precisely because that reads.
// A tone nobody can see is worse than no tone: it is a trap for the next author,
// who will believe the source and not the screen.
/** A true light-mid — slabs, tablets, walls, anything meant to read as a mass. */
export const STONE = '#CFCABC';
/** A real mid — the shaded side of a mass, or a heavier object behind a lighter one. */
export const SHADE = '#A8A296';

// ── THE ANSWER STATES, AND WHY THIS IS NOT A NEW COLOUR ──────────────────────
//
// H60 says a SCENE gets four colours and no more, and that stands — the picture
// stays ink on paper, and validate-cinematic still fails any *Scene.tsx carrying
// a hex. These four are for the CHROME: the progress rail, the answer reveal,
// the explanation panel. Nothing here is ever handed to a scene.
//
// They are not invented. `components/lesson/theme.ts` — the CARD runner, the
// format this one is replacing — has carried exactly this pair since before the
// first cinematic lesson existed, and MultipleChoice, TrueFalse and TapFlaw all
// tint their answered rows with it. `constants/design.ts` then adopted the same
// two hexes as `C.correct` / `C.wrong` for the whole app.
//
// So the odd one out was the cinematic deck. Measured across both runners: a
// card-deck reader who answers gets a green row and a red row; a cinematic
// reader who answers gets a border that goes from 2px to 3px. The format that is
// taking over had the WEAKER feedback of the two, and it is the one 132 of 222
// lessons use. That is the gap this closes — the app's existing answer palette,
// carried into the format that inherited everything else.
//
// The tints come from design.ts where it has them (`C.wrongSoft`) and from the
// card runner's measured pair where it does not (`greenBg`), rather than being
// eyeballed here.
export const RIGHT = C.correct;        // #4F7A4A
export const RIGHT_BG = '#EAF1E6';     // theme.ts greenBg — the pair it was measured against
export const WRONG = C.wrong;          // #A8513F
export const WRONG_BG = C.wrongSoft;   // #F7E9E9

/** The unfilled part of the progress rail. `RULE` is the SCENE's hairline and is
 *  too faint to read as an empty track at 10px tall; this is the card runner's
 *  `segOff`, which was chosen for exactly this job. */
export const TRACK_OFF = '#E2DED4';

export const STAGE_W = 400;
export const STAGE_H = 560;
export const GROUND = 500;

// WHY LESSONS SHOULD DECLARE A BAND.
//
// The stage REGION on a phone is wide and short (roughly 923×647 device px) while
// this design space is tall and narrow (400×560). Fitting all 560 in letterboxes
// the scene to about 1.15× and throws away half the available width — which is
// exactly why the animations read small. Most scenes leave the top third as empty
// sky, so cropping to the slice that actually holds art and scaling THAT up is free
// size: a lesson whose art lives in y 180..510 fits at ~1.96× instead of 1.15×,
// nearly doubling everything on screen.
//
// The default below is the whole space, so a lesson that declares nothing is never
// silently clipped. Every lesson should pass its own measured [top, bottom] to
// CinematicPlayer — it must contain EVERY prop the scene draws (remember a figure
// standing on GROUND=500 has its crown at about y=361), and if the scene applies a
// camera translation, measure the band AFTER that shift.
export const BAND_T = 0;
export const BAND_B = STAGE_H;
// HOW BIG THE FIGURE SHOULD BE.
//
// It was 1.35 — 103 rig units × 1.35 = 139 stage units. Against a typical declared
// band of 280–330 that is HALF the visible height, and on a phone it came out at
// 42–47% of the stage region: one character filling the frame while the props it is
// meant to be talking about sat around it like furniture in a doll's house. The
// figure was never wrong in isolation; it was wrong relative to everything else,
// which is exactly the complaint.
//
// The band crop is what surfaced it. Cropping to the art doubled the on-screen size
// of the whole scene, and the figure — already the tallest thing in most scenes —
// grew with it.
//
// 1.0 puts the figure at 103 units: about a THIRD of a typical band (31–35% of the
// stage region on a phone), which is where a character sits in an illustrated scene
// without dominating it. It is still ~230px tall on the device, so nothing is lost
// in legibility. Its crown drops from y 361 to y 397, so every band measured to
// hold the old crown still holds this one — a shorter figure cannot clip.
//
// What this DOES affect is reach: a hand that just touched a board or a lever at
// 1.35 now falls about a quarter shorter, so any scene where the figure makes
// contact with a prop needs its x (or the prop) nudged to meet again.
export const K_FIG = 1.0;                  // stage units per rig unit
export const XFADE = 420;                  // beat-to-beat deck fade (ms)
export const COMPLETION_XP = 5;            // matches LessonRunner

// What the reader is TOLD a right answer is worth. Derived, never typed: this line
// read "+5 XP" for a while after the model went to 10 per correct answer, so every
// cinematic lesson quietly promised the reader less than half of what it paid.
export const CORRECT_LABEL = `Correct  ·  +${XP_PER_CORRECT_ANSWER} XP`;

// ── the narrator's manner (group M) ───────────────────────────────────────────
// The figure below the words is the one saying them, so his body has to agree
// with their tone (A1). These are the four poses that read as *put upon* — codes
// into the wide emote library in `rig.ts`, named so a scene asks for an attitude
// rather than for a number.
//
// They are the smallest half of the character. The voice is in the writing rules
// (group M of docs/LESSON_RULES.md); this is what stops the picture undercutting
// it by standing there explaining cheerfully.
export const SIGH = {
  FOLDED: 10,   // arms crossed — waiting, visibly, for the point to land
  SHRUG: 8,     // 'well, that is what the man said'
  HIP: 9,       // a hand on the hip — patience, and you can see it
  TEMPLE: 11,   // a hand to the head — he has explained this before
} as const;

// ── shared beat vocabulary ─────────────────────────────────────────────────────
export interface Choice { id: string; text: string; correct: boolean }
export interface Say { who: string; text: string }
export interface QuoteBlock {
  id: string; text: string; author: string; work: string; era: string;
  philosopherId?: string; branchSlugs?: string[];
}
export interface QBlock { prompt: string; options: Choice[]; explain: string; xp?: number }
export interface SummaryBlock { title: string; points: string[]; closing: string }
/**
 * A SCENE-DRIVEN graded question: the answer UI lives IN the animated stage (tap an
 * object, choose a path, tip a balance, feed a machine) rather than as a text list.
 * The scene renders its own targets and calls `onPick(id, correct)`; the deck shows
 * only this prompt and, once answered, the explanation. Scored exactly like `mc`.
 */
/**
 * One of the two short choices a `cards` question puts on the picture.
 *
 * `text` is held to a few words by `validate-cinematic`, which is the whole
 * point of the format: the A/B/C/D deck it replaces asked a reader to get
 * through four sentences to answer one question, and three of them were wrong.
 */
export interface ChoiceCard { text: string; correct: boolean }

/**
 * One region of a `drag` question's line (see ./DragScale).
 *
 * `reads` is the word shown above the knob while it is in here, and it is the part
 * that TEACHES: the reader hunts the boundary by watching "a hunch" give way to "a
 * good bet" give way to "knowledge". It is lesson copy under group J, not scoring
 * furniture — keep it to a few plain words.
 */
export interface ScaleZone {
  id: string;
  /** This zone's right-hand edge as a fraction of the rail. The last must be 1. */
  upto: number;
  /** The reading shown while the knob is inside this zone. */
  reads: string;
  correct?: boolean;
}

/**
 * A graded question whose answer is a POSITION on a line rather than a choice.
 *
 * For the "how much" questions — how much may a society tolerate, how simple should
 * an explanation be, how sure are you — where offering two cards would answer the
 * interesting half of the question for the reader.
 */
export interface DragBlock {
  /** Label under the left end of the rail. */ lo: string;
  /** Label under the right end. */ hi: string;
  /** Where the knob starts, 0..1. Keep it OUT of the correct zone. */ start: number;
  /** Left to right, each `upto` greater than the last, the final one exactly 1. */
  zones: ScaleZone[];
}

// ─────────────────────────────────────────────────────────────────────────────
// FOUR MORE WAYS TO ANSWER, AND WHY A FIFTH SHAPE WAS WORTH BUILDING
//
// `drag` proved the point that a graded question does not have to be a pick: a
// reader who has to FIND the boundary learns where it is, and a reader handed two
// cards has had the interesting half answered for them. These extend the same
// idea to four more question shapes philosophy actually asks, and they came from
// the reader in as many words:
//
//   > "I want a similar way the learning app Brilliant does their questions. With
//   >  interactive questions, leavers being moved, line graphs that you slide …
//   >  lines that you slide a bar from one side to the other or the middle."
//
// Each one is a DIFFERENT QUESTION, not a different skin on the same one:
//
//   · `lever`  — which SETTING. Discrete, named, rotational. The reader swings an
//     arm into a slot, so the choice feels like throwing a switch rather than
//     landing on a number. For "what is punishment FOR", where the options are
//     positions and not amounts.
//   · `plot`   — what SHAPE. Five columns the reader draws a curve across with one
//     finger; graded on the shape they drew, not on any single value. For "what
//     happens to X as Y increases", which is a claim no pick can express.
//   · `split`  — how it DIVIDES. One bar, two labelled sides, a seam the reader
//     drags; the two numbers always sum to a hundred. For "how much of this is
//     intended and how much merely foreseen", where the trade-off IS the lesson.
//   · `field`  — where it sits in TWO dimensions at once. A pad with a labelled
//     axis each way and four named quadrants. For the questions whose whole
//     content is that two independent things are being confused — necessary
//     against sufficient, interference against domination, past against future.
//
// ALL FOUR ARE ANALOGUE AND ALL FOUR DRIVE THE SCENE. Like `drag`, the control's
// position is a shared value the PLAYER owns, so the picture moves under the
// reader's thumb rather than sitting next to a widget (see SceneApi.dragPos, and
// dragPos2 for the second axis a `field` needs).
// ─────────────────────────────────────────────────────────────────────────────

/** One named detent on a `lever`. */
export interface LeverStop {
  id: string;
  /** The word under this slot, and what the readout says when the arm is in it. */
  reads: string;
  correct?: boolean;
}

/** A graded question answered by swinging an arm into one of a few named slots. */
export interface LeverBlock {
  /** Left to right, two to five of them. */ stops: LeverStop[];
  /** Which slot the arm starts in. Keep it OFF the correct one. */ start: number;
}

/** One shape a `plot` will recognise, as a profile the drawn curve is matched to. */
export interface PlotShape {
  id: string;
  /** One value per column, 0..1. Must be the same length as `cols`. */
  profile: number[];
  /** What the readout calls this shape while the drawn curve is nearest to it. */
  reads: string;
  correct?: boolean;
}

/** A graded question answered by drawing a curve across a few columns. */
export interface PlotBlock {
  /** The column labels, left to right. Three to six. */ cols: string[];
  /** What the vertical axis measures, shown up its left side. */ axis: string;
  /** Where each column starts, 0..1. Same length as `cols`. */ start: number[];
  /** The shapes this question knows. The drawn curve is scored to the nearest. */
  shapes: PlotShape[];
}

/**
 * One region of a `split` bar, by where the seam sits.
 *
 * ── THE SEAM'S POSITION IS THE **LEFT** SIDE'S SHARE ────────────────────────
 *
 * `SplitBar` prints `pos * 100` under `left` and `100 - pos * 100` under `right`.
 * So `upto: 0.34` is the zone where the LEFT side holds about a third and the
 * RIGHT side holds two thirds, and `upto: 1` is where the LEFT side holds nearly
 * all of it. Read it the other way round and the readout ends up in flat
 * contradiction with the two numbers printed beside it:
 *
 *     IN THE NOTES  34        66  IN THE LISTENER
 *              "the sadness sits in the sound"        <- says the opposite
 *
 * Six blocks shipped that way, because this line did not used to say so. Nothing
 * catches it: the types are satisfied, the control works, the zone boundaries are
 * legal, and only reading the sentence against the number finds it. **Write the
 * high-`upto` zone as the one where `left` wins**, then read all three back.
 */
export interface SplitZone {
  id: string;
  /** This zone's right-hand edge as a fraction of the bar — see above: it is the LEFT side's share. */
  upto: number;
  /** The reading shown while the seam is in here. */ reads: string;
  correct?: boolean;
}

/** A graded question answered by dividing one bar between two labelled sides. */
export interface SplitBlock {
  /** The left side's name. A HIGH seam means THIS side has nearly all of it. */ left: string;
  /** The right side's name. A LOW seam means THIS side has nearly all of it. */ right: string;
  /** Where the seam starts, 0..1. Keep it OUT of the correct zone. */ start: number;
  zones: SplitZone[];
}

/** One quadrant of a `field`, named by which half of each axis it occupies. */
export interface FieldQuad {
  id: string;
  /** 0 = left half, 1 = right half. */ x: 0 | 1;
  /** 0 = bottom half, 1 = top half. */ y: 0 | 1;
  /** The reading shown while the token is in this quadrant. */ reads: string;
  correct?: boolean;
}

/** A graded question answered by placing one token on a two-axis pad. */
export interface FieldBlock {
  /** The horizontal axis, low end then high end. */ xLo: string; xHi: string;
  /** The vertical axis, low end then high end. */ yLo: string; yHi: string;
  /** Where the token starts. Keep it OUT of the correct quadrant. */
  start: [number, number];
  /** All four quadrants, in any order. */ quads: FieldQuad[];
}

export interface InteractBlock {
  prompt: string; explain: string; xp?: number;
  /**
   * Two short choices the PLAYER draws on the stage (see ./ChoiceCards).
   *
   * Omit it and the scene draws its own answer targets, exactly as the original
   * 82 interact lessons do — this is an addition to that mechanic, not a
   * replacement for it. Having both behind ONE block type is deliberate: the
   * scoring path, the deck panel and the XP are already right for `interact`,
   * and a third question type would have been a third thing to keep in step.
   */
  cards?: [ChoiceCard, ChoiceCard];
  /**
   * A line the reader drags a knob along (see ./DragScale). Mutually exclusive with
   * `cards` in practice — a question is either "which of these" or "how much".
   */
  drag?: DragBlock;
  /** An arm swung into a named slot (see ./LeverPick). */
  lever?: LeverBlock;
  /** A curve the reader draws across columns (see ./ShapePlot). */
  plot?: PlotBlock;
  /** One bar divided between two sides (see ./SplitBar). */
  split?: SplitBlock;
  /** A token placed on a two-axis pad (see ./FieldPick). */
  field?: FieldBlock;
}

/** Every lesson's Beat extends this; the shell reads only these common fields. */
export interface BaseBeat {
  text?: string;
  cite?: string;
  say?: Say[];
  quote?: QuoteBlock;
  tap?: QBlock;                            // ungraded teaching tap
  mc?: QBlock;                             // graded question (A/B/C/D in the deck)
  interact?: InteractBlock;                // graded question answered IN the scene
  summary?: SummaryBlock;
  /**
   * Where the figure stands on this beat, in stage x — the camera's x track.
   *
   * It lives on the BASE beat rather than on each lesson's own beat type because
   * `validate-cinematic` can only check a camera it can READ: the 45 converted
   * scenes all declare `const X = BEATS.map((b) => b.x ?? N)`, and a scene whose
   * beat type had no `x` compiled, ran, and was reported as "camera went
   * unchecked" — a shot nothing verifies against its band, which is the one thing
   * H60 exists to prevent. Declaring it once here is what makes the remaining
   * conversions checkable instead of merely working.
   *
   * Optional, and omitting it is normal: a scene whose figure does not move reads
   * `b.x ?? <its standing x>` and gets a constant track, which is the honest
   * input — `followMoves` then gives it the still-figure rhythm rather than
   * inventing travel that is not in the picture.
   */
  x?: number;
  /**
   * A rectangle in scene coordinates the camera MUST contain on this beat (H60c).
   *
   * Almost never written by hand: the measured union of each beat's on-stage words
   * lives in ./mustBoxes.ts, generated from the real render, and CinematicPlayer
   * reads it automatically. This is the override for the case measurement cannot
   * see — art with no text in it that the beat is nonetheless about, a prop the
   * narration points at, a diagram made of lines. Set it and it wins over the
   * measured box.
   *
   * It can only ever make the shot WIDER (see `containShot`), so declaring one is
   * safe: a beat whose camera already showed the rectangle is left exactly alone.
   */
  must?: readonly [x: number, y: number, w: number, h: number];
  dur: number;
}

/** Beats that hold the reader until they answer, rather than until they tap. */
export function gates(b: BaseBeat) { return Boolean(b.tap || b.mc || b.interact); }

// ── NOTHING MAY TELEPORT (group L) ────────────────────────────────────────────
//
// CinematicPlayer rewinds the beat clock during render — `bt.value = 0` — and
// every scene then builds its figure from
//
//     const n = bi.value, p = n - 1;
//     const tr = ease01(bt.value / 0.7);
//     mixStance(emoteHold(P[p], t), emoteLive(P[n], t, bt.value), tr)
//
// which hides two discontinuities, and a reader found both: "it looks as if there
// is a glitch on screen, or a frame miss."
//
//   1. THE SOURCE IS THE WRONG POSE. The new blend starts from `P[p]`, the pose
//      the last beat was heading TOWARD — not the pose actually on screen. Tap
//      before the blend finished and the figure covers the whole remaining
//      distance in one frame. The jump is (1 − tr_reached) × the gap, which is
//      exactly why it worsens the faster the reader taps.
//   2. THE GESTURE'S OWN CLOCK RESTARTS. `emoteLive(code, t, bt)` uses `bt` as the
//      gesture's local phase, so a hand halfway through a swing snaps back to the
//      beginning of that swing even when the blend fraction was already done.
//
// Measured over all 112 scenes with `npm run check:smooth`: the worst limb moved
// 3.0 units a frame when the reader waited and 24.9 when they did not, with a
// worst case of 40.5 — a hand crossing a tenth of the stage between two frames.
//
// THE FIX IS TO REMEMBER WHAT WAS ON SCREEN. `held` keeps the last stance the
// scene actually emitted; at a beat change that becomes the new blend's source,
// so the first frame of the new beat is identical to the last frame of the old
// one and the motion continues from there. It cannot pop, whatever the tap rate,
// because the two frames either side of the change are the same picture.

/** The three shared values `carryFrom` needs. One call per figure in a scene. */
export function useHeld() {
  return {
    last: useSharedValue<Stance | null>(null),
    from: useSharedValue<Stance | null>(null),
    seen: useSharedValue(-1),
  };
}
export type Held = ReturnType<typeof useHeld>;

/**
 * The pose a blend should start from: whatever was last drawn.
 *
 * `fallback` is used only on the very first frame of a lesson, when nothing has
 * been drawn yet — pass the scene's usual `emoteHold(P[p], t)` for that.
 */
export function carryFrom(held: Held, n: number, fallback: Stance): Stance {
  'worklet';
  if (held.seen.value !== n) {
    held.seen.value = n;
    held.from.value = held.last.value;
  }
  return held.from.value ?? fallback;
}

/** Record what was drawn, so the next beat change can start from it. */
export function keepHeld(held: Held, s: Stance): Stance {
  'worklet';
  held.last.value = s;
  return s;
}

/**
 * A facing that turns instead of mirroring.
 *
 * `pose()` takes `dir` as a raw ±1, so a scene that turns the figure round flips
 * the sign between two frames and the whole man inverts at once — measured at 31
 * units, and unlike the blend defect it happens however patiently the reader
 * taps. Easing the sign through zero turns him through a profile instead, which
 * is what a body does. Feed it `bt` and the beat's own facing.
 */
export function facing(from: number, to: number, t: number, dur = 0.36): number {
  'worklet';
  if (from === to) return to;
  const u = t <= 0 ? 0 : t >= dur ? 1 : t / dur;
  return from + (to - from) * (u * u * (3 - 2 * u));
}

// ── …AND EVERY OTHER TRACK, WHICH HAD THE SAME DEFECT AND NO LIMB TO SHOW IT ──
//
// `carryFrom` above fixed the STANCE. It did not fix anything else, and a scene
// interpolates far more than a stance:
//
//     fig:  pose(s, lerp(X[p], X[n], tr), …)     ← where he STANDS
//     film: lerp(FILM[p], FILM[n], tr)           ← a prop's opacity
//     shut: lerp(SHUT[p], SHUT[n], ease01(seg(tr, 0.4, 1)))
//
// Every one of those starts its blend at `T[p]` — the value the PREVIOUS beat was
// heading toward, not the value on screen — so a tap before the blend finished
// covers the rest of the distance in a single frame, exactly as the stance did.
// The jump is `(1 − tr_reached) × (T[n] − T[p])`.
//
// It went unnoticed for as long as it did because `scripts/check-smooth.mjs`
// draws the figure at a FIXED x=200 and measures limbs only. Replaying the real
// tracks instead: **166 units in one frame** in metaphysics7 — the man crossing
// 40% of the stage between two frames — with 49 tracks over the 8-unit line
// across 89 scenes. The file said this could happen and nothing measured it:
// "a prop interpolated as lerp(TRACK[p], TRACK[n], tr) has the identical defect
// and merely has no limb for the checker to measure."
//
// `carry` is `lerp` with a memory. Same three numbers, plus which slot to
// remember it in, and it blends from what it last returned.
//
//     lerp(X[p], X[n], tr)            →  carry(cv, 0, n, X[p], X[n], tr)
//
// THE MULTIPLIER GOES INSIDE IT, and that is not a convenience. The house pattern
// for "only the thing that changed re-draws itself" (C20c / H58) is
//
//     film: lerp(FILM[p], FILM[n], tr) * (filmFade ? grow : 1)
//
// so what reaches the screen is the product. Carry the bare lerp and the memory
// is of a value that was never drawn: interrupt a fade-in at 0.10 and the next
// beat — which has nothing to fade, so no `grow` — resumes from 0.29 and the prop
// pops brighter on the tap. Passing `mul` makes the remembered value the drawn one.
export interface Carry {
  seen: SharedValue<number>;
  from: SharedValue<number>[];
  last: SharedValue<number>[];
}

/**
 * One call per scene. `n` is how many `carry()` sites the scene has — the codemod
 * and `check:smooth` both count them, and an undersized bag is a build failure
 * rather than a silent hold at the wrong value.
 */
export function useCarry(n: number): Carry {
  // makeMutable inside a useMemo rather than n calls to useSharedValue: the count
  // is a module constant per scene so a hook loop would in fact be legal, but this
  // keeps the scene's hook count at one whatever it grows to — and rule 1 of §17
  // is about hook counts changing between renders.
  const slots = useMemo(
    () => ({
      from: Array.from({ length: n }, () => makeMutable(NaN)),
      last: Array.from({ length: n }, () => makeMutable(NaN)),
    }),
    [n],
  );
  return { seen: useSharedValue(-1), from: slots.from, last: slots.last };
}

/**
 * `lerp(prev, next, tr)` that starts from whatever it last drew.
 *
 * The snapshot is taken by whichever site runs first on the beat's first frame,
 * so a scene with two derived values sharing one `cv` still takes exactly one.
 */
export function carry(
  cv: Carry, k: number, n: number, prev: number, next: number, tr: number, mul = 1,
): number {
  'worklet';
  if (cv.seen.value !== n) {
    cv.seen.value = n;
    for (let j = 0; j < cv.from.length; j++) cv.from[j].value = cv.last[j].value;
  }
  const a = cv.from[k].value;
  // NaN only on the lesson's very first beat, when nothing has been drawn yet —
  // there `T[p]` IS the right source, because it is also what is on screen.
  const src = a === a ? a : prev;
  const v = (src + (next - src) * tr) * mul;
  cv.last[k].value = v;
  return v;
}

// ── beat-to-beat transition (SEQUENTIAL) ──────────────────────────────────────
// Fade the deck fully out, swap content while invisible, fade back in. `render`
// (not children) produces content only when it changes: a beat change (`trigger`)
// fades; an in-beat change (answering, saving a quote) swaps live via `revision`.
export function Fade({
  trigger, revision, duration, render, onSwap,
}: {
  trigger: number; revision: string; duration: number; render: () => React.ReactNode;
  /**
   * Fired at the instant the content is exchanged — which is the one moment the
   * deck is fully invisible. Anything that changes the LAYOUT around the deck has
   * to happen here, or it happens while the old content is still on screen.
   */
  onSwap?: () => void;
}) {
  const OUT = Math.round(duration * 0.4);
  const IN = Math.round(duration * 0.6);
  const vis = useSharedValue(1);
  const renderRef = useRef(render);
  renderRef.current = render;
  const [content, setContent] = useState<React.ReactNode>(() => render());
  const lastTrigger = useRef(trigger);
  const lastRev = useRef(revision);
  const mounted = useRef(false);

  // Build the new content ON THE JS THREAD — a withTiming completion callback is a
  // worklet, and building React elements there crashes the screen. Always runOnJS.
  const onSwapRef = useRef(onSwap);
  onSwapRef.current = onSwap;
  const swap = useCallback(() => {
    setContent(renderRef.current());
    onSwapRef.current?.();
  }, []);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      lastTrigger.current = trigger;
      lastRev.current = revision;
      return;
    }
    if (trigger !== lastTrigger.current) {
      lastTrigger.current = trigger;
      lastRev.current = revision;
      vis.value = withTiming(0, { duration: OUT, easing: Easing.in(Easing.quad) }, (fin) => {
        if (fin) runOnJS(swap)();
      });
    } else if (revision !== lastRev.current) {
      lastRev.current = revision;
      swap();
    }
  }, [trigger, revision]);

  useEffect(() => {
    if (!mounted.current) return;
    vis.value = withTiming(1, { duration: IN, easing: Easing.out(Easing.cubic) });
  }, [content]);

  const style = useAnimatedStyle(() => ({
    opacity: vis.value,
    transform: [{ translateY: (1 - vis.value) * 6 }],
  }));

  return <Animated.View style={[styles.fadeWrap, style]}>{content}</Animated.View>;
}

// ── speech bubble (positioned by the scene) ───────────────────────────────────
//
// WHY THIS GROWS FROM ITS TAIL.
//
// A View scales about its CENTRE. This bubble is anchored by one corner (left/right
// + top) and its width is whatever the text makes it — so scaling it from 0.6 walked
// the whole box diagonally into place: on a 150-wide bubble the left edge started 30
// units inboard and slid outward as it inflated, and the top edge rose 8 at the same
// time. That diagonal slide, not the scale itself, is the "glitchy" motion — a
// speech bubble that swims into position instead of popping out of the mouth.
//
// The fix is to pin the TAIL. Scaling about the centre maps a point p (measured from
// the centre) to s·p, so translating by p·(1−s) holds p exactly still. The tail's
// offset needs the measured width, hence onLayout — the alternative, transformOrigin,
// cannot express "29 from the right edge" when the width is unknown.
//
// It also LEAVES now. Every other stage graphic fades out over 0.25s; the bubbles
// alone were cut dead on the tap, which is the one inconsistency you could see.
// ...and how far the tail's centre sits UP from the wrapper's bottom edge. The
// wrapper lays out as box + (−6 margin + 12 tail) + 20 leader, and treating the
// bottom edge as the anchor left visible vertical creep.
const TAIL_UP = 26;
const LEADER_H = 20;        // the line that runs from the tail down toward the head
const EDGE = 10;            // keep the box this far inside the stage

export function Bubble({
  bt, text, x, top, shout, leaving,
}: {
  bt: SharedValue<number>;
  text: string;
  /** SCREEN x of the speaker, in stage units — the bubble centres over it. */
  x: SharedValue<number>;
  top: number;
  shout?: boolean;
  /** Rendered for the beat that just ended — holds still and fades out. */
  leaving?: boolean;
}) {
  const w = useSharedValue(0);
  const h = useSharedValue(0);
  const onLayout = useCallback((e: LayoutChangeEvent) => {
    w.value = e.nativeEvent.layout.width;
    h.value = e.nativeEvent.layout.height;
  }, []);

  // WHERE IT SITS. Over the speaker's head, not at a fixed stage edge — which is the
  // whole point: with two figures talking in turn, a box pinned to the left margin
  // says nothing about who said it. It tracks the figure (the speakers move: the
  // boxers close and open range all round), and clamps so a long line never walks
  // off the stage.
  const wrap = useAnimatedStyle(() => {
    const half = w.value / 2;
    const lo = half + EDGE, hi = STAGE_W - half - EDGE;
    const cx = Math.max(lo, Math.min(hi, x.value));
    return { transform: [{ translateX: cx - STAGE_W / 2 }] };
  });

  // The pointer leans back toward the speaker when the box has been clamped, so it
  // still says "this one" even when the box could not sit directly overhead.
  const point = useAnimatedStyle(() => {
    const half = w.value / 2;
    const lo = half + EDGE, hi = STAGE_W - half - EDGE;
    const cx = Math.max(lo, Math.min(hi, x.value));
    const off = Math.max(-(half - 20), Math.min(half - 20, x.value - cx));
    return { transform: [{ translateX: off }] };
  });

  const st = useAnimatedStyle(() => {
    if (leaving) {
      // Out FIRST, and fully, before the next one starts at 0.22 — the two used to
      // overlap for a tenth of a second and the swap read as a flicker.
      return { opacity: 1 - ease01(seg(bt.value, 0, 0.18)), transform: [{ scale: 1 }] };
    }
    const e = ease01(seg(bt.value, 0.22, 0.52));
    const s = 0.86 + 0.14 * e + Math.sin(Math.PI * e) * 0.035;
    return {
      opacity: ease01(seg(bt.value, 0.22, 0.38)),
      transform: [
        { translateY: (h.value / 2 - TAIL_UP) * (1 - s) },
        { scale: s },
      ],
    };
  });

  return (
    <Animated.View style={[styles.bubbleWrap, { top }, wrap]} pointerEvents="none">
      <Animated.View onLayout={onLayout} style={[styles.bubble, st]}>
        <View style={[styles.bubbleBox, shout && styles.bubbleShout]}>
          <Text style={[styles.bubbleText, shout && styles.bubbleShoutText]}>{text}</Text>
        </View>
        <Animated.View style={[styles.point, point]}>
          <View style={[styles.tail, shout && styles.tailShout]} />
          <View style={styles.leader} />
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
}

// ── choices (teaching taps + graded questions) ────────────────────────────────
/**
 * THE CHIP THAT SAYS A QUESTION HAS STARTED.
 *
 * Shared by both panels below so the two kinds of question announce themselves
 * identically. On a graded beat it names the stake; on a teaching tap there is
 * no stake to name, and saying so would be a lie the reward screen then
 * contradicts.
 */
export function QKicker({ graded }: { graded?: boolean }) {
  return (
    <View style={styles.kicker}>
      <Text style={styles.kickerText}>
        {graded ? `QUESTION  \u00b7  +${XP_PER_CORRECT_ANSWER} XP` : 'YOUR TURN'}
      </Text>
    </View>
  );
}

/**
 * THE REVEAL, in one place for both panels.
 *
 * It has to say WHICH of the two things happened before it says anything else —
 * see `explain` in the stylesheet for what it used to do instead.
 */
export function Reveal({ correct, graded, explain }: {
  correct: boolean; graded?: boolean; explain: string;
}) {
  return (
    <Animated.View
      style={[styles.explain, correct ? styles.explainRight : styles.explainWrong]}
      entering={FadeInDown.duration(300)}
    >
      <Text style={[styles.explainHead, correct ? styles.explainHeadRight : styles.explainHeadWrong]}>
        {correct ? (graded ? CORRECT_LABEL : 'That\u2019s the one') : 'Not quite'}
      </Text>
      <Text style={styles.explainText}>{explain}</Text>
    </Animated.View>
  );
}

/** One option row, with the chunk. Its own press state, because the lip has to
 *  drop under the finger that is on it and not under the other three. */
function Opt({ o, answered, reveal, chosen, onPick }: {
  o: Choice; answered: boolean; reveal: boolean; chosen: boolean;
  onPick: (id: string, correct: boolean) => void;
}) {
  const [down, setDown] = useState(false);
  // No lip once answered: the row has stopped being a button, and a ledge under
  // a thing that cannot be pressed is an affordance that lies.
  const lip = answered ? 0 : LIP.button;
  return (
    <Pressable
      style={styles.optSlot}
      disabled={answered}
      accessibilityRole="button"
      accessibilityLabel={o.text}
      onPress={() => onPick(o.id, o.correct)}
      onPressIn={() => setDown(true)}
      onPressOut={() => setDown(false)}
    >
      <View style={{ paddingBottom: lip }}>
        {lip > 0 ? <View pointerEvents="none" style={[styles.optLip, { top: lip }]} /> : null}
        <View
          style={[
            styles.opt,
            reveal && styles.optRight,
            chosen && !o.correct && styles.optWrong,
            { transform: [{ translateY: down && !answered ? lip : 0 }] },
          ]}
        >
          <Text
            style={[
              styles.optText,
              reveal && styles.optRightText,
              chosen && !o.correct && styles.optWrongText,
            ]}
          >
            {o.text}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

export function Choices({
  prompt, options, explain, picked, graded, onPick,
}: {
  prompt: string;
  options: Choice[];
  explain: string;
  picked: string | null;
  graded?: boolean;
  onPick: (id: string, correct: boolean) => void;
}) {
  const answered = picked !== null;
  const gotIt = Boolean(answered && options.find((o) => o.id === picked)?.correct);
  return (
    <Animated.View style={styles.qWrap} layout={LinearTransition.duration(300)}>
      {!answered ? <QKicker graded={graded} /> : null}
      <Text style={styles.prompt}>{prompt}</Text>
      {options.map((o) => {
        const chosen = picked === o.id;
        const reveal = answered && o.correct;
        // Once answered, drop the options that are neither the pick nor the answer,
        // so a four-option question plus its explanation fits the fixed deck.
        if (answered && !chosen && !o.correct) return null;
        return (
          <Opt
            key={o.id}
            o={o}
            answered={answered}
            reveal={reveal}
            chosen={chosen}
            onPick={onPick}
          />
        );
      })}
      {answered ? <Reveal correct={gotIt} graded={graded} explain={explain} /> : null}
    </Animated.View>
  );
}

// ── scene-driven question (answered in the stage, not the deck) ───────────────
// The deck shows the prompt and, once answered, the Correct/Not-quite reveal. The
// tappable targets live in the SCENE, which calls onPick — so this panel has no
// buttons of its own. `answered`/`correct` are owned by the player.
export function InteractPanel({
  prompt, explain, answered, correct, targets = 0, inScene = true,
}: {
  prompt: string; explain: string; answered: boolean; correct: boolean; targets?: number;
  /**
   * Is this question answered on the STAGE?
   *
   * This panel carries the prompt and the reveal for EVERY graded beat, including
   * the ones answered by the two cards below it or by the drag rail — so the hint
   * it prints has to know which kind it is looking at. It did not, and told the
   * reader to "answer in the scene above" on all 119 lessons that ask with cards,
   * pointing them at a picture with nothing tappable in it while the two buttons
   * they actually wanted sat directly underneath.
   *
   * Default true because a scene question is the shape this panel was written for
   * and the one that needs the hint; the deck's own cards and rail are their own
   * instruction.
   */
  inScene?: boolean;
}) {
  // "Answer in the scene above ↑" was the entire instruction, and it tells the
  // reader nothing they did not already know. What they could not tell was WHICH
  // things were answerable — so the hint now names the number of marked things,
  // which Target.tsx counts for itself. No lesson declares it and none can get it
  // wrong. If the count is somehow zero the old wording still stands, because a
  // hint that says "tap one of the 0 marked parts" is worse than a vague one.
  const hint = targets >= 2
    ? `Tap one of the ${targets} outlined parts above ↑`
    : targets === 1
      ? 'Tap the outlined part above ↑'
      : 'Answer in the scene above ↑';
  return (
    <Animated.View style={styles.qWrap} layout={LinearTransition.duration(300)}>
      {!answered ? <QKicker graded /> : null}
      <Text style={styles.prompt}>{prompt}</Text>
      {!answered && inScene ? (
        <Text style={styles.interactHint}>{hint}</Text>
      ) : !answered ? null : (
        <Reveal correct={correct} graded explain={explain} />
      )}
    </Animated.View>
  );
}

// The narration line is a plain paragraph, and that is the whole of it.
//
export const NARR_SIZE = 18;
// ── quote + summary ───────────────────────────────────────────────────────────
export function QuoteCard({
  q, saved, onToggle,
}: {
  q: { text: string; author: string; work: string; era: string };
  saved: boolean;
  onToggle: () => void;
}) {
  return (
    <View style={styles.quoteCard}>
      <Text style={styles.quoteMark}>“</Text>
      <Text style={styles.quoteText}>{q.text}</Text>
      <View style={styles.quoteFoot}>
        <Pressable onPress={onToggle} hitSlop={12}>
          <SketchIcon name={saved ? 'bookmark-filled' : 'bookmark'} size={18} color={saved ? INK : SOFT} />
        </Pressable>
        <Text style={styles.quoteBy}>
          {q.author.toUpperCase()}  ·  {q.work}, {q.era}
        </Text>
      </View>
    </View>
  );
}

export function SummaryCard({ s }: { s: SummaryBlock }) {
  return (
    <View style={styles.sumWrap}>
      <Text style={styles.sumTitle}>{s.title}</Text>
      {s.points.map((p) => (
        <View key={p} style={styles.sumRow}>
          <Text style={styles.sumDot}>•</Text>
          <Text style={styles.sumPoint}>{p}</Text>
        </View>
      ))}
      <Text style={styles.sumClose}>{s.closing}</Text>
    </View>
  );
}

/**
 * THE RUNNING SCORE.
 *
 * Its own component, for the reason rule 1 of §17 gives: the player carries an
 * `if (done) return null` near the bottom and every hook has to sit above it.
 * A pill that owns its own pop animation adds no hook to the player at all,
 * which is the version that cannot be got wrong later.
 *
 * It pops on CHANGE rather than on every render — `withSequence` off a
 * `useEffect` keyed on the number. A counter that jumps without moving is just
 * a different number in the same place, and the reader misses it.
 */
export function XpPill({ xp }: { xp: number }) {
  const pop = useSharedValue(1);
  const first = useRef(true);
  useEffect(() => {
    // Not on mount: the pill arrives at 0 XP and has nothing to celebrate yet.
    if (first.current) { first.current = false; return; }
    pop.value = withSequence(
      withTiming(1.22, { duration: 120, easing: Easing.out(Easing.quad) }),
      withSpring(1, { damping: 8, stiffness: 220 }),
    );
  }, [xp, pop]);
  const st = useAnimatedStyle(() => ({ transform: [{ scale: pop.value }] }));
  return (
    <Animated.View style={[styles.xpPill, st]}>
      <Text style={styles.xpPillText}>{xp} XP</Text>
    </Animated.View>
  );
}

/**
 * THE NUDGE UNDER THE DECK.
 *
 * A tap ripple — a ring that swells out of a dot and fades, on a loop. The
 * screen's only instruction used to be three words of static grey caps, so a
 * reader who had finished reading could not tell the lesson was WAITING for
 * them from the lesson still playing. This is the one thing on the screen whose
 * whole job is to say "your move".
 *
 * It stops when the beat is `locked` on an unanswered question, because then a
 * tap is not what is wanted and a pulse pointing at the wrong gesture is worse
 * than none.
 */
export function TapNudge({ label, resting }: { label: string; resting?: boolean }) {
  const r = useSharedValue(0);
  useEffect(() => {
    if (resting) { r.value = withTiming(0, { duration: 200 }); return; }
    r.value = 0;
    r.value = withRepeat(withTiming(1, { duration: 1500, easing: Easing.out(Easing.quad) }), -1, false);
  }, [resting, r]);
  const ring = useAnimatedStyle(() => ({
    opacity: (1 - r.value) * 0.55,
    transform: [{ scale: 0.6 + r.value * 1.1 }],
  }));
  return (
    <View style={styles.hintRow}>
      {!resting ? (
        <View style={styles.nudge}>
          <Animated.View style={[styles.nudgeRing, ring]} pointerEvents="none" />
          <View style={styles.nudgeDot} pointerEvents="none" />
        </View>
      ) : null}
      <Text style={styles.hint}>{label}</Text>
    </View>
  );
}

export const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: PAPER },
  body: { flex: 1 },

  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingTop: 4, gap: 12 },
  close: { padding: 4 },

  // ── THE RAIL ──────────────────────────────────────────────────────────────
  //
  // It was 2px of hairline, which is a rule, not a progress bar — you could not
  // see it move and there was nothing to feel good about filling. 10px on a pill
  // track is the shape every reader already knows this control by, and it is the
  // one piece of chrome on screen for every beat of every lesson.
  //
  // `overflow: hidden` on the track is what rounds the fill's leading end: the
  // fill itself must stay a plain rectangle, because it is driven by scaleX and
  // a border radius on a scaled View is scaled with it — a 999 radius at 8%
  // progress comes out as a squashed lozenge rather than a bar. The track clips
  // it into shape instead.
  track: {
    flex: 1, height: 10, backgroundColor: TRACK_OFF,
    borderRadius: RADIUS.pill, overflow: 'hidden',
  },
  // Full-width bar scaled from the left, so a smooth scaleX reads as the fill
  // advancing (a percentage-width jump on each tap is what we're replacing).
  fill: { position: 'absolute', left: 0, top: 0, height: 10, width: '100%', backgroundColor: INK, transformOrigin: '0% 50%' },
  /** The gloss. A paper-tinted sliver along the top of the fill, which is what
   *  stops a 10px slab reading as a flat black brick. It rides inside the fill,
   *  so it is scaled and clipped with it and costs no extra animation. */
  fillTop: {
    position: 'absolute', left: 0, top: 2, height: 3, width: '100%',
    backgroundColor: PAPER, opacity: 0.22,
  },

  // ── THE RUNNING SCORE ─────────────────────────────────────────────────────
  //
  // A lesson pays XP per correct answer and told the reader so exactly once, in
  // the reveal line, and then again on the reward screen after it was over.
  // Between those two the number did not exist. This is it, kept on screen and
  // counting — the difference between being scored and being told your score
  // afterwards.
  xpPill: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 2, borderColor: INK, borderRadius: RADIUS.pill,
    paddingHorizontal: 8, paddingVertical: 2, backgroundColor: PAPER,
  },
  xpPillText: { fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 0.6, color: INK },

  // Fixed proportions (content-independent) so the stage never resizes on a tap.
  // A slightly shorter stage than 46/46 so the deck holds a 3-line prompt + four
  // two-line options without clipping the last one.
  stageWrap: { flex: 42, alignItems: 'center', justifyContent: 'flex-end' },
  stageGone: { flex: 0, height: 0 },
  // The summary. `stageGone` already zeroes the stage, so `lower` is the only
  // flexible child left and takes the whole body without needing a weight of its
  // own — all this has to do now is centre the card in it.
  deckTall: { justifyContent: 'center' },
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 40, right: 40, top: GROUND, height: 1.5, backgroundColor: RULE },

  // A full-stage-width strip the bubble is centred in, so one translateX puts it
  // over whichever figure is speaking.
  bubbleWrap: { position: 'absolute', left: 0, width: STAGE_W, alignItems: 'center' },
  bubble: { maxWidth: 216, alignItems: 'center' },
  bubbleBox: {
    borderWidth: 2, borderColor: INK, borderRadius: 5,
    backgroundColor: PAPER, paddingHorizontal: 13, paddingVertical: 9,
  },
  bubbleShout: { backgroundColor: INK },
  bubbleText: {
    fontFamily: 'Inter_500Medium', fontSize: 13.5, color: INK, lineHeight: 18.5,
    textAlign: 'center',
  },
  bubbleShoutText: { fontFamily: 'Inter_700Bold', color: PAPER, letterSpacing: 0.5 },
  // The pointer: a triangle that reads as part of the box, then a line running on
  // down toward the head, so there is no doubt which figure is speaking.
  point: { alignItems: 'center', marginTop: -6 },
  tail: { width: 12, height: 12, backgroundColor: INK, transform: [{ rotate: '45deg' }] },
  tailShout: { backgroundColor: INK },
  leader: { width: 2, height: LEADER_H, backgroundColor: INK, marginTop: -2, opacity: 0.55 },

  /**
   * The lower half — answer control (if any) and deck, as ONE box (L6).
   *
   * The flex weight lives HERE and not on the deck, which is the whole point: a
   * beat that mounts cards or a drag rail takes their height out of this box's
   * 50, never out of the stage's 42. See the note at the JSX in CinematicPlayer.
   */
  lower: { flex: 50 },
  deck: { flex: 1, paddingHorizontal: 24, justifyContent: 'flex-start', overflow: 'hidden' },
  fadeWrap: { position: 'relative' },
  narr: { fontFamily: 'PlayfairDisplay_400Regular', fontSize: NARR_SIZE, lineHeight: 27, color: INK },
  cite: { fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 1.6, color: SOFT, marginBottom: 7 },

  qWrap: { marginTop: 2 },

  /** The chip that says a question has started. A beat used to become a question
   *  silently — the narration simply stopped and a prompt appeared in the same
   *  place, in a slightly heavier face. This announces it, and on a graded beat
   *  it names the stake, derived from constants/xp rather than typed (H63). */
  kicker: {
    alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center',
    borderRadius: RADIUS.pill, paddingHorizontal: 9, paddingVertical: 3,
    marginBottom: 8, backgroundColor: INK,
  },
  kickerText: { fontFamily: 'Inter_700Bold', fontSize: 9.5, letterSpacing: 1.4, color: PAPER },

  prompt: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 16, color: INK, marginBottom: 8, lineHeight: 21 },
  interactHint: { fontFamily: 'Inter_500Medium', fontSize: 12, letterSpacing: 0.5, color: SOFT, fontStyle: 'italic' },

  // ── THE OPTION ROWS ───────────────────────────────────────────────────────
  //
  // Same chunk as components/ui/Button: a slab of the lip colour behind the
  // face, and pressing drops the face onto it. See that file's header for why
  // the lip is absolutely positioned and only `translateY` animates.
  //
  // The reveal is COLOUR now rather than an ink flood. The old `optRight`
  // filled the row solid black, which is the heaviest mark the app has, and it
  // landed on the one row the reader got RIGHT — the same treatment a headline
  // gets, used to mean "correct". Tinted green states it once and lets the
  // explanation underneath do the talking.
  optSlot: { marginBottom: 8 },
  optLip: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    borderRadius: RADIUS.button, backgroundColor: C.HUE,
  },
  opt: {
    borderWidth: 2, borderColor: INK, borderRadius: RADIUS.button,
    paddingVertical: 11, paddingHorizontal: 14, backgroundColor: PAPER,
  },
  optRight: { borderColor: RIGHT, backgroundColor: RIGHT_BG },
  optRightText: { color: RIGHT, fontFamily: 'Inter_700Bold' },
  optWrong: { borderColor: WRONG, backgroundColor: WRONG_BG },
  optWrongText: { color: WRONG },
  optText: { fontFamily: 'Inter_400Regular', fontSize: 13.5, color: INK, lineHeight: 18 },

  // ── THE EXPLANATION ───────────────────────────────────────────────────────
  //
  // A bare 2px rule down the left, in ink, whatever had just happened. It read
  // the same for "you got it" and for "not quite", which is the one moment in a
  // lesson where the reader most wants to be told which of those it was.
  explain: {
    marginTop: 4, borderRadius: RADIUS.card, borderLeftWidth: 5,
    paddingLeft: 12, paddingRight: 12, paddingVertical: 10,
  },
  explainRight: { backgroundColor: RIGHT_BG, borderLeftColor: RIGHT },
  explainWrong: { backgroundColor: WRONG_BG, borderLeftColor: WRONG },
  explainHead: { fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 1.2, color: INK, marginBottom: 4 },
  explainHeadRight: { color: RIGHT },
  explainHeadWrong: { color: WRONG },
  explainText: { fontFamily: 'Inter_400Regular', fontSize: 13.5, color: INK, lineHeight: 20, opacity: 0.82 },

  quoteCard: { borderWidth: 1.5, borderColor: INK, borderRadius: 3, padding: 18, marginTop: 2 },
  quoteMark: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 40, color: INK, height: 26, lineHeight: 36 },
  quoteText: {
    fontFamily: 'PlayfairDisplay_400Regular', fontStyle: 'italic',
    fontSize: 20, lineHeight: 30, color: INK, marginTop: 8,
  },
  quoteFoot: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 16 },
  quoteBy: { fontFamily: 'Inter_500Medium', fontSize: 11, letterSpacing: 1.4, color: SOFT, flex: 1 },

  sumWrap: { marginTop: 2 },
  sumTitle: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 22, color: INK, marginBottom: 12 },
  sumRow: { flexDirection: 'row', gap: 10, marginBottom: 7 },
  sumDot: { fontSize: 16, lineHeight: 21, color: INK },
  sumPoint: { fontFamily: 'Inter_400Regular', fontSize: 14.5, color: INK, lineHeight: 21, flex: 1 },
  sumClose: {
    fontFamily: 'PlayfairDisplay_400Regular', fontStyle: 'italic',
    fontSize: 16, color: SOFT, lineHeight: 24, marginTop: 12,
  },

  tapLayer: { flex: 8, alignItems: 'center', justifyContent: 'center' },
  hintRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  hint: { fontFamily: 'Inter_500Medium', fontSize: 11, letterSpacing: 2, color: SOFT },
  /** The nudge. Static grey caps said "Tap to continue" and were the only thing
   *  on the screen not moving; a reader who had finished reading had no sign the
   *  lesson was waiting for them rather than still playing. It rests while the
   *  beat is LOCKED on an answer, because then the tap is not what is wanted. */
  nudge: { width: 16, height: 16, alignItems: 'center', justifyContent: 'center' },
  nudgeRing: {
    position: 'absolute', width: 16, height: 16, borderRadius: 8,
    borderWidth: 1.5, borderColor: SOFT,
  },
  nudgeDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: SOFT },
});
