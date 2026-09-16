import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic political-political-4, "Freedom vs. Control" — Berlin's two liberties.
// A figure pressed between two walls (interference). NEGATIVE liberty pulls the walls
// back — freedom from — and a measured gap ("ROOM TO MOVE") opens between them, which
// is the lesson's whole idea drawn as a dimension line. Mill's harm principle draws
// the one line power may cross: harm to another (a second person past the boundary).
// POSITIVE liberty stands the figure tall, its own master. Above it all, a two-card
// comparison diagram stamps whichever liberty is being discussed.
//
// Graded questions are the two from data/.../freedom-vs-control.ts (deck A/B/C/D —
// this lesson has no scene-answered question).
// ─────────────────────────────────────────────────────────────────────────────

export interface Pol4Beat extends BaseBeat {
  /** Figure gesture. */ p?: number;
  /** How close/present the walls are 0..1 (1 = pressing in). */ walls?: number;
  /** Harm-principle boundary + the other person (0/1). */ harm?: number;
  /** Which comparison card is stamped: 0 none · 1 negative · 2 positive. */ panel?: number;
  /** Mill's-test tally — four acts, three yours and one that harms (0/1). */ test?: number;
}

export const BEATS: Pol4Beat[] = [
  {
    p: 166, walls: 1, harm: 0, panel: 0,
    text: 'Are you free when no one stops you, or only when you’re able to act? These are two ideas of freedom that support very different politics.',
    dur: 3.6,
  },
  {
    p: 7, walls: 0.25, harm: 0, panel: 1,
    text: 'Isaiah Berlin called the first idea negative liberty. It’s the area within which others don’t interfere with what you do.',
    cite: 'Freedom from interference',
    dur: 2.4,
  },
  {
    p: 260, walls: 0.25, harm: 0, panel: 1,
    text: 'John Stuart Mill’s harm principle marks the boundary of that area. Power may be used against you only to prevent harm to others.',
    dur: 2.6,
  },
  {
    p: 13, walls: 0.25, harm: 1, panel: 1, test: 1,
    text: 'Mill holds that eating badly, taking risks and voicing unpopular opinions are your own decisions. Others may reason with you, but not compel you.',
    cite: 'Mill’s harm principle',
    dur: 2,
  },
  {
    p: 266, walls: 0.25, harm: 1, panel: 1, test: 1,
    text: 'Poisoning a well, defrauding a buyer or throwing a punch harms other people. Mill allows coercion only against conduct of this kind.',
    dur: 3.2,
  },
  {
    p: 141, walls: 0.25, harm: 1, panel: 1, test: 1,
    quote: {
      id: 'lq-political-political-4-1',
      text: 'Over himself, over his own body and mind, the individual is sovereign.',
      author: 'John Stuart Mill',
      philosopherId: 'john-stuart-mill',
      work: 'On Liberty',
      era: '1859',
      branchSlugs: ['political-philosophy'],
    },
    dur: 3.4,
  },
  {
    p: 163, walls: 0, harm: 0, panel: 2,
    text: 'Berlin called the second idea positive liberty: being your own master. On this view, someone free of interference may still be too poor, ill or uneducated to act.',
    cite: 'Freedom as self-mastery',
    dur: 3.8,
  },
  {
    p: 163, walls: 0, harm: 0, panel: 2,
    text: 'So positive liberty can back a bigger role for the state. It helps people act, not just leave them alone.',
    dur: 1.8,
  },
  {
    // Both cards sit neutral here — lighting one would hand the reader the answer.
    p: 380, walls: 0, harm: 0, panel: 0,
    interact: {
      prompt: 'Which liberty consists only in the absence of interference by others?',
      cards: [
        { text: 'Negative liberty', correct: true },
        { text: 'Positive liberty', correct: false },
      ],
      explain: 'Negative liberty. For Berlin, it’s the area in which no one interferes with your choices. Positive liberty concerns something else: whether you’re your own master, able to direct your life.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 165, walls: 0, harm: 0, panel: 2,
    interact: {
      prompt: 'How does Berlin weigh a core of negative liberty against positive liberty?',
      split: {
        left: 'A CORE OF NEGATIVE LIBERTY', right: 'POSITIVE LIBERTY',
        start: 0.04,
        zones: [
          { id: 'pos', upto: 0.3, reads: 'positive liberty first: the state frees your true self' },
          { id: 'both', upto: 0.66, reads: 'both weighed equally, with no protected core' },
          { id: 'neg', upto: 1, reads: 'a minimum core of negative liberty is protected', correct: true },
        ],
      },
      explain: 'A minimum core of negative liberty is protected. Berlin valued positive liberty but warned that it can be used to justify coercion. Rulers can coerce people in the name of their true selves. So Berlin insists on a minimum area of freedom that no authority may invade.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Negative and Positive Liberty',
      points: [
        'Negative liberty: freedom from interference',
        'Mill: coerce only to prevent harm to others',
        'Positive liberty: being your own master',
        'Berlin warned positive liberty can justify coercion',
      ],
      closing: 'Negative liberty limits what the state may do to you, while positive liberty can enlarge what it does for you.',
    },
    dur: 2.8,
  },
];
