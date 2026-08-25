import type { BaseBeat } from './cinematicKit';

// Cinematic epistemology-knowledge-17, "When Science Changes Its Mind"
//
// THE PICTURE: a field of facts that never move, and a frame drawn round some of
// them. Anomalies collect outside the frame until it will not hold, and then a
// SECOND frame is drawn in a different place — over the same facts, not one of
// which has changed (H64).
//
// Kuhn is routinely read as saying science is arbitrary, and the picture is the
// cheapest defence against that: every dot stays exactly where it was. What moved
// was the boundary around them, which is a real thing to move and not a licence to
// believe anything.
//
// STAGING: the Q1 decoys are the two answers a reader gives before Kuhn — that the
// facts changed, or that better instruments found new ones. Both are what actually
// happens in ordinary science, which is why they are tempting here (H66).

export interface Epi17Beat extends BaseBeat {
  /** Figure gesture (emote code). */ g?: number;
  /** The field of facts, 0…1. */ facts?: number;
  /** The old frame around them, 0…1. */ frame?: number;
  /** How many anomalies have collected outside it, 0…3. */ odd?: number;
  /** The new frame, drawn over the same facts, 0…1. */ shift?: number;
  /** 1 = the three boards are live targets (Q1). */ pick?: number;
}

export const BEATS: Epi17Beat[] = [
  {
    g: 25, facts: 1, frame: 1,
    dur: 4.6,
    text: 'A field of facts, and a frame drawn round the ones a theory accounts for. Inside the frame, everything behaves.',
  },
  {
    g: 45, facts: 1, frame: 1, odd: 3,
    dur: 4.8,
    text: 'Then the awkward results pile up outside the frame. Nobody throws the frame away. They patch the frame, add a circle, and patch it again.',
    cite: 'Anomalies',
  },
  {
    g: 13, facts: 1, frame: 1, odd: 3,
    dur: 4.6,
    text: 'Kuhn looked at what actually happened in history. Most of science is not testing the frame. It is working comfortably inside one.',
    cite: 'Normal science',
  },
  {
    g: 137, facts: 1, frame: 1, odd: 3,
    dur: 3.8,
    quote: {
      id: 'lq-epistemology-knowledge-17-1',
      text: 'The successive transition from one paradigm to another via revolution is the usual developmental pattern of mature science.',
      author: 'Thomas Kuhn',
      work: 'The Structure of Scientific Revolutions',
      era: '1962',
      philosopherId: 'thomas-kuhn',
      branchSlugs: ['epistemology'],
    },
  },
  {
    g: 21, facts: 1, frame: 1, odd: 3, shift: 1,
    dur: 5.0,
    text: 'Then the whole thing goes at once. Copernicus moved the sun to the middle, and every fact on the board reorganised without one of them moving.',
    cite: 'The revolution',
  },
  {
    g: 4, facts: 1, frame: 1, odd: 3, shift: 1, pick: 1,
    dur: 1.0,
    interact: {
      prompt: 'Tap what changed when the paradigm did.',
      explain: 'The frame. Every dot is exactly where it was before the second one was drawn. Kuhn is not saying the facts are up for grabs. He is saying they arrive with a boundary already round them, and revolutions move the boundary.',
      xp: 5,
    },
  },
  {
    g: 41, facts: 1, frame: 1, odd: 3, shift: 1,
    dur: 1.0,
    interact: {
      prompt: 'What comes between normal science and a revolution?',
      cards: [
        { text: 'Anomalies piling into a crisis', correct: true },
        { text: 'One decisive experiment', correct: false },
      ],
      explain: 'The other card is the version everybody is taught, and Kuhn spent a book arguing against it. Single experiments are absorbed, explained away or set aside for later. What ends a paradigm is the weight of everything it could not fit, over years.',
      xp: 5,
    },
  },
  {
    summary: {
      title: 'When The Frame Moves',
      points: [
        'Normal science solves puzzles inside a shared paradigm',
        'Anomalies accumulate until the framework is in crisis',
        'A revolution replaces the frame, not the facts',
        'Knowledge does not only grow by adding bricks',
      ],
      closing: 'The facts had not changed. Afterwards the scientists were working in a different world.',
    },
    dur: 3.0,
  },
];
