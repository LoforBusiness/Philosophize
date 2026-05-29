import type { ColorValue } from 'react-native';
import { Tabs } from 'expo-router';
import SketchIcon, { type SketchIconName } from '@/components/shared/SketchIcon';

function tab(name: SketchIconName) {
  return ({ color }: { color: ColorValue }) => (
    <SketchIcon name={name} color={color as string} size={28} />
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
      <Tabs.Screen name="philosophers" options={{ title: 'Thinkers', tabBarIcon: tab('mic') }} />
      <Tabs.Screen name="stats" options={{ title: 'Stats', tabBarIcon: tab('frame') }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: tab('person') }} />
    </Tabs>
  );
}
