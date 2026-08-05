import { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import {
  WALK, dirsFrom, ease01, emoteHold, emoteLive, lerp, moveTr, pose, travelStance, type Bundle,
} from './rig';
import { BEATS } from './ethics7Script';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER } from './cinematicKit';
import { cue } from '@/lib/feedback';
import type { SceneApi } from './CinematicPlayer';

// Two roads seen side-on, stacked as horizontal lanes across the UPPER stage, with
// a boxy car on each. Road A's car loops forever (nothing ever happens on it); road
// B's car is beat-driven so it meets the child exactly when the story says it does.
// The narrator walks the ground line below and looks up at them.
//
// ── COMPOSITION / OCCLUSION ────────────────────────────────────────────────────
// The figure WALKS the ground line at y = 500 between x = 90 and x = 300, so its
// body + arms sweep roughly x 42 → 350 and its crown sits near y = 361.
// EVERY prop therefore lives entirely ABOVE y = 350:
//   road A line  y = 112   (car A occupies y  53 → 112)
//   road B line  y = 208   (car B occupies y 149 → 208, child y 176 → 208)
//   impact mark  y 162 → 218
//   verdict row  y 228 → 324
// Nothing is ever drawn in the walk band, so the figure can never cover what it is
// teaching from, and every tap target sits under its own art (no camera transform).

const ROAD_A = 112;
const ROAD_B = 208;
const CAR_W = 56;
const CAR_H = 59;                             // phone + roof + body + wheels
const KID_X = 300;                            // where the child steps into road B
const TICKS = [172, 210, 248, 286, 324, 362]; // kerb hatching under each road

const V_TOP = 262;                            // the verdict row (Q1)
const V_W = 122;
const V_H = 62;
const V_GAP = 7;
const V_L = 10;

const CARDS = [
  { id: 'both', label: 'BOTH EQUALLY RECKLESS', correct: true },
  { id: 'hit', label: 'ONLY THE ONE WHO HIT', correct: false },
  { id: 'none', label: 'NEITHER DID WRONG', correct: false },
];

const P = BEATS.map((b) => b.p ?? 0);
const X = BEATS.map((b) => b.x ?? 170);
const DIR = dirsFrom(X, 1);
const LA = BEATS.map((b) => b.laneA ?? 0);
const LB = BEATS.map((b) => b.laneB ?? 0);
const KD = BEATS.map((b) => b.kid ?? 0);
const HT = BEATS.map((b) => b.hit ?? 0);
const GL = BEATS.map((b) => b.glance ?? 0);
const CB = BEATS.map((b) => b.carB ?? -70);

export default function Ethics7Scene({ clock, bt, bi, i, picked, sound, onPick }: SceneApi) {
  const cur = BEATS[i];
  const prev = i > 0 ? BEATS[i - 1] : undefined;

  // ── the one sound this scene makes for itself ──────────────────────────────
  //
  // The beat that lets luck in strikes the mark on road B, and that is the hinge
  // the whole lesson turns on: up to here the two drivers are identical, and after
  // it one of them is a defendant. It is the only moment in the lesson where
  // something HAPPENS rather than being explained, so it is the only one worth a
  // sound of its own.
  //
  // It is a low struck thud and nothing else — no tyres, no glass, no crunch. The
  // scene draws the collision as an abstract ring, deliberately, and rule A1 runs
  // in both directions: a crash sound would describe a wreck the picture has
  // declined to show and would turn a lesson about apportioning blame into a
  // lesson about a car accident.
  //
  // 260ms in, with the mark. The ring scales up over `grow` (ease01(bt/0.55)) and
  // is most of the way there by then; car B is still travelling and does not reach
  // the child until ~850ms, which is a pre-existing disagreement between the mark
  // and the car. The sound follows the MARK, because the mark is the iconography
  // of the impact and the car is a prop moving toward it.
  const struck = (cur.hit ?? 0) > 0 && (prev?.hit ?? 0) === 0;
  useEffect(() => {
    if (!sound || !struck) return;
    const id = setTimeout(() => cue('impact'), 260);
    return () => clearTimeout(id);
  }, [i, sound, struck]);

  // A prop only fades in on the beat that CHANGES it; otherwise it stays solid, so
  // the stage doesn't re-animate every time the reader taps forward.
  const laneAOn = (cur.laneA ?? 0) > 0;
  const laneBOn = (cur.laneB ?? 0) > 0;
  const kidOn = (cur.kid ?? 0) > 0;
  const hitOn = (cur.hit ?? 0) > 0;
  const glanceOn = (cur.glance ?? 0) > 0;
  const laneAFade = (cur.laneA ?? 0) !== (prev?.laneA ?? 0);
  const laneBFade = (cur.laneB ?? 0) !== (prev?.laneB ?? 0);
  const kidFade = (cur.kid ?? 0) !== (prev?.kid ?? 0);
  const hitFade = (cur.hit ?? 0) !== (prev?.hit ?? 0);
  const glanceFade = (cur.glance ?? 0) !== (prev?.glance ?? 0);

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

    // Road A never stops: one untroubled car after another, wrapping while fully
    // off-stage (-70 → 416) so the loop never pops in view.
    const xa = -70 + ((t * 44) % 486);
    // Road B is beat-driven, so the car reaches the child on the beat that says so.
    const xb = lerp(CB[p], CB[n], tr);

    return {
      fig: pose(s, lerp(X[p], X[n], tr), GROUND, K_FIG, DIR[n], 1),
      laneA: laneAOn ? (laneAFade ? grow : 1) : 0,
      laneB: laneBOn ? (laneBFade ? grow : 1) : 0,
      kid: kidOn ? (kidFade ? grow : 1) : 0,
      hit: hitOn ? (hitFade ? grow : 1) : 0,
      glance: glanceOn ? (glanceFade ? grow : 1) : 0,
      xa,
      xb,
      // Wheels spin off DISTANCE, not time, so a parked car's wheels are still.
      spinA: xa * 9.5,
      spinB: xb * 9.5,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const laneAStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.laneA }));
  const laneBStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.laneB }));
  const carAStyle = useAnimatedStyle(() => ({ transform: [{ translateX: SCENE.value.xa }] }));
  const carBStyle = useAnimatedStyle(() => ({ transform: [{ translateX: SCENE.value.xb }] }));
  const spinAStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${SCENE.value.spinA}deg` }] }));
  const spinBStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${SCENE.value.spinB}deg` }] }));
  const glanceStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.glance,
    transform: [{ translateY: (1 - SCENE.value.glance) * 7 }],
  }));
  const kidStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.kid,
    transform: [{ rotate: `${-15 * SCENE.value.hit}deg` }],
  }));
  const hitStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.hit,
    transform: [{ scale: 0.55 + 0.45 * SCENE.value.hit }],
  }));

  const answered = picked !== null;
  const showPick = (cur.pick ?? 0) > 0 && !!cur.interact;

  return (
    <Animated.View style={styles.scene}>
      {/* ── ROAD A: the empty one. Traffic that never has a problem. ─────────── */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Animated.View style={[StyleSheet.absoluteFill, laneAStyle]} pointerEvents="none">
          <View style={[styles.road, { top: ROAD_A }]} />
          {TICKS.map((tx) => (
            <View key={`a${tx}`} style={[styles.tick, { left: tx, top: ROAD_A + 3 }]} />
          ))}
          <Text style={[styles.laneTag, { top: ROAD_A + 6 }]}>ROAD A  ·  NOTHING COMING</Text>
          <Animated.View style={[styles.car, { top: ROAD_A - CAR_H }, carAStyle]}>
            <Car spin={spinAStyle} glance={glanceStyle} />
          </Animated.View>
        </Animated.View>

        {/* ── ROAD B: same road, same driver, one extra person on it. ────────── */}
        <Animated.View style={[StyleSheet.absoluteFill, laneBStyle]} pointerEvents="none">
          <View style={[styles.road, { top: ROAD_B }]} />
          {TICKS.map((tx) => (
            <View key={`b${tx}`} style={[styles.tick, { left: tx, top: ROAD_B + 3 }]} />
          ))}
          <Text style={[styles.laneTag, { top: ROAD_B + 6 }]}>ROAD B  ·  A CHILD STEPS OUT</Text>
          <Animated.View style={[styles.car, { top: ROAD_B - CAR_H }, carBStyle]}>
            <Car spin={spinBStyle} glance={glanceStyle} />
          </Animated.View>
        </Animated.View>

        {/* the small figure stepping off the kerb, and the mark the car leaves */}
        <View style={styles.kid} pointerEvents="none">
          <Animated.View style={[styles.kidBody, kidStyle]}>
            <View style={styles.kidHead} />
            <View style={styles.kidSpine} />
            <View style={styles.kidArm} />
            <View style={styles.kidLegA} />
            <View style={styles.kidLegB} />
          </Animated.View>
        </View>

        <Animated.View style={[styles.hitMark, hitStyle]} pointerEvents="none">
          <View style={styles.hitOuter} />
          <View style={styles.hitInner} />
        </Animated.View>
      </View>

      {/* ── Q1: three verdict cards, in their own band well above the walk ──── */}
      {showPick && (
        <>
          <View style={styles.vHead} pointerEvents="none">
            <Text style={styles.vTag}>TAP YOUR VERDICT</Text>
            <Text style={styles.vSub}>JUDGE THE CHOICE, NOT THE OUTCOME</Text>
          </View>
          {CARDS.map((c, k) => {
            const chosen = picked === c.id;
            return (
              <Pressable
                key={c.id}
                style={[styles.vCard, { left: V_L + k * (V_W + V_GAP) }]}
                disabled={answered}
                onPress={() => onPick(c.id, c.correct)}
              >
                <View
                  style={[
                    styles.vInner,
                    answered && c.correct && styles.vRight,
                    answered && chosen && !c.correct && styles.vWrong,
                  ]}
                >
                  <Text style={[styles.vText, answered && c.correct && styles.vTextOn]}>{c.label}</Text>
                </View>
              </Pressable>
            );
          })}
        </>
      )}

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />
    </Animated.View>
  );
}

/** One boxy car: phone glowing above the roof, cabin, body, two spinning wheels. */
function Car({ spin, glance }: { spin: any; glance: any }) {
  return (
    <>
      <Animated.View style={[styles.phone, glance]} pointerEvents="none">
        <View style={styles.phoneLine} />
        <View style={styles.phoneLine} />
      </Animated.View>
      <View style={styles.carRoof} pointerEvents="none" />
      <View style={styles.carWin} pointerEvents="none" />
      <View style={styles.carShell} pointerEvents="none" />
      <Animated.View style={[styles.wheel, { left: 8 }, spin]} pointerEvents="none">
        <View style={styles.spoke} />
      </Animated.View>
      <Animated.View style={[styles.wheel, { left: 34 }, spin]} pointerEvents="none">
        <View style={styles.spoke} />
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 20, right: 20, top: GROUND, height: 1.5, backgroundColor: RULE },

  // ── roads ───────────────────────────────────────────────────────────────────
  road: { position: 'absolute', left: 0, right: 0, height: 2, backgroundColor: SOFT },
  tick: { position: 'absolute', width: 1.5, height: 6, backgroundColor: RULE },
  laneTag: {
    position: 'absolute', left: 16,
    fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 1.6, color: SOFT,
    includeFontPadding: false,
  },

  // ── the car (56 × 59, bottom of the wheels sits on the road line) ───────────
  car: { position: 'absolute', left: 0, width: CAR_W, height: CAR_H },
  phone: {
    position: 'absolute', left: 20, top: 0, width: 14, height: 18,
    borderWidth: 2, borderColor: INK, borderRadius: 2.5, backgroundColor: PAPER,
    alignItems: 'center', paddingTop: 3.5,
  },
  phoneLine: { width: 6, height: 1.6, borderRadius: 1, backgroundColor: INK, marginBottom: 2.5 },
  carRoof: {
    position: 'absolute', left: 12, top: 20, width: 32, height: 18,
    borderWidth: 2.5, borderColor: INK, borderRadius: 3, backgroundColor: PAPER,
  },
  carWin: { position: 'absolute', left: 26, top: 25, width: 12, height: 8, borderRadius: 1.5, backgroundColor: RULE },
  // Drawn after the roof so it covers the roof's lower edge — the join reads as a
  // beltline instead of a doubled border.
  carShell: {
    position: 'absolute', left: 0, top: 34, width: CAR_W, height: 18,
    borderWidth: 2.5, borderColor: INK, borderRadius: 3, backgroundColor: PAPER,
  },
  wheel: {
    position: 'absolute', top: 45, width: 14, height: 14, borderRadius: 7,
    borderWidth: 2.5, borderColor: INK, backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center',
  },
  spoke: { width: 2, height: 9, borderRadius: 1, backgroundColor: INK },

  // ── the child stepping into road B ─────────────────────────────────────────
  kid: { position: 'absolute', left: KID_X - 9, top: ROAD_B - 32, width: 18, height: 32 },
  kidBody: { position: 'absolute', left: 0, top: 0, width: 18, height: 32, transformOrigin: '50% 100%' },
  kidHead: {
    position: 'absolute', left: 4.5, top: 0, width: 9, height: 9, borderRadius: 5,
    borderWidth: 2, borderColor: INK, backgroundColor: PAPER,
  },
  kidSpine: { position: 'absolute', left: 8, top: 9, width: 2, height: 12, borderRadius: 1, backgroundColor: INK },
  kidArm: {
    position: 'absolute', left: 1, top: 12, width: 9, height: 2, borderRadius: 1, backgroundColor: INK,
    transformOrigin: '100% 50%', transform: [{ rotate: '-26deg' }],
  },
  kidLegA: {
    position: 'absolute', left: 8, top: 20, width: 2, height: 12, borderRadius: 1, backgroundColor: INK,
    transformOrigin: '50% 0%', transform: [{ rotate: '17deg' }],
  },
  kidLegB: {
    position: 'absolute', left: 8, top: 20, width: 2, height: 12, borderRadius: 1, backgroundColor: INK,
    transformOrigin: '50% 0%', transform: [{ rotate: '-21deg' }],
  },

  // ── the impact mark (a struck ring + its ripple), centred on the contact ───
  hitMark: {
    position: 'absolute', left: 272, top: 162, width: 56, height: 56,
    alignItems: 'center', justifyContent: 'center',
  },
  hitOuter: { position: 'absolute', width: 52, height: 52, borderRadius: 26, borderWidth: 1.5, borderColor: SOFT },
  hitInner: { position: 'absolute', width: 34, height: 34, borderRadius: 17, borderWidth: 2.5, borderColor: INK },

  // ── Q1: the verdict row ────────────────────────────────────────────────────
  vHead: { position: 'absolute', left: 0, top: 228, width: STAGE_W, alignItems: 'center' },
  vTag: { fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 2, color: INK,
    includeFontPadding: false,
  },
  vSub: { fontFamily: 'Inter_500Medium', fontSize: 9, letterSpacing: 1.2, color: SOFT, marginTop: 3,
    includeFontPadding: false,
  },
  vCard: { position: 'absolute', top: V_TOP, width: V_W },
  vInner: {
    height: V_H, borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 7,
  },
  vRight: { backgroundColor: INK, borderColor: INK },
  vWrong: { borderColor: SOFT, opacity: 0.45 },
  vText: {
    fontFamily: 'Inter_700Bold', fontSize: 12, letterSpacing: 0.3, color: INK,
    textAlign: 'center', lineHeight: 16,
    includeFontPadding: false,
  },
  vTextOn: { color: PAPER },
});

// The composition note above already says car A occupies y 53 → 112, so a band that
// started at 96 cut the roof and body off both cars and left only their wheels. The
// diagram (53 → 324) and the figure (361 → 500) together need the whole 49 → 512.
// `walk={X}` is the same x track this scene drives `travelStance` with, handed to
// the player so it can sound a footfall on each foot plant. One figure, default
// seed — which is the case ./footfalls solves for.
export function Ethics7Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Ethics7Scene} band={[49, 512]} walk={X} />;
}
