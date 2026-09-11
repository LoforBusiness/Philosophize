import { router } from 'expo-router';

// ── THE TWO WAYS INTO AND OUT OF A LESSON THAT CAN STRAND THE LEARN TAB ─────
//
//   "if you [use quick start], then complete the lesson … and try go back and look
//    at the other branches, it goes back to the home screen … when you push the
//    learn tab, it goes to that branch, and does not let you look at any of the
//    other six branches."
//
// That report had been fixed once already, by giving the branches stack an
// `anchor` (see its _layout). The anchor was verified by LOADING a deep URL, and
// loading a URL is the one navigation that always honours it. Replaying the real
// journey against the real router — Quick Start's push, `exitLesson()`, the
// reward's landing — found the two things a URL test cannot see:
//
//   · A PUSH DOES NOT LOAD THE ANCHOR UNLESS IT ASKS TO. Declaring `anchor` sets
//     the stack's initial route; whether that route is put underneath is decided
//     per navigation, by `withAnchor`. From Home, into a Learn tab not yet built,
//     a plain push produced `[LESSON]` with nothing under it — and `exitLesson()`,
//     whose `canGoBack()` counts TAB history, then went back to the Home tab and
//     left the finished lesson sitting in Learn.
//
//   · A REPLACE REMOVES WHATEVER IS ON TOP, AND AFTER A QUICK START LESSON THAT IS
//     THE LIST. With the tab built, the push does land as `[LIST > LESSON]`, and
//     `exitLesson()` pops back to `[LIST]`. The reward then saw it was "not on the
//     branch" and did `router.replace('/(app)/branches/<slug>')` — replacing the
//     list itself. `[BRANCH]`, nothing under it: back fell through to Home, and the
//     Learn tab could only ever show that branch.
//
// Both are the stack losing the list at its root, so both live here, and
// `npm run check:nav` holds that nothing outside the branches stack opens a
// lesson any other way, that every push here is anchored, and that nothing here
// replaces.

/**
 * Open a lesson from anywhere — Home's Quick Start, the thinker sheet, the tester.
 *
 * ANCHORED, so the Learn tab's list is underneath however cold the tab is. From a
 * screen already inside the branches stack the anchor changes nothing, because
 * the list is already there; that is why the branch screen's own push does not
 * need to come through here.
 *
 * THE ANCHOR COSTS ONE PARAM, AND IT IS KEPT ON PURPOSE. expo-router 56 marks it
 * by writing React Navigation's reserved `initial: false` into the pushed params
 * at EVERY level, the leaf screen included, where nothing consumes it — so on web
 * the URL reads `…/lesson/<id>?initial=false`. On the phone it is inert, and that
 * was checked rather than assumed: the lesson reads only `lessonId` and `test`,
 * the branch only `branchSlug`, and `$screen` is built from `usePathname()`, which
 * carries no query.
 *
 * The anchor-free alternative — leave the push plain and make `exitLesson` smarter
 * — was rejected on a fact about this app: NOTHING HANDLES THE ANDROID BACK BUTTON
 * (no BackHandler, no beforeRemove, anywhere). A lesson pushed with nothing under
 * it is stranded by the hardware button whatever the ✕ does, so the list has to
 * be there from the push.
 */
export function openLesson(branchSlug: string, unitSlug: string, lessonId: string, query = '') {
  router.push(`/(app)/branches/${branchSlug}/${unitSlug}/lesson/${lessonId}${query}` as never, {
    withAnchor: true,
  });
}

/**
 * After a lesson, put its branch in front of the reader with the list under it.
 *
 * `path` is where the stack is NOW (the caller's `usePathname()`). On an ordinary
 * tap-through `exitLesson()` has already popped back to the branch, and navigating
 * again would remount the very screen that was just handed the walk — so it does
 * nothing and says so.
 *
 * Otherwise it PUSHES. Never `replace`: the screen it would replace is, in the
 * Quick Start case, the list. Returns whether it navigated.
 */
export function landOnBranch(branchSlug: string, path: string | null | undefined): boolean {
  const alreadyThere = !!path && path.includes(`/branches/${branchSlug}`) && !path.includes('/lesson/');
  if (alreadyThere) return false;
  router.push(`/(app)/branches/${branchSlug}` as never, { withAnchor: true });
  return true;
}
