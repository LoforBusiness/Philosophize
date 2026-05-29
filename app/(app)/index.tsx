import { View, Text, ScrollView, Pressable, StyleSheet, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Line } from 'react-native-svg';
import { ALL_BRANCHES } from '@/data';
import { ALL_PHILOSOPHERS } from '@/data/philosophers';
import { useUserDataStore } from '@/stores/userDataStore';

const Paper = '#FAFAF7';
const Ink = '#1A1A1A';
const InkSoft = '#6B6B6B';
const Blue = '#3B6FE8';

const SW = Dimensions.get('window').width;
const W = SW - 40;

// Daily quote pool from the philosophers.
const QUOTE_POOL = ALL_PHILOSOPHERS.flatMap((p) =>
  p.quotes.map((q) => ({
    id: q.id,
    text: q.text,
    author: p.name,
    philosopherId: p.id,
    branchSlugs: p.branchSlugs,
  }))
);

// Meander menu items: y position, label indent, and where the line sits at that y.
const ITEMS = [
  { key: 'insight', label: 'Insight', y: 34, indent: 86, lineX: 40 },
  { key: 'learn', label: 'Learn', y: 116, indent: 52, lineX: 24 },
  { key: 'philosophers', label: 'Philosophers', y: 198, indent: 94, lineX: 48 },
  { key: 'quote', label: 'Quote of the Day', y: 272, indent: 52, lineX: 24 },
];
const MEANDER_H = 300;

function meanderPath(): string {
  const pts = [
    { x: 40, y: 0 },
    ...ITEMS.map((it) => ({ x: it.lineX, y: it.y })),
    { x: 34, y: MEANDER_H },
  ];
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const prev = pts[i - 1];
    const cur = pts[i];
    const midY = (prev.y + cur.y) / 2;
    d += ` C ${prev.x} ${midY}, ${cur.x} ${midY}, ${cur.x} ${cur.y}`;
  }
  return d;
}

export default function DiscoverScreen() {
  const savedQuotes = useUserDataStore((s) => s.savedQuotes);
  const toggleQuote = useUserDataStore((s) => s.toggleQuote);

  const dayNumber = Math.floor(Date.now() / 86_400_000);
  const quote = QUOTE_POOL[dayNumber % QUOTE_POOL.length];
  const quoteSaved = savedQuotes.some((q) => q.id === quote.id);

  // First lesson = "Insight" jump-in target.
  const firstBranch = ALL_BRANCHES[0];
  const firstPath = firstBranch?.paths[0];
  const firstLesson = firstPath?.lessons[0];

  function goInsight() {
    if (firstBranch && firstPath && firstLesson) {
      router.push(
        `/(app)/branches/${firstBranch.slug}/${firstPath.slug}/lesson/${firstLesson.id}`
      );
    }
  }

  const onPressFor: Record<string, () => void> = {
    insight: goInsight,
    learn: () => router.push('/(app)/branches'),
    philosophers: () => router.push('/(app)/philosophers'),
    quote: () => router.push(`/(app)/philosophers/${quote.philosopherId}`),
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Discover</Text>
          <Pressable hitSlop={8} onPress={() => router.push('/(app)/profile')}>
            <Ionicons name="settings-outline" size={24} color={InkSoft} />
          </Pressable>
        </View>

        {/* Meandering menu */}
        <View style={{ width: W, height: MEANDER_H }}>
          <Svg width={W} height={MEANDER_H} style={StyleSheet.absoluteFill}>
            <Path d={meanderPath()} fill="none" stroke={Ink} strokeWidth={2} strokeLinecap="round" />
            {ITEMS.map((it) => (
              <Line
                key={it.key}
                x1={it.lineX}
                y1={it.y}
                x2={it.indent - 10}
                y2={it.y}
                stroke={Ink}
                strokeWidth={1.5}
                strokeLinecap="round"
              />
            ))}
          </Svg>

          {ITEMS.map((it) => (
            <Pressable
              key={it.key}
              onPress={onPressFor[it.key]}
              hitSlop={8}
              style={({ pressed }) => [
                styles.menuItem,
                { left: it.indent, top: it.y - 18 },
                pressed && { opacity: 0.55 },
              ]}
            >
              <Text style={styles.menuLabel}>{it.label}</Text>
            </Pressable>
          ))}
        </View>

        {/* Quote of the day text */}
        <View style={styles.quoteBlock}>
          <Pressable
            onPress={() => router.push(`/(app)/philosophers/${quote.philosopherId}`)}
            style={{ flex: 1 }}
          >
            <Text style={styles.quoteText}>"{quote.text}"</Text>
            <Text style={styles.quoteAuthor}>— {quote.author}</Text>
          </Pressable>
          <Pressable
            onPress={() => toggleQuote({ ...quote, savedAt: Date.now() })}
            hitSlop={10}
            style={styles.bookmark}
          >
            <Ionicons
              name={quoteSaved ? 'bookmark' : 'bookmark-outline'}
              size={20}
              color={quoteSaved ? Blue : InkSoft}
            />
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Paper },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 32 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  title: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 38,
    color: Ink,
  },
  menuItem: { position: 'absolute' },
  menuLabel: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontStyle: 'italic',
    fontSize: 20,
    color: Ink,
  },
  quoteBlock: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
    paddingLeft: 52,
    gap: 10,
  },
  quoteText: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontStyle: 'italic',
    fontSize: 17,
    color: Ink,
    lineHeight: 26,
  },
  quoteAuthor: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: InkSoft,
    marginTop: 8,
  },
  bookmark: { paddingTop: 2 },
});
