import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { ease01, lerp, mixStance, pose, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './ethics16Script';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER,
  useHeld, carryFrom, keepHeld, useCarry, carry,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// THE SAME HANDOVER TWICE, UNDER THE SAME CHAIN OF CAUSES (H64). One thing differs
// between them and it is at his back.
//
// · the figure stands at x = 128 facing right. Widest ink is a fist at x ≈ 161.
// · the CAUSAL RAIL is nine links 16 across on a 40 pitch, x 30…370 at y 320…336.
//   It is drawn on every beat of the lesson without exception, which is the point.
// · the KNIFE is at his back: blade x 84…104, y 424…430, with a hilt at x 76…86,
//   y 420…434. It is behind him and points right, at him.
// · the MONEY travels x 172 → 258 at y 406…428 — from his hand to the box.
// · the BOX is x 288…356, y 396…500, and its label reads TAKEN or REPAID.
// · the three BOARDS are 116 × 44 at x 20 / 142 / 264, y 258…302, on stage for the
//   graded beat only. Their lowest edge is 302, eighteen above the rail at 320.
// · highest ink is a board at y 258; lowest is the ground at 500. The figure's
//   crown is y 397 — sixty-one below the rail, so nothing crosses his head (D23).
//
// Band 252…512 = 260 would put one figure at 40% of the frame, over check:scale's
// 38%, so the band is 226…512 = 286 and the label at 234 gives the extra rows
// something to hold.

const FIG_X = 128;

const LABEL_T = 234;
const BOARD_T = 258;
const BOARD_H = 44;
const BOARD_W = 116;
const BOARD_X = [20, 142, 264];

const RAIL_T = 320;
const LINK_W = 16;
const LINK_PITCH = 40;
const RAIL_L = 30;
const LINKS = 9;

const MONEY_FROM = 172;
const MONEY_TO = 258;
const MONEY_T = 406;

const BOX_L = 288;
const BOX_W = 68;
const BOX_T = 396;

const BOARDS = [
  { id: 'knife', text: 'THE KNIFE AT HIS BACK', correct: true },
  { id: 'caused', text: 'WHETHER IT WAS CAUSED', correct: false },
  { id: 'act', text: 'WHAT HE ACTUALLY DID', correct: false },
];

const G = BEATS.map((b) => b.g ?? 0);
const CAUSES = BEATS.map((b) => b.causes ?? 0);
const KNIFE = BEATS.map((b) => b.knife ?? 0);
const MONEY = BEATS.map((b) => b.money ?? 0);
const REPAID = BEATS.map((b) => b.repaid ?? 0);
const PICKV = BEATS.map((b) => b.pick ?? 0);

const X = BEATS.map((b) => b.x ?? FIG_X);

// R7b — the stage follows the control on its own graded beat, and only there.
// Derived from the beat rather than declared as a channel so it cannot fall out
// of step with the control it is about.
const REACT = BEATS.map((b) => (b.interact?.drag ? 1 : 0));
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('ethics16'));

export default function Ethics16Scene({ clock, bt, bi, i, picked, onPick, dragPos }: SceneApi) {
  const reacting = REACT[i] === 1;
  const heldS = useHeld();
  const cv = useCarry(4);
  const cur = BEATS[i];

  const live = (cur.pick ?? 0) > 0 && !!cur.interact;
  const answered = picked !== null;
  // The box's word is a JS read, not a track: it is text, and text does not tween.
  const repaid = (cur.repaid ?? 0) > 0;

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / 0.7);          // nobody walks; this is a pose blend
    const t = clock.value;
    const grow = ease01(bt.value / 0.9);

    const s = keepHeld(heldS, mixStance(
      carryFrom(heldS, n, emoteHold(G[p], t)), emoteLive(G[n], t, bt.value), tr,
    ));
    return {
      fig: pose(s, FIG_X, GROUND, K_FIG, 1, 1),
      causes: carry(cv, 0, n, CAUSES[p], CAUSES[n], grow),
      // R7b — the knob takes the knife away. Drag toward BLAME IS UNTOUCHED and the
      // coercion at his back withdraws, which is the compatibilist move made visible:
      // the causes overhead never move, and only the forcing does.
      knife: carry(cv, 1, n, KNIFE[p], reacting ? 1 - dragPos.value : KNIFE[n], grow),
      money: carry(cv, 2, n, MONEY[p], MONEY[n], tr),
      boards: carry(cv, 3, n, PICKV[p], PICKV[n], grow),
    };
  });

  const D = useDerivedValue<Bundle>(() => SCENE.value.fig);

  const rail = useAnimatedStyle(() => ({ opacity: SCENE.value.causes }));
  const knife = useAnimatedStyle(() => ({ opacity: SCENE.value.knife }));
  const money = useAnimatedStyle(() => ({
    opacity: SCENE.value.money > 0 ? 1 : 0,
    transform: [{ translateX: lerp(0, MONEY_TO - MONEY_FROM, SCENE.value.money) }],
  }));

  return (
    <Animated.View style={styles.scene}>
      <Text style={styles.label} numberOfLines={1}>THE CAUSES NEVER CHANGE</Text>

      {BOARDS.map((b, k) => (
        <Board key={b.id} k={k} SCENE={SCENE} live={live} answered={answered} picked={picked} onPick={onPick} />
      ))}

      {/* ── THE CHAIN OF CAUSES, IDENTICAL ON EVERY BEAT ─────────────────── */}
      <Animated.View style={[styles.rail, rail]} pointerEvents="none">
        {Array.from({ length: LINKS }, (_, k) => (
          <View key={k} style={[styles.link, { left: k * LINK_PITCH }]} />
        ))}
      </Animated.View>

      {/* ── THE KNIFE, WHICH DOES ────────────────────────────────────────── */}
      <Animated.View style={[styles.knifeWrap, knife]} pointerEvents="none">
        <View style={styles.hilt} />
        <View style={styles.blade} />
      </Animated.View>

      {/* ── THE MONEY AND WHERE IT GOES ──────────────────────────────────── */}
      <Animated.View style={[styles.money, money]} pointerEvents="none" />
      <View style={styles.box} pointerEvents="none">
        <Text style={styles.boxText} numberOfLines={1}>{repaid ? 'REPAID' : 'TAKEN'}</Text>
      </View>

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={D} k={K_FIG} />
    </Animated.View>
  );
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
    return { opacity: a, transform: [{ translateY: (1 - a) * -10 }] };
  });
  return (
    <Animated.View style={[styles.board, { left: BOARD_X[k] }, st]}>
      <Target id={b.id} correct={b.correct} picked={picked} onPick={onPick}
              style={styles.fill} disabled={!live || answered}>
        <View style={[
          styles.boardInner,
          on && styles.pickRight,
          answered && picked === b.id && !b.correct && styles.pickWrong,
        ]}>
          <Text style={[styles.boardText, on && styles.onInk]} numberOfLines={2}>{b.text}</Text>
        </View>
      </Target>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 16, right: 16, top: GROUND, height: 1.5, backgroundColor: RULE },
  fill: { flex: 1 },

  label: {
    position: 'absolute', left: 20, top: LABEL_T, width: 360,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.2, color: SOFT,
    textAlign: 'center', includeFontPadding: false,
  },

  board: { position: 'absolute', top: BOARD_T, width: BOARD_W, height: BOARD_H },
  boardInner: {
    flex: 1, borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6,
  },
  boardText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.8, color: INK,
    textAlign: 'center', includeFontPadding: false,
  },

  rail: { position: 'absolute', left: RAIL_L, top: RAIL_T, width: STAGE_W, height: 16 },
  link: {
    position: 'absolute', top: 0, width: LINK_W, height: 16, borderRadius: 8,
    borderWidth: 2.5, borderColor: SOFT,
  },

  knifeWrap: { position: 'absolute', left: 76, top: 418, width: 32, height: 18 },
  hilt: { position: 'absolute', left: 0, top: 2, width: 10, height: 14, borderRadius: 2, backgroundColor: INK },
  blade: { position: 'absolute', left: 8, top: 6, width: 22, height: 5, backgroundColor: INK, borderRadius: 1 },

  money: {
    position: 'absolute', left: MONEY_FROM, top: MONEY_T, width: 30, height: 22,
    borderWidth: 2, borderColor: INK, borderRadius: 3, backgroundColor: PAPER,
  },
  box: {
    position: 'absolute', left: BOX_L, top: BOX_T, width: BOX_W, height: 500 - BOX_T,
    borderWidth: 2, borderColor: INK, borderRadius: 3, backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center',
  },
  boxText: {
    fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 1, color: INK,
    includeFontPadding: false,
  },

  onInk: { color: PAPER },
  pickRight: { backgroundColor: INK, borderColor: INK },
  pickWrong: { borderColor: SOFT, opacity: 0.45 },
});

// Ink runs from the label (234) to the ground line (500). Band 226…512 = 286.
export function Ethics16Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Ethics16Scene} band={[226, 512]} camera={CAM} />;
}
