import { useEffect, useState } from 'react';
import { Easing, InteractionManager, type ColorValue } from 'react-native';
import { Tabs, useSegments } from 'expo-router';
import { MotiView } from 'moti';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SketchIcon, { type SketchIconName } from '@/components/shared/SketchIcon';
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
 * `settings`, `paywall` and `devlessons` stay lazy on purpose. Settings is two
 * taps in behind a gear nobody presses twice a day; the paywall's expensive half
 * is `PaywallContent`, which the Pass tab already builds; and devlessons is a
 * tester. Warming is not free -- every entry is one more tree mounted for the
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
const WARM = ['index', 'branches', 'streak', 'philosophers', 'stats', 'pass', 'profile'] as const;

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

function tab(name: SketchIconName) {
  return ({ color, focused }: { color: ColorValue; focused: boolean }) => (
    <MotiView
      animate={{ scale: focused ? 1.16 : 1, translateY: focused ? -2 : 0 }}
      transition={{ type: 'spring', damping: 13, stiffness: 220, mass: 0.6 }}
    >
      <SketchIcon name={name} color={color as string} size={26} />
    </MotiView>
  );
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
  const inLesson = segments.includes('lesson');

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

  return (
    <Tabs
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
        tabBarActiveTintColor: '#1A1A1A',
        tabBarInactiveTintColor: '#B8B8B2',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Home', tabBarIcon: tab('home'), lazy: !built('index') }}
      />
      <Tabs.Screen
        name="branches"
        options={{ title: 'Branches', tabBarIcon: tab('cloud'), lazy: !built('branches') }}
      />
      <Tabs.Screen
        name="philosophers"
        options={{ title: 'Thinkers', tabBarIcon: tab('hat'), lazy: !built('philosophers') }}
      />
      <Tabs.Screen
        name="stats"
        options={{ title: 'Stats', tabBarIcon: tab('frame'), lazy: !built('stats') }}
      />
      {/* ── THE SIXTH TAB, AND THE NOTE BELOW USED TO ARGUE AGAINST ONE ─────
          The streak was considered for a sixth slot and rejected because "at
          390pt that is ~62pt a tab and the labels clip". That reasoning was
          sound and it does not apply here: `tabBarShowLabel` is false, so there
          are no labels to clip — the bar carries 26pt icons that grow to about
          30 when focused. Six of those on the narrowest phone this app supports
          is 60pt a tab, which is twice the icon.

          What DID have to be re-checked is the thing the old note was really
          about: whether a sixth destination earns the room. It does, and for a
          reason the streak did not have — a paywall that only appears when a
          reader is BLOCKED is an ambush, and one at a permanent address is a
          shop they can walk out of. */}
      <Tabs.Screen
        name="pass"
        options={{ title: 'Pass', tabBarIcon: tab('pass'), lazy: !built('pass') }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Profile', tabBarIcon: tab('person'), lazy: !built('profile') }}
      />
      {/* Reachable via router.push from the profile, hidden from the tab bar */}
      <Tabs.Screen name="settings" options={{ href: null }} />
      {/* Paywall — pushed from Settings and the daily-limit gate, hidden from tabs */}
      <Tabs.Screen name="paywall" options={{ href: null }} />
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
