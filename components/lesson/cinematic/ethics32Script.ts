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
    a: 4, b: 25, reasons: 0, card: 0,
    dur: 4.2,
    text: 'One of these two has thought about a hard moral question for years. The other has just asked them what the answer is.',
  },
  {
    a: 2, b: 25, reasons: 3, card: 1,
    dur: 4.8,
    text: 'Behind the verdict sit the reasons: the cases weighed, the objections met, the times they changed their mind. The card is only the last line of it.',
    cite: 'What is behind it',
  },
  {
    a: 30, b: 31, reasons: 3, card: 2,
    dur: 4.4,
    text: 'The card hands across perfectly. Both people now hold the same true verdict, and the reasons behind the verdict stay where they were.',
    cite: 'Handed over',
  },
  {
    a: 44, b: 20, reasons: 3, card: 2,
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
    a: 13, b: 12, reasons: 3, card: 2, fresh: 1,
    dur: 4.6,
    text: 'Now a new case turns up — close to the first, but not the same. This is the moment the difference between the two of them stops being philosophical.',
    cite: 'A new case',
  },
  {
    a: 13, b: 12, reasons: 3, card: 2, fresh: 1, pick: 1,
    dur: 1.0,
    interact: {
      prompt: 'Tap whichever of them can actually answer the new case.',
      explain: 'The one with the reasons. A verdict tells you what to say about the case it came from; the reasons are the only part that travels. The borrower is holding a true answer to a question nobody asked.',
      xp: 5,
    },
  },
  {
    a: 35, b: 24, reasons: 3, card: 2, fresh: 1,
    dur: 1.0,
    interact: {
      prompt: 'So should you ever defer to someone else on a moral question?',
      cards: [
        { text: 'Yes, a signal to look', correct: true },
        { text: 'No, always work it alone', correct: false },
      ],
      explain: 'The trap is the other card: it flatters us and nobody lives that way. Testimony is excellent evidence that you have missed something. It is a poor replacement for going and seeing what you missed.',
      xp: 5,
    },
  },
  {
    summary: {
      title: 'A Verdict Is Not Understanding',
      points: [
        'Most of what you know is testimony, and that is fine',
        'Moral deference feels different, and the feeling tracks something',
        'A borrowed verdict does not travel to a new case',
        'Take it as a reason to look, not a reason to stop',
      ],
      closing: 'You can be handed the right answer and still not have what the answer was made of.',
    },
    dur: 3.0,
  },
];
