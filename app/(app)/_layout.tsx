import { Easing, type ColorValue } from 'react-native';
import { Tabs } from 'expo-router';
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
        tabBarStyle: {
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
      {/* The lesson tester. Hidden from the tab bar AND gated inside the screen —
          a route can always be reached by URL, so the tab config is not the lock. */}
      <Tabs.Screen name="devlessons" options={{ href: null }} />
    </Tabs>
  );
}
