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
    g: 5, pos: 0, habit: 0,
    dur: 4.0,
    text: 'Rules and outcomes judge the act. Aristotle judges the person, and asks how much of a trait they have — not whether they followed anything.',
  },
  {
    g: 46, pos: 0, habit: 0,
    dur: 4.2,
    text: 'Too little fear-handling and you are a coward: you run from things that should be faced. That is one end of the rail.',
    cite: 'Too little',
  },
  {
    g: 15, pos: 4, habit: 0,
    dur: 4.4,
    text: 'Too much and you are reckless: you charge at things that should be walked away from. Same trait, other end, and it is a vice too.',
    cite: 'Too much',
  },
  {
    g: 144, pos: 4, habit: 0,
    dur: 3.6,
    quote: {
      id: 'lq-ethics-ethics-13-2',
      text: 'The good has rightly been declared to be that at which all things aim.',
      author: 'Aristotle',
      work: 'Nicomachean Ethics',
      era: 'c. 340 BC',
      branchSlugs: ['ethics'],
    },
  },
  {
    g: 4, pos: 4, habit: 0,
    dur: 4.6,
    text: 'So courage is somewhere along here — and notice what kind of answer that is. Not a rule you could write down, but an amount, judged against what is actually in front of you.',
    cite: 'Somewhere along here',
  },
  {
    g: 2, pos: 4, habit: 0, pick: 1,
    dur: 1.0,
    interact: {
      prompt: 'Tap where courage sits on the rail.',
      explain: 'The middle. Virtue is not the maximum of a trait — courage is not the most fear or the least, but the right amount for what is in front of you. Both ends of this rail are vices of the same trait.',
      xp: 5,
    },
  },
  {
    g: 26, pos: 2, habit: 1,
    dur: 1.0,
    interact: {
      prompt: 'So what makes someone courageous?',
      cards: [
        { text: 'A settled habit', correct: true },
        { text: 'Feeling no fear', correct: false },
      ],
      explain: 'The other card is the trap: no fear at all is the far left of this rail, not the middle. Courage is a settled habit of the right amount — and Aristotle\'s reply is that anyone still consulting the rule has not yet become the person the rule describes.',
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
      closing: 'A rule tells you what to do this once. A character decides it for you before you have finished reading the question.',
    },
    dur: 3.0,
  },
];
