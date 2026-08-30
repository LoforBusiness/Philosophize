import { useCallback, useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useFocusEffect } from 'expo-router';
import Animated, {
  useSharedValue, useDerivedValue, useFrameCallback, useAnimatedStyle,
  withTiming, withDelay, Easing,
} from 'react-native-reanimated';
import Stickman from '@/components/lesson/cinematic/Stickman';
import { pose, type Bundle } from '@/components/lesson/cinematic/rig';
import { emoteAnyLive } from '@/components/lesson/cinematic/moves';
import { GILT, SLATE } from '@/constants/streak';
import type { MoodState } from '@/lib/utils/streakMood';

// ─────────────────────────────────────────────────────────────────────────────
// THE MASCOT — the same stickman the lessons are made of, standing on the streak
// screen with an opinion about you.
//
// He is not a new character and that is the entire point. The reader has watched
// this figure walk, think, point and slump through a hundred lessons; putting him
// on the streak screen costs nothing to learn and inherits every bit of personality
// the rig already has. A second mascot drawn in a different hand would read as
// clip-art bought for the occasion.
//
// ── HE IS POSED BY THE MECHANIC, NOT BY THE SCREEN ──────────────────────────
//
// The pose is `mood.pose` and nothing here decides it (lib/utils/streakMood.ts).
// This component is the stage: it holds the figure, the ground he stands on, and
// the line he says. Which of the six he is doing is a property of the streak.
//
// ── SIZE AND THE GROUND LINE ────────────────────────────────────────────────
//
// The rig is 103 units tall standing on `GROUND`, so a design box of 150 gives him
// room to slump (46) and to stamp (26) without either leaving the box — the two
// poses at the extremes of the ladder. K is chosen from the box rather than typed:
// change H and the figure scales with it instead of walking off the bottom.
// ─────────────────────────────────────────────────────────────────────────────

const W = 160;
const H = 150;
const GROUND = H - 16;      // the rule he stands on, with room for the shadow
const K = (H - 34) / 103;   // rig units → design units, from the box (B6)
const FIG_X = W / 2;

interface Props {
  mood: MoodState;
  /** A lapsed streak turns him and his ground cool — see the ΔE note in check-streak. */
  alive: boolean;
  /** Play the entrance. Off for a mascot that is already on screen. */
  delay?: number;
}

export default function StreakMascot({ mood, alive, delay = 0 }: Props) {
  const clock = useSharedValue(0);

  // AUTOSTART OFF, AND STOPPED WHEN THIS IS NOT THE SCREEN YOU ARE ON.
  //
  // `useFrameCallback(fn, true)` runs a worklet on the UI thread every frame for
  // as long as the component is mounted, and this one drives a full rig solve
  // and twenty-odd View transforms behind it. A route pushed on top of the
  // streak screen does not unmount it, so the mascot went on being animated,
  // at 60fps, on a screen nobody could see, for as long as the reader stayed
  // above it.
  //
  // This is the same guard `StickmanStroll` and `BranchWorld` have always had,
  // and the same one `HomeHeader` had to be given after it shipped without it —
  // its comment is the one worth reading: "It is a small cost and it is a
  // permanent one, which is the worse kind."
  const frame = useFrameCallback((f) => {
    'worklet';
    let dt = (f.timeSincePreviousFrame ?? 16) / 1000;
    if (dt > 0.05) dt = 0.05;
    clock.value += dt;
  }, false);
  const frameRef = useRef<{ setActive: (v: boolean) => void } | null>(null);
  frameRef.current = frame;
  useFocusEffect(
    useCallback(() => {
      frameRef.current?.setActive(true);
      return () => frameRef.current?.setActive(false);
    }, []),
  );

  // THE POSE CROSSES ON A SHARED VALUE, NOT A PROP. `emoteAnyLive` takes the gesture
  // code as a number, so the mood can change under the worklet without the component
  // remounting and without a JS closure having to cross the boundary (§17 rule 6).
  const code = useSharedValue(mood.pose);
  useEffect(() => { code.value = mood.pose; }, [mood.pose]);

  // He faces the reader's side of the screen (+1), which is where the count sits.
  const D = useDerivedValue<Bundle>(() =>
    pose(emoteAnyLive(code.value, clock.value, clock.value), FIG_X, GROUND, K, 1, 1),
  );

  const inV = useSharedValue(0);
  const say = useSharedValue(0);
  useEffect(() => {
    inV.value = withDelay(delay, withTiming(1, { duration: 420, easing: Easing.out(Easing.cubic) }));
    say.value = withDelay(delay + 460, withTiming(1, { duration: 380, easing: Easing.out(Easing.cubic) }));
  }, []);

  const figStyle = useAnimatedStyle(() => ({
    opacity: inV.value,
    transform: [{ translateY: (1 - inV.value) * 12 }],
  }));
  const sayStyle = useAnimatedStyle(() => ({
    opacity: say.value,
    transform: [{ translateY: (1 - say.value) * 6 }],
  }));

  return (
    <View style={styles.wrap} pointerEvents="none">
      <Animated.View style={[styles.stage, figStyle]}>
        {/* THE GROUND IS THE FUEL GAUGE, and it is where the decay is made visible.
            `mood.glow` is full while the streak has been fed and sinks across the
            evening toward its floor (lib/utils/streakMood.ts) — so the reader can
            see the thing running out without a word being written.

            It dims the FLOOR and never the number. Fading the count would be the
            obvious place and is the wrong one: it is the highest-contrast thing on
            the screen for a reason, and a hero number at 34% opacity reads as a
            disabled control rather than as urgency.

            Colour alone must never be the only tell either — ember and ash are 1.6
            apart in lightness (check-streak) — so the POSE carries the state and
            this agrees with it. */}
        <View
          style={[
            styles.floor,
            {
              backgroundColor: alive ? GILT : SLATE,
              opacity: alive ? 0.25 + 0.55 * mood.glow : 0.4,
              // It also SHORTENS, so the change survives a reader who cannot see
              // the colour shift at all.
              width: 40 + 28 * (alive ? mood.glow : 1),
              left: W / 2 - (40 + 28 * (alive ? mood.glow : 1)) / 2,
            },
          ]}
        />
        <Stickman D={D} k={K} />
      </Animated.View>
      <Animated.View style={[styles.saidWrap, sayStyle]}>
        <Text style={styles.said}>{mood.line}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
  stage: { width: W, height: H },
  // Short, and centred under him: a full-width rule reads as a horizon and puts him
  // in a landscape, when the whole composition wants him standing in front of you.
  floor: { position: 'absolute', top: GROUND, height: 1.5 },
  saidWrap: { paddingHorizontal: 18, marginTop: 2, maxWidth: 300 },
  said: {
    // 700Bold, not 600SemiBold. Only 400 and 700 are loaded (app/_layout.tsx), and a
    // weight that was never registered does not fail — it silently falls back to the
    // system face, so his handwriting would quietly become Roboto on one screen.
    fontFamily: 'Caveat_700Bold',
    fontSize: 21,
    lineHeight: 25,
    textAlign: 'center',
    color: '#1A1A1A',
  },
});
