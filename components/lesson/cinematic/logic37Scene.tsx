import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { clamp01, ease01, lerp, moveTr, pose, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './logic37Script';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER, useHeld, carryFrom, keepHeld, useCarry, carry,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// ─────────────────────────────────────────────────────────────────────────────
// TWO BOXES, EIGHT TOKENS THAT SETTLE, AND ONE THAT NEVER DOES.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · the two BOXES are 108×92 at x 136 and x 256, y 288…380, captioned above at
//   y 272…284: SHAVES HIMSELF and SHAVED BY HIM.
// · the eight VILLAGER TOKENS are 16×16 discs. They start in a row on the shelf
//   at y 250 (x 150 stepping 22) and drop into their box as the sort runs —
//   four to each, laid out in two rows inside so none overlaps.
// · the BARBER TOKEN is the same disc with a 2-thick ring around it, at y 330. It
//   OSCILLATES between the two boxes on the WALL clock: x 200 ± 46, a full cycle
//   every 2.4s, so it is still moving while the reader reads and it never lands.
//   That is the only honest animation for a thing with no answer.
// · the SET PANEL is 236×46 at x 136, y 404…450, holding the same puzzle in the
//   set-theoretic form, with its own small unresolved token at x 356.
// · the figure stands at x 56 and walks to 128; crown ~397, left of the boxes,
//   which begin at x 136.
//
// Ink runs y 250 (the shelf row) … y 500 (ground). BAND 244…512 = 268 — that puts
// the 103-unit figure at 38%, exactly H58's line, so the caption row sits at 236
// and the BAND IS 230…512 = 282, giving 37% and a margin.
// ─────────────────────────────────────────────────────────────────────────────

/** Crossfade for a beat that does NOT walk. 0.85 is the base `footfalls` assumes. */
const BASE_TR = 0.85;

const BOX_Y = 288;
const BOX_W = 108;
const BOX_H = 92;
const BOX_X = [136, 256];
const BOX_CAP = ['SHAVES HIMSELF', 'SHAVED BY HIM'];
const BOX_ID = ['self', 'barber'];

const SHELF_Y = 250;
const TOKEN = 16;
/** Where each villager ends up: index → [box, slot]. Four to a box, two rows deep. */
const LANDS: readonly (readonly [number, number])[] = [
  [0, 0], [1, 0], [0, 1], [1, 1], [0, 2], [1, 2], [0, 3], [1, 3],
];

const SET_X = 136;
const SET_Y = 404;

const CAP_T = 236;
const FIG_X = 56;

const X = BEATS.map((b) => b.x ?? FIG_X);
const P = BEATS.map((b) => b.p ?? 0);
const BOXES = BEATS.map((b) => (b.boxes ? 1 : 0));
const SORTED = BEATS.map((b) => b.sorted ?? 0);
const BARBER = BEATS.map((b) => (b.barber ? 1 : 0));
const SETS = BEATS.map((b) => (b.sets ? 1 : 0));
const LIVE = BEATS.map((b) => (b.live ? 1 : 0));

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('logic37'));

export default function Logic37Scene({ clock, bt, bi, i, picked, onPick }: SceneApi) {
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
      t,
      boxesOn: carry(cv, 1, n, BOXES[p], BOXES[n], tr),
      sorted: carry(cv, 2, n, SORTED[p], SORTED[n], tr),
      barberOn: carry(cv, 3, n, BARBER[p], BARBER[n], tr),
      setsOn: carry(cv, 4, n, SETS[p], SETS[n], tr),
      // THE WALL CLOCK, NOT THE BEAT CLOCK. The barber has to keep failing to
      // settle for as long as he is on stage — a swing that finished would be a
      // picture of an answer arriving.
      swing: Math.sin(t * 2.6),
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.cards && LIVE[i] === 1;

  const boxesStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.boxesOn }));
  const barberStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.barberOn,
    transform: [{ translateX: SCENE.value.swing * 46 }],
  }));
  const setsStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.setsOn }));

  const villagers: number[] = [];
  for (let v = 0; v < 8; v++) villagers.push(v);

  return (
    <View style={styles.scene}>
      <Text style={styles.cap}>ONE RULE, EVERY MAN IN THE VILLAGE</Text>

      <Animated.View style={[StyleSheet.absoluteFill, boxesStyle]}>
        {BOX_X.map((bx, k) => (
          <View key={bx} pointerEvents="none">
            <View style={[styles.box, { left: bx }]} />
            <Text style={[styles.boxCap, { left: bx }]}>{BOX_CAP[k]}</Text>
          </View>
        ))}
        {villagers.map((v) => <Villager key={v} S={SCENE} index={v} />)}

        {BOX_X.map((bx, k) => (
          <Target
            key={`t${bx}`}
            id={BOX_ID[k]}
            correct={false}
            picked={picked}
            onPick={onPick}
            disabled={!live || answered}
            style={[styles.hit, { left: bx }]}
          >
            <View
              style={[styles.hitBox, answered && picked === BOX_ID[k] && styles.hitWrong]}
              pointerEvents="none"
            />
          </Target>
        ))}
      </Animated.View>

      <Animated.View style={[styles.barber, barberStyle]} pointerEvents="none">
        <View style={styles.token} />
        <View style={styles.ring} />
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, setsStyle]} pointerEvents="none">
        <View style={styles.setPanel} />
        <Text style={styles.setText}>THE SET OF ALL SETS{'\n'}THAT DO NOT CONTAIN THEMSELVES</Text>
      </Animated.View>

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />
    </View>
  );
}

/** One villager, dropping from the shelf into whichever box the rule sends him to. */
function Villager({ S, index }: { S: SharedValue<any>; index: number }) {
  const [box, slot] = LANDS[index];
  const fromX = 150 + index * 22;
  const toX = BOX_X[box] + 16 + (slot % 2) * 44;
  const toY = BOX_Y + 20 + Math.floor(slot / 2) * 34;
  const st = useAnimatedStyle(() => {
    const u = clamp01(S.value.sorted * 8 - index);
    return { transform: [{ translateX: (toX - fromX) * u }, { translateY: (toY - SHELF_Y) * u }] };
  });
  return <Animated.View style={[styles.token, { position: 'absolute', left: fromX, top: SHELF_Y }, st]} />;
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 20, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },

  cap: {
    position: 'absolute', left: 136, top: CAP_T, width: 240,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.4, color: SOFT, includeFontPadding: false,
  },

  box: {
    position: 'absolute', top: BOX_Y, width: BOX_W, height: BOX_H,
    borderWidth: 2.5, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
  },
  boxCap: {
    position: 'absolute', top: BOX_Y - 16, width: BOX_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1, color: SOFT, includeFontPadding: false,
  },

  token: { width: TOKEN, height: TOKEN, borderRadius: TOKEN / 2, backgroundColor: INK },

  barber: { position: 'absolute', left: 200 - TOKEN / 2, top: 330, width: TOKEN, height: TOKEN },
  ring: {
    position: 'absolute', left: -5, top: -5, width: TOKEN + 10, height: TOKEN + 10,
    borderRadius: (TOKEN + 10) / 2, borderWidth: 2, borderColor: INK,
  },

  setPanel: {
    position: 'absolute', left: SET_X, top: SET_Y, width: 236, height: 46,
    borderWidth: 1.5, borderColor: SOFT, borderRadius: 4, backgroundColor: PAPER,
  },
  setText: {
    position: 'absolute', left: SET_X, top: SET_Y + 12, width: 236, textAlign: 'center', lineHeight: 11,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.9, color: INK, includeFontPadding: false,
  },

  hit: { position: 'absolute', top: BOX_Y, width: BOX_W, height: BOX_H },
  hitBox: { position: 'absolute', left: 0, top: 0, width: BOX_W, height: BOX_H, borderRadius: 4 },
  hitWrong: { borderWidth: 2, borderColor: SOFT, borderStyle: 'dashed' },
});

export function Logic37Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Logic37Scene} band={[230, 512]} camera={CAM} />;
}
