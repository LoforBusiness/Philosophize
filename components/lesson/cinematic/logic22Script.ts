import type { BaseBeat } from './cinematicKit';

// Cinematic logic-arguments-22, "All, Some, and None".
//
// THE PICTURE: a claim written over a field of cats. The claim says ALL of them
// are black, and the field is drawn to agree with it — until one cat goes hollow.
// The whole argument is that ONE hollow dot is enough, and the lesson ends with a
// field that is still 17/18 black and a claim that is dead.
//
// Q1 is answered on the field; Q2 is A/B/C/D, because telling contradictories from
// merely-compatible pairs is the part that needs reading (E34).

export interface Logic22Beat extends BaseBeat {
  /** Figure gesture (emote code). */ p?: number;
  /** Where the figure stands (stage x). */ x?: number;
  /** The claim card is up, 0..1. */ claim?: number;
  /** The field of cats is drawn, 0..1. */ field?: number;
  /** 1 = one cat has gone hollow — the counterexample. */ odd?: number;
  /** 1 = the claim has been struck through. */ dead?: number;
  /** 1 = the three answer cards are live (Q1). */ pick?: number;
}

export const BEATS: Logic22Beat[] = [
  {
    p: 25, x: 70,
    text: 'For two thousand years "all swans are white" was simply true. Then someone sailed to Australia and saw a black one, and that was the end of it.',
    dur: 4.4,
  },
  {
    p: 41, x: 168, claim: 1, field: 1,
    text: 'Aristotle boiled talk about groups down to four shapes: all, none, some, and some-not. Here is the first one, with the group it is about underneath.',
    cite: 'A universal claim',
    dur: 4.8,
  },
  {
    p: 13, x: 124, claim: 1, field: 1,
    text: 'A universal claim is a promise about every single member. The promise is worth a lot and breaks easily, because one exception breaks all of it.',
    cite: 'What "all" costs',
    dur: 4.6,
  },
  {
    p: 137, x: 124, claim: 1, field: 1,
    quote: {
      id: 'lq-logic-arguments-22-1',
      text: 'It is the mark of an educated mind to rest satisfied with the degree of precision which the nature of the subject admits.',
      author: 'Aristotle',
      work: 'Nicomachean Ethics',
      era: 'c. 350 BCE',
      branchSlugs: ['logic'],
    },
    dur: 3.8,
  },
  {
    p: 35, x: 168, claim: 1, field: 1, odd: 1, dead: 1,
    text: 'One cat is not black. That is all it takes — the claim is finished, and the other seventeen do not help it in the slightest.',
    cite: 'One is enough',
    dur: 4.4,
  },
  {
    p: 6, x: 124, claim: 1, field: 1, odd: 1, dead: 1,
    interact: {
      prompt: 'Tap the pair that cannot both be true at once.',
      explain: 'Contradictories: exactly one of them is true, always. "Some are" and "some are not" are perfectly happy together — a class where some passed and some failed makes both true.',
      xp: 5,
    },
    pick: 1,
    dur: 1.0,
  },
  {
    p: 4, x: 124, claim: 1, field: 1, odd: 1, dead: 1,
    interact: {
      prompt: 'Which single fact proves "All cats are black" false?',
      lever: {
        start: 2,
        stops: [
          { id: 'one', reads: 'one cat that is not black', correct: true },
          { id: 'many', reads: 'a good many cats that are not' },
          { id: 'all', reads: 'prove that no cat is black' },
        ],
      },
      explain: 'The trap is reaching for the sweeping opposite, "No cats are black" — a much stronger and separate claim. The contradictory of "all are" is only "some are not". One cat does it.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'All, Some, and None',
      points: [
        'Four forms: all, none, some, some-not',
        'Contradictories: exactly one of the pair is true',
        'One counterexample refutes any universal claim',
        '"Some" and "some not" can both hold at once',
      ],
      closing: 'The strongest claims are the easiest to kill. That is the trade you make by saying "all".',
    },
    dur: 3.0,
  },
];
