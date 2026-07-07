import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BADGES, type ProgressStats } from '@/data/badges';
import {
  ALL_BRANCHES,
  getLessonUnitInfo,
  branchCountsFromUnits,
  unitsFromBranchCounts,
} from '@/data';
import { rankForXP } from '@/data/ranks';
import { track } from '@/lib/posthog';
import { writePinnedQuote } from '@/lib/widget/pin';

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

// Best result on a philosopher's quiz. `best === total` (and total > 0) means
// the user has "mastered" that thinker's quiz at least once.
export interface QuizScore {
  best: number;
  total: number;
  plays: number;
  lastPlayedAt: number;
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
  // Privacy-by-default: analytics stay OFF until the user explicitly opts in
  // (matches PostHog's defaultOptIn:false). Toggle in Settings → Usage Analytics.
  usageAnalytics: false,
  appLanguage: 'English',
  quoteDisplay: 'original',
  voiceId: null,
  autoBackup: true,
};

interface UserDataState {
  savedQuotes: SavedQuote[];
  pinnedQuoteId: string | null;               // saved-quote id pinned to the home-screen widget
  quizScores: Record<string, QuizScore>;      // philosopherId -> best quiz result
  philosopherViews: Record<string, number>; // philosopherId -> times profile opened
  // Canonical progression: unitId (path.id) -> lessons completed in that unit.
  // Per-unit (not per-branch) so a paid user can advance several units at once.
  lessonsByUnit: Record<string, number>;
  // Derived mirror kept in lockstep (= sum of each branch's unit counts) so the
  // stats / mastery / badge readers keep working unchanged. Never set on its own.
  lessonsByBranch: Record<string, number>;   // branchSlug -> lessons completed
  voiceEnabled: boolean;                      // narrate lessons aloud + reveal words
  beliefResultId: string | null;             // legacy (belief quiz removed)
  streak: number;                             // consecutive-day streak
  totalXP: number;                            // accumulated lesson XP (5 per completion + 5 per correct)
  lastLessonDate: string | null;             // YYYY-MM-DD of last completed lesson
  dailyLessonCount: number;                   // lessons completed on dailyLessonDate (free-tier gate)
  dailyLessonDate: string | null;            // YYYY-MM-DD the daily count belongs to
  joinedAt: number | null;                    // epoch ms of first app open
  earnedBadges: string[];                     // badge ids the user has earned (persists)
  badgesInitialized: boolean;                 // one-time backfill guard
  displayName: string;
  email: string;
  bio: string;
  bioSeed: number;                            // bumped each lesson + app launch to refresh the auto-bio
  portrait: string;                           // selected hand-drawn portrait id
  settings: AppSettings;
  hasSeenWelcome: boolean;                     // first-launch intro animation already played
  _hasHydrated: boolean;
  _syncOwnerId: string | null;                 // user id whose data currently fills this device's store (cloud-sync guard)

  saveQuote: (q: SavedQuote) => void;
  removeQuote: (id: string) => void;
  toggleQuote: (q: SavedQuote) => void;
  isQuoteSaved: (id: string) => boolean;
  setPinnedQuote: (id: string | null) => void;
  recordPhilosopherView: (philosopherId: string) => void;
  recordQuizResult: (philosopherId: string, correct: number, total: number) => number;
  recordLessonComplete: (lessonId: string, xpEarned?: number) => void;
  bumpDailyLessons: (today: string) => void;
  setVoiceEnabled: (v: boolean) => void;
  setBeliefResult: (id: string | null) => void;
  ensureJoinDate: () => void;
  registerDailyActivity: (
    today: string,
    yesterday: string
  ) => { firstOfDay: boolean; streak: number; prevStreak: number };
  recomputeBadges: () => void;
  setProfile: (patch: Partial<{ displayName: string; email: string; bio: string }>) => void;
  bumpBioSeed: () => void;
  setPortrait: (id: string) => void;
  setSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
  setHasSeenWelcome: (v: boolean) => void;
  resetProgress: () => void;
  clearSavedQuotes: () => void;
  revokeBadges: () => void;
  deleteAccount: () => void;
  resetForSignOut: () => void;
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
      pinnedQuoteId: null,
      quizScores: {},
      philosopherViews: {},
      lessonsByUnit: {},
      lessonsByBranch: {},
      voiceEnabled: true,
      beliefResultId: null,
      streak: 0,
      totalXP: 0,
      lastLessonDate: null,
      dailyLessonCount: 0,
      dailyLessonDate: null,
      joinedAt: null,
      earnedBadges: [],
      badgesInitialized: false,
      displayName: 'Philosopher',
      email: '',
      bio: '',
      bioSeed: 0,
      portrait: 'overthinker',
      settings: DEFAULT_SETTINGS,
      hasSeenWelcome: false,
      _hasHydrated: false,
      _syncOwnerId: null,

      saveQuote: (q) => {
        set((state) => {
          if (state.savedQuotes.some((x) => x.id === q.id)) return state;
          return { savedQuotes: [q, ...state.savedQuotes] };
        });
        get().recomputeBadges();
      },

      removeQuote: (id) => {
        set((state) => ({
          savedQuotes: state.savedQuotes.filter((x) => x.id !== id),
        }));
        // A quote can't stay pinned to the widget once it's no longer saved.
        if (get().pinnedQuoteId === id) get().setPinnedQuote(null);
      },

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
        if (!nowSaved && get().pinnedQuoteId === q.id) get().setPinnedQuote(null);
        track(nowSaved ? 'quote_saved' : 'quote_removed', {
          quote_id: q.id,
          philosopher_id: q.philosopherId,
        });
        get().recomputeBadges();
      },

      isQuoteSaved: (id) => get().savedQuotes.some((x) => x.id === id),

      // Pin (or clear) the home-screen widget quote. Mirrors the chosen quote to
      // the widget's own storage key and triggers an immediate refresh on Android.
      setPinnedQuote: (id) => {
        set({ pinnedQuoteId: id });
        const q = id ? get().savedQuotes.find((x) => x.id === id) ?? null : null;
        writePinnedQuote(
          q ? { text: q.text, author: q.author, philosopherId: q.philosopherId } : null
        );
      },

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

      // Record a finished philosopher quiz. Keeps the best score, and awards a
      // one-time +15 XP the first time the user aces it (perfect), or +5 XP for
      // any other completion / replay. Returns the XP awarded so the results
      // screen can show it.
      recordQuizResult: (philosopherId, correct, total) => {
        const prev = get().quizScores[philosopherId];
        const wasPerfect = !!prev && prev.total > 0 && prev.best >= prev.total;
        const isPerfect = total > 0 && correct >= total;
        const bonus = isPerfect && !wasPerfect ? 15 : 5;
        set((state) => ({
          quizScores: {
            ...state.quizScores,
            [philosopherId]: {
              best: Math.max(prev?.best ?? 0, correct),
              total,
              plays: (prev?.plays ?? 0) + 1,
              lastPlayedAt: Date.now(),
            },
          },
          totalXP: state.totalXP + bonus,
        }));
        track('philosopher_quiz_completed', {
          philosopher_id: philosopherId,
          correct,
          total,
          perfect: isPerfect,
          xp: bonus,
        });
        get().recomputeBadges();
        return bonus;
      },

      recordLessonComplete: (lessonId, xpEarned = 0) => {
        const beforeRank = rankForXP(get().totalXP).index;
        const info = getLessonUnitInfo(lessonId);
        set((state) => {
          // Advance the unit's completed count to at least (indexInUnit + 1).
          // Using max() means re-doing an earlier lesson can't push the pointer
          // forward and skip lessons — while completing the unit's next lesson
          // advances it by one. XP is still awarded on every completion.
          let lessonsByUnit = state.lessonsByUnit;
          if (info) {
            const next = Math.max(state.lessonsByUnit[info.unitId] ?? 0, info.indexInUnit + 1);
            lessonsByUnit = { ...state.lessonsByUnit, [info.unitId]: next };
          }
          return {
            lessonsByUnit,
            // Keep the per-branch mirror consistent with the per-unit source.
            lessonsByBranch: branchCountsFromUnits(lessonsByUnit),
            totalXP: state.totalXP + xpEarned,
          };
        });
        const after = rankForXP(get().totalXP);
        if (after.index > beforeRank) {
          track('rank_up', {
            rank: after.current.name,
            rank_id: after.current.id,
            total_xp: get().totalXP,
          });
        }
        // Refresh the profile's "who you're becoming" bio after each lesson.
        get().bumpBioSeed();
        get().recomputeBadges();
      },

      // Count one completed lesson toward today's free-tier allowance, rolling
      // the counter over when the calendar day changes.
      bumpDailyLessons: (today) =>
        set((state) => ({
          dailyLessonCount: state.dailyLessonDate === today ? state.dailyLessonCount + 1 : 1,
          dailyLessonDate: today,
        })),

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

      // Trim + bound profile fields at the source so nothing oversized can enter
      // the store (and therefore the cloud snapshot in user_state.data).
      setProfile: (patch) =>
        set(() => {
          const next: Partial<UserDataState> = {};
          if (patch.displayName !== undefined) next.displayName = patch.displayName.trim().slice(0, 60);
          if (patch.bio !== undefined) next.bio = patch.bio.slice(0, 600);
          if (patch.email !== undefined) next.email = patch.email.trim().slice(0, 254);
          return next;
        }),

      // Reshuffle the auto-generated profile bio (a fresh variant next render).
      bumpBioSeed: () => set((state) => ({ bioSeed: (state.bioSeed + 1) % 1_000_000 })),

      setPortrait: (id) => set({ portrait: id }),

      setSetting: (key, value) =>
        set((state) => ({ settings: { ...state.settings, [key]: value } })),

      setHasSeenWelcome: (v) => set({ hasSeenWelcome: v }),

      resetProgress: () =>
        set({ lessonsByUnit: {}, lessonsByBranch: {}, quizScores: {}, streak: 0, totalXP: 0, lastLessonDate: null, dailyLessonCount: 0, dailyLessonDate: null }),

      clearSavedQuotes: () => {
        set({ savedQuotes: [] });
        if (get().pinnedQuoteId) get().setPinnedQuote(null);
      },

      revokeBadges: () => set({ earnedBadges: [] }),

      deleteAccount: () => {
        if (get().pinnedQuoteId) writePinnedQuote(null);
        set({
          savedQuotes: [],
          pinnedQuoteId: null,
          quizScores: {},
          philosopherViews: {},
          lessonsByUnit: {},
          lessonsByBranch: {},
          voiceEnabled: true,
          beliefResultId: null,
          streak: 0,
          totalXP: 0,
          lastLessonDate: null,
          dailyLessonCount: 0,
          dailyLessonDate: null,
          joinedAt: null,
          earnedBadges: [],
          badgesInitialized: true,
          displayName: 'Philosopher',
          email: '',
          bio: '',
          bioSeed: 0,
          portrait: 'overthinker',
          settings: DEFAULT_SETTINGS,
        });
      },

      // Wipe this device back to a clean guest baseline when a user signs out, so
      // the next person to use the device (or sign in) never inherits the prior
      // user's progress, saved quotes, or profile. Mirrors deleteAccount's field
      // reset but is purely local; clears _syncOwnerId so the next sign-in adopts
      // that account's own cloud snapshot rather than merging leftover data.
      resetForSignOut: () => {
        if (get().pinnedQuoteId) writePinnedQuote(null);
        set({
          savedQuotes: [],
          pinnedQuoteId: null,
          quizScores: {},
          philosopherViews: {},
          lessonsByUnit: {},
          lessonsByBranch: {},
          voiceEnabled: true,
          beliefResultId: null,
          streak: 0,
          totalXP: 0,
          lastLessonDate: null,
          dailyLessonCount: 0,
          dailyLessonDate: null,
          joinedAt: null,
          earnedBadges: [],
          badgesInitialized: true,
          displayName: 'Philosopher',
          email: '',
          bio: '',
          bioSeed: 0,
          portrait: 'overthinker',
          settings: DEFAULT_SETTINGS,
          _syncOwnerId: null,
        });
      },

      setHasHydrated: (v) => set({ _hasHydrated: v }),
    }),
    {
      name: 'philosophize-userdata',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        savedQuotes: state.savedQuotes,
        pinnedQuoteId: state.pinnedQuoteId,
        quizScores: state.quizScores,
        philosopherViews: state.philosopherViews,
        lessonsByUnit: state.lessonsByUnit,
        lessonsByBranch: state.lessonsByBranch,
        voiceEnabled: state.voiceEnabled,
        beliefResultId: state.beliefResultId,
        streak: state.streak,
        totalXP: state.totalXP,
        lastLessonDate: state.lastLessonDate,
        dailyLessonCount: state.dailyLessonCount,
        dailyLessonDate: state.dailyLessonDate,
        joinedAt: state.joinedAt,
        earnedBadges: state.earnedBadges,
        badgesInitialized: state.badgesInitialized,
        displayName: state.displayName,
        email: state.email,
        bio: state.bio,
        bioSeed: state.bioSeed,
        portrait: state.portrait,
        settings: state.settings,
        hasSeenWelcome: state.hasSeenWelcome,
        _syncOwnerId: state._syncOwnerId,
      }),
      // Merge persisted settings over defaults so newly-added keys are present.
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<UserDataState>;
        // Backfill accumulated XP for users who predate the totalXP field, using
        // the previous flat 25-per-lesson value so their rank doesn't drop.
        const priorLessons = Object.values(p.lessonsByBranch ?? {}).reduce((a, b) => a + b, 0);
        const totalXP = p.totalXP ?? priorLessons * 25;
        // Migrate legacy per-branch progress to the per-unit model. Older stores
        // only have lessonsByBranch; reconstruct lessonsByUnit from it, then keep
        // lessonsByBranch as the derived mirror so both stay consistent.
        const lessonsByUnit =
          p.lessonsByUnit && Object.keys(p.lessonsByUnit).length > 0
            ? p.lessonsByUnit
            : unitsFromBranchCounts(p.lessonsByBranch ?? {});
        const lessonsByBranch = branchCountsFromUnits(lessonsByUnit);
        return {
          ...current,
          ...p,
          lessonsByUnit,
          lessonsByBranch,
          totalXP,
          settings: { ...DEFAULT_SETTINGS, ...(p.settings ?? {}) },
        };
      },
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
        // Each app launch = a fresh "who you're becoming" bio.
        state?.bumpBioSeed();
        if (state && !state.badgesInitialized) state.recomputeBadges();
      },
    }
  )
);
