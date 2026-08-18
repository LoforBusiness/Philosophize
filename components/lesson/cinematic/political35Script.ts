import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic political-political-35, "The Empty Chairs"
// Theme: A ROOM WHERE MOST OF THE SEATS ARE EMPTY AND ALWAYS WILL BE.
//
// Twelve chairs in a row. Three are taken. The other nine belong to people who
// do not exist yet, and the lesson never lets the reader forget the ratio — the
// empty chairs are drawn from the first beat and never leave.
//
// The non-identity problem is played, not described: on beat 5 the policy
// switches and the three occupied chairs move to DIFFERENT seats, because a
// different policy means different people. The reader sees the victim they were
// about to name stop existing.
//
// GAMIFIED SHAPE, and neither ask is a pick-one-of-two:
//   · beat 2  a DRAG — how much does a vote count when its owner is not born?
//     The readout runs from "nothing" to "the same as yours", and the chairs
//     fill in as the reader slides, so the abstraction has a picture.
//   · beat 6  a SCENE TARGET — after the swap, tap the person who was made worse
//     off. Every chair is tappable and none of them is right, which is the only
//     honest way to teach this and the whole reason it is a tap.
// ─────────────────────────────────────────────────────────────────────────────

export interface Political35Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** 1 = the row of chairs is drawn. */ chairs?: number;
  /** How much weight the unborn are given, 0…1 — how filled the empty seats look. */ weight?: number;
  /** 1 = the reader's thumb drives the weight. */ live_w?: number;
  /** 1 = the policy has switched, so a different three are seated. */ swap?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
}

export const BEATS: Political35Beat[] = [
  {
    p: 25, x: 52, chairs: 1,
    text: 'A room where a decision gets made. Three people are in it. Nine of the chairs belong to people who are not born yet.',
    dur: 4.2,
  },
  {
    p: 4, x: 52, chairs: 1, live_w: 1, live: 1,
    interact: {
      prompt: 'Give the empty chairs a weight. Slide until it matches what you actually believe.',
      drag: {
        lo: 'NO SAY AT ALL',
        hi: 'A FULL VOTE EACH',
        start: 0.1,
        zones: [
          { id: 'none', upto: 0.22, reads: 'they can wait their turn' },
          { id: 'some', upto: 0.7, reads: 'a voice, not a veto', correct: true },
          { id: 'full', upto: 1, reads: 'and we are outvoted forever' },
        ],
      },
      explain: 'Slide to the far end and the living are permanently outvoted by everyone who comes after, which no society could run on. Slide to nothing and ten thousand years of waste is a free choice. The interesting part is that almost nobody stops at either end.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 13, x: 52, chairs: 1, weight: 0.5,
    text: 'So far this is just hard. Now here is the part that is strange.',
    dur: 3.0,
  },
  {
    p: 2, x: 52, chairs: 1, weight: 0.5,
    text: 'Pick the reckless policy and the world runs differently. Different jobs, different journeys, different couples meeting. Different children.',
    dur: 4.6,
  },
  {
    p: 21, x: 52, chairs: 1, weight: 0.5, swap: 1,
    text: 'Watch who is in the room now. Not the same three. Under the careful policy these people were never born at all.',
    dur: 4.4,
  },
  {
    p: 4, x: 52, chairs: 1, weight: 0.5, swap: 1, live: 1,
    interact: {
      prompt: 'The future is worse. Tap the person we made worse off.',
      explain: 'There is nobody to tap, and that is the lesson. Everyone in the worse world owes their existence to the choice that made it worse, so not one of them can say they would have been better off. The wrong is obvious and the victim is missing.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 47, x: 126, chairs: 1, weight: 0.5, swap: 1,
    quote: {
      id: 'lq-political-political-35-1',
      text: 'We are the trustees of the earth, not its owners.',
      author: 'Edmund Burke',
      work: 'Reflections on the Revolution in France',
      era: '1790',
      branchSlugs: ['political-philosophy'],
    },
    dur: 3.6,
  },
  {
    p: 35, x: 126, chairs: 1, weight: 0.8, swap: 1,
    text: 'One reply drops the search for a victim. Some choices simply make the world go worse, and that is a reason not to make them.',
    cite: 'Parfit, Reasons and Persons, 1984',
    dur: 4.6,
  },
  {
    summary: {
      title: 'Who Is in the Room',
      points: [
        'Most of the affected are not born yet',
        'Change the policy and you change who is born',
        'So no future person is made worse off',
        'Judging outcomes keeps the wrong without a victim',
      ],
      closing: 'Every generation inherits a world it had no vote in. The only open question is what kind of ancestor that leaves you.',
    },
    dur: 3.2,
  },
];
