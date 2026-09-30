// ─────────────────────────────────────────────────────────────────────────────
// HOME'S SUBJECT SHELF (2026-09-29) — swipe through them, tap one to open it.
//
// Brilliant's home is this shape, and the owner asked for it by name: large cards
// in one sideways row, each about four-fifths of the screen, so the next one PEEKS
// in from the right. The peek is the whole affordance — it says "there is more this
// way" without an arrow or a dot row, and it is why the width is a fraction of the
// screen rather than all of it.
//
// ── ONE CARD PER SWIPE, AND NOTHING BUILT MID-SWIPE (2026-09-30) ─────────────
//
// "each swipe, no matter which way, will only go one", and "there's a little bit of
// lag". Two causes, two fixes:
//
// - It snapped to OFFSETS with ordinary momentum, so a hard fling could carry past a
//   card and rest two along. `snapToInterval` with `disableIntervalMomentum` stops at
//   the NEXT card whatever the speed of the flick — one card each way, per swipe.
// - It was a windowed FlatList, which does JS work on every scroll event to decide
//   what to mount, and mounted each card as it came near — and a card's poster was an
//   <SvgXml>, parsed on the JS thread and built as one native view per path. So the
//   reader's own swipe was paying to build the next card. It is a plain ScrollView of
//   all seven now, mounted once, and each poster is a pre-drawn PNG (posterArt.ts,
//   `npm run make:posters`). `removeClippedSubviews` still detaches the cards off
//   screen on Android, which costs no JS to undo.
//
// A tap opens that subject's page through `openSubject`, the one door into the
// Learn stack from outside it, marked `home` so the page's back returns here.
// ─────────────────────────────────────────────────────────────────────────────
import { memo, useMemo } from 'react';
import { View, ScrollView, StyleSheet, useWindowDimensions } from 'react-native';
import SubjectCard from '@/components/subjects/SubjectCard';
import { CARD_GAP, cardWidth } from '@/components/subjects/tileLayout';
import { openSubject } from '@/components/lesson/lessonNav';
import { SUBJECTS } from '@/data/subjects';
import { branchCountsFromUnits } from '@/data';
import { useUserDataStore } from '@/stores/userDataStore';
import SectionHead from './SectionHead';

function SubjectCarousel({ pad, style }: { pad: number; style?: object }) {
  const { width } = useWindowDimensions();
  const w = cardWidth(width);
  const lessonsByUnit = useUserDataStore((s) => s.lessonsByUnit);
  const done = useMemo(() => branchCountsFromUnits(lessonsByUnit), [lessonsByUnit]);

  return (
    <View style={style}>
      <SectionHead>SUBJECTS</SectionHead>
      <ScrollView
        nativeID="subject-carousel"
        horizontal
        showsHorizontalScrollIndicator={false}
        // A card and its gap: every snap point is a card's left edge, laid at the
        // page's margin by the content's own left padding.
        snapToInterval={w + CARD_GAP}
        snapToAlignment="start"
        disableIntervalMomentum
        decelerationRate="fast"
        removeClippedSubviews
        // The shelf runs to the screen's edges, so a card slides out from under the
        // page's own margin rather than being cut off at it.
        style={{ marginHorizontal: -pad, marginTop: 14 }}
        contentContainerStyle={{ paddingHorizontal: pad, paddingBottom: 6 }}
      >
        {SUBJECTS.map((item, i) => (
          <View key={item.slug} style={i > 0 ? styles.gap : undefined}>
            <SubjectCard
              subject={item}
              done={item.courses.reduce((n, c) => n + (done[c] ?? 0), 0)}
              width={w}
              onPress={() => openSubject(item.slug, 'home')}
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

export default memo(SubjectCarousel);

const styles = StyleSheet.create({
  gap: { marginLeft: CARD_GAP },
});
