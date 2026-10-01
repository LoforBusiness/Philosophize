import { useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useFocusEffect } from 'expo-router';
import Animated, {
  cancelAnimation, Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming,
} from 'react-native-reanimated';
import { ProfileArtFill } from '@/components/shared/ProfileArt';
import { HOME_BAND_H, HOME_HORIZON, HOME_DRIFT, HomeCream, HomeSoft } from '@/constants/homeArt';

// ─────────────────────────────────────────────────────────────────────────────
// THE MASTHEAD, STANDING IN THE READER'S OWN PLACE.
//
// The reader's picture is a drawn place now (components/shared/profileScenes.ts),
// and every place stands on a horizon with dark ground below it. So the masthead
// lays the picture with its horizon a little over halfway down the band, and the
// wordmark and today's line stand on that ground — no scrim, no wash dimming the
// picture they chose, and the words read the same on every place because the
// ground is always dark (check-profile-contrast measures all ten).
// ─────────────────────────────────────────────────────────────────────────────

const SW = Dimensions.get('window').width;

// Same trick as the old wordmark: keep ASHMERE on one line at any width. Seven
// characters, so the divisor is the per-character budget including the
// letter-spacing — measured against the narrowest phone we support, not guessed.
const WORDMARK = Math.min(27, Math.floor((SW - 72) / 7.3));

function greeting(hour: number): string {
  if (hour < 5) return 'STILL AWAKE';
  if (hour < 12) return 'GOOD MORNING';
  if (hour < 18) return 'GOOD AFTERNOON';
  return 'GOOD EVENING';
}

export default function HomeHeader({ streak }: { streak: number }) {
  // ONE continuous slide, out and back. Slow enough (26s each way) that it is never
  // caught moving. It is a TRANSLATE only: a scale would move the horizon under the
  // words. STOPPED WHEN HOME IS NOT THE SCREEN YOU ARE ON — tab screens stay
  // mounted, so an unguarded `withRepeat(-1)` would run for the whole session.
  const drift = useSharedValue(0);
  useFocusEffect(
    useCallback(() => {
      drift.value = withRepeat(
        withTiming(1, { duration: HOME_DRIFT.ms, easing: Easing.inOut(Easing.quad) }),
        -1,
        true,
      );
      return () => cancelAnimation(drift);
    }, []),
  );
  const art = useAnimatedStyle(() => ({
    transform: [{ translateX: (drift.value - 0.5) * 2 * HOME_DRIFT.shiftX }],
  }));

  // The streak is the honest thing to put here. "DAY 1" on a reader who has
  // never finished anything would be a number the app made up, so a cold start
  // gets the tagline instead — which is also the only place it still appears.
  const line = streak > 0
    ? `DAY ${streak}  ·  ${greeting(new Date().getHours())}`
    : 'THE ART OF THINKING DEEPLY';

  return (
    <View style={styles.band}>
      {/* Wider than the band by the drift either side, so the slide never shows an edge. */}
      <Animated.View style={[styles.slide, art]}>
        <ProfileArtFill horizonAt={HOME_HORIZON} />
      </Animated.View>

      <View style={styles.type}>
        <Text style={[styles.wordmark, { fontSize: WORDMARK }]} numberOfLines={1} adjustsFontSizeToFit>
          ASHMERE
        </Text>
        <Text style={styles.line} numberOfLines={1}>{line}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Full-bleed: the page pads 24 and this cancels it, because a masthead inset
  // from the edges reads as a card rather than as the top of a page. Its foot is
  // rounded, the same plate the Profile header is.
  band: {
    height: HOME_BAND_H,
    marginHorizontal: -24,
    marginTop: -6,
    marginBottom: 10,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
  },
  slide: {
    position: 'absolute', top: 0, bottom: 0, left: -HOME_DRIFT.shiftX, right: -HOME_DRIFT.shiftX,
  },

  type: { paddingHorizontal: 24, paddingBottom: 16 },
  wordmark: {
    fontFamily: 'PlayfairDisplay_700Bold',
    color: HomeCream,
    letterSpacing: 3,
  },
  line: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    color: HomeSoft,
    letterSpacing: 2.4,
    marginTop: 6,
  },
});
