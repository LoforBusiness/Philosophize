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
};

export const BEATS: Political28Beat[] = [
  {
    p: 421, x: 24, cell: 1,
    text: 'The state takes years of a life. Everyone else is forbidden to do anything like it.',
    dur: 4.8,
  },
  {
    p: 179, x: 24, cell: 1,
    text: 'Punishment does on purpose what the law forbids everyone else. So the state needs a reason nobody else can use.',
    dur: 5.0,
  },
  {
    p: 443, x: 24, cell: 1, past: 1,
    text: 'One answer looks back. He did it, so the sentence is what he has earned.',
    dur: 4.6,
  },
  {
    p: 265, x: 24, cell: 1, past: 1, future: 1,
    text: 'The other looks forward. Punish to deter, to protect, and to send somebody back changed.',
    dur: 4.8,
  },
  {
    p: 458, x: 24, cell: 1, past: 1, future: 1,
    text: 'A town is rioting. Framing one innocent man would calm the mob and save many lives.',
    dur: 5.0,
  },
  {
    p: 159, x: 24, cell: 1, past: 1, future: 1, plates: 1, live: 1,
    interact: {
      prompt: 'Tap why the scapegoat case bites a forward-looking theory.',
      explain: 'Good outcomes can justify it. If only results matter, framing one man to stop a riot comes out justified, and most people find that monstrous. Looking back at what somebody did blocks the move outright.',
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
    text: 'Foucault refused the whole frame. He asked not whether prison is justified, but what a prison does.',
    dur: 5.0,
  },
  {
    p: 158, x: 78, cell: 1,
    interact: {
      prompt: 'A reformed offender is harmless now. Which view still sentences him?',
      poll: {
        options: [
          { id: 'desert', reads: 'the sentence is owed for the past act', holders: ['Immanuel Kant'], correct: true },
          { id: 'good', reads: 'no future good, so no warrant to harm', holders: ['consequentialists'] },
          { id: 'power', reads: 'the cell is a machine for making citizens', holders: ['Michel Foucault'] },
        ],
      },
      explain: 'The past act settles it. Kant holds that desert is the whole ground, so a sentence is owed whether or not anybody benefits. A consequentialist would release the man, and Foucault would ask what the prison is really doing.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 317, x: 78, cell: 1, past: 1,
    summary: {
      title: 'The Cage and Its Reasons',
      points: [
        'Retribution looks back at what the offender deserves',
        'Consequentialism looks forward to deterrence and protection',
        'The scapegoat case presses hard on forward-looking views',
        'Foucault asks what a prison does, not whether it is just',
      ],
      closing: 'When a sentence is called deserved, ask whether the past act or the future good is doing the work.',
    },
    dur: 5.0,
  },
];
