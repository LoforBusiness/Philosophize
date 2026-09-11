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
    text: 'A vote can count millions of opinions and weigh not one of them.',
    dur: 4.4,
  },
  {
    p: 174, x: 28, decision: 1, box: 1,
    text: 'One picture of democracy is a machine that adds up whatever people already want.',
    dur: 4.8,
  },
  {
    p: 438, x: 28, decision: 1, box: 1, table: 1,
    text: 'Jürgen Habermas put the legitimacy earlier, in the reasons citizens give each other.',
    dur: 5.0,
  },
  {
    p: 265, x: 28, decision: 1, box: 1, table: 1,
    text: 'A decision binds you justly when it could be defended to everyone it lands on.',
    dur: 4.8,
  },
  {
    p: 260, x: 28, decision: 1, box: 1, table: 1, plates: 1, live: 1,
    interact: {
      prompt: 'Tap what a snap referendum leaves out.',
      explain: 'The testing. A tally collects opinions and asks nobody to defend one, so nothing in it can have changed anyone’s mind. Reading it as a case against voting, or for rule by experts, gets it backwards. The whole idea is that citizens do the reasoning.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 450, x: 88, decision: 1, box: 1, table: 1, feeds: 1,
    text: 'A citizens’ assembly hears experts for weeks and questions itself. Many arrive fixed and leave moved.',
    dur: 5.0,
  },
  {
    p: 425, x: 88, decision: 1, box: 1, table: 1, feeds: 1,
    quote: {
      id: 'lq-political-political-26-1',
      text: 'No force except that of the better argument is exercised; and that, as a result, all motives except that of the cooperative search for truth are excluded.',
      author: 'Jürgen Habermas',
      work: 'Knowledge and Human Interests',
      era: '1971',
      branchSlugs: ['political-philosophy'],
    },
    dur: 5.0,
  },
  {
    p: 381, x: 88, decision: 1, box: 1, table: 1, feeds: 1,
    text: 'Critics answer that talk favours the articulate, where one vote each treats people as equals.',
    dur: 5.0,
  },
  {
    p: 264, x: 88, decision: 1, box: 1, table: 1, feeds: 1,
    interact: {
      prompt: 'Divide the decision between counting and reasoning.',
      split: {
        left: 'THE COUNTING',
        right: 'THE REASONING',
        start: 0.95,
        zones: [
          { id: 'tally', upto: 0.3, reads: 'the tally is the whole of the decision' },
          { id: 'both', upto: 0.7, reads: 'reasons first, and then a count that binds', correct: true },
          { id: 'talk', upto: 1, reads: 'the reasons decide, and the vote is a formality' },
        ],
      },
      explain: 'Both, in that order. A pure tally tests nothing, and pure talk hands the result to whoever argues best. Habermas wanted the argument to shape the options and the vote to settle them.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 320, x: 88, decision: 1, box: 1, table: 1, feeds: 1,
    summary: {
      title: 'Counting or Reasoning',
      points: [
        'Aggregation adds up preferences it never questions',
        'Deliberation tests those preferences in public',
        'A just decision is one defensible to everyone it binds',
        'The ideal is that only the better argument carries',
      ],
      closing: 'Before the next big vote, ask one thing. Did people reason with each other, or did the count just add up what they already felt?',
    },
    dur: 5.0,
  },
];
