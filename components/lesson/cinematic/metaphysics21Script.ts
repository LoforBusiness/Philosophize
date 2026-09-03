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
}

export const BEATS: Met21Beat[] = [
  {
    p: 164, x: 200, line: 1, past: 1, future: 1,
    text: 'A line, with you standing on the middle of it. The question is not whether time passes.',
    dur: 3.7,
  },
  {
    p: 164, x: 200, line: 1, past: 1, future: 1,
    text: 'It is what is there.',
    dur: 1.8,
  },
  {
    p: 2, x: 200, line: 1, past: 0.08, future: 0.08,
    text: 'Presentism says only this instant exists. Yesterday is not kept in some other place.',
    cite: 'Presentism',
    dur: 2.8,
  },
  {
    p: 2, x: 200, line: 1, past: 0.08, future: 0.08,
    text: 'Yesterday is nowhere at all, because yesterday is over.',
    dur: 1.8,
  },
  {
    p: 45, x: 132, line: 1, past: 1, future: 0.08,
    text: 'The growing block keeps everything that has happened and says the future is not written yet. The line gets longer.',
    cite: 'The growing block',
    dur: 4.8,
  },
  {
    p: 4, x: 132, line: 1, past: 0.08, future: 0.08, live: 1,
    interact: {
      prompt: 'Tap the part presentism says is real.',
      explain: 'Only the column you are standing in. It is the view most people start with and it has the hardest job: if the past does not exist, it is not obvious what makes a claim about it true, or what your memories are memories of.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 380, x: 132, line: 1, past: 1, future: 1,
    text: 'Eternalism keeps the lot. Every moment is out there, and now is just where you happen to be, like here is where you stand.',
    cite: 'Eternalism',
    dur: 4.8,
  },
  {
    p: 137, x: 268, line: 1, past: 1, future: 1,
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
    text: 'Relativity leans this way. Two observers can disagree about what is happening now. That is awkward if only now exists.',
    dur: 4.8,
  },
  {
    p: 41, x: 268, line: 1, past: 1, future: 1,
    interact: {
      prompt: 'Place eternalism on the two questions.',
      field: {
        xLo: 'PAST: GONE', xHi: 'PAST: REAL',
        yLo: 'FUTURE: OPEN', yHi: 'FUTURE: REAL',
        start: [0.24, 0.24],
        quads: [
          { id: 'presentism', x: 0, y: 0, reads: 'presentism: only now' },
          { id: 'block', x: 1, y: 0, reads: 'the growing block' },
          { id: 'shrink', x: 0, y: 1, reads: 'the shrinking tree, and almost nobody holds it' },
          { id: 'eternal', x: 1, y: 1, reads: 'eternalism: all of it', correct: true },
        ],
      },
      explain: 'Top right: both halves furnished. The corner nobody expects is the other diagonal — a real future and a gone past — and it is a position, just an unpopular one. Seeing that it exists is what the two axes are for.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'What There Is, Not What Moves',
      points: [
        'Presentism: only the present moment exists',
        'The growing block: the past is real, the future is not yet',
        'Eternalism: every moment exists, and now is a location',
        'Relativity makes a universal now hard to defend',
      ],
      closing: 'Two questions, four answers. Most arguments here are about which half you furnish.',
    },
    dur: 3.4,
  },
];
