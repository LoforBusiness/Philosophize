// WHAT THE REMINDERS SAY. ZERO IMPORTS, so check:quips can read every line in plain
// Node and hold the voice (§7).
//
// Dry, faintly disappointed, and entirely uninterested in motivating anybody: a
// housemate who has noticed you came in late and is not going to make a thing of it.
// The owner's word for it (2026-10-07): passive-aggressive, so the reader feels a
// little guilty about not learning.
//
//   1. IT NEEDLES ATTENDANCE, NEVER ABILITY. A lock screen is the most public surface
//      this app has. "You have not been in" survives a colleague reading it over a
//      shoulder; anything about how quick or clever the reader is does not.
//   2. IT NEVER CLAIMS A FACT IT CANNOT HOLD. The daily reminder fires at its hour
//      whether or not a lesson is already done (nothing is composed at send time), so
//      a daily line may not say the reader skipped today. The jabs are rhetorical.
//      A fact it states about the WORLD has to be true.

export interface Nag { title: string; body: string }

/**
 * The daily reminder, one pool per subject, four lines each. It was all philosophy
 * until 2026-10-07, from when the app was philosophy alone. `dailyNagFor` walks the
 * subjects one a day and the lines one a week, so a reader meets all seven subjects
 * in a week and no line twice in four.
 */
export const DAILY_NAGS: Record<string, Nag[]> = {
  philosophy: [
    { title: 'Still here', body: 'So are the philosophers. None of us has anywhere better to be.' },
    { title: 'No rush', body: 'Socrates gave his whole life to one question. I am asking for a minute.' },
    { title: 'Whenever suits you', body: 'The unexamined life is going fine, I am sure. People do say that.' },
    { title: 'Nothing urgent', body: 'Marcus Aurelius ran an empire and still found time to write things down.' },
  ],
  psychology: [
    { title: 'Interesting', body: 'Psychologists have a name for putting off what is good for you. I won’t say it. You know.' },
    { title: 'A small finding', body: 'People underestimate how long things take. A lesson takes two minutes. I timed it.' },
    { title: 'Don’t mind me', body: 'Unfinished tasks nag at the mind, the Zeigarnik effect says. Consider me one.' },
    { title: 'Just observing', body: 'Habits form by repeating something in the same place, at the same time. Like now.' },
  ],
  'personal-growth': [
    { title: 'Just checking', body: 'You said you wanted to get better at things. Your words. I kept them.' },
    { title: 'Small steps', body: 'Small steps add up, they say. They do have to be taken, though.' },
    { title: 'No pressure', body: 'Habits are built by turning up. I am told the turning up is the important part.' },
    { title: 'It’s fine', body: 'Every expert was a beginner who kept coming back. Just an observation.' },
  ],
  business: [
    { title: 'Opportunity cost', body: 'Every hour has one. A lesson is a very cheap one. I’m only saying.' },
    { title: 'Quick note', body: 'Post-it Notes came from a glue that failed. Even the glue had a go.' },
    { title: 'Meeting reminder', body: 'You, me, two minutes. I’ve kept my whole day free, as it happens.' },
    { title: 'Sunk cost', body: 'You’ve already put days into this. Shame to waste them. Just a thought.' },
  ],
  economics: [
    { title: 'Scarcity', body: 'Economics is the study of scarce things. I have one in mind.' },
    { title: 'Supply and demand', body: 'Plenty of lessons in stock. Demand, I gather, is the issue.' },
    { title: 'Compound interest', body: 'It rewards small, steady deposits. Learning works the same way. Just a thought.' },
    { title: 'A fact', body: 'The Economist compares Big Mac prices around the world. I compare how often you visit.' },
  ],
  science: [
    { title: 'Observation', body: 'A result only counts if it is repeated. The same goes for turning up.' },
    { title: 'A fact', body: 'Sunlight takes about eight minutes to reach you. A lesson takes less. Just saying.' },
    { title: 'Hypothesis', body: 'You will open a lesson today. I have been testing this one for a while.' },
    { title: 'Did you know', body: 'An octopus has three hearts. You only need the one to open a lesson.' },
  ],
  history: [
    { title: 'For the record', body: 'History is made by people who turned up. Just something to think about.' },
    { title: 'A fact', body: 'Cleopatra lived nearer the Moon landing than the building of the Great Pyramid. Time flies. Spend some.' },
    { title: 'Historians note', body: 'People are remembered for what they did. I would like to remember you for something.' },
    { title: 'History repeats', body: 'So they say. Ideally your lessons would too.' },
  ],
};

/** The order the subjects come round in, a day each. */
export const NAG_ORDER = ['philosophy', 'psychology', 'personal-growth', 'business', 'economics', 'science', 'history'];

/** The daily line for a day number: a new subject each day, a new line each week. */
export function dailyNagFor(day: number): Nag {
  const d = Math.max(0, Math.floor(day));
  const pool = DAILY_NAGS[NAG_ORDER[d % NAG_ORDER.length]];
  return pool[Math.floor(d / NAG_ORDER.length) % pool.length];
}

// SEVEN, BECAUSE THE WINDOW IS SEVEN EVENINGS (see real.ts). `known` is TONIGHT, the
// only evening whose facts are real: whether a lesson is done and what the streak
// stands at. `blind` is any later evening, which only fires on a day the app was not
// opened at all, so it may say "nothing today" but never the number. Subject-neutral
// on purpose: the streak belongs to every subject at once.
export const STREAK_NAGS: { known: string; blind: string }[] = [
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
