import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BADGES, type ProgressStats } from '@/data/badges';
import { ALL_BRANCHES } from '@/data';

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

export interface AppSettings {
  // Notifications
  dailyReminder: boolean;
  reminderTime: string; // e.g. '08:00 AM'
  streakAlerts: boolean;
  badgeEarned: boolean;
  weeklySummary: boolean;
  quoteOfDay: boolean;
  // Learning
  dailyGoalMinutes: number; // 5–120
  autoAdvance: boolean;
  // Privacy
  publicProfile: boolean;
  showStreak: boolean;
  showRankBadges: boolean;
  usageAnalytics: boolean;
  // Language
  appLanguage: string;
  quoteDisplay: 'original' | 'translated' | 'both';
  // Data
  autoBackup: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  dailyReminder: true,
  reminderTime: '08:00 AM',
  streakAlerts: true,
  badgeEarned: true,
  weeklySummary: false,
  quoteOfDay: true,
  dailyGoalMinutes: 20,
  autoAdvance: true,
  publicProfile: false,
  showStreak: true,
  showRankBadges: true,
  usageAnalytics: true,
  appLanguage: 'English',
  quoteDisplay: 'original',
  autoBackup: true,
};

interface UserDataState {
  savedQuotes: SavedQuote[];
  philosopherViews: Record<string, number>; // philosopherId -> times profile opened
  lessonsByBranch: Record<string, number>;   // branchSlug -> lessons completed
  voiceEnabled: boolean;                      // narrate lessons aloud + reveal words
  beliefResultId: string | null;             // legacy (belief quiz removed)
  streak: number;                             // consecutive-day streak
  lastLessonDate: string | null;             // YYYY-MM-DD of last completed lesson
  joinedAt: number | null;                    // epoch ms of first app open
  earnedBadges: string[];                     // badge ids the user has earned (persists)
  badgesInitialized: boolean;                 // one-time backfill guard
  displayName: string;
  email: string;
  bio: string;
  settings: AppSettings;
  _hasHydrated: boolean;

  saveQuote: (q: SavedQuote) => void;
  removeQuote: (id: string) => void;
  toggleQuote: (q: SavedQuote) => void;
  isQuoteSaved: (id: string) => boolean;
  recordPhilosopherView: (philosopherId: string) => void;
  recordLessonComplete: (branchSlug: string) => void;
  setVoiceEnabled: (v: boolean) => void;
  setBeliefResult: (id: string | null) => void;
  ensureJoinDate: () => void;
  registerDailyActivity: (
    today: string,
    yesterday: string
  ) => { firstOfDay: boolean; streak: number; prevStreak: number };
  recomputeBadges: () => void;
  setProfile: (patch: Partial<{ displayName: string; email: string; bio: string }>) => void;
  setSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
  resetProgress: () => void;
  clearSavedQuotes: () => void;
  revokeBadges: () => void;
  deleteAccount: () => void;
  setHasHydrated: (v: boolean) => void;
}

// Build a progress snapshot used to evaluate badge conditions.
function computeStats(s: {
  lessonsByBranch: Record<string, number>;
  savedQuotes: SavedQuote[];
  philosopherViews: Record<string, number>;
  streak: number;
}): ProgressStats {
  const lessons = Object.values(s.lessonsByBranch).reduce((a, b) => a + b, 0);
  const quotes = s.savedQuotes.length;
  const philosophers = Object.keys(s.philosopherViews).length;
  const totalXP = lessons * 25 + quotes * 10 + philosophers * 5;
  const mastery: Record<string, number> = {};
  for (const b of ALL_BRANCHES) {
    const total = b.paths.reduce((acc, p) => acc + p.lessons.length, 0);
    const done = s.lessonsByBranch[b.slug] ?? 0;
    mastery[b.slug] = total > 0 ? Math.min(100, Math.round((done / total) * 100)) : 0;
  }
  return { totalXP, lessons, quotes, philosophers, streak: s.streak, mastery };
}

export const useUserDataStore = create<UserDataState>()(
  persist(
    (set, get) => ({
      savedQuotes: [],
      philosopherViews: {},
      lessonsByBranch: {},
      voiceEnabled: true,
      beliefResultId: null,
      streak: 0,
      lastLessonDate: null,
      joinedAt: null,
      earnedBadges: [],
      badgesInitialized: false,
      displayName: 'Philosopher',
      email: '',
      bio: '',
      settings: DEFAULT_SETTINGS,
      _hasHydrated: false,

      saveQuote: (q) => {
        set((state) => {
          if (state.savedQuotes.some((x) => x.id === q.id)) return state;
          return { savedQuotes: [q, ...state.savedQuotes] };
        });
        get().recomputeBadges();
      },

      removeQuote: (id) =>
        set((state) => ({
          savedQuotes: state.savedQuotes.filter((x) => x.id !== id),
        })),

      toggleQuote: (q) => {
        set((state) => {
          const exists = state.savedQuotes.some((x) => x.id === q.id);
          return {
            savedQuotes: exists
              ? state.savedQuotes.filter((x) => x.id !== q.id)
              : [q, ...state.savedQuotes],
          };
        });
        get().recomputeBadges();
      },

      isQuoteSaved: (id) => get().savedQuotes.some((x) => x.id === id),

      recordPhilosopherView: (philosopherId) => {
        set((state) => ({
          philosopherViews: {
            ...state.philosopherViews,
            [philosopherId]: (state.philosopherViews[philosopherId] ?? 0) + 1,
          },
        }));
        get().recomputeBadges();
      },

      recordLessonComplete: (branchSlug) => {
        set((state) => ({
          lessonsByBranch: {
            ...state.lessonsByBranch,
            [branchSlug]: (state.lessonsByBranch[branchSlug] ?? 0) + 1,
          },
        }));
        get().recomputeBadges();
      },

      setVoiceEnabled: (v) => set({ voiceEnabled: v }),

      setBeliefResult: (id) => set({ beliefResultId: id }),

      ensureJoinDate: () => {
        if (get().joinedAt == null) set({ joinedAt: Date.now() });
      },

      registerDailyActivity: (today, yesterday) => {
        const { lastLessonDate, streak } = get();
        if (lastLessonDate === today) {
          return { firstOfDay: false, streak, prevStreak: streak };
        }
        const prevStreak = streak;
        const newStreak = lastLessonDate === yesterday ? streak + 1 : 1;
        set({ streak: newStreak, lastLessonDate: today });
        get().recomputeBadges();
        return { firstOfDay: true, streak: newStreak, prevStreak };
      },

      // Union the currently-qualifying badges into the persisted set so earned
      // badges stick (until explicitly revoked). Only called at progress points
      // and as a one-time backfill — never on every render — so a revoke holds
      // until the user makes new progress.
      recomputeBadges: () =>
        set((state) => {
          const stats = computeStats(state);
          const now = BADGES.filter((b) => b.earned(stats)).map((b) => b.id);
          const merged = Array.from(new Set([...state.earnedBadges, ...now]));
          return { earnedBadges: merged, badgesInitialized: true };
        }),

      setProfile: (patch) => set(patch),

      setSetting: (key, value) =>
        set((state) => ({ settings: { ...state.settings, [key]: value } })),

      resetProgress: () =>
        set({ lessonsByBranch: {}, streak: 0, lastLessonDate: null }),

      clearSavedQuotes: () => set({ savedQuotes: [] }),

      revokeBadges: () => set({ earnedBadges: [] }),

      deleteAccount: () =>
        set({
          savedQuotes: [],
          philosopherViews: {},
          lessonsByBranch: {},
          voiceEnabled: true,
          beliefResultId: null,
          streak: 0,
          lastLessonDate: null,
          joinedAt: null,
          earnedBadges: [],
          badgesInitialized: true,
          displayName: 'Philosopher',
          email: '',
          bio: '',
          settings: DEFAULT_SETTINGS,
        }),

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
        beliefResultId: state.beliefResultId,
        streak: state.streak,
        lastLessonDate: state.lastLessonDate,
        joinedAt: state.joinedAt,
        earnedBadges: state.earnedBadges,
        badgesInitialized: state.badgesInitialized,
        displayName: state.displayName,
        email: state.email,
        bio: state.bio,
        settings: state.settings,
      }),
      // Merge persisted settings over defaults so newly-added keys are present.
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<UserDataState>;
        return {
          ...current,
          ...p,
          settings: { ...DEFAULT_SETTINGS, ...(p.settings ?? {}) },
        };
      },
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
        if (state && !state.badgesInitialized) state.recomputeBadges();
      },
    }
  )
);
