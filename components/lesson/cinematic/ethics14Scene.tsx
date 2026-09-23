import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { clamp01, ease01, mixStance, pose, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './ethics14Script';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, PAPER, useHeld, carryFrom, keepHeld, useCarry, carry, lookPose,
} from './cinematicKit';
import { stageTone } from './stageTones';
import { floorStyle, lipOf, PLATE_FACE } from './stageSkin';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// THE STAGE IS STRUCK IN THIS LESSON'S OWN BRANCH HUE (./stageTones).
// Same three tones, same luminance to the third decimal — so every contrast
// measured against the old greys still holds and nothing on the stage moved.
const TONE = stageTone('ethics');
const { RULE, STONE, SHADE } = TONE;
const LIP = lipOf(TONE);   // the ledge a toned plate stands on (scripts/skin-stage.mjs)

// A STACK THAT BECOMES A WALL (H64). Five blocks stand in a pile; five courses go
// up; the pile is empty when the wall is finished, and the wall is exactly as tall
// as what was put in. Nothing enters the picture from outside it.
//
// · the figure stands at x = 40 facing right. Widest ink is a fist at x ≈ 73.
// · the STACK is x 96…170, five blocks 74 × 26 rising off the ground line, so a
//   full pile runs y 370…500. Twenty-three units clear of the figure's fist.
// · the WALL is x 252…386, five courses 134 × 36 from the ground up: tops at
//   464 / 428 / 392 / 356 / 320. The DOOR is cut at x 296…342, y 428…500 — two
//   courses tall, and inside the wall on both sides by 44.
// · the three ANSWER BOARDS are x 88…232, 144 × 40 at tops y 236 / 288 / 340, and
//   are only on stage for the graded beat. Their lowest edge is y 380, seventeen
//   clear of the figure's crown at 397, and they stand over the emptied stack.
// · the label above the wall sits y 292…306.
// · highest ink is a board at y 236; lowest is the ground at 500.
//
// Band 230…512 = 282 — the smallest that keeps one figure under check:scale's 38%
// share of the frame (103 / 282 = 37%).

const FIG_X = 40;

const STACK_L = 96;
const STACK_W = 74;
const BLOCK_H = 26;

const WALL_L = 252;
const WALL_W = 134;
const COURSE_H = 36;

const DOOR_L = 296;
const DOOR_W = 46;
const DOOR_T = 428;

const BOARD_L = 88;
const BOARD_W = 144;
const BOARD_H = 40;
const BOARD_T = [236, 288, 340];

const BOARDS = [
  { id: 'liberty', text: 'LIBERTIES YOU GAVE UP', correct: true },
  { id: 'sovereign', text: "THE RULER'S OWN POWER", correct: false },
  { id: 'fear', text: 'FEAR OF PUNISHMENT', correct: false },
];

const G = BEATS.map((b) => b.g ?? 0);
const BUILT = BEATS.map((b) => b.built ?? 0);
const DOOR = BEATS.map((b) => b.door ?? 0);
const PICKV = BEATS.map((b) => b.pick ?? 0);
// Group AH — three still taps, each an event drawn from that beat's own words.
const LICENSE = BEATS.map((b) => ((b.license ?? 0) > 0 ? 1 : 0));
const NOTBAD = BEATS.map((b) => ((b.notBad ?? 0) > 0 ? 1 : 0));
const AIMED = BEATS.map((b) => ((b.aimed ?? 0) > 0 ? 1 : 0));

// LICENSE: "you may do whatever you judge necessary, and so may everyone
// else" — a scatter of short scratches over the wall's own empty footprint,
// which is bare ground until beat 4 lays the first course. Unregulated marks
// on unregulated ground.
const SCATTER_MARKS = [
  { x: 270, y: 356, rot: 24 },
  { x: 322, y: 398, rot: -18 },
  { x: 352, y: 444, rot: 32 },
  { x: 288, y: 466, rot: -26 },
  { x: 366, y: 352, rot: 12 },
];

// NOTBAD: "the case for leaving is not that freedom is bad" — a small tag
// over the pile itself, naming the liberties as fine on their own.
const NOTE_CX = STACK_L + STACK_W / 2;
const NOTE_T = 338;

// AIMED: "everyone else has freedom too, and can use it against you" — two
// marks in the gap between the figure and the pile, pointed back at him.
const AIM_X = 80;
const AIM_Y = [404, 432];

const X = BEATS.map((b) => b.x ?? FIG_X);

// R7b — the stage follows the control on its own graded beat, and only there.
// Derived from the beat rather than declared as a channel so it cannot fall out
// of step with the control it is about.
const REACT = BEATS.map((b) => (b.interact?.odd ? 1 : 0));
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('ethics14'));

export default function Ethics14Scene({ clock, bt, bi, i, picked, onPick, dragPos, pickPos, gazeX, gazeY, gazeOn }: SceneApi) {
  const reacting = REACT[i] === 1;
  const heldS = useHeld();
  const cv = useCarry(6);
  const cur = BEATS[i];
  const prev = i > 0 ? BEATS[i - 1] : undefined;

  const live = (cur.pick ?? 0) > 0 && !!cur.interact;
  const answered = picked !== null;

  // Group AH — each fires only on the beat that asks for it (C20c).
  const licenseFade = (cur.license ?? 0) !== (prev?.license ?? 0);
  const notBadFade = (cur.notBad ?? 0) !== (prev?.notBad ?? 0);
  const aimedFade = (cur.aimed ?? 0) !== (prev?.aimed ?? 0);

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / 0.7);          // nobody walks; this is a pose blend
    const t = clock.value;
    // Five courses over 1.4s, so they go up one at a time and can be counted.
    const lay = ease01(bt.value / 1.4);
    const grow = ease01(bt.value / 0.8);

    const s = keepHeld(heldS, mixStance(
      carryFrom(heldS, n, emoteHold(G[p], t)), emoteLive(G[n], t, bt.value), tr,
    ));
    return {
      fig: lookPose(s, FIG_X, GROUND, K_FIG, 1, 1, gazeX.value, gazeY.value, gazeOn.value),
      built: carry(cv, 0, n, BUILT[p], BUILT[n], lay),
      // R7b — the seam cuts the door. Slide toward MAY YOU EVER RESIST IT and a
      // doorway opens in the wall both men built; slide back and it closes.
      door: carry(cv, 1, n, DOOR[p], reacting ? pickPos.value : DOOR[n], grow),
      boards: carry(cv, 2, n, PICKV[p], PICKV[n], grow),
      license: carry(cv, 3, n, LICENSE[p], LICENSE[n], licenseFade ? grow : 1),
      notBad: carry(cv, 4, n, NOTBAD[p], NOTBAD[n], notBadFade ? grow : 1),
      aimed: carry(cv, 5, n, AIMED[p], AIMED[n], aimedFade ? grow : 1),
    };
  });

  const D = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const scatterStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.license }));
  const noteStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.notBad,
    transform: [{ translateY: (1 - SCENE.value.notBad) * -6 }],
  }));
  const aimedStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.aimed,
    transform: [{ translateX: (1 - SCENE.value.aimed) * 8 }],
  }));

  return (
    <Animated.View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      {/* ── THE PILE, WHICH DRAINS INTO THE WALL ─────────────────────────── */}
      {[0, 1, 2, 3, 4].map((k) => <Block key={k} k={k} SCENE={SCENE} />)}

      {/* LICENSE — scattered scratches across the wall's own bare footprint,
          before there is anything there to regulate them. */}
      {SCATTER_MARKS.map((m, k) => (
        <Animated.View
          key={k}
          style={[styles.scratch, { left: m.x, top: m.y, transform: [{ rotate: `${m.rot}deg` }] }, scatterStyle]}
          pointerEvents="none"
        />
      ))}

      {/* NOTBAD — a small tag over the pile, naming the liberties as fine. */}
      <Animated.View style={[styles.noteWrap, noteStyle]} pointerEvents="none">
        <View style={styles.note}>
          <Text style={styles.noteText}>NOT THE ISSUE</Text>
        </View>
      </Animated.View>

      {/* AIMED — two marks in the gap, pointed back at the figure. */}
      {AIM_Y.map((y, k) => (
        <Animated.Text key={k} style={[styles.aim, { top: y }, aimedStyle]} pointerEvents="none">‹</Animated.Text>
      ))}

      {/* ── THE WALL ─────────────────────────────────────────────────────── */}
      <Text style={styles.wallLabel} numberOfLines={2}>WHAT COMES BACK OVER IT</Text>
      {[0, 1, 2, 3, 4].map((k) => <Course key={k} k={k} SCENE={SCENE} />)}
      <Doorway SCENE={SCENE} />

      {/* ── THE THREE ANSWERS, ON THE GRADED BEAT ONLY ───────────────────── */}
      {BOARDS.map((b, k) => (
        <Board
          key={b.id}
          k={k}
          SCENE={SCENE}
          live={live}
          answered={answered}
          picked={picked}
          onPick={onPick}
        />
      ))}

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={D} k={K_FIG} />
    </Animated.View>
  );
}

/** One liberty, still in the pile. It leaves as its course goes up. */
function Block({ k, SCENE }: { k: number; SCENE: { value: { built: number } } }) {
  const st = useAnimatedStyle(() => {
    // Block k is still in the pile until course (4 - k) has been laid, so the top
    // of the pile is what leaves first.
    const gone = clamp01(SCENE.value.built - (4 - k));
    return { opacity: 1 - gone, transform: [{ translateY: gone * -8 }] };
  });
  return (
    <Animated.View
      style={[styles.block, { top: 500 - (k + 1) * BLOCK_H }, st]}
      pointerEvents="none"
    />
  );
}

/** One course of the wall. */
function Course({ k, SCENE }: { k: number; SCENE: { value: { built: number } } }) {
  const st = useAnimatedStyle(() => {
    const a = clamp01(SCENE.value.built - k);
    return { opacity: a, transform: [{ translateY: (1 - a) * -10 }] };
  });
  return (
    <Animated.View
      style={[styles.course, { top: 500 - (k + 1) * COURSE_H }, st]}
      pointerEvents="none"
    >
      <View style={styles.mortar} />
    </Animated.View>
  );
}

/** Locke's door, cut through the two lowest courses. */
function Doorway({ SCENE }: { SCENE: { value: { door: number } } }) {
  const st = useAnimatedStyle(() => ({ opacity: SCENE.value.door }));
  return <Animated.View style={[styles.door, st]} pointerEvents="none" />;
}

/** One answer board — a Q1 target. */
function Board({
  k, SCENE, live, answered, picked, onPick,
}: {
  k: number;
  SCENE: { value: { boards: number } };
  live: boolean;
  answered: boolean;
  picked: string | null;
  onPick: (id: string, correct: boolean) => void;
}) {
  const b = BOARDS[k];
  const on = answered && b.correct;
  const st = useAnimatedStyle(() => {
    const a = SCENE.value.boards;
    return { opacity: a, transform: [{ translateX: (1 - a) * -12 }] };
  });
  return (
    <Animated.View style={[styles.board, { top: BOARD_T[k] }, st]}>
      <Target
        id={b.id} correct={b.correct} picked={picked} onPick={onPick}
        style={styles.fill} disabled={!live || answered}
      >
        <View
          style={[
            styles.boardInner,
            on && styles.pickRight,
            answered && picked === b.id && !b.correct && styles.pickWrong,
          ]}
        >
          <Text style={[styles.boardText, on && styles.onInk]} numberOfLines={2}>{b.text}</Text>
        </View>
      </Target>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 16, right: 16, top: GROUND, height: 1.5, backgroundColor: RULE },
  // THE FLOOR THE GROUND LINE SITS ON. A rule on its own leaves the
  // figure and everything it is looking at standing on bare page;
  // political7 and political8 both stand their subject on a filled mass.
  floor: floorStyle(TONE, GROUND),
  fill: { flex: 1 },

  block: {
    position: 'absolute', left: STACK_L, width: STACK_W, height: BLOCK_H,
    borderWidth: 2, borderColor: INK, borderRadius: 8, backgroundColor: STONE, boxShadow: LIP,
  },
  course: {
    position: 'absolute', left: WALL_L, width: WALL_W, height: COURSE_H,
    borderWidth: 2, borderColor: INK, backgroundColor: STONE, boxShadow: LIP,
  },
  // The vertical joint, so a course reads as masonry rather than a bar.
  mortar: { position: 'absolute', left: WALL_W / 2 - 1, top: 0, bottom: 0, width: 2, backgroundColor: RULE },
  door: {
    position: 'absolute', left: DOOR_L, top: DOOR_T, width: DOOR_W, height: 500 - DOOR_T,
    backgroundColor: PAPER, borderWidth: 2, borderColor: INK,
    borderTopLeftRadius: 20, borderTopRightRadius: 20, borderBottomWidth: 0,
  },
  wallLabel: {
    position: 'absolute', left: WALL_L, top: 292, width: WALL_W,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.2, color: SOFT,
    textAlign: 'center', includeFontPadding: false,
  },

  // ── the three still-tap events (group AH) ────────────────────────────────
  //
  // LICENSE: a scratch, not a claim — short unruled marks on the wall's own
  // bare footprint, before beat 4 lays anything there.
  scratch: { position: 'absolute', width: 14, height: 2, backgroundColor: SOFT },
  // NOTBAD: a small tag over the pile, auto-width so it always fits its text.
  noteWrap: { position: 'absolute', left: NOTE_CX - 60, top: NOTE_T, width: 120, alignItems: 'center' },
  note: {
    paddingHorizontal: 6, paddingVertical: 2, borderWidth: 1.5, borderColor: INK,
    borderRadius: 6, backgroundColor: PLATE_FACE, boxShadow: LIP,
  },
  noteText: { fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.5, color: INK,
    includeFontPadding: false,
  },
  // AIMED: two small marks in the gap between the figure and the pile.
  aim: { position: 'absolute', left: AIM_X, fontFamily: 'Inter_700Bold', fontSize: 14, color: INK,
    includeFontPadding: false,
  },

  board: { position: 'absolute', left: BOARD_L, width: BOARD_W, height: BOARD_H },
  boardInner: {
    flex: 1, borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PLATE_FACE, boxShadow: LIP,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 7,
  },
  boardText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.9, color: INK,
    textAlign: 'center', includeFontPadding: false,
  },

  onInk: { color: PAPER },
  pickRight: { backgroundColor: INK, borderColor: INK },
  pickWrong: { borderColor: SOFT },
});

// Ink runs from the top answer board (236) to the ground line (500). Band 230…512.
export function Ethics14Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Ethics14Scene} band={[230, 512]} camera={CAM} />;
}
