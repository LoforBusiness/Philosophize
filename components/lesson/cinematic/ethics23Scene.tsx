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
import { BEATS } from './ethics23Script';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, STONE, SOFT, RULE, PAPER, useHeld, carryFrom, keepHeld, facing, useCarry, carry,
} from './cinematicKit';
import { followMoves, kindOf, seedOf } from './camera';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';

// Two obligation gauges side by side, stage right.
//
// · figure WALKS x = 70 → 168 → 124; widest body span x 132…204 at 168, fist to
//   204.5 at gesture 41. All gauge ink is at x ≥ 216.
// · header y 226…240 · gauges y 252…352 · their captions y 358…376 · answer row
//   y 388…420. A standing crown is y 397; the answer row is level with it at an x
//   the figure never reaches.
// · A5 — the gauges are out of reach (hand tops out at y 411, B11b): read, not
//   handled, and no beat's text claims contact.
//
// BOTH GAUGES ARE THE SAME COMPONENT AT THE SAME SIZE. There is no style that can
// make one taller than the other — only how full each reads differs — because the
// lesson's claim is that the two obligations are the same shape.

const GA_L = 216;
const GA_W = 176;

const HEAD_T = 226;

const COL_W = 60;
const COL_H = 100;
const COL_T = 252;
const COL_LX = GA_L + 20;
const COL_RX = GA_L + 96;

const CAP_T = 358;
const CAP_H = 18;

const ANS_T = 388;
const ANS_H = 32;
const ANS_GAP = 5;
const ANS_W = (GA_W - 2 * ANS_GAP) / 3;

const ANSWERS = [
  { id: 'dist', label: 'DISTANCE', correct: true },
  { id: 'cost', label: 'THE COST', correct: false },
  { id: 'power', label: 'POWER', correct: false },
];

const P = BEATS.map((b) => b.p ?? 0);
const X = BEATS.map((b) => b.x ?? 124);
// The camera, from the staging: it follows the figure this track describes,
// pulls back to scale 1 on every graded beat so a tap lands where it is aimed,
// and leans in on the quote. See followMoves in ./camera.ts.
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('ethics23'));
const DIR = dirsFrom(X, 1);
const GAUGES = BEATS.map((b) => b.gauges ?? 0);
const NEAR = BEATS.map((b) => b.near ?? 0);
const FAR = BEATS.map((b) => b.far ?? 0);

// R7b — the stage follows the control on its own graded beat, and only there.
// Derived from the beat rather than declared as a channel so it cannot fall out
// of step with the control it is about.
const REACT = BEATS.map((b) => (b.interact?.plot ? 1 : 0));

export default function Ethics23Scene({ clock, bt, bi, i, picked, onPick, dragPos }: SceneApi) {
  const reacting = REACT[i] === 1;
  const heldS = useHeld();
  const cv = useCarry(4);
  const cur = BEATS[i];
  const prev = i > 0 ? BEATS[i - 1] : undefined;

  const gFade = (cur.gauges ?? 0) !== (prev?.gauges ?? 0);
  const nFade = (cur.near ?? 0) !== (prev?.near ?? 0);
  const fFade = (cur.far ?? 0) !== (prev?.far ?? 0);

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
    return {
      fig: pose(s, carry(cv, 0, n, X[p], X[n], tr), GROUND, K_FIG, facing(DIR[p], DIR[n], bt.value), 1),
      board: carry(cv, 1, n, GAUGES[p], GAUGES[n], tr, gFade ? grow : 1),
      near: carry(cv, 2, n, NEAR[p], NEAR[n], nFade ? grow : tr),
      // R7b — the drawn curve fills the FAR gauge. The plot asks what happens to the
      // duty as the distance grows, and the mean of the line the reader draws is
      // exactly how full that far-away obligation reads.
      far: carry(cv, 3, n, FAR[p], reacting ? dragPos.value : FAR[n], fFade ? grow : tr),
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const boardStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.board }));
  const nearFill = useAnimatedStyle(() => ({ height: (COL_H - 6) * SCENE.value.near }));
  const farFill = useAnimatedStyle(() => ({ height: (COL_H - 6) * SCENE.value.far }));

  const answered = picked !== null;
  const showPick = (cur.pick ?? 0) > 0 && !!cur.interact;

  return (
    <Animated.View style={styles.scene}>
      <Animated.View style={[styles.board, boardStyle]} pointerEvents="none">
        <Text style={styles.head} numberOfLines={1}>WHAT YOU OWE</Text>

        <View style={[styles.col, { left: COL_LX }]}>
          <Animated.View style={[styles.fill, nearFill]} />
        </View>
        <View style={[styles.cap, { left: COL_LX - 12 }]}>
          <Text style={styles.capText} numberOfLines={1}>AT YOUR FEET</Text>
        </View>

        <View style={[styles.col, { left: COL_RX }]}>
          <Animated.View style={[styles.fill, farFill]} />
        </View>
        <View style={[styles.cap, { left: COL_RX - 12 }]}>
          <Text style={styles.capText} numberOfLines={1}>8,000 MILES</Text>
        </View>
      </Animated.View>

      {showPick &&
        ANSWERS.map((a, k) => {
          const chosen = picked === a.id;
          return (
            <Target id={a.id} correct={a.correct} picked={picked} onPick={onPick}
              key={a.id} style={[styles.ans, { left: GA_L + k * (ANS_W + ANS_GAP) }]} hitSlop={{ top: 6, bottom: 6, left: ANS_GAP / 2, right: ANS_GAP / 2 }} disabled={answered}>
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

  board: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H },
  head: {
    position: 'absolute', left: GA_L, top: HEAD_T, width: GA_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.6, color: SOFT,
    includeFontPadding: false,
  },
  col: {
    position: 'absolute', top: COL_T, width: COL_W, height: COL_H,
    borderWidth: 2, borderColor: INK, borderRadius: 3, backgroundColor: STONE,
    justifyContent: 'flex-end', padding: 3,
  },
  fill: { width: '100%', backgroundColor: INK, borderRadius: 1 },
  cap: {
    position: 'absolute', top: CAP_T, width: COL_W + 24, height: CAP_H,
    alignItems: 'center', justifyContent: 'center',
  },
  capText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.8, color: INK,
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
  pickWrong: { borderColor: SOFT, opacity: 0.45 },
});

// Ink runs from the header (226) to the ground line (500). Band 220…512 = 292 (H59).
export function Ethics23Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Ethics23Scene} band={[220, 512]} camera={CAM} />;
}
