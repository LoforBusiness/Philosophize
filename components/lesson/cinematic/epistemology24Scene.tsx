import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { clamp01, ease01, moveTr, pose, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './epistemology24Script';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, STONE, SOFT, RULE, PAPER,
  useHeld, carryFrom, keepHeld, useCarry, carry,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target, { useAnswerRise } from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// ─────────────────────────────────────────────────────────────────────────────
// HOW SURE YOU ARE, DRAWN AS LENGTH.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · the CONCLUSION is a 176×30 plate at x 30…206, y 222…252, 2.5 thick.
// · THREE RUNGS, 176×26, at x 30…206, tops 268 · 302 · 336 — the ladder reads
//   downward from its conclusion, which is the direction an argument is usually
//   drawn and the direction Moore reverses.
// · the SURE BARS sit inside each row at its foot: 4 thick, from x 36, lengths
//   62 · 78 · 54 for the rungs and 40 for the conclusion. They are the only
//   quantity on the stage.
// · MOORE'S CLAIM is a 150×70 plate at x 226…376, y 268…338, with a bar of 132 —
//   longer than the widest rung bar by 54 units, which is the entire argument
//   made as a length rather than asserted.
// · the GIVE is a 2.5-thick strike through the SECOND rung, drawn only once the
//   shift is named. It marks a premise as the thing that must move; it does not
//   say which, because Moore does not.
// · the FIGURE walks x 200 → 132 → 268 on GROUND 500; crown ≈ 397, and the
//   lowest ink is the third rung at y 362, so 35 units stay clear.
//
// Ink runs y 222 (the conclusion) … y 500. BAND 216…512 = 296, with the 103-unit
// figure at 35%.
// ─────────────────────────────────────────────────────────────────────────────

/** Crossfade for a beat that does NOT walk. 0.85 is the base `footfalls` assumes. */
const BASE_TR = 0.85;

const L_X = 30;
const L_W = 176;
const CONC_Y = 222;
const CONC_H = 30;
const RUNG_TOP = [268, 302, 336];
const RUNG_H = 26;
const RUNG_TEXT = [
  'If you cannot rule out a dream, you do not know',
  'You cannot rule out a dream',
  'So you do not know you are awake',
];
const RUNG_BAR = [62, 78, 54];
const CONC_BAR = 40;

const HAND_X = 226;
const HAND_Y = 268;
const HAND_W = 150;
const HAND_H = 70;
const HAND_BAR = 132;

const FIG_X = 200;

const X = BEATS.map((b) => b.x ?? FIG_X);
const P = BEATS.map((b) => b.p ?? 0);
const LADDER = BEATS.map((b) => b.ladder ?? 0);
const SURE = BEATS.map((b) => b.sure ?? 0);
const HAND = BEATS.map((b) => b.hand ?? 0);
const GIVE = BEATS.map((b) => b.give ?? 0);
const LIVE = BEATS.map((b) => b.live ?? 0);

// R7b — the stage follows the control on its own graded beat, and only there.
// Derived from the beat rather than declared as a channel so it cannot fall out
// of step with the control it is about.
const REACT = BEATS.map((b) => (b.interact?.lever ? 1 : 0));

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('epistemology24'));

export default function Epistemology24Scene({ clock, bt, bi, i, picked, onPick, dragPos }: SceneApi) {
  const reacting = REACT[i] === 1;
  const heldFig = useHeld();
  const cv = useCarry(5);
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    // A WALKING BEAT TAKES AS LONG AS THE WALK NEEDS (rig.moveTr). A fixed length
    // here sprinted every long journey and left the footfalls — which the player
    // computes from moveTr — arriving after the figure had stopped.
    const tr = ease01(bt.value / moveTr(X[p], X[n], BASE_TR));
    const t = clock.value;

    const figS = keepHeld(heldFig, travelStance(
      X[p], X[n],
      carryFrom(heldFig, n, emoteHold(P[p], t)), emoteHold(P[n], t), emoteLive(P[n], t, bt.value),
      tr, WALK,
    ));

    return {
      fig: pose(figS, carry(cv, 0, n, X[p], X[n], tr), GROUND, K_FIG, 1, 1),
      ladder: carry(cv, 1, n, LADDER[p], LADDER[n], tr),
      sure: carry(cv, 2, n, SURE[p], SURE[n], tr),
      hand: carry(cv, 3, n, HAND[p], HAND[n], tr),
      // R7b — the arm marks the rung that gives way. Each setting is a different
      // thing to give up when a valid argument reaches a conclusion you cannot accept,
      // and the mark travels to whichever rung the reader is naming.
      give: carry(cv, 4, n, GIVE[p], reacting ? dragPos.value : GIVE[n], tr),
      t,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.cards && LIVE[i] === 1;

  const ladStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.ladder }));
  const handStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.hand }));
  const giveStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.give, width: (L_W - 12) * SCENE.value.give,
  }));

  const rungs = [0, 1, 2];

  const handRise = useAnswerRise(picked, 'hand', true);

  return (
    <View style={styles.scene}>
      <Animated.View style={[StyleSheet.absoluteFill, ladStyle]} pointerEvents="none">
        <View style={styles.conc} />
        <Text style={styles.concText} numberOfLines={2}>THE SCEPTIC&apos;S CONCLUSION</Text>
        <Bar S={SCENE} top={CONC_Y + CONC_H - 8} len={CONC_BAR} />

        {rungs.map((k) => (
          <View key={k}>
            <View style={[styles.rung, { top: RUNG_TOP[k] }]} />
            <Text style={[styles.rungText, { top: RUNG_TOP[k] + 4 }]} numberOfLines={2}>{RUNG_TEXT[k]}</Text>
            <Bar S={SCENE} top={RUNG_TOP[k] + RUNG_H - 6} len={RUNG_BAR[k]} />
          </View>
        ))}
      </Animated.View>

      {/* THE PREMISE THAT HAS TO MOVE — marked, not named. */}
      <Animated.View style={[styles.give, giveStyle]} pointerEvents="none" />

      {/* THE HAND IS THE ANSWER, so the hand rises (E1). Its Target held an empty
          box, so answering lifted an outline off HERE IS ONE HAND. */}
      <Animated.View style={[StyleSheet.absoluteFill, handStyle, handRise]} pointerEvents="none">
        <View style={styles.hand} />
        <Text style={styles.handText}>HERE IS ONE HAND</Text>
        <Bar S={SCENE} top={HAND_Y + HAND_H - 16} len={HAND_BAR} left={HAND_X + 8} />
      </Animated.View>

      {rungs.map((k) => (
        <Target
          key={`r${k}`}
          id={`rung${k}`}
          correct={false}
          picked={picked}
          onPick={onPick}
          disabled={!live || answered}
          style={[styles.hit, { top: RUNG_TOP[k], width: L_W, left: L_X }]}
        >
          <View
            style={[styles.hitBox, { width: L_W }, answered && picked === `rung${k}` && styles.wrong]}
            pointerEvents="none"
          />
        </Target>
      ))}
      <Target
        id="hand" correct picked={picked} onPick={onPick}
        disabled={!live || answered}
        style={[styles.hit, { top: HAND_Y, left: HAND_X, width: HAND_W, height: HAND_H }]}
      >
        <View style={[styles.hitBox, { width: HAND_W, height: HAND_H }, answered && styles.right]} pointerEvents="none" />
      </Target>

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />
    </View>
  );
}

/** How sure, as a length. The only quantity in the picture. */
function Bar({
  S, top, len, left = L_X + 6,
}: { S: { value: { sure: number } }; top: number; len: number; left?: number }) {
  const st = useAnimatedStyle(() => ({ opacity: S.value.sure, width: len * S.value.sure }));
  return <Animated.View pointerEvents="none" style={[styles.bar, { top, left }, st]} />;
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 20, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },
  // THE FLOOR THE GROUND LINE SITS ON. A rule on its own leaves the
  // figure and everything it is looking at standing on bare page;
  // political7 and political8 both stand their subject on a filled mass.
  floor: { position: 'absolute', left: 0, right: 0, top: GROUND, bottom: 0, backgroundColor: RULE },

  conc: {
    position: 'absolute', left: L_X, top: CONC_Y, width: L_W, height: CONC_H,
    borderWidth: 2.5, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
  },
  concText: {
    position: 'absolute', left: L_X + 6, top: CONC_Y + 5, width: L_W - 12,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.8, color: INK, includeFontPadding: false,
  },

  rung: {
    position: 'absolute', left: L_X, width: L_W, height: RUNG_H,
    borderWidth: 1.5, borderColor: SOFT, borderRadius: 3, backgroundColor: PAPER,
  },
  rungText: {
    position: 'absolute', left: L_X + 6, width: L_W - 12, lineHeight: 10.8,
    fontFamily: 'Inter_400Regular', fontSize: 8.6, color: INK, includeFontPadding: false,
  },

  bar: { position: 'absolute', height: 4, backgroundColor: INK, borderRadius: 2 },

  give: {
    position: 'absolute', left: L_X + 6, top: RUNG_TOP[1] + RUNG_H / 2, height: 2.5, backgroundColor: INK,
  },

  hand: {
    position: 'absolute', left: HAND_X, top: HAND_Y, width: HAND_W, height: HAND_H,
    borderWidth: 2.5, borderColor: INK, borderRadius: 4, backgroundColor: STONE,
  },
  handText: {
    position: 'absolute', left: HAND_X, top: HAND_Y + 20, width: HAND_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 9.5, letterSpacing: 1, color: INK, includeFontPadding: false,
  },

  hit: { position: 'absolute', height: RUNG_H },
  hitBox: { height: RUNG_H, borderRadius: 3 },
  right: { borderWidth: 3, borderColor: INK },
  wrong: { borderWidth: 1.5, borderColor: SOFT, borderStyle: 'dashed', opacity: 0.5 },
});

export function Epistemology24Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Epistemology24Scene} band={[216, 512]} camera={CAM} />;
}
