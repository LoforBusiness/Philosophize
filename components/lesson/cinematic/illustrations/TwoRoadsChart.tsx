// TwoRoadsChart — Schopenhauer's fork: arguing to WIN vs arguing to find TRUTH.
//
// From one starting dot on the left, two roads diverge. The upper road curves up
// and runs cleanly out to the right edge (INK, confident). The lower road droops,
// fades, and DEAD-ENDS short of the edge under a small X (SOFT, the lesser path).
//
// Chart space is the viewBox itself: x 0..280, y 0..160.
//
// ── The one rule (see components/welcome/ease.ts) ───────────────────────────
// On react-native-svg 15 + Fabric only transform / opacity / strokeOpacity /
// fillOpacity / strokeDashoffset repaint. Animating geometry (`d`, `points`,
// `cx`, `cy`, `r`, `strokeWidth`, …) silently freezes on-device. So:
//
//   · every `d` here is baked ONCE at module scope and never changes;
//   · the roads draw on with strokeDashoffset (the LaunchScreen / TreeChart idiom);
//   · dots pop with an RN transform ARRAY — never an SVG transform string, which
//     Reanimated 4 parses as CSS and crashes on;
//   · strokeWidth cannot animate, so each path picks one fixed width.
// ────────────────────────────────────────────────────────────────────────────

import Animated, { useAnimatedProps, type SharedValue } from 'react-native-reanimated';
import {
  Circle,
  Defs,
  G,
  LinearGradient,
  Path,
  Stop,
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
const AG = Animated.createAnimatedComponent(G);

// ─────────────────────────────── road baking ────────────────────────────────

type Pt = readonly [number, number];

interface BakedRoad {
  d: string;
  /** Rounded UP so strokeDashoffset fully closes the stroke at t = 1. */
  dash: number;
}

/**
 * Sample a quadratic bezier (P0, C, P1) into a static polyline, accumulating arc
 * length as we go. The canvas idiom would re-sample to a moving head every frame;
 * animated `d` never repaints here, so instead we bake the WHOLE road once and
 * reveal it with strokeDashoffset = dash * (1 - eased).
 *
 * `wobAmp` adds the house hand-drawn tremble perpendicular to the curve. It is
 * windowed by sin(pi*u) so it vanishes at BOTH ends — which keeps the fork dot and
 * the end dot landing exactly on the baked endpoints.
 */
function bakeRoad(p0: Pt, c: Pt, p1: Pt, wobAmp: number, phase: number, samples: number): BakedRoad {
  const dx = p1[0] - p0[0];
  const dy = p1[1] - p0[1];
  const chord = Math.hypot(dx, dy);
  const nx = -dy / chord;
  const ny = dx / chord;

  const bez = (u: number) => ({
    x: (1 - u) * (1 - u) * p0[0] + 2 * (1 - u) * u * c[0] + u * u * p1[0],
    y: (1 - u) * (1 - u) * p0[1] + 2 * (1 - u) * u * c[1] + u * u * p1[1],
  });
  const wob = (u: number) =>
    wobAmp * Math.sin(2 * Math.PI * 1.4 * u + phase) * Math.sin(Math.PI * u);

  let d = '';
  let len = 0;
  let px = 0;
  let py = 0;
  for (let j = 0; j <= samples; j++) {
    const u = j / samples;
    const B = bez(u);
    const w = wob(u);
    const x = B.x + nx * w;
    const y = B.y + ny * w;
    d += j === 0 ? `M${x.toFixed(2)} ${y.toFixed(2)}` : ` L${x.toFixed(2)} ${y.toFixed(2)}`;
    if (j > 0) len += Math.hypot(x - px, y - py);
    px = x;
    py = y;
  }

  return { d, dash: Math.ceil(len) };
}

// ────────────────────────────── baked geometry ──────────────────────────────

/** Where both roads leave from. */
const FORK: Pt = [30, 80];

// Upper road — up and right, flattening into the right edge so it reads as
// "continues". Control y matches the end y, which straightens the last third.
const UP_END: Pt = [248, 40];
const UPPER = bakeRoad(FORK, [140, 40], UP_END, 0.45, 1.1, 96);

// Lower road — droops right and stops well short of the edge.
const LOW_END: Pt = [180, 120];
const LOWER = bakeRoad(FORK, [112, 118], LOW_END, 0.45, 3.6, 80);

// The X at the dead end: two short crossing strokes, each drawn on separately.
const X_CX = 191;
const X_CY = 123;
const X_ARM = 4.2;
const X_A_D = `M${X_CX - X_ARM} ${X_CY - X_ARM} L${X_CX + X_ARM} ${X_CY + X_ARM}`;
const X_B_D = `M${X_CX + X_ARM} ${X_CY - X_ARM} L${X_CX - X_ARM} ${X_CY + X_ARM}`;
const X_DASH = Math.ceil(Math.hypot(2 * X_ARM, 2 * X_ARM)); // round UP so it closes

const DEAD_END_GRADIENT_ID = 'two-roads-dead-end-fade';

// ──────────────────────────────── pieces ────────────────────────────────────

/**
 * An ink dot on a PAPER halo, popping about its own centre with easeOutBack.
 * The halo is what stops a road's stroke from showing through the dot; it lives
 * inside the same <G> so it can never appear before the dot it belongs to.
 */
function PopDot({
  p,
  cx,
  cy,
  r,
  start,
  dur,
}: {
  p: SharedValue<number>;
  cx: number;
  cy: number;
  r: number;
  start: number;
  dur: number;
}) {
  const animatedProps = useAnimatedProps(() => {
    const u = clamp01((p.value - start) / dur);
    // r is frozen (it cannot animate) — the pop is a scale about (cx, cy) via the
    // translate / scale / un-translate triplet.
    return {
      opacity: u > 0 ? 1 : 0,
      transform: [
        { translateX: cx },
        { translateY: cy },
        { scale: Math.min(easeOutBack(u), 1.3) },
        { translateX: -cx },
        { translateY: -cy },
      ],
    };
  });

  return (
    <AG animatedProps={animatedProps}>
      <Circle cx={cx} cy={cy} r={r + 1.6} fill={PAPER} />
      <Circle cx={cx} cy={cy} r={r} fill={INK} />
    </AG>
  );
}

/** One arm of the dead-end X, drawn on with strokeDashoffset. */
function XStroke({
  p,
  d,
  start,
  end,
}: {
  p: SharedValue<number>;
  d: string;
  start: number;
  end: number;
}) {
  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: X_DASH * (1 - easeOutCubic(seg(p.value, start, end))),
  }));

  return (
    <APath
      d={d}
      stroke={SOFT}
      strokeWidth={1.5}
      fill="none"
      strokeLinecap="round"
      strokeDasharray={`${X_DASH} ${X_DASH}`}
      animatedProps={animatedProps}
    />
  );
}

/** A road label: fades up into place. Opacity + transform only. */
function RoadLabel({
  p,
  x,
  y,
  fill,
  anchor,
  start,
  end,
  children,
}: {
  p: SharedValue<number>;
  x: number;
  y: number;
  fill: string;
  anchor: 'end' | 'middle';
  start: number;
  end: number;
  children: string;
}) {
  const animatedProps = useAnimatedProps(() => {
    const l = easeOutCubic(seg(p.value, start, end));
    return { opacity: l, transform: [{ translateY: lerp(3, 0, l) }] };
  });

  return (
    <AG animatedProps={animatedProps}>
      <SvgText
        x={x}
        y={y}
        fill={fill}
        fontFamily="Inter_700Bold"
        fontSize={8}
        letterSpacing={1.2}
        textAnchor={anchor}
      >
        {children}
      </SvgText>
    </AG>
  );
}

// ──────────────────────────────── the chart ─────────────────────────────────

export default function TwoRoadsChart({
  p,
  w = 280,
  h = 160,
}: {
  p: SharedValue<number>;
  w?: number;
  h?: number;
}) {
  // 0.08 → 0.45: the honest road draws on first, and all the way out.
  const upperProps = useAnimatedProps(() => ({
    strokeDashoffset: UPPER.dash * (1 - easeOutCubic(seg(p.value, 0.08, 0.45))),
  }));
  // 0.30 → 0.65: the losing road follows, overlapping so the fork reads as a fork.
  const lowerProps = useAnimatedProps(() => ({
    strokeDashoffset: LOWER.dash * (1 - easeOutCubic(seg(p.value, 0.3, 0.65))),
  }));

  return (
    <Svg width={w} height={h} viewBox="0 0 280 160" preserveAspectRatio="xMidYMid meet">
      <Defs>
        {/* The dead end fades out over the last stretch of the lower road. That fade
            is POSITIONAL (it belongs to the road's tip), not temporal — so it is a
            STATIC gradient along the chord, exactly like TreeChart's ghost branch.
            An animated opacity would be wrong twice over: it would fade the whole
            road at once instead of just the tip, and it would fight the draw-on that
            is already riding strokeDashoffset. A gradient baked in userSpaceOnUse
            costs nothing per frame and the stroke reveal slides underneath it. */}
        <LinearGradient
          id={DEAD_END_GRADIENT_ID}
          gradientUnits="userSpaceOnUse"
          x1={FORK[0]}
          y1={FORK[1]}
          x2={LOW_END[0]}
          y2={LOW_END[1]}
        >
          <Stop offset="0" stopColor={SOFT} stopOpacity={1} />
          <Stop offset="0.62" stopColor={SOFT} stopOpacity={1} />
          <Stop offset="1" stopColor={SOFT} stopOpacity={0} />
        </LinearGradient>
      </Defs>

      {/* the lower road — dies out under the X */}
      <APath
        d={LOWER.d}
        stroke={`url(#${DEAD_END_GRADIENT_ID})`}
        strokeWidth={1.8}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={`${LOWER.dash} ${LOWER.dash}`}
        animatedProps={lowerProps}
      />

      {/* the upper road — stroked twice for the house inky double-pass */}
      <APath
        d={UPPER.d}
        stroke={INK}
        strokeWidth={2.2}
        strokeOpacity={0.9}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={`${UPPER.dash} ${UPPER.dash}`}
        animatedProps={upperProps}
      />
      <APath
        d={UPPER.d}
        stroke={INK}
        strokeWidth={1.1}
        strokeOpacity={0.45}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={`${UPPER.dash} ${UPPER.dash}`}
        animatedProps={upperProps}
      />

      {/* the X at the dead end — two strokes, slightly staggered so it reads as drawn */}
      <XStroke p={p} d={X_A_D} start={0.6} end={0.67} />
      <XStroke p={p} d={X_B_D} start={0.65} end={0.72} />

      {/* dots: the fork first, the honest road's destination once it lands */}
      <PopDot p={p} cx={FORK[0]} cy={FORK[1]} r={3.4} start={0} dur={0.1} />
      <PopDot p={p} cx={UP_END[0]} cy={UP_END[1]} r={2.8} start={0.45} dur={0.13} />

      {/* labels */}
      <RoadLabel p={p} x={252} y={26} fill={INK} anchor="end" start={0.55} end={0.75}>
        TO FIND TRUTH
      </RoadLabel>
      <RoadLabel p={p} x={150} y={146} fill={SOFT} anchor="middle" start={0.7} end={0.9}>
        TO WIN THE ARGUMENT
      </RoadLabel>
    </Svg>
  );
}
