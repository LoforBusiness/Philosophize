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
}

export const BEATS: Pol19Beat[] = [
  {
    p: 25, x: 200, axis: 1,
    text: 'A child is drowning in a pond at your feet. You wade in and ruin a good pair of shoes.',
    dur: 4.4,
  },
  {
    p: 2, x: 200, axis: 1, cost: 1,
    text: 'The top panel is what it costs you. Across the whole distance, it is the price of the shoes.',
    cite: 'The cost',
    dur: 4.4,
  },
  {
    p: 45, x: 132, axis: 1, cost: 1, pull: 1,
    text: 'The bottom panel is how strongly you feel you must act. Watch what happens to it.',
    cite: 'The pull',
    dur: 4.0,
  },
  {
    p: 383, x: 132, axis: 1, cost: 1, pull: 1, mark: 1,
    text: 'Same child, same money, same certainty that the money helps. The only thing that changed is where you are standing.',
    dur: 4.6,
  },
  {
    p: 4, x: 132, axis: 1, cost: 1, pull: 1, mark: 1, live: 1,
    interact: {
      prompt: 'Tap the panel whose line moves when only the distance changes.',
      explain: 'The lower one. Distance is doing all the work down there and none of it up here, and Singer asks what moral difference it could be tracking. Not knowing them, not seeing them, and nobody else helping either are facts about you.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 137, x: 268, axis: 1, cost: 1, pull: 1, mark: 1,
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
    p: 21, x: 268, axis: 1, cost: 1, pull: 1, mark: 1,
    text: 'The trouble is where that principle stops. There is always one more preventable death for the price of one more thing you own.',
    cite: 'How far does it go?',
    dur: 4.8,
  },
  {
    p: 41, x: 268, axis: 1, cost: 1, pull: 1, mark: 1,
    interact: {
      prompt: 'Draw how much the rule still asks as you keep giving.',
      plot: {
        axis: 'HOW MUCH IT STILL ASKS',
        cols: ['A LITTLE', 'A LOT', 'HALF OF IT', 'NEARLY ALL'],
        start: [0.5, 0.5, 0.5, 0.5],
        shapes: [
          { id: 'flat', profile: [0.95, 0.93, 0.9, 0.86], reads: 'it keeps asking, however much you have given', correct: true },
          { id: 'fall', profile: [0.9, 0.6, 0.3, 0.05], reads: 'it lets go once you have done your share' },
          { id: 'stop', profile: [0.9, 0.9, 0.1, 0.04], reads: 'there is a line you can cross' },
        ],
      },
      explain: 'Nearly flat, and that is the strongest objection — not selfishness. A rule that demands everything down to your last spare pound may be perfectly true and still unlivable. And a morality nobody can follow gets ignored instead of argued with. Singer knows, and takes the demand anyway.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'What Distance Changes',
      points: [
        'The cost of helping is much the same near and far',
        'How strongly we feel obliged falls away with distance',
        'Singer asks what moral difference distance is tracking',
        'The real objection is that the principle never lets you stop',
      ],
      closing: 'The top line never moved. Deciding whether the bottom one should is the hard part.',
    },
    dur: 3.4,
  },
];
