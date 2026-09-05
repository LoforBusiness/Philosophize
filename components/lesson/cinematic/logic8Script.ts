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
}

export const BEATS: Logic8Beat[] = [
  {
    p: 12, x: 230, wet: 1,
    text: 'You are almost home when the pavement registers a beat late. Behind you the street is dark and soaking, and your head has already answered why.',
    dur: 4.1,
  },
  {
    p: 12, x: 230, wet: 1,
    text: 'It rained.',
    dur: 1.8,
  },
  {
    p: 38, x: 152, wet: 1, rule: 1,
    text: 'You walk back to the wet patch. The rule is one you would bet money on: if it rains, the streets get wet.',
    cite: 'The wet patch',
    dur: 3.4,
  },
  {
    p: 38, x: 152, wet: 1, rule: 1,
    text: 'And tonight these streets are definitely wet.',
    dur: 1.8,
  },
  {
    p: 5, x: 152, wet: 1, rule: 1, trap: 1,
    text: 'So you run the rule backwards. Streets wet, therefore rain.',
    cite: 'Running it backwards',
    dur: 1.8,
  },
  {
    p: 5, x: 152, wet: 1, rule: 1, trap: 1,
    text: 'It feels like the same reliable move you used yesterday, only read from the other end.',
    dur: 2.8,
  },
  {
    p: 4, x: 152, wet: 1, rule: 1, trap: 1, pick: 1,
    interact: {
      prompt: 'The street is soaked. Tap the card that the wet pavement ACTUALLY proves.',
      explain: 'Wet is a result, and results can have more than one parent. The rule promised that rain leads to wet — it never promised that wet leads back to rain.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 159, x: 248, wet: 1, rule: 1, trap: 1, spr: 1,
    text: 'Twenty steps on, you hear it. A sprinkler, sweeping the pavement from next door’s lawn, and it has been going all evening.',
    cite: 'The other cause',
    dur: 3.8,
  },
  {
    p: 159, x: 248, wet: 1, rule: 1, trap: 1, spr: 1,
    text: 'It was standing there the whole time.',
    dur: 1.8,
  },
  {
    p: 11, x: 248, wet: 1, rule: 1, trap: 1, cross: 1, spr: 1,
    text: 'This trap has a name: affirming the consequent. You spot the result, then claim the cause.',
    cite: 'Trap one · affirming the consequent',
    dur: 3,
  },
  {
    p: 11, x: 248, wet: 1, rule: 1, trap: 1, cross: 1, spr: 1,
    text: 'It breaks the instant anything else could have produced the same result.',
    dur: 2.2,
  },
  {
    p: 8, x: 152, wet: 1, rule: 1, trap: 2, spr: 1,
    text: 'Now flip it the other way. Tomorrow the forecast promises no rain at all, so you plan on dry pavement and leave the umbrella hanging by the door.',
    cite: 'The other flip',
    dur: 4.6,
  },
  {
    p: 21, x: 152, wet: 1, rule: 1, trap: 2, spr: 1,
    interact: {
      prompt: 'Suppose it never rained. What follows about the streets?',
      drag: {
        lo: 'STREETS MUST BE DRY',
        hi: 'STREETS MUST BE WET',
        start: 0,
        zones: [
          { id: 'dry', upto: 0.28, reads: 'the streets must be dry' },
          { id: 'open', upto: 0.74, reads: 'the streets could be either', correct: true },
          { id: 'wet', upto: 1, reads: 'the streets must be wet' },
        ],
      },
      explain: 'The middle, and the knob starts on the trap. Switching off the cause feels like switching off the effect. The rule only ran one way, rain to wet, and said nothing about a dry night. The sprinkler does not check the forecast.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 383, x: 248, wet: 1, rule: 1, trap: 2, cross: 1, spr: 1,
    text: 'That is trap two: denying the antecedent. Removing one cause does not remove the result, because the result had other doors it could come through.',
    cite: 'Trap two · denying the antecedent',
    dur: 4.8,
  },
  {
    p: 137, x: 152, wet: 1, rule: 1, trap: 2, cross: 1, spr: 1,
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
      title: 'Two Traps, Disarmed',
      points: [
        'Wet streets never prove that it rained',
        'One result can have many possible causes',
        'Removing the cause does not remove the result',
        'The arrow in a rule runs one way',
      ],
      closing: 'Next time your street is soaked, go and look for the sprinkler.',
    },
    dur: 3.0,
  },
];
