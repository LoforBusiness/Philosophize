import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { BEATS } from './metaphysics2Script';
import {
  WALK, clamp01, ease01, lerp, mixStance, moveTr, pose, strideStance, type Bundle,
} from './rig';
// The whole movement library, not just rig's 49 emotes. Codes under 100 ARE
// rig's and mean exactly what they always did; 100+ reach moves.ts (emoteAny).
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER } from './cinematicKit';
import { followMoves, kindOf, seedOf } from './camera';
import type { SceneApi } from './CinematicPlayer';

// ─────────────────────────────────────────────────────────────────────────────
// THE TWO-WAYS TEST TABLE.
//
// The old stage was a walker and two small signposts, and the whole argument —
// why "what is not" collapses — lived only in the narration. Now the top of the
// stage runs Parmenides' test as a comparison matrix: three questions down the
// side (CAN THINK IT / CAN SAY IT / CAN KNOW IT) and two columns across (IT IS,
// IT IS NOT). Every tick and cross is drawn from Views, so it reads as ink rather
// than as a font glyph that may not exist on the device.
//
// Above the table, the riddle itself in a boxed headline, and Leibniz's principle
// sliding into place under it on his beat.
//
// Below, the ROAD ITSELF now carries the argument. It is drawn solid out to the
// fork at x 306 — the IT IS way, with the solid post standing on it — and beyond
// that it is only a row of dashes, flickering and thinning away with the IT IS NOT
// post and sign as `gone` rises. The way that "is not" is literally a way that
// isn't there: you can see there is nothing to walk on. That is the whole of
// Parmenides' second way in one picture, and it costs no vertical room.
//
// Composition rule: the table stops at y 336; the traveller's crown never rises
// above ~355 (his walk bob is the highest it gets) and he never walks past x 220,
// so his reach stays clear of the IT IS plaque at x 262. The static camera
// transform is gone — the band scales the picture now.
// ─────────────────────────────────────────────────────────────────────────────

const E = BEATS.map((b) => b.e ?? 0);
const X = BEATS.map((b) => b.x ?? 196);
// The camera, from the staging: it follows the figure this track describes,
// pulls back to scale 1 on every graded beat so a tap lands where it is aimed,
// and leans in on the quote. See followMoves in ./camera.ts.
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('metaphysics2'));
const GONE = BEATS.map((b) => b.gone ?? 0);
const PR = BEATS.map((b) => b.pr ?? 0);
const MX = BEATS.map((b) => b.mx ?? 0);

const SIGN_IS_X = 292;
const SIGN_NOT_X = 364;

const MTX_L = 30;
const COL_A = 122;                     // left edge of the IT IS column
const COL_B = 246;                     // left edge of the IT IS NOT column
const HEAD_T = 236;
const ROW_T = [264, 288, 312];
const ROW_H = 24;

const TESTS = ['CAN THINK IT', 'CAN SAY IT', 'CAN KNOW IT'];

// The road forks at x 306. Everything left of it is solid ground the traveller can
// actually walk; everything right of it is drawn only as dashes, and dissolves.
const FORK_X = 306;
const TICKS = [40, 60, 80, 100, 120, 140, 160, 180, 200, 220, 240, 260, 280, 300];
const DASHES = [312, 326, 340, 354, 368];
const GHOST_TICKS = [318, 344, 370];

export default function Metaphysics2Scene({ clock, bt, bi }: SceneApi) {
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / moveTr(X[p], X[n], 0.9));
    const t = clock.value;

    const moving = Math.abs(X[n] - X[p]) > 10;   // he only ever walks toward the fork
    const travS = moving
      ? strideStance(X[p], X[n], emoteLive(E[n], t, bt.value), tr, WALK)
      : mixStance(emoteHold(E[p], t), emoteLive(E[n], t, bt.value), tr);

    return {
      trav: pose(travS, lerp(X[p], X[n], tr), GROUND, K_FIG, 1, 1),
      gone: lerp(GONE[p], GONE[n], tr),
      pr: lerp(PR[p], PR[n], tr),
      mx: lerp(MX[p], MX[n], tr),
      t,
    };
  });

  const DT = useDerivedValue<Bundle>(() => SCENE.value.trav);
  const notSign = useAnimatedStyle(() => {
    const flick = 0.75 + 0.25 * Math.sin(SCENE.value.t * 5.0);
    return { opacity: (1 - SCENE.value.gone) * flick };
  });
  const principle = useAnimatedStyle(() => ({
    opacity: SCENE.value.pr,
    transform: [{ translateX: (1 - SCENE.value.pr) * -14 }],
  }));

  return (
    <Animated.View style={styles.scene} pointerEvents="none">
      {/* ── the riddle, and Leibniz's answer to it ────────────────────────── */}
      <View style={styles.qBox}><Text style={styles.qText}>WHY SOMETHING RATHER THAN NOTHING?</Text></View>
      <Animated.View style={[styles.prStrip, principle]}>
        <Text style={styles.prText}>NOTHING IS WITHOUT A REASON  ·  LEIBNIZ, 1714</Text>
      </Animated.View>

      {/* ── Parmenides' test table ────────────────────────────────────────── */}
      <View style={styles.mtx} />
      <View style={[styles.vRule, { left: COL_A }]} />
      <View style={[styles.vRule, { left: COL_B }]} />
      <View style={[styles.hRule, { top: ROW_T[0] }]} />
      <View style={[styles.hRule, { top: ROW_T[1] }]} />
      <View style={[styles.hRule, { top: ROW_T[2] }]} />

      <View style={styles.headIs}><Text style={styles.headIsText}>IT IS</Text></View>
      <View style={styles.headNot}><Text style={styles.headNotText}>IT IS NOT</Text></View>

      {TESTS.map((label, k) => <TestRow key={label} S={SCENE} k={k} label={label} />)}

      {/* ── the road, the fork and the two posts ──────────────────────────── */}
      <View style={styles.ground} />
      {TICKS.map((x) => <View key={x} style={[styles.roadTick, { left: x }]} />)}
      <View style={styles.forkMark} />

      <View style={styles.postIs} />
      <View style={styles.signIs}><Text style={styles.signIsText}>IT IS</Text></View>

      {/* everything past the fork — the road as well as the post — is only ever
          dashes, and thins to nothing as the second way dissolves */}
      <Animated.View style={[StyleSheet.absoluteFill, notSign]} pointerEvents="none">
        {DASHES.map((x) => <View key={x} style={[styles.roadDash, { left: x }]} />)}
        {GHOST_TICKS.map((x) => <View key={x} style={[styles.ghostTick, { left: x }]} />)}
        <View style={styles.postNot} />
        <View style={styles.signNot}><Text style={styles.signNotText}>IT IS NOT</Text></View>
      </Animated.View>

      <Stickman D={DT} k={K_FIG} />
    </Animated.View>
  );
}

/** One test question, with its verdict in each column. */
function TestRow({ S, k, label }: { S: SharedValue<any>; k: number; label: string }) {
  const mark = useAnimatedStyle(() => {
    const e = ease01(clamp01(S.value.mx - k));
    return { opacity: e, transform: [{ scale: 0.55 + 0.45 * e }] };
  });
  return (
    <>
      <Text style={[styles.testLabel, { top: ROW_T[k] + 5 }]}>{label}</Text>
      <Animated.View style={[styles.markBox, { left: COL_A + 51, top: ROW_T[k] + 1 }, mark]}>
        <View style={[styles.strokeInk, { left: 3, top: 12, width: 9, transform: [{ rotate: '45deg' }] }]} />
        <View style={[styles.strokeInk, { left: 8, top: 10, width: 15, transform: [{ rotate: '-45deg' }] }]} />
      </Animated.View>
      <Animated.View style={[styles.markBox, { left: COL_B + 51, top: ROW_T[k] + 1 }, mark]}>
        <View style={[styles.strokeSoft, { left: 2, top: 9.8, width: 18, transform: [{ rotate: '45deg' }] }]} />
        <View style={[styles.strokeSoft, { left: 2, top: 9.8, width: 18, transform: [{ rotate: '-45deg' }] }]} />
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 24, width: FORK_X - 24, top: GROUND, height: 1.5, backgroundColor: RULE },
  roadTick: { position: 'absolute', top: GROUND + 2, width: 1.5, height: 5, backgroundColor: RULE },
  // the fork: a short kerb mark where solid ground stops
  forkMark: { position: 'absolute', left: FORK_X, top: GROUND - 7, width: 1.5, height: 9, backgroundColor: RULE },
  // the second way, drawn only as dashes — a road you can see there is none of
  roadDash: { position: 'absolute', top: GROUND, width: 10, height: 1.5, backgroundColor: SOFT },
  ghostTick: { position: 'absolute', top: GROUND + 2, width: 1.5, height: 5, backgroundColor: RULE },

  qBox: {
    position: 'absolute', left: 40, top: 178, width: 320, height: 28,
    borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center',
  },
  qText: {
    fontFamily: 'Inter_700Bold', fontSize: 12.5, lineHeight: 16, letterSpacing: 0.4, color: INK,
    includeFontPadding: false,
  },
  prStrip: {
    position: 'absolute', left: 40, top: 212, width: 320, height: 20,
    borderLeftWidth: 3, borderLeftColor: INK, paddingLeft: 9, justifyContent: 'center',
  },
  prText: {
    fontFamily: 'Inter_700Bold', fontSize: 10, lineHeight: 13, letterSpacing: 0.8, color: SOFT,
    includeFontPadding: false,
  },

  mtx: {
    position: 'absolute', left: MTX_L, top: HEAD_T, width: 340, height: 100,
    borderWidth: 1.5, borderColor: RULE, borderRadius: 3, backgroundColor: PAPER,
  },
  vRule: { position: 'absolute', top: HEAD_T, height: 100, width: 1, backgroundColor: RULE },
  hRule: { position: 'absolute', left: MTX_L, width: 340, height: 1, backgroundColor: RULE },

  headIs: {
    position: 'absolute', left: COL_A + 8, top: HEAD_T + 2, width: 108, height: 24,
    backgroundColor: INK, borderRadius: 3, alignItems: 'center', justifyContent: 'center',
  },
  headIsText: {
    fontFamily: 'Inter_700Bold', fontSize: 13, lineHeight: 17, letterSpacing: 1, color: PAPER,
    includeFontPadding: false,
  },
  headNot: {
    position: 'absolute', left: COL_B + 8, top: HEAD_T + 2, width: 108, height: 24,
    borderWidth: 1.5, borderColor: SOFT, borderStyle: 'dashed', borderRadius: 3,
    alignItems: 'center', justifyContent: 'center',
  },
  headNotText: {
    fontFamily: 'Inter_700Bold', fontSize: 11.5, lineHeight: 15, letterSpacing: 0.6, color: SOFT,
    includeFontPadding: false,
  },

  testLabel: {
    position: 'absolute', left: MTX_L, width: 88, textAlign: 'right',
    fontFamily: 'Inter_700Bold', fontSize: 11.5, lineHeight: 15, color: INK,
    includeFontPadding: false,
  },
  markBox: { position: 'absolute', width: 22, height: 22 },
  strokeInk: { position: 'absolute', height: 2.4, borderRadius: 1.2, backgroundColor: INK },
  strokeSoft: { position: 'absolute', height: 2.4, borderRadius: 1.2, backgroundColor: SOFT },

  postIs: { position: 'absolute', left: SIGN_IS_X - 1.5, top: 412, width: 3, height: GROUND - 412, backgroundColor: INK },
  signIs: {
    position: 'absolute', left: SIGN_IS_X - 30, top: 386, width: 60, height: 26,
    borderWidth: 2, borderColor: INK, borderRadius: 3, backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center',
  },
  signIsText: {
    fontFamily: 'Inter_700Bold', fontSize: 13, lineHeight: 17, letterSpacing: 1, color: INK,
    includeFontPadding: false,
  },

  postNot: { position: 'absolute', left: SIGN_NOT_X - 1, top: 436, width: 2, height: GROUND - 436, backgroundColor: SOFT },
  signNot: {
    position: 'absolute', left: SIGN_NOT_X - 34, top: 410, width: 68, height: 26,
    borderWidth: 1.5, borderColor: SOFT, borderStyle: 'dashed', borderRadius: 3,
    alignItems: 'center', justifyContent: 'center',
  },
  // 11 / 0.4, not 11.5 / 0.6: "IT IS NOT" measures ~62 units at the larger setting
  // inside a 65-unit interior, and a wrap would put a second line outside the
  // 26-tall plate. This keeps one comfortable line with room to spare.
  signNotText: {
    fontFamily: 'Inter_700Bold', fontSize: 11, lineHeight: 14.5, letterSpacing: 0.4, color: SOFT,
    includeFontPadding: false,
  },
});

// BAND. Topmost ink is the riddle box at y 178; the lowest is the road's distance
// ticks, which end at GROUND + 7 = 507. The table stops at 336, the traveller's
// crown reaches ~355 mid-stride, and both signposts sit between 386 and 500.
export function Metaphysics2Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Metaphysics2Scene} band={[172, 512]} camera={CAM} />;
}
