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
  /** 1 = rings on the highest-rated rung and the lowest-rated conclusion. */ extremesRing?: number;
  /** 1 = a "?" beside the hand's own bar, questioning what that bar measures. */ handQuestion?: number;
}

export const BEATS: Epi24Beat[] = [
  {
    p: 25, x: 200, ladder: 1,
    text: 'Consider a sceptical argument about dreaming, set out step by step. Each step follows validly from the ones before it.',
    dur: 4.8,
  },
  {
    p: 2, x: 200, ladder: 1, sure: 1,
    text: 'Beside each claim, a bar shows how certain you are that it’s true. The bar measures credibility, not how persuasive the claim sounds.',
    cite: 'Credibility, not persuasiveness',
    dur: 3.7,
  },
  {
    p: 266, x: 200, ladder: 1, sure: 1, extremesRing: 1,
    text: 'The bars rate the premise that you can’t rule out a dream highest. They rate the sceptic’s conclusion lowest.',
    dur: 1.8,
  },
  {
    p: 418, x: 132, ladder: 1, sure: 1, hand: 1,
    text: 'Moore held up his hand and said he knew this was a hand. That claim is more credible than any claim on the ladder.',
    dur: 4.6,
  },
  {
    p: 457, x: 132, ladder: 1, sure: 1, hand: 1, live: 1,
    interact: {
      prompt: 'Which of these claims are you most certain is true?',
      explain: 'Here is one hand. Moore’s point is that this claim is more certain than any premise of the sceptical argument. He doesn’t accuse the sceptic of reasoning badly. He compares how certain the premises are with how certain the conclusion’s denial is.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 139, x: 132, ladder: 1, sure: 1, hand: 1,
    quote: {
      id: 'lq-epistemology-knowledge-24-2',
      text: 'I can know things which I cannot prove; and among things which I certainly did know, even if I could not prove them, were the premisses of my proof.',
      author: 'G.E. Moore',
      philosopherId: 'ge-moore',
      work: 'Proof of an External World',
      era: '1939',
      branchSlugs: ['epistemology'],
    },
    dur: 4.2,
  },
  {
    p: 380, x: 268, ladder: 1, sure: 1, hand: 1, give: 1,
    text: 'A valid argument can also be run in reverse. You should reject a premise when you’re surer the conclusion is false than the premises are true.',
    cite: 'The Moorean shift',
    dur: 4.8,
  },
  {
    p: 168, x: 268, ladder: 1, sure: 1, hand: 1, give: 1, handQuestion: 1,
    text: 'The sceptic can reply that the bar measures confidence, not knowledge. Whether Moore knows he has a hand is the very point in dispute.',
    dur: 4.8,
  },
  {
    p: 41, x: 268, ladder: 1, sure: 1, hand: 1, give: 1,
    interact: {
      prompt: 'If an argument is valid and its conclusion is false, what follows?',
      sort: {
        chip: 'a false conclusion',
        bins: [
          { id: 'premise', label: 'a false premise', reads: 'at least one premise must be false', correct: true },
          { id: 'valid', label: 'invalid reasoning', reads: 'the reasoning must be invalid' },
          { id: 'accept', label: 'accept it anyway', reads: 'the conclusion must still be accepted' },
        ],
      },
      explain: 'A false premise. A valid argument can’t lead from true premises to a false conclusion. So if the conclusion is false, at least one premise is false. Validity alone doesn’t show which premise that is.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Moore’s Reply to Scepticism',
      points: [
        'Moore grants the sceptical argument is valid',
        'He is surer of his hand than of any premise in it',
        'A valid argument with a false conclusion refutes a premise',
        'The sceptic replies that confidence is not knowledge',
      ],
      closing: 'Any valid argument can be run in reverse. Which direction is rational depends on which claims are more certain.',
    },
    dur: 3.6,
  },
];
