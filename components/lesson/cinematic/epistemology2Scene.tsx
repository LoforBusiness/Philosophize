import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { BEATS } from './epistemology2Script';
import {
  clamp01, ease01, emoteHold, emoteLive, lerp, mixStance, pose, type Bundle,
} from './rig';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER } from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';

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
// Composition rule: the audit ends at y 335; the demon's horn tips reach ~353 and
// the doubter's halo ~345, so nothing above ever collides with a figure. The old
// static camera transform is gone — the band does the zooming now.
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
  { text: 'EVERYTHING I SEE', th: 0.28, strike: 124 },
  { text: 'MY MEMORIES', th: 0.40, strike: 96 },
  { text: '2 + 3 = 5', th: 0.52, strike: 64 },
];

export default function Epistemology2Scene({ clock, bt, bi }: SceneApi) {
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / 0.85);
    const t = clock.value;

    const doubterS = mixStance(emoteHold(D_CODE[p], t), emoteLive(D_CODE[n], t, bt.value), tr);
    const mOn = lerp(M_ON[p], M_ON[n], tr);
    const demonS = mixStance(
      emoteHold(M_CODE[p] < 0 ? 0 : M_CODE[p], t),
      emoteLive(M_CODE[n] < 0 ? 0 : M_CODE[n], t, bt.value),
      tr,
    );

    return {
      doubter: pose(doubterS, DOUBT_X, GROUND, K_FIG, -1, 1),
      demon: pose(demonS, DEMON_X, GROUND, K_FIG, 1, mOn),
      demonOn: mOn,
      doubt: lerp(DOUBT[p], DOUBT[n], tr),
      glow: lerp(GLOW[p], GLOW[n], tr),
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
  const dim = useAnimatedStyle(() => ({ opacity: 1 - 0.55 * ease01(clamp01((S.value.doubt - b.th) / 0.12)) }));
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
    fontFamily: 'Inter_700Bold', fontSize: 9.5, lineHeight: 12, letterSpacing: 1.2, color: SOFT,
  },
  eyeR: {
    position: 'absolute', left: LIST_L, top: EYE_T, width: LIST_W, textAlign: 'right',
    fontFamily: 'Inter_700Bold', fontSize: 9.5, lineHeight: 12, letterSpacing: 1.2, color: SOFT,
  },
  meter: {
    position: 'absolute', left: LIST_L, top: METER_T, width: LIST_W, height: METER_H,
    borderWidth: 1.5, borderColor: INK, borderRadius: 2, backgroundColor: PAPER, overflow: 'hidden',
  },
  meterFill: {
    position: 'absolute', left: 0, top: 0, bottom: 0, width: LIST_W,
    backgroundColor: INK, transformOrigin: '0% 50%',
  },
  meterTick: { position: 'absolute', top: 0, bottom: 0, width: 1, backgroundColor: RULE },

  row: {
    position: 'absolute', left: LIST_L, width: LIST_W, height: ROW_H,
    borderWidth: 1.5, borderColor: INK, borderRadius: 3, backgroundColor: PAPER,
  },
  belief: {
    position: 'absolute', left: 14, top: 4,
    fontFamily: 'Inter_700Bold', fontSize: 12.5, lineHeight: 17, letterSpacing: 0.3, color: INK,
  },
  cut: { position: 'absolute', left: 12, height: 2, backgroundColor: INK, transformOrigin: '0% 50%' },
  cutFaint: { position: 'absolute', left: 14, height: 1.4, backgroundColor: SOFT, transformOrigin: '0% 50%' },
  chip: {
    position: 'absolute', left: LIST_L + LIST_W - 95, width: 76, height: 18,
    backgroundColor: INK, borderRadius: 2, alignItems: 'center', justifyContent: 'center',
  },
  chipText: { fontFamily: 'Inter_700Bold', fontSize: 9, lineHeight: 12, letterSpacing: 1.2, color: PAPER },

  surviveRow: {
    position: 'absolute', left: -1.5, top: -1.5, right: -1.5, bottom: -1.5,
    backgroundColor: INK, borderRadius: 3, justifyContent: 'center',
  },
  beliefOn: {
    position: 'absolute', left: 15.5, top: 5.5,
    fontFamily: 'Inter_700Bold', fontSize: 12.5, lineHeight: 17, letterSpacing: 0.3, color: PAPER,
  },
  chipOut: {
    position: 'absolute', left: LIST_W - 93.5, top: 5.5, width: 76, height: 18,
    borderWidth: 1.2, borderColor: PAPER, borderRadius: 2, alignItems: 'center', justifyContent: 'center',
  },
  chipOutText: { fontFamily: 'Inter_700Bold', fontSize: 9, lineHeight: 12, letterSpacing: 1.2, color: PAPER },

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

// BAND. Topmost ink is the meter's eyebrow at y 178; the lowest is the ground line
// at 501.5. The audit stops at 335, the demon's horn tips reach ~353 and the
// doubter's halo ~345 at their highest, so nothing is clipped and nothing collides.
export function Epistemology2Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Epistemology2Scene} band={[172, 512]} />;
}
