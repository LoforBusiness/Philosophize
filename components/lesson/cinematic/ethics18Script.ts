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
    text: 'A pig can be frightened, and can be hurt, and would rather not be. The question is whether any of that puts it inside ethics or leaves it outside.',
    dur: 4.6,
  },
  {
    p: 41, x: 168, line: 1, test: 1,
    text: 'For most of history the line ran here. The reason given was reason itself. They cannot argue, cannot promise, cannot be held to anything — so they were furniture.',
    cite: 'Where the line ran',
    dur: 5.0,
  },
  {
    p: 13, x: 124, line: 1, test: 1,
    text: 'But look at what that test actually catches. Infants cannot reason. Nor can someone deeply cognitively impaired. Nobody thinks they are outside — so the test is not the one we use.',
    cite: 'The test misfires',
    dur: 5.2,
  },
  {
    p: 139, x: 124, line: 1, test: 1,
    quote: {
      id: 'lq-ethics-ethics-18-1',
      text: 'The question is not, Can they reason? nor, Can they talk? but, Can they suffer?',
      author: 'Jeremy Bentham',
      work: 'An Introduction to the Principles of Morals and Legislation',
      era: '1789',
      branchSlugs: ['ethics'],
    },
    dur: 3.8,
  },
  {
    p: 35, x: 168, line: 1, test: 2, wide: 1,
    text: 'Change the test to the one we actually use, and nobody has to argue about where the line goes. It moves by itself, and it takes the pig with it.',
    cite: 'The line follows',
    dur: 4.6,
  },
  {
    p: 6, x: 124, line: 1, test: 2, wide: 1, pick: 1,
    interact: {
      prompt: 'Excluding a being just for the group it belongs to has a name. Tap the right label.',
      explain: 'Speciesism, by analogy with racism and sexism: giving less weight to identical suffering because of the body it happens in. Naming it is the point — an unnamed bias just feels like common sense.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 4, x: 124, line: 1, test: 2, wide: 1,
    interact: {
      prompt: 'Set the lever to the test Singer says decides it.',
      lever: {
        start: 0,
        stops: [
          { id: 'reason', reads: 'whether it can reason' },
          { id: 'speak', reads: 'whether it can talk to us' },
          { id: 'suffer', reads: 'whether it can suffer', correct: true },
        ],
      },
      explain: 'The far setting, and Bentham got there first. The first is the old test and it does not even follow: reasoning has nothing to do with being hurt. Infants cannot reason either, and nobody proposes leaving them out.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'The Circle Widens Again',
      points: [
        'Sentience, not species, grounds moral concern',
        'Discounting a being for its species is speciesism',
        'Bentham asked only whether they can suffer',
        'Regan grants animals rights, not mere interests',
      ],
      closing: 'Arguing about where the line goes is the slow way. Ask what the line is for and it moves itself.',
    },
    dur: 3.0,
  },
];
