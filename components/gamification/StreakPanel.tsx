import { View, Text, StyleSheet } from 'react-native';
import SketchIcon from '@/components/shared/SketchIcon';
import StreakBook from './StreakBook';
import { weekDays } from '@/lib/utils/week';
import {
  EMBER, EMBER_LIT, ASH, ASH_LIT, nextTier, tierFor,
} from '@/constants/streak';

// ─────────────────────────────────────────────────────────────────────────────
// THE HABIT PANEL — one object, printed two ways up.
//
// A reader, about the streak box on Home: "I like this but it needs to be more
// gamified and better UI for this, it is a little boring. I also want you to do
// the same for the daily streak box in the profile tab."
//
// ── THE APP ALREADY HAD THE GAME. IT WAS JUST NOT ON EITHER SCREEN ──────────
//
// Nothing here is invented. Everything this panel now shows already existed in
// the codebase and had never reached the two screens a reader actually looks at:
//
//   THE EMBER      constants/streak.ts carries a measured orange whose entire
//                  stated job is to say ALIVE or ABOUT TO DIE at a glance — and
//                  Home's panel and Profile's both drew the streak in flat ink.
//                  The one licensed colour in the app existed for this object
//                  and was not on it.
//   THE SOCIETY    STREAK_TIERS — Peripatetic, Stoic, Ascetic, Immovable — with
//                  `nextTier` already written. A reader could only find out
//                  there was something to reach by opening a third screen.
//   THE REST DAYS  a real streak-freeze mechanic with an earn rate and a cap,
//                  and no indication anywhere that the reader held any. The one
//                  fact that answers "what happens if I miss tomorrow" was
//                  invisible at the exact moment it is worth knowing.
//
// So this is not decoration added to a plain box. It is the mechanics the app
// already runs, drawn where the decision is actually made.
//
// ── WHY THE WEEK IS A RAIL AND NOT SEVEN CIRCLES ────────────────────────────
//
// The old row drew each day as an island. A streak is a RUN, and seven separate
// tokens is the one shape that cannot say so — five completed days read as five
// unrelated ticks rather than as a line five long. Consecutive days are joined
// now, and the join is drawn only between two days that are BOTH done: linking
// forward into today-not-yet-done would draw a day the reader has not earned.
//
// ── AND WHY IT INVERTS RATHER THAN BEING WRITTEN TWICE ──────────────────────
//
// Home's panel is ink; Profile's is paper. Two copies of one object is how
// "POLITICS" ends up on one screen and "Political Philosophy" on the other, so
// this takes `onInk` and swaps the six values, exactly as StreakWeek already
// does for `tint`/`ground`. The ember has its OWN pair for the dark ground —
// see EMBER_LIT: a colour measured on paper reads 3.50:1 on ink, under the floor
// for the number it is colouring.
// ─────────────────────────────────────────────────────────────────────────────

const INK = '#1A1A1A';
const CREAM = '#FAFAF7';
const ON_INK_SOFT = '#C4C2BB';   // paperSoft — secondary text on a dark ground
const ON_INK_DIM = '#B3AEA3';    // dim — marks and labels, never body text
const ON_INK_FAINT = '#807D74';  // unearned rings, 4.23:1 on ink
const ON_INK_RULE = '#3A3936';   // felt, not seen — 1.51:1
const PAPER_SOFT = '#686868';    // inkSoft
const PAPER_FAINT = '#CFCDC6';   // unearned RINGS on paper — a mark, not text
const PAPER_RULE = '#E7E3DA';    // hairline

// ── THE WEEKDAY LABELS, WHICH ARE TEXT AND WERE BEING PAINTED AS A RING ─────
//
// HabitCard's own header wrote this defect down and then shipped it: "the paper
// version of this row labels its unearned days at 1.52:1, which is why they
// cannot be read on the profile screen at all." A ring can be #CFCDC6; two
// letters spelling "Th" cannot.
//
// The pair is measured against the RELATIONSHIP the ink side already has rather
// than against an absolute floor, because paper simply has less range to spend:
// ink runs 16.64:1 for an earned label against 4.23:1 for an unearned one, a
// step of about four. Paper's earned label at `inkSoft` is only 5.33:1, so
// matching that step downward lands at 1.3:1 — which is the bug. Both values
// move instead: 7.45:1 and 3.32:1, the same fourfold step, and the quieter of
// the two now clears the 3:1 floor a two-letter label needs.
//
// LABEL_ON / LABEL_OFF are named so `npm run check:streak` can find and re-derive
// them; a contrast written into a comment is a claim, not a check.
const LABEL_ON_PAPER = '#55524B';   // 7.45:1 on paper
const LABEL_OFF_PAPER = '#8E8980';  // 3.32:1 on paper
const LABEL_ON_INK = '#FAFAF7';     // 16.64:1 on ink
const LABEL_OFF_INK = '#807D74';    // 4.23:1 on ink

export interface StreakPanelProps {
  streak: number;
  lastLessonDate: string | null;
  /** Rest days available to spend right now — `restDaysHeld(earned, used)`. */
  restHeld: number;
  /** How many can be held at once — `restCap(isPro)`. */
  restMax: number;
  /** True while a rest day is covering a gap the reader has not spent yet. */
  restBridging: boolean;
  /** Printed on the ink panel (Home) rather than on paper (Profile). */
  onInk?: boolean;
  /** The day circles' diameter. */
  daySize?: number;
}

export default function StreakPanel({
  streak,
  lastLessonDate,
  restHeld,
  restMax,
  restBridging,
  onInk = false,
  daySize = 28,
}: StreakPanelProps) {
  const alive = streak > 0;
  const mark = onInk ? (alive ? EMBER_LIT : ASH_LIT) : alive ? EMBER : ASH;
  const text = onInk ? CREAM : INK;
  const soft = onInk ? ON_INK_SOFT : PAPER_SOFT;
  const dim = onInk ? ON_INK_DIM : PAPER_SOFT;
  const faint = onInk ? ON_INK_FAINT : PAPER_FAINT;
  const rule = onInk ? ON_INK_RULE : PAPER_RULE;
  const ground = onInk ? INK : CREAM;
  const labelOn = onInk ? LABEL_ON_INK : LABEL_ON_PAPER;
  const labelOff = onInk ? LABEL_OFF_INK : LABEL_OFF_PAPER;

  const days = weekDays(streak, lastLessonDate);
  // Monday-first, matching `weekDays`' own labels.
  const todayIdx = (new Date().getDay() + 6) % 7;
  const fedToday = days[todayIdx]?.state === 'done';

  // THE NEXT SOCIETY, and the one below it — the bar runs between two landmarks
  // rather than from zero, so a reader at 26 days sees most of a bar rather than
  // a sliver. Both ends are fixed days: this target can never retreat when new
  // content ships, which is the rule Insights had to learn the hard way.
  const held = tierFor(streak);
  const next = nextTier(streak);
  const from = held?.at ?? 0;
  const span = next ? Math.max(1, next.at - from) : 1;
  const pct = next ? Math.max(0.03, Math.min(1, (streak - from) / span)) : 1;
  const toGo = next ? next.at - streak : 0;

  const caption = !alive
    ? 'One lesson today begins it.'
    : restBridging
      ? 'A day of rest is holding it — finish anything today.'
      : fedToday
        ? 'Today is counted. The run is safe.'
        : 'Today is not counted yet.';

  return (
    <View>
      {/* ── the head: the book, and what state it is in ────────────────────── */}
      <View style={styles.head}>
        {/* The book takes its pair as props precisely so it can be printed either
            way up — and it is ember now rather than ink, which is the whole of
            "alive or about to die at a glance". */}
        <StreakBook value={streak} size={onInk ? 50 : 58} color={mark} paper={ground} />
        <View style={styles.headText}>
          <Text style={[styles.count, { color: mark }]}>
            {alive ? `${streak} DAY${streak === 1 ? '' : 'S'} RUNNING` : 'NO STREAK YET'}
          </Text>
          <Text style={[styles.caption, { color: soft }]} numberOfLines={2}>{caption}</Text>
        </View>
        {/* THE SOCIETY THE READER IS ALREADY IN, worn as a chip. It is the one
            thing on this panel that is a title rather than a number, and a title
            is what a streak is actually for. */}
        {held ? (
          <View style={[styles.chip, { borderColor: mark }]}>
            <Text style={[styles.chipText, { color: mark }]}>{held.name.toUpperCase()}</Text>
          </View>
        ) : null}
      </View>

      {/* ── the week, as a run ─────────────────────────────────────────────── */}
      <View style={styles.week}>
        {days.map((d, i) => {
          const done = d.state === 'done';
          const today = d.state === 'today';
          // Only ever between two days that are BOTH done — a link into a day
          // still to be earned draws credit the reader has not got.
          const linkL = done && days[i - 1]?.state === 'done';
          const linkR = done && days[i + 1]?.state === 'done';
          return (
            <View key={i} style={styles.col}>
              <Text style={[styles.dayLabel, { color: done || today ? labelOn : labelOff }]}>
                {d.label}
              </Text>
              <View style={[styles.dotWrap, { height: daySize }]}>
                {linkL ? (
                  <View style={[styles.link, { left: 0, right: '50%', top: daySize / 2 - 2, backgroundColor: mark }]} />
                ) : null}
                {linkR ? (
                  <View style={[styles.link, { left: '50%', right: 0, top: daySize / 2 - 2, backgroundColor: mark }]} />
                ) : null}
                <View
                  style={[
                    styles.dot,
                    { width: daySize, height: daySize, borderRadius: daySize / 2 },
                    { backgroundColor: ground, borderColor: faint },
                    done && { backgroundColor: mark, borderColor: mark },
                    today && { borderColor: mark, borderWidth: 2.5 },
                  ]}
                >
                  {done ? (
                    <SketchIcon name="check" size={Math.round(daySize * 0.62)} color={ground} />
                  ) : null}
                </View>
              </View>
            </View>
          );
        })}
      </View>

      <View style={[styles.rule, { backgroundColor: rule }]} />

      {/* ── the next society, with both ends of the rung on it ─────────────── */}
      <View style={styles.nextRow}>
        <Text style={[styles.nextLabel, { color: dim }]}>
          {next ? `NEXT · ${next.name.toUpperCase()}` : 'EVERY SOCIETY REACHED'}
        </Text>
        <Text style={[styles.nextDays, { color: text }]}>
          {next ? `${toGo} DAY${toGo === 1 ? '' : 'S'}` : `${streak}`}
        </Text>
      </View>
      {/* The same 10px pill the lesson runner and the welcome questions use, so a
          reader meets one progress bar in this app rather than four. */}
      <View style={[styles.track, { backgroundColor: rule }]}>
        <View style={[styles.fill, { width: `${Math.round(pct * 100)}%`, backgroundColor: mark }]}>
          <View style={styles.gloss} />
        </View>
      </View>

      {/* ── and what is in the bank against a bad day ──────────────────────── */}
      <View style={styles.restRow}>
        <View style={styles.pips}>
          {Array.from({ length: restMax }, (_, i) => (
            <View
              key={i}
              style={[
                styles.pip,
                i < restHeld
                  ? { backgroundColor: mark, borderColor: mark }
                  : { backgroundColor: 'transparent', borderColor: faint },
              ]}
            />
          ))}
        </View>
        <Text style={[styles.restText, { color: dim }]} numberOfLines={1}>
          {restHeld === 0
            ? 'NO REST DAYS HELD'
            : `${restHeld} REST DAY${restHeld === 1 ? '' : 'S'} HELD`}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headText: { flex: 1 },
  count: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    letterSpacing: 1.6,
    includeFontPadding: false,
  },
  caption: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontStyle: 'italic',
    fontSize: 12.5,
    marginTop: 4,
    lineHeight: 17,
  },
  chip: {
    borderWidth: 1.5,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  chipText: { fontFamily: 'Inter_700Bold', fontSize: 8.5, letterSpacing: 1.4 },

  week: { flexDirection: 'row', alignSelf: 'stretch', marginTop: 18 },
  col: { flex: 1, alignItems: 'center', gap: 7 },
  dayLabel: { fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 0.5 },
  // The circle sits in a full-width box so the link can reach the column edge —
  // which is what makes two neighbours join with no gap between them.
  dotWrap: { alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center' },
  link: { position: 'absolute', height: 4 },
  dot: { borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },

  rule: { height: 1, marginTop: 18 },

  nextRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginTop: 14,
    marginBottom: 7,
  },
  nextLabel: { fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 2 },
  nextDays: { fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 1.2 },

  track: { height: 10, borderRadius: 999, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 999, justifyContent: 'flex-start' },
  // The lit top edge every filled track in this app carries — see cinematicKit.
  gloss: {
    height: 3,
    marginTop: 2,
    marginHorizontal: 3,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    opacity: 0.26,
  },

  restRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 },
  pips: { flexDirection: 'row', gap: 5 },
  // A rotated square: a charge held in reserve, and unmistakably not a day.
  pip: { width: 9, height: 9, borderWidth: 1.5, transform: [{ rotate: '45deg' }] },
  restText: { fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 1.6 },
});
