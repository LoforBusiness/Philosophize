import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic metaphysics-being-33, "Why Does Time Only Go One Way?" — the first
// lesson built on the DRAG mechanic (../DragScale), and the reason that mechanic
// exists: the reader is not picking an answer, they are scrubbing the tower.
//
// A tower of nine blocks stands at centre. Q1 hands the reader the line and the
// blocks come apart under their thumb — and the readout above the knob counts what
// is really being dragged, which is not time but the NUMBER OF WAYS to look like
// this: "one way" → "a few" → "millions" → "more than there are atoms". Finding the
// boundary by dragging IS the argument, so the answer they give is a position.
//
// Q2 goes back to two cards, deliberately: a lesson whose every question worked the
// same way would have traded one monotony for another.
// ─────────────────────────────────────────────────────────────────────────────

export interface Metaphysics33Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /**
   * How far the tower has come apart, 0 standing … 1 rubble. On the drag beat the
   * scene ignores this and reads the knob instead, so the picture IS the answer.
   */ fall?: number;
  /** 1 = the film is labelled as running backwards. */ rev?: number;
  /** 1 = the reader is driving the tower from the rail (Q1). */ live?: number;
}

export const BEATS: Metaphysics33Beat[] = [
  {
    p: 25, x: 62, fall: 0,
    text: 'Nine blocks, stacked. Nothing has happened yet, and nothing about this picture tells you which way time is running.',
    dur: 3.6,
  },
  {
    p: 47, x: 62, fall: 1,
    text: 'Now it falls. You have watched that a thousand times and it needs no explaining.',
    cite: 'The tower goes over',
    dur: 3.4,
  },
  {
    p: 19, x: 62, fall: 1, rev: 1,
    text: 'So run the film backwards. A heap of blocks gathers itself and stands up. You knew that was wrong before you finished reading this sentence.',
    cite: 'The film, reversed',
    dur: 4.4,
  },
  {
    p: 4, x: 62, fall: 1, rev: 1,
    text: 'Here is the strange part. Every single collision in that reversed film is legal. Take any two blocks knocking together and the reverse obeys the same laws exactly.',
    cite: 'Nothing forbids it',
    dur: 4.8,
  },
  {
    p: 137, x: 62, fall: 1,
    quote: {
      id: 'lq-metaphysics-being-33-1',
      text: 'The law that entropy always increases holds, I think, the supreme position among the laws of Nature.',
      author: 'Arthur Eddington',
      work: 'The Nature of the Physical World',
      era: '1928',
      branchSlugs: ['metaphysics'],
    },
    dur: 3.6,
  },
  {
    p: 4, x: 62, fall: 0, live: 1,
    interact: {
      prompt: 'Drag the blocks apart. Stop where a tower stops being one of very few ways to look.',
      drag: {
        lo: 'STACKED',
        hi: 'SCATTERED',
        start: 0,
        // The readout is the lesson. It counts ARRANGEMENTS, not time — so the
        // reader feels the number run away from them as the tower comes apart,
        // which is the whole of Boltzmann in one gesture.
        zones: [
          { id: 'few', upto: 0.3, reads: 'a handful of ways' },
          { id: 'many', upto: 0.62, reads: 'thousands of ways', correct: true },
          { id: 'vast', upto: 1, reads: 'more ways than atoms' },
        ],
      },
      explain: 'Anywhere past the first stretch. The tower is one arrangement out of a few; nudge it and the count explodes. Nothing pushed the blocks toward the messy end — there is simply almost nothing else for them to be.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 35, x: 62, fall: 0.82,
    text: 'That is the whole answer. Order is rare and mess is common. Anything wandering at random wanders into the mess and never happens to wander back.',
    cite: 'Rare and common',
    dur: 4.6,
  },
  {
    p: 45, x: 62, fall: 0.82,
    interact: {
      prompt: 'The equations point neither way. So where does time’s direction come from?',
      cards: [
        { text: 'From how it all started', correct: true },
        { text: 'From the equations', correct: false },
      ],
      explain: 'The other card cannot be right. The equations run backwards perfectly well, which is what the reversed film showed. So the asymmetry has to sit in the starting conditions, and the universe began extraordinarily ordered.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'The Arrow Is In The Counting',
      points: [
        'Every collision runs backwards legally',
        'Ordered states are vastly outnumbered',
        'So things drift to mess and never back',
        'The arrow came from a very ordered start',
      ],
      closing: 'Time does not push you forward. You are drifting into the far larger set of ways things can be.',
    },
    dur: 3.0,
  },
];
