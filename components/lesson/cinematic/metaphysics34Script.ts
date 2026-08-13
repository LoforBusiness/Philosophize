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
    p: 25, x: 58, depth: 0,
    text: 'A table. Solid, obvious, and not in any doubt. Ask the awkward question about it anyway.',
    dur: 3.4,
  },
  {
    p: 4, x: 58, depth: 0, ask: 1,
    text: 'Not what made it, and not who owns it. What holds it up? Not its legs — what makes it a table at all.',
    cite: 'What holds this up?',
    dur: 4.2,
  },
  {
    p: 47, x: 58, depth: 0.25, ask: 1,
    text: 'The wood does. The table is real because the grain is arranged as it is, and philosophers call that grounding rather than causing. The wood is not earlier than the table. It is underneath it.',
    cite: 'Grounding, not causing',
    dur: 5.0,
  },
  {
    p: 19, x: 58, depth: 0.55, ask: 1,
    text: 'So ask the wood the same question, and you get molecules. Ask those and you get atoms, which were named for being the thing you could not cut.',
    cite: 'And under that?',
    dur: 4.6,
  },
  {
    p: 137, x: 58, depth: 0.55,
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
    p: 4, x: 58, depth: 0, live: 1,
    interact: {
      prompt: 'Drag down through the levels. Stop at the first one that rests on nothing below it.',
      drag: {
        lo: 'THE TABLE',
        hi: 'DEEPER',
        start: 0,
        zones: [
          { id: 'stuff', upto: 0.34, reads: 'held up by its grain' },
          { id: 'chem', upto: 0.68, reads: 'held up by its atoms' },
          { id: 'floor', upto: 1, reads: 'nobody has found one', correct: true },
        ],
      },
      explain: 'You can drag as far as anybody ever has and never reach it. Atoms were named for being uncuttable and turned out to have parts. Every floor so far has been somebody else’s ceiling.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 35, x: 58, depth: 1,
    text: 'A level that rests on nothing is what fundamental means. Notice it is not the same as smallest, and not the same as earliest. It is about what holds what up.',
    cite: 'What fundamental means',
    dur: 4.8,
  },
  {
    p: 45, x: 58, depth: 1,
    interact: {
      prompt: 'So must the chain of dependence stop somewhere?',
      cards: [
        { text: 'Not obviously', correct: true },
        { text: 'Yes, or nothing is real', correct: false },
      ],
      explain: 'The other card is a strong intuition and nobody has turned it into a proof. Picture a world that descends forever. Every level real, every level held up by the next. It is hard to imagine and has never been shown impossible.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'All The Way Down?',
      points: [
        'Grounding asks what holds a thing up',
        'Fundamental means resting on nothing further',
        'Every proposed bottom has had a level beneath',
        'Endless descent is strange, not ruled out',
      ],
      closing: 'Physics keeps finding a smaller room. Whether the building has a foundation is not a question physics asks.',
    },
    dur: 3.0,
  },
];
