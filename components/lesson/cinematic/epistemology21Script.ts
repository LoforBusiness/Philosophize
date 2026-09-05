import type { BaseBeat } from './cinematicKit';

// Cinematic epistemology-knowledge-21, "Try To Believe It Is Raining".
//
// THE PICTURE: a belief needle with two trays feeding it. He loads the WILL tray
// until it is full and the needle does not move a unit; one item goes into the
// EVIDENCE tray and the needle swings the whole way. The argument is which tray the
// needle is attached to, and the reader watches it be attached to the other one.
//
// Q1 is answered on the gauge (which tray moved it — the picture just showed you);
// Q2 is A/B/C/D, because "so is belief out of your hands" is the one that needs
// reading (E34).

export interface Epi21Beat extends BaseBeat {
  /** Figure gesture (emote code). */ p?: number;
  /** Where the figure stands (stage x). 70 = downstage left, 168 = at the gauge. */ x?: number;
  /** The gauge is up, 0..1. */ dial?: number;
  /** How loaded the WILL tray is, 0..1 — effort, which the needle ignores. */ will?: number;
  /** How loaded the EVIDENCE tray is, 0..1 — the only thing the needle answers to. */ ev?: number;
  /** 1 = the three answer cards are live (Q1). */ pick?: number;
}

export const BEATS: Epi21Beat[] = [
  {
    p: 164, x: 70,
    text: 'Right now, believe that rain is falling outside. Not picture rain, not say the words.',
    dur: 2.9,
  },
  {
    p: 164, x: 70,
    text: 'Take a moment and genuinely try.',
    dur: 1.8,
  },
  {
    p: 41, x: 168, dial: 1,
    text: 'Here is the needle. It sits where your belief actually is, and at the moment it is parked hard against DOUBT.',
    cite: 'The gauge',
    dur: 3.9,
  },
  {
    p: 41, x: 168, dial: 1,
    text: 'Two trays feed it.',
    dur: 1.8,
  },
  {
    p: 29, x: 124, dial: 1, will: 1,
    text: 'Load the first tray with everything you have. Wanting rain.',
    cite: 'Effort',
    dur: 1.8,
  },
  {
    p: 29, x: 124, dial: 1, will: 1,
    text: 'Deciding on rain. Saying the words again.',
    dur: 1.8,
  },
  {
    p: 29, x: 124, dial: 1, will: 1,
    text: 'A fortune riding on the answer. The tray fills and the needle does not move.',
    dur: 2.3,
  },
  {
    p: 141, x: 124, dial: 1, will: 1,
    quote: {
      id: 'lq-epistemology-knowledge-21-1',
      text: 'It is wrong always, everywhere, and for anyone, to believe anything upon insufficient evidence.',
      author: 'William Kingdon Clifford',
      work: 'The Ethics of Belief',
      era: '1877',
      branchSlugs: ['epistemology'],
    },
    dur: 3.6,
  },
  {
    p: 384, x: 168, dial: 1, will: 1, ev: 1,
    text: 'Now one thing in the other tray: rain on the window. You did nothing, wanted nothing, decided nothing — and the needle goes all the way across.',
    cite: 'Evidence',
    dur: 4.8,
  },
  {
    p: 6, x: 124, dial: 1, will: 1, ev: 1, pick: 1,
    interact: {
      prompt: 'One tray moved the needle and one did not. Tap the one that moved it.',
      explain: 'Belief tracks how the world seems, not how much you want the world to be that way. Trying is the one move that never works here, and the failure of trying is the strange part.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 4, x: 124, dial: 1, will: 1, ev: 1,
    interact: {
      prompt: 'How much of what you believe is up to you?',
      drag: {
        lo: 'NONE OF IT',
        hi: 'YOU SIMPLY DECIDE',
        start: 0,
        zones: [
          { id: 'none', upto: 0.28, reads: 'you cannot choose at all' },
          { id: 'inputs', upto: 0.74, reads: 'you choose what you look at', correct: true },
          { id: 'will', upto: 1, reads: 'you choose beliefs like clothes' },
        ],
      },
      explain: 'The middle. The near end slides from involuntary to not my responsibility, and Pascal saw the way past it. You cannot will yourself into believing. But you do choose the company, the habits and the reading that decide what ever reaches the tray.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'You Steer It Sideways',
      points: [
        'You cannot believe something at will',
        'Belief answers to evidence, not to wanting',
        'You do choose what evidence you meet',
        'That is where the responsibility lives',
      ],
      closing: 'Nobody picks a belief the way you pick a shirt. But everybody picks what they read.',
    },
    dur: 3.0,
  },
];
