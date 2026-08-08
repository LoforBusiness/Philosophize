import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import {
  WALK, dirsFrom, ease01, lerp, moveTr, pose, travelStance, type Bundle,
} from './rig';
// The whole movement library, not just rig's 49 emotes. Codes under 100 ARE
// rig's and mean exactly what they always did; 100+ reach moves.ts (emoteAny).
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './aesthetics16Script';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER } from './cinematicKit';
import { followMoves, kindOf, seedOf } from './camera';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';

// One canvas on a wall, stage right, with a rail of biographical cards filling in
// underneath it.
//
// COMPOSITION, in coordinates:
// · the figure WALKS x = 70 → 168 → 124. Body span x ± 36, widest x 132…204 at 168;
//   the working fist at gesture 41 reaches x 204.5.
// · every piece of wall ink lives at x ≥ 214, so the clearance from the figure is
//   at least 9.5 units at the very worst beat and 18 at the resting mark.
// · canvas y 226…316 · rail cards y 324…408 on a 30 pitch · the answer row y
//   420…452. A standing crown is y 397 and the answer row sits below it, but at
//   x 214…392 where the figure never goes.
//
// THE CANVAS IS DECLARED ONCE AND NEVER TOUCHED AGAIN. Nothing in this file
// animates it after the hang — no opacity, no transform, no conditional style. The
// lesson's whole claim is that the work does not change, so the source is written
// so that it cannot.
//
// A5 — DELIBERATE: the wall is above the figure's reach (hand tops out at y 411,
// B11b). It reads the label; it never handles it (D32).

const RAIL_L = 214;
const RAIL_R = 392;
const RAIL_W = RAIL_R - RAIL_L;

const CANVAS_W = 124;
const CANVAS_L = RAIL_L + (RAIL_W - CANVAS_W) / 2;
const CANVAS_T = 226;
const CANVAS_H = 90;

const FACT_T = 324;
const FACT_H = 24;
const FACT_PITCH = 30;

const ANS_T = 420;
const ANS_H = 32;
const ANS_GAP = 5;
const ANS_W = (RAIL_W - 2 * ANS_GAP) / 3;

// Three bars inside the canvas — the painting, such as it is. Fixed widths, drawn
// once, never conditional on a beat.
const BARS = [0.78, 0.52, 0.66];

const FACTS = [
  'TOOK A PATRON HE DESPISED',
  'LIED ABOUT WHO SAT FOR IT',
  'LEFT HIS FAMILY IN DEBT',
];

// Short by necessity: each sits in a 56-unit card whose inner width is 46, so the
// longest of these measures about 38 and keeps ~17% margin (D30).
const ANSWERS = [
  { id: 'nothing', label: 'NOTHING', correct: true },
  { id: 'mark', label: 'A MARK', correct: false },
  { id: 'hue', label: 'THE HUE', correct: false },
];

const P = BEATS.map((b) => b.p ?? 0);
const X = BEATS.map((b) => b.x ?? 124);
// The camera, from the staging: it follows the figure this track describes,
// pulls back to scale 1 on every graded beat so a tap lands where it is aimed,
// and leans in on the quote. See followMoves in ./camera.ts.
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('aesthetics16'));
const DIR = dirsFrom(X, 1);
const CANV = BEATS.map((b) => b.canvas ?? 0);
const NFACTS = BEATS.map((b) => b.facts ?? 0);

export default function Aesthetics16Scene({ clock, bt, bi, i, picked, onPick }: SceneApi) {
  const cur = BEATS[i];
  const prev = i > 0 ? BEATS[i - 1] : undefined;

  const canvFade = (cur.canvas ?? 0) !== (prev?.canvas ?? 0);
  const shownFacts = cur.facts ?? 0;
  const prevFacts = prev?.facts ?? 0;

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / moveTr(X[p], X[n], 0.85));
    const t = clock.value;
    const grow = ease01(bt.value / 0.55);

    const s = travelStance(
      X[p], X[n],
      emoteHold(P[p], t), emoteHold(P[n], t), emoteLive(P[n], t, bt.value),
      tr, WALK,
    );
    return {
      fig: pose(s, lerp(X[p], X[n], tr), GROUND, K_FIG, DIR[n], 1),
      canvas: lerp(CANV[p], CANV[n], tr) * (canvFade ? grow : 1),
      // How far the rail has filled, as a card count that can be fractional mid-blend.
      fill: lerp(NFACTS[p], NFACTS[n], grow),
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const canvasStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.canvas }));

  const answered = picked !== null;
  const showPick = (cur.pick ?? 0) > 0 && !!cur.interact;

  return (
    <Animated.View style={styles.scene}>
      {/* ── the work: hung once, never edited again ─────────────────────────── */}
      <Animated.View style={[styles.canvas, canvasStyle]} pointerEvents="none">
        {BARS.map((w, k) => (
          <View key={k} style={[styles.bar, { width: (CANVAS_W - 30) * w }]} />
        ))}
      </Animated.View>

      {/* ── the rail: everything that DOES change ───────────────────────────── */}
      {FACTS.map((f, k) => (
        <FactCard key={f} index={k} label={f} shown={shownFacts} prevShown={prevFacts} SCENE={SCENE} />
      ))}

      {/* ── Q2: tap what changed on the canvas ──────────────────────────────── */}
      {showPick &&
        ANSWERS.map((a, k) => {
          const chosen = picked === a.id;
          return (
            <Target id={a.id} correct={a.correct} picked={picked} onPick={onPick}
              key={a.id} style={[styles.ans, { left: RAIL_L + k * (ANS_W + ANS_GAP) }]} hitSlop={{ top: 6, bottom: 6, left: ANS_GAP / 2, right: ANS_GAP / 2 }} disabled={answered}>
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

/** One card on the biography rail. Fades in on the beat that adds it and then holds. */
function FactCard({
  index, label, shown, prevShown, SCENE,
}: {
  index: number; label: string; shown: number; prevShown: number;
  SCENE: { value: { fill: number } };   // a read-only view of the scene frame — DerivedValue<T> is invariant, so a narrowed DerivedValue does not accept the wider one
}) {
  // Already up before this beat → hold solid. Arriving on this beat → ride the
  // rail's fill so it draws on. Not yet → nothing (C20c).
  const held = index < prevShown;
  const arriving = index >= prevShown && index < shown;
  const st = useAnimatedStyle(() => {
    if (held) return { opacity: 1, transform: [{ translateX: 0 }] };
    if (!arriving) return { opacity: 0, transform: [{ translateX: -8 }] };
    const a = Math.max(0, Math.min(1, SCENE.value.fill - index));
    return { opacity: a, transform: [{ translateX: (1 - a) * -8 }] };
  });
  return (
    <Animated.View style={[styles.fact, { top: FACT_T + index * FACT_PITCH }, st]} pointerEvents="none">
      <Text style={styles.factText} numberOfLines={1}>{label}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 24, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },

  canvas: {
    position: 'absolute', left: CANVAS_L, top: CANVAS_T, width: CANVAS_W, height: CANVAS_H,
    borderWidth: 3, borderColor: INK, borderRadius: 3, backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center', gap: 10,
  },
  bar: { height: 8, backgroundColor: INK, borderRadius: 1 },

  fact: {
    position: 'absolute', left: RAIL_L, width: RAIL_W, height: FACT_H,
    borderLeftWidth: 3, borderLeftColor: INK, backgroundColor: PAPER,
    justifyContent: 'center', paddingLeft: 8,
  },
  factText: {
    fontFamily: 'Inter_500Medium', fontSize: 8.5, letterSpacing: 0.6, color: SOFT,
    includeFontPadding: false,
  },

  ans: { position: 'absolute', top: ANS_T, width: ANS_W },
  ansInner: {
    height: ANS_H, borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center',
  },
  // 9/0 rather than 9.5/0.3: these chips are ~52 units of inner width on ONE line,
  // so the whole string must fit, not its longest word. The house size for a
  // three-across answer row (D30).
  ansText: {
    fontFamily: 'Inter_700Bold', fontSize: 8, letterSpacing: 0, color: INK,
    includeFontPadding: false,
  },
  onInk: { color: PAPER },
  pickRight: { backgroundColor: INK, borderColor: INK },
  pickWrong: { borderColor: SOFT, opacity: 0.45 },
});

// Ink runs from the canvas top (226) to the ground line (500). Band 220…512 is 292
// units, inside the 280–300 its siblings occupy (H59).
export function Aesthetics16Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Aesthetics16Scene} band={[220, 512]} camera={CAM} />;
}
