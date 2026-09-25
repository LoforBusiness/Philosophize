import { router } from 'expo-router';

// ─────────────────────────────────────────────────────────────────────────────
// THE ONE CALL BOTH DOORS MAKE.
//
// The professor's intro is opened by the reader and by nothing else (2026-09-25):
// Home's Quick Start card and the Learn tab's intro card are its two doors. Both
// call this, so the route string lives in one place, and both say where they are,
// so the intro can put the reader back exactly there when it is over.
// ─────────────────────────────────────────────────────────────────────────────

export type IntroFrom = 'home' | 'learn';

export function openIntro(from: IntroFrom): void {
  router.push({ pathname: '/(app)/intro', params: { from } });
}

/** Where a reader goes when the intro is done or dismissed. */
export function leaveIntro(from: IntroFrom | undefined): void {
  if (from === 'learn') router.navigate('/(app)/branches');
  else router.navigate('/(app)');
}
