import { useMemo } from 'react';
import { View, Text, StyleSheet, ImageBackground, type ImageSourcePropType } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import PressableScale from '@/components/shared/PressableScale';
import { useUserDataStore } from '@/stores/userDataStore';
import { pickQuickStart, quickStartArtIndex } from '@/lib/utils/quickStart';

// Five skies, one per day. The rotation is on the DATE only, so finishing a
// lesson swaps the lesson under the same sky rather than changing everything at
// once. Relative requires — Metro resolves asset requires by path.
const ART: ImageSourcePropType[] = [
  require('../../assets/images/quickstart/01-summit.jpg'),
  require('../../assets/images/quickstart/02-gorge.jpg'),
  require('../../assets/images/quickstart/03-library.jpg'),
  require('../../assets/images/quickstart/04-tide.jpg'),
  require('../../assets/images/quickstart/05-citadel.jpg'),
];

import {
  QS_CARD_H,
  QS_SCRIM,
  QS_SCRIM_STOPS,
  QS_CREAM,
  QS_FAINT,
  QS_TAB_INK,
} from '@/constants/quickStartArt';

const Ink = '#1A1A1A';
const Cream = QS_CREAM;
const Faint = QS_FAINT;

// The scrim, the height and the tab colour all live in constants/quickStartArt.ts
// because scripts/check-quickstart-contrast.mjs reads that file and measures
// those exact numbers against all five skies. Editing them here instead would
// make the check a measurement of something that is no longer shipped.

interface Props {
  style?: object;
}

/**
 * The one big invitation on the home screen: the next lesson this learner can
 * actually open, on a different branch each day, over a photograph.
 *
 * Renders nothing at all once every lesson in every branch is finished — a card
 * that says "start a lesson" and can't is worse than no card.
 */
export default function QuickStartCard({ style }: Props) {
  const lessonsByUnit = useUserDataStore((s) => s.lessonsByUnit);
  const startingBranch = useUserDataStore((s) => s.startingBranch);

  const dayNumber = Math.floor(Date.now() / 86_400_000);
  const pick = useMemo(
    () => pickQuickStart(lessonsByUnit, dayNumber, startingBranch),
    [lessonsByUnit, dayNumber, startingBranch],
  );
  const art = ART[quickStartArtIndex(dayNumber, ART.length)];

  if (!pick) return null;

  const open = () =>
    router.push(`/(app)/branches/${pick.branch.slug}/${pick.unit.slug}/lesson/${pick.lesson.id}`);

  return (
    <PressableScale onPress={open} style={[styles.card, style]}>
      <ImageBackground source={art} style={styles.bg} imageStyle={styles.img} resizeMode="cover">
        <LinearGradient colors={QS_SCRIM} locations={QS_SCRIM_STOPS} style={StyleSheet.absoluteFill} />

        {/* The label rides an ink tab rather than the picture. Loose on the thin
            top wash it measured 1.36:1 over four of the five skies; on ink it is
            15:1 whatever the crop lands on, and it echoes the DAILY REFLECTION
            tab directly above it on this screen. */}
        <View style={styles.top}>
          <View style={styles.tab}>
            <Text style={styles.tabText} numberOfLines={1}>
              QUICK START · {pick.branch.name.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.body}>
          <Text style={styles.title} numberOfLines={2}>
            {pick.lesson.title}
          </Text>
          <Text style={styles.meta} numberOfLines={1}>
            {pick.unit.name} · {pick.lesson.estimatedMinutes} MIN
          </Text>

          {/* Full width, not a pill. The whole card has always been tappable, but
              a small button in a corner reads as the only live thing on it — the
              bar says the card is the target. */}
          <View style={styles.cta}>
            <Text style={styles.ctaText}>▶   START LESSON</Text>
          </View>
        </View>
      </ImageBackground>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1.5,
    borderColor: Ink,
    borderRadius: 6,
    backgroundColor: Ink, // holds the frame for the frame before the image decodes
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 0,
    shadowOffset: { width: 2, height: 3 },
    elevation: 3,
  },
  // width must be stated: an ImageBackground with no width takes the picture's
  // own intrinsic width, not the space it was given.
  bg: { width: '100%', height: QS_CARD_H, justifyContent: 'space-between' },
  img: { borderRadius: 4.5 },

  top: { paddingHorizontal: 14, paddingTop: 14, flexDirection: 'row' },
  tab: {
    backgroundColor: QS_TAB_INK,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 3,
  },
  tabText: { fontFamily: 'Inter_700Bold', fontSize: 10, color: Cream, letterSpacing: 1.8 },

  body: { paddingHorizontal: 16, paddingBottom: 16 },
  title: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 30,
    lineHeight: 36,
    color: Cream,
    textShadowColor: 'rgba(0,0,0,0.55)',
    textShadowRadius: 8,
  },
  meta: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: Faint,
    letterSpacing: 1.3,
    marginTop: 9,
    textTransform: 'uppercase',
  },
  cta: {
    alignSelf: 'stretch',
    alignItems: 'center',
    backgroundColor: Cream,
    borderRadius: 5,
    paddingVertical: 15,
    marginTop: 15,
  },
  ctaText: { fontFamily: 'Inter_700Bold', fontSize: 14, color: Ink, letterSpacing: 1.6 },
});
