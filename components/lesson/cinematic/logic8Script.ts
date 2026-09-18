import type { BaseBeat } from './cinematicKit';

// Cinematic logic-arguments-8, "Two Traps That Look Valid" — affirming the
// consequent and denying the antecedent, taught on a wet street at night. The
// figure double-takes at a soaked patch of pavement, walks back to it, confidently
// declares "it rained" — then walks up the road and finds the sprinkler that has
// been watering the street all evening. The alternative cause IS the lesson.
//
// Q1 is answered in the scene (tap what the wet street actually proves) and comes
// BEFORE the sprinkler is noticed, so the reader has to reason rather than read the
// answer off the stage. Q2 (denying the antecedent) is A/B/C/D in the deck. Both
// traps are named only after the reader has already walked into them.

export interface Logic8Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** Where the figure stands (stage x). 152 = at the wet patch, 248 = at the garden. */ x?: number;
  /** The soaked patch of pavement, 0..1. */ wet?: number;
  /** The IF→THEN rule card pinned top-left, 0..1. */ rule?: number;
  /** The tempting move card: 0 none · 1 "WET STREETS → SO IT RAINED" · 2 "NO RAIN → SO NO WET STREETS". */ trap?: number;
  /** 1 = the NO stamp lands on the tempting move. */ cross?: number;
  /** The garden: 0 there but unnoticed (ghosted) · 1 seen, sprinkler running. */ spr?: number;
  /** 1 = the three answer cards are live above the street (Q1). */ pick?: number;
  /** 0/1 — a tentative "SO, IT RAINED?" thought, before the reasoning is laid out. */ hasty?: number;
  /** 0/1 — a PREMISE 2 tag on the wet patch, naming it as the second premise. */ wetTag?: number;
  /** 0/1 — a reversed arrow inside the tempting-move card, showing the inference runs backward. */ reversed?: number;
  /** 0/1 — a dashed line from the sprinkler to the wet patch: an alternative cause. */ altCause?: number;
  /** 0/1 — a caption on that line: not just this once, but whenever another cause exists. */ altGeneral?: number;
}

export const BEATS: Logic8Beat[] = [
  {
    p: 12, x: 230, wet: 1,
    text: 'Suppose you’re walking home at night and find a stretch of street soaking wet.',
    dur: 4.1,
  },
  {
    p: 165, x: 230, wet: 1, hasty: 1,
    text: 'At once, you conclude that it must have rained.',
    dur: 1.8,
  },
  {
    p: 38, x: 152, wet: 1, rule: 1,
    text: 'Your reasoning relies on a rule you accept: if it rains, the streets get wet.',
    cite: 'The rule',
    dur: 3.4,
  },
  {
    p: 266, x: 152, wet: 1, rule: 1, wetTag: 1,
    text: 'Your second premise is that the streets are wet.',
    dur: 1.8,
  },
  {
    p: 5, x: 152, wet: 1, rule: 1, trap: 1,
    text: 'From the premises you infer the antecedent: the streets are wet, so rain fell.',
    cite: 'Reversing the rule',
    dur: 1.8,
  },
  {
    p: 259, x: 152, wet: 1, rule: 1, trap: 1, reversed: 1,
    text: 'The inference resembles modus ponens, but runs from the consequent back to the antecedent.',
    dur: 2.8,
  },
  {
    p: 380, x: 152, wet: 1, rule: 1, trap: 1, pick: 1,
    interact: {
      prompt: 'Does a wet street prove that it rained?',
      explain: 'Something made it wet. The rule says rain wets streets, and never says that only rain does. Since wet streets can have other causes, they don’t prove rain.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 159, x: 248, wet: 1, rule: 1, trap: 1, spr: 1,
    text: 'A little further on, a garden sprinkler has been watering the pavement all evening.',
    cite: 'An alternative cause',
    dur: 3.8,
  },
  {
    p: 159, x: 248, wet: 1, rule: 1, trap: 1, spr: 1, altCause: 1,
    text: 'The sprinkler alone could have made the street wet, whether or not it rained.',
    dur: 1.8,
  },
  {
    p: 11, x: 248, wet: 1, rule: 1, trap: 1, cross: 1, spr: 1, altCause: 1,
    text: 'This fallacy is called affirming the consequent. It treats a wet street, the consequent, as proof of rain, the antecedent.',
    cite: 'Affirming the consequent',
    dur: 3,
  },
  {
    p: 257, x: 248, wet: 1, rule: 1, trap: 1, cross: 1, spr: 1, altCause: 1, altGeneral: 1,
    text: 'The inference fails whenever something other than rain could leave the street wet.',
    dur: 2.2,
  },
  {
    p: 173, x: 152, wet: 1, rule: 1, trap: 2, spr: 1,
    text: 'Now consider a second inference, which begins from the absence of rain. Suppose it doesn’t rain tomorrow, and you expect dry streets.',
    cite: 'A second inference',
    dur: 4.6,
  },
  {
    p: 467, x: 152, wet: 1, rule: 1, trap: 2, spr: 1,
    interact: {
      prompt: 'On a day without rainfall, what can be concluded about the street?',
      drag: {
        lo: 'STREETS MUST BE DRY',
        hi: 'STREETS MUST BE WET',
        start: 0,
        zones: [
          { id: 'dry', upto: 0.28, reads: 'the streets must be dry' },
          { id: 'open', upto: 0.74, reads: 'the streets could be wet or dry', correct: true },
          { id: 'wet', upto: 1, reads: 'the streets must be wet' },
        ],
      },
      explain: 'On a day without rain, the streets could be wet or dry. The rule “if it rains, the streets get wet” says nothing about days without rain. A sprinkler can still wet the streets.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 383, x: 248, wet: 1, rule: 1, trap: 2, cross: 1, spr: 1,
    text: 'This fallacy is called denying the antecedent. Without one cause, an effect can still occur through another.',
    cite: 'Denying the antecedent',
    dur: 4.8,
  },
  {
    p: 465, x: 152, wet: 1, rule: 1, trap: 2, cross: 1, spr: 1,
    quote: {
      id: 'lq-logic-arguments-8-1',
      text: 'There are often several independent modes in which the same phenomenon could have originated.',
      author: 'John Stuart Mill',
      work: 'A System of Logic',
      era: '1843',
      philosopherId: 'john-stuart-mill',
      branchSlugs: ['logic'],
    },
    dur: 3.6,
  },
  {
    summary: {
      title: 'Two Fallacies That Look Valid',
      points: [
        'Affirming the consequent infers the antecedent from the consequent',
        'Denying the antecedent infers that the consequent is false',
        'One result can have many possible causes',
        'A conditional holds in one direction only',
      ],
      closing: 'Before inferring a cause from its effect, ask what else could have produced the effect.',
    },
    dur: 3.0,
  },
];
