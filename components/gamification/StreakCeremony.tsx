import { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withSequence, withTiming, withDelay,
  Easing, type SharedValue,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { ramp, rampFace, mix, PAPER_LIT } from '@/components/shared/tone';
import { GILT, GILT_DEEP, GILT_SOFT, nextMilestone, STREAK_MILESTONES } from '@/constants/streak';
import { buildWeek } from '@/lib/utils/streakCalendar';
import { LIP } from '@/constants/design';
import { cue } from '@/lib/feedback';

const INK = '#1A1A1A';
const INK_SOFT = '#6B6B6B';
const PAPER = '#FAFAF7';
const FAINT = '#E4E1D8';

// ─────────────────────────────────────────────────────────────────────────────
// THE STREAK CEREMONY — the day being struck into the ledger.
//
// This takes the whole screen, immediately after Finish and BEFORE the XP
// summary, in the same slot RankUpScreen already owns. It is the one animation
// that decides whether somebody comes back tomorrow, and until now it was a
// paragraph-sized panel three quarters of the way down a scrolling receipt.
//
// ── WHAT THE READER SAID, AND WHICH HALF WAS WHICH ──────────────────────────
//
//   "I like the stamp, but it looks kinda boring. And, also, I don't like the
//    words on the screen. It implies that the user should be done for the day
//    and doesn't make them want to try doing another lesson. And, also, there is
//    no really big animation for the increase in streak."
//
// Three faults, and the middle one was hiding in plain sight: the legend on the
// stamp read **DAY DONE**. It was chosen by measuring four candidates against
// the real `.ttf` and taking the one that fitted — a genuinely good method
// applied to the wrong question. Nothing ever asked whether the words told the
// reader to stop, and they did, on the one screen whose entire job is to make
// tomorrow feel worth turning up for.
//
// It reads IN INK now. That is not a softer way of saying the same thing: a day
// DONE is a task closed, and a day IN INK is a mark on a record that is still
// being written. It also sets at 17.25px against DAY DONE's 12.5 — the words
// that do not say "finished" are shorter, so fixing the meaning made the stamp
// 38% more legible. `check:streak` re-measures the fit against the chord.
//
// ── WHY A CEREMONY AND NOT A BIGGER PANEL ───────────────────────────────────
//
// Duolingo's own write-up of their streak animation puts the gain at +1.7% D7
// retention for the ANIMATION ALONE, and their stated method is that the object
// itself changes on a milestone — "like a power-up" — rather than a number
// getting bigger. You cannot do that in 90pt of a ScrollView underneath an XP
// counter. The screen is the room the strike needs.
//
// ── THE ORDER IS THE DESIGN ─────────────────────────────────────────────────
//
// Each step begins as the one before it lands. RankUpScreen states the same rule
// and it is the reason that screen works; played as a chord this is the same
// information and a fraction of the feeling.
//
//   1. THE PAGE, BEFORE    — the week drawn with today's slot EMPTY and the
//                            count still reading the OLD streak. The strike has
//                            to have something to change or it is decoration.
//   2. THE DIE FALLS       — from 1.6x and high above, ACCELERATING. `Easing.in`
//                            is the half everyone gets backwards; `Easing.out`
//                            decelerates into the paper, which reads as a thing
//                            inflating rather than landing.
//   3. CONTACT             — squash, recoil, settle. The press ring leaves the
//                            rim. The PAGE KICKS three units and comes back.
//                            Gold leaf scatters. This is the frame everything
//                            else keys off.
//   4. THE INK SPREADS     — the legend appears AFTER the die is down, never
//                            with it: ink that fades in during the fall is
//                            painted on the object; ink that arrives once it has
//                            landed was left behind by it.
//   5. THE COUNT           — from the old streak, starting ON CONTACT. Brilliant
//                            names this in their own write-up: the count has to
//                            be "seamlessly aligned" with the strike or it reads
//                            as a clock running rather than as something the
//                            reader caused.
//   6. THE FOIL SWEEP      — a specular band travels across the face. One
//                            translating gradient, clipped to the disc. It is
//                            the cheapest "this is metal" signal there is, and
//                            the only one a static gradient cannot give.
//   7. THE CHAIN DRAWS     — through the days already earned, arriving under
//                            today, which is struck in miniature as it gets
//                            there. The sequence ends on the day just won.
//
// ── GOLD LEAF, NOT CONFETTI ─────────────────────────────────────────────────
//
// The burst is cut from GILT's own ramp plus paper — RankUpScreen's rule ("cut
// from the order, not from ink: a celebration that does not know what it is
// celebrating"), one metal along. Flakes leave from the seal's RIM rather than
// its centre, which is the other thing that screen learned the hard way:
// launched from the middle they cross the face and read as the mark shattering.
//
// ── WHY THE COUNT IS setState AND NOT A WORKLET ─────────────────────────────
//
// Reanimated cannot drive a Text's CONTENT from the UI thread, only its style.
// A count-up has to cross to JS whatever it does, so it is an interval rather
// than a shared value pretending to be one. It runs ~700ms and ticks at most a
// dozen times; the seal, the leaf, the sweep and the rail all animate every
// frame and stay on the UI thread where they belong.
// ─────────────────────────────────────────────────────────────────────────────

const METAL = ramp(GILT);
const FACE = rampFace(METAL);
const RAIL = mix(GILT, PAPER, 0.62);
const GROOVE: [string, string, string] = [
  mix(RAIL, INK, 0.16), RAIL, mix(RAIL, PAPER_LIT, 0.5),
];
const LIGHT_START = { x: 0.15, y: 0 } as const;
const LIGHT_END = { x: 0.85, y: 1 } as const;

// ── the seal, at ceremony scale ─────────────────────────────────────────────
// The reward panel draws this object at a 54 face; here it is the hero, so it is
// drawn at 152 and every part of it scales from that one number rather than
// being retyped. BOX leaves room for the collar and for the press ring to travel
// beyond the rim without being clipped.
const SEAL = 152;
const BOX = 196;

// ── WHAT THE STAMP SAYS ─────────────────────────────────────────────────────
//
// A blank disc is a token; a disc with a legend on it is a STAMP, and the legend
// is most of what makes the strike land. Set crooked on purpose — a hand-held
// stamp never comes down square, and a legend at a true zero degrees reads as a
// logo rather than as an impression.
//
// THE LENGTH IS THE BOX, NOT A PREFERENCE. Two stacked lines straddle the
// centre, so the worst line sits half a line-height out, where the chord through
// the ring is narrowest. Measured against the real Special Elite `.ttf` in plain
// Node (the same reader `check:fits` uses — a character count is not a width):
//
//   IN INK     fits to 17.25px at the panel's 44 ring     <- ships
//   NO GAP     17.25px                                    considered
//   AND ON     16.50px                                    considered
//   DAY DONE   12.50px                                    what this replaces
//   UNBROKEN    6.25px — one line, and unreadable for it
//
// `check:streak` re-derives the chord from the constants below, so a longer
// legend fails the build rather than the phone.
const STAMP = ['IN', 'INK'] as const;
const STAMP_RING = 116;
const STAMP_SIZE = 44;
const STAMP_TILT = '-8deg';

// ── the week ────────────────────────────────────────────────────────────────
// Fixed geometry, not measured. A rail runs from the centre of one token to the
// centre of another, and a centre is not knowable inside a `space-between` row.
// Seven equal columns of a known width makes the arithmetic exact, and costs no
// layout pass and no state.
const PITCH = 42;
const DISC = 26;

// ── the timeline, in ms from mount. Each is the moment that step BEGINS ──────
const T_HOLD = 320;                      // the page, before — long enough to read
const D_FALL = 260;
const T_LAND = T_HOLD + D_FALL;          // 580 — CONTACT
const T_INK = T_LAND + 70;
const T_SWEEP = T_LAND + 240;
const T_RAIL = T_LAND + 520;
const D_RAIL = 430;
const T_DAY = T_RAIL + D_RAIL - 90;      // the day lands as the chain reaches it
const T_TAIL = T_DAY + 340;
const T_CTA = T_TAIL + 260;
const COUNT_MS = 700;

/** Exported so the caller can time a sound to the frame the die lands on. */
export const T_STRIKE = T_LAND;

// ── gold leaf ───────────────────────────────────────────────────────────────
// Deterministic per mount so a flake never re-randomises mid-flight, and spread
// by a decorrelated hash — stepping x and y from one index marches them into a
// diagonal streak instead of a burst.
const hash = (n: number) => {
  const v = Math.sin(n * 12.9898) * 43758.5453;
  return v - Math.floor(v);
};

interface Flake {
  angle: number; dist: number; w: number; h: number;
  spin: number; delay: number; drop: number; tone: number;
}

/** Flakes leave from the RIM, not the centre — see the header. */
const START_R = SEAL / 2 - 4;

function makeFlakes(n: number): Flake[] {
  const out: Flake[] = [];
  for (let i = 0; i < n; i++) {
    const base = (i / n) * Math.PI * 2;
    out.push({
      angle: base + (hash(i * 3.1) - 0.5) * 0.55,
      dist: 30 + hash(i * 7.7) * 108,
      // Leaf, not confetti: thin and small. A scrap the size of RankUpScreen's
      // reads as paper, which is the one material this burst must not be.
      w: 3 + hash(i * 5.3) * 3.5,
      h: 6 + hash(i * 9.1) * 7,
      spin: (hash(i * 2.3) - 0.5) * 820,
      delay: hash(i * 4.7) * 0.16,
      drop: 34 + hash(i * 8.9) * 60,
      tone: Math.floor(hash(i * 6.1) * 4),
    });
  }
  return out;
}

function Leaf({ f, burst, tones }: { f: Flake; burst: SharedValue<number>; tones: string[] }) {
  const st = useAnimatedStyle(() => {
    const u = Math.max(0, Math.min(1, (burst.value - f.delay) / (1 - f.delay)));
    const out = 1 - Math.pow(1 - u, 2.2);        // fast away, easing to a stop
    const r = START_R + f.dist * out;
    return {
      opacity: u <= 0 ? 0 : 1 - Math.max(0, (u - 0.6) / 0.4),
      transform: [
        { translateX: Math.cos(f.angle) * r },
        { translateY: Math.sin(f.angle) * r + f.drop * out * out },
        { rotate: `${f.spin * out}deg` },
        { scale: 0.5 + 0.5 * Math.min(1, u * 4) },
      ],
    };
  });
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          width: f.w,
          height: f.h,
          borderRadius: 0.5,
          backgroundColor: tones[f.tone],
          // The paper flake needs an edge or it is invisible on paper.
          borderWidth: f.tone === 3 ? 0.8 : 0,
          borderColor: METAL.shade,
        },
        st,
      ]}
    />
  );
}

// ── the words ───────────────────────────────────────────────────────────────
// Nothing here may say the day is finished. The eyebrow names the RUN, which is
// the thing the week rail underneath is already drawing, and the tail always
// points at something ahead of the reader.
const LANDMARK: Record<number, string> = {
  7: 'a week', 30: 'a month', 100: 'a hundred', 365: 'a year',
};

export const EYEBROWS = ['THE RUN BEGINS', 'THE RUN HOLDS', 'THE RUN CONTINUES'] as const;

function eyebrowFor(prevStreak: number, restSpent: number): string {
  if (restSpent > 0) return EYEBROWS[1];
  return prevStreak === 0 ? EYEBROWS[0] : EYEBROWS[2];
}

/**
 * THE LINE THAT REPLACES "DONE".
 *
 * Ordered so the strongest true thing wins. The invitation is second because it
 * is the only line that can ask for another lesson, and it is offered ONLY when
 * one actually exists: `FREE_DAILY_LESSON_LIMIT` is 1, so for most readers
 * Continue leads to an ad and the Pass, and "go again" would be a screen telling
 * somebody to do a thing the next screen refuses them.
 */
function tailFor(streak: number, moreToday: boolean): string {
  const next = nextMilestone(streak);
  if (moreToday) return 'Another one is ready when you are.';
  if (next) {
    const gap = next - streak;
    return `${gap} more and it is ${LANDMARK[next] ?? `${next} days`}.`;
  }
  // Past every landmark and out of lessons: name the next DAY rather than asking
  // for a return visit. "Come back tomorrow" was written here first and
  // `check:streak` refused it, correctly — pointing at what is ahead is the
  // mechanism of a streak, but asking the reader to leave and return is the
  // screen closing the session, which is the whole fault being fixed.
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
  const [shown, setShown] = useState(prevStreak);
  const [ready, setReady] = useState(false);
  const [down, setDown] = useState(false);
  const skipped = useRef(false);
  const counting = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hitMilestone = STREAK_MILESTONES.includes(streak as 7 | 30 | 100 | 365);
  // A landmark day gets more of everything the ordinary day gets — the object
  // itself changes, which is Duolingo's own stated milestone rule.
  const flakes = useMemo(() => makeFlakes(hitMilestone ? 44 : 26), [hitMilestone]);
  const tones = useMemo(() => [METAL.lit, GILT, METAL.shade, PAPER], []);

  const sealIn = useSharedValue(0);
  const sealScale = useSharedValue(1.6);
  const sealDrop = useSharedValue(-120);
  const shadow = useSharedValue(0);
  const press = useSharedValue(0);
  const burst = useSharedValue(0);
  const kick = useSharedValue(0);
  const stampIn = useSharedValue(0);
  const sweep = useSharedValue(0);
  const chain = useSharedValue(0);
  const dayIn = useSharedValue(0);
  const dayScale = useSharedValue(1.55);
  const dayPress = useSharedValue(0);
  const tail = useSharedValue(0);
  const cta = useSharedValue(0);

  useEffect(() => {
    sealIn.value = withDelay(T_HOLD, withTiming(1, { duration: 90 }));
    // ACCELERATING ON THE WAY DOWN. See the header — this is the single choice
    // that separates a die landing from a bubble inflating.
    sealScale.value = withDelay(T_HOLD, withSequence(
      withTiming(0.94, { duration: D_FALL, easing: Easing.in(Easing.cubic) }),
      withTiming(1.06, { duration: 130, easing: Easing.out(Easing.quad) }),
      withTiming(1, { duration: 260, easing: Easing.out(Easing.quad) }),
    ));
    sealDrop.value = withDelay(T_HOLD, withSequence(
      withTiming(4, { duration: D_FALL, easing: Easing.in(Easing.cubic) }),
      withTiming(0, { duration: 390, easing: Easing.out(Easing.quad) }),
    ));
    // The shadow tightens as the die approaches the page — the depth cue that
    // says this is falling rather than merely shrinking.
    shadow.value = withDelay(T_HOLD, withTiming(1, { duration: D_FALL, easing: Easing.in(Easing.cubic) }));
    press.value = withDelay(T_LAND, withTiming(1, { duration: 560, easing: Easing.out(Easing.quad) }));
    burst.value = withDelay(T_LAND, withTiming(1, { duration: 1150, easing: Easing.linear }));
    // THE PAGE TAKES THE BLOW. Three units, one bounce. Game-feel calls this
    // screen shake; at premium restraint it is the difference between the page
    // being hit and the seal merely arriving on top of it.
    kick.value = withDelay(T_LAND, withSequence(
      withTiming(3, { duration: 70, easing: Easing.out(Easing.quad) }),
      withTiming(0, { duration: 300, easing: Easing.out(Easing.cubic) }),
    ));
    stampIn.value = withDelay(T_INK, withTiming(1, { duration: 200, easing: Easing.out(Easing.quad) }));
    // Twice on a landmark, so the metal reads as richer rather than merely bigger.
    sweep.value = withDelay(T_SWEEP, hitMilestone
      ? withSequence(
          withTiming(1, { duration: 620, easing: Easing.inOut(Easing.quad) }),
          withTiming(0, { duration: 0 }),
          withTiming(1, { duration: 620, easing: Easing.inOut(Easing.quad) }),
        )
      : withTiming(1, { duration: 700, easing: Easing.inOut(Easing.quad) }));
    chain.value = withDelay(T_RAIL, withTiming(1, { duration: D_RAIL, easing: Easing.out(Easing.cubic) }));
    dayIn.value = withDelay(T_DAY, withTiming(1, { duration: 90 }));
    dayScale.value = withDelay(T_DAY, withSequence(
      withTiming(0.9, { duration: 170, easing: Easing.in(Easing.cubic) }),
      withTiming(1.08, { duration: 120, easing: Easing.out(Easing.quad) }),
      withTiming(1, { duration: 220, easing: Easing.out(Easing.quad) }),
    ));
    dayPress.value = withDelay(T_DAY + 170, withTiming(1, { duration: 460, easing: Easing.out(Easing.quad) }));
    tail.value = withDelay(T_TAIL, withTiming(1, { duration: 320 }));
    cta.value = withDelay(T_CTA, withTiming(1, { duration: 280 }));
    // THE STRIKE IS HEARD AND FELT ON THE FRAME IT LANDS, which is the whole
    // reason `T_STRIKE` is exported. Scheduled rather than fired from a worklet:
    // `cue` reads a store and touches the haptics API, and neither belongs on
    // the UI thread. Cleared on unmount so a reader who taps straight through
    // does not get a thump on a screen they have already left.
    const strike = setTimeout(() => cue('seal'), T_STRIKE);
    const id = setTimeout(() => setReady(true), T_CTA + 280);
    return () => { clearTimeout(strike); clearTimeout(id); };
  }, [
    sealIn, sealScale, sealDrop, shadow, press, burst, kick, stampIn, sweep,
    chain, dayIn, dayScale, dayPress, tail, cta, hitMilestone,
  ]);

  // THE COUNT STARTS ON CONTACT, not on a delay of its own — otherwise on a slow
  // frame the number can start moving before the seal has landed and the two
  // read as unrelated events.
  useEffect(() => {
    if (streak === prevStreak) { setShown(streak); return; }
    const steps = Math.min(streak - prevStreak, 12);
    if (steps <= 0) { setShown(streak); return; }
    const every = COUNT_MS / steps;
    let i = 0;
    counting.current = setTimeout(() => {
      const id = setInterval(() => {
        i += 1;
        setShown(prevStreak + Math.round(((streak - prevStreak) * i) / steps));
        if (i >= steps) clearInterval(id);
      }, every);
      counting.current = null;
    }, T_LAND);
    return () => { if (counting.current) clearTimeout(counting.current); };
  }, [streak, prevStreak]);

  // A tap runs the whole thing to its end state, for anyone who has seen it
  // before. Same affordance RankUpScreen offers, and for the same reason: a
  // ceremony nobody can get past is a toll.
  const skip = () => {
    if (skipped.current || ready) return;
    skipped.current = true;
    if (counting.current) { clearTimeout(counting.current); counting.current = null; }
    const q = { duration: 220, easing: Easing.out(Easing.cubic) };
    sealIn.value = withTiming(1, q);
    sealScale.value = withTiming(1, q);
    sealDrop.value = withTiming(0, q);
    shadow.value = withTiming(1, q);
    press.value = withTiming(1, q);
    burst.value = withTiming(1, { duration: 300, easing: Easing.linear });
    kick.value = withTiming(0, q);
    stampIn.value = withTiming(1, q);
    sweep.value = withTiming(1, q);
    chain.value = withTiming(1, q);
    dayIn.value = withTiming(1, q);
    dayScale.value = withTiming(1, q);
    dayPress.value = withTiming(1, q);
    tail.value = withTiming(1, q);
    cta.value = withTiming(1, q);
    setShown(streak);
    setReady(true);
  };

  const pageStyle = useAnimatedStyle(() => ({ transform: [{ translateY: kick.value }] }));
  const sealStyle = useAnimatedStyle(() => ({
    opacity: sealIn.value,
    transform: [{ translateY: sealDrop.value }, { scale: sealScale.value }],
  }));
  // Wide and soft while it is high, tight and dark as it arrives — and it has to
  // finish TUCKED UNDER the seal. Rendered, the first version settled as a grey
  // ellipse sitting in the gap below the disc, which reads as a smudge on the
  // page rather than as contact: a shadow separated from the thing casting it is
  // not a shadow. It closes to 60% of the seal's width and rides up under it.
  const shadowStyle = useAnimatedStyle(() => ({
    opacity: 0.04 + shadow.value * 0.11,
    transform: [
      // DOWN AND TO THE RIGHT. One light, top-left, and it never moves — the
      // rule every pin, badge, certificate and quote plate in the app is struck
      // by. A shadow centred under the disc is lit from directly above, which is
      // a second light source, and it is what made this read as a smudge rather
      // than as the seal sitting on the page.
      { translateX: shadow.value * 9 },
      { translateY: shadow.value * 7 },
      { scaleX: 1.15 - shadow.value * 0.55 },
      { scaleY: 0.5 - shadow.value * 0.26 },
    ],
  }));
  // THE PRESS leaves the seal's own edge, so it starts at scale 1 and grows —
  // starting from nothing would read as a second object arriving rather than as
  // the shock of the first one landing.
  const pressStyle = useAnimatedStyle(() => ({
    opacity: (1 - press.value) * 0.5,
    transform: [{ scale: 1 + press.value * 0.55 }],
  }));
  const stampStyle = useAnimatedStyle(() => ({
    opacity: stampIn.value,
    transform: [{ rotate: STAMP_TILT }, { scale: 1 + (1 - stampIn.value) * 0.06 }],
  }));
  // The specular band crosses the whole face and a little beyond, so it enters
  // and leaves rather than appearing in the middle of the metal.
  const sweepStyle = useAnimatedStyle(() => ({
    opacity: sweep.value > 0 && sweep.value < 1 ? 1 : 0,
    transform: [{ translateX: -SEAL + sweep.value * (SEAL * 2) }, { rotate: '18deg' }],
  }));
  const dayStyle = useAnimatedStyle(() => ({
    opacity: dayIn.value,
    transform: [{ scale: dayScale.value }],
  }));
  const dayPressStyle = useAnimatedStyle(() => ({
    opacity: (1 - dayPress.value) * 0.55,
    transform: [{ scale: 1 + dayPress.value * 1.05 }],
  }));
  const tailStyle = useAnimatedStyle(() => ({ opacity: tail.value }));
  const ctaStyle = useAnimatedStyle(() => ({
    opacity: cta.value,
    transform: [{ translateY: (1 - cta.value) * 10 }],
  }));

  // TODAY IS UNIONED IN, and this is not a nicety. The reward flow writes
  // NOTHING until Continue is pressed — everything here is a preview computed
  // from the store without touching it — so `activeDays` does not contain today
  // yet, and a week built straight from the store would draw today as an empty
  // ring at the exact instant the screen is congratulating the reader for
  // filling it. This screen's job is the state AFTER this lesson counts.
  const week = buildWeek({
    active: new Set([...activeDays, today]),
    rest: new Set([...restDays, ...(pendingRest ?? [])]),
    today,
    since,
  });
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
    <Pressable style={styles.root} onPress={skip}>
      <Animated.View style={[styles.center, pageStyle]}>
        <Text style={styles.eyebrow}>{eyebrowFor(prevStreak, restSpent)}</Text>

        {/* ── 1-4 · the die, the press, the leaf, the ink ──────────────────── */}
        <View style={styles.markWrap}>
          <Animated.View pointerEvents="none" style={[styles.shadow, shadowStyle]} />

          <Animated.View style={[styles.seal, sealStyle]}>
            <Animated.View pointerEvents="none" style={[styles.pressRing, pressStyle]} />
            {hitMilestone ? <View pointerEvents="none" style={styles.collar} /> : null}
            <LinearGradient
              colors={[FACE[0][1], FACE[1][1], FACE[2][1]]}
              locations={[0, 0.52, 1]}
              start={LIGHT_START}
              end={LIGHT_END}
              style={styles.sealFace}
            >
              {/* THE FOIL SWEEP, clipped to the disc by the face's own radius. */}
              <Animated.View pointerEvents="none" style={[styles.sweep, sweepStyle]}>
                <LinearGradient
                  colors={['rgba(255,252,245,0)', 'rgba(255,252,245,0.55)', 'rgba(255,252,245,0)']}
                  locations={[0, 0.5, 1]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFill}
                />
              </Animated.View>

              {/* THE IMPRESSION — a ruled ring and a crooked legend inside it.
                  The words are INK with a PAPER-coloured shadow down-right,
                  which is the app's own emboss read backwards: light below a
                  dark mark is what a shape pressed INTO a surface does. Type on
                  a 135° gradient has no single contrast, and the shadow is what
                  carries the legend across the shaded half. */}
              <Animated.View pointerEvents="none" style={[styles.stamp, stampStyle]}>
                <View style={styles.stampRing} />
                {STAMP.map((word) => (
                  <Text key={word} style={styles.stampWord}>{word}</Text>
                ))}
              </Animated.View>
            </LinearGradient>
          </Animated.View>

          {/* Above the seal in paint order so leaf lands ON the metal, not under
              it — and outside the seal's transform so the squash never scales a
              flake in flight. */}
          <View pointerEvents="none" style={styles.leafOrigin}>
            {flakes.map((f, i) => <Leaf key={i} f={f} burst={burst} tones={tones} />)}
          </View>
        </View>

        {/* ── 5 · the count ────────────────────────────────────────────────── */}
        <Text style={styles.count}>{shown}</Text>
        <Text style={styles.dayWord}>{shown === 1 ? 'DAY' : 'DAYS'}</Text>

        {restSpent > 0 && (
          <Text style={styles.restNote}>
            {restSpent === 1 ? 'A day of rest covered yesterday.' : `${restSpent} rest days covered the gap.`}
          </Text>
        )}

        {/* ── 7 · the chain, and today struck at the end of it ─────────────── */}
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

        {/* ── the line that used to say the day was over ───────────────────── */}
        <Animated.View style={tailStyle}>
          {hitMilestone ? (
            <Text style={styles.milestone}>{streak} DAYS · A LANDMARK</Text>
          ) : (
            <Text style={styles.tail}>{tailFor(streak, moreToday)}</Text>
          )}
        </Animated.View>
      </Animated.View>

      {/* THE WAY OUT, on a ledge rather than a fade. Dimming on press is what a
          DISABLED control does; every other button in the app depresses into its
          own lip. */}
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

const styles = StyleSheet.create({
  // CLIPPED, because the leaf is thrown further than the screen is wide. A flake
  // leaves the rim at 72 and travels up to 138 more, which is 210 from a centre
  // that sits 195 from the edge — so without this the burst extends the document
  // and the whole page can be scrolled sideways. Flakes fading out past the edge
  // is what a burst should do; a page that scrolls is not.
  root: { flex: 1, backgroundColor: PAPER, paddingHorizontal: 28, paddingBottom: 40, paddingTop: 60, overflow: 'hidden' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  eyebrow: {
    fontFamily: 'Inter_700Bold', fontSize: 12, letterSpacing: 4,
    color: INK_SOFT, marginBottom: 26,
  },

  markWrap: { width: BOX, height: BOX, alignItems: 'center', justifyContent: 'center' },
  shadow: {
    position: 'absolute', bottom: (BOX - SEAL) / 2 - 6,
    width: SEAL, height: 26, borderRadius: 13, backgroundColor: INK,
  },
  seal: { width: SEAL, height: SEAL, alignItems: 'center', justifyContent: 'center' },
  sealFace: {
    width: SEAL, height: SEAL, borderRadius: SEAL / 2,
    borderWidth: 1.5, borderColor: METAL.rim,
    alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
  },
  sweep: {
    position: 'absolute', top: -SEAL * 0.5,
    width: SEAL * 0.42, height: SEAL * 2,
  },
  stamp: {
    position: 'absolute', width: STAMP_RING, height: STAMP_RING,
    alignItems: 'center', justifyContent: 'center',
    // OPTICALLY CENTRED, NOT BOX-CENTRED. Flex centres the two line boxes on the
    // ring exactly; the INK still sits high, because Special Elite carries its
    // caps near the top of the em box and reserves the rest for descenders an
    // all-caps legend never uses.
    paddingTop: 8,
  },
  stampRing: {
    position: 'absolute', width: STAMP_RING, height: STAMP_RING, borderRadius: STAMP_RING / 2,
    borderWidth: 2, borderColor: METAL.rim, opacity: 0.55,
  },
  stampWord: {
    fontFamily: 'SpecialElite_400Regular',
    fontSize: STAMP_SIZE,
    lineHeight: STAMP_SIZE * 1.06,
    letterSpacing: 0.6,
    color: INK,
    // includeFontPadding is what put the league numeral low in its disc. A
    // typewriter face carries deep, asymmetric padding, so two stacked lines
    // inside a ring are centred on the box rather than on the glyphs without it.
    includeFontPadding: false,
    textAlign: 'center',
    textShadowColor: 'rgba(255, 252, 245, 0.5)',
    textShadowOffset: { width: 1, height: 1.6 },
    textShadowRadius: 1.2,
  },
  collar: {
    position: 'absolute', width: SEAL + 20, height: SEAL + 20, borderRadius: (SEAL + 20) / 2,
    borderWidth: 3, borderColor: GILT_DEEP,
  },
  pressRing: {
    position: 'absolute', width: SEAL, height: SEAL, borderRadius: SEAL / 2,
    borderWidth: 3, borderColor: GILT,
  },
  leafOrigin: {
    position: 'absolute', left: BOX / 2, top: BOX / 2,
    width: 0, height: 0, alignItems: 'center', justifyContent: 'center',
  },

  count: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 84,
    color: GILT,
    marginTop: 18,
    includeFontPadding: false,
  },
  dayWord: {
    fontFamily: 'Inter_700Bold', fontSize: 11, color: INK_SOFT,
    letterSpacing: 3.4, marginTop: 4,
  },

  restNote: {
    fontFamily: 'PlayfairDisplay_400Regular', fontStyle: 'italic', fontSize: 13,
    color: INK_SOFT, marginTop: 12, textAlign: 'center',
  },

  week: { flexDirection: 'row', marginTop: 26 },
  dayCol: { alignItems: 'center' },
  dayLabel: { fontFamily: 'Inter_500Medium', fontSize: 10, color: INK_SOFT, marginBottom: 7 },
  dayLabelOn: { color: INK, fontFamily: 'Inter_700Bold' },
  // The rail sits behind the tokens and is measured from the row's own left
  // edge, so its top must clear the weekday labels above it.
  railWrap: { position: 'absolute', top: 24, height: 10, overflow: 'hidden', borderRadius: 5 },
  rail: { flex: 1, borderRadius: 5 },
  discBox: { width: DISC, height: DISC, alignItems: 'center', justifyContent: 'center' },
  disc: { width: DISC, height: DISC, borderRadius: DISC / 2 },
  dayPressRing: {
    position: 'absolute', width: DISC, height: DISC, borderRadius: DISC / 2,
    borderWidth: 1.5, borderColor: GILT,
  },
  rested: { backgroundColor: GILT_SOFT, borderWidth: 1, borderColor: GILT },
  missed: { borderWidth: 1.5, borderColor: FAINT },
  future: { borderWidth: 1.5, borderColor: FAINT, opacity: 0.55 },

  milestone: {
    fontFamily: 'Inter_700Bold', fontSize: 12, color: GILT,
    letterSpacing: 2.6, marginTop: 26, textAlign: 'center',
  },
  tail: {
    fontFamily: 'PlayfairDisplay_400Regular', fontStyle: 'italic', fontSize: 15,
    color: INK_SOFT, marginTop: 26, textAlign: 'center',
  },

  btn: { borderRadius: 14, paddingVertical: 18, alignItems: 'center', backgroundColor: GILT },
  btnLip: { position: 'absolute', left: 0, right: 0, top: LIP.button, bottom: 0, borderRadius: 14, backgroundColor: GILT_DEEP },
  btnText: { fontFamily: 'Inter_700Bold', fontSize: 18, color: PAPER },
});
