// LoudnessChart — a deadpan scatter plot: VOLUME on x, HOW RIGHT YOU ARE on y, and a
// cloud of points with no relationship whatsoever between them. The flat dashed trend
// line is the punchline: shouting does not move the y axis.
//
// Chart space is the viewBox 0..280 × 0..160, so every number below is a viewBox
// coordinate verbatim (the <Svg> owns the scale to w × h).
//
// Geometry is frozen: react-native-svg 15 + Fabric does not repaint animated
// `d`/`cx`/`cy`/`r`/`x`/`width` (see components/welcome/ease.ts header). So every path,
// circle and rect here is built ONCE at module scope, and all motion is transform /
// opacity / strokeOpacity / strokeDashoffset only. Transforms are RN transform ARRAYS —
// never SVG transform strings, which Reanimated 4 parses as CSS and crashes on.

import { useId } from 'react';
import Animated, { useAnimatedProps, type SharedValue } from 'react-native-reanimated';
import {
  ClipPath,
  Circle,
  Defs,
  G,
  Path,
  Rect,
  Svg,
  Text as SvgText,
} from 'react-native-svg';
import {
  clamp01,
  seg,
  lerp,
  easeOutCubic,
  easeOutBack,
  INK,
  PAPER,
  SOFT,
} from '@/components/welcome/ease';

const APath = Animated.createAnimatedComponent(Path);
const ACircle = Animated.createAnimatedComponent(Circle);
const ARect = Animated.createAnimatedComponent(Rect);
const AG = Animated.createAnimatedComponent(G);

// ── axes ────────────────────────────────────────────────────────────────────────
// Drawn on with strokeDashoffset rather than a scaleY/scaleX: at scale 0 a round-capped
// line still paints a visible dot at the origin, whereas a fully-offset dash paints
// nothing at all. (Same reasoning as GrowthChart's axes.)
//
// Each path is authored so its START is the corner the stroke grows out of: the y axis
// runs bottom→top, the x axis runs left→right.
const Y_AXIS_D = 'M34 132 L34 24'; // grows up from the origin: 132 → 132-108
const Y_AXIS_LEN = 108;
const X_AXIS_D = 'M30 128 L268 128'; // grows right: 30 → 30+238
const X_AXIS_LEN = 238;

// Tick stubs. Both sets are one frozen multi-subpath Path each, so a whole rail of ticks
// costs a single element and a single animated opacity.
const X_TICKS_D = [68, 106, 144, 182, 220, 258].map((x) => `M${x} 128 L${x} 131.5`).join(' ');
const Y_TICKS_D = [104, 80, 56, 32].map((y) => `M34 ${y} L30.5 ${y}`).join(' ');

// ── the scatter ─────────────────────────────────────────────────────────────────
// Hand-picked so it *looks* random but is stable across renders — no Math.random at
// runtime, because the geometry has to be identical on every frame and every mount.
// The y values deliberately carry no signal: bucketed by x, their means run
// ~69 → ~87 → ~70, i.e. up then down, so no eye can trace a trend through them.
const DOTS: readonly (readonly [number, number])[] = [
  [46, 62],
  [66, 104],
  [85, 40],
  [104, 108],
  [123, 54],
  [142, 116],
  [162, 68],
  [182, 36],
  [202, 97],
  [222, 47],
  [247, 100],
] as const;

const DOT_R = 3.2;
const POP = 0.1; // how long one dot takes to pop
// Staggered across 0.25 → 0.75, the last dot finishing exactly on 0.75.
const DOT_START = (i: number) => lerp(0.25, 0.75 - POP, i / (DOTS.length - 1));

// ── the flat trend line ─────────────────────────────────────────────────────────
// y = 74 ≈ the mean of the scatter, and perfectly horizontal: slope zero.
const TREND_Y = 74;
const TREND_D = `M40 ${TREND_Y} L262 ${TREND_Y}`;
const TREND_CLIP_X = 40; // the clip wipe's left pivot
const TREND_CLIP_W = 224;

export default function LoudnessChart({
  p,
  w = 280,
  h = 160,
}: {
  p: SharedValue<number>;
  w?: number;
  h?: number;
}) {
  // ClipPath ids live in a global-ish namespace, so derive a per-instance one — two of
  // these mounted at once must not fight over the same `url(#…)`. useId embeds ':' etc.,
  // which is not a legal id, so strip everything non-alphanumeric.
  const clipId = `loudness-trend-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;

  // 0.00–0.22 · the two axes draw on, y first then x.
  const yAxisProps = useAnimatedProps(() => ({
    strokeDashoffset: Y_AXIS_LEN * (1 - easeOutCubic(seg(p.value, 0, 0.11))),
  }));
  const xAxisProps = useAnimatedProps(() => ({
    strokeDashoffset: X_AXIS_LEN * (1 - easeOutCubic(seg(p.value, 0.09, 0.22))),
  }));
  const yTicksProps = useAnimatedProps(() => ({
    strokeOpacity: easeOutCubic(seg(p.value, 0.06, 0.15)) * 0.9,
  }));
  const xTicksProps = useAnimatedProps(() => ({
    strokeOpacity: easeOutCubic(seg(p.value, 0.13, 0.22)) * 0.9,
  }));

  // 0.18–0.30 · axis labels fade in with a small rise.
  const labelProps = useAnimatedProps(() => {
    const l = easeOutCubic(seg(p.value, 0.18, 0.3));
    return { opacity: l, transform: [{ translateY: 3 * (1 - l) }] };
  });

  // 0.72–0.90 · the dashed trend line wipes on left→right.
  //
  // It needs BOTH a dashed look AND a draw-on, and strokeDasharray is already spoken for
  // by the dashes — using it for the reveal too would just animate the dash pattern.
  // So the reveal is a clip instead: a static <Rect> inside a <ClipPath>, scaled on its X
  // about its own left edge (translate → scaleX → un-translate, the same own-centre
  // triplet the dots use). The rect's x/y/width/height never change — only its transform —
  // which keeps it on the repainting side of the Fabric rule.
  const trendClipProps = useAnimatedProps(() => {
    const e = easeOutCubic(seg(p.value, 0.72, 0.9));
    // Never exactly 0: a zero-scale matrix is non-invertible and some backends drop it.
    return {
      transform: [
        { translateX: TREND_CLIP_X },
        { scaleX: Math.max(clamp01(e), 0.0001) },
        { translateX: -TREND_CLIP_X },
      ],
    };
  });

  // 0.88–1.00 · the caption lands last.
  const captionProps = useAnimatedProps(() => {
    const l = easeOutCubic(seg(p.value, 0.88, 1));
    return { opacity: l, transform: [{ translateY: 3 * (1 - l) }] };
  });

  return (
    <Svg width={w} height={h} viewBox="0 0 280 160">
      <Defs>
        <ClipPath id={clipId}>
          <ARect
            x={TREND_CLIP_X}
            y={66}
            width={TREND_CLIP_W}
            height={16}
            animatedProps={trendClipProps}
          />
        </ClipPath>
      </Defs>

      {/* axes */}
      <APath
        d={Y_AXIS_D}
        stroke={INK}
        strokeWidth={1.4}
        strokeOpacity={0.85}
        strokeLinecap="round"
        fill="none"
        strokeDasharray={Y_AXIS_LEN}
        animatedProps={yAxisProps}
      />
      <APath
        d={X_AXIS_D}
        stroke={INK}
        strokeWidth={1.4}
        strokeOpacity={0.85}
        strokeLinecap="round"
        fill="none"
        strokeDasharray={X_AXIS_LEN}
        animatedProps={xAxisProps}
      />

      {/* tick stubs */}
      <APath
        d={Y_TICKS_D}
        stroke={INK}
        strokeWidth={0.9}
        strokeLinecap="round"
        fill="none"
        animatedProps={yTicksProps}
      />
      <APath
        d={X_TICKS_D}
        stroke={INK}
        strokeWidth={0.9}
        strokeLinecap="round"
        fill="none"
        animatedProps={xTicksProps}
      />

      {/* the flat trend line, under the dots so the data punches through it */}
      <G clipPath={`url(#${clipId})`}>
        <Path
          d={TREND_D}
          stroke={SOFT}
          strokeWidth={1.3}
          strokeOpacity={0.9}
          strokeLinecap="round"
          strokeDasharray="6 5"
          fill="none"
        />
      </G>

      {/* the scatter */}
      {DOTS.map(([cx, cy], i) => (
        <Dot key={`dot-${i}`} p={p} cx={cx} cy={cy} i={i} />
      ))}

      {/* x axis label */}
      <AG animatedProps={labelProps}>
        <SvgText
          x={151}
          y={148}
          fill={SOFT}
          fontSize={8}
          fontFamily="Inter_700Bold"
          letterSpacing={1.5}
          textAnchor="middle"
        >
          VOLUME
        </SvgText>
      </AG>

      {/* y axis label — reads bottom-to-top. The rotation is an RN transform ARRAY on the
          inner <G> (a transform string would crash Reanimated), pivoting about the text's
          own anchor with the translate → rotate → un-translate triplet. The animated
          opacity stays on the OUTER group so the two never contend for `transform`. */}
      <AG animatedProps={labelProps}>
        <G
          transform={[
            { translateX: 16 },
            { translateY: 76 },
            { rotate: '-90deg' },
            { translateX: -16 },
            { translateY: -76 },
          ]}
        >
          <SvgText
            x={16}
            y={76}
            fill={SOFT}
            fontSize={8}
            fontFamily="Inter_700Bold"
            letterSpacing={1.5}
            textAnchor="middle"
          >
            HOW RIGHT YOU ARE
          </SvgText>
        </G>
      </AG>

      {/* the punchline */}
      <AG animatedProps={captionProps}>
        <SvgText
          x={151}
          y={90}
          fill={SOFT}
          fontSize={10}
          fontFamily="PlayfairDisplay_400Regular"
          fontStyle="italic"
          textAnchor="middle"
        >
          no correlation
        </SvgText>
      </AG>
    </Svg>
  );
}

/** One scatter dot, popping about its own centre with an easeOutBack overshoot. */
function Dot({
  p,
  cx,
  cy,
  i,
}: {
  p: SharedValue<number>;
  cx: number;
  cy: number;
  i: number;
}) {
  const start = DOT_START(i);
  const animatedProps = useAnimatedProps(() => {
    const u = seg(p.value, start, start + POP);
    // r is frozen at DOT_R; the growth is a scale about (cx, cy) — translate to the
    // centre, scale, translate back, exactly as GrowthChart pops its curve dots.
    return {
      opacity: u > 0 ? 1 : 0,
      transform: [
        { translateX: cx },
        { translateY: cy },
        { scale: easeOutBack(u) },
        { translateX: -cx },
        { translateY: -cy },
      ],
    };
  });
  return (
    <ACircle
      cx={cx}
      cy={cy}
      r={DOT_R}
      fill={INK}
      // A paper halo so dots that land near each other, or on the trend line, stay legible.
      stroke={PAPER}
      strokeWidth={1.2}
      animatedProps={animatedProps}
    />
  );
}
