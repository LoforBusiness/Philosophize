import type { BaseBeat } from './cinematicKit';

// Cinematic epistemology-knowledge-2, "Knowing How and Knowing That".
//
// THE PICTURE: a column of instructions that fills up, and an outcome box beneath
// it that stays empty however full the column gets. Over the lesson the column
// reaches the bottom of the wall and the box is still empty — then the column dims
// and the box fills. The argument is which of the two the box was waiting on.
//
// Q1 is A/B/C/D (intellectualism is a real position and needs reading); Q2 is
// answered on the wall, on the concrete shape the picture already made (H65).
//
// The filename is knowHow* rather than epistemology2*: epistemology2Scene is
// already taken, by the branch's second cinematic lesson, which is a different
// lesson entirely (F45b — the numbering in these filenames is not the lesson id).

export interface KnowHowBeat extends BaseBeat {
  /** Figure gesture (emote code). */ p?: number;
  /** Where the figure stands (stage x). 70 = downstage left, 168 = at the wall. */ x?: number;
  /** How many instruction cards are up: 0…3. */ steps?: number;
  /** 1 = the column has dimmed and the outcome box is filled. */ done?: number;
  /** 1 = the three answer cards are live (Q2). */ pick?: number;
}

export const BEATS: KnowHowBeat[] = [
  {
    p: 164, x: 70,
    text: 'You have read every word ever written about swimming. The physics, the technique, the breathing.',
    dur: 3,
  },
  {
    p: 164, x: 70,
    text: 'Now get in the water.',
    dur: 1.8,
  },
  {
    p: 41, x: 168, steps: 1,
    text: 'Start with one instruction, and make it a good one. Precise, true, and easy to check.',
    cite: 'One step',
    dur: 2.9,
  },
  {
    p: 41, x: 168, steps: 1,
    text: 'Below it, the thing the instruction is for.',
    dur: 1.8,
  },
  {
    p: 40, x: 168, steps: 3,
    text: 'Add the rest. Every line is accurate and you have memorised all of them.',
    cite: 'The whole method',
    dur: 2.7,
  },
  {
    p: 399, x: 168, steps: 3,
    text: 'Look at the box underneath: nothing has arrived in it.',
    dur: 1.9,
  },
  {
    p: 147, x: 124, steps: 3,
    quote: {
      id: 'lq-epistemology-knowledge-2-1',
      text: 'We learn how by practice, schooled indeed by criticism and example, but often quite unaided by any lesson in the theory.',
      author: 'Gilbert Ryle',
      philosopherId: 'gilbert-ryle',
      work: 'The Concept of Mind',
      era: '1949',
      branchSlugs: ['epistemology'],
    },
    dur: 3.8,
  },
  {
    p: 383, x: 168, steps: 3, done: 1,
    text: 'Then the reading stops and the hands move, and the box fills. Ryle\'s point: not one line of that column is what filled it.',
    cite: 'The doing',
    dur: 4.6,
  },
  {
    p: 4, x: 124, steps: 3, done: 1,
    interact: {
      prompt: 'What did memorising actually give you?',
      split: {
        left: 'THE FACTS', right: 'THE SKILL',
        start: 0.04,
        zones: [
          { id: 'skill', upto: 0.32, reads: 'the doing itself, now in the hands' },
          { id: 'both', upto: 0.66, reads: 'half the facts, half the doing' },
          { id: 'facts', upto: 1, reads: 'the facts, and none of the doing', correct: true },
        ],
      },
      explain: 'Nearly all facts. The rival is a serious view — intellectualists argue a skill just is knowing enough facts about how — so the middle is not silly. Ryle answers with the expert who cannot state most of what they do and does it perfectly anyway.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 6, x: 124, steps: 3, done: 1, pick: 1,
    interact: {
      prompt: 'The column is complete and correct. Tap what it still cannot hand you.',
      explain: 'Instructions carry rules and reasons perfectly well. What they cannot hand over is the skill. That is why coaching happens in a pool, not a library.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Two Achievements, Not One',
      points: [
        'Knowing that is stated; knowing how is shown',
        'Experts cannot state most of their own skill',
        'Instructions carry rules, never the capacity',
        'Intellectualists disagree — the debate is live',
      ],
      closing: 'The recipe is not the cooking, and reading it faster will never close the gap.',
    },
    dur: 3.0,
  },
];
