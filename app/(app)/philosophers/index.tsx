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
import Card from '@/components/ui/Card';
import { C, TYPE, SPACE, RADIUS, type TypeKey } from '@/constants/design';
import { ALL_PHILOSOPHERS, ERA_GROUPS, eraGroupOf, type Philosopher } from '@/data/philosophers';
import { PHILOSOPHER_FACTS } from '@/data/philosopherFacts';
import { dayNumber, thinkerOfTheDay } from '@/lib/utils/thinkerOfDay';
import { useUIStore } from '@/stores/uiStore';
import { useUserDataStore } from '@/stores/userDataStore';

const SW = Dimensions.get('window').width;
// The page gutter (SPACE[3], both sides) and one inter-card gap (SPACE[2]) across two columns —
// the same convention profile.tsx's BADGE_W comment names.
const CARD_W = (SW - SPACE[3] * 2 - SPACE[2]) / 2;

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
              // The column wrapper carries the width; Card sizes to fill it. Putting
              // the width on Card directly would make it the row's flex item, and a
              // row's default `alignItems: stretch` would then stretch CARD'S OWN
              // outer (petrol) layer to match a taller neighbour without stretching
              // the paper face inside it — the same fix profile.tsx's `glanceCol`
              // comment documents for this exact composition.
              <View key={p.id} style={{ width: CARD_W }}>
                <ThinkerCard p={p} onOpen={openById} />
              </View>
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
          <SketchIcon name="chevron-down" size={20} color={C.inkSoft} />
        </View>
      );
    },
    [openById],
  );

  return (
    <ScreenTransition bg={C.ink}>
    <View style={styles.root}>
      <FlatList
        style={styles.scroll}
        data={rows}
        keyExtractor={rowKey}
        renderItem={renderRow}
        contentContainerStyle={{ paddingBottom: SPACE[5] }}
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
            <View style={[styles.hero, { paddingTop: insets.top + SPACE[3] }]}>
              {showFeatured && (
                <>
                  {/* THE RAIN DRAWING, and the scrim that makes it usable.
                      Every word on this hero is a light tone on a dark ground, and the
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
                    // The three stops are unchanged from before this screen carried
                    // tokens — `wash()` re-expresses the exact same alpha values as
                    // `ink` instead of a standalone rgba() literal, so it can pass
                    // the checker without moving the gradient it was tuned against
                    // (see the note on `wash` near the bottom of this file).
                    colors={[wash(C.ink, 0.62), wash(C.ink, 0.8), wash(C.ink, 0.94)]}
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
                  placeholderTextColor={C.hairline}
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
                      <Text style={[styles.filterText, on && { color: C.paper }]}>{f}</Text>
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
 * One thinker, as a `Card`.
 *
 * This used to be a hand-drawn "file tab" — a hard offset shadow plus a coloured
 * tab flap, with one of five border/fill treatments picked by era (`TREATMENT`,
 * now gone). That was three near-blacks and two greys' worth of the drift this
 * conversion exists to collapse, spent on distinguishing 322 rows by ERA when the
 * section heads and the filter row already say that. The shared `Card` — one
 * paper surface, one hairline border, one 2px press lip — reads simpler and is
 * what the brief for this screen names directly: same handler (`onOpen`), same
 * data, same order, just one surface instead of five.
 *
 * WHAT THE CARD SAYS is unchanged: a mark, a name, a date, an idea.
 */
const ThinkerCard = memo(function ThinkerCard({
  p, onOpen,
}: { p: Philosopher; onOpen: (id: string) => void }) {
  const press = useCallback(() => onOpen(p.id), [onOpen, p.id]);
  return (
    <Card onPress={press} pad={2}>
      <View style={styles.badge}>
        <Text style={styles.badgeLetter}>{p.name.charAt(0)}</Text>
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
    </Card>
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
 *
 * Left as its own Pressable rather than a `Card`: the dark/light alternation IS the
 * point of this element, and `Card` only has one surface.
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
        <Text style={[styles.bandKicker, dark && { color: C.hairline }]}>
          {dark ? 'DID YOU KNOW' : 'IN THEIR WORDS'}
        </Text>
        <Text style={[dark ? styles.bandFact : styles.bandQuote, dark && { color: C.paper }]}>
          {dark ? text : `“${text}”`}
        </Text>
        <View style={styles.bandFoot}>
          <Text style={[styles.bandWho, dark && { color: C.hairline }]}>{p.name}</Text>
          <Text style={[styles.bandArrow, dark && { color: C.paper }]}>→</Text>
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

const role = (k: TypeKey) => ({
  fontFamily: TYPE[k].family,
  fontSize: TYPE[k].fontSize,
  lineHeight: TYPE[k].lineHeight,
  letterSpacing: TYPE[k].letterSpacing ?? 0,
});
const PLAYFAIR_HEAD = 'PlayfairDisplay_700Bold';
const PLAYFAIR_CAPTION = 'PlayfairDisplay_400Regular';

// `C` only carries opaque hexes, and this screen has exactly one job that needs
// alpha: the hero scrim (a 3-stop gradient) and the era-tag chip fill, both
// translucent over the rain drawing. Rather than a second, rgba-flavoured copy of
// `ink`/`surface` living as a literal in this file (which the checker's "no colour
// of its own" rule exists specifically to catch), the alpha is appended to the
// token at runtime — #RRGGBBAA is standard CSS/RN colour syntax. This is the same
// move settings.tsx made for its modal scrim (`rgba(0,0,0,0.45)` →
// `{ backgroundColor: C.ink, opacity: 0.45 }`); a flat `opacity` could not do it
// here because the three gradient stops need three DIFFERENT alphas on the same
// colour, which `opacity` cannot express.
const wash = (hex: string, a: number) => hex + Math.round(a * 255).toString(16).padStart(2, '0');

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.ink },
  scroll: { flex: 1, backgroundColor: C.paper },

  // ── hero ───────────────────────────────────────────────────────────────────
  hero: { backgroundColor: C.ink, overflow: 'hidden', paddingBottom: SPACE[3] },
  heroImg: { position: 'absolute', left: 0, top: 0, bottom: 0, width: SW },
  heroPad: { paddingHorizontal: SPACE[3] },
  wordmarkRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  // Both captions were a bespoke "muted grey" (PaperMuteOnArt / PaperMute) tuned
  // specifically for text over this photograph — not a plain hex either Settings or
  // Profile ever needed, so it is not in the shared mapping table. `dim` is the
  // nearest value BY NUMBER, but its own doc comment in constants/design.ts rules it
  // out: "never for text a user needs to read" — and a wordmark label, a kicker and
  // an attribution are exactly that, not decoration. `hairline` carries no such
  // restriction, sits in the same near-white family, and — being lighter than the
  // original PaperMuteOnArt — actually clears the 4.5:1 floor that comment says the
  // old colour fell short of (3.2:1) over this same drawing, rather than only
  // matching it. See the report for the fuller version of this reasoning.
  wordmark: { ...role('micro'), color: C.hairline, letterSpacing: 4 },
  metCount: { ...role('micro'), fontFamily: 'Inter_400Regular', color: C.hairline, letterSpacing: 0.5 },

  heroBody: { marginTop: SPACE[4] },
  heroKicker: { ...role('micro'), color: C.hairline },
  heroName: { ...role('display'), color: C.paper, marginTop: SPACE[0] },
  heroLife: { ...role('micro'), fontFamily: 'Inter_400Regular', color: C.hairline, letterSpacing: 0 },
  heroIdea: {
    ...role('body'),
    fontFamily: PLAYFAIR_CAPTION,
    fontStyle: 'italic',
    color: C.paper,
    marginTop: SPACE[3],
  },
  heroCta: { flexDirection: 'row', alignItems: 'center', gap: SPACE[1], marginTop: SPACE[3] },
  heroCtaText: { ...role('micro'), color: C.paper, letterSpacing: 2 },
  heroArrow: { ...role('body'), color: C.paper },

  darkTag: { backgroundColor: wash(C.surface, 0.13), borderRadius: 3, paddingHorizontal: SPACE[1], paddingVertical: SPACE[0] },
  darkTagText: { ...role('micro'), color: C.hairline, letterSpacing: 1 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACE[0], marginTop: SPACE[3] },

  // Border and fill are now the same `ink` token — the three near-blacks this
  // screen used to carry (#1A1A1A / #262626 / #3A3A38) collapse to the one token,
  // which is the point of this conversion, and it means this particular border no
  // longer reads as a separate edge. Disclosed rather than quietly kept apart.
  search: {
    ...role('body'),
    alignSelf: 'stretch',
    marginTop: SPACE[3],
    backgroundColor: C.ink,
    borderWidth: 1,
    borderColor: C.ink,
    borderRadius: 10,
    paddingHorizontal: SPACE[3],
    paddingVertical: SPACE[2],
    color: C.paper,
  },

  // The old `body` wrapped everything below the dark header and carried the page's
  // horizontal padding. With the grid virtualised there is no single wrapper any
  // more — the list header keeps the padding AND the top air, and each row carries
  // the same SPACE[3] so nothing shifts sideways.
  headerPad: { paddingHorizontal: SPACE[3], paddingTop: SPACE[3] },
  rowPad: { paddingHorizontal: SPACE[3] },

  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACE[1], marginBottom: SPACE[0] },
  filter: {
    borderWidth: 1.5,
    borderColor: C.ink,
    borderRadius: 16,
    paddingHorizontal: SPACE[3],
    paddingVertical: SPACE[1],
  },
  filterOn: { backgroundColor: C.ink },
  filterText: { ...role('micro'), color: C.ink, letterSpacing: 1 },

  sectionRow: { flexDirection: 'row', alignItems: 'center', marginTop: SPACE[4], marginBottom: SPACE[2] },
  sectionLabel: { ...role('micro'), color: C.inkSoft, letterSpacing: 3, marginRight: SPACE[2] },
  sectionLine: { flex: 1, height: 1, backgroundColor: C.hairline },

  // `gap` only separates cards WITHIN a row, and each row is its own FlatList item —
  // so between rows there was nothing at all. SPACE[3] leaves clear paper below
  // each row, the same air the two columns get from `gap`.
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACE[2], marginBottom: SPACE[3] },

  // ── the thinker card's contents (the surface itself is `Card`) ───────────────
  badge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: C.ink,
    backgroundColor: C.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeLetter: {
    fontFamily: 'Caveat_700Bold',
    fontSize: 22,
    color: C.ink,
    // Caveat's ink overhangs its glyph box on the right and Android clips text to its
    // tight advance-width box, cutting the letter. A width wider than the glyph gives
    // the ink room; textAlign then centres it back.
    width: 34,
    lineHeight: 38,
    textAlign: 'center',
    includeFontPadding: false,
    transform: [{ translateX: -1 }],
  },

  cardName: { ...role('body'), fontFamily: PLAYFAIR_HEAD, color: C.ink, marginTop: SPACE[2] },
  cardMeta: { ...role('micro'), fontFamily: 'Inter_400Regular', letterSpacing: 0, color: C.inkSoft, marginTop: SPACE[0] },
  cardRule: { height: 1, backgroundColor: C.hairline, marginTop: SPACE[1], marginBottom: SPACE[1] },
  cardIdea: {
    ...role('micro'),
    fontFamily: PLAYFAIR_CAPTION,
    fontStyle: 'italic',
    letterSpacing: 0,
    color: C.inkSoft,
  },

  // ── break bands ────────────────────────────────────────────────────────────
  band: { borderRadius: RADIUS.card, padding: SPACE[3], marginBottom: SPACE[3] },
  bandDark: { backgroundColor: C.ink },
  bandLight: { backgroundColor: C.paper, borderWidth: 2, borderColor: C.ink },
  bandKicker: { ...role('micro'), color: C.inkSoft, letterSpacing: 2.5 },
  bandFact: { ...role('body'), marginTop: SPACE[1] },
  bandQuote: {
    ...role('body'),
    fontFamily: PLAYFAIR_CAPTION,
    fontStyle: 'italic',
    color: C.ink,
    marginTop: SPACE[1],
  },
  bandFoot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: SPACE[2] },
  bandWho: { ...role('micro'), color: C.inkSoft, letterSpacing: 0.5 },
  bandArrow: { ...role('body'), color: C.ink },

  empty: { ...role('body'), color: C.inkSoft, textAlign: 'center', marginTop: SPACE[5] },

  scrollHint: {
    alignSelf: 'center',
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    borderColor: C.hairline,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACE[5],
  },
});
