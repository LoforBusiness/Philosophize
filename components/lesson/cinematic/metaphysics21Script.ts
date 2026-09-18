import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic metaphysics-being-21, "Is the Past Still Out There?"
// Theme: ONE TIMELINE, AND WHICH HALVES OF IT ARE FURNISHED.
//
// Presentism, the growing block and eternalism are three answers to two yes/no
// questions, and every list-shaped telling hides that. Drawn as a line with a
// past half and a future half that can each be solid or empty, the three
// positions are just the three configurations that exist — and the fourth corner
// turns out to be a position too, which is the bit nobody expects.
//
// Nothing here is about time PASSING. The whole question is about what there IS,
// and the scene never animates the line moving, because a line that slides is a
// picture of a different argument.
//
// GAMIFIED SHAPE:
//   · beat 3  SCENE TARGETS — three parts of one line, tap what presentism says
//     is real. Concrete, and it sets up the pad by making the halves the units
//     the reader is already thinking in.
//   · beat 7  a FIELD — the two questions as two axes, four quadrants, and every
//     one of them a named position somebody holds. This is the question the pad
//     was built for.
// ─────────────────────────────────────────────────────────────────────────────

export interface Met21Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** The line, the NOW column and the labels, 0…1. */ line?: number;
  /** How solid the past half is, 0…1. */ past?: number;
  /** How solid the future half is, 0…1. */ future?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
  /** 1 = each stretch of the line is put in question, in the order they are named. */ whichParts?: number;
  /** 1 = yesterday's own box is marked as nowhere at all. */ nowhere?: number;
  /** 1 = two observers' NOWs stand at different places on the line. */ twoNows?: number;
}

export const BEATS: Met21Beat[] = [
  {
    p: 462, x: 200, line: 1, past: 1, future: 1,
    text: 'Represent time as a line, with you standing at the present moment. The question is not whether time passes.',
    dur: 3.7,
  },
  {
    p: 462, x: 200, line: 1, past: 1, future: 1,
    whichParts: 1,
    text: 'It asks which parts of the line exist: the past, the present, the future, or only some of them.',
    dur: 1.8,
  },
  {
    p: 2, x: 200, line: 1, past: 0.08, future: 0.08,
    text: 'Presentism says only this instant exists. Past things aren’t stored in some other region of time.',
    cite: 'Presentism',
    dur: 2.8,
  },
  {
    p: 266, x: 200, line: 1, past: 0.08, future: 0.08,
    nowhere: 1,
    text: 'On this view, yesterday doesn’t exist anywhere. It existed once, and no longer exists at all.',
    dur: 1.8,
  },
  {
    p: 379, x: 132, line: 1, past: 1, future: 0.08,
    text: 'C. D. Broad’s growing block theory holds that the past and present exist, but the future doesn’t exist yet. As time passes, new moments are added.',
    cite: 'The growing block',
    dur: 4.8,
  },
  {
    p: 165, x: 132, line: 1, past: 0.08, future: 0.08, live: 1,
    interact: {
      prompt: 'Which part of the timeline does presentism say exists?',
      explain: 'Now. Presentism says only the present exists, so neither the past nor the future is real. This invites the truthmaker objection: if the past doesn’t exist, what makes true statements about the past true?',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 380, x: 132, line: 1, past: 1, future: 1,
    text: 'Eternalism holds that every moment exists. On this view, the word “now” works like the word “here”: it marks only the speaker’s position in time.',
    cite: 'Eternalism',
    dur: 4.8,
  },
  {
    p: 128, x: 268, line: 1, past: 1, future: 1,
    quote: {
      id: 'lq-metaphysics-being-21-1',
      text: 'The distinction between past, present and future is only a stubbornly persistent illusion.',
      author: 'Albert Einstein',
      work: 'letter to the Besso family',
      era: '1955',
      branchSlugs: ['metaphysics'],
    },
    dur: 3.8,
  },
  {
    p: 395, x: 268, line: 1, past: 1, future: 1,
    twoNows: 1,
    text: 'Einstein’s theory makes it hard to say presentism is true. Two people moving at different speeds do not agree on which events are happening now.',
    dur: 4.8,
  },
  {
    p: 442, x: 268, line: 1, past: 1, future: 1,
    interact: {
      prompt: 'Which theory of time holds that every moment is equally real?',
      poll: {
        options: [
          { id: 'presentism', reads: 'presentism: only the present exists', holders: ['Arthur Prior', 'Ned Markosian'] },
          { id: 'block', reads: 'the growing block: the past and present exist', holders: ['C.D. Broad', 'Michael Tooley'] },
          { id: 'shrink', reads: 'the shrinking block: the present and future exist', holders: ['Roberto Casati', 'Giuliano Torrengo'] },
          { id: 'eternal', reads: 'eternalism: every moment exists', holders: ['Hilary Putnam', 'J.J.C. Smart'], correct: true },
        ],
      },
      explain: 'Eternalism: every moment exists, so past, present and future are equally real. The growing block keeps the past but denies that the future exists yet.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Which Moments Exist',
      points: [
        'Presentism: only the present moment exists',
        'The growing block: past and present exist, the future does not yet',
        'Eternalism: every moment exists, and “now” marks only a position',
        'The relativity of simultaneity makes a single present hard to defend',
      ],
      closing: 'Two questions divide these theories: whether the past exists, and whether the future does. Each of the four combinations has been defended.',
    },
    dur: 3.4,
  },
];
