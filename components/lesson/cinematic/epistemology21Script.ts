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
    p: 25, x: 70,
    text: 'Right now, believe it is raining. Not picture it, not say it — believe it. Take a moment and genuinely try.',
    dur: 4.0,
  },
  {
    p: 41, x: 168, dial: 1,
    text: 'Here is the needle. It sits where your belief actually is, and at the moment it is parked hard against DOUBT. Two trays feed it.',
    cite: 'The gauge',
    dur: 4.6,
  },
  {
    p: 29, x: 124, dial: 1, will: 1,
    text: 'Load the first tray with everything you have — wanting it, deciding it, repeating it, a fortune riding on it. The tray fills. The needle does not move.',
    cite: 'Effort',
    dur: 5.0,
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
    p: 30, x: 168, dial: 1, will: 1, ev: 1,
    text: 'Now one thing in the other tray: rain on the window. You did nothing, wanted nothing, decided nothing — and the needle goes all the way across.',
    cite: 'Evidence',
    dur: 4.8,
  },
  {
    p: 6, x: 124, dial: 1, will: 1, ev: 1, pick: 1,
    interact: {
      prompt: 'One tray moved the needle and one did not. Tap the one that moved it.',
      explain: 'Belief tracks how things seem, not how much you would like them to be. That is why trying is the one thing that never works here — and why it feels so strange that it does not.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 4, x: 124, dial: 1, will: 1, ev: 1,
    mc: {
      prompt: 'So is what you believe entirely out of your hands?',
      options: [
        { id: 'a', text: 'No — you choose what evidence you go and stand in front of', correct: true },
        { id: 'b', text: 'Yes — belief is involuntary, so nothing you do matters', correct: false },
        { id: 'c', text: 'No — with enough discipline you can simply decide', correct: false },
        { id: 'd', text: 'Yes, which makes Clifford\'s demand meaningless', correct: false },
      ],
      explain: 'The trap is "involuntary" sliding into "not my responsibility". Pascal saw the way out: you cannot will a belief, but you do choose the company, habits and reading that decide what reaches the tray.',
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
      closing: 'Nobody chooses a belief directly. Everybody chooses what they read.',
    },
    dur: 3.0,
  },
];
