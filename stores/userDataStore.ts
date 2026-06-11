import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BADGES, type ProgressStats } from '@/data/badges';
import { ALL_BRANCHES } from '@/data';
import { rankForXP } from '@/data/ranks';
import { track } from '@/lib/posthog';

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

export type WidgetPlacement = 'home' | 'profile' | 'insights';

export interface AppSettings {
  // Notifications
  dailyReminder: boolean;
  reminderTime: string; // e.g. '08:00 AM'
  streakAlerts: boolean;
  badgeEarned: boolean;
  weeklySummary: boolean;
  quoteOfDay: boolean;
  // Daily quote widget (in-app, shown on a chosen screen)
  widgetEnabled: boolean;
  widgetPlacement: WidgetPlacement;
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
  // Narration
  voiceId: string | null; // manually chosen TTS voice; null = automatic
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
  widgetEnabled: false,
  widgetPlacement: 'home',
  dailyGoalMinutes: 20,
  autoAdvance: true,
  publicProfile: false,
  showStreak: true,
  showRankBadges: true,
  usageAnalytics: true,
  appLanguage: 'English',
  quoteDisplay: 'original',
  voiceId: null,
  autoBackup: true,
};

interface UserDataState {
  savedQuotes: SavedQuote[];
  philosopherViews: Record<string, number>; // philosopherId -> times profile opened
  lessonsByBranch: Record<string, number>;   // branchSlug -> lessons completed
  voiceEnabled: boolean;                      // narrate lessons aloud + reveal words
  beliefResultId: string | null;             // legacy (belief quiz removed)
  streak: number;                             // consecutive-day streak
  totalXP: number;                            // accumulated lesson XP (5 per completion + 5 per correct)
  lastLessonDate: string | null;             // YYYY-MM-DD of last completed lesson
  joinedAt: number | null;                    // epoch ms of first app open
  earnedBadges: string[];                     // badge ids the user has earned (persists)
  badgesInitialized: boolean;                 // one-time backfill guard
  displayName: string;
  email: string;
  bio: string;
  portrait: string;                           // selected hand-drawn portrait id
  settings: AppSettings;
  _hasHydrated: boolean;

  saveQuote: (q: SavedQuote) => void;
  removeQuote: (id: string) => void;
  toggleQuote: (q: SavedQuote) => void;
  isQuoteSaved: (id: string) => boolean;
  recordPhilosopherView: (philosopherId: string) => void;
  recordLessonComplete: (branchSlug: string, xpEarned?: number) => void;
  setVoiceEnabled: (v: boolean) => void;
  setBeliefResult: (id: string | null) => void;
  ensureJoinDate: () => void;
  registerDailyActivity: (
    today: string,
    yesterday: string
  ) => { firstOfDay: boolean; streak: number; prevStreak: number };
  recomputeBadges: () => void;
  setProfile: (patch: Partial<{ displayName: string; email: string; bio: string }>) => void;
  setPortrait: (id: string) => void;
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
  totalXP: number;
}): ProgressStats {
  const lessons = Object.values(s.lessonsByBranch).reduce((a, b) => a + b, 0);
  const quotes = s.savedQuotes.length;
  const philosophers = Object.keys(s.philosopherViews).length;
  const totalXP = s.totalXP + quotes * 10 + philosophers * 5;
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
      totalXP: 0,
      lastLessonDate: null,
      joinedAt: null,
      earnedBadges: [],
      badgesInitialized: false,
      displayName: 'Philosopher',
      email: '',
      bio: '',
      portrait: 'overthinker',
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
        let nowSaved = false;
        set((state) => {
          const exists = state.savedQuotes.some((x) => x.id === q.id);
          nowSaved = !exists;
          return {
            savedQuotes: exists
              ? state.savedQuotes.filter((x) => x.id !== q.id)
              : [q, ...state.savedQuotes],
          };
        });
        track(nowSaved ? 'quote_saved' : 'quote_removed', {
          quote_id: q.id,
          philosopher_id: q.philosopherId,
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
        track('philosopher_viewed', { philosopher_id: philosopherId });
        get().recomputeBadges();
      },

      recordLessonComplete: (branchSlug, xpEarned = 0) => {
        const beforeRank = rankForXP(get().totalXP).index;
        set((state) => ({
          lessonsByBranch: {
            ...state.lessonsByBranch,
            [branchSlug]: (state.lessonsByBranch[branchSlug] ?? 0) + 1,
          },
          totalXP: state.totalXP + xpEarned,
        }));
        const after = rankForXP(get().totalXP);
        if (after.index > beforeRank) {
          track('rank_up', {
            rank: after.current.name,
            rank_id: after.current.id,
            total_xp: get().totalXP,
          });
        }
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
      recomputeBadges: () => {
        const state = get();
        const stats = computeStats(state);
        const now = BADGES.filter((b) => b.earned(stats)).map((b) => b.id);
        // Only emit for badges earned through real progress — never the one-time
        // backfill that runs on first hydrate (badgesInitialized still false).
        const newlyEarned = state.badgesInitialized
          ? now.filter((id) => !state.earnedBadges.includes(id))
          : [];
        const merged = Array.from(new Set([...state.earnedBadges, ...now]));
        set({ earnedBadges: merged, badgesInitialized: true });
        for (const id of newlyEarned) {
          const b = BADGES.find((x) => x.id === id);
          track('badge_earned', { badge_id: id, badge_name: b?.name });
        }
      },

      setProfile: (patch) => set(patch),

      setPortrait: (id) => set({ portrait: id }),

      setSetting: (key, value) =>
        set((state) => ({ settings: { ...state.settings, [key]: value } })),

      resetProgress: () =>
        set({ lessonsByBranch: {}, streak: 0, totalXP: 0, lastLessonDate: null }),

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
          totalXP: 0,
          lastLessonDate: null,
          joinedAt: null,
          earnedBadges: [],
          badgesInitialized: true,
          displayName: 'Philosopher',
          email: '',
          bio: '',
          portrait: 'overthinker',
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
        totalXP: state.totalXP,
        lastLessonDate: state.lastLessonDate,
        joinedAt: state.joinedAt,
        earnedBadges: state.earnedBadges,
        badgesInitialized: state.badgesInitialized,
        displayName: state.displayName,
        email: state.email,
        bio: state.bio,
        portrait: state.portrait,
        settings: state.settings,
      }),
      // Merge persisted settings over defaults so newly-added keys are present.
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<UserDataState>;
        // Backfill accumulated XP for users who predate the totalXP field, using
        // the previous flat 25-per-lesson value so their rank doesn't drop.
        const priorLessons = Object.values(p.lessonsByBranch ?? {}).reduce((a, b) => a + b, 0);
        const totalXP = p.totalXP ?? priorLessons * 25;
        return {
          ...current,
          ...p,
          totalXP,
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
