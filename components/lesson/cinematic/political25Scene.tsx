import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { dirsFrom, ease01, moveTr, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './political25Script';
import {
  facing, GROUND, K_FIG, STAGE_W, STAGE_H, INK, STONE, SOFT, RULE, PAPER, useHeld, carryFrom, keepHeld, useCarry, carry, lookPose,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// ─────────────────────────────────────────────────────────────────────────────
// TWO ROOMS OF EQUAL SIZE, A DOOR BETWEEN THEM, AND A REACH THAT STOPS.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · two ROOMS of 116×96 at x 132 and x 254, top y 316, so the pair runs 132…370
//   with the door in the six units between them. THEY ARE THE SAME SIZE on
//   purpose: the old picture treated one of them as a place where power did not
//   apply, and giving it half the stage says that is wrong before a word is read.
// · the DOOR is 6 wide at x 248, y 306…422 — taller than the rooms at both ends,
//   so it reads as a boundary running through rather than a wall between.
// · the REACH is a bar of 12 tall at y 288 starting at x 132; its WIDTH is the
//   argument. At 0.46 it stops at the door, which is where the old line was.
// · a TICK at each end of the reach's track, x 132 and x 370, so a reader can see
//   what full and empty mean without being told.
// · THREE PLATES of 90×34 at x 106, 202, 298, top y 452 — the answers, each
//   carrying its own words (S11), and 34 tall because AT THE FRONT DOOR wraps to
//   a second line at this width. They sit below the rooms and above the ground.
// · the figure stands at x 44 and walks to 100; his right edge at the walked mark
//   is 125, clear of the left room at 132.
//
// Ink runs y 250 (the caption) … y 500 (ground). BAND 240…512 = 272 — a 103-unit
// figure at 37.9%, inside H58's 38%.
// ─────────────────────────────────────────────────────────────────────────────

/** Crossfade for a beat that does NOT walk. 0.85 is the base `footfalls` assumes. */
const BASE_TR = 0.85;

const ROOM_Y = 316;
const ROOM_W = 116;
const ROOM_H = 96;
const ROOM_X = [132, 254];
const ROOM_CAP = ['PUBLIC', 'PRIVATE'];
const ROOM_SUB = ['law · work · the vote', 'care · money · deciding'];

const DOOR_X = 248;
const DOOR_W = 6;
const DOOR_TOP = 306;
const DOOR_BOT = 422;

const REACH_L = 132;
const REACH_R = 370;
const REACH_Y = 288;
const REACH_H = 12;

const PLATE_X = [106, 202, 298];
const PLATE_Y = 452;
const PLATE_W = 90;
const PLATE_H = 34;
const PLATE_CAP = ['AT THE STATUTE', 'AT THE FRONT DOOR', 'AT THE FACTORY'];
const PLATE_ID = ['statute', 'door', 'factory'];
/** Where the old picture stopped. The other two were argued over for centuries. */
const DOOR = 1;

const CAP_T = 250;
const FIG_X = 44;

const X = BEATS.map((b) => b.x ?? FIG_X);
// WHICH WAY HE IS POINTING, read off the same x track he walks along.
const DIR = dirsFrom(X, 1);
const P = BEATS.map((b) => b.p ?? 0);
const ROOMS = BEATS.map((b) => (b.rooms ? 1 : 0));
const REACH = BEATS.map((b) => b.reach ?? 0);
const PLATES = BEATS.map((b) => (b.plates ? 1 : 0));
const LIVE = BEATS.map((b) => (b.live ? 1 : 0));

// R7c — the stage follows the control on its own graded beat, and only there.
const REACT = BEATS.map((b) => (b.interact?.drag ? 1 : 0));

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('political25'));

export default function Political25Scene({ clock, bt, bi, i, picked, onPick, dragPos, gazeX, gazeY, gazeOn }: SceneApi) {
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
      roomsOn: carry(cv, 1, n, ROOMS[p], ROOMS[n], tr),
      platesOn: carry(cv, 2, n, PLATES[p], PLATES[n], tr),
      // R7c — the reach IS the reader's thumb on the last question, and the
      // script's own track everywhere else. One value, two sources, and the
      // picture never disagrees with whichever is in charge.
      reach: carry(cv, 3, n, REACH[p], reacting ? dragPos.value : REACH[n], tr),
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.cards && LIVE[i] === 1;

  const roomsStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.roomsOn }));
  const platesStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.platesOn }));
  const reachStyle = useAnimatedStyle(() => ({
    width: (REACH_R - REACH_L) * SCENE.value.reach,
    opacity: SCENE.value.reach > 0.02 ? 1 : 0,
  }));

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <Text style={styles.cap} pointerEvents="none">HOW FAR JUSTICE REACHES</Text>

      <View style={styles.track} pointerEvents="none" />
      <View style={[styles.tick, { left: REACH_L }]} pointerEvents="none" />
      <View style={[styles.tick, { left: REACH_R }]} pointerEvents="none" />
      <Animated.View style={[styles.reach, reachStyle]} pointerEvents="none" />

      <Animated.View style={[StyleSheet.absoluteFill, roomsStyle]} pointerEvents="none">
        {ROOM_X.map((rx, k) => (
          <View key={rx}>
            <View style={[styles.room, { left: rx }]} />
            <Text style={[styles.roomCap, { left: rx }]}>{ROOM_CAP[k]}</Text>
            <Text style={[styles.roomSub, { left: rx }]}>{ROOM_SUB[k]}</Text>
          </View>
        ))}
        <View style={styles.door} />
        <Text style={styles.doorCap}>THE FRONT DOOR</Text>
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, platesStyle]}>
        {PLATE_ID.map((id, k) => (
          <Target
            key={id}
            id={id}
            correct={k === DOOR}
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
  // THE FLOOR THE GROUND LINE SITS ON — the subject stands on a filled mass.
  floor: { position: 'absolute', left: 0, right: 0, top: GROUND, bottom: 0, backgroundColor: RULE },

  cap: {
    position: 'absolute', left: 132, top: CAP_T, width: 250,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.4, color: SOFT, includeFontPadding: false,
  },

  track: {
    position: 'absolute', left: REACH_L, top: REACH_Y + REACH_H / 2 - 1, width: REACH_R - REACH_L, height: 2,
    backgroundColor: RULE,
  },
  tick: { position: 'absolute', top: REACH_Y - 2, width: 2, height: REACH_H + 4, backgroundColor: RULE },
  reach: { position: 'absolute', left: REACH_L, top: REACH_Y, height: REACH_H, backgroundColor: INK },

  room: {
    position: 'absolute', top: ROOM_Y, width: ROOM_W, height: ROOM_H,
    borderWidth: 2.5, borderColor: INK, backgroundColor: STONE,
  },
  roomCap: {
    position: 'absolute', top: ROOM_Y + 26, width: ROOM_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.2, color: INK, includeFontPadding: false,
  },
  roomSub: {
    position: 'absolute', top: ROOM_Y + 48, width: ROOM_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.4, color: INK, includeFontPadding: false,
  },

  door: { position: 'absolute', left: DOOR_X, top: DOOR_TOP, width: DOOR_W, height: DOOR_BOT - DOOR_TOP, backgroundColor: INK },
  doorCap: {
    position: 'absolute', left: DOOR_X - 46, top: DOOR_BOT + 4, width: 98, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.6, color: SOFT, includeFontPadding: false,
  },

  hit: { position: 'absolute', top: PLATE_Y, width: PLATE_W, height: PLATE_H },
  plate: {
    position: 'absolute', left: 0, top: 0, width: PLATE_W, height: PLATE_H,
    borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
  },
  // TWO LINES OF ROOM, because three of these captions need it: measured against
  // the real .ttf, WHAT THEY BROUGHT is 101.6px into a 94-wide plate. A caption
  // that wraps inside a box built for one line is S8's exact defect, and the fix
  // is the box rather than a shorter word that says less.
  plateText: {
    position: 'absolute', left: 0, top: 6, width: PLATE_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.5, color: INK, includeFontPadding: false,
  },
});

export function Political25Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Political25Scene} band={[240, 512]} camera={CAM} />;
}
