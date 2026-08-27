import { useEffect, useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet, type LayoutChangeEvent } from 'react-native';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import SketchIcon from '@/components/shared/SketchIcon';
import { PATINA, PATINA_DEEP, PATINA_SOFT, SLATE, STREAK_MILESTONES } from '@/constants/streak';
import { ramp, rampFace, mix, PAPER_LIT, PAPER_SHADE } from '@/components/shared/tone';
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
// ── WHAT WAS WRONG WITH THE ONE BEFORE THIS ─────────────────────────────────
//
// A reader: *"you can see where it connects where the user has a streak, but
// that doesn't really look good at premium. It looks like a half hard design."*
// Three things, and the first is what made it read as unfinished:
//
//   THE RAIL WAS DRAWN PER CELL. Each day painted its own stub of band, inset a
//   quarter of a cell and pulled 6pt past its own edge to meet its neighbour's
//   stub. Where two lit days sat side by side that worked; everywhere else it
//   left a pale tab poking out of a disc into empty paper, which reads as a
//   rendering fault rather than as a chain. It is ONE element per RUN now,
//   measured across the row.
//
//   IT COULD NOT WRAP. `joinLeft`/`joinRight` were disabled at the row edges —
//   correct, given per-cell stubs, and it meant a run crossing a Sunday simply
//   stopped and started again with nothing said. A run is one thing; the week
//   boundary is an accident of how weeks are printed. The rail runs off the edge
//   of the row now and picks up at the start of the next.
//
//   EVERY DAY WAS THE SAME FLAT CIRCLE. The rank pins, the badges, the
//   certificates and the quote plates are all STRUCK — a lit corner, a shaded
//   one, a rim, one light from the top left (tone.ts). The calendar was the last
//   surface still drawing flat fills, in the one place a reader looks to feel
//   good about what they have done. Every lit day is struck now, off the same
//   `ramp()` every other object here uses.
//
// ── AND TWO THINGS IT DID NOT SAY AT ALL ────────────────────────────────────
//
// MILESTONES. `STREAK_MILESTONES` — 7, 30, 100, 365 — existed and the grid was
// blind to them, so the day a reader's run hit a week looked exactly like the
// day before it. The day a milestone LANDS wears a collar: a ring struck outside
// the token, deliberately the same gesture a capstone rank pin and a tier-V
// badge already carry (§7). A ring around a struck thing means "this one is the
// far end of something".
//
// TODAY, UNFED. It was a hollow ink ring — quieter than a lit day, in a grid
// where it is the only cell the reader can still do anything about. It breathes
// now, one slow ring, the single moving thing on the screen.
//
// ── WHY MISSED DAYS ARE STILL QUIET ─────────────────────────────────────────
//
// A missed day is a hollow ring in faint ink, not a red X and not a hole. The
// grid is a place a reader comes to feel good about coming back; a wall of
// accusations is what makes people delete an app rather than open it. The rail
// breaking is already the whole story — it does not need underlining.
//
// Days before the reader joined are BLANK, not missed, for the same reason
// (lib/utils/streakCalendar.ts, `since`).
//
// ── THE GRID MEASURES ITSELF, AND THAT IS LOAD-BEARING ──────────────────────
//
// A rail spans from the centre of one cell to the centre of another, and a
// centre is not knowable inside a `space-between` row — which is exactly why the
// old one could only ever draw stubs anchored to a cell's own box. One
// `onLayout` on the grid gives every cell an exact pitch, and every rail, cap
// and collar below is arithmetic from it. The state lives HERE rather than on
// the screen, which is §19's rule from the Profile work: a measurement a child
// needs belongs to the child.
// ─────────────────────────────────────────────────────────────────────────────

/** The struck material every lit day is cut from. One light, top-left, always. */
const METAL = ramp(PATINA);
const FACE = rampFace(METAL);
/**
 * THE RAIL, AND WHY IT IS NOT `PATINA_SOFT`.
 *
 * The obvious tone for a band behind the tokens is the material's own wash, and
 * the first build used it: `PATINA_SOFT` measures 1.24:1 on paper, which is the
 * FLOOR for a faint fill (design.ts records `HUE_SOFT` failing at 1.04 and the
 * six mastery bars having no visible remainder at all). Rendered, the rail was
 * technically present and could not be seen — the run measured correctly across
 * every row and read as nothing.
 *
 * That is the wrong floor for this object. A progress track may be faint because
 * it is the part that has NOT happened; this rail is the streak itself, the one
 * thing in the grid the reader is here to look at. 1.69:1 is a band on paper.
 *
 * The groove still runs the face BACKWARDS (StruckNiche's rule: a groove is
 * bright where a dome is dark), and it stops at a lit tint of its own rather
 * than at PAPER_LIT — running a three-stop gradient out to white put half the
 * rail's length at 1.0:1 and was most of why it disappeared.
 */
const RAIL = mix(PATINA, PAPER, 0.62);        // 1.69:1 on paper
const GROOVE: [string, string, string] = [
  mix(RAIL, INK, 0.16), RAIL, mix(RAIL, PAPER_LIT, 0.5),
];

/** The one light, as LinearGradient endpoints. Matches tone.LIGHT everywhere. */
const LIGHT_START = { x: 0.15, y: 0 } as const;
const LIGHT_END = { x: 0.85, y: 1 } as const;

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

const DAY_MS = 86400000;
const keyOf = (t: number) => new Date(t).toISOString().slice(0, 10);

/**
 * How long the run was, as of each day in the month.
 *
 * Walked backwards through active-or-rested days from each date, which is the
 * same rule `inRun` uses — so a milestone lands on the day the counter would
 * have said it. Bounded by the longest milestone plus one, because nothing past
 * that changes an answer this grid needs.
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

/** Contiguous spans of `inRun` within one row, as [firstCol, lastCol]. */
function spansIn(row: readonly CalendarDay[]): [number, number][] {
  const out: [number, number][] = [];
  let start = -1;
  for (let i = 0; i <= row.length; i++) {
    const on = i < row.length && !!row[i]?.inRun;
    if (on && start < 0) start = i;
    if (!on && start >= 0) { out.push([start, i - 1]); start = -1; }
  }
  return out;
}

export default function StreakCalendar({ activeDays, restDays, today, since, size = 34, onMonth }: Props) {
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

  // Reported in an effect, not during render: calling a parent's setState while
  // this component is rendering is the classic cross-component update warning, and
  // on the first paint it would fire before the parent had finished mounting.
  useEffect(() => { onMonth?.(at.year, at.month); }, [at.year, at.month, onMonth]);

  // Never page forward past the month the reader is in — there is nothing there,
  // and an empty grid of futures reads as a bug.
  const canForward = offset < 0;

  const onGrid = (e: LayoutChangeEvent) => {
    const w = Math.round(e.nativeEvent.layout.width);
    if (w !== gridW) setGridW(w);
  };
  const pitch = gridW > 0 ? gridW / 7 : 0;
  const railH = Math.round(size * 0.3);

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

      {/* THE MONTH'S SHAPE, as one struck bar rather than a sentence.
          It replaces "18 of 27 days so far", which was the THIRD printing of the
          same figure on this screen — the card above already says "18 days
          practised" beside "1 rest days used". A bar says the same thing and
          also the part a number cannot: how much of the month is still open. */}
      <View style={styles.tallyRow}>
        <View style={styles.track}>
          <LinearGradient
            colors={[METAL.lit, METAL.base, METAL.shade]}
            start={LIGHT_START}
            end={LIGHT_END}
            style={[
              styles.fill,
              { width: `${Math.round((month.doneThisMonth / Math.max(1, month.elapsedThisMonth)) * 100)}%` },
            ]}
          />
        </View>
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
      <View style={styles.labelRule} />

      {/* SIX EXPLICIT ROWS OF SEVEN, not one wrapping container.
          `flexWrap` with a fixed cell width lets the CONTAINER decide how many
          cells fit — at 34dp in a 298dp column that is eight, and the calendar
          renders a week with eight days in it. It looked fine on the phone this
          was written against and would have been wrong on a wider one. A week
          has seven days; the layout should not be able to disagree. */}
      <View onLayout={onGrid}>
        {[0, 1, 2, 3, 4, 5].map((r) => {
          const row = month.cells.slice(r * 7, r * 7 + 7);
          const prevRowEnd = r > 0 ? month.cells[r * 7 - 1] : undefined;
          const nextRowStart = r < 5 ? month.cells[r * 7 + 7] : undefined;
          return (
            <View key={r} style={[styles.row, { height: size + 10 }]}>
              {/* THE RAIL, one element per run, behind everything. */}
              {pitch > 0 ? spansIn(row).map(([a, b], k) => {
                // A run that reaches a row edge and continues on the next row
                // runs OFF that edge rather than stopping short of it. That is
                // the whole of "it wraps": the eye carries the line round.
                const openL = a === 0 && !!prevRowEnd?.inRun;
                const openR = b === 6 && !!nextRowStart?.inRun;
                const left = openL ? 0 : (a + 0.5) * pitch;
                const right = openR ? gridW : (b + 0.5) * pitch;
                return (
                  <LinearGradient
                    key={k}
                    colors={GROOVE}
                    locations={[0, 0.45, 1]}
                    start={LIGHT_START}
                    end={LIGHT_END}
                    style={[
                      styles.rail,
                      {
                        left,
                        width: Math.max(0, right - left),
                        height: railH,
                        top: (size + 10 - railH) / 2,
                        borderTopLeftRadius: openL ? 0 : railH / 2,
                        borderBottomLeftRadius: openL ? 0 : railH / 2,
                        borderTopRightRadius: openR ? 0 : railH / 2,
                        borderBottomRightRadius: openR ? 0 : railH / 2,
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
                  <Cell
                    cell={c}
                    size={size}
                    index={r * 7 + i}
                    milestone={!!c.key && milestone.has(c.key)}
                  />
                </View>
              ))}
            </View>
          );
        })}
      </View>

      {/* THE KEY. Three marks is one more than a reader will infer, and the rest
          day is the one nobody guesses — it is the mark that says the streak
          survived a day you did not study, which is the whole reason the app has
          rest days at all. */}
      <View style={styles.key}>
        <Legend fill={METAL.base} label="STUDIED" />
        <Legend fill={PATINA_SOFT} rim={PATINA} label="RESTED" />
        <Legend fill={PAPER} rim={FAINT} label="MISSED" />
      </View>
    </View>
  );
}

function Legend({ fill, rim, label }: { fill: string; rim?: string; label: string }) {
  return (
    <View style={styles.keyItem}>
      <View
        style={[
          styles.keyDot,
          { backgroundColor: fill },
          rim ? { borderWidth: 1, borderColor: rim } : null,
        ]}
      />
      <Text style={styles.keyLabel}>{label}</Text>
    </View>
  );
}

function Cell({
  cell, size, index, milestone,
}: {
  cell: CalendarDay; size: number; index: number; milestone: boolean;
}) {
  if (cell.key === null) return null;

  const lit = cell.state === 'done';
  const rested = cell.state === 'rest';
  const isToday = cell.state === 'today';
  // A DAY YOU STUDIED IN JUNE IS NOT THE RUN YOU ARE KEEPING NOW, and the rail
  // alone was carrying that distinction — which means it was invisible for any
  // day whose neighbours happen not to be lit. The current run's tokens are SET:
  // they wear the metal's own rim. A past day is struck from the same material
  // and simply not mounted. It is a real difference at a glance and it takes
  // nothing away from the day — which matters, because the grid is the place a
  // reader comes to feel good about days they already did.

  return (
    <MotiView
      from={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'timing', duration: 200, delay: Math.min(index * 8, 240) }}
      style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}
    >
      {/* THE COLLAR — a milestone landed on this day. Struck OUTSIDE the token,
          for the reason §7 gives about the rank pin's own collar: the part of a
          flourish that sits behind the thing it decorates is not subtle, it is
          absent. */}
      {milestone && (lit || rested) ? (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            width: size + 7,
            height: size + 7,
            borderRadius: (size + 7) / 2,
            borderWidth: 1.5,
            borderColor: PATINA_DEEP,
          }}
        />
      ) : null}

      {/* TODAY, UNFED, BREATHES. The only cell the reader can still change, and
          the only moving thing on the screen — which is what makes it read as an
          invitation rather than as one more empty ring. */}
      {isToday ? (
        <MotiView
          from={{ scale: 1, opacity: 0.5 }}
          animate={{ scale: 1.26, opacity: 0 }}
          transition={{ type: 'timing', duration: 1800, loop: true, repeatReverse: false }}
          style={{
            position: 'absolute',
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: 2,
            borderColor: PATINA,
          }}
        />
      ) : null}

      {lit ? (
        <LinearGradient
          colors={[FACE[0][1], FACE[1][1], FACE[2][1]]}
          locations={[0, 0.52, 1]}
          start={LIGHT_START}
          end={LIGHT_END}
          style={[
            styles.disc,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderColor: cell.inRun ? METAL.rim : 'transparent',
            },
          ]}
        >
          <Text style={[styles.num, styles.numLit, { fontSize: size * 0.4 }]}>{cell.day}</Text>
        </LinearGradient>
      ) : (
        <View
          style={[
            styles.disc,
            { width: size, height: size, borderRadius: size / 2 },
            rested && styles.rest,
            cell.state === 'missed' && styles.missed,
            isToday && styles.today,
          ]}
        >
          {/* A RESTED DAY IS A BRIDGE, NOT A HALF-LIT DAY. The rail runs straight
              through it and the token is the material's own wash inside the
              metal's rim — so it reads as a link in the chain that happens to be
              hollow, which is exactly what a rest day is. */}
          <Text
            style={[
              styles.num,
              { fontSize: size * 0.4 },
              rested && styles.numRest,
              cell.state === 'future' && styles.numFuture,
              isToday && styles.numToday,
            ]}
          >
            {cell.day}
          </Text>
        </View>
      )}
    </MotiView>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  arrow: { padding: 4 },
  flip: { transform: [{ scaleX: -1 }] },
  arrowOff: { opacity: 0.45 },
  month: { fontFamily: 'Inter_700Bold', fontSize: 12, color: INK, letterSpacing: 2 },

  tallyRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12 },
  track: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    backgroundColor: mix(PAPER_SHADE, PAPER, 0.45),
  },
  fill: { height: 6, borderRadius: 3 },
  tally: { includeFontPadding: false },
  tallyBig: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 17, color: PATINA },
  tallyOf: { fontFamily: 'Inter_500Medium', fontSize: 12, color: INK_SOFT },

  labels: { flexDirection: 'row', marginTop: 16, marginBottom: 5 },
  label: {
    fontFamily: 'Inter_700Bold',
    fontSize: 9.5,
    color: SLATE,
    textAlign: 'center',
    letterSpacing: 1.2,
  },
  // A ruled line under the weekday heads, so the grid reads as a printed table
  // rather than as loose type above loose circles.
  labelRule: { height: 1, backgroundColor: FAINT, marginBottom: 8 },

  row: { flexDirection: 'row', alignItems: 'center' },
  slot: { alignItems: 'center', justifyContent: 'center' },

  // ONE element per run, measured across the row — never a per-cell stub.
  rail: { position: 'absolute' },

  disc: {
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'transparent',
  },
  rest: { backgroundColor: PATINA_SOFT, borderColor: PATINA },
  // Quiet on purpose: a hollow ring, not an accusation.
  missed: { borderColor: FAINT },
  today: { borderWidth: 2, borderColor: INK, backgroundColor: PAPER },

  num: { fontFamily: 'Inter_500Medium', color: INK_SOFT },
  // Paper on PATINA measures 4.55:1, and the number sits on the face's MIDDLE
  // stop rather than on its lit corner — which is the trap §19 records for the
  // quote plate's byline, and check:streak measures it rather than assuming.
  numLit: { color: PAPER, fontFamily: 'Inter_700Bold' },
  numRest: { color: INK, fontFamily: 'Inter_500Medium' },
  numFuture: { color: FAINT },
  numToday: { color: INK, fontFamily: 'Inter_700Bold' },

  key: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 14 },
  keyItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  keyDot: { width: 9, height: 9, borderRadius: 5 },
  keyLabel: { fontFamily: 'Inter_700Bold', fontSize: 8.5, color: SLATE, letterSpacing: 1.1 },
});
