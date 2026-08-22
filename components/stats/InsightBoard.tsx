import { useEffect, useMemo, useState } from 'react';
import {
  View, Text, Pressable, StyleSheet, AccessibilityInfo,
  type StyleProp, type ViewStyle,
} from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, useAnimatedProps, withSpring, withTiming, withDelay, Easing,
  type SharedValue,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import ACounter, { counterStyle } from '@/components/shared/ACounter';
import { StruckBar, StruckTile, MetalPlate } from '@/components/profile/Struck';
import { INK, PAPER, PAPER_LIT, MID, ramp, mix, METAL, type Ramp } from '@/components/shared/tone';
import { C } from '@/constants/design';
import { milestoneFor, type StatElement, type Milestone } from '@/lib/utils/statsMilestone';
import { cue } from '@/lib/feedback';

// ─────────────────────────────────────────────────────────────────────────────
// THE INSIGHTS TAB'S PARTS.
//
// ── WHAT WAS WRONG, IN THREE SENTENCES ──────────────────────────────────────
//
// It drew the same data three times — a pie of "interest", a pie of thinkers and
// a bar chart of "interactions" — so three shapes said one thing and none of
// them said it well. Every one of them was GREY, six branches in six greys, at a
// point where constants/design.ts already held six measured branch hues put there
// for exactly this job. And everything it drew was a COMPOSITE SCORE:
// `lessons×3 + quotes×2 + views`, a number no reader has ever earned or could
// name.
//
// So: colour that means something, counts instead of scores, and four readings
// that are actually four different things.
//
// ── EVERYTHING IS STRUCK, AND NOT BY A NEW SYSTEM ───────────────────────────
//
// `components/profile/Struck.tsx` already draws bars, tiles and metal plates in
// the one light from `tone.ts`. This tab uses those, rather than growing a
// parallel set — the whole argument for one light is that it never moves, and
// two files drawing the same object is how it starts moving.
//
// ── THE HEADROOM IS 30% AND IT IS LOAD-BEARING ──────────────────────────────
//
// Bars are drawn against `max × 1.3`, not against `max`. If the leader sat at
// 100% of its track there would be nowhere to draw its ghost, so tapping the
// biggest bar — the one a reader is most likely to tap first — would be the one
// tap that showed nothing. The headroom is a constant so it cannot change when a
// row is selected: re-scaling on tap would move every bar at once, which is the
// camera cut §17's group L is about.
// ─────────────────────────────────────────────────────────────────────────────

/** See the note above. Also the floor `check-stats.mjs` measures ghosts against. */
export const HEADROOM = 1.3;
export const MIN_GHOST = 8 / 144;

// ── the ledger ───────────────────────────────────────────────────────────────

export interface LedgerItem { label: string; value: number; hue: string }

/**
 * FOUR NUMBERS THAT ONLY EVER GO UP.
 *
 * Deliberately not "12 of 34": a denominator drawn from the curriculum shrinks
 * a reader's achievement every time content ships, which is the whole complaint
 * this redesign started from. These are counts of things done, full stop.
 */
export function Ledger({ items, playToken, animate }: {
  items: LedgerItem[]; playToken: number; animate: boolean;
}) {
  return (
    <View style={s.ledger}>
      {items.map((it, i) => (
        <LedgerTile key={it.label} item={it} index={i} playToken={playToken} animate={animate} />
      ))}
    </View>
  );
}

function LedgerTile({ item, index, playToken, animate }: {
  item: LedgerItem; index: number; playToken: number; animate: boolean;
}) {
  const r = ramp(item.hue);
  const n = useSharedValue(animate ? 0 : item.value);
  const rise = useSharedValue(animate ? 0 : 1);

  useEffect(() => {
    if (!animate) { n.value = item.value; rise.value = 1; return; }
    n.value = 0; rise.value = 0;
    rise.value = withDelay(index * 70, withSpring(1, { damping: 14, stiffness: 170 }));
    n.value = withDelay(index * 70, withTiming(item.value, { duration: 720, easing: Easing.out(Easing.cubic) }));
  }, [playToken, animate, item.value, index, n, rise]);

  const props = useAnimatedProps(() => ({ text: `${Math.round(n.value)}` }) as never);
  const style = useAnimatedStyle(() => ({
    opacity: rise.value,
    transform: [{ translateY: (1 - rise.value) * 10 }],
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
  /** The line under the label when this row is picked — its composition. */
  detail: string;
  action: 'lesson' | 'quote';
}

/**
 * A RANKED RUN OF STRUCK BARS, in the colour of whatever they are.
 *
 * Tapping one draws its ghost and says what would move it. Nothing it can say
 * depends on the size of the curriculum — see lib/utils/statsMilestone.ts, which
 * is where the reader's objection is answered and measured.
 */
export function RankedBars({
  title, subtitle, rows, playToken, animate, hint, style,
}: {
  title: string; subtitle: string; rows: BarRow[];
  playToken: number; animate: boolean;
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
    grow.value = withDelay(160, withSpring(1, { damping: 13, stiffness: 150, mass: 0.9 }));
  }, [playToken, animate, reduce, grow]);

  const max = rows.reduce((a, r) => (r.value > a ? r.value : a), 0);
  const scale = Math.max(1, max * HEADROOM);

  const selIndex = sel == null ? -1 : rows.findIndex((r) => r.key === sel);
  const milestone: Milestone | null = useMemo(() => {
    if (selIndex < 0) return null;
    const els: StatElement[] = rows.map((r) => ({
      key: r.key, label: r.label, value: r.value, perAction: 1, action: r.action,
    }));
    return milestoneFor(els, selIndex, { minGhost: MIN_GHOST });
  }, [selIndex, rows]);

  const pick = (key: string) => {
    setSel((p) => (p === key ? null : key));
    cue('keep');
  };

  return (
    <View style={[s.section, style]}>
      <SectionHead title={title} subtitle={subtitle} />
      {rows.map((r, i) => (
        <BarLine
          key={r.key}
          row={r}
          index={i}
          count={rows.length}
          scale={scale}
          grow={grow}
          selected={sel === r.key}
          ghost={sel === r.key && milestone && milestone.kind !== 'none'
            ? (milestone.projected - r.value) / scale
            : 0}
          onPress={() => pick(r.key)}
        />
      ))}
      {milestone && selIndex >= 0 ? (
        <Detail row={rows[selIndex]} milestone={milestone} reduce={reduce} />
      ) : hint ? (
        <Text style={s.hint}>Tap a row to see what would move it.</Text>
      ) : null}
    </View>
  );
}

function BarLine({ row, index, count, scale, grow, selected, ghost, onPress }: {
  row: BarRow; index: number; count: number; scale: number;
  grow: SharedValue<number>; selected: boolean; ghost: number; onPress: () => void;
}) {
  const r = ramp(row.hue);
  const pct = row.value / scale;

  // Each bar starts a little after the one above it — a stagger, not a queue.
  const fillStyle = useAnimatedStyle(() => {
    const lead = (index / Math.max(1, count)) * 0.35;
    const t = Math.min(1, Math.max(0, (grow.value - lead) / (1 - lead)));
    return { transform: [{ scaleX: t }] };
  });

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${row.label}, ${row.value}`}
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
          <View
            pointerEvents="none"
            style={[s.ghost, { left: `${pct * 100}%`, width: `${Math.min(1 - pct, ghost) * 100}%`, borderColor: r.shade }]}
          />
        ) : null}
      </View>
    </Pressable>
  );
}

function Detail({ row, milestone, reduce }: { row: BarRow; milestone: Milestone; reduce: boolean }) {
  const r = ramp(row.hue);
  const shown = useSharedValue(row.value);

  useEffect(() => {
    if (milestone.kind === 'none') { shown.value = row.value; return; }
    shown.value = row.value;
    if (reduce) { shown.value = milestone.projected; return; }
    shown.value = withTiming(milestone.projected, { duration: 620, easing: Easing.out(Easing.cubic) });
  }, [row.value, milestone, reduce, shown]);

  const props = useAnimatedProps(() => ({ text: `${Math.round(shown.value)}` }) as never);

  return (
    <View style={[s.detail, { borderLeftColor: r.base, backgroundColor: mix(PAPER, row.hue, 0.05) }]}>
      <View style={s.detailHead}>
        <Text style={[s.detailLabel, { color: r.shade }]} numberOfLines={1}>{row.label.toUpperCase()}</Text>
        {milestone.kind !== 'none' ? (
          <View style={s.detailNums}>
            <Text style={s.detailNow}>{row.value}</Text>
            <Text style={s.detailArrow}>→</Text>
            <ACounter
              editable={false}
              pointerEvents="none"
              underlineColorAndroid="transparent"
              defaultValue={`${row.value}`}
              style={[s.detailNext, { color: r.base }, counterStyle]}
              animatedProps={props}
            />
          </View>
        ) : null}
      </View>
      <Text style={s.detailSub}>{row.detail}</Text>
      <Text style={s.detailCopy}>{milestone.copy}</Text>
    </View>
  );
}

// ── the thinker league ───────────────────────────────────────────────────────

export interface LeagueRow {
  id: string;
  name: string;
  /** The era group, for its colour. Null if the thinker is not on file. */
  hue: string;
  era: string;
  lessons: number;
  quotes: number;
  score: number;
}

/**
 * WHO YOU READ MOST — a ranked league, not a pie.
 *
 * Five names in a pie is the least readable form a ranking can take: it asks the
 * reader to compare five arcs and then hunt a legend for which arc is whom. A
 * league puts the ranking in the one place a ranking belongs — the order — and
 * the first three places wear the app's own metals, which are already what a
 * badge tier means here.
 */
export function ThinkerLeague({ rows, playToken, animate, onOpen, style }: {
  rows: LeagueRow[]; playToken: number; animate: boolean;
  onOpen: (id: string) => void; style?: StyleProp<ViewStyle>;
}) {
  const grow = useSharedValue(animate ? 0 : 1);
  useEffect(() => {
    if (!animate) { grow.value = 1; return; }
    grow.value = 0;
    grow.value = withDelay(240, withSpring(1, { damping: 14, stiffness: 160 }));
  }, [playToken, animate, grow]);

  const max = rows.reduce((a, r) => (r.score > a ? r.score : a), 0) || 1;

  return (
    <View style={[s.section, style]}>
      <SectionHead title="Who You Read Most" subtitle="lessons about them, and quotes of theirs you kept" />
      {rows.map((r, i) => (
        <LeagueLine key={r.id} row={r} place={i} count={rows.length} max={max} grow={grow} onPress={() => onOpen(r.id)} />
      ))}
    </View>
  );
}

const PLACE_METAL = [METAL.GOLD, METAL.SILVER, METAL.BRONZE];

function LeagueLine({ row, place, count, max, grow, onPress }: {
  row: LeagueRow; place: number; count: number; max: number;
  grow: SharedValue<number>; onPress: () => void;
}) {
  const r = ramp(row.hue);
  const metal = PLACE_METAL[place];

  const fillStyle = useAnimatedStyle(() => {
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
      accessibilityLabel={`${row.name}, ${place + 1} of ${count}`}
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
          <Text style={s.leagueName} numberOfLines={1}>{row.name}</Text>
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

/** A gold plate for a reading that has topped out — the only "complete" left. */
export function TopPlate({ label }: { label: string }) {
  return <MetalPlate metal={METAL.GOLD} label={label} />;
}

const s = StyleSheet.create({
  section: { marginTop: 28 },

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
  },

  hint: {
    fontFamily: 'PlayfairDisplay_400Regular', fontStyle: 'italic',
    fontSize: 12, color: C.dim, marginTop: 2,
  },

  detail: { borderLeftWidth: 4, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, marginTop: 4 },
  detailHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  detailLabel: { flex: 1, fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.4 },
  detailNums: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  detailNow: { fontFamily: 'Inter_500Medium', fontSize: 13, color: C.inkSoft },
  detailArrow: { fontFamily: 'Inter_400Regular', fontSize: 12, color: C.dim },
  // WIDTH, not minWidth — see the note in ACounter.tsx. Four digits of
  // Playfair 17 is 44px; nobody reads 10,000 lessons in one branch.
  detailNext: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 17, padding: 0, margin: 0, width: 46 },
  detailSub: { fontFamily: 'Inter_400Regular', fontSize: 11.5, color: C.inkSoft, marginTop: 5 },
  detailCopy: {
    fontFamily: 'PlayfairDisplay_400Regular', fontStyle: 'italic',
    fontSize: 14, color: INK, marginTop: 4, lineHeight: 20,
  },

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
