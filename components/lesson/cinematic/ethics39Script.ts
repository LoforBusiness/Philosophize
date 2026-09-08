import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic ethics-ethics-39, "Knowing Better and Doing Worse"
// Theme: THREE STEPS FROM KNOWING TO DOING, AND A TOKEN THAT STOPS ON THE LAST.
//
// Weakness of will is drawn as a staircase between two platforms — KNOWS BETTER
// at the bottom, DOES BETTER at the top — with JUDGE, INTEND and ACT as the three
// steps between them. A token climbs it.
//
// The whole lesson is where that token stops. Socrates said it never stops at
// all, because doing a thing is thinking it best; Aristotle said it stops on the
// last step, with the knowledge present but asleep. The token is on the bottom
// platform while the reader is choosing, so the picture cannot answer the
// question before they do (group O).
//
// GAMIFIED SHAPE:
//   · beat 2  SCENE TARGETS — the three steps, and the reader taps the one the
//     weak-willed person never takes. On the stage because the three steps have
//     to be seen as a sequence, which a pair of cards cannot show.
//   · beat 7  a SORT — one midnight episode dropped into weakness, a change of
//     mind, or a hidden preference. The staircase is the readout: the token runs
//     to the top for a change of mind, never leaves the floor for a preference
//     that was there all along, and stalls on ACT for weakness.
// ─────────────────────────────────────────────────────────────────────────────

export interface Ethics39Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** 1 = the two platforms and the staircase are drawn. */ stair?: number;
  /** 1 = the three steps carry their names. */ rungs?: number;
  /** How far the token has climbed, 0 (the floor) … 1 (the top platform). */ climb?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
}

export const BEATS: Ethics39Beat[] = [
  {
    p: 25, x: 52, stair: 1,
    text: 'It is midnight and you know you should sleep. You press play anyway.',
    dur: 3.6,
  },
  {
    p: 30, x: 52, stair: 1, rungs: 1,
    text: 'Between knowing better and doing better there are three steps. Judge which is better, mean to act, then act.',
    dur: 4.4,
  },
  {
    p: 160, x: 52, stair: 1, rungs: 1, live: 1,
    interact: {
      prompt: 'Tap the step the weak-willed person never takes.',
      explain: 'The last one. Fail the first and this is ignorance rather than weakness, because you never worked out which was better. Fail the second and you never meant to. Weakness of will needs the judgement intact and the act going the other way.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 176, x: 52, stair: 1, rungs: 1, climb: 0.75,
    text: 'So the token gets to the top step and stops. Socrates said no token ever stops there.',
    dur: 4.2,
  },
  {
    p: 383, x: 52, stair: 1, rungs: 1, climb: 0.75,
    text: 'To do a thing is to think it best right now. So the worse act was a mistake about the sums, not a failure of nerve.',
    dur: 4.8,
  },
  {
    p: 6, x: 98, stair: 1, rungs: 1, climb: 0.75,
    text: 'Aristotle would not have it. The knowledge is there, he said, but asleep — held the way a sleeping man holds what he knows.',
    dur: 4.4,
  },
  {
    p: 433, x: 98, stair: 1, rungs: 1, climb: 0.75,
    quote: {
      id: 'lq-ethics-ethics-39-1',
      text: 'I see the better and approve it, and I follow the worse.',
      author: 'Ovid',
      work: 'Metamorphoses',
      era: 'c. 8 AD',
      branchSlugs: ['ethics'],
    },
    dur: 4.0,
  },
  {
    p: 177, x: 98, stair: 1, rungs: 1, climb: 0.75,
    interact: {
      prompt: 'One more episode, at midnight. What is it?',
      sort: {
        chip: 'one more episode',
        bins: [
          { id: 'mind', label: 'a change of mind', reads: 'you decided watching was better after all' },
          { id: 'weak', label: 'weakness of will', reads: 'you still think stopping is better', correct: true },
          { id: 'hidden', label: 'a hidden preference', reads: 'you wanted this all along and would not say so' },
        ],
      },
      explain: 'Weakness of will, and the test is what you would say if somebody asked. You would say stopping is better, and mean it, with your thumb still on the remote. A change of mind answers differently, and a preference you hold is not hidden from you.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'The Last Step',
      points: [
        'Weakness keeps the judgement and drops the act',
        'Socrates denied it was possible at all',
        'Aristotle called the knowledge present but asleep',
        'Test it by asking what you would say right now',
      ],
      closing: 'The difference matters, because the repairs differ. Ignorance wants an argument. Weakness wants a habit, or a locked door.',
    },
    dur: 3.2,
  },
];
