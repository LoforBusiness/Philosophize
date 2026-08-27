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
  glow: number;
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
// Fourteen to sixteen per mood, because one line repeated daily stops being a voice
// and becomes a label. Which one shows is chosen from the DAY, not at random: the
// same day shows the same line all day, so a reader who opens the app twice is not
// talking to two different people, and tomorrow it has moved on.
//
// THE POOL THAT MATTERS IS THE ONE HE IS ACTUALLY IN. Ninety-two lines is not the
// figure a reader meets — a reader who is late every evening only ever meets
// `impatient`, and four of those was a fortnight of the same joke. So the floor
// `check:quips` holds is PER MOOD, not per file.
//
// They are written for the box, too: `StreakMascot` caps the line at 300 and the
// streak body pads 16 a side, so on a 320dp phone the block is 252 wide. Every one
// of these wraps to two rows there, which is what keeps the 72px count where it
// belongs. Exactly one line in the file reaches three, and it shipped that way.
const LINES: Record<Mood, readonly string[]> = {
  proud: [  // fed today. Insufferable about it.
    'Done. I never doubted you. Much.',
    'Look at us. A functioning routine.',
    'You came back. I had a speech ready, but never mind.',
    'Another one. I am running out of ways to be surprised.',
    'Fed, watered and insufferable. Thank you.',
    'I told the others you would come. They laughed.',
    'Today you were a person who does things. Enjoy it.',
    'That is today handled. I will find something else to worry about.',
    'I had a whole speech about disappointment. Wasted.',
    'Good. Now do not ruin it by feeling clever.',
    'One day at a time, and today is one of them.',
    'I would say I am proud, but you would get comfortable.',
    'Noted. Filed. I will be bringing it up later.',
    'A quiet triumph. I will be loud about it for you.',
    'Look at that. A habit, forming, right in front of me.',
    'Done, and barely any fuss. Almost suspicious.',
  ],
  waiting: [  // alive, unfed, and the day is barely started.
    'Still nothing today. But there is time. Lots of time.',
    'I am not watching the door. I just happen to be facing it.',
    'No rush. It is only everything you have built.',
    'I have been standing here since midnight, but who is counting.',
    'Take your time. I have nowhere else to be. Ever.',
    'I will wait. It is the one thing I am good at now.',
    'Nothing yet. I am sure there is a reason.',
    'Do not mind me. I am just here. Existing. Waiting.',
    'The day is young. So was I, once.',
    'I have rehearsed being pleased about this. Do not waste it.',
    'Still early. What a lovely thing to be able to say.',
    'Any moment now. Any moment at all.',
    'I am not going to ask. I am simply going to stand here.',
    'Plenty of hours left. I have counted them twice.',
    'A whole day ahead of you. And of me. Mostly me.',
    'I could start without you. I have thought about it.',
  ],
  impatient: [  // alive, unfed, evening.
    'Evening already. Interesting choice.',
    'I have seen you pick up your phone four times. Not once for me.',
    'The lesson is two minutes long. I have done the maths.',
    'Whatever you are doing instead — is it going well?',
    'The sun managed to go all the way down. You managed this.',
    'I am fine. This is what fine looks like.',
    'Evening. The hour of good intentions and no lessons.',
    'I have started tidying. That is how bad it has got.',
    'You are not busy. You are simply not here.',
    'Dinner, was it? I ate nothing. I am a drawing.',
    'Somebody somewhere is finishing their lesson. Not you.',
    'I would remind you, but your phone is full of reminders.',
    'It gets later. That is the one thing it reliably does.',
    'I am not sulking. I am standing thoughtfully.',
    'Still time. Less of it. But still time.',
    'Do not let me interrupt whatever this is.',
  ],
  urgent: [  // alive, unfed, and midnight is close.
    'Midnight is coming and you are doing nothing about it.',
    'One lesson. That is the entire ask. It has always been the entire ask.',
    'I would hate for this to end tonight. I would talk about it constantly.',
    'You have minutes. I have watched you waste more than that today.',
    'This is the part where you save it, or we both find out.',
    'The clock is not on your side. It never was. Especially now.',
    'Two minutes. You have spent longer choosing what to watch.',
    'I am not panicking. My arms are always like this.',
    'Tomorrow you will be so annoyed. I will be here for that.',
    'One lesson stands between you and starting again at one.',
    'Go on. Prove me wrong. I would love it.',
    'I can already hear you explaining this to yourself.',
    'It ends at midnight. Midnight does not negotiate.',
    'You are cutting it fine. I hope that is on purpose.',
    'Now would be good. Now would be excellent, actually.',
    'This is the last hour it is still easy. After that it is arithmetic.',
  ],
  rescued: [  // a rest day paid for a gap he would rather discuss.
    'A rest day covered you. You are welcome, apparently.',
    'I spent a rest day on that. I hope it was a good day.',
    'Saved. Do not make a habit of needing saving.',
    'A rest day went in the bin so your number could stay.',
    'That was close. I aged. I am a stick figure and I aged.',
    'Covered. We do not have to talk about it. I will, though.',
    'You missed one. Something else paid for it.',
    'A rest day, spent. They do not grow back quickly.',
    'I used the emergency one. I hope you noticed.',
    'Your streak survived. Its dignity did not.',
    'Rescued again. I am starting to feel like staff.',
    'One rest day, gone. Quietly. Without ceremony.',
    'Do not thank me. Thank the rest day. It cannot hear you.',
    'That is what those were for. I still resent it.',
  ],
  lapsed: [  // gone.
    'It is gone. I watched it go.',
    'I am not angry. I am just drawn this way.',
    'We had something. You had somewhere else to be.',
    'Start again. I will pretend the first one never happened.',
    'Zero. A round number. Very tidy.',
    'It ended. I was here for it. Alone.',
    'Well. We will always have the good days.',
    'Back to one, then. One is a start. One is famously a start.',
    'I kept the ember lit as long as I could. It was a metaphor.',
    'Gone. But you know the way back. You built the path.',
    'The streak is dead. Long live the next streak.',
    'I am fine. I have simply stopped counting.',
    'It happens. To you, specifically, this time.',
    'Begin again. Everyone does. Some of them twice.',
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
export const PATINA_FLOOR = 0.34;

export function moodFor(input: MoodInput): MoodState {
  const { alive, fedToday, hour, restSpent, dayKey } = input;

  const mood: Mood = !alive ? 'lapsed'
    : restSpent > 0 ? 'rescued'
    : fedToday ? 'proud'
    : hour >= LATE_HOUR ? 'urgent'
    : hour >= EVENING_HOUR ? 'impatient'
    : 'waiting';

  return { mood, pose: POSE[mood], line: lineFor(mood, dayKey), glow: glowFor(input) };
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
export function glowFor({ alive, fedToday, hour, restSpent }: MoodInput): number {
  if (!alive) return 0;
  if (fedToday || restSpent > 0) return 1;
  if (hour < EVENING_HOUR) return 1;
  const through = (hour - EVENING_HOUR) / (24 - EVENING_HOUR);
  return 1 - (1 - PATINA_FLOOR) * Math.min(1, Math.max(0, through));
}
