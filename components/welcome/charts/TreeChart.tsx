// TreeChart — "a thought branching outward". Ported 1:1 from the approved canvas
// preview's `drawTree` + TREE table (welcome.html). Drawn in the chart's own
// space: x 0..300, y 0..150. The parent <Svg> supplies translate+scale, so
// nothing here scales itself.
//
// ── The one rule (see ease.ts) ──────────────────────────────────────────────
// On react-native-svg 15 + Fabric only transform / opacity / strokeOpacity /
// fillOpacity / strokeDashoffset repaint. Animating geometry (`d`, `points`,
// `cx`, `r`, …) silently freezes. So every `d` below is baked ONCE at module
// scope and never changes:
//
//   · canvas swept each branch by re-sampling the Bezier to `t` each frame
//     → here the full quadratic + hand-drawn wobble is baked into one static
//       polyline, drawn on with strokeDashoffset (the LaunchScreen idiom).
//   · canvas swept the root with ctx.ellipse(start, end)
//     → here a static 368° ellipse path, drawn on with strokeDashoffset.
//   · canvas scaled/popped with ctx.scale
//     → here RN transform ARRAYS (never SVG transform strings: Reanimated 4
//       parses a string `transform` as CSS and crashes — see WelcomeAnimation).
// ────────────────────────────────────────────────────────────────────────────

import Animated, { useAnimatedProps, type SharedValue } from 'react-native-reanimated';
import {
  Circle,
  Defs,
  G,
  LinearGradient,
  Path,
  Stop,
  Text as SvgText,
} from 'react-native-svg';
import { INK, easeInOutQuad, easeOutBack, easeOutCubic, seg } from '@/components/welcome/ease';

const APath = Animated.createAnimatedComponent(Path);
const ACircle = Animated.createAnimatedComponent(Circle);
const AG = Animated.createAnimatedComponent(G);

// ─────────────────────────── the TREE table (verbatim) ──────────────────────

type BranchEase = 'io' | 'lin';

interface TreeBranch {
  p0: readonly [number, number];
  p1: readonly [number, number];
  d: number;
  bow: number;
  s: number;
  e: number;
  dot: number;
  ease?: BranchEase;
  ghost?: number;
}

const TREE: readonly TreeBranch[] = [
  { p0: [48.5, 78], p1: [92, 74], d: 0, bow: -2.0, s: 0.09, e: 0.2, dot: 0, ease: 'io' },
  { p0: [92, 74], p1: [126, 55], d: 1, bow: +3.5, s: 0.2, e: 0.34, dot: 0 },
  { p0: [92, 74], p1: [134, 93], d: 1, bow: -3.0, s: 0.23, e: 0.38, dot: 0 },
  { p0: [126, 55], p1: [150, 32], d: 2, bow: +2.5, s: 0.38, e: 0.48, dot: 1 },
  { p0: [126, 55], p1: [168, 52], d: 2, bow: -3.5, s: 0.34, e: 0.47, dot: 0 },
  { p0: [168, 52], p1: [198, 70], d: 3, bow: +2.5, s: 0.51, e: 0.63, dot: 1 },
  { p0: [168, 52], p1: [206, 36], d: 3, bow: +3.0, s: 0.47, e: 0.6, dot: 0 },
  { p0: [206, 36], p1: [282, 24], d: 4, bow: -5.0, s: 0.62, e: 1.0, dot: 0, ease: 'lin', ghost: 1 },
  { p0: [206, 36], p1: [243, 55], d: 4, bow: +2.5, s: 0.62, e: 0.75, dot: 1 },
  { p0: [134, 93], p1: [174, 86], d: 2, bow: +3.5, s: 0.38, e: 0.51, dot: 0 },
  { p0: [134, 93], p1: [172, 112], d: 2, bow: -2.5, s: 0.42, e: 0.55, dot: 1 },
  { p0: [134, 93], p1: [156, 130], d: 2, bow: +3.0, s: 0.46, e: 0.6, dot: 1 },
  { p0: [174, 86], p1: [222, 93], d: 3, bow: -3.5, s: 0.53, e: 0.66, dot: 1 },
  { p0: [174, 86], p1: [211, 118], d: 3, bow: +2.5, s: 0.57, e: 0.7, dot: 1 },
];

// ─────────────────────────────── baked geometry ─────────────────────────────

/** 0 = easeOutCubic (default), 1 = linear, 2 = easeInOutQuad. Resolved on the
 *  JS side so the worklet only ever closes over a number. */
const EASE_DEFAULT = 0;
const EASE_LIN = 1;
const EASE_IO = 2;

interface BakedBranch {
  key: string;
  d: string;
  len: number;
  /** Fixed — strokeWidth cannot animate. See the taper note in the header. */
  width: number;
  stroke: string;
  s: number;
  e: number;
  easeKind: number;
  ghost: boolean;
  dot: boolean;
  dotX: number;
  dotY: number;
  dotFill: string;
}

const GHOST_GRADIENT_ID = 'tree-ghost-fade';

function bakeBranch(b: TreeBranch, i: number): BakedBranch {
  const P0 = { x: b.p0[0], y: b.p0[1] };
  const P1 = { x: b.p1[0], y: b.p1[1] };
  const dx = P1.x - P0.x;
  const dy = P1.y - P0.y;
  const chord = Math.hypot(dx, dy);
  const nx = -dy / chord;
  const ny = dx / chord;

  // Control point: midpoint pushed along the normal by 2*bow.
  const C = {
    x: (P0.x + P1.x) / 2 + nx * 2 * b.bow,
    y: (P0.y + P1.y) / 2 + ny * 2 * b.bow,
  };
  const bez = (u: number) => ({
    x: (1 - u) * (1 - u) * P0.x + 2 * (1 - u) * u * C.x + u * u * P1.x,
    y: (1 - u) * (1 - u) * P0.y + 2 * (1 - u) * u * C.y + u * u * P1.y,
  });
  // The hand-drawn perpendicular wobble, phase-shifted per branch.
  const wf = (u: number) => 0.45 * Math.sin(2 * Math.PI * 1.5 * u + i * 2.399);

  const N = Math.max(6, Math.round(chord / 4));
  let d = '';
  let len = 0;
  let px = 0;
  let py = 0;
  for (let j = 0; j <= N; j++) {
    const u = j / N;
    const B = bez(u);
    const w = wf(u);
    const x = B.x + nx * w;
    const y = B.y + ny * w;
    d += j === 0 ? `M${x.toFixed(2)} ${y.toFixed(2)}` : ` L${x.toFixed(2)} ${y.toFixed(2)}`;
    if (j > 0) len += Math.hypot(x - px, y - py);
    px = x;
    py = y;
  }

  // Canvas tapers w0 → w1 along the branch. strokeWidth can't animate and the
  // taper is sub-pixel at this size, so one fixed mid-taper width is used.
  const w0 = 2.6 * Math.pow(0.78, b.d);
  const w1 = b.ghost ? 0.02 : w0 * 0.72;
  const grey = 26 + 16 * b.d;
  const dotGrey = Math.max(0, grey - 24);

  return {
    key: `tree-branch-${i}`,
    d,
    len: Math.ceil(len),
    width: (w0 + w1) / 2,
    stroke: b.ghost ? `url(#${GHOST_GRADIENT_ID})` : `rgb(${grey},${grey},${grey})`,
    s: b.s,
    e: b.e,
    easeKind: b.ease === 'lin' ? EASE_LIN : b.ease === 'io' ? EASE_IO : EASE_DEFAULT,
    ghost: !!b.ghost,
    dot: !!b.dot,
    dotX: P1.x,
    dotY: P1.y,
    dotFill: `rgb(${dotGrey},${dotGrey},${dotGrey})`,
  };
}

const BRANCHES: readonly BakedBranch[] = TREE.map(bakeBranch);

const GHOST = TREE[7];
const GHOST_GREY = 26 + 16 * GHOST.d;
const GHOST_COLOR = `rgb(${GHOST_GREY},${GHOST_GREY},${GHOST_GREY})`;

// Root: an ellipse swept open from -100° through 368°.
const ROOT_CX = 40;
const ROOT_CY = 78;
const ROOT_RX = 8.5;
const ROOT_RY = 7.6;

const ROOT = (() => {
  const steps = 96;
  const a0 = (-100 * Math.PI) / 180;
  const a1 = ((-100 + 368) * Math.PI) / 180;
  let d = '';
  let len = 0;
  let px = 0;
  let py = 0;
  for (let j = 0; j <= steps; j++) {
    const a = a0 + (a1 - a0) * (j / steps);
    const x = ROOT_CX + ROOT_RX * Math.cos(a);
    const y = ROOT_CY + ROOT_RY * Math.sin(a);
    d += j === 0 ? `M${x.toFixed(2)} ${y.toFixed(2)}` : ` L${x.toFixed(2)} ${y.toFixed(2)}`;
    if (j > 0) len += Math.hypot(x - px, y - py);
    px = x;
    py = y;
  }
  return { d, len: Math.ceil(len) };
})();

// ──────────────────────────────── pieces ────────────────────────────────────

function Root({ p }: { p: SharedValue<number> }) {
  // The little pulse: 1 → 1.06 → 1 across p 0.18–0.24, about (40,78).
  const gProps = useAnimatedProps(() => ({
    transform: [
      { translateX: ROOT_CX },
      { translateY: ROOT_CY },
      { scale: 1 + 0.06 * Math.sin(Math.PI * seg(p.value, 0.18, 0.24)) },
      { translateX: -ROOT_CX },
      { translateY: -ROOT_CY },
    ],
  }));
  const pathProps = useAnimatedProps(() => ({
    strokeDashoffset: ROOT.len * (1 - easeOutCubic(seg(p.value, 0, 0.09))),
  }));

  return (
    <AG animatedProps={gProps}>
      <APath
        d={ROOT.d}
        stroke={INK}
        strokeWidth={2.2}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={`${ROOT.len} ${ROOT.len}`}
        animatedProps={pathProps}
      />
    </AG>
  );
}

function Branch({ p, b }: { p: SharedValue<number>; b: BakedBranch }) {
  const { s, e, easeKind, len, dotX, dotY } = b;

  const pathProps = useAnimatedProps(() => {
    const q = seg(p.value, s, e);
    const t = easeKind === EASE_LIN ? q : easeKind === EASE_IO ? easeInOutQuad(q) : easeOutCubic(q);
    return { strokeDashoffset: len * (1 - t) };
  });

  // Dot pops with easeOutBack over [e, e+0.05], capped at 1.35 like the canvas.
  const dotProps = useAnimatedProps(() => {
    const u = seg(p.value, e, e + 0.05);
    return {
      opacity: u > 0 ? 1 : 0,
      transform: [
        { translateX: dotX },
        { translateY: dotY },
        { scale: Math.min(easeOutBack(u), 1.35) },
      ],
    };
  });

  return (
    <G>
      <APath
        d={b.d}
        stroke={b.stroke}
        strokeWidth={b.width}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={`${len} ${len}`}
        animatedProps={pathProps}
      />
      {b.dot ? (
        <ACircle cx={0} cy={0} r={1.9} fill={b.dotFill} animatedProps={dotProps} />
      ) : null}
    </G>
  );
}

function YouLabel({ p }: { p: SharedValue<number> }) {
  const gProps = useAnimatedProps(() => ({ opacity: easeOutCubic(seg(p.value, 0.07, 0.15)) }));
  return (
    <AG animatedProps={gProps}>
      <SvgText
        x={40}
        y={99}
        fill="#6a6a6a"
        fontFamily="EBGaramond_400Regular_Italic"
        fontSize={12}
        textAnchor="middle"
      >
        you
      </SvgText>
    </AG>
  );
}

// ──────────────────────────────── the chart ─────────────────────────────────

export default function TreeChart({ p }: { p: SharedValue<number> }) {
  return (
    <G>
      <Defs>
        {/* The ghost branch "never lands": the canvas fades its alpha 1 → 0 over
            the last 20% of its length. That fade is positional, not temporal, so
            it ports as a static gradient along the chord rather than an animated
            opacity — which would (wrongly) fade the whole branch at once. */}
        <LinearGradient
          id={GHOST_GRADIENT_ID}
          gradientUnits="userSpaceOnUse"
          x1={GHOST.p0[0]}
          y1={GHOST.p0[1]}
          x2={GHOST.p1[0]}
          y2={GHOST.p1[1]}
        >
          <Stop offset="0" stopColor={GHOST_COLOR} stopOpacity={1} />
          <Stop offset="0.8" stopColor={GHOST_COLOR} stopOpacity={1} />
          <Stop offset="1" stopColor={GHOST_COLOR} stopOpacity={0} />
        </LinearGradient>
      </Defs>

      <Root p={p} />
      {BRANCHES.map((b) => (
        <Branch key={b.key} p={p} b={b} />
      ))}
      <YouLabel p={p} />
    </G>
  );
}
