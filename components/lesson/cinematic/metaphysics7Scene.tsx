import {
  View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import {
  WALK, dirsFrom, ease01, lerp, moveTr, pose, travelStance, type Bundle, } from './rig';
// The whole movement library, not just rig's 49 emotes. Codes under 100 ARE
// rig's and mean exactly what they always did; 100+ reach moves.ts (emoteAny).
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './metaphysics7Script';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER, useHeld, carryFrom, keepHeld, facing,
} from './cinematicKit';
import { followMoves, kindOf, seedOf } from './camera';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';

// A timeline strung across the top of the stage, and a figure that WALKS it.
//
// COMPOSITION / OCCLUSION CONTRACT
//   · The figure walks the ground line at GROUND=500, standing at x = 70 (under
//     PAST), 200 (under NOW) and 330 (under FUTURE). At K_FIG=1.0 that figure is
//     103 units tall (crown at y=397) and spans about x±36.
//   · EVERY prop lives ABOVE y = 390: the question label at y=140, the rule line at
//     y=190, the three slices at y=208–272, the travelling spotlight at y=200–290,
//     and the ALL THREE target at y=318–362. Nothing the reader must read or tap is
//     ever behind the walker.
//
// Only the beat that CHANGES a prop animates it (the `lineFade` pattern), so the
// timeline does not redraw itself every time the reader taps forward.

const SLOT_X = [70, 200, 330];             // slice centres == the figure's stations
const BOX_W = 120;                         // ≥ 120 wide / 64 tall: a real tap target
const BOX_H = 64;
const BOX_L = SLOT_X.map((c) => c - BOX_W / 2);   // 10 · 140 · 270

// The whole timeline sits 40 units lower than it first did. It was laid out against
// a K_FIG=1.35 figure whose crown reached y=361; at 1.0 the crown drops to 397, so
// the gap between the ALL THREE target and the walker's head had grown to 75 empty
// rows — a measured 71-row band of nothing through the middle of the picture. That
// dead height was also charged to the crop: the band had to be 420 tall, which made
// this lesson HEIGHT-limited and rendered it at 0.75 with a side letterbox while its
// siblings ran at 0.90. Dropping the diagram lets the band close to 378 and the
// scene render at 0.83. 40 (not 60) keeps the ALL THREE box's underside at 362,
// leaving 35 units of clearance so a pointing hand never reaches it.
const RULE_T = 190;                        // the horizontal arrow of time
const STEM_T = 192;
const BOX_T = 208;
const RING_W = 136;
const RING_H = 84;
const RING_T = 200;                        // 8 units of air around the slice it lights
const ALL_T = 318;
const ALL_W = 240;
const ALL_L = (STAGE_W - ALL_W) / 2;

const SLICES = [
  { id: 'past', label: 'PAST', sub: 'yesterday' },
  { id: 'now', label: 'NOW', sub: 'this second' },
  { id: 'future', label: 'FUTURE', sub: 'tomorrow' },
];

const P = BEATS.map((b) => b.p ?? 0);
const X = BEATS.map((b) => b.x ?? 70);
// The camera, from the staging: it follows the figure this track describes,
// pulls back to scale 1 on every graded beat so a tap lands where it is aimed,
// and leans in on the quote. See followMoves in ./camera.ts.
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('metaphysics7'));
const DIR = dirsFrom(X, 1);
const LINE = BEATS.map((b) => b.line ?? 0);
const SOLID = BEATS.map((b) => b.solid ?? 0);
const SPOT = BEATS.map((b) => b.spot ?? 0);

export default function Metaphysics7Scene({ clock, bt, bi, i, picked, onPick }: SceneApi) {
  const heldS = useHeld();
  const cur = BEATS[i];
  const prev = i > 0 ? BEATS[i - 1] : undefined;

  // The timeline draws itself once, on the beat that introduces it.
  const lineFade = (cur.line ?? 0) !== (prev?.line ?? 0);

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
    const fx = lerp(X[p], X[n], tr);
    return {
      fig: pose(s, fx, GROUND, K_FIG, facing(DIR[p], DIR[n], bt.value), 1),
      fx,
      line: lerp(LINE[p], LINE[n], tr) * (lineFade ? grow : 1),
      solid: lerp(SOLID[p], SOLID[n], tr),
      spot: lerp(SPOT[p], SPOT[n], tr),
      t,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const lineStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.line }));
  // The spotlight rides the figure: it IS wherever they are standing.
  const ringStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.spot * SCENE.value.line,
    transform: [{ translateX: SCENE.value.fx - RING_W / 2 }],
  }));

  const answered = picked !== null;
  const showPick = (cur.pick ?? 0) > 0 && !!cur.interact;

  return (
    <Animated.View style={styles.scene}>
      {/* ── the arrow of time, its end caps and the stems the slices hang on ─── */}
      <Animated.View style={[styles.rule, lineStyle]} pointerEvents="none" />
      <Animated.View style={[styles.capL, lineStyle]} pointerEvents="none" />
      <Animated.View style={[styles.capR, lineStyle]} pointerEvents="none" />
      {SLOT_X.map((c) => (
        <Animated.View key={`stem-${c}`} style={[styles.stem, { left: c - 1 }, lineStyle]} pointerEvents="none" />
      ))}
      <Animated.View style={[styles.edgeL, lineStyle]} pointerEvents="none">
        <Text style={styles.edgeText}>EARLIER</Text>
      </Animated.View>
      <Animated.View style={[styles.edgeR, lineStyle]} pointerEvents="none">
        <Text style={styles.edgeText}>LATER</Text>
      </Animated.View>

      {/* ── the three slices: outlined ghosts until a beat inks them in ──────── */}
      {SLICES.map((s, k) => (
        <Slice
          key={s.id}
          S={SCENE}
          k={k}
          label={s.label}
          sub={s.sub}
          live={showPick && !answered}
          dim={showPick && answered && picked === s.id}
          onPress={() => onPick(s.id, false)}
        />
      ))}

      {/* ── the travelling "your now" spotlight ──────────────────────────────── */}
      <Animated.View style={[styles.ringWrap, ringStyle]} pointerEvents="none">
        <View style={styles.ring} />
        <Text style={styles.ringLabel}>YOUR NOW</Text>
      </Animated.View>

      {/* ── Q1: answered on the timeline itself ──────────────────────────────── */}
      {showPick && (
        <>
          <View style={styles.pickLabelWrap} pointerEvents="none">
            <Text style={styles.pickLabel}>WHICH MOMENTS ARE REAL?  TAP ONE</Text>
          </View>
          <Target id={'all'} correct={true} picked={picked} onPick={onPick}
              style={styles.allWrap} disabled={answered}>
            <View style={[styles.allBox, answered && styles.allRight]}>
              <Text style={[styles.allText, answered && styles.allTextOn]}>ALL THREE</Text>
              <Text style={[styles.allSub, answered && styles.allSubOn]}>past · now · future</Text>
            </View>
          </Target>
        </>
      )}

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />
    </Animated.View>
  );
}

/**
 * One slice of the timeline. The outlined ghost is always there; an INK fill layer
 * crossfades over it — permanently for NOW (presentism's single lit moment) and,
 * on the eternalism beat, for PAST and FUTURE too.
 */
function Slice({
  S, k, label, sub, live, dim, onPress,
}: {
  S: SharedValue<any>;
  k: number;
  label: string;
  sub: string;
  live: boolean;
  dim: boolean;
  onPress: () => void;
}) {
  const wrap = useAnimatedStyle(() => ({ opacity: S.value.line * (dim ? 0.45 : 1) }));
  const fill = useAnimatedStyle(() => ({ opacity: k === 1 ? 1 : S.value.solid }));
  return (
    <Animated.View
      style={[styles.sliceWrap, { left: BOX_L[k] }, wrap]}
      pointerEvents={live ? 'auto' : 'none'}
    >
      <Pressable style={styles.slice} disabled={!live} onPress={onPress}>
        <Text style={styles.sliceLabel}>{label}</Text>
        <Text style={styles.sliceSub}>{sub}</Text>
        <Animated.View style={[styles.sliceFill, fill]} pointerEvents="none">
          <Text style={styles.sliceLabelOn}>{label}</Text>
          <Text style={styles.sliceSubOn}>{sub}</Text>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 24, right: 24, top: GROUND, height: 1.5, backgroundColor: RULE },

  rule: { position: 'absolute', left: 8, right: 8, top: RULE_T, height: 2, backgroundColor: INK },
  // CSS border triangles — the two heads of the arrow of time.
  capL: {
    position: 'absolute', left: 8, top: RULE_T - 5, width: 0, height: 0,
    borderTopWidth: 6, borderBottomWidth: 6, borderRightWidth: 9,
    borderTopColor: 'transparent', borderBottomColor: 'transparent', borderRightColor: INK,
  },
  capR: {
    position: 'absolute', left: 383, top: RULE_T - 5, width: 0, height: 0,
    borderTopWidth: 6, borderBottomWidth: 6, borderLeftWidth: 9,
    borderTopColor: 'transparent', borderBottomColor: 'transparent', borderLeftColor: INK,
  },
  stem: { position: 'absolute', top: STEM_T, width: 2, height: 16, backgroundColor: SOFT },
  edgeL: { position: 'absolute', left: 12, top: 168 },
  edgeR: { position: 'absolute', right: 12, top: 168 },
  edgeText: { fontFamily: 'Inter_700Bold', fontSize: 8.5, letterSpacing: 1.6, color: SOFT,
    includeFontPadding: false,
  },

  sliceWrap: { position: 'absolute', top: BOX_T, width: BOX_W, height: BOX_H },
  slice: {
    width: BOX_W, height: BOX_H,
    borderWidth: 2, borderColor: SOFT, borderRadius: 5, backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center',
  },
  // Insets by the border width so an inked slice reads as one solid block.
  sliceFill: {
    position: 'absolute', left: -2, top: -2, right: -2, bottom: -2,
    borderRadius: 5, backgroundColor: INK,
    alignItems: 'center', justifyContent: 'center',
  },
  sliceLabel: { fontFamily: 'Inter_700Bold', fontSize: 14, letterSpacing: 1.2, color: SOFT,
    includeFontPadding: false,
  },
  sliceSub: { fontFamily: 'Inter_400Regular', fontSize: 9.5, letterSpacing: 0.4, color: SOFT, marginTop: 3,
    includeFontPadding: false,
  },
  sliceLabelOn: { fontFamily: 'Inter_700Bold', fontSize: 14, letterSpacing: 1.2, color: PAPER,
    includeFontPadding: false,
  },
  sliceSubOn: { fontFamily: 'Inter_400Regular', fontSize: 9.5, letterSpacing: 0.4, color: RULE, marginTop: 3,
    includeFontPadding: false,
  },

  ringWrap: { position: 'absolute', left: 0, top: RING_T, width: RING_W, height: RING_H + 26 },
  ring: {
    position: 'absolute', left: 0, top: 0, width: RING_W, height: RING_H,
    borderWidth: 2.5, borderColor: INK, borderRadius: 10,
  },
  ringLabel: {
    position: 'absolute', left: 0, top: RING_H + 6, width: RING_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.5, letterSpacing: 1.6, color: SOFT,
    includeFontPadding: false,
  },

  pickLabelWrap: { position: 'absolute', left: 0, top: 140, width: STAGE_W },
  pickLabel: {
    width: STAGE_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.5, color: INK,
    includeFontPadding: false,
  },
  allWrap: { position: 'absolute', left: ALL_L, top: ALL_T, width: ALL_W },
  allBox: {
    height: 44, borderWidth: 2, borderColor: INK, borderRadius: 5, backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center',
  },
  allRight: { backgroundColor: INK, borderColor: INK },
  allText: { fontFamily: 'Inter_700Bold', fontSize: 14, letterSpacing: 1.2, color: INK,
    includeFontPadding: false,
  },
  allTextOn: { color: PAPER },
  allSub: { fontFamily: 'Inter_400Regular', fontSize: 9.5, letterSpacing: 0.4, color: SOFT, marginTop: 2,
    includeFontPadding: false,
  },
  allSubOn: { color: RULE },
});

export function Metaphysics7Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Metaphysics7Scene} band={[134, 512]} camera={CAM} />;
}
