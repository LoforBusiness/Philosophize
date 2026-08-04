import { useEffect, useRef, useState } from 'react';
import { Modal, View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import Animated, {
  useSharedValue, useAnimatedStyle, withDelay, withTiming, Easing,
} from 'react-native-reanimated';
import StreakBook from '@/components/gamification/StreakBook';
import StreakWeek from '@/components/gamification/StreakWeek';
import RankUpScreen from '@/components/gamification/RankUpScreen';
import RewardLoafer, { pickLine } from '@/components/gamification/RewardLoafer';
import BadgeEarned, { BadgeEarnedHeading } from '@/components/gamification/BadgeEarned';
import { RANKS, rankForXP, type RankDef } from '@/data/ranks';
import type { BadgeDef } from '@/data/badges';
import { getLessonUnitInfo } from '@/data';
import { useUserDataStore, previewDailyActivity, previewNewBadges, type DayInfo } from '@/stores/userDataStore';
import { restDaysHeld } from '@/constants/streak';
import NotifyPrompt from './NotifyPrompt';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { useUIStore } from '@/stores/uiStore';
import { ads } from '@/lib/ads';
import { FREE_DAILY_LESSON_LIMIT } from '@/constants/subscription';
import {
  XP_PER_LESSON_COMPLETION, XP_PER_CORRECT_ANSWER, XP_PER_PERFECT_LESSON,
} from '@/constants/xp';
import { track } from '@/lib/posthog';
import { cue } from '@/lib/feedback';
import { refreshQuoteWidget } from '@/lib/widget/render';

interface Props {
  xp: number;
  correct: number;
  total: number;
  branchSlug: string | null;
  lessonId: string;
  onDone: () => void;
}

// Light reward screen: ink text/marks on paper; the ink button keeps paper text.
const Ink = '#1A1A1A';
const InkSoft = '#6B6B6B';
const Rule = '#E4E1D8';
const Paper = '#FAFAF7';

function dateStr(d: Date) {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

// Imported rather than re-declared. The local copy of this shape drifted the
// moment the store's grew a field, and a screen whose job is to promise exactly
// what the store will write cannot afford its own idea of the shape.

// ─────────────────────────────────────────────────────────────────────────────
// THE NUMBER, INKED ON.
//
// It used to arrive on a spring — scale 0.6 → 1 at damping 11, which overshoots and
// wobbles, and a wobbling number reads as a cheap toy rather than as a result. This
// draws it instead: a paper-coloured cover slides off left-to-right, so the digits
// appear the way a stroke appears under a nib, while the value counts up underneath.
// No bounce anywhere in it.
//
// IT IS SET IN CAVEAT, WHICH IS WHY THE DIGITS GET THEIR OWN CELLS.
//
// Playfair is the app's headline face and it was wrong here — a high-contrast Didone
// number is the most PRINTED thing on a screen whose whole identity is a pen. Caveat
// is the hand, and the moment the number is handwritten the count-up has to change
// too: a script face has no tabular figures at all, its 1 is less than half the width
// of its 6, so a value climbing 0 → 7 → 43 → 60 re-centres itself on almost every
// frame. The count wasn't "quick", it was sliding around underneath itself.
//
// So each digit gets a fixed cell, right-aligned, as many cells as the FINAL value
// needs and blank ones to the left until it reaches them. Nothing moves horizontally
// for the whole count — the digits just change, which is what a counter should do.
// ─────────────────────────────────────────────────────────────────────────────
const XP_SIZE = 104;
// Caveat's digits run about 0.5em; the cell is a shade wider so the widest of them
// has room to centre without touching its neighbour or the wipe's clip edge.
const XP_CELL = Math.round(XP_SIZE * 0.54);

function InkedNumber({ value, delay }: { value: number; delay: number }) {
  const [shown, setShown] = useState(0);
  const wipe = useSharedValue(0);
  const cells = Math.max(1, String(Math.max(0, value)).length);
  const w = cells * XP_CELL;

  useEffect(() => {
    wipe.value = withDelay(delay, withTiming(1, { duration: 760, easing: Easing.out(Easing.cubic) }));
    if (value <= 0) return;
    const DURATION = 980;
    const t0 = Date.now() + delay;
    const id = setInterval(() => {
      const t = Math.min(1, (Date.now() - t0) / DURATION);
      if (t < 0) return;
      const eased = 1 - Math.pow(1 - t, 3);
      setShown(Math.round(eased * value));
      if (t >= 1) clearInterval(id);
    }, 16);
    return () => clearInterval(id);
  }, [value]);

  const cover = useAnimatedStyle(() => ({ transform: [{ translateX: wipe.value * (w + 12) }] }));

  // Right-aligned into the fixed cells: 7 is [ ][7], 60 is [6][0], and the 6 lands in
  // the cell the blank was holding rather than shoving the 7 sideways.
  const digits = String(shown).padStart(cells, ' ').split('');

  return (
    <View style={[styles.xpNumWrap, { width: w, height: Math.round(XP_SIZE * 1.02) }]}>
      {digits.map((d, k) => (
        <Text key={k} style={[styles.xpNumber, { left: k * XP_CELL, width: XP_CELL }]}>
          {d === ' ' ? '' : d}
        </Text>
      ))}
      <Animated.View style={[styles.wipeCover, cover]} pointerEvents="none" />
    </View>
  );
}

/** A rule that draws itself on, left to right. */
function DrawnRule({ delay, width = '100%' as const }: { delay: number; width?: any }) {
  const v = useSharedValue(0);
  useEffect(() => {
    v.value = withDelay(delay, withTiming(1, { duration: 520, easing: Easing.out(Easing.cubic) }));
  }, []);
  const st = useAnimatedStyle(() => ({ transform: [{ scaleX: v.value }] }));
  return <Animated.View style={[styles.drawnRule, { width }, st]} />;
}

/** One line of the tally, sliding up as it lands. */
function TallyRow({ label, amount, delay }: { label: string; amount: number; delay: number }) {
  const v = useSharedValue(0);
  useEffect(() => {
    v.value = withDelay(delay, withTiming(1, { duration: 340, easing: Easing.out(Easing.cubic) }));
  }, []);
  const st = useAnimatedStyle(() => ({
    opacity: v.value,
    transform: [{ translateY: (1 - v.value) * 7 }],
  }));
  return (
    <Animated.View style={[styles.tallyRow, st]}>
      <Text style={styles.tallyLabel}>{label}</Text>
      <View style={styles.tallyLead} />
      <Text style={styles.tallyAmount}>+{amount}</Text>
    </Animated.View>
  );
}

export default function LessonReward({ xp, correct, total, branchSlug, lessonId, onDone }: Props) {
  const recordLessonComplete = useUserDataStore((s) => s.recordLessonComplete);
  const registerDailyActivity = useUserDataStore((s) => s.registerDailyActivity);
  const bumpDailyLessons = useUserDataStore((s) => s.bumpDailyLessons);
  const seedReview = useUserDataStore((s) => s.seedReview);
  const lastLessonDate = useUserDataStore((s) => s.lastLessonDate);
  const dailyLessonCount = useUserDataStore((s) => s.dailyLessonCount);
  const dailyLessonDate = useUserDataStore((s) => s.dailyLessonDate);

  const isPro = useSubscriptionStore((s) => s.isPro);
  const openPaywall = useUIStore((s) => s.openPaywall);
  const markLessonFinished = useUIStore((s) => s.markLessonFinished);

  const ran = useRef(false);
  const [info, setInfo] = useState<DayInfo | null>(null);
  const [advancing, setAdvancing] = useState(false);
  // A rank-up takes the screen FIRST, before XP and the streak — it is the rarest
  // thing that can happen on a completion and it used to pass in total silence.
  // `null` until the completion effect has run, so the reward never paints for a
  // frame before we know whether it has been pre-empted.
  const [phase, setPhase] = useState<'pending' | 'rankup' | 'reward'>('pending');
  const [rankUp, setRankUp] = useState<{ from: RankDef; to: RankDef; next: RankDef | null; totalXP: number } | null>(null);
  // Badges finishing WOULD earn. Like the streak and the rank above, worked out
  // without writing any of it — see previewNewBadges.
  const [badges, setBadges] = useState<BadgeDef[]>([]);

  // Has this free user used up today's allowance? The daily count is NOT bumped
  // until they press the button, so this lesson is not in it yet — hence the + 1.
  const usedToday = dailyLessonDate === dateStr(new Date()) ? dailyLessonCount : 0;
  const atLimit = !isPro && usedToday + 1 >= FREE_DAILY_LESSON_LIMIT;

  // Continue order for FREE users: reward screen → interstitial ad → then, if
  // they've hit the daily cap, the Scholar's Pass slides up as a dismissible
  // option over the lesson list (never a blocking gate). Subscribers and free
  // users with lessons left just return. showInterstitial never throws and
  // resolves even with no ad ready, so navigation is never blocked.
  // ───────────────────────────────────────────────────────────────────────────
  // THE COMPLETION IS COMMITTED HERE, NOT ON MOUNT.
  //
  // It used to run in an effect the moment this screen appeared, which meant a
  // reader could reach the reward, kill the app, reopen it, and find the lesson
  // marked complete — progress, XP, streak and the day's allowance all banked —
  // without ever seeing the interstitial that pays for the free tier. Pressing the
  // button was optional, and skipping it was strictly better for them.
  //
  // So nothing is written until this runs. Everything above is a PREVIEW computed
  // from the store without touching it. Leave before pressing the button and the
  // lesson simply was not finished: no XP, no streak, no unlock, and the lesson is
  // still there to be played again.
  //
  // Order matters. The award is committed FIRST and the ad shown after, so a
  // failed, slow or unavailable ad can never cost someone the lesson they earned —
  // `showInterstitial` already resolves rather than throwing, and this way even a
  // crash mid-ad leaves the progress banked.
  // ───────────────────────────────────────────────────────────────────────────
  const commit = () => {
    if (ran.current) return;
    ran.current = true;
    recordLessonComplete(lessonId, xp);
    const today = dateStr(new Date());
    const yesterday = dateStr(new Date(Date.now() - 86_400_000));
    bumpDailyLessons(today); // count this completion toward the free daily allowance
    // Put this lesson on the review ladder — a clean run enters two rungs up, a
    // fumbled one at the bottom and back tomorrow. This is the ONLY thing the
    // schedule needs from a completion, which is why review needed no new
    // capture path: `correct` and `total` are already in hand here.
    seedReview(lessonId, correct, total);
    const dayInfo = registerDailyActivity(today, yesterday, { isPro });
    track('lesson_completed', {
      branch_slug: branchSlug,
      xp,
      correct,
      total,
      new_streak: dayInfo.streak,
      streak_increased: dayInfo.firstOfDay,
      rest_days_spent: dayInfo.restSpent,
    });
    // The home-screen widget shows the day streak — keep it current (best-effort).
    refreshQuoteWidget();
  };

  // LAND THEM ON THE BRANCH, AND HAND THE MOMENT OVER TO IT.
  //
  // This replaces auto-advance, which pushed straight into the next lesson and was
  // ON by default — so finishing one lesson threw you into another before you had
  // seen anything happen. The work still happened, it just happened off-screen: the
  // dot filling, the line reaching the next lesson, that lesson coming alive. Now
  // the reader is put in front of it.
  //
  // Worked out AFTER `commit()`, not before: the lesson just finished is what moves
  // the count, so a unit read beforehand would be one lesson behind.
  //
  // `router.replace`, not push: the lesson screen is already being popped by
  // `onDone`, and pushing a branch screen on top of a stack that is mid-pop leaves
  // a back button that returns to a finished lesson.
  const goToBranch = () => {
    const info = getLessonUnitInfo(lessonId);
    const slug = branchSlug ?? info?.branchSlug;
    if (!info || !slug) return;
    // The branch screen reads this once, plays the advance, and clears it.
    markLessonFinished({ lessonId, unitId: info.unitId, branchSlug: slug });
    router.replace(`/(app)/branches/${slug}`);
  };

  const handleContinue = async () => {
    if (advancing) return;
    setAdvancing(true);
    commit();
    if (isPro) {
      onDone();
      goToBranch();
      return;
    }
    try {
      await ads.showInterstitial();
    } catch {}
    onDone(); // close the reward + leave the lesson
    // The branch screen first either way, so the celebration is never the thing
    // that gets skipped. A free reader who has just spent their last lesson of the
    // day still sees their progress advance, and the Pass slides up over it.
    goToBranch();
    if (atLimit) openPaywall();
  };

  // What finishing WOULD do, worked out without writing any of it. Both halves
  // mirror the store exactly: the streak via the shared `previewDailyActivity`,
  // and the rank by the same rule `recordLessonComplete` uses — it advances at
  // most ONE tier, and only when the XP has earned at least one.
  useEffect(() => {
    const st = useUserDataStore.getState();
    const earned = rankForXP(st.totalXP + xp).index;
    if (earned > st.rankIndex) {
      setRankUp({
        from: RANKS[st.rankIndex],
        to: RANKS[st.rankIndex + 1],
        next: RANKS[st.rankIndex + 2] ?? null,
        totalXP: st.totalXP + xp,
      });
      setPhase('rankup');
    } else {
      setPhase('reward');
    }
    // Rest days are passed in here for the same reason the rest of this block
    // exists: what the screen PROMISES and what `commit()` later writes have to
    // be the same number. Leave them out and someone who missed a day, and holds
    // a rest day that will save their streak, is shown a "1" that jumps back to
    // their real streak the moment they press Continue.
    const day = previewDailyActivity(
      st.lastLessonDate,
      st.streak,
      dateStr(new Date()),
      dateStr(new Date(Date.now() - 86_400_000)),
      restDaysHeld(st.restDaysEarned, st.restDaysUsed),
    );
    setInfo(day);
    // The streak comes from `day`, not from the store: several badges are keyed
    // on it, and this lesson is very often the one that moves it. Reading the
    // stored value would hold back the badge until the lesson AFTER the one that
    // actually earned it.
    //
    // Three at most. Finishing a single lesson can trip a lesson count, an XP
    // milestone and a unit at once; beyond three the reward screen stops being a
    // reward and becomes a list, and the rest are all still in the Badges tab.
    setBadges(previewNewBadges(st, lessonId, xp, day.streak).slice(0, 3));
    // The chime lands with the screen, not with the XP count-up: this is the
    // moment the lesson ENDED, and the number arriving after it is the detail.
    // Skipped on a rank-up, which pre-empts this screen entirely and has its own
    // moment to sound — two flourishes 300ms apart is a jingle.
    if (earned <= st.rankIndex) cue('reward');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The tally, rebuilt from the same constants the runners award from. Shown only
  // when the parts actually add up to what was awarded — a breakdown that doesn't
  // reconcile is worse than no breakdown.
  const perfect = total > 0 && correct >= total;
  const parts: { label: string; amount: number }[] = [
    { label: 'LESSON COMPLETE', amount: XP_PER_LESSON_COMPLETION },
    ...(correct > 0
      ? [{ label: `${correct} ANSWERED RIGHT`, amount: correct * XP_PER_CORRECT_ANSWER }]
      : []),
    ...(perfect ? [{ label: 'NOTHING MISSED', amount: XP_PER_PERFECT_LESSON }] : []),
  ];
  const tallyAdds = parts.reduce((a, p) => a + p.amount, 0) === xp;

  // Come in behind whatever is actually on screen: the full streak ceremony runs
  // to ~2s, the one-line version is done immediately. A fixed delay would leave
  // dead air on the days the reader has already played.
  const badgeBase = info?.firstOfDay ? 2050 : 1450;

  // One frame of bare paper while the completion effect decides which screen this
  // is. Painting the reward first would flash XP behind a rank-up.
  if (phase === 'pending') {
    return (
      <Modal visible animationType="fade" transparent={false} onRequestClose={handleContinue}>
        <View style={styles.root} />
      </Modal>
    );
  }

  if (phase === 'rankup' && rankUp) {
    return (
      <Modal visible animationType="fade" transparent={false} onRequestClose={handleContinue}>
        <RankUpScreen
          from={rankUp.from}
          to={rankUp.to}
          next={rankUp.next}
          totalXP={rankUp.totalXP}
          onDone={() => setPhase('reward')}
        />
      </Modal>
    );
  }

  return (
    <Modal visible animationType="fade" transparent={false} onRequestClose={handleContinue}>
      <View style={styles.root}>
        {/* SCROLLS ONLY WHEN IT HAS TO. `flexGrow` + centred content keeps the
            unchanged screen exactly where it was, but a 104px number, a
            three-line tally, the streak week AND up to three badge cards do not
            fit a short phone — and this view has no overflow, so the surplus
            would have been silently cropped rather than reachable. */}
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.center}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.eyebrow}>LESSON COMPLETE</Text>
          <DrawnRule delay={120} width={54} />

          {/* the number, drawn on */}
          <View style={styles.xpBlock}>
            <InkedNumber value={xp} delay={260} />
            <Text style={styles.xpLabel}>XP EARNED</Text>
          </View>

          {/* …and where it came from */}
          {tallyAdds && (
            <View style={styles.tally}>
              {parts.map((p, k) => (
                <TallyRow key={p.label} label={p.label} amount={p.amount} delay={1000 + k * 190} />
              ))}
            </View>
          )}

          {total > 0 && !tallyAdds && (
            <Text style={styles.correct}>
              {correct} / {total} correct
            </Text>
          )}

          {/* Streak */}
          {info &&
            (info.firstOfDay ? (
              <View style={styles.streakBox}>
                <DrawnRule delay={1500} width={54} />
                <Text style={styles.streakHeading}>
                  {info.restSpent > 0
                    ? 'Streak kept'
                    : info.prevStreak === 0
                      ? 'Streak started'
                      : 'Streak extended'}
                </Text>
                <StreakBook value={info.streak} from={info.prevStreak} animate size={100} />
                {/* Said plainly, and only when it happened. A rest day is spent
                    silently — the reader is told AFTER their streak was saved,
                    not asked beforehand, because a prompt at that moment turns a
                    kindness into one more decision on a day they already missed. */}
                {info.restSpent > 0 && (
                  <Text style={styles.restNote}>
                    {info.restSpent === 1 ? 'A day of rest covered yesterday.' : `${info.restSpent} rest days covered the gap.`}
                  </Text>
                )}
                <View style={styles.weekWrap}>
                  <StreakWeek streak={info.streak} lastLessonDate={lastLessonDate} size={30} />
                </View>
              </View>
            ) : (
              <View style={styles.streakSmallRow}>
                <StreakBook value={info.streak} size={52} />
                <Text style={styles.streakSmall}>{info.streak}-day streak</Text>
              </View>
            ))}

          {/* THE ONE PERMISSION ASK, and this is where it is spent — see
              NotifyPrompt. It renders itself away unless the OS has actually
              refused so far and the reader has not been asked before, so it
              appears once in a lifetime and never for anyone already granted. */}
          <NotifyPrompt />

          {/* …and anything the lesson just struck. */}
          {badges.length > 0 && (
            <View style={styles.badges}>
              <BadgeEarnedHeading count={badges.length} delay={badgeBase} />
              {badges.map((b, k) => (
                <BadgeEarned key={b.id} badge={b} delay={badgeBase + 150 + k * 520} />
              ))}
            </View>
          )}
        </ScrollView>

        {/* Someone is waiting for you to finish reading. */}
        <View style={styles.loaferRow}>
          <RewardLoafer line={pickLine(`${lessonId}:${info?.streak ?? 0}`)} delay={1700} />
        </View>

        <Pressable
          onPress={handleContinue}
          disabled={advancing}
          style={({ pressed }) => [styles.btn, (pressed || advancing) && { opacity: 0.8 }]}
        >
          <Text style={styles.btnText}>Continue →</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Paper,
    paddingHorizontal: 28,
    paddingBottom: 40,
    paddingTop: 56,
  },
  scroll: { flex: 1 },
  center: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 6 },
  badges: { alignSelf: 'stretch', marginTop: 4 },

  eyebrow: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    letterSpacing: 3.4,
    color: InkSoft,
    marginBottom: 10,
  },
  drawnRule: { height: 2, backgroundColor: Ink, transformOrigin: '0% 50%' },

  xpBlock: { alignItems: 'center', marginTop: 10 },
  xpNumWrap: { position: 'relative', overflow: 'hidden' },
  xpNumber: {
    position: 'absolute',
    top: 0,
    fontFamily: 'Caveat_700Bold',
    fontSize: XP_SIZE,
    color: Ink,
    lineHeight: Math.round(XP_SIZE * 1.02),
    textAlign: 'center',
    // Caveat has no tabular figures — the fixed cells above are what hold the count
    // still. Android's default font padding would also shove the baseline down inside
    // a box sized by arithmetic (D29).
    includeFontPadding: false,
  },
  wipeCover: { position: 'absolute', left: -3, top: 0, bottom: 0, right: -8, backgroundColor: Paper },
  xpLabel: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    color: InkSoft,
    letterSpacing: 3.4,
    marginTop: 2,
  },

  // The tally: a printed receipt for the number above it.
  tally: { alignSelf: 'stretch', marginTop: 16, paddingHorizontal: 10, gap: 8 },
  tallyRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tallyLabel: {
    fontFamily: 'Inter_500Medium', fontSize: 10.5, letterSpacing: 1.6, color: InkSoft,
  },
  tallyLead: { flex: 1, height: 1, backgroundColor: Rule },
  tallyAmount: {
    fontFamily: 'Inter_700Bold', fontSize: 13, color: Ink, fontVariant: ['tabular-nums'],
  },

  correct: { fontFamily: 'Inter_700Bold', fontSize: 15, color: Ink, marginTop: 14 },

  streakBox: { alignSelf: 'stretch', alignItems: 'center', marginTop: 18 },
  streakHeading: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    color: InkSoft,
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    marginTop: 10,
    marginBottom: 2,
  },
  restNote: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12.5,
    color: InkSoft,
    marginTop: 6,
    textAlign: 'center',
  },
  weekWrap: { alignSelf: 'stretch', paddingHorizontal: 8, marginTop: 6 },
  streakSmallRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 24 },
  streakSmall: { fontFamily: 'Inter_500Medium', fontSize: 15, color: InkSoft },

  // He leans on the right-hand edge, standing on the line above the button.
  // Room above him so the thought never lands on the streak week beneath it.
  loaferRow: { alignSelf: 'stretch', marginTop: 10, marginBottom: 4 },

  btn: {
    backgroundColor: Ink,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
  },
  btnText: { fontFamily: 'Inter_700Bold', fontSize: 18, color: Paper },
});
