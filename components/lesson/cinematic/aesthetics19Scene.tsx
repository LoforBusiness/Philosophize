import {
  View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import {
  WALK, dirsFrom, ease01, lerp, moveTr, pose, travelStance, type Bundle, } from './rig';
// The whole movement library, not just rig's 49 emotes. Codes under 100 ARE
// rig's and mean exactly what they always did; 100+ reach moves.ts (emoteAny).
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './aesthetics19Script';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, STONE, PAPER, useHeld, carryFrom, keepHeld, facing, useCarry, carry, lookPose,
} from './cinematicKit';
import { followMoves, kindOf, seedOf } from './camera';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';

// A row of ordinary things and a frame that slides along them. Stage right.
//
// · figure WALKS x = 70 → 168 → 124; widest span x 132…204 at 168, fist to 204.5.
//   All row ink is at x ≥ 216.
// · header y 226…238 · items y 254…310 · verdict y 320…350 · ecology card y 356…386
//   · answer row y 400…432.
// · A5 — the row is out of reach (hand tops out at y 411, B11b); read, not handled.
//
// THE FRAME'S X IS THE ONLY THING THE `frame` CHANNEL MOVES, and after beat 2 it
// never changes again. The verdict is driven by a different channel entirely, so
// the reader can see that the thing which moved is not the thing that decided.

const RW_L = 216;
const RW_W = 176;

const HEAD_T = 226;

const ITEM_W = 56;
const ITEM_H = 56;
const ITEM_T = 254;
const ITEM_GAP = 4;
const ITEM_X = [RW_L, RW_L + ITEM_W + ITEM_GAP, RW_L + 2 * (ITEM_W + ITEM_GAP)];

const VER_T = 320;
const VER_H = 30;

const KNOW_T = 356;
const KNOW_H = 30;

const ANS_T = 400;
const ANS_H = 32;
const ANS_GAP = 5;
const ANS_W = (RW_W - 2 * ANS_GAP) / 3;

const ITEMS = ['DRAIN', 'PUDDLE', 'MARSH'];
const VERDICTS = ['', 'UGLY. FLAT. BUGGY.', 'A NURSERY. A FILTER.'];

const ANSWERS = [
  { id: 'know', label: 'KNOWING', correct: true },
  { id: 'view', label: 'THE VIEW', correct: false },
  { id: 'frame', label: 'THE FRAME', correct: false },
];

const P = BEATS.map((b) => b.p ?? 0);
const X = BEATS.map((b) => b.x ?? 124);
// The camera, from the staging: it follows the figure this track describes,
// pulls back to scale 1 on every graded beat so a tap lands where it is aimed,
// and leans in on the quote. See followMoves in ./camera.ts.
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('aesthetics19'));
const DIR = dirsFrom(X, 1);
const ROW = BEATS.map((b) => b.row ?? 0);
const FRAME = BEATS.map((b) => b.frame ?? 0);

// R7b — the stage follows the control on its own graded beat, and only there.
// Derived from the beat rather than declared as a channel so it cannot fall out
// of step with the control it is about.
const REACT = BEATS.map((b) => (b.interact?.drag ? 1 : 0));

export default function Aesthetics19Scene({ clock, bt, bi, i, picked, onPick, dragPos, gazeX, gazeY, gazeOn }: SceneApi) {
  const reacting = REACT[i] === 1;
  const heldS = useHeld();
  const cv = useCarry(3);
  const cur = BEATS[i];
  const prev = i > 0 ? BEATS[i - 1] : undefined;

  const rowFade = (cur.row ?? 0) !== (prev?.row ?? 0);
  const verFade = (cur.verdict ?? 0) !== (prev?.verdict ?? 0);
  const verOn = (cur.verdict ?? 0) > 0;
  const knowOn = (cur.know ?? 0) > 0;
  const knowFade = (cur.know ?? 0) !== (prev?.know ?? 0);

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / moveTr(X[p], X[n], 0.85));
    const t = clock.value;
    const grow = ease01(bt.value / 0.55);

    const s = keepHeld(heldS, travelStance(
      X[p], X[n],
      carryFrom(heldS, n, emoteHold(P[p], t)), emoteHold(P[n], t), emoteLive(P[n], t, bt.value),
      tr, WALK,
    ));
    const f = carry(cv, 0, n, FRAME[p], FRAME[n], tr);
    const slot = Math.max(0, Math.min(2, f - 1));
    return {
      fig: lookPose(s, carry(cv, 1, n, X[p], X[n], tr), GROUND, K_FIG, facing(DIR[p], DIR[n], bt.value), 1, gazeX.value, gazeY.value, gazeOn.value),
      row: carry(cv, 2, n, ROW[p], ROW[n], tr, rowFade ? grow : 1),
      frameOn: f > 0 ? 1 : 0,
      frameX: lerp(ITEM_X[0], ITEM_X[2], slot / 2),
      verdict: verOn ? (verFade ? grow : 1) : 0,
      // R7c — the ecology card IS what the drag asks for. A pretty glance and it slides
      // out; 'knowing what you are looking at' and it is back beside the marsh.
      know: (knowOn ? (knowFade ? grow : 1) : 0) * (reacting ? 1 - (1 - dragPos.value) * tr : 1),
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const rowStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.row }));
  const frameStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.frameOn, left: SCENE.value.frameX }));
  const verStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.verdict }));
  const knowStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.know,
    transform: [{ translateX: (1 - SCENE.value.know) * -10 }],
  }));

  const answered = picked !== null;
  const showPick = (cur.pick ?? 0) > 0 && !!cur.interact;

  return (
    <Animated.View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <Animated.View style={[styles.layer, rowStyle]} pointerEvents="none">
        <Text style={styles.head} numberOfLines={1}>WORTH LOOKING AT?</Text>
        {ITEMS.map((it, k) => (
          <View key={it} style={[styles.item, { left: ITEM_X[k] }]}>
            <Text style={styles.itemText} numberOfLines={1}>{it}</Text>
          </View>
        ))}
      </Animated.View>

      {/* the frame: it points, and that is all it does */}
      <Animated.View style={[styles.frame, frameStyle]} pointerEvents="none" />

      <Animated.View style={[styles.verdict, verStyle]} pointerEvents="none">
        <Text style={styles.verdictText} numberOfLines={1}>{VERDICTS[cur.verdict ?? 0]}</Text>
      </Animated.View>

      <Animated.View style={[styles.know, knowStyle]} pointerEvents="none">
        <Text style={styles.knowText} numberOfLines={1}>NATURAL HISTORY: A HABITAT</Text>
      </Animated.View>

      {showPick &&
        ANSWERS.map((a, k) => {
          const chosen = picked === a.id;
          return (
            <Target id={a.id} correct={a.correct} picked={picked} onPick={onPick}
              key={a.id} style={[styles.ans, { left: RW_L + k * (ANS_W + ANS_GAP) }]} hitSlop={{ top: 6, bottom: 6, left: ANS_GAP / 2, right: ANS_GAP / 2 }} disabled={answered}>
              <View
                style={[
                  styles.ansInner,
                  answered && a.correct && styles.pickRight,
                  answered && chosen && !a.correct && styles.pickWrong,
                ]}
              >
                <Text
                  style={[styles.ansText, answered && a.correct && styles.onInk]}
                  numberOfLines={1}
                >
                  {a.label}
                </Text>
              </View>
            </Target>
          );
        })}

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 24, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },
  // THE FLOOR THE GROUND LINE SITS ON. A rule alone leaves the figure
  // standing on bare page; a filled band under it is what the two lessons
  // the reader holds up both do, and it costs one View.
  floor: { position: 'absolute', left: 0, right: 0, top: GROUND, bottom: 0, backgroundColor: RULE },
  layer: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H },

  head: {
    position: 'absolute', left: RW_L, top: HEAD_T, width: RW_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.4, color: SOFT,
    includeFontPadding: false,
  },
  item: {
    position: 'absolute', top: ITEM_T, width: ITEM_W, height: ITEM_H,
    borderWidth: 1.5, borderColor: SOFT, borderRadius: 3, backgroundColor: STONE,
    alignItems: 'center', justifyContent: 'center',
  },
  itemText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.8, color: INK,
    includeFontPadding: false,
  },
  frame: {
    // NO FILL. Its own comment says "it points, and that is all it does" — and it
    // was drawn after the items with a STONE fill, so it painted over the very
    // tile it was pointing at and buried DRAIN and MARSH underneath. A frame is
    // its edge; the 3-wide ink border is the whole of what makes it read as one.
    position: 'absolute', top: ITEM_T - 5, width: ITEM_W + 10, height: ITEM_H + 10,
    borderWidth: 3, borderColor: INK, borderRadius: 3,
  },

  verdict: {
    position: 'absolute', left: RW_L, top: VER_T, width: RW_W, height: VER_H,
    borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: INK,
    alignItems: 'center', justifyContent: 'center',
  },
  verdictText: {
    fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 0.6, color: PAPER,
    includeFontPadding: false,
  },

  know: {
    position: 'absolute', left: RW_L, top: KNOW_T, width: RW_W, height: KNOW_H,
    borderLeftWidth: 3, borderLeftColor: INK, backgroundColor: PAPER,
    justifyContent: 'center', paddingLeft: 8,
  },
  knowText: {
    fontFamily: 'Inter_500Medium', fontSize: 8.6, letterSpacing: 0.6, color: SOFT,
    includeFontPadding: false,
  },

  ans: { position: 'absolute', top: ANS_T, width: ANS_W },
  ansInner: {
    height: ANS_H, borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: STONE,
    alignItems: 'center', justifyContent: 'center',
  },
  ansText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0, color: INK,
    includeFontPadding: false,
  },
  onInk: { color: PAPER },
  pickRight: { backgroundColor: INK, borderColor: INK },
  pickWrong: { borderColor: SOFT },
});

// Ink runs from the header (226) to the ground line (500). Band 220…512 = 292 (H59).
export function Aesthetics19Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Aesthetics19Scene} band={[220, 512]} camera={CAM} />;
}
