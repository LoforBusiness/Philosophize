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
    p: 379, x: 70,
    text: 'For centuries, Europeans accepted the claim “all swans are white”. In 1697, Dutch sailors saw black swans in Western Australia, and the claim was refuted.',
    dur: 4.4,
  },
  {
    p: 399, x: 168, claim: 1, field: 1,
    text: 'Aristotle sorted claims about groups into four forms: all, none, some, and some-not. The universal claim “all cats are black” covers every cat in the group underneath.',
    cite: 'A universal claim',
    dur: 4.8,
  },
  {
    p: 383, x: 124, claim: 1, field: 1,
    text: 'A universal claim asserts something of every member of a group. Such a claim says a great deal, but one exception makes it false.',
    cite: 'What “all” commits you to',
    dur: 4.6,
  },
  {
    p: 137, x: 124, claim: 1, field: 1,
    quote: {
      id: 'lq-logic-arguments-22-1',
      text: 'It is the mark of an educated mind to rest satisfied with the degree of precision which the nature of the subject admits.',
      author: 'Aristotle',
      philosopherId: 'aristotle',
      work: 'Nicomachean Ethics',
      era: 'c. 350 BCE',
      branchSlugs: ['logic'],
    },
    dur: 3.8,
  },
  {
    p: 35, x: 168, claim: 1, field: 1, odd: 1, dead: 1,
    text: 'One cat isn’t black, so the claim “all cats are black” is false. The seventeen black cats can’t restore it.',
    cite: 'One is enough',
    dur: 4.4,
  },
  {
    p: 6, x: 124, claim: 1, field: 1, odd: 1, dead: 1,
    interact: {
      prompt: 'In which pair must exactly one of the two claims be true?',
      explain: 'All black and some not black. These two are contradictories: in every case one is true and the other false. Some black and some not black are both true of a mixed group. All black and none black can both be false, but never both true.',
      xp: 5,
    },
    pick: 1,
    dur: 1.0,
  },
  {
    p: 4, x: 124, claim: 1, field: 1, odd: 1, dead: 1,
    interact: {
      prompt: 'What is needed to refute “all cats are black”?',
      sort: {
        chip: '“all cats are black”',
        bins: [
          { id: 'one', label: 'one exception', reads: 'one cat that isn’t black', correct: true },
          { id: 'many', label: 'many exceptions', reads: 'a large number of cats that aren’t black' },
          { id: 'all', label: 'the opposite claim', reads: 'proof that no cat is black' },
        ],
      },
      explain: 'One exception. The contradictory of “all cats are black” is “some cat isn’t black”, and one cat makes that true. Proof that no cat is black would also refute it, but that’s a far stronger claim than refutation needs.',
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
        '“Some” and “some not” can both be true at once',
      ],
      closing: 'The more a claim asserts, the more ways it can be refuted. A universal claim can be falsified by a single counterexample.',
    },
    dur: 3.0,
  },
];
