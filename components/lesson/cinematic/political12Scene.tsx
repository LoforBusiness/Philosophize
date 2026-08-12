import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import {
  WALK, dirsFrom, ease01, lerp, moveTr, pose, travelStance, type Bundle,
} from './rig';
// The whole movement library, not just rig's 49 emotes: codes under 100 are
// exactly rig's and mean what they always did, 100+ reach moves.ts (see emoteAny).
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './political12Script';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER } from './cinematicKit';
import { followMoves, kindOf, seedOf } from './camera';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';

// A doorway with two lamps beneath it. Stage right.
//
// · figure WALKS x = 70 → 168 → 124; widest span x 132…204 at 168, fist to 204.5.
//   All doorway ink is at x ≥ 216.
// · header y 226…238 · doorway y 246…320 · lamps y 330…366 · answer stack
//   y 380…488 on a 36 pitch. A standing crown is y 397.
// · A5 — the doorway is a diagram out of reach (hand tops out at y 411, B11b); no
//   beat's text says the figure opens or walks through it. It is the argument's
//   picture, not a door in the room.
//
// THE TWO LAMPS ARE ONE STYLE USED TWICE and are driven by separate channels, so
// the scene can light either without the other — which is precisely Berlin's claim
// that the two freedoms come apart.

const DW_L = 216;
const DW_W = 176;

const HEAD_T = 226;

const DOOR_W = 80;
const DOOR_L = DW_L + (DW_W - DOOR_W) / 2;
const DOOR_T = 246;
const DOOR_H = 74;

const LAMP_T = 330;
const LAMP_H = 36;
const LAMP_GAP = 6;
const LAMP_W = (DW_W - LAMP_GAP) / 2;

const ANS_T = 380;
const ANS_H = 32;
const ANS_PITCH = 36;
const ANS_SLOP = (ANS_PITCH - ANS_H) / 2;

const ANSWERS = [
  { id: 'pos', label: 'MASTER OF MYSELF', correct: true },
  { id: 'neg', label: 'NO ONE BLOCKING', correct: false },
  { id: 'both', label: 'NEITHER IS LYING', correct: false },
];

const P = BEATS.map((b) => b.p ?? 0);
const X = BEATS.map((b) => b.x ?? 124);
// The camera, from the staging: it follows the figure this track describes,
// pulls back to scale 1 on every graded beat so a tap lands where it is aimed,
// and leans in on the quote. See followMoves in ./camera.ts.
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('political12'));
const DIR = dirsFrom(X, 1);
const DOORV = BEATS.map((b) => b.door ?? 0);
const OPEN = BEATS.map((b) => b.open ?? 0);
const NEG = BEATS.map((b) => b.neg ?? 0);
const POS = BEATS.map((b) => b.posi ?? 0);

export default function Political12Scene({ clock, bt, bi, i, picked, onPick }: SceneApi) {
  const cur = BEATS[i];
  const prev = i > 0 ? BEATS[i - 1] : undefined;

  const dFade = (cur.door ?? 0) !== (prev?.door ?? 0);
  const oFade = (cur.open ?? 0) !== (prev?.open ?? 0);
  const nFade = (cur.neg ?? 0) !== (prev?.neg ?? 0);
  const pFade = (cur.posi ?? 0) !== (prev?.posi ?? 0);

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / moveTr(X[p], X[n], 0.85));
    const t = clock.value;
    const grow = ease01(bt.value / 0.55);

    const s = travelStance(
      X[p], X[n],
      emoteHold(P[p], t), emoteHold(P[n], t), emoteLive(P[n], t, bt.value),
      tr, WALK,
    );
    return {
      fig: pose(s, lerp(X[p], X[n], tr), GROUND, K_FIG, DIR[n], 1),
      door: lerp(DOORV[p], DOORV[n], tr) * (dFade ? grow : 1),
      open: lerp(OPEN[p], OPEN[n], oFade ? grow : tr),
      neg: lerp(NEG[p], NEG[n], nFade ? grow : tr),
      pos: lerp(POS[p], POS[n], pFade ? grow : tr),
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const doorStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.door }));
  // The bar across the doorway retracts rather than fading — a door swinging clear.
  const barStyle = useAnimatedStyle(() => ({
    opacity: 1 - SCENE.value.open,
    transform: [{ scaleX: 1 - SCENE.value.open }],
  }));
  const negStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.neg }));
  const posStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.pos }));

  const answered = picked !== null;
  const showPick = (cur.pick ?? 0) > 0 && !!cur.interact;

  return (
    <Animated.View style={styles.scene}>
      <Animated.View style={[styles.layer, doorStyle]} pointerEvents="none">
        <Text style={styles.head} numberOfLines={1}>ARE YOU FREE?</Text>
        <View style={styles.door} />
        <Animated.View style={[styles.bar, barStyle]} />

        {/* lamp one: nobody in the doorway */}
        <View style={[styles.lamp, { left: DW_L }]}>
          <Text style={styles.lampText} numberOfLines={1}>NO ONE BLOCKING</Text>
        </View>
        <Animated.View style={[styles.lampLit, { left: DW_L }, negStyle]}>
          <Text style={styles.lampTextLit} numberOfLines={1}>NO ONE BLOCKING</Text>
        </Animated.View>

        {/* lamp two: switched on by somebody else */}
        <View style={[styles.lamp, { left: DW_L + LAMP_W + LAMP_GAP }]}>
          <Text style={styles.lampText} numberOfLines={1}>MASTER OF MYSELF</Text>
        </View>
        <Animated.View style={[styles.lampLit, { left: DW_L + LAMP_W + LAMP_GAP }, posStyle]}>
          <Text style={styles.lampTextLit} numberOfLines={1}>MASTER OF MYSELF</Text>
        </Animated.View>
      </Animated.View>

      {showPick &&
        ANSWERS.map((a, k) => {
          const chosen = picked === a.id;
          return (
            <Target id={a.id} correct={a.correct} picked={picked} onPick={onPick}
              key={a.id} style={[styles.ans, { top: ANS_T + k * ANS_PITCH }]} hitSlop={{ top: ANS_SLOP, bottom: ANS_SLOP, left: ANS_SLOP, right: ANS_SLOP }} disabled={answered}>
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
  layer: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H },

  head: {
    position: 'absolute', left: DW_L, top: HEAD_T, width: DW_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.5, letterSpacing: 1.4, color: SOFT,
    includeFontPadding: false,
  },
  door: {
    position: 'absolute', left: DOOR_L, top: DOOR_T, width: DOOR_W, height: DOOR_H,
    borderWidth: 3, borderColor: INK, borderTopLeftRadius: 26, borderTopRightRadius: 26,
    borderBottomWidth: 0, backgroundColor: PAPER,
  },
  bar: {
    position: 'absolute', left: DOOR_L + 4, top: DOOR_T + DOOR_H / 2 - 3,
    width: DOOR_W - 8, height: 6, backgroundColor: INK, transformOrigin: '100% 50%',
  },

  lamp: {
    position: 'absolute', top: LAMP_T, width: LAMP_W, height: LAMP_H,
    borderWidth: 2, borderColor: SOFT, borderRadius: 4, backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center',
  },
  lampLit: {
    position: 'absolute', top: LAMP_T, width: LAMP_W, height: LAMP_H,
    borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: INK,
    alignItems: 'center', justifyContent: 'center',
  },
  lampText: {
    fontFamily: 'Inter_700Bold', fontSize: 8, letterSpacing: 0.4, color: SOFT,
    includeFontPadding: false,
  },
  lampTextLit: {
    fontFamily: 'Inter_700Bold', fontSize: 8, letterSpacing: 0.4, color: PAPER,
    includeFontPadding: false,
  },

  ans: { position: 'absolute', left: DW_L, width: DW_W },
  ansInner: {
    height: ANS_H, borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center',
  },
  ansText: {
    fontFamily: 'Inter_700Bold', fontSize: 9.5, letterSpacing: 0, color: INK,
    includeFontPadding: false,
  },
  onInk: { color: PAPER },
  pickRight: { backgroundColor: INK, borderColor: INK },
  pickWrong: { borderColor: SOFT, opacity: 0.45 },
});

// Ink runs from the header (226) to the ground line (500). Band 220…512 = 292 (H59).
export function Political12Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Political12Scene} band={[220, 512]} camera={CAM} />;
}
