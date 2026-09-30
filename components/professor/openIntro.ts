import { router } from 'expo-router';
import { openSubject } from '@/components/lesson/lessonNav';

// ─────────────────────────────────────────────────────────────────────────────
// THE ONE CALL BOTH DOORS MAKE.
//
// The professor's intro is opened by the reader and by nothing else (2026-09-25):
// Home's Quick Start card and the Learn tab's intro card are its two doors. Both
// call this, so the route string lives in one place, and both say where they are,
// so the intro can put the reader back exactly there when it is over.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * THE INTRO IS OFF (2026-09-30). Its six recorded lines say "Philosophy has six
 * branches" and name logic, ethics and epistemology; since philosophy became one road
 * among seven subjects that is no longer true, and the owner chose to switch it off
 * until it is re-recorded about all seven. Both doors and the lesson route's backstop
 * read this, so nothing offers or plays it. Everything else — the film, its voice,
 * the `seenProfessorIntro` flag and its sync — stays, so turning it back on is this
 * one line. A free reader who taps a lesson now meets the paywall directly.
 */
export const PROFESSOR_INTRO_ON = false;

export type IntroFrom = 'home' | 'learn';

export function openIntro(from: IntroFrom): void {
  router.push({ pathname: '/(app)/intro', params: { from } });
}

/**
 * Where a reader goes when the intro is done or dismissed.
 *
 * `learn` means the Philosophy page now (2026-09-29): the intro card moved there from
 * the Learn tab when the tab became a grid of subjects, so that is where the reader
 * pressed it and where the six branches it unlocks are waiting. The intro is a
 * hidden TAB, and the tabs go back by history, so `back()` returns to the Learn tab
 * with its stack as it was — the Philosophy page on top of the grid. Only when there
 * is no history (a cold deep link) is the page opened, through the one door.
 */
export function leaveIntro(from: IntroFrom | undefined): void {
  if (from === 'learn') {
    if (router.canGoBack()) router.back();
    else openSubject('philosophy');
  }
  else router.navigate('/(app)');
}
