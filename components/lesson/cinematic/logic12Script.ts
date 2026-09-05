import type { BaseBeat } from './cinematicKit';

// Cinematic logic-arguments-12, "The Trap Of Only Two Doors" — a CONVERSION of an
// existing card deck, taken in reading order as the frontier of the Logic branch (§5).
//
// THE PICTURE: a wall with four doors in it. Two are lit and offered; two have been
// there the whole time, unlit. The trick is not that the doors are fake — it is that
// the room was drawn with only two of them showing (H64).
//
// STAGING: the app's first DOOR — a frame with a leaf that swings open on its hinge —
// and the answer targets are the doors, so the reader answers by choosing a way out.

export interface Logic12Beat extends BaseBeat {
  /** Figure gesture (emote code). */ g?: number;
  /** 1 = the two unoffered doors are lit as well. */ lit?: number;
  /** 1 = the doors are live targets (Q1). */ pick?: number;
}

export const BEATS: Logic12Beat[] = [
  {
    g: 5, lit: 0,
    dur: 4.0,
    text: 'You are either with us or against us. Two doors, and you are told to pick one.',
  },
  {
    g: 4, lit: 0,
    dur: 4.4,
    text: 'Both doors are real. Some people genuinely are with you, and some genuinely are against you — nothing has been made up here.',
    cite: 'Both doors are real',
  },
  {
    g: 2, lit: 0,
    dur: 2.8,
    text: 'The trick is the claim that only two doors exist. Nobody argued for that claim.',
    cite: 'The claim about the room',
  },
  {
    g: 2, lit: 0,
    dur: 1.8,
    text: 'You were simply put in a room with two doors.',
  },
  {
    g: 147, lit: 0,
    dur: 3.6,
    quote: {
      id: 'lq-logic-arguments-12-1',
      text: 'Mankind likes to think in terms of extreme opposites, in terms of Either-Or, between which it recognizes no intermediate possibilities.',
      author: 'John Dewey',
      philosopherId: 'john-dewey',
      work: 'Experience and Education',
      era: '1938',
      branchSlugs: ['logic'],
    },
  },
  {
    g: 45, lit: 1,
    dur: 4.6,
    text: 'Turn the lights on along the rest of the wall. Nothing was built just now — these were in the room before anyone made you an offer.',
    cite: 'The rest of the wall',
  },
  {
    g: 384, lit: 1, pick: 1,
    dur: 1.0,
    interact: {
      prompt: 'Tap the door the offer had to keep dark to work.',
      explain: 'The middle one. The claim only holds if being partly with and partly against is not available — so that is the door it has to hide. Saying nothing is not a third position; it is leaving the room.',
      xp: 5,
    },
  },
  {
    g: 11, lit: 1,
    dur: 1.0,
    interact: {
      prompt: 'When is an either-or fair rather than false?',
      sort: {
        chip: 'an either-or',
        bins: [
          { id: 'exhaustive', label: 'only two doors', reads: 'fair when the two doors are the only doors', correct: true },
          { id: 'popular', label: 'most accept it', reads: 'fair when most people accept the two' },
          { id: 'never', label: 'always a trick', reads: 'never fair, every either-or is a trick' },
        ],
      },
      explain: 'The other card over-corrects, and the light switch refutes it: on or off leaves nothing out and is perfectly good reasoning. What makes a disjunction legitimate is that its options are exhaustive — not how they are offered, or by whom.',
      xp: 5,
    },
  },
  {
    summary: {
      title: 'Count the Doors',
      points: [
        'A false dilemma offers two options and hides the rest',
        'The two on offer are usually real — the "only" is the lie',
        'A real either/or has to leave nothing out',
        'Ask what the middle position would be, then look for it',
      ],
      closing: 'When someone hands you two doors, the useful question is not which one. It is who drew the room.',
    },
    dur: 3.0,
  },
];
