import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing, useAnimatedStyle, useSharedValue, withDelay, withSequence, withSpring, withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { INK, PAPER, PAPER_LIT, SHADOW, mix, ROYAL, BEIGE } from '@/components/shared/tone';
import { XP_PER_CORRECT_ANSWER } from '@/constants/xp';
import { DEFAULT_ACCENT, accentForLesson, VERDICT, type QAccent } from './questionTone';

// ─────────────────────────────────────────────────────────────────────────────
// THE PARTS EVERY ANSWER CONTROL IS BUILT FROM.
//
// The controls below the stickman were six separate drawings of "a thing you can
// press", each in ink and grey, and a reader called the set "very simple black and
// white … very boring, not very gamified". Two things were missing, and both are
// here once so the six cannot drift apart again.
//
// ── A PRESSABLE THING IS RAISED, AND IT SITS ON A COLOURED LIP ───────────────
//
// `LipPlate` is the chunk every good answer button in a game has: a face standing
// on a slab of its own darker colour, which the face drops onto under a finger.
// The lip takes the lesson's branch hue (see ./questionTone), so a logic question
// is slate and an ethics question is pine, and the verdict then re-strikes the same
// plate in green or rust. The face stays nearly paper: the colour lives in the edge
// and the lip, never in a flood (§19 on what made Insights read cheap).
//
// ── AN ANSWER IS AN EVENT ───────────────────────────────────────────────────
//
// `VerdictSeal` stamps the reader's own choice with a tick or a cross, and `XpCoin`
// pays out in the palette's purple with a small burst when the answer is right, the
// same purple the Pass, the streak and first place are struck in. Both are
// mounted only when earned: a transparent View still contributes its text, and a
// screen reader would announce "✓" on every option (ChoiceCards learned it).
//
// NO SOUND. The app plays two sounds and this is not one of them (only-two-sounds).
// ─────────────────────────────────────────────────────────────────────────────

const AccentCtx = createContext<QAccent>(DEFAULT_ACCENT);

/** Mounted by CinematicPlayer around the lower deck, so every control is struck in the lesson's branch. */
export function QuestionAccentProvider({ lessonId, children }: { lessonId: string; children: ReactNode }) {
  const accent = useMemo(() => accentForLesson(lessonId), [lessonId]);
  return <AccentCtx.Provider value={accent}>{children}</AccentCtx.Provider>;
}

export function useQuestionAccent(): QAccent {
  return useContext(AccentCtx);
}

export type PlateState = 'idle' | 'right' | 'wrong' | 'rest';

/** How far a raised control drops onto its lip. */
export const PLATE_LIP = 4;

/**
 * A raised face on a coloured lip.
 *
 * `down` is 0..1: 1 is the face resting ON the lip, which is both "a finger is on
 * it" and "this is the one you chose". The lip's height is fixed padding and never
 * animates, so Yoga never re-measures and nothing below moves on a press.
 *
 * `rest` is an answered option that was neither chosen nor right: its lip goes
 * neutral, so the eye finds the two plates that matter without anything fading.
 */
export function LipPlate({
  state = 'idle', down, radius = 10, style, faceStyle, children,
}: {
  state?: PlateState;
  down?: SharedValue<number>;
  radius?: number;
  style?: StyleProp<ViewStyle>;
  faceStyle?: StyleProp<ViewStyle>;
  children?: ReactNode;
}) {
  const accent = useQuestionAccent();
  const tone = state === 'right'
    ? { lip: VERDICT.right.lip, edge: VERDICT.right.ink, foot: mix(VERDICT.right.face, VERDICT.right.ink, 0.1), top: VERDICT.right.face }
    : state === 'wrong'
      ? { lip: VERDICT.wrong.lip, edge: VERDICT.wrong.ink, foot: mix(VERDICT.wrong.face, VERDICT.wrong.ink, 0.1), top: VERDICT.wrong.face }
      : state === 'rest'
        ? { lip: mix(PAPER, INK, 0.22), edge: mix(PAPER, INK, 0.16), foot: mix(PAPER, INK, 0.04), top: PAPER_LIT }
        : { lip: accent.shade, edge: accent.edge, foot: accent.wash, top: PAPER_LIT };
  const move = useAnimatedStyle(() => ({
    transform: [{ translateY: (down ? down.value : 0) * PLATE_LIP }],
  }));
  return (
    <View style={[{ paddingBottom: PLATE_LIP }, style]}>
      <View pointerEvents="none" style={[styles.lip, { top: PLATE_LIP, borderRadius: radius, backgroundColor: tone.lip }]} />
      <Animated.View style={[styles.face, { borderRadius: radius, borderColor: tone.edge }, faceStyle, move]}>
        <LinearGradient
          pointerEvents="none"
          colors={[tone.top, tone.top, tone.foot]}
          locations={[0, 0.45, 1]}
          start={{ x: 0.2, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        {children}
      </Animated.View>
    </View>
  );
}

/** The stamp on the reader's own answer. Mount it only when the answer is in. */
export function VerdictSeal({
  correct, size = 24, delay = 160, style,
}: { correct: boolean; size?: number; delay?: number; style?: StyleProp<ViewStyle> }) {
  const s = useSharedValue(0);
  useEffect(() => {
    s.value = withDelay(delay, withSequence(
      withTiming(1.32, { duration: 120, easing: Easing.out(Easing.quad) }),
      withSpring(1, { damping: 9, stiffness: 220 }),
    ));
  }, [s, delay]);
  const st = useAnimatedStyle(() => ({
    opacity: s.value > 0 ? 1 : 0,
    transform: [{ scale: s.value }, { rotate: '-10deg' }],
  }));
  const ink = correct ? VERDICT.right.ink : VERDICT.wrong.ink;
  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.seal, { width: size, height: size, borderRadius: size / 2, backgroundColor: ink }, st, style]}
    >
      <Text style={[styles.sealMark, { fontSize: Math.round(size * 0.52), lineHeight: Math.round(size * 0.7) }]}>
        {correct ? '✓' : '✕'}
      </Text>
    </Animated.View>
  );
}

const RAYS = [0, 1, 2, 3, 4, 5, 6, 7];

/** One ray of the payout burst: shoots out from the coin and fades. */
function Ray({ k, t }: { k: number; t: SharedValue<number> }) {
  const angle = k * 45;
  const st = useAnimatedStyle(() => {
    const u = t.value;
    return {
      opacity: u <= 0 ? 0 : Math.max(0, 1 - u * 1.25),
      transform: [{ rotate: `${angle}deg` }, { translateY: -(14 + 16 * u) }, { scaleY: 1 - 0.5 * u }],
    };
  });
  return <Animated.View pointerEvents="none" style={[styles.ray, st]} />;
}

/**
 * THE PAYOUT. A purple coin reading the XP a correct answer earns, which pops and
 * throws eight short rays. Mount it only on a right answer.
 */
export function XpCoin({ delay = 240, style }: { delay?: number; style?: StyleProp<ViewStyle> }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withDelay(delay, withTiming(1, { duration: 640, easing: Easing.out(Easing.cubic) }));
  }, [t, delay]);
  const coin = useAnimatedStyle(() => {
    const u = t.value;
    const pop = u < 0.3 ? (u / 0.3) * 1.2 : 1.2 - 0.2 * Math.min(1, (u - 0.3) / 0.35);
    return { opacity: u > 0 ? 1 : 0, transform: [{ scale: pop }] };
  });
  return (
    <View style={[styles.coinWrap, style]} pointerEvents="none">
      <View style={styles.rays}>
        {RAYS.map((k) => <Ray key={k} k={k} t={t} />)}
      </View>
      <Animated.View style={[styles.coin, coin]}>
        <LinearGradient
          colors={[ROYAL.lit, ROYAL.base, ROYAL.shade]}
          locations={[0, 0.55, 1]}
          start={{ x: 0.15, y: 0 }}
          end={{ x: 0.85, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <Text style={styles.coinText}>{`+${XP_PER_CORRECT_ANSWER} XP`}</Text>
      </Animated.View>
    </View>
  );
}

/**
 * A struck knob: a disc in the branch hue, lit from the top left, with a paper
 * core, and a soft halo that swells while a finger holds it. The parent owns the
 * position; `verdict` re-strikes it green or rust once the answer is in.
 */
export function Medallion({
  held, size = 34, verdict = null,
}: { held?: SharedValue<number>; size?: number; verdict?: 'right' | 'wrong' | null }) {
  const accent = useQuestionAccent();
  const base = verdict === 'right' ? VERDICT.right.ink : verdict === 'wrong' ? VERDICT.wrong.ink : accent.base;
  const face: [string, string, string] = [mix(base, PAPER, 0.38), base, mix(base, INK, 0.34)];
  const rim = mix(base, INK, 0.55);
  const halo = useAnimatedStyle(() => {
    const h = held ? held.value : 0;
    return { opacity: 0.22 * h, transform: [{ scale: 1 + 0.55 * h }] };
  });
  return (
    <View style={{ width: size, height: size }} pointerEvents="none">
      <Animated.View style={[StyleSheet.absoluteFill, { borderRadius: size / 2, backgroundColor: base }, halo]} />
      <View style={[styles.disc, { borderRadius: size / 2, borderColor: rim }]}>
        <LinearGradient
          colors={face}
          locations={[0, 0.55, 1]}
          start={{ x: 0.2, y: 0 }}
          end={{ x: 0.8, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={[styles.core, { width: size * 0.34, height: size * 0.34, borderRadius: size * 0.17, borderColor: rim }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  lip: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  face: {
    borderWidth: 1.5,
    overflow: 'hidden',
    shadowColor: INK,
    shadowOffset: { width: SHADOW.dx, height: SHADOW.dy },
    shadowOpacity: SHADOW.opacity,
    shadowRadius: 2,
  },
  seal: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: PAPER,
  },
  sealMark: { fontFamily: 'Inter_700Bold', color: PAPER, textAlign: 'center' },
  coinWrap: { alignItems: 'center', justifyContent: 'center' },
  rays: { position: 'absolute', width: 0, height: 0, alignItems: 'center', justifyContent: 'center' },
  ray: {
    position: 'absolute', width: 2.5, height: 7, borderRadius: 1.5,
    backgroundColor: ROYAL.base,
  },
  coin: {
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: ROYAL.rim,
    paddingHorizontal: 8,
    paddingVertical: 2,
    overflow: 'hidden',
  },
  coinText: { fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 0.5, color: BEIGE },
  disc: {
    flex: 1,
    borderWidth: 2,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: INK,
    shadowOffset: { width: SHADOW.dx, height: SHADOW.dy + 0.6 },
    shadowOpacity: 0.28,
    shadowRadius: 2.5,
  },
  core: { backgroundColor: PAPER, borderWidth: 1.5 },
});
