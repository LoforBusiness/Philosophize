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
  /** 1 = a highlighted lane grows along the deficiency end of the rail (COWARD·TIMID), marking where "too much fear" sits on the scale. */ vice?: number;
  /** 1 = a dashed zone widens beneath the scale, showing the mean isn't one fixed point but shifts with the person and the situation. */ range?: number;
}

export const BEATS: Ethics13Beat[] = [
  {
    g: 384, pos: 0, habit: 0,
    dur: 4.0,
    text: 'Theories of rules and of outcomes judge what you do. Aristotle’s virtue ethics judges who you are: your traits of character.',
  },
  {
    g: 173, pos: 0, habit: 0, vice: 1,
    dur: 4.2,
    text: 'Aristotle places courage between two vices. The coward fears too much and flees dangers that should be faced.',
    cite: 'Deficiency',
  },
  {
    g: 387, pos: 4, habit: 0,
    dur: 4.4,
    text: 'The rash person is too bold and rushes into dangers that should be avoided. Excess, like deficiency, is a vice.',
    cite: 'Excess',
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
    g: 396, pos: 4, habit: 0, range: 1,
    dur: 4.6,
    text: 'Yet the mean isn’t a fixed halfway point. Aristotle holds that it shifts with the person and the situation.',
    cite: 'Not a fixed midpoint',
  },
  {
    g: 443, pos: 4, habit: 0, pick: 1,
    dur: 1.0,
    interact: {
      prompt: 'Where does courage lie between cowardice and recklessness?',
      explain: 'Courage, in the middle. A virtue isn’t the maximum of a trait. Courage is the right amount of fear for the situation. Both ends of the scale are vices of the same trait.',
      xp: 5,
    },
  },
  {
    g: 381, pos: 2, habit: 1,
    dur: 1.0,
    interact: {
      prompt: 'What makes a person courageous, on Aristotle’s account?',
      drag: {
        lo: 'FEAR OF EVERYTHING',
        hi: 'NO FEAR AT ALL',
        start: 0,
        zones: [
          { id: 'timid', upto: 0.3, reads: 'timid: afraid of what can’t hurt you' },
          { id: 'brave', upto: 0.7, reads: 'brave: fears the right things, by habit', correct: true },
          { id: 'rash', upto: 1, reads: 'rash: too bold before real dangers' },
        ],
      },
      explain: 'Brave means fearing the right things, by settled habit. Feeling no fear at all is a vice, not courage. Aristotle holds that people become brave by doing brave acts, until the disposition is settled.',
      xp: 5,
    },
  },
  {
    summary: {
      title: 'Virtue as a Mean',
      points: [
        'Virtue ethics asks who to become, not what to do',
        'Each virtue is a mean between two vices of one trait',
        'The mean is judged against the situation, not averaged',
        'Good character is formed by habit',
      ],
      closing: 'On Aristotle’s view, a virtuous person acts well from settled character, not by consulting a rule each time.',
    },
    dur: 3.0,
  },
];
