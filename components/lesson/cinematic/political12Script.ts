import type { BaseBeat } from './cinematicKit';

// Cinematic political-political-12, "Two Kinds Of Freedom".
//
// THE PICTURE: one doorway with two lamps under it. Negative liberty lights the
// first lamp — nobody is blocking the door. Positive liberty asks the second — are
// you actually the one steering. Over the lesson the door opens all the way, the
// first lamp comes on, and the second stays dark. Berlin's warning is the last
// beat, where a regime lights the SECOND lamp by closing the door.
//
// Q1 is A/B/C/D; Q2 is answered under the doorway (E34, H65).

export interface Pol12Beat extends BaseBeat {
  /** Figure gesture (emote code). */ p?: number;
  /** Where the figure stands (stage x). */ x?: number;
  /** The doorway is drawn, 0..1. */ door?: number;
  /** 0 = barred · 1 = standing open. */ open?: number;
  /** The NO ONE BLOCKING lamp, 0..1. */ neg?: number;
  /** The MASTER OF MYSELF lamp, 0..1. */ posi?: number;
  /** 1 = the three answer cards are live (Q2). */ pick?: number;
}

export const BEATS: Pol12Beat[] = [
  {
    p: 164, x: 70,
    text: 'Rousseau wrote that a people can be forced to be free. The phrase sounds like nonsense.',
    dur: 2.5,
  },
  {
    p: 164, x: 70,
    text: 'Isaiah Berlin spent an essay explaining why the phrase makes sense, and why that is worse.',
    dur: 2.5,
  },
  {
    p: 412, x: 168, door: 1, open: 0,
    text: 'Freedom question one: how many doors are open to you, with nobody standing in them? That is negative liberty, and it is entirely about what other people are doing.',
    cite: 'Negative liberty',
    dur: 5.0,
  },
  {
    p: 13, x: 124, door: 1, open: 1, neg: 1,
    text: 'Open the door and the first lamp lights. Nothing is blocking you.',
    cite: 'Nobody blocking',
    dur: 2.2,
  },
  {
    p: 13, x: 124, door: 1, open: 1, neg: 1,
    text: 'Notice that this says nothing whatever about whether you can actually walk through it.',
    dur: 2.6,
  },
  {
    p: 147, x: 124, door: 1, open: 1, neg: 1,
    quote: {
      id: 'lq-political-political-12-1',
      text: 'The positive sense of the word liberty derives from the wish on the part of the individual to be his own master.',
      author: 'Isaiah Berlin',
      philosopherId: 'isaiah-berlin',
      work: 'Two Concepts of Liberty',
      era: '1958',
      branchSlugs: ['political-philosophy'],
    },
    dur: 4.0,
  },
  {
    p: 29, x: 168, door: 1, open: 1, neg: 1, posi: 1,
    text: 'Here is Berlin\'s worry. A regime announces that your real self wants the regime\'s plan.',
    cite: 'The second lamp',
    dur: 2.4,
  },
  {
    p: 29, x: 168, door: 1, open: 1, neg: 1, posi: 1,
    text: 'The regime lights the second lamp on your behalf, shuts the door, and calls the result freedom.',
    dur: 2.8,
  },
  {
    p: 4, x: 124, door: 1, open: 1, neg: 1, posi: 1,
    interact: {
      prompt: 'Set the lever to the freedom the regime is claiming.',
      lever: {
        start: 0,
        stops: [
          { id: 'neg', reads: 'negative liberty: nobody standing in your way' },
          { id: 'none', reads: 'no freedom at all, just force' },
          { id: 'pos', reads: 'positive liberty: being your own master', correct: true },
        ],
      },
      explain: 'The far setting, and the comfortable answer is the middle. Berlin point is sharper and nastier than that: the claim is coherent. Once somebody else gets to define your real self, they can shrink your choices in the name of freedom and mean it.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 6, x: 124, door: 1, open: 1, neg: 1, posi: 1, pick: 1,
    interact: {
      prompt: 'The door is wide open and you still cannot choose. Tap the lamp that is lying.',
      explain: 'The second lamp. Negative liberty is honestly met: nobody stands in the doorway. But nobody else can switch on your self-mastery for you. That is the whole force of Berlin\'s warning.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'What You Now Know',
      points: [
        'Negative liberty: the absence of obstacles from others',
        'Positive liberty: being your own master',
        'Berlin warned the two can openly conflict',
        '"Forcing people to be free" can mask coercion',
      ],
      closing: 'An open door and a life you do not steer are two different things. Only one of them is measured at the door.',
    },
    dur: 3.0,
  },
];
