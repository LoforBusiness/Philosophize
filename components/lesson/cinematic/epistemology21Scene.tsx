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
import { BEATS } from './epistemology21Script';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER, useHeld, carryFrom, keepHeld, facing,
} from './cinematicKit';
import { followMoves, kindOf, seedOf } from './camera';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';

// A belief gauge stage right: a track with a needle, and two loading trays beneath
// it. The figure works downstage left.
//
// COMPOSITION, in coordinates:
// · the figure WALKS x = 70 → 168 → 124. Body span x ± 36, widest x 132…204 at 168;
//   the working fist at gesture 41 reaches x 204.5.
// · every part of the gauge is at x ≥ 216, an 11.5-unit clearance at the worst beat.
// · the DOUBT/BELIEF labels y 232…244 · the track y 250…264 · the two trays
//   y 282…344 · the answer row y 358…390. A standing crown is y 397, so all of it
//   sits above the head as well as clear of it.
//
// THE NEEDLE IS DRIVEN BY `ev` AND NOTHING ELSE. Its x is `lerp(NEEDLE_L, NEEDLE_R,
// ev)` — the will tray is not a term in that expression at all. The lesson's claim
// is that effort is not an input, so the source is written so that it is not one.
//
// A5 — DELIBERATE: the gauge sits above the figure's reach (its hand tops out at
// y 411, B11b). It is an instrument being read, not handled (D32); no beat's text
// claims the figure touches a tray.

const GA_L = 216;
const GA_R = 392;
const GA_W = GA_R - GA_L;

const LAB_T = 232;
const TRACK_T = 250;
const TRACK_H = 14;
const NEEDLE_W = 8;
const NEEDLE_L = GA_L + 4;
const NEEDLE_R = GA_R - 4 - NEEDLE_W;

const TRAY_T = 282;
const TRAY_H = 62;
const TRAY_GAP = 8;
const TRAY_W = (GA_W - TRAY_GAP) / 2;

const ANS_T = 358;
const ANS_H = 32;
const ANS_GAP = 5;
const ANS_W = (GA_W - 2 * ANS_GAP) / 3;

// Each answer sits in a ~55-unit card, inner width ~45; the longest measures about
// 37, so every one keeps well over 8% margin on a single line (D30).
const ANSWERS = [
  { id: 'ev', label: 'EVIDENCE', correct: true },
  { id: 'will', label: 'WANTING', correct: false },
  { id: 'try', label: 'TRYING', correct: false },
];

const P = BEATS.map((b) => b.p ?? 0);
const X = BEATS.map((b) => b.x ?? 124);
// The camera, from the staging: it follows the figure this track describes,
// pulls back to scale 1 on every graded beat so a tap lands where it is aimed,
// and leans in on the quote. See followMoves in ./camera.ts.
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('epistemology21'));
const DIR = dirsFrom(X, 1);
const DIALV = BEATS.map((b) => b.dial ?? 0);
const WILLV = BEATS.map((b) => b.will ?? 0);
const EVV = BEATS.map((b) => b.ev ?? 0);

export default function Epistemology21Scene({ clock, bt, bi, i, picked, onPick }: SceneApi) {
  const heldS = useHeld();
  const cur = BEATS[i];
  const prev = i > 0 ? BEATS[i - 1] : undefined;

  const dialFade = (cur.dial ?? 0) !== (prev?.dial ?? 0);

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
    const ev = lerp(EVV[p], EVV[n], grow);
    return {
      fig: pose(s, lerp(X[p], X[n], tr), GROUND, K_FIG, facing(DIR[p], DIR[n], bt.value), 1),
      dial: lerp(DIALV[p], DIALV[n], tr) * (dialFade ? grow : 1),
      will: lerp(WILLV[p], WILLV[n], grow),
      ev,
      // The needle. `will` is deliberately not in this expression.
      needle: lerp(NEEDLE_L, NEEDLE_R, ev),
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const dialStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.dial }));
  const needleStyle = useAnimatedStyle(() => ({ left: SCENE.value.needle }));
  // Each tray fills from the bottom, so "how loaded" is a height rather than a fade.
  const willFill = useAnimatedStyle(() => ({ height: (TRAY_H - 6) * SCENE.value.will }));
  const evFill = useAnimatedStyle(() => ({ height: (TRAY_H - 6) * SCENE.value.ev }));

  const answered = picked !== null;
  const showPick = (cur.pick ?? 0) > 0 && !!cur.interact;

  return (
    <Animated.View style={styles.scene}>
      <Animated.View style={[styles.gauge, dialStyle]} pointerEvents="none">
        <Text style={[styles.end, { left: GA_L, textAlign: 'left' }]} numberOfLines={1}>DOUBT</Text>
        <Text style={[styles.end, { left: GA_L, width: GA_W, textAlign: 'right' }]} numberOfLines={1}>BELIEF</Text>

        <View style={styles.track} />
        <Animated.View style={[styles.needle, needleStyle]} />

        {/* the two inputs */}
        <View style={[styles.tray, { left: GA_L }]}>
          <Animated.View style={[styles.trayFill, willFill]} />
        </View>
        <Text style={[styles.trayLabel, { left: GA_L }]} numberOfLines={1}>WILL</Text>

        <View style={[styles.tray, { left: GA_L + TRAY_W + TRAY_GAP }]}>
          <Animated.View style={[styles.trayFill, evFill]} />
        </View>
        <Text style={[styles.trayLabel, { left: GA_L + TRAY_W + TRAY_GAP }]} numberOfLines={1}>
          EVIDENCE
        </Text>
      </Animated.View>

      {/* ── Q1: which tray moved it ─────────────────────────────────────────── */}
      {showPick &&
        ANSWERS.map((a, k) => {
          const chosen = picked === a.id;
          return (
            <Target id={a.id} correct={a.correct} picked={picked} onPick={onPick}
              key={a.id} style={[styles.ans, { left: GA_L + k * (ANS_W + ANS_GAP) }]} hitSlop={{ top: 6, bottom: 6, left: ANS_GAP / 2, right: ANS_GAP / 2 }} disabled={answered}>
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

  gauge: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H },
  end: {
    position: 'absolute', top: LAB_T, width: GA_W,
    fontFamily: 'Inter_700Bold', fontSize: 8, letterSpacing: 1.2, color: SOFT,
    includeFontPadding: false,
  },
  track: {
    position: 'absolute', left: GA_L, top: TRACK_T, width: GA_W, height: TRACK_H,
    borderWidth: 2, borderColor: INK, borderRadius: 3, backgroundColor: PAPER,
  },
  needle: {
    position: 'absolute', top: TRACK_T - 3, width: NEEDLE_W, height: TRACK_H + 6,
    backgroundColor: INK, borderRadius: 2,
  },

  tray: {
    position: 'absolute', top: TRAY_T, width: TRAY_W, height: TRAY_H,
    borderWidth: 2, borderColor: INK, borderRadius: 3, backgroundColor: PAPER,
    justifyContent: 'flex-end', padding: 3,
  },
  trayFill: { width: '100%', backgroundColor: INK, borderRadius: 1 },
  trayLabel: {
    position: 'absolute', top: TRAY_T + TRAY_H + 4, width: TRAY_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8, letterSpacing: 1.2, color: INK,
    includeFontPadding: false,
  },

  ans: { position: 'absolute', top: ANS_T, width: ANS_W },
  ansInner: {
    height: ANS_H, borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center',
  },
  // 9 rather than the 9.5 its siblings use, with the tracking spent: "EVIDENCE" is
  // eight characters in a 51.3-unit box and at 9.5/0.3 it measured 50.6 — a 1%
  // margin, which under numberOfLines={1} ellipsises rather than wraps. D30 says
  // spend tracking before geometry, and tracking alone only got it to 6%.
  ansText: {
    fontFamily: 'Inter_700Bold', fontSize: 8, letterSpacing: 0, color: INK,
    includeFontPadding: false,
  },
  onInk: { color: PAPER },
  pickRight: { backgroundColor: INK, borderColor: INK },
  pickWrong: { borderColor: SOFT, opacity: 0.45 },
});

// Ink runs from the end labels (232) to the ground line (500). Band 226…512 is 286
// units — inside the 280–300 its siblings occupy, and close to the 280 below which
// cropping buys nothing (H59).
export function Epistemology21Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Epistemology21Scene} band={[226, 512]} camera={CAM} />;
}
