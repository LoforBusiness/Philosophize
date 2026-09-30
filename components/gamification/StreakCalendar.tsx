import { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet, type LayoutChangeEvent } from 'react-native';
import { useFocusEffect } from 'expo-router';
import Animated, {
  useSharedValue, useAnimatedStyle, useAnimatedReaction, withTiming, withRepeat,
  cancelAnimation, Easing,
  type SharedValue,
} from 'react-native-reanimated';
import SketchIcon from '@/components/shared/SketchIcon';
import Meter from '@/components/ui/Meter';
import { STREAK_EMBER, STREAK_DEEP, SLATE, STREAK_MILESTONES } from '@/constants/streak';
import { mix, PAPER_LIT, FLAT_EDGE, SAND } from '@/components/shared/tone';
import { LINE } from '@/components/shared/drawn';
import { C } from '@/constants/design';
import {
  buildMonth,
  shiftMonth,
  WEEKDAY_LABELS,
  type CalendarDay,
} from '@/lib/utils/streakCalendar';

const INK = C.ink;
const INK_SOFT = C.inkSoft;
const PAPER = C.paper;
const FAINT = '#C9C5BA';

// ── THE GRID ARRIVES ON FOCUS, AND IT IS ONE SHARED VALUE ───────────────────
//
// Moti's `from` fires on MOUNT and a tab screen mounts once, so an entrance
// written that way played at startup behind the launch animation and never
// again. A shared value is set imperatively on focus and needs no render.
const BLOOM_STEP = 8;      // ms between one cell and the next
const BLOOM_HOLD = 240;    // where the last cell starts, however long the month
const BLOOM_CELL = 200;    // how long one cell takes
const BLOOM_MS = BLOOM_HOLD + BLOOM_CELL;
const PULSE_MS = 1800;

// ─────────────────────────────────────────────────────────────────────────────
// THE STREAK MONTH.
//
// Which days the reader studied, which they missed, which a rest day covered,
// and where they are now.
//
// ── THE THIRD DESIGN (2026-09-29) ──────────────────────────────────────────
//
// "I don't really like how the calendar looks and the circles and just
// everything there looks very cheap and the color really doesn't go very good."
// Measured against the rest of the app, it was the last surface still drawn the
// old way: every studied day a separate GRADIENT disc (lit corner to shaded
// corner) sitting on a pale gradient rail behind it, so a week of study read as
// seven marbles on a smear — and 2026-09-16 took exactly that tan-edged gradient
// off every other surface for reading as AI.
//
// It is the depth kit now, the construction the tabs and the lessons share:
//
//   THE CURRENT RUN IS ONE CAPSULE per row — a flat ember band with the app's
//   ink outline and a hard ledge, the day numbers set on it in paper. One object
//   per run, not a chain of tokens, which is how the best streak calendars draw
//   it: the run IS the shape. A lone studied day is simply a capsule one day
//   long, which is a disc.
//   EARLIER RUNS are the same capsule in a quiet tint, with no ledge — real, but
//   not the one being kept.
//   A REST DAY is a hollow link: a white disc set into the band with its number
//   in ember. The chain survives it and the reader did not study.
//   TODAY, UNFED, is a white disc with an ink rim and one slow breathing ring —
//   the only cell the reader can still change.
//   A MISSED DAY is its number in grey and nothing else. Quiet on purpose: the
//   band breaking is the whole story and a wall of accusations is what makes
//   people delete an app.
//   A MILESTONE — the day a society admitted them — wears a small sand seal on
//   its corner.
//
// ── IT STILL MEASURES ITSELF ────────────────────────────────────────────────
//
// A capsule spans from one cell's centre to another's, and a centre is not
// knowable inside a flex row, so one `onLayout` gives every cell an exact pitch
// and every band and seal is arithmetic from it. A run that crosses a Sunday runs
// off the row edge and picks up at the start of the next: a run is one thing,
// the week boundary is an accident of printing.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * AN EARLIER RUN'S BAND. The ember taken toward paper — 2.34:1 on paper, so it is
 * a band and not a rumour (a beige wash measured 1.18 and read as nothing), and
 * still well under the current run's ember, so the run being kept out-ranks the
 * ones that ended. `check:streak` holds both.
 */
const RAIL = mix(STREAK_EMBER, PAPER, 0.62);
const RAIL_EDGE = mix(STREAK_EMBER, INK, 0.25);

interface Props {
  activeDays: readonly string[];
  restDays: readonly string[];
  /** YYYY-MM-DD. Passed in so the grid is testable and never reads the clock. */
  today: string;
  /** The reader's first day, so pre-history draws blank rather than failed. */
  since: string | null;
  /** Cell diameter. */
  size?: number;
  /**
   * Fired with the month now on screen, so a caller can show ITS figures rather
   * than always this month's. The grid owns the paging, so the month is reported
   * rather than controlled.
   */
  onMonth?: (year: number, month: number) => void;
  /**
   * True while the scroll this grid sits in is MOVING. Today's ring is the only
   * thing here that animates for ever, and one animated node is enough to force
   * Android's overscroll stretch to re-rasterise the whole page every frame of
   * the bounce — see the note by the reaction below.
   */
  hold?: SharedValue<boolean>;
}

const DAY_MS = 86400000;
const keyOf = (t: number) => new Date(t).toISOString().slice(0, 10);
const lit = (c: CalendarDay | undefined) => !!c && (c.state === 'done' || c.state === 'rest');

/**
 * How long the run was, as of each day in the month — walked backwards through
 * active-or-rested days, the rule `inRun` uses, so a milestone lands on the day
 * the counter would have said it. Bounded by the longest milestone plus one.
 */
function runLengths(cells: readonly CalendarDay[], active: Set<string>, rest: Set<string>) {
  const out = new Map<string, number>();
  const CAP = STREAK_MILESTONES[STREAK_MILESTONES.length - 1] + 1;
  for (const c of cells) {
    if (!c.key || (c.state !== 'done' && c.state !== 'rest')) continue;
    let n = 0;
    let t = Date.parse(`${c.key}T00:00:00Z`);
    while (n < CAP) {
      const k = keyOf(t);
      if (!active.has(k) && !rest.has(k)) break;
      n++;
      t -= DAY_MS;
    }
    out.set(c.key, n);
  }
  return out;
}

/**
 * Contiguous lit spans within one row, as [firstCol, lastCol, isCurrentRun].
 * A span splits where `inRun` changes, so the current run and an older one never
 * share a band.
 */
function spansIn(row: readonly CalendarDay[]): [number, number, boolean][] {
  const out: [number, number, boolean][] = [];
  let start = -1;
  for (let i = 0; i <= row.length; i++) {
    const on = i < row.length && lit(row[i]);
    const breaks = on && start >= 0 && !!row[i].inRun !== !!row[start].inRun;
    if (start >= 0 && (!on || breaks)) { out.push([start, i - 1, !!row[start].inRun]); start = -1; }
    if (on && start < 0) start = i;
  }
  return out;
}

export default function StreakCalendar({
  activeDays, restDays, today, since, size = 34, onMonth, hold,
}: Props) {
  const [offset, setOffset] = useState(0);
  const [gridW, setGridW] = useState(0);

  const active = useMemo(() => new Set(activeDays), [activeDays]);
  const rest = useMemo(() => new Set(restDays), [restDays]);

  const [ty, tm] = today.split('-').map(Number);
  const at = shiftMonth(ty, tm - 1, offset);
  const month = useMemo(
    () => buildMonth({ year: at.year, month: at.month, active, rest, today, since }),
    [at.year, at.month, active, rest, today, since],
  );
  const runs = useMemo(() => runLengths(month.cells, active, rest), [month.cells, active, rest]);
  const milestone = useMemo(() => {
    const s = new Set<string>();
    for (const [k, n] of runs) if ((STREAK_MILESTONES as readonly number[]).includes(n)) s.add(k);
    return s;
  }, [runs]);

  // Reported in an effect, not during render: a parent's setState during this
  // render is the cross-component update warning.
  useEffect(() => { onMonth?.(at.year, at.month); }, [at.year, at.month, onMonth]);

  // Never page forward past the month the reader is in.
  const canForward = offset < 0;

  const onGrid = (e: LayoutChangeEvent) => {
    const w = Math.round(e.nativeEvent.layout.width);
    if (w !== gridW) setGridW(w);
  };
  const pitch = gridW > 0 ? gridW / 7 : 0;
  const rowH = size + 12;

  const bloom = useSharedValue(0);
  const pulse = useSharedValue(0);

  // ── THE RING HOLDS ITS BREATH WHILE THE PAGE IS MOVING ────────────────────
  //
  // One node dirtied every frame invalidates Android's overscroll capture as
  // surely as a hundred. Paused where it stands and resumed in phase, so the ring
  // never jumps on the frame the reader stops scrolling (group L).
  useAnimatedReaction(
    () => !!hold?.value,
    (held, was) => {
      if (held === was) return;
      if (held) {
        cancelAnimation(pulse);
        return;
      }
      const from = pulse.value;
      pulse.value = withTiming(
        1,
        { duration: PULSE_MS * (1 - from), easing: Easing.linear },
        (done) => {
          if (!done) return;
          pulse.value = 0;
          pulse.value = withRepeat(
            withTiming(1, { duration: PULSE_MS, easing: Easing.linear }), -1, false,
          );
        },
      );
    },
  );

  // ── AND THE ENTRANCE IS PACKED AWAY WHEN IT IS OVER ────────────────────────
  //
  // Forty-two animated wrappers each re-acquiring backing store every frame to
  // animate nothing was measured on an S24 costing the scroll. Once the bloom is
  // spent the grid is re-rendered without them; both draw the identical thing.
  const [settled, setSettled] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setSettled(false);
      bloom.value = 0;
      bloom.value = withTiming(1, { duration: BLOOM_MS, easing: Easing.linear });
      pulse.value = 0;
      pulse.value = withRepeat(
        withTiming(1, { duration: PULSE_MS, easing: Easing.linear }), -1, false,
      );
      const t = setTimeout(() => setSettled(true), BLOOM_MS + 60);
      return () => {
        clearTimeout(t);
        cancelAnimation(bloom);
        cancelAnimation(pulse);
      };
    }, [bloom, pulse]),
  );

  return (
    <View>
      <View style={styles.head}>
        {/* The set has `back` and no forward twin, so forward is `back` turned
            around, on the same raised chip. */}
        <Pressable onPress={() => setOffset((o) => o - 1)} hitSlop={10} style={styles.arrow}>
          <SketchIcon name="back" size={16} color={INK} />
        </Pressable>
        <Text style={styles.month}>{month.label}</Text>
        <Pressable
          onPress={() => canForward && setOffset((o) => o + 1)}
          hitSlop={10}
          style={[styles.arrow, !canForward && styles.arrowOff]}
          disabled={!canForward}
        >
          <View style={styles.flip}>
            <SketchIcon name="back" size={16} color={canForward ? INK : FAINT} />
          </View>
        </Pressable>
      </View>

      {/* THE MONTH'S SHAPE, as one bar: how much of it is studied and how much is
          still open, which a number cannot say. */}
      <View style={styles.tallyRow}>
        <Meter
          pct={month.doneThisMonth / Math.max(1, month.elapsedThisMonth)}
          color={STREAK_EMBER}
          height={12}
          track={FLAT_EDGE}
          style={styles.meter}
        />
        <Text style={styles.tally}>
          <Text style={styles.tallyBig}>{month.doneThisMonth}</Text>
          <Text style={styles.tallyOf}>{` / ${month.elapsedThisMonth}`}</Text>
        </Text>
      </View>

      <View style={styles.labels}>
        {WEEKDAY_LABELS.map((l, i) => (
          <Text key={i} style={[styles.label, pitch > 0 ? { width: pitch } : { flex: 1 }]}>{l}</Text>
        ))}
      </View>

      {/* SIX EXPLICIT ROWS OF SEVEN, not one wrapping container: with a fixed cell
          width `flexWrap` lets the container decide how many cells fit, and a
          week has seven days whatever the phone. */}
      <View onLayout={onGrid}>
        {[0, 1, 2, 3, 4, 5].map((r) => {
          const row = month.cells.slice(r * 7, r * 7 + 7);
          const prevRowEnd = r > 0 ? month.cells[r * 7 - 1] : undefined;
          const nextRowStart = r < 5 ? month.cells[r * 7 + 7] : undefined;
          return (
            <View key={r} style={[styles.row, { height: rowH }]}>
              {/* THE BAND, one element per run per row, behind the numbers. */}
              {pitch > 0 ? spansIn(row).map(([a, b, now], k) => {
                // A run that reaches a row edge and carries on runs OFF the edge.
                const openL = a === 0 && lit(prevRowEnd) && !!prevRowEnd?.inRun === now;
                const openR = b === 6 && lit(nextRowStart) && !!nextRowStart?.inRun === now;
                const left = openL ? -2 : (a + 0.5) * pitch - size / 2;
                const right = openR ? gridW + 2 : (b + 0.5) * pitch + size / 2;
                const r0 = size / 2;
                return (
                  <View
                    key={k}
                    testID="streak-band"
                    pointerEvents="none"
                    style={[
                      styles.band,
                      now ? styles.bandNow : styles.bandPast,
                      {
                        left,
                        width: Math.max(0, right - left),
                        height: size + (now ? 4 : 0),
                        top: (rowH - size) / 2 - (now ? 1 : 0),
                        borderTopLeftRadius: openL ? 0 : r0,
                        borderBottomLeftRadius: openL ? 0 : r0,
                        borderTopRightRadius: openR ? 0 : r0,
                        borderBottomRightRadius: openR ? 0 : r0,
                        borderLeftWidth: openL ? 0 : now ? LINE : 1.6,
                        borderRightWidth: openR ? 0 : now ? LINE : 1.6,
                      },
                    ]}
                  />
                );
              }) : null}

              {row.map((c, i) => (
                <View
                  key={i}
                  style={[styles.slot, pitch > 0 ? { width: pitch } : { flex: 1 }]}
                >
                  {c.key === null ? null : settled ? (
                    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
                      <CellFace cell={cell(c)} size={size} milestone={milestone.has(c.key)} isToday={c.key === today} pulse={pulse} />
                    </View>
                  ) : (
                    <Cell
                      cell={c}
                      size={size}
                      index={r * 7 + i}
                      milestone={milestone.has(c.key)}
                      isToday={c.key === today}
                      bloom={bloom}
                      pulse={pulse}
                    />
                  )}
                </View>
              ))}
            </View>
          );
        })}
      </View>

      {/* THE KEY. The rest day is the mark nobody guesses — it says the streak
          survived a day you did not study, which is why rest days exist. */}
      <View style={styles.key}>
        <View style={styles.keyItem}>
          <View style={[styles.keyPill, styles.bandNow]} />
          <Text style={styles.keyLabel}>STREAK</Text>
        </View>
        <View style={styles.keyItem}>
          <View style={[styles.keyPill, styles.bandPast, { borderWidth: 1.4 }]} />
          <Text style={styles.keyLabel}>EARLIER</Text>
        </View>
        <View style={styles.keyItem}>
          <View style={styles.keyRest} />
          <Text style={styles.keyLabel}>REST DAY</Text>
        </View>
      </View>
    </View>
  );
}

/** Identity, named so the settled branch reads the same as the animated one. */
const cell = (c: CalendarDay) => c;

/**
 * TODAY, UNFED, BREATHES — and it is its own component so one ring costs one
 * mapper. A style driven by an animation that never ends belongs in the
 * component that renders it unconditionally; declared a level up and rendered
 * behind a `?`, it runs in all forty-two cells.
 */
function TodayRing({ size, pulse }: { size: number; pulse: SharedValue<number> }) {
  const ringStyle = useAnimatedStyle(() => ({
    opacity: 0.55 * (1 - pulse.value),
    transform: [{ scale: 1 + 0.3 * pulse.value }],
  }));
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        { position: 'absolute', width: size, height: size, borderRadius: size / 2, borderWidth: 3, borderColor: STREAK_EMBER },
        ringStyle,
      ]}
    />
  );
}

function Cell({
  cell: c, size, index, milestone, isToday, bloom, pulse,
}: {
  cell: CalendarDay; size: number; index: number; milestone: boolean; isToday: boolean;
  bloom: SharedValue<number>; pulse: SharedValue<number>;
}) {
  // HOOKS ABOVE THE EARLY RETURN (§17 rule 1).
  const start = Math.min(index * BLOOM_STEP, BLOOM_HOLD) / BLOOM_MS;
  const span = BLOOM_CELL / BLOOM_MS;
  const inStyle = useAnimatedStyle(() => {
    const raw = (bloom.value - start) / span;
    const u = raw < 0 ? 0 : raw > 1 ? 1 : raw;
    const k = 1 - u;
    const e = 1 - k * k * k;
    return { opacity: e, transform: [{ scale: 0.8 + 0.2 * e }] };
  });
  if (c.key === null) return null;
  return (
    <Animated.View
      style={[{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }, inStyle]}
    >
      <CellFace cell={c} size={size} milestone={milestone} isToday={isToday} pulse={pulse} />
    </Animated.View>
  );
}

/**
 * WHAT A DAY LOOKS LIKE, on top of its band. No hooks, on purpose: it is drawn
 * by `Cell` during the entrance and on its own afterwards, and a hook here would
 * make the swap a change of hook count.
 */
function CellFace({ cell: c, size, milestone, isToday, pulse }: {
  cell: CalendarDay; size: number; milestone: boolean; isToday: boolean; pulse: SharedValue<number>;
}) {
  const done = c.state === 'done';
  const rested = c.state === 'rest';
  const unfed = c.state === 'today';
  const fs = Math.round(size * 0.4);

  return (
    <>
      {unfed ? <TodayRing size={size} pulse={pulse} /> : null}
      {unfed ? <View style={[styles.todayDisc, { width: size, height: size, borderRadius: size / 2 }]} /> : null}
      {rested ? (
        <View style={[styles.restDisc, { width: size - 10, height: size - 10, borderRadius: (size - 10) / 2 }]} />
      ) : null}

      <Text
        style={[
          styles.num,
          { fontSize: fs },
          done && (c.inRun ? styles.numNow : styles.numPast),
          rested && styles.numRest,
          unfed && styles.numToday,
          c.state === 'missed' && styles.numMissed,
          c.state === 'future' && styles.numFuture,
        ]}
      >
        {c.day}
      </Text>

      {/* Today, studied: a small paper tick under the number on the band. */}
      {isToday && done ? <View style={styles.todayMark} /> : null}

      {/* THE DAY A SOCIETY ADMITTED THEM: a small sand seal on the corner. */}
      {milestone && (done || rested) ? (
        <View pointerEvents="none" style={[styles.seal, { left: size - 10, top: -5 }]} />
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  arrow: {
    width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center',
    backgroundColor: PAPER_LIT, borderWidth: 2, borderColor: C.edge,
    boxShadow: `0px 2px 0px ${C.edge}`,
  },
  flip: { transform: [{ scaleX: -1 }] },
  arrowOff: { opacity: 0.45 },
  month: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 19, color: INK },

  tallyRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 14 },
  meter: { flex: 1 },
  tally: { includeFontPadding: false },
  tallyBig: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 18, color: STREAK_EMBER },
  tallyOf: { fontFamily: 'Inter_500Medium', fontSize: 12, color: INK_SOFT },

  labels: { flexDirection: 'row', marginTop: 16, marginBottom: 4 },
  label: {
    fontFamily: 'Inter_700Bold', fontSize: 10, color: SLATE, textAlign: 'center', letterSpacing: 1.2,
  },

  row: { flexDirection: 'row', alignItems: 'center' },
  slot: { alignItems: 'center', justifyContent: 'center' },

  // ONE element per run, measured across the row — never a per-cell stub.
  band: { position: 'absolute', borderTopWidth: LINE, borderColor: INK },
  bandNow: {
    backgroundColor: STREAK_EMBER, borderColor: INK, borderTopWidth: LINE,
    borderBottomWidth: 5, borderBottomColor: STREAK_DEEP,
  },
  bandPast: {
    backgroundColor: RAIL, borderColor: RAIL_EDGE, borderTopWidth: 1.6, borderBottomWidth: 1.6,
  },

  todayDisc: { position: 'absolute', backgroundColor: PAPER_LIT, borderWidth: LINE, borderColor: INK },
  restDisc: { position: 'absolute', backgroundColor: PAPER_LIT, borderWidth: 1.6, borderColor: STREAK_DEEP },

  num: { fontFamily: 'Inter_500Medium', color: INK_SOFT, includeFontPadding: false },
  // Paper on the ember band reads 4.85:1; ink on an earlier run's tint far more.
  numNow: { color: PAPER_LIT, fontFamily: 'Inter_700Bold' },
  numPast: { color: INK, fontFamily: 'Inter_700Bold' },
  numRest: { color: STREAK_EMBER, fontFamily: 'Inter_700Bold' },
  numToday: { color: INK, fontFamily: 'Inter_700Bold' },
  numMissed: { color: INK_SOFT },
  numFuture: { color: FAINT },
  todayMark: {
    position: 'absolute', bottom: 3, width: 10, height: 3, borderRadius: 2, backgroundColor: PAPER_LIT,
  },
  seal: {
    position: 'absolute', width: 13, height: 13, borderRadius: 7,
    backgroundColor: SAND, borderWidth: 1.6, borderColor: INK,
  },

  key: { flexDirection: 'row', justifyContent: 'center', gap: 18, marginTop: 14 },
  keyItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  keyPill: { width: 22, height: 12, borderRadius: 6, borderWidth: 1.6, borderBottomWidth: 3 },
  keyRest: { width: 12, height: 12, borderRadius: 6, backgroundColor: PAPER_LIT, borderWidth: 1.6, borderColor: STREAK_DEEP },
  keyLabel: { fontFamily: 'Inter_700Bold', fontSize: 9, color: SLATE, letterSpacing: 1.1 },
});
