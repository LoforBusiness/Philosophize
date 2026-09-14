import type { BaseBeat } from './cinematicKit';

// Cinematic ethics-ethics-32, "Can You Borrow a Moral Verdict?"
//
// THE PICTURE: two people holding the same verdict card. One of them also has the
// reasons stacked up behind it; the other has the card and nothing behind it. Both
// cards read the same, and the lesson is spent on what is BEHIND them — then a new
// case arrives, and only one of the two can answer it.
//
// STAGING: two figures who face each other and HAND something across, and the
// answer targets are the two people rather than a row of cards — you tap whoever
// can take the new case.

export interface Ethics32Beat extends BaseBeat {
  /** Knower's gesture (emote code). */ a?: number;
  /** Borrower's gesture (emote code). */ b?: number;
  /** How many reasons are stacked behind the knower, 0…3. */ reasons?: number;
  /** The verdict card: 0 nobody · 1 knower only · 2 both hold it. */ card?: number;
  /** 1 = a new case has arrived and is waiting to be judged. */ fresh?: number;
  /** 1 = the two figures are live targets (Q1). */ pick?: number;
}

export const BEATS: Ethics32Beat[] = [
  {
    a: 461, b: 25, reasons: 0, card: 0,
    dur: 4.2,
    text: 'Suppose one person has thought about a hard moral question for years. A second person, who hasn’t thought about it, asks them for the answer.',
  },
  {
    a: 443, b: 25, reasons: 3, card: 1,
    dur: 4.8,
    text: 'The first person’s verdict rests on reasons: cases weighed, objections answered, earlier views revised. The verdict is only the conclusion of that reasoning.',
    cite: 'The reasons',
  },
  {
    a: 384, b: 31, reasons: 3, card: 2,
    dur: 4.4,
    text: 'Accepting a moral verdict on someone else’s word is called moral deference. Both people now hold the same true verdict, but only one holds the reasons.',
    cite: 'Moral deference',
  },
  {
    a: 393, b: 20, reasons: 3, card: 2,
    dur: 3.6,
    quote: {
      id: 'lq-ethics-ethics-32-1',
      text: 'Nothing is more difficult, and therefore more precious, than to be able to decide.',
      author: 'Napoleon Bonaparte',
      work: 'Attributed',
      era: 'c. 1810',
      branchSlugs: ['ethics'],
    },
  },
  {
    a: 413, b: 12, reasons: 3, card: 2, fresh: 1,
    dur: 4.6,
    text: 'Now a new case arises, similar to the first but not identical. Here the difference between the two of them has practical consequences.',
    cite: 'A new case',
  },
  {
    a: 383, b: 12, reasons: 3, card: 2, fresh: 1, pick: 1,
    dur: 1.0,
    interact: {
      prompt: 'Which of the two people can decide the new case?',
      explain: 'The person who worked the question out. A verdict answers only the question it was reached on. Reasons bear on new cases, and the person who deferred received none of them.',
      xp: 5,
    },
  },
  {
    a: 35, b: 24, reasons: 3, card: 2, fresh: 1,
    dur: 1.0,
    interact: {
      prompt: 'How much should another person’s moral verdict count in your own judgement?',
      drag: {
        lo: 'DISREGARD THEIR VERDICT',
        hi: 'ADOPT THEIR VERDICT',
        start: 0,
        zones: [
          { id: 'never', upto: 0.3, reads: 'no evidence at all' },
          { id: 'signal', upto: 0.74, reads: 'evidence that you should re-examine your reasons', correct: true },
          { id: 'take', upto: 1, reads: 'a verdict to adopt as your own' },
        ],
      },
      explain: 'Evidence that you should re-examine your reasons. A careful verdict that differs from yours suggests you’ve missed something. Adopting it gives you the answer, but not the understanding a new case needs.',
      xp: 5,
    },
  },
  {
    summary: {
      title: 'A Verdict Is Not Understanding',
      points: [
        'Moral deference is accepting a verdict on another’s word',
        'Deference can pass on a true verdict without its reasons',
        'Only the reasons equip you to judge a new case',
        'Another’s verdict is a reason to re-examine, not to stop',
      ],
      closing: 'A true verdict accepted on someone’s word is not yet an understanding of why it’s true.',
    },
    dur: 3.0,
  },
];
