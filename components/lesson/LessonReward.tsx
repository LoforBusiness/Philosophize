import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Modal, View, Text, ScrollView, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { router, usePathname } from 'expo-router';
import Animated, {
  useSharedValue, useAnimatedStyle, withDelay, withTiming, withSequence, Easing, type SharedValue,
} from 'react-native-reanimated';
import StreakCeremony from '@/components/gamification/StreakCeremony';
import RankUpScreen, { T_BURST } from '@/components/gamification/RankUpScreen';
import RewardLoafer, { pickLine } from '@/components/gamification/RewardLoafer';
import BadgeEarned, { BadgeEarnedHeading } from '@/components/gamification/BadgeEarned';
import Button from '@/components/ui/Button';
import { RANKS, rankForXP, type RankDef } from '@/data/ranks';
import type { BadgeDef } from '@/data/badges';
import { getLessonById, getLessonUnitInfo } from '@/data';
import { landOnBranch } from './lessonNav';
import { useUserDataStore, previewDailyActivity, previewNewBadges, daysBetween, type DayInfo } from '@/stores/userDataStore';
import { restDaysHeld, STREAK_EMBER, STREAK_DEEP } from '@/constants/streak';
import NotifyPrompt from './NotifyPrompt';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { useUIStore } from '@/stores/uiStore';
import { bankedLesson } from '@/lib/analytics/lessonClock';
import {
  XP_PER_LESSON_COMPLETION, XP_PER_CORRECT_ANSWER, XP_PER_PERFECT_LESSON,
} from '@/constants/xp';
import { C, BRANCH, type BranchKey } from '@/constants/design';
import { TEAL, DEEP, SHINE, LOCK_EDGE, lipOf, mix } from '@/components/shared/tone';
import { LINE } from '@/components/shared/drawn';
import { track } from '@/lib/posthog';
import { cue } from '@/lib/feedback';
import { lessonHasSound } from '@/components/lesson/cinematic/lessonSound';
import { refreshHomeWidget } from '@/lib/widget/render';

interface Props {
  xp: number;
  correct: number;
  total: number;
  branchSlug: string | null;
  lessonId: string;
  onDone: () => void;
}

function dateStr(d: Date) {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

// Imported rather than re-declared. The local copy of this shape drifted the
// moment the store's grew a field, and a screen whose job is to promise exactly
// what the store will write cannot afford its own idea of the shape.

// ─────────────────────────────────────────────────────────────────────────────
// THE RECEIPT, STRUCK (2026-09-29).
//
// "I want you to redesign the other part of the reward, how it looks, how it's
// animated." It was a grey page: an eyebrow, a handwritten number wiped on, a
// ruled tally in 10px capitals and a flat black button — the one screen every
// lesson ends on, drawn in none of the app's own furniture.
//
// It is built from the depth kit now, the way the tabs are: a hero card on a
// ledge in the LESSON'S BRANCH HUE (R18 strikes every control in it, so the
// payout is the same colour as the questions that earned it), a teal XP coin that
// bumps on every tick of the count and turns over when it lands, the tally as
// three chips that drop onto the card one after another, and two tiles for the
// accuracy and the day streak. Every piece arrives on a spring that overshoots
// and settles, in reading order, top to bottom.
//
// WHAT DID NOT MOVE: the leaning figure and his bubble (RewardLoafer, untouched,
// in the same slot with the same props), the badges, the permission ask, and
// every sound time — the count still starts at XP_AFTER_CHIME and ticks
// XP_TICKS times.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * How many ticks the count-up makes, whatever it is counting.
 *
 * Not one per XP: a 60 XP lesson would fire sixty in a second. Not a fixed
 * interval either, because the count eases out — the number slows down at the end
 * and evenly-spaced ticks would keep hammering while it had stopped moving.
 * Ticking every Nth UNIT ties the sound to the digits, so the run rattles as the
 * number races and thins out as it settles.
 */
const XP_TICKS = 14;

/**
 * How far into the rank-up sound its burst falls, in ms.
 *
 * Matches `H = 1.33` in `riseAndBurst()` in scripts/make-sounds.mjs. The sound
 * BUILDS while RankUpScreen's stones light and bursts as the new pin comes up, so
 * it is started this much before `T_BURST` — 120ms after the screen appears.
 */
const RANKUP_PEAK = 1330;

/**
 * When the XP number starts counting, in ms after the screen appears.
 *
 * Set by the SOUND: the lesson-complete sound swooshes into its chord at 300ms
 * and the chord's attack has spent itself by about 800. The counter comes in just
 * after, so the reader hears an ending and then a tally rather than both at once.
 */
const XP_AFTER_CHIME = 950;
const COUNT_MS = 980;

// ── the number ───────────────────────────────────────────────────────────────
// FIXED CELLS. A count set in proportional figures re-centres itself on almost
// every frame — a 1 is half the width of a 6 — so each digit gets a cell as wide
// as the widest, as many as the FINAL value needs, right-aligned. Nothing moves
// sideways for the whole count; the digits just change. A cell the count has
// not reached yet shows a faint 0, the way an odometer does, so the prefix never
// floats beside an empty gap.
const XP_SIZE = 70;
const XP_CELL = Math.round(XP_SIZE * 0.62);

const backOut = (u: number) => {
  'worklet';
  const k = 1.9;
  const v = u - 1;
  return 1 + (k + 1) * v * v * v + k * v * v;
};

/** Arrives on a spring that overshoots and settles — a thing landing. */
function Pop({ delay, children, style, lift = 18 }: {
  delay: number; children: ReactNode; style?: StyleProp<ViewStyle>; lift?: number;
}) {
  const v = useSharedValue(0);
  useEffect(() => {
    v.value = withDelay(delay, withTiming(1, { duration: 420, easing: Easing.linear }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const st = useAnimatedStyle(() => {
    const u = v.value;
    return {
      opacity: Math.min(1, u * 4),
      transform: [{ translateY: (1 - Math.min(1, u * 1.6)) * lift }, { scale: u <= 0 ? 0.7 : 0.7 + 0.3 * backOut(u) }],
    };
  });
  return <Animated.View style={[style, st]}>{children}</Animated.View>;
}

/**
 * A number that counts up from zero after `delay`. `onTick` fires on every
 * sounded step so the thing beside it can bump in time with the sound; the
 * count itself is a leaf of a few <Text> nodes, which is cheap to re-render.
 */
function CountUp({ value, delay, size, color, tick, onTick, onLand, prefix = '', suffix = '' }: {
  value: number; delay: number; size: number; color: string; tick?: boolean;
  onTick?: () => void; onLand?: () => void; prefix?: string; suffix?: string;
}) {
  const [shown, setShown] = useState(0);
  const cells = Math.max(1, String(Math.max(0, value)).length);
  const cell = Math.round(size * 0.62);

  useEffect(() => {
    if (value <= 0) { onLand?.(); return; }
    const t0 = Date.now() + delay;
    const stride = Math.max(1, Math.ceil(value / XP_TICKS));
    let sounded = 0;   // the value the last tick was struck at
    let step = 0;      // where we are in the three-note cycle
    const id = setInterval(() => {
      const t = Math.min(1, (Date.now() - t0) / COUNT_MS);
      if (t < 0) return;
      const eased = 1 - Math.pow(1 - t, 3);
      const next = Math.round(eased * value);
      setShown(next);
      // The last tick fires on arrival even when the remainder is short of a
      // stride, so the run always resolves on the final number.
      if (next > sounded && (next - sounded >= stride || t >= 1)) {
        sounded = next;
        if (tick) cue('tick', step++);
        onTick?.();
      }
      if (t >= 1) { clearInterval(id); onLand?.(); }
    }, 16);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const digits = String(shown).padStart(cells, ' ').split('');
  const lh = Math.round(size * 1.12);
  return (
    <View style={styles.countRow}>
      {prefix ? <Text style={[styles.countFig, { fontSize: size, lineHeight: lh, color }]}>{prefix}</Text> : null}
      <View style={{ width: cells * cell, height: lh }}>
        {digits.map((d, k) => (
          <Text
            key={k}
            style={[
              styles.countFig, styles.countCell,
              { left: k * cell, width: cell, fontSize: size, lineHeight: lh, color: d === ' ' ? LOCK_EDGE : color },
            ]}
          >
            {d === ' ' ? '0' : d}
          </Text>
        ))}
      </View>
      {suffix ? <Text style={[styles.countFig, { fontSize: size, lineHeight: lh, color }]}>{suffix}</Text> : null}
    </View>
  );
}

/**
 * The XP coin: flat teal, ink rim, a ledge, a glint. It bumps on each tick of
 * the count and turns over once when the count lands.
 */
function XpCoin({ bump, spin }: { bump: SharedValue<number>; spin: SharedValue<number> }) {
  const st = useAnimatedStyle(() => ({
    transform: [
      { perspective: 500 },
      { rotateY: `${spin.value * 360}deg` },
      { scale: 1 + bump.value * 0.14 },
    ],
  }));
  return (
    <Animated.View style={[styles.coin, st]}>
      <View style={styles.coinGlint} />
      <Text style={styles.coinText}>XP</Text>
    </Animated.View>
  );
}

/** A small struck card: a coloured band with a label, a white face under it. */
function Tile({ hue, label, children }: { hue: string; label: string; children: ReactNode }) {
  return (
    <View style={[styles.tileWrap]}>
      <View style={[styles.tileLip, { backgroundColor: lipOf(hue) }]} />
      <View style={styles.tile}>
        <View style={[styles.tileBand, { backgroundColor: hue }]}>
          <Text style={styles.tileLabel} numberOfLines={1}>{label}</Text>
        </View>
        <View style={styles.tileBody}>{children}</View>
      </View>
    </View>
  );
}

export default function LessonReward({ xp, correct, total, branchSlug, lessonId, onDone }: Props) {
  // Where the stack actually is underneath this modal — see `goToBranch`.
  const path = usePathname();
  // Set by the lesson screen on mount; names the one lesson under test, or null.
  const testLessonId = useUIStore((s) => s.testLessonId);
  const recordLessonComplete = useUserDataStore((s) => s.recordLessonComplete);
  const registerDailyActivity = useUserDataStore((s) => s.registerDailyActivity);
  const bumpDailyLessons = useUserDataStore((s) => s.bumpDailyLessons);
  const lastLessonDate = useUserDataStore((s) => s.lastLessonDate);
  // The recorded day history, for the week strip in the streak ceremony. The
  // ceremony unions today in itself, because nothing is written until Continue.
  const activeDays = useUserDataStore((s) => s.activeDays);
  const restDays = useUserDataStore((s) => s.restDays);
  const joinedAt = useUserDataStore((s) => s.joinedAt);

  // Only the rest-day rules still differ by tier. Since the hard paywall
  // (2026-09-25) a reader who reaches this screen holds the Pass, or held it when
  // the lesson opened: the lesson route's latch keeps a lesson open through a
  // trial that ends mid-read, so there is no free path out of here any more.
  const isPro = useSubscriptionStore((s) => s.isPro);
  const markLessonFinished = useUIStore((s) => s.markLessonFinished);

  // The XP ticks, the badge strike and the rank-up fanfare are all part of the
  // one-lesson sound trial. The end-of-lesson chime below is not — it shipped
  // already and plays for every lesson, cinematic or card.
  const sounded = lessonHasSound(lessonId);

  const ran = useRef(false);
  const [info, setInfo] = useState<DayInfo | null>(null);
  const [advancing, setAdvancing] = useState(false);
  // A rank-up takes the screen FIRST, before XP and the streak — it is the rarest
  // thing that can happen on a completion and it used to pass in total silence.
  // `null` until the completion effect has run, so the reward never paints for a
  // frame before we know whether it has been pre-empted.
  // `streak` sits between them: a rank-up is rarer and keeps the stage first,
  // then the day is struck, then the receipt. Keeping it a PHASE rather than a
  // flag on the reward screen is what stops the badge chimes below firing behind
  // the ceremony — that effect already gates on `phase !== 'reward'`.
  const [phase, setPhase] = useState<'pending' | 'rankup' | 'streak' | 'reward'>('pending');
  const [rankUp, setRankUp] = useState<{ from: RankDef; to: RankDef; next: RankDef | null; totalXP: number } | null>(null);
  // Badges finishing WOULD earn. Like the streak and the rank above, worked out
  // without writing any of it — see previewNewBadges.
  const [badges, setBadges] = useState<BadgeDef[]>([]);

  // ───────────────────────────────────────────────────────────────────────────
  // THE COMPLETION IS COMMITTED HERE, NOT ON MOUNT.
  //
  // It used to run in an effect the moment this screen appeared, which meant a
  // reader could reach the reward, kill the app, reopen it, and find the lesson
  // marked complete without ever seeing the interstitial that then paid for the
  // free tier. There is no interstitial since the hard paywall, and the rule
  // stays anyway: nothing is written until this runs. Everything above is a
  // PREVIEW computed from the store without touching it. Leave before pressing
  // the button and the lesson simply was not finished: no XP, no streak, no
  // unlock, and the lesson is still there to be played again.
  // ───────────────────────────────────────────────────────────────────────────
  const commit = () => {
    if (ran.current) return;
    ran.current = true;
    recordLessonComplete(lessonId, xp);
    const today = dateStr(new Date());
    const yesterday = dateStr(new Date(Date.now() - 86_400_000));
    bumpDailyLessons(today); // Home's daily-goal dots count these
    const dayInfo = registerDailyActivity(today, yesterday, { isPro });
    // The two facts this screen cannot derive: how long it took, and which
    // format it was. Both are held by the route — see lib/analytics/lessonClock.
    const clock = bankedLesson(lessonId);
    track('lesson_completed', {
      branch_slug: branchSlug,
      lesson_id: lessonId,
      format: clock.format,
      seconds: clock.seconds,
      xp,
      correct,
      total,
      new_streak: dayInfo.streak,
      streak_increased: dayInfo.firstOfDay,
      rest_days_spent: dayInfo.restSpent,
    });
    // The home-screen widget shows the day streak — keep it current (best-effort).
    refreshHomeWidget();
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
  // ── AND USUALLY THERE IS NOTHING TO NAVIGATE ──────────────────────────────
  //
  // The comment that used to sit here said the lesson screen was "already being
  // popped by `onDone`". It is popped earlier than that, and by someone else:
  // every runner calls `exitLesson()` the instant the lesson finishes, so by the
  // time the reward is on screen the lesson is long gone and the BRANCH SCREEN is
  // already the top of the stack, sitting underneath this modal.
  //
  // Which made `router.replace` replace the branch screen with itself. That is a
  // fresh mount — and it threw away the instance that had just been handed the
  // walk, so the reader arrived at a brand-new screen with the figure already
  // standing at the next lesson and nothing to watch. It is why the walk was
  // never seen, and why fixing the scroll changed nothing.
  //
  // So: navigate only when we are NOT already there — a deep link into a lesson,
  // or anything else that left the stack somewhere unexpected.
  //
  // ── AND WHEN IT DOES NAVIGATE, IT PUSHES ─────────────────────────────────────
  //
  // This was `router.replace`, and Quick Start is what exposed it. From Home the
  // lesson sits on the Learn tab's LIST, so `exitLesson()` pops back to the list —
  // and replacing "the current screen" then replaced the LIST. The stack was left
  // holding one branch with nothing under it: back fell through to Home, and the
  // Learn tab could only show that branch again. `landOnBranch` pushes, anchored.
  const goToBranch = () => {
    const info = getLessonUnitInfo(lessonId);
    const slug = branchSlug ?? info?.branchSlug;
    if (!info || !slug) return;
    // The branch screen claims this once it is actually in front of the reader.
    markLessonFinished({ lessonId, unitId: info.unitId, branchSlug: slug });
    landOnBranch(slug, path);
  };

  const handleContinue = async () => {
    if (advancing) return;
    setAdvancing(true);
    // ── A TEST RUN COSTS NOTHING ───────────────────────────────────────────────
    //
    // The reward screen still plays in full — that is half of what there is to
    // test — but nothing is written: no XP, no completion, no streak, no daily
    // count, and no `markLessonFinished`, so the branch world does not
    // walk for a lesson that was never really finished.
    //
    // Compared by LESSON ID, not by a boolean, so this can only ever apply to the
    // exact lesson the tester launched. `router.back()` returns to the tester's
    // list, where the next one is one tap away.
    if (testLessonId === lessonId) {
      onDone();
      router.back();
      return;
    }
    // No ad, no offer and no paywall: since the hard paywall (2026-09-25) there is
    // no free reader here to show them to.
    commit();
    onDone();
    goToBranch();
  };

  // What finishing WOULD do, worked out without writing any of it. Both halves
  // mirror the store exactly: the streak via the shared `previewDailyActivity`,
  // and the rank by the same rule `recordLessonComplete` uses — it advances at
  // most ONE tier, and only when the XP has earned at least one.
  useEffect(() => {
    const st = useUserDataStore.getState();
    const earned = rankForXP(st.totalXP + xp).index;
    // THE DAY IS WORKED OUT FIRST, because it now decides a phase as well as a
    // panel: the ceremony only exists on the lesson that actually moves the
    // streak. Rest days are passed in for the same reason the rest of this block
    // exists — what the screen PROMISES and what `commit()` later writes have to
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
    if (earned > st.rankIndex) {
      setRankUp({
        from: RANKS[st.rankIndex],
        to: RANKS[st.rankIndex + 1],
        next: RANKS[st.rankIndex + 2] ?? null,
        totalXP: st.totalXP + xp,
      });
      setPhase('rankup');
    } else {
      setPhase(day.firstOfDay ? 'streak' : 'reward');
    }
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
    //
    // AND SKIPPED ON THE LESSON THAT STRIKES THE DAY, for the same reason. That
    // lesson opens on StreakCeremony, which sounds its own stamp on the frame the
    // die lands; the chime played here used to start under the ceremony before
    // the die had even fallen. One lesson, one sound.
    if (earned <= st.rankIndex && !day.firstOfDay) cue('reward');
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

  // ONE DELAY NOW, and the split that used to be here was load-bearing before
  // the ceremony moved out. It read `info?.firstOfDay ? 2050 : 1450`, holding the
  // badges back two seconds so they came in behind the streak panel that used to
  // play ON this screen. That panel is a screen of its own now and this one does
  // not mount until it is finished, so the long branch bought nothing but two
  // seconds of dead air on exactly the days a reader has most to be shown.
  const badgeBase = 1450;
  /** One expression for when badge k lands, so its sound cannot drift off its art. */
  const badgeAt = (k: number) => badgeBase + 150 + k * 520;

  // ── the sounds this screen makes ───────────────────────────────────────────
  // Both of these are scheduled against the SAME constants that drive the
  // animations they belong to — `badgeAt` above, and RankUpScreen's own exported
  // T_BURST — rather than against numbers typed in to look about right. A reward
  // sound that lands even 150ms off its picture reads as a glitch in the app.
  //
  // Everything here is behind the one-lesson trial gate. The chime in the effect
  // above is not: that one already shipped.
  useEffect(() => {
    if (!sounded || phase !== 'reward' || badges.length === 0) return;
    const ids = badges.map((_, k) => setTimeout(() => cue('badge'), badgeAt(k)));
    return () => ids.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sounded, phase, badges, badgeBase]);

  useEffect(() => {
    if (!sounded || phase !== 'rankup') return;
    // The fanfare CLIMBS: D5·F#5·A5·D6, reaching the top note 340ms in. Start it
    // that much early and the top note lands on the burst as the ring closes,
    // instead of the phrase beginning there and peaking into the aftermath.
    const id = setTimeout(() => cue('rankup'), Math.max(0, T_BURST - RANKUP_PEAK));
    return () => clearTimeout(id);
  }, [sounded, phase]);

  // The coin beside the count: a bump on every sounded tick, one turn on landing.
  // Written from the count's own interval, so the bump IS the tick, not a guess
  // at when it might be.
  const bump = useSharedValue(0);
  const spin = useSharedValue(0);
  const onXpTick = () => {
    bump.value = withSequence(
      withTiming(1, { duration: 55, easing: Easing.out(Easing.quad) }),
      withTiming(0, { duration: 170, easing: Easing.out(Easing.quad) }),
    );
  };
  const onXpLand = () => {
    spin.value = withTiming(1, { duration: 560, easing: Easing.out(Easing.cubic) });
  };

  // ── EVERY HOOK IS ABOVE THIS LINE ─────────────────────────────────────────
  //
  // Section 17, rule 1, and it is the rule that has cost this app the most: a
  // hook added below an early return means React counts fewer of them on the
  // render where the return fires, throws, and takes down the whole tree --
  // INCLUDING the reward modal that has just been mounted. Every cinematic
  // lesson ended on a blank screen with no way forward. Add hooks above.

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
          onDone={() => setPhase(info?.firstOfDay ? 'streak' : 'reward')}
        />
      </Modal>
    );
  }

  // THE DAY IS STRUCK. Only on the lesson that actually moves the streak, and
  // only ever once — pressing Continue moves to the receipt and there is no way
  // back into this phase.
  if (phase === 'streak' && info) {
    return (
      <Modal visible animationType="fade" transparent={false} onRequestClose={handleContinue}>
        <StreakCeremony
          streak={info.streak}
          prevStreak={info.prevStreak}
          restSpent={info.restSpent}
          activeDays={activeDays}
          restDays={restDays}
          pendingRest={info.restSpent > 0 ? daysBetween(lastLessonDate, dateStr(new Date())) : undefined}
          today={dateStr(new Date())}
          since={joinedAt ? dateStr(new Date(joinedAt)) : null}
          // THE ONLY LINE ALLOWED TO ASK FOR ANOTHER LESSON. It used to ask
          // only while a free reader had one left today; with the free daily
          // lesson gone (2026-09-25) everybody reaching this screen has one.
          moreToday
          onDone={() => setPhase('reward')}
        />
      </Modal>
    );
  }

  // The lesson's own branch hue, the colour its questions were struck in (R18).
  const found = getLessonById(lessonId);
  const hue = BRANCH[(branchSlug ?? found?.branch.slug ?? '') as BranchKey] ?? C.HUE;
  const title = found?.lesson.title ?? null;
  const accuracy = total > 0 ? Math.round((100 * correct) / total) : null;
  const chipLabel = (label: string) =>
    label === 'LESSON COMPLETE' ? 'Finished' : label === 'NOTHING MISSED' ? 'Perfect' : label.toLowerCase().replace(/^(\d+) answered right$/, '$1 right');

  return (
    <Modal visible animationType="fade" transparent={false} onRequestClose={handleContinue}>
      <View style={styles.root}>
        {/* SCROLLS ONLY WHEN IT HAS TO. `flexGrow` + centred content keeps the
            screen where it is, but the cards AND up to three badge cards do not
            fit a short phone, and this view has no overflow, so the surplus
            would be silently cropped rather than reachable. */}
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.center}
          showsVerticalScrollIndicator={false}
        >
          <Pop delay={40} lift={-10} style={styles.tagWrap}>
            <View style={styles.tagLip} />
            <View style={[styles.tag, { backgroundColor: hue }]}>
              <Text style={styles.tagText}>LESSON COMPLETE</Text>
            </View>
          </Pop>
          {title ? (
            <Pop delay={120} lift={8}>
              <Text style={styles.title} numberOfLines={2}>{title}</Text>
            </Pop>
          ) : null}

          {/* THE HERO: what the lesson paid, on the branch's own ledge. */}
          <Pop delay={220} style={styles.heroWrap}>
            <View style={[styles.heroLip, { backgroundColor: lipOf(hue) }]} />
            <View style={styles.hero}>
              <View style={[styles.heroBand, { backgroundColor: hue }]}>
                <Text style={styles.heroBandText}>XP EARNED</Text>
              </View>
              <View style={styles.heroBody}>
                <XpCoin bump={bump} spin={spin} />
                <CountUp
                  value={xp}
                  delay={XP_AFTER_CHIME}
                  size={XP_SIZE}
                  color={C.ink}
                  tick={sounded}
                  onTick={onXpTick}
                  onLand={onXpLand}
                  prefix="+"
                />
              </View>

              {/* …and where it came from: one chip per part, dropping on in turn. */}
              {tallyAdds && (
                <View style={styles.chips}>
                  {parts.map((p, k) => (
                    <Pop key={p.label} delay={1000 + k * 260} lift={-14} style={styles.chipWrap}>
                      <View style={[styles.chipLip, { backgroundColor: mix(hue, C.paper, 0.45) }]} />
                      <View style={[styles.chip, { borderColor: C.ink }]}>
                        <Text style={[styles.chipAmount, { color: hue }]}>+{p.amount}</Text>
                        <Text style={styles.chipLabel}>{chipLabel(p.label)}</Text>
                      </View>
                    </Pop>
                  ))}
                </View>
              )}
            </View>
          </Pop>

          {/* THE STREAK, AS A RECEIPT. The celebrating is done by StreakCeremony,
              which has just had the whole screen; saying it twice would make the
              second telling the flat one. So this is a tile, and the same tile
              whether or not a ceremony played on the way here. */}
          <View style={styles.tiles}>
            <Pop delay={420} style={styles.tileSlot}>
              <Tile hue={DEEP} label="ACCURACY">
                {accuracy === null ? (
                  <Text style={styles.tileValue}>—</Text>
                ) : (
                  <CountUp value={accuracy} delay={1150} size={30} color={C.ink} suffix="%" />
                )}
                {total > 0 ? <Text style={styles.tileSub}>{correct} of {total} right</Text> : null}
              </Tile>
            </Pop>
            <Pop delay={560} style={styles.tileSlot}>
              <Tile hue={STREAK_EMBER} label="STREAK">
                <Text style={styles.tileValue}>{info?.streak ?? 0}</Text>
                <Text style={styles.tileSub}>{(info?.streak ?? 0) === 1 ? 'day in a row' : 'days in a row'}</Text>
              </Tile>
            </Pop>
          </View>

          {/* THE ONE PERMISSION ASK, and this is where it is spent — see
              NotifyPrompt. It renders itself away unless the OS has actually
              refused so far and the reader has not been asked before. */}
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

        <Pop delay={700} lift={12}>
          <Button label="Continue →" size="lg" onPress={handleContinue} disabled={advancing} />
        </Pop>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.paper,
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 52,
  },
  scroll: { flex: 1 },
  center: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 6 },
  badges: { alignSelf: 'stretch', marginTop: 8 },

  tagWrap: { alignSelf: 'center', paddingBottom: 3 },
  tagLip: { position: 'absolute', left: 0, right: 0, top: 3, bottom: 0, borderRadius: 999, backgroundColor: C.ink },
  tag: {
    borderRadius: 999, paddingHorizontal: 16, paddingVertical: 7,
    borderWidth: LINE, borderColor: C.ink,
  },
  tagText: { fontFamily: 'Inter_700Bold', fontSize: 11.5, letterSpacing: 2.4, color: C.paper },
  title: {
    fontFamily: 'PlayfairDisplay_700Bold', fontSize: 21, lineHeight: 27, color: C.ink,
    textAlign: 'center', marginTop: 12, paddingHorizontal: 12,
  },

  heroWrap: { alignSelf: 'stretch', marginTop: 18, paddingBottom: 6 },
  heroLip: { position: 'absolute', left: 0, right: 0, top: 6, bottom: 0, borderRadius: 18 },
  hero: {
    backgroundColor: '#FFFFFF', borderRadius: 18, borderWidth: LINE, borderColor: C.ink, overflow: 'hidden',
  },
  heroBand: {
    paddingVertical: 8, alignItems: 'center',
    borderBottomWidth: LINE, borderBottomColor: C.ink,
  },
  heroBandText: { fontFamily: 'Inter_700Bold', fontSize: 12, letterSpacing: 3, color: C.paper },
  heroBody: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 14,
    paddingTop: 14, paddingBottom: 6,
  },

  countRow: { flexDirection: 'row', alignItems: 'center' },
  countFig: {
    fontFamily: 'PlayfairDisplay_700Bold', textAlign: 'center',
    fontVariant: ['lining-nums'], includeFontPadding: false,
  },
  countCell: { position: 'absolute', top: 0 },

  coin: {
    width: 58, height: 58, borderRadius: 29, backgroundColor: TEAL,
    borderWidth: LINE, borderColor: C.ink, borderBottomWidth: 6, borderBottomColor: DEEP,
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  coinGlint: { position: 'absolute', left: 10, top: 7, width: 14, height: 7, borderRadius: 4, backgroundColor: SHINE },
  coinText: { fontFamily: 'Inter_700Bold', fontSize: 17, color: '#FFFFFF', letterSpacing: 0.5 },

  chips: {
    flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6,
    paddingHorizontal: 8, paddingBottom: 16, paddingTop: 4,
  },
  chipWrap: { paddingBottom: 3 },
  chipLip: { position: 'absolute', left: 0, right: 0, top: 3, bottom: 0, borderRadius: 999 },
  chip: {
    flexDirection: 'row', alignItems: 'baseline', gap: 5,
    backgroundColor: '#FFFFFF', borderRadius: 999, borderWidth: 2,
    paddingHorizontal: 9, paddingVertical: 4,
  },
  chipAmount: { fontFamily: 'Inter_700Bold', fontSize: 13, fontVariant: ['tabular-nums'] },
  chipLabel: { fontFamily: 'Inter_500Medium', fontSize: 12, color: C.inkSoft },

  tiles: { flexDirection: 'row', alignSelf: 'stretch', gap: 12, marginTop: 14 },
  tileSlot: { flex: 1 },
  tileWrap: { paddingBottom: 5 },
  tileLip: { position: 'absolute', left: 0, right: 0, top: 5, bottom: 0, borderRadius: 16 },
  tile: {
    backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: LINE, borderColor: C.ink, overflow: 'hidden',
  },
  tileBand: { paddingVertical: 6, alignItems: 'center', borderBottomWidth: LINE, borderBottomColor: C.ink },
  tileLabel: { fontFamily: 'Inter_700Bold', fontSize: 10.5, letterSpacing: 2.2, color: C.paper },
  tileBody: { alignItems: 'center', paddingTop: 8, paddingBottom: 10 },
  tileValue: {
    fontFamily: 'PlayfairDisplay_700Bold', fontSize: 30, lineHeight: 34, color: C.ink,
    fontVariant: ['lining-nums'], includeFontPadding: false,
  },
  tileSub: { fontFamily: 'Inter_500Medium', fontSize: 12, color: C.inkSoft, marginTop: 2 },

  // He leans on the right-hand edge, standing on the line above the button.
  // Room above him so the thought never lands on the cards beneath it.
  loaferRow: { alignSelf: 'stretch', marginTop: 10, marginBottom: 4 },
});
