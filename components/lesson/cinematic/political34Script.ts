import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic political-political-34, "Who Should Decide This?" — the DRAG mechanic
// (../DragScale) climbing a ladder of jurisdictions.
//
// Nested rings: you, your street, your town, your country, everyone. Dragging
// widens which ring is lit, and a second mark shows how far the DECISION'S EFFECTS
// reach — which does not move. The lesson is the gap between the two, and the
// reader closes it themselves.
//
// This is the only lesson in the set whose drag is graded against something else
// on the stage rather than against a fixed band: the correct zone is the one that
// matches the effects ring, which is exactly the principle being taught.
// ─────────────────────────────────────────────────────────────────────────────

export interface Political34Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** Which ring is making the decision, 0 (you) … 1 (everyone). */ level?: number;
  /** How far the effects reach, 0 … 1. Drawn as a fixed mark. */ reach?: number;
  /** 1 = the reader is driving the level from the rail (Q1). */ live?: number;
  /** 1 = the effects are marked as running past the ring that is deciding. */ exceed?: number;
}

export const BEATS: Political34Beat[] = [
  {
    p: 172, x: 50, level: 0, reach: 0,
    text: 'Decisions can be taken at levels from the individual to all humanity. Each question is settled at one.',
    dur: 3.8,
  },
  {
    p: 407, x: 50, level: 0, reach: 0.1,
    text: 'Some cases are easy. Your breakfast affects only you, so you alone should decide it.',
    cite: 'Effects confined to you',
    dur: 4.4,
  },
  {
    p: 384, x: 50, level: 0.15, reach: 0.85,
    text: 'Suppose a village dumps its waste into a river. The decision is local, but the pollution reaches downstream towns.',
    cite: 'Effects beyond the village',
    dur: 4.6,
  },
  {
    p: 457, x: 50, level: 1, reach: 0.2,
    text: 'The opposite error also occurs. A distant ministry setting one school’s timetable has authority but lacks local knowledge.',
    cite: 'The opposite error',
    dur: 4.8,
  },
  {
    p: 137, x: 50, level: 1, reach: 0.2,
    quote: {
      id: 'lq-political-political-34-1',
      text: '…it is an injustice and at the same time a grave evil … to assign to a greater and higher association what lesser and subordinate organizations can do.',
      author: 'Pius XI',
      work: 'Quadragesimo Anno',
      era: '1931',
      branchSlugs: ['political-philosophy'],
    },
    dur: 4.0,
  },
  {
    p: 455, x: 50, level: 0, reach: 0.72, live: 1,
    interact: {
      prompt: 'As the decision is taken further away, which shape does it take?',
      plot: {
        cols: ['ONE STREET', 'THE REGION', 'FAR OFF'],
        axis: 'HOW WELL IT DECIDES',
        start: [0.3, 0.3, 0.3],
        shapes: [
          { id: 'match', profile: [0.25, 0.65, 0.95, 0.55, 0.2], reads: 'best where it matches the reach', correct: true },
          { id: 'local', profile: [1, 0.78, 0.55, 0.3, 0.1], reads: 'the more local the better' },
          { id: 'far', profile: [0.1, 0.3, 0.55, 0.8, 1], reads: 'the higher up the better' },
        ],
      },
      explain: 'Best where the level matches the reach. Decided too locally and the people downstream have no say; decided too far off and nobody involved knows the ground. Subsidiarity is that match rather than a general preference for the local.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 167, x: 50, level: 0.72, reach: 0.72,
    text: 'That is subsidiarity, and it has two halves. The first assigns each decision to the lowest competent level.',
    cite: 'Subsidiarity',
    dur: 3.1,
  },
  {
    p: 167, x: 50, level: 0.72, reach: 0.72,
    exceed: 1,
    text: 'The second says a higher level should act when a problem’s effects exceed what a lower level can handle.',
    dur: 1.8,
  },
  {
    p: 447, x: 50, level: 0.72, reach: 0.72,
    interact: {
      prompt: 'What is wrong with deciding every question as locally as possible?',
      cards: [
        { text: 'Local decisions can cost outsiders', correct: true },
        { text: 'Nothing, since local is always better', correct: false },
      ],
      explain: 'Local decisions can cost outsiders. A village that dumps waste in a river decides alone, but towns downstream bear the cost. The right level is the lowest one that covers all the effects.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'The Principle of Subsidiarity',
      points: [
        'Each decision belongs at a suitable level',
        'Too high loses local knowledge and consent',
        'Too low imposes on people with no vote',
        'The test is how far the effects reach',
      ],
      closing: 'Many political disputes turn on which level of government should decide.',
    },
    dur: 3.0,
  },
];
