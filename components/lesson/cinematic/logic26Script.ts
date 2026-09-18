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
  /** 1 = the four link slots are traced empty, before the chain is written. */ preview?: number;
  /** 1 = a tag beside the assumption reads "not asserted" — supposing isn't claiming. */ supposed?: number;
  /** 1 = a ring marks the assumption, the thing this new step is said to contradict. */ implicate?: number;
  /** 1 = a plate beneath the chain states what the proof has established. */ qed?: number;
  /** 1 = the three answer cards are live (Q2). */ pick?: number;
}

export const BEATS: Logic26Beat[] = [
  {
    p: 164, x: 70,
    text: 'Proof by contradiction, or reductio ad absurdum, proves a claim indirectly. Begin by assuming it is false.',
    dur: 2.8,
  },
  {
    p: 164, x: 70, preview: 1,
    text: 'Then reason validly, one careful step at a time, from that assumption until a contradiction appears.',
    dur: 1.8,
  },
  {
    p: 270, x: 168, links: 1,
    text: 'Suppose there’s a largest whole number. Call it N.',
    cite: 'The assumption',
    dur: 1.8,
  },
  {
    p: 270, x: 168, links: 1, supposed: 1,
    text: 'Supposing a claim doesn’t assert it. Any claim may be assumed for the sake of argument.',
    dur: 3.3,
  },
  {
    p: 40, x: 168, links: 3,
    text: 'N plus one is also a whole number, and it’s larger than N.',
    cite: 'The next step',
    dur: 2.3,
  },
  {
    p: 409, x: 168, links: 3, implicate: 1,
    text: 'So N is not the largest after all, which contradicts the original assumption.',
    dur: 2.7,
  },
  {
    p: 147, x: 124, links: 3,
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
    p: 459, x: 168, links: 4, snap: 1,
    text: 'Valid steps can’t lead from true premises to a contradiction. Every later step was valid and used only true facts, so the assumption must be false.',
    cite: 'Where the fault lies',
    dur: 3.5,
  },
  {
    p: 459, x: 168, links: 4, snap: 1, qed: 1,
    text: 'So the assumption is false, and there’s no largest whole number.',
    dur: 1.8,
  },
  {
    p: 165, x: 124, links: 4, snap: 1,
    interact: {
      prompt: 'Valid steps from one starting assumption reach a clear contradiction. What exactly has been shown?',
      sort: {
        chip: 'a contradiction',
        bins: [
          { id: 'nothing', label: 'nothing', reads: 'nothing, since the argument failed' },
          { id: 'step', label: 'a faulty step', reads: 'one of the intermediate steps was invalid' },
          { id: 'assume', label: 'a false assumption', reads: 'the assumption you started from is false', correct: true },
        ],
      },
      explain: 'A false assumption. In a proof by contradiction, reaching a contradiction is the aim of the method. If every step was valid, only the assumption can be false. So the argument has established something rather than nothing.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 383, x: 124, links: 4, snap: 1, pick: 1,
    interact: {
      prompt: 'When valid steps end in a contradiction, which part must be rejected?',
      explain: 'The assumption. The middle steps were valid, and the rules of logic are what make a step valid. The assumption is the only premise that was never established, so it’s the one rejected.',
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
        'The contradiction refutes the assumption, not the logic',
        'Therefore the original claim must be true',
      ],
      closing: 'Every later step was valid, so all the blame lands on that first assumption.',
    },
    dur: 3.0,
  },
];
