import type { BaseBeat } from './cinematicKit';

// Cinematic ethics-ethics-12, "Kant's One Rule For All Rules" — the categorical
// imperative, taught at a copying press.
//
// THE PICTURE: one card reading "I PROMISE", and a press that stamps copies of it.
// Kant's test is "what if everyone did this?", so the lesson simply RUNS it — the
// board fills with identical cards, and as they multiply the word PROMISE goes pale
// on every one of them until nothing is left to read. Universalised, the maxim eats
// the practice it depends on. The change in the picture IS the argument.
//
// Q1 is A/B/C/D in the deck (telling Kant's test apart from outcome-counting, which
// needs the options read side by side — E34); Q2 is answered on the stage, by tapping
// the one maxim of three that survives being made a law (H65).

export interface Ethics12Beat extends BaseBeat {
  /** Figure gesture (emote code). 26 is the one that STRIKES the press handle. */ p?: number;
  /** Where the figure stands (stage x). 56 = downstage left, 124 = at the press. */ x?: number;
  /** How many maxim cards are on the board: 1 the original · 3 · 12 the full field. */ n?: number;
  /** How much of the word PROMISE has gone from every card. 0 legible … 1 blank. */ word?: number;
  /** 1 = the three candidate maxims replace the field, for Q2. */ pick?: number;
}

export const BEATS: Ethics12Beat[] = [
  {
    p: 25, x: 56, n: 1, word: 0,
    text: 'Before you act, ask one question — what if everyone did this? Kant thought that single test could sort right from wrong, with no arithmetic at all.',
    dur: 3.8,
  },
  {
    p: 418, x: 124, n: 1, word: 0,
    text: 'You need money, so you say “I promise to repay” — knowing perfectly well that you cannot. That private reason for acting is what Kant calls your maxim.',
    cite: 'The maxim',
    dur: 4.8,
  },
  {
    p: 26, x: 124, n: 3, word: 0.55,
    text: 'Kant never asks what the act costs you. He asks whether your rule could be a law that everyone follows.',
    cite: 'The test',
    dur: 3.1,
  },
  {
    p: 26, x: 124, n: 3, word: 0.55,
    text: 'So hand the rule to the whole world and run it.',
    dur: 1.8,
  },
  {
    p: 141, x: 124, n: 3, word: 0.55,
    quote: {
      id: 'lq-ethics-ethics-12-1',
      text: 'Act only according to that maxim whereby you can at the same time will that it should become a universal law.',
      author: 'Immanuel Kant',
      work: 'Groundwork of the Metaphysics of Morals',
      era: '1785',
      philosopherId: 'immanuel-kant',
      branchSlugs: ['ethics'],
    },
    dur: 3.6,
  },
  {
    p: 159, x: 124, n: 12, word: 1,
    text: 'Now everyone breaks a promise the moment it suits them. Nobody believes one any more, so the word goes blank on every card.',
    cite: 'What the law does',
    dur: 4,
  },
  {
    p: 159, x: 124, n: 12, word: 1,
    text: 'There is no promising left to break.',
    dur: 1.8,
  },
  {
    p: 4, x: 124, n: 12, word: 1,
    interact: {
      prompt: 'Set the lever to the one that is really just counting outcomes.',
      lever: {
        start: 0,
        stops: [
          { id: 'means', reads: 'never use another person merely as a means' },
          { id: 'law', reads: 'act only on a rule everyone could follow' },
          { id: 'happy', reads: 'break it when more people end up happy', correct: true },
        ],
      },
      explain: 'The far setting, and it sounds like plain decency, which is what hides it. That is Mill counting, not Kant testing. Kant never adds the happiness up. He asks one thing: does the rule survive being handed to everybody at once?',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 30, x: 124, n: 12, word: 1, pick: 1,
    interact: {
      prompt: 'Three maxims go into the press. Tap the one that survives being made a law everyone follows.',
      explain: 'The trap: each loser sounds like a small private exception. Universalised, they cancel themselves — if everyone lied when it suited them, nobody would believe anything, so there would be nothing left to gain. Only keeping promises still works when everyone does it.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 47, x: 124, n: 12, word: 1, pick: 1,
    summary: {
      title: 'One Rule For All Rules',
      points: [
        'Your maxim is your private reason for acting',
        'Test it as a law everyone must follow',
        'A maxim that self-destructs universalised is forbidden',
        'Kant judges the rule, never the outcome',
      ],
      closing: 'Kant gives the test a second form as well: never use a person merely as a means.',
    },
    dur: 3.0,
  },
];
