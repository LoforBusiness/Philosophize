import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { dirsFrom, ease01, moveTr, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './aesthetics41Script';
import {
  facing, GROUND, K_FIG, STAGE_W, STAGE_H, INK, STONE, SOFT, RULE, PAPER, useHeld, carryFrom, keepHeld, useCarry, carry, pickAt, lookPose,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// ─────────────────────────────────────────────────────────────────────────────
// A CANVAS INSIDE A FRAME INSIDE A WALL, AND ONE RING THAT WILL NOT SETTLE.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · the WALL is 250×160 at x 136 (136…386), y 272…432 — the scene's filled STONE
//   mass, and the outermost of the three candidates (T2).
// · the FRAME is a 160×110 box at x 180 (180…340), y 296…406, drawn as a 10-unit
//   ink border so it is a real band with a width rather than a hairline. Its inner
//   face therefore runs x 190…330, y 306…396.
// · the CANVAS fills that inner face exactly, in paper, and carries a HORIZON rule
//   at y 356 and a 22-unit disc at x 280, y 316 — enough that it reads as a
//   picture rather than as a blank rectangle.
// · the RING is the boundary itself, and it is one object in two forms. Round the
//   WORK it sits at x 172…348, y 288…414, outside the frame band; round the ROOM
//   it pulls in to x 184…336, y 300…402, inside it. Solid in both, and DASHED when
//   it lands on the band itself — the only mark in this vocabulary that can say
//   "here, and also not quite here".
// · THREE PLATES of 84×26 at x 128 · 220 · 312 (128…396), top y 448 — below the
//   wall at 432 and above the ground, each carrying its own words (S11).
// · the figure stands at x 28 and walks to 88; his widest span at the walked mark
//   is x ≈ 63…113, fifteen units clear of the nearest plate at 128 and twenty-three
//   clear of the wall at 136.
//
// Ink runs y 244 (the caption) … y 500 (ground). BAND 240…512 = 272 — a 103-unit
// figure at 37.9%, inside H58's 38%.
// ─────────────────────────────────────────────────────────────────────────────

/** Crossfade for a beat that does NOT walk. 0.85 is the base `footfalls` assumes. */
const BASE_TR = 0.85;

const WALL_X = 136;
const WALL_Y = 272;
const WALL_W = 250;
const WALL_H = 160;

const FRAME_X = 180;
const FRAME_Y = 296;
const FRAME_W = 160;
const FRAME_H = 110;
const FRAME_BAND = 10;

const CANVAS_X = FRAME_X + FRAME_BAND;
const CANVAS_Y = FRAME_Y + FRAME_BAND;
const CANVAS_W = FRAME_W - FRAME_BAND * 2;
const CANVAS_H = FRAME_H - FRAME_BAND * 2;

/** The ring, as an INSET from the frame's outer edge. Negative is outside it. */
const RING_OUT = -8;
const RING_IN = 4;

const PLATE_X = [128, 220, 312];
const PLATE_Y = 448;
const PLATE_W = 84;
const PLATE_H = 26;
const PLATE_CAP = ['THE CANVAS', 'THE FRAME', 'THE WALL'];
const PLATE_ID = ['canvas', 'frame', 'wall'];
/** The one that will not settle. The other two settle immediately. */
const FRAME = 1;

const CAP_T = 244;
const FIG_X = 28;

const X = BEATS.map((b) => b.x ?? FIG_X);
// WHICH WAY HE IS POINTING, read off the same x track he walks along.
const DIR = dirsFrom(X, 1);
const P = BEATS.map((b) => b.p ?? 0);
const WALL = BEATS.map((b) => (b.wall ? 1 : 0));
const ART = BEATS.map((b) => (b.art ? 1 : 0));
const RING = BEATS.map((b) => (b.ring ? 1 : 0));
const PLATES = BEATS.map((b) => (b.plates ? 1 : 0));
const LIVE = BEATS.map((b) => (b.live ? 1 : 0));

// R7c — the stage follows the control on its own graded beat, and only there.
// Derived from the beat so it cannot fall out of step with the control.
const REACT = BEATS.map((b) => (b.interact?.sort ? 1 : 0));

// THE SORT'S OWN BIN ORDER, never the shuffled row (X3): 0 the room · 1 the work
// · 2 neither. Each row is read off that bin's own words, and the three are
// authored so the ring travels outward rather than jumping.
//   room    — the frame is furniture, so the boundary is INSIDE it, round the paint.
//   work    — the frame belongs to the piece, so the boundary is OUTSIDE it.
//   neither — the boundary is the band itself, and it goes dashed.
const INSET_AT = [RING_IN, RING_OUT, RING_OUT];
const SOLID_AT = [1, 1, 0];
const DASH_AT = [0, 0, 1];

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('aesthetics41'));

export default function Aesthetics41Scene({ clock, bt, bi, i, picked, onPick, pickPos, gazeX, gazeY, gazeOn }: SceneApi) {
  const reacting = REACT[i] === 1;
  const heldFig = useHeld();
  const cv = useCarry(7);
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

    const on = RING[n];
    return {
      fig: lookPose(figS, carry(cv, 0, n, X[p], X[n], tr), GROUND, K_FIG, facing(DIR[p], DIR[n], bt.value), 1, gazeX.value, gazeY.value, gazeOn.value),
      t,
      wallOn: carry(cv, 1, n, WALL[p], WALL[n], tr),
      artOn: carry(cv, 2, n, ART[p], ART[n], tr),
      inset: carry(cv, 3, n, RING_OUT, reacting ? pickAt(INSET_AT, pickPos.value) : RING_OUT, tr),
      solid: carry(cv, 4, n, RING[p], reacting ? on * pickAt(SOLID_AT, pickPos.value) : on, tr),
      dashed: carry(cv, 5, n, 0, reacting ? on * pickAt(DASH_AT, pickPos.value) : 0, tr),
      platesOn: carry(cv, 6, n, PLATES[p], PLATES[n], tr),
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.cards && LIVE[i] === 1;

  const wallStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.wallOn }));
  const artStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.artOn }));
  const platesStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.platesOn }));
  // BOTH RINGS ARE THE SAME RECTANGLE, and each style computes it inline: a
  // helper shared between two worklets is packed as a RemoteFunction and throws
  // on the UI thread, while a browser runs it perfectly (check:worklets).
  const solidStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.solid,
    left: FRAME_X + SCENE.value.inset,
    top: FRAME_Y + SCENE.value.inset,
    width: FRAME_W - SCENE.value.inset * 2,
    height: FRAME_H - SCENE.value.inset * 2,
  }));
  const dashStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.dashed,
    left: FRAME_X + SCENE.value.inset,
    top: FRAME_Y + SCENE.value.inset,
    width: FRAME_W - SCENE.value.inset * 2,
    height: FRAME_H - SCENE.value.inset * 2,
  }));

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <Text style={styles.cap} pointerEvents="none">WHERE IS THE EDGE?</Text>

      <Animated.View style={[StyleSheet.absoluteFill, wallStyle]} pointerEvents="none">
        <View style={styles.wall} />
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, artStyle]} pointerEvents="none">
        <View style={styles.frame} />
        <View style={styles.canvas} />
        <View style={styles.horizon} />
        <View style={styles.sun} />
      </Animated.View>

      {/* ONE BOUNDARY IN TWO FORMS. Solid where the reader puts the frame on a
          side, dashed where they leave it on neither. */}
      <Animated.View style={[styles.ringSolid, solidStyle]} pointerEvents="none" />
      <Animated.View style={[styles.ringDashed, dashStyle]} pointerEvents="none" />

      <Animated.View style={[StyleSheet.absoluteFill, platesStyle]}>
        {PLATE_ID.map((id, k) => (
          <Target
            key={id}
            id={id}
            correct={k === FRAME}
            picked={picked}
            onPick={onPick}
            disabled={!live || answered}
            style={[styles.hit, { left: PLATE_X[k] }]}
            radius={4}
          >
            <View style={styles.plate} pointerEvents="none" />
            <Text style={styles.plateText} pointerEvents="none">{PLATE_CAP[k]}</Text>
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
    position: 'absolute', left: WALL_X, top: CAP_T, width: WALL_W,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.4, color: SOFT, includeFontPadding: false,
  },

  wall: {
    position: 'absolute', left: WALL_X, top: WALL_Y, width: WALL_W, height: WALL_H,
    borderWidth: 2, borderColor: INK, backgroundColor: STONE,
  },
  // A BAND WITH A WIDTH, not a hairline — the whole lesson is about a thing that
  // occupies territory of its own.
  frame: {
    position: 'absolute', left: FRAME_X, top: FRAME_Y, width: FRAME_W, height: FRAME_H,
    borderWidth: FRAME_BAND, borderColor: INK, backgroundColor: PAPER,
  },
  canvas: {
    position: 'absolute', left: CANVAS_X, top: CANVAS_Y, width: CANVAS_W, height: CANVAS_H,
    backgroundColor: PAPER,
  },
  horizon: { position: 'absolute', left: CANVAS_X, top: 356, width: CANVAS_W, height: 2, backgroundColor: INK },
  sun: {
    position: 'absolute', left: 280, top: 316, width: 22, height: 22, borderRadius: 11,
    borderWidth: 2, borderColor: INK,
  },

  ringSolid: { position: 'absolute', borderWidth: 2.5, borderColor: INK },
  ringDashed: { position: 'absolute', borderWidth: 2.5, borderColor: INK, borderStyle: 'dashed' },

  hit: { position: 'absolute', top: PLATE_Y, width: PLATE_W, height: PLATE_H },
  plate: {
    position: 'absolute', left: 0, top: 0, width: PLATE_W, height: PLATE_H,
    borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
  },
  plateText: {
    position: 'absolute', left: 0, top: 8, width: PLATE_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.5, color: INK, includeFontPadding: false,
  },
});

export function Aesthetics41Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Aesthetics41Scene} band={[240, 512]} camera={CAM} />;
}
