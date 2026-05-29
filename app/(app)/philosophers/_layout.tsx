import { Stack } from 'expo-router';

// Keeps philosopher detail + quiz screens inside this tab's own stack so they
// don't leak into the bottom tab bar as extra buttons.
export default function PhilosophersLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
