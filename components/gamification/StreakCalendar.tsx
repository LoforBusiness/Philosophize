import { useEffect, useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import SketchIcon from '@/components/shared/SketchIcon';
import { EMBER, EMBER_SOFT, ASH } from '@/constants/streak';
import {
  buildMonth,
  shiftMonth,
  WEEKDAY_LABELS,
  type CalendarDay,
} from '@/lib/utils/streakCalendar';

const INK = '#1A1A1A';
const INK_SOFT = '#6B6B6B';
const PAPER = '#FAFAF7';
const FAINT = '#E4E1D8';

// ─────────────────────────────────────────────────────────────────────────────
// THE STREAK MONTH.
//
// A grid of the month the reader is in: which days they studied, which they
// missed, which a rest day covered, and where they are now.
//
// ── THE PART THAT MAKES IT FEEL LIKE A STREAK AND NOT A SPREADSHEET ─────────
//
// The connecting BAR. A run of lit days is drawn as one continuous ember band
// with the discs sitting on it, rather than as seven separate dots — because a
// streak is a single unbroken thing and the picture should say so. `inRun` on
// each cell is what the bar is drawn from, and it is computed by walking
// backwards from today through active-or-rested days, so it crosses a month
// boundary correctly: the 1st of the month joins to the 31st behind it.
//
// A day that is merely 'done' but NOT in the current run gets a disc and no bar.
// That is the difference between "you studied then" and "this is the thing you
// are currently keeping alive", and it is most of the emotional weight.
//
// ── WHY MISSED DAYS ARE QUIET ───────────────────────────────────────────────
//
// A missed day is a hollow ring in faint ink, not a red X and not a hole. The
// grid is a place a reader comes to feel good about coming back; a wall of
// accusations is what makes people delete an app rather than open it. The bar
// breaking is already the whole story — it does not need underlining.
//
// Days before the reader joined are BLANK, not missed, for the same reason
// (lib/utils/streakCalendar.ts, `since`).
// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  activeDays: readonly string[];
  restDays: readonly string[];
  /** YYYY-MM-DD. Passed in so the grid is testable and never reads the clock. */
  today: string;
  /** The reader's first day, so pre-history draws blank rather than failed. */
  since: string | null;
  /** Cell diameter. The sheet uses the default; the reward screen goes smaller. */
  size?: number;
  /**
   * Fired with the month now on screen, so a caller can show ITS figures rather
   * than always this month's.
   *
   * The grid owns the paging (it is the thing with the arrows) and lifting that
   * state out would make every caller carry it, so the month is reported instead
   * of controlled. A caller that does not care simply omits this.
   */
  onMonth?: (year: number, month: number) => void;
}

export default function StreakCalendar({ activeDays, restDays, today, since, size = 34, onMonth }: Props) {
  const [offset, setOffset] = useState(0);

  const active = useMemo(() => new Set(activeDays), [activeDays]);
  const rest = useMemo(() => new Set(restDays), [restDays]);

  const [ty, tm] = today.split('-').map(Number);
  const at = shiftMonth(ty, tm - 1, offset);
  const month = useMemo(
    () => buildMonth({ year: at.year, month: at.month, active, rest, today, since }),
    [at.year, at.month, active, rest, today, since],
  );

  // Reported in an effect, not during render: calling a parent's setState while
  // this component is rendering is the classic cross-component update warning, and
  // on the first paint it would fire before the parent had finished mounting.
  useEffect(() => { onMonth?.(at.year, at.month); }, [at.year, at.month, onMonth]);

  // Never page forward past the month the reader is in — there is nothing there,
  // and an empty grid of futures reads as a bug.
  const canForward = offset < 0;

  return (
    <View>
      <View style={styles.head}>
        {/* The set has `back` and no forward twin, so forward is `back` turned
            around. Cheaper and more consistent than drawing a second glyph that
            would have to match its weight by eye. */}
        <Pressable onPress={() => setOffset((o) => o - 1)} hitSlop={12} style={styles.arrow}>
          <SketchIcon name="back" size={18} color={INK_SOFT} />
        </Pressable>
        <Text style={styles.month}>{month.label.toUpperCase()}</Text>
        <Pressable
          onPress={() => canForward && setOffset((o) => o + 1)}
          hitSlop={12}
          style={[styles.arrow, styles.flip, !canForward && styles.arrowOff]}
          disabled={!canForward}
        >
          <SketchIcon name="back" size={18} color={canForward ? INK_SOFT : FAINT} />
        </Pressable>
      </View>

      {/* "18 of 31 days" — the count the reader actually wants, and the reason
          the month header is not just decoration. */}
      <Text style={styles.tally}>
        <Text style={styles.tallyBig}>{month.doneThisMonth}</Text>
        {`  of ${month.elapsedThisMonth} days so far`}
      </Text>

      <View style={styles.labels}>
        {WEEKDAY_LABELS.map((l, i) => (
          <Text key={i} style={[styles.label, { width: size }]}>{l}</Text>
        ))}
      </View>

      {/* SIX EXPLICIT ROWS OF SEVEN, not one wrapping container.
          `flexWrap` with a fixed cell width lets the CONTAINER decide how many
          cells fit — at 34dp in a 298dp column that is eight, and the calendar
          renders a week with eight days in it. It looked fine on the phone this
          was written against and would have been wrong on a wider one. A week
          has seven days; the layout should not be able to disagree. */}
      {[0, 1, 2, 3, 4, 5].map((r) => (
        <View key={r} style={styles.row}>
          {month.cells.slice(r * 7, r * 7 + 7).map((c, i) => (
            <Cell
              key={i}
              cell={c}
              size={size}
              prev={i > 0 ? month.cells[r * 7 + i - 1] : undefined}
              next={i < 6 ? month.cells[r * 7 + i + 1] : undefined}
              index={r * 7 + i}
              col={i}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

function Cell({
  cell, size, prev, next, index, col,
}: {
  cell: CalendarDay; size: number; prev?: CalendarDay; next?: CalendarDay; index: number; col: number;
}) {
  // The bar only joins cells on the SAME ROW. Joining across a row break would
  // draw a band through the empty gutter at the edge of the grid.
  const joinLeft = cell.inRun && col > 0 && !!prev?.inRun;
  const joinRight = cell.inRun && col < 6 && !!next?.inRun;

  return (
    <View style={[styles.cellWrap, { width: size, height: size + 6 }]}>
      {cell.key === null ? null : (
        <>
          {/* the connecting band, behind the disc */}
          {cell.inRun ? (
            <View
              style={[
                styles.bar,
                {
                  height: size * 0.5,
                  top: (size - size * 0.5) / 2,
                  left: joinLeft ? -6 : size * 0.25,
                  right: joinRight ? -6 : size * 0.25,
                },
              ]}
            />
          ) : null}

          <MotiView
            from={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'timing', duration: 200, delay: Math.min(index * 8, 240) }}
            style={[
              styles.disc,
              { width: size, height: size, borderRadius: size / 2 },
              cell.state === 'done' && styles.done,
              cell.state === 'rest' && styles.rest,
              cell.state === 'missed' && styles.missed,
              cell.state === 'today' && styles.today,
            ]}
          >
            {/* A rested day is the number in ink on the pale ember wash — three
                plainly different fills for three plainly different things:
                solid ember studied, pale ember rested, hollow ring missed. No
                icon, because there isn't a moon in the set and inventing one to
                mean "rest" would need explaining anyway. */}
            <Text
              style={[
                styles.num,
                { fontSize: size * 0.4 },
                cell.state === 'done' && styles.numLit,
                cell.state === 'rest' && styles.numRest,
                cell.state === 'future' && styles.numFuture,
                cell.state === 'today' && styles.numToday,
              ]}
            >
              {cell.day}
            </Text>
          </MotiView>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  arrow: { padding: 4 },
  flip: { transform: [{ scaleX: -1 }] },
  arrowOff: { opacity: 0.45 },
  month: { fontFamily: 'Inter_700Bold', fontSize: 12, color: INK, letterSpacing: 2 },

  tally: { fontFamily: 'Inter_500Medium', fontSize: 12, color: INK_SOFT, marginTop: 10, textAlign: 'center' },
  tallyBig: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 19, color: EMBER },

  labels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 14, marginBottom: 4 },
  label: { fontFamily: 'Inter_500Medium', fontSize: 10, color: INK_SOFT, textAlign: 'center', letterSpacing: 0.5 },

  row: { flexDirection: 'row', justifyContent: 'space-between' },
  cellWrap: { alignItems: 'center', justifyContent: 'center', marginBottom: 4 },

  // The band that turns a row of dots into one unbroken run.
  bar: { position: 'absolute', backgroundColor: EMBER_SOFT },

  disc: { alignItems: 'center', justifyContent: 'center' },
  done: { backgroundColor: EMBER },
  rest: { backgroundColor: EMBER_SOFT, borderWidth: 1, borderColor: EMBER_SOFT },
  // Quiet on purpose: a hollow ring, not an accusation.
  missed: { borderWidth: 1, borderColor: FAINT },
  today: { borderWidth: 2, borderColor: INK, backgroundColor: PAPER },

  num: { fontFamily: 'Inter_500Medium', color: INK_SOFT },
  // Paper on EMBER measures 4.75:1 — the same figure as EMBER on paper, and the
  // reason the number stays legible inside a lit disc.
  numLit: { color: PAPER, fontFamily: 'Inter_700Bold' },
  numRest: { color: INK, fontFamily: 'Inter_500Medium' },
  numFuture: { color: FAINT },
  numToday: { color: INK, fontFamily: 'Inter_700Bold' },
});
