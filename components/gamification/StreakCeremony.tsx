import { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, Easing, type SharedValue,
} from 'react-native-reanimated';
import { mix, PAPER_LIT, LOCK_FACE, LOCK_EDGE, SHINE } from '@/components/shared/tone';
import { LINE, WOOD, WOOD_LIT, WOOD_SHADE, SHEET_SHADE } from '@/components/shared/drawn';
import { STREAK_EMBER, STREAK_DEEP, STREAK_WASH, nextMilestone, STREAK_MILESTONES } from '@/constants/streak';
import { buildWeek } from '@/lib/utils/streakCalendar';
import { C, LIP } from '@/constants/design';
import { cue } from '@/lib/feedback';

const INK = C.ink;
const INK_SOFT = C.inkSoft;
const PAPER = C.paper;

// ─────────────────────────────────────────────────────────────────────────────
// THE STREAK CEREMONY: the day torn off and stamped.
//
// This takes the whole screen, immediately after Finish and BEFORE the XP
// receipt, in the slot RankUpScreen owns on a rank-up. It is the one animation
// that decides whether somebody comes back tomorrow.
//
// ── THE SECOND DESIGN (2026-09-29) ─────────────────────────────────────────
//
// "It looks pretty cheap and it does not look very unique." It did: the hero was
// a gradient BALL with a typewriter legend on it, in an app that had since
// stopped drawing gradients anywhere else, and the burst was the same rectangle
// confetti every celebration screen on earth throws.
//
// The streak already HAS an object, and it is not a coin. The streak tab and the
// Home and Profile panels draw it as a tear-off calendar (TearCalendar.tsx). So
// the ceremony is that object doing the one thing a tear-off calendar does:
//
//   1. THE PAD, BEFORE    the page still reads yesterday's count.
//   2. THE TEAR           the page pivots from its top-left corner as the right
//                         side rips along the perforation, then drops away and
//                         falls off the screen. The new count is underneath.
//   3. THE DIE FALLS      a wooden rubber stamp, ACCELERATING — `Easing.in` is
//                         the half everyone gets backwards; decelerating into
//                         the paper reads as a thing inflating, not landing.
//   4. CONTACT            the thud (`cue('seal')` on T_STRIKE), the pad squashes,
//                         impact strokes leave the die and ember sparks fly.
//   5. THE INK            the die lifts and leaves IN INK pressed onto the new
//                         page. Ink that arrives once the die is up was left by
//                         it; ink that arrives with it is painted on the die.
//   6. THE GLINT          a flat shine crosses the binding.
//   7. THE CHAIN DRAWS    through the days already earned, arriving under today,
//                         which is struck as it gets there.
//
// ONE CLOCK RUNS ALL OF IT, as on RankUpScreen: `t` is ms since mount and every
// part is a function of it, so a tap that skips runs the same clock to the same
// end and nothing can be left half-played. Only Views; no gradients.
// ─────────────────────────────────────────────────────────────────────────────

// ── the pad ─────────────────────────────────────────────────────────────────
const PAD_W = 188;
const BAND_H = 46;
const PAGE_H = 168;
const RING = 12;
const R = 12;

// ── WHAT THE STAMP SAYS ─────────────────────────────────────────────────────
//
// IN INK, not DAY DONE. A day DONE is a task closed; a day IN INK is a mark on a
// record still being written, and this screen's job is tomorrow. The legend is
// crooked on purpose — a hand-held stamp never comes down square.
//
// THE LENGTH IS THE BOX. Two stacked lines straddle the centre, so the worst line
// sits half a line-height out, where the chord through the ring is narrowest.
// `check:streak` re-derives that chord against the real Special Elite `.ttf`, so a
// longer legend fails the build rather than the phone.
const STAMP = ['IN', 'INK'] as const;
const STAMP_RING = 76;
const STAMP_SIZE = 24;
const STAMP_TILT = '-8deg';
/** Where the impression sits on the page: its centre, in page coordinates. */
const STAMP_X = PAD_W - 48;
const STAMP_Y = PAGE_H - 44;
/** The die's rubber is a shade wider than the ring it prints. */
const DIE_W = STAMP_RING + 12;

// ── the week ────────────────────────────────────────────────────────────────
// Fixed geometry, not measured: a rail runs from one token's centre to another's,
// and a centre is not knowable inside a `space-between` row.
const PITCH = 42;
const DISC = 26;
const LABEL_H = 14;
const LABEL_GAP = 7;

// ── the timeline, in ms from mount. Each is the moment that step BEGINS ──────
const T_TEAR = 260;                      // the pad, before — long enough to read
const D_TEAR = 520;
const T_HOLD = 560;                      // the die appears, high and falling
const D_FALL = 240;
const T_LAND = T_HOLD + D_FALL;          // 800 — CONTACT
const T_INK = T_LAND + 90;
const T_SWEEP = T_LAND + 260;
const T_RAIL = T_LAND + 550;
const D_RAIL = 400;
const T_DAY = T_RAIL + D_RAIL - 90;      // the day lands as the chain reaches it
const T_TAIL = T_DAY + 320;
const T_CTA = T_TAIL + 240;
const T_END = T_CTA + 400;

/**
 * Exported so the sound is timed to the frame the die lands on. The clip's pluck
 * at 0.86s is the day token landing on the week — `T_DAY − T_LAND` above.
 */
export const T_STRIKE = T_LAND;

const clamp01 = (x: number) => {
  'worklet';
  return x < 0 ? 0 : x > 1 ? 1 : x;
};
const span = (t: number, a: number, d: number) => {
  'worklet';
  return clamp01((t - a) / d);
};
const backOut = (u: number) => {
  'worklet';
  const k = 1.9;
  const v = u - 1;
  return 1 + (k + 1) * v * v * v + k * v * v;
};

// ── the sparks and the impact strokes ───────────────────────────────────────
const hash = (n: number) => {
  const v = Math.sin(n * 12.9898) * 43758.5453;
  return v - Math.floor(v);
};

interface Spark { angle: number; dist: number; size: number; delay: number; drop: number; tone: number; gem: boolean; }

function makeSparks(n: number): Spark[] {
  const out: Spark[] = [];
  for (let i = 0; i < n; i++) {
    // An upward fan: the die is on the page, so nothing flies down into it.
    const angle = Math.PI + (i / (n - 1)) * Math.PI + (hash(i * 3.1) - 0.5) * 0.3;
    out.push({
      angle,
      dist: 60 + hash(i * 7.7) * 90,
      size: 8 + hash(i * 5.3) * 7,
      delay: hash(i * 4.7) * 70,
      drop: 40 + hash(i * 8.9) * 70,
      tone: Math.floor(hash(i * 6.1) * 3),
      gem: hash(i * 9.9) > 0.45,
    });
  }
  return out;
}

function SparkView({ p, t, tones }: { p: Spark; t: SharedValue<number>; tones: string[] }) {
  const st = useAnimatedStyle(() => {
    const u = span(t.value, T_LAND + p.delay, 900);
    const out = 1 - Math.pow(1 - u, 2.4);
    const r = DIE_W / 2 + p.dist * out;
    return {
      opacity: u <= 0 ? 0 : 1 - span(u, 0.6, 0.4),
      transform: [
        { translateX: Math.cos(p.angle) * r },
        { translateY: Math.sin(p.angle) * r * 0.8 + p.drop * u * u },
        { rotate: `${(p.gem ? 45 : 0) + out * 260}deg` },
        { scale: 0.4 + 0.6 * span(u, 0, 0.1) },
      ],
    };
  });
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.spark,
        {
          width: p.size, height: p.size, marginLeft: -p.size / 2, marginTop: -p.size / 2,
          borderRadius: p.gem ? 2 : p.size / 2, backgroundColor: tones[p.tone],
        },
        st,
      ]}
    />
  );
}

/** Comic impact strokes: short, thick, radiating from the die, gone in 260ms. */
function Stroke({ k, n, t }: { k: number; n: number; t: SharedValue<number> }) {
  const a = Math.PI + 0.25 + (k / (n - 1)) * (Math.PI - 0.5);
  const st = useAnimatedStyle(() => {
    const u = span(t.value, T_LAND, 260);
    const r = DIE_W / 2 + 6 + u * 22;
    return {
      opacity: u <= 0 || u >= 1 ? 0 : 1 - u * u,
      transform: [
        { translateX: Math.cos(a) * r },
        { translateY: Math.sin(a) * r },
        { rotate: `${(a * 180) / Math.PI}deg` },
        { scaleX: 0.4 + 0.6 * (1 - u) },
      ],
    };
  });
  return <Animated.View pointerEvents="none" style={[styles.stroke, st]} />;
}

/** One page of the pad, reading `value`. The numeral is struck, not printed. */
function Page({ value }: { value: number }) {
  const digits = String(value).length;
  const fs = digits <= 2 ? 90 : digits === 3 ? 66 : 50;
  const depth = 4;
  return (
    <View style={styles.pageFace}>
      <View style={styles.numBox}>
        {[1, 2, 3].map((k) => (
          <Text
            key={k}
            aria-hidden
            numberOfLines={1}
            style={[
              styles.num, styles.numDepth,
              { fontSize: fs, lineHeight: fs * 1.15, left: (depth * k) / 3, top: (depth * k) / 3 },
            ]}
          >
            {value}
          </Text>
        ))}
        <Text numberOfLines={1} style={[styles.num, { fontSize: fs, lineHeight: fs * 1.15 }]}>{value}</Text>
      </View>
    </View>
  );
}

// ── the words ───────────────────────────────────────────────────────────────
// Nothing here may say the day is finished. The eyebrow names the RUN, which the
// week rail underneath is already drawing, and the tail always points ahead.
const LANDMARK: Record<number, string> = {
  7: 'a week', 30: 'a month', 100: 'a hundred', 365: 'a year',
};

export const EYEBROWS = ['THE RUN BEGINS', 'THE RUN HOLDS', 'THE RUN CONTINUES'] as const;

function eyebrowFor(prevStreak: number, restSpent: number): string {
  if (restSpent > 0) return EYEBROWS[1];
  return prevStreak === 0 ? EYEBROWS[0] : EYEBROWS[2];
}

/**
 * THE LINE THAT REPLACES "DONE". The invitation is offered only when another
 * lesson actually exists; since the hard paywall everybody finishing a lesson
 * holds the Pass, so the reward always passes `moreToday` and the landmark lines
 * are for a caller that one day cannot.
 */
function tailFor(streak: number, moreToday: boolean): string {
  const next = nextMilestone(streak);
  if (moreToday) return 'Another one is ready when you are.';
  if (next) {
    const gap = next - streak;
    return `${gap} more and it is ${LANDMARK[next] ?? `${next} days`}.`;
  }
  // Name the next DAY rather than asking for a return visit: "come back
  // tomorrow" is the screen closing the session, and check:streak refuses it.
  return `Day ${streak + 1} is next.`;
}

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
  /** Is another lesson actually available to this reader right now? */
  moreToday: boolean;
  onDone: () => void;
}

export default function StreakCeremony({
  streak, prevStreak, restSpent, activeDays, restDays, pendingRest, today, since,
  moreToday, onDone,
}: Props) {
  const t = useSharedValue(0);
  const [ready, setReady] = useState(false);
  const [down, setDown] = useState(false);
  const skipped = useRef(false);

  const hitMilestone = STREAK_MILESTONES.includes(streak as 7 | 30 | 100 | 365);
  // A landmark day gets more of everything the ordinary day gets.
  const sparks = useMemo(() => makeSparks(hitMilestone ? 18 : 11), [hitMilestone]);
  const tones = useMemo(() => [STREAK_EMBER, mix(STREAK_EMBER, PAPER, 0.4), PAPER_LIT], []);
  const bandText = hitMilestone ? (LANDMARK[streak] ?? 'STREAK').toUpperCase() : 'DAY STREAK';

  useEffect(() => {
    t.value = withTiming(T_END, { duration: T_END, easing: Easing.linear });
    // THE STRIKE IS HEARD AND FELT ON THE FRAME IT LANDS. Scheduled rather than
    // fired from a worklet: `cue` reads a store and touches the haptics API, and
    // neither belongs on the UI thread. Cleared on unmount, so a reader who taps
    // straight through does not get a thump on a screen they have left.
    const strike = setTimeout(() => cue('seal'), T_STRIKE);
    const id = setTimeout(() => setReady(true), T_CTA + 280);
    return () => { clearTimeout(strike); clearTimeout(id); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // A tap runs the same clock to its end state. A ceremony nobody can get past,
  // on a screen met every day, is a toll.
  const skip = () => {
    if (skipped.current || ready) return;
    skipped.current = true;
    t.value = withTiming(T_END, { duration: 320, easing: Easing.out(Easing.cubic) });
    setReady(true);
  };

  const tagStyle = useAnimatedStyle(() => {
    const u = span(t.value, 0, 360);
    return { opacity: u, transform: [{ translateY: (1 - u) * -10 }] };
  });

  // The whole pad takes the blow: a squash on contact and one bounce.
  const padStyle = useAnimatedStyle(() => {
    const u = span(t.value, 0, 380);
    const c = span(t.value, T_LAND, 260);
    const hit = c > 0 && c < 1 ? Math.sin(Math.PI * c) : 0;
    return {
      opacity: u,
      transform: [
        { translateY: (1 - u) * 16 + hit * 4 },
        { scaleX: 1 + hit * 0.02 },
        { scaleY: 1 - hit * 0.035 },
      ],
    };
  });

  // THE TEAR. Pivot about the top-left corner while the right side rips (ease
  // in — the paper resists and then gives), then released: it falls, still
  // turning, and leaves the screen.
  const oldPage = useAnimatedStyle(() => {
    const u = span(t.value, T_TEAR, D_TEAR);
    const rip = span(u, 0, 0.42);
    const fall = span(u, 0.42, 0.58);
    const lean = rip * rip * 16 + fall * 30;
    return {
      opacity: u >= 1 ? 0 : 1 - span(fall, 0.55, 0.45),
      transform: [
        { translateX: fall * 46 },
        { translateY: fall * fall * 380 },
        { rotate: `${lean}deg` },
      ],
    };
  });
  // The new count, uncovered, gives one small beat as the page clears it.
  const newNum = useAnimatedStyle(() => {
    const u = span(t.value, T_TEAR + D_TEAR * 0.45, 320);
    return { transform: [{ scale: u <= 0 ? 1 : 1 + 0.06 * Math.sin(Math.PI * u) }] };
  });

  // THE DIE. Falls accelerating from off the top, squashes on contact, lifts
  // away accelerating and fades.
  const dieStyle = useAnimatedStyle(() => {
    const f = span(t.value, T_HOLD, D_FALL);
    const c = span(t.value, T_LAND, 90);
    const l = span(t.value, T_INK, 380);
    const squash = c > 0 && c < 1 ? Math.sin(Math.PI * c) * 0.1 : 0;
    return {
      opacity: f <= 0 ? 0 : 1 - span(l, 0.45, 0.55),
      transform: [
        { translateY: -300 * (1 - f * f) - 170 * l * l },
        { scaleY: 1 - squash },
        { scaleX: 1 + squash * 0.5 },
      ],
    };
  });
  const inkStyle = useAnimatedStyle(() => {
    const u = span(t.value, T_INK, 140);
    return { opacity: u, transform: [{ rotate: STAMP_TILT }, { scale: 1.06 - 0.06 * u }] };
  });

  // A flat shine crosses the binding, clipped by the band.
  const glintStyle = useAnimatedStyle(() => {
    const u = span(t.value, T_SWEEP, hitMilestone ? 900 : 600);
    const pass = hitMilestone ? (u * 2) % 1 : u;
    return {
      opacity: u > 0 && u < 1 ? 1 : 0,
      transform: [{ translateX: -60 + pass * (PAD_W + 120) }, { rotate: '22deg' }],
    };
  });

  const labelStyle = useAnimatedStyle(() => {
    const u = span(t.value, T_INK, 300);
    return { opacity: u, transform: [{ translateY: (1 - u) * 6 }] };
  });
  const weekStyle = useAnimatedStyle(() => {
    const u = span(t.value, T_RAIL - 200, 300);
    return { opacity: u, transform: [{ translateY: (1 - u) * 8 }] };
  });
  const dayStyle = useAnimatedStyle(() => {
    const u = span(t.value, T_DAY, 260);
    return { opacity: u > 0 ? 1 : 0, transform: [{ scale: u <= 0 ? 0.3 : backOut(u) }] };
  });
  const dayPing = useAnimatedStyle(() => {
    const u = span(t.value, T_DAY, 460);
    return { opacity: u <= 0 || u >= 1 ? 0 : 0.8 * (1 - u), transform: [{ scale: 1 + u * 1.1 }] };
  });
  const tailStyle = useAnimatedStyle(() => {
    const u = span(t.value, T_TAIL, 320);
    return { opacity: u, transform: [{ translateY: (1 - u) * 6 }] };
  });
  const ctaStyle = useAnimatedStyle(() => {
    const u = span(t.value, T_CTA, 280);
    return { opacity: u, transform: [{ translateY: (1 - u) * 10 }] };
  });

  // TODAY IS UNIONED IN, and this is not a nicety. The reward flow writes NOTHING
  // until Continue is pressed, so `activeDays` does not contain today yet, and a
  // week built straight from the store would draw today as an empty ring at the
  // instant the screen is congratulating the reader for filling it.
  const week = buildWeek({
    active: new Set([...activeDays, today]),
    rest: new Set([...restDays, ...(pendingRest ?? [])]),
    today,
    since,
  });
  const todayIdx = week.findIndex((d) => d.key === today);
  // The chain runs from the first day of the CURRENT run in this week to today.
  // Walking backwards from today is what stops a lit Monday, a missed Tuesday and
  // a lit Wednesday being drawn as one run.
  let runStart = todayIdx;
  while (runStart > 0) {
    const p = week[runStart - 1];
    if (p.state === 'done' || p.state === 'rest') runStart -= 1;
    else break;
  }
  const railLeft = runStart * PITCH + PITCH / 2;
  const railFull = Math.max(0, (todayIdx - runStart) * PITCH);
  const chainStyle = useAnimatedStyle(() => {
    const u = span(t.value, T_RAIL, D_RAIL);
    return { width: railFull * (1 - Math.pow(1 - u, 3)) };
  });

  return (
    <Pressable style={styles.root} onPress={skip}>
      <Animated.View style={[styles.tagWrap, tagStyle]}>
        <View style={styles.tagLip} />
        <View style={styles.tag}>
          <Text style={styles.tagText}>{eyebrowFor(prevStreak, restSpent)}</Text>
        </View>
      </Animated.View>

      <View style={styles.center}>
        {/* ── the pad ─────────────────────────────────────────────────────── */}
        <Animated.View style={[styles.pad, padStyle]}>
          {/* the sheets under the pages, so it reads as a pad and not a card */}
          <View style={[styles.under, { top: BAND_H + 10, left: 6 }]} />
          <View style={[styles.under, { top: BAND_H + 5, left: 3 }]} />

          {/* today's page, with the impression the die leaves on it */}
          <View style={styles.pageNew}>
            <Animated.View style={[styles.fill, newNum]}>
              <Page value={streak} />
            </Animated.View>
            <Animated.View pointerEvents="none" style={[styles.stamp, inkStyle]}>
              <View style={styles.stampRing} />
              {STAMP.map((word) => (
                <Text key={word} style={styles.stampWord}>{word}</Text>
              ))}
            </Animated.View>
          </View>

          {/* yesterday's page, torn off */}
          {prevStreak !== streak ? (
            <Animated.View style={[styles.pageOld, oldPage]} pointerEvents="none">
              <Page value={prevStreak} />
            </Animated.View>
          ) : null}

          {/* the binding, drawn last so the pages tear out from under it */}
          <View style={styles.band}>
            <Animated.View pointerEvents="none" style={[styles.glint, glintStyle]} />
            <Text style={styles.bandText} numberOfLines={1}>{bandText}</Text>
          </View>
          {[0.28, 0.72].map((f) => (
            <View key={f} style={[styles.ring, { left: PAD_W * f - RING / 2 }]} />
          ))}

          {/* the die, and what it throws off on contact */}
          <View pointerEvents="none" style={styles.dieOrigin}>
            {Array.from({ length: 5 }, (_, i) => <Stroke key={i} k={i} n={5} t={t} />)}
            {sparks.map((p, i) => <SparkView key={i} p={p} t={t} tones={tones} />)}
            <Animated.View style={[styles.die, dieStyle]}>
              <View style={styles.dieKnob} />
              <View style={styles.dieNeck} />
              <View style={styles.dieBlock}>
                <View style={styles.dieBlockLit} />
              </View>
              <View style={styles.dieRubber} />
            </Animated.View>
          </View>
        </Animated.View>

        <Animated.Text style={[styles.daysLabel, labelStyle]}>
          {streak === 1 ? 'DAY IN A ROW' : 'DAYS IN A ROW'}
        </Animated.Text>

        {restSpent > 0 && (
          <Animated.Text style={[styles.restNote, labelStyle]}>
            {restSpent === 1 ? 'A day of rest covered yesterday.' : `${restSpent} rest days covered the gap.`}
          </Animated.Text>
        )}

        {/* ── the chain, and today struck at the end of it ─────────────────── */}
        <Animated.View style={[styles.week, { width: 7 * PITCH }, weekStyle]}>
          {railFull > 0 ? (
            <Animated.View style={[styles.rail, { left: railLeft }, chainStyle]} />
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
                  <View style={styles.discBox}>
                    <View style={[styles.disc, styles.future]} />
                    <Animated.View pointerEvents="none" style={[styles.dayPing, dayPing]} />
                    <Animated.View style={[styles.disc, styles.done, styles.discOver, dayStyle]}>
                      <View style={styles.discGlint} />
                    </Animated.View>
                  </View>
                ) : (
                  <View
                    style={[
                      styles.disc,
                      d.state === 'done' && styles.done,
                      d.state === 'rest' && styles.rested,
                      d.state === 'missed' && styles.missed,
                      d.state === 'future' && styles.future,
                    ]}
                  >
                    {d.state === 'done' ? <View style={styles.discGlint} /> : null}
                  </View>
                )}
              </View>
            );
          })}
        </Animated.View>

        {/* ── the line that used to say the day was over ───────────────────── */}
        <Animated.View style={tailStyle}>
          {hitMilestone ? (
            <Text style={styles.milestone}>{streak} DAYS · A LANDMARK</Text>
          ) : (
            <Text style={styles.tail}>{tailFor(streak, moreToday)}</Text>
          )}
        </Animated.View>
      </View>

      {/* THE WAY OUT, on a ledge rather than a fade. Dimming on press is what a
          DISABLED control does; every other button in the app depresses. */}
      <Animated.View style={ctaStyle} pointerEvents={ready ? 'auto' : 'none'}>
        <View style={{ paddingBottom: LIP.button }}>
          <View pointerEvents="none" style={styles.btnLip} />
          <Pressable
            onPress={onDone}
            onPressIn={() => setDown(true)}
            onPressOut={() => setDown(false)}
            style={[styles.btn, { transform: [{ translateY: down ? LIP.button : 0 }] }]}
          >
            <Text style={styles.btnText}>Continue →</Text>
          </Pressable>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const PAD_H = BAND_H + PAGE_H;

const styles = StyleSheet.create({
  // CLIPPED, because the torn page falls off the bottom and the sparks are
  // thrown wide; without this the page grows a scrollbar under the reader.
  root: { flex: 1, backgroundColor: PAPER, paddingHorizontal: 28, paddingBottom: 40, paddingTop: 58, overflow: 'hidden' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  tagWrap: { alignSelf: 'center', paddingBottom: 3 },
  tagLip: { position: 'absolute', left: 0, right: 0, top: 3, bottom: 0, borderRadius: 999, backgroundColor: INK },
  tag: {
    borderRadius: 999, paddingHorizontal: 16, paddingVertical: 7,
    borderWidth: LINE, borderColor: INK, backgroundColor: STREAK_DEEP,
  },
  tagText: { fontFamily: 'Inter_700Bold', fontSize: 11.5, letterSpacing: 2.4, color: PAPER },

  pad: { width: PAD_W, height: PAD_H + 12, marginTop: 10 },
  under: {
    position: 'absolute', width: PAD_W, height: PAGE_H,
    borderRadius: R, borderWidth: LINE, borderColor: INK, backgroundColor: PAPER_LIT,
    boxShadow: `0px 3px 0px ${SHEET_SHADE}`,
  },
  pageNew: {
    position: 'absolute', left: 0, top: BAND_H, width: PAD_W, height: PAGE_H,
    borderBottomLeftRadius: R, borderBottomRightRadius: R,
    borderWidth: LINE, borderColor: INK, backgroundColor: PAPER_LIT, overflow: 'hidden',
  },
  pageOld: {
    position: 'absolute', left: 0, top: BAND_H, width: PAD_W, height: PAGE_H,
    borderBottomLeftRadius: R, borderBottomRightRadius: R,
    borderWidth: LINE, borderColor: INK, backgroundColor: PAPER_LIT,
    transformOrigin: '0% 0%',
  },
  fill: { flex: 1 },
  pageFace: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 42, paddingRight: 46 },
  numBox: { alignItems: 'center', justifyContent: 'center' },
  // LINING FIGURES: Playfair's defaults are old-style, and 3, 4, 5, 7 and 9 hang
  // below the baseline.
  num: {
    fontFamily: 'PlayfairDisplay_700Bold', includeFontPadding: false, textAlign: 'center',
    fontVariant: ['lining-nums'], color: INK,
  },
  numDepth: { position: 'absolute', color: mix(STREAK_EMBER, INK, 0.45) },

  band: {
    position: 'absolute', left: 0, top: 0, width: PAD_W, height: BAND_H + LINE,
    borderTopLeftRadius: R, borderTopRightRadius: R,
    borderWidth: LINE, borderColor: INK, backgroundColor: STREAK_EMBER,
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  bandText: { fontFamily: 'Inter_700Bold', fontSize: 14, letterSpacing: 2.6, color: PAPER_LIT, marginTop: 4 },
  glint: { position: 'absolute', left: 0, top: -30, width: 22, height: BAND_H + 60, backgroundColor: SHINE },
  ring: {
    position: 'absolute', top: -RING * 0.9, width: RING, height: RING * 2.1, borderRadius: RING / 2,
    borderWidth: LINE * 0.8, borderColor: INK, backgroundColor: PAPER_LIT,
  },

  stamp: {
    position: 'absolute', left: STAMP_X - STAMP_RING / 2, top: STAMP_Y - STAMP_RING / 2,
    width: STAMP_RING, height: STAMP_RING, alignItems: 'center', justifyContent: 'center',
    // OPTICALLY CENTRED: Special Elite carries its caps near the top of the em
    // box, so two all-caps lines centred on their boxes sit high.
    paddingTop: 4,
  },
  stampRing: {
    position: 'absolute', width: STAMP_RING, height: STAMP_RING, borderRadius: STAMP_RING / 2,
    borderWidth: 3, borderColor: STREAK_EMBER,
  },
  stampWord: {
    fontFamily: 'SpecialElite_400Regular',
    fontSize: STAMP_SIZE,
    lineHeight: STAMP_SIZE * 1.06,
    letterSpacing: 0.6,
    // Ink, pressed: the ember itself, which reads 4.85:1 on the white page.
    color: STREAK_EMBER,
    includeFontPadding: false,
    textAlign: 'center',
  },

  // The die's origin is the stamp's centre in pad coordinates.
  dieOrigin: { position: 'absolute', left: STAMP_X, top: BAND_H + STAMP_Y, width: 0, height: 0 },
  die: { position: 'absolute', left: -DIE_W / 2, top: -96, width: DIE_W, height: 100, alignItems: 'center', transformOrigin: '50% 100%' },
  dieKnob: {
    width: 34, height: 34, borderRadius: 17, borderWidth: LINE, borderColor: INK, backgroundColor: WOOD_LIT,
  },
  dieNeck: {
    width: 16, height: 22, marginTop: -3, borderWidth: LINE, borderColor: INK, backgroundColor: WOOD,
  },
  dieBlock: {
    width: DIE_W - 8, height: 30, marginTop: -2, borderRadius: 6,
    borderWidth: LINE, borderColor: INK, backgroundColor: WOOD, overflow: 'hidden',
    borderBottomWidth: 6, borderBottomColor: WOOD_SHADE,
  },
  dieBlockLit: { position: 'absolute', left: 6, top: 4, width: DIE_W - 36, height: 5, borderRadius: 3, backgroundColor: WOOD_LIT },
  dieRubber: {
    width: DIE_W, height: 12, marginTop: -2, borderRadius: 4,
    borderWidth: LINE, borderColor: INK, backgroundColor: STREAK_DEEP,
  },
  stroke: {
    position: 'absolute', left: -9, top: -2.5, width: 18, height: 5, borderRadius: 2.5, backgroundColor: INK,
  },
  spark: { position: 'absolute', left: 0, top: 0, borderWidth: 1.6, borderColor: INK },

  daysLabel: {
    fontFamily: 'Inter_700Bold', fontSize: 12, color: INK_SOFT, letterSpacing: 3.2, marginTop: 22,
  },
  restNote: {
    fontFamily: 'PlayfairDisplay_400Regular', fontStyle: 'italic', fontSize: 13,
    color: INK_SOFT, marginTop: 10, textAlign: 'center',
  },

  week: { flexDirection: 'row', marginTop: 24 },
  dayCol: { alignItems: 'center' },
  dayLabel: {
    fontFamily: 'Inter_500Medium', fontSize: 10, lineHeight: LABEL_H, color: INK_SOFT, marginBottom: LABEL_GAP,
  },
  dayLabelOn: { color: INK, fontFamily: 'Inter_700Bold' },
  // Behind the tokens, through their centres.
  rail: {
    position: 'absolute', top: LABEL_H + LABEL_GAP + DISC / 2 - 6, height: 12, borderRadius: 6,
    borderWidth: LINE, borderColor: INK, backgroundColor: mix(STREAK_EMBER, PAPER, 0.55),
  },
  discBox: { width: DISC, height: DISC, alignItems: 'center', justifyContent: 'center' },
  disc: { width: DISC, height: DISC, borderRadius: DISC / 2, overflow: 'hidden' },
  discOver: { position: 'absolute', left: 0, top: 0 },
  done: {
    backgroundColor: STREAK_EMBER, borderWidth: LINE, borderColor: INK,
    borderBottomWidth: 5, borderBottomColor: STREAK_DEEP,
  },
  discGlint: { position: 'absolute', left: 5, top: 4, width: 7, height: 4, borderRadius: 2, backgroundColor: SHINE },
  dayPing: {
    position: 'absolute', width: DISC, height: DISC, borderRadius: DISC / 2,
    borderWidth: 3, borderColor: STREAK_EMBER,
  },
  rested: { backgroundColor: STREAK_WASH, borderWidth: LINE, borderColor: STREAK_EMBER },
  missed: { backgroundColor: LOCK_FACE, borderWidth: LINE, borderColor: LOCK_EDGE },
  future: { borderWidth: LINE, borderColor: LOCK_EDGE, backgroundColor: PAPER_LIT },

  milestone: {
    fontFamily: 'Inter_700Bold', fontSize: 12, color: STREAK_EMBER,
    letterSpacing: 2.6, marginTop: 24, textAlign: 'center',
  },
  tail: {
    fontFamily: 'PlayfairDisplay_400Regular', fontStyle: 'italic', fontSize: 15,
    color: INK_SOFT, marginTop: 24, textAlign: 'center',
  },

  btn: { borderRadius: 14, paddingVertical: 18, alignItems: 'center', backgroundColor: STREAK_EMBER },
  btnLip: { position: 'absolute', left: 0, right: 0, top: LIP.button, bottom: 0, borderRadius: 14, backgroundColor: STREAK_DEEP },
  // The button's face is the ember, so its label is paper (4.85:1).
  btnText: { fontFamily: 'Inter_700Bold', fontSize: 18, color: PAPER },
});
