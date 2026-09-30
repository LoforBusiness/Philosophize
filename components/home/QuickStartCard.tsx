import { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Image, Dimensions, type LayoutChangeEvent } from 'react-native';
import { openLesson } from '@/components/lesson/lessonNav';
import { openIntro, PROFESSOR_INTRO_ON } from '@/components/professor/openIntro';
import Card from '@/components/ui/Card';
import { mix } from '@/components/shared/tone';
import { useUserDataStore } from '@/stores/userDataStore';
import { pickQuickStart, quickStartArtIndex } from '@/lib/utils/quickStart';
import { subjectOfBranch } from '@/data/subjects';
import { QS_ART } from './quickStartArt';
import { qsLayout, QS_CANVAS, type QsSubject } from './quickStartScenes';
import {
  qsCardHeight,
  QS_BODY_DP,
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

// THE PICTURE POINTS AT WHERE THE CARD GOES (2026-09-29). Each subject has three
// drawn scenes (components/home/quickStartScenes.ts, rendered by `npm run
// make:quickstart`), and the day picks one — on the DATE only, so finishing a lesson
// swaps the lesson under the same picture rather than changing everything at once.
//
// There is no scrim. Every scene stands on a horizon with a dark ground below it,
// and the card slides the picture so that horizon lands just above the title: the
// words sit on the scene's own ground, a flat colour, so their contrast is decided
// by construction (`npm run check:quickstart` measures it) and never by the art.

interface Props {
  style?: object;
}

/**
 * The one big invitation on the home screen: the next lesson this learner can
 * actually open, on a different branch each day, over a photograph.
 *
 * Once every lesson on every road is finished it offers one to READ AGAIN rather
 * than disappearing (`pick.again`) — Home without its biggest card reads as broken.
 *
 * AND UNTIL THE PROFESSOR'S INTRO HAS BEEN WATCHED, IT IS THE INTRO (2026-09-25).
 * The same card, the same sky, the same ledge — it is the first door into the
 * lessons, and it only ever opens when the reader presses it. Nothing plays the
 * intro by itself; this card and the Learn tab are its two doors.
 */
export default function QuickStartCard({ style }: Props) {
  const lessonsByUnit = useUserDataStore((s) => s.lessonsByUnit);
  const startingBranch = useUserDataStore((s) => s.startingBranch);
  const introSeen = useUserDataStore((s) => s.seenProfessorIntro);

  const dayNumber = Math.floor(Date.now() / 86_400_000);
  const pick = useMemo(
    () => pickQuickStart(lessonsByUnit, dayNumber, startingBranch),
    [lessonsByUnit, dayNumber, startingBranch],
  );
  // The card is as wide as Home gives it; until it has measured, the window less
  // the page's padding is within a few points of the truth.
  const [w, setW] = useState(Dimensions.get('window').width - 32);
  const onLayout = (e: LayoutChangeEvent) => {
    const next = Math.round(e.nativeEvent.layout.width);
    if (next > 0 && next !== w) setW(next);
  };

  // The intro comes first, and it is offered even to a reader with nothing left to
  // read, so the card's early return sits BELOW it.
  const intro = PROFESSOR_INTRO_ON && !introSeen;
  // The intro is a philosophy lecture, so it opens on philosophy's pictures.
  const subject = ((intro ? 'philosophy' : subjectOfBranch(pick?.branch.slug ?? '')?.slug) ?? 'philosophy') as QsSubject;
  const set = QS_ART[subject] ?? QS_ART.philosophy;
  const art = set[quickStartArtIndex(dayNumber, set.length)];
  const L = qsLayout(w, QS_CARD_H, QS_BODY_DP);
  const size = QS_CANVAS * L.s;
  if (!intro && !pick) return null;

  // Through lessonNav, ANCHORED: pushed plainly from Home into a Learn tab not yet
  // built, the lesson arrived with no branch list under it (see lessonNav.ts).
  const open = intro
    ? () => openIntro('home')
    : () => pick && openLesson(pick.branch.slug, pick.unit.slug, pick.lesson.id);
  // The intro's words. Short on purpose: the title is 34pt in a card that is 236pt
  // wide on a 320dp phone, and it has two lines.
  // The tab says only what the card is: a long branch name up there ran into the
  // picture on a narrow phone, so where it goes is in the line under the title.
  const tab = intro ? 'QUICK START · INTRO' : 'QUICK START';
  const title = intro ? 'Your first lecture' : pick!.lesson.title;
  const meta = intro ? 'WITH THE PROFESSOR · 1 MIN' : `${pick!.branch.name} · ${pick!.lesson.estimatedMinutes} MIN`;
  const cta = intro ? '▶   START THE INTRO' : pick!.again ? '▶   READ IT AGAIN' : '▶   START LESSON';

  return (
    // ON THE TEAL LEDGE (2026-09-16), like the app's primary button: the card is
    // the one big thing on Home you press, so it stands on a solid ledge and sinks
    // onto it rather than shrinking. The hard offset shadow it carried is gone.
    <Card tone="ink" onPress={open} pad={0} style={styles.card} containerStyle={style} accessibilityLabel={`Start ${title}`}>
      <View style={[styles.bg, { backgroundColor: art.ground }]} onLayout={onLayout}>
        {/* Above the picture — only on a card tall enough to show past its top —
            the scene's own sky; below it, its ground, which is the card's face. */}
        <View pointerEvents="none" style={[styles.sky, { height: Math.max(0, L.top) + 2, backgroundColor: art.sky }]} />
        <Image
          source={art.source}
          style={{ position: 'absolute', left: L.left, top: L.top, width: size, height: size }}
          resizeMode="stretch"
          accessibilityIgnoresInvertColors
        />

        {/* The label rides an ink tab rather than the picture. Loose on the thin
            top wash it measured 1.36:1 over four of the five skies; on ink it is
            15:1 whatever the crop lands on, and it echoes the DAILY REFLECTION
            tab directly above it on this screen. */}
        <View style={styles.top}>
          <View style={styles.tab}>
            <Text style={styles.tabText} numberOfLines={1}>
              {tab}
            </Text>
          </View>
        </View>

        <View style={styles.body}>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
          <Text style={styles.meta} numberOfLines={1}>
            {meta}
          </Text>

          {/* Full width, not a pill. The whole card has always been tappable, but
              a small button in a corner reads as the only live thing on it — the
              bar says the card is the target. */}
          {/* A BUTTON ON ITS OWN LEDGE, not a cream strip. It sinks with the
              card rather than on its own: the whole card is the target. */}
          <View style={styles.ctaWrap}>
            <View style={styles.ctaLedge} />
            <View style={styles.cta}>
              <Text style={styles.ctaText}>{cta}</Text>
            </View>
          </View>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    // Card draws the ink face, its 2px edge and the ledge; the picture is
    // clipped to the face's corners.
    overflow: 'hidden',
    // The thin ink frame round the picture. It used to come from Card's pad={0},
    // which meant 4 until 2026-09-30; it is stated here now so the card keeps it.
    padding: 4,
  },
  bg: { width: '100%', height: QS_CARD_H, justifyContent: 'space-between', overflow: 'hidden', borderRadius: 14 },
  sky: { position: 'absolute', left: 0, right: 0, top: 0 },

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
