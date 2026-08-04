import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BADGES, isEarned, type BadgeDef, type ProgressStats } from '@/data/badges';
import { eraGroupOfId } from '@/data/philosophers';
import {
  ALL_BRANCHES,
  getLessonUnitInfo,
  branchCountsFromUnits,
  unitsFromBranchCounts,
} from '@/data';
import { awardedRank, rankForXP } from '@/data/ranks';
import { DEFAULT_BACKGROUND_ID } from '@/data/profileBackgrounds';
import { DEFAULT_PROFILE_FONT } from '@/data/profileFonts';
import { XP_PER_PHILOSOPHER_MET, XP_PER_QUIZ, XP_PER_QUIZ_PERFECT, XP_PER_SAVED_QUOTE } from '@/constants/xp';
import { restCap, restDaysHeld, restEarnEvery } from '@/constants/streak';
import { restDaysToSpend } from '@/lib/utils/streak';
import {
  backfillEntries,
  dayKey,
  gradeEntry,
  isReviewable,
  seedEntry,
  type ReviewState,
} from '@/lib/review';
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

/**
 * EVERY KEY IN HERE IS READ BY SOMETHING.
 *
 * This used to hold eighteen, of which twelve were read by nothing but the switch
 * that set them — a daily goal in minutes when no screen has ever timed a
 * session, three "who can see my profile" toggles in an app with no other users,
 * an auto-backup flag the sync layer never consulted. They looked like settings
 * and behaved like decoration.
 *
 * So the rule now: a key earns its place by having a reader outside Settings. If
 * you add one, wire it up in the same commit or leave it out.
 */
export interface AppSettings {
  // Notifications — scheduled locally by lib/notifications; needs a binary that
  // contains expo-notifications, which is why Settings hides them when it doesn't.
  dailyReminder: boolean;
  reminderTime: string; // e.g. '08:00 AM'
  streakAlerts: boolean;
  quoteOfDay: boolean;
  // Daily quote widget (in-app, shown on a chosen screen)
  widgetEnabled: boolean;
  widgetPlacement: WidgetPlacement;
  // Sound + haptics: taps, the stickman's footfalls, the reward chime. Read by
  // lib/feedback.ts, which is the single gate both channels pass through — so
  // this key has a reader outside Settings, which is the rule above.
  soundEffects: boolean;
  // Privacy
  usageAnalytics: boolean;
  // Narration: `voiceId` was here — a hand-picked TTS voice, written by a picker in
  // Settings that listed every voice the device had. It did its job (it is how the
  // narrator was chosen, by ear) and the choice is now fixed in lib/voice.ts, so
  // nothing writes it any more. Removed rather than defaulted to null, so
  // sanitizeSettings() prunes it from AsyncStorage and the cloud snapshot instead of
  // pushing a dead string up forever.
  // Data
  autoBackup: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  dailyReminder: true,
  reminderTime: '08:00 AM',
  streakAlerts: true,
  quoteOfDay: true,
  widgetEnabled: false,
  widgetPlacement: 'home',
  // `autoAdvance` was here and defaulted to TRUE, which is why finishing a lesson
  // threw the reader into the next one. Its behaviour is replaced by the advance
  // animation on the branch screen; the key is removed rather than defaulted off,
  // so sanitizeSettings() prunes it from AsyncStorage and the cloud snapshot
  // instead of syncing a dead flag forever.
  // On by default: it is quiet, short, respects the device's silent switch, and
  // never takes audio focus from whatever the reader is listening to.
  soundEffects: true,
  // Privacy-by-default: analytics stay OFF until the user explicitly opts in
  // (matches PostHog's defaultOptIn:false). Toggle in Settings → Usage Analytics.
  usageAnalytics: false,
  autoBackup: true,
};

const SETTING_KEYS = Object.keys(DEFAULT_SETTINGS) as (keyof AppSettings)[];

/**
 * Defaults, overlaid with whatever of the stored blob is still a real setting.
 *
 * Plain spreading would carry the retired keys forever: they are in every
 * existing device's AsyncStorage and in every cloud snapshot, so `{...defaults,
 * ...stored}` re-adopts `dailyGoalMinutes` on each load and pushes it straight
 * back up. Dropping unknown keys here is the only place the pruning can happen
 * once and apply to both.
 *
 * The daily goal has now been retired twice over — `dailyGoalMinutes` measured
 * something the app never recorded, and `dailyGoalLessons` outlived the only
 * screen that displayed it. Both are pruned by the same mechanism: a key stops
 * existing the moment it leaves DEFAULT_SETTINGS.
 */
function sanitizeSettings(stored: unknown): AppSettings {
  const p = (stored ?? {}) as Record<string, unknown>;
  const out = { ...DEFAULT_SETTINGS };
  for (const k of SETTING_KEYS) {
    const v = p[k as string];
    if (v !== undefined && typeof v === typeof DEFAULT_SETTINGS[k]) (out as any)[k] = v;
  }
  // A `string | null` key needed rescuing here, because `typeof null === 'object'`
  // fails the check above. There is no such key left — `voiceId` was the only one —
  // so if you add one, it needs its own line right here or it will silently reset to
  // its default on every load.
  return out;
}

/**
 * ONE ENTRY PER THING EARNED, which is what makes the climb move when you earn
 * rather than once a day.
 *
 * This replaces `xpByDay`, a map of YYYY-MM-DD → total at the end of that day. A
 * day map can only ever step once per calendar day, so a reader who finished six
 * lessons in an evening saw one point, and a reader on their first day saw no
 * line at all — there is nothing to draw between a single point and itself. The
 * chart is meant to show the climb toward the next rank, and the climb happens
 * per lesson, not per midnight.
 *
 * Each entry is the TOTAL AFTER that event, not the amount earned — a snapshot
 * rather than a delta, for the reason the day map gave: snapshots are
 * self-correcting. Miss a write and the line has one longer step and then
 * recovers; miss a delta and every later point is permanently offset.
 *
 * `t` is wall-clock ms. It is NOT the x-axis — the chart spaces events evenly, so
 * each thing earned is one step of equal width — but it is what lets the chart
 * date the ends of the climb, and what lets two devices' logs be merged in order.
 *
 * CAPPED, because this slice is mirrored to Supabase on every sync (§4) and an
 * unbounded array would grow the snapshot forever. 200 entries is roughly 5KB and
 * comfortably more than one rank band's worth of earning.
 */
export interface XpEvent {
  t: number; // epoch ms
  v: number; // total XP after this event
}

const XP_EVENTS_MAX = 200;

function stampEvent(events: XpEvent[] | undefined, newTotal: number, now = Date.now()): XpEvent[] {
  const prev = events ?? [];
  const last = prev[prev.length - 1];
  // Nothing actually moved — a bookmark toggled on and off nets zero, and two
  // identical points would draw a step of no height.
  if (last && last.v === newTotal) return prev;
  const out = [...prev, { t: now, v: newTotal }];
  return out.length > XP_EVENTS_MAX ? out.slice(out.length - XP_EVENTS_MAX) : out;
}

/**
 * Rebuild an event log from the old day map, once, so nobody's climb resets.
 *
 * The totals are real — they were recorded — only their resolution is coarse, so
 * this is not inventing history in the way the chart's own header warns against.
 * Each day's figure was the total at the END of that day, so that is where it is
 * stamped.
 */
export function eventsFromDayMap(byDay: Record<string, number> | undefined): XpEvent[] {
  if (!byDay) return [];
  return Object.keys(byDay)
    .sort()
    .map((k) => {
      const [y, m, d] = k.split('-').map(Number);
      return { t: new Date(y, (m ?? 1) - 1, d ?? 1, 23, 59, 0).getTime(), v: byDay[k] };
    })
    .filter((e) => Number.isFinite(e.t) && Number.isFinite(e.v));
}

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
  // `voiceEnabled` was here — the switch for spoken narration. Narration is gone:
  // device text-to-speech has no emotion to give, and nothing that can act is free
  // without an account, a card or a GPU. The key has no reader and no writer now,
  // so it is removed rather than left at true — that stops it riding the cloud
  // snapshot forever. An old stored value is simply ignored on load.
  beliefResultId: string | null;             // legacy (belief quiz removed)
  streak: number;                             // consecutive-day streak
  totalXP: number;                            // all XP: lessons, saved quotes, thinkers met, quizzes
  xpEvents: XpEvent[];                        // one entry per thing earned (see stampEvent)
  // THE RANK THE USER ACTUALLY HOLDS. Not derived from totalXP, because XP can be
  // earned by browsing (a saved quote, a thinker opened) and a promotion is meant to
  // be earned by work. This only ever moves inside recordLessonComplete, and by one
  // step, so a reader who bookmarks past a threshold collects the promotion on their
  // next finished lesson instead of in the Thinkers tab. See `awardedRank`.
  rankIndex: number;
  lastLessonDate: string | null;             // YYYY-MM-DD of last completed lesson
  dailyLessonCount: number;                   // lessons completed on dailyLessonDate (free-tier gate)
  dailyLessonDate: string | null;            // YYYY-MM-DD the daily count belongs to
  // ── rest days (streak freezes) ────────────────────────────────────────────
  // TWO COUNTERS THAT ONLY EVER GO UP, never one "remaining" figure. The cloud
  // merge keeps the LARGER of two numbers for anything progress-shaped, so a
  // remaining-count would refill itself across devices: spend your last rest day
  // here, open a tablet that still reads 2, and max() hands it back. With earned
  // and used stored apart, max is right in both directions — the higher earn is
  // the true one and so is the higher spend. Held is derived (constants/streak).
  restDaysEarned: number;
  restDaysUsed: number;
  // ── daily review ──────────────────────────────────────────────────────────
  // lessonId -> { s: strength 0-4, due: 'YYYY-MM-DD' }. Scheduled per LESSON
  // rather than per question; see lib/review for why that is enough.
  reviewState: ReviewState;
  reviewDayCount: number;                     // review questions answered on reviewDayDate
  reviewDayDate: string | null;               // YYYY-MM-DD the review count belongs to
  // Branch chosen by the welcome questions. A SUGGESTION the home screen and
  // Quick Start prefer — never a gate; all six branches stay open regardless.
  startingBranch: string | null;
  /**
   * WHICH set of welcome questions they have answered — versioned for the same
   * reason `welcomeVersion` is, and kept SEPARATE from it on purpose.
   *
   * Sharing one number would mean re-showing the ~30s intro animation to reach
   * anyone who predates the questions, and it would still miss the readers who
   * matter most: a signed-in user is redirected into (app) before app/index.tsx
   * ever renders, so they never pass the intro gate at all. A version of its own
   * lets the questions be asked exactly once, wherever the reader happens to
   * land, without replaying anything.
   */
  onboardingVersion: number;
  joinedAt: number | null;                    // epoch ms of first app open
  earnedBadges: string[];                     // badge ids the user has earned (persists)
  badgesInitialized: boolean;                 // one-time backfill guard
  displayName: string;
  email: string;
  bio: string;
  bioSeed: number;                            // bumped each lesson + app launch to refresh the auto-bio
  /**
   * The total XP the reader had the LAST TIME they looked at the climb chart.
   *
   * It is what lets the chart animate only when there is something new to show:
   * the line is drawn to where it stood at this figure, holds, and then grows on
   * to where it stands now. Opening the same screen twice with nothing earned in
   * between draws it finished and still — an animation that replays on every
   * visit stops meaning "you moved" and starts meaning nothing at all.
   */
  chartSeenXP: number;
  portrait: string;                           // selected hand-drawn portrait id
  profileBackground: string;                  // id from data/profileBackgrounds — picture AND header art
  nameFont: string;                           // id from data/profileFonts — the face the name is set in
  settings: AppSettings;
  hasSeenWelcome: boolean;                     // first-launch intro animation already played
  /**
   * WHICH welcome they have seen, not merely whether they have seen one.
   *
   * `hasSeenWelcome` is a one-way latch, so a change to the intro could never reach
   * anybody: an existing reader has it set and a fresh install sets it on launch one,
   * from the bundle baked into the APK, before an over-the-air update has had a
   * chance to land (expo-updates launches on the embedded bundle and applies the
   * download on the NEXT start). Versioning the gate is what lets the intro be
   * changed without shipping a binary — bump WELCOME_VERSION and everyone whose
   * stored number is lower is shown it once more. Absent on an existing store, so
   * it defaults to 0 and the next bump catches everyone.
   */
  welcomeVersion: number;
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
  setBeliefResult: (id: string | null) => void;
  ensureJoinDate: () => void;
  registerDailyActivity: (
    today: string,
    yesterday: string,
    opts?: { isPro?: boolean }
  ) => { firstOfDay: boolean; streak: number; prevStreak: number; restSpent: number; restEarned: number };
  /** Schedule a just-finished lesson for review. */
  seedReview: (lessonId: string, correct: number, total: number) => void;
  /** Move a reviewed lesson up or down the ladder. */
  gradeReview: (lessonId: string, wasCorrect: boolean) => void;
  /** Count one answered review question toward today's free allowance. */
  bumpDailyReviews: () => void;
  /** Schedule completed lessons not yet in the schedule. Idempotent; see backfillEntries. */
  ensureReviewBacklog: () => void;
  /** Records the welcome answers: the branch to steer to, and which set was asked. */
  completeOnboarding: (slug: string | null, version: number) => void;
  recomputeBadges: () => void;
  setProfile: (patch: Partial<{ displayName: string; email: string; bio: string }>) => void;
  bumpBioSeed: () => void;
  setPortrait: (id: string) => void;
  setProfileBackground: (id: string) => void;
  setNameFont: (id: string) => void;
  setSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
  setHasSeenWelcome: (v: boolean) => void;
  /** Records the intro they just finished. Sets `hasSeenWelcome` too, so a rollback
   *  to a build that still reads the boolean does not replay it. */
  setWelcomeVersion: (v: number) => void;
  resetProgress: () => void;
  clearSavedQuotes: () => void;
  revokeBadges: () => void;
  deleteAccount: () => void;
  resetForSignOut: () => void;
  /** Mark the climb chart as seen at the current total. */
  markChartSeen: () => void;
  setHasHydrated: (v: boolean) => void;
}

// Build a progress snapshot used to evaluate badge conditions.
export interface DayInfo {
  firstOfDay: boolean;
  streak: number;
  prevStreak: number;
  /** Rest days this activity would consume to bridge a missed day (0 normally). */
  restSpent: number;
}

/**
 * What finishing a lesson WOULD do to the streak, worked out without writing
 * anything.
 *
 * The reward screen has to show the new streak BEFORE the reader has committed to
 * finishing — nothing is recorded until they press the button, because a completion
 * that records itself on mount can be banked by killing the app and skips the ad
 * that pays for the free tier. So the number has to be knowable without being
 * true yet. `registerDailyActivity` is implemented in terms of this, so what is
 * shown and what is later committed cannot drift apart.
 */
export function previewDailyActivity(
  lastLessonDate: string | null,
  streak: number,
  today: string,
  yesterday: string,
  restHeld = 0,
): DayInfo {
  if (lastLessonDate === today) {
    return { firstOfDay: false, streak, prevStreak: streak, restSpent: 0 };
  }
  if (lastLessonDate === yesterday) {
    return { firstOfDay: true, streak: streak + 1, prevStreak: streak, restSpent: 0 };
  }
  // There is a gap. Rest days bridge it if enough are held — the streak carries
  // on as though the missed days had been worked. Otherwise it restarts at 1.
  const restSpent = restDaysToSpend(lastLessonDate, today, restHeld);
  if (restSpent > 0) {
    return { firstOfDay: true, streak: streak + 1, prevStreak: streak, restSpent };
  }
  return { firstOfDay: true, streak: 1, prevStreak: streak, restSpent: 0 };
}

/** The slice of the store a badge can be judged from. */
export interface StatSource {
  lessonsByBranch: Record<string, number>;
  lessonsByUnit: Record<string, number>;
  savedQuotes: SavedQuote[];
  philosopherViews: Record<string, number>;
  quizScores: Record<string, QuizScore>;
  streak: number;
  totalXP: number;
}

/**
 * THE ONE PLACE BADGE CONDITIONS ARE MEASURED.
 *
 * Exported because three callers need the same numbers and used to each build
 * their own: the store (to award), the Ranks & Badges sheet (to display), and
 * the reward screen (to preview what finishing WOULD earn). Three copies of one
 * calculation is three chances for the grid to disagree with the pop-up about
 * whether you have a badge.
 */
export function progressStats(s: StatSource): ProgressStats {
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

  // Aced at least once. `best`/`total` are the RECORD, not the last attempt, so
  // this cannot be lost by replaying a quiz badly.
  const quizAces = Object.values(s.quizScores).filter(
    (q) => q.total > 0 && q.best >= q.total,
  ).length;

  // Distinct eras among the thinkers actually opened. Grouped by the same
  // function the Thinkers tab groups by — see data/philosophers.
  const eras = new Set<string>();
  for (const id of Object.keys(s.philosopherViews)) {
    const g = eraGroupOfId(id);
    if (g) eras.add(g);
  }

  // A quote carries the branches of the thinker it came from, so a single
  // saved line can cover two.
  const quoteBranches = new Set<string>();
  for (const q of s.savedQuotes) for (const slug of q.branchSlugs ?? []) quoteBranches.add(slug);

  const branchesTouched = Object.values(mastery).filter((v) => v > 0).length;
  const branchesHalf = Object.values(mastery).filter((v) => v >= 50).length;

  // A unit is finished when its completed count reaches its lesson count.
  let unitsComplete = 0;
  for (const b of ALL_BRANCHES) {
    for (const p of b.paths) {
      if (p.lessons.length > 0 && (s.lessonsByUnit[p.id] ?? 0) >= p.lessons.length) unitsComplete++;
    }
  }

  return {
    totalXP, lessons, quotes, philosophers, streak: s.streak, mastery,
    quizAces, eras: eras.size, quoteBranches: quoteBranches.size,
    branchesTouched, branchesHalf, unitsComplete,
  };
}

/**
 * WHICH BADGES FINISHING THIS LESSON WOULD EARN, without earning them.
 *
 * The reward screen shows the badge before the reader has pressed Continue, and
 * nothing is written until they do (see `commit` there — a completion that banks
 * itself on mount can be collected by killing the app, skipping the ad that pays
 * for the free tier). So this builds the state the commit WOULD produce and asks
 * the same question of it.
 *
 * It mirrors `recordLessonComplete` + `registerDailyActivity` exactly: the unit
 * pointer moves by max(), the branch mirror is rebuilt from it, XP goes on, and
 * the streak comes from `previewDailyActivity`. Anything that drifts here shows
 * the reader a badge they do not get, or hides one they do.
 */
export function previewNewBadges(
  s: UserDataState,
  lessonId: string,
  xpEarned: number,
  streak: number,
): BadgeDef[] {
  // The one-time backfill has not run yet — everything would look "new".
  if (!s.badgesInitialized) return [];
  const info = getLessonUnitInfo(lessonId);
  const lessonsByUnit = info
    ? { ...s.lessonsByUnit, [info.unitId]: Math.max(s.lessonsByUnit[info.unitId] ?? 0, info.indexInUnit + 1) }
    : s.lessonsByUnit;
  const after = progressStats({
    lessonsByUnit,
    lessonsByBranch: branchCountsFromUnits(lessonsByUnit),
    savedQuotes: s.savedQuotes,
    philosopherViews: s.philosopherViews,
    quizScores: s.quizScores,
    streak,
    totalXP: s.totalXP + xpEarned,
  });
  return BADGES.filter((b) => isEarned(b, after) && !s.earnedBadges.includes(b.id));
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
      beliefResultId: null,
      streak: 0,
      totalXP: 0,
      xpEvents: [],
      rankIndex: 0,
      lastLessonDate: null,
      dailyLessonCount: 0,
      dailyLessonDate: null,
      restDaysEarned: 0,
      restDaysUsed: 0,
      reviewState: {},
      reviewDayCount: 0,
      reviewDayDate: null,
      startingBranch: null,
      onboardingVersion: 0,
      joinedAt: null,
      earnedBadges: [],
      badgesInitialized: false,
      displayName: 'Philosopher',
      email: '',
      bio: '',
      bioSeed: 0,
      chartSeenXP: 0,
      portrait: 'overthinker',
      profileBackground: DEFAULT_BACKGROUND_ID,
      nameFont: DEFAULT_PROFILE_FONT,
      settings: DEFAULT_SETTINGS,
      hasSeenWelcome: false,
      welcomeVersion: 0,
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
            xpEvents: stampEvent(state.xpEvents, state.totalXP + XP_PER_SAVED_QUOTE),
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
            xpEvents: stampEvent(state.xpEvents, exists
              ? Math.max(0, state.totalXP - XP_PER_SAVED_QUOTE)
              : state.totalXP + XP_PER_SAVED_QUOTE),
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
            xpEvents: stampEvent(state.xpEvents, seen ? state.totalXP : state.totalXP + XP_PER_PHILOSOPHER_MET),
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
          xpEvents: stampEvent(state.xpEvents, state.totalXP + bonus),
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
            xpEvents: stampEvent(state.xpEvents, state.totalXP + xpEarned),
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

      setBeliefResult: (id) => set({ beliefResultId: id }),

      ensureJoinDate: () => {
        if (get().joinedAt == null) set({ joinedAt: Date.now() });
      },

      registerDailyActivity: (today, yesterday, opts) => {
        const isPro = opts?.isPro ?? false;
        const { lastLessonDate, streak, restDaysEarned, restDaysUsed } = get();
        const held = restDaysHeld(restDaysEarned, restDaysUsed);
        const info = previewDailyActivity(lastLessonDate, streak, today, yesterday, held);
        if (!info.firstOfDay) return { ...info, restEarned: 0 };
        // Earn at most one rest day per day, on crossing a multiple of the tier's
        // interval, and only when there is room to hold it. Refusing the earn at
        // the cap (rather than capping `held` on read) is what keeps
        // `earned - used` an exact count instead of a number that has to be
        // clamped everywhere it is used — and keeps both halves monotonic, which
        // is the whole reason the pair merges safely.
        const heldAfter = held - info.restSpent;
        const earns =
          info.streak > 0 && info.streak % restEarnEvery(isPro) === 0 && heldAfter < restCap(isPro)
            ? 1
            : 0;
        set({
          streak: info.streak,
          lastLessonDate: today,
          restDaysUsed: restDaysUsed + info.restSpent,
          restDaysEarned: restDaysEarned + earns,
        });
        get().recomputeBadges();
        return { ...info, restEarned: earns };
      },

      // ── daily review ─────────────────────────────────────────────────────────

      seedReview: (lessonId, correct, total) =>
        set((state) => {
          if (!isReviewable(lessonId)) return state; // no gradeable question in its deck
          return {
            reviewState: {
              ...state.reviewState,
              [lessonId]: seedEntry(correct, total, dayKey()),
            },
          };
        }),

      gradeReview: (lessonId, wasCorrect) =>
        set((state) => {
          const entry = state.reviewState[lessonId];
          if (!entry) return state;
          return {
            reviewState: {
              ...state.reviewState,
              [lessonId]: gradeEntry(entry, wasCorrect, dayKey()),
            },
          };
        }),

      bumpDailyReviews: () =>
        set((state) => {
          const today = dayKey();
          return {
            reviewDayCount: state.reviewDayDate === today ? state.reviewDayCount + 1 : 1,
            reviewDayDate: today,
          };
        }),

      // Called whenever the review surface is looked at, not once behind a latch:
      // it also has to catch lessons that merge in from another device after
      // sign-in. `backfillEntries` skips anything already scheduled, so re-running
      // it is free and cannot disturb a lesson's place on the ladder. Returning
      // `state` untouched when there is nothing to add keeps it from waking every
      // subscriber on each visit.
      ensureReviewBacklog: () =>
        set((state) => {
          const add = backfillEntries(state.reviewState, state.lessonsByUnit, dayKey());
          if (Object.keys(add).length === 0) return state;
          return { reviewState: { ...state.reviewState, ...add } };
        }),

      // One write, so a reader who is interrupted between the answer and the flag
      // is never left steered-but-still-being-asked.
      completeOnboarding: (slug, version) => {
        set({ startingBranch: slug, onboardingVersion: version });
        track('onboarding_completed', { starting_branch: slug ?? 'skipped' });
      },

      // Union the currently-qualifying badges into the persisted set so earned
      // badges stick (until explicitly revoked). Only called at progress points
      // and as a one-time backfill — never on every render — so a revoke holds
      // until the user makes new progress.
      recomputeBadges: () => {
        const state = get();
        const stats = progressStats(state);
        const now = BADGES.filter((b) => isEarned(b, stats)).map((b) => b.id);
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

      setProfileBackground: (id) => {
        set({ profileBackground: id });
        track('profile_background_set', { background_id: id });
      },

      setNameFont: (id) => {
        set({ nameFont: id });
        track('profile_font_set', { font_id: id });
      },

      setSetting: (key, value) =>
        set((state) => ({ settings: { ...state.settings, [key]: value } })),

      setHasSeenWelcome: (v) => set({ hasSeenWelcome: v }),

      setWelcomeVersion: (v) => set({ welcomeVersion: v, hasSeenWelcome: true }),

      resetProgress: () =>
        set({ lessonsByUnit: {}, lessonsByBranch: {}, quizScores: {}, streak: 0, totalXP: 0, xpEvents: [], rankIndex: 0, lastLessonDate: null, dailyLessonCount: 0, dailyLessonDate: null, restDaysEarned: 0, restDaysUsed: 0, reviewState: {}, reviewDayCount: 0, reviewDayDate: null }),

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
          beliefResultId: null,
          streak: 0,
          totalXP: 0,
          xpEvents: [],
          rankIndex: 0,
          lastLessonDate: null,
          dailyLessonCount: 0,
          dailyLessonDate: null,
          restDaysEarned: 0,
          restDaysUsed: 0,
          reviewState: {},
          reviewDayCount: 0,
          reviewDayDate: null,
          startingBranch: null,
          // Asked again, because this device is now a different person: both
          // callers wipe to a clean baseline (account deleted, or signed out so
          // the next reader inherits nothing).
          onboardingVersion: 0,
          joinedAt: null,
          earnedBadges: [],
          badgesInitialized: true,
          displayName: 'Philosopher',
          email: '',
          bio: '',
          bioSeed: 0,
          portrait: 'overthinker',
          profileBackground: DEFAULT_BACKGROUND_ID,
          nameFont: DEFAULT_PROFILE_FONT,
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
          beliefResultId: null,
          streak: 0,
          totalXP: 0,
          xpEvents: [],
          rankIndex: 0,
          lastLessonDate: null,
          dailyLessonCount: 0,
          dailyLessonDate: null,
          restDaysEarned: 0,
          restDaysUsed: 0,
          reviewState: {},
          reviewDayCount: 0,
          reviewDayDate: null,
          startingBranch: null,
          // Asked again, because this device is now a different person: both
          // callers wipe to a clean baseline (account deleted, or signed out so
          // the next reader inherits nothing).
          onboardingVersion: 0,
          joinedAt: null,
          earnedBadges: [],
          badgesInitialized: true,
          displayName: 'Philosopher',
          email: '',
          bio: '',
          bioSeed: 0,
          portrait: 'overthinker',
          profileBackground: DEFAULT_BACKGROUND_ID,
          nameFont: DEFAULT_PROFILE_FONT,
          settings: DEFAULT_SETTINGS,
          _syncOwnerId: null,
        });
      },

      markChartSeen: () => set({ chartSeenXP: get().totalXP }),

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
        beliefResultId: state.beliefResultId,
        streak: state.streak,
        totalXP: state.totalXP,
        xpEvents: state.xpEvents,
        rankIndex: state.rankIndex,
        lastLessonDate: state.lastLessonDate,
        dailyLessonCount: state.dailyLessonCount,
        dailyLessonDate: state.dailyLessonDate,
        restDaysEarned: state.restDaysEarned,
        restDaysUsed: state.restDaysUsed,
        reviewState: state.reviewState,
        reviewDayCount: state.reviewDayCount,
        reviewDayDate: state.reviewDayDate,
        startingBranch: state.startingBranch,
        onboardingVersion: state.onboardingVersion,
        joinedAt: state.joinedAt,
        earnedBadges: state.earnedBadges,
        badgesInitialized: state.badgesInitialized,
        displayName: state.displayName,
        email: state.email,
        bio: state.bio,
        bioSeed: state.bioSeed,
        chartSeenXP: state.chartSeenXP,
        portrait: state.portrait,
        profileBackground: state.profileBackground,
        nameFont: state.nameFont,
        settings: state.settings,
        hasSeenWelcome: state.hasSeenWelcome,
        welcomeVersion: state.welcomeVersion,
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
        // Anyone who predates the profile-art picker gets the default look
        // rather than an empty id, which would render as a missing image.
        // `?? DEFAULT` is not enough on its own — a persisted id whose entry was
        // later renamed or removed must also fall back, which backgroundById and
        // profileFontById both do at read time.
        const profileBackground = p.profileBackground ?? DEFAULT_BACKGROUND_ID;
        const nameFont = p.nameFont ?? DEFAULT_PROFILE_FONT;
        // Which intro they have seen. Coalesced explicitly rather than left to the
        // spread: `...p` with the key merely ABSENT falls through to the default, but
        // with the key present and undefined it overwrites the default with undefined,
        // and `undefined < 2` is false — every reader would silently skip the intro
        // and nothing would report it. Nothing writes that shape today; this makes it
        // impossible to introduce one.
        const welcomeVersion = p.welcomeVersion ?? 0;
        // Same coalescing, same reason, for everything review and rest days do
        // arithmetic on: a key PRESENT AND UNDEFINED beats the default in a
        // spread, and `undefined - undefined` is NaN, which would then persist
        // and poison every later comparison silently.
        const restDaysEarned = p.restDaysEarned ?? 0;
        const restDaysUsed = p.restDaysUsed ?? 0;
        const reviewState = p.reviewState ?? {};
        const reviewDayCount = p.reviewDayCount ?? 0;
        const onboardingVersion = p.onboardingVersion ?? 0;
        return {
          ...current,
          ...p,
          lessonsByUnit,
          lessonsByBranch,
          totalXP,
          rankIndex,
          profileBackground,
          nameFont,
          welcomeVersion,
          restDaysEarned,
          restDaysUsed,
          reviewState,
          reviewDayCount,
          onboardingVersion,
          settings: sanitizeSettings(p.settings),
        };
      },
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
        // Each app launch = a fresh "who you're becoming" bio.
        state?.bumpBioSeed();
        if (state && !state.badgesInitialized) state.recomputeBadges();
        // ONE-TIME: carry the old day map over into the event log, so nobody's
        // climb chart resets to empty on the update that replaced it.
        //
        // `xpByDay` is gone from the state shape and from `partialize`, but it is
        // still sitting in every existing device's stored blob — persist merges
        // that blob in wholesale, so it arrives here as an untyped extra even
        // though nothing declares it. This is the only moment it can be read: the
        // next write persists the new shape without it.
        if (state && (!state.xpEvents || state.xpEvents.length === 0)) {
          const legacy = (state as unknown as { xpByDay?: Record<string, number> }).xpByDay;
          const carried = eventsFromDayMap(legacy);
          if (carried.length) state.xpEvents = carried;
        }
      },
    }
  )
);
