import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withDelay, withTiming, withSequence, Easing,
} from 'react-native-reanimated';

// ─────────────────────────────────────────────────────────────────────────────
// THE INSIGHTS TAB'S MOTION, IN ONE PLACE.
//
//   > "for the pie chart and the boxes above that, and when you click on one of
//   > the who you read most and the other one ... all of these ... 'bounce',
//   > this looks cheap and ai looking. I want a smooth reveal for the
//   > information, not this bad bouncing."
//
// == IT WAS NOT ONE BAD BOUNCE. NOTHING ON THE TAB WAS CRITICALLY DAMPED. =====
//
// Eight springs drove this screen, and every one of them was underdamped. The
// damping ratio of a spring is `damping / (2 * sqrt(stiffness * mass))`, and the
// height of its first overshoot is `exp(-pi * z / sqrt(1 - z*z))`. Measured out
// of the source as it stood:
//
//     the row that grew            z 0.29   overshoot 39%
//     a discovery card opening     z 0.51   overshoot 16%
//     a ghost target extending     z 0.35   overshoot 31%
//     the league rows sweeping     z 0.55   overshoot 12%
//     the era bars sweeping        z 0.56   overshoot 12%
//     a metric cell arriving       z 0.58   overshoot 11%
//     a dial piece being chosen    z 0.65   overshoot  7%
//     the calm entrance sweep      z 0.68   overshoot  6%
//
// So the reader was not reacting to one loud animation. They were reacting to a
// screen on which NOTHING settles without going past itself first, at eight
// different amplitudes, which is exactly the "everything wobbles slightly
// differently" that reads as unconsidered.
//
// == AND OVERSHOOT ON A MEASURED FIGURE IS NOT A MATTER OF TASTE ==============
//
// A bar is a NUMBER DRAWN AS A LENGTH. A bar that springs 39% past its own value
// and comes back is, for about a fifth of a second, showing a figure that is not
// true — and on the one row the reader had just moved, which is the row they are
// looking hardest at. The file this replaces already half-knew that: it damped
// the entrance sweep from 11 to 16 because at 11 the rows overshot to 1.19 and
// that was "slightly untrue about the data". This is that argument finished.
//
// Apple's own guidance draws the line in the place that settles it: start most
// UI critically damped, and add overshoot only where the GESTURE carried
// momentum -- a flick, a throw, a drag release. Nothing on this tab is thrown.
// Every motion here is either an arrival or the answer to a tap, and a tap has
// no momentum to hand on. Material 3 says the same thing from the other side:
// the recommended entrance is EMPHASIZED DECELERATE -- enter at speed, slow into
// the stop -- which is a curve, not a spring, and never passes its target.
//
// == SO THERE ARE THREE MOTIONS, AND NONE OF THEM OVERSHOOTS ==================
//
//   WIPE       anything with a LENGTH -- bars, rules, the XP curtain. A moving
//              edge reveals it. It never grows past itself, because the length
//              is the number.
//   RISE       anything that is a BLOCK -- tiles, cells, cards. It fades in and
//              travels a few points into place. NO SCALE: a thing that grows
//              from 0.7 to 1 reads as inflating, which is the same note the
//              streak seal got ("it popped rather than landing").
//   UNDERSCORE the reaction. When one row's figure has actually moved, a rule
//              in its own colour wipes along it and fades. Nothing changes size,
//              so nothing lies, and the signal cannot be mistaken for a bounce.
//
// The whole tab is then one idea -- INFORMATION IS REVEALED BY A LINE THAT
// TRAVELS -- which is already the one animation on this screen nobody has ever
// complained about: the XP chart is drawn once and uncovered by a curtain of the
// panel's own ground sliding right.
//
// `scripts/check-stats.mjs` computes the damping ratio of every spring left in
// the four tab files and fails on anything under 1. That is the ratchet: the
// property the reader complained about, held as arithmetic rather than as a
// list of the eight places it happened to be.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * EMPHASIZED DECELERATE — enters at speed, slows into the stop, never passes it.
 *
 * Material 3's recommended curve for something arriving and coming to rest, and
 * the closest thing to "a spring with damping exactly 1" that a duration-based
 * system has. The long tail is what makes it read as WEIGHT rather than as a
 * fade: most of the distance is covered in the first third, and the last few
 * percent take their time.
 */
export const EASE_REVEAL = Easing.bezier(0.05, 0.7, 0.1, 1);

/** Standard easing, for something LEAVING or dimming — it may start slowly. */
export const EASE_SETTLE = Easing.bezier(0.2, 0, 0, 1);

// Durations. A wipe is longer than a rise on purpose: an edge travelling the
// width of the screen at the speed of a 400ms fade is a wipe nobody sees.
export const D_WIPE = 720;
export const D_RISE = 420;
export const D_ROLL = 520;
export const D_MARK = 380;

/**
 * 60ms, and at most six things.
 *
 * The published range for a staggered entrance is 50–100ms a step, with the
 * warning that staggering more than five or six elements turns an entrance into
 * a queue. Every group on this tab is inside that by construction: four ledger
 * tiles, four metric cells, five or six bars, five league rows, six legend rows,
 * six dial pieces. If a group ever grows past six, the stagger has to become a
 * proportion of the whole rather than a step per row -- which is what the bars
 * already do through their `lead`.
 */
export const STEP = 60;

/** The pause before the first thing moves, so an arrival reads as one gesture. */
export const LEAD = 120;

/**
 * The one reveal. Built on the JS thread and assigned to a shared value, so it
 * is deliberately NOT a worklet — which also keeps it clear of §17's rule 2.
 */
export function revealTo(to: number, delay: number, duration = D_WIPE) {
  return withDelay(delay, withTiming(to, { duration, easing: EASE_REVEAL }));
}

/** `index` of `count`, in a group that starts at `lead`. */
export function stepDelay(index: number, lead = LEAD, step = STEP) {
  return lead + index * step;
}

/**
 * THE REACTION — a rule that wipes along whatever just moved, then fades.
 *
 * This is what replaced the squeeze-and-overshoot, and the reason it is a
 * separate mark rather than a change to the thing itself is the whole argument
 * above: the row's length and the row's figure are DATA. Feedback must not be
 * expressed by distorting them, however briefly. So the feedback is its own
 * object, in the row's own colour, drawn under it — the same gesture as
 * underlining a figure in a ledger, which is what this panel is.
 *
 * Two stages: the rule is STRUCK (a wipe from the left, at the reveal curve),
 * then it fades. It never moves anything else and it leaves nothing behind.
 */
export function Underscore({ hue, playToken, on, delay = 0, style }: {
  hue: string;
  /** Bumped by the screen when there is news. */
  playToken: number;
  /** Whether THIS element is one whose figure moved. */
  on: boolean;
  delay?: number;
  style?: object;
}) {
  const draw = useSharedValue(0);
  const hold = useSharedValue(0);

  useEffect(() => {
    if (!on) { draw.value = 0; hold.value = 0; return; }
    draw.value = 0;
    hold.value = 0;
    draw.value = withDelay(delay, withTiming(1, { duration: D_MARK, easing: EASE_REVEAL }));
    hold.value = withDelay(delay, withSequence(
      withTiming(1, { duration: 120, easing: EASE_REVEAL }),
      withDelay(360, withTiming(0, { duration: 420, easing: EASE_SETTLE })),
    ));
  }, [playToken, on, delay, draw, hold]);

  const mark = useAnimatedStyle(() => ({
    opacity: hold.value,
    transform: [{ scaleX: draw.value }],
  }));

  if (!on) return null;
  return (
    <Animated.View
      pointerEvents="none"
      style={[st.rule, { backgroundColor: hue }, style, mark]}
    />
  );
}

const st = StyleSheet.create({
  // ANCHORED LEFT so the rule is struck from the start of the thing it marks,
  // in the same direction as every measure on this tab and the XP curtain.
  rule: {
    position: 'absolute', left: 0, right: 0, bottom: 0, height: 2,
    borderRadius: 1,
    transformOrigin: 'left',
  },
});
