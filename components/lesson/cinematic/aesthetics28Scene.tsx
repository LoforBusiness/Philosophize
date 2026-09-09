import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { dirsFrom, clamp01, ease01, moveTr, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './aesthetics28Script';
import {
  facing, GROUND, K_FIG, STAGE_W, STAGE_H, INK, STONE, SOFT, RULE, PAPER,
  useHeld, carryFrom, keepHeld, useCarry, carry, pickAt, lookPose,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target, { AnswerLift } from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// ─────────────────────────────────────────────────────────────────────────────
// TWO ROOMS SIDE BY SIDE, AND THE LIGHT IN ONE OR BOTH OF THEM.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · the GALLERY is a STONE room 150×124 at x 118 (118…268), y 258…382, holding a
//   framed work centred on x 193. The frame is 56 wide and 44 tall at rest and
//   shrinks to 22×18 as `flat` runs to 1 — the critic's objection drawn.
// · the STREET is a STONE room 100×124 at x 282 (282…382), y 258…382, holding a
//   cup 20×18 at x 300, a bench 44×7 at x 322 and a ball of 18 at x 300, all
//   standing on its floor at y 366.
// · a LIGHT is a PAPER wash filling each room, at the room's own value. On a mid
//   ground a pale fill is the only way to draw light at all (T2).
// · NAMES in ink at y 264, inside each room, because SOFT would not clear STONE.
// · THREE PLATES of 90×34 at x 124 · 216 · 308 (124…398), top y 452, two lines.
// · the figure stands at x 26 and walks to 82; his widest span at the walked mark
//   is x ≈ 57…107, eleven units clear of the gallery at 118.
//
// Ink runs y 242 (the caption) … y 500 (ground). BAND 238…512 = 274 — a 103-unit
// figure at 37.6%, inside H58's 38%. The caption carries the top of the band on
// its own: the rooms do not start until y 258.
// ─────────────────────────────────────────────────────────────────────────────

/** Crossfade for a beat that does NOT walk. 0.85 is the base `footfalls` assumes. */
const BASE_TR = 0.85;

const ROOM_Y = 258;
const ROOM_H = 124;
const GAL_X = 118;
const GAL_W = 150;
const ST_X = 282;
const ST_W = 100;
const ROOM_CAP = ['THE GALLERY', 'THE STREET'];

const FLOOR_Y = 366;

/** The framed work, at rest and flattened. */
const ART_MID = 193;
const ART_W = [56, 22];
const ART_H = [44, 18];
const ART_BASE = 336;

const CAP_T = 242;

const PLATE_X = [124, 216, 308];
const PLATE_Y = 452;
const PLATE_W = 90;
const PLATE_H = 34;
const PLATE_CAP = ['ART IS OVERRATED', 'MOST BEAUTY IS OUTSIDE ART', 'ONLY TASTE MATTERS'];
const PLATE_ID = ['over', 'outside', 'taste'];
/** The everyday turn: the hours, not the galleries, hold most of a life. */
const OUTSIDE = 1;

const FIG_X = 26;

const X = BEATS.map((b) => b.x ?? FIG_X);
// WHICH WAY HE IS POINTING, read off the same x track he walks along.
const DIR = dirsFrom(X, 1);
const P = BEATS.map((b) => b.p ?? 0);
const ROOMS = BEATS.map((b) => (b.rooms ? 1 : 0));
const LIT = BEATS.map((b) => b.lit ?? 0);
const STREET = BEATS.map((b) => b.street ?? 0);
const FLAT = BEATS.map((b) => b.flat ?? 0);
const PLATES = BEATS.map((b) => (b.plates ? 1 : 0));
const LIVE = BEATS.map((b) => (b.live ? 1 : 0));

// R7c — the stage follows the control on its own graded beat, and only there.
// Derived from the beat so it cannot fall out of step with the control.
const REACT = BEATS.map((b) => (b.interact?.sort ? 1 : 0));

// THE SORT'S OWN ORDER, never the shuffled rows (X3): 0 only in art · 1 in the
// ordinary too · 2 all of it equal. Each row is read off that bin's own words.
const LIT_AT = [1, 1, 1];
const ST_AT = [0, 1, 1];
const FLAT_AT = [0, 0, 1];

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('aesthetics28'));

export default function Aesthetics28Scene({ clock, bt, bi, i, picked, onPick, pickPos, gazeX, gazeY, gazeOn }: SceneApi) {
  const reacting = REACT[i] === 1;
  const heldFig = useHeld();
  const cv = useCarry(6);
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    // A WALKING BEAT TAKES AS LONG AS THE WALK NEEDS (rig.moveTr).
    const tr = ease01(bt.value / moveTr(X[p], X[n], BASE_TR));
    const t = clock.value;
    const u = pickPos.value;

    const figS = keepHeld(heldFig, travelStance(
      X[p], X[n],
      carryFrom(heldFig, n, emoteHold(P[p], t)), emoteHold(P[n], t), emoteLive(P[n], t, bt.value),
      tr, WALK,
    ));

    return {
      fig: lookPose(figS, carry(cv, 0, n, X[p], X[n], tr), GROUND, K_FIG, facing(DIR[p], DIR[n], bt.value), 1, gazeX.value, gazeY.value, gazeOn.value),
      t,
      rooms: carry(cv, 1, n, ROOMS[p], ROOMS[n], tr),
      lit: carry(cv, 2, n, LIT[p], reacting ? pickAt(LIT_AT, u) : LIT[n], tr),
      street: carry(cv, 3, n, STREET[p], reacting ? pickAt(ST_AT, u) : STREET[n], tr),
      flat: carry(cv, 4, n, FLAT[p], reacting ? pickAt(FLAT_AT, u) : FLAT[n], tr),
      plates: carry(cv, 5, n, PLATES[p], PLATES[n], tr),
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.cards && LIVE[i] === 1;

  const roomsStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.rooms }));
  const galLight = useAnimatedStyle(() => ({ opacity: clamp01(SCENE.value.lit) * 0.85 }));
  const stLight = useAnimatedStyle(() => ({ opacity: clamp01(SCENE.value.street) * 0.85 }));
  const platesStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.plates }));
  // THE PAINTING SHRINKS TO A CUP where the reader says every pleasure is equal.
  const artStyle = useAnimatedStyle(() => {
    const f = clamp01(SCENE.value.flat);
    const w = ART_W[0] + (ART_W[1] - ART_W[0]) * f;
    const h = ART_H[0] + (ART_H[1] - ART_H[0]) * f;
    return { left: ART_MID - w / 2, top: ART_BASE - h, width: w, height: h };
  });

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <Text style={styles.cap} pointerEvents="none">WHERE THE LOOKING HAPPENS</Text>

      <Animated.View style={[StyleSheet.absoluteFill, roomsStyle]} pointerEvents="none">
        <View style={styles.gallery} />
        <View style={styles.street} />
        <Animated.View style={[styles.galLight, galLight]} />
        <Animated.View style={[styles.stLight, stLight]} />

        <View style={styles.galFloor} />
        <View style={styles.stFloor} />

        <Animated.View style={[styles.art, artStyle]} />

        <View style={styles.cup} />
        <View style={styles.bench} />
        <View style={styles.ball} />

        <Text style={[styles.roomText, { left: GAL_X, width: GAL_W }]}>{ROOM_CAP[0]}</Text>
        <Text style={[styles.roomText, { left: ST_X, width: ST_W }]}>{ROOM_CAP[1]}</Text>
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, platesStyle]}>
        {PLATE_ID.map((id, k) => (
          <AnswerLift key={id} id={id} picked={picked} correct={k === OUTSIDE}>
            <View style={[styles.plate, { left: PLATE_X[k] }]} />
          </AnswerLift>
        ))}
        {PLATE_ID.map((id, k) => (
          <Target
            key={id}
            id={id}
            correct={k === OUTSIDE}
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
    position: 'absolute', left: GAL_X, top: CAP_T, width: 264, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.4, color: SOFT, includeFontPadding: false,
  },

  gallery: {
    position: 'absolute', left: GAL_X, top: ROOM_Y, width: GAL_W, height: ROOM_H,
    backgroundColor: STONE, borderWidth: 2, borderColor: INK,
  },
  street: {
    position: 'absolute', left: ST_X, top: ROOM_Y, width: ST_W, height: ROOM_H,
    backgroundColor: STONE, borderWidth: 2, borderColor: INK,
  },
  // A LIGHT IS A PAPER WASH. On a mid ground that is the only way to draw one.
  galLight: { position: 'absolute', left: GAL_X + 2, top: ROOM_Y + 2, width: GAL_W - 4, height: ROOM_H - 4, backgroundColor: PAPER },
  stLight: { position: 'absolute', left: ST_X + 2, top: ROOM_Y + 2, width: ST_W - 4, height: ROOM_H - 4, backgroundColor: PAPER },

  galFloor: { position: 'absolute', left: GAL_X + 10, top: FLOOR_Y, width: GAL_W - 20, height: 2, backgroundColor: INK },
  stFloor: { position: 'absolute', left: ST_X + 8, top: FLOOR_Y, width: ST_W - 16, height: 2, backgroundColor: INK },

  art: { position: 'absolute', borderWidth: 3, borderColor: INK, backgroundColor: STONE },

  cup: { position: 'absolute', left: 292, top: 348, width: 20, height: 18, borderWidth: 2, borderColor: INK, backgroundColor: STONE, borderBottomLeftRadius: 8, borderBottomRightRadius: 8 },
  bench: { position: 'absolute', left: 318, top: 352, width: 44, height: 7, backgroundColor: INK },
  ball: { position: 'absolute', left: 294, top: 306, width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: INK, backgroundColor: STONE },

  roomText: {
    position: 'absolute', top: 264, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.8, color: INK, includeFontPadding: false,
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

export function Aesthetics28Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Aesthetics28Scene} band={[238, 512]} camera={CAM} />;
}
