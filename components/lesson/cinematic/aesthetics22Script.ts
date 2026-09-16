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
    text: 'Kendall Walton describes a viewer, Charles, watching a horror film. A green slime oozes towards the camera, as if towards him.',
    dur: 4.4,
  },
  {
    p: 2, x: 200, screen: 1, slime: 1, meters: 1, heart: 1,
    text: 'Charles’s heart rate rises and his muscles tense. His body responds as it would to a real danger.',
    cite: 'Two instruments',
    dur: 1.8,
  },
  {
    p: 266, x: 200, screen: 1, slime: 1, meters: 1, heart: 1,
    text: 'Yet Charles never believes that the slime exists. He knows he’s watching a film.',
    dur: 2.9,
  },
  {
    p: 463, x: 132, screen: 1, slime: 1, meters: 1, heart: 1,
    text: 'The paradox of fiction consists of three claims that each seem true. First, you feel real fear at a film.',
    cite: 'The paradox of fiction',
    dur: 2.2,
  },
  {
    p: 463, x: 132, screen: 1, slime: 1, meters: 1, heart: 1,
    text: 'Second, an emotion requires a belief that its object exists. Third, you don’t believe the film’s events are real.',
    dur: 2.2,
  },
  {
    p: 165, x: 132, screen: 1, slime: 1, meters: 1, heart: 1, live: 1,
    interact: {
      prompt: 'What does the paradox assume a genuine emotion must include?',
      explain: 'Belief that it’s real. This premise generates the paradox, and it’s easily overlooked. The racing heart is tempting, because emotion is usually felt in the body. But if a bodily response were enough, there would be no paradox.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 177, x: 132, screen: 1, slime: 1, meters: 1, heart: 1,
    text: 'Walton rejects the first claim. On his view, Charles plays a game of make-believe, and only within the game does he fear the slime.',
    cite: 'Make-believe',
    dur: 4.8,
  },
  {
    p: 456, x: 268, screen: 1, slime: 1, meters: 1, heart: 1,
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
    p: 383, x: 268, screen: 1, slime: 1, meters: 1, heart: 1,
    text: 'The thought theory, held by Peter Lamarque and Noël Carroll, rejects the second claim instead. Vividly imagining a thing is enough to move you.',
    dur: 4.6,
  },
  {
    p: 41, x: 268, screen: 1, slime: 1, meters: 1, heart: 1,
    interact: {
      prompt: 'On Walton’s view, how is Charles’s response divided between make-believe and real fear?',
      split: {
        left: 'MAKE-BELIEVE', right: 'REAL FEAR',
        start: 0.16,
        zones: [
          { id: 'real', upto: 0.34, reads: 'mostly real fear of the slime' },
          { id: 'mix', upto: 0.66, reads: 'partly make-believe, partly real fear' },
          { id: 'game', upto: 1, reads: 'wholly make-believe, with no real fear', correct: true },
        ],
      },
      explain: 'Wholly make-believe, with no real fear. Walton points to behaviour: real fear of the slime would make Charles flee, yet he stays in his seat. The thought theory replies that he has no reason to flee, though his feeling is real.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'The Paradox of Fiction',
      points: [
        'People feel emotions for characters they know are fictional',
        'The paradox assumes that emotions require belief',
        'Walton: the fear is fictional, within a game of make-believe',
        'The thought theory: vividly imagining is enough for emotion',
      ],
      closing: 'Both answers accept that fiction moves people. They disagree about whether the response is a genuine emotion.',
    },
    dur: 3.4,
  },
];
