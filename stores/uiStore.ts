import { create } from 'zustand';

interface UIStore {
  showExitConfirm: boolean;
  setShowExitConfirm: (val: boolean) => void;
  pendingAchievements: string[];
  addAchievement: (id: string) => void;
  clearAchievements: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  showExitConfirm: false,
  setShowExitConfirm: (val) => set({ showExitConfirm: val }),
  pendingAchievements: [],
  addAchievement: (id) =>
    set((state) => ({ pendingAchievements: [...state.pendingAchievements, id] })),
  clearAchievements: () => set({ pendingAchievements: [] }),
}));
