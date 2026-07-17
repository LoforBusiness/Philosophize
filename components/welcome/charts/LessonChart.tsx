// LessonChart — port of `drawLesson` from the approved canvas preview.
//
// A mock lesson card answering "Is it ever right to lie?": the card outline fades
// in, the question follows, two answer pills appear in turn, the second is chosen
// (faint fill + tick), then the footer teases Kant.
//
// Per the rule in ./ease.ts, EVERY geometry value here is a module-scope constant
// and never changes. All motion is opacity / strokeOpacity / fillOpacity only —
// which is exactly what the canvas did (it animated globalAlpha and nothing else).

import React from 'react';
import Animated, { useAnimatedProps, type SharedValue } from 'react-native-reanimated';
import { G, Path, Rect, Text as SvgText } from 'react-native-svg';
import { INK, SOFT, easeOutCubic, seg } from '@/components/welcome/ease';

const AG = Animated.createAnimatedComponent(G);
const ARect = Animated.createAnimatedComponent(Rect);
const APath = Animated.createAnimatedComponent(Path);

// ---- static geometry (canvas coordinates, unchanged) ----
const CARD = { x: 16, y: 10, w: 268, h: 128, r: 8 } as const;
const PILL = { x: 30, w: 180, h: 24, r: 12 } as const;

// Canvas: roundRect(30, 52 + i*30, 180, 24, 12)
const PILLS = [
  { label: 'Never', start: 0.26, y: 52, chosen: false },
  { label: 'To save a life', start: 0.36, y: 82, chosen: true },
] as const;

// Canvas: moveTo(222, y+12) lineTo(228, y+18) lineTo(240, y+5), for the chosen pill (y = 82).
const TICK_D = 'M222 94 L228 100 L240 87';

// The chosen pill's fill + tick share this window.
const PICK_FROM = 0.58;
const PICK_TO = 0.72;

type PillProps = {
  p: SharedValue<number>;
  label: string;
  /** Start of the pill's 0.14-long fade-in window. */
  start: number;
  y: number;
  chosen: boolean;
};

function Pill({ p, label, start, y, chosen }: PillProps) {
  // Canvas: q = easeOutCubic(seg(p, st, st + 0.14)) — gates the pill stroke, its
  // label, and (multiplicatively) the chosen fill + tick. Nesting them in this
  // group reproduces the canvas's q*pick products exactly.
  const groupProps = useAnimatedProps(() => ({
    opacity: easeOutCubic(seg(p.value, start, start + 0.14)),
  }));

  // Canvas: globalAlpha = q * pick * 0.12 → inside the q group, fillOpacity = pick * 0.12.
  const fillProps = useAnimatedProps(() => ({
    fillOpacity: 0.12 * easeOutCubic(seg(p.value, PICK_FROM, PICK_TO)),
  }));

  // Canvas: globalAlpha = q * pick → inside the q group, strokeOpacity = pick.
  const tickProps = useAnimatedProps(() => ({
    strokeOpacity: easeOutCubic(seg(p.value, PICK_FROM, PICK_TO)),
  }));

  return (
    <AG animatedProps={groupProps}>
      <Rect
        x={PILL.x}
        y={y}
        width={PILL.w}
        height={PILL.h}
        rx={PILL.r}
        ry={PILL.r}
        fill="none"
        stroke={INK}
        strokeWidth={1.1}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {chosen ? (
        <ARect
          x={PILL.x}
          y={y}
          width={PILL.w}
          height={PILL.h}
          rx={PILL.r}
          ry={PILL.r}
          fill={INK}
          animatedProps={fillProps}
        />
      ) : null}
      <SvgText
        x={42}
        y={y + 16}
        fill={INK}
        fontFamily="Inter_400Regular"
        fontSize={12}
        textAnchor="start"
      >
        {label}
      </SvgText>
      {chosen ? (
        <APath
          d={TICK_D}
          fill="none"
          stroke={INK}
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
          animatedProps={tickProps}
        />
      ) : null}
    </AG>
  );
}

export default function LessonChart({ p }: { p: SharedValue<number> }) {
  // Canvas: globalAlpha = 0.9 * easeOutCubic(seg(p, 0, 0.12)) on a stroke-only rect.
  const cardProps = useAnimatedProps(() => ({
    strokeOpacity: 0.9 * easeOutCubic(seg(p.value, 0, 0.12)),
  }));

  const questionProps = useAnimatedProps(() => ({
    opacity: easeOutCubic(seg(p.value, 0.1, 0.26)),
  }));

  const footerProps = useAnimatedProps(() => ({
    opacity: easeOutCubic(seg(p.value, 0.74, 0.94)),
  }));

  return (
    <G>
      <ARect
        x={CARD.x}
        y={CARD.y}
        width={CARD.w}
        height={CARD.h}
        rx={CARD.r}
        ry={CARD.r}
        fill="none"
        stroke={INK}
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
        animatedProps={cardProps}
      />

      <AG animatedProps={questionProps}>
        <SvgText
          x={30}
          y={36}
          fill={INK}
          fontFamily="Inter_500Medium"
          fontSize={13}
          textAnchor="start"
        >
          Is it ever right to lie?
        </SvgText>
      </AG>

      {PILLS.map((pill) => (
        <Pill
          key={pill.label}
          p={p}
          label={pill.label}
          start={pill.start}
          y={pill.y}
          chosen={pill.chosen}
        />
      ))}

      <AG animatedProps={footerProps}>
        <SvgText
          x={30}
          y={126}
          fill={SOFT}
          fontFamily="EBGaramond_400Regular_Italic"
          fontSize={11.5}
          textAnchor="start"
        >
          Kant disagrees. Here’s why →
        </SvgText>
      </AG>
    </G>
  );
}
