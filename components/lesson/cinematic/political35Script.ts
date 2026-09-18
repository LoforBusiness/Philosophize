import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic political-political-35, "The Empty Chairs"
// Theme: A ROOM WHERE MOST OF THE SEATS ARE EMPTY AND ALWAYS WILL BE.
//
// Twelve chairs in a row. Three are taken. The other nine belong to people who
// do not exist yet, and the lesson never lets the reader forget the ratio — the
// empty chairs are drawn from the first beat and never leave.
//
// The non-identity problem is played, not described: on beat 5 the policy
// switches and the three occupied chairs move to DIFFERENT seats, because a
// different policy means different people. The reader sees the victim they were
// about to name stop existing.
//
// GAMIFIED SHAPE, and neither ask is a pick-one-of-two:
//   · beat 2  a DRAG — how much does a vote count when its owner is not born?
//     The readout runs from "nothing" to "the same as yours", and the chairs
//     fill in as the reader slides, so the abstraction has a picture.
//   · beat 6  a SCENE TARGET — after the swap, tap the person who was made worse
//     off. Every chair is tappable and none of them is right, which is the only
//     honest way to teach this and the whole reason it is a tap.
// ─────────────────────────────────────────────────────────────────────────────

export interface Political35Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** 1 = the row of chairs is drawn. */ chairs?: number;
  /** How much weight the unborn are given, 0…1 — how filled the empty seats look. */ weight?: number;
  /** 1 = the reader's thumb drives the weight. */ live_w?: number;
  /** 1 = the policy has switched, so a different three are seated. */ swap?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
  /** 1 = a dashed ring appears around every chair that is still empty — the nine not yet born. */ note?: number;
  /** 1 = a single line is drawn under the row, standing for the one course lives are on. */ path?: number;
  /** 1 = that line forks in two beneath the row, standing for how a different policy sends lives a different way. */ fork?: number;
  /** 1 = a dashed ring appears around the chairs that are currently taken — the particular people the claim names. */ claim?: number;
}

export const BEATS: Political35Beat[] = [
  {
    p: 462, x: 52, chairs: 1,
    text: 'Suppose three living people must choose a policy whose effects will last for centuries.',
    dur: 2.1,
  },
  {
    p: 462, x: 52, chairs: 1, note: 1,
    text: 'Nine of the chairs belong to people who are not born yet. They’ll bear its effects without voting.',
    dur: 2.1,
  },
  {
    p: 461, x: 52, chairs: 1, live_w: 1, live: 1,
    interact: {
      prompt: 'How much weight should the interests of future people carry in this decision?',
      drag: {
        lo: 'NO SAY AT ALL',
        hi: 'A FULL VOTE EACH',
        start: 0.1,
        zones: [
          { id: 'none', upto: 0.22, reads: 'none, since they don’t exist yet' },
          { id: 'some', upto: 0.7, reads: 'real weight, yet no veto', correct: true },
          { id: 'full', upto: 1, reads: 'full votes, outnumbering the living for ever' },
        ],
      },
      explain: 'Real weight, yet no veto. Full votes for all future people would outvote the living for ever. No weight at all would permit any harm to them, however severe.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 168, x: 52, chairs: 1, weight: 0.5,
    text: 'So far this is an ordinary problem of weighing interests. Derek Parfit named a deeper difficulty the non-identity problem.',
    dur: 3.0,
  },
  {
    p: 2, x: 52, chairs: 1, weight: 0.5, path: 1,
    text: 'A different policy changes how people live: where they work, whom they meet, and when to have children.',
    dur: 4.1,
  },
  {
    p: 266, x: 52, chairs: 1, weight: 0.5, fork: 1,
    text: 'Different children are therefore conceived. Which people exist in the future depends on the policy chosen.',
    dur: 1.8,
  },
  {
    p: 467, x: 52, chairs: 1, weight: 0.5, swap: 1,
    text: 'Under the reckless policy, a different set of future people is born.',
    dur: 2.2,
  },
  {
    p: 467, x: 52, chairs: 1, weight: 0.5, swap: 1, claim: 1,
    text: 'Had the careful policy been chosen instead, none of these particular people would ever have existed.',
    dur: 2.2,
  },
  {
    p: 160, x: 52, chairs: 1, weight: 0.5, swap: 1, live: 1,
    interact: {
      prompt: 'If the reckless policy makes the future worse, who is made worse off by it?',
      explain: 'No one. Everyone in the worse future exists only because of the reckless choice. Provided their lives are worth living, none of them is worse off for it. The policy seems wrong, yet it harms no particular person.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 386, x: 126, chairs: 1, weight: 0.5, swap: 1,
    quote: {
      id: 'lq-political-political-35-1',
      text: '…it becomes a partnership not only between those who are living, but between those who are living, those who are dead, and those who are to be born.',
      author: 'Edmund Burke',
      philosopherId: 'edmund-burke',
      work: 'Reflections on the Revolution in France',
      era: '1790',
      branchSlugs: ['political-philosophy'],
    },
    dur: 3.6,
  },
  {
    p: 383, x: 126, chairs: 1, weight: 0.8, swap: 1,
    text: 'Parfit replies that an outcome can be worse without being worse for anyone. That gives reason to avoid it.',
    cite: 'Parfit, Reasons and Persons, 1984',
    dur: 4.6,
  },
  {
    summary: {
      title: 'The Non-Identity Problem',
      points: [
        'Most people a policy affects are not yet born',
        'Change the policy and you change who is born',
        'So no future person is made worse off',
        'Parfit: an outcome can be worse without a victim',
      ],
      closing: 'The non-identity problem challenges any account of wrongdoing that requires a victim.',
    },
    dur: 3.2,
  },
];
