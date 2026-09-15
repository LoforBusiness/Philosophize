// What Settings promises the reader, reduced to the four things that actually
// get scheduled. Everything here is a LOCAL notification — there is no server,
// no push token, and nothing leaves the device.
export interface ReminderPrefs {
  dailyReminder: boolean;
  reminderTime: string; // '08:00 AM' — one of TIMES in the settings screen
  streakAlerts: boolean;
  quoteOfDay: boolean;
}

// What the streak reminder needs to know to tell the truth. Passed in rather
// than read from the store so this module stays free of app state.
export interface StreakContext {
  streak: number;
  doneToday: boolean;
}

/**
 * What the free trial's reminder needs in order to be true. `endsAt` null (no
 * trial running) or `willRenew` false (cancelled, so nothing is coming to warn
 * about) lays nothing down.
 */
export interface TrialReminder {
  endsAt: number | null;
  willRenew: boolean;
  /** The localized monthly price the trial becomes. */
  price: string;
  period: string;
}

/** What a tap on one of this app's notifications asks to open. */
export type NotificationOpen = 'trial';

export interface NotificationsProvider {
  /**
   * Whether this BINARY can schedule anything. False on web, in Expo Go, and —
   * the case that matters — in any installed APK built before expo-notifications
   * was added, which an over-the-air update cannot change. Settings hides the
   * whole section when this is false, so a reader is never shown a switch that
   * could not possibly do anything.
   */
  isSupported(): boolean;
  /** Already allowed by the OS? */
  hasPermission(): Promise<boolean>;
  /** Ask the OS (Android 13+ shows a system prompt). False if refused. */
  requestPermission(): Promise<boolean>;
  /**
   * Cancel everything and re-schedule from scratch. Idempotent and cheap, and
   * the only way anything gets scheduled — switching all three reminders off
   * simply means this rebuilds an empty set, with the trial's reminder in it if
   * a trial is running.
   */
  sync(prefs: ReminderPrefs, ctx: StreakContext, trial: TrialReminder): Promise<void>;
  /** Taps on this app's notifications while it is running. Returns an unsubscribe. */
  onOpen(cb: (open: NotificationOpen) => void): () => void;
  /** The tap that launched the app from cold, handed over once, then forgotten. */
  takeLaunchOpen(): Promise<NotificationOpen | null>;
}
