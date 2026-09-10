import { memo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Path, Defs, RadialGradient, Stop, Circle } from 'react-native-svg';
import Animated, {
  useAnimatedProps,
  useAnimatedStyle,
  useAnimatedReaction,
  useDerivedValue,
  runOnJS,
  type SharedValue,
} from 'react-native-reanimated';
import { C } from '@/constants/design';
import { ART, TANGLE, JOURNEY, HATCH, GLASS, type InkStroke } from './inkArt';

const AnimatedPath = Animated.createAnimatedComponent(Path);

// ─── THE DRAWING DRAWS ITSELF ────────────────────────────────────────────────
//
// One unbroken pen line enters at the left, tangles into a ball of ink, unspools
// across the page and becomes a light bulb; then the marker fills the glass and
// the light strikes. Every mark is DRAWN — a stroke-dashoffset reveal along the
// pen's own centreline, which is why inkArt.ts had to be a CENTRELINE trace and
// not an outline trace (see its header).
//
// ── WHY EACH STROKE GETS ITS OWN <Svg>, AND WHY ONLY A FEW EVER ANIMATE ─────
//
// §17's rule 7 is the binding constraint: what an animated SVG costs is the AREA
// it repaints, and a full-screen one costs about ten frames a second on an S24.
// Read react-native-svg rather than guessing at it — RenderableView's
// setStrokeDashoffset ends in a bare invalidate(), with no equality guard — so
// every dashoffset written in a frame forces that SvgView to redraw its whole
// backing bitmap. Fifty-two paths inside one <Svg> would repaint the entire
// drawing fifty-two times per frame.
//
// So the drawing is TILED IN TIME. Each stroke lives in its own <Svg>, sized to
// its own box and no larger, and:
//
//   · a stroke already finished has no animatedProps attached at all, so nothing
//     writes to it — its bitmap is painted once and thereafter only blitted;
//   · only strokes inside the live window animate: the one being drawn, plus a
//     short LOOKAHEAD;
//   · strokes not yet reached are not mounted.
//
// THE LOOKAHEAD IS NOT A FUDGE FACTOR — it is what makes this safe on the boot
// path. The window is advanced through runOnJS, and the JS thread during launch
// is the busiest it ever is: §19 measured the old screen's percentage sticking
// on zero and then jumping twenty while five tab screens mounted. A window that
// lags would make strokes appear late. Mounting the next few EARLY costs nothing
// to look at — their offset is their whole length, so they draw nothing — and
// means a stroke's reveal is already running on the UI thread before JS has
// noticed it should be. The picture cannot fall behind the animation.

/** A stroke, plus the slice of the timeline it is drawn in. */
interface Timed extends InkStroke {
  t0: number;
  t1: number;
}

/**
 * Lay a set of strokes across [from, to].
 *
 * Time is dealt by LENGTH, so the pen holds one speed across a phase instead of
 * pausing on every short mark — which is most of what separates a hand drawing
 * from a list of things appearing.
 *
 * `floor` buys the shortest strokes a visible minimum: the tangle holds marks of
 * 21 units against a phase total of 19,677, and at true speed those are a single
 * frame. `overlap` lets a phase run strokes concurrently — a marker scribbling a
 * fill has two or three in the air at once, where a pen drawing a line has one.
 */
function schedule(list: InkStroke[], from: number, to: number, overlap: number, floor: number): Timed[] {
  const weight = list.map((s) => s.len + floor);
  const total = weight.reduce((a, b) => a + b, 0) || 1;
  const span = to - from;
  let acc = 0;
  const raw = list.map((s, i) => {
    const t0 = from + (acc / total) * span;
    acc += weight[i];
    const t1 = from + (acc / total) * span;
    return { ...s, t0, t1: t0 + (t1 - t0) * overlap };
  });
  // An overlapped phase overruns its own span, so rescale it back rather than
  // clipping: clipping would leave the last strokes of a fill unfinished.
  const end = raw.length ? raw[raw.length - 1].t1 : to;
  if (end > to && end > from) {
    const k = span / (end - from);
    for (const s of raw) {
      s.t0 = from + (s.t0 - from) * k;
      s.t1 = from + (s.t1 - from) * k;
    }
  }
  return raw;
}

// The four movements, as fractions of the drawing's own timeline.
const T_TANGLE = 0.46; // the ball of ink forms
const T_JOURNEY = 0.76; // the line leaves it, crosses the page and becomes the bulb
const T_HATCH = 0.91; // the marker fills the glass
const T_STRIKE = 0.8; // the light catches, under the last of the marker

// The tangle is scribbled fast and the bulb is drawn deliberately: the two hold
// different pen speeds on purpose, because one is chaos and the other is the
// thing the picture is about.
const INK: Timed[] = [
  ...schedule(TANGLE, 0, T_TANGLE, 1, 60),
  ...schedule(JOURNEY, T_TANGLE, T_JOURNEY, 1, 0),
];
const MARK: Timed[] = schedule(HATCH, T_JOURNEY, T_HATCH, 2.6, 30);
const ALL: Timed[] = [...INK, ...MARK];
/** Read by the window worklet. Module-level, so it is captured by value. */
const ENDS: number[] = ALL.map((s) => s.t1);
const INK_COUNT = INK.length;

/** How many strokes are mounted ahead of the one being drawn. See the header. */
const LOOKAHEAD = 6;

/** The pen, measured off the source: 7.24 art units across. */
const PEN_W = 7.2;
/** The marker's fallback width, for a stroke that declares none — each one
 *  carries its own `sw`, because a hand does not hold one width. Sized off the
 *  measured pitch of 31 units: wide enough to read as a filled scribble, narrow
 *  enough to leave the pale gaps the original has between strokes. */
const MARK_W = 21;
/** The marker's own colour, averaged over the saturated core of the source. */
const MARK_INK = '#F0CF23';

interface StrokeProps {
  s: Timed;
  u: SharedValue<number>;
  scale: number;
  live: boolean;
  colour: string;
  width: number;
}

const Stroke = memo(function Stroke({ s, u, scale, live, colour, width }: StrokeProps) {
  // Called unconditionally — a hook may not be skipped — but only ATTACHED while
  // the stroke is live. Unattached it writes to no view and costs no bitmap.
  const drawing = useAnimatedProps(() => {
    const span = s.t1 - s.t0;
    const raw = span > 0 ? (u.value - s.t0) / span : 1;
    const p = raw < 0 ? 0 : raw > 1 ? 1 : raw;
    return { strokeDashoffset: s.len * (1 - p) };
  });
  return (
    <Svg
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: (s.x - ART.x) * scale,
        top: (s.y - ART.y) * scale,
        width: s.w * scale,
        height: s.h * scale,
      }}
      width={s.w * scale}
      height={s.h * scale}
      viewBox={`${s.x} ${s.y} ${s.w} ${s.h}`}
    >
      {/* ROUND CAPS, for the reason the old title page already recorded: a butt
          cap ends a dashoffset reveal on a hard rectangle and reads as a vector
          wipe, where a round cap reads as the tip of a pen. */}
      <AnimatedPath
        d={s.d}
        stroke={colour}
        strokeWidth={width}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        strokeDasharray={live ? `${s.len} ${s.len + 2}` : undefined}
        animatedProps={live ? drawing : undefined}
      />
    </Svg>
  );
});

interface Props {
  /** The drawing's own timeline, 0 → 1. */
  u: SharedValue<number>;
  /** The width the art is drawn at, in dp. Height follows from the art's ratio. */
  width: number;
}

export default function InkDrawing({ u, width }: Props) {
  const scale = width / ART.w;
  const [done, setDone] = useState(0);

  // The live window, advanced from the UI thread. `done` is how many strokes
  // have finished: everything below it is static, and LOOKAHEAD past it is
  // mounted early so that a busy JS thread cannot make a stroke appear late.
  const finished = useDerivedValue(() => {
    let n = 0;
    for (let i = 0; i < ENDS.length; i++) if (ENDS[i] <= u.value) n = i + 1;
    return n;
  });
  useAnimatedReaction(
    () => finished.value,
    (cur, prev) => {
      if (cur !== prev) runOnJS(setDone)(cur);
    }
  );

  // THE LIGHT. A bulb does not fade up, it CATCHES: it strikes, drops, catches
  // harder, and settles. The shape is a function of the timeline rather than a
  // withSequence, so it cannot drift out of step with the marker underneath it,
  // and it lands identically however the frames happen to fall.
  const glow = useAnimatedStyle(() => {
    const raw = (u.value - T_STRIKE) / (1 - T_STRIKE);
    const p = raw < 0 ? 0 : raw > 1 ? 1 : raw;
    let lit = 0;
    if (p <= 0) lit = 0;
    else if (p < 0.11) lit = 0.5;
    else if (p < 0.2) lit = 0.08;
    else if (p < 0.34) lit = 0.9;
    else if (p < 0.42) lit = 0.38;
    else lit = 0.38 + ((p - 0.42) / 0.58) * 0.62;
    return { opacity: lit, transform: [{ scale: 0.88 + lit * 0.12 }] };
  });

  const mounted = Math.min(ALL.length, done + LOOKAHEAD);
  const glowR = GLASS.r * 2.9;

  return (
    <View style={{ width, height: ART.h * scale }} pointerEvents="none">
      {/* The glow sits UNDER the drawing, so the pen and the marker stay crisp on
          top of it. The <Svg> is inert — painted once, never re-rendered; the
          light is carried entirely by the View's opacity and scale, which is
          §17 rule 7's own prescription: animate the native View, never the SVG's
          properties. */}
      <Animated.View
        style={[
          styles.glow,
          {
            left: (GLASS.cx - glowR - ART.x) * scale,
            top: (GLASS.cy - glowR - ART.y) * scale,
            width: glowR * 2 * scale,
            height: glowR * 2 * scale,
          },
          glow,
        ]}
        pointerEvents="none"
      >
        <Svg width="100%" height="100%" viewBox="0 0 100 100">
          <Defs>
            {/* THE LIGHT SPILLS OUTWARD, IT DOES NOT FLOOD THE GLASS. The first
                version ran 0.85 alpha at the centre, and rendered against the
                source it was plainly the wrong picture: the glass is MARKER ON
                WHITE PAPER, and a strong wash behind it tinted every pale gap
                between the marker strokes, so the bulb read as a solid yellow
                disc instead of a scribbled one. The glass edge sits at 34% of
                this radius, so the profile is faint inside it and peaks just
                outside — which is also what a lit bulb actually does. */}
            <RadialGradient id="lamp" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#FFE45C" stopOpacity="0.18" />
              <Stop offset="32%" stopColor="#FFD21E" stopOpacity="0.26" />
              <Stop offset="46%" stopColor="#FFC800" stopOpacity="0.3" />
              <Stop offset="72%" stopColor="#FFC400" stopOpacity="0.09" />
              <Stop offset="100%" stopColor="#FFC400" stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Circle cx="50" cy="50" r="50" fill="url(#lamp)" />
        </Svg>
      </Animated.View>

      {/* The marker goes under the pen, the way it does on the page. */}
      {ALL.slice(0, mounted).map((s, i) =>
        i < INK_COUNT ? null : (
          <Stroke key={`m${i}`} s={s} u={u} scale={scale} live={i >= done} colour={MARK_INK} width={s.sw ?? MARK_W} />
        )
      )}
      {ALL.slice(0, mounted).map((s, i) =>
        i < INK_COUNT ? (
          <Stroke key={`i${i}`} s={s} u={u} scale={scale} live={i >= done} colour={C.ink} width={PEN_W} />
        ) : null
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  glow: { position: 'absolute' },
});
