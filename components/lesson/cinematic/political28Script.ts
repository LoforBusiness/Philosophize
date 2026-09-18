import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic political-political-28, "Why The State May Punish"
// Theme: A CELL, AND THE TWO REASONS ANYBODY GIVES FOR SHUTTING THE DOOR.
//
// The cell is drawn once and never changes, because nothing about the argument
// is a claim about prisons. What changes is which board above it is lit — the
// past act, or the future good — and that is the whole quarrel put on a stage.
//
// The third answer gets a mark of its own rather than a share of the other two,
// because Foucault is not offering a third justification. He is refusing the
// question, and an eye over the cell is what refusing it looks like.
//
// GAMIFIED SHAPE:
//   · beat 5  SCENE TARGETS — three plates, and the reader taps why the scapegoat
//     case bites a forward-looking theory. On the stage because both boards are
//     lit above the cell and the answer is about one of them.
//   · beat 8  a POLL — which view still says a reformed man owes a sentence, and
//     who held it. The boards answer, so a position is a light in the picture.
// ─────────────────────────────────────────────────────────────────────────────

export interface Political28Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** 1 = the cell and the two boards over it are drawn. */ cell?: number;
  /** How lit the backward-looking board is, 0…1. */ past?: number;
  /** How lit the forward-looking board is, 0…1. */ future?: number;
  /** How far the watching eye above the cell has opened, 0…1. */ watch?: number;
  /** 1 = the three plates the reader chooses between are up. */ plates?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
  /** 1 = a ring marks the cell — the act that would be a crime for anyone else (group AH). */ mark?: number;
  /** 1 = a row of lives beside one framed man appears — the scapegoat case (group AH). */ crowd?: number;
};

export const BEATS: Political28Beat[] = [
  {
    p: 421, x: 24, cell: 1,
    text: 'A prison sentence takes years from a person’s life. If anyone else did this, it would be a crime.',
    dur: 4.8,
  },
  {
    p: 179, x: 24, cell: 1, mark: 1,
    text: 'Punishment does on purpose what the law forbids everyone else. So the state needs a justification that no private person could give.',
    dur: 5.0,
  },
  {
    p: 443, x: 24, cell: 1, past: 1,
    text: 'Retributivism looks back to the crime. The offender deserves punishment because of what he did.',
    dur: 4.6,
  },
  {
    p: 265, x: 24, cell: 1, past: 1, future: 1,
    text: 'Consequentialism looks forward. Punishment is justified if it deters crime, protects the public or reforms the offender.',
    dur: 4.8,
  },
  {
    p: 458, x: 24, cell: 1, past: 1, future: 1, crowd: 1,
    text: 'Suppose a town is rioting over a crime. Framing one innocent man would end the riot and save many lives.',
    dur: 5.0,
  },
  {
    p: 159, x: 24, cell: 1, past: 1, future: 1, plates: 1, live: 1,
    interact: {
      prompt: 'Why does the scapegoat case trouble a forward-looking theory of punishment?',
      explain: 'Good outcomes can justify it. If only results count, framing one innocent man to end a riot could be right. Desert rules that out, since the innocent deserve no punishment.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 437, x: 78, cell: 1, past: 1, future: 1,
    quote: {
      id: 'lq-political-political-28-1',
      text: 'Juridical punishment can never be administered merely as a means for promoting another good, but must in all cases be imposed only because the individual has committed a crime.',
      author: 'Immanuel Kant',
      work: 'The Metaphysics of Morals',
      era: '1797',
      philosopherId: 'immanuel-kant',
      branchSlugs: ['political-philosophy'],
    },
    dur: 5.0,
  },
  {
    p: 454, x: 78, cell: 1, past: 1, future: 1, watch: 1,
    text: 'Michel Foucault set aside the question of whether prison is justified. In Discipline and Punish, he studied how prisons observe and discipline the people they hold.',
    dur: 5.0,
  },
  {
    p: 158, x: 78, cell: 1,
    interact: {
      prompt: 'Which view requires punishing an offender even when no future good would come of it?',
      poll: {
        options: [
          { id: 'desert', reads: 'punishment is owed for the past crime', holders: ['Immanuel Kant'], correct: true },
          { id: 'good', reads: 'punishment is justified only by its future benefits', holders: ['Jeremy Bentham'] },
          { id: 'power', reads: 'ask what prisons do, not whether they’re justified', holders: ['Michel Foucault'] },
        ],
      },
      explain: 'Punishment is owed for the past crime. For Kant, desert alone grounds punishment, whether or not anyone benefits. A theory based on future good would let the offender go.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 317, x: 78, cell: 1, past: 1,
    summary: {
      title: 'Justifying Punishment',
      points: [
        'Retribution looks back at what the offender deserves',
        'Consequentialism looks forward to deterrence and protection',
        'The scapegoat case presses hard on forward-looking views',
        'Foucault asks what a prison does, not whether it is just',
      ],
      closing: 'A theory of punishment must say whether its justification lies in the past crime or in future benefits.',
    },
    dur: 5.0,
  },
];
