import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { clamp01, ease01, lerp, moveTr, pose, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './political35Script';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER, useHeld, carryFrom, keepHeld, useCarry, carry,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// ─────────────────────────────────────────────────────────────────────────────
// TWELVE CHAIRS, THREE OF THEM TAKEN, AND THE THREE MOVE.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · the CHAIR ROW is two ranks of six. A chair is a 26-wide seat with a 20-tall
//   back and is 46 tall overall: rank one at y 266, rank two at y 338, so the
//   whole row occupies y 266…384. Columns start at x 138 and step 40, spanning
//   x 138…358.
// · an OCCUPANT is a 14-radius head sitting on its chair's seat, so a taken chair
//   reads as taken from across the stage. Under the FIRST policy seats 0, 3 and 7
//   are taken; under the second, seats 2, 5 and 10 — no overlap at all, which is
//   the point of the swap.
// · an EMPTY chair's back carries a fill that rises with the drag: 0 leaves it an
//   outline, 1 fills it solid. That is the reader's own answer, drawn on the
//   thing it is about.
// · the YEAR PLATES sit at y 236…250 and y 308…322, one above each rank: "NOW"
//   over the first six, "2100 AND AFTER" over the second six.
// · the figure stands at x 52 and walks to 126; crown ~397, and the row starts at
//   x 138, so he never overlaps a chair.
//
// Ink runs y 236 (the first plate) … y 500 (ground). BAND 230…512 = 282 (H59).
//
// THE BAND WAS 218 AND THAT WAS TOO TIGHT. A 218-tall band puts the 103-unit
// figure at 47% of the picture, well past H58's 38% — the reader would have been
// looking at a man with some furniture behind him rather than at a room. The fix
// is to stretch the composition, not to raise the budget: the whole row moved up
// 64 units, which is also a better picture, because the empty chairs now have the
// height they need to read as a crowd that is not there.
//
// A HEAD IS NOT A PERSON HERE (H57). The rig draws the one man who is present;
// the occupants are marks in a diagram of a room, and drawing twelve stickmen
// would say "twelve people" when the lesson's claim is that nine of them do not
// exist.
// ─────────────────────────────────────────────────────────────────────────────

/** Crossfade for a beat that does NOT walk. 0.85 is the base `footfalls` assumes. */
const BASE_TR = 0.85;

const COL_X = [138, 178, 218, 258, 298, 338];
const RANK_Y = [266, 338];
const SEAT_W = 26;
const BACK_H = 20;

const TAKEN_A = [0, 3, 7];
const TAKEN_B = [2, 5, 10];

const CAP_T = 236;
const FIG_X = 52;

const X = BEATS.map((b) => b.x ?? FIG_X);
const P = BEATS.map((b) => b.p ?? 0);
const CHAIRS = BEATS.map((b) => (b.chairs ? 1 : 0));
const WEIGHT = BEATS.map((b) => b.weight ?? 0);
const LIVE_W = BEATS.map((b) => (b.live_w ? 1 : 0));
const SWAP = BEATS.map((b) => (b.swap ? 1 : 0));
const LIVE = BEATS.map((b) => (b.live ? 1 : 0));

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('political35'));

export default function Political35Scene({ clock, bt, bi, qv, i, picked, onPick, dragPos }: SceneApi) {
  const heldFig = useHeld();
  const cv = useCarry(4);
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
      chairsOn: carry(cv, 1, n, CHAIRS[p], CHAIRS[n], tr),
      // The reader's thumb on its own beat, the script's track everywhere else.
      weight: LIVE_W[n] === 1 ? clamp01(dragPos.value) : carry(cv, 2, n, WEIGHT[p], WEIGHT[n], tr),
      // The occupants cross-fade between the two policies rather than teleporting:
      // the same three chairs cannot be both taken and not on one frame.
      swap: carry(cv, 3, n, SWAP[p], SWAP[n], tr),
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.drag && LIVE[i] === 1;
  const chairsStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.chairsOn }));

  return (
    <View style={styles.scene}>
      <Text style={[styles.plate, { left: COL_X[0] - 8 }]}>NOW</Text>
      <Text style={[styles.plate, { left: COL_X[0] - 8, top: CAP_T + 72 }]}>2100 AND AFTER</Text>

      <Animated.View style={[StyleSheet.absoluteFill, chairsStyle]}>
        {RANK_Y.map((ry, r) => COL_X.map((cx, c) => {
          const seat = r * 6 + c;
          return (
            <Chair
              key={seat}
              S={SCENE}
              seat={seat}
              left={cx}
              top={ry}
              picked={picked}
              onPick={onPick}
              answered={answered}
              live={live}
            />
          );
        }))}
      </Animated.View>

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />
    </View>
  );
}

function Chair({
  S, seat, left, top, picked, onPick, answered, live,
}: {
  S: SharedValue<any>; seat: number; left: number; top: number;
  picked: string | null; onPick: (id: string, ok: boolean) => void; answered: boolean; live: boolean;
}) {
  const inA = TAKEN_A.includes(seat);
  const inB = TAKEN_B.includes(seat);
  // An occupant's opacity is the cross-fade between the two policies, so a chair
  // taken under both would simply stay taken — none is, which is the point.
  const headStyle = useAnimatedStyle(() => ({
    opacity: (inA ? 1 - S.value.swap : 0) + (inB ? S.value.swap : 0),
  }));
  // An EMPTY chair's back fills with the weight the reader has given it. A taken
  // chair does not fill: its owner is already in the room.
  const fillStyle = useAnimatedStyle(() => {
    const taken = (inA ? 1 - S.value.swap : 0) + (inB ? S.value.swap : 0);
    return { opacity: S.value.weight * (1 - taken) };
  });
  const wrong = answered && picked === `s${seat}`;
  return (
    <>
      <View style={[styles.chair, { left, top }]} pointerEvents="none">
        <View style={styles.back} />
        <Animated.View style={[styles.backFill, fillStyle]} />
        <View style={styles.seat} />
        <View style={[styles.leg, { left: 1 }]} />
        <View style={[styles.leg, { left: SEAT_W - 4 }]} />
        <Animated.View style={[styles.head, headStyle]} />
      </View>
      <Target
        id={`s${seat}`}
        correct={false}
        picked={picked}
        onPick={onPick}
        disabled={!live || answered}
        style={[styles.hit, { left: left - 3, top: top - 4 }]}
      >
        <View style={[styles.hitBox, wrong && styles.hitWrong]} pointerEvents="none" />
      </Target>
    </>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 20, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },

  plate: {
    position: 'absolute', top: CAP_T, width: 200,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.4, color: SOFT, includeFontPadding: false,
  },

  chair: { position: 'absolute', width: SEAT_W, height: 46 },
  back: {
    position: 'absolute', left: 0, top: 0, width: SEAT_W, height: BACK_H,
    borderWidth: 2, borderColor: INK, borderRadius: 3, backgroundColor: PAPER,
  },
  backFill: { position: 'absolute', left: 3, top: 3, width: SEAT_W - 6, height: BACK_H - 6, borderRadius: 2, backgroundColor: INK },
  seat: { position: 'absolute', left: 0, top: BACK_H + 4, width: SEAT_W, height: 3, backgroundColor: INK },
  leg: { position: 'absolute', top: BACK_H + 7, width: 3, height: 15, backgroundColor: SOFT },
  head: {
    position: 'absolute', left: SEAT_W / 2 - 8, top: BACK_H - 20, width: 16, height: 16,
    borderRadius: 8, backgroundColor: INK,
  },

  hit: { position: 'absolute', width: SEAT_W + 6, height: 52 },
  hitBox: { position: 'absolute', left: 0, top: 0, width: SEAT_W + 6, height: 52, borderRadius: 4 },
  hitWrong: { borderWidth: 1.5, borderColor: SOFT, borderStyle: 'dashed' },
});

export function Political35Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Political35Scene} band={[230, 512]} camera={CAM} />;
}
