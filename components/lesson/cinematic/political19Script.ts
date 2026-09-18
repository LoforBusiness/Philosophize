import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic political-political-19, "Do We Owe Strangers Anything?"
// Theme: ONE AXIS OF DISTANCE, WITH A FLAT LINE OVER A FALLING ONE.
//
// Singer's argument is a comparison of two quantities across one variable, and
// almost every telling of it buries that under the pond. So the pond is a
// sentence and the stage is the comparison: distance along the bottom, what it
// costs you in the top panel, what you feel you must do in the bottom one.
//
// The top line does not move. The bottom line falls off a cliff. Nothing else
// changes anywhere in the picture, which is the entire claim — the only variable
// is how far away it is, and one of the two things it governs has no business
// being governed by it.
//
// GAMIFIED SHAPE:
//   · beat 5  SCENE TARGETS — two panels, tap the one whose line moves. It is an
//     observation, not a trick, and the explanation is where the argument lands.
//     A question the reader can get right by looking is the right shape here,
//     because the work is in accepting what they have just seen.
//   · beat 7  two CARDS — the strongest objection, which is not selfishness but
//     the demandingness worry that Singer himself takes seriously (H66).
// ─────────────────────────────────────────────────────────────────────────────

export interface Pol19Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** The two panels and the distance axis, 0…1. */ axis?: number;
  /** The flat COST line, 0…1 of its length. */ cost?: number;
  /** The falling OBLIGATION-FELT line, 0…1 of its length. */ pull?: number;
  /** The marker showing where you are standing on the axis, 0…1. */ mark?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
  /** 1 = the axis runs on off the picture: the principle has no stopping point. */ onward?: number;
}

export const BEATS: Pol19Beat[] = [
  {
    p: 462, x: 200, axis: 1,
    text: 'Peter Singer asks you to suppose a child is drowning in a shallow pond at your feet. Saving the child will ruin your shoes.',
    dur: 4.4,
  },
  {
    p: 443, x: 200, axis: 1, cost: 1,
    text: 'The cost of helping is the price of the shoes, and that cost stays the same at any distance.',
    cite: 'The cost',
    dur: 4.4,
  },
  {
    p: 379, x: 132, axis: 1, cost: 1, pull: 1,
    text: 'The sense that you must act, however, weakens as the child gets farther away.',
    cite: 'The felt obligation',
    dur: 4.0,
  },
  {
    p: 383, x: 132, axis: 1, cost: 1, pull: 1, mark: 1,
    text: 'Suppose the child is eight thousand miles away, and the same money would save them just as surely. Only your distance from the child has changed.',
    dur: 4.6,
  },
  {
    p: 4, x: 132, axis: 1, cost: 1, pull: 1, mark: 1, live: 1,
    interact: {
      prompt: 'Does what it costs you change with distance, or only what you feel you must do?',
      explain: 'What you feel you must do is the one that moves. Distance changes that line but not the cost line: the price of helping stays the same near or far. Singer asks what moral difference distance alone could make to what you owe.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 139, x: 268, axis: 1, cost: 1, pull: 1, mark: 1,
    quote: {
      id: 'lq-political-political-19-1',
      text: 'If it is in our power to prevent something bad from happening, without thereby sacrificing anything of comparable moral importance, we ought, morally, to do it.',
      author: 'Peter Singer',
      work: 'Famine, Affluence, and Morality',
      era: '1972',
      philosopherId: 'peter-singer',
      branchSlugs: ['political-philosophy'],
    },
    dur: 4.0,
  },
  {
    p: 380, x: 268, axis: 1, cost: 1, pull: 1, mark: 1,
    onward: 1,
    text: 'The trouble is where that principle stops. Another death can always be prevented at the cost of one more possession.',
    cite: 'The demandingness objection',
    dur: 4.8,
  },
  {
    p: 41, x: 268, axis: 1, cost: 1, pull: 1, mark: 1,
    interact: {
      prompt: 'Which curve shows how much Singer’s principle still asks as you keep giving?',
      plot: {
        axis: 'HOW MUCH IT STILL ASKS',
        cols: ['A LITTLE', 'A LOT', 'HALF OF IT', 'NEARLY ALL'],
        start: [0.5, 0.5, 0.5, 0.5],
        shapes: [
          { id: 'flat', profile: [0.95, 0.93, 0.9, 0.86], reads: 'it keeps asking, however much you give', correct: true },
          { id: 'fall', profile: [0.9, 0.6, 0.3, 0.05], reads: 'it lets go once you have done your share' },
          { id: 'stop', profile: [0.9, 0.9, 0.1, 0.04], reads: 'there is a line you can cross' },
        ],
      },
      explain: 'Singer’s principle keeps asking, however much you give. That is the strongest objection to Singer, and it is not selfishness. A rule demanding your last pound may be true and still impossible to live by. Singer accepts that demand rather than soften the principle.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'What Distance Changes',
      points: [
        'The cost of helping is much the same near and far',
        'How strongly people feel obliged falls with distance',
        'Singer asks what moral difference distance is tracking',
        'The demandingness objection: the principle never lets you stop',
      ],
      closing: 'The cost of helping doesn’t change with distance. Whether the obligation should change is the open question.',
    },
    dur: 3.4,
  },
];
