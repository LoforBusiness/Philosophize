import { Stack } from 'expo-router';

// Keeps branch / path / lesson screens inside this tab's own stack so they
// don't leak into the bottom tab bar as extra buttons.
//
// The push animation is declared here rather than left to the platform default:
// a branch rises into place from slightly below as it fades, so opening one
// reads as the page settling onto the desk instead of a hard cut. It belongs in
// ONE place, because the screens themselves no longer animate on focus (see
// ScreenTransition) — two fades stacked on one push looked worse than either.
export default function BranchesLayout() {
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
