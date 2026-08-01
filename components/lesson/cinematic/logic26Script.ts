import type { BaseBeat } from './cinematicKit';

// Cinematic logic-arguments-26, "Proof by Contradiction".
//
// THE PICTURE: a chain of four links running down from an assumption to an
// absurdity. Over the lesson the chain is built one link at a time, the bottom link
// turns out to be impossible — and then the break appears at the TOP, on the
// assumption, not anywhere in the middle. Where the chain snaps is the lesson.
//
// Q1 is A/B/C/D (reaching a contradiction FEELS like failure, and the options are
// where that gets untangled); Q2 is answered on the chain (E34, H65).

export interface Logic26Beat extends BaseBeat {
  /** Figure gesture (emote code). */ p?: number;
  /** Where the figure stands (stage x). */ x?: number;
  /** How many links of the chain are drawn: 0…4. */ links?: number;
  /** 1 = the assumption has been marked false — the break, at the top. */ snap?: number;
  /** 1 = the three answer cards are live (Q2). */ pick?: number;
}

export const BEATS: Logic26Beat[] = [
  {
    p: 25, x: 70,
    text: 'Here is a strange way to prove something is true: begin by assuming it is false, and then be as reasonable as you possibly can.',
    dur: 4.2,
  },
  {
    p: 41, x: 168, links: 1,
    text: 'Suppose there is a largest number. Call it N. Nothing wrong with supposing it — that is the whole move, and you are allowed to suppose anything at all.',
    cite: 'The assumption',
    dur: 4.8,
  },
  {
    p: 40, x: 168, links: 3,
    text: 'Now just follow it. N plus one is a number, and it is bigger than N. So N is not the largest after all — and that is flatly at odds with what we assumed.',
    cite: 'Follow it honestly',
    dur: 5.0,
  },
  {
    p: 44, x: 124, links: 3,
    quote: {
      id: 'lq-logic-arguments-26-1',
      text: 'Reductio ad absurdum, which Euclid loved so much, is one of a mathematician\'s finest weapons.',
      author: 'G. H. Hardy',
      work: 'A Mathematician\'s Apology',
      era: '1940',
      branchSlugs: ['logic'],
    },
    dur: 3.6,
  },
  {
    p: 35, x: 168, links: 4, snap: 1,
    text: 'Something in that chain has to give. Every step after the first was valid, so the break lands where it started — the assumption was false, and there is no largest number.',
    cite: 'Where it breaks',
    dur: 5.0,
  },
  {
    p: 4, x: 124, links: 4, snap: 1,
    mc: {
      prompt: 'In a reductio, you reach a contradiction from your assumption. What follows?',
      options: [
        { id: 'a', text: 'The assumption was false, so its opposite is true', correct: true },
        { id: 'b', text: 'The whole argument is broken and proves nothing', correct: false },
        { id: 'c', text: 'Both the assumption and its opposite are false', correct: false },
        { id: 'd', text: 'You must restart with a different assumption', correct: false },
      ],
      explain: 'The trap: a contradiction feels like the argument collapsing. It is the goal. If valid steps ran from your assumption to absurdity, the assumption is the only thing left to blame.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 6, x: 124, links: 4, snap: 1, pick: 1,
    interact: {
      prompt: 'The chain ends in an absurdity. Tap what it breaks.',
      explain: 'Not the logic and not a middle step — every one of those was a valid move you would make again. The only thing that was ever optional is the thing you assumed at the top.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Proof by Contradiction',
      points: [
        'Assume the opposite of what you want to prove',
        'Reason validly until it yields a contradiction',
        'The contradiction kills the assumption, not the logic',
        'Therefore the original claim must be true',
      ],
      closing: 'The only move you did not have to make was the first one. That is why it is the one that breaks.',
    },
    dur: 3.0,
  },
];
