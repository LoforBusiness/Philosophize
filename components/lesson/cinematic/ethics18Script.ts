import type { BaseBeat } from './cinematicKit';

// Cinematic ethics-ethics-18, "Do Animals Count?"
//
// THE PICTURE: a boundary line with the things ethics protects on one side of it,
// and a test written underneath saying what the line is FOR. Over the lesson the
// test changes from "can it reason?" to "can it suffer?" — and the line moves on
// its own, because the line was never the argument. The test was.
//
// Q1 is answered at the line; Q2 is A/B/C/D, because Singer's criterion needs its
// rivals laid out beside it (E34).

export interface Ethics18Beat extends BaseBeat {
  /** Figure gesture (emote code). */ p?: number;
  /** Where the figure stands (stage x). */ x?: number;
  /** The two groups and the boundary are drawn, 0..1. */ line?: number;
  /** Which test is written under the line: 0 none · 1 reason · 2 suffer. */ test?: number;
  /** 0 = the line sits between the groups · 1 = it has moved past the animals. */ wide?: number;
  /** 1 = the three answer cards are live (Q1). */ pick?: number;
}

export const BEATS: Ethics18Beat[] = [
  {
    p: 25, x: 70,
    text: 'A pig can feel fear and pain, and it would rather avoid both. Does that give the pig moral standing, a claim to moral consideration?',
    dur: 4.6,
  },
  {
    p: 41, x: 168, line: 1, test: 1,
    text: 'Philosophers from Aristotle to Kant tied moral standing to the capacity to reason. Kant held that only rational beings are ends in themselves.',
    cite: 'The rationality test',
    dur: 2.4,
  },
  {
    p: 41, x: 168, line: 1, test: 1,
    text: 'Animals can’t argue, make promises or bear duties. So, on this view, they count only as things.',
    dur: 2.6,
  },
  {
    p: 13, x: 124, line: 1, test: 1,
    text: 'However, the rationality test also excludes some human beings. Infants can’t reason.',
    cite: 'A counterexample',
    dur: 1.8,
  },
  {
    p: 266, x: 124, line: 1, test: 1,
    text: 'Nor can some people with severe mental disabilities. Yet they still count morally, so reason can’t be the test.',
    dur: 3.4,
  },
  {
    p: 139, x: 124, line: 1, test: 1,
    quote: {
      id: 'lq-ethics-ethics-18-1',
      text: 'The question is not, Can they reason? nor, Can they talk? but, Can they suffer?',
      author: 'Jeremy Bentham',
      philosopherId: 'jeremy-bentham',
      work: 'An Introduction to the Principles of Morals and Legislation',
      era: '1789',
      branchSlugs: ['ethics'],
    },
    dur: 3.8,
  },
  {
    p: 383, x: 168, line: 1, test: 2, wide: 1,
    text: 'Replace reason with Bentham’s criterion: sentience, the capacity to suffer. The boundary of moral concern then includes the pig.',
    cite: 'The capacity to suffer',
    dur: 4.6,
  },
  {
    p: 6, x: 124, line: 1, test: 2, wide: 1, pick: 1,
    interact: {
      prompt: 'What is the name for discounting a being’s suffering because of its species?',
      explain: 'Speciesism. Richard Ryder coined the term in 1970, by analogy with racism. It means giving less weight to equal suffering because of the species that suffers.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 165, x: 124, line: 1, test: 2, wide: 1,
    interact: {
      prompt: 'On Bentham’s view, what decides whether a being has moral standing?',
      sort: {
        chip: 'moral standing',
        bins: [
          { id: 'reason', label: 'can it reason', reads: 'whether it can reason' },
          { id: 'speak', label: 'can it talk', reads: 'whether it can use language' },
          { id: 'suffer', label: 'can it suffer', reads: 'whether it can suffer', correct: true },
        ],
      },
      explain: 'Can it suffer. Bentham argues that suffering, not reason or speech, is what matters morally. Reason has no bearing on whether a being can be harmed, and infants lack it yet still count.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'The Moral Standing of Animals',
      points: [
        'For Bentham, sentience, not species, grounds moral concern',
        'Discounting a being for its species is speciesism',
        'Bentham asked only whether they can suffer',
        'Tom Regan argues that animals have rights, not only interests',
      ],
      closing: 'The debate turns less on where to draw the boundary than on which criterion should draw it.',
    },
    dur: 3.0,
  },
];
