// AnatomyDiagram — "the anatomy of an argument". Two premise boxes across the top,
// two arrows angling down and inward, and a single heavy conclusion box at the
// bottom that pops as the payoff lands.
//
// Drawn in its own 280×160 box; the component owns its <Svg>, so a caller only
// supplies the shared progress value `p` (0 → 1) and, optionally, a render size.
//
// ── The one rule (see components/welcome/ease.ts) ────────────────────────────
// On react-native-svg 15 + Fabric only transform / opacity / strokeOpacity /
// fillOpacity / strokeDashoffset repaint. Animating geometry (`d`, `points`,
// `x`, `y`, `width`, `r`, `strokeWidth`, …) silently renders FROZEN. So every
// path below — boxes, rules, arrow shafts, arrowheads — is baked ONCE at module
// scope as a polyline with a pre-computed arc length, and all motion is:
//
//   · strokeDashoffset  → strokes drawing themselves on
//   · fillOpacity       → the conclusion block inking in
//   · opacity           → labels fading up
//   · transform ARRAYS  → the conclusion's scale pop
//
// Transforms are RN arrays, never SVG transform strings: Reanimated 4 parses a
// string `transform` as CSS and crashes (see WelcomeAnimation.tsx).
// ────────────────────────────────────────────────────────────────────────────

import Animated, { useAnimatedProps, type SharedValue } from 'react-native-reanimated';
import Svg, { G, Path, Text as SvgText } from 'react-native-svg';
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

// ────────────────────────────── baking helpers ──────────────────────────────
// Every stroke is sampled into a polyline with an outward normal per sample, so
// a hand-drawn tremble can be pushed along that normal. The result is a static
// `d` string plus its arc length; the dash constant is rounded UP so the stroke
// closes completely at the end of its window.

interface Sample {
  x: number;
  y: number;
  nx: number;
  ny: number;
}

interface Baked {
  d: string;
  len: number;
  dash: string;
}

function edgeSamples(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  nx: number,
  ny: number,
  steps: number,
): Sample[] {
  const out: Sample[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    out.push({ x: x0 + (x1 - x0) * t, y: y0 + (y1 - y0) * t, nx, ny });
  }
  return out;
}

function arcSamples(
  cx: number,
  cy: number,
  r: number,
  a0: number,
  a1: number,
  steps: number,
): Sample[] {
  const out: Sample[] = [];
  for (let i = 0; i <= steps; i++) {
    const a = a0 + (a1 - a0) * (i / steps);
    const nx = Math.cos(a);
    const ny = Math.sin(a);
    out.push({ x: cx + r * nx, y: cy + r * ny, nx, ny });
  }
  return out;
}

/** Concatenate segments, dropping each segment's duplicated first vertex. */
function joinSamples(parts: Sample[][]): Sample[] {
  const out: Sample[] = [];
  for (const part of parts) {
    for (let i = 0; i < part.length; i++) {
      if (out.length > 0 && i === 0) continue;
      out.push(part[i]);
    }
  }
  return out;
}

interface BakeOpts {
  /** Append `Z`. Closed loops must keep `taper` off so the seam stays smooth. */
  closed?: boolean;
  /** Fade the tremble to zero at both ends so endpoints land exactly. */
  taper?: boolean;
  /** Whole wobble cycles across the path — an integer keeps closed loops seamless. */
  waves?: number;
}

function bake(samples: Sample[], amp: number, phase: number, opts: BakeOpts = {}): Baked {
  const n = samples.length;
  const s: number[] = new Array(n).fill(0);
  for (let i = 1; i < n; i++) {
    s[i] = s[i - 1] + Math.hypot(samples[i].x - samples[i - 1].x, samples[i].y - samples[i - 1].y);
  }
  const total = s[n - 1] || 1;
  const w = (2 * Math.PI * (opts.waves ?? 3)) / total;

  let d = '';
  let len = 0;
  let px = 0;
  let py = 0;
  for (let i = 0; i < n; i++) {
    const env = opts.taper ? Math.sin(Math.PI * (s[i] / total)) : 1;
    // Two harmonics (1× and 3×) — both whole cycles, so a closed loop meets itself.
    const wob =
      amp * env * (Math.sin(w * s[i] + phase) + 0.4 * Math.sin(3 * w * s[i] + phase * 1.9));
    const x = samples[i].x + samples[i].nx * wob;
    const y = samples[i].y + samples[i].ny * wob;
    d += i === 0 ? `M${x.toFixed(2)} ${y.toFixed(2)}` : ` L${x.toFixed(2)} ${y.toFixed(2)}`;
    if (i > 0) len += Math.hypot(x - px, y - py);
    px = x;
    py = y;
  }
  if (opts.closed) d += ' Z';

  const dash = Math.ceil(len); // round UP so the stroke fully closes
  return { d, len, dash: `${dash} ${dash}` };
}

const HALF_PI = Math.PI / 2;

/** A rounded rectangle walked clockwise from the top-left, so it draws L→R first. */
function bakeBox(
  x: number,
  y: number,
  wid: number,
  hei: number,
  r: number,
  amp: number,
  phase: number,
): Baked {
  const x1 = x + wid;
  const y1 = y + hei;
  const pts = joinSamples([
    edgeSamples(x + r, y, x1 - r, y, 0, -1, 12),
    arcSamples(x1 - r, y + r, r, -HALF_PI, 0, 6),
    edgeSamples(x1, y + r, x1, y1 - r, 1, 0, 8),
    arcSamples(x1 - r, y1 - r, r, 0, HALF_PI, 6),
    edgeSamples(x1 - r, y1, x + r, y1, 0, 1, 12),
    arcSamples(x + r, y1 - r, r, HALF_PI, Math.PI, 6),
    edgeSamples(x, y1 - r, x, y + r, -1, 0, 8),
    arcSamples(x + r, y + r, r, Math.PI, 1.5 * Math.PI, 6),
  ]);
  pts.push(pts[0]); // close the loop geometrically
  return bake(pts, amp, phase, { closed: true, waves: 4 });
}

/** A gently bowed line, sampled off a quadratic. Tapered, so the ends are exact. */
function bowedSamples(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  bow: number,
  steps: number,
): { samples: Sample[]; cx: number; cy: number } {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const L = Math.hypot(dx, dy) || 1;
  const nx = -dy / L;
  const ny = dx / L;
  const cx = (x0 + x1) / 2 + nx * 2 * bow;
  const cy = (y0 + y1) / 2 + ny * 2 * bow;

  const samples: Sample[] = [];
  for (let i = 0; i <= steps; i++) {
    const u = i / steps;
    const mu = 1 - u;
    samples.push({
      x: mu * mu * x0 + 2 * mu * u * cx + u * u * x1,
      y: mu * mu * y0 + 2 * mu * u * cy + u * u * y1,
      nx,
      ny,
    });
  }
  return { samples, cx, cy };
}

// ─────────────────────────────── the diagram ────────────────────────────────

const VB_W = 280;
const VB_H = 160;

// Premise boxes: 14…118 and 162…266, y 22…64.
const BOX_W = 104;
const BOX_H = 42;
const BOX_Y = 22;
const BOX_R = 5;
const LABEL_Y = 15; // baseline, sitting just above each box

interface Premise {
  key: string;
  box: Baked;
  rules: readonly Baked[];
  cx: number;
  boxFrom: number;
  boxTo: number;
  ruleFrom: number;
  ruleTo: number;
  labelFrom: number;
  labelTo: number;
}

function bakePremise(
  key: string,
  x: number,
  phase: number,
  boxFrom: number,
  ruleFrom: number,
  labelFrom: number,
): Premise {
  // Two short horizontal strokes standing in for a line of text — never real
  // glyphs, so the box reads as "a claim" without asking to be read.
  const rules = [
    bake(edgeSamples(x + 14, BOX_Y + 15, x + BOX_W - 16, BOX_Y + 15, 0, -1, 14), 0.5, phase + 0.6, {
      taper: true,
      waves: 2,
    }),
    bake(edgeSamples(x + 14, BOX_Y + 28, x + BOX_W - 38, BOX_Y + 28, 0, -1, 12), 0.5, phase + 2.1, {
      taper: true,
      waves: 2,
    }),
  ] as const;

  return {
    key,
    box: bakeBox(x, BOX_Y, BOX_W, BOX_H, BOX_R, 0.55, phase),
    rules,
    cx: x + BOX_W / 2,
    boxFrom,
    boxTo: boxFrom + 0.26,
    ruleFrom,
    ruleTo: ruleFrom + 0.14,
    labelFrom,
    labelTo: labelFrom + 0.09,
  };
}

const PREMISES: readonly Premise[] = [
  bakePremise('premise-left', 14, 0.7, 0.0, 0.14, 0.25),
  bakePremise('premise-right', 162, 2.4, 0.04, 0.18, 0.29),
];

// Arrows: they leave from under each box centre and converge above the
// conclusion. Shaft draws first, then the head snaps on at the tip.
const HEAD_LEN = 9;
const HEAD_SPREAD = (152 * Math.PI) / 180;

interface Arrow {
  key: string;
  shaft: Baked;
  head: Baked;
  shaftFrom: number;
  shaftTo: number;
  headFrom: number;
  headTo: number;
}

function bakeArrow(
  key: string,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  bow: number,
  phase: number,
  shaftFrom: number,
): Arrow {
  const { samples, cx, cy } = bowedSamples(x0, y0, x1, y1, bow, 26);
  const shaft = bake(samples, 0.7, phase, { taper: true, waves: 2 });

  // Tangent at the tip of a quadratic is (P1 − C); the barbs hang off that.
  const ta = Math.atan2(y1 - cy, x1 - cx);
  const head = bake(
    [
      {
        x: x1 + HEAD_LEN * Math.cos(ta + HEAD_SPREAD),
        y: y1 + HEAD_LEN * Math.sin(ta + HEAD_SPREAD),
        nx: 0,
        ny: 0,
      },
      { x: x1, y: y1, nx: 0, ny: 0 },
      {
        x: x1 + HEAD_LEN * Math.cos(ta - HEAD_SPREAD),
        y: y1 + HEAD_LEN * Math.sin(ta - HEAD_SPREAD),
        nx: 0,
        ny: 0,
      },
    ],
    0,
    0,
  );

  return {
    key,
    shaft,
    head,
    shaftFrom,
    shaftTo: shaftFrom + 0.18,
    headFrom: shaftFrom + 0.15,
    headTo: shaftFrom + 0.23,
  };
}

const ARROWS: readonly Arrow[] = [
  bakeArrow('arrow-left', 70, 70, 124, 100, 2.2, 1.1, 0.35),
  bakeArrow('arrow-right', 210, 70, 156, 100, -2.2, 3.3, 0.39),
];

// Conclusion: 82…198, y 106…146. Heavier stroke, inked fill, and a sketchy
// offset under-outline for the hand-drawn depth the premise boxes don't get.
const CONC_X = 82;
const CONC_Y = 106;
const CONC_W = 116;
const CONC_H = 40;
const CONC_R = 6;
const CONC_CX = CONC_X + CONC_W / 2; // 140
const CONC_CY = CONC_Y + CONC_H / 2; // 126

const CONC_BOX = bakeBox(CONC_X, CONC_Y, CONC_W, CONC_H, CONC_R, 0.6, 1.5);
const CONC_SHADOW = bakeBox(CONC_X + 3, CONC_Y + 3.5, CONC_W, CONC_H, CONC_R, 0.5, 4.2);

// ──────────────────────────── pieces (one hook each) ────────────────────────

function Rule({ p, rule, from, to }: { p: SharedValue<number>; rule: Baked; from: number; to: number }) {
  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: rule.len * (1 - easeOutCubic(seg(p.value, from, to))),
  }));
  return (
    <APath
      d={rule.d}
      stroke={SOFT}
      strokeWidth={1.6}
      strokeOpacity={0.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
      strokeDasharray={rule.dash}
      animatedProps={animatedProps}
    />
  );
}

function PremiseBox({ p, premise }: { p: SharedValue<number>; premise: Premise }) {
  const { box, rules, cx, boxFrom, boxTo, ruleFrom, ruleTo, labelFrom, labelTo } = premise;

  const boxProps = useAnimatedProps(() => ({
    strokeDashoffset: box.len * (1 - easeOutCubic(seg(p.value, boxFrom, boxTo))),
  }));

  // Label lifts a touch as it fades — same idiom as GrowthChart's day labels.
  const labelProps = useAnimatedProps(() => {
    const l = easeOutCubic(seg(p.value, labelFrom, labelTo));
    return { opacity: l, transform: [{ translateY: 2.5 * (1 - l) }] };
  });

  return (
    <G>
      <APath
        d={box.d}
        stroke={INK}
        strokeWidth={1.6}
        strokeOpacity={0.9}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        strokeDasharray={box.dash}
        animatedProps={boxProps}
      />
      {rules.map((rule, i) => (
        <Rule
          key={`${premise.key}-rule-${i}`}
          p={p}
          rule={rule}
          from={ruleFrom + i * 0.05}
          to={ruleTo + i * 0.05}
        />
      ))}
      <AG animatedProps={labelProps}>
        <SvgText
          x={cx}
          y={LABEL_Y}
          fill={INK}
          fontFamily="Inter_700Bold"
          fontSize={11}
          letterSpacing={1.6}
          textAnchor="middle"
        >
          PREMISE
        </SvgText>
      </AG>
    </G>
  );
}

function ArrowMark({ p, arrow }: { p: SharedValue<number>; arrow: Arrow }) {
  const { shaft, head, shaftFrom, shaftTo, headFrom, headTo } = arrow;

  const shaftProps = useAnimatedProps(() => ({
    strokeDashoffset: shaft.len * (1 - easeOutCubic(seg(p.value, shaftFrom, shaftTo))),
  }));
  const headProps = useAnimatedProps(() => ({
    strokeDashoffset: head.len * (1 - easeOutCubic(seg(p.value, headFrom, headTo))),
  }));

  return (
    <G>
      <APath
        d={shaft.d}
        stroke={INK}
        strokeWidth={1.5}
        strokeOpacity={0.85}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        strokeDasharray={shaft.dash}
        animatedProps={shaftProps}
      />
      <APath
        d={head.d}
        stroke={INK}
        strokeWidth={1.7}
        strokeOpacity={0.9}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        strokeDasharray={head.dash}
        animatedProps={headProps}
      />
    </G>
  );
}

function ConclusionBox({ p }: { p: SharedValue<number> }) {
  // The payoff pop: eased with easeOutBack so it overshoots 1 slightly, scaled
  // about (CONC_CX, CONC_CY) via the translate / scale / un-translate triplet.
  const popProps = useAnimatedProps(() => {
    const k = easeOutBack(seg(p.value, 0.75, 1));
    return {
      transform: [
        { translateX: CONC_CX },
        { translateY: CONC_CY },
        { scale: lerp(0.93, 1, k) },
        { translateX: -CONC_CX },
        { translateY: -CONC_CY },
      ],
    };
  });

  const shadowProps = useAnimatedProps(() => ({
    strokeDashoffset: CONC_SHADOW.len * (1 - easeOutCubic(seg(p.value, 0.55, 0.78))),
  }));

  const outlineProps = useAnimatedProps(() => ({
    strokeDashoffset: CONC_BOX.len * (1 - easeOutCubic(seg(p.value, 0.57, 0.85))),
  }));

  // Fill can't ride the dash, so it inks in on its own — landing just before the
  // knocked-out label needs something dark to sit on.
  const fillProps = useAnimatedProps(() => ({
    fillOpacity: clamp01(0.94 * easeOutCubic(seg(p.value, 0.64, 0.86))),
  }));

  const labelProps = useAnimatedProps(() => ({
    opacity: easeOutCubic(seg(p.value, 0.75, 0.93)),
  }));

  return (
    <AG animatedProps={popProps}>
      <APath
        d={CONC_SHADOW.d}
        stroke={SOFT}
        strokeWidth={1}
        strokeOpacity={0.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        strokeDasharray={CONC_SHADOW.dash}
        animatedProps={shadowProps}
      />
      <APath d={CONC_BOX.d} fill={INK} stroke="none" animatedProps={fillProps} />
      <APath
        d={CONC_BOX.d}
        stroke={INK}
        strokeWidth={2.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        strokeDasharray={CONC_BOX.dash}
        animatedProps={outlineProps}
      />
      <AG animatedProps={labelProps}>
        <SvgText
          x={CONC_CX}
          y={CONC_CY + 4}
          fill={PAPER}
          fontFamily="Inter_700Bold"
          fontSize={11}
          letterSpacing={1.8}
          textAnchor="middle"
        >
          CONCLUSION
        </SvgText>
      </AG>
    </AG>
  );
}

// ──────────────────────────────── the component ─────────────────────────────

export default function AnatomyDiagram({
  p,
  w = VB_W,
  h = VB_H,
}: {
  p: SharedValue<number>;
  w?: number;
  h?: number;
}) {
  return (
    <Svg width={w} height={h} viewBox={`0 0 ${VB_W} ${VB_H}`} preserveAspectRatio="xMidYMid meet">
      {PREMISES.map((premise) => (
        <PremiseBox key={premise.key} p={p} premise={premise} />
      ))}
      {ARROWS.map((arrow) => (
        <ArrowMark key={arrow.key} p={p} arrow={arrow} />
      ))}
      <ConclusionBox p={p} />
    </Svg>
  );
}
