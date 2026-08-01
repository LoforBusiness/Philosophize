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
   * simply means this rebuilds an empty set.
   */
  sync(prefs: ReminderPrefs, ctx: StreakContext): Promise<void>;
}
