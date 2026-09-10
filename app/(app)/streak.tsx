import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View, Text, Pressable, ScrollView, StyleSheet,
  type LayoutChangeEvent, type NativeSyntheticEvent, type NativeScrollEvent,
} from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import SketchIcon from '@/components/shared/SketchIcon';
import ScreenTransition from '@/components/shared/ScreenTransition';
import StreakCalendar from '@/components/gamification/StreakCalendar';
import StreakMascot from '@/components/gamification/StreakMascot';
import { useUserDataStore } from '@/stores/userDataStore';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import {
  GILT, GILT_DEEP, GILT_SOFT, SLATE,
  restDaysHeld, restEarnEvery, restCap, tierFor, nextTier,
} from '@/constants/streak';
import { effectiveStreak, streakIsAlive, restDaysToSpend } from '@/lib/utils/streak';
import { moodFor } from '@/lib/utils/streakMood';
import { daysInMonth, dayKey } from '@/lib/utils/streakCalendar';
import { C, TYPE, SPACE, RADIUS, type TypeKey } from '@/constants/design';

// ─────────────────────────────────────────────────────────────────────────────
// THE STREAK SCREEN.
//
// A streak was a number on a card in the Profile tab and a bottom sheet on Home.
// Both said the same true thing quietly, and neither gave a reader any reason to
// come back tomorrow. This is the stage: the mascot, what the streak has made you,
// and the month you built it in.
//
// ── WHY A SCREEN AND NOT A BIGGER CARD ──────────────────────────────────────
//
// The thing being sold is that the streak MATTERS, and a feature that matters gets
// a room. It is also the only way the mascot works: he needs to be big enough to
// read a pose off, and a pose at 66px is a smudge.
//
// It is a HIDDEN route, like settings and the paywall — reached by tapping the
// streak anywhere it appears, never by a tab. Six tabs on a 390pt phone is ~62pt
// each and the labels clip; the streak does not need to outrank Learn.
//
// ── EVERY NUMBER HERE IS DERIVED, NONE IS STORED ────────────────────────────
//
// `effectiveStreak` rather than `streak`, because the stored one only moves when a
// lesson is finished and lingers at its old value after a missed day. The mood, the
// tier and the ember all hang off that one honest number, so there is no way for
// this screen to congratulate a reader on a streak they have actually lost.
// ─────────────────────────────────────────────────────────────────────────────

const role = (k: TypeKey) => ({
  fontFamily: TYPE[k].family,
  fontSize: TYPE[k].fontSize,
  lineHeight: TYPE[k].lineHeight,
  letterSpacing: TYPE[k].letterSpacing ?? 0,
});

// HOW LONG AFTER A GESTURE THE PAGE IS STILL MOVING. `onScrollEndDrag` fires
// when the FINGER leaves, and Android's overscroll stretch goes on receding for
// a few hundred milliseconds after that with no further scroll event to announce
// itself -- which is exactly the window the hold below exists for. EdgeEffect's
// own recede runs to about 0.6s; 450 covers the visible part of it, and
// overrunning costs nothing, because the only thing it delays is an idle
// animation resuming.
const STRETCH_SETTLE_MS = 450;

const pad = (n: number) => String(n).padStart(2, '0');
const dateStr = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export default function StreakScreen() {
  const streak = useUserDataStore((s) => s.streak);
  const lastLessonDate = useUserDataStore((s) => s.lastLessonDate);
  const activeDays = useUserDataStore((s) => s.activeDays);
  const restDays = useUserDataStore((s) => s.restDays);
  const joinedAt = useUserDataStore((s) => s.joinedAt);
  const earned = useUserDataStore((s) => s.restDaysEarned);
  const used = useUserDataStore((s) => s.restDaysUsed);
  const isPro = useSubscriptionStore((s) => s.isPro);

  const now = new Date();
  const today = dateStr(now);
  const since = joinedAt ? dateStr(new Date(joinedAt)) : null;

  const held = restDaysHeld(earned, used);
  const alive = streakIsAlive(lastLessonDate, held);
  const shown = effectiveStreak(streak, lastLessonDate, held);
  const fedToday = lastLessonDate === today;
  const restSpent = restDaysToSpend(lastLessonDate, today, held);

  // THE MOOD IS THE WHOLE CHARACTER, and it is computed from the mechanic rather
  // than chosen here. This screen never decides he is cross; it asks.
  const mood = useMemo(
    () => moodFor({ streak: shown, alive, fedToday, hour: now.getHours(), restSpent, dayKey: today }),
    [shown, alive, fedToday, restSpent, today],
  );

  const tier = tierFor(shown);
  const next = nextTier(shown);

  // The month the GRID is showing, which is not always this one — the reader can
  // page back, and figures that stayed on the current month while the calendar
  // moved would be quietly describing a different month than the one on screen.
  const [month, setMonth] = useState<{ y: number; m: number }>(
    { y: now.getFullYear(), m: now.getMonth() },
  );
  const onMonth = useCallback((y: number, m: number) => setMonth({ y, m }), []);

  const stats = useMemo(() => {
    const act = new Set(activeDays);
    const rst = new Set(restDays);
    const n = daysInMonth(month.y, month.m);
    let practised = 0;
    let rested = 0;
    let missed = 0;
    for (let d = 1; d <= n; d++) {
      const k = dayKey(month.y, month.m, d);
      if (k > today) break;                 // the future is not a miss
      if (since && k < since) continue;     // nor is anything before you arrived
      if (act.has(k)) practised++;
      else if (rst.has(k)) rested++;
      else missed++;
    }
    // A PERFECT MONTH NEEDS A DAY IN IT. Without the `practised > 0` guard, a month
    // entirely before the reader joined has nothing to miss and would be awarded a
    // perfect — congratulating them for a month they were not here for.
    return { practised, rested, missed, perfect: missed === 0 && practised > 0 };
  }, [activeDays, restDays, month.y, month.m, today, since]);

  const toNext = next ? next.at - shown : 0;

  // ── NOTHING ON THIS PAGE ANIMATES WHILE THE PAGE IS MOVING ────────────────
  //
  // The mascot runs a rig solve and twenty-four view transforms every frame, and
  // `useFocusEffect` only ever knew whether this SCREEN was the one on the glass
  // — not whether the part of it he stands in still was, and not whether the
  // reader was mid-flick. See the note in StreakMascot, and the measurements in
  // the block above the ScrollView.
  //
  // Nothing here renders: the state is two refs and the only thing published is
  // one shared value, so a gesture never triggers a React commit. That is the
  // reason `useInView`'s header gives at length — the measure is never the cost,
  // the re-render is, and a re-render timed to land mid-flick is the worst
  // moment there is.
  //
  // `heroBottom` starts effectively infinite so he animates until something has
  // actually been measured. A watcher that has not reported yet must not be able
  // to freeze him.
  //
  // ONE SHARED VALUE, TWO REASONS TO BE TRUE, and the second one is the fix.
  // `gone` is the old reason: he has been scrolled past, so animating him is
  // work nobody can see. `moving` is the new one: the page itself is in motion,
  // and while it is, every animated node in here forces Android's overscroll
  // stretch to re-rasterise the whole page (see the block above the ScrollView).
  //
  // Both are plain refs and the shared value is written from JS, because these
  // change a handful of times per gesture rather than per frame -- and the
  // worklets that READ it are untouched either way.
  const hold = useSharedValue(false);
  const heroBottom = useRef(Number.MAX_SAFE_INTEGER);
  const gone = useRef(false);
  const moving = useRef(false);
  const settle = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onHeroLayout = useCallback((e: LayoutChangeEvent) => {
    const { y, height } = e.nativeEvent.layout;
    heroBottom.current = y + height;
  }, []);

  const sync = useCallback(() => {
    const v = gone.current || moving.current;
    if (v !== hold.value) hold.value = v;
  }, [hold]);

  const onScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    gone.current = e.nativeEvent.contentOffset.y > heroBottom.current;
    sync();
  }, [sync]);

  // A FLING FIRES `onScrollEndDrag` AND THEN `onMomentumScrollBegin`, so the
  // hold has to survive the gap between the two -- hence a timer that gets
  // cleared rather than a flag that gets cleared. That same timer is what
  // carries the hold through the BOUNCE, which announces its end to nobody.
  const onMoveStart = useCallback(() => {
    if (settle.current) { clearTimeout(settle.current); settle.current = null; }
    moving.current = true;
    sync();
  }, [sync]);

  const onMoveEnd = useCallback(() => {
    if (settle.current) clearTimeout(settle.current);
    settle.current = setTimeout(() => {
      settle.current = null;
      moving.current = false;
      sync();
    }, STRETCH_SETTLE_MS);
  }, [sync]);

  useEffect(() => () => { if (settle.current) clearTimeout(settle.current); }, []);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenTransition>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={12} style={styles.back}>
            <SketchIcon name="back" size={20} color={C.ink} />
          </Pressable>
          <Text style={styles.headerTitle}>STREAK</Text>
          <View style={styles.back} />
        </View>

        {/* ── MEASURED ON A REAL S24 ULTRA, ANDROID 16, 120Hz ──────────────────
            The reader: "it is always laggy now ... when you try scroll down or
            up, it's extremely slow and really bad."

            They were right, and it is two faults with two different answers.

            OVERSCROLLING WAS 98.91% JANKY, and that half is the platform. Android
            12+ does not stop at the end of a list, it applies a StretchEffect --
            a RenderEffect that has to capture the scrolling content into an
            offscreen buffer so a shader can distort it, every frame of the
            bounce. Proven rather than assumed: with the phone's animator scale
            set to 0, so the stretch cannot play, Profile's identical symptom went
            from 67% janky to 9% and `Slow bitmap uploads` from 101 to 0.
            `overScrollMode="never"` turns the stretch off and was tried here.
            It is NOT kept, for the reason the reader gave about Profile: "I
            honestly want that scroll up feel the same as the other tabs ... I
            still want that on the profile tab, but I wanna make sure it isn't
            laggy." Deleting a gesture every other tab has is not a fix. And on
            THIS screen it would not even be one: taking the stretch away moves
            the overscroll case from 98.91% janky to the 71% that ordinary
            scrolling already costs, which is the fault underneath it.

            ORDINARY SCROLLING MEASURED 71% JANKY -- on a gesture that was
            overscrolling for most of its length. That reading is corrected
            below; it is the same fault, not a second one. The render thread's
            own trace, five seconds of scrolling:

              syncFrameState                    23.94 ms/frame
              allocateImageMemory               5,851 calls   (~44 a frame)
              vkFreeMemory                      4,223 calls
              Texture upload(...)               3,092 calls

            Allocated and freed and re-uploaded, every frame. That is a GPU
            resource cache over its budget, and the cache dump says so: this
            screen sits at 112-176 MB with **0 bytes purgeable**, where Home sits
            at 70 MB with 35 MB it is free to evict. Nothing can be thrown away,
            so Skia throws away things it still needs and fetches them back.

            AND THE CAUSE WAS NOT THE SCROLL CONTAINER. Three fixes were
            shipped against that reading and not one of them moved the screen, so
            here is the arithmetic that ends it. Everything hung on this pair:

              profile mid-scroll   syncFrameState  0.75 ms   biggest upload 146x147
              streak  mid-scroll   syncFrameState 23.94 ms   biggest upload 945x2599

            945x2599 was read as "the whole page rasterised to a texture". It
            cannot be. This ScrollView is full-bleed, so the page is 1080 wide
            and any picture of it would be 1080 wide too. 945 is NARROWER than
            the screen. Measured against the 1080x2340 panel:

              945 / 1080  = 0.875     squeezed 12.5% across
              2599 / 2340 = 1.111     stretched 11.1% down
              product     = 0.972     area preserved to within 3%

            That is a rubber band, not a page. 945x2599 IS the overscroll
            StretchEffect's own buffer -- the same RenderEffect that was already
            proved on Profile by system-level bisect (animator scale 0: 67% ->
            9% janky, slow bitmap uploads 101 -> 0). ONE fault on both screens.

            WHY IT BITES HERE ON EVERY FLICK AND ONLY AT THE ENDS ON PROFILE:
            this page is SHORT, so an ordinary swipe reaches the end stop and
            bounces nearly every time -- which is why "ordinary scrolling" and
            "overscrolling" measured the same here and read as two faults with
            one cause. On Profile's 2770 units a reader has to go looking for it.

            AND WHY IT COSTS MORE HERE THAN ANYWHERE ELSE: a RenderEffect has to
            capture the scrolling subtree into an offscreen buffer, and that
            capture is REUSABLE for as long as nothing inside it changes.
            Counted across the whole app, this is the only scroll content that is
            never still -- the mascot solves the rig and writes twenty-four view
            transforms every frame, and today's ring breathes on a
            `withRepeat(-1)`. Profile's content, by contrast, holds perfectly
            still: no frame callback and no endless animation anywhere in the
            page, which is exactly why it is smooth in the middle and struggles
            only at the ends, where the buffer cannot be avoided.

            So both of them hold still while the page is moving, and only while
            it is moving. Nothing is deleted and the bounce is untouched -- the
            reader keeps the gesture every other tab has, and the stretch gets a
            capture it can reuse instead of re-rasterising the page at 120Hz.

            RULED OUT ON THE DEVICE, so nobody re-tries them: the forty-two
            animated cell wrappers (removing all of them moved 5,851 allocations
            to 5,723, because the allocator was the stretch buffer and not the
            cells) and `Animated.ScrollView` (this is a plain one now, and it
            changed nothing). The earlier "the calendar" and "the mascot" tests
            each scrolled the suspect OFF SCREEN and measured what was left,
            which is structurally unable to see either of them: the top of the
            page is where a reader overscrolls, and it is where both of them are.

            AND NONE OF THIS PAGE WAS THE FAULT: THE GPU BUDGET WAS. A pass
            before this one blamed `removeClippedSubviews` on a correlation --
            this screen and Profile were the only two carrying it and the only two
            that janked -- and took it out. Published and re-measured, this screen
            still janked 67.6% with nobody touching it, 74 slow bitmap uploads in
            three seconds.
            What the two screens share is where they sit against HWUI's one
            texture budget, 121.31MB on this phone (`dumpsys gfxinfo`, "Max
            resource usage"). react-native-svg paints every <Svg> into a bitmap
            the size of its box and every built tab stays attached, so the whole
            app's bitmaps share that cache: this screen sat at 113.05MB with 128KB
            purgeable. Any frame that needs one more buffer overflows it, and Skia
            evicts and re-uploads every bitmap in the app on every frame after.
            The same rig in a lesson runs 0% janky because a lesson is not sitting
            on six tabs' worth of textures.
            27MB of that cache was two drawings on OTHER tabs -- Home's full-screen
            ruled paper and the Pass certificate frames -- and they are Views and
            tiled strips now. The hold-still above stays: fewer frames to draw is
            still fewer frames. */}
        <ScrollView
          contentContainerStyle={styles.body}
          showsVerticalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={64}
          onScrollBeginDrag={onMoveStart}
          onScrollEndDrag={onMoveEnd}
          onMomentumScrollBegin={onMoveStart}
          onMomentumScrollEnd={onMoveEnd}
        >
          {/* ── THE HERO ────────────────────────────────────────────────────
              The count is the loudest thing on the screen and it takes the ember
              when it is alive and the ash when it is not. That is the one colour
              §19 and constants/streak.ts allow, in the one place they allow it. */}
          <View style={styles.hero} onLayout={onHeroLayout}>
            <StreakMascot mood={mood} alive={alive} hold={hold} />
            <Text style={[styles.count, { color: alive ? GILT : SLATE }]}>{shown}</Text>
            <Text style={styles.countWord}>
              {alive ? `DAY${shown === 1 ? '' : 'S'} RUNNING` : 'STREAK LAPSED'}
            </Text>

            {tier ? (
              <View style={styles.tierChip}>
                <Text style={styles.tierChipText}>{tier.name.toUpperCase()}</Text>
              </View>
            ) : null}
          </View>

          {/* ── THE SOCIETY ─────────────────────────────────────────────────
              What the streak has made you, and what it would make you next. */}
          <View style={styles.card}>
            <Text style={styles.cardHead}>THE SOCIETY</Text>
            {tier ? (
              <Text style={styles.tierBlurb}>{tier.blurb}</Text>
            ) : (
              <Text style={styles.tierBlurb}>
                Seven days admits you to the Peripatetics. Aristotle&rsquo;s lot. They
                walked while they argued, which is more than you have done today.
              </Text>
            )}
            {next ? (
              <View style={styles.nextRow}>
                <View style={styles.track}>
                  <View
                    style={[
                      styles.fill,
                      { width: `${Math.max(4, Math.round((shown / next.at) * 100))}%` },
                    ]}
                  />
                </View>
                <Text style={styles.nextText}>
                  {toNext} {toNext === 1 ? 'day' : 'days'} to {next.name}
                </Text>
              </View>
            ) : (
              <Text style={styles.nextText}>Every society has admitted you. There are no more.</Text>
            )}
          </View>

          {/* ── THE MONTH ───────────────────────────────────────────────────
              Figures first, then the grid they describe. */}
          <View style={styles.card}>
            <View style={styles.statRow}>
              <View style={styles.stat}>
                <Text style={[styles.statNum, { color: alive ? GILT : C.ink }]}>{stats.practised}</Text>
                <Text style={styles.statWord}>days practised</Text>
              </View>
              <View style={styles.statDivide} />
              <View style={styles.stat}>
                <Text style={styles.statNum}>{stats.rested}</Text>
                <Text style={styles.statWord}>rest days used</Text>
              </View>
              {stats.perfect ? (
                <View style={styles.perfect}>
                  <Text style={styles.perfectText}>PERFECT</Text>
                </View>
              ) : null}
            </View>

            <StreakCalendar
              activeDays={activeDays}
              restDays={restDays}
              today={today}
              since={since}
              onMonth={onMonth}
              hold={hold}
            />
          </View>

          {/* ── REST DAYS ───────────────────────────────────────────────────
              Named honestly. They are the reason a bad Tuesday does not cost a
              reader ninety days, and a reader who does not know they exist gets
              no comfort from having them. */}
          <View style={styles.card}>
            <Text style={styles.cardHead}>REST DAYS</Text>
            <Text style={styles.restNum}>{held} of {restCap(isPro)}</Text>
            <Text style={styles.restText}>
              One is spent automatically to cover a day you miss, so a single bad day
              costs you nothing. You earn one every {restEarnEvery(isPro)} days.
            </Text>
          </View>
        </ScrollView>
      </ScreenTransition>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.paper },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACE[3], paddingBottom: SPACE[2],
  },
  back: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...role('label'), letterSpacing: 2, color: C.ink },

  body: { paddingHorizontal: SPACE[3], paddingBottom: SPACE[5], gap: SPACE[3] },

  hero: { alignItems: 'center', paddingTop: SPACE[2] },
  // Big. A streak screen whose number is the same size as a stat tile has not
  // understood which of the two the reader came for.
  count: {
    fontFamily: 'PlayfairDisplay_700Bold', fontSize: 72, lineHeight: 78,
    includeFontPadding: false, marginTop: SPACE[2],
  },
  countWord: { ...role('micro'), letterSpacing: 2, color: C.inkSoft },
  tierChip: {
    marginTop: SPACE[2], paddingHorizontal: SPACE[2], paddingVertical: 5,
    borderRadius: RADIUS.pill, backgroundColor: GILT_SOFT,
  },
  tierChipText: { ...role('micro'), letterSpacing: 2, color: GILT_DEEP, fontFamily: 'Inter_700Bold' },

  card: {
    backgroundColor: C.surface, borderRadius: RADIUS.card, borderWidth: 1,
    borderColor: C.hairline, padding: SPACE[3], gap: SPACE[2],
  },
  cardHead: { ...role('micro'), letterSpacing: 2, color: C.inkSoft },
  tierBlurb: { ...role('body'), color: C.ink },

  nextRow: { gap: SPACE[1] },
  track: { height: 6, borderRadius: RADIUS.pill, backgroundColor: C.hairline, overflow: 'hidden' },
  fill: { height: 6, borderRadius: RADIUS.pill, backgroundColor: GILT },
  nextText: { ...role('micro'), color: C.inkSoft },

  statRow: { flexDirection: 'row', alignItems: 'center' },
  stat: { flex: 1 },
  statDivide: { width: 1, height: 30, backgroundColor: C.hairline, marginHorizontal: SPACE[2] },
  statNum: { ...role('title'), color: C.ink },
  statWord: { ...role('micro'), color: C.inkSoft },
  perfect: {
    paddingHorizontal: SPACE[2], paddingVertical: 4,
    borderRadius: RADIUS.pill, backgroundColor: GILT_SOFT,
  },
  perfectText: { ...role('micro'), letterSpacing: 1.5, color: GILT_DEEP, fontFamily: 'Inter_700Bold' },

  restNum: { ...role('title'), color: C.ink },
  restText: { ...role('body'), color: C.inkSoft },
});
