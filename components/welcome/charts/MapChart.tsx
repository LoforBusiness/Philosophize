// MapChart — the six branches of philosophy, which is the first genuinely useful
// thing this screen has ever put on a board.
//
// It replaces a decorative exponential curve labelled "day 1 → day 7". That curve
// was drawn beautifully and asserted nothing: no reader learned a single true fact
// from it, and the line it illustrated ("and it adds up, fast") was a promise about
// the app rather than anything about philosophy. A beginner does not know what
// "epistemology" means, and being told in five seconds is worth more than any
// number of rising curves.
//
// Each name lands on the WORD that names it. The cue times come from cueTimes(),
// which reads them off the same beat table the speech bubble uses, so the picture
// cannot drift from the line — see the `cues` field in rig.ts.
//
// Per the rule in ../ease.ts, every geometry value here is a module-scope constant
// and never changes. All motion is opacity / strokeOpacity / strokeDashoffset.

import Animated, { useAnimatedProps, type SharedValue } from 'react-native-reanimated';
import { G, Path, Text as SvgText } from 'react-native-svg';
import { INK, SOFT, clamp01, easeOutCubic, seg } from '@/components/welcome/ease';
import { cueTimes } from '@/components/welcome/rig';

const APath = Animated.createAnimatedComponent(Path);
const AG = Animated.createAnimatedComponent(G);

// Chart space is 300 × 225 (see BOARDS in rig.ts). Two columns of three.
//
// ── THE MIDDLE ROW USED TO READ "EPISTEMOLOGYAESTHETICS" ───────────────────
//
// A reader: "when it shows the 6 different branches I noticed the metaphysics
// word was glitching." It was not glitching; it was TOUCHING. The columns sat
// 130 units apart and at fontSize 17 the two widest neighbours measure 142 and
// 118 — half-widths of 71 and 59, which is 130 exactly. Zero clearance, so the
// two names met in the middle and read as one string. Nothing was out of the
// viewBox and nothing threw, which is why it survived: a collision is invisible
// to every check that measures a box against its frame rather than against its
// neighbour.
//
// Wider columns AND a smaller name — both, because either alone is marginal.
// The gap is measured in a browser now (scripts/check-intro.mjs) rather than
// estimated from a character count, since the widths depend on the actual font
// and the estimate is what put them at exactly zero.
const COL = [80, 222];
const ROW = [36, 106, 178];
const NAME_SIZE = 16;
const GLOSS_SIZE = 13.5;
/** Leading between the two lines of a name that does not fit on one. */
const LINE_H = 17;

interface Cell {
  /** Split only where a name does not fit one line at this size. */
  lines: string[];
  gloss: string;
  col: number;
  row: number;
}

/**
 * The names and one-line senses. The names are the app's own six branches and the
 * glosses are what the host says out loud, word for word — the board is not
 * allowed to claim a seventh branch or rename one of the six.
 */
const CELLS: Cell[] = [
  { lines: ['METAPHYSICS'], gloss: 'what is real', col: 0, row: 0 },
  { lines: ['EPISTEMOLOGY'], gloss: 'how you know', col: 0, row: 1 },
  { lines: ['LOGIC'], gloss: 'what follows', col: 0, row: 2 },
  { lines: ['ETHICS'], gloss: 'how to live', col: 1, row: 0 },
  { lines: ['AESTHETICS'], gloss: 'what is beautiful', col: 1, row: 1 },
  { lines: ['POLITICAL', 'PHILOSOPHY'], gloss: 'who rules', col: 1, row: 2 },
];

/** Absolute times the six names land on, read off the script itself. */
const CUES = cueTimes('map');

// A rule under each name, drawn on left-to-right with the name.
const RULE_W = 108;
const ruleD = (c: number, r: number) =>
  `M${COL[c] - RULE_W / 2} ${ROW[r] + 10} L${COL[c] + RULE_W / 2} ${ROW[r] + 10}`;

function Branch({
  clock,
  cell,
  at,
}: {
  clock: SharedValue<number>;
  cell: Cell;
  /** When this one lands. NaN if the script has no cue for it. */
  at: number;
}) {
  // A TWO-LINE NAME GROWS UPWARD, so its LAST line always sits on the row and
  // the rule and the gloss below it never have to move.
  //
  // It used to be centred on the row instead — `ROW - 7`, with the second line
  // 18 below that — which put POLITICAL PHILOSOPHY's second baseline at 187 and
  // its rule at 186. The rule was drawn straight through the word, and since it
  // is the same ink at the same weight the word simply looked struck out. D31:
  // nothing painted over a word, including the board's own furniture.
  const baseY = ROW[cell.row] - (cell.lines.length - 1) * LINE_H;

  const nameProps = useAnimatedProps(() => {
    const a = easeOutCubic(clamp01((clock.value - at) / 0.34));
    return { opacity: a, transform: [{ translateY: 5 * (1 - a) }] };
  });
  const ruleProps = useAnimatedProps(() => ({
    strokeDashoffset: RULE_W * (1 - easeOutCubic(clamp01((clock.value - at - 0.1) / 0.4))),
    strokeOpacity: 0.55 * clamp01((clock.value - at - 0.1) / 0.2),
  }));
  const glossProps = useAnimatedProps(() => ({
    opacity: 0.92 * easeOutCubic(clamp01((clock.value - at - 0.24) / 0.36)),
  }));

  return (
    <G>
      <AG animatedProps={nameProps}>
        {cell.lines.map((line, i) => (
          <SvgText
            key={line}
            x={COL[cell.col]}
            y={baseY + i * LINE_H}
            fill={INK}
            fontFamily="Inter_700Bold"
            fontSize={NAME_SIZE}
            letterSpacing={0.4}
            textAnchor="middle"
          >
            {line}
          </SvgText>
        ))}
      </AG>
      <APath
        d={ruleD(cell.col, cell.row)}
        stroke={INK}
        strokeWidth={1.1}
        strokeLinecap="round"
        fill="none"
        strokeDasharray={RULE_W}
        animatedProps={ruleProps}
      />
      <AG animatedProps={glossProps}>
        <SvgText
          x={COL[cell.col]}
          y={ROW[cell.row] + 27}
          fill={SOFT}
          fontFamily="EBGaramond_400Regular_Italic"
          fontSize={GLOSS_SIZE}
          textAnchor="middle"
        >
          {cell.gloss}
        </SvgText>
      </AG>
    </G>
  );
}

export default function MapChart({
  p,
  clock,
}: {
  /** The board's own 0→1 draw progress; only the heading rides it. */
  p: SharedValue<number>;
  /** The absolute clock, because the six names are cued off the SPOKEN words. */
  clock: SharedValue<number>;
}) {
  const headProps = useAnimatedProps(() => ({
    opacity: easeOutCubic(seg(p.value, 0, 0.09)),
  }));

  return (
    <G>
      <AG animatedProps={headProps}>
        <SvgText
          x={150}
          y={14}
          fill={SOFT}
          fontFamily="Inter_500Medium"
          fontSize={11}
          letterSpacing={2.2}
          textAnchor="middle"
        >
          THE SIX BRANCHES
        </SvgText>
      </AG>

      {CELLS.map((cell, i) => (
        <Branch key={cell.gloss} clock={clock} cell={cell} at={CUES[i] ?? -1} />
      ))}
    </G>
  );
}
