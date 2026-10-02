// ─────────────────────────────────────────────────────────────────────────────
// HOME'S SUBJECT SHELF (2026-09-29) — swipe through them, tap one to open it.
//
// Brilliant's home is this shape, and the owner asked for it by name: large cards in
// one sideways row, each about four-fifths of the screen.
//
// ── ONE CARD PER SWIPE, AND NOTHING BUILT MID-SWIPE (2026-09-30) ─────────────
//
// "each swipe, no matter which way, will only go one", and "there's a little bit of
// lag". `snapToInterval` with `disableIntervalMomentum` stops at the NEXT card whatever
// the speed of the flick; it is a plain ScrollView of all seven, mounted once, and each
// poster is a pre-drawn PNG (posterArt.ts, `npm run make:posters`) — a windowed list
// and live SVG built the next card in the middle of the reader's swipe.
//
// ── AND THE SWIPE ITSELF IS THE ANIMATION (2026-09-30, same day) ─────────────
//
// "when shuffling from one to one … it feels kind of cheap and I want … a very smooth
// and a more visually appealing … experience." A row that merely slides is a list. Four
// things, all on the UI thread off ONE value — the shelf's scroll offset, read by a
// Reanimated scroll handler — so no React render happens while the reader swipes:
//
// - The chosen card is CENTRED, with a neighbour peeking in on BOTH sides, so the row
//   reads as a shelf the reader stands in front of rather than a list running off the
//   right edge.
// - A neighbour sits back: it scales to 0.92 and drops a few points, and comes forward
//   as it arrives — the one in front is the one you will open.
// - The picture slides AGAINST its card (PARALLAX, drawn into the PNG's margin), so the
//   scene has depth behind its frame.
// - A row of dots under the shelf stretches into a bar on the card in front, and a
//   light tick of haptics marks each card arriving.
//
// A tap opens that subject's road through `openSubject`, the one door into the Learn
// stack from outside it, marked `home` so the road's back returns here.
// ─────────────────────────────────────────────────────────────────────────────
import { memo, useMemo } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedScrollHandler, useAnimatedStyle, useAnimatedReaction,
  interpolate, interpolateColor, Extrapolation, runOnJS, type SharedValue,
} from 'react-native-reanimated';
import SubjectCard from '@/components/subjects/SubjectCard';
import { CARD_GAP, PARALLAX, cardWidth } from '@/components/subjects/tileLayout';
import { openSubject } from '@/components/lesson/lessonNav';
import { curtainTo } from '@/components/shared/Curtain';
import { SUBJECTS, type Subject } from '@/data/subjects';
import { branchCountsFromUnits } from '@/data';
import { useUserDataStore } from '@/stores/userDataStore';
import { touch } from '@/lib/feedback';
import { C } from '@/constants/design';
import SectionHead from './SectionHead';

/** How far a neighbour sits back. */
const BACK_SCALE = 0.92;
const BACK_DROP = 6;

function ShelfCard({
  subject, index, step, width, x, done,
}: {
  subject: Subject; index: number; step: number; width: number; x: SharedValue<number>; done: number;
}) {
  // -1 … 0 … 1: how far this card is from the front, in cards.
  const card = useAnimatedStyle(() => {
    const d = interpolate(x.value, [(index - 1) * step, index * step, (index + 1) * step], [-1, 0, 1], Extrapolation.CLAMP);
    const a = Math.abs(d);
    return { transform: [{ translateY: BACK_DROP * a }, { scale: 1 - (1 - BACK_SCALE) * a }] };
  });
  const art = useAnimatedStyle(() => {
    const d = interpolate(x.value, [(index - 1) * step, index * step, (index + 1) * step], [-1, 0, 1], Extrapolation.CLAMP);
    return { transform: [{ translateX: d * PARALLAX }] };
  });
  return (
    <Animated.View style={[index > 0 && styles.gap, card]}>
      <SubjectCard subject={subject} done={done} width={width} artStyle={art}
        // Behind the curtain: a fade through paper rather than the tab navigator's
        // fade, which snapped Home out (components/shared/Curtain.tsx).
        onPress={() => curtainTo(() => openSubject(subject.slug, 'home'))} />
    </Animated.View>
  );
}

function Dot({ index, step, x }: { index: number; step: number; x: SharedValue<number> }) {
  const style = useAnimatedStyle(() => {
    const near = interpolate(x.value, [(index - 1) * step, index * step, (index + 1) * step], [0, 1, 0], Extrapolation.CLAMP);
    // C.edge vanished into the wallpaper; a dot is a MARK, so it is ink at a strength
    // that still reads on the doodles, and the one in front is solid and long.
    return {
      width: 6 + 14 * near,
      backgroundColor: interpolateColor(near, [0, 1], [C.inkSoft, C.ink]),
      opacity: 0.45 + 0.55 * near,
    };
  });
  return <Animated.View style={[styles.dot, style]} />;
}

function SubjectCarousel({ pad, style }: { pad: number; style?: object }) {
  const { width } = useWindowDimensions();
  const w = cardWidth(width);
  const step = w + CARD_GAP;
  // Centred: the first and last cards stop in the middle of the screen too.
  const side = Math.round((width - w) / 2);
  const lessonsByUnit = useUserDataStore((s) => s.lessonsByUnit);
  const done = useMemo(() => branchCountsFromUnits(lessonsByUnit), [lessonsByUnit]);

  const x = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => { x.value = e.contentOffset.x; });
  // A light tick as each card arrives in front — on the card's arrival, not every frame.
  useAnimatedReaction(
    () => Math.round(x.value / step),
    (now, before) => { if (before !== null && now !== before) runOnJS(touch)(); },
    [step],
  );

  return (
    <View style={style}>
      <SectionHead>SUBJECTS</SectionHead>
      <Animated.ScrollView
        nativeID="subject-carousel"
        horizontal
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        // A card and its gap: every snap point centres a card, because the content's
        // own padding lays the first one in the middle of the screen.
        snapToInterval={step}
        snapToAlignment="start"
        disableIntervalMomentum
        decelerationRate="fast"
        removeClippedSubviews
        // The shelf runs to the screen's edges, so a card slides out from under the
        // page's own margin rather than being cut off at it.
        style={{ marginHorizontal: -pad, marginTop: 14 }}
        contentContainerStyle={{ paddingHorizontal: side, paddingTop: 2, paddingBottom: 8 }}
      >
        {SUBJECTS.map((s, i) => (
          <ShelfCard key={s.slug} subject={s} index={i} step={step} width={w} x={x}
            done={s.courses.reduce((n, c) => n + (done[c] ?? 0), 0)} />
        ))}
      </Animated.ScrollView>
      <View style={styles.dots} pointerEvents="none">
        {SUBJECTS.map((s, i) => <Dot key={s.slug} index={i} step={step} x={x} />)}
      </View>
    </View>
  );
}

export default memo(SubjectCarousel);

const styles = StyleSheet.create({
  gap: { marginLeft: CARD_GAP },
  dots: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: 6 },
  dot: { height: 6, borderRadius: 3 },
});
