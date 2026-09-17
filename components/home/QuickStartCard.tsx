import { useMemo } from 'react';
import { View, Text, StyleSheet, ImageBackground, type ImageSourcePropType } from 'react-native';
import { openLesson } from '@/components/lesson/lessonNav';
import { LinearGradient } from 'expo-linear-gradient';
import Card from '@/components/ui/Card';
import { mix } from '@/components/shared/tone';
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

import { Dimensions } from 'react-native';
import {
  qsCardHeight,
  QS_SCRIM,
  qsScrimStops,
  QS_CREAM,
  QS_FAINT,
  QS_TAB_INK,
} from '@/constants/quickStartArt';

const Ink = '#1A1A1A';
const Cream = QS_CREAM;
const Faint = QS_FAINT;

// The device read lives HERE, not in constants/quickStartArt.ts — that file has
// to stay import-free so the contrast check can load it in plain Node.
//
// Module scope, not per render: Home does not survive a rotation, and the stops
// only change when the height does.
const QS_CARD_H = qsCardHeight(Dimensions.get('window').height);
const SCRIM_STOPS = qsScrimStops(QS_CARD_H);

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

  // Through lessonNav, ANCHORED: pushed plainly from Home into a Learn tab not yet
  // built, the lesson arrived with no branch list under it (see lessonNav.ts).
  const open = () => openLesson(pick.branch.slug, pick.unit.slug, pick.lesson.id);

  return (
    // ON THE TEAL LEDGE (2026-09-16), like the app's primary button: the card is
    // the one big thing on Home you press, so it stands on a solid ledge and sinks
    // onto it rather than shrinking. The hard offset shadow it carried is gone.
    <Card tone="ink" onPress={open} pad={0} style={styles.card} containerStyle={style} accessibilityLabel={`Start ${pick.lesson.title}`}>
      <ImageBackground source={art} style={styles.bg} imageStyle={styles.img} resizeMode="cover">
        {/* Stops are computed from the card's height: the body is a fixed number
            of dp, so its FRACTION shrinks as the card grows, and a hard-coded
            stop would drift further from the type on every taller phone. */}
        <LinearGradient colors={QS_SCRIM} locations={SCRIM_STOPS} style={StyleSheet.absoluteFill} />

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
          {/* A BUTTON ON ITS OWN LEDGE, not a cream strip. It sinks with the
              card rather than on its own: the whole card is the target. */}
          <View style={styles.ctaWrap}>
            <View style={styles.ctaLedge} />
            <View style={styles.cta}>
              <Text style={styles.ctaText}>▶   START LESSON</Text>
            </View>
          </View>
        </View>
      </ImageBackground>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    // Card draws the ink face, its 2px edge and the ledge; the picture is
    // clipped to the face's corners.
    overflow: 'hidden',
  },
  // width must be stated: an ImageBackground with no width takes the picture's
  // own intrinsic width, not the space it was given.
  bg: { width: '100%', height: QS_CARD_H, justifyContent: 'space-between' },
  img: { borderRadius: 14 },

  top: { paddingHorizontal: 14, paddingTop: 14, flexDirection: 'row' },
  tab: {
    backgroundColor: QS_TAB_INK,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 3,
  },
  tabText: { fontFamily: 'Inter_700Bold', fontSize: 10, color: Cream, letterSpacing: 1.8 },

  // These six numbers ARE QS_BODY_DP in constants/quickStartArt.ts — 80 of title
  // + 10 + 15 of meta + 16 + 53 of button + 17 of padding = 191. The button's 53
  // is 49 of face and 4 of ledge since 2026-09-16: its padding came down by 2 a
  // side to pay for the ledge, so the total did not move. The scrim's
  // deepening and the check's measuring band are both derived from that figure,
  // so changing a size here without changing it there moves the type out from
  // under the wash that protects it.
  body: { paddingHorizontal: 18, paddingBottom: 17 },
  title: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 34,
    lineHeight: 40,
    color: Cream,
    textShadowColor: 'rgba(0,0,0,0.55)',
    textShadowRadius: 8,
  },
  meta: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11.5,
    color: Faint,
    letterSpacing: 1.4,
    marginTop: 10,
    textTransform: 'uppercase',
  },
  ctaWrap: { alignSelf: 'stretch', marginTop: 16, paddingBottom: 4 },
  ctaLedge: {
    position: 'absolute', left: 0, right: 0, top: 4, bottom: 0,
    borderRadius: 12,
    backgroundColor: mix(Cream, Ink, 0.34),
  },
  cta: {
    alignItems: 'center',
    backgroundColor: Cream,
    borderRadius: 12,
    paddingVertical: 15,
  },
  ctaText: { fontFamily: 'Inter_700Bold', fontSize: 15, color: Ink, letterSpacing: 1.7 },
});
