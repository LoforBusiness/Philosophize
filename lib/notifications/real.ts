import { Platform } from 'react-native';
import * as N from 'expo-notifications';
import { getQuoteForDay, dayNumber } from '@/lib/dailyQuote';
import type { NotificationsProvider, ReminderPrefs, StreakContext } from './types';

// ─────────────────────────────────────────────────────────────────────────────
// LOCAL REMINDERS.
//
// Every notification this app sends is scheduled on the device, by the device.
// There is no server and no push token, which means reminders keep working with
// the app closed and the phone offline — and also means nothing can be composed
// at send time. Whatever a notification is going to say has to be decided now,
// while the app is open. That single constraint shapes everything below.
// ─────────────────────────────────────────────────────────────────────────────

const CHANNEL = 'reminders';

// The hour the streak warning lands. Late enough to mean "the day is nearly
// gone", early enough that a lesson still fits before midnight.
const STREAK_HOUR = 20;
// How many evenings ahead the streak warning is laid down. It is re-laid every
// time the app is opened, so this only has to cover a stretch where the app is
// NOT opened — which is exactly the stretch a streak reminder is for.
const STREAK_DAYS = 7;

const QUOTE_HOUR = 9;
const QUOTE_DAYS = 5;

let channelReady = false;
async function ensureChannel() {
  if (Platform.OS !== 'android' || channelReady) return;
  await N.setNotificationChannelAsync(CHANNEL, {
    name: 'Reminders',
    importance: N.AndroidImportance.DEFAULT,
    sound: 'default',
    // The app is black ink on paper; a coloured LED pulse would be the one
    // saturated thing anywhere near it.
    lightColor: '#1A1A1A',
  });
  channelReady = true;
}

/** '08:00 AM' → { hour: 8, minute: 0 }. Falls back to 8am on anything unexpected. */
export function parseTime(label: string): { hour: number; minute: number } {
  const m = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(label.trim());
  if (!m) return { hour: 8, minute: 0 };
  let hour = Number(m[1]) % 12;
  if (m[3].toUpperCase() === 'PM') hour += 12;
  const minute = Math.min(59, Math.max(0, Number(m[2])));
  return { hour, minute };
}

/** A Date at `hour:00` on the day `daysAhead` from now. */
function at(hour: number, daysAhead: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  d.setHours(hour, 0, 0, 0);
  return d;
}

// A quote has to survive being read on a lock screen, so it is trimmed at a word
// boundary rather than mid-syllable.
function trimQuote(text: string, max = 150): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const space = cut.lastIndexOf(' ');
  return `${cut.slice(0, space > 40 ? space : max).trimEnd()}…`;
}

async function schedule(identifier: string, title: string, body: string, trigger: any) {
  await N.scheduleNotificationAsync({
    identifier,
    content: { title, body, sound: 'default' },
    trigger,
  });
}

async function doSync(prefs: ReminderPrefs, ctx: StreakContext) {
  await ensureChannel();
  // Cancel-then-rebuild rather than diffing. The set is small, this runs on
  // foreground and on each settings change, and a scheduler that is rebuilt from
  // the current preferences every time cannot drift out of step with them.
  await N.cancelAllScheduledNotificationsAsync();

  if (prefs.dailyReminder) {
    const { hour, minute } = parseTime(prefs.reminderTime);
    // The only REPEATING trigger here, so the daily nudge never runs out even if
    // the app is not opened for a month. The price is fixed copy — a repeating
    // notification cannot know anything about the day it fires on.
    await schedule(
      'daily-reminder',
      'A minute of philosophy',
      'One lesson. One idea you did not have yesterday.',
      { type: N.SchedulableTriggerInputTypes.DAILY, hour, minute, channelId: CHANNEL }
    );
  }

  if (prefs.streakAlerts) {
    for (let d = 0; d < STREAK_DAYS; d++) {
      const when = at(STREAK_HOUR, d);
      if (when.getTime() <= Date.now()) continue; // 8pm has already gone by
      // TONIGHT is the only evening whose facts are known — whether a lesson is
      // already done, and what the streak actually stands at. So tonight's says
      // the number and the rest do not. A later evening claiming "your 12-day
      // streak" would be asserting something four days stale.
      const known = d === 0;
      if (known && (ctx.doneToday || ctx.streak <= 0)) continue;
      await schedule(
        `streak-${d}`,
        known ? `Your ${ctx.streak}-day streak ends at midnight` : 'Keep the streak alive',
        known
          ? 'One lesson before the day is out and it carries over.'
          : 'One lesson today keeps it going.',
        { type: N.SchedulableTriggerInputTypes.DATE, date: when, channelId: CHANNEL }
      );
    }
  }

  if (prefs.quoteOfDay) {
    const today = dayNumber();
    for (let d = 0; d < QUOTE_DAYS; d++) {
      const when = at(QUOTE_HOUR, d);
      if (when.getTime() <= Date.now()) continue;
      // The real quote for that specific day, written in now — so the line on
      // the lock screen is the same line the app shows when it is opened.
      const q = getQuoteForDay(today + d);
      await schedule(
        `quote-${d}`,
        q.author,
        `“${trimQuote(q.text)}”`,
        { type: N.SchedulableTriggerInputTypes.DATE, date: when, channelId: CHANNEL }
      );
    }
  }
}

export const realNotifications: NotificationsProvider = {
  // The import at the top of this file is what proves the native module is in
  // this binary — if it were missing the module would have thrown on the way in
  // and index.ts would have fallen back to the stub before anyone got here.
  isSupported: () => true,

  hasPermission: async () => {
    try {
      const { granted } = await N.getPermissionsAsync();
      return granted;
    } catch {
      return false;
    }
  },

  requestPermission: async () => {
    try {
      const existing = await N.getPermissionsAsync();
      if (existing.granted) return true;
      // Refused permanently: asking again is a no-op that resolves false, which
      // is the honest answer for the caller to act on.
      const asked = await N.requestPermissionsAsync();
      return asked.granted;
    } catch {
      return false;
    }
  },

  sync: async (prefs, ctx) => {
    try {
      // Never schedule against a permission we do not hold — on Android 13+ the
      // calls quietly succeed and nothing is ever delivered, which would put us
      // right back to switches that do nothing.
      const { granted } = await N.getPermissionsAsync();
      if (!granted) {
        await N.cancelAllScheduledNotificationsAsync();
        return;
      }
      await doSync(prefs, ctx);
    } catch {}
  },
};
