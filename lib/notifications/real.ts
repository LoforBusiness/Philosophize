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

// ─────────────────────────────────────────────────────────────────────────────
// THE VOICE, AND THE TWO RULES IT KEEPS.
//
// Dry, faintly disappointed, and entirely uninterested in motivating anybody.
// "One lesson. One idea you did not have yesterday" is a homework reminder; this
// is a housemate who has noticed you came in late and is not going to make a
// thing of it.
//
//   1. IT NEEDLES ATTENDANCE, NEVER ABILITY. A lock screen is the most public
//      surface this app has. "You have not been in" survives a colleague reading
//      it over a shoulder; anything about how quick or clever the reader is does
//      not, and gets the app deleted rather than opened.
//   2. IT NEVER CLAIMS A FACT IT CANNOT HOLD. Nothing here can be composed at
//      send time (see the header), so a line counting what the reader did today
//      would be a guess printed as a statement. The jabs are rhetorical — "I
//      imagine today was busy" — never numeric.
// ─────────────────────────────────────────────────────────────────────────────
const DAILY_NAGS = [
  { title: 'Still here',
    body: 'So are the philosophers. None of us has anywhere better to be.' },
  { title: 'No rush',
    body: 'Socrates gave his whole life to one question. I am asking for a minute.' },
  { title: 'Whenever suits you',
    body: 'The unexamined life is going fine, I am sure. People do say that.' },
  { title: 'Don’t mind me',
    body: 'Two minutes was the entire pitch. I have not revised it.' },
  { title: 'It’s fine',
    body: 'I have been in here with the ideas. We were just talking about you.' },
  { title: 'Just checking',
    body: 'You said you wanted to think more clearly. Your words. I kept them.' },
  { title: 'Nothing urgent',
    body: 'Marcus Aurelius ran an empire and still wrote something down at night.' },
  { title: 'Take your time',
    body: 'Ideas keep. That is rather the point of them. And yet.' },
  { title: 'I imagine today was busy',
    body: 'They usually are. That is generally how it goes.' },
  { title: 'Hello again',
    body: 'I am not going to nag. I am simply going to be here, at this hour, daily.' },
];

// SEVEN, BECAUSE THE WINDOW IS SEVEN EVENINGS. At four, a reader who leaves the
// app alone for a week gets nights five, six and seven repeating nights one, two
// and three word for word — and a nag that repeats stops being a voice and
// becomes a bug. One per evening the window can reach.
//
// `known` is TONIGHT, the only evening whose facts are real: whether a lesson is
// already done and what the streak actually stands at. `blind` is any later
// evening. A blind line may still say "nothing today", because a blind evening
// only fires when the app was not opened that day at all — and a day the app was
// not opened is a day no lesson was finished. It may not say the NUMBER, which
// would be days stale by the time it arrived.
const STREAK_NAGS = [
  { known: 'One lesson before midnight and it carries. I will wait up.',
    blind: 'One lesson keeps it. I am not going anywhere.' },
  { known: 'It ends at midnight. That is not a threat, it is a timetable.',
    blind: 'Still nothing today. There is time, but not much of it.' },
  { known: 'Two minutes. I have watched you spend more than that scrolling.',
    blind: 'A lesson takes two minutes. I have done the maths.' },
  { known: 'I would hate to see this one go. I would mention it often.',
    blind: 'Whatever you are doing instead — is it going well?' },
  { known: 'After midnight it is just a number you used to have.',
    blind: 'Nothing yet today. I am choosing not to read into it.' },
  { known: 'You have kept this going. Odd place to stop.',
    blind: 'One lesson and I will leave you alone until tomorrow. Promise.' },
  { known: 'I am not going to beg. I am simply noting how late it is getting.',
    blind: 'Getting late. I am noting it, that is all.' },
];

async function doSync(prefs: ReminderPrefs, ctx: StreakContext) {
  await ensureChannel();
  // Cancel-then-rebuild rather than diffing. The set is small, this runs on
  // foreground and on each settings change, and a scheduler that is rebuilt from
  // the current preferences every time cannot drift out of step with them.
  await N.cancelAllScheduledNotificationsAsync();

  if (prefs.dailyReminder) {
    const { hour, minute } = parseTime(prefs.reminderTime);
    // ── ROTATED BY DAY, NOT FIXED FOREVER ────────────────────────────────────
    //
    // This said "A minute of philosophy / One lesson. One idea you did not have
    // yesterday." — a homework reminder, and the one voice this app had no
    // business using. Every other surface here is dry and faintly put out; the
    // notification that arrives most often was the one being earnest.
    //
    // It is still the only REPEATING trigger, so it never runs out even if the
    // app is not opened for a month — but the copy no longer has to be fixed
    // FOREVER, only fixed until the next sync. `doSync` runs on every
    // foreground, so keying the line to `dayNumber()` means it changes each day
    // the app is opened and simply holds if it is not. Nothing is asserted about
    // the day it fires on, which is the actual constraint.
    const nag = DAILY_NAGS[dayNumber() % DAILY_NAGS.length];
    await schedule(
      'daily-reminder',
      nag.title,
      nag.body,
      { type: N.SchedulableTriggerInputTypes.DAILY, hour, minute, channelId: CHANNEL }
    );
  }

  if (prefs.streakAlerts) {
    // One line per evening the window reaches — see STREAK_NAGS above, which is
    // sized to STREAK_DAYS for exactly that reason.
    for (let d = 0; d < STREAK_DAYS; d++) {
      const when = at(STREAK_HOUR, d);
      if (when.getTime() <= Date.now()) continue; // 8pm has already gone by
      // TONIGHT is the only evening whose facts are known — whether a lesson is
      // already done, and what the streak actually stands at. So tonight's says
      // the number and the rest do not. A later evening claiming "your 12-day
      // streak" would be asserting something four days stale.
      const known = d === 0;
      if (known && (ctx.doneToday || ctx.streak <= 0)) continue;
      // HIS VOICE, NOT THE APP'S — this is the one place the guilt trip reaches
      // somebody who has already left, which is the only audience it can actually
      // change. The escalation cannot be computed here (a notification laid down on
      // Tuesday cannot know what Friday looks like), so it is carried by the ONE
      // fact each evening knows: tonight knows the number, the rest do not.
      //
      // Kept to the same rule as the screen — it needles ATTENDANCE, never ability.
      // A lock screen is the most public surface this app has, and a line that reads
      // as an insult when a colleague glances over is a line that gets the app
      // deleted rather than opened.
      // ── `dayNumber() + d`, NOT `d` ──────────────────────────────────────────
      //
      // Indexing on `d` alone looks like it rotates and does not, for the line
      // that matters most: `known` is only ever true at d === 0, so tonight's
      // notification always drew STREAK_NAGS[0] and every evening the reader
      // actually saw said the same sentence. The variety was real for the six
      // future evenings and absent from the one delivered daily.
      //
      // Offsetting by the day makes tonight move through the set as the days do,
      // and keeps the six ahead of it distinct from tonight and from each other.
      const line = STREAK_NAGS[(dayNumber() + d) % STREAK_NAGS.length];
      await schedule(
        `streak-${d}`,
        known ? `Your ${ctx.streak}-day streak ends at midnight` : 'Keep the streak alive',
        known ? line.known : line.blind,
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
