import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic metaphysics-being-22, "Could You Have Done Otherwise?"
// Theme: A SET OF POINTS, REWOUND THREE TIMES, ALWAYS TAKING THE SAME BRANCH.
//
// The free-will argument is usually staged as a shouting match between two
// camps. It is better staged as a disagreement about one phrase. Everybody in
// the room agrees the replay went the same way each time. What they disagree
// about is whether "could have done otherwise" was ever asking about the replay.
//
// So the picture is a junction and three identical runs, and it never changes:
// what changes is which reading of the phrase is being applied to it. That is
// why the lever is the right control here — the three answers are not three
// facts, they are three settings of one dial.
//
// GAMIFIED SHAPE:
//   · beat 3  SCENE TARGETS — tap what would have to be different for the other
//     branch to be taken. The junction is the tempting answer, because that is
//     where people locate the freedom (H66), and it is the wrong place.
//   · beat 7  a LEVER — three readings of "could have", and the reader has to
//     find the compatibilist one rather than the one they like.
// ─────────────────────────────────────────────────────────────────────────────

export interface Met22Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** The rails, the junction and the two end plates, 0…1. */ track?: number;
  /** The three replay tokens on the taken branch, 0…1. */ runs?: number;
  /** How faint the untaken branch has gone, 0…1. */ open?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
}

export const BEATS: Met22Beat[] = [
  {
    p: 462, x: 200, track: 1,
    text: 'Suppose you must choose between speaking up and staying quiet. Represent the choice as a railway junction with two branches.',
    dur: 4.4,
  },
  {
    p: 2, x: 200, track: 1, runs: 1,
    text: 'Now imagine the moment replayed, with the same past and the same laws of nature.',
    cite: 'The replay',
    dur: 2.5,
  },
  {
    p: 266, x: 200, track: 1, runs: 1,
    text: 'Determinism holds that the past and the laws of nature fix a single future. So every replay takes the same branch.',
    dur: 2.3,
  },
  {
    p: 447, x: 132, track: 1, runs: 1, open: 1,
    text: 'Hard determinism accepts this and adds that freedom requires a real alternative. So no one is free, and no one deserves blame.',
    dur: 4.8,
  },
  {
    p: 380, x: 132, track: 1, runs: 1, open: 1, live: 1,
    interact: {
      prompt: 'Under determinism, what would have to differ for the other branch to be taken?',
      explain: 'Everything before the junction. Given the same laws, a different outcome requires a different past. The junction marks where the branches divide, but under determinism any difference there needs an earlier cause.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 418, x: 132, track: 1, runs: 1, open: 1,
    text: 'Compatibilism holds that the phrase “could have done otherwise” means you’d have acted differently had you wanted to. On this reading, determinism leaves freedom intact.',
    cite: 'Compatibilism',
    dur: 4.8,
  },
  {
    p: 144, x: 268, track: 1, runs: 1, open: 1,
    quote: {
      id: 'lq-metaphysics-being-22-1',
      text: 'Man is condemned to be free; because once thrown into the world, he is responsible for everything he does.',
      author: 'Jean-Paul Sartre',
      work: 'Existentialism Is a Humanism',
      era: '1946',
      philosopherId: 'jean-paul-sartre',
      branchSlugs: ['metaphysics'],
    },
    dur: 4.2,
  },
  {
    p: 383, x: 268, track: 1, runs: 1, open: 1,
    text: 'Libertarianism about free will holds that a choice could go either way on an exact replay. The luck objection replies that nothing about you then settles which branch is taken.',
    cite: 'The luck objection',
    dur: 4.8,
  },
  {
    p: 41, x: 268, track: 1, runs: 1, open: 1,
    interact: {
      prompt: 'On the compatibilist reading, what does “could have done otherwise” mean?',
      sort: {
        chip: '“could have done otherwise”',
        bins: [
          { id: 'never', label: 'never possible', reads: 'you could not have done otherwise' },
          { id: 'wanted', label: 'if you’d wanted', reads: 'you’d have done otherwise, had you wanted to', correct: true },
          { id: 'full', label: 'same past, different', reads: 'you could have, with the past unchanged' },
        ],
      },
      explain: 'If you’d wanted. Compatibilism keeps determinism and reads the phrase as a conditional. You acted freely if nothing prevented you acting on your wants. The libertarian reading must still explain why an undetermined choice isn’t mere luck.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Three Readings of One Phrase',
      points: [
        'Hard determinism: the past fixes every choice, so no one is free',
        'Compatibilism: freedom is acting on your wants without constraint',
        'Libertarianism: a free choice could differ with the same past',
        'The luck objection: an undetermined choice may not be yours',
      ],
      closing: 'The dispute is not about what happened. It’s about what “could have done otherwise” requires.',
    },
    dur: 3.6,
  },
];
