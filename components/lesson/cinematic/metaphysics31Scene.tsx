import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import {
  clamp01, ease01, lerp, mixStance, pose, type Bundle,
} from './rig';
// The whole movement library, not just rig's 49 emotes. Codes under 100 ARE
// rig's and mean exactly what they always did; 100+ reach moves.ts (emoteAny).
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './metaphysics31Script';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER, useHeld, carryFrom, keepHeld, useCarry, carry,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// THREE NESTED ANSWERS. The slab, the ring drawn round the big hole, and the empty
// middle of that ring are three targets drawn INSIDE ONE ANOTHER, so the reader picks
// between them by tapping the rim or the centre of the same hole (E33). No row of
// cards can put that distinction; the picture can put it directly.
//
// · the slab is x 96…356, y 364…500 — it stands ON the ground line. Five RULE hatch
//   lines inside it at 22-unit pitch.
// · the big hole is centred (270, 432): an outer disc r 48 (the RIM target) and an
//   inner disc r 28 (the GAP target) drawn on top of it. The band between them is
//   the lining, and filling it INK is the correct-answer state (H61). It is 20 units
//   wide because that is 46dp at this lesson's 2.31 fit — at r 44 the ring came out
//   at 37dp, under the floor, and the ring is the CORRECT answer (E37b-2).
// · two plain holes at (140, 396) r 17 and (186, 394) r 12, so the count is three.
//   Only the big one is drawn with a visible lining band — it is the one under the
//   microscope, and three of them would be fussy at this size (A5).
// · the tally is at x 164…194, y 338…352, beside the kicker at x 96…156.
// · the RIM chip sits above the slab at x 236…306, y 336…356, with a 2-unit leader
//   running down to the top of the hole at y 384. The CHEESE chip is inside the
//   slab's empty bottom-left at x 106…198, y 464…488, clear of both small holes.
// · the figure is at x 46 facing right; its widest ink is a fist at x 79, seventeen
//   clear of the slab.
//
// ANSWERING RUNS THE ARGUMENT: `qv` fades the slab to 0.14 once the reader picks, and
// the three rings stay behind at full ink. What you counted is still there when the
// cheese is gone (H64).

const SLAB_L = 96;
const SLAB_T = 364;
const SLAB_W = 260;
const SLAB_H = 136;

const BIG_L = 222;                  // 270 − 48
const BIG_T = 384;                  // 432 − 48
const OUT_D = 96;
const IN_OFF = 20;                  // 48 − 28
const IN_D = 56;

const SMALL = [
  { left: 123, top: 379, d: 34 },
  { left: 174, top: 382, d: 24 },
];

const KICK_T = 336;
const KICK_W = 60;                  // 54 left "COUNTING" only 6% of margin (D30)
const TICK_X = 164;
const TICK_T = 338;

const CHIP_RIM = { left: 236, top: 336, width: 70 };
const CHIP_CHEESE = { left: 106, top: 464, width: 92 };

const FIG_X = 46;

const G = BEATS.map((b) => b.g ?? 0);
const HOLES = BEATS.map((b) => b.holes ?? 0);
const TICKS = BEATS.map((b) => b.ticks ?? 0);
const CHIPS = BEATS.map((b) => b.chips ?? 0);

// THE CAMERA (H60b). `followMoves` reads the x track and gives each beat its own
// shot: it FOLLOWS him when a beat moves him far enough to be worth following,
// pushes close on a quote, and PULLS BACK to the whole band on a question or a
// summary — the beats the reader has to read and act on. Beats that do not set
// `x` stand at FIG_X, so a still lesson gets the one-in-three push rather than a
// camera that never rests.
const X = BEATS.map((b) => b.x ?? FIG_X);

// R7b — the stage follows the control on its own graded beat, and only there.
// Derived from the beat rather than declared as a channel so it cannot fall out
// of step with the control it is about.
const REACT = BEATS.map((b) => (b.interact?.drag ? 1 : 0));
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('metaphysics31'));

export default function Metaphysics31Scene({ clock, bt, bi, qv, i, picked, onPick, dragPos }: SceneApi) {
  const reacting = REACT[i] === 1;
  const heldS = useHeld();
  const cv = useCarry(3);
  const cur = BEATS[i];
  const revealing = (cur.pick ?? 0) > 0;

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / 0.7);      // nobody walks; this is a pose blend
    const t = clock.value;
    const grow = ease01(bt.value / 0.9);
    const s = keepHeld(heldS, mixStance(carryFrom(heldS, n, emoteHold(G[p], t)), emoteLive(G[n], t, bt.value), tr));
    return {
      fig: pose(s, FIG_X, GROUND, K_FIG, 1, 1),
      // R7b — the knob opens the holes. The further the reader drags toward NEVER,
      // NOT ONCE, the more plainly the absences are there to be counted, which is the
      // thing paraphrase keeps failing to talk away.
      holes: carry(cv, 0, n, HOLES[p], reacting ? dragPos.value : HOLES[n], grow),
      ticks: carry(cv, 1, n, TICKS[p], TICKS[n], grow),
      chips: carry(cv, 2, n, CHIPS[p], CHIPS[n], grow),
      // The reveal rides the ANSWER, not the beat: the cheese dissolves as the
      // explanation appears, so the picture makes the point at the same moment
      // the words do.
      fade: revealing ? 1 - 0.86 * qv.value : 1,
    };
  });

  const D = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const slabStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.fade }));
  const chipStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.chips,
    transform: [{ translateY: (1 - SCENE.value.chips) * -6 }],
  }));
  const bigStyle = useAnimatedStyle(() => {
    const a = clamp01(SCENE.value.holes * 3 - 2);
    return { opacity: a, transform: [{ scale: 0.4 + 0.6 * a }] };
  });

  const answered = picked !== null;
  const live = (cur.pick ?? 0) > 0 && !!cur.interact;
  const rimOn = answered;                                    // the rim is the answer
  const wrong = (id: string) => answered && picked === id;

  return (
    <Animated.View style={styles.scene}>
      {/* the slab, which dissolves once the question is answered */}
      <Animated.View style={[styles.slab, slabStyle]} pointerEvents="none">
        {[0, 1, 2, 3, 4].map((k) => (
          <View key={k} style={[styles.hatch, { top: 22 + k * 22 }]} />
        ))}
      </Animated.View>
      <Target id={'cheese'} correct={false} picked={picked} onPick={onPick}
        style={styles.slabHit}
        disabled={!live || answered}
      />

      {SMALL.map((s, k) => (
        <Hole key={k} index={k} left={s.left} top={s.top} d={s.d} SCENE={SCENE} />
      ))}

      {/* the big hole: an outer ring (THE RIM) with its empty middle (THE GAP) on top */}
      <Animated.View style={[styles.bigWrap, bigStyle]}>
        <Target id={'rim'} correct={true} picked={picked} onPick={onPick}
          style={styles.rim}
          disabled={!live || answered}
        >
          <View style={[styles.rimInner, rimOn && styles.pickRight]} />
        </Target>
        <Target id={'gap'} correct={false} picked={picked} onPick={onPick}
          style={styles.gap}
          disabled={!live || answered}
        >
          <View style={[styles.gapInner, wrong('gap') && styles.pickWrong]}>
            <Text style={styles.gapText} numberOfLines={1}>THE GAP</Text>
          </View>
        </Target>
      </Animated.View>

      {/* the count */}
      <Text style={styles.kicker} numberOfLines={1}>COUNTING</Text>
      {[0, 1, 2].map((j) => (
        <Tick key={j} j={j} SCENE={SCENE} />
      ))}

      {/* the two labels that sit outside their shapes, and tap through to them */}
      <Animated.View style={[styles.leader, chipStyle]} pointerEvents="none" />
      <Animated.View style={[styles.chip, CHIP_RIM, chipStyle]}>
        <Target id={'rim'} correct={true} picked={picked} onPick={onPick}
          style={styles.fill}
          disabled={!live || answered}
        >
          <View style={[styles.chipInner, rimOn && styles.pickRight]}>
            <Text style={[styles.chipText, rimOn && styles.onInk]} numberOfLines={1}>THE RIM</Text>
          </View>
        </Target>
      </Animated.View>
      <Animated.View style={[styles.chip, CHIP_CHEESE, chipStyle]}>
        <Target id={'cheese'} correct={false} picked={picked} onPick={onPick}
          style={styles.fill}
          disabled={!live || answered}
        >
          <View style={[styles.chipInner, wrong('cheese') && styles.pickWrong]}>
            <Text style={styles.chipText} numberOfLines={1}>THE CHEESE</Text>
          </View>
        </Target>
      </Animated.View>

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={D} k={K_FIG} />
    </Animated.View>
  );
}

/** One of the two plain holes. Opens with the others, then holds (C20c). */
function Hole({
  index, left, top, d, SCENE,
}: {
  index: number; left: number; top: number; d: number;
  SCENE: { value: { holes: number } };
}) {
  const st = useAnimatedStyle(() => {
    const a = clamp01(SCENE.value.holes * 3 - index);
    return { opacity: a, transform: [{ scale: 0.4 + 0.6 * a }] };
  });
  return (
    <Animated.View
      style={[styles.small, { left, top, width: d, height: d, borderRadius: d / 2 }, st]}
      pointerEvents="none"
    />
  );
}

/** One tally mark. */
function Tick({ j, SCENE }: { j: number; SCENE: { value: { ticks: number } } }) {
  const st = useAnimatedStyle(() => ({ opacity: clamp01(SCENE.value.ticks - j) }));
  return <Animated.View style={[styles.tick, { left: TICK_X + j * 10 }, st]} pointerEvents="none" />;
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 16, right: 16, top: GROUND, height: 1.5, backgroundColor: RULE },
  fill: { flex: 1 },

  slab: {
    position: 'absolute', left: SLAB_L, top: SLAB_T, width: SLAB_W, height: SLAB_H,
    borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
  },
  slabHit: { position: 'absolute', left: SLAB_L, top: SLAB_T, width: SLAB_W, height: SLAB_H },
  hatch: { position: 'absolute', left: 10, right: 10, height: 1, backgroundColor: RULE },

  small: { position: 'absolute', borderWidth: 2.5, borderColor: INK, backgroundColor: PAPER },

  bigWrap: { position: 'absolute', left: BIG_L, top: BIG_T, width: OUT_D, height: OUT_D },
  rim: { position: 'absolute', left: 0, top: 0, width: OUT_D, height: OUT_D },
  rimInner: {
    flex: 1, borderRadius: OUT_D / 2, borderWidth: 2, borderColor: INK, backgroundColor: PAPER,
  },
  gap: { position: 'absolute', left: IN_OFF, top: IN_OFF, width: IN_D, height: IN_D },
  gapInner: {
    flex: 1, borderRadius: IN_D / 2, borderWidth: 2, borderColor: INK, backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center',
  },
  gapText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.3, color: INK,
    includeFontPadding: false,
  },

  kicker: {
    position: 'absolute', left: SLAB_L, top: KICK_T, width: KICK_W,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.2, color: SOFT,
    includeFontPadding: false,
  },
  tick: { position: 'absolute', top: TICK_T, width: 3, height: 14, backgroundColor: INK },

  leader: { position: 'absolute', left: 269, top: 356, width: 2, height: 28, backgroundColor: INK },
  chip: { position: 'absolute', height: 24 },
  chipInner: {
    flex: 1, borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center',
  },
  chipText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.4, color: INK,
    includeFontPadding: false,
  },

  onInk: { color: PAPER },
  pickRight: { backgroundColor: INK, borderColor: INK },
  pickWrong: { borderColor: SOFT, opacity: 0.45 },
});

// Ink runs from the kicker row (336) to the ground line (500). Band 330…512 = 182 (H59).
export function Metaphysics31Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Metaphysics31Scene} band={[330, 512]} camera={CAM} />;
}
