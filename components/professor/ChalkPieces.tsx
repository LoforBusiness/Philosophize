import { useMemo } from 'react';
import Animated, { useAnimatedProps, type SharedValue } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { clamp01 } from '@/components/lesson/cinematic/rig';
import { PAPER_LIT } from '@/components/shared/tone';
import { CHALK_W, type ChalkPiece, type ChalkStroke } from './chalk';

// ─────────────────────────────────────────────────────────────────────────────
// CHALK, DRAWN — one board's pieces, each writing itself as `progress` runs 0 → 1.
//
// Shared by the professor's intro and any lesson that writes on a board
// (logic-arguments-1). The layout and the timing are chalk.ts's; this only paints.
//
// A PIECE IS ONE <Svg>, sized to its own box, never a board-sized one:
// react-native-svg redraws a whole SvgView for every animated property written to it
// (CLAUDE.md §17 rule 7, §19's GPU budget). Inside a piece every stroke has its own
// dash reveal, and a faint dust is left under a piece once it is finished.
// ─────────────────────────────────────────────────────────────────────────────

const AnimatedPath = Animated.createAnimatedComponent(Path);

/** The chalk as it lands: nearly white, a touch of the slate showing through. */
const CHALK_OPACITY = 0.92;
/** The dust a finished stroke leaves on the slate. */
const DUST_OPACITY = 0.12;
const DUST_W = CHALK_W * 2.6;

/**
 * Every piece of one board. `x`, `y` is where the board's (0, 0) sits in the parent
 * and `s` is the board's scale; `progress` is 0..1 through the board's drawing.
 */
export default function ChalkPieces({ pieces, progress, x, y, s }: {
  pieces: readonly ChalkPiece[];
  progress: SharedValue<number>;
  x: number;
  y: number;
  s: number;
}) {
  return (
    <>
      {pieces.map((p, k) => <Piece key={k} piece={p} progress={progress} x={x} y={y} s={s} />)}
    </>
  );
}

function Piece({ piece, progress, x, y, s }: {
  piece: ChalkPiece; progress: SharedValue<number>; x: number; y: number; s: number;
}) {
  const { box } = piece;
  const dust = useMemo(() => piece.strokes.map((st) => st.d).join(' '), [piece]);
  const dustProps = useAnimatedProps(() => ({
    strokeOpacity: DUST_OPACITY * clamp01((progress.value - piece.t1) / 0.05),
  }));
  return (
    <Svg
      width={box.w * s}
      height={box.h * s}
      viewBox={`0 0 ${box.w} ${box.h}`}
      style={{ position: 'absolute', left: x + box.x * s, top: y + box.y * s }}
      pointerEvents="none"
    >
      <AnimatedPath
        d={dust}
        stroke={PAPER_LIT}
        strokeWidth={DUST_W}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        animatedProps={dustProps}
      />
      {piece.strokes.map((st, i) => <Stroke key={i} stroke={st} progress={progress} />)}
    </Svg>
  );
}

function Stroke({ stroke, progress }: { stroke: ChalkStroke; progress: SharedValue<number> }) {
  // The length is padded a little so a round cap never shows before the stroke begins.
  const len = stroke.len + CHALK_W;
  const props = useAnimatedProps(() => {
    const u = clamp01((progress.value - stroke.t0) / (stroke.t1 - stroke.t0));
    return { strokeDashoffset: len * (1 - u), strokeOpacity: u > 0 ? CHALK_OPACITY : 0 };
  });
  return (
    <AnimatedPath
      d={stroke.d}
      stroke={PAPER_LIT}
      strokeWidth={CHALK_W}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray={[len, len]}
      fill="none"
      animatedProps={props}
    />
  );
}
