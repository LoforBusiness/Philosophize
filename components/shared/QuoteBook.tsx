import { useCallback, useEffect, useRef, useState } from 'react';
import { Modal, View, Text, Pressable, StyleSheet, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
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
const Page1 = '#F7F4EC'; // warm book paper
const Edge = '#DAD5C6'; // page-edge lines

// A book of a philosopher's quotes that slides up over their profile sheet, one
// quote per page. Pages turn with a real spine-flip: the top leaf lifts from the
// right and rotates away around the spine (left edge), revealing the next page
// beneath. Swipe or use the arrows.
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
  const H = Math.round(height * 0.8);

  const [mounted, setMounted] = useState(false);
  const [index, setIndex] = useState(0);
  // While a page is turning we render two leaves; null when at rest.
  const [anim, setAnim] = useState<{ from: number; to: number; dir: 1 | -1 } | null>(null);
  const animatingRef = useRef(false);

  const flip = useSharedValue(0);
  const dirSV = useSharedValue<1 | -1>(1);

  const quotes: PhilosopherQuote[] = philosopher?.quotes ?? [];
  const N = quotes.length;

  useEffect(() => {
    if (visible) {
      setMounted(true);
      setIndex(0);
      setAnim(null);
      animatingRef.current = false;
      flip.value = 0;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, philosopher?.id]);

  const commit = useCallback(
    (to: number) => {
      setIndex(to);
      setAnim(null);
      animatingRef.current = false;
      flip.value = 0;
    },
    [flip]
  );

  const go = useCallback(
    (d: 1 | -1) => {
      if (animatingRef.current) return;
      const to = index + d;
      if (to < 0 || to >= N) return;
      animatingRef.current = true;
      dirSV.value = d;
      flip.value = 0;
      setAnim({ from: index, to, dir: d });
      flip.value = withTiming(1, { duration: 620, easing: Easing.inOut(Easing.cubic) }, (fin) => {
        if (fin) runOnJS(commit)(to);
      });
    },
    [index, N, commit, flip, dirSV]
  );

  const pan = Gesture.Pan()
    .activeOffsetX([-12, 12])
    .failOffsetY([-18, 18])
    .onEnd((e) => {
      'worklet';
      if (e.translationX < -44 || e.velocityX < -350) runOnJS(go)(1);
      else if (e.translationX > 44 || e.velocityX > 350) runOnJS(go)(-1);
    });

  // The moving leaf: forward it's the outgoing page (rotates 0→-170), backward
  // it's the arriving page (rotates -170→0). Around the spine (left edge).
  const overStyle = useAnimatedStyle(() => {
    const rot =
      dirSV.value === 1
        ? interpolate(flip.value, [0, 1], [0, -170])
        : interpolate(flip.value, [0, 1], [-170, 0]);
    return { transform: [{ perspective: 1400 }, { rotateY: `${rot}deg` }] };
  });
  // Shadow the lifting leaf casts on itself as it turns.
  const shadeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(flip.value, [0, 0.5, 1], [0, 0.42, 0]),
  }));

  if (!mounted || !philosopher) return null;

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

            {/* Book stage */}
            <GestureDetector gesture={pan}>
              <View style={styles.stage}>
                <View style={styles.book}>
                  {/* stacked page-edges on the right */}
                  <View style={[styles.edge, { right: 5 }]} />
                  <View style={[styles.edge, { right: 9, top: 14, bottom: 14, opacity: 0.6 }]} />
                  {/* the spine on the left */}
                  <View style={styles.spine} />
                  <View style={styles.spineStitch} />

                  {/* page area (rotation pivots on its left = the spine) */}
                  <View style={styles.pageArea}>
                    {underIdx != null && (
                      <View style={StyleSheet.absoluteFill}>
                        <QuotePage quote={quotes[underIdx]} philosopher={philosopher} />
                      </View>
                    )}
                    <Animated.View style={[StyleSheet.absoluteFill, styles.leaf, overStyle]}>
                      <QuotePage quote={quotes[overIdx]} philosopher={philosopher} />
                      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.shade, shadeStyle]} />
                    </Animated.View>
                  </View>
                </View>
              </View>
            </GestureDetector>

            {/* Footer nav */}
            <View style={styles.footer}>
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

  stage: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18, paddingVertical: 6 },
  book: {
    flex: 1,
    alignSelf: 'stretch',
    borderWidth: 2,
    borderColor: Ink,
    borderRadius: 16,
    backgroundColor: Page1,
    marginVertical: 6,
  },
  edge: {
    position: 'absolute',
    top: 8,
    bottom: 8,
    width: 1.5,
    backgroundColor: Edge,
    borderRadius: 1,
  },
  spine: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 16,
    backgroundColor: '#EFEADD',
    borderRightWidth: 1.5,
    borderRightColor: Edge,
    borderTopLeftRadius: 14,
    borderBottomLeftRadius: 14,
  },
  spineStitch: {
    position: 'absolute',
    left: 7,
    top: 22,
    bottom: 22,
    width: 1.5,
    borderLeftWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#C9C3B2',
  },
  pageArea: {
    position: 'absolute',
    left: 16,
    right: 0,
    top: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  leaf: {
    transformOrigin: 'left',
    backfaceVisibility: 'hidden',
    backgroundColor: Page1,
  },
  shade: { backgroundColor: '#000' },

  page: { flex: 1, paddingHorizontal: 26, paddingTop: 10, paddingBottom: 18, justifyContent: 'center' },
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

  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 30, paddingTop: 6, paddingBottom: 18 },
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
