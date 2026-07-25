import type { BaseBeat } from './cinematicKit';

// Cinematic logic-arguments-7, "Two Moves That Always Work" — modus ponens and
// modus tollens, taught at a whiteboard. The figure WALKS to the board, taps up the
// rule, writes the fact, then steps back to let you read the whole thing. Q1 is
// answered on the board itself (tap the card that must follow); Q2 is A/B/C/D.
//
// Plain language throughout: the moves are named only AFTER you've already used
// them, so the Latin lands as a label for something you can already do.

export interface Logic7Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** Where the figure stands (stage x). 70 = downstage left, 168 = at the board. */ x?: number;
  /** The IF→THEN rule written up on the board, 0..1. */ rule?: number;
  /** The fact card: 0 none · 1 "IT IS RAINING" · 2 "STREETS ARE DRY". */ fact?: number;
  /** The conclusion card: 0 none · 1 "SO: STREETS ARE WET" · 2 "SO: NO RAIN". */ concl?: number;
  /** 1 = the three answer cards are live on the board (Q1). */ pick?: number;
}

export const BEATS: Logic7Beat[] = [
  {
    p: 25, x: 70,
    text: 'There are two moves that can never let you down. Learn them, and no one can slide a broken argument past you again.',
    dur: 3.8,
  },
  {
    p: 41, x: 168, rule: 1,
    text: 'Start with a rule you already believe. If it rains, the streets get wet. Nothing clever yet — just a promise: whenever the first thing happens, so does the second.',
    cite: 'The rule',
    dur: 5.0,
  },
  {
    p: 40, x: 168, rule: 1, fact: 1,
    text: 'Now add one fact. You glance outside: it is raining. Watch what that single fact unlocks.',
    cite: 'The fact',
    dur: 4.0,
  },
  {
    p: 13, x: 124, rule: 1, fact: 1, pick: 1,
    interact: {
      prompt: 'The rule holds, and it IS raining. Tap the card that must be true.',
      explain: 'The rule promised wet streets whenever it rains — so once the rain is real, the wet streets are guaranteed. You knew it without ever looking at the street.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 2, x: 124, rule: 1, fact: 1, concl: 1,
    text: 'That is the first move, and it has a name: modus ponens. Say the "if" part is true, and the "then" part comes free. You proved something about the street without looking at it.',
    cite: 'Move one · modus ponens',
    dur: 5.2,
  },
  {
    p: 40, x: 168, rule: 1, fact: 2,
    text: 'Same rule, new day. This time you do not check the sky at all — you check the street. Bone dry.',
    cite: 'Working backwards',
    dur: 4.2,
  },
  {
    p: 4, x: 124, rule: 1, fact: 2,
    mc: {
      prompt: 'The rule still holds and the streets are completely dry. What follows about the rain?',
      options: [
        { id: 'a', text: 'It did not rain — the rule guarantees that', correct: true },
        { id: 'b', text: 'It rained, just not very hard', correct: false },
        { id: 'c', text: 'The rule must be false', correct: false },
        { id: 'd', text: 'Nothing follows without checking the sky', correct: false },
      ],
      explain: 'The trap: it feels like you need to look at the sky. You do not. The rule promised that rain ALWAYS brings wet streets — so dry streets are proof the rain never came.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 35, x: 168, rule: 1, fact: 2, concl: 2,
    text: 'That is the second move: modus tollens. Knock out the "then" part, and the "if" part falls with it. You just read the sky by looking at the pavement.',
    cite: 'Move two · modus tollens',
    dur: 5.0,
  },
  {
    p: 44, x: 124, rule: 1,
    quote: {
      id: 'lq-logic-arguments-7-1',
      text: 'When you have eliminated the impossible, whatever remains, however improbable, must be the truth.',
      author: 'Arthur Conan Doyle',
      work: 'The Sign of the Four',
      era: '1890',
      branchSlugs: ['logic'],
    },
    dur: 3.6,
  },
  {
    summary: {
      title: 'Two Moves, No Escape',
      points: [
        'Affirm the "if" — the "then" must follow',
        'Deny the "then" — the "if" must fall',
        'Both give certainty, not a good guess',
        'Detectives run on the second one',
      ],
      closing: 'Two moves that never fail — and next, the two fakes that copy them.',
    },
    dur: 3.0,
  },
];
