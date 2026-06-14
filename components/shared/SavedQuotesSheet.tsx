import { useEffect, useState } from 'react';
import { Modal, View, Text, Pressable, ScrollView, StyleSheet, useWindowDimensions } from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import SketchIcon from './SketchIcon';
import { useUIStore } from '@/stores/uiStore';
import { useUserDataStore, type SavedQuote } from '@/stores/userDataStore';
import { ALL_PHILOSOPHERS } from '@/data/philosophers';

const Paper = '#FAFAF7';
const Ink = '#1A1A1A';
const InkSoft = '#6B6B6B';
const InkFaint = '#D9D7CE';
const Dim = '#C9C6BC';

// The user's full saved-quote collection, slid up from the Profile. Each quote
// reads like a little keepsake card; tapping it opens that thinker's profile,
// and the filled bookmark removes it from the collection. Matches the
// RanksBadgesSheet / PhilosopherSheet bottom-sheet pattern.
export default function SavedQuotesSheet() {
  const open = useUIStore((s) => s.savedQuotesOpen);
  const close = useUIStore((s) => s.closeSavedQuotes);
  const openPhilosopher = useUIStore((s) => s.openPhilosopher);
  const savedQuotes = useUserDataStore((s) => s.savedQuotes);
  const removeQuote = useUserDataStore((s) => s.removeQuote);

  const { height } = useWindowDimensions();
  const H = Math.round(height * 0.82);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) setVisible(true);
  }, [open]);

  if (!visible) return null;

  const eraFor = (philosopherId: string) =>
    ALL_PHILOSOPHERS.find((p) => p.id === philosopherId)?.era ?? null;

  // Open the thinker behind a quote: dismiss this sheet, then raise the
  // philosopher sheet so they don't stack.
  const openThinker = (q: SavedQuote) => {
    close();
    openPhilosopher(q.philosopherId);
  };

  return (
    <Modal visible transparent animationType="none" statusBarTranslucent onRequestClose={close}>
      <MotiView
        animate={{ opacity: open ? 1 : 0 }}
        transition={{ type: 'timing', duration: 240 }}
        style={styles.backdrop}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={close} />
      </MotiView>

      <AnimatePresence onExitComplete={() => setVisible(false)}>
        {open && (
          <MotiView
            key="sheet"
            from={{ translateY: H }}
            animate={{ translateY: 0 }}
            exit={{ translateY: H }}
            transition={{ type: 'timing', duration: 340 }}
            style={[styles.sheet, { height: H }]}
          >
            <View style={styles.handle} />

            <View style={styles.inner}>
              <View style={styles.titleRow}>
                <Text style={styles.title}>
                  Saved <Text style={styles.titleItalic}>Quotes</Text>
                </Text>
                {savedQuotes.length > 0 && <Text style={styles.count}>{savedQuotes.length}</Text>}
              </View>

              {savedQuotes.length === 0 ? (
                <View style={styles.empty}>
                  <View style={styles.emptyIcon}>
                    <SketchIcon name="bookmark" size={30} color={InkFaint} />
                  </View>
                  <Text style={styles.emptyTitle}>No quotes saved yet</Text>
                  <Text style={styles.emptyHint}>
                    Tap “Save quote” on a lesson’s quote card and it will be kept here.
                  </Text>
                </View>
              ) : (
                <ScrollView
                  style={{ flex: 1 }}
                  contentContainerStyle={styles.list}
                  showsVerticalScrollIndicator={false}
                >
                  {savedQuotes.map((q) => (
                    <QuoteCard
                      key={q.id}
                      q={q}
                      era={eraFor(q.philosopherId)}
                      onOpen={() => openThinker(q)}
                      onRemove={() => removeQuote(q.id)}
                    />
                  ))}
                </ScrollView>
              )}
            </View>
          </MotiView>
        )}
      </AnimatePresence>
    </Modal>
  );
}

function QuoteCard({
  q,
  era,
  onOpen,
  onRemove,
}: {
  q: SavedQuote;
  era: string | null;
  onOpen: () => void;
  onRemove: () => void;
}) {
  return (
    <View style={styles.card}>
      <Pressable onPress={onOpen} style={({ pressed }) => [styles.cardBody, pressed && { opacity: 0.6 }]}>
        <Text style={styles.mark}>“</Text>
        <Text style={styles.quote}>{q.text}</Text>
        <View style={styles.rule} />
        <View style={styles.byline}>
          <View style={{ flex: 1 }}>
            <Text style={styles.author}>{q.author}</Text>
            {era ? <Text style={styles.era}>{era}</Text> : null}
          </View>
          {/* mirrored "back" chevron → a hand-drawn forward chevron */}
          <View style={styles.chev}>
            <SketchIcon name="back" size={13} color={InkSoft} />
          </View>
        </View>
      </Pressable>

      <Pressable onPress={onRemove} hitSlop={10} style={({ pressed }) => [styles.unsave, pressed && { opacity: 0.6 }]}>
        <SketchIcon name="bookmark-filled" size={17} color={Ink} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)' },
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
  handle: { width: 44, height: 5, borderRadius: 3, backgroundColor: InkFaint, alignSelf: 'center', marginTop: 10, marginBottom: 6 },
  inner: { flex: 1, paddingHorizontal: 16, paddingBottom: 12 },

  titleRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 4, marginBottom: 16 },
  title: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 26, color: Ink },
  titleItalic: { fontFamily: 'PlayfairDisplay_400Regular', fontStyle: 'italic' },
  count: { fontFamily: 'Inter_700Bold', fontSize: 16, color: InkSoft },

  list: { paddingBottom: 36, gap: 14 },

  card: {
    borderWidth: 1.5,
    borderColor: Ink,
    borderRadius: 14,
    backgroundColor: Paper,
  },
  cardBody: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 16 },
  mark: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 44,
    lineHeight: 44,
    color: Dim,
    marginBottom: -14,
  },
  quote: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontStyle: 'italic',
    fontSize: 18,
    lineHeight: 27,
    color: Ink,
    paddingRight: 26, // clear of the bookmark
  },
  rule: { height: 1, backgroundColor: InkFaint, marginTop: 14, marginBottom: 12, width: 34 },
  byline: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  author: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 15, color: Ink },
  era: { fontFamily: 'Inter_400Regular', fontSize: 11.5, color: InkSoft, marginTop: 2 },
  chev: { transform: [{ scaleX: -1 }], opacity: 0.7 },

  unsave: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, paddingBottom: 60 },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1.5,
    borderColor: InkFaint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 19, color: Ink, marginBottom: 6 },
  emptyHint: { fontFamily: 'Inter_400Regular', fontSize: 13, color: InkSoft, textAlign: 'center', lineHeight: 19 },
});
