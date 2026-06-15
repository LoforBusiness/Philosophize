import type { ColorValue } from 'react-native';
import { Tabs } from 'expo-router';
import { MotiView } from 'moti';
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
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: '#FAFAF7',
          borderTopColor: '#1A1A1A',
          borderTopWidth: 1.5,
          height: 70,
          paddingTop: 10,
          paddingBottom: 12,
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
    </Tabs>
  );
}
