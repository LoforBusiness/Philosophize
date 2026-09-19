// ─────────────────────────────────────────────────────────────────────────────
// WHAT THE LESSON GUIDE AND THE PLAYER SAY TO EACH OTHER.
//
// The guide is mounted by the LESSON ROUTE, not by a player (see LessonGuide.tsx for
// why), so it cannot hand the player a prop. Three things cross between them:
//
//   open      The guide is up. The player holds its voice until it goes, so the
//             first line is not spoken to a reader who is still reading the guide.
//   GUIDE_HOLD  The same fact on the UI thread. The player's frame callback stops
//             the BEAT clock while it is 1 — the lesson waits at its first frame
//             behind the glass and plays its opening from the start once the guide
//             closes — while the ambient clock runs on, so the figure still breathes.
//   wordsRef  The header's Aa button, so the guide can MEASURE it and ring the real
//             button rather than a guess at where the header puts it.
//
// Harnesses render lesson components directly and never mount the route, so for
// them `open` stays false and GUIDE_HOLD stays 0: the guide cannot freeze a sweep.
// ─────────────────────────────────────────────────────────────────────────────
import type { RefObject } from 'react';
import type { View } from 'react-native';
import { create } from 'zustand';
import { makeMutable } from 'react-native-reanimated';

interface GuideState {
  open: boolean;
  wordsRef: RefObject<View | null> | null;
  setWordsRef: (r: RefObject<View | null> | null) => void;
}

export const useGuideStore = create<GuideState>((set) => ({
  open: false,
  wordsRef: null,
  setWordsRef: (r) => set({ wordsRef: r }),
}));

/** 1 while the guide is up: the beat clock waits. Read in the players' frame callbacks. */
export const GUIDE_HOLD = makeMutable(0);

/**
 * Open or close the guide. Called by the route BEFORE the player first renders, so
 * the player's first frame and first narration effect already see it — setting it
 * in an effect would let the opening line start and then be cut.
 */
export function setGuideOpen(open: boolean) {
  GUIDE_HOLD.value = open ? 1 : 0;
  if (useGuideStore.getState().open !== open) useGuideStore.setState({ open });
}
