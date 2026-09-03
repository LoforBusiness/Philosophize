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
    p: 25, x: 200, track: 1,
    text: 'A moment, drawn as a set of points. The track runs in, and there are two ways out of it.',
    dur: 4.4,
  },
  {
    p: 2, x: 200, track: 1, runs: 1,
    text: 'Rewind and run it again. Same world, same laws, same you.',
    cite: 'The replay',
    dur: 2.5,
  },
  {
    p: 2, x: 200, track: 1, runs: 1,
    text: 'Three times, and it goes the same way each time.',
    dur: 2.3,
  },
  {
    p: 45, x: 132, track: 1, runs: 1, open: 1,
    text: 'Hard determinism stops there. The other branch was never a live option, so nobody deserves blame for missing it.',
    dur: 4.8,
  },
  {
    p: 4, x: 132, track: 1, runs: 1, open: 1, live: 1,
    interact: {
      prompt: 'Tap what would have to differ for the other branch to be taken.',
      explain: 'Something earlier. Given the laws, a different outcome needs a different run-up, which is why people locate their freedom at the junction and cannot find it there. The junction is where the branch is, not where the difference would have to be.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 418, x: 132, track: 1, runs: 1, open: 1,
    text: 'Compatibilism says the phrase was never about the replay. It asks whether you would have gone the other way had you wanted to.',
    cite: 'Compatibilism',
    dur: 4.8,
  },
  {
    p: 137, x: 268, track: 1, runs: 1, open: 1,
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
    p: 13, x: 268, track: 1, runs: 1, open: 1,
    text: 'Libertarians want a replay that really could go the other way. But then nothing about you settles which branch the run takes.',
    cite: 'The luck problem',
    dur: 4.8,
  },
  {
    p: 41, x: 268, track: 1, runs: 1, open: 1,
    interact: {
      prompt: 'Set the lever to what compatibilism means by could have.',
      lever: {
        start: 0,
        stops: [
          { id: 'never', reads: 'could not have done otherwise' },
          { id: 'wanted', reads: 'would have, had you wanted to', correct: true },
          { id: 'full', reads: 'could have, with the past exactly the same' },
        ],
      },
      explain: 'The middle. Compatibilism keeps the replay and rereads the phrase: you were free if nothing stopped you acting on what you wanted. The far setting is the libertarian one. It has to answer why a replay that could go either way is not just luck.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'One Phrase, Three Settings',
      points: [
        'Hard determinism: the replay settles it, and it always goes one way',
        'Compatibilism: free means nothing stopped you doing what you wanted',
        'Libertarianism: the replay itself must be able to differ',
        'The luck problem: an open replay is not obviously your doing',
      ],
      closing: 'The fight is not about what happened. It is about what could have meant.',
    },
    dur: 3.6,
  },
];
