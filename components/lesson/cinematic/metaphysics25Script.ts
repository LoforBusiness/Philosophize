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
  /** 1 = a ring marks the walked road's plate as the actual world (group AH). */ actualRing?: number;
  /** 1 = a small dot lands on each unwalked road — Lewis's counterparts (group AH). */ counterparts?: number;
}

export const BEATS: Metaphysics25Beat[] = [
  {
    p: 2, x: 44,
    text: 'Suppose you almost missed your train this morning. What makes the claim that you could have missed it true?',
    dur: 3.8,
  },
  {
    p: 30, x: 44, trunk: 1,
    text: 'Represent your life up to this morning as a single road.',
    dur: 3.6,
  },
  {
    p: 36, x: 44, trunk: 1, roads: 1,
    text: 'This morning the road forks, one branch for each way events could have gone. A complete way things could have been is called a possible world.',
    dur: 4.6,
  },
  {
    p: 160, x: 44, trunk: 1, roads: 1, actualRing: 1,
    text: 'The road you took represents the actual world. The other roads represent worlds that are merely possible.',
    dur: 3.8,
  },
  {
    p: 161, x: 44, trunk: 1, roads: 1, plates: 1, live: 1,
    interact: {
      prompt: 'What makes it true that you could have slept in?',
      explain: 'A road exists where you slept in. The trunk records only what happened, so it can’t make a claim about other possibilities true. Possible worlds were introduced to do that work.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 159, x: 44, trunk: 1, roads: 1,
    text: 'A claim is necessary if it’s true in every possible world, and possible if it’s true in at least one.',
    dur: 4.6,
  },
  {
    p: 62, x: 100, trunk: 1, roads: 1,
    text: 'David Lewis asked what possible worlds are. Do the other roads exist as fully as the actual one?',
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
    p: 383, x: 100, trunk: 1, roads: 1, counterparts: 1,
    text: 'Lewis intended this as a literal claim. On his modal realism, other worlds are as concrete as the actual world and contain counterparts of you.',
    dur: 4.6,
  },
  {
    p: 21, x: 100, trunk: 1, roads: 1,
    interact: {
      prompt: 'What do most philosophers take a merely possible world to be?',
      sort: {
        chip: 'a merely possible world',
        bins: [
          { id: 'place', label: 'a concrete world', reads: 'as concrete as the actual world yet isolated' },
          { id: 'story', label: 'an abstract description', reads: 'a consistent description of a whole world', correct: true },
          { id: 'talk', label: 'a useful fiction', reads: 'a way of speaking with nothing behind it' },
        ],
      },
      explain: 'An abstract description, for most philosophers. Lewis’s view needs countless real universes. Saul Kripke objected that a counterpart in another world is someone else, not you.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Possible Worlds',
      points: [
        'A possible world is a complete way things could have gone',
        'Necessary: true in every world. Possible: true in at least one',
        'Lewis held that other possible worlds are concrete',
        'Most philosophers treat them as abstract descriptions instead',
      ],
      closing: 'Ordinary claims about what could have happened rely on an account of possible worlds. Each account has costs.',
    },
    dur: 4.0,
  },
];
