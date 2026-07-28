import { Stack } from 'expo-router';

// Keeps any nested philosopher screens inside this tab's own stack so they
// don't leak into the bottom tab bar as extra buttons.
// Same push animation as the branches stack, so drilling in feels identical
// wherever you do it.
export default function PhilosophersLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade_from_bottom',
        animationDuration: 340,
      }}
    />
  );
}
