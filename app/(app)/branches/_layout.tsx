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
// `anchor` is what puts `index` under a deeper entry. (Expo Router 56 takes
// `anchor`; `initialRouteName` is the old name for the same field.) It costs
// nothing on an ordinary tap-through from the list, where the stack already had
// two entries.
//
// ── AND IT WAS NOT ENOUGH, WHICH IS WHY components/lesson/lessonNav.ts EXISTS ─
//
// The same report came back after this line shipped, from Quick Start, and two
// things were still wrong. Neither is visible to the URL test above, because
// LOADING a URL is the one navigation that always honours the anchor:
//
//   · DECLARING an anchor is not LOADING it. A `router.push` into this tab before
//     it has been built creates the stack from the pushed href alone unless the
//     push passes `withAnchor: true`. Measured: `[LESSON]`, nothing under it.
//   · A `replace` removes whatever is on top, and after `exitLesson()` pops a
//     Quick Start lesson, what is on top is the LIST. The reward replaced it,
//     leaving `[BRANCH]` — back fell through to Home, and this tab showed that
//     branch for good.
//
// So every entry from outside this tab goes through `openLesson`, the landing
// after a lesson goes through `landOnBranch`, and `npm run check:nav` holds both.
export const unstable_settings = { anchor: 'index' };

// Keeps branch / path / lesson screens inside this tab's own stack so they
// don't leak into the bottom tab bar as extra buttons.
//
// The push animation is declared here rather than left to the platform default:
// a branch rises into place from slightly below as it fades, so opening one
// reads as the page settling onto the desk instead of a hard cut. It belongs in
// ONE place, because the screens themselves no longer animate on focus (see
// ScreenTransition) — two fades stacked on one push looked worse than either.
//
// ── AND A SCREEN OPENED FROM HOME DOES NOT ANIMATE HERE AT ALL (2026-10-01) ──
//
//   "if I click on one of the subjects … it's pretty laggy or it's pretty glitchy
//    … This is also for the quick start."
//
// A road or a lesson opened from Home changes TAB as well as pushing, and the tab
// navigator already cross-fades Home into Learn over 340ms. With this stack's own
// rise-and-fade running at the same time, two animations multiplied on one screen,
// and while the pushed screen was still faint the Learn tab's grid underneath it
// (the anchor) — or whatever road was last open there — showed through. So a push
// carrying `from=home` lands instantly inside a tab that is itself fading in: one
// movement, Home dissolving into the destination, and nothing else on the glass.
// `openSubject` and the Quick Start card both send it.
export default function BranchesLayout() {
  return (
    <Stack
      screenOptions={({ route }) => ({
        headerShown: false,
        animation: (route.params as { from?: string } | undefined)?.from === 'home' ? 'none' : 'fade_from_bottom',
        animationDuration: 340,
        // The branch screen underneath a lesson stops re-rendering while the
        // lesson is up. `BranchWorld` already pauses its own frame callback on
        // blur and says why — this is the React half of the same thing, and it
        // means the walked road is not being re-rendered behind an opaque
        // cinematic screen for the length of a lesson.
        freezeOnBlur: true,
      })}
    />
  );
}
