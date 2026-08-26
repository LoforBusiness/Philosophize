import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { clamp01, ease01, mixStance, pose, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './metaphysics14Script';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER,
  useHeld, carryFrom, keepHeld, useCarry, carry,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// FOUR CLAIMS AND FIVE WORLDS, WITH A MARK WHEREVER A CLAIM SURVIVES (H64). A
// necessary truth is a full row and you can count the gaps in the others.
//
// · the five WORLD columns are 16 wide on a 24 pitch at x 272 / 296 / 320 / 344 /
//   368, headed at y 232…246. The right-hand one ends at x 384.
// · the four CLAIM rows are 166 × 38 at x 96…262, tops y 254 / 300 / 346 / 392.
//   The lowest ends at y 430, seventy above the ground line.
// · a world mark is a 16 × 16 disc centred in its column, on the row's own centre
//   line — so a row reads as a row and a column as a column (A1).
// · the figure stands at x = 44 facing right. Widest ink is a fist at x ≈ 77,
//   nineteen units clear of the claims, and his crown is y 397 — level with the
//   last row and well left of it (D23).
// · highest ink is the column heading at y 232; lowest is the ground at 500.
//
// Band 226…512 = 286, holding one figure at 36% of the frame (check:scale).

const FIG_X = 44;

const HEAD_T = 232;
const CLAIM_L = 96;
const CLAIM_W = 166;
const CLAIM_H = 38;
const CLAIM_T = [254, 300, 346, 392];

const WORLD_L = 272;
const WORLD_PITCH = 24;
const MARK = 16;
const WORLDS = 5;

const CLAIMS = [
  { id: 'triangle', text: 'A TRIANGLE HAS THREE SIDES', holds: [1, 1, 1, 1, 1], correct: false },
  { id: 'water', text: 'WATER IS H₂O', holds: [1, 1, 1, 1, 1], correct: true },
  { id: 'paris', text: 'PARIS IS IN FRANCE', holds: [1, 1, 0, 1, 0], correct: false },
  { id: 'rain', text: 'IT IS RAINING IN LONDON', holds: [1, 0, 0, 0, 0], correct: false },
];

const G = BEATS.map((b) => b.g ?? 0);
const ROWS = BEATS.map((b) => b.rows ?? 0);
const MARKS = BEATS.map((b) => b.marks ?? 0);
const PICKV = BEATS.map((b) => b.pick ?? 0);

const X = BEATS.map((b) => b.x ?? FIG_X);

// R7b — the stage follows the control on its own graded beat, and only there.
// Derived from the beat rather than declared as a channel so it cannot fall out
// of step with the control it is about.
const REACT = BEATS.map((b) => (b.interact?.field ? 1 : 0));
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('metaphysics14'));

export default function Metaphysics14Scene({ clock, bt, bi, i, picked, onPick, dragPos, dragPos2 }: SceneApi) {
  const reacting = REACT[i] === 1;
  const heldS = useHeld();
  const cv = useCarry(3);
  const cur = BEATS[i];

  const live = (cur.pick ?? 0) > 0 && !!cur.interact;
  const answered = picked !== null;

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / 0.7);          // nobody walks; this is a pose blend
    const t = clock.value;
    const grow = ease01(bt.value / 0.9);
    // Marking twenty cells takes a while on purpose — the reader is meant to watch
    // two rows fill and two rows fail to.
    const fill = ease01(bt.value / 1.6);

    const s = keepHeld(heldS, mixStance(
      carryFrom(heldS, n, emoteHold(G[p], t)), emoteLive(G[n], t, bt.value), tr,
    ));
    return {
      fig: pose(s, FIG_X, GROUND, K_FIG, 1, 1),
      rows: carry(cv, 0, n, ROWS[p], ROWS[n], grow),
      // R7b — the pad fills the world marks. Up the y axis, from false in some world
      // to true in every world, the marks beside each claim fill in. The x axis is
      // about the reader rather than the worlds, and it deliberately moves nothing.
      marks: carry(cv, 1, n, MARKS[p], reacting ? dragPos2.value : MARKS[n], fill),
      pick: carry(cv, 2, n, PICKV[p], PICKV[n], grow),
    };
  });

  const D = useDerivedValue<Bundle>(() => SCENE.value.fig);

  return (
    <Animated.View style={styles.scene}>
      <Text style={styles.head} numberOfLines={2}>FIVE WAYS THE WORLD COULD HAVE GONE</Text>

      {CLAIMS.map((c, k) => (
        <Claim key={c.id} k={k} SCENE={SCENE} live={live} answered={answered} picked={picked} onPick={onPick} />
      ))}

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={D} k={K_FIG} />
    </Animated.View>
  );
}

/** One claim and its row of worlds — and one of the Q1 targets. */
function Claim({
  k, SCENE, live, answered, picked, onPick,
}: {
  k: number;
  SCENE: { value: { rows: number; marks: number } };
  live: boolean;
  answered: boolean;
  picked: string | null;
  onPick: (id: string, correct: boolean) => void;
}) {
  const c = CLAIMS[k];
  const on = answered && c.correct;
  const row = useAnimatedStyle(() => {
    const a = clamp01(SCENE.value.rows - k);
    return { opacity: a, transform: [{ translateX: (1 - a) * 12 }] };
  });
  return (
    <>
      <Animated.View style={[styles.claim, { top: CLAIM_T[k] }, row]}>
        <Target id={c.id} correct={c.correct} picked={picked} onPick={onPick}
                style={styles.fill} disabled={!live || answered}>
          <View style={[
            styles.claimInner,
            on && styles.pickRight,
            answered && picked === c.id && !c.correct && styles.pickWrong,
          ]}>
            <Text style={[styles.claimText, on && styles.onInk]} numberOfLines={2}>{c.text}</Text>
          </View>
        </Target>
      </Animated.View>
      {Array.from({ length: WORLDS }, (_, w) => (
        <Mark key={w} k={k} w={w} holds={c.holds[w] === 1} SCENE={SCENE} />
      ))}
    </>
  );
}

/** One world, and whether this claim survives in it. */
function Mark({
  k, w, holds, SCENE,
}: { k: number; w: number; holds: boolean; SCENE: { value: { rows: number; marks: number } } }) {
  const st = useAnimatedStyle(() => {
    const there = clamp01(SCENE.value.rows - k);
    // Marks fill left to right across all four rows at once, so the two full rows
    // and the two patchy ones resolve together.
    const inked = clamp01(SCENE.value.marks * WORLDS - w);
    return { opacity: there * (holds ? inked : there) };
  });
  return (
    <Animated.View
      style={[
        styles.mark,
        holds ? styles.markOn : styles.markOff,
        { left: WORLD_L + w * WORLD_PITCH, top: CLAIM_T[k] + (CLAIM_H - MARK) / 2 },
        st,
      ]}
      pointerEvents="none"
    />
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 16, right: 16, top: GROUND, height: 1.5, backgroundColor: RULE },
  fill: { flex: 1 },

  head: {
    position: 'absolute', left: 180, top: HEAD_T, width: 210,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1, color: SOFT,
    textAlign: 'right', includeFontPadding: false,
  },

  claim: { position: 'absolute', left: CLAIM_L, width: CLAIM_W, height: CLAIM_H },
  claimInner: {
    flex: 1, borderWidth: 2, borderColor: INK, borderRadius: 3, backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 7,
  },
  claimText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 11, letterSpacing: 0.8, color: INK,
    textAlign: 'center', includeFontPadding: false,
  },

  mark: { position: 'absolute', width: MARK, height: MARK, borderRadius: MARK / 2 },
  markOn: { backgroundColor: INK },
  markOff: { borderWidth: 1.5, borderColor: RULE },

  onInk: { color: PAPER },
  pickRight: { backgroundColor: INK, borderColor: INK },
  pickWrong: { borderColor: SOFT, opacity: 0.45 },
});

// Ink runs from the column heading (232) to the ground line (500). Band 226…512.
export function Metaphysics14Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Metaphysics14Scene} band={[226, 512]} camera={CAM} />;
}
