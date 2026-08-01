import { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  TextInput,
  StyleSheet,
  Dimensions,
  InteractionManager,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient as Scrim } from 'expo-linear-gradient';
import SketchIcon from '@/components/shared/SketchIcon';
import ScreenTransition from '@/components/shared/ScreenTransition';
import { ALL_PHILOSOPHERS, type Philosopher } from '@/data/philosophers';
import { PHILOSOPHER_FACTS } from '@/data/philosopherFacts';
import { useUIStore } from '@/stores/uiStore';

const Paper = '#FAFAF7';
const Ink = '#1A1A1A';
const InkSoft = '#6B6B6B';
const InkFaint = '#E2E0D8';
const PaperMute = '#9C9A93';
const Tag = '#EAE7DF';
const DarkField = '#262626';
// PaperMute was chosen against SOLID ink, where it gives about 4.9:1. Over the rain
// drawing it measures 3.2:1 — under the 4.5 that 9px and 12px type needs. The fix is
// the text, not more scrim: darkening the wash far enough to rescue a muted grey would
// bury the picture, which is the reason the picture is there.
const PaperMuteOnArt = '#C4C2BB';

const SW = Dimensions.get('window').width;
// The hard shadow is offset out to the right, so it has to come out of the card's
// own width or the second column runs off the screen.
const SHADOW_X = 4;
const SHADOW_Y = 5;
const CARD_W = (SW - 40 - 12) / 2 - SHADOW_X;
const FEAT_W = SW - 40;
const TAB_H = 13;

// ── the file-tab card, in five monochrome treatments ─────────────────────────
//
// The reference for this layout separates its cards by COLOUR, which this app does
// not have. Tone is the substitute, and it has to carry the same job: enough rhythm
// down a long scroll that the grid reads as a set of distinct things rather than one
// repeating cell. Each era gets its own tab fill and badge treatment — solid, ruled,
// tinted, doubled — so scrolling past Ancient into Modern actually looks like
// crossing a boundary. The initial stays, because with 223 thinkers it is the only
// per-card mark that is genuinely theirs.
type Treatment = {
  tab: string;
  badge: { bg: string; border: string; width: number };
  letter: string;
  inner?: boolean;   // a second rule inside the badge
};
const TREATMENT: Record<string, Treatment> = {
  ANCIENT: { tab: Ink, badge: { bg: Ink, border: Ink, width: 1.5 }, letter: Paper },
  MEDIEVAL: { tab: InkSoft, badge: { bg: Paper, border: Ink, width: 1.5 }, letter: Ink, inner: true },
  MODERN: { tab: Ink, badge: { bg: Tag, border: Ink, width: 1.5 }, letter: Ink },
  CONTEMPORARY: { tab: InkSoft, badge: { bg: Ink, border: Ink, width: 1.5 }, letter: Paper },
  EASTERN: { tab: Ink, badge: { bg: Paper, border: Ink, width: 2.5 }, letter: Ink },
};
const treatmentOf = (group: string) => TREATMENT[group] ?? TREATMENT.MODERN;

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
  const pendingPhilosopherId = useUIStore((s) => s.pendingPhilosopherId);

  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('ALL');

  // A deep link (home-screen widget) parked a thinker for us. Open their profile
  // only after this screen has mounted and painted, plus a short beat — so the
  // user sees the Thinkers page land, then the sheet slide up. No lost opens on
  // cold start, no sheet popping mid-navigation.
  useEffect(() => {
    if (!pendingPhilosopherId) return;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const task = InteractionManager.runAfterInteractions(() => {
      timer = setTimeout(() => {
        useUIStore.getState().setPendingPhilosopher(null);
        openPhilosopher(pendingPhilosopherId);
      }, 260);
    });
    return () => {
      task.cancel();
      if (timer) clearTimeout(timer);
    };
  }, [pendingPhilosopherId, openPhilosopher]);

  const q = query.trim().toLowerCase();
  const showFeatured = q === '' && filter === 'ALL';

  // Deterministic "thinker of the day".
  const dayIdx = Math.floor(Date.now() / 86_400_000) % ALL_PHILOSOPHERS.length;
  const featured = ALL_PHILOSOPHERS[dayIdx];

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
              <SectionHead>THINKER OF THE DAY</SectionHead>
              <Pressable style={styles.featured} onPress={() => openPhilosopher(featured.id)}>
                {/* THE RAIN DRAWING, and the scrim that makes it usable.
                    Every word on this card is PAPER on a dark ground, and the drawing
                    is pen on white paper — mean tone 139–160 of 255, i.e. LIGHTER than
                    the text. Dropped in raw it would erase the card. The wash is ink,
                    heaviest at the bottom where the quote runs and lightest at the top
                    right where the window and the cat are, so the picture reads and the
                    type never takes its contrast from it (§19).
                    Explicit width: an Image given none takes its own intrinsic 601 and
                    overhangs the card. */}
                <Image
                  source={require('@/assets/images/thinkers/rain.jpg')}
                  style={styles.featImg}
                  resizeMode="cover"
                />
                <Scrim
                  style={StyleSheet.absoluteFill}
                  colors={[
                    'rgba(20,20,19,0.70)',
                    'rgba(20,20,19,0.78)',
                    'rgba(20,20,19,0.90)',
                  ]}
                  locations={[0, 0.45, 1]}
                />
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
                    <ThinkerCard key={p.id} p={p} onPress={() => openPhilosopher(p.id)} />
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

/**
 * One thinker, as a file tab.
 *
 * Three pieces stacked back to front: a hard offset SHADOW (solid, no blur — a soft
 * shadow would be a grey smudge in a two-tone app and would not survive on paper),
 * the TAB, and the body. The shadow is drawn for the tab as well as the card, because
 * a silhouette that casts a shadow everywhere except one corner reads as a mistake.
 *
 * The quote came off. The reference layout is legible because it holds four things —
 * a mark, a count, a name and nothing else — and a two-line italic quote at 12px was
 * the thing making these cells hard to scan. It is one tap away on the profile.
 */
function ThinkerCard({ p, onPress }: { p: Philosopher; onPress: () => void }) {
  const t = treatmentOf(groupOf(p));
  const facts = (PHILOSOPHER_FACTS[p.id] ?? []).length;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.cardWrap, pressed && styles.cardPressed]}
    >
      <View style={styles.tabShadow} pointerEvents="none" />
      <View style={styles.bodyShadow} pointerEvents="none" />
      <View style={[styles.tab, { backgroundColor: t.tab }]} />
      <View style={styles.cardBody}>
        <View style={styles.cardRow}>
          <View
            style={[
              styles.badge,
              { backgroundColor: t.badge.bg, borderColor: t.badge.border, borderWidth: t.badge.width },
            ]}
          >
            {t.inner ? <View style={styles.badgeInner} pointerEvents="none" /> : null}
            <Text style={[styles.badgeLetter, { color: t.letter }]}>{p.name.charAt(0)}</Text>
          </View>
          <View style={styles.countCol}>
            <Text style={styles.countText}>{p.quotes.length} quotes</Text>
            <Text style={styles.countText}>{facts} facts</Text>
          </View>
        </View>

        <Text style={styles.cardName} numberOfLines={2}>
          {p.name}
        </Text>
        <Text style={styles.cardMeta} numberOfLines={1}>
          {formatLife(p.lifespan)}
          {countryOf(p) ? ` · ${countryOf(p)}` : ''}
        </Text>
      </View>
    </Pressable>
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

  featured: { backgroundColor: Ink, borderRadius: 14, padding: 18, overflow: 'hidden' },
  // Explicit width, and pinned top AND bottom so the height is the card's rather than
  // a number guessed here. An Image given neither takes its own intrinsic 601×562 and
  // overhangs (§19); a fixed height instead would crop from the top and cut the cat —
  // the one thing in the drawing worth showing — off the bottom of a short card.
  featImg: { position: 'absolute', left: 0, top: 0, bottom: 0, width: FEAT_W },
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
    // Caveat's ink overhangs its glyph box on the right; Android clips text to
    // its (tight, advance-width) layout box, cutting the right of the letter.
    // Give the Text a width wider than the glyph so the ink has room; textAlign
    // then centres the letter within that width.
    width: 44,
    lineHeight: 46,
    textAlign: 'center',
    includeFontPadding: false,
    transform: [{ translateX: -1.5 }],
  },
  featKicker: { fontFamily: 'Inter_500Medium', fontSize: 9, color: PaperMuteOnArt, letterSpacing: 1.5 },
  featName: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 22, color: Paper, marginTop: 3 },
  featLife: { fontFamily: 'Inter_400Regular', fontSize: 12, color: PaperMuteOnArt, marginTop: 1 },
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

  // ── the file-tab card ──────────────────────────────────────────────────────
  // The wrapper carries the tab's height as padding so the body still starts at a
  // predictable y, and the shadow layers sit inside it, offset.
  cardWrap: { width: CARD_W + SHADOW_X, paddingTop: TAB_H },
  cardPressed: { opacity: 0.82 },
  tab: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: CARD_W * 0.44,
    height: TAB_H + 8,          // runs under the body's top edge so the two are one shape
    borderTopLeftRadius: 7,
    borderTopRightRadius: 7,
  },
  cardBody: {
    width: CARD_W,
    minHeight: 118,
    borderWidth: 2,
    borderColor: Ink,
    borderRadius: 12,
    backgroundColor: Paper,
    padding: 11,
    justifyContent: 'space-between',
  },
  // SOLID, NOT BLURRED. A soft shadow is a grey smudge in a two-tone app and does not
  // survive the paper-and-ink identity; a hard offset one is how a sticker or a cut
  // card behaves, and it is what gives this layout its depth. Both pieces of the
  // silhouette get one, because a shape that casts a shadow everywhere except its top
  // corner reads as a bug rather than as a tab.
  // Spanned by top AND bottom rather than given a height. `height: '100%'` resolves
  // against the WRAPPER, which is taller than the body by the tab's padding, so the
  // shadow hung TAB_H + SHADOW_Y below the card as a stray bar of ink. Pinning both
  // edges makes it exactly the body's height whatever the name wraps to.
  bodyShadow: {
    position: 'absolute',
    left: SHADOW_X,
    top: TAB_H + SHADOW_Y,
    bottom: -SHADOW_Y,
    width: CARD_W,
    borderRadius: 12,
    backgroundColor: Ink,
  },
  tabShadow: {
    position: 'absolute',
    left: SHADOW_X,
    top: SHADOW_Y,
    width: CARD_W * 0.44,
    height: TAB_H + 8,
    borderTopLeftRadius: 7,
    borderTopRightRadius: 7,
    backgroundColor: Ink,
  },

  cardRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  badge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeInner: {
    position: 'absolute',
    left: 3,
    top: 3,
    right: 3,
    bottom: 3,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: Ink,
  },
  badgeLetter: {
    fontFamily: 'Caveat_700Bold',
    fontSize: 23,
    // Caveat's ink overhangs its glyph box on the right and Android clips text to its
    // tight advance-width box, cutting the letter. A width wider than the glyph gives
    // the ink room; textAlign then centres it back.
    width: 34,
    lineHeight: 38,
    textAlign: 'center',
    includeFontPadding: false,
    transform: [{ translateX: -1 }],
  },
  countCol: { alignItems: 'flex-end' },
  countText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 9.5,
    color: InkSoft,
    letterSpacing: 0.3,
    includeFontPadding: false,
    lineHeight: 13,
  },

  cardName: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 15, color: Ink, marginTop: 12 },
  cardMeta: { fontFamily: 'Inter_400Regular', fontSize: 10, color: InkSoft, marginTop: 2 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 10 },

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
