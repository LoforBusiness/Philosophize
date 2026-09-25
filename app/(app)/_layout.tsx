import { useEffect, useState } from 'react';
import { Easing, InteractionManager } from 'react-native';
import { Tabs, router, useSegments } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import TabIcon, { type TabIconName } from '@/components/shared/TabIcon';
import { touch } from '@/lib/feedback';
import { useUIStore } from '@/stores/uiStore';

// ─────────────────────────────────────────────────────────────────────────────
// WARMING THE TABS, AND WHY IT IS NOT DONE UNDER THE LAUNCH ANIMATION
//
// Tabs lazy-mount by default, so the first visit to each one paid for its whole
// tree right as the reader arrived — the "first time I switch tabs it's slow"
// complaint. `lazy: false` moved that cost to startup, on the reasoning this
// file used to carry: there is a launch animation over the app for a couple of
// seconds, "and it runs on the UI thread, so JS mounting screens underneath does
// not stutter it."
//
// THAT SENTENCE IS WRONG, AND IT IS THE WHOLE OF THE FIRST-SCREEN STUTTER.
// Measured in a browser against the real app, same URL, one variable — `lazy`:
//
//                                    lazy: false      lazy: true
//   frame gaps over 50ms                     16               5
//   total time not painting              2078ms           946ms
//   99th-percentile frame gap              58ms            19ms
//   the launch screen appears at         2280ms          1737ms
//   ...and lifts at                      6003ms          5507ms
//   the percentage opens         0% held 413ms,   0% held 185ms,
//                                 jumps to 17%      then to 9%
//
// Eleven of those sixteen stalls land INSIDE the 3.7s the launch animation is on
// screen, and they cost it about 1.1 seconds of frames. Two things put them
// there, and only one of them is arguable:
//
//   · A mount is not only JS. Creating the views and measuring them happens on
//     the UI thread, which is the thread Reanimated animates on, so five screens
//     being built is not something an animation can be insulated from.
//   · The percentage IS JS — React state, set from a worklet through runOnJS —
//     so it queues behind the mount on every platform there is. That is the half
//     a reader actually sees: the count sticks on 0 and then jumps to 17.
//
// So the cost stays off the animation and is paid AFTERWARDS, one screen at a
// time. `lazy` is read per screen on every render — BottomTabView checks the
// descriptor each pass, not a mount-time snapshot — so turning it off later is
// what builds that tab. Home is the initial route and is already up; the other
// four follow once the launch screen has gone and Home has finished arriving.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * In the order a reader is likeliest to want them.
 *
 * HOME IS IN THE LIST EVEN THOUGH IT IS THE TAB THE APP OPENS ON. `lazy` is
 * ignored for the focused screen, so on an ordinary launch its turn costs
 * nothing at all — but the app does not always open on Home. A widget deep link
 * lands on Thinkers (see the root layout's `pendingThinker`), and leaving Home
 * out means the one tab a reader is certain to press next is the one still
 * unbuilt. It is first for the same reason.
 */
/**
 * AND A HIDDEN ROUTE CAN NEED IT MORE THAN A TAB DOES. `streak` is pushed from
 * the count on Home and the count on Profile, so it is one tap from the two
 * screens a reader is on most -- and it was the only such route left lazy, which
 * means every reader paid for its whole tree INSIDE the 340ms cross-dissolve
 * that was supposed to be showing it to them. That is the "it doesn't open
 * cleanly the first time" report, and it is the same defect `lazy: false` was
 * introduced to fix for tabs.
 *
 * `settings`, `paywall`, `intro` and `devlessons` stay lazy on purpose. Settings
 * is two taps in behind a gear nobody presses twice a day; the paywall's expensive
 * half is the Pass tab's own chart, which that tab already builds; the intro plays
 * once per account; and devlessons is a tester. Warming is not free -- every entry is one more tree mounted for the
 * session -- so it is spent on the route a reader actually opens from a place
 * they are already standing.
 *
 * AND IT GOES THIRD, NOT LAST. Every step is 420ms, so the tail of this list
 * is not built until about 3.7s after the launch screen lifts -- warming a
 * screen into a slot the reader has already walked past is the weakest
 * version of the fix. Streak is the one entry here that is not a tab: every
 * other destination costs a deliberate press on the bar first, and this one
 * is a box on the screen the reader is already standing on.
 */
const WARM = ['index', 'branches', 'streak', 'philosophers', 'pass', 'profile'] as const;

// `launchDone` fires when the launch screen starts to LIFT, not when it leaves:
// its own art still has a 520ms dissolve to run, and Home's arrival stagger
// (Arrive.tsx — 360ms plus 60ms a block) is playing underneath it the whole
// time. Warming into either of those only moves the stutter onto the screen the
// reader was just handed. The outro is 280 + 240 + 520 = 1040ms from the lift,
// so 900 was not enough and 1200 is: the first screen is built after the last
// frame of the dissolve, not 140ms before it.
const SETTLE_MS = 1200;
// Then one screen per step, long enough that each gets a frame budget to itself
// rather than the four arriving as one burst. Every step also waits on
// InteractionManager, so a tap or an animation goes first.
const STEP_MS = 420;

/**
 * A tab's icon, and whether its tab is the one the reader is on.
 *
 * THE BAR NEVER TELLS AN ICON THAT ITS TAB WAS CHOSEN. TabBarIcon draws every
 * icon twice, one copy as focused and one as not, and switches between them by
 * opacity, so each copy's `focused` is fixed for life. The old MotiView here
 * "animated" on it and so never moved at all: the focused copy was simply always
 * drawn 16% larger. `open` comes from the route instead, which does change, and
 * it is what the icon's tile and bounce follow (see TabIcon).
 */
function tab(name: TabIconName, open: boolean) {
  return ({ focused }: { focused: boolean }) => <TabIcon name={name} lit={focused} open={open} />;
}

export default function AppLayout() {
  // Reserve room for the Android system nav bar / iOS home indicator so the tab
  // bar isn't hidden behind it. A fixed height with no inset put the icons
  // underneath the 3-button nav on Android.
  const insets = useSafeAreaInsets();

  // ── A LESSON IS NOT A TAB, AND THE BAR SHOULD NOT BE ACROSS IT ─────────────
  //
  // The lesson route lives under `branches`, which is a tab, so it inherited the
  // tab bar — five navigation icons pinned across the bottom of a full-screen,
  // tap-anywhere-to-advance cinematic scene. Two things were wrong with that:
  //
  // · A cinematic lesson advances on a tap ANYWHERE on the stage, and the bar sits
  //   in the bottom 70pt (104pt with a home indicator) of exactly that surface. A
  //   thumb reaching for the next beat and landing low does not advance the beat,
  //   it leaves the lesson — mid-lesson, with the reader's progress uncommitted,
  //   because the completion is only banked when they press Continue on the reward
  //   screen (see LessonReward). So the mis-tap costs the whole lesson.
  // · It is redundant. The lesson already carries its own ✕ and a progress bar; a
  //   second, competing way out says the screen is not really in charge of itself.
  //
  // `href: null` does NOT do this — it removes a tab's BUTTON, not the bar, which
  // is why settings / paywall / streak all show the bar too. Those keep it
  // deliberately: they are ordinary screens where tabbing away is the right
  // affordance, and hiding it on the paywall in particular would turn a
  // dismissible offer into something that reads as a trap.
  //
  // Matched on the segment rather than the pathname so it cannot be fooled by a
  // slug that happens to contain the word.
  const segments = useSegments() as string[];
  // The professor's intro is a film, like a lesson, and a stray tap on the bar
  // below it would leave mid-lecture — so it hides the bar for the same reasons.
  const inLesson = segments.includes('lesson') || segments.includes('intro');
  // The tab the reader is on, by route name. The index route has no segment of
  // its own. On a hidden route (settings, the paywall, the streak) no tab is open,
  // which is also what the bar itself shows.
  const current = segments[0] === '(app)' ? (segments[1] ?? 'index') : null;

  // How many of WARM have been built — see the note at the top of the file.
  const [warm, setWarm] = useState(0);
  const launchDone = useUIStore((s) => s.launchDone);
  useEffect(() => {
    if (!launchDone || warm >= WARM.length) return;
    let live = true;
    let interaction: { cancel: () => void } | null = null;
    const t = setTimeout(() => {
      if (!live) return;
      // A tap or an animation already in flight goes first: a screen being built
      // is never more urgent than the screen the reader is looking at.
      interaction = InteractionManager.runAfterInteractions(() => {
        if (live) setWarm((n) => n + 1);
      });
    }, warm === 0 ? SETTLE_MS : STEP_MS);
    return () => {
      live = false;
      clearTimeout(t);
      interaction?.cancel();
    };
  }, [launchDone, warm]);
  const built = (name: (typeof WARM)[number]) => WARM.indexOf(name) < warm;

  // A TAP ON THE FREE TRIAL'S REMINDER lands on the Pass tab, where the trial's
  // end and its Cancel button sit at the top. It waits for `launchDone`, which
  // comes after the auth redirect, so the root layout's `router.replace` to Home
  // cannot land on top of it.
  const pendingOpen = useUIStore((s) => s.pendingOpen);
  useEffect(() => {
    if (!launchDone || pendingOpen !== 'trial') return;
    useUIStore.getState().setPendingOpen(null);
    router.navigate('/(app)/pass');
  }, [launchDone, pendingOpen]);

  return (
    <Tabs
      // A light tap under the thumb when a tab is pressed. `touch()` rather than
      // a cue: moving between tabs is navigation, which makes no sound (see
      // lib/feedback.ts), but the press should still be felt to have landed.
      screenListeners={{ tabPress: () => touch() }}
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        // Tab switches used to be `none` — the default. The outgoing screen was
        // cut instantly and the new one appeared over the bare background, which
        // reads as a blink no matter how gently the new screen fades in. A real
        // cross-dissolve keeps BOTH screens on the glass for the whole handover,
        // so there is never an empty frame.
        animation: 'fade',
        transitionSpec: {
          animation: 'timing',
          config: { duration: 340, easing: Easing.out(Easing.cubic) },
        },
        // Every tab is still built without being visited — see the note at the
        // top of this file for WHEN, and for the measurement that moved it. Each
        // screen's own `lazy` overrides this default as its turn comes round.
        //
        // Building them at all is only affordable because the Thinkers grid is
        // virtualised — it used to build ~3,100 views on mount, and paying that
        // eagerly would have traded one stall for a worse one.
        lazy: true,
        // ── AND A BUILT TAB STOPS RE-RENDERING WHILE YOU ARE NOT ON IT ────────
        //
        // Building every tab is what makes the first visit instant; leaving all
        // six RENDERING for the rest of the session is what made the app go
        // sticky. Measured in the browser: Home alone is 383 nodes and the six
        // warmed tabs are 2,472 — so a single `set()` on the store, which is what
        // finishing a lesson or meeting a thinker does, walked 2,089 nodes nobody
        // was looking at.
        //
        // `freezeOnBlur` suspends a blurred screen's renders without unmounting
        // it, so the warm-up's whole point survives — nothing is rebuilt on the
        // way back, it just renders once with current data. This is the systemic
        // version of a guard three components had already hand-rolled one at a
        // time: `BranchWorld`'s frame callback says in as many words that "the
        // branches stack is a plain <Stack>, nothing calls enableFreeze or
        // freezeOnBlur, so pushing a lesson leaves the whole world mounted and
        // animating UNDERNEATH it", and names `StickmanStroll` and `HomeHeader` as
        // the same defect found twice before. Those guards stay — freezing is a
        // React-render concern and a UI-thread animation runs regardless — but
        // nothing else now has to remember.
        freezeOnBlur: true,
        tabBarStyle: inLesson
          // `display: 'none'` rather than a zero height: a 0-height bar still
          // takes hit-testing space at the bottom edge on Android, which is the
          // half of the problem that actually costs the reader a lesson.
          ? { display: 'none' }
          : {
              backgroundColor: '#FAFAF7',
              borderTopColor: '#1A1A1A',
              borderTopWidth: 1.5,
              height: 70 + insets.bottom,
              paddingTop: 10,
              paddingBottom: 12 + insets.bottom,
            },
        // No tint colours. TabIcon draws every icon in full colour and marks the
        // chosen tab with its own tile; the unchosen grey this used to set,
        // #B8B8B2, measured 1.9:1 on the bar, under the 3:1 a meaningful mark needs.
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Home', tabBarIcon: tab('home', current === 'index'), lazy: !built('index') }}
      />
      <Tabs.Screen
        name="branches"
        options={{ title: 'Branches', tabBarIcon: tab('learn', current === 'branches'), lazy: !built('branches') }}
      />
      <Tabs.Screen
        name="philosophers"
        options={{ title: 'Thinkers', tabBarIcon: tab('thinkers', current === 'philosophers'), lazy: !built('philosophers') }}
      />
      {/* ── FIVE TABS, AND STATISTICS IS THE ONE THAT WENT (2026-09-15) ─────
          The bar carried six. The owner asked for five: "instead of a dedicated
          statistics tab, I want all the statistics to be in the profile. And I
          want a much more condensed version of the statistics."

          The argument for a tab was never that the readings were unimportant, it
          was that they were interesting. That is the wrong test for a permanent
          slot: a destination earns one by being somewhere a reader chooses to GO,
          and a page of charts about what you have already done is somewhere they
          arrive at once and then stop opening. The Pass, directly below, earns its
          slot on the opposite ground: an offer that only appears when a reader is
          BLOCKED is an ambush, and one at a permanent address is a shop they can
          walk out of. The numbers earn a card inside Profile instead, which is
          where a reader already looks for facts about themselves.

          Deleting the tab also deleted the screen: `app/(app)/stats`, the whole of
          `components/stats`, `lib/utils/statsDiscovery`, `statsMilestone`,
          `dialHit` and `scripts/check-stats.mjs`. Condensing something into a
          second place and leaving the first one standing is how two screens end
          up disagreeing about one number, which §14 already records happening to
          the Pass. */}
      <Tabs.Screen
        name="pass"
        options={{ title: 'Pass', tabBarIcon: tab('pass', current === 'pass'), lazy: !built('pass') }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Profile', tabBarIcon: tab('profile', current === 'profile'), lazy: !built('profile') }}
      />
      {/* Reachable via router.push from the profile, hidden from the tab bar */}
      <Tabs.Screen name="settings" options={{ href: null }} />
      {/* Paywall — the full-screen route of the one paywall, hidden from tabs */}
      <Tabs.Screen name="paywall" options={{ href: null }} />
      {/* The professor's intro — opened from Home's Quick Start or the Learn tab,
          never by itself (2026-09-25). Hidden from tabs, and hides the bar. */}
      <Tabs.Screen name="intro" options={{ href: null }} />
      {/* The streak, pushed from wherever the count appears. A tab of its own was
          the obvious home and is still the wrong one — the streak does not need
          to outrank Learn to matter, and it is already one tap from every screen
          that shows the count. (The bar does now carry six; see the Pass note
          above for why that one earned the room and this one does not.) */}
      <Tabs.Screen name="streak" options={{ href: null, lazy: !built('streak') }} />
      {/* The lesson tester. Hidden from the tab bar AND gated inside the screen —
          a route can always be reached by URL, so the tab config is not the lock. */}
      <Tabs.Screen name="devlessons" options={{ href: null }} />
    </Tabs>
  );
}
