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
    p: 13, x: 322, line: 1, arc: 1,
    text: 'Being present in 1925 need not change any event that happened there.',
    dur: 1.8,
  },
  {
    p: 457, x: 120, line: 1, arc: 1, knot: 1,
    text: 'Suppose that in 1925 you shoot your grandfather before he meets your grandmother. Then you’re never born.',
    dur: 2.5,
  },
  {
    p: 457, x: 120, line: 1, arc: 1, knot: 1,
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
    p: 47, x: 120, line: 1, branch: 1,
    text: 'Your attempt fails for an ordinary reason, such as a jammed gun. In the only consistent history, it never succeeded.',
    dur: 1.8,
  },
  {
    p: 35, x: 210, line: 1, branch: 1,
    interact: {
      prompt: 'On this view, what prevents you from changing the past?',
      drag: {
        lo: 'NO FORCE AT ALL',
        hi: 'A FORCE THAT INTERVENES',
        start: 1,
        zones: [
          { id: 'never', upto: 0.32, reads: 'no force, since it never happened', correct: true },
          { id: 'luck', upto: 0.72, reads: 'a reliable run of bad luck' },
          { id: 'guard', upto: 1, reads: 'a law of time that intervenes' },
        ],
      },
      explain: 'No force, since it never happened. The past already went one way, so every attempt to change it fails. Each failure has an ordinary local cause, and no special force is needed.',
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
