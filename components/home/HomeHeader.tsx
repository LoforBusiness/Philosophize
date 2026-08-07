import { useCallback } from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from 'expo-router';
import Animated, {
  cancelAnimation, Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming,
} from 'react-native-reanimated';
import { backgroundSource } from '@/data/profileBackgrounds';
import { useUserDataStore } from '@/stores/userDataStore';
import {
  HOME_BAND_H, HOME_SCRIM, HOME_SCRIM_STOPS, HOME_DRIFT, HomeCream, HomeSoft, HomeBase,
} from '@/constants/homeArt';

// ─────────────────────────────────────────────────────────────────────────────
// THE MASTHEAD, WEARING THE READER'S OWN PICTURE.
//
// This replaces five stacked centred lines — kicker, wordmark, rule, tagline,
// diamonds — that took about 130dp at the top of Home to tell the reader the
// name of the app they had just opened. It says the same name in a third of the
// space, over the image they chose in Settings, above a line that is about
// TODAY rather than about the app.
//
// Contrast is fixed, not sampled: see constants/homeArt.ts for why the images'
// own `tone` flag is the wrong tool here, and scripts/check-profile-contrast.mjs
// for the arithmetic that proves the cream survives all ten.
// ─────────────────────────────────────────────────────────────────────────────

const SW = Dimensions.get('window').width;

// Same trick as the old wordmark: keep PHILOSOPHIZE on one line at any width.
// Twelve characters, so the divisor is the per-character budget including the
// letter-spacing — measured against the narrowest phone we support, not guessed.
const WORDMARK = Math.min(27, Math.floor((SW - 72) / 12.6));

function greeting(hour: number): string {
  if (hour < 5) return 'STILL AWAKE';
  if (hour < 12) return 'GOOD MORNING';
  if (hour < 18) return 'GOOD AFTERNOON';
  return 'GOOD EVENING';
}

export default function HomeHeader({ streak }: { streak: number }) {
  const bgId = useUserDataStore((s) => s.profileBackground);
  const src = backgroundSource(bgId);

  // ONE continuous push, out and back. Slow enough (26s each way) that it is
  // never caught moving and never finishes while anyone is looking.
  //
  // STOPPED WHEN HOME IS NOT THE SCREEN YOU ARE ON. Tab screens stay mounted, so
  // an unguarded `withRepeat(-1)` keeps a Reanimated timing animation evaluating
  // on the UI thread for the entire session — through every lesson, on a screen
  // nobody can see. It is a small cost and it is a permanent one, which is the
  // worse kind. StickmanStroll has always guarded its frame callback this way;
  // this one shipped without it.
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
    transform: [
      { scale: HOME_DRIFT.from + drift.value * (HOME_DRIFT.to - HOME_DRIFT.from) },
      { translateX: drift.value * HOME_DRIFT.shiftX },
    ],
  }));

  // The streak is the honest thing to put here. "DAY 1" on a reader who has
  // never finished anything would be a number the app made up, so a cold start
  // gets the tagline instead — which is also the only place it still appears.
  const line = streak > 0
    ? `DAY ${streak}  ·  ${greeting(new Date().getHours())}`
    : 'THE ART OF THINKING DEEPLY';

  return (
    <View style={styles.band}>
      <Animated.View style={[StyleSheet.absoluteFill, art]}>
        {src ? (
          // absoluteFill gives the image explicit bounds. A bare <Image> or an
          // <ImageBackground> with no stated width takes the PICTURE's intrinsic
          // width instead and leaves a bare strip down the side (§19).
          <Image source={src} style={StyleSheet.absoluteFill} resizeMode="cover" />
        ) : (
          <View style={styles.wash} />
        )}
      </Animated.View>

      <LinearGradient
        colors={HOME_SCRIM}
        locations={HOME_SCRIM_STOPS}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.type}>
        <Text style={[styles.wordmark, { fontSize: WORDMARK }]} numberOfLines={1} adjustsFontSizeToFit>
          PHILOSOPHIZE
        </Text>
        <Text style={styles.line} numberOfLines={1}>{line}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Full-bleed: the page pads 24 and this cancels it, because a masthead inset
  // from the edges reads as a card rather than as the top of a page.
  band: {
    height: HOME_BAND_H,
    marginHorizontal: -24,
    marginTop: -6,
    marginBottom: 4,
    backgroundColor: HomeBase,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  // Shown when an id has no registered file — the same arrangement
  // data/profileBackgrounds.ts makes for every other surface, so the app always
  // looks finished rather than broken.
  wash: { flex: 1, backgroundColor: HomeBase },

  type: { paddingHorizontal: 24, paddingBottom: 14 },
  wordmark: {
    fontFamily: 'PlayfairDisplay_700Bold',
    color: HomeCream,
    letterSpacing: 3,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowRadius: 7,
  },
  line: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    color: HomeSoft,
    letterSpacing: 2.4,
    marginTop: 6,
    textShadowColor: 'rgba(0,0,0,0.45)',
    textShadowRadius: 5,
  },
});
