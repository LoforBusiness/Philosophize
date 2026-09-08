import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic metaphysics-being-25, "What 'Could Have Been' Means"
// Theme: ONE TRUNK THAT FORKS, AND HOW SOLID THE ROADS NOBODY TOOK ARE.
//
// "Could have" is the whole subject, so the scene draws the fork rather than the
// morning. One trunk rising to a node, four roads leaving it, and one of them
// drawn solid because it is the one that happened. The other three are dashed,
// and the entire argument of the lesson is about what that dashing means.
//
// The last question then hands the reader the pen: their own answer decides
// whether the three unused roads go solid, stay dashed, or fade out. That is not
// decoration — it is the three positions, drawn as three states of one line.
//
// GAMIFIED SHAPE:
//   · beat 4  SCENE TARGETS — three plates, and the reader taps what makes "you
//     could have caught it" true. On the stage because the trunk and the roads
//     are two of the three answers, already drawn.
//   · beat 9  a SORT — what the unused road IS. The chip redraws it under the
//     reader's thumb: solid for a real place, dashed for a consistent story, gone
//     for loose talk.
// ─────────────────────────────────────────────────────────────────────────────

export interface Metaphysics25Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** 1 = the trunk and the node are drawn. */ trunk?: number;
  /** How many of the roads have left the node, 0…1. */ roads?: number;
  /** 1 = the three plates the reader chooses between are up. */ plates?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
}

export const BEATS: Metaphysics25Beat[] = [
  {
    p: 2, x: 44,
    text: 'You almost missed the train. Ask what that almost is made of.',
    dur: 3.8,
  },
  {
    p: 30, x: 44, trunk: 1,
    text: 'Up to this morning there is one road, and you were on it.',
    dur: 3.6,
  },
  {
    p: 36, x: 44, trunk: 1, roads: 1,
    text: 'Then it forks. Philosophers call each way it could have gone a possible world.',
    dur: 4.6,
  },
  {
    p: 160, x: 44, trunk: 1, roads: 1,
    text: 'One is solid because you walked it. The rest are drawn thin.',
    dur: 3.8,
  },
  {
    p: 161, x: 44, trunk: 1, roads: 1, plates: 1, live: 1,
    interact: {
      prompt: 'Tap what makes "you could have slept in" true.',
      explain: 'A road exists where you did. The trunk is only what happened, and it cannot make a claim about what did not — that is the job the fork was invented for.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 159, x: 44, trunk: 1, roads: 1,
    text: 'Necessary means on every road. Possible means on at least one of them.',
    dur: 4.6,
  },
  {
    p: 62, x: 100, trunk: 1, roads: 1,
    text: 'Then David Lewis asked the awkward question. How solid are the thin roads?',
    dur: 4.4,
  },
  {
    p: 433, x: 100, trunk: 1, roads: 1,
    quote: {
      id: 'lq-metaphysics-being-25-1',
      text: 'There are so many other worlds that absolutely every way a world could be is a way some world is.',
      author: 'David Lewis',
      philosopherId: 'david-lewis',
      work: 'On the Plurality of Worlds',
      era: '1986',
      branchSlugs: ['metaphysics'],
    },
    dur: 4.6,
  },
  {
    p: 383, x: 100, trunk: 1, roads: 1,
    text: 'Lewis meant it plainly. Real places, with a flesh and blood you on each of them.',
    dur: 4.6,
  },
  {
    p: 21, x: 100, trunk: 1, roads: 1,
    interact: {
      prompt: 'The road where you played music. What is it?',
      sort: {
        chip: 'the road you did not take',
        bins: [
          { id: 'place', label: 'a real place', reads: 'as concrete as this one, and cut off from it' },
          { id: 'story', label: 'a story', reads: 'a description that holds together, and nothing more', correct: true },
          { id: 'talk', label: 'loose talk', reads: 'a way of speaking that stands for nothing' },
        ],
      },
      explain: 'A story, for most philosophers. Lewis paid for his answer with an enormous world count, and the usual objection is that a road you can never reach does far less work than an ordinary description does.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Roads Not Taken',
      points: [
        'A possible world is a complete way things could have gone',
        'Necessary holds on every road, possible on at least one',
        'Lewis said the other roads are concrete places',
        'Most say they are consistent descriptions instead',
      ],
      closing: 'One small word can hide a whole argument. Say "could" again and notice how much it is carrying.',
    },
    dur: 4.0,
  },
];
