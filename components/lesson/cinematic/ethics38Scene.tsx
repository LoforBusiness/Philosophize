import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { dirsFrom, ease01, moveTr, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './ethics38Script';
import {
  facing, GROUND, K_FIG, STAGE_W, STAGE_H, INK, STONE, SOFT, RULE, PAPER, useHeld, carryFrom, keepHeld, useCarry, carry, lookPose,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// ─────────────────────────────────────────────────────────────────────────────
// A BALANCE THAT STARTS LEVEL, AND A RACK OF REASONS HANGING OVER IT.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · the BEAM is 180×8 at y 296, pivoting about its own centre at x 250, so its
//   ends sit at x 160 and x 340. It leans ±11° with `tilt`.
// · a PAN 74×32 hangs under each end on a 2-wide cord (y 304…322), so the pans
//   occupy x 123…197 and x 303…377 — clear of the figure's 116 on one side and
//   of the stage's edge on the other. EACH PAN COUNTER-ROTATES BY THE BEAM'S OWN
//   ANGLE, because a pan that tips with the beam is a tray, not a balance.
// · one identical DISC of 14 sits in each pan. They are drawn from one style, so
//   the picture cannot say which life is which except by the pan's name.
// · the TIE BLOCK grows on the left pan as `tilt` turns — 0…22 tall, scaled from
//   its own base — and the beam leans by the same value. One number, two
//   readings, so the drag's answer and the picture cannot disagree.
// · the RACK is three weights of 70×40 at y 240, x 140 · 222 · 304, under a
//   caption at y 222 and over a shelf rule at y 282. Each weight is INSIDE its
//   own Target (E39), so what lifts on an answer is the reason that was chosen.
// · the COLUMN is 16 wide at x 242, from the pivot at y 306 down to the ground,
//   filled STONE — the mass the whole object stands on.
// · the figure stands at x 46 and walks to 90; his right edge is 116, which
//   clears the near pan's 123.
//
// Ink runs y 222 (the caption) … y 500 (ground). BAND 218…512 = 294 — a 103-unit
// figure at 35%, which is the corpus median and inside H58's 38%.
// ─────────────────────────────────────────────────────────────────────────────

/** Crossfade for a beat that does NOT walk. 0.85 is the base `footfalls` assumes. */
const BASE_TR = 0.85;

const PIVOT_X = 250;
const BEAM_Y = 296;
const BEAM_W = 180;
const BEAM_H = 8;
/** How far over the beam goes at `tilt` 1, in degrees. */
const LEAN = 11;

const CORD_H = 18;
const PAN_W = 74;
const PAN_H = 32;
const DISC = 14;
const TIE_H = 22;

const COL_X = 242;
const COL_W = 16;
const COL_Y = 306;

const W_Y = 240;
const W_W = 70;
const W_H = 40;
const W_X = [140, 222, 304];
// TWO LINES, TWO <Text>s — a newline inside one string measures as ONE line to
// `check:fits`, and that is the instrument that has to be able to see this.
const W_CAP = [['SHE IS', 'NEARER'], ['MORE GOOD', 'WILL COME'], ['SHE IS', 'MINE']];
const W_ID = ['near', 'good', 'mine'];
const SHELF_Y = 282;

const CAP_T = 222;
const FIG_X = 46;

const X = BEATS.map((b) => b.x ?? FIG_X);
// WHICH WAY HE IS POINTING, read off the same x track he walks along:
// +1 where it rises, -1 where it falls, and HOLD while he stands still.
const DIR = dirsFrom(X, 1);
const P = BEATS.map((b) => b.p ?? 0);
const BEAM = BEATS.map((b) => (b.beam ? 1 : 0));
const WEIGHTS = BEATS.map((b) => (b.weights ? 1 : 0));
const TILT = BEATS.map((b) => b.tilt ?? 0);
const LIVE = BEATS.map((b) => (b.live ? 1 : 0));

// R7b — the stage follows the control on its own graded beat, and only there.
const REACT = BEATS.map((b) => (b.interact?.drag ? 1 : 0));

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('ethics38'));

export default function Ethics38Scene({ clock, bt, bi, i, picked, onPick, dragPos, gazeX, gazeY, gazeOn }: SceneApi) {
  const reacting = REACT[i] === 1;
  const heldFig = useHeld();
  const cv = useCarry(4);
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    // A WALKING BEAT TAKES AS LONG AS THE WALK NEEDS (rig.moveTr).
    const tr = ease01(bt.value / moveTr(X[p], X[n], BASE_TR));
    const t = clock.value;

    const figS = keepHeld(heldFig, travelStance(
      X[p], X[n],
      carryFrom(heldFig, n, emoteHold(P[p], t)), emoteHold(P[n], t), emoteLive(P[n], t, bt.value),
      tr, WALK,
    ));

    return {
      fig: lookPose(figS, carry(cv, 0, n, X[p], X[n], tr), GROUND, K_FIG, facing(DIR[p], DIR[n], bt.value), 1, gazeX.value, gazeY.value, gazeOn.value),
      t,
      beamOn: carry(cv, 1, n, BEAM[p], BEAM[n], tr),
      weightsOn: carry(cv, 2, n, WEIGHTS[p], WEIGHTS[n], tr),
      // R7c — the rail IS the beam. On the graded beat the lean and the block on
      // the near pan are the reader's own thumb; everywhere else it is the
      // script's own track, and the two never disagree because it is one number.
      tilt: carry(cv, 3, n, TILT[p], reacting ? dragPos.value : TILT[n], tr),
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.cards && LIVE[i] === 1;

  const beamOnStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.beamOn }));
  const weightsStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.weightsOn }));
  const beamStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${LEAN * SCENE.value.tilt}deg` }] }));
  // BOTH PANS COUNTER-ROTATE BY THE SAME ANGLE, so one style serves both — a pan
  // that tips with the beam is a tray, and this is what keeps them hanging.
  const armStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${-LEAN * SCENE.value.tilt}deg` }] }));
  const tieStyle = useAnimatedStyle(() => ({ transform: [{ scaleY: SCENE.value.tilt }] }));

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <Text style={styles.cap} pointerEvents="none">ONE LIFE IN EACH PAN</Text>

      <Animated.View style={[StyleSheet.absoluteFill, beamOnStyle]} pointerEvents="none">
        <View style={styles.column} />

        <Animated.View style={[styles.beamBox, beamStyle]}>
          <View style={styles.beam} />

          <Animated.View style={[styles.arm, { left: 0 }, armStyle]}>
            <View style={styles.cord} />
            <View style={styles.pan} />
            <Text style={styles.panText}>MY CHILD</Text>
            <View style={styles.disc} />
            <Animated.View style={[styles.tie, tieStyle]} />
          </Animated.View>

          <Animated.View style={[styles.arm, { left: BEAM_W - PAN_W }, armStyle]}>
            <View style={styles.cord} />
            <View style={styles.pan} />
            <Text style={styles.panText}>A STRANGER</Text>
            <View style={styles.disc} />
          </Animated.View>
        </Animated.View>
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, weightsStyle]}>
        <View style={styles.shelf} pointerEvents="none" />
        {W_X.map((wx, k) => (
          <Target
            key={wx}
            id={W_ID[k]}
            correct={k === 2}
            picked={picked}
            onPick={onPick}
            disabled={!live || answered}
            style={[styles.hit, { left: wx }]}
          >
            <View
              style={[
                styles.weight,
                answered && picked === W_ID[k] && k !== 2 && styles.weightWrong,
                answered && k === 2 && styles.weightRight,
              ]}
              pointerEvents="none"
            >
              <Text style={[styles.weightText, answered && k === 2 && styles.weightTextOn]}>{W_CAP[k][0]}</Text>
              <Text style={[styles.weightText, styles.weightText2, answered && k === 2 && styles.weightTextOn]}>{W_CAP[k][1]}</Text>
            </View>
          </Target>
        ))}
      </Animated.View>

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />
    </View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 20, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },
  // THE FLOOR THE GROUND LINE SITS ON — political7 and political8 both stand
  // their subject on a filled mass rather than on bare page.
  floor: { position: 'absolute', left: 0, right: 0, top: GROUND, bottom: 0, backgroundColor: RULE },

  cap: {
    position: 'absolute', left: 140, top: CAP_T, width: 240,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.4, color: SOFT, includeFontPadding: false,
  },

  column: {
    position: 'absolute', left: COL_X, top: COL_Y, width: COL_W, bottom: STAGE_H - GROUND,
    borderWidth: 1.5, borderColor: INK, backgroundColor: STONE,
  },

  // The rotating group is exactly the beam's own box, so the pivot is its centre.
  beamBox: {
    position: 'absolute', left: PIVOT_X - BEAM_W / 2, top: BEAM_Y, width: BEAM_W, height: BEAM_H,
    transformOrigin: '50% 50%',
  },
  beam: {
    position: 'absolute', left: 0, top: 0, width: BEAM_W, height: BEAM_H,
    borderWidth: 1.5, borderColor: INK, borderRadius: 2, backgroundColor: STONE,
  },

  /** One end of the beam: the cord, the pan, its name, its life and its weight. */
  arm: { position: 'absolute', top: BEAM_H, width: PAN_W, height: CORD_H + PAN_H, transformOrigin: '50% 0%' },
  cord: { position: 'absolute', left: PAN_W / 2 - 1, top: 0, width: 2, height: CORD_H, backgroundColor: INK },
  pan: {
    position: 'absolute', left: 0, top: CORD_H, width: PAN_W, height: PAN_H,
    borderWidth: 2, borderColor: INK, borderBottomLeftRadius: 10, borderBottomRightRadius: 10, backgroundColor: PAPER,
  },
  panText: {
    position: 'absolute', left: 0, top: CORD_H + 20, width: PAN_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.6, color: INK, includeFontPadding: false,
  },
  disc: {
    position: 'absolute', left: PAN_W / 2 - DISC / 2, top: CORD_H + 3, width: DISC, height: DISC,
    borderRadius: DISC / 2, backgroundColor: INK,
  },
  tie: {
    position: 'absolute', left: 8, top: CORD_H + PAN_H - 2 - TIE_H, width: 16, height: TIE_H,
    backgroundColor: SOFT, transformOrigin: '50% 100%',
  },

  shelf: { position: 'absolute', left: 132, top: SHELF_Y, width: 250, height: 1.5, backgroundColor: RULE },
  hit: { position: 'absolute', top: W_Y, width: W_W, height: W_H },
  weight: {
    position: 'absolute', left: 0, top: 0, width: W_W, height: W_H,
    borderWidth: 2, borderColor: INK, borderRadius: 3, backgroundColor: STONE,
  },
  weightRight: { backgroundColor: INK },
  weightWrong: { borderColor: SOFT, borderStyle: 'dashed' },
  weightText: {
    position: 'absolute', left: 0, top: 9, width: W_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.6, color: INK, includeFontPadding: false,
  },
  weightText2: { top: 21 },
  weightTextOn: { color: PAPER },
});

export function Ethics38Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Ethics38Scene} band={[218, 512]} camera={CAM} />;
}
