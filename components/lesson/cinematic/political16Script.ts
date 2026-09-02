import type { BaseBeat } from './cinematicKit';

// Cinematic political-political-16, "Marx and the Stolen Self"
//
// THE PICTURE: a worker wired to four things by four cords, and the lesson is the
// cords being cut. Not one of them is money (H64).
//
// Alienation gets flattened into "bad job" or "underpaid" almost every time it is
// explained, and the reason is that the four-fold structure arrives as a list.
// Drawn as four separate cables from one person, the structure is the picture, and
// the deck question — would a raise reconnect any of these — has an answer the
// reader can see rather than take on trust.
//
// STAGING: the four cords are the Q1 targets, so the reader has to place a specific
// grievance on a specific cord (H66). "The boss sets the pace" is not the same
// severing as "you will never own the car", and telling them apart is the lesson.

export interface Pol16Beat extends BaseBeat {
  /** Figure gesture (emote code). */ g?: number;
  /** How many cords are drawn, 0…4. */ cords?: number;
  /** How many of them have been cut, 0…4. */ cut?: number;
  /** 1 = the four cords are live targets (Q1). */ pick?: number;
}

export const BEATS: Pol16Beat[] = [
  {
    g: 25, cords: 4,
    dur: 2.3,
    text: 'You fit the same bolt all day. Four things are wired to that work.',
  },
  {
    g: 25, cords: 4,
    dur: 2.5,
    text: 'The thing you make, the doing of it, what you could be, everyone beside you.',
  },
  {
    g: 45, cords: 4, cut: 2,
    dur: 4.2,
    text: 'The car goes to the company and you could not afford one. The line sets the pace and you cannot stop it.',
    cite: 'Product and process',
  },
  {
    g: 45, cords: 4, cut: 2,
    dur: 1.8,
    text: 'Two cords gone.',
  },
  {
    g: 13, cords: 4, cut: 4,
    dur: 5.0,
    text: 'The other two follow. Nothing you could have made is being made, and the people beside you are competitors for the same shift.',
    cite: 'And the other two',
  },
  {
    g: 137, cords: 4, cut: 4,
    dur: 3.8,
    quote: {
      id: 'lq-political-political-16-1',
      text: 'The worker therefore only feels himself outside his work, and in his work feels outside himself.',
      author: 'Karl Marx',
      work: 'Economic and Philosophic Manuscripts',
      era: '1844',
      philosopherId: 'karl-marx',
      branchSlugs: ['political-philosophy'],
    },
  },
  {
    g: 5, cords: 4, cut: 4,
    dur: 4.8,
    text: 'Marx says none of that is about the wage. It follows from who owns the machines and who decides what happens on the floor.',
    cite: 'Where it comes from',
  },
  {
    g: 4, cords: 4, cut: 4, pick: 1,
    dur: 1.0,
    interact: {
      prompt: 'The line sets the pace and you cannot stop. Tap the cord that cuts.',
      explain: 'The work itself. Not setting your own pace severs you from the activity while you are inside it. That is why the day feels survived rather than lived. The cord to the thing you made was already cut, and by ownership rather than by speed.',
      xp: 5,
    },
  },
  {
    g: 41, cords: 4, cut: 4,
    dur: 1.0,
    interact: {
      prompt: 'Slide the seam to what alienation is actually about.',
      split: {
        left: 'OWNERSHIP AND CONTROL', right: 'THE SIZE OF THE WAGE',
        start: 0.04,
        zones: [
          { id: 'pay', upto: 0.3, reads: 'just a pay problem' },
          { id: 'both', upto: 0.66, reads: 'half the wage, half the ownership' },
          { id: 'own', upto: 1, reads: 'a problem of ownership', correct: true },
        ],
      },
      explain: 'Almost all of it on ownership. Calling it low pay collapses four severings into the one that is easiest to picture. Look at what a raise would reconnect: a better-paid worker still does not own the car, still cannot stop the line, and still competes with the man beside him.',
      xp: 5,
    },
  },
  {
    summary: {
      title: 'Four Cords, All Cut',
      points: [
        'Alienation severs you from the product of your work',
        'And from the act of working, which somebody else paces',
        'And from what you could make, and from the people beside you',
        'Its cause is ownership and control, not the size of the wage',
      ],
      closing: 'You clock in, and somehow clock out of yourself.',
    },
    dur: 3.0,
  },
];
