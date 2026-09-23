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
  /** 1 = a dashed box settles round the wreckage — the eye already knows this is wrong (group AH). */ wreck?: number;
  /** 1 = a check mark ticks onto the box — every collision inside it is still lawful (group AH). */ lawful?: number;
  /** 1 = a two-headed arrow appears above the tower — the laws run the same either way (group AH). */ symLaw?: number;
  /** 1 = a one-way arrow appears above the tower — chance only drifts toward disorder (group AH). */ oneWay?: number;
}

export const BEATS: Metaphysics33Beat[] = [
  {
    p: 172, x: 62, fall: 0,
    text: 'Consider a tower of nine blocks. A single still frame doesn’t show which way time runs.',
    dur: 3.6,
  },
  {
    p: 400, x: 62, fall: 1,
    text: 'Now the tower falls. Everyone has watched towers fall, and the event seems to need no explanation.',
    cite: 'The tower goes over',
    dur: 3.4,
  },
  {
    p: 19, x: 62, fall: 1, rev: 1,
    text: 'Now reverse the film. A scattered heap of blocks assembles itself into a standing tower.',
    cite: 'The film, reversed',
    dur: 2.5,
  },
  {
    p: 169, x: 62, fall: 1, rev: 1, wreck: 1,
    text: 'Anyone can tell at once that the reversed film shows something that doesn’t happen.',
    dur: 1.9,
  },
  {
    p: 467, x: 62, fall: 1, rev: 1, wreck: 1, lawful: 1,
    text: 'Yet every collision in the reversed film obeys the laws of physics. This is the puzzle of time’s arrow.',
    cite: 'Nothing forbids it',
    dur: 2.4,
  },
  {
    p: 467, x: 62, fall: 1, rev: 1, wreck: 1, lawful: 1, symLaw: 1,
    text: 'The basic laws of motion are time-symmetric: any collision run in reverse is also permitted by them.',
    dur: 2.4,
  },
  {
    p: 456, x: 62, fall: 1,
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
    p: 461, x: 62, fall: 0, live: 1,
    interact: {
      prompt: 'As the tower comes apart, how many arrangements look like it?',
      plot: {
        cols: ['STACKED', 'TOPPLING', 'SCATTERED'],
        axis: 'ARRANGEMENTS THAT FIT',
        start: [0.2, 0.2, 0.2],
        shapes: [
          { id: 'many', profile: [0.02, 0.15, 0.45, 0.78, 1], reads: 'more than there are atoms', correct: true },
          { id: 'few', profile: [0.1, 0.12, 0.14, 0.16, 0.18], reads: 'a handful either way' },
          { id: 'fall', profile: [1, 0.7, 0.45, 0.2, 0.05], reads: 'fewer as it falls' },
        ],
      },
      explain: 'More than there are atoms. There\'s essentially one way to be a standing tower and an enormous number of ways to be a heap, which is why the change runs one way. Nothing in the laws forbids the rubble reassembling; the counting does the work.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 167, x: 62, fall: 0.82,
    text: 'This is Ludwig Boltzmann’s explanation of entropy increase. Ordered arrangements are rare, and disordered ones are common.',
    cite: 'Boltzmann’s explanation',
    dur: 2.1,
  },
  {
    p: 167, x: 62, fall: 0.82, oneWay: 1,
    text: 'A system moving at random therefore drifts into disorder and almost never returns to order.',
    dur: 2.5,
  },
  {
    p: 45, x: 62, fall: 0.82,
    interact: {
      prompt: 'If the laws are time-symmetric, where does time’s direction come from?',
      cards: [
        { text: 'From the initial conditions', correct: true },
        { text: 'From the laws of motion', correct: false },
      ],
      explain: 'From the initial conditions. The laws of motion work equally well in reverse, as the reversed film showed. So the direction must come from the low-entropy state in which the universe began.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'The Statistical Arrow of Time',
      points: [
        'The laws of motion are time-symmetric',
        'Ordered arrangements are far outnumbered by disordered ones',
        'So random change leads almost always toward disorder',
        'The arrow traces back to a low-entropy beginning',
      ],
      closing: 'Time’s direction isn’t written into the laws. It comes from counting arrangements and from how the universe began.',
    },
    dur: 3.0,
  },
];
