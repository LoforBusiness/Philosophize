// ThinkersChart — six real philosophers on a real timeline.
//
// It replaces an abstract tree of branches spreading from the word "you", which
// was the prettiest thing on this screen and said the least: no name, no date, no
// claim a reader could carry away. This says who they will actually meet and when
// they lived, and its best fact is one nobody puts on a slide on purpose — the
// enormous EMPTY STRETCH between Aristotle and Descartes. Two thousand years in
// which the argument did not stop is worth more, and is more intriguing, than any
// number of branching curves.
//
// Every lifespan here is copied from data/philosophers.ts, including its BCE
// spelling, so the board cannot contradict the Thinkers tab it is advertising.
//
// Per the rule in ../ease.ts, every geometry value is a module-scope constant.
// Motion is opacity / strokeOpacity / strokeDashoffset only.

import Animated, { useAnimatedProps, type SharedValue } from 'react-native-reanimated';
import { Circle, G, Path, Text as SvgText } from 'react-native-svg';
import { INK, SOFT, clamp01, easeOutBack, easeOutCubic, seg } from '@/components/welcome/ease';
import { ALL_PHILOSOPHERS } from '@/data/philosophers';

const APath = Animated.createAnimatedComponent(Path);
const ACircle = Animated.createAnimatedComponent(Circle);
const AG = Animated.createAnimatedComponent(G);

// Chart space is 300 × 202 (see BOARDS in rig.ts).
const AXIS_Y = 104;
const AXIS_X0 = 16;
const AXIS_X1 = 288;
const AXIS_D = `M${AXIS_X0} ${AXIS_Y} L${AXIS_X1} ${AXIS_Y}`;
const AXIS_LEN = AXIS_X1 - AXIS_X0;

interface Thinker {
  name: string;
  dates: string;
  x: number;
  /** true = label sits above the line. Alternating is what keeps them legible. */
  up: boolean;
  /** Where in the board's 0→1 draw it appears. */
  at: number;
}

/**
 * FIVE, not six, and that is a measured limit rather than a preference. Six names
 * at this size do not fit 300 units even alternating above and below the line:
 * DESCARTES ran into NIETZSCHE and KANT into BEAUVOIR, which is worse than showing
 * one fewer thinker. Aristotle went because Socrates already stands for ancient
 * Greece, and because the other four are the ones the host says out loud.
 *
 * Placed by ERA rather than to a linear scale — 2,400 years spread evenly would
 * pile the moderns on top of one another. The empty stretch is still honest, and
 * it is labelled, because it is the most interesting thing on the chart.
 *
 * "BEAUVOIR" rather than "DE BEAUVOIR": the full form is 11 characters and
 * overruns the board. The host says her name in full.
 */
// The five drawn here are subtracted from the real roll for the footer, so the
// board cannot disagree with the app about how many thinkers there are. It said
// "AND 218 MORE" — which encodes a total of 223, the figure the spoken line was
// also stuck on.
const THINKERS: Thinker[] = [
  { name: 'SOCRATES', dates: '470–399 BCE', x: 34, up: true, at: 0.1 },
  { name: 'DESCARTES', dates: '1596–1650', x: 140, up: false, at: 0.34 },
  { name: 'KANT', dates: '1724–1804', x: 186, up: true, at: 0.5 },
  { name: 'NIETZSCHE', dates: '1844–1900', x: 232, up: false, at: 0.64 },
  { name: 'BEAUVOIR', dates: '1908–1986', x: 276, up: true, at: 0.78 },
];

const STEM = 26;
const stemD = (t: Thinker) =>
  `M${t.x} ${AXIS_Y} L${t.x} ${AXIS_Y + (t.up ? -STEM : STEM)}`;

function Mark({ p, t }: { p: SharedValue<number>; t: Thinker }) {
  const dotProps = useAnimatedProps(() => {
    const u = clamp01((p.value - t.at) / 0.05);
    // Scaled about its own centre the long way round, not with originX/originY:
    // an animated transform ARRAY is what repaints on this stack, and it replaces
    // the static origin props rather than composing with them. GrowthChart's dots
    // do exactly this.
    return {
      opacity: u > 0 ? 1 : 0,
      transform: [
        { translateX: t.x },
        { translateY: AXIS_Y },
        { scale: Math.min(easeOutBack(u), 1.3) },
        { translateX: -t.x },
        { translateY: -AXIS_Y },
      ],
    };
  });
  const stemProps = useAnimatedProps(() => ({
    strokeDashoffset: STEM * (1 - easeOutCubic(seg(p.value, t.at, t.at + 0.06))),
    strokeOpacity: 0.5 * clamp01((p.value - t.at) / 0.03),
  }));
  const textProps = useAnimatedProps(() => {
    const a = easeOutCubic(seg(p.value, t.at + 0.03, t.at + 0.11));
    return { opacity: a, transform: [{ translateY: (t.up ? 4 : -4) * (1 - a) }] };
  });

  // Names sit clear of the stem end; the dates tuck under the name.
  const nameY = t.up ? AXIS_Y - STEM - 16 : AXIS_Y + STEM + 15;
  const dateY = t.up ? nameY - 13 : nameY + 13;
  // Only the outermost two would overrun the board if centred on their own mark.
  const anchor = t.x < 46 ? 'start' : t.x > 262 ? 'end' : 'middle';
  const tx = t.x < 46 ? AXIS_X0 : t.x > 262 ? AXIS_X1 : t.x;

  return (
    <G>
      <APath
        d={stemD(t)}
        stroke={INK}
        strokeWidth={1}
        strokeLinecap="round"
        fill="none"
        strokeDasharray={STEM}
        animatedProps={stemProps}
      />
      <ACircle cx={t.x} cy={AXIS_Y} r={3.4} fill={INK} animatedProps={dotProps} />
      <AG animatedProps={textProps}>
        <SvgText
          x={tx}
          y={nameY}
          fill={INK}
          fontFamily="Inter_700Bold"
          fontSize={13}
          letterSpacing={0.3}
          textAnchor={anchor}
        >
          {t.name}
        </SvgText>
        <SvgText
          x={tx}
          y={dateY}
          fill={SOFT}
          fontFamily="EBGaramond_400Regular_Italic"
          fontSize={11.5}
          textAnchor={anchor}
        >
          {t.dates}
        </SvgText>
      </AG>
    </G>
  );
}

export default function ThinkersChart({ p }: { p: SharedValue<number> }) {
  const axisProps = useAnimatedProps(() => ({
    strokeDashoffset: AXIS_LEN * (1 - easeOutCubic(seg(p.value, 0, 0.12))),
  }));
  // The empty stretch, called out on the line itself between Socrates and
  // Descartes — the one label on this board that teaches something the names alone
  // do not. Kept short and centred BETWEEN their two stems: the arrowed version
  // was wide enough to cross Descartes' stem.
  const gapProps = useAnimatedProps(() => ({
    opacity: 0.85 * easeOutCubic(seg(p.value, 0.22, 0.36)),
  }));
  const footProps = useAnimatedProps(() => ({
    opacity: easeOutCubic(seg(p.value, 0.88, 1)),
  }));

  return (
    <G>
      <APath
        d={AXIS_D}
        stroke={INK}
        strokeWidth={1.4}
        strokeOpacity={0.85}
        strokeLinecap="round"
        fill="none"
        strokeDasharray={AXIS_LEN}
        animatedProps={axisProps}
      />

      {THINKERS.map((t) => (
        <Mark key={t.name} p={p} t={t} />
      ))}

      <AG animatedProps={gapProps}>
        <SvgText
          x={87}
          y={AXIS_Y - 7}
          fill={SOFT}
          fontFamily="EBGaramond_400Regular_Italic"
          fontSize={12}
          textAnchor="middle"
        >
          — 2,000 years —
        </SvgText>
      </AG>

      <AG animatedProps={footProps}>
        <SvgText
          x={150}
          y={194}
          fill={SOFT}
          fontFamily="Inter_500Medium"
          fontSize={11}
          letterSpacing={1.6}
          textAnchor="middle"
        >
          AND {ALL_PHILOSOPHERS.length - THINKERS.length} MORE
        </SvgText>
      </AG>
    </G>
  );
}
