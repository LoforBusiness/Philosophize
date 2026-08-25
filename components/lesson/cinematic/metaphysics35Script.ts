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
    p: 25, x: 322, line: 1,
    text: 'Here is your life drawn as a line. You are standing at the near end.',
    dur: 3.2,
  },
  {
    p: 13, x: 322, line: 1, arc: 1,
    text: 'Now walk back to 1925. Nothing in the idea of a visit is broken yet. You are a tourist with an unusual travel agent.',
    dur: 4.2,
  },
  {
    p: 4, x: 120, line: 1, arc: 1, knot: 1,
    text: 'So you arrive, and you stop your grandparents meeting. Then you are never born. Then nobody arrives. Then they meet, and you are born, and you arrive.',
    dur: 4.8,
  },
  {
    p: 21, x: 120, line: 1, arc: 1, knot: 1, live: 1,
    tap: {
      prompt: 'Two marks hold the story up. Tap the one your trip needs in order to happen at all.',
      options: [
        { id: 'shot', text: '1925', correct: false },
        { id: 'born', text: '1975', correct: true },
      ],
      explain: 'Your birth. The trip depends on it, and the trip is what undoes it — which is the loop, drawn on the line rather than argued about.',
    },
    dur: 1.0,
  },
  {
    p: 4, x: 120, line: 1, knot: 1, snap: 1,
    quote: {
      id: 'lq-metaphysics-being-35-1',
      text: 'Time travel, I maintain, is possible. The paradoxes are oddities, not impossibilities.',
      author: 'David Lewis',
      work: 'The Paradoxes of Time Travel',
      era: '1976',
      branchSlugs: ['metaphysics'],
    },
    dur: 3.4,
  },
  {
    p: 13, x: 120, line: 1, knot: 1, snap: 1, live: 1,
    interact: {
      prompt: 'Tap the link the story actually breaks.',
      explain: 'The break is at your birth, and only because the trip is meant to make the past come out differently. A visit that was always part of what happened breaks nothing. Changing the past is the contradiction — going there is not.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 47, x: 120, line: 1, branch: 1,
    text: 'One answer keeps the line whole. You were always at 1925, and whatever you did there is already how it went. The gun jams. It always jammed.',
    dur: 4.6,
  },
  {
    p: 35, x: 210, line: 1, branch: 1,
    interact: {
      prompt: 'Drag to what is actually stopping you.',
      drag: {
        lo: 'NOTHING IS STOPPING YOU',
        hi: 'SOMETHING PUSHES BACK',
        start: 1,
        zones: [
          { id: 'never', upto: 0.32, reads: 'nothing pushes; it simply never happened', correct: true },
          { id: 'luck', upto: 0.72, reads: 'a run of bad luck, oddly reliable' },
          { id: 'guard', upto: 1, reads: 'time itself steps in and stops you' },
        ],
      },
      explain: 'Nothing has to push. The past already went one way, so every attempt to make it go otherwise fails, and each failure has its own dull local cause. A jam. A slip. The wrong street. Reliable failure looks like a guardian and needs none.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'The One Thing You Cannot Do',
      points: [
        'Changing the past is a contradiction, not a difficulty',
        'Visiting it contradicts nothing',
        'A fixed past means you were always there',
        'A branch is a second history, not a changed one',
      ],
      closing: 'Go back as often as you like. You cannot make it different, because there is nothing for "different" to be measured against.',
    },
    dur: 3.0,
  },
];
