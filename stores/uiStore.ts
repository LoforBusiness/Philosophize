import { create } from 'zustand';

interface UIStore {
  showExitConfirm: boolean;
  setShowExitConfirm: (val: boolean) => void;
  pendingAchievements: string[];
  addAchievement: (id: string) => void;
  clearAchievements: () => void;
  // Philosopher bottom sheet — set to an id to slide it up, null to dismiss.
  philosopherSheetId: string | null;
  // Bumped on every openPhilosopher call (even for the same id) so the sheet can
  // reset its scroll position to the top each time it is raised.
  philosopherSheetSeq: number;
  openPhilosopher: (id: string) => void;
  closePhilosopher: () => void;
  // A philosopher waiting to be shown once the Thinkers screen has settled —
  // set by deep links (home-screen widget), consumed by the Thinkers screen.
  // Decoupling the two survives cold starts, where a fixed timer would fire
  // before the sheet host is even mounted.
  pendingPhilosopherId: string | null;
  setPendingPhilosopher: (id: string | null) => void;
  // Ranks & Badges sheet — which tab to open it on, or null when dismissed.
  ranksBadgesTab: 'ranks' | 'badges' | null;
  openRanksBadges: (tab: 'ranks' | 'badges') => void;
  closeRanksBadges: () => void;
  // Saved Quotes sheet — slides up the user's full quote collection.
  savedQuotesOpen: boolean;
  openSavedQuotes: () => void;
  closeSavedQuotes: () => void;
  // Paywall sheet — slides the Scholar's Pass offer up as a dismissible option
  // (after a lesson, or from the daily-limit gate).
  paywallOpen: boolean;
  openPaywall: () => void;
  closePaywall: () => void;
  // True once the animated launch screen has finished and lifted away. Lives here
  // rather than in _layout's local state because the welcome animation needs it:
  // the launch screen covers the whole boot (~4s), and index.tsx mounts underneath
  // it, so a timeline started at mount would play its opening to a hidden screen.
  launchDone: boolean;
  setLaunchDone: (v: boolean) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  showExitConfirm: false,
  setShowExitConfirm: (val) => set({ showExitConfirm: val }),
  pendingAchievements: [],
  addAchievement: (id) =>
    set((state) => ({ pendingAchievements: [...state.pendingAchievements, id] })),
  clearAchievements: () => set({ pendingAchievements: [] }),
  philosopherSheetId: null,
  philosopherSheetSeq: 0,
  openPhilosopher: (id) =>
    set((s) => ({ philosopherSheetId: id, philosopherSheetSeq: s.philosopherSheetSeq + 1 })),
  closePhilosopher: () => set({ philosopherSheetId: null }),
  pendingPhilosopherId: null,
  setPendingPhilosopher: (id) => set({ pendingPhilosopherId: id }),
  ranksBadgesTab: null,
  openRanksBadges: (tab) => set({ ranksBadgesTab: tab }),
  closeRanksBadges: () => set({ ranksBadgesTab: null }),
  savedQuotesOpen: false,
  openSavedQuotes: () => set({ savedQuotesOpen: true }),
  closeSavedQuotes: () => set({ savedQuotesOpen: false }),
  paywallOpen: false,
  openPaywall: () => set({ paywallOpen: true }),
  closePaywall: () => set({ paywallOpen: false }),
  launchDone: false,
  setLaunchDone: (v) => set({ launchDone: v }),
}));
