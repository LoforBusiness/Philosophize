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
}));
