// GrowthChart — "a few minutes a day compounds". Ported 1:1 from `drawGrowth` in the
// approved canvas preview (welcome.html, CHARTS section).
//
// Chart space is x 0..300, y 0..150; the parent <Svg> owns the translate+scale, so every
// number below is the canvas coordinate verbatim.
//
// Geometry is frozen: react-native-svg 15 + Fabric does not repaint animated `d`/`cx`/`r`
// (see ease.ts header). So every path/circle here is built ONCE at module scope and all
// motion is transform / opacity / strokeOpacity / strokeDashoffset only.

import Animated, { useAnimatedProps, type SharedValue } from 'react-native-reanimated';
import { Circle, G, Path, Text as SvgText } from 'react-native-svg';
import {
  clamp01,
  seg,
  easeOutCubic,
  easeInOutQuad,
  easeOutBack,
  INK,
  SOFT,
} from '@/components/welcome/ease';

const APath = Animated.createAnimatedComponent(Path);
const ACircle = Animated.createAnimatedComponent(Circle);
const AG = Animated.createAnimatedComponent(G);

// ── curve maths (canvas: X0,Y0,W,H,KK,DEN,f,wob,px,py) ──────────────────────────
const X0 = 30;
const Y0 = 120;
const W = 238;
const H = 90;
const KK = 2.8;
const DEN = Math.exp(KK) - 1;

const fOf = (t: number) => 0.33 * t + (0.67 * (Math.exp(KK * t) - 1)) / DEN;
// Hand-drawn tremble, faded in over the first 5% so the curve leaves the axis cleanly.
const wobOf = (t: number) =>
  Math.min(t / 0.05, 1) * (0.42 * Math.sin(8.7 * t + 1.9) + 0.26 * Math.sin(19.3 * t + 4.7));
const pxOf = (t: number) => X0 + W * t;
const pyOf = (t: number) => Y0 - H * fOf(t) + wobOf(t);

// ── static geometry, built once ─────────────────────────────────────────────────
const SAMPLES = 240; // same sample count as the canvas

// One frozen polyline for the curve, plus the running arc length at every sample.
// The canvas re-samples 0..tHead each frame; we instead reveal a fixed path with
// strokeDashoffset. Keeping the partial sums lets us convert the canvas's *parameter*
// head (tHead) into an *arc-length* fraction, so the stroke head lands exactly on
// px(tHead),py(tHead) — which is what keeps the dots popping right at the head.
function buildCurve() {
  const cum: number[] = [0];
  let prevX = pxOf(0);
  let prevY = pyOf(0);
  let d = `M${prevX.toFixed(2)} ${prevY.toFixed(2)}`;
  let acc = 0;
  for (let i = 1; i <= SAMPLES; i++) {
    const t = i / SAMPLES;
    const x = pxOf(t);
    const y = pyOf(t);
    acc += Math.hypot(x - prevX, y - prevY);
    cum.push(acc);
    d += ` L${x.toFixed(2)} ${y.toFixed(2)}`;
    prevX = x;
    prevY = y;
  }
  return { d, cum, len: acc };
}
const CURVE = buildCurve();
const CURVE_D = CURVE.d;
const CURVE_CUM = CURVE.cum;
const CURVE_LEN = CURVE.len;
const CURVE_DASH = Math.ceil(CURVE_LEN); // round UP so the stroke fully closes

/** Arc-length fraction (0..1) revealed when the curve head sits at parameter `tHead`. */
function curveReveal(tHead: number): number {
  'worklet';
  const x = clamp01(tHead) * SAMPLES;
  const i = Math.floor(x);
  if (i >= SAMPLES) return 1;
  const frac = x - i;
  return (CURVE_CUM[i] + (CURVE_CUM[i + 1] - CURVE_CUM[i]) * frac) / CURVE_LEN;
}

// Axes. Drawn on with strokeDashoffset rather than a scaleY: at a=0 a zero-length
// round-capped line would still paint a dot, and the canvas paints nothing there.
const Y_AXIS_D = 'M30 124 L30 24'; // grows up from the origin: 124 → 124-100
const Y_AXIS_LEN = 100;
const X_AXIS_D = 'M26 120 L280 120'; // grows right: 26 → 26+254
const X_AXIS_LEN = 254;

const KS = [1, 2, 3, 4, 5, 6, 7];
const tickPk = (k: number) => 0.2 + (0.6 * k) / 7; // ticks + dots share this timing
const TICK_X = (k: number) => 30 + 34 * k;

// Ring on the final point. The canvas sweeps arc(…,0,7r), so it closes at r≈0.9 and
// holds; dashoffset on a frozen circle path reproduces that sweep exactly.
const RING_X = pxOf(1);
const RING_Y = pyOf(1);
const RING_R = 6;
const RING_D =
  `M${(RING_X + RING_R).toFixed(2)} ${RING_Y.toFixed(2)}` +
  ` A${RING_R} ${RING_R} 0 0 1 ${(RING_X - RING_R).toFixed(2)} ${RING_Y.toFixed(2)}` +
  ` A${RING_R} ${RING_R} 0 0 1 ${(RING_X + RING_R).toFixed(2)} ${RING_Y.toFixed(2)}`;
const RING_DASH = Math.ceil(2 * Math.PI * RING_R);
const TWO_PI = Math.PI * 2;

// ── pieces that need a hook each (no hooks in loops) ────────────────────────────

/** A 3.5px stub under the x-axis, popping with easeOutBack. */
function Tick({ p, k }: { p: SharedValue<number>; k: number }) {
  const x = TICK_X(k);
  const pk = tickPk(k);
  const animatedProps = useAnimatedProps(() => {
    const u = clamp01((p.value - pk) / 0.036);
    // scaleY about the stub's top (x,120) — the canvas grows it downward from the axis.
    return {
      strokeOpacity: u > 0 ? 0.9 : 0,
      transform: [
        { translateX: x },
        { translateY: 120 },
        { scaleY: easeOutBack(u) },
        { translateX: -x },
        { translateY: -120 },
      ],
    };
  });
  return (
    <APath
      d={`M${x} 120 L${x} 123.5`}
      stroke={SOFT}
      strokeWidth={0.9}
      strokeLinecap="round"
      fill="none"
      animatedProps={animatedProps}
    />
  );
}

/** A dot sitting on the curve at t = k/7. */
function Dot({ p, k }: { p: SharedValue<number>; k: number }) {
  const t = k / 7;
  const cx = pxOf(t);
  const cy = pyOf(t);
  const pk = tickPk(k);
  const animatedProps = useAnimatedProps(() => {
    const u = clamp01((p.value - pk) / 0.036);
    // r is frozen at 1.8; the canvas's 1.8*min(e,1.35) becomes a scale about the centre.
    return {
      opacity: u > 0 ? 1 : 0,
      transform: [
        { translateX: cx },
        { translateY: cy },
        { scale: Math.min(easeOutBack(u), 1.35) },
        { translateX: -cx },
        { translateY: -cy },
      ],
    };
  });
  return <ACircle cx={cx} cy={cy} r={1.8} fill={INK} animatedProps={animatedProps} />;
}

export default function GrowthChart({ p }: { p: SharedValue<number> }) {
  const yAxisProps = useAnimatedProps(() => ({
    strokeDashoffset: Y_AXIS_LEN * (1 - easeInOutQuad(seg(p.value, 0, 0.1))),
  }));
  const xAxisProps = useAnimatedProps(() => ({
    strokeDashoffset: X_AXIS_LEN * (1 - easeInOutQuad(seg(p.value, 0.09, 0.2))),
  }));

  // tHead is linear in the canvas (no easing) — keep it that way.
  const curveThick = useAnimatedProps(() => ({
    strokeDashoffset: CURVE_DASH * (1 - curveReveal(clamp01((p.value - 0.2) / 0.6))),
  }));
  const curveThin = useAnimatedProps(() => ({
    strokeDashoffset: CURVE_DASH * (1 - curveReveal(clamp01((p.value - 0.2) / 0.6))),
  }));

  const ringProps = useAnimatedProps(() => {
    const r = easeOutCubic(seg(p.value, 0.8, 0.92));
    return {
      strokeDashoffset: RING_DASH * (1 - Math.min((7 * r) / TWO_PI, 1)),
      strokeOpacity: r,
    };
  });

  const day1Props = useAnimatedProps(() => {
    const l = easeOutCubic(seg(p.value, 0.29, 0.39));
    return { opacity: l * 0.9, transform: [{ translateY: 3 * (1 - l) }] };
  });
  const day7Props = useAnimatedProps(() => {
    const l = easeOutCubic(seg(p.value, 0.88, 0.97));
    return { opacity: l * 0.9, transform: [{ translateY: 3 * (1 - l) }] };
  });

  return (
    <G>
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

      {/* day ticks */}
      {KS.map((k) => (
        <Tick key={`tick-${k}`} p={p} k={k} />
      ))}

      {/* the curve — stroked twice for an inky double-pass */}
      <APath
        d={CURVE_D}
        stroke={INK}
        strokeWidth={2}
        strokeOpacity={0.9}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        strokeDasharray={CURVE_DASH}
        animatedProps={curveThick}
      />
      <APath
        d={CURVE_D}
        stroke={INK}
        strokeWidth={1.1}
        strokeOpacity={0.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        strokeDasharray={CURVE_DASH}
        animatedProps={curveThin}
      />

      {/* dots on the curve */}
      {KS.map((k) => (
        <Dot key={`dot-${k}`} p={p} k={k} />
      ))}

      {/* ring on the last point */}
      <APath
        d={RING_D}
        stroke="#6e6e6e"
        strokeWidth={1}
        fill="none"
        strokeDasharray={RING_DASH}
        animatedProps={ringProps}
      />

      {/* labels */}
      <AG animatedProps={day1Props}>
        <SvgText
          x={64}
          y={134}
          fill={SOFT}
          fontSize={11}
          fontFamily="EBGaramond_400Regular_Italic"
          textAnchor="middle"
        >
          day 1
        </SvgText>
      </AG>
      <AG animatedProps={day7Props}>
        <SvgText
          x={268}
          y={134}
          fill={SOFT}
          fontSize={11}
          fontFamily="EBGaramond_400Regular_Italic"
          textAnchor="middle"
        >
          day 7
        </SvgText>
      </AG>
    </G>
  );
}
