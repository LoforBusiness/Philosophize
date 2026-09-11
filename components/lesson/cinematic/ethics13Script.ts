import type { BaseBeat } from './cinematicKit';

// Cinematic ethics-ethics-13, "Becoming Good, Not Just Doing Good" — a CONVERSION of
// an existing card deck, taken in reading order at the Ethics frontier (§5).
//
// THE PICTURE: one rail running from too little of a trait to too much, with a marker
// on it. Answer, and the marker slides to the middle and a GROOVE wears in underneath
// it — which is the second half of Aristotle's claim: the mean is not a position you
// work out each time, it is one you wear in by habit (H64).
//
// STAGING: the answer targets are POSITIONS ON A SCALE, and the correct one is a
// place rather than a proposition (E33).

export interface Ethics13Beat extends BaseBeat {
  /** Figure gesture (emote code). */ g?: number;
  /** Where the marker sits on the rail, 0…4. */ pos?: number;
  /** How deep the groove of habit is worn, 0…1. */ habit?: number;
  /** 1 = the five positions are live targets (Q1). */ pick?: number;
}

export const BEATS: Ethics13Beat[] = [
  {
    g: 384, pos: 0, habit: 0,
    dur: 4.0,
    text: 'Rules and outcomes judge the act. Aristotle judges the person, and asks how much of a trait they have, not whether they followed anything.',
  },
  {
    g: 173, pos: 0, habit: 0,
    dur: 4.2,
    text: 'Too little fear-handling and you’re a coward: you run from things that should be faced. That’s one end of the rail.',
    cite: 'Too little',
  },
  {
    g: 387, pos: 4, habit: 0,
    dur: 4.4,
    text: 'Too much and you’re reckless: you charge at things that should be walked away from. Same trait, other end, and it is a vice too.',
    cite: 'Too much',
  },
  {
    g: 144, pos: 4, habit: 0,
    dur: 3.6,
    quote: {
      id: 'lq-ethics-ethics-13-2',
      text: 'The good has rightly been declared to be that at which all things aim.',
      author: 'Aristotle',
      philosopherId: 'aristotle',
      work: 'Nicomachean Ethics',
      era: 'c. 340 BC',
      branchSlugs: ['ethics'],
    },
  },
  {
    g: 396, pos: 4, habit: 0,
    dur: 4.6,
    text: 'So courage is somewhere along here, and notice what kind of answer that is. Not a rule to write down, but an amount judged against what’s in front of you.',
    cite: 'Somewhere along here',
  },
  {
    g: 443, pos: 4, habit: 0, pick: 1,
    dur: 1.0,
    interact: {
      prompt: 'Tap where courage sits on the rail.',
      explain: 'The middle. Virtue is not the maximum of a trait. Courage is not the most fear or the least, but the right amount for what’s in front of you. Both ends of this rail are vices of the same trait.',
      xp: 5,
    },
  },
  {
    g: 381, pos: 2, habit: 1,
    dur: 1.0,
    interact: {
      prompt: 'So what makes a person courageous?',
      drag: {
        lo: 'NO FEAR AT ALL',
        hi: 'FEAR OF EVERYTHING',
        start: 0,
        zones: [
          { id: 'rash', upto: 0.3, reads: 'rash: feels no fear and should' },
          { id: 'brave', upto: 0.7, reads: 'brave: the right amount, as a habit', correct: true },
          { id: 'timid', upto: 1, reads: 'timid: afraid of what cannot hurt you' },
        ],
      },
      explain: 'The trap is “no fear at all”. It’s the far left of this rail, not the middle. Courage is a settled habit of the right amount. Aristotle’s reply is that anyone still consulting the rule hasn’t yet become the person the rule describes.',
      xp: 5,
    },
  },
  {
    summary: {
      title: 'Character Over Conduct',
      points: [
        'Virtue ethics asks who to become, not what to do',
        'Each virtue is a mean between two vices of one trait',
        'The mean is judged against the situation, not averaged',
        'Good character is worn in by habit, like a groove',
      ],
      closing: 'A rule tells you what to do this once. A character decides it for you before you’ve finished reading the question.',
    },
    dur: 3.0,
  },
];
