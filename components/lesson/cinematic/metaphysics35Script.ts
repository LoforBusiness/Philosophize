import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic metaphysics-being-35, "Could You Change the Past?"
// Theme: A LINE YOU CAN WALK BACK ALONG, AND ONE KNOT YOU CANNOT UNTIE.
//
// The stage is the reader's own timeline: a rule with five dated marks, the man
// standing at the present end. He WALKS back along it — which is the picture of
// the whole idea, and gives the camera a genuine subject to track (K9) rather
// than a diagram to stare at.
//
// The knot is drawn, not described. When he reaches 1925 a loop closes between
// the shot and his own birth and the two links pull against each other, so the
// contradiction is a thing on stage rather than a sentence about one.
//
// GAMIFIED SHAPE (the three ways to answer, all different):
//   · beat 3  an UNGRADED tap — pick which of the two marks the story needs.
//     Nothing is scored; it is there to make the reader look at the line.
//   · beat 5  a SCENE TARGET — tap the link that actually breaks.
//   · beat 7  two CARDS — the one question that is genuinely a fork, not a hunt.
//
// VOICE: group M. The barb lands on the story and on physics-in-films, never on
// the reader. Delete every aside and the three points still stand.
// ─────────────────────────────────────────────────────────────────────────────

export interface Metaphysics35Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** 1 = the dated timeline is drawn. */ line?: number;
  /** 1 = the loop arc back from the present to 1925. */ arc?: number;
  /** 1 = the two links of the knot are drawn at 1925 and 1975. */ knot?: number;
  /** 1 = the knot is shown SNAPPED — the contradiction, made visible. */ snap?: number;
  /** 1 = the second history branches off below the line. */ branch?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
  /** 1 = a dashed ring settles round the 1925 mark — that point on the line
   * holds steady (group AH). */ mark1925?: number;
  /** 1 = two small arrows press inward between the knot's two links — the
   * paradox, as a squeeze (group AH). */ strain?: number;
  /** 1 = a cross lands on the branch run — the attempt that failed there
   * (group AH). */ failMark?: number;
}

export const BEATS: Metaphysics35Beat[] = [
  {
    p: 172, x: 322, line: 1,
    text: 'Represent your life as a line through time. You stand at the present end.',
    dur: 3.2,
  },
  {
    p: 13, x: 322, line: 1, arc: 1,
    text: 'Now suppose you travel back to 1925. So far, the idea of visiting the past involves no contradiction.',
    dur: 2.6,
  },
  {
    p: 266, x: 322, line: 1, arc: 1, mark1925: 1,
    text: 'Being present in 1925 need not change any event that happened there.',
    dur: 1.8,
  },
  {
    p: 457, x: 120, line: 1, arc: 1, knot: 1,
    text: 'Suppose that in 1925 you shoot your grandfather before he meets your grandmother. Then you’re never born.',
    dur: 2.5,
  },
  {
    p: 457, x: 120, line: 1, arc: 1, knot: 1, strain: 1,
    text: 'But then no one travels back to fire the shot, so you’re born after all. This is the grandfather paradox.',
    dur: 2.3,
  },
  {
    p: 394, x: 120, line: 1, arc: 1, knot: 1, live: 1,
    tap: {
      prompt: 'Which of the two marks must happen for your trip to happen at all?',
      options: [
        { id: 'shot', text: '1925', correct: false },
        { id: 'born', text: '1975', correct: true },
      ],
      explain: 'Your birth in 1975. The trip depends on your birth, yet the trip is what prevents it. So the story contradicts itself.',
    },
    dur: 1.0,
  },
  {
    p: 467, x: 120, line: 1, knot: 1, snap: 1,
    quote: {
      id: 'lq-metaphysics-being-35-1',
      text: 'Time travel, I maintain, is possible. The paradoxes are oddities, not impossibilities.',
      author: 'David Lewis',
      philosopherId: 'david-lewis',
      work: 'The Paradoxes of Time Travel',
      era: '1976',
      branchSlugs: ['metaphysics'],
    },
    dur: 3.4,
  },
  {
    p: 383, x: 120, line: 1, knot: 1, snap: 1, live: 1,
    interact: {
      prompt: 'Which link in the story contains the contradiction?',
      explain: 'Your birth. The contradiction arises only because the trip is meant to make the past come out differently. A visit that was always part of history contradicts nothing. Changing the past is contradictory, but visiting it isn’t.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 47, x: 120, line: 1, branch: 1,
    text: 'One response keeps history consistent. If you were always in 1925, whatever you did there is part of what happened.',
    dur: 3.6,
  },
  {
    p: 267, x: 120, line: 1, branch: 1, failMark: 1,
    text: 'Your attempt fails for an ordinary reason, such as a jammed gun. In the only consistent history, it never succeeded.',
    dur: 1.8,
  },
  {
    p: 35, x: 210, line: 1, branch: 1,
    interact: {
      prompt: 'What stops you changing the past?',
      sort: {
        chip: 'WHAT STOPS YOU',
        bins: [
          { id: 'law', label: 'A LAW OF TIME', reads: 'a law of time steps in to prevent it' },
          { id: 'luck', label: 'BAD LUCK', reads: 'a long run of accidents, every time' },
          { id: 'never', label: 'IT NEVER HAPPENED', reads: 'nothing: it simply never happened', correct: true },
        ],
      },
      explain: 'Nothing steps in, because it never happened. On this view the past already includes whatever you do when you travel to it, so there\'s no second version of events for you to overwrite. You\'re not prevented from changing it; there\'s no changing it to be prevented.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Time Travel and the Fixed Past',
      points: [
        'Changing the past is a contradiction, not a difficulty',
        'Visiting it contradicts nothing',
        'A fixed past means you were always there',
        'A branch is a second history, not a changed one',
      ],
      closing: 'A time traveller may visit the past. What no one can do is make it different from how it was.',
    },
    dur: 3.0,
  },
];
