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
}

export const BEATS: Political34Beat[] = [
  {
    p: 25, x: 50, level: 0, reach: 0,
    text: 'Five rings, from you in the middle out to everybody. Every political question has to be answered in one of them.',
    dur: 3.8,
  },
  {
    p: 47, x: 50, level: 0, reach: 0.1,
    text: 'Some are easy. What you eat for breakfast affects you, so the ring that decides it is the small one, and nobody argues.',
    cite: 'Small effects, small room',
    dur: 4.4,
  },
  {
    p: 19, x: 50, level: 0.15, reach: 0.85,
    text: 'Now a village decides to put its waste in the river. That is a very local decision about something that is not local at all.',
    cite: 'A river runs through forty towns',
    dur: 4.6,
  },
  {
    p: 4, x: 50, level: 1, reach: 0.2,
    text: 'And it goes wrong the other way too. A distant office setting one school’s timetable has all the authority and none of the knowledge.',
    cite: 'And the other way',
    dur: 4.8,
  },
  {
    p: 137, x: 50, level: 1, reach: 0.2,
    quote: {
      id: 'lq-political-political-34-1',
      text: 'It is an injustice to assign to a greater and higher association what lesser and subordinate organizations can do.',
      author: 'Pius XI',
      work: 'Quadragesimo Anno',
      era: '1931',
      branchSlugs: ['political-philosophy'],
    },
    dur: 4.0,
  },
  {
    p: 4, x: 50, level: 0, reach: 0.72, live: 1,
    interact: {
      prompt: 'The dashed ring is how far the effects reach. Drag the deciding ring to match it.',
      drag: {
        lo: 'YOU',
        hi: 'EVERYONE',
        start: 0,
        zones: [
          { id: 'small', upto: 0.4, reads: 'deciding for others' },
          { id: 'match', upto: 0.82, reads: 'the room fits the problem', correct: true },
          { id: 'big', upto: 1, reads: 'too far from the facts' },
        ],
      },
      explain: 'Match the ring to the reach. Decide too small and you impose on people downstream who had no vote. Decide too large and the room deciding has authority without knowing the place it is deciding about.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 35, x: 50, level: 0.72, reach: 0.72,
    text: 'That is subsidiarity, and it has two halves. As small as possible is only the first one. The second is: and no smaller than the problem.',
    cite: 'Subsidiarity',
    dur: 4.8,
  },
  {
    p: 45, x: 50, level: 0.72, reach: 0.72,
    interact: {
      prompt: 'Someone says every choice should be made as locally as possible. Wrong how?',
      cards: [
        { text: 'It drops the second half', correct: true },
        { text: 'Nothing, local is better', correct: false },
      ],
      explain: 'A village dumping waste in the river is deciding very locally about effects that are not local at all. Everyone downstream is governed by a vote they were never in. Local is a floor, not the whole rule.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Match The Room To The Problem',
      points: [
        'Every question has a right size of room',
        'Too high loses local knowledge and consent',
        'Too low imposes on people with no vote',
        'The test is how far the effects reach',
      ],
      closing: 'Next time a political argument stalls, check whether the two sides are really arguing about who gets to answer.',
    },
    dur: 3.0,
  },
];
