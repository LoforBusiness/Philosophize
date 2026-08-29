import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { dirsFrom, clamp01, ease01, lerp, moveTr, pose, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './metaphysics36Script';
import {
  facing, GROUND, K_FIG, STAGE_W, STAGE_H, INK, STONE, SOFT, RULE, PAPER, useHeld, carryFrom, keepHeld, useCarry, carry,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target, { AnswerLift } from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// ─────────────────────────────────────────────────────────────────────────────
// A HOTEL FRONT, SIXTEEN DOORS, AND GUESTS THAT WALK RIGHT.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · the FRONT is two rows of eight doors. A door is 30 wide × 34 tall with its
//   number beneath: row one at y 262, row two at y 322, columns from x 110 in
//   steps of 34, so the block spans x 110…382 and y 262…368 (numbers included).
// · the ellipsis after door 16 sits at x 386…396, y 336 — the only mark saying
//   the building does not stop, and it never moves.
// · a GUEST is a 15-wide dark block inside a door, inset 8 from each edge. It
//   TRANSLATES to its new door rather than being redrawn there, so a shift is one
//   animated property and the reader can see who went where.
// · the LOBBY DESK is 78×30 at x 176, y 402…432 — past the end of the walk, so the
//   figure arrives at it rather than standing on it. It was at x 22 and he stood
//   at 54, which put his ink over the word DESK on five beats of eight.
// · the figure stands at x 54 and walks to 128. His crown reaches ~397, which is
//   below the door block's floor at 368, and his reach ends about 168 — eight
//   units short of the desk.
//
// Ink runs y 240 (caption) … y 500 (ground). BAND 234…512 = 278 (H59), and the
// 103-unit figure is 37% of it — inside H58's 38% with nothing to spare, which is
// why the doors sit where they do.
//
// SIXTEEN DOORS IS THE PICTURE OF ENDLESS, not sixteen. The ellipsis carries the
// rest, and every number the lesson says out loud (1, 2, doubling) happens inside
// the sixteen the reader can actually see.
// ─────────────────────────────────────────────────────────────────────────────

/** Crossfade for a beat that does NOT walk. 0.85 is the base `footfalls` assumes. */
const BASE_TR = 0.85;

const DOOR_W = 30;
const DOOR_H = 34;
const STEP = 34;
const COL0 = 110;
const ROW_Y = [262, 322];

/** Door n (1-based) → its top-left on the front. */
function doorAt(n: number) {
  const k = n - 1;
  return { left: COL0 + (k % 8) * STEP, top: ROW_Y[Math.floor(k / 8)] };
}

const CAP_T = 240;
const FIG_X = 54;

const X = BEATS.map((b) => b.x ?? FIG_X);
// WHICH WAY HE IS POINTING, read off the same x track he walks along:
// +1 where it rises, -1 where it falls, and HOLD while he stands still, so a
// figure who walks left to something keeps facing it while he talks about it.
const DIR = dirsFrom(X, 1);
const P = BEATS.map((b) => b.p ?? 0);
const HOTEL = BEATS.map((b) => (b.hotel ? 1 : 0));
const SHIFT = BEATS.map((b) => b.shift ?? 0);
const DBL = BEATS.map((b) => (b.dbl ? 1 : 0));
const LIVE_D = BEATS.map((b) => (b.live_d ? 1 : 0));
const LIVE = BEATS.map((b) => (b.live ? 1 : 0));

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('metaphysics36'));

export default function Metaphysics36Scene({ clock, bt, bi, i, picked, onPick, dragPos }: SceneApi) {
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

    // ONE VALUE, TWO SOURCES, NEVER BOTH. On the drag beat the reader's thumb
    // drives the move; everywhere else the script's own track does. `move` is how
    // far along the two manoeuvres the hotel is: 0…1 is the one-room shift, 1…2 is
    // the doubling, so a single number carries both without a second track to fall
    // out of step with.
    const d = LIVE_D[n] === 1 ? clamp01(dragPos.value) : 0;
    const scripted = carry(cv, 0, n, SHIFT[p], SHIFT[n], tr) + carry(cv, 1, n, DBL[p], DBL[n], tr);
    const move = LIVE_D[n] === 1 ? (d < 0.6 ? d / 0.6 : 1 + (d - 0.6) / 0.4) : scripted;

    return {
      fig: pose(figS, carry(cv, 2, n, X[p], X[n], tr), GROUND, K_FIG, facing(DIR[p], DIR[n], bt.value), 1),
      t,
      hotelOn: carry(cv, 3, n, HOTEL[p], HOTEL[n], tr),
      move,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.drag && LIVE[i] === 1;
  const hotelStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.hotelOn }));

  const rooms: number[] = [];
  for (let r = 1; r <= 16; r++) rooms.push(r);

  return (
    <View style={styles.scene}>
      <Text style={styles.cap}>EVERY ROOM TAKEN</Text>

      <Animated.View style={[StyleSheet.absoluteFill, hotelStyle]}>
        {rooms.map((r) => {
          const at = doorAt(r);
          return (
            <View key={`d${r}`} style={[styles.door, { left: at.left, top: at.top }]} pointerEvents="none">
              <View style={styles.doorBox} />
              <Text style={styles.doorNo}>{r}</Text>
            </View>
          );
        })}
        {/* Each guest rides with its own room target (E39). */}
        {rooms.map((r) => (
          <AnswerLift key={`g${r}`} id={`r${r}`} picked={picked} correct={r % 2 === 1}>
            <Guest S={SCENE} room={r} />
          </AnswerLift>
        ))}
        <Text style={styles.more}>…</Text>

        <View style={styles.desk} pointerEvents="none" />
        <Text style={styles.deskLabel}>DESK</Text>

        {rooms.map((r) => {
          const at = doorAt(r);
          return (
            <Target
              key={`t${r}`}
              id={`r${r}`}
              correct={r % 2 === 1}
              picked={picked}
              onPick={onPick}
              disabled={!live || answered}
              style={[styles.hit, { left: at.left, top: at.top }]}
            >
              <View
                style={[styles.hitBox, answered && picked === `r${r}` && r % 2 === 0 && styles.hitWrong]}
                pointerEvents="none"
              />
            </Target>
          );
        })}
      </Animated.View>

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />
    </View>
  );
}

/**
 * One guest, who starts in `room` and walks to wherever the current manoeuvre puts
 * them: room+1 for the shift, room×2 for the doubling. A guest whose new room is
 * past 16 leaves the visible front, which is honest — the hotel goes on.
 */
function Guest({ S, room }: { S: SharedValue<any>; room: number }) {
  const from = doorAt(room);
  const shifted = doorAt(room + 1);
  const doubled = room * 2 <= 16 ? doorAt(room * 2) : null;
  const st = useAnimatedStyle(() => {
    const m = S.value.move;
    // 0…1 is the one-room shift; 1…2 continues on to the doubling.
    const a = m <= 1 ? m : 1;
    const b = m <= 1 ? 0 : m - 1;
    const tx1 = (shifted.left - from.left) * a;
    const ty1 = (shifted.top - from.top) * a;
    const tx2 = doubled ? (doubled.left - shifted.left) * b : 240 * b;
    const ty2 = doubled ? (doubled.top - shifted.top) * b : 0;
    return {
      opacity: doubled || m <= 1.4 ? 1 : clamp01(2 - m),
      transform: [{ translateX: tx1 + tx2 }, { translateY: ty1 + ty2 }],
    };
  });
  return <Animated.View style={[styles.guest, { left: from.left + 8, top: from.top + 8 }, st]} pointerEvents="none" />;
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 20, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },
  // THE FLOOR THE GROUND LINE SITS ON. A rule on its own leaves the
  // figure and everything it is looking at standing on bare page;
  // political7 and political8 both stand their subject on a filled mass.
  floor: { position: 'absolute', left: 0, right: 0, top: GROUND, bottom: 0, backgroundColor: RULE },

  cap: {
    position: 'absolute', left: 110, top: CAP_T, width: 260,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.5, color: SOFT, includeFontPadding: false,
  },

  door: { position: 'absolute', width: DOOR_W, height: DOOR_H + 12 },
  doorBox: {
    position: 'absolute', left: 0, top: 0, width: DOOR_W, height: DOOR_H,
    borderWidth: 2, borderColor: INK, borderRadius: 3, backgroundColor: PAPER,
  },
  doorNo: {
    position: 'absolute', left: 0, top: DOOR_H + 1, width: DOOR_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.3, color: SOFT, includeFontPadding: false,
  },
  guest: { position: 'absolute', width: DOOR_W - 16, height: DOOR_H - 16, borderRadius: 3, backgroundColor: INK },

  more: {
    position: 'absolute', left: 384, top: ROW_Y[1] + 6, width: 16,
    fontFamily: 'Inter_700Bold', fontSize: 14, color: SOFT, includeFontPadding: false,
  },

  desk: {
    // MOVED FROM x 22 TO x 176, because the figure was standing on it.
    //
    // The header above claimed he stood "beside the desk rather than over it". He
    // did not: he stands at x 54 and the desk ran 22…100, so his ink covered the
    // word DESK on five of the eight beats — measured at a contrast of 1.0, which
    // is to say the word was not there at all. Rule A1 read in reverse, and the
    // sort of thing only a rendered measurement catches, since the source says the
    // opposite in a comment.
    //
    // He walks 54 → 128, so the desk now sits just past the end of his walk and he
    // arrives AT reception, which is a better reading of the beat as well. Nothing
    // else occupies y 402…432 right of the doors, which stop at y 368.
    position: 'absolute', left: 176, top: 402, width: 78, height: 30,
    borderWidth: 2, borderColor: INK, borderRadius: 3, backgroundColor: STONE,
  },
  deskLabel: {
    position: 'absolute', left: 176, top: 412, width: 78, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.4, color: INK, includeFontPadding: false,
  },

  hit: { position: 'absolute', width: DOOR_W, height: DOOR_H },
  hitBox: { position: 'absolute', left: 0, top: 0, width: DOOR_W, height: DOOR_H, borderRadius: 3 },
  hitWrong: { borderWidth: 2, borderColor: SOFT, borderStyle: 'dashed' },
});

export function Metaphysics36Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Metaphysics36Scene} band={[234, 512]} camera={CAM} />;
}
