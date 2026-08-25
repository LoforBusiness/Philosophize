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
}

export const BEATS: Logic11Beat[] = [
  {
    p: 25, x: 48, steps: 1,
    text: 'A proof has to rest on something outside itself. Watch this proof stop doing so, without a single step going wrong.',
    dur: 3.8,
  },
  {
    p: 21, x: 48, steps: 2,
    text: 'Two claims go up. The book is God’s word; whatever God says is true. Innocent so far — nothing has been smuggled in yet.',
    cite: 'The two premises',
    dur: 4.4,
  },
  {
    p: 13, x: 116, steps: 4, base: 1,
    text: 'Step three answers the obvious objection, and step four draws the conclusion. The whole structure now stands on that line: evidence from outside the argument.',
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
    p: 9, x: 116, steps: 4, base: 1, spine: 1,
    text: 'Now test the chain. Every link holds, step after step, nothing missing and nothing limping. A chain that sound is exactly what makes the trap dangerous.',
    cite: 'Every link holds',
    dur: 5.0,
  },
  {
    p: 4, x: 116, steps: 4, base: 1, spine: 1,
    interact: {
      prompt: 'A circular argument is logically VALID. Does that mean it proves its conclusion?',
      cards: [
        { text: 'No, it adds no support', correct: true },
        { text: 'Yes, it is valid', correct: false },
      ],
      explain: 'The trap: validity feels like proof. All validity promises is that true premises could not give a false conclusion — and a circle clears that bar by helping itself to the conclusion. It never fails, and it never tells you anything.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 45, x: 116, steps: 4, base: 1, spine: 1, pick: 1, arc: 1,
    interact: {
      prompt: 'Tap the step that assumes the very thing the argument is meant to prove.',
      explain: 'The trap: step 3 looks like extra support, so the proof seems to be doing more work. It is doing less. Step 1 leans on God; step 3 leans on the book. The loop closes, and no evidence from outside ever gets in.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 130, x: 116,
    summary: {
      title: 'The Argument That Eats Its Tail',
      points: [
        'Begging the question assumes its conclusion as a premise',
        'It can be flawlessly valid and still prove nothing',
        'Two claims propping each other up is still a circle',
        'Ask what each premise rests on outside the argument',
      ],
      closing: 'You now see the loop — a proof that only ever hands you back what it was given.',
    },
    dur: 3.0,
  },
];
