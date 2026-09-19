// ─────────────────────────────────────────────────────────────────────────────
// THE STICKMAN STAMPS THE UNIT DONE.
//
// The owner asked for *"a certificate or a celebration … some kind of animation that
// makes user happy that they finished a unit"*, and picked the stamp of three.
//
// ── WHAT THE RESEARCH SAID, AND WHAT THIS APP ALREADY KNEW ──────────────────
//
// Duolingo's lesson celebration is not the confetti; it is the MASCOT doing
// something — Duo slides up, his head expands and bursts, and only then do three
// stat cards slide in on a stagger with their numbers counting. The confetti is
// scaled to the achievement and arrives after the act, not instead of it. And the
// completion-certificate literature splits cleanly: a certificate motivates when it
// is substantive and keepable and reads as a participation trophy when it is not.
//
// This app has its own answer to both and it is written down. §7 records the streak
// seal being rebuilt: a seal is a DIE COMING DOWN, so it falls ACCELERATING
// (`Easing.in` — the half everyone gets backwards; `Easing.out` decelerates into the
// paper, which is exactly what made the old one read as a pop), squashes on contact,
// recoils, settles, and leaves a PRESS RING on the frame it lands. The count then
// starts ON CONTACT rather than on its own delay, which is what makes the numbers
// feel caused by the reader.
//
// So the mascot brings the die down and the unit's name is pressed into the page.
// Same physics as the streak stamp, because two celebrations in one app that
// disagree about how a seal behaves are two different products.
// ─────────────────────────────────────────────────────────────────────────────
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import Animated, {
  Easing, runOnJS, useAnimatedStyle, useDerivedValue, useSharedValue, withDelay,
  withSequence, withTiming,
} from 'react-native-reanimated';
import Stickman from '../Stickman';
import { GROUND, INK, K_FIG, PAPER, SOFT, STAGE_H, STAGE_W } from '../cinematicKit';
import { clamp01, ease01, lerp, mixStance, pose, strideStance, WALK, type Bundle } from '../rig';
import { emoteAny, emoteAnyLive } from '../moves';
import { stageTone } from '../stageTones';
import { PLATE_FACE } from '../stageSkin';
import { cue } from '@/lib/feedback';

/** Where he walks from, and where he swings. */
const FROM_X = -52;
const MARK_X = 86;
/** The plate the seal lands on, in design space. */
// CLEAR OF HIM. He stands at 86 and is about 44 wide, so the plate starts past 130
// or the two silhouettes merge — which they did, and a figure half behind a card is
// the wardrobe's own rule (a thing drawn inside the outline is not subtle, it is
// absent) one object out.
const PLATE = { x: 244, y: 268, w: 190, h: 100 };

/** What the reader sees of the design space, and how big that is. */
const WIN: [number, number, number, number] = [26, 236, 374, 540];
const WIN_W = WIN[2] - WIN[0];
const WIN_H = WIN[3] - WIN[1];

/** He carries it in, plants, and swings. Timings in seconds from the start. */
const T_WALK = 1.25;
const T_RAISE = 0.42;
const T_FALL = 0.20;
const T_HIT = T_WALK + T_RAISE + T_FALL;

const POSE_CARRY = 25;
const POSE_RAISE = 35;      // proclaim — both arms up, the die above his head
const POSE_DONE = 19;       // adore — pleased with himself

export default function UnitStamp({
  unitName, branch, lessons, xp, onDone,
}: {
  unitName: string;
  branch: string;
  lessons: number;
  xp: number;
  onDone: () => void;
}) {
  const tone = stageTone(branch as never);
  const [box, setBox] = useState({ w: 0, h: 0 });
  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setBox({ w: width, h: height });
  }, []);
  const fit = box.w > 0 ? Math.min(box.w / WIN_W, box.h / WIN_H) : 0;
  /** Seconds since the celebration began, on the UI thread. */
  const t = useSharedValue(0);
  /** The press ring, struck on the frame the die lands. */
  const ring = useSharedValue(0);
  /** 0 before contact … 1 the legend is in the paper. */
  const bit = useSharedValue(0);
  /** The figures below the plate, which start counting ON CONTACT. */
  const tally = useSharedValue(0);

  useEffect(() => {
    // ONE CLOCK, AND THE REST ARE SLICES OF IT. Group L's own rule: two clocks
    // agreeing is a thing that comes apart under load, and every value here is a
    // function of the same driver except the three that are struck BY it.
    t.value = withTiming(4.2, { duration: 4200, easing: Easing.linear });
    ring.value = withDelay(T_HIT * 1000, withSequence(
      withTiming(1, { duration: 40 }),
      withTiming(0, { duration: 520, easing: Easing.out(Easing.quad) }),
    ));
    bit.value = withDelay(T_HIT * 1000, withTiming(1, { duration: 180, easing: Easing.out(Easing.cubic) }));
    tally.value = withDelay(T_HIT * 1000 + 120, withTiming(1, { duration: 900, easing: Easing.out(Easing.cubic) }));
    const s = setTimeout(() => cue('reward'), Math.round(T_HIT * 1000));
    return () => clearTimeout(s);
  }, [t, ring, bit, tally]);

  const FIG = useDerivedValue<Bundle>(() => {
    const now = t.value;
    // He walks on carrying it, plants, raises, and brings it down.
    const walk = clamp01(now / T_WALK);
    const code = now < T_WALK ? POSE_CARRY
      : now < T_HIT ? POSE_RAISE
        : POSE_DONE;
    const hold = emoteAny(code, now + 3);
    const live = emoteAnyLive(code, now + 3, now);
    const s = now < T_WALK
      ? strideStance(FROM_X, MARK_X, mixStance(hold, live, 0.5), ease01(walk), WALK)
      : mixStance(hold, live, 0.6);
    const x = lerp(FROM_X, MARK_X, ease01(walk));
    // THE SQUASH IS ON THE FIGURE TOO, not only the seal — a die that stops dead
    // while the man holding it does not is two objects, not one action.
    const hit = clamp01((now - T_HIT) / 0.26);
    const squash = now >= T_HIT && hit < 1 ? Math.sin(Math.PI * hit) * 3.5 : 0;
    return pose({ ...s, bob: s.bob + squash }, x, GROUND, K_FIG, 1, 1);
  }, []);

  // THE DIE. It rises with him, then FALLS ACCELERATING — §7's own finding, and the
  // half everyone gets backwards: `Easing.out` decelerates into the paper, which is
  // what makes a stamp read as a pop instead of a strike.
  const dieStyle = useAnimatedStyle(() => {
    const now = t.value;
    const up = clamp01((now - T_WALK) / T_RAISE);
    const down = clamp01((now - T_WALK - T_RAISE) / T_FALL);
    const fall = down * down;                        // accelerating
    const rest = clamp01((now - T_HIT) / 0.5);
    const lift = -96 * ease01(up) * (1 - fall) + 26 * fall;
    const recoil = rest > 0 && rest < 1 ? -Math.sin(Math.PI * rest) * 14 : 0;
    return {
      opacity: now > T_HIT + 0.45 ? Math.max(0, 1 - (now - T_HIT - 0.45) / 0.35) : 1,
      transform: [
        { translateX: MARK_X + 62 },
        { translateY: PLATE.y + 78 + lift + recoil },
        { scaleY: 1 - (down > 0 && down < 1 ? 0 : 0) },
      ],
    };
  });

  const ringStyle = useAnimatedStyle(() => ({
    opacity: ring.value * 0.85,
    transform: [{ scale: 0.86 + (1 - ring.value) * 0.5 }],
  }));
  const legendStyle = useAnimatedStyle(() => ({
    opacity: bit.value,
    transform: [{ scale: 0.88 + bit.value * 0.12 }],
  }));
  const plateStyle = useAnimatedStyle(() => {
    const now = t.value;
    const inAt = ease01(clamp01((now - 0.25) / 0.6));
    const hit = clamp01((now - T_HIT) / 0.22);
    const press = now >= T_HIT && hit < 1 ? Math.sin(Math.PI * hit) * 3 : 0;
    return { opacity: inAt, transform: [{ translateY: (1 - inAt) * 18 + press }] };
  });
  const tallyStyle = useAnimatedStyle(() => ({
    opacity: tally.value,
    transform: [{ translateY: (1 - tally.value) * 10 }],
  }));
  const doneStyle = useAnimatedStyle(() => ({ opacity: clamp01((t.value - T_HIT - 0.9) / 0.4) }));

  return (
    <View style={styles.sheet} nativeID="unit-stamp">
      <View style={styles.stage} onLayout={onLayout}>
        {/* THE SAME CROP AND SCALE THE LESSON STAGE USES. Everything below is written
            in the 400×560 design space the rig works in, so it needs the window that
            turns those numbers into pixels — drawn in a raw box, the plate at y 300
            and the figure at y 500 were simply clipped away and the celebration was
            an empty page with a Done button on it. */}
        <View style={{ width: WIN_W * fit, height: WIN_H * fit, overflow: 'hidden' }}>
          <View style={{
            position: 'absolute', left: -WIN[0] * fit, top: -WIN[1] * fit,
            width: STAGE_W * fit, height: STAGE_H * fit,
          }}
          >
            <View style={{ width: STAGE_W, height: STAGE_H, transform: [{ scale: fit }], transformOrigin: '0% 0%' }}>
          <View style={[styles.floor, { backgroundColor: tone.RULE }]} pointerEvents="none" />
          {/* THE PLATE THE LEGEND IS PRESSED INTO. It arrives first and empty: a name
              that is already there cannot be stamped onto anything. */}
          <Animated.View style={[styles.plate, { left: PLATE.x - PLATE.w / 2, top: PLATE.y }, plateStyle]} pointerEvents="none">
            <Text style={styles.kicker}>UNIT COMPLETE</Text>
            <Animated.View style={legendStyle}>
              <Text style={styles.unit} numberOfLines={3}>{unitName}</Text>
            </Animated.View>
            <Animated.View style={[styles.ring, ringStyle]} pointerEvents="none" />
          </Animated.View>
          {/* The die he brings down. */}
          <Animated.View style={[styles.die, dieStyle]} pointerEvents="none">
            <View style={[styles.dieFace, { backgroundColor: tone.SHADE }]} />
            <View style={styles.dieStem} />
          </Animated.View>
              <Stickman D={FIG as never} k={K_FIG} />
            </View>
          </View>
        </View>
      </View>
      <Animated.View style={[styles.tally, tallyStyle]}>
        <Text style={styles.tallyText}>
          {lessons} {lessons === 1 ? 'lesson' : 'lessons'} reviewed   ·   +{xp} XP
        </Text>
      </Animated.View>
      <Animated.View style={[styles.doneWrap, doneStyle]}>
        <Text accessibilityRole="button" onPress={onDone} style={styles.done} suppressHighlighting>
          Done
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute', left: 0, right: 0, top: 0, bottom: 0,
    backgroundColor: PAPER, zIndex: 20, paddingBottom: 18,
  },
  stage: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  floor: { position: 'absolute', left: 0, right: 0, top: GROUND, bottom: 0 },
  plate: {
    position: 'absolute', width: PLATE.w, minHeight: PLATE.h, borderRadius: 10,
    borderWidth: 2, borderColor: INK, backgroundColor: PLATE_FACE,
    alignItems: 'center', justifyContent: 'center', paddingVertical: 12, paddingHorizontal: 12,
    boxShadow: '0px 4px 0px rgba(26,26,26,0.9)',
  },
  kicker: {
    fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 2, color: SOFT, marginBottom: 6,
  },
  unit: {
    fontFamily: 'PlayfairDisplay_600SemiBold', fontSize: 19, lineHeight: 25, color: INK, textAlign: 'center',
  },
  ring: {
    position: 'absolute', left: -10, right: -10, top: -10, bottom: -10,
    borderRadius: 16, borderWidth: 3, borderColor: INK,
  },
  die: { position: 'absolute', left: 0, top: 0, width: 0, alignItems: 'center' },
  dieFace: {
    position: 'absolute', left: -26, top: -22, width: 52, height: 22, borderRadius: 4,
    borderWidth: 2, borderColor: INK,
  },
  dieStem: {
    position: 'absolute', left: -5, top: -46, width: 10, height: 26, borderRadius: 3, backgroundColor: INK,
  },
  tally: { alignItems: 'center', paddingBottom: 10 },
  tallyText: { fontFamily: 'Inter_600SemiBold', fontSize: 14, letterSpacing: 0.6, color: INK },
  doneWrap: { alignItems: 'center' },
  done: {
    fontFamily: 'Inter_700Bold', fontSize: 14, letterSpacing: 1.4, color: PAPER,
    backgroundColor: INK, paddingVertical: 14, paddingHorizontal: 48, borderRadius: 12,
    overflow: 'hidden', textAlign: 'center',
  },
});
