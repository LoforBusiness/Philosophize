import { memo, useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import {
  View,
  Text,
  Image,
  Pressable,
  FlatList,
  TextInput,
  StyleSheet,
  Dimensions,
  InteractionManager,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient as Scrim } from 'expo-linear-gradient';
import SketchIcon from '@/components/shared/SketchIcon';
import ScreenTransition from '@/components/shared/ScreenTransition';
import { ALL_PHILOSOPHERS, ERA_GROUPS, eraGroupOf, type Philosopher } from '@/data/philosophers';
import { PHILOSOPHER_FACTS } from '@/data/philosopherFacts';
import { dayNumber, thinkerOfTheDay } from '@/lib/utils/thinkerOfDay';
import { useUIStore } from '@/stores/uiStore';
import { useUserDataStore } from '@/stores/userDataStore';

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

const ORDER = [...ERA_GROUPS];
const FILTERS = ['ALL', ...ORDER];
const BY_ID: Record<string, Philosopher> = Object.fromEntries(ALL_PHILOSOPHERS.map((p) => [p.id, p]));

/** One row of the flattened list: a section head, a pair of cards, a break band, or a tail piece. */
type Row =
  | { k: string; type: 'head'; group: string }
  | { k: string; type: 'row'; items: Philosopher[] }
  | { k: string; type: 'band'; kind: 'fact' | 'quote'; pid: string; text: string }
  | { k: string; type: 'empty' }
  | { k: string; type: 'hint' };

const rowKey = (r: Row) => r.k;

const formatLife = (s: string) => s.replace('BCE', 'BC').replace('CE', 'AD');
const shortestQuote = (p: Philosopher) =>
  p.quotes.reduce((a, b) => (b.text.length < a.text.length ? b : a), p.quotes[0]).text;
const tagsOf = (p: Philosopher) => p.areas.slice(0, 3).map((a) => a.toUpperCase());

// Prefer the data on each philosopher; fall back to the legacy maps for the
// original entries that predate those fields. `eraGroupOf` lives in the data
// layer now — the "all five eras" badge has to group them the same way.
const groupOf = eraGroupOf;
const countryOf = (p: Philosopher) => p.country ?? COUNTRY[p.id] ?? '';

// The day the break bands rotate on. From `dayNumber()` rather than a fresh
// `Date.now()` here: that file owns the day unit for every screen that shows a
// thinker of the day, and a second copy of the arithmetic is exactly how Home and
// this tab ended up disagreeing about who today's thinker was.
const DAY = dayNumber();

export default function ThinkersScreen() {
  const insets = useSafeAreaInsets();
  const openPhilosopher = useUIStore((s) => s.openPhilosopher);
  const pendingPhilosopherId = useUIStore((s) => s.pendingPhilosopherId);
  const philosopherViews = useUserDataStore((s) => s.philosopherViews);

  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('ALL');

  // A deep link (home-screen widget) parked a thinker for us. Open their profile
  // only after this screen has painted, plus a short beat — so the user sees the
  // Thinkers page land, then the sheet slide up. No lost opens on cold start, no
  // sheet popping mid-navigation.
  //
  // KEYED ON FOCUS, NOT ON MOUNT. It used to be a plain effect, which was the same
  // thing back when tabs mounted lazily — this screen did not exist until you
  // navigated to it. Now every tab is built at startup so it can be switched to
  // instantly, and a mount-keyed effect would fire while the reader is still looking
  // at Home, sliding a philosopher sheet over a screen they never asked to leave.
  // Focus restores exactly what the comment above always claimed.
  useFocusEffect(
    useCallback(() => {
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
    }, [pendingPhilosopherId, openPhilosopher]),
  );

  const q = query.trim().toLowerCase();
  const showFeatured = q === '' && filter === 'ALL';

  // ONE thinker of the day, shared with Home rather than derived again here. This
  // used to be `day % length` inlined here, Home grew its own card with its own
  // rule, and the app spent a while featuring two different thinkers on the same
  // day under the same heading.
  const featured = useMemo(() => thinkerOfTheDay(), []);

  const metCount = useMemo(() => Object.keys(philosopherViews).length, [philosopherViews]);

  // A stable handler, so a memoised card is not re-rendered by a fresh closure on
  // every parent render — `onPress={() => open(p.id)}` allocated 222 new functions
  // per keystroke and defeated memo() entirely.
  const openById = useCallback((id: string) => openPhilosopher(id), [openPhilosopher]);

  // THE LIST IS FLATTENED INTO ROWS, and this is what makes the tab cheap.
  //
  // It used to render every match at once inside a plain ScrollView: 222 cards of 14
  // elements each, about 3,100 native views built in one pass on the first visit to
  // this tab. That is the stall — the screen cannot paint until all of them exist,
  // and nothing about them is reusable on the way back down.
  //
  // FlatList needs one flat array, so the section heads, the two-up rows AND the
  // break bands become items in the same list. A row of two carries the same
  // `styles.grid` the wrap layout used, so the picture is identical — same width,
  // same 12 gap, and a trailing odd card sits left exactly as flex-wrap left it.
  const rows = useMemo(() => {
    const matched = ALL_PHILOSOPHERS.filter(
      (p) =>
        (filter === 'ALL' || groupOf(p) === filter) &&
        (q === '' || p.name.toLowerCase().includes(q)),
    );
    const grid = matched.filter((p) => !(showFeatured && p.id === featured.id));

    const out: Row[] = [];
    // Counts every band placed so far, so the fact/quote alternation carries on
    // across era boundaries instead of restarting at each section head.
    let bandN = 0;

    for (const group of ORDER) {
      const list = grid.filter((p) => groupOf(p) === group);
      if (list.length === 0) continue;
      out.push({ k: `h-${group}`, type: 'head', group });

      let rowN = 0;
      for (let i = 0; i < list.length; i += 2) {
        out.push({ k: `r-${group}-${i}`, type: 'row', items: list.slice(i, i + 2) });
        rowN += 1;

        // A BREAK BAND EVERY THREE ROWS — the thing that makes the page worth
        // scrolling. Six identical cells is about as far as the eye goes before the
        // grid reads as wallpaper; a full-width band resets it and carries the one
        // thing a card cannot fit, which is an actual surprise. Never trailing: a
        // band sitting directly above a section head belongs to the wrong era.
        if (rowN % 3 === 0 && i + 2 < list.length) {
          // Walk from a day-seeded offset to the first thinker in THIS era who has
          // the material, so a band always names someone the reader is scrolling
          // past, and the whole set rotates once a day.
          const kind: 'fact' | 'quote' = bandN % 2 === 0 ? 'fact' : 'quote';
          const start = (DAY * 7 + bandN * 13) % list.length;
          let picked: { p: Philosopher; text: string } | null = null;
          for (let s = 0; s < list.length && !picked; s += 1) {
            const cand = list[(start + s) % list.length];
            if (kind === 'fact') {
              const facts = PHILOSOPHER_FACTS[cand.id] ?? [];
              if (facts.length) picked = { p: cand, text: facts[(DAY + bandN) % facts.length] };
            } else if (cand.quotes.length) {
              picked = { p: cand, text: shortestQuote(cand) };
            }
          }
          if (picked) {
            out.push({ k: `b-${group}-${i}`, type: 'band', kind, pid: picked.p.id, text: picked.text });
            bandN += 1;
          }
        }
      }
    }
    if (out.length === 0 && !showFeatured) out.push({ k: 'empty', type: 'empty' });
    out.push({ k: 'hint', type: 'hint' });
    return out;
  }, [filter, q, showFeatured, featured.id]);

  const renderRow = useCallback(
    ({ item }: { item: Row }) => {
      if (item.type === 'head') {
        return (
          <View style={styles.rowPad}>
            <SectionHead>{item.group}</SectionHead>
          </View>
        );
      }
      if (item.type === 'row') {
        return (
          <View style={[styles.rowPad, styles.grid]}>
            {item.items.map((p) => (
              <ThinkerCard key={p.id} p={p} onOpen={openById} />
            ))}
          </View>
        );
      }
      if (item.type === 'band') {
        return <BreakBand kind={item.kind} pid={item.pid} text={item.text} onOpen={openById} />;
      }
      if (item.type === 'empty') {
        return <Text style={styles.empty}>No thinkers found.</Text>;
      }
      return (
        <View style={styles.scrollHint}>
          <SketchIcon name="chevron-down" size={20} color={InkSoft} />
        </View>
      );
    },
    [openById],
  );

  return (
    <ScreenTransition bg={Ink}>
    <View style={styles.root}>
      <FlatList
        style={styles.scroll}
        data={rows}
        keyExtractor={rowKey}
        renderItem={renderRow}
        contentContainerStyle={{ paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        // Tuned DOWN from the defaults (windowSize 21, batches of 10). The cards are
        // individually cheap; what cost was building every one of them before the
        // screen could paint. Seven screens of buffer is more than a thumb can
        // outrun and it keeps the first frame short.
        initialNumToRender={6}
        maxToRenderPerBatch={6}
        windowSize={7}
        updateCellsBatchingPeriod={40}
        // Android only. iOS already detaches offscreen cells, and this flag has a
        // long history of blanking them there during a fast fling.
        removeClippedSubviews={Platform.OS === 'android'}
        ListHeaderComponent={
          <>
            {/* THE HERO — a PERSON, not a title card.
                This was a flat ink block holding a kicker, a title, a subtitle and a
                search field: four stacked lines of centred type, nothing to look at
                and nothing to tap. It is now today's thinker at full bleed, because
                the first screenful is the only chance this tab gets to say "there is
                someone in here worth meeting". The wordmark shrinks to a label in the
                corner — the reader tapped a tab called Thinkers to get here and does
                not need to be told twice. */}
            <View style={[styles.hero, { paddingTop: insets.top + 14 }]}>
              {showFeatured && (
                <>
                  {/* THE RAIN DRAWING, and the scrim that makes it usable.
                      Every word on this hero is PAPER on a dark ground, and the
                      drawing is pen on white paper — mean tone 139–160 of 255, i.e.
                      LIGHTER than the text. Dropped in raw it would erase the type.
                      The wash is ink, heaviest at the bottom where the words run and
                      lightest at the top where the window and the cat are, so the
                      picture reads and the type never takes its contrast from it (§19).
                      Explicit width, and pinned top AND bottom, so the art is exactly
                      as tall as the hero turns out to be — which moves with the safe
                      area and with how far a long name wraps. An Image given neither
                      takes its own intrinsic 601×562 and overhangs. */}
                  <Image
                    source={require('@/assets/images/thinkers/rain.jpg')}
                    style={styles.heroImg}
                    resizeMode="cover"
                  />
                  <Scrim
                    style={StyleSheet.absoluteFill}
                    colors={['rgba(20,20,19,0.62)', 'rgba(20,20,19,0.80)', 'rgba(20,20,19,0.94)']}
                    locations={[0, 0.5, 1]}
                  />
                </>
              )}

              <View style={styles.heroPad}>
                <View style={styles.wordmarkRow}>
                  <Text style={styles.wordmark}>THINKERS</Text>
                  {metCount > 0 && (
                    <Text style={styles.metCount}>
                      {metCount} of {ALL_PHILOSOPHERS.length} met
                    </Text>
                  )}
                </View>

                {showFeatured && (
                  <Pressable
                    style={({ pressed }) => [styles.heroBody, pressed && { opacity: 0.85 }]}
                    onPress={() => openPhilosopher(featured.id)}
                  >
                    <Text style={styles.heroKicker}>
                      TODAY&apos;S THINKER · {groupOf(featured)}
                      {countryOf(featured) ? ` · ${countryOf(featured).toUpperCase()}` : ''}
                    </Text>
                    <Text style={styles.heroName}>{featured.name}</Text>
                    <Text style={styles.heroLife}>{formatLife(featured.lifespan)}</Text>

                    {/* The one-line idea, at hero scale. This is the whole reason the
                        header changed: a name and a pair of dates give a reader
                        nothing to be curious about, and every thinker in the data
                        already carries their core idea in ten words or fewer. */}
                    <Text style={styles.heroIdea}>“{featured.oneLiner}”</Text>

                    <View style={styles.tagRow}>
                      {tagsOf(featured).map((t) => (
                        <View key={t} style={styles.darkTag}>
                          <Text style={styles.darkTagText}>{t}</Text>
                        </View>
                      ))}
                    </View>

                    <View style={styles.heroCta}>
                      <Text style={styles.heroCtaText}>MEET THIS THINKER</Text>
                      <Text style={styles.heroArrow}>→</Text>
                    </View>
                  </Pressable>
                )}

                <TextInput
                  value={query}
                  onChangeText={setQuery}
                  placeholder="Search a philosopher..."
                  placeholderTextColor={PaperMute}
                  style={styles.search}
                  autoCorrect={false}
                />
              </View>
            </View>

            <View style={styles.headerPad}>
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
            </View>
          </>
        }
      />
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
 * WHAT THE CARD SAYS. It used to end on "5 quotes · 3 facts" — a stock count, true of
 * every thinker in the file and so worth nothing to a reader deciding whether to tap.
 * That pair is now the one line the data has always carried and this screen never
 * showed: their core idea, in ten words or fewer. The card still holds four things,
 * which is what keeps it scannable — a mark, a name, a date, an idea. The long italic
 * QUOTE stays off: it was tried here, and at two lines of 12px it was the thing that
 * made these cells hard to read. It is one tap away on the profile.
 */
const ThinkerCard = memo(function ThinkerCard({
  p, onOpen,
}: { p: Philosopher; onOpen: (id: string) => void }) {
  const t = treatmentOf(groupOf(p));
  const press = useCallback(() => onOpen(p.id), [onOpen, p.id]);
  return (
    <Pressable
      onPress={press}
      style={({ pressed }) => [styles.cardWrap, pressed && styles.cardPressed]}
    >
      <View style={styles.tabShadow} pointerEvents="none" />
      <View style={styles.bodyShadow} pointerEvents="none" />
      <View style={[styles.tab, { backgroundColor: t.tab }]} />
      <View style={styles.cardBody}>
        <View
          style={[
            styles.badge,
            { backgroundColor: t.badge.bg, borderColor: t.badge.border, borderWidth: t.badge.width },
          ]}
        >
          {t.inner ? <View style={styles.badgeInner} pointerEvents="none" /> : null}
          <Text style={[styles.badgeLetter, { color: t.letter }]}>{p.name.charAt(0)}</Text>
        </View>

        <Text style={styles.cardName} numberOfLines={2}>
          {p.name}
        </Text>
        <Text style={styles.cardMeta} numberOfLines={1}>
          {formatLife(p.lifespan)}
          {countryOf(p) ? ` · ${countryOf(p)}` : ''}
        </Text>

        <View style={styles.cardRule} />
        <Text style={styles.cardIdea} numberOfLines={3}>
          {p.oneLiner}
        </Text>
      </View>
    </Pressable>
  );
});

/**
 * A full-width interruption in the grid, every third row.
 *
 * The two kinds alternate and are deliberately opposite in tone: the FACT band is
 * reversed out (solid ink, paper type), the QUOTE band is paper inside a ruled
 * border. Two identical bands would only be wallpaper at a larger size; a dark one
 * every second break is what actually registers as a change of pace on a long scroll.
 * Both are tappable and open the thinker they name, so a band is a way INTO the list
 * rather than a decoration sitting beside it.
 */
const BreakBand = memo(function BreakBand({
  kind, pid, text, onOpen,
}: { kind: 'fact' | 'quote'; pid: string; text: string; onOpen: (id: string) => void }) {
  const p = BY_ID[pid];
  const press = useCallback(() => onOpen(pid), [onOpen, pid]);
  if (!p) return null;

  const dark = kind === 'fact';
  return (
    <View style={styles.rowPad}>
      <Pressable
        onPress={press}
        style={({ pressed }) => [
          styles.band,
          dark ? styles.bandDark : styles.bandLight,
          pressed && { opacity: 0.86 },
        ]}
      >
        <Text style={[styles.bandKicker, dark && { color: PaperMute }]}>
          {dark ? 'DID YOU KNOW' : 'IN THEIR WORDS'}
        </Text>
        <Text style={[dark ? styles.bandFact : styles.bandQuote, dark && { color: Paper }]}>
          {dark ? text : `“${text}”`}
        </Text>
        <View style={styles.bandFoot}>
          <Text style={[styles.bandWho, dark && { color: PaperMute }]}>{p.name}</Text>
          <Text style={[styles.bandArrow, dark && { color: Paper }]}>→</Text>
        </View>
      </Pressable>
    </View>
  );
});

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

  // ── hero ───────────────────────────────────────────────────────────────────
  hero: { backgroundColor: Ink, overflow: 'hidden', paddingBottom: 18 },
  heroImg: { position: 'absolute', left: 0, top: 0, bottom: 0, width: SW },
  heroPad: { paddingHorizontal: 20 },
  wordmarkRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  wordmark: { fontFamily: 'Inter_500Medium', fontSize: 11, color: PaperMuteOnArt, letterSpacing: 4 },
  metCount: { fontFamily: 'Inter_400Regular', fontSize: 10.5, color: PaperMuteOnArt, letterSpacing: 0.5 },

  heroBody: { marginTop: 22 },
  heroKicker: { fontFamily: 'Inter_500Medium', fontSize: 9, color: PaperMuteOnArt, letterSpacing: 1.5 },
  heroName: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 32, color: Paper, marginTop: 5, lineHeight: 38 },
  heroLife: { fontFamily: 'Inter_400Regular', fontSize: 12, color: PaperMuteOnArt, marginTop: 2 },
  heroIdea: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontStyle: 'italic',
    fontSize: 17,
    color: '#EDEBE3',
    lineHeight: 25,
    marginTop: 14,
  },
  heroCta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 16 },
  heroCtaText: { fontFamily: 'Inter_500Medium', fontSize: 10.5, color: Paper, letterSpacing: 2 },
  heroArrow: { fontFamily: 'Inter_400Regular', fontSize: 15, color: Paper },

  darkTag: { backgroundColor: 'rgba(255,255,255,0.13)', borderRadius: 3, paddingHorizontal: 8, paddingVertical: 3 },
  darkTagText: { fontFamily: 'Inter_500Medium', fontSize: 8.5, color: '#DAD8D0', letterSpacing: 1 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 14 },

  search: {
    alignSelf: 'stretch',
    marginTop: 18,
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

  // The old `body` wrapped everything below the dark header and carried the page's
  // 20 of horizontal padding. With the grid virtualised there is no single wrapper
  // any more — the list header keeps the padding AND the 18 of top air, and each row
  // carries the same 20 so nothing shifts sideways.
  headerPad: { paddingHorizontal: 20, paddingTop: 18 },
  rowPad: { paddingHorizontal: 20 },

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

  // `gap` only separates cards WITHIN a row, and each row is its own FlatList item —
  // so between rows there was nothing at all, and the hard shadow (which hangs
  // SHADOW_Y below the wrapper, being absolutely positioned) landed on the tab of the
  // card underneath. 17 leaves 12 of clear paper below the shadow, the same air the
  // two columns get.
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 17 },

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
    minHeight: 150,
    // FILLS THE WRAPPER, and this is the fix for the stray bar of ink under a card.
    //
    // A row is a plain flex row, so `alignItems` is `stretch`: when one name wraps to
    // two lines and its neighbour's does not, the SHORTER card's wrapper is stretched
    // to match while its body keeps its own height. `bodyShadow` is pinned to the
    // wrapper, so the difference showed as a black box hanging below the white card —
    // Anaxagoras beside Theophrastus, which only diverge once the system font size is
    // turned up. It is latent for everyone: 40 of the 160 pairs put a one-line name
    // beside a two-line one at the default size, and 65 at 1.3×.
    //
    // flexGrow rather than `flex: 1` on purpose. `flex: 1` also sets flexBasis 0, and
    // in a wrapper whose own height is auto that measures the body at nothing.
    flexGrow: 1,
    borderWidth: 2,
    borderColor: Ink,
    borderRadius: 12,
    backgroundColor: Paper,
    padding: 11,
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

  cardName: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 15, color: Ink, marginTop: 11 },
  cardMeta: { fontFamily: 'Inter_400Regular', fontSize: 10, color: InkSoft, marginTop: 2 },
  cardRule: { height: 1, backgroundColor: InkFaint, marginTop: 9, marginBottom: 8 },
  cardIdea: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontStyle: 'italic',
    fontSize: 11.5,
    color: InkSoft,
    lineHeight: 16,
  },

  // ── break bands ────────────────────────────────────────────────────────────
  band: { borderRadius: 12, padding: 16, marginBottom: 17 },
  bandDark: { backgroundColor: Ink },
  bandLight: { backgroundColor: Paper, borderWidth: 2, borderColor: Ink },
  bandKicker: { fontFamily: 'Inter_500Medium', fontSize: 9, color: InkSoft, letterSpacing: 2.5 },
  bandFact: { fontFamily: 'Inter_400Regular', fontSize: 13.5, lineHeight: 21, marginTop: 9 },
  bandQuote: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontStyle: 'italic',
    fontSize: 16,
    color: Ink,
    lineHeight: 24,
    marginTop: 9,
  },
  bandFoot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 },
  bandWho: { fontFamily: 'Inter_500Medium', fontSize: 11, color: InkSoft, letterSpacing: 0.5 },
  bandArrow: { fontFamily: 'Inter_400Regular', fontSize: 15, color: Ink },

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
