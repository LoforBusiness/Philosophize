import type { BaseBeat } from './cinematicKit';

// Cinematic logic-arguments-11, "The Argument That Eats Its Tail" — begging the
// question. A four-step proof goes up as a stack of cards, and a base line slides
// in under it: the evidence it is standing on. Q1 is A/B/C/D in the deck (valid,
// but does that prove anything?); Q2 is answered ON the stage — tap the step that
// assumes the very thing the proof is meant to establish. Answering springs a
// return arrow from that step back up to step 1 and the whole stack LIFTS off its
// base line, leaving a gap and a caption that reads "RESTING ON: —".
//
// The Latin (petitio principii) is deliberately never used; "the loop" is what the
// reader will actually recognise the next time somebody does it to them.

export interface Logic11Beat extends BaseBeat {
  /** Narrator gesture (emote code). */ p?: number;
  /** Where the narrator stands (stage x). 48 = downstage left, 116 = beside the stack. */ x?: number;
  /** How many of the four step-cards are up, revealed top-down: 0..4. */ steps?: number;
  /** 1 = the base line under the stack, its two posts and its caption are drawn. */ base?: number;
  /** 1 = the three connector stubs down the stack's left — the chain of support. */ spine?: number;
  /** 1 = the four step-cards are live tap targets (Q2 is answered in the scene). */ pick?: number;
  /** 1 = answering springs the return arrow and lifts the stack off its base line. */ arc?: number;
  /** 1 = a dashed stub tries to link the two premise cards, then gets struck through — asserted side by side, supporting nothing but themselves. */ isolate?: number;
  /** 1 = a check mark travels down all four steps in turn, landing on each the same way — showing why the flaw hides among the valid ones. */ verify?: number;
}

export const BEATS: Logic11Beat[] = [
  {
    p: 379, x: 48, steps: 1,
    text: 'A proof must rest on support from outside itself. This proof loses that support, although no single step is invalid.',
    dur: 3.8,
  },
  {
    p: 176, x: 48, steps: 2,
    text: 'The proof begins with two premises: this book is God’s word, and whatever God says is true.',
    cite: 'The two premises',
    dur: 2.6,
  },
  {
    p: 176, x: 48, steps: 2, isolate: 1,
    text: 'So far, each premise is asserted on its own, and neither is used to support the other.',
    dur: 1.8,
  },
  {
    p: 402, x: 116, steps: 4, base: 1,
    text: 'Step three answers an obvious objection with “God exists, because the book says so”. Step four concludes that the book is true, and the proof appears to rest on evidence.',
    cite: 'The proof, complete',
    dur: 5.2,
  },
  {
    p: 128, x: 116, steps: 4, base: 1,
    quote: {
      id: 'lq-logic-arguments-11',
      text: 'Begging or assuming the point at issue consists in failing to demonstrate the required proposition.',
      author: 'Aristotle',
      work: 'Prior Analytics',
      era: 'c. 350 BCE',
      philosopherId: 'aristotle',
      branchSlugs: ['logic'],
    },
    dur: 3.6,
  },
  {
    p: 163, x: 116, steps: 4, base: 1, spine: 1,
    text: 'Tested step by step, the proof is valid because each step follows from the one before it.',
    cite: 'Each step is valid',
    dur: 2.9,
  },
  {
    p: 163, x: 116, steps: 4, base: 1, spine: 1, verify: 1,
    text: 'That validity is what makes the flaw hard to detect.',
    dur: 2.1,
  },
  {
    p: 380, x: 116, steps: 4, base: 1, spine: 1,
    interact: {
      prompt: 'Which of these gives no reason at all?',
      odd: {
        axis: 'THREE GIVE A REASON',
        tiles: [
          { id: 'seen', reads: 'THREE PEOPLE SAW IT' },
          { id: 'law', reads: 'IT FOLLOWS FROM THE LAW' },
          { id: 'test', reads: 'THE TEST CAME BACK POSITIVE' },
          { id: 'circle', reads: 'IT IS TRUE BECAUSE IT IS TRUE', correct: true },
        ],
      },
      explain: 'The last one. A circular argument is valid, and that\'s what makes it useless: the conclusion is already sitting in the premise, so anyone who doubts the conclusion has just as much reason to doubt what\'s offered in support of it.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 447, x: 116, steps: 4, base: 1, spine: 1, pick: 1, arc: 1,
    interact: {
      prompt: 'Which step assumes what the argument is meant to prove?',
      explain: 'Step three quietly assumes what it is meant to prove: “God exists, because the book says so.” Step one relies on God the same way.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 130, x: 116,
    summary: {
      title: 'Begging the Question',
      points: [
        'Begging the question assumes its conclusion as a premise',
        'A circular argument can be valid and still prove nothing',
        'Two claims that support only each other form a circle',
        'Ask what each premise rests on outside the argument',
      ],
      closing: 'A circular proof concludes with the very claim assumed at the start.',
    },
    dur: 3.0,
  },
];
