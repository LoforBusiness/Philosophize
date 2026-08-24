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
    p: 25, x: 200, slab: 1,
    text: 'A sentence, and the four things people say it is for. In an ordinary case all four agree, so nobody has to choose.',
    dur: 4.8,
  },
  {
    p: 2, x: 200, slab: 1, names: 1,
    text: 'Stop him doing it again. Stop others copying him. Make him better. Give him what he has coming.',
    cite: 'The four',
    dur: 4.4,
  },
  {
    p: 45, x: 132, slab: 1, names: 1, gone: 1,
    text: 'Now a man of ninety, forty years after the crime, ill and plainly harmless. He will not reoffend and nobody is watching.',
    cite: 'The test case',
    dur: 4.8,
  },
  {
    p: 13, x: 132, slab: 1, names: 1, gone: 1,
    text: 'Three of the four pillars have nothing left to hold. The sentence has not stopped feeling right.',
    dur: 4.2,
  },
  {
    p: 4, x: 132, slab: 1, names: 1, gone: 1, live: 1,
    interact: {
      prompt: 'Tap the pillar still holding the slab up.',
      explain: 'Desert. Nothing is prevented, nobody is deterred and there is no one to protect, so if the sentence still seems right the reason is backward-looking. That is retribution, and most people find they hold it whether or not they would say so.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 137, x: 268, slab: 1, names: 1, gone: 1,
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
    p: 21, x: 268, slab: 1, names: 1, gone: 1,
    text: 'The other side has a case that runs the same trick backwards. It is the reason nobody holds deterrence on its own.',
    cite: 'The other direction',
    dur: 4.6,
  },
  {
    p: 41, x: 268, slab: 1, names: 1, gone: 1,
    interact: {
      prompt: 'Framing one innocent man would stop a riot. Which view permits it?',
      lever: {
        start: 1,
        stops: [
          { id: 'deter', reads: 'deterrence alone would allow it', correct: true },
          { id: 'desert', reads: 'desert would allow it' },
          { id: 'neither', reads: 'neither could allow it' },
        ],
      },
      explain: 'Deterrence on its own. If the point of punishing is the effect on everybody else, an innocent man will serve as well as a guilty one when nobody knows. Desert forbids it outright, because he has nothing coming. That is why almost nobody holds either theory alone.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'What The Sentence Rests On',
      points: [
        'Punishment is defended by deterrence, reform, protection and desert',
        'Ordinary cases hide which one you are actually using',
        'A harmless old offender removes every forward-looking reason',
        'Deterrence alone would permit punishing someone innocent',
      ],
      closing: 'Three pillars gone and the sentence still stood. That is worth knowing about yourself.',
    },
    dur: 3.4,
  },
];
