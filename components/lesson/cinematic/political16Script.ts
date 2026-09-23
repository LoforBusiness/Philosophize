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
  /** 1 = the four are counted off, one numeral at a time, as the sentence lists them. */ counted?: number;
  /** 1 = the severed ends are left open: nothing joins the worker to those two. */ adrift?: number;
  /** 1 = what it actually turns on, said at the trunk: who owns, who controls. */ owns?: number;
}

export const BEATS: Pol16Beat[] = [
  {
    g: 462, cords: 4,
    dur: 2.3,
    text: 'Suppose you fit the same bolt all day on an assembly line. Karl Marx argues that work connects a person to four things.',
  },
  {
    g: 462, cords: 4,
    dur: 2.5,
    counted: 1,
    text: 'These are the product, the activity of working, your human potential and your fellow workers.',
  },
  {
    g: 465, cords: 4, cut: 2,
    dur: 4.2,
    text: 'The car you help build belongs to the company, and you couldn’t afford one. The line sets the pace and you cannot stop it.',
    cite: 'Alienation from product and process',
  },
  {
    g: 465, cords: 4, cut: 2,
    dur: 1.8,
    adrift: 1,
    text: 'So the worker is separated from both the product and the activity of working.',
  },
  {
    g: 168, cords: 4, cut: 4,
    dur: 5.0,
    text: 'Two more kinds of split follow. Doing the same task again and again leaves no room to create, and coworkers become rivals for the same jobs.',
    cite: 'Potential and other people',
  },
  {
    g: 139, cords: 4, cut: 4,
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
    g: 418, cords: 4, cut: 4,
    dur: 4.8,
    owns: 1,
    text: 'Marx argues that none of this depends on the wage. It follows from who owns the means of production and who controls the work.',
    cite: 'The source of alienation',
  },
  {
    g: 4, cords: 4, cut: 4, pick: 1,
    dur: 1.0,
    interact: {
      prompt: 'If the assembly line sets your pace, which connection does that sever?',
      explain: 'The work itself. When someone else sets the pace, the activity of working stops being your own. The product is also lost to you, but through ownership, not the speed of the line.',
      xp: 5,
    },
  },
  {
    g: 383, cords: 4, cut: 4,
    dur: 1.0,
    interact: {
      prompt: 'Which of these would a bigger wage not fix?',
      odd: {
        axis: 'MORE PAY FIXES THREE',
        tiles: [
          { id: 'rent', reads: 'THE RENT' },
          { id: 'food', reads: 'THE FOOD' },
          { id: 'hours', reads: 'THE HOURS' },
          { id: 'own', reads: 'WHO DECIDES THE WORK', correct: true },
        ],
      },
      explain: 'Who decides the work. For Marx the loss is in the worker\'s tie to what they make, and in who settles how it\'s made. A raise leaves both where they were. That\'s why better pay doesn\'t answer the complaint.',
      xp: 5,
    },
  },
  {
    summary: {
      title: 'Marx’s Four Kinds of Alienation',
      points: [
        'Alienation severs you from the product of your work',
        'And from the act of working, which somebody else paces',
        'And from your human potential, and from other workers',
        'Its cause is ownership and control, not the size of the wage',
      ],
      closing: 'For Marx, the remedy lies in changing who owns and controls production, not in raising wages.',
    },
    dur: 3.0,
  },
];
