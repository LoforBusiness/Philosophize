// ─────────────────────────────────────────────────────────────────────────────
// HOME'S SUBJECT SHELF (2026-09-29) — swipe through them, tap one to open it.
//
// Brilliant's home is this shape, and the owner asked for it by name: large cards
// in one sideways row, each about four-fifths of the screen, so the next one PEEKS
// in from the right. The peek is the whole affordance — it says "there is more this
// way" without an arrow or a dot row, and it is why the width is a fraction of the
// screen rather than all of it.
//
// It SNAPS a card at a time: a shelf that can come to rest half on one card and half
// on the next is a shelf the reader has to tidy. The offsets are the cards' own
// left edges, measured in the same numbers the cards are laid out with.
//
// A tap opens that subject's page through `openSubject`, the one door into the
// Learn stack from outside it, marked `home` so the page's back returns here.
// ─────────────────────────────────────────────────────────────────────────────
import { useMemo } from 'react';
import { View, FlatList, StyleSheet, useWindowDimensions } from 'react-native';
import SubjectCard from '@/components/subjects/SubjectCard';
import { CARD_GAP, cardWidth } from '@/components/subjects/tileLayout';
import { openSubject } from '@/components/lesson/lessonNav';
import { SUBJECTS } from '@/data/subjects';
import { branchCountsFromUnits } from '@/data';
import { useUserDataStore } from '@/stores/userDataStore';
import SectionHead from './SectionHead';

export default function SubjectCarousel({ pad, style }: { pad: number; style?: object }) {
  const { width } = useWindowDimensions();
  const w = cardWidth(width);
  const lessonsByUnit = useUserDataStore((s) => s.lessonsByUnit);
  const done = useMemo(() => branchCountsFromUnits(lessonsByUnit), [lessonsByUnit]);
  const offsets = useMemo(() => SUBJECTS.map((_, i) => i * (w + CARD_GAP)), [w]);

  return (
    <View style={style}>
      <SectionHead>SUBJECTS</SectionHead>
      <FlatList
        nativeID="subject-carousel"
        horizontal
        data={SUBJECTS}
        keyExtractor={(s) => s.slug}
        showsHorizontalScrollIndicator={false}
        snapToOffsets={offsets}
        decelerationRate="fast"
        // WINDOWED. Each card's poster is an <Svg> painted into a bitmap the size of
        // its box (§19's GPU rule), and Home is built for the whole session — so only
        // the card on screen and its neighbours are mounted, never all seven.
        initialNumToRender={2}
        maxToRenderPerBatch={2}
        windowSize={3}
        removeClippedSubviews
        // The shelf runs to the screen's edges, so a card slides out from under the
        // page's own margin rather than being cut off at it.
        style={{ marginHorizontal: -pad, marginTop: 14 }}
        contentContainerStyle={{ paddingHorizontal: pad, paddingBottom: 6 }}
        ItemSeparatorComponent={() => <View style={styles.gap} />}
        renderItem={({ item }) => (
          <SubjectCard
            subject={item}
            done={item.courses.reduce((n, c) => n + (done[c] ?? 0), 0)}
            width={w}
            onPress={() => openSubject(item.slug, 'home')}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  gap: { width: CARD_GAP },
});
