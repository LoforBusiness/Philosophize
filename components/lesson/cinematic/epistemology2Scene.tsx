import {
  View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { BEATS } from './epistemology2Script';
import {
  clamp01, ease01, lerp, mixStance, pose, type Bundle, } from './rig';
// See ethics2Scene: identity for codes under 100, and it opens the catalogue.
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, STONE, SOFT, RULE, PAPER, useHeld, carryFrom, keepHeld, useCarry, carry,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import { followMoves, kindOf, seedOf } from './camera';

// ─────────────────────────────────────────────────────────────────────────────
// THE DOUBT AUDIT.
//
// The old stage was two figures, a halo and five 14px dots — the dots were meant
// to be "beliefs the demon can counterfeit", but at that size they read as specks.
// The same idea now runs as information design: a DOUBT METER across the top that
// fills as the demon's reach grows, and under it a four-row audit of beliefs. As
// the meter passes each belief's threshold, that row is struck through with a
// hand-drawn double line, dimmed, and stamped FAKED. The fourth row, "I EXIST",
// has no threshold — it can never be struck, and when the demon is at full power
// it inks solid and is stamped SURVIVES.
//
// So the reader watches the argument happen instead of being told it. Below the
// audit, the horned demon (now with a tail) and the doubter, whose head carries
// the surviving-self halo.
//
// Between them, on the floor, the RUIN: beat 1 says Descartes "rebuilt knowledge
// from the rubble", so the rubble is drawn. Fallen slabs ink in as the doubt meter
// rises — the wreckage of everything the demon counterfeited — around one plinth
// that never falls and, when the surviving self lights, is inscribed I AM.
//
// Composition rule: the audit ends at y 335; the demon's horn tips reach ~353 and
// the doubter's halo ~345, so nothing above ever collides with a figure. On the
// floor, the ruin lives in x 138…248 at y ≥ 452, while the lowest hand either
// figure ever throws is ~450 — so no hand can ever cross it. The old static camera
// transform is gone — the band does the zooming now.
// ─────────────────────────────────────────────────────────────────────────────

const DOUBT_X = 272;
const DEMON_X = 96;

const D_CODE = BEATS.map((b) => b.d ?? 0);
const M_CODE = BEATS.map((b) => (b.m ?? -1));
const M_ON = BEATS.map((b) => ((b.m ?? -1) >= 0 ? 1 : 0));
const DOUBT = BEATS.map((b) => b.doubt ?? 0);
const GLOW = BEATS.map((b) => (b.glow ? 1 : 0));

const LIST_L = 44;
const LIST_W = 312;
const EYE_T = 178;
const METER_T = 194;
const METER_H = 12;
const ROW_H = 28;
const ROW_T = [214, 245, 276, 307];

// `th` is the doubt level at which the demon manages to counterfeit this belief.
// The three fakeable ones are spaced so they fall one after another across beat 2,
// where the narration says every sight, every memory and even 2 + 3 = 5 could be
// a planted lie. "I EXIST" has no threshold: nothing can strike it.
const BELIEFS = [
  { text: 'EVERYTHING I SEE', th: 0.28, strike: 132 },
  { text: 'MY MEMORIES', th: 0.40, strike: 100 },
  { text: '2 + 3 = 5', th: 0.52, strike: 70 },
];

// The rubble field. Each slab is authored where it LANDED, tilted, so the heap
// reads as masonry that has already come down rather than as tidy boxes. They ink
// in together as the meter climbs past 0.15 → 0.5.
const RUBBLE = [
  { left: 138, top: 486, w: 34, h: 12, rot: '-6deg' },
  { left: 146, top: 473, w: 22, h: 10, rot: '8deg' },
  { left: 218, top: 485, w: 30, h: 12, rot: '5deg' },
  { left: 224, top: 472, w: 16, h: 9, rot: '-13deg' },
];

// THE CAMERA (H60b). `followMoves` reads the x track and gives each beat its own
// shot: it FOLLOWS the subject when a beat moves far enough to be worth following,
// pushes close on a quote, and PULLS BACK to the whole band on a question or a
// summary — the beats the reader has to read and act on.
// Two figures at 272 and 96, so the track is the point BETWEEN them (184) — following
// either one alone would frame the other out, and here the pair is the subject.
const X = BEATS.map((b) => b.x ?? 184);

// R7b — the stage follows the control on its own graded beat, and only there.
// Derived from the beat rather than declared as a channel so it cannot fall out
// of step with the control it is about.
const REACT = BEATS.map((b) => (b.interact?.lever ? 1 : 0));
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('epistemology2'));

export default function Epistemology2Scene({ clock, bt, bi, dragPos, i }: SceneApi) {
  const reacting = REACT[i] === 1;
  const heldDemonS = useHeld();
  const cv = useCarry(3);
  const heldDoubterS = useHeld();
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / 0.85);
    const t = clock.value;

    const doubterS = keepHeld(heldDoubterS, mixStance(carryFrom(heldDoubterS, n, emoteHold(D_CODE[p], t)), emoteLive(D_CODE[n], t, bt.value), tr));
    const mOn = carry(cv, 0, n, M_ON[p], M_ON[n], tr);
    const demonS = keepHeld(heldDemonS, mixStance(carryFrom(heldDemonS, n,
      emoteHold(M_CODE[p] < 0 ? 0 : M_CODE[p], t)),
      emoteLive(M_CODE[n] < 0 ? 0 : M_CODE[n], t, bt.value),
      tr));

    return {
      doubter: pose(doubterS, DOUBT_X, GROUND, K_FIG, -1, 1),
      demon: pose(demonS, DEMON_X, GROUND, K_FIG, 1, mOn),
      demonOn: mOn,
      // R7b — the arm sets how much the demon has faked away. Push it along and the
      // rows go one by one; the point of the lesson is which one will not go, and the
      // reader gets to try to take it.
      doubt: carry(cv, 1, n, DOUBT[p], reacting ? dragPos.value : DOUBT[n], tr),
      glow: carry(cv, 2, n, GLOW[p], GLOW[n], tr),
      t,
    };
  });

  const DD = useDerivedValue<Bundle>(() => SCENE.value.doubter);
  const DM = useDerivedValue<Bundle>(() => SCENE.value.demon);

  const meterFill = useAnimatedStyle(() => ({ transform: [{ scaleX: clamp01(SCENE.value.doubt) }] }));
  const horns = useAnimatedStyle(() => {
    const h = DM.value.head;
    return { opacity: SCENE.value.demonOn, transform: [{ translateX: h[0].translateX }, { translateY: h[1].translateY - 24 }] };
  });
  const tail = useAnimatedStyle(() => {
    const q = DM.value.pel;
    return { opacity: SCENE.value.demonOn, transform: [{ translateX: q[0].translateX }, { translateY: q[1].translateY }] };
  });
  // The surviving self rides the doubter's head, so the halo never drifts off it.
  const halo = useAnimatedStyle(() => {
    const h = DD.value.head;
    const pulse = 0.7 + 0.3 * Math.sin(SCENE.value.t * 2.4);
    return {
      opacity: SCENE.value.glow * pulse,
      transform: [{ translateX: h[0].translateX }, { translateY: h[1].translateY }, { scale: 0.92 + 0.1 * pulse }],
    };
  });
  const survive = useAnimatedStyle(() => ({ opacity: SCENE.value.glow }));
  // The rubble inks in as the meter climbs — the wreckage of the faked beliefs.
  const fallen = useAnimatedStyle(() => ({ opacity: clamp01((SCENE.value.doubt - 0.15) / 0.35) }));
  // The one plinth left standing is inscribed only when the surviving self lights.
  const inscribed = useAnimatedStyle(() => ({ opacity: SCENE.value.glow }));

  return (
    <Animated.View style={styles.scene} pointerEvents="none">
      {/* ── the doubt meter ───────────────────────────────────────────────── */}
      <Text style={styles.eyeL}>HOW MUCH CAN THE DEMON FAKE?</Text>
      <Text style={styles.eyeR}>MAX</Text>
      <View style={styles.meter}>
        <Animated.View style={[styles.meterFill, meterFill]} />
        <View style={[styles.meterTick, { left: LIST_W * 0.25 }]} />
        <View style={[styles.meterTick, { left: LIST_W * 0.5 }]} />
        <View style={[styles.meterTick, { left: LIST_W * 0.75 }]} />
      </View>

      {/* ── the audit: three beliefs that crack, one that will not ────────── */}
      {BELIEFS.map((b, k) => <AuditRow key={b.text} S={SCENE} k={k} b={b} />)}

      <View style={[styles.row, { top: ROW_T[3] }]}>
        <Text style={styles.belief}>I EXIST</Text>
        <Animated.View style={[styles.surviveRow, survive]}>
          <Text style={styles.beliefOn}>I EXIST</Text>
          <View style={styles.chipOut}><Text style={styles.chipOutText}>SURVIVES</Text></View>
        </Animated.View>
      </View>

      {/* ── the stage floor and the two figures ───────────────────────────── */}
      <View style={styles.ground} />

      {/* the ruin: what the demon brought down, and the one thing it could not */}
      <Animated.View style={[StyleSheet.absoluteFill, fallen]} pointerEvents="none">
        {RUBBLE.map((r) => (
          <View
            key={r.left}
            style={[
              styles.slab,
              { left: r.left, top: r.top, width: r.w, height: r.h, transform: [{ rotate: r.rot }] },
            ]}
          />
        ))}
      </Animated.View>
      <View style={styles.plinthCap} />
      <View style={styles.plinth} />
      <Animated.View style={[styles.plinthOn, inscribed]}>
        <Text style={styles.plinthText}>I AM</Text>
      </Animated.View>

      <Animated.View style={[styles.anchor, halo]}>
        <View style={styles.haloOuter} />
        <View style={styles.haloInner} />
      </Animated.View>

      <Stickman D={DM} k={K_FIG} />
      <Stickman D={DD} k={K_FIG} />

      {/* the demon's horns and tail, riding its head and pelvis */}
      <Animated.View style={[styles.anchor, horns]}>
        <View style={[styles.horn, { left: -14, transform: [{ rotate: '-24deg' }] }]} />
        <View style={[styles.horn, { left: 8, transform: [{ rotate: '24deg' }] }]} />
      </Animated.View>
      <Animated.View style={[styles.anchor, tail]}>
        <View style={[styles.tailSeg, { left: -2, top: -3, width: 20, transform: [{ rotate: '165deg' }] }]} />
        <View style={[styles.tailSeg, { left: -21, top: 2, width: 16, transform: [{ rotate: '215deg' }] }]} />
        <View style={[styles.tailFork, { left: -34, top: -8, transform: [{ rotate: '200deg' }] }]} />
        <View style={[styles.tailFork, { left: -34, top: -8, transform: [{ rotate: '252deg' }] }]} />
      </Animated.View>
    </Animated.View>
  );
}

/** A belief the demon can counterfeit: struck through and stamped once doubt passes it. */
function AuditRow({
  S, k, b,
}: { S: SharedValue<any>; k: number; b: { text: string; th: number; strike: number } }) {
  // 0 while the belief still stands, 1 once the demon has faked it away.
  const dim = useAnimatedStyle(() => ({ opacity: 1 - 0.45 * ease01(clamp01((S.value.doubt - b.th) / 0.12)) }));
  const cut = useAnimatedStyle(() => ({ transform: [{ scaleX: ease01(clamp01((S.value.doubt - b.th) / 0.12)) }] }));
  // The second stroke carries its own rotate: an animated `transform` REPLACES a
  // static one when styles flatten, so the tilt has to live inside this worklet.
  const cutB = useAnimatedStyle(() => ({
    transform: [{ rotate: '-1.6deg' }, { scaleX: ease01(clamp01((S.value.doubt - b.th) / 0.12)) }],
  }));
  const chip = useAnimatedStyle(() => {
    const e = ease01(clamp01((S.value.doubt - b.th) / 0.12));
    return { opacity: e, transform: [{ scale: 1.3 - 0.3 * e }] };
  });

  return (
    <>
      <Animated.View style={[styles.row, { top: ROW_T[k] }, dim]}>
        <Text style={styles.belief}>{b.text}</Text>
        {/* a hand-drawn double strike: one firm line, one lighter and slightly off */}
        <Animated.View style={[styles.cut, { top: 12, width: b.strike }, cut]} />
        <Animated.View style={[styles.cutFaint, { top: 16, width: b.strike - 6 }, cutB]} />
      </Animated.View>
      {/* the stamp sits OUTSIDE the dimmed row, so it stays crisp on a faded belief */}
      <Animated.View style={[styles.chip, { top: ROW_T[k] + 5 }, chip]}>
        <Text style={styles.chipText}>FAKED</Text>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 34, right: 24, top: GROUND, height: 1.5, backgroundColor: RULE },
  anchor: { position: 'absolute', left: 0, top: 0 },

  eyeL: {
    position: 'absolute', left: LIST_L, top: EYE_T,
    fontFamily: 'Inter_700Bold', fontSize: 10.5, lineHeight: 13, letterSpacing: 1.2, color: SOFT,
    includeFontPadding: false,
  },
  eyeR: {
    position: 'absolute', left: LIST_L, top: EYE_T, width: LIST_W, textAlign: 'right',
    fontFamily: 'Inter_700Bold', fontSize: 10.5, lineHeight: 13, letterSpacing: 1.2, color: SOFT,
    includeFontPadding: false,
  },
  meter: {
    position: 'absolute', left: LIST_L, top: METER_T, width: LIST_W, height: METER_H,
    borderWidth: 1.5, borderColor: INK, borderRadius: 2, backgroundColor: STONE, overflow: 'hidden',
  },
  meterFill: {
    position: 'absolute', left: 0, top: 0, bottom: 0, width: LIST_W,
    backgroundColor: INK, transformOrigin: '0% 50%',
  },
  meterTick: { position: 'absolute', top: 0, bottom: 0, width: 1, backgroundColor: RULE },

  row: {
    position: 'absolute', left: LIST_L, width: LIST_W, height: ROW_H,
    borderWidth: 1.5, borderColor: INK, borderRadius: 3, backgroundColor: STONE,
  },
  belief: {
    position: 'absolute', left: 14, top: 4,
    fontFamily: 'Inter_700Bold', fontSize: 13.5, lineHeight: 18, letterSpacing: 0.3, color: INK,
    includeFontPadding: false,
  },
  cut: { position: 'absolute', left: 12, height: 2.2, backgroundColor: INK, transformOrigin: '0% 50%' },
  cutFaint: { position: 'absolute', left: 14, height: 1.5, backgroundColor: SOFT, transformOrigin: '0% 50%' },
  chip: {
    position: 'absolute', left: LIST_L + LIST_W - 100, width: 84, height: 20,
    backgroundColor: INK, borderRadius: 2, alignItems: 'center', justifyContent: 'center',
  },
  chipText: {
    fontFamily: 'Inter_700Bold', fontSize: 10.5, lineHeight: 14, letterSpacing: 1.2, color: PAPER,
    includeFontPadding: false,
  },

  surviveRow: {
    position: 'absolute', left: -1.5, top: -1.5, right: -1.5, bottom: -1.5,
    backgroundColor: INK, borderRadius: 3, justifyContent: 'center',
  },
  beliefOn: {
    position: 'absolute', left: 15.5, top: 5.5,
    fontFamily: 'Inter_700Bold', fontSize: 13.5, lineHeight: 18, letterSpacing: 0.3, color: PAPER,
    includeFontPadding: false,
  },
  chipOut: {
    position: 'absolute', left: LIST_W - 98.5, top: 5.5, width: 84, height: 20,
    borderWidth: 1.2, borderColor: PAPER, borderRadius: 2, alignItems: 'center', justifyContent: 'center',
  },
  chipOutText: {
    fontFamily: 'Inter_700Bold', fontSize: 10.5, lineHeight: 14, letterSpacing: 1.2, color: PAPER,
    includeFontPadding: false,
  },

  // ── the ruin on the floor ────────────────────────────────────────────────
  slab: { position: 'absolute', borderWidth: 1.5, borderColor: SOFT, borderRadius: 1.5, backgroundColor: PAPER },
  plinthCap: {
    position: 'absolute', left: 172, top: 452, width: 46, height: 6, borderRadius: 1.5,
    borderWidth: 1.5, borderColor: INK, backgroundColor: PAPER,
  },
  plinth: {
    position: 'absolute', left: 176, top: 458, width: 38, height: 42,
    borderWidth: 2, borderColor: INK, backgroundColor: PAPER,
  },
  plinthOn: {
    position: 'absolute', left: 176, top: 458, width: 38, height: 42,
    backgroundColor: INK, alignItems: 'center', justifyContent: 'center',
  },
  plinthText: {
    fontFamily: 'Inter_700Bold', fontSize: 11, lineHeight: 14, letterSpacing: 0.8, color: PAPER,
    includeFontPadding: false,
  },

  haloOuter: { position: 'absolute', left: -34, top: -34, width: 68, height: 68, borderRadius: 34, borderWidth: 2, borderColor: INK },
  haloInner: { position: 'absolute', left: -22, top: -22, width: 44, height: 44, borderRadius: 22, borderWidth: 1.2, borderColor: SOFT },

  horn: {
    position: 'absolute', top: -8, width: 0, height: 0,
    borderLeftWidth: 3.5, borderRightWidth: 3.5, borderBottomWidth: 12,
    borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: INK,
  },
  tailSeg: { position: 'absolute', height: 2.2, backgroundColor: INK, transformOrigin: '0% 50%' },
  tailFork: { position: 'absolute', width: 9, height: 2, backgroundColor: INK, transformOrigin: '0% 50%' },
});

// BAND. Measured against every beat, not just the first.
//   top    · the meter's eyebrow at 178 (the FAKED chips pop from scale 1.3 but at
//            opacity 0, and never rise above 216), so 172 leaves 6 units of air.
//   bottom · the ankle JOINT is a circle of radius STR.limb/2 × K_FIG = 7.4 drawn
//            centred on GROUND, so a planted foot inks to 507.4 — lower than the
//            fallen slabs (~500) or the ground rule (501.5). 512 clears it by 4.6.
// The audit stops at 335; the demon's horn tips reach ~353 (head centre − 32) and
// the doubter's halo ~345 at their highest, both clear of the last row. The ruin
// occupies x 138…248 on the floor, inside the corridor neither figure can reach.
export function Epistemology2Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Epistemology2Scene} band={[172, 512]} camera={CAM} />;
}
