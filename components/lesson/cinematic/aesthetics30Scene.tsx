import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { dirsFrom, clamp01, ease01, moveTr, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './aesthetics30Script';
import {
  facing, GROUND, K_FIG, STAGE_W, STAGE_H, INK, STONE, SOFT, RULE, PAPER,
  useHeld, carryFrom, keepHeld, useCarry, carry, lookPose,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target, { AnswerLift } from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// ─────────────────────────────────────────────────────────────────────────────
// A WINDOW WITH A HOVERING KESTREL, AND A MIRROR SLIDING ACROSS IT.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · the WINDOW is a 200×130 frame at x 130 (130…330), y 254…384: a 4-thick ink
//   surround on a PAPER pane, with a 3-wide ink mullion down the middle at x 228.
// · the KESTREL hovers centred on (230, 312) and never moves. Its two field marks
//   are the ones every reference gives and the ones a shape has to have to read as
//   this bird: LONG POINTED wings, drawn as 52-long tapered triangles either side,
//   and a FANNED tail, a trapezoid widening 10 → 28 below the body.
// · the MIRROR is a STONE panel filling the pane from the left, 192 × self wide, on
//   the same top edge, with a PAPER glint across it. At self 1 the bird is entirely
//   behind a reflection, which is the answer the far end of the bar states.
// · TWO NAMES of 90 under the window at y 392, at x 136 and x 244.
// · THREE PLATES of 90×34 at x 124 · 216 · 308 (124…398), top y 452, two lines.
// · the figure stands at x 24 and walks to 80; his widest span at the walked mark
//   is x ≈ 55…105, twenty-five units clear of the window at 130.
//
// Ink runs y 240 (the caption) … y 500 (ground). BAND 236…512 = 276 — a 103-unit
// figure at 37.3%, inside H58's 38%.
// ─────────────────────────────────────────────────────────────────────────────

/** Crossfade for a beat that does NOT walk. 0.85 is the base `footfalls` assumes. */
const BASE_TR = 0.85;

const WIN_X = 130;
const WIN_Y = 254;
const WIN_W = 200;
const WIN_H = 130;
const PANE = 4;

const BIRD_X = 230;
const BIRD_Y = 312;

const CAP_T = 240;
const NAME = ['A MIRROR', 'A KESTREL'];
const NAME_W = 90;
const NAME_T = 392;

const PLATE_X = [124, 216, 308];
const PLATE_Y = 452;
const PLATE_W = 90;
const PLATE_H = 34;
const PLATE_CAP = ['ATTENDING TO SOMETHING REAL', 'FORGETTING WHO YOU ARE', 'DECIDING YOU DO NOT MATTER'];
const PLATE_ID = ['attend', 'forget', 'matter'];
/** The ego steps back because the bird has taken the room. */
const ATTEND = 0;

const FIG_X = 24;

const X = BEATS.map((b) => b.x ?? FIG_X);
// WHICH WAY HE IS POINTING, read off the same x track he walks along.
const DIR = dirsFrom(X, 1);
const P = BEATS.map((b) => b.p ?? 0);
const WINDOW = BEATS.map((b) => (b.window ? 1 : 0));
const SELF = BEATS.map((b) => b.self ?? 0);
const PLATES = BEATS.map((b) => (b.plates ? 1 : 0));
const LIVE = BEATS.map((b) => (b.live ? 1 : 0));

// R7c — the stage follows the control on its own graded beat, and only there.
// Derived from the beat so it cannot fall out of step with the control.
const REACT = BEATS.map((b) => (b.interact?.split ? 1 : 0));

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('aesthetics30'));

export default function Aesthetics30Scene({ clock, bt, bi, i, picked, onPick, dragPos, gazeX, gazeY, gazeOn }: SceneApi) {
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
      window: carry(cv, 1, n, WINDOW[p], WINDOW[n], tr),
      // R7b — a split's seam is the LEFT side's share, and the left side here is
      // the self, so a high seam slides the mirror right across the bird.
      self: carry(cv, 2, n, SELF[p], reacting ? dragPos.value : SELF[n], tr),
      plates: carry(cv, 3, n, PLATES[p], PLATES[n], tr),
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.cards && LIVE[i] === 1;

  const winStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.window }));
  const mirrorStyle = useAnimatedStyle(() => ({ width: (WIN_W - PANE * 2) * clamp01(SCENE.value.self) }));
  const platesStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.plates }));

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <Text style={styles.cap} pointerEvents="none">WHAT THE LOOKING IS ON</Text>

      <Animated.View style={[StyleSheet.absoluteFill, winStyle]} pointerEvents="none">
        <View style={styles.pane} />

        <View style={styles.wingL} />
        <View style={styles.wingR} />
        <View style={styles.tail} />
        <View style={styles.birdBody} />
        <View style={styles.birdHead} />

        <Animated.View style={[styles.mirror, mirrorStyle]}>
          <View style={styles.glint} />
        </Animated.View>

        <View style={styles.frame} />
        <View style={styles.mullion} />

        <Text style={[styles.name, { left: WIN_X + 6 }]}>{NAME[0]}</Text>
        <Text style={[styles.name, { left: WIN_X + 114 }]}>{NAME[1]}</Text>
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, platesStyle]}>
        {PLATE_ID.map((id, k) => (
          <AnswerLift key={id} id={id} picked={picked} correct={k === ATTEND}>
            <View style={[styles.plate, { left: PLATE_X[k] }]} />
          </AnswerLift>
        ))}
        {PLATE_ID.map((id, k) => (
          <Target
            key={id}
            id={id}
            correct={k === ATTEND}
            picked={picked}
            onPick={onPick}
            disabled={!live || answered}
            style={[styles.hit, { left: PLATE_X[k] }]}
            radius={4}
          >
            <Text style={styles.plateText} numberOfLines={2} pointerEvents="none">{PLATE_CAP[k]}</Text>
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
  // THE FLOOR THE GROUND LINE SITS ON — a subject standing on a filled mass
  // rather than on bare page.
  floor: { position: 'absolute', left: 0, right: 0, top: GROUND, bottom: 0, backgroundColor: RULE },

  cap: {
    position: 'absolute', left: WIN_X, top: CAP_T, width: WIN_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.4, color: SOFT, includeFontPadding: false,
  },

  pane: {
    position: 'absolute', left: WIN_X + PANE, top: WIN_Y + PANE,
    width: WIN_W - PANE * 2, height: WIN_H - PANE * 2, backgroundColor: PAPER,
  },
  // DRAWN LAST so the sash sits over both the bird and the mirror, which is what
  // makes the mirror read as a thing INSIDE the window.
  frame: {
    position: 'absolute', left: WIN_X, top: WIN_Y, width: WIN_W, height: WIN_H,
    borderWidth: PANE, borderColor: INK,
  },
  mullion: { position: 'absolute', left: BIRD_X - 2, top: WIN_Y + PANE, width: 3, height: WIN_H - PANE * 2, backgroundColor: RULE },

  // THE TWO FIELD MARKS: long POINTED wings, and a FANNED tail. A kestrel drawn
  // with even bars for wings is a scarecrow (Z, aesthetics5).
  birdBody: { position: 'absolute', left: BIRD_X - 7, top: BIRD_Y - 16, width: 14, height: 32, borderRadius: 7, backgroundColor: INK },
  birdHead: { position: 'absolute', left: BIRD_X - 6.5, top: BIRD_Y - 26, width: 13, height: 13, borderRadius: 6.5, backgroundColor: INK },
  wingL: {
    position: 'absolute', left: BIRD_X - 59, top: BIRD_Y - 14, width: 0, height: 0,
    borderTopWidth: 7, borderBottomWidth: 7, borderRightWidth: 52,
    borderTopColor: 'transparent', borderBottomColor: 'transparent', borderRightColor: INK,
  },
  wingR: {
    position: 'absolute', left: BIRD_X + 7, top: BIRD_Y - 14, width: 0, height: 0,
    borderTopWidth: 7, borderBottomWidth: 7, borderLeftWidth: 52,
    borderTopColor: 'transparent', borderBottomColor: 'transparent', borderLeftColor: INK,
  },
  tail: {
    position: 'absolute', left: BIRD_X - 5, top: BIRD_Y + 14, width: 10, height: 0,
    borderBottomWidth: 22, borderLeftWidth: 9, borderRightWidth: 9,
    borderBottomColor: INK, borderLeftColor: 'transparent', borderRightColor: 'transparent',
  },

  mirror: {
    position: 'absolute', left: WIN_X + PANE, top: WIN_Y + PANE, height: WIN_H - PANE * 2,
    backgroundColor: STONE, overflow: 'hidden',
  },
  glint: { position: 'absolute', left: 10, top: -20, width: 14, height: 180, backgroundColor: PAPER, transform: [{ rotate: '24deg' }] },

  name: {
    position: 'absolute', top: NAME_T, width: NAME_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.6, color: SOFT, includeFontPadding: false,
  },

  hit: { position: 'absolute', top: PLATE_Y, width: PLATE_W, height: PLATE_H },
  plate: {
    position: 'absolute', top: PLATE_Y, width: PLATE_W, height: PLATE_H,
    borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
  },
  plateText: {
    position: 'absolute', left: 0, top: 7, width: PLATE_W, textAlign: 'center', lineHeight: 10,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.4, color: INK, includeFontPadding: false,
  },
});

export function Aesthetics30Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Aesthetics30Scene} band={[236, 512]} camera={CAM} />;
}
