import { router } from 'expo-router';

// Leave a lesson without ever stranding the user on an empty navigation stack.
//
// `router.back()` pops into NOTHING when the lesson was the only screen on its
// stack — which happens whenever a lesson is entered directly rather than by
// walking Branches → branch → unit → lesson: a deep link, a notification, a shared
// link, or a "start lesson" jump from Home / the widget. On completion the reward
// is shown as a global overlay and the screen navigates underneath it; if that
// navigation empties the stack, dismissing the reward reveals a blank white screen
// (and the same happens on the ✕ close button). Guarding with `canGoBack()` keeps
// the normal in-tab flow identical (back to the lesson list) while falling back to
// the branches list on an otherwise-empty stack.
export function exitLesson() {
  if (router.canGoBack()) router.back();
  else router.replace('/(app)/branches');
}
