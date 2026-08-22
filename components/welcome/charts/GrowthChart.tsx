// GrowthChart — what a daily habit actually adds up to, in bars and a line.
//
// WHY THIS IS NOT AN INTELLIGENCE CURVE.
//
// The ask was a chart showing "how much smarter you get over time". This app
// cannot measure that, and §14 is emphatic about the cost of putting a claim on
// screen that nothing behind it enforces — a value model listing things that do
// not exist is how a paywall ends up lying. A rising line labelled IQ would be
// exactly that, in the first thirty seconds, in an app about thinking clearly.
//
// So it charts what the curriculum genuinely contains and what a habit genuinely
// reaches: lessons finished per week at one a day, the rank ladder climbing over
// them, and the real totals underneath. Every number here is the app's own —
// 222 lessons, 48 ranks — and check-thinkers already guards the sibling claim on
// the thinkers board, so the habit of deriving rather than asserting is the one
// this file follows.
//
// Per the rule in ../ease.ts, every geometry value is a module-scope constant and
// never changes. All motion is opacity / strokeDashoffset / scale.

import Animated, { useAnimatedProps, type SharedValue } from 'react-native-reanimated';
import { G, Path, Rect, Text as SvgText } from 'react-native-svg';
import { INK, SOFT, clamp01, easeOutCubic, seg } from '@/components/welcome/ease';

const APath = Animated.createAnimatedComponent(Path);
const ARect = Animated.createAnimatedComponent(Rect);
const AG = Animated.createAnimatedComponent(G);

// Chart space is 300 × 300 (see BOARDS in rig.ts).
const PLOT = { x: 44, y: 84, w: 224, h: 150 };

/** Lessons finished by the end of each week at one a day: 7, 14, 21 … */
const WEEKS = 8;
const BARS = Array.from({ length: WEEKS }, (_, i) => (i + 1) * 7);
const MAX = BARS[WEEKS - 1]; // 56
const BAR_W = 18;
const GAP = (PLOT.w - WEEKS * BAR_W) / (WEEKS - 1);
const barX = (i: number) => PLOT.x + i * (BAR_W + GAP);
const barH = (v: number) => (v / MAX) * PLOT.h;

// The rank line rides over the bars: 48 ranks across 50,000 XP is not linear in
// weeks, so it is drawn as the curve it is — quick early, slower as the orders
// get longer. Points are the top of each week's climb.
const RANKS = [3, 6, 9, 12, 14, 16, 18, 20];
const R_MAX = 24;
const rankY = (v: number) => PLOT.y + PLOT.h - (v / R_MAX) * PLOT.h;
const LINE_D = RANKS.map((v, i) =>
  `${i ? 'L' : 'M'}${(barX(i) + BAR_W / 2).toFixed(1)} ${rankY(v).toFixed(1)}`,
).join(' ');
// Long enough to cover the polyline however it is measured — a dash array that
// falls short leaves a permanent gap at the end of the draw-on.
const LINE_LEN = 420;

function Bar({ i, p }: { i: number; p: SharedValue<number> }) {
  const h = barH(BARS[i]);
  // Each bar starts 0.055 after the one before it, so the row grows left to
  // right at reading speed rather than all at once.
  const t0 = 0.12 + i * 0.045;
  const props = useAnimatedProps(() => {
    const a = easeOutCubic(clamp01(seg(p.value, t0, t0 + 0.18)));
    return { height: h * a, y: PLOT.y + PLOT.h - h * a, opacity: 0.14 + 0.5 * a };
  });
  return <ARect x={barX(i)} width={BAR_W} rx={2} fill={INK} animatedProps={props} />;
}

export default function GrowthChart({ p }: { p: SharedValue<number> }) {
  const headProps = useAnimatedProps(() => ({ opacity: easeOutCubic(seg(p.value, 0, 0.1)) }));
  const axisProps = useAnimatedProps(() => ({ strokeOpacity: 0.45 * easeOutCubic(seg(p.value, 0.06, 0.2)) }));
  // The line draws on AFTER the bars are up, so it reads as a consequence of
  // them rather than a second thing happening at the same time.
  const lineProps = useAnimatedProps(() => {
    const a = easeOutCubic(clamp01(seg(p.value, 0.52, 0.84)));
    return { strokeDashoffset: LINE_LEN * (1 - a), strokeOpacity: a };
  });
  const capProps = useAnimatedProps(() => ({ opacity: easeOutCubic(seg(p.value, 0.78, 0.9)) }));
  const footProps = useAnimatedProps(() => ({ opacity: 0.92 * easeOutCubic(seg(p.value, 0.84, 0.95)) }));

  return (
    <G>
      <AG animatedProps={headProps}>
        <SvgText x={150} y={26} fill={SOFT} fontFamily="Inter_700Bold" fontSize={15} letterSpacing={2.2} textAnchor="middle">
          ONE A DAY
        </SvgText>
        <SvgText x={150} y={54} fill={INK} fontFamily="PlayfairDisplay_700Bold" fontSize={26} textAnchor="middle">
          It compounds.
        </SvgText>
      </AG>

      {/* the floor the bars stand on */}
      <APath
        d={`M${PLOT.x - 8} ${PLOT.y + PLOT.h} L${PLOT.x + PLOT.w + 8} ${PLOT.y + PLOT.h}`}
        stroke={INK} strokeWidth={1.4} strokeLinecap="round" fill="none" animatedProps={axisProps}
      />

      {BARS.map((_, i) => <Bar key={i} i={i} p={p} />)}

      <APath
        d={LINE_D}
        stroke={INK} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" fill="none"
        strokeDasharray={LINE_LEN} animatedProps={lineProps}
      />

      <AG animatedProps={capProps}>
        <SvgText x={PLOT.x + PLOT.w} y={rankY(RANKS[WEEKS - 1]) - 14} fill={INK}
          fontFamily="Inter_700Bold" fontSize={15} textAnchor="end">
          RANK 20
        </SvgText>
      </AG>

      <AG animatedProps={footProps}>
        <SvgText x={PLOT.x} y={PLOT.y + PLOT.h + 26} fill={SOFT}
          fontFamily="EBGaramond_400Regular_Italic" fontSize={17}>
          eight weeks
        </SvgText>
        <SvgText x={PLOT.x + PLOT.w} y={PLOT.y + PLOT.h + 26} fill={SOFT}
          fontFamily="EBGaramond_400Regular_Italic" fontSize={17} textAnchor="end">
          222 lessons · 48 ranks
        </SvgText>
      </AG>
    </G>
  );
}
