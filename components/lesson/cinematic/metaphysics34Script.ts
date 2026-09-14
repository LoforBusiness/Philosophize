import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic metaphysics-being-34, "Is There a Bottom Level?" — the DRAG mechanic
// (../DragScale) pointed downward. One frame on a stand; dragging the rail changes
// what is INSIDE it, from a table to its grain to its molecules to its particles
// to a level nobody has seen. The reader descends the stack with their thumb.
//
// The two questions are deliberately different shapes. Q1 is the drag, and its
// honest answer is the deepest zone — every floor anyone has stood on turned out
// to be a ceiling, so "we have not found one" is the true reading rather than a
// joke. Q2 is two cards, because a lesson where every question worked the same
// way would have swapped one monotony for another.
// ─────────────────────────────────────────────────────────────────────────────

export interface Metaphysics34Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** Which level fills the frame, 0 table … 1 the unknown floor. */ depth?: number;
  /** 1 = the "WHAT HOLDS THIS UP?" arrow is drawn under the frame. */ ask?: number;
  /** 1 = the reader is driving the depth from the rail (Q1). */ live?: number;
}

export const BEATS: Metaphysics34Beat[] = [
  {
    p: 462, x: 58, depth: 0,
    text: 'Consider an ordinary table, whose existence no one doubts.',
    dur: 1.9,
  },
  {
    p: 462, x: 58, depth: 0,
    text: 'Even so, metaphysics asks what the table’s existence depends on.',
    dur: 1.8,
  },
  {
    p: 457, x: 58, depth: 0, ask: 1,
    text: 'The question isn’t what caused the table or who owns it. It asks what the table’s existence rests on.',
    cite: 'What holds this up?',
    dur: 2.5,
  },
  {
    p: 457, x: 58, depth: 0, ask: 1,
    text: 'The answer isn’t the legs. What makes the object a table is something else.',
    dur: 1.8,
  },
  {
    p: 440, x: 58, depth: 0.25, ask: 1,
    text: 'The table exists because its wood is arranged in a certain way. Philosophers call this relation grounding.',
    cite: 'Grounding, not causing',
    dur: 3.3,
  },
  {
    p: 399, x: 58, depth: 0.25, ask: 1,
    text: 'Grounding isn’t causation: the wood doesn’t come before the table. It lies underneath, at a more basic level.',
    dur: 1.8,
  },
  {
    p: 384, x: 58, depth: 0.55, ask: 1,
    text: 'Asked of the wood, the question leads to molecules and atoms. The word atom means uncuttable in Greek.',
    cite: 'And under that?',
    dur: 4.6,
  },
  {
    p: 465, x: 58, depth: 0.55,
    quote: {
      id: 'lq-metaphysics-being-34-1',
      text: 'The task of metaphysics is to say what grounds what.',
      author: 'Jonathan Schaffer',
      work: 'On What Grounds What',
      era: '2009',
      branchSlugs: ['metaphysics'],
    },
    dur: 3.4,
  },
  {
    p: 461, x: 58, depth: 0, live: 1,
    interact: {
      prompt: 'Which level has been shown to rest on nothing below it?',
      drag: {
        lo: 'THE TABLE',
        hi: 'DEEPER',
        start: 0,
        zones: [
          { id: 'stuff', upto: 0.34, reads: 'the grain, which holds up the table' },
          { id: 'chem', upto: 0.68, reads: 'the atoms, which hold up the grain' },
          { id: 'floor', upto: 1, reads: 'no level found so far', correct: true },
        ],
      },
      explain: 'No level found so far. Atoms were named as uncuttable, yet they turned out to have parts. Each proposed bottom level has so far had a level beneath it.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 167, x: 58, depth: 1,
    text: 'A level that rests on nothing is what fundamental means. This differs from being smallest or earliest.',
    cite: 'What fundamental means',
    dur: 3.7,
  },
  {
    p: 167, x: 58, depth: 1,
    text: 'Fundamentality is about which things depend on which.',
    dur: 1.8,
  },
  {
    p: 379, x: 58, depth: 1,
    interact: {
      prompt: 'Must every chain of grounding end at a fundamental level?',
      cards: [
        { text: 'Not proven either way', correct: true },
        { text: 'Yes, or nothing would be real', correct: false },
      ],
      explain: 'Not proven either way. The claim that an endless chain leaves nothing real is a strong intuition, but no one has proved it. An infinitely descending world, each level grounded in the next, hasn’t been shown impossible.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Grounding and Fundamentality',
      points: [
        'Grounding: what a thing’s existence depends on',
        'Fundamental means resting on nothing further',
        'Every proposed bottom level has had a level beneath',
        'Endless descent is counterintuitive but not ruled out',
      ],
      closing: 'Physics keeps finding smaller parts. Whether reality has a fundamental level isn’t a question experiment alone can settle.',
    },
    dur: 3.0,
  },
];
