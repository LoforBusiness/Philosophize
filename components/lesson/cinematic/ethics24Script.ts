import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic ethics-ethics-24, "Why Do We Punish?"
// Theme: FOUR PILLARS UNDER ONE SENTENCE, AND A CASE THAT TAKES THREE AWAY.
//
// Everybody has all four reasons at once and never notices, because in an
// ordinary case all four point the same way. The only way to see which one you
// are actually standing on is a case that removes the others — so the scene is a
// sentence resting on four pillars and a defendant chosen to knock three out.
//
// The pillars are named from the first beat and nothing is hidden. What the
// reader does not know is which of theirs will survive.
//
// GAMIFIED SHAPE:
//   · beat 4  SCENE TARGETS — four pillars, tap the one still holding the
//     sentence up. All four are real theories with real defenders, so the decoys
//     are the rest of the literature rather than filler (H66).
//   · beat 7  a LEVER — the classic objection, thrown rather than picked. The
//     arm has three slots and the middle one is the comfortable answer, which is
//     why it is worth making the reader commit to a position with weight in it.
// ─────────────────────────────────────────────────────────────────────────────

export interface Eth24Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** The sentence slab and its four pillars, 0…1. */ slab?: number;
  /** The names under the pillars, 0…1. */ names?: number;
  /** How many pillars the test case has taken away, 0…1. */ gone?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
}

export const BEATS: Eth24Beat[] = [
  {
    p: 172, x: 200, slab: 1,
    text: 'What justifies a four-year sentence? In an ordinary case, four standard answers all support it.',
    dur: 4.8,
  },
  {
    p: 2, x: 200, slab: 1, names: 1,
    text: 'Incapacitation protects the public by stopping the offender from offending again. General deterrence discourages others from copying the crime.',
    cite: 'Four justifications',
    dur: 2.2,
  },
  {
    p: 2, x: 200, slab: 1, names: 1,
    text: 'Rehabilitation aims to make him a better person. Retribution says he should be punished for what he did.',
    dur: 2.2,
  },
  {
    p: 45, x: 132, slab: 1, names: 1, gone: 1,
    text: 'Consider a man of ninety, ill and harmless, forty years after his crime. He won’t reoffend, needs no reform, and no one will learn of his punishment.',
    cite: 'The test case',
    dur: 4.8,
  },
  {
    p: 383, x: 132, slab: 1, names: 1, gone: 1,
    text: 'Three of the four justifications no longer apply to him. If his sentence still seems right, some other justification must support it.',
    dur: 4.2,
  },
  {
    p: 467, x: 132, slab: 1, names: 1, gone: 1, live: 1,
    interact: {
      prompt: 'Which justification still supports punishing him?',
      explain: 'Desert. Punishing him reforms no one, deters no one and protects no one. Any reason that remains looks back to the crime, not forward to effects. That view is retribution.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 456, x: 268, slab: 1, names: 1, gone: 1,
    quote: {
      id: 'lq-ethics-ethics-24-1',
      text: 'Judicial punishment can never be used merely as a means to promote some other good for the criminal himself or for civil society.',
      author: 'Immanuel Kant',
      work: 'The Metaphysics of Morals',
      era: '1797',
      philosopherId: 'immanuel-kant',
      branchSlugs: ['ethics'],
    },
    dur: 4.0,
  },
  {
    p: 399, x: 268, slab: 1, names: 1, gone: 1,
    text: 'Critics of deterrence turn the test around. Suppose the truth stays hidden, and framing an innocent man would stop others from crime.',
    cite: 'The other direction',
    dur: 4.6,
  },
  {
    p: 442, x: 268, slab: 1, names: 1, gone: 1,
    interact: {
      prompt: 'Which theory, taken alone, would permit punishing an innocent person?',
      sort: {
        chip: 'punishing an innocent person',
        bins: [
          { id: 'deter', label: 'deterrence', reads: 'deterrence alone would permit it', correct: true },
          { id: 'desert', label: 'desert', reads: 'desert would permit it' },
          { id: 'neither', label: 'neither', reads: 'neither theory could permit it' },
        ],
      },
      explain: 'Deterrence. A deterrence theory looks only at the effect on others. If no one knows the truth, punishing an innocent man deters crime as well as punishing a guilty one. Desert forbids it, because the innocent have done nothing to deserve it.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Four Justifications of Punishment',
      points: [
        'Punishment is defended by deterrence, reform, protection and desert',
        'In ordinary cases, all four support the same sentence',
        'A harmless old offender removes every forward-looking reason',
        'Deterrence alone would permit punishing someone innocent',
      ],
      closing: 'If the old man’s sentence still seems right to you, your judgement rests on desert.',
    },
    dur: 3.4,
  },
];
