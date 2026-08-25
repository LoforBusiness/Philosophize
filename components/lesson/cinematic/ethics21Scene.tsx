import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { ease01, moveTr, pose, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './ethics21Script';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER,
  useHeld, carryFrom, keepHeld, useCarry, carry,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// ─────────────────────────────────────────────────────────────────────────────
// ONE ACT, TWO OUTCOMES, AND A SIGHT-MARK ON ONE OF THEM.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · the ACT is a 150×30 plate at x 125…275, y 224…254 — THE DOSE. One box at the
//   top, because there is one act and the whole doctrine is about that.
// · TWO OUTCOME BOXES, 140×46, at y 320…366, lefts 34 and 226. PAIN GONE on the
//   left, LIFE SHORTENED on the right, drawn IDENTICALLY — same border, same
//   size, same type. That sameness is the argument: nothing about the outcomes
//   themselves distinguishes them.
// · TWO ARMS from the act down to each box, drawn as an elbow: a vertical from
//   y 254 to y 292 at x 200, then a horizontal along y 292 out to each box's
//   centre, then a vertical down to y 320.
// · the SIGHT-MARK is a 22px ring around the left box's own centre, drawn only
//   there. It is the only asymmetry on the stage until `means` arrives.
// · the MEANS case redraws the right arm so it runs THROUGH the right box and on
//   into the left one — a 3-thick line from x 296 down the right box's side and
//   back along y 380 into the left box's foot. The harm stops being beside the
//   aim and starts being on the way to it, which is the entire distinction.
// · the FIGURE walks x 200 → 132 → 268 on GROUND 500; crown ≈ 397, and the
//   lowest ink is the means path at y 380, so 17 units separate them — the
//   tightest gap here, and the reason that path is a hairline rather than a box.
//
// Ink runs y 224 (the act) … y 500. BAND 218…512 = 294, with the 103-unit figure
// at 35%.
// ─────────────────────────────────────────────────────────────────────────────

/** Crossfade for a beat that does NOT walk. 0.85 is the base `footfalls` assumes. */
const BASE_TR = 0.85;

const ACT_X = 125;
const ACT_Y = 224;
const ACT_W = 150;
const ACT_H = 30;

const OUT_Y = 320;
const OUT_W = 140;
const OUT_H = 46;
const OUT_X = [34, 226];
const OUT_ID = ['relief', 'death'];
const OUT_TEXT = ['PAIN GONE', 'LIFE SHORTENED'];

const ELBOW_Y = 292;
const MEANS_Y = 380;

const FIG_X = 200;

const X = BEATS.map((b) => b.x ?? FIG_X);
const P = BEATS.map((b) => b.p ?? 0);
const ACT = BEATS.map((b) => b.act ?? 0);
const ARMS = BEATS.map((b) => b.arms ?? 0);
const AIM = BEATS.map((b) => b.aim ?? 0);
const MEANS = BEATS.map((b) => b.means ?? 0);
const LIVE = BEATS.map((b) => b.live ?? 0);

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('ethics21'));

export default function Ethics21Scene({ clock, bt, bi, i, picked, onPick }: SceneApi) {
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
      act: carry(cv, 1, n, ACT[p], ACT[n], tr),
      arms: carry(cv, 2, n, ARMS[p], ARMS[n], tr),
      aim: carry(cv, 3, n, AIM[p], AIM[n], tr),
      means: carry(cv, 4, n, MEANS[p], MEANS[n], tr),
      t,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.cards && LIVE[i] === 1;

  const actStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.act }));
  const armStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.arms }));
  const aimStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.aim }));
  const meansStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.means }));

  return (
    <View style={styles.scene}>
      <Animated.View style={[StyleSheet.absoluteFill, actStyle]} pointerEvents="none">
        <View style={styles.act} />
        <Text style={styles.actText}>ONE DOSE OF MORPHINE</Text>
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, armStyle]} pointerEvents="none">
        <View style={styles.stem} />
        <View style={styles.cross} />
        {OUT_X.map((ox) => (
          <View key={`d${ox}`} style={[styles.drop, { left: ox + OUT_W / 2 - 1 }]} />
        ))}
      </Animated.View>

      {OUT_X.map((ox, k) => (
        <View key={`o${ox}`} pointerEvents="none">
          <Animated.View style={[styles.out, { left: ox }, armStyle]} />
          <Animated.Text style={[styles.outText, { left: ox }, armStyle]}>{OUT_TEXT[k]}</Animated.Text>
        </View>
      ))}

      {/* THE SIGHT-MARK. The one asymmetry, and the answer to the first question. */}
      <Animated.View style={[styles.sight, aimStyle]} pointerEvents="none" />

      {/* THE HARM AS THE MEANS: the right arm now runs through the death and on
          into the relief, so the path visibly passes through it. */}
      <Animated.View style={[StyleSheet.absoluteFill, meansStyle]} pointerEvents="none">
        <View style={styles.mDown} />
        <View style={styles.mAcross} />
        <View style={styles.mUp} />
        <Text style={styles.mCap}>THE SECOND CASE: THROUGH IT, NOT BESIDE IT</Text>
      </Animated.View>

      {OUT_X.map((ox, k) => (
        <Target
          key={`t${OUT_ID[k]}`}
          id={OUT_ID[k]}
          correct={OUT_ID[k] === 'relief'}
          picked={picked}
          onPick={onPick}
          disabled={!live || answered}
          style={[styles.hit, { left: ox }]}
        >
          <View
            style={[
              styles.hitBox,
              answered && OUT_ID[k] === 'relief' && styles.right,
              answered && picked === OUT_ID[k] && OUT_ID[k] !== 'relief' && styles.wrong,
            ]}
            pointerEvents="none"
          />
        </Target>
      ))}

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />
    </View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 20, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },

  act: {
    position: 'absolute', left: ACT_X, top: ACT_Y, width: ACT_W, height: ACT_H,
    borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
  },
  actText: {
    position: 'absolute', left: ACT_X, top: ACT_Y + 10, width: ACT_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.9, color: INK, includeFontPadding: false,
  },

  stem: { position: 'absolute', left: 199, top: ACT_Y + ACT_H, width: 2, height: ELBOW_Y - ACT_Y - ACT_H, backgroundColor: SOFT },
  cross: { position: 'absolute', left: 104, top: ELBOW_Y, width: 192, height: 2, backgroundColor: SOFT },
  drop: { position: 'absolute', top: ELBOW_Y, width: 2, height: OUT_Y - ELBOW_Y, backgroundColor: SOFT },

  out: {
    position: 'absolute', top: OUT_Y, width: OUT_W, height: OUT_H,
    borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
  },
  outText: {
    position: 'absolute', top: OUT_Y + 17, width: OUT_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 1, color: INK, includeFontPadding: false,
  },

  sight: {
    position: 'absolute', left: OUT_X[0] + OUT_W / 2 - 15, top: OUT_Y + OUT_H / 2 - 15,
    width: 30, height: 30, borderRadius: 15, borderWidth: 2.5, borderColor: INK,
  },

  mDown: { position: 'absolute', left: 364, top: OUT_Y + 8, width: 2.5, height: MEANS_Y - OUT_Y - 8, backgroundColor: INK },
  mAcross: { position: 'absolute', left: 100, top: MEANS_Y, width: 266, height: 2.5, backgroundColor: INK },
  mUp: { position: 'absolute', left: 100, top: OUT_Y + OUT_H, width: 2.5, height: MEANS_Y - OUT_Y - OUT_H, backgroundColor: INK },
  mCap: {
    position: 'absolute', left: 110, top: MEANS_Y + 4, width: 250,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.8, color: SOFT, includeFontPadding: false,
  },

  hit: { position: 'absolute', top: OUT_Y, width: OUT_W, height: OUT_H },
  hitBox: { width: OUT_W, height: OUT_H, borderRadius: 4 },
  right: { borderWidth: 3, borderColor: INK },
  wrong: { borderWidth: 1.5, borderColor: SOFT, borderStyle: 'dashed', opacity: 0.5 },
});

export function Ethics21Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Ethics21Scene} band={[218, 512]} camera={CAM} />;
}
