import { Easing, type ColorValue } from 'react-native';
import { Tabs, useSegments } from 'expo-router';
import { MotiView } from 'moti';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SketchIcon, { type SketchIconName } from '@/components/shared/SketchIcon';

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
        // BUILD EVERY TAB UP FRONT, BEHIND THE LAUNCH SCREEN.
        //
        // Tabs lazy-mount by default, so the first visit to each one paid for its
        // whole tree right as the reader arrived — which is exactly the "first time I
        // switch tabs it's slow" complaint. The work never went away, it just landed
        // at the worst possible moment.
        //
        // There is already a launch animation sitting over the app for a couple of
        // seconds while auth and hydration finish, and it runs on the UI thread, so
        // JS mounting screens underneath does not stutter it. Move the cost there and
        // every tab is already built by the time the reader can press anything.
        //
        // This is only affordable because the Thinkers grid is virtualised — it used
        // to build ~3,100 views on mount, and eagerly paying that at startup would
        // have traded one stall for a worse one.
        lazy: false,
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
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: tab('home') }} />
      <Tabs.Screen name="branches" options={{ title: 'Branches', tabBarIcon: tab('cloud') }} />
      <Tabs.Screen name="philosophers" options={{ title: 'Thinkers', tabBarIcon: tab('hat') }} />
      <Tabs.Screen name="stats" options={{ title: 'Stats', tabBarIcon: tab('frame') }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: tab('person') }} />
      {/* Reachable via router.push from the profile, hidden from the tab bar */}
      <Tabs.Screen name="settings" options={{ href: null }} />
      {/* Paywall — pushed from Settings and the daily-limit gate, hidden from tabs */}
      <Tabs.Screen name="paywall" options={{ href: null }} />
      {/* The streak, pushed from wherever the count appears. A sixth tab was the
          obvious home and is the wrong one: at 390pt that is ~62pt a tab and the
          labels clip, and the streak does not need to outrank Learn to matter. */}
      <Tabs.Screen name="streak" options={{ href: null }} />
      {/* The lesson tester. Hidden from the tab bar AND gated inside the screen —
          a route can always be reached by URL, so the tab config is not the lock. */}
      <Tabs.Screen name="devlessons" options={{ href: null }} />
    </Tabs>
  );
}
