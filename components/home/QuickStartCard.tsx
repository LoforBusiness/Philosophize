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

const Ink = '#1A1A1A';
const Cream = '#F4F1EA';
const Soft = 'rgba(240,237,229,0.88)';
const Faint = 'rgba(240,237,229,0.76)';

// These pictures are night scenes, but a scrim still has to be fixed rather than
// judged per image: the library is mid-grey where the cat sits and the gorge has
// a bright cloud bank right where the lesson title lands. Clear at the top so the
// picture reads, near-solid by the bottom where every word is.
const SCRIM: readonly [string, string, string] = [
  'rgba(14,13,11,0.20)',
  'rgba(14,13,11,0.62)',
  'rgba(14,13,11,0.92)',
];

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

  const dayNumber = Math.floor(Date.now() / 86_400_000);
  const pick = useMemo(() => pickQuickStart(lessonsByUnit, dayNumber), [lessonsByUnit, dayNumber]);
  const art = ART[quickStartArtIndex(dayNumber, ART.length)];

  if (!pick) return null;

  const open = () =>
    router.push(`/(app)/branches/${pick.branch.slug}/${pick.unit.slug}/lesson/${pick.lesson.id}`);

  return (
    <PressableScale onPress={open} style={[styles.card, style]}>
      <ImageBackground source={art} style={styles.bg} imageStyle={styles.img} resizeMode="cover">
        <LinearGradient colors={SCRIM} locations={[0, 0.5, 1]} style={StyleSheet.absoluteFill} />

        <View style={styles.top}>
          <Text style={styles.kicker}>QUICK START</Text>
          <Text style={styles.branch}>{pick.branch.name.toUpperCase()}</Text>
        </View>

        <View style={styles.body}>
          <Text style={styles.title} numberOfLines={2}>
            {pick.lesson.title}
          </Text>
          <Text style={styles.meta} numberOfLines={1}>
            {pick.unit.name} · {pick.lesson.estimatedMinutes} MIN
          </Text>

          <View style={styles.cta}>
            <Text style={styles.ctaText}>▶  START LESSON</Text>
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
  bg: { width: '100%', height: 196, justifyContent: 'space-between' },
  img: { borderRadius: 4.5 },

  top: { paddingHorizontal: 16, paddingTop: 13 },
  kicker: { fontFamily: 'Inter_700Bold', fontSize: 9.5, color: Faint, letterSpacing: 2.5 },
  branch: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10.5,
    color: Cream,
    letterSpacing: 2,
    marginTop: 5,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowRadius: 6,
  },

  body: { paddingHorizontal: 16, paddingBottom: 15 },
  title: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 23,
    lineHeight: 29,
    color: Cream,
    textShadowColor: 'rgba(0,0,0,0.55)',
    textShadowRadius: 8,
  },
  meta: {
    fontFamily: 'Inter_500Medium',
    fontSize: 9.5,
    color: Faint,
    letterSpacing: 1.2,
    marginTop: 7,
    textTransform: 'uppercase',
  },
  cta: {
    alignSelf: 'flex-start',
    backgroundColor: Cream,
    borderRadius: 5,
    paddingHorizontal: 20,
    paddingVertical: 11,
    marginTop: 13,
  },
  ctaText: { fontFamily: 'Inter_700Bold', fontSize: 12, color: Ink, letterSpacing: 1.2 },
});
