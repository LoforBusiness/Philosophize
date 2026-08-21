import { useEffect, useMemo, useState } from 'react';
import { Modal, View, Text, Pressable, ScrollView, StyleSheet, useWindowDimensions, Platform } from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import SketchIcon from './SketchIcon';
import QuotePlate from './QuotePlate';
import { useUIStore } from '@/stores/uiStore';
import { useUserDataStore, type SavedQuote } from '@/stores/userDataStore';
import { ALL_PHILOSOPHERS, ERA_GROUPS, eraGroupOfId } from '@/data/philosophers';
import { ERA, type EraKey } from '@/constants/design';
import { plate as platePalette, GHOST, LOCKED_FACE, INK, PAPER, MID } from './tone';

const Paper = PAPER;
const Ink = INK;
const InkSoft = '#6B6B6B';
const InkFaint = '#D9D7CE';

// ─────────────────────────────────────────────────────────────────────────────
// THE COLLECTION.
//
// This sheet used to be a scrolling stack of identical grey boxes with a number
// at the top. It held the only genuinely collectable thing in the app and gave
// no sense that anything was being collected — you could not tell two quotes
// apart at a glance, and nothing anywhere said what a full set would even look
// like.
//
// Two changes, and neither invents any data:
//
// · EVERY QUOTE IS A STRUCK PLATE in the material of its era
//   (components/shared/QuotePlate.tsx). Twenty quotes are now five recognisable
//   colours with the thinker's name under each, which is what makes a list
//   scannable at all.
//
// · THE ERA RAIL AT THE TOP IS THE SET. Five tiles, one per era, each showing
//   how many you hold. An era you have nothing from is drawn FLAT AND COOL —
//   `GHOST` over `LOCKED_FACE`, the exact treatment tone.ts already gives a
//   locked rank pin, for the reason stated there: "the same thing, dimmer" is
//   indistinguishable from a rendering fault, whereas unlit against lit is the
//   reward for earning it. So the gap in your collection is visible, and the
//   tiles double as the filter.
//
// The count that matters is therefore not "12 quotes" but "3 of 5 eras, 8
// thinkers" — a set with a shape, and a visible way to finish it.
// ─────────────────────────────────────────────────────────────────────────────

export default function SavedQuotesSheet() {
  const open = useUIStore((s) => s.savedQuotesOpen);
  const close = useUIStore((s) => s.closeSavedQuotes);
  const openPhilosopher = useUIStore((s) => s.openPhilosopher);
  const savedQuotes = useUserDataStore((s) => s.savedQuotes);
  const removeQuote = useUserDataStore((s) => s.removeQuote);
  const pinnedQuoteId = useUserDataStore((s) => s.pinnedQuoteId);
  const setPinnedQuote = useUserDataStore((s) => s.setPinnedQuote);
  const profileQuote = useUserDataStore((s) => s.profileQuote);
  const setProfileQuote = useUserDataStore((s) => s.setProfileQuote);
  // The home-screen widget is Android-only, so the pin control only appears there.
  const canPin = Platform.OS === 'android';

  const { height } = useWindowDimensions();
  const H = Math.round(height * 0.82);
  const [visible, setVisible] = useState(false);
  const [filter, setFilter] = useState<EraKey | null>(null);

  useEffect(() => {
    if (open) setVisible(true);
  }, [open]);

  // A filter that outlives the sheet would open it showing an empty list for no
  // visible reason, so it is dropped every time the sheet is raised.
  useEffect(() => {
    if (!open) setFilter(null);
  }, [open]);

  // ONE PASS OVER THE COLLECTION, and everything the header says comes out of
  // it: which era each quote belongs to, how many per era, and how many
  // distinct thinkers are represented.
  const census = useMemo(() => {
    const perEra: Record<string, number> = {};
    const eraOf = new Map<string, EraKey | null>();
    const thinkers = new Set<string>();
    for (const q of savedQuotes) {
      const g = (eraGroupOfId(q.philosopherId) as EraKey | null) ?? null;
      eraOf.set(q.id, g);
      if (g) perEra[g] = (perEra[g] ?? 0) + 1;
      if (q.philosopherId) thinkers.add(q.philosopherId);
    }
    const held = ERA_GROUPS.filter((g) => (perEra[g] ?? 0) > 0).length;
    return { perEra, eraOf, thinkers: thinkers.size, held };
  }, [savedQuotes]);

  if (!visible) return null;

  const eraFor = (philosopherId: string) =>
    ALL_PHILOSOPHERS.find((p) => p.id === philosopherId)?.era ?? null;

  // Open the thinker behind a quote: dismiss this sheet, then raise the
  // philosopher sheet so they don't stack.
  const openThinker = (q: SavedQuote) => {
    close();
    openPhilosopher(q.philosopherId);
  };

  const shown = filter ? savedQuotes.filter((q) => census.eraOf.get(q.id) === filter) : savedQuotes;

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

              {savedQuotes.length > 0 && (
                <>
                  {/* WHAT THE SET LOOKS LIKE, not just how many you have. */}
                  <Text style={styles.census}>
                    {census.held} of {ERA_GROUPS.length} eras
                    {'   ·   '}
                    {census.thinkers} {census.thinkers === 1 ? 'thinker' : 'thinkers'}
                  </Text>

                  <View style={styles.rail}>
                    {ERA_GROUPS.map((g) => (
                      <EraTile
                        key={g}
                        era={g as EraKey}
                        n={census.perEra[g] ?? 0}
                        on={filter === g}
                        onPress={() => setFilter(filter === g ? null : (g as EraKey))}
                      />
                    ))}
                  </View>
                </>
              )}

              {savedQuotes.length === 0 ? (
                <View style={styles.empty}>
                  <View style={styles.emptyIcon}>
                    <SketchIcon name="bookmark" size={30} color={InkFaint} />
                  </View>
                  <Text style={styles.emptyTitle}>Nothing kept yet</Text>
                  <Text style={styles.emptyHint}>
                    Bookmark a quote in a lesson, on a thinker’s profile, or on Quote of the Day
                    and it is kept here.
                  </Text>
                  {/* The empty state shows the SHAPE of the set, so the first
                      save has somewhere to land rather than being the start of
                      an undifferentiated pile. */}
                  <View style={styles.emptyRail}>
                    {ERA_GROUPS.map((g) => (
                      <EraTile key={g} era={g as EraKey} n={0} on={false} />
                    ))}
                  </View>
                  <Text style={styles.emptyRailHint}>Five eras to collect from.</Text>
                </View>
              ) : shown.length === 0 ? (
                <View style={styles.noneHere}>
                  <Text style={styles.noneHereText}>
                    Nothing from {filter?.toLowerCase()} philosophy yet.
                  </Text>
                  <Pressable onPress={() => setFilter(null)} hitSlop={8}>
                    <Text style={styles.noneHereLink}>Show everything</Text>
                  </Pressable>
                </View>
              ) : (
                <ScrollView
                  style={{ flex: 1 }}
                  contentContainerStyle={styles.list}
                  showsVerticalScrollIndicator={false}
                >
                  {shown.map((q) => (
                    <QuotePlate
                      key={q.id}
                      text={q.text}
                      author={q.author}
                      meta={eraFor(q.philosopherId)}
                      eraGroup={census.eraOf.get(q.id) ?? null}
                      onPress={() => openThinker(q)}
                      showChevron
                      saved
                      onToggleSave={() => removeQuote(q.id)}
                      featured={profileQuote?.id === q.id}
                      onToggleFeature={() =>
                        setProfileQuote(
                          profileQuote?.id === q.id
                            ? null
                            : { id: q.id, text: q.text, author: q.author, philosopherId: q.philosopherId }
                        )
                      }
                      footer={
                        canPin ? (
                          <Pressable
                            onPress={() => setPinnedQuote(pinnedQuoteId === q.id ? null : q.id)}
                            style={({ pressed }) => [
                              styles.pinRow,
                              pinnedQuoteId === q.id && styles.pinRowOn,
                              pressed && { opacity: 0.7 },
                            ]}
                          >
                            <SketchIcon name="home" size={13} color={pinnedQuoteId === q.id ? Paper : Ink} />
                            <Text style={[styles.pinText, pinnedQuoteId === q.id && { color: Paper }]}>
                              {pinnedQuoteId === q.id ? 'PINNED TO HOME SCREEN' : 'PIN TO HOME SCREEN'}
                            </Text>
                          </Pressable>
                        ) : null
                      }
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

/**
 * ONE ERA IN THE SET.
 *
 * Held → a struck tile: the era's own face along the one light, its rim, its
 * count. Empty → `LOCKED_FACE` under `GHOST`, flat and cool, exactly as a locked
 * rank pin is drawn. That contrast is the whole readout; see tone.ts for why it
 * is unlit-against-lit rather than dimmer-than-lit.
 */
function EraTile({
  era, n, on, onPress,
}: {
  era: EraKey; n: number; on: boolean; onPress?: () => void;
}) {
  const P = platePalette(ERA[era]);
  const has = n > 0;

  const inner = (
    <View style={[styles.tile, on && { borderColor: P.label, borderWidth: 2 }]}>
      <LinearGradient
        colors={has ? P.face : LOCKED_FACE.map((s) => s[1]) as [string, string]}
        start={{ x: 0.15, y: 0 }}
        end={{ x: 0.85, y: 1 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <View style={[styles.tileBar, { backgroundColor: has ? P.spine.base : GHOST }]} />
      <Text style={[styles.tileN, { color: has ? P.label : GHOST }]}>{n}</Text>
      <Text style={[styles.tileLabel, { color: has ? P.label : GHOST }]} numberOfLines={1}>
        {/* Four letters is all that fits at a fifth of the width, and the first
            four are unique across all five groups. */}
        {era.slice(0, 4)}
      </Text>
    </View>
  );

  if (!onPress) return <View style={styles.tileWrap}>{inner}</View>;
  return (
    <Pressable
      style={({ pressed }) => [styles.tileWrap, pressed && { opacity: 0.7 }]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${n} saved from ${era.toLowerCase()} philosophy`}
    >
      {inner}
    </Pressable>
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

  titleRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 4, marginBottom: 4 },
  title: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 26, color: Ink },
  titleItalic: { fontFamily: 'PlayfairDisplay_400Regular', fontStyle: 'italic' },
  count: { fontFamily: 'Inter_700Bold', fontSize: 16, color: InkSoft },
  census: { fontFamily: 'Inter_500Medium', fontSize: 11, letterSpacing: 1.1, color: InkSoft, marginBottom: 12 },

  rail: { flexDirection: 'row', gap: 7, marginBottom: 16 },
  tileWrap: { flex: 1 },
  tile: {
    borderWidth: 1.5,
    borderColor: Ink,
    borderRadius: 9,
    paddingTop: 9,
    paddingBottom: 7,
    alignItems: 'center',
    overflow: 'hidden',
  },
  tileBar: { position: 'absolute', top: 0, left: 0, right: 0, height: 3 },
  tileN: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 17, lineHeight: 20 },
  tileLabel: { fontFamily: 'Inter_700Bold', fontSize: 8, letterSpacing: 0.8, marginTop: 1 },

  list: { paddingBottom: 36, gap: 14 },

  // The plate renders `footer` OUTSIDE its padded content box, so this spans the
  // full width on its own and the plate's clipped corners finish it. No margins.
  pinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 11,
    borderTopWidth: 1.5,
    borderTopColor: InkFaint,
  },
  pinRowOn: { backgroundColor: Ink, borderTopColor: Ink },
  pinText: { fontFamily: 'Inter_700Bold', fontSize: 10, color: Ink, letterSpacing: 1.5 },

  noneHere: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, paddingBottom: 80 },
  noneHereText: { fontFamily: 'PlayfairDisplay_400Regular', fontStyle: 'italic', fontSize: 16, color: MID },
  noneHereLink: { fontFamily: 'Inter_700Bold', fontSize: 12, letterSpacing: 1.2, color: Ink },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20, paddingBottom: 40 },
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
  emptyRail: { flexDirection: 'row', gap: 7, alignSelf: 'stretch', marginTop: 26 },
  emptyRailHint: { fontFamily: 'Inter_500Medium', fontSize: 10.5, letterSpacing: 1.1, color: InkSoft, marginTop: 10 },
});
