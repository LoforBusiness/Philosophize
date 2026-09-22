// ─────────────────────────────────────────────────────────────────────────────
// THE Aa BUTTON — whether the spoken words rise with the voice or arrive whole.
//
// A reader asked for it in so many words: "if a user does not want to see the words
// wait to show up when reading … I just want a way to toggle it off so all the words
// show up, but the narration still happens." So this writes one setting,
// `riseWords`, and NarrationText reads it: off, the paragraph is drawn complete the
// moment its beat opens, and the voice reads it exactly as before. The setting lives
// in the store rather than in the lesson, so turning it off in one lesson turns it off
// in the next, and Settings › Lessons carries the same switch.
//
// ── THE GLYPH SAYS WHICH MODE YOU ARE IN, NOT WHAT THE TAP WILL DO ──────────
//
// The speaker beside it already works that way (a sounding speaker means the voice is
// on), and two neighbouring buttons that read in opposite senses is the confusion a
// reader would notice first. RISING is "A" on the line with a lighter "a" lifted
// above it and a small rising tick under it — letters on their way up. ALL AT ONCE is
// "Aa" level on one line with a rule under it — a settled paragraph.
//
// ── AND IT SAYS SO IN WORDS, ONCE ────────────────────────────────────────────
//
// A glyph change this small is easy to miss, so a switch names the mode it has just
// entered in a pill under the header for a second and a half. It hangs off the button
// and needs the header to sit ABOVE the body (zIndex) — the body is drawn after the
// header and would otherwise paint straight over it.
//
// ── WHERE IT IS, FOR THE GUIDE ───────────────────────────────────────────────
//
// The lesson guide rings this button, so it registers its ref in the guide store and
// the guide measures it in the window when it opens (lessonGuideState.ts).
// ─────────────────────────────────────────────────────────────────────────────
import { useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSequence, withDelay, Easing } from 'react-native-reanimated';
import { useUserDataStore } from '@/stores/userDataStore';
import { INK, PAPER } from '@/components/shared/tone';
import { useGuideStore } from './lessonGuideState';

export default function WordsToggle() {
  const rise = useUserDataStore((s) => s.settings.riseWords);
  const setSetting = useUserDataStore((s) => s.setSetting);
  const ref = useRef<View>(null);
  const setWordsRef = useGuideStore((s) => s.setWordsRef);
  useEffect(() => {
    setWordsRef(ref);
    return () => setWordsRef(null);
  }, [setWordsRef]);

  // The pill that names the new mode. Only a TAP shows it: mounting with the setting
  // already off says nothing, because nothing just changed.
  const pill = useSharedValue(0);
  const pillStyle = useAnimatedStyle(() => ({
    opacity: pill.value,
    transform: [{ translateY: (1 - pill.value) * -4 }],
  }));
  const flip = () => {
    setSetting('riseWords', !rise);
    pill.value = withSequence(
      withTiming(1, { duration: 140, easing: Easing.out(Easing.quad) }),
      withDelay(1400, withTiming(0, { duration: 260, easing: Easing.in(Easing.quad) })),
    );
  };

  return (
    <View style={styles.wrap}>
      <Pressable
        ref={ref}
        onPress={flip}
        hitSlop={12}
        // testID so a probe can find the button the guide is RINGING and compare the
        // two boxes. Without it the only handle is an accessibility role shared with
        // the speaker beside it, and "the ring is in the wrong place" is a question
        // about two rectangles that has to be answered by measuring both.
        testID="words-toggle"
        style={styles.btn}
        accessibilityRole="switch"
        accessibilityState={{ checked: rise }}
        accessibilityLabel="Words rise as they are read"
        accessibilityHint={rise ? 'Turn off to show all the words at once. The voice keeps reading.' : 'Turn on to have the words rise with the voice.'}
      >
        <View style={styles.glyph}>
          {rise ? (
            <>
              <Text style={styles.big}>A</Text>
              <Text style={[styles.small, styles.lifted]}>a</Text>
              <View style={styles.tick} />
            </>
          ) : (
            <>
              <Text style={styles.big}>A</Text>
              <Text style={styles.small}>a</Text>
              <View style={styles.rule} />
            </>
          )}
        </View>
      </Pressable>
      {/* A fixed-width carrier, right-aligned: an absolute box hung off a 28-point
          button with no width of its own is measured against the button and would
          clamp the label to "Words rise…". */}
      <Animated.View pointerEvents="none" style={[styles.pillBox, pillStyle]}>
        <View style={styles.pill}>
          <Text style={styles.pillText} numberOfLines={1}>{rise ? 'Words rise as they’re read' : 'All the words at once'}</Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'relative' },
  btn: { padding: 4 },
  // 20×20, the speaker icon's own box, so the two sit as a pair.
  glyph: { width: 20, height: 20, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center' },
  big: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 16, lineHeight: 18, color: INK, includeFontPadding: false },
  small: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 12, lineHeight: 14, color: INK, includeFontPadding: false, marginLeft: 0.5 },
  // "a" on its way up: lighter, and lifted clear of the line.
  lifted: { opacity: 0.5, transform: [{ translateY: -5 }] },
  // A short rising stroke under the lifted letter.
  tick: { position: 'absolute', right: 1.5, bottom: 0, width: 2, height: 5, borderRadius: 1, backgroundColor: INK, opacity: 0.5 },
  // A settled paragraph: both letters level on a rule.
  rule: { position: 'absolute', left: 1, right: 1, bottom: -1.5, height: 1.5, borderRadius: 1, backgroundColor: INK },
  pillBox: { position: 'absolute', top: 36, right: -6, width: 220, alignItems: 'flex-end' },
  pill: { backgroundColor: INK, borderRadius: 999, paddingVertical: 6, paddingHorizontal: 11 },
  pillText: { fontFamily: 'Inter_500Medium', fontSize: 12, color: PAPER },
});
