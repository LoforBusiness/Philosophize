import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { clamp01, ease01, pose, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './political20Script';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER,
  useHeld, carryFrom, keepHeld, useCarry, carry,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// ─────────────────────────────────────────────────────────────────────────────
// TWO FULL STACKS, THREE CANDIDATES, AND A SHELF WITH ROOM FOR ONE.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · TWO STACKS of four 96×22 blocks, at x 30…126 and x 274…370, tops 244 · 270 ·
//   296 · 322. They are drawn at FULL strength from beat one to the last frame
//   and nothing ever dims them — the lesson is that nobody has to give them up.
// · THE MIDDLE COLUMN is 108 wide at x 146…254 and holds the three candidate
//   reasons, 26 tall, at y 244 · 276 · 308, with a 6-unit gap to the shelf.
// · THE SHELF is the same 108 wide at y 340…368, a 2.5-thick rule along its top
//   at y 340 and its caption inside. It holds exactly one block, which is what
//   makes its narrowness an argument rather than a layout accident.
// · the WINNER drops 32 from its slot onto the shelf when `landed` runs, so the
//   reader sees which of the three went in.
// · the FIGURE walks x 200 → 132 → 268 on GROUND 500; crown ≈ 397, the shelf ends
//   at 368, so 29 units stay clear. The middle column is between the figure's two
//   stops, and the two never share a row.
//
// Ink runs y 232 (the stack captions) … y 500. BAND 226…512 = 286, with the
// 103-unit figure at 36%.
// ─────────────────────────────────────────────────────────────────────────────

const TR = 0.82;

const STACK_X = [30, 274];
const STACK_W = 96;
const BLOCK_H = 22;
const STACK_TOP = [244, 270, 296, 322];
const STACK_CAP = ['HER VIEW OF LIFE', 'HIS VIEW OF LIFE'];
const LEFT_BLOCKS = ['the sacred text', 'a duty to family', 'what her elders held', 'her sense of honour'];
const RIGHT_BLOCKS = ['nothing is sacred', 'a duty to himself', 'what he worked out', 'his sense of freedom'];

const MID_X = 146;
const MID_W = 108;
const CAND_TOP = [244, 276, 308];
const CAND_H = 26;
const CAND_ID = ['safety', 'scripture', 'nature'];
const CAND_TEXT = ['IT IS SAFER', 'MY BOOK SAYS SO', 'IT IS UNNATURAL'];

const SHELF_Y = 340;
const SHELF_H = 28;

const FIG_X = 200;

const X = BEATS.map((b) => b.x ?? FIG_X);
const P = BEATS.map((b) => b.p ?? 0);
const STACKS = BEATS.map((b) => b.stacks ?? 0);
const CANDS = BEATS.map((b) => b.cands ?? 0);
const SHELF = BEATS.map((b) => b.shelf ?? 0);
const LANDED = BEATS.map((b) => b.landed ?? 0);
const LIVE = BEATS.map((b) => b.live ?? 0);

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('political20'));

export default function Political20Scene({ clock, bt, bi, i, picked, onPick }: SceneApi) {
  const heldFig = useHeld();
  const cv = useCarry(5);
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / TR);
    const t = clock.value;

    const figS = keepHeld(heldFig, travelStance(
      X[p], X[n],
      carryFrom(heldFig, n, emoteHold(P[p], t)), emoteHold(P[n], t), emoteLive(P[n], t, bt.value),
      tr, WALK,
    ));

    return {
      fig: pose(figS, carry(cv, 0, n, X[p], X[n], tr), GROUND, K_FIG, 1, 1),
      stacks: carry(cv, 1, n, STACKS[p], STACKS[n], tr),
      cands: carry(cv, 2, n, CANDS[p], CANDS[n], tr),
      shelf: carry(cv, 3, n, SHELF[p], SHELF[n], tr),
      landed: carry(cv, 4, n, LANDED[p], LANDED[n], tr),
      t,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.cards && LIVE[i] === 1;

  const stackStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.stacks }));
  const shelfStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.shelf }));
  const candStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.cands }));
  // Only the winner moves, and only downward onto the shelf.
  const winStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: (SHELF_Y + 1 - CAND_TOP[0]) * SCENE.value.landed }],
  }));

  const rows = [0, 1, 2, 3];

  return (
    <View style={styles.scene}>
      <Animated.View style={[StyleSheet.absoluteFill, stackStyle]} pointerEvents="none">
        {STACK_X.map((sx, side) => (
          <View key={`s${sx}`}>
            <Text style={[styles.stackCap, { left: sx }]}>{STACK_CAP[side]}</Text>
            {rows.map((r) => (
              <View key={r} style={[styles.block, { left: sx, top: STACK_TOP[r] }]}>
                <Text style={styles.blockText} numberOfLines={1}>
                  {(side === 0 ? LEFT_BLOCKS : RIGHT_BLOCKS)[r]}
                </Text>
              </View>
            ))}
          </View>
        ))}
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, shelfStyle]} pointerEvents="none">
        <View style={styles.shelfTop} />
        <View style={styles.shelfBox} />
        <Text style={styles.shelfCap}>WHAT BOTH CAN WEIGH</Text>
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, candStyle]}>
        {CAND_ID.map((id, k) => (
          <Target
            key={id}
            id={id}
            correct={id === 'safety'}
            picked={picked}
            onPick={onPick}
            disabled={!live || answered}
            style={[styles.candHit, { top: CAND_TOP[k] }]}
          >
            <Animated.View style={k === 0 ? winStyle : undefined}>
              <View
                style={[
                  styles.cand,
                  answered && id === 'safety' && styles.candRight,
                  answered && picked === id && id !== 'safety' && styles.candWrong,
                ]}
                pointerEvents="none"
              >
                <Text
                  style={[styles.candText, answered && id === 'safety' && styles.onInk]}
                  numberOfLines={1}
                >
                  {CAND_TEXT[k]}
                </Text>
              </View>
            </Animated.View>
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

  stackCap: {
    position: 'absolute', top: 232, width: STACK_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 7.5, letterSpacing: 1, color: SOFT, includeFontPadding: false,
  },
  block: {
    position: 'absolute', width: STACK_W, height: BLOCK_H,
    borderWidth: 1.5, borderColor: SOFT, borderRadius: 2, backgroundColor: PAPER,
    justifyContent: 'center', paddingHorizontal: 6,
  },
  blockText: {
    fontFamily: 'Inter_400Regular', fontSize: 8, color: INK, includeFontPadding: false,
  },

  shelfTop: { position: 'absolute', left: MID_X, top: SHELF_Y, width: MID_W, height: 2.5, backgroundColor: INK },
  shelfBox: {
    position: 'absolute', left: MID_X, top: SHELF_Y, width: MID_W, height: SHELF_H,
    borderWidth: 1, borderColor: RULE, borderRadius: 2,
  },
  shelfCap: {
    position: 'absolute', left: MID_X, top: SHELF_Y + SHELF_H + 3, width: MID_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 7, letterSpacing: 0.9, color: SOFT, includeFontPadding: false,
  },

  candHit: { position: 'absolute', left: MID_X, width: MID_W, height: CAND_H },
  cand: {
    width: MID_W, height: CAND_H, borderWidth: 2, borderColor: INK, borderRadius: 3,
    backgroundColor: PAPER, alignItems: 'center', justifyContent: 'center',
  },
  candRight: { backgroundColor: INK },
  candWrong: { borderColor: SOFT, opacity: 0.45 },
  candText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.5, letterSpacing: 0.8, color: INK, includeFontPadding: false,
  },
  onInk: { color: PAPER },
});

export function Political20Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Political20Scene} band={[226, 512]} camera={CAM} />;
}
