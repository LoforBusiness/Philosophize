// SyllogismChart — Aristotle's syllogism set like a formal proof.
//
//     PREMISES
//   ┌  All men are mortal.
//   └  Socrates is a man.
//      ────────────────────
//   ∴  Socrates is mortal.
//
// The two premises fade up in turn, a grouping bracket draws in beside them, the
// proof rule sweeps left-to-right, the therefore-sign pops, and the conclusion
// arrives last.
//
// Per the rule in components/welcome/ease.ts, react-native-svg 15 + Fabric only
// repaints transform / opacity / strokeOpacity / fillOpacity / strokeDashoffset.
// Animated GEOMETRY (d, points, x, y, width, r, strokeWidth) renders FROZEN. So
// every coordinate below is computed ONCE at module scope and never changes; all
// motion is transform, opacity and strokeDashoffset only. Transforms are RN
// arrays, never SVG transform strings (Reanimated 4 parses a string `transform`
// as CSS and crashes).

import React from 'react';
import Animated, { useAnimatedProps, type SharedValue } from 'react-native-reanimated';
import Svg, { G, Path, Text as SvgText } from 'react-native-svg';
import {
  clamp01,
  seg,
  lerp,
  easeOutCubic,
  easeOutBack,
  INK,
  SOFT,
} from '@/components/welcome/ease';

const AG = Animated.createAnimatedComponent(G);
const APath = Animated.createAnimatedComponent(Path);

// ── canvas ──────────────────────────────────────────────────────────────────────
const VB_W = 280;
const VB_H = 160;

// ── layout (frozen) ─────────────────────────────────────────────────────────────
const TEXT_X = 40; // left edge of every line of the proof
const CAPTION_Y = 42;
const L1_Y = 64; // premise 1 baseline
const L2_Y = 86; // premise 2 baseline
const RULE_Y = 100; // the proof bar
const CONC_Y = 122; // conclusion baseline

const BODY_SIZE = 13;
const CONC_SIZE = 13.5;

// The therefore sign sits in the conclusion's left gutter; the text clears it.
const THEREFORE_X = TEXT_X;
const CONC_TEXT_X = 58;
// Its own centre, for the scale triplet.
const THEREFORE_CX = TEXT_X + 5;
const THEREFORE_CY = CONC_Y - 4.5;

const RISE = 4; // how far each line slides up as it fades in

// ── baked stroke geometry ───────────────────────────────────────────────────────
// Every stroked path is a polyline flattened once, with its arc length accumulated
// so strokeDasharray can be the exact length and strokeDashoffset can reveal it.
// Dash constants are rounded UP so the stroke always closes fully.
function bake(pts: readonly (readonly [number, number])[]) {
  let d = `M${pts[0][0].toFixed(2)} ${pts[0][1].toFixed(2)}`;
  let acc = 0;
  for (let i = 1; i < pts.length; i++) {
    const [x, y] = pts[i];
    const [prevX, prevY] = pts[i - 1];
    acc += Math.hypot(x - prevX, y - prevY);
    d += ` L${x.toFixed(2)} ${y.toFixed(2)}`;
  }
  return { d, len: acc, dash: Math.ceil(acc) };
}

// Grouping bracket beside the premises — a `[` with short serifs, drawn from the
// top serif down and back out, so it unrolls the way a hand would draw it.
const BRACKET = bake([
  [33, 52],
  [28, 52],
  [28, 90],
  [33, 90],
] as const);

// The proof bar. Baked left→right, so strokeDashoffset reveals it left→right.
const RULE = bake([
  [36, RULE_Y],
  [196, RULE_Y],
] as const);

// ── timing ──────────────────────────────────────────────────────────────────────
const T_P1 = [0.0, 0.18] as const;
const T_P2 = [0.15, 0.33] as const;
const T_BRACKET = [0.3, 0.45] as const;
const T_RULE = [0.42, 0.62] as const;
const T_THEREFORE = [0.6, 0.8] as const;
const T_CONCLUSION = [0.7, 1.0] as const;

// ── a premise line (needs its own hook, so it needs its own component) ──────────
function PremiseLine({
  p,
  text,
  y,
  from,
  to,
}: {
  p: SharedValue<number>;
  text: string;
  y: number;
  from: number;
  to: number;
}) {
  const animatedProps = useAnimatedProps(() => {
    const e = easeOutCubic(seg(p.value, from, to));
    return {
      opacity: e,
      transform: [{ translateY: lerp(RISE, 0, e) }],
    };
  });

  return (
    <AG animatedProps={animatedProps}>
      <SvgText
        x={TEXT_X}
        y={y}
        fill={INK}
        fontFamily="PlayfairDisplay_400Regular"
        fontStyle="italic"
        fontSize={BODY_SIZE}
        textAnchor="start"
      >
        {text}
      </SvgText>
    </AG>
  );
}

export default function SyllogismChart({
  p,
  w = VB_W,
  h = VB_H,
}: {
  p: SharedValue<number>;
  w?: number;
  h?: number;
}) {
  // Caption rides in just behind the first premise.
  const captionProps = useAnimatedProps(() => {
    const e = easeOutCubic(seg(p.value, 0.02, 0.2));
    return {
      opacity: e,
      transform: [{ translateY: lerp(RISE, 0, e) }],
    };
  });

  const bracketProps = useAnimatedProps(() => ({
    strokeDashoffset:
      BRACKET.dash * (1 - easeOutCubic(seg(p.value, T_BRACKET[0], T_BRACKET[1]))),
  }));

  const ruleProps = useAnimatedProps(() => ({
    strokeDashoffset: RULE.dash * (1 - easeOutCubic(seg(p.value, T_RULE[0], T_RULE[1]))),
  }));

  // The therefore sign: overshoot-scaled about its own centre via the
  // translate → scale → un-translate triplet, with the ink landing a touch ahead
  // of the settle so it reads as a stamp rather than a grow.
  const thereforeProps = useAnimatedProps(() => {
    const u = seg(p.value, T_THEREFORE[0], T_THEREFORE[1]);
    return {
      opacity: clamp01(u / 0.35),
      transform: [
        { translateX: THEREFORE_CX },
        { translateY: THEREFORE_CY },
        { scale: easeOutBack(u) },
        { translateX: -THEREFORE_CX },
        { translateY: -THEREFORE_CY },
      ],
    };
  });

  const conclusionProps = useAnimatedProps(() => {
    const e = easeOutCubic(seg(p.value, T_CONCLUSION[0], T_CONCLUSION[1]));
    return {
      opacity: e,
      transform: [{ translateY: lerp(RISE, 0, e) }],
    };
  });

  return (
    // No background rect: the board sits on the lesson's own paper, and a filled
    // rect here is a different off-white (the welcome-screen paper) that reads as
    // a grey box against it. Transparent lets the real paper show through.
    <Svg width={w} height={h} viewBox={`0 0 ${VB_W} ${VB_H}`}>
      {/* caption */}
      <AG animatedProps={captionProps}>
        <SvgText
          x={TEXT_X}
          y={CAPTION_Y}
          fill={SOFT}
          fontFamily="Inter_700Bold"
          fontSize={8}
          letterSpacing={1.5}
          textAnchor="start"
        >
          PREMISES
        </SvgText>
      </AG>

      {/* the two premises */}
      <PremiseLine p={p} text="All men are mortal." y={L1_Y} from={T_P1[0]} to={T_P1[1]} />
      <PremiseLine p={p} text="Socrates is a man." y={L2_Y} from={T_P2[0]} to={T_P2[1]} />

      {/* bracket grouping them */}
      <APath
        d={BRACKET.d}
        stroke={SOFT}
        strokeWidth={1.1}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        strokeDasharray={BRACKET.dash}
        animatedProps={bracketProps}
      />

      {/* the proof rule */}
      <APath
        d={RULE.d}
        stroke={INK}
        strokeWidth={1.4}
        strokeOpacity={0.85}
        strokeLinecap="round"
        fill="none"
        strokeDasharray={RULE.dash}
        animatedProps={ruleProps}
      />

      {/* ∴ */}
      <AG animatedProps={thereforeProps}>
        <SvgText
          x={THEREFORE_X}
          y={CONC_Y}
          fill={INK}
          fontFamily="PlayfairDisplay_700Bold"
          fontSize={CONC_SIZE}
          textAnchor="start"
        >
          ∴
        </SvgText>
      </AG>

      {/* the conclusion */}
      <AG animatedProps={conclusionProps}>
        <SvgText
          x={CONC_TEXT_X}
          y={CONC_Y}
          fill={INK}
          fontFamily="PlayfairDisplay_700Bold"
          fontSize={CONC_SIZE}
          textAnchor="start"
        >
          Socrates is mortal.
        </SvgText>
      </AG>
    </Svg>
  );
}
