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
    p: 462, x: 70,
    text: 'Two basic forms of inference start from a conditional. Both are valid: true premises guarantee a true conclusion.',
    dur: 3.8,
  },
  {
    p: 41, x: 168, rule: 1,
    text: 'Suppose you accept the rule “if it rains, the streets get wet”. This conditional is the first premise.',
    cite: 'The conditional premise',
    dur: 2.3,
  },
  {
    p: 41, x: 168, rule: 1,
    text: 'The rule claims only that rain, whenever it falls, makes the streets wet. The rule alone says nothing about today’s weather.',
    dur: 2.7,
  },
  {
    p: 40, x: 168, rule: 1, fact: 1,
    text: 'Now add a second premise, which states a fact: it’s raining.',
    cite: 'The second premise',
    dur: 2.6,
  },
  {
    p: 40, x: 168, rule: 1, fact: 1,
    text: 'The question is what, if anything, these two premises together allow you to conclude.',
    dur: 1.8,
  },
  {
    p: 432, x: 124, rule: 1, fact: 1, pick: 1,
    interact: {
      prompt: 'If rain always wets the streets and it’s raining, which conclusion must be true?',
      explain: 'Streets are wet. The rule says rain always brings wet streets, and it’s raining, so wet streets are guaranteed. These premises leave no room for the verdict that nothing follows.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 2, x: 124, rule: 1, fact: 1, concl: 1,
    text: 'This move has a name: modus ponens. Given the rule and its first part, called the antecedent, you may infer its second part, called the consequent.',
    cite: 'Modus ponens',
    dur: 3.7,
  },
  {
    p: 2, x: 124, rule: 1, fact: 1, concl: 1,
    text: 'The conclusion about the streets follows from the premises alone, without anyone observing the streets.',
    dur: 1.8,
  },
  {
    p: 40, x: 168, rule: 1, fact: 2,
    text: 'Now keep the same rule and take a different second premise, about the streets rather than the sky.',
    cite: 'A new second premise',
    dur: 3.8,
  },
  {
    p: 40, x: 168, rule: 1, fact: 2,
    text: 'The second premise is now that the streets are dry.',
    dur: 1.8,
  },
  {
    p: 165, x: 124, rule: 1, fact: 2,
    interact: {
      prompt: 'If rain always wets the streets and the streets are dry, what follows about rain?',
      sort: {
        chip: 'the streets are dry',
        bins: [
          { id: 'nothing', label: 'nothing follows', reads: 'nothing, until someone observes the sky' },
          { id: 'likely', label: 'probably not', reads: 'dry streets make rain unlikely, not impossible' },
          { id: 'certain', label: 'certainly not', reads: 'it cannot be raining, given the rule', correct: true },
        ],
      },
      explain: 'Certainly not raining. The rule says rain always brings wet streets, so rain with dry streets would break the rule. Given the rule, dry streets don’t merely make rain unlikely. They rule it out.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 459, x: 168, rule: 1, fact: 2, concl: 2,
    text: 'The second form is called modus tollens. From a conditional and a false consequent, you may infer a false antecedent.',
    cite: 'Modus tollens',
    dur: 3.3,
  },
  {
    p: 459, x: 168, rule: 1, fact: 2, concl: 2,
    text: 'A fact about the streets, together with the rule, settles a question about the sky.',
    dur: 1.8,
  },
  {
    p: 129, x: 124, rule: 1,
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
      title: 'Two Valid Forms of Inference',
      points: [
        'Modus ponens: affirm the antecedent, infer the consequent',
        'Modus tollens: deny the consequent, infer the antecedent’s denial',
        'In both, true premises guarantee the conclusion',
        'Ruling out a possibility applies modus tollens',
      ],
      closing: 'Two invalid forms of inference closely resemble these valid ones, and are easily mistaken for them.',
    },
    dur: 3.0,
  },
];
