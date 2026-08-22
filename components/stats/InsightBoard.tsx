import { useEffect, useMemo, useState } from 'react';
import {
  View, Text, Pressable, StyleSheet, AccessibilityInfo,
  type StyleProp, type ViewStyle,
} from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, useAnimatedProps,
  withSpring, withTiming, withDelay, withSequence, Easing,
  type SharedValue,
} from 'react-native-reanimated';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import ACounter, { counterStyle } from '@/components/shared/ACounter';
import { StruckBar, StruckTile } from '@/components/profile/Struck';
import { INK, PAPER, PAPER_LIT, MID, ramp, mix, METAL } from '@/components/shared/tone';
import { C } from '@/constants/design';
import { milestoneFor, type StatElement, type Milestone } from '@/lib/utils/statsMilestone';
import type { Discovery } from '@/lib/utils/statsDiscovery';
import { cue } from '@/lib/feedback';

// ─────────────────────────────────────────────────────────────────────────────
// THE INSIGHTS TAB'S PARTS.
//
// ── EVERYTHING IS STRUCK, AND NOT BY A NEW SYSTEM ───────────────────────────
//
// `components/profile/Struck.tsx` already draws bars, tiles and metal plates in
// the one light from `tone.ts`. This tab uses those rather than growing a
// parallel set — the whole argument for one light is that it never moves, and
// two files drawing the same object is how it starts moving.
//
// ── THE BOUNCE, AND WHY IT IS NOT ON EVERYTHING ─────────────────────────────
//
//   > "I want cool animations, like when the graphs gets updated becuase of
//   > something the user did ... the information in the graph squezzes in and
//   > then bounces out further because of the change of the graph. I want a
//   > smooth gamified bouncy animation for this."
//
// `bounceTo` is that motion, and it has two modes on purpose. A row that GREW
// since the reader last looked squeezes back first and then springs past its
// new length before settling — anticipation, then overshoot, which is the whole
// of why a bounce reads as a thing reacting rather than a thing appearing. Every
// other row just springs in.
//
// The distinction is the point. A bounce that plays on every row every visit is
// decoration and stops meaning anything by the third visit; a bounce on the one
// row the reader moved is feedback. `grownKeys` in statsMilestone.ts is what
// knows which, and it gets it out of the fingerprint the tab already stores.
//
// ── THE HEADROOM IS 30% AND IT IS LOAD-BEARING ──────────────────────────────
//
// Bars draw against `max × 1.3`, not `max`. If the leader sat at 100% of its
// track there would be nowhere for its ghost — so tapping the biggest bar, the
// one a reader taps first, would be the one tap that showed nothing. It also
// leaves room for the overshoot above to travel into instead of clipping.
//
// It is a CONSTANT: re-scaling on selection would move every bar at once, which
// is the camera cut §17's group L is about.
// ─────────────────────────────────────────────────────────────────────────────

/** See the note above. Also the floor `check-stats.mjs` measures ghosts against. */
export const HEADROOM = 1.3;
export const MIN_GHOST = 8 / 144;

/**
 * SQUEEZE IN, THEN BOUNCE OUT FURTHER.
 *
 * Built on the JS thread and assigned to a shared value, so it deliberately is
 * NOT a worklet — which also keeps it clear of §17's rule 2, the trap where a
 * worklet calling a worklet declared below it throws at import.
 *
 * `damping: 7.5` is what makes the spring overshoot; anything over about 12
 * settles without ever passing the target and the bounce disappears. The 0.82
 * squeeze is small enough to read as a wind-up rather than as the bar breaking.
 */
export function bounceTo(to: number, delay: number, pop: boolean) {
  if (pop) {
    return withDelay(delay, withSequence(
      withTiming(to * 0.82, { duration: 150, easing: Easing.out(Easing.quad) }),
      withSpring(to, { damping: 7.5, stiffness: 190, mass: 0.9 }),
    ));
  }
  return withDelay(delay, withSpring(to, { damping: 11, stiffness: 155, mass: 0.9 }));
}

// ── the ledger ───────────────────────────────────────────────────────────────

export interface LedgerItem { key: string; label: string; value: number; hue: string }

/**
 * FOUR NUMBERS THAT ONLY EVER GO UP.
 *
 * Deliberately not "12 of 34": a denominator drawn from the curriculum shrinks
 * a reader's achievement every time content ships, which is the complaint this
 * redesign started from. These are counts of things done, full stop.
 */
export function Ledger({ items, playToken, animate, grown }: {
  items: LedgerItem[]; playToken: number; animate: boolean; grown: Set<string>;
}) {
  return (
    <View style={s.ledger}>
      {items.map((it, i) => (
        <LedgerTile
          key={it.key}
          item={it}
          index={i}
          playToken={playToken}
          animate={animate}
          pop={grown.has(it.key)}
        />
      ))}
    </View>
  );
}

function LedgerTile({ item, index, playToken, animate, pop }: {
  item: LedgerItem; index: number; playToken: number; animate: boolean; pop: boolean;
}) {
  const r = ramp(item.hue);
  const n = useSharedValue(animate ? 0 : item.value);
  const rise = useSharedValue(animate ? 0 : 1);

  useEffect(() => {
    if (!animate) { n.value = item.value; rise.value = 1; return; }
    n.value = 0; rise.value = 0;
    rise.value = bounceTo(1, index * 70, pop);
    n.value = withDelay(index * 70, withTiming(item.value, { duration: 760, easing: Easing.out(Easing.cubic) }));
  }, [playToken, animate, item.value, index, pop, n, rise]);

  const props = useAnimatedProps(() => ({ text: `${Math.round(n.value)}` }) as never);
  const style = useAnimatedStyle(() => ({
    opacity: Math.min(1, rise.value * 1.6),
    transform: [{ scale: rise.value }],
  }));

  return (
    <Animated.View style={[s.ledgerCol, style]}>
      <StruckTile accent={r.base} pad={0} style={s.ledgerTile}>
        <View style={s.ledgerInner}>
          <ACounter
            editable={false}
            pointerEvents="none"
            underlineColorAndroid="transparent"
            defaultValue={`${animate ? 0 : item.value}`}
            style={[s.ledgerValue, { color: r.shade }, counterStyle]}
            animatedProps={props}
          />
          <Text style={s.ledgerLabel} numberOfLines={1}>{item.label}</Text>
        </View>
      </StruckTile>
    </Animated.View>
  );
}

// ── ranked bars ──────────────────────────────────────────────────────────────

export interface BarRow {
  key: string;
  label: string;
  value: number;
  hue: string;
  /** The composition line under the name when this row is picked. */
  detail: string;
  action: 'lesson' | 'quote' | 'thinker';
}

/**
 * A RANKED RUN OF STRUCK BARS, in the colour of whatever they are.
 *
 * Tapping one draws its ghost — how far the next round number is — and opens a
 * DISCOVERY, which is a thinker or a fact rather than a restatement of the
 * number already on the row. See lib/utils/statsDiscovery.ts for why.
 */
export function RankedBars({
  title, subtitle, rows, playToken, animate, grown, discoverFor, onOpenThinker, chart, hint, style,
}: {
  title: string; subtitle: string; rows: BarRow[];
  playToken: number; animate: boolean;
  grown: Set<string>;
  discoverFor: (key: string) => Discovery | null;
  onOpenThinker: (id: string) => void;
  /**
   * An optional graph drawn ABOVE the rows, sharing their selection.
   *
   * A render prop rather than a child, because the chart has to know what is
   * picked and be able to pick — the ring and the rows are two views of one
   * choice, and threading that through a parent would put the selection in the
   * screen, where three sections would then have to keep three copies of it.
   */
  chart?: (selected: string | null, onSelect: (key: string) => void) => React.ReactNode;
  /** Shown until a row is picked. One per screen — twice reads as a stutter. */
  hint?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const [sel, setSel] = useState<string | null>(null);
  const [reduce, setReduce] = useState(false);
  const grow = useSharedValue(animate ? 0 : 1);

  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled().then((v) => { if (alive) setReduce(v); });
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (!animate || reduce) { grow.value = 1; return; }
    grow.value = 0;
    grow.value = withDelay(140, withSpring(1, { damping: 13, stiffness: 150, mass: 0.9 }));
  }, [playToken, animate, reduce, grow]);

  const max = rows.reduce((a, r) => (r.value > a ? r.value : a), 0);
  const scale = Math.max(1, max * HEADROOM);

  const selIndex = sel == null ? -1 : rows.findIndex((r) => r.key === sel);
  // The milestone is no longer PRINTED — it draws the ghost, and it carries the
  // accessibility hint, so a screen reader is still told what the dashed part
  // of the bar means. The card says something worth reading instead.
  const milestone: Milestone | null = useMemo(() => {
    if (selIndex < 0) return null;
    const els: StatElement[] = rows.map((r) => ({
      key: r.key, label: r.label, value: r.value, perAction: 1, action: r.action,
    }));
    return milestoneFor(els, selIndex, { minGhost: MIN_GHOST });
  }, [selIndex, rows]);

  const discovery = useMemo(() => (sel == null ? null : discoverFor(sel)), [sel, discoverFor]);

  const pick = (key: string) => {
    setSel((p) => (p === key ? null : key));
    cue('keep');
  };

  return (
    <View style={[s.section, style]}>
      <SectionHead title={title} subtitle={subtitle} />
      {chart ? <View style={s.chart}>{chart(sel, pick)}</View> : null}
      {rows.map((r, i) => (
        <BarLine
          key={r.key}
          row={r}
          index={i}
          count={rows.length}
          scale={scale}
          grow={grow}
          reduce={reduce}
          playToken={playToken}
          animate={animate}
          pop={grown.has(r.key)}
          selected={sel === r.key}
          ghost={sel === r.key && milestone && milestone.kind !== 'none'
            ? (milestone.projected - r.value) / scale
            : 0}
          ghostTo={milestone && milestone.kind !== 'none' ? milestone.projected : 0}
          hintText={sel === r.key && milestone ? milestone.copy : undefined}
          onPress={() => pick(r.key)}
        />
      ))}
      {selIndex >= 0 && discovery ? (
        <DiscoveryCard d={discovery} hue={rows[selIndex].hue} sub={rows[selIndex].detail} onOpen={onOpenThinker} />
      ) : hint ? (
        <Text style={s.hint}>Tap a row to meet someone from it.</Text>
      ) : null}
    </View>
  );
}

function BarLine({
  row, index, count, scale, grow, reduce, playToken, animate, pop,
  selected, ghost, ghostTo, hintText, onPress,
}: {
  row: BarRow; index: number; count: number; scale: number;
  grow: SharedValue<number>; reduce: boolean; playToken: number; animate: boolean; pop: boolean;
  selected: boolean; ghost: number; ghostTo: number; hintText?: string; onPress: () => void;
}) {
  const r = ramp(row.hue);
  const pct = row.value / scale;

  // A row that GREW gets its own squeeze-and-overshoot, on its own clock; the
  // rest ride the shared stagger. Two sources, one property — so the grown row
  // opts out of `grow` entirely rather than fighting it.
  // STARTS AT ITS CURRENT LENGTH, not at zero. A grown row should squeeze IN
  // from where it already was and then spring out past its new length — reset it
  // to 0 first and what the reader sees is the bar being rebuilt, which reads as
  // a reload rather than as a reaction to what they just did.
  const solo = useSharedValue(1);
  useEffect(() => {
    if (!pop) return;
    if (!animate || reduce) { solo.value = 1; return; }
    solo.value = bounceTo(1, 260 + index * 60, true);
  }, [playToken, animate, reduce, pop, index, solo]);

  const fillStyle = useAnimatedStyle(() => {
    if (pop) return { transform: [{ scaleX: solo.value }] };
    const lead = (index / Math.max(1, count)) * 0.35;
    const t = Math.min(1, Math.max(0, (grow.value - lead) / (1 - lead)));
    return { transform: [{ scaleX: t }] };
  });

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${row.label}, ${row.value}`}
      accessibilityHint={hintText}
      style={({ pressed }) => [s.barRow, pressed && { opacity: 0.75 }]}
    >
      <View style={s.barTop}>
        <View style={[s.barChip, { backgroundColor: r.track, borderColor: r.base }]} />
        <Text style={[s.barLabel, selected && { color: r.shade }]} numberOfLines={1}>{row.label}</Text>
        <Text style={[s.barValue, { color: r.base }]}>{row.value}</Text>
      </View>

      {/* The track is always full width; only the FILL grows, so the groove is
          there from the first frame and the bar fills into it. */}
      <View style={s.barTrack}>
        <Animated.View style={[s.barFill, fillStyle]}>
          <StruckBar pct={pct} fill={r} height={12} />
        </Animated.View>
        {ghost > 0 ? (
          <MotiView
            pointerEvents="none"
            from={{ opacity: 0, scaleX: 0.4 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ type: 'spring', damping: 9, stiffness: 170 }}
            style={[
              s.ghost,
              {
                left: `${pct * 100}%`,
                width: `${Math.min(1 - pct, ghost) * 100}%`,
                borderColor: r.shade,
              },
            ]}
          >
            {/* The target as a NUMERAL, not a sentence — the dashed run already
                says "this far", so the only thing missing is how far. */}
            <Text style={[s.ghostNum, { color: r.shade }]} numberOfLines={1}>{ghostTo}</Text>
          </MotiView>
        ) : null}
      </View>
    </Pressable>
  );
}

// ── the discovery card ───────────────────────────────────────────────────────

/**
 * WHAT A TAP IS FOR.
 *
 * It used to print "5 more lessons and Ethics reaches 20", which is a sentence
 * about a number already on the row. This is a thinker the reader has never
 * opened, or a fact about one they read constantly — and it ends in a door.
 */
export function DiscoveryCard({ d, hue, sub, onOpen }: {
  d: Discovery; hue: string; sub?: string; onOpen: (id: string) => void;
}) {
  const r = ramp(hue);
  return (
    <MotiView
      key={`${d.kicker}-${d.name ?? ''}-${d.body.slice(0, 12)}`}
      from={{ opacity: 0, translateY: -6, scale: 0.97 }}
      animate={{ opacity: 1, translateY: 0, scale: 1 }}
      transition={{ type: 'spring', damping: 14, stiffness: 190 }}
      style={[s.card, { borderLeftColor: r.base, backgroundColor: mix(PAPER, hue, 0.05) }]}
    >
      <Text style={[s.cardKicker, { color: r.shade }]} numberOfLines={1}>{d.kicker}</Text>

      {d.name ? (
        <View style={s.cardWho}>
          {d.symbol ? <Text style={s.cardSymbol}>{d.symbol}</Text> : null}
          <Text style={s.cardName} numberOfLines={1}>{d.name}</Text>
          {d.meta ? <Text style={s.cardMeta} numberOfLines={1}>{d.meta}</Text> : null}
        </View>
      ) : null}

      <Text style={s.cardBody}>{d.body}</Text>

      {sub ? <Text style={s.cardSub} numberOfLines={1}>{sub}</Text> : null}

      {d.philosopherId ? (
        <Pressable
          onPress={() => { cue('keep'); onOpen(d.philosopherId as string); }}
          accessibilityRole="button"
          style={({ pressed }) => [s.cardCta, pressed && { opacity: 0.6 }]}
        >
          <Text style={[s.cardCtaText, { color: r.shade }]}>
            {d.kind === 'meet' ? `Meet ${d.name}` : `Read ${d.name}`}
          </Text>
          <Text style={[s.cardCtaText, { color: r.base }]}>→</Text>
        </Pressable>
      ) : null}
    </MotiView>
  );
}

// ── the thinker league ───────────────────────────────────────────────────────

export interface LeagueRow {
  id: string;
  name: string;
  hue: string;
  era: string;
  lessons: number;
  quotes: number;
  score: number;
}

/**
 * WHO YOU READ MOST — a ranked league, not a pie.
 *
 * Five names in a pie is the least readable form a ranking can take: it asks
 * the reader to compare five arcs and then hunt a legend for which arc is whom.
 * A league puts the ranking where a ranking belongs — in the order — and the
 * first three places wear the app's own metals, which is already what a badge
 * tier means here.
 *
 * Tapping does NOT jump straight to the profile any more. It opens a fact about
 * them first, because a tap that navigates away is the one interaction that
 * cannot tell you anything.
 */
export function ThinkerLeague({
  rows, playToken, animate, grown, discoverFor, onOpen, style,
}: {
  rows: LeagueRow[]; playToken: number; animate: boolean;
  grown: Set<string>;
  discoverFor: (id: string) => Discovery | null;
  onOpen: (id: string) => void; style?: StyleProp<ViewStyle>;
}) {
  const [sel, setSel] = useState<string | null>(null);
  const grow = useSharedValue(animate ? 0 : 1);
  useEffect(() => {
    if (!animate) { grow.value = 1; return; }
    grow.value = 0;
    grow.value = withDelay(220, withSpring(1, { damping: 14, stiffness: 160 }));
  }, [playToken, animate, grow]);

  const max = rows.reduce((a, r) => (r.score > a ? r.score : a), 0) || 1;
  const discovery = useMemo(() => (sel == null ? null : discoverFor(sel)), [sel, discoverFor]);
  const selRow = rows.find((r) => r.id === sel);

  return (
    <View style={[s.section, style]}>
      <SectionHead title="Who You Read Most" subtitle="lessons about them, and quotes of theirs you kept" />
      {rows.map((r, i) => (
        <LeagueLine
          key={r.id}
          row={r}
          place={i}
          count={rows.length}
          max={max}
          grow={grow}
          animate={animate}
          playToken={playToken}
          pop={grown.has(r.id)}
          selected={sel === r.id}
          onPress={() => { setSel((p) => (p === r.id ? null : r.id)); cue('keep'); }}
        />
      ))}
      {discovery && selRow ? (
        <DiscoveryCard d={discovery} hue={selRow.hue} onOpen={onOpen} />
      ) : null}
    </View>
  );
}

const PLACE_METAL = [METAL.GOLD, METAL.SILVER, METAL.BRONZE];

function LeagueLine({
  row, place, count, max, grow, animate, playToken, pop, selected, onPress,
}: {
  row: LeagueRow; place: number; count: number; max: number;
  grow: SharedValue<number>; animate: boolean; playToken: number;
  pop: boolean; selected: boolean; onPress: () => void;
}) {
  const r = ramp(row.hue);
  const metal = PLACE_METAL[place];

  // See BarLine: a grown row squeezes from its current length, never from zero.
  const solo = useSharedValue(1);
  useEffect(() => {
    if (!pop) return;
    if (!animate) { solo.value = 1; return; }
    solo.value = bounceTo(1, 320 + place * 60, true);
  }, [playToken, animate, pop, place, solo]);

  const fillStyle = useAnimatedStyle(() => {
    if (pop) return { transform: [{ scaleX: solo.value }] };
    const lead = (place / Math.max(1, count)) * 0.4;
    const t = Math.min(1, Math.max(0, (grow.value - lead) / (1 - lead)));
    return { transform: [{ scaleX: t }] };
  });

  const parts = [
    row.lessons ? `${row.lessons} lesson${row.lessons === 1 ? '' : 's'}` : null,
    row.quotes ? `${row.quotes} quote${row.quotes === 1 ? '' : 's'}` : null,
  ].filter(Boolean);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${row.name}, number ${place + 1} of ${count}`}
      style={({ pressed }) => [s.leagueRow, pressed && { opacity: 0.75 }]}
    >
      {/* First three places are struck in a metal; the rest get a plain paper
          disc, so the podium reads without a caption saying "podium". */}
      {metal ? (
        <LinearGradient
          colors={[metal.lit, metal.base, metal.shade]}
          start={{ x: 0.15, y: 0 }}
          end={{ x: 0.85, y: 1 }}
          style={[s.place, { borderColor: metal.rim }]}
        >
          <Text style={[s.placeNum, { color: metal.on }]}>{place + 1}</Text>
        </LinearGradient>
      ) : (
        <View style={[s.place, s.placePlain]}>
          <Text style={[s.placeNum, { color: MID }]}>{place + 1}</Text>
        </View>
      )}

      <View style={s.leagueBody}>
        <View style={s.leagueTop}>
          <Text style={[s.leagueName, selected && { color: r.shade }]} numberOfLines={1}>{row.name}</Text>
          <Text style={[s.leagueEra, { color: r.shade }]} numberOfLines={1}>{row.era}</Text>
        </View>
        <View style={s.leagueTrack}>
          <Animated.View style={[s.barFill, fillStyle]}>
            <StruckBar pct={row.score / max} fill={r} height={8} />
          </Animated.View>
        </View>
        {parts.length ? <Text style={s.leagueParts}>{parts.join('  ·  ')}</Text> : null}
      </View>
    </Pressable>
  );
}

// ── shared ───────────────────────────────────────────────────────────────────

export function SectionHead({ title, subtitle, right }: {
  title: string; subtitle: string; right?: React.ReactNode;
}) {
  return (
    <View style={s.head}>
      <View style={{ flex: 1 }}>
        <Text style={s.headTitle}>{title}</Text>
        <Text style={s.headSub}>{subtitle}</Text>
      </View>
      {right}
    </View>
  );
}

const s = StyleSheet.create({
  section: { marginTop: 28 },
  chart: { marginBottom: 18 },

  head: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 14 },
  headTitle: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 19, color: INK },
  headSub: {
    fontFamily: 'PlayfairDisplay_400Regular', fontStyle: 'italic',
    fontSize: 12, color: C.inkSoft, marginTop: 2,
  },

  // ── ledger ──
  ledger: { flexDirection: 'row', gap: 8, marginTop: 22 },
  ledgerCol: { flex: 1 },
  ledgerTile: { flex: 1 },
  ledgerInner: { paddingVertical: 12, paddingHorizontal: 6, alignItems: 'center' },
  ledgerValue: {
    fontFamily: 'PlayfairDisplay_700Bold', fontSize: 26, lineHeight: 30,
    // Full width of the tile so the input cannot claim its own — see ACounter.
    width: '100%', textAlign: 'center', padding: 0, margin: 0,
  },
  ledgerLabel: {
    fontFamily: 'Inter_700Bold', fontSize: 8, letterSpacing: 0.9,
    color: C.inkSoft, marginTop: 3, textAlign: 'center',
  },

  // ── bars ──
  barRow: { marginBottom: 14 },
  barTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  barChip: { width: 12, height: 12, borderRadius: 3, borderWidth: 1.5 },
  barLabel: { flex: 1, fontFamily: 'Inter_500Medium', fontSize: 13, color: INK },
  barValue: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 16 },
  barTrack: { position: 'relative', justifyContent: 'center' },
  // The FILL is what grows, anchored at the left edge. RN scales about the
  // centre by default, which would grow a bar out of both ends of its groove.
  barFill: { transformOrigin: 'left' },
  ghost: {
    position: 'absolute', top: 0, bottom: 0,
    borderWidth: 1.5, borderStyle: 'dashed', borderRadius: 6,
    backgroundColor: 'transparent',
    transformOrigin: 'left',
    alignItems: 'flex-end', justifyContent: 'center',
    paddingRight: 4,
  },
  ghostNum: { fontFamily: 'Inter_700Bold', fontSize: 9 },

  hint: {
    fontFamily: 'PlayfairDisplay_400Regular', fontStyle: 'italic',
    fontSize: 12.5, color: C.inkSoft, marginTop: 2,
  },

  // ── the discovery card ──
  card: { borderLeftWidth: 4, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 12, marginTop: 4 },
  cardKicker: { fontFamily: 'Inter_700Bold', fontSize: 9.5, letterSpacing: 1.5 },
  cardWho: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginTop: 7 },
  cardSymbol: { fontSize: 15 },
  cardName: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 18, color: INK, flexShrink: 1 },
  cardMeta: { fontFamily: 'Inter_400Regular', fontSize: 11, color: C.inkSoft },
  cardBody: {
    fontFamily: 'PlayfairDisplay_400Regular', fontStyle: 'italic',
    fontSize: 15, lineHeight: 22, color: INK, marginTop: 6,
  },
  cardSub: { fontFamily: 'Inter_400Regular', fontSize: 11, color: C.inkSoft, marginTop: 8 },
  cardCta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
  cardCtaText: { fontFamily: 'Inter_700Bold', fontSize: 11.5, letterSpacing: 0.6 },

  // ── league ──
  leagueRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  place: {
    width: 30, height: 30, borderRadius: 15, borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  placePlain: { backgroundColor: PAPER_LIT, borderColor: C.hairline },
  placeNum: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 14 },
  leagueBody: { flex: 1, minWidth: 0 },
  leagueTop: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  leagueName: { flex: 1, fontFamily: 'PlayfairDisplay_700Bold', fontSize: 15, color: INK },
  leagueEra: { fontFamily: 'Inter_700Bold', fontSize: 8.5, letterSpacing: 1.1 },
  leagueTrack: { marginTop: 5 },
  leagueParts: { fontFamily: 'Inter_400Regular', fontSize: 10.5, color: C.inkSoft, marginTop: 4 },
});
