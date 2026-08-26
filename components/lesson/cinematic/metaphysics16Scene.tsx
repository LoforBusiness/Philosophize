import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { clamp01, ease01, mixStance, pose, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './metaphysics16Script';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER,
  useHeld, carryFrom, keepHeld, useCarry, carry,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// TWO PANELS DRAWN IDENTICALLY EXCEPT FOR ONE ARROW (H64). Everything inside them
// is the same object at the same coordinates; only the second-order arrow differs,
// and that is the entire claim.
//
// · the two PANELS are 140 × 196 at x 96 and x 246, y 250…446. The gap between
//   them is 10 and the right one ends at x 386.
// · inside a panel, at panel-relative coordinates: the heading at y 8…22, the
//   SECOND-ORDER arrow at y 40…86, the FIRST-ORDER craving arrow at y 104…150,
//   and the dose box 44 × 30 at y 158…188. Both panels use the same numbers.
// · the second-order arrow points DOWN in the willing panel and UP in the
//   unwilling one — the only difference on the stage (A1).
// · the label sits at y 228…244, the highest ink; the lowest is a panel at 446,
//   fifty-four above the ground line.
// · the figure stands at x = 44 facing right. Widest ink is a fist at x ≈ 77,
//   nineteen units clear of the left panel, and his crown is y 397 — inside the
//   panels' vertical span but well left of both (D23).
//
// Band 222…512 = 290, holding one figure at 36% of the frame (check:scale).

const FIG_X = 44;

const LABEL_T = 228;
const PANEL_L = [96, 246];
const PANEL_W = 140;
const PANEL_T = 250;
const PANEL_H = 196;

const PANELS = [
  { id: 'willing', head: 'WILLING', endorses: true, correct: false },
  { id: 'unwilling', head: 'UNWILLING', endorses: false, correct: true },
];

const G = BEATS.map((b) => b.g ?? 0);
const PANELN = BEATS.map((b) => b.panels ?? 0);
const CRAVE = BEATS.map((b) => b.crave ?? 0);
const SECOND = BEATS.map((b) => b.second ?? 0);
const PICKV = BEATS.map((b) => b.pick ?? 0);

const X = BEATS.map((b) => b.x ?? FIG_X);

// R7b — the stage follows the control on its own graded beat, and only there.
// Derived from the beat rather than declared as a channel so it cannot fall out
// of step with the control it is about.
const REACT = BEATS.map((b) => (b.interact?.lever ? 1 : 0));
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('metaphysics16'));

export default function Metaphysics16Scene({ clock, bt, bi, i, picked, onPick, dragPos }: SceneApi) {
  const reacting = REACT[i] === 1;
  const heldS = useHeld();
  const cv = useCarry(4);
  const cur = BEATS[i];

  const live = (cur.pick ?? 0) > 0 && !!cur.interact;
  const answered = picked !== null;

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
      panels: carry(cv, 0, n, PANELN[p], PANELN[n], grow),
      crave: carry(cv, 1, n, CRAVE[p], CRAVE[n], grow),
      // R7b — the arm raises the second-order arrows. The far setting is exactly the
      // question Frankfurt adds on top of the wanting, so the reader draws it in by
      // arriving at it.
      second: carry(cv, 2, n, SECOND[p], reacting ? dragPos.value : SECOND[n], grow),
      pick: carry(cv, 3, n, PICKV[p], PICKV[n], grow),
    };
  });

  const D = useDerivedValue<Bundle>(() => SCENE.value.fig);

  return (
    <Animated.View style={styles.scene}>
      <Text style={styles.label} numberOfLines={1}>SAME CRAVING · SAME DOSE · SAME CHEMISTRY</Text>

      {PANELS.map((p, k) => (
        <Panel key={p.id} k={k} SCENE={SCENE} live={live} answered={answered} picked={picked} onPick={onPick} />
      ))}

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={D} k={K_FIG} />
    </Animated.View>
  );
}

/** One addict — and one of the Q1 targets. */
function Panel({
  k, SCENE, live, answered, picked, onPick,
}: {
  k: number;
  SCENE: { value: { panels: number; crave: number; second: number } };
  live: boolean;
  answered: boolean;
  picked: string | null;
  onPick: (id: string, correct: boolean) => void;
}) {
  const p = PANELS[k];
  const on = answered && p.correct;
  const box = useAnimatedStyle(() => {
    const a = clamp01(SCENE.value.panels - k);
    return { opacity: a, transform: [{ translateY: (1 - a) * -10 }] };
  });
  const crave = useAnimatedStyle(() => ({ opacity: SCENE.value.crave }));
  const second = useAnimatedStyle(() => ({ opacity: SCENE.value.second }));

  return (
    <Animated.View style={[styles.panel, { left: PANEL_L[k] }, box]}>
      <Target id={p.id} correct={p.correct} picked={picked} onPick={onPick}
              style={styles.fill} disabled={!live || answered}>
        <View style={[
          styles.panelInner,
          on && styles.pickRight,
          answered && picked === p.id && !p.correct && styles.pickWrong,
        ]}>
          <Text style={[styles.head, on && styles.onInk]} numberOfLines={1}>{p.head}</Text>

          {/* THE SECOND-ORDER ARROW — the one thing that differs. */}
          <Animated.View style={[styles.arrowWrap, { top: 40 }, second]} pointerEvents="none">
            <View style={[styles.shaft, on && styles.onInkBg]} />
            <View style={[
              p.endorses ? styles.headDown : styles.headUp,
              { top: p.endorses ? 34 : 0 },
              on && (p.endorses ? styles.headDownOn : styles.headUpOn),
            ]} />
          </Animated.View>
          <Text style={[styles.tag, on && styles.onInk]} numberOfLines={1}>
            {p.endorses ? 'AND HE IS BEHIND IT' : 'AND HE HATES IT'}
          </Text>

          {/* THE CRAVING — identical in both. */}
          <Animated.View style={[styles.arrowWrap, { top: 104 }, crave]} pointerEvents="none">
            <View style={[styles.shaft, on && styles.onInkBg]} />
            <View style={[styles.headDown, { top: 34 }, on && styles.headDownOn]} />
          </Animated.View>

          <View style={[styles.dose, on && styles.doseOn]} pointerEvents="none">
            <Text style={[styles.doseText, on && styles.onInk]} numberOfLines={1}>TAKES IT</Text>
          </View>
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

  panel: { position: 'absolute', top: PANEL_T, width: PANEL_W, height: PANEL_H },
  panelInner: {
    flex: 1, borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
  },
  head: {
    position: 'absolute', left: 0, right: 0, top: 8,
    fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 1.4, color: INK,
    textAlign: 'center', includeFontPadding: false,
  },
  tag: {
    position: 'absolute', left: 0, right: 0, top: 88,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.9, color: SOFT,
    textAlign: 'center', includeFontPadding: false,
  },

  arrowWrap: { position: 'absolute', left: PANEL_W / 2 - 9, width: 18, height: 46 },
  shaft: { position: 'absolute', left: 8, top: 6, width: 3, height: 34, backgroundColor: INK },
  headDown: {
    position: 'absolute', left: 2.5,
    borderLeftWidth: 7, borderRightWidth: 7, borderTopWidth: 11,
    borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: INK,
  },
  headUp: {
    position: 'absolute', left: 2.5,
    borderLeftWidth: 7, borderRightWidth: 7, borderBottomWidth: 11,
    borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: INK,
  },
  headDownOn: { borderTopColor: PAPER },
  headUpOn: { borderBottomColor: PAPER },
  onInkBg: { backgroundColor: PAPER },

  dose: {
    position: 'absolute', left: PANEL_W / 2 - 22, top: 158, width: 44, height: 30,
    borderWidth: 2, borderColor: INK, borderRadius: 3, backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center',
  },
  doseOn: { backgroundColor: INK, borderColor: PAPER },
  doseText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.6, color: INK,
    includeFontPadding: false,
  },

  onInk: { color: PAPER },
  pickRight: { backgroundColor: INK, borderColor: INK },
  pickWrong: { borderColor: SOFT, opacity: 0.45 },
});

// Ink runs from the label (228) to the panels' bottom (446). Band 222…512 = 290.
export function Metaphysics16Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Metaphysics16Scene} band={[222, 512]} camera={CAM} />;
}
