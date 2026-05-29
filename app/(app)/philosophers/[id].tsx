import { useEffect } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getPhilosopherById } from '@/data/philosophers';
import { useUserDataStore } from '@/stores/userDataStore';

const Paper = '#FAFAF7';
const Ink = '#1A1A1A';
const InkSoft = '#6B6B6B';
const InkFaint = '#E8E8E3';
const Blue = '#3B6FE8';

export default function PhilosopherDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const philosopher = getPhilosopherById(id ?? '');

  const recordPhilosopherView = useUserDataStore((s) => s.recordPhilosopherView);
  const savedQuotes = useUserDataStore((s) => s.savedQuotes);
  const toggleQuote = useUserDataStore((s) => s.toggleQuote);

  useEffect(() => {
    if (philosopher) recordPhilosopherView(philosopher.id);
  }, [philosopher?.id]);

  if (!philosopher) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Thinker not found.</Text>
          <Pressable onPress={() => router.back()} style={styles.backLink}>
            <Text style={styles.backLinkText}>← Go back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const savedIds = new Set(savedQuotes.map((q) => q.id));

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={Ink} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Identity */}
        <View style={styles.identity}>
          <View style={styles.avatar}>
            <Text style={styles.symbol}>{philosopher.symbol}</Text>
          </View>
          <Text style={styles.name}>{philosopher.name}</Text>
          <Text style={styles.meta}>
            {philosopher.lifespan} · {philosopher.era}
          </Text>
          <Text style={styles.oneLiner}>"{philosopher.oneLiner}"</Text>
        </View>

        {/* Areas of thought */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionHeading}>Areas of Thought</Text>
          <View style={styles.sectionLine} />
        </View>
        <View style={styles.chipRow}>
          {philosopher.areas.map((area) => (
            <View key={area} style={styles.chip}>
              <Text style={styles.chipText}>{area}</Text>
            </View>
          ))}
        </View>

        {/* Biography */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionHeading}>Biography</Text>
          <View style={styles.sectionLine} />
        </View>
        <View style={styles.bioBox}>
          <Text style={styles.bioText}>{philosopher.bio}</Text>
        </View>

        {/* Quotes */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionHeading}>Quotes</Text>
          <View style={styles.sectionLine} />
        </View>
        <Text style={styles.quotesHint}>Tap the bookmark to save a quote.</Text>

        {philosopher.quotes.map((q) => {
          const saved = savedIds.has(q.id);
          return (
            <View key={q.id} style={styles.quoteBox}>
              <Text style={styles.quoteText}>"{q.text}"</Text>
              <Pressable
                onPress={() =>
                  toggleQuote({
                    id: q.id,
                    text: q.text,
                    author: philosopher.name,
                    philosopherId: philosopher.id,
                    branchSlugs: philosopher.branchSlugs,
                    savedAt: Date.now(),
                  })
                }
                hitSlop={10}
                style={styles.bookmarkBtn}
              >
                <Ionicons
                  name={saved ? 'bookmark' : 'bookmark-outline'}
                  size={22}
                  color={saved ? Blue : InkSoft}
                />
              </Pressable>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Paper },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 4,
    paddingBottom: 4,
  },
  backBtn: { padding: 4 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 48 },
  identity: { alignItems: 'center', marginBottom: 8 },
  avatar: {
    width: 92,
    height: 92,
    borderRadius: 46,
    borderWidth: 2,
    borderColor: Ink,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Paper,
    marginBottom: 12,
  },
  symbol: { fontSize: 44 },
  name: {
    fontFamily: 'Caveat_700Bold',
    fontSize: 40,
    color: Ink,
    textAlign: 'center',
    lineHeight: 44,
  },
  meta: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: InkSoft,
    marginTop: 2,
  },
  oneLiner: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 17,
    fontStyle: 'italic',
    color: Ink,
    textAlign: 'center',
    marginTop: 14,
    paddingHorizontal: 8,
    lineHeight: 26,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 28,
    marginBottom: 12,
  },
  sectionHeading: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: Ink,
    marginRight: 12,
  },
  sectionLine: { flex: 1, height: 1, backgroundColor: InkFaint },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderWidth: 1.5,
    borderColor: Ink,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  chipText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: Ink,
  },
  bioBox: {
    borderWidth: 2,
    borderColor: InkFaint,
    borderRadius: 14,
    padding: 18,
  },
  bioText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: Ink,
    lineHeight: 26,
  },
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
    fontSize: 17,
    fontStyle: 'italic',
    color: Ink,
    lineHeight: 26,
  },
  bookmarkBtn: { padding: 2 },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  notFoundText: { fontFamily: 'Inter_400Regular', fontSize: 16, color: InkSoft },
  backLink: { padding: 8 },
  backLinkText: { fontFamily: 'Inter_500Medium', fontSize: 15, color: Ink },
});
