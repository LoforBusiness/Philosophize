import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic political-political-26, "Democracy As Conversation"
// Theme: ONE DECISION FED BY A BALLOT BOX AND A TABLE, AND A STAMP ON TOP.
//
// Legitimacy is the thing being argued about, so the scene gives it a body: a
// stamp on the decision that is either filled or hollow. Two feeds run up into
// it, one from the counting and one from the talking, and the reader's seam sets
// how thick each feed is.
//
// The stamp fills from the RIGHT feed only. That is the claim rather than a
// flourish — Habermas is not saying votes do not matter, he is saying a tally
// nobody had to justify is not where the binding force comes from.
//
// GAMIFIED SHAPE:
//   · beat 4  SCENE TARGETS — three plates, and the reader taps what a snap
//     referendum leaves out. On the stage because the table is already drawn
//     beside the ballot box with nothing running out of it.
//   · beat 8  a SPLIT — the decision divided between counting and reasoning. The
//     two feeds thicken and thin, and the stamp fills as the reasoning grows.
// ─────────────────────────────────────────────────────────────────────────────

export interface Political26Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** 1 = the decision and its stamp are drawn. */ decision?: number;
  /** 1 = the ballot box is drawn. */ box?: number;
  /** 1 = the table is drawn beside it. */ table?: number;
  /** 1 = the feeds run from both sources up into the decision. */ feeds?: number;
  /** 1 = the three plates the reader chooses between are up. */ plates?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
}

export const BEATS: Political26Beat[] = [
  {
    p: 427, x: 28, decision: 1, box: 1,
    text: 'A vote can count millions of opinions without testing their reasons.',
    dur: 4.4,
  },
  {
    p: 174, x: 28, decision: 1, box: 1,
    text: 'The aggregative model treats democracy as a procedure for adding up the preferences people already have.',
    dur: 4.8,
  },
  {
    p: 438, x: 28, decision: 1, box: 1, table: 1,
    text: 'Jürgen Habermas built a model of deliberation: legitimacy comes from the reasons citizens exchange before they decide.',
    dur: 5.0,
  },
  {
    p: 265, x: 28, decision: 1, box: 1, table: 1,
    text: 'On Habermas’s view, a law is legitimate only if everyone it affects could agree to it in rational discussion.',
    dur: 4.8,
  },
  {
    p: 260, x: 28, decision: 1, box: 1, table: 1, plates: 1, live: 1,
    interact: {
      prompt: 'On the deliberative view, what is wrong with a snap referendum?',
      explain: 'It tests nothing. Deliberative democrats accept voting and reject expert rule, but object a snap vote tests no reasons.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 450, x: 88, decision: 1, box: 1, table: 1, feeds: 1,
    text: 'In a citizens’ assembly, citizens chosen by lot hear experts and discuss an issue for weeks. Many change their minds.',
    dur: 5.0,
  },
  {
    p: 425, x: 88, decision: 1, box: 1, table: 1, feeds: 1,
    quote: {
      id: 'lq-political-political-26-1',
      text: '…excludes all force … except the force of the better argument, and … all motives except that of a cooperative search for the truth.',
      author: 'Jürgen Habermas',
      work: 'The Theory of Communicative Action, vol. 1',
      era: '1981',
      branchSlugs: ['political-philosophy'],
    },
    dur: 5.0,
  },
  {
    p: 381, x: 88, decision: 1, box: 1, table: 1, feeds: 1,
    text: 'Iris Marion Young objected that deliberation favours those who argue in a calm, formal style. By contrast, a vote gives each person the same weight.',
    dur: 5.0,
  },
  {
    p: 264, x: 88, decision: 1, box: 1, table: 1, feeds: 1,
    interact: {
      prompt: 'On Habermas’s view, how should a legitimate decision divide between counting and reasoning?',
      split: {
        left: 'THE COUNTING',
        right: 'THE REASONING',
        start: 0.95,
        zones: [
          { id: 'tally', upto: 0.3, reads: 'the vote count alone decides' },
          { id: 'both', upto: 0.7, reads: 'public reasoning first, then a binding vote', correct: true },
          { id: 'talk', upto: 1, reads: 'reasoning decides, and the vote is a formality' },
        ],
      },
      explain: 'Public reasoning first, then a binding vote. A count alone tests no reasons. Talk alone rarely ends in full agreement, so a vote must still settle the matter. For Habermas, debate shapes the options, and a majority vote then decides.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 320, x: 88, decision: 1, box: 1, table: 1, feeds: 1,
    summary: {
      title: 'Aggregation and Deliberation',
      points: [
        'Aggregation adds up preferences it never questions',
        'Deliberation tests those preferences in public',
        'A legitimate decision is justifiable to everyone it binds',
        'Ideally, only the force of the better argument counts',
      ],
      closing: 'The deliberative test of a vote is whether citizens first exchanged and tested their reasons.',
    },
    dur: 5.0,
  },
];
