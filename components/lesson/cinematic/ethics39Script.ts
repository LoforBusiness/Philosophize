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
  /** 1 = a dashed ring pulses round the JUDGE step — where Socrates puts the error, against the token stalled higher up at ACT. */ blame?: number;
}

export const BEATS: Ethics39Beat[] = [
  {
    p: 25, x: 52, stair: 1,
    text: 'Suppose it’s midnight and you judge that you should sleep. You start another episode anyway.',
    dur: 3.6,
  },
  {
    p: 30, x: 52, stair: 1, rungs: 1,
    text: 'Acting on your better judgement involves three steps: judging which option is better, intending to take it, and acting.',
    dur: 4.4,
  },
  {
    p: 160, x: 52, stair: 1, rungs: 1, live: 1,
    interact: {
      prompt: 'Which of the three steps does a weak-willed person fail to complete?',
      explain: 'Acting. A failure to judge would be ignorance, not weakness. A failure to intend would mean you never meant to act. Weakness of will is a judgement kept and an act that goes against it.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 176, x: 52, stair: 1, rungs: 1, climb: 0.75,
    text: 'On this picture, the weak-willed person judges and intends, but stops before acting. Socrates denied that anyone ever stops there.',
    dur: 4.2,
  },
  {
    p: 383, x: 52, stair: 1, rungs: 1, climb: 0.75, blame: 1,
    text: 'In Plato’s Protagoras, Socrates holds that choosing an act means judging it best at that moment. So a worse choice is an error of judgement, not a failure of will.',
    dur: 4.8,
  },
  {
    p: 6, x: 98, stair: 1, rungs: 1, climb: 0.75,
    text: 'Aristotle disagreed. He holds that the weak-willed person has the knowledge but isn’t using it, like someone asleep or drunk.',
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
      prompt: 'Which category does watching one more episode at midnight fall into?',
      sort: {
        chip: 'one more episode',
        bins: [
          { id: 'mind', label: 'a revised judgement', reads: 'you decided watching was better after all' },
          { id: 'weak', label: 'weakness of will', reads: 'you still think stopping is better', correct: true },
          { id: 'hidden', label: 'a hidden preference', reads: 'you wanted to keep watching and never admitted it' },
        ],
      },
      explain: 'Weakness of will: you still think stopping is better. Asked, you’d say so and mean it, even as you keep watching. A revised judgement would favour watching instead. A hidden preference would mean you never judged stopping better.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'The Last Step',
      points: [
        'Weakness of will keeps the judgement but fails to act',
        'Socrates denied it was possible at all',
        'Aristotle said the knowledge is present but not in use',
        'The test is whether you still judge the other option better',
      ],
      closing: 'The difference matters for how to improve. Ignorance calls for clearer thinking, while weakness calls for habits that help you act on what you judge.',
    },
    dur: 3.2,
  },
];
