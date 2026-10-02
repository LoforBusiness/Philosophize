// WHAT THE WIDGET SAYS, AND HOW HE FEELS ABOUT IT.
//
// ZERO IMPORTS — plain Node runs this for `npm run check:widget` and the contact
// sheet, so every state can be drawn and checked without a phone.
//
// Duolingo's widget is the reference the owner named (2026-10-02), and its own
// write-up says what made it work: the owl shows whether today's lesson is done,
// and its mood gets steadily worse the closer it gets to midnight without one.
// That is the whole mechanism here, in this app's voice — the mascot is pointed
// about ATTENDANCE and never about ABILITY (§7; `check:widget` holds the lines to
// it). Being done is a small reward of its own: he relaxes.
//
// Everything is a pure function of the clock and the three stored numbers the
// headless task can read (streak, last lesson day, rest days held). The widget
// refreshes every three hours by itself and whenever the app is used, so the line
// and the fact change on that same three-hour slot — stable between refreshes,
// different at each one.

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night' | 'late';
export type WidgetState = 'new' | 'waiting' | 'done' | 'rested' | 'lapsed';

export interface WidgetInput {
  now: Date;
  streak: number;
  /** YYYY-MM-DD, local, of the last finished lesson; null if there has never been one. */
  lastLessonDate: string | null;
  /** Rest days held right now (they bridge missed days; see lib/utils/streak.ts). */
  restHeld: number;
}

export interface WidgetMood {
  state: WidgetState;
  tod: TimeOfDay;
  /** The streak to show: 0 once it has lapsed. */
  streak: number;
  /** Whole days since the last lesson (0 = today). */
  daysAway: number;
  /** True when the streak ends tonight unless a lesson is done. */
  atRisk: boolean;
  line: string;
  pose: string;
  /** He has his mug. */
  mug: boolean;
  /** He sits on a crate (the sip pose needs one under him). */
  crate: boolean;
  /** Grey sky and rain: he has been left. */
  rain: boolean;
  subject: string;
  fact: string;
  /** The three-hour slot everything was picked from. */
  slot: number;
}

/** Subject order round the slots. Philosophy first, then the Learn grid's order. */
export const FACT_ORDER = ['philosophy', 'psychology', 'personal-growth', 'business', 'economics', 'science', 'history'];

export function timeOfDay(h: number): TimeOfDay {
  if (h < 5) return 'late';
  if (h < 11) return 'morning';
  if (h < 17) return 'afternoon';
  if (h < 21) return 'evening';
  return 'night';
}

const key = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
function dayNumber(k: string): number | null {
  const [y, m, d] = k.split('-').map(Number);
  if (!y || !m || !d) return null;
  return Math.round(Date.UTC(y, m - 1, d) / 86_400_000);
}

// ── THE LINES ───────────────────────────────────────────────────────────────
// {n} is the streak, {d} the days away. Each pool is checked by `check:widget`:
// it must fit the widget's foot line, and no line may be about how GOOD the
// reader is. "You did not come" is a fact and fair to nag about; "you are bad at
// this" is the sentence most likely to make a beginner leave.
export const LINES = {
  new: [
    'Your first lesson takes about five minutes.',
    'Hello. I’m the one who waits for you.',
    'Seven subjects. Pick one. Any one.',
    'I’ve read ahead. It gets good.',
  ],
  morning: [
    'Morning. The lesson won’t read itself.',
    'Good morning. I’ve been up for hours.',
    'Coffee first. Then me. That’s the deal.',
    'Five minutes. I timed it myself.',
  ],
  afternoon: [
    'Afternoon. Still here. Still waiting.',
    'Lunch is over. I checked.',
    'I’ve been holding your place all day.',
    'Day {n} is waiting whenever you are.',
  ],
  evening: [
    'Getting dark. Still no you.',
    'Your {n}-day streak would like a word.',
    'The sun’s leaving. Don’t copy it.',
    'Dinner, then a lesson. I’m flexible.',
  ],
  night: [
    'Your {n}-day streak ends at midnight.',
    'Midnight is coming for your {n} days.',
    'Still time. Barely. But still time.',
    'I’m not panicking. You’re panicking.',
  ],
  nightFresh: [
    'It’s late. Tomorrow is also a day.',
    'Late again. I’ll be here in the morning.',
  ],
  late: [
    'It’s very late. Sleep. Then come back.',
    'Go to bed. Your streak is safe till tonight.',
  ],
  done: [
    'Done for today. Look at you, turning up.',
    'Lesson done. I’ll allow a smug face.',
    'That’s today sorted. Same time tomorrow?',
    'Day {n}. I’m almost impressed.',
    'You came. I’ll pretend I wasn’t worried.',
  ],
  rested: [
    'A rest day is holding your {n} days.',
    'Your streak is on a rest day. Are you?',
  ],
  lapsedOne: [
    'You missed yesterday. I noticed.',
    'Yesterday came and went. You didn’t.',
  ],
  lapsedFew: [
    '{d} days. I’ve been sitting here.',
    '{d} days. The hills and I have talked.',
    'Back from wherever you were? Good.',
  ],
  lapsedLong: [
    '{d} days. I’ve started reading alone.',
    '{d} days. I kept your seat warm.',
  ],
} as const;

/** Which poses each state may wear. Index picked by slot, like the line. */
const POSES: Record<string, readonly string[]> = {
  new: ['whoMe', 'idea'],
  morning: ['yawn', 'gazeUp'],
  afternoon: ['hipsWait', 'impatient'],
  evening: ['checkTime', 'cringe'],
  night: ['handsHead', 'cower'],
  nightFresh: ['noddingOff'],
  late: ['noddingOff'],
  done: ['recline', 'sip', 'crossLeg', 'celebrate'],
  rested: ['folded'],
  lapsedOne: ['deflate', 'facepalm'],
  lapsedFew: ['hugKnees'],
  lapsedLong: ['sprawl', 'hugKnees'],
};

const pick = <T,>(list: readonly T[], i: number): T => list[((i % list.length) + list.length) % list.length];
const fill = (s: string, n: number, d: number) => s.replace('{n}', String(n)).replace('{d}', String(d));

export function widgetMood({ now, streak, lastLessonDate, restHeld }: WidgetInput, facts: Record<string, readonly string[]>): WidgetMood {
  const tod = timeOfDay(now.getHours());
  const today = dayNumber(key(now))!;
  const last = lastLessonDate ? dayNumber(lastLessonDate) : null;
  const daysAway = last == null ? 0 : Math.max(0, today - last);
  // The slot counts LOCAL three-hour blocks, so it turns over with the clock on the wall.
  const slot = Math.floor((today * 24 + now.getHours()) / 3);

  let state: WidgetState;
  let pool: keyof typeof LINES;
  let shown = streak;
  if (last == null) { state = 'new'; pool = tod === 'night' || tod === 'late' ? 'nightFresh' : 'new'; shown = 0; }
  else if (daysAway === 0) { state = 'done'; pool = 'done'; }
  else if (daysAway === 1) {
    state = 'waiting';
    // A streak of 0 has nothing to lose tonight, so the night is sleepy, not frantic.
    pool = tod === 'night' ? (streak > 0 ? 'night' : 'nightFresh') : tod;
  } else if (daysAway - 1 <= restHeld) { state = 'rested'; pool = 'rested'; }
  else { state = 'lapsed'; shown = 0; pool = daysAway === 2 ? 'lapsedOne' : daysAway <= 7 ? 'lapsedFew' : 'lapsedLong'; }

  // A line that names the streak is only offered when there is a streak to name.
  const lines = (LINES[pool] as readonly string[]).filter((l) => !l.includes('{n}') || shown > 0);
  const line = fill(pick(lines, slot), shown, daysAway);
  const pose = pick(POSES[pool], slot >> 1);

  const subject = pick(FACT_ORDER, slot);
  const list = facts[subject] ?? [];
  const fact = list.length ? pick(list, Math.floor(slot / FACT_ORDER.length)) : '';

  return {
    state, tod, streak: shown, daysAway,
    atRisk: state === 'waiting' && tod === 'night' && streak > 0,
    line, pose,
    mug: pose === 'sip' || pose === 'yawn' || pose === 'recline',
    crate: pose === 'sip',
    rain: state === 'lapsed',
    subject, fact, slot,
  };
}
