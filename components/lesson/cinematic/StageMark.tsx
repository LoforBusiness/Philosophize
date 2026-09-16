import { memo, useEffect, useMemo, useRef } from 'react';
import Animated, {
  Easing, useAnimatedProps, useAnimatedStyle, useSharedValue, withDelay, withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { EMBER_INK, PAPER } from '@/components/shared/tone';
import { useNarrationStore } from '@/lib/narration/store';
import type { StageMarkSpot } from '@/data/lessonMarks';
import { markPath, seedOf } from './markPath';

// ─────────────────────────────────────────────────────────────────────────────
// A PEN MARK ON THE THING THE VOICE IS NAMING.
//
// On a tap where the scene's art does not change, the player draws one of these round
// the stage label the narration names (data/lessonMarks.ts, scripts/make-marks.mjs):
// a ring, an underline, a pair of brackets, a box or an arrow, drawn in the moment the
// voice reaches the word. It is the teacher's pen at a board, and the reader's answer
// to "three tabs … where there is no animation above the words".
//
// ── HOW IT IS BUILT, AND WHY ────────────────────────────────────────────────
//
//   · ONE SMALL <Svg>, the size of its own box. §19 measured what a full-bleed one
//     costs (its whole box in GPU memory for as long as the tab is built), and §17
//     rule 7 what an animated one costs; this is neither, and at most two exist at
//     once — the one arriving and the one leaving.
//   · A DASH REVEAL WITH ROUND CAPS, the launch drawing's own idiom: a butt cap ends a
//     reveal on a hard rectangle and reads as a vector wipe, a round cap as a pen tip.
//   · IN THE SPARK, darkened. EMBER is licensed only as a small mark (tone.ts), and a
//     2.3-unit stroke is one; EMBER_INK is the depth of it that clears 3:1 on paper AND
//     on every branch's hued STONE, which check:marks measures.
//   · ONE ELEMENT FOR ITS WHOLE LIFE. The player keeps a mark mounted while it leaves
//     and flips `show`; a phase change must never be a remount (AB11), or the exit
//     starts from nothing.
//   · TIMED OFF THE VOICE, NOT A CLOCK OF ITS OWN. When the line is voiced the pen
//     starts LEAD_MS before the word's own start in the manifest; when it is not — the
//     voice muted, or the web, which is silent — the paragraph shows whole and the pen
//     starts at a reading pace instead.
// ─────────────────────────────────────────────────────────────────────────────

const AnimatedPath = Animated.createAnimatedComponent(Path);

/** How long the pen takes over a mark. */
const DRAW_MS = 460;
/** The pen starts this long before the word it marks is spoken. */
const LEAD_MS = 90;
/** Silent: when a reader has had the first word, and how long each later one takes. */
const SILENT_FIRST_MS = 650;
const SILENT_WORD_MS = 210;
const SILENT_MAX_MS = 2600;
/** A voiced line that never starts (a failed load) falls back after this. */
const VOICE_WAIT_MS = 1600;
/** The mark leaves faster than it arrived — M3's exit rule. */
const OUT_MS = 240;
/** Stage units. */
const STROKE = 2.3;
/**
 * A paper edge either side of the pen. EMBER_INK is 3:1 on paper and on the hued
 * STONE, and next to nothing on an INK plate — the first render put a ring round
 * REASONS on a black tile and it was barely there. A halo carries paper under the
 * stroke wherever it lands, which is how a map label survives any ground.
 */
const HALO = 2.2;
/** Room round the box for the stroke's own width and its halo. */
const PAD = 3;

interface Props {
  lessonId: string;
  beat: number;
  spot: StageMarkSpot;
  /** False once the reader has moved on; the mark then fades where it is. */
  show: boolean;
  /** Whether this beat's line will be spoken. */
  voiced: boolean;
  /** When the marked word starts, in seconds from the start of the line. */
  wordAt: number;
}

function StageMark({ lessonId, beat, spot, show, voiced, wordAt }: Props) {
  const [x, y, w, h] = spot.box;
  const stroke = useMemo(
    () => markPath(spot.style, w, h, seedOf(`${lessonId}:${beat}`)),
    [spot.style, w, h, lessonId, beat],
  );
  const draw = useSharedValue(0);
  const fade = useSharedValue(1);
  const started = useRef(false);

  // The voice's own start, for THIS beat only; anything else is not our business.
  const playingAt = useNarrationStore((s) => (
    s.lessonId === lessonId && s.beat === beat && s.phase === 'playing' ? s.at : 0
  ));

  const start = (delayMs: number) => {
    if (started.current) return;
    started.current = true;
    draw.value = withDelay(Math.max(0, Math.round(delayMs)), withTiming(1, {
      duration: DRAW_MS,
      // A hand accelerates off the page and slows into the end of the stroke.
      easing: Easing.bezier(0.35, 0, 0.2, 1),
    }));
  };

  useEffect(() => {
    if (!show) {
      fade.value = withTiming(0, { duration: OUT_MS, easing: Easing.in(Easing.quad) });
      return undefined;
    }
    const silent = Math.min(SILENT_MAX_MS, SILENT_FIRST_MS + spot.w * SILENT_WORD_MS);
    const t = setTimeout(() => start(0), voiced ? VOICE_WAIT_MS : silent);
    return () => clearTimeout(t);
    // `start` is stable in effect: it only ever reads refs and shared values.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, voiced, spot.w]);

  useEffect(() => {
    if (!show || !playingAt) return;
    start(playingAt + wordAt * 1000 - LEAD_MS - Date.now());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, playingAt, wordAt]);

  const reveal = useAnimatedProps(() => ({ strokeDashoffset: stroke.len * (1 - draw.value) }));
  const fading = useAnimatedStyle(() => ({ opacity: fade.value }));

  return (
    <Animated.View
      pointerEvents="none"
      nativeID="stage-mark"
      style={[{ position: 'absolute', left: x - PAD, top: y - PAD, width: w + 2 * PAD, height: h + 2 * PAD }, fading]}
    >
      <Svg width={w + 2 * PAD} height={h + 2 * PAD} viewBox={`${-PAD} ${-PAD} ${w + 2 * PAD} ${h + 2 * PAD}`}>
        <AnimatedPath
          d={stroke.d}
          stroke={PAPER}
          strokeOpacity={0.85}
          strokeWidth={STROKE + HALO}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          strokeDasharray={`${stroke.len} ${stroke.len + 2}`}
          animatedProps={reveal}
        />
        <AnimatedPath
          d={stroke.d}
          stroke={EMBER_INK}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          strokeDasharray={`${stroke.len} ${stroke.len + 2}`}
          animatedProps={reveal}
        />
      </Svg>
    </Animated.View>
  );
}

export default memo(StageMark);
