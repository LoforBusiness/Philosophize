import { create } from 'zustand';

// The result of a finished lesson, handed to the GLOBAL reward overlay. The reward
// is shown at the app root (not by the lesson screen) so completing a lesson can
// pop its screen off the tab's stack immediately — otherwise the finished screen
// lingered on the Learn stack and re-showed the reward on every return to the tab.
export interface RewardInfo {
  xp: number;
  correct: number;
  total: number;
  branchSlug: string | null;
  lessonId: string;
}

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

  // ── THE LESSON TESTER (dev only) ───────────────────────────────────────────
  //
  // `devUnlocked` is off in a shipped build until the version line in Settings is
  // tapped seven times, and it is NOT persisted — it lasts the session, so it can
  // never be left on by accident on a real user's phone. In a dev build it starts
  // on, because tapping seven times to reach your own tools every launch is silly.
  //
  // `testLessonId` is what makes a test run cost nothing. It names the ONE lesson
  // currently being played from the tester, and LessonReward compares against it
  // before writing anything. Naming the lesson rather than carrying a bare boolean
  // is the whole safety property: every lesson screen sets this on mount — to its
  // own id when launched with ?test=1 and to null otherwise — so a flag can never
  // survive into a real lesson and silently swallow someone's XP.
  devUnlocked: boolean;
  unlockDev: () => void;
  testLessonId: string | null;
  setTestLesson: (id: string | null) => void;
  openPaywall: () => void;
  closePaywall: () => void;
  /**
   * Bumped when the OS notification permission has just been granted, so the
   * reminder scheduler re-runs.
   *
   * It exists because `useReminders` re-syncs on a CHANGE to the reminder
   * settings, and granting permission changes none of them — all three default
   * to true, so both places that ask (the reward-screen prompt and the Settings
   * toggles) were writing a value that was already there. Nothing in the
   * dependency list moved, sync() never re-ran, and the reminders the reader had
   * just said yes to were not scheduled until the next foreground. This is the
   * one signal that says "the answer changed even though the settings did not".
   */
  remindersNonce: number;
  bumpReminders: () => void;
  // ── THE CONFERRAL ─────────────────────────────────────────────────────────
  //
  // The Scholar's Pass being handed over, shown globally over everything for the
  // same reason the reward is: it has to survive the screen that raised it going
  // away. A purchase can be made from the Pass tab, from the post-lesson sheet,
  // from the daily-limit gate or from Settings, and three of those four dismiss
  // themselves the moment `isPro` flips — so a ceremony owned by any of them
  // would be unmounted mid-animation by its own success.
  //
  // It is fired from `subscriptionStore` rather than from the four call sites,
  // which is the whole point: there is one place a reader becomes a Scholar, so
  // there is one place the ceremony starts and it cannot be forgotten at a fifth.
  //
  // `seq` forces a fresh mount, exactly as `rewardSeq` does — somebody who
  // trials, lapses and then buys must see it play from the beginning.
  conferral: 'trial' | 'purchase' | null;
  conferralSeq: number;
  showConferral: (kind: 'trial' | 'purchase') => void;
  dismissConferral: () => void;
  // Lesson-complete reward, shown globally over everything. Set on completion,
  // cleared on "Continue". `rewardSeq` forces a fresh mount per completion.
  reward: RewardInfo | null;
  rewardSeq: number;
  showReward: (r: RewardInfo) => void;
  dismissReward: () => void;
  // True once the animated launch screen has finished and lifted away. Lives here
  // rather than in _layout's local state because the welcome animation needs it:
  // the launch screen covers the whole boot (~4s), and index.tsx mounts underneath
  // it, so a timeline started at mount would play its opening to a hidden screen.
  launchDone: boolean;
  setLaunchDone: (v: boolean) => void;
  // True once the home-screen stickman has had his one outing this app session.
  // Deliberately NOT persisted: it resets on every cold start, which is exactly
  // the "once per app open" cadence we want — he must not replay every time the
  // user taps back onto the Home tab.
  strollPlayed: boolean;
  markStrollPlayed: () => void;
  // THE LESSON THAT WAS JUST FINISHED, handed to the branch screen so it can play
  // the advance rather than simply appearing in its new state.
  //
  // It carries `unitId` and `seq` for reasons that are not obvious. `unitId`,
  // because the branch screen must open the right unit and a lesson id alone does
  // not say which unit holds it without a lookup the screen would have to repeat.
  // `seq`, because finishing the SAME lesson twice (a replay, or a re-completion
  // after the store was restored) is otherwise indistinguishable from the object
  // it already has, and the animation would not re-arm.
  //
  // NOT persisted, deliberately: it describes one moment, and a celebration that
  // survived a cold start would play to somebody who finished that lesson
  // yesterday and has no idea what it is congratulating them for.
  justFinished: { lessonId: string; unitId: string; branchSlug: string; seq: number } | null;
  markLessonFinished: (v: { lessonId: string; unitId: string; branchSlug: string }) => void;
  clearLessonFinished: () => void;
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
  devUnlocked: __DEV__,
  unlockDev: () => set({ devUnlocked: true }),
  testLessonId: null,
  setTestLesson: (id) => set({ testLessonId: id }),
  openPaywall: () => set({ paywallOpen: true }),
  closePaywall: () => set({ paywallOpen: false }),
  remindersNonce: 0,
  bumpReminders: () => set((s) => ({ remindersNonce: s.remindersNonce + 1 })),
  conferral: null,
  conferralSeq: 0,
  showConferral: (kind) => set((s) => ({ conferral: kind, conferralSeq: s.conferralSeq + 1 })),
  dismissConferral: () => set({ conferral: null }),
  reward: null,
  rewardSeq: 0,
  showReward: (r) => set((s) => ({ reward: r, rewardSeq: s.rewardSeq + 1 })),
  dismissReward: () => set({ reward: null }),
  launchDone: false,
  setLaunchDone: (v) => set({ launchDone: v }),
  strollPlayed: false,
  markStrollPlayed: () => set({ strollPlayed: true }),
  justFinished: null,
  markLessonFinished: (v) =>
    set((s) => ({ justFinished: { ...v, seq: (s.justFinished?.seq ?? 0) + 1 } })),
  clearLessonFinished: () => set({ justFinished: null }),
}));
