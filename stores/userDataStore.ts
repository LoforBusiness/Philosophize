import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// A quote the user has bookmarked. Self-contained so the profile/stats
// screens never need to look the philosopher back up.
export interface SavedQuote {
  id: string;            // quote id from philosopher data (e.g. 'socrates-1')
  text: string;
  author: string;        // philosopher display name
  philosopherId: string;
  branchSlugs: string[]; // areas this quote contributes to (copied from philosopher)
  savedAt: number;
}

interface UserDataState {
  savedQuotes: SavedQuote[];
  philosopherViews: Record<string, number>; // philosopherId -> times profile opened
  lessonsByBranch: Record<string, number>;   // branchSlug -> lessons completed
  voiceEnabled: boolean;                      // narrate lessons aloud + reveal words
  _hasHydrated: boolean;

  saveQuote: (q: SavedQuote) => void;
  removeQuote: (id: string) => void;
  toggleQuote: (q: SavedQuote) => void;
  isQuoteSaved: (id: string) => boolean;
  recordPhilosopherView: (philosopherId: string) => void;
  recordLessonComplete: (branchSlug: string) => void;
  setVoiceEnabled: (v: boolean) => void;
  setHasHydrated: (v: boolean) => void;
}

export const useUserDataStore = create<UserDataState>()(
  persist(
    (set, get) => ({
      savedQuotes: [],
      philosopherViews: {},
      lessonsByBranch: {},
      voiceEnabled: true,
      _hasHydrated: false,

      saveQuote: (q) =>
        set((state) => {
          if (state.savedQuotes.some((x) => x.id === q.id)) return state;
          return { savedQuotes: [q, ...state.savedQuotes] };
        }),

      removeQuote: (id) =>
        set((state) => ({
          savedQuotes: state.savedQuotes.filter((x) => x.id !== id),
        })),

      toggleQuote: (q) =>
        set((state) => {
          const exists = state.savedQuotes.some((x) => x.id === q.id);
          return {
            savedQuotes: exists
              ? state.savedQuotes.filter((x) => x.id !== q.id)
              : [q, ...state.savedQuotes],
          };
        }),

      isQuoteSaved: (id) => get().savedQuotes.some((x) => x.id === id),

      recordPhilosopherView: (philosopherId) =>
        set((state) => ({
          philosopherViews: {
            ...state.philosopherViews,
            [philosopherId]: (state.philosopherViews[philosopherId] ?? 0) + 1,
          },
        })),

      recordLessonComplete: (branchSlug) =>
        set((state) => ({
          lessonsByBranch: {
            ...state.lessonsByBranch,
            [branchSlug]: (state.lessonsByBranch[branchSlug] ?? 0) + 1,
          },
        })),

      setVoiceEnabled: (v) => set({ voiceEnabled: v }),

      setHasHydrated: (v) => set({ _hasHydrated: v }),
    }),
    {
      name: 'philosophize-userdata',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        savedQuotes: state.savedQuotes,
        philosopherViews: state.philosopherViews,
        lessonsByBranch: state.lessonsByBranch,
        voiceEnabled: state.voiceEnabled,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
