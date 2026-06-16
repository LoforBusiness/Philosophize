import { create } from 'zustand';

interface UIStore {
  showExitConfirm: boolean;
  setShowExitConfirm: (val: boolean) => void;
  pendingAchievements: string[];
  addAchievement: (id: string) => void;
  clearAchievements: () => void;
  // Philosopher bottom sheet — set to an id to slide it up, null to dismiss.
  philosopherSheetId: string | null;
  openPhilosopher: (id: string) => void;
  closePhilosopher: () => void;
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
}

export const useUIStore = create<UIStore>((set) => ({
  showExitConfirm: false,
  setShowExitConfirm: (val) => set({ showExitConfirm: val }),
  pendingAchievements: [],
  addAchievement: (id) =>
    set((state) => ({ pendingAchievements: [...state.pendingAchievements, id] })),
  clearAchievements: () => set({ pendingAchievements: [] }),
  philosopherSheetId: null,
  openPhilosopher: (id) => set({ philosopherSheetId: id }),
  closePhilosopher: () => set({ philosopherSheetId: null }),
  ranksBadgesTab: null,
  openRanksBadges: (tab) => set({ ranksBadgesTab: tab }),
  closeRanksBadges: () => set({ ranksBadgesTab: null }),
  savedQuotesOpen: false,
  openSavedQuotes: () => set({ savedQuotesOpen: true }),
  closeSavedQuotes: () => set({ savedQuotesOpen: false }),
  paywallOpen: false,
  openPaywall: () => set({ paywallOpen: true }),
  closePaywall: () => set({ paywallOpen: false }),
}));
