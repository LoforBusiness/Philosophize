import { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import { getPhilosopherById, type Philosopher } from '@/data/philosophers';
import { PHILOSOPHER_FACTS } from '@/data/philosopherFacts';
import { useUIStore } from '@/stores/uiStore';
import { useUserDataStore } from '@/stores/userDataStore';
import SketchIcon from './SketchIcon';

const Paper = '#FAFAF7';
const Ink = '#1A1A1A';
const InkSoft = '#6B6B6B';
const InkFaint = '#E8E8E3';

// A bottom sheet that slides up to ~3/4 of the screen with a rounded top and a
// grab handle, showing a philosopher's bio, facts, and saveable quotes.
export default function PhilosopherSheet() {
  const id = useUIStore((s) => s.philosopherSheetId);
  const close = useUIStore((s) => s.closePhilosopher);

  const recordView = useUserDataStore((s) => s.recordPhilosopherView);
  const savedQuotes = useUserDataStore((s) => s.savedQuotes);
  const toggleQuote = useUserDataStore((s) => s.toggleQuote);

  const { height } = useWindowDimensions();
  const H = Math.round(height * 0.8);

  const [visible, setVisible] = useState(false);
  const [phil, setPhil] = useState<Philosopher | null>(null);

  useEffect(() => {
    if (id) {
      const p = getPhilosopherById(id);
      if (p) {
        setPhil(p);
        setVisible(true);
        recordView(id);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!visible) return null;

  const savedIds = new Set(savedQuotes.map((q) => q.id));
  const facts = phil ? PHILOSOPHER_FACTS[phil.id] ?? [] : [];

  return (
    <Modal visible transparent animationType="none" statusBarTranslucent onRequestClose={close}>
      <MotiView
        animate={{ opacity: id ? 1 : 0 }}
        transition={{ type: 'timing', duration: 240 }}
        style={styles.backdrop}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={close} />
      </MotiView>

      <AnimatePresence
        onExitComplete={() => {
          setVisible(false);
          setPhil(null);
        }}
      >
        {id && phil && (
          <MotiView
            key="sheet"
            from={{ translateY: H }}
            animate={{ translateY: 0 }}
            exit={{ translateY: H }}
            transition={{ type: 'timing', duration: 340 }}
            style={[styles.sheet, { height: H }]}
          >
            <View style={styles.handle} />

            <ScrollView
              contentContainerStyle={styles.content}
              showsVerticalScrollIndicator={false}
            >
              {/* Identity */}
              <View style={styles.identity}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarLetter}>{phil.name.charAt(0)}</Text>
                </View>
                <Text style={styles.name}>{phil.name}</Text>
                <Text style={styles.meta}>
                  {phil.lifespan} · {phil.era}
                </Text>
                <Text style={styles.oneLiner}>"{phil.oneLiner}"</Text>
              </View>

              {/* Areas */}
              <View style={styles.chipRow}>
                {phil.areas.map((a) => (
                  <View key={a} style={styles.chip}>
                    <Text style={styles.chipText}>{a}</Text>
                  </View>
                ))}
              </View>

              {/* Bio */}
              <SectionHeading label="Biography" />
              <Text style={styles.bio}>{phil.bio}</Text>

              {/* Did you know */}
              {facts.length > 0 && (
                <>
                  <SectionHeading label="Did You Know?" />
                  {facts.map((f, i) => (
                    <View key={i} style={styles.factRow}>
                      <Text style={styles.factMark}>✦</Text>
                      <Text style={styles.factText}>{f}</Text>
                    </View>
                  ))}
                </>
              )}

              {/* Quotes */}
              <SectionHeading label="Quotes" />
              <Text style={styles.quotesHint}>Tap the bookmark to save a quote.</Text>
              {phil.quotes.map((q) => {
                const saved = savedIds.has(q.id);
                return (
                  <View key={q.id} style={styles.quoteBox}>
                    <Text style={styles.quoteText}>"{q.text}"</Text>
                    <Pressable
                      hitSlop={10}
                      onPress={() =>
                        toggleQuote({
                          id: q.id,
                          text: q.text,
                          author: phil.name,
                          philosopherId: phil.id,
                          branchSlugs: phil.branchSlugs,
                          savedAt: Date.now(),
                        })
                      }
                    >
                      <SketchIcon
                        name={saved ? 'bookmark-filled' : 'bookmark'}
                        size={22}
                        color={saved ? Ink : InkSoft}
                      />
                    </Pressable>
                  </View>
                );
              })}
            </ScrollView>
          </MotiView>
        )}
      </AnimatePresence>
    </Modal>
  );
}

function SectionHeading({ label }: { label: string }) {
  return (
    <View style={styles.sectionRow}>
      <Text style={styles.sectionHeading}>{label}</Text>
      <View style={styles.sectionLine} />
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
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
  handle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: InkFaint,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 4,
  },
  content: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 48 },
  identity: { alignItems: 'center' },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 2,
    borderColor: Ink,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarLetter: {
    fontFamily: 'Caveat_700Bold',
    fontSize: 52,
    color: Ink,
    width: 84,
    lineHeight: 84,
    textAlign: 'center',
    includeFontPadding: false,
  },
  name: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 32,
    color: Ink,
    textAlign: 'center',
    lineHeight: 38,
  },
  meta: { fontFamily: 'Inter_400Regular', fontSize: 13, color: InkSoft, marginTop: 2 },
  oneLiner: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontStyle: 'italic',
    fontSize: 17,
    color: Ink,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 26,
    paddingHorizontal: 6,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 18 },
  chip: {
    borderWidth: 1.5,
    borderColor: Ink,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  chipText: { fontFamily: 'Inter_500Medium', fontSize: 13, color: Ink },
  sectionRow: { flexDirection: 'row', alignItems: 'center', marginTop: 26, marginBottom: 12 },
  sectionHeading: { fontFamily: 'Inter_700Bold', fontSize: 16, color: Ink, marginRight: 12 },
  sectionLine: { flex: 1, height: 1, backgroundColor: InkFaint },
  bio: { fontFamily: 'Inter_400Regular', fontSize: 16, color: Ink, lineHeight: 26 },
  factRow: { flexDirection: 'row', gap: 10, marginBottom: 12, alignItems: 'flex-start' },
  factMark: { fontFamily: 'Inter_700Bold', fontSize: 14, color: Ink, lineHeight: 23 },
  factText: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 15, color: Ink, lineHeight: 23 },
  quotesHint: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: InkSoft,
    marginTop: -4,
    marginBottom: 12,
  },
  quoteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Ink,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    gap: 12,
  },
  quoteText: {
    flex: 1,
    fontFamily: 'PlayfairDisplay_400Regular',
    fontStyle: 'italic',
    fontSize: 17,
    color: Ink,
    lineHeight: 26,
  },
});
