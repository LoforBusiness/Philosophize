import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { ramp, rampFace, mix, PAPER_LIT } from '@/components/shared/tone';
import { GILT, GILT_DEEP, GILT_SOFT, nextMilestone, STREAK_MILESTONES } from '@/constants/streak';
import { buildWeek } from '@/lib/utils/streakCalendar';

const INK = '#1A1A1A';
const INK_SOFT = '#6B6B6B';
const PAPER = '#FAFAF7';
const FAINT = '#E4E1D8';

// ─────────────────────────────────────────────────────────────────────────────
// THE STREAK MOMENT, after a lesson.
//
// This is the single most valuable animation in the app: it is the one that
// decides whether somebody comes back tomorrow.
//
// ── WHAT WAS WRONG WITH THE ONE BEFORE THIS ─────────────────────────────────
//
// A reader: *"the animation for the day streak is just a blue dot and it isnt a
// clean cool animation."* Both halves are exactly right, and they are two
// different faults:
//
//   IT WAS A DOT. Today's day was `<MotiView style={[styles.disc, styles.done]}/>`
//   — a flat 22px circle of one flat colour, springing in from 0.4. Every other
//   reward in this app is a STRUCK object with a lit corner, a shaded one and a
//   rim (tone.ts); the one that matters most was the only flat fill left.
//
//   IT POPPED RATHER THAN LANDING. A spring from 0.4 up to 1 is a thing
//   inflating. Nothing in the metaphor inflates. The seal is a DIE coming down
//   onto paper, so it has to arrive with weight: accelerate on the way down
//   (`Easing.in`, which is the half everyone gets backwards), squash on contact,
//   recoil, settle. The recoil is what sells the mass.
//
// ── THE SHAPE OF THE SEQUENCE, AND WHY IT IS AN ORDER AND NOT A CHORD ───────
//
//   1. THE DIE FALLS      — from 1.5x and 18 above, accelerating, to a 0.94
//                           squash at contact, then 1.05, then 1.
//   2. THE PRESS SPREADS  — a ring leaves the seal's edge on the frame it lands
//                           and fades out. One View. It is the whole difference
//                           between a stamp and a fade-in.
//   3. THE NUMBER COUNTS  — from the OLD streak, not from zero, and STARTING ON
//                           CONTACT. Brilliant's own write-up of their streak
//                           animation names this: the count is "seamlessly
//                           aligned" with the moment, so it reads as caused by
//                           the reader rather than as a clock running.
//   4. THE CHAIN DRAWS    — the rail grows left-to-right through the days
//                           already earned and arrives under today.
//   5. THE DAY IS STRUCK  — the same fall, in miniature, with its own press
//                           ring. The sequence ends on the day just earned.
//
// The order is the design. Playing them together is the same information and a
// fraction of the feeling.
//
// ── WHY THE COUNT IS setState AND NOT A WORKLET ─────────────────────────────
//
// Reanimated cannot drive a Text's CONTENT from the UI thread — only its style.
// A count-up therefore has to cross to JS anyway, so it is an interval rather
// than a shared value pretending. It runs for at most ~700ms and ticks at most
// a dozen times, which is nothing; the seal, the rings and the rail, which
// animate every frame, stay on the UI thread where they belong.
// ─────────────────────────────────────────────────────────────────────────────

// ── THE FLAME WENT WHEN THE FIRE DID, AND THE METAL FOLLOWED THE COLOUR ─────
//
// This drew a literal flame in two paths while the streak was an EMBER. It is
// GILT now — tarnished gilding, chosen against what the category actually does
// rather than by feel (constants/streak.ts) — so the thing held up at the end of
// a lesson is the calendar's own day token, struck large, with the count beside
// it. One object, two sizes, and the grid and the reward screen therefore cannot
// disagree about what a day looks like.
//
// It also inherits the calendar's milestone rule for free: a landmark day wears
// a COLLAR, the same ring a capstone rank pin and a tier-V badge wear (§7).
const METAL = ramp(GILT);
const FACE = rampFace(METAL);
/** The chain under the week, same groove the month grid runs. */
const RAIL = mix(GILT, PAPER, 0.62);
const GROOVE: [string, string, string] = [
  mix(RAIL, INK, 0.16), RAIL, mix(RAIL, PAPER_LIT, 0.5),
];
const LIGHT_START = { x: 0.15, y: 0 } as const;
const LIGHT_END = { x: 0.85, y: 1 } as const;

// THE WEEK'S GEOMETRY IS FIXED, NOT MEASURED, and that is deliberate. A rail
// runs from the centre of one token to the centre of another, and a centre is
// not knowable inside a `space-between` row — which is the whole reason the
// month grid needs an `onLayout`. Here the row is seven equal columns of a known
// width, so the arithmetic is exact and costs no layout pass and no state.
const PITCH = 34;
const DISC = 22;

const FALL_AT = 220;     // ms — the die starts down
const FALL_MS = 240;
const LAND_AT = FALL_AT + FALL_MS;        // 460 — contact, and everything keys off it
const COUNT_MS = 700;
const RAIL_AT = LAND_AT + 460;            // 920
const RAIL_MS = 430;
const DAY_AT = RAIL_AT + RAIL_MS - 90;    // 1260 — the day lands as the chain reaches it
const TAIL_AT = DAY_AT + 400;

interface Props {
  streak: number;
  prevStreak: number;
  restSpent: number;
  activeDays: readonly string[];
  restDays: readonly string[];
  /** Days a rest day is ABOUT to cover — see the union note below. */
  pendingRest?: readonly string[];
  today: string;
  since: string | null;
}

export default function StreakCelebration({
  streak, prevStreak, restSpent, activeDays, restDays, pendingRest, today, since,
}: Props) {
  const [shown, setShown] = useState(prevStreak);

  // Six values rather than one, because a strike is six separate motions and
  // folding them into one driver is how the old one ended up as a single scale.
  const sealScale = useSharedValue(1.5);
  const sealDrop = useSharedValue(-18);
  const sealIn = useSharedValue(0);
  const press = useSharedValue(0);
  const chain = useSharedValue(0);
  const dayScale = useSharedValue(1.55);
  const dayIn = useSharedValue(0);
  const dayPress = useSharedValue(0);

  useEffect(() => {
    sealIn.value = withDelay(FALL_AT, withTiming(1, { duration: 110 }));
    // EASING.IN ON THE WAY DOWN. A falling thing gathers speed; `Easing.out`
    // here — the reflex choice, and what the old one used — decelerates into
    // the paper, which is what made it read as inflating rather than landing.
    sealScale.value = withDelay(FALL_AT, withSequence(
      withTiming(0.94, { duration: FALL_MS, easing: Easing.in(Easing.cubic) }),
      withTiming(1.05, { duration: 130, easing: Easing.out(Easing.quad) }),
      withTiming(1, { duration: 250, easing: Easing.out(Easing.quad) }),
    ));
    sealDrop.value = withDelay(FALL_AT, withSequence(
      withTiming(3, { duration: FALL_MS, easing: Easing.in(Easing.cubic) }),
      withTiming(0, { duration: 380, easing: Easing.out(Easing.quad) }),
    ));
    press.value = withDelay(LAND_AT, withTiming(1, { duration: 540, easing: Easing.out(Easing.quad) }));
    chain.value = withDelay(RAIL_AT, withTiming(1, { duration: RAIL_MS, easing: Easing.out(Easing.cubic) }));
    dayIn.value = withDelay(DAY_AT, withTiming(1, { duration: 90 }));
    dayScale.value = withDelay(DAY_AT, withSequence(
      withTiming(0.9, { duration: 170, easing: Easing.in(Easing.cubic) }),
      withTiming(1.08, { duration: 120, easing: Easing.out(Easing.quad) }),
      withTiming(1, { duration: 220, easing: Easing.out(Easing.quad) }),
    ));
    dayPress.value = withDelay(DAY_AT + 170, withTiming(1, { duration: 460, easing: Easing.out(Easing.quad) }));
  }, [sealScale, sealDrop, sealIn, press, chain, dayScale, dayIn, dayPress]);

  // THE COUNT STARTS ON CONTACT. See note 3 above — this used to run off its own
  // delay, which meant that on a slow frame the number could start moving before
  // the seal had landed, and the two read as unrelated.
  useEffect(() => {
    if (streak === prevStreak) { setShown(streak); return; }
    const steps = Math.min(streak - prevStreak, 12);
    if (steps <= 0) { setShown(streak); return; }
    const every = COUNT_MS / steps;
    let i = 0;
    const start = setTimeout(() => {
      const id = setInterval(() => {
        i += 1;
        setShown(prevStreak + Math.round(((streak - prevStreak) * i) / steps));
        if (i >= steps) clearInterval(id);
      }, every);
    }, LAND_AT);
    return () => clearTimeout(start);
  }, [streak, prevStreak]);

  const sealStyle = useAnimatedStyle(() => ({
    opacity: sealIn.value,
    transform: [{ translateY: sealDrop.value }, { scale: sealScale.value }],
  }));
  // THE PRESS. It leaves the seal's edge and fades — so it must start AT the
  // seal's size (scale 1) and grow outward, never from nothing, or it reads as a
  // second object arriving rather than as the shock of the first one landing.
  const pressStyle = useAnimatedStyle(() => ({
    opacity: (1 - press.value) * 0.5,
    transform: [{ scale: 1 + press.value * 0.9 }],
  }));
  const dayStyle = useAnimatedStyle(() => ({
    opacity: dayIn.value,
    transform: [{ scale: dayScale.value }],
  }));
  const dayPressStyle = useAnimatedStyle(() => ({
    opacity: (1 - dayPress.value) * 0.55,
    transform: [{ scale: 1 + dayPress.value * 1.05 }],
  }));

  // TODAY IS UNIONED IN, and this is not a nicety.
  //
  // The reward screen writes NOTHING until Continue is pressed — everything on it
  // is a preview computed from the store without touching it (see the `commit`
  // comment in LessonReward). So `activeDays` does not contain today yet, and a
  // week built straight from the store would land today's disc as an empty ring
  // at the exact instant the screen is congratulating the reader for filling it.
  // This component's job is to show the state AFTER this lesson counts, so it
  // says so.
  const week = buildWeek({
    active: new Set([...activeDays, today]),
    rest: new Set([...restDays, ...(pendingRest ?? [])]),
    today,
    since,
  });
  const hitMilestone = STREAK_MILESTONES.includes(streak as 7 | 30 | 100 | 365);
  const next = nextMilestone(streak);

  const todayIdx = week.findIndex((d) => d.key === today);
  // The chain runs from the first day of the CURRENT run in this week to today.
  // Walking backwards from today rather than forwards from Monday is what stops
  // a lit Monday, a missed Tuesday and a lit Wednesday being drawn as one run.
  let runStart = todayIdx;
  while (runStart > 0) {
    const p = week[runStart - 1];
    if (p.state === 'done' || p.state === 'rest') runStart -= 1;
    else break;
  }
  const railLeft = runStart * PITCH + PITCH / 2;
  const railFull = Math.max(0, (todayIdx - runStart) * PITCH);

  const chainStyle = useAnimatedStyle(() => ({ width: railFull * chain.value }));

  return (
    <View style={styles.wrap}>
      <MotiView
        from={{ opacity: 0, translateY: 6 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 260 }}
      >
        <Text style={styles.heading}>
          {restSpent > 0 ? 'STREAK KEPT' : prevStreak === 0 ? 'STREAK STARTED' : 'STREAK EXTENDED'}
        </Text>
      </MotiView>

      <View style={styles.sealRow}>
        <Animated.View style={[styles.seal, sealStyle]}>
          {/* THE PRESS, behind the face so the seal is never drawn over. */}
          <Animated.View pointerEvents="none" style={[styles.pressRing, pressStyle]} />
          {/* The collar, outside the disc — a landmark day only. */}
          {hitMilestone ? <View pointerEvents="none" style={styles.sealCollar} /> : null}
          <LinearGradient
            colors={[FACE[0][1], FACE[1][1], FACE[2][1]]}
            locations={[0, 0.52, 1]}
            start={LIGHT_START}
            end={LIGHT_END}
            style={styles.sealFace}
          >
            {/* THE IMPRESSION. A struck thing has a mark pressed INTO it, and
                without one a 54px disc is a gradient rather than an object. It
                is the metal's own shade at a whisper, so it can never compete
                with the number beside it. */}
            <View pointerEvents="none" style={styles.sealMark} />
          </LinearGradient>
        </Animated.View>
        <Text style={styles.count}>{shown}</Text>
      </View>

      <Text style={styles.dayWord}>{shown === 1 ? 'DAY' : 'DAYS'}</Text>

      {restSpent > 0 && (
        <Text style={styles.restNote}>
          {restSpent === 1 ? 'A day of rest covered yesterday.' : `${restSpent} rest days covered the gap.`}
        </Text>
      )}

      {/* THE WEEK. A run is one thing, so the days it contains are JOINED — the
          seven-islands version could not say that five lit days were five in a
          row rather than five unrelated ticks. The rail draws itself, then the
          day the reader just earned is struck at the end of it. */}
      <View style={[styles.week, { width: 7 * PITCH }]}>
        {railFull > 0 ? (
          <Animated.View style={[styles.railWrap, { left: railLeft }, chainStyle]}>
            <LinearGradient
              colors={GROOVE}
              locations={[0, 0.45, 1]}
              start={LIGHT_START}
              end={LIGHT_END}
              style={styles.rail}
            />
          </Animated.View>
        ) : null}

        {week.map((d, i) => {
          const isToday = i === todayIdx;
          const lit = d.state === 'done' || d.state === 'rest';
          return (
            <View key={i} style={[styles.dayCol, { width: PITCH }]}>
              <Text style={[styles.dayLabel, lit && styles.dayLabelOn]}>
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
              </Text>
              {isToday ? (
                <Animated.View style={[styles.discBox, dayStyle]}>
                  <Animated.View pointerEvents="none" style={[styles.dayPressRing, dayPressStyle]} />
                  <LinearGradient
                    colors={[FACE[0][1], FACE[1][1], FACE[2][1]]}
                    locations={[0, 0.52, 1]}
                    start={LIGHT_START}
                    end={LIGHT_END}
                    style={styles.disc}
                  />
                </Animated.View>
              ) : d.state === 'done' ? (
                <LinearGradient
                  colors={[FACE[0][1], FACE[1][1], FACE[2][1]]}
                  locations={[0, 0.52, 1]}
                  start={LIGHT_START}
                  end={LIGHT_END}
                  style={styles.disc}
                />
              ) : (
                <View
                  style={[
                    styles.disc,
                    d.state === 'rest' && styles.rested,
                    d.state === 'missed' && styles.missed,
                    d.state === 'future' && styles.future,
                  ]}
                />
              )}
            </View>
          );
        })}
      </View>

      {/* A landmark, or how far to the next one. Duolingo's "keep going" line,
          and the reason a 6-day streak feels like it is worth a seventh. */}
      <MotiView
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ type: 'timing', duration: 320, delay: TAIL_AT }}
      >
        {hitMilestone ? (
          <Text style={styles.milestone}>{streak} DAYS · A LANDMARK</Text>
        ) : next ? (
          <Text style={styles.toGo}>
            {next - streak} {next - streak === 1 ? 'day' : 'days'} to {next}
          </Text>
        ) : null}
      </MotiView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', marginTop: 22 },
  heading: { fontFamily: 'Inter_700Bold', fontSize: 10.5, color: INK_SOFT, letterSpacing: 2.6 },

  sealRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 10 },
  seal: { width: 62, height: 62, alignItems: 'center', justifyContent: 'center' },
  sealFace: {
    width: 54, height: 54, borderRadius: 27,
    borderWidth: 1, borderColor: METAL.rim,
    alignItems: 'center', justifyContent: 'center',
  },
  sealMark: {
    width: 34, height: 34, borderRadius: 17,
    borderWidth: 1.5, borderColor: METAL.shade, opacity: 0.5,
  },
  sealCollar: {
    position: 'absolute', width: 62, height: 62, borderRadius: 31,
    borderWidth: 2, borderColor: GILT_DEEP,
  },
  pressRing: {
    position: 'absolute', width: 54, height: 54, borderRadius: 27,
    borderWidth: 2, borderColor: GILT,
  },
  count: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 62,
    color: GILT,
    marginLeft: 10,
    includeFontPadding: false,
  },
  dayWord: { fontFamily: 'Inter_700Bold', fontSize: 10, color: INK_SOFT, letterSpacing: 3, marginTop: 2 },

  restNote: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontStyle: 'italic',
    fontSize: 13,
    color: INK_SOFT,
    marginTop: 10,
    textAlign: 'center',
  },

  week: { flexDirection: 'row', marginTop: 20 },
  dayCol: { alignItems: 'center' },
  dayLabel: { fontFamily: 'Inter_500Medium', fontSize: 9.5, color: INK_SOFT, marginBottom: 6 },
  dayLabelOn: { color: INK, fontFamily: 'Inter_700Bold' },
  // The rail sits behind the tokens and is measured from the row's own left
  // edge, so its top must clear the weekday labels above it.
  railWrap: { position: 'absolute', top: 21.5, height: 9, overflow: 'hidden', borderRadius: 4.5 },
  rail: { flex: 1, borderRadius: 4.5 },
  discBox: { width: DISC, height: DISC, alignItems: 'center', justifyContent: 'center' },
  disc: { width: DISC, height: DISC, borderRadius: DISC / 2 },
  dayPressRing: {
    position: 'absolute', width: DISC, height: DISC, borderRadius: DISC / 2,
    borderWidth: 1.5, borderColor: GILT,
  },
  rested: { backgroundColor: GILT_SOFT, borderWidth: 1, borderColor: GILT },
  missed: { borderWidth: 1.5, borderColor: FAINT },
  future: { borderWidth: 1.5, borderColor: FAINT, opacity: 0.55 },

  milestone: { fontFamily: 'Inter_700Bold', fontSize: 11, color: GILT, letterSpacing: 2.4, marginTop: 20 },
  toGo: { fontFamily: 'PlayfairDisplay_400Regular', fontStyle: 'italic', fontSize: 13.5, color: INK_SOFT, marginTop: 20 },
});
