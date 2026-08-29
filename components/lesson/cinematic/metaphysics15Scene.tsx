import {
  View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import {
  WALK, dirsFrom, ease01, lerp, moveTr, pose, travelStance, type Bundle, } from './rig';
// The whole movement library, not just rig's 49 emotes. Codes under 100 ARE
// rig's and mean exactly what they always did; 100+ reach moves.ts (emoteAny).
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './metaphysics15Script';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, STONE, SOFT, RULE, PAPER, useHeld, carryFrom, keepHeld, facing, useCarry, carry,
} from './cinematicKit';
import { followMoves, kindOf, seedOf } from './camera';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';

// Two balls, the gap between them, and a search running over it. Stage right.
//
// · figure WALKS x = 70 → 168 → 124; widest span x 132…204 at 168, fist to 204.5.
//   All board ink is at x ≥ 216.
// · header y 226…240 · balls y 262…296 · the gap bracket y 262…296 · the verdict
//   card y 314…350 · answer row y 366…398.
// · A5 — the board is out of reach (hand tops out at y 411, B11b); read, not handled.
//
// THE VERDICT CARD MOVES rather than being redrawn: one card whose x runs from over
// the gap to over the figure. The lesson's claim is that the connection was in the
// observer all along, so what the reader watches is the SAME search arriving there.

const BD_L = 216;
const BD_W = 176;

const HEAD_T = 226;

const BALL = 34;
const BALL_T = 262;
const BALL_LX = BD_L + 10;
const BALL_RX = BD_L + BD_W - BALL - 10;

const VER_T = 314;
const VER_H = 36;
const VER_W = 150;
/** Over the gap between the balls. */
const VER_OUT = BD_L + (BD_W - VER_W) / 2;
/** Over the figure's resting mark — 124 is where it stands for the last four beats. */
const VER_IN = 124 - VER_W / 2;

const ANS_T = 366;
const ANS_H = 32;
const ANS_GAP = 5;
const ANS_W = (BD_W - 2 * ANS_GAP) / 3;

const ANSWERS = [
  { id: 'mind', label: 'THE MIND', correct: true },
  { id: 'gap', label: 'THE GAP', correct: false },
  { id: 'ball', label: 'BALL TWO', correct: false },
];

const P = BEATS.map((b) => b.p ?? 0);
const X = BEATS.map((b) => b.x ?? 124);
// The camera, from the staging: it follows the figure this track describes,
// pulls back to scale 1 on every graded beat so a tap lands where it is aimed,
// and leans in on the quote. See followMoves in ./camera.ts.
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('metaphysics15'));
const DIR = dirsFrom(X, 1);
const BALLS = BEATS.map((b) => b.balls ?? 0);
const GAPV = BEATS.map((b) => b.gap ?? 0);
const FOUND = BEATS.map((b) => b.found ?? 0);

// R7b — the stage follows the control on its own graded beat, and only there.
// Derived from the beat rather than declared as a channel so it cannot fall out
// of step with the control it is about.
const REACT = BEATS.map((b) => (b.interact?.drag ? 1 : 0));

export default function Metaphysics15Scene({ clock, bt, bi, i, picked, onPick, dragPos }: SceneApi) {
  const reacting = REACT[i] === 1;
  const heldS = useHeld();
  const cv = useCarry(4);
  const cur = BEATS[i];
  const prev = i > 0 ? BEATS[i - 1] : undefined;

  const bFade = (cur.balls ?? 0) !== (prev?.balls ?? 0);
  const gFade = (cur.gap ?? 0) !== (prev?.gap ?? 0);
  const fFade = (cur.found ?? 0) !== (prev?.found ?? 0);
  const found = cur.found ?? 0;

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / moveTr(X[p], X[n], 0.85));
    const t = clock.value;
    const grow = ease01(bt.value / 0.55);

    const s = keepHeld(heldS, travelStance(
      X[p], X[n],
      carryFrom(heldS, n, emoteHold(P[p], t)), emoteHold(P[n], t), emoteLive(P[n], t, bt.value),
      tr, WALK,
    ));
    const f = carry(cv, 0, n, FOUND[p], FOUND[n], fFade ? grow : tr);
    return {
      fig: pose(s, carry(cv, 1, n, X[p], X[n], tr), GROUND, K_FIG, facing(DIR[p], DIR[n], bt.value), 1),
      balls: carry(cv, 2, n, BALLS[p], BALLS[n], tr, bFade ? grow : 1),
      // R7b — the knob searches the gap. Drag toward THE PUSH ITSELF, PLAINLY and the
      // space between the two balls is marked and hunted through — and nothing is ever
      // found there, which is Hume's entire finding.
      gap: carry(cv, 3, n, GAPV[p], reacting ? dragPos.value : GAPV[n], gFade ? grow : tr),
      // 0 → hidden, 1 → over the gap, 2 → over the observer. The x is a function of
      // that same number, so the card cannot be somewhere its verdict does not match.
      show: Math.min(1, f),
      x: lerp(VER_OUT, VER_IN, Math.max(0, Math.min(1, f - 1))),
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const ballStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.balls }));
  const gapStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.gap }));
  const verStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.show, left: SCENE.value.x }));

  const answered = picked !== null;
  const showPick = (cur.pick ?? 0) > 0 && !!cur.interact;

  return (
    <Animated.View style={styles.scene}>
      <Animated.View style={[styles.layer, ballStyle]} pointerEvents="none">
        <Text style={styles.head} numberOfLines={1}>WHAT YOU ACTUALLY SEE</Text>
        <View style={[styles.ball, { left: BALL_LX }]} />
        <View style={[styles.ball, { left: BALL_RX }]} />
      </Animated.View>

      <Animated.View style={[styles.gapMark, gapStyle]} pointerEvents="none">
        <Text style={styles.gapText} numberOfLines={1}>?</Text>
      </Animated.View>

      <Animated.View style={[styles.verdict, verStyle]} pointerEvents="none">
        <Text style={styles.verdictText} numberOfLines={1}>
          {found >= 2 ? 'THE CONNECTION  ·  HERE' : 'THE CONNECTION  ·  NOT YET'}
        </Text>
      </Animated.View>

      {showPick &&
        ANSWERS.map((a, k) => {
          const chosen = picked === a.id;
          return (
            <Target id={a.id} correct={a.correct} picked={picked} onPick={onPick}
              key={a.id} style={[styles.ans, { left: BD_L + k * (ANS_W + ANS_GAP) }]} hitSlop={{ top: 6, bottom: 6, left: ANS_GAP / 2, right: ANS_GAP / 2 }} disabled={answered}>
              <View
                style={[
                  styles.ansInner,
                  answered && a.correct && styles.pickRight,
                  answered && chosen && !a.correct && styles.pickWrong,
                ]}
              >
                <Text
                  style={[styles.ansText, answered && a.correct && styles.onInk]}
                  numberOfLines={1}
                >
                  {a.label}
                </Text>
              </View>
            </Target>
          );
        })}

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 24, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },
  // THE FLOOR THE GROUND LINE SITS ON. A rule on its own leaves the
  // figure and everything it is looking at standing on bare page;
  // political7 and political8 both stand their subject on a filled mass.
  floor: { position: 'absolute', left: 0, right: 0, top: GROUND, bottom: 0, backgroundColor: RULE },
  layer: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H },

  head: {
    position: 'absolute', left: BD_L, top: HEAD_T, width: BD_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.4, color: SOFT,
    includeFontPadding: false,
  },
  ball: {
    position: 'absolute', top: BALL_T, width: BALL, height: BALL, borderRadius: BALL / 2,
    borderWidth: 2.5, borderColor: INK, backgroundColor: STONE,
  },
  gapMark: {
    position: 'absolute', left: BALL_LX + BALL + 6, top: BALL_T,
    width: BALL_RX - BALL_LX - BALL - 12, height: BALL,
    borderTopWidth: 2, borderBottomWidth: 2, borderColor: SOFT,
    alignItems: 'center', justifyContent: 'center',
  },
  gapText: {
    fontFamily: 'Inter_700Bold', fontSize: 15, color: SOFT,
    includeFontPadding: false,
  },

  verdict: {
    position: 'absolute', top: VER_T, width: VER_W, height: VER_H,
    borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: STONE,
    alignItems: 'center', justifyContent: 'center',
  },
  verdictText: {
    fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 0.4, color: INK,
    includeFontPadding: false,
  },

  ans: { position: 'absolute', top: ANS_T, width: ANS_W },
  ansInner: {
    height: ANS_H, borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: STONE,
    alignItems: 'center', justifyContent: 'center',
  },
  ansText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0, color: INK,
    includeFontPadding: false,
  },
  onInk: { color: PAPER },
  pickRight: { backgroundColor: INK, borderColor: INK },
  pickWrong: { borderColor: SOFT },
});

// Ink runs from the header (226) to the ground line (500). Band 220…512 = 292 (H59).
export function Metaphysics15Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Metaphysics15Scene} band={[220, 512]} camera={CAM} />;
}
