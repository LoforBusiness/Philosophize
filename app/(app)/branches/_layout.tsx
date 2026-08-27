import { Stack } from 'expo-router';

// ── THE BRANCH LIST IS ALWAYS UNDERNEATH, AND UNTIL NOW IT WAS NOT ──────────
//
//   "when I try click the back arrow, it goes back to the home page. And then if
//    I go back to the learn tab, it's still on the branch I was on. I cannot go
//    back to all the listed branches."
//
// Both halves of that are one fault. A nested stack with no ANCHOR is built from
// whatever href you enter it by, and this tab is entered from outside itself
// three ways — Quick Start pushes straight to a LESSON from Home, the thinker
// sheet does the same, and `LessonReward` finishes by REPLACING the route with
// the branch. Every one of those makes the stack exactly one screen deep, with
// no list beneath it. So `router.back()` has nothing to pop, hands the press up
// to the tab navigator, and the default `backBehavior` takes the reader to the
// first tab — Home. Meanwhile the stack still holds the branch, which is why
// coming back to Learn shows it again with no way out.
//
// Reproduced in the real app before it was believed: enter `/branches/logic` by
// URL, press the screen's own back arrow, and the page shows Home while the URL
// still reads `/branches/logic` — the stack never moved, only the focused tab.
//
// `anchor` is what puts `index` under any deeper entry, so back always pops to
// the list. (Expo Router 56 takes `anchor`; `initialRouteName` is the old name
// for the same field.) It costs nothing on an ordinary tap-through from the
// list, where the stack already had two entries.
export const unstable_settings = { anchor: 'index' };

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
        // The branch screen underneath a lesson stops re-rendering while the
        // lesson is up. `BranchWorld` already pauses its own frame callback on
        // blur and says why — this is the React half of the same thing, and it
        // means the walked road is not being re-rendered behind an opaque
        // cinematic screen for the length of a lesson.
        freezeOnBlur: true,
      }}
    />
  );
}
