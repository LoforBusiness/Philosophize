import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic aesthetics-aesthetics-22, "Crying Over People Who Never Existed"
// Theme: TWO READINGS TAKEN OFF ONE VIEWER, AND ONLY ONE OF THEM MOVES.
//
// The paradox of fiction is three claims that cannot all stand, and told as
// three sentences it is a logic exercise. Told as instruments it is an
// observation: the heart goes, the belief never does, and the reader watches the
// contradiction happen to a body rather than being asked to grant it.
//
// The scene therefore refuses to settle which claim goes. It shows the readings
// and lets the two live answers argue over them, because that is the actual
// state of the question and pretending otherwise would be the tidier lie.
//
// GAMIFIED SHAPE:
//   · beat 3  SCENE TARGETS — tap what the paradox says a real emotion must
//     have. The racing heart is the rival, because most people locate the
//     emotion in the body and the second claim is about the mind (H66).
//   · beat 7  a SPLIT — one response divided between play and the real thing.
//     A rail would ask "how afraid"; the seam asks what the fear was MADE of,
//     and both sides carry a running number the whole time.
// ─────────────────────────────────────────────────────────────────────────────

export interface Aes22Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** The screen, 0…1. */ screen?: number;
  /** How far the slime has come, 0…1. */ slime?: number;
  /** The two instrument tracks and their labels, 0…1. */ meters?: number;
  /** What the heart meter reads, 0…1. */ heart?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
}

export const BEATS: Aes22Beat[] = [
  {
    p: 25, x: 200, screen: 1,
    text: 'The lights go down. Green slime starts oozing towards the camera, and it is coming for you.',
    dur: 4.4,
  },
  {
    p: 2, x: 200, screen: 1, slime: 1, meters: 1, heart: 1,
    text: 'Take the readings. The heart goes up. The belief that any of it is real never leaves the floor.',
    cite: 'Two instruments',
    dur: 4.6,
  },
  {
    p: 45, x: 132, screen: 1, slime: 1, meters: 1, heart: 1,
    text: 'Three things all seem true. You feel it. Feeling needs belief. You believe none of it.',
    cite: 'The paradox of fiction',
    dur: 4.4,
  },
  {
    p: 4, x: 132, screen: 1, slime: 1, meters: 1, heart: 1, live: 1,
    interact: {
      prompt: 'Tap what the paradox says a real emotion must have.',
      explain: 'Belief. It is the claim doing the work and the one nobody notices making. Most people put the emotion in the racing heart, and if that were all it took the puzzle would already be over.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 21, x: 132, screen: 1, slime: 1, meters: 1, heart: 1,
    text: 'One answer says you were never afraid. You were playing a game, and inside it, it is true that you were.',
    cite: 'Make-believe',
    dur: 4.8,
  },
  {
    p: 137, x: 268, screen: 1, slime: 1, meters: 1, heart: 1,
    quote: {
      id: 'lq-aesthetics-aesthetics-22-2',
      text: 'Charles is not really afraid. It is fictional that he is afraid. He is engaged in a game of make-believe.',
      author: 'Kendall Walton',
      work: 'Fearing Fictions',
      era: '1978',
      branchSlugs: ['aesthetics'],
    },
    dur: 4.2,
  },
  {
    p: 13, x: 268, screen: 1, slime: 1, meters: 1, heart: 1,
    text: 'The rival answer keeps the feeling and drops the middle claim. Vividly imagining a thing is enough to move you.',
    dur: 4.6,
  },
  {
    p: 41, x: 268, screen: 1, slime: 1, meters: 1, heart: 1,
    interact: {
      prompt: 'Slide the seam to the verdict make-believe gives on that heart reading.',
      split: {
        left: 'MAKE-BELIEVE', right: 'REAL FEAR',
        start: 0.16,
        zones: [
          { id: 'real', upto: 0.34, reads: 'you were mostly just afraid' },
          { id: 'mix', upto: 0.66, reads: 'half played, half felt' },
          { id: 'game', upto: 1, reads: 'a game throughout, and not fear at all', correct: true },
        ],
      },
      explain: 'Nearly all the way over. The evidence offered is your feet: real fear empties cinemas, and yours stayed put. The rival answer says that proves only that you had nothing to run from, not that the feeling was pretend.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Real Tears, No One There',
      points: [
        'You feel things for people you know never existed',
        'The paradox turns on emotions needing belief',
        'Make-believe says the feeling is played, not felt',
        'Thought theory says imagining vividly is enough',
      ],
      closing: 'Whatever it is, it is the reason anybody reads a novel twice.',
    },
    dur: 3.4,
  },
];
