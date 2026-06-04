import { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SketchIcon from '@/components/shared/SketchIcon';
import ScreenTransition from '@/components/shared/ScreenTransition';
import { ALL_PHILOSOPHERS, type Philosopher } from '@/data/philosophers';
import { useUIStore } from '@/stores/uiStore';

const Paper = '#FAFAF7';
const Ink = '#1A1A1A';
const InkSoft = '#6B6B6B';
const InkFaint = '#E2E0D8';
const PaperMute = '#9C9A93';
const Tag = '#EAE7DF';
const DarkField = '#262626';

const SW = Dimensions.get('window').width;
const CARD_W = (SW - 40 - 12) / 2;

const GROUP: Record<string, string> = {
  socrates: 'ANCIENT',
  plato: 'ANCIENT',
  aristotle: 'ANCIENT',
  epicurus: 'ANCIENT',
  'marcus-aurelius': 'ANCIENT',
  confucius: 'EASTERN',
  'thomas-aquinas': 'MEDIEVAL',
  'rene-descartes': 'MODERN',
  'baruch-spinoza': 'MODERN',
  'john-locke': 'MODERN',
  'david-hume': 'MODERN',
  'immanuel-kant': 'MODERN',
  'jean-jacques-rousseau': 'MODERN',
  'georg-hegel': 'MODERN',
  'john-stuart-mill': 'MODERN',
  'karl-marx': 'MODERN',
  'friedrich-nietzsche': 'MODERN',
  'ludwig-wittgenstein': 'CONTEMPORARY',
  'jean-paul-sartre': 'CONTEMPORARY',
  'simone-de-beauvoir': 'CONTEMPORARY',
};
const COUNTRY: Record<string, string> = {
  socrates: 'Greece',
  plato: 'Greece',
  aristotle: 'Greece',
  epicurus: 'Greece',
  'marcus-aurelius': 'Rome',
  confucius: 'China',
  'thomas-aquinas': 'Italy',
  'rene-descartes': 'France',
  'baruch-spinoza': 'Netherlands',
  'john-locke': 'England',
  'david-hume': 'Scotland',
  'immanuel-kant': 'Prussia',
  'jean-jacques-rousseau': 'Geneva',
  'georg-hegel': 'Germany',
  'john-stuart-mill': 'England',
  'karl-marx': 'Germany',
  'friedrich-nietzsche': 'Germany',
  'ludwig-wittgenstein': 'Austria',
  'jean-paul-sartre': 'France',
  'simone-de-beauvoir': 'France',
};

const ORDER = ['ANCIENT', 'MEDIEVAL', 'MODERN', 'CONTEMPORARY', 'EASTERN'];
const FILTERS = ['ALL', ...ORDER];

const formatLife = (s: string) => s.replace('BCE', 'BC').replace('CE', 'AD');
const shortestQuote = (p: Philosopher) =>
  p.quotes.reduce((a, b) => (b.text.length < a.text.length ? b : a), p.quotes[0]).text;
const tagsOf = (p: Philosopher) => p.areas.slice(0, 3).map((a) => a.toUpperCase());

// Prefer the data on each philosopher; fall back to the legacy maps for the
// original entries that predate those fields.
const groupOf = (p: Philosopher) => p.category ?? GROUP[p.id] ?? 'MODERN';
const countryOf = (p: Philosopher) => p.country ?? COUNTRY[p.id] ?? '';

export default function ThinkersScreen() {
  const insets = useSafeAreaInsets();
  const openPhilosopher = useUIStore((s) => s.openPhilosopher);

  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('ALL');

  const q = query.trim().toLowerCase();
  const showFeatured = q === '' && filter === 'ALL';

  // Deterministic "thinker of the week".
  const weekIdx = Math.floor(Date.now() / (7 * 86_400_000)) % ALL_PHILOSOPHERS.length;
  const featured = ALL_PHILOSOPHERS[weekIdx];

  const matched = ALL_PHILOSOPHERS.filter(
    (p) =>
      (filter === 'ALL' || groupOf(p) === filter) &&
      (q === '' || p.name.toLowerCase().includes(q))
  );
  const grid = matched.filter((p) => !(showFeatured && p.id === featured.id));

  return (
    <ScreenTransition bg={Ink}>
    <View style={styles.root}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Dark header */}
        <View style={[styles.header, { paddingTop: insets.top + 18 }]}>
          <Text style={styles.kicker}>THE GREAT MINDS</Text>
          <Text style={styles.title}>THINKERS</Text>
          <Text style={styles.subtitle}>Explore the philosophers who shaped the world</Text>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search a philosopher..."
            placeholderTextColor={PaperMute}
            style={styles.search}
            autoCorrect={false}
          />
        </View>

        <View style={styles.body}>
          {/* Filters */}
          <View style={styles.filterRow}>
            {FILTERS.map((f) => {
              const on = filter === f;
              return (
                <Pressable
                  key={f}
                  onPress={() => setFilter(f)}
                  style={[styles.filter, on && styles.filterOn]}
                >
                  <Text style={[styles.filterText, on && { color: Paper }]}>{f}</Text>
                </Pressable>
              );
            })}
          </View>

          {/* Thinker of the week */}
          {showFeatured && (
            <>
              <SectionHead>THINKER OF THE WEEK</SectionHead>
              <Pressable style={styles.featured} onPress={() => openPhilosopher(featured.id)}>
                <View style={styles.featTop}>
                  <View style={styles.featAvatar}>
                    <Text style={styles.featAvatarLetter}>{featured.name.charAt(0)}</Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 14 }}>
                    <Text style={styles.featKicker}>
                      FEATURED · {groupOf(featured)} · {countryOf(featured).toUpperCase()}
                    </Text>
                    <Text style={styles.featName}>{featured.name}</Text>
                    <Text style={styles.featLife}>{formatLife(featured.lifespan)}</Text>
                  </View>
                  <Text style={styles.featArrow}>→</Text>
                </View>
                <View style={styles.tagRow}>
                  {tagsOf(featured).map((t) => (
                    <View key={t} style={styles.darkTag}>
                      <Text style={styles.darkTagText}>{t}</Text>
                    </View>
                  ))}
                </View>
                <Text style={styles.featQuote}>“{shortestQuote(featured)}”</Text>
              </Pressable>
            </>
          )}

          {/* Grouped grid */}
          {ORDER.map((group) => {
            const list = grid.filter((p) => groupOf(p) === group);
            if (list.length === 0) return null;
            return (
              <View key={group}>
                <SectionHead>{group}</SectionHead>
                <View style={styles.grid}>
                  {list.map((p) => (
                    <Pressable
                      key={p.id}
                      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
                      onPress={() => openPhilosopher(p.id)}
                    >
                      <View style={styles.cardTop}>
                        <View style={styles.cardAvatar}>
                          <Text style={styles.cardAvatarLetter}>{p.name.charAt(0)}</Text>
                        </View>
                        <View style={{ flex: 1, marginLeft: 10 }}>
                          <Text style={styles.cardName} numberOfLines={1}>
                            {p.name}
                          </Text>
                          <Text style={styles.cardMeta} numberOfLines={1}>
                            {formatLife(p.lifespan)} · {countryOf(p)}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.tagRow}>
                        {tagsOf(p).map((t) => (
                          <View key={t} style={styles.tag}>
                            <Text style={styles.tagText}>{t}</Text>
                          </View>
                        ))}
                      </View>
                      <Text style={styles.cardQuote} numberOfLines={2}>
                        “{shortestQuote(p)}”
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            );
          })}

          {grid.length === 0 && !showFeatured && (
            <Text style={styles.empty}>No thinkers found.</Text>
          )}

          <View style={styles.scrollHint}>
            <SketchIcon name="chevron-down" size={20} color={InkSoft} />
          </View>
        </View>
      </ScrollView>
    </View>
    </ScreenTransition>
  );
}

function SectionHead({ children }: { children: string }) {
  return (
    <View style={styles.sectionRow}>
      <Text style={styles.sectionLabel}>{children}</Text>
      <View style={styles.sectionLine} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Ink },
  scroll: { flex: 1, backgroundColor: Paper },

  header: { backgroundColor: Ink, paddingHorizontal: 20, paddingBottom: 22, alignItems: 'center' },
  kicker: { fontFamily: 'Inter_500Medium', fontSize: 10, color: PaperMute, letterSpacing: 4 },
  title: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 34, color: Paper, letterSpacing: 1.5, marginTop: 6 },
  subtitle: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontStyle: 'italic',
    fontSize: 13,
    color: PaperMute,
    marginTop: 6,
    textAlign: 'center',
  },
  search: {
    alignSelf: 'stretch',
    marginTop: 16,
    backgroundColor: DarkField,
    borderWidth: 1,
    borderColor: '#3A3A38',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 11,
    color: Paper,
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
  },

  body: { paddingHorizontal: 20, paddingTop: 18 },

  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  filter: {
    borderWidth: 1.5,
    borderColor: Ink,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  filterOn: { backgroundColor: Ink },
  filterText: { fontFamily: 'Inter_500Medium', fontSize: 11, color: Ink, letterSpacing: 1 },

  sectionRow: { flexDirection: 'row', alignItems: 'center', marginTop: 24, marginBottom: 12 },
  sectionLabel: { fontFamily: 'Inter_500Medium', fontSize: 11, color: InkSoft, letterSpacing: 3, marginRight: 12 },
  sectionLine: { flex: 1, height: 1, backgroundColor: InkFaint },

  featured: { backgroundColor: Ink, borderRadius: 14, padding: 18 },
  featTop: { flexDirection: 'row', alignItems: 'center' },
  featAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1.5,
    borderColor: Paper,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featAvatarLetter: {
    fontFamily: 'Caveat_700Bold',
    fontSize: 26,
    color: Paper,
    width: 46,
    lineHeight: 46,
    textAlign: 'center',
    includeFontPadding: false,
  },
  featKicker: { fontFamily: 'Inter_500Medium', fontSize: 9, color: PaperMute, letterSpacing: 1.5 },
  featName: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 22, color: Paper, marginTop: 3 },
  featLife: { fontFamily: 'Inter_400Regular', fontSize: 12, color: PaperMute, marginTop: 1 },
  featArrow: { fontFamily: 'Inter_400Regular', fontSize: 22, color: Paper, marginLeft: 8 },
  darkTag: { backgroundColor: '#2E2E2C', borderRadius: 3, paddingHorizontal: 8, paddingVertical: 3 },
  darkTagText: { fontFamily: 'Inter_500Medium', fontSize: 8.5, color: '#CFCDC4', letterSpacing: 1 },
  featQuote: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontStyle: 'italic',
    fontSize: 14,
    color: '#D9D7CF',
    lineHeight: 21,
    marginTop: 14,
  },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: {
    width: CARD_W,
    borderWidth: 1.5,
    borderColor: Ink,
    borderRadius: 4,
    backgroundColor: Paper,
    padding: 12,
  },
  cardPressed: { backgroundColor: '#F0EFEA' },
  cardTop: { flexDirection: 'row', alignItems: 'center' },
  cardAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.5,
    borderColor: Ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardAvatarLetter: {
    fontFamily: 'Caveat_700Bold',
    fontSize: 20,
    color: Ink,
    width: 34,
    lineHeight: 34,
    textAlign: 'center',
    includeFontPadding: false,
  },
  cardName: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 15, color: Ink },
  cardMeta: { fontFamily: 'Inter_400Regular', fontSize: 10.5, color: InkSoft, marginTop: 1 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 10 },
  tag: { backgroundColor: Tag, borderRadius: 3, paddingHorizontal: 7, paddingVertical: 2.5 },
  tagText: { fontFamily: 'Inter_500Medium', fontSize: 8, color: InkSoft, letterSpacing: 0.5 },
  cardQuote: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontStyle: 'italic',
    fontSize: 12,
    color: InkSoft,
    lineHeight: 17,
    marginTop: 10,
  },

  empty: { fontFamily: 'Inter_400Regular', fontSize: 14, color: InkSoft, textAlign: 'center', marginTop: 30 },

  scrollHint: {
    alignSelf: 'center',
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    borderColor: InkFaint,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 28,
  },
});
