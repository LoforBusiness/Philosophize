import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic epistemology-knowledge-24, "Here Is One Hand"
// Theme: A LADDER OF PREMISES, AND A PLAIN CLAIM SURER THAN ANY RUNG OF IT.
//
// Moore's move is not a refutation and pretending otherwise is how the lesson
// usually goes wrong. He grants the sceptic's argument is valid. He simply
// observes that an argument runs BOTH ways: if the conclusion is less credible
// than its own premises, you have a proof; if it is more incredible, you have a
// reductio of one of the premises.
//
// So the scene draws credibility as length. Three rungs with bars, a conclusion
// at the top, and one plain claim off to the side whose bar is longer than any
// of them. Nothing is refuted; the ladder is simply outweighed.
//
// GAMIFIED SHAPE:
//   · beat 3  SCENE TARGETS — four claims with their bars drawn, tap the one you
//     are surest of. The answer is visible and that is deliberate: the reader is
//     not being tested, they are being made to notice their own ranking.
//   · beat 7  a LEVER — a valid argument with a false conclusion, and three
//     things you could do about it. Only one is available, and finding out which
//     is the logic half of the lesson.
// ─────────────────────────────────────────────────────────────────────────────

export interface Epi24Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** The conclusion plate and the three rungs, 0…1. */ ladder?: number;
  /** The how-sure bars beside each rung, 0…1. */ sure?: number;
  /** Moore's plain claim, off to the side, 0…1. */ hand?: number;
  /** The rung that has to give way, marked, 0…1. */ give?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
}

export const BEATS: Epi24Beat[] = [
  {
    p: 25, x: 200, ladder: 1,
    text: 'A sceptical argument, set out properly. Three premises and a conclusion, and the step from one to the next is fine.',
    dur: 4.8,
  },
  {
    p: 2, x: 200, ladder: 1, sure: 1,
    text: 'Beside each one, how sure you actually are of it. Not how clever it sounds. How sure.',
    cite: 'Measured, not argued',
    dur: 4.2,
  },
  {
    p: 45, x: 132, ladder: 1, sure: 1, hand: 1,
    text: 'Moore holds up his hand and says he knows this. That claim has a longer bar than anything on the ladder.',
    dur: 4.6,
  },
  {
    p: 4, x: 132, ladder: 1, sure: 1, hand: 1, live: 1,
    interact: {
      prompt: 'Tap the rung or the hand you are surest of.',
      explain: 'The hand, and almost nobody hesitates. That is the observation Moore is making. He is not saying the sceptic argued badly, he is pointing out which end of the argument you were more confident about before it started.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 137, x: 132, ladder: 1, sure: 1, hand: 1,
    quote: {
      id: 'lq-epistemology-knowledge-24-2',
      text: 'I can know things which I cannot prove; and among things which I certainly did know, even if I could not prove them, were the premisses of my proof.',
      author: 'G.E. Moore',
      work: 'Proof of an External World',
      era: '1939',
      branchSlugs: ['epistemology'],
    },
    dur: 4.2,
  },
  {
    p: 21, x: 268, ladder: 1, sure: 1, hand: 1, give: 1,
    text: 'An argument runs both ways. Doubt the conclusion harder than the premises, and it is the premises that have to move.',
    cite: 'The Moorean shift',
    dur: 4.8,
  },
  {
    p: 13, x: 268, ladder: 1, sure: 1, hand: 1, give: 1,
    text: 'The sceptic can answer that. He says the bar beside the hand is confidence, not knowledge, and that is exactly what is at issue.',
    dur: 4.8,
  },
  {
    p: 41, x: 268, ladder: 1, sure: 1, hand: 1, give: 1,
    interact: {
      prompt: 'The steps are valid and the conclusion is false. What follows?',
      lever: {
        start: 2,
        stops: [
          { id: 'premise', reads: 'at least one premise has to go', correct: true },
          { id: 'valid', reads: 'the reasoning must be invalid' },
          { id: 'accept', reads: 'you have to accept the conclusion' },
        ],
      },
      explain: 'A premise has to go. Validity means true premises cannot give you a false conclusion, so a false conclusion out of a valid argument proves something went in that was not true. Which premise is a separate fight, and it is the one Moore leaves open.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Which End You Trust',
      points: [
        'Moore grants the sceptical argument is valid',
        'He is surer of his hand than of any premise in it',
        'A valid argument with a false conclusion refutes a premise',
        'The sceptic replies that confidence is not knowledge',
      ],
      closing: 'Every argument can be run backwards. Which way you run it depends on what you were surest of.',
    },
    dur: 3.6,
  },
];
