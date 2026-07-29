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
import { awardedRank, rankForXP } from '@/data/ranks';
import { XP_PER_PHILOSOPHER_MET, XP_PER_QUIZ, XP_PER_QUIZ_PERFECT, XP_PER_SAVED_QUOTE } from '@/constants/xp';
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

// A single quote the user has chosen to feature on their Profile header. Any
// quote can be featured (from a lesson, the saved-quotes sheet, or a thinker's
// page) — this is independent of whether the quote is saved/bookmarked.
export interface ProfileQuote {
  id: string;
  text: string;
  author: string;
  philosopherId: string;
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
  profileQuote: ProfileQuote | null;          // the quote featured on the Profile header (any quote, not just saved)
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
  totalXP: number;                            // all XP: lessons, saved quotes, thinkers met, quizzes
  // THE RANK THE USER ACTUALLY HOLDS. Not derived from totalXP, because XP can be
  // earned by browsing (a saved quote, a thinker opened) and a promotion is meant to
  // be earned by work. This only ever moves inside recordLessonComplete, and by one
  // step, so a reader who bookmarks past a threshold collects the promotion on their
  // next finished lesson instead of in the Thinkers tab. See `awardedRank`.
  rankIndex: number;
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
  setProfileQuote: (q: ProfileQuote | null) => void;
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
  // Just the real total now. This used to add `quotes * 10 + philosophers * 5` on
  // top, because saving a quote earned nothing and the badge conditions wanted to
  // count it for something. Those actions grant real XP into `totalXP` today, so
  // adding it again here would pay for the same bookmark twice.
  const totalXP = s.totalXP;
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
      profileQuote: null,
      quizScores: {},
      philosopherViews: {},
      lessonsByUnit: {},
      lessonsByBranch: {},
      voiceEnabled: true,
      beliefResultId: null,
      streak: 0,
      totalXP: 0,
      rankIndex: 0,
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

      // KEEPING a quote is what pays, not the act of tapping the bookmark: the XP
      // goes on when it enters the collection and comes back off when it leaves, so
      // the total always reflects what is actually saved and tapping a bookmark on
      // and off nets zero. It cannot promote anyone either way — rank is gated on
      // lessons (see rankIndex).
      saveQuote: (q) => {
        set((state) => {
          if (state.savedQuotes.some((x) => x.id === q.id)) return state;
          return {
            savedQuotes: [q, ...state.savedQuotes],
            totalXP: state.totalXP + XP_PER_SAVED_QUOTE,
          };
        });
        get().recomputeBadges();
      },

      removeQuote: (id) => {
        set((state) => {
          if (!state.savedQuotes.some((x) => x.id === id)) return state;
          return {
            savedQuotes: state.savedQuotes.filter((x) => x.id !== id),
            totalXP: Math.max(0, state.totalXP - XP_PER_SAVED_QUOTE),
          };
        });
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
            totalXP: exists
              ? Math.max(0, state.totalXP - XP_PER_SAVED_QUOTE)
              : state.totalXP + XP_PER_SAVED_QUOTE,
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

      // Feature (or clear, when passed null) the single quote shown on the
      // Profile header. Any quote can be featured — this is independent of
      // whether it's saved/bookmarked.
      setProfileQuote: (q) => {
        set({ profileQuote: q });
        if (q) track('profile_quote_set', { quote_id: q.id, philosopher_id: q.philosopherId });
      },

      // Meeting a thinker pays once. Re-opening the same profile does not — the XP
      // is for the breadth of who you have read, not for how often you tap.
      recordPhilosopherView: (philosopherId) => {
        set((state) => {
          const seen = (state.philosopherViews[philosopherId] ?? 0) > 0;
          return {
            philosopherViews: {
              ...state.philosopherViews,
              [philosopherId]: (state.philosopherViews[philosopherId] ?? 0) + 1,
            },
            totalXP: seen ? state.totalXP : state.totalXP + XP_PER_PHILOSOPHER_MET,
          };
        });
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
        const bonus = isPerfect && !wasPerfect ? XP_PER_QUIZ_PERFECT : XP_PER_QUIZ;
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
        const beforeRank = get().rankIndex;
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
        // THE ONLY PLACE A RANK EVER MOVES, and by ONE step. Everything else that
        // grants XP — a saved quote, a thinker met, a quiz — leaves the rank alone,
        // so the promotion is always collected here, on a finished lesson. Advancing
        // a single step also means the rank-up screen always shows one clean
        // before→after; a reader who banked a lot of XP browsing walks up the ladder
        // a rung per lesson instead of teleporting several and seeing none of them.
        const earned = rankForXP(get().totalXP).index;
        if (earned > beforeRank) set({ rankIndex: beforeRank + 1 });
        const after = awardedRank(get().rankIndex, get().totalXP);
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
        set({ lessonsByUnit: {}, lessonsByBranch: {}, quizScores: {}, streak: 0, totalXP: 0, rankIndex: 0, lastLessonDate: null, dailyLessonCount: 0, dailyLessonDate: null }),

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
          profileQuote: null,
          quizScores: {},
          philosopherViews: {},
          lessonsByUnit: {},
          lessonsByBranch: {},
          voiceEnabled: true,
          beliefResultId: null,
          streak: 0,
          totalXP: 0,
          rankIndex: 0,
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
          profileQuote: null,
          quizScores: {},
          philosopherViews: {},
          lessonsByUnit: {},
          lessonsByBranch: {},
          voiceEnabled: true,
          beliefResultId: null,
          streak: 0,
          totalXP: 0,
          rankIndex: 0,
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
        profileQuote: state.profileQuote,
        quizScores: state.quizScores,
        philosopherViews: state.philosopherViews,
        lessonsByUnit: state.lessonsByUnit,
        lessonsByBranch: state.lessonsByBranch,
        voiceEnabled: state.voiceEnabled,
        beliefResultId: state.beliefResultId,
        streak: state.streak,
        totalXP: state.totalXP,
        rankIndex: state.rankIndex,
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
        // Anyone who predates the rank gate keeps the rank they were already being
        // shown. Defaulting this to 0 would demote every existing user to Novice on
        // the update that introduced it.
        const rankIndex = p.rankIndex ?? rankForXP(totalXP).index;
        return {
          ...current,
          ...p,
          lessonsByUnit,
          lessonsByBranch,
          totalXP,
          rankIndex,
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
