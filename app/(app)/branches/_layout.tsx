import { Stack } from 'expo-router';

// Keeps branch / path / lesson screens inside this tab's own stack so they
// don't leak into the bottom tab bar as extra buttons.
export default function BranchesLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
