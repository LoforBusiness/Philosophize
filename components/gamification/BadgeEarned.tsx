import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withDelay, withTiming, Easing,
} from 'react-native-reanimated';
import BadgeMedal from '@/components/shared/BadgeMedal';
import type { BadgeDef } from '@/data/badges';

// ─────────────────────────────────────────────────────────────────────────────
// A BADGE, DRAWN ONTO THE REWARD SCREEN.
//
// It arrives the way the XP number above it arrives — under a nib, not on a
// spring. That screen already made this decision once and wrote down why: a
// scale-up with overshoot wobbles, and a wobbling reward reads as a cheap toy
// rather than as something conferred. So nothing here bounces.
//
// FOUR STROKES, IN THE ORDER A HAND WOULD MAKE THEM:
//
//   1. the rule and the word EARNED wipe on          0 →  360ms
//   2. the medal's outline draws itself round        260 → 1180ms
//   3. the mark arrives inside it                   1080 → 1440ms
//   4. the name, then the caption beneath           1320 → 1900ms
//
// The overlaps are deliberate. Waiting for each step to finish before starting
// the next takes 2.9s and feels like a queue; letting the mark begin while the
// last of the outline is still travelling reads as one continuous gesture and
// lands in 1.9s.
//
// STACKED, NOT SEQUENCED, when more than one lands at once. A queue would hide
// the second badge behind a wait the reader has no reason to expect and might
// leave before seeing — and finishing one lesson can genuinely trip three (a
// lesson count, an XP milestone and a unit all completing on the same tap).
// They come in one after another, 520ms apart, and all stay on screen.
// ─────────────────────────────────────────────────────────────────────────────

const Ink = '#1A1A1A';
const InkSoft = '#6B6B6B';
const Rule = '#E4E1D8';

const MEDAL = 78;

export default function BadgeEarned({ badge, delay }: { badge: BadgeDef; delay: number }) {
  // The card's own arrival — a short lift, no fade-from-far, so the medal is
  // already in place before its outline starts travelling.
  const card = useSharedValue(0);
  const draw = useSharedValue(0);
  const reveal = useSharedValue(0);
  const text = useSharedValue(0);

  useEffect(() => {
    const t = { duration: 360, easing: Easing.out(Easing.cubic) } as const;
    card.value = withDelay(delay, withTiming(1, t));
    draw.value = withDelay(delay + 260, withTiming(1, { duration: 920, easing: Easing.inOut(Easing.cubic) }));
    reveal.value = withDelay(delay + 1080, withTiming(1, { duration: 360, easing: Easing.out(Easing.cubic) }));
    text.value = withDelay(delay + 1320, withTiming(1, { duration: 420, easing: Easing.out(Easing.cubic) }));
  }, []);

  const cardStyle = useAnimatedStyle(() => ({
    opacity: card.value,
    transform: [{ translateY: (1 - card.value) * 10 }],
  }));
  const textStyle = useAnimatedStyle(() => ({
    opacity: text.value,
    transform: [{ translateY: (1 - text.value) * 6 }],
  }));

  return (
    <Animated.View style={[styles.card, cardStyle]}>
      <BadgeMedal
        family={badge.family}
        tier={badge.tier}
        glyph={badge.glyph}
        earned
        size={MEDAL}
        draw={draw}
        reveal={reveal}
      />
      <Animated.View style={[styles.words, textStyle]}>
        <Text style={styles.kicker}>BADGE EARNED</Text>
        <Text style={styles.name} numberOfLines={2}>{badge.name}</Text>
        <Text style={styles.caption} numberOfLines={3}>{badge.caption}</Text>
      </Animated.View>
    </Animated.View>
  );
}

/** The heading above the badges, with a rule that draws itself on. */
export function BadgeEarnedHeading({ count, delay }: { count: number; delay: number }) {
  const v = useSharedValue(0);
  useEffect(() => {
    v.value = withDelay(delay, withTiming(1, { duration: 520, easing: Easing.out(Easing.cubic) }));
  }, []);
  const rule = useAnimatedStyle(() => ({ transform: [{ scaleX: v.value }] }));
  const word = useAnimatedStyle(() => ({ opacity: v.value }));
  return (
    <View style={styles.heading}>
      <Animated.View style={[styles.headingRule, rule]} />
      <Animated.Text style={[styles.headingText, word]}>
        {count === 1 ? 'A NEW BADGE' : `${count} NEW BADGES`}
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  heading: { alignItems: 'center', marginTop: 20 },
  headingRule: { width: 54, height: 2, backgroundColor: Ink, transformOrigin: '0% 50%' },
  headingText: {
    fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 2.5, color: InkSoft, marginTop: 10,
  },

  card: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderTopWidth: 1,
    borderTopColor: Rule,
  },
  words: { flex: 1 },
  kicker: { fontFamily: 'Inter_700Bold', fontSize: 8.5, letterSpacing: 2, color: InkSoft },
  name: {
    fontFamily: 'PlayfairDisplay_700Bold', fontSize: 20, color: Ink, marginTop: 2, lineHeight: 24,
  },
  caption: {
    fontFamily: 'PlayfairDisplay_400Regular', fontStyle: 'italic', fontSize: 12.5,
    lineHeight: 17, color: InkSoft, marginTop: 3,
  },
});
