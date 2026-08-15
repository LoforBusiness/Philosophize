// ─────────────────────────────────────────────────────────────────────────────
// THE MASCOT'S MOOD — what the stickman is doing, and what he has to say about it.
//
// ZERO IMPORTS and it never reads the clock, the same rule as rig.ts and camera.ts,
// for the same two reasons. The whole ladder can be stepped in plain Node, which is
// how `npm run check:streak` proves every mood is reachable and every pose it names
// exists; and a function that consulted `new Date()` itself could disagree with the
// screen that called it, which across midnight is exactly when a streak matters.
//
// ── THE CHARACTER ───────────────────────────────────────────────────────────
//
// He guilt-trips. That is the brief, and the reason it works is that the guilt is
// ALWAYS EARNED — the tone tracks the mechanic rather than being sprayed over it.
// Smug while you are winning, pointed once you are late, wounded once you have
// actually lost something. A mascot who nags a reader on a 200-day streak is not a
// character, it is a bug with a personality.
//
// The one hard line: he is never cruel about ABILITY, only about ATTENDANCE. "You
// did not come" is a fact and a fair thing to needle. "You are bad at this" is not,
// and would be the app telling a beginner the thing most likely to make them leave.
// ─────────────────────────────────────────────────────────────────────────────

export type Mood =
  | 'proud'      // fed today. Insufferable about it.
  | 'waiting'    // alive, not fed, and there is plenty of day left.
  | 'impatient'  // alive, not fed, evening.
  | 'urgent'     // alive, not fed, and the day is nearly gone.
  | 'rescued'    // a rest day is covering a gap he would rather discuss.
  | 'lapsed';    // gone.

export interface MoodState {
  mood: Mood;
  /** An emote code from rig.ts's table — the pose he holds. */
  pose: number;
  /** What he says. One line, his voice. */
  line: string;
  /**
   * How lit the ember is, 0..1.
   *
   * THIS IS THE DECAY, and it is the only part of the feature the reader feels
   * without reading a word: fed today it is full, and across an unfed day it sinks
   * toward a floor. It never reaches 0 while the streak is alive, because a streak
   * that LOOKS dead while it is still savable is a lie that costs the reader the
   * streak — the floor is dim enough to be alarming and bright enough to be alive.
   */
  ember: number;
}

// ── THE POSES, CHOSEN BY LOOKING AT THEM ────────────────────────────────────
//
// The first set was picked by NAME — hand-on-hip for smug, arms-crossed for waiting,
// forehead for despair — and every one of those reads perfectly in prose. Sheeted
// and looked at, three of the six were a solid black blob.
//
// The reason is structural and worth keeping written down: the rig draws in PROFILE,
// and its limbs are 11 units thick against a torso of 12. Any pose that folds an arm
// against the body therefore merges into one mass — which is exactly what
// hand-on-hip, arms-crossed and power-pose all do. It is the same failure the rule
// book records for `arms-crossed` drawing a figure with no arms, and no numeric
// check catches it because nothing is out of range.
//
// So every code here is one whose arm is CLEAR OF THE TORSO, verified on a contact
// sheet at the size the mascot is actually drawn:
const POSE = {
  proud: 35,     // proclaim — arm up. Triumphant, and he means it about himself.
  waiting: 7,    // both-wide — the "well?" pose, arms open and empty.
  impatient: 26, // stamp — weight forward, foot down.
  urgent: 13,    // point-forward — a straight arm, aimed at the reader. Accusation.
  rescued: 8,    // shrug — both arms out. He is not taking responsibility for this.
  lapsed: 46,    // slump — hunched, head down. The only pose here with no arm at all,
                 //          and it reads because the whole SILHOUETTE changes.
} as const;

// ── WHAT HE SAYS ────────────────────────────────────────────────────────────
//
// Several per mood, because one line repeated daily stops being a voice and becomes
// a label. Which one shows is chosen from the DAY, not at random: the same day shows
// the same line all day, so a reader who opens the app twice is not talking to two
// different people, and tomorrow it has moved on.
const LINES: Record<Mood, readonly string[]> = {
  proud: [
    'Done. I never doubted you. Much.',
    'Look at us. A functioning routine.',
    'You came back. I had a speech ready, but never mind.',
    'Another one. I am running out of ways to be surprised.',
  ],
  waiting: [
    'Still nothing today. But there is time. Lots of time.',
    'I am not watching the door. I just happen to be facing it.',
    'No rush. It is only everything you have built.',
    'I have been standing here since midnight, but who is counting.',
  ],
  impatient: [
    'Evening already. Interesting choice.',
    'I have seen you pick up your phone four times. Not once for me.',
    'The lesson is two minutes long. I have done the maths.',
    'Whatever you are doing instead — is it going well?',
  ],
  urgent: [
    'Midnight is coming and you are doing nothing about it.',
    'One lesson. That is the entire ask. It has always been the entire ask.',
    'I would hate for this to end tonight. I would talk about it constantly.',
    'You have minutes. I have watched you waste more than that today.',
  ],
  rescued: [
    'A rest day covered you. You are welcome, apparently.',
    'I spent a rest day on that. I hope it was a good day.',
    'Saved. Do not make a habit of needing saving.',
  ],
  lapsed: [
    'It is gone. I watched it go.',
    'I am not angry. I am just drawn this way.',
    'We had something. You had somewhere else to be.',
    'Start again. I will pretend the first one never happened.',
  ],
};

/**
 * A stable index into a mood's lines, from the day key.
 *
 * The day rather than the clock, so the line does not change while the reader is
 * looking at it — and a plain character sum rather than a hash, because it only has
 * to spread four ways and being readable matters more here than being uniform.
 */
export function lineFor(mood: Mood, dayKey: string): string {
  const lines = LINES[mood];
  let h = 0;
  for (let i = 0; i < dayKey.length; i++) h = (h * 31 + dayKey.charCodeAt(i)) >>> 0;
  return lines[h % lines.length];
}

export interface MoodInput {
  /** The streak the reader actually has right now (already made effective). */
  streak: number;
  /** Whether the streak is still standing at all. */
  alive: boolean;
  /** Whether a lesson has been finished today. */
  fedToday: boolean;
  /** Local hour, 0–23. Passed in — this file never reads a clock. */
  hour: number;
  /** Rest days a gap is currently costing, if any. */
  restSpent: number;
  /** Today's YYYY-MM-DD, for choosing a line. */
  dayKey: string;
}

/**
 * EVENING IS 18:00 AND LATE IS 21:00, and those are the two numbers the whole
 * escalation turns on. Chosen against the reminder times in lib/notifications
 * rather than by feel: the daily nudge and the streak warning already treat the
 * evening as the moment a day is at risk, and a mascot whose panic disagreed with
 * the notification that just fired would read as two different apps.
 */
export const EVENING_HOUR = 18;
export const LATE_HOUR = 21;

/** The floor the ember decays to while a streak is alive but unfed. */
export const EMBER_FLOOR = 0.34;

export function moodFor(input: MoodInput): MoodState {
  const { alive, fedToday, hour, restSpent, dayKey } = input;

  const mood: Mood = !alive ? 'lapsed'
    : restSpent > 0 ? 'rescued'
    : fedToday ? 'proud'
    : hour >= LATE_HOUR ? 'urgent'
    : hour >= EVENING_HOUR ? 'impatient'
    : 'waiting';

  return { mood, pose: POSE[mood], line: lineFor(mood, dayKey), ember: emberFor(input) };
}

/**
 * How lit the ember is right now.
 *
 * Full when fed and when a rest day has just carried you; dead flat when the streak
 * is. Otherwise it sinks across the waking day — not from midnight, because a reader
 * opening the app at 8am has not yet done anything wrong and should not be met with
 * a nearly-dead flame. It starts falling at EVENING_HOUR and reaches the floor at
 * midnight, which is also exactly when the thing it represents runs out.
 */
export function emberFor({ alive, fedToday, hour, restSpent }: MoodInput): number {
  if (!alive) return 0;
  if (fedToday || restSpent > 0) return 1;
  if (hour < EVENING_HOUR) return 1;
  const through = (hour - EVENING_HOUR) / (24 - EVENING_HOUR);
  return 1 - (1 - EMBER_FLOOR) * Math.min(1, Math.max(0, through));
}
