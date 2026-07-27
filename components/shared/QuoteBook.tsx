import { useCallback, useEffect, useRef, useState } from 'react';
import { Modal, View, Text, Pressable, StyleSheet, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { MotiView, AnimatePresence } from 'moti';
import SketchIcon from './SketchIcon';
import { useUserDataStore } from '@/stores/userDataStore';
import type { Philosopher, PhilosopherQuote } from '@/data/philosophers';

const Paper = '#FAFAF7';
const Ink = '#1A1A1A';
const InkSoft = '#6B6B6B';
const InkFaint = '#E8E8E3';
const Page1 = '#F7F4EC';   // warm book paper
const Page2 = '#F1ECDF';   // the leaf underneath, a shade deeper
const Board = '#221F1A';   // the cover boards
const Edge = '#CFC8B6';    // page-edge lines

const TURN_MS = 520;

// A book of a philosopher's quotes that slides up over their profile sheet, one
// quote per page.
//
// Built to actually read as a BOOK rather than a rounded rectangle: a dark cover
// board wrapping a warm page block, a stitched spine down the left, a stack of
// page edges standing proud on the fore-edge, and a gutter shadow where the page
// curves into the binding. Corners follow the real thing — square against the
// spine, rounded on the outer edge — on the block AND on the turning leaf, so a
// page never flips as a bare rectangle.
export default function QuoteBook({
  visible,
  philosopher,
  onClose,
}: {
  visible: boolean;
  philosopher: Philosopher | null;
  onClose: () => void;
}) {
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const H = Math.round(height * 0.8);

  const [mounted, setMounted] = useState(false);
  const [index, setIndex] = useState(0);
  // While a page is turning we render two leaves; null when at rest.
  const [anim, setAnim] = useState<{ from: number; to: number; dir: 1 | -1 } | null>(null);
  const animatingRef = useRef(false);

  const flip = useSharedValue(0);
  const dirSV = useSharedValue<1 | -1>(1);
  // 0 while the book is at rest. The rotation is read ONLY when this is 1, which
  // is what keeps a resting page flat — see the note on `leafStyle`.
  const turning = useSharedValue(0);

  const quotes: PhilosopherQuote[] = philosopher?.quotes ?? [];
  const N = quotes.length;

  useEffect(() => {
    if (visible) {
      setMounted(true);
      setIndex(0);
      setAnim(null);
      animatingRef.current = false;
      flip.value = 0;
      turning.value = 0;
      dirSV.value = 1;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, philosopher?.id]);

  const commit = useCallback(
    (to: number) => {
      setIndex(to);
      setAnim(null);
      animatingRef.current = false;
      turning.value = 0;
      flip.value = 0;
      dirSV.value = 1;
    },
    [flip, turning, dirSV]
  );

  // `go` only records the intent. Starting the animation here too would begin
  // rotating the leaf a frame BEFORE React has swapped in the leaf's new content
  // — on a backward turn that flashed the current page rotated hard away. The
  // effect below starts the turn once the new leaf is actually on screen.
  const go = useCallback(
    (d: 1 | -1) => {
      if (animatingRef.current) return;
      const to = index + d;
      if (to < 0 || to >= N) return;
      animatingRef.current = true;
      setAnim({ from: index, to, dir: d });
    },
    [index, N]
  );

  useEffect(() => {
    if (!anim) return;
    dirSV.value = anim.dir;
    turning.value = 1;
    flip.value = 0;
    flip.value = withTiming(1, { duration: TURN_MS, easing: Easing.inOut(Easing.cubic) }, (fin) => {
      if (fin) runOnJS(commit)(anim.to);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anim]);

  const pan = Gesture.Pan()
    .activeOffsetX([-12, 12])
    .failOffsetY([-18, 18])
    .onEnd((e) => {
      'worklet';
      if (e.translationX < -44 || e.velocityX < -350) runOnJS(go)(1);
      else if (e.translationX > 44 || e.velocityX > 350) runOnJS(go)(-1);
    });

  // The moving leaf. Forward it is the outgoing page (0 → -168); backward it is
  // the arriving page (-168 → 0). It pivots on its left edge — the spine.
  //
  // At rest the rotation is forced flat instead of being read from `flip`. The
  // backward mapping puts flip=0 at -168deg, so when the turn finished and flip
  // was reset to 0 the page snapped edge-on and vanished. That was the glitch.
  const leafStyle = useAnimatedStyle(() => {
    if (turning.value === 0) {
      return { transform: [{ perspective: 1200 }, { rotateY: '0deg' }, { translateX: 0 }] };
    }
    const rot =
      dirSV.value === 1
        ? interpolate(flip.value, [0, 1], [0, -168])
        : interpolate(flip.value, [0, 1], [-168, 0]);
    // A whisper of lift off the spine through the middle of the arc, so the page
    // peels rather than pivoting like a door.
    const lift = interpolate(flip.value, [0, 0.5, 1], [0, 3, 0]);
    return {
      transform: [{ perspective: 1200 }, { rotateY: `${rot}deg` }, { translateX: lift }],
    };
  });

  // The turning leaf darkens as it swings edge-on to the light.
  const leafShadeStyle = useAnimatedStyle(() => ({
    opacity: turning.value === 0 ? 0 : interpolate(flip.value, [0, 0.45, 1], [0, 0.5, 0.06]),
  }));

  // The page underneath is in shadow while the leaf is still over it, brightening
  // as the leaf clears — this is what gives the turn its sense of depth.
  const underShadeStyle = useAnimatedStyle(() => ({
    opacity: turning.value === 0 ? 0 : interpolate(flip.value, [0, 0.55, 1], [0.34, 0.16, 0]),
  }));

  if (!mounted || !philosopher) return null;

  // `under` is the page that stays put through the turn, `over` the one that moves.
  const overIdx = anim ? (anim.dir === 1 ? anim.from : anim.to) : index;
  const underIdx = anim ? (anim.dir === 1 ? anim.to : anim.from) : null;
  const atFirst = index <= 0;
  const atLast = index >= N - 1;

  return (
    <Modal visible transparent animationType="none" statusBarTranslucent onRequestClose={onClose}>
      {/* Gestures inside a RN Modal are dead on Android unless the modal content
          has its own gesture root — swipe-to-turn depends on this. */}
      <GestureHandlerRootView style={{ flex: 1 }}>
        <MotiView
          animate={{ opacity: visible ? 1 : 0 }}
          transition={{ type: 'timing', duration: 240 }}
          style={styles.backdrop}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </MotiView>

        <AnimatePresence onExitComplete={() => setMounted(false)}>
          {visible && (
            <MotiView
              key="book"
              from={{ translateY: H }}
              animate={{ translateY: 0 }}
              exit={{ translateY: H }}
              transition={{ type: 'timing', duration: 460, easing: Easing.out(Easing.cubic) }}
              style={[styles.sheet, { height: H }]}
            >
              <View style={styles.handle} />

              {/* Header */}
              <View style={styles.header}>
                <Pressable onPress={onClose} hitSlop={10} style={styles.hBtn}>
                  <SketchIcon name="close" size={16} color={Ink} />
                </Pressable>
                <View style={styles.hTitleWrap}>
                  <Text style={styles.hKicker}>THE QUOTES OF</Text>
                  <Text style={styles.hName} numberOfLines={1}>
                    {philosopher.name}
                  </Text>
                </View>
                <View style={styles.hCount}>
                  <Text style={styles.hCountText}>
                    {Math.min(index + 1, N)}/{N}
                  </Text>
                </View>
              </View>

              {/* Book */}
              <GestureDetector gesture={pan}>
                <View style={styles.stage}>
                  {/* the cover board: dark, rounded, showing as a thin edge all
                      round the paper and a wider band down the spine */}
                  <View style={styles.cover}>
                    {/* head and tail bands, the way a bound spine is finished */}
                    <View style={[styles.band, { top: 16 }]} />
                    <View style={[styles.band, { bottom: 16 }]} />
                    <View style={styles.stitch} />

                    <View style={styles.block}>
                      {/* the fore-edge: a stack of page edges standing proud, each
                          one shorter and fainter, so the block reads as thick */}
                      {EDGES.map((e, i) => (
                        <View
                          key={i}
                          style={[
                            styles.edge,
                            { right: e.right, top: e.inset, bottom: e.inset, opacity: e.opacity },
                          ]}
                        />
                      ))}

                      {/* pages rotate here; clipped so a turning leaf cannot cross
                          the spine or escape the block */}
                      <View style={styles.pageArea}>
                        {underIdx != null && (
                          <View style={[StyleSheet.absoluteFill, styles.underLeaf]}>
                            <QuotePage quote={quotes[underIdx]} philosopher={philosopher} />
                            <Animated.View
                              pointerEvents="none"
                              style={[StyleSheet.absoluteFill, styles.shade, underShadeStyle]}
                            />
                          </View>
                        )}

                        <Animated.View style={[StyleSheet.absoluteFill, styles.leaf, leafStyle]}>
                          <QuotePage quote={quotes[overIdx]} philosopher={philosopher} />
                          <Animated.View
                            pointerEvents="none"
                            style={[StyleSheet.absoluteFill, styles.shade, leafShadeStyle]}
                          />
                        </Animated.View>

                        {/* the gutter: paper curving down into the binding. Stacked
                            translucent bars rather than a gradient, which keeps it
                            to plain Views. Sits above the pages, so a turning leaf
                            passes beneath it and looks bound in. */}
                        <View pointerEvents="none" style={styles.gutter}>
                          {GUTTER.map((g, i) => (
                            <View key={i} style={[styles.gutterBar, { width: g.w, opacity: g.o }]} />
                          ))}
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              </GestureDetector>

              {/* Footer nav */}
              <View style={[styles.footer, { paddingBottom: 18 + insets.bottom }]}>
                <Pressable
                  onPress={() => go(-1)}
                  disabled={atFirst}
                  hitSlop={12}
                  style={[styles.arrow, atFirst && styles.arrowOff]}
                >
                  <SketchIcon name="back" size={18} color={atFirst ? InkFaint : Ink} />
                </Pressable>

                <Text style={styles.footerHint}>SWIPE TO TURN</Text>

                <Pressable
                  onPress={() => go(1)}
                  disabled={atLast}
                  hitSlop={12}
                  style={[styles.arrow, styles.arrowNext, atLast && styles.arrowOff]}
                >
                  <SketchIcon name="back" size={18} color={atLast ? InkFaint : Ink} />
                </Pressable>
              </View>
            </MotiView>
          )}
        </AnimatePresence>
      </GestureHandlerRootView>
    </Modal>
  );
}

/** The fore-edge stack — nearer edges are taller and darker. */
const EDGES = [
  { right: -3, inset: 3, opacity: 0.9 },
  { right: -6, inset: 6, opacity: 0.62 },
  { right: -9, inset: 9.5, opacity: 0.4 },
  { right: -12, inset: 13, opacity: 0.24 },
  { right: -15, inset: 17, opacity: 0.13 },
];

/** The gutter falloff, widest and faintest last. */
const GUTTER = [
  { w: 5, o: 0.13 },
  { w: 9, o: 0.075 },
  { w: 15, o: 0.045 },
  { w: 24, o: 0.022 },
];

// One page of the book: a quote, the author, and save/feature controls.
// Takes the whole philosopher so a saved/featured quote links back correctly
// (same records the profile sheet writes).
function QuotePage({ quote, philosopher }: { quote: PhilosopherQuote; philosopher: Philosopher }) {
  const saved = useUserDataStore((s) => s.savedQuotes.some((q) => q.id === quote.id));
  const toggleQuote = useUserDataStore((s) => s.toggleQuote);
  const featured = useUserDataStore((s) => s.profileQuote?.id === quote.id);
  const setProfileQuote = useUserDataStore((s) => s.setProfileQuote);

  return (
    <View style={styles.page}>
      <Text style={styles.mark}>“</Text>
      <View style={styles.quoteWrap}>
        <Text style={styles.quote} adjustsFontSizeToFit numberOfLines={10} minimumFontScale={0.6}>
          {quote.text}
        </Text>
      </View>
      <View style={styles.pageRule} />
      <Text style={styles.author}>— {philosopher.name.toUpperCase()}</Text>

      <View style={styles.pageActions}>
        <Pressable
          hitSlop={10}
          onPress={() =>
            toggleQuote({
              id: quote.id,
              text: quote.text,
              author: philosopher.name,
              philosopherId: philosopher.id,
              branchSlugs: philosopher.branchSlugs,
              savedAt: Date.now(),
            })
          }
          style={styles.pageActionBtn}
        >
          <SketchIcon name={saved ? 'bookmark-filled' : 'bookmark'} size={20} color={saved ? Ink : InkSoft} />
        </Pressable>
        <Pressable
          hitSlop={10}
          onPress={() =>
            setProfileQuote(
              featured ? null : { id: quote.id, text: quote.text, author: philosopher.name, philosopherId: philosopher.id }
            )
          }
          style={styles.pageActionBtn}
        >
          <SketchIcon name={featured ? 'star-filled' : 'star'} size={20} color={featured ? Ink : InkSoft} />
        </Pressable>
      </View>
    </View>
  );
}

// Corners, in one place. A real book is square where it is bound and rounded on
// the outer edge — applying one uniform radius is most of why this read as a
// rounded rectangle before.
const PAGE_CORNERS = {
  borderTopLeftRadius: 2,
  borderBottomLeftRadius: 2,
  borderTopRightRadius: 9,
  borderBottomRightRadius: 9,
} as const;

const styles = StyleSheet.create({
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Paper,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 2,
    borderColor: Ink,
    overflow: 'hidden',
  },
  handle: { width: 44, height: 5, borderRadius: 3, backgroundColor: InkFaint, alignSelf: 'center', marginTop: 10, marginBottom: 4 },

  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 6, paddingBottom: 12, gap: 12 },
  hBtn: {
    width: 34,
    height: 34,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: Ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hTitleWrap: { flex: 1, alignItems: 'center' },
  hKicker: { fontFamily: 'Inter_500Medium', fontSize: 9, color: InkSoft, letterSpacing: 2.5 },
  hName: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 19, color: Ink, marginTop: 1 },
  hCount: { minWidth: 40, alignItems: 'flex-end' },
  hCountText: { fontFamily: 'Inter_500Medium', fontSize: 12, color: InkSoft, letterSpacing: 1 },

  // Room on the right for the fore-edge stack to stand outside the page block.
  stage: { flex: 1, paddingLeft: 16, paddingRight: 34, paddingVertical: 10 },

  cover: {
    flex: 1,
    backgroundColor: Board,
    borderTopLeftRadius: 5,
    borderBottomLeftRadius: 5,
    borderTopRightRadius: 13,
    borderBottomRightRadius: 13,
    paddingLeft: 15,
    paddingRight: 4,
    paddingVertical: 4,
  },
  band: { position: 'absolute', left: 3, width: 9, height: 3, borderRadius: 2, backgroundColor: '#6E6552' },
  stitch: {
    position: 'absolute',
    left: 7,
    top: 30,
    bottom: 30,
    width: 0,
    borderLeftWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#5C5546',
  },

  block: {
    flex: 1,
    backgroundColor: Page1,
    ...PAGE_CORNERS,
  },
  edge: {
    position: 'absolute',
    width: 2,
    backgroundColor: Edge,
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
  },

  pageArea: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    overflow: 'hidden',
    ...PAGE_CORNERS,
  },

  underLeaf: { backgroundColor: Page2, ...PAGE_CORNERS },
  leaf: {
    transformOrigin: 'left',
    backfaceVisibility: 'hidden',
    backgroundColor: Page1,
    ...PAGE_CORNERS,
  },
  shade: { backgroundColor: '#000' },

  gutter: { position: 'absolute', left: 0, top: 0, bottom: 0, flexDirection: 'row' },
  gutterBar: { position: 'absolute', left: 0, top: 0, bottom: 0, backgroundColor: '#000' },

  page: { flex: 1, paddingLeft: 30, paddingRight: 26, paddingTop: 10, paddingBottom: 18, justifyContent: 'center' },
  mark: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 64,
    lineHeight: 64,
    color: '#D8D2C2',
    marginBottom: -6,
  },
  quoteWrap: { minHeight: 120, justifyContent: 'center' },
  quote: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontStyle: 'italic',
    fontSize: 23,
    lineHeight: 34,
    color: Ink,
  },
  pageRule: { height: 1.5, width: 40, backgroundColor: Ink, marginTop: 22, marginBottom: 12 },
  author: { fontFamily: 'Inter_700Bold', fontSize: 11, color: InkSoft, letterSpacing: 1.5 },
  pageActions: { flexDirection: 'row', gap: 8, position: 'absolute', right: 22, bottom: 16 },
  pageActionBtn: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },

  // paddingBottom is applied inline with the safe-area inset: this sheet is
  // anchored to bottom:0, so on a device with a nav bar the arrows sat underneath it.
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 30, paddingTop: 6 },
  arrow: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1.5,
    borderColor: Ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowNext: { transform: [{ scaleX: -1 }] },
  arrowOff: { borderColor: InkFaint },
  footerHint: { fontFamily: 'Inter_700Bold', fontSize: 10, color: InkSoft, letterSpacing: 2 },
});
